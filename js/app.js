// ====== UI wiring: screens, lessons, quizzes, dojo, profile ======

const $ = id => document.getElementById(id);

let currentArc = null;
let lessonPage = 0;
let quizIndex = 0;
let quizCorrect = 0;
let popupQueue = [];

// ---------- screens ----------
function showScreen(name) {
  document.querySelectorAll(".screen").forEach(s => { s.classList.add("hidden"); s.classList.remove("screen-enter"); });
  const el = $("screen-" + name);
  el.classList.remove("hidden");
  void el.offsetWidth;            // restart the entrance animation
  el.classList.add("screen-enter");
  document.querySelectorAll(".nav-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.screen === name));
  if (name === "map") renderMap();
  if (name === "dojo") renderMissions();
  if (name === "profile") renderProfile();
}

document.querySelectorAll(".nav-btn").forEach(btn =>
  btn.addEventListener("click", () => {
    if (Sim.running) { if (!confirm("Leave the dojo? Your trading day will end.")) return; quitMission(); }
    showScreen(btn.dataset.screen);
  }));

// ---------- HUD ----------
function renderHud() {
  const s = Game.state;
  const rank = Game.rank();
  const next = Game.nextRank();
  $("hud-avatar").textContent = s.avatar;
  $("hud-name").textContent = s.name || "Trader";
  $("hud-rank").textContent = rank.emoji + " " + rank.name;
  const base = rank.xp;
  const span = next ? next.xp - base : 1;
  const pct = next ? Math.min(100, ((s.xp - base) / span) * 100) : 100;
  $("hud-xp-fill").style.width = pct + "%";
  $("hud-xp-text").textContent = next ? `${s.xp} XP · ${next.xp - s.xp} to ${next.name}` : `${s.xp} XP · MAX RANK!`;
}

// ---------- popup (queued so multiple rewards show one after another) ----------
function popup(emoji, title, text, celebrate) {
  popupQueue.push({ emoji, title, text, celebrate });
  if (popupQueue.length === 1) showNextPopup();
}
function showNextPopup() {
  const p = popupQueue[0];
  if (!p) return;
  $("popup-emoji").textContent = p.emoji;
  $("popup-title").textContent = p.title;
  $("popup-text").innerHTML = p.text;
  $("popup").classList.remove("hidden");
  // retrigger the emoji bounce + light up the speed lines
  const em = $("popup-emoji");
  em.style.animation = "none"; void em.offsetWidth; em.style.animation = "";
  document.querySelector(".popup-burst").classList.toggle("celebrate", !!p.celebrate);
  if (p.celebrate) setTimeout(() => FX.confettiAt(document.querySelector(".popup-card"), 50), 150);
}
$("popup-btn").addEventListener("click", () => {
  popupQueue.shift();
  if (popupQueue.length) showNextPopup();
  else $("popup").classList.add("hidden");
});

function announceRankUp(rank) {
  if (rank) popup(rank.emoji, "RANK UP!", `You are now a <strong>${rank.name}</strong>! Keep training, legend in the making!`, true);
}
function announceBadge(id) {
  const b = BADGES.find(x => x.id === id);
  if (b) popup(b.emoji, "Badge earned!", `<strong>${b.name}</strong> — ${b.desc}`, true);
}

// ---------- welcome ----------
function setupWelcome() {
  const picker = $("avatar-picker");
  picker.innerHTML = "";
  AVATARS.forEach((a, i) => {
    const btn = document.createElement("button");
    btn.className = "avatar-opt" + (i === 0 ? " selected" : "");
    btn.textContent = a;
    btn.addEventListener("click", () => {
      picker.querySelectorAll(".avatar-opt").forEach(x => x.classList.remove("selected"));
      btn.classList.add("selected");
    });
    picker.appendChild(btn);
  });
  $("start-btn").addEventListener("click", () => {
    const name = $("name-input").value.trim() || "Trader";
    Game.state.name = name;
    Game.state.avatar = picker.querySelector(".selected").textContent;
    Game.save();
    renderHud();
    popup("⛩️", `Welcome, ${name}!`, "Your quest begins! Head to <strong>Arc 1</strong> on the Story Map and meet Sensei Hoshi.", true);
    showScreen("map");
  });
}

// ---------- story map ----------
function renderMap() {
  const list = $("arc-list");
  list.innerHTML = "";
  ARCS.forEach((arc, i) => {
    const unlocked = Game.arcUnlocked(i);
    const prog = Game.arcProgress(arc.id);
    const card = document.createElement("div");
    card.className = "arc-card " + (unlocked ? "unlocked" : "locked");
    card.innerHTML = `
      <div class="arc-emoji">${arc.emoji}</div>
      <div class="arc-body">
        <div class="arc-name">${arc.name} ${prog.quizDone ? "✅" : ""}</div>
        <div class="arc-desc">${arc.desc}</div>
        <div class="arc-steps"></div>
      </div>`;
    const steps = card.querySelector(".arc-steps");

    const lessonBtn = document.createElement("button");
    lessonBtn.className = "step-btn" + (prog.lessonDone ? " done" : "");
    lessonBtn.textContent = (prog.lessonDone ? "✓ " : "") + "📖 Lesson";
    lessonBtn.disabled = !unlocked;
    lessonBtn.addEventListener("click", () => startLesson(arc));
    steps.appendChild(lessonBtn);

    const quizBtn = document.createElement("button");
    quizBtn.className = "step-btn" + (prog.quizDone ? " done" : "");
    quizBtn.textContent = (prog.quizDone ? "✓ " : "") + "❓ Quiz";
    quizBtn.disabled = !unlocked || !prog.lessonDone;
    quizBtn.addEventListener("click", () => startQuiz(arc));
    steps.appendChild(quizBtn);

    const mission = MISSIONS.find(m => m.unlockArc === arc.id);
    if (mission) {
      const mBtn = document.createElement("button");
      const done = Game.state.missions[mission.id];
      mBtn.className = "step-btn" + (done ? " done" : "");
      mBtn.textContent = (done ? "✓ " : "") + `${mission.emoji} Dojo: ${mission.name}`;
      mBtn.disabled = !prog.quizDone;
      mBtn.addEventListener("click", () => { showScreen("dojo"); startMission(mission); });
      steps.appendChild(mBtn);
    }
    list.appendChild(card);
  });
}

// ---------- lessons ----------
function startLesson(arc) {
  currentArc = arc;
  lessonPage = 0;
  showScreen("lesson");
  renderLessonPage();
}

// Visual-novel style typewriter: text appears letter by letter, tags appear whole
let typeTimer = null;
let typingHtml = "";
function typeDialogue(html) {
  const el = $("dialogue-text");
  clearInterval(typeTimer);
  typingHtml = html;
  el.classList.add("typing");
  let i = 0, out = "";
  typeTimer = setInterval(() => {
    if (i >= html.length) return finishTyping();
    if (html[i] === "<") { const j = html.indexOf(">", i); out += html.slice(i, j + 1); i = j + 1; }
    else out += html[i++];
    el.innerHTML = out;
  }, 14);
}
function finishTyping() {
  clearInterval(typeTimer);
  typeTimer = null;
  $("dialogue-text").innerHTML = typingHtml;
  $("dialogue-text").classList.remove("typing");
}
// tap the speech bubble to skip the typing, like in every visual novel
document.querySelector(".speech").addEventListener("click", () => { if (typeTimer) finishTyping(); });

function renderLessonPage() {
  const page = currentArc.lessons[lessonPage];
  $("lesson-arc-title").textContent = currentArc.emoji + " " + currentArc.name;
  const portrait = $("dialogue-portrait");
  portrait.textContent = page.c.emoji;
  portrait.classList.remove("portrait-pop");
  void portrait.offsetWidth;
  portrait.classList.add("portrait-pop");
  $("dialogue-speaker").textContent = page.c.name;
  typeDialogue(page.t);
  $("lesson-progress").textContent = `${lessonPage + 1} / ${currentArc.lessons.length}`;
  $("lesson-back").style.visibility = lessonPage === 0 ? "hidden" : "visible";
  $("lesson-next").textContent = lessonPage === currentArc.lessons.length - 1 ? "Finish! ⭐" : "Next ▶";
}

$("lesson-back").addEventListener("click", () => { if (lessonPage > 0) { lessonPage--; renderLessonPage(); } });
$("lesson-next").addEventListener("click", () => {
  if (typeTimer) return finishTyping();   // first click finishes the line
  if (lessonPage < currentArc.lessons.length - 1) {
    lessonPage++;
    renderLessonPage();
  } else {
    const rankUp = Game.completeLesson(currentArc.id);
    if (rankUp !== undefined && rankUp !== null) announceRankUp(rankUp);
    popup("📖", "Lesson complete!", `+${XP_REWARDS.lesson} XP! Now take the <strong>quiz</strong> to unlock the next step.`);
    renderHud();
    showScreen("map");
  }
});
$("lesson-exit").addEventListener("click", () => showScreen("map"));

// ---------- quiz ----------
function startQuiz(arc) {
  currentArc = arc;
  quizIndex = 0;
  quizCorrect = 0;
  showScreen("quiz");
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const quiz = currentArc.quiz;
  const q = quiz[quizIndex];
  $("quiz-title").textContent = currentArc.emoji + " " + currentArc.name + " — Quiz";
  $("quiz-progress").textContent = `Question ${quizIndex + 1} of ${quiz.length} · ${quizCorrect} correct`;
  $("quiz-question").textContent = q.q;
  $("quiz-feedback").classList.add("hidden");
  $("quiz-next").classList.add("hidden");
  const opts = $("quiz-options");
  opts.innerHTML = "";
  q.o.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "quiz-opt";
    btn.textContent = text;
    btn.addEventListener("click", () => answerQuiz(i, btn));
    opts.appendChild(btn);
  });
}

function answerQuiz(choice, btn) {
  const q = currentArc.quiz[quizIndex];
  const buttons = $("quiz-options").querySelectorAll(".quiz-opt");
  buttons.forEach(b => b.disabled = true);
  buttons[q.a].classList.add("correct");
  const fb = $("quiz-feedback");
  if (choice === q.a) {
    quizCorrect++;
    fb.className = "quiz-feedback good";
    fb.innerHTML = `⭐ Correct! ${q.e}`;
    FX.confettiAt(btn, 16);
  } else {
    btn.classList.add("wrong");
    fb.className = "quiz-feedback bad";
    fb.innerHTML = `💫 Not quite! ${q.e}`;
    FX.shake(btn);
  }
  fb.classList.remove("hidden");
  $("quiz-next").textContent = quizIndex === currentArc.quiz.length - 1 ? "Finish quiz ⭐" : "Next ▶";
  $("quiz-next").classList.remove("hidden");
}

$("quiz-next").addEventListener("click", () => {
  if (quizIndex < currentArc.quiz.length - 1) {
    quizIndex++;
    renderQuizQuestion();
  } else {
    finishQuiz();
  }
});

function finishQuiz() {
  const total = currentArc.quiz.length;
  const hadAce = !!Game.state.badges["quiz-ace"];
  const hadScholar = !!Game.state.badges["scholar"];
  const rankUp = Game.completeQuiz(currentArc.id, quizCorrect, total);
  renderHud();
  const perfect = quizCorrect === total;
  popup(perfect ? "🎯" : "📝", perfect ? "PERFECT SCORE!" : "Quiz complete!",
    `You got <strong>${quizCorrect} / ${total}</strong> (+${quizCorrect * XP_REWARDS.quizCorrect} XP).` +
    (perfect ? " Flawless, ninja!" : " You can retake it anytime to study!"), perfect);
  if (!hadAce && Game.state.badges["quiz-ace"]) announceBadge("quiz-ace");
  if (!hadScholar && Game.state.badges["scholar"]) announceBadge("scholar");
  announceRankUp(rankUp);
  showScreen("map");
}

// ---------- dojo ----------
function renderMissions() {
  $("sim-area").classList.add("hidden");
  $("mission-select").classList.remove("hidden");
  const list = $("mission-list");
  list.innerHTML = "";
  MISSIONS.forEach(m => {
    const unlocked = Game.missionUnlocked(m);
    const done = Game.state.missions[m.id];
    const card = document.createElement("div");
    card.className = "mission-card" + (unlocked ? "" : " locked");
    card.innerHTML = `
      <div class="mission-emoji">${m.emoji}</div>
      <div class="mission-body">
        <div class="mission-name">${m.name} ${done ? '<span class="mission-done-tag">★ COMPLETED</span>' : ""}</div>
        <div class="mission-goal">${unlocked ? m.goal : "🔒 Finish " + ARCS.find(a => a.id === m.unlockArc).name.split(":")[0] + " quiz to unlock"}</div>
      </div>`;
    if (unlocked) {
      const btn = document.createElement("button");
      btn.className = "big-btn small";
      btn.textContent = done ? "Replay" : "Start!";
      btn.addEventListener("click", () => startMission(m));
      card.appendChild(btn);
    }
    list.appendChild(card);
  });
}

function startMission(mission) {
  $("mission-select").classList.add("hidden");
  $("sim-area").classList.remove("hidden");
  $("sim-mission-name").textContent = `${mission.emoji} ${mission.name}`;
  $("sim-mission-goal").textContent = "🎯 Goal: " + mission.goal;
  $("sim-log").innerHTML = "";
  $("btn-pause").textContent = "⏸ Pause";
  $("btn-speed").textContent = "⏩ Speed: 1x";

  Sim.onUpdate = updateSimUI;
  Sim.onLog = (msg, cls) => {
    const line = document.createElement("div");
    line.className = cls || "";
    line.innerHTML = msg;
    const log = $("sim-log");
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  };
  Sim.onEnd = stats => finishMission(mission, stats);
  // juice: Koins fly off the chart when a trade closes, big moves shake the arena
  Sim.onTradeClose = (pnl, byStop) => {
    FX.floatText($("chart"), fmtKoin(pnl), pnl >= 0 ? "#3dff8e" : "#ff5a5a");
    if (pnl >= 30) FX.confettiAt($("chart"), 24);
    if (byStop) FX.shake($("chart"));
  };
  Sim.onBigMove = () => FX.shake($("chart"));
  Sim.start(mission);
  updateSimUI();
}

// interactive chart: crosshair + candle story tooltip on hover/touch
const chartEl = $("chart");
function chartHover(clientX, clientY) {
  const r = chartEl.getBoundingClientRect();
  Chart.hover = {
    x: (clientX - r.left) * chartEl.width / r.width,
    y: (clientY - r.top) * chartEl.height / r.height,
  };
  Chart.draw();
}
chartEl.addEventListener("mousemove", e => chartHover(e.clientX, e.clientY));
chartEl.addEventListener("mouseleave", () => { Chart.hover = null; Chart.draw(); });
chartEl.addEventListener("touchmove", e => {
  e.preventDefault();
  chartHover(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });
chartEl.addEventListener("touchend", () => { Chart.hover = null; Chart.draw(); });

function updateSimUI() {
  const s = Sim.stats;
  const open = Sim.openPnl();
  $("sim-balance").textContent = Math.round(s.balance + open);
  const pnlEl = $("sim-pnl");
  if (Sim.position) {
    pnlEl.textContent = fmtKoin(open);
    pnlEl.className = open >= 0 ? "up" : "down";
  } else {
    pnlEl.textContent = "no trade open";
    pnlEl.className = "";
  }
  $("sim-clock").textContent = Sim.running ? Sim.candlesLeft() + " candles" : "CLOSED";
  $("sim-trades").textContent = s.tradesClosed;
  $("btn-long").disabled = !!Sim.position || !Sim.running;
  $("btn-short").disabled = !!Sim.position || !Sim.running;
  $("btn-close").disabled = !Sim.position;
  Chart.draw();
}

function finishMission(mission, stats) {
  const hadBadges = Object.keys(Game.state.badges).filter(b => Game.state.badges[b]);
  Game.recordDay(stats);
  const passed = mission.check(stats);
  if (passed) {
    const rankUp = Game.completeMission(mission);
    popup(mission.boss ? "🐉" : "🏆", mission.boss ? "DRAGON DEFEATED!" : "MISSION COMPLETE!",
      `${mission.name} cleared with ${fmtKoin(stats.pnl)}! +${mission.boss ? XP_REWARDS.boss : XP_REWARDS.mission} XP` +
      (mission.boss ? "<br><br>🎓 You have completed your training, <strong>Legendary Trade Master</strong>!" : ""), true);
    announceRankUp(rankUp);
  } else {
    popup("🌙", "Day over — mission not cleared",
      `You finished with ${fmtKoin(stats.pnl)}, but the goal wasn't met.<br><em>"Every master has failed more times than the beginner has tried."</em> — Sensei Hoshi.<br>Try again!`);
  }
  // announce any new badges from this day
  BADGES.forEach(b => {
    if (Game.state.badges[b.id] && !hadBadges.includes(b.id)) announceBadge(b.id);
  });
  renderHud();
  renderMissions();
}

function quitMission() {
  Sim.quit();
  renderMissions();
}

// sim controls
$("btn-long").addEventListener("click", () => Sim.openTrade(1));
$("btn-short").addEventListener("click", () => Sim.openTrade(-1));
$("btn-close").addEventListener("click", () => Sim.closeTrade());
$("sim-quit").addEventListener("click", quitMission);
$("btn-pause").addEventListener("click", () => {
  Sim.paused = !Sim.paused;
  $("btn-pause").textContent = Sim.paused ? "▶ Resume" : "⏸ Pause";
});
$("btn-speed").addEventListener("click", () => {
  Sim.speed = Sim.speed === 1 ? 2 : Sim.speed === 2 ? 4 : 1;
  $("btn-speed").textContent = `⏩ Speed: ${Sim.speed}x`;
});
$("stop-seg").querySelectorAll("button").forEach(btn =>
  btn.addEventListener("click", () => {
    $("stop-seg").querySelectorAll("button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    Sim.stopSize = Number(btn.dataset.stop);
  }));

// ---------- profile ----------
function renderProfile() {
  const s = Game.state;
  const rank = Game.rank();
  $("profile-avatar").textContent = s.avatar;
  $("profile-name").textContent = s.name;
  $("profile-rank").textContent = rank.emoji + " " + rank.name;
  $("profile-xp").textContent = s.xp + " XP total";
  const grid = $("badge-grid");
  grid.innerHTML = "";
  BADGES.forEach(b => {
    const el = document.createElement("div");
    el.className = "badge" + (s.badges[b.id] ? "" : " locked");
    el.innerHTML = `<div class="b-emoji">${b.emoji}</div><div class="b-name">${b.name}</div><div class="b-desc">${b.desc}</div>`;
    grid.appendChild(el);
  });
  const r = s.record;
  $("profile-stats").innerHTML = `
    <div class="stat"><span class="stat-label">Dojo days</span><span>${r.days}</span></div>
    <div class="stat"><span class="stat-label">Green days 🌞</span><span>${r.greenDays}</span></div>
    <div class="stat"><span class="stat-label">Trades closed</span><span>${r.trades}</span></div>
    <div class="stat"><span class="stat-label">Best day</span><span>${r.bestDay > 0 ? "+" + r.bestDay + " Koins" : "—"}</span></div>`;
}

$("reset-btn").addEventListener("click", () => {
  if (confirm("Reset ALL progress? This cannot be undone!")) {
    Game.reset();
    location.reload();
  }
});

// ---------- boot ----------
Game.load();
setupWelcome();
renderHud();
if (Game.state.name) showScreen("map");
else { document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden")); $("screen-welcome").classList.remove("hidden"); }
