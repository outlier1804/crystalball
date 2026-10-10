// World: The B.R.E.A.D Playbook. The five checks, each shown on the same small chart.
export default {
  id: "bread",
  beats: [
    { kicker: "The checklist", title: "B · R · E · A · D",
      say: "Every trade runs through the same five checks. Together, they spell bread." },
    { kicker: "B", title: "Behavior",
      say: "B is for behavior. Price arrives at a level you marked. That is only the knock on the door." },
    { kicker: "R", title: "Reaction",
      say: "R is for reaction. What does price do there? Wait for the reaction candle to close." },
    { kicker: "E", title: "Execution",
      say: "E is for execution. The candle closed your way. Now you act. Entry. Stop. Target." },
    { kicker: "A", title: "Alignment",
      say: "A is for alignment. The big chart and the small chart must agree. If they do not, there is no trade." },
    { kicker: "D", title: "Discipline",
      say: "D is for discipline. Three trades at most. And when your rules say stop, you stop." },
    { kicker: "Every single trade", title: "Same five checks",
      say: "Behavior. Reaction. Execution. Alignment. Discipline. The same five checks, every single trade." },
  ],
  scene(K, B) {
    const C = K.C;
    const rows = [["B", "ehavior", "Price arrives at your level"], ["R", "eaction", "The reaction candle closes"], ["E", "xecution", "Entry, stop, target"],
      ["A", "lignment", "Big chart and small chart agree"], ["D", "iscipline", "Three trades max. Follow the rules."]];
    const cards = rows.map(([l, rest, sub], k) => K.card(
      `<span style="font-size:38px"><b style="font-family:Bangers;font-size:58px;letter-spacing:2px">${l}</b>${rest}</span><span class="small" style="font-size:26px;margin-top:0">${sub}</span>`,
      { x: 110, y: 318 + k * 142, w: 560, cls: "plain" }));
    K.area({ n: 10, x0: 760, x1: 1790, lo: 10, hi: 92, top: 350, bot: 900 });
    K.candles([[70, 74, 60, 62], [62, 64, 50, 52], [52, 54, 40, 42], [42, 44, 30, 32], [32, 38, 20, 36], [36, 50, 34, 48], [48, 62, 46, 60], [60, 74, 58, 72]]);
    const lvl = K.level(30, { color: C.blue, label: "YOUR LEVEL", side: "left", below: true });
    const ring = K.ring(4, 28, { r: 70 });
    const entry = K.level(36, { from: 5, to: 9, color: C.green, label: "ENTRY", solid: true });
    const stop = K.level(18, { from: 5, to: 9, color: C.red, label: "STOP", below: true, solid: true });
    const target = K.level(72, { from: 5, to: 9, color: C.gold, label: "TARGET", solid: true });
    const align = K.tag(1.6, 86, "1H ▲  15M ▲  2M ▲", { color: C.green, size: 28 });
    const disc = K.tag(5.3, 86, "MAX 3 TRADES", { color: C.gold, size: 28 });

    cards.forEach((c, k) => { K.in(c, B[0] + 1.6 + k * 0.45); K.dim(c, B[1] - 0.2, 0.3); });
    cards.forEach((c, k) => { K.lit(c, B[k + 1]); if (k < 4) K.dim(c, B[k + 2] - 0.2, 0.3); });
    K.wipe(lvl, B[1] + 0.6).run(0, 3, B[1] + 1.2, B[1] + 4.0);
    K.show(4, B[2] + 2.0).pop(ring, B[2] + 4.2);
    K.out(ring, B[3] - 0.1).show(5, B[3] + 2.4).wipe(entry, B[3] + 5.0).wipe(stop, B[3] + 5.8).wipe(target, B[3] + 6.6).run(6, 7, B[3] + 6.8, B[3] + 8.0);
    K.pop(align, B[4] + 2.0);
    K.pop(disc, B[5] + 1.6);
    K.lit(cards.join(","), B[6]);
    cards.forEach((c, k) => K.pulse(c, B[6] + 0.3 + k * 1.05));
  },
};
