// Say Suppose pilot: three "you" candidates (L7). Pure SVG strings so the same drawing feeds sheets,
// thumbnails and the 2D look. No mouths (L8): eyes, brows, lids and sweat carry the emotion.

const DESIGNS = {
  curl: {
    name: "A · Curl",
    note: "Black head with one curl, heavy-lidded eyes, violet hoodie",
    head: "#14141c", headShape: "circle", garment: "#7B5CD6", garmentDark: "#5a3fb0", trim: "#f2eefc",
    limbs: "#14141c", eyes: "oval", extra: "curl",
  },
  scarf: {
    name: "B · Scarf",
    note: "Black head, round eyes with pupils, long green scarf, charcoal coat",
    head: "#14141c", headShape: "circle", garment: "#3a3f4b", garmentDark: "#2a2e37", trim: "#2fbf71",
    limbs: "#14141c", eyes: "pupil", extra: "scarf",
  },
  pebble: {
    name: "C · Pebble",
    note: "Bone-white egg head, bean eyes, thick brows, coral puffer vest",
    head: "#f1e9da", headShape: "egg", garment: "#ff7a59", garmentDark: "#d95c3d", trim: "#8b8f99",
    limbs: "#22232b", eyes: "bean", extra: "none",
  },
};

const EXPRESSIONS = ["neutral", "smug", "shocked", "worried"];

function eyes(d, ex, cx, cy) {
  const L = cx - 19, R = cx + 19;
  let s = "";
  const browCol = d.headShape === "egg" ? "#22232b" : "#f4f1ea";
  if (d.eyes === "oval") {
    const ry = ex === "shocked" ? 15 : 12;
    const rx = ex === "shocked" ? 9 : 8.5;
    s += `<ellipse cx="${L}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff"/><ellipse cx="${R}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff"/>`;
    // lids: the curl's signature heavy lid
    const lid = { neutral: 0.22, smug: 0.6, shocked: 0, worried: 0.12 }[ex];
    if (lid > 0) {
      const h = ry * 2 * lid;
      s += `<rect x="${L - rx - 2}" y="${cy - ry - 2}" width="${rx * 2 + 4}" height="${h + 2}" fill="${d.head}"/>`;
      const hr = ex === "smug" ? ry * 2 * 0.25 : h;
      s += `<rect x="${R - rx - 2}" y="${cy - ry - 2}" width="${rx * 2 + 4}" height="${hr + 2}" fill="${d.head}"/>`;
    }
  } else if (d.eyes === "pupil") {
    const r = ex === "shocked" ? 13 : 11;
    const pr = ex === "shocked" ? 3 : 5;
    const dx = ex === "smug" ? 4 : ex === "worried" ? -2 : 1;
    s += `<circle cx="${L}" cy="${cy}" r="${r}" fill="#fff"/><circle cx="${R}" cy="${cy}" r="${r}" fill="#fff"/>`;
    s += `<circle cx="${L + dx}" cy="${cy + 1}" r="${pr}" fill="#14141c"/><circle cx="${R + dx}" cy="${cy + 1}" r="${pr}" fill="#14141c"/>`;
    if (ex === "smug") s += `<rect x="${L - r - 2}" y="${cy - r - 2}" width="${r * 2 + 4}" height="${r * 0.9}" fill="${d.head}"/><rect x="${R - r - 2}" y="${cy - r - 2}" width="${r * 2 + 4}" height="${r * 0.9}" fill="${d.head}"/>`;
  } else {
    const ry = ex === "shocked" ? 9 : 7, rx = ex === "shocked" ? 5 : 4.5;
    s += `<ellipse cx="${L}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#22232b"/><ellipse cx="${R}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#22232b"/>`;
    if (ex === "smug") s += `<rect x="${L - 7}" y="${cy - ry - 1}" width="14" height="${ry * 0.9}" fill="${d.head}"/><rect x="${R - 7}" y="${cy - ry - 1}" width="14" height="${ry * 0.9}" fill="${d.head}"/>`;
  }
  // brows
  const by = cy - (d.eyes === "bean" ? 17 : 22);
  const bw = d.eyes === "bean" ? 6 : 3.5;
  const brow = (x, tilt, lift) => `<line x1="${x - 9}" y1="${by - lift + tilt}" x2="${x + 9}" y2="${by - lift - tilt}" stroke="${browCol}" stroke-width="${bw}" stroke-linecap="round"/>`;
  if (ex === "neutral") s += brow(L, 0, 0) + brow(R, 0, 0);
  if (ex === "smug") s += brow(L, 1, -2) + brow(R, -3, 7);
  if (ex === "shocked") s += brow(L, -1, 9) + brow(R, 1, 9);
  if (ex === "worried") s += brow(L, 4, 4) + brow(R, -4, 4);
  if (ex === "worried" || ex === "shocked") {
    const sx = cx + 44, sy = cy - 26;
    s += `<path d="M${sx} ${sy} q6 10 0 14 q-6 -4 0 -14z" fill="#8fd3ff" stroke="#fff" stroke-width="1.5"/>`;
  }
  return s;
}

function character(key, ex, opts = {}) {
  const d = DESIGNS[key];
  const cx = 100, hy = 82;
  let s = "";
  // ground shadow
  if (!opts.noShadow) s += `<ellipse cx="100" cy="292" rx="46" ry="7" fill="rgba(0,0,0,.22)"/>`;
  // legs
  s += `<path d="M90 228 L84 288 M110 228 L118 288" stroke="${d.limbs}" stroke-width="7" stroke-linecap="round" fill="none"/>`;
  s += `<ellipse cx="81" cy="289" rx="10" ry="5" fill="${d.limbs}"/><ellipse cx="121" cy="289" rx="10" ry="5" fill="${d.limbs}"/>`;
  // arms
  const armL = ex === "shocked" ? "M68 150 Q46 128 40 104" : ex === "smug" ? "M68 152 Q52 178 62 196" : "M68 152 Q54 184 58 210";
  const armR = ex === "shocked" ? "M132 150 Q154 128 160 104" : ex === "worried" ? "M132 152 Q150 150 128 128" : "M132 152 Q146 184 142 210";
  s += `<path d="${armL}" stroke="${d.garmentDark}" stroke-width="12" stroke-linecap="round" fill="none"/>`;
  s += `<path d="${armR}" stroke="${d.garmentDark}" stroke-width="12" stroke-linecap="round" fill="none"/>`;
  const endL = armL.split(" ").slice(-2), endR = armR.split(" ").slice(-2);
  s += `<circle cx="${endL[0]}" cy="${endL[1]}" r="8" fill="${d.limbs}"/><circle cx="${endR[0]}" cy="${endR[1]}" r="8" fill="${d.limbs}"/>`;
  // torso
  if (key === "pebble") {
    s += `<path d="M72 136 Q100 126 128 136 L132 232 Q100 240 68 232 Z" fill="#c9ccd3"/>`;
    s += `<path d="M70 138 Q84 132 92 134 L92 232 Q80 232 68 230 Z" fill="${d.garment}"/><path d="M130 138 Q116 132 108 134 L108 232 Q120 232 132 230 Z" fill="${d.garment}"/>`;
    s += `<path d="M70 168 L92 168 M70 198 L92 198 M108 168 L130 168 M108 198 L130 198" stroke="${d.garmentDark}" stroke-width="2.5"/>`;
  } else {
    if (key === "curl") s += `<path d="M64 138 Q100 104 136 138 L128 150 L72 150 Z" fill="${d.garmentDark}"/>`; // hood behind
    s += `<path d="M70 138 Q100 128 130 138 L134 232 Q100 242 66 232 Z" fill="${d.garment}"/>`;
    if (key === "curl") s += `<path d="M93 142 L91 166 M107 142 L109 166" stroke="${d.trim}" stroke-width="3" stroke-linecap="round"/><path d="M80 196 Q100 204 120 196 L118 214 Q100 220 82 214 Z" fill="${d.garmentDark}"/>`;
    if (key === "scarf") s += `<path d="M100 140 L100 232" stroke="${d.garmentDark}" stroke-width="2"/><circle cx="96" cy="170" r="2.5" fill="${d.garmentDark}"/><circle cx="96" cy="196" r="2.5" fill="${d.garmentDark}"/>`;
  }
  // head
  if (d.headShape === "egg") s += `<ellipse cx="${cx}" cy="${hy - 2}" rx="44" ry="54" fill="${d.head}" stroke="#d8cdb8" stroke-width="2"/>`;
  else s += `<circle cx="${cx}" cy="${hy}" r="50" fill="${d.head}"/>`;
  if (d.extra === "curl") s += `<path d="M100 33 C96 16 116 10 118 22 C120 31 108 32 108 25" stroke="${d.head}" stroke-width="8" stroke-linecap="round" fill="none"/>`;
  if (d.extra === "scarf") {
    s += `<path d="M66 128 Q100 146 134 128 L136 142 Q100 160 64 142 Z" fill="${d.trim}"/>`;
    s += `<path d="M122 140 Q150 160 170 150 Q178 170 160 176 Q138 172 116 150 Z" fill="${d.trim}"/><path d="M160 150 l6 -6 M166 162 l8 -3" stroke="#1f8f52" stroke-width="2"/>`;
  }
  // rim light (cinematic)
  if (d.headShape !== "egg") s += `<path d="M138 60 A50 50 0 0 1 142 108" stroke="rgba(255,214,160,.55)" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  s += eyes(d, ex, cx, hy + 2);
  return `<g>${s}</g>`;
}

if (typeof module !== "undefined") module.exports = { DESIGNS, EXPRESSIONS, character };
