global.localStorage = { _d:{}, getItem(k){return this._d[k]||null}, setItem(k,v){this._d[k]=v}, removeItem(k){delete this._d[k]} };
const { Game } = await import("../src/engine/game.js");
const { dueForReview, buildSpacedSet, masteryOf } = await import("../src/engine/analytics.js");
Game.load();
// answer arc1 q0 correctly twice -> mastered + scheduled
Game.recordQuizAnswer("arc1", 0, true);
Game.recordQuizAnswer("arc1", 0, true);
const q = Game.state.quizStats.arc1.q[0];
console.log("after 2 correct:", "streak", q.streak, "box", q.box, "dueAt set:", !!q.dueAt, "mastery", masteryOf(q));
const days = (q.dueAt - Date.now())/86400000;
console.log("next review in ~days:", days.toFixed(1), "(expect ~3)");
console.log("due now:", dueForReview(Game.state).length, "(expect 0 — not due yet)");
// force it due in the past
Game.state.quizStats.arc1.q[0].dueAt = Date.now() - 1000;
console.log("after backdating dueAt -> due now:", dueForReview(Game.state).length, "(expect 1)");
const set = buildSpacedSet(Game.state);
console.log("spaced set:", set.length, "valid:", set.every(x=>x.arcId&&x.qIndex!=null&&Array.isArray(x.o)));
// missing it resets schedule
Game.recordQuizAnswer("arc1", 0, false);
const q2 = Game.state.quizStats.arc1.q[0];
console.log("after a miss: streak", q2.streak, "box", q2.box, "dueAt", q2.dueAt, "-> due now:", dueForReview(Game.state).length, "(expect 0)");
console.log("SPACED OK");
