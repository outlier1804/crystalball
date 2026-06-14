import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import { ARCS } from "../engine/data.js";
import { CHARACTER_ART } from "../engine/characters.js";
import { Sound } from "../engine/audio.js";
import { Speak } from "../engine/speech.js";

export default function Reflect() {
  const { params, go, bump, popup } = useApp();
  const arc = ARCS.find((a) => a.id === params.arcId) || ARCS[0];
  const prompt = arc.reflect || "In your own words, what did you learn in this arc?";
  const existing = Game.state.reflections?.[arc.id]?.text || "";
  const [text, setText] = useState(existing);
  const [phase, setPhase] = useState("edit"); // edit | loading | done
  const [feedback, setFeedback] = useState("");

  async function save() {
    Game.saveReflection(arc.id, text);
    bump();
    Sound.play("correct");
    setPhase("loading");

    // Ask Sensei (Claude) for gentle feedback. Falls back gracefully if the
    // server has no API key configured, or on any error.
    let fb = null;
    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept: arc.name, prompt, answer: text }),
      });
      if (r.ok) { const d = await r.json(); fb = d.feedback; }
    } catch { /* offline / not deployed — degrade quietly */ }

    if (fb) {
      setFeedback(fb);
      setPhase("done");
      Sound.play("coo");
      if (Speak.on) Speak.say(fb, { pitch: 0.8, rate: 0.9 });
    } else {
      finish();
    }
  }

  function finish() {
    popup("🦉", "Sensei is proud!", "Putting it in your own words is how real understanding sticks. Well done, young trader!", true);
    go("map");
  }

  const art = CHARACTER_ART["Sensei Hoshi"];

  return (
    <section className="screen">
      <div className="lesson-card">
        <div className="lesson-arc-title">{arc.emoji} {arc.name} — Explain it back</div>
        <div className="dialogue-box">
          <motion.div className="portrait" initial={{ scale: 0.5 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 14 }}
            dangerouslySetInnerHTML={{ __html: art }} />
          <div className="speech">
            <div className="speaker-name">Sensei Hoshi</div>
            <motion.div className="speech-text" key={phase}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {phase === "done" ? feedback : prompt}
            </motion.div>
          </div>
        </div>

        {phase === "edit" && (
          <>
            <textarea className="reflect-input" rows={4} maxLength={600}
              placeholder="Type your answer here… there are no wrong answers — just explain it like you'd tell a friend."
              value={text} onChange={(e) => setText(e.target.value)} />
            <div className="lesson-footer">
              <button className="ghost-btn" onClick={() => { Sound.play("click"); go("map"); }}>Skip for now</button>
              <motion.button className="big-btn small" whileTap={{ scale: 0.95 }} disabled={!text.trim()}
                onClick={() => { Sound.play("click"); save(); }}>
                Save &amp; continue ⭐
              </motion.button>
            </div>
          </>
        )}

        {phase === "loading" && (
          <div className="reflect-loading">🦉 Sensei is reading your answer<span className="dots">…</span></div>
        )}

        {phase === "done" && (
          <div className="lesson-footer">
            <span className="reflect-note">💛 That's Sensei's note just for you.</span>
            <motion.button className="big-btn small" whileTap={{ scale: 0.95 }}
              onClick={() => { Sound.play("click"); finish(); }}>
              Continue ⭐
            </motion.button>
          </div>
        )}
      </div>
    </section>
  );
}
