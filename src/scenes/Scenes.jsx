import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AVATARS } from "../engine/characters.js";

const KAI = AVATARS.find((a) => a.id === "kai").svg;
const HANA = AVATARS.find((a) => a.id === "hana").svg;

// little looping "beat" clock so each scene tells a story on repeat
function useBeat(n, ms = 2600) {
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setBeat((b) => (b + 1) % n), ms);
    return () => clearInterval(t);
  }, [n, ms]);
  return beat;
}

function Caption({ children, k }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div key={k} className="scene-caption"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

const bob = (delay = 0) => ({ animate: { y: [0, -6, 0] }, transition: { duration: 2.4, repeat: Infinity, delay } });

// ===== Dragon-card futures promise =====
const DRAGON_CAPS = [
  "🤝 You promise your friend: “my 🐉 card for 10 Koins next Friday — no matter what!”",
  "📅 Monday: the dragon card is worth about 10 Koins. A fair deal.",
  "🔥 Thursday: a new episode airs — EVERYONE wants the dragon! Now it’s worth 50!",
  "💎 Your friend’s promise to buy it for only 10 is now a TREASURE worth 40 more!",
];
function DragonCardScene() {
  const beat = useBeat(4, 2800);
  const hi = beat >= 2;
  return (
    <div className="lesson-scene">
      <div className="scene-stage">
        <motion.div className="scene-char left" {...bob(0)} dangerouslySetInnerHTML={{ __html: KAI }} />
        <motion.div className="scene-char right" {...bob(0.4)} dangerouslySetInnerHTML={{ __html: HANA }} />

        <motion.div className="scene-price" key={hi ? "hi" : "lo"}
          initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          💰 {hi ? "50" : "10"} {hi && <span className="up">▲</span>}
        </motion.div>

        <motion.div className="scene-card"
          animate={hi ? { scale: [1, 1.2, 1.08], rotate: [0, -5, 5, 0] } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, repeat: hi ? Infinity : 0 }}>🐉</motion.div>

        <AnimatePresence>
          {beat === 2 && (
            <motion.div className="scene-pop" initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0 }}>
              POPULAR! 🔥
            </motion.div>
          )}
        </AnimatePresence>
        {beat === 2 && [0, 1, 2].map((i) => (
          <motion.span key={i} className="scene-heart" style={{ left: `${42 + i * 8}%` }}
            initial={{ y: 0, opacity: 1 }} animate={{ y: -64, opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.4 }}>❤️</motion.span>
        ))}
        <AnimatePresence>
          {beat === 3 && (
            <motion.div className="scene-treasure" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
              💎✨
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className={"scene-promise" + (beat === 3 ? " treasure" : "")}
          animate={{ boxShadow: beat === 3 ? "0 0 22px rgba(255,211,79,.9)" : "0 0 10px rgba(62,230,255,.6)" }}>
          {beat === 3 ? "🤝 a promise to buy 🐉 for 10 = worth 50!" : "🤝 promise: 🐉 for 10 Koins"}
        </motion.div>
      </div>
      <Caption k={beat}>{DRAGON_CAPS[beat]}</Caption>
    </div>
  );
}

// ===== Buyers vs sellers move the price =====
function MarketScene() {
  const beat = useBeat(2, 2400);
  const up = beat === 0;
  return (
    <div className="lesson-scene">
      <div className="scene-stage">
        <div className="scene-crowd left">🙋🙋🙋<small>buyers</small></div>
        <div className="scene-crowd right">🙅🙅<small>sellers</small></div>
        <motion.div className="scene-bigprice" animate={{ y: up ? -28 : 28, color: up ? "#3dff8e" : "#ff5a5a" }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}>
          💰 {up ? "▲" : "▼"}
        </motion.div>
      </div>
      <Caption k={beat}>{up ? "More buyers than sellers → price goes UP! ▲" : "More sellers than buyers → price goes DOWN! ▼"}</Caption>
    </div>
  );
}

// ===== Green vs red candles =====
function CandleBattleScene() {
  const beat = useBeat(2, 2400);
  const up = beat === 0;
  return (
    <div className="lesson-scene">
      <div className="scene-stage">
        <div className="scene-beast" style={{ left: "18%" }}>{up ? "🐂" : "🐻"}</div>
        <motion.div className="scene-candle"
          animate={{ height: up ? 96 : 36, backgroundColor: up ? "#3dff8e" : "#ff5a5a", y: up ? -20 : 22 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }} />
        <motion.div className="scene-arrow" key={up ? "u" : "d"} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          style={{ color: up ? "#3dff8e" : "#ff5a5a" }}>{up ? "▲" : "▼"}</motion.div>
      </div>
      <Caption k={beat}>{up ? "GREEN candle = price went UP! The buyers (🐂 bulls) won." : "RED candle = price went DOWN! The sellers (🐻 bears) won."}</Caption>
    </div>
  );
}

// ===== Stop-loss shield =====
function ShieldScene() {
  const beat = useBeat(2, 2800);
  const shielded = beat === 1;
  return (
    <div className="lesson-scene">
      <div className="scene-stage">
        <div className="scene-coins">💰💰💰</div>
        <motion.div className="scene-faller"
          animate={{ y: shielded ? 24 : 92, rotate: shielded ? 0 : 12 }}
          transition={{ duration: 1.2, ease: "easeIn" }}>📉</motion.div>
        <AnimatePresence>
          {shielded && (
            <motion.div className="scene-shield" initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} exit={{ scale: 0 }}
              transition={{ duration: 0.5 }}>🛡️</motion.div>
          )}
        </AnimatePresence>
      </div>
      <Caption k={beat}>{shielded ? "🛡️ Stop-loss SHIELD catches the fall — just a small scratch!" : "😬 No shield… the price keeps falling and the loss gets BIG."}</Caption>
    </div>
  );
}

export const SCENES = {
  dragonCard: DragonCardScene,
  market: MarketScene,
  candles: CandleBattleScene,
  shield: ShieldScene,
};
