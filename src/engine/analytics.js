// ====== Learning analytics: turn quiz stats into parent-friendly insights ======
import { ARCS, MISSIONS } from "./data.js";
import { CHECKS, LESSON_ARC } from "./lesson-checks.js";

// Lesson-film check questions live under a synthetic arc so the review machinery
// treats them like any other question. Without this they were recorded and never
// resurfaced: `attempted()` walked ARCS only, so a missed idea from a film could
// never come back in a Weak Spots round or a memory check.
const LESSON_ARC_META = { id: LESSON_ARC, name: "Trading lessons", emoji: "📚" };

/** Resolve a question by (arcId, qIndex) across both real arcs and lesson checks. */
export function questionAt(arcId, qIndex) {
  if (arcId === LESSON_ARC) return CHECKS[qIndex] || null;
  const arc = ARCS.find((a) => a.id === arcId);
  return arc ? arc.quiz[Number(qIndex)] : null;
}

function arcMetaFor(arcId) {
  if (arcId === LESSON_ARC) return LESSON_ARC_META;
  return ARCS.find((a) => a.id === arcId) || null;
}

// Shuffle a question's answer options and remap the correct index.
//
// Why this matters: mastery here is "got it right twice in a row", and mastered
// concepts come back via spaced repetition. If the options render in the authored
// order every time, the correct answer sits in the same slot on every retake,
// weak-spot drill and memory check — so a kid can score "mastered" by remembering
// "it's the third one" without recalling the concept at all. Shuffling forces the
// streak, the review schedule and the parent report to measure real recall.
//
// `qIndex` is untouched, so per-question stats still line up across attempts.
export function shuffleOptions(q) {
  const order = q.o.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    options: order.map((i) => q.o[i]),
    answer: order.indexOf(q.a),
    // shown index -> authored index, so per-distractor feedback still resolves
    toOriginal: order,
  };
}

// Feedback for the option he actually picked. Falls back to the question's
// single explanation when a distractor has no specific note written yet.
export function feedbackFor(q, originalIndex, isRight) {
  if (isRight) return q.e;
  const why = q.why?.[originalIndex];
  return why ? `${why} ${q.e}` : q.e;
}

// Mastery of one question, from its streak of consecutive correct answers.
// A concept only counts as "mastered" after he gets it right twice in a row.
export function masteryOf(qs) {
  if (!qs || !qs.asked) return "unseen";
  const streak = qs.streak != null ? qs.streak : (qs.correct === qs.asked ? qs.correct : 0);
  if (streak >= 2) return "mastered";
  if (streak === 1) return "learning";
  return "needs-work";
}

// All attempted questions with mastery + details
function attempted(state) {
  const out = [];
  for (const arc of [...ARCS, LESSON_ARC_META]) {
    const st = state.quizStats?.[arc.id];
    if (!st) continue;
    for (const [qi, qs] of Object.entries(st.q || {})) {
      if (!qs.asked) continue;
      // lesson checks are keyed by part id (a string), arc quizzes by index
      const isLesson = arc.id === LESSON_ARC;
      const q = isLesson ? CHECKS[qi] : arc.quiz[Number(qi)];
      if (!q) continue;
      out.push({
        arcId: arc.id, arcName: arc.name, arcEmoji: arc.emoji,
        qIndex: isLesson ? qi : Number(qi),
        question: q.q, answer: q.o[q.a], explanation: q.e,
        asked: qs.asked, correct: qs.correct, missed: qs.asked - qs.correct,
        streak: qs.streak != null ? qs.streak : 0, mastery: masteryOf(qs),
        dueAt: qs.dueAt ?? null, box: qs.box ?? 0,
      });
    }
  }
  return out;
}

// Concepts that still need work (last answer wrong / not yet started a streak)
export function weakQuestions(state) {
  return attempted(state)
    .filter((x) => x.mastery === "needs-work")
    .sort((a, b) => b.missed - a.missed || a.correct / a.asked - b.correct / b.asked);
}

// Not-yet-mastered (needs-work first, then learning) — what to drill toward mastery
export function notMastered(state) {
  const order = { "needs-work": 0, learning: 1 };
  return attempted(state)
    .filter((x) => x.mastery !== "mastered")
    .sort((a, b) => order[a.mastery] - order[b.mastery] || b.missed - a.missed);
}

// Counts of every quiz concept by mastery level
export function masterySummary(state) {
  let mastered = 0, learning = 0, needsWork = 0, unseen = 0, total = 0;
  for (const arc of ARCS) {
    const st = state.quizStats?.[arc.id];
    for (let qi = 0; qi < arc.quiz.length; qi++) {
      total++;
      const lvl = masteryOf(st?.q?.[qi]);
      if (lvl === "mastered") mastered++;
      else if (lvl === "learning") learning++;
      else if (lvl === "needs-work") needsWork++;
      else unseen++;
    }
  }
  return { mastered, learning, needsWork, unseen, total };
}

// Accuracy per quiz attempt over time (for the trend sparkline)
export function accuracyTrend(state, limit = 15) {
  return (state.quizHistory || [])
    .map((e) => ({ pct: e.total ? Math.round((e.score / e.total) * 100) : 0, at: e.at, arc: e.arc }))
    .slice(-limit);
}

export function trendLabel(trend) {
  if (!trend || trend.length < 2) return { text: "Take a few quizzes to see his trend.", dir: "flat" };
  const half = Math.floor(trend.length / 2);
  const avg = (a) => a.reduce((s, x) => s + x.pct, 0) / (a.length || 1);
  const diff = avg(trend.slice(half)) - avg(trend.slice(0, half));
  if (diff > 5) return { text: "📈 Improving — his scores are climbing!", dir: "up" };
  if (diff < -5) return { text: "📉 Slipping a bit — revisit recent lessons.", dir: "down" };
  return { text: "➡️ Steady — consistent scores.", dir: "flat" };
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

// Mastered concepts whose spaced-repetition review is now due (memory check)
export function dueForReview(state, now = Date.now()) {
  return attempted(state)
    .filter((x) => x.mastery === "mastered" && x.dueAt && x.dueAt <= now)
    .sort((a, b) => a.dueAt - b.dueAt);
}

// Build a memory-check quiz from the concepts due for review
export function buildSpacedSet(state, limit = 10) {
  return dueForReview(state).slice(0, limit).map((w) => {
    const arc = arcMetaFor(w.arcId);
    const q = questionAt(w.arcId, w.qIndex);
    if (!q) return null;
    return { arcId: w.arcId, qIndex: w.qIndex, arcName: arc?.name || "", ...q };
  // a question whose content was removed (a re-cut lesson, an edited arc) must
  // drop out rather than render as an undefined card
  }).filter(Boolean);
}

// A short list of questions to re-quiz (drives toward mastery)
export function buildReviewSet(state, limit = 8) {
  return notMastered(state).slice(0, limit).map((w) => {
    const arc = arcMetaFor(w.arcId);
    const q = questionAt(w.arcId, w.qIndex);
    if (!q) return null;
    return { arcId: w.arcId, qIndex: w.qIndex, arcName: arc?.name || "", ...q };
  // a question whose content was removed (a re-cut lesson, an edited arc) must
  // drop out rather than render as an undefined card
  }).filter(Boolean);
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
  const ms = masterySummary(state);
  L.push(`Concept mastery: ${ms.mastered} mastered, ${ms.learning} learning, ${ms.needsWork} need work, ${ms.unseen} not seen (of ${ms.total})`);
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
  L.push(`IN HIS OWN WORDS (reflections)`);
  const refl = state.reflections || {};
  const reflArcs = ARCS.filter((a) => refl[a.id]?.text);
  if (!reflArcs.length) L.push("  (none yet)");
  for (const a of reflArcs) {
    L.push(`  ${a.name.split(":")[0]}: "${refl[a.id].text}"`);
  }
  L.push("");
  L.push(`RECOMMENDATIONS`);
  for (const rec of recommendations(state)) L.push(`  • ${rec}`);
  return L.join("\n");
}


// ===================== time on task ==========================================
//
// Accuracy says whether he got there. Time says what it cost him — and the two
// disagree more often than not. A concept answered correctly but ground out over
// four rewatches is not mastered, and nothing else in this report can see that.
//
// Parent-facing only. A visible timer for a kid who already reads slowly puts a
// stopwatch on his weakest skill and makes "watch it again" feel expensive.

export const fmtMins = (ms) => {
  // Check the raw milliseconds, not the rounded minutes: Math.round(0.5) is 1, so
  // rounding first reported 30 seconds as "1 min". Small, but this card exists to
  // tell a parent what something actually cost — it must never round effort up.
  if ((ms || 0) < 60000) return "under a minute";
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
};

/** Minutes per day, most recent last. Drives the "is he actually showing up" read. */
export function timePerDay(state, days = 14) {
  const out = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ day: key, ms: state.timeDays?.[key] || 0 });
  }
  return out;
}

export function timeToday(state) {
  return state.timeDays?.[new Date().toISOString().slice(0, 10)] || 0;
}

export function timeTotal(state) {
  return Object.values(state.timeDays || {}).reduce((s, ms) => s + ms, 0);
}

/** Lesson parts ranked by how long he spent on them, with replay counts.
 *
 *  The headline is not the total — it is `replays`. A part watched once is a part
 *  he followed; a part watched four times is the exact place he is stuck, and it
 *  names itself without any test being administered. */
export function stickiestClips(state, limit = 6) {
  const out = [];
  for (const [key, e] of Object.entries(state.time || {})) {
    if (!key.startsWith("clip:")) continue;
    const id = key.slice(5);
    out.push({ id, ms: e.ms, views: e.n, replays: Math.max(0, e.n - 1) });
  }
  return out.sort((a, b) => b.ms - a.ms).slice(0, limit);
}

/** Foundations sessions ranked by time spent, paired with whether he passed.
 *
 *  Long AND passed is the interesting row: it is effort the score already hides. */
export function slowestSessions(state, limit = 6) {
  const out = [];
  for (const [key, e] of Object.entries(state.time || {})) {
    if (!key.startsWith("session:")) continue;
    const id = key.slice(8);
    const f = state.foundations?.[id];
    out.push({ id, ms: e.ms, sittings: e.n, passed: !!f?.passed, attempts: f?.attempts || 0 });
  }
  return out.sort((a, b) => b.ms - a.ms).slice(0, limit);
}

/** One plain sentence about effort, for a parent who will not read a chart. */
export function effortLabel(state) {
  const days = timePerDay(state, 7).filter((d) => d.ms > 0);
  const total = timePerDay(state, 7).reduce((s, d) => s + d.ms, 0);
  if (!days.length) return { text: "No time logged this week yet.", dir: "flat" };
  const avg = total / days.length;
  return {
    text: `${days.length} active day${days.length > 1 ? "s" : ""} this week, ` +
          `about ${fmtMins(avg)} each — ${fmtMins(total)} in total.`,
    dir: days.length >= 4 ? "up" : days.length >= 2 ? "flat" : "down",
  };
}
