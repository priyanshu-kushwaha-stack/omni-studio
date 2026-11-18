// Part A's diner scenes, staged on the foundation's DinerShot: the Monday morning with Marco on speaker, the first
// machine walking in on the chime and flipping a burger onto a bun, the lunch count, the waitress asking what it eats,
// Marco running in, the flip-off he loses, the new hires, the firing, the rush with the plant boss on stool four. Each
// takes the shot time and a few acting switches. World units (REF) for cast and props. No AI images.
import { runPose, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { BOSS, MARCO, MARCO_COAT, WAITRESS, worker, YOU, type Person } from "../Cast";
import { DinerShot, on, steelOn, type Face, type Member, type SteelMember } from "../Places";
import { AppPhone, arc, Burger, Pencil, Plate, PlatedBurger, SmallAppPhone, Spatula, spatulaTip } from "../Props";
import { COOK_POSE, robotHand, SERVE_POSE } from "../Robot";
import { ease, handAt, mix, ramp, type ShotTime } from "../util";
import { Buzz, CarKey, ChimeMark, OrderTick, Sparkle } from "./Bits";

const STAFF_Y = 900;
const COUNTER_TOP = 778;
/** You at the till, counting stools: the front arm steps one stool along every `every` frames. */
export const countPose = (f: number, every = 10): Pose => ({ ...STAND, armF: [52 + (Math.floor(f / every) % 5) * 7, 12] });
const SHRUG: Pose = { ...STAND, armF: [40, 115], armB: [-40, -115], drop: -4 };
const POINT: Pose = { ...STAND, armF: [96, 4] };
const PHONE_UP: Pose = { ...STAND, armF: [138, 18] };
/** A camera that holds you at the till, the waitress at the pass and the grill. */
export const TRIO: Camera = { x: 1150, y: 620, zoom: 1.3 };

const you = (face: Face, extra: Parameters<typeof on>[3] = {}): Member => on("till", YOU, face, { behind: true, ...extra });
/** A plain black diner phone (not the app). */
const DinerPhone: React.FC = () => <SmallAppPhone s={1.7} lit={false} />;

/** The steel cook at the grill: flipping on `f`, or holding still. */
const cook = (f: number, flip = true, extra: Partial<SteelMember> = {}): SteelMember =>
  steelOn("grill", { behind: true, held: "spatula", pose: COOK_POSE, toolAngle: -18, ...(flip ? { flip: f / 30, flipHeight: 180 } : { burger: true }), ...extra });

// ---- The App (morning) ---------------------------------------------------------------------------------------------

/** Monday, ten to twelve: the grill cold, you counting empty stools, the waitress holding the phone out at you. */
export const MorningCount: React.FC<{ t: ShotTime; cam?: string | Camera; you?: Face; waitress?: Face; look?: { x: number; y: number }; buzz?: number }> = ({
  t, cam = "wide", you: yf = "neutral", waitress = "sceptical", look, buzz = -1,
}) => (
  <DinerShot t={t} mood="morning" cam={cam as "wide"} grill="cold" clock={11.83} push={[1, 1.05]}
    cast={[
      you(yf, { pose: look ? STAND : countPose(t.f), look: look ?? { x: 0.8, y: 0.5 } }),
      on("pass", WAITRESS, waitress, { behind: true, held: <DinerPhone />, pose: { ...STAND, lean: -4, armF: [92, -6] }, look: { x: 0.7, y: 0 } }),
    ]}
    actors={buzz >= 0 && t.f >= buzz ? <Buzz x={710} y={762} f={t.f - buzz} s={0.8} /> : undefined} />
);

/** The first machine walks in on the chime (door camera); you look down at your phone, not up. */
export const RobotAtDoor: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const walk = ramp(f, 3, 40);
  return (
    <DinerShot t={t} mood="morning" cam="door" grill="cold" push={[1, 1.04]}
      options={{ door: ramp(f, 0, 4) * (1 - ramp(f, 30, 40)) * 0.9, chime: f >= 1 ? f - 1 : -1 }}
      cast={[you("sceptical", { phone: true, pose: { ...STAND, armF: [70, 60] }, look: { x: 0.3, y: 0.7 } })]}
      steel={[steelOn("door", { pose: walkPose(f * 0.38), dx: walk * 230, frame: f })]}
      actors={<ChimeMark x={170} y={380} f={f} at={1} s={1.4} />} />
  );
};

/** The steel cook takes the spatula and flips one burger in a perfect arc onto a bun; the waitress drops the phone and
 *  asks if it is on the payroll. Wide. */
export const FirstFlip: React.FC<{ t: ShotTime; askAt: number }> = ({ t, askAt }) => {
  const f = t.f;
  const r = { x: 1760, y: STAFF_Y, scale: 1, facing: -1 as const, pose: COOK_POSE };
  const hand = robotHand(r);
  const tip = spatulaTip(-18);
  const from = { x: hand.x - tip.x, y: hand.y + tip.y - 26 };
  const to = { x: 1440, y: COUNTER_TOP - 32 };
  const p = ramp(f, 8, 30);
  const landed = f >= 30;
  const drop = ramp(f, 22, 34);
  const phone = { x: 1080 - 150, y: mix(690, 790, drop * drop) };
  return (
    <DinerShot t={t} mood="morning" grill={f > 4 ? "hot" : "cold"} push={[1, 1.04]} pushAt={{ x: 1300, y: 640 }}
      cast={[
        you(f < askAt ? "shocked" : "sceptical", { pose: STAND, look: { x: 0.9, y: -0.2 } }),
        on("pass", WAITRESS, f < 34 ? "shocked" : f < askAt ? "afraid" : "sceptical", {
          behind: true, held: drop > 0 ? undefined : <DinerPhone />, pose: drop > 0 ? { ...STAND, armF: [70, 40], armB: [-30, -60] } : { ...STAND, armF: [80, 0] },
          facing: f < askAt ? 1 : -1, look: f < askAt ? { x: 0.8, y: -0.3 } : { x: 0.6, y: 0 },
        }),
      ]}
      steel={[steelOn("grill", { behind: true, held: "spatula", pose: COOK_POSE, toolAngle: f < 10 ? 20 : -18, burger: f < 8, frame: f })]}
      actors={
        <g>
          <Plate x={to.x} y={COUNTER_TOP + 2} />
          {!landed && f >= 8 && <Burger {...arc(p, from, to, 260)} s={0.72} rot={360 * ease(p)} />}
          {landed && <Burger x={to.x} y={to.y} s={0.72} />}
          <Sparkle x={to.x + 50} y={to.y - 50} f={f} at={30} />
          {drop > 0 && drop < 1 && <g transform={`translate(${phone.x} ${phone.y}) rotate(${drop * 200})`}><DinerPhone /></g>}
        </g>
      } />
  );
};

/** You, the waitress and the hot grill in one frame (the trio camera): "It is not." */
export const Trio: React.FC<{ t: ShotTime; you?: Face; waitress?: Face; youPose?: Pose; mood?: "morning" | "day" }> = ({
  t, you: yf = "happy", waitress = "sceptical", youPose = STAND, mood = "morning",
}) => (
  <DinerShot t={t} mood={mood} cam={TRIO} push={[1, 1.04]}
    cast={[you(yf, { pose: youPose, look: { x: 0.8, y: -0.1 } }), on("pass", WAITRESS, waitress, { behind: true, look: { x: 0.7, y: 0 } })]}
    steel={[cook(t.f)]} />
);

// ---- The Rule (morning, lunch) -------------------------------------------------------------------------------------

/** Twelve: the overalls fill the stools one by one while you count, one finger per stool. */
export const LunchFills: React.FC<{ t: ShotTime; every?: number }> = ({ t, every = 7 }) => {
  const f = t.f;
  const filled = Math.min(9, Math.floor(f / every) + 1);
  const seats = Array.from({ length: filled }, (_, k) => on(`stool${k + 1}`, worker(k), k % 3 ? "happy" : "neutral", { look: { x: 0.8, y: -0.2 } }));
  return (
    <DinerShot t={t} mood="morning" clock={12} crowd={0.7} gate={1} plates="some" push={[1, 1.05]}
      options={{ whistle: Math.max(0, 1 - f / 60), till: f > 70 && f < 84 ? 1 : 0, door: 0.6, chime: f % 30 }}
      cast={[you("happy", { pose: countPose(f, every), look: { x: 0.8, y: 0.4 } }), ...seats]}
      steel={[cook(f)]} />
  );
};

/** "Cheap.": you at the till with the phone up, smug; the waitress at the pass, eyebrows up. Counter camera. */
export const Cheap: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerShot t={t} mood="morning" cam="counter" push={[1, 1.05]}
    cast={[
      you("happy", { phone: true, pose: PHONE_UP, look: { x: 0.3, y: -0.6 } }),
      on("pass", WAITRESS, t.f < 12 ? "sceptical" : "shocked", { behind: true, look: { x: 0.8, y: 0 }, pose: { ...STAND, lean: -6 } }),
    ]}
    steel={[cook(t.f)]} />
);

/** The waitress leans in to the steel cook's screen: "What's it eat?" The arcs beam back. */
export const WhatsItEat: React.FC<{ t: ShotTime; close?: boolean }> = ({ t, close }) => (
  <DinerShot t={t} mood="morning" cam={close ? { x: 1730, y: 610, zoom: 2.7 } : { x: 1660, y: 600, zoom: 1.9 }} push={[1, close ? 1.08 : 1.04]}
    pushAt={close ? { x: 1180, y: 520 } : undefined}
    cast={[on("grill", WAITRESS, close ? "sceptical" : "sceptical", { behind: true, dx: -200, facing: 1, pose: { ...STAND, lean: 14 }, look: { x: 0.9, y: -0.1 } })]}
    steel={[cook(t.f)]} />
);

/** You shrug and go back to counting; the waitress still waits on an answer. Wide. */
export const Shrug: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  return (
    <DinerShot t={t} mood="morning" push={[1, 1.04]}
      cast={[
        you(f < 24 ? "relieved" : "neutral", { pose: f < 24 ? SHRUG : countPose(f), look: f < 24 ? { x: 0.9, y: -0.2 } : { x: 0.8, y: 0.5 } }),
        on("grill", WAITRESS, "sceptical", { behind: true, dx: -200, facing: 1, pose: { ...STAND, lean: f < 30 ? 14 : 4 }, look: { x: f < 30 ? 0.9 : -0.8, y: 0 } }),
      ]}
      steel={[cook(f)]} />
  );
};

/** Marco runs past the long window on his way in (window camera), his cough cured. */
export const MarcoRuns: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerShot t={t} mood="morning" cam="window" push={[1, 1.03]}
    options={{ outside: { who: MARCO_COAT, face: { brows: "raised", lids: 0, mouth: "open", eyes: 1.2, look: { x: 0.9, y: 0 } }, x: mix(1720, 380, t.p), pose: runPose(t.f * 0.5), facing: -1 } }} />
);

// ---- Fired (day) ---------------------------------------------------------------------------------------------------

/** The door bangs; Marco in his coat runs in, stops dead, and a burger flies over his head onto a bun. */
export const MarcoBurstsIn: React.FC<{ t: ShotTime; talkAt: number }> = ({ t, talkAt }) => {
  const f = t.f;
  const run = ease(ramp(f, 0, 20));
  const r = { x: 1760, y: STAFF_Y, scale: 1, facing: -1 as const, pose: COOK_POSE };
  const hand = robotHand(r);
  const tip = spatulaTip(-18);
  const from = { x: hand.x - tip.x, y: hand.y + tip.y - 26 };
  const to = { x: 820, y: COUNTER_TOP - 32 };
  const p = ramp(f, 24, 52);
  const b = arc(p, from, to, 420);
  return (
    <DinerShot t={t} mood="day" push={[1, 1.05]} pushAt={{ x: 1100, y: 640 }}
      options={{ door: f < 30 ? 1 : 1 - ramp(f, 30, 44), chime: f }}
      cast={[
        you("shocked", { look: { x: 0.9, y: 0.3 } }),
        on("floor", MARCO_COAT, f < 22 ? "afraid" : f < talkAt ? "shocked" : "determined", {
          dx: run * 680, pose: f < 20 ? runPose(f * 0.5) : f >= talkAt + 10 ? { ...POINT, armF: [104, -6] } : { ...STAND, drop: 3 + Math.abs(Math.sin(f * 0.3)) * 3 },
          look: f >= 24 && f < 54 ? { x: (b.x - 1000) / 600, y: -0.9 } : { x: 0.9, y: -0.2 },
        }),
      ]}
      steel={[steelOn("grill", { behind: true, held: "spatula", pose: COOK_POSE, toolAngle: -18, burger: f < 24, frame: f })]}
      actors={
        <g>
          <Plate x={to.x} y={COUNTER_TOP + 2} />
          {f >= 24 && <Burger x={b.x} y={b.y} s={0.72} rot={p < 1 ? 720 * p : 0} />}
          <Sparkle x={to.x + 50} y={to.y - 50} f={f} at={52} />
        </g>
      } />
  );
};

const SHOWDOWN: Camera = { x: 1640, y: 600, zoom: 1.55 };

/** The flip-off: Marco squares up beside the cook with the second spatula; two burgers go up; the cook's lands dead
 *  centre on its bun, Marco's lands on Marco. */
export const FlipOff: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const r = { x: 1590, y: STAFF_Y, scale: 1, facing: -1 as const, pose: COOK_POSE };
  const rh = robotHand(r);
  const rt = spatulaTip(-18);
  const rFrom = { x: rh.x - rt.x, y: rh.y + rt.y - 26 };
  const rTo = { x: 1380, y: COUNTER_TOP - 32 };
  const mPose: Pose = f < 14 ? { ...STAND, armF: [60, 40] } : { ...STAND, lean: -3, armF: [118 + (f > 20 && f < 26 ? 20 : 0), 40] };
  const mx = 1830;
  const mh = handAt(mx, STAFF_Y, 1, mPose, -1);
  const mt = spatulaTip(-40);
  const mFrom = { x: mh.x - mt.x, y: mh.y + mt.y - 22 };
  const head = { x: mx - 6, y: STAFF_Y - 264 - 60 };
  const rp = ramp(f, 20, 44);
  const up = ramp(f, 20, 38), down = ramp(f, 38, 54);
  const apex = { x: 1700, y: 300 };
  const m = f < 38 ? arc(up, mFrom, apex, 30) : { x: mix(apex.x, head.x, down), y: apex.y + (head.y - apex.y) * down * down };
  const mFace: Face = f < 20 ? "determined" : f < 54 ? "shocked" : f < 64 ? "afraid" : "sad";
  return (
    <DinerShot t={t} mood="day" cam={SHOWDOWN} push={[1, 1.04]}
      cast={[on("grill", MARCO, mFace, { behind: true, dx: mx - 1760, pose: mPose, held: <Spatula angle={-40} />, look: f >= 20 && f < 54 ? { x: -0.2, y: -1 } : { x: 0.8, y: 0 } })]}
      steel={[steelOn("grill", { behind: true, dx: r.x - 1760, held: "spatula", pose: COOK_POSE, toolAngle: -18, burger: f < 20, frame: f })]}
      actors={
        <g>
          <Plate x={rTo.x} y={COUNTER_TOP + 2} />
          {f >= 20 && <Burger {...(f < 44 ? arc(rp, rFrom, rTo, 240) : rTo)} s={0.72} rot={f < 44 ? 360 * ease(rp) : 0} />}
          <Sparkle x={rTo.x + 52} y={rTo.y - 52} f={f} at={44} />
          {f >= 20 && f < 54 && <Burger x={m.x} y={m.y} s={0.72} rot={f * 31} />}
          {f >= 54 && <Burger x={head.x} y={head.y + (f < 58 ? 6 : 0)} s={0.72} rot={-14} />}
          {f >= 54 && f < 64 && [0, 1, 2].map((i) => (
            <circle key={i} cx={head.x - 70 + i * 70} cy={head.y - 30 - (f - 54) * 3} r={8} fill={PAPER} stroke={INK} strokeWidth={3} />
          ))}
        </g>
      } />
  );
};

const HIRES: Camera = { x: 1450, y: 600, zoom: 1.45 };

/** The phone in the corner as you type the next job (screen-space inset, top left). */
const Inset: React.FC<{ f: number; job: string; until: number }> = ({ f, job, until }) => {
  if (f > until) return null;
  const k = ease(ramp(f, 0, 5)) * (1 - ramp(f, until - 5, until));
  return (
    <g opacity={k}>
      <AppPhone x={250} y={mix(420, 340, k)} s={0.4} rot={-6} mode="app" job={job} typed={f / 1.4} value={0.02} frame={f} />
    </g>
  );
};

/** WAITRESS: the door chimes and a steel waitress walks in behind the counter and takes four orders with no pad. */
export const SteelWaitress: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const walk = ease(ramp(f, 12, 30));
  const seated = [5, 6, 7, 8].map((n, k) => on(`stool${n}`, worker(k + 2), "happy", { look: { x: -0.6, y: -0.2 } }));
  return (
    <DinerShot t={t} mood="day" push={[1, 1.04]}
      options={{ door: f >= 10 && f < 26 ? 0.9 : 0, chime: f >= 10 ? f - 10 : -1 }}
      cast={[you("happy", { phone: true, pose: { ...STAND, armF: [70, 60] }, look: { x: 0.3, y: 0.7 } }), ...seated,
        on("grill", MARCO, "sad", { behind: true, dx: 60, pose: { ...STAND, armF: [150, 30] }, look: { x: -0.5, y: -0.6 } })]}
      steel={[cook(f, true, { dx: -170 }), steelOn("till", { behind: true, dx: mix(-460, 560, walk), facing: 1, pose: f < 30 ? walkPose(f * 0.45) : SERVE_POSE, role: "WAITER", frame: f })]}
      actors={
        <g>
          <ChimeMark x={170} y={380} f={f} at={10} s={1.3} />
          <Burger x={1830} y={STAFF_Y - 330} s={0.72} rot={-14} />
          {[5, 6, 7, 8].map((n, k) => <OrderTick key={n} x={520 + (n - 1) * 172} y={620} f={f} at={32 + k * 3} />)}
        </g>
      }
      overlay={<Inset f={f} job="WAITRESS" until={20} />} />
  );
};

/** A plate held face on, so clean it shows the waitress's face. */
const ShinyPlate: React.FC<{ f: number }> = ({ f }) => (
  <g transform="translate(10 -50)">
    <circle r={58} fill="#fbfdff" stroke={INK} strokeWidth={5} />
    <circle r={40} fill="none" stroke="#dfe8ee" strokeWidth={4} />
    <circle cx={4} cy={4} r={20} fill="#f6c09a" opacity={0.75} />
    <path d="M-36 -22 L-10 -48" stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.8 + 0.2 * Math.sin(f)} />
  </g>
);

/** DISHWASHER: a steel dishwasher holds up a plate so clean the waitress sees herself and screams; Marco wipes the
 *  burger off his hat and looks from the machines to you to his spatula. */
export const Dishwasher: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const lift = ease(ramp(f, 8, 18));
  const look = f < 24 ? { x: -0.9, y: 0 } : f < 34 ? { x: -0.9, y: -0.4 } : { x: 0.2, y: 0.9 };
  return (
    <DinerShot t={t} mood="day" cam={HIRES} push={[1, 1.04]}
      cast={[
        on("pass", WAITRESS, f < 20 ? "sceptical" : "afraid", { behind: true, dx: 40, facing: 1, pose: f < 20 ? STAND : { ...STAND, lean: -8, armF: [150, 50], armB: [-150, -50] }, look: { x: 0.9, y: -0.2 } }),
        on("grill", MARCO, f < 34 ? "sad" : "worried", { behind: true, dx: 60, held: <Spatula angle={f < 34 ? -60 : 40} />, pose: f < 24 ? { ...STAND, armF: [158 - (f % 8) * 4, 40] } : { ...STAND, armF: [60, 30] }, look }),
      ]}
      steel={[
        cook(f, true, { dx: -170 }),
        steelOn("pass", { behind: true, dx: 230, facing: -1, pose: { ...STAND, armF: [mix(40, 150, lift), mix(30, 10, lift)] }, held: <ShinyPlate f={f} />, role: "DISHES", frame: f }),
      ]}
      actors={
        <g>
          <Sparkle x={1400} y={420} f={f} at={18} s={1.2} />
          {f < 26 && <Burger x={1832} y={STAFF_Y - 330 + (f > 16 ? (f - 16) * 6 : 0)} s={0.72} rot={-14 + (f > 16 ? (f - 16) * 8 : 0)} />}
          {f >= 22 && [0, 1, 2].map((i) => (
            <path key={i} d={`M${1080 + 40 * Math.cos(-2.2 + i * 0.5)} ${520 + 40 * Math.sin(-2.2 + i * 0.5)} l${-30 + i * 20} ${-40 + i * 6}`} stroke={INK} strokeWidth={6} strokeLinecap="round" opacity={Math.floor(f / 3) % 2 ? 1 : 0.5} />
          ))}
        </g>
      }
      overlay={<Inset f={f} job="DISHWASHER" until={16} />} />
  );
};

/** "It can't even taste it!": Marco, close, spatula jabbing at the cook. */
export const MarcoRants: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const jab = Math.sin(f * 0.35) > 0 ? 8 : -6;
  return (
    <DinerShot t={t} mood="day" cam={{ x: 1730, y: 620, zoom: 2.1 }} push={[1, 1.05]} pushAt={{ x: 1100, y: 520 }}
      cast={[on("grill", MARCO, "determined", { behind: true, dx: 60, held: <Spatula angle={-10} />, pose: { ...STAND, lean: -6, armF: [100 + jab, 0] }, look: { x: 0.9, y: -0.1 } })]}
      steel={[cook(f, true, { dx: -170 })]} />
  );
};

/** You fire all three: Marco and the waitress walk out past the stools to the door; you point the way. Three machines
 *  work behind you. */
export const Walkout: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const x = mix(1150, 250, ease(t.p));
  return (
    <DinerShot t={t} mood="day" push={[1, 1.04]} options={{ door: t.p > 0.75 ? 0.8 : 0, chime: t.p > 0.75 ? f - Math.round(t.dur * 0.75) : -1 }}
      cast={[
        you("determined", { facing: -1, pose: POINT, look: { x: 0.9, y: 0.3 } }),
        on("floor", MARCO_COAT, "sad", { dx: x - 320, facing: -1, pose: walkPose(f * 0.3) }),
        on("floor", WAITRESS, "sad", { dx: x - 320 + 190, facing: -1, pose: walkPose(f * 0.3 + 1.6) }),
      ]}
      steel={[cook(f), steelOn("pass", { behind: true, pose: SERVE_POSE, role: "WAITER", frame: f }), steelOn("cook3", { behind: true, dx: 0, pose: { ...STAND, armF: [70, 40] }, role: "DISHES", frame: f })]} />
  );
};

/** The dishwasher who left last year: the door swinging shut on nobody, his old apron on its hook, a cobweb. */
export const EmptyHook: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  return (
    <DinerShot t={t} mood="day" cam="door" push={[1, 1.06]} pushAt={{ x: 1000, y: 500 }} options={{ door: 0.6 * (1 - ramp(f, 0, 16)), chime: f }}
      actors={
        <g>
          <circle cx={380} cy={520} r={7} fill={INK} />
          <path d="M350 528 L410 528 L420 640 Q380 660 340 640 Z" fill="#cfc6b0" stroke={INK} strokeWidth={4} />
          <path d="M360 528 Q380 500 400 528" fill="none" stroke={INK} strokeWidth={3} />
          {[0, 1, 2].map((i) => <circle key={i} cx={356 + i * 22} cy={590 + (i % 2) * 20} r={5} fill="#9a8f78" opacity={0.6} />)}
          <g stroke="#fff" strokeWidth={2} opacity={0.75} fill="none">
            <path d="M300 430 L360 430 M300 430 L300 490 M300 430 L350 480 M318 430 Q312 448 300 448 M338 430 Q326 466 300 470" />
          </g>
        </g>
      } />
  );
};

/** The steel cook alone at the grill, perfect arc after perfect arc (grill camera). */
export const FlippyGrill: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerShot t={t} mood="day" cam={{ x: 1640, y: 560, zoom: 1.8 }} push={[1, 1.06]}
    steel={[cook(t.f, true, { flipHeight: 230 })]} />
);

/** The whole machine crew at work behind the counter. */
export const Crew: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const slide = (f * 16) % 900;
  return (
    <DinerShot t={t} mood="day" cam={HIRES} push={[1.02, 1.06]} plates="some"
      steel={[cook(f, true, { dx: -170 }), steelOn("pass", { behind: true, dx: 40, pose: SERVE_POSE, role: "WAITER", frame: f }),
        steelOn("pass", { behind: true, dx: 280, facing: 1, pose: { ...STAND, armF: [60 + 30 * Math.abs(Math.sin(f * 0.15)), 30] }, role: "DISHES", frame: f })]}
      actors={<PlatedBurger x={1900 - slide} y={COUNTER_TOP - 12} />} />
  );
};

/** "Money out is money out. Simple.": you at the till, pleased, the pencil up. Counter camera. */
export const Smug: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerShot t={t} mood="day" cam="counter" push={[1, 1.05]}
    cast={[you("happy", { pose: { ...STAND, armF: [120 + 8 * Math.sin(t.f * 0.3), 50] }, held: <Pencil s={0.5} rot={-110} />, look: { x: 0.8, y: -0.2 } })]}
    steel={[steelOn("pass", { behind: true, pose: SERVE_POSE, role: "WAITER", frame: t.f })]}
    actors={<rect x={760} y={COUNTER_TOP - 2} width={130} height={8} rx={3} fill="#fbf7ee" stroke={INK} strokeWidth={2} />} />
);

const lunchSeats = (boss: Face, bossPose?: Pose, bossHeld?: React.ReactNode, bossLook?: { x: number; y: number }): Member[] => [
  ...[1, 2, 3, 5, 6, 7, 8, 9].map((n, k) => on(`stool${n}`, worker(k), k % 3 ? "happy" : "neutral", { look: { x: 0.6, y: -0.3 } })),
  on("stool4", BOSS, boss, { pose: bossPose, held: bossHeld, look: bossLook ?? { x: 0.7, y: -0.4 } }),
];

/** The rush: the whistle, the overalls across the road, forty stools fed by the three machines in one chain, the till
 *  pinging; the plant boss on stool four, mouth open; Marco outside the window, still looking for his hat. */
export const Rush: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const slide = (f * 22) % 1500;
  const hatless: Person = { ...MARCO_COAT, wear: [] };
  return (
    <DinerShot t={t} mood="day" plates="some" crowd={1} gate={1} push={[1, 1.05]}
      options={{ whistle: 1, till: f % 16 < 6 ? 1 : 0, outside: { who: hatless, face: { brows: "worry", lids: 0, mouth: "wobble", eyes: 1, look: { x: f % 40 < 20 ? -0.8 : 0.8, y: 0.4 } }, x: 1330 } }}
      cast={[you("happy", { pose: { ...STAND, armF: [60, 70] }, look: { x: 0.2, y: 0.6 } }), ...lunchSeats("shocked")]}
      steel={[cook(f), steelOn("pass", { behind: true, pose: SERVE_POSE, role: "WAITER", frame: f }), steelOn("cook3", { behind: true, pose: { ...STAND, armF: [60 + 30 * Math.abs(Math.sin(f * 0.2)), 30] }, role: "DISHES", frame: f })]}
      actors={<PlatedBurger x={1900 - slide} y={COUNTER_TOP - 12} />} />
  );
};

/** "Where'd you get the cooks?": the boss on stool four, low along the stools. */
export const BossAsks: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerShot t={t} mood="day" cam="stools" plates="some" push={[1, 1.05]} pushAt={{ x: 760, y: 420 }}
    cast={lunchSeats(t.f < 10 ? "shocked" : "sceptical", undefined, undefined, { x: -0.8, y: -0.1 })}
    steel={[steelOn("pass", { behind: true, pose: SERVE_POSE, role: "WAITER", frame: t.f })]} />
);

/** You hold up the phone; the boss reads the tile and his hand goes up, holding a car key, as if to rent one. */
export const ShowPhone: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const up = ease(ramp(f, 14, 26));
  return (
    <DinerShot t={t} mood="day" cam="counter" plates="some" push={[1, 1.05]}
      cast={[you("happy", { pose: { ...STAND, armF: [mix(90, 140, ease(ramp(f, 0, 8))), 20] }, held: <SmallAppPhone s={2.2} />, look: { x: 0.9, y: 0 } }),
        ...lunchSeats(f < 14 ? "sceptical" : "shocked", { ...STAND, armF: [mix(25, 165, up), mix(35, 10, up)], armB: [10, 25], legB: [88, -88], legF: [92, -92] }, up > 0.3 ? <CarKey s={1.3} /> : undefined, { x: -0.9, y: -0.3 })]} />
  );
};

/** The plant across the road through the long window, the camera pushing in on it. */
export const PlantView: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerShot t={t} mood="day" cam="window" push={[1, 1.12]} pushAt={{ x: 900, y: 360 }} options={{ gate: 0.3 }} />
);
