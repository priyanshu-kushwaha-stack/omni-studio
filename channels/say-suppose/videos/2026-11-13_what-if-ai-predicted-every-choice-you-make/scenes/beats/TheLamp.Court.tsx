// The pieces The Lamp and Half Price share (builder a): the counter close in the thumbnail's geometry (you large at the
// left, your best friend smaller at the right, the tin box between, his tag over his head), the food court wide with the
// city worker on his ladder at the pillar, the late people in the court, and the small props (coins, the iced coffee,
// the cloth, the ladder, the mop). Everything is drawn in world coordinates inside a <Stage> slot.
//
// CLOSE is drawn at screen scale for the REF camera, like brand/thumbs/predict/data.ts: the court behind is the
// FoodCourt set at REF, the figures are cheated larger for the close. COURT (sets/FoodCourt) is the wide world.
import { Figure } from "@whatif/kit/rig/Figure";
import type { Expression } from "@whatif/kit/rig/expressions";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { worldOf } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { setLook, type SetLight } from "@whatif/kit/sets/common";
import { INK, PAPER, TEAL } from "@whatif/kit/theme";
import { FONT } from "@whatif/kit/fonts";
import { RateBoard, Tag, TealLamp, type BoardKey, type TagKey } from "../device";
import { aimArm, Apron, headAt, PaperCap, Shade, type Body } from "../kit";
import { blinking, COFFEE, FRIEND, HERO, PASTELS, WORKER } from "../shared";
import { CashBox, COURT, CoffeeCounter, FoodCourtBack, foodCourtLights, Key, StallCounter, StallLamp } from "../sets/FoodCourt";

export type Face = Partial<Expression>;
export type Mood = MoodName;

// ------------------------------------------------------------------------------------------------ props

/** A coin, edge-on or flat. (x, y) its centre, in whatever units it is drawn. */
export const Coin: React.FC<{ x: number; y: number; r?: number; edge?: number }> = ({ x, y, r = 16, edge = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(1 ${Math.max(0.15, edge)})`}>
    <circle r={r} fill="#e8b84a" stroke={INK} strokeWidth={Math.max(2, r * 0.22)} />
    <circle r={r * 0.55} fill="none" stroke="#b8862a" strokeWidth={Math.max(1.5, r * 0.12)} />
  </g>
);

/** An iced coffee in a clear cup with a lid and a straw, drawn in a figure's hand units (held) or at any scale. */
export const IcedCoffee: React.FC<{ x?: number; y?: number; scale?: number; tilt?: number }> = ({ x = 0, y = 0, scale = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <path d="M-15 -22 L-11 20 H11 L15 -22Z" fill="#8a5a3a" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M-14 -12 H14" stroke="#c9a27a" strokeWidth={5} />
    <rect x={-17} y={-28} width={34} height={8} rx={3} fill={PAPER} stroke={INK} strokeWidth={3.5} />
    <path d="M4 -28 L10 -48" stroke={TEAL} strokeWidth={5} strokeLinecap="round" />
  </g>
);

/** A folded cloth in a hand (hand units). */
export const Cloth: React.FC = () => <rect x={-14} y={-6} width={28} height={16} rx={4} fill="#d9e3e6" stroke={INK} strokeWidth={3.5} />;

/** An open palm turned up, drawn over a hand (hand units): the "Trust me?" hand. */
export const Palm: React.FC<{ color: string }> = ({ color }) => (
  <path d="M-16 -2 Q-18 10 0 12 Q20 12 22 -2 Q12 2 3 1 Q-6 2 -16 -2Z" fill={color} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
);

/** The city worker's ladder: two rails from the foot to the top, rungs every 70. */
export const Ladder: React.FC<{ foot: { x: number; y: number }; top: { x: number; y: number } }> = ({ foot, top }) => {
  const n = Math.floor(Math.hypot(foot.x - top.x, foot.y - top.y) / 70);
  const at = (t: number, side: number) => ({ x: foot.x + (top.x - foot.x) * t + side, y: foot.y + (top.y - foot.y) * t });
  return (
    <g stroke="#b9bec8" strokeLinecap="round">
      {[-26, 26].map((s) => <line key={s} x1={foot.x + s} y1={foot.y} x2={top.x + s} y2={top.y} strokeWidth={11} />)}
      {Array.from({ length: n }, (_, i) => {
        const a = at((i + 0.5) / n, -26), b = at((i + 0.5) / n, 26);
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={8} />;
      })}
    </g>
  );
};

/** A mop held upright (hand units). */
export const Mop: React.FC = () => (
  <g>
    <line x1={0} y1={-60} x2={0} y2={110} stroke="#8a6a4a" strokeWidth={6} />
    <path d="M-22 110 h44 l6 22 h-56z" fill="#d9d2c0" stroke={INK} strokeWidth={3} />
  </g>
);

/** Lays a group over another, clipped to a rectangle (to draw a reaching arm over the box without the body). */
export const Clip: React.FC<{ id: string; x: number; y: number; w: number; h: number; children: React.ReactNode }> = ({ id, x, y, w, h, children }) => (
  <g>
    <defs><clipPath id={`clip-${id}`}><rect x={x} y={y} width={w} height={h} /></clipPath></defs>
    <g clipPath={`url(#clip-${id})`}>{children}</g>
  </g>
);

// ------------------------------------------------------------------------------------------------ role tags

/** A role tag (owner, 2026-11-15): a small dark plate naming a recurring character's role at their first close-up,
 *  placed off the face. (x, y) its centre in world units; `size` its letter height. Pops in at `at`, gone at `until`. */
export const RoleTag: React.FC<{ frame: number; at: number; until: number; x: number; y: number; text: string; size?: number }> = ({ frame, at, until, x, y, text, size = 30 }) => {
  if (frame < at || frame >= until) return null;
  const o = Math.min(1, (frame - at) / 6, (until - frame) / 6);
  const w = text.length * size * 0.72 + size;
  return (
    <g transform={`translate(${x} ${y}) rotate(-2)`} opacity={o}>
      <rect x={-w / 2} y={-size * 0.85} width={w} height={size * 1.7} rx={size * 0.25} fill="#1b1e29" stroke={PAPER} strokeWidth={3} />
      <text x={0} y={size * 0.35} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={PAPER} letterSpacing={2}>{text}</text>
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the counter close

/** The thumbnail's geometry (brand/thumbs/predict/data.ts), at screen scale for the REF camera. */
export const CL = {
  top: 960,
  you: { x: 400, y: 1775, scale: 4.2 },
  friend: { x: 1600, y: 1450, scale: 3.0 },
  box: { x: 840, w: 300, h: 112 },
  lamp: { x: 900, y: 330 },
  /** The city's teal lamp on the pillar, top left behind you. */
  teal: { x: 120, y: 200 },
} as const;

/** The lock's spot on the shut box. */
export const LOCK = { x: CL.box.x, y: CL.top - CL.box.h + CL.box.h * 0.3 + 21 };

const closeLights: SetLight[] = [
  { x: CL.lamp.x, y: CL.lamp.y + 60, r: 700, color: "#ffcf7a", strength: 0.55, moods: ["lamp", "night", "dusk"] },
];

export const youBody = (pose: Pose): Body => ({ x: CL.you.x, y: CL.you.y, scale: CL.you.scale, pose, facing: 1 });
export const friendBody = (pose: Pose): Body => ({ x: CL.friend.x, y: CL.friend.y, scale: CL.friend.scale, pose, facing: -1 });
export const youHead = (pose: Pose = STAND) => headAt(CL.you.x, CL.you.y, CL.you.scale, pose, 1);
export const friendHead = (pose: Pose = STAND) => headAt(CL.friend.x, CL.friend.y, CL.friend.scale, pose, -1);

/** The close counter's counter: a wooden top edge and a dark front panel across the frame. */
const CloseCounter: React.FC = () => (
  <g>
    <rect x={-1400} y={CL.top} width={4800} height={900} fill="#5a3b2a" stroke={INK} strokeWidth={8} />
    <rect x={-1400} y={CL.top} width={4800} height={30} fill="#8a5d3c" stroke={INK} strokeWidth={6} />
    {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={i * 360 + 120} y1={CL.top + 40} x2={i * 360 + 120} y2={1700} stroke="#3f2a1e" strokeWidth={6} />)}
  </g>
);

export interface Actor { pose: Pose; face: Face; held?: React.ReactNode; mouthOpen?: boolean }

/**
 * The counter close. `box.open` lifts the lid (0 shut, 1 open); `box.key` puts the key in the lock, turning it
 * (0..1, a squash); `coins` are coins in flight [x, y] drawn in front of the box; `tags` hang over your heads; `warm`
 * tints the frame for another night (no city lamp, no tags then); `extra` draws on top.
 */
export const CloseShot: React.FC<{
  frame: number; cam: Camera; mood: Mood; you: Actor; friend: Actor; box?: { open: number; key?: number | null; coinsIn?: number };
  coins?: { x: number; y: number }[]; tags?: { you: TagKey[]; friend: TagKey[] } | null; teal?: number | null; warm?: number;
  extra?: React.ReactNode; glowFace?: number;
}> = ({ frame, cam, mood, you, friend, box = { open: 0, key: null }, coins = [], tags = null, teal = null, warm = 0, extra, glowFace = 0 }) => {
  const yb = youBody(you.pose);
  const fb = friendBody(friend.pose);
  const yh = youHead(you.pose);
  const fh = friendHead(friend.pose);
  const youFig = (
    <>
      <Figure x={yb.x} y={yb.y} scale={yb.scale} facing={1} pose={you.pose} {...HERO} coat="#2a2d36" {...you.face}
        blink={blinking(frame, 0)} time={frame} held={you.held} />
    </>
  );
  const friendFig = (
    <Figure x={fb.x} y={fb.y} scale={fb.scale} facing={-1} pose={friend.pose} head={FRIEND.head} coat="#2a2d36" {...friend.face}
      blink={blinking(frame, 3)} time={frame} held={friend.held} />
  );
  const keyIn = box.key !== null && box.key !== undefined;
  const actors = (
    <>
      {teal !== null && <TealLamp frame={frame} x={CL.teal.x} y={CL.teal.y} size={34} on={teal} />}
      <Shade id="close-you" x={yh.x} y={yh.y} r={yh.r} strength={0.7} />
      {friendFig}
      <Apron b={fb} color={FRIEND.coat} />
      {youFig}
      <Apron b={yb} color="#7a5a3a" />
      {glowFace > 0 && <ellipse cx={yh.x + 60} cy={yh.y + yh.r * 0.9} rx={yh.r * 1.2} ry={yh.r * 0.7} fill="#ffd27a" opacity={0.22 * glowFace} />}
      <CloseCounter />
      <CashBox x={CL.box.x} y={CL.top} w={CL.box.w} h={CL.box.h} open={box.open} />
      {box.open > 0 && (box.coinsIn ?? 0) > 0 && Array.from({ length: Math.min(9, box.coinsIn ?? 0) }, (_, i) => (
        <Coin key={i} x={CL.box.x - 100 + (i % 5) * 48} y={CL.top - CL.box.h + 26 - Math.floor(i / 5) * 10} r={18} edge={0.45} />
      ))}
      {coins.map((c, i) => <Coin key={i} x={c.x} y={c.y} r={18} />)}
      {/* the reaching arms again, over the counter and the box, without the bodies */}
      <Clip id="close-you-arm" x={yh.x + yh.r + 10} y={-400} w={1300} h={CL.top + 400}>{youFig}</Clip>
      <Clip id="close-friend-arm" x={0} y={-400} w={fh.x - fh.r - 20} h={CL.top + 400}>{friendFig}</Clip>
      {keyIn && <Key x={LOCK.x - 44} y={LOCK.y + 4} scale={0.72} rotate={0} glint={false} />}
      {keyIn && <rect x={LOCK.x - 6} y={LOCK.y - 12 + 10 * Math.abs(Math.sin((box.key ?? 0) * Math.PI))} width={12} height={Math.max(4, 24 * Math.abs(Math.cos((box.key ?? 0) * Math.PI)))} rx={3} fill={INK} />}
      {tags && <Tag frame={frame} x={yh.x + 20} headY={yh.y} r={yh.r} keys={tags.you} scale={0.5} />}
      {tags && <Tag frame={frame} x={fh.x - 30} headY={fh.y} r={fh.r} keys={tags.friend} scale={0.72} />}
      {extra}
      {warm > 0 && <rect x={-1400} y={-900} width={4800} height={3000} fill="#ff9a3a" opacity={0.1 + 0.08 * warm} />}
    </>
  );
  return (
    <LookContext.Provider value={setLook(closeLights, mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={<><FoodCourtBack cam={cam} mood={mood} frame={frame} diners={false} /><g transform={`translate(${CL.lamp.x - 800} 30)`}><StallLamp /></g></>}
        actors={actors} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ the court wide

/** The late people in the court at closing: a cleaner with a mop, a last customer, a cook, a guard. Behind the
 *  counters, smaller, so only heads and shoulders show above them. Their cards carry digits only: every card with a
 *  forecast line is a `> TAG:` in the script (v2), and these people have none. */
export const EXTRAS = [
  { id: "mop", x: 375, y: 1000, scale: 1.35, head: PASTELS[2], coat: "#3b4a6b", facing: 1 as const, pct: 99, mop: true },
  { id: "last", x: 1250, y: 1000, scale: 1.35, head: PASTELS[0], coat: "#2a2d36", facing: -1 as const, pct: 94, mop: false },
  { id: "cook", x: 1525, y: 1000, scale: 1.35, head: PASTELS[3], coat: "#5f3d6b", facing: 1 as const, pct: 97, mop: false },
  { id: "guard", x: 1870, y: 1000, scale: 1.35, head: PASTELS[4], coat: "#2f3340", facing: -1 as const, pct: 98, mop: false },
];

/** The worker's spots: the ladder against the pillar and where he stands on it. */
export const LADDER = { foot: { x: 320, y: 1000 }, top: { x: 170, y: 210 }, worker: { x: 236, y: 715, scale: 1.6 } } as const;

/** Where the pillar's teal lamp and rate board sit in world units under `cam` (the pillar is a depth 0.95 layer). */
export const pillarLamp = (cam: Camera) => worldOf(cam, COURT.pillar.lamp.x + 26, COURT.pillar.lamp.y, 0.95);
export const pillarBoard = (cam: Camera) => worldOf(cam, COURT.pillar.board.x, COURT.pillar.board.y, 0.95);

export interface CourtWho { x?: number; facing?: 1 | -1; pose?: Pose; face: Face; held?: React.ReactNode }

/** The tag keys for every head in the court, by who: you, friend, seller, worker and the extras' ids. */
export type CourtTags = Record<string, TagKey[]>;

/**
 * The court at closing, at COURT's world scale. `worker` puts him on the ladder (null: gone); `lampAt` is where the
 * teal lamp is before it is clipped on (in his hand), `lampOn` when it lights; `tags` hang over the heads; `up` gives
 * each extra's look-up amount (0..1, the wave); `boards` draw the pillar's rate board and the coffee price board.
 */
export const CourtShot: React.FC<{
  frame: number; cam: Camera; mood: Mood; you: CourtWho; friend: CourtWho; seller: CourtWho; worker?: CourtWho | null;
  lampHeld?: boolean; lampOn?: number; lampDim?: number; tags?: CourtTags; tagScale?: number; up?: Record<string, number>;
  pillarKeys?: BoardKey[] | null; priceKeys?: BoardKey[] | null; extra?: React.ReactNode; front?: React.ReactNode;
  diners?: boolean; pillarLabel?: string; workerDrop?: number; looks?: Record<string, { x: number; y: number }>;
}> = ({ frame, cam, mood, you, friend, seller, worker = null, lampHeld = false, lampOn = -1000, lampDim = 1, tags = {}, tagScale = 0.7, up = {},
  pillarKeys = null, priceKeys = null, extra, front, diners = false, pillarLabel = "YOUR RATE", workerDrop = 0, looks = {} }) => {
  const S = COURT.scale;
  const lamp = pillarLamp(cam);
  const yB: Body = { x: you.x ?? COURT.you.x, y: COURT.floor, scale: S, pose: you.pose ?? STAND, facing: you.facing ?? 1 };
  const fB: Body = { x: friend.x ?? COURT.friend.x, y: COURT.floor, scale: S, pose: friend.pose ?? STAND, facing: friend.facing ?? -1 };
  const sB: Body = { x: COURT.coffee.seller.x, y: COURT.floor, scale: S, pose: seller.pose ?? STAND, facing: -1 };
  const W = LADDER.worker;
  // workerDrop 0..1 takes him down the ladder to the floor
  const wB: Body = { x: W.x + (LADDER.foot.x - 60 - W.x) * workerDrop, y: W.y + (COURT.floor - W.y) * workerDrop, scale: W.scale, pose: worker?.pose ?? STAND, facing: -1 };
  const head = (b: Body) => headAt(b.x, b.y, b.scale, b.pose, b.facing);
  const yh = head(yB), fh = head(fB), sh = head(sB), wh = head(wB);
  const hang = (who: string, h: { x: number; y: number; r: number }, scale = tagScale) =>
    tags[who] ? <Tag key={who} frame={frame} x={h.x} headY={h.y} r={h.r} keys={tags[who]!} scale={scale} /> : null;
  const extras = EXTRAS.map((e) => {
    const u = up[e.id] ?? 0;
    const pose: Pose = { ...STAND, tilt: -14 * u, armF: e.mop ? [30, 40] : STAND.armF };
    return { e, pose, h: headAt(e.x, e.y, e.scale, pose, e.facing), u };
  });
  const actors = (
    <>
      <Ladder foot={LADDER.foot} top={LADDER.top} />
      {worker && (
        <g>
          <Figure x={wB.x} y={wB.y} scale={wB.scale} facing={-1} pose={wB.pose} head={WORKER.head} coat={WORKER.coat} {...worker.face}
            blink={blinking(frame, 5)} time={frame} held={worker.held} />
          <path d={`M${wh.x - 44} ${wh.y - 28} Q${wh.x} ${wh.y - 96} ${wh.x + 44} ${wh.y - 28}Z`} fill="#f2c94c" stroke={INK} strokeWidth={4} />
        </g>
      )}
      {!lampHeld && <TealLamp frame={frame} x={lamp.x} y={lamp.y} size={22} on={lampOn} dim={lampDim} />}
      {extras.map(({ e, pose, u }) => (
        <Figure key={e.id} x={e.x} y={e.y} scale={e.scale} facing={e.facing} pose={pose} head={e.head} coat={e.coat} mouth="flat"
          look={looks[e.id] ?? { x: 0.5 - 0.4 * u, y: 0.3 - 1.1 * u }} brows={u > 0.5 || looks[e.id] ? "raised" : "none"} blink={blinking(frame, e.x)} time={frame}
          held={e.mop ? <Mop /> : undefined} />
      ))}
      <Figure x={fB.x} y={fB.y} scale={S} facing={fB.facing} pose={fB.pose} head={FRIEND.head} coat="#2a2d36" {...friend.face}
        blink={blinking(frame, 3)} time={frame} held={friend.held} />
      <Apron b={fB} color={FRIEND.coat} />
      <Figure x={yB.x} y={yB.y} scale={S} facing={yB.facing} pose={yB.pose} {...HERO} coat="#2a2d36" {...you.face}
        blink={blinking(frame, 0)} time={frame} held={you.held} />
      <Apron b={yB} color="#7a5a3a" />
      <StallCounter />
      <Figure x={sB.x} y={sB.y} scale={S} facing={-1} pose={sB.pose} head={COFFEE.head} coat={COFFEE.coat} mouth="flat" {...seller.face}
        blink={blinking(frame, 9)} time={frame} held={seller.held} />
      <PaperCap x={sh.x} y={sh.y} r={sh.r} color={COFFEE.cap} />
      <CoffeeCounter />
      {extra}
      {pillarKeys && <RateBoard frame={frame} x={pillarBoard(cam).x} y={pillarBoard(cam).y} size={46} label={pillarLabel || undefined} keys={pillarKeys} />}
      {priceKeys && <RateBoard frame={frame} x={1840} y={200} size={50} keys={priceKeys} />}
      {extras.map(({ e, h }) => hang(e.id, h, 0.9))}
      {worker && hang("worker", wh, 0.8)}
      {hang("you", yh)}
      {hang("friend", fh)}
      {hang("seller", sh, 0.62)}
      {front}
    </>
  );
  return (
    <LookContext.Provider value={setLook([...foodCourtLights, { x: lamp.x, y: lamp.y, r: 260, color: TEAL, strength: frame >= lampOn ? 0.35 : 0, moods: ["lamp", "night", "dusk", "day", "morning"] }], mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={<><FoodCourtBack cam={cam} mood={mood} frame={frame} diners={diners} /><StallLamp /></>} actors={actors} />
    </LookContext.Provider>
  );
};

/** The worker's front arm on a point (the lamp, the pillar). */
export const workerReach = (target: { x: number; y: number }): Pose => {
  const W = LADDER.worker;
  return { ...STAND, armF: aimArm({ x: W.x, y: W.y, scale: W.scale, pose: STAND, facing: -1 }, target), legF: [20, -30] };
};

// ------------------------------------------------------------------------------------------------ the tags of the first night

/** A card with digits only (no forecast line): the people with no `> TAG:` in the script. New at `at`, teal at `t`. */
export const digitsOnly = (pct: number, at: number, t: number): TagKey[] => [
  { at, text: "", pct, state: "new" },
  { at: t, text: "", pct, state: "tick" },
];

/** Every head's first card (v2): yours and his are the script's (POCKETS KEY 91%, HOLDS OUT HAND 96%), dropping at
 *  `you` and `friend` and ticking teal at `tick`; everyone else's carry digits only, dropping from `rest` and ticking
 *  one after another from `wave` (the wave of heads), `step` frames apart, left to right. */
export function firstTags(k: { you: number; friend: number; tick: number; rest: number; wave: number; step?: number }): CourtTags {
  const step = k.step ?? 6;
  const two = (text: string, pct: number, at: number, t: number): TagKey[] => [
    { at, text, pct, state: "new" },
    { at: t, text, pct, state: "tick" },
  ];
  const out: CourtTags = {
    you: two("POCKETS KEY", 91, k.you, k.tick),
    friend: two("HOLDS OUT HAND", 96, k.friend, k.tick + 2),
  };
  const others = [
    { id: "worker", x: LADDER.worker.x, pct: 96 }, ...EXTRAS.map((e) => ({ id: e.id, x: e.x, pct: e.pct })),
    { id: "seller", x: COURT.coffee.seller.x, pct: 98 },
  ].sort((a, b) => a.x - b.x);
  others.forEach((o, i) => { out[o.id] = digitsOnly(o.pct, k.rest + i * 2, k.wave + i * step); });
  return out;
}
