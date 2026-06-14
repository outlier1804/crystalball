import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import { Sound } from "../engine/audio.js";
import { overall, arcBreakdown, weakQuestions, recommendations, textReport } from "../engine/analytics.js";

export default function Report() {
  const { go } = useApp();
  const s = Game.state;
  const ov = overall(s);
  const ab = arcBreakdown(s);
  const weak = weakQuestions(s);
  const recs = recommendations(s);
  const r = s.record || {};

  function download() {
    const blob = new Blob([textReport(s)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candle-quest-report-${(s.name || "trader").replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const fade = (i = 0) => ({
    initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05 },
  });

  return (
    <section className="screen">
      <div className="report-head">
        <h2 className="screen-title">📊 Parent Report{s.name ? ` — ${s.name}` : ""}</h2>
        <button className="ghost-btn" onClick={() => { Sound.play("click"); go("profile"); }}>◀ Back</button>
      </div>
      <p className="screen-sub">See exactly where he’s solid and where he needs help — so you can teach the gaps, not just the score.</p>

      {/* summary */}
      <motion.div className="report-summary" {...fade(0)}>
        <div className="rstat"><span className="rstat-num">{ov.accuracy}%</span><span className="rstat-label">Quiz accuracy</span></div>
        <div className="rstat"><span className="rstat-num">{ov.arcsDone}/{ov.arcsTotal}</span><span className="rstat-label">Arcs completed</span></div>
        <div className="rstat"><span className="rstat-num">{ov.lessonsDone}/{ov.arcsTotal}</span><span className="rstat-label">Lessons read</span></div>
        <div className="rstat"><span className="rstat-num">{ov.missionsDone}/{ov.missionsTotal}</span><span className="rstat-label">Dojo missions</span></div>
      </motion.div>

      {/* recommendations */}
      <motion.div className="report-card recs" {...fade(1)}>
        <h3>🧭 What to do next</h3>
        <ul>{recs.map((t, i) => <li key={i}>{t}</li>)}</ul>
      </motion.div>

      {/* concepts to review */}
      <motion.div className="report-card" {...fade(2)}>
        <h3>🔍 Concepts to review {weak.length > 0 && <span className="gap-count">{weak.length}</span>}</h3>
        {weak.length === 0 ? (
          <p className="all-good">✅ No gaps yet — every quiz question he’s answered, he got right. Great comprehension!</p>
        ) : (
          <>
            <p className="report-hint">These are the exact questions he’s missed. Re-read them together — the answer &amp; the “why” are shown so you can teach it.</p>
            <div className="gap-list">
              {weak.map((w, i) => (
                <div key={i} className="gap-item">
                  <div className="gap-top">
                    <span className="gap-arc">{w.arcEmoji} {w.arcName.split(":")[0]}</span>
                    <span className="gap-missed">missed {w.missed}×</span>
                  </div>
                  <div className="gap-q">❓ {w.question}</div>
                  <div className="gap-a">✅ {w.answer}</div>
                  <div className="gap-why">💡 {w.explanation}</div>
                </div>
              ))}
            </div>
            <button className="big-btn small" onClick={() => { Sound.play("open"); go("quiz", { review: true }); }}>
              🎯 Practice these weak spots
            </button>
          </>
        )}
      </motion.div>

      {/* per-arc breakdown */}
      <motion.div className="report-card" {...fade(3)}>
        <h3>📚 Arc-by-arc</h3>
        <div className="arc-rows">
          {ab.map((a) => (
            <div key={a.id} className={"arc-row" + (a.unlocked ? "" : " locked")}>
              <span className="ar-name">{a.emoji} {a.name.split(":").slice(1).join(":").trim() || a.name}</span>
              <span className="ar-status">
                {!a.unlocked ? "🔒 locked"
                  : !a.lessonDone ? "lesson not read"
                  : !a.quizDone ? "quiz not taken"
                  : <>
                      <span className="ar-bar"><span className="ar-fill" style={{ width: a.accuracy + "%", background: a.accuracy >= 80 ? "var(--green)" : a.accuracy >= 50 ? "var(--gold)" : "var(--red)" }} /></span>
                      {a.best}/{a.total} · {a.attempts} try{a.attempts === 1 ? "" : "s"}
                    </>}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* discipline */}
      <motion.div className="report-card" {...fade(4)}>
        <h3>⚔️ Trading discipline (Dojo)</h3>
        <div className="report-summary">
          <div className="rstat"><span className="rstat-num">{r.days || 0}</span><span className="rstat-label">Dojo days</span></div>
          <div className="rstat"><span className="rstat-num">{r.greenDays || 0}</span><span className="rstat-label">Profitable days</span></div>
          <div className="rstat"><span className="rstat-num">{r.trades || 0}</span><span className="rstat-label">Trades made</span></div>
          <div className="rstat"><span className="rstat-num">{r.bestDay > 0 ? "+" + r.bestDay : "—"}</span><span className="rstat-label">Best day (Koins)</span></div>
        </div>
      </motion.div>

      <div className="report-actions">
        <button className="ghost-btn" onClick={() => { Sound.play("click"); download(); }}>⬇️ Download report (.txt)</button>
        <button className="ghost-btn" onClick={() => window.print()}>🖨️ Print</button>
      </div>
    </section>
  );
}
