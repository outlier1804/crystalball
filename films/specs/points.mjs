// World: Points, Ticks & Contracts. The sum behind every win and loss.
export default {
  id: "points",
  beats: [
    { kicker: "How futures pay", title: "Count the points",
      say: "In futures, the scoreboard counts in points. So let us learn to count them." },
    { kicker: "N Q moves", title: "Ten points",
      say: "N Q goes from twenty one thousand five hundred, up to twenty one thousand five hundred and ten. That is a move of ten points." },
    { kicker: "What one point is worth", title: "Two dollars or twenty",
      say: "Every point is worth money. On the Micro, M N Q, one point is two dollars. On the big N Q contract, one point is twenty dollars." },
    { kicker: "The sum", title: "Points × dollars × contracts",
      say: "So the sum is always the same. Points, times dollars per point, times contracts. Ten points on one micro is twenty dollars." },
    { kicker: "More contracts", title: "Faster, both ways",
      say: "With five contracts, that same move is one hundred dollars. And it works exactly the same against you." },
    { kicker: "Gold too", title: "Start on the micros",
      say: "Gold works the same way. On Micro Gold, a one dollar move is ten dollars. Start on the micros. Always." },
  ],
  scene(K, B) {
    const C = K.C;
    K.area({ n: 7, lo: 21498.6, hi: 21511.6, x0: 150, x1: 980, top: 370, bot: 930 });
    K.candles([[21500, 21502.5, 21499.5, 21502], [21502, 21504.5, 21501, 21504], [21504, 21505, 21502.5, 21503],
      [21503, 21506.5, 21502.5, 21506], [21506, 21508.5, 21505, 21508], [21508, 21510.5, 21507, 21510]]);
    const lo = K.level(21500, { from: 0, to: 6, color: C.blue, label: "21,500", below: true, side: "left" });
    const hi = K.level(21510, { from: 0, to: 6, color: C.blue, label: "21,510", side: "left" });
    const arrow = K.arrow(6, 21500, 6, 21510, { color: C.gold, dy1: -10, dy2: 12 });
    const ten = K.tag(6, 21505, "10 POINTS", { dx: -34, anchor: "end", color: C.gold, size: 30 });
    const X = 1050, W = 760;
    const worth = K.card('<b>MNQ</b> (Micro)<span class="big">$2 a point</span><span class="small">NQ (full size) is $20 a point — ten times bigger</span>', { x: X, y: 380, w: W });
    const sum = K.card('10 points × $2 × 1 contract<span class="big">= $20</span>', { x: X, y: 380, w: W, cls: "good" });
    const five = K.card('10 points × $2 × 5 contracts<span class="big">= $100</span>', { x: X, y: 380, w: W, cls: "good" });
    const against = K.card('Ten points <b>against</b> you<span class="big">= −$100</span>', { x: X, y: 660, w: W, cls: "bad" });
    const gold = K.card('<b>MGC</b> (Micro Gold)<span class="big">$1 move = $10</span><span class="small">GC (full size): a $1 move is $100</span>', { x: X, y: 380, w: W });

    K.run(0, 2, B[0] + 0.6, B[0] + 3.6);
    K.wipe(lo, B[1] + 0.6).run(3, 5, B[1] + 2.2, B[1] + 5.0).wipe(hi, B[1] + 4.6).in(arrow, B[1] + 6.4).pop(ten, B[1] + 7.0);
    K.in(worth, B[2] + 0.8);
    K.out(worth, B[3] - 0.3).in(sum, B[3] + 0.6);
    K.out(sum, B[4] - 0.3).in(five, B[4] + 0.4).in(against, B[4] + 4.0).shake(B[4] + 4.2);
    K.out(five + "," + against, B[5] - 0.3).in(gold, B[5] + 0.6);
  },
};
