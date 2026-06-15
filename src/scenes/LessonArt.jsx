import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Shows the anime PNG if it exists; otherwise renders the fallback
// (the animated SVG scene, or nothing). The image is hidden until it
// successfully loads, so a missing file never flashes a broken icon.
export function LessonArt({ src, children, className = "lesson-art-img", wrapClassName = "lesson-art-wrap" }) {
  const [status, setStatus] = useState("loading"); // loading | ok | fail

  // reset when the src changes (new lesson)
  useEffect(() => { setStatus("loading"); }, [src]);

  if (!src) return children;

  return (
    <div className={wrapClassName}>
      {status !== "ok" && children}
      {status !== "fail" && (
        <motion.img
          src={src}
          alt=""
          className={className}
          style={{ display: status === "ok" ? "block" : "none" }}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={status === "ok" ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          onLoad={() => setStatus("ok")}
          onError={() => setStatus("fail")}
        />
      )}
    </div>
  );
}
