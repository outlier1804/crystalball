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
  // ---------------------------------------------------------------- stage 8
  {
    id: "s8",
    gate: "arc7",
    emoji: "📦",
    name: "Stage 8: The Morning Box",
    desc: "The first few minutes draw the day's battlefield.",
    sessions: [
      {
        id: "s8a",
        title: "Drawing the box",
        idea: "The first minutes of the day set a top and a bottom that everyone can see.",
        activities: [
          { type: "say", t: "Every morning the market has its first argument. The highest and lowest price of those first few minutes draw a <strong>box</strong> — and most of the day happens around that box." },
          { type: "pick",
            candles: [{ o: 40, h: 58, l: 36, c: 54 }, { o: 54, h: 60, l: 44, c: 46 }, { o: 46, h: 56, l: 34, c: 50 }, { o: 50, h: 59, l: 38, c: 44 }],
            q: "These are the first four candles of the day. Where is the <strong>top</strong> of the box?",
            o: ["At the highest point any of them reached", "Where the last one ended", "In the middle of them"],
            a: 0, e: "The top of the box is the highest price anyone paid in that first stretch. The bottom is the lowest. Two lines, that's it. 📦",
            why: { 1: "The last close is just one moment. The box is the whole range of the fight.",
                   2: "The middle is nobody's line — no one is defending it." } },
          { type: "pick",
            chart: [42, 55, 58, 50, 44, 57, 59, 48, 43, 56, 58, 47, 45, 57, 50],
            level: { v: 59, label: "top" },
            q: "Price keeps running up to the top of the box and falling back. What is that telling you?",
            o: ["Nobody has won yet — the box is still holding", "The box has broken", "Price is definitely about to fly up"],
            a: 0, e: "A box that keeps holding means the fight is still even. Nothing to do yet. ⏳",
            why: { 1: "Nothing got out. Touching a line is not breaking it.",
                   2: "It's been rejected at that line three times — that's the opposite of proof." } },
          { type: "pick",
            chart: [48, 52, 46, 50],
            q: "It's the very first minutes and the box isn't finished being drawn. What do you do?",
            o: ["Wait — let the box finish first", "Buy now before you miss it", "Sell now, it looks weak"],
            a: 0, e: "No battlefield, no battle plan. You can't trade the edges of a box that doesn't have edges yet. 🧘",
            why: { 1: "Miss what? You don't even know where the levels are yet.",
                   2: "Four candles is not a direction — it's noise." } },
          { type: "pick",
            q: "Why is the morning box worth marking at all?",
            o: ["Because everyone else can see the same two lines, so people act there", "Because it looks tidy", "Because the box decides what price will do"],
            a: 0, e: "That's the real answer, and it's true of every level you'll ever draw: a line matters because <strong>a crowd is watching it</strong>. 👀",
            why: { 2: "The box doesn't control anything. People do — and the box is just where they're all looking." } },
        ],
      },
      {
        id: "s8b",
        title: "Out of the box",
        idea: "Leaving the box means something — but only if price stays out.",
        activities: [
          { type: "say", t: "Sooner or later price leaves the box. That's the moment traders wait all morning for. But there are <strong>two</strong> ways it leaves, and they mean opposite things." },
          { type: "pick",
            chart: [44, 52, 58, 48, 45, 57, 59, 52, 58, 66, 72, 69, 78, 84, 88],
            level: { v: 59, label: "top" },
            q: "Price pushed above the top of the box and kept climbing away from it. Who won the morning fight?",
            o: ["The buyers", "The sellers", "Nobody — it's still even"],
            a: 0, e: "Out and away. The sellers who were defending that line ran out of Koins, and the buyers took the ground. 📈",
            why: { 2: "It's not even any more — one side pushed out and the price never came back." } },
          { type: "pick",
            chart: [44, 52, 58, 48, 45, 57, 59, 63, 58, 50, 44, 47, 41, 38, 34],
            level: { v: 59, label: "top" },
            q: "Here price poked above the top... then came straight back inside and kept falling. What happened?",
            o: ["A trick — the push failed and the box held after all", "The box broke properly", "Exactly the same as the last chart"],
            a: 0, e: "A poke that comes straight back is a <strong>trap</strong>. Everyone who jumped in at the poke is now stuck and has to sell — which is what drives it down. 🪤",
            why: { 1: "It broke for about a second. Then it undid the whole thing.",
                   2: "The last one stayed out. This one came back in. That's the entire difference." } },
          { type: "pick",
            q: "So how do you tell a real break from a trick?",
            o: ["A real break stays out; a trick comes straight back in", "A real break is faster", "You can never tell, it's luck"],
            a: 0, e: "Staying out is the proof. Which means the useful question is never <em>'did it touch?'</em> — it's <em>'where did it end up?'</em> 🎯",
            why: { 1: "Speed says nothing. Some of the fastest pokes are the traps.",
                   2: "You can't tell in advance — but you can absolutely tell afterwards, and afterwards is soon enough." } },
          { type: "pick",
            q: "Price is poking out of the box <em>right now</em>, this second. What do you do?",
            o: ["Wait for the candle to finish and see where it ends up", "Jump in the instant it pokes out", "Jump in on the other side"],
            a: 0, e: "The candle isn't done, so the story isn't done. A few seconds of patience is what separates the break from the trap. ⏱️",
            why: { 1: "That's exactly the trade the trap is built to catch." } },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- stage 9
  {
    id: "s9",
    gate: "arc7",
    emoji: "🪜",
    name: "Stage 9: Skipped Stairs",
    desc: "When price leaps, it leaves a hole — and holes pull.",
    sessions: [
      {
        id: "s9a",
        title: "The empty step",
        idea: "Price that jumps over a price level tends to come back and visit it.",
        activities: [
          { type: "say", t: "Usually price walks up the stairs, one step at a time. But sometimes it <strong>leaps</strong> — and leaves an empty step behind, a price where almost nothing happened." },
          { type: "pick",
            candles: [{ o: 22, h: 34, l: 20, c: 32 }, { o: 36, h: 62, l: 35, c: 60 }, { o: 62, h: 70, l: 58, c: 66 }],
            q: "Look at the space between the <strong>top of the first candle</strong> and the <strong>bottom of the third</strong>. What's special about it?",
            o: ["Price flew through it — almost nobody traded in there", "It's the busiest area on the chart", "It's where price spent the most time"],
            a: 0, e: "That's the empty step. The middle candle jumped the whole distance in one go, so that price band got skipped. 🪜",
            why: { 1: "The opposite — it's the emptiest part of the whole chart.",
                   2: "It spent almost no time there. That's the entire point." } },
          { type: "pick",
            chart: [30, 32, 31, 58, 62, 66, 63, 68, 64, 58, 52, 46, 42, 38, 40],
            level: { v: 44, label: "empty step" },
            q: "Price leapt up and left the empty step behind at 44. Watch what it did over the next few hours.",
            o: ["It came back down and visited the step it skipped", "It never came back", "It leapt again"],
            a: 0, e: "It came back. Not always, not instantly — but far more often than a coin flip, and that's all an edge ever is. 🧲",
            why: { 1: "Follow the line to the right — it walks all the way back down to 44." } },
          { type: "pick",
            q: "Why would price come back to a place it already flew past?",
            o: ["Because it jumped past without properly trading there, so it comes back to do it", "Because empty spaces are heavy", "Because traders drag it back by hand"],
            a: 0, e: "A market is a place where buyers and sellers agree on a price. Skip a price and the agreement never happened — so it usually gets tested later. ⚖️",
            why: { 1: "Fun, but no. Nothing on a chart has weight.",
                   2: "Nobody is strong enough to drag price anywhere. It's the crowd wanting a fair price." } },
          { type: "pick",
            chart: [70, 68, 72, 69, 71, 68, 70, 72, 69],
            level: { v: 44, label: "empty step" },
            q: "Price is drifting sideways up at 70. There is an empty step below at 44 and nothing much above. Which is the more likely place for price to head toward?",
            o: ["Down toward the empty step", "Straight up forever", "Neither — sideways is permanent"],
            a: 0, e: "This is what traders mean when they say price has a <strong>goal</strong>. It isn't wandering — there's an unfinished job down there. 🎯",
            why: { 2: "Sideways always ends. The question is only which way it breaks — and one side has an unfinished job on it." } },
        ],
      },
      {
        id: "s9b",
        title: "Halfway is enough",
        idea: "Coming back to the empty step usually means dipping into it, not through it.",
        activities: [
          { type: "say", t: "Here is the part almost nobody expects. When price comes back to an empty step, it usually <strong>doesn't go all the way in</strong>. It dips about halfway, takes what it came for, and carries on." },
          { type: "pick",
            q: "The empty step runs from <strong>40</strong> at the bottom to <strong>60</strong> at the top. Halfway into it is which price?",
            o: ["50", "60", "40"],
            a: 0, e: "50. Halfway between the two edges — and that one number is where a huge number of traders are waiting. 📍",
            why: { 1: "60 is the top edge — that's only just touching it.",
                   2: "40 is the far side. That's all the way through, not halfway." } },
          { type: "pick",
            chart: [72, 68, 62, 56, 51, 50, 54, 60, 66, 71, 76, 74, 80, 86, 90],
            level: { v: 50, label: "halfway" },
            q: "Price fell back into the empty step, reached halfway, and then this happened. Is that unusual?",
            o: ["No — halfway is usually enough, then it continues on its way", "Yes, that basically never happens", "It means the chart is broken"],
            a: 0, e: "That's the normal shape: dip in, refuel, carry on. It's why traders wait <em>at</em> halfway instead of chasing price down. ⛽",
            why: { 1: "It's one of the most repeated shapes on any chart — that's exactly why it's worth learning." } },
          { type: "pick",
            chart: [72, 66, 60, 54, 50, 46, 41, 38, 33, 29, 24, 26, 21, 18, 15],
            level: { v: 50, label: "halfway" },
            q: "This time price sank past halfway, straight through the whole empty step, and kept falling. What does that tell you?",
            o: ["The idea failed — this isn't a refuel, it's a real move down", "Nothing, wait longer", "It will definitely bounce soon"],
            a: 0, e: "Straight through means the buyers who were supposed to be waiting there weren't there. When the reason for your idea disappears, so does the idea. 🚪",
            why: { 1: "Waiting longer is how a small loss becomes a big one. Stage 7's shield exists for exactly this chart.",
                   2: "Nothing on a chart is definite — and 'it must bounce soon' is the most expensive sentence in trading." } },
          { type: "pick",
            q: "Why is it useful to know price usually only dips about halfway?",
            o: ["Because it tells you where to be waiting, calmly, before price gets there", "Because it guarantees the trade wins", "Because it makes price move"],
            a: 0, e: "That's the whole reason to learn any of this: it lets you decide <strong>in advance</strong>, while you're calm, instead of deciding in a panic while price is moving. 🧘",
            why: { 1: "Nothing guarantees a win. You just saw the chart where it failed.",
                   2: "The chart doesn't obey you. You're only finding the places the crowd cares about." } },
        ],
      },
    ],
  },

  // --------------------------------------------------------------- stage 10
  {
    id: "s10",
    gate: "arc9",
    emoji: "💧",
    name: "Stage 10: Where the Crowd Waits",
    desc: "Yesterday's marks, and the trap that gets set just past them.",
    sessions: [
      {
        id: "s10a",
        title: "Yesterday's marks",
        idea: "Yesterday's highest and lowest prices are lines everyone can see today.",
        activities: [
          { type: "say", t: "The market has a memory, and it is short and simple: <strong>the highest and the lowest price of yesterday</strong>. You can draw both before today even starts." },
          { type: "pick",
            chart: [42, 50, 58, 64, 69, 70, 66, 68, 70, 65, 60, 56, 52, 55, 50],
            level: { v: 70, label: "yesterday's high" },
            q: "Price climbed all the way to yesterday's highest point — and stopped dead, twice. Why <em>there</em>?",
            o: ["Because everyone can see that line, so lots of people act at it", "Pure coincidence", "Because prices can't go above yesterday"],
            a: 0, e: "Nothing physical is stopping it. A crowd of people all watching the same line, all doing something when price arrives — that <em>is</em> the wall. 🧱",
            why: { 1: "Twice, at the same price, to the point? That's a crowd, not a coincidence.",
                   2: "Price goes above yesterday's high all the time. It just has to get through the crowd first." } },
          { type: "pick",
            q: "Which line has the most people watching it?",
            o: ["Yesterday's highest and lowest price", "A price you picked at random in the middle", "A price nobody has traded at in a year"],
            a: 0, e: "Every trading app in the world shows yesterday's range. That's why those lines act like walls and the ones you invent don't. 👀",
            why: { 1: "You're the only person watching it, so nothing happens when price gets there.",
                   2: "Old and forgotten. The crowd has moved on." } },
          { type: "pick",
            chart: [56, 62, 68, 70, 74, 80, 84, 78, 73, 70, 71, 76, 82, 88, 92],
            level: { v: 70, label: "yesterday's high" },
            q: "Price broke above yesterday's high, later came back down to it, and bounced up off it. What did that old ceiling become?",
            o: ["A floor", "Still a ceiling", "Nothing at all"],
            a: 0, e: "The flip. Once a ceiling truly breaks, the people who were selling there switch to buying there — so the same line now holds price <em>up</em>. 🔄",
            why: { 1: "A ceiling stops price going up. Look at the chart — it stopped price going <em>down</em>.",
                   2: "It did something very obvious: it caught price and sent it back up." } },
          { type: "pick",
            q: "Why draw yesterday's high and low <em>before</em> the day starts?",
            o: ["Because you're calm before anything is moving — decisions made then are better", "Because it's traditional", "Because the lines expire at lunchtime"],
            a: 0, e: "Same idea as the shield in Stage 7: calm-you does the thinking, and excited-you just follows the lines that were already drawn. ✍️",
            why: { 2: "They last all day — and often longer." } },
        ],
      },
      {
        id: "s10b",
        title: "The poke and the snap",
        idea: "Price often pokes just past a famous line to grab orders, then snaps back.",
        activities: [
          { type: "say", t: "Now the trap. Loads of traders leave their shields just <em>past</em> yesterday's high and low. That makes a little pool of Koins sitting there — and price has a habit of going to collect it. 💧" },
          { type: "pick",
            chart: [58, 64, 68, 70, 73, 66, 60, 54, 49, 52, 46, 41, 38, 42, 36],
            level: { v: 70, label: "yesterday's high" },
            q: "Price poked just above yesterday's high — and then did what?",
            o: ["Snapped straight back down and kept falling", "Kept climbing steadily", "Sat perfectly still"],
            a: 0, e: "Poke, grab, snap. Everyone who bought the poke because it 'broke out' is now stuck, and their selling adds fuel to the fall. 🪤",
            why: { 1: "It got three points above the line and then lost more than thirty." } },
          { type: "pick",
            q: "You see price racing up toward yesterday's high right now. It's exciting. What's the risk of jumping in?",
            o: ["You might be buying at exactly the spot the trap is set", "There's no risk, it's going up", "You'd be too slow"],
            a: 0, e: "The most tempting moment is usually the worst price. Excitement is a signal — just not the one people think. 🚩",
            why: { 1: "'It's going up' describes the past. The trap is in the next thirty seconds.",
                   2: "Speed has never been the problem. Chasing is." } },
          { type: "pick",
            q: "So what do you actually watch for at one of these lines?",
            o: ["What price does AFTER it gets there", "The exact moment it touches", "How fast it arrived"],
            a: 0, e: "Touching tells you nothing. The <strong>reaction</strong> tells you everything: stay out and keep going, or snap back and reverse. 👁️",
            why: { 1: "Everyone sees the touch. The touch is free information and free information is worthless.",
                   2: "Fast arrivals are more likely to be the grab, not less." } },
          { type: "pick",
            chart: [46, 41, 36, 32, 30, 27, 33, 39, 44, 42, 48, 54, 51, 58, 63],
            level: { v: 30, label: "yesterday's low" },
            q: "Price dipped below yesterday's lowest point and snapped straight back up above it. Which way is the more likely trade now?",
            o: ["Up — the dip was a grab, not a new direction", "Down — it broke the low", "Neither, ever"],
            a: 0, e: "The grab and the snap-back. It went down to collect the shields, found no sellers left, and turned. That turn is the trade. ⚡",
            why: { 1: "It broke it for a moment and immediately undid it — the same trick as the box in Stage 8, just at a different line." } },
        ],
      },
    ],
  },

  // --------------------------------------------------------------- stage 11
  {
    id: "s11",
    gate: "arc10",
    emoji: "📋",
    name: "Stage 11: One Recipe",
    desc: "Stack your clues, then run the same checklist every single time.",
    sessions: [
      {
        id: "s11a",
        title: "One clue is a rumour",
        idea: "Trade where several separate clues point the same way — and skip everything else.",
        activities: [
          { type: "say", t: "You now know three kinds of clue: the <strong>box</strong>, the <strong>empty step</strong>, and <strong>yesterday's marks</strong>. Here's what to do when they disagree — and what to do when they don't." },
          { type: "pick",
            q: "Price is breaking out of the morning box. That's your only clue — nothing else lines up. How strong is that?",
            o: ["Weak — one clue on its own is barely better than a guess", "Very strong, that's enough", "Meaningless, ignore it"],
            a: 0, e: "One clue is a rumour. It's not nothing — it's just not enough to risk Koins on. 🗣️",
            why: { 1: "Boxes break and fail all day long. On its own it's a coin flip with extra steps.",
                   2: "It IS information. It's just information waiting for friends." } },
          { type: "pick",
            q: "Now: price breaks out of the box <em>upward</em>, it just bounced off an empty step below, AND it cleared yesterday's high. All three point up. What is that?",
            o: ["A plan — three separate clues agreeing", "Still just a rumour", "A reason to bet everything"],
            a: 0, e: "Three independent clues agreeing is the moment a strategist moves. One is a rumour, two is a hint, three is a plan. ⚡",
            why: { 1: "Three different things had to line up by chance. That's a lot less likely than one.",
                   2: "It's a plan, not a certainty — and the shield still goes on. Stage 7 doesn't get switched off." } },
          { type: "pick",
            q: "The box breaks upward, but yesterday's high is right overhead blocking the way. The clues disagree. What do you do?",
            o: ["Nothing — no trade", "Take it anyway, one clue is enough", "Take it and skip the shield"],
            a: 0, e: "<strong>No trade is a decision.</strong> It's the one you'll make most often, and it costs nothing. 🚫",
            why: { 1: "You just decided one clue was weak. It doesn't get stronger because you're bored.",
                   2: "That's two bad decisions stacked on one bad setup." } },
          { type: "say", t: "Want proof that being picky beats being busy? Play the same day twice. First: trade <em>every</em> wiggle you see." },
          { type: "game", rounds: 24, winRate: 0.45, win: 12, loss: 12, start: 300,
            q: "<strong>Trading everything.</strong> 24 trades. Weak setups, so you win a bit under half. Win <strong>+12</strong>, lose <strong>−12</strong>.",
            e: "Lots of action, lots of Koins burned. Nothing here was <em>wrong</em> — there was just no edge in any of it." },
          { type: "game", rounds: 6, winRate: 0.65, win: 12, loss: 12, start: 300,
            q: "<strong>Only the three-clue ones.</strong> Same day, same market — but you sat still and took just <strong>6</strong> trades.",
            e: "A quarter of the trades, and a better ending. Being picky isn't being slow — it's being paid." },
          { type: "pick",
            q: "You took far fewer trades the second time and finished better. What changed?",
            o: ["Only the quality of the setups you agreed to take", "Your luck", "The size of each win"],
            a: 0, e: "Same market, same win size, same loss size. The only thing you changed was <strong>what you said no to</strong>. 🧘",
            why: { 1: "Both were the same coin. What moved was how good each flip was.",
                   2: "+12 and −12 in both games. Look again — the numbers never moved." } },
        ],
      },
      {
        id: "s11b",
        title: "The same recipe every time",
        idea: "One checklist, run identically every time, is the only thing you can actually learn from.",
        activities: [
          { type: "say", t: "Last session of the Training Grounds. Masters don't have twenty methods — they have <strong>one</strong>, and they run it the same way every single time." },
          { type: "pick",
            q: "Two traders. One uses a different plan every day; one uses the same plan every day. After a month, who can tell whether their plan actually works?",
            o: ["The one who kept it the same — they've got something to compare", "The one who changed it — more variety", "Neither, it's impossible to know"],
            a: 0, e: "Change everything and you learn nothing, because you can never tell <em>which</em> change did it. Same recipe every time is what turns trades into lessons. 🔬",
            why: { 1: "Twenty half-tested plans teach you less than one plan tested twenty times.",
                   2: "It's very knowable — you just have to hold the recipe still while you test it." } },
          { type: "pick",
            candles: [{ o: 60, h: 78, l: 58, c: 62 }, { o: 62, h: 80, l: 60, c: 76 }],
            q: "Your line is at <strong>70</strong>. Both candles poked above it. The first ended back down at 62; the second ended up at 76. Which one actually beat the line?",
            o: ["The second — it ENDED above the line", "The first — it got there earlier", "Both, they both touched it"],
            a: 0, e: "Bodies first, wicks second. Where a candle <em>ends</em> is where everyone agreed. Where it merely poked is where somebody tried and failed. 🕯️",
            why: { 1: "It got above 70 and then gave it all back — that's the trap from Stage 8, not a break.",
                   2: "Touching is free. Only one of them held on." } },
          { type: "pick",
            q: "You're in a trade, and then a candle closes on the wrong side of your line. Your reason for being in is gone. Now what?",
            o: ["Get out — the idea was wrong, and that's allowed", "Wait and hope it comes back", "Add more Koins to fix it"],
            a: 0, e: "Being wrong is not the problem — <em>staying</em> wrong is. When the reason disappears, the trade disappears with it. 🛡️",
            why: { 1: "Hope isn't in the recipe. Stage 7 already showed you where that ends.",
                   2: "Never feed a losing trade. That's how one bad idea takes the whole pile." } },
          { type: "pick",
            q: "Last question of the Training Grounds. What is the recipe actually <em>for</em>?",
            o: ["Making the same decision the same way every time, so you can learn from the results", "Winning every trade", "Making trading more exciting"],
            a: 0, e: "That's it — you've finished the ground floor. Everything from here is just this checklist with better names: watch the level, wait for the close, take the trade only when the clues agree, wear the shield. Go and hunt. ⛩️",
            why: { 1: "Nothing wins every trade. The recipe just makes the wins bigger than the losses over many, many tries.",
                   2: "It does the opposite — a good recipe is calm and a bit boring. Boring is the goal." } },
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
//   arc7 ← stages 8-9   arc9 ← stage 10  arc10 ← stage 11
// Arcs 5, 6 and 8 need no new groundwork — they are about the trader's head,
// not the chart, so nothing new has to be laid down first. An arc missing from
// this list is simply ungated.
export const GATE_ORDER = ["arc1", "arc2", "arc3", "arc4", "arc7", "arc9", "arc10"];

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
