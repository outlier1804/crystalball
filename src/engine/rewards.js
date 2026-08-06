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
    return Game.state.streak || { count: 0, longest: 0, lastDay: null };
  },

  // Call on any real activity. Returns { count, isNewDay, milestone, revived }.
  //
  // A missed day resets to 1 rather than 0 — the punishment for missing Tuesday
  // shouldn't be that Wednesday feels pointless.
  touchDay() {
    const key = todayKey();
    const st = { ...this.streak() };
    if (st.lastDay === key) return { count: st.count, isNewDay: false, milestone: null };

    const gap = st.lastDay ? dayNumber(key) - dayNumber(st.lastDay) : 999;
    const revived = gap > 1 && st.count > 0;
    st.count = gap === 1 ? st.count + 1 : 1;
    st.lastDay = key;
    st.longest = Math.max(st.longest || 0, st.count);
    Game.state.streak = st;
    Game.save();
    return {
      count: st.count,
      isNewDay: true,
      revived,
      milestone: STREAK_MILESTONES.includes(st.count) ? st.count : null,
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
