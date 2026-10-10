// Vercel serverless function: Sensei reads the kid's "explain it back" answer
// and gives gentle, encouraging feedback. The tutor key lives ONLY server-side
// (see _tutor.js) — never in the browser. Degrades gracefully if unset.
import { ask as askTutor, tutorConfigured } from "./_tutor.js";

const SYSTEM = `You are Sensei Hoshi, a kind and wise owl mentor in a children's trading-education game called Candle Quest Academy. A 10-year-old child has just explained a trading concept in their own words. Give warm, encouraging feedback.

Rules:
- Write 2-4 short sentences a 10-year-old can easily read.
- FIRST sentence: name the specific thing they got right, and quote a few of THEIR OWN words back so it is obvious you actually read their answer. Never generic praise.
- SECOND: add the ONE most important idea they left out or muddled, in very simple words. Only one — a list of misses reads like a bad mark.
- If they got everything, say so plainly and tell them they could teach it.
- Be kind and supportive — never harsh, never sarcastic.
- No jargon. Never mention real money, real trading, or encourage real-world trading; this is a pretend-coin game.
- Keep it under 60 words. Speak directly to the child ("you"). End on an encouraging note.
- Plain text only — no markdown, no headings, no emoji spam (one friendly emoji at most).`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!tutorConfigured()) {
    // Feature not configured — the game still saves the reflection, just no AI note.
    return res.status(200).json({ feedback: null, reason: "not-configured" });
  }

  const body = req.body || {};
  const concept = String(body.concept || "").slice(0, 200);
  const prompt = String(body.prompt || "").slice(0, 400);
  const answer = String(body.answer || "").slice(0, 800).trim();
  if (!answer) return res.status(200).json({ feedback: null, reason: "empty" });

  const out = await askTutor(SYSTEM,
    `Lesson topic: ${concept}\n` +
    `The question the child answered: ${prompt}\n` +
    `The child's answer (their own words): "${answer}"\n\n` +
    `Give Sensei Hoshi's spoken feedback now.`);
  return res.status(200).json(out.text ? { feedback: out.text } : { feedback: null, reason: out.reason });
}
