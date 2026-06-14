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
    id: "kai", name: "Kai", tag: "Ember Slayer ⚔️🔥", aura: "flame",
    svg: `
  <svg viewBox="0 0 180 250" class="hero-svg" aria-label="Kai the slayer">
    <ellipse cx="90" cy="244" rx="48" ry="7" fill="#000" opacity="0.22"/>
    <g transform="rotate(-34 120 110)">
      <rect x="116" y="40" width="8" height="118" rx="3" fill="#d6ecff" stroke="#9fb8d8" stroke-width="1"/>
      <rect x="114" y="150" width="12" height="34" rx="3" fill="#241d33"/>
      <path d="M114 152 l12 7 M114 160 l12 7 M114 168 l12 7 M114 176 l12 7" stroke="#caa24a" stroke-width="1.3"/>
      <rect x="109" y="146" width="22" height="5" rx="2" fill="#caa24a"/>
    </g>
    <path d="M72 176 q18 8 36 0 l6 56 q-12 6 -22 0 l-2 -32 -2 32 q-10 6 -22 0 z" fill="#33304f"/>
    <path d="M70 230 q-2 10 8 10 h12 v-12 z" fill="#1c1830"/>
    <path d="M110 230 q2 10 -8 10 h-12 v-12 z" fill="#1c1830"/>
    <path d="M64 116 q26 -12 52 0 l6 64 q-32 12 -64 0 z" fill="#2a2740"/>
    <path d="M62 114 l-3 70 q9 4 15 2 l8 -68 q-12 -6 -20 -4 z" fill="#b5402f"/>
    <path d="M118 114 l3 70 q-9 4 -15 2 l-8 -68 q12 -6 20 -4 z" fill="#b5402f"/>
    <path d="M59 130 l6 0 -3 8 z M59 150 l6 0 -3 8 z M61 170 l6 0 -3 8 z" fill="#1c1830"/>
    <path d="M115 130 l6 0 -3 8 z M115 150 l6 0 -3 8 z M113 170 l6 0 -3 8 z" fill="#f4e9d0"/>
    <path d="M82 114 l8 18 8 -18 q-8 -4 -16 0 z" fill="#1c1830"/>
    <rect class="armL" x="50" y="120" width="14" height="48" rx="7" fill="#2a2740"/>
    <rect class="armR" x="116" y="120" width="14" height="48" rx="7" fill="#2a2740"/>
    <circle cx="57" cy="170" r="8" fill="#ffd6ad"/>
    <circle cx="123" cy="170" r="8" fill="#ffd6ad"/>
    <rect x="82" y="100" width="16" height="16" rx="5" fill="#eebf94"/>
    <path class="hair" d="M46 66 q-4 -46 44 -50 q48 4 44 50 q2 14 -8 24 l-8 -32 q-28 12 -56 0 l-8 32 q-10 -10 -8 -24z" fill="#3a1c24"/>
    <ellipse cx="90" cy="62" rx="40" ry="42" fill="#ffd6ad"/>
    <circle cx="52" cy="64" r="7" fill="#ffd6ad"/>
    <circle cx="128" cy="64" r="7" fill="#ffd6ad"/>
    <path d="M116 60 l-5 12" stroke="#b5302a" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M113 63 l4 6" stroke="#b5302a" stroke-width="1.8" stroke-linecap="round"/>
    <g class="eyes">
      <ellipse cx="74" cy="62" rx="8" ry="9.5" fill="#fff"/>
      <ellipse cx="108" cy="62" rx="8" ry="9.5" fill="#fff"/>
      <circle cx="75" cy="63" r="5.6" fill="#e8821e"/>
      <circle cx="109" cy="63" r="5.6" fill="#e8821e"/>
      <circle cx="75" cy="63" r="2.6" fill="#2a1620"/>
      <circle cx="109" cy="63" r="2.6" fill="#2a1620"/>
      <circle cx="77" cy="60" r="1.7" fill="#fff"/>
      <circle cx="111" cy="60" r="1.7" fill="#fff"/>
    </g>
    <path d="M65 56 q9 -3 18 1" stroke="#2a1620" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M99 57 q9 -3 18 1" stroke="#2a1620" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M61 49 q12 -3 20 2" stroke="#3a1c24" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M100 50 q12 -4 20 -1" stroke="#3a1c24" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M82 86 q8 4 16 0" stroke="#b06a3a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path class="hair" d="M48 66 Q44 28 90 24 Q136 28 132 66 L122 44 L114 62 L104 40 L96 60 L88 38 L80 60 L72 42 L62 62 L54 44 Z" fill="#3a1c24"/>
    <path d="M86 34 l8 0 -4 9 z" fill="#c0392b" opacity="0.85"/>
  </svg>`,
  },
  {
    id: "hana", name: "Hana", tag: "Blossom Slayer ⚔️🌸", aura: "water",
    svg: `
  <svg viewBox="0 0 180 250" class="hero-svg" aria-label="Hana the slayer">
    <ellipse cx="90" cy="244" rx="48" ry="7" fill="#000" opacity="0.22"/>
    <path class="hair" d="M44 70 q-16 58 -6 112 q10 14 20 6 q-10 -62 2 -114z" fill="#2a1b3d"/>
    <path class="hair" d="M136 70 q16 58 6 112 q-10 14 -20 6 q10 -62 -2 -114z" fill="#2a1b3d"/>
    <g transform="rotate(-34 120 110)">
      <rect x="116" y="44" width="8" height="114" rx="3" fill="#ffd9ec" stroke="#d8a8c4" stroke-width="1"/>
      <rect x="114" y="150" width="12" height="32" rx="3" fill="#241d33"/>
      <rect x="109" y="146" width="22" height="5" rx="2" fill="#caa24a"/>
    </g>
    <path d="M62 170 q28 12 56 0 l12 60 q-40 16 -80 0 z" fill="#6b4fa0"/>
    <rect x="62" y="165" width="56" height="12" rx="2" fill="#ff7aa8"/>
    <rect x="76" y="186" width="13" height="46" rx="6" fill="#2b2450"/>
    <rect x="91" y="186" width="13" height="46" rx="6" fill="#2b2450"/>
    <path d="M72 226 q-2 12 8 12 h10 v-14 z" fill="#caa24a"/>
    <path d="M108 226 q2 12 -8 12 h-10 v-14 z" fill="#caa24a"/>
    <rect class="armL" x="52" y="122" width="13" height="46" rx="6" fill="#6b4fa0"/>
    <rect class="armR" x="115" y="122" width="13" height="46" rx="6" fill="#6b4fa0"/>
    <circle cx="58" cy="170" r="7.5" fill="#ffe0c4"/>
    <circle cx="122" cy="170" r="7.5" fill="#ffe0c4"/>
    <path d="M64 120 q26 -12 52 0 l5 50 q-31 12 -62 0 z" fill="#7a5cb5"/>
    <path d="M82 118 l8 16 8 -16 q-8 -4 -16 0z" fill="#f4e9d0"/>
    <path d="M84 120 l6 14 6 -14" stroke="#ff7aa8" stroke-width="2" fill="none"/>
    <g fill="#ffd1e6"><circle cx="74" cy="140" r="2.5"/><circle cx="106" cy="146" r="2.5"/><circle cx="90" cy="158" r="2.5"/></g>
    <rect x="83" y="102" width="14" height="14" rx="5" fill="#f2c9a8"/>
    <ellipse cx="90" cy="66" rx="39" ry="41" fill="#ffe0c4"/>
    <circle cx="53" cy="68" r="7" fill="#ffe0c4"/>
    <circle cx="127" cy="68" r="7" fill="#ffe0c4"/>
    <path class="hair" d="M48 70 Q46 28 90 24 Q134 28 132 70 q-12 -22 -26 -22 l-4 18 -8 -18 q-2 20 -10 18 -8 2 -10 -18 l-8 18 -4 -18 q-14 0 -24 22z" fill="#2a1b3d"/>
    <path class="hair" d="M50 66 q-4 26 4 46 q6 -2 8 -8 q-8 -20 -4 -38z" fill="#2a1b3d"/>
    <path class="hair" d="M130 66 q4 26 -4 46 q-6 -2 -8 -8 q8 -20 4 -38z" fill="#2a1b3d"/>
    <g transform="translate(116 44)">
      <path d="M0 0 l10 -5 v10 z M0 0 l10 5 v-10 z" fill="#ff7aa8"/>
      <circle cx="0" cy="0" r="3" fill="#ffd34f"/>
    </g>
    <g class="eyes">
      <ellipse cx="74" cy="66" rx="8.5" ry="10.5" fill="#fff"/>
      <ellipse cx="106" cy="66" rx="8.5" ry="10.5" fill="#fff"/>
      <circle cx="75" cy="67" r="6" fill="#8b5cf6"/>
      <circle cx="107" cy="67" r="6" fill="#8b5cf6"/>
      <circle cx="75" cy="67" r="2.8" fill="#241333"/>
      <circle cx="107" cy="67" r="2.8" fill="#241333"/>
      <circle cx="77" cy="63" r="2" fill="#fff"/>
      <circle cx="109" cy="63" r="2" fill="#fff"/>
    </g>
    <path d="M64 60 q10 -4 20 1" stroke="#241333" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M96 61 q10 -5 20 -1" stroke="#241333" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="60" cy="80" rx="5" ry="3" fill="#ff9cc0" opacity="0.6"/>
    <ellipse cx="120" cy="80" rx="5" ry="3" fill="#ff9cc0" opacity="0.6"/>
    <path d="M84 88 q6 5 12 0" stroke="#b06a3a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  </svg>`,
  },
];

// Look up an avatar's full-body SVG; falls back to an emoji for old saves.
export function avatarSvg(id) {
  const a = AVATARS.find(x => x.id === id);
  return a ? a.svg : (id || "🦊");
}
