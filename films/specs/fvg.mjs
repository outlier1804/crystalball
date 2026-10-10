// World: The Way of Strategy. The fair value gap — "gas station" — and where not to put a stop.
export default {
  id: "fvg",
  beats: [
    { kicker: "When price leaps", title: "The hole it leaves",
      say: "Sometimes price leaps so fast, it skips a step. And that skipped step leaves a hole." },
    { kicker: "Three candles", title: "The fair value gap",
      say: "Look at three candles. A big one in the middle. If the wicks on each side do not touch, the space between them is a fair value gap." },
    { kicker: "We call it a gas station", title: "Price comes back for it",
      say: "The market does not like holes. Price gets pulled back to them, like a car pulling in for gas." },
    { kicker: "In, and back out", title: "It got its gas",
      say: "Watch what happens there. If price dips in and comes back out, it got its gas. And it keeps going the same way." },
    { kicker: "One warning", title: "No stops in the gap",
      say: "But never put your stop inside the gap. Price comes in to fill it, and takes you out first. Put it beyond." },
  ],
  scene(K, B) {
    const C = K.C;
    K.area({ n: 14, lo: 10, hi: 92, top: 350, bot: 900 });
    K.candles([[22, 26, 18, 24], [24, 28, 20, 26], [26, 32, 24, 30], [30, 58, 29, 56], [56, 62, 44, 60], [60, 68, 58, 66], [66, 72, 64, 70],
      [70, 72, 60, 62], [62, 64, 48, 50], [50, 52, 38, 46], [46, 60, 45, 58], [58, 72, 56, 70], [70, 84, 68, 82]]);
    const gap = K.zone(3, 12, 32, 44, { color: C.gold, fill: 0.2, label: "FAIR VALUE GAP", labelBelow: true, size: 30 });
    const top = K.ring(4, 44, { r: 34, color: C.gold }), bot = K.ring(2, 32, { r: 34, color: C.gold });
    const dip = K.ring(9, 40, { r: 56, color: C.ink });
    const bad = K.tag(11.3, 38, "✗ STOP IN THE GAP", { color: C.red, size: 28 });
    const good = K.tag(11.3, 22, "✓ STOP BEYOND IT", { color: C.green, size: 28 });

    K.run(0, 2, B[0] + 0.4, B[0] + 2.0).show(3, B[0] + 2.8).shake(B[0] + 3.0).show(4, B[0] + 4.4);
    K.pulse("#c3", B[1] + 2.4).pop(bot, B[1] + 4.6).pop(top, B[1] + 5.2).in(gap, B[1] + 7.6);
    K.out(top + "," + bot, B[2] - 0.2).run(5, 6, B[2] + 0.3, B[2] + 1.8).run(7, 9, B[2] + 3.0, B[2] + 5.6);
    K.pop(dip, B[3] + 2.0).run(10, 12, B[3] + 4.6, B[3] + 7.0);
    K.out(dip, B[4] - 0.2).pop(bad, B[4] + 1.2).pop(good, B[4] + 6.4);
  },
};
