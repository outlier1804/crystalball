// ====== The "one more round" layer: streaks, daily quests, combos, chests =====
//
// The teaching was already here. What was missing was a reason to open the app
// on a day nobody told him to. Four loops, in the order they hook:
//
//   1. STREAK   — a number he doesn't want to reset. Costs nothing to keep, so
//                 the cheapest possible reason to come back tomorrow.
//   2. QUESTS   — three small goals a day, re-rolled every morning, each with a
//                 claimable reward. Turns "learn trading" into "do three things".
//   3. COMBO    — a multiplier that builds inside a quiz and BREAKS on a miss.
//                 Makes the next question matter even when the quiz is already
//                 passed. This is the one that makes him retake quizzes.
//   4. CHEST    — a random reward at the end of anything finished. Variable
//                 rewards are stickier than fixed ones; the range is small
//                 enough that it's a bonus, never the point.
//
// Everything lives in the same save file as the rest of the game state.

import { Game } from "./game.js";

const DAY_MS = 86400000;

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayNumber(key) {
  const [y, m, d] = key.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
}

// ---------------------------------------------------------------- quest pool
//
// Each quest counts one thing he was going to do anyway. Nothing here asks him
// to grind — the biggest goal is a normal 10-minute sitting.
const QUEST_POOL = [
  { id: "lesson1",  emoji: "📖", key: "lessons",  goal: 1, xp: 20, label: "Read one lesson" },
  { id: "session1", emoji: "🧱", key: "sessions", goal: 1, xp: 25, label: "Clear a Training Grounds session" },
  { id: "correct5", emoji: "✅", key: "correct",  goal: 5, xp: 20, label: "Get 5 questions right" },
  { id: "correct10",emoji: "🎯", key: "correct",  goal: 10, xp: 35, label: "Get 10 questions right" },
  { id: "combo3",   emoji: "🔥", key: "bestCombo",goal: 3, xp: 25, label: "Hit a 3-answer combo" },
  { id: "combo5",   emoji: "⚡", key: "bestCombo",goal: 5, xp: 45, label: "Hit a 5-answer combo" },
  { id: "quiz1",    emoji: "❓", key: "quizzes",  goal: 1, xp: 30, label: "Finish a quiz" },
  { id: "reflect1", emoji: "✍️", key: "reflects", goal: 1, xp: 30, label: "Explain something back in your own words" },
  { id: "review1",  emoji: "🔁", key: "reviews",  goal: 1, xp: 25, label: "Do a memory check" },
];

// Three quests a day, chosen by the date so they're stable all day and different
// tomorrow. Always includes one easy one first so day one is never a wall.
function questsFor(dayKey) {
  const n = dayNumber(dayKey);
  const easy = QUEST_POOL.filter((q) => q.xp <= 25);
  const rest = QUEST_POOL.filter((q) => q.xp > 25);
  const pick = [easy[n % easy.length]];
  let i = n % rest.length;
  while (pick.length < 3) {
    const cand = rest[i % rest.length];
    if (!pick.some((p) => p.id === cand.id)) pick.push(cand);
    i++;
  }
  return pick;
}

function blankDay(dayKey) {
  return {
    date: dayKey,
    counts: { lessons: 0, sessions: 0, correct: 0, quizzes: 0, reflects: 0, missions: 0, reviews: 0, bestCombo: 0 },
    claimed: [],
  };
}

// ------------------------------------------------------------------- streaks
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];
// A freeze bridges one missed day. Earned every FREEZE_EVERY consecutive days and
// capped, so it forgives an off day without making the streak unloseable.
const FREEZE_EVERY = 5;
const MAX_FREEZES = 2;

/** Pure streak transition: previous streak + today's key -> the next streak.
 *
 * Split out of touchDay so it can be tested without a browser or a save file —
 * the arithmetic here is the whole feature, and a test that re-implements it
 * proves nothing when the real code drifts.
 *
 * Returns { next, froze, revived }. `next` is a new object; nothing is mutated.
 */
export function nextStreak(prev, key) {
  const st = { ...prev };
  const gap = st.lastDay ? dayNumber(key) - dayNumber(st.lastDay) : 999;
  const prior = st.count || 0;
  let froze = false;

  if (gap === 1) {
    st.count = prior + 1;
  } else if (gap === 2 && prior > 0 && (st.freezes || 0) > 0) {
    st.freezes -= 1;             // missed exactly one day, and he had cover banked
    st.count = prior + 1;
    froze = true;
    // stamped so the UI can say it happened exactly once, on the day it happened,
    // without every touchDay() caller having to handle the return value
    st.frozeOn = key;
  } else {
    st.count = 1;                // a longer absence really did end it
  }

  st.lastDay = key;
  st.longest = Math.max(st.longest || 0, st.count);

  // earned quietly in the background, so it is a nice surprise when it saves him
  if (st.count > 0 && st.count % FREEZE_EVERY === 0) {
    st.freezes = Math.min(MAX_FREEZES, (st.freezes || 0) + 1);
  }

  return { next: st, froze, revived: gap > 1 && !froze && prior > 0 };
}

export const Rewards = {
  // Lazily create the daily block, rolling over at midnight local time.
  day() {
    const key = todayKey();
    const s = Game.state;
    if (!s.day || s.day.date !== key) {
      s.day = blankDay(key);
      Game.save();
    }
    return s.day;
  },

  streak() {
    return Game.state.streak || { count: 0, longest: 0, lastDay: null, freezes: 0 };
  },

  // Call on any real activity. Returns { count, isNewDay, milestone, revived, froze }.
  //
  // A missed day resets to 1 rather than 0 — the punishment for missing Tuesday
  // shouldn't be that Wednesday feels pointless.
  //
  // FREEZES. Resetting still meant one bad week wiped a 12-day streak, and for a
  // kid who already finds this hard, a number that only ever punishes him is a
  // reason to stop opening the app. So he banks a freeze every FREEZE_EVERY days
  // (up to MAX_FREEZES) and one is spent automatically to bridge a single missed
  // day. Automatic on purpose: making him choose to spend it turns a bad day into
  // a second decision he can get wrong.
  //
  // A freeze bridges ONE missed day only. Longer than that and the streak really
  // has ended — a number that can never go down stops meaning anything, and he
  // would notice that faster than most adults.
  touchDay() {
    const key = todayKey();
    const prev = this.streak();
    if (prev.lastDay === key) return { count: prev.count, isNewDay: false, milestone: null };

    const { next, froze, revived } = nextStreak(prev, key);
    Game.state.streak = next;
    Game.save();
    return {
      count: next.count,
      isNewDay: true,
      revived,
      froze,
      freezes: next.freezes || 0,
      milestone: STREAK_MILESTONES.includes(next.count) ? next.count : null,
    };
  },

  // ------------------------------------------------------------------ quests
  quests() {
    const d = this.day();
    return questsFor(d.date).map((q) => {
      const have = q.key === "bestCombo" ? d.counts.bestCombo : d.counts[q.key] || 0;
      return {
        ...q,
        progress: Math.min(have, q.goal),
        done: have >= q.goal,
        claimed: d.claimed.includes(q.id),
      };
    });
  },

  // Count one thing. Returns the quests that JUST tipped over into claimable,
  // so the caller can celebrate at the moment it happens.
  count(key, n = 1) {
    const d = this.day();
    const before = this.quests();
    if (key === "bestCombo") d.counts.bestCombo = Math.max(d.counts.bestCombo || 0, n);
    else d.counts[key] = (d.counts[key] || 0) + n;
    Game.save();
    const after = this.quests();
    return after.filter((q, i) => q.done && !before[i].done);
  },

  claim(id) {
    const d = this.day();
    const q = this.quests().find((x) => x.id === id);
    if (!q || !q.done || q.claimed) return null;
    d.claimed.push(id);
    Game.save();
    const rankUp = Game.addXp(q.xp);
    return { xp: q.xp, rankUp };
  },

  allQuestsDone() {
    const qs = this.quests();
    return qs.length > 0 && qs.every((q) => q.claimed);
  },

  // ------------------------------------------------------------------ combos
  //
  // Multiplier by consecutive correct answers. Deliberately capped at 3× and
  // reached at 7 — high enough to chase, low enough that a lucky run can't
  // out-earn actually finishing things.
  comboMultiplier(combo) {
    if (combo >= 7) return 3;
    if (combo >= 5) return 2;
    if (combo >= 3) return 1.5;
    return 1;
  },

  comboLabel(combo) {
    if (combo >= 7) return "UNSTOPPABLE";
    if (combo >= 5) return "ON FIRE";
    if (combo >= 3) return "HEATING UP";
    return "";
  },

  // ------------------------------------------------------------------ chests
  //
  // Variable reward at the end of anything finished. The floor is always worth
  // opening; the ceiling is rare enough to be worth remembering.
  rollChest(kind = "wood") {
    const table = {
      wood:   [{ p: 60, xp: 10, emoji: "🪙", label: "A handful of Koins" },
               { p: 30, xp: 25, emoji: "💰", label: "A fat pouch!" },
               { p: 10, xp: 50, emoji: "💎", label: "A GEM! Rare drop!" }],
      silver: [{ p: 50, xp: 25, emoji: "🪙", label: "A pouch of Koins" },
               { p: 35, xp: 50, emoji: "💰", label: "A heavy pouch!" },
               { p: 15, xp: 90, emoji: "💎", label: "A GEM! Rare drop!" }],
      gold:   [{ p: 45, xp: 50, emoji: "💰", label: "A heavy pouch!" },
               { p: 35, xp: 90, emoji: "💎", label: "A gem!" },
               { p: 20, xp: 150, emoji: "🐉", label: "DRAGON HOARD! Legendary!" }],
    }[kind] || [];
    let roll = Math.random() * 100;
    for (const row of table) {
      if (roll < row.p) return { ...row, kind };
      roll -= row.p;
    }
    const last = table[table.length - 1];
    return { ...last, kind };
  },

  // Open it for real — awards the XP. Split from rollChest so the UI can show
  // the chest shaking before anything is credited.
  openChest(prize) {
    const rankUp = Game.addXp(prize.xp);
    return { rankUp };
  },
};
