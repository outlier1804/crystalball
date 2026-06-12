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

Each arc = **Lesson → Quiz → Dojo Mission**, earning XP, ranks
(Academy Rookie 🐣 → Legendary Trade Master 🐉), and badges.

**⚔️ The Trading Dojo** — a live candlestick simulator where candles form in real
time. Go long or short with virtual Koins, set stop-loss "shields", and complete
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
index.html      app shell (all screens)
styles.css      anime arcade theme
js/data.js      story dialogue, quizzes, missions, ranks, badges
js/game.js      progress/XP/badge state (localStorage)
js/sim.js       market engine + candlestick chart renderer
js/app.js       UI wiring
```

No build step, no dependencies — plain HTML/CSS/JS.
