// ====== Animated SVG character portraits ======
// Each character is hand-drawn inline SVG. CSS animates the parts by class:
//   .eyes  → blinks    .mouth → talks while text is typing
//   .tail  → swishes   .glint → sunglasses shine   .brow → wise wiggle

const CHARACTER_ART = {

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
