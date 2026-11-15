// The key shot after the juggle (v7): sets/KeyShot.tsx at REF with you drawn here instead, so you can catch the three
// coils in one hand (and toss them back up into the cascade). `catchP` 0 is the cascade (KeyShot's own juggle), 1 all
// three coils hanging from your front hand. Shared by Tell Me Tomorrow (the catch) and The Rule (the closes, the
// "learning to juggle" toss). Also your flatmate's exaggerated jaw for close-ups (a mouth drawn over a Figure).
import { Figure } from "@whatif/kit/rig/Figure";
import type { Brows, Mouth } from "@whatif/kit/rig/Figure";
import { joints, lerpPose, SEATED, type Pose } from "@whatif/kit/rig/pose";
import { INK } from "@whatif/kit/theme";
import { Coil, JUGGLE_POSE, KEY_HERO, KeyShot } from "../sets/KeyShot";
import { HERO, mix } from "../shared";
import { aimArm, Coil as SmallCoil, type Body } from "./TellMeTomorrow.Kit";

const heroBody = (pose: Pose): Body => ({ x: KEY_HERO.x, y: KEY_HERO.y, scale: KEY_HERO.scale, facing: 1, pose });
const BASE: Pose = { ...SEATED, lean: 2, tilt: 4, armB: [12, 40], armF: [25, 35] };
/** Where your front hand holds the three coils after the catch (REF). */
export const CATCH_AT = { x: 930, y: 610 };
/** The catch: the front hand up at chest height, the back hand dropped to your knee. */
export const CATCH_POSE: Pose = { ...BASE, armF: aimArm(heroBody(BASE), CATCH_AT) };

/** The cascade's coil positions at this frame (the same arc KeyShot's Cascade runs). */
function cascadeAt(frame: number) {
  const at = (p: number) => {
    if (p < 0.7) { const t = p / 0.7; return { x: 770 + 275 * t, y: 660 - 520 * t * (1 - t) - 30 * t, turn: -20 + 60 * t }; }
    const t = (p - 0.7) / 0.3; return { x: 1045 - 275 * t, y: 630 + 30 * t - 40 * Math.sin(Math.PI * t), turn: 40 - 60 * t };
  };
  return [0, 1, 2].map((k) => at(((frame / 36) + k / 3) % 1));
}
/** The three coils hanging from the hand, a little fanned. */
const HANG = [{ dx: -30, dy: 70, turn: -70 }, { dx: 0, dy: 82, turn: -90 }, { dx: 30, dy: 70, turn: -110 }];

export interface KeyCatchProps {
  frame: number;
  /** 0 juggling, 1 caught in one hand. */
  catchP: number;
  door?: number;
  frozen?: boolean;
  stun?: number;
  mopDrop?: number;
  mateMouth?: Mouth;
  mateBrows?: Brows;
  lids?: number;
  brows?: Brows;
  mouth?: Mouth;
  look?: { x: number; y: number };
  /** Your head tilt (chin up when negative). */
  tilt?: number;
  blink?: boolean;
}

/** The key shot's world (REF), you juggling or holding the coils. Put it in a Stage `actors` slot. */
export const KeyCatch: React.FC<KeyCatchProps> = ({
  frame, catchP, door = 1, frozen = false, stun = 0, mopDrop = 0, mateMouth = "open", mateBrows = "raised",
  lids = 0.62, brows = "flat", mouth = "smirk", look = { x: 0.95, y: 0.05 }, tilt, blink,
}) => {
  const c = Math.max(0, Math.min(1, catchP));
  if (c <= 0) {
    return (
      <KeyShot frame={frame} door={door} you={door > 0.55} juggle frozenCoils={frozen} stun={stun} mopDrop={mopDrop}
        counter={{ value: "365" }} lids={lids} brows={brows} mouth={mouth} look={look} mateMouth={mateMouth} mateBrows={mateBrows} blink={blink} />
    );
  }
  const pose0 = lerpPose(JUGGLE_POSE, CATCH_POSE, c);
  const pose = tilt === undefined ? pose0 : { ...pose0, tilt };
  const hand = { x: mix(887, CATCH_AT.x, c), y: mix(689, CATCH_AT.y, c) };
  const air = cascadeAt(frame);
  const coils = air.map((a, i) => ({
    x: mix(a.x, CATCH_AT.x + HANG[i].dx, c), y: mix(a.y, CATCH_AT.y + HANG[i].dy, c), turn: mix(a.turn, HANG[i].turn, c),
  }));
  return (
    <g>
      <KeyShot frame={frame} door={door} you={false} stun={stun} mopDrop={mopDrop} counter={{ value: "365" }}
        mateMouth={mateMouth} mateBrows={mateBrows} blink={blink} />
      <circle cx={KEY_HERO.x + 46} cy={560} r={198 * 1.6} fill="#000" opacity={0.35} />
      <Figure x={KEY_HERO.x} y={KEY_HERO.y} scale={KEY_HERO.scale} pose={pose} head={HERO.head} scarf={HERO.scarf} tuft
        flow={0.05} time={frame / 30} brows={brows} lids={lids} mouth={mouth} eyes={0.9} look={look} blink={blink} />
      {coils.map((k, i) => <Coil key={i} x={k.x} y={k.y} r={i === 1 ? 84 : 78} turn={k.turn} />)}
      {/* your fingers closed over the coils */}
      {c > 0.8 && <circle cx={hand.x} cy={hand.y} r={40} fill={HERO.head} stroke={INK} strokeWidth={6} />}
    </g>
  );
};

/**
 * A jaw drawn over a Figure whose own mouth is "none": the kit's open mouth, its bottom lip `drop` px (head units)
 * lower, so it can hang past the chin for a gag. Pass the figure's own x, y, scale, facing and pose.
 */
export const Jaw: React.FC<{ x: number; y: number; scale: number; facing: 1 | -1; pose: Pose; drop: number }> = ({ x, y, scale, facing, pose, drop }) => {
  const j = joints(pose);
  const b = 36 + drop;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale}) translate(${j.head.x} ${j.head.y}) rotate(${pose.tilt})`}>
      <path d={`M-9 14 Q7 10 25 14 Q${24 + drop * 0.1} ${b} 8 ${b} Q${-8 - drop * 0.1} ${b} -9 14Z`} fill={INK} />
      {drop > 14 && <ellipse cx={8} cy={b - 6} rx={9} ry={5} fill="#e07a8a" />}
    </g>
  );
};

/** The tangle of three coils: in the boss's hand, in the air, then in your lap. */
export const Tangle: React.FC<{ x: number; y: number; s?: number; spin?: number }> = ({ x, y, s = 0.8, spin = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${spin})`}>
    <g transform="translate(-26 4) rotate(-20)"><SmallCoil s={s} /></g>
    <g transform="translate(24 8) rotate(25)"><SmallCoil s={s} /></g>
    <g transform="translate(0 -14)"><SmallCoil s={s} /></g>
  </g>
);

