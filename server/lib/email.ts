import { env } from "../config/env";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type TemplateName = "magic_link" | "streak_at_risk" | "weekly_digest" | "community_invite";

async function sendWithResend(payload: EmailPayload): Promise<void> {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    throw new Error("Resend email provider is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  if (!response.ok) {
    const reason = await response.text();
    throw new Error(`Resend send failed (${response.status}): ${reason}`);
  }
}

async function sendWithPostmark(payload: EmailPayload): Promise<void> {
  if (!env.POSTMARK_SERVER_TOKEN || !env.EMAIL_FROM) {
    throw new Error("Postmark email provider is not configured.");
  }

  const response = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "X-Postmark-Server-Token": env.POSTMARK_SERVER_TOKEN,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      From: env.EMAIL_FROM,
      To: payload.to,
      Subject: payload.subject,
      HtmlBody: payload.html,
      TextBody: payload.text,
    }),
  });

  if (!response.ok) {
    const reason = await response.text();
    throw new Error(`Postmark send failed (${response.status}): ${reason}`);
  }
}

async function deliver(payload: EmailPayload): Promise<void> {
  if (env.EMAIL_PROVIDER === "none") {
    console.info("email.skipped", { to: payload.to, subject: payload.subject });
    return;
  }

  if (env.EMAIL_PROVIDER === "resend") {
    await sendWithResend(payload);
    return;
  }

  await sendWithPostmark(payload);
}

export async function sendTransactionalEmail(
  template: TemplateName,
  to: string,
  data: Record<string, string>
): Promise<void> {
  switch (template) {
    case "magic_link": {
      const link = data.link;
      await deliver({
        to,
        subject: "Your magic sign-in link",
        html: `<p>Use this secure sign-in link:</p><p><a href="${link}">${link}</a></p><p>This link expires in 10 minutes.</p>`,
        text: `Use this secure sign-in link: ${link} (expires in 10 minutes).`,
      });
      return;
    }
    case "streak_at_risk": {
      const username = data.username ?? "there";
      const streakDays = data.streakDays ?? "0";
      await deliver({
        to,
        subject: "Your streak is at risk",
        html: `<p>Hey ${username}, your ${streakDays}-day streak will reset if you miss today.</p><p>Answer one poll now to keep it alive.</p>`,
        text: `Hey ${username}, your ${streakDays}-day streak will reset if you miss today. Answer one poll now to keep it alive.`,
      });
      return;
    }
    case "weekly_digest": {
      await deliver({
        to,
        subject: "Your weekly raW digest",
        html: `<p>Here is your weekly digest:</p><ul><li>${data.summary ?? "No summary available"}</li></ul>`,
        text: `Weekly digest: ${data.summary ?? "No summary available"}`,
      });
      return;
    }
    case "community_invite": {
      const inviter = data.inviter ?? "A friend";
      const communityName = data.communityName ?? "raW Community";
      const inviteLink = data.inviteLink;
      await deliver({
        to,
        subject: `${inviter} invited you to ${communityName}`,
        html: `<p>${inviter} invited you to join <strong>${communityName}</strong>.</p><p><a href="${inviteLink}">Join community</a></p>`,
        text: `${inviter} invited you to ${communityName}. Join: ${inviteLink}`,
      });
      return;
    }
    default:
      return;
  }
}
