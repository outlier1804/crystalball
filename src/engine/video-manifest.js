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
  "found-s6",
  "found-s7",
  "found-s8",
  "found-s9",
  "found-s10",
  "found-s11",
  "howto-bread",
  "howto-dojo",
  "howto-koins",
  "howto-play",
  "howto-shield",
  "howto-stuck",
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

/* The ten trading lessons — a real curriculum, deliberately ordered risk-first:
 * nothing about picking winners until lesson 06. Longer than the guides (~40s vs
 * ~15s) and meant to be watched in sequence, which is why they are numbered and
 * kept on their own shelf rather than mixed in with the how-to films.
 *
 * The running example is identical across all ten so the arithmetic compounds:
 * a $2,000 account, 1% = $20 risk, a $10 stock, a $0.50 stop, 40 shares. */
export const LESSONS = [
  { id: "lesson-01", n: "01", label: "What a stop loss is" },
  { id: "lesson-02", n: "02", label: "The 1% rule" },
  { id: "lesson-03", n: "03", label: "What a share actually is" },
  { id: "lesson-04", n: "04", label: "How many shares to buy" },
  { id: "lesson-05", n: "05", label: "Wrong a lot, still winning" },
  { id: "lesson-06", n: "06", label: "Floors and ceilings" },
  { id: "lesson-07", n: "07", label: "Trend" },
  { id: "lesson-08", n: "08", label: "The setup" },
  { id: "lesson-09", n: "09", label: "The journal" },
  { id: "lesson-10", n: "10", label: "Why most people lose" },
];
