// Part B's shots for The Whole Town (day) and Rich (dusk): Marco hired and let go at the gate; the banker at the
// diner, the tellers, the cash machine and the bank's twelve steel tellers; the mayor, her farms and her steel
// assistant fixing her sash; the rival renting eight cooks; the montage; the napkins; the plumber's finger; the
// reporter at the split-flap counter; the last human wage; the key to the town, the convoy, Keynes. Each shot takes
// the ShotTime and acts: poses, faces, props and the camera change every two to four seconds. No AI images.
import type { ReactNode } from "react";
import { bankAtm } from "@whatif/kit/sets/BankAtm";
import { SEATED, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, MUSTARD } from "@whatif/kit/theme";
import { diner, DINER, type DinerOptions } from "../../sets/Diner";
import { BANKER, BOSS, MARCO_OVERALLS, MAYOR, PLUMBER, REPORTER, RIVAL, STRANGER, townsfolk, worker, YOU, type Person } from "../Cast";
import { on, Place, steelOn, type Member, type PlaceProps } from "../Places";
import { SmallAppPhone } from "../Props";
import { SERVE_POSE } from "../Robot";
import { Dressed } from "../Wear";
import { clamp01, ease, mix, ramp, type ShotTime } from "../util";
import { dinerWith, hipOf, Hum, NoteFly, ShiftCounter, SlidingGlasses, type DinerExtras } from "./bits";
import { FarmsCard, FifteenHours, HoursAndPay, KeynesBars, NapkinFan, TellersCard, TypePhone } from "./cards";
import { BigKey, Clipboard, Envelope, gateWalk, plantGate, road, SashHeld, Scissors, shop, square, bankHall, Van } from "./sets";

// ---- Poses -----------------------------------------------------------------------------------------------------------

export const wave = (f: number): Pose => ({ ...STAND, tilt: 6, armF: [150 + 18 * Math.sin(f * 0.45), 25], armB: [-8, 10] });
export const POINT: Pose = { ...STAND, armF: [95, 0] };
export const HOLD_OUT: Pose = { ...STAND, armF: [82, 8] };
export const FOLDED: Pose = { ...STAND, armF: [55, 120], armB: [55, 120] };
export const SHRUG: Pose = { ...STAND, tilt: 6, armF: [65, 85], armB: [-65, -85] };
export const ORATE: Pose = { ...STAND, lean: -3, armF: [125, 15], armB: [-20, 20] };
export const HAT_IN_HANDS: Pose = { ...STAND, tilt: 10, armF: [35, 55], armB: [35, 55] };
export const ARMS_UP: Pose = { ...STAND, lean: -4, tilt: -6, armF: [155, 20], armB: [-155, -20] };
export const pat = (f: number): Pose => ({ ...STAND, armF: [28, -20 + 26 * Math.max(0, Math.sin(f * 0.7))], armB: [-8, 10] });
export const nod = (f: number, p: Pose = STAND): Pose => ({ ...p, tilt: p.tilt + 7 * Math.max(0, Math.sin(f * 0.32)) });

/** A hard hat held in the hands (Marco's, the week he is let go). */
const HeldHat: ReactNode = (
  <g transform="translate(6 -6) rotate(170)">
    <path d="M-40 -10 Q-38 -66 2 -68 Q42 -66 42 -10 Z" fill="#f7d038" stroke={INK} strokeWidth={4} />
    <rect x={-50} y={-14} width={102} height={10} rx={5} fill="#f7d038" stroke={INK} strokeWidth={4} />
  </g>
);

export const without = (p: Person, kind: string): Person => ({ ...p, wear: (p.wear ?? []).filter((w) => w.kind !== kind) });

// ---- The diner with part B's extras ----------------------------------------------------------------------------------

type DinerCam = keyof typeof diner.cameras;
export const DinerB: React.FC<Omit<PlaceProps<DinerOptions>, "set" | "cam"> & DinerExtras & {
  cam?: DinerCam | Camera; robots?: number; grill?: DinerOptions["grill"]; plates?: DinerOptions["plates"];
}> = ({ cam = "wide", wall, far, robots, grill, plates, options, ...rest }) => (
  <Place set={wall || far ? dinerWith({ wall, far }) : diner} cam={typeof cam === "string" ? diner.cameras[cam] : cam}
    options={{ ...(robots !== undefined ? { robots } : {}), ...(grill ? { grill } : {}), ...(plates ? { plates } : {}), ...options }} {...rest} />
);

/** A paper card over a dimmed place: the place keeps moving underneath. */
export const OverDiner: React.FC<{ t: ShotTime; mood: "day" | "dusk" | "night" | "lamp"; card: ReactNode; cam?: DinerCam; options?: Partial<DinerOptions>; cast?: Member[] }> = ({
  t, mood, card, cam = "wide", options, cast,
}) => (
  <DinerB t={t} mood={mood} cam={cam} robots={4} options={{ flip: mood === "day", ...options }} grill={mood === "day" ? "hot" : "cold"} dim={0.5}
    cast={cast ?? [on("till", YOU, "neutral", { behind: true })]} overlay={card} push={[1.02, 1.08]} />
);

export const OverSquare: React.FC<{ t: ShotTime; mood: "day" | "dusk" | "night"; card: ReactNode; convoy?: boolean }> = ({ t, mood, card, convoy }) => (
  <Place t={t} set={square} mood={mood} cam="wide" options={{ convoy: convoy ? -400 + t.f * 7 : null, bunting: mood === "dusk" }} dim={0.5} overlay={card}
    cast={[on("steps", MAYOR, "happy"), on("near", YOU, "happy")]} push={[1.02, 1.08]} />
);

// ---- The plant gate: hired, let go, the last human wage -------------------------------------------------------------

/** "Got hired here!": Marco in brand-new overalls at the gate, grinning, waving at the diner window across the road. */
export const GateHired: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={plantGate} mood="morning" cam={{ x: 800, y: 660, zoom: 1.3 }} options={{ gate: 1 }}
    cast={[
      on("near", MARCO_OVERALLS, "happy", { pose: wave(t.f), facing: -1, look: { x: -0.3, y: -0.1 } }),
      on("gate", worker(2), "happy", { pose: walkPose(t.f * 0.25), dx: -t.f * 1.5, dy: -t.f * 1.2, facing: -1 }),
      on("right", worker(5), "neutral", { pose: walkPose(t.f * 0.25 + 2), dx: -t.f * 4, facing: -1 }),
    ]} push={[1, 1.06]} pushAt={{ x: 700, y: 560 }} />
);

/** One week later: Marco outside the gate, the hard hat in his hands; a steel worker walks in past him on a chirp. */
export const GateAgain: React.FC<{ t: ShotTime }> = ({ t }) => {
  const w = gateWalk(clamp01(t.f / 48));
  return (
    <Place t={t} set={plantGate} mood="morning" cam={{ x: 860, y: 660, zoom: 1.3 }} options={{ gate: 1 }}
      cast={[on("near", without(MARCO_OVERALLS, "hardHat"), t.f < 20 ? "worried" : "sad", { pose: HAT_IN_HANDS, held: HeldHat, look: { x: 0.8, y: 0 } })]}
      steel={w.gone ? [] : [steelOn("gate", { pose: walkPose(t.f * 0.3), facing: -1, dx: w.dx, dy: w.dy, scale: w.scale })]}
      push={[1.04, 1]} />
  );
};

/** "Again.": Marco turns and walks off along the pavement; the gate shuts behind him. */
export const GateWalkOff: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={plantGate} mood="morning" cam="wide" options={{ gate: 1 - ease(ramp(t.f, 0, 26)) }}
    cast={[on("near", without(MARCO_OVERALLS, "hardHat"), "sad", { pose: walkPose(t.f * 0.22), facing: -1, dx: -t.f * 6, held: HeldHat })]} push={[1, 1.04]} />
);

/** The last human wage: the boss hands the pay envelope over at the gate; the worker walks off; steel walks in. */
export const LastWage: React.FC<{ t: ShotTime }> = ({ t }) => {
  const handed = t.f > 34;
  const away = Math.max(0, t.f - 46);
  return (
    <Place t={t} set={plantGate} mood="day" cam={{ x: 900, y: 650, zoom: 1.25 }} options={{ gate: 1, whistle: t.f < 40 ? 1 : 0 }}
      cast={[
        on("gate", BOSS, handed ? "neutral" : "happy", { pose: handed ? STAND : HOLD_OUT, held: handed ? undefined : <Envelope s={0.7} />, look: { x: 0.8, y: 0 } }),
        on("gate", worker(4), handed ? "sad" : "neutral", {
          dx: -260 - away * 5, facing: handed ? -1 : 1, pose: away > 0 ? walkPose(away * 0.22) : HOLD_OUT, held: handed ? <Envelope s={0.7} empty={false} /> : undefined,
        }),
      ]}
      steel={[0, 1, 2].map((k) => {
        const w = gateWalk(clamp01((t.f - 10 - k * 30) / 60));
        return steelOn("gate", { pose: walkPose(t.f * 0.3 + k), facing: -1, dx: w.dx + 120, dy: w.dy, scale: w.gone ? 0.001 : w.scale });
      })} />
  );
};

// ---- The banker -------------------------------------------------------------------------------------------------------

export const lunch = (from: number, to: number, skip: number[] = []): Member[] =>
  Array.from({ length: to - from + 1 }, (_, k) => from + k).filter((i) => !skip.includes(i)).map((i) => on(`stool${i}`, worker(i + 1), i % 3 ? "happy" : "neutral"));

/** The bank manager walks in at the door, looking round at the steel cooks: who built this kitchen? */
export const BankerArrives: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerB t={t} mood="day" cam={{ x: 520, y: 640, zoom: 1.45 }} robots={4} plates="some" options={{ door: 1, chime: t.f }}
    cast={[
      on("door", BANKER, t.f < 30 ? "shocked" : "sceptical", { pose: walkPose(Math.min(t.f, 40) * 0.25), dx: Math.min(t.f, 40) * 3.5, look: { x: 0.9, y: -0.3 } }),
      on("till", YOU, "happy", { behind: true, look: { x: -0.6, y: 0 } }),
    ]} push={[1, 1.06]} />
);

/** The banker on stool six at lunch, lecturing, while the steel waitress takes an order with no pad. */
export const BankerTalks: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerB t={t} mood="day" cam="stools" robots={4} plates="some"
    cast={[
      ...lunch(2, 5),
      on("stool6", BANKER, "sceptical", { pose: { ...SEATED, armF: [115 + 10 * Math.sin(t.f * 0.3), 25] }, look: { x: -0.2, y: -0.4 }, facing: 1 }),
      ...lunch(7, 9),
    ]}
    steel={[steelOn("pass", { behind: true, dx: 70, pose: { ...SERVE_POSE, lean: 6, armF: [70, 20 + 10 * Math.sin(t.f * 0.5)] } })]} />
);

/** The banker nods, satisfied; the steel waitress leans to stool five and chirps something kind; stool five pats its
 *  hand; the banker's glasses slide down his nose. */
export const BankerGlasses: React.FC<{ t: ShotTime }> = ({ t }) => {
  const lean = ease(ramp(t.f, 4, 18));
  const patIt = t.f > 22;
  const slide = ease(ramp(t.f, 34, 50));
  const s6 = diner.spots.stool6;
  return (
    <DinerB t={t} mood="day" cam={{ x: 1250, y: 820, zoom: 1.7 }} robots={4} plates="some"
      cast={[
        ...lunch(3, 4),
        on("stool5", worker(7), patIt ? "happy" : "neutral", { pose: { ...SEATED, armF: patIt ? [120 - 8 * Math.abs(Math.sin(t.f * 0.6)), 30] : SEATED.armF } }),
        on("stool6", without(BANKER, "glasses"), slide > 0.2 ? "shocked" : "happy", { pose: nod(t.f, SEATED), look: { x: 0.7, y: 0.1 } }),
      ]}
      steel={[steelOn("pass", { behind: true, dx: 70, pose: { ...SERVE_POSE, lean: 16 * lean, armF: [mix(70, 115, lean), 15] } })]}
      actors={<SlidingGlasses x={s6.x} y={s6.y} scale={s6.scale} facing={-1} pose={nod(t.f, SEATED)} slide={slide} />} push={[1, 1.04]} />
  );
};

/** The cash machine counts the cash; it never asks about her hip. */
export const AtmCash: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={bankAtm} mood="day" cam="wide" options={{ screen: "cash", cash: ease(ramp(t.f, 8, 30)), queue: 2 }}
    cast={[on("atm", { head: "#e8b4c4", coat: "#8a6b5a", scarf: "#c9a0d6" }, t.f < 60 ? "neutral" : "worried", {
      pose: t.f < 60 ? { ...STAND, armF: [70, 30] } : { ...STAND, lean: -4, tilt: -8, armB: [40, -110], armF: [70, 30] }, look: { x: 0.6, y: t.f < 60 ? 0 : -0.3 },
    })]} push={[1, 1.05]} pushAt={{ x: 1350, y: 520 }} />
);

/** He rents twelve: a row of steel tellers lean to their customers, screens tilted, asking about hips. */
export const BankTellers: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={bankHall} mood="day" cam={{ x: 1000, y: 720, zoom: 1.3 }}
    steel={Array.from({ length: 6 }, (_, i) => steelOn(`teller${i + 1}`, { behind: true, pose: { ...STAND, lean: 10 + 6 * Math.sin(t.f * 0.2 + i), armF: [95, 30] } }))}
    cast={Array.from({ length: 6 }, (_, i) => on(`cust${i + 1}`, townsfolk(i), i % 2 ? "happy" : "relieved", {
      pose: i % 2 ? { ...STAND, armB: [40, -110] } : { ...STAND, armF: [95 + 8 * Math.sin(t.f * 0.4 + i), 30] },
    }))} push={[1.06, 1]} />
);

// ---- The mayor ---------------------------------------------------------------------------------------------------------

/** The mayor on the bandstand steps: new jobs always come. */
export const MayorSpeaks: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={square} mood="day" cam="steps"
    cast={[on("steps", MAYOR, "happy", { pose: { ...ORATE, armF: [125 + 10 * Math.sin(t.f * 0.25), 15] }, look: { x: 0.5, y: -0.2 } }), on("near", YOU, "sceptical", { look: { x: 0.8, y: -0.3 } })]}
    push={[1, 1.05]} />
);

export const FarmsOverSquare: React.FC<{ t: ShotTime }> = ({ t }) => <OverSquare t={t} mood="day" card={<FarmsCard f={t.f} />} />;
export const TellersOverDiner: React.FC<{ t: ShotTime }> = ({ t }) => (
  <OverDiner t={t} mood="day" card={<TellersCard f={t.f} only2010 />} cast={[on("stool6", BANKER, "happy"), on("till", YOU, "neutral", { behind: true })]} />
);

/** The mayor types MAYOR'S ASSISTANT into your phone with one finger. */
export const MayorTypes: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={square} mood="day" cam="steps" dim={0.55} cast={[on("steps", MAYOR, "happy")]}
    overlay={<TypePhone f={t.f} job="MAYOR'S ASSISTANT" perLetter={2} skin="#a9c4a0" sleeve="#3b4a5a" />} push={[1, 1.03]} />
);

/** The booth door chimes; a steel assistant walks out, takes the sash off her neck, straightens it, puts it back. */
export const SashFix: React.FC<{ t: ShotTime }> = ({ t }) => {
  const off = t.f >= 18 && t.f < 40;
  const walk = Math.min(t.f, 16);
  return (
    <Place t={t} set={square} mood="day" cam="stage" options={{ door: ease(ramp(t.f, 0, 8)), chime: t.f }}
      cast={[on("stage", off ? without(MAYOR, "sash") : MAYOR, t.f < 18 ? "neutral" : off ? "shocked" : "relieved", {
        facing: -1, look: t.f > 42 ? { x: 0.2, y: 0.8 } : { x: 0.6, y: 0 },
      })]}
      steel={[steelOn("booth", {
        pose: t.f < 16 ? walkPose(t.f * 0.35) : off ? { ...STAND, armF: [100 + 20 * Math.sin(t.f * 0.5), 20] } : { ...STAND, armF: [60, 20] },
        dx: walk * 8, held: off ? <SashHeld s={0.9} /> : "none",
      })]} push={[1, 1.05]} pushAt={{ x: 900, y: 420 }} />
  );
};

// ---- The rival, the montage, the napkins, the plumber --------------------------------------------------------------

/** The rival diner owner at her door, signing for eight steel cooks in the back of your truck. */
export const RivalSigns: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={road} mood="day" cam="wide" options={{ which: "rival", truck: 1560, truckBots: 8 }}
    cast={[on("mid", RIVAL, t.f < 30 ? "happy" : "sceptical", {
      dx: -60, facing: -1, pose: { ...STAND, armF: [70, 40] }, held: <Clipboard s={0.8} signed={ease(ramp(t.f, 4, 30))} />, look: { x: -0.5, y: 0 },
    })]} push={[1, 1.06]} pushAt={{ x: 1150, y: 700 }} />
);

/** The supermarket's steel shelf-stacker. */
export const ShelfStacker: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={shop} mood="day" options={{ kind: "market" }}
    steel={[steelOn("mid", { pose: { ...STAND, armF: [150 - 20 * ease(ramp(t.f, 0, 14)), 20] }, held: <rect x={-40} y={-50} width={80} height={60} rx={6} fill={MUSTARD} stroke={INK} strokeWidth={4} /> })]}
    push={[1.08, 1.02]} />
);

/** The garage's steel mechanic, legs out from under a car. */
export const UnderCar: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={shop} mood="day" options={{ kind: "garage", under: true }} cam={{ x: 1060, y: 760, zoom: 1.3 }} push={[1, 1.06]} />
);

/** Rent arriving: your phone pings and a note flies into the till. */
export const RentIn: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerB t={t} mood="day" cam="counter" robots={4} plates="some" options={{ till: ease(ramp(t.f, 10, 16)) }}
    cast={[on("till", YOU, t.f < 10 ? "neutral" : "happy", { behind: true, phone: true, pose: { ...STAND, armF: [60, 70] }, look: { x: 0.2, y: 0.5 } })]}
    actors={<NoteFly from={{ x: 1300, y: 500 }} to={{ x: DINER.till.x, y: DINER.till.y - 60 }} u={ramp(t.f, 0, 14)} />} push={[1, 1.05]} />
);

export const Napkins: React.FC<{ t: ShotTime; lines?: number; fanAt?: number }> = ({ t, lines, fanAt }) => (
  <OverDiner t={t} mood={lines === 3 ? "night" : "day"} cam="counter" card={<NapkinFan f={t.f} lines={lines} fanAt={fanAt ?? (lines === 3 ? 18 : 60)} />} options={{ lamps: lines === 3 ? "all" : "auto" }} />
);

/** The plumber by his van pushes your phone back with one finger. */
export const PlumberNo: React.FC<{ t: ShotTime }> = ({ t }) => {
  const push = ease(ramp(t.f, 26, 40));
  return (
    <Place t={t} set={road} mood="day" cam="wide" options={{ van: "plumber", vanX: 1720 }}
      cast={[
        on("near", YOU, push > 0.5 ? "worried" : "happy", { dx: 180, pose: { ...STAND, armF: [mix(82, 40, push), mix(8, 40, push)] }, held: <SmallAppPhone s={1.4} /> }),
        on("mid", PLUMBER, t.f < 20 ? "sceptical" : "determined", { dx: 180, pose: { ...STAND, armF: t.f < 22 ? [20, 10] : [mix(40, 90, ease(ramp(t.f, 22, 30))), 0] } }),
      ]} push={[1, 1.05]} pushAt={{ x: 1150, y: 600 }} />
  );
};

/** The plumber won't: arms folded by his van, you shrug. */
export const PlumberFolded: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={road} mood="day" cam="two" options={{ van: "plumber", vanX: 1720 }}
    cast={[on("near", YOU, "sceptical", { dx: 180, pose: SHRUG }), on("mid", PLUMBER, "determined", { dx: 180, pose: nod(t.f, FOLDED) })]} push={[1, 1.05]} />
);

/** The hairdresser won't: scissors up, shaking her head. */
export const Hairdresser: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={shop} mood="day" options={{ kind: "salon" }} cam={{ x: 1000, y: 700, zoom: 1.5 }}
    cast={[on("mid", { head: "#f6a0b8", coat: "#7a4a6a", tie: undefined }, "determined", {
      dx: 160, facing: -1, pose: { ...STAND, tilt: 10 * Math.sin(t.f * 0.5), armF: [130, 10] }, held: <Scissors s={0.8} snip={Math.abs(Math.sin(t.f * 0.6))} />,
    })]} push={[1.05, 1]} />
);

/** Everyone else is in the app by Friday: a steel worker in every shop window. */
export const AppByFriday: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={square} mood="day" cam={{ x: 1300, y: 620, zoom: 1.2 }} options={{ windows: "robots" }}
    cast={[on("near", YOU, "happy", { pose: ARMS_UP, dx: 80 })]} push={[1, 1.06]} />
);

// ---- The reporter and the split-flap counter ------------------------------------------------------------------------

const REPORTER_CAM: Camera = { x: 330, y: 520, zoom: 1.3 };
const newsVan = <Van x={885} y={522} s={0.36} kind="news" />;

/** The reporter at your counter, the split-flap counter of rented shifts climbing over the pie case, the news van
 *  across the road. With `stranger`, a crimson head in a long coat stands at the plant gate, holding nothing. */
export const ReporterCounter: React.FC<{ t: ShotTime; from: number; pose?: "talk" | "posing"; stranger?: boolean; cam?: Camera }> = ({
  t, from, pose = "talk", stranger, cam = REPORTER_CAM,
}) => (
  <DinerB t={t} mood="day" cam={cam} robots={4} plates="some" options={{ board: "blank" }}
    wall={() => <ShiftCounter value={from + t.f * 37} />}
    far={() => (
      <g>
        {newsVan}
        {stranger && <Dressed {...STRANGER} x={1090} y={414} scale={0.3} facing={-1} time={t.f} mouth="flat" />}
      </g>
    )}
    cast={[
      on("floor", REPORTER, "happy", { dx: 230, facing: 1, pose: { ...STAND, armF: [pose === "talk" ? 105 : 90, 30] }, look: { x: pose === "talk" ? -0.3 : 0.8, y: -0.1 } }),
      on("till", YOU, pose === "posing" ? "happy" : "shocked", { behind: true, pose: pose === "posing" ? { ...STAND, tilt: -8, armF: [150, 30], armB: [-30, 60] } : STAND, look: { x: -0.7, y: -0.2 } }),
    ]} push={[1, 1.04]} />
);

// ---- Rich: the key, the convoy, the reporter, Keynes -----------------------------------------------------------------

const convoyAt = (f: number) => -500 + f * 9;
const youKey = (has: boolean, f: number): Member =>
  on("near", YOU, "happy", { dx: -60, pose: has ? { ...STAND, armF: [95, -15 + 6 * Math.sin(f * 0.2)] } : HOLD_OUT, held: has ? <BigKey s={0.75} rot={10} /> : undefined, look: { x: 0.6, y: -0.2 } });

/** The mayor hands you a key the size of a loaf; behind, the convoy pulls out; your apron pocket hums. */
export const KeyToTown: React.FC<{ t: ShotTime; wide?: boolean }> = ({ t, wide }) => {
  const has = wide || t.f > 36;
  const s = square.spots.near;
  const hip = hipOf(s.x - 60, s.y, s.scale, -1);
  return (
    <Place t={t} set={square} mood="dusk" cam={wide ? { x: 1250, y: 620, zoom: 1.15 } : "steps"} options={{ convoy: convoyAt(t.f + (wide ? 70 : 0)), bunting: true }}
      cast={[
        on("steps", MAYOR, "happy", { pose: has ? ORATE : HOLD_OUT, held: has ? undefined : <BigKey s={0.9} rot={-20} /> }),
        youKey(has, t.f),
      ]}
      actors={has && <Hum x={hip.x} y={hip.y} s={1.2} frame={t.f} k={ramp(t.f, wide ? 20 : 40, wide ? 30 : 50)} />} push={[1, 1.05]} />
  );
};

/** The reporter in front of the convoy, microphone up: isn't this the dream? */
export const ReporterDream: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={square} mood="dusk" cam="road" options={{ convoy: convoyAt(t.f + 150), bunting: true }}
    cast={[youKey(true, t.f), on("right", REPORTER, "happy", { pose: { ...STAND, armF: [110, 25] }, look: { x: -0.4, y: -0.1 }, facing: -1 })]} push={[1, 1.06]} />
);

/** Someone thought so: you nod, the key on your shoulder. */
export const SomeoneThought: React.FC<{ t: ShotTime; pat?: boolean }> = ({ t, pat: patting }) => {
  const s = square.spots.near;
  const hip = hipOf(s.x - 60, s.y, s.scale, -1);
  return (
    <Place t={t} set={square} mood="dusk" cam={{ x: 1350, y: 660, zoom: 1.45 }} options={{ convoy: convoyAt(t.f + 300), bunting: true }}
      cast={[
        on("near", YOU, "happy", { dx: -60, pose: patting ? pat(t.f) : nod(t.f, { ...STAND, armF: [95, -15] }), held: patting ? undefined : <BigKey s={0.75} rot={10} />, look: { x: 0.7, y: -0.1 } }),
        on("right", REPORTER, patting ? "happy" : "sceptical", { pose: STAND, look: { x: -0.6, y: 0 } }),
      ]}
      actors={patting && <Hum x={hip.x} y={hip.y} s={1.2} frame={t.f} k={ramp(t.f, 8, 12)} />} push={[1, 1.04]} />
  );
};

export const KeynesOne: React.FC<{ t: ShotTime; catchAt?: number }> = ({ t, catchAt }) => <OverSquare t={t} mood="dusk" convoy card={<KeynesBars f={t.f} catchAt={catchAt} />} />;
export const KeynesTwo: React.FC<{ t: ShotTime }> = ({ t }) => <OverSquare t={t} mood="dusk" convoy card={<FifteenHours f={t.f} />} />;
export const WhereItWent: React.FC<{ t: ShotTime; turn: number; toYou: number }> = ({ t, turn, toYou }) => (
  <OverSquare t={t} mood="dusk" convoy card={<HoursAndPay f={t.f} turn={turn} toYou={toYou} />} />
);

