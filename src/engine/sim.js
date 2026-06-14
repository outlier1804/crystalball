import { ASSETS } from "./data.js";

// ====== Trading Dojo simulator: market engine + candlestick chart ======
// One mission = one trading "day". Each candle GROWS live in sub-ticks (like a
// real market feed), and any open trade is force-closed when the market closes
// (the intraday rule!).

const KOIN_PER_POINT = 10;   // 1 price point = 10 Koins (our kid-sized "contract")
const START_BALANCE = 1000;
const SUBSTEPS = 4;          // live moves inside each candle

export const Sim = {
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
  onConfluence: null,  // all three strategy lamps just aligned!
  onSweep: null,       // a liquidity pool just got raided

  // strategy-mode state (Arc 7+ missions)
  orHigh: null, orLow: null, orComplete: false,
  yHigh: 0, yLow: 0,
  fvgs: [],
  prevConf: 0,
  dayStartPnl: 0,

  asset: null,
  displayBase: 0,   // today's level for the chosen asset (varies a bit per session)
  vol: 1,           // mission volatility flavored by the asset's personality

  start(mission, asset) {
    this.mission = mission;
    this.asset = asset || ASSETS.NQ;
    this.displayBase = Math.round(this.asset.base * (0.98 + Math.random() * 0.04));
    this.vol = mission.vol * this.asset.volFactor;
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
    this.dayStartPnl = 0;
    this.stats = {
      balance: START_BALANCE,
      pnl: 0,            // realized P&L (whole mission)
      minPnl: 0,         // worst equity dip (realized + open)
      tradesClosed: 0,
      allStopped: true,  // false if any trade was opened without a stop
      shieldSaves: 0,
      // strategy discipline tracking
      rangeTrades: 0,           // trades opened while the opening range was still forming
      allBreakoutAligned: true, // false if any trade fought the breakout direction
      fvgAlignedTrades: 0,      // trades entered with a fresh gap supporting them
      dayPnls: [],              // per-day results for multi-day experiments
      daysDone: 0,
      // liquidity tracking
      sweepsSeen: 0,            // liquidity sweeps that happened
      sweepTrades: 0,           // trades entered in the snap-back direction after a sweep
    };
    this.initDay();
    this.log(`🔔 Ding! The market is open. Today's beast: ${this.asset.emoji} <strong>${this.asset.code}</strong> (${this.asset.name}) — ${this.asset.nickname}!`, "info");
    if (mission.strategy) this.log(`📐 Strategy chart active: range zone, gap boxes, yesterday's walls — watch the signal lamps!`, "info");
    this.scheduleNext(500);
  },

  // Set up one trading day. Yesterday's levels (PDH/PDL/PDO/PDC) come from the
  // previous day's real battle, or are invented for day 1. Liquidity missions
  // get tighter levels so the pools actually come into play.
  initDay() {
    if (this.candles.length) {
      let hi = -Infinity, lo = Infinity;
      for (const c of this.candles) { hi = Math.max(hi, c.high); lo = Math.min(lo, c.low); }
      this.yHigh = hi;
      this.yLow = lo;
      this.pdo = this.candles[0].open;
      this.pdc = this.candles[this.candles.length - 1].close;
      this.price = this.pdc;
    } else {
      const tight = !!this.mission.liquidity;
      this.yHigh = this.price + (tight ? 1.5 + Math.random() * 2 : 2 + Math.random() * 4);
      this.yLow = this.price - (tight ? 1.5 + Math.random() * 2 : 2 + Math.random() * 4);
      this.pdo = this.yLow + Math.random() * (this.yHigh - this.yLow);
      this.pdc = this.yLow + Math.random() * (this.yHigh - this.yLow);
    }
    this.pd50 = (this.yHigh + this.yLow) / 2;
    this.lastSweep = null;
    this.candles = [];
    this.current = null;
    this.subStep = 0;
    this.orHigh = this.orLow = null;
    this.orComplete = false;
    this.fvgs = [];
    this.prevConf = 0;
  },

  orLen() { return this.mission.orLen || 8; },

  // Convert internal engine units to the asset's real-looking price
  fmtP(p) {
    const v = this.displayBase + (p - 100) * this.asset.scale;
    return v.toLocaleString("en-US", {
      minimumFractionDigits: this.asset.decimals,
      maximumFractionDigits: this.asset.decimals,
    });
  },

  // Stop-loss size in the asset's own points (engine units * scale)
  fmtPts(units) {
    const pts = units * this.asset.scale;
    return (pts % 1 === 0 ? pts : pts.toFixed(1)) + " pts";
  },

  // The three strategy lamps: breakout / fresh gap / yesterday's wall
  signals() {
    if (!this.mission || !this.mission.strategy) return null;
    const p = this.price;
    const breakout = !this.orComplete ? 0 : p > this.orHigh ? 1 : p < this.orLow ? -1 : 0;
    let gap = 0;
    for (let i = this.fvgs.length - 1; i >= 0; i--) {
      if (!this.fvgs[i].filled) { gap = this.fvgs[i].dir; break; }
    }
    const wall = p > this.yHigh ? 1 : p < this.yLow ? -1 : 0;
    const conf = breakout !== 0 && gap === breakout && wall === breakout ? breakout : 0;
    return { breakout, gap, wall, conf };
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
    const vol = this.vol;
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

    if (this.mission.strategy) {
      // gaps get "filled" when price walks back through them
      for (const f of this.fvgs) {
        if (!f.filled && (f.dir === 1 ? p <= f.lo : p >= f.hi)) f.filled = true;
      }
      const s = this.signals();
      if (s.conf !== 0 && this.prevConf === 0 && this.onConfluence) this.onConfluence(s.conf);
      this.prevConf = s.conf;
    }

    if (this.onUpdate) this.onUpdate();

    if (this.subStep >= SUBSTEPS) {
      // Candle complete — was it a dragon-sized move?
      if (Math.abs(c.close - c.open) > vol * 2 && this.onBigMove) this.onBigMove();
      this.current = null;
      const n = this.candles.length;
      if (this.mission.strategy) {
        if (!this.orComplete && n >= this.orLen()) {
          const range = this.candles.slice(0, this.orLen());
          this.orHigh = Math.max(...range.map(c2 => c2.high));
          this.orLow = Math.min(...range.map(c2 => c2.low));
          this.orComplete = true;
          this.log(`🚪 Opening range set! High ${this.fmtP(this.orHigh)} / Low ${this.fmtP(this.orLow)} — now hunt the breakout!`, "info");
        }
        // fair value gap: the middle candle leapt so far it skipped a stair
        if (n >= 3) {
          const c1 = this.candles[n - 3], c3 = this.candles[n - 1];
          if (c1.high < c3.low - 0.05) this.addFvg({ dir: 1, lo: c1.high, hi: c3.low, start: n - 3, filled: false });
          else if (c1.low > c3.high + 0.05) this.addFvg({ dir: -1, lo: c3.high, hi: c1.low, start: n - 3, filled: false });
        }
      }
      // liquidity sweep: price raided a pool beyond PDH/PDL and snapped back
      if (this.mission.liquidity && n >= 1) {
        const prev = n >= 2 ? this.candles[n - 2] : null;
        let sweepDir = 0;
        if ((c.high > this.yHigh && c.close < this.yHigh) ||
            (prev && prev.close > this.yHigh && c.close < this.yHigh)) sweepDir = -1;
        else if ((c.low < this.yLow && c.close > this.yLow) ||
                 (prev && prev.close < this.yLow && c.close > this.yLow)) sweepDir = 1;
        if (sweepDir !== 0 && (!this.lastSweep || this.lastSweep.dir !== sweepDir || n - this.lastSweep.at > 6)) {
          this.lastSweep = { dir: sweepDir, at: n };
          this.stats.sweepsSeen++;
          this.log(`💧 <strong>LIQUIDITY SWEEP!</strong> Price raided the pool ${sweepDir === -1 ? "above PDH" : "below PDL"} and snapped back — watch for the reversal!`, "info");
          if (this.onSweep) this.onSweep(sweepDir);
        }
      }
      if (n >= this.mission.candles) return this.endDay();
    }
    this.scheduleNext(700 / this.speed / SUBSTEPS);
  },

  addFvg(fvg) {
    this.fvgs.push(fvg);
    if (this.fvgs.length > 8) this.fvgs.shift();
    this.log(`🪜 A ${fvg.dir === 1 ? "bullish" : "bearish"} gap appeared — the market skipped a stair!`, "info");
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
    if (this.mission.strategy) {
      if (!this.orComplete) {
        this.stats.rangeTrades++;
        this.stats.allBreakoutAligned = false;
      } else {
        const s = this.signals();
        if (s.breakout !== dir) this.stats.allBreakoutAligned = false;
        if (s.gap === dir) this.stats.fvgAlignedTrades++;
      }
    }
    if (this.mission.liquidity && this.lastSweep &&
        this.candles.length - this.lastSweep.at <= 10 && dir === this.lastSweep.dir) {
      this.stats.sweepTrades++;
      this.log(`🎣 Snap-back trade after the sweep — fishing where the fish are!`, "good");
    }
    if (stop === null) {
      this.stats.allStopped = false;
      this.log(`⚠️ ${dir === 1 ? "LONG" : "SHORT"} ${this.asset.code} at ${this.fmtP(this.price)} — <strong>no shield!</strong> Sensei is frowning...`, "bad");
    } else {
      this.log(`${dir === 1 ? "📈 LONG" : "📉 SHORT"} ${this.asset.code} at ${this.fmtP(this.price)} — shield set at ${this.fmtP(stop)} 🛡️`, "info");
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
      this.log(`🛡️ Shield activated! Trade closed at ${this.fmtP(exitPrice)} for ${fmtKoin(pnl)}. A small scratch — the adventure continues!`, "bad");
    } else if (pnl >= 0) {
      this.log(`✅ Closed at ${this.fmtP(exitPrice)} for ${fmtKoin(pnl)}. Nice strike!`, "good");
    } else {
      this.log(`✋ Closed at ${this.fmtP(exitPrice)} for ${fmtKoin(pnl)}. Cutting losses like a pro.`, "bad");
    }
    if (this.onTradeClose) this.onTradeClose(pnl, byStop);
    if (this.onUpdate) this.onUpdate();
  },

  endDay() {
    if (this.position) {
      this.log(`🌅 Sunset! The intraday rule force-closes your open trade.`, "info");
      this.closePosition(this.price, false);
    }
    const dayPnl = this.stats.pnl - this.dayStartPnl;
    this.stats.dayPnls.push(dayPnl);
    this.stats.daysDone++;
    const totalDays = this.mission.days || 1;
    if (this.stats.daysDone < totalDays) {
      // multi-day experiment: roll into the next trading day
      this.log(`🔔 Day ${this.stats.daysDone} closed: ${fmtKoin(dayPnl)}. ${totalDays - this.stats.daysDone} day(s) of the experiment remain.`, dayPnl >= 0 ? "good" : "bad");
      this.dayStartPnl = this.stats.pnl;
      this.initDay();
      this.log(`🌅 Day ${this.stats.daysDone + 1} of ${totalDays} dawns — yesterday's walls updated!`, "info");
      if (this.onUpdate) this.onUpdate();
      this.scheduleNext(1400);
      return;
    }
    this.running = false;
    clearTimeout(this.timer);
    this.log(`🔔 Market closed. ${totalDays > 1 ? "Experiment" : "Day"} result: ${fmtKoin(this.stats.pnl)}.`, this.stats.pnl >= 0 ? "good" : "bad");
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

export function fmtKoin(v) {
  const r = Math.round(v);
  return (r >= 0 ? "+" : "") + r + " Koins";
}

// ---------- Chart drawing (interactive: hover for crosshair + candle story) ----------
export const Chart = {
  hover: null,   // { x, y } in canvas pixels, set by app.js mouse handlers
  layout: null,  // cached geometry for hit-testing

  draw() {
    const canvas = document.getElementById("chart");
    if (!canvas) return;   // canvas may not be mounted yet (React render timing)
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
    if (Sim.mission.strategy || Sim.mission.liquidity) {
      lo = Math.min(lo, Sim.yLow); hi = Math.max(hi, Sim.yHigh);
      if (Sim.orComplete) { lo = Math.min(lo, Sim.orLow); hi = Math.max(hi, Sim.orHigh); }
      if (Sim.mission.liquidity) { lo = Math.min(lo, Sim.pdo, Sim.pdc); hi = Math.max(hi, Sim.pdo, Sim.pdc); }
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
      ctx.fillText(Sim.fmtP(p), W - padR + 6, yy + 4);
    }

    // strategy overlays: range zone, yesterday's walls, gap boxes
    if (Sim.mission.strategy) {
      if (Sim.orComplete) {
        const yT = y(Sim.orHigh), yB = y(Sim.orLow);
        ctx.fillStyle = "rgba(62,230,255,.07)";
        ctx.fillRect(padL, yT, W - padR - padL, yB - yT);
        this.hline(ctx, yT, W, padL, padR, "#3ee6ff", `🚪 RANGE HIGH ${Sim.fmtP(Sim.orHigh)}`, true);
        this.hline(ctx, yB, W, padL, padR, "#3ee6ff", `🚪 RANGE LOW ${Sim.fmtP(Sim.orLow)}`, true);
      } else {
        ctx.fillStyle = "#8f80d8";
        ctx.font = "bold 13px sans-serif";
        ctx.fillText(`⏳ Opening range forming… (${Math.min(candles.length, Sim.orLen())}/${Sim.orLen()}) — a strategist waits!`, padL + 8, padT + 16);
      }
      this.hline(ctx, y(Sim.yHigh), W, padL, padR, "#c89bff", `🧱 PDH ${Sim.fmtP(Sim.yHigh)}`, true);
      this.hline(ctx, y(Sim.yLow), W, padL, padR, "#c89bff", `🧱 PDL ${Sim.fmtP(Sim.yLow)}`, true);
      for (const f of Sim.fvgs) {
        if (f.filled) continue;
        const x0 = padL + f.start * cw;
        const col = f.dir === 1 ? "61,255,142" : "255,90,90";
        ctx.fillStyle = `rgba(${col},.10)`;
        ctx.fillRect(x0, y(f.hi), (W - padR) - x0, Math.max(y(f.lo) - y(f.hi), 1));
        ctx.fillStyle = `rgba(${col},.75)`;
        ctx.font = "bold 10px sans-serif";
        ctx.fillText("🪜 GAP", x0 + 3, y(f.hi) + 11);
      }
    }

    // liquidity level map: PDH / PDL / PDO / PDC / PD 50% + treasure pools
    if (Sim.mission.liquidity) {
      const yH = y(Sim.yHigh), yL = y(Sim.yLow);
      ctx.fillStyle = "rgba(200,155,255,.09)";
      ctx.fillRect(padL, Math.max(padT, yH - 16), W - padR - padL, Math.min(16, yH - padT)); // pool above PDH
      ctx.fillRect(padL, yL, W - padR - padL, Math.min(16, (H - padB) - yL));                // pool below PDL
      this.hline(ctx, yH, W, padL, padR, "#c89bff", `💧 PDH ${Sim.fmtP(Sim.yHigh)}`, true);
      this.hline(ctx, yL, W, padL, padR, "#c89bff", `💧 PDL ${Sim.fmtP(Sim.yLow)}`, true);
      this.hline(ctx, y(Sim.pdo), W, padL, padR, "#9fe8ff", `PDO ${Sim.fmtP(Sim.pdo)}`, true);
      this.hline(ctx, y(Sim.pdc), W, padL, padR, "#ffd34f", `PDC ${Sim.fmtP(Sim.pdc)}`, true);
      this.hline(ctx, y(Sim.pd50), W, padL, padR, "#8f80d8", `PD 50% ${Sim.fmtP(Sim.pd50)}`, true);
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
      this.hline(ctx, y(p.entry), W, padL, padR, "#3ee6ff", `${p.dir === 1 ? "LONG" : "SHORT"} ${Sim.fmtP(p.entry)}`);
      if (p.stop !== null) this.hline(ctx, y(p.stop), W, padL, padR, "#ffd34f", `🛡️ ${Sim.fmtP(p.stop)}`, true);
    }

    // current price tag
    const last = candles[candles.length - 1];
    const yy = y(last.close);
    ctx.fillStyle = last.close >= last.open ? "#3dff8e" : "#ff5a5a";
    ctx.fillRect(W - padR + 2, yy - 9, padR - 4, 18);
    ctx.fillStyle = "#0d0a20";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(Sim.fmtP(last.close), W - padR + 5, yy + 4);

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
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(Sim.fmtP(price), L.W - L.padR + 5, my + 4);

    // candle story tooltip
    const up = c.close >= c.open;
    const lines = [
      `${Sim.asset.code} candle #${idx + 1}  ${up ? "🐂 Buyers won!" : "🐻 Sellers won!"}`,
      `Open  ${Sim.fmtP(c.open)}   Close ${Sim.fmtP(c.close)}`,
      `High  ${Sim.fmtP(c.high)}   Low   ${Sim.fmtP(c.low)}`,
    ];
    const bw = 216, bh = 62;
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
