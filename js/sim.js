// ====== Trading Dojo simulator: market engine + candlestick chart ======
// One mission = one trading "day". Each candle GROWS live in sub-ticks (like a
// real market feed), and any open trade is force-closed when the market closes
// (the intraday rule!).

const KOIN_PER_POINT = 10;   // 1 price point = 10 Koins (our kid-sized "contract")
const START_BALANCE = 1000;
const SUBSTEPS = 4;          // live moves inside each candle

const Sim = {
  mission: null,
  candles: [],
  current: null,       // the candle currently forming
  subStep: 0,
  timer: null,
  speed: 1,
  paused: false,
  running: false,

  price: 100,
  regime: 0,           // current drift direction for trendy markets
  regimeLeft: 0,

  position: null,      // { dir: 1|-1, entry, stop } or null
  stopSize: 5,

  stats: null,
  onUpdate: null,      // UI callbacks set by app.js
  onLog: null,
  onEnd: null,
  onTradeClose: null,  // (pnl, byStop) — floating text & confetti
  onBigMove: null,     // violent candle — screen shake!

  start(mission) {
    this.mission = mission;
    this.candles = [];
    this.current = null;
    this.subStep = 0;
    this.price = 100;
    this.position = null;
    this.paused = false;
    this.speed = 1;
    this.running = true;
    this.regime = mission.drift || 0;
    this.regimeLeft = 0;
    this.stats = {
      balance: START_BALANCE,
      pnl: 0,            // realized day P&L
      minPnl: 0,         // worst equity dip of the day (realized + open)
      tradesClosed: 0,
      allStopped: true,  // false if any trade was opened without a stop
      shieldSaves: 0,
    };
    this.log(`🔔 Ding! The market is open. Good luck, ninja!`, "info");
    this.scheduleNext(500);
  },

  scheduleNext(delay) {
    clearTimeout(this.timer);
    if (!this.running) return;
    this.timer = setTimeout(() => this.step(), delay);
  },

  step() {
    if (!this.running) return;
    if (this.paused) return this.scheduleNext(150);

    if (this.current === null) {
      // Begin a new candle. Trendy markets switch direction in regimes.
      if (this.mission.trendy) {
        if (this.regimeLeft <= 0) {
          this.regimeLeft = 8 + Math.floor(Math.random() * 10);
          const strength = (this.mission.drift || 0.1) + Math.random() * 0.15;
          this.regime = (Math.random() < 0.5 ? -1 : 1) * strength;
        }
        this.regimeLeft--;
      }
      const open = this.price;
      this.current = { open, high: open, low: open, close: open };
      this.candles.push(this.current);
      this.subStep = 0;
    }

    // One live sub-move of the forming candle
    const c = this.current;
    const vol = this.mission.vol;
    let p = c.close + this.regime / SUBSTEPS + (Math.random() - 0.5) * vol;
    p = Math.max(p, 5); // price can't go to zero in our dojo
    c.close = p;
    c.high = Math.max(c.high, p);
    c.low = Math.min(c.low, p);
    this.price = p;
    this.subStep++;

    // Did this move touch the stop-loss shield?
    if (this.position && this.position.stop !== null) {
      const pos = this.position;
      const hit = pos.dir === 1 ? c.low <= pos.stop : c.high >= pos.stop;
      if (hit) this.closePosition(pos.stop, true);
    }

    // Track the worst equity dip (for shield/boss missions)
    const equity = this.stats.pnl + this.openPnl();
    if (equity < this.stats.minPnl) this.stats.minPnl = equity;

    if (this.onUpdate) this.onUpdate();

    if (this.subStep >= SUBSTEPS) {
      // Candle complete — was it a dragon-sized move?
      if (Math.abs(c.close - c.open) > vol * 2 && this.onBigMove) this.onBigMove();
      this.current = null;
      if (this.candles.length >= this.mission.candles) return this.endDay();
    }
    this.scheduleNext(700 / this.speed / SUBSTEPS);
  },

  candlesLeft() {
    return this.mission ? this.mission.candles - this.candles.length : 0;
  },

  openPnl() {
    if (!this.position) return 0;
    return (this.price - this.position.entry) * this.position.dir * KOIN_PER_POINT;
  },

  openTrade(dir) {
    if (!this.running || this.position) return;
    const stop = this.stopSize > 0 ? this.price - dir * this.stopSize : null;
    this.position = { dir, entry: this.price, stop };
    if (stop === null) {
      this.stats.allStopped = false;
      this.log(`⚠️ ${dir === 1 ? "LONG" : "SHORT"} at ${this.price.toFixed(1)} — <strong>no shield!</strong> Sensei is frowning...`, "bad");
    } else {
      this.log(`${dir === 1 ? "📈 LONG" : "📉 SHORT"} at ${this.price.toFixed(1)} — shield set at ${stop.toFixed(1)} 🛡️`, "info");
    }
    if (this.onUpdate) this.onUpdate();
  },

  closeTrade() {
    if (this.position) this.closePosition(this.price, false);
  },

  // Drag the shield line: it may move anywhere except past the current price
  // (moving it INTO profit is allowed — that's a trailing stop, a real pro move!)
  moveStop(price) {
    if (!this.position || this.position.stop === null) return;
    const pos = this.position;
    const limit = this.price - pos.dir * 0.5;
    pos.stop = pos.dir === 1 ? Math.min(price, limit) : Math.max(price, limit);
  },

  closePosition(exitPrice, byStop) {
    const p = this.position;
    const pnl = (exitPrice - p.entry) * p.dir * KOIN_PER_POINT;
    this.stats.pnl += pnl;
    this.stats.balance = START_BALANCE + this.stats.pnl;
    this.stats.tradesClosed++;
    this.position = null;
    if (byStop) {
      this.stats.shieldSaves++;
      this.log(`🛡️ Shield activated! Trade closed at ${exitPrice.toFixed(1)} for ${fmtKoin(pnl)}. A small scratch — the adventure continues!`, "bad");
    } else if (pnl >= 0) {
      this.log(`✅ Closed at ${exitPrice.toFixed(1)} for ${fmtKoin(pnl)}. Nice strike!`, "good");
    } else {
      this.log(`✋ Closed at ${exitPrice.toFixed(1)} for ${fmtKoin(pnl)}. Cutting losses like a pro.`, "bad");
    }
    if (this.onTradeClose) this.onTradeClose(pnl, byStop);
    if (this.onUpdate) this.onUpdate();
  },

  endDay() {
    if (this.position) {
      this.log(`🌅 Sunset! The intraday rule force-closes your open trade.`, "info");
      this.closePosition(this.price, false);
    }
    this.running = false;
    clearTimeout(this.timer);
    this.log(`🔔 Market closed. Day result: ${fmtKoin(this.stats.pnl)}.`, this.stats.pnl >= 0 ? "good" : "bad");
    if (this.onEnd) this.onEnd(this.stats);
  },

  quit() {
    this.running = false;
    clearTimeout(this.timer);
  },

  log(msg, cls) {
    if (this.onLog) this.onLog(msg, cls);
  },
};

function fmtKoin(v) {
  const r = Math.round(v);
  return (r >= 0 ? "+" : "") + r + " Koins";
}

// ---------- Chart drawing (interactive: hover for crosshair + candle story) ----------
const Chart = {
  hover: null,   // { x, y } in canvas pixels, set by app.js mouse handlers
  layout: null,  // cached geometry for hit-testing

  draw() {
    const canvas = document.getElementById("chart");
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const candles = Sim.candles;
    if (!candles.length || !Sim.mission) return;

    const padL = 10, padR = 64, padT = 18, padB = 14;
    const n = Math.max(Sim.mission.candles, candles.length);
    const cw = (W - padL - padR) / n;

    let lo = Infinity, hi = -Infinity;
    for (const c of candles) { lo = Math.min(lo, c.low); hi = Math.max(hi, c.high); }
    if (Sim.position && Sim.position.stop !== null) {
      lo = Math.min(lo, Sim.position.stop); hi = Math.max(hi, Sim.position.stop);
    }
    const span = Math.max(hi - lo, 4);
    lo -= span * 0.08; hi += span * 0.08;
    const y = price => padT + (hi - price) / (hi - lo) * (H - padT - padB);
    this.layout = { padL, padR, padT, padB, cw, lo, hi, W, H, y };

    // grid lines
    ctx.strokeStyle = "#241c4e";
    ctx.fillStyle = "#6f63b8";
    ctx.font = "11px sans-serif";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const p = lo + (hi - lo) * i / 4;
      const yy = y(p);
      ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(W - padR, yy); ctx.stroke();
      ctx.fillText(p.toFixed(1), W - padR + 6, yy + 4);
    }

    // candles — the forming candle glows like charged ki energy
    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      const x = padL + i * cw + cw / 2;
      const up = c.close >= c.open;
      const color = up ? "#3dff8e" : "#ff5a5a";
      const isLive = i === candles.length - 1;
      ctx.save();
      if (isLive) { ctx.shadowColor = color; ctx.shadowBlur = 14; }
      ctx.strokeStyle = ctx.fillStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, y(c.high)); ctx.lineTo(x, y(c.low)); ctx.stroke();
      const bodyW = Math.max(cw * 0.6, 2);
      const top = y(Math.max(c.open, c.close));
      const hgt = Math.max(Math.abs(y(c.open) - y(c.close)), 1.5);
      ctx.fillRect(x - bodyW / 2, top, bodyW, hgt);
      ctx.restore();
    }

    // position entry + stop lines
    if (Sim.position) {
      const p = Sim.position;
      this.hline(ctx, y(p.entry), W, padL, padR, "#3ee6ff", `${p.dir === 1 ? "LONG" : "SHORT"} ${p.entry.toFixed(1)}`);
      if (p.stop !== null) this.hline(ctx, y(p.stop), W, padL, padR, "#ffd34f", `🛡️ ${p.stop.toFixed(1)}`, true);
    }

    // current price tag
    const last = candles[candles.length - 1];
    const yy = y(last.close);
    ctx.fillStyle = last.close >= last.open ? "#3dff8e" : "#ff5a5a";
    ctx.fillRect(W - padR + 2, yy - 9, padR - 4, 18);
    ctx.fillStyle = "#0d0a20";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(last.close.toFixed(1), W - padR + 8, yy + 4);

    if (this.hover) this.drawCrosshair(ctx, candles);
  },

  drawCrosshair(ctx, candles) {
    const L = this.layout;
    const { x, y: my } = this.hover;
    if (x < L.padL || x > L.W - L.padR || my < L.padT || my > L.H - L.padB) return;
    const idx = Math.floor((x - L.padL) / L.cw);
    if (idx < 0 || idx >= candles.length) return;
    const c = candles[idx];
    const cx = L.padL + idx * L.cw + L.cw / 2;

    // crosshair lines
    ctx.save();
    ctx.strokeStyle = "#8f80d8";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(cx, L.padT); ctx.lineTo(cx, L.H - L.padB); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(L.padL, my); ctx.lineTo(L.W - L.padR, my); ctx.stroke();
    ctx.setLineDash([]);

    // price at the cursor
    const price = L.hi - (my - L.padT) / (L.H - L.padT - L.padB) * (L.hi - L.lo);
    ctx.fillStyle = "#8f80d8";
    ctx.fillRect(L.W - L.padR + 2, my - 9, L.padR - 4, 18);
    ctx.fillStyle = "#0d0a20";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(price.toFixed(1), L.W - L.padR + 8, my + 4);

    // candle story tooltip
    const up = c.close >= c.open;
    const lines = [
      `Candle #${idx + 1}  ${up ? "🐂 Buyers won!" : "🐻 Sellers won!"}`,
      `Open  ${c.open.toFixed(1)}   Close ${c.close.toFixed(1)}`,
      `High  ${c.high.toFixed(1)}   Low   ${c.low.toFixed(1)}`,
    ];
    const bw = 196, bh = 62;
    let bx = cx + 14, by = Math.max(L.padT + 4, my - bh - 10);
    if (bx + bw > L.W - L.padR) bx = cx - bw - 14;
    ctx.globalAlpha = 0.93;
    ctx.fillStyle = "#1b1440";
    ctx.strokeStyle = up ? "#3dff8e" : "#ff5a5a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 10);
    ctx.fill(); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#f4f1ff";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(lines[0], bx + 10, by + 18);
    ctx.font = "11px monospace";
    ctx.fillStyle = "#b9b0e8";
    ctx.fillText(lines[1], bx + 10, by + 36);
    ctx.fillText(lines[2], bx + 10, by + 52);
    ctx.restore();
  },

  hline(ctx, yy, W, padL, padR, color, label, dashed) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    if (dashed) ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(W - padR, yy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = color;
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(label, padL + 4, yy - 5);
    ctx.restore();
  },
};
