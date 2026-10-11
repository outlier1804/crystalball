import { useEffect } from "react";
import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import { pathView, KINDS } from "../engine/path.js";
import { dueForReview, buildReviewSet, minutesToday, DAILY_GOAL_MIN, DAILY_STRETCH_MIN } from "../engine/analytics.js";
import { MISSIONS } from "../engine/data.js";
import { CHARACTER_ART } from "../engine/characters.js";
import { Sound } from "../engine/audio.js";
import { Voice } from "../engine/voice.js";
import { freshCards, cardPower } from "../engine/cards.js";
import { Passes, Parent } from "../engine/passes.js";

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
  film:     "Sit back and watch. Three questions after. Miss one and we simply train it again.",
  battle:   "Buyers against sellers, live. You throw the punches, then call who won!",
  drill:    "Hands on the chart. No picking sentences here: you point at the answer.",
  demo:     "Watch me trade a real morning, one candle at a time. Then you make the calls.",
  story:    "Story time. Read along with me, one panel at a time.",
  quiz:     "Show me what stuck. Pass this and the next world opens!",
  trade:    "Time to trade for real — with pretend Koins. Shield first, glory second.",
  plan:     "Your checklist. The same steps, every single trade.",
};

const COACH_ADULT = {
  practice: "A short hands-on exercise on one idea.",
  film:     "A short narrated film, with one question after each part.",
  drill:    "A hands-on exercise: answer by tapping the chart.",
  demo:     "A real morning replayed bar by bar, then the same decisions for you to make.",
  story:    "The lesson itself — one idea per screen.",
  quiz:     "A short quiz. Passing it opens the next world.",
  trade:    "Apply it in the simulator, with practice money. Set the stop first.",
  plan:     "The checklist to run before every trade.",
};

// Today's clock, as three short rounds instead of one long block. Ten minutes is
// a finish line he can see from the start; three of them make the daily goal.
// It never locks anything: past 45 it just says that's plenty.
const ROUND_MIN = DAILY_GOAL_MIN / 3;
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

function DayMeter({ min }) {
  const done = Math.min(3, Math.floor(min / ROUND_MIN));
  const into = Math.min(ROUND_MIN, min - done * ROUND_MIN);
  const word = Voice.pick("Round", "Session");
  const msg = min >= DAILY_STRETCH_MIN ? Voice.pick("That's plenty for today — see you tomorrow! 🌙", "That is plenty for today.")
    : done >= 3 ? Voice.pick(`All three rounds done! ✅ Bonus time up to ${DAILY_STRETCH_MIN} min`, `Daily goal done. Optional extra time up to ${DAILY_STRETCH_MIN} min.`)
    : Voice.pick(`${Math.ceil(ROUND_MIN - into)} min to finish round ${done + 1}. Then take a break if you like!`, `${Math.ceil(ROUND_MIN - into)} min left in session ${done + 1}.`);
  return (
    <div className={"day-meter" + (done >= 3 ? " hit" : "")}>
      <span className="day-meter-label">{done >= 3 ? `Today · ${min} min` : `Today · ${word} ${done + 1} of 3`}</span>
      <span className="day-rounds">
        {[0, 1, 2].map((i) => (
          <span key={i} className={"day-round" + (i < done ? " done" : i === done ? " now" : "")}>
            <span className="day-round-fill" style={{ width: (i < done ? 100 : i === done ? (into / ROUND_MIN) * 100 : 0) + "%" }} />
            <span className="day-round-n">{i < done ? "✓" : i + 1}</span>
          </span>
        ))}
      </span>
      <span className="day-meter-msg">{msg}</span>
    </div>
  );
}

export function launch(step, go) {
  if (step.kind === "plan") { Game.state.planSeen = true; Game.save(); }
  go(step.go[0], step.go[1]);
}

export default function Home() {
  const { game, go, bump, popup, chest } = useApp();
  const view = pathView(game.state);
  const step = view.next;
  const due = dueForReview(game.state);

  // Two things are handed out when he lands back here, because this is where
  // every step ends: a chest for each ten-minute round finished today, and the
  // reveal of any technique card earned since he last looked.
  useEffect(() => {
    const st = game.state;
    const key = todayKey();
    const rounds = Math.min(3, Math.floor(minutesToday(st) / ROUND_MIN));
    const paid = st.roundsPaid?.[key] || 0;
    if (rounds > paid) {
      st.roundsPaid = { [key]: rounds };          // only today is worth keeping
      if (!Voice.adult) chest(rounds >= 3 ? "gold" : "wood", `Round ${rounds} of 3 done!`,
        rounds >= 3 ? "That is today's training finished. See you tomorrow, or play on for fun." : "Nice work. Good place for a break — or keep going.");
    }
    const fresh = freshCards(st);
    if (fresh.length) {
      st.cardsSeen = { ...(st.cardsSeen || {}), ...Object.fromEntries(fresh.map((c) => [c.id, true])) };
      const label = Voice.pick("New technique card!", "New reference card");
      if (fresh.length <= 2) fresh.forEach((c) => popup(c.emoji, label, `<strong>${c.name}</strong><br>${cardPower(c)}`, !Voice.adult));
      else popup("🃏", Voice.pick(`${fresh.length} new technique cards!`, `${fresh.length} new reference cards`), `${fresh.slice(0, 4).map((c) => `<strong>${c.name}</strong>`).join(", ")}${fresh.length > 4 ? " and more" : ""}. See them all in <strong>Cards</strong>.`, !Voice.adult);
    }
    // game time: every newly finished step is worth points, and points become passes
    let made = [];
    if (!Voice.adult) {
      Passes.creditSteps(view.done);
      made = Passes.mint();
      made.forEach((p) => popup("🎮", "Game Pass earned!", `<strong>${p.mins} minutes</strong> of game time. Bring it to a parent to use it.`, true, "win"));
    }
    if (rounds > paid || fresh.length || made.length) { Game.save(); bump(); }
  }, []);

  // A few things he learned are due to be checked again. In the kid course that
  // comes first: it takes two minutes and it is what keeps old lessons alive.
  const warmUp = !Voice.adult && due.length >= 3;
  const passCfg = Parent.get();
  const passBox = Voice.adult ? null : Passes.state();
  const passMeter = passBox && (
    <button className="pass-chip" onClick={() => { Sound.play("click"); go("passes"); }}>
      <span className="pass-chip-icon">🎮</span>
      <span className="pass-chip-text">
        <strong>{Passes.ready().length ? `${Passes.ready().length} Game Pass${Passes.ready().length > 1 ? "es" : ""} ready!` : "Game Pass"}</strong>
        <span>{passBox.points} / {passCfg.pointsPerPass} points to the next {passCfg.passMin} min</span>
      </span>
      <span className="pass-chip-bar"><span style={{ width: Math.min(100, (passBox.points / passCfg.pointsPerPass) * 100) + "%" }} /></span>
    </button>
  );

  if (!step && view.tomorrow) {
    const tw = view.tomorrow;
    const weak = buildReviewSet(game.state).length > 0;
    const arena = MISSIONS.some((m) => game.state.arcs?.[m.unlockArc]?.quizDone);
    return (
      <section className="home">
        <DayMeter min={minutesToday(game.state)} />
        {passMeter}
        <div className="home-card home-finished">
          <div className="home-kicker">World {tw.n - 1} cleared today</div>
          <h1 className="home-title">World {tw.n} opens tomorrow 🌙</h1>
          <p className="home-coach">{tw.emoji} {tw.name} is next. A master lets today's lessons settle first.{(due.length > 0 || weak || arena) ? " Want more game time today? Keep training:" : " That is today's training done. Great work!"}</p>
          <div className="home-actions">
            {due.length > 0 && <button className="play-btn" onClick={() => { Sound.play("open"); go("quiz", { spaced: true, back: "map" }); }}>🔁 Memory check</button>}
            {arena && <button className={due.length > 0 ? "quiet-btn" : "play-btn"} onClick={() => { Sound.play("open"); go("dojo"); }}>⚔️ Train in the Arena</button>}
            {weak && <button className="quiet-btn" onClick={() => { Sound.play("open"); go("quiz", { review: true, back: "map" }); }}>🎯 Weak spots</button>}
            <button className="quiet-btn" onClick={() => { Sound.play("click"); go("path"); }}>🗺️ Replay a step</button>
            <button className="quiet-btn" onClick={() => { Sound.play("click"); go("cards"); }}>🃏 My cards</button>
          </div>
        </div>
      </section>
    );
  }

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
      {passMeter}
      <div className="home-where">
        <span className="home-world-n">World {w.n} of {view.worlds.length}</span>
        <span className="home-world-name">{w.emoji} {w.name}</span>
      </div>

      <div className="home-main">
        <motion.div className="home-card" key={step.id}
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0.9, 0.3, 1] }}>
          <div className="home-kicker">{warmUp ? "First, a warm-up" : `Up next · step ${at + 1} of ${w.steps.length}`}</div>
          <div className="home-kind">
            <span className="home-kind-emoji">{warmUp ? "🔁" : kind.emoji}</span>
            <span>{warmUp ? "Memory check · about 2 min" : `${kind.verb} · about ${kind.mins} min`}</span>
          </div>
          <h1 className="home-title">{warmUp ? `Do you still remember these ${Math.min(due.length, 10)}?` : step.title}</h1>
          <div className="home-actions">
            <motion.button className="play-btn" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              animate={{ boxShadow: ["0 0 0 0 rgba(255,93,106,.55)", "0 0 0 18px rgba(255,93,106,0)"] }}
              transition={{ boxShadow: { repeat: Infinity, duration: 1.8 } }}
              onClick={() => { Sound.play("open"); if (warmUp) go("quiz", { spaced: true, back: "map" }); else launch(step, go); }}>
              ▶ Play
            </motion.button>
            {!warmUp && step.optional && (
              <button className="quiet-btn" onClick={skip}>Skip for now</button>
            )}
          </div>
        </motion.div>

        <div className="home-guide">
          <div className="home-bubble">{warmUp ? `Before ${step.title}: a quick check of things you learned days ago. This is how they stay in your head for good.` : Voice.pick(COACH[step.kind], COACH_ADULT[step.kind])}</div>
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
