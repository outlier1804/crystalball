import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import { Sound } from "../engine/audio.js";
import { ARCS } from "../engine/data.js";
import { overall, arcBreakdown, weakQuestions, recommendations, textReport,
  masterySummary, accuracyTrend, trendLabel, dueForReview } from "../engine/analytics.js";

export default function Report() {
  const { go } = useApp();
  const s = Game.state;
  const ov = overall(s);
  const ab = arcBreakdown(s);
  const weak = weakQuestions(s);
  const recs = recommendations(s);
  const r = s.record || {};
  const ms = masterySummary(s);
  const trend = accuracyTrend(s);
  const tl = trendLabel(trend);
  const due = dueForReview(s);
  const reflections = ARCS.filter((a) => s.reflections?.[a.id]?.text)
    .map((a) => ({ arc: a, ...s.reflections[a.id] }));
  const pct = (n) => (ms.total ? (n / ms.total) * 100 : 0);

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

      {/* spaced-repetition memory check */}
      {due.length > 0 && (
        <motion.div className="report-card memory-due" {...fade(0)}>
          <h3>🔁 Memory check due</h3>
          <p className="report-hint"><strong>{due.length}</strong> concept{due.length > 1 ? "s" : ""} he mastered earlier {due.length > 1 ? "are" : "is"} due for a quick check — spaced practice is how knowledge moves into long-term memory.</p>
          <button className="big-btn small" onClick={() => { Sound.play("open"); go("quiz", { spaced: true, back: "report" }); }}>
            🔁 Start memory check ({due.length})
          </button>
        </motion.div>
      )}

      {/* concept mastery */}
      <motion.div className="report-card" {...fade(1)}>
        <h3>🧠 Concept mastery</h3>
        <p className="report-hint">A concept only counts as <strong>mastered</strong> once he answers it correctly <strong>twice in a row</strong> — not just one lucky guess.</p>
        <div className="mastery-bar">
          {ms.mastered > 0 && <div className="mseg mastered" style={{ width: pct(ms.mastered) + "%" }} title="Mastered" />}
          {ms.learning > 0 && <div className="mseg learning" style={{ width: pct(ms.learning) + "%" }} title="Learning" />}
          {ms.needsWork > 0 && <div className="mseg needs" style={{ width: pct(ms.needsWork) + "%" }} title="Needs work" />}
          {ms.unseen > 0 && <div className="mseg unseen" style={{ width: pct(ms.unseen) + "%" }} title="Not seen" />}
        </div>
        <div className="mastery-legend">
          <span><i className="dot mastered" />🟢 Mastered {ms.mastered}</span>
          <span><i className="dot learning" />🟡 Learning {ms.learning}</span>
          <span><i className="dot needs" />🔴 Needs work {ms.needsWork}</span>
          <span><i className="dot unseen" />⚪ Not seen {ms.unseen}</span>
        </div>
      </motion.div>

      {/* accuracy trend */}
      <motion.div className="report-card" {...fade(2)}>
        <h3>📈 Accuracy over time</h3>
        {trend.length < 2 ? (
          <p className="report-hint">{tl.text}</p>
        ) : (
          <>
            <svg className="trend-spark" viewBox="0 0 300 70" preserveAspectRatio="none">
              <line x1="0" y1="35" x2="300" y2="35" stroke="#4a3d8f" strokeWidth="1" strokeDasharray="4 4" />
              <polyline fill="none" stroke={tl.dir === "down" ? "var(--red)" : "var(--green)"} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"
                points={trend.map((t, i) => `${(i / (trend.length - 1)) * 296 + 2},${68 - (t.pct / 100) * 64}`).join(" ")} />
              {trend.map((t, i) => (
                <circle key={i} cx={(i / (trend.length - 1)) * 296 + 2} cy={68 - (t.pct / 100) * 64} r="3" fill={tl.dir === "down" ? "var(--red)" : "var(--green)"} />
              ))}
            </svg>
            <div className="trend-label">{tl.text} <span className="trend-range">({trend[0].pct}% → {trend[trend.length - 1].pct}%, last {trend.length} quizzes)</span></div>
          </>
        )}
      </motion.div>

      {/* recommendations */}
      <motion.div className="report-card recs" {...fade(3)}>
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

      {/* reflections — in his own words */}
      <motion.div className="report-card" {...fade(5)}>
        <h3>💭 In his own words</h3>
        {reflections.length === 0 ? (
          <p className="report-hint">After each arc’s quiz, he’s asked to explain a concept in his own words. His answers will appear here — a great window into how well he really understands it.</p>
        ) : (
          <div className="reflect-list">
            {reflections.map((rf) => (
              <div key={rf.arc.id} className="reflect-item">
                <div className="reflect-arc">{rf.arc.emoji} {rf.arc.name.split(":")[0]}</div>
                <div className="reflect-prompt">{rf.arc.reflect}</div>
                <div className="reflect-text">“{rf.text}”</div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="report-actions">
        <button className="ghost-btn" onClick={() => { Sound.play("click"); download(); }}>⬇️ Download report (.txt)</button>
        <button className="ghost-btn" onClick={() => window.print()}>🖨️ Print</button>
      </div>
    </section>
  );
}
