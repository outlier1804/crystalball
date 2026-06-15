// Optional anime art assets.
//
// Drop a PNG into public/art/… using the exact filename below and it will
// automatically appear in the matching lesson, replacing the animated SVG
// scene. If the file isn't there yet, the lesson gracefully falls back to
// the SVG scene (or nothing) — so the app always works, art or not.
//
// See public/art/README.md for the full filename → prompt manifest.

const BASE = "/art";

// Explicit per-lesson art key (set on a lesson via `art: "…"`).
export const ART = {
  // B.R.E.A.D set
  "bread-behavior":   `${BASE}/bread/behavior.png`,
  "bread-reaction":   `${BASE}/bread/reaction.png`,
  "bread-execution":  `${BASE}/bread/execution.png`,
  "bread-alignment":  `${BASE}/bread/alignment.png`,
  "bread-discipline": `${BASE}/bread/discipline.png`,
  "bread-flowchart":  `${BASE}/bread/flowchart.png`,
  // concepts
  "price-goal":       `${BASE}/concepts/price-goal.png`,
  "dem-gap":          `${BASE}/concepts/dem-gap.png`,
  "gas-close":        `${BASE}/concepts/gas-close.png`,
  "bounce-reject":    `${BASE}/concepts/bounce-reject.png`,
  "break-retest":     `${BASE}/concepts/break-retest.png`,
  "sweep":            `${BASE}/concepts/sweep.png`,
  "candle-battle":    `${BASE}/concepts/candle-battle.png`,
  "trend":            `${BASE}/concepts/trend.png`,
  "stop-loss":        `${BASE}/concepts/stop-loss.png`,
  "fomo":             `${BASE}/concepts/fomo.png`,
  "hype-demon":       `${BASE}/concepts/hype-demon.png`,
  "volatility-dragon":`${BASE}/concepts/volatility-dragon.png`,
};

// Animated-scene key (lesson.scene) → art key, so concept scenes light up
// automatically once their PNG exists — no per-lesson edits needed.
export const SCENE_ART = {
  goal:       "price-goal",
  gap:        "dem-gap",
  sweep:      "sweep",
  candles:    "candle-battle",
  trend:      "trend",
  shield:     "stop-loss",
  fomo:       "fomo",
  volatility: "volatility-dragon",
  breakout:   "break-retest",
  respected:  "dem-gap",
  bread:      "bread-flowchart",
};

// Resolve the art file for a lesson: explicit `art:` wins, else its scene.
export function artSrcFor(lesson) {
  if (lesson.art && ART[lesson.art]) return ART[lesson.art];
  if (lesson.scene && SCENE_ART[lesson.scene]) return ART[SCENE_ART[lesson.scene]];
  return null;
}

// Lesson speaker portraits (characters/). Falls back to the SVG portrait.
export const PORTRAIT_ART = {
  "Sensei Hoshi":  `${BASE}/characters/sensei.png`,
  "Kitsu the Fox": `${BASE}/characters/kitsu.png`,
  "Rival Kazuo":   `${BASE}/characters/kazuo.png`,
};
export const portraitSrc = (name) => PORTRAIT_ART[name] || null;

// UI splash art (ui/). Falls back to the current emoji/markup.
export const UI = {
  hero:    `${BASE}/ui/hero.png`,
  mapBg:   `${BASE}/ui/map-bg.png`,
  win:     `${BASE}/ui/win.png`,
  lose:    `${BASE}/ui/lose.png`,
  levelup: `${BASE}/ui/levelup.png`,
};

// Rank medallions (badges/rank-1.png … by rank index) and achievement
// badges (badges/badge-<id>.png). Both fall back to their emoji.
export const rankArt  = (index) => `${BASE}/badges/rank-${index + 1}.png`;
export const badgeArt = (id)    => `${BASE}/badges/badge-${id}.png`;

