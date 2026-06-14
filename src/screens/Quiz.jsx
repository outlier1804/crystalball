import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import { ARCS, BADGES, XP_REWARDS } from "../engine/data.js";
import { buildReviewSet, buildSpacedSet } from "../engine/analytics.js";
import { Sound } from "../engine/audio.js";
import { Speak } from "../engine/speech.js";
import { FX } from "../engine/fx.js";

export default function Quiz() {
  const { params, go, bump, popup } = useApp();
  const review = !!params.review;     // practice the not-yet-mastered weak spots
  const spaced = !!params.spaced;     // memory check: re-test mastered concepts that are due
  const practice = review || spaced;  // either way: don't re-complete an arc, just drill
  const back = params.back || (practice ? "report" : "map");
  const arc = ARCS.find((a) => a.id === params.arcId) || ARCS[0];
  const items = useMemo(
    () => (spaced ? buildSpacedSet(Game.state) : review ? buildReviewSet(Game.state) : arc.quiz),
    [review, spaced, arc.id]
  );

  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState(null);
  const q = items[idx];

  useEffect(() => {
    setPicked(null);
    if (q && Speak.on) Speak.say(q.q, { rate: 0.95, pitch: 1 });
  }, [arc.id, idx, review, spaced]);

  if (!q) {
    // practice modes launched with nothing to do
    return (
      <section className="screen">
        <div className="quiz-card">
          <div className="lesson-arc-title">{spaced ? "🔁 Memory Check" : "🎯 Practice — Weak Spots"}</div>
          <p>{spaced ? "Nothing due for review right now — his memory is fresh! 🧠" : "No missed questions to practice — nice comprehension! 🎉"}</p>
          <button className="big-btn small" onClick={() => go(back)}>◀ Back</button>
        </div>
      </section>
    );
  }

  function answer(i, e) {
    if (picked !== null) return;
    setPicked(i);
    const isRight = i === q.a;
    // record this answer against its original arc + question (drives mastery + report)
    Game.recordQuizAnswer(practice ? q.arcId : arc.id, practice ? q.qIndex : idx, isRight);
    if (isRight) {
      setCorrect((c) => c + 1);
      Sound.play("correct");
      if (e?.currentTarget) FX.confettiAt(e.currentTarget, 16);
    } else {
      Sound.play("wrong");
    }
  }

  function next() {
    if (idx < items.length - 1) { setIdx(idx + 1); return; }
    const total = items.length;
    if (practice) {
      bump();
      const perfect = correct === total;
      const title = spaced
        ? (perfect ? "🔁 MEMORY HELD!" : "🔁 Memory check done")
        : (perfect ? "🎯 WEAK SPOTS CLEARED!" : "📈 Practice complete!");
      const body = spaced
        ? `You remembered <strong>${correct} / ${total}</strong> from before.` +
          (perfect ? " It really stuck — true mastery!" : " The ones you missed will come back for another check soon.")
        : `You got <strong>${correct} / ${total}</strong> on your tricky questions.` +
          (perfect ? " Those concepts are sticking now!" : " Keep practicing — repetition builds real understanding.");
      popup(perfect ? "🌟" : "🧠", title, body, perfect);
      go(back);
      return;
    }
    const had = Object.keys(Game.state.badges).filter((b) => Game.state.badges[b]);
    const rankUp = Game.completeQuiz(arc.id, correct, total);
    bump();
    const perfect = correct === total;
    popup(perfect ? "🎯" : "📝", perfect ? "PERFECT SCORE!" : "Quiz complete!",
      `You got <strong>${correct} / ${total}</strong> (+${correct * XP_REWARDS.quizCorrect} XP).` +
      (perfect ? " Flawless, ninja!" : " You can retake it anytime to study!"), perfect);
    BADGES.forEach((b) => {
      if (Game.state.badges[b.id] && !had.includes(b.id))
        popup(b.emoji, "Badge earned!", `<strong>${b.name}</strong> — ${b.desc}`, true);
    });
    if (rankUp) popup(rankUp.emoji, "RANK UP!", `You are now a <strong>${rankUp.name}</strong>!`, true);
    go("reflect", { arcId: arc.id });   // "explain it back" for real comprehension
  }

  const title = spaced ? "🔁 Memory Check" : review ? "🎯 Practice — Weak Spots" : `${arc.emoji} ${arc.name} — Quiz`;
  const sub = practice ? (q.arcName ? q.arcName.split(":")[0] : "") : "";

  return (
    <section className="screen">
      <div className="quiz-card">
        <div className="lesson-arc-title">{title}</div>
        <div className="quiz-progress">
          Question {idx + 1} of {items.length} · {correct} correct{sub ? ` · ${sub}` : ""}
        </div>
        <div className="quiz-question">{q.q}</div>
        <div id="quiz-options">
          {q.o.map((text, i) => {
            let cls = "quiz-opt";
            if (picked !== null && i === q.a) cls += " correct";
            else if (picked === i) cls += " wrong";
            return (
              <motion.button key={i} className={cls} disabled={picked !== null}
                whileHover={picked === null ? { x: 4 } : {}} whileTap={{ scale: 0.98 }}
                onClick={(e) => answer(i, e)}>
                {text}
              </motion.button>
            );
          })}
        </div>
        {picked !== null && (
          <motion.div className={"quiz-feedback " + (picked === q.a ? "good" : "bad")}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {picked === q.a ? "⭐ Correct! " : "💫 Not quite! "}{q.e}
          </motion.div>
        )}
        {picked !== null && (
          <motion.button className="big-btn small" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            whileTap={{ scale: 0.95 }} onClick={() => { Sound.play("click"); next(); }}>
            {idx === items.length - 1 ? (review ? "Finish ⭐" : "Finish quiz ⭐") : "Next ▶"}
          </motion.button>
        )}
      </div>
    </section>
  );
}
