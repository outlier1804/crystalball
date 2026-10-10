import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { Game, Profiles } from "../engine/game.js";
import { avatarSvg } from "../engine/characters.js";
import { Sound } from "../engine/audio.js";

// "Who's playing?" — one tile per person. Each has their own progress and their
// own version of the lessons (kid or grown-up).
export default function Who() {
  const { go, bump } = useApp();
  const list = Profiles.list();

  function pick(id) {
    Sound.play("open");
    Profiles.use(id);
    Game.load();
    bump();
    go("map");
  }

  function add() {
    Sound.play("click");
    Game.state = Game.defaultState();     // a blank slate for the welcome form
    go("welcome", { adding: true });
  }

  return (
    <section className="who">
      <h1 className="who-title">Who's playing?</h1>
      <div className="who-grid">
        {list.map((p, i) => (
          <motion.button key={p.id} className="who-tile" onClick={() => pick(p.id)}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            whileHover={{ y: -6 }} whileTap={{ scale: 0.96 }}>
            <span className="who-face" dangerouslySetInnerHTML={{ __html: avatarSvg(p.avatar) }} />
            <span className="who-name">{p.name}</span>
            <span className="who-mode">{p.mode === "adult" ? "Grown-up course" : "Kid course"}</span>
          </motion.button>
        ))}
        <motion.button className="who-tile who-add" onClick={add} whileHover={{ y: -6 }} whileTap={{ scale: 0.96 }}>
          <span className="who-face who-plus">+</span>
          <span className="who-name">Add a player</span>
          <span className="who-mode">Mom, Dad, anyone</span>
        </motion.button>
      </div>
    </section>
  );
}
