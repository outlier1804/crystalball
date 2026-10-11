// Vercel serverless function: receive a client error report.
//
// Writes one structured line to the server log (Vercel dashboard → Logs, search
// "cq-client-error") and, when TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID are set,
// sends a short message — at most one every two minutes per warm instance, so a
// broken build cannot turn into a stream of texts.
let lastPing = 0;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const b = req.body || {};
  const clip = (v, n) => String(v ?? "").slice(0, n);
  const entry = {
    tag: "cq-client-error", kind: clip(b.kind, 20), msg: clip(b.msg, 300), stack: clip(b.stack, 500),
    screen: clip(b.screen, 30), mode: clip(b.mode, 10), where: clip(b.where, 200), ua: clip(b.ua, 160), at: new Date().toISOString(),
  };
  if (!entry.msg) return res.status(200).json({ ok: false, reason: "empty" });
  console.error(JSON.stringify(entry));

  const token = process.env.TELEGRAM_BOT_TOKEN, chatId = process.env.TELEGRAM_CHAT_ID;
  if (token && chatId && Date.now() - lastPing > 120000) {
    lastPing = Date.now();
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: `🕯️ Candle Quest error on the ${entry.screen || "?"} screen (${entry.kind}):\n${entry.msg}` }),
        signal: AbortSignal.timeout(6000),
      });
    } catch { /* the log line above is the record */ }
  }
  return res.status(200).json({ ok: true });
}
