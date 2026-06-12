# 🕯️ Candle Quest Academy

An **anime-styled, gamified course** that teaches kids the concepts behind intraday
futures trading — with **100% pretend money**. Built for a 10-year-old who loves anime. ⚡

## How to play

No install needed. Just open the game in any browser:

```
open index.html        # macOS
# or double-click index.html in your file manager
```

Progress (XP, ranks, badges) is saved automatically in the browser.

## What's inside

**📖 Six story arcs** taught by Sensei Hoshi the owl, Kitsu the fox, and rival Kazuo:

1. **Welcome to the Dojo** — what markets are, what a futures contract is, the intraday rule
2. **The Language of Candles** — reading candlestick charts
3. **Riding the Trend Wave** — trends, long vs. short, support & resistance
4. **The Way of the Shield** — risk management, stop-losses, position sizing (the most important arc!)
5. **Mind of the Trader** — FOMO, revenge trading, overtrading, the trading plan
6. **The Final Trial** — volatility, and the Boss Battle
7. **The Way of Strategy** — opening range breakouts (ORB), fair value gaps,
   yesterday's high/low, and confluence ("one clue is a rumor, three clues is a plan")
8. **The Hype Demon** — spotting social media trading hype, selective storytelling,
   sample size, and "test before trust"
9. **The Liquidity Map** — liquidity, PDH/PDL/PDO/PDC/PD 50%, liquidity sweeps
   ("stop hunts"), and support/resistance role flips. The Liquidity Hunter mission
   draws all five previous-day levels with glowing "treasure pools" beyond PDH/PDL,
   detects sweeps live, and rewards trading the snap-back

Each arc = **Lesson → Quiz → Dojo Mission**, earning XP, ranks
(Academy Rookie 🐣 → Legendary Trade Master 🐉 → Mythic Chart Sage 🌌), and badges.

In strategy missions the chart draws the opening-range zone, live fair-value-gap
boxes, and yesterday's walls, with three **signal lamps** (🚪 breakout, 🪜 gap,
🧱 wall) that flash **⚡ CONFLUENCE** when all three align. The finale is the
**Strategy Scientist** mission: a 5-day experiment passed by following the method
honestly — win or lose — ending with a per-day lab-results scoreboard.

**⚔️ The Trading Dojo** — a live candlestick simulator where candles form in real
time, trading the dojo's two beasts: **🚀 NQ (Nasdaq-100 futures, ~21,500)** and
**🥇 GC (Gold futures, ~3,350)**. Prices are generated (no live data feed), but
each asset has realistic levels, its own volatility personality, and stop-loss
sizes in its own points. Go long or short with virtual Koins, set stop-loss "shields", and complete
missions like the *Trial of the Shield* (every trade protected) and the *Calm Mind
Challenge* (max 3 trades — patience!). The market always closes at the end of the
day and force-closes open trades: that's the intraday lesson built into the game.

## 👨‍👩‍👧 For parents

- Everything is simulated. There are no real-money features, no sign-ups, no network calls.
- The course repeatedly teaches that **real futures trading is high-risk, uses leverage,
  and is only for trained adults** — and that the real superpowers are risk management,
  patience, and discipline.
- All data stays in the browser (`localStorage`). The "Reset all progress" button on
  the Profile screen wipes it.

## Project layout

```
index.html        app shell (all screens)
styles.css        anime arcade theme + motion/FX styles
js/fx.js          effects engine: sakura petals, confetti, floating text, screen shake
js/audio.js       sound engine (Web Audio synthesis — no audio files), mute persists
js/characters.js  animated SVG portraits: blinking eyes, talking mouths, tail swish
js/data.js        story dialogue, quizzes, missions, ranks, badges
js/game.js        progress/XP/badge state (localStorage)
js/sim.js         market engine + interactive candlestick chart (live-growing candles,
                  hover crosshair & per-candle tooltip, draggable stop-loss line)
js/sensei.js      floating Sensei Hoshi companion: contextual guidance on every screen,
                  live coaching during missions, tap him for trading wisdom
js/app.js         UI wiring (typewriter dialogue, FX/sound hooks, screen transitions)
```

No build step, no dependencies — plain HTML/CSS/JS.
