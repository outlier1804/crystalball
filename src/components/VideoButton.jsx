import { useState } from "react";
import SceneVideo, { videoEnabled } from "./SceneVideo.jsx";
import { Sound } from "../engine/audio.js";

// A button that plays a short motion-graphics explainer on demand.
//
// Different job from SceneVideo's usual one: the arc intro films play AT you when
// a chapter opens. These are pulled — he taps because he wants the idea shown
// rather than written. So the rules differ slightly:
//
//   * If the clip file is missing, the button does not render at all. A dead
//     button that flashes and closes is worse than no button (SceneVideo's
//     "no file, no problem" rule handles the flash, but he still tapped nothing).
//     We can't stat() the file from here, so `available` is passed by the caller
//     from a manifest — see engine/video-manifest.js.
//   * Watching is free and repeatable. No XP, no limit, no "are you sure".
//
// Clips are code-drawn locally by projects/motion-explainer ($0 per video,
// silent, deterministic) — see lessons/cq-found-*.json and cq-howto-*.json.
export default function VideoButton({ id, label = "▶ Watch it", className = "", available = true }) {
  const [playing, setPlaying] = useState(false);
  if (!available || !videoEnabled()) return null;

  return (
    <>
      <button
        className={"big-btn small watch-btn " + className}
        onClick={() => { Sound.play("click"); setPlaying(true); }}
      >
        {label}
      </button>
      {playing && (
        <div className="watch-overlay" onClick={() => setPlaying(false)}>
          <SceneVideo id={id} onDone={() => setPlaying(false)} />
        </div>
      )}
    </>
  );
}
