import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import { sessionById, gradedCount, passMark } from "../engine/foundations.js";
import { shuffleOptions, feedbackFor } from "../engine/analytics.js";
import { Sound } from "../engine/audio.js";
import { Speak } from "../engine/speech.js";
import { FX } from "../engine/fx.js";
import HelpButton from "../components/HelpButton.jsx";
import { localHelp } from "../engine/help.js";
import { Rewards } from "../engine/rewards.js";

/* ---------------------------------------------------------------- visuals */

// Plain price line — stage 1 deliberately has no candles in it at all.
function LineChart({ points, level }) {
  const W = 320, H = 140, pad = 14;
  const min = Math.min(...points, level ? level.v : Infinity);
  const max = Math.max(...points, level ? level.v : -Infinity);
  const span = max - min || 1;
  const x = (i) => pad + (i * (W - pad * 2)) / (points.length - 1);
  const y = (v) => H - pad - ((v - min) / span) * (H - pad * 2);
  const d = points.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  return (
    <svg className="f-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="price line">
      <motion.path d={d} fill="none" stroke="var(--ink)" strokeWidth="4"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9 }} />
      {level && (
        <>
          <line x1={pad} y1={y(level.v)} x2={W - pad} y2={y(level.v)} stroke="var(--pink)"
            strokeWidth="3" strokeDasharray="7 6" />
          <text x={W - pad} y={y(level.v) - 6} textAnchor="end" className="f-axis">{level.label}</text>
        </>
      )}
      {points.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="4" fill="var(--pink)" />)}
      <text x={pad} y={H - 2} className="f-axis">morning</text>
      <text x={W - pad} y={H - 2} textAnchor="end" className="f-axis">night</text>
    </svg>
  );
}

// One candle, drawn big enough to actually study
function Candle({ o, h, l, c, scaleMin = 0, scaleMax = 100 }) {
  const W = 120, H = 220, pad = 12;
  const y = (v) => H - pad - ((v - scaleMin) / (scaleMax - scaleMin || 1)) * (H - pad * 2);
  const up = c >= o;
  const col = up ? "var(--ink)" : "var(--red)";
  const bodyTop = y(Math.max(o, c)), bodyBot = y(Math.min(o, c));
  return (
    <svg className="f-candle" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="candle">
      <line x1={W / 2} y1={y(h)} x2={W / 2} y2={y(l)} stroke={col} strokeWidth="4" />
      <rect x={W / 2 - 26} y={bodyTop} width="52" height={Math.max(3, bodyBot - bodyTop)}
        fill={up ? "var(--card)" : col} stroke={col} strokeWidth="4" />
    </svg>
  );
}

// A row of candles on one shared scale — stage 4 onwards. Drawn small enough
// that the SHAPE of the run is what he sees, not any single candle.
function CandleRow({ candles }) {
  const W = 320, H = 170, pad = 16;
  const lo = Math.min(...candles.map((k) => k.l));
  const hi = Math.max(...candles.map((k) => k.h));
  const span = hi - lo || 1;
  const y = (v) => H - pad - ((v - lo) / span) * (H - pad * 2);
  const slot = (W - pad * 2) / candles.length;
  const bw = Math.min(26, slot * 0.6);
  return (
    <svg className="f-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="row of candles">
      {candles.map((k, i) => {
        const cx = pad + slot * i + slot / 2;
        const up = k.c >= k.o;
        const col = up ? "var(--ink)" : "var(--red)";
        const top = y(Math.max(k.o, k.c)), bot = y(Math.min(k.o, k.c));
        return (
          <motion.g key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.09 }}>
            <line x1={cx} y1={y(k.h)} x2={cx} y2={y(k.l)} stroke={col} strokeWidth="3" />
            <rect x={cx - bw / 2} y={top} width={bw} height={Math.max(3, bot - top)}
              fill={up ? "var(--card)" : col} stroke={col} strokeWidth="3" />
          </motion.g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------- activities */

function PercentActivity({ act, onResult }) {
  const answer = Math.round((act.koins * act.pct) / 100);
  // Distractors are the mistakes a kid actually makes, not random numbers.
  const opts = useMemo(() => {
    const cand = [answer, act.pct, Math.round(act.koins / act.pct), answer * 2, Math.round(answer / 2)];
    const uniq = [];
    for (const v of cand) if (v > 0 && !uniq.includes(v)) uniq.push(v);
    const four = uniq.slice(0, 4);
    for (let i = four.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [four[i], four[j]] = [four[j], four[i]];
    }
    return four;
  }, [act]);
  const [picked, setPicked] = useState(null);

  return (
    <>
      <div className="f-q" dangerouslySetInnerHTML={{ __html: act.q }} />
      <div className="f-koins">{"🪙".repeat(Math.min(10, Math.max(1, Math.round(act.koins / 20))))}</div>
      <div className="f-opts">
        {opts.map((v) => {
          let cls = "quiz-opt f-opt-num";
          if (picked !== null && v === answer) cls += " correct";
          else if (picked === v) cls += " wrong";
          return (
            <motion.button key={v} className={cls} disabled={picked !== null}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => {
                if (picked !== null) return;
                setPicked(v);
                const right = v === answer;
                Sound.play(right ? "correct" : "wrong");
                if (right && e.currentTarget) FX.confettiAt(e.currentTarget, 14);
                onResult(right);
              }}>
              {v} <span className="f-unit">Koins</span>
            </motion.button>
          );
        })}
      </div>
      {picked !== null && (
        <div className={"quiz-feedback " + (picked === answer ? "good" : "bad")}>
          {picked === answer ? "⭐ Correct! " : "💫 Not quite! "}{act.e}
        </div>
      )}
    </>
  );
}

function PickActivity({ act, onResult }) {
  const view = useMemo(() => shuffleOptions({ o: act.o, a: act.a }), [act]);
  const [picked, setPicked] = useState(null);
  return (
    <>
      {act.chart && <LineChart points={act.chart} level={act.level} />}
      {act.candles && <CandleRow candles={act.candles} />}
      <div className="f-q" dangerouslySetInnerHTML={{ __html: act.q }} />
      <div className="f-opts">
        {view.options.map((text, i) => {
          let cls = "quiz-opt";
          if (picked !== null && i === view.answer) cls += " correct";
          else if (picked === i) cls += " wrong";
          return (
            <motion.button key={i} className={cls} disabled={picked !== null}
              whileHover={picked === null ? { x: 4 } : {}} whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                if (picked !== null) return;
                setPicked(i);
                const right = i === view.answer;
                Sound.play(right ? "correct" : "wrong");
                if (right && e.currentTarget) FX.confettiAt(e.currentTarget, 14);
                onResult(right);
              }}>
              {text}
            </motion.button>
          );
        })}
      </div>
      {picked !== null && (
        <div className={"quiz-feedback " + (picked === view.answer ? "good" : "bad")}>
          {picked === view.answer ? "⭐ Correct! " : "💫 Not quite! "}
          {feedbackFor(act, view.toOriginal[picked], picked === view.answer)}
        </div>
      )}
    </>
  );
}

// Build the candle by hand. He can't get it wrong forever — he nudges until it
// matches, which is the point: the shape gets into his hands, not his notes.
function BuildActivity({ act, onResult }) {
  const t = act.target;
  const [v, setV] = useState({ o: 50, c: 50, h: 55, l: 45 });
  const [done, setDone] = useState(false);
  const [tries, setTries] = useState(0);
  const step = (k, d) => {
    if (done) return;
    setV((s) => {
      const nx = { ...s, [k]: Math.max(0, Math.min(100, s[k] + d)) };
      nx.h = Math.max(nx.h, nx.o, nx.c);      // a candle can't close outside its own range
      nx.l = Math.min(nx.l, nx.o, nx.c);
      return nx;
    });
  };
  const match = ["o", "c", "h", "l"].every((k) => v[k] === t[k]);
  const rows = [["o", "Started at"], ["h", "Highest"], ["l", "Lowest"], ["c", "Ended at"]];

  return (
    <>
      <div className="f-q" dangerouslySetInnerHTML={{ __html: act.q }} />
      <div className="f-build">
        <Candle {...v} />
        <div className="f-build-ctrls">
          {rows.map(([k, label]) => (
            <div key={k} className={"f-build-row" + (v[k] === t[k] ? " hit" : "")}>
              <span className="f-build-label">{label}</span>
              <button className="f-step" onClick={() => step(k, -5)} disabled={done}>−</button>
              <span className="f-build-val">{v[k]}</span>
              <button className="f-step" onClick={() => step(k, 5)} disabled={done}>+</button>
              <span className="f-build-tick">{v[k] === t[k] ? "✅" : ""}</span>
            </div>
          ))}
        </div>
      </div>
      {!done && (
        <motion.button className="big-btn small" whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            if (match) {
              setDone(true);
              Sound.play("correct");
              if (e.currentTarget) FX.confettiAt(e.currentTarget, 22);
              onResult(tries === 0);   // clean first check = a point
            } else {
              setTries((n) => n + 1);
              Sound.play("wrong");
            }
          }}>
          {match ? "Check it ⭐" : "Check it"}
        </motion.button>
      )}
      {!done && tries > 0 && (
        <div className="quiz-feedback bad">
          💫 Not yet — look at the ticks. Keep nudging the numbers that don't match.
        </div>
      )}
      {done && <div className="quiz-feedback good">⭐ Built it! {act.e}</div>}
    </>
  );
}

// Play the Koin game and WATCH what happens. Nothing is asserted here — the
// numbers do the teaching, and the question about them comes next.
function GameActivity({ act, onResult }) {
  const [bal, setBal] = useState(act.start);
  const [hist, setHist] = useState([act.start]);
  const [n, setN] = useState(0);
  const [wins, setWins] = useState(0);
  const [last, setLast] = useState(null);
  const over = n >= act.rounds;

  function flip(times = 1) {
    let b = bal, w = wins, k = n;
    const h = [...hist];
    for (let i = 0; i < times && k < act.rounds; i++) {
      const won = Math.random() < act.winRate;
      b += won ? act.win : -act.loss;
      if (won) w++;
      k++; h.push(b);
      setLast(won);
    }
    setBal(b); setWins(w); setN(k); setHist(h);
    Sound.play(b >= act.start ? "correct" : "wrong");
    if (k >= act.rounds) onResult(true);   // playing it through IS the win
  }

  return (
    <>
      <div className="f-q" dangerouslySetInnerHTML={{ __html: act.q }} />
      <div className="f-game">
        <div className={"f-bal " + (bal >= act.start ? "up" : "down")}>
          {bal} <span className="f-unit">Koins</span>
        </div>
        <div className="f-game-meta">
          Round {n}/{act.rounds} · won {wins} · lost {n - wins}
          {last !== null && <span className={last ? " f-flag win" : " f-flag lose"}>{last ? "WIN +" + act.win : "LOSS −" + act.loss}</span>}
        </div>
        {hist.length > 1 && <LineChart points={hist} />}
      </div>
      {!over ? (
        <div className="f-game-btns">
          <motion.button className="big-btn small" whileTap={{ scale: 0.95 }} onClick={() => flip(1)}>
            🎲 Play one
          </motion.button>
          <motion.button className="big-btn small ghost" whileTap={{ scale: 0.95 }} onClick={() => flip(act.rounds)}>
            ⏩ Play the rest
          </motion.button>
        </div>
      ) : (
        <div className={"quiz-feedback " + (bal >= act.start ? "good" : "bad")}>
          {bal >= act.start ? "📈 " : "📉 "}
          You won {wins} of {act.rounds} and finished with <strong>{bal} Koins</strong>. {act.e}
        </div>
      )}
    </>
  );
}


// Choose a direction, then WATCH what the market actually did next. Deliberately
// not a prediction game: every chart here has an obvious direction already, so
// the skill being trained is "go with the wave", not "guess the future". One
// round is rigged to lose after a correct read — that lesson is the point.
function TradeActivity({ act, onResult }) {
  const [picked, setPicked] = useState(null);
  const end = act.before[act.before.length - 1];
  const fin = act.after[act.after.length - 1];
  const wentUp = fin > end;
  const right = picked === (wentUp ? 0 : 1);
  const koins = Math.round(Math.abs(fin - end));

  return (
    <>
      <LineChart points={picked === null ? act.before : [...act.before, ...act.after]} />
      <div className="f-q" dangerouslySetInnerHTML={{ __html: act.q }} />
      {picked === null ? (
        <div className="f-opts">
          {["📈 Buy first — I win if it goes UP", "📉 Sell first — I win if it goes DOWN"].map((t, i) => (
            <motion.button key={i} className="quiz-opt" whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                setPicked(i);
                const ok = i === (wentUp ? 0 : 1);
                Sound.play(ok ? "correct" : "wrong");
                if (ok && e.currentTarget) FX.confettiAt(e.currentTarget, 14);
                onResult(ok);
              }}>{t}</motion.button>
          ))}
        </div>
      ) : (
        <div className={"quiz-feedback " + (right ? "good" : "bad")}>
          {right ? "⭐ " : "💫 "}
          The market went <strong>{wentUp ? "UP" : "DOWN"}</strong> — you
          {right ? " won " : " lost "}<strong>{koins} Koins</strong>.{" "}
          {feedbackFor(act, picked, right)}
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ screen */

export default function Foundations() {
  const { params, go, bump, popup, chest } = useApp();
  const session = sessionById(params.sessionId);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [reteach, setReteach] = useState(null);   // shown after a repeat miss on the same activity

  if (!session) {
    return (
      <section className="screen">
        <div className="quiz-card"><p>Session not found.</p>
          <button className="big-btn small" onClick={() => go("map")}>◀ Back</button></div>
      </section>
    );
  }

  const act = session.activities[idx];
  const graded = gradedCount(session);
  const isLast = idx === session.activities.length - 1;

  // Stage key ("s0".."s11") — sessions are "s3a", "s3b"; help and re-teach are
  // authored per stage, not per session.
  const stageKey = (String(session.id).match(/^s\d+/) || ["s0"])[0];
  const plain = (t) => String(t || "").replace(/<[^>]+>/g, "");

  function onResult(right) {
    setAnswered(true);
    if (right && act.type !== "game") { setCorrect((c) => c + 1); Rewards.count("correct", 1); }

    // Read the explanation out loud, not just the question — the explanation is
    // the part that teaches, and it's the densest text on the screen.
    if (Speak.on && act.e) {
      const line = (right ? "Correct! " : "Not quite. ") + plain(act.e);
      setTimeout(() => Speak.say(line, { pitch: 0.85, rate: 0.9 }), 400);
    }
    if (right || act.type === "game") return;

    const res = Game.recordFoundationMiss(session.id, idx, false);
    // Missed this same step before — stop and re-teach it rather than letting him
    // tap Next and carry the same wrong idea into the next stage.
    if (res.reteach) setReteach(localHelp(stageKey, 0, plain(act.e) || session.idea));
    // Third time on the same step: this isn't clicking on his own today.
    if (res.stuck) {
      Game.notifyStuck({ topicKey: stageKey, topicName: session.title, question: plain(act.q) || session.idea });
    }
  }

  function next() {
    Speak.stop();
    if (!isLast) { setIdx(idx + 1); setAnswered(false); setReteach(null); return; }
    const res = Game.recordFoundationSession(session.id, correct, graded, passMark(session));
    Rewards.touchDay();
    if (res.passed) Rewards.count("sessions", 1);
    bump();
    if (res.passed) {
      popup("🎓", res.firstPass ? "SESSION CLEARED!" : "Nice work!",
        `<strong>${correct} / ${graded}</strong> — you've got it.` +
        (res.firstPass ? ` +${40} XP` : " (already cleared)"), true, "win");
      if (res.rankUp) popup(res.rankUp.emoji, "RANK UP!", `You are now a <strong>${res.rankUp.name}</strong>!`, true, "levelup");
      if (res.firstPass) chest(correct === graded ? "gold" : "silver", correct === graded ? "PERFECT — golden chest!" : "Session reward chest!");
    } else {
      popup("🔁", "Almost!",
        `You got <strong>${correct} / ${graded}</strong>. You need ${passMark(session)} to clear this one — ` +
        `run it again, it'll click.`, false);
    }
    go("map");
  }

  return (
    <section className="screen">
      <div className="quiz-card f-card">
        <div className="lesson-arc-title">{session.stageEmoji} {session.title}</div>
        <div className="f-idea">💡 {session.idea}</div>
        <div className="quiz-progress">Step {idx + 1} of {session.activities.length}</div>

        {act.type === "say" && (
          <div className="f-say">
            <p dangerouslySetInnerHTML={{ __html: act.t }} />
            <button className="mute-btn f-read" title="Read to me"
              onClick={() => Speak.say(act.t.replace(/<[^>]+>/g, ""), { rate: 0.95 })}>🔊</button>
          </div>
        )}
        {act.type === "pick" && <PickActivity key={idx} act={act} onResult={onResult} />}
        {act.type === "percent" && <PercentActivity key={idx} act={act} onResult={onResult} />}
        {act.type === "build" && <BuildActivity key={idx} act={act} onResult={onResult} />}
        {act.type === "game" && <GameActivity key={idx} act={act} onResult={onResult} />}
        {act.type === "trade" && <TradeActivity key={idx} act={act} onResult={onResult} />}

        {reteach && (
          <motion.div className="reteach-panel" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <div className="reteach-head">🔄 Let's back up a step — this one's tricky.</div>
            <div className="reteach-text">{reteach}</div>
            <div className="reteach-text"><strong>The idea here:</strong> {session.idea}</div>
            <button className="ghost-btn" onClick={() => { Sound.play("click"); Speak.say(reteach, { pitch: 0.8, rate: 0.88 }); }}>
              🔊 Read this to me
            </button>
          </motion.div>
        )}

        {/* Help on every step, before or after answering. */}
        <HelpButton key={session.id + ":" + idx} topic={stageKey} topicName={session.title}
          question={plain(act.q || act.t)} lessonText={session.idea} fallback={plain(act.e)} />

        {(answered || act.type === "say") && (
          <motion.button className="big-btn small" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            whileTap={{ scale: 0.95 }} onClick={() => { Sound.play("click"); next(); }}>
            {isLast ? "Finish ⭐" : "Next ▶"}
          </motion.button>
        )}
      </div>
    </section>
  );
}
