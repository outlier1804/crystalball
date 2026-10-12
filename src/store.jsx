import { createContext, useContext, useState, useCallback } from "react";
import { Game, Profiles } from "./engine/game.js";

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

// Opened from a family link: go straight to the family's progress.
const arrivedByLink = typeof location !== "undefined" && /[#&]family=/.test(location.hash || "");

export function AppProvider({ children }) {
  // bump() forces a re-render after we mutate the Game singleton
  const [, force] = useState(0);
  const bump = useCallback(() => force((v) => v + 1), []);

  const [screen, setScreen] = useState(arrivedByLink ? "watch" : !Game.state.name ? "welcome" : Profiles.list().length > 1 ? "who" : "map");
  const [params, setParams] = useState({});
  // Same params again must not count as a change: a screen that is fading out is
  // re-rendered with the NEXT screen's params, and anything it does in response
  // would otherwise set state on every render (React's "too many re-renders").
  const go = useCallback((s, p = {}) => {
    setParams((prev) => {
      const a = Object.keys(prev), b = Object.keys(p);
      return a.length === b.length && a.every((k) => prev[k] === p[k]) ? prev : p;
    });
    setScreen(s);
  }, []);

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
