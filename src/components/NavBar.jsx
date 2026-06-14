import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { Sound } from "../engine/audio.js";

const BTNS = [
  ["map", "🗺️ Story Map"],
  ["dojo", "⚔️ Trading Dojo"],
  ["profile", "🏅 My Profile"],
];

export default function NavBar() {
  const { screen, go } = useApp();
  return (
    <nav id="navbar">
      {BTNS.map(([s, label]) => (
        <motion.button
          key={s}
          className={"nav-btn" + (screen === s ? " active" : "")}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { Sound.play("click"); go(s); }}
        >
          {label}
        </motion.button>
      ))}
    </nav>
  );
}
