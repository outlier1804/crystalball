// ====== The Forge: gear he can only earn by LEARNING =====================
//
// Ranks and badges told him he'd learned something. They never changed what he
// could DO. So the loop stopped at "nice, a title" instead of "I need arc 4 to
// get the trailing shield".
//
// This is the missing half:
//
//   LEARN  →  a lesson/quiz/mission pays out SCROLLS (📜)
//   FORGE  →  scrolls buy gear, but each piece is LOCKED behind the arc that
//             actually teaches the idea it embodies
//   TRADE  →  the gear changes the dojo sim for real — bigger purse, bigger
//             contract, a shield that trails, eyes that see yesterday's levels
//
// The gate is the whole point. He cannot buy the trailing shield with a pile of
// scrolls; he has to pass Arc 5, which is where trailing stops are taught. The
// upgrade is the reward for understanding, and the scrolls only decide the
// ORDER he unlocks things in — that's the choice that makes it a game.
//
// Every effect below is wired into sim.js / rewards.js / game.js. Nothing here
// is decorative.

import { Game } from "./game.js";
import { ARCS } from "./data.js";

// ---------------------------------------------------------- scroll economy
//
// Tuned so a full arc (lesson + passed quiz + its mission) pays ~6 scrolls,
// and tier-1 gear costs 3-5. He gets to buy something the same evening he
// learns something. Nothing in here is grindable — you cannot farm scrolls
// by replaying; only FIRST completions pay.
export const SCROLL_REWARDS = {
  lesson: 2,
  quizPass: 3,
  quizPerfect: 2,   // on top of quizPass
  foundation: 2,
  mission: 3,
  boss: 6,
  reflection: 2,
  streak7: 5,       // a week of showing up
};

// --------------------------------------------------------------- the tree
//
// tier 1/2/3 = the three columns of the forge. `arc` is the gate: that arc's
// quiz must be PASSED before the piece can be forged, no matter how rich he is.
// `needs` chains a piece to the one before it in its own line.
export const UPGRADES = [
  // ── The Purse line — how much he trades with ─────────────────────────────
  { id: "purse1", line: "purse", tier: 1, emoji: "👛", name: "Traveler's Purse",
    arc: "arc1", cost: 3,
    desc: "Start every dojo day with 1,500 Koins instead of 1,000.",
    flavor: "A bigger purse is not a bigger edge — but it is a longer adventure.",
    effect: { startKoin: 15000 } },
  { id: "purse2", line: "purse", tier: 2, emoji: "💰", name: "Merchant's Coffer",
    arc: "arc4", cost: 8, needs: "purse1",
    desc: "Start with 3,000 Koins.",
    flavor: "Arc 4 first. A big purse with no shield is just a bigger thing to lose.",
    effect: { startKoin: 30000 } },
  { id: "purse3", line: "purse", tier: 3, emoji: "🏦", name: "Dragon's Vault",
    arc: "arc10", cost: 20, needs: "purse2",
    desc: "Start with 8,000 Koins.",
    flavor: "The vault opens only for a trader with a playbook.",
    effect: { startKoin: 80000 } },

  // ── The Blade line — size of each trade ──────────────────────────────────
  { id: "blade1", line: "blade", tier: 1, emoji: "🗡️", name: "Apprentice Blade",
    arc: "arc2", cost: 4,
    desc: "Each price point is worth 15 Koins instead of 10.",
    flavor: "Cuts deeper both ways. Wins get bigger — and so do losses.",
    effect: { koinPerPoint: 15 } },
  { id: "blade2", line: "blade", tier: 2, emoji: "⚔️", name: "Samurai Blade",
    arc: "arc5", cost: 10, needs: "blade1",
    desc: "Each price point is worth 22 Koins.",
    flavor: "Arc 5 teaches the mind that can hold this blade steady.",
    effect: { koinPerPoint: 22 } },
  { id: "blade3", line: "blade", tier: 3, emoji: "🐉", name: "Dragonfang",
    arc: "arc10", cost: 22, needs: "blade2",
    desc: "Each price point is worth 32 Koins.",
    flavor: "Only for a trader who follows the checklist every single time.",
    effect: { koinPerPoint: 32 } },

  // ── The Shield line — Arc 4's whole point, made mechanical ───────────────
  { id: "shield1", line: "shield", tier: 1, emoji: "🛡️", name: "Tight Shield",
    arc: "arc4", cost: 5,
    desc: "Unlocks the 3-point stop-loss in the dojo — a much tighter shield.",
    flavor: "The smaller the shield, the smaller the scratch.",
    effect: { tightStop: true } },
  { id: "shield2", line: "shield", tier: 2, emoji: "🪢", name: "Trailing Shield",
    arc: "arc5", cost: 12, needs: "shield1",
    desc: "Once a trade is 6 points in profit, the shield follows the price up by itself and locks in the win.",
    flavor: "A pro move: the shield never goes backwards, only forwards.",
    effect: { autoTrail: true } },
  { id: "shield3", line: "shield", tier: 3, emoji: "✨", name: "Guardian's Ward",
    arc: "arc9", cost: 18, needs: "shield2",
    desc: "The trailing shield starts at 3 points of profit and hugs tighter.",
    flavor: "Earned by the trader who knows where the stops are hiding.",
    effect: { autoTrail: true, trailAt: 3, trailGap: 3 } },

  // ── The Eye line — information he can only get by learning to read it ────
  { id: "eye1", line: "eye", tier: 1, emoji: "👁️", name: "Trend Eye",
    arc: "arc3", cost: 4,
    desc: "The chart marks yesterday's high and low on EVERY mission, not just the strategy ones.",
    flavor: "You learned the walls exist. Now you get to see them.",
    effect: { levelSight: true } },
  { id: "eye2", line: "eye", tier: 2, emoji: "🔮", name: "Gap Sight",
    arc: "arc7", cost: 11, needs: "eye1",
    desc: "Fair value gaps, the opening range and the three signal lamps appear on every mission.",
    flavor: "One clue is a rumor. Three clues is a plan.",
    effect: { strategyVision: true } },
  { id: "eye3", line: "eye", tier: 3, emoji: "🌌", name: "Sage's Vision",
    arc: "arc10", cost: 20, needs: "eye2",
    desc: "Adds a live B.R.E.A.D confluence meter to the dojo chart.",
    flavor: "You see the whole board now.",
    effect: { strategyVision: true, confluenceMeter: true } },

  // ── The Charm line — the fun ones ────────────────────────────────────────
  { id: "charm1", line: "charm", tier: 1, emoji: "🍀", name: "Fortune Charm",
    arc: "arc6", cost: 6,
    desc: "Every reward chest is rolled twice and you keep the better one.",
    flavor: "Luck is not an edge. It is a nice bonus on top of one.",
    effect: { chestLuck: true } },
  { id: "charm2", line: "charm", tier: 2, emoji: "🖋️", name: "Scholar's Ink",
    arc: "arc8", cost: 14, needs: "charm1",
    desc: "Everything you earn from here on gives 25% more XP.",
    flavor: "The Hype Demon is beaten by the kid who did the reading.",
    effect: { xpMult: 1.25 } },
  { id: "charm3", line: "charm", tier: 3, emoji: "👑", name: "Grandmaster's Seal",
    arc: "arc10", cost: 25, needs: "charm2",
    desc: "50% more XP from everything, and a golden nameplate.",
    flavor: "The last thing in the forge. There is nothing above this.",
    effect: { xpMult: 1.5, goldName: true } },
];

export const LINES = {
  purse:  { name: "The Purse",  emoji: "👛", blurb: "How much you trade with" },
  blade:  { name: "The Blade",  emoji: "⚔️", blurb: "How big each trade hits" },
  shield: { name: "The Shield", emoji: "🛡️", blurb: "How well you protect it" },
  eye:    { name: "The Eye",    emoji: "👁️", blurb: "What the chart shows you" },
  charm:  { name: "Charms",     emoji: "🍀", blurb: "Luck and learning bonuses" },
};

// Numeric effects stack by taking the BEST owned value, not by summing — so a
// tier-3 purse doesn't quietly add to the tier-1 purse behind his back.
// startKoin values are 10x their pre-2026-08-06 numbers, matching START_BALANCE
// moving 1,000 -> 10,000 so the 1% rule yields whole share counts. See sim.js.
const NUMERIC_MAX = ["startKoin", "koinPerPoint", "xpMult"];
const NUMERIC_MIN = ["trailAt", "trailGap"];

const DEFAULTS = {
  startKoin: 10000,
  koinPerPoint: 10,
  xpMult: 1,
  trailAt: 6,
  trailGap: 5,
  tightStop: false,
  autoTrail: false,
  levelSight: false,
  strategyVision: false,
  confluenceMeter: false,
  chestLuck: false,
  goldName: false,
};

export const Forge = {
  scrolls() {
    return Game.state?.scrolls || 0;
  },

  owned(id) {
    return !!Game.state?.upgrades?.[id];
  },

  byId(id) {
    return UPGRADES.find((u) => u.id === id) || null;
  },

  // Pay out scrolls. Returns the amount actually granted (0 when it's a repeat
  // completion) so the caller knows whether to celebrate.
  grant(n, why = "") {
    if (!n || n <= 0) return 0;
    const s = Game.state;
    s.scrolls = (s.scrolls || 0) + n;
    if (!s.scrollLog) s.scrollLog = [];
    s.scrollLog.push({ n, why, at: Date.now() });
    if (s.scrollLog.length > 60) s.scrollLog = s.scrollLog.slice(-60);
    Game.save();
    return n;
  },

  // Why an upgrade can't be forged yet — used verbatim as the card's subtitle,
  // because "locked" tells him nothing and "Pass Arc 4's quiz" tells him what
  // to go do next.
  lockReason(u) {
    if (this.owned(u.id)) return null;
    if (u.needs && !this.owned(u.needs)) {
      const prev = this.byId(u.needs);
      return `Forge ${prev.emoji} ${prev.name} first`;
    }
    if (u.arc && !Game.arcProgress(u.arc).quizDone) {
      const arc = ARCS.find((a) => a.id === u.arc);
      const n = arc ? arc.name.replace(/^Arc (\d+):.*/, "Arc $1") : u.arc;
      return `Locked — pass ${n}'s quiz${arc ? `: ${arc.name.split(": ")[1]}` : ""}`;
    }
    if (this.scrolls() < u.cost) return `Needs ${u.cost} 📜 — you have ${this.scrolls()}`;
    return null;
  },

  // Learned it, chained it, can afford it.
  canForge(u) {
    return !this.owned(u.id) && this.lockReason(u) === null;
  },

  // The state in between: he's DONE the learning, he just needs to save up.
  // These are the cards the forge highlights, because they're the ones that
  // turn "I should do a lesson" into "I want to do a lesson".
  isAffordableSoon(u) {
    if (this.owned(u.id)) return false;
    if (u.needs && !this.owned(u.needs)) return false;
    if (u.arc && !Game.arcProgress(u.arc).quizDone) return false;
    return this.scrolls() < u.cost;
  },

  forge(id) {
    const u = this.byId(id);
    if (!u || !this.canForge(u)) return null;
    Game.state.scrolls -= u.cost;
    if (!Game.state.upgrades) Game.state.upgrades = {};
    Game.state.upgrades[id] = { at: Date.now() };
    Game.save();
    return u;
  },

  // ---------------------------------------------------------------- effects
  //
  // One resolved object of every active effect. sim.js, rewards.js and game.js
  // all read from here, so adding a piece of gear never means touching them.
  effects() {
    const out = { ...DEFAULTS };
    for (const u of UPGRADES) {
      if (!this.owned(u.id)) continue;
      for (const [k, v] of Object.entries(u.effect || {})) {
        if (NUMERIC_MAX.includes(k)) out[k] = Math.max(out[k] ?? 0, v);
        else if (NUMERIC_MIN.includes(k)) out[k] = Math.min(out[k] ?? Infinity, v);
        else out[k] = v;
      }
    }
    return out;
  },

  effect(key) {
    return this.effects()[key];
  },

  // Progress for the forge's header and the story map's teaser chip.
  summary() {
    const total = UPGRADES.length;
    const have = UPGRADES.filter((u) => this.owned(u.id)).length;
    // The single most motivating thing to show him: the next piece of gear that
    // is already unlocked by his learning and just needs scrolls.
    const nextBuyable = UPGRADES.find((u) => this.canForge(u)) || null;
    const nextSaving = UPGRADES.filter((u) => this.isAffordableSoon(u))
      .sort((a, b) => a.cost - b.cost)[0] || null;
    // …and the next one that a LESSON would unlock.
    const nextLearn = UPGRADES.find(
      (u) => !this.owned(u.id) && (!u.needs || this.owned(u.needs)) &&
             u.arc && !Game.arcProgress(u.arc).quizDone
    ) || null;
    return { have, total, scrolls: this.scrolls(), nextBuyable, nextSaving, nextLearn };
  },
};
