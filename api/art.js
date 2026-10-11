// Vercel serverless function: generate game art with Gemini's image model.
//
// A build tool, not part of the game: it is called by hand while making art, and
// the results are saved into public/art/. Locked behind a token whose SHA-256 is
// below (the token itself is not in the repo), because every call costs money.
import { createHash } from "node:crypto";

export const config = { maxDuration: 60 };

const TOKEN_SHA256 = "961e42727119509caacdb17fd366926456bafd5662b855f5d3abc652c9a785db";
const BASE = "https://generativelanguage.googleapis.com/v1beta";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const b = req.body || {};
  if (createHash("sha256").update(String(b.token || "")).digest("hex") !== TOKEN_SHA256) return res.status(404).json({ error: "Not found" });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(200).json({ ok: false, reason: "not-configured" });

  try {
    if (b.list) {
      const r = await fetch(`${BASE}/models?pageSize=300`, { headers: { "x-goog-api-key": key } });
      const d = await r.json();
      return res.status(200).json({ ok: r.ok, models: (d.models || []).filter((m) => /image|imagen/i.test(m.name)).map((m) => ({ name: m.name, methods: m.supportedGenerationMethods })) });
    }
    const parts = [];
    for (const ref of b.refs || []) parts.push({ inlineData: { mimeType: ref.mime || "image/png", data: ref.data } });
    parts.push({ text: String(b.prompt || "").slice(0, 4000) });
    const r = await fetch(`${BASE}/models/${b.model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseModalities: ["TEXT", "IMAGE"] } }),
      signal: AbortSignal.timeout(55000),
    });
    const d = await r.json();
    if (!r.ok) return res.status(200).json({ ok: false, reason: `http-${r.status}`, detail: d.error?.message?.slice(0, 300) });
    const img = d.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    if (!img) return res.status(200).json({ ok: false, reason: "no-image", detail: JSON.stringify(d).slice(0, 300) });
    res.setHeader("Content-Type", img.inlineData.mimeType || "image/png");
    return res.status(200).send(Buffer.from(img.inlineData.data, "base64"));
  } catch (e) {
    return res.status(200).json({ ok: false, reason: "error", detail: String(e).slice(0, 200) });
  }
}
