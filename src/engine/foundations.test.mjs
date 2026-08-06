// Content self-test for the Foundations track.  `node src/engine/foundations.test.mjs`
//
// This is not a unit test of the renderer — it checks the CONTENT invariants
// that produce a broken sitting for a nine-year-old: a candle whose high is
// below its body, a dashed level the price never actually reaches, a `why`
// hint that explains the option he got RIGHT, a session whose pass mark
// quietly demands 100%, and a build target unreachable in ±5 steps.
import { STAGES, ALL_SESSIONS, gradedCount, passMark, GATE_ORDER, foundationsDoneFor } from "./foundations.js";
let bad = [];
const ids = new Set();
for (const st of STAGES) {
  if (!GATE_ORDER.includes(st.gate)) bad.push(`${st.id}: bad gate ${st.gate}`);
  for (const s of st.sessions) {
    if (ids.has(s.id)) bad.push(`dup id ${s.id}`); ids.add(s.id);
    if (!s.title || !s.idea) bad.push(`${s.id}: missing title/idea`);
    const g = gradedCount(s), pm = passMark(s);
    if (g < 3) bad.push(`${s.id}: only ${g} graded`);
    if (pm >= g && g > 1) bad.push(`${s.id}: passMark ${pm}/${g} demands perfection`);
    if (s.activities.length > 6) bad.push(`${s.id}: ${s.activities.length} activities (>6)`);
    for (const a of s.activities) {
      if (a.type === "pick") {
        if (!Array.isArray(a.o) || a.a == null || a.a < 0 || a.a >= a.o.length) bad.push(`${s.id}: bad pick answer`);
        for (const k of Object.keys(a.why || {})) if (+k === a.a) bad.push(`${s.id}: why[] explains the CORRECT option`);
        if (a.candles) for (const c of a.candles)
          if (c.h < Math.max(c.o,c.c) || c.l > Math.min(c.o,c.c)) bad.push(`${s.id}: impossible candle ${JSON.stringify(c)}`);
        // A level INSIDE the chart's range must actually get touched, or the
        // question is pointing at a line nothing happens at. A level outside
        // the range is deliberate — that's the "target over there" framing.
        if (a.level && a.chart) {
          const lo = Math.min(...a.chart), hi = Math.max(...a.chart);
          const inside = a.level.v >= lo && a.level.v <= hi;
          if (inside && !a.chart.some(v => Math.abs(v - a.level.v) <= 2)) bad.push(`${s.id}: level sits in range but chart never reaches it`);
        }
      }
      if (a.type === "trade") {
        const e = a.before.at(-1), f = a.after.at(-1);
        if (e === f) bad.push(`${s.id}: trade has no direction`);
        // the pre-trade chart must actually LEAN so it's a read, not a guess
        const lean = a.before.at(-1) - a.before[0];
        if (Math.abs(lean) < 15) bad.push(`${s.id}: trade chart too flat to read (${lean})`);
      }
      if (a.type === "build") {
        for (const k of ["o","h","l","c"]) {
          const v = a.target[k];
          if (v % 5 !== 0 || v < 0 || v > 100) bad.push(`${s.id}: build target ${k}=${v} unreachable in ±5 steps`);
        }
      }
      if (a.type === "percent" && (a.koins * a.pct) % 100 !== 0) bad.push(`${s.id}: percent not whole`);
    }
  }
}
// gating: passing only stages 0-3 must open arc1 and arc2 must stay shut
const st = { foundations: {} };
for (const s of ALL_SESSIONS) if (s.gate === "arc1") st.foundations[s.id] = { passed: true };
if (!foundationsDoneFor(st, "arc1")) bad.push("arc1 should be open after stages 0-3");
if (foundationsDoneFor(st, "arc2")) bad.push("arc2 should still need stage 4");
if (!foundationsDoneFor(st, "arc5")) bad.push("arc5 has no foundation gate and must stay open");
console.log(`${STAGES.length} stages, ${ALL_SESSIONS.length} sessions, ${ALL_SESSIONS.reduce((n,s)=>n+s.activities.length,0)} activities`);
console.log(bad.length ? "FAIL:\n" + bad.join("\n") : "ALL CHECKS PASS");
process.exit(bad.length ? 1 : 0);
