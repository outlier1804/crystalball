import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import { ARCS, XP_REWARDS } from "../engine/data.js";
import { CHARACTER_ART } from "../engine/characters.js";
import { Sound } from "../engine/audio.js";
import { Speak } from "../engine/speech.js";
import { SCENES } from "../scenes/Scenes.jsx";

const VOICE = {
  "Sensei Hoshi": { pitch: 0.8, rate: 0.9 },
  "Kitsu the Fox": { pitch: 1.5, rate: 1.05 },
  "Rival Kazuo": { pitch: 0.75, rate: 0.95 },
};

export default function Lesson() {
  const { params, go, bump, popup } = useApp();
  const arc = ARCS.find((a) => a.id === params.arcId) || ARCS[0];
  const [page, setPage] = useState(0);
  const [typed, setTyped] = useState("");
  const [reading, setReading] = useState(Speak.on);
  const timer = useRef(null);
  const line = arc.lessons[page];

  // typewriter: reveal the line letter by letter (tags appear whole)
  useEffect(() => {
    clearInterval(timer.current);
    const html = line.t;
    let i = 0, out = "", chars = 0;
    setTyped("");
    timer.current = setInterval(() => {
      if (i >= html.length) { clearInterval(timer.current); setTyped(html); return; }
      if (html[i] === "<") { const j = html.indexOf(">", i); out += html.slice(i, j + 1); i = j + 1; }
      else { out += html[i++]; if (++chars % 4 === 0) Sound.play("blip"); }
      setTyped(out);
    }, 14);
    if (Speak.on) Speak.say(html, VOICE[line.c.name] || {});
    return () => clearInterval(timer.current);
  }, [arc.id, page]);

  function skipType() {
    if (typed !== line.t) { clearInterval(timer.current); setTyped(line.t); }
  }

  function next() {
    if (typed !== line.t) return skipType();
    if (page < arc.lessons.length - 1) { setPage(page + 1); return; }
    const rankUp = Game.completeLesson(arc.id);
    bump();
    Speak.stop();
    popup("📖", "Lesson complete!", `+${XP_REWARDS.lesson} XP! Now take the <strong>quiz</strong> to unlock the next step.`);
    if (rankUp) popup(rankUp.emoji, "RANK UP!", `You are now a <strong>${rankUp.name}</strong>!`, true);
    go("map");
  }

  function toggleRead() {
    if (!Speak.supported()) { setReading("x"); return; }
    const on = Speak.toggle();
    setReading(on);
    if (on) Speak.say(line.t, VOICE[line.c.name] || {});
  }

  const art = CHARACTER_ART[line.c.name];
  const Scene = line.scene ? SCENES[line.scene] : null;

  return (
    <section className="screen">
      <div className="lesson-card">
        <div className="lesson-arc-title">{arc.emoji} {arc.name}</div>
        {Scene && (
          <motion.div key={arc.id + page} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}>
            <Scene />
          </motion.div>
        )}
        <div className="dialogue-box">
          <motion.div className="portrait" key={line.c.name + page}
            initial={{ scale: 0.4, rotate: -12 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 14 }}
            {...(art ? { dangerouslySetInnerHTML: { __html: art } } : { children: line.c.emoji })} />
          <div className="speech" onClick={skipType}>
            <div className="speaker-name">{line.c.name}</div>
            <div className={"speech-text" + (typed !== line.t ? " typing" : "")}
              dangerouslySetInnerHTML={{ __html: typed }} />
          </div>
        </div>
        <div className="lesson-controls">
          <button className="ghost-btn" style={{ visibility: page === 0 ? "hidden" : "visible" }}
            onClick={() => { Sound.play("click"); if (page > 0) setPage(page - 1); }}>◀ Back</button>
          <div className="lesson-progress">{page + 1} / {arc.lessons.length}</div>
          <motion.button className="big-btn small" whileTap={{ scale: 0.95 }}
            onClick={() => { Sound.play("click"); next(); }}>
            {page === arc.lessons.length - 1 ? "Finish! ⭐" : "Next ▶"}
          </motion.button>
        </div>
        <div className="lesson-footer">
          <button className={"ghost-btn read-btn" + (reading === true ? " on" : "")} onClick={toggleRead}>
            {reading === "x" ? "🔇 Read-aloud not supported here" : reading ? "🔊 Read to me: ON" : "🔈 Read to me: OFF"}
          </button>
          <button className="ghost-btn exit-btn" onClick={() => { Sound.play("click"); Speak.stop(); go("map"); }}>
            ✖ Exit to Map
          </button>
        </div>
      </div>
    </section>
  );
}
