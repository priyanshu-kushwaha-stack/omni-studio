// The metro home at night (Metro view "car"), shared by "The paper" (PaperBeat.tsx) and "Back to you" (Back.tsx):
// you at the window seat with the tiffin stack on your lap and the envelope on top, the small paper memories in the
// dark window, and your reflection. World coordinates for a <Stage> slot; no sound here.
import { interpolate, spring } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND } from "@whatif/kit/rig/pose";
import { FPS, INK, PAPER } from "@whatif/kit/theme";
import { headAt } from "../parts";
import { aimArm, CHAIR_SIT, HandPhone, seatedY, type Body } from "../parts2";
import { blinking, DEV, HERO, noise } from "../shared";
import { METRO_CAR } from "../sets/Metro";
import { Tiffin } from "../sets/MothersHouse";
import { Envelope } from "./Choice.Props";

/** You on the window seat, facing down the car (left). */
export const SEAT_S = 1.1;
export const SEAT_X = METRO_CAR.seat.x;
export const SEAT_Y = seatedY(METRO_CAR.seat.y, SEAT_S);
export const seatHead = headAt(SEAT_X, SEAT_Y, SEAT_S, CHAIR_SIT, -1);
/** The tiffin's base on your lap and its lid's top. */
export const TIFFIN_S = 0.55;
export const LAP = { x: SEAT_X - 74, y: METRO_CAR.seat.y - 6 };
export const LID = { x: LAP.x, y: LAP.y - 142 * TIFFIN_S };

/** You seated with the tiffin on your lap. `phone` puts the phone in your front hand at your chest (0..1 raises it
 *  from the lap); `onLid` lays it face up on the lid instead. `face` is spread onto the Figure. */
export const SeatedYou: React.FC<{ frame: number; face: object; phone?: number; onLid?: boolean; envelope?: boolean; lit?: boolean }> = ({
  frame, face, phone = 0, onLid, envelope = true, lit = true,
}) => {
  const body: Body = { x: SEAT_X, y: SEAT_Y, scale: SEAT_S, facing: -1, pose: CHAIR_SIT };
  const breathe = Math.sin(frame / 40) * 1.2;
  const hold = { x: LAP.x - 22, y: LAP.y - 30 };
  const chest = { x: SEAT_X - 70, y: SEAT_Y - 196 * SEAT_S };
  const raised = phone > 0 && !onLid;
  body.pose = {
    ...CHAIR_SIT, tilt: 4 + breathe,
    armF: aimArm(body, raised ? { x: hold.x + (chest.x - hold.x) * phone, y: hold.y + (chest.y - hold.y) * phone } : hold),
    armB: aimArm(body, { x: LAP.x + 24, y: LAP.y - 30 }),
  };
  return (
    <g>
      <Figure {...HERO} {...body} {...face} blink={blinking(frame, 3)} time={frame} flow={0.05}
        held={raised ? <HandPhone frame={frame} lit={lit} scale={SEAT_S} /> : undefined} />
      <Tiffin x={LAP.x} y={LAP.y} scale={TIFFIN_S} />
      {envelope && <Envelope x={LID.x - 2} y={LID.y - 4} scale={0.55} tilt={-4} />}
      {onLid && (
        <g transform={`translate(${LID.x + 4} ${LID.y - 4})`}>
          <rect x={-34} y={-7} width={68} height={12} rx={4} fill="#1b1d24" />
          <rect x={-30} y={-9} width={60} height={4} rx={2} fill={lit ? "#cfe9f4" : "#3a4150"} />
        </g>
      )}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ memories in the glass

/** The four memories, small paper cards in full colour in the dark window (window 2), left to right. */
const CARD = { w: 150, h: 112 };
export const MEMORY_SPOTS = [{ x: 1150, y: 390 }, { x: 1300, y: 490 }, { x: 1450, y: 380 }, { x: 1590, y: 486 }] as const;

const Memory: React.FC<{ kind: number }> = ({ kind }) => {
  const { w, h } = CARD;
  return (
    <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill={PAPER} stroke={INK} strokeWidth={4} />
      {kind === 0 && (
        // Dev's hand flat on the seat
        <g>
          <rect x={-60} y={6} width={120} height={30} rx={8} fill="#4f82a0" stroke={INK} strokeWidth={3} />
          <ellipse cx={-4} cy={4} rx={30} ry={13} fill={DEV.head} stroke={INK} strokeWidth={3} />
          {[-24, -12, 0, 12].map((fx) => <rect key={fx} x={fx + 14} y={-6} width={24} height={9} rx={4.5} fill={DEV.head} stroke={INK} strokeWidth={2.5} />)}
          <rect x={-58} y={-2} width={34} height={14} rx={6} fill={DEV.coat} />
        </g>
      )}
      {kind === 1 && (
        // the one paper cup of chai
        <g>
          <path d="M-22 -30 L22 -30 L16 34 L-16 34 Z" fill="#fff" stroke={INK} strokeWidth={3.5} />
          <rect x={-20} y={-6} width={40} height={14} fill="#b5553a" />
          <path d="M-6 -40 q-8 -10 0 -18 M8 -40 q-8 -10 0 -18" fill="none" stroke="#9aa1ab" strokeWidth={3} strokeLinecap="round" />
        </g>
      )}
      {kind === 2 && (
        // the notebook page Dev wrote your first line on
        <g transform="rotate(-4)">
          <path d="M-46 -40 H46 V40 H-46 L-42 30 L-47 20 L-42 10 L-47 0 L-42 -10 L-47 -20 L-42 -30 Z" fill="#fffaf0" stroke={INK} strokeWidth={3} />
          {[-24, -10, 4, 18].map((y) => <line key={y} x1={-36} y1={y} x2={38} y2={y} stroke="#9fc0e0" strokeWidth={2} />)}
          <rect x={-32} y={-30} width={56} height={8} rx={4} fill={INK} />
        </g>
      )}
      {kind === 3 && (
        // the tiffin waiting at your mother's gate
        <g>
          {[-50, -30, 30, 50].map((x) => <line key={x} x1={x} y1={-44} x2={x} y2={34} stroke="#5a5f6e" strokeWidth={5} />)}
          <line x1={-60} y1={-30} x2={60} y2={-30} stroke="#5a5f6e" strokeWidth={5} />
          <rect x={-60} y={30} width={120} height={14} fill="#b8a48a" />
          <Tiffin x={0} y={30} scale={0.42} />
        </g>
      )}
    </g>
  );
};

/** The memories popping into window 2 at their frames, bobbing a little with the train; gone from `until`. */
export const Memories: React.FC<{ frame: number; at: number[]; until?: number }> = ({ frame, at, until }) => {
  const w = METRO_CAR.windows[1];
  const out = until === undefined ? 1 : 1 - interpolate(frame, [until, until + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (out <= 0) return null;
  return (
    <g opacity={out}>
      <clipPath id="memory-window"><rect x={w.x} y={w.y} width={w.w} height={w.h} rx={30} /></clipPath>
      <g clipPath="url(#memory-window)">
        {MEMORY_SPOTS.map((p, i) => {
          if (frame < at[i]) return null;
          const s = spring({ frame: frame - at[i], fps: FPS, config: { damping: 12, stiffness: 120, mass: 0.8 } });
          const bob = Math.sin(frame / 18 + i * 1.7) * 4;
          return (
            <g key={i} transform={`translate(${p.x} ${p.y + bob}) rotate(${(noise(i + 4) - 0.5) * 10}) scale(${s})`} opacity={0.94}>
              <circle r={110} fill="#ffe9a8" opacity={0.12} />
              <Memory kind={i} />
            </g>
          );
        })}
      </g>
    </g>
  );
};

/** Your reflection for MetroBack's `reflection` slot: your head and shoulders in window 2, still, nothing over it. */
export const REFLECTION = { x: 1250, y: 740 } as const;
export const Reflection: React.FC<{ frame: number; look?: { x: number; y: number } }> = ({ frame, look = { x: 0.2, y: 0.2 } }) => (
  <Figure {...HERO} x={REFLECTION.x} y={REFLECTION.y} scale={1} facing={1} pose={{ ...STAND, tilt: 3 }} brows="flat" lids={0.3} mouth="flat"
    look={look} blink={blinking(frame, 8)} time={frame} />
);
export const reflectionHead = headAt(REFLECTION.x, REFLECTION.y, 1, { ...STAND, tilt: 3 });

