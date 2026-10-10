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
import { LESSONS, lessonParts } from "./video-manifest.js";

// Which lesson films sit in which world — placed next to the arc that teaches the
// same idea, so a film is never about something the story hasn't reached yet.
const FILMS_IN = {
  arc1: ["03", "05"],        // what a share is · wrong a lot, still winning
  arc3: ["06", "07"],        // floors and ceilings · trend
  arc4: ["01", "02", "04"],  // stop loss · the 1% rule · how many shares
  arc5: ["09"],              // the journal
  arc7: ["08"],              // the setup
  arc8: ["10"],              // why most people lose
};

export const KINDS = {
  practice: { emoji: "🧩", verb: "Practice", mins: 3 },
  film:     { emoji: "🎬", verb: "Watch",    mins: 2 },
  story:    { emoji: "📖", verb: "Story",    mins: 4 },
  quiz:     { emoji: "❓", verb: "Quiz",     mins: 3 },
  trade:    { emoji: "⚔️", verb: "Trade",    mins: 5 },
  plan:     { emoji: "📋", verb: "Plan",     mins: 3 },
};

const shortName = (arc) => arc.name.replace(/^Arc \d+:\s*/, "").replace(/\s*\(.*\)$/, "");

function buildWorld(arc, index) {
  const steps = [];
  const quizDone = (s) => !!s.arcs?.[arc.id]?.quizDone;

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

  for (const n of FILMS_IN[arc.id] || []) {
    const lesson = LESSONS.find((l) => l.n === n);
    if (!lesson || !lessonParts(n).length) continue;
    steps.push({
      id: `film:${n}`, kind: "film", title: lesson.label,
      // A player who already cleared this world before films were steps must not
      // be sent back to watch them — passing the quiz counts.
      done: (s) => !!s.watched?.[n] || quizDone(s),
      go: ["film", { n }],
    });
  }

  steps.push({
    id: `story:${arc.id}`, kind: "story", title: shortName(arc),
    done: (s) => !!s.arcs?.[arc.id]?.lessonDone,
    go: ["lesson", { arcId: arc.id }],
  });
  steps.push({
    id: `quiz:${arc.id}`, kind: "quiz", title: "Prove you know it",
    done: quizDone,
    go: ["quiz", { arcId: arc.id }],
  });

  for (const m of MISSIONS.filter((x) => x.unlockArc === arc.id)) {
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

  return { id: arc.id, n: index + 1, emoji: arc.emoji, name: shortName(arc), desc: arc.desc, steps };
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
      const view = { ...st, done, open: open || done, world: w };
      // "Skip for now" only ever applies to optional steps, and only moves the
      // pointer — the step stays on the Map, open and replayable.
      const skipped = st.optional && state.skipped?.[st.id];
      if (!done && open && !next && !skipped) next = view;
      if (!done && !st.optional) blocked = true;
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
