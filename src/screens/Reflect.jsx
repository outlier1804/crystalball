import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import { ARCS } from "../engine/data.js";
import { CHARACTER_ART } from "../engine/characters.js";
import { Sound } from "../engine/audio.js";

export default function Reflect() {
  const { params, go, bump, popup } = useApp();
  const arc = ARCS.find((a) => a.id === params.arcId) || ARCS[0];
  const prompt = arc.reflect || "In your own words, what did you learn in this arc?";
  const existing = Game.state.reflections?.[arc.id]?.text || "";
  const [text, setText] = useState(existing);

  function save() {
    Game.saveReflection(arc.id, text);
    bump();
    Sound.play("correct");
    popup("🦉", "Sensei is proud!", "Putting it in your own words is how real understanding sticks. Well done, young trader!", true);
    go("map");
  }

  return (
    <section className="screen">
      <div className="lesson-card">
        <div className="lesson-arc-title">{arc.emoji} {arc.name} — Explain it back</div>
        <div className="dialogue-box">
          <motion.div className="portrait" initial={{ scale: 0.5 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 14 }}
            dangerouslySetInnerHTML={{ __html: CHARACTER_ART["Sensei Hoshi"] }} />
          <div className="speech">
            <div className="speaker-name">Sensei Hoshi</div>
            <div className="speech-text">{prompt}</div>
          </div>
        </div>
        <textarea className="reflect-input" rows={4} maxLength={600}
          placeholder="Type your answer here… there are no wrong answers — just explain it like you'd tell a friend."
          value={text} onChange={(e) => setText(e.target.value)} />
        <div className="lesson-footer">
          <button className="ghost-btn" onClick={() => { Sound.play("click"); go("map"); }}>Skip for now</button>
          <motion.button className="big-btn small" whileTap={{ scale: 0.95 }} disabled={!text.trim()}
            onClick={() => { Sound.play("click"); save(); }}>
            Save & continue ⭐
          </motion.button>
        </div>
      </div>
    </section>
  );
}
