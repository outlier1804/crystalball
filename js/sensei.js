// ====== Sensei companion: a floating animated guide who helps everywhere ======
// Sensei Hoshi sits in the corner, hops when he speaks, and gives contextual
// tips on every screen. Tap him anytime for a pearl of trading wisdom.

const Sensei = (() => {
  const widget = document.createElement("div");
  widget.id = "sensei-widget";
  widget.innerHTML = `
    <div id="sensei-bubble" class="hidden"><div id="sensei-bubble-text"></div></div>
    <div id="sensei-body">${CHARACTER_ART["Sensei Hoshi"]}</div>`;
  document.body.appendChild(widget);
  const bubble = document.getElementById("sensei-bubble");
  const textEl = document.getElementById("sensei-bubble-text");
  const body = document.getElementById("sensei-body");

  let hideTimer = null;
  const saidOnce = new Set();

  function say(text, opts = {}) {
    if (widget.classList.contains("offscreen")) return;
    if (opts.once) {
      if (saidOnce.has(opts.once)) return;
      saidOnce.add(opts.once);
    }
    textEl.innerHTML = text;
    bubble.classList.remove("hidden", "bubble-pop");
    void bubble.offsetWidth;
    bubble.classList.add("bubble-pop");
    emote(opts.emote || "talk");
    Sound.play("coo");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => bubble.classList.add("hidden"), opts.duration || 7000);
  }

  function emote(name) {
    body.classList.remove("emote-talk", "emote-happy", "emote-warn");
    void body.offsetWidth;
    body.classList.add("emote-" + name);
  }

  function show() { widget.classList.remove("offscreen"); }
  function hide() { widget.classList.add("offscreen"); bubble.classList.add("hidden"); }

  // Tap the sensei for a random scroll of wisdom
  const WISDOM = [
    "The trend is your friend — surf the wave, don't fight it. 🌊",
    "A small loss today means you can still trade tomorrow. 🛡️",
    "The market doesn't care how SURE you feel. Wear your shield!",
    "Patience, young one. The sniper takes few shots. 🎯",
    "Green candle, buyers won. Red candle, sellers won. Simple!",
    "Plan the trade, then trade the plan. 📜",
    "After a loss: breathe, review, reset. Never revenge-trade. 🧘",
    "Wild market days call for smaller, more careful strikes. 🐉",
    "A good trade is one where you followed your rules — win or lose.",
    "Even legendary masters lose trades. They just lose them SMALL.",
  ];
  widget.addEventListener("click", () => {
    say(WISDOM[Math.floor(Math.random() * WISDOM.length)], { emote: "talk" });
  });

  // Contextual guidance per screen
  function onScreen(name) {
    if (name === "lesson" || name === "welcome") return hide();
    show();
    if (name === "map") sayMapTip();
    if (name === "dojo") sayDojoTip();
    if (name === "profile") {
      const n = Object.values(Game.state.badges).filter(Boolean).length;
      say(n === BADGES.length
        ? "Every badge earned... I have nothing left to teach you, legend. 🐉"
        : `${n} of ${BADGES.length} badges so far. Each one is a story of your training!`,
        { once: "profile-" + n });
    }
  }

  function sayMapTip() {
    for (let i = 0; i < ARCS.length; i++) {
      const arc = ARCS[i];
      const p = Game.arcProgress(arc.id);
      if (!Game.arcUnlocked(i)) break;
      if (!p.lessonDone)
        return say(`Your next step: the 📖 lesson of <strong>${arc.name}</strong>. I'll meet you there!`, { once: "map-l-" + arc.id });
      if (!p.quizDone)
        return say(`You read the scrolls of <strong>${arc.name}</strong> — now prove it in the ❓ quiz!`, { once: "map-q-" + arc.id });
      const m = MISSIONS.find(x => x.unlockArc === arc.id);
      if (m && !Game.state.missions[m.id])
        return say(`A dojo mission awaits: <strong>${m.emoji} ${m.name}</strong>! Enter the Trading Dojo when you're ready.`, { once: "map-m-" + m.id });
    }
    say("You have mastered every scroll! Replay missions anytime to sharpen your blade. ⚔️", { once: "map-done" });
  }

  function sayDojoTip() {
    const next = MISSIONS.find(m => Game.missionUnlocked(m) && !Game.state.missions[m.id]);
    if (next)
      return say(`I recommend <strong>${next.emoji} ${next.name}</strong>. Remember: shield first, glory second!`, { once: "dojo-" + next.id });
    if (!MISSIONS.some(m => Game.missionUnlocked(m)))
      return say("Finish Arc 2's quiz on the Story Map to unlock your first mission!", { once: "dojo-locked" });
    say("All missions complete! The dojo is yours, Trade Master. 🏆", { once: "dojo-done" });
  }

  // Reactions during a trading mission
  const REACT = {
    noShield: [
      "⚠️ No shield?! The market punishes overconfidence, young one!",
      "⚠️ Trading without a stop-loss... Kazuo tried that once. ONCE.",
    ],
    shieldSave: [
      "The shield did its duty — a scratch instead of a wound. Well played! 🛡️",
      "Your stop-loss just saved your Koins. THIS is why we always wear it!",
    ],
    bigWin: [
      "An excellent strike! But stay humble — the market is watching. ✨",
      "Beautiful trade! Patience and the wave carried you. 🌊",
    ],
    smallLoss: [
      "You cut the loss while it was small. That is true discipline. 🥋",
      "A tiny scratch. Shake it off — breathe, review, reset. 🧘",
    ],
    overtrade: [
      "So many trades, little ninja... remember the sniper. Fewer, better shots! 🎯",
    ],
    closingSoon: [
      "🌅 Sunset approaches! Close your trade with honor — or the bell closes it for you!",
    ],
    missionFail: [
      "Failure is the second-best sensei — after me. Once more! 💪",
      "Even I lost my first hundred battles. Adjust your plan and try again!",
    ],
  };

  function react(kind, opts = {}) {
    const pool = REACT[kind];
    if (!pool) return;
    say(pool[Math.floor(Math.random() * pool.length)], opts);
  }

  return { say, react, show, hide, onScreen };
})();
