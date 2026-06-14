import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store.jsx";
import { Sound } from "../engine/audio.js";
import { FX } from "../engine/fx.js";

// Dad's B.R.E.A.D decision tree, walkable node by node.
const NODES = {
  pregame: { letter: "B", emoji: "👑", title: "B — Behavior (higher timeframe is KING)",
    text: "You read the 4h/1h, marked your GOAL, and set alerts. Remember Dad's rules: no alert = no trade, and only the highs &amp; lows — never the middle.",
    q: "Did your alert go off at a 4h/1h <strong>HIGH or LOW</strong> (or a retest), in the higher-timeframe direction?", yes: "respect", no: "notrade" },
  respect: { letter: "R", emoji: "🛡️", title: "R — Respect the level",
    text: "Only RESPECTED levels matter. A level is respected if, when it formed, price made a <em>fair value gap</em> AND closed a <strong>body</strong> beyond the last swing.",
    q: "Is this a <strong>RESPECTED</strong> level (not one price will run straight through)?", yes: "align", no: "notrade" },
  align: { letter: "A", emoji: "⚖️", title: "A — Alignment (two timeframes agree)",
    text: "At least a higher and a lower timeframe, pointing the SAME way. The 2-minute alone can fool you.",
    q: "Do you have <strong>CONFLUENCE</strong> — does the higher timeframe agree with your plan?", yes: "execute", no: "notrade" },
  execute: { letter: "E", emoji: "✨", title: "E — Execution trigger",
    text: "Dad's favorite: price sweeps the high/low, gets a little gas, then can't close beyond — it FAILS to do something new. Forget the first move; get the second.",
    q: "Did price <strong>sweep</strong> your level and then <strong>FAIL to do something new</strong>?", yes: "enter", no: "notrade" },
  enter: { letter: "E", emoji: "🎯", kind: "go", title: "ENTER ON THE CLOSE — play the REVERSE!",
    text: "All gates passed. Strike when the candle <em>closes</em> the way your plan expects, and play it back the other way. Put your stop <strong>beyond the structure</strong> (where price shouldn't return). Never chase — price always comes back for you.",
    next: "manage", nextLabel: "Manage the trade ▶" },
  manage: { letter: "D", emoji: "🤝", title: "D — Discipline (manage it)",
    text: "Let price get AWAY from your entry, then slide your stop to safety. Re-check the higher timeframe every new hour.",
    q: "Is your plan <strong>STILL valid</strong> — and are you under your 3-trade limit?", yes: "hold", no: "exit" },
  hold: { letter: "D", emoji: "🟢", kind: "go", title: "HOLD toward the GOAL",
    text: "Let it run toward your goal. Don't babysit every candle — check in now and then, and re-run the checklist each new hour.", restart: true },
  exit: { letter: "D", emoji: "🟡", kind: "warn", title: "PLAN YOUR EXIT",
    text: "The plan is no longer valid — or you've hit 3 trades. No hoping, no “it'll come back.” Protect your Koins and step away.", restart: true },
  notrade: { letter: "D", emoji: "🚫", kind: "stop", title: "NO TRADE",
    text: "And that's a <strong>winning move</strong>, ninja. One NO = no trade. Most of the day the answer IS no — wait for the next clean setup. 🍞", restart: true },
};
const LETTERS = ["B", "R", "E", "A", "D"];

export default function Playbook() {
  const { go } = useApp();
  const [id, setId] = useState("pregame");
  const [trail, setTrail] = useState([]); // ids of passed gates for the breadcrumb
  const node = NODES[id];

  function goTo(nextId, gatePassed) {
    if (gatePassed) setTrail((t) => [...t, id]);
    const next = NODES[nextId];
    Sound.play(next.kind === "stop" || next.kind === "warn" ? "lose" : next.kind === "go" ? "win" : "open");
    if (next.kind === "go") setTimeout(() => { const el = document.querySelector(".pb-node"); if (el) FX.confettiAt(el, 30); }, 120);
    setId(nextId);
  }
  function reset() { Sound.play("click"); setTrail([]); setId("pregame"); }

  return (
    <section className="screen">
      <div className="report-head">
        <h2 className="screen-title">🍞 Dad's B.R.E.A.D Playbook</h2>
        <button className="ghost-btn" onClick={() => { Sound.play("click"); go("map"); }}>◀ Back</button>
      </div>
      <p className="screen-sub">Walk the decision tree like a real trade. Every gate must say YES — one NO and you wait.</p>

      {/* B.R.E.A.D letter strip */}
      <div className="pb-letters">
        {LETTERS.map((L) => (
          <span key={L} className={"pb-letter" + (node.letter === L ? " on" : "")}>{L}</span>
        ))}
      </div>

      {/* breadcrumb of passed gates */}
      {trail.length > 0 && (
        <div className="pb-trail">
          {trail.map((t, i) => <span key={i} className="pb-step done">✓ {NODES[t].letter} — {NODES[t].title.replace(/^. [—-] /, "").replace(/ \(.*\)$/, "")}</span>)}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={id} className={"pb-node " + (node.kind || "ask")}
          initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.97 }} transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}>
          <div className="pb-emoji">{node.emoji}</div>
          <div className="pb-title">{node.title}</div>
          <div className="pb-text" dangerouslySetInnerHTML={{ __html: node.text }} />
          {node.q && <div className="pb-q" dangerouslySetInnerHTML={{ __html: node.q }} />}

          <div className="pb-actions">
            {node.yes && (
              <>
                <motion.button className="pb-btn yes" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => goTo(node.yes, true)}>✔ YES</motion.button>
                <motion.button className="pb-btn no" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => goTo(node.no, false)}>✖ NO</motion.button>
              </>
            )}
            {node.next && (
              <motion.button className="pb-btn go" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => goTo(node.next, false)}>{node.nextLabel}</motion.button>
            )}
            {node.restart && (
              <motion.button className="pb-btn restart" whileTap={{ scale: 0.95 }}
                onClick={reset}>🔁 Run it again</motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
