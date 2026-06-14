// Vercel serverless function: Sensei reads the kid's "explain it back" answer
// and gives gentle, encouraging feedback. The Anthropic API key lives ONLY here
// (server-side env var) — never in the browser. Degrades gracefully if unset.
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM = `You are Sensei Hoshi, a kind and wise owl mentor in a children's trading-education game called Candle Quest Academy. A 10-year-old child has just explained a trading concept in their own words. Give warm, encouraging feedback.

Rules:
- Write 2-3 short sentences a 10-year-old can easily read.
- First, praise something specific they got right.
- If they missed or muddled the key idea, gently add or fix it in very simple words.
- Be kind and supportive — never harsh, never sarcastic.
- No jargon. Never mention real money, real trading, or encourage real-world trading; this is a pretend-coin game.
- Keep it under 60 words. Speak directly to the child ("you"). End on an encouraging note.
- Plain text only — no markdown, no headings, no emoji spam (one friendly emoji at most).`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    // Feature not configured — the game still saves the reflection, just no AI note.
    return res.status(200).json({ feedback: null, reason: "not-configured" });
  }

  const body = req.body || {};
  const concept = String(body.concept || "").slice(0, 200);
  const prompt = String(body.prompt || "").slice(0, 400);
  const answer = String(body.answer || "").slice(0, 800).trim();
  if (!answer) return res.status(200).json({ feedback: null, reason: "empty" });

  try {
    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 220,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content:
            `Lesson topic: ${concept}\n` +
            `The question the child answered: ${prompt}\n` +
            `The child's answer (their own words): "${answer}"\n\n` +
            `Give Sensei Hoshi's spoken feedback now.`,
        },
      ],
    });

    if (msg.stop_reason === "refusal") {
      return res.status(200).json({ feedback: null, reason: "refusal" });
    }
    const text = (msg.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join(" ")
      .trim();
    return res.status(200).json({ feedback: text || null });
  } catch (err) {
    // Never break the game on an API hiccup — degrade to no feedback.
    return res.status(200).json({ feedback: null, reason: "error" });
  }
}
