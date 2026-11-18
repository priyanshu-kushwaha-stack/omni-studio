// Part B's shots after dark: the sixth Friday (forty empty stools, counted), The Missing Line (the napkin's third
// line, the ghosts on the stools, the economists, the money going round, Marco at the glass, the old union story, Ford,
// the owners' card trick, the one planned silence, the dark lot) and Make Them Buy (CUSTOMER typed, a steel customer
// pays with your card and never eats the pie, prices fall, SALE in every window). No AI images.
import type { ReactNode } from "react";
import { SEATED, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import type { Camera } from "@whatif/kit/stage/Stage";
import { diner, DINER } from "../../sets/Diner";
import { BANKER, BOSS, MARCO, MARCO_COAT, MAYOR, painter, REPORTER, RIVAL, YOU, type Person } from "../Cast";
import { on, Place, steelOn, type Face, type Member } from "../Places";
import { CashFan, Napkin, Pie, SmallAppPhone } from "../Props";
import { SERVE_POSE } from "../Robot";
import { ease, mix, ramp, type ShotTime } from "../util";
import { CoinsOut, Ghost, hipOf, NoteFly, ShiftCounter, Tile_ } from "./bits";
import { CrumbsCard, ModelAndNapkin, MoneyLoop, PriceAndWage, SameCard, StopFirst, TypePhone, UnionStory, FordNote } from "./cards";
import { Car, plantGate, shop, square } from "./sets";
import { DinerB, OverDiner } from "./town";

const LINES3 = ["3 wages: gone.", "Burgers: same.", "...and he ate here"];
const LINES2 = ["3 wages: gone.", "Burgers: same."];

/** Marco outside the long window, close to the glass. */
const marcoOutside = (pose: Pose = STAND, face: "sad" | "half" = "sad") => ({
  who: MARCO_COAT, x: 1260, pose,
  face: face === "sad" ? { brows: "sad" as const, lids: 0.45, mouth: "flat" as const, eyes: 1, look: { x: -0.6, y: 0.3 } }
    : { brows: "worry" as const, lids: 0.2, mouth: "smile" as const, eyes: 1, look: { x: -0.7, y: 0.1 } },
});
const CUPPED: Pose = { ...STAND, armF: [125, 30], armB: [118, 36] };
const MARCO_FOCUS = { focus: 0.7 };
const halfWave = (f: number): Pose => ({ ...STAND, armF: [125 + 8 * Math.sin(f * 0.5), 40] });

/** The napkin in your hand at the till (s small, as a Figure's `held`). */
const heldNapkin = (lines: string[], write = 1) => <Napkin s={0.2} rot={-12} scribbles={2} text={lines} write={write} />;

const lampDiner = { mood: "lamp" as const, robots: 4, grill: "cold" as const, options: { flip: false } };

// ---- The sixth Friday ------------------------------------------------------------------------------------------------

/** Forty stools, counted one finger at a time on a split-flap pair over the empty row. */
export const CountStools: React.FC<{ t: ShotTime }> = ({ t }) => {
  const n = Math.min(40, 1 + Math.floor(ease(ramp(t.f, 0, 62)) * 40));
  const tap = Math.abs(Math.sin(t.f * 0.9));
  return (
    <DinerB t={t} mood="night" cam="stools" robots={4} plates="pile" options={{ sync: true, phone: true, lamps: "all" }}
      cast={[on("till", YOU, "worried", { behind: true, pose: { ...STAND, armF: [100 + 12 * tap, -10] }, held: <CashFan s={0.8} />, look: { x: 0.9, y: 0.4 } })]}
      overlay={<g>{String(n).padStart(2, "0").split("").map((c, i) => <Tile_ key={i} ch={c} x={1640 + i * 120} y={860} s={0.95} />)}</g>}
      push={[1, 1.04]} />
  );
};

/** The overalls were your wages: the gate across the road open at the whistle, and nobody coming out. */
export const EmptyCrossing: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={plantGate} mood="night" cam={{ x: 1030, y: 640, zoom: 1.2 }} options={{ gate: ease(ramp(t.f, 4, 30)), whistle: 1 }}
    look={{ film: "contrast(1.1) brightness(1.35)" }} push={[1, 1.06]} />
);

// ---- The Missing Line ------------------------------------------------------------------------------------------------

/** The diner, later, one lamp: you with the napkin, the four cooks beaming at the empty room, Marco outside. */
export const NapkinRead: React.FC<{ t: ShotTime; look: "napkin" | "cooks" }> = ({ t, look }) => (
  <DinerB t={t} {...lampDiner} cam={look === "napkin" ? "wide" : { x: 900, y: 600, zoom: 1.25 }} options={{ flip: false, outside: marcoOutside() }}
    cast={[on("till", YOU, look === "napkin" ? "neutral" : "sceptical", {
      behind: true, pose: { ...STAND, armF: [70, 60] }, held: heldNapkin(LINES2), look: look === "napkin" ? { x: 0.5, y: 0.7 } : { x: 0.9, y: -0.1 },
    })]} push={[1, 1.03]} />
);

/** Through the glass, Marco lifts one hand: half a wave. */
export const MarcoHalfWave: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerB t={t} {...lampDiner} cam={{ x: 1150, y: 320, zoom: 1.8 }} options={{ flip: false, outside: marcoOutside(t.f > 6 ? halfWave(t.f) : STAND, t.f > 6 ? "half" : "sad") }} look={MARCO_FOCUS} push={[1, 1.05]} />
);

/** You turn the pencil round and write a third line: ...and he ate here. */
export const NapkinWrite: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerB t={t} {...lampDiner} cam="counter" dim={0.55} options={{ flip: false, outside: marcoOutside() }}
    overlay={<Napkin x={880} y={620} s={1.3} rot={-3} scribbles={2} text={LINES3} write={mix(0.8, 1, ease(ramp(t.f, 4, 44)))} pencil={t.f < 48} />}
    push={[1, 1.04]} />
);

/** Marco ate here. So did the paint shop. So did twelve tellers: faint diners on the empty stools, one group at a time. */
export const Ghosts: React.FC<{ t: ShotTime }> = ({ t }) => {
  const groups: { at: number; who: Person; stools: number[] }[] = [
    { at: 0, who: MARCO, stools: [4] },
    { at: 38, who: painter(0), stools: [2, 3, 5] },
    { at: 78, who: { head: "#c9a0d6", coat: "#4a4a6a" }, stools: [6, 7, 8, 9, 1] },
  ];
  return (
    <DinerB t={t} {...lampDiner} cam={{ x: 1180, y: 800, zoom: 1.5 }} options={{ flip: false, lamps: "all" }}
      actors={<g>{groups.flatMap((g, gi) => g.stools.map((s, k) => {
        const sp = diner.spots[`stool${s}`];
        const who = gi === 1 ? painter(k) : gi === 2 ? { ...g.who, head: ["#c9a0d6", "#9fc0e0", "#e6a0a0", "#a8c97f", "#d9c26a"][k] } : g.who;
        return <Ghost key={`${gi}-${k}`} who={who} x={sp.x} y={sp.y} scale={sp.scale} facing={-1} k={ease(ramp(t.f, g.at + k * 4, g.at + k * 4 + 12))} time={t.f} />;
      }))}</g>}
      cast={[on("till", YOU, "sad", { behind: true, look: { x: 0.9, y: 0.3 } })]} push={[1, 1.05]} />
  );
};

/** You saved every wage (a full fan of cash) and lost a slice of every wage in town (the notes fly off one by one). */
export const SavedLost: React.FC<{ t: ShotTime }> = ({ t }) => {
  const gone = Math.floor(ramp(t.f, 70, 140) * 5);
  const hand = { x: 760, y: 560 };
  return (
    <DinerB t={t} {...lampDiner} cam="counter" options={{ flip: false }}
      cast={[on("till", YOU, t.f < 70 ? "happy" : "worried", { behind: true, pose: { ...STAND, armF: [140, 20] }, held: <CashFan s={1.2} n={Math.max(1, 6 - gone)} />, look: { x: 0.4, y: -0.6 } })]}
      actors={<g>{[0, 1, 2, 3, 4].map((i) => <NoteFly key={i} from={hand} to={{ x: 1500 + i * 80, y: 300 - i * 30 }} u={ramp(t.f, 70 + i * 14, 92 + i * 14)} />)}</g>}
      push={[1, 1.05]} pushAt={{ x: 760, y: 500 }} />
  );
};

export const ModelPaper: React.FC<{ t: ShotTime }> = ({ t }) => <OverDiner t={t} mood="lamp" card={<ModelAndNapkin f={t.f} />} />;
export const Crumbs: React.FC<{ t: ShotTime }> = ({ t }) => <OverDiner t={t} mood="lamp" card={<CrumbsCard f={t.f} />} />;
export const GoingRound: React.FC<{ t: ShotTime }> = ({ t }) => <OverDiner t={t} mood="lamp" card={<MoneyLoop f={t.f} />} />;

/** Your napkin got there first: you hold it up to the cooks; the screens beam back. */
export const NapkinFirst: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerB t={t} {...lampDiner} cam="counter" options={{ flip: false }}
    cast={[on("till", YOU, t.f < 60 ? "neutral" : "happy", { behind: true, pose: { ...STAND, armF: [mix(60, 100, ease(ramp(t.f, 50, 66))), mix(40, -10, ease(ramp(t.f, 50, 66)))] }, held: heldNapkin(LINES3), look: { x: 0.9, y: -0.1 } })]}
    push={[1, 1.05]} />
);

/** Marco at the glass, hands cupped, looking in at his old grill. */
export const MarcoAtGlass: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerB t={t} {...lampDiner} cam={{ x: 1180, y: 300, zoom: 1.9 }} options={{ flip: false, outside: marcoOutside(CUPPED) }} look={MARCO_FOCUS} push={[1, 1.05]} />
);

/** His old grill, cold, a steel cook beaming at it; Marco through the glass behind. */
export const OldGrill: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerB t={t} {...lampDiner} cam="grill" options={{ flip: false, outside: marcoOutside(CUPPED) }} push={[1, 1.05]} />
);

export const UnionHall: React.FC<{ t: ShotTime; part: "hall" | "cars" }> = ({ t, part }) => <OverDiner t={t} mood="lamp" card={<UnionStory f={t.f} part={part} />} />;
export const Ford: React.FC<{ t: ShotTime }> = ({ t }) => <OverDiner t={t} mood="lamp" card={<FordNote f={t.f / 1.6} />} />;

/** You're the manager: you at the till, the cooks behind you. */
export const YouManager: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerB t={t} {...lampDiner} cam="counter" options={{ flip: false, outside: marcoOutside() }}
    cast={[on("till", YOU, "sceptical", { behind: true, look: { x: -0.2, y: 0 } })]} push={[1.06, 1]} />
);

/** Marco's the one outside the glass, hands in his pockets. */
export const MarcoOutside: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerB t={t} {...lampDiner} cam={{ x: 1150, y: 320, zoom: 1.8 }} options={{ flip: false, outside: marcoOutside() }} look={MARCO_FOCUS} push={[1, 1.06]} />
);

// ---- The owners' meeting ------------------------------------------------------------------------------------------

const OWNERS: { stool: string; who: Person }[] = [
  { stool: "stool2", who: BOSS }, { stool: "stool3", who: BANKER }, { stool: "stool4", who: MAYOR }, { stool: "stool5", who: RIVAL }, { stool: "stool6", who: REPORTER },
];

/** The owners at your counter. `napkins` up (a card trick), `phones` in hand, `nod` the heads, `point` the rival. */
export const Owners: React.FC<{ t: ShotTime; napkins?: "raise" | "up" | "none"; phones?: boolean; point?: boolean; cam?: "wide" | "stools"; faceDown?: boolean }> = ({
  t, napkins = "none", phones, point, cam = "wide",
}) => {
  const up = napkins === "up" ? 1 : napkins === "raise" ? ease(ramp(t.f, 14, 24)) : 0;
  const cast: Member[] = OWNERS.map((o, i) => {
    const rival = o.who === RIVAL;
    const pose: Pose = point && rival ? { ...SEATED, armF: [95, 0] }
      : up > 0 ? { ...SEATED, tilt: 6 * Math.max(0, Math.sin(t.f * 0.3 + i)), armF: [mix(30, 82, up), mix(30, 6, up)] }
      : { ...SEATED, tilt: phones ? 8 * Math.max(0, Math.sin(t.f * 0.28 + i)) : 0, armF: phones ? [70, 50] : SEATED.armF };
    const held: ReactNode = up > 0.3 && !(point && rival) ? heldNapkin(LINES3) : phones ? <SmallAppPhone s={1.3} /> : undefined;
    const face: Face = point ? (rival ? "determined" : "sceptical") : up > 0.5 ? (i % 2 ? "happy" : "sceptical") : "neutral";
    const look = up > 0.5 ? { x: Math.sin(t.f * 0.12 + i * 1.7) > 0 ? 0.8 : -0.8, y: -0.2 } : point ? { x: 0.9, y: -0.1 } : { x: 0.5, y: 0.4 };
    return on(o.stool, o.who === REPORTER ? { ...REPORTER, wear: [] } : o.who, face, { pose, held, look });
  });
  return (
    <DinerB t={t} mood="night" cam={cam === "stools" ? { x: 980, y: 760, zoom: 1.35 } : "wide"} robots={4} grill="cold" options={{ flip: false, lamps: "all" }}
      cast={[...cast, on("till", YOU, point ? "worried" : "neutral", { behind: true, look: { x: 0.9, y: 0 } })]} push={[1, 1.04]} />
  );
};

export const StopFirstCard: React.FC<{ t: ShotTime }> = ({ t }) => <OverDiner t={t} mood="night" card={<StopFirst f={t.f} />} options={{ lamps: "all" }} />;

/** Still unchecked. Same napkin: the napkin alone, three lines. */
export const SameNapkin: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerB t={t} mood="night" cam="counter" robots={4} grill="cold" options={{ flip: false, lamps: "all" }} dim={0.55}
    overlay={<Napkin x={960} y={560} s={1.4} rot={3 - t.f * 0.03} scribbles={2} text={LINES3} />} push={[1, 1.05]} />
);

/** The planned silence: your phone on the counter, face up, not pinging. */
export const SilentPhone: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerB t={t} mood="night" cam={{ x: 680, y: 740, zoom: 2.2 }} robots={4} grill="cold" options={{ flip: false, lamps: "till" }}
    actors={<g transform={`translate(${DINER.till.x + 190} ${DINER.counter.top - 14})`}><SmallAppPhone faceUp s={2.2} /></g>} push={[1, 1.04]} />
);

/** The boss looks at his own phone, then at you, and turns it face down. */
export const BossFaceDown: React.FC<{ t: ShotTime }> = ({ t }) => {
  const down = t.f > 30;
  return (
    <DinerB t={t} mood="night" cam={{ x: 760, y: 720, zoom: 1.9 }} robots={4} grill="cold" options={{ flip: false, lamps: "all" }}
      cast={[
        on("stool2", BOSS, t.f < 14 ? "neutral" : "sad", { pose: { ...SEATED, armF: down ? [40, 40] : [65, 55] }, held: <SmallAppPhone s={1.3} lit={!down} rot={down ? 180 : -8} />,
          look: t.f < 14 ? { x: 0.4, y: 0.7 } : { x: 0.9, y: -0.1 } }),
        on("stool3", BANKER, "neutral"),
      ]} push={[1, 1.03]} />
  );
};

/** Through the window: the plant dark, its lot full of cars with no lights on. */
export const DarkLot: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerB t={t} mood="night" cam={{ x: 1050, y: 290, zoom: 1.75 }} robots={4} grill="cold" options={{ flip: false, lamps: "all", plant: "dark" }} look={{ focus: 0.45 }}
    far={() => (
      <g>
        {Array.from({ length: 16 }, (_, i) => <Car key={`a${i}`} x={560 + i * 120} y={404} s={0.3} color={["#6b6b80", "#5a6a7a", "#7a6a6a"][i % 3]} />)}
        {Array.from({ length: 14 }, (_, i) => <Car key={`b${i}`} x={620 + i * 136} y={424} s={0.36} color={["#5a5a6e", "#6a5a5a", "#4f5f6a"][i % 3]} />)}
      </g>
    )} push={[1, 1.07]} />
);

/** So the boss can't pay for five hundred shifts: the split-flap counter over the pie case rolls back to nothing. */
export const ShiftsRollBack: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerB t={t} mood="night" cam={{ x: 520, y: 420, zoom: 1.6 }} robots={4} grill="cold" options={{ flip: false, lamps: "all", board: "blank" }}
    wall={() => <ShiftCounter value={Math.max(0, 500 - t.f * 6)} />}
    cast={[on("till", YOU, t.f < 40 ? "worried" : "sad", { behind: true, look: { x: -0.4, y: -0.8 } })]} push={[1, 1.05]} />
);

/** Problem two: the till drawer opens on nothing; the four cooks beam. */
export const EmptyTill: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerB t={t} {...lampDiner} cam={{ x: 820, y: 640, zoom: 1.35 }} options={{ flip: false, till: ease(ramp(t.f, 30, 40)) }}
    cast={[on("till", YOU, t.f < 34 ? "neutral" : "sad", { behind: true, look: { x: -0.2, y: 0.7 } })]} push={[1, 1.05]} />
);

// ---- Make Them Buy ----------------------------------------------------------------------------------------------------

export const TypeCustomer: React.FC<{ t: ShotTime }> = ({ t }) => (
  <OverDiner t={t} mood="lamp" card={<TypePhone f={t.f} job="CUSTOMER" perLetter={4} start={2} value={0.62} />} />
);

/** The door chimes; a steel customer walks in on a chirp. */
export const CustomerIn: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerB t={t} {...lampDiner} cam="door" options={{ flip: false, door: 1, chime: t.f }}
    cast={[on("till", YOU, "shocked", { behind: true, look: { x: -0.8, y: 0 } })]}
    steel={[steelOn("door", { pose: walkPose(t.f * 0.3), dx: t.f * 5 })]} push={[1, 1.04]} />
);

const PIE_AT = { x: 930, y: DINER.counter.top - 12 };

/** On stool four it points at the pie; the steel waitress serves it. */
export const CustomerOrders: React.FC<{ t: ShotTime }> = ({ t }) => {
  const served = t.f > 24;
  return (
    <DinerB t={t} {...lampDiner} robots={0} cam="counter" options={{ flip: false }}
      cast={[on("till", YOU, "happy", { behind: true, look: { x: 0.9, y: 0.1 } })]}
      steel={[
        steelOn("stool4", { pose: t.f < 20 ? { ...SEATED, armF: [105, 0] } : SEATED }),
        steelOn("pass", { behind: true, dx: mix(-420, -260, ease(ramp(t.f, 0, 22))), pose: SERVE_POSE, held: served ? "none" : "pie", facing: 1 }),
      ]}
      actors={served && <Pie x={PIE_AT.x} y={PIE_AT.y} s={0.8} />} push={[1, 1.05]} />
  );
};

/** It taps its card; the till pings; your apron pocket goes light by the same amount. */
export const CustomerPays: React.FC<{ t: ShotTime; again?: boolean }> = ({ t, again }) => {
  const s = diner.spots.till;
  const hip = hipOf(s.x, s.y, s.scale, 1);
  const ping = ease(ramp(t.f, 8, 14)) * (1 - ease(ramp(t.f, 40, 50)));
  return (
    <DinerB t={t} {...lampDiner} robots={0} cam={again ? { x: 900, y: 640, zoom: 1.35 } : "counter"} options={{ flip: false, till: ping }}
      cast={[on("till", YOU, t.f < 12 ? "happy" : "worried", { behind: true, look: { x: 0.2, y: 0.8 } })]}
      steel={[steelOn("stool4", { pose: t.f < 16 ? { ...SEATED, armF: [100, 10] } : SEATED, held: t.f < 16 ? "card" : "none" })]}
      actors={<g><Pie x={PIE_AT.x} y={PIE_AT.y} s={0.8} /><CoinsOut x={hip.x} y={hip.y - 40} f={t.f} at={12} n={4} toward={{ x: DINER.till.x, y: DINER.till.y - 70 }} /></g>}
      push={[1, 1.05]} />
  );
};

export const CardIsYours: React.FC<{ t: ShotTime }> = ({ t }) => <OverDiner t={t} mood="lamp" card={<SameCard f={t.f} />} />;

/** It never eats the pie: the customer on stool four, screen beaming at the pie, close. */
export const PieSits: React.FC<{ t: ShotTime; cam?: Camera }> = ({ t, cam = { x: 1060, y: 740, zoom: 2.0 } }) => {
  const nudge = ease(ramp(t.f, 60, 76));
  return (
    <DinerB t={t} {...lampDiner} robots={0} cam={cam} options={{ flip: false }}
      steel={[
        steelOn("stool4", { pose: { ...SEATED, lean: 5 * Math.sin(t.f * 0.08) } }),
        steelOn("pass", { behind: true, dx: -280, pose: { ...SERVE_POSE, armF: [mix(40, 80, nudge), 20] }, facing: 1 }),
      ]}
      actors={<Pie x={PIE_AT.x + 20 * nudge} y={PIE_AT.y} s={0.8} />} push={[1, 1.06]} pushAt={{ x: 960, y: 600 }} />
  );
};

/** The boss in the doorway, coat on, hopeful. */
export const BossHopeful: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerB t={t} {...lampDiner} cam="door" options={{ flip: false, door: 1, chime: t.f }}
    cast={[
      on("door", { ...BOSS, wear: [{ kind: "longCoat", color: "#3a3d4a" }] }, t.f < 30 ? "relieved" : "happy", { dx: 40, pose: { ...STAND, armF: [100 + 10 * Math.sin(t.f * 0.2), 30], armB: [-60, 30] }, look: { x: 0.8, y: -0.1 } }),
      on("till", YOU, "sceptical", { behind: true, look: { x: -0.8, y: 0 } }),
    ]} push={[1, 1.05]} />
);

/** The plant halves its cars: the price board's tiles flip from four to two. */
export const PriceBoardShot: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={plantGate} mood="night" cam={{ x: 520, y: 440, zoom: 1.4 }} options={{ price: ramp(t.f, 6, 40), gate: 0 }} push={[1, 1.05]} />
);

/** The bread costs pennies: the shelf of loaves, priced at one cent, nobody buying. */
export const BreadPennies: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={shop} mood="night" options={{ kind: "market", pennies: true }}
    steel={[steelOn("right", { pose: { ...STAND, armF: [60, 30] } })]} push={[1.08, 1.02]} />
);

/** SALE in every window; the street empty. */
export const SaleStreet: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={square} mood="night" cam={{ x: 1250, y: 640, zoom: 1.2 }} options={{ windows: "sale" }} push={[1, 1.06]} />
);

export const PriceWage: React.FC<{ t: ShotTime }> = ({ t }) => (
  <OverDiner t={t} mood="lamp" card={<PriceAndWage f={t.f} />} />
);

