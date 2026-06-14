import { useState } from "react";
import { useApp } from "../store.jsx";
import { avatarSvg } from "../engine/characters.js";
import { Sound } from "../engine/audio.js";

export default function TopBar() {
  const { game } = useApp();
  const s = game.state;
  const rank = game.rank();
  const next = game.nextRank();
  const pct = next ? Math.min(100, ((s.xp - rank.xp) / (next.xp - rank.xp)) * 100) : 100;
  const [muted, setMuted] = useState(Sound.muted);

  return (
    <header id="topbar">
      <div className="logo">🕯️ <span>Candle Quest Academy</span></div>
      <div className="player-chip">
        <button className="ghost-btn mute" title="Sound on/off"
          onClick={() => { Sound.toggle(); setMuted(Sound.muted); }}>
          {muted ? "🔇" : "🔊"}
        </button>
        <span id="hud-avatar" dangerouslySetInnerHTML={{ __html: avatarSvg(s.avatar) }} />
        <div className="player-info">
          <div id="hud-name">{s.name || "Trader"}</div>
          <div className="rank-label">{rank.emoji} {rank.name}</div>
        </div>
        <div className="xp-wrap">
          <div className="xp-bar"><div id="hud-xp-fill" style={{ width: pct + "%" }} /></div>
          <div className="xp-text">
            {next ? `${s.xp} XP · ${next.xp - s.xp} to ${next.name}` : `${s.xp} XP · MAX RANK!`}
          </div>
        </div>
      </div>
    </header>
  );
}
