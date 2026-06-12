// ====== Trading Dojo simulator: market engine + candlestick chart ======
// One mission = one trading "day". Candles appear one by one; any open trade
// is force-closed when the market closes (the intraday rule!).

const KOIN_PER_POINT = 10;   // 1 price point = 10 Koins (our kid-sized "contract")
const START_BALANCE = 1000;

const Sim = {
  mission: null,
  candles: [],
  timer: null,
  speed: 1,
  paused: false,
  running: false,

  price: 100,
  regime: 0,          // current drift direction for trendy markets
  regimeLeft: 0,

  position: null,      // { dir: 1|-1, entry, stop } or null
  stopSize: 5,

  stats: null,
  onUpdate: null,      // UI callbacks set by app.js
  onLog: null,
  onEnd: null,

  start(mission) {
    this.mission = mission;
    this.candles = [];
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
    this.scheduleTick();
  },

  scheduleTick() {
    clearTimeout(this.timer);
    if (!this.running) return;
    this.timer = setTimeout(() => this.tick(), 700 / this.speed);
  },

  tick() {
    if (this.paused || !this.running) return this.scheduleTick();

    // Trendy markets switch direction in regimes; choppy ones just wiggle
    if (this.mission.trendy) {
      if (this.regimeLeft <= 0) {
        this.regimeLeft = 8 + Math.floor(Math.random() * 10);
        const strength = (this.mission.drift || 0.1) + Math.random() * 0.15;
        this.regime = (Math.random() < 0.5 ? -1 : 1) * strength;
      }
      this.regimeLeft--;
    }

    const vol = this.mission.vol;
    const open = this.price;
    let c = open;
    let high = open, low = open;
    // Build the candle from a few sub-moves so wicks look natural
    for (let i = 0; i < 4; i++) {
      c += this.regime / 4 + (Math.random() - 0.5) * vol;
      high = Math.max(high, c);
      low = Math.min(low, c);
    }
    c = Math.max(c, 5); // price can't go to zero in our dojo
    const candle = { open, high, low, close: c };
    this.candles.push(candle);
    this.price = c;

    // Did the candle touch the stop-loss shield?
    if (this.position && this.position.stop !== null) {
      const p = this.position;
      const hit = p.dir === 1 ? low <= p.stop : high >= p.stop;
      if (hit) {
        this.closePosition(p.stop, true);
      }
    }

    // Track the worst equity dip (for shield/boss missions)
    const equity = this.stats.pnl + this.openPnl();
    if (equity < this.stats.minPnl) this.stats.minPnl = equity;

    if (this.onUpdate) this.onUpdate();

    if (this.candles.length >= this.mission.candles) {
      this.endDay();
    } else {
      this.scheduleTick();
    }
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

// ---------- Chart drawing ----------
const Chart = {
  draw() {
    const canvas = document.getElementById("chart");
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const candles = Sim.candles;
    if (!candles.length) return;

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

    // candles
    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      const x = padL + i * cw + cw / 2;
      const up = c.close >= c.open;
      ctx.strokeStyle = ctx.fillStyle = up ? "#3dff8e" : "#ff5a5a";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, y(c.high)); ctx.lineTo(x, y(c.low)); ctx.stroke();
      const bodyW = Math.max(cw * 0.6, 2);
      const top = y(Math.max(c.open, c.close));
      const hgt = Math.max(Math.abs(y(c.open) - y(c.close)), 1.5);
      ctx.fillRect(x - bodyW / 2, top, bodyW, hgt);
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
