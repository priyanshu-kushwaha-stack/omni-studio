// Your Stall at lunch (food court, `day`): the queue read before it orders, three plates sliding across the steel as
// three mouths open, the third man with rice and noodles both (26 and the 5 s hold); the coffee seller's "Show-off."
// (27); the queue doubling and the court next door doing it too (28).
import { Figure, type Mouth } from "@whatif/kit/rig/Figure";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { RateBoard, Tag, TealLamp, type TagKey } from "../device";
import { aimArm, Apron, headAt, PaperCap, type Body } from "../kit";
import { blinking, camAt, COFFEE, current, HERO, mix, PASTELS, ramp } from "../shared";
import { CoffeeCounter, COURT, FoodCourtBack, foodCourtLights, StallCounter } from "../sets/FoodCourt";
import { glide, Shot, talk } from "./TheCityPlays.Parts";
import { arrivals, boards, ORDERS, SLIDE, tags, type T } from "./YourStall.Times";

type Food = "noodles" | "rice" | "both";

/** A plate on the counter (world units, (x, y) its centre): noodles, rice, or both. */
export const Plate: React.FC<{ x: number; y: number; food: Food; s?: number }> = ({ x, y, food, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={8} rx={66} ry={14} fill="#000" opacity={0.25} />
    <ellipse cx={0} cy={0} rx={64} ry={15} fill="#f3efe6" stroke={INK} strokeWidth={5} />
    {(food === "rice" || food === "both") && (
      <path d={food === "both" ? "M-4 -4 Q14 -42 44 -4Z" : "M-36 -4 Q0 -52 36 -4Z"} fill="#fbf8ef" stroke={INK} strokeWidth={4} />
    )}
    {(food === "noodles" || food === "both") && (
      <g transform={food === "both" ? "translate(-24 0) scale(0.75)" : undefined}>
        <path d="M-38 -4 Q-30 -34 -10 -14 Q4 -40 18 -14 Q30 -36 40 -4Z" fill="#e8b84a" stroke={INK} strokeWidth={4} />
        <path d="M-24 -12 q8 -10 16 0 M2 -14 q8 -10 16 0" fill="none" stroke="#b5862a" strokeWidth={3} />
        <circle cx={24} cy={-14} r={6} fill="#5aa04a" stroke={INK} strokeWidth={2} />
      </g>
    )}
  </g>
);

const YOU_B: Body = { x: COURT.you.x, y: COURT.you.y, scale: COURT.scale, facing: 1, pose: STAND };
const CY = 1075, CS = 1.85;
const CUST = [880, 1170, 1460];
const COATS = ["#2a2d36", "#3b4a6b", "#4a3b46", "#2f4a48", "#5a3b2a"];
const HEADS = [PASTELS[0], PASTELS[2], PASTELS[5], PASTELS[7], PASTELS[3], PASTELS[1]];
const PLATE_Y = COURT.counter.top - 12;
const PLATE_FROM = 660;
const stopOf = (custX: number) => Math.min(custX - 140, COURT.counter.to - 40);

/** Where a plate is: popping up at your hand, sliding across the steel, then still in front of its customer. */
function plateX(frame: number, p: number, custX: number) {
  return mix(PLATE_FROM, stopOf(custX), ramp(frame, p, p + SLIDE));
}

/** Your arm through one slide: out to the plate, the push, back. Returns the hand's target or null at rest. */
function pushTarget(frame: number, p: number): { x: number; y: number } | null {
  if (frame < p - 10 || frame > p + 10) return null;
  const x = mix(PLATE_FROM - 30, PLATE_FROM + 70, ramp(frame, p - 4, p + 6));
  return { x, y: PLATE_Y - 6 };
}

/** One customer in front of the counter with the card over his head; `face` overrides the default watch. */
const Customer: React.FC<{
  frame: number; b: Body; i: number; keys: TagKey[]; face: { mouth: Mouth; brows: React.ComponentProps<typeof Figure>["brows"]; look: { x: number; y: number }; eyes?: number };
  reach?: { x: number; y: number } | null; cardLift?: number; cardScale?: number; held?: React.ReactNode; opacity?: number;
}> = ({ frame, b, i, keys, face, reach, cardLift = 0, cardScale = 0.72, held, opacity = 1 }) => {
  const pose: Pose = reach ? { ...b.pose, armF: aimArm(b, reach) } : b.pose;
  const h = headAt(b.x, b.y, b.scale, pose, b.facing);
  return (
    <g opacity={opacity}>
      <Figure {...b} pose={pose} head={HEADS[i % HEADS.length]} coat={COATS[i % COATS.length]} lids={0} eyes={face.eyes ?? 1} brows={face.brows}
        mouth={face.mouth} look={face.look} blink={blinking(frame, i + 5)} time={frame} held={held} />
      <Tag frame={frame} x={h.x} headY={h.y - cardLift} r={h.r} keys={keys} scale={cardScale} />
    </g>
  );
};

/** The order face: watching the cook, the mouth opening to order just as the plate lands, then a beat of surprise. */
function orderFace(frame: number, arrive: number) {
  if (frame < arrive - 3) return { mouth: "flat" as Mouth, brows: "none" as const, look: { x: 0.8, y: 0.1 } };
  if (frame < arrive + 6) return { mouth: "open" as Mouth, brows: "none" as const, look: { x: 0.8, y: 0.1 } };
  if (frame < arrive + 34) return { mouth: "o" as Mouth, brows: "raised" as const, look: { x: 0.7, y: 0.6 }, eyes: 1.2 };
  return { mouth: "smile" as Mouth, brows: "raised" as const, look: { x: 0.8, y: 0.2 } };
}

/** The third man's double take: the plate, you, the plate again, both brows up. */
function staredFace(frame: number, k: T, arrive: number) {
  if (frame < k.stare) return orderFace(frame, arrive);
  const t = frame - k.stare;
  const look = t < 22 ? { x: 0.6, y: 0.8 } : t < 40 ? { x: 0.9, y: -0.2 } : { x: 0.6, y: 0.85 };
  return { mouth: (t < 22 ? "o" : t < 40 ? "flat" : "o") as Mouth, brows: "raised" as const, look, eyes: t >= 40 ? 1.3 : 1.15 };
}

/** You behind the counter, eyes on the cards and never on a face, sliding plates. */
const You: React.FC<{ frame: number; target: { x: number; y: number } | null; eyesUp: boolean }> = ({ frame, target, eyesUp }) => {
  const pose: Pose = target ? { ...STAND, armF: aimArm(YOU_B, target) } : { ...STAND, armF: [40, 60] };
  return (
    <>
      <Figure {...YOU_B} pose={pose} {...HERO} coat="#3b3e47" brows={eyesUp ? "flat" : "none"} lids={eyesUp ? 0.15 : 0.2} mouth={eyesUp ? "smirk" : "flat"} eyes={1}
        look={eyesUp ? { x: 0.75, y: -0.8 } : { x: 0.8, y: 0.1 }} blink={blinking(frame, 0)} time={frame} />
      <Apron b={{ ...YOU_B, pose }} />
    </>
  );
};

/** Line 26 and the hold: the queue, the three cards, the three plates, the third man's stare. */
export const Queue: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const tg = tags(k);
  const bd = boards(k);
  const arr = arrivals(k);
  const ps = [k.p1, k.p2, k.p3];
  const c3 = headAt(CUST[2], CY, CS, STAND, -1);
  const yh = headAt(YOU_B.x, YOU_B.y, YOU_B.scale, STAND, 1);
  const on = current(frame, [[k.start, "wide"], [k.eyesUp, "you"], [k.p1 - 10, "plate"], [arr[0] + 26, "wide2"], [k.stare - 4, "man3"]]);
  const cams: Record<typeof on, Camera> = {
    wide: camAt(frame, [[k.start, { x: 900, y: 560, zoom: 1.2 }], [k.eyesUp, { x: 900, y: 560, zoom: 1.26 }]]),
    you: camAt(frame, [[k.eyesUp, closeUp(yh.x + 60, yh.y - 70, 2.0)], [k.p1 - 10, closeUp(yh.x + 60, yh.y - 70, 2.15)]]),
    plate: camAt(frame, [[k.p1 - 10, { x: 760, y: 610, zoom: 1.75 }], [arr[0] + 26, { x: 800, y: 600, zoom: 1.7 }]]),
    wide2: camAt(frame, [[arr[0] + 26, { x: 820, y: 560, zoom: 1.12 }], [k.stare - 4, { x: 860, y: 560, zoom: 1.18 }]]),
    man3: camAt(frame, [[k.stare - 4, closeUp(c3.x - 70, c3.y + 40, 2.0)], [k.coffee, closeUp(c3.x - 70, c3.y + 30, 2.2)]]),
  };
  const cam = drift(cams[on], frame, "queue", 3);
  let target: { x: number; y: number } | null = null;
  for (const p of ps) target = pushTarget(frame, p) ?? target;
  const sellerShock = frame >= arr[1];
  const actors = (
    <>
      <RateBoard frame={frame} x={COURT.pillar.board.x + 30} y={COURT.pillar.board.y} size={58} label="YOUR RATE" keys={bd.yours} />
      <TealLamp frame={frame} x={COURT.pillar.lamp.x + 30} y={COURT.pillar.lamp.y} />
      <You frame={frame} target={target} eyesUp={frame >= k.eyesUp} />
      <StallCounter />
      <Figure x={COURT.coffee.seller.x} y={COURT.coffee.seller.y} scale={COURT.scale} facing={-1} pose={STAND} head={COFFEE.head} coat={COFFEE.coat}
        brows={sellerShock ? "raised" : "none"} lids={0} mouth={sellerShock ? "o" : "flat"} eyes={sellerShock ? 1.2 : 1} look={{ x: 0.9, y: 0.2 }}
        blink={blinking(frame, 4)} time={frame} />
      <PaperCap {...headAt(COURT.coffee.seller.x, COURT.coffee.seller.y, COURT.scale, STAND, -1)} color={COFFEE.cap} />
      <CoffeeCounter />
      {ps.map((p, i) => frame >= p - 8 && (
        <Plate key={i} x={plateX(frame, p, CUST[i])} y={PLATE_Y} food={ORDERS[i].food} s={Math.min(1, (frame - p + 8) / 6)} />
      ))}
      {CUST.map((x, i) => {
        const b: Body = { x, y: CY, scale: CS, facing: -1, pose: STAND };
        const face = i === 2 ? staredFace(frame, k, arr[i]) : orderFace(frame, arr[i]);
        const reach = frame >= arr[i] + 10 && !(i === 2 && frame < k.stare + 50) ? { x: stopOf(x) + 30, y: PLATE_Y } : null;
        return <Customer key={i} frame={frame} b={b} i={i} keys={tg.queue[i]} face={face} reach={reach} cardLift={i === 1 ? 105 : 0} />;
      })}
    </>
  );
  return <Shot cam={cam} mood="day" lights={foodCourtLights} back={<FoodCourtBack cam={cam} mood="day" frame={frame} />} actors={actors} />;
};

/** Line 27: the coffee seller close, mouth open; "Show-off."; then she slowly looks up at the cards over her own queue. */
export const CoffeeLook: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const sh = headAt(COURT.coffee.seller.x, COURT.coffee.seller.y, COURT.scale, STAND, -1);
  const cam = drift(glide(frame, k.coffee, k.busy, closeUp(sh.x - 80, sh.y + 30, 2.2), closeUp(sh.x - 60, sh.y + 10, 2.5)), frame, "cofl", 2);
  const up = ramp(frame, k.up, k.up + 24);
  const speaking = frame >= k.show && frame < k.up;
  const face = frame < k.show
    ? { brows: "raised" as const, lids: 0, mouth: "o" as Mouth, eyes: 1.25, look: { x: 0.9, y: 0.15 } }
    : speaking
      ? { brows: "flat" as const, lids: 0.3, mouth: talk(frame, k.show + 2, k.up - 4, "smirk"), eyes: 1, look: { x: 0.9, y: 0.1 } }
      : { brows: up > 0.5 ? ("raised" as const) : ("flat" as const), lids: mix(0.3, 0, up), mouth: "smirk" as Mouth, eyes: mix(1, 1.15, up), look: { x: mix(0.9, 0.25, up), y: mix(0.1, -0.95, up) } };
  // her hand on a cup, set down when she speaks
  const pose: Pose = { ...STAND, armF: speaking ? [70, 40] : [40, 60] };
  const actors = (
    <>
      <Figure x={COURT.coffee.seller.x} y={COURT.coffee.seller.y} scale={COURT.scale} facing={-1} pose={pose} head={COFFEE.head} coat={COFFEE.coat}
        {...face} blink={blinking(frame, 4)} time={frame} />
      <PaperCap x={sh.x} y={sh.y} r={sh.r} color={COFFEE.cap} />
      <CoffeeCounter />
    </>
  );
  return <Shot cam={cam} mood="day" lights={foodCourtLights} back={<FoodCourtBack cam={cam} mood="day" frame={frame} />} actors={actors} />;
};

/** Frames per serve once the queue doubles. */
const SERVE = 24;

/** The busy queue's ticks: one per serve. */
export const busyTicks = (k: T): TagKey[] => {
  const out: TagKey[] = [];
  for (let at = k.busy + Math.round(SERVE * 0.42); at < k.nextDoor; at += SERVE) out.push({ at, text: "ORDERS RICE", pct: 88, state: "tick" });
  return out;
};

/** Line 28: the queue doubled, served one every second without a word; the camera travels down it. */
export const Busy: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const bd = boards(k);
  const t = frame - k.busy;
  const n = Math.floor(t / SERVE);
  const ph = (t % SERVE) / SERVE;
  const shift = ramp(ph, 0.55, 1);
  const cam = drift(glide(frame, k.busy, k.nextDoor, { x: 880, y: 560, zoom: 1.15 }, { x: 1500, y: 600, zoom: 0.95 }), frame, "busy", 3);
  const plate = mix(PLATE_FROM, stopOf(880), ramp(ph, 0.05, 0.4));
  const target = ph < 0.42 ? { x: mix(PLATE_FROM - 30, PLATE_FROM + 70, ramp(ph, 0.02, 0.3)), y: PLATE_Y - 6 } : null;
  const queue = Array.from({ length: 9 }, (_, j) => {
    const id = n + j;
    const o = ORDERS[id % 3];
    const leaving = j === 0 && ph > 0.55;
    const x = leaving ? 880 - shift * 320 : 880 + (j - shift) * 240;
    const b: Body = { x, y: CY, scale: CS * 0.95, facing: -1, pose: shift > 0 && shift < 1 ? walkPose(frame * 0.35 + j) : STAND };
    const served = j === 0 && ph > 0.4;
    const face = j === 0
      ? { mouth: (ph > 0.38 && ph < 0.5 ? "open" : served ? "o" : "flat") as Mouth, brows: served ? ("raised" as const) : ("none" as const), look: { x: 0.8, y: 0.2 } }
      : { mouth: "flat" as Mouth, brows: "none" as const, look: { x: 0.7, y: -0.6 } };
    const keys: TagKey[] = [{ at: k.busy - 100, text: o.text, pct: o.pct, state: "tick" }];
    return <Customer key={id} frame={frame} b={b} i={id} keys={keys} face={face} cardLift={id % 2 ? 100 : 0} cardScale={0.62}
      opacity={leaving ? 1 - shift : 1} held={leaving ? <g transform="translate(0 -10) scale(0.5)"><Plate x={0} y={0} food={o.food} /></g> : undefined} />;
  });
  const actors = (
    <>
      <RateBoard frame={frame} x={COURT.pillar.board.x + 30} y={COURT.pillar.board.y} size={58} label="YOUR RATE" keys={bd.yours} />
      <TealLamp frame={frame} x={COURT.pillar.lamp.x + 30} y={COURT.pillar.lamp.y} />
      <You frame={frame} target={target} eyesUp />
      <StallCounter />
      <Figure x={COURT.coffee.seller.x} y={COURT.coffee.seller.y} scale={COURT.scale} facing={-1} pose={STAND} head={COFFEE.head} coat={COFFEE.coat}
        brows="raised" lids={0} mouth="flat" look={{ x: 0.5, y: -0.8 }} blink={blinking(frame, 4)} time={frame} />
      <PaperCap {...headAt(COURT.coffee.seller.x, COURT.coffee.seller.y, COURT.scale, STAND, -1)} color={COFFEE.cap} />
      <CoffeeCounter />
      {ph < 0.55 && <Plate x={plate} y={PLATE_Y} food={ORDERS[n % 3].food} />}
      {queue.reverse()}
    </>
  );
  return <Shot cam={cam} mood="day" lights={foodCourtLights} back={<FoodCourtBack cam={cam} mood="day" frame={frame} />} actors={actors} />;
};

/** The court next door: another cook, eyes up on the card, plating rice before the customer opens his mouth. */
export const NextDoor: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const p = k.nextDoor + 14;
  const arrive = p + SLIDE;
  const keys: TagKey[] = [{ at: k.nextDoor + 2, text: "ORDERS RICE", pct: 88, state: "new" }, { at: arrive + 3, text: "ORDERS RICE", pct: 88, state: "tick" }];
  const cam = drift(camAt(frame, [[k.nextDoor, { x: 900, y: 600, zoom: 1.4 }], [k.landlord, { x: 920, y: 600, zoom: 1.52 }]]), frame, "next", 3);
  const cook: Body = { x: 680, y: 1000, scale: COURT.scale, facing: 1, pose: STAND };
  const ch = headAt(cook.x, cook.y, cook.scale, STAND, 1);
  const x = mix(760, 1000, ramp(frame, p, arrive));
  const push = frame >= p - 8 && frame < p + 10 ? { x: mix(730, 830, ramp(frame, p - 4, p + 6)), y: PLATE_Y - 6 } : null;
  const cookPose: Pose = push ? { ...STAND, armF: aimArm(cook, push) } : { ...STAND, armF: [40, 60] };
  const actors = (
    <>
      <Figure {...cook} pose={cookPose} head={PASTELS[4]} coat="#e8e4da" brows="flat" lids={0.1} mouth="smirk" look={{ x: 0.75, y: -0.8 }}
        blink={blinking(frame, 6)} time={frame} />
      <PaperCap x={ch.x} y={ch.y} r={ch.r} />
      <rect x={380} y={COURT.counter.top} width={920} height={300} fill="#2f4a6b" stroke={INK} strokeWidth={8} />
      <rect x={360} y={COURT.counter.top} width={960} height={30} fill="#c9ced6" stroke={INK} strokeWidth={6} />
      {frame >= p - 8 && <Plate x={x} y={PLATE_Y} food="rice" s={Math.min(1, (frame - p + 8) / 6)} />}
      <Customer frame={frame} b={{ x: 1150, y: CY, scale: CS, facing: -1, pose: STAND }} i={3} keys={keys} face={orderFace(frame, arrive)}
        reach={frame >= arrive + 12 ? { x: 1030, y: PLATE_Y } : null} />
    </>
  );
  return <Shot cam={cam} mood="day" lights={foodCourtLights} back={<FoodCourtBack cam={cam} mood="day" frame={frame} />} actors={actors} />;
};
