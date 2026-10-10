import { useState } from "react";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import { GUIDES, hasVideo } from "../engine/video-manifest.js";
import SceneVideo from "../components/SceneVideo.jsx";
import Overlay from "../components/Overlay.jsx";
import { Sound } from "../engine/audio.js";
import { PLACES } from "../shell/Rail.jsx";

// Where everything is, in plain words, plus the short how-to films.
export default function Help() {
  const { go } = useApp();
  const [playing, setPlaying] = useState(null);
  const [theme, setTheme] = useState(Game.state?.theme || "dark");

  return (
    <section className="help">
      <header className="page-head">
        <h1>❓ How to play</h1>
        <p>Press <strong>▶ Play</strong> and do the step it shows you. That is the whole game.</p>
      </header>

      <div className="help-grid">
        {PLACES.map((p) => (
          <button key={p.id} className="help-place" onClick={() => { Sound.play("click"); go(p.id); }}>
            <span className="help-place-icon">{p.icon}</span>
            <span className="help-place-name">{p.label}</span>
            <span className="help-place-what">{WHAT[p.id]}</span>
          </button>
        ))}
      </div>

      <h2 className="help-sub">Short films</h2>
      <div className="help-films">
        {GUIDES.filter((g) => hasVideo(g.id)).map((g) => (
          <button key={g.id} className="help-film" onClick={() => { Sound.play("click"); setPlaying(g.id); }}>
            <span>{g.emoji}</span> {g.label}
          </button>
        ))}
      </div>

      <button className="quiet-btn" onClick={() => setTheme(Game.toggleTheme())}>
        {theme === "dark" ? "☀️ Switch to day colours" : "🌙 Switch to night colours"}
      </button>

      {playing && (
        <Overlay onClick={() => setPlaying(null)}>
          <SceneVideo id={playing} onDone={() => setPlaying(null)} />
        </Overlay>
      )}
    </section>
  );
}

const WHAT = {
  map: "Your next step. Start here every time.",
  path: "All the worlds, and any step you want to replay.",
  words: "Every trader word, explained in one line.",
  dojo: "Trade a pretend chart with pretend Koins.",
  forge: "Swap the scrolls you earn for new gear.",
  profile: "Your rank, badges and the report for Dad.",
};
