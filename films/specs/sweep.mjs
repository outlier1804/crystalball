// World: The Liquidity Map. The poke under a low that grabs the stops and snaps back.
export default {
  id: "sweep",
  beats: [
    { kicker: "Liquidity", title: "Where the stops hide",
      say: "Under every obvious low, there is a pile of stop orders. Traders call that pile liquidity." },
    { kicker: "Price reaches for it", title: "The poke",
      say: "Price loves to reach for that pile. It pokes below the low, and grabs the stops." },
    { kicker: "Now watch the close", title: "That is a sweep",
      say: "But watch the close. The body came back above the line. Price took the stops, and did nothing new. That is a sweep." },
    { kicker: "A trap for the impatient", title: "The snap back",
      say: "A sweep is a trap for the impatient. Sellers jumped in at the bottom, and now price runs the other way." },
    { kicker: "Never chase into a level", title: "Poke · close · snap back",
      say: "So never chase price into a level. Wait for the sweep. Wait for the close. Then trade the snap back." },
  ],
  scene(K, B) {
    const C = K.C;
    K.area({ n: 14, lo: 8, hi: 90, top: 350, bot: 890 });
    K.candles([[58, 62, 50, 52], [52, 56, 42, 44], [44, 46, 30, 36], [36, 50, 34, 48], [48, 54, 44, 46], [46, 48, 31, 35], [35, 46, 33, 44],
      [44, 46, 36, 38], [38, 40, 31, 33], [33, 36, 15, 34], [34, 48, 33, 46], [46, 58, 44, 56], [56, 68, 54, 66], [66, 78, 64, 76]]);
    const lvl = K.level(30, { color: C.blue, label: "OLD LOW", side: "left" });
    const stops = [3, 5.5, 8].map((i) => K.tag(i, 21, "STOPS", { color: C.red, size: 26 }));
    const ring = K.ring(9, 20, { r: 64 });
    const back = K.tag(9, 15, "BODY CLOSED BACK ABOVE", { dy: 54, color: C.gold, size: 28 });
    const word = K.word(11.6, 18, "SWEEP", { size: 96, color: C.gold });
    const recap = K.card("Poke → close → snap back", { x: 160, y: 345, w: 700, cls: "plain" });

    K.run(0, 6, B[0] + 0.4, B[0] + 3.4).wipe(lvl, B[0] + 1.4);
    stops.forEach((s, k) => K.pop(s, B[0] + 3.6 + k * 0.35));
    K.run(7, 8, B[1] + 0.3, B[1] + 2.0).show(9, B[1] + 3.2).shake(B[1] + 3.5).pop(ring, B[1] + 3.6);
    K.out(stops.join(","), B[1] + 4.6);
    K.in(back, B[2] + 1.6).out(ring, B[2] + 1.4).pop(word, B[2] + 7.0);
    K.out(back, B[3] - 0.2).run(10, 13, B[3] + 2.6, B[3] + 6.0);
    K.in(recap, B[4] + 3.0);
  },
};
