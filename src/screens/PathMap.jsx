import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store.jsx";
import { pathView, KINDS } from "../engine/path.js";
import { Sound } from "../engine/audio.js";
import { launch } from "./Home.jsx";

// The whole journey, one world per row. Only one world is open at a time, so the
// screen is never more than a list of ten names plus the handful of steps he is
// actually looking at.
export default function PathMap() {
  const { game, go } = useApp();
  const view = pathView(game.state);
  const current = view.next?.world.id;
  const [openId, setOpenId] = useState(current || view.worlds[0].id);

  return (
    <section className="pathmap">
      <header className="page-head">
        <h1>🗺️ The Map</h1>
        <p>{view.worlds.length} worlds. Finish one to open the next. You have done {view.done} of {view.total} steps.</p>
      </header>

      <div className="world-list">
        {view.worlds.map((w) => {
          const isOpen = openId === w.id;
          const state = w.complete ? "complete" : w.open ? (w.id === current ? "current" : "open") : "locked";
          return (
            <div key={w.id} className={`world ${state}` + (isOpen ? " expanded" : "")}>
              <button className="world-head" disabled={!w.open}
                onClick={() => { Sound.play("click"); setOpenId(isOpen ? null : w.id); }}>
                <span className="world-badge">{w.complete ? "✓" : w.open ? w.n : "🔒"}</span>
                <span className="world-text">
                  <span className="world-name">{w.emoji} {w.name}</span>
                  <span className="world-desc">{w.open ? w.desc : w.waits ? "Opens tomorrow 🌙" : `Finish World ${w.n - 1} to open this`}</span>
                </span>
                {w.id === current && <span className="world-here">You are here</span>}
                <span className="world-count">{w.doneCount}/{w.steps.length}</span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && w.open && (
                  <motion.div className="world-steps"
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                    {w.steps.map((s) => {
                      const isNext = view.next?.id === s.id;
                      return (
                        <button key={s.id} disabled={!s.open}
                          className={"step-node" + (s.done ? " done" : "") + (isNext ? " next" : "") + (!s.open ? " locked" : "")}
                          onClick={() => { Sound.play("open"); launch(s, go); }}>
                          <span className="step-icon">{s.done ? "✓" : s.open ? KINDS[s.kind].emoji : "🔒"}</span>
                          <span className="step-kind">{KINDS[s.kind].verb}</span>
                          <span className="step-title">{s.title}</span>
                          {isNext && <span className="step-go">▶ Play</span>}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
