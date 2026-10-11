#!/usr/bin/env node
// Dump every spoken line in the game as JSON on stdout, for gen.py to synthesize.
//
// The cast table and the text-cleaning rule live in src/engine/speech.js — this
// imports them rather than re-implementing, so the manifest keys the generator
// writes are byte-identical to the ones the game looks up at runtime.
//
//   node tools/vogen/lines.mjs > lines.json
//
// What is covered, and whose voice reads it:
//   story lessons, kid course     the character speaking (Sensei, Kitsu, Kazuo)
//   story lessons, adult course   the narrator
//   quiz questions + explanations the narrator   (Quiz.jsx calls Speak.say with no `who`)
//   practice sessions             the narrator   (Foundations.jsx, same)
//   film check questions          the narrator

import { ARCS } from "../../src/engine/data.js";
import { ALL_SESSIONS } from "../../src/engine/foundations.js";
import { CHECKS } from "../../src/engine/lesson-checks.js";
import { Voice } from "../../src/engine/voice.js";
import { DEMO_LIST, demoFor } from "../../src/engine/demos.js";
import { castFor, voClean, voKey } from "../../src/engine/speech.js";
import { EPISODES, TRAIN_AGAIN } from "../../src/engine/episodes.js";
import { BATTLES } from "../../src/engine/battles.js";

const out = [];
const seen = new Set();


function add(who, html, src) {
  const text = voClean(html || "");
  if (!text) return;
  const key = voKey(who, text);
  if (seen.has(key)) return;            // identical line, same speaker — render once
  seen.add(key);
  const cast = castFor(who);
  out.push({ key, who, text, voice: cast.voice, speed: cast.speed, src });
}

for (const mode of ["kid", "adult"]) {
  Voice.mode = mode;
  for (const arc of ARCS) {
    arc.lessons.forEach((line, i) => add(mode === "kid" ? line.c?.name || "" : "", line.t, `${arc.id}:${i}:${mode}`));
  }
}
// quizzes and practice are worded per profile too, so both wordings get a recording
for (const mode of ["kid", "adult"]) {
  Voice.mode = mode;
  for (const arc of ARCS) {
    arc.quiz.forEach((q, i) => {
      add("", q.q, `${arc.id}:q${i}`); add("", q.e, `${arc.id}:e${i}`);
      Object.entries(q.why || {}).forEach(([k, w]) => add("", w, `${arc.id}:w${i}.${k}`));   // why that wrong answer is wrong
    });
  }
  for (const sess of ALL_SESSIONS) {
    (sess.activities || []).forEach((act, i) => {
      add("", act.t, `${sess.id}:${i}:t`); add("", act.q, `${sess.id}:${i}:q`); add("", act.e, `${sess.id}:${i}:e`);
      Object.entries(act.why || {}).forEach(([k, w]) => add("", w, `${sess.id}:${i}:w${k}`));
    });
  }
}
Voice.mode = "kid";

for (const [id, c] of Object.entries(CHECKS)) {
  if (!id.startsWith("film-")) continue;
  add("", c.q, `${id}:q`); add("", c.e, `${id}:e`);
}

// the bar-by-bar demos: narration, questions and every answer's reason, both voices
for (const { id } of DEMO_LIST) {
  const d = demoFor(id);
  d.steps.forEach((s, i) => { add("", s.say[0], `demo-${id}:${i}:kid`); add("", s.say[1], `demo-${id}:${i}:adult`); });
  d.questions.forEach((q, i) => {
    add("", q.q[0], `demo-${id}:q${i}:kid`); add("", q.q[1], `demo-${id}:q${i}:adult`);
    q.why.forEach((w, k) => { add("", w[0], `demo-${id}:q${i}w${k}:kid`); add("", w[1], `demo-${id}:q${i}w${k}:adult`); });
  });
}

// the story: every world's cold open and cliffhanger (narrator), and the owl's "train again"
for (const [id, e] of Object.entries(EPISODES)) { add("", e.open, `ep-${id}:open`); add("", e.cliff, `ep-${id}:cliff`); }
TRAIN_AGAIN.forEach((t, i) => add("Sensei Hoshi", t, `again:${i}`));

// the battles: every beat, question and explanation
for (const [id, b] of Object.entries(BATTLES)) {
  add("", b.intro, `battle-${id}:intro`);
  b.rounds.forEach((r, i) => {
    r.beats.forEach((bt, k) => add("", bt.say, `battle-${id}:${i}.${k}`));
    add("", r.ask.q, `battle-${id}:${i}:q`); add("", r.ask.e, `battle-${id}:${i}:e`);
  });
}

// the two words spoken in front of every explanation (Speak.sayParts)
add("", "Correct!", "fb:right"); add("", "Not quite.", "fb:wrong");

process.stdout.write(JSON.stringify(out, null, 2));
