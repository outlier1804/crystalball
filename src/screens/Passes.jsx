import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store.jsx";
import { Passes, Parent, POINTS, ANSWERS_PER_BONUS } from "../engine/passes.js";
import { Sound } from "../engine/audio.js";
import { FX } from "../engine/fx.js";

/* Game passes: what he has earned, and the parent's side of the deal.
 *
 * His half is simple — tickets, and a meter to the next one. A parent's half is
 * behind a 4-digit PIN: redeeming a pass, and the settings (how long a pass is
 * worth, how many a day, how fast new worlds open). Set the PIN before he plays.
 */
function PinPad({ title, hint, onOk, onCancel, check }) {
  const [pin, setPin] = useState("");
  const [bad, setBad] = useState(false);
  function press(d) {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next); setBad(false);
    if (next.length === 4) {
      if (!check || check(next)) { Sound.play("correct"); onOk(next); }
      else { Sound.play("wrong"); setBad(true); setTimeout(() => setPin(""), 500); }
    } else Sound.play("click");
  }
  return (
    <motion.div className="tcard-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel}>
      <motion.div className="pin-card" initial={{ scale: 0.8 }} animate={{ scale: 1 }} onClick={(e) => e.stopPropagation()}>
        <div className="pin-title">{title}</div>
        {hint && <div className="pin-hint">{hint}</div>}
        <div className={"pin-dots" + (bad ? " bad" : "")}>{[0, 1, 2, 3].map((i) => <span key={i} className={i < pin.length ? "on" : ""} />)}</div>
        {bad && <div className="pin-hint bad">That is not the PIN.</div>}
        <div className="pin-keys">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => <button key={d} onClick={() => press(String(d))}>{d}</button>)}
          <button className="pin-x" onClick={onCancel}>Cancel</button>
          <button onClick={() => press("0")}>0</button>
          <button className="pin-x" onClick={() => setPin(pin.slice(0, -1))}>⌫</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const when = (t) => new Date(t).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export default function PassesScreen() {
  const { bump } = useApp();
  const [ask, setAsk] = useState(null);         // { kind: "redeem", id } | { kind: "parent" } | { kind: "setup", then }
  const [parent, setParent] = useState(false);  // the parent panel is unlocked
  const [, force] = useState(0);
  const cfg = Parent.get();
  const b = Passes.state();
  const ready = Passes.ready();
  const pct = Math.min(100, (b.points / cfg.pointsPerPass) * 100);
  const capped = Passes.mintedToday() >= cfg.maxPassesPerDay;

  function needPin(then) {
    if (!Parent.hasPin()) setAsk({ kind: "setup", then });
    else setAsk({ kind: "check", then });
  }
  function redeem(id, e) {
    const el = e.currentTarget;
    needPin(() => { Passes.redeem(id); if (el) FX.confettiAt(el, 30); Sound.play("fanfare"); bump(); force((n) => n + 1); });
  }
  function setNum(key, v, lo, hi) {
    Parent.set({ [key]: Math.max(lo, Math.min(hi, Math.round(Number(v) || lo))) });
    force((n) => n + 1); bump();
  }

  return (
    <section className="passes-screen">
      <header className="page-head">
        <h1>🎮 Game Passes</h1>
        <p>Train, earn points, turn them into game time. Bring a pass to a parent to use it.</p>
      </header>

      <div className="pass-meter-card">
        <div className="pass-meter-top">
          <strong>{b.points} / {cfg.pointsPerPass} points</strong>
          <span>{capped ? "Today's passes are all earned. Extra points count toward tomorrow." : `to your next ${cfg.passMin}-minute pass`}</span>
        </div>
        <div className="pass-bar"><span style={{ width: pct + "%" }} /></div>
        <ul className="pass-how">
          <li><b>+{POINTS.step}</b> every new step you finish on the path</li>
          <li><b>+{POINTS.review}</b> a memory check or weak-spots round at 80% or better</li>
          <li><b>+{POINTS.arena}</b> an Arena practice day with a stop-loss on every trade</li>
          <li><b>+{POINTS.answers}</b> every {ANSWERS_PER_BONUS} different questions you get right in a day</li>
        </ul>
      </div>

      <h2 className="pass-h">Ready to use {ready.length > 0 && <span className="gap-count">{ready.length}</span>}</h2>
      {ready.length === 0 ? (
        <p className="pass-empty">No passes yet. Three new steps is about one pass.</p>
      ) : (
        <div className="pass-list">
          {ready.map((p) => (
            <motion.div key={p.id} className="pass-ticket" initial={{ scale: 0.9, rotate: -2 }} animate={{ scale: 1, rotate: 0 }}>
              <div className="pass-ticket-main">
                <span className="pass-min">{p.mins}</span>
                <span className="pass-min-l">minutes<br />game time</span>
              </div>
              <div className="pass-ticket-side">
                <span className="pass-code">#{p.id}</span>
                <span className="pass-date">earned {when(p.at)}</span>
                <button className="big-btn small" onClick={(e) => { Sound.play("click"); redeem(p.id, e); }}>Parent: redeem</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="pass-parent">
        {!parent ? (
          <button className="quiet-btn" onClick={() => { Sound.play("click"); needPin(() => setParent(true)); }}>
            🔒 Parents: settings and history
          </button>
        ) : (
          <div className="pass-parent-panel">
            <h2 className="pass-h">For parents</h2>
            <p className="report-hint">Used today: <strong>{Passes.minutesRedeemedToday()} min</strong> · Earned today: {Passes.mintedToday()} of {cfg.maxPassesPerDay} passes · Waiting to be used: {ready.length}</p>
            <div className="pass-settings">
              <label>Minutes per pass<input type="number" min="5" max="60" value={cfg.passMin} onChange={(e) => setNum("passMin", e.target.value, 5, 60)} /></label>
              <label>Points for one pass<input type="number" min="10" max="200" value={cfg.pointsPerPass} onChange={(e) => setNum("pointsPerPass", e.target.value, 10, 200)} /></label>
              <label>Most passes in a day<input type="number" min="1" max="12" value={cfg.maxPassesPerDay} onChange={(e) => setNum("maxPassesPerDay", e.target.value, 1, 12)} /></label>
              <label>New worlds he can open per day<input type="number" min="1" max="17" value={cfg.worldsPerDay} onChange={(e) => setNum("worldsPerDay", e.target.value, 1, 17)} /></label>
            </div>
            <p className="report-hint">A new step is {POINTS.step} points, so {Math.ceil(cfg.pointsPerPass / POINTS.step)} steps (about {Math.ceil(cfg.pointsPerPass / POINTS.step) * 10} minutes of work) earn {cfg.passMin} minutes. New worlds are limited per day so the course cannot be rushed; the rest of his time goes to the Arena and memory checks, which also earn points.</p>
            <h3 className="pass-h3">Used passes</h3>
            {Passes.redeemed().length === 0 ? <p className="report-hint">None yet.</p> : (
              <ul className="pass-history">
                {Passes.redeemed().slice(0, 20).map((p) => <li key={p.id + p.at}>#{p.id} · {p.mins} min · used {when(p.redeemedAt)}</li>)}
              </ul>
            )}
            <h3 className="pass-h3">How he earned points lately</h3>
            <ul className="pass-history">
              {b.log.length === 0 ? <li>Nothing yet.</li> : b.log.slice(0, 12).map((l, i) => <li key={i}>+{l.n} · {l.why} · {when(l.at)}</li>)}
            </ul>
            <button className="quiet-btn" onClick={() => setAsk({ kind: "setup", then: () => {} })}>Change the PIN</button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {ask?.kind === "check" && (
          <PinPad title="Parent PIN" hint="Hand the device to a parent." check={(pin) => Parent.check(pin)}
            onOk={() => { const t = ask.then; setAsk(null); t(); }} onCancel={() => setAsk(null)} />
        )}
        {ask?.kind === "setup" && (
          <PinPad title="Parents: choose a 4-digit PIN" hint="You will need it to redeem passes. Do not share it."
            onOk={(pin) => { Parent.setPin(pin); const t = ask.then; setAsk(null); t(); }} onCancel={() => setAsk(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
