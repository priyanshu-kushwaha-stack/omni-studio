// The back of your stall at closing (Red, the one tender beat, after line 77 and on line 78): a tiled back wall, a
// shelf of stacked bowls, one bare bulb, the pillar's edge with YOUR RATE on it; two upturned crates and a stack of
// crates between them with a steel tray on top. Your best friend sits on the right crate under his crimson card; you
// walk in from the left with an iced coffee, set it on the tray with a clack, and sit on the left crate. Everything is
// drawn in WORLD coordinates at REF; <IcedCoffee> is shared with the morning coffee stall.
import { Figure } from "@whatif/kit/rig/Figure";
import { lerpPose, SEATED, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { seatedY, setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { INK, MUSTARD, TEAL } from "@whatif/kit/theme";
import { Apron, headAt, type Body } from "../kit";
import { RateBoard, Tag, type BoardKey, type TagKey } from "../device";
import { blinking, FRIEND, mix, ramp } from "../shared";
import type { Face } from "./SixtyPerCent.Parts";

/** The iced coffee: a tall cup, the coffee dark under the ice, a straw. (x, y) is its bottom centre. */
export const IcedCoffee: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M-26 0 L-32 -92 H32 L26 0Z" fill="#e9f2f2" stroke={INK} strokeWidth={4} opacity={0.95} />
    <path d="M-27 -10 L-31 -66 H31 L27 -10Z" fill="#6b4630" />
    <rect x={-14} y={-60} width={14} height={12} fill="#f4fbfb" opacity={0.8} />
    <rect x={4} y={-50} width={12} height={12} fill="#f4fbfb" opacity={0.8} />
    <line x1={10} y1={-92} x2={22} y2={-130} stroke={INK} strokeWidth={6} />
  </g>
);

/** The cup in a hand (figure-local units). */
export const HELD_CUP = <IcedCoffee x={0} y={22} scale={0.45} />;

export const CRATE = {
  floor: 1000, scale: 2.3, h: 150,
  you: { x: 700, entry: 180 },
  friend: { x: 1210 },
  table: { x: 955, w: 230, h: 300 },
  board: { x: 300, y: 300 },
  bulb: { x: 960, y: 170 },
} as const;
const SEAT = CRATE.floor - CRATE.h;
const TRAY_Y = CRATE.floor - CRATE.table.h;

const Crate: React.FC<{ x: number; w: number; h: number; y?: number }> = ({ x, w, h, y = CRATE.floor }) => (
  <g>
    <rect x={x - w / 2} y={y - h} width={w} height={h} rx={6} fill="#9a6b42" stroke={INK} strokeWidth={6} />
    {[0.33, 0.66].map((t) => <line key={t} x1={x - w / 2 + 6} y1={y - h * t} x2={x + w / 2 - 6} y2={y - h * t} stroke="#6e4a2c" strokeWidth={6} />)}
    <rect x={x - w * 0.18} y={y - h * 0.86} width={w * 0.36} height={h * 0.14} rx={h * 0.07} fill="#4a321d" />
  </g>
);

const Back: React.FC = () => (
  <g>
    <rect x={-1400} y={-900} width={4800} height={2600} fill="#2a2420" />
    {/* tiles on the lower wall */}
    <rect x={-1400} y={560} width={4800} height={460} fill="#3a3a3c" />
    {Array.from({ length: 50 }, (_, i) => <line key={`v${i}`} x1={-1400 + i * 96} y1={560} x2={-1400 + i * 96} y2={1020} stroke="#2b2b2e" strokeWidth={4} />)}
    {Array.from({ length: 5 }, (_, r) => <line key={`h${r}`} x1={-1400} y1={560 + r * 96} x2={3400} y2={560 + r * 96} stroke="#2b2b2e" strokeWidth={4} />)}
    {/* the shelf of stacked bowls */}
    <rect x={560} y={420} width={900} height={20} fill="#5a4636" stroke={INK} strokeWidth={5} />
    {[640, 780, 1120, 1300].map((x, i) => (
      <g key={x}>{Array.from({ length: 3 + (i % 2) }, (_, n) => <ellipse key={n} cx={x} cy={410 - n * 18} rx={52} ry={14} fill="#e8e4da" stroke={INK} strokeWidth={4} />)}</g>
    ))}
    {/* the pillar's edge at the left */}
    <rect x={150} y={-900} width={300} height={1920} fill="#4a4d5a" stroke={INK} strokeWidth={6} />
    {/* the floor */}
    <rect x={-1400} y={CRATE.floor} width={4800} height={800} fill="#1f1c1a" />
    {/* the bulb */}
    <line x1={CRATE.bulb.x} y1={-900} x2={CRATE.bulb.x} y2={CRATE.bulb.y - 20} stroke="#14161f" strokeWidth={6} />
    <circle cx={CRATE.bulb.x} cy={CRATE.bulb.y} r={22} fill="#fff1c2" stroke={INK} strokeWidth={4} />
  </g>
);

export interface CrateTimes {
  /** You walk in from the left with the cup. */
  enter: number;
  /** The cup set down on the tray (the clack). */
  set: number;
  /** You sit on the crate. */
  sit: number;
}

export interface CrateProps {
  frame: number;
  cam: Camera;
  mood: MoodName;
  t: CrateTimes;
  youFace: Face;
  friendFace: Face;
  friendPose?: Pose;
  youPose?: Pose;
  /** His hand on the cup (lifting it in a toast, 0..1). */
  toast?: number;
  hisTag: TagKey[];
  yourTag: TagKey[];
  yourRate: BoardKey[];
}

export const CrateScene: React.FC<CrateProps> = ({ frame, cam, mood, t, youFace, friendFace, friendPose, youPose, toast = 0, hisTag, yourTag, yourRate }) => {
  const s = CRATE.scale;
  // You: walking in, standing at the tray to set the cup down, then sitting.
  const walk = ramp(frame, t.enter, t.set - 8);
  const sitting = ramp(frame, t.sit, t.sit + 12);
  const yx = frame < t.set ? mix(CRATE.you.entry, CRATE.you.x, walk) : CRATE.you.x;
  const standY = CRATE.floor;
  const sitY = seatedY(SEAT, s);
  const yPose: Pose = youPose ?? (frame < t.set - 8 ? { ...walkPose((frame - t.enter) * 0.16), armF: [70, 30] }
    : frame < t.sit ? { ...STAND, lean: 14, armF: [80, 10] }
    : lerpPose(STAND, { ...SEATED, armF: [30, 50] }, sitting));
  const yy = frame < t.sit ? standY : mix(standY, sitY, sitting);
  const yb: Body = { x: yx, y: yy, scale: s, pose: yPose, facing: 1 };
  const yh = headAt(yb.x, yb.y, s, yPose, 1);
  const cupOnTray = frame >= t.set;
  // Him: seated, the cup lifted in a toast at the end.
  const fPose: Pose = friendPose ?? { ...SEATED, armF: toast > 0 ? [mix(30, 120, toast), mix(50, 10, toast)] : [30, 50], armB: [20, 40] };
  const fb: Body = { x: CRATE.friend.x, y: sitY, scale: s, pose: fPose, facing: -1 };
  const fh = headAt(fb.x, fb.y, s, fPose, -1);
  const lifted = toast > 0.2;
  const actors = (
    <g>
      <RateBoard frame={frame} x={CRATE.board.x} y={CRATE.board.y} size={58} label="YOUR RATE" keys={yourRate} />
      <Crate x={CRATE.you.x - 10} w={190} h={CRATE.h} />
      <Crate x={CRATE.friend.x + 10} w={190} h={CRATE.h} />
      <Figure x={fb.x} y={fb.y} scale={s} facing={-1} pose={fPose} head={FRIEND.head} coat={FRIEND.coat} mouth="flat" {...friendFace}
        blink={blinking(frame, 2)} time={frame} held={lifted ? HELD_CUP : undefined} />
      <Apron b={fb} color="#4f3a2b" />
      <Figure x={yb.x} y={yb.y} scale={s} facing={1} pose={yPose} head={MUSTARD} scarf={TEAL} tuft flow={0.1} mouth="flat" {...youFace}
        blink={blinking(frame, 0)} time={frame} held={cupOnTray ? undefined : HELD_CUP} />
      <Apron b={yb} />
      {/* the stack of crates between you, the tray, the cup */}
      <Crate x={CRATE.table.x} w={CRATE.table.w} h={CRATE.table.h / 2} />
      <Crate x={CRATE.table.x} w={CRATE.table.w} h={CRATE.table.h / 2} y={CRATE.floor - CRATE.table.h / 2} />
      <rect x={CRATE.table.x - 130} y={TRAY_Y - 14} width={260} height={16} rx={6} fill="#b9bec6" stroke={INK} strokeWidth={4} />
      {cupOnTray && !lifted && <IcedCoffee x={CRATE.table.x + 20} y={TRAY_Y - 14} scale={1.1} />}
      <Tag frame={frame} x={fh.x} headY={fh.y} r={fh.r} keys={hisTag} scale={0.9} />
      <Tag frame={frame} x={yh.x} headY={yh.y} r={yh.r} keys={yourTag} scale={0.9} />
    </g>
  );
  const lights = [{ x: CRATE.bulb.x, y: CRATE.bulb.y + 60, r: 760, color: "#ffcf7a", strength: 0.55, moods: ["lamp", "dusk", "night"] as MoodName[] }];
  return (
    <LookContext.Provider value={setLook(lights, mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<Back />} actors={actors} />
    </LookContext.Provider>
  );
};

/** Head positions in the crate shot (seated), for framing. */
export const crateHeads = () => {
  const y = seatedY(SEAT, CRATE.scale);
  return {
    you: headAt(CRATE.you.x, y, CRATE.scale, SEATED, 1),
    friend: headAt(CRATE.friend.x, y, CRATE.scale, SEATED, -1),
  };
};
