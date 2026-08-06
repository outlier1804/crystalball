import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store.jsx";
import { Rewards } from "../engine/rewards.js";
import { Sound } from "../engine/audio.js";
import { FX } from "../engine/fx.js";

// Today's three goals, on the map where he lands. Small, finishable, and gone
// tomorrow — the point is that opening the app always shows a short list of
// things he can finish today, not a mountain of things he hasn't done yet.
export default function DailyQuests() {
  const { game, bump, popup } = useApp();
  const quests = Rewards.quests();
  const streak = Rewards.streak();
  const allDone = Rewards.allQuestsDone();

  function claim(q, e) {
    const res = Rewards.claim(q.id);
    if (!res) return;
    Sound.play("powerup");
    const el = e.currentTarget;
    FX.confettiAt(el, 18);
    FX.shockwave(el, "#3dff8e");
    FX.flyToXp(el, 6);
    bump();
    if (res.rankUp) popup(res.rankUp.emoji, "RANK UP!", `You are now a <strong>${res.rankUp.name}</strong>!`, true, "levelup");
  }

  return (
    <div className={"quests-card" + (allDone ? " all-done" : "")}>
      <div className="quests-head">
        <h3>🗓️ Today's Quests</h3>
        <motion.div className={"streak-chip" + (streak.count > 0 ? " lit" : "")}
          animate={streak.count > 0 ? { scale: [1, 1.08, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2.2 }}
          title={`Longest streak: ${streak.longest || 0} days`}>
          <span className="streak-flame">🔥</span>
          <span className="streak-n">{streak.count || 0}</span>
          <span className="streak-word">day{streak.count === 1 ? "" : "s"}</span>
        </motion.div>
      </div>

      <div className="quests-list">
        <AnimatePresence initial={false}>
          {quests.map((q, i) => {
            const pct = Math.round((q.progress / q.goal) * 100);
            return (
              <motion.div key={q.id} className={"quest" + (q.claimed ? " claimed" : q.done ? " ready" : "")}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}>
                <span className="quest-emoji">{q.claimed ? "✅" : q.emoji}</span>
                <div className="quest-body">
                  <div className="quest-label">{q.label}</div>
                  <div className="quest-bar">
                    <motion.div className="quest-fill" initial={{ width: 0 }} animate={{ width: pct + "%" }}
                      transition={{ duration: 0.6, ease: "easeOut" }} />
                  </div>
                  <div className="quest-meta">{q.progress}/{q.goal} · +{q.xp} XP</div>
                </div>
                {q.done && !q.claimed && (
                  <motion.button className="quest-claim" onClick={(e) => claim(q, e)}
                    animate={{ scale: [1, 1.07, 1] }} transition={{ repeat: Infinity, duration: 1.1 }}
                    whileTap={{ scale: 0.93 }}>
                    CLAIM
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {allDone && (
        <motion.div className="quests-done-note" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          🏅 All three done — come back tomorrow for a fresh set. Your streak is safe.
        </motion.div>
      )}
    </div>
  );
}
