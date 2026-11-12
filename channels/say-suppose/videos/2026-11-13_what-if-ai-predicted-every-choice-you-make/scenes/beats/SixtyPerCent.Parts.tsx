// Parts for builder C's four beats (Sixty Per Cent, Red, A Man in Trouble, The Dilemma): the stall at the food court
// with you, your best friend and the coffee seller (sets/FoodCourt geometry), their props (the napkin tie, the
// landlord's envelope, a cloth, a tray, coins, a phone), the half-down shutters, and a close insert of your apron
// pocket for the key going in and coming out. Everything is drawn in WORLD coordinates inside a <Stage> slot.
import { Figure } from "@whatif/kit/rig/Figure";
import type { Expression } from "@whatif/kit/rig/expressions";
import { joints, STAND, type Pose } from "@whatif/kit/rig/pose";
import { HandPhone } from "@whatif/kit/sets/props";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext, type Look as StageLook } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { aimArm, Apron, headAt, PaperCap, type Body } from "../kit";
import { RateBoard, Tag, TealLamp, type BoardKey, type TagKey } from "../device";
import { CashBox, COURT, CoffeeCounter, FoodCourtBack, foodCourtLights, Key, StallCounter, StallLamp } from "../sets/FoodCourt";
import { blinking, COFFEE, FRIEND, HERO } from "../shared";

export type Face = Partial<Expression>;
export const S: number = COURT.scale;

/** A mouth that changes while a character speaks between `from` and `to` (shapes only, never synced to the words). */
export function talk(frame: number, from: number, to: number, rest: Face["mouth"] = "flat", period = 5): Face["mouth"] {
  if (frame < from || frame >= to) return rest;
  const k = Math.floor((frame - from) / period) % 3;
  return k === 0 ? "open" : k === 1 ? "flat" : "o";
}

/** A body at a spot behind the counter (or anywhere on the court floor). */
export const body = (x: number, pose: Pose = STAND, facing: 1 | -1 = 1, y: number = COURT.floor, scale: number = S): Body => ({ x, y, scale, pose, facing });
export const youBody = (pose: Pose = STAND) => body(COURT.you.x, pose, 1);
export const friendBody = (pose: Pose = STAND) => body(COURT.friend.x, pose, -1);

/** The pose that puts a figure's front hand (and optionally the back hand) on world points. */
export function reachPose(b: Body, front?: { x: number; y: number }, back?: { x: number; y: number }): Pose {
  return { ...b.pose, ...(front ? { armF: aimArm(b, front) } : {}), ...(back ? { armB: aimArm(b, back) } : {}) };
}

// ------------------------------------------------------------------------------------------------ props

/** A paper napkin folded into a tie at a figure's collar (the landlord impression). Draw after the figure. */
export const NapkinTie: React.FC<{ b: Body; off?: number }> = ({ b, off = 0 }) => {
  if (off >= 1) return null;
  const j = joints(b.pose);
  const x = b.x + j.neck.x * b.scale * b.facing;
  const y = b.y + (j.neck.y + 6) * b.scale;
  const s = b.scale;
  return (
    <g opacity={1 - off} transform={`translate(${x + off * 40 * b.facing} ${y - off * 30})`}>
      <path d={`M${-14 * s} 0 L${14 * s} 0 L${4 * s} ${10 * s} Z`} fill={PAPER} stroke={INK} strokeWidth={3} />
      <path d={`M${-5 * s} ${9 * s} L${5 * s} ${9 * s} L${9 * s} ${58 * s} L0 ${70 * s} L${-9 * s} ${58 * s} Z`} fill={PAPER} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    </g>
  );
};

/** The landlord's envelope with its grey seal, for a hand (`held`) or the counter. */
export const Envelope: React.FC<{ x?: number; y?: number; scale?: number; tilt?: number }> = ({ x = 0, y = 0, scale = 1, tilt = -8 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <rect x={-34} y={-22} width={68} height={44} rx={3} fill="#efe6d2" stroke={INK} strokeWidth={3.5} />
    <path d="M-34 -22 L0 4 L34 -22" fill="none" stroke={INK} strokeWidth={3} />
    <circle cx={0} cy={4} r={8} fill="#8f939b" stroke={INK} strokeWidth={2.5} />
  </g>
);

/** A wiping cloth for a hand. */
export const Cloth: React.FC = () => <rect x={-16} y={-8} width={32} height={22} rx={5} fill="#d9d4c2" stroke={INK} strokeWidth={3} transform="rotate(10)" />;

/** A steel tray for a hand. */
export const Tray: React.FC<{ tilt?: number }> = ({ tilt = -12 }) => (
  <g transform={`rotate(${tilt})`}><rect x={-46} y={-6} width={92} height={12} rx={5} fill="#b9bec6" stroke={INK} strokeWidth={3} /></g>
);

/** A phone for a hand, screen lit. */
export const Phone: React.FC<{ lit?: boolean }> = ({ lit = true }) => <HandPhone lit={lit} scale={1.1} />;

/** Coins in rows on the counter (world), `n` of them, the first `shown` visible. */
export const CoinRows: React.FC<{ x: number; y: number; n: number; shown?: number }> = ({ x, y, n, shown = n }) => (
  <g>
    {Array.from({ length: Math.min(n, shown) }, (_, i) => (
      <ellipse key={i} cx={x + (i % 8) * 34} cy={y - Math.floor(i / 8) * 14} rx={15} ry={6} fill="#e8b84a" stroke={INK} strokeWidth={3} />
    ))}
  </g>
);

/** A rolling shutter: ribbed metal from above down to `bottom`, across x..x+w. */
export const Shutter: React.FC<{ x: number; w: number; top?: number; bottom: number; color?: string }> = ({ x, w, top = -300, bottom, color = "#3a4156" }) => (
  <g>
    <rect x={x} y={top} width={w} height={bottom - top} fill="#2b3142" stroke={INK} strokeWidth={6} />
    {Array.from({ length: Math.max(0, Math.floor((bottom - top) / 26)) }, (_, r) => (
      <line key={r} x1={x + 6} y1={bottom - 14 - r * 26} x2={x + w - 6} y2={bottom - 14 - r * 26} stroke={color} strokeWidth={6} />
    ))}
    <rect x={x - 4} y={bottom - 16} width={w + 8} height={18} rx={4} fill="#4a5168" stroke={INK} strokeWidth={4} />
  </g>
);

/** Stamped flap tiles (a number the narrator says), centred at (x, y). */
export const Stamp: React.FC<{ x: number; y: number; text: string; color: string; size: number; at?: number; frame?: number }> = ({ x, y, text, color, size, at, frame }) => {
  if (at !== undefined && frame !== undefined && frame < at) return null;
  return (
    <g transform={`translate(${x} ${y})`}>
      {text.split("").map((ch, i, all) => {
        const cx = (i - (all.length - 1) / 2) * size * 0.62;
        return (
          <g key={i} transform={`translate(${cx} 0)`}>
            <rect x={-size * 0.28} y={-size * 0.42} width={size * 0.56} height={size * 0.84} rx={size * 0.08} fill={color} stroke={INK} strokeWidth={4} />
            <text x={0} y={size * 0.26} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size * 0.66} fill={PAPER}>{ch}</text>
          </g>
        );
      })}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the stall scene

/** One figure in a stall shot. */
export interface Actor {
  pose?: Pose;
  face?: Face;
  held?: React.ReactNode;
  /** Something held in the BACK hand (drawn at that hand, world units). */
  back?: React.ReactNode;
  x?: number;
  facing?: 1 | -1;
  tag?: TagKey[];
  tagScale?: number;
  /** 0..1: how pale the tag reads (a pale crimson card is 0.7). */
  tagFade?: number;
  napkin?: number;
  hidden?: boolean;
}

export interface StallProps {
  frame: number;
  cam: Camera;
  /** The light (the line's mood, or an insert's own). */
  mood: MoodName;
  /** What the court behind is doing: "lamp" is closed (shutters down), "dusk"/"day"/"morning" open. */
  backMood?: MoodName;
  diners?: boolean;
  /** Our stall's own shutter behind you both, 0 up to 1 down to the counter. */
  ourShutter?: number;
  you?: Actor;
  friend?: Actor;
  /** `front` stands her on the customers' side, in front of her counter and shutter. */
  coffee?: Actor & { shutter?: number; front?: boolean };
  box?: { open?: number; full?: boolean; envelopes?: boolean; hidden?: boolean; key?: { x: number; y: number; rotate?: number } | null };
  coffeeBoard?: BoardKey[];
  pillarBoard?: { label: string; keys: BoardKey[] };
  /** Drawn in front of the counter (customers, the landlord, near tables). */
  front?: React.ReactNode;
  /** Drawn last, over everything (bubbles). */
  over?: React.ReactNode;
  look?: Partial<StageLook>;
}

const backHand = (b: Body) => {
  const j = joints(b.pose);
  const sx = b.x + j.shoulder.x * b.scale * b.facing, sy = b.y + j.shoulder.y * b.scale;
  const [u, f] = b.pose.armB;
  const r = (d: number) => (d * Math.PI) / 180;
  const L = 56 * b.scale;
  return { x: sx + (Math.sin(r(u)) + Math.sin(r(u + f))) * L * b.facing, y: sy + (Math.cos(r(u)) + Math.cos(r(u + f))) * L };
};

export const Person: React.FC<{ a: Actor; b: Body; who: { head: string; coat: string }; scarf?: boolean; frame: number; seed: number; apron?: string }> = ({ a, b, who, scarf, frame, seed, apron = "#7a5a3a" }) => {
  if (a.hidden) return null;
  const bh = a.back ? backHand(b) : null;
  return (
    <g>
      {bh && <g transform={`translate(${bh.x} ${bh.y})`}>{a.back}</g>}
      <Figure x={b.x} y={b.y} scale={b.scale} facing={b.facing} pose={b.pose} head={who.head} coat={who.coat}
        {...(scarf ? { scarf: HERO.scarf, tuft: true, flow: 0.1 } : {})} mouth="flat" {...a.face} blink={a.face?.lids === 1 ? false : blinking(frame, seed)}
        time={frame} held={a.held} />
      <Apron b={b} color={apron} />
      {a.napkin !== undefined && <NapkinTie b={b} off={a.napkin} />}
    </g>
  );
};

/** Where a stall actor's head is. */
export function headOf(a: Actor | undefined, x: number, facing: 1 | -1, y = COURT.floor) {
  return headAt(a?.x ?? x, y, S, a?.pose ?? STAND, a?.facing ?? facing);
}

/** The stall at the food court: our counter, the box and the lamp, you at the left and your best friend at the right,
 *  the coffee seller next door; tags over heads; rate boards. */
export const StallScene: React.FC<StallProps> = ({
  frame, cam, mood, backMood, diners = true, ourShutter, you, friend, coffee, box = {}, coffeeBoard, pillarBoard, front, over, look,
}) => {
  const yb = body(you?.x ?? COURT.you.x, you?.pose ?? STAND, you?.facing ?? 1);
  const fb = body(friend?.x ?? COURT.friend.x, friend?.pose ?? STAND, friend?.facing ?? -1);
  const cb = body(coffee?.x ?? COURT.coffee.seller.x, coffee?.pose ?? STAND, coffee?.facing ?? -1, coffee?.front ? 1040 : COURT.floor);
  const yh = headAt(yb.x, yb.y, S, yb.pose, yb.facing);
  const fh = headAt(fb.x, fb.y, S, fb.pose, fb.facing);
  const ch = headAt(cb.x, cb.y, S, cb.pose, cb.facing);
  const seller = coffee && !coffee.hidden && (
    <g>
      <Person a={coffee} b={cb} who={COFFEE} frame={frame} seed={5} apron="#5d8a6a" />
      <PaperCap x={ch.x} y={ch.y} r={ch.r} color={COFFEE.cap} />
    </g>
  );
  const bm = backMood ?? mood;
  const shutterBottom = ourShutter !== undefined ? -200 + (COURT.counter.top - 10 + 200) * ourShutter : null;
  const coffeeShutter = coffee?.shutter !== undefined ? 250 + (COURT.coffee.top - 250) * coffee.shutter : null;
  const tagOf = (a: Actor | undefined, h: { x: number; y: number; r: number }) => a?.tag && (
    <g opacity={1 - 0.3 * (a.tagFade ?? 0)}><Tag frame={frame} x={h.x} headY={h.y} r={h.r} keys={a.tag} scale={a.tagScale ?? 1} /></g>
  );
  const actors = (
    <>
      {shutterBottom !== null && <Shutter x={COURT.counter.from + 10} w={COURT.counter.to - COURT.counter.from - 20} bottom={shutterBottom} />}
      <TealLamp frame={frame} x={COURT.pillar.lamp.x} y={COURT.pillar.lamp.y} size={34} />
      {pillarBoard && <RateBoard frame={frame} x={COURT.pillar.board.x} y={COURT.pillar.board.y} size={52} label={pillarBoard.label} keys={pillarBoard.keys} />}
      {coffeeBoard && <RateBoard frame={frame} x={COURT.priceBoard.x + 60} y={150} size={52} keys={coffeeBoard} />}
      {!coffee?.front && seller}
      <CoffeeCounter />
      {coffeeShutter !== null && <Shutter x={COURT.coffee.from + 20} w={COURT.coffee.to - COURT.coffee.from + 160} top={-300} bottom={coffeeShutter} />}
      {coffee?.front && seller}
      {friend && <Person a={friend} b={fb} who={FRIEND} frame={frame} seed={2} apron="#4f3a2b" />}
      {you && <Person a={you} b={yb} who={{ head: HERO.head, coat: "#3b3e47" }} scarf frame={frame} seed={0} />}
      <StallCounter box={false} />
      {!box.hidden && <CashBox x={COURT.box.x} y={COURT.counter.top} open={box.open ?? 0} />}
      {!box.hidden && box.full && (box.open ?? 0) > 0.5 && (
        <g>
          {Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={COURT.box.x - 90 + (i % 5) * 44} cy={COURT.counter.top - 66 - Math.floor(i / 5) * 12} rx={18} ry={7} fill="#e8b84a" stroke={INK} strokeWidth={3} />)}
          {box.envelopes && <Envelope x={COURT.box.x - 20} y={COURT.counter.top - 100} scale={1.5} tilt={-6} />}
          {box.envelopes && <Envelope x={COURT.box.x + 50} y={COURT.counter.top - 92} scale={1.5} tilt={7} />}
        </g>
      )}
      {box.key && <Key x={box.key.x} y={box.key.y} scale={0.55} rotate={box.key.rotate ?? -14} />}
      {front}
      {tagOf(coffee, ch)}
      {tagOf(friend, fh)}
      {tagOf(you, yh)}
      {over}
    </>
  );
  return (
    <LookContext.Provider value={setLook(foodCourtLights, mood, cam, look)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={<><FoodCourtBack cam={cam} mood={bm} frame={frame} diners={diners} /><StallLamp /></>} actors={actors} />
    </LookContext.Provider>
  );
};

/** The head positions in a stall shot (for framing and bubbles). */
export const heads = (you?: Actor, friend?: Actor) => ({ you: headOf(you, COURT.you.x, 1), friend: headOf(friend, COURT.friend.x, -1) });

/** A camera that frames a head with its tag above it. */
export const tagShot = (h: { x: number; y: number; r: number }, zoom = 2.0): Camera => ({ x: h.x, y: h.y - h.r * 1.5, zoom });

// ------------------------------------------------------------------------------------------------ the pocket insert

/**
 * A close insert of your apron pocket and your hand (screen coordinates, REF camera). `inside` 0: the hand above the
 * pocket with the key showing; 1: the hand in the pocket, the key gone. `grip` closes the fingers.
 */
export const PocketInsert: React.FC<{ inside: number; grip?: number; key?: boolean; glint?: number }> = ({ inside, grip = 1, key = true, glint = 0 }) => {
  const hy = 330 + inside * 300;
  const hx = 880 + inside * 40;
  return (
    <g>
      <rect x={-1400} y={-900} width={4800} height={2600} fill="#6e5038" />
      {Array.from({ length: 16 }, (_, i) => <line key={i} x1={-200 + i * 160} y1={-100} x2={-320 + i * 160} y2={1300} stroke="#5d4330" strokeWidth={6} opacity={0.6} />)}
      {/* the apron string and the scarf's end at the top */}
      <rect x={-200} y={90} width={2400} height={36} fill="#4f3a2b" />
      {/* the pocket's back, then the arm and hand, then the pocket's front over them */}
      <rect x={640} y={560} width={640} height={460} rx={30} fill="#4a3424" />
      <g>
        <path d={`M${hx - 520} ${hy - 700} L${hx - 70} ${hy - 30}`} stroke="#3b3e47" strokeWidth={150} strokeLinecap="round" />
        <circle cx={hx} cy={hy} r={92} fill={MUSTARD} stroke={INK} strokeWidth={8} />
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx={hx + 70 - grip * 30} cy={hy - 46 + i * 34} rx={38 - grip * 10} ry={17} fill={MUSTARD} stroke={INK} strokeWidth={6} />
        ))}
        {key && <Key x={hx + 120 - grip * 20} y={hy + 30} scale={1.8} rotate={18} glint />}
      </g>
      <path d="M620 600 Q960 560 1300 600 L1300 1100 L620 1100 Z" fill="#7a5a3a" stroke={INK} strokeWidth={10} />
      <path d="M660 640 Q960 604 1260 640" fill="none" stroke="#a07a52" strokeWidth={6} strokeDasharray="18 16" />
      {glint > 0 && <circle cx={1010} cy={690} r={60 * glint} fill="#fff6c8" opacity={0.35 * glint} />}
    </g>
  );
};

/** The pocket insert on a stage, lit by the mood. */
export const PocketShot: React.FC<{ mood: MoodName; cam: Camera; inside: number; grip?: number; glint?: number }> = ({ mood, cam, inside, grip, glint }) => (
  <LookContext.Provider value={setLook([{ x: 900, y: 200, r: 700, color: "#ffcf7a", strength: 0.45, moods: ["lamp", "dusk", "night"] }], mood, cam)}>
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<rect x={-1400} y={-900} width={4800} height={2600} fill="#2a2016" />}
      actors={<PocketInsert inside={inside} grip={grip} glint={glint} />} />
  </LookContext.Provider>
);

export { COURT };
