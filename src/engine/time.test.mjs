// Time-on-task analytics.  `node src/engine/time.test.mjs`
//
// Time is the one signal accuracy cannot give: a concept answered correctly but
// replayed four times is not mastered, it is being ground out. That only helps if
// the numbers are trustworthy — an inflated total (a tab left open overnight) is
// worse than no number, because a parent would act on it.
import { timePerDay, timeToday, timeTotal, stickiestClips, slowestSessions,
         effortLabel, fmtMins } from "./analytics.js";

let ok = 0;
const bad = [];
const is = (got, want, msg) => {
  if (JSON.stringify(got) === JSON.stringify(want)) ok++;
  else bad.push(`${msg}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
};

const today = new Date().toISOString().slice(0, 10);
const dayAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };

// ---- formatting reads like a person wrote it
is(fmtMins(0), "under a minute", "zero reads as under a minute");
is(fmtMins(30000), "under a minute", "30s reads as under a minute");
is(fmtMins(9 * 60000), "9 min", "9 minutes");
is(fmtMins(95 * 60000), "1h 35m", "over an hour splits into h/m");

// ---- per-day series is fixed length, oldest first, gaps zero-filled
const st = { timeDays: { [today]: 600000, [dayAgo(3)]: 300000 } };
const series = timePerDay(st, 7);
is(series.length, 7, "seven days requested, seven returned");
is(series[series.length - 1].day, today, "the last entry is today");
is(series[series.length - 1].ms, 600000, "today's total is carried");
is(series[0].ms, 0, "a day with no activity is zero, not missing");

is(timeToday(st), 600000, "today's minutes");
is(timeTotal(st), 900000, "all-time is the sum of every day");
is(timeToday({}), 0, "empty state reads zero rather than throwing");
is(timeTotal({}), 0, "empty all-time is zero");

// ---- replays are the headline, so they must be counted right
const clips = {
  time: {
    "clip:lesson-04b": { ms: 240000, n: 4 },
    "clip:lesson-01a": { ms: 60000, n: 1 },
    "session:s3a": { ms: 900000, n: 2 },   // must not leak into the clip list
  },
};
const sticky = stickiestClips(clips);
is(sticky.length, 2, "only clips are listed");
is(sticky[0].id, "lesson-04b", "the most-watched clip ranks first");
is(sticky[0].replays, 3, "four views is three replays, not four");
is(sticky[1].replays, 0, "a single view is zero replays");

// ---- sessions carry whether the time actually bought a pass
const sess = {
  time: { "session:s3a": { ms: 900000, n: 2 }, "clip:lesson-01a": { ms: 1000, n: 1 } },
  foundations: { s3a: { passed: true, attempts: 3 } },
};
const slow = slowestSessions(sess);
is(slow.length, 1, "only sessions are listed");
is([slow[0].passed, slow[0].attempts, slow[0].sittings], [true, 3, 2],
   "a long session reports passed, attempts and sittings — effort the score hides");

// ---- effort sentence
is(effortLabel({}).dir, "flat", "no data is flat, not a failure");
const busy = { timeDays: Object.fromEntries([0, 1, 2, 3, 4].map((n) => [dayAgo(n), 600000])) };
is(effortLabel(busy).dir, "up", "five active days this week reads as up");

if (bad.length) {
  console.log(`\n❌ ${bad.length} failed, ${ok} passed`);
  bad.forEach((b) => console.log("   " + b));
  process.exit(1);
}
console.log(`\n✅ time on task: ${ok}/${ok} passed`);
