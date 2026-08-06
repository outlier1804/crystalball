// Position sizing must agree with the course.  `node src/engine/sizing.test.mjs`
//
// The Dojo now asks the question lessons 02/04/10 drill: risk budget ÷ what one
// share risks = how many shares. If this arithmetic ever drifts from the films,
// the game teaches one sum and tests another — which is worse than not asking.
//
// It also pins the reason START_BALANCE moved 1,000 → 10,000: at 1,000 the 1%
// budget was 10 Koins and the cheapest shield cost 30, so no trade was affordable
// under the rule the whole course teaches.
import { Sim } from "./sim.js";

let ok = 0;
const bad = [];
const is = (got, want, msg) => {
  if (JSON.stringify(got) === JSON.stringify(want)) ok++;
  else bad.push(`${msg}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
};

// bare-handed loadout
Sim.startBal = 10000;
Sim.koinPerPoint = 10;
Sim.stats = { balance: 10000 };

is(Sim.riskBudget(), 100, "1% of a 10,000 pile is 100 Koins");

// the three shields the Dojo offers -> whole share counts, none over the rule
const table = [[3, 30, 3], [5, 50, 2], [10, 100, 1]];
for (const [stop, cost, shares] of table) {
  Sim.stopSize = stop;
  is(Sim.costPerShare(), cost, `stop ${stop} costs ${cost} per share`);
  is(Sim.recommendedShares(), shares, `stop ${stop} allows ${shares} share(s)`);
  if (Sim.riskPctAt(shares) > 0.0101) bad.push(`stop ${stop}: rule size exceeds 1%`);
  else ok++;
}

// the lesson's own relationship: a wider shield must mean FEWER shares
Sim.stopSize = 3; const wide3 = Sim.recommendedShares();
Sim.stopSize = 10; const wide10 = Sim.recommendedShares();
is(wide3 > wide10, true, "a wider shield allows fewer shares");

// doubling the size doubles the risk — the thing he has to feel
Sim.stopSize = 5;
is([Sim.riskAt(2), Sim.riskAt(4)], [100, 200], "double the shares, double the risk");
is(Sim.riskPctAt(4) > 0.0101, true, "4 shares at a 5-pt stop breaks the 1% rule");

// never returns a size of zero — a rule that forbids every trade teaches nothing
Sim.stats = { balance: 10 };
is(Sim.recommendedShares(), 1, "a tiny pile still allows one share, never zero");

// no shield => risk is undefined, so sizing is impossible rather than infinite
Sim.stats = { balance: 10000 }; Sim.stopSize = 0;
is(Sim.costPerShare(), 0, "no shield means no defined risk per share");

// the old scale really was broken — this is why the balance moved
Sim.stats = { balance: 1000 }; Sim.stopSize = 3;
is(Math.floor(Sim.riskBudget() / 30), 0, "at a 1,000 pile the rule allowed 0 shares (the old bug)");

if (bad.length) {
  console.log(`\n❌ ${bad.length} failed, ${ok} passed`);
  bad.forEach((b) => console.log("   " + b));
  process.exit(1);
}
console.log(`\n✅ position sizing: ${ok}/${ok} passed`);
