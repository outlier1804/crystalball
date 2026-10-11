// A small guard for the endpoints that cost money (tutor, feedback, voice).
//
// They are open URLs, and since billing was switched on every call is paid for.
// This is not security — a determined person can fake a header — but it stops
// the two cheap ways to run up a bill: another site calling these endpoints,
// and a runaway loop. Callers already treat a refusal as "fall back locally".
const WINDOW_MS = 10 * 60 * 1000;
const hits = new Map();          // name -> timestamps, per warm instance

export function allow(req, name, max = 60) {
  const host = String(req.headers.host || "");
  const from = String(req.headers.origin || req.headers.referer || "");
  let sameSite = false;
  try { sameSite = !!from && new URL(from).host === host; } catch { /* not a URL */ }
  if (!sameSite) return { ok: false, reason: "origin" };

  const now = Date.now();
  const list = (hits.get(name) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= max) { hits.set(name, list); return { ok: false, reason: "busy" }; }
  list.push(now); hits.set(name, list);
  return { ok: true };
}
