// Vercel serverless function: a natural voice for text written on the spot.
//
// Every fixed line in the game is recorded ahead of time (tools/vogen). The
// tutor's answers cannot be — they are written when he asks — so they used to
// fall to the browser's built-in voice, which is the "robot" in the game. This
// turns that text into speech with Gemini's TTS model, using the same
// GEMINI_API_KEY the tutor already has.
//
// Quiet by design: no key, a quota error or any failure returns a small JSON
// body, and the client falls back to the browser voice. Nothing breaks.
//
//   GEMINI_TTS_MODEL   optional; otherwise the first TTS model the key can see
//   GEMINI_TTS_VOICE   optional; default "Sulafat" (warm)

const BASE = "https://generativelanguage.googleapis.com/v1beta";
const MAX_CHARS = 700;
let modelCache = null;   // survives while the function instance is warm

async function ttsModel(key) {
  if (process.env.GEMINI_TTS_MODEL) return process.env.GEMINI_TTS_MODEL;
  if (modelCache) return modelCache;
  const r = await fetch(`${BASE}/models?pageSize=200`, { headers: { "x-goog-api-key": key }, signal: AbortSignal.timeout(8000) });
  if (!r.ok) return null;
  const names = ((await r.json()).models || []).map((m) => String(m.name || "").replace(/^models\//, "")).filter((n) => /tts/i.test(n));
  // the small "flash" model is plenty for two sentences, and it is the cheap one
  modelCache = names.filter((n) => /flash/i.test(n)).sort().pop() || names.sort().pop() || null;
  return modelCache;
}

// Gemini returns raw 16-bit mono PCM; a browser needs a WAV header to play it.
function wav(pcm, rate) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(200).json({ audio: false, reason: "not-configured" });

  const text = String(req.body?.text || "").replace(/\s+/g, " ").trim().slice(0, MAX_CHARS);
  if (!text) return res.status(200).json({ audio: false, reason: "empty" });

  try {
    const model = await ttsModel(key);
    if (!model) return res.status(200).json({ audio: false, reason: "no-tts-model" });
    const r = await fetch(`${BASE}/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Say this warmly and clearly, like a patient teacher: ${text}` }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: process.env.GEMINI_TTS_VOICE || "Sulafat" } } },
        },
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!r.ok) return res.status(200).json({ audio: false, reason: r.status === 429 ? "rate-limited" : `http-${r.status}`, model });
    const part = (await r.json()).candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    if (!part) return res.status(200).json({ audio: false, reason: "empty", model });
    const rate = Number((/rate=(\d+)/.exec(part.inlineData.mimeType || "") || [])[1]) || 24000;
    const out = wav(Buffer.from(part.inlineData.data, "base64"), rate);
    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Cache-Control", "private, max-age=3600");
    return res.status(200).send(out);
  } catch {
    return res.status(200).json({ audio: false, reason: "error" });
  }
}
