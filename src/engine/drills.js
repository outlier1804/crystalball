// ====== Hands-on drills: do it on the chart ======
//
// A multiple-choice question asks "which of these sentences is true?". A trader
// never does that. A trader looks at a chart and points: that candle, that low,
// that line. These drills are that — every task is answered by tapping the
// chart itself.
//
//   bars    [[open, high, low, close], …] on a 0-100 scale
//   lines   [{ price, label }] horizontal lines drawn on the chart
//   pick    "candle" (default) or "line" — what he taps
//   a       the right answer: an index, or a list of indexes that all count
//   q / e   the task and the explanation (both narrated: tools/vogen/lines.mjs)
//
// One drill per chart-reading world; it sits after the story and before the quiz.
export const DRILLS = {
  arc2: { title: "Read the candles", tasks: [
    { q: "Tap the candle where the buyers won the MOST ground.",
      bars: [[40, 55, 38, 52], [52, 58, 50, 51], [51, 80, 49, 78], [78, 82, 60, 62], [62, 70, 45, 48], [48, 66, 47, 64]], a: 2,
      e: "The body is the ground the winner took. The biggest body that closed higher is where the buyers won the most." },
    { q: "Tap a candle that the SELLERS won.",
      bars: [[40, 55, 38, 52], [52, 58, 50, 51], [51, 80, 49, 78], [78, 82, 60, 62], [62, 70, 45, 48], [48, 66, 47, 64]], a: [1, 3, 4],
      e: "A candle that closed lower than it opened is a seller candle. On our charts it is red." },
    { q: "Tap the candle with the longest wick on TOP.",
      bars: [[50, 56, 48, 54], [54, 60, 52, 58], [58, 86, 57, 61], [61, 66, 58, 64], [64, 68, 40, 66]], a: 2,
      e: "That long top wick is an attack that got pushed back. Buyers reached way up there and were thrown back down." },
  ] },
  arcP: { title: "Spot the special candles", tasks: [
    { q: "Tap the HAMMER.",
      bars: [[70, 72, 62, 64], [64, 66, 55, 57], [57, 59, 38, 58], [58, 68, 57, 67], [67, 74, 60, 67.6], [67.6, 69, 52, 54], [54, 56, 50, 51], [51, 66, 49, 65]], a: 2,
      e: "Small body on top, long wick below. Sellers shoved price down and buyers shoved it all the way back." },
    { q: "Tap the DOJI.",
      bars: [[70, 72, 62, 64], [64, 66, 55, 57], [57, 59, 38, 58], [58, 68, 57, 67], [67, 74, 60, 67.6], [67.6, 69, 52, 54], [54, 56, 50, 51], [51, 66, 49, 65]], a: 4,
      e: "It closed almost exactly where it opened. Nobody won. The next candle decides." },
    { q: "Tap the ENGULFING candle.",
      bars: [[70, 72, 62, 64], [64, 66, 55, 57], [57, 59, 38, 58], [58, 68, 57, 67], [67, 74, 60, 67.6], [67.6, 69, 52, 54], [54, 56, 50, 51], [51, 66, 49, 65]], a: 7,
      e: "It dipped under the low of the small candle before it, then closed above that candle's high. One body swallowed the whole thing." },
  ] },
  arc3: { title: "Find the floor and the ceiling", tasks: [
    { q: "Price keeps bouncing at the same low. Tap any candle that touched the FLOOR.",
      bars: [[60, 62, 50, 52], [52, 54, 40, 47], [47, 58, 46, 56], [56, 60, 48, 50], [50, 51, 40, 46], [46, 57, 45, 55], [55, 62, 53, 60], [60, 61, 47, 49], [49, 59, 40, 57]], a: [1, 4, 8],
      e: "Three times price fell to the same level and bounced. That level is support. A floor." },
    { q: "Three lines. Tap the one that is the FLOOR.", pick: "line",
      bars: [[60, 62, 50, 52], [52, 54, 40, 47], [47, 58, 46, 56], [56, 60, 48, 50], [50, 51, 40, 46], [46, 57, 45, 55], [55, 62, 53, 60], [60, 61, 47, 49], [49, 59, 40, 57]],
      lines: [{ price: 62, label: "A" }, { price: 51, label: "B" }, { price: 40, label: "C" }], a: 2,
      e: "Look left and count the touches. Price bounced off line C again and again. That is the floor." },
    { q: "Price broke up through the old ceiling, then came back to it. Tap the candle that came BACK and bounced.",
      bars: [[45, 50, 44, 49], [49, 60, 48, 55], [55, 60, 52, 53], [53, 60, 51, 58], [58, 72, 57, 70], [70, 74, 66, 68], [68, 69, 60, 62], [62, 76, 61, 75]],
      lines: [{ price: 60, label: "old ceiling" }], a: 6,
      e: "That is the flip. The old ceiling became the new floor, and price bounced off it." },
  ] },
  arcM: { title: "Count the stairs", tasks: [
    { q: "This is an uptrend. Tap a HIGHER HIGH.",
      bars: [[30, 40, 28, 38], [38, 39, 33, 35], [35, 52, 34, 50], [50, 51, 43, 45], [45, 64, 44, 62], [62, 63, 55, 57], [57, 58, 40, 42]], a: [2, 4],
      e: "A hill that is higher than the hill before it is a higher high." },
    { q: "Tap the last HIGHER LOW. That is the step holding the staircase up.",
      bars: [[30, 40, 28, 38], [38, 39, 33, 35], [35, 52, 34, 50], [50, 51, 43, 45], [45, 64, 44, 62], [62, 63, 55, 57], [57, 58, 40, 42]], a: 5,
      e: "Each valley was higher than the one before. The last one is the step everything is standing on." },
    { q: "Tap the candle that BROKE the staircase.",
      bars: [[30, 40, 28, 38], [38, 39, 33, 35], [35, 52, 34, 50], [50, 51, 43, 45], [45, 64, 44, 62], [62, 63, 55, 57], [57, 58, 40, 42]], a: 6,
      e: "Its body closed below the last higher low. Not a wick poking under. A body. The staircase is broken." },
  ] },
  arc4: { title: "Place the shield", tasks: [
    { q: "You bought because price bounced off a low. Tap the candle that made that low.",
      bars: [[50, 52, 40, 42], [42, 44, 35, 43], [43, 55, 42, 54], [54, 60, 52, 58]], a: 1,
      e: "That is the low your whole idea rests on. If price closes back under it, the idea is broken." },
    { q: "Three places for your stop. Tap the line where it belongs.", pick: "line",
      bars: [[50, 52, 40, 42], [42, 44, 35, 43], [43, 55, 42, 54], [54, 60, 52, 58]],
      lines: [{ price: 48, label: "A" }, { price: 33, label: "B" }, { price: 14, label: "C" }], a: 1,
      e: "Just under the last low. A is in the middle of nowhere and gets hit by normal wiggles. C is so far away that being wrong costs far too much." },
  ] },
  arc7: { title: "Find the gap", tasks: [
    { q: "Three candles left a hole in the chart. Tap the BIG middle candle that made it.",
      bars: [[40, 44, 38, 43], [43, 46, 41, 45], [45, 70, 44, 68], [68, 74, 66, 72], [72, 75, 67, 68], [68, 69, 52, 67], [67, 79, 66.5, 78]], a: 2,
      e: "Price leaped so fast that the wicks of the candles on each side do not touch. The space between them is the fair value gap." },
    { q: "The gap is between the two lines. Price came back for gas. Tap the candle that dipped INTO the gap.",
      bars: [[40, 44, 38, 43], [43, 46, 41, 45], [45, 70, 44, 68], [68, 74, 66, 72], [72, 75, 67, 68], [68, 69, 52, 67], [67, 79, 66.5, 78]],
      lines: [{ price: 66, label: "top of gap" }, { price: 46, label: "bottom of gap" }], a: 5,
      e: "It dipped in, got its gas, and the very next candle carried on the same way." },
    { q: "Two places for a stop. Tap the line where it is SAFE.", pick: "line",
      bars: [[40, 44, 38, 43], [43, 46, 41, 45], [45, 70, 44, 68], [68, 74, 66, 72], [72, 75, 67, 68], [68, 69, 52, 67], [67, 79, 66.5, 78]],
      lines: [{ price: 57, label: "A" }, { price: 42, label: "B" }], a: 1,
      e: "Never inside the gap. Price comes in to fill it and takes you out first. The stop goes beyond it." },
  ] },
  arcK: { title: "Draw yesterday's lines", tasks: [
    { q: "This is yesterday. Tap the line at P D H, the previous day high.", pick: "line",
      bars: [[50, 58, 48, 56], [56, 80, 55, 76], [76, 78, 60, 62], [62, 64, 30, 34], [34, 52, 32, 50]],
      lines: [{ price: 80, label: "A" }, { price: 55, label: "B" }, { price: 30, label: "C" }], a: 0,
      e: "The highest price yesterday reached is the previous day high." },
    { q: "Now tap P D L, the previous day low.", pick: "line",
      bars: [[50, 58, 48, 56], [56, 80, 55, 76], [76, 78, 60, 62], [62, 64, 30, 34], [34, 52, 32, 50]],
      lines: [{ price: 80, label: "A" }, { price: 55, label: "B" }, { price: 30, label: "C" }], a: 2,
      e: "The lowest price yesterday reached is the previous day low." },
    { q: "Tap the P D fifty percent line.", pick: "line",
      bars: [[50, 58, 48, 56], [56, 80, 55, 76], [76, 78, 60, 62], [62, 64, 30, 34], [34, 52, 32, 50]],
      lines: [{ price: 80, label: "A" }, { price: 55, label: "B" }, { price: 30, label: "C" }], a: 1,
      e: "Exactly in the middle of yesterday. Above it buyers have the upper hand. Below it, sellers do." },
  ] },
  arc9: { title: "Catch the Stop Hunter", tasks: [
    { q: "Tap the SWEEP: the candle that poked under the low and closed back above it.",
      bars: [[55, 57, 48, 50], [50, 52, 42, 44], [44, 46, 40, 43], [43, 47, 41, 46], [46, 48, 33, 45], [45, 60, 44, 58], [58, 62, 50, 52], [52, 53, 36, 38]],
      lines: [{ price: 40, label: "the low" }], a: 4,
      e: "Its wick went under the line and grabbed the stops, but its body closed back above. It did nothing new. That is a sweep." },
    { q: "Tap the SNAP BACK, the candle you would trade.",
      bars: [[55, 57, 48, 50], [50, 52, 42, 44], [44, 46, 40, 43], [43, 47, 41, 46], [46, 48, 33, 45], [45, 60, 44, 58], [58, 62, 50, 52], [52, 53, 36, 38]],
      lines: [{ price: 40, label: "the low" }], a: 5,
      e: "After the sweep closes, price runs the other way. You wait for the close, then trade the snap back." },
    { q: "Tap the REAL BREAK: the candle whose BODY closed under the low.",
      bars: [[55, 57, 48, 50], [50, 52, 42, 44], [44, 46, 40, 43], [43, 47, 41, 46], [46, 48, 33, 45], [45, 60, 44, 58], [58, 62, 50, 52], [52, 53, 36, 38]],
      lines: [{ price: 40, label: "the low" }], a: 7,
      e: "Bodies first, wicks second. This time the body itself closed under the line. Price really did something new." },
  ] },
};

export const drillRight = (task, i) => (Array.isArray(task.a) ? task.a.includes(i) : task.a === i);
