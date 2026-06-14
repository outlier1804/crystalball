# 🕯️ Candle Quest Academy

An **anime-styled, gamified course** that teaches kids the concepts behind intraday
futures trading — with **100% pretend money**. Built for a 10-year-old who loves anime. ⚡

### ▶️ Play it now: **https://crystalball-seven.vercel.app/**

Hosted on Vercel (deploys automatically from `main`). Also runs fully offline —
see "How to play" below.

## How to play

No install needed. Just open the game in any browser:

```
open index.html        # macOS
# or double-click index.html in your file manager
```

Progress (XP, ranks, badges) is saved automatically in the browser.

### Easy desktop launch (great for kids)

The download includes ready-made launchers and a custom app icon, so a
clickable "Candle Quest" icon can live on the desktop:

* **Windows:** double-click `Make Desktop Icon (Windows).bat` once — a
  desktop shortcut with the icon appears. (Or `Play Candle Quest (Windows).bat`.)
* **macOS:** double-click `Make Desktop Icon (Mac).command` once, or launch
  `Candle Quest.app` directly. (Or `Play Candle Quest (Mac).command`.)
* See `START HERE.txt` for the friendly walkthrough.

Icon source/build: `tools/icon.svg` + `tools/build-icons.js` (renders the
PNG/ICO/ICNS into `launcher/`).

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
- **Read-aloud:** a "🔊 Read to me" button on each lesson has the characters read the text
  out loud (using the device's built-in voice — no internet needed), great for younger or
  developing readers. Each character has its own voice.
- The course repeatedly teaches that **real futures trading is high-risk, uses leverage,
  and is only for trained adults** — and that the real superpowers are risk management,
  patience, and discipline.
- All data stays in the browser (`localStorage`). The "Reset all progress" button on
  the Profile screen wipes it.

## Tech stack

**React 18 + Vite + Framer Motion.** The UI is React components with Framer
Motion animations (screen transitions, spring popups, staggered cards, the
spinning hero select). The framework-agnostic game logic lives in `src/engine/`
and is reused as ES modules.

```bash
npm install
npm run dev      # local dev server
npm run build    # production build -> dist/  (Vercel runs this automatically)
```

## Project layout

```
index.html              Vite entry
vercel.json             Vercel build config (Vite -> dist)
src/main.jsx            boots the app, loads engine + mounts React
src/App.jsx             screen router with Framer Motion transitions
src/store.jsx           app state (screen nav, popup queue, Game bump)
src/styles.css          anime arcade theme + motion/FX styles
src/components/         TopBar (HUD), NavBar, Popup
src/screens/            Welcome (hero select), StoryMap, Lesson, Quiz, Dojo, Profile
src/engine/             framework-agnostic logic (ES modules):
  fx.js          sakura petals, confetti, floating text, screen shake
  audio.js       Web Audio sound engine (no audio files), mute persists
  speech.js      read-aloud (Web Speech API)
  characters.js  animated SVG portraits + hero avatars (Kai, Hana)
  data.js        story dialogue, quizzes, missions, ranks, badges, assets (NQ/GC)
  game.js        progress/XP/badge state (localStorage)
  sim.js         market engine + interactive candlestick chart (live candles,
                 hover crosshair, draggable stop-loss, strategy/liquidity overlays)
  sensei.js      floating Sensei Hoshi companion + grand tour
```
