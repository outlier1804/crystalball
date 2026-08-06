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

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const OUT = "src/engine/video-manifest.js";
const ids = readdirSync("public/vid")
  .filter((f) => f.endsWith(".mp4"))
  .map((f) => f.replace(/\.mp4$/, ""))
  .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

const src = readFileSync(OUT, "utf8");
const list = ids.map((id) => `  "${id}",`).join("\n");
const next = src.replace(
  /export const VIDEOS = new Set\(\[[\s\S]*?\]\);/,
  `export const VIDEOS = new Set([\n${list}\n]);`,
);
writeFileSync(OUT, next);
console.log(`${OUT}: ${ids.length} clips`);
