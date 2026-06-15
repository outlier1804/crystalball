import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import { ASSETS, MISSIONS, ARCS, BADGES, XP_REWARDS } from "../engine/data.js";
import { Sim, Chart, fmtKoin } from "../engine/sim.js";
import { Sound } from "../engine/audio.js";
import { FX } from "../engine/fx.js";
import { Sensei } from "../engine/sensei.js";

const currentAsset = () => ASSETS[Game.state.asset] || ASSETS.NQ;
const stopLabel = (units) => {
  const pts = units * currentAsset().scale;
  return `${units === 5 ? "Small" : "Big"} (${pts % 1 === 0 ? pts : pts.toFixed(1)} pts)`;
};

export default function Dojo() {
  const { bump, popup, params } = useApp();
  const [view, setView] = useState("select");
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);
  const [mission, setMission] = useState(null);
  const [log, setLog] = useState([]);
  const [stopSize, setStopSize] = useState(5);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const chartRef = useRef(null);
  const logRef = useRef(null);
  const flags = useRef({ closing: false, conf: false, sweep: false });
  const dragging = useRef(false);

  useEffect(() => {
    if (params.missionId) {
      const m = MISSIONS.find((x) => x.id === params.missionId);
      if (m && Game.missionUnlocked(m)) start(m);
    }
    return () => Sim.quit();
  }, []);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  function onUpdate() {
    if (Sim.running && Sim.position && Sim.candlesLeft() <= 8 && !flags.current.closing) {
      flags.current.closing = true;
      Sensei.react("closingSoon", { emote: "warn" });
    }
    Chart.draw();
    refresh();
  }

  function finishMission(m, stats) {
    const had = Object.keys(Game.state.badges).filter((b) => Game.state.badges[b]);
    Game.recordDay(stats);
    const passed = m.check(stats);
    let board = "";
    if ((m.days || 1) > 1 && stats.dayPnls.length) {
      board = "<br><br>📋 <strong>Lab results:</strong><br>" +
        stats.dayPnls.map((p, i) => `Day ${i + 1}: ${fmtKoin(p)}`).join("<br>") +
        `<br>Green days: ${stats.dayPnls.filter((p) => p > 0).length}/${stats.dayPnls.length} · Total: ${fmtKoin(stats.pnl)}`;
    }
    if (passed) {
      const rankUp = Game.completeMission(m);
      popup(m.boss ? "🐉" : "🏆", m.boss ? "DRAGON DEFEATED!" : "MISSION COMPLETE!",
        `${m.name} cleared with ${fmtKoin(stats.pnl)}! +${m.boss ? XP_REWARDS.boss : XP_REWARDS.mission} XP` +
        (m.boss ? "<br><br>🎓 You have completed your training, <strong>Legendary Trade Master</strong>!" : "") +
        (m.id === "m8" ? "<br><br>🔬 You judged the strategy like a true scientist — by the whole table, not one lucky day!" : "") +
        board, true, "win");
      if (rankUp) popup(rankUp.emoji, "RANK UP!", `You are now a <strong>${rankUp.name}</strong>!`, true, "levelup");
    } else {
      popup("🌙", "Day over — mission not cleared",
        `You finished with ${fmtKoin(stats.pnl)}, but the goal wasn't met.<br><em>"Every master has failed more times than the beginner has tried."</em> — Sensei Hoshi.<br>Try again!` + board, false, "lose");
      Sensei.react("missionFail", { emote: "talk", duration: 9000 });
    }
    BADGES.forEach((b) => {
      if (Game.state.badges[b.id] && !had.includes(b.id))
        popup(b.emoji, "Badge earned!", `<strong>${b.name}</strong> — ${b.desc}`, true, "win");
    });
    bump();
    setView("select");
  }

  function start(m) {
    flags.current = { closing: false, conf: false, sweep: false };
    dragging.current = false;
    setMission(m); setView("sim"); setLog([]); setPaused(false); setSpeed(1);
    Sim.stopSize = stopSize;
    Sim.onUpdate = onUpdate;
    Sim.onLog = (msg, cls) => setLog((l) => [...l, { msg, cls }]);
    Sim.onEnd = (stats) => { Sound.play("bell"); finishMission(m, stats); };
    Sim.onTradeClose = (pnl, byStop) => {
      const c = chartRef.current;
      if (c) { FX.floatText(c, fmtKoin(pnl), pnl >= 0 ? "#3dff8e" : "#ff5a5a"); if (pnl >= 30) FX.confettiAt(c, 24); if (byStop) FX.shake(c); }
      Sound.play(byStop ? "shield" : pnl >= 0 ? "win" : "lose");
      if (Sim.stats.tradesClosed === 5) Sensei.react("overtrade", { emote: "warn" });
      else if (byStop) Sensei.react("shieldSave", { emote: "talk" });
      else if (pnl >= 30) Sensei.react("bigWin", { emote: "happy" });
      else if (pnl < 0) Sensei.react("smallLoss", { emote: "talk" });
    };
    Sim.onBigMove = () => { if (chartRef.current) FX.shake(chartRef.current); };
    Sim.onConfluence = () => {
      Sound.play("correct");
      const el = document.getElementById("sig-confluence"); if (el) FX.confettiAt(el, 12);
      if (!flags.current.conf) { flags.current.conf = true; Sensei.react("confluence", { emote: "happy" }); }
    };
    Sim.onSweep = () => {
      Sound.play("shield");
      if (chartRef.current) FX.shake(chartRef.current);
      if (!flags.current.sweep) { flags.current.sweep = true; Sensei.react("sweep", { emote: "warn" }); }
    };
    Sim.start(m, currentAsset());
    Sound.play("bell");
    Sim.log("✨ Tip: while a trade is open, you can <strong>drag the 🛡️ shield line</strong> on the chart — even up into profit to lock in Koins!", "info");
    onUpdate();
  }

  // chart pointer: crosshair hover + drag the stop-loss line
  useEffect(() => {
    const c = chartRef.current;
    if (view !== "sim" || !c) return;
    const toC = (cx, cy) => { const r = c.getBoundingClientRect(); return { x: (cx - r.left) * c.width / r.width, y: (cy - r.top) * c.height / r.height }; };
    const nearStop = (y) => Sim.position && Sim.position.stop !== null && Chart.layout && Math.abs(y - Chart.layout.y(Sim.position.stop)) < 14;
    const move = (cx, cy) => {
      const p = toC(cx, cy);
      if (dragging.current) {
        const L = Chart.layout;
        Sim.moveStop(L.hi - (p.y - L.padT) / (L.H - L.padT - L.padB) * (L.hi - L.lo));
        Chart.hover = null;
      } else { Chart.hover = p; c.style.cursor = nearStop(p.y) ? "ns-resize" : "crosshair"; }
      Chart.draw();
    };
    const press = (cx, cy) => { if (nearStop(toC(cx, cy).y)) dragging.current = true; };
    const release = () => { if (dragging.current && Sim.position) Sim.log(`🛡️ Shield moved to ${Sim.fmtP(Sim.position.stop)}.`, "info"); dragging.current = false; };
    const md = (e) => press(e.clientX, e.clientY);
    const mm = (e) => move(e.clientX, e.clientY);
    const ml = () => { if (!dragging.current) { Chart.hover = null; Chart.draw(); } };
    const ts = (e) => press(e.touches[0].clientX, e.touches[0].clientY);
    const tm = (e) => { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); };
    const te = () => { release(); Chart.hover = null; Chart.draw(); };
    c.addEventListener("mousedown", md);
    c.addEventListener("mousemove", mm);
    c.addEventListener("mouseleave", ml);
    window.addEventListener("mouseup", release);
    c.addEventListener("touchstart", ts, { passive: true });
    c.addEventListener("touchmove", tm, { passive: false });
    c.addEventListener("touchend", te);
    return () => {
      c.removeEventListener("mousedown", md); c.removeEventListener("mousemove", mm);
      c.removeEventListener("mouseleave", ml); window.removeEventListener("mouseup", release);
      c.removeEventListener("touchstart", ts); c.removeEventListener("touchmove", tm); c.removeEventListener("touchend", te);
    };
  }, [view]);

  function openTrade(dir) {
    Sim.openTrade(dir); Sound.play("open");
    if (Sim.position) {
      if (Sim.position.stop === null) Sensei.react("noShield", { emote: "warn" });
      else if (Sim.mission.strategy && !Sim.orComplete) Sensei.react("rangeWait", { emote: "warn" });
    }
    refresh();
  }
  function setStop(u) { Sim.stopSize = u; setStopSize(u); }
  function togglePause() { Sim.paused = !Sim.paused; setPaused(Sim.paused); }
  function cycleSpeed() { const s = Sim.speed === 1 ? 2 : Sim.speed === 2 ? 4 : 1; Sim.speed = s; setSpeed(s); }
  function quit() { Sim.quit(); setView("select"); bump(); }

  // ----- render -----
  if (view === "sim") {
    const s = Sim.stats || {};
    const open = Sim.openPnl ? Sim.openPnl() : 0;
    const totalDays = Sim.mission ? (Sim.mission.days || 1) : 1;
    const dayTag = totalDays > 1 ? `Day ${Math.min((s.daysDone || 0) + 1, totalDays)}/${totalDays} · ` : "";
    const sig = Sim.mission && Sim.mission.strategy ? Sim.signals() : null;
    const sigTxt = (d) => (d === 1 ? "LONG ▲" : d === -1 ? "SHORT ▼" : "—");
    const sigCls = (d) => (d === 1 ? "sig-long" : d === -1 ? "sig-short" : "");
    return (
      <section className="screen">
        <h2 className="screen-title">⚔️ Trading Dojo</h2>
        <div id="sim-area">
          <div className="sim-header">
            <div>
              <div className="sim-mission-name">{currentAsset().emoji} {currentAsset().code} · {mission.emoji} {mission.name}</div>
              <div className="sim-mission-goal">🎯 Goal: {mission.goal}</div>
            </div>
            <button className="ghost-btn" onClick={() => { Sound.play("click"); quit(); }}>✖ Quit Mission</button>
          </div>

          <div className="sim-stats">
            <div className="stat"><span className="stat-label">💰 Koins</span><span>{Math.round((s.balance || 0) + open)}</span></div>
            <div className="stat"><span className="stat-label">📈 Trade P&amp;L</span>
              <span id="sim-pnl" className={Sim.position ? (open >= 0 ? "up" : "down") : ""}>{Sim.position ? fmtKoin(open) : "no trade open"}</span></div>
            <div className="stat"><span className="stat-label">⏰ Market closes in</span><span>{Sim.running ? dayTag + Sim.candlesLeft() + " candles" : "CLOSED"}</span></div>
            <div className="stat"><span className="stat-label">🎯 Trades</span><span>{s.tradesClosed || 0}</span></div>
          </div>

          {sig && (
            <div id="signal-panel" className="sim-stats">
              <div className="stat signal"><span className="stat-label">🚪 Breakout</span><span className={sigCls(sig.breakout)}>{sigTxt(sig.breakout)}</span></div>
              <div className="stat signal"><span className="stat-label">🪜 Fresh Gap</span><span className={sigCls(sig.gap)}>{sigTxt(sig.gap)}</span></div>
              <div className="stat signal"><span className="stat-label">🧱 Wall Broken</span><span className={sigCls(sig.wall)}>{sigTxt(sig.wall)}</span></div>
              <div id="sig-confluence" className={"stat sig-conf" + (sig.conf !== 0 ? " on" : "")}><span className="stat-label">three clues align…</span><span>⚡ CONFLUENCE!</span></div>
            </div>
          )}

          <canvas id="chart" ref={chartRef} width="900" height="380" />

          <div className="sim-controls">
            <div className="ctrl-group">
              <span className="ctrl-label">🛡️ Stop-Loss shield:</span>
              <div className="seg" id="stop-seg">
                <button className={stopSize === 0 ? "active" : ""} onClick={() => setStop(0)}>None 😬</button>
                <button className={stopSize === 5 ? "active" : ""} onClick={() => setStop(5)}>{stopLabel(5)}</button>
                <button className={stopSize === 10 ? "active" : ""} onClick={() => setStop(10)}>{stopLabel(10)}</button>
              </div>
            </div>
            <div className="ctrl-group action-group">
              <motion.button className="trade-btn long" whileTap={{ scale: 0.94 }} disabled={!!Sim.position || !Sim.running} onClick={() => openTrade(1)}>▲ GO LONG<small>price will rise!</small></motion.button>
              <motion.button className="trade-btn short" whileTap={{ scale: 0.94 }} disabled={!!Sim.position || !Sim.running} onClick={() => openTrade(-1)}>▼ GO SHORT<small>price will fall!</small></motion.button>
              <motion.button className="trade-btn close" whileTap={{ scale: 0.94 }} disabled={!Sim.position} onClick={() => { Sim.closeTrade(); refresh(); }}>✋ CLOSE TRADE</motion.button>
            </div>
            <div className="ctrl-group">
              <button className="ghost-btn" onClick={togglePause}>{paused ? "▶ Resume" : "⏸ Pause"}</button>
              <button className="ghost-btn" onClick={cycleSpeed}>⏩ Speed: {speed}x</button>
            </div>
          </div>

          <div className="sim-log" ref={logRef}>
            {log.map((l, i) => <div key={i} className={l.cls || ""} dangerouslySetInnerHTML={{ __html: l.msg }} />)}
          </div>
        </div>
      </section>
    );
  }

  // mission-select view
  return (
    <section className="screen">
      <h2 className="screen-title">⚔️ Trading Dojo</h2>
      <div id="mission-select">
        <p className="screen-sub">Choose your beast and your mission, ninja! Finish story arcs to unlock more.</p>
        <div id="asset-picker">
          {Object.values(ASSETS).map((a) => (
            <button key={a.code} className={"asset-btn" + (Game.state.asset === a.code ? " selected" : "")}
              onClick={() => { Game.state.asset = a.code; Game.save(); bump(); Sensei.say(`${a.emoji} <strong>${a.code}</strong>, ${a.nickname}! ${a.desc}`, { once: "asset-" + a.code }); }}>
              <span className="asset-emoji">{a.emoji}</span>
              <span className="asset-body"><strong>{a.code}</strong> · {a.name}<small>{a.desc}</small></span>
            </button>
          ))}
        </div>
        <div id="mission-list">
          {MISSIONS.map((m) => {
            const unlocked = Game.missionUnlocked(m);
            const done = Game.state.missions[m.id];
            return (
              <motion.div key={m.id} className={"mission-card" + (unlocked ? "" : " locked")}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mission-emoji">{m.emoji}</div>
                <div className="mission-body">
                  <div className="mission-name">{m.name} {done && <span className="mission-done-tag">★ COMPLETED</span>}</div>
                  <div className="mission-goal">{unlocked ? m.goal : "🔒 Finish " + ARCS.find((a) => a.id === m.unlockArc).name.split(":")[0] + " quiz to unlock"}</div>
                </div>
                {unlocked && (
                  <motion.button className="big-btn small" whileTap={{ scale: 0.95 }} onClick={() => { Sound.play("click"); start(m); }}>
                    {done ? "Replay" : "Start!"}
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
