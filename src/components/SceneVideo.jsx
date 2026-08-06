import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sound } from "../engine/audio.js";
import { FX } from "../engine/fx.js";
import { narrated } from "../engine/video-manifest.js";
import { Game } from "../engine/game.js";

// Plays a stitched scene film from public/vid/<id>.mp4 (built by
// tools/scenegen). Three rules it never breaks:
//
//   1. NO FILE, NO PROBLEM — a missing or broken video fires onDone immediately,
//      so the game behaves exactly as it did before any video existed. Video is
//      additive; it can never sit between him and a lesson.
//   2. ALWAYS SKIPPABLE — one tap, any time. He'll watch a 17-second opener
//      twice and then want past it forever, and being trapped in a cutscene is
//      how a kid learns to dread opening a chapter.
//   3. SILENT — clips are generated without audio; the game's own score plays
//      over the top. Autoplay with sound is blocked on mobile anyway.
//
// 2026-08-06: real clips landed, so this is on. All ten arc intro films are now
// rendered locally by projects/motion-explainer (code-drawn motion graphics on a
// deterministic seek(t) timeline, $0 per video) rather than bought from an AI video
// API — the reason this flag sat false for weeks. Sources: motion-explainer/
// lessons/cq-arc<N>-intro.json; re-render with ./render-cq-arcs.sh.
const DEFAULT_ON = true;

export function videoEnabled() {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search);
  if (q.has("vid")) return q.get("vid") !== "0";
  return DEFAULT_ON;
}

export default function SceneVideo({ id, onDone, loop = false, className = "" }) {
  const ref = useRef(null);
  const [gone, setGone] = useState(false);
  // true when the browser refused sound and we fell back to muted playback
  const [needsTap, setNeedsTap] = useState(false);
  const done = useRef(false);

  function finish() {
    if (done.current) return;
    done.current = true;
    setGone(true);
    onDone?.();
  }

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // Autoplay can be refused for two very different reasons, and they need very
    // different answers:
    //
    //   1. the file is broken/absent          -> close, same as no file at all
    //   2. autoplay WITH SOUND is not allowed -> play it muted instead
    //
    // This used to do (1) for both, which was correct while every clip was silent.
    // Narrated clips are unmuted, so a sound-policy refusal started closing the film
    // the instant it opened — indistinguishable from "the audio is broken".
    const attempt = () => {
      const pr = v.play?.();
      if (pr?.catch) {
        pr.catch(() => {
          if (!v.muted) {          // (2) keep the film, lose the sound, offer it back
            v.muted = true;
            setNeedsTap(true);
            const retry = v.play?.();
            if (retry?.catch) retry.catch(() => finish());
          } else {
            finish();              // (1) muted playback failed too — genuinely broken
          }
        });
      }
    };
    attempt();
    const bail = setTimeout(() => { if (v.readyState === 0) finish(); }, 4000);

    // Watch time, measured from the element's own playback position rather than a
    // wall clock: pausing, backgrounding the tab or walking away must not read as
    // studying. Rewatches accumulate, which is the point — a part he replays four
    // times is the single clearest signal of where he is stuck.
    let last = 0, watched = 0;
    const onTime = () => {
      const now = v.currentTime;
      const d = now - last;
      if (d > 0 && d < 1.5) watched += d;   // ignore seeks and gaps
      last = now;
    };
    v.addEventListener("timeupdate", onTime);

    return () => {
      clearTimeout(bail);
      v.removeEventListener("timeupdate", onTime);
      if (watched > 0.5) Game.recordTime("clip", id, Math.round(watched * 1000));
    };
  }, [id]);

  if (gone && !loop) return null;

  return (
    <motion.div className={"scene-video " + className}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <video
        ref={ref}
        src={`/vid/${id}.mp4`}
        poster={`/vid/${id}.jpg`}
        // Narrated films carry a real voice track and must NOT be muted — a silent
        // captioned film makes a slow reader keep pace with the animation, which is
        // the exact problem the narration exists to remove. Everything else is still
        // silent, where muted vs not makes no audible difference.
        // Safe because these play on a tap: browsers only block autoplay-with-sound
        // when there was no user gesture, and arc intros are opened by tapping a chapter.
        muted={!narrated(id)}
        playsInline
        loop={loop}
        preload="auto"
        onEnded={loop ? undefined : finish}
        onError={finish}
      />
      {/* A tap is a fresh user gesture, which is exactly what the sound policy
          wanted — so unmuting here reliably works when autoplay-with-sound did not.
          Only shown when we actually fell back; never on a genuinely silent clip. */}
      {needsTap && (
        <button className="scene-unmute" onClick={(e) => {
          e.stopPropagation();
          const v = ref.current;
          if (v) { v.muted = false; v.play?.(); }
          setNeedsTap(false);
        }}>
          🔇 Tap for sound
        </button>
      )}
      {!loop && (
        <button className="scene-skip" onClick={() => { Sound.play("click"); FX.flash("#000", 220); finish(); }}>
          Skip ▶▶
        </button>
      )}
    </motion.div>
  );
}
