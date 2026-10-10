// World: The Language of Candles. One giant candle, taken apart.
export default {
  id: "candle",
  beats: [
    { kicker: "One candle", title: "Four facts in one shape",
      say: "Every candle is one little story about price. And it only has four facts in it." },
    { kicker: "Fact one and two", title: "Open and close",
      say: "It opened here. And when its time was up, it closed here. The fat part in between is called the body." },
    { kicker: "Fact three and four", title: "High and low",
      say: "The thin lines are the wicks. The top wick shows the highest price it reached. The bottom wick shows the lowest." },
    { kicker: "Who won?", title: "Buyers or sellers",
      say: "If it closed higher than it opened, buyers won. If it closed lower, sellers won. On our charts, a seller candle is red." },
    { kicker: "The wick is a clue", title: "Pushed back",
      say: "A long wick means price tried to go there, and got pushed back. That is the candle telling you who is stronger." },
    { kicker: "Remember", title: "Open · High · Low · Close",
      say: "Open, high, low, close. Read those four, and you can read any chart." },
  ],
  scene(K, B) {
    const C = K.C;
    K.area({ n: 8, lo: 0, hi: 100, top: 340, bot: 880 });
    K.candles([[30, 92, 12, 76]], { prefix: "a", at: 1.3, width: 150 });
    K.candles([[78, 88, 20, 32]], { prefix: "b", at: 4.2, width: 150 });
    K.candles([[60, 70, 14, 66]], { prefix: "h", at: 6.6, width: 150 });
    const X1 = 1.3;
    const open = K.tag(X1, 30, "OPEN", { dx: 120, anchor: "start", color: C.gold });
    const close = K.tag(X1, 76, "CLOSE", { dx: 120, anchor: "start", color: C.gold });
    const body = K.tag(X1, 53, "BODY", { dx: -120, anchor: "end" });
    const high = K.tag(X1, 92, "HIGH", { dx: -120, anchor: "end", color: C.blue });
    const low = K.tag(X1, 12, "LOW", { dx: -120, anchor: "end", color: C.blue });
    const buy = K.word(X1, 0, "BUYERS WON", { dy: 60, size: 64 });
    const sell = K.word(4.2, 0, "SELLERS WON", { dy: 60, size: 64, color: C.red });
    const ring = K.ring(6.6, 34, { r: 96 });
    const push = K.word(6.6, 0, "PUSHED BACK", { dy: 60, size: 64, color: C.gold });

    K.show(0, B[0] + 0.6, "a");
    K.in(open, B[1] + 0.4).in(close, B[1] + 2.6).pop(body, B[1] + 5.2);
    K.in(high, B[2] + 2.6).in(low, B[2] + 5.6);
    K.in(buy, B[3] + 1.6).show(0, B[3] + 3.4, "b").in(sell, B[3] + 4.4);
    K.dim("#a0", B[4]).dim("#b0", B[4]).out([open, close, body, high, low, buy, sell].join(","), B[4]);
    K.show(0, B[4] + 0.3, "h").pop(ring, B[4] + 2.6).in(push, B[4] + 3.4);
    K.dim("#h0", B[5]).out(ring + "," + push, B[5]).lit("#a0," + [open, close, high, low].join(","), B[5] + 0.1);
    K.pulse(open, B[5] + 0.2).pulse(high, B[5] + 0.9).pulse(low, B[5] + 1.5).pulse(close, B[5] + 2.1);
  },
};
