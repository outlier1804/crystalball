import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { Game } from "../engine/game.js";
import { AVATARS } from "../engine/characters.js";
import { Sound } from "../engine/audio.js";
import { FX } from "../engine/fx.js";

export default function Welcome() {
  const { bump, go, popup } = useApp();
  const [sel, setSel] = useState(AVATARS[0].id);
  const [spin, setSpin] = useState({ [AVATARS[0].id]: 1 });
  const [name, setName] = useState("");

  function pick(id, e) {
    setSel(id);
    setSpin((k) => ({ ...k, [id]: (k[id] || 0) + 1 }));
    Sound.play("open");
    if (e?.currentTarget) FX.confettiAt(e.currentTarget, 14);
  }

  function start() {
    Game.state.name = name.trim() || "Trader";
    Game.state.avatar = sel;
    Game.save();
    bump();
    popup("⛩️", `Welcome, ${Game.state.name}!`,
      "Your quest begins! Head to <strong>Arc 1</strong> on the Story Map and meet Sensei Hoshi.", true);
    go("map");
  }

  return (
    <section className="screen">
      <div className="welcome-card">
        <div className="welcome-art">⛩️</div>
        <h1>Welcome to Candle Quest Academy!</h1>
        <p className="tagline">Train with Sensei Hoshi, master the candlestick charts,
          and become a <strong>Legendary Trade Master</strong>!</p>
        <p className="safe-note">🎮 This is a game! All coins are pretend
          <strong> Koins</strong> — no real money, ever.</p>
        <label className="field-label" htmlFor="name-input">What's your trader name?</label>
        <input id="name-input" maxLength={14} placeholder="e.g. KaiBlaze" autoComplete="off"
          value={name} onChange={(e) => setName(e.target.value)} />
        <label className="field-label">Choose your hero:</label>
        <div id="avatar-picker" className="hero-select">
          {AVATARS.map((a) => (
            <div key={a.id} className={"hero-card" + (sel === a.id ? " selected" : "")}
              onClick={(e) => pick(a.id, e)}>
              <div className="hero-badge">✓ PICKED</div>
              <div className="hero-stage">
                <div className={"hero-aura " + (a.aura || "flame")} aria-hidden="true">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.span key={i} className="aura-particle" style={{ left: `${28 + i * 15}%` }}
                      animate={{ y: [12, -82], opacity: [0, 1, 0] }}
                      transition={{ duration: 2 + i * 0.35, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }} />
                  ))}
                </div>
                <div className="hero-podium" />
                <div className="hero-spin-wrap">
                  <motion.div
                    key={spin[a.id] || 0}
                    style={{ transformStyle: "preserve-3d" }}
                    animate={sel === a.id ? { rotateY: [0, 360] } : { rotateY: 0 }}
                    transition={{ duration: 1, ease: [0.4, 0.1, 0.2, 1] }}
                    dangerouslySetInnerHTML={{ __html: a.svg }}
                  />
                </div>
              </div>
              <div className="hero-name">{a.name}</div>
              <div className="hero-tag">{a.tag}</div>
            </div>
          ))}
        </div>
        <motion.button id="start-btn" className="big-btn"
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={start}>
          ⚡ Begin My Quest!
        </motion.button>
      </div>
    </section>
  );
}
