// One-off: convert the copied engine modules in src/engine into ES modules.
import fs from "node:fs";

const dir = "src/engine/";
const read = f => fs.readFileSync(dir + f, "utf8");
const write = (f, s) => fs.writeFileSync(dir + f, s);
const exp = (s, names) =>
  names.reduce((acc, n) =>
    acc.replace(new RegExp(`^const ${n} =`, "m"), `export const ${n} =`), s);

// characters.js
let c = read("characters.js");
c = exp(c, ["CHARACTER_ART", "AVATARS"]);
c = c.replace(/^function avatarSvg\(/m, "export function avatarSvg(");
write("characters.js", c);

// data.js
let d = read("data.js");
d = exp(d, ["SENSEI", "KITSU", "KAZUO", "RANKS", "ASSETS", "ARCS", "MISSIONS", "BADGES", "XP_REWARDS"]);
write("data.js", d);

// game.js
let g = read("game.js");
g = `import { RANKS, ARCS, MISSIONS, BADGES, XP_REWARDS } from "./data.js";\n\n` + g;
g = exp(g, ["Game"]);
write("game.js", g);

// audio.js
let a = read("audio.js");
a = a.replace(/^const Sound = /m, "export const Sound = ");
write("audio.js", a);

// speech.js
let sp = read("speech.js");
sp = exp(sp, ["Speak"]);
write("speech.js", sp);

// sim.js
let s = read("sim.js");
s = `import { ASSETS } from "./data.js";\n\n` + s;
s = exp(s, ["Sim", "Chart"]);
s = s.replace(/^function fmtKoin\(/m, "export function fmtKoin(");
write("sim.js", s);

// fx.js
let fx = read("fx.js");
fx = fx.replace(/^const FX = /m, "export const FX = ");
write("fx.js", fx);

// sensei.js
let se = read("sensei.js");
se = `import { Game } from "./game.js";\n` +
     `import { ARCS, MISSIONS, BADGES } from "./data.js";\n` +
     `import { CHARACTER_ART } from "./characters.js";\n` +
     `import { Sound } from "./audio.js";\n\n` + se;
se = exp(se, ["Sensei"]);
// null-guard the tour's wait-for-popup check (popup is React-managed now)
se = se.replace(
  'if (!popupEl.classList.contains("hidden")) return setTimeout(tour, 400);',
  'if (popupEl && !popupEl.classList.contains("hidden")) return setTimeout(tour, 400);'
);
write("sensei.js", se);

console.log("engine modules converted to ESM");
