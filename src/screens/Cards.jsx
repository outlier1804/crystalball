import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store.jsx";
import { ARCS, MISSIONS } from "../engine/data.js";
import { CARDS, KIND_NAME, RARE_NAME, cardOwned, cardHint, cardPower } from "../engine/cards.js";
import { Voice } from "../engine/voice.js";
import { Sound } from "../engine/audio.js";
import { LessonArt } from "../scenes/LessonArt.jsx";
import { MiniCandle } from "../scenes/Clash.jsx";

/* The card binder. Every idea in the course is a card; the ones he has earned
 * are face up, the rest are face down with how to earn them. Tapping a card he
 * owns opens it — that is the whole screen. It doubles as a revision sheet,
 * which is the point: he "checks his cards" and re-reads the course. */
const names = {
  arc: (id) => { const a = ARCS.find((x) => x.id === id); return a ? a.name.replace(/\s*\(.*\)$/, "") : "a later world"; },
  mission: (id) => MISSIONS.find((m) => m.id === id)?.name || "a later mission",
};

export function CardFace({ card, big = false }) {
  return (
    <div className={`tcard rare-${card.rare} kind-${card.kind}` + (big ? " big" : "")}>
      <div className="tcard-top">
        <span className="tcard-kind">{KIND_NAME[card.kind]}</span>
        <span className="tcard-stars">{"★".repeat(card.rare)}</span>
      </div>
      <div className="tcard-art">
        <LessonArt src={`/art/cards/${card.id}.jpg`} className="tcard-img" wrapClassName="tcard-art-in">
          {card.candle ? <MiniCandle c={card.candle} size={big ? 170 : 96} /> : <span className="tcard-emoji">{card.emoji}</span>}
        </LessonArt>
      </div>
      <div className="tcard-name">{card.name}</div>
      {big && <div className="tcard-power">{cardPower(card)}</div>}
      {big && <div className="tcard-use"><strong>{card.kind === "villain" ? "How to beat it" : "When to use it"}:</strong> {card.use}</div>}
      {big && <div className="tcard-rare">{RARE_NAME[card.rare]}</div>}
    </div>
  );
}

export default function Cards() {
  const { game, go } = useApp();
  const [open, setOpen] = useState(null);
  const owned = CARDS.filter((c) => cardOwned(c, game.state));

  return (
    <section className="cards-screen">
      <header className="page-head">
        <h1>🃏 {Voice.pick("Technique Cards", "Reference Cards")}</h1>
        <p>{Voice.pick(
          `You have ${owned.length} of ${CARDS.length}. Win battles, pass quizzes and beat Arena missions to earn the rest.`,
          `${owned.length} of ${CARDS.length} unlocked. Each card is one idea from the course, unlocked as you pass it.`)}</p>
      </header>

      {/* The desk reference, for when he is paper trading and needs a reminder. */}
      <div className="desk-links">
        <button className="big-btn small" onClick={() => { Sound.play("open"); go("playbook"); }}>📋 Pre-trade checklist</button>
        <button className="big-btn small" onClick={() => { Sound.play("open"); go("words"); }}>📖 Trader words</button>
        <button className="big-btn small" onClick={() => { Sound.play("open"); go("help"); }}>❓ Ask the tutor</button>
      </div>

      <div className="cards-grid">
        {CARDS.map((c) => {
          const has = cardOwned(c, game.state);
          return has ? (
            <motion.button key={c.id} className="tcard-btn" whileHover={{ y: -6, rotate: -1.5 }} whileTap={{ scale: 0.96 }}
              onClick={() => { Sound.play("open"); setOpen(c); }}>
              <CardFace card={c} />
            </motion.button>
          ) : (
            <div key={c.id} className="tcard locked" title={cardHint(c, names)}>
              <div className="tcard-lock">🔒</div>
              <div className="tcard-name">???</div>
              <div className="tcard-hint">{cardHint(c, names)}</div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="tcard-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}>
            <motion.div initial={{ rotateY: 90, scale: 0.7 }} animate={{ rotateY: 0, scale: 1 }} exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }} onClick={(e) => e.stopPropagation()}>
              <CardFace card={open} big />
              <button className="big-btn small tcard-close" onClick={() => { Sound.play("click"); setOpen(null); }}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
