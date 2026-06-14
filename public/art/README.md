# 🎨 Candle Quest Academy — Art Manifest

Drop generated PNGs here using the **exact filenames** below. Each one
auto-appears in its lesson (replacing the animated SVG scene). If a file is
missing, the lesson falls back to the SVG scene — so the app always works.

- **Format:** square-ish PNG, transparent background where possible
- **Size:** 1024×1024 (or 2048×2048), clean edges, **no baked-in text**
- Served at `/art/...` (this folder is Vite's `public/`)

## Style prefix (paste before every prompt)
> 2D anime comic-panel illustration, bold thick black outlines, vibrant
> saturated cel-shading, dramatic kid-friendly expressions, slightly chibi
> proportions, trading/finance theme, clean square composition, no text.
> Characters: **KAI** (spiky black hair, grey hoodie), **HANA** (purple hair,
> sunglasses, red-pink hoodie), **SENSEI** (straw hat, sunglasses, robe),
> **KITSU** (blue-white fox spirit). SCENE: …

---

## characters/  (reference sheets — not yet wired into lessons)
| file | prompt scene |
|---|---|
| `characters/kai.png` | Kai reference sheet: front + 3/4 views, expression strip |
| `characters/hana.png` | Hana reference sheet, sunglasses on |
| `characters/sensei.png` | Sensei reference sheet, straw hat + teaching gestures |
| `characters/kitsu.png` | Kitsu fox: sitting, leaping, pointing with tail |

## bread/  (Arc 10 — the B.R.E.A.D method)
| file | appears on | prompt scene |
|---|---|---|
| `bread/flowchart.png` | Arc 10 intro + bread checklist scene | all three characters around a glowing bread-loaf decision map |
| `bread/behavior.png` | Arc 10 "B — Behavior" | Sensei + Kai marking levels on a big chart, crown glow over the screen |
| `bread/reaction.png` | Arc 10 "R — Reaction" | Kai watching a candle bounce off a glowing level line, hourglass, candle closing |
| `bread/execution.png` | Arc 10 "E — Execution" | Hana pressing a glowing button as price breaks a small box (range breakout) |
| `bread/alignment.png` | Arc 10 "A — Alignment" | two stacked chart screens (big + small) arrows the SAME way, ⚡ between |
| `bread/discipline.png` | Arc 10 "D — Discipline" | Kai calm/meditating beside a "3 trades" counter + shield, ignoring a flashing chart |

## concepts/  (Arcs 1–9 lesson art)
| file | appears on | prompt scene |
|---|---|---|
| `concepts/price-goal.png` | Arc 7 "price has a goal" | a coin pulled by a magnet toward a glowing gap (DEM) |
| `concepts/dem-gap.png` | Arc 7 gap scene / Arc 10 respected | three candles with a glowing empty gap in the middle |
| `concepts/gas-close.png` | Arc 7 bodies-first / gas | price dipping into a gap labeled ⛽ then popping back out |
| `concepts/bounce-reject.png` | Arc 10 "only bounces & rejects" | a price ball bouncing off a floor/ceiling level |
| `concepts/break-retest.png` | Arc 7 breakout scene | price smashing a wall, then tapping it from the other side |
| `concepts/sweep.png` | Arc 9 liquidity sweep | price spiking into a glowing pool above a line, then snapping back |
| `concepts/candle-battle.png` | Arc 2 candles | bull vs bear with a giant candle between them |
| `concepts/trend.png` | Arc 3 trend | Kai surfing a rising vs falling wave |
| `concepts/stop-loss.png` | Arc 4 stop-loss | Kai blocking a falling price with a glowing shield |
| `concepts/fomo.png` | Arc 5 FOMO | a phone-demon tempting Kai (rocket) while he stays calm (ninja) |
| `concepts/hype-demon.png` | Arc 8 hype demon | flashy "make $$$ fast!" screen with red-flag warnings |
| `concepts/volatility-dragon.png` | Arc 6 boss | stormy chart, Kai bracing against a volatility dragon |

## ui/  &  badges/  (polish — not yet wired)
| file | prompt scene |
|---|---|
| `ui/hero.png` | title splash, all characters together |
| `ui/map-bg.png` | winding road of 10 floating islands |
| `ui/win.png` / `ui/lose.png` / `ui/levelup.png` | confetti win / gentle try-again / level-up burst |
| `badges/*.png` | circular rank medallions (one per rank) |
