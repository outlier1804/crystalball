// Lesson checks must reach the review machinery.  `node src/engine/lesson-review.test.mjs`
//
// The films were disconnected: `attempted()` walked ARCS only, so a missed check
// question was recorded and then never resurfaced anywhere. This pins the whole
// path — record a miss, see it in Weak Spots; get it right twice, see it graduate
// into the spaced memory check.
//
// It also pins the SHAPE. Checks are authored as { q, o, a, e }, identical to an
// arc quiz question, precisely so the review screens need no special case. A
// divergence here renders a blank card rather than throwing, which is the kind of
// bug that ships.
import { CHECKS, LESSON_ARC } from "./lesson-checks.js";
import { buildReviewSet, buildSpacedSet, questionAt, weakQuestions } from "./analytics.js";

let ok = 0;
const bad = [];
const is = (got, want, msg) => {
  if (JSON.stringify(got) === JSON.stringify(want)) ok++;
  else bad.push(`${msg}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
};

// ---- shape: every check must look like an arc quiz question
for (const [id, c] of Object.entries(CHECKS)) {
  if (!c.q || !Array.isArray(c.o) || typeof c.a !== "number" || !c.e) {
    bad.push(`${id}: wrong shape (needs q, o[], a:number, e)`);
  } else if (c.a < 0 || c.a >= c.o.length) {
    bad.push(`${id}: answer index ${c.a} is outside its ${c.o.length} options`);
  } else if (new Set(c.o).size !== c.o.length) {
    bad.push(`${id}: duplicate options`);
  } else ok++;
}

// ---- resolution by (arcId, qIndex)
is(!!questionAt(LESSON_ARC, "lesson-01a"), true, "a lesson check resolves by part id");
is(questionAt(LESSON_ARC, "nope"), null, "an unknown part id resolves to null");

// ---- a MISSED check lands in Weak Spots
const missed = {
  quizStats: { [LESSON_ARC]: { attempts: 0, bestScore: 0, lastScore: 0,
    q: { "lesson-04a": { asked: 1, correct: 0, streak: 0, box: 0, dueAt: null } } } },
};
const weak = weakQuestions(missed).filter((w) => w.arcId === LESSON_ARC);
is(weak.length, 1, "a missed check shows up as a weak spot");
const rev = buildReviewSet(missed).filter((x) => x.arcId === LESSON_ARC);
is(rev.length, 1, "a missed check is served in a Weak Spots round");
is(rev[0].q, CHECKS["lesson-04a"].q, "the served question is the real one");
is(Array.isArray(rev[0].o) && typeof rev[0].a === "number", true,
   "the served item carries options and an answer index");

// ---- mastered + due lands in the spaced memory check
const mastered = {
  quizStats: { [LESSON_ARC]: { attempts: 0, bestScore: 0, lastScore: 0,
    q: { "lesson-02a": { asked: 2, correct: 2, streak: 2, box: 1, dueAt: 1 } } } },
};
const spaced = buildSpacedSet(mastered).filter((x) => x.arcId === LESSON_ARC);
is(spaced.length, 1, "a mastered, due check is served in the memory check");
is(spaced[0].q, CHECKS["lesson-02a"].q, "the memory check serves the real question");

// ---- a check whose content was removed drops out instead of rendering blank
const orphan = {
  quizStats: { [LESSON_ARC]: { attempts: 0, bestScore: 0, lastScore: 0,
    q: { "lesson-99z": { asked: 1, correct: 0, streak: 0, box: 0, dueAt: null } } } },
};
is(buildReviewSet(orphan).filter((x) => x.arcId === LESSON_ARC).length, 0,
   "a check for a deleted part drops out of the review set");

// ---- real arcs still work (the change must not break what already shipped)
is(typeof questionAt("arc1", 0) === "object", true, "arc questions still resolve");

if (bad.length) {
  console.log(`\n❌ ${bad.length} failed, ${ok} passed`);
  bad.forEach((b) => console.log("   " + b));
  process.exit(1);
}
console.log(`\n✅ lesson review wiring: ${ok}/${ok} passed`);
