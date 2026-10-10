import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import { pathView, KINDS } from "../engine/path.js";
import { dueForReview, minutesToday, DAILY_GOAL_MIN, DAILY_STRETCH_MIN } from "../engine/analytics.js";
import { CHARACTER_ART } from "../engine/characters.js";
import { Sound } from "../engine/audio.js";
import { Voice } from "../engine/voice.js";

/* The home screen answers exactly one question: "what do I do now?"
 *
 * It used to be the whole course on one scrolling page — two film shelves, daily
 * quests, twelve practice sessions and ten arcs, about eighty buttons. Now there
 * is one card and one button. The full journey is one tap away on the Map, for
 * when he wants to look around rather than be told.
 */

// What Sensei says about each kind of step, so the card never needs a paragraph.
const COACH = {
  practice: "A quick hands-on warm-up. Tap, drag, try things — you can't break it.",
  film:     "Sit back and watch. I'll ask you one question after each short part.",
  demo:     "Watch me trade a real morning, one candle at a time. Then you make the calls.",
  story:    "Story time. Read along with me, one panel at a time.",
  quiz:     "Show me what stuck. Pass this and the next world opens!",
  trade:    "Time to trade for real — with pretend Koins. Shield first, glory second.",
  plan:     "Your checklist. The same steps, every single trade.",
};

const COACH_ADULT = {
  practice: "A short hands-on exercise on one idea.",
  film:     "A short narrated film, with one question after each part.",
  demo:     "A real morning replayed bar by bar, then the same decisions for you to make.",
  story:    "The lesson itself — one idea per screen.",
  quiz:     "A short quiz. Passing it opens the next world.",
  trade:    "Apply it in the simulator, with practice money. Set the stop first.",
  plan:     "The checklist to run before every trade.",
};

// Today's clock. The goal is 30 minutes, with room to 45 — enough to finish
// several steps a day, short enough to still be fun tomorrow. It never locks
// anything: past 45 it just says that's plenty.
function DayMeter({ min }) {
  const pct = Math.min(100, (min / DAILY_STRETCH_MIN) * 100);
  const msg = min >= DAILY_STRETCH_MIN ? "That's plenty for today — see you tomorrow! 🌙"
    : min >= DAILY_GOAL_MIN ? `Goal done! ✅ Bonus time up to ${DAILY_STRETCH_MIN} min`
    : `${DAILY_GOAL_MIN - min} min to today's goal`;
  return (
    <div className={"day-meter" + (min >= DAILY_GOAL_MIN ? " hit" : "")}>
      <span className="day-meter-label">Today · {min} / {DAILY_GOAL_MIN} min</span>
      <span className="day-meter-bar"><span className="day-meter-fill" style={{ width: pct + "%" }} /><span className="day-meter-goal" style={{ left: (DAILY_GOAL_MIN / DAILY_STRETCH_MIN) * 100 + "%" }} /></span>
      <span className="day-meter-msg">{msg}</span>
    </div>
  );
}

export function launch(step, go) {
  if (step.kind === "plan") { Game.state.planSeen = true; Game.save(); }
  go(step.go[0], step.go[1]);
}

export default function Home() {
  const { game, go, bump } = useApp();
  const view = pathView(game.state);
  const step = view.next;
  const due = dueForReview(game.state);

  if (!step) {
    return (
      <section className="home">
        <div className="home-card home-finished">
          <div className="home-kicker">Every world cleared</div>
          <h1 className="home-title">You finished the whole path! 🐉</h1>
          <p className="home-coach">Keep your skills sharp in the Arena, or replay any step from the Map.</p>
          <div className="home-actions">
            <button className="play-btn" onClick={() => go("dojo")}>⚔️ Go to the Arena</button>
            <button className="quiet-btn" onClick={() => go("path")}>See the Map</button>
          </div>
        </div>
      </section>
    );
  }

  const w = step.world;
  const kind = KINDS[step.kind];
  const at = w.steps.findIndex((s) => s.id === step.id);

  function skip() {
    Game.state.skipped = { ...(Game.state.skipped || {}), [step.id]: true };
    Game.save();
    bump();
  }

  return (
    <section className="home">
      <DayMeter min={minutesToday(game.state)} />
      <div className="home-where">
        <span className="home-world-n">World {w.n} of {view.worlds.length}</span>
        <span className="home-world-name">{w.emoji} {w.name}</span>
      </div>

      <div className="home-main">
        <motion.div className="home-card" key={step.id}
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0.9, 0.3, 1] }}>
          <div className="home-kicker">Up next · step {at + 1} of {w.steps.length}</div>
          <div className="home-kind">
            <span className="home-kind-emoji">{kind.emoji}</span>
            <span>{kind.verb} · about {kind.mins} min</span>
          </div>
          <h1 className="home-title">{step.title}</h1>
          <div className="home-actions">
            <motion.button className="play-btn" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              animate={{ boxShadow: ["0 0 0 0 rgba(255,93,106,.55)", "0 0 0 18px rgba(255,93,106,0)"] }}
              transition={{ boxShadow: { repeat: Infinity, duration: 1.8 } }}
              onClick={() => { Sound.play("open"); launch(step, go); }}>
              ▶ Play
            </motion.button>
            {step.optional && (
              <button className="quiet-btn" onClick={skip}>Skip for now</button>
            )}
          </div>
        </motion.div>

        <div className="home-guide">
          <div className="home-bubble">{Voice.pick(COACH[step.kind], COACH_ADULT[step.kind])}</div>
          <motion.div className="home-owl" dangerouslySetInnerHTML={{ __html: CHARACTER_ART["Sensei Hoshi"] }}
            animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }} />
        </div>
      </div>

      {/* This world's steps, as dots. Where he is, what's behind, what's ahead. */}
      <div className="home-track">
        {w.steps.map((s, i) => (
          <div key={s.id} className={"track-step" + (s.done ? " done" : "") + (s.id === step.id ? " now" : "")}>
            <div className="track-dot">{s.done ? "✓" : KINDS[s.kind].emoji}</div>
            <div className="track-name">{s.title}</div>
            {i < w.steps.length - 1 && <div className="track-line" />}
          </div>
        ))}
      </div>

      <div className="home-foot">
        {due.length > 0 && (
          <button className="quiet-btn" onClick={() => { Sound.play("open"); go("quiz", { spaced: true, back: "map" }); }}>
            🔁 Quick memory check ({due.length})
          </button>
        )}
        <button className="quiet-btn" onClick={() => { Sound.play("click"); go("path"); }}>🗺️ See the whole map</button>
      </div>
    </section>
  );
}
