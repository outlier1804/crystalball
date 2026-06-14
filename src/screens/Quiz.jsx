import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import { ARCS, BADGES, XP_REWARDS } from "../engine/data.js";
import { Sound } from "../engine/audio.js";
import { Speak } from "../engine/speech.js";
import { FX } from "../engine/fx.js";

export default function Quiz() {
  const { params, go, bump, popup } = useApp();
  const arc = ARCS.find((a) => a.id === params.arcId) || ARCS[0];
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState(null);
  const q = arc.quiz[idx];

  useEffect(() => {
    setPicked(null);
    if (Speak.on) Speak.say(q.q, { rate: 0.95, pitch: 1 });
  }, [arc.id, idx]);

  function answer(i, e) {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.a) {
      setCorrect((c) => c + 1);
      Sound.play("correct");
      if (e?.currentTarget) FX.confettiAt(e.currentTarget, 16);
    } else {
      Sound.play("wrong");
    }
  }

  function next() {
    if (idx < arc.quiz.length - 1) { setIdx(idx + 1); return; }
    const total = arc.quiz.length;
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
    go("map");
  }

  return (
    <section className="screen">
      <div className="quiz-card">
        <div className="lesson-arc-title">{arc.emoji} {arc.name} — Quiz</div>
        <div className="quiz-progress">Question {idx + 1} of {arc.quiz.length} · {correct} correct</div>
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
            {idx === arc.quiz.length - 1 ? "Finish quiz ⭐" : "Next ▶"}
          </motion.button>
        )}
      </div>
    </section>
  );
}
