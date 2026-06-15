import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../store.jsx";
import { avatarSvg } from "../engine/characters.js";
import { Sound } from "../engine/audio.js";

function IconVolume() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}
function IconMute() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

export default function TopBar() {
  const { game, go } = useApp();
  const s = game.state;
  const rank = game.rank();
  const next = game.nextRank();
  const pct = next ? Math.min(100, ((s.xp - rank.xp) / (next.xp - rank.xp)) * 100) : 100;
  const [muted, setMuted] = useState(Sound.muted);

  return (
    <header id="topbar">
      {/* Logo */}
      <div className="topbar-logo" onClick={() => go("map")} role="button" tabIndex={0}
        onKeyDown={e => e.key === "Enter" && go("map")} aria-label="Home">
        <span className="logo-badge">CQ</span>
        <div className="logo-text">
          <span className="logo-title">CANDLE QUEST</span>
          <span className="logo-sub">ACADEMY</span>
        </div>
      </div>

      {/* Player chip */}
      <div className="player-chip">
        {/* Avatar crest */}
        <motion.span
          id="hud-avatar"
          dangerouslySetInnerHTML={{ __html: avatarSvg(s.avatar) }}
          whileHover={{ scale: 1.08, rotate: 2 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="hud-avatar-wrap"
        />

        {/* Player info */}
        <div className="player-info">
          <div id="hud-name">{s.name || "Trader"}</div>
          <div className="rank-label">{rank.name}</div>
          {/* XP bar */}
          <div className="xp-wrap">
            <div className="xp-bar">
              <motion.div
                id="hud-xp-fill"
                initial={{ width: 0 }}
                animate={{ width: pct + "%" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </div>
            <div className="xp-text">
              {next ? `${s.xp} XP — ${next.xp - s.xp} to ${next.name}` : `${s.xp} XP · MAX`}
            </div>
          </div>
        </div>

        {/* Mute toggle */}
        <motion.button
          className="mute-btn"
          title={muted ? "Unmute" : "Mute"}
          onClick={() => { Sound.toggle(); setMuted(Sound.muted); }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
        >
          {muted ? <IconMute /> : <IconVolume />}
        </motion.button>
      </div>
    </header>
  );
}
