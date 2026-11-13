// Pieces for "Her Offer" (HerOffer.tsx), in screen pixels: the paper inset over the hatch (inside the town, forty years
// of faces round a long table, a small lilac figure at the door with a suitcase that nobody turns round for, and the
// piano teacher at the head of the table who turns to look straight out at you), and the inside of your pod as its door
// comes down over the opening.
import { spring } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, seatedY, STAND } from "@whatif/kit/rig/pose";
import { CRIMSON, FPS, INK, PAPER } from "@whatif/kit/theme";
import { blinking, FLATMATE, mix, PASTELS, PIANO } from "../shared";

export const INSET = { w: 860, h: 520 };
export interface InCam { x: number; y: number; zoom: number }
export const IN_CAMS = {
  full: { x: 430, y: 260, zoom: 1 },
  door: { x: 190, y: 320, zoom: 2.0 },
  table: { x: 560, y: 330, zoom: 1.6 },
  teacher: { x: 760, y: 330, zoom: 3.4 },
} satisfies Record<string, InCam>;

const TABLE_TOP = 372;
const SEAT_TOP = 392;
const S = 0.4;

/** The town room inside the inset: warm wall, a window on the town with the sky counter blurring, the door at the
 *  left, the long table and its sitters. Inset units (0..w, 0..h). */
const Room: React.FC<{ frame: number; guest: number; guestDown: number; turn: number; stay: boolean }> = ({ frame, guest, guestDown, turn, stay }) => {
  const sitters = [300, 380, 460, 540, 620, 700];
  return (
    <g>
      <rect x={-400} y={-400} width={1700} height={1400} fill="#e7c49c" />
      <rect x={300} y={70} width={260} height={150} rx={8} fill="#8fb6d8" stroke={INK} strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={312 + i * 62} y={160 - (i % 2) * 22} width={50} height={60} fill="#c9a07e" stroke={INK} strokeWidth={3} />)}
      <rect x={400} y={86} width={60} height={34} rx={5} fill={INK} />
      {[0, 1, 2].map((i) => <rect key={i} x={404 + i * 19} y={90} width={15} height={26} rx={2} fill={CRIMSON} opacity={0.8} />)}
      <rect x={-400} y={470} width={1700} height={600} fill="#9a7458" />
      {/* the door, open, lit from the street */}
      <rect x={60} y={150} width={120} height={320} rx={6} fill="#fff1c9" stroke={INK} strokeWidth={5} />
      <rect x={180} y={150} width={26} height={320} fill="#6b4b3a" stroke={INK} strokeWidth={4} />
      {/* the sitters: forty years of friends, laughing, turned to each other */}
      {sitters.map((x, i) => (
        <Figure key={i} x={x} y={seatedY(SEAT_TOP, S)} scale={S} facing={i % 2 ? -1 : 1} pose={{ ...SEATED, armF: [70 + 20 * Math.sin(frame / 9 + i), 40] }}
          head={PASTELS[(i * 3) % PASTELS.length]} coat={["#6a5a7c", "#4c6a5a", "#7a5a4a"][i % 3]} brows="raised" lids={0.1}
          mouth={Math.floor(frame / 18 + i) % 3 === 0 ? "open" : "smile"} eyes={1} look={{ x: 0.9, y: 0.1 }} blink={blinking(frame, i + 20)} />
      ))}
      <Figure x={780} y={seatedY(SEAT_TOP, S * 1.05)} scale={S * 1.05} facing={-1} pose={{ ...SEATED, tilt: mix(0, -8, turn) }}
        head={PIANO.head} coat={PIANO.coat} brows={turn > 0.5 ? "flat" : "raised"} lids={mix(0.2, 0.35, turn)} eyes={1}
        mouth={stay ? "open" : turn > 0.5 ? "flat" : "smile"} look={{ x: mix(1, -0.15, turn), y: mix(0.1, 0, turn) }} blink={blinking(frame, 31)} />
      {/* the table, in front of their laps */}
      <rect x={250} y={TABLE_TOP} width={580} height={22} rx={6} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
      <line x1={280} y1={TABLE_TOP + 20} x2={280} y2={466} stroke={INK} strokeWidth={8} />
      <line x1={800} y1={TABLE_TOP + 20} x2={800} y2={466} stroke={INK} strokeWidth={8} />
      {[320, 420, 520, 620, 720].map((x, i) => <ellipse key={i} cx={x} cy={TABLE_TOP - 4} rx={22} ry={6} fill={i % 2 ? PAPER : "#d9a35a"} stroke={INK} strokeWidth={2} />)}
      {/* the newcomer at the door: small, lilac, a suitcase; nobody turns round */}
      {guest > 0 && (
        <g opacity={guest}>
          <Figure x={120} y={466} scale={S * 0.95} facing={1} pose={{ ...STAND, tilt: mix(0, 14, guestDown), lean: mix(0, 6, guestDown), armF: [8, 6] }}
            head={FLATMATE.head} coat="#8b8f9e" brows={guestDown > 0.5 ? "sad" : "raised"} lids={mix(0, 0.45, guestDown)} mouth="flat"
            eyes={1} look={{ x: 1, y: mix(0, 0.6, guestDown) }} blink={blinking(frame, 41)}
            held={<rect x={-24} y={6} width={48} height={40} rx={6} fill="#a0603a" stroke={INK} strokeWidth={4} />} />
        </g>
      )}
    </g>
  );
};

/** The inset: a paper sheet over the hatch, its own camera inside. Pops in at `at`. Screen pixels, centre (x, y). */
export const TableInset: React.FC<{
  frame: number; at: number; x: number; y: number; cam: InCam; guest: number; guestDown: number; turn: number; stay: boolean; scale?: number;
}> = ({ frame, at, x, y, cam, guest, guestDown, turn, stay, scale = 1 }) => {
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps: FPS, config: { damping: 13, stiffness: 170, mass: 0.7 } });
  const { w, h } = INSET;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${x} ${y}) rotate(-1.5) scale(${scale * (0.7 + 0.3 * s)} ${scale * s})`}>
        <rect x={-w / 2 + 12} y={-h / 2 + 16} width={w} height={h} rx={12} fill="#000" opacity={0.3} />
        <rect x={-w / 2 - 14} y={-h / 2 - 14} width={w + 28} height={h + 28} rx={14} fill={PAPER} stroke="#cdbfa6" strokeWidth={4} />
        <clipPath id="inset-clip"><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} /></clipPath>
        <g clipPath="url(#inset-clip)">
          <g transform={`scale(${cam.zoom}) translate(${-cam.x} ${-cam.y})`}>
            <Room frame={frame} guest={guest} guestDown={guestDown} turn={turn} stay={stay} />
          </g>
        </g>
      </g>
    </svg>
  );
};

/** Blend two inset cameras. */
export const mixCam = (a: InCam, b: InCam, t: number): InCam => ({ x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), zoom: mix(a.zoom, b.zoom, t) });

/** The inside of your pod round the opening, and its door coming down over it (`shut` 0 open to 1 closed). */
export const PodInside: React.FC<{ shut: number }> = ({ shut }) => {
  const o = { x: 150, y: 80, w: 1620, h: 920, r: 90 };
  const frameD = `M-50 -50 H1970 V1130 H-50 Z M${o.x + o.r} ${o.y} H${o.x + o.w - o.r} A${o.r} ${o.r} 0 0 1 ${o.x + o.w} ${o.y + o.r} V${o.y + o.h - o.r} A${o.r} ${o.r} 0 0 1 ${o.x + o.w - o.r} ${o.y + o.h} H${o.x + o.r} A${o.r} ${o.r} 0 0 1 ${o.x} ${o.y + o.h - o.r} V${o.y + o.r} A${o.r} ${o.r} 0 0 1 ${o.x + o.r} ${o.y} Z`;
  const doorH = o.h * shut;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <clipPath id="pod-open"><rect x={o.x} y={o.y} width={o.w} height={o.h} rx={o.r} /></clipPath>
      <g clipPath="url(#pod-open)">
        <rect x={o.x} y={o.y} width={o.w} height={doorH} fill="#1d2338" />
        <rect x={o.x} y={o.y + doorH - 18} width={o.w} height={18} fill="#3a4363" opacity={shut > 0 && shut < 1 ? 1 : 0} />
        {shut > 0.3 && <circle cx={960} cy={o.y + doorH - 260} r={90} fill="#2b3250" stroke={INK} strokeWidth={8} />}
      </g>
      <path d={frameD} fill="#0a0c16" fillRule="evenodd" />
      <path d={frameD} fill="none" stroke="#47507a" strokeWidth={10} />
      <rect x={120} y={1010} width={520} height={60} rx={20} fill="#cfd3e6" opacity={0.85} />
      <rect x={40} y={20} width={180} height={44} rx={14} fill="#ffc46b" opacity={0.85} />
    </svg>
  );
};
