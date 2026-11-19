// Part B's shots added for script v2: the exchanges (the banker and the boss; the mayor and the rival; the reporter
// and Marco; the owners' "So we all stop" / "You stop first" / "No." / "Then nobody stops"), each cut to the speaker
// with the listener reacting; the guesses before the facts (the boss sure the machines killed the tellers; the
// owners laughing at a boss who doubles pay); the sixth Friday's whistle; the coins that crossed your counter; the
// overalls out of work; the worked sum on the napkin; every owner's slices making the town; midnight. No AI images.
import { SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import type { Camera } from "@whatif/kit/stage/Stage";
import { diner, DINER } from "../../sets/Diner";
import { BANKER, BOSS, MARCO_COAT, MAYOR, painter, REPORTER, RIVAL, townsfolk, worker, YOU, type Person } from "../Cast";
import { on, Place, steelOn, type Face, type Member } from "../Places";
import { Burger, SmallAppPhone } from "../Props";
import { SERVE_POSE } from "../Robot";
import { ease, mix, ramp, type ShotTime } from "../util";
import { CoinsOut, Ghost, hipOf } from "./bits";
import { bankHall, BigKey, plantGate, square } from "./sets";
import { SlicesTown, SumNapkin } from "./sum";
import { DinerB, FOLDED, HAT_IN_HANDS, lunch, nod, ORATE, OverDiner } from "./town";

const BRIGHT_NIGHT = { film: "contrast(1.1) brightness(1.35)" };
const shake = (f: number, p: Pose = STAND): Pose => ({ ...p, tilt: 8 * Math.sin(f * 0.45) });

// ---- The banker and the boss at lunch ---------------------------------------------------------------------------

/** The banker on stool six and the boss on stool four, a burger in his hand. `speaker` acts; `guess`: the boss shakes
 *  his head, sure the machines killed the tellers. */
export const BankerAndBoss: React.FC<{ t: ShotTime; speaker: "banker" | "boss"; guess?: boolean; smug?: boolean }> = ({ t, speaker, guess, smug }) => {
  const s4 = diner.spots.stool4, s6 = diner.spots.stool6;
  const boss = speaker === "boss";
  const at = boss ? s4 : s6;
  const cam: Camera = { x: 1200, y: 830, zoom: 1.6 };
  return (
    <DinerB t={t} mood="day" cam={cam} robots={4} plates="some"
      cast={[
        ...lunch(2, 3),
        on("stool4", BOSS, guess ? "determined" : boss ? "sceptical" : "neutral", {
          facing: 1, held: <Burger s={0.55} />,
          pose: guess ? shake(t.f, { ...SEATED, armF: [95, 30] }) : boss ? { ...SEATED, armF: [110 + 8 * Math.sin(t.f * 0.4), 20] } : { ...SEATED, armF: [70, 60] },
          look: { x: 0.8, y: boss || guess ? 0 : 0.2 },
        }),
        on("stool5", worker(7), "neutral"),
        on("stool6", BANKER, boss ? "sceptical" : smug ? "happy" : "sceptical", {
          pose: boss ? SEATED : { ...SEATED, armF: [115 + 10 * Math.sin(t.f * 0.3), 25] }, look: { x: 0.8, y: smug ? -0.3 : 0 },
        }),
      ]}
      steel={[steelOn("pass", { behind: true, dx: 70, pose: { ...SERVE_POSE, lean: 6, armF: [70, 20 + 10 * Math.sin(t.f * 0.5)] } })]}
      push={[1, 1.05]} pushAt={{ x: 960 + (at.x - cam.x) * cam.zoom, y: 420 }} />
  );
};

/** The guess: most people would guess the cash machines killed the tellers. The bank's teller windows, empty; a
 *  customer waiting at one, looking for someone. */
export const BankEmpty: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={bankHall} mood="day" cam={{ x: 820, y: 620, zoom: 1.3 }}
    cast={[
      on("cust2", townsfolk(1), t.f < 40 ? "neutral" : "worried", { pose: { ...STAND, tilt: 6 * Math.sin(t.f * 0.2) }, look: { x: 0.9, y: -0.3 } }),
      on("cust3", townsfolk(3), "sceptical", { dx: 60, look: { x: 0.8, y: -0.2 } }),
    ]} push={[1, 1.06]} />
);

// ---- The mayor and the rival on the square ------------------------------------------------------------------------

/** The mayor on the bandstand steps and the rival beside her, arms folded. `speaker` acts; `phone`: the rival has
 *  taken your phone out of the mayor's hand. */
export const MayorAndRival: React.FC<{ t: ShotTime; speaker: "mayor" | "rival"; answer?: boolean; phone?: boolean }> = ({ t, speaker, answer, phone }) => {
  const mayor = speaker === "mayor";
  return (
    <Place t={t} set={square} mood="day" cam={{ x: 1060, y: 660, zoom: 1.45 }}
      cast={[
        on("steps", MAYOR, phone ? "shocked" : mayor ? "happy" : "neutral", {
          pose: mayor ? { ...ORATE, armF: [(answer ? 140 : 125) + 10 * Math.sin(t.f * 0.25), 15], armB: answer ? [-120, 20] : ORATE.armB } : STAND,
          look: { x: 0.8, y: mayor ? -0.2 : 0.1 },
        }),
        on("near", RIVAL, phone ? "happy" : mayor ? "sceptical" : "determined", {
          dx: -20, facing: -1,
          pose: phone ? { ...STAND, armF: [135, 25] } : mayor ? nod(t.f, FOLDED) : { ...STAND, armF: [85, -40], armB: [55, 120] },
          held: phone ? <SmallAppPhone s={1.5} /> : undefined, look: { x: 0.8, y: -0.2 },
        }),
      ]} push={[1, 1.05]} pushAt={{ x: mayor ? 820 : 1220, y: 460 }} />
  );
};

/** And leaves that town with fewer wages to spend: the convoy rolls into the next town at dusk and its shop windows
 *  go dark one row at a time. */
export const NextTown: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={square} mood="dusk" cam={{ x: 1400, y: 600, zoom: 1.2 }}
    options={{ convoy: 300 + t.f * 9, windows: t.f < 34 ? "plain" : t.f < 52 ? "robots" : "dark" }} push={[1, 1.06]} pushAt={{ x: 1300, y: 500 }} />
);

// ---- The reporter, the crowd and Marco ------------------------------------------------------------------------------

/** The reporter in front of the convoy, a crowd behind her: painters with their masks, a teller in a cardigan, Marco in
 *  his coat. `marco`: the camera on Marco as he answers her. */
export const CrowdDream: React.FC<{ t: ShotTime; marco?: boolean }> = ({ t, marco }) => (
  <Place t={t} set={square} mood="dusk" cam={marco ? { x: 1880, y: 640, zoom: 1.6 } : { x: 1500, y: 640, zoom: 1.3 }}
    options={{ convoy: -500 + (t.f + (marco ? 240 : 150)) * 9, bunting: true }}
    cast={[
      on("near", YOU, marco ? "worried" : "happy", { dx: -60, pose: { ...STAND, armF: [95, -15] }, held: <BigKey s={0.75} rot={10} />, look: { x: 0.6, y: -0.2 } }),
      on("right", REPORTER, marco ? "shocked" : "happy", { dx: -100, facing: marco ? 1 : -1, pose: { ...STAND, armF: [marco ? 80 : 115, 25] }, look: { x: 0.6, y: -0.1 } }),
      on("right", painter(0), "sad", { dx: 90, facing: -1 }),
      on("right", { ...townsfolk(2), coat: "#b58f7a" }, "sad", { dx: 220, facing: -1 }),
      on("right", MARCO_COAT, marco ? "determined" : "sad", {
        dx: 360, facing: -1, pose: marco ? { ...STAND, armF: [75 + 6 * Math.sin(t.f * 0.3), 30] } : STAND, look: { x: 0.8, y: 0 },
      }),
      on("right", painter(2), "sad", { dx: 490, facing: -1 }),
    ]} push={[1, 1.05]} />
);

// ---- The sixth Friday ---------------------------------------------------------------------------------------------

/** The whistle blows, the gate opens, and nobody comes out (on the words). */
export const SixthFriday: React.FC<{ t: ShotTime; whistleAt?: number; gateAt?: number }> = ({ t, whistleAt = 48, gateAt = 91 }) => (
  <Place t={t} set={plantGate} mood="night" cam={{ x: 1030, y: 640, zoom: 1.2 }}
    options={{ gate: ease(ramp(t.f, gateAt, gateAt + 24)), whistle: t.f >= whistleAt ? 1 : 0 }} look={BRIGHT_NIGHT} push={[1, 1.07]} />
);

/** Every coin that ever crossed your counter came out of an overall's pocket: faint lunch crowds, each flicking a coin
 *  over to your till. */
export const CoinsAcross: React.FC<{ t: ShotTime }> = ({ t }) => {
  const till = { x: DINER.till.x, y: DINER.till.y - 70 };
  return (
    <DinerB t={t} mood="night" cam={{ x: 880, y: 760, zoom: 1.45 }} robots={4} grill="cold" options={{ flip: false, lamps: "all" }}
      cast={[on("till", YOU, "neutral", { behind: true, look: { x: 0.9, y: 0.3 } })]}
      actors={<g>
        {[1, 2, 3, 4, 5].map((s, i) => {
          const sp = diner.spots[`stool${s}`];
          const hip = hipOf(sp.x, sp.y, sp.scale, -1, SEATED);
          return (
            <g key={s}>
              <Ghost who={worker(s)} x={sp.x} y={sp.y} scale={sp.scale} facing={-1} k={ease(ramp(t.f, i * 6, i * 6 + 12))} time={t.f} />
              {[0, 1, 2].map((k) => <CoinsOut key={k} x={hip.x} y={hip.y} f={t.f} at={10 + i * 9 + k * 34} n={1} len={22} toward={till} />)}
            </g>
          );
        })}
      </g>} push={[1, 1.05]} />
  );
};

/** You've just put every overall in town out of work: outside the shut gate at night, hard hats in their hands. */
export const OutOfWork: React.FC<{ t: ShotTime }> = ({ t }) => {
  const hat = (k: number): Member => on(k < 2 ? "near" : k < 3 ? "gate" : "right", { ...worker(k * 2 + 1), wear: [] }, k % 2 ? "sad" : "worried", {
    dx: [0, 200, -40, 0][k], pose: nod(t.f + k * 9, HAT_IN_HANDS), facing: k < 2 ? 1 : -1, look: { x: 0.3, y: 0.6 },
  });
  return (
    <Place t={t} set={plantGate} mood="night" cam={{ x: 1000, y: 680, zoom: 1.2 }} options={{ gate: 0 }} look={BRIGHT_NIGHT}
      cast={[0, 1, 2, 3].map(hat)} push={[1.06, 1]} />
  );
};

// ---- The worked sum ------------------------------------------------------------------------------------------------

/** The napkin, drawn large, the sum worked on the words. `from` is the frame of the line the shot starts in. */
export const ExplainSum: React.FC<{ t: ShotTime; from?: number; zoom?: [number, number] }> = ({ t, from = 0, zoom = [1, 1] }) => (
  <DinerB t={t} mood="lamp" cam="counter" robots={4} grill="cold" options={{ flip: false }} dim={0.62}
    cast={[on("till", YOU, "neutral", { behind: true })]}
    overlay={<SumNapkin f={t.f + from} zoom={mix(zoom[0], zoom[1], ease(t.p))} />} push={[1, 1.03]} />
);

export const ExplainSlices: React.FC<{ t: ShotTime }> = ({ t }) => (
  <OverDiner t={t} mood="lamp" card={<SlicesTown f={t.f} />} />
);

// ---- Ford: the guess ----------------------------------------------------------------------------------------------

/** You'd think a boss who doubled his workers' pay had lost his mind: the boss laughs, a finger circling his temple;
 *  the banker laughs with him. */
export const BossScoffs: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerB t={t} mood="night" cam={{ x: 820, y: 740, zoom: 1.7 }} robots={4} grill="cold" options={{ flip: false, lamps: "all" }}
    cast={[
      on("stool2", BOSS, "happy", { facing: 1, pose: { ...SEATED, tilt: -6 + 6 * Math.sin(t.f * 0.5), armF: [160, 150 + 20 * Math.sin(t.f * 0.6)] }, look: { x: 0.8, y: -0.2 } }),
      on("stool3", BANKER, "happy", { pose: nod(t.f * 1.4, SEATED), look: { x: 0.8, y: -0.1 } }),
      on("till", YOU, "sceptical", { behind: true, look: { x: 0.9, y: 0.2 } }),
    ]} push={[1, 1.04]} />
);

// ---- The owners' exchange ------------------------------------------------------------------------------------------

const OWNERS: { stool: string; who: Person; name: "boss" | "banker" | "mayor" | "rival" | "reporter" }[] = [
  { stool: "stool2", who: BOSS, name: "boss" }, { stool: "stool3", who: BANKER, name: "banker" }, { stool: "stool4", who: MAYOR, name: "mayor" },
  { stool: "stool5", who: RIVAL, name: "rival" }, { stool: "stool6", who: { ...REPORTER, wear: [] }, name: "reporter" },
];

/** The owners at your counter, phones in hand; the speaker acts, the rest turn to them. */
export const OwnersTalk: React.FC<{ t: ShotTime; speaker: "rival" | "boss" | "rivalNo" | "banker" }> = ({ t, speaker }) => {
  const who = speaker === "rivalNo" ? "rival" : speaker;
  const sp = diner.spots[OWNERS.find((o) => o.name === who)!.stool];
  const cam: Camera = { x: Math.max(900, Math.min(1300, sp.x + 40)), y: 760, zoom: 1.85 };
  const cast: Member[] = OWNERS.map((o) => {
    const me = o.name === who;
    let pose: Pose = { ...SEATED, armF: [70, 50] };
    let face: Face = "neutral";
    let facing: 1 | -1 | undefined;
    let held: React.ReactNode = <SmallAppPhone s={1.3} />;
    if (me && speaker === "rival") { pose = { ...SEATED, armF: [95, -30] }; face = "relieved"; held = undefined; }
    if (me && speaker === "boss") { pose = { ...SEATED, armF: [95, 0] }; face = "determined"; facing = 1; held = undefined; }
    if (me && speaker === "rivalNo") { pose = shake(t.f, { ...SEATED, armF: [55, 120], armB: [55, 120] }); face = "determined"; held = undefined; }
    if (me && speaker === "banker") { pose = { ...SEATED, armF: [70, 80], armB: [-70, -80] }; face = "sad"; held = undefined; }
    if (!me) face = speaker === "banker" ? "sad" : speaker === "boss" ? "sceptical" : speaker === "rivalNo" ? "worried" : "sceptical";
    if (!me && o.name === "boss" && speaker === "rivalNo") face = "sceptical";
    const look = me ? { x: 0.7, y: -0.1 } : { x: diner.spots[o.stool].x < sp.x ? -0.9 : 0.9, y: -0.1 };
    const turn = facing ?? (!me && diner.spots[o.stool].x < sp.x ? 1 : undefined);
    return on(o.stool, o.who, face, { pose, held, look, ...(turn ? { facing: turn } : {}) });
  });
  return (
    <DinerB t={t} mood="night" cam={cam} robots={4} grill="cold" options={{ flip: false, lamps: "all" }}
      cast={[...cast, on("till", YOU, "worried", { behind: true, look: { x: 0.9, y: 0 } })]}
      push={[1, 1.06]} pushAt={{ x: 960 + (sp.x - cam.x) * cam.zoom, y: 480 }} />
  );
};

// ---- Midnight -------------------------------------------------------------------------------------------------------

/** At midnight you try to fix it with one more word: the clock over the grill ticks to twelve; your phone lit. */
export const Midnight: React.FC<{ t: ShotTime }> = ({ t }) => (
  <DinerB t={t} mood="night" cam={{ x: 1800, y: 300, zoom: 1.6 }} robots={4} grill="cold" options={{ flip: false, lamps: "all", clock: mix(11.93, 12.0, ease(ramp(t.f, 4, 50))) }}
    push={[1, 1.05]} />
);

