// ====== Picture questions ======
//
// Most of what this course teaches is something you SEE. A question that asks
// "what is a higher low?" in words checks vocabulary; a small chart with one
// labelled line and "is the uptrend broken?" checks the skill. These are added to
// each world's quiz (see data.js), drawn by components/MiniChart.jsx.
//
// The format is deliberately narrow: about ten big candles, at most three lines,
// three choices, one line of why. Charts here are drawn by hand to isolate one
// idea each (the real-data replays live in demos.js).
//
// `film: { id, t }` points at the moment in that world's film which teaches the
// idea, so a wrong answer can offer "watch that part again".
import { INK } from "./chart-ink.js";

const k = (o, h, l, c) => ["", o, h, l, c];
const line = (price, label, color = INK.level, extra = {}) => ({ price, label, color, ...extra });

export const PICTURE = {
  arc2: [
    { q: "Look at candles A and B. Which one did the SELLERS win?",
      chart: { bars: [k(30, 78, 24, 70), k(70, 76, 22, 30)], tags: [{ i: 0, price: 78, text: "A" }, { i: 1, price: 76, text: "B" }] },
      o: ["B — it closed lower than it opened", "A — it is the bigger one", "Neither — they are the same"], a: 0,
      e: "A red candle closed below where it opened: sellers won that one.", film: { id: "candle", t: 19 } },
    { q: "This candle has a long wick underneath. What does that tell you?",
      chart: { bars: [k(60, 64, 48, 50), k(50, 54, 40, 42), k(42, 46, 14, 44)], ring: { i: 2, price: 26 } },
      o: ["Price went down there and got pushed back up", "Price is about to fall further", "Nothing — wicks do not matter"], a: 0,
      e: "The wick shows where price reached. A long one means it was rejected.", film: { id: "candle", t: 27 } },
  ],
  arcP: [
    { q: "Price dropped to your support line. What is the LAST candle called?",
      chart: { bars: [k(70, 74, 60, 62), k(62, 64, 50, 52), k(52, 54, 42, 44), k(44, 48, 22, 46)], lines: [line(30, "SUPPORT")] },
      o: ["A hammer", "A doji", "An engulfing candle"], a: 0,
      e: "Small body on top, long wick below: a hammer. Buyers pushed it all the way back.", film: { id: "patterns", t: 7 } },
    { q: "The last candle dipped under the red candle's low, then closed above its high. Which way do you expect price to go next?",
      chart: { bars: [k(66, 70, 56, 58), k(58, 60, 46, 48), k(48, 50, 38, 40), k(40, 62, 32, 60)], lines: [line(32, "SUPPORT")], tags: [{ i: 3, price: 62, text: "OUTSIDE BAR" }] },
      o: ["Up — the high was the last side it took out", "Down — it went under the low first", "Nowhere — it is an inside bar"], a: 0,
      e: "An engulfing candle (outside bar) takes out both sides. Expect price to continue the way of the LAST side taken — here, up.", film: { id: "patterns", t: 21.5 } },
    { q: "There is a hammer here — but look where it is. Is it a reason to trade?",
      chart: { bars: [k(40, 46, 36, 44), k(44, 52, 42, 50), k(50, 54, 44, 46), k(46, 50, 30, 48), k(48, 54, 46, 52)], ring: { i: 3, price: 38 },
               lines: [line(12, "SUPPORT"), line(88, "RESISTANCE", INK.stop)] },
      o: ["No — it is in the middle, not at a level", "Yes — hammers always work", "Yes — because it is green"], a: 0,
      e: "A pattern only counts at a level. In the middle of nowhere it is just a candle.", film: { id: "patterns", t: 0 } },
  ],
  arc3: [
    { q: "Price has dropped to this line twice and bounced both times. The line is acting as…",
      chart: { bars: [k(60, 64, 40, 42), k(42, 46, 28, 44), k(44, 62, 42, 60), k(60, 66, 52, 54), k(54, 56, 29, 34), k(34, 52, 32, 50)], lines: [line(30, "?")] },
      o: ["Support — a floor", "Resistance — a ceiling", "Nothing"], a: 0,
      e: "Falling stops there and price bounces: that is support.", film: { id: "floors", t: 5.5 } },
    { q: "Price broke UP through the line, then came back to it. What does that old ceiling often become?",
      chart: { bars: [k(30, 48, 28, 46), k(46, 51, 40, 42), k(42, 50, 38, 48), k(48, 68, 46, 66), k(66, 70, 54, 56), k(56, 58, 50, 54)], lines: [line(50, "OLD CEILING", INK.stop)] },
      o: ["A floor", "A ceiling again", "Nothing — it is used up"], a: 0,
      e: "That is the flip: broken resistance often turns into support.", film: { id: "floors", t: 17.7 } },
  ],
  arcM: [
    { q: "Count the steps. The hill marked “?” is a…",
      chart: { bars: [k(14, 24, 12, 22), k(22, 40, 20, 38), k(38, 40, 26, 28), k(28, 30, 22, 24), k(24, 44, 22, 42), k(42, 62, 40, 58), k(58, 60, 46, 48)],
               tags: [{ i: 1, price: 40, text: "HIGH" }, { i: 5, price: 62, text: "?" }] },
      o: ["HH — a higher high", "LH — a lower high", "LL — a lower low"], a: 0,
      e: "It is taller than the hill before it: a higher high.", film: { id: "structure", t: 5.2 } },
    { q: "A wick poked under the last higher low, but the candle closed back above. Is the uptrend broken?",
      chart: { bars: [k(20, 40, 18, 38), k(38, 42, 28, 30), k(30, 56, 28, 54), k(54, 58, 44, 46), k(46, 72, 44, 70), k(70, 72, 38, 52)], lines: [line(44, "LAST HIGHER LOW", INK.target)] },
      o: ["No — only a wick went under", "Yes — it touched the line", "You cannot tell"], a: 0,
      e: "A wick is only a test. It takes a BODY closing below to break the staircase.", film: { id: "structure", t: 25.9 } },
    { q: "Now a candle closed its whole body below the last higher low. Is the uptrend broken?",
      chart: { bars: [k(20, 40, 18, 38), k(38, 42, 28, 30), k(30, 56, 28, 54), k(54, 58, 44, 46), k(46, 72, 44, 70), k(70, 72, 50, 52), k(52, 54, 30, 32)], lines: [line(44, "LAST HIGHER LOW", INK.target)] },
      o: ["Yes — a body closed below it", "No — it needs three candles", "No — red candles do not count"], a: 0,
      e: "Bodies first, wicks second. A body close below the last higher low is the break.", film: { id: "structure", t: 25.9 } },
  ],
  arc4: [
    { q: "You BUY at the entry line. Which line is the right place for the stop?",
      chart: { bars: [k(60, 64, 44, 46), k(46, 48, 30, 34), k(34, 50, 32, 48), k(48, 56, 46, 54)],
               lines: [line(54, "ENTRY", INK.entry, { solid: true }), line(27, "A", INK.stop), line(50, "B", INK.stop), line(6, "C", INK.stop)] },
      o: ["A — just under the last low", "B — right next to the entry", "C — as far away as possible"], a: 0,
      e: "Under the last low is where the idea is proven wrong. B gets hit by a wiggle; C is just a bigger loss.", film: { id: "stop", t: 4.3 } },
  ],
  arcK: [
    { q: "Price is sitting where the ring is. Is this a good place to enter a trade?",
      chart: { bars: [k(40, 46, 36, 44), k(44, 52, 42, 50), k(50, 60, 48, 58), k(58, 68, 56, 66), k(66, 70, 62, 64)], ring: { i: 4, price: 65 },
               lines: [line(88, "PDH", INK.entry), line(50, "PD 50%", INK.target), line(12, "PDL", INK.stop)] },
      o: ["No — it is in the middle, between lines", "Yes — price is going up", "Yes — any time is fine"], a: 0,
      e: "Entries at the lines, targets from the lines. The middle is where beginners get chopped up.", film: { id: "levels", t: 29.7 } },
    { q: "Where is PD 50% on this chart?",
      chart: { bars: [k(50, 58, 46, 56), k(56, 80, 54, 74), k(74, 76, 40, 42), k(42, 44, 20, 26), k(26, 52, 24, 50)],
               lines: [line(80, "A", INK.dim), line(50, "B", INK.dim), line(20, "C", INK.dim)] },
      o: ["B — the middle of yesterday", "A — the top", "C — the bottom"], a: 0,
      e: "PD 50% is exactly halfway between yesterday's high and low.", film: { id: "levels", t: 13.2 } },
  ],
  arc7: [
    { q: "A big candle left a gap. Look at the old hill on the left. Did this move do something NEW?",
      chart: { bars: [k(30, 42, 28, 40), k(40, 56, 38, 52), k(52, 54, 40, 42), k(42, 44, 34, 36), k(36, 48, 34, 46), k(46, 78, 45, 76), k(76, 84, 62, 80)],
               lines: [line(56, "OLD SWING HIGH", INK.target)], tags: [{ i: 5, price: 78, text: "GAP CANDLE" }] },
      o: ["Yes — its body closed above the old swing high", "No — it only made a gap", "You cannot tell"], a: 0,
      e: "It took out a fresh swing point. That is doing something new — this gap is one to watch for an entry.", film: { id: "respect", t: 11.4 } },
    { q: "This candle also left a gap — but look at the old hill. Did THIS move do something new?",
      chart: { bars: [k(30, 44, 28, 42), k(42, 70, 40, 66), k(66, 68, 48, 50), k(50, 52, 36, 38), k(38, 60, 37, 58), k(58, 64, 52, 62)],
               lines: [line(70, "OLD SWING HIGH", INK.target)], tags: [{ i: 4, price: 60, text: "GAP CANDLE" }] },
      o: ["No — it never got past the old swing high", "Yes — every gap counts", "Yes — because it is green"], a: 0,
      e: "It broke nothing new, so it proved nothing. Do not expect this gap to hold when price comes back.", film: { id: "respect", t: 21 } },
  ],
  arc9: [
    { q: "Look at the last candle at the old low. What just happened?",
      chart: { bars: [k(58, 62, 44, 46), k(46, 50, 30, 36), k(36, 50, 34, 48), k(48, 50, 32, 36), k(36, 40, 31, 33), k(33, 37, 14, 35)], lines: [line(30, "OLD LOW")], ring: { i: 5, price: 20 } },
      o: ["A sweep — it poked under and closed back above", "A breakdown — sell now", "Nothing"], a: 0,
      e: "It grabbed the stops under the low and did nothing new. That is a sweep — the snap back is the trade.", film: { id: "sweep", t: 11.9 } },
  ],
};
