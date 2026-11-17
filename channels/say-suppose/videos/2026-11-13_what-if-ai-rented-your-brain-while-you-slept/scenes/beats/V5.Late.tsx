// The v5 moments in the film's second half (script.md v5). Every frame from shot.v3 (current numbering, V5 in V5.Kit).
//
//   91-92  The Warehouses: the top of the ramp at dusk, the border's paper sign; a new line stamps onto it, wet:
//          NO SLEEPING ON A VISITOR VISA (91). Pull back: right under it, three men in grey suits with their shoeboxes,
//          handing bands to the queue; the middle one glances up at the sign, shrugs, carries on (92).
//   105    The Contract: INSERT the shoe drawing from Crumbs in the grey suit's hand; he turns it the right way up,
//          tilts it one way, then the other: "Is that a shoe?"
//   136    Morning, the twist: the street in broad daylight, you at the right looking up it: everyone standing awake,
//          eyes open, a small red light on every forehead, and over each of them a pale second self typing.
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND } from "@whatif/kit/rig/pose";
import { street } from "@whatif/kit/sets";
import { setLook } from "@whatif/kit/sets/common";
import { FONT } from "@whatif/kit/fonts";
import { LookContext } from "@whatif/kit/stage/Look";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { Band, deviceAt, Ghost, PaperCap, Thread } from "../parts";
import { BRIDGE, BridgeScene } from "../sets/Bridge";
import { lighten } from "../sets/Warehouse";
import { BOSS, BRIDGE_WOMAN, BROKER, camAt, CLERK, current, GRANDMOTHER, lineEnd, mix, NURSE, PASTELS, ramp } from "../shared";
import { ShoeDrawing, TopDown, TopHand } from "./Crumbs.Kitchen";
import { aimArm, handAt, headOf, You, type Body } from "./Crumbs.Rig";
import { Broker } from "./Warehouses.Parts";
import { atV, BandAwake, bandAwakeLight, RED_LIGHT, V5 } from "./V5.Kit";

// ------------------------------------------------------------------------------------------------ 91-92: the sign

export function signSpan(v3: Clip[]) {
  return { from: v3[V5.sign].from - 4, to: v3[V5.suits + 1].from - 2 };
}

const SIGN = { x: 1300, top: 320, w: 640, h: 230 };
const SUITS = [1165, 1300, 1435];

/** The border's paper sign on its post; the new rule stamps on at `stamp`. */
const BorderSign: React.FC<{ frame: number; stamp: number }> = ({ frame, stamp }) => {
  const s = frame < stamp ? 0 : 1 + 0.3 * (1 - Math.min(1, (frame - stamp) / 6));
  const wet = frame < stamp ? 0 : 1 - ramp(frame, stamp + 30, stamp + 90) * 0.25;
  const cx = SIGN.x;
  return (
    <g>
      <rect x={cx - 12} y={SIGN.top + SIGN.h} width={24} height={BRIDGE.floor - SIGN.top - SIGN.h} fill="#6f6a66" stroke={INK} strokeWidth={4} />
      <rect x={cx - SIGN.w / 2 + 10} y={SIGN.top + 12} width={SIGN.w} height={SIGN.h} rx={10} fill="#000" opacity={0.22} />
      <rect x={cx - SIGN.w / 2} y={SIGN.top} width={SIGN.w} height={SIGN.h} rx={10} fill={PAPER} stroke={INK} strokeWidth={6} />
      {/* the rules already on it: plain bars, no lettering */}
      <rect x={cx - 250} y={SIGN.top + 26} width={500} height={16} rx={8} fill="#8a96a8" opacity={0.7} />
      <rect x={cx - 250} y={SIGN.top + 56} width={360} height={16} rx={8} fill="#8a96a8" opacity={0.7} />
      {s > 0 && (
        <g transform={`translate(${cx} ${SIGN.top + 150}) rotate(-3) scale(${s})`} opacity={0.92 * wet + 0.08}>
          <text x={0} y={-12} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill={CRIMSON}>NO SLEEPING ON A</text>
          <text x={0} y={50} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill={CRIMSON}>VISITOR VISA</text>
        </g>
      )}
    </g>
  );
};

export const VisaSign: React.FC<{ frame: number; v3: Clip[] }> = ({ frame, v3 }) => {
  const { from, to } = signSpan(v3);
  const stamp = atV(v3, V5.sign, 0.52);
  const suits = v3[V5.suits].from - 2;
  const glance = [atV(v3, V5.suits, 0.5), atV(v3, V5.suits, 0.78)] as const;
  const shot = current(frame, [[from, "sign"], [suits, "suits"]]);
  const cams: Record<typeof shot, Camera> = {
    // G3 (it read as a held frame): a real push across the line, from the queue under the sign onto the stamp; one even
    // move, slow under the voice (owner, G3 note 3)
    sign: camAt(frame, [[from, { x: SIGN.x - 30, y: 480, zoom: 1.75 }], [suits, { x: SIGN.x, y: 440, zoom: 2.05 }]]),
    // v7: a cut to the three suits under the sign, then a slow push (v5 pulled from 1.95 to 1.28 in about a second under
    // "The three men in grey suits")
    suits: camAt(frame, [[suits, { x: 1250, y: 600, zoom: 1.32 }], [Math.max(suits + 1, to), { x: 1250, y: 585, zoom: 1.42 }]]),
  };
  const scale = 1.1;
  const looking = frame >= glance[0] && frame < glance[1];
  // the left one hands a band down the queue (his front arm low, at the walkers' hands)
  const giver: Body = { x: SUITS[0], y: BRIDGE.floor, scale, facing: -1, pose: STAND };
  const reachK = (Math.sin(frame / 14) + 1) / 2;
  giver.pose = { ...STAND, armF: aimArm(giver, { x: SUITS[0] - mix(90, 150, reachK), y: BRIDGE.floor - 200 }) };
  const hand = handAt(giver, "front");
  const mid: Body = { x: SUITS[1], y: BRIDGE.floor, scale, facing: 1, pose: { ...STAND, tilt: looking ? -14 : 0 } };
  const under = (
    <g>
      <BorderSign frame={frame} stamp={stamp} />
      <Broker x={SUITS[2]} y={BRIDGE.floor} scale={scale} facing={1} frame={frame} seed={2} face={{ mouth: "smirk", look: { x: 1, y: 0.1 } }} />
      <Broker x={mid.x} y={mid.y} scale={scale} facing={1} frame={frame} seed={1} pose={mid.pose}
        face={looking ? { brows: "raised", lids: 0, mouth: "o", look: { x: 0.2, y: -1 } } : { mouth: "smirk", brows: "flat", look: { x: 1, y: 0.1 } }} />
      <Broker x={giver.x} y={giver.y} scale={scale} facing={-1} frame={frame} pose={giver.pose} face={{ mouth: "smirk", look: { x: 1, y: 0.2 } }} />
      <Band x={hand.x - 10} y={hand.y + 6} scale={0.45} lit tilt={-10} />
    </g>
  );
  return <BridgeScene frame={frame} mood="dusk" cam={drift(cams[shot], frame, "v5-sign", 2)} queue={7} walk={1.6} under={under} />;
};

// ------------------------------------------------------------------------------------------------ 105: is that a shoe?

export function shoeSpan(v3: Clip[]) {
  const from = v3[V5.shoe].from - 4;
  return { from, to: Math.max(from + 20, Math.min(lineEnd(v3, V5.shoe) + 8, v3[V5.closes].from - 6)) };
}

export const ShoeQuery: React.FC<{ frame: number; v3: Clip[] }> = ({ frame, v3 }) => {
  const { from, to } = shoeSpan(v3);
  const turn = ramp(frame, from, from + 14);
  const tipA = ramp(frame, atV(v3, V5.shoe, 0.3), atV(v3, V5.shoe, 0.45));
  const tipB = ramp(frame, atV(v3, V5.shoe, 0.62), atV(v3, V5.shoe, 0.8));
  const tilt = mix(180, -4, turn) + 16 * tipA - 30 * tipB;
  // his grey hand on the page's lower right corner, turning with it
  const a = (tilt * Math.PI) / 180;
  const corner = { x: 470, y: 290 };
  const hand = { x: 960 + corner.x * Math.cos(a) - corner.y * Math.sin(a), y: 560 + corner.x * Math.sin(a) + corner.y * Math.cos(a) };
  const cam = drift(camAt(frame, [[from, { x: 960, y: 560, zoom: 1.08 }], [to, { x: 960, y: 560, zoom: 1.16 }]]), frame, "v5-shoe", 2);
  return (
    <TopDown frame={frame} cam={cam} mood="lamp">
      <ShoeDrawing from={from - 80} to={from - 40} tilt={tilt} />
      <TopHand x={hand.x + 40} y={hand.y + 60} rot={tilt - 30} color={BROKER.head} />
    </TopDown>
  );
};

// ------------------------------------------------------------------------------------------------ 136: the twist

export function twistSpan(v3: Clip[]) {
  return { from: v3[V5.twist].from - 4, to: v3[V5.card].from - 2 };
}

type Waker = { x: number; head: string; coat: string; facing: 1 | -1; tie?: string; cap?: boolean; prop: "bag" | "mug" | "clip" | "phone" };
// G3: the last 15 s keep the right third of the frame quiet for the end screens, so the street's people stand closer
// (180 apart, was 200) and you stand at the crowd's right end, all inside the left two-thirds of the frame.
const WAKERS: Waker[] = [
  { x: 420, head: BRIDGE_WOMAN.head, coat: BRIDGE_WOMAN.coat, facing: 1, prop: "bag" },
  { x: 600, head: BOSS.head, coat: BOSS.coat, tie: BOSS.tie, facing: 1, prop: "mug" },
  { x: 780, head: CLERK.head, coat: CLERK.coat, facing: -1, prop: "clip" },
  { x: 960, head: NURSE.head, coat: NURSE.coat, facing: 1, cap: true, prop: "phone" },
  { x: 1140, head: GRANDMOTHER.head, coat: GRANDMOTHER.coat, facing: -1, prop: "phone" },
  { x: 1320, head: PASTELS[0], coat: "#5a6488", facing: 1, prop: "phone" },
];

const Held: React.FC<{ prop: Waker["prop"] }> = ({ prop }) => {
  if (prop === "bag") return <g><path d="M-12 -2 q12 -26 24 0" fill="none" stroke={INK} strokeWidth={4} /><rect x={-22} y={-2} width={44} height={52} rx={6} fill="#e6a0a0" stroke={INK} strokeWidth={4} /></g>;
  if (prop === "mug") return <g><rect x={-14} y={-30} width={28} height={32} rx={5} fill={PAPER} stroke={INK} strokeWidth={4} /><path d="M14 -24 q14 2 0 16" fill="none" stroke={INK} strokeWidth={4} /></g>;
  if (prop === "clip") return <g><rect x={-26} y={-50} width={52} height={66} rx={4} fill="#c9a36b" stroke={INK} strokeWidth={4} /><rect x={-20} y={-42} width={40} height={50} fill={PAPER} /></g>;
  return <g transform="rotate(-10)"><rect x={-14} y={-44} width={28} height={50} rx={5} fill="#1b1d24" /><rect x={-11} y={-40} width={22} height={40} rx={2} fill="#cfe9f4" /></g>;
};

export const DaytimeStreet: React.FC<{ frame: number; v3: Clip[]; until?: number }> = ({ frame, v3, until }) => {
  const { from, to } = twistSpan(v3);
  // script v6: the awake street holds to the end of the film, pushing in slowly under the end tags (`until`)
  // G3: framed so everyone sits in the left two-thirds (screen x < 1280 at every zoom here); the right third is the
  // quiet street for the end screens. A slow push from 1.0 to 1.08.
  const keys: [number, { x: number; y: number; zoom: number }][] = [[from, { x: 1210, y: 660, zoom: 1.0 }], [Math.max(from + 1, to), { x: 1205, y: 655, zoom: 1.04 }]];
  if (until !== undefined && until > to + 1) keys.push([until, { x: 1200, y: 650, zoom: 1.08 }]);
  const cam = drift(camAt(frame, keys), frame, "v5-twist", 2);
  const props = { cam, mood: "day" as const, frame, options: { ...street.defaults, crowd: false, auto: false } };
  const s = 1.0;
  const y = 1010;
  const people = WAKERS.map((w, i) => {
    const body: Body = { x: w.x, y, scale: s, facing: w.facing, pose: { ...STAND, armF: [52 + 6 * Math.sin(frame / 9 + i), 64] } };
    const h = headOf(body);
    const light = bandAwakeLight(body);
    const g = { x: h.x + w.facing * 6, y: h.y - 64 };
    const t = deviceAt(frame, from + 2 + i * 3);
    return (
      <g key={i}>
        <Figure x={body.x} y={body.y} scale={s} facing={w.facing} pose={body.pose} head={w.head} coat={w.coat} tie={w.tie}
          eyes={1.15} lids={0} brows="none" mouth="flat" look={{ x: 0.9, y: 0 }} time={frame} held={<Held prop={w.prop} />} />
        {w.cap && <PaperCap x={h.x} y={h.y} r={h.r} />}
        <BandAwake body={body} color={RED_LIGHT} />
        <Thread a={light} b={{ x: g.x - w.facing * 10, y: g.y - 60 }} t={t} bend={-30 * w.facing} />
        <Ghost x={g.x} y={g.y} scale={0.5} t={t} frame={frame + i * 7} facing={w.facing} head={lighten(w.head, 0.62)} worry={false} />
      </g>
    );
  });
  const me: Body = { x: 1430, y: y + 20, scale: 1.2, facing: -1, pose: { ...STAND } };
  const actors = (
    <>
      {people}
      <You body={me} face={{ brows: "raised", lids: 0, mouth: "flat", eyes: 1.2, look: { x: 1, y: -0.05 } }} frame={frame} />
    </>
  );
  return (
    <LookContext.Provider value={setLook(street.lights(props.options), "day", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={street.Back(props)} actors={actors} front={street.Front?.(props)} />
    </LookContext.Provider>
  );
};
