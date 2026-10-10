import { useState } from "react";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import SceneVideo from "../components/SceneVideo.jsx";
import LessonCheck from "../components/LessonCheck.jsx";
import { Sound } from "../engine/audio.js";
import { Rewards } from "../engine/rewards.js";
import { FILMS, filmFile } from "../engine/path.js";
import { checkFor } from "../engine/lesson-checks.js";

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
  const [phase, setPhase] = useState("watch");   // watch → ask → between

  function partDone() {
    Rewards.touchDay();
    Rewards.count("lessons", 1);
    setPhase(checkFor(parts[at]) ? "ask" : "between");
  }

  function finish() {
    Game.state.watched = { ...(Game.state.watched || {}), [lesson.n]: true };
    Game.save();
    bump();
    Sound.play("powerup");
    go("map");
  }

  const last = at >= parts.length - 1;
  if (!parts.length) { go("map"); return null; }

  return (
    <section className="film">
      <div className="film-head">
        <span className="film-title">🎬 {lesson.label}</span>
        <span className="film-parts">
          {parts.map((p, i) => <span key={p} className={"film-pip" + (i < at || (i === at && phase !== "watch") ? " done" : i === at ? " now" : "")} />)}
        </span>
      </div>

      {phase === "watch" && (
        <SceneVideo key={parts[at]} id={parts[at]} onDone={partDone} className="film-video" />
      )}

      {phase === "ask" && (
        <div className="film-card">
          <div className="film-card-kicker">Quick check</div>
          <LessonCheck partId={parts[at]} onDone={() => setPhase("between")} />
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
