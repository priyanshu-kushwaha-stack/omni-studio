// Part C's diner pieces on top of the foundation's DinerShot: the town meeting's crowd in front of the counter (hammers
// and wrenches up or down, per person), steel machines walking, a chirp, the split-flap counter on the blank board,
// stools that fill one by one with a clink, and the wordless peak (one long take: the whistle, the gate, the road
// filling, the stools, Marco flipping beside the steel cook, a slow-motion ghost on the landing). World units (REF)
// unless a comment says screen.
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { SEATED, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { screenOf } from "@whatif/kit/sets/common";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { MoodName } from "@whatif/kit/stage/moods";
import { GLOW, Burger, Plate, Spatula } from "../Props";
import { MARCO, painter, PLUMBER, STRANGER, townsfolk, WAITRESS, worker, YOU, type Person } from "../Cast";
import { DINER } from "../../sets/Diner";
import { DinerShot, on, steelOn, type Face, type Member, type SteelMember } from "../Places";
import { COOK_POSE, Robot } from "../Robot";
import { Tile, type ShotTime } from "../util";
import { Dressed } from "../Wear";
import { act, blend, Clink, mix, RAISED, ramp } from "./kit";

/** Someone in the crowd: who, where (world feet), size, and their arm (0 down .. 1 raised). */
export interface Extra { who: Person; x: number; y: number; s: number; face?: Face; facing?: 1 | -1; raise?: number; pose?: Pose; look?: { x: number; y: number } }

export const Extras: React.FC<{ people: Extra[]; frame: number }> = ({ people, frame }) => (
  <g>
    {[...people].sort((a, b) => a.y - b.y).map((p, i) => {
      const e = EXPRESSIONS[p.face ?? "neutral"];
      const pose = p.pose ?? blend(STAND, RAISED, p.raise ?? 0);
      return <Dressed key={i} x={p.x} y={p.y} scale={p.s} facing={p.facing ?? -1} pose={pose} time={frame} {...e} {...(p.look ? { look: p.look } : {})} {...p.who} />;
    })}
  </g>
);

const withTool = (p: Person, tool: "hammer" | "wrench"): Person => ({ ...p, wear: [...(p.wear ?? []), { kind: tool }] });
/** Your old waitress in her hairdresser's smock (pencil still behind her ear). */
export const APPRENTICE: Person = { ...WAITRESS, coat: "#9fd6d2", wear: [{ kind: "pencil" }] };

/** The town meeting, spilled into the diner: back row then front row (Marco is drawn on his own). `raise(i)` gives each
 *  person's arm, 0..1. Index 0 is the painter at the back who can't make up his mind. */
export const CROWD: { who: Person; x: number; row: 0 | 1 }[] = [
  { who: withTool(painter(0), "hammer"), x: 560, row: 0 },
  { who: townsfolk(1, "hammer"), x: 800, row: 0 },
  { who: withTool(painter(1), "hammer"), x: 1270, row: 0 },
  { who: townsfolk(3, "wrench"), x: 1500, row: 0 },
  { who: townsfolk(4, "hammer"), x: 1740, row: 0 },
  { who: withTool(painter(2), "hammer"), x: 1980, row: 0 },
  { who: townsfolk(6, "hammer"), x: 430, row: 1 },
  { who: withTool(APPRENTICE, "hammer"), x: 680, row: 1 },
  { who: townsfolk(2, "hammer"), x: 1330, row: 1 },
  { who: withTool(PLUMBER, "wrench"), x: 1590, row: 1 },
  { who: townsfolk(8, "hammer"), x: 1850, row: 1 },
];
export const MARCO_X = 1060;

export function crowd(raise: (i: number) => number, face: (i: number) => Face = () => "determined", look = { x: 0.1, y: -0.5 }): Extra[] {
  return CROWD.map((c, i) => ({
    who: c.who, x: c.x, y: c.row ? 1078 : 990, s: c.row ? 1.1 : 0.92, raise: raise(i), face: face(i), look,
    facing: (i % 2 ? -1 : 1) as 1 | -1,
  }));
}

/** Four steel cooks at the pass, behind the counter, screens beaming at the room. `lean` tips cook1 back (its screen
 *  turned up at Marco). */
export const cooksAtPass = (n = 4, lean = 0, flip?: number): SteelMember[] =>
  Array.from({ length: n }, (_, i) => steelOn(`cook${i + 1}`, {
    behind: true, held: "spatula", pose: i === 0 ? { ...STAND, lean: -lean, armF: [30, 30] } : flip !== undefined ? COOK_POSE : { ...STAND, armF: [30, 30] },
    toolAngle: 10, ...(flip !== undefined && i > 0 ? { flip: flip + i * 0.3, toolAngle: -18 } : {}),
  }));

/** A chirp: three short strokes off a screen (world point), for `f` frames after it starts. */
export const Chirp: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => {
  if (f < 0 || f > 16) return null;
  const k = ramp(f, 0, 16);
  return (
    <g transform={`translate(${x} ${y})`} opacity={1 - k}>
      {[-35, 0, 35].map((a) => {
        const r = ((a - 90) * Math.PI) / 180;
        return <line key={a} x1={Math.cos(r) * (60 + 20 * k)} y1={Math.sin(r) * (60 + 20 * k)} x2={Math.cos(r) * (84 + 30 * k)} y2={Math.sin(r) * (84 + 30 * k)}
          stroke={GLOW} strokeWidth={7} strokeLinecap="round" />;
      })}
    </g>
  );
};

/** A steel machine walking across the floor (world), from x0 to x1 over frames a..b. */
export const WalkingRobot: React.FC<{ f: number; a: number; b: number; x0: number; x1: number; y?: number; s?: number; cap?: string; held?: React.ComponentProps<typeof Robot>["held"] }> = ({
  f, a, b, x0, x1, y = 1030, s = 1, cap, held,
}) => {
  const p = ramp(f, a, b);
  return <Robot x={mix(x0, x1, p)} y={y} scale={s} facing={x1 < x0 ? -1 : 1} pose={p > 0 && p < 1 ? walkPose(f * 0.32) : STAND} frame={f} cap={cap} held={held} />;
};

/** The split-flap counter over the blank board (screen-placed so it sits on the wall at depth 0.8 under any camera). */
export const FlapCounter: React.FC<{ cam: Camera; value: number; spin?: number }> = ({ cam, value, spin = 0 }) => {
  const b = DINER.board;
  const c = screenOf(cam, b.x + b.w / 2, b.y + b.h / 2, 0.8);
  const s = 0.5 * cam.zoom;
  const digits = String(Math.max(0, Math.floor(value))).padStart(3, "0").split("");
  return (
    <g>
      {digits.map((d, i) => (
        <Tile key={i} ch={d} x={c.x + (i - 1) * 124 * s} y={c.y} s={s} r={i === 2 && spin > 0 ? Math.sin(spin * Math.PI) * 6 : 0} />
      ))}
    </g>
  );
};

/** Customers on the stools, the first `n` taken (fractional: the next one drops in with a bounce and a clink). Stools
 *  past the ninth are placed by offset. */
export const stoolsFilled = (n: number, people: (i: number) => Person = (i) => worker(i), from = 1): { cast: Member[]; clinks: { x: number; f: number }[] } => {
  const cast: Member[] = [];
  const clinks: { x: number; f: number }[] = [];
  const whole = Math.floor(n);
  const seats = 14;
  for (let i = 0; i < Math.min(seats, Math.ceil(n)); i++) {
    const k = i < whole ? 1 : n - whole;
    if (k <= 0) continue;
    const drop = (1 - act(k, 0, 0.6)) * -80 + Math.sin(Math.min(1, k) * Math.PI) * -10;
    const seat = i + from;
    const spot = `stool${Math.min(9, seat)}`;
    const dx = Math.max(0, seat - 9) * 172;
    cast.push(on(spot, people(i), i % 3 ? "happy" : "relieved", { dx, dy: drop, look: { x: -0.4, y: -0.2 } }));
    if (k < 0.5) clinks.push({ x: DINER.stoolX(seat - 1), f: Math.round(k * 30) });
  }
  return { cast, clinks };
};

const lerpCam = (a: Camera, b: Camera, t: number): Camera => ({ x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), zoom: mix(a.zoom, b.zoom, t) });

/** THE WORDLESS PEAK (10 s, one long take). The whistle and the gate through the window; the camera pulls back as the
 *  road fills with overalls and the stools fill one by one, a clink each; the split-flap counter turns, slower now, for
 *  food; then in to the grill, where the steel cook preps and Marco flips, and his burger lands on the bun with a
 *  slow-motion ghost. */
export const Peak: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const WIN: Camera = { x: 1020, y: 360, zoom: 1.6 };
  const WIDE: Camera = { x: 1060, y: 560, zoom: 1.04 };
  const GRILL: Camera = { x: 1640, y: 610, zoom: 1.75 };
  const cam = f < 60 ? WIN : f < 130 ? lerpCam(WIN, WIDE, act(f, 60, 130)) : f < 205 ? WIDE : lerpCam(WIDE, GRILL, act(f, 205, 250));
  const filled = mix(0, 13, ramp(f, 95, 205));
  const { cast, clinks } = stoolsFilled(filled);
  // Marco's flip: the spatula swings up at 236, the burger flies 238..286 in slow motion (ghosts trail it)
  const swing = act(f, 228, 238) * (1 - act(f, 250, 262));
  const marcoPose: Pose = { ...STAND, armF: [70 + 70 * swing, 40 - 30 * swing], armB: [20, 30] };
  const fly = ramp(f, 238, 286);
  const slow = fly < 0.5 ? fly * 1.4 : 0.7 + (fly - 0.5) * 0.6;
  // it lands on a bun on the pass shelf behind the counter, above the heads on the stools
  const from = { x: 1650, y: 640 }, to = { x: 1500, y: 686 };
  const at = (p: number) => ({ x: mix(from.x, to.x, p), y: mix(from.y, to.y, p) - 240 * 4 * p * (1 - p) });
  const landed = f >= 286;
  return (
    <DinerShot t={t} mood="day" cam={cam} grill="hot" crowd={ramp(f, 30, 120)} gate={act(f, 8, 46)} push={[1, 1.02]}
      options={{ whistle: 1 - ramp(f, 120, 160), board: "blank", clock: 12 + f / 3000 }}
      look={{ glows: [{ x: 960, y: 300, r: 900, color: "#fff2c8", strength: 0.18 }] }}
      cast={[
        on("grill", MARCO, f > 262 ? "happy" : "determined", { behind: true, pose: marcoPose, held: <Spatula angle={-20 - 50 * swing} s={1} />, look: { x: -0.6, y: 0.2 } }),
        on("till", YOU, "happy", { behind: true, look: { x: 0.8, y: 0 } }),
        on("pass", WAITRESS, "happy", { behind: true, pose: { ...STAND, armF: [80, 10] } }),
        ...cast,
      ]}
      steel={[steelOn("cook4", { behind: true, held: "spatula", burger: true, toolAngle: 6, pose: { ...STAND, armF: [60, 30] } }), steelOn("cook1", { behind: true, held: "spatula", pose: COOK_POSE, toolAngle: -18, flip: f / 34 })]}
      actors={
        <g>
          <Plate x={to.x} y={706} s={1} />
          {/* the bun's bottom half waiting */}
          <path d={`M${to.x - 40} 694 L${to.x + 40} 694 Q${to.x + 38} 708 ${to.x} 708 Q${to.x - 38} 708 ${to.x - 40} 694Z`} fill="#d9963e" stroke="#23252b" strokeWidth={4} />
          {fly > 0 && !landed && [0.24, 0.16, 0.08].map((d, i) => {
            const p = at(Math.max(0, slow - d));
            return <g key={i} opacity={0.18 + i * 0.1}><Burger x={p.x} y={p.y - 20} s={0.62} rot={(slow - d) * 540} /></g>;
          })}
          {fly > 0 && !landed && (() => { const p = at(slow); return <Burger x={p.x} y={p.y - 20} s={0.66} rot={slow * 540} />; })()}
          {landed && <Burger x={to.x} y={668} s={0.66} />}
          {landed && <Clink x={to.x} y={630} f={f - 286} color="#fff4c8" />}
          {clinks.map((c, i) => <Clink key={i} x={c.x} y={880} f={c.f} />)}
        </g>
      }
      overlay={<FlapCounter cam={cam} value={37 + Math.floor(ramp(f, 140, 300) * 6)} spin={(f / 22) % 1} />}
    />
  );
};

/** Who sits along the counter at lunch in the last scene: workers, the plant boss on stool four. */
export const lunchCrowd = (i: number): Person => worker(i + 2);

export { MARCO, STRANGER, SEATED };
export type { MoodName };
