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
 * He does not watch it — he fights it. Every attack is powered by his taps: the
 * candle moves under his finger, so "buyers push price up" is something he did,
 * not something he was told. Most questions are answered on the stage too (tap
 * the wick, tap the body). A missed question is not a fail: the owl says "train
 * again" and the same fight is played once more, the rule the films use too.
 */
const TAPS = 5;   // taps to land one attack

export default function Battle() {
  const { params, go, bump, popup } = useApp();
  const battle = BATTLES[params.id];
  const [r, setR] = useState(0);            // round
  const [b, setB] = useState(-1);           // beat; -1 = the title card
  const [power, setPower] = useState(0);    // taps landed on the current attack
  const [phase, setPhase] = useState("fight");   // fight → ask → again | next
  const [picked, setPicked] = useState(null);    // { right, k?, zone? } once answered
  const [tries, setTries] = useState(0);

  useEffect(() => { if (!battle) go("map"); }, []);   // opened with an id that has no battle
  useEffect(() => () => Speak.stop(), []);

  const round = battle?.rounds[r];
  const beat = round && b >= 0 ? round.beats[b] : null;
  const ask = round?.ask;
  const order = useMemo(() => (ask?.o ? ask.o.map((_, i) => i).sort(() => Math.random() - 0.5) : []), [r, tries]);
  const again = TRAIN_AGAIN[(r + tries) % TRAIN_AGAIN.length];
  const attack = !!beat?.fx;                      // this beat is one he powers
  const landed = !attack || power >= TAPS;

  // narrate whatever is on screen (an attack is narrated once it has landed)
  useEffect(() => {
    if (!battle || !Speak.on) return;
    if (b < 0) Speak.say(battle.intro);
    else if (phase === "fight" && beat && landed) Speak.say(beat.say);
    else if (phase === "ask" && picked === null) Speak.say(ask.q);
  }, [r, b, phase, tries, landed]);

  if (!battle) return null;   // also what this screen sees for a moment while it fades out

  function next() {
    Sound.play("click");
    if (b < round.beats.length - 1) { setPower(0); setB(b + 1); }
    else { setPicked(null); setPhase("ask"); }
  }

  function hit() {
    if (landed) return;
    const n = power + 1;
    setPower(n);
    if (n >= TAPS) Sound.play(beat.bull === "charge" ? "win" : "shield");
    else Sound.play("combo", n);
  }

  function answer(res) {
    if (picked !== null) return;
    setPicked(res);
    Sound.play(res.right ? "correct" : "wrong");
    if (res.right) Passes.answer(`battle:${params.id}:${r}`);
    if (Speak.on) Speak.sayParts([res.right ? "Correct!" : "Not quite.", ask.e]);
  }

  function afterAnswer(e) {
    Sound.play("click");
    if (!picked.right) { setPhase("again"); if (Speak.on) Speak.say(again, { who: "Sensei Hoshi" }); return; }
    if (r < battle.rounds.length - 1) { setR(r + 1); setB(0); setPower(0); setPhase("fight"); setPicked(null); setTries(0); return; }
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

  function trainAgain() { Sound.play("click"); setTries(tries + 1); setPicked(null); setPower(0); setB(0); setPhase("fight"); }

  // ---- what the stage shows
  const last = round.beats[round.beats.length - 1];
  let frame;
  if (b < 0) frame = { ...round.beats[0], fx: null, tag: null, bull: "idle", bear: "idle", candle: flat(round.beats[0].candle) };
  else if (phase !== "fight") frame = { ...last, fx: null };
  else if (!landed) {
    // mid-attack: the candle is wherever his taps have pushed it so far
    const from = b > 0 ? round.beats[b - 1].candle : flat(beat.candle), t = power / TAPS;
    const mix = (k) => from[k] + (beat.candle[k] - from[k]) * t;
    const bullAtk = beat.bull === "charge";
    frame = { ...beat, fx: null, tag: null, candle: { o: mix("o"), h: mix("h"), l: mix("l"), c: mix("c") },
      bull: bullAtk && power > 0 ? "charge" : "idle", bear: !bullAtk && power > 0 ? "charge" : "idle" };
  } else frame = beat;

  const answered = picked !== null;
  const who = beat?.bull === "charge" ? "buyers" : battle.villain === "hunter" ? "hunter" : "sellers";
  const hitLabel = { buyers: "👊 TAP! Push with the buyers", sellers: "💥 TAP! The sellers strike", hunter: "🥷 TAP! The Hunter makes its move" }[who];

  return (
    <section className="battle">
      <div className="battle-head">
        <span className="battle-title">🥊 {battle.title}</span>
        <span className="battle-rounds">
          {battle.rounds.map((x, i) => <span key={i} className={"film-pip" + (i < r ? " done" : i === r ? " now" : "")} />)}
        </span>
        <span className="battle-round-name">Fight {r + 1} of {battle.rounds.length} · {round.name}</span>
      </div>

      <Clash beat={frame} round={round} villain={battle.villain || "bear"} k={`${r}-${b}-${tries}-${phase}-${landed}`}
        onZone={phase === "ask" && ask.tap && !answered ? (z) => answer({ right: ask.tap.includes(z), zone: z }) : undefined}
        mark={phase === "ask" && ask.tap && answered ? { zone: picked.zone, ok: picked.right, right: ask.tap } : undefined} />

      {b < 0 && (
        <div className="battle-panel">
          <p className="battle-say">{battle.intro}</p>
          <button className="play-btn" onClick={() => { Sound.play("open"); setPower(0); setB(0); }}>▶ Fight!</button>
        </div>
      )}

      {b >= 0 && phase === "fight" && !landed && (
        <div className="battle-panel">
          <div className="power-bar" aria-hidden="true">{Array.from({ length: TAPS }, (_, i) => <span key={i} className={i < power ? "on " + who : ""} />)}</div>
          <motion.button className={"play-btn power-btn " + who} whileTap={{ scale: 0.9 }} onClick={hit}>{hitLabel}</motion.button>
        </div>
      )}

      {b >= 0 && phase === "fight" && landed && (
        <div className="battle-panel">
          <motion.p className="battle-say" key={`${r}-${b}-${tries}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>{beat.say}</motion.p>
          <button className="play-btn battle-next" onClick={next}>{b < round.beats.length - 1 ? "Next ▶" : "Call it! ▶"}</button>
        </div>
      )}

      {phase === "ask" && (
        <div className="battle-panel">
          <div className="quiz-question battle-q">{ask.q}</div>
          {ask.tap ? (
            !answered && <div className="drill-hint">👆 Tap it on the stage above.</div>
          ) : (
            <div className="battle-opts">
              {order.map((orig, k) => (
                <button key={k} disabled={answered}
                  className={"quiz-opt" + (answered && orig === ask.a ? " correct" : "") + (answered && picked.k === k && orig !== ask.a ? " wrong" : "")}
                  onClick={() => answer({ right: orig === ask.a, k })}>{ask.o[orig]}</button>
              ))}
            </div>
          )}
          {answered && <div className={"quiz-feedback " + (picked.right ? "good" : "bad")}>{picked.right ? "⭐ Yes! " : "💫 Not quite. "}{ask.e}</div>}
          {answered && (
            <button className="play-btn battle-next" onClick={afterAnswer}>
              {!picked.right ? "Keep going ▶" : r < battle.rounds.length - 1 ? "Next fight ▶" : "Win the battle ⭐"}
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

// a candle that has only just opened: everything sits on the open
const flat = (c) => ({ o: c.o, h: c.o, l: c.o, c: c.o });
