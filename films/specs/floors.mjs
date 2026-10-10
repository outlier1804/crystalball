// World: Riding the Trend Wave. Support, resistance, and the flip.
export default {
  id: "floors",
  beats: [
    { kicker: "Support and resistance", title: "Floors and ceilings",
      say: "Price does not wander anywhere it likes. It keeps stopping at the same places." },
    { kicker: "Where falling stops", title: "Support is a floor",
      say: "When price falls to a level and bounces, again and again, that level is support. A floor." },
    { kicker: "Where rising stops", title: "Resistance is a ceiling",
      say: "When price climbs to a level and gets pushed back down, that level is resistance. A ceiling." },
    { kicker: "The flip", title: "A broken ceiling becomes a floor",
      say: "Now the clever part. When price finally breaks through a ceiling, and comes back to it, that old ceiling often becomes the new floor." },
    { kicker: "Mark the bodies", title: "Where did it close?",
      say: "And mark your levels where the candle bodies closed. Bodies first. Wicks second." },
  ],
  scene(K, B) {
    const C = K.C;
    K.area({ n: 16, lo: 10, hi: 92, top: 350, bot: 900 });
    K.candles([[44, 46, 28, 30], [30, 42, 26, 40], [40, 54, 38, 52], [52, 62, 50, 58], [58, 60, 44, 46], [46, 48, 27, 30], [30, 44, 28, 42],
      [42, 56, 40, 54], [54, 63, 52, 57], [57, 58, 46, 48], [48, 62, 46, 60], [60, 76, 58, 74], [74, 78, 60, 62], [62, 64, 57, 60], [60, 76, 58, 74], [74, 88, 72, 86]]);
    const floor = K.level(28, { from: 0, to: 9, color: C.green, label: "SUPPORT", side: "left", below: true });
    const ceil = K.level(60, { from: 2, to: 15, color: C.red, label: "RESISTANCE", side: "left" });
    const b1 = K.ring(0, 28, { r: 44, color: C.green }), b2 = K.ring(5, 28, { r: 44, color: C.green });
    const r1 = K.ring(3, 61, { r: 44, color: C.red }), r2 = K.ring(8, 62, { r: 44, color: C.red });
    const flip = K.ring(13, 58, { r: 54, color: C.gold });
    const now = K.tag(13, 58, "NOW A FLOOR", { dy: 96, color: C.gold, size: 30 });

    K.run(0, 4, B[0] + 0.4, B[0] + 4.0);
    K.run(5, 6, B[1] + 0.3, B[1] + 1.6).pop(b1, B[1] + 2.0).pop(b2, B[1] + 2.8).wipe(floor, B[1] + 4.6);
    K.out(b1 + "," + b2, B[2] - 0.2).run(7, 9, B[2] + 0.3, B[2] + 2.6).pop(r1, B[2] + 2.8).pop(r2, B[2] + 3.4).wipe(ceil, B[2] + 5.4);
    K.out(r1 + "," + r2, B[3] - 0.2).run(10, 11, B[3] + 2.2, B[3] + 4.4).run(12, 13, B[3] + 5.4, B[3] + 7.2).pop(flip, B[3] + 8.2).in(now, B[3] + 9.0).run(14, 15, B[3] + 9.6, B[3] + 11.0);
  },
};
