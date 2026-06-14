import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { Game } from "./engine/game.js";
import "./engine/fx.js";          // side-effect: mounts the FX particle canvases
import "./engine/sensei.js";      // side-effect: mounts the floating Sensei companion
import App from "./App.jsx";

Game.load();
createRoot(document.getElementById("root")).render(<App />);
