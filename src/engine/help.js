// ====== "I don't get it": escalating help, always available ======
//
// The problem this solves: before this existed, a stuck kid had exactly one
// move — guess again. A wrong answer gave one sentence of feedback and a Next
// button, and the lesson screens gave nothing at all. If the words didn't land
// the first time, re-reading the same words was the only option on offer.
//
// So every teaching screen now carries a help button that escalates through
// three genuinely different explanations of the SAME idea:
//
//   1. simpler  — the same fact, shorter words, no jargon
//   2. analogy  — the idea mapped onto something a 10-year-old already knows
//   3. example  — a concrete worked case with real numbers
//
// Tiers are authored offline (below) so help works with no internet and no API
// key — the game ships as a double-clickable folder, and a kid stuck at the
// kitchen table on aeroplane wifi still gets all three. When the game IS online
// and an API key is configured, `askSensei()` layers a fourth, question-specific
// explanation on top that can react to the exact wrong answer he picked.

// Topic keys are arc ids ("arc1".."arc10") and foundation stage ids ("s0".."s11").
const BANK = {
  // ---- Foundations: the groundwork the trading arcs quietly assume ----------
  s0: {
    simpler:
      "A percent is just a slice of something, not a fixed number of Koins. " +
      "10% of a big pile is a lot. 10% of a small pile is a little. Same percent, different sizes.",
    analogy:
      "Think of a pizza 🍕. Half a giant party pizza feeds four people. Half a personal pizza feeds one. " +
      "Both are 50% — the slice size depends on how big the pizza was to start with.",
    example:
      "You have 100 Koins and lose 50% → you're down to 50. Now to get back to 100 you need to " +
      "DOUBLE what's left — a 100% gain. That's why losing big hurts twice: the hole is deeper than it looks.",
  },
  s1: {
    simpler:
      "A line chart just draws where the price was, moment by moment. Left is earlier, right is now. " +
      "Higher on the page means more expensive.",
    analogy:
      "It's a height chart on a doorframe 📏 — except instead of measuring you once a year, " +
      "it measures the price every few minutes and connects the dots.",
    example:
      "Price goes 100 → 104 → 102 → 107. Each new high (104, then 107) is higher than the last, " +
      "and the dip (102) stayed above the start. Higher steps up = an uptrend.",
  },
  s2: {
    simpler:
      "One candle is a summary of one chunk of time. The fat body shows where price OPENED and CLOSED. " +
      "The thin wicks show the highest and lowest it reached in between.",
    analogy:
      "Imagine a 5-minute recording of a running race 🏃. The candle body is where the runner started " +
      "and finished. The wicks are the furthest forward and furthest back they got during the race.",
    example:
      "A candle opens at 100, dips to 98, spikes to 105, and closes at 104. " +
      "Body = 100→104 (green, it went up). Bottom wick reaches 98, top wick reaches 105. " +
      "That long bottom wick means buyers fought back hard from the low.",
  },
  s3: {
    simpler:
      "You don't need to be right most of the time. You need your wins to be BIGGER than your losses. " +
      "Being right a lot with tiny wins and huge losses still loses.",
    analogy:
      "A basketball player who makes 4 shots out of 10 but they're all 3-pointers 🏀 beats a player " +
      "who makes 7 out of 10 but they're all worth 1 point. 12 to 7. Accuracy isn't the whole score.",
    example:
      "10 trades. You lose 6 of them at 10 Koins each = −60. You win 4 at 30 Koins each = +120. " +
      "You were WRONG most of the time and still finished +60 Koins. That's the whole secret.",
  },
  s4: {
    simpler:
      "Every price move is a tug-of-war between people who want to buy and people who want to sell. " +
      "Price moving up means buyers are pulling harder right now.",
    analogy:
      "Tug-of-war 🪢. The rope's middle knot is the price. It doesn't move because someone decided it should — " +
      "it moves because one side is pulling harder at that moment.",
    example:
      "Three green candles in a row, each closing higher: buyers won three rounds straight. " +
      "Then a long red candle swallows all three: sellers just showed up in force. The tug flipped.",
  },
  s5: {
    simpler:
      "Support is a price level where price keeps stopping falling and bounces up. " +
      "Resistance is a level where it keeps stopping rising and drops back. They're just levels that have mattered before.",
    analogy:
      "A bouncy ball in a room 🏀. The floor is support — the ball keeps bouncing off it. " +
      "The ceiling is resistance — it keeps bonking and coming back down.",
    example:
      "Price falls to 5,000 and bounces. Falls to 5,000 again — bounces again. Third time it touches 5,000, " +
      "traders are watching, because 5,000 has proven twice that buyers show up there. That's support.",
  },
  s6: {
    simpler:
      "Going SHORT means you sell first and buy back later, hoping the price fell in between. " +
      "You profit from the drop. It feels backwards because it is backwards — on purpose.",
    analogy:
      "Your friend lends you their trading card. You sell it for 100 Koins today. " +
      "Next week the card is only worth 60, so you buy one back for 60 and return it. " +
      "Your friend has their card, and you kept 40 Koins.",
    example:
      "You short at 5,000 and price falls to 4,960. You buy back 40 points lower — that's your profit. " +
      "If price had risen to 5,040 instead, you'd have lost 40. Same math, flipped direction.",
  },
  s7: {
    simpler:
      "A stop-loss is a decision you make BEFORE you enter: 'if price gets to here, I'm out.' " +
      "You set it while you're calm, so scared-you can't talk you out of it later.",
    analogy:
      "A seatbelt 🚗. You don't put it on after the crash. You click it before you drive, " +
      "when nothing is going wrong and it feels unnecessary. That's exactly when it has to go on.",
    example:
      "Enter at 5,000, stop at 4,990. You've decided the worst case is −10 points before you risk a single Koin. " +
      "Without the stop, a trade that goes wrong has no floor — it just keeps hurting until you panic.",
  },
  s8: {
    simpler:
      "A range is when price bounces between a floor and a ceiling for a while, going nowhere. " +
      "A breakout is when it finally closes outside that box and starts moving.",
    analogy:
      "A dog on a long lead in the yard 🐕. It runs back and forth between the fences all afternoon — " +
      "that's the range. The moment the gate opens, it's GONE in one direction. That's the breakout.",
    example:
      "Price chops between 5,000 and 5,020 for an hour. Then a candle CLOSES at 5,028 — above the box. " +
      "The 'closes' part matters: poking a toe out and falling back in is a fake-out, not a breakout.",
  },
  s9: {
    simpler:
      "When price moves so fast it skips a chunk of prices entirely, it leaves an empty gap behind. " +
      "The market tends to come back and fill that gap in later.",
    analogy:
      "Someone runs up a staircase so fast they skip three steps 🪜. " +
      "The steps are still missing. On the way back down, they usually step on them.",
    example:
      "Price rockets from 5,000 to 5,030 in one candle, skipping 5,010–5,020 with no trading in between. " +
      "That empty zone is the gap. Often price drifts back to around 5,015 (the halfway point) later — " +
      "halfway is usually enough to call it filled.",
  },
  s10: {
    simpler:
      "Yesterday's high and low are levels everybody can see. Lots of traders put their stop-losses just past them. " +
      "Price often pokes past, grabs those stops, then snaps back the other way.",
    analogy:
      "A puddle at the bottom of a hill 💧. Everybody's marbles roll down and collect there. " +
      "If you wanted a lot of marbles at once, that's exactly where you'd go to scoop.",
    example:
      "Yesterday's high was 5,050. Today price spikes to 5,053, triggers everyone's stops sitting above 5,050, " +
      "then reverses hard and closes back at 5,030. That poke-and-snap is a liquidity sweep — " +
      "and chasing the poke is how you get caught in it.",
  },
  s11: {
    simpler:
      "Confluence means several separate clues pointing the same direction at the same time. " +
      "One clue is a guess. Three clues agreeing is a plan.",
    analogy:
      "One friend says the ice cream truck is coming 🍦 — maybe. Three friends from three different streets " +
      "all say it, and you can hear the music — now you grab your money and run.",
    example:
      "A breakout above the range + an unfilled gap just above + yesterday's high as a target, all lining up. " +
      "That's three. Taking only the three-clue setups means fewer trades — and picky beats busy.",
  },

  // ---- Story arcs ----------------------------------------------------------
  arc1: {
    simpler:
      "A market is just a place where people agree on a price for something. " +
      "A futures contract is a PROMISE to trade something later at a price you agree on today.",
    analogy:
      "You promise your friend you'll buy their skateboard 🛹 next month for 50 Koins. " +
      "That promise is now worth something on its own — if skateboards jump to 80, " +
      "your promise to buy at 50 is a great deal, and someone else would pay you for it.",
    example:
      "Intraday means you open and close on the SAME day — nothing held overnight. " +
      "Buy at 9:45am, out by 3:00pm, sleep with zero trades open. That's the intraday rule.",
  },
  arc2: {
    simpler:
      "Green candle = price finished HIGHER than it started. Red candle = it finished LOWER. " +
      "Everything else on the candle is detail about the fight in between.",
    analogy:
      "Each candle is a mini news report of one chunk of time 📰. " +
      "The colour is the headline. The wicks are the story underneath it.",
    example:
      "A red candle with a huge bottom wick: sellers dragged price way down, but buyers shoved it most of the " +
      "way back before the bell. Technically a loss for buyers — but they're clearly waking up.",
  },
  arc3: {
    simpler:
      "An uptrend is higher highs AND higher lows. A downtrend is lower highs AND lower lows. " +
      "Trading with the trend means going in the direction it's already moving.",
    analogy:
      "Swimming in a river 🏊. Swim downstream and the water helps you. Swim upstream and you can still get there, " +
      "but you'll work three times harder for the same distance.",
    example:
      "Highs go 100 → 105 → 111. Lows go 95 → 99 → 104. Both climbing = uptrend, so you look for reasons to buy, " +
      "not reasons to sell. Fighting that is swimming upstream.",
  },
  arc4: {
    simpler:
      "Risk management means deciding how much you're willing to lose BEFORE you enter — " +
      "then making sure you actually can't lose more than that. It's the most important thing in the whole game.",
    analogy:
      "A video game where you only get one life ❤️. You'd play completely differently, right? " +
      "You'd stop rushing, check every corner, never gamble everything on one jump. Real accounts have one life.",
    example:
      "1,000 Koins, risking 1% = 10 Koins per trade. Enter at 5,000 with a stop at 4,990 (10 points). " +
      "Size the position so those 10 points cost exactly 10 Koins. Now you could be wrong TEN times in a row " +
      "and still have 90% of your pile.",
  },
  arc5: {
    simpler:
      "The three demons are FOMO (jumping in late because you're scared to miss out), " +
      "revenge trading (trading angry after a loss to win it back), and overtrading (taking trades out of boredom). " +
      "All three are feelings pretending to be plans.",
    analogy:
      "Grocery shopping while starving 🍫. You come home with junk you didn't want. " +
      "The list you wrote at home when you were full — that's your trading plan.",
    example:
      "Price rockets 40 points without you. FOMO says 'get in NOW.' The plan says 'my entry was 40 points ago, " +
      "and chasing means buying exactly where the smart money is selling.' Missing a trade costs you nothing. " +
      "Chasing one costs you Koins.",
  },
  arc6: {
    simpler:
      "Volatility means how BIG and how FAST price is swinging. " +
      "On a wild day, the same trade size risks much more — so on wild days you trade smaller, not bigger.",
    analogy:
      "Driving in a storm 🌧️. You don't drive your normal speed and hope. You slow down. " +
      "The road is the same road; the conditions changed, so you change.",
    example:
      "Normal day: price swings 20 points, your 10-point stop is comfortable. " +
      "Wild day: price swings 60 points, and that same 10-point stop gets hit by pure noise before you're even right. " +
      "Wider stop, smaller size — or just don't play today.",
  },
  arc7: {
    simpler:
      "A strategy is a repeatable setup you look for every day, instead of reacting to whatever's on screen. " +
      "Opening range breakouts, gaps, and yesterday's levels are three of them — best when they agree.",
    analogy:
      "A fishing spot 🎣. You don't cast randomly across the whole lake. You learn the three spots where the fish " +
      "actually are, and you go back to those, every time.",
    example:
      "First 30 minutes make a box from 5,000 to 5,020. Price closes above 5,020 (breakout), there's an unfilled " +
      "gap at 5,035 pulling it up (clue two), and yesterday's high sits at 5,040 (clue three, a target). " +
      "Three clues, one direction — that's the trade.",
  },
  arc8: {
    simpler:
      "Trading hype online is people showing you their wins and hiding their losses. " +
      "One amazing day proves nothing — anybody can flip heads once.",
    analogy:
      "Someone posting only their best basketball shot 🏀 out of 200 attempts. " +
      "The video is real. The impression it gives is a lie.",
    example:
      "'I made 5,000 Koins today!' — okay, out of how many days? What did the other 29 look like? " +
      "One good day out of 30 bad ones is a losing trader with a good camera. Test before trust.",
  },
  arc9: {
    simpler:
      "Liquidity means a pile of orders sitting at one price. Stop-losses gather just beyond yesterday's high " +
      "and low, so those spots are magnets. Price often sweeps them, then reverses.",
    analogy:
      "A honeypot 🍯. Everyone's stops pile up in the same obvious place, " +
      "and price wanders over to eat them before going where it was actually headed.",
    example:
      "Yesterday's low was 4,980. Price dips to 4,977, everyone's stops fire, and then it rips back up to 5,020. " +
      "If you sold the dip, you sold at the exact bottom. If you waited for the snap-back, you caught the whole move.",
  },
  arc10: {
    simpler:
      "B.R.E.A.D is a checklist you run in the same order every single time: " +
      "Behavior, Reaction, Execution, Alignment, Discipline. Any step fails → no trade. " +
      "The checklist is there so you don't have to trust yourself in the moment.",
    analogy:
      "A pilot's pre-flight checklist ✈️. Pilots have flown a thousand times and still read every line out loud. " +
      "Not because they forgot how — because a checklist doesn't get excited or tired.",
    example:
      "Behavior: is price at a level that matters? Reaction: did it actually react there? " +
      "Execution: is my entry, stop and target defined? Alignment: do my clues agree? " +
      "Discipline: am I following the plan or my feelings? Four yeses and one no is still NO TRADE.",
  },
};

const TIERS = ["simpler", "analogy", "example"];

export const TIER_LABEL = {
  simpler: "🐣 Say it simpler",
  analogy: "💡 Give me an example I know",
  example: "📊 Show me with real numbers",
};

export const TIER_INTRO = {
  simpler: "Okay — same idea, smaller words:",
  analogy: "Let's try it a different way:",
  example: "Here it is with actual numbers:",
};

export function tierAt(step) {
  return TIERS[Math.min(step, TIERS.length - 1)];
}

export function tierCount() {
  return TIERS.length;
}

// Offline help for a topic at a given escalation step. Always returns something —
// falls back to the question's own explanation rather than leaving him with nothing.
export function localHelp(topicKey, step, fallback) {
  const entry = BANK[topicKey];
  const tier = tierAt(step);
  if (entry && entry[tier]) return entry[tier];
  // No authored bank for this topic yet — better an honest repeat than a blank panel.
  return fallback || "Let's look at this together. Read the question one more time, slowly, and say it out loud.";
}

// Question-specific help from Sensei (Claude, server-side). Returns null on any
// failure — offline, no API key, network hiccup — and the caller shows local help
// instead. Help must NEVER be a screen that can fail to appear.
export async function askSensei({ topic, question, options, correctAnswer, chosenAnswer, tier, lessonText }) {
  try {
    const r = await fetch("/api/help", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, question, options, correctAnswer, chosenAnswer, tier, lessonText }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    return d.help || null;
  } catch {
    return null;
  }
}

export const HELP_BANK = BANK;

// ====== "Explain it back": local reading of a written reflection ============
//
// He types the concept in his own words and — before this — the answer went
// into a void whenever the server had no API key, was offline, or hiccuped.
// A kid who writes four sentences and gets a generic "well done!" learns that
// nobody read it, and stops trying.
//
// So every arc lists the ideas a good answer actually contains, with the words
// a 10-year-old would plausibly use for each. This reads his answer, names what
// he GOT (quoting his own vocabulary back at him so it's obvious it was read),
// and adds at most ONE idea he left out. Never more than one — a list of misses
// reads as a mark out of ten.
const REFLECT_KEYS = {
  arc1: [
    { id: "promise", label: "a futures contract is a promise to trade later at a price agreed today", words: ["promise", "agree", "later", "future", "deal", "contract"] },
    { id: "intraday", label: "intraday means everything closes the same day — nothing held overnight", words: ["same day", "intraday", "overnight", "close", "day"] },
    { id: "market", label: "a market is just people agreeing on a price", words: ["market", "price", "buyer", "seller", "people"] },
  ],
  arc2: [
    { id: "body", label: "the body shows where price opened and closed", words: ["body", "open", "close", "start", "end", "finish"] },
    { id: "colour", label: "green finished higher, red finished lower", words: ["green", "red", "up", "down", "higher", "lower"] },
    { id: "wick", label: "the wicks show the highest and lowest it reached on the way", words: ["wick", "high", "low", "shadow", "spike", "tail"] },
  ],
  arc3: [
    { id: "hh", label: "an uptrend is higher highs AND higher lows", words: ["higher high", "higher low", "uptrend", "up trend", "climb", "rising"] },
    { id: "dt", label: "a downtrend is lower highs and lower lows", words: ["lower high", "lower low", "downtrend", "down trend", "falling"] },
    { id: "with", label: "trading with the trend is easier than fighting it", words: ["with the trend", "direction", "fight", "against", "river", "easier"] },
  ],
  arc4: [
    { id: "before", label: "you decide what you can lose BEFORE you enter", words: ["before", "decide", "plan", "ahead", "first"] },
    { id: "stop", label: "the stop-loss is what makes that decision real", words: ["stop", "stop-loss", "exit", "get out", "seatbelt"] },
    { id: "small", label: "risking a small slice per trade means being wrong can't wipe you out", words: ["small", "1%", "one percent", "percent", "slice", "little", "size"] },
  ],
  arc5: [
    { id: "fomo", label: "FOMO is chasing a move you already missed", words: ["fomo", "miss", "chase", "late", "jump in", "scared"] },
    { id: "revenge", label: "revenge trading is trying to win a loss straight back", words: ["revenge", "angry", "win it back", "mad", "get back"] },
    { id: "over", label: "overtrading is taking trades out of boredom", words: ["overtrade", "over trade", "bored", "too many", "every"] },
    { id: "plan", label: "the plan you wrote when you were calm beats the feeling you have right now", words: ["plan", "calm", "rules", "feeling", "emotion"] },
  ],
  arc6: [
    { id: "what", label: "volatility is how big and fast price is swinging", words: ["volatility", "swing", "wild", "fast", "big move", "choppy"] },
    { id: "size", label: "on wild days you trade SMALLER, not bigger", words: ["smaller", "less", "reduce", "wider stop", "careful", "slow down"] },
    { id: "noise", label: "a normal stop gets hit by pure noise on a wild day", words: ["noise", "stopped out", "hit", "random", "shaken"] },
  ],
  arc7: [
    { id: "repeat", label: "a strategy is the same setup you look for every day", words: ["same", "every day", "setup", "repeat", "routine", "plan"] },
    { id: "clues", label: "the setups worth taking are the ones where clues agree", words: ["clue", "agree", "confluence", "line up", "together", "confirm"] },
    { id: "named", label: "opening range, gaps and yesterday's levels are the three you know", words: ["opening range", "gap", "yesterday", "level", "breakout"] },
  ],
  arc8: [
    { id: "survivor", label: "people post their wins and hide their losses", words: ["hide", "only", "wins", "loss", "post", "show off", "brag"] },
    { id: "sample", label: "one good day proves nothing — you need many days", words: ["one day", "lucky", "luck", "many", "proof", "prove", "average"] },
    { id: "test", label: "test before you trust", words: ["test", "trust", "check", "evidence", "verify"] },
  ],
  arc9: [
    { id: "pool", label: "stop-losses pile up just past yesterday's high and low", words: ["stop", "pile", "pool", "above", "below", "yesterday", "high", "low"] },
    { id: "sweep", label: "price pokes past to grab them, then snaps back", words: ["sweep", "poke", "grab", "snap", "reverse", "wick", "trap"] },
    { id: "patience", label: "chasing the poke is how you get caught — waiting for the snap-back is the trade", words: ["wait", "patient", "chase", "caught", "after"] },
  ],
  arc10: [
    { id: "order", label: "you run the same five checks in the same order every time", words: ["order", "every time", "checklist", "same", "bread", "steps"] },
    { id: "letters", label: "Behavior, Reaction, Execution, Alignment, Discipline", words: ["behavior", "behaviour", "reaction", "execution", "alignment", "discipline"] },
    { id: "veto", label: "any single step failing means NO trade", words: ["no trade", "any", "fail", "skip", "one no", "stop"] },
  ],
};

const PRAISE = [
  "You've got the main thing:",
  "This is the bit that matters, and you nailed it:",
  "Read this back — you explained it yourself:",
];

// Reflection feedback with no server and no API key. Always returns something
// that proves the answer was read.
export function localReflectionFeedback(arcId, answer) {
  const text = String(answer || "").toLowerCase();
  const keys = REFLECT_KEYS[arcId];
  const words = text.split(/\s+/).filter(Boolean).length;
  if (!keys || !text.trim()) {
    return "You put it in your own words — that's the part that makes it stick. Sensei read every word. 🦉";
  }

  const hit = keys.filter((k) => k.words.some((w) => text.includes(w)));
  const missed = keys.filter((k) => !hit.includes(k));
  const parts = [];

  if (hit.length === 0) {
    parts.push(
      `You wrote ${words} ${words === 1 ? "word" : "words"} in your own words, and that already counts. ` +
      `Here's the piece Sensei was listening for: ${keys[0].label}. Say that bit back to yourself once.`
    );
  } else {
    const pick = PRAISE[Math.min(hit.length - 1, PRAISE.length - 1)];
    parts.push(`${pick} ${hit[0].label}.`);
    if (hit.length > 1) {
      parts.push(`You also got ${hit[1].label} — that's ${hit.length} of the ${keys.length} big ideas.`);
    }
    if (missed.length) {
      parts.push(`One more to add next time: ${missed[0].label}.`);
    } else {
      parts.push(`That's all of it. You could teach this one. 🦉`);
    }
  }
  return parts.join(" ");
}

export const REFLECT_KEYS_BANK = REFLECT_KEYS;
