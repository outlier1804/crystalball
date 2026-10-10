// A small, loud candlestick chart: a dozen-odd big candles, one or two labelled
// lines, nothing else. Used by the bar-by-bar demos and by picture questions.
//
// The price scale is fixed from ALL the bars and lines it is given, not just the
// ones revealed so far — so candles appear into a frame that does not jump.
//
//   bars    [[label, open, high, low, close], …]
//   shown   how many bars are revealed (default: all)
//   lines   [{ price, label, color, from }]   horizontal lines; `from` = first bar index
//   ring    { i, price }                       a circle to pull the eye
//   tags    [{ i, price, text, color, below }] small labels pinned to a candle
import { INK } from "../engine/chart-ink.js";

const UP = "#f4f1e8", DOWN = "#ff5d6a";

export default function MiniChart({ bars, shown, lines = [], ring, tags = [], height = 520 }) {
  // tags sit above (or below) a candle, so leave them headroom
  const W = 1000, H = height, PAD = { l: 24, r: 250, t: tags.some((t) => !t.below) ? 70 : 34, b: tags.some((t) => t.below) ? 80 : 44 };
  const n = bars.length, count = shown == null ? n : Math.max(0, Math.min(n, shown));
  const prices = bars.flatMap((b) => [b[2], b[3]]).concat(lines.map((l) => l.price));
  const hi = Math.max(...prices), lo = Math.min(...prices), span = hi - lo || 1;
  const step = (W - PAD.l - PAD.r) / n, bw = Math.min(46, step * 0.62);
  const X = (i) => PAD.l + step * (i + 0.5);
  const Y = (p) => PAD.t + ((hi - p) / span) * (H - PAD.t - PAD.b);

  // Label pills for lines that sit close together are pushed apart so none hides another.
  const labelled = lines.map((l) => ({ ...l, ly: Y(l.price) })).sort((p, q) => p.ly - q.ly);
  for (let i = 1; i < labelled.length; i++) if (labelled[i].ly - labelled[i - 1].ly < 36) labelled[i].ly = labelled[i - 1].ly + 36;
  for (let i = labelled.length - 1; i >= 0; i--) {
    const max = (i === labelled.length - 1 ? H - PAD.b + 10 : labelled[i + 1].ly - 36);
    if (labelled[i].ly > max) labelled[i].ly = max;
  }

  return (
    <svg className="minichart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Price chart">
      {labelled.map((l, k) => {
        const x1 = l.from != null ? X(l.from) - step / 2 : PAD.l, y = Y(l.price);
        const w = Math.min(l.label.length * 11.5 + 26, PAD.r - 14), lx = W - PAD.r + 10;
        return (
          <g key={"l" + k} className="mc-line">
            <line x1={x1} y1={y} x2={W - PAD.r + 4} y2={y} stroke={l.color} strokeWidth="4" strokeDasharray={l.solid ? "" : "12 8"} strokeLinecap="round" />
            {/* the pill may sit off its line when two lines are close — a short tick joins them */}
            {Math.abs(l.ly - y) > 2 && <line x1={W - PAD.r + 4} y1={y} x2={lx} y2={l.ly} stroke={l.color} strokeWidth="3" />}
            <rect x={lx} y={l.ly - 16} width={w} height="32" rx="16" fill={l.color} />
            <text x={lx + w / 2} y={l.ly + 6.5} textAnchor="middle" fill="#14131a" fontWeight="900" fontSize="18">{l.label}</text>
          </g>
        );
      })}
      {bars.slice(0, count).map((b, i) => {
        const [, o, h, l, c] = b, col = c >= o ? UP : DOWN, top = Y(Math.max(o, c)), bot = Y(Math.min(o, c));
        return (
          <g key={i} className={"mc-candle" + (i === count - 1 ? " new" : "")}>
            <line x1={X(i)} y1={Y(h)} x2={X(i)} y2={Y(l)} stroke={col} strokeWidth="5" strokeLinecap="round" />
            <rect x={X(i) - bw / 2} y={top} width={bw} height={Math.max(4, bot - top)} rx="4" fill={col} />
          </g>
        );
      })}
      {bars.map((b, i) => (i % 4 === 0 && i < count ? (
        <text key={"t" + i} x={X(i)} y={H - 12} textAnchor="middle" fill={INK.dim} fontSize="20" fontWeight="700">{b[0]}</text>
      ) : null))}
      {ring && ring.i < count && <circle className="mc-ring" cx={X(ring.i)} cy={Y(ring.price)} r="48" fill="none" stroke="#ffd978" strokeWidth="6" />}
      {tags.filter((t) => t.i < count).map((t, k) => {
        const w = t.text.length * 12 + 24, y = Y(t.price) + (t.below ? 40 : -40);
        return (
          <g key={"g" + k} className="mc-tag">
            <rect x={X(t.i) - w / 2} y={y - 17} width={w} height="34" rx="17" fill={t.color || UP} />
            <text x={X(t.i)} y={y + 7} textAnchor="middle" fill="#14131a" fontWeight="900" fontSize="20">{t.text}</text>
          </g>
        );
      })}
    </svg>
  );
}
