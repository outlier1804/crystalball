// Vercel serverless function: "I don't get it" — Sensei re-explains the exact
// thing the kid is stuck on, at the escalation tier he asked for.
//
// This is the ONLINE half of the help system. The offline authored bank in
// src/engine/help.js always works; this adds the part a fixed bank can't do —
// reacting to the specific wrong answer he just picked. If the key is unset or
// anything at all goes wrong we return `help: null` and the client silently
// falls back to the local bank, so help is never a dead end.
import Anthropic from "@anthropic-ai/sdk";

const TIER_BRIEF = {
  simpler:
    "Re-explain the SAME idea in smaller, simpler words. No jargon at all. " +
    "If you must use a trading word, define it in the same breath.",
  analogy:
    "Explain the idea through an analogy from a 10-year-old's everyday life — sports, video games, school, " +
    "pets, food, siblings. Map the analogy onto the trading idea explicitly so the link is obvious.",
  example:
    "Walk through ONE concrete worked example with real round numbers. Show the numbers step by step " +
    "and state what they mean. Keep the arithmetic easy enough to do in your head.",
};

const SYSTEM = `You are Sensei Hoshi, a kind and wise owl mentor in a children's trading-education game called Candle Quest Academy. A 10-year-old child has pressed the "I don't get it" button. Something you taught did not land, and that is your problem to fix, not theirs.

Rules:
- 2-4 short sentences. Under 80 words. A 10-year-old must be able to read it alone.
- NEVER just repeat the original wording. If they understood those words they would not have pressed the button.
- Never make the child feel slow. No "as I said", no "simply", no "just". Asking for help is the correct move and you are glad they did.
- If you are told which wrong answer they picked, address that specific misunderstanding directly — that is the most useful thing you can do.
- This is a pretend-Koins game. Never reference real money, never encourage real-world trading.
- Plain text only. No markdown, no headings, at most one emoji.
- End with a short nudge back to the question, not a new question of your own.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(200).json({ help: null, reason: "not-configured" });

  const b = req.body || {};
  const topic = String(b.topic || "").slice(0, 200);
  const question = String(b.question || "").slice(0, 500);
  const correctAnswer = String(b.correctAnswer || "").slice(0, 300);
  const chosenAnswer = String(b.chosenAnswer || "").slice(0, 300);
  const lessonText = String(b.lessonText || "").slice(0, 1200);
  const tier = TIER_BRIEF[b.tier] ? b.tier : "simpler";
  const options = Array.isArray(b.options)
    ? b.options.slice(0, 6).map((o) => String(o).slice(0, 200))
    : [];

  if (!question && !lessonText) return res.status(200).json({ help: null, reason: "empty" });

  const parts = [`Topic: ${topic || "trading basics"}`];
  if (lessonText) parts.push(`What the child was just told:\n"${lessonText}"`);
  if (question) parts.push(`The question they are stuck on: ${question}`);
  if (options.length) parts.push(`The choices: ${options.join(" | ")}`);
  if (correctAnswer) parts.push(`The correct answer: ${correctAnswer}`);
  if (chosenAnswer) {
    parts.push(
      `The child answered "${chosenAnswer}" — which is wrong. Work out what they were probably thinking, and fix that specific belief.`
    );
  }
  parts.push(`\nHow to explain it this time: ${TIER_BRIEF[tier]}`);
  parts.push(`\nGive Sensei Hoshi's explanation now.`);

  try {
    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: SYSTEM,
      messages: [{ role: "user", content: parts.join("\n\n") }],
    });
    if (msg.stop_reason === "refusal") return res.status(200).json({ help: null, reason: "refusal" });
    const text = (msg.content || [])
      .filter((x) => x.type === "text")
      .map((x) => x.text)
      .join(" ")
      .trim();
    return res.status(200).json({ help: text || null });
  } catch {
    return res.status(200).json({ help: null, reason: "error" });
  }
}
