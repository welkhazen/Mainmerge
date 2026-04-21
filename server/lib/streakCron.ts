export async function runStreakResetAtUtc(): Promise<{ resetCount: number }> {
  return { resetCount: 0 };
}

export async function sendStreakAtRiskEmailsUtc(): Promise<{ sent: number }> {
  return { sent: 0 };
}
