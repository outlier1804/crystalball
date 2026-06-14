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
    (emoji, title, text, celebrate) =>
      setQueue((q) => [...q, { emoji, title, text, celebrate }]),
    []
  );
  const closePopup = useCallback(() => setQueue((q) => q.slice(1)), []);

  return (
    <AppCtx.Provider
      value={{ game: Game, bump, screen, params, go, popup, queue, closePopup }}
    >
      {children}
    </AppCtx.Provider>
  );
}
