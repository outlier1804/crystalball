/* One question per lesson part, asked the moment the part ends.
 *
 * WHY: the quizzes sit at the end of an arc, so recall happens long after
 * watching. Retrieval — being asked to produce the answer rather than re-read it
 * — is the best-evidenced thing you can add to a lesson, and it is worth most
 * while the film is still in working memory.
 *
 * NO STAKES, deliberately. No XP, no pass mark, no blocking. A wrong answer shows
 * the explanation and he continues exactly as before. The house rule for films is
 * "watching is free and repeatable" (VideoButton); a scored gate would turn a
 * 25-second film into a test he can fail, which is how a struggling kid learns to
 * avoid the button entirely.
 *
 * Questions target the ONE idea of their part. Distractors are the plausible
 * wrong beliefs, not silly options — a distractor nobody would pick teaches
 * nothing when it is eliminated.
 *
 * The running example is the same throughout the course: a $2,000 account,
 * 1% = $20 of risk, a $10 stock, a $0.50 stop, 40 shares.
 */
export const CHECKS = {
  // ---- 01 what a stop loss is
  "lesson-01a": { q: "When do you pick the price where you'd be wrong?",
    a: ["Before you buy", "After it starts falling", "When it feels bad"], c: 0,
    e: "Before. Deciding it afterwards is just hoping with extra steps." },
  "lesson-01b": { q: "You set a stop and price hits it. What did the stop do?",
    a: ["Kept a $20 loss from becoming $150", "Lost you money", "Stopped you winning"], c: 0,
    e: "The loss was already there. The stop decided how big it was allowed to get." },
  "lesson-01c": { q: "$20 of risk, and your stop is $0.50 away. How many shares?",
    a: ["40 shares", "20 shares", "200 shares"], c: 0,
    e: "$20 ÷ $0.50 = 40. The stop does the arithmetic, not your excitement." },

  // ---- 02 the 1% rule
  "lesson-02a": { q: "On a $2,000 account, what's the most one trade should cost you?",
    a: ["$20", "$200", "Whatever it takes"], c: 0,
    e: "1% of $2,000 is $20. Not $200, and not 'a bit'." },
  "lesson-02b": { q: "Why does risking 25% a trade end the game?",
    a: ["Four bad trades and there's no fifth", "It's against the rules", "Fees get too high"], c: 0,
    e: "Four losses in a row is normal. At 25% each, normal wipes you out." },
  "lesson-02c": { q: "You lose half your account. What do you need to get back to even?",
    a: ["Double it", "Win half back", "One good trade"], c: 0,
    e: "Losing 50% needs a 100% gain to undo. That asymmetry is why losses stay small." },

  // ---- 03 what a share is
  "lesson-03a": { q: "Buying a share means you own…",
    a: ["A slice of a real company", "A ticker symbol", "A promise from the app"], c: 0,
    e: "A slice of a business. The price is what someone will pay you for your slice today." },
  "lesson-03b": { q: "40 shares of a $10 stock costs…",
    a: ["$400", "$40", "$4,000"], c: 0,
    e: "40 × $10 = $400 — the same $400 whether the price wiggles or not." },
  "lesson-03c": { q: "What's the difference between a ticker and a slice?",
    a: ["A slice is part of a business; a ticker is a colour that moves",
        "Nothing, they're the same", "A ticker costs less"], c: 0,
    e: "Guessing what a colour does next isn't the same as owning part of something real." },
  "lesson-03d": { q: "Does anyone have to buy your slice at the price you want?",
    a: ["No — and that's the whole risk", "Yes, the app guarantees it", "Only on weekdays"], c: 0,
    e: "Nobody owes you your price. That's why lesson 01 came first." },

  // ---- 04 position size
  "lesson-04a": { q: "What decides how many shares you buy?",
    a: ["How far away your stop is", "How much you like the company", "How much cash you have"], c: 0,
    e: "Risk ÷ distance to the stop. It's arithmetic, not a mood." },
  "lesson-04b": { q: "Same $20 risk, but the stop is now $1.00 away. How many shares?",
    a: ["20 shares", "40 shares", "80 shares"], c: 0,
    e: "$20 ÷ $1.00 = 20. A further stop means fewer shares, not more risk." },
  "lesson-04c": { q: "You decide you want 200 shares first. What just happened?",
    a: ["The size chose your risk instead of you", "Nothing, that's fine", "You saved on fees"], c: 0,
    e: "At 200 shares a $0.50 move costs $100 — five times your rule, and you never agreed to it." },
  "lesson-04d": { q: "What comes first, every single time?",
    a: ["The stop", "The share count", "The target"], c: 0,
    e: "Stop first. The share count is the answer it produces." },

  // ---- 05 wins vs win rate
  "lesson-05a": { q: "Can you be right only 40% of the time and still make money?",
    a: ["Yes, if the wins are bigger than the losses", "No, you need over 50%", "Only with luck"], c: 0,
    e: "4 wins at $50 beats 6 losses at $20. Being right often isn't the same as making money." },
  "lesson-05b": { q: "Six losses at $20 and four wins at $50. Where do you end up?",
    a: ["$80 ahead", "$40 behind", "Exactly even"], c: 0,
    e: "−$120 + $200 = +$80. The size of the wins did the work." },
  "lesson-05c": { q: "Which is more dangerous?",
    a: ["A 90% win rate with one huge loss", "A 40% win rate with small losses", "Neither"], c: 0,
    e: "One loss big enough to undo nine wins is the trap. Win rate hides it." },

  // ---- 06 support and resistance
  "lesson-06a": { q: "Price bounced near $10.20 twice. What does that suggest?",
    a: ["People remember it as a good price", "It can never go lower", "It's a rule of the market"], c: 0,
    e: "Levels come from memory, not magic — and memory can change its mind." },
  "lesson-06b": { q: "What actually makes a level matter?",
    a: ["Lots of people remembering the same number", "The exact price", "How round the number is"], c: 0,
    e: "The memory makes the level, not the level itself." },
  "lesson-06c": { q: "A floor breaks and price falls through. What often happens next?",
    a: ["That floor becomes the new ceiling", "It always bounces back", "The level stops existing"], c: 0,
    e: "The same number keeps mattering — just from the other side now." },

  // ---- 07 trend
  "lesson-07a": { q: "What makes an uptrend an uptrend?",
    a: ["Higher highs and higher lows", "Lots of green candles", "It went up today"], c: 0,
    e: "Every pullback stopping above the last one. Nothing more clever than that." },
  "lesson-07b": { q: "Does a trend tell you what happens tomorrow?",
    a: ["No — it describes what has happened", "Yes, that's the point", "Only in an uptrend"], c: 0,
    e: "A trend is true right up until it stops being true. It's a description, not a promise." },
  "lesson-07c": { q: "How many states can price be in?",
    a: ["Three — up, down, sideways", "Two — up or down", "As many as you like"], c: 0,
    e: "And most of the time it's sideways. Sideways is an answer too." },

  // ---- 08 the setup
  "lesson-08a": { q: "When is a setup decided?",
    a: ["In advance, before you're allowed in", "While the trade is running", "After it closes"], c: 0,
    e: "All five parts written down before you press buy. That's what makes it a setup." },
  "lesson-08b": { q: "Why does a written rule beat a feeling?",
    a: ["You can check it later; a feeling can't be checked", "Rules are always right",
        "Feelings are never useful"], c: 0,
    e: "Tomorrow you can grade a rule. You can't grade 'it looked like it wanted to go up'." },
  "lesson-08c": { q: "What can you do with a rule that you can't do with a hunch?",
    a: ["Repeat it, and tell a good loss from a stupid one", "Win more often", "Skip the stop"], c: 0,
    e: "Repeatable, and gradeable. That's the whole advantage." },

  // ---- 09 the journal
  "lesson-09a": { q: "You followed your rule exactly and still lost $20. That trade was…",
    a: ["A good trade", "A bad trade", "A mistake to fix"], c: 0,
    e: "Good decision, bad outcome. Those are two different things, and only one is yours." },
  "lesson-09b": { q: "Which one is actually dangerous?",
    a: ["Breaking your rule and getting paid anyway", "Following your rule and losing",
        "Following your rule and winning"], c: 0,
    e: "A bad win teaches you to break the rule again. That's the one that costs you later." },
  "lesson-09c": { q: "Why write the trade down at all?",
    a: ["Your memory rewrites what happened", "To show someone", "For tax reasons"], c: 0,
    e: "If it isn't written down, it didn't teach you anything." },

  // ---- 10 why most people lose
  "lesson-10a": { q: "Which is NOT one of the three ways people lose?",
    a: ["Picking the wrong company", "Trading too big", "Moving the stop"], c: 0,
    e: "Size, revenge and moving the stop. Notice none of them is about picking winners." },
  "lesson-10b": { q: "You move your stop because you don't want to be wrong yet. What did that cost?",
    a: ["The loss you agreed to became one you didn't", "Nothing, it's flexible", "A small fee"], c: 0,
    e: "$20 became $40, then $96 — and now it takes five wins to undo one decision." },
  "lesson-10c": { q: "What's the whole edge, in one line?",
    a: ["Survive long enough to get good", "Find the best stocks", "Win more than you lose"], c: 0,
    e: "You can't compound from zero. Everything else is downstream of still being here." },
};

export const checkFor = (partId) => CHECKS[partId] || null;
