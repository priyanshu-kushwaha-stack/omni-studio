// The City Plays on the metro platform (library set metroPlatform, `day`): the kid's rock-paper-scissors and its paper
// diagram (24-26), the pickpocket's crimson card, the doors, the coffee seller's back, the verdict, the platform at
// dusk (33-35), and your six-ten with its paper map (36, 37).
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { seatedY, SEATED, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { metroPlatform, type MetroPlatformOptions } from "@whatif/kit/sets/MetroPlatform";
import type { MoodName } from "@whatif/kit/stage/moods";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, MUSTARD, TEAL } from "@whatif/kit/theme";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { RateBoard, Tag } from "../device";
import { Cap, headAt, PaperCap, Sheet, type Body } from "../kit";
import { blinking, camAt, COFFEE, current, HERO, KID, linear, PASTELS, PICKPOCKET, ramp } from "../shared";
import { COURT, CoffeeCounter, FoodCourtBack, foodCourtLights } from "../sets/FoodCourt";
import { glide, Hood, pump, Shot, ShoulderBag, Stamp, talk, Throw } from "./TheCityPlays.Parts";
import { boards, tags, type T } from "./TheCityPlays.Times";

const FLOOR = 960;

const platformShot = (cam: Camera, mood: MoodName, frame: number, actors: React.ReactNode, o: Partial<MetroPlatformOptions> = {}) => {
  const options = { ...metroPlatform.defaults, train: null, ...o };
  return (
    <Shot cam={cam} mood={mood} lights={metroPlatform.lights(options)} back={metroPlatform.Back({ cam, mood, frame, options })}
      actors={actors} />
  );
};

// ------------------------------------------------------------------------------------------------ rock-paper-scissors

const KID_B: Body = { x: 830, y: FLOOR, scale: 0.92, facing: 1, pose: STAND };
const MAN_B: Body = { x: 1090, y: FLOOR, scale: 1.15, facing: -1, pose: STAND };
const MAN = { head: PASTELS[4], coat: "#3b4a6b" } as const;

/** The kid's and the man's throws: [frame, kid's shape, man's shape]. */
const throwsOf = (k: T): [number, "rock", "scissors" | "paper"][] => [[k.throw1, "rock", "scissors"], [k.throw2, "rock", "paper"], [k.throw3, "rock", "paper"]];

function armsAt(frame: number, k: T) {
  let kid = pump(frame, k.throw1), man = pump(frame, k.throw1), shape: "scissors" | "paper" = "scissors";
  for (const [at, , m] of throwsOf(k)) if (frame >= at - 24) { kid = pump(frame, at); man = pump(frame, at); shape = m; }
  return { kid, man, shape };
}

export const RPS: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const tg = tags(k);
  const kh = headAt(KID_B.x, KID_B.y, KID_B.scale, STAND, 1);
  const mh = headAt(MAN_B.x, MAN_B.y, MAN_B.scale, STAND, -1);
  const on = current(frame, [[k.start, "two"], [k.win + 6, "kid"], [k.read, "man"], [k.throw2 - 28, "two2"], [k.capOff - 8, "cap"]]);
  const two: Camera = { x: 960, y: 650, zoom: 1.5 };
  const cams: Record<typeof on, Camera> = {
    two: camAt(frame, [[k.start, { x: 940, y: 660, zoom: 1.32 }], [k.win + 6, two]]),
    kid: camAt(frame, [[k.win + 6, closeUp(kh.x + 30, kh.y - 70, 2.3)], [k.read, closeUp(kh.x + 30, kh.y - 80, 2.45)]]),
    man: camAt(frame, [[k.read, closeUp(mh.x - 40, mh.y - 40, 2.4)], [k.throw2 - 28, closeUp(mh.x - 50, mh.y - 40, 2.5)]]),
    two2: camAt(frame, [[k.throw2 - 28, two], [k.capOff - 8, { x: 950, y: 640, zoom: 1.62 }]]),
    cap: camAt(frame, [[k.capOff - 8, closeUp(kh.x + 10, kh.y - 40, 2.5)], [k.diagram, closeUp(kh.x + 10, kh.y - 40, 2.7)]]),
  };
  const cam = drift(cams[on], frame, "rps", 3);
  const { kid, man, shape } = armsAt(frame, k);
  const winning = frame >= k.win && frame < k.win + 34;
  const lost = frame >= k.throw2 + 6;
  const capOff = frame >= k.capOff;
  const kidArm: [number, number] = winning ? [172, 6] : capOff ? [70, 50] : kid.armF;
  const kidFace = winning ? { brows: "raised" as const, lids: 0, mouth: "open" as const, eyes: 1.2, look: { x: 0.5, y: -0.5 } }
    : frame >= k.noFair ? { brows: "angry" as const, lids: 0.1, mouth: talk(frame, k.noFair + 3, k.noFair + 40, "frown"), eyes: 1.1, look: { x: 0.9, y: -0.1 } }
    : lost ? { brows: "worry" as const, lids: 0, mouth: "o" as const, eyes: 1.2, look: { x: 0.9, y: 0.2 } }
    : { ...EXPRESSIONS.determined, look: { x: 0.9, y: 0.1 } };
  const reading = frame >= k.read && frame < k.throw2 - 10;
  const manFace = reading ? { brows: "raised" as const, lids: 0.15, mouth: "smirk" as const, eyes: 1, look: { x: 0.55, y: -0.9 } }
    : frame >= k.throw2 ? { ...EXPRESSIONS.happy, mouth: "smirk" as const, look: { x: 0.8, y: 0.2 } }
    : { ...EXPRESSIONS.neutral, look: { x: 0.8, y: 0.2 } };
  const capInHand = capOff ? <g transform="translate(6 -10) rotate(-30)"><Cap x={0} y={0} r={46} color={KID.cap} /></g> : undefined;
  const kidHeld = capInHand ?? (kid.out && !winning ? <Throw shape="rock" skin={KID.head} /> : <Throw shape="rock" skin={KID.head} />);
  const actors = (
    <>
      <Figure {...MAN_B} pose={{ ...STAND, armF: man.armF }} head={MAN.head} coat={MAN.coat} {...manFace} blink={blinking(frame, 3)} time={frame}
        held={<Throw shape={man.out ? shape : "rock"} skin={MAN.head} />} />
      <Figure {...KID_B} pose={{ ...STAND, armF: kidArm, tilt: winning ? -8 : 0 }} head={KID.head} coat={KID.coat} cap={capOff ? undefined : KID.cap}
        {...kidFace} blink={blinking(frame, 1)} time={frame} held={kidHeld} />
      <Tag frame={frame} x={kh.x} headY={kh.y} r={kh.r} keys={tg.kid} scale={1.15} />
    </>
  );
  return platformShot(cam, "day", frame, actors);
};

/** Line 26: a paper diagram on the platform wall: a fist that wins, and an arrow looping back to the fist. */
export const RpsDiagram: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const a = k.diagram;
  const cam = drift(camAt(frame, [[a, { x: 960, y: 460, zoom: 1.5 }], [k.magician, { x: 960, y: 450, zoom: 1.62 }]]), frame, "rpsd", 2);
  const fist = (x: number, y: number, s: number, at: number) => frame >= at && (
    <g transform={`translate(${x} ${y}) scale(${s * Math.min(1, (frame - at) / 6)})`}>
      <circle r={40} fill={KID.head} stroke={INK} strokeWidth={6} />
      {[-16, 0, 16].map((yy) => <line key={yy} x1={10} y1={yy} x2={34} y2={yy} stroke={INK} strokeWidth={5} strokeLinecap="round" />)}
      <rect x={-70} y={-22} width={40} height={44} rx={10} fill={KID.coat} stroke={INK} strokeWidth={5} />
    </g>
  );
  const star = frame >= a + 22 && (
    <g transform={`translate(460 150) scale(${Math.min(1, (frame - a - 22) / 6)})`}>
      <path d="M0 -50 L14 -16 L50 -14 L22 8 L32 44 L0 24 L-32 44 L-22 8 L-50 -14 L-14 -16Z" fill={MUSTARD} stroke={INK} strokeWidth={5} />
    </g>
  );
  const sheet = (
    <Sheet frame={frame} at={a} x={960} y={450} w={720} h={400} tilt={-1.5}>
      {fist(190, 220, 1, a + 6)}
      <DrawLine d="M260 190 Q340 120 400 140" from={a + 12} to={a + 22} color={INK} width={8} />
      {star}
      <DrawLine d="M500 200 Q620 320 420 340 Q260 350 230 290" from={a + 30} to={a + 54} color={CRIMSON} width={10} />
      {frame >= a + 54 && <path d="M230 290 l-6 -30 l28 14z" fill={CRIMSON} />}
    </Sheet>
  );
  return platformShot(cam, "day", frame, sheet);
};

// ------------------------------------------------------------------------------------------------ the pickpocket

const WOMAN = { head: PASTELS[3], coat: "#5a6488" } as const;
const THIEF_B: Body = { x: 880, y: FLOOR, scale: 1.15, facing: 1, pose: STAND };
const WOMAN_B: Body = { x: 1060, y: FLOOR, scale: 1.1, facing: 1, pose: STAND };
/** The platform's other faces: x, facing before the turn, facing after it (toward him). */
const FACES: { x: number; head: string; coat: string; away: 1 | -1 }[] = [
  { x: 330, head: PASTELS[0], coat: "#2a2d36", away: -1 },
  { x: 560, head: PASTELS[6], coat: "#4a3b46", away: -1 },
  { x: 1320, head: PASTELS[2], coat: "#2f4a48", away: 1 },
  { x: 1560, head: PASTELS[7], coat: "#3b4a6b", away: 1 },
];

const Thief: React.FC<{ frame: number; b: Body; face: Partial<React.ComponentProps<typeof Figure>>; k: T; tagScale?: number; keys?: "thief" | "still" }> = ({
  frame, b, face, k, tagScale = 1.1, keys = "thief",
}) => {
  const h = headAt(b.x, b.y, b.scale, b.pose, b.facing);
  return (
    <g>
      <Hood b={b} color={PICKPOCKET.coat} />
      <Figure {...b} head={PICKPOCKET.head} coat={PICKPOCKET.coat} blink={blinking(frame, 6)} time={frame} {...face} />
      <Tag frame={frame} x={h.x} headY={h.y} r={h.r} keys={tags(k)[keys]} scale={tagScale} />
    </g>
  );
};

/** Lines 33, 34 and "Every head turns" on 35: the card goes crimson, every head turns, he steps back, hands open. */
export const Pickpocket: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const on = current(frame, [[k.pick2, "pair"], [k.turn, "wide"], [k.touch, "him"], [k.touch + 40, "wide2"]]);
  const th = headAt(THIEF_B.x, FLOOR, 1.15, STAND, 1);
  const cams: Record<typeof on, Camera> = {
    pair: camAt(frame, [[k.pick2, { x: 980, y: 660, zoom: 1.85 }], [k.turn, { x: 960, y: 640, zoom: 2.0 }]]),
    wide: camAt(frame, [[k.turn, { x: 960, y: 600, zoom: 1.12 }], [k.touch, { x: 950, y: 610, zoom: 1.2 }]]),
    him: camAt(frame, [[k.touch, closeUp(th.x - 30, th.y - 60, 2.2)], [k.touch + 40, closeUp(th.x - 40, th.y - 60, 2.3)]]),
    wide2: camAt(frame, [[k.touch + 40, { x: 950, y: 610, zoom: 1.22 }], [k.doors, { x: 950, y: 610, zoom: 1.3 }]]),
  };
  const cam = drift(cams[on], frame, "thief", 3);
  const turned = frame >= k.turn;
  const back = ramp(frame, k.touch - 6, k.touch + 10);
  const b: Body = { ...THIEF_B, x: THIEF_B.x - back * 90, pose: turned ? { ...STAND, armF: [118, 40], armB: [112, 40], lean: -4 } : { ...STAND, armF: [55, 40] } };
  const darting = Math.floor(frame / 9) % 2 ? 0.9 : -0.7;
  const face = turned
    ? { brows: "worry" as const, lids: 0, mouth: talk(frame, k.touch + 2, k.touch + 40, "o"), eyes: 1.25, look: { x: darting, y: 0 } }
    : { brows: "flat" as const, lids: 0.3, mouth: "flat" as const, eyes: 1, look: { x: 0.8, y: 0.4 } };
  const actors = (
    <>
      {FACES.map((f, i) => {
        const facing: 1 | -1 = turned ? (f.x < b.x ? 1 : -1) : f.away;
        return <Figure key={i} x={f.x} y={FLOOR} scale={1.1} facing={facing} pose={STAND} head={f.head} coat={f.coat}
          brows={turned ? "raised" : "none"} lids={turned ? 0 : 0.3} mouth="flat" eyes={turned ? 1.15 : 1} look={turned ? { x: 0.9, y: 0 } : { x: 0.4, y: 0.4 }}
          blink={blinking(frame, i + 20)} time={frame} />;
      })}
      <Figure {...WOMAN_B} facing={turned ? -1 : 1} head={WOMAN.head} coat={WOMAN.coat} brows={turned ? "raised" : "none"} lids={turned ? 0 : 0.35}
        mouth={turned ? "o" : "flat"} eyes={turned ? 1.2 : 1} look={{ x: 0.8, y: 0 }} blink={blinking(frame, 9)} time={frame} />
      <ShoulderBag b={{ ...WOMAN_B, facing: turned ? -1 : 1 }} />
      <Thief frame={frame} b={b} face={face} k={k} />
    </>
  );
  return platformShot(cam, "day", frame, actors);
};

/** "Doors shut on him.": the train in, the door closing in his face, the faces inside watching him. */
export const Doors: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shut = ramp(frame, k.doors + 6, k.doors + 20);
  const cam = drift(camAt(frame, [[k.doors, { x: 1150, y: 620, zoom: 1.55 }], [k.coffee, { x: 1170, y: 620, zoom: 1.7 }]]), frame, "doors", 3);
  const b: Body = { x: 1010, y: FLOOR, scale: 1.15, facing: 1, pose: { ...STAND, armF: [96, 30], armB: [60, 40], lean: 6 } };
  const inside = [1205, 1300];
  const actors = (
    <>
      {inside.map((x, i) => (
        <Figure key={i} x={x} y={860} scale={1.0} facing={-1} pose={STAND} head={PASTELS[(i * 3 + 1) % 8]} coat="#2a2d36" brows="flat" lids={0.2}
          mouth="flat" look={{ x: 0.8, y: 0.1 }} blink={blinking(frame, i)} time={frame} />
      ))}
      <Thief frame={frame} b={b} k={k} face={{ brows: "worry", lids: 0, mouth: "o", eyes: 1.15, look: { x: 0.9, y: -0.1 } }} />
    </>
  );
  const options = { ...metroPlatform.defaults, train: 0, doorOpen: 1 - shut };
  return (
    <Shot cam={cam} mood="day" lights={metroPlatform.lights(options)} back={metroPlatform.Back({ cam, mood: "day", frame, options })} actors={actors}
      front={<DoorLeaves open={1 - shut} />} />
  );
};

/** The door's leaves again, in front of the faces inside, so the closing door hides them (the set draws its leaves
 *  behind everyone). Only the leaves; the frame stays the set's. */
const DoorLeaves: React.FC<{ open: number }> = ({ open }) => (
  <g>
    <rect x={1250 - 130 - open * 120} y={380} width={130} height={480} fill="#b3bac6" stroke={INK} strokeWidth={6} />
    <rect x={1250 + open * 120} y={380} width={130} height={480} fill="#b3bac6" stroke={INK} strokeWidth={6} />
  </g>
);

/** "The coffee seller won't pour.": at her stall, she looks up at his pale crimson card and turns her back. */
export const CoffeeBack: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const turn = frame >= k.coffee + 26;
  const cam = drift(camAt(frame, [[k.coffee, { x: 1520, y: 560, zoom: 1.55 }], [k.verdict, { x: 1540, y: 560, zoom: 1.66 }]]), frame, "cof", 3);
  const sh = headAt(COURT.coffee.seller.x, COURT.coffee.seller.y, COURT.scale, STAND, turn ? 1 : -1);
  const b: Body = { x: 1360, y: 1090, scale: 2.0, facing: 1, pose: { ...STAND, armF: [70, 30] } };
  const actors = (
    <>
      <Figure x={COURT.coffee.seller.x} y={COURT.coffee.seller.y} scale={COURT.scale} facing={turn ? 1 : -1} pose={STAND} head={COFFEE.head} coat={COFFEE.coat}
        brows={turn ? "flat" : "raised"} lids={turn ? 0.4 : 0} mouth="flat" look={turn ? { x: 0.5, y: 0.2 } : { x: 0.6, y: -0.6 }} blink={blinking(frame, 4)} time={frame} />
      <PaperCap x={sh.x} y={sh.y} r={sh.r} color={COFFEE.cap} />
      <CoffeeCounter />
      <Thief frame={frame} b={b} k={k} tagScale={0.75} face={{ brows: "worry", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 0.9, y: -0.2 } }} />
    </>
  );
  return <Shot cam={cam} mood="day" lights={foodCourtLights} back={<FoodCourtBack cam={cam} mood="day" frame={frame} />} actors={actors} />;
};

/** "A crimson tag is a verdict everyone can read": his card close; then the platform stepping away from him. */
export const Verdict: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const close = frame < k.gap;
  const b: Body = { x: 960, y: FLOOR, scale: 1.15, facing: 1, pose: STAND };
  const th = headAt(b.x, b.y, b.scale, STAND, 1);
  const cam = close
    ? drift(camAt(frame, [[k.verdict, closeUp(th.x, th.y - 110, 2.5)], [k.gap, closeUp(th.x, th.y - 100, 2.75)]]), frame, "verd", 2)
    : drift(glide(frame, k.gap, k.dusk, { x: 960, y: 640, zoom: 1.5 }, { x: 960, y: 600, zoom: 1.08 }), frame, "gap", 3);
  const away = linear(frame, k.gap, k.dusk);
  const actors = (
    <>
      {FACES.map((f, i) => {
        const dirn: 1 | -1 = f.x < 960 ? -1 : 1;
        const walking = frame >= k.gap + i * 5;
        const x = f.x + dirn * Math.max(0, away - i * 0.04) * 520;
        return <Figure key={i} x={x} y={FLOOR} scale={1.1} facing={walking ? dirn : (f.x < 960 ? 1 : -1)} pose={walking ? walkPose(frame * 0.3 + i) : STAND}
          head={f.head} coat={f.coat} brows="flat" lids={0.3} mouth="flat" look={{ x: walking ? -0.8 : 0.8, y: 0 }} blink={blinking(frame, i + 30)} time={frame} />;
      })}
      <Thief frame={frame} b={b} k={k} face={close ? { brows: "worry", lids: 0.1, mouth: "wobble", eyes: 1.1, look: { x: 0.3, y: -0.9 } } : { ...EXPRESSIONS.sad }} />
    </>
  );
  return platformShot(cam, "day", frame, actors);
};

/** "By the weekend his tag says stands still. Safest man on the platform.": dusk, against a pillar, hands in his
 *  pockets, his card teal; a woman with a bag asleep on the bench right beside him. */
export const StandsStill: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(frame < k.safest
    ? camAt(frame, [[k.dusk, { x: 1430, y: 640, zoom: 1.45 }], [k.safest, { x: 1460, y: 650, zoom: 1.6 }]])
    : glide(frame, k.safest, k.sixTen, { x: 1480, y: 660, zoom: 1.7 }, { x: 1520, y: 690, zoom: 2.15 }), frame, "still", 3);
  const b: Body = { x: 1400, y: FLOOR, scale: 1.15, facing: 1, pose: { ...STAND, armF: [-4, -26], armB: [-14, 22], lean: -5 } };
  const seatTop = 836;
  const sleeper = { x: 1640, y: seatedY(seatTop, 1.1) };
  const sleepPose: Pose = { ...SEATED, tilt: 16, lean: -6 };
  const breathe = Math.sin(frame / 24) * 1.5;
  const actors = (
    <>
      <rect x={1300} y={80} width={70} height={FLOOR - 80 + 20} fill="#b8bec7" stroke={INK} strokeWidth={5} />
      <Figure x={sleeper.x} y={sleeper.y + breathe} scale={1.1} facing={-1} pose={sleepPose} head={WOMAN.head} coat={WOMAN.coat} brows="none" lids={1}
        mouth="o" eyes={0.9} time={frame} />
      <rect x={1740} y={seatTop - 44} width={58} height={46} rx={8} fill="#b5643a" stroke={INK} strokeWidth={4} />
      <path d="M1752 792 Q1769 760 1786 792" fill="none" stroke={INK} strokeWidth={4} />
      <Thief frame={frame} b={b} k={k} keys="still" face={{ brows: "flat", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 0.2, y: 0.4 } }} />
    </>
  );
  const options = { ...metroPlatform.defaults, train: null };
  return <Shot cam={cam} mood="dusk" lights={metroPlatform.lights(options)} back={metroPlatform.Back({ cam, mood: "dusk", frame, options })} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ your six-ten

const YOU_B: Body = { x: 620, y: FLOOR, scale: 1.15, facing: 1, pose: STAND };

/** The paper map: your flat, the platform, the food court, the stall, and the line between them worn thick by one
 *  pass after another; "93" stamped on "ninety-three". Sheet units, 900 x 560. */
const MapSheet: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const pop = (at: number) => Math.min(1, Math.max(0, (frame - at) / 6));
  const icon = (x: number, y: number, at: number, children: React.ReactNode) => (
    <g transform={`translate(${x} ${y}) scale(${1.5 * pop(at)})`}>{children}</g>
  );
  const route = "M140 400 Q200 260 330 190 Q480 120 640 150 Q760 230 760 380 Q560 500 140 400";
  return (
    <Sheet frame={frame} at={k.map} x={1290} y={420} w={900} h={560} tilt={-1.5}>
      {icon(140, 400, k.map + 8, <g><rect x={-40} y={-34} width={80} height={60} fill="#e6a0a0" stroke={INK} strokeWidth={5} /><path d="M-52 -30 L0 -74 L52 -30Z" fill="#7a3b46" stroke={INK} strokeWidth={5} /></g>)}
      {icon(330, 190, k.map + 12, <g><rect x={-60} y={-26} width={120} height={52} rx={18} fill="#c9ced8" stroke={INK} strokeWidth={5} /><rect x={-60} y={10} width={120} height={8} fill={CRIMSON} />{[-36, 0, 36].map((x) => <rect key={x} x={x - 12} y={-16} width={24} height={18} rx={4} fill="#bfe0ea" />)}</g>)}
      {icon(640, 150, k.map + 16, <g><path d="M-70 -10 Q0 -70 70 -10Z" fill={TEAL} stroke={INK} strokeWidth={5} /><rect x={-4} y={-10} width={8} height={56} fill={INK} />{[-40, 40].map((x) => <rect key={x} x={x - 14} y={34} width={28} height={10} rx={4} fill={INK} />)}</g>)}
      {icon(760, 380, k.map + 20, <g><rect x={-60} y={0} width={120} height={50} fill="#5a3b2a" stroke={INK} strokeWidth={5} /><line x1={0} y1={-60} x2={0} y2={-26} stroke={INK} strokeWidth={4} /><path d="M-20 -26 h40 l10 16 h-60z" fill="#3b404e" /><circle cx={0} cy={-8} r={7} fill="#fff1c2" /><rect x={-24} y={-16} width={48} height={16} rx={3} fill="#3a4150" /></g>)}
      {/* the route, pass after pass, until it is worn thick */}
      {frame >= k.route + 40 && <path d={route} fill="none" stroke={MUSTARD} strokeWidth={6 + 26 * ramp(frame, k.route + 40, k.ninety)} opacity={0.55} strokeLinecap="round" />}
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i} transform={`translate(${(i % 3) * 3 - 3} ${Math.floor(i / 3) * 3 - 2})`}>
          <DrawLine d={route} from={k.route + i * 9} to={k.route + i * 9 + 34} color={INK} width={4} />
        </g>
      ))}
      {frame >= k.ninety && <g transform={`translate(800 80) scale(${pop(k.ninety)}) translate(-800 -80)`}><Stamp x={800} y={80} text="93" color={TEAL} size={80} /></g>}
    </Sheet>
  );
};

/** "Nobody fell below eighty per cent.": a row of bars, every one above the dashed line at 80. Sheet units 620 x 380. */
const BarsSheet: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const base = 330, line = 200, per = 6.5;
  const values = [84, 88, 91, 82, 93, 86, 90, 81, 89, 92];
  return (
    <Sheet frame={frame} at={k.bars} x={1330} y={600} w={620} h={380} tilt={1.5}>
      {values.map((v, i) => (
        <DrawLine key={i} d={`M${150 + i * 44} ${base} V${base - (v - 60) * per}`} from={k.bars + 6 + i * 2} to={k.bars + 20 + i * 2} color={i === 4 ? TEAL : "#7fa0c4"} width={26} />
      ))}
      <DrawLine d={`M120 ${line + (80 - 80)} H590`} from={k.bars + 24} to={k.bars + 40} color={CRIMSON} width={6} dash />
      {frame >= k.bars + 34 && <Stamp x={68} y={base - 20 * per} text="80" color={CRIMSON} size={56} />}
    </Sheet>
  );
};

export const SixTen: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const tg = tags(k);
  const bd = boards(k);
  const on = current(frame, [[k.sixTen, "you"], [k.map, "two"], [k.route, "map"], [k.bars, "bars"], [k.timetable, "close"]]);
  const yh = headAt(YOU_B.x, YOU_B.y, YOU_B.scale, STAND, 1);
  const cams: Record<typeof on, Camera> = {
    you: camAt(frame, [[k.sixTen, closeUp(yh.x + 40, yh.y - 70, 2.2)], [k.map, closeUp(yh.x + 40, yh.y - 70, 2.35)]]),
    two: glide(frame, k.map, k.route, { x: 900, y: 560, zoom: 1.3 }, { x: 980, y: 520, zoom: 1.14 }),
    map: camAt(frame, [[k.route, { x: 1290, y: 430, zoom: 1.7 }], [k.bars, { x: 1300, y: 420, zoom: 1.85 }]]),
    bars: camAt(frame, [[k.bars, { x: 1320, y: 560, zoom: 1.75 }], [k.timetable, { x: 1320, y: 570, zoom: 1.9 }]]),
    close: camAt(frame, [[k.timetable, closeUp(yh.x - 40, yh.y - 60, 1.95)], [k.landlord, closeUp(yh.x + 40, yh.y - 60, 2.1)]]),
  };
  const cam = drift(cams[on], frame, "sixten", 3);
  const train = frame < k.arrive - 34 ? null : Math.round(2600 * Math.pow(1 - ramp(frame, k.arrive - 34, k.board), 2));
  const door = ramp(frame, k.board + 6, k.board + 20);
  const step = ramp(frame, k.board + 10, k.board + 40);
  const b: Body = { ...YOU_B, x: YOU_B.x + step * 60, pose: step > 0 && step < 1 ? walkPose(frame * 0.3) : STAND };
  const face = on === "close"
    ? { brows: frame >= k.board ? ("flat" as const) : ("raised" as const), lids: frame >= k.board ? 0.35 : 0.1, mouth: "flat" as const, eyes: 1, look: frame >= k.board ? { x: 0.8, y: 0.1 } : { x: 0.3, y: -0.9 } }
    : { brows: "raised" as const, lids: 0.1, mouth: "flat" as const, eyes: 1, look: { x: 0.4, y: -0.9 } };
  const actors = (
    <>
      <RateBoard frame={frame} x={402} y={360} size={46} keys={bd.clock} />
      {frame < k.timetable && <MapSheet frame={frame} k={k} />}
      {frame < k.timetable && <BarsSheet frame={frame} k={k} />}
      <Figure {...b} {...HERO} coat="#3b3e47" {...face} blink={blinking(frame, 0)} time={frame} />
      <Tag frame={frame} x={headAt(b.x, b.y, b.scale, b.pose, 1).x} headY={yh.y} r={yh.r} keys={tg.you} />
    </>
  );
  return platformShot(cam, "day", frame, actors, { train, doorOpen: door });
};

