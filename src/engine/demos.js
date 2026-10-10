// ====== "Watch me do it" — bar-by-bar demos on real mornings ======
//
// The gap these fill: lessons explain an idea and the Arena asks him to trade it,
// with nothing in between that shows the whole thing being DONE once, slowly, by
// someone narrating their thinking. Each demo is three passes over the same kind
// of setup:
//
//   1. WATCH   a real morning replays one candle at a time while the narrator
//              says what they see and why they do nothing / act / wait.
//   2. TRY     a different real morning, same setup. He makes the three
//              decisions himself; every answer, right or wrong, gets a reason.
//   3. (then the path sends him to the Arena mission to do it alone)
//
// The mornings are real MNQ data (demos-data.js). They were picked with
// hindsight, which the "loss" demo exists to counterweight: the plan includes
// being wrong, and a stop that gets hit is the plan working.
import { DEMO_DATA } from "./demos-data.js";
import { INK } from "./chart-ink.js";

const LEVEL_LABEL = {
  "PDL": ["YESTERDAY'S LOW", "yesterday's low"],
  "PDH": ["YESTERDAY'S HIGH", "yesterday's high"],
  "PD 50%": ["YESTERDAY'S MIDDLE", "the middle of yesterday"],
  "OVERNIGHT LOW": ["OVERNIGHT LOW", "the overnight low"],
  "OVERNIGHT HIGH": ["OVERNIGHT HIGH", "the overnight high"],
};
const fmt = (p) => p.toLocaleString("en-US", { minimumFractionDigits: p % 1 ? 2 : 0 });
const niceDate = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
const usd = (pts) => "$" + Math.round(pts * 2);          // one Micro NQ contract: $2 a point

/** Everything the screen needs for one real morning. */
function facts(d) {
  const long = d.dir === 1;
  const [label, spoken] = LEVEL_LABEL[d.level] || [d.level, d.level];
  const target = d.entry + d.dir * 2 * d.risk;
  const level = { price: d.levelPrice, label, color: INK.level };
  const entry = { price: d.entry, label: "ENTRY", color: INK.entry, solid: true, from: d.react };
  const stop = { price: d.stop, label: "STOP", color: INK.stop, solid: true, from: d.react };
  const tgt = { price: target, label: "TARGET", color: INK.target, solid: true, from: d.react };
  const wick = long ? d.bars[d.react][3] : d.bars[d.react][2];
  return { d, long, label, spoken, target, level, entry, stop, tgt, wick };
}

// ---- pass 1: the narrated replay. Each step: bars shown, what is drawn, what is said [kid, adult].
function watchSteps(d, flavour) {
  const f = facts(d), { long, spoken, level, entry, stop, tgt } = f;
  const side = long ? "below" : "above", back = long ? "back up" : "back down";
  const act = long ? "buy" : "sell first", way = long ? "up" : "down";
  const steps = [
    { n: Math.max(4, d.react - 6), lines: [level],
      say: [`This is a real morning on NQ — ${niceDate(d.date)}. Every candle is five minutes. Before the bell, we drew one line: ${spoken}.`,
            `A real NQ morning, ${niceDate(d.date)}, on five-minute candles. One level was marked before the open: ${spoken}.`] },
    { n: d.react, lines: [level],
      say: [`Price is heading for our line. And we do… nothing. Price arriving is only the knock on the door.`,
            `Price approaches the level. There is no trade yet — arriving at a level is not a signal.`] },
    { n: d.react + 1, lines: [level], ring: { i: d.react, price: f.wick },
      say: [flavour === "sweep"
              ? `Look! It poked right THROUGH the line and grabbed the stops hiding there… then the body closed ${back} on our side. That poke is a sweep.`
              : `There. It touched the line and got pushed ${back}. Long wick ${side}, and the candle CLOSED on our side. That is our reaction candle.`,
            flavour === "sweep"
              ? `The candle trades through the level, taking the stops resting there, and the body closes back on the other side. That is a liquidity sweep.`
              : `The reaction: a wick into the level and a body close back on our side. The candle has closed, so it counts.`] },
    { n: d.react + 1, lines: [level, entry],
      say: [`The candle closed, so NOW we act. We ${act} right where it closed: ${fmt(d.entry)}.`,
            `With the candle closed, we ${act} at its close: ${fmt(d.entry)}.`] },
    { n: d.react + 1, lines: [level, entry, stop],
      say: [`The stop goes just past the wick: ${fmt(d.stop)}. If price gets there, our idea was wrong. That is ${fmt(d.risk)} points — ${usd(d.risk)} on one Micro.`,
            `The stop goes just beyond the wick at ${fmt(d.stop)} — where the idea is invalid. Risk: ${fmt(d.risk)} points, ${usd(d.risk)} per Micro contract.`] },
    { n: d.react + 1, lines: [level, entry, stop, tgt],
      say: [`And the target: twice as far as the stop. We risk ${fmt(d.risk)} points to try to make ${fmt(d.risk * 2)}.`,
            `The target is twice the risk: ${fmt(d.risk * 2)} points, a 2R trade.`] },
  ];
  // let the trade play out a couple of candles at a time
  for (let n = d.react + 2; n < d.exit + 1; n += 2) {
    steps.push({ n: Math.min(n, d.exit), lines: [level, entry, stop, tgt],
      say: n === d.react + 2
        ? [`Now the hard part: we wait. No touching the stop. No peeking at the money.`, `Now we wait. The stop stays where the chart put it.`]
        : [`Still waiting. The plan has not changed, so neither do we.`, `No change to the plan, so no action.`] });
  }
  if (d.win) {
    steps.push({ n: d.exit + 1, lines: [level, entry, stop, tgt], ring: { i: d.exit, price: f.target },
      say: [`Target hit! Plus ${fmt(d.risk * 2)} points — ${usd(d.risk * 2)} on one Micro. We did not guess. We followed four steps.`,
            `Target reached: +${fmt(d.risk * 2)} points, ${usd(d.risk * 2)} per Micro contract.`] });
  } else {
    steps.push({ n: d.exit + 1, lines: [level, entry, stop, tgt], ring: { i: d.exit, price: d.stop },
      say: [`Stopped out. Minus ${fmt(d.risk)} points — ${usd(d.risk)} on one Micro. That stings… and it is the plan WORKING. A small loss, decided before we clicked.`,
            `Stopped out: −${fmt(d.risk)} points, ${usd(d.risk)} per Micro contract. That is the plan working — a small loss, sized in advance.`] });
    steps.push({ n: d.bars.length, lines: [level, stop],
      say: [`And look what happened next. Price kept falling. Without that stop, a small loss becomes a huge one. Look left, too: the stairs were going DOWN all morning. We bought against them.`,
            `Price continued lower. Without the stop the loss would have kept growing. Note the context: structure was making lower highs and lower lows all morning — this was a counter-trend long.`] });
  }
  steps.push({ n: d.bars.length, lines: [level, entry, stop, tgt],
    say: [`So, every time: a line we drew early. A reaction candle that CLOSES. Entry, stop, target. Then wait. Your turn!`,
          `The sequence, every time: a pre-marked level, a closed reaction candle, entry with stop and target, then patience. Now you try one.`] });
  return steps;
}

// ---- pass 2: three decisions on a different real morning.
function tryQuestions(d) {
  const f = facts(d), { long, spoken, level, entry, stop, tgt } = f;
  const wrongWay = long ? "Sell right now" : "Buy right now", rightWay = long ? "Buy right now" : "Sell right now";
  return [
    { n: d.react, lines: [level],
      q: [`A different real morning — ${niceDate(d.date)}. Price is coming to ${spoken}. What do you do?`,
          `A different real morning, ${niceDate(d.date)}. Price is approaching ${spoken}. What is the correct action?`],
      o: ["Wait for a candle to close", rightWay, wrongWay], a: 0,
      why: [["Yes. Arriving is only the knock on the door. You need a CLOSED reaction candle first.",
             "Correct. Reaching a level is not an entry; a closed reaction candle is."],
            ["Too early. The candle is not finished — it can still close on the wrong side of the line.",
             "Too early. The candle has not closed and can still finish on the wrong side of the level."],
            ["That is trading against the line before price has shown you anything. Wait for the close.",
             "That trades against the level with no evidence. Wait for the close."]] },
    { n: d.react + 1, lines: [level, entry], ring: { i: d.react, price: f.wick },
      q: [`It closed back on our side — you are in at ${fmt(d.entry)}. Where does the stop go?`,
          `The reaction candle closed and you are in at ${fmt(d.entry)}. Where does the stop go?`],
      o: [`Just past the wick, at ${fmt(d.stop)}`, "Right at my entry, so I can't lose", "Far, far away, to be safe"], a: 0,
      why: [["Yes. Past the wick is where the idea is proven wrong. The chart picks the spot.",
             "Correct. Beyond the wick is where the idea is invalid — the chart sets the stop."],
            ["A stop at your entry gets hit by a normal wiggle. You'd be out before the move even starts.",
             "A stop at entry is taken out by normal noise before the trade can work."],
            ["A far-away stop is a bigger loss, not a safer trade. The stop belongs where you are wrong.",
             "A distant stop only enlarges the loss. It belongs where the idea is invalid."]] },
    { n: Math.min(d.react + 2, d.exit), lines: [level, entry, stop, tgt],
      q: [`You are in, with a stop and a target. Price wiggles around. What now?`,
          `You are in with a stop and a target, and price is moving around. What now?`],
      o: ["Leave it alone and wait", "Move the stop further away", "Add more contracts"], a: 0,
      why: [["Yes. The plan was made before you clicked. Now your only job is to not mess with it.",
             "Correct. The plan was set before entry; the job now is to leave it alone."],
            ["That is the police chase — running from your own stop. It turns a small loss into a big one.",
             "Widening the stop converts a planned small loss into an unplanned large one."],
            ["More contracts is more speed, not more skill. The size was decided by the stop.",
             "Adding size increases risk beyond what the stop was sized for."]] },
  ];
}

const DEMOS = {
  long:  { title: "Your first trade: a bounce", world: "arc2", before: "m1", flavour: "bounce" },
  short: { title: "Selling first: the rejection", world: "arc3", before: "m2", flavour: "bounce" },
  loss:  { title: "The stop does its job", world: "arc4", before: "m3", flavour: "bounce" },
  sweep: { title: "Poke, close, snap back", world: "arc9", before: "m9", flavour: "sweep" },
};

export const DEMO_LIST = Object.entries(DEMOS).map(([id, meta]) => ({ id, ...meta }));

export function demoFor(id) {
  const meta = DEMOS[id];
  if (!meta) return null;
  const watch = DEMO_DATA[`${id}-watch`], attempt = DEMO_DATA[`${id}-try`];
  return {
    id, ...meta, watch, attempt,
    steps: watchSteps(watch, meta.flavour),
    questions: tryQuestions(attempt),
    ending: facts(attempt),
  };
}
