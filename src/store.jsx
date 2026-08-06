import { createContext, useContext, useState, useCallback } from "react";
import { Game } from "./engine/game.js";

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }) {
  // bump() forces a re-render after we mutate the Game singleton
  const [, force] = useState(0);
  const bump = useCallback(() => force((v) => v + 1), []);

  const [screen, setScreen] = useState(Game.state.name ? "map" : "welcome");
  const [params, setParams] = useState({});
  const go = useCallback((s, p = {}) => { setParams(p); setScreen(s); }, []);

  // queued reward popups (shown one at a time)
  const [queue, setQueue] = useState([]);
  const popup = useCallback(
    (emoji, title, text, celebrate, stinger) =>
      setQueue((q) => [...q, { emoji, title, text, celebrate, stinger }]),
    []
  );
  // A reward chest is just a popup that renders itself differently — one queue,
  // so a chest can never land on top of a rank-up banner.
  const chest = useCallback(
    (kind = "wood", title = "Reward chest!", text = "") =>
      setQueue((q) => [...q, { chest: kind, title, text, emoji: "🎁" }]),
    []
  );

  const closePopup = useCallback(() => setQueue((q) => q.slice(1)), []);

  return (
    <AppCtx.Provider
      value={{ game: Game, bump, screen, params, go, popup, chest, queue, closePopup }}
    >
      {children}
    </AppCtx.Provider>
  );
}
