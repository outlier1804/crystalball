import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* The fight stage: two fighters, and the candle that grows out of what they do.
 *
 * Everything is drawn in code so it works with no art at all. Drop a PNG with a
 * transparent background into public/art/fighters/ (bull.png, bear.png,
 * hunter.png — each facing RIGHT) and it replaces the drawn fighter.
 *
 * Stage units: 800 x 450. Prices run 0-100 and map onto the stage with Y().
 */
const Y = (p) => 400 - p * 3.4;
const GREEN = "#3ddc84", RED = "#ff5d6a", INK = "#111";

// true once the image is known to exist; false until then, and forever if not
function useArt(src) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let live = true;
    const im = new Image();
    im.onload = () => live && setOk(im.naturalWidth > 0);
    im.onerror = () => live && setOk(false);
    im.src = src;
    return () => { live = false; };
  }, [src]);
  return ok;
}

/* ---- the drawn fighters. Origin is between the feet; each faces RIGHT. ---- */
function Eyes({ y = -112, angry = true }) {
  return (
    <g>
      <ellipse cx="-4" cy={y} rx="9" ry="10" fill="#fff" stroke={INK} strokeWidth="3" />
      <ellipse cx="26" cy={y} rx="9" ry="10" fill="#fff" stroke={INK} strokeWidth="3" />
      <circle cx="-1" cy={y + 1} r="4.5" fill={INK} /><circle cx="29" cy={y + 1} r="4.5" fill={INK} />
      {angry && <path d={`M-16,${y - 15} L8,${y - 8} M38,${y - 15} L16,${y - 8}`} stroke={INK} strokeWidth="5" strokeLinecap="round" />}
    </g>
  );
}

function Body({ gi, belt, skin }) {
  return (
    <g stroke={INK} strokeWidth="4" strokeLinejoin="round">
      {/* legs */}
      <rect x="-30" y="-42" width="24" height="42" rx="10" fill={gi} />
      <rect x="8" y="-42" width="24" height="42" rx="10" fill={gi} />
      <ellipse cx="-18" cy="-2" rx="17" ry="8" fill={INK} /><ellipse cx="22" cy="-2" rx="17" ry="8" fill={INK} />
      {/* back arm */}
      <path d="M-26,-78 q-22,10 -18,34" fill="none" stroke={INK} strokeWidth="18" strokeLinecap="round" />
      <path d="M-26,-78 q-22,10 -18,34" fill="none" stroke={gi} strokeWidth="11" strokeLinecap="round" />
      <circle cx="-44" cy="-42" r="11" fill={skin} />
      {/* torso */}
      <path d="M-34,-88 Q0,-104 36,-88 L32,-36 Q0,-26 -30,-36 Z" fill={gi} />
      <path d="M-6,-94 L4,-60 L18,-94" fill="none" strokeWidth="3" />
      <rect x="-32" y="-52" width="64" height="11" rx="4" fill={belt} />
      {/* front arm, fist out toward the enemy */}
      <path d="M30,-80 q26,-2 40,10" fill="none" stroke={INK} strokeWidth="19" strokeLinecap="round" />
      <path d="M30,-80 q26,-2 40,10" fill="none" stroke={gi} strokeWidth="12" strokeLinecap="round" />
      <circle cx="74" cy="-68" r="14" fill={skin} />
    </g>
  );
}

function Bull() {
  return (
    <g>
      <Body gi="#1f9d57" belt="#ffd23f" skin="#7be3a4" />
      <g stroke={INK} strokeWidth="4" strokeLinejoin="round">
        <path d="M-26,-138 q-22,-10 -18,-34 q10,18 30,20 Z" fill="#fff4d6" />
        <path d="M44,-138 q22,-10 18,-34 q-10,18 -30,20 Z" fill="#fff4d6" />
        <ellipse cx="9" cy="-112" rx="42" ry="38" fill="#3ddc84" />
        <ellipse cx="20" cy="-92" rx="24" ry="15" fill="#b8f5cf" />
        <circle cx="12" cy="-93" r="3" fill={INK} stroke="none" /><circle cx="30" cy="-93" r="3" fill={INK} stroke="none" />
        <path d="M10,-83 q10,8 22,0" fill="none" strokeWidth="3" strokeLinecap="round" />
      </g>
      <Eyes y={-120} />
    </g>
  );
}

function Bear() {
  return (
    <g>
      <Body gi="#c62f3c" belt="#2b2b33" skin="#e0a071" />
      <g stroke={INK} strokeWidth="4" strokeLinejoin="round">
        <circle cx="-22" cy="-144" r="14" fill="#a8623a" /><circle cx="40" cy="-144" r="14" fill="#a8623a" />
        <circle cx="-22" cy="-144" r="6" fill="#e0a071" stroke="none" /><circle cx="40" cy="-144" r="6" fill="#e0a071" stroke="none" />
        <ellipse cx="9" cy="-112" rx="42" ry="38" fill="#b8703f" />
        <ellipse cx="20" cy="-93" rx="22" ry="15" fill="#f0c9a0" />
        <ellipse cx="22" cy="-100" rx="8" ry="5.5" fill={INK} stroke="none" />
        <path d="M8,-86 q12,-8 26,0" fill="none" strokeWidth="3" strokeLinecap="round" />
      </g>
      <Eyes y={-120} />
    </g>
  );
}

function Hunter() {
  return (
    <g>
      <Body gi="#3a2a5c" belt="#ff5d6a" skin="#2a1f45" />
      <g stroke={INK} strokeWidth="4" strokeLinejoin="round">
        <path d="M-34,-108 Q-30,-162 12,-158 Q54,-158 52,-104 Q30,-74 8,-74 Q-20,-76 -34,-108 Z" fill="#2a1f45" />
        <path d="M-22,-122 Q10,-134 44,-122 L42,-104 Q10,-114 -20,-104 Z" fill="#0d0a18" />
        <path d="M-30,-86 Q-70,-80 -86,-56 Q-60,-66 -34,-70 Z" fill="#ff5d6a" />
      </g>
      <ellipse cx="-2" cy="-113" rx="9" ry="5" fill="#ffe14d" /><ellipse cx="26" cy="-113" rx="9" ry="5" fill="#ffe14d" />
      <circle cx="0" cy="-113" r="2.5" fill={INK} /><circle cx="28" cy="-113" r="2.5" fill={INK} />
    </g>
  );
}

const DRAWN = { bull: Bull, bear: Bear, hunter: Hunter };

// where a pose puts a fighter. `dir` is +1 for the left fighter, -1 for the right.
const POSE = (pose, dir) => ({
  idle:   { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
  charge: { x: 112 * dir, y: -6, rotate: 9 * dir, scale: 1.06, opacity: 1 },
  hit:    { x: -46 * dir, y: 4, rotate: -15 * dir, scale: 0.97, opacity: 1 },
  win:    { x: 0, y: -22, rotate: 0, scale: 1.1, opacity: 1 },
  down:   { x: -26 * dir, y: 30, rotate: -34 * dir, scale: 0.94, opacity: 0.7 },
}[pose] || { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 });

function Fighter({ kind, x, pose, dir }) {
  const has = useArt(`/art/fighters/${kind}.png`);
  const Art = DRAWN[kind] || Bear;
  return (
    <g transform={`translate(${x} 388)`}>
      <motion.g animate={POSE(pose, dir)} transition={{ type: "spring", stiffness: 210, damping: 15 }}>
        <motion.g animate={pose === "idle" || pose === "win" ? { y: [0, -6, 0] } : { y: 0 }}
          transition={{ repeat: Infinity, duration: pose === "win" ? 0.5 : 1.8, ease: "easeInOut" }}>
          <ellipse cx="0" cy="4" rx="58" ry="9" fill="#000" opacity=".28" />
          <g transform={`scale(${dir} 1)`}>
            {has
              ? <image href={`/art/fighters/${kind}.png`} x="-95" y="-188" width="190" height="196" preserveAspectRatio="xMidYMax meet" />
              : <Art />}
          </g>
        </motion.g>
      </motion.g>
    </g>
  );
}

function Candle({ c, x = 400, w = 66, dim = false }) {
  const up = c.c >= c.o;
  const top = Y(Math.max(c.o, c.c)), h = Math.max(4, Math.abs(Y(c.o) - Y(c.c)));
  const fill = up ? GREEN : RED;
  const t = { type: "spring", stiffness: 170, damping: 17 };
  return (
    <g opacity={dim ? 0.55 : 1}>
      <motion.rect x={x - 4} width="8" rx="3" stroke={INK} strokeWidth="2"
        initial={false} animate={{ attrY: Y(c.h), height: Math.max(2, Y(c.l) - Y(c.h)), fill }} transition={t} />
      <motion.rect x={x - w / 2} width={w} rx="7" stroke={INK} strokeWidth="5"
        initial={false} animate={{ attrY: top, height: h, fill }} transition={t} />
    </g>
  );
}

// the "pow" behind an impact word
function Burst({ x, y, word, k }) {
  const pts = Array.from({ length: 22 }, (_, i) => {
    const a = (i / 22) * Math.PI * 2, r = i % 2 ? 54 : 92;
    return `${Math.cos(a) * r * 1.45},${Math.sin(a) * r * 0.72}`;
  }).join(" ");
  return (
    <motion.g key={k} style={{ originX: "50%", originY: "50%" }}
      initial={{ scale: 0.2, opacity: 0, rotate: -10 }} animate={{ scale: [0.2, 1.2, 1], opacity: 1, rotate: -6 }}
      exit={{ scale: 1.4, opacity: 0 }} transition={{ duration: 0.32 }}>
      <g transform={`translate(${x} ${y})`}>
        <polygon points={pts} fill="#ffe14d" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
        <text textAnchor="middle" y="16" fontFamily="Bangers, Impact, sans-serif" fontSize={word.length > 9 ? 30 : word.length > 6 ? 38 : 48}
          fill="#ff3d57" stroke={INK} strokeWidth="2.5" letterSpacing="2">{word}</text>
      </g>
    </motion.g>
  );
}

/**
 * @param beat   the current beat (see engine/battles.js)
 * @param round  the round it belongs to (prev candle, level, coins)
 * @param villain "bear" (default) or "hunter" — who stands on the right
 * @param k      changes on every beat, so impacts replay
 */
export default function Clash({ beat, round, villain = "bear", k }) {
  const c = beat.candle;
  const charging = beat.bull === "charge" || beat.bear === "charge";
  const tagY = { OPEN: Y(c.o), CLOSE: Y(c.c), WICK: Y(c.h) + 8, TIE: Y(c.c), "THE LOW": Y(round.level ?? c.l) }[beat.tag] ?? Y(c.c);
  const lines = Array.from({ length: 16 }, (_, i) => i);

  return (
    <motion.div className="clash" key={"shake" + k}
      animate={beat.fx ? { x: [0, -12, 11, -7, 6, 0], y: [0, 5, -4, 3, 0] } : { x: 0, y: 0 }} transition={{ duration: 0.42 }}>
      <svg viewBox="0 0 800 450" className="clash-svg" role="img" aria-label="Buyers and sellers fighting over a candle">
        <defs>
          <radialGradient id="clash-glow" cx="50%" cy="46%" r="62%">
            <stop offset="0%" stopColor="#3a2f6b" /><stop offset="100%" stopColor="#0f0d1c" />
          </radialGradient>
        </defs>
        <rect width="800" height="450" rx="22" fill="url(#clash-glow)" />
        {/* price lines, so "up" and "down" mean something */}
        {[20, 40, 60, 80].map((p) => <line key={p} x1="248" x2="552" y1={Y(p)} y2={Y(p)} stroke="#fff" strokeOpacity=".07" strokeWidth="2" />)}
        {/* speed lines while someone charges */}
        {charging && lines.map((i) => (
          <motion.line key={k + "s" + i} x1="0" x2="800" y1={22 + i * 27} y2={22 + i * 27} stroke="#fff" strokeWidth={i % 3 ? 2 : 5}
            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.22, 0] }} transition={{ duration: 0.5, delay: (i % 5) * 0.04 }}
            strokeDasharray={`${60 + (i * 37) % 120} ${40 + (i * 53) % 160}`} />
        ))}
        <path d="M0,396 H800 V428 Q800,450 778,450 H22 Q0,450 0,428 Z" fill="#000" opacity=".35" />
        <line x1="0" x2="800" y1="396" y2="396" stroke="#fff" strokeOpacity=".25" strokeWidth="3" />

        {/* the level the Stop Hunter is after, and the stops hiding under it */}
        {round.level != null && (
          <g>
            <line x1="250" x2="560" y1={Y(round.level)} y2={Y(round.level)} stroke="#7cc7ff" strokeWidth="4" strokeDasharray="12 9" />
            {round.coins && [0, 1, 2, 3, 4, 5].map((i) => (
              <motion.g key={i} initial={false}
                animate={beat.grab ? { x: 640 - (300 + i * 40), y: -70 - (i % 2) * 12, opacity: 0, scale: 0.4 } : { x: 0, y: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: i * 0.05 }}>
                <circle cx={300 + i * 40} cy={Y(round.level) + 22 + (i % 2) * 12} r="10" fill="#ffd23f" stroke={INK} strokeWidth="3" />
                <text x={300 + i * 40} y={Y(round.level) + 27 + (i % 2) * 12} textAnchor="middle" fontSize="12" fontWeight="900" fill={INK}>S</text>
              </motion.g>
            ))}
          </g>
        )}

        {round.prev && <Candle c={round.prev} x={318} w={52} dim />}
        <Candle c={c} />

        {beat.tag && (
          <motion.g key={k + "tag"} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
            <line x1="436" x2="470" y1={tagY} y2={tagY} stroke="#fff" strokeWidth="3" />
            <rect x="470" y={tagY - 17} width={beat.tag.length * 13 + 22} height="34" rx="9" fill="#fff" stroke={INK} strokeWidth="3" />
            <text x={481} y={tagY + 7} fontFamily="Bangers, Impact, sans-serif" fontSize="22" letterSpacing="1.5" fill={INK}>{beat.tag}</text>
          </motion.g>
        )}

        <Fighter kind="bull" x={150} pose={beat.bull} dir={1} />
        <Fighter kind={villain} x={650} pose={beat.bear} dir={-1} />

        <text x="150" y="38" textAnchor="middle" fontFamily="Bangers, Impact, sans-serif" fontSize="26" letterSpacing="2" fill={GREEN}>BUYERS</text>
        <text x="650" y="38" textAnchor="middle" fontFamily="Bangers, Impact, sans-serif" fontSize="26" letterSpacing="2" fill={RED}>
          {villain === "hunter" ? "STOP HUNTER" : "SELLERS"}
        </text>

        <AnimatePresence>
          {/* the hit lands on whoever is being pushed back, clear of the candle */}
          {beat.fx && <Burst key={k + "fx"} k={k + "fx"} x={beat.bear === "charge" ? 232 : 568} y={150} word={beat.fx} />}
        </AnimatePresence>
      </svg>
    </motion.div>
  );
}

/** A small still candle, for cards. Same scale as the stage. */
export function MiniCandle({ c, size = 120 }) {
  const y = (p) => 96 - p * 0.9;
  const draw = (k, x, w, dim) => {
    const up = k.c >= k.o;
    return (
      <g opacity={dim ? 0.5 : 1} key={x}>
        <rect x={x - 2} y={y(k.h)} width="4" height={Math.max(2, y(k.l) - y(k.h))} rx="2" fill={up ? GREEN : RED} stroke={INK} strokeWidth="1.5" />
        <rect x={x - w / 2} y={y(Math.max(k.o, k.c))} width={w} height={Math.max(3, Math.abs(y(k.o) - y(k.c)))} rx="4" fill={up ? GREEN : RED} stroke={INK} strokeWidth="3" />
      </g>
    );
  };
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      {c.prev && draw(c.prev, 32, 18, true)}
      {draw(c, c.prev ? 62 : 50, c.prev ? 28 : 30, false)}
    </svg>
  );
}
