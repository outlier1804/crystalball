// Vercel serverless function: text Dad when his son is genuinely stuck.
//
// Why this exists: the parent Report already shows every missed question — but
// only if you go and look, days later. The moment help is actually useful is the
// moment he's stuck at the table, not Sunday evening. This fires a Telegram
// message the third time he misses the SAME concept, so you can walk over.
//
// Deliberately quiet:
//   - only fires at a real stuck threshold, not on any wrong answer
//   - the client rate-limits itself to one ping per concept per 6 hours
//   - no key configured → silently does nothing, game unaffected
//
// Needs TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID as Vercel env vars (same bot as
// the Jarvis bridge). Without them this endpoint is a no-op by design.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return res.status(200).json({ sent: false, reason: "not-configured" });

  const b = req.body || {};
  const who = String(b.name || "").slice(0, 40).trim() || "He";
  const topic = String(b.topic || "").slice(0, 120).trim();
  const question = String(b.question || "").slice(0, 300).trim();
  const misses = Number(b.misses) || 3;
  const helpUsed = Number(b.helpUsed) || 0;
  if (!question) return res.status(200).json({ sent: false, reason: "empty" });

  const lines = [
    `🕯️ *Candle Quest — stuck point*`,
    ``,
    `${who} has now missed this ${misses}× :`,
    `_${escapeMd(question)}_`,
  ];
  if (topic) lines.push(``, `Topic: ${escapeMd(topic)}`);
  lines.push(
    ``,
    helpUsed > 0
      ? `He asked Sensei for help ${helpUsed}× and it still isn't landing — this one probably needs you.`
      : `He hasn't pressed the help button — he may not know it's there.`
  );

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "Markdown",
        disable_notification: false,
      }),
    });
    if (!r.ok) return res.status(200).json({ sent: false, reason: `telegram-${r.status}` });
    return res.status(200).json({ sent: true });
  } catch {
    return res.status(200).json({ sent: false, reason: "error" });
  }
}

// Telegram Markdown chokes on stray _ * [ ` in question text
function escapeMd(s) {
  return String(s).replace(/([_*[\]`])/g, "\\$1");
}
