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
    id: "kai", name: "Kai", tag: "The Bold Bull 🐂",
    svg: `
  <svg viewBox="0 0 180 250" class="hero-svg" aria-label="Kai the trader">
    <ellipse cx="90" cy="244" rx="50" ry="7" fill="#000" opacity="0.2"/>
    <rect x="73" y="176" width="16" height="54" rx="7" fill="#221a44"/>
    <rect x="91" y="176" width="16" height="54" rx="7" fill="#221a44"/>
    <path d="M68 226 q-2 12 8 12 h13 v-14 z" fill="#eef7ff" stroke="#3ee6ff" stroke-width="2.5"/>
    <path d="M112 226 q2 12 -8 12 h-13 v-14 z" fill="#eef7ff" stroke="#3ee6ff" stroke-width="2.5"/>
    <rect class="armL" x="49" y="132" width="15" height="50" rx="7.5" fill="#41348f"/>
    <rect class="armR" x="116" y="132" width="15" height="50" rx="7.5" fill="#41348f"/>
    <circle cx="56" cy="184" r="8.5" fill="#ffd6ad"/>
    <circle cx="124" cy="184" r="8.5" fill="#ffd6ad"/>
    <path d="M60 130 q30 -14 60 0 l7 54 q-37 13 -74 0 z" fill="#41348f" stroke="#5b4cc0" stroke-width="2.5"/>
    <path d="M70 126 q20 16 40 0 l-7 15 q-13 7 -26 0 z" fill="#2c2160"/>
    <line x1="90" y1="132" x2="90" y2="182" stroke="#ff4f9a" stroke-width="3.5"/>
    <circle cx="90" cy="132" r="3" fill="#ff4f9a"/>
    <path d="M74 162 h32 v7 q-16 7 -32 0 z" fill="#2c2160"/>
    <rect x="82" y="112" width="16" height="18" rx="6" fill="#eebf94"/>
    <path class="hair" d="M40 86 q-6 -56 50 -60 q56 4 50 60 q3 16 -8 28 l-9 -40 q-33 14 -66 0 l-9 40 q-11 -12 -8 -28z" fill="#26294d"/>
    <ellipse cx="90" cy="80" rx="49" ry="51" fill="#ffd6ad"/>
    <circle cx="42" cy="82" r="8" fill="#ffd6ad"/>
    <circle cx="138" cy="82" r="8" fill="#ffd6ad"/>
    <g class="eyes">
      <ellipse cx="72" cy="84" rx="10" ry="13" fill="#fff"/>
      <ellipse cx="108" cy="84" rx="10" ry="13" fill="#fff"/>
      <circle cx="73" cy="86" r="7" fill="#2b6cff"/>
      <circle cx="109" cy="86" r="7" fill="#2b6cff"/>
      <circle cx="73" cy="86" r="3.4" fill="#10204f"/>
      <circle cx="109" cy="86" r="3.4" fill="#10204f"/>
      <circle cx="76" cy="82" r="2.6" fill="#fff"/>
      <circle cx="112" cy="82" r="2.6" fill="#fff"/>
    </g>
    <path d="M62 66 q10 -5 19 0" stroke="#26294d" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M99 66 q10 -5 19 0" stroke="#26294d" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M80 104 q10 9 20 0" stroke="#c06b34" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path class="hair" d="M43 78 Q40 36 90 30 Q140 36 137 78 L126 50 L118 70 L108 44 L100 68 L90 40 L80 68 L72 46 L62 70 L54 50 Z" fill="#26294d"/>
    <path d="M126 50 l-3 9 M108 44 l-2 10 M90 40 l0 10 M72 46 l2 10 M54 50 l3 9" stroke="#3ee6ff" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  },
  {
    id: "hana", name: "Hana", tag: "The Swift Fox 🦊",
    svg: `
  <svg viewBox="0 0 180 250" class="hero-svg" aria-label="Hana the trader">
    <ellipse cx="90" cy="244" rx="50" ry="7" fill="#000" opacity="0.2"/>
    <path class="tail" d="M44 70 q-26 20 -20 70 q10 20 24 12 q-14 -40 8 -70z" fill="#ff5fa2"/>
    <path class="tail" d="M136 70 q26 20 20 70 q-10 20 -24 12 q14 -40 -8 -70z" fill="#ff5fa2"/>
    <circle cx="40" cy="74" r="8" fill="#ffd1de"/>
    <circle cx="140" cy="74" r="8" fill="#ffd1de"/>
    <rect x="74" y="184" width="15" height="48" rx="7" fill="#2b2450"/>
    <rect x="91" y="184" width="15" height="48" rx="7" fill="#2b2450"/>
    <path d="M70 224 q-2 14 9 14 h12 v-16 z" fill="#fff" stroke="#ff4f9a" stroke-width="2.5"/>
    <path d="M110 224 q2 14 -9 14 h-12 v-16 z" fill="#fff" stroke="#ff4f9a" stroke-width="2.5"/>
    <path d="M60 168 q30 14 60 0 l10 26 q-40 16 -80 0 z" fill="#ff4f9a"/>
    <rect class="armL" x="51" y="134" width="14" height="46" rx="7" fill="#2bd4c0"/>
    <rect class="armR" x="115" y="134" width="14" height="46" rx="7" fill="#2bd4c0"/>
    <circle cx="58" cy="182" r="8" fill="#ffe0c4"/>
    <circle cx="122" cy="182" r="8" fill="#ffe0c4"/>
    <path d="M62 132 q28 -13 56 0 l5 40 q-33 12 -66 0 z" fill="#2bd4c0" stroke="#5fe8d8" stroke-width="2.5"/>
    <path d="M72 128 q18 14 36 0 l-6 14 q-12 6 -24 0 z" fill="#1ea596"/>
    <line x1="90" y1="132" x2="90" y2="170" stroke="#ff4f9a" stroke-width="3"/>
    <rect x="82" y="114" width="16" height="16" rx="6" fill="#f2c9a8"/>
    <path class="hair" d="M42 88 q-6 -58 48 -62 q54 4 48 62 q2 14 -8 24 l-8 -36 q-32 14 -64 0 l-8 36 q-10 -10 -8 -24z" fill="#ff5fa2"/>
    <ellipse cx="90" cy="82" rx="48" ry="50" fill="#ffe0c4"/>
    <circle cx="44" cy="84" r="7.5" fill="#ffe0c4"/>
    <circle cx="136" cy="84" r="7.5" fill="#ffe0c4"/>
    <path class="hair" d="M44 80 q-2 -42 46 -48 q48 6 46 48 q-12 -26 -28 -24 l-4 20 -8 -20 q-2 22 -10 20 -8 2 -10 -20 l-8 20 -4 -20 q-12 -2 -22 24z" fill="#ff4f95"/>
    <g class="eyes">
      <ellipse cx="72" cy="86" rx="10" ry="13" fill="#fff"/>
      <ellipse cx="108" cy="86" rx="10" ry="13" fill="#fff"/>
      <circle cx="73" cy="88" r="7" fill="#a23bd9"/>
      <circle cx="109" cy="88" r="7" fill="#a23bd9"/>
      <circle cx="73" cy="88" r="3.4" fill="#3a1357"/>
      <circle cx="109" cy="88" r="3.4" fill="#3a1357"/>
      <circle cx="76" cy="84" r="2.6" fill="#fff"/>
      <circle cx="112" cy="84" r="2.6" fill="#fff"/>
    </g>
    <path d="M62 80 q10 -5 20 -1" stroke="#3a1357" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M98 79 q10 -4 20 1" stroke="#3a1357" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="60" cy="98" rx="6" ry="3.5" fill="#ff8fb3" opacity="0.7"/>
    <ellipse cx="120" cy="98" rx="6" ry="3.5" fill="#ff8fb3" opacity="0.7"/>
    <path d="M82 104 q8 8 16 0" stroke="#c06b34" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M120 44 l12 -6 v12 z M120 44 l12 6 v-12 z" fill="#ffd34f"/>
    <circle cx="120" cy="44" r="4" fill="#ffb800"/>
  </svg>`,
  },
];

// Look up an avatar's full-body SVG; falls back to an emoji for old saves.
export function avatarSvg(id) {
  const a = AVATARS.find(x => x.id === id);
  return a ? a.svg : (id || "🦊");
}
