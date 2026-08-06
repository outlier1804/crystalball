import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sound } from "../engine/audio.js";
import { FX } from "../engine/fx.js";

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
// While the AI clips are unbought, the only file present is a stock-footage
// stand-in, so playback is off unless the URL says ?vid=1. Flip DEFAULT_ON to
// true the day real generated clips land in public/vid.
const DEFAULT_ON = false;

export function videoEnabled() {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search);
  if (q.has("vid")) return q.get("vid") !== "0";
  return DEFAULT_ON;
}

export default function SceneVideo({ id, onDone, loop = false, className = "" }) {
  const ref = useRef(null);
  const [gone, setGone] = useState(false);
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
    // Autoplay can still be refused (low-power mode, strict settings) — treat a
    // refusal exactly like a missing file rather than showing a frozen frame.
    const p = v.play?.();
    if (p?.catch) p.catch(() => finish());
    const bail = setTimeout(() => { if (v.readyState === 0) finish(); }, 4000);
    return () => clearTimeout(bail);
  }, [id]);

  if (gone && !loop) return null;

  return (
    <motion.div className={"scene-video " + className}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <video
        ref={ref}
        src={`/vid/${id}.mp4`}
        poster={`/vid/${id}.jpg`}
        muted
        playsInline
        loop={loop}
        preload="auto"
        onEnded={loop ? undefined : finish}
        onError={finish}
      />
      {!loop && (
        <button className="scene-skip" onClick={() => { Sound.play("click"); FX.flash("#000", 220); finish(); }}>
          Skip ▶▶
        </button>
      )}
    </motion.div>
  );
}
