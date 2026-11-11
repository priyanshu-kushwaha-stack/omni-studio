// The chai stall shots of "The first jump" (FirstJump.tsx): Monday's whole bowl (lines 13-14), Tuesday's flood (20-21)
// and "Do you like me?" (24-26). The set is sets/ChaiStall.tsx; the chai man, his pot and the flood are drawn here.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { INK, MUSTARD } from "@whatif/kit/theme";
import { Bubble, headAt, YesTag } from "../parts";
import { handAt, type Body } from "../parts2";
import { blinking, camAt, current, HERO, linear, mix, PASTELS, ramp } from "../shared";
import { CHAI, ChaiCounter, ChaiGlass, ChaiStallBack, ChutneyBowl, Saucer } from "../sets/ChaiStall";
import { aimed, Moustache, OnHead, ScarfTwist, talk, type T } from "./FirstJump.Times";

/** You and the chai man at the stall: you at scale S on the street, he at scale M behind the counter. */
const S = 1.15;
const M = 1.1;
const FLOOR = CHAI.floor;
/** The chai man: a peach head, a white vest, a red check cloth on his shoulder, a moustache. */
const MAN = { head: "#f0a882", coat: "#f1ece0", cloth: "#d8344f" };
/** The face he gives everyone: brows up, the smile (the same smile as the checker's). */
const GLAD = { brows: "raised" as const, lids: 0, mouth: "smile" as const, eyes: 1.05 };

const ChaiMan: React.FC<{ b: Body; face: object; frame: number; held?: React.ReactNode }> = ({ b, face, frame, held }) => {
  const h = headAt(b.x, b.y, b.scale, b.pose, b.facing);
  return (
    <>
      <Figure x={b.x} y={b.y} scale={b.scale} facing={b.facing} pose={b.pose} head={MAN.head} coat={MAN.coat} look={{ x: 0.9, y: 0.1 }}
        {...face} blink={blinking(frame, 6)} time={frame} held={held} />
      <OnHead {...b}><Moustache /></OnHead>
      <rect x={h.x - b.facing * 40 * b.scale - 14 * b.scale} y={h.y + h.r * 1.05} width={28 * b.scale} height={60 * b.scale} rx={6} fill={MAN.cloth}
        stroke={INK} strokeWidth={3} />
    </>
  );
};

/** A finger pointing out of your front hand (Figure `held`, hand space). */
const Finger: React.FC = () => <line x1={0} y1={0} x2={18} y2={-6} stroke={MUSTARD} strokeWidth={8} strokeLinecap="round" />;

/** The stall with the actors in the right order: the man, the counter, `mid` (props on the counter), the people. */
const ChaiSet: React.FC<{ cam: Camera; frame: number; man: React.ReactNode; bowl?: boolean; glasses?: number; mid?: React.ReactNode; people: React.ReactNode }> = ({
  cam, frame, man, bowl = true, glasses = 3, mid, people,
}) => (
  <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<ChaiStallBack cam={cam} frame={frame} />}
    actors={<>{man}<ChaiCounter frame={frame} bowl={bowl} glasses={glasses} />{mid}{people}</>} />
);

// ------------------------------------------------------------------------------------------------ Monday (13-14)

const YOU_X = 790;
const MON_MAN = 1080;
const STUDENT = { x: 545, head: PASTELS[5], coat: "#5a6488" };

export const MondayShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.stall, "wide"], [k.point, "point"], [k.bowlIn, "insert"], [k.give, "give"], [k.stand, "stand"]]);
  // The bowl: on the counter, lifted, then carried over the counter into your hands.
  const up = ramp(frame, k.lift, k.lift + 10);
  const over = ramp(frame, k.give, k.give + 12);
  const bowl = { x: mix(CHAI.bowl.x, 872, over), y: mix(CHAI.bowl.y, 718, up) + over * 22 };
  const lifted = frame >= k.lift;
  // Him: facing you, reaches for the bowl, leans over the counter to hand it, then turns back to his kettle.
  const reach = lifted && frame < k.give + 16;
  const turned = frame >= k.turn;
  const manX = turned ? mix(MON_MAN, 1330, ramp(frame, k.turn, k.turn + 24)) : MON_MAN;
  const lean = 14 * ramp(frame, k.give, k.give + 8) * (1 - ramp(frame, k.give + 14, k.give + 22));
  const man = aimed(manX, FLOOR, M, turned ? 1 : -1, turned ? walkPose(frame * 0.3) : { ...STAND, lean },
    reach || (frame >= k.bowlIn && frame < k.lift) ? { x: bowl.x + 26, y: bowl.y - 6 } : null);
  const manHead = headAt(man.x, man.y, M, man.pose, man.facing);
  // You: a finger at the bowl ("start small"), then both hands round it when it lands.
  const holding = frame >= k.give + 8;
  const pointing = frame >= k.point && !holding;
  const you = aimed(YOU_X, FLOOR, S, 1, STAND,
    holding ? { x: bowl.x + 22, y: bowl.y + 8 } : pointing ? { x: 990, y: 742 } : null,
    holding ? { x: bowl.x - 30, y: bowl.y + 10 } : null);
  const youHead = headAt(you.x, you.y, S, you.pose);
  const yFace = ({
    wide: { ...EXPRESSIONS.happy, look: { x: 0.8, y: 0.3 } },
    point: { brows: "raised" as const, lids: 0.2, mouth: "smirk" as const, eyes: 1, look: { x: 0.9, y: 0.5 } },
    insert: { brows: "raised" as const, lids: 0.2, mouth: "smirk" as const, eyes: 1, look: { x: 0.9, y: 0.5 } },
    give: frame < k.give + 10 ? { ...EXPRESSIONS.shocked, eyes: 1.25, look: { x: 0.7, y: 0.6 } } : { ...EXPRESSIONS.shocked, mouth: "flat" as const, eyes: 1.2, look: { x: 0.2, y: 0.8 } },
    stand: { brows: "flat" as const, lids: 0.3, mouth: "flat" as const, eyes: 1, look: { x: 0.1, y: 0.75 } },
  })[shot];
  const mFace = frame >= k.bowlSnap ? GLAD : { ...EXPRESSIONS.neutral, look: { x: 0.8, y: 0.4 } };
  // The student beside you: looks at the bowl, then at you.
  const sLook = shot === "stand" ? (frame < k.student ? { x: 1, y: 0.55 } : { x: 1, y: -0.05 }) : { x: 0.6, y: 0.2 };
  const sFace = shot === "stand" && frame >= k.student ? { brows: "raised" as const, mouth: "flat" as const, eyes: 1.15 } : { brows: "none" as const, mouth: "flat" as const };
  const people = (
    <>
      <Figure x={STUDENT.x} y={FLOOR} scale={S * 0.98} pose={{ ...STAND, armF: [60, 70] }} head={STUDENT.head} coat={STUDENT.coat} look={sLook} {...sFace}
        blink={blinking(frame, 3)} time={frame} held={<ChaiGlass x={4} y={10} scale={0.55} fill={0.6} />} />
      <Figure {...HERO} x={you.x} y={you.y} scale={S} pose={you.pose} {...yFace} blink={blinking(frame, 1)} time={frame} held={pointing ? <Finger /> : undefined} />
      {lifted && <ChutneyBowl x={bowl.x} y={bowl.y} scale={1} />}
      <YesTag frame={frame} at={k.bowlSnap} x={manHead.x} headY={manHead.y} r={manHead.r} />
    </>
  );
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.stall, { x: 1000, y: 560, zoom: 1.04 }], [k.point, { x: 975, y: 585, zoom: 1.14 }]]),
    point: camAt(frame, [[k.point, { x: 930, y: 640, zoom: 1.6 }], [k.bowlIn, { x: 935, y: 640, zoom: 1.7 }]]),
    insert: camAt(frame, [[k.bowlIn, insert(985, 735, 3.0)], [k.lift, insert(990, 735, 3.15)], [k.give, insert(990, 700, 2.9)]]),
    give: camAt(frame, [[k.give, { x: 940, y: 630, zoom: 1.6 }], [k.stand, { x: 950, y: 625, zoom: 1.66 }]]),
    stand: camAt(frame, [[k.stand, { x: 720, y: 640, zoom: 1.75 }], [k.bus, { x: 715, y: 645, zoom: 1.85 }]]),
  };
  const cam = drift(cams[shot], frame, "monday", shot === "insert" ? 1.5 : 3);
  return (
    <ChaiSet cam={cam} frame={frame} bowl={!lifted} people={people}
      man={<ChaiMan b={man} face={{ ...mFace, mouth: mFace.mouth }} frame={frame} />} />
  );
};

// ------------------------------------------------------------------------------------------------ Tuesday (20-21)

const TUE_MAN = 1210;
/** Your glass on its saucer on the counter (the glass's base). */
const G = { x: 955, y: 782 };

/** The flood at frame f: how far the pour has got. */
function flood(frame: number, k: T) {
  const P = k.pour;
  return {
    fill: frame < P ? 0.55 : mix(0.55, 1, ramp(frame, P, P + 10)) + ramp(frame, P + 10, P + 16) * 0.3,
    brim1: ramp(frame, P + 12, P + 24),
    slide: ramp(frame, P + 24, P + 32),
    brim2: ramp(frame, P + 32, P + 42),
    puddle: ramp(frame, P + 40, k.trophy + 14),
  };
}

/** His steel pot, tipped toward the glass by `tip` degrees, in hand space. */
const Pot: React.FC<{ tip: number }> = ({ tip }) => (
  <g transform={`rotate(${tip}) translate(-6 -10)`}>
    <path d="M-28 -24 H28 L24 22 Q0 30 -24 22Z" fill="#c9ced6" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M28 -22 L48 -32 L44 -18Z" fill="#c9ced6" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-32} y={-28} width={64} height={8} rx={4} fill="#b8bec8" stroke={INK} strokeWidth={3} />
  </g>
);

/** The counter props on Tuesday: saucers, the glass (unless you are holding it), the puddle and its drips. */
const Flood: React.FC<{ frame: number; k: T; glass: boolean; raised: number }> = ({ frame, k, glass, raised }) => {
  const f = flood(frame, k);
  const lift = f.slide * 8;
  const c = CHAI.counter;
  return (
    <g>
      {f.puddle > 0 && <ellipse cx={G.x + 40} cy={G.y + 2} rx={70 + f.puddle * 300} ry={10 + f.puddle * 6} fill="#c98a4b" stroke={INK} strokeWidth={3} />}
      {f.puddle > 0.2 && [0, 1, 2, 3, 4].map((i) => {
        const dx = -150 + i * 95;
        const len = Math.max(0, f.puddle - 0.2 - i * 0.08) * 120 + ((frame + i * 11) % 20) * 0.6;
        return <rect key={i} x={G.x + 40 + dx} y={c.top + 4} width={10} height={len} rx={5} fill="#c98a4b" />;
      })}
      {f.slide > 0 && <Saucer x={mix(G.x + 260, G.x, f.slide)} y={G.y + 2} scale={1.3} brim={f.brim2} />}
      <Saucer x={G.x} y={G.y - lift} brim={f.brim1} />
      {glass && <ChaiGlass x={G.x} y={G.y - 4 - lift - raised} scale={0.9} fill={f.fill} />}
    </g>
  );
};

export const TuesdayShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.tue, "ask"], [k.pour, "pour"], [k.trophy, "trophy"], [k.beam, "beam"], [k.same, "same"], [k.drain, "drain"]]);
  const pouring = frame >= k.pourSnap - 6;
  const raised = 10 * ramp(frame, k.raise, k.raise + 8) * (1 - ramp(frame, k.pourSnap - 8, k.pourSnap));
  const trophy = frame >= k.trophy;
  // Him: the pot comes up high on "yes" and pours a long stream into the glass, then the saucers, then everything.
  const potAt = { x: G.x + 150, y: mix(700, 560, ramp(frame, k.pourSnap - 6, k.pourSnap + 4)) };
  // The pot is in his back hand (drawn behind his head, so the arm never crosses his face).
  const man = aimed(TUE_MAN, FLOOR, M, -1, STAND, null, pouring ? potAt : null);
  const manHead = headAt(man.x, man.y, M, man.pose, -1);
  const hand = handAt(man, "back");
  const lip = { x: hand.x - 52, y: hand.y + 2 };
  const f = flood(frame, k);
  const target = trophy ? { x: G.x + 60, y: G.y - 2 } : f.slide > 0.5 ? { x: G.x + 30, y: G.y - 10 } : { x: G.x, y: G.y - 60 };
  const stream = pouring && frame >= k.pour - 2 ? (
    <g fill="none" strokeLinecap="round">
      <path d={`M${lip.x} ${lip.y} Q${mix(lip.x, target.x, 0.7)} ${lip.y + 6} ${target.x} ${target.y}`} stroke={INK} strokeWidth={14} />
      <path d={`M${lip.x} ${lip.y} Q${mix(lip.x, target.x, 0.7)} ${lip.y + 6} ${target.x} ${target.y}`} stroke="#c98a4b" strokeWidth={8} />
    </g>
  ) : null;
  // You: a hand on your glass; you lift it an inch; then, in the flood, high over your head like a trophy.
  // The trophy is raised in your back hand (behind your head); in the last close it comes down to your chest.
  const high = trophy && frame < k.drain;
  const low = frame >= k.drain;
  const you = aimed(YOU_X + 20, FLOOR, S, 1, STAND,
    high ? { x: YOU_X + 110, y: 760 } : low ? { x: YOU_X + 100, y: 770 } : { x: G.x - 12, y: G.y - 40 - raised },
    high ? { x: YOU_X + 50, y: 470 } : null);
  const top = handAt(you, "back");
  const youHead = headAt(you.x, you.y, S, you.pose);
  const yFace = ({
    ask: { brows: "raised" as const, lids: 0.15, mouth: frame < k.raise ? "smile" as const : "smirk" as const, eyes: 1, look: { x: 0.9, y: 0.05 } },
    pour: { ...EXPRESSIONS.shocked, eyes: 1.2, look: { x: 0.8, y: 0.7 } },
    trophy: { ...EXPRESSIONS.relieved, mouth: "open" as const, look: { x: 0.3, y: -0.9 } },
    beam: EXPRESSIONS.happy,
    same: EXPRESSIONS.happy,
    drain: { brows: frame < k.drain + 10 ? "raised" as const : "flat" as const, lids: mix(0, 0.4, ramp(frame, k.drain + 6, k.drain + 22)),
      mouth: frame < k.drain + 10 ? "smile" as const : "flat" as const, eyes: 1, look: { x: 0.9, y: 0.05 } },
  })[shot];
  const mFace = frame >= k.pourSnap ? GLAD : { ...EXPRESSIONS.neutral, look: { x: 0.8, y: 0.2 } };
  const people = (
    <>
      <Figure {...HERO} x={you.x} y={you.y} scale={S} pose={you.pose} {...yFace} blink={blinking(frame, 1)} time={frame}
        held={low ? <ChaiGlass x={-2} y={30} scale={0.9} fill={1.3} /> : undefined} />
      {high && <ChaiGlass x={top.x} y={top.y + 30} scale={0.9} fill={1.3} />}
      {high && [0, 1, 2].map((i) => {
        const h = top;
        const p = ((frame - k.trophy) / 14 + i / 3) % 1;
        return <circle key={i} cx={h.x - 18 + i * 14} cy={h.y + 34 + p * 200} r={6} fill="#c98a4b" opacity={1 - p} />;
      })}
      <YesTag frame={frame} at={k.pourSnap} x={manHead.x} headY={manHead.y} r={manHead.r} />
    </>
  );
  const two = { x: 1010, y: 640, zoom: 1.55 };
  const cams: Record<typeof shot, Camera> = {
    ask: camAt(frame, [[k.tue, { x: 1000, y: 600, zoom: 1.3 }], [k.raise, two]]),
    pour: camAt(frame, [[k.pour, insert(1000, 720, 2.7)], [k.trophy, insert(1000, 735, 2.45)]]),
    trophy: camAt(frame, [[k.trophy, { x: 1000, y: 610, zoom: 1.4 }], [k.beam, { x: 1000, y: 605, zoom: 1.46 }]]),
    beam: camAt(frame, [[k.beam, closeUp(manHead.x - 30, manHead.y - 40, 2.5)], [k.same, closeUp(manHead.x - 30, manHead.y - 40, 2.7)]]),
    same: REFSAME,
    drain: camAt(frame, [[k.drain, closeUp(youHead.x + 40, youHead.y, 2.6)], [k.phone, closeUp(youHead.x + 40, youHead.y, 2.8)]]),
  };
  if (shot === "same") return <SameSmile frame={frame} k={k} />;
  const cam = drift(cams[shot], frame, "tuesday", shot === "pour" ? 1.5 : 3);
  return (
    <ChaiSet cam={cam} frame={frame} people={people} bowl={false}
      mid={<>{<Flood frame={frame} k={k} glass={!trophy} raised={raised} />}{stream}</>}
      man={<>{pouring && <g transform={`translate(${hand.x} ${hand.y}) scale(-1 1) rotate(35)`}><Pot tip={0} /></g>}<ChaiMan b={man} face={mFace} frame={frame} /></>} />
  );
};
const REFSAME: Camera = { x: 960, y: 540, zoom: 1 };

/** "Exactly the same.": Monday at the left, Tuesday at the right, both close on his face; the same smile, the same tag. */
const SameSmile: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const zoom = mix(2.3, 2.45, linear(frame, k.same, k.drain));
  const half = (manX: number, side: -1 | 1, monday: boolean) => {
    const man = aimed(manX, FLOOR, M, -1, STAND, null);
    const h = headAt(man.x, man.y, M, STAND, -1);
    // Put his face at the centre of this half of the frame.
    const cam: Camera = { x: h.x - (side * 480) / zoom, y: h.y - 50, zoom };
    const mid = monday ? null : <Flood frame={frame} k={k} glass={false} raised={0} />;
    return (
      <ChaiSet cam={cam} frame={frame} bowl={false} mid={mid}
        man={<ChaiMan b={man} face={GLAD} frame={frame} />}
        people={<YesTag frame={frame} at={monday ? k.bowlSnap : k.pourSnap} x={h.x} headY={h.y} r={h.r} />} />
    );
  };
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: "inset(0 50% 0 0)" }}>{half(MON_MAN, -1, true)}</AbsoluteFill>
      <AbsoluteFill style={{ clipPath: "inset(0 0 0 50%)" }}>{half(TUE_MAN, 1, false)}</AbsoluteFill>
      <div style={{ position: "absolute", left: 953, top: 0, width: 14, height: 1080, background: "#f3e9d7", boxShadow: "0 0 0 4px #23252b" }} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ "Do you like me?" (24-26)

const LIKE_YOU = 830;
const LIKE_MAN = 1100;

export const LikeShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.like, "ask"], [k.smile, "smile"], [k.noIdea, "you"], [k.tagIn, "tag"], [k.thing, "thing"], [k.walk, "walk"]]);
  const c = k.clips;
  // Him: a nod on the yes, small nods while he says "Of course, of course", then back to his kettle on "Never".
  const nod = frame >= k.likeSnap ? Math.sin((frame - k.likeSnap) / 4) * 7 * Math.max(0.25, 1 - (frame - k.likeSnap) / 50) : 0;
  const turned = frame >= k.walk + 10;
  const manX = turned ? mix(LIKE_MAN, 1330, ramp(frame, k.walk + 10, k.walk + 34)) : LIKE_MAN;
  const man = aimed(manX, FLOOR, M, turned ? 1 : -1, turned ? walkPose(frame * 0.3) : { ...STAND, tilt: shot === "you" || shot === "smile" ? 0 : nod }, null);
  const manHead = headAt(man.x, man.y, M, man.pose, man.facing);
  const mFace = frame >= k.likeSnap ? { ...GLAD, mouth: talk(frame, c[24], "smile", "open", "smile") } : { ...EXPRESSIONS.neutral, look: { x: 0.8, y: 0.2 } };
  // You: leaning over the counter, both hands at your chest wringing your scarf; then you step back and walk off.
  const leaving = frame >= k.walk;
  const youX = leaving ? mix(LIKE_YOU, LIKE_YOU - 700, linear(frame, k.walk + 6, k.platform + 20)) : LIKE_YOU;
  const lean = leaving ? 0 : 12;
  const chest = { x: youX + 62, y: 742 };
  const you = aimed(youX, FLOOR, S, leaving ? -1 : 1, leaving ? walkPose(frame * 0.3) : { ...STAND, lean },
    leaving ? null : chest, leaving ? null : { x: chest.x - 16, y: chest.y + 8 });
  const youHead = headAt(you.x, you.y, S, you.pose, you.facing);
  const yFace = ({
    ask: frame < k.likeSnap ? { ...EXPRESSIONS.worried, mouth: "smile" as const, eyes: 1.1, look: { x: 0.9, y: 0 } } : { ...EXPRESSIONS.shocked, mouth: "smile" as const, eyes: 1.15, look: { x: 0.9, y: -0.1 } },
    smile: EXPRESSIONS.happy,
    you: { brows: "worry" as const, lids: mix(0.1, 0.45, ramp(frame, k.noIdea + 10, k.noIdea + 40)), mouth: frame < k.noIdea + 14 ? "smile" as const : "flat" as const, eyes: 1, look: { x: 0.9, y: 0.05 } },
    tag: EXPRESSIONS.sad,
    thing: { ...EXPRESSIONS.sad, look: { x: 0.9, y: -0.4 } },
    walk: { ...EXPRESSIONS.sad, look: { x: 0.6, y: 0.5 } },
  })[shot];
  const people = (
    <>
      <Figure {...HERO} x={you.x} y={you.y} scale={S} facing={you.facing} pose={you.pose} {...yFace} blink={blinking(frame, 1)} time={frame} />
      {!leaving && <ScarfTwist x={chest.x - 8} y={chest.y + 2} scale={S} frame={frame} />}
      <YesTag frame={frame} at={k.likeSnap} x={manHead.x} headY={manHead.y} r={manHead.r} />
      <Bubble frame={frame} at={k.like + 2} until={k.likeSnap + 22} x={youHead.x - youHead.r * 0.4} y={youHead.y - youHead.r * 1.3} text="Do you like me?" size={28} side="left" />
    </>
  );
  const tagY = manHead.y - manHead.r - 70;
  const cams: Record<typeof shot, Camera> = {
    ask: camAt(frame, [[k.like, { x: 950, y: 600, zoom: 1.55 }], [k.smile, { x: 960, y: 605, zoom: 1.7 }]]),
    smile: camAt(frame, [[k.smile, closeUp(manHead.x - 20, manHead.y - 40, 2.6)], [k.noIdea, closeUp(manHead.x - 20, manHead.y - 40, 2.8)]]),
    you: camAt(frame, [[k.noIdea, closeUp(youHead.x + 20, youHead.y + 10, 2.9)], [k.tagIn, closeUp(youHead.x + 24, youHead.y + 10, 3.1)]]),
    tag: camAt(frame, [[k.tagIn, insert(manHead.x, tagY + 20, 3.6)], [k.thing, insert(manHead.x, tagY + 26, 3.8)]]),
    thing: camAt(frame, [[k.thing, insert(manHead.x, tagY + 60, 3.0)], [k.walk, { x: manHead.x - 60, y: 560, zoom: 1.9 }]]),
    walk: camAt(frame, [[k.walk, { x: 980, y: 580, zoom: 1.25 }], [k.platform, { x: 900, y: 570, zoom: 1.12 }]]),
  };
  const cam = drift(cams[shot], frame, "like", shot === "tag" ? 1.5 : 3);
  return <ChaiSet cam={cam} frame={frame} glasses={0} people={people} man={<ChaiMan b={man} face={mFace} frame={frame} />} />;
};
