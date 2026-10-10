import { useEffect, useRef, useState } from "react";
import { useApp } from "../store.jsx";
import { avatarSvg } from "../engine/characters.js";
import { Sound } from "../engine/audio.js";
import { Rewards } from "../engine/rewards.js";
import { Speak } from "../engine/speech.js";

// One thin strip: who you are, how far to the next rank, and the two audio
// switches. Everything else that used to live up here moved to "Me".
export default function Hud() {
  const { game, go } = useApp();
  const s = game.state;
  const rank = game.rank();
  const next = game.nextRank();
  const pct = next ? Math.min(100, ((s.xp - rank.xp) / (next.xp - rank.xp)) * 100) : 100;
  const [muted, setMuted] = useState(Sound.muted);
  const [reading, setReading] = useState(Speak.on);
  const streak = Rewards.streak();

  // Count XP up to its new value rather than snapping.
  const [shown, setShown] = useState(s.xp);
  const prev = useRef(s.xp);
  useEffect(() => {
    const from = prev.current, to = s.xp;
    prev.current = to;
    if (from === to) { setShown(to); return; }
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const k = Math.min(1, (t - start) / 700);
      setShown(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [s.xp]);

  return (
    <header className="hud">
      <button className="hud-me" onClick={() => go("profile")}>
        <span id="hud-avatar" className="hud-face" dangerouslySetInnerHTML={{ __html: avatarSvg(s.avatar) }} />
        <span className="hud-who">
          <span className="hud-name">{s.name || "Trader"}</span>
          <span className="hud-rank">{rank.emoji} {rank.name}</span>
        </span>
      </button>
      <div className="hud-xp" title={next ? `${Math.max(0, next.xp - shown)} XP to ${next.name}` : "Top rank"}>
        <div className="hud-xp-bar"><div id="hud-xp-fill" style={{ width: pct + "%" }} /></div>
        <div className="hud-xp-text">{shown} XP{next ? ` · ${Math.max(0, next.xp - shown)} to ${next.name}` : " · top rank"}</div>
      </div>
      <div className="hud-pills">
        <span className={"hud-pill" + (streak.count > 0 ? " lit" : "")} title="Days in a row">🔥 {streak.count || 0}</span>
        <button className="hud-pill" title="Scrolls — spend them on Power-Ups" onClick={() => go("forge")}>📜 {s.scrolls || 0}</button>
        <button className={"hud-pill btn" + (muted ? " off" : "")} title={muted ? "Sound is off" : "Sound is on"}
          onClick={() => { Sound.toggle(); setMuted(Sound.muted); }}>{muted ? "🔇" : "🔊"}</button>
        <button className={"hud-pill btn" + (reading ? " lit" : "")} title="Read everything out loud"
          onClick={() => { Sound.play("click"); setReading(Speak.toggle()); }}>🗣️ {reading ? "On" : "Off"}</button>
      </div>
    </header>
  );
}
