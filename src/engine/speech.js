// ====== Read-aloud: the browser speaks lessons out loud (Web Speech API) ======
// No files, no internet, no API key — uses the device's built-in voices.

export const Speak = {
  on: localStorage.getItem("cq-read") === "1",
  voice: null,

  supported() { return "speechSynthesis" in window; },

  pickVoice() {
    if (!this.supported()) return;
    const vs = speechSynthesis.getVoices() || [];
    this.voice =
      vs.find(v => /en[-_]US/i.test(v.lang) && /(Samantha|Jenny|Aria|Google US English)/i.test(v.name)) ||
      vs.find(v => /^en/i.test(v.lang)) ||
      vs[0] || null;
  },

  // Strip the dialogue's HTML tags/entities before speaking
  clean(html) {
    return String(html).replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();
  },

  say(html, opts = {}) {
    if (!this.supported()) return;
    const text = this.clean(html);
    if (!text) return;
    speechSynthesis.cancel();
    if (!this.voice) this.pickVoice();
    const u = new SpeechSynthesisUtterance(text);
    if (this.voice) u.voice = this.voice;
    u.rate = opts.rate != null ? opts.rate : 0.95;
    u.pitch = opts.pitch != null ? opts.pitch : 1.05;
    u.volume = 1;
    try { speechSynthesis.speak(u); } catch { /* ignore */ }
  },

  stop() { if (this.supported()) speechSynthesis.cancel(); },

  toggle() {
    this.on = !this.on;
    localStorage.setItem("cq-read", this.on ? "1" : "0");
    if (!this.on) this.stop();
    return this.on;
  },
};

// Voices load asynchronously in most browsers
if (Speak.supported()) {
  Speak.pickVoice();
  speechSynthesis.onvoiceschanged = () => Speak.pickVoice();
}
