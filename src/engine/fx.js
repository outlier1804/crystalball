// ====== FX engine: sakura petals, confetti bursts, floating text, screen shake ======

export const FX = (() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Two full-screen canvases: petals drift behind the action, bursts fly above popups
  const petalCanvas = document.createElement("canvas");
  petalCanvas.id = "fx-petals";
  const burstCanvas = document.createElement("canvas");
  burstCanvas.id = "fx-bursts";
  document.body.append(petalCanvas, burstCanvas);
  const pctx = petalCanvas.getContext("2d");
  const bctx = burstCanvas.getContext("2d");

  function fit() {
    for (const c of [petalCanvas, burstCanvas]) { c.width = innerWidth; c.height = innerHeight; }
  }
  addEventListener("resize", fit);
  fit();

  // ---------- sakura petals ----------
  const PETAL_COLORS = ["#ff9ecb", "#ffc3e0", "#ffd34f", "#9fe8ff"];
  const petals = [];
  function makePetal(anywhere) {
    return {
      x: Math.random() * innerWidth,
      y: anywhere ? Math.random() * innerHeight : -20,
      size: 4 + Math.random() * 5,
      vy: 0.35 + Math.random() * 0.6,
      sway: Math.random() * Math.PI * 2,
      vsway: 0.008 + Math.random() * 0.018,
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.04,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
    };
  }
  if (!reduced) for (let i = 0; i < 16; i++) petals.push(makePetal(true));

  // ---------- confetti particles ----------
  let parts = [];
  const CONFETTI_COLORS = ["#ff4f9a", "#3ee6ff", "#ffd34f", "#3dff8e", "#ff7a3d", "#c89bff"];

  function loop() {
    pctx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);
    for (const p of petals) {
      p.sway += p.vsway;
      p.x += Math.sin(p.sway) * 0.8;
      p.y += p.vy;
      p.rot += p.vrot;
      if (p.y > innerHeight + 24) Object.assign(p, makePetal(false));
      pctx.save();
      pctx.translate(p.x, p.y);
      pctx.rotate(p.rot);
      pctx.fillStyle = p.color;
      pctx.globalAlpha = 0.7;
      pctx.beginPath();
      pctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
      pctx.fill();
      pctx.restore();
    }

    bctx.clearRect(0, 0, burstCanvas.width, burstCanvas.height);
    parts = parts.filter(p => p.life > 0);
    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.16;       // gravity
      p.rot += p.vrot;
      p.life--;
      bctx.save();
      bctx.translate(p.x, p.y);
      bctx.rotate(p.rot);
      bctx.globalAlpha = Math.min(1, p.life / 22);
      
      if (p.type === "coin") {
        // Draw golden circular coin
        bctx.beginPath();
        bctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        bctx.fillStyle = "#ffd34f";
        bctx.strokeStyle = "#c87f0a";
        bctx.lineWidth = 1.5;
        bctx.fill();
        bctx.stroke();
        
        // Inner detail
        bctx.beginPath();
        bctx.arc(0, 0, p.size / 4, 0, Math.PI * 2);
        bctx.strokeStyle = "#ffb13d";
        bctx.stroke();
      } else if (p.type === "star") {
        bctx.fillStyle = p.color;
        bctx.beginPath();
        for (let k = 0; k < 5; k++) {
          const o = (k * 4 * Math.PI) / 5 - Math.PI / 2;
          const px = Math.cos(o) * (p.size / 2), py = Math.sin(o) * (p.size / 2);
          k ? bctx.lineTo(px, py) : bctx.moveTo(px, py);
        }
        bctx.closePath();
        bctx.fill();
      } else {
        bctx.fillStyle = p.color;
        bctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.62);
      }
      bctx.restore();
    }
    requestAnimationFrame(loop);
  }
  loop();

  function confetti(x, y, n = 36) {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 6;
      parts.push({
        x, y,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - 3.5,
        size: 5 + Math.random() * 6,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.35,
        life: 50 + Math.random() * 30,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      });
    }
  }

  function coins(x, y, n = 28) {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2;
      const speed = 3.0 + Math.random() * 7;
      parts.push({
        type: "coin",
        x, y,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - 5.5, // Fly upward more dynamically
        size: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.25,
        life: 60 + Math.random() * 40,
        color: "#ffd34f"
      });
    }
  }


  // ---------- gold star burst (used for combos and mastery) ----------
  function stars(x, y, n = 18) {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;
      const speed = 3 + Math.random() * 7;
      parts.push({
        type: "star", x, y,
        vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
        size: 7 + Math.random() * 9,
        rot: Math.random() * Math.PI, vrot: (Math.random() - 0.5) * 0.4,
        life: 45 + Math.random() * 30,
        color: ["#ffd34f", "#fff3b0", "#ffb13d"][Math.floor(Math.random() * 3)],
      });
    }
  }

  // ---------- expanding shockwave ring, centred on an element ----------
  function shockwave(el, color = "#ffd34f") {
    if (reduced || !el) return;
    const r = el.getBoundingClientRect();
    const d = document.createElement("div");
    d.className = "fx-shockwave";
    d.style.left = (r.left + r.width / 2) + "px";
    d.style.top = (r.top + r.height / 2) + "px";
    d.style.borderColor = color;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 700);
  }

  // ---------- full-screen colour flash (rank-ups, big combos) ----------
  function flash(color = "#ffd34f", ms = 420) {
    if (reduced) return;
    const d = document.createElement("div");
    d.className = "fx-flash";
    d.style.background = `radial-gradient(circle at 50% 45%, ${color}55, transparent 62%)`;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), ms);
  }

  // ---------- coins that fly from an element into the XP bar ----------
  //
  // The single most motivating half-second in the game: he sees the reward
  // physically travel from the thing he did into his own progress bar, and the
  // bar reacts when it lands.
  function flyToXp(fromEl, n = 7, emoji = "🪙") {
    const target = document.querySelector(".xp-bar") || document.querySelector("#topbar");
    if (!target || !fromEl) return;
    if (reduced) { pulseXp(); return; }
    const a = fromEl.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const sx = a.left + a.width / 2, sy = a.top + a.height / 2;
    const tx = b.left + b.width / 2, ty = b.top + b.height / 2;
    for (let i = 0; i < n; i++) {
      const d = document.createElement("div");
      d.className = "fx-fly";
      d.textContent = emoji;
      d.style.left = sx + "px";
      d.style.top = sy + "px";
      d.style.setProperty("--dx", (tx - sx) + "px");
      d.style.setProperty("--dy", (ty - sy) + "px");
      d.style.setProperty("--wob", ((Math.random() - 0.5) * 120) + "px");
      d.style.animationDelay = (i * 55) + "ms";
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 900 + i * 55);
    }
    setTimeout(pulseXp, 700 + n * 40);
  }

  function pulseXp() {
    const bar = document.querySelector(".xp-wrap");
    if (!bar) return;
    bar.classList.remove("xp-pop");
    void bar.offsetWidth;
    bar.classList.add("xp-pop");
    setTimeout(() => bar.classList.remove("xp-pop"), 700);
  }

  // ---------- big combo number that punches in and fades ----------
  function comboPop(text, sub = "") {
    if (reduced) return;
    const d = document.createElement("div");
    d.className = "fx-combo";
    d.innerHTML = `<span class="fx-combo-n">${text}</span>${sub ? `<span class="fx-combo-s">${sub}</span>` : ""}`;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1100);
  }

  function confettiAt(el, n) {
    const r = el.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + r.height / 2, n);
  }

  // ---------- floating +/- Koin text ----------
  function floatText(el, text, color) {
    const r = el.getBoundingClientRect();
    const div = document.createElement("div");
    div.className = "float-text";
    div.textContent = text;
    div.style.color = color;
    div.style.left = (r.left + r.width / 2 - 40 + (Math.random() - 0.5) * 60) + "px";
    div.style.top = (r.top + r.height / 2) + "px";
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 1400);
  }

  // ---------- screen shake ----------
  function shake(el) {
    if (reduced) return;
    el.classList.remove("shake");
    void el.offsetWidth;   // restart the animation
    el.classList.add("shake");
  }

  return { confetti, confettiAt, floatText, shake, coins, stars, shockwave, flash, flyToXp, pulseXp, comboPop, reduced };
})();
