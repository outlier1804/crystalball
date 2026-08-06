// ====== Foundations: stages 0-3, the ground floor under the trading arcs ======
//
// Design rules baked into this file, on purpose:
//   * ONE idea per session. Not one per panel — one per sitting.
//   * ~15 minutes, 4-6 activities. It ends while he still wants more.
//   * Do-then-name: he plays with the thing FIRST, the word comes after.
//   * No jargon and no acronyms anywhere in stages 0-3.
//   * Every session ends on a win.
//
// Activity types the Foundations screen knows how to render:
//   pick    — a question; may carry a `chart` (line) or `candle` to look at
//   percent — work out a percentage of a Koin pile, tap the answer
//   build   — drag a candle's four numbers until it matches a story
//   game    — play N rounds of a Koin game and watch what actually happens
//   say     — Sensei says one short thing (used sparingly, max 2 per session)

export const F_PASS = 0.8;   // must get 80% to clear a session

export const STAGES = [
  // ---------------------------------------------------------------- stage 0
  {
    id: "s0",
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
];

// ---------------------------------------------------------------- helpers

export const ALL_SESSIONS = STAGES.flatMap((s) =>
  s.sessions.map((x) => ({ ...x, stageId: s.id, stageName: s.name, stageEmoji: s.emoji }))
);

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
