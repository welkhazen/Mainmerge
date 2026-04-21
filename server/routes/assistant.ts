import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { env } from "../config/env";
import { appendFeedbackEntry, findRelevantFeedback } from "../lib/assistantStore";

const chatSchema = z.object({
  question: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      })
    )
    .max(12)
    .optional(),
});

const feedbackSchema = z.object({
  question: z.string().min(3).max(2000),
  answer: z.string().min(1).max(8000),
  helpful: z.boolean(),
  correction: z.string().max(4000).optional(),
});

const WEBSITE_CONTEXT = `
You are the official AI assistant for raW (the raw). You only answer questions about this website/product.
Core product areas: anonymous polls, onboarding journey, communities, avatar identity/ranks, dashboard insights, marketplace, authentication, FAQ, and Security & Privacy pages.
Policies and safety references include encryption, moderation, data residency, GDPR principles, and no-sale policy.
When uncertain, ask a short clarifying question instead of inventing details.
Keep answers practical, concise, and product-focused.
`;

async function callOpenAI(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      temperature: 0.2,
      messages,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content?.trim() ?? "I could not generate a response right now.";
}

export const assistantRouter = Router();

assistantRouter.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

assistantRouter.get("/status", (_req, res) => {
  const enabled = env.AI_ASSISTANT_ENABLED !== "false";
  const configured = Boolean(env.OPENAI_API_KEY);
  return res.status(200).json({ enabled, configured, model: env.OPENAI_MODEL });
});

assistantRouter.post("/chat", async (req, res) => {
  const enabled = env.AI_ASSISTANT_ENABLED !== "false";
  if (!enabled) {
    return res.status(503).json({ error: "AI assistant is disabled." });
  }

  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid chat payload." });
  }

  if (!env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "AI assistant is not configured yet." });
  }

  try {
    const relevant = await findRelevantFeedback(parsed.data.question, 6);
    const learnedContext = relevant.length
      ? `\nPast user feedback to learn from:\n${relevant
          .map((entry, index) => `${index + 1}. Q: ${entry.question}\nA: ${entry.answer}\nHelpful: ${entry.helpful}\nCorrection: ${entry.correction ?? "none"}`)
          .join("\n\n")}`
      : "";

    const historyMessages = (parsed.data.history ?? []).map((item) => ({
      role: item.role,
      content: item.content,
    }));

    const answer = await callOpenAI([
      { role: "system", content: WEBSITE_CONTEXT + learnedContext },
      ...historyMessages,
      { role: "user", content: parsed.data.question },
    ]);

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("assistant.chat.error", error);
    const message = error instanceof Error ? error.message : "Assistant failed to answer right now.";

    if (message.includes("insufficient_quota") || message.includes("429")) {
      return res.status(503).json({
        error: "OpenAI quota exceeded. Please add billing/credits, then retry.",
      });
    }

    if (message.toLowerCase().includes("invalid_api_key") || message.includes("401")) {
      return res.status(503).json({
        error: "OpenAI API key is invalid or expired. Update OPENAI_API_KEY and restart server.",
      });
    }

    return res.status(500).json({ error: "Assistant failed to answer right now." });
  }
});

assistantRouter.post("/feedback", async (req, res) => {
  const parsed = feedbackSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid feedback payload." });
  }

  await appendFeedbackEntry({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    question: parsed.data.question,
    answer: parsed.data.answer,
    helpful: parsed.data.helpful,
    correction: parsed.data.correction,
    createdAt: Date.now(),
  });

  return res.status(200).json({ ok: true });
});
