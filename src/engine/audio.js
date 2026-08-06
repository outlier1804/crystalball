// ====== Sound engine: all effects synthesized with Web Audio, no files needed ======

export const Sound = (() => {
  let ctx = null;
  let muted = localStorage.getItem("cq-muted") === "1";

  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type = "sine", vol = 0.15, when = 0, slideTo = 0) {
    if (muted) return;
    try {
      const a = ac();
      const t = a.currentTime + when;
      const osc = a.createOscillator();
      const gain = a.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain);
      gain.connect(a.destination);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    } catch { /* audio not available — stay silent */ }
  }

  const fx = {
    click:   () => tone(660, 0.05, "square", 0.04),
    blip:    () => tone(900, 0.025, "square", 0.02),               // typewriter tick
    open:    () => { tone(440, 0.08, "triangle", 0.12); tone(660, 0.1, "triangle", 0.12, 0.07); },
    win:     () => { tone(880, 0.12, "triangle", 0.15); tone(1320, 0.2, "triangle", 0.15, 0.1); },
    lose:    () => tone(240, 0.28, "sawtooth", 0.09, 0, 120),
    shield:  () => { tone(200, 0.14, "square", 0.12); tone(150, 0.2, "square", 0.1, 0.08); },
    correct: () => { tone(660, 0.1, "triangle", 0.15); tone(880, 0.12, "triangle", 0.15, 0.09); tone(1100, 0.16, "triangle", 0.15, 0.18); },
    wrong:   () => tone(170, 0.3, "sawtooth", 0.1, 0, 85),
    fanfare: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, "triangle", 0.16, i * 0.11)),
    bell:    () => { tone(1568, 0.6, "sine", 0.12); tone(2093, 0.5, "sine", 0.06, 0.02); },
    coo:     () => { tone(520, 0.09, "sine", 0.09); tone(680, 0.12, "sine", 0.09, 0.1); },
    // Combo ladder: every unbroken answer comes back a step higher, so the
    // sound itself tells him the run is still alive.
    combo:   (n = 1) => {
      const base = 523 * Math.pow(1.122, Math.min(n, 12));   // semitone per link
      tone(base, 0.09, "triangle", 0.14);
      tone(base * 1.5, 0.12, "triangle", 0.1, 0.06);
    },
    comboBreak: () => { tone(320, 0.16, "sawtooth", 0.09, 0, 150); tone(180, 0.22, "sawtooth", 0.07, 0.1); },
    chest:   () => { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, "triangle", 0.14, i * 0.07)); tone(1568, 0.5, "sine", 0.08, 0.4); },
    creak:   () => tone(140, 0.18, "sawtooth", 0.05, 0, 90),
    streak:  () => { [659, 784, 988].forEach((f, i) => tone(f, 0.18, "triangle", 0.14, i * 0.09)); },
    whoosh:  () => tone(900, 0.22, "sine", 0.05, 0, 180),
    powerup: () => { for (let i = 0; i < 6; i++) tone(440 * Math.pow(1.18, i), 0.07, "square", 0.06, i * 0.045); },
  };

  return {
    play: (name, arg) => fx[name] && fx[name](arg),
    toggle() {
      muted = !muted;
      localStorage.setItem("cq-muted", muted ? "1" : "0");
      return muted;
    },
    get muted() { return muted; },
  };
})();
