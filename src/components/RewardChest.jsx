import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { Rewards } from "../engine/rewards.js";
import { Sound } from "../engine/audio.js";
import { FX } from "../engine/fx.js";

// The end-of-everything chest. He taps it, it shudders three times, and the lid
// blows off into coins that fly up into his XP bar.
//
// The prize is rolled the moment the chest appears but only PAID when he taps,
// so the anticipation is real and the reward is his to open — a chest that
// opens itself is just a number on a screen.
export default function RewardChest({ kind = "wood", onDone }) {
  const { bump, popup } = useApp();
  const prize = useMemo(() => Rewards.rollChest(kind), [kind]);
  const [phase, setPhase] = useState("closed");   // closed | opening | open
  const boxRef = useRef(null);

  const CHEST = { wood: "🎁", silver: "🎁", gold: "🏆" }[kind] || "🎁";
  const rare = prize.xp >= 90;

  function open() {
    if (phase !== "closed") return;
    setPhase("opening");
    Sound.play("creak");
    setTimeout(() => Sound.play("creak"), 190);
    setTimeout(() => {
      setPhase("open");
      Sound.play("chest");
      const el = boxRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        FX.coins(r.left + r.width / 2, r.top + r.height / 2, rare ? 44 : 26);
        FX.stars(r.left + r.width / 2, r.top + r.height / 2, rare ? 26 : 12);
        FX.shockwave(el, rare ? "#c89bff" : "#ffd34f");
        FX.flyToXp(el, rare ? 10 : 6);
      }
      if (rare) FX.flash("#c89bff", 520);
      const { rankUp } = Rewards.openChest(prize);
      bump();
      if (rankUp) popup(rankUp.emoji, "RANK UP!", `You are now a <strong>${rankUp.name}</strong>!`, true, "levelup");
    }, 620);
  }

  return (
    <div className="chest-wrap">
      <motion.button ref={boxRef} className={"chest " + phase} onClick={open}
        animate={
          phase === "opening" ? { rotate: [0, -9, 9, -7, 7, 0], scale: [1, 1.05, 1.05, 1.08, 1] }
          : phase === "open" ? { scale: [1, 1.35, 1.1], rotate: 0 }
          : { y: [0, -7, 0] }
        }
        transition={
          phase === "closed"
            ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
            : { duration: phase === "opening" ? 0.6 : 0.45 }
        }
        whileTap={{ scale: 0.92 }}>
        <span className="chest-emoji">{phase === "open" ? prize.emoji : CHEST}</span>
        {phase === "open" && <span className="chest-rays" />}
      </motion.button>

      {phase !== "open" ? (
        <div className="chest-hint">{phase === "closed" ? "Tap the chest!" : "…"}</div>
      ) : (
        <motion.div className={"chest-prize" + (rare ? " rare" : "")}
          initial={{ scale: 0.4, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 14 }}>
          <div className="chest-prize-label">{prize.label}</div>
          <div className="chest-prize-xp">+{prize.xp} XP</div>
        </motion.div>
      )}

      {phase === "open" && (
        <motion.button className="big-btn small" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          whileTap={{ scale: 0.95 }} onClick={() => { Sound.play("click"); onDone(); }}>
          Take it! ⭐
        </motion.button>
      )}
    </div>
  );
}
