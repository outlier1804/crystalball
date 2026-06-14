// ====== Learning analytics: turn quiz stats into parent-friendly insights ======
import { ARCS, MISSIONS } from "./data.js";

// Questions he has gotten wrong at least once (the comprehension gaps)
export function weakQuestions(state) {
  const out = [];
  for (const arc of ARCS) {
    const st = state.quizStats?.[arc.id];
    if (!st) continue;
    for (const [qi, qs] of Object.entries(st.q || {})) {
      if (qs.asked > 0 && qs.correct < qs.asked) {
        const q = arc.quiz[Number(qi)];
        if (!q) continue;
        out.push({
          arcId: arc.id, arcName: arc.name, arcEmoji: arc.emoji, qIndex: Number(qi),
          question: q.q, answer: q.o[q.a], explanation: q.e,
          asked: qs.asked, correct: qs.correct, missed: qs.asked - qs.correct,
        });
      }
    }
  }
  // worst first: most-missed, then lowest accuracy
  out.sort((a, b) => b.missed - a.missed || a.correct / a.asked - b.correct / b.asked);
  return out;
}

// Per-arc summary for the breakdown table
export function arcBreakdown(state) {
  return ARCS.map((arc, i) => {
    const prog = state.arcs?.[arc.id] || {};
    const st = state.quizStats?.[arc.id];
    const prevDone = i === 0 || !!state.arcs?.[ARCS[i - 1].id]?.quizDone;
    const best = st?.bestScore ?? prog.quizBest ?? 0;
    return {
      id: arc.id, name: arc.name, emoji: arc.emoji,
      unlocked: prevDone,
      lessonDone: !!prog.lessonDone,
      quizDone: !!prog.quizDone,
      best, total: arc.quiz.length,
      attempts: st?.attempts ?? 0,
      accuracy: arc.quiz.length ? Math.round((best / arc.quiz.length) * 100) : 0,
    };
  });
}

// Overall numbers
export function overall(state) {
  let asked = 0, correct = 0;
  for (const arc of ARCS) {
    const st = state.quizStats?.[arc.id];
    if (!st) continue;
    for (const qs of Object.values(st.q || {})) { asked += qs.asked; correct += qs.correct; }
  }
  const arcsDone = ARCS.filter(a => state.arcs?.[a.id]?.quizDone).length;
  const lessonsDone = ARCS.filter(a => state.arcs?.[a.id]?.lessonDone).length;
  const missionsDone = MISSIONS.filter(m => state.missions?.[m.id]).length;
  return {
    asked, correct,
    accuracy: asked ? Math.round((correct / asked) * 100) : 0,
    arcsDone, arcsTotal: ARCS.length,
    lessonsDone,
    missionsDone, missionsTotal: MISSIONS.length,
  };
}

// A short list of questions to re-quiz (the weak spots)
export function buildReviewSet(state, limit = 8) {
  return weakQuestions(state).slice(0, limit).map((w) => {
    const arc = ARCS.find((a) => a.id === w.arcId);
    const q = arc.quiz[w.qIndex];
    return { arcId: w.arcId, qIndex: w.qIndex, arcName: arc.name, ...q };
  });
}

// Plain-language guidance for the parent
export function recommendations(state) {
  const recs = [];
  const ab = arcBreakdown(state);
  const next = ab.find((a) => a.unlocked && (!a.lessonDone || !a.quizDone));
  if (next) {
    const part = !next.lessonDone ? "read the lesson" : "take the quiz";
    recs.push(`Keep going: ${next.name.split(":")[0]} — ${part} next.`);
  }
  const weak = weakQuestions(state);
  if (weak.length) {
    const arcs = [...new Set(weak.map((w) => w.arcName.split(":")[0]))];
    recs.push(`Re-teach ${weak.length} missed concept${weak.length > 1 ? "s" : ""} (mostly in ${arcs.slice(0, 2).join(", ")}), then tap “Practice weak spots”.`);
  }
  const ov = overall(state);
  if (ov.asked >= 5 && ov.accuracy < 70)
    recs.push("Quiz accuracy is below 70% — read the lessons together (turn on “Read to me”) before advancing.");
  if (ov.arcsDone >= 4 && ov.missionsDone === 0)
    recs.push("He’s learning the theory but hasn’t practiced in the Dojo — try a mission to cement it.");
  if (!recs.length) recs.push("Strong comprehension so far — keep up the great work! 🎉");
  return recs;
}

// A plain-text report the parent can save/print
export function textReport(state) {
  const ov = overall(state);
  const ab = arcBreakdown(state);
  const weak = weakQuestions(state);
  const L = [];
  L.push(`CANDLE QUEST ACADEMY — Parent Report`);
  L.push(`Trader: ${state.name || "—"}`);
  L.push(`Date: ${new Date().toLocaleString()}`);
  L.push("");
  L.push(`Arcs completed: ${ov.arcsDone}/${ov.arcsTotal}   Lessons: ${ov.lessonsDone}/${ov.arcsTotal}   Missions: ${ov.missionsDone}/${ov.missionsTotal}`);
  L.push(`Overall quiz accuracy: ${ov.accuracy}% (${ov.correct}/${ov.asked} answered correctly)`);
  L.push("");
  L.push(`PER-ARC BREAKDOWN`);
  for (const a of ab) {
    const status = !a.unlocked ? "locked" : !a.lessonDone ? "lesson not done"
      : !a.quizDone ? "quiz not taken" : `best ${a.best}/${a.total} (${a.accuracy}%), ${a.attempts} attempt(s)`;
    L.push(`  ${a.name} — ${status}`);
  }
  L.push("");
  L.push(`CONCEPTS TO REVIEW (${weak.length})`);
  if (!weak.length) L.push("  None — great comprehension!");
  for (const w of weak) {
    L.push(`  [${w.arcName.split(":")[0]}] missed ${w.missed}x`);
    L.push(`   Q: ${w.question}`);
    L.push(`   Correct answer: ${w.answer}`);
    L.push(`   Why: ${w.explanation}`);
  }
  L.push("");
  L.push(`TRADING DISCIPLINE`);
  const r = state.record || {};
  L.push(`  Dojo days: ${r.days || 0}   Green days: ${r.greenDays || 0}   Trades: ${r.trades || 0}   Best day: ${r.bestDay || 0} Koins`);
  L.push("");
  L.push(`RECOMMENDATIONS`);
  for (const rec of recommendations(state)) L.push(`  • ${rec}`);
  return L.join("\n");
}
