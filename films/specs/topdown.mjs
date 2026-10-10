// World: The Way of Strategy. The order of a trade: hour, 15-minute, the close.
// Source: "has price rejected off a higher time frame — if it hasn't you do not have
// a trade" (Lets Flow); the 15-minute must agree (FVG THEMS); something new on the
// lower timeframe, enter on the candle close (bootcamp 3-4-26).
export default {
  id: "topdown",
  beats: [
    { kicker: "The order of a trade", title: "Top-down",
      say: "Every trade starts on the big chart. Not the small one. Three charts, always in the same order." },
    { kicker: "Chart one", title: "The hour: a rejection",
      say: "First, the hour. Has price been rejected from a level, or a gap, up here? If it has not, you do not have a trade." },
    { kicker: "Chart two", title: "The 15-minute: it agrees",
      say: "Second, the fifteen minute. It has to agree with the hour. Same direction. If they argue, you wait." },
    { kicker: "Chart three", title: "The small chart: the close",
      say: "Third, the small chart. Wait for a candle to close past the last little low. Price just did something new. That close is your entry." },
    { kicker: "Never skip a step", title: "Hour · 15 · Close",
      say: "Hour. Fifteen. Close. Skip a step, and it is not the method." },
  ],
  scene(K, B) {
    const C = K.C, TOP = 370, BOT = 800;
    // panel 1 — the hour: up into a level, rejected
    K.area({ x0: 120, x1: 650, n: 5, lo: 30, hi: 92, top: TOP, bot: BOT });
    K.candles([[40, 52, 38, 50], [50, 62, 48, 60], [60, 72, 58, 70], [70, 88, 66, 72], [72, 74, 56, 58]], { prefix: "h", width: 56 });
    const lvl = K.level(80, { color: C.blue, label: "LEVEL", side: "left" });
    const rej = K.ring(3, 84, { r: 50, color: C.gold });
    const n1 = K.word(2, 30, "1 HOUR", { dy: 96, size: 60 });
    // panel 2 — the 15-minute: stepping down too
    K.area({ x0: 700, x1: 1230, n: 6, lo: 30, hi: 92, top: TOP, bot: BOT });
    K.candles([[72, 76, 64, 66], [66, 70, 58, 60], [60, 66, 56, 64], [64, 65, 50, 52], [52, 58, 48, 56], [56, 57, 42, 44]], { prefix: "f", width: 50 });
    const stairs = K.path([[0, 76], [1, 58], [2, 66], [3, 50], [4, 58], [5, 42]], { color: C.red, width: 5, layer: "back" });
    const agree = K.tag(2.5, 86, "SAME DIRECTION", { color: C.red, size: 28 });
    const n2 = K.word(2.5, 30, "15 MINUTE", { dy: 96, size: 60 });
    // panel 3 — the small chart: a body closes past the last low
    K.area({ x0: 1280, x1: 1810, n: 5, lo: 30, hi: 92, top: TOP, bot: BOT });
    K.candles([[62, 66, 54, 56], [56, 62, 50, 60], [60, 68, 58, 66], [66, 67, 58, 60], [60, 61, 40, 42]], { prefix: "s", width: 56 });
    const last = K.level(50, { color: C.gold, label: "LAST LOW", side: "left", below: true });
    const enter = K.ring(4, 43, { r: 50, color: C.green });
    const go = K.tag(2.2, 86, "ENTER ON THE CLOSE", { color: C.green, size: 28 });
    const n3 = K.word(2, 30, "2 MINUTE", { dy: 96, size: 60 });

    // dim candles only — dimmed text fails the contrast check and reads as broken
    const all1 = "#h0,#h1,#h2,#h3,#h4", all2 = "#f0,#f1,#f2,#f3,#f4,#f5";
    K.in(n1, B[0] + 2.6).in(n2, B[0] + 3.2).in(n3, B[0] + 3.8);
    K.wipe(lvl, B[1] + 0.4).run(0, 3, B[1] + 0.8, B[1] + 3.4, "h").pop(rej, B[1] + 3.8).show(4, B[1] + 5.4, "h");
    K.dim(all1, B[2] - 0.2, 0.45).out(rej, B[2] - 0.2);
    K.run(0, 5, B[2] + 0.6, B[2] + 3.6, "f").draw(stairs, B[2] + 3.4, 1.4).pop(agree, B[2] + 4.6);
    K.dim(all2, B[3] - 0.2, 0.45);
    K.run(0, 3, B[3] + 0.6, B[3] + 2.4, "s").wipe(last, B[3] + 2.8).show(4, B[3] + 5.4, "s").pop(enter, B[3] + 6.0).pop(go, B[3] + 8.6);
    K.lit(all1 + "," + all2, B[4]);
    K.pulse(n1, B[4] + 0.1).pulse(n2, B[4] + 0.9).pulse(n3, B[4] + 1.7);
  },
};
