// Regenerate src/engine/video-manifest.js from what is actually in public/vid.
//
// Hand-maintaining that list got it wrong immediately: it listed twelve lesson
// clips that were still rendering, so the game would have shipped twelve buttons
// that flash and close. The filesystem is the only honest source, so read it.
//
//   node tools/gen-video-manifest.mjs     # run after any render, before committing
//
// Clips are code-drawn by projects/motion-explainer (render-cq-*.sh installs the
// mp4s here). Ids map 1:1 to /vid/<id>.mp4.
//
// It also probes each clip for an AUDIO stream and writes the NARRATED set.
// SceneVideo mutes a clip unless it is in that set, so this cannot be hand-kept
// either: mark a silent clip as narrated and it plays mute-less silence; miss a
// narrated one and the voice never plays. ffprobe is the only honest answer.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const OUT = "src/engine/video-manifest.js";
const ids = readdirSync("public/vid")
  .filter((f) => f.endsWith(".mp4"))
  .map((f) => f.replace(/\.mp4$/, ""))
  .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

const narrated = ids.filter((id) => {
  try {
    const out = execFileSync("ffprobe", [
      "-v", "error", "-select_streams", "a:0",
      "-show_entries", "stream=codec_type", "-of", "csv=p=0",
      `public/vid/${id}.mp4`,
    ], { encoding: "utf8" });
    return out.trim().startsWith("audio");
  } catch {
    return false;   // no ffprobe or no audio stream -> treat as silent, stay muted
  }
});

let src = readFileSync(OUT, "utf8");
src = src.replace(
  /export const VIDEOS = new Set\(\[[\s\S]*?\]\);/,
  `export const VIDEOS = new Set([\n${ids.map((id) => `  "${id}",`).join("\n")}\n]);`,
);
src = src.replace(
  /export const NARRATED = new Set\(\[[\s\S]*?\]\);/,
  `export const NARRATED = new Set([\n${narrated.map((id) => `  "${id}",`).join("\n")}\n]);`,
);
writeFileSync(OUT, src);
console.log(`${OUT}: ${ids.length} clips, ${narrated.length} narrated`);
