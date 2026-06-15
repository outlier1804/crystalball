import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── PNG character components ──────────────────────────────────────────────────
function Kai({ style = {} }) {
  return (
    <img src="/art/characters/kai.png" alt="Kai"
      style={{ height: 132, width: "auto", objectFit: "contain", display: "block", margin: "0 auto", ...style }} />
  );
}
function Hana({ style = {} }) {
  return (
    <img src="/art/characters/hana.png" alt="Hana"
      style={{ height: 132, width: "auto", objectFit: "contain", display: "block", margin: "0 auto", ...style }} />
  );
}
function Kazuo({ style = {} }) {
  const [err, setErr] = useState(false);
  if (err) return <span style={{ fontSize: "3rem" }}>🥷</span>;
  return (
    <img src="/art/characters/kazuo.png" alt="Kazuo" onError={() => setErr(true)}
      style={{ height: 132, width: "auto", objectFit: "contain", display: "block", margin: "0 auto", ...style }} />
  );
}

// Speed-line ink burst overlay for high-energy moments
function SpeedLines({ active }) {
  if (!active) return null;
  return (
    <svg viewBox="0 0 200 200" style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", opacity: 0.15, zIndex: 0
    }}>
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * 360;
        const rad = (angle * Math.PI) / 180;
        const x2 = 100 + Math.cos(rad) * 120;
        const y2 = 100 + Math.sin(rad) * 120;
        return <line key={i} x1="100" y1="100" x2={x2} y2={y2}
          stroke="#111" strokeWidth={i % 3 === 0 ? "2" : "0.7"} />;
      })}
    </svg>
  );
}

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
      <div className="scene-stage" style={{ position: "relative" }}>
        <SpeedLines active={hi} />
        <motion.div className="scene-char left" {...bob(0)}><Kai /></motion.div>
        <motion.div className="scene-char right" {...bob(0.4)}><Hana /></motion.div>

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
          animate={{ boxShadow: beat === 3 ? "0 0 18px rgba(230,57,70,.5)" : "0 0 8px rgba(17,17,17,.2)" }}>
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
      <div className="scene-stage" style={{ position: "relative" }}>
        <SpeedLines active={true} />
        <motion.div className="scene-char left" {...bob(0)}><Kai /></motion.div>
        <motion.div className="scene-char right" {...bob(0.2)}><Hana /></motion.div>
        <motion.div className="scene-bigprice"
          animate={{ y: up ? -28 : 28, scale: up ? 1.15 : 1 }}
          style={{ color: up ? "#111" : "#e63946", fontFamily: "'Bangers', cursive", fontSize: "2rem" }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}>
          {up ? "▲ BUY" : "▼ SELL"}
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
      <div className="scene-stage" style={{ position: "relative" }}>
        <SpeedLines active={hype} />
        <motion.div className="scene-char left" {...bob(0)}
          animate={{ rotate: hype ? [0, -4, 4, 0] : 0 }}
          transition={{ duration: 0.6, repeat: hype ? Infinity : 0 }}>
          <Kai />
        </motion.div>
        <motion.div className="scene-char right"
          animate={{ opacity: hype ? 0.15 : 1, scale: hype ? 0.9 : 1 }}
          transition={{ duration: 0.4 }}>
          <Kazuo />
        </motion.div>
        <motion.div className="scene-bigprice"
          style={{ color: hype ? "#111" : "#e63946", fontFamily: "'Bangers', cursive" }}
          animate={{ y: hype ? -34 : 36 }}
          transition={{ type: "spring", stiffness: 110, damping: 12 }}>{hype ? "🚀 FOMO!" : "📉 oops"}</motion.div>
      </div>
      <Caption k={beat}>{hype ? "🚀 It's MOONING! “I HAVE to buy now!” … that's the FOMO demon." : "…then it dropped. The patient ninja waited for a real setup. 🥷"}</Caption>
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

// ===== Price has a GOAL: pulled to the DEM (fair value gap) like a magnet =====
function GoalScene() {
  const beat = useBeat(2, 2800);
  const pulled = beat === 1;
  return (
    <div className="lesson-scene">
      <div className="scene-stage">
        <div className="scene-demzone">DEM ⛽</div>
        <div className="scene-magnet">🧲</div>
        <motion.div className="scene-rocket"
          animate={{ x: pulled ? 64 : -64 }}
          transition={{ type: "spring", stiffness: 80, damping: 13 }}>💰</motion.div>
      </div>
      <Caption k={beat}>{pulled
        ? "...and price gets PULLED to the gap like a magnet. That's its GOAL! 🧲"
        : "An unfair empty gap — a DEM — sits to the side. The market wants to fill it…"}</Caption>
    </div>
  );
}

// ===== Overnight GAP: break & retest, use it as gas =====
function GapScene() {
  const beat = useBeat(2, 3000);
  const fill = beat === 1;
  return (
    <div className="lesson-scene">
      <div className="scene-stage">
        <div className="scene-gapband" />
        <div className="scene-gaplabel">GAP</div>
        <motion.div className="scene-rocket"
          animate={fill ? { y: [-72, 4, -86] } : { y: -72 }}
          transition={fill ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.6, ease: "easeOut" }}>
          {fill ? "⛽" : "💰"}
        </motion.div>
      </div>
      <Caption k={beat}>{fill
        ? "Price dips back to FILL the gap, uses it as gas ⛽, then continues. Break & retest!"
        : "GAP UP! Price jumped overnight, leaving a gap — but a gap does NOT boost the odds."}</Caption>
    </div>
  );
}

// ===== Respected vs Disrespected level (Dad's biggest secret) =====
function RespectedScene() {
  const beat = useBeat(2, 3200);
  const respected = beat === 0;
  return (
    <div className="lesson-scene">
      <div className="scene-stage">
        {/* the marked level */}
        <div className="resp-level" />
        {/* the swing price closed beyond (or failed to) */}
        <motion.div className="resp-body"
          animate={{ y: respected ? -40 : -4, backgroundColor: respected ? "#3dff8e" : "#ff5a5a" }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }} />
        {/* return-to-level reaction */}
        <motion.div className="resp-ball"
          animate={respected ? { x: [40, 0, -10], y: [-30, 6, -34] } : { x: [40, -60], y: [-30, 30] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>💰</motion.div>
        <motion.div className="resp-stamp" key={respected ? "r" : "d"}
          initial={{ scale: 0, rotate: -16 }} animate={{ scale: 1, rotate: -7 }}
          style={{ background: respected ? "#0b6b3a" : "#7a1c1c", borderColor: respected ? "#3dff8e" : "#ff7a7a" }}>
          {respected ? "R ✓ RESPECTED" : "D ✗ DISRESPECTED"}
        </motion.div>
      </div>
      <Caption k={beat}>{respected
        ? "RESPECTED: price closed a BODY beyond the last swing + made a gap → it REACTS when it comes back. Mark it! ✅"
        : "DISRESPECTED: it FAILED to do something new → price runs straight through. Don't even mark it! ❌"}</Caption>
    </div>
  );
}

// ===== B.R.E.A.D checklist: the three gates tick off → ENTER =====
const BREAD_GATES = ["① Behavior: reached your level?", "② Reaction: bounce/reject on close?", "③ Alignment: higher TF agrees?"];
const BREAD_CAPS = [
  "B.R.E.A.D Gate ①: did price REACH the level you marked? (Behavior)",
  "Gate ②: on the CLOSE, did it bounce or reject? (the Reaction)",
  "Gate ③: does the higher timeframe agree? (Alignment)",
  "All three ✓ → ENTER on the close! (Any ✗ = NO TRADE 🚫)",
];
function BreadScene() {
  const beat = useBeat(4, 2700);
  const ready = beat >= 3;
  return (
    <div className="lesson-scene">
      <div className="scene-stage">
        <div className="bread-checklist">
          {BREAD_GATES.map((g, i) => (
            <div key={i} className={"bread-gate" + (beat >= i ? " on" : "")}>
              <span className="bread-tick">{beat >= i ? "✅" : "⬜"}</span> {g}
            </div>
          ))}
        </div>
        <AnimatePresence>
          {ready && (
            <motion.div className="bread-stamp"
              initial={{ scale: 0, rotate: -16 }} animate={{ scale: 1, rotate: -7 }} exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 12 }}>
              ✅ ENTER ON CLOSE
            </motion.div>
          )}
        </AnimatePresence>
        <div className="bread-loaf">🍞</div>
      </div>
      <Caption k={beat}>{BREAD_CAPS[beat]}</Caption>
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
  goal: GoalScene,
  gap: GapScene,
  respected: RespectedScene,
  bread: BreadScene,
};
