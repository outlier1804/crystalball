// World: The Way of the Shield. Size is an answer you work out, not a wish.
export default {
  id: "size",
  beats: [
    { kicker: "Stop first, size second", title: "Size follows the stop",
      say: "Most beginners pick how many contracts they want first. That is backwards. The stop comes first. The size comes second." },
    { kicker: "Step one", title: "How far is the stop?",
      say: "Step one. How far away is your stop? Say it is fifteen points." },
    { kicker: "Step two", title: "What does that cost?",
      say: "Step two. On one Micro N Q contract, fifteen points is thirty dollars." },
    { kicker: "Step three", title: "What am I allowed to lose?",
      say: "Step three. Decide the most you are allowed to lose on one trade. Say sixty dollars." },
    { kicker: "The answer", title: "Two contracts",
      say: "Sixty divided by thirty is two. So you may trade two contracts. Not five. Two." },
    { kicker: "If it costs too much", title: "Skip the trade",
      say: "And if the stop costs more than you are allowed to lose, you do not shrink the stop. You skip the trade." },
  ],
  scene(K, B) {
    const C = K.C;
    K.area({ n: 8, lo: 0, hi: 40, x0: 150, x1: 900, top: 380, bot: 920 });
    K.candles([[28, 30, 18, 20], [20, 22, 10, 12], [12, 24, 9, 22], [22, 28, 20, 26], [26, 28, 23, 25]]);
    const entry = K.level(25, { from: 0, to: 7, color: C.green, label: "ENTRY", solid: true });
    const stop = K.level(10, { from: 0, to: 7, color: C.red, label: "STOP", below: true, solid: true });
    const arrow = K.arrow(6.2, 25, 6.2, 10, { color: C.gold, dy1: 10, dy2: -12 });
    const pts = K.tag(6.2, 17.5, "15 POINTS", { dx: -30, anchor: "end", color: C.gold, size: 30 });
    const X = 1000, W = 800;
    const c1 = K.card('Stop distance<span class="big">15 points</span>', { x: X, y: 360, w: W });
    const c2 = K.card('15 points × $2<span class="big">= $30 a contract</span>', { x: X, y: 360, w: W });
    const c3 = K.card('The most I may lose<span class="big">$60</span>', { x: X, y: 360, w: W });
    const c4 = K.card('$60 ÷ $30<span class="big">= 2 contracts</span>', { x: X, y: 360, w: W, cls: "good" });
    const c5 = K.card('Stop costs too much?<span class="big">No trade.</span><span class="small">Never squeeze the stop to fit.</span>', { x: X, y: 360, w: W, cls: "bad" });

    K.run(0, 4, B[0] + 0.5, B[0] + 3.5).wipe(entry, B[0] + 5.6).wipe(stop, B[0] + 6.4);
    K.in(arrow, B[1] + 1.0).pop(pts, B[1] + 3.2).in(c1, B[1] + 3.0);
    K.out(c1, B[2] - 0.3).in(c2, B[2] + 1.0);
    K.out(c2, B[3] - 0.3).in(c3, B[3] + 1.6);
    K.out(c3, B[4] - 0.3).in(c4, B[4] + 0.6).pulse(c4, B[4] + 5.0);
    K.out(c4, B[5] - 0.3).in(c5, B[5] + 0.8);
  },
};
