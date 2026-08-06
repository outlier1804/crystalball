// ====== Foundations: stages 0-7, the ground floor under the trading arcs ======
//
// Design rules baked into this file, on purpose:
//   * ONE idea per session. Not one per panel — one per sitting.
//   * ~15 minutes, 4-6 activities. It ends while he still wants more.
//   * Do-then-name: he plays with the thing FIRST, the word comes after.
//   * No jargon and no acronyms anywhere in the Foundations.
//   * Every session ends on a win.
//
// Activity types the Foundations screen knows how to render:
//   pick    — a question; may carry a `chart` (line) or `candle` to look at
//   percent — work out a percentage of a Koin pile, tap the answer
//   build   — drag a candle's four numbers until it matches a story
//   game    — play N rounds of a Koin game and watch what actually happens
//   trade   — read a chart, choose buy-first or sell-first, watch what follows
//   say     — Sensei says one short thing (used sparingly, max 2 per session)

export const F_PASS = 0.8;   // must get 80% to clear a session

export const STAGES = [
  // ---------------------------------------------------------------- stage 0
  {
    id: "s0",
    gate: "arc1",
    emoji: "🪙",
    name: "Stage 0: Koins & Parts",
    desc: "Before charts: what a part of a pile actually means.",
    sessions: [
      {
        id: "s0a",
        title: "Parts of a pile",
        idea: "A percent is just a part of a pile out of 100.",
        activities: [
          { type: "say", c: "SENSEI", t: "Before candles, before charts — Koins. Every trader question is really a <strong>pile</strong> question. 🪙" },
          { type: "percent", koins: 100, pct: 10,
            q: "You have <strong>100 Koins</strong>. Sensei takes <strong>10%</strong>. How many Koins is that?",
            e: "10% means 10 out of every 100. So 10% of 100 Koins is 10 Koins." },
          { type: "percent", koins: 100, pct: 50,
            q: "Half your pile is <strong>50%</strong>. How many Koins out of 100?",
            e: "50% is half. Half of 100 is 50." },
          { type: "percent", koins: 200, pct: 10,
            q: "Now the pile is <strong>200 Koins</strong>. What is <strong>10%</strong>?",
            e: "10% of 100 is 10, so 10% of 200 is two lots of that — 20 Koins." },
          { type: "percent", koins: 50, pct: 10,
            q: "Smaller pile: <strong>50 Koins</strong>. What is <strong>10%</strong>?",
            e: "Half of 100 is 50, so 10% of 50 is half of 10 — that's 5 Koins." },
          { type: "pick",
            q: "The bigger the pile, the bigger 10% of it is. True or not?",
            o: ["True — 10% of a big pile is more Koins", "Not true — 10% is always the same number"],
            a: 0,
            e: "That's the whole idea. A percent is a SLICE, so it grows when the pile grows.",
            why: { 1: "10% is a slice, not a fixed number of Koins." } },
        ],
      },
      {
        id: "s0b",
        title: "Losing a part",
        idea: "Losing a slice of your pile hurts more than it sounds.",
        activities: [
          { type: "percent", koins: 100, pct: 50,
            q: "You have <strong>100 Koins</strong> and you lose <strong>50%</strong>. How many Koins did you LOSE?",
            e: "You lost 50 Koins. You have 50 left." },
          { type: "pick",
            q: "You had 100 Koins, lost half, and now have 50. To get back to 100, your 50 must...",
            o: ["Grow by 50% ", "Double — grow by 100%"],
            a: 1,
            e: "This is the trap. Lose HALF and you must DOUBLE to get back. Losing is easier than un-losing.",
            why: { 0: "50% of 50 is only 25 — that gets you to 75, not back to 100." } },
          { type: "pick",
            q: "So which is more important?",
            o: ["Winning big", "Not losing big"],
            a: 1,
            e: "Not losing big. Every great trader learns this one first — that's why you're learning it first too. 🛡️",
            why: { 0: "Big wins are undone by one big loss. Protecting the pile comes first." } },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- stage 1
  {
    id: "s1",
    gate: "arc1",
    emoji: "📈",
    name: "Stage 1: Price Tells a Story",
    desc: "Read a plain line. No candles yet.",
    sessions: [
      {
        id: "s1a",
        title: "Reading the line",
        idea: "A price line is a story of a day — read it left to right.",
        activities: [
          { type: "say", c: "KITSU", t: "Kya~! A price chart is just a line that walks from morning to night. Read it like a comic — <strong>left to right</strong>!" },
          { type: "pick", chart: [10, 14, 18, 24, 30, 36],
            q: "What happened in this story?",
            o: ["The price went UP all day", "The price went DOWN all day", "Nothing moved"],
            a: 0, e: "Straight up the mountain. Every step higher than the last.",
            why: { 1: "Look again — the line finishes higher than it started." } },
          { type: "pick", chart: [40, 34, 28, 24, 16, 10],
            q: "And this one?",
            o: ["Up all day", "Down all day", "Up then down"],
            a: 1, e: "Down the whole way. Sellers ran the day." },
          { type: "pick", chart: [10, 20, 32, 40, 26, 12],
            q: "This day had two halves. What happened?",
            o: ["Up, then crashed back down", "Down, then up", "Flat all day"],
            a: 0, e: "Climbed all morning, gave it all back. A trader who went home early kept the win!" },
          { type: "pick", chart: [22, 20, 23, 21, 22, 21],
            q: "What is this day doing?",
            o: ["Going up", "Going down", "Going nowhere — chopping sideways"],
            a: 2, e: "Sideways. Sometimes the market has no story to tell — and that's a fine day to sit out. 🧘",
            why: { 0: "It wiggles up and down but ends where it started." } },
        ],
      },
      {
        id: "s1b",
        title: "Higher steps, lower steps",
        idea: "An uptrend is steps that keep getting higher.",
        activities: [
          { type: "pick", chart: [10, 18, 14, 24, 20, 30],
            q: "It goes up, dips, up, dips, up. Look at each DIP — what are they doing?",
            o: ["Each dip stops higher than the last", "Each dip goes lower"],
            a: 0, e: "That's an uptrend: even the pullbacks are getting higher. The floor keeps rising." },
          { type: "pick", chart: [40, 30, 34, 24, 28, 18],
            q: "Now the peaks. What are THEY doing?",
            o: ["Getting higher", "Getting lower"],
            a: 1, e: "Lower peaks, lower dips — a downtrend. The ceiling keeps dropping." },
          { type: "pick", chart: [10, 18, 14, 24, 20, 30],
            q: "If the steps keep climbing, which way would you rather bet?",
            o: ["With the steps — upward", "Against the steps — downward"],
            a: 0, e: "Ride the wave, don't fight it. Fighting a trend is the most expensive habit there is." },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- stage 2
  {
    id: "s2",
    gate: "arc1",
    emoji: "🕯️",
    name: "Stage 2: One Candle, One Battle",
    desc: "Build candles by hand until they make sense.",
    sessions: [
      {
        id: "s2a",
        title: "Build your first candle",
        idea: "A candle packs four facts into one shape: start, end, highest, lowest.",
        activities: [
          { type: "say", c: "SENSEI", t: "A candle is a squashed-up story. It remembers only four things: where price <strong>started</strong>, where it <strong>ended</strong>, its <strong>highest</strong> point and its <strong>lowest</strong>. Build one and you will never forget it." },
          { type: "build", target: { o: 20, c: 60, h: 70, l: 10 },
            q: "Build this day: it <strong>started at 20</strong>, ran as high as <strong>70</strong>, dipped to <strong>10</strong>, and <strong>ended at 60</strong>.",
            e: "Ended higher than it started — a GREEN candle. The thick body is start-to-end; the thin wicks are how far it stretched." },
          { type: "build", target: { o: 70, c: 30, h: 80, l: 20 },
            q: "Now a rough day: <strong>started at 70</strong>, poked up to <strong>80</strong>, fell to <strong>20</strong>, <strong>ended at 30</strong>.",
            e: "Ended lower than it started — a RED candle. Sellers won that battle." },
          { type: "pick",
            q: "So what makes a candle green?",
            o: ["It ended HIGHER than it started", "It went up at some point during the day"],
            a: 0, e: "Only the start and the end decide the colour. A candle can spike way up and still close red.",
            why: { 1: "Almost every candle goes up at SOME point — that's not what colour means." } },
        ],
      },
      {
        id: "s2b",
        title: "What the wicks are shouting",
        idea: "A long wick means price went there and got rejected.",
        activities: [
          { type: "build", target: { o: 45, c: 50, h: 90, l: 40 },
            q: "Build this: <strong>started 45</strong>, shot up to <strong>90</strong>, only dipped to <strong>40</strong>, but <strong>ended at 50</strong>.",
            e: "See that huge wick on top? Price flew to 90 — and got smacked all the way back down. Buyers tried and FAILED." },
          { type: "pick",
            q: "A candle has a very long wick on top. What does that tell you?",
            o: ["Buyers pushed up there and got rejected", "Buyers are strongly in control up there"],
            a: 0, e: "Rejection. Price visited that level and couldn't stay. The market said no.",
            why: { 1: "If buyers were in control it would have CLOSED up there, not fallen back." } },
          { type: "build", target: { o: 55, c: 60, h: 65, l: 20 },
            q: "Last one: <strong>started 55</strong>, high of only <strong>65</strong>, crashed to <strong>20</strong>, <strong>ended 60</strong>.",
            e: "A long wick underneath — sellers dragged it down to 20 and buyers hauled it all the way back. That's a fight buyers won. 💪" },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- stage 3
  {
    id: "s3",
    gate: "arc1",
    emoji: "🎲",
    name: "Stage 3: Luck vs Edge",
    desc: "The most important idea in the whole dojo.",
    sessions: [
      {
        id: "s3a",
        title: "A fair coin goes nowhere",
        idea: "Winning half the time for equal money gets you nothing.",
        activities: [
          { type: "say", c: "KAZUO", t: "Think trading is about being <em>right</em>? Heh. Watch what happens when you're right half the time." },
          { type: "game", rounds: 20, winRate: 0.5, win: 10, loss: 10, start: 100,
            q: "Flip 20 times. Win a flip: <strong>+10 Koins</strong>. Lose: <strong>−10 Koins</strong>.",
            e: "Round and round, going nowhere. A fair coin with equal payouts is a treadmill." },
          { type: "pick",
            q: "You won about half your flips. Did your pile grow?",
            o: ["No — it just wobbled around the start", "Yes, a lot"],
            a: 0, e: "Being right half the time earns you nothing at all, if the wins are the same size as the losses." },
        ],
      },
      {
        id: "s3b",
        title: "Be wrong more, win anyway",
        idea: "If your wins are bigger than your losses, you can lose most of the time and still come out ahead.",
        activities: [
          { type: "game", rounds: 20, winRate: 0.4, win: 30, loss: 10, start: 100,
            q: "New game. You only win <strong>4 out of 10</strong> — but a win pays <strong>+30</strong> and a loss costs just <strong>−10</strong>.",
            e: "You LOST more flips than you won... and your pile grew anyway. Look at it. That's the whole secret." },
          { type: "pick",
            q: "You lost more often than you won. Why did your Koins go UP?",
            o: ["The wins were 3x bigger than the losses", "You got lucky", "You won most of the flips"],
            a: 0, e: "Size beats frequency. This is called your EDGE — and it's what real traders actually hunt for.",
            why: { 1: "Try it again — it works nearly every time. That's not luck, that's maths.",
                   2: "Check the counter — you lost more than you won!" } },
          { type: "game", rounds: 20, winRate: 0.7, win: 5, loss: 30, start: 100,
            q: "Careful now. This one wins <strong>7 out of 10</strong> — but a win pays only <strong>+5</strong> and a loss costs <strong>−30</strong>.",
            e: "Right most of the time, and still broke. Tiny wins can't survive one big loss." },
          { type: "pick",
            q: "So what actually matters most?",
            o: ["How OFTEN you win", "How BIG your wins are compared to your losses"],
            a: 1, e: "Now you know something most grown-ups with real money still don't. Keep your losses small. 🛡️",
            why: { 0: "You just won 7 out of 10 and still lost Koins!" } },
          { type: "pick",
            q: "Last one. A trade loses money, but you followed your plan and kept the loss small. Was it a good trade?",
            o: ["Yes — a good trade is one you did right", "No — losing money is always bad"],
            a: 0, e: "THIS is the black belt answer. Judge the decision, not the result. Losses are the cost of doing business.",
            why: { 1: "Even a perfect plan loses sometimes. That's what 'edge' means — it wins OVER TIME, not every time." } },
        ],
      },
    ],
  },
  // ---------------------------------------------------------------- stage 4
  {
    id: "s4",
    gate: "arc2",
    emoji: "🕯️",
    name: "Stage 4: A Row of Candles",
    desc: "One candle is a moment. A row of them is a story.",
    sessions: [
      {
        id: "s4a",
        title: "Who is winning?",
        idea: "A run of one colour means one side is in control.",
        activities: [
          { type: "say", t: "You can already read <strong>one</strong> candle. Today: what happens when you line several up next to each other." },
          { type: "pick",
            candles: [{ o: 20, h: 42, l: 18, c: 40 }, { o: 40, h: 58, l: 38, c: 55 }, { o: 55, h: 76, l: 53, c: 74 }],
            q: "Three candles in a row. Who is in control right now?",
            o: ["The buyers", "The sellers", "Nobody — it's a tie"],
            a: 0, e: "Three greens in a row, each one finishing higher than the last. That's the buyers pushing.",
            why: { 1: "Sellers would be pushing the price DOWN — these candles keep ending higher.",
                   2: "A tie would wobble up and down. This one only goes one way." } },
          { type: "pick",
            candles: [{ o: 80, h: 82, l: 60, c: 62 }, { o: 62, h: 64, l: 44, c: 46 }, { o: 46, h: 48, l: 30, c: 32 }, { o: 32, h: 34, l: 18, c: 20 }],
            q: "And now? Four candles this time.",
            o: ["The buyers", "The sellers", "Nobody — it's a tie"],
            a: 1, e: "Four reds, each ending lower. The sellers own this one. 🐻",
            why: { 0: "Buyers push the price UP. Every one of these candles ended lower than it started." } },
          { type: "pick",
            candles: [{ o: 50, h: 62, l: 40, c: 54 }, { o: 54, h: 60, l: 42, c: 46 }, { o: 46, h: 58, l: 38, c: 52 }, { o: 52, h: 61, l: 41, c: 47 }],
            q: "Tricky one. Green, red, green, red — and the price ends about where it started. Who is winning?",
            o: ["The buyers", "The sellers", "Nobody — it's a fair fight"],
            a: 2, e: "Nobody. Both sides keep taking it back. A fight this even is a fight worth staying OUT of.",
            why: { 0: "Look where it finished: about where it began. Nobody got anywhere.",
                   1: "Same answer — the sellers didn't gain any ground either." } },
          { type: "pick",
            q: "So what tells you a side is in control?",
            o: ["Several candles in a row all going the same way", "One really big candle", "The candles being colourful"],
            a: 0, e: "Exactly. One candle is a moment. Several in a row is a <em>story</em>. 📖",
            why: { 1: "One big candle can be a fluke. What comes after it is what matters." } },
        ],
      },
      {
        id: "s4b",
        title: "Climbing, sliding, resting",
        idea: "The steps a row of candles makes shows which way the market is travelling.",
        activities: [
          { type: "say", t: "Back in Stage 1 you found <strong>higher steps</strong> and <strong>lower steps</strong> on a plain line. Candles make the same steps — you just have to look past the colours." },
          { type: "pick",
            candles: [{ o: 18, h: 32, l: 14, c: 30 }, { o: 30, h: 36, l: 24, c: 26 }, { o: 26, h: 50, l: 24, c: 48 }, { o: 48, h: 54, l: 40, c: 42 }, { o: 42, h: 68, l: 40, c: 66 }],
            q: "Look at the steps, not the colours. What is this market doing?",
            o: ["Climbing ⛰️", "Sliding 🛝", "Resting 😴"],
            a: 0, e: "Climbing! Notice it went DOWN twice on the way up — and still made higher steps each time.",
            why: { 1: "It dipped twice, but each dip stopped HIGHER than the one before. That's climbing.",
                   2: "Resting stays about level. This one finished way above where it started." } },
          { type: "pick",
            candles: [{ o: 82, h: 84, l: 66, c: 68 }, { o: 68, h: 76, l: 66, c: 74 }, { o: 74, h: 76, l: 52, c: 54 }, { o: 54, h: 60, l: 52, c: 58 }, { o: 58, h: 60, l: 36, c: 38 }],
            q: "Same job. What's this one doing?",
            o: ["Climbing ⛰️", "Sliding 🛝", "Resting 😴"],
            a: 1, e: "Sliding. It bounced up twice — and each bounce died LOWER than the last one. 🛝",
            why: { 0: "It did go up twice! But each little rise topped out lower than the one before it." } },
          { type: "pick",
            candles: [{ o: 46, h: 58, l: 38, c: 52 }, { o: 52, h: 58, l: 40, c: 44 }, { o: 44, h: 56, l: 40, c: 54 }, { o: 54, h: 58, l: 42, c: 46 }, { o: 46, h: 57, l: 39, c: 51 }],
            q: "And this one?",
            o: ["Climbing ⛰️", "Sliding 🛝", "Resting 😴"],
            a: 2, e: "Resting. Same ceiling, same floor, over and over. The market is having a nap. 😴",
            why: { 0: "Climbing needs higher steps. This keeps hitting the same height and falling back." } },
          { type: "pick",
            q: "How do you know a market is climbing?",
            o: ["Its steps get higher — the dips stop higher too", "All its candles are green", "It has long wicks"],
            a: 0, e: "That's it. <strong>Higher steps.</strong> A climbing market still has red candles in it — it just keeps making higher ground. 🏔️",
            why: { 1: "You just saw a climbing market with two red candles in it. Colour alone doesn't decide." } },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- stage 5
  {
    id: "s5",
    gate: "arc3",
    emoji: "🧱",
    name: "Stage 5: Floors and Ceilings",
    desc: "Why price stops in the same places again and again.",
    sessions: [
      {
        id: "s5a",
        title: "The bouncy floor",
        idea: "Price remembers where it stopped falling before.",
        activities: [
          { type: "say", t: "Drop a ball on concrete and it bounces off the <strong>floor</strong>. Prices do that too — and the floor is usually a price they've bounced off before." },
          { type: "pick",
            chart: [72, 60, 48, 40, 52, 64, 56, 44, 40, 50, 62, 54, 41, 40, 55],
            level: { v: 40, label: "40" },
            q: "Watch the dashed line at <strong>40</strong>. What happened every time the price fell to it?",
            o: ["It bounced back up", "It went straight through", "It stopped moving"],
            a: 0, e: "Three times it fell to 40, three times it bounced. That's a floor. 🧱",
            why: { 1: "Look again — it reached 40 and turned around. Every single time." } },
          { type: "pick",
            chart: [72, 60, 48, 40, 52, 64, 56, 44, 40, 50, 62, 54, 41, 40, 55],
            level: { v: 40, label: "40" },
            q: "Why would a price keep bouncing at the same number?",
            o: ["Because buyers remember it was cheap there and buy again", "Because the chart is broken", "Because 40 is a lucky number"],
            a: 0, e: "Yes! People <em>remember</em>. Whoever was happy to buy at 40 last time is often happy to buy at 40 again. The floor is made of buyers.",
            why: { 2: "Nothing magic about the number — it's about the people who bought there before." } },
          { type: "pick",
            chart: [40, 52, 66, 58, 46, 41, 53, 68, 60, 47, 40, 51, 63, 55, 43],
            level: { v: 40, label: "40" },
            q: "New market, same dashed line. The price is falling toward 40 again. What is MORE likely to happen?",
            o: ["It bounces off 40", "It falls straight to 0", "It flies up without touching 40"],
            a: 0, e: "More likely — not certain. A floor is where the odds are on your side, never a promise. Remember Stage 3! 🎲",
            why: { 1: "That can happen, but it's the unlikely one. Bouncing is what this price has done twice already." } },
          { type: "pick",
            q: "A floor is...",
            o: ["A price where falling usually stops and bounces", "The bottom of the screen", "A kind of candle"],
            a: 0, e: "Grown-up traders call this <em>support</em> — but floor says it better. 🧱",
            why: {} },
        ],
      },
      {
        id: "s5b",
        title: "The ceiling",
        idea: "A ceiling is a floor upside down — and when one breaks, it's a big deal.",
        activities: [
          { type: "pick",
            chart: [30, 42, 58, 70, 62, 48, 40, 55, 68, 70, 60, 46, 38, 52, 69],
            level: { v: 70, label: "70" },
            q: "Now watch the line at <strong>70</strong>. What happens each time the price rises to it?",
            o: ["It gets pushed back down", "It breaks through", "It speeds up"],
            a: 0, e: "Pushed back down, twice. That's a <strong>ceiling</strong> — made of sellers who are happy to sell at 70. 🧱",
            why: { 1: "Not once — it reached 70 and turned around both times." } },
          { type: "pick",
            q: "So who is the ceiling made of?",
            o: ["Sellers", "Buyers", "Nobody"],
            a: 0, e: "Sellers. The floor is built of buyers, the ceiling of sellers. Same idea, upside down. 🙃",
            why: { 1: "Buyers make the FLOOR — they're the ones who step in when it's cheap." } },
          { type: "pick",
            chart: [46, 58, 68, 70, 62, 50, 44, 56, 69, 70, 78, 88, 82, 90, 96],
            level: { v: 70, label: "70" },
            q: "This time the price went THROUGH the ceiling at 70 and kept going. What does that tell you?",
            o: ["The sellers at 70 ran out — the buyers were stronger", "The chart is broken", "It will come straight back to 70"],
            a: 0, e: "Exactly. A ceiling breaking means one side finally ran out of fighters. That's often when the biggest moves start. 🚀",
            why: { 2: "Sometimes it comes back to check — but 'straight back' isn't what this chart did." } },
          { type: "pick",
            q: "Last one. Floors and ceilings are useful because they tell you...",
            o: ["Where the price is likely to stop", "Exactly what the price will do", "When to feel lucky"],
            a: 0, e: "<strong>Likely</strong> — never exactly. You now know where the fights happen. 🧱",
            why: { 1: "Nothing tells you exactly. If it did, everyone would be rich." } },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- stage 6
  {
    id: "s6",
    gate: "arc3",
    emoji: "↕️",
    name: "Stage 6: Two Ways to Win",
    desc: "You can win when it falls, too — if you sell first.",
    sessions: [
      {
        id: "s6a",
        title: "Sell first, buy back cheaper",
        idea: "Selling first and buying back cheaper wins Koins when the price falls.",
        activities: [
          { type: "say", t: "Everyone knows the normal way to win: <strong>buy cheap, sell dear</strong>. Buy a card for 8 Koins, sell it for 12, you're up 4. Easy." },
          { type: "say", t: "Now the strange one. You can do those two steps <strong>in the other order</strong>. Sell FIRST for 12, and buy it back later for 8. You still keep 4. 🤯" },
          { type: "pick",
            q: "You promise your friend a dragon card and he pays you <strong>12 Koins</strong> now. Later you find that card in a shop for <strong>8 Koins</strong>, buy it, and hand it over. How many Koins did you keep?",
            o: ["4", "12", "20", "0"],
            a: 0, e: "12 in, 8 out, 4 stays in your pocket. And the price going DOWN is what paid you.",
            why: { 1: "You had to spend 8 of it buying the card you promised.",
                   3: "You kept the difference — that's a real 4 Koins." } },
          { type: "pick",
            q: "Same deal — but this time the card costs <strong>15 Koins</strong> when you go to buy it. What happens?",
            o: ["You lose 3 Koins", "You still win 4", "Nothing happens"],
            a: 0, e: "You took 12 and had to spend 15. Selling first can lose, exactly like buying first can. Both ways can go wrong! ⚖️",
            why: { 1: "That only works if the price falls. This time it rose." } },
          { type: "pick",
            q: "So when does 'sell first' win?",
            o: ["When the price goes DOWN afterwards", "When the price goes UP afterwards", "Always"],
            a: 0, e: "Down. That's the whole point: there are <strong>two ways to win</strong>, one for each direction. 🔄",
            why: { 2: "Nothing is always. You just lost 3 Koins doing it at the wrong moment." } },
        ],
      },
      {
        id: "s6b",
        title: "Ride the wave",
        idea: "Pick the trade that travels the same way the market already is.",
        activities: [
          { type: "say", t: "You know the two ways to win. Now: which one to pick. Easy rule — <strong>go the same way the market is already going.</strong> 🌊" },
          { type: "trade",
            q: "This market has been climbing all morning. Which way do you go?",
            before: [30, 34, 41, 38, 46, 52, 49, 57, 63, 60],
            after: [66, 64, 72, 78, 76, 84],
            e: "You rode the wave instead of swimming into it. 🏄",
            why: { 1: "Selling first only pays if it falls — and this one was climbing the whole way." } },
          { type: "trade",
            q: "Different day. What's this market doing — and which way do you go?",
            before: [88, 84, 76, 79, 70, 64, 67, 58, 52, 55],
            after: [48, 51, 42, 38, 40, 32],
            e: "Sliding market, sell first, and the fall pays you. Both directions are just waves. 🌊",
            why: { 0: "Buying first needs it to RISE. Every step of this one was lower." } },
          { type: "trade",
            q: "One more. Read the steps carefully before you pick.",
            before: [40, 46, 43, 51, 48, 56, 53, 61, 58, 66],
            after: [62, 58, 51, 47, 44, 40],
            e: "You read it right — climbing, so buying first was the correct call — and it went down anyway. <strong>That's not your mistake. That's Stage 3.</strong> Good decisions still lose sometimes. Judge the decision, not the result. 🛡️",
            why: {} },
          { type: "pick",
            q: "That last one lost Koins even though you chose correctly. What should you do next time you see a climbing market?",
            o: ["Exactly the same thing — it's still the better bet", "Never trust climbing markets again", "Do the opposite from now on"],
            a: 0, e: "Yes. One result doesn't judge a decision. Do the better thing over and over and the Koins arrive. ⏳",
            why: { 1: "One loss doesn't undo a good rule. That's the trap that gets most people.",
                   2: "Flipping your rule after one loss means you have no rule at all." } },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- stage 7
  {
    id: "s7",
    gate: "arc4",
    emoji: "🛡️",
    name: "Stage 7: The Shield",
    desc: "Decide what you can lose before you play.",
    sessions: [
      {
        id: "s7a",
        title: "Decide before you play",
        idea: "You choose the size of your loss BEFORE the round starts, not during it.",
        activities: [
          { type: "say", t: "Every hero needs armour. A trader's armour is one decision made <strong>early</strong>: how many Koins am I willing to lose on this one trade?" },
          { type: "say", t: "The dojo rule is small: about <strong>2 out of every 100 Koins</strong> you own. Let's work out what that actually is." },
          { type: "percent", koins: 500, pct: 2,
            q: "You have <strong>500 Koins</strong>. What is 2 of every 100 — that is, <strong>2%</strong> of 500?",
            e: "10 Koins. That's the most this trade is allowed to cost you." },
          { type: "percent", koins: 250, pct: 2,
            q: "You lost a few and now you have <strong>250 Koins</strong>. What is 2% of 250?",
            e: "5 Koins. Notice it got SMALLER as you got smaller. The shield shrinks with you — that's what keeps you alive." },
          { type: "pick",
            q: "You have 500 Koins and a trade is going badly. You'd said you'd risk 10. Now you're down 10. What do you do?",
            o: ["Get out — that was the deal you made", "Wait a bit, it might come back", "Add more Koins to win it back"],
            a: 0, e: "Out. You made that decision when you were calm; the you who is losing right now is not the one who gets to change it. 🛡️",
            why: { 1: "'It might come back' is how a 10-Koin loss becomes a 200-Koin loss.",
                   2: "That's the fastest way to lose everything. Never feed a losing trade." } },
          { type: "pick",
            q: "Why decide the size of the loss BEFORE you start?",
            o: ["Because you think clearly before, and badly while losing", "Because it's the rule", "Because losses don't count then"],
            a: 0, e: "That's the real reason. Calm-you protects panicking-you. Write the number down before the bell. ✍️",
            why: { 2: "They absolutely still count! You just made sure they stay small." } },
        ],
      },
      {
        id: "s7b",
        title: "The shield in action",
        idea: "A small loss lets you keep playing; a big one ends the game.",
        activities: [
          { type: "say", t: "Don't take my word for it. Play the same game twice — once <strong>without</strong> the shield, once <strong>with</strong> it. Only the size of the LOSS changes. Watch." },
          { type: "game", rounds: 20, winRate: 0.5, win: 15, loss: 35, start: 300,
            q: "<strong>No shield.</strong> You win half the time. A win pays <strong>+15</strong>, but a loss costs <strong>−35</strong> because you let it run.",
            e: "Half your trades won — and you still got wrecked. The losses were bigger than the wins." },
          { type: "game", rounds: 20, winRate: 0.5, win: 15, loss: 8, start: 300,
            q: "<strong>Shield on.</strong> Same game, same coin, same <strong>+15</strong> win. The ONLY change: you cut every loss at <strong>−8</strong>.",
            e: "Same luck, same win rate — opposite ending. Nothing changed except how much a loss was allowed to cost." },
          { type: "pick",
            q: "You won about the same number of rounds in both games. So what made the difference?",
            o: ["How big the losses were allowed to get", "Better luck the second time", "Winning more often"],
            a: 0, e: "That's the whole art. You can't control whether a trade wins. You CAN control what it costs you when it doesn't. 🛡️",
            why: { 1: "Same coin, same 50% — the luck was the same. Only the loss size changed.",
                   2: "You won roughly half in both. The win rate never moved." } },
          { type: "pick",
            q: "A friend says: 'I don't use a stop, I just get out when it feels bad.' What's wrong with that?",
            o: ["'Feels bad' arrives after the loss is already huge", "Nothing, that's fine", "Feelings are always right"],
            a: 0, e: "By the time it feels bad, it's expensive. The number goes in first. ⏱️",
            why: { 1: "It sounds fine — that's exactly why so many people lose money doing it." } },
          { type: "pick",
            q: "Last question of the Training Grounds. What's the point of the shield?",
            o: ["To keep you in the game long enough for your edge to work", "To stop you ever losing", "To win more trades"],
            a: 0, e: "You just finished the ground floor, young trader. Small losses buy you TIME — and time is what turns an edge into Koins. The dojo doors are open. ⛩️",
            why: { 1: "Nothing stops you losing. Stage 3 told you that — losing is part of it.",
                   2: "The shield doesn't change how often you win. It changes what losing costs." } },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------- helpers

export const ALL_SESSIONS = STAGES.flatMap((s) =>
  s.sessions.map((x) => ({ ...x, stageId: s.id, stageName: s.name, stageEmoji: s.emoji, gate: s.gate }))
);

// Which arc each stage is the floor for. Foundations are NOT one big wall in
// front of Arc 1 — that would mean two hours of drills before any story. Each
// stage unlocks just ahead of the arc that leans on it:
//   arc1 ← stages 0-3   arc2 ← stage 4   arc3 ← stages 5-6   arc4 ← stage 7
// Arcs 5+ need no new groundwork.
export const GATE_ORDER = ["arc1", "arc2", "arc3", "arc4"];

// Every foundation session gated at or before this arc must be passed.
export function foundationsDoneFor(state, arcId) {
  const gi = GATE_ORDER.indexOf(arcId);
  if (gi < 0) return true;
  return ALL_SESSIONS.every(
    (s) => GATE_ORDER.indexOf(s.gate) > gi || !!state.foundations?.[s.id]?.passed
  );
}

// The sessions standing between the player and a given arc, still unpassed.
export function missingFor(state, arcId) {
  const gi = GATE_ORDER.indexOf(arcId);
  if (gi < 0) return [];
  return ALL_SESSIONS.filter(
    (s) => GATE_ORDER.indexOf(s.gate) <= gi && !state.foundations?.[s.id]?.passed
  );
}

export function sessionById(id) {
  return ALL_SESSIONS.find((s) => s.id === id) || null;
}

// Only activities that can be right or wrong count toward the pass mark.
export function gradedCount(session) {
  return session.activities.filter((a) => a.type !== "say" && a.type !== "game").length;
}

// How many he must get right. Rounded, not ceiled: on a 3-question session
// ceil(3 * 0.8) is 3, which quietly demands perfection from a kid who is
// already struggling. Rounding lets him miss one and still clear it.
export function passMark(session) {
  return Math.max(1, Math.round(gradedCount(session) * F_PASS));
}

// A session unlocks when the one before it is passed. Strictly linear —
// that is the point: nothing is built on a floor he hasn't laid yet.
export function sessionUnlocked(state, sessionId) {
  const i = ALL_SESSIONS.findIndex((s) => s.id === sessionId);
  if (i <= 0) return true;
  return !!state.foundations?.[ALL_SESSIONS[i - 1].id]?.passed;
}

export function foundationsDone(state) {
  return ALL_SESSIONS.every((s) => state.foundations?.[s.id]?.passed);
}

export function foundationsProgress(state) {
  const passed = ALL_SESSIONS.filter((s) => state.foundations?.[s.id]?.passed).length;
  return { passed, total: ALL_SESSIONS.length };
}

// The next thing he should actually do
export function nextSession(state) {
  return ALL_SESSIONS.find((s) => !state.foundations?.[s.id]?.passed) || null;
}
