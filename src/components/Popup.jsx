import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { FX } from "../engine/fx.js";
import { Sound } from "../engine/audio.js";
import { LessonArt } from "../scenes/LessonArt.jsx";
import { UI } from "../engine/art.js";

export default function Popup() {
  const { queue, closePopup } = useApp();
  const p = queue[0];

  useEffect(() => {
    if (p?.celebrate) {
      Sound.play("fanfare");
      const t = setTimeout(() => {
        const card = document.querySelector(".popup-card");
        if (card) FX.confettiAt(card, 50);
      }, 150);
      return () => clearTimeout(t);
    }
  }, [p]);

  return (
    <AnimatePresence>
      {p && (
        <motion.div id="popup" className="popup" key="popup"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="popup-card"
            initial={{ scale: 0.55, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}>
            <div className={"popup-burst" + (p.celebrate ? " celebrate" : "")} />
            <motion.div className="popup-emoji"
              initial={{ scale: 0, rotate: -25 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 12, delay: 0.1 }}>
              <LessonArt src={p.stinger && UI[p.stinger] ? UI[p.stinger] : null}
                className="popup-stinger-img" wrapClassName="popup-stinger-wrap">
                {p.emoji}
              </LessonArt>
            </motion.div>
            <div className="popup-title">{p.title}</div>
            <div className="popup-text" dangerouslySetInnerHTML={{ __html: p.text }} />
            <motion.button className="big-btn small" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { Sound.play("click"); closePopup(); }}>
              Awesome!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
