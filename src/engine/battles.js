// ====== Battles: the idea IS the fight ======
//
// A candle is taught everywhere as "buyers vs sellers", and then drawn as a
// rectangle. Here the fight is actually shown: two fighters, and the candle
// grows out of what they do to each other. The body is the ground the winner
// took; a wick is an attack that got pushed back; an engulfing candle is a
// finishing move; a sweep is a trap sprung by the Stop Hunter.
//
// Prices are on a 0-100 stage scale. A beat is one tap:
//   say     the narrated line (also the caption)
//   bull / bear   pose: idle | charge | hit | win | down
//   candle  { o, h, l, c } — the live candle after this beat
//   fx      big impact word, or null
//   tag     small label pinned to the candle ("OPEN", "CLOSE", "WICK")
// Beats with an `fx` are powered by him: he taps, and the candle moves under his
// finger. A round ends with one question — either options to pick from, or
// `tap: [zones]`, answered by touching the stage (body, wick-top, wick-bottom,
// prev, below-level). Miss it and the fight is played again — the same "train
// again" rule the films use.
//
// Kid course only; every line is narrated (tools/vogen/lines.mjs).
export const BATTLES = {
  candle: {
    title: "Buyers vs Sellers",
    intro: "Every candle is a fight. Watch three of them, and call who won.",
    rounds: [
      { name: "The Body",
        beats: [
          { say: "Every candle is a fight. Buyers on the left. Sellers on the right. The bell rings, and price starts right here. That is the open.",
            bull: "idle", bear: "idle", candle: { o: 50, h: 50, l: 50, c: 50 }, tag: "OPEN" },
          { say: "The buyers charge! They push price up, and up, and up.",
            bull: "charge", bear: "hit", candle: { o: 50, h: 78, l: 50, c: 78 }, fx: "PUSH!" },
          { say: "Time is up. The candle closes here, high above where it opened. The fat green part is the ground the buyers won. That is the body.",
            bull: "win", bear: "down", candle: { o: 50, h: 78, l: 50, c: 78 }, tag: "CLOSE" },
        ],
        ask: { q: "Tap the BODY of the candle. That is the ground the buyers won.", tap: ["body"],
          e: "The fat part, from the open to the close, is the body. It shows how much ground the winner took." } },
      { name: "The Wick",
        beats: [
          { say: "A new candle. The buyers charge again, all the way up here.",
            bull: "charge", bear: "hit", candle: { o: 40, h: 86, l: 40, c: 86 }, fx: "CHARGE!" },
          { say: "But the sellers hit back, hard! Price gets shoved back down.",
            bull: "hit", bear: "charge", candle: { o: 40, h: 86, l: 40, c: 56 }, fx: "PUSHED BACK!" },
          { say: "See the thin line left on top? That is a wick. It marks an attack that got pushed back.",
            bull: "idle", bear: "win", candle: { o: 40, h: 86, l: 40, c: 56 }, tag: "WICK" },
        ],
        ask: { q: "Tap the WICK. That is the attack that got pushed back.", tap: ["wick-top"],
          e: "The thin line above the body is the wick. It is how far the attack reached before it was pushed back." } },
      { name: "The Red Candle",
        beats: [
          { say: "This time the sellers strike first, and the buyers cannot stop them.",
            bull: "hit", bear: "charge", candle: { o: 70, h: 70, l: 36, c: 36 }, fx: "SLAM!" },
          { say: "It closes lower than it opened. On our charts, that candle is red. The sellers took the ground.",
            bull: "down", bear: "win", candle: { o: 70, h: 70, l: 36, c: 36 }, tag: "CLOSE" },
        ],
        ask: { q: "A candle closed LOWER than it opened. What colour is it?",
          o: ["Red", "Green", "It depends on the wick"], a: 0,
          e: "Only two prices decide the colour: the open and the close. Closed lower than it opened is red." } },
    ],
  },

  patterns: {
    title: "Special Moves",
    intro: "Three candles that shout who just won. Learn the moves.",
    rounds: [
      { name: "The Hammer",
        beats: [
          { say: "The sellers slam price down. It looks bad for the buyers.",
            bull: "hit", bear: "charge", candle: { o: 60, h: 62, l: 24, c: 28 }, fx: "SLAM!" },
          { say: "But the buyers throw them all the way back up!",
            bull: "charge", bear: "hit", candle: { o: 60, h: 64, l: 24, c: 63 }, fx: "HAMMER!" },
          { say: "Small body on top. Long wick below. The sellers attacked, and lost. That is a hammer. And it only counts once the candle closes.",
            bull: "win", bear: "down", candle: { o: 60, h: 64, l: 24, c: 63 }, tag: "CLOSE" },
        ],
        ask: { q: "Tap the part of the hammer that shows the sellers' failed attack.", tap: ["wick-bottom"],
          e: "The long wick below. The sellers pushed all the way down there, and got thrown back. That is what makes it a hammer." } },
      { name: "The Doji",
        beats: [
          { say: "Both sides charge. First the buyers push up.",
            bull: "charge", bear: "hit", candle: { o: 50, h: 74, l: 50, c: 72 }, fx: "PUSH!" },
          { say: "Then the sellers push right back down, past the start.",
            bull: "hit", bear: "charge", candle: { o: 50, h: 74, l: 28, c: 32 }, fx: "PUSH!" },
          { say: "It closes almost exactly where it opened. Nobody won. That is a doji. The next candle decides.",
            bull: "idle", bear: "idle", candle: { o: 50, h: 74, l: 28, c: 50.8 }, tag: "TIE" },
        ],
        ask: { q: "A doji closes almost where it opened. Who won?",
          o: ["Nobody. The next candle decides", "The buyers", "The sellers"], a: 0,
          e: "A doji is a tie. You wait, and let the next candle show who takes control." } },
      { name: "The Engulfer",
        prev: { o: 56, h: 58, l: 47, c: 49 },
        beats: [
          { say: "Here is a small red candle. The sellers won that one. Now the next candle begins, and first it dips under the last candle's low.",
            bull: "hit", bear: "charge", candle: { o: 49, h: 49, l: 42, c: 43 } },
          { say: "Then the buyers unleash their finishing move! One huge body swallows the whole candle before it.",
            bull: "charge", bear: "down", candle: { o: 49, h: 72, l: 42, c: 70 }, fx: "ENGULFED!" },
          { say: "That is an engulfing candle. It took out both sides of the candle before it. The buyers just took the wheel.",
            bull: "win", bear: "down", candle: { o: 49, h: 72, l: 42, c: 70 }, tag: "CLOSE" },
        ],
        ask: { q: "Tap the candle that got SWALLOWED.", tap: ["prev"],
          e: "The small red one. The new candle dipped under its low, then closed above its high. That is an engulfing candle." } },
    ],
  },

  sweep: {
    title: "The Stop Hunter",
    intro: "Meet the villain that hunts impatient traders. Learn its trap.",
    villain: "hunter",
    rounds: [
      { name: "The Trap",
        level: 40, coins: true,
        beats: [
          { say: "Look under this low. Traders hid their stop orders there, like a pile of coins. That pile is called liquidity.",
            bull: "idle", bear: "idle", candle: { o: 47, h: 48, l: 44, c: 46 }, tag: "THE LOW" },
          { say: "Here comes the Stop Hunter. It drags price under the low, and grabs the stops.",
            bull: "hit", bear: "charge", candle: { o: 46, h: 47, l: 30, c: 33 }, fx: "GRAB!", grab: true },
          { say: "Impatient sellers jump in at the bottom. They think price is breaking down.",
            bull: "hit", bear: "win", candle: { o: 46, h: 47, l: 30, c: 33 }, grab: true },
          { say: "But watch the close. The body comes back above the line! Price took the stops, and did nothing new. That is a sweep.",
            bull: "charge", bear: "hit", candle: { o: 46, h: 47, l: 30, c: 45 }, fx: "SNAP BACK!", grab: true, tag: "CLOSE" },
        ],
        ask: { q: "Tap the place where the stops were hiding.", tap: ["below-level", "wick-bottom"],
          e: "Right under the low. That is where traders park their stops, and exactly where the Stop Hunter reached. Wait for the close, then trade the snap back." } },
      { name: "Trap, or Real Break?",
        level: 40,
        beats: [
          { say: "Same low. Price drops under it again. Is it the Hunter's trap, or a real break? Only the close can tell you.",
            bull: "hit", bear: "charge", candle: { o: 46, h: 47, l: 29, c: 34 }, fx: "DROP!" },
          { say: "This time the body closes under the line. That is not a sweep. Price really did something new.",
            bull: "down", bear: "win", candle: { o: 46, h: 47, l: 29, c: 32 }, tag: "CLOSE" },
        ],
        ask: { q: "A candle BODY closes below the low. Is that a sweep, or a real break?",
          o: ["A real break. The body closed beyond the line", "A sweep", "Nothing happened"], a: 0,
          e: "Bodies first, wicks second. A wick under the line is only a poke. A body closing under it is a real break." } },
    ],
  },
};

// Which world gets which battle (it sits right after the world's films).
export const BATTLE_IN = { arc2: "candle", arcP: "patterns", arc9: "sweep" };
