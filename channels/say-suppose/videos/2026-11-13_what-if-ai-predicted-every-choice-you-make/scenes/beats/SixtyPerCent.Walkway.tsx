// The covered walkway at ten at night (Sixty Per Cent, line 58): a railing, the city's towers beyond, a street lamp
// with the city's teal lamp clipped to it, and your best friend alone under it with his phone, CHECKS PHONE 91%.
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND } from "@whatif/kit/rig/pose";
import { Deep, setLook, Sky, Skyline } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { headAt } from "../kit";
import { Tag, TealLamp, type TagKey } from "../device";
import { blinking, FRIEND } from "../shared";
import { body, Phone, reachPose } from "./SixtyPerCent.Parts";

export const WALK = { floor: 960, lamp: { x: 1180, y: 230 }, friend: { x: 1060, scale: 2.0 } } as const;

const WalkBack: React.FC<{ cam: Camera; frame: number }> = ({ cam, frame }) => (
  <g>
    <Deep cam={cam} depth={0.2} flat><Sky id="walkway" mood="night" x={-1400} y={-800} w={4800} h={1600} sunAt={{ x: 400, y: 160 }} /></Deep>
    <Deep cam={cam} depth={0.4} flat><Skyline mood="night" from={-1400} to={3400} base={700} tall={460} seed={11} /></Deep>
    <Deep cam={cam} depth={0.9}>
      {/* the walkway: its roof, the railing, the floor */}
      <rect x={-1400} y={-800} width={4800} height={850} fill="#1c2033" />
      <rect x={-1400} y={40} width={4800} height={26} fill="#11131e" />
      <rect x={-1400} y={WALK.floor} width={4800} height={700} fill="#3a3d4a" />
      <rect x={-1400} y={700} width={4800} height={14} fill="#6b7080" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 34 }, (_, i) => <rect key={i} x={-1400 + i * 150} y={700} width={10} height={WALK.floor - 700} fill="#545868" />)}
      {/* a far walker at the end of the walkway */}
      <circle cx={((frame * 1.4) % 2600) - 600} cy={860} r={16} fill="#7fa0c4" opacity={0.6} />
    </Deep>
    <Deep cam={cam} depth={1}>
      <rect x={WALK.lamp.x + 120} y={WALK.lamp.y - 40} width={22} height={WALK.floor - WALK.lamp.y + 40} fill="#2c3040" stroke={INK} strokeWidth={4} />
      <path d={`M${WALK.lamp.x + 131} ${WALK.lamp.y - 30} Q${WALK.lamp.x + 60} ${WALK.lamp.y - 70} ${WALK.lamp.x} ${WALK.lamp.y - 30}`} fill="none" stroke="#2c3040" strokeWidth={14} />
      <path d={`M${WALK.lamp.x - 60} ${WALK.lamp.y} L${WALK.lamp.x - 24} ${WALK.lamp.y - 34} H${WALK.lamp.x + 24} L${WALK.lamp.x + 60} ${WALK.lamp.y}Z`} fill="#3b404e" stroke={INK} strokeWidth={5} />
      <circle cx={WALK.lamp.x} cy={WALK.lamp.y + 6} r={16} fill="#fff1c2" />
      <path d={`M${WALK.lamp.x - 380} ${WALK.floor} L${WALK.lamp.x - 40} ${WALK.lamp.y + 10} H${WALK.lamp.x + 40} L${WALK.lamp.x + 420} ${WALK.floor}Z`} fill="#ffd98a" opacity={0.08} />
    </Deep>
  </g>
);

/** Him under the lamp with the phone, the tag over him. */
export const WalkwayShot: React.FC<{ frame: number; cam: Camera; tag: TagKey[]; from: number }> = ({ frame, cam, tag, from }) => {
  const b0 = body(WALK.friend.x, STAND, 1, WALK.floor, WALK.friend.scale);
  const h = headAt(b0.x, b0.y, b0.scale, STAND, 1);
  const pose = reachPose(b0, { x: h.x + h.r * 1.25, y: h.y + h.r * 1.0 });
  const thumb = Math.floor((frame - from) / 11) % 2;
  const actors = (
    <g>
      <TealLamp frame={frame} x={WALK.lamp.x + 131} y={WALK.lamp.y + 60} size={26} />
      <Figure x={b0.x} y={b0.y} scale={b0.scale} facing={1} pose={pose} head={FRIEND.head} coat={FRIEND.coat}
        brows={thumb ? "flat" : "none"} lids={0.35} mouth="flat" look={{ x: 0.7, y: 0.6 }} blink={blinking(frame, 2)} time={frame} held={<Phone />} />
      <Tag frame={frame} x={h.x} headY={h.y} r={h.r} keys={tag} scale={1.3} />
    </g>
  );
  return (
    <LookContext.Provider value={setLook([{ x: WALK.lamp.x, y: WALK.lamp.y + 30, r: 520, color: "#ffcf7a", strength: 0.5, moods: ["night"] }, { x: h.x + h.r, y: h.y + h.r, r: 160, color: "#cfe9f4", strength: 0.4, moods: ["night"] }], "night", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<WalkBack cam={cam} frame={frame} />} actors={actors} />
    </LookContext.Provider>
  );
};
