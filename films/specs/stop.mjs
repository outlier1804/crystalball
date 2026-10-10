// World: The Way of the Shield. Where the stop goes, and why it never moves away.
export default {
  id: "stop",
  beats: [
    { kicker: "Before you click", title: "Where am I wrong?",
      say: "Before every trade, answer one question. Where am I wrong?" },
    { kicker: "A buy needs a floor", title: "Stop under the last low",
      say: "You buy here, because price bounced off this low. If price closes back under that low, your idea is broken. So that is where the stop goes. Just under the last low." },
    { kicker: "Not a feeling", title: "The chart picks the spot",
      say: "Not a random number. Not how much you feel like losing. The chart picks the spot." },
    { kicker: "The police chase", title: "Never move it away",
      say: "And when price comes for your stop, never drag it further away. That is hoping, not trading." },
    { kicker: "A small loss is the plan", title: "Take it. Read again.",
      say: "If it gets hit, you take the small loss, you read the chart again, and you live to trade the next one." },
  ],
  scene(K, B) {
    const C = K.C;
    K.area({ n: 13, lo: 8, hi: 76, top: 350, bot: 900 });
    K.candles([[66, 70, 56, 58], [58, 60, 44, 46], [46, 48, 30, 34], [34, 48, 32, 46], [46, 58, 44, 56], [56, 60, 46, 48], [48, 50, 40, 42], [42, 54, 40, 52]]);
    // two endings from the entry: it works, or it fails
    K.candles([[52, 62, 50, 60], [60, 72, 58, 70], [70, 80, 68, 78]], { prefix: "w", at: 8 });
    K.candles([[52, 54, 38, 40], [40, 42, 22, 24]], { prefix: "x", at: 8 });
    const low = K.level(30, { from: 2, to: 12, color: C.blue, label: "THE LAST LOW", side: "left", below: true });
    const entry = K.level(52, { from: 7, to: 12, color: C.green, label: "ENTRY", solid: true });
    const stop = K.level(26, { from: 7, to: 12, color: C.red, label: "STOP", below: true, solid: true });
    const far = K.level(15, { from: 7, to: 12, color: C.red, label: "“JUST A BIT MORE…”", below: true });
    const no = K.word(4, 71, "NOT A RANDOM NUMBER", { size: 64, color: C.gold, anchor: "middle" });
    const hit = K.word(10.8, 40, "STOPPED", { size: 76, color: C.red, anchor: "start", dx: 20 });
    const small = K.card('Small loss.<span class="small">The plan worked — it kept the loss small.</span>', { x: 1090, y: 340, w: 680, cls: "good" });

    K.run(0, 4, B[0] + 0.4, B[0] + 3.2);
    K.run(5, 7, B[1] + 0.2, B[1] + 1.6).wipe(entry, B[1] + 0.9).pulse("#c2", B[1] + 2.8).wipe(low, B[1] + 3.2).wipe(stop, B[1] + 9.6);
    K.in(no, B[2] + 0.2);
    K.out(no, B[3] - 0.3).show(0, B[3] + 0.6, "x").in(far, B[3] + 2.6).pulse(far, B[3] + 3.2);
    K.out(far, B[4] - 0.2).show(1, B[4] + 0.6, "x").shake(B[4] + 0.9).pop(hit, B[4] + 1.1).in(small, B[4] + 2.6);
  },
};
