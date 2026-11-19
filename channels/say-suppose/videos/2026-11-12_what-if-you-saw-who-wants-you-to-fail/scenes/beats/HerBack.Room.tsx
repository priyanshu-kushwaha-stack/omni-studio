// Her Back's additions to the flat (outside review of v4.1, 4:16-4:58), world coordinates for the actors' slot: her
// work vest on its hook by the hall doorway before she takes it, the window full of the academy's lights (night), and
// your school bag at your feet, which you grab at the end of the beat.
import { Backpack } from "@whatif/kit/sets";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { INK } from "@whatif/kit/theme";
import { HOME } from "../sets/Home";
import { JIYOON, mix, ramp } from "../shared";
import { aimArm, handAt, type Body } from "./HerBack.Sister";

/** The hook on the wall between the clock and the hall doorway. */
export const HOOK = { x: 1640, y: 462 } as const;

/** Her orange warehouse vest hanging flat from its hook (`on` false: the hook alone, she has taken it). */
export const VestOnHook: React.FC<{ on: boolean }> = ({ on }) => {
  const { x, y } = HOOK;
  return (
    <g>
      {on && (
        <g>
          <path d={`M${x} ${y + 4} L${x - 36} ${y + 26} L${x - 42} ${y + 176} L${x + 42} ${y + 176} L${x + 36} ${y + 26}Z`} fill={JIYOON.vest} stroke={INK}
            strokeWidth={4} strokeLinejoin="round" />
          <path d={`M${x - 16} ${y + 24} L${x} ${y + 62} L${x + 16} ${y + 24}`} fill="#d9c7a6" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          <line x1={x - 40} y1={y + 120} x2={x + 40} y2={y + 120} stroke="#f4efe2" strokeWidth={9} />
          <line x1={x - 22} y1={y + 66} x2={x - 24} y2={y + 172} stroke="#f4efe2" strokeWidth={7} />
          <line x1={x + 22} y1={y + 66} x2={x + 24} y2={y + 172} stroke="#f4efe2" strokeWidth={7} />
        </g>
      )}
      <circle cx={x} cy={y} r={7} fill="#8a7a68" stroke={INK} strokeWidth={3} />
    </g>
  );
};

/** The window at night full of the academy street's lights: a dark block of lit classroom windows and neon signs.
 *  A few windows go on or off now and then (whole states, not a boil). Drawn over the set's window glass. */
export const AcademyWindow: React.FC<{ frame: number }> = ({ frame }) => {
  const w = HOME.window;
  const i = 14;
  const x0 = w.x + i, y0 = w.y + i, ww = w.w - i * 2, hh = w.h - i * 2;
  const step = Math.floor(frame / 45);
  return (
    <g>
      <clipPath id="herback-window"><rect x={x0} y={y0} width={ww} height={hh} /></clipPath>
      <g clipPath="url(#herback-window)">
        <rect x={x0} y={y0} width={ww} height={hh} fill="#1d2340" />
        <rect x={x0 + 10} y={y0 + 40} width={120} height={hh} fill="#2a3155" />
        <rect x={x0 + 120} y={y0 + 70} width={110} height={hh} fill="#262c4d" />
        {Array.from({ length: 24 }, (_, n) => {
          const c = n % 4, r = Math.floor(n / 4);
          const lit = (n * 7 + (n % 5 === 0 ? step : 0)) % 6 !== 0;
          return <rect key={n} x={x0 + 22 + c * 26 + (r % 2) * 100} y={y0 + 60 + r * 22} width={16} height={12} fill={lit ? "#ffd98a" : "#3a4166"} />;
        })}
        <rect x={x0 + 18} y={y0 + 18} width={96} height={14} rx={4} fill="#ff6f91" opacity={0.9} />
        <rect x={x0 + 126} y={y0 + 44} width={70} height={12} rx={4} fill="#2fd3c3" opacity={step % 3 === 1 ? 0.5 : 0.95} />
        <rect x={x0} y={y0 + hh - 26} width={ww} height={26} fill="#151a30" />
      </g>
    </g>
  );
};

/** Where your bag stands, at your feet (the kitchen spot), and its scale. */
export const BAG = { x: HOME.spots.kitchen.x - 78, y: HOME.floor, scale: 0.5 } as const;

/**
 * You at the end of the beat, turned toward the window and the front door (facing -1): set, then you bend and your back
 * hand takes the bag's handle, then you straighten with it, and the cut comes on the lift. Returns your body and the
 * bag's position (null while it still stands on the floor).
 */
export function grabBag(frame: number, at: number, scale: number): { body: Body; bag: { x: number; y: number } | null } {
  const bend = ramp(frame, at + 30, at + 52);
  const lift = ramp(frame, at + 58, at + 104);
  const body: Body = { x: HOME.spots.kitchen.x, y: HOME.floor, scale, facing: -1, pose: STAND };
  const lean = 40 * bend * (1 - lift);
  const pose: Pose = { ...STAND, lean, drop: 20 * bend * (1 - lift) };
  body.pose = pose;
  const handle = { x: BAG.x, y: BAG.y - 152 * BAG.scale };
  const down = aimArm(body, handle);
  const up = aimArm(body, { x: BAG.x - 30, y: HOME.floor - 175 * scale });
  const armB: [number, number] = bend < 1 ? [mix(STAND.armB[0], down[0], bend), mix(STAND.armB[1], down[1], bend)]
    : [mix(down[0], up[0], lift), mix(down[1], up[1], lift)];
  body.pose = { ...pose, armB, armF: [24, 40] };
  const held = bend >= 1 && frame >= at + 54;
  const hand = handAt(body, "back");
  return { body, bag: held ? { x: hand.x, y: hand.y + 152 * BAG.scale } : null };
}

/** The bag, standing at your feet or hanging from your hand. */
export const Bag: React.FC<{ at: { x: number; y: number } | null }> = ({ at }) => (
  <Backpack x={at?.x ?? BAG.x} y={at?.y ?? BAG.y} scale={BAG.scale} color="#3d6fb0" />
);
