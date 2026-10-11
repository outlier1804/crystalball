// ====== The story: one episode per world ======
//
// The lessons teach; this is the reason to come back tomorrow. Every world is an
// episode with a cold open (shown before its story lesson) and a cliffhanger
// (shown when the lesson ends), and one thread runs through all seventeen:
//
//   Kazuo, the dojo's flashiest trader, wins big without rules (worlds 1-6),
//   trades against the trend with no stop and loses everything (7 -> 8), asks
//   you to teach him the shield, and trains beside you from then on. The mistakes
//   the course warns about are the villains: FOMO and Revenge (10), the
//   Volatility Dragon (11), the Hype Demon (13), the Stop Hunter (15).
//
// It is written around what the characters already say inside the lessons —
// Kazuo's "I learned this the hard way. Once I skipped my shield…" in the shield
// world is the line this whole arc was built to earn.
//
// Kid course only. Every line here is narrated (tools/vogen/lines.mjs reads it).
export const EPISODES = {
  arc1: { title: "The New Kid",
    open: "A new student walks into the dojo. That is you. Across the room, a trader named Kazuo is laughing at a chart, and everyone is watching him.",
    cliff: "Kazuo flicks a coin at you. Rules are for slow kids, he says. Watch how fast I get rich. Sensei says nothing. He only smiles." },
  arcF: { title: "The Scoreboard",
    open: "Kazuo is bragging about his biggest win. But how much did he really make? To know that, you have to learn how the market keeps score.",
    cliff: "You count Kazuo's points, and your eyes go wide. He trades the big contract. Every point is twenty dollars. One bad move could cost him a fortune." },
  arcL: { title: "Secret Words",
    open: "The traders in the dojo talk in a code you do not know yet. Long. Short. Stop. Target. Today, you learn the code.",
    cliff: "Now you understand what Kazuo is saying. And you notice something strange. He never, ever, says the word stop." },
  arc2: { title: "Buyers Versus Sellers",
    open: "Sensei lights one candle on the big screen. Every candle is a fight, he says. Buyers against sellers. Learn to see who won.",
    cliff: "You read your first candle right. Kazuo snorts. One candle is easy, he says. Wait until they start talking. Talking candles?" },
  arcP: { title: "Candles That Talk",
    open: "Some candles shout. A hammer. A shooter. An engulfer. Kitsu says the market is always telling you who just won the fight.",
    cliff: "You spot a hammer before Kazuo does. He jumps in early anyway, before the candle closes. It changes shape. He loses. He calls it bad luck." },
  arc3: { title: "The Wave",
    open: "The market moves like the sea. Surfers who fight the wave get wiped out. Today, Sensei teaches you to see which way the wave is going.",
    cliff: "Kazuo bets against the wave, with twice his usual size. It has to turn around, he says. The wave does not care." },
  arcM: { title: "The Staircase",
    open: "Kazuo is losing, and getting louder. Sensei ignores him and draws a staircase on the board. Count the steps, he says. The steps never lie.",
    cliff: "The staircase breaks, exactly where you said it would. Kazuo is on the wrong side again, and he has no stop. His screen turns red. Then it goes dark." },
  arc4: { title: "The Shield",
    open: "Kazuo's account is gone. All of it, in one morning. He sits alone in the corner of the dojo. Sensei holds up a shield. This, he says, is what he was missing.",
    cliff: "Kazuo walks over. He is not laughing now. Teach me the shield, he says quietly. Your rival just asked you for help." },
  arcS: { title: "The Clock",
    open: "Kazuo starts again from zero, on the smallest contract. You train side by side now. First lesson together. The market is a different animal at every hour.",
    cliff: "At three in the morning, something pokes past the quiet night range, and snaps back. Kazuo frowns. That was not an accident, he says. Something is hunting out there." },
  arc5: { title: "The Demons Inside",
    open: "The most dangerous enemies are not on the chart. They live inside your own head. Their names are Fomo, and Revenge.",
    cliff: "You beat both demons. But the dojo floor begins to shake. Far away, something huge is waking up. Sensei whispers one word. Dragon." },
  arc6: { title: "The Dragon Trial",
    open: "The Volatility Dragon is awake. Candles as tall as towers, moving faster than you have ever seen. Everything you have learned, all at once.",
    cliff: "The dragon falls. Sensei bows to you. You can survive, he says. Now I will show you how the masters hunt. He unrolls a very old scroll." },
  arc7: { title: "The Master's Scroll",
    open: "The old scroll holds a real trader's method. The big chart first. Then the fifteen minute. Then the close. And strange holes in the chart, called gaps.",
    cliff: "Kazuo's phone buzzes. A stranger in a video promises two thousand dollars in thirty minutes. Kazuo's eyes light up. Oh no." },
  arc8: { title: "The Hype Demon",
    open: "It has a shiny car, a big smile, and a secret it wants to sell you. The Hype Demon does not live in the market. It lives in your phone.",
    cliff: "Kazuo deletes the video. You both win this one. Then Sensei pins a map to the wall, covered in lines. The hunter you saw at three in the morning, he says. This is its map." },
  arcK: { title: "Lines on the Map",
    open: "Before the day starts, a trader draws a few lines. Yesterday's high. Yesterday's low. The middle. Those lines are where the action happens.",
    cliff: "You draw your lines. And right under yesterday's low, you see them. Hundreds of stop orders, glowing like treasure. Something in the dark is watching them too." },
  arc9: { title: "The Stop Hunter",
    open: "It has a name. The Stop Hunter. It pokes under the lows, grabs the stops of impatient traders, and vanishes. Today, you learn to see its trap coming.",
    cliff: "The Hunter springs its trap, and you are not in it. You waited for the close. Kazuo grins at you. We are ready, he says. Almost." },
  arcR: { title: "The House Rules",
    open: "Skill is not enough. Every master has rules they decide before the day begins, and never bend. Tonight, you write yours.",
    cliff: "You sign your rules. Kazuo signs his too, right under yours. Sensei rolls up the paper. One trial left, he says. The big one." },
  arc10: { title: "The Final Trial",
    open: "Five checks. Behavior. Reaction. Execution. Alignment. Discipline. The whole method, in one trade. This is what all the training was for.",
    cliff: "You pass. Sensei hands you the dojo's oldest scroll, and Kazuo is the first to cheer. The story ends here. Your real training starts now, in the Arena." },
};

// What the owl says when a film's questions send him back to watch again. A miss
// is a normal part of training here, never a failure — the wording carries that.
export const TRAIN_AGAIN = [
  "So close. Even masters repeat the form. Watch once more with me, and it will stick.",
  "That one is tricky. Good. Tricky is where you get stronger. Let us train it again.",
  "Not yet, and that is fine. Every ninja repeats a move a hundred times. One more look.",
];
