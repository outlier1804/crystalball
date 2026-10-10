// World: The Way of Strategy. The heart of the method: respected vs disrespected.
export default {
  id: "respect",
  beats: [
    { kicker: "Is this level real?", title: "Respected, or not?",
      say: "How do you know a level is real? Price has to respect it. And respect has a very exact meaning." },
    { kicker: "The easy half", title: "It bounces",
      say: "Price pulls back to the level, and bounces. That is only the easy half." },
    { kicker: "The half that counts", title: "A body above the last high",
      say: "Now the half that counts. After the bounce, a candle must close its body above the last high. Price did something new. That level is respected." },
    { kicker: "Only a wick", title: "Disrespected",
      say: "But if it bounces, and cannot close a body above the last high, it did nothing new. That level is disrespected." },
    { kicker: "What happens next", title: "Price runs through it",
      say: "And when price comes back to a disrespected level, it usually runs straight through." },
    { kicker: "So", title: "Only mark what was respected",
      say: "So only mark the levels price respected. A body beyond. Something new." },
  ],
  scene(K, B) {
    const C = K.C;
    K.area({ n: 15, lo: 12, hi: 92, top: 350, bot: 900 });
    K.candles([[30, 36, 28, 34], [34, 48, 32, 46], [46, 60, 44, 58], [58, 70, 56, 66], [66, 68, 54, 56], [56, 58, 44, 46], [46, 48, 39, 42], [42, 54, 40, 52], [52, 64, 50, 62]]);
    K.candles([[62, 78, 60, 76], [76, 86, 74, 84]], { prefix: "r", at: 9 });
    K.candles([[62, 72, 58, 64], [64, 66, 50, 52], [52, 54, 38, 42], [42, 44, 26, 28], [28, 30, 18, 20]], { prefix: "d", at: 9 });
    const lvl = K.level(40, { color: C.blue, label: "THE LEVEL" });
    const high = K.level(70, { color: C.gold, label: "LAST HIGH", side: "left" });
    const okRing = K.ring(9, 74, { r: 50, color: C.green }), noRing = K.ring(9, 71, { r: 46, color: C.red });
    const yes = K.word(12.5, 50, "RESPECTED", { size: 76, color: C.green });
    const no = K.word(12.4, 80, "DISRESPECTED", { size: 66, color: C.red });

    K.run(0, 3, B[0] + 0.4, B[0] + 3.0).wipe(lvl, B[0] + 3.6);
    K.run(4, 6, B[1] + 0.2, B[1] + 2.0).run(7, 8, B[1] + 2.4, B[1] + 3.6);
    K.wipe(high, B[2] + 3.6).show(0, B[2] + 5.0, "r").pop(okRing, B[2] + 5.6).show(1, B[2] + 7.6, "r").pop(yes, B[2] + 9.4);
    K.out(["#r0", "#r1", okRing, yes].join(","), B[3] - 0.2).show(0, B[3] + 1.0, "d").pop(noRing, B[3] + 3.4).pop(no, B[3] + 6.0);
    K.out(noRing, B[4] - 0.1).run(1, 4, B[4] + 0.6, B[4] + 3.6, "d").shake(B[4] + 3.0);
    K.out(["#d0", "#d1", "#d2", "#d3", "#d4", no].join(","), B[5] - 0.2).lit(["#r0", "#r1", yes].join(","), B[5] + 0.2).pulse(yes, B[5] + 1.6);
  },
};
