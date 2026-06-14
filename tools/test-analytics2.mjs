import { masteryOf, masterySummary, accuracyTrend, trendLabel, weakQuestions, buildReviewSet } from "../src/engine/analytics.js";
console.log("masteryOf streak2:", masteryOf({asked:3,correct:3,streak:2}), "| streak1:", masteryOf({asked:2,correct:1,streak:1}), "| streak0:", masteryOf({asked:2,correct:1,streak:0}), "| unseen:", masteryOf(undefined));
const state = { arcs:{}, quizStats:{
  arc1:{q:{0:{asked:3,correct:3,streak:2},1:{asked:2,correct:0,streak:0},2:{asked:2,correct:1,streak:1}}},
}, quizHistory:[ {arc:'arc1',score:2,total:5,at:1},{arc:'arc1',score:3,total:5,at:2},{arc:'arc1',score:4,total:5,at:3} ] };
const ms = masterySummary(state);
console.log("mastery summary:", JSON.stringify(ms));
console.log("weak (needs-work only):", weakQuestions(state).length, "| review set (not-mastered):", buildReviewSet(state).length);
const tr = accuracyTrend(state); console.log("trend pts:", tr.map(t=>t.pct).join(","), "| label:", trendLabel(tr).dir, trendLabel(tr).text);
console.log("OK");
