import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import { DRILLS, drillRight } from "../engine/drills.js";
import { TRAIN_AGAIN } from "../engine/episodes.js";
import { Voice } from "../engine/voice.js";
import { Speak } from "../engine/speech.js";
import { Sound } from "../engine/audio.js";
import { Rewards } from "../engine/rewards.js";
import { Passes } from "../engine/passes.js";
import { FX } from "../engine/fx.js";
import TapChart from "../components/TapChart.jsx";

/* A hands-on drill: every task is answered on the chart.
 *
 * A wrong tap is not the end of the task — the candle goes red, he looks again
 * and taps again. Finding it himself is the point. What counts is the first tap:
 * in the kid course, a task missed on the first tap comes round once more at the
 * end ("train again"), so he finishes having got every one right first time.
 */
export default function Drill() {
  const { params, go, bump, popup } = useApp();
  const drill = DRILLS[params.arcId];
  const [queue, setQueue] = useState(() => (drill ? drill.tasks.map((_, i) => i) : []));
  const [bad, setBad] = useState([]);
  const [found, setFound] = useState(null);     // index he got right
  const [firstTry, setFirstTry] = useState(0);
  const [again, setAgain] = useState(false);    // this task is a second go
  const [seen, setSeen] = useState(0);          // tasks shown so far, for the counter

  useEffect(() => { if (!drill) go("map"); }, []);
  useEffect(() => () => Speak.stop(), []);
  const ti = queue[0];
  const task = drill?.tasks[ti];
  useEffect(() => { if (task && Speak.on) Speak.say(task.q); }, [ti, seen]);

  if (!drill || !task) return null;   // also what this screen sees for a moment while it fades out
  const total = drill.tasks.length;

  function pick(i) {
    if (found !== null) return;
    if (drillRight(task, i)) {
      setFound(i);
      Sound.play("correct");
      // only the first meeting with a task can count as "right first time"
      if (!bad.length && !again) { setFirstTry((n) => n + 1); if (!Voice.adult) Passes.answer(`drill:${params.arcId}:${ti}`); }
      if (Speak.on) Speak.sayParts([bad.length ? "There it is." : "Correct!", task.e]);
    } else {
      setBad((b) => (b.includes(i) ? b : [...b, i]));
      Sound.play("wrong");
    }
  }

  function next(e) {
    Sound.play("click");
    Speak.stop();
    const missed = bad.length > 0;
    const rest = queue.slice(1);
    // kid course: a task missed on the first tap comes back once more at the end
    const q = missed && !Voice.adult && !again ? [...rest, ti] : rest;
    if (q.length) {
      setQueue(q); setBad([]); setFound(null); setSeen((n) => n + 1);
      // once the original tasks are used up, everything left is a second go
      setAgain(seen + 1 >= total);
      return;
    }
    const first = !Game.state.drills?.[params.arcId];
    Game.state.drills = { ...(Game.state.drills || {}), [params.arcId]: { firstTry, total, at: Date.now() } };
    Game.save();
    Rewards.touchDay();
    const rankUp = first ? Game.addXp(15) : null;
    if (e?.currentTarget) FX.confettiAt(e.currentTarget, 28);
    Sound.play("fanfare");
    popup("✋", Voice.pick("Hands-on done!", "Exercise complete"), `${firstTry} of ${total} right on the first tap.` + (first ? " +15 XP." : ""), firstTry === total);
    if (rankUp) popup(rankUp.emoji, "RANK UP!", `You are now a <strong>${rankUp.name}</strong>!`, true, "levelup");
    bump();
    go("map");
  }

  return (
    <section className="drill">
      <div className="battle-head">
        <span className="battle-title">✋ {drill.title}</span>
        <span className="battle-round-name">{again ? Voice.pick("Train again", "Second attempt") : `Task ${Math.min(seen + 1, total)} of ${total}`}</span>
      </div>

      <motion.div className="drill-q" key={ti + ":" + seen} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {again && !Voice.adult && <span className="drill-again">{TRAIN_AGAIN[seen % TRAIN_AGAIN.length].split(".")[0]}. </span>}
        {task.q}
      </motion.div>

      <div className="drill-chart">
        <TapChart bars={task.bars} lines={task.lines} pick={task.pick || "candle"} onPick={pick}
          good={found !== null ? (Array.isArray(task.a) ? task.a : [task.a]) : []} bad={bad} locked={found !== null} />
      </div>

      <div className="drill-foot">
        {found === null && bad.length === 0 && <div className="drill-hint">👆 {task.pick === "line" ? "Tap a line on the chart." : "Tap a candle on the chart."}</div>}
        {found === null && bad.length > 0 && <div className="quiz-feedback bad">💫 Not that one. Look again and tap another.</div>}
        {found !== null && <div className="quiz-feedback good">{bad.length ? "✅ There it is. " : "⭐ Yes! "}{task.e}</div>}
        {found !== null && <button className="play-btn battle-next" onClick={next}>{queue.length > 1 || (bad.length > 0 && !Voice.adult && !again) ? "Next ▶" : "Finish ⭐"}</button>}
      </div>
    </section>
  );
}
