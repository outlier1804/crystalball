import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Higher-quality scene characters (original art) used inside lesson scenes.
const BOY = `
 <svg viewBox="0 0 120 175">
  <defs>
   <linearGradient id="bskin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2c4"/><stop offset="1" stop-color="#f0c094"/></linearGradient>
   <linearGradient id="bhair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#52459c"/><stop offset="1" stop-color="#241b46"/></linearGradient>
   <linearGradient id="bjacket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#46e6ff"/><stop offset="1" stop-color="#2585c4"/></linearGradient>
   <linearGradient id="bpants" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3658"/><stop offset="1" stop-color="#211a40"/></linearGradient>
  </defs>
  <ellipse cx="60" cy="171" rx="32" ry="5" fill="#000" opacity="0.22"/>
  <rect x="48" y="120" width="11" height="44" rx="5" fill="url(#bpants)"/>
  <rect x="61" y="120" width="11" height="44" rx="5" fill="url(#bpants)"/>
  <path d="M45 160 q-2 8 6 8 h9 v-10 z" fill="#eef7ff" stroke="#46e6ff" stroke-width="1.2"/>
  <path d="M75 160 q2 8 -6 8 h-9 v-10 z" fill="#eef7ff" stroke="#46e6ff" stroke-width="1.2"/>
  <rect x="30" y="80" width="11" height="40" rx="5" fill="url(#bjacket)"/>
  <rect x="79" y="80" width="11" height="40" rx="5" fill="url(#bjacket)"/>
  <circle cx="35" cy="122" r="6.5" fill="url(#bskin)"/>
  <circle cx="85" cy="122" r="6.5" fill="url(#bskin)"/>
  <path d="M40 78 q20 -9 40 0 l4 44 q-24 9 -48 0 z" fill="url(#bjacket)" stroke="#bff4ff" stroke-width="1.5"/>
  <line x1="60" y1="80" x2="60" y2="120" stroke="#ffd34f" stroke-width="2.5"/>
  <rect x="54" y="66" width="12" height="12" rx="4" fill="#f0c094"/>
  <path d="M32 48 q-2 -34 28 -36 q30 2 28 36 q1 8 -5 14 l-5 -22 q-18 8 -36 0 l-5 22 q-6 -6 -5 -14z" fill="url(#bhair)"/>
  <ellipse cx="60" cy="46" rx="28" ry="29" fill="url(#bskin)"/>
  <circle cx="34" cy="48" r="5" fill="#f0c094"/>
  <circle cx="86" cy="48" r="5" fill="#f0c094"/>
  <g class="eyes">
   <ellipse cx="49" cy="48" rx="6" ry="7.5" fill="#fff"/>
   <ellipse cx="71" cy="48" rx="6" ry="7.5" fill="#fff"/>
   <circle cx="50" cy="49" r="4.2" fill="#2b6cff"/>
   <circle cx="72" cy="49" r="4.2" fill="#2b6cff"/>
   <circle cx="50" cy="49" r="1.9" fill="#10204f"/>
   <circle cx="72" cy="49" r="1.9" fill="#10204f"/>
   <circle cx="51.6" cy="46.4" r="1.5" fill="#fff"/>
   <circle cx="73.6" cy="46.4" r="1.5" fill="#fff"/>
  </g>
  <path d="M43 38 q6 -3 12 0" stroke="#241b46" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M65 38 q6 -3 12 0" stroke="#241b46" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <ellipse cx="44" cy="56" rx="4" ry="2.4" fill="#ff9cc0" opacity="0.6"/>
  <ellipse cx="76" cy="56" rx="4" ry="2.4" fill="#ff9cc0" opacity="0.6"/>
  <path d="M53 60 q7 6 14 0" stroke="#c0784a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M33 50 Q30 15 60 13 Q90 15 87 50 L78 31 L70 46 L62 29 L55 45 L47 30 L39 46 Z" fill="url(#bhair)"/>
  <path d="M58 16 q16 2 22 15" stroke="#8a7fd8" stroke-width="2" fill="none" opacity="0.55" stroke-linecap="round"/>
 </svg>`;

const GIRL = `
 <svg viewBox="0 0 120 175">
  <defs>
   <linearGradient id="gskin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe6cf"/><stop offset="1" stop-color="#f3cba6"/></linearGradient>
   <linearGradient id="ghair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a4fd0"/><stop offset="1" stop-color="#3a2168"/></linearGradient>
   <linearGradient id="gtop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7ab0"/><stop offset="1" stop-color="#d83f86"/></linearGradient>
   <linearGradient id="gleg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3162"/><stop offset="1" stop-color="#241a44"/></linearGradient>
  </defs>
  <ellipse cx="60" cy="171" rx="32" ry="5" fill="#000" opacity="0.22"/>
  <path d="M30 48 q-12 44 -4 84 q7 10 14 4 q-8 -44 2 -86z" fill="url(#ghair)"/>
  <path d="M90 48 q12 44 4 84 q-7 10 -14 4 q8 -44 -2 -86z" fill="url(#ghair)"/>
  <rect x="50" y="124" width="10" height="40" rx="5" fill="url(#gleg)"/>
  <rect x="60" y="124" width="10" height="40" rx="5" fill="url(#gleg)"/>
  <path d="M46 160 q-2 8 7 8 h8 v-10 z" fill="#fff" stroke="#ff7ab0" stroke-width="1.2"/>
  <path d="M74 160 q2 8 -7 8 h-8 v-10 z" fill="#fff" stroke="#ff7ab0" stroke-width="1.2"/>
  <path d="M42 116 q18 8 36 0 l7 22 q-25 10 -50 0 z" fill="url(#gtop)"/>
  <rect x="30" y="82" width="10" height="38" rx="5" fill="url(#gtop)"/>
  <rect x="80" y="82" width="10" height="38" rx="5" fill="url(#gtop)"/>
  <circle cx="35" cy="120" r="6.5" fill="url(#gskin)"/>
  <circle cx="85" cy="120" r="6.5" fill="url(#gskin)"/>
  <path d="M41 80 q19 -9 38 0 l4 38 q-23 9 -46 0 z" fill="url(#gtop)" stroke="#ffd1e6" stroke-width="1.5"/>
  <rect x="54" y="66" width="12" height="12" rx="4" fill="#f3cba6"/>
  <path d="M32 48 q-2 -34 28 -36 q30 2 28 36 q1 8 -5 14 l-5 -22 q-18 8 -36 0 l-5 22 q-6 -6 -5 -14z" fill="url(#ghair)"/>
  <ellipse cx="60" cy="46" rx="27.5" ry="29" fill="url(#gskin)"/>
  <circle cx="34" cy="48" r="5" fill="#f3cba6"/>
  <circle cx="86" cy="48" r="5" fill="#f3cba6"/>
  <path d="M33 50 Q30 15 60 13 Q90 15 87 50 q-8 -16 -18 -16 l-3 14 -6 -14 q-1 14 -7 13 -6 1 -7 -13 l-6 14 -3 -14 q-10 0 -18 16z" fill="url(#ghair)"/>
  <path d="M34 48 q-3 20 3 36 q4 -1 6 -6 q-6 -16 -3 -30z" fill="url(#ghair)"/>
  <path d="M86 48 q3 20 -3 36 q-4 -1 -6 -6 q6 -16 3 -30z" fill="url(#ghair)"/>
  <g transform="translate(84 30)"><path d="M0 0 l9 -4 v8 z M0 0 l9 4 v-8 z" fill="#ff7ab0"/><circle r="2.6" fill="#ffd34f"/></g>
  <g class="eyes">
   <ellipse cx="49" cy="49" rx="6.2" ry="8" fill="#fff"/>
   <ellipse cx="71" cy="49" rx="6.2" ry="8" fill="#fff"/>
   <circle cx="50" cy="50" r="4.4" fill="#8b5cf6"/>
   <circle cx="72" cy="50" r="4.4" fill="#8b5cf6"/>
   <circle cx="50" cy="50" r="2" fill="#241333"/>
   <circle cx="72" cy="50" r="2" fill="#241333"/>
   <circle cx="51.6" cy="47" r="1.5" fill="#fff"/>
   <circle cx="73.6" cy="47" r="1.5" fill="#fff"/>
  </g>
  <path d="M42 40 q7 -3 13 1" stroke="#241333" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M65 41 q7 -4 13 0" stroke="#241333" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <ellipse cx="43" cy="57" rx="4" ry="2.4" fill="#ff8fb3" opacity="0.7"/>
  <ellipse cx="77" cy="57" rx="4" ry="2.4" fill="#ff8fb3" opacity="0.7"/>
  <path d="M54 61 q6 5 12 0" stroke="#c0784a" stroke-width="2.1" fill="none" stroke-linecap="round"/>
 </svg>`;

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
        <motion.div className="scene-char left" {...bob(0)} dangerouslySetInnerHTML={{ __html: BOY }} />
        <motion.div className="scene-char right" {...bob(0.4)} dangerouslySetInnerHTML={{ __html: GIRL }} />

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
        <motion.div className="scene-char left" {...bob(0)} dangerouslySetInnerHTML={{ __html: BOY }} />
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
