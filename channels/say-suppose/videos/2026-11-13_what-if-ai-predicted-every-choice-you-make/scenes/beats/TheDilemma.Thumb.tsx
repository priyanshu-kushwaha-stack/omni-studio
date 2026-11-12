// The thumbnail's geometry (channels/say-suppose/brand/thumbs/predict, data.ts and Predict.tsx), copied so The
// Dilemma's last shots sit in the exact frame the next beat (The Key) opens on: you large at the left behind the
// counter, the tin box between you, your best friend at the right leaning in with a hand flat on the lid, a teal lamp
// at the top edge and his card hanging from it. The court behind can be drawn out of focus (line 81).
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { Deep, REF, setLook } from "@whatif/kit/sets/common";
import { LookContext, type Look } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { INK, MUSTARD, TEAL } from "@whatif/kit/theme";
import { aimArm, Apron, handAt, headAt, Shade, type Body } from "../kit";
import { RateBoard, Tag, TealLamp, type TagKey } from "../device";
import { CashBox, Key } from "../sets/FoodCourt";
import { blinking, FRIEND, HERO } from "../shared";
import { Envelope, type Face } from "./SixtyPerCent.Parts";

/** Reaching across the counter, palm up (the thumbnail's OFFER). */
export const OFFER: Pose = { ...STAND, lean: 6, tilt: 4, armF: [84, -6], armB: [-6, 14] };
/** Your best friend leaning in over the box, the near hand flat on its lid (the thumbnail's LEAN). */
export const LEAN: Pose = { ...STAND, lean: 10, tilt: 14, armF: [72, 22], armB: [-10, 10] };
export const TH = {
  you: { x: 400, y: 1775, scale: 4.2 },
  friend: { x: 1600, y: 1450, scale: 3.0 },
  counterTop: 960,
  lamp: { x: 900, y: 330 },
} as const;

export const youB = (pose: Pose): Body => ({ x: TH.you.x, y: TH.you.y, scale: TH.you.scale, pose, facing: 1 });
export const friendB = (pose: Pose = LEAN): Body => ({ x: TH.friend.x, y: TH.friend.y, scale: TH.friend.scale, pose, facing: -1 });
const FRIEND_HAND = handAt(friendB(LEAN));
/** The box stands on the counter with its lid just under his hand. */
export const TBOX = { x: FRIEND_HAND.x - 60, w: 300, h: TH.counterTop - FRIEND_HAND.y - 8 };
export const lidTop = () => TH.counterTop - TBOX.h;
export const thHeads = (youPose: Pose = OFFER, friendPose: Pose = LEAN) => ({
  you: headAt(TH.you.x, TH.you.y, TH.you.scale, youPose, 1),
  friend: headAt(TH.friend.x, TH.friend.y, TH.friend.scale, friendPose, -1),
});

const SHUTTER = "#2b3142";
const BOARDS = ["#7a3b46", "#2f5f63", "#6b5a33", "#3d4a78", "#5f3d6b"];

/** The closed court behind (the thumbnail's): shutters, dim blank boards, chairs stacked on tables. */
const Court: React.FC = () => (
  <g>
    <rect x={-1400} y={-900} width={4800} height={2600} fill="#10121b" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={120 + i * 470} y={128} width={260} height={14} rx={7} fill="#2c3040" />)}
    {[-1, 0, 1, 2, 3, 4, 5].map((i) => {
      const x = -60 + i * 420;
      return (
        <g key={i} opacity={0.9}>
          <rect x={x} y={230} width={380} height={70} rx={6} fill={BOARDS[(i + 5) % 5]} opacity={0.55} stroke={INK} strokeWidth={5} />
          <rect x={x + 30} y={256} width={170} height={16} rx={8} fill={INK} opacity={0.5} />
          <rect x={x} y={310} width={380} height={600} fill={SHUTTER} stroke={INK} strokeWidth={6} />
          {Array.from({ length: 22 }, (_, r) => <line key={r} x1={x + 6} y1={330 + r * 26} x2={x + 374} y2={330 + r * 26} stroke="#3a4156" strokeWidth={6} />)}
        </g>
      );
    })}
    {[260, 1020].map((cx) => (
      <g key={cx} fill="#1a1d29" stroke="#262a39" strokeWidth={5}>
        <rect x={cx - 120} y={740} width={240} height={18} />
        <rect x={cx - 100} y={758} width={14} height={150} />
        <rect x={cx + 86} y={758} width={14} height={150} />
        <rect x={cx - 90} y={660} width={180} height={14} />
        <rect x={cx - 90} y={600} width={12} height={140} />
        <rect x={cx + 78} y={600} width={12} height={140} />
      </g>
    ))}
    <rect x={-1400} y={905} width={4800} height={800} fill="#1b1e29" />
  </g>
);

/** Line 81's things behind you, out of focus: the coffee board on 1.50, the landlord's envelope, the man with the same
 *  lunch's empty table and tray. */
const Behind: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <RateBoard frame={frame} x={1040} y={330} size={70} keys={[{ at: 0, value: "1.50" }]} />
    <rect x={1040} y={700} width={300} height={18} fill="#6b6f7a" stroke={INK} strokeWidth={5} />
    <rect x={1182} y={718} width={16} height={200} fill="#4a4d5a" />
    <Envelope x={1120} y={688} scale={2.2} tilt={-4} />
    <rect x={1380} y={760} width={320} height={18} fill="#6b6f7a" stroke={INK} strokeWidth={5} />
    <rect x={1532} y={778} width={16} height={180} fill="#4a4d5a" />
    <rect x={1440} y={744} width={170} height={16} rx={6} fill="#b9bec6" stroke={INK} strokeWidth={4} />
  </g>
);

const Lamp: React.FC = () => {
  const { x, y } = TH.lamp;
  return (
    <g>
      <line x1={x} y1={-900} x2={x} y2={y - 50} stroke="#14161f" strokeWidth={8} />
      <path d={`M${x - 520} 1080 L${x - 60} ${y + 10} L${x + 60} ${y + 10} L${x + 640} 1080Z`} fill="#ffd98a" opacity={0.07} />
      <path d={`M${x - 80} ${y} L${x - 30} ${y - 54} L${x + 30} ${y - 54} L${x + 80} ${y}Z`} fill="#3b404e" stroke={INK} strokeWidth={6} />
      <circle cx={x} cy={y + 8} r={22} fill="#fff1c2" />
    </g>
  );
};

const Counter: React.FC = () => (
  <g>
    <rect x={-1400} y={TH.counterTop} width={4800} height={700} fill="#5a3b2a" stroke={INK} strokeWidth={8} />
    <rect x={-1400} y={TH.counterTop} width={4800} height={30} fill="#8a5d3c" stroke={INK} strokeWidth={6} />
    {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={i * 360 + 120} y1={TH.counterTop + 40} x2={i * 360 + 120} y2={1400} stroke="#3f2a1e" strokeWidth={6} />)}
  </g>
);

export interface ThumbProps {
  frame: number;
  cam: Camera;
  mood: MoodName;
  youPose?: Pose;
  youFace: Face;
  youHeld?: React.ReactNode;
  youTag?: TagKey[];
  friendPose?: Pose;
  friendFace: Face;
  friendTag?: TagKey[];
  /** Both his hands on the lid. */
  bothHands?: boolean;
  /** Line 81: the court and the things behind you out of focus. */
  soft?: boolean;
}

/** The stall counter in the thumbnail's frame. */
export const ThumbScene: React.FC<ThumbProps> = ({ frame, cam, mood, youPose = STAND, youFace, youHeld, youTag, friendPose = LEAN, friendFace, friendTag, bothHands, soft }) => {
  const fb0 = friendB(friendPose);
  const fpose: Pose = bothHands ? { ...friendPose, armB: aimArm(fb0, { x: TBOX.x + 40, y: lidTop() + 4 }) } : friendPose;
  const h = thHeads(youPose, fpose);
  const look: Partial<Look> = soft ? { dof: 22, focus: 1 } : {};
  const back = soft ? (
    <g>
      <Deep cam={cam} depth={0.55} flat><Court /></Deep>
      <Deep cam={cam} depth={0.78}><Behind frame={frame} /></Deep>
      <Lamp />
    </g>
  ) : (
    <g><Court /><Lamp /></g>
  );
  const actors = (
    <g>
      <Shade id="dilemma-you" x={h.you.x} y={h.you.y} r={h.you.r} strength={0.75} />
      <TealLamp frame={frame} x={h.friend.x} y={40} size={26} />
      <Figure x={TH.friend.x} y={TH.friend.y} scale={TH.friend.scale} facing={-1} pose={fpose} head={FRIEND.head} coat={FRIEND.coat}
        mouth="flat" {...friendFace} blink={blinking(frame, 2)} time={frame} />
      <Apron b={friendB(fpose)} color="#4f3a2b" />
      {friendTag && <Tag frame={frame} x={h.friend.x} headY={h.friend.y} r={h.friend.r} keys={friendTag} scale={0.8} threadTop={60} />}
      <Counter />
      <CashBox x={TBOX.x} y={TH.counterTop} w={TBOX.w} h={TBOX.h} />
      <Figure x={TH.you.x} y={TH.you.y} scale={TH.you.scale} pose={youPose} head={MUSTARD} scarf={TEAL} tuft flow={0.1}
        time={frame} mouth="flat" {...youFace} blink={blinking(frame, 0)} held={youHeld} />
      {youTag && <Tag frame={frame} x={h.you.x} headY={h.you.y} r={h.you.r} keys={youTag} scale={0.55} />}
    </g>
  );
  return (
    <LookContext.Provider value={setLook([{ x: TH.lamp.x, y: TH.lamp.y + 40, r: 520, color: "#ffcf7a", strength: 0.55, moods: ["lamp", "night", "dusk"] }], mood, cam, look)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={back} actors={actors} />
    </LookContext.Provider>
  );
};

/** The key in your hand (figure-local units at your scale). */
export const HELD_KEY = <Key x={6} y={-8} scale={0.2} rotate={-40} />;

export { REF };
