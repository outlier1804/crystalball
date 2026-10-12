// Vercel serverless function: progress a parent can open on their own phone.
//
// The game keeps everything in the browser of the device it is played on. When a
// parent switches on "see progress on your phone", that device makes a long
// random family key and sends its profiles here after each session; the
// parent's phone, holding the same key, reads them back. There are no
// passwords and no accounts: the key IS the account, and it only ever travels
// in the link the parent sends themselves.
//
// What is stored is encrypted with the key, under a name made from a hash of
// the key, so neither the file's address nor its contents mean anything to
// someone who does not hold the link.
//
//   POST   { key, device, data }   save this device's profiles
//   GET    ?key=…                  every device saved under the key
//   DELETE { key }                 remove everything saved under the key
import { put, list, del } from "@vercel/blob";
import { createHash, createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { allow } from "./_guard.js";

const MAX_BYTES = 1_500_000;
const okKey = (k) => typeof k === "string" && /^[A-Z2-9]{20,40}$/.test(k);
const okDevice = (d) => typeof d === "string" && /^[a-z0-9]{6,20}$/.test(d);
const sha = (s) => createHash("sha256").update(s).digest();
const folder = (key) => `fam/${sha("cq-path:" + key).toString("hex")}/`;

function seal(key, text) {
  const iv = randomBytes(12), c = createCipheriv("aes-256-gcm", sha("cq-enc:" + key), iv);
  const body = Buffer.concat([c.update(text, "utf8"), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), body]);
}
function open(key, buf) {
  const d = createDecipheriv("aes-256-gcm", sha("cq-enc:" + key), buf.subarray(0, 12));
  d.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString("utf8");
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(200).json({ ok: false, reason: "not-configured" });
  const gate = allow(req, "sync", 600);
  if (!gate.ok) return res.status(200).json({ ok: false, reason: gate.reason });

  try {
    if (req.method === "GET") {
      const key = String(req.query?.key || "");
      if (!okKey(key)) return res.status(200).json({ ok: false, reason: "key" });
      const { blobs } = await list({ prefix: folder(key), limit: 20 });
      const devices = [];
      for (const b of blobs) {
        try {
          const r = await fetch(`${b.url}?t=${Date.now()}`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
          if (!r.ok) continue;
          devices.push({ device: b.pathname.split("/").pop().replace(/\.bin$/, ""), savedAt: new Date(b.uploadedAt).getTime(), data: JSON.parse(open(key, Buffer.from(await r.arrayBuffer()))) });
        } catch { /* a file that cannot be read is skipped */ }
      }
      return res.status(200).json({ ok: true, devices });
    }

    if (req.method === "POST") {
      const { key, device, data } = req.body || {};
      if (!okKey(key) || !okDevice(device) || !data || typeof data !== "object") return res.status(200).json({ ok: false, reason: "bad-request" });
      const text = JSON.stringify(data);
      if (text.length > MAX_BYTES) return res.status(200).json({ ok: false, reason: "too-big" });
      await put(`${folder(key)}${device}.bin`, seal(key, text), {
        access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/octet-stream", cacheControlMaxAge: 60,
      });
      return res.status(200).json({ ok: true, at: Date.now() });
    }

    if (req.method === "DELETE") {
      const key = String(req.body?.key || "");
      if (!okKey(key)) return res.status(200).json({ ok: false, reason: "key" });
      const { blobs } = await list({ prefix: folder(key), limit: 50 });
      if (blobs.length) await del(blobs.map((b) => b.url));
      return res.status(200).json({ ok: true, removed: blobs.length });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ ok: false });
  } catch (e) {
    console.error(JSON.stringify({ tag: "cq-sync-error", message: String(e?.message || e).slice(0, 300) }));
    return res.status(200).json({ ok: false, reason: "error" });
  }
}
