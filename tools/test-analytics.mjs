import { weakQuestions, overall, buildReviewSet, recommendations } from "../src/engine/analytics.js";
const state = {
  name:"Maya",
  arcs:{ arc1:{lessonDone:true,quizDone:true,quizBest:3}, arc2:{lessonDone:true,quizDone:true,quizBest:4}, arc3:{lessonDone:true,quizDone:true,quizBest:5}, arc4:{lessonDone:true,quizDone:true,quizBest:3} },
  missions:{}, badges:{}, record:{days:2,greenDays:1,trades:5,bestDay:40},
  quizStats:{
    arc1:{attempts:2,bestScore:3,lastScore:3,q:{0:{asked:2,correct:2},1:{asked:2,correct:0},2:{asked:2,correct:1},3:{asked:2,correct:2},4:{asked:2,correct:2}}},
    arc4:{attempts:1,bestScore:3,lastScore:3,q:{0:{asked:1,correct:0},1:{asked:1,correct:1},2:{asked:1,correct:1},3:{asked:1,correct:0},4:{asked:1,correct:1}}},
  },
};
const weak = weakQuestions(state);
console.log("weak questions:", weak.length, "| worst:", weak[0].arcName.split(":")[0], "missed", weak[0].missed);
console.log("worst-first ordering ok:", weak[0].missed >= weak[weak.length-1].missed);
const ov = overall(state);
console.log("overall accuracy:", ov.accuracy+"%", "("+ov.correct+"/"+ov.asked+")", "| arcsDone", ov.arcsDone);
const rs = buildReviewSet(state);
console.log("review set size:", rs.length, "| valid items:", rs.every(x=>x.arcId&&x.qIndex!=null&&Array.isArray(x.o)));
console.log("recommendations:", recommendations(state).length);
console.log("ANALYTICS OK");
