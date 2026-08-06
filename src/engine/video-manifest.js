// Which explainer clips actually exist in public/vid.
//
// GENERATED — run `node tools/gen-video-manifest.mjs` after any render rather
// than editing the list by hand. The browser can't stat() a file and a HEAD
// request per button would fire a dozen requests per screen, so the game needs
// this list to know what to offer; hand-maintaining it meant offering buttons
// for clips that were still rendering. Everything below the list is hand-written
// and safe to edit.
//
// Ids map 1:1 to /vid/<id>.mp4.
export const VIDEOS = new Set([
  "arc1-intro",
  "arc2-intro",
  "arc3-intro",
  "arc4-intro",
  "arc5-intro",
  "arc6-intro",
  "arc7-intro",
  "arc8-intro",
  "arc9-intro",
  "arc10-intro",
  "found-s0",
  "found-s1",
  "found-s2",
  "found-s3",
  "found-s4",
  "found-s5",
  "howto-play",
]);

export const hasVideo = (id) => VIDEOS.has(id);

// The guide menu, in the order a new player needs them.
export const GUIDES = [
  { id: "howto-play", emoji: "🗺️", label: "How the game works" },
  { id: "howto-dojo", emoji: "⚔️", label: "How to place a trade" },
  { id: "howto-shield", emoji: "🛡️", label: "What the shield does" },
  { id: "howto-koins", emoji: "🪙", label: "Koins, XP and ranks" },
  { id: "howto-bread", emoji: "🍞", label: "The B.R.E.A.D checklist" },
  { id: "howto-stuck", emoji: "🤔", label: "When you're stuck" },
];
