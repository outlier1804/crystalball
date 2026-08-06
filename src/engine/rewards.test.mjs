// Streak-freeze arithmetic.  `node src/engine/rewards.test.mjs`
//
// Tests the REAL nextStreak, not a copy of it — an earlier draft of this file
// re-implemented the transition and would have kept passing after the real code
// changed. The whole feature is this arithmetic, so it is the thing to pin.
//
// What a freeze is for: without one, a bad week wipes a 12-day streak, and a
// number that only ever punishes a kid who already finds this hard is a reason to
// stop opening the app. What it must NOT become: unloseable, which would make it
// meaningless. Hence — bridges exactly one missed day, and only if one is banked.
import { nextStreak } from "./rewards.js";

const DAY_MS = 86400000;
const key = (n) => {
  const d = new Date(n * DAY_MS);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
};

let ok = 0;
const bad = [];
function is(got, want, msg) {
  if (JSON.stringify(got) === JSON.stringify(want)) ok++;
  else bad.push(`${msg}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
}

// --- five consecutive days earns exactly one freeze
let st = { count: 0, longest: 0, lastDay: null, freezes: 0 };
let r;
for (let d = 1; d <= 5; d++) { r = nextStreak(st, key(d)); st = r.next; }
is([st.count, st.freezes], [5, 1], "5 consecutive days earns a freeze");

// --- misses day 6, returns on day 7: the freeze is spent and the streak SURVIVES
r = nextStreak(st, key(7)); st = r.next;
is([r.froze, st.count, st.freezes], [true, 6, 0], "one missed day is bridged");

// --- misses again with nothing banked: the streak really does reset
r = nextStreak(st, key(9)); st = r.next;
is([r.froze, st.count], [false, 1], "no freeze banked -> reset to 1");

// --- two missed days in a row is NOT bridged, even holding freezes
r = nextStreak({ count: 9, longest: 9, lastDay: key(20), freezes: 2 }, key(23));
is([r.froze, r.next.count, r.next.freezes], [false, 1, 2],
   "3-day gap resets and does not spend a freeze");

// --- freezes cap
r = nextStreak({ count: 9, longest: 9, lastDay: key(30), freezes: 2 }, key(31));
is(r.next.freezes, 2, "freezes cap at the maximum");

// --- longest is never walked backwards by a reset
r = nextStreak({ count: 12, longest: 12, lastDay: key(40), freezes: 0 }, key(50));
is([r.next.count, r.next.longest], [1, 12], "a reset keeps the longest-ever record");

// --- revived only when a real streak actually broke
is(nextStreak({ count: 0, longest: 0, lastDay: null, freezes: 0 }, key(1)).revived, false,
   "first ever day is not a revival");
is(nextStreak({ count: 4, longest: 4, lastDay: key(1), freezes: 0 }, key(9)).revived, true,
   "returning after a real break is a revival");

if (bad.length) {
  console.log(`\n❌ ${bad.length} failed, ${ok} passed`);
  bad.forEach((b) => console.log("   " + b));
  process.exit(1);
}
console.log(`\n✅ streak freezes: ${ok}/${ok} passed`);
