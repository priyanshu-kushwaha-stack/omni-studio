import { Audio, Sequence, staticFile } from "remotion";
import type { Clip } from "@whatif/kit/timeline";
import { dir, joints, LIMB, reach, type Pose } from "@whatif/kit/rig/pose";
import { toScreen, type Camera } from "@whatif/kit/stage/Stage";
import type { Pause } from "@whatif/kit/world/clock";
import { lineEnd } from "../shared";

/** Beat 2's four time-stops, each from its snap cue to where colour comes back (scene_plan.md, Beat 2). */
export const firstDaysPauses = (cues: Record<string, number>, clips: Clip[]) => ({
  /** "Not today." until just after "crack", when the phone is in your hand. */
  phone: { from: cues.snap2, to: cues.crack + 8 } as Pause,
  /** "Vanish." until about a second after the line ends. */
  boss: { from: cues.vanish, to: lineEnd(clips, 16) + 24 } as Pause,
  /** A short stop on "saint": swap the samosa for a napkin. */
  samosa: { from: cues.swap, to: cues.swap + 50 } as Pause,
  /** The chappal hangs until just after "aside". */
  chappal: { from: cues.chappal, to: cues.step + 12 } as Pause,
});

export type FirstDaysPauses = ReturnType<typeof firstDaysPauses>;

/** World positions of a figure's head, hands and shoulder (Figure draws translate, then scale(scale*facing, scale)). */
export function body(x: number, y: number, pose: Pose, facing: 1 | -1 = 1, scale = 1) {
  const j = joints(pose);
  const hand = (from: { x: number; y: number }, [u, f]: [number, number]) => {
    const a = dir(u);
    const b = dir(u + f);
    return { x: from.x + (a.x + b.x) * LIMB, y: from.y + (a.y + b.y) * LIMB };
  };
  const w = (p: { x: number; y: number }) => ({ x: x + p.x * scale * facing, y: y + p.y * scale });
  return { head: w(j.head), handF: w(hand(j.shoulder, pose.armF)), handB: w(hand(j.shoulder, pose.armB)), shoulder: w(j.shoulder) };
}

/** Arm angles that put a figure's hand on a world point. */
export function armTo(x: number, y: number, pose: Pose, facing: 1 | -1, scale: number, tx: number, ty: number): [number, number] {
  const sh = joints(pose).shoulder;
  return reach(((tx - x) * facing) / scale - sh.x, (ty - y) / scale - sh.y);
}

export const blendArm = (a: [number, number], b: [number, number], k: number): [number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

/** Screen position of a point drawn in a Layer of the given depth. */
export const onLayer = (cam: Camera, x: number, y: number, depth: number) =>
  toScreen(cam, x + cam.x * (1 - depth), y + cam.y * (1 - depth));

/** A short sound effect at a frame, kept inside [at, until). */
export const Sfx: React.FC<{ at: number; name: string; volume?: number; until?: number }> = ({ at, name, volume = 0.4, until }) => (
  <Sequence from={at} durationInFrames={until !== undefined ? Math.max(1, until - at) : 60}>
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

/** The crouch used to pick something off the floor. */
export const CROUCH: Pose = { lean: 28, tilt: 6, armB: [20, 30], armF: [40, 30], legB: [62, -110], legF: [82, -100], drop: 44 };
