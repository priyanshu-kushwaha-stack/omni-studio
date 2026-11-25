// Nine [07:20], look C: the painted morning kitchen (plate kitchen-morning, parts/ClickKitchen.tsx), the opening turned
// round: you at the table where your flatmate sat, with your mug, your phone face down. Your phone, face up: the
// boss's "You OK?"; you type "Fine", hold over send, erase it, type "Not really", send. Over your shoulder: your
// flatmate by the counter, dressing gown, spoon: "Morning. I did the dishes." Click, close on his 1; close on you
// laughing into your mug; the tower of dishes; he squints at the air over your head and tilts his head: "Nine?" The
// frame of 0:00 turned around: you large at the left, the mug halfway to your mouth, eyes wide, the glow over YOU, a 9,
// and he is the one looking. From "Tomorrow" the end card, the right third quiet.
import { AbsoluteFill } from "remotion";
import { Figure, type Brows, type Mouth } from "@whatif/kit/rig/Figure";
import { SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { camAt, current, HERO, mix, ramp, type Beat, type Shot } from "../shared";
import { Counter } from "../parts/Counter";
import { aim, counterOver, FLATMATE, handWorld, headWorld, HeroMug, type Placed } from "../parts/FrameKit";
import { aimAt, byHead, counterLight, inPlate, NearYou } from "../parts/FrameLook";
import { KitchenScene, KP, Radio, SEAT_HEAD, seatAt } from "../parts/ClickKitchen";
import { wordAt } from "../parts/RivalParts";
import { EndCard, PhoneInsert } from "../parts/NineEnd";

type View = "kitchen" | "you" | "phone" | "over" | "click" | "laugh" | "dishes" | "laugh2" | "squint" | "nine" | "turned" | "end";

/** Him by the counter, a step further back than you stood on the first morning. */
const HIM_HEAD = { x: 1390, y: 470 };
const HIM_SCALE = 2.0;
const HIM_FEET = byHead({ scale: HIM_SCALE, facing: -1, pose: STAND }, HIM_HEAD);
const himAt = (pose: Pose): Placed => ({ x: HIM_FEET.x, y: HIM_FEET.y, scale: HIM_SCALE, facing: -1, pose });
const YR = 46 * KP.seat.scale;
const HR = 46 * HIM_SCALE;
const COUNT = 40;

function times(shot: Shot) {
  const fm = shot.at("Flatmate: Morning");
  const t1 = shot.end("Flatmate: Morning") + 8;
  return {
    from: shot.from, me: shot.end("Morning. Interviews"), typedTo: shot.at("Typed lies", 0.75), tle: shot.end("Typed lies"), fm, fme: shot.end("Flatmate: Morning"),
    t1, nq: shot.at("Flatmate: Nine?"), nqe: shot.end("Flatmate: Nine?"), tom: shot.at("Tomorrow, when you say"),
    tell: wordAt(shot, "Would you want", "Tell us"), end: shot.to,
  };
}
type T = ReturnType<typeof times>;

function views(k: T): [number, View][] {
  return [[k.from, "kitchen"], [k.from + 60, "you"], [k.me, "phone"], [k.tle, "over"], [k.t1 - 4, "click"], [k.t1 + 8, "laugh"],
    [k.t1 + 40, "dishes"], [k.t1 + 62, "laugh2"], [k.t1 + 80, "squint"], [k.nq, "nine"], [k.nqe + 2, "turned"], [k.tom, "end"]];
}

function cam(f: number, k: T, view: View): { c: Camera; r: number } {
  const you = (z: number, sx = 760, sy = 600) => aimAt(SEAT_HEAD, { x: sx, y: sy }, z);
  const him = (z: number, sx = 1000, sy = 600) => aimAt(HIM_HEAD, { x: sx, y: sy }, z);
  switch (view) {
    case "kitchen": return { c: camAt(f, [[k.from, { x: 960, y: 560, zoom: 1.05 }], [k.from + 60, { x: 940, y: 560, zoom: 1.12 }]]), r: 0 };
    case "you": return { c: camAt(f, [[k.from + 60, you(1.8)], [k.me, you(1.95)]]), r: YR };
    case "over": return { c: camAt(f, [[k.tle, him(2.1, 1150, 600)], [k.t1 - 4, him(2.2, 1150, 600)]]), r: HR };
    case "click": case "nine": return { c: camAt(f, [[view === "click" ? k.t1 - 4 : k.nq, him(2.6)], [view === "click" ? k.t1 + 8 : k.nqe + 2, him(2.75)]]), r: HR };
    case "laugh": case "laugh2": return { c: camAt(f, [[view === "laugh" ? k.t1 + 8 : k.t1 + 62, you(2.0)], [view === "laugh" ? k.t1 + 40 : k.t1 + 80, you(2.1)]]), r: YR };
    case "dishes": return { c: { x: KP.dishes.x - 165, y: KP.dishes.y - 10, zoom: 3.05 }, r: 0 };
    case "squint": return { c: camAt(f, [[k.t1 + 80, him(2.3, 1000, 640)], [k.nq, him(2.6, 1000, 620)]]), r: HR };
    default: return { c: camAt(f, [[k.nqe + 2, aimAt(SEAT_HEAD, { x: 460, y: 640 }, 1.75)], [k.tom, aimAt(SEAT_HEAD, { x: 470, y: 640 }, 1.85)]]), r: YR };
  }
}

interface Faces { you: { pose: Pose; brows: Brows; lids: number; mouth: Mouth; eyes: number; look: { x: number; y: number } }; him: { pose: Pose; brows: Brows; lids: number; mouth: Mouth; look: { x: number; y: number } } }

/** The arm that puts your mug at your mouth (laughing into it). */
function toMouth(bob: number): [number, number] {
  const probe = seatAt({ ...SEATED, lean: 8, tilt: 8 + bob, drop: bob });
  const h = headWorld(probe);
  return aim(probe, { x: h.x + h.r * 0.75, y: h.y + h.r * 0.95 });
}

function faces(f: number, k: T, view: View): Faces {
  const laughing = f >= k.t1 + 10 && f < k.t1 + 80;
  const bob = laughing ? Math.abs(Math.sin(f / 3.5)) * 5 : 0;
  const sip = Math.max(0, Math.sin((f - k.from) / 28)) * (f < k.me ? 1 : 0);
  const turned = view === "turned";
  const youPose: Pose = turned ? { ...SEATED, lean: 4, tilt: 4, armF: [40, 118], armB: [-10, 12] }
    : { ...SEATED, lean: laughing ? 8 : 2, tilt: laughing ? 8 + bob : 0, drop: bob, armF: laughing ? toMouth(bob) : [mix(55, 100, sip), 80] };
  const you = turned ? { pose: youPose, brows: "raised" as const, lids: 0, mouth: "o" as const, eyes: 1.3, look: { x: 0.85, y: -0.35 } }
    : laughing ? { pose: youPose, brows: "raised" as const, lids: 0.8, mouth: "smile" as const, eyes: 1, look: { x: 0.5, y: 0.2 } }
      : { pose: youPose, brows: "none" as const, lids: 0.35, mouth: (f >= k.t1 ? "smile" : "flat") as Mouth, eyes: 1, look: { x: 0.4, y: 0.5 } };
  const squint = ramp(f, k.t1 + 80, k.t1 + 110);
  const talks = (f >= k.fm && f < k.fme) || (f >= k.nq && f < k.nqe);
  const himPose: Pose = { ...STAND, tilt: mix(0, 14, ramp(f, k.t1 + 100, k.nq)), armF: [mix(70, 110, squint), mix(60, 30, squint)], armB: [10, 20] };
  const him = squint > 0.2 ? { pose: himPose, brows: "flat" as const, lids: 0.55, mouth: (talks ? "o" : "flat") as Mouth, look: { x: 1, y: -0.7 } }
    : { pose: himPose, brows: "none" as const, lids: 0.35, mouth: (talks ? "open" : "smile") as Mouth, look: { x: 1, y: 0.1 } };
  return { you, him };
}

const Kitchen: React.FC<{ f: number; k: T; view: View }> = ({ f, k, view }) => {
  const { c, r } = cam(f, k, view);
  const { you, him } = faces(f, k, view);
  const me = seatAt(you.pose);
  const hand = handWorld(me);
  const h = himAt(him.pose);
  const turned = view === "turned";
  const mine = counterOver(me, 50);
  const his = counterOver(h, COUNT);
  const glow = turned ? ramp(f, k.nqe + 2, k.nqe + 8) : 0;
  const lights = [...(f >= k.t1 ? [counterLight(his, 0.35, 180)] : []), ...(turned ? [counterLight(mine, 0.6 * glow, 260)] : [])];
  return (
    <AbsoluteFill>
      <KitchenScene frame={f} cam={inPlate(drift(c, f, "nine", 2))} r={r} blur={view === "dishes" ? 1.5 : undefined} lights={lights}
        far={<Radio waves={0} frame={f} />}
        seated={
          <g>
            <Figure x={me.x} y={me.y} scale={me.scale} facing={1} pose={me.pose} head={HERO.head} scarf={HERO.scarf} tuft time={f}
              brows={you.brows} lids={you.lids} mouth={you.mouth} eyes={you.eyes} look={you.look} blink={!turned && (f + 7) % 97 < 4} />
            <HeroMug x={hand.x} y={hand.y} scale={me.scale} tilt={view === "laugh" || view === "laugh2" ? -40 : -10} steam={!turned} />
          </g>
        }
        onTable={
          <g>
            <rect x={KP.bowl.x + 10} y={KP.tableTop + 4} width={64} height={10} rx={4} fill="#1b1d24" transform={`skewX(-30)`} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
            {turned && <Counter x={mine.x} y={mine.y} base={9} frame={f} size={50} on={k.nqe + 2} id="turned-9" />}
          </g>
        }
        standing={f >= k.tle ? (
          <g>
            <Figure x={h.x} y={h.y} scale={h.scale} facing={-1} pose={h.pose} head={FLATMATE.head} coat={FLATMATE.coat} time={f}
              brows={him.brows} lids={him.lids} mouth={him.mouth} look={him.look} blink={(f + 5) % 83 < 4} />
            <line x1={handWorld(h).x} y1={handWorld(h).y} x2={handWorld(h).x - 14 * h.scale} y2={handWorld(h).y - 10 * h.scale} stroke="#b8bec8" strokeWidth={3 * h.scale} strokeLinecap="round" />
            <Counter x={his.x} y={his.y} base={0} ticks={[k.t1]} frame={f} size={COUNT} id="nine-him" />
          </g>
        ) : undefined} />
      {view === "over" && <NearYou x={300} y={820} mug />}
      {turned && <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: 0.35 * glow, background: "radial-gradient(circle at 25% 20%, #ffcf5a 0%, rgba(0,0,0,0) 40%)" }} />}
    </AbsoluteFill>
  );
};

const NineBeat: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = shot.frame;
  const k = times(shot);
  const view = current<View>(f, views(k));
  if (view === "phone") return <PhoneInsert frame={f} from={k.me} to={k.typedTo} />;
  if (view === "end") return <EndCard frame={f} from={k.tom} comment={k.tell} like={k.tell + 8} subscribe={k.tell + 16} />;
  return <Kitchen f={f} k={k} view={view} />;
};

/** Nine: the phone, the dishes, "Nine?", the frame turned around, and the end card. */
export const nine: Beat = { id: "Nine", first: "Morning. Interviews", lead: 0.3, Component: NineBeat };
