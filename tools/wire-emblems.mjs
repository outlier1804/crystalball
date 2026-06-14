// Replace the kai/hana avatar SVGs in src/engine/characters.js with emblem crests.
import fs from "node:fs";
const f = "src/engine/characters.js";
let s = fs.readFileSync(f, "utf8");

const KAI = `
  <svg viewBox="0 0 200 200" class="hero-svg" aria-label="Kai crest">
    <defs>
      <radialGradient id="kf" cx="50%" cy="40%" r="68%"><stop offset="0%" stop-color="#6a2327"/><stop offset="100%" stop-color="#260c10"/></radialGradient>
      <linearGradient id="kring" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff0bf"/><stop offset="45%" stop-color="#e8b44c"/><stop offset="100%" stop-color="#8a5e1e"/></linearGradient>
      <linearGradient id="kflame" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#ff3b2f"/><stop offset="50%" stop-color="#ff8a3d"/><stop offset="100%" stop-color="#ffe585"/></linearGradient>
      <linearGradient id="kblade" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#f2f8ff"/><stop offset="100%" stop-color="#9fb8d8"/></linearGradient>
    </defs>
    <circle cx="100" cy="100" r="94" fill="url(#kring)"/>
    <circle cx="100" cy="100" r="93" fill="none" stroke="#5e3d12" stroke-width="1.5"/>
    <g fill="#fff6d8"><circle cx="186" cy="100" r="3.6"/><circle cx="161" cy="161" r="3.6"/><circle cx="100" cy="186" r="3.6"/><circle cx="39" cy="161" r="3.6"/><circle cx="14" cy="100" r="3.6"/><circle cx="39" cy="39" r="3.6"/><circle cx="100" cy="14" r="3.6"/><circle cx="161" cy="39" r="3.6"/></g>
    <circle cx="100" cy="100" r="81" fill="url(#kf)" stroke="#1a0a0c" stroke-width="2"/>
    <g transform="rotate(30 100 112)"><rect x="96" y="40" width="7" height="92" rx="3" fill="url(#kblade)"/><rect x="94" y="130" width="11" height="30" rx="3" fill="#241d33"/><rect x="90" y="126" width="19" height="5" rx="2" fill="#e8b44c"/></g>
    <g transform="rotate(-30 100 112)"><rect x="97" y="40" width="7" height="92" rx="3" fill="url(#kblade)"/><rect x="95" y="130" width="11" height="30" rx="3" fill="#241d33"/><rect x="91" y="126" width="19" height="5" rx="2" fill="#e8b44c"/></g>
    <path d="M100 50 C124 80 120 106 108 120 C117 121 119 112 116 105 C127 120 113 138 100 136 C87 138 73 120 84 105 C81 112 83 121 92 120 C80 106 76 80 100 50 Z" fill="url(#kflame)" stroke="#fff2c0" stroke-width="1.6"/>
    <path d="M100 74 C113 92 110 110 103 120 C110 119 109 112 107 108 C114 119 104 130 100 128 C96 130 86 119 93 108 C91 112 90 119 97 120 C90 110 87 92 100 74 Z" fill="#ffe585"/>
    <g fill="#fff2c0"><circle cx="58" cy="62" r="2.4"/><circle cx="142" cy="66" r="2"/><circle cx="150" cy="120" r="2.2"/></g>
  </svg>`;

const HANA = `
  <svg viewBox="0 0 200 200" class="hero-svg" aria-label="Hana crest">
    <defs>
      <radialGradient id="hf" cx="50%" cy="40%" r="68%"><stop offset="0%" stop-color="#3a2a72"/><stop offset="100%" stop-color="#160f33"/></radialGradient>
      <linearGradient id="hring" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff0bf"/><stop offset="45%" stop-color="#e8b44c"/><stop offset="100%" stop-color="#8a5e1e"/></linearGradient>
      <linearGradient id="hblade" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#f2f8ff"/><stop offset="100%" stop-color="#9fb8d8"/></linearGradient>
      <radialGradient id="hpetal" cx="50%" cy="30%" r="80%"><stop offset="0%" stop-color="#ffd1e6"/><stop offset="100%" stop-color="#ff6fa6"/></radialGradient>
    </defs>
    <circle cx="100" cy="100" r="94" fill="url(#hring)"/>
    <circle cx="100" cy="100" r="93" fill="none" stroke="#5e3d12" stroke-width="1.5"/>
    <g fill="#fff6d8"><circle cx="186" cy="100" r="3.6"/><circle cx="161" cy="161" r="3.6"/><circle cx="100" cy="186" r="3.6"/><circle cx="39" cy="161" r="3.6"/><circle cx="14" cy="100" r="3.6"/><circle cx="39" cy="39" r="3.6"/><circle cx="100" cy="14" r="3.6"/><circle cx="161" cy="39" r="3.6"/></g>
    <circle cx="100" cy="100" r="81" fill="url(#hf)" stroke="#0e0a22" stroke-width="2"/>
    <path d="M44 124 q28 -18 56 0 q28 18 56 0" fill="none" stroke="#3ee6ff" stroke-width="5" stroke-linecap="round" opacity="0.85"/>
    <path d="M48 138 q26 -14 52 0 q26 14 52 0" fill="none" stroke="#7fd4ff" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
    <g transform="rotate(30 100 108)"><rect x="96" y="42" width="7" height="86" rx="3" fill="url(#hblade)"/><rect x="94" y="126" width="11" height="28" rx="3" fill="#241d33"/><rect x="90" y="122" width="19" height="5" rx="2" fill="#e8b44c"/></g>
    <g transform="rotate(-30 100 108)"><rect x="97" y="42" width="7" height="86" rx="3" fill="url(#hblade)"/><rect x="95" y="126" width="11" height="28" rx="3" fill="#241d33"/><rect x="91" y="122" width="19" height="5" rx="2" fill="#e8b44c"/></g>
    <g transform="rotate(0 100 96)"><path d="M100 96 C88 80 92 62 100 56 C108 62 112 80 100 96 Z" fill="url(#hpetal)" stroke="#ff4f9a" stroke-width="1"/></g>
    <g transform="rotate(72 100 96)"><path d="M100 96 C88 80 92 62 100 56 C108 62 112 80 100 96 Z" fill="url(#hpetal)" stroke="#ff4f9a" stroke-width="1"/></g>
    <g transform="rotate(144 100 96)"><path d="M100 96 C88 80 92 62 100 56 C108 62 112 80 100 96 Z" fill="url(#hpetal)" stroke="#ff4f9a" stroke-width="1"/></g>
    <g transform="rotate(216 100 96)"><path d="M100 96 C88 80 92 62 100 56 C108 62 112 80 100 96 Z" fill="url(#hpetal)" stroke="#ff4f9a" stroke-width="1"/></g>
    <g transform="rotate(288 100 96)"><path d="M100 96 C88 80 92 62 100 56 C108 62 112 80 100 96 Z" fill="url(#hpetal)" stroke="#ff4f9a" stroke-width="1"/></g>
    <circle cx="100" cy="96" r="7" fill="#ffd34f"/>
    <g fill="#bfefff"><circle cx="58" cy="64" r="2.4"/><circle cx="142" cy="66" r="2"/><circle cx="150" cy="118" r="2.2"/></g>
  </svg>`;

s = s.replace(/(id: "kai"[\s\S]*?svg: )`[\s\S]*?`,/, (m, p1) => p1 + "`" + KAI + "`,");
s = s.replace(/(id: "hana"[\s\S]*?svg: )`[\s\S]*?`,/, (m, p1) => p1 + "`" + HANA + "`,");
fs.writeFileSync(f, s);
console.log("emblems wired into characters.js");
