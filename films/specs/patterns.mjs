// World: Candles That Talk. Four reaction candles, each shown at a marked level.
export default {
  id: "patterns",
  beats: [
    { kicker: "Reaction candles", title: "Candles that talk",
      say: "Some candles say more than others. Traders call them reaction candles. And they only matter at a level." },
    { kicker: "Buyers pushed back", title: "The hammer",
      say: "The hammer. Sellers shoved price down, and buyers shoved it all the way back. Small body on top, long wick below." },
    { kicker: "Nobody won", title: "The doji",
      say: "The doji. It opened and closed in almost the same place. Nobody won. The next candle decides." },
    { kicker: "One swallows the other", title: "The engulfing candle",
      say: "The engulfing candle. One big body swallows the one before it. Buyers just took the wheel." },
    { kicker: "It tried, and it failed", title: "The failed break",
      say: "And the failed break. Price pokes under the last low, then closes back above it. It tried, and it failed." },
    { kicker: "The one rule", title: "Wait for the close",
      say: "But never jump early. A candle can change shape until its last second. Wait for the close. The close is the truth." },
  ],
  scene(K, B) {
    const C = K.C;
    K.area({ n: 12, lo: 14, hi: 70, top: 350, bot: 870 });
    const lvl = K.level(30, { from: 0, to: 11, color: C.blue, label: "SUPPORT", side: "left", below: true });
    K.candles([[62, 64, 44, 46], [44, 48, 22, 46]], { prefix: "a", at: 0.4, width: 84 });           // hammer
    K.candles([[60, 62, 40, 42], [41, 52, 28, 41.6]], { prefix: "b", at: 3.2, width: 84 });         // doji
    K.candles([[54, 56, 35, 38], [37, 68, 31, 66]], { prefix: "e", at: 6.0, width: 84 });           // engulfing
    K.candles([[56, 58, 33, 36], [36, 52, 20, 50]], { prefix: "f", at: 8.8, width: 84 });           // failed break
    const names = [K.word(0.9, 14, "HAMMER", { dy: 90, size: 64 }), K.word(3.7, 14, "DOJI", { dy: 90, size: 64 }),
      K.word(6.5, 14, "ENGULFING", { dy: 90, size: 64 }), K.word(9.3, 14, "FAILED BREAK", { dy: 90, size: 64 })];
    const ring = K.ring(9.8, 25, { r: 58 });
    const pre = ["a", "b", "e", "f"];

    K.wipe(lvl, B[0] + 3.2);
    pre.forEach((p, k) => {
      const at = B[k + 1];
      K.show(0, at + 0.2, p).show(1, at + (k === 0 ? 1.4 : 1.0), p).in(names[k], at + 0.3, { y: 20 });
      if (k < 3) K.dim("#" + p + "0,#" + p + "1", B[k + 2] - 0.2, 0.45);
    });
    K.pop(ring, B[4] + 2.6);
    K.lit(pre.map((p) => "#" + p + "0,#" + p + "1").join(","), B[5]).out(ring, B[5]);
    names.forEach((n, k) => K.pulse(n, B[5] + 0.4 + k * 0.5));
  },
};
