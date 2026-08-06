import { useState } from "react";
import SceneVideo, { videoEnabled } from "./SceneVideo.jsx";
import { Sound } from "../engine/audio.js";
import { lessonParts } from "../engine/video-manifest.js";
import LessonCheck from "./LessonCheck.jsx";
import { checkFor } from "../engine/lesson-checks.js";

/* One trading lesson, played as short narrated chunks with a choice between them.
 *
 * WHY NOT ONE BUTTON PER PART: ten lessons at 2-4 parts each is thirty-odd
 * buttons. A wall of choices is its own attention tax, and it hides the fact that
 * the parts are ordered. One button per LESSON; parts handled inside.
 *
 * WHY THE PROMPT BETWEEN PARTS: autoplaying into the next chunk is just the long
 * film again with extra steps. Stopping to ask gives him a finished thing every
 * ~25 seconds, makes continuing his decision rather than the app's, and makes
 * stopping early a normal outcome instead of an abandoned video.
 *
 * Progress is deliberately NOT persisted or scored. Watching is free and
 * repeatable (same rule as VideoButton) — a completion state would turn "I'd like
 * to see that again" into "I already did that one".
 */
export default function LessonPlayer({ n, label, className = "" }) {
  const parts = lessonParts(n);
  const [at, setAt] = useState(-1);        // index of the part on screen, -1 = closed
  const [gate, setGate] = useState(false);  // showing the between-parts prompt
  const [asked, setAsked] = useState(false); // the part's check question is answered
  if (!parts.length || !videoEnabled()) return null;

  const last = at >= parts.length - 1;

  function close() { setAt(-1); setGate(false); setAsked(false); }
  function start() { Sound.play("click"); setAt(0); setGate(false); setAsked(false); }
  function keepGoing() { Sound.play("click"); setAt(at + 1); setGate(false); setAsked(false); }

  return (
    <>
      <button className={"big-btn small watch-btn " + className} onClick={start}>
        {n} · {label}
        {parts.length > 1 && <span className="lesson-parts"> · {parts.length} parts</span>}
      </button>

      {at >= 0 && !gate && (
        <div className="watch-overlay">
          {/* key forces a fresh <video> per part, so part 2 does not inherit
              part 1's playback state and silently skip. */}
          <SceneVideo key={parts[at]} id={parts[at]}
                      onDone={() => { setGate(true); setAsked(false); }} />
        </div>
      )}

      {gate && (
        <div className="watch-overlay lesson-gate" onClick={close}>
          <div className="lesson-gate-card" onClick={(e) => e.stopPropagation()}>
            <div className="lesson-gate-done">
              Part {at + 1} of {parts.length} done ✅
            </div>
            <div className="lesson-gate-title">{label}</div>

            {/* Ask before offering the exit. Retrieval is worth most while the film
                is still in working memory, and putting it before the buttons means
                he answers rather than tapping straight past it. Parts with no
                question written fall through untouched. */}
            {!asked && checkFor(parts[at]) ? (
              <LessonCheck partId={parts[at]} onDone={() => setAsked(true)} />
            ) : (
            last ? (
              <button className="big-btn" onClick={close}>
                Lesson finished — back to the map
              </button>
            ) : (
              <>
                <button className="big-btn" onClick={keepGoing}>
                  ▶ Keep going — part {at + 2}
                </button>
                <button className="big-btn small ghost" onClick={close}>
                  Stop here, that's plenty
                </button>
              </>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
