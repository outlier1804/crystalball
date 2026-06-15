import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { Sound } from "../engine/audio.js";

function IconMap() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}
function IconDojo() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 17.5L3 6 3 3h3l11.5 11.5" />
      <path d="M13 19l6-6" />
      <path d="M16 16l4 4" />
      <path d="M19 21l2-2" />
      <path d="M4.5 4.5 l1-1" />
    </svg>
  );
}
function IconProfile() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const BTNS = [
  { id: "map",     label: "Story Map",    Icon: IconMap     },
  { id: "dojo",    label: "Trading Dojo", Icon: IconDojo    },
  { id: "profile", label: "My Profile",   Icon: IconProfile },
];

export default function NavBar() {
  const { screen, go } = useApp();
  return (
    <nav id="navbar">
      {BTNS.map(({ id, label, Icon }) => {
        const isActive = screen === id;
        return (
          <motion.button
            key={id}
            className={"nav-btn" + (isActive ? " active" : "")}
            whileHover={isActive ? {} : { y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { Sound.play("click"); go(id); }}
          >
            <span className="nav-icon"><Icon /></span>
            <span className="nav-label">{label}</span>
            {isActive && (
              <motion.span
                className="nav-active-pip"
                layoutId="nav-pip"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}
