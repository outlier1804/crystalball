import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { ARCS, MISSIONS } from "../engine/data.js";
import { dueForReview } from "../engine/analytics.js";
import { Sound } from "../engine/audio.js";
import { LessonArt } from "../scenes/LessonArt.jsx";
import { UI } from "../engine/art.js";

export default function StoryMap() {
  const { game, go } = useApp();
  const due = dueForReview(game.state);
  const unlockedCount = ARCS.filter((arc, idx) => game.arcUnlocked(idx)).length;
  const progressPercent = unlockedCount / ARCS.length;

  return (
    <section className="screen map-screen">
      <LessonArt src={UI.mapBg} className="map-bg-img" wrapClassName="map-bg-wrap">{null}</LessonArt>
      <h2 className="screen-title">🗺️ Your Quest Map</h2>
      <p className="screen-sub">Complete each arc to unlock the next. Lessons → Quiz → Dojo Mission!</p>
      {due.length > 0 && (
        <motion.button className="memory-banner" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          onClick={() => { Sound.play("open"); go("quiz", { spaced: true, back: "map" }); }}>
          🔁 <strong>{due.length} concept{due.length > 1 ? "s are" : " is"} due for a memory check!</strong> Tap to keep them sharp.
        </motion.button>
      )}
      <div className="map-container" style={{ position: "relative", width: "100%" }}>
        <svg className="map-path-svg" viewBox="0 0 100 1000" preserveAspectRatio="none" style={{
          position: "absolute",
          left: "50%",
          top: "40px",
          bottom: "40px",
          width: "120px",
          height: "calc(100% - 80px)",
          transform: "translateX(-50%)",
          zIndex: 0,
          pointerEvents: "none",
          overflow: "visible"
        }}>
          {/* Background locked track */}
          <path
            d="M 50 0 C 10 150, 90 350, 50 500 C 10 650, 90 850, 50 1000"
            fill="none"
            stroke="#2c225a"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Active unlocked path */}
          <motion.path
            d="M 50 0 C 10 150, 90 350, 50 500 C 10 650, 90 850, 50 1000"
            fill="none"
            stroke="url(#map-glow-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progressPercent }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{ filter: "drop-shadow(0 0 8px var(--cyan))" }}
          />
          <defs>
            <linearGradient id="map-glow-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--pink)" />
              <stop offset="50%" stopColor="var(--gold)" />
              <stop offset="100%" stopColor="var(--cyan)" />
            </linearGradient>
          </defs>
        </svg>

        <div id="arc-list" style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
          {ARCS.map((arc, i) => {
            const unlocked = game.arcUnlocked(i);
            const prog = game.arcProgress(arc.id);
            const missions = MISSIONS.filter((m) => m.unlockArc === arc.id);
            return (
              <motion.div key={arc.id} className={"arc-card " + (unlocked ? "unlocked" : "locked")}
                initial={{ opacity: 0, y: 22, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.34, 1.2, 0.64, 1] }}>
                <div className="arc-emoji">{arc.emoji}</div>
                <div className="arc-body">
                  <div className="arc-name">{arc.name} {prog.quizDone ? "✅" : ""}</div>
                  <div className="arc-desc">{arc.desc}</div>
                  <div className="arc-steps">
                    <button className={"step-btn" + (prog.lessonDone ? " done" : "")} disabled={!unlocked}
                      onClick={() => { Sound.play("click"); go("lesson", { arcId: arc.id }); }}>
                      {(prog.lessonDone ? "✓ " : "") + "📖 Lesson"}
                    </button>
                    <button className={"step-btn" + (prog.quizDone ? " done" : "")}
                      disabled={!unlocked || !prog.lessonDone}
                      onClick={() => { Sound.play("click"); go("quiz", { arcId: arc.id }); }}>
                      {(prog.quizDone ? "✓ " : "") + "❓ Quiz"}
                    </button>
                    {missions.map((m) => {
                      const done = game.state.missions[m.id];
                      return (
                        <button key={m.id} className={"step-btn" + (done ? " done" : "")} disabled={!prog.quizDone}
                          onClick={() => { Sound.play("click"); go("dojo", { missionId: m.id }); }}>
                          {(done ? "✓ " : "") + `${m.emoji} Dojo: ${m.name}`}
                        </button>
                      );
                    })}
                    {arc.id === "arc10" && (
                      <button className="step-btn playbook-step" disabled={!prog.lessonDone}
                        onClick={() => { Sound.play("open"); go("playbook"); }}>
                        📋 Decision Tree
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
