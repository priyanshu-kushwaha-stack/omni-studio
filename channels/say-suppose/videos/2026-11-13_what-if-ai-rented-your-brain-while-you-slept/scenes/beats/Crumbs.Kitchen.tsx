// The breakfast table in the library kitchen (Crumbs and its mornings): the table and two chairs in front of the
// counter, you on the left and your brother on the right, the wall clock, and the things on the table (the jar, the
// leaflet you draw on, the fitted sheet, the notebook, his spoon). Plus the top-down table inserts: the drawing that
// is a shoe, the sheet folding itself square, the spoon on the floor, the notebook's two columns. World coordinates.
import { SEATED, seatedY } from "@whatif/kit/rig/pose";
import { kitchen } from "@whatif/kit/sets";
import { Chair, Deep, setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { Jar } from "../parts";
import { BROTHER, HERO, mix, noise } from "../shared";
import { Brother, Tongue, You, type Body, type Face } from "./Crumbs.Rig";

export const TABLE = { from: 610, to: 1280, top: 790, floor: 960, mid: 945 };
const SEAT_TOP = 850;
export const YOU_SEAT: Body = { x: 540, y: seatedY(SEAT_TOP, 1.15), scale: 1.15, facing: 1, pose: SEATED };
export const BRO_SEAT: Body = { x: 1350, y: seatedY(SEAT_TOP, 1.15), scale: 1.15, facing: -1, pose: SEATED };
/** The wall clock over the counter (on the kitchen's back wall, depth 0.85). */
export const CLOCK = { x: 565, y: 240, r: 52 };

/** A wall clock; `t` turns the hands (radians of the minute hand). */
export const WallClock: React.FC<{ x: number; y: number; r: number; t: number }> = ({ x, y, r, t }) => (
  <g>
    <circle cx={x} cy={y} r={r + 8} fill="#8a5c3b" stroke={INK} strokeWidth={5} />
    <circle cx={x} cy={y} r={r} fill={PAPER} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <line key={i} x1={x + Math.sin(a) * r * 0.8} y1={y - Math.cos(a) * r * 0.8} x2={x + Math.sin(a) * r * 0.92} y2={y - Math.cos(a) * r * 0.92} stroke={INK} strokeWidth={i % 3 ? 3 : 6} />;
    })}
    <line x1={x} y1={y} x2={x + Math.sin(t / 12) * r * 0.5} y2={y - Math.cos(t / 12) * r * 0.5} stroke={INK} strokeWidth={8} strokeLinecap="round" />
    <line x1={x} y1={y} x2={x + Math.sin(t) * r * 0.78} y2={y - Math.cos(t) * r * 0.78} stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <circle cx={x} cy={y} r={6} fill="#d8344f" />
  </g>
);

/** A cereal bowl on the table. */
const Bowl: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <path d={`M${x - 52} ${TABLE.top - 46} Q${x} ${TABLE.top + 14} ${x + 52} ${TABLE.top - 46}Z`} fill="#7fa0c4" stroke={INK} strokeWidth={4} />
    {[-30, -10, 12, 30].map((dx) => <circle key={dx} cx={x + dx} cy={TABLE.top - 48} r={7} fill="#e6b85a" stroke={INK} strokeWidth={2} />)}
  </g>
);

/** A metal spoon, its bowl at the origin, pointing up at rot 0. */
export const Spoon: React.FC<{ x?: number; y?: number; rot?: number; s?: number }> = ({ x = 0, y = 0, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-4} y={-4} width={8} height={70} rx={4} fill="#c9ced6" stroke={INK} strokeWidth={3} />
    <ellipse cx={0} cy={-14} rx={13} ry={18} fill="#dfe3e8" stroke={INK} strokeWidth={3} />
  </g>
);

/** The leaflet held up: a small paper with the drawing on it; `turn` 0..1 swings it edge-on toward the brother. */
export const HeldPage: React.FC<{ turn?: number }> = ({ turn = 0 }) => (
  <g transform={`scale(${mix(1, 0.12, turn)} 1) translate(-60 -110)`}>
    <rect x={0} y={0} width={120} height={90} fill={PAPER} stroke={INK} strokeWidth={3} />
    <path d="M18 66 L104 66 Q110 58 104 52 L80 44 Q66 26 52 38 L34 40 Q16 44 18 66Z M44 42 l6 8 l6 -8 l6 8" fill="none" stroke="#c0582f" strokeWidth={4} strokeLinejoin="round" />
  </g>
);

/** The crayon in your hand. */
export const Crayon: React.FC = () => (
  <g transform="rotate(-30) translate(-6 -48)">
    <rect x={0} y={0} width={12} height={44} rx={3} fill="#c0582f" stroke={INK} strokeWidth={3} />
    <path d="M0 0 L6 -12 L12 0Z" fill="#c0582f" stroke={INK} strokeWidth={3} />
  </g>
);

export interface KitchenTableProps {
  frame: number;
  cam: Camera;
  mood: MoodName;
  you?: { body: Body; face: Face; held?: React.ReactNode; band?: boolean; tongue?: boolean; seated?: boolean } | null;
  brother?: { body: Body; face: Face; held?: React.ReactNode; light?: number; two?: boolean; bowl?: boolean } | null;
  /** The jar on the table and its fill, or null. */
  jar?: number | null;
  /** The clock's minute hand (radians). */
  clock?: number;
  /** Drawn on the table top after the table (a page, the sheet, the notebook). */
  onTable?: React.ReactNode;
  /** Drawn last (a bubble, a falling spoon). */
  extra?: React.ReactNode;
}

/** The kitchen with the breakfast table, lit by the mood. */
export const KitchenTable: React.FC<KitchenTableProps> = ({ frame, cam, mood, you, brother, jar = null, clock = 1.2, onTable, extra }) => {
  const options = { ...kitchen.defaults, stove: "kettle" as const, steam: 0, counter: ["mug" as const] };
  const props = { cam, mood, frame, options };
  const actors = (
    <>
      {(!you || you.seated !== false) && <Chair x={YOU_SEAT.x} y={SEAT_TOP} scale={1.1} facing={1} color="#7a5236" />}
      <Chair x={BRO_SEAT.x} y={SEAT_TOP} scale={1.1} facing={-1} color="#7a5236" />
      {you && <You body={you.body} face={you.face} frame={frame} held={you.held} band={you.band} />}
      {you?.tongue && <Tongue body={you.body} />}
      {brother && <Brother body={brother.body} face={brother.face} frame={frame} held={brother.held} light={brother.light} two={brother.two} />}
      {/* the table */}
      <rect x={TABLE.from + 30} y={TABLE.top + 20} width={18} height={TABLE.floor - TABLE.top - 20} fill="#6b4630" stroke={INK} strokeWidth={4} />
      <rect x={TABLE.to - 48} y={TABLE.top + 20} width={18} height={TABLE.floor - TABLE.top - 20} fill="#6b4630" stroke={INK} strokeWidth={4} />
      <rect x={TABLE.from} y={TABLE.top + 16} width={TABLE.to - TABLE.from} height={34} fill="#7a5236" stroke={INK} strokeWidth={4} />
      <rect x={TABLE.from - 14} y={TABLE.top - 6} width={TABLE.to - TABLE.from + 28} height={24} rx={6} fill="#a8774f" stroke={INK} strokeWidth={5} />
      {brother?.bowl !== false && <Bowl x={1180} />}
      {jar !== null && <Jar x={940} y={TABLE.top - 4} w={110} h={140} fill={jar} />}
      {onTable}
      {extra}
    </>
  );
  return (
    <LookContext.Provider value={setLook(kitchen.lights(options), mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={<>{kitchen.Back(props)}<Deep cam={cam} depth={0.85}><WallClock x={CLOCK.x} y={CLOCK.y} r={CLOCK.r} t={clock} /></Deep></>}
        actors={actors} front={kitchen.Front?.(props)} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ top-down inserts

/** A top-down insert on a surface (the table's wood, or the floor's tiles): `children` in REF screen coordinates. */
export const TopDown: React.FC<{ frame: number; cam: Camera; mood: MoodName; surface?: "wood" | "floor" | "desk"; children: React.ReactNode }> = ({ cam, mood, surface = "wood", children }) => {
  const back = (
    <Deep cam={cam} depth={1}>
      {surface === "floor" ? (
        <g>
          <rect x={-800} y={-600} width={3600} height={2400} fill="#c98f5e" />
          {Array.from({ length: 20 }, (_, i) => <line key={i} x1={-800 + i * 220} y1={-600} x2={-900 + i * 220} y2={1800} stroke="#000" strokeWidth={4} opacity={0.1} />)}
          {Array.from({ length: 10 }, (_, i) => <line key={i} x1={-800} y1={-600 + i * 240} x2={2800} y2={-600 + i * 240} stroke="#000" strokeWidth={4} opacity={0.08} />)}
        </g>
      ) : (
        <g>
          <rect x={-800} y={-600} width={3600} height={2400} fill={surface === "desk" ? "#c9a77a" : "#a8774f"} />
          {Array.from({ length: 22 }, (_, i) => (
            <path key={i} d={`M-800 ${-500 + i * 110} Q960 ${-470 + i * 110 + noise(i) * 40} 2800 ${-500 + i * 110}`} fill="none" stroke="#7a5236" strokeWidth={6} opacity={0.35} />
          ))}
        </g>
      )}
    </Deep>
  );
  return (
    <LookContext.Provider value={setLook([], mood, cam, { dof: 0 })}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={back} actors={<>{children}</>} />
    </LookContext.Provider>
  );
};

/** Your hand from above (mustard), at (x, y), pointing up-left; `crayon` puts the crayon in it. */
export const TopHand: React.FC<{ x: number; y: number; rot?: number; crayon?: boolean; color?: string; s?: number }> = ({ x, y, rot = -20, crayon, color = MUSTARD, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {crayon && <g transform="translate(-14 -120)"><rect x={0} y={0} width={26} height={100} rx={6} fill="#c0582f" stroke={INK} strokeWidth={4} /><path d="M0 0 L13 -26 L26 0Z" fill="#c0582f" stroke={INK} strokeWidth={4} /></g>}
    <path d="M-60 300 L-46 40 Q-40 -10 0 -16 Q40 -10 46 40 L60 300Z" fill={INK} />
    <ellipse cx={0} cy={0} rx={52} ry={62} fill={color} stroke={INK} strokeWidth={5} />
    <ellipse cx={-30} cy={-40} rx={18} ry={30} fill={color} stroke={INK} strokeWidth={4} transform="rotate(-25 -30 -40)" />
  </g>
);

/** The leaflet's back, on the table, with your crayon drawing of the food you can't name: it is a shoe (laces, a
 *  sole) with steam rising off it. The lines draw themselves between `from` and `to`. */
export const ShoeDrawing: React.FC<{ from: number; to: number; tilt?: number }> = ({ from, to, tilt = -3 }) => {
  const C = "#c0582f";
  const seg = (a: number, b: number) => [Math.round(mix(from, to, a)), Math.round(mix(from, to, b))] as const;
  const lines: [string, readonly [number, number], number][] = [
    ["M640 700 L1250 700 Q1300 700 1300 650 L1290 630", seg(0, 0.25), 16],
    ["M640 700 Q610 560 760 540 L900 520 Q975 460 1045 520 L1180 600 Q1290 610 1290 630", seg(0.2, 0.55), 16],
    ["M860 548 L905 600 L935 532 L965 600 L995 545 L1030 600", seg(0.5, 0.7), 10],
    ["M700 680 L1240 680", seg(0.65, 0.75), 8],
    ["M800 470 q24 -30 0 -60 q-24 -30 0 -60", seg(0.75, 0.85), 9],
    ["M920 440 q24 -30 0 -60 q-24 -30 0 -60", seg(0.82, 0.92), 9],
    ["M1040 470 q24 -30 0 -60 q-24 -30 0 -60", seg(0.88, 1), 9],
  ];
  return (
    <g transform={`rotate(${tilt} 960 560)`}>
      <rect x={470} y={250} width={1000} height={620} fill="#000" opacity={0.2} transform="translate(14 16)" />
      <rect x={470} y={250} width={1000} height={620} fill={PAPER} stroke="#cdbfa6" strokeWidth={4} />
      {lines.map(([d, [a, b], w], i) => <DrawLine key={i} d={d} from={a} to={b} color={C} width={w} />)}
    </g>
  );
};

/** The fitted sheet folding itself, from above: 0 a crumpled blob with elastic corners, 1 folded in half, 2 in
 *  quarters, 3 a perfect square with a gleam. `stage` may be fractional (it snaps with a pop). */
export const FoldingSheet: React.FC<{ stage: number; frame: number }> = ({ stage, frame }) => {
  const s = Math.floor(stage);
  const pop = 1 + 0.12 * Math.max(0, 1 - (stage - s) * 4);
  const cx = 960, cy = 560;
  const blob = "M660 420 Q720 330 830 380 Q900 300 1010 360 Q1120 320 1200 400 Q1300 460 1250 560 Q1300 680 1180 730 Q1080 800 960 740 Q830 800 740 730 Q620 690 650 580 Q600 500 660 420Z";
  return (
    <g transform={`translate(${cx} ${cy}) scale(${pop}) translate(${-cx} ${-cy})`}>
      {s === 0 && (
        <g>
          <path d={blob} fill="#f7f4ee" stroke={INK} strokeWidth={6} />
          {["M720 460 q60 40 120 0", "M900 420 q40 80 120 40", "M760 640 q90 -30 160 40", "M1060 560 q60 50 120 10", "M940 560 q-30 60 30 110"].map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#cfc6b6" strokeWidth={6} strokeLinecap="round" />
          ))}
          {[[690, 430], [1220, 410], [1220, 700], [700, 710]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={14} fill="none" stroke="#cfc6b6" strokeWidth={5} />)}
        </g>
      )}
      {s === 1 && (
        <g>
          <rect x={700} y={420} width={520} height={300} rx={18} fill="#f7f4ee" stroke={INK} strokeWidth={6} />
          <path d="M720 440 q30 30 0 60 M1200 440 q-30 30 0 60" fill="none" stroke="#cfc6b6" strokeWidth={5} />
        </g>
      )}
      {s === 2 && (
        <g>
          <rect x={790} y={430} width={340} height={260} rx={10} fill="#f7f4ee" stroke={INK} strokeWidth={6} />
          <line x1={960} y1={430} x2={960} y2={690} stroke="#cfc6b6" strokeWidth={4} />
        </g>
      )}
      {s >= 3 && (
        <g>
          <rect x={840} y={440} width={240} height={240} rx={4} fill="#f7f4ee" stroke={INK} strokeWidth={6} />
          <rect x={852} y={452} width={216} height={216} fill="none" stroke="#e2dccf" strokeWidth={3} />
          <g opacity={Math.max(0, Math.sin((frame % 40) / 40 * Math.PI))}>
            <path d="M1080 430 l8 -26 l8 26 l26 8 l-26 8 l-8 26 l-8 -26 l-26 -8Z" fill="#fff8d0" stroke={INK} strokeWidth={3} />
          </g>
        </g>
      )}
    </g>
  );
};

/** The fitted sheet in the scene, seen side on: a crumpled blob held up, or the perfect square lying on the table. */
export const SheetBlob: React.FC = () => (
  <g transform="translate(-40 -90)">
    <path d="M0 40 Q-10 0 30 -10 Q60 -40 100 -6 Q140 0 130 50 Q140 100 90 110 Q40 130 10 100 Q-20 80 0 40Z" fill="#f7f4ee" stroke={INK} strokeWidth={4} />
    <path d="M30 20 q30 20 60 0 M20 70 q40 -10 70 20" fill="none" stroke="#cfc6b6" strokeWidth={4} />
  </g>
);
export const SheetSquare: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x - 60} y={TABLE.top - 26} width={120} height={22} rx={3} fill="#f7f4ee" stroke={INK} strokeWidth={4} />
    <line x1={x - 56} y1={TABLE.top - 15} x2={x + 56} y2={TABLE.top - 15} stroke="#e2dccf" strokeWidth={3} />
  </g>
);

/** The notebook open on the table, from above: his page (left, a cap at the top) and yours (right, a tuft), the
 *  crumbs doodled down each column as they appear (`crumbs` [frame, column, kind]). */
export type CrumbKind = "squiggle" | "shoe" | "bowl" | "note" | "word" | "face" | "knot" | "sorry";
const CrumbDoodle: React.FC<{ kind: CrumbKind; x: number; y: number; t: number }> = ({ kind, x, y, t }) => {
  if (t <= 0) return null;
  const C = "#3d4a66";
  const sc = 0.6 + 0.4 * Math.min(1, t * 2);
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={Math.min(1, t * 3)} stroke={C} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round">
      {kind === "squiggle" && <path d="M-80 0 q20 -30 40 0 t40 0 t40 0 t40 0" />}
      {kind === "shoe" && <path d="M-70 20 L60 20 Q72 10 64 0 L30 -10 Q14 -34 -4 -18 L-40 -14 Q-72 -8 -70 20Z M-14 -16 l8 10 l8 -10 l8 10" stroke="#c0582f" />}
      {kind === "bowl" && <g><path d="M-50 -6 Q0 50 50 -6Z" /><path d="M-16 -20 q8 -12 0 -24 M10 -20 q8 -12 0 -24" /></g>}
      {kind === "note" && <g><ellipse cx={-10} cy={14} rx={14} ry={10} /><path d="M4 14 V-36 q20 8 14 30" /></g>}
      {kind === "word" && <g><rect x={-60} y={-32} width={120} height={56} rx={24} /><path d="M-40 -4 q10 -14 20 0 t20 0 t20 0 t20 0" /><path d="M-30 24 l-10 18 l24 -18" /></g>}
      {kind === "face" && <g><circle r={34} /><circle cx={-12} cy={-6} r={3} fill={C} /><circle cx={12} cy={-6} r={3} fill={C} /><path d="M-14 12 q14 12 28 0" /></g>}
      {kind === "knot" && <path d="M-70 10 C-30 10 -30 -40 0 -30 C30 -20 -20 30 10 30 C40 30 30 -30 60 -10 L80 0" />}
      {kind === "sorry" && <g><circle cx={-30} r={26} /><path d="M-40 6 q10 -6 20 0" /><path d="M10 0 q10 -14 20 0 t20 0 t20 0" /></g>}
    </g>
  );
};

export const Notebook: React.FC<{ frame: number; open: number; crumbs: [number, 0 | 1, CrumbKind][] }> = ({ frame, open, crumbs }) => {
  const rows = [0, 0];
  return (
    <g transform={`translate(960 560) scale(${mix(0.6, 1, open)}) translate(-960 -560)`}>
      <rect x={300} y={150} width={1320} height={820} rx={18} fill="#000" opacity={0.2} transform="translate(14 18)" />
      {/* left page (his), right page (yours), the spiral */}
      <rect x={300} y={150} width={660} height={820} rx={12} fill="#fbf6ea" stroke="#cdbfa6" strokeWidth={4} />
      <rect x={960} y={150} width={660} height={820} rx={12} fill="#fbf6ea" stroke="#cdbfa6" strokeWidth={4} />
      {Array.from({ length: 13 }, (_, i) => <line key={i} x1={330} y1={290 + i * 52} x2={1590} y2={290 + i * 52} stroke="#c9d8ea" strokeWidth={3} />)}
      {Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx={960} cy={190 + i * 56} rx={16} ry={10} fill="none" stroke="#7a7f88" strokeWidth={5} />)}
      {/* the column heads: his capped head, your tufted head */}
      <g transform="translate(630 225)">
        <circle r={40} fill={BROTHER.head} stroke={INK} strokeWidth={4} />
        <path d="M-40 -6 A40 40 0 0 1 40 -6Z M-32 -12 l-30 6 l6 8Z" fill={BROTHER.cap} stroke={INK} strokeWidth={3} />
      </g>
      <g transform="translate(1290 225)">
        <path d="M-8 -36 Q-12 -58 4 -62 Q-2 -50 10 -48 Q6 -40 6 -36Z" fill={INK} />
        <circle r={40} fill={HERO.head} stroke={INK} strokeWidth={4} />
      </g>
      {crumbs.map(([at, col, kind], i) => {
        const row = rows[col]++;
        return <CrumbDoodle key={i} kind={kind} x={col === 0 ? 630 : 1290} y={350 + row * 120} t={(frame - at) / 12} />;
      })}
    </g>
  );
};
