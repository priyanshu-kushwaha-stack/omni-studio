// Seven Years a Week's door and street: the landing outside the flat (the door with its keypad, which opens from
// inside on your flatmate with toast), the keypad insert with other doors' keypads flashing their own codes behind it,
// and the street at midnight with the queue to the hotel and the old sleeper at its head (kit `street`).
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { setLook } from "@whatif/kit/sets/common";
import { street } from "@whatif/kit/sets/Street";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { mix, noise, PASTELS } from "../shared";
import { aimArm, BigHand, Person, type Body, type Face } from "./TellMeTomorrow.Kit";

const FLOOR = 960;
export const DOOR = { x: 1080, y: 300, w: 300, h: 640 };
export const PAD = { x: 1440, y: 560 };

/** The landing: a pale wall, the flat's teal door (swung open by `open` 0..1 on the warm kitchen light), the keypad
 *  beside it. You stand at it; when the door is open your flatmate is in the doorway with toast. */
export const LandingScene: React.FC<{ frame: number; cam: Camera; mood: MoodName; open: number; you: { pose?: Pose; face: Face; press?: number }; mate?: { x: number; face: Face; talk: boolean } }> = ({
  frame, cam, mood, open, you, mate,
}) => {
  const yb: Body = { x: 1580, y: FLOOR, scale: 1.15, facing: -1, pose: STAND };
  const press = you.press ?? 0;
  const pose: Pose = you.pose ?? { ...STAND, armF: press > 0 ? aimArm(yb, { x: PAD.x + 30 - press * 8, y: PAD.y + 10 }) : [20, 30], armB: [-6, 10] };
  const look = setLook([{ x: DOOR.x + DOOR.w / 2, y: DOOR.y + DOOR.h / 2, r: 420, color: "#ffe2a6", strength: 0.5 * open, moods: ["morning", "day", "night", "lamp", "dusk", "frozen"] }], mood, cam);
  return (
    <LookContext.Provider value={look}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={
          <g>
            <rect x={-1400} y={-900} width={4700} height={2900} fill="#cfd6d0" />
            <rect x={-1400} y={FLOOR - 80} width={4700} height={900} fill="#8d8a80" />
            <rect x={-1400} y={FLOOR - 86} width={4700} height={10} fill="#6d6a62" />
            <rect x={DOOR.x - 24} y={DOOR.y - 24} width={DOOR.w + 48} height={DOOR.h + 24} fill="#e9e1cf" stroke={INK} strokeWidth={6} />
            {/* the doorway: the kitchen's warm light behind */}
            <rect x={DOOR.x} y={DOOR.y} width={DOOR.w} height={DOOR.h} fill="#ffe2a6" />
            <rect x={DOOR.x} y={DOOR.y + DOOR.h - 60} width={DOOR.w} height={60} fill="#e8c28a" />
            <rect x={PAD.x - 50} y={PAD.y - 80} width={100} height={150} rx={10} fill="#3b3e47" stroke={INK} strokeWidth={5} />
            {Array.from({ length: 12 }, (_, i) => <rect key={i} x={PAD.x - 36 + (i % 3) * 26} y={PAD.y - 66 + Math.floor(i / 3) * 32} width={20} height={24} rx={4} fill="#cfd3e6" />)}
            <rect x={300} y={240} width={360} height={240} rx={8} fill="#b9c4cf" stroke={INK} strokeWidth={5} />
          </g>
        }
        actors={
          <>
            {mate && <Person who="mate" b={{ x: mate.x, y: FLOOR - 40, scale: 1.12, facing: 1, pose: { ...STAND, armF: mate.talk ? [60 + Math.sin(frame / 6) * 10, 60] : [40, 70], armB: [10, 30] } }}
              face={mate.face} frame={frame} seed={5}
              held={<g transform="translate(0 -10)"><rect x={-24} y={-30} width={48} height={40} rx={12} fill="#d9a35a" stroke={INK} strokeWidth={4} /></g>} />}
            {/* the door leaf, swinging in: narrower as it opens */}
            <rect x={DOOR.x} y={DOOR.y} width={DOOR.w * (1 - open * 0.85)} height={DOOR.h} fill="#1d9a8f" stroke={INK} strokeWidth={6} />
            {open < 0.5 && <circle cx={DOOR.x + DOOR.w * (1 - open * 0.85) - 34} cy={DOOR.y + DOOR.h / 2} r={12} fill={INK} />}
            <Person who="you" b={{ ...yb, pose }} face={you.face} frame={frame} />
          </>
        } />
    </LookContext.Provider>
  );
};

/** A keypad: twelve blank keys; the keys in `lit` glow (a code, as a pattern of keys, never digits). */
const Keypad: React.FC<{ x: number; y: number; s: number; lit: number[]; frameColor?: string; opacity?: number }> = ({ x, y, s, lit, frameColor = "#3b3e47", opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <rect x={-170} y={-230} width={340} height={460} rx={30} fill={frameColor} stroke={INK} strokeWidth={8} />
    {Array.from({ length: 12 }, (_, i) => (
      <rect key={i} x={-130 + (i % 3) * 90} y={-190 + Math.floor(i / 3) * 100} width={80} height={80} rx={14} fill={lit.includes(i) ? "#ffd27a" : "#cfd3e6"} stroke={INK} strokeWidth={5} />
    ))}
  </g>
);

/** Over the shoulder at the keypad: your finger hovers, presses, stops; behind it, the keypads of other doors (the
 *  inside town's, in their house colours) flash their own codes. */
export const KeypadInsert: React.FC<{ frame: number; from: number }> = ({ frame, from }) => {
  const t = frame - from;
  const presses = [12, 34, 60, 90];
  const pressing = presses.some((p) => t >= p && t < p + 6);
  const target = [4, 7, 1, 5][Math.min(3, presses.filter((p) => t >= p).length)];
  const tx = -130 + (target % 3) * 90 + 40;
  const ty = -190 + Math.floor(target / 3) * 100 + 40;
  const ghosts = [
    { x: 380, y: 330, c: "#e8b98a" }, { x: 1560, y: 300, c: "#d79c7a" }, { x: 330, y: 820, c: "#c9b07a" }, { x: 1620, y: 800, c: "#b7a58f" },
  ];
  return (
    <g>
      <rect width={1920} height={1080} fill="#cfd6d0" />
      {ghosts.map((g, i) => {
        const on = Math.floor((t + i * 7) / 10) % 3 !== 0;
        const lit = [0, 1, 2, 3].map((k) => Math.floor(noise(i * 31 + k * 7 + Math.floor((t + i * 5) / 10)) * 12));
        return <Keypad key={i} x={g.x} y={g.y} s={0.55} lit={on ? lit : []} frameColor={g.c} opacity={on ? 0.75 : 0.35} />;
      })}
      <Keypad x={960} y={560} s={1.05} lit={pressing ? [target] : []} />
      <BigHand from={{ x: 1500, y: 1250 }} x={960 + tx * 1.05 + 30} y={560 + ty * 1.05 + (pressing ? 70 : 120)} r={60} point />
      {/* your shoulder and head, soft, at the near right */}
      <circle cx={1760} cy={1080} r={300} fill="#3b3e47" opacity={0.9} />
    </g>
  );
};

/** The street at midnight (kit `street`): a queue down the near pavement to the hotel's door (warm light, a strip of
 *  crimson counter tiles over it, no lettering); the old sleeper first in line. */
export const QueueStreet: React.FC<{ frame: number; cam: Camera }> = ({ frame, cam }) => {
  const options = { ...street.defaults, crowd: false, bus: null, auto: false, red: true };
  const props = { cam, mood: "night" as const, frame, options };
  const y = 1000;
  return (
    <LookContext.Provider value={setLook([...street.lights(options), { x: 1820, y: 700, r: 360, color: "#ffd99a", strength: 0.5, moods: ["night"] }], "night", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={street.Back(props)}
        actors={
          <>
            <rect x={1740} y={440} width={240} height={y - 440} fill="#ffe2a6" stroke={INK} strokeWidth={8} />
            <rect x={1730} y={360} width={260} height={70} rx={8} fill={INK} />
            {[0, 1, 2].map((k) => <rect key={k} x={1780 + k * 56} y={372} width={46} height={46} rx={5} fill={CRIMSON} stroke={PAPER} strokeWidth={3} />)}
            {Array.from({ length: 14 }, (_, i) => {
              const x = 1620 - i * 135;
              const old = i === 0;
              const shuffle = Math.sin(frame / 25 + i) * 2;
              return old
                ? <Person key={i} who="old" b={{ x, y, scale: 1.05, facing: 1, pose: { ...STAND, lean: 6, armF: [20, 40], armB: [10, 30] } }}
                    face={{ brows: "flat", lids: 0.85, mouth: "flat", look: { x: 0.8, y: 0.1 } }} frame={frame} seed={8} />
                : <Person key={i} who={{ head: PASTELS[i % PASTELS.length], coat: noise(i) > 0.5 ? "#4a4f5c" : undefined }}
                    b={{ x: x + shuffle, y, scale: 1.0 + noise(i + 3) * 0.08, facing: 1, pose: i % 4 === 3 ? walkPose(0.6) : { ...STAND, armF: [10 + noise(i) * 20, 20] } }}
                    face={{ brows: "none", lids: 0.3 + noise(i + 5) * 0.3, mouth: noise(i + 2) > 0.6 ? "smile" : "flat", look: { x: 0.7, y: 0 } }} frame={frame} seed={i} />;
            })}
            <ellipse cx={mix(900, 1100, 0.5)} cy={y + 10} rx={1500} ry={14} fill="#000" opacity={0.15} />
          </>
        } />
    </LookContext.Provider>
  );
};
