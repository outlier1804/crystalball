// Adult wording for the original arcs' quiz questions. ADULT_QUIZ[arcId][i] overrides
// CORE_ARCS quiz question i when the profile is in adult mode. Options are parallel to
// the kid options: SAME ORDER, same meaning per position, so the answer index is unchanged.
export const ADULT_QUIZ = {
  arc1: [
    {
      q: "What is a market?",
      o: [
        "Any place where buyers and sellers meet to trade",
        "A company that sets the official price of a product",
        "A chart showing how a price has moved",
        "A government agency that supervises trading",
      ],
      e: "A market is anywhere buyers and sellers meet. A farmers' market, an auction site and a futures exchange all work on the same principle.",
    },
    {
      q: "A futures contract is...",
      o: [
        "A loan from a broker used to buy an asset",
        "A binding agreement to buy or sell something at a set price on a set future date",
        "A form of currency issued by an exchange",
        "A chart pattern that forecasts future prices",
      ],
      e: "It is an agreement about a future transaction. In practice, traders buy and sell the contracts themselves rather than holding them to that date.",
    },
    {
      q: "If many people suddenly want to buy something, what usually happens to its price?",
      o: [
        "It falls",
        "It becomes more stable",
        "It rises",
        "Nothing — price depends only on the sellers",
      ],
      e: "More buyers than sellers pushes the price up. That imbalance between the two sides is what moves every market.",
    },
    {
      q: "What is the defining rule of intraday (day) trading in this course?",
      o: [
        "Hold positions for months or years",
        "Open and close every trade on the same day",
        "Hold each trade overnight to catch the next morning's move",
        "Keep a losing trade open until it recovers",
      ],
      e: "Intraday means within the day. Every trade is closed before the market closes; nothing is held overnight.",
    },
    {
      q: "Which two markets will you practice on in this course?",
      o: [
        "Corn and crude oil futures",
        "NQ (Nasdaq-100) and GC (Gold) futures",
        "S&P 500 and Treasury bond futures",
        "Bitcoin and Euro currency futures",
      ],
      e: "NQ, the fast-moving Nasdaq-100 technology index, and GC, Gold, which is usually calmer.",
    },
  ],

  arc2: [
    {
      q: "What does a green candle mean?",
      o: [
        "The price closed lower than it opened",
        "Trading was unusually heavy during that period",
        "The price closed higher than it opened during that period",
        "The candle has not finished forming yet",
      ],
      e: "Green means up: the price closed higher than it opened.",
    },
    {
      q: "What do the thin wicks on a candle show?",
      o: [
        "The highest and lowest prices reached during the period",
        "How many contracts were traded",
        "How long the period lasted",
        "The opening and closing prices",
      ],
      e: "The wicks mark the extremes — the prices that were reached before price was pushed back. The open and close are shown by the body.",
    },
    {
      q: "You see several large red candles in a row. Which side is in control right now?",
      o: [
        "The buyers",
        "The sellers",
        "Neither — the two sides are balanced",
        "Candles cannot tell you that",
      ],
      e: "The sellers (nicknamed \"bears\") are in control: the price keeps closing lower.",
    },
    {
      q: "The thick part of a candle is called the...",
      o: ["Wick", "Shadow", "Body", "Range"],
      e: "The body shows where price opened and closed. The wicks are the thin lines above and below it.",
    },
  ],

  arc3: [
    {
      q: "What does an uptrend look like?",
      o: [
        "Lower highs and lower lows",
        "Higher highs and higher lows",
        "Highs and lows at roughly the same levels",
        "Higher highs but lower lows",
      ],
      e: "In an uptrend each peak is higher than the last, and each dip also stops higher than the last.",
    },
    {
      q: "Going short means you profit when...",
      o: [
        "The price rises",
        "The price falls",
        "The market closes for the day",
        "The position is held long enough",
      ],
      e: "Short means you sell first and buy back later at a lower price. Futures traders can profit from falling prices as routinely as from rising ones.",
    },
    {
      q: "What is support?",
      o: [
        "A price floor where falling prices have often bounced",
        "A price ceiling where rising prices have often been turned back",
        "A fee charged by the broker",
        "The lowest price of the current candle",
      ],
      e: "Support is the floor — prices often bounce up from it. Resistance is the ceiling.",
    },
    {
      q: "Complete the saying: \"The trend is your...\"",
      o: ["Enemy", "Cue to bet on a reversal", "Friend", "Guarantee"],
      e: "The trend is your friend. Trading with the direction the market is already moving is easier than betting on it to turn.",
    },
    {
      q: "The market is in a strong downtrend. Which trade goes with the trend?",
      o: [
        "Going long",
        "Going short",
        "Taking many quick trades in both directions",
        "Ignoring the trend and trading on a hunch",
      ],
      e: "In a downtrend, going short trades with the move. Going long would be trading against it.",
    },
  ],

  arc4: [
    {
      q: "What does a stop-loss do?",
      o: [
        "Locks in a guaranteed profit",
        "Automatically closes your trade if price reaches a level you chose in advance",
        "Prevents the price from moving against you",
        "Sends you a warning but leaves the trade open",
      ],
      e: "It is your protection: it cuts a losing trade while the loss is still small.",
    },
    {
      q: "Even highly successful traders...",
      o: [
        "Win nearly every trade",
        "Stop needing stop-losses once they are experienced",
        "Lose some trades — and keep those losses small",
        "Trade on instinct rather than a plan",
      ],
      e: "Everyone loses sometimes. What separates successful traders is that their losses stay small.",
    },
    {
      q: "How much of your account should you risk on one trade?",
      o: [
        "All of it, when the setup looks strong",
        "Only a small fraction",
        "Exactly half",
        "More than you have, by borrowing",
      ],
      e: "A small fraction. At that size, a run of losing trades is a setback you can recover from, not the end of your account.",
    },
    {
      q: "Leverage in futures trading...",
      o: [
        "Makes both gains and losses larger",
        "Makes gains larger without affecting losses",
        "Reduces risk by spreading it out",
        "Is a fee charged by the exchange",
      ],
      e: "It cuts both ways. That is why real futures trading demands training, and why the stop-loss is non-negotiable.",
    },
    {
      q: "A trader is certain a trade will win, so he skips his stop-loss. What difference does his certainty make to the market?",
      o: [
        "The market tends to reward conviction",
        "None — the market is indifferent, so use a stop-loss on every trade",
        "Strong conviction usually means the analysis is right, so the risk is lower",
        "It buys the trade more time to work out",
      ],
      e: "The market does not know or care what you believe. The stop-loss goes on every trade, without exception.",
    },
  ],

  arc5: [
    {
      q: "Price suddenly surges and you feel you must get in right now. What is that impulse called?",
      o: ["FOMO", "Support", "Leverage", "Trend-following"],
      e: "That is FOMO — fear of missing out. The disciplined response is to wait for the next proper setup.",
    },
    {
      q: "You just lost a trade. What does a disciplined trader do next?",
      o: [
        "Immediately open a larger trade to win it back",
        "Pause, review the plan, and reset",
        "Give up trading permanently",
        "Drop the stop-loss next time so it cannot be hit",
      ],
      e: "Trying to win it back at once is called revenge trading, and it is emotion making the decision. Pause, review, reset.",
    },
    {
      q: "What makes a trade a good trade?",
      o: [
        "It made money, however it was taken",
        "You followed your plan — win or lose",
        "It moved fast and felt exciting",
        "It added to a high trade count for the day",
      ],
      e: "Discipline is the skill that matters. Following the plan is the success; profits follow over time.",
    },
    {
      q: "What should you decide before entering a trade?",
      o: [
        "Nothing — react to whatever the market does",
        "Why you are entering, where your stop-loss is, and when you will take profit",
        "Only how confident you feel",
        "How much you need to make today",
      ],
      e: "Those three decisions are your trading plan, and they are made before the trade is opened.",
    },
    {
      q: "The best traders spend most of their day...",
      o: [
        "Trading every small move",
        "Watching patiently and waiting for high-quality setups",
        "Following opinions and tips online",
        "Sitting in open trades so they never miss a move",
      ],
      e: "Few trades, carefully chosen. Overtrading steadily drains an account.",
    },
  ],

  arc6: [
    {
      q: "What is volatility?",
      o: [
        "How widely and quickly the price moves around",
        "The time the market opens",
        "A type of contract",
        "A fee charged for trading",
      ],
      e: "Volatility is the size of the price swings: small on a quiet day, large on a turbulent one.",
    },
    {
      q: "On a high-volatility day, the sensible trader...",
      o: [
        "Takes larger positions to capture the bigger moves",
        "Trades smaller and is more selective about setups",
        "Removes stop-losses so the swings cannot trigger them",
        "Takes many more trades than usual",
      ],
      e: "Bigger swings mean bigger risk. Adapt by trading smaller, with your stop-loss in place.",
    },
    {
      q: "Which combination makes a complete trader?",
      o: [
        "Luck and speed",
        "Chart reading, risk management, and a calm, disciplined mind",
        "Large positions and confidence",
        "Inside tips and rumors",
      ],
      e: "All three together: reading the chart, managing risk, and managing yourself.",
    },
    {
      q: "After this course, what is true about real futures trading?",
      o: [
        "It is a dependable source of easy income",
        "A beginner should start with real money right away",
        "It is high-risk and should only follow serious training",
        "It carries no real risk if you are smart enough",
      ],
      e: "Real futures use leverage and real money. Train thoroughly first, and only ever trade money you can afford to lose.",
    },
  ],

  arc7: [
    {
      q: "What is the opening range?",
      o: [
        "The high and low set by the first candles of the trading day",
        "The midday period when trading slows down",
        "A type of stop-loss order",
        "The previous day's high-to-low range",
      ],
      e: "The first candles of the day establish a range. Its top is the range high and its bottom is the range low.",
    },
    {
      q: "An ORB (opening range breakout) trade means...",
      o: [
        "Trading any move during the first part of the morning",
        "Trading only while price stays inside the range",
        "Trading in the direction price breaks out of the opening range",
        "Waiting until the afternoon before trading at all",
      ],
      e: "A break above the range high points up; a break below the range low points down. The breakout sets the direction.",
    },
    {
      q: "What is a fair value gap?",
      o: [
        "A price below what the asset is really worth",
        "An empty zone left when price moves so fast it skips over a band of prices",
        "A candle with no wicks",
        "The difference between the buying price and the selling price",
      ],
      e: "It is a band of prices that was skipped. Markets often return to fill these, and a fresh gap can act as a level price reacts from.",
    },
    {
      q: "Why does price tend to be drawn back to a fair value gap?",
      o: [
        "Exchange rules require every gap to be filled",
        "Markets tend toward balance, so price returns to fill the unbalanced gap",
        "Gaps mark the prices where the most trading took place",
        "Large traders are obliged to push price back there",
      ],
      e: "A fast, one-sided move leaves an unbalanced gap, and price tends to be pulled back to fill it. That is what the method means by price having a goal.",
    },
    {
      q: "What does the method call fair value gaps?",
      o: [
        "Order blocks",
        "DEMs or BIMs (Balance/Imbalance Marks)",
        "Pivot points",
        "Opening ranges",
      ],
      e: "DEMs and BIMs are simply the method's names for a fair value gap. They act like support and resistance and tend to attract price.",
    },
    {
      q: "When price dips into a DEM/BIM for \"gas\", how far in does it usually need to go?",
      o: [
        "All the way to the far edge, every time",
        "About halfway (50%), or at most three-quarters (75%), then it continues",
        "It does not enter the zone at all",
        "Barely past the near edge",
      ],
      e: "The method watches the 50% and 75% marks: price dips to there, holds, and continues. A much deeper dip can mean the zone is failing.",
    },
    {
      q: "What should you do while the opening range is still forming?",
      o: [
        "Trade early to get ahead of the breakout",
        "Wait — let the range be established first",
        "Trade without a stop-loss, since the levels are not set yet",
        "Sit out the whole session",
      ],
      e: "Without the range high and range low there is nothing to plan a trade around. Wait for the levels.",
    },
    {
      q: "What is confluence?",
      o: [
        "A fee charged on each trade",
        "A strong feeling that a trade will work",
        "Several independent signals all pointing the same direction",
        "A type of candle pattern",
      ],
      e: "One signal is weak; three agreeing is a plan. Confluence is the breakout, the gap and the prior-day level all pointing the same way.",
    },
  ],

  arc8: [
    {
      q: "A video claims: \"My bot made 2,000 in 30 minutes!\" What is the first question to ask?",
      o: [
        "Where can I buy it?",
        "What about all the losing days that were not shown?",
        "What settings did the bot use?",
        "Which market was it trading?",
      ],
      e: "A highlight reel hides the full record. In the course example, the same trader had lost 2,000 just days earlier.",
    },
    {
      q: "Which of these is a warning sign of hype?",
      o: [
        "Showing both wins and losses honestly",
        "Promising easy money fast",
        "Explaining the risks",
        "Keeping a careful journal",
      ],
      e: "A promise of easy money is the classic red flag. Real trading is slow, careful work.",
    },
    {
      q: "A strategy wins 3 trades in a row. What does that prove?",
      o: [
        "It is reliable — time to increase size",
        "Almost nothing — 3 trades is a tiny sample",
        "The trader is highly skilled",
        "The market is easy to read at the moment",
      ],
      e: "Three coin flips landing heads does not make the coin special. Judge a strategy over many trades.",
    },
    {
      q: "You find an appealing new strategy online. What do you do?",
      o: [
        "Trade it with real money right away",
        "Test it with practice money many times and record all the results",
        "Recommend it to others before checking it",
        "Assume it works because the presentation was convincing",
      ],
      e: "Test before you trust. This is exactly what the simulator and paper trading are for.",
    },
    {
      q: "In the Strategy Scientist exercise, how do you pass?",
      o: [
        "By having a lucky first day",
        "By making the largest possible profit",
        "By following the method honestly all five days — win or lose",
        "By trading without a stop-loss",
      ],
      e: "You are judged on the method, not on one lucky result. Follow the rules and record what actually happened.",
    },
  ],

  arc9: [
    {
      q: "What is liquidity?",
      o: [
        "How fast orders reach the exchange",
        "How many orders are waiting to trade at each price",
        "How far the price moves in a day",
        "The hours the market is open",
      ],
      e: "Liquidity is the resting orders at each level: thin at some prices, deep at others.",
    },
    {
      q: "What does PDH stand for?",
      o: [
        "Previous Day High",
        "Pre-market Day High",
        "Peak Demand High",
        "Projected Day High",
      ],
      e: "PDH is the Previous Day High. Its companions are PDL (low), PDO (open), PDC (close) and PD 50% (the midpoint).",
    },
    {
      q: "Where do large clusters of stop orders usually rest?",
      o: [
        "Exactly at PD 50%",
        "Just above PDH and just below PDL",
        "Nowhere in particular — stop placement is random",
        "Only at round numbers",
      ],
      e: "Stop orders collect just beyond yesterday's extremes, which is why those levels attract price.",
    },
    {
      q: "What is a liquidity sweep?",
      o: [
        "Closing every open position at the end of the day",
        "Price pushing just past a well-known level to trigger the orders there, then snapping back",
        "A steady move through a level that keeps going",
        "Holding a trade for a week",
      ],
      e: "Also called a stop hunt: price runs into the cluster of orders, triggers them, and often reverses.",
    },
    {
      q: "A strong ceiling (resistance) finally breaks. What does it often become?",
      o: [
        "Nothing — it stops mattering",
        "A new floor (support) — the role flip",
        "An even stronger ceiling",
        "A fair value gap",
      ],
      e: "This is the role flip: old resistance becomes new support. Levels where price reacted before tend to matter again.",
    },
    {
      q: "What is PD 50%?",
      o: [
        "Half of your account balance",
        "The midpoint of yesterday's range — the equilibrium",
        "A price 50% below yesterday's close",
        "The midpoint of a single candle",
      ],
      e: "It is the equilibrium line: above it buyers have the upper hand, below it sellers do.",
    },
  ],

  arc10: [
    {
      q: "What does B.R.E.A.D stand for?",
      o: [
        "Buy, Run, Earn, Add, Double",
        "Behavior, Reaction, Execution, Alignment, Discipline",
        "Breakout, Retest, Entry, Alignment, Direction",
        "Bias, Risk, Entry, Analysis, Discipline",
      ],
      e: "Behavior, Reaction, Execution, Alignment, Discipline — the method's one checklist, run on every trade.",
    },
    {
      q: "What is the \"Down Go Frazier\" rule?",
      o: [
        "A rule for cutting a losing trade quickly",
        "If a zone did nothing new (such as breaking a fresh swing point), it is weak and price will run straight through it",
        "A rule to trade only at a fixed time of day",
        "A specific candlestick shape",
      ],
      e: "A zone that did not prove itself by doing something new will not hold; price goes straight through it. Do not trade off weak zones.",
    },
    {
      q: "When does the method enter a trade?",
      o: [
        "The instant price touches the level",
        "When the candle closes and shows a reaction — never on the touch",
        "Before price gets there, to secure a better price",
        "Whenever the move feels strong",
      ],
      e: "Never enter on the touch. Wait for the candle to close and show a reaction (a hammer, a wick, a doji, or a failed push).",
    },
    {
      q: "Which DEM/BIM does the method watch for entries?",
      o: [
        "Every gap on the chart",
        "One that did something new (took out a fresh swing point) — or the last DEM/BIM before the pullback",
        "Only the largest one",
        "Only gaps from the previous week",
      ],
      e: "It has to do something new — take out a fresh swing point — or be the last DEM/BIM before price pulled back.",
    },
    {
      q: "Name one of the method's two BNR setups.",
      o: [
        "Buy the News Reaction",
        "Bounce & Reject (or Break & Retest)",
        "Breakout, No Retest",
        "Buy Near Resistance",
      ],
      e: "BNR covers Bounce & Reject (the preferred one) and Break & Retest. Both are taken off a level that was already marked.",
    },
    {
      q: "Trading \"zone to zone\": price rejects (bounces off) a level. Where does it go?",
      o: [
        "Straight on to the next zone",
        "Back toward the previous zone",
        "Nowhere — it stalls at the level",
        "Into a full trend reversal, every time",
      ],
      e: "A bounce sends price back to the previous zone. A close beyond the level sends it on to the next zone.",
    },
    {
      q: "Where does your stop-loss go, and when is the trade over?",
      o: [
        "Far from the level, with no exit rule",
        "Just beyond the level — if price closes past it, the idea is invalid and you exit",
        "Exactly at your entry price",
        "Wherever the loss feels tolerable",
      ],
      e: "The stop goes just beyond the level. A close past it means the idea is invalid. No moving the stop, no hoping.",
    },
    {
      q: "What is the maximum time the method gives a trade to reach its target?",
      o: ["10 minutes", "2½ hours", "The whole session", "A full week"],
      e: "2½ hours at most. If it takes longer, the momentum is gone — close the trade and protect your Koins.",
    },
  ],
};
