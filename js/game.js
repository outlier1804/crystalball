// ====== Game state: progress, XP, ranks, badges (saved in the browser) ======

const SAVE_KEY = "candle-quest-save-v1";

const Game = {
  state: null,

  defaultState() {
    return {
      name: "",
      avatar: "🦊",
      xp: 0,
      asset: "NQ",       // chosen training beast (NQ or GC)
      tourDone: false,   // has Sensei given the grand tour?
      arcs: {},          // arcId -> { lessonDone, quizDone }
      missions: {},      // missionId -> true when completed
      badges: {},        // badgeId -> true
      record: { days: 0, greenDays: 0, trades: 0, bestDay: 0 },
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      this.state = raw ? Object.assign(this.defaultState(), JSON.parse(raw)) : this.defaultState();
    } catch {
      this.state = this.defaultState();
    }
    return this.state;
  },

  save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
  },

  reset() {
    localStorage.removeItem(SAVE_KEY);
    this.state = this.defaultState();
  },

  addXp(amount) {
    const before = this.rank();
    this.state.xp += amount;
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

  // Arc N unlocks when arc N-1's quiz is done
  arcUnlocked(index) {
    if (index === 0) return true;
    return this.arcProgress(ARCS[index - 1].id).quizDone;
  },

  completeLesson(arcId) {
    const p = this.arcProgress(arcId);
    if (p.lessonDone) return null;
    p.lessonDone = true;
    this.state.arcs[arcId] = p;
    return this.addXp(XP_REWARDS.lesson);
  },

  completeQuiz(arcId, correct, total) {
    const p = this.arcProgress(arcId);
    p.quizDone = true;
    // Retakes earn XP for every question beyond the previous best score
    const best = p.quizBest || 0;
    const newXp = Math.max(0, correct - best) * XP_REWARDS.quizCorrect;
    p.quizBest = Math.max(best, correct);
    this.state.arcs[arcId] = p;
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
    let rankUp = null;
    if (firstTime) rankUp = this.addXp(mission.boss ? XP_REWARDS.boss : XP_REWARDS.mission);
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
