// World: The Staircase. HH / HL / LH / LL, and the body close that breaks it.
export default {
  id: "structure",
  beats: [
    { kicker: "Reading direction", title: "The staircase",
      say: "A trend is not a feeling. It is a staircase. And you can count the steps." },
    { kicker: "Stairs going up", title: "Higher high · higher low",
      say: "This hill is higher than the last hill. That is a higher high. And this valley did not fall as far as the last one. That is a higher low." },
    { kicker: "H H, then H L, again and again", title: "That is an uptrend",
      say: "Higher high, higher low, again and again. That is an uptrend. Buyers are in charge." },
    { kicker: "Stairs going down", title: "Lower high · lower low",
      say: "Now flip it over. Lower high. Lower low. Stairs going down. That is a downtrend." },
    { kicker: "The step that holds it up", title: "The break",
      say: "Here is the part that matters. The last higher low is the step holding everything up. A wick poking under it is only a test. But when a candle closes its body below it, the staircase is broken." },
    { kicker: "Before every trade", title: "Count the steps",
      say: "Bodies first. Wicks second. Count the steps before every trade." },
  ],
  scene(K, B) {
    const C = K.C;
    K.area({ n: 16, lo: 6, hi: 88, top: 350, bot: 890, x1: 1580 });
    // uptrend: hill (i2), valley (i4), higher hill (i7), higher valley (i9), higher hill (i12)
    const up = [[14, 24, 12, 22], [22, 34, 20, 32], [32, 44, 30, 40], [40, 42, 30, 32], [32, 34, 22, 26], [26, 38, 24, 36], [36, 50, 34, 48],
      [48, 62, 46, 58], [58, 60, 48, 50], [50, 52, 40, 44], [44, 58, 42, 56], [56, 70, 54, 68], [68, 82, 66, 78]];
    K.candles(up);
    const h1 = K.tag(2, 44, "HIGH", { dy: -44, color: C.dim });
    const l1 = K.tag(4, 22, "LOW", { dy: 46, color: C.dim });
    const hh = K.tag(7, 62, "HH", { dy: -46, color: C.green, size: 44 });
    const hl = K.tag(9, 40, "HL", { dy: 50, color: C.green, size: 44 });
    const hh2 = K.tag(12, 82, "HH", { dy: -46, color: C.green, size: 44 });
    const stairs = K.path([[0, 12], [2, 44], [4, 22], [7, 62], [9, 40], [12, 82]], { color: C.green, width: 6 });
    // downtrend, drawn in the same space
    const down = [[86, 88, 76, 78], [78, 80, 66, 68], [68, 70, 56, 58], [58, 70, 56, 68], [68, 76, 66, 74], [74, 76, 62, 64], [64, 66, 50, 52],
      [52, 54, 38, 40], [40, 52, 38, 50], [50, 60, 48, 58], [58, 60, 46, 48], [48, 50, 34, 36], [36, 38, 20, 22]];
    K.candles(down, { prefix: "d" });
    const lh = K.tag(4, 76, "LH", { dy: -46, color: C.red, size: 44 });
    const ll = K.tag(7, 38, "LL", { dy: 50, color: C.red, size: 44 });
    const lh2 = K.tag(9, 60, "LH", { dy: -46, color: C.red, size: 44 });
    const ll2 = K.tag(12, 20, "LL", { dy: 50, color: C.red, size: 44 });
    // the break: two more candles after the uptrend
    const brk = K.candles([[78, 80, 36, 62], [62, 64, 26, 30]], { prefix: "e", at: 13 });
    const lvl = K.level(40, { from: 0, to: 15, color: C.gold, label: "LAST HIGHER LOW", side: "left" });
    const test = K.tag(13, 36, "WICK = TEST", { dy: 52, dx: -30, anchor: "end", color: C.dim, size: 30 });
    const broken = K.word(14, 30, "BROKEN", { dx: 60, dy: 20, anchor: "start", color: C.red, size: 84 });

    K.run(0, 6, B[0] + 0.5, B[0] + 4.6);
    K.in(h1, B[1] - 0.6).in(l1, B[1] - 0.3);
    K.run(7, 7, B[1] + 0.3, B[1] + 0.7).pop(hh, B[1] + 2.4);
    K.run(8, 9, B[1] + 4.2, B[1] + 5.4).pop(hl, B[1] + 8.2);
    K.run(10, 12, B[2] + 0.4, B[2] + 2.6).pop(hh2, B[2] + 2.8).draw(stairs, B[2] + 3.2, 2.2);
    // flip to the downtrend
    const upAll = up.map((_, i) => "#c" + i).join(",");
    K.out([upAll, h1, l1, hh, hl, hh2, stairs].join(","), B[3] - 0.3);
    K.run(0, 12, B[3] + 0.3, B[3] + 5.2, "d");
    K.pop(lh, B[3] + 2.4).pop(ll, B[3] + 3.6).pop(lh2, B[3] + 4.5).pop(ll2, B[3] + 5.3);
    // back to the uptrend for the break
    const downAll = down.map((_, i) => "#d" + i).join(",");
    K.out([downAll, lh, ll, lh2, ll2].join(","), B[4] - 0.3);
    K.lit([upAll, hh, hl, hh2].join(","), B[4] + 0.1);
    K.wipe(lvl, B[4] + 2.2).pulse(hl, B[4] + 3.0);
    K.show(0, B[4] + 6.6, "e").in(test, B[4] + 7.6);
    K.show(1, B[4] + 11.0, "e").shake(B[4] + 11.3).pop(broken, B[4] + 12.6);
  },
};
