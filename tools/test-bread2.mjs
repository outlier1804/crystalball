global.localStorage = { _d:{}, getItem(k){return this._d[k]||null}, setItem(k,v){this._d[k]=v}, removeItem(k){delete this._d[k]} };
const { MISSIONS, ASSETS } = await import("../src/engine/data.js");
const { Sim } = await import("../src/engine/sim.js");
const m10 = MISSIONS.find(m=>m.id==="m10");
Sim.onLog=()=>{}; Sim.onUpdate=()=>{}; let ended=null; Sim.onEnd=s=>ended=s; Sim.onTradeClose=()=>{};
let passes=0, confAppeared=0, attempts=16, conf=[];
for(let a=0;a<attempts;a++){
  ended=null;
  Sim.start(m10, a%2?ASSETS.GC:ASSETS.NQ); clearTimeout(Sim.timer); Sim.scheduleNext=()=>{}; Sim.stopSize=5;
  let trades=0, held=0, sawConf=false;
  while(Sim.running){
    if(Sim.orComplete && Sim.signals().conf!==0) sawConf=true;
    if(!Sim.position && Sim.orComplete && trades<3){ const s=Sim.signals(); if(s.conf!==0){ Sim.openTrade(s.conf); trades++; held=0; } }
    else if(Sim.position){ held++; if(held>=6) Sim.closeTrade(); }
    Sim.step();
  }
  if(sawConf) confAppeared++;
  conf.push(ended.confluenceTrades);
  if(m10.check(ended)) passes++;
}
console.log("over", attempts, "runs: confluence appeared in", confAppeared, "| disciplined-bot passes", passes, "| conf trades:", conf.join(","));
