import { useEffect, useState } from "react";
import { useApp } from "../store.jsx";
import { Game, Profiles } from "../engine/game.js";
import { Sync } from "../engine/sync.js";
import { Voice } from "../engine/voice.js";
import { overall, firstTry, readiness, minutesToday, weeklyNote, weakQuestions } from "../engine/analytics.js";
import { dayKey } from "../engine/passes.js";

/* The parent's side of online progress: opened from the family link on a
 * parent's own phone. One card per player with today's numbers, and the full
 * report behind it. Read-only — nothing here writes to the child's device. */
const ago = (t) => {
  const m = Math.round((Date.now() - t) / 60000);
  return m < 2 ? "just now" : m < 60 ? `${m} minutes ago` : m < 1440 ? `${Math.round(m / 60)} hours ago` : `${Math.round(m / 1440)} days ago`;
};

export default function Watch() {
  const { go } = useApp();
  const [res, setRes] = useState(null);     // null = loading
  const load = () => { setRes(null); Sync.fetchFamily().then(setRes); };
  useEffect(() => { Voice.set(Profiles.active()?.mode); load(); }, []);
  const hasGame = !!Game.state.name;

  function open(p, state) {
    Voice.set(p.mode);   // his questions are worded for his course
    go("report", { view: { state, savedAt: p.savedAt, log: p.log } });
  }

  return (
    <section className="screen watch">
      <div className="report-head">
        <h2 className="screen-title">👀 Family progress</h2>
        <button className="ghost-btn" onClick={load}>↻ Refresh</button>
      </div>

      {res === null && <p className="report-hint">Loading…</p>}
      {res && !res.ok && (
        <div className="report-card">
          <h3>Nothing to show yet</h3>
          <p className="report-hint">{res.reason === "no-key"
            ? "This device has no family link. On the device your child plays on, open Game Passes → Parents → “See progress on your phone”, and send yourself the link."
            : "The progress could not be loaded. Check the internet connection and tap Refresh."}</p>
        </div>
      )}
      {res?.ok && res.people.length === 0 && (
        <div className="report-card">
          <h3>Nothing has been sent yet</h3>
          <p className="report-hint">Progress is sent from the child's device a few seconds after they play. Open the game there once, then tap Refresh.</p>
        </div>
      )}

      {res?.ok && res.people.map((p) => {
        const s = Object.assign(Game.defaultState(), p.save);
        const ov = overall(s), ft = firstTry(s), rd = readiness(s);
        const week = weeklyNote(s).total;   // minutes, from the same active clock as today's
        const list = Array.isArray(s.pass?.list) ? s.pass.list : [];
        const today = dayKey();
        const earnedToday = list.filter((x) => dayKey(new Date(x.at)) === today).length;
        const usedToday = list.filter((x) => x.redeemedAt && dayKey(new Date(x.redeemedAt)) === today).reduce((n, x) => n + x.mins, 0);
        const waiting = list.filter((x) => !x.redeemedAt);
        const weak = weakQuestions(s).length;
        return (
          <div key={p.device + p.id} className="report-card watch-card">
            <h3>{p.name} <span className="watch-mode">{p.mode === "adult" ? "adult course" : "kid course"}</span></h3>
            <p className="report-hint">Last sent {ago(p.savedAt)}</p>
            <div className="report-summary">
              <div className="rstat"><span className="rstat-num">{minutesToday(s)}m</span><span className="rstat-label">Active today</span></div>
              <div className="rstat"><span className="rstat-num">{week}m</span><span className="rstat-label">Last 7 days</span></div>
              <div className="rstat"><span className="rstat-num">{ov.arcsDone}/{ov.arcsTotal}</span><span className="rstat-label">Worlds passed</span></div>
              <div className="rstat"><span className="rstat-num">{ft.pct === null ? "—" : ft.pct + "%"}</span><span className="rstat-label">Right the first time</span></div>
              <div className="rstat"><span className="rstat-num">{rd.pct}%</span><span className="rstat-label">Ready for paper trading</span></div>
              <div className="rstat"><span className="rstat-num">{weak}</span><span className="rstat-label">Questions to review</span></div>
            </div>
            {p.mode !== "adult" && (
              <p className="report-hint">🎮 Game passes: <strong>{waiting.length}</strong> waiting to be used ({waiting.reduce((n, x) => n + x.mins, 0)} min) · earned today {earnedToday} of {p.settings.maxPassesPerDay ?? "?"} · used today {usedToday} min · {s.pass?.points || 0} points toward the next one</p>
            )}
            <button className="big-btn small" onClick={() => open(p, s)}>Open the full report</button>
          </div>
        );
      })}

      <div className="report-actions">
        {hasGame && <button className="ghost-btn" onClick={() => go("map")}>◀ Back to the game</button>}
        {!hasGame && <button className="ghost-btn" onClick={() => go("welcome")}>Play the game on this device</button>}
        <button className="ghost-btn danger" onClick={() => { if (confirm("Stop viewing family progress on this device? You can open the link again later.")) { Sync.forget(); go(hasGame ? "map" : "welcome"); } }}>Remove from this device</button>
      </div>
    </section>
  );
}
