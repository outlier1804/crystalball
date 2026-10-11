// ====== Error log: what went wrong, where, and when ======
//
// The game had no record of its own failures: a crash was a blank screen and
// nobody could say what happened. Now every uncaught error is
//   1. kept on the device (the last 40, shown in the parent report), and
//   2. sent to /api/log, which writes it to the server log (Vercel → Logs) and,
//      if the Telegram keys are set, messages Dad.
// Deliberately small: no user content, no answers — just the error, the screen
// it happened on, and the build. A failure to log must never itself break the game.
const KEY = "cq-log";
const MAX = 40;
let sent = 0;                       // per page load, so a loop cannot flood the server
const seen = new Set();

function read() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } }

export const Log = {
  list: read,
  clear() { try { localStorage.removeItem(KEY); } catch { /* ignore */ } },

  error(kind, err, extra = {}) {
    try {
      const msg = String(err?.message || err || "unknown").slice(0, 300);
      const entry = {
        at: Date.now(), kind, msg,
        stack: String(err?.stack || "").split("\n").slice(0, 4).join(" | ").slice(0, 500),
        screen: typeof document !== "undefined" ? document.body.dataset.screen || "" : "",
        mode: typeof document !== "undefined" ? document.documentElement.dataset.mode || "" : "",
        ...extra,
      };
      localStorage.setItem(KEY, JSON.stringify([entry, ...read()].slice(0, MAX)));
      const sig = kind + ":" + msg;
      if (seen.has(sig) || sent >= 5 || typeof fetch === "undefined") return;
      seen.add(sig); sent += 1;
      fetch("/api/log", { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
        body: JSON.stringify({ ...entry, ua: navigator.userAgent.slice(0, 160), url: location.pathname }) }).catch(() => {});
    } catch { /* logging must never throw */ }
  },

  /** Hook the two places uncaught errors surface outside React. */
  install() {
    if (typeof window === "undefined") return;
    window.addEventListener("error", (e) => {
      // a failed image/audio/video load also fires "error"; those are handled where they happen
      if (e.error || e.message) this.error("error", e.error || e.message, { at2: `${String(e.filename || "").split("/").pop()}:${e.lineno || 0}` });
    });
    window.addEventListener("unhandledrejection", (e) => this.error("promise", e.reason));
  },
};
