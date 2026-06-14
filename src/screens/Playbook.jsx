import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store.jsx";
import { Sound } from "../engine/audio.js";
import { FX } from "../engine/fx.js";

// Dad's actual flowchart, walkable node by node:
// Pregame → bounce/reject off HTF DEM → confluence (15m + lower TF)
// → wait for the range breakout → ENTER → manage loop (closing beyond? / pulling back & holding?)
const NODES = {
  pregame: { letter: "B", emoji: "📝", title: "B — Behavior · PREGAME",
    text: "Mark your map FIRST: week &amp; day DEMs, any <em>New York</em> gaps, support &amp; resistance from the week down to the 1-hour, and your <strong>4h/1h DEMs</strong>. Then find what's pulling price — the <strong>GOAL</strong>.",
    next: "respect", nextLabel: "Pregame done ▶" },
  respect: { letter: "R", emoji: "🛡️", title: "R — Respect · Gate ①",
    text: "We only take <strong>bounces and rejects</strong> off a higher-timeframe DEM — <em>never continuations.</em>",
    q: "Has price <strong>BOUNCED or REJECTED</strong> off a 4h/1h DEM?", yes: "align", no: "notrade" },
  align: { letter: "A", emoji: "⚖️", title: "A — Alignment · Gate ②",
    text: "Drop to the <strong>15-minute</strong> plus one lower timeframe (2m / 1m / 30s). They must AGREE with the higher timeframe.",
    q: "Do the 15-min and your lower timeframe give the SAME <strong>confluence</strong>?", yes: "execute", no: "notrade" },
  execute: { letter: "E", emoji: "✨", title: "E — Execution · Gate ③",
    text: "On your lower timeframe, find the little <strong>range</strong> where price is coiling. Wait for it to <strong>break OUT</strong> — that's your trigger. No breakout, no trade.",
    q: "Has price <strong>BROKEN OUT</strong> of the range on the lower timeframe?", yes: "enter", no: "notrade" },
  enter: { letter: "E", emoji: "🎯", kind: "go", title: "ENTER on the breakout!",
    text: "All gates passed — enter as price breaks the range. Put your <strong>stop one tick beyond</strong> your level (a little wiggle room). Your DEMs &amp; levels are your <strong>targets</strong>. Now manage.",
    next: "manage", nextLabel: "Manage the trade ▶" },
  manage: { letter: "D", emoji: "🤝", title: "D — Discipline · Manage ①",
    text: "Watch the candles. You want price marching your way.",
    q: "Is price <strong>CLOSING BEYOND</strong> your levels, in your favor?", yes: "pullback", no: "exit" },
  pullback: { letter: "D", emoji: "🔁", title: "D — Discipline · Manage ②",
    text: "Good — it's pushing your way. Now watch the pullback. It should <em>hold</em> your level, get gas, and continue.",
    q: "Is price pulling back to your level and <strong>HOLDING</strong> it (respecting it)?", yes: "hold", no: "exit" },
  hold: { letter: "D", emoji: "🟢", kind: "go", title: "HOLD — let it run",
    text: "It's respecting your levels and heading to your DEM target. <strong>Hold and repeat</strong> the two manage checks until price says otherwise. 🍞",
    next: "manage", nextLabel: "Keep managing ▶", restart: true },
  exit: { letter: "D", emoji: "🟡", kind: "warn", title: "PLAN YOUR EXIT",
    text: "Price stopped closing beyond your levels, or it's <em>not holding</em> the pullback — it's disrespecting your level. No hoping, no “it'll come back.” Take profit / protect your Koins.", restart: true },
  notrade: { letter: "R", emoji: "🚫", kind: "stop", title: "NO TRADE",
    text: "A gate said NO — so there's <strong>no setup</strong> for you. And that's a <em>winning move</em>, ninja. Wait for the next clean one. 🍞", restart: true },
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
      <p className="screen-sub">Dad's real flowchart: pregame → 3 gates → enter → manage. Every gate must say YES — one NO and you wait.</p>

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
