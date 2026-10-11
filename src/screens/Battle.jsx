import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import { BATTLES } from "../engine/battles.js";
import { TRAIN_AGAIN } from "../engine/episodes.js";
import { CHARACTER_ART } from "../engine/characters.js";
import { Speak } from "../engine/speech.js";
import { Sound } from "../engine/audio.js";
import { Rewards } from "../engine/rewards.js";
import { Passes } from "../engine/passes.js";
import { FX } from "../engine/fx.js";
import Clash from "../scenes/Clash.jsx";

/* One battle: a few short fights, each ending in one question.
 *
 * He drives it — one tap per beat — so the pace is his and nothing can run past
 * him. A missed question is not a fail: the owl says "train again" and the same
 * fight plays once more, which is the rule the films use too.
 */
export default function Battle() {
  const { params, go, bump, popup } = useApp();
  const battle = BATTLES[params.id];
  const [r, setR] = useState(0);            // round
  const [b, setB] = useState(-1);           // beat; -1 = the title card
  const [phase, setPhase] = useState("fight");   // fight → ask → again | next
  const [picked, setPicked] = useState(null);
  const [tries, setTries] = useState(0);

  useEffect(() => { if (!battle) go("map"); }, []);   // opened with an id that has no battle
  useEffect(() => () => Speak.stop(), []);

  const round = battle?.rounds[r];
  const beat = round && b >= 0 ? round.beats[b] : null;
  const order = useMemo(() => (round ? round.ask.o.map((_, i) => i).sort(() => Math.random() - 0.5) : []), [r, tries]);
  const again = TRAIN_AGAIN[(r + tries) % TRAIN_AGAIN.length];

  // narrate whatever is on screen
  useEffect(() => {
    if (!battle || !Speak.on) return;
    if (b < 0) Speak.say(battle.intro);
    else if (phase === "fight" && beat) Speak.say(beat.say);
    else if (phase === "ask" && picked === null) Speak.say(round.ask.q);
  }, [r, b, phase, tries]);

  if (!battle) return null;   // also what this screen sees for a moment while it fades out

  function next() {
    Sound.play("click");
    if (b < round.beats.length - 1) {
      const nb = round.beats[b + 1];
      if (nb.fx) setTimeout(() => Sound.play(nb.fx === "PUSHED BACK!" || nb.fx === "SLAM!" || nb.fx === "GRAB!" || nb.fx === "DROP!" ? "shield" : "win"), 120);
      setB(b + 1);
    } else { setPicked(null); setPhase("ask"); }
  }

  function pick(k) {
    if (picked !== null) return;
    const right = order[k] === round.ask.a;
    setPicked(k);
    Sound.play(right ? "correct" : "wrong");
    if (right) Passes.answer(`battle:${params.id}:${r}`);
    if (Speak.on) Speak.sayParts([right ? "Correct!" : "Not quite.", round.ask.e]);
  }

  function afterAnswer(e) {
    const right = order[picked] === round.ask.a;
    Sound.play("click");
    if (!right) { setPhase("again"); if (Speak.on) Speak.say(again, { who: "Sensei Hoshi" }); return; }
    if (r < battle.rounds.length - 1) { setR(r + 1); setB(0); setPhase("fight"); setPicked(null); setTries(0); return; }
    // battle won
    const first = !Game.state.battles?.[params.id];
    Game.state.battles = { ...(Game.state.battles || {}), [params.id]: true };
    Game.save();
    Rewards.touchDay();
    const rankUp = first ? Game.addXp(15) : null;
    if (e?.currentTarget) FX.confettiAt(e.currentTarget, 30);
    Sound.play("fanfare");
    popup("🥊", "Battle won!", first ? "+15 XP. A new <strong>technique card</strong> is waiting for you." : "You still have it. Nice.", true);
    if (rankUp) popup(rankUp.emoji, "RANK UP!", `You are now a <strong>${rankUp.name}</strong>!`, true, "levelup");
    bump();
    go("map");
  }

  function trainAgain() { Sound.play("click"); setTries(tries + 1); setPicked(null); setB(0); setPhase("fight"); }

  const answered = picked !== null;
  const right = answered && order[picked] === round.ask.a;
  // during the question the stage holds the last frame of the fight
  const shown = beat || round.beats[0];
  const frame = phase === "fight" && b >= 0 ? shown : round.beats[round.beats.length - 1];

  return (
    <section className="battle">
      <div className="battle-head">
        <span className="battle-title">🥊 {battle.title}</span>
        <span className="battle-rounds">
          {battle.rounds.map((x, i) => <span key={i} className={"film-pip" + (i < r ? " done" : i === r ? " now" : "")} />)}
        </span>
        <span className="battle-round-name">Fight {r + 1} of {battle.rounds.length} · {round.name}</span>
      </div>

      <Clash beat={b < 0 ? { ...round.beats[0], fx: null, tag: null, bull: "idle", bear: "idle" } : frame}
        round={round} villain={battle.villain || "bear"} k={`${r}-${b}-${tries}-${phase}`} />

      {b < 0 && (
        <div className="battle-panel">
          <p className="battle-say">{battle.intro}</p>
          <button className="play-btn" onClick={() => { Sound.play("open"); setB(0); }}>▶ Fight!</button>
        </div>
      )}

      {b >= 0 && phase === "fight" && (
        <div className="battle-panel">
          <motion.p className="battle-say" key={`${r}-${b}-${tries}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>{beat.say}</motion.p>
          <button className="play-btn battle-next" onClick={next}>{b < round.beats.length - 1 ? "Next ▶" : "Call it! ▶"}</button>
        </div>
      )}

      {phase === "ask" && (
        <div className="battle-panel">
          <div className="quiz-question battle-q">{round.ask.q}</div>
          <div className="battle-opts">
            {order.map((orig, k) => (
              <button key={k} disabled={answered}
                className={"quiz-opt" + (answered && orig === round.ask.a ? " correct" : "") + (answered && picked === k && orig !== round.ask.a ? " wrong" : "")}
                onClick={() => pick(k)}>{round.ask.o[orig]}</button>
            ))}
          </div>
          {answered && <div className={"quiz-feedback " + (right ? "good" : "bad")}>{right ? "⭐ Yes! " : "💫 Not quite. "}{round.ask.e}</div>}
          {answered && (
            <button className="play-btn battle-next" onClick={afterAnswer}>
              {!right ? "Keep going ▶" : r < battle.rounds.length - 1 ? "Next fight ▶" : "Win the battle ⭐"}
            </button>
          )}
        </div>
      )}

      {phase === "again" && (
        <div className="battle-panel train-again">
          <span className="train-owl" dangerouslySetInnerHTML={{ __html: CHARACTER_ART["Sensei Hoshi"] }} />
          <div>
            <div className="film-card-kicker">Train again</div>
            <p className="battle-say">{again}</p>
            <button className="play-btn battle-next" onClick={trainAgain}>▶ Train again</button>
          </div>
        </div>
      )}
    </section>
  );
}
