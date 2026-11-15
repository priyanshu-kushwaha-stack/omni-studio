// The Rule's kitchen (the library `kitchen`, morning): a table in front of the counter, you on the left with the
// leaflet, your brother on the right with his cereal, the jar and the band between you. Drawn on the kit's Stage.
import { SEATED, seatedY, type Pose } from "@whatif/kit/rig/pose";
import type { Expression } from "@whatif/kit/rig/expressions";
import { kitchen, type KitchenOptions } from "@whatif/kit/sets/Kitchen";
import { Chair, setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { Band, Jar } from "../parts";
import { BROTHER, HERO } from "../shared";
import { aim, Body, handWorld, type Placed } from "./Chair.Rig";

/** Where everything is at the table (REF world units). */
export const TABLE = {
  top: 800,
  from: 560,
  to: 1380,
  seat: 850,
  you: { x: 470, scale: 1.15 },
  brother: { x: 1460, scale: 1.15 },
  jar: { x: 930, y: 800 },
  leaflet: { x: 700, y: 796 },
  band: { x: 1110, y: 790 },
  bowl: { x: 1290, y: 800 },
};

const OPTIONS: KitchenOptions = { stove: "kettle", steam: 0, counter: [] };

export const youAt = (pose: Pose): Placed => ({ x: TABLE.you.x, y: seatedY(TABLE.seat, TABLE.you.scale), scale: TABLE.you.scale, facing: 1, pose });
export const brotherAt = (pose: Pose): Placed => ({ x: TABLE.brother.x, y: seatedY(TABLE.seat, TABLE.brother.scale), scale: TABLE.brother.scale, facing: -1, pose });
/** Head centres, for close-ups. */
export const YOU_HEAD = { x: TABLE.you.x, y: TABLE.seat - 152 * TABLE.you.scale };
export const BRO_HEAD = { x: TABLE.brother.x, y: TABLE.seat - 152 * TABLE.brother.scale };

type Face = Partial<Expression> & { blink?: boolean; look?: { x: number; y: number } };

export interface KitchenState {
  you: Face;
  /** You lean over the leaflet (0) or sit back (1). */
  youBack?: number;
  bro: Face;
  /** 0..1 the spoon's trip from bowl to mouth. */
  spoon: number;
  /** He holds the leaflet up, upside down, in both hands. */
  reading?: boolean;
  /** The leaflet on the table (it is in his hands once he reads it). */
  leafletOnTable?: boolean;
}

/** A small upright leaflet in his hands, the head-and-bulb drawing upside down. (x, y) its centre. */
const HeldLeaflet: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) rotate(184)`}>
    <rect x={-70} y={-95} width={140} height={190} rx={6} fill={PAPER} stroke={INK} strokeWidth={4} />
    <line x1={0} y1={-95} x2={0} y2={95} stroke="#e2d6bf" strokeWidth={3} />
    <circle cx={-34} cy={-40} r={20} fill="none" stroke={INK} strokeWidth={4} />
    <path d="M-34 -20 V30 M-34 -2 L-56 22 M-34 -2 L-12 22 M-34 30 L-50 66 M-34 30 L-18 66" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    <circle cx={36} cy={-30} r={18} fill="#ffe39a" stroke={INK} strokeWidth={4} />
    <rect x={28} y={-12} width={16} height={12} fill="#9aa1ab" />
    <path d="M14 30 H60 M14 48 H50 M14 66 H56" stroke="#b9b5a8" strokeWidth={6} strokeLinecap="round" />
  </g>
);

/** The table and what's on it; the seated two of you. */
const People: React.FC<{ frame: number; s: KitchenState }> = ({ frame, s }) => {
  const lean = 8 - 10 * (s.youBack ?? 0);
  const yp: Pose = { ...SEATED, lean, armF: [80, 40], armB: [70, 50] };
  const you = youAt(yp);
  const spoonUp = Math.sin(Math.min(1, s.spoon) * Math.PI);
  const bBase: Pose = { ...SEATED, lean: 4 };
  const bf = brotherAt(bBase);
  const mouth = { x: BRO_HEAD.x - 20, y: BRO_HEAD.y + 25 };
  const bowl = { x: TABLE.bowl.x + 10, y: TABLE.bowl.y - 20 };
  const armB: [number, number] = s.reading ? aim(bf, { x: 1345, y: 735 }) : aim(bf, { x: bowl.x + (mouth.x - bowl.x) * spoonUp, y: bowl.y + (mouth.y - bowl.y) * spoonUp });
  const armF: [number, number] = s.reading ? aim(bf, { x: 1350, y: 770 }) : [60, 50];
  const bro: Placed = brotherAt({ ...bBase, armB, armF });
  const spoonAt = handWorld(bro, "armB");
  return (
    <>
      <Chair x={TABLE.you.x - 20} y={TABLE.seat} scale={1.2} facing={1} color="#8a5c3b" />
      <Chair x={TABLE.brother.x + 20} y={TABLE.seat} scale={1.2} facing={-1} color="#8a5c3b" />
      <Body f={you} head={HERO.head} scarf={HERO.scarf} tuft time={frame} {...s.you} />
      <Body f={bro} head={BROTHER.head} coat={BROTHER.coat} cap={BROTHER.cap} {...s.bro} />
      {!s.reading && (
        <g>
          <line x1={spoonAt.x} y1={spoonAt.y} x2={spoonAt.x - 30} y2={spoonAt.y - 6} stroke="#b8bec8" strokeWidth={7} strokeLinecap="round" />
          <ellipse cx={spoonAt.x - 36} cy={spoonAt.y - 7} rx={11} ry={7} fill="#b8bec8" stroke={INK} strokeWidth={3} />
        </g>
      )}
      {/* the table */}
      <rect x={TABLE.from} y={TABLE.top} width={TABLE.to - TABLE.from} height={26} rx={8} fill="#b27a4d" stroke={INK} strokeWidth={5} />
      <rect x={TABLE.from + 30} y={TABLE.top + 26} width={22} height={140} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
      <rect x={TABLE.to - 52} y={TABLE.top + 26} width={22} height={140} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
      <Jar x={TABLE.jar.x} y={TABLE.jar.y} w={110} h={140} fill={0.36} />
      <Band x={TABLE.band.x} y={TABLE.band.y} scale={0.55} lit={false} />
      {/* the cereal bowl */}
      <path d={`M${TABLE.bowl.x - 70} ${TABLE.bowl.y - 50} Q${TABLE.bowl.x} ${TABLE.bowl.y + 20} ${TABLE.bowl.x + 70} ${TABLE.bowl.y - 50}Z`} fill="#e6a0a0" stroke={INK} strokeWidth={5} />
      <ellipse cx={TABLE.bowl.x} cy={TABLE.bowl.y - 50} rx={70} ry={10} fill="#f6e3b0" stroke={INK} strokeWidth={4} />
      {/* the leaflet, folded on the table */}
      {(s.leafletOnTable ?? true) && (
        <path d={`M${TABLE.leaflet.x - 90} ${TABLE.leaflet.y} L${TABLE.leaflet.x - 60} ${TABLE.leaflet.y - 14} L${TABLE.leaflet.x + 90} ${TABLE.leaflet.y - 14} L${TABLE.leaflet.x + 70} ${TABLE.leaflet.y}Z`}
          fill={PAPER} stroke={INK} strokeWidth={4} />
      )}
      {s.reading && <HeldLeaflet x={1290} y={700} />}
    </>
  );
};

/** The kitchen at the table through `cam`. */
export const KitchenTable: React.FC<{ frame: number; cam: Camera; s: KitchenState; mood?: MoodName; children?: React.ReactNode }> = ({
  frame, cam, s, mood = "morning", children,
}) => {
  const props = { cam, mood, frame, options: OPTIONS };
  return (
    <LookContext.Provider value={setLook(kitchen.lights(OPTIONS), mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={kitchen.Back(props)}
        actors={<><People frame={frame} s={s} />{children}</>} />
    </LookContext.Provider>
  );
};
