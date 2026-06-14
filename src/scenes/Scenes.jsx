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

// ===== Trend: ride the wave =====
function TrendScene() {
  const beat = useBeat(2, 2400);
  const up = beat === 0;
  return (
    <div className="lesson-scene">
      <div className="scene-stage">
        <motion.div className="scene-wave" animate={{ rotate: up ? -16 : 16, backgroundColor: up ? "#3dff8e" : "#ff5a5a" }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }} />
        <motion.div className="scene-rider"
          animate={{ x: [-52, 52], y: up ? [28, -30] : [-30, 28] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>🏄</motion.div>
      </div>
      <Caption k={beat}>{up ? "Uptrend = higher highs! Ride the wave UP 🌊" : "Downtrend = lower lows. Surf it DOWN — don’t fight the current!"}</Caption>
    </div>
  );
}

// ===== Long vs Short =====
function LongShortScene() {
  const beat = useBeat(2, 2400);
  const long = beat === 0;
  return (
    <div className="lesson-scene">
      <div className="scene-stage">
        <div className="scene-beast" style={{ left: "40%", fontSize: "2.8rem" }}>{long ? "📈" : "📉"}</div>
        <motion.div className="scene-arrow" key={long ? "l" : "s"} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          style={{ color: long ? "#3dff8e" : "#ff5a5a", left: "62%" }}>{long ? "▲" : "▼"}</motion.div>
      </div>
      <Caption k={beat}>{long ? "Go LONG: buy LOW now → sell HIGH later. You win when price RISES ▲" : "Go SHORT: sell HIGH now → buy back LOW. You win when price FALLS ▼"}</Caption>
    </div>
  );
}

// ===== FOMO demon =====
function FomoScene() {
  const beat = useBeat(2, 2800);
  const hype = beat === 0;
  return (
    <div className="lesson-scene">
      <div className="scene-stage">
        <motion.div className="scene-char left" {...bob(0)} dangerouslySetInnerHTML={{ __html: KAI }} />
        <motion.div className="scene-bigprice" animate={{ y: hype ? -34 : 36, color: hype ? "#3dff8e" : "#ff5a5a" }}
          transition={{ type: "spring", stiffness: 110, damping: 12 }}>{hype ? "🚀" : "📉"}</motion.div>
        <div className="scene-face">{hype ? "😱" : "🥷"}</div>
      </div>
      <Caption k={beat}>{hype ? "🚀 It’s MOONING! “I HAVE to buy now!” … that’s the FOMO demon." : "…then it dropped. The patient ninja waited for a real setup. 🥷"}</Caption>
    </div>
  );
}

// ===== Volatility: calm pond vs storm =====
function VolatilityScene() {
  const beat = useBeat(2, 2600);
  const calm = beat === 0;
  return (
    <div className="lesson-scene">
      <div className={"scene-stage" + (calm ? "" : " shakey")}>
        <motion.div className="scene-candle" animate={{ height: calm ? 30 : 112, backgroundColor: calm ? "#7fb0ff" : "#ff5a5a", y: calm ? 30 : -16 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }} />
        <div className="scene-beast" style={{ right: "18%", left: "auto" }}>{calm ? "😴" : "🐉"}</div>
      </div>
      <Caption k={beat}>{calm ? "Calm day: a sleepy pond — small, gentle moves." : "🐉 Dragon day: a stormy ocean — HUGE swings. Trade smaller & careful!"}</Caption>
    </div>
  );
}

// ===== Opening range breakout =====
function BreakoutScene() {
  const beat = useBeat(2, 2800);
  const out = beat === 1;
  return (
    <div className="lesson-scene">
      <div className="scene-stage">
        <div className="scene-box" />
        <motion.div className="scene-rocket"
          animate={out ? { y: -70 } : { y: [0, -6, 0] }}
          transition={out ? { duration: 0.8 } : { duration: 1.2, repeat: Infinity }}>{out ? "🚀" : "💰"}</motion.div>
      </div>
      <Caption k={beat}>{out ? "BREAKOUT! Price escapes the box — ride the way it breaks out 🚪" : "Opening range: price is boxed in. A strategist waits patiently… ⏳"}</Caption>
    </div>
  );
}

// ===== Liquidity sweep / stop hunt =====
function SweepScene() {
  const beat = useBeat(2, 2800);
  const snap = beat === 1;
  return (
    <div className="lesson-scene">
      <div className="scene-stage">
        <div className="scene-pool">💧💧💧<small>resting orders</small></div>
        <div className="scene-line" />
        <motion.div className="scene-rocket"
          animate={{ y: snap ? 52 : -46, rotate: snap ? 8 : 0 }}
          transition={{ duration: snap ? 0.5 : 1.0, ease: snap ? "easeIn" : "easeOut" }}>{snap ? "📉" : "📈"}</motion.div>
      </div>
      <Caption k={beat}>{snap ? "SNAP! The stop-hunt is over — don’t chase, trade the reversal 🎣" : "Price spikes up to raid the pool of orders above the level… 💧"}</Caption>
    </div>
  );
}

export const SCENES = {
  dragonCard: DragonCardScene,
  market: MarketScene,
  candles: CandleBattleScene,
  shield: ShieldScene,
  trend: TrendScene,
  longshort: LongShortScene,
  fomo: FomoScene,
  volatility: VolatilityScene,
  breakout: BreakoutScene,
  sweep: SweepScene,
};
