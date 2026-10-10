// The tutor's model call, shared by help.js and feedback.js.
//
// Runs on Google's Gemini API free tier (the owner's choice: no card, no cost).
// The key lives ONLY here, server-side, in the GEMINI_API_KEY env var on Vercel —
// never in the browser. Files starting with "_" are not routes on Vercel.
//
// Model: gemini-3.5-flash-lite by default (Google's recommended small model, which
// thinks at the "minimal" level). Thinking tokens count against maxOutputTokens,
// so the cap below is deliberately roomy for a ~90-word answer — a tight cap can
// come back empty. Override with GEMINI_MODEL without touching code.
//
// Everything that can go wrong returns { text: null, reason }. Callers fall back
// to the offline explanations, so help is never a dead end.
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export const tutorConfigured = () => !!process.env.GEMINI_API_KEY;

export async function ask(system, user, maxOutputTokens = 800) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { text: null, reason: "not-configured" };
  try {
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { maxOutputTokens, temperature: 0.6 },
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!r.ok) return { text: null, reason: r.status === 429 ? "rate-limited" : `http-${r.status}` };
    const d = await r.json();
    if (d.promptFeedback?.blockReason) return { text: null, reason: "blocked" };
    const c = d.candidates?.[0];
    const text = (c?.content?.parts || []).filter((p) => p.text && !p.thought).map((p) => p.text).join(" ").trim();
    if (!text) return { text: null, reason: c?.finishReason === "SAFETY" ? "blocked" : "empty" };
    return { text };
  } catch {
    return { text: null, reason: "error" };
  }
}
