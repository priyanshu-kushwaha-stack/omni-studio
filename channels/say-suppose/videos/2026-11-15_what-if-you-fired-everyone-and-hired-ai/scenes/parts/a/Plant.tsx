// Part A's paint-shop scenes on the foundation's PaintShopShot: the boss walks you in along the catwalk, the phone
// changes hands, fifty steel painters walk in and lay one wave of paint down the line while the human painters stand
// holding their masks, the boss checks his watch as the cars roll off, three shifts where there was one. No AI images.
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import type { MoodName } from "@whatif/kit/stage/moods";
import { INK } from "@whatif/kit/theme";
import { BOSS, painter, YOU } from "../Cast";
import { on, PaintShopShot, type Face } from "../Places";
import { STEEL_LIGHT } from "../Props";
import { Robot, SPRAY_POSE } from "../Robot";
import { ease, mix, ramp, type ShotTime } from "../util";
import { ChimeMark, MaskInHand } from "./Bits";

const STATIONS = [430, 800, 1170, 1540];
const FLOOR = 940;
const COLORS = ["#d8344f", "#1d9a8f", "#f2b632", "#3d6fb0"];

/** The boss walks you in along the catwalk over the human painters. */
export const WalkIn: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const k = ease(ramp(f, 0, Math.max(10, t.dur - 8)));
  const walking = k < 1;
  return (
    <PaintShopShot t={t} mood="day" painters="human" push={[1, 1.05]}
      cast={[
        on("walk1", BOSS, "happy", { behind: true, dx: mix(-500, 240, k), facing: walking ? 1 : -1, pose: walking ? walkPose(f * 0.3) : { ...STAND, armF: [70, 20] }, look: { x: 0.8, y: 0.2 } }),
        on("walk2", YOU, "sceptical", { behind: true, dx: mix(-960, -220, k), facing: 1, pose: walking ? walkPose(f * 0.3 + 1.3) : STAND, look: { x: 0.8, y: 0.3 } }),
      ]} />
  );
};

/** On the catwalk: you type PAINTER and hand the boss the phone; he types the number and looks at you; you nod. */
export const HandOver: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const handed = f >= 14;
  const nod = f > 26 && f < 40 ? Math.sin((f - 26) * 0.9) * 8 : 0;
  return (
    <PaintShopShot t={t} mood="day" painters="human" cam={{ x: 900, y: 290, zoom: 2.1 }} push={[1, 1.04]}
      cast={[
        on("walk1", BOSS, handed ? (f > 24 ? "sceptical" : "happy") : "neutral", {
          behind: true, dx: 240, facing: -1, phone: handed, pose: handed ? { ...STAND, armF: [70, 70] } : STAND, look: f > 24 ? { x: 0.9, y: 0 } : { x: 0.5, y: 0.6 },
        }),
        on("walk2", YOU, f > 26 ? "happy" : "neutral", {
          behind: true, dx: -220, facing: 1, phone: !handed, pose: { ...STAND, tilt: nod, armF: handed ? [12, 10] : [80, 30] }, look: { x: 0.9, y: 0.1 },
        }),
      ]} />
  );
};

/** The fifty walk in through the hall doors on fifty chirps; the line stands idle; the painters step back, masks off. */
export const FiftyWalkIn: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const bots = Array.from({ length: 7 }, (_, i) => {
    const u = ramp(f, i * 4, i * 4 + 40);
    return { x: mix(-160 - i * 30, i < 4 ? STATIONS[i] : 1720 + (i - 4) * 110, ease(u)), arrived: u >= 1, i };
  });
  return (
    <PaintShopShot t={t} mood="day" painters="none" speed={0} push={[1, 1.04]}
      cast={[
        on("walk1", BOSS, f < 20 ? "neutral" : "shocked", { behind: true, dx: 120, facing: 1, look: { x: -0.6, y: 0.6 } }),
        ...[0, 1].map((i) => on("floorLeft", { ...painter(i), wear: [] }, "worried", { dx: -500 + i * 120, facing: 1, held: <MaskInHand s={1.2} />, pose: { ...STAND, armF: [60, 40] }, look: { x: 0.7, y: 0 } })),
      ]}
      actors={
        <g>
          {bots.filter((b) => b.i >= 4).map((b) => <Robot key={b.i} x={b.x} y={FLOOR - 40} scale={0.8} pose={b.arrived ? STAND : walkPose(f * 0.45 + b.i)} frame={f} />)}
          {bots.filter((b) => b.i < 4).map((b) => (
            <Robot key={b.i} x={b.x} y={FLOOR} scale={1} pose={b.arrived ? SPRAY_POSE : walkPose(f * 0.45 + b.i)} held={b.arrived ? "paintGun" : "none"} frame={f} sprayColor={COLORS[b.i]} />
          ))}
          {bots.map((b) => <ChimeMark key={b.i} x={60} y={560 - b.i * 28} f={f} at={b.i * 4} s={1.1} />)}
        </g>
      } />
  );
};

/** One perfect arc each, a wave running down the line: the spray comes on station by station, the far row with it. */
export const PaintWave: React.FC<{ t: ShotTime; cam?: "wide" | "line"; mood?: MoodName; boss?: Face }> = ({ t, cam = "wide", mood = "day", boss = "shocked" }) => {
  const f = t.f;
  return (
    <PaintShopShot t={t} mood={mood} painters="robot" count={0} cam={cam} speed={2.2} spray={ramp(f, 6, 16)} push={[1, 1.05]}
      cast={[
        on("walk1", BOSS, boss, { behind: true, dx: 120, facing: 1, pose: { ...STAND, armF: [30, 20] }, look: { x: 0.2, y: 0.8 } }),
        ...[0, 1].map((i) => on("floorLeft", { ...painter(i), wear: [] }, "sad", { dx: -500 + i * 120, facing: 1, held: <MaskInHand s={1.2} />, pose: { ...STAND, armF: [30, 30] }, look: { x: 0.8, y: -0.1 } })),
      ]}
      actors={
        <g>
          {[4, 5, 6].map((i) => <Robot key={i} x={1720 + (i - 4) * 110} y={FLOOR - 40} scale={0.8} frame={f} />)}
          {STATIONS.map((x, i) => (
            <Robot key={i} x={x} y={FLOOR} scale={1} pose={SPRAY_POSE} held="paintGun" spray={ramp(f, 4 + i * 7, 10 + i * 7)} sprayColor={COLORS[i]} frame={f + i * 9} />
          ))}
        </g>
      } />
  );
};

/** A wristwatch for the boss's raised hand. */
const Watch: React.FC = () => (
  <g transform="translate(-6 -6)">
    <rect x={-10} y={-4} width={20} height={26} rx={4} fill="#2f3242" />
    <circle cx={0} cy={8} r={13} fill={STEEL_LIGHT} stroke={INK} strokeWidth={4} />
    <line x1={0} y1={8} x2={0} y2={0} stroke={INK} strokeWidth={3} />
  </g>
);

/** The cars roll off the end of the line before the wave has finished; the boss checks his watch, shakes it, checks it. */
export const WatchCheck: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const shaking = f > 30 && f < 56;
  const arm: Pose = { ...STAND, lean: -4, armF: [shaking ? 120 + Math.sin(f * 1.6) * 22 : 128, 72] };
  return (
    <PaintShopShot t={t} mood="day" painters="robot" count={4} cam="line" speed={6} push={[1, 1.04]} pushAt={{ x: 1300, y: 600 }}
      cast={[on("floorRight", BOSS, f < 30 ? "sceptical" : shaking ? "worried" : "shocked", { dx: 360, held: <Watch />, pose: arm, look: { x: 0.6, y: -0.5 } })]} />
  );
};

/** Three shifts where there was one: the hall goes day, dusk, night with the robots spraying straight through. */
export const ThreeShifts: React.FC<{ t: ShotTime; each: number }> = ({ t, each }) => {
  const mood: MoodName = t.f < each ? "day" : t.f < 2 * each ? "dusk" : "night";
  return <PaintShopShot t={t} mood={mood} painters="robot" count={4} speed={3} push={[1, 1.06]} />;
};

/** "You'd think fifty machines means fifty fewer painters, and that's that": the boss up on the catwalk, sure of it,
 *  as the human painters walk out along the floor with their masks in their hands; the machines spray on. */
export const FewerPainters: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  return (
    <PaintShopShot t={t} mood="day" painters="robot" count={4} speed={2.2} push={[1, 1.05]}
      cast={[
        on("walk1", BOSS, "happy", { behind: true, dx: 120, facing: 1, pose: { ...STAND, tilt: Math.sin(f * 0.3) * 5, armF: [60, 100], armB: [-60, -100] }, look: { x: 0.4, y: 0.6 } }),
        ...[0, 1, 2].map((i) => on("floorRight", { ...painter(i), wear: [] }, "sad", {
          dx: 900 - f * 7 + i * 230, facing: -1, held: <MaskInHand s={1.2} />, pose: walkPose(f * 0.3 + i * 1.7), look: { x: 0.6, y: 0.3 },
        })),
      ]} />
  );
};
