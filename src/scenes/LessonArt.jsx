import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Shows the anime PNG if it exists; otherwise renders the fallback
// (the animated SVG scene, an emoji, or nothing). The image is hidden
// until it successfully loads, so a missing file never flashes a broken
// icon. Handles cached images (whose load event can fire before React
// attaches onLoad) by checking img.complete after mount.
export function LessonArt({ src, children, className = "lesson-art-img", wrapClassName = "lesson-art-wrap" }) {
  const [status, setStatus] = useState("loading"); // loading | ok | fail
  const imgRef = useRef(null);

  useEffect(() => {
    setStatus("loading");
    const img = imgRef.current;
    if (img && img.complete) {
      setStatus(img.naturalWidth > 0 ? "ok" : "fail");
    }
  }, [src]);

  if (!src) return children;

  return (
    <div className={wrapClassName}>
      {status !== "ok" && children}
      {status !== "fail" && (
        <motion.img
          ref={imgRef}
          src={src}
          alt=""
          className={className}
          style={{ display: status === "ok" ? "block" : "none" }}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={status === "ok" ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          onLoad={(e) => setStatus(e.currentTarget.naturalWidth > 0 ? "ok" : "fail")}
          onError={() => setStatus("fail")}
        />
      )}
    </div>
  );
}
