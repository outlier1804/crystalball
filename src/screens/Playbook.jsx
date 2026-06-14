import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store.jsx";
import { Sound } from "../engine/audio.js";
import { FX } from "../engine/fx.js";

// Dad's B.R.E.A.D decision tree, walkable node by node.
const NODES = {
  pregame: { letter: "B", emoji: "🔍", title: "Pre-game complete",
    text: "You read the higher timeframe and marked your levels &amp; the GOAL.",
    q: "Has price <strong>RESPECTED</strong> a level you marked?", yes: "conf", no: "notrade" },
  conf: { letter: "A", emoji: "⚖️", title: "Gate ① ✓ Respected",
    text: "Price reacted at your level — good.",
    q: "Do you have <strong>CONFLUENCE</strong>? (your 15-min plan and the higher timeframe agree)", yes: "isnew", no: "notrade" },
  isnew: { letter: "R", emoji: "✨", title: "Gate ② ✓ Aligned",
    text: "Your timeframes point the same way.",
    q: "Did price do <strong>SOMETHING NEW</strong> on your lower timeframe inside your zone?", yes: "enter", no: "notrade" },
  enter: { letter: "E", emoji: "🎯", kind: "go", title: "ENTER ON CANDLE CLOSE!",
    text: "All three gates passed. Strike when the candle <em>closes</em> — and never chase. Miss it? Wait for a retrace to a goal.",
    next: "manage", nextLabel: "Manage the trade ▶" },
  manage: { letter: "D", emoji: "🤝", title: "You're in the trade",
    text: "Hold while price keeps closing toward your GOAL.",
    q: "Is your plan <strong>STILL valid</strong> on your timeframe?", yes: "hold", no: "exit" },
  hold: { letter: "D", emoji: "🟢", kind: "go", title: "HOLD",
    text: "Let it run toward your goal. Re-check the checklist at every candle close.", restart: true },
  exit: { letter: "D", emoji: "🟡", kind: "warn", title: "PLAN YOUR EXIT",
    text: "The plan is no longer valid — a candle closed against you. No hoping, no “it'll come back.” Protect your Koins.", restart: true },
  notrade: { letter: "D", emoji: "🚫", kind: "stop", title: "NO TRADE",
    text: "And that's a <strong>winning move</strong>, ninja. One NO = no trade. Patience — wait for the next clean setup. 🍞", restart: true },
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
          {trail.map((t, i) => <span key={i} className="pb-step done">✓ {NODES[t].title.replace(/Gate . ✓ /, "")}</span>)}
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
