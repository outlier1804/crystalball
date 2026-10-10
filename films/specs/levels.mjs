// World: Lines That Matter. PDH, PDL, PD 50% — and why entries live at the lines.
export default {
  id: "levels",
  beats: [
    { kicker: "Before the day starts", title: "Lines that matter",
      say: "Before the day starts, a trader draws a few lines. Start with yesterday." },
    { kicker: "Yesterday's edges", title: "P D H and P D L",
      say: "The highest price yesterday is the previous day high. P D H. The lowest is the previous day low. P D L." },
    { kicker: "The tug of war line", title: "P D fifty percent",
      say: "Now draw the line exactly in the middle. P D fifty percent. Above it, buyers have the upper hand. Below it, sellers do." },
    { kicker: "Why they work", title: "Price is pulled to them",
      say: "Why do these lines matter? Because crowds of traders park their orders right around them. Price gets pulled to them like a magnet." },
    { kicker: "The rule", title: "Trade at the lines",
      say: "So take your entries at your lines, and your targets from your lines. Never in the empty middle." },
    { kicker: "And then", title: "Wait for the reaction",
      say: "And when price arrives, wait. Let the reaction candle close first." },
  ],
  scene(K, B) {
    const C = K.C;
    K.area({ n: 16, lo: 12, hi: 92, top: 350, bot: 900 });
    K.candles([[50, 58, 46, 56], [56, 70, 54, 68], [68, 80, 64, 74], [74, 76, 58, 60], [60, 62, 40, 42], [42, 44, 20, 26], [26, 40, 24, 38], [38, 52, 36, 50]]);
    K.candles([[52, 60, 50, 58], [58, 68, 56, 66], [66, 76, 64, 74], [74, 82, 72, 77], [77, 81, 62, 64]], { prefix: "t", at: 9 });
    const yday = K.zone(0, 7, 14, 86, { color: C.dim, fill: 0.06, dash: true, label: "YESTERDAY", size: 28 });
    const pdh = K.level(80, { color: C.green, label: "PDH" });
    const pdl = K.level(20, { color: C.red, label: "PDL", below: true });
    const mid = K.level(50, { color: C.gold, label: "PD 50%" });
    const buyers = K.word(8, 66, "BUYERS", { size: 50, color: C.green });
    const sellers = K.word(8, 30, "SELLERS", { size: 50, color: C.red });
    const ring = K.ring(12, 80, { r: 70 });
    const nope = K.zone(9, 13, 38, 60, { color: C.red, fill: 0.12 });
    const nopeTag = K.tag(11, 44, "NOT IN THE MIDDLE", { color: C.red, size: 30 });
    const wait = K.tag(13, 62, "WAIT FOR THE CLOSE", { dy: 128, dx: 40, anchor: "end", color: C.ink, size: 30 });

    K.in(yday, B[0] + 0.4).run(0, 7, B[0] + 1.0, B[0] + 4.6);
    K.wipe(pdh, B[1] + 1.6).pulse("#c2", B[1] + 1.8).wipe(pdl, B[1] + 5.6).pulse("#c5", B[1] + 5.8);
    K.wipe(mid, B[2] + 1.6).in(buyers, B[2] + 4.6).in(sellers, B[2] + 7.0);
    K.out(buyers + "," + sellers, B[3] - 0.2).run(0, 3, B[3] + 2.2, B[3] + 7.0, "t").pop(ring, B[3] + 7.2);
    K.out(ring, B[4] - 0.2).pulse(pdh, B[4] + 1.0).pulse(pdl, B[4] + 1.6).in(nope, B[4] + 5.2).pop(nopeTag, B[4] + 5.6);
    K.out(nope + "," + nopeTag, B[5] - 0.2).show(4, B[5] + 1.6, "t").in(wait, B[5] + 2.4);
  },
};
