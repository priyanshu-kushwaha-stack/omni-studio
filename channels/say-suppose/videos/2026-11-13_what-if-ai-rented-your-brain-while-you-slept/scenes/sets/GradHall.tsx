// The school hall on graduation Saturday (builder C), in the library's shape (SetDef). Two views of one room:
//
//   view "stage"     from the back of the hall: the stage at the far end in the actors' plane (floor at GRAD.stage.y),
//                    the maroon side curtains and valance, a banner with no lettering on the back curtain, the table of
//                    rolled papers; in front, two rows of folding chairs seen from behind, heads and shoulders.
//   view "audience"  the reverse, from the stage: the back wall and its doors, rows of folding chairs facing us, the
//                    families on them. Row 2 is in the actors' plane (your row); `leave` keeps seats empty there so a
//                    beat can draw you (and anyone else) on them.
//
// Helpers for the people in it: <SeatedFront> (someone on a folding chair facing us), <Gown> and <Mortarboard> (your
// brother's gown and cap: drawn over a Figure at its head).
import { Figure, type FigureProps } from "@whatif/kit/rig/Figure";
import { HEAD_R, LIMB, STAND, type Pose } from "@whatif/kit/rig/pose";
import { Deep, Floor, REF, Sky, noise, type SetDef, type SetProps } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { PASTELS } from "../shared";

/** Every anchor, in REF pixels. */
export const GRAD = {
  /** Stage view: the stage floor (the actors' plane), its left and right ends, the table with the rolled papers. */
  stage: { y: 640, from: 330, to: 1590, table: 1260 },
  /** Stage view: a figure on the stage is drawn at this scale (far from the camera). */
  stageScale: 0.62,
  /** Audience view: the seat top of each row, the floor under it, its scale, and its depth. Row 2 (index 1) is yours. */
  rows: [
    { seat: 970, s: 1.18, depth: 1.14 },
    { seat: 820, s: 0.92, depth: 1 },
    { seat: 720, s: 0.7, depth: 0.84 },
    { seat: 650, s: 0.54, depth: 0.72 },
  ],
  /** Audience view: the seat spacing in row 2 and your seat (second row, near the middle). */
  gap: 190,
  you: { x: 960 },
} as const;

/** The floor under a row of seats (feet of someone seated facing us). */
export const floorOf = (row: number) => GRAD.rows[row].seat + 2 * LIMB * GRAD.rows[row].s;

const MAROON = "#8e2236";
const WALL = "#dccfae";
const STEEL = "#7d8590";

// ---------------------------------------------------------------- people

/** Someone on a folding chair, facing us: the chair back behind, the seat over the lap, the shins down to the floor.
 *  (x, seat) is the seat top's centre. Extra Figure props (face, look, held, pose) pass through. */
export const SeatedFront: React.FC<{ x: number; seat: number; s: number; pose?: Pose; who?: Partial<FigureProps> & { head: string }; chair?: boolean }> = ({ x, seat, s, pose, who, chair = true }) => {
  const floor = seat + 2 * LIMB * s;
  return (
    <g>
      {chair && <rect x={x - 46 * s} y={seat - 128 * s} width={92 * s} height={96 * s} rx={10 * s} fill={STEEL} stroke={INK} strokeWidth={4} />}
      {who && <Figure x={x} y={floor} scale={s} pose={pose ?? { ...STAND, armF: [8, 30], armB: [-8, 30], legB: [-4, 0], legF: [4, 0] }} {...who} />}
      {chair && (
        <g>
          <rect x={x - 52 * s} y={seat - 4 * s} width={104 * s} height={18 * s} rx={6 * s} fill="#959ca6" stroke={INK} strokeWidth={4} />
          <path d={`M${x - 44 * s} ${seat + 14 * s} L${x - 50 * s} ${floor} M${x + 44 * s} ${seat + 14 * s} L${x + 50 * s} ${floor}`} stroke={INK} strokeWidth={5 * s + 2} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

/** A graduation gown over a standing Figure at (x, y, scale, facing): dark, to the knees, wide sleeves. Draw it over the
 *  Figure; the arms stay the Figure's. */
export const Gown: React.FC<{ x: number; y: number; scale: number; facing?: 1 | -1; color?: string; drop?: number }> = ({ x, y, scale, facing = 1, color = "#2b2f5a", drop = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
    <path d={`M-24 ${-222 + drop} L24 ${-222 + drop} L46 ${-50 + drop} L-46 ${-50 + drop}Z`} fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d={`M-12 ${-222 + drop} L0 ${-190 + drop} L12 ${-222 + drop}`} fill="none" stroke={MUSTARD} strokeWidth={6} strokeLinejoin="round" />
  </g>
);

/** A mortarboard on a head at (x, y) of radius r: the skull cap, the flat square board (seen edge-on, tilted), the
 *  tassel hanging at the side. */
export const Mortarboard: React.FC<{ x: number; y: number; r: number; facing?: 1 | -1; tilt?: number; color?: string }> = ({ x, y, r, facing = 1, tilt = -6, color = "#2b2f5a" }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt * facing}) scale(${facing} 1)`}>
    <path d={`M${-r * 0.9} ${-r * 0.35} Q0 ${-r * 1.2} ${r * 0.9} ${-r * 0.35}Z`} fill={color} stroke={INK} strokeWidth={3} />
    <path d={`M${-r * 1.45} ${-r * 0.92} L${r * 0.1} ${-r * 1.22} L${r * 1.45} ${-r * 0.92} L${-r * 0.1} ${-r * 0.62}Z`} fill={color} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <circle cx={0} cy={-r * 0.92} r={r * 0.08} fill={MUSTARD} />
    <path d={`M0 ${-r * 0.92} L${-r * 1.2} ${-r * 0.8} L${-r * 1.25} ${-r * 0.2}`} fill="none" stroke={MUSTARD} strokeWidth={r * 0.08} strokeLinecap="round" />
    <rect x={-r * 1.32} y={-r * 0.28} width={r * 0.14} height={r * 0.34} rx={r * 0.05} fill={MUSTARD} />
  </g>
);

/** A rolled paper tied with a ribbon. (x, y) its centre. */
export const Scroll: React.FC<{ x: number; y: number; scale?: number; tilt?: number }> = ({ x, y, scale = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <rect x={-52} y={-11} width={104} height={22} rx={11} fill={PAPER} stroke={INK} strokeWidth={4} />
    <ellipse cx={52} cy={0} rx={6} ry={11} fill="#e2d6bf" stroke={INK} strokeWidth={3} />
    <rect x={-6} y={-13} width={12} height={26} fill="#c0392b" />
  </g>
);

// ---------------------------------------------------------------- the stage view

const Windows: React.FC<{ mood: MoodName; xs: number[]; y: number; w: number; h: number; id: string }> = ({ mood, xs, y, w, h, id }) => (
  <g>
    {xs.map((x, i) => (
      <g key={x}>
        <clipPath id={`${id}-${i}`}><rect x={x} y={y} width={w} height={h} /></clipPath>
        <g clipPath={`url(#${id}-${i})`}><Sky id={`${id}-${i}`} mood={mood} x={x} y={y} w={w} h={h} /></g>
        <rect x={x} y={y} width={w} height={h} fill="none" stroke="#f4efe2" strokeWidth={12} />
        <path d={`M${x + w / 2} ${y}V${y + h}M${x} ${y + h / 3}H${x + w}M${x} ${y + (2 * h) / 3}H${x + w}`} stroke="#f4efe2" strokeWidth={6} />
      </g>
    ))}
  </g>
);

/** The banner across the back curtain: cream cloth, a teal border, a mustard star in the middle. No lettering. */
const Banner: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g>
    <path d={`M${x} ${y} H${x + w} L${x + w - 26} ${y + h / 2} L${x + w} ${y + h} H${x} L${x + 26} ${y + h / 2}Z`} fill={PAPER} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <rect x={x + 40} y={y + 10} width={w - 80} height={h - 20} fill="none" stroke={TEAL} strokeWidth={6} />
    <path d={Array.from({ length: 5 }, (_, i) => {
      const a = (i * 144 - 90) * (Math.PI / 180);
      return `${i ? "L" : "M"}${x + w / 2 + Math.cos(a) * h * 0.32} ${y + h / 2 + Math.sin(a) * h * 0.32}`;
    }).join("") + "Z"} fill={MUSTARD} stroke={INK} strokeWidth={3} />
    {[-1, 1].map((d) => <rect key={d} x={x + w / 2 + d * 110 - (d < 0 ? 180 : 0)} y={y + h / 2 - 5} width={180} height={10} rx={5} fill={TEAL} opacity={0.6} />)}
  </g>
);

/** A curtain hanging in folds from `top` to `bottom`, x0..x1. */
const Curtain: React.FC<{ x0: number; x1: number; top: number; bottom: number; color?: string }> = ({ x0, x1, top, bottom, color = MAROON }) => {
  const n = Math.max(2, Math.round((x1 - x0) / 46));
  return (
    <g>
      <rect x={x0} y={top} width={x1 - x0} height={bottom - top} fill={color} stroke={INK} strokeWidth={5} />
      <path d={Array.from({ length: n - 1 }, (_, i) => `M${x0 + ((i + 1) * (x1 - x0)) / n} ${top}V${bottom}`).join("")} stroke="#000" strokeWidth={6} opacity={0.18} />
    </g>
  );
};

/** One folding chair from behind with someone's head and shoulders over it (or empty). (x, y) the seat back's top. */
const BackOfHead: React.FC<{ x: number; y: number; s: number; head: string | null; coat: string }> = ({ x, y, s, head, coat }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {head && (
      <g>
        <path d="M-70 40 Q-66 -50 0 -54 Q66 -50 70 40Z" fill={coat} stroke={INK} strokeWidth={5} />
        <circle cx={0} cy={-96} r={HEAD_R} fill={head} />
        <path d={`M${-HEAD_R} -96 A${HEAD_R} ${HEAD_R} 0 0 1 ${HEAD_R} -96`} fill="#000" opacity={0.1} />
      </g>
    )}
    <rect x={-58} y={-4} width={116} height={70} rx={10} fill={STEEL} stroke={INK} strokeWidth={5} />
    <path d="M-50 66 L-56 220 M50 66 L56 220" stroke={INK} strokeWidth={8} strokeLinecap="round" />
  </g>
);

const backRow = (y: number, s: number, gap: number, seed: number, from = -400, to = 2400) =>
  Array.from({ length: Math.floor((to - from) / gap) + 1 }, (_, i) => {
    const n = seed * 13 + i;
    const head = noise(n) < 0.12 ? null : PASTELS[Math.floor(noise(n + 2) * PASTELS.length)];
    const coat = ["#3f4a5c", "#5a4a3f", "#4f6f5a", "#6a4f6f", "#2f3a52"][Math.floor(noise(n + 5) * 5)];
    return <BackOfHead key={i} x={from + i * gap + (noise(n + 7) - 0.5) * 30} y={y} s={s} head={head} coat={coat} />;
  });

// ---------------------------------------------------------------- the audience view

/** The families in one row, facing us; seats at `leave` x positions are left for the beat. */
const FrontRow: React.FC<{ row: number; frame: number; leave: number[]; seed: number }> = ({ row, frame, leave, seed }) => {
  const r = GRAD.rows[row];
  const gap = GRAD.gap * (r.s / GRAD.rows[1].s);
  const from = GRAD.you.x - gap * Math.ceil((GRAD.you.x + 400) / gap);
  const n = Math.ceil((2400 - from) / gap);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = from + i * gap;
        const k = seed * 11 + i;
        if (leave.some((l) => Math.abs(l - x) < gap / 2)) return null;
        if (noise(k) < 0.1) return <SeatedFront key={i} x={x} seat={r.seat} s={r.s} />;
        const facing = noise(k + 1) < 0.5 ? 1 : -1;
        const clap = noise(k + 4) < 0.35;
        const ph = Math.sin((frame + k * 7) * 0.6);
        const pose: Pose = clap ? { ...STAND, armF: [110 + ph * 8, 60], armB: [100 - ph * 8, 70], legB: [-4, 0], legF: [4, 0] }
          : { ...STAND, armF: [8, 30], armB: [-8, 30], legB: [-4, 0], legF: [4, 0] };
        return (
          <SeatedFront key={i} x={x} seat={r.seat} s={r.s} pose={pose}
            who={{ head: PASTELS[Math.floor(noise(k + 2) * PASTELS.length)], coat: ["#3f4a5c", "#5a4a3f", "#4f6f5a", "#6a4f6f", "#7a5a3a"][Math.floor(noise(k + 3) * 5)],
              facing, look: { x: 0.15 * facing, y: -0.3 }, mouth: "smile", brows: noise(k + 6) < 0.5 ? "raised" : "none",
              blink: (frame + k * 37) % 97 < 4 }} />
        );
      })}
    </g>
  );
};

export interface GradHallOptions {
  view: "stage" | "audience";
  /** Audience view: x positions in row 2 (yours) to leave empty for the beat's own people. */
  leave: number[];
  /** Stage view: the rows of heads from behind in front of the camera. */
  heads: boolean;
}

const GradBack: React.FC<SetProps<GradHallOptions>> = ({ cam, mood, frame, options }) => {
  if (options.view === "stage") {
    const S = GRAD.stage;
    return (
      <>
        <Deep cam={cam} depth={0.6} flat>
          <rect x={-1400} y={-800} width={4800} height={1600} fill={WALL} />
          <Windows mood={mood} xs={[-260, 20, 1720, 2000]} y={120} w={200} h={380} id="grad-st" />
          <rect x={-1400} y={560} width={4800} height={240} fill="#b89a6e" />
        </Deep>
        <Deep cam={cam} depth={1}>
          <Floor y={S.y + 120} fill="#b07a4a" gap={160} slant={-60} />
          {/* the stage: back curtain, banner, side curtains and valance, the front of the platform */}
          <rect x={S.from} y={120} width={S.to - S.from} height={S.y - 120} fill="#3d3550" />
          <Banner x={620} y={210} w={680} h={130} />
          <Curtain x0={S.from - 40} x1={S.from + 150} top={90} bottom={S.y} />
          <Curtain x0={S.to - 150} x1={S.to + 40} top={90} bottom={S.y} />
          <path d={`M${S.from - 60} 70 H${S.to + 60} V150 ${Array.from({ length: 14 }, (_, i) => `Q${S.to + 60 - (i + 0.5) * ((S.to - S.from + 120) / 14)} 200 ${S.to + 60 - (i + 1) * ((S.to - S.from + 120) / 14)} 150`).join(" ")}Z`}
            fill={MAROON} stroke={INK} strokeWidth={5} />
          <rect x={S.from - 60} y={S.y - 6} width={S.to - S.from + 120} height={22} fill="#9a6a42" stroke={INK} strokeWidth={5} />
          <rect x={S.from - 60} y={S.y + 16} width={S.to - S.from + 120} height={104} fill="#7a4f30" stroke={INK} strokeWidth={5} />
          <path d={Array.from({ length: 12 }, (_, i) => `M${S.from - 60 + (i + 1) * ((S.to - S.from + 120) / 13)} ${S.y + 16}v104`).join("")} stroke="#000" strokeWidth={4} opacity={0.15} />
          {/* the table of rolled papers */}
          <rect x={S.table - 90} y={S.y - 92} width={180} height={14} fill="#6b4b3a" stroke={INK} strokeWidth={3} />
          <rect x={S.table - 84} y={S.y - 78} width={168} height={72} fill={TEAL} stroke={INK} strokeWidth={3} opacity={0.9} />
          {[0, 1, 2].map((i) => <Scroll key={i} x={S.table - 30 + i * 26} y={S.y - 104 - (i % 2) * 14} scale={0.5} tilt={-6 + i * 5} />)}
        </Deep>
      </>
    );
  }
  return (
    <>
      <Deep cam={cam} depth={0.5} flat>
        <rect x={-1400} y={-800} width={4800} height={1600} fill={WALL} />
        <Windows mood={mood} xs={[520, 1220]} y={180} w={180} h={300} id="grad-au" />
        {[250, 1670].map((x) => (
          <g key={x}>
            <rect x={x - 110} y={330} width={220} height={330} fill="#8a6a48" stroke={INK} strokeWidth={5} />
            <line x1={x} y1={330} x2={x} y2={660} stroke={INK} strokeWidth={4} />
            {[-1, 1].map((d) => <rect key={d} x={x + d * 55 - 25} y={370} width={50} height={80} rx={4} fill="#cfe4ec" stroke={INK} strokeWidth={3} />)}
          </g>
        ))}
        <rect x={-1400} y={640} width={4800} height={1000} fill="#b07a4a" />
      </Deep>
      {[3, 2].map((row) => (
        <Deep key={row} cam={cam} depth={GRAD.rows[row].depth}>
          <FrontRow row={row} frame={frame} leave={[]} seed={row} />
        </Deep>
      ))}
    </>
  );
};

/** Audience view: row 2 (yours) in the actors' plane, with the seats in `leave` empty. */
const GradMid: React.FC<SetProps<GradHallOptions>> = ({ frame, options }) =>
  options.view === "audience" ? <FrontRow row={1} frame={frame} leave={options.leave} seed={1} /> : null;

const GradFront: React.FC<SetProps<GradHallOptions>> = ({ cam, frame, options }) => {
  if (options.view === "stage") {
    if (!options.heads) return null;
    return (
      <>
        <Deep cam={cam} depth={1.12}>{backRow(900, 0.95, 190, 1)}</Deep>
        <Deep cam={cam} depth={1.28}>{backRow(1030, 1.25, 250, 2, -500, 2500)}</Deep>
      </>
    );
  }
  return (
    <Deep cam={cam} depth={GRAD.rows[0].depth}>
      <FrontRow row={0} frame={frame} leave={[GRAD.you.x - 60]} seed={0} />
    </Deep>
  );
};

export const gradHall: SetDef<GradHallOptions> = {
  name: "grad-hall",
  about: "a school hall on graduation day: the stage with maroon curtains and a banner (no lettering), folding chairs and families; stage or audience view",
  spots: {
    /** Stage view: crossing the stage (left end, the table, right end). */
    stageLeft: { x: GRAD.stage.from + 220, y: GRAD.stage.y, scale: GRAD.stageScale, facing: 1 },
    table: { x: GRAD.stage.table - 150, y: GRAD.stage.y, scale: GRAD.stageScale, facing: 1 },
    principal: { x: GRAD.stage.table + 140, y: GRAD.stage.y, scale: GRAD.stageScale, facing: -1 },
  },
  cameras: {
    wide: REF,
    stage: { x: 960, y: 470, zoom: 1.5 },
    you: { x: GRAD.you.x, y: GRAD.rows[1].seat - 180, zoom: 2.4 },
  },
  lights: (o) => o.view === "stage"
    ? [{ x: 960, y: 380, r: 700, color: "#fff2cc", strength: 0.35, moods: ["morning", "day", "dusk", "night", "lamp", "frozen"] }]
    : [{ x: 610, y: 330, depth: 0.5, r: 380, color: "#fff2cc", strength: 0.3, moods: ["morning", "day"] }],
  defaults: { view: "stage", leave: [GRAD.you.x], heads: true },
  Back: GradBack,
  Mid: GradMid,
  Front: GradFront,
  example: { camera: "wide", cast: [] },
};
