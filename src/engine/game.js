import { RANKS, ARCS, MISSIONS, BADGES, XP_REWARDS } from "./data.js";
import { F_PASS, foundationsDoneFor } from "./foundations.js";
import { Forge, SCROLL_REWARDS } from "./upgrades.js";

// An arc quiz must be genuinely passed to unlock the next arc, not merely taken.
const ARC_PASS = 0.8;

// ====== Game state: progress, XP, ranks, badges (saved in the browser) ======

const SAVE_KEY = "candle-quest-save-v1";

// Spaced repetition: once a concept is mastered, re-surface it after growing gaps
// (Leitner boxes, in ms). Getting it right again pushes it to the next box.
const DAY = 86400000;
const SPACED_INTERVALS = [3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY, 75 * DAY];

// Struggle thresholds. Miss the same question twice in a row and the lesson that
// taught it comes back on screen before he's allowed to move on; three and Dad
// gets a text, at most once per concept per cooldown.
// No single lesson part or activity legitimately runs longer than this, so
// anything above it is a tab left open rather than time on task.
const TIME_CAP_MS = 10 * 60 * 1000;
const RETEACH_AT = 2;
const STUCK_AT = 3;
const PING_COOLDOWN = 6 * 3600 * 1000;

// A question answered after the 50/50 lifeline is worth half XP — the hint is
// free to use and always will be, but it shouldn't score the same as knowing it.
export const ASSIST_XP_FACTOR = 0.5;

export const Game = {
  state: null,

  defaultState() {
    return {
      name: "",
      avatar: "kai",
      theme: "dark",     // night dojo by default — he asked for it
      xp: 0,
      asset: "NQ",       // chosen training beast (NQ or GC)
      tourDone: false,   // has Sensei given the grand tour?
      arcs: {},          // arcId -> { lessonDone, quizDone }
      missions: {},      // missionId -> true when completed
      badges: {},        // badgeId -> true
      record: { days: 0, greenDays: 0, trades: 0, bestDay: 0 },
      foundations: {},   // sessionId -> { passed, best, attempts, at }  (stages 0-7)
      quizStats: {},     // arcId -> { attempts, bestScore, lastScore, q: { qIndex: {asked, correct, streak} } }
      quizHistory: [],   // [{ arc, score, total, at }] timeline of quiz attempts
      reflections: {},   // arcId -> { text, at }  ("explain it back" in his own words)
      helpUsed: {},      // topicKey -> count of "I don't get it" presses
      fMisses: {},       // "sessionId:activityIndex" -> consecutive misses in Foundations
      stuckPings: {},    // stuckKey -> timestamp of the last parent notification
      scrolls: 0,        // 📜 forge currency — only ever paid for FIRST completions
      upgrades: {},      // upgradeId -> { at }   (see engine/upgrades.js)
      scrollLog: [],     // [{ n, why, at }] recent scroll payouts, for the forge feed
      time: {},          // "kind:id" -> { ms, n }  time on task (see recordTime)
      timeDays: {},      // "YYYY-MM-DD" -> ms       total active time per day
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      this.state = raw ? Object.assign(this.defaultState(), JSON.parse(raw)) : this.defaultState();
    } catch {
      this.state = this.defaultState();
    }
    this.applyTheme();
    return this.state;
  },

  // Drive the CSS custom properties off a single data attribute
  applyTheme() {
    if (typeof document !== "undefined")
      document.documentElement.dataset.theme = this.state.theme || "dark";
  },

  toggleTheme() {
    this.state.theme = this.state.theme === "dark" ? "light" : "dark";
    this.applyTheme();
    this.save();
    return this.state.theme;
  },

  save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
  },

  reset() {
    localStorage.removeItem(SAVE_KEY);
    this.state = this.defaultState();
  },

  // Scholar's Ink / Grandmaster's Seal multiply everything earned from the
  // moment they're forged — which is why they're the last things in the tree.
  addXp(amount) {
    const before = this.rank();
    this.state.xp += Math.round(amount * (Forge.effect("xpMult") || 1));
    this.save();
    const after = this.rank();
    return after.name !== before.name ? after : null; // rank-up info
  },

  rank() {
    let current = RANKS[0];
    for (const r of RANKS) if (this.state.xp >= r.xp) current = r;
    return current;
  },

  nextRank() {
    return RANKS.find(r => r.xp > this.state.xp) || null;
  },

  arcProgress(arcId) {
    return this.state.arcs[arcId] || { lessonDone: false, quizDone: false };
  },

  // ---- Foundations (stages 0-3) --------------------------------------------
  // A session is only "passed" at F_PASS or better. Below that it stays open
  // and he repeats it — the whole reason the arcs stopped making sense is that
  // nothing was ever actually required to be understood before moving on.
  recordFoundationSession(sessionId, correct, total, need) {
    if (!this.state.foundations) this.state.foundations = {};
    const prev = this.state.foundations[sessionId] || { passed: false, best: 0, attempts: 0 };
    const pct = total ? correct / total : 0;
    const bar = need != null ? need : Math.round(total * F_PASS);
    const passed = prev.passed || correct >= bar;
    const firstPass = passed && !prev.passed;
    this.state.foundations[sessionId] = {
      passed, best: Math.max(prev.best, correct), attempts: prev.attempts + 1, at: Date.now(),
    };
    let rankUp = null;
    if (firstPass) { rankUp = this.addXp(XP_REWARDS.foundation); this.pay(SCROLL_REWARDS.foundation, "Training Grounds session"); }
    this.save();
    return { passed, firstPass, pct, rankUp };
  },

  // Arc N unlocks when arc N-1's quiz is PASSED *and* the foundation stages that
  // arc leans on are cleared. Arc 1 needs stages 0-3, arc 2 stage 4, arc 3
  // stages 5-6, arc 4 stage 7 — so the groundwork arrives just in time
  // finished first — the trading arcs assume every one of them.
  arcUnlocked(index) {
    if (!foundationsDoneFor(this.state, ARCS[index].id)) return false;
    if (index === 0) return true;
    return this.arcProgress(ARCS[index - 1].id).quizDone;
  },

  // Scrolls earned since the last time the UI looked. The screens read this
  // right after a completion so the "+2 📜" can fly into the forge tab at the
  // exact moment he earns it, without changing every caller's return type.
  lastScrolls: 0,

  pay(n, why) {
    const got = Forge.grant(n, why);
    if (got) this.lastScrolls += got;
    return got;
  },

  takeScrolls() {
    const n = this.lastScrolls;
    this.lastScrolls = 0;
    return n;
  },

  completeLesson(arcId) {
    const p = this.arcProgress(arcId);
    if (p.lessonDone) return null;
    p.lessonDone = true;
    this.state.arcs[arcId] = p;
    this.pay(SCROLL_REWARDS.lesson, "Lesson read");
    return this.addXp(XP_REWARDS.lesson);
  },

  // Per-question result, recorded as each answer is given (across all attempts).
  //
  // Also tracks the MISS streak, which drives the two "he's struggling" responses:
  // 2 consecutive misses re-teaches the concept on the spot instead of letting him
  // finish the quiz still not knowing, and 3 texts Dad.
  //
  // Returns { missStreak, reteach, stuck } so the caller can react immediately.
  // ---- time on task ------------------------------------------------------
  //
  // Where the minutes actually go is the signal a parent cannot get any other
  // way: a concept he answers correctly but spends four times as long on is not
  // mastered, it is being ground out. Accuracy alone hides that completely.
  //
  // Only ever surfaced in the PARENT report. A visible timer for a kid who
  // already reads slowly is a stopwatch on his weakest skill, and would turn
  // "watch it again" — the thing we most want him to do — into a cost.
  //
  // `ms` is capped per call: a tab left open overnight must not read as ten hours
  // of study, and no single lesson part or activity legitimately runs past it.
  recordTime(kind, id, ms) {
    const capped = Math.max(0, Math.min(Number(ms) || 0, TIME_CAP_MS));
    if (capped < 250) return;                 // ignore accidental taps
    if (!this.state.time) this.state.time = {};
    if (!this.state.timeDays) this.state.timeDays = {};
    const key = `${kind}:${id}`;
    const e = this.state.time[key] || (this.state.time[key] = { ms: 0, n: 0 });
    e.ms += capped;
    e.n += 1;
    const day = new Date().toISOString().slice(0, 10);
    this.state.timeDays[day] = (this.state.timeDays[day] || 0) + capped;
    this.save();
  },

  timeFor(kind, id) {
    return this.state.time?.[`${kind}:${id}`] || { ms: 0, n: 0 };
  },

  recordQuizAnswer(arcId, qIndex, correct) {
    if (!this.state.quizStats) this.state.quizStats = {};
    const st = this.state.quizStats[arcId] ||
      (this.state.quizStats[arcId] = { attempts: 0, bestScore: 0, lastScore: 0, q: {} });
    const q = st.q[qIndex] || (st.q[qIndex] = { asked: 0, correct: 0, streak: 0, box: 0, dueAt: null });
    q.asked += 1;
    if (correct) {
      q.correct += 1;
      q.streak = (q.streak || 0) + 1;             // consecutive corrects → mastery
      q.missStreak = 0;
      if (q.streak >= 2) {                         // mastered: schedule the next spaced review
        q.box = Math.min((q.box || 0) + 1, SPACED_INTERVALS.length);
        q.dueAt = Date.now() + SPACED_INTERVALS[q.box - 1];
      }
    } else {
      q.streak = 0; q.box = 0; q.dueAt = null;     // missed: back to needs-work, no review scheduled
      q.missStreak = (q.missStreak || 0) + 1;
    }
    this.save();
    const missStreak = q.missStreak || 0;
    return {
      missStreak,
      reteach: !correct && missStreak >= RETEACH_AT,
      stuck: !correct && missStreak >= STUCK_AT,
    };
  },

  // Same as recordQuizAnswer, for a Foundations activity. Foundations activities
  // lock after one tap, so a repeat miss means he came back and got it wrong
  // AGAIN — which is exactly the signal worth reacting to.
  recordFoundationMiss(sessionId, idx, correct) {
    if (!this.state.fMisses) this.state.fMisses = {};
    const key = `${sessionId}:${idx}`;
    const n = correct ? 0 : (this.state.fMisses[key] || 0) + 1;
    this.state.fMisses[key] = n;
    this.save();
    return { missStreak: n, reteach: !correct && n >= RETEACH_AT, stuck: !correct && n >= STUCK_AT };
  },

  // "I don't get it" presses, per topic. Feeds the parent report (which concepts
  // needed the most scaffolding) and the stuck alert.
  recordHelpUsed(topicKey) {
    if (!topicKey) return;
    if (!this.state.helpUsed) this.state.helpUsed = {};
    this.state.helpUsed[topicKey] = (this.state.helpUsed[topicKey] || 0) + 1;
    this.save();
  },

  helpCount(topicKey) {
    return this.state.helpUsed?.[topicKey] || 0;
  },

  // Text Dad — but at most once per concept per PING_COOLDOWN, so a rough
  // afternoon on one topic doesn't turn into a phone full of notifications.
  // Silently does nothing offline or when the endpoint isn't configured.
  notifyStuck({ topicKey, topicName, question }) {
    if (!this.state.stuckPings) this.state.stuckPings = {};
    const key = `${topicKey}:${question}`.slice(0, 160);
    const last = this.state.stuckPings[key] || 0;
    if (Date.now() - last < PING_COOLDOWN) return false;
    this.state.stuckPings[key] = Date.now();
    this.save();
    try {
      fetch("/api/stuck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: this.state.name || "",
          topic: topicName || topicKey,
          question,
          misses: STUCK_AT,
          helpUsed: this.helpCount(topicKey),
        }),
      }).catch(() => { /* offline — the report still has it */ });
    } catch { /* ignore */ }
    return true;
  },

  // "Explain it back" reflection in his own words
  saveReflection(arcId, text) {
    if (!this.state.reflections) this.state.reflections = {};
    const first = !this.state.reflections[arcId];
    this.state.reflections[arcId] = { text: String(text || "").slice(0, 600), at: Date.now() };
    if (first) this.pay(SCROLL_REWARDS.reflection, "Explained it back");
    this.save();
  },

  // `assisted` = how many of those corrects came after the 50/50 lifeline. They
  // still count toward passing (he did reason it out) but only earn half XP.
  completeQuiz(arcId, correct, total, assisted = 0) {
    const p = this.arcProgress(arcId);
    // Passing — not just finishing — is what opens the next arc. Once passed it
    // stays passed, so a weak retake never takes the next arc away from him.
    const wasPassed = p.quizDone;
    if (total && correct / total >= ARC_PASS) p.quizDone = true;
    // Scrolls for the FIRST pass only — retakes still earn XP for beating the
    // old score, but the forge can't be farmed by redoing arc 1 all night.
    if (p.quizDone && !wasPassed) {
      this.pay(SCROLL_REWARDS.quizPass, "Arc quiz passed");
      if (correct === total) this.pay(SCROLL_REWARDS.quizPerfect, "Perfect quiz");
    }
    // Retakes earn XP for every question beyond the previous best score
    const best = p.quizBest || 0;
    const gained = Math.max(0, correct - best);
    const assistedGained = Math.min(assisted, gained);
    const newXp = Math.round(
      (gained - assistedGained) * XP_REWARDS.quizCorrect +
      assistedGained * XP_REWARDS.quizCorrect * ASSIST_XP_FACTOR
    );
    p.quizBest = Math.max(best, correct);
    this.state.arcs[arcId] = p;
    // analytics: attempts, best/last score, history timeline
    if (!this.state.quizStats) this.state.quizStats = {};
    const st = this.state.quizStats[arcId] ||
      (this.state.quizStats[arcId] = { attempts: 0, bestScore: 0, lastScore: 0, q: {} });
    st.attempts += 1;
    st.lastScore = correct;
    st.bestScore = Math.max(st.bestScore, correct);
    if (!this.state.quizHistory) this.state.quizHistory = [];
    this.state.quizHistory.push({ arc: arcId, score: correct, total, at: Date.now() });
    let rankUp = null;
    if (newXp > 0) rankUp = this.addXp(newXp);
    if (correct === total) this.awardBadge("quiz-ace");
    if (arcId === "arc8" && correct === total) this.awardBadge("hype-slayer");
    if (ARCS.every(a => this.arcProgress(a.id).quizDone)) this.awardBadge("scholar");
    this.save();
    return rankUp;
  },

  missionUnlocked(mission) {
    return this.arcProgress(mission.unlockArc).quizDone;
  },

  completeMission(mission) {
    const firstTime = !this.state.missions[mission.id];
    this.state.missions[mission.id] = true;
    if (mission.id === "m4") this.awardBadge("patient");
    if (mission.boss) this.awardBadge("dragon");
    if (mission.id === "m6") this.awardBadge("strategist");
    if (mission.id === "m8") this.awardBadge("scientist");
    if (mission.id === "m9") this.awardBadge("pool-hunter");
    if (mission.id === "m10") this.awardBadge("playbook");
    let rankUp = null;
    if (firstTime) {
      rankUp = this.addXp(mission.boss ? XP_REWARDS.boss : XP_REWARDS.mission);
      this.pay(mission.boss ? SCROLL_REWARDS.boss : SCROLL_REWARDS.mission,
               mission.boss ? "Boss defeated" : "Dojo mission cleared");
    }
    this.save();
    return rankUp;
  },

  awardBadge(id) {
    if (this.state.badges[id]) return false;
    this.state.badges[id] = true;
    this.save();
    return true;
  },

  recordDay(stats) {
    const r = this.state.record;
    r.days += 1;
    r.trades += stats.tradesClosed;
    if (stats.pnl > 0) { r.greenDays += 1; this.awardBadge("green-day"); }
    if (stats.pnl > r.bestDay) r.bestDay = Math.round(stats.pnl);
    if (stats.tradesClosed >= 1) this.awardBadge("first-trade");
    if (stats.shieldSaves > 0) this.awardBadge("shield");
    this.save();
  },
};
