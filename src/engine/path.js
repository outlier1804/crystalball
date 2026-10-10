// ====== The Path — ONE ordered list of everything there is to do ======
//
// The game grew three parallel tracks (Training Grounds sessions, lesson films,
// story arcs) plus dojo missions, each with its own shelf on the home screen and
// its own unlock rule. Nothing told a kid which track to start on or what came
// after what. This file flattens all of it into a single line:
//
//   World 1 → step, step, step … → World 2 → …
//
// A world is one story arc. Its steps, in the order they are meant to be done:
//   practice  the Training Grounds sessions that arc leans on
//   film      the narrated lesson films on the same topic
//   story     the arc's lesson with Sensei
//   quiz      the arc quiz (must be passed — this is what opens the next world)
//   trade     the dojo missions the quiz unlocks
//   plan      the B.R.E.A.D decision tree (last world only)
//
// Nothing here stores progress of its own except `watched` (films). Every other
// "done" is read from the state the engines already keep, so the old unlock
// rules in game.js / foundations.js stay the single source of truth.
import { ARCS, MISSIONS } from "./data.js";
import { STAGES, sessionUnlocked } from "./foundations.js";
import { hasVideo } from "./video-manifest.js";
import { Voice } from "./voice.js";
import { DEMO_LIST } from "./demos.js";

// Which lesson films sit in which world. A film is the first thing in its world:
// watch the idea move, then read it, then prove it.
//
// The original ten films taught position sizing with a $10 stock and 40 shares.
// This course is futures only, so they are off the path; the v3 films
// (tools/films) replace them world by world as each one is rendered.
const FILMS_IN = {
  arcF: ["points"],
  arc2: ["candle"],
  arcP: ["patterns"],
  arc3: ["floors"],
  arcM: ["structure"],
  arc4: ["stop", "size"],
  arcS: ["sessions"],
  arc7: ["topdown", "fvg", "respect"],
  arcK: ["levels"],
  arc9: ["sweep"],
  arc10: ["bread"],
};

// id -> the film. The file is public/vid/film-<id>.mp4; a film that has not been
// rendered yet simply is not a step. Sources: films/specs/<id>.mjs.
export const FILMS = {
  points:    { title: "Points, dollars, contracts" },
  candle:    { title: "Inside one candle" },
  patterns:  { title: "Candles that talk" },
  floors:    { title: "Floors and ceilings" },
  structure: { title: "HH, HL, LH, LL" },
  stop:      { title: "Where am I wrong?" },
  size:      { title: "Size follows the stop" },
  sessions:  { title: "Asia, London, New York" },
  topdown:   { title: "Hour, 15, close" },
  fvg:       { title: "Gas stations" },
  respect:   { title: "Respected, or not?" },
  levels:    { title: "PDH, PDL, PD 50%" },
  sweep:     { title: "The sweep" },
  bread:     { title: "The five checks" },
};
export const filmFile = (id) => `film-${id}`;

export const KINDS = {
  practice: { emoji: "🧩", verb: "Practice", mins: 3 },
  film:     { emoji: "🎬", verb: "Watch",    mins: 1 },
  demo:     { emoji: "👀", verb: "Demo",     mins: 4 },
  story:    { emoji: "📖", verb: "Story",    mins: 4 },
  quiz:     { emoji: "❓", verb: "Quiz",     mins: 3 },
  trade:    { emoji: "⚔️", verb: "Trade",    mins: 5 },
  plan:     { emoji: "📋", verb: "Plan",     mins: 3 },
};

const shortName = (arc) => arc.name.replace(/^Arc \d+:\s*/, "").replace(/\s*\(.*\)$/, "");

function buildWorld(arc, index) {
  const steps = [];
  const quizDone = (s) => !!s.arcs?.[arc.id]?.quizDone;

  for (const n of FILMS_IN[arc.id] || []) {
    if (!FILMS[n] || !hasVideo(filmFile(n))) continue;
    steps.push({
      id: `film:${n}`, kind: "film", title: FILMS[n].title,
      // A player who already cleared this world before films were steps must not
      // be sent back to watch them — passing the quiz counts.
      done: (s) => !!s.watched?.[n] || quizDone(s),
      go: ["film", { n }],
    });
  }

  const addStory = () => {
  steps.push({
      id: `story:${arc.id}`, kind: "story", get title() { return shortName(arc); },
      done: (s) => !!s.arcs?.[arc.id]?.lessonDone,
      go: ["lesson", { arcId: arc.id }],
    });
  };
  // World 1 opens with the story, so the first thing a new player meets is
  // markets, NQ and Gold — not eight practice sessions on percentages. Every
  // later world keeps its practice first, because there the story leans on it.
  const storyFirst = index === 0;
  if (storyFirst) addStory();

  for (const stage of STAGES.filter((st) => st.gate === arc.id)) {
    for (const sess of stage.sessions) {
      steps.push({
        id: `practice:${sess.id}`, kind: "practice", title: sess.title,
        done: (s) => !!s.foundations?.[sess.id]?.passed,
        ready: (s) => sessionUnlocked(s, sess.id),
        go: ["foundations", { sessionId: sess.id }],
      });
    }
  }

  if (!storyFirst) addStory();

  steps.push({
    id: `quiz:${arc.id}`, kind: "quiz", title: "Prove you know it",
    done: quizDone,
    go: ["quiz", { arcId: arc.id }],
  });

  for (const m of MISSIONS.filter((x) => x.unlockArc === arc.id)) {
    // "Watch me do it, then you try" comes right before the mission that asks him
    // to do the same thing alone.
    const demo = DEMO_LIST.find((d) => d.before === m.id);
    if (demo) {
      steps.push({
        id: `demo:${demo.id}`, kind: "demo", title: demo.title, optional: true,
        done: (s) => !!s.demos?.[demo.id] || !!s.missions?.[m.id],
        go: ["demo", { id: demo.id }],
      });
    }
    steps.push({
      id: `trade:${m.id}`, kind: "trade", title: m.name, boss: !!m.boss,
      // Missions can be genuinely hard to pass. They are the next thing offered,
      // but they never wall off the next world — only the quiz does that.
      optional: true,
      done: (s) => !!s.missions?.[m.id],
      go: ["dojo", { missionId: m.id }],
    });
  }

  if (arc.id === "arc10") {
    steps.push({
      id: "plan:bread", kind: "plan", title: "Your trading plan", optional: true,
      done: (s) => !!s.planSeen,
      go: ["playbook", {}],
    });
  }

  // name/desc are getters because the arc's wording follows the active profile.
  return { id: arc.id, n: index + 1, emoji: arc.emoji, get name() { return shortName(arc); }, get desc() { return arc.desc; }, steps };
}

export const WORLDS = ARCS.map(buildWorld);

/** Everything the screens need, resolved against one save state. */
export function pathView(state) {
  let blocked = false;          // a required step earlier on the line is unfinished
  let next = null;
  const worlds = WORLDS.map((w) => {
    const worldOpen = !blocked;
    const steps = w.steps.map((st) => {
      const done = st.done(state);
      const open = !blocked && (st.ready ? st.ready(state) : true);
      // The practice sessions teach percentages and line-reading from scratch.
      // A grown-up can skip any of them; a kid cannot.
      const optional = st.optional || (Voice.adult && st.kind === "practice");
      const view = { ...st, optional, done, open: open || done, world: w };
      // "Skip for now" only ever applies to optional steps, and only moves the
      // pointer — the step stays on the Map, open and replayable.
      const skipped = optional && state.skipped?.[st.id];
      if (!done && open && !next && !skipped) next = view;
      if (!done && !optional) blocked = true;
      return view;
    });
    const doneCount = steps.filter((s) => s.done).length;
    return { ...w, steps, open: worldOpen, doneCount, complete: doneCount === steps.length };
  });
  for (const w of worlds) for (const s of w.steps) s.world = w;
  const total = worlds.reduce((n, w) => n + w.steps.length, 0);
  const done = worlds.reduce((n, w) => n + w.doneCount, 0);
  return { worlds, next, total, done, finished: !next };
}

export const stepLabel = (step) => `${KINDS[step.kind].emoji} ${KINDS[step.kind].verb}`;
