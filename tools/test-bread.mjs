global.localStorage = { _d:{}, getItem(k){return this._d[k]||null}, setItem(k,v){this._d[k]=v}, removeItem(k){delete this._d[k]} };
const { ARCS, MISSIONS, RANKS, BADGES } = await import("../src/engine/data.js");
const { Game } = await import("../src/engine/game.js");
const { Sim } = await import("../src/engine/sim.js");
const ASSETS = (await import("../src/engine/data.js")).ASSETS;
console.log("arcs:", ARCS.length, "missions:", MISSIONS.length, "| arc10:", !!ARCS.find(a=>a.id==="arc10"), "m10:", !!MISSIONS.find(m=>m.id==="m10"), "playbook badge:", !!BADGES.find(b=>b.id==="playbook"), "top rank:", RANKS[RANKS.length-1].name);

// full progression
Game.load();
for (const arc of ARCS){ Game.completeLesson(arc.id); Game.completeQuiz(arc.id, arc.quiz.length, arc.quiz.length); }
for (const m of MISSIONS){ if(!Game.missionUnlocked(m)) console.log("LOCKED:", m.id); Game.completeMission(m); }
console.log("after all: XP", Game.state.xp, "rank", Game.rank().name, "| playbook badge:", !!Game.state.badges.playbook, "scholar:", !!Game.state.badges.scholar);

// m10 solvability — disciplined bot enters only on confluence, with a shield
const m10 = MISSIONS.find(m=>m.id==="m10");
Sim.onLog=()=>{}; Sim.onUpdate=()=>{}; let ended=null; Sim.onEnd=s=>ended=s; Sim.onTradeClose=()=>{};
let passes=0, attempts=8, confSeen=[];
for(let a=0;a<attempts;a++){
  ended=null;
  Sim.start(m10, ASSETS.NQ); clearTimeout(Sim.timer); Sim.scheduleNext=()=>{}; Sim.stopSize=5;
  let trades=0, heldFor=0;
  while(Sim.running){
    if(!Sim.position && Sim.orComplete && trades<3){
      const s=Sim.signals();
      if(s.conf!==0){ Sim.openTrade(s.conf); trades++; heldFor=0; }
    } else if(Sim.position){ heldFor++; if(heldFor>=6) Sim.closeTrade(); } // hold ~6 candles then exit
    Sim.step();
  }
  confSeen.push(ended.confluenceTrades);
  if(m10.check(ended)) passes++;
}
console.log("m10 over", attempts, "runs: passes", passes, "| confluenceTrades per run:", confSeen.join(","));
console.log("DONE");
