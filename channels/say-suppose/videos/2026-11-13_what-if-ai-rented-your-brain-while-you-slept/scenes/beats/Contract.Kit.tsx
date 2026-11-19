// Builder D's shared pieces for The Contract, One Mind, Midnight and Morning: body maths (a shoulder, a hand, aiming an
// arm at a point), a speaking mouth, the pen, a wall clock, the brother's notebook pages of crumbs (two columns: a
// taste, a tune, a word, a face, a knot) and the stranger's face that both of you drew. World coordinates, for a
// <Stage> slot. No sound here.
import { Figure, type FigureProps, type Mouth } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, reach, type Pose } from "@whatif/kit/rig/pose";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { blinking, BROTHER, BROKER, HERO, mix, noise } from "../shared";

// ------------------------------------------------------------------------------------------------ bodies

/** Where a figure stands and how: the numbers you pass to <Figure>. */
export interface Body { x: number; y: number; scale: number; pose: Pose; facing: 1 | -1 }

export type Face = Pick<FigureProps, "brows" | "lids" | "mouth" | "eyes" | "look">;

export function shoulderAt(b: Body) {
  const j = joints(b.pose);
  return { x: b.x + j.shoulder.x * b.scale * b.facing, y: b.y + j.shoulder.y * b.scale };
}

export function headOf(b: Body) {
  const j = joints(b.pose);
  return { x: b.x + j.head.x * b.scale * b.facing, y: b.y + j.head.y * b.scale, r: 46 * b.scale };
}

export function handAt(b: Body, arm: "front" | "back" = "front") {
  const s = shoulderAt(b);
  const [u, f] = arm === "front" ? b.pose.armF : b.pose.armB;
  const a = dir(u), c = dir(u + f);
  return { x: s.x + (a.x + c.x) * LIMB * b.scale * b.facing, y: s.y + (a.y + c.y) * LIMB * b.scale };
}

/** Arm angles that put a hand on a world point (as far as the arm reaches). */
export function aimArm(b: Body, target: { x: number; y: number }): [number, number] {
  const s = shoulderAt(b);
  return reach(((target.x - s.x) / b.scale) * b.facing, (target.y - s.y) / b.scale);
}

export const mixArm = (a: [number, number], b: [number, number], t: number): [number, number] => [mix(a[0], b[0], t), mix(a[1], b[1], t)];

/** The mouth of someone speaking between two frames (shapes change every 4 frames; no lip-sync), `rest` otherwise. */
export function talk(frame: number, from: number, to: number, rest: Mouth = "flat"): Mouth {
  if (frame < from || frame >= to) return rest;
  const shapes: Mouth[] = ["open", rest === "smile" ? "smile" : "flat", "o", "open", rest];
  return shapes[Math.floor(noise(Math.floor(frame / 4)) * shapes.length)];
}

/** Sitting cross-legged on a bed, side on: thighs forward, shins folded back under. */
export const CROSS: Pose = { lean: 2, tilt: 0, armB: [20, 30], armF: [30, 40], legB: [78, -150], legF: [86, -166], drop: 0 };

/** You, with the faces passed. */
export const You: React.FC<{ body: Body; face: Face; frame: number; held?: React.ReactNode }> = ({ body, face, frame, held }) => (
  <Figure {...HERO} {...body} {...face} blink={blinking(frame, 1)} time={frame} held={held} />
);

/** Your brother: peach head, red cap, grey hoodie. */
export const Brother: React.FC<{ body: Body; face: Face; frame: number; held?: React.ReactNode }> = ({ body, face, frame, held }) => (
  <Figure head={BROTHER.head} coat={BROTHER.coat} cap={BROTHER.cap} {...body} {...face} blink={blinking(frame, 3)} time={frame} held={held} />
);

/** The man in the grey suit. */
export const Broker: React.FC<{ body: Body; face: Face; frame: number; held?: React.ReactNode }> = ({ body, face, frame, held }) => (
  <Figure head={BROKER.head} coat={BROKER.coat} tie={BROKER.tie} {...body} {...face} blink={blinking(frame, 5)} time={frame} held={held} />
);

// ------------------------------------------------------------------------------------------------ props

/** A pen: ink barrel, gold nib. (x, y) is its middle; `tilt` degrees. */
export const Pen: React.FC<{ x: number; y: number; tilt?: number; scale?: number }> = ({ x, y, tilt = 0, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <rect x={-36} y={-5} width={62} height={10} rx={5} fill="#1b1d24" />
    <rect x={-30} y={-6} width={6} height={12} fill="#c9a36b" />
    <path d="M26 -5 L42 0 L26 5Z" fill="#d6b25e" stroke={INK} strokeWidth={1.5} />
  </g>
);

/** A round wall clock, `hour` and `minute` hands (hour may be fractional). (x, y) is its centre. */
export const WallClock: React.FC<{ x: number; y: number; r: number; hour: number; minute: number }> = ({ x, y, r, hour, minute }) => {
  const h = ((hour % 12) + minute / 60) * 30;
  const m = minute * 6;
  const hand = (deg: number, len: number, w: number) => (
    <line x1={0} y1={0} x2={Math.sin((deg * Math.PI) / 180) * len} y2={-Math.cos((deg * Math.PI) / 180) * len}
      stroke={INK} strokeWidth={w} strokeLinecap="round" />
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r + r * 0.12} fill="#5a3a28" stroke={INK} strokeWidth={r * 0.06} />
      <circle r={r} fill="#fff6e3" stroke={INK} strokeWidth={r * 0.04} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const k = i % 3 === 0 ? 0.78 : 0.86;
        return <line key={i} x1={Math.sin(a) * r * k} y1={-Math.cos(a) * r * k} x2={Math.sin(a) * r * 0.94} y2={-Math.cos(a) * r * 0.94}
          stroke={INK} strokeWidth={r * (i % 3 === 0 ? 0.07 : 0.035)} strokeLinecap="round" />;
      })}
      {hand(h, r * 0.5, r * 0.09)}
      {hand(m, r * 0.78, r * 0.055)}
      <circle r={r * 0.07} fill={INK} />
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the crumbs

/**
 * The face both of you dreamt, drawn in pencil: a long face, round glasses, a side parting, a mole on the left cheek.
 * `hand` 0 or 1 picks whose drawing it is (the same features, a different line). Centred at (x, y), about 100 tall.
 */
export const StrangerFace: React.FC<{ x: number; y: number; s?: number; color?: string; hand?: number; fill?: string }> = ({
  x, y, s = 1, color = "#3a4a6a", hand = 0, fill }) => {
  const w = hand ? 4.5 : 3;
  const sk = hand ? 6 : -4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) skewX(${sk * 0.4})`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path d={hand ? "M-34 -10 Q-36 -52 0 -54 Q36 -52 34 -10 Q32 40 0 50 Q-32 40 -34 -10Z" : "M-32 -12 Q-34 -50 0 -52 Q34 -50 32 -12 Q30 42 0 48 Q-30 42 -32 -12Z"}
        fill={fill ?? "none"} />
      <path d={hand ? "M-30 -30 Q-6 -46 22 -40 Q30 -36 34 -24" : "M-28 -28 Q-4 -44 20 -38 Q30 -34 32 -24"} />
      <circle cx={-14} cy={-4} r={11} />
      <circle cx={14} cy={-4} r={11} />
      <line x1={-3} y1={-4} x2={3} y2={-4} />
      <path d="M0 6 L-4 18 L3 19" />
      <path d={hand ? "M-12 30 Q0 34 12 29" : "M-11 29 Q0 33 11 30"} />
      <circle cx={-20} cy={16} r={2.5} fill={color} />
    </g>
  );
};

/** Three music notes on a short stave: the tune. Same shape everywhere it appears (it is the same tune). */
export const Tune: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = INK }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeWidth={3} fill={color} strokeLinecap="round">
    {[-12, -4, 4, 12].map((dy) => <line key={dy} x1={-44} y1={dy} x2={44} y2={dy} strokeWidth={1.5} opacity={0.6} />)}
    <ellipse cx={-28} cy={8} rx={7} ry={5} /><line x1={-21} y1={8} x2={-21} y2={-22} />
    <ellipse cx={-2} cy={-4} rx={7} ry={5} /><line x1={5} y1={-4} x2={5} y2={-30} />
    <ellipse cx={22} cy={4} rx={7} ry={5} /><line x1={29} y1={4} x2={29} y2={-26} />
    <line x1={5} y1={-30} x2={29} y2={-26} strokeWidth={5} />
  </g>
);

/** The bridge word: a squiggle of a word nobody can read, under a small drawn bridge. */
export const Word: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = INK }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round">
    <path d="M-40 10 Q-20 -22 0 -24 Q20 -22 40 10" />
    {[-26, -13, 0, 13, 26].map((dx) => <line key={dx} x1={dx} y1={10} x2={dx} y2={dx === 0 ? -24 : -24 + Math.abs(dx) * 0.9} />)}
    <line x1={-46} y1={10} x2={46} y2={10} />
    <path d="M-38 26 q6 -8 10 0 q4 8 9 -2 q5 -9 9 1 q4 7 9 -3 q4 -6 9 2 q4 6 10 -2" />
  </g>
);

/** A taste: a drop and a little fork. */
export const Taste: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = INK }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round">
    <path d="M-14 -22 Q-26 0 -14 10 Q-2 0 -14 -22Z" fill="#e6a0a0" />
    <path d="M14 -24 V-8 M8 -24 V-12 Q14 -4 20 -12 V-24 M14 -8 V22" />
  </g>
);

/** A knot nobody taught him. */
export const Knot: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = INK }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={color} strokeWidth={3.5} strokeLinecap="round">
    <path d="M-40 6 Q-20 6 -10 -6 Q0 -22 12 -10 Q22 2 6 10 Q-10 16 -4 -2 Q4 -18 22 -6 Q30 2 40 2" />
  </g>
);

/** A page of the notebook: two columns (his, with a peach dot; yours, with a mustard dot), crumbs in each. `crumbs`
 *  picks which rows show (0..1 reveals them in order), `kind` which page of the set. Drawn about its centre, w x h. */
export const CrumbPage: React.FC<{ x: number; y: number; w?: number; h?: number; tilt?: number; kind?: number; show?: number;
  shade?: number }> = ({ x, y, w = 300, h = 400, tilt = 0, kind = 0, show = 1, shade = 0 }) => {
  const rows = [
    [(cx: number, cy: number, c: string) => <Taste x={cx} y={cy} s={0.9} color={c} />, (cx: number, cy: number, c: string) => <Tune x={cx} y={cy} s={0.75} color={c} />],
    [(cx: number, cy: number, c: string) => <Tune x={cx} y={cy} s={0.75} color={c} />, (cx: number, cy: number, c: string) => <Word x={cx} y={cy} s={0.8} color={c} />],
    [(cx: number, cy: number, c: string) => <Word x={cx} y={cy} s={0.8} color={c} />, (cx: number, cy: number, c: string) => <StrangerFace x={cx} y={cy} s={0.55} color={c} hand={1} />],
    [(cx: number, cy: number, c: string) => <Knot x={cx} y={cy} s={0.8} color={c} />, (cx: number, cy: number, c: string) => <Taste x={cx} y={cy} s={0.9} color={c} />],
  ];
  const order = [0, 1, 2, 3].map((i) => (i + kind) % 4);
  const shown = Math.round(show * 4);
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <rect x={-w / 2 + 8} y={-h / 2 + 10} width={w} height={h} rx={6} fill="#000" opacity={0.22} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill="#f7f0e0" stroke="#cdbfa6" strokeWidth={3} />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-w / 2 + 10} x2={w / 2 - 10} y1={-h / 2 + 50 + i * ((h - 60) / 9)}
        y2={-h / 2 + 50 + i * ((h - 60) / 9)} stroke="#a9c4dc" strokeWidth={1.6} opacity={0.7} />)}
      <line x1={0} y1={-h / 2 + 12} x2={0} y2={h / 2 - 12} stroke="#d8344f" strokeWidth={2} opacity={0.6} />
      <circle cx={-w / 4} cy={-h / 2 + 26} r={11} fill={BROTHER.head} stroke={INK} strokeWidth={2} />
      <circle cx={w / 4} cy={-h / 2 + 26} r={11} fill={MUSTARD} stroke={INK} strokeWidth={2} />
      <g transform={`scale(${w / 300} ${h / 400})`}>
        {order.slice(0, shown).map((r, i) => (
          <g key={i}>
            {rows[r][0](-75, -110 + i * 82, "#7a3b2e")}
            {rows[r][1](75, -110 + i * 82, "#1f5c63")}
          </g>
        ))}
      </g>
      {shade > 0 && <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill="#0b1024" opacity={shade} />}
    </g>
  );
};

/** The brother's notebook, closed: a red cover with an elastic. (x, y) its centre. */
export const Notebook: React.FC<{ x: number; y: number; w?: number; h?: number; tilt?: number }> = ({ x, y, w = 300, h = 400, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
    <rect x={-w / 2 + 8} y={-h / 2 + 10} width={w} height={h} rx={10} fill="#000" opacity={0.25} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="#b8432f" stroke={INK} strokeWidth={4} />
    <rect x={w / 2 - 40} y={-h / 2} width={14} height={h} fill="#2a2d36" />
    <rect x={-w / 2 + 30} y={-h / 2 + 40} width={w * 0.5} height={30} rx={6} fill={PAPER} opacity={0.85} />
  </g>
);

export { MUSTARD, TEAL };
