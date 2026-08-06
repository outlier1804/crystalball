import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { Sound } from "../engine/audio.js";
import { nextSession } from "../engine/foundations.js";
import { dueForReview } from "../engine/analytics.js";
import { LESSONS, lessonParts } from "../engine/video-manifest.js";
import LessonPlayer from "./LessonPlayer.jsx";

/* One button that picks the single next thing, for days when the whole map is
 * too much.
 *
 * The Quest Map is a good screen and a bad first screen on a low-attention day:
 * ten arcs, a Training Grounds track, two film shelves and three quests is a lot
 * of deciding before any learning happens, and deciding is the part he has least
 * of. This collapses it to one tap.
 *
 * Priority order is deliberate:
 *   1. a memory check that's actually due — spaced review decays while it waits,
 *      and it is the shortest thing here
 *   2. the next Training Grounds session — the linear spine of the course
 *   3. the first trading lesson — a ~25s narrated part, the lowest-effort option
 *
 * Every branch is a real action. Nothing renders a disabled button: a dead button
 * he taps and nothing happens is worse than no button at all (VideoButton's rule).
 *
 * It deliberately does NOT record "did the one thing today". That would make it a
 * chore with a tick box; it is meant to be a door, not a target.
 */
export default function OneThing() {
  const { game, go } = useApp();
  const due = dueForReview(game.state);
  const sess = nextSession(game.state);
  const lesson = LESSONS.find((l) => lessonParts(l.n).length > 0);

  const head = <div className="one-thing-head">Not feeling it today?</div>;

  // Lesson branch renders the real player, dressed as the one-thing button —
  // LessonPlayer owns the parts and the between-parts prompt, so it is not
  // reimplemented here.
  if (!due.length && !sess && lesson) {
    return (
      <motion.div className="one-thing" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
        {head}
        <LessonPlayer n={lesson.n} label={`Just watch this — ${lesson.label}`}
                      className="one-thing-lesson" />
        <div className="one-thing-why">About half a minute — then you're done for the day.</div>
      </motion.div>
    );
  }

  let pick = null;
  if (due.length > 0) {
    pick = { emoji: "🔁", what: "A quick memory check",
             why: `${due.length} thing${due.length > 1 ? "s" : ""} to keep sharp`,
             run: () => go("quiz", { spaced: true, back: "map" }) };
  } else if (sess) {
    pick = { emoji: "🧱", what: sess.title, why: "Next in the Training Grounds",
             run: () => go("foundations", { sessionId: sess.id }) };
  }
  if (!pick) return null;      // nothing due and nothing left — no nudge needed

  return (
    <motion.div className="one-thing" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
      {head}
      <button className="one-thing-btn"
              onClick={() => { Sound.play("open"); pick.run(); }}>
        <span className="one-thing-emoji">{pick.emoji}</span>
        <span className="one-thing-text">
          <strong>Just do this one thing</strong>
          <span className="one-thing-what">{pick.what}</span>
        </span>
      </button>
      <div className="one-thing-why">{pick.why} — then you're done for the day.</div>
    </motion.div>
  );
}
