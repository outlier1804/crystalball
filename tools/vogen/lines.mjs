#!/usr/bin/env node
// Dump every spoken line in the game as JSON on stdout, for gen.py to synthesize.
//
// The cast table and the text-cleaning rule live in src/engine/speech.js — this
// imports them rather than re-implementing, so the manifest keys the generator
// writes are byte-identical to the ones the game looks up at runtime.
//
//   node tools/vogen/lines.mjs > lines.json

import { ARCS } from "../../src/engine/data.js";
import { castFor, voClean, voKey } from "../../src/engine/speech.js";

const out = [];
const seen = new Set();

for (const arc of ARCS) {
  arc.lessons.forEach((line, i) => {
    const who = line.c?.name || "";
    const text = voClean(line.t);
    if (!text) return;
    const key = voKey(who, text);
    if (seen.has(key)) return;          // identical line, same speaker — render once
    seen.add(key);
    const cast = castFor(who);
    out.push({ key, who, text, voice: cast.voice, speed: cast.speed, src: `${arc.id}:${i}` });
  });
}

process.stdout.write(JSON.stringify(out, null, 2));
