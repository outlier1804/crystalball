import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { Sound } from "../engine/audio.js";
import { Forge } from "../engine/upgrades.js";

// The five places in the game. Each label says what you DO there — the old
// names ("The Forge", "Trading Dojo") were flavour first and meaning second.
export const PLACES = [
  { id: "map",     icon: "▶",  label: "Play",      hint: "Your next step" },
  { id: "path",    icon: "🗺️", label: "Map",       hint: "The whole journey" },
  { id: "dojo",    icon: "⚔️", label: "Arena",     hint: "Practice trading" },
  { id: "forge",   icon: "⚡", label: "Power-Ups", hint: "Spend your scrolls" },
  { id: "profile", icon: "🏅", label: "Me",        hint: "Badges and stats" },
];

export default function Rail() {
  const { screen, go } = useApp();
  return (
    <nav className="rail" aria-label="Main">
      <button className="rail-logo" onClick={() => go("map")} aria-label="Home">CQ</button>
      {PLACES.map((p) => {
        const on = screen === p.id;
        return (
          <motion.button key={p.id} className={"rail-btn" + (on ? " on" : "")} title={p.hint}
            whileTap={{ scale: 0.94 }}
            onClick={() => { Sound.play("click"); go(p.id); }}>
            <span className="rail-icon">{p.icon}</span>
            <span className="rail-label">{p.label}</span>
            {p.id === "forge" && Forge.summary().nextBuyable && <span className="rail-dot" />}
          </motion.button>
        );
      })}
      <button className={"rail-btn rail-help" + (screen === "help" ? " on" : "")}
        onClick={() => { Sound.play("click"); go("help"); }}>
        <span className="rail-icon">❓</span>
        <span className="rail-label">Help</span>
      </button>
    </nav>
  );
}
