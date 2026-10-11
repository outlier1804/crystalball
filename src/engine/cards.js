// ====== Technique cards ======
//
// Every idea in the course, as a card he collects. Nothing here is a second
// progress system: a card is OWNED when the thing that teaches it is done
// (a world's quiz, a battle, an Arena mission), read straight from the save the
// engines already keep. The only thing stored is which cards he has been shown,
// so a new one can be revealed once.
//
//   kind     candle | level | rule | clock | villain | legend
//   rare     1 common · 2 rare · 3 epic · 4 legendary
//   power    what it means, one sentence (kid wording / adult wording)
//   use      when to play it
//   from     how it is earned: { quiz: arcId } | { battle: id } | { mission: id }
//   candle   optional { o, h, l, c, prev } — drawn as the card's art
//
// Art: public/art/cards/<id>.png is used when it exists; otherwise the card
// draws its candle, or its emoji.
import { Voice } from "./voice.js";

const C = (id, name, emoji, kind, rare, power, use, from, candle) => ({ id, name, emoji, kind, rare, power, use, from, candle });

export const CARDS = [
  // ---- candles
  C("body", "The Body", "🟩", "candle", 1,
    ["The fat part of a candle. It is the ground the winner took, from the open to the close.", "The range between a candle's open and close."],
    "Read it first. Bodies first, wicks second.", { battle: "candle" }, { o: 30, h: 80, l: 26, c: 76 }),
  C("wick", "The Wick", "🕯️", "candle", 1,
    ["The thin line. An attack that got pushed back.", "The thin line beyond the body: where price reached and was rejected."],
    "A long wick at your level means price was rejected there.", { battle: "candle" }, { o: 34, h: 88, l: 30, c: 50 }),
  C("hammer", "The Hammer", "🔨", "candle", 2,
    ["Sellers slammed price down and buyers threw it all the way back. Small body on top, long wick below.", "Small body at the top with a long lower wick: sellers pushed down and were rejected."],
    "At a floor, after the candle closes.", { battle: "patterns" }, { o: 64, h: 70, l: 22, c: 68 }),
  C("shooter", "The Shooter", "🌠", "candle", 2,
    ["The hammer upside down. Buyers pushed up and got thrown back. Small body at the bottom, long wick on top.", "Small body at the bottom with a long upper wick: buyers pushed up and were rejected."],
    "At a ceiling, after the candle closes.", { quiz: "arcP" }, { o: 36, h: 80, l: 30, c: 33 }),
  C("doji", "The Doji", "➕", "candle", 2,
    ["It closed almost where it opened. Nobody won. The next candle decides.", "Open and close nearly equal: indecision. The next candle decides."],
    "Never trade the doji itself. Wait for the candle after it.", { battle: "patterns" }, { o: 50, h: 76, l: 26, c: 51 }),
  C("engulfer", "The Engulfer", "🌊", "candle", 3,
    ["A finishing move. One huge body swallows the whole candle before it.", "An outside bar: takes out the previous candle's low and high, and closes beyond it."],
    "At a level, it shows who just took the wheel.", { battle: "patterns" }, { o: 44, h: 82, l: 36, c: 80, prev: { o: 56, h: 60, l: 42, c: 45 } }),
  C("close", "Wait for the Close", "⏳", "rule", 2,
    ["A candle can change shape until its last second. The close is the truth.", "A candle is not final until it closes. Act on the close, not the push."],
    "Every single time a candle looks exciting.", { quiz: "arcP" }),

  // ---- levels and structure
  C("support", "The Floor", "🧱", "level", 1,
    ["A level where price keeps bouncing up. Its real name is support.", "Support: a level where price has repeatedly been held up."],
    "Buyers defend it. Mark it where the bodies closed.", { quiz: "arc3" }),
  C("resistance", "The Ceiling", "🚧", "level", 1,
    ["A level where price keeps getting pushed back down. Its real name is resistance.", "Resistance: a level where price has repeatedly been pushed back."],
    "Sellers defend it. Mark it where the bodies closed.", { quiz: "arc3" }),
  C("flip", "The Flip", "🔄", "level", 2,
    ["When price breaks a ceiling and comes back to it, the old ceiling often becomes the new floor.", "Broken resistance often becomes support, and the reverse."],
    "After a break, watch what price does when it returns.", { quiz: "arc3" }),
  C("stairs", "The Staircase", "🪜", "level", 2,
    ["Higher highs and higher lows are stairs going up. Lower highs and lower lows are stairs going down.", "Market structure: HH/HL is an uptrend, LH/LL a downtrend."],
    "Count the steps before every trade.", { quiz: "arcM" }),
  C("pdlines", "Yesterday's Lines", "📏", "level", 2,
    ["Yesterday's highest price, lowest price, and the middle. Crowds of traders park their orders there.", "PDH, PDL and the PD 50%: prior-day levels where orders cluster."],
    "Draw them before the day starts. Enter at lines, never in the empty middle.", { quiz: "arcK" }),
  C("gap", "The Gas Station", "⛽", "level", 3,
    ["A hole price left when it jumped too fast. Price comes back to fill up, then keeps going.", "A fair value gap: an imbalance price often returns to before continuing."],
    "Only gaps that did something new. Never put your stop inside one.", { quiz: "arc7" }),
  C("topdown", "Hour, 15, Close", "🔭", "rule", 3,
    ["The big chart first. Then the fifteen minute has to agree. Then wait for the close on the small chart.", "Top-down: hourly rejection, 15-minute agreement, entry on a lower-timeframe close."],
    "Skip a step, and it is not the method.", { quiz: "arc7" }),

  // ---- rules
  C("micros", "Micros First", "🐣", "rule", 1,
    ["The small contract. Same chart, ten times smaller. Beginners start here. Always.", "MNQ and MGC are one-tenth the size of NQ and GC. Start there."],
    "Until your rules are a habit.", { quiz: "arcF" }),
  C("shield", "The Shield", "🛡️", "rule", 3,
    ["Your stop-loss. It sits where your idea is wrong, and it never gets dragged further away.", "The stop-loss: placed where the trade idea is invalid, and never widened."],
    "On every trade, before you enter.", { quiz: "arc4" }),
  C("size", "Size Follows the Stop", "⚖️", "rule", 2,
    ["First where the stop goes. Then how many contracts. Never the other way round.", "Position size is derived from the stop distance and the allowed loss."],
    "If the stop costs too much, skip the trade. Do not shrink the stop.", { quiz: "arc4" }),
  C("three", "Three Trades", "3️⃣", "rule", 2,
    ["Three trades, then done. Win or lose.", "A hard limit of three trades a day."],
    "Decided before the day starts. Never bent during it.", { quiz: "arcR" }),

  // ---- the clock
  C("asia", "The Asia Box", "🌙", "clock", 1,
    ["The quiet night session. It builds a small box. Remember its top and bottom.", "The Asia session usually ranges. Its high and low matter later."],
    "London and New York love to come back for those edges.", { quiz: "arcS" }),
  C("newyork", "New York Open", "🗽", "clock", 2,
    ["The main event. News at 8:30, the bell at 9:30. This is when N Q runs fastest.", "The New York session: 8:30 news, 9:30 open, the most active period."],
    "Most of our trading lives right here.", { quiz: "arcS" }),

  // ---- villains: beaten, not owned
  C("fomo", "FOMO", "😱", "villain", 2,
    ["The demon that screams you are missing out, and makes you chase.", "Fear of missing out: the urge to chase a move you did not plan."],
    "Beat it by waiting for your level.", { quiz: "arc5" }),
  C("revenge", "Revenge", "😡", "villain", 2,
    ["The demon that shows up after a loss and wants it all back, right now.", "Revenge trading: re-entering in anger to recover a loss."],
    "Beat it by walking away after a loss.", { quiz: "arc5" }),
  C("dragon", "The Volatility Dragon", "🐉", "villain", 4,
    ["Candles as tall as towers. It eats traders with no shield.", "Extreme volatility: large, fast candles that punish oversized positions."],
    "Beat it with small size and a stop.", { mission: "m5" }),
  C("hype", "The Hype Demon", "🤑", "villain", 3,
    ["A shiny car, a big smile, and a secret it wants to sell you.", "Social-media trading hype: promised returns with no visible risk."],
    "Beat it by asking: where is the proof, and what are they selling?", { quiz: "arc8" }),
  C("hunter", "The Stop Hunter", "🥷", "villain", 4,
    ["It pokes under the lows, grabs the stops of impatient traders, and vanishes.", "The liquidity sweep: price runs stops beyond a level, then reverses."],
    "Beat it by waiting for the close, then trading the snap back.", { battle: "sweep" }),

  // ---- the legend
  C("bread", "B.R.E.A.D", "🍞", "legend", 4,
    ["Behavior. Reaction. Execution. Alignment. Discipline. The same five checks, every single trade.", "Behavior, Reaction, Execution, Alignment, Discipline: the full checklist."],
    "This is the whole method. Everything else is a part of it.", { quiz: "arc10" }),
];

export const KIND_NAME = { candle: "Candle", level: "Level", rule: "Rule", clock: "Clock", villain: "Villain", legend: "Legend" };
export const RARE_NAME = ["", "Common", "Rare", "Epic", "Legendary"];

export const cardPower = (c) => Voice.pick(c.power[0], c.power[1]);

export function cardOwned(card, state) {
  const f = card.from;
  if (f.quiz) return !!state.arcs?.[f.quiz]?.quizDone;
  if (f.mission) return !!state.missions?.[f.mission];
  // Won in the battle — or by the world's quiz, for the adult course (no battles)
  // and for a player who passed that world before battles existed.
  if (f.battle) return !!state.battles?.[f.battle] || !!state.arcs?.[BATTLE_QUIZ[f.battle]]?.quizDone;
  return false;
}
const BATTLE_QUIZ = { candle: "arc2", patterns: "arcP", sweep: "arc9" };

/** How a locked card is earned, in words. */
export function cardHint(card, names) {
  const f = card.from;
  if (f.quiz) return `Pass the quiz in ${names.arc(f.quiz)}`;
  if (f.mission) return `Win the Arena mission ${names.mission(f.mission)}`;
  if (f.battle) return Voice.adult ? `Pass the quiz in ${names.arc(BATTLE_QUIZ[f.battle])}` : `Win the battle in ${names.arc(BATTLE_QUIZ[f.battle])}`;
  return "";
}

export const ownedCards = (state) => CARDS.filter((c) => cardOwned(c, state));

/** Cards he owns but has not been shown yet. */
export const freshCards = (state) => ownedCards(state).filter((c) => !state.cardsSeen?.[c.id]);
