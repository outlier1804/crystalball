import { Voice } from "../engine/voice.js";
import { useState } from "react";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import { Sound } from "../engine/audio.js";
import { PLACES } from "../shell/Rail.jsx";

// Where everything is, in plain words.
export default function Help() {
  const { go } = useApp();
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

      <button className="quiet-btn" onClick={() => setTheme(Game.toggleTheme())}>
        {theme === "dark" ? "☀️ Switch to day colours" : "🌙 Switch to night colours"}
      </button>

    </section>
  );
}

const WHAT = {
  map: "Your next step. Start here every time.",
  path: "All the worlds, and any step you want to replay.",
  words: "Every trader word, explained in one line.",
  get dojo() { return Voice.pick("Trade a pretend chart with pretend Koins.", "Trade a simulated chart with practice money (Koins)."); },
  get forge() { return Voice.pick("Swap the scrolls you earn for new gear.", "Spend the scrolls you earn on tools for the practice arena."); },
  get profile() { return Voice.pick("Your rank, badges and the report for Dad.", "Your rank, badges and progress report."); },
};
