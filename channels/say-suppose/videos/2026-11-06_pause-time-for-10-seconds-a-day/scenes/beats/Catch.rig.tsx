import { LookContext, useLook, type Look } from "@whatif/kit/stage/Look";
import { dir, joints, LIMB, SIT, type Pose } from "@whatif/kit/rig/pose";
import { MUSTARD } from "@whatif/kit/theme";

/** Lying in bed or on the floor (the sample bedroom's pose). */
export const LYING: Pose = { ...SIT, armB: [5, 4], armF: [8, 6], legB: [0, -2], legF: [0, -2] };
/** Sitting on the edge of a bed, sunk in a little: draw the figure with y about 8 below the floor. */
export const SEAT: Pose = { lean: -4, tilt: 0, armB: [20, 30], armF: [28, 40], legB: [28, -28], legF: [35, -35], drop: 0 };
/** Down on one knee. The figure's y is the floor. */
export const KNEEL: Pose = { lean: 12, tilt: 6, armB: [30, 40], armF: [70, 30], legB: [-6, -84], legF: [88, -88], drop: 56 };

/** The world position of a figure's front hand, for a Figure drawn with these props. */
export function handWorld(x: number, y: number, pose: Pose, scale = 1, facing: 1 | -1 = 1, rotate = 0) {
  const j = joints(pose);
  const a = dir(pose.armF[0]);
  const b = dir(pose.armF[0] + pose.armF[1]);
  const hx = (j.shoulder.x + (a.x + b.x) * LIMB) * scale * facing;
  const hy = (j.shoulder.y + (a.y + b.y) * LIMB) * scale;
  const py = j.hip.y * scale;
  const r = (rotate * Math.PI) / 180;
  const dy = hy - py;
  return { x: x + hx * Math.cos(r) - dy * Math.sin(r), y: y + py + hx * Math.sin(r) + dy * Math.cos(r) };
}

/** The world position of a figure's head centre. */
export function headWorld(x: number, y: number, pose: Pose, scale = 1, facing: 1 | -1 = 1, rotate = 0) {
  const j = joints(pose);
  const hx = j.head.x * scale * facing;
  const py = j.hip.y * scale;
  const dy = j.head.y * scale - py;
  const r = (rotate * Math.PI) / 180;
  return { x: x + hx * Math.cos(r) - dy * Math.sin(r), y: y + py + hx * Math.sin(r) + dy * Math.cos(r) };
}

/** Fingers for a Figure's `held` slot, so close shots read as a hand. `angle` is the forearm's direction in rig
 *  degrees (0 down, 90 forward, 180 up); `twitch` 0..1 flexes them; `snap` brings thumb and middle together. */
export const Fingers: React.FC<{ angle: number; color?: string; twitch?: number; snap?: number; curl?: number }> = ({
  angle, color = MUSTARD, twitch = 0, snap = 0, curl = 0,
}) => {
  const fingers = [-30, -10, 10, 30].map((spread, i) => {
    const flex = Math.sin(twitch * 6.3 + i * 1.9) * 12 * twitch;
    const a = angle + spread * (1 - snap * 0.6) + flex;
    const len = (17 - (i === 1 ? snap * 10 : 0)) * (1 - curl * 0.6);
    const d = dir(a);
    return <line key={i} x1={0} y1={0} x2={d.x * len} y2={d.y * len} stroke={color} strokeWidth={7} strokeLinecap="round" />;
  });
  const thumb = dir(angle - 70 + snap * 45);
  return (
    <g>
      {fingers}
      <line x1={0} y1={0} x2={thumb.x * 13} y2={thumb.y * 13} stroke={color} strokeWidth={8} strokeLinecap="round" />
      <circle r={12} fill={color} />
    </g>
  );
};

/** Adds scene light (glows, a different focus, a heavier vignette) to the mood Film gives. */
export const Lit: React.FC<{ extra: Partial<Look>; children: React.ReactNode }> = ({ extra, children }) => {
  const base = useLook();
  return (
    <LookContext.Provider value={{ ...base, ...extra, glows: [...(base.glows ?? []), ...(extra.glows ?? [])] }}>
      {children}
    </LookContext.Provider>
  );
};
