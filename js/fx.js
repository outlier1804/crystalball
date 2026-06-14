// ====== FX engine: sakura petals, confetti bursts, floating text, screen shake ======

const FX = (() => {
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
      bctx.fillStyle = p.color;
      bctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.62);
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

  return { confetti, confettiAt, floatText, shake };
})();
