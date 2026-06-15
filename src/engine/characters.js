// ====== Animated SVG character portraits ======
// Each character is hand-drawn inline SVG. CSS animates the parts by class:
//   .eyes  → blinks    .mouth → talks while text is typing
//   .tail  → swishes   .glint → sunglasses shine   .brow → wise wiggle

export const CHARACTER_ART = {

  // Sensei Hoshi — wise owl with golden scholar glasses
  "Sensei Hoshi": `
  <svg viewBox="0 0 100 100" class="char-svg" aria-label="Sensei Hoshi the owl">
    <polygon points="28,28 24,10 40,22" fill="#6e5238"/>
    <polygon points="60,22 76,10 72,28" fill="#6e5238"/>
    <ellipse cx="50" cy="58" rx="29" ry="32" fill="#8d6b4f"/>
    <ellipse cx="24" cy="62" rx="7" ry="15" fill="#6e5238" transform="rotate(14 24 62)"/>
    <ellipse cx="76" cy="62" rx="7" ry="15" fill="#6e5238" transform="rotate(-14 76 62)"/>
    <ellipse cx="50" cy="70" rx="18" ry="17" fill="#e8d4b8"/>
    <path d="M38,72 q4,-5 8,0 M50,76 q4,-5 8,0" stroke="#c9b294" stroke-width="1.6" fill="none"/>
    <g class="eyes">
      <circle cx="38" cy="42" r="11" fill="#fff"/>
      <circle cx="62" cy="42" r="11" fill="#fff"/>
      <circle cx="38" cy="43" r="5.5" fill="#3b2614"/>
      <circle cx="62" cy="43" r="5.5" fill="#3b2614"/>
      <circle cx="40" cy="41" r="2" fill="#fff"/>
      <circle cx="64" cy="41" r="2" fill="#fff"/>
    </g>
    <circle cx="38" cy="42" r="12.5" fill="none" stroke="#d9b44a" stroke-width="2"/>
    <circle cx="62" cy="42" r="12.5" fill="none" stroke="#d9b44a" stroke-width="2"/>
    <line x1="50.5" y1="42" x2="49.5" y2="42" stroke="#d9b44a" stroke-width="2"/>
    <path class="brow" d="M28,28 L46,33" stroke="#4a3322" stroke-width="3" stroke-linecap="round"/>
    <path class="brow" d="M72,28 L54,33" stroke="#4a3322" stroke-width="3" stroke-linecap="round"/>
    <polygon class="mouth" points="45,52 55,52 50,61" fill="#f0a035"/>
    <ellipse cx="42" cy="89" rx="5" ry="3" fill="#f0a035"/>
    <ellipse cx="58" cy="89" rx="5" ry="3" fill="#f0a035"/>
  </svg>`,

  // Kitsu — cheeky fox with a swishing tail
  "Kitsu the Fox": `
  <svg viewBox="0 0 100 100" class="char-svg" aria-label="Kitsu the fox">
    <path class="tail" d="M76,76 Q96,68 92,46 Q90,60 78,64 Z" fill="#ff9a4d"/>
    <path class="tail" d="M88,52 Q92,48 92,46 Q91,53 86,57 Z" fill="#fff4ea"/>
    <polygon points="22,32 32,4 46,28" fill="#ff9a4d"/>
    <polygon points="27,28 33,12 41,26" fill="#d96a2b"/>
    <polygon points="54,28 68,4 78,32" fill="#ff9a4d"/>
    <polygon points="59,26 67,12 73,28" fill="#d96a2b"/>
    <ellipse cx="50" cy="54" rx="30" ry="27" fill="#ff9a4d"/>
    <ellipse cx="50" cy="65" rx="17" ry="12" fill="#fff4ea"/>
    <g class="eyes">
      <circle cx="37" cy="47" r="6" fill="#3b2614"/>
      <circle cx="63" cy="47" r="6" fill="#3b2614"/>
      <circle cx="39" cy="45" r="2.2" fill="#fff"/>
      <circle cx="65" cy="45" r="2.2" fill="#fff"/>
    </g>
    <circle cx="27" cy="59" r="4.5" fill="#ff6f9c" opacity=".55"/>
    <circle cx="73" cy="59" r="4.5" fill="#ff6f9c" opacity=".55"/>
    <polygon points="46,58 54,58 50,63" fill="#5a3217"/>
    <path class="mouth" d="M43,67 Q46,71 50,67 Q54,71 57,67" stroke="#5a3217" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M14,52 L28,54 M14,60 L28,59" stroke="#d96a2b" stroke-width="1.5"/>
    <path d="M86,52 L72,54 M86,60 L72,59" stroke="#d96a2b" stroke-width="1.5"/>
  </svg>`,

  // Kazuo — spiky-haired rival, never seen without his shades
  "Rival Kazuo": `
  <svg viewBox="0 0 100 100" class="char-svg" aria-label="Rival Kazuo">
    <rect x="36" y="76" width="28" height="18" rx="6" fill="#2b2f55"/>
    <circle cx="50" cy="52" r="25" fill="#ffcf9f"/>
    <polygon points="25,56 20,26 33,38 38,16 48,34 55,14 63,32 76,20 73,38 82,30 75,56 70,42 30,42" fill="#2c3e75"/>
    <rect x="26" y="40" width="48" height="8" rx="4" fill="#ff4f9a"/>
    <polygon points="74,42 86,38 84,48 74,48" fill="#ff4f9a"/>
    <g class="shades">
      <rect x="29" y="50" width="17" height="10" rx="4.5" fill="#11122b"/>
      <rect x="54" y="50" width="17" height="10" rx="4.5" fill="#11122b"/>
      <line x1="46" y1="54" x2="54" y2="54" stroke="#11122b" stroke-width="3"/>
      <rect class="glint" x="32" y="51" width="4" height="8" rx="2" fill="#9fe8ff" opacity="0"/>
    </g>
    <path class="mouth" d="M41,68 Q49,74 60,66" stroke="#8a4b2f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="25" cy="56" r="4" fill="#ffcf9f"/>
    <circle cx="75" cy="56" r="4" fill="#ffcf9f"/>
  </svg>`,
};

// ====== Player hero avatars: one guy (Kai), one girl (Hana) ======
// Full-body, animated, and used on the Fortnite-style character-select screen.
export const AVATARS = [
  {
    id: "kai", name: "Kai", tag: "Ember Slayer — Flame Warrior", aura: "flame",
    svg: `
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
  </svg>`,
  },
  {
    id: "hana", name: "Hana", tag: "Blossom Slayer — Water Blade", aura: "water",
    svg: `
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
  </svg>`,
  },
];

// Look up an avatar's full-body SVG; falls back to a clean premium manga-themed SVG crest if not found.
export function avatarSvg(id) {
  const a = AVATARS.find(x => x.id === id);
  if (a) return a.svg;
  return `
  <svg viewBox="0 0 100 100" class="hero-svg" aria-label="Ninja Crest">
    <circle cx="50" cy="50" r="45" fill="#e63946" stroke="#111111" stroke-width="4"/>
    <path d="M 25,40 C 25,40 50,25 75,40 C 75,40 85,55 75,70 C 65,85 35,85 25,70 C 15,55 25,40 25,40 Z" fill="#111111" stroke="#ffffff" stroke-width="2.5"/>
    <path d="M 30,51 Q 50,43 70,51 L 70,55 Q 50,49 30,55 Z" fill="#ffffff"/>
    <circle cx="42" cy="52" r="2.5" fill="#111111"/>
    <circle cx="58" cy="52" r="2.5" fill="#111111"/>
  </svg>
  `;
}

