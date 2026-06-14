import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppProvider, useApp } from "./store.jsx";
import { Sensei } from "./engine/sensei.js";
import TopBar from "./components/TopBar.jsx";
import NavBar from "./components/NavBar.jsx";
import Popup from "./components/Popup.jsx";
import Welcome from "./screens/Welcome.jsx";
import StoryMap from "./screens/StoryMap.jsx";
import Lesson from "./screens/Lesson.jsx";
import Quiz from "./screens/Quiz.jsx";
import Dojo from "./screens/Dojo.jsx";
import Profile from "./screens/Profile.jsx";
import Report from "./screens/Report.jsx";
import Reflect from "./screens/Reflect.jsx";
import Playbook from "./screens/Playbook.jsx";

const SCREENS = { welcome: Welcome, map: StoryMap, lesson: Lesson, quiz: Quiz, dojo: Dojo, profile: Profile, report: Report, reflect: Reflect, playbook: Playbook };

function Shell() {
  const { screen } = useApp();
  useEffect(() => { Sensei.onScreen(screen); }, [screen]);
  const Cur = SCREENS[screen] || StoryMap;
  return (
    <>
      <TopBar />
      <NavBar />
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          >
            <Cur />
          </motion.div>
        </AnimatePresence>
      </main>
      <Popup />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
