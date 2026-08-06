// ====== Read-aloud: the characters speak their own lines ======
//
// Two tiers, in order:
//   1. Pre-rendered neural VO. Every lesson line is synthesized ahead of time by
//      `tools/vogen/gen.py` (Kokoro-82M, local, $0, Apache-2.0 = commercial-safe)
//      into `public/vo/*.mp3`, with a DIFFERENT voice per character. Shipped with
//      the game, so it still works with no internet and no API key.
//   2. The browser's built-in speechSynthesis, for anything the generator hasn't
//      rendered yet (edited copy, new lines) or browsers that block audio.
//
// The manifest is a bundled JS module, not a fetched JSON file, so read-aloud
// works when the game is opened straight off disk (file:// blocks fetch).

import { VO } from "./vo-manifest.js";

// The cast. `voice` + `speed` drive the Kokoro render; `fallback` is the
// pitch/rate shim used when we're stuck with the robot voice.
// tools/vogen/lines.mjs imports this table — it is the single source of truth,
// so changing a voice here and re-running the generator stays in sync.
export const CAST = {
  "Sensei Hoshi":  { voice: "bm_george", speed: 0.92, fallback: { pitch: 0.8,  rate: 0.9  } },
  "Kitsu the Fox": { voice: "af_bella",  speed: 1.06, fallback: { pitch: 1.5,  rate: 1.05 } },
  "Rival Kazuo":   { voice: "am_puck",   speed: 1.0,  fallback: { pitch: 0.75, rate: 0.95 } },
};
export const NARRATOR = { voice: "af_heart", speed: 1.0, fallback: {} };

export function castFor(who) {
  return CAST[who] || NARRATOR;
}

// Strip the dialogue's HTML tags/entities/emoji down to speakable text.
// The generator calls this exact function to build its manifest keys, so any
// change here must be followed by a `tools/vogen/gen.py` re-run.
export function voClean(html) {
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, " and ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{FE0F}\u{20E3}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function voKey(who, text) {
  return (who || "") + "|" + text;
}

// public/vo/ sits next to index.html in every build (vite `base: "./"`), so a
// plain relative URL resolves on Vercel, on the dev server and from file://.
function voUrl(file) {
  return "vo/" + file;
}

export const Speak = {
  // guarded so the VO generator can import CAST/voClean from node
  on: typeof window !== "undefined" && localStorage.getItem("cq-read") === "1",
  voice: null,
  audio: null,

  supported() {
    return typeof window !== "undefined" &&
      (typeof Audio !== "undefined" || "speechSynthesis" in window);
  },

  // ---- tier 1: pre-rendered ------------------------------------------------

  fileFor(who, html) {
    return VO[voKey(who, voClean(html))] || null;
  },

  // Warm the browser cache for a line we're about to need (the next page).
  preload(who, html) {
    const file = this.fileFor(who, html);
    if (!file || typeof Audio === "undefined") return;
    const a = new Audio(voUrl(file));
    a.preload = "auto";
    try { a.load(); } catch { /* nothing to do */ }
  },

  playFile(file) {
    this.stopAudio();
    const a = new Audio(voUrl(file));
    a.preload = "auto";
    this.audio = a;
    const p = a.play();
    // Autoplay can be refused before the first tap. Silence is the right
    // outcome there — the read-aloud button re-triggers it as a real gesture.
    if (p && typeof p.catch === "function") p.catch(() => {});
    return true;
  },

  stopAudio() {
    if (this.audio) {
      try { this.audio.pause(); this.audio.currentTime = 0; } catch { /* ignore */ }
      this.audio = null;
    }
  },

  // ---- tier 2: the browser's own voice ------------------------------------

  ttsSupported() { return typeof window !== "undefined" && "speechSynthesis" in window; },

  pickVoice() {
    if (!this.ttsSupported()) return;
    const vs = speechSynthesis.getVoices() || [];
    this.voice =
      vs.find(v => /en[-_]US/i.test(v.lang) && /(Samantha|Jenny|Aria|Google US English)/i.test(v.name)) ||
      vs.find(v => /^en/i.test(v.lang)) ||
      vs[0] || null;
  },

  sayFallback(text, opts) {
    if (!this.ttsSupported()) return;
    speechSynthesis.cancel();
    if (!this.voice) this.pickVoice();
    const u = new SpeechSynthesisUtterance(text);
    if (this.voice) u.voice = this.voice;
    u.rate = opts.rate != null ? opts.rate : 0.95;
    u.pitch = opts.pitch != null ? opts.pitch : 1.05;
    u.volume = 1;
    try { speechSynthesis.speak(u); } catch { /* ignore */ }
  },

  // ---- what callers use ----------------------------------------------------

  // say(html, { who }) — `who` is the character's display name, e.g. "Kitsu the Fox".
  say(html, opts = {}) {
    if (!this.supported()) return;
    const text = voClean(html);
    if (!text) return;
    this.stop();
    const file = VO[voKey(opts.who, text)];
    if (file && typeof Audio !== "undefined") { this.playFile(file); return; }
    this.sayFallback(text, { ...castFor(opts.who).fallback, ...opts });
  },

  stop() {
    this.stopAudio();
    if (this.ttsSupported()) speechSynthesis.cancel();
  },

  toggle() {
    this.on = !this.on;
    localStorage.setItem("cq-read", this.on ? "1" : "0");
    if (!this.on) this.stop();
    return this.on;
  },
};

// Voices load asynchronously in most browsers
if (typeof window !== "undefined" && Speak.ttsSupported()) {
  Speak.pickVoice();
  speechSynthesis.onvoiceschanged = () => Speak.pickVoice();
}
