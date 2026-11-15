// Random's food-court scenes (builder a): the coffee stall in the morning (3.60, the cup across the steel, the tap on
// the board, "You're up today."), your best friend's coin at the stall (FLIPS AGAIN 90%, then 70%, the hand that goes
// back into the pocket on its own, "It's in my head.", the hand that creeps back and gets slapped, the card that ticks
// anyway), and the court filling for lunch, a card over every head, ticking like a clock shop, and you reading them.
// Cards over people with no `> TAG:` in the script carry digits only.
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { Tag, type BoardKey, type TagKey } from "../device";
import { aimArm, handAt, headAt } from "../kit";
import { camAt, current, mix, ramp } from "../shared";
import { COURT } from "../sets/FoodCourt";
import { CL, CloseShot, Coin, CourtShot, EXTRAS, friendBody, friendHead, IcedCoffee, type Face, type Mood } from "./TheLamp.Court";

export interface CourtTimes {
  coffee: number; // line 19
  dearer: number; // the board flaps to 3.60
  tap: number; // she taps the board
  upToday: number; // line 20
  upEnd: number;
  coin: number; // line 21
  coinEnd: number;
  pocketAgain: number; // the hold: the hand goes back into the pocket on its own
  head: number; // line 23 "It's in my head."
  headEnd: number;
  reach: number; // line 24 "A coin can't choose for you."
  creep: number; // "You still choose to flip it.": his hand creeps to the coin
  slap: number; // his other hand slaps it away
  saw: number; // "And it saw you reach.": the card ticks anyway
  lunch: number; // line 25
  pan: number;
  you: number; // "So you stop fighting your tag.": you, reading the queue's cards
  end: number;
}

// ------------------------------------------------------------------------------------------------ the coffee stall

const YOU_AT = 1345;

const coffeePrice = (k: CourtTimes): BoardKey[] => [{ at: -1e4, value: "1.50" }, { at: k.dearer, value: "3.60" }];

/** Lines 19-20: your coffee costs more this morning; she taps the board, eyebrows up; "You're up today." */
export const CoffeeMorning: React.FC<{ frame: number; k: CourtTimes; mood: Mood }> = ({ frame, k, mood }) => {
  const sh = headAt(COURT.coffee.seller.x, COURT.floor, COURT.scale, STAND, -1);
  const close = frame >= k.upToday;
  const cam = close
    ? drift(camAt(frame, [[k.upToday, closeUp(sh.x - 60, sh.y - 110, 1.85)], [k.coin, closeUp(sh.x - 60, sh.y - 110, 1.95)]]), frame, "up", 2)
    : drift(camAt(frame, [[k.coffee, { x: 1560, y: 440, zoom: 1.45 }], [k.upToday, { x: 1580, y: 430, zoom: 1.58 }]]), frame, "morning-coffee", 2);
  const slide = ramp(frame, k.coffee + 4, k.coffee + 18);
  const cupX = mix(1600, 1450, slide);
  const cup = { x: cupX, y: COURT.coffee.top - 26 };
  const sellerB = { x: COURT.coffee.seller.x, y: COURT.floor, scale: COURT.scale, pose: STAND, facing: -1 as const };
  const tapping = frame >= k.tap;
  const tapBob = tapping ? Math.abs(Math.sin((frame - k.tap) / 3)) * 18 : 0;
  const sellerArm: [number, number] = tapping ? aimArm(sellerB, { x: 1790, y: 300 + tapBob }) : frame < k.coffee + 20 ? aimArm(sellerB, { x: cupX + 30, y: cup.y }) : [10, 30];
  const talking = frame >= k.upToday && frame < k.upEnd && Math.floor((frame - k.upToday) / 4) % 2 === 0;
  const youB = { x: YOU_AT, y: COURT.floor, scale: COURT.scale, pose: { ...STAND, lean: 6 }, facing: 1 as const };
  const taken = frame >= k.coffee + 26;
  const youArm: [number, number] = taken ? aimArm(youB, { x: 1440, y: 700 }) : aimArm(youB, { x: mix(1400, cup.x, slide), y: mix(820, cup.y, slide) });
  const tags: Record<string, TagKey[]> = {
    you: [{ at: -1e4, text: "", pct: 96, state: "tick" }],
    friend: [{ at: -1e4, text: "", pct: 98, state: "tick" }],
    seller: [{ at: -1e4, text: "", pct: 98, state: "tick" }],
  };
  // comic dismay at the board, then a squint at her when she taps it
  const youFace: Face = frame >= k.tap + 6 ? { brows: "angry", lids: 0.35, mouth: "smirk", eyes: 1, look: { x: 1, y: 0 } }
    : frame >= k.dearer + 4 ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 1, y: -0.75 } }
    : { brows: "none", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 1, y: 0.2 } };
  return (
    <CourtShot frame={frame} cam={cam} mood={mood} tags={tags} priceKeys={coffeePrice(k)} pillarKeys={[{ at: -1e4, value: "125" }]} lampOn={-1e4}
      you={{ x: YOU_AT, facing: 1, pose: { ...youB.pose, armF: youArm }, face: youFace, held: taken ? <IcedCoffee x={6} y={-8} /> : undefined }}
      friend={{ face: { lids: 0.3, mouth: "flat", look: { x: 0.6, y: 0.7 } } }}
      seller={{ pose: tapping ? { ...STAND, armB: sellerArm, armF: [10, 30] } : { ...STAND, armF: sellerArm }, face: tapping || close ? { brows: "raised", lids: 0.2, mouth: talking ? "open" : "smirk", eyes: 1.05, look: { x: 1, y: 0 } } : { lids: 0.35, look: { x: 0.3, y: 0.8 } } }}
      extra={!taken ? <IcedCoffee x={cup.x} y={cup.y} scale={2.2} /> : undefined} />
  );
};

export const coffeeSounds = (k: CourtTimes) => coffeePrice(k);

// ------------------------------------------------------------------------------------------------ the coin

/** The coin's keys over your best friend: FLIPS AGAIN 90% ticks when he flips; then 70%, and it ticks again. */
export function coinTags(k: CourtTimes): { friend: TagKey[]; you: TagKey[] } {
  const flip1 = k.coin + 6;
  const flip2 = k.pocketAgain + 38;
  return {
    friend: [
      { at: k.coin - 4, text: "FLIPS AGAIN", pct: 90, state: "new" },
      { at: flip1 + 18, text: "FLIPS AGAIN", pct: 90, state: "tick" },
      { at: flip1 + 34, text: "FLIPS AGAIN", pct: 70, state: "new" },
      { at: flip2 + 18, text: "FLIPS AGAIN", pct: 70, state: "tick" },
      { at: k.saw, text: "FLIPS AGAIN", pct: 70, state: "tick" }, // it saw him reach
    ],
    you: [{ at: -1e4, text: "", pct: 95, state: "tick" }],
  };
}

const FOLD: Pose = { ...STAND, armF: [25, 100], armB: [25, 100] };

/** Line 21, the hold and line 22: the coin. */
export const CoinShot: React.FC<{ frame: number; k: CourtTimes; mood: Mood }> = ({ frame, k, mood }) => {
  const tags = coinTags(k);
  const flip1 = k.coin + 6, flip2 = k.pocketAgain + 38;
  const flipAt = frame >= flip2 - 2 ? flip2 : flip1;
  const t = (frame - flipAt) / 18;
  const inAir = t >= 0 && t < 1;
  const fh = friendHead(STAND);
  const cardY = fh.y - fh.r - fh.r * 0.95 * 0.72 * 2.1 + 40;
  const on = current(frame, [[k.coin - 8, "two"], [flip1 + 32, "card"], [k.pocketAgain, "again"], [k.head, "head"], [k.reach, "coin"], [k.creep - 8, "reach"], [k.saw, "saw"]]);
  const cams: Record<typeof on, Camera> = {
    two: camAt(frame, [[k.coin - 8, { x: 1000, y: 540, zoom: 1.0 }], [flip1 + 32, { x: 1040, y: 520, zoom: 1.08 }]]),
    card: camAt(frame, [[flip1 + 32, insert(fh.x - 30, cardY + 30, 2.6)], [k.pocketAgain, insert(fh.x - 30, cardY + 30, 2.85)]]),
    again: camAt(frame, [[k.pocketAgain, { x: 1240, y: 600, zoom: 1.5 }], [k.head, { x: 1250, y: 600, zoom: 1.6 }]]),
    head: camAt(frame, [[k.head, closeUp(fh.x - 60, fh.y - 60, 2.1)], [k.reach, closeUp(fh.x - 60, fh.y - 60, 2.2)]]),
    coin: camAt(frame, [[k.reach, insert(1290, CL.top - 30, 3.0)], [k.creep - 8, insert(1290, CL.top - 30, 3.2)]]),
    reach: camAt(frame, [[k.creep - 8, { x: 1200, y: 640, zoom: 1.45 }], [k.saw, { x: 1210, y: 630, zoom: 1.52 }]]),
    saw: camAt(frame, [[k.saw, { x: 1000, y: 520, zoom: 1.04 }], [k.lunch, { x: 1010, y: 510, zoom: 1.1 }]]),
  };
  const cam = drift(cams[on], frame, `coin-${on}`, 2);
  // his front hand: the thumb with the coin; the pocket; the fold; back to the pocket; the drop; the wipe
  const thumb = { x: 1390, y: 760 };
  const pocket = { x: 1560, y: 1130 };
  const apron = { x: 1500 + Math.sin(frame / 2.5) * 30, y: 980 };
  const folded = frame >= flip1 + 26 && frame < k.pocketAgain;
  const drop = flip2 + 22;
  let target = thumb;
  const coinAt = { x: 1280, y: CL.top - 10 };
  const creep = ramp(frame, k.creep, k.slap);
  if (frame >= k.slap + 4) target = { x: mix(coinAt.x, 1420, ramp(frame, k.slap, k.slap + 6)), y: mix(coinAt.y, 1040, ramp(frame, k.slap, k.slap + 6)) };
  else if (frame >= k.creep) target = { x: mix(apron.x, coinAt.x, creep), y: mix(980, coinAt.y, creep) };
  else if (frame >= drop + 6) target = apron;
  else if (frame >= drop) target = { x: 1330, y: 880 };
  else if (frame >= k.pocketAgain + 16) target = thumb;
  else if (frame >= k.pocketAgain) target = { x: mix(thumb.x, pocket.x, ramp(frame, k.pocketAgain, k.pocketAgain + 8)), y: mix(thumb.y, pocket.y, ramp(frame, k.pocketAgain, k.pocketAgain + 8)) };
  else if (frame >= flip1 + 20) target = pocket;
  const fPose0: Pose = { ...STAND, lean: 6 };
  // the slap: his other hand comes down on the creeping one
  const slapping = frame >= k.slap - 4 && frame < k.slap + 8;
  const handNow = handAt(friendBody({ ...fPose0, armF: aimArm(friendBody(fPose0), target) }), "front");
  const armB: [number, number] = slapping ? aimArm(friendBody(fPose0), { x: handNow.x + 10, y: handNow.y - (frame < k.slap ? 60 : 0) }) : fPose0.armB;
  const fPose: Pose = folded ? { ...FOLD, tilt: -10 } : { ...fPose0, tilt: frame >= k.saw ? -14 : frame >= flip1 + 34 ? -10 : 0, armF: aimArm(friendBody(fPose0), target), armB };
  const hand = handAt(friendBody(fPose), "front");
  const onThumb = !folded && !inAir && frame < drop && (frame < flip1 + 20 || frame >= k.pocketAgain + 10);
  const lookingAtCoin = frame >= k.pocketAgain + 16 && frame < flip2;
  const talking = frame >= k.head && frame < k.headEnd && Math.floor((frame - k.head) / 5) % 2 === 0;
  const fFace: Face = frame >= k.saw ? { brows: "angry", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.2, y: -1 } }
    : frame >= k.slap ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.7, y: 0.7 } }
    : frame >= k.creep ? { brows: "flat", lids: 0.2, mouth: "smirk", eyes: 1, look: { x: 0.9, y: -0.1 } }
    : frame >= k.head ? { brows: "raised", lids: 0, mouth: talking ? "open" : "o", eyes: 1.25, look: { x: 1, y: 0.1 } }
    : frame >= drop ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.25, look: { x: 0.8, y: 0.7 } }
    : lookingAtCoin ? { brows: "flat", lids: 0.25, mouth: "flat", eyes: 1.1, look: { x: 0.9, y: 0.5 } }
    : frame >= flip1 + 40 ? { brows: "flat", lids: 0.25, mouth: "flat", eyes: 1, look: { x: 0.2, y: -1 } }
    : folded ? { brows: "raised", lids: 0.2, mouth: "smirk", eyes: 1, look: { x: 1, y: 0 } }
    : { brows: "raised", lids: 0, mouth: "smile", eyes: 1.05, look: { x: inAir ? 0.6 : 0.8, y: inAir ? -0.8 : 0.3 } };
  const youFace: Face = frame >= k.saw ? { brows: "raised", lids: 0.4, mouth: "open", eyes: 1, look: { x: 1, y: -0.2 } }
    : frame >= drop ? { brows: "raised", lids: 0.2, mouth: "smirk", eyes: 1.05, look: { x: 1, y: 0.2 } }
    : { brows: "raised", lids: 0.1, mouth: "smirk", eyes: 1, look: { x: 1, y: inAir ? -0.4 : 0.1 } };
  const coinOnCounter = frame >= drop + 4;
  const fall = ramp(frame, drop, drop + 5);
  const extra = (
    <g>
      {inAir && <Coin x={hand.x - 40 - 90 * t} y={hand.y - Math.sin(t * Math.PI) * 190} r={28} edge={Math.max(0.25, Math.abs(Math.cos(t * 14)))} />}
      {frame >= drop && !coinOnCounter && <Coin x={1330} y={mix(890, CL.top - 8, fall)} r={18} edge={0.6} />}
      {coinOnCounter && <Coin x={1320 - Math.min(40, (frame - drop - 4) * 4)} y={CL.top - 6} r={on === "coin" ? 22 : 18} edge={0.35} />}
    </g>
  );
  return (
    <CloseShot frame={frame} cam={cam} mood={mood} teal={-1e4}
      you={{ pose: { ...STAND, lean: 4, armF: [6, 14] }, face: youFace }}
      friend={{ pose: fPose, face: fFace, held: onThumb ? <Coin x={2} y={-8} r={5} /> : undefined }}
      tags={tags} extra={extra} />
  );
};

export const coinDrop = (k: CourtTimes) => k.pocketAgain + 38 + 22 + 4;
export const coinFlips = (k: CourtTimes) => [k.coin + 6, k.pocketAgain + 38];

// ------------------------------------------------------------------------------------------------ lunch

/** The diners at the court's tables (sets/FoodCourt Tables, a depth 0.75 layer): their heads at REF. */
const DINERS = [-150, 400, 950, 1500, 2050].flatMap((cx, i) => [-1, 1].map((side) => {
  const x = cx + side * 100;
  return { id: `d${i}${side}`, h: headAt(x, 1010, 1.05, { ...STAND, armF: [70, 40] }, (side === -1 ? 1 : -1) as 1 | -1) };
}));

/** Every head's card at lunch, nearly all teal, re-ticking every second or so at its own phase: a clock shop. */
export function lunchTags(k: CourtTimes): Record<string, TagKey[]> {
  const ticking = (pct: number, phase: number): TagKey[] => {
    const keys: TagKey[] = [{ at: -1e4, text: "", pct, state: "tick" }];
    for (let f = k.lunch + phase; f < k.end; f += 34) keys.push({ at: f, text: "", pct, state: "tick" });
    return keys;
  };
  const out: Record<string, TagKey[]> = { you: ticking(93, 5), friend: ticking(96, 21), seller: ticking(98, 12) };
  EXTRAS.forEach((e, i) => { out[e.id] = ticking(94 + i, 3 + i * 8); });
  DINERS.forEach((d, i) => { out[d.id] = ticking(90 + ((i * 7) % 10), (i * 11) % 34); });
  // one red among them: a diner who did something else
  out.d21 = [...out.d21.filter((x) => x.at < k.pan + 20), { at: k.pan + 20, text: "", pct: 92, state: "crimson" }];
  return out;
}

const lunchBoards = (k: CourtTimes) => {
  const step = Math.round((k.end - k.lunch) / 4);
  return {
    pillar: ["2.40", "2.10", "1.80", "1.50"].map((value, i) => ({ at: i === 0 ? -1e4 : k.lunch + step * i, value })),
    price: ["3.60", "3.20", "2.80", "2.40"].map((value, i) => ({ at: i === 0 ? -1e4 : k.lunch + 10 + step * i, value })),
  };
};
export const lunchBoardKeys = lunchBoards;

/** Line 25: the court filling for lunch; a pan across the tables; you at your counter, reading the queue's cards. */
export const LunchWide: React.FC<{ frame: number; k: CourtTimes; mood: Mood }> = ({ frame, k, mood }) => {
  const tags = lunchTags(k);
  const b = lunchBoards(k);
  const on = current(frame, [[k.lunch, "wide"], [k.pan, "pan"], [k.you, "you"]]);
  const yh = headAt(COURT.you.x, COURT.floor, COURT.scale, STAND, 1);
  const cam = on === "wide" ? drift(camAt(frame, [[k.lunch, { x: 960, y: 540, zoom: 1.0 }], [k.pan, { x: 960, y: 520, zoom: 1.05 }]]), frame, "lunch", 1.5)
    : on === "pan" ? camAt(frame, [[k.pan, { x: 450, y: 560, zoom: 1.5 }], [k.you, { x: 1500, y: 560, zoom: 1.5 }]])
    : drift(camAt(frame, [[k.you, closeUp(yh.x + 220, yh.y - 120, 1.9)], [k.end, closeUp(yh.x + 240, yh.y - 130, 2.05)]]), frame, "lunch-you", 1.5);
  const reading = on === "you";
  const sly = frame >= k.you + Math.round((k.end - k.you) * 0.5);
  const diners = (
    <g>
      {DINERS.map((d) => <Tag key={d.id} frame={frame} x={d.h.x} headY={d.h.y} r={d.h.r} keys={tags[d.id]} scale={0.9} />)}
    </g>
  );
  const busy = (seed: number): Face => ({ lids: 0.2, mouth: "smile", look: { x: 0.6, y: Math.sin(frame / 20 + seed) * 0.5 } });
  return (
    <CourtShot frame={frame} cam={cam} mood={mood} diners tags={tags} pillarKeys={b.pillar} pillarLabel="" priceKeys={b.price} lampOn={-1e4}
      you={{ pose: { ...STAND, armF: [50, 40], tilt: reading ? -8 : 0 }, face: reading ? { brows: "raised", lids: sly ? 0.3 : 0.05, mouth: sly ? "smirk" : "flat", eyes: 1.05, look: { x: 1, y: -0.6 + Math.sin(frame / 9) * 0.15 } } : busy(1) }} friend={{ pose: { ...STAND, armF: [60, 30] }, face: busy(2) }} seller={{ face: busy(3) }}
      front={diners} />
  );
};
