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
// Sensei and Kazuo used Kokoro's male voices (bm_george, am_puck), which are its
// weakest and sounded robotic next to the narrator. They now share the
// narrator's voice — the best one Kokoro has — and Kitsu keeps the second best.
// The fallback no longer shifts pitch: bending the browser voice up or down is
// most of what made it sound like a robot.
export const CAST = {
  "Sensei Hoshi":  { voice: "af_heart", speed: 0.96, fallback: {} },
  "Kitsu the Fox": { voice: "af_bella", speed: 1.04, fallback: {} },
  "Rival Kazuo":   { voice: "af_heart", speed: 1.04, fallback: {} },
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
  live: new Map(),  // text -> object URL of a voice clip fetched this session
  seq: 0,          // bumps on every stop, so a queued part never plays late

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

  playFile(file, onEnd) {
    this.stopAudio();
    const a = new Audio(voUrl(file));
    a.preload = "auto";
    this.audio = a;
    if (onEnd) { a.onended = onEnd; a.onerror = onEnd; }
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

  // Only reached for text that cannot be recorded ahead of time (the tutor's
  // answers). Prefer the natural-sounding voices a browser may have before the
  // old default ones.
  pickVoice() {
    if (!this.ttsSupported()) return;
    const vs = (speechSynthesis.getVoices() || []).filter((v) => /^en/i.test(v.lang));
    const want = [/Natural/i, /Neural/i, /Google US English/i, /\((Enhanced|Premium)\)/i, /^(Ava|Zoe|Evan|Allison|Samantha|Jenny|Aria)\b/i];
    this.voice = null;
    for (const re of want) {
      this.voice = vs.find((v) => re.test(v.name) && /en[-_]US/i.test(v.lang)) || vs.find((v) => re.test(v.name));
      if (this.voice) break;
    }
    if (!this.voice) this.voice = vs.find((v) => /en[-_]US/i.test(v.lang)) || vs[0] || null;
  },

  sayFallback(text, opts) {
    if (!this.ttsSupported()) return;
    speechSynthesis.cancel();
    if (!this.voice) this.pickVoice();
    const u = new SpeechSynthesisUtterance(text);
    if (this.voice) u.voice = this.voice;
    u.rate = 0.95;     // callers used to pass pitch/rate tricks; a plain voice sounds more human
    u.pitch = 1;
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

  // sayParts(["Correct!", explanation]) — several lines back to back. Each part
  // is looked up on its own, so a sentence stitched together at runtime ("Not
  // quite. " + the explanation) still plays in the recorded voice instead of
  // dropping to the browser's robot voice because the joined text has no file.
  sayParts(parts, opts = {}) {
    if (!this.supported()) return;
    this.stop();
    const run = ++this.seq;
    const list = parts.map((p) => voClean(p || "")).filter(Boolean);
    const next = (i) => {
      if (run !== this.seq || i >= list.length) return;
      const file = VO[voKey(opts.who, list[i])];
      if (file && typeof Audio !== "undefined") { this.playFile(file, () => next(i + 1)); return; }
      // no recording for this part: the browser voice reads it and everything after it
      this.sayFallback(list.slice(i).join(" "), { ...castFor(opts.who).fallback, ...opts });
    };
    next(0);
  },

  // sayLive(text) — for text written on the spot (the tutor's answers), which can
  // never have a recording. Asks the server for a natural voice and plays that;
  // if the server cannot (no key, quota, offline) the browser voice reads it.
  sayLive(html, opts = {}) {
    if (!this.supported()) return;
    const text = voClean(html);
    if (!text) return;
    if (VO[voKey(opts.who, text)]) { this.say(html, opts); return; }
    this.stop();
    const run = ++this.seq;
    const fallback = () => { if (run === this.seq) this.sayFallback(text, opts); };
    if (typeof fetch === "undefined" || typeof Audio === "undefined") { fallback(); return; }
    const cached = this.live.get(text);
    const play = (url) => {
      if (run !== this.seq) return;
      const a = new Audio(url);
      this.audio = a;
      const p = a.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    if (cached) { play(cached); return; }
    const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = setTimeout(() => ctl?.abort(), 12000);
    fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }), signal: ctl?.signal })
      .then((r) => (r.ok && /audio/.test(r.headers.get("content-type") || "") ? r.blob() : Promise.reject(new Error("no audio"))))
      .then((blob) => { const url = URL.createObjectURL(blob); this.live.set(text, url); play(url); })
      .catch(fallback)
      .finally(() => clearTimeout(timer));
  },

  stop() {
    this.seq++;
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
