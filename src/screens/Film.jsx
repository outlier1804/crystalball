import { useEffect, useState } from "react";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import SceneVideo from "../components/SceneVideo.jsx";
import LessonCheck from "../components/LessonCheck.jsx";
import { Sound } from "../engine/audio.js";
import { Rewards } from "../engine/rewards.js";
import { FILMS, filmFile } from "../engine/path.js";
import { checksFor } from "../engine/lesson-checks.js";
import { Voice } from "../engine/voice.js";

// One lesson film as a step on the path: short narrated parts, one question
// after each, then back to Play. Same rules LessonPlayer set — a part is a
// finished thing, and stopping early is a normal outcome — but as a full screen
// rather than a pop-up over a page of other buttons.
export default function Film() {
  const { params, go, bump } = useApp();
  const film = FILMS[params.n];
  const lesson = { n: params.n, label: film?.title };
  const parts = film ? [filmFile(params.n)] : [];
  const [at, setAt] = useState(0);
  const [phase, setPhase] = useState("watch");   // watch → ask → between (a miss in the kid course goes back to watch)
  const [qi, setQi] = useState(0);               // which of the part's questions is up
  const keys = checksFor(parts[at] || "");

  // Dad's rule for the kid course: every question right, or the film is watched
  // again and the questions start over. A grown-up just sees the explanation.
  const strict = !Voice.adult;
  // First time through he has to sit the film out; a film he has already passed
  // can be skipped when he comes back to it.
  const passed = !!Game.state.watched?.[lesson.n];

  function partDone() {
    Rewards.touchDay();
    Rewards.count("lessons", 1);
    setQi(0);
    setPhase(keys.length ? "ask" : "between");
  }

  function answered(right) {
    if (!right && strict) { setQi(0); setPhase("watch"); return; }   // back to the film, questions start over
    if (qi < keys.length - 1) setQi(qi + 1);
    else setPhase("between");
  }

  function finish() {
    Game.state.watched = { ...(Game.state.watched || {}), [lesson.n]: true };
    Game.save();
    bump();
    Sound.play("powerup");
    go("map");
  }

  const last = at >= parts.length - 1;
  useEffect(() => { if (!film) go("map"); }, []);   // opened with an id that has no film

  // No film for this id. That is also what this screen sees for a moment while it
  // fades out after Finish (the params are already the next screen's), so it must
  // not navigate from inside render — the effect below handles a truly bad id.
  if (!parts.length) return null;

  return (
    <section className="film">
      <div className="film-head">
        <span className="film-title">🎬 {lesson.label}</span>
        <span className="film-parts">
          {parts.map((p, i) => <span key={p} className={"film-pip" + (i < at || (i === at && phase !== "watch") ? " done" : i === at ? " now" : "")} />)}
        </span>
      </div>

      {phase === "watch" && (
        <SceneVideo key={parts[at]} id={parts[at]} onDone={partDone} className="film-video" noSkip={strict && !passed} />
      )}

      {phase === "ask" && (
        <div className="film-card">
          <div className="film-card-kicker">{keys.length > 1 ? `Question ${qi + 1} of ${keys.length}` : "Quick check"}</div>
          <LessonCheck key={keys[qi]} partId={keys[qi]} onDone={answered}
            doneLabel={(right) => (!right && strict ? "▶ Watch it again" : qi < keys.length - 1 ? "Next question ▶" : "Carry on")} />
        </div>
      )}

      {phase === "between" && (
        <div className="film-card">
          <div className="film-card-kicker">Part {at + 1} of {parts.length} done ✅</div>
          {last ? (
            <button className="play-btn" onClick={finish}>Finish ⭐</button>
          ) : (
            <>
              <button className="play-btn" onClick={() => { Sound.play("click"); setAt(at + 1); setPhase("watch"); }}>
                ▶ Next part
              </button>
              <button className="quiet-btn" onClick={() => { setPhase("watch"); }}>↺ Watch that again</button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
