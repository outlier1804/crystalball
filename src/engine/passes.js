// ====== Game Passes: training earns real game time ======
//
// Dad's deal: learn, and you earn video-game time. Work earns POINTS; enough
// points mint a GAME PASS worth a fixed number of minutes; he brings the pass to
// a parent, who redeems it with a PIN. The exchange rate is roughly Dad's own
// estimate — about 2.5 hours of work for an hour of play:
//
//   a new step on the path (film, battle, story, practice, quiz, mission)   10
//   a memory check or weak-spots round finished at 80% or better             5
//   an Arena practice day finished with a stop on every trade                5
//   every 10 different questions answered right in a day                     5
//   30 points  ->  one pass  ->  15 minutes
//
// Three new steps is about half an hour, and that is one pass. Points come only
// from real work: a step counts once ever, a question once per day, and passes
// are capped per day (extra points carry over to tomorrow).
//
// The PIN and the settings are the parent's and live outside any one profile.
// The PIN is a kid barrier, not security: everything here is on his device.
import { Game } from "./game.js";

export const POINTS = { step: 10, review: 5, arena: 5, answers: 5 };
export const ANSWERS_PER_BONUS = 10;

const KEY = "cq-parent";
const DEFAULTS = { pin: null, passMin: 15, pointsPerPass: 30, maxPassesPerDay: 4, worldsPerDay: 2 };

const hash = (pin) => { let h = 5381; for (const ch of "cq:" + pin) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0; return h.toString(36); };

export const Parent = {
  get() {
    try { return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) || "{}")) }; }
    catch { return { ...DEFAULTS }; }
  },
  set(patch) { localStorage.setItem(KEY, JSON.stringify({ ...this.get(), ...patch })); },
  hasPin() { return !!this.get().pin; },
  setPin(pin) { this.set({ pin: hash(String(pin)) }); },
  check(pin) { return this.get().pin === hash(String(pin)); },
};

export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const code = () => { const a = "ABCDEFGHJKLMNPQRSTUVWXYZ"; return Array.from({ length: 4 }, () => a[Math.floor(Math.random() * a.length)]).join(""); };

function box(state) {
  if (!state.pass) state.pass = { points: 0, list: [], log: [], stepsCredited: null, answers: { day: "", keys: {} } };
  return state.pass;
}

export const Passes = {
  state() { return box(Game.state); },
  ready() { return this.state().list.filter((p) => !p.redeemedAt); },
  redeemed() { return this.state().list.filter((p) => p.redeemedAt); },
  mintedToday() { const k = dayKey(); return this.state().list.filter((p) => dayKey(new Date(p.at)) === k).length; },
  minutesRedeemedToday() { const k = dayKey(); return this.redeemed().filter((p) => dayKey(new Date(p.redeemedAt)) === k).reduce((n, p) => n + p.mins, 0); },

  /** Add points for real work. Returns nothing; call mint() to turn them into passes. */
  add(n, why) {
    const b = this.state();
    b.points += n;
    b.log = [{ n, why, at: Date.now() }, ...b.log].slice(0, 30);
    Game.save();
  },

  /** A correct answer. Each question counts once a day; every tenth one pays. */
  answer(key) {
    const b = this.state(), k = dayKey();
    if (b.answers.day !== k) b.answers = { day: k, keys: {} };
    if (b.answers.keys[key]) return;
    b.answers.keys[key] = 1;
    if (Object.keys(b.answers.keys).length % ANSWERS_PER_BONUS === 0) this.add(POINTS.answers, `${ANSWERS_PER_BONUS} questions right`);
    else Game.save();
  },

  /** A disciplined Arena day. Capped, so the Arena is practice and not a points farm. */
  arena() {
    const b = this.state(), k = dayKey();
    if (b.arena?.day !== k) b.arena = { day: k, n: 0 };
    if (b.arena.n >= 3) return false;
    b.arena.n += 1;
    this.add(POINTS.arena, "Arena day with a stop on every trade");
    return true;
  },

  /** Steps finished since last time. The first call on an old save only sets the baseline. */
  creditSteps(doneCount) {
    const b = this.state();
    if (b.stepsCredited == null) { b.stepsCredited = doneCount; Game.save(); return 0; }
    const fresh = doneCount - b.stepsCredited;
    if (fresh <= 0) return 0;
    b.stepsCredited = doneCount;
    this.add(fresh * POINTS.step, fresh === 1 ? "A new step finished" : `${fresh} new steps finished`);
    return fresh;
  },

  /** Turn points into passes, up to today's cap. Returns the passes just minted. */
  mint() {
    const b = this.state(), cfg = Parent.get(), made = [];
    while (b.points >= cfg.pointsPerPass && this.mintedToday() < cfg.maxPassesPerDay) {
      b.points -= cfg.pointsPerPass;
      const p = { id: code(), at: Date.now(), mins: cfg.passMin, redeemedAt: null };
      b.list = [p, ...b.list];
      made.push(p);
    }
    if (made.length) Game.save();
    return made;
  },

  redeem(id) {
    const p = this.state().list.find((x) => x.id === id && !x.redeemedAt);
    if (!p) return false;
    p.redeemedAt = Date.now();
    Game.save();
    return true;
  },
};
