// Part C's acted scenes (The Cheque to Stool Four), each a component of the shot's time: the cheque queue in the
// square, the street's three keepers, the plumber's car and the apprentice, the town marching, the hammers raised and
// lowered, the pan past the stranger, the boss in the doorway, Marco's burger, the machines filing out, the truck, the
// bank and the gate, the boss's napkin, the money going round, the steel customer's burger to go, and the last image.
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { runPose, SEATED, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { MoodName } from "@whatif/kit/stage/moods";
import { CRIMSON, INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { BANKER, BOSS, MARCO, MARCO_COAT, MAYOR, PLUMBER, RIVAL, STRANGER, townsfolk, WAITRESS, worker, YOU, type Person } from "../Cast";
import { DinerShot, on, Place, steelOn, type Face, type Member } from "../Places";
import { Burger, CashFan, Cheque, Napkin, Pie, Plate, PlatedBurger, SmallAppPhone, Spatula, Wrench } from "../Props";
import { COOK_POSE, Robot, SPRAY_POSE } from "../Robot";
import { Tile, type ShotTime } from "../util";
import { act, BED_Y, blend, Car, FOLDED, HAND_UP, mix, POINT, RAISED, ramp, REACH, SHRUG, Truck, wave } from "./kit";
import { APPRENTICE, Chirp, cooksAtPass, crowd, Extras, FlapCounter, MARCO_X, stoolsFilled, WalkingRobot, type Extra } from "./Rooms";
import { town, TOWN } from "./Town";

const lerpCam = (a: Camera, b: Camera, t: number): Camera => ({ x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), zoom: mix(a.zoom, b.zoom, t) });
const TOWN_CAM = town.cameras;

/** Scissors, held at the origin, blades up; `snip` 0..1 closes them. */
export const Scissors: React.FC<{ s?: number; snip?: number }> = ({ s = 1, snip = 0 }) => (
  <g transform={`scale(${s}) rotate(-20)`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round">
    <circle cx={-12} cy={12} r={10} fill={CRIMSON} /><circle cx={12} cy={12} r={10} fill={CRIMSON} />
    <path d={`M-6 4 L${10 - 8 * snip} -46 M6 4 L${-10 + 8 * snip} -46`} stroke="#c9d3da" strokeWidth={7} />
  </g>
);

/** A paper folder under the arm. */
const Folder = () => <g transform="rotate(-10)"><rect x={-40} y={-30} width={80} height={60} rx={4} fill={MUSTARD} stroke={INK} strokeWidth={4} /><rect x={-40} y={-30} width={30} height={10} fill="#d9a02a" /></g>;
/** Two fingers up (the banker's "two"). */
const TwoFingers: React.FC<{ skin: string }> = ({ skin }) => (
  <g transform="rotate(180)"><rect x={-12} y={0} width={10} height={40} rx={5} fill={skin} stroke={INK} strokeWidth={3} /><rect x={2} y={0} width={10} height={44} rx={5} fill={skin} stroke={INK} strokeWidth={3} /></g>
);
/** A paper hat, held. */
const HatInHand = () => <path d="M-30 0 L30 0 L18 -34 L-18 -34Z" fill={PAPER} stroke={INK} strokeWidth={4} strokeLinejoin="round" />;
/** A takeaway bag. */
export const Bag = () => <g><rect x={-22} y={0} width={50} height={56} rx={5} fill="#c9a06a" stroke={INK} strokeWidth={4} /><path d="M-10 0 q15 -26 30 0" fill="none" stroke={INK} strokeWidth={4} /></g>;

/** Marco at the front of the crowd with his wrench (down). */
const marcoIn = (face: Face, look = { x: 0.3, y: -0.6 }): Extra => ({
  who: { ...MARCO, coat: "#3d6fb0", wear: [{ kind: "paperHat", tilt: 28 }, { kind: "wrench" }] }, x: MARCO_X, y: 1078, s: 1.1, facing: -1, face, look,
});

/** Marco with his paper hat on straight, for once. */
const MARCO_STRAIGHT: Person = { ...MARCO, wear: [{ kind: "paperHat", tilt: 0 }] };
/** Marco in his street coat, his paper hat in his hand. */
const MARCO_HATLESS: Person = { ...MARCO_COAT, wear: [] };

// ---- The Cheque -----------------------------------------------------------------------------------------------------

/** You at the till at night, the drawer open, pulling out the takings to give back. */
export const TillCash: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const lift = act(f, 12, 34);
  return (
    <DinerShot t={t} mood="lamp" cam="counter" robots={4} grill="cold" options={{ flip: false, till: act(f, 2, 10) }} push={[1.02, 1.08]}
      cast={[on("till", YOU, lift > 0.5 ? "determined" : "neutral", { behind: true, pose: blend(REACH, HAND_UP, lift), held: lift > 0.2 ? <CashFan s={1.3} n={5} /> : undefined, look: { x: 0.8, y: -0.3 } })]}
      steel={[steelOn("stool4", { cap: CRIMSON, glow: 1 })]}
      actors={<Pie x={1036} y={778} s={0.9} />} />
  );
};

/** The cheque table in the square: you behind it signing; the mayor first in line, her steel assistant behind her
 *  holding her sash straight; the town in a line behind them. */
export const ChequeTable: React.FC<{ t: ShotTime; focus?: "write" | "doubt" | "mayor" | "rival" }> = ({ t, focus = "write" }) => {
  const f = t.f;
  const sign = focus === "write" ? ramp(f, 8, 40) : 1;
  const give = focus === "write" ? act(f, 44, 60) : 0;
  const taken = focus === "mayor" || focus === "rival" || (focus === "write" && f > 62);
  const queue: Member[] = [2, 4, 5, 6].map((q, i) => on(`q${q}`, i % 2 ? townsfolk(i + 2) : worker(i + 1), i % 2 ? "happy" : "neutral", { look: { x: 0.8, y: -0.1 } }));
  // the rival in the line: the rent is hers ("Mine.")
  const rival = on("q3", RIVAL, focus === "rival" ? "sad" : focus === "mayor" ? "worried" : "neutral", {
    pose: focus === "rival" ? { ...STAND, armF: [30, -105 + 8 * Math.sin(f * 0.3)] } : STAND, look: focus === "rival" ? { x: 0.6, y: 0.2 } : { x: 0.8, y: -0.1 },
  });
  const youPose = focus === "doubt" ? { ...SHRUG, armF: [70, 60] as [number, number] } : blend({ ...STAND, armF: [70, 50] }, REACH, give);
  const youFace: Face = focus === "doubt" ? "sceptical" : focus === "mayor" ? "neutral" : focus === "rival" ? "worried" : sign < 1 ? "determined" : "happy";
  const mayor = on("q1", MAYOR, focus === "mayor" ? "sceptical" : taken ? "happy" : "neutral", {
    pose: focus === "mayor" ? { ...STAND, armF: [50, 100 + 10 * Math.sin(f * 0.4)] } : focus === "rival" ? STAND : taken ? wave(f) : blend(STAND, REACH, act(f, 50, 62)),
    held: taken && focus !== "mayor" ? <Cheque s={0.2} rot={10} /> : undefined, facing: focus === "rival" ? 1 : undefined,
    look: focus === "mayor" || focus === "rival" ? { x: 0.8, y: 0 } : undefined,
  });
  const cam = focus === "mayor" ? { x: 470, y: 720, zoom: 2.0 } : focus === "rival" ? { x: 640, y: 720, zoom: 1.9 } : "table";
  return (
    <Place t={t} set={town} mood="day" cam={cam} options={{ table: true, stack: 1 - 0.1 * ramp(f, 40, 60) }} push={focus === "write" ? [1, 1.06] : [1, 1.04]}
      cast={[
        on("table", YOU, youFace, { behind: true, pose: youPose, held: !taken ? <Cheque s={0.2} rot={-10} signed={sign} /> : undefined, look: focus === "doubt" ? { x: 0.3, y: -0.3 } : focus === "rival" ? { x: 0.9, y: 0 } : { x: 0.8, y: 0.3 } }),
        mayor, rival,
        ...queue,
      ]}
      actors={<Robot x={600} y={1000} scale={0.95} facing={-1} pose={{ ...STAND, armF: [82, 14 + 6 * Math.sin(f * 0.2)] }} frame={f} />} />
  );
};

/** The line moving up: each in turn takes a cheque and walks off waving it. `phone` lays your phone on the table
 *  pinging (the app paying you, paid out as the town's cheque). */
export const ChequeQueue: React.FC<{ t: ShotTime; mood?: MoodName; phone?: boolean }> = ({ t, mood = "day", phone }) => {
  const f = t.f;
  const every = 22;
  const served = Math.floor((f - 6) / every);
  const people: Extra[] = Array.from({ length: 8 }, (_, j) => {
    const turn = 6 + j * every;
    const who = j % 3 === 0 ? worker(j) : j % 3 === 1 ? townsfolk(j) : { ...worker(j + 4), coat: "#c97a5a" };
    if (f >= turn + 8) {
      const w = f - turn - 8;
      return { who, x: 470 + w * 7, y: 1050 - Math.min(110, w * 4), s: 1.05 - Math.min(0.25, w * 0.009), face: "happy" as Face, facing: 1 as const, pose: { ...walkPose(f * 0.3 + j), armF: [150 + Math.sin(f * 0.5) * 12, 18] as [number, number] } };
    }
    const slot = Math.max(0, j - Math.max(0, served));
    return { who, x: 480 + slot * 175, y: 1050, s: 1.05, face: slot === 0 ? "happy" as Face : "neutral" as Face, facing: -1 as const, pose: slot === 0 ? REACH : STAND };
  });
  const handing = ((f - 6) % every) / every;
  const ping = phone ? (f % 30) / 30 : 0;
  return (
    <Place t={t} set={town} mood={mood} cam="queue" options={{ table: true, stack: 0.7 }} push={[1, 1.05]}
      cast={[on("table", YOU, "happy", { behind: true, pose: blend(STAND, REACH, Math.sin(handing * Math.PI)), held: <Cheque s={0.2} rot={-10} />, look: { x: 0.8, y: 0 } })]}
      actors={
        <g>
          <Extras people={people} frame={f} />
          {phone && (
            <g transform={`translate(${TOWN.table.x - 110} ${TOWN.table.top - 4})`}>
              <SmallAppPhone faceUp s={2} />
              <circle cx={0} cy={-20} r={20 + 50 * ping} fill="none" stroke={MUSTARD} strokeWidth={6} opacity={1 - ping} />
            </g>
          )}
        </g>
      } />
  );
};

/** The whistle and the stools filling for the week: Marco on stool two eating with his hat on straight, the cooks
 *  flipping, the till pinging, the split-flap counter on the wall counting stools to forty as you count with a finger. */
export const StoolsFill: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const n = mix(0, 13, ramp(f, 4, 62));
  const { cast, clinks } = stoolsFilled(n, (i) => (i === 0 ? MARCO_STRAIGHT : worker(i + 1)), 2);
  const count = Math.round(40 * ramp(f, 4, 70));
  const marco = cast[0];
  if (marco) cast[0] = { ...marco, pose: { ...SEATED, armF: [60, 112] }, who: { ...marco.who, held: <Burger s={0.5} /> } };
  return (
    <DinerShot t={t} mood="day" robots={4} plates="some" gate={1} crowd={1 - ramp(f, 40, 90)} options={{ whistle: 1 - ramp(f, 30, 70), till: (f % 20) / 20 > 0.6 ? 1 : 0, board: "blank" }}
      push={[1, 1.04]}
      cast={[on("till", YOU, f > 66 ? "happy" : "determined", { behind: true, pose: { ...POINT, armF: [80 + 10 * Math.sin(f * 0.6), 0] }, look: { x: 0.9, y: 0.2 } }), ...cast]}
      actors={<g>{clinks.map((c, i) => <Clink2 key={i} x={c.x} f={c.f} />)}</g>}
      overlay={<FlapCounter cam={{ x: 960, y: 540, zoom: 1 }} value={count} spin={(f % 6) / 6} />} />
  );
};
const Clink2: React.FC<{ x: number; f: number }> = ({ x, f }) => (
  <g opacity={1 - ramp(f, 0, 10)}>{[-40, 0, 40].map((a) => <line key={a} x1={x + a * 0.4} y1={860} x2={x + a} y2={830} stroke={PAPER} strokeWidth={6} strokeLinecap="round" />)}</g>
);

/** A week of lunches on the stools: full, the clock racing round. */
export const Week: React.FC<{ t: ShotTime }> = ({ t }) => {
  const { cast } = stoolsFilled(13, (i) => (i === 0 ? MARCO_STRAIGHT : worker(i + 1)), 2);
  return (
    <DinerShot t={t} mood="day" cam="stools" robots={4} plates="some" options={{ clock: 11 + t.f * 0.4 }} push={[1.04, 1]}
      cast={cast.map((m, i) => ({ ...m, pose: { ...SEATED, armF: [40 + 30 * Math.abs(Math.sin(t.f * 0.15 + i)), 80] }, who: { ...m.who, held: i % 2 ? <Burger s={0.45} /> : undefined } }))} />
  );
};

/** The stools empty again, one by one, the counter rolling back down; the robots keep flipping. */
export const StoolsEmpty: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const n = mix(13, 0, ramp(f, 4, 70));
  const { cast } = stoolsFilled(Math.ceil(n), (i) => (i === 0 ? MARCO_STRAIGHT : worker(i + 1)), 2);
  return (
    <DinerShot t={t} mood="day" robots={4} plates="pile" options={{ board: "blank" }} push={[1.03, 1]}
      cast={[on("till", YOU, f > 40 ? "worried" : "neutral", { behind: true, look: { x: 0.8, y: 0.2 } }), ...cast]}
      overlay={<FlapCounter cam={{ x: 960, y: 540, zoom: 1 }} value={Math.round(40 * n / 13)} spin={(f % 6) / 6} />} />
  );
};

/** The street of the three keepers, one long camera move: the square, the salon (chair full, a queue out of the door),
 *  the plumber by his van, the bar with the band. Cuts on the words by moving. */
export const Keepers: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const A: Camera = { x: 1500, y: 600, zoom: 1.02 };
  const SAL: Camera = { x: 1170, y: 560, zoom: 1.6 };
  const VAN: Camera = { x: 2380, y: 640, zoom: 1.45 };
  const BAR: Camera = { x: 2250, y: 560, zoom: 1.6 };
  const cam = f < 28 ? A : f < 46 ? lerpCam(A, SAL, act(f, 28, 46)) : f < 74 ? SAL : f < 90 ? lerpCam(SAL, VAN, act(f, 74, 90)) : f < 104 ? VAN : lerpCam(VAN, BAR, act(f, 104, 120));
  const queue: Extra[] = [0, 1, 2].map((i) => ({ who: worker(i + 5), x: 1330 + i * 70, y: TOWN.base + 10, s: 0.72, face: "neutral", facing: -1 }));
  return (
    <Place t={t} set={town} mood="day" cam={cam} options={{ salonFull: true, band: true, van: true }} push={[1, 1]}
      cast={[on("road", PLUMBER, "happy", { dx: 900, pose: f > 92 ? { ...STAND, armF: [110, -40] } : STAND, look: { x: 0.6, y: 0 } })]}
      actors={
        <g>
          <Extras people={queue} frame={f} />
          {f < 40 && <Cheque x={1500} y={200 + f * 9} s={0.18} rot={Math.sin(f * 0.2) * 30} />}
        </g>
      } />
  );
};

/** The band in the bar's window, close. */
export const Band: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={town} mood="day" cam={{ x: 2250, y: 520, zoom: 2.3 }} options={{ band: true, van: false }} push={[1, 1.06]} />
);

/** The plumber pulls up outside the diner in a car nicer than yours and takes his time getting out; behind him your old
 *  waitress writes a price three times the old one on the salon window, underlines it, and waves the scissors. */
export const PlumberCar: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const drive = act(f, 0, 32);
  const carX = mix(2400, 1820, drive);
  const out = act(f, 40, 62);
  const writing = ramp(f, 14, 66);
  return (
    <Place t={t} set={town} mood="day" cam={{ x: 1440, y: 640, zoom: 1.3 }} options={{ price: writing, salonFull: true }} push={[1, 1.04]}
      cast={[
        on("salonWin", APPRENTICE, f > 70 ? "happy" : "determined", {
          dx: 140, facing: -1,
          pose: f > 70 ? { ...STAND, armF: [118 + Math.sin(f * 0.45) * 14, 52] } : { ...STAND, armF: [132 + Math.sin(f * 0.8) * 6, 10] },
          held: <Scissors s={0.9} snip={f > 70 ? (Math.sin(f * 0.9) + 1) / 2 : 0} />, look: f > 70 ? { x: -0.2, y: 0 } : { x: 0.6, y: -0.4 },
        }),
      ]}
      actors={
        <g>
          <Car x={1230} y={TOWN.roadTop + 110} s={0.8} />
          <Car x={carX} y={TOWN.roadTop + 120} s={0.9} shiny door={out} />
          {out > 0 && (
            <Extras people={[{ who: PLUMBER, x: carX - 230 + 40 * out, y: TOWN.roadTop + 130, s: 0.88, facing: 1, face: "happy", pose: f > 64 ? { ...STAND, armF: [150, 30], armB: [-150, -30] } : STAND, look: { x: 0.4, y: -0.3 } }]} frame={f} />
          )}
        </g>
      } />
  );
};

/** Your old waitress at the salon: snipping, then waving the scissors at you. `close` frames her tighter. */
export const Apprentice: React.FC<{ t: ShotTime; close?: boolean }> = ({ t, close }) => {
  const f = t.f;
  const waving = close;
  return (
    <Place t={t} set={town} mood="day" cam={close ? { x: 1260, y: 560, zoom: 2.2 } : { x: 1200, y: 580, zoom: 1.65 }} options={{ price: 1, salonFull: true }}
      push={close ? [1, 1.05] : [1.04, 1]}
      cast={[on("salonWin", APPRENTICE, waving ? "happy" : "relieved", {
        dx: 140, facing: -1, pose: waving ? { ...STAND, armF: [118 + Math.sin(f * 0.45) * 14, 52] } : { ...STAND, armF: [100, 30] },
        held: <Scissors s={0.9} snip={(Math.sin(f * 0.9) + 1) / 2} />, look: waving ? { x: -0.1, y: 0 } : { x: 0.5, y: 0 },
      })]}
      actors={<Extras people={[0, 1].map((i) => ({ who: worker(i + 5), x: 1430 + i * 70, y: TOWN.base + 10, s: 0.72, face: "neutral" as Face, facing: -1 as const }))} frame={f} />} />
  );
};

// ---- Hammers ---------------------------------------------------------------------------------------------------------

/** The town marching down the street at night, hammers up, toward the diner. */
export const March: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const people: Extra[] = Array.from({ length: 12 }, (_, i) => {
    const row = i % 2;
    const x = 200 + (i >> 1) * 190 + f * 5 + row * 60;
    const who: Person = i === 5 ? { ...MARCO, wear: [{ kind: "paperHat", tilt: 28 }, { kind: "wrench" }] } : { ...townsfolk(i, i % 3 ? "hammer" : "wrench") };
    return { who, x, y: row ? 1060 : 990, s: row ? 1.05 : 0.9, face: "determined", facing: 1, pose: { ...walkPose(f * 0.3 + i), armF: [165, 8] } };
  });
  return (
    <Place t={t} set={town} mood="night" cam={{ x: 1000, y: 640, zoom: 1.15 }} push={[1, 1.05]} actors={<Extras people={people} frame={f} />} />
  );
};

/** The hammers over the counter: Marco raises the wrench over the nearest cook, the cook turns its beaming screen up
 *  and chirps, the wrench stops, the crowd looks at the screens, the hammers come down one by one; a painter at the back
 *  lowers his, raises it, lowers it again. */
export const Hammers: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const lean = 14 * act(f, 18, 26);
  const marcoUp = act(f, 0, 16) * (1 - act(f, 52, 70));
  const raise = (i: number) => {
    if (i === 0) return f < 46 ? 1 : f < 58 ? 1 - act(f, 46, 54) : f < 70 ? act(f, 58, 64) : 1 - act(f, 72, 80);
    return 1 - act(f, 40 + i * 3, 48 + i * 3);
  };
  const faces = (i: number): Face => (f > 44 + i * 3 ? "worried" : "determined");
  return (
    <DinerShot t={t} mood="lamp" lamps="all" cam={{ x: 1120, y: 640, zoom: 1.2 }} grill="cold" push={[1, 1.04]}
      cast={[on("till", YOU, "afraid", { behind: true })]}
      steel={cooksAtPass(4, lean)}
      actors={
        <g>
          <Extras people={[
            ...crowd(raise, faces, f > 30 ? { x: 0, y: -0.7 } : { x: 0.1, y: -0.5 }),
            { who: { ...MARCO, coat: "#3d6fb0", wear: [{ kind: "paperHat", tilt: 28 }, { kind: "wrench" }] }, x: MARCO_X, y: 1078, s: 1.1, facing: f > 34 && f < 50 ? 1 : -1,
              pose: blend(STAND, { ...RAISED, armF: [175, 4] }, marcoUp), face: f < 26 ? "determined" : f < 50 ? "shocked" : "worried", look: f > 30 && f < 50 ? { x: 0.8, y: 0 } : { x: 0.3, y: -0.8 } },
          ]} frame={f} />
          <Chirp x={960 + 14} y={630} f={f - 24} />
        </g>
      } />
  );
};

/** The beaming screen, close, and Marco under it with the wrench down. */
export const SmilingFace: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerShot t={t} mood="lamp" lamps="all" cam={{ x: 1010, y: 640, zoom: 2.0 }} grill="cold" push={[1, 1.07]}
    steel={cooksAtPass(4, 10)}
    actors={
      <g>
        <Extras people={[
          ...crowd(() => 0, () => "worried", { x: 0, y: -0.7 }),
          { who: { ...MARCO, coat: "#3d6fb0", wear: [{ kind: "paperHat", tilt: 28 }, { kind: "wrench" }] }, x: MARCO_X, y: 1078, s: 1.1, facing: -1, pose: { ...STAND, armF: [20, 20] }, face: "relieved", look: { x: 0.3, y: -0.9 } },
        ]} frame={t.f} />
        <Chirp x={974} y={630} f={t.f - 30} />
      </g>
    } />
);

/** The pan along the crowd toward the door: it passes a crimson head in a long coat at the back, the only one holding
 *  nothing, and doesn't come back; the door opens as the camera arrives. */
export const PastStranger: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const cam: Camera = { x: mix(1500, 20, act(f, 0, t.dur - 6)), y: 700, zoom: 1.8 };
  const door = act(f, t.dur - 26, t.dur - 8);
  return (
    <DinerShot t={t} mood="lamp" lamps="all" cam={cam} grill="cold" push={[1, 1]} options={{ door, chime: door > 0 ? f - (t.dur - 26) : -1 }}
      steel={cooksAtPass(4, 0)}
      actors={<Extras people={[
        ...crowd(() => 0, (i) => (i % 2 ? "worried" : "sad"), { x: 0, y: -0.5 }),
        { who: STRANGER, x: 620, y: 990, s: 0.92, facing: 1, face: "neutral", look: { x: 0, y: 0 } },
        marcoIn("sad"),
      ]} frame={f} />} />
  );
};

/** The plant boss in the doorway, coat on, folder under his arm; he points out at the road (the plant two towns over),
 *  then taps the folder (the board meets Friday). `wide` shows the crowd turned to him. */
export const BossDoor: React.FC<{ t: ShotTime; wide?: boolean }> = ({ t, wide }) => {
  const f = t.f;
  const pointing = !wide && f > 40 && f < 92;
  const boss = on("door", { ...BOSS, wear: [{ kind: "longCoat", color: "#4a4e5e" }] }, wide ? "determined" : f < 40 ? "neutral" : "sceptical", {
    pose: pointing ? { ...POINT, armF: [96, -6], armB: [20, -100] } : { ...STAND, armF: [20, -100], armB: [-8, 10] },
    held: pointing ? undefined : <Folder />, look: pointing ? { x: -0.8, y: 0 } : { x: 0.6, y: 0 }, facing: pointing ? -1 : 1, dx: 20,
  });
  return (
    <DinerShot t={t} mood="lamp" lamps="all" cam={wide ? { x: 900, y: 620, zoom: 1.1 } : { x: 300, y: 650, zoom: 1.9 }} grill="cold" push={wide ? [1.04, 1] : [1, 1.05]}
      options={{ door: 0.8 }} cast={[boss]} steel={cooksAtPass(4, 0)}
      actors={<Extras people={[...crowd(() => 0, () => (wide ? "worried" : "sceptical"), { x: -0.9, y: 0 }).map((p) => ({ ...p, facing: -1 as const })), marcoIn("worried", { x: 0.9, y: 0 })]} frame={f} />} />
  );
};

/** The crowd standing with the hammers down (PROBLEM THREE). */
export const Standoff: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerShot t={t} mood="lamp" lamps="all" cam={{ x: 1060, y: 600, zoom: 1.08 }} grill="cold" push={[1.05, 1]} steel={cooksAtPass(4, 0)}
    cast={[on("till", YOU, "worried", { behind: true })]}
    actors={<Extras people={[...crowd(() => 0, (i) => (i % 3 ? "sad" : "worried"), { x: 0.3, y: 0.4 }),
      { who: { ...MARCO, coat: "#3d6fb0", wear: [{ kind: "paperHat", tilt: 28 }, { kind: "wrench" }] }, x: MARCO_X, y: 1078, s: 1.1, facing: -1, face: "sad" }]} frame={t.f} />} />
);

/** Marco puts the wrench on the counter and sits on stool two; the cook flips a burger onto a bun; you slide the plate
 *  to him. */
export const MarcoSits: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const sat = f > 22;
  const flip = ramp(f, 28, 50);
  const slide = act(f, 56, 80);
  const plateX = mix(960, 740, slide);
  return (
    <DinerShot t={t} mood="lamp" lamps="all" cam="counter" grill="hot" push={[1, 1.05]}
      cast={[
        on("till", YOU, "neutral", { behind: true, pose: slide > 0 && slide < 1 ? REACH : STAND, look: { x: 0.8, y: 0.3 } }),
        ...(sat ? [on("stool3", { ...MARCO, coat: "#3d6fb0" }, "sad", { look: { x: -0.7, y: -0.4 } })] : []),
      ]}
      steel={[steelOn("cook1", { behind: true, held: "spatula", pose: COOK_POSE, toolAngle: -18, flip: f > 28 && f < 50 ? flip * 0.999 : undefined })]}
      actors={
        <g>
          {!sat && <Extras people={[{ who: { ...MARCO, coat: "#3d6fb0", wear: [{ kind: "paperHat", tilt: 28 }] }, x: mix(1060, 900, act(f, 0, 18)), y: 1078, s: 1.1, facing: -1, pose: f < 10 ? REACH : walkPose(f * 0.3), face: "sad" }]} frame={f} />}
          <g transform="translate(560 786) rotate(-80)"><Wrench s={0.6} /></g>
          {f > 46 && <PlatedBurger x={plateX} y={778} s={1} />}
        </g>
      } />
  );
};

/** Marco at the counter with the burger: he says his line (`eat` false), then looks, eats, points the half burger at the
 *  cook's beaming screen and shrugs: not bad. */
export const MarcoEats: React.FC<{ t: ShotTime; eat?: boolean }> = ({ t, eat }) => {
  const f = t.f;
  const bite = eat && f > 24;
  const pose: Pose = !eat ? { ...SEATED, armF: [30, 40] } : f < 24 ? { ...SEATED, armF: [40, 60] } : f < 50 ? { ...SEATED, armF: [60, 112] } : f < 68 ? { ...SEATED, armF: [100, -20] } : { ...SHRUG, legB: SEATED.legB, legF: SEATED.legF };
  const face: Face = !eat ? "sad" : f < 24 ? "sad" : f < 50 ? "relieved" : "happy";
  return (
    <DinerShot t={t} mood="lamp" lamps="all" cam={{ x: 840, y: 690, zoom: 2.25 }} grill="hot" push={eat ? [1.02, 1.06] : [1, 1.04]}
      cast={[on("stool3", { ...MARCO, coat: "#3d6fb0" }, face, {
        pose, facing: eat && f >= 50 ? 1 : -1, held: bite ? <Burger s={0.42} /> : undefined,
        look: !eat ? { x: 0.4, y: 0.7 } : f < 24 ? { x: 0.5, y: 0.6 } : f < 50 ? { x: 0.3, y: 0 } : { x: 0.7, y: -0.4 },
      })]}
      steel={[steelOn("cook1", { behind: true, held: "spatula", pose: { ...STAND, armF: [30, 30] } })]}
      actors={
        <g>
          {!bite && <PlatedBurger x={740} y={778} s={1} />}
          {bite && <Plate x={740} y={780} s={1} />}
          <g transform="translate(560 786) rotate(-80)"><Wrench s={0.6} /></g>
          {eat && <Chirp x={960} y={630} f={f - 50} />}
        </g>
      } />
  );
};

/** The owners in the crowd at your counter (every owner was right): they look at each other and nod. `wide` pulls back
 *  to the whole town. */
export const Owners: React.FC<{ t: ShotTime; wide?: boolean }> = ({ t, wide }) => {
  const f = t.f;
  const nod = (i: number) => ({ ...SEATED, tilt: Math.max(0, Math.sin(f * 0.18 + i * 1.3)) * 10 });
  return (
    <DinerShot t={t} mood="lamp" lamps="all" cam={wide ? { x: 1000, y: 580, zoom: 1.0 } : { x: 1080, y: 700, zoom: 1.7 }} grill="hot" push={wide ? [1.12, 1] : [1, 1.05]}
      cast={[
        on("till", YOU, "worried", { behind: true }),
        on("stool3", { ...MARCO, coat: "#3d6fb0" }, "neutral", { held: <Burger s={0.4} />, pose: { ...SEATED, armF: [40, 60] } }),
        on("stool4", BANKER, "sceptical", { pose: nod(0), look: { x: 0.8, y: 0 } }),
        on("stool5", RIVAL, "neutral", { pose: nod(1), look: { x: -0.8, y: 0 } }),
        on("stool6", MAYOR, "worried", { pose: nod(2), look: { x: 0.8, y: 0 } }),
        on("stool7", { ...BOSS, wear: [{ kind: "longCoat", color: "#4a4e5e" }] }, "sceptical", { pose: nod(3), look: { x: -0.8, y: 0 } }),
      ]}
      steel={cooksAtPass(4, 0)}
      actors={wide ? <Extras people={crowd(() => 0, () => "worried", { x: 0.2, y: 0.3 }).filter((_, i) => i < 6)} frame={f} /> : undefined} />
  );
};

/** The dilemma, played on the window: `smash` raises the hammers and the plant across the road goes dark; otherwise the
 *  hammers are down, the plant lit, the cooks beaming, the stools empty, and the crowd's hands empty. */
export const Dilemma: React.FC<{ t: ShotTime; smash: boolean }> = ({ t, smash }) => {
  const f = t.f;
  const up = smash ? act(f, 0, 16) : 0;
  return (
    <DinerShot t={t} mood="lamp" lamps="all" cam={{ x: 1060, y: 470, zoom: 1.35 }} grill="cold" push={[1, 1.05]}
      options={{ plant: smash && f > 40 ? "dark" : "working" }}
      steel={cooksAtPass(4, smash ? 0 : 0)}
      actors={<Extras people={crowd(() => up, () => (smash ? "determined" : "sad"), smash ? { x: 0, y: -0.6 } : { x: 0.2, y: 0.6 }).map((p) => ({
        ...p, who: smash ? p.who : { ...p.who, wear: (p.who.wear ?? []).filter((w) => w.kind !== "hammer" && w.kind !== "wrench") },
      }))} frame={f} />} />
  );
};

// ---- The Dial --------------------------------------------------------------------------------------------------------

/** First light: the crowd still in the diner, bleary; you at the till with the phone. */
export const FirstLight: React.FC<{ t: ShotTime; machines?: boolean; you?: Face }> = ({ t, machines = true, you = "determined" }) => (
  <DinerShot t={t} mood="morning" grill={machines ? "hot" : "cold"} push={[1, 1.04]} cam={{ x: 980, y: 580, zoom: 1.05 }}
    cast={[on("till", YOU, you, { behind: true, phone: true, pose: { ...STAND, armF: [60, 80] }, look: { x: 0.4, y: 0.5 } })]}
    steel={machines ? cooksAtPass(4, 0) : []}
    actors={<Extras people={crowd(() => 0, () => (machines ? "sad" : "shocked"), machines ? { x: 0.1, y: 0.2 } : { x: -0.8, y: -0.2 }).map((p) => ({
      ...p, ...(machines ? { face: undefined } : {}),
      who: { ...p.who, wear: (p.who.wear ?? []).filter((w) => w.kind !== "hammer" && w.kind !== "wrench") },
    })).map((p, i) => (machines ? { ...p, face: i % 2 ? "sad" as Face : "neutral" as Face } : p))} frame={t.f} />} />
);

/** The overshoot: every machine stands up at once, chirps and files out of the door toward the trucks; the rival runs
 *  past the window the other way, waving her arms. */
export const FileOut: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const rival = act(f, 10, 60);
  return (
    <DinerShot t={t} mood="morning" grill="cold" push={[1, 1.03]} cam={{ x: 960, y: 560, zoom: 1.02 }}
      options={{ door: 0.9, chime: f, outside: { who: RIVAL, face: EXPRESSIONS.afraid, x: mix(560, 1560, rival), pose: { ...runPose(f * 0.5), armF: [160 + Math.sin(f) * 20, 10], armB: [-160, -10] }, facing: 1 } }}
      cast={[on("till", YOU, "shocked", { behind: true, phone: true, pose: { ...STAND, armF: [60, 80] } })]}
      steel={[0, 1, 2, 3].map((i) => {
        // the four cooks walk off along the back of the counter toward the door, one after another
        const p = act(f, 4 + i * 4, 44 + i * 4);
        return steelOn(`cook${i + 1}`, { behind: true, held: "spatula", dx: -p * (1300 + i * 40), pose: p > 0 && p < 1 ? walkPose(f * 0.32 + i) : STAND, facing: -1 });
      })}
      actors={
        <g>
          <WalkingRobot f={f} a={8} b={44} x0={1900} x1={500} y={1074} s={1.1} held="pie" />
          <WalkingRobot f={f} a={2} b={40} x0={1036} x1={120} y={1050} s={1} cap={CRIMSON} />
          {f < 16 && [960, 1180, 1400, 1620].map((x) => <Chirp key={x} x={x} y={600} f={f - 2} />)}
          <Extras people={[4, 5, 10].map((i) => crowd(() => 0, () => "shocked", { x: -0.8, y: 0 })[i]).map((p) => ({ ...p, who: { ...p.who, wear: (p.who.wear ?? []).filter((w) => w.kind !== "hammer" && w.kind !== "wrench") } }))} frame={f} />
        </g>
      } />
  );
};

/** The truck pulling away along the street with eight steel cooks on its bed; the rival chasing it, arms up. `load` 0..8
 *  how many are aboard (they climb on one by one); `away` drives it off; `rivalX` her x. */
export const TruckScene: React.FC<{ t: ShotTime; load: number; away: number; rival: "chase" | "count" | "shrug"; cam?: Camera }> = ({ t, load, away, rival, cam }) => {
  const f = t.f;
  const tx = mix(1900, 3300, away);
  const ty = TOWN.roadTop + 120;
  const aboard = Math.floor(load);
  const climbing = load - aboard;
  const rx = rival === "chase" ? mix(900, 2300, away) : 1240;
  const rivalPose: Pose = rival === "chase" ? { ...runPose(f * 0.5), armF: [160 + Math.sin(f) * 20, 10], armB: [-160, -10] }
    : rival === "count" ? { ...STAND, armF: [130, 30 + 10 * Math.sin(f * 0.6)] } : SHRUG;
  return (
    <Place t={t} set={town} mood="morning" cam={cam ?? { x: 1700, y: 650, zoom: 1.15 }} push={[1, 1.04]}
      actors={
        <g>
          <Truck x={tx} y={ty} s={0.8}>
            {Array.from({ length: aboard }, (_, i) => (
              <Robot key={i} x={-720 + (i % 4) * 120 + (i >= 4 ? 60 : 0)} y={BED_Y - (i >= 4 ? 0 : 0)} scale={i >= 4 ? 0.62 : 0.66} frame={f} held="spatula" />
            ))}
          </Truck>
          {climbing > 0 && aboard < 8 && <Robot x={mix(tx - 720 * 0.8 - 160, tx - 720 * 0.8 + (aboard % 4) * 96, climbing)} y={mix(TOWN.base + 20, ty + BED_Y * 0.8, climbing)} scale={0.6} pose={walkPose(f * 0.3)} frame={f} />}
          <Extras people={[{ who: RIVAL, x: rx, y: 1060, s: 1.05, facing: 1, pose: rivalPose, face: rival === "chase" ? "afraid" : rival === "count" ? "sceptical" : "relieved", look: rival === "count" ? { x: 0.8, y: -0.4 } : { x: 0.6, y: 0 } }]} frame={f} />
        </g>
      } />
  );
};

/** The diner without a machine in it (too far): you shocked with the phone, the crowd staring. */
export const NoMachines: React.FC<{ t: ShotTime }> = ({ t }) => <FirstLight t={t} machines={false} you="shocked" />;

/** The plant through the window with no machines anywhere: gate shut, no smoke, the boss walking away along the road. */
export const NoPlant: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerShot t={t} mood="morning" cam="window" grill="cold" push={[1, 1.06]}
    options={{ plant: "dark", outside: { who: { ...BOSS, wear: [{ kind: "longCoat", color: "#4a4e5e" }] }, face: EXPRESSIONS.sad, x: mix(900, 1500, t.p), pose: walkPose(t.f * 0.25), facing: 1 } }} />
);

/** The door chimes: two cooks walk back in and take their spatulas; the other two stay on the truck. */
export const TwoBack: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  return (
    <DinerShot t={t} mood="morning" cam={{ x: 420, y: 650, zoom: 1.6 }} grill="cold" push={[1, 1.04]} options={{ door: 0.85, chime: f }}
      cast={[on("till", YOU, "relieved", { behind: true, phone: true, pose: { ...STAND, armF: [60, 80] } })]}
      actors={<g>{[0, 1].map((i) => (
        <WalkingRobot key={i} f={f} a={2 + i * 18} b={36 + i * 18} x0={150} x1={640 + i * 260} y={1060} s={1.05}
          held={f > 36 + i * 18 ? <Spatula angle={-80} /> : "none"} />
      ))}</g>} />
  );
};

/** Two cooks flipping, two spots empty, the crowd watching, the grill hot again. */
export const TwoCooks: React.FC<{ t: ShotTime; cam?: Camera }> = ({ t, cam = { x: 1000, y: 580, zoom: 1.08 } }) => (
  <DinerShot t={t} mood="morning" robots={2} grill="hot" push={[1, 1.05]} cam={cam}
    cast={[on("till", YOU, "relieved", { behind: true, phone: true, pose: { ...STAND, armF: [60, 80] } })]}
    actors={<Extras people={crowd(() => 0, (i) => (i % 2 ? "relieved" : "neutral"), { x: 0.1, y: -0.5 }).map((p) => ({ ...p, who: { ...p.who, wear: (p.who.wear ?? []).filter((w) => w.kind !== "hammer" && w.kind !== "wrench") } }))} frame={t.f} />} />
);

/** The mayor at the counter, sash on, arms folded. */
export const MayorAsks: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerShot t={t} mood="morning" cam={{ x: 780, y: 680, zoom: 1.9 }} robots={2} push={[1, 1.06]}
    cast={[
      on("till", YOU, "neutral", { behind: true, phone: true, pose: { ...STAND, armF: [60, 80] }, look: { x: 0.8, y: 0.2 } }),
      on("stool3", MAYOR, "sceptical", { pose: { ...SEATED, armF: FOLDED.armF, armB: FOLDED.armB }, look: { x: 0.8, y: -0.2 } }),
    ]} />
);

/** You slide the napkin and the pencil across the counter to the mayor; she picks up the pencil. */
export const SlideNapkin: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const slide = act(f, 2, 22);
  return (
    <DinerShot t={t} mood="morning" cam={{ x: 780, y: 680, zoom: 1.9 }} robots={2} push={[1.03, 1.06]}
      cast={[
        on("till", YOU, "relieved", { behind: true, pose: slide < 1 ? REACH : STAND, look: { x: 0.8, y: 0.3 } }),
        on("stool3", MAYOR, f > 26 ? "determined" : "shocked", { pose: f > 26 ? { ...SEATED, armF: [60, 60] } : { ...SEATED, armF: FOLDED.armF, armB: FOLDED.armB }, look: { x: 0.5, y: 0.6 } }),
      ]}
      actors={<g transform={`translate(${mix(640, 730, slide)} 786) scale(1 0.2)`}><Napkin s={0.34} rot={0} scribbles={2} text="...and he ate here" /></g>} />
  );
};

/** The owners at your counter, napkins out again, pencils going, three lines each this time. */
export const OwnersSum: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const writing = (i: number): Pose => ({ ...SEATED, armF: [70 + 6 * Math.sin(f * 0.9 + i), 70] });
  const held = (i: number) => <Napkin s={0.14} rot={-8} scribbles={2} text="...and he ate here" ink={["#2f3242", "#6a4fa0", "#3f6f3a", "#c0567a"][i]} write={Math.min(1, f / 40)} />;
  return (
    <DinerShot t={t} mood="morning" cam={{ x: 980, y: 700, zoom: 1.55 }} robots={2} push={[1, 1.05]}
      cast={[
        on("till", YOU, "happy", { behind: true }),
        on("stool3", BOSS, "determined", { pose: writing(0), held: held(0), look: { x: 0.4, y: 0.4 } }),
        on("stool4", BANKER, "sceptical", { pose: writing(1), held: held(1), look: { x: 0.4, y: 0.4 } }),
        on("stool5", MAYOR, "determined", { pose: writing(2), held: held(2), look: { x: 0.4, y: 0.4 } }),
        on("stool6", worker(3), "neutral", { pose: writing(3), held: held(3), look: { x: 0.4, y: 0.4 } }),
      ]} />
  );
};

/** The bank's door: the banker holds up two fingers to his steel tellers; two stay, and ten humans in cardigans walk back
 *  in. */
export const BankBack: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const humans: Extra[] = Array.from({ length: 10 }, (_, i): Extra => {
    const x = 1240 + i * 70 - f * 9;
    return { who: { head: ["#7fa0c4", "#e6a0a0", "#d9c26a", "#9fc0e0", "#a8c97f", "#e0a070", "#c9a0d6", "#7fc29b", "#b58fc7", "#8fb8b4"][i], coat: ["#c97a5a", "#7fa08a", "#b9a06a", "#8a7ab0"][i % 4] },
      x, y: TOWN.base + 12 + (i % 2) * 8, s: 0.7, face: "happy", facing: -1, pose: walkPose(f * 0.3 + i) };
  }).filter((p) => p.x > TOWN.bank.door + 30);
  return (
    <Place t={t} set={town} mood="day" cam={{ x: 860, y: 560, zoom: 1.6 }} push={[1, 1.04]}
      cast={[on("bankDoor", BANKER, "happy", { dx: -150, pose: { ...STAND, armF: [150, 10] }, held: <TwoFingers skin={BANKER.head} />, look: { x: 0.6, y: -0.2 } })]}
      actors={
        <g>
          <Robot x={TOWN.bank.door - 60} y={TOWN.base + 8} scale={0.7} frame={f} />
          <Robot x={TOWN.bank.door + 60} y={TOWN.base + 8} scale={0.7} frame={f} facing={-1} />
          <Extras people={humans} frame={f} />
        </g>
      } />
  );
};

/** The plant gate: the boss keeps his steel painters and waves the old line crew in; Marco runs past him, stops, turns,
 *  and walks back across the road toward the diner, hat in hand. */
export const GateBack: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const gx = TOWN.plant.gate + TOWN.plant.gateW / 2;
  const crew: Extra[] = Array.from({ length: 6 }, (_, i) => ({ who: worker(i), x: gx - 520 + i * 70 + f * 7, y: TOWN.base + 10 + (i % 2) * 8, s: 0.7, face: "happy" as Face, facing: 1 as const, pose: walkPose(f * 0.3 + i) }))
    .filter((p) => p.x < gx + 20);
  const run = f < 30;
  const mx = run ? mix(gx - 700, gx - 40, act(f, 0, 30)) : f < 40 ? gx - 40 : gx - 40 - (f - 40) * 8;
  return (
    <Place t={t} set={town} mood="day" cam={{ x: gx - 220, y: 600, zoom: 1.35 }} options={{ gate: 1 }} push={[1, 1.04]}
      cast={[on("gate", { ...BOSS, wear: [{ kind: "longCoat", color: "#4a4e5e" }] }, "happy", { dx: 150, facing: -1, pose: wave(f), look: { x: 0.6, y: 0 } })]}
      actors={
        <g>
          <Robot x={gx + 240} y={TOWN.base + 8} scale={0.72} facing={-1} pose={SPRAY_POSE} held="paintGun" frame={f} />
          <Robot x={gx + 330} y={TOWN.base + 8} scale={0.72} facing={-1} pose={SPRAY_POSE} held="paintGun" frame={f} />
          <Extras people={[
            ...crew,
            { who: MARCO_HATLESS, x: mx, y: TOWN.roadTop + 60, s: 0.85, facing: run || f < 36 ? 1 : -1, face: run ? "determined" : f < 40 ? "shocked" : "relieved",
              pose: run ? runPose(f * 0.5) : f < 40 ? STAND : { ...walkPose(f * 0.25), armF: [60, 40] }, look: { x: 0.6, y: 0 } },
          ]} frame={f} />
          {!run && f >= 40 && <g transform={`translate(${mx - 30} ${TOWN.roadTop - 70})`}><HatInHand /></g>}
        </g>
      } />
  );
};

// ---- Stool Four ------------------------------------------------------------------------------------------------------

/** Lunch, the opposite of the first morning: forty stools full, Marco flipping beside the steel cook, the steel waitress
 *  and a new human one working the room, you at the till not counting, the boss on stool four with a burger. `cam` and
 *  extras per shot. */
export const Lunch: React.FC<{ t: ShotTime; cam?: Camera | "wide" | "counter" | "stools" | "grill"; boss?: Partial<Member>; you?: Face; youLook?: { x: number; y: number };
  marco?: { look?: { x: number; y: number }; up?: boolean; pose?: Pose; face?: Face }; till?: number; phone?: boolean; actors?: React.ReactNode; push?: [number, number]; payer?: boolean;
  empty?: number[] }> = ({
  t, cam = "wide", boss, you = "happy", youLook, marco, till = 0, phone = true, actors, push = [1, 1.04], payer, empty = [],
}) => {
  const f = t.f;
  const seats = (i: number) => (i === 3 || empty.includes(i) ? null : worker(i + 2));
  const cast: Member[] = [];
  for (let i = 0; i < 13; i++) {
    const who = seats(i);
    if (!who) continue;
    const paying = payer && i === 0;
    cast.push(on(`stool${Math.min(9, i + 1)}`, who, i % 3 ? "happy" : "relieved", {
      dx: Math.max(0, i - 8) * 172, pose: paying ? { ...SEATED, armF: [86, 14] } : { ...SEATED, armF: [40 + 30 * Math.abs(Math.sin(f * 0.12 + i)), 80] },
      held: paying ? <CashFan s={0.9} n={2} /> : i % 2 ? <Burger s={0.42} /> : undefined,
    }));
  }
  const swing = Math.max(0, Math.sin(f * 0.18));
  return (
    <DinerShot t={t} mood="day" cam={cam} grill="hot" plates="some" push={push} options={{ phone, till }}
      cast={[
        on("till", YOU, you, { behind: true, look: youLook ?? { x: 0.8, y: 0 } }),
        on("grill", MARCO, marco?.face ?? "happy", { behind: true, pose: marco?.pose ?? (marco?.up ? { ...STAND, armF: [150, 20] } : { ...STAND, armF: [70 + 50 * swing, 30] }), held: <Spatula angle={marco?.pose ? -10 : marco?.up ? -90 : -20 - 30 * swing} />, look: marco?.look ?? { x: -0.5, y: 0.3 } }),
        { ...on("stool4", BOSS, "happy", { held: <Burger s={0.45} />, pose: { ...SEATED, armF: [50, 90] }, look: { x: 0.6, y: -0.2 } }), ...(boss ?? {}) },
        ...cast,
      ]}
      steel={[steelOn("cook4", { behind: true, held: "spatula", burger: true, toolAngle: 6, pose: { ...STAND, armF: [60, 30] } }), steelOn("front", { held: "pie", pose: { ...STAND, armF: [80, 10] }, dx: 500 })]}
      actors={actors} />
  );
};

/** The money going round at lunch: a coin's glint from a customer's hand to the till, from the till to Marco at the grill,
 *  and from Marco back out over the counter to the stools. World points on the wide camera. */
export const CoinRound: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const legs = [{ x: 1210, y: 880 }, { x: 560, y: 680 }, { x: 1760, y: 620 }, { x: 1380, y: 880 }, { x: 1210, y: 880 }];
  const p = (f % 96) / 96;
  const seg = Math.min(3, Math.floor(p * 4));
  const u = p * 4 - seg;
  const a = legs[seg], b = legs[seg + 1];
  const c = { x: mix(a.x, b.x, u), y: mix(a.y, b.y, u) - 140 * 4 * u * (1 - u) };
  return (
    <Lunch t={t} till={seg === 0 && u > 0.85 ? 1 : 0} actors={
      <g>
        <path d={`M${legs[0].x} ${legs[0].y} Q${(legs[0].x + legs[1].x) / 2} ${legs[0].y - 260} ${legs[1].x} ${legs[1].y} Q1160 380 ${legs[2].x} ${legs[2].y} Q1570 500 ${legs[3].x} ${legs[3].y}`}
          fill="none" stroke={MUSTARD} strokeWidth={6} strokeDasharray="10 16" opacity={0.6} />
        <circle cx={c.x} cy={c.y} r={30} fill={MUSTARD} opacity={0.3} />
        <circle cx={c.x} cy={c.y} r={18} fill={MUSTARD} stroke={INK} strokeWidth={4} />
      </g>
    } />
  );
};

/** The boss on stool four reads your napkin: the first two lines (nods), the third (stops), again, and laughs with his
 *  mouth full; then tucks it into his tie pocket. */
export const BossReads: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const tucked = f > 80;
  const laughing = f > 56 && f < 82;
  const look = f < 22 ? { x: 0.2 + 0.03 * (f % 10), y: 0.3 } : f < 34 ? { x: 0.3, y: 0.55 } : f < 44 ? { x: 0.3, y: 0.55 } : { x: 0.3, y: 0.55 };
  const face: Face = f < 34 ? "neutral" : f < 46 ? "shocked" : f < 56 ? "sceptical" : "happy";
  return (
    <Lunch t={t} cam={{ x: 900, y: 720, zoom: 2.3 }} push={[1, 1.05]} empty={[2]}
      boss={{
        face: { ...EXPRESSIONS[face], ...(laughing ? { mouth: "open" as const, lids: 0.5 } : {}) },
        who: { ...BOSS, look, held: tucked ? undefined : <g transform="translate(30 -10)"><Napkin s={0.13} rot={-6} scribbles={2} text="...and he ate here" /></g> },
        pose: tucked ? { ...SEATED, armF: [10, -120], tilt: 0 } : { ...SEATED, armF: [80, 70], tilt: laughing ? Math.sin(f * 1.4) * 6 : f < 30 ? Math.max(0, Math.sin(f * 0.4)) * 6 : 0 },
      }} />
  );
};

/** The steel customer, back from the truck in a cap, walks in through the door to the till and points at a burger to
 *  go (a bag on the counter). */
export const CustomerIn: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const at = act(f, 4, 44);
  const x = mix(170, 470, at);
  return (
    <Lunch t={t} cam="counter" push={[1, 1.04]} you="neutral"
      actors={
        <g>
          <Robot x={x} y={1060} scale={1.05} cap={CRIMSON} frame={f} pose={at < 1 ? walkPose(f * 0.3) : { ...STAND, armF: [118, 10] }} />
          <g transform="translate(400 790)"><Bag /></g>
        </g>
      } />
  );
};

/** The street: the steel customer carries the bag out of the diner and across the road toward the plant gate, two happy
 *  arcs on its screen; the camera goes with it. */
export const CustomerCross: React.FC<{ t: ShotTime; gate?: boolean; close?: boolean }> = ({ t, gate, close }) => {
  const f = t.f;
  const gx = TOWN.plant.gate + TOWN.plant.gateW / 2;
  if (close) {
    // the end card: it stands in the open gate with the bag, beaming; the whistle puffs; the right third stays quiet
    return (
      <Place t={t} set={town} mood="day" cam={{ x: gx + 140, y: 520, zoom: 1.7 }} options={{ gate: 1, whistle: ramp(f, 40, 70) * (1 - ramp(f, 120, 150)) }} push={[1, 1.05]}
        actors={<Robot x={gx} y={TOWN.base + 30} scale={0.85} cap={CRIMSON} facing={-1} pose={{ ...STAND, armF: [40 + 25 * act(f, 60, 80) * (1 - act(f, 110, 130)), 20] }} held={<Bag />} frame={f} />} />
    );
  }
  if (gate) {
    // the last image: it reaches the gate, the gate opens for it, it stands in it, beaming
    const walk = act(f, 0, 150);
    const x = mix(gx - 520, gx, walk);
    const cam: Camera = { x: gx + 160, y: 560, zoom: 1.3 };
    return (
      <Place t={t} set={town} mood="day" cam={cam} options={{ gate: act(f, 110, 160) }} push={[1, 1.06]}
        actors={<Robot x={x} y={TOWN.base + 30} scale={0.85} cap={CRIMSON} facing={walk < 1 ? 1 : -1} pose={walk < 1 ? { ...walkPose(f * 0.3), armF: [40, 20] } : { ...STAND, armF: [40, 20] }} held={<Bag />} frame={f} />} />
    );
  }
  const walk = act(f, 0, t.dur);
  const x = mix(TOWN.diner.door, gx - 900, walk);
  const y = mix(TOWN.base + 20, TOWN.roadBottom - 10, act(f, 10, 70));
  const cam: Camera = { x: mix(1600, 2200, act(f, 0, t.dur)), y: 640, zoom: 1.3 };
  return (
    <Place t={t} set={town} mood="day" cam={cam} options={{ van: false }} push={[1, 1]}
      actors={<Robot x={x} y={y} scale={0.88} cap={CRIMSON} pose={{ ...walkPose(f * 0.3), armF: [40, 20] }} held={<Bag />} frame={f} />} />
  );
};

/** Marco at the grill, spatula up, looking over at you. */
export const MarcoLooks: React.FC<{ t: ShotTime }> = ({ t }) => <Lunch t={t} cam={{ x: 1820, y: 560, zoom: 1.8 }} marco={{ up: true, look: { x: 0.9, y: 0 } }} push={[1, 1.03]} />;
/** You at the till, looking at the phone that didn't ping. */
export const YouLook: React.FC<{ t: ShotTime; face?: Face }> = ({ t, face = "sceptical" }) => <Lunch t={t} cam={{ x: 780, y: 650, zoom: 2.0 }} you={face} youLook={{ x: 0.7, y: 0.8 }} push={[1, 1.03]} />;
/** The boss on stool four turns. */
export const BossTurns: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Lunch t={t} cam={{ x: 980, y: 720, zoom: 1.9 }} push={[1, 1.03]}
    boss={{ face: EXPRESSIONS.sceptical, who: { ...BOSS, look: { x: 0.8, y: 0 }, facing: t.f > 6 ? 1 : -1, held: <Burger s={0.45} /> } }} />
);

/** "Checked by Marco": at the grill, Marco flips, turns to camera and draws a big tick in the air with the spatula. */
export const MarcoTicks: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  const tick = act(f, 70, 96);
  return (
    <Lunch t={t} cam={{ x: 1700, y: 560, zoom: 1.75 }} marco={{ up: f > 66, look: f > 66 ? { x: 0, y: 0 } : undefined }} push={[1, 1.05]}
      actors={tick > 0 ? (
        <path d="M1560 420 l50 60 l120 -150" fill="none" stroke={MUSTARD} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={330} strokeDashoffset={330 * (1 - tick)} />
      ) : undefined} />
  );
};

/** You at the till taking a customer's cash (still the richest), the till pinging. */
export const Richest: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Lunch t={t} cam="counter" till={(t.f % 24) / 24 > 0.5 ? 1 : 0} push={[1, 1.05]} payer />
);

export { Tile };
