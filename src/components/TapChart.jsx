// A chart he answers by touching. Same look as MiniChart, but every candle (or
// every line) is a big tap target.
//
//   bars   [[o, h, l, c], …]   lines  [{ price, label }]
//   pick   "candle" | "line"   onPick(index)
//   good / bad   indexes to mark green / red      locked  no more taps
const UP = "#f4f1e8", DOWN = "#ff5d6a", LINE = "#9db1ff", GOOD = "#7df0a8";

export default function TapChart({ bars, lines = [], pick = "candle", onPick, good = [], bad = [], locked = false }) {
  const W = 1000, H = 500, PAD = { l: 30, r: lines.length ? 210 : 30, t: 30, b: 30 };
  const prices = bars.flatMap((b) => [b[1], b[2]]).concat(lines.map((l) => l.price));
  const hi = Math.max(...prices) + 4, lo = Math.min(...prices) - 4, span = hi - lo || 1;
  const step = (W - PAD.l - PAD.r) / bars.length, bw = Math.min(64, step * 0.6);
  const X = (i) => PAD.l + step * (i + 0.5);
  const Y = (p) => PAD.t + ((hi - p) / span) * (H - PAD.t - PAD.b);
  const tapC = pick === "candle" && !locked, tapL = pick === "line" && !locked;

  return (
    <svg className="tapchart" viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Chart. Tap your answer.">
      {lines.map((l, k) => {
        const y = Y(l.price), isGood = pick === "line" && good.includes(k), isBad = pick === "line" && bad.includes(k);
        const col = isGood ? GOOD : isBad ? DOWN : LINE, w = Math.min(l.label.length * 13 + 34, PAD.r - 16);
        return (
          <g key={"l" + k} className={"tap-line" + (tapL ? " live" : "")} onClick={tapL ? () => onPick(k) : undefined}
            role={tapL ? "button" : undefined} tabIndex={tapL ? 0 : undefined} aria-label={tapL ? `Line ${l.label}` : undefined}
            onKeyDown={tapL ? (e) => { if (e.key === "Enter" || e.key === " ") onPick(k); } : undefined}>
            <line x1={PAD.l} x2={W - PAD.r + 6} y1={y} y2={y} stroke={col} strokeWidth={isGood || isBad ? 7 : 5} strokeDasharray="14 9" strokeLinecap="round" />
            <rect x={W - PAD.r + 12} y={y - 20} width={w} height="40" rx="20" fill={col} />
            <text x={W - PAD.r + 12 + w / 2} y={y + 8} textAnchor="middle" fill="#14131a" fontWeight="900" fontSize="22">{l.label}</text>
            {/* a fat invisible band, so a finger does not have to hit a 5px line */}
            {tapL && <rect x={PAD.l} y={y - 26} width={W - PAD.l - 4} height="52" fill="transparent" />}
          </g>
        );
      })}
      {bars.map((b, i) => {
        const [o, h, l, c] = b, col = c >= o ? UP : DOWN, top = Y(Math.max(o, c)), bot = Y(Math.min(o, c));
        const isGood = pick === "candle" && good.includes(i), isBad = pick === "candle" && bad.includes(i);
        return (
          <g key={i} className={"tap-candle" + (tapC ? " live" : "") + (isGood ? " good" : "") + (isBad ? " bad" : "")}
            onClick={tapC ? () => onPick(i) : undefined}
            role={tapC ? "button" : undefined} tabIndex={tapC ? 0 : undefined} aria-label={tapC ? `Candle ${i + 1}` : undefined}
            onKeyDown={tapC ? (e) => { if (e.key === "Enter" || e.key === " ") onPick(i); } : undefined}>
            {(isGood || isBad) && <rect x={X(i) - step / 2 + 4} y={Y(h) - 16} width={step - 8} height={Y(l) - Y(h) + 32} rx="14"
              fill={isGood ? "rgba(125,240,168,.16)" : "rgba(255,93,106,.16)"} stroke={isGood ? GOOD : DOWN} strokeWidth="5" />}
            <line x1={X(i)} y1={Y(h)} x2={X(i)} y2={Y(l)} stroke={col} strokeWidth="6" strokeLinecap="round" />
            <rect x={X(i) - bw / 2} y={top} width={bw} height={Math.max(5, bot - top)} rx="5" fill={col} />
            {tapC && <rect className="tap-hit" x={X(i) - step / 2} y={0} width={step} height={H} fill="transparent" />}
          </g>
        );
      })}
    </svg>
  );
}
