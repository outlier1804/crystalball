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

## characters/  (lesson speaker portraits — WIRED, round crop)
These appear as the round speaker portrait in lessons. A **bust/face crop**
works best (they're shown in a circle). Falls back to the SVG portrait.
| file | appears as | prompt scene |
|---|---|---|
| `characters/sensei.png` | Sensei portrait (lessons) | Sensei bust, straw hat + sunglasses, calm smile |
| `characters/kitsu.png` | Kitsu portrait (lessons) | Kitsu fox-spirit head/bust, friendly |
| `characters/kazuo.png` | Kazuo portrait (lessons) | grizzled rival trader bust, smirking |
| `characters/kai.png` | Kai hero-select crest + profile avatar | single hero pose, full body, transparent bg |
| `characters/hana.png` | Hana hero-select crest + profile avatar | single hero pose, full body, transparent bg |

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

## ui/  (WIRED)
| file | appears as | prompt scene |
|---|---|---|
| `ui/hero.png` | Welcome screen splash | title splash, all characters together |
| `ui/map-bg.png` | Quest Map faint backdrop | winding road of 10 floating islands |
| `ui/win.png` | mission complete / perfect quiz / badge popups | confetti celebration burst |
| `ui/lose.png` | "mission not cleared" popup | gentle try-again / encouraging |
| `ui/levelup.png` | RANK UP! popups | dramatic level-up burst |

## badges/  (WIRED — Profile screen)
Rank medallions show next to the rank name; badge medallions fill the badge grid.
Circular crest style, transparent background. Falls back to emoji.
| file | appears as |
|---|---|
| `badges/rank-1.png` … `badges/rank-8.png` | rank medallion (🐣→🍞, in rank order) |
| `badges/badge-first-trade.png` | First Steps badge 👣 |
| `badges/badge-shield.png` | Shield Bearer 🛡️ |
| `badges/badge-green-day.png` | Green Day 🌞 |
| `badges/badge-quiz-ace.png` | Quiz Ace 🎯 |
| `badges/badge-scholar.png` | Dojo Scholar 📚 |
| `badges/badge-patient.png` | Patient Ninja 🧘 |
| `badges/badge-dragon.png` | Dragon Slayer 🐉 |
| `badges/badge-strategist.png` | Strategist 📐 |
| `badges/badge-scientist.png` | True Scientist 🔬 |
| `badges/badge-hype-slayer.png` | Hype Slayer 🚩 |
| `badges/badge-pool-hunter.png` | Pool Hunter 💧 |
| `badges/badge-playbook.png` | Playbook Trader 🍞 |

---

## v4 art slots (2026-10-11) — fights, cards, episodes

Everything below already works with art drawn in code. Each file is optional:
drop it in with the exact name and it replaces the drawn version, no code change.
Use the **style prefix** at the top of this file before every prompt, and attach
`concepts/candle-battle.png` and `characters/kai.png` as style references so the
new art matches what is already in the game.

### fighters/  (the battle screens — do these first, they are seen the most)
Transparent background, full body, **facing RIGHT**, feet at the bottom edge,
about 1024 px tall, nothing cropped. The game mirrors the right-hand fighter.
| file | prompt scene |
|---|---|
| `fighters/bull.png` | A heroic green bull martial artist, champion of the BUYERS: horns, green karate gi, gold belt, fists raised in a fighting stance, determined grin, glowing green energy on the fists. Single character, full body, facing right, transparent background. |
| `fighters/bear.png` | A tough brown bear martial artist, champion of the SELLERS: red karate gi, black belt, fists raised in a fighting stance, fierce scowl, glowing red energy on the fists. Single character, full body, facing right, transparent background. |
| `fighters/hunter.png` | THE STOP HUNTER, a sneaky shadow ninja villain: dark purple hood and mask, glowing yellow eyes, long red scarf, a sack of gold coins over one shoulder, crouched and reaching forward to grab. Single character, full body, facing right, transparent background. Menacing but kid-friendly. |

### cards/  (technique cards — square, the art fills the card's picture window)
`cards/<id>.png`, 1024×1024, no text. Ids and scenes:
| id | scene |
|---|---|
| `body` | one fat glowing green candlestick, the bull standing proudly on top of it |
| `wick` | a candlestick with a very long thin wick, the bull being pushed back down from the top by the bear |
| `hammer` | a hammer-shaped candlestick (small body on top, long wick below) smashing down like a war hammer, green shockwave |
| `shooter` | a shooting-star candlestick (small body at the bottom, long wick above) streaking across a night sky |
| `doji` | the bull and the bear locked in a perfectly even arm-wrestle over a cross-shaped candle |
| `engulfer` | a huge green candle swallowing a small red candle like a wave |
| `close` | Kai calmly watching an hourglass run out beside a half-formed candle |
| `support` | price bouncing off a solid stone floor, the bull holding the floor up |
| `resistance` | price hitting a glass ceiling, the bear pushing down from above |
| `flip` | a ceiling beam flipping over to become a floor, motion arrows |
| `stairs` | Kai climbing a glowing staircase made of chart candles |
| `pdlines` | Sensei drawing three glowing horizontal lines across a dark chart |
| `gap` | a glowing gap in a chart shaped like a gas station, price pulling in to refuel |
| `topdown` | three stacked chart screens, big to small, with one arrow passing through all three |
| `micros` | a tiny cute baby bull beside a giant bull, both in the same pose |
| `shield` | Kai behind a glowing legendary shield as red candles crash against it |
| `size` | a balance scale with a shield on one side and a few contracts on the other |
| `three` | three glowing tally marks carved into a dojo wall, Kai walking away calmly |
| `asia` | a quiet moonlit dojo with a small glowing box drawn on a chart |
| `newyork` | sunrise over a city skyline with a bell ringing and candles shooting upward |
| `fomo` | a wide-eyed panicking demon pointing at a rocket leaving without it |
| `revenge` | a furious red demon smashing a keyboard |
| `dragon` | the Volatility Dragon breathing giant green and red candles like fire |
| `hype` | a slick demon in sunglasses holding a phone that showers fake gold coins |
| `hunter` | the Stop Hunter ninja reaching under a line to grab a pile of glowing coins |
| `bread` | a glowing golden loaf of bread on a dojo altar, five lights around it |

### episodes/  (story cards — wide 16:9, shown above the text)
`episodes/<worldId>-open.png` and `episodes/<worldId>-cliff.png`. The scene to
draw is the text of that card in `src/engine/episodes.js`. Kazuo is the grizzled
grey-haired rival in the green striped vest (`characters/kazuo.png`); Kai is the
player. World ids in order: arc1, arcF, arcL, arc2, arcP, arc3, arcM, arc4, arcS,
arc5, arc6, arc7, arc8, arcK, arc9, arcR, arc10. The two that matter most:
| file | scene |
|---|---|
| `episodes/arcM-cliff.png` | Kazuo staring in horror at a trading screen full of falling red candles, the screen going dark, Kai watching from behind |
| `episodes/arc4-cliff.png` | A humbled Kazuo, no longer smirking, asking Kai for help; Sensei holding a glowing shield in the background |
