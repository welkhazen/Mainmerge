import { promises as fs } from "fs";
import path from "path";

export interface AssistantFeedbackEntry {
  id: string;
  question: string;
  answer: string;
  helpful: boolean;
  correction?: string;
  createdAt: number;
}

const dataDir = path.resolve(process.cwd(), "server", "data");
const memoryFile = path.join(dataDir, "assistant-feedback.json");

async function ensureStoreFile(): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(memoryFile);
  } catch {
    await fs.writeFile(memoryFile, "[]", "utf8");
  }
}

export async function readFeedbackEntries(): Promise<AssistantFeedbackEntry[]> {
  await ensureStoreFile();
  try {
    const raw = await fs.readFile(memoryFile, "utf8");
    const parsed = JSON.parse(raw) as AssistantFeedbackEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendFeedbackEntry(entry: AssistantFeedbackEntry): Promise<void> {
  const existing = await readFeedbackEntries();
  existing.push(entry);
  await fs.writeFile(memoryFile, JSON.stringify(existing.slice(-500), null, 2), "utf8");
}

export async function findRelevantFeedback(question: string, limit = 6): Promise<AssistantFeedbackEntry[]> {
  const entries = await readFeedbackEntries();
  if (entries.length === 0) {
    return [];
  }

  const tokens = question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);

  if (tokens.length === 0) {
    return entries.slice(-limit);
  }

  const scored = entries
    .map((entry) => {
      const haystack = `${entry.question} ${entry.answer} ${entry.correction ?? ""}`.toLowerCase();
      const score = tokens.reduce((sum, token) => (haystack.includes(token) ? sum + 1 : sum), 0);
      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.entry.createdAt - a.entry.createdAt)
    .slice(0, limit)
    .map((item) => item.entry);

  return scored;
}
