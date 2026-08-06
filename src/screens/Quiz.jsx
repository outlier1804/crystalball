import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import { ARCS, BADGES, XP_REWARDS } from "../engine/data.js";
import { buildReviewSet, buildSpacedSet, shuffleOptions, feedbackFor } from "../engine/analytics.js";
import { Sound } from "../engine/audio.js";
import { Speak } from "../engine/speech.js";
import { FX } from "../engine/fx.js";
import HelpButton from "../components/HelpButton.jsx";
import { localHelp } from "../engine/help.js";
import { Rewards } from "../engine/rewards.js";

export default function Quiz() {
  const { params, go, bump, popup, chest } = useApp();
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
  const [assisted, setAssisted] = useState(0);      // corrects that needed the 50/50
  const [picked, setPicked] = useState(null);
  const [eliminated, setEliminated] = useState([]); // shown indices greyed out by the 50/50
  const [usedFifty, setUsedFifty] = useState(false);
  const [reteach, setReteach] = useState(null);     // shown after a 2nd miss in a row
  const [combo, setCombo] = useState(0);            // consecutive corrects, resets on a miss
  const [comboXp, setComboXp] = useState(0);        // bonus XP earned from multipliers
  const q = items[idx];

  // In practice modes each question carries its own home arc; in a normal quiz
  // they all belong to `arc`. Help and re-teach need the ORIGINAL arc either way.
  const homeArc = practice ? (ARCS.find((a) => a.id === q?.arcId) || arc) : arc;

  // Fresh option order per question, so retakes/drills/memory checks can't be
  // passed by remembering the position of the right answer. Memoised on the
  // question itself so picking an answer never reshuffles under his finger.
  const view = useMemo(() => (q ? shuffleOptions(q) : null), [items, idx]);

  useEffect(() => {
    setPicked(null);
    setEliminated([]);
    setUsedFifty(false);
    setReteach(null);
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
    const isRight = i === view.answer;
    // record this answer against its original arc + question (drives mastery + report)
    const res = Game.recordQuizAnswer(practice ? q.arcId : arc.id, practice ? q.qIndex : idx, isRight);
    if (isRight) {
      setCorrect((c) => c + 1);
      if (usedFifty) setAssisted((a) => a + 1);

      // Combo: every unbroken answer raises the multiplier AND the pitch of the
      // chime. A quiz he's already passed is still worth retaking for the run.
      const link = usedFifty ? combo : combo + 1;   // hinted answers hold the combo, don't grow it
      setCombo(link);
      const mult = Rewards.comboMultiplier(link);
      if (mult > 1) {
        const bonus = Math.round(XP_REWARDS.quizCorrect * (mult - 1));
        setComboXp((x) => x + bonus);
      }
      Sound.play("correct");
      Sound.play("combo", link);
      if (e?.currentTarget) {
        FX.confettiAt(e.currentTarget, 16);
        const r = e.currentTarget.getBoundingClientRect();
        if (link >= 3) FX.stars(r.left + r.width / 2, r.top + r.height / 2, 10 + link * 2);
      }
      if (link === 3 || link === 5 || link === 7) {
        FX.comboPop(`${link}× COMBO`, Rewards.comboLabel(link));
        FX.flash(link >= 7 ? "#c89bff" : "#ffd34f", 380);
      }
      Rewards.count("correct", 1);
      Rewards.count("bestCombo", link);
    } else {
      Sound.play("wrong");
      if (combo >= 3) {
        Sound.play("comboBreak");
        const card = document.querySelector(".quiz-card");
        if (card) FX.shake(card);
      }
      setCombo(0);
      // Missed the SAME question twice running — stop and re-teach it. Letting him
      // grind to the end of a quiz he doesn't understand teaches him nothing except
      // that the buttons are a lottery.
      if (res.reteach) {
        setReteach({
          text: localHelp(homeArc.id, 0, q.e),
          lines: (homeArc.lessons || []).map((l) => l.t),
        });
      }
      // Third miss: this one isn't going to click on his own today.
      if (res.stuck) {
        Game.notifyStuck({ topicKey: homeArc.id, topicName: homeArc.name, question: q.q });
      }
    }
    // Read the feedback out loud too, not just the question — the explanation is
    // the part that actually teaches, and it's the densest text on the screen.
    if (Speak.on) {
      const fb = (isRight ? "Correct! " : "Not quite. ") + feedbackFor(q, view.toOriginal[i], isRight);
      setTimeout(() => Speak.say(fb, { pitch: 0.85, rate: 0.9 }), 400);
    }
  }

  // 50/50: drop the wrong options down to one and let him think again. Free to
  // use, always — it turns a dead end into a real choice between two ideas,
  // which is where the thinking actually happens.
  function fiftyFifty() {
    Sound.play("click");
    const wrong = view.options.map((_, i) => i).filter((i) => i !== view.answer);
    for (let i = wrong.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wrong[i], wrong[j]] = [wrong[j], wrong[i]];
    }
    setEliminated(wrong.slice(0, Math.max(1, view.options.length - 2)));
    setUsedFifty(true);
    setPicked(null);
    setReteach(null);
  }

  function next() {
    Speak.stop();
    if (idx < items.length - 1) { setIdx(idx + 1); return; }
    const total = items.length;
    Rewards.touchDay();
    if (spaced) Rewards.count("reviews", 1);
    if (comboXp > 0 && practice) Game.addXp(comboXp);
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
      popup(perfect ? "🌟" : "🧠", title, body, perfect, perfect ? "win" : undefined);
      go(back);
      return;
    }
    const had = Object.keys(Game.state.badges).filter((b) => Game.state.badges[b]);
    const rankUp = Game.completeQuiz(arc.id, correct, total, assisted);
    if (comboXp > 0) Game.addXp(comboXp);
    Rewards.touchDay();
    Rewards.count("quizzes", 1);
    bump();
    const perfect = correct === total && assisted === 0;
    popup(perfect ? "🎯" : "📝", perfect ? "PERFECT SCORE!" : "Quiz complete!",
      `You got <strong>${correct} / ${total}</strong>.` +
      (assisted ? ` (${assisted} with a hint — half XP, and completely fine.)` : "") +
      (comboXp > 0 ? ` <br/>🔥 Combo bonus: <strong>+${comboXp} XP</strong>` : "") +
      (perfect ? " Flawless, ninja!" : " You can retake it anytime to study!"), perfect, perfect ? "win" : undefined);
    chest(perfect ? "gold" : correct / total >= 0.8 ? "silver" : "wood",
      perfect ? "PERFECT — golden chest!" : "Quiz reward chest!");
    BADGES.forEach((b) => {
      if (Game.state.badges[b.id] && !had.includes(b.id))
        popup(b.emoji, "Badge earned!", `<strong>${b.name}</strong> — ${b.desc}`, true, "win");
    });
    if (rankUp) popup(rankUp.emoji, "RANK UP!", `You are now a <strong>${rankUp.name}</strong>!`, true, "levelup");
    go("reflect", { arcId: arc.id });   // "explain it back" for real comprehension
  }

  const title = spaced ? "🔁 Memory Check" : review ? "🎯 Practice — Weak Spots" : `${arc.emoji} ${arc.name} — Quiz`;
  const sub = practice ? (q.arcName ? q.arcName.split(":")[0] : "") : "";
  const wasRight = picked !== null && picked === view.answer;
  const canFifty = picked !== null && !wasRight && !usedFifty && view.options.length > 2;

  return (
    <section className="screen">
      <div className="quiz-card">
        <div className="lesson-arc-title">{title}</div>
        <div className="quiz-progress">
          Question {idx + 1} of {items.length} · {correct} correct{sub ? ` · ${sub}` : ""}
        </div>
        {combo >= 2 && (
          <motion.div className={"combo-meter c" + Math.min(combo, 7)}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            key={combo}>
            <span className="combo-flames">{"🔥".repeat(Math.min(4, Math.ceil(combo / 2)))}</span>
            <span className="combo-n">{combo}× COMBO</span>
            <span className="combo-mult">{Rewards.comboMultiplier(combo)}× XP</span>
          </motion.div>
        )}
        <div className="quiz-question">{q.q}</div>
        <div id="quiz-options">
          {view.options.map((text, i) => {
            const gone = eliminated.includes(i);
            let cls = "quiz-opt";
            if (gone) cls += " eliminated";
            if (picked !== null && i === view.answer) cls += " correct";
            else if (picked === i) cls += " wrong";
            return (
              <motion.button key={i} className={cls} disabled={picked !== null || gone}
                animate={gone ? { opacity: 0.25, scale: 0.98 } : { opacity: 1, scale: 1 }}
                whileHover={picked === null && !gone ? { x: 4 } : {}} whileTap={{ scale: 0.98 }}
                onClick={(e) => answer(i, e)}>
                {text}
              </motion.button>
            );
          })}
        </div>

        {picked !== null && (
          <motion.div className={"quiz-feedback " + (wasRight ? "good" : "bad")}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {wasRight ? (usedFifty ? "⭐ Correct — nice thinking! " : "⭐ Correct! ") : "💫 Not quite! "}
            {feedbackFor(q, view.toOriginal[picked], wasRight)}
          </motion.div>
        )}

        {/* Second miss in a row: back up and re-teach before going any further. */}
        <AnimatePresence>
          {reteach && (
            <motion.div className="reteach-panel"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <div className="reteach-head">🔄 Let's back up a step — this one's tricky.</div>
              <div className="reteach-text">{reteach.text}</div>
              {reteach.lines.length > 0 && (
                <details className="reteach-lesson">
                  <summary>📖 Re-read the lesson that taught this</summary>
                  <div className="reteach-lines">
                    {reteach.lines.map((t, i) => (
                      <p key={i} dangerouslySetInnerHTML={{ __html: t }} />
                    ))}
                  </div>
                </details>
              )}
              <button className="ghost-btn" onClick={() => {
                Sound.play("click");
                Speak.say(reteach.text, { pitch: 0.8, rate: 0.88 });
              }}>🔊 Read this to me</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help is available BEFORE answering too — being stuck up front is the
            most common kind of stuck, and it shouldn't need a wrong guess first. */}
        <HelpButton
          topic={homeArc.id}
          topicName={homeArc.name}
          question={q.q}
          options={view.options}
          correctAnswer={picked !== null ? q.o[q.a] : undefined}
          chosenAnswer={picked !== null && !wasRight ? view.options[picked] : undefined}
          fallback={q.e}
        />

        <div className="quiz-actions">
          {canFifty && (
            <motion.button className="big-btn small fifty-btn" whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={fiftyFifty}>
              ✂️ Try again — remove 2 wrong answers
            </motion.button>
          )}
          {picked !== null && (
            <motion.button className="big-btn small" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              whileTap={{ scale: 0.95 }} onClick={() => { Sound.play("click"); next(); }}>
              {reteach ? "Okay, I get it now ▶" : idx === items.length - 1 ? (review ? "Finish ⭐" : "Finish quiz ⭐") : "Next ▶"}
            </motion.button>
          )}
        </div>
      </div>
    </section>
  );
}
