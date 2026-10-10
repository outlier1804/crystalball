#!/usr/bin/env node
// Build a v3 lesson film from a spec.
//
//   node films/build.mjs <id> [<id> …]        # narration + index.html for each
//   node films/build.mjs all
//
// A spec (films/specs/<id>.mjs) is the whole film in one place:
//
//   export default {
//     id: "structure",
//     beats: [ { say: "…narration…", kicker: "…", title: "…" }, … ],
//     scene(K, B) { …draw with the kit, schedule on K.tl using beat starts B[i]… },
//   };
//
// This script renders each beat's narration with the local Kokoro voice (cached by
// text), measures it, lays the beats end to end, and writes a self-contained
// HyperFrames project at films/<id>/ with the kit (below) and the scene inlined.
// The look — paper, type, candle colours, headline behaviour — lives here once,
// so every film in the course matches without each spec restating it.
//
// Then, per film:  hyperframes check  →  hyperframes render  (see films/render.sh)
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const CLI = process.env.HF_CLI ||
  "/Users/wealtharchitect/.claude/plugins/cache/hyperframes/hyperframes/0.8.140/skills/hyperframes/scripts/plugin-cli.mjs";
const VOICE = "af_heart", SPEED = "0.96";
const LEAD = 0.4, GAP = 0.55, TAIL = 1.8;      // seconds: before the first line, between lines, after the last

const dur = (f) => +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" }).trim();

function narrate(dir, text) {
  const key = createHash("sha1").update(VOICE + SPEED + text).digest("hex").slice(0, 12);
  const out = join(dir, "assets", "vo", key + ".wav");
  if (!existsSync(out)) {
    execFileSync("node", [CLI, "tts", text, "-o", out, "-v", VOICE, "-s", SPEED], { stdio: "ignore" });
  }
  return { file: "assets/vo/" + key + ".wav", dur: dur(out) };
}

// ---------------------------------------------------------------------------
// The kit. Runs in the page. Everything is drawn into one 1920x1080 SVG and
// revealed on a single paused GSAP timeline, so any frame is a pure function of
// time. Coordinates are candle index (x) and price (y, up is up).
// ---------------------------------------------------------------------------
function KIT(B, HEADS) {
  const NS = "http://www.w3.org/2000/svg";
  const C = { ink: "#f4f1e8", up: "#f4f1e8", down: "#ff5d6a", red: "#ff5d6a", blue: "#9db1ff", gold: "#ffd978", green: "#7df0a8", dim: "#b9b5ab", night: "#14131a" };
  const $ = (id) => document.getElementById(id);
  const tl = gsap.timeline({ paused: true });
  let P = { x0: 170, x1: 1750, top: 330, bot: 900, lo: 0, hi: 100, n: 16 };
  let uid = 0;
  const hidden = [];

  const el = (tag, attrs, parent, text) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (tag === "text") n.setAttribute("data-layout-allow-overflow", "");
    (parent || $("marks")).appendChild(n);
    return n;
  };
  const group = (layer, id) => { const g = el("g", { id: id || "k" + ++uid }, $(layer || "marks")); hidden.push("#" + g.id); return g; };

  const K = {
    C, tl, B,
    /** Set the plot area: n candles wide, price range lo..hi. */
    area(o) { P = { ...P, ...o }; return K; },
    step: () => (P.x1 - P.x0) / P.n,
    X: (i) => P.x0 + ((P.x1 - P.x0) / P.n) * (i + 0.5),
    Y: (p) => P.bot - ((p - P.lo) / (P.hi - P.lo)) * (P.bot - P.top),

    /** Candles from [open, high, low, close] rows. Hidden until shown. Returns the row objects. */
    candles(rows, o = {}) {
      const bw = o.width || Math.min(64, K.step() * 0.58);   // o.at shifts the whole set right by that many candle slots
      return rows.map((r, i) => {
        const [op, hi, lo, cl] = r, up = cl >= op, col = o.color || (up ? C.up : C.down);
        const g = el("g", { id: (o.prefix || "c") + i }, $("candles"));
        hidden.push("#" + g.id);
        const top = K.Y(Math.max(op, cl)), bot = K.Y(Math.min(op, cl)), x = K.X(i + (o.at || 0));
        el("line", { x1: x, y1: K.Y(hi), x2: x, y2: K.Y(lo), stroke: col, "stroke-width": Math.max(4, bw * 0.12), "stroke-linecap": "round" }, g);
        el("rect", { x: x - bw / 2, y: top, width: bw, height: Math.max(5, bot - top), rx: 5, fill: col }, g);
        return { i, o: op, h: hi, l: lo, c: cl, up, id: "#" + g.id };
      });
    },
    /** Pop one candle in. */
    show(i, at, prefix = "c") {
      tl.fromTo("#" + prefix + i, { opacity: 0, scaleY: 0.15, transformOrigin: "50% 50%" }, { opacity: 1, scaleY: 1, duration: 0.34, ease: "back.out(2.2)" }, at);
      return K;
    },
    /** Pop candles from..to in, evenly, between t0 and t1. */
    run(from, to, t0, t1, prefix = "c") {
      const n = to - from + 1;
      for (let i = from; i <= to; i++) K.show(i, t0 + ((t1 - t0) * (i - from)) / n, prefix);
      return K;
    },

    /** Horizontal level at a price, from candle a to candle b, with a label pill. */
    level(price, o = {}) {
      const g = group("levels", o.id), col = o.color || C.blue, y = K.Y(price);
      const xa = o.from != null ? K.X(o.from) - K.step() / 2 : P.x0, xb = o.to != null ? K.X(o.to) + K.step() / 2 : P.x1;
      el("line", { x1: xa, y1: y, x2: xb, y2: y, stroke: col, "stroke-width": o.width || 5, "stroke-dasharray": o.solid ? "" : "18 12", "stroke-linecap": "round" }, g);
      if (o.label) K._pill(g, o.side === "left" ? xa + 8 : xb - 8, y + (o.below ? 36 : -36), o.label, col, o.side === "left" ? "start" : "end", o.size);
      return "#" + g.id;
    },
    _pill(g, x, y, text, col, anchor = "middle", size = 34) {
      const w = text.length * size * 0.66 + 44, h = size + 24;
      const left = anchor === "start" ? x : anchor === "end" ? x - w : x - w / 2;
      el("rect", { x: left, y: y - h / 2, width: w, height: h, rx: h / 2, fill: col }, g);
      el("text", { x: left + w / 2, y: y + size * 0.36, "text-anchor": "middle", fill: C.night, "font-family": "Montserrat, sans-serif", "font-weight": 900, "font-size": size, "letter-spacing": 1.5 }, g, text);
    },
    /** A label pill at (candle i, price), nudged by dx/dy pixels. */
    tag(i, price, text, o = {}) {
      const g = group("marks", o.id);
      K._pill(g, K.X(i) + (o.dx || 0), K.Y(price) + (o.dy || 0), text, o.color || C.ink, o.anchor || "middle", o.size || 34);
      return "#" + g.id;
    },
    /** Big display word (Bangers) at (candle i, price). */
    word(i, price, text, o = {}) {
      const g = group("marks", o.id);
      el("text", { x: K.X(i) + (o.dx || 0), y: K.Y(price) + (o.dy || 0), "text-anchor": o.anchor || "middle", fill: o.color || C.ink,
        "font-family": "Bangers, sans-serif", "font-size": o.size || 72, "letter-spacing": 3 }, g, text);
      return "#" + g.id;
    },
    /** Ring around (candle i, price). */
    ring(i, price, o = {}) {
      const g = group("marks", o.id);
      el("circle", { cx: K.X(i), cy: K.Y(price), r: o.r || 62, fill: "none", stroke: o.color || C.gold, "stroke-width": 7 }, g);
      return "#" + g.id;
    },
    /** Shaded zone from candle a..b, price lo..hi. */
    zone(a, b, lo, hi, o = {}) {
      const g = group("back", o.id), col = o.color || C.blue;
      const x = K.X(a) - K.step() / 2, w = K.X(b) + K.step() / 2 - x, y = K.Y(hi), h = K.Y(lo) - y;
      el("rect", { x, y, width: w, height: h, rx: 14, fill: col, "fill-opacity": o.fill ?? 0.16, stroke: col, "stroke-width": 4, "stroke-dasharray": o.dash ? "14 10" : "" }, g);
      if (o.label) K._pill(g, x + 14, y + (o.labelBelow ? h + 38 : -38), o.label, col, "start", o.size);
      return "#" + g.id;
    },
    /** Arrow from (ia, pa) to (ib, pb). */
    arrow(ia, pa, ib, pb, o = {}) {
      const g = group("marks", o.id), col = o.color || C.ink;
      const x1 = K.X(ia) + (o.dx1 || 0), y1 = K.Y(pa) + (o.dy1 || 0), x2 = K.X(ib) + (o.dx2 || 0), y2 = K.Y(pb) + (o.dy2 || 0);
      const a = Math.atan2(y2 - y1, x2 - x1), s = 30;
      el("line", { x1, y1, x2, y2, stroke: col, "stroke-width": 8, "stroke-linecap": "round" }, g);
      el("path", { d: `M${x2} ${y2} L${x2 - s * Math.cos(a - 0.45)} ${y2 - s * Math.sin(a - 0.45)} L${x2 - s * Math.cos(a + 0.45)} ${y2 - s * Math.sin(a + 0.45)} Z`, fill: col }, g);
      return "#" + g.id;
    },
    /** A zig-zag line through [i, price] points (for staircases and paths). */
    path(points, o = {}) {
      const g = group(o.layer || "back", o.id);
      const d = points.map(([i, p], k) => (k ? "L" : "M") + K.X(i).toFixed(1) + " " + K.Y(p).toFixed(1)).join(" ");
      const n = el("path", { d, fill: "none", stroke: o.color || C.ink, "stroke-width": o.width || 8, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
      g.dataset.len = n.getTotalLength();
      n.setAttribute("stroke-dasharray", g.dataset.len);
      return "#" + g.id;
    },
    /** An HTML card laid over the chart, for sums and checklists. x/y/w in px. */
    card(html, o = {}) {
      const d = document.createElement("div");
      d.id = o.id || "k" + ++uid;
      d.className = "kcard " + (o.cls || "");
      d.style.cssText = `left:${o.x ?? 200}px;top:${o.y ?? 380}px;width:${o.w ?? 700}px;`;
      d.innerHTML = html;
      $("cards").appendChild(d);
      hidden.push("#" + d.id);
      return "#" + d.id;
    },

    // ---- reveals ----
    /** Fade + rise. */
    in(id, at, o = {}) { tl.fromTo(id, { opacity: 0, y: o.y ?? 26 }, { opacity: 1, y: 0, duration: o.d || 0.45, ease: "power3.out" }, at); return K; },
    /** Pop from small. */
    pop(id, at, o = {}) { tl.fromTo(id, { opacity: 0, scale: 0.5, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: o.d || 0.45, ease: "back.out(2.2)" }, at); return K; },
    /** Wipe in from the left (for levels). */
    wipe(id, at, o = {}) {
      tl.fromTo(id, { opacity: 0, scaleX: 0.02, transformOrigin: "0% 50%" }, { opacity: 1, scaleX: 1, duration: o.d || 0.6, ease: "power3.out" }, at); return K; },
    /** Draw a K.path() stroke. */
    draw(id, at, d = 1.2) {
      const len = +document.querySelector(id).dataset.len;
      tl.set(id, { opacity: 1 }, at);
      tl.fromTo(id + " path", { strokeDashoffset: len }, { strokeDashoffset: 0, duration: d, ease: "power1.inOut" }, at); return K; },
    out(id, at, d = 0.35) { tl.to(id, { opacity: 0, duration: d }, at); return K; },
    dim(id, at, to = 0.28) { tl.to(id, { opacity: to, duration: 0.4 }, at); return K; },
    lit(id, at) { tl.to(id, { opacity: 1, duration: 0.4 }, at); return K; },
    /** A quick double-pulse to pull the eye. */
    pulse(id, at) { tl.fromTo(id, { scale: 1 }, { scale: 1.14, duration: 0.22, repeat: 3, yoyo: true, ease: "sine.inOut", transformOrigin: "50% 50%" }, at); return K; },
    /** Shake the whole chart (news, a stop getting hit). */
    shake(at) { tl.fromTo("#cam", { rotation: 0 }, { rotation: 0.6, duration: 0.07, repeat: 5, yoyo: true, ease: "none" }, at); return K; },

    _finish() {
      // headlines: one in at each beat, the previous one out
      HEADS.forEach((h, i) => {
        const id = "#hd" + i, at = i === 0 ? 0.2 : B[i] - 0.1;
        tl.fromTo(id + " .kicker", { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.45, ease: "power3.out" }, at);
        tl.fromTo(id + " .title", { opacity: 0, x: -120, skewX: -14 }, { opacity: 1, x: 0, skewX: 0, duration: 0.55, ease: "back.out(1.5)" }, at + 0.08);
        if (i < HEADS.length - 1) tl.to(id, { opacity: 0, x: 80, duration: 0.3, ease: "power2.in" }, B[i + 1] - 0.5);
      });
      tl.fromTo("#brand", { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.3);
      if (hidden.length) tl.set(hidden, { opacity: 0 }, 0);
      window.__timelines["main"] = tl;
    },
  };
  return K;
}

const CSS = `
@font-face { font-family: "Bangers"; src: url("assets/fonts/Bangers.woff2") format("woff2"); font-weight: 400; font-style: normal; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #14131a; }
#root { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: Montserrat, sans-serif; color: #f4f1e8; }
#scene { position: absolute; inset: 0; }
#bg { position: absolute; inset: 0; background:
  radial-gradient(circle at 78% 18%, rgba(255, 93, 106, 0.16), transparent 46%),
  radial-gradient(circle at 12% 88%, rgba(91, 124, 250, 0.14), transparent 44%), #14131a; }
#dots { position: absolute; inset: 0; opacity: 0.5; background-image: radial-gradient(rgba(244, 241, 232, 0.07) 1.6px, transparent 1.7px); background-size: 22px 22px; }
#cam, #chart, #cards { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; }
#heads { position: absolute; left: 110px; top: 52px; width: 1500px; height: 230px; }
.head { position: absolute; left: 0; top: 0; width: 1500px; }
.kicker { display: inline-block; font-weight: 900; font-size: 30px; letter-spacing: 4px; text-transform: uppercase; padding: 8px 22px; border-radius: 999px; color: #14131a; background: #f4f1e8; }
.title { display: block; margin-top: 14px; font-family: "Bangers", sans-serif; font-weight: 400; font-size: 112px; line-height: 1; letter-spacing: 4px; color: #f4f1e8; text-shadow: 7px 7px 0 #ff5d6a; white-space: nowrap; }
.title.long { font-size: 92px; }
#brand { position: absolute; right: 110px; top: 64px; display: flex; align-items: center; gap: 14px; font-family: "Bangers", sans-serif; font-size: 34px; letter-spacing: 3px; color: #f4f1e8; }
#brand .cq { width: 62px; height: 62px; border-radius: 50%; background: #ff5d6a; border: 4px solid #f4f1e8; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #14131a; }
.kcard { position: absolute; background: #22212c; border: 5px solid #f4f1e8; border-radius: 28px; padding: 30px 38px; box-shadow: 12px 12px 0 #ff5d6a;
  font-weight: 700; font-size: 44px; line-height: 1.3; color: #f4f1e8; }
.kcard b { color: #ff8f98; font-weight: 900; }
.kcard .big { display: block; font-family: "Bangers", sans-serif; font-size: 96px; letter-spacing: 3px; line-height: 1.05; color: #f4f1e8; }
.kcard .small { display: block; font-size: 32px; color: #c9c5bb; font-weight: 700; margin-top: 8px; }
.kcard.plain { box-shadow: none; border-width: 4px; }
.kcard.good { border-color: #7df0a8; box-shadow: 12px 12px 0 #2f8f5b; }
.kcard.bad { border-color: #ff5d6a; }
`;

function html(spec, beats, total) {
  const B = beats.map((b) => +b.start.toFixed(2));
  const heads = spec.beats.map((b, i) =>
    `<div class="head" id="hd${i}"><span class="kicker">${b.kicker}</span><span class="title${b.title.length > 24 ? " long" : ""}">${b.title}</span></div>`).join("\n          ");
  const audio = beats.map((b, i) =>
    `<audio id="vo${i}" src="${b.file}" data-start="${b.start.toFixed(2)}" data-duration="${b.dur.toFixed(2)}" data-track-index="2" data-volume="1"></audio>`).join("\n      ");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>Candle Quest — ${spec.id}</title>
    <!-- GENERATED by films/build.mjs from films/specs/${spec.id}.mjs — edit the spec, not this file. -->
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>${CSS}</style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total.toFixed(2)}" data-width="1920" data-height="1080">
      <section id="scene" class="clip" data-start="0" data-duration="${total.toFixed(2)}" data-track-index="0">
        <div id="bg"></div>
        <div id="dots"></div>
        <div id="cam">
          <svg id="chart" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
            <g id="back"></g><g id="levels"></g><g id="candles"></g><g id="marks"></g>
          </svg>
          <div id="cards"></div>
        </div>
        <div id="heads">
          ${heads}
        </div>
        <div id="brand"><span class="cq">CQ</span><span>CANDLE QUEST</span></div>
      </section>
      ${audio}
    </div>
    <script>
      const B = ${JSON.stringify(B)};
      const K = (${KIT.toString()})(B, ${JSON.stringify(spec.beats.map((b) => b.title))});
      (${spec.scene.toString().replace(/^scene\s*\(/, "function (")})(K, B);
      K._finish();
    </script>
  </body>
</html>
`;
}

async function build(id) {
  const spec = (await import(pathToFileURL(join(HERE, "specs", id + ".mjs")).href + "?t=" + Date.now())).default;
  const dir = join(HERE, id);
  mkdirSync(join(dir, "assets", "vo"), { recursive: true });
  mkdirSync(join(dir, "assets", "fonts"), { recursive: true });
  cpSync(join(HERE, "sessions", "assets", "fonts", "Bangers.woff2"), join(dir, "assets", "fonts", "Bangers.woff2"));
  for (const f of ["hyperframes.json", "package.json"]) if (!existsSync(join(dir, f))) cpSync(join(HERE, "sessions", f), join(dir, f));
  writeFileSync(join(dir, "meta.json"), JSON.stringify({ id, name: id, createdAt: "2026-10-10T00:00:00.000Z" }, null, 2));

  let t = LEAD;
  const beats = spec.beats.map((b) => {
    const a = narrate(dir, b.say);
    const out = { ...a, start: t };
    t += a.dur + GAP;
    return out;
  });
  const total = Math.ceil((t - GAP + TAIL) * 10) / 10;
  writeFileSync(join(dir, "index.html"), html(spec, beats, total));
  console.log(`${id}: ${beats.length} beats, ${total}s  B=[${beats.map((b) => b.start.toFixed(1)).join(", ")}]`);
}

const ids = process.argv.slice(2);
const all = readdirSync(join(HERE, "specs")).filter((f) => f.endsWith(".mjs")).map((f) => f.replace(/\.mjs$/, ""));
for (const id of ids[0] === "all" ? all : ids) await build(id);
