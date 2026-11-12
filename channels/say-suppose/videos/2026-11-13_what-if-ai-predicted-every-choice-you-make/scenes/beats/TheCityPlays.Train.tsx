// The morning train, the film's key picture (script.md, line 41, the 3 s hold and line 42). The camera starts on your
// card, LOOKS AT PHONE 99%, over your face lit from below by the screen, then pulls back down the coach: forty pale
// heads, forty identical cards on forty threads from forty teal ceiling lamps, every face down at a phone, a sunrise
// over the towers sliding past the panes and no face turned to it. The fare board over the end doors ticks down with
// each wave of ticks, 2.10, 2.00, 1.90; on the hold all forty tick together and it flaps to 1.80. On line 42 the
// camera travels down the aisle to the far end: the stranger in a long coat, crimson head, no phone, facing the doors.
import { Figure } from "@whatif/kit/rig/Figure";
import { seatedY, SEATED, STAND } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { handAt, headAt, type Body } from "../kit";
import { RateBoard, Tag, TealLamp, type BoardKey, type TagKey } from "../device";
import { blinking, HERO, STRANGER } from "../shared";
import { COACH, CoachBack, CoachEnd, coachLights, coachProj, FARE_AT, K, lampOver, PASSENGERS, VP, YOU_SEAT, type Passenger } from "../sets/ForecastCoach";
import { glide, LitPhone, Shot } from "./TheCityPlays.Parts";

export interface TrainTimes { train: number; pull: number; pulled: number; wave1: number; wave2: number; together: number; push: number; end: number }

const LOOKS = "LOOKS AT PHONE";

/** Every card's keys: already hanging when the shot opens, a ripple of ticks spreading from you on each wave (by
 *  distance), all forty together on the hold. */
export function coachCardKeys(t: TrainTimes, p: Passenger): TagKey[] {
  const you = PASSENGERS[YOU_SEAT];
  const d = Math.hypot((p.X - you.X) / 900, p.z - you.z);
  const ripple = Math.round(d * 7);
  return [
    { at: t.train - 60, text: LOOKS, pct: 99, state: "tick" },
    { at: t.wave1 + ripple, text: LOOKS, pct: 99, state: "tick" },
    { at: t.wave2 + ripple, text: LOOKS, pct: 99, state: "tick" },
    { at: t.together, text: LOOKS, pct: 99, state: "tick" },
  ];
}

/** The sounds of the waves (one card's worth each, a little louder: forty soft ticks heard as one). */
export const coachSoundKeys = (t: TrainTimes): TagKey[] => [
  { at: t.wave1, text: LOOKS, pct: 99, state: "tick" },
  { at: t.wave2, text: LOOKS, pct: 99, state: "tick" },
  { at: t.together, text: LOOKS, pct: 99, state: "tick" },
];

export const fareKeys = (t: TrainTimes): BoardKey[] => [
  { at: t.train - 60, value: "2.10" },
  { at: t.wave1 + 14, value: "2.00" },
  { at: t.wave2 + 14, value: "1.90" },
  { at: t.together + 14, value: "1.80" },
];

/** A passenger's body: seated on the bench or standing in the aisle with the back hand up on the rail. */
function bodyOf(p: Passenger): Body {
  const at = coachProj(p.X, p.sit ? COACH.bench : 0, p.z);
  const scale = K * at.s;
  if (p.sit) return { x: at.x, y: seatedY(at.y, scale), scale, facing: p.facing, pose: { ...SEATED, armF: [48, 74], armB: [12, 30] } };
  return { x: at.x, y: at.y, scale, facing: p.facing, pose: { ...STAND, armF: [42, 86], armB: [166 + (p.i % 3) * 4, 10] } };
}

/** One passenger: the figure head down at a lit phone, the teal lamp over them and their card on its thread. */
const Rider: React.FC<{ p: Passenger; frame: number; t: TrainTimes; you: boolean }> = ({ p, frame, t, you }) => {
  const b = bodyOf(p);
  const h = headAt(b.x, b.y, b.scale, b.pose, b.facing);
  const lamp = lampOver(p);
  const grip = handAt(b, "back");
  const rail = coachProj(p.X, COACH.ceiling - 150, p.z);
  const face = you
    ? { brows: "flat" as const, lids: 0.42, mouth: "flat" as const, eyes: 1, look: { x: 0.55, y: 0.85 } }
    : { brows: "none" as const, lids: 0.38 + (p.i % 3) * 0.06, mouth: "flat" as const, eyes: 1, look: { x: 0.5, y: 0.85 } };
  return (
    <g>
      {!p.sit && <line x1={grip.x} y1={grip.y} x2={grip.x} y2={rail.y} stroke="#8a929e" strokeWidth={Math.max(2, 5 * b.scale)} />}
      {!p.sit && <circle cx={grip.x} cy={grip.y - 6 * b.scale} r={12 * b.scale} fill="none" stroke="#5c6675" strokeWidth={Math.max(2, 4 * b.scale)} />}
      <TealLamp frame={frame} x={lamp.x} y={lamp.y} size={Math.max(4, 26 * lamp.s)} dim={0.55} />
      <Figure x={b.x} y={b.y} scale={b.scale} facing={b.facing} pose={b.pose} head={you ? HERO.head : p.head} coat={you ? "#3b3e47" : p.coat}
        scarf={you ? HERO.scarf : undefined} tuft={you} {...face} blink={blinking(frame, p.i)} time={frame} held={<LitPhone />} />
      {/* the screen's light on the face, from below */}
      <ellipse cx={h.x + b.facing * h.r * 0.15} cy={h.y + h.r * 0.55} rx={h.r * 0.9} ry={h.r * 0.5} fill="#d6eef7" opacity={you ? 0.22 : 0.12} />
      <Tag frame={frame} x={h.x} headY={h.y} r={h.r} keys={coachCardKeys(t, p)} threadTop={lamp.y} tilt={-2 + (p.i % 5) - 2} />
    </g>
  );
};

/** The stranger at the far end, seen from behind, facing the end doors: a crimson head, a long coat, no phone. */
const StrangerBack: React.FC<{ frame: number }> = ({ frame }) => {
  const z = COACH.end - 0.35;
  const f = coachProj(0, 0, z);
  const s = K * f.s;
  const sway = Math.sin(frame / 40) * 1.2 * s;
  const headY = f.y - 262 * s;
  return (
    <g>
      <line x1={f.x - 14 * s} y1={f.y} x2={f.x - 12 * s} y2={f.y - 80 * s} stroke={INK} strokeWidth={12 * s} strokeLinecap="round" />
      <line x1={f.x + 14 * s} y1={f.y} x2={f.x + 12 * s} y2={f.y - 80 * s} stroke={INK} strokeWidth={12 * s} strokeLinecap="round" />
      <path d={`M${f.x - 26 * s} ${headY + 50 * s} L${f.x + 26 * s} ${headY + 50 * s} L${f.x + 44 * s} ${f.y - 40 * s} L${f.x - 44 * s} ${f.y - 40 * s}Z`}
        fill={STRANGER.coat} stroke={INK} strokeWidth={5 * s} strokeLinejoin="round" />
      <line x1={f.x - 30 * s} y1={headY + 62 * s} x2={f.x - 40 * s} y2={headY + 170 * s} stroke={STRANGER.coat} strokeWidth={14 * s} strokeLinecap="round" />
      <line x1={f.x + 30 * s} y1={headY + 62 * s} x2={f.x + 40 * s} y2={headY + 170 * s} stroke={STRANGER.coat} strokeWidth={14 * s} strokeLinecap="round" />
      <circle cx={f.x + sway} cy={headY} r={46 * s} fill={STRANGER.head} stroke={INK} strokeWidth={4 * s} />
      <path d={`M${f.x - 40 * s} ${headY + 22 * s} A${46 * s} ${46 * s} 0 0 0 ${f.x + 40 * s} ${headY + 22 * s}`} fill="#000" opacity={0.12} />
    </g>
  );
};

/** The whole shot from the train's first frame to the beat's end. */
export const TrainShot: React.FC<{ frame: number; t: TrainTimes }> = ({ frame, t }) => {
  const you = PASSENGERS[YOU_SEAT];
  const yb = bodyOf(you);
  const yh = headAt(yb.x, yb.y, yb.scale, yb.pose, yb.facing);
  // close: your card over your face, lit from below
  const close: Camera = { x: yh.x + 40, y: yh.y - yh.r * 1.5, zoom: 2.15 };
  const wide: Camera = { x: VP.x, y: 520, zoom: 1.0 };
  const hold: Camera = { x: VP.x + 40, y: 515, zoom: 1.06 };
  const far: Camera = { x: VP.x, y: VP.y + 20, zoom: 2.4 };
  let cam: Camera;
  if (frame < t.pulled) cam = glide(frame, t.pull, t.pulled, close, wide);
  else if (frame < t.push) cam = glide(frame, t.pulled, t.push, wide, hold);
  else cam = glide(frame, t.push + 4, t.end - 6, hold, far);
  cam = drift(cam, frame, "coach", frame < t.pulled ? 1.5 : 4);
  const actors = (
    <>
      <CoachEnd />
      <StrangerBack frame={frame} />
      {PASSENGERS.map((p, i) => <Rider key={i} p={p} frame={frame} t={t} you={i === YOU_SEAT} />)}
      {/* the fare board over the end doors, drawn last so the far cards never hide it */}
      <RateBoard frame={frame} x={FARE_AT.x} y={FARE_AT.y} size={FARE_AT.size} label="FARE" keys={fareKeys(t)} />
    </>
  );
  return <Shot cam={cam} mood="morning" lights={coachLights} back={<CoachBack frame={frame} mood="morning" />} actors={actors} />;
};
