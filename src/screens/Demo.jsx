import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import { demoFor } from "../engine/demos.js";
import { Voice } from "../engine/voice.js";
import { Speak } from "../engine/speech.js";
import { Sound } from "../engine/audio.js";
import { Rewards } from "../engine/rewards.js";
import MiniChart from "../components/MiniChart.jsx";

const DEMO_XP = 20;
const pick = (pair) => Voice.pick(pair[0], pair[1]);

// "Watch me do it", then "now you". See engine/demos.js for why this exists.
export default function Demo() {
  const { params, go, bump, popup } = useApp();
  const demo = useMemo(() => demoFor(params.id), [params.id]);
  const [phase, setPhase] = useState("watch");     // watch → try → result
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState(null);      // index into the shuffled options
  const started = useRef(Date.now());

  // shuffle each question's options once, remembering where the right one went
  const questions = useMemo(() => (demo ? demo.questions.map((q) => {
    const order = q.o.map((_, i) => i).sort(() => Math.random() - 0.5);
    return { ...q, order };
  }) : []), [demo]);

  const step = phase === "watch" ? demo?.steps[at] : null;
  const ques = phase === "try" ? questions[at] : null;
  const said = step ? pick(step.say) : ques ? pick(ques.q) : "";

  useEffect(() => { if (said && Speak.on) Speak.say(said); return () => Speak.stop(); }, [said]);
  useEffect(() => () => Game.recordTime("demo", params.id, Date.now() - started.current), []);

  if (!demo) { go("map"); return null; }

  function next() {
    Sound.play("click");
    if (phase === "watch") {
      if (at < demo.steps.length - 1) return setAt(at + 1);
      setPhase("try"); setAt(0); setPicked(null); return;
    }
    if (phase === "try") {
      if (at < questions.length - 1) { setAt(at + 1); setPicked(null); return; }
      setPhase("result"); return;
    }
  }

  function choose(k) {
    if (picked != null) return;
    setPicked(k);
    const right = ques.order[k] === ques.a;
    Sound.play(right ? "correct" : "wrong");
    const why = pick(ques.why[ques.order[k]]);
    if (Speak.on) Speak.say(why);
  }

  function finish() {
    const first = !Game.state.demos?.[demo.id];
    Game.state.demos = { ...(Game.state.demos || {}), [demo.id]: true };
    Game.save();
    Rewards.touchDay();
    Sound.play("powerup");
    if (first) {
      const rankUp = Game.addXp(DEMO_XP);
      popup("🎬", "Demo done!", `+${DEMO_XP} XP. Now go do it yourself in the Arena.`);
      if (rankUp) popup(rankUp.emoji, "RANK UP!", `You are now a <strong>${rankUp.name}</strong>!`, true, "levelup");
    }
    bump();
    go("map");
  }

  const e = demo.ending, d = demo.attempt;
  const total = phase === "watch" ? demo.steps.length : questions.length;

  return (
    <section className="demo">
      <div className="demo-head">
        <span className="demo-title">{demo.title}</span>
        <span className={"demo-phase" + (phase === "watch" ? " on" : "")}>1 · Watch</span>
        <span className={"demo-phase" + (phase !== "watch" ? " on" : "")}>2 · Your turn</span>
        <span className="demo-real">Real NQ data</span>
      </div>

      <div className="demo-chart">
        {phase === "watch" && <MiniChart bars={demo.watch.bars} shown={step.n} lines={step.lines} ring={step.ring} />}
        {phase === "try" && <MiniChart bars={d.bars} shown={ques.n} lines={ques.lines} ring={ques.ring} />}
        {phase === "result" && <MiniChart bars={d.bars} lines={[e.level, e.entry, e.stop, e.tgt]} ring={{ i: d.exit, price: d.win ? e.target : d.stop }} />}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={phase + at} className="demo-panel"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
          {phase === "watch" && (
            <>
              <p className="demo-say">{said}</p>
              <div className="demo-controls">
                <button className="quiet-btn" style={{ visibility: at ? "visible" : "hidden" }} onClick={() => setAt(at - 1)}>◀ Back</button>
                <span className="demo-count">{at + 1} / {total}</span>
                <button className="play-btn demo-next" onClick={next}>{at < total - 1 ? "Next ▶" : "My turn ▶"}</button>
              </div>
            </>
          )}

          {phase === "try" && (
            <>
              <p className="demo-say">{said}</p>
              <div className="demo-opts">
                {ques.order.map((orig, k) => {
                  const right = orig === ques.a, shown = picked != null;
                  return (
                    <button key={k} disabled={shown}
                      className={"demo-opt" + (shown && right ? " right" : "") + (shown && picked === k && !right ? " wrong" : "")}
                      onClick={() => choose(k)}>{ques.o[orig]}</button>
                  );
                })}
              </div>
              {picked != null && (
                <div className={"demo-why" + (ques.order[picked] === ques.a ? " good" : "")}>
                  {pick(ques.why[ques.order[picked]])}
                  {ques.order[picked] !== ques.a && <span className="demo-why-right"> The right move: <strong>{ques.o[ques.a]}</strong>.</span>}
                </div>
              )}
              <div className="demo-controls">
                <span className="demo-count">Decision {at + 1} of {total}</span>
                {picked != null && <button className="play-btn demo-next" onClick={next}>{at < total - 1 ? "Next ▶" : "See what happened ▶"}</button>}
              </div>
            </>
          )}

          {phase === "result" && (
            <>
              <p className="demo-say">
                {d.win
                  ? Voice.pick(`It ran to the target: +${(d.risk * 2).toLocaleString()} points, $${Math.round(d.risk * 4)} on one Micro. Level, closed candle, stop, wait — you just did all four.`,
                               `The trade reached its target: +${(d.risk * 2).toLocaleString()} points, $${Math.round(d.risk * 4)} per Micro contract.`)
                  : Voice.pick(`This one got stopped out: −${d.risk.toLocaleString()} points, $${Math.round(d.risk * 2)} on one Micro. You still did everything right. Good traders lose small, on purpose.`,
                               `This trade was stopped out: −${d.risk.toLocaleString()} points, $${Math.round(d.risk * 2)} per Micro contract. The process was correct; the loss was the planned size.`)}
              </p>
              <p className="demo-note">
                {Voice.pick("These mornings were picked because they are clear to learn from. Real days are messier, and plenty of them have no trade at all.",
                            "These mornings were selected in hindsight for clarity. Most days are less clean, and many offer no valid setup.")}
              </p>
              <div className="demo-controls">
                <button className="quiet-btn" onClick={() => { setPhase("watch"); setAt(0); setPicked(null); }}>↺ Watch it again</button>
                <button className="play-btn demo-next" onClick={finish}>Finish ⭐</button>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
