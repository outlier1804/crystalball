import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppProvider, useApp } from "./store.jsx";
import { Sensei } from "./engine/sensei.js";
import { Sound } from "./engine/audio.js";
import { Speak } from "./engine/speech.js";
import { Game } from "./engine/game.js";
import Rail from "./shell/Rail.jsx";
import Hud from "./shell/Hud.jsx";
import Popup from "./components/Popup.jsx";
import Welcome from "./screens/Welcome.jsx";
import Home from "./screens/Home.jsx";
import PathMap from "./screens/PathMap.jsx";
import Film from "./screens/Film.jsx";
import Help from "./screens/Help.jsx";
import Who from "./screens/Who.jsx";
import Words from "./screens/Words.jsx";
import Demo from "./screens/Demo.jsx";
import Lesson from "./screens/Lesson.jsx";
import Quiz from "./screens/Quiz.jsx";
import Dojo from "./screens/Dojo.jsx";
import Profile from "./screens/Profile.jsx";
import Report from "./screens/Report.jsx";
import Reflect from "./screens/Reflect.jsx";
import Playbook from "./screens/Playbook.jsx";
import Foundations from "./screens/Foundations.jsx";
import ForgeScreen from "./screens/Forge.jsx";

// "map" stays the id of the home screen: every step already ends with go("map").
const SCREENS = { welcome: Welcome, map: Home, path: PathMap, film: Film, help: Help, who: Who, words: Words, demo: Demo, lesson: Lesson, quiz: Quiz, dojo: Dojo, profile: Profile, report: Report, reflect: Reflect, playbook: Playbook, foundations: Foundations, forge: ForgeScreen };

// Screens where he is in the middle of ONE step. The side rail goes away and a
// single Quit button takes its place, so there is nothing to wander off to.
const FOCUS = new Set(["film", "demo", "lesson", "quiz", "foundations", "reflect", "playbook"]);

function Shell() {
  const { screen, params, go } = useApp();
  useEffect(() => { Sensei.onScreen(screen); document.body.dataset.screen = screen; }, [screen]);

  // The daily clock: count time while the tab is visible AND he has touched
  // something in the last minute and a half (a film playing counts as activity).
  // A tab left open on the couch must not read as forty minutes of study.
  const lastTouch = useRef(Date.now());
  useEffect(() => {
    const touch = () => { lastTouch.current = Date.now(); };
    const events = ["pointerdown", "keydown", "pointermove", "touchstart"];
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    const TICK = 5000;
    const id = setInterval(() => {
      if (document.hidden || !Game.state?.name) return;
      const playing = [...document.querySelectorAll("video")].some((v) => !v.paused && !v.ended);
      if (playing) lastTouch.current = Date.now();
      if (Date.now() - lastTouch.current < 90000) Game.tickActive(TICK);
    }, TICK);
    return () => { clearInterval(id); events.forEach((e) => window.removeEventListener(e, touch)); };
  }, []);
  const Cur = SCREENS[screen] || Home;
  const focus = FOCUS.has(screen) || (screen === "dojo" && !!params.missionId);
  const bare = screen === "welcome" || screen === "who";

  return (
    <div className={"shell" + (focus ? " focus" : "") + (bare ? " bare" : "")}>
      {!focus && !bare && <Rail />}
      <div className="stage">
        {!bare && (focus ? (
          <header className="focus-bar">
            <button className="quit-btn" onClick={() => { Sound.play("click"); Speak.stop(); go("map"); }}>✕ Quit</button>
          </header>
        ) : <Hud />)}
        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              className="screen-wrap"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              <Cur />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Popup />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
