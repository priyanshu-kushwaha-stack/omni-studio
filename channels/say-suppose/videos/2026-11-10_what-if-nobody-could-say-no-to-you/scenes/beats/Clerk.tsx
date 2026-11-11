// Beat "The clerk" (script.md, ## [03:05] The clerk; narration lines 37-44). Same pattern as Change.tsx: `times()`
// from the clips, one component per shot, the beat picks the shot by frame and places the snap outside the Stage.
//
//   37    outside the copy shop: the queue of six out of the door; you arrive at the back with a thin folder; pan
//         along the queue; close on you and the folder.
//   38    inside: you walk in along the queue and stop beside the first student (backpack, their own folder), face
//         them and ask; the clerk (grey head, spectacles) never looks up; push in on "because I need to make copies".
//   39    snap: the tag over the student, who nods and steps aside; nobody behind says a word; you step to the
//         counter and the clerk takes your folder without looking up. "Haan, give."
//   40    close on the student, smiling and nodding under the tag, the copier running; close on you, uneasy.
//   41    over your shoulder: the queue, six faces, not one looking at you, one on his phone.
//   42    the paper diagram on the shop wall: a copier, a queue of pastel heads; one steps forward with a real reason
//         (ink bars) and the copier lights; another with a bubble that holds only an empty box, and it lights too.
//   43    the metro gate: a different checker waves you through, your ticket good, you say nothing; then the platform,
//         close on you with the copies against your chest, the train sliding in behind.
//   44    the train stops; insert on its window: your reflection, the copies, brows down.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, ForegroundHead } from "@whatif/kit/stage/shots";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import type { Clip } from "@whatif/kit/timeline";
import { INK, PAPER } from "@whatif/kit/theme";
import { headAt, Sheet, YesTag } from "../parts";
import { aimArm, HandPhone, PeakCap, type Body } from "../parts2";
import { blinking, camAt, current, HERO, lineEnd, linear, mix, PASTELS, ramp, type Beat, type Shot } from "../shared";
import { MetroBack, MetroFront, METRO_GATE, METRO_PLATFORM, Turnstile } from "../sets/Metro";
import { Sfx } from "./Change.parts";
import { Clerk, Copier, Copies, CopyShopBack, Folder, QUEUERS, SHOP, SHOP_STREET, ShopCounter, Student } from "./Clerk.CopyShop";

const S = 1.15;
const FLOOR = SHOP.floor;

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  return {
    street: from(37), // outside, you arrive at the back of the queue
    arrived: at(37, 0.38),
    six: at(37, 0.4), // "Six people in the queue": pan along it
    five: at(37, 0.72), // "and you need five copies": close on you and the folder
    inside: lineEnd(clips, 37) - 4, // inside: you walk in along the queue
    beside: at(38, 0.3), // you stop beside the first student and face them
    say: at(38, 0.42), // "can I go ahead, five copies,"
    because: at(38, 0.7), // "because I need to make copies?"
    sayEnd: lineEnd(clips, 38),
    snap: lineEnd(clips, 38) - 2, // the student nods: the tag
    aside: lineEnd(clips, 38) + 6, // and steps aside
    turn: from(39) - 2, // you turn to the counter
    take: from(39) + 16, // the clerk takes the folder without looking up
    haan: from(39),
    haanEnd: lineEnd(clips, 39),
    nodClose: from(40) - 2, // close on the student under the tag
    you: at(40, 0.6), // "The queue lets you through anyway.": close on you
    queue: from(41) - 2, // over your shoulder at the queue
    phone: at(41, 0.42),
    wall: from(42) - 4, // the paper diagram
    real: at(42, 0.17), // a real reason steps up
    realYes: at(42, 0.3),
    empty: at(42, 0.38), // "an empty reason"
    emptyYes: at(42, 0.52), // "worked"
    same: at(42, 0.66), // "as well as a real one"
    gate: from(43) - 2, // the gate, a different checker
    platform: at(43, 0.5), // close on you on the platform
    trainIn: at(43, 0.82),
    stop: from(44) - 6, // the train stops behind you
    window: from(44) + 22, // insert: your reflection
    end: to,
  };
}

/** A speaking mouth: open and closed in turn while a line plays. */
const talk = (frame: number, from: number, to: number, rest: "smile" | "flat" = "flat") =>
  frame >= from && frame < to ? (Math.floor((frame - from) / 5) % 2 === 0 ? "open" as const : "smile" as const) : rest;

/** A nod: a few dips of the head from `at`, dying away. */
const nodAt = (frame: number, at: number, depth = 5) =>
  frame < at ? 0 : Math.max(0, Math.sin((frame - at) / 4)) * depth * Math.max(0, 1 - (frame - at) / 90);

// ------------------------------------------------------------------------------------------------ line 37: the street

const StreetShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const walking = frame < k.arrived;
  const x = mix(SHOP_STREET.arrive.from + 250, SHOP_STREET.arrive.to, ramp(frame, k.street, k.arrived));
  const hero: Body = { x, y: FLOOR, scale: S, facing: 1, pose: walking ? walkPose(frame * 0.3) : STAND };
  const head = headAt(hero.x, hero.y, S, hero.pose);
  const look = frame >= k.five ? ramp(frame, k.five + 6, k.five + 20) : 0;
  hero.pose = { ...hero.pose, armF: frame >= k.five ? aimArm(hero, { x: x + 75, y: FLOOR - 165 * S }) : hero.pose.armF };
  const shot = current(frame, [[k.street, "wide"], [k.six, "queue"], [k.five, "you"]]);
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.street, { x: 1000, y: 600, zoom: 1.02 }], [k.six, { x: 1040, y: 610, zoom: 1.12 }]]),
    queue: camAt(frame, [[k.six, { x: 1500, y: 660, zoom: 1.6 }], [k.five, { x: 1050, y: 660, zoom: 1.6 }]]),
    you: camAt(frame, [[k.five, closeUp(head.x + 40, head.y + 30, 2.4)], [k.inside, closeUp(head.x + 40, head.y + 40, 2.7)]]),
  };
  const face = shot === "you"
    ? { ...EXPRESSIONS.worried, look: { x: mix(0.9, 0.5, look), y: mix(0, 0.9, look) }, mouth: "flat" as const }
    : { ...EXPRESSIONS.neutral, brows: "flat" as const, look: { x: 0.9, y: 0 } };
  const cam = drift(cams[shot], frame, "street", 3);
  const actors = (
    <>
      {SHOP_STREET.queue.map((qx, i) => {
        const q = QUEUERS[i];
        const sway: Pose = { ...STAND, tilt: Math.sin(frame / 30 + i) * 3, lean: Math.sin(frame / 45 + i * 2) * 1.5 };
        if (i === 0) return <Student key={qx} x={qx} y={FLOOR} scale={q.scale} facing={1} pose={sway} look={{ x: 0.8, y: 0.1 }} mouth="flat" time={frame} />;
        return (
          <Figure key={qx} x={qx} y={FLOOR + (i % 2) * 6} scale={q.scale} pose={sway} head={q.head} coat={q.coat}
            look={{ x: 0.8, y: q.phone ? 0.9 : 0.1 }} mouth="flat" lids={q.phone ? 0.3 : 0.15} blink={blinking(frame, i + 2)} time={frame}
            held={q.phone ? <HandPhone frame={frame} /> : undefined} />
        );
      })}
      <Figure {...HERO} {...hero} {...face} blink={blinking(frame, 1)} time={frame} held={<Folder />} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<CopyShopBack cam={cam} view="street" frame={frame} />} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ lines 38-41: inside

/** Where you are inside: walking in along the queue, beside the first student facing them, then at the counter (and,
 *  from `queue`, turned to look back at the queue). */
function heroInside(frame: number, k: T): Body {
  const walking = frame < k.beside;
  const x = mix(560, BESIDE, ramp(frame, k.inside, k.beside));
  const facing = frame >= k.queue ? -1 : frame >= k.beside && frame < k.turn ? -1 : 1;
  return { x, y: FLOOR, scale: S, facing, pose: walking ? walkPose(frame * 0.32) : STAND };
}

const BESIDE = 1110;
const CLERK_X = SHOP.clerk.x - 50;

/** The first student: steps aside (toward the camera, a little back) after the nod. */
function studentAt(frame: number, k: T): Body {
  const a = ramp(frame, k.aside, k.aside + 16);
  const s = QUEUERS[0].scale;
  const nod = nodAt(frame, k.snap, 7) + (frame >= k.nodClose ? Math.max(0, Math.sin((frame - k.nodClose) / 7)) * 3 : 0);
  const stepping = frame >= k.aside && frame < k.aside + 16;
  const pose: Pose = stepping ? walkPose(frame * 0.35) : { ...STAND, lean: nod, tilt: nod * 1.3 };
  return { x: mix(SHOP.queue[0], SHOP.queue[0] - 40, a), y: FLOOR + a * 50, scale: s * (1 + a * 0.08), facing: 1, pose };
}

const InsideShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const hero = heroInside(frame, k);
  const head = headAt(hero.x, hero.y, S, hero.pose, hero.facing);
  // At the counter you hold the folder out over it; it is in the clerk's hand from `take`.
  const holdOut = ramp(frame, k.turn + 10, k.turn + 18) * (1 - ramp(frame, k.take, k.take + 10));
  if (frame < k.queue && holdOut > 0) {
    hero.pose = { ...hero.pose, armF: aimArm(hero, { x: mix(hero.x + 50, 1200, holdOut), y: mix(FLOOR - 170 * S, 780, holdOut) }) };
  }
  const student = studentAt(frame, k);
  const sh = headAt(student.x, student.y, student.scale, student.pose, 1);
  // The clerk never looks up: eyes on his work, he reaches for the folder and turns it to the copier.
  const clerkBody: Body = { x: CLERK_X, y: FLOOR, scale: S, facing: -1, pose: STAND };
  const reach = ramp(frame, k.take - 8, k.take) * (1 - ramp(frame, k.take + 10, k.take + 26));
  clerkBody.pose = {
    ...STAND,
    armF: reach > 0 ? aimArm(clerkBody, { x: mix(CLERK_X - 40, 1205, reach), y: mix(FLOOR - 200 * S, 780, reach) })
      : frame >= k.take ? aimArm(clerkBody, { x: CLERK_X + 30, y: FLOOR - 190 * S }) : [20, 40],
    armB: [-30, 50],
  };
  const clerkFace = { brows: "flat" as const, lids: 0.45, mouth: talk(frame, k.haan, k.haanEnd), eyes: 1, look: { x: 0.5, y: 0.85 } };
  const studentFace = frame >= k.snap
    ? { brows: "raised" as const, lids: 0, mouth: "smile" as const, eyes: 1.05, look: { x: 0.9, y: 0 } }
    : frame >= k.beside ? { brows: "none" as const, lids: 0, mouth: "flat" as const, eyes: 1, look: { x: 0.9, y: 0 } }
      : { brows: "none" as const, lids: 0.2, mouth: "flat" as const, eyes: 1, look: { x: 0.9, y: 0.3 } };

  const shot = current(frame, [[k.inside, "walk"], [k.say, "ask"], [k.snap, "tag"], [k.nodClose, "student"], [k.you, "you"], [k.queue, "queue"]]);
  const yFace = ({
    walk: { ...EXPRESSIONS.determined, mouth: "flat" as const, look: { x: 0.9, y: 0 } },
    ask: { brows: "raised" as const, lids: 0, mouth: talk(frame, k.say, k.sayEnd, "smile"), eyes: 1.05, look: { x: 0.9, y: 0 } },
    tag: frame < k.turn ? { ...EXPRESSIONS.shocked, mouth: "flat" as const, look: { x: 0.8, y: -0.5 } } : { ...EXPRESSIONS.worried, look: { x: 0.9, y: 0.3 } },
    student: EXPRESSIONS.worried,
    you: { ...EXPRESSIONS.worried, eyes: 1.1, look: { x: 0.9, y: 0.1 } },
    queue: { ...EXPRESSIONS.sceptical, look: { x: 0.9, y: 0.1 } },
  } as const)[shot];
  const mid = (BESIDE + SHOP.queue[0]) / 2;
  const cams: Record<typeof shot, Camera> = {
    walk: camAt(frame, [[k.inside, { x: 700, y: 660, zoom: 1.4 }], [k.beside, { x: 1000, y: 650, zoom: 1.45 }], [k.say, { x: 1010, y: 650, zoom: 1.5 }]]),
    ask: camAt(frame, [[k.say, { x: mid + 40, y: 650, zoom: 1.9 }], [k.because, { x: mid + 40, y: 650, zoom: 2.0 }], [k.sayEnd, { x: mid + 40, y: 650, zoom: 2.2 }]]),
    tag: camAt(frame, [[k.snap, { x: 1000, y: 610, zoom: 1.3 }], [k.nodClose, { x: 1020, y: 610, zoom: 1.36 }]]),
    student: camAt(frame, [[k.nodClose, closeUp(sh.x + 20, sh.y - 40, 2.4)], [k.you, closeUp(sh.x + 20, sh.y - 40, 2.65)]]),
    you: camAt(frame, [[k.you, closeUp(head.x + 30, head.y, 2.6)], [k.queue, closeUp(head.x + 30, head.y + 4, 2.85)]]),
    queue: camAt(frame, [[k.queue, { x: 820, y: 640, zoom: 1.7 }], [k.wall, { x: 480, y: 640, zoom: 1.75 }]]),
  };
  const cam = drift(cams[shot], frame, "inside", 3);
  const copies = frame < k.nodClose ? 0 : (frame - k.nodClose) / 14;
  const queueFaces = (i: number) => {
    // Eyes on the counter; a glance as you pass; nobody says a word. At line 41: anywhere but at you.
    if (frame >= k.queue) return { look: [{ x: 0.9, y: 0.6 }, { x: -0.6, y: -0.6 }, { x: 0.6, y: 0.95 }, { x: 0.2, y: 0.8 }, { x: -0.8, y: 0.2 }, { x: 0.9, y: -0.4 }][i], lids: 0.4 };
    const glance = Math.abs(hero.x - SHOP.queue[i]) < 120 && frame < k.beside;
    return { look: glance ? { x: -0.2, y: 0.1 } : { x: 0.9, y: 0.1 }, lids: 0.15 };
  };
  const actors = (
    <>
      <Copier x={SHOP.copier.x} y={FLOOR} frame={frame} run={frame >= k.take + 20} copies={copies} />
      {SHOP.queue.map((qx, i) => {
        if (i === 0) return null;
        const q = QUEUERS[i];
        const phone = q.phone && (frame >= k.queue || frame < k.inside + 20);
        return (
          <Figure key={qx} x={qx} y={FLOOR + (i % 2) * 6} scale={q.scale} pose={{ ...STAND, tilt: Math.sin(frame / 28 + i) * 2 }}
            head={q.head} coat={q.coat} mouth="flat" {...queueFaces(i)} blink={blinking(frame, i + 2)} time={frame}
            held={phone ? <HandPhone frame={frame} /> : undefined} />
        );
      })}
      <Clerk {...clerkBody} {...clerkFace} blink={blinking(frame, 6)} time={frame}
        held={frame >= k.take && frame < k.take + 40 ? <Folder tilt={60} scale={0.9} /> : undefined} />
      <ShopCounter folder={frame >= k.take + 40} />
      <Figure {...HERO} {...hero} {...yFace} blink={blinking(frame, 1)} time={frame}
        held={frame < k.take ? <Folder tilt={holdOut > 0 ? 70 : -10} /> : undefined} />
      <Student {...student} {...studentFace} blink={blinking(frame, 2)} time={frame} />
      <YesTag frame={frame} at={k.snap} x={sh.x} headY={sh.y - 10} r={sh.r} />
    </>
  );
  return (
    <>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<CopyShopBack cam={cam} view="inside" frame={frame} />} actors={actors} />
      {shot === "queue" && <ForegroundHead x={1760} side="right" blur={16} />}
    </>
  );
};

// ------------------------------------------------------------------------------------------------ line 42: the paper

const DHEADS = [90, 160, 230, 300, 370];

/** A small speech bubble on the diagram: ink bars inside (a reason) or only an empty dashed box. */
const DBubble: React.FC<{ x: number; y: number; empty?: boolean; s: number }> = ({ x, y, empty, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-6 30 L-18 52 L10 30Z" fill={PAPER} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-60} y={-40} width={120} height={72} rx={26} fill={PAPER} stroke={INK} strokeWidth={4} />
    {empty
      ? <rect x={-30} y={-20} width={60} height={32} rx={4} fill="none" stroke={INK} strokeWidth={4} strokeDasharray="8 7" />
      : [0, 1].map((r) => <rect key={r} x={-40} y={-20 + r * 20} width={r ? 54 : 80} height={10} rx={5} fill={INK} />)}
  </g>
);

const Tick: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) =>
  s <= 0 ? null : (
    <path transform={`translate(${x} ${y}) scale(${s})`} d="M-18 0 L-4 14 L22 -16" fill="none" stroke="#1d9a8f" strokeWidth={9}
      strokeLinecap="round" strokeLinejoin="round" />
  );

const WallShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const w = SHOP.wall;
  const cam = drift(camAt(frame, [[k.wall, { x: w.x, y: w.y + 30, zoom: 2.15 }], [k.same, { x: w.x + 10, y: w.y + 20, zoom: 2.3 }], [k.gate, { x: w.x + 60, y: w.y + 10, zoom: 2.6 }]]), frame, "wall", 2);
  const pop = (at: number) => ramp(frame, at, at + 8);
  const stepA = ramp(frame, k.real, k.real + 12) * (1 - ramp(frame, k.empty - 8, k.empty));
  const stepB = ramp(frame, k.empty, k.empty + 12);
  const lit = (frame >= k.realYes && frame < k.empty) || frame >= k.emptyYes;
  const headY = 250;
  const draw = k.wall + 6;
  const actors = (
    <Sheet frame={frame} at={k.wall} x={w.x} y={w.y} w={w.w} h={w.h} tilt={-1.5}>
      {/* the copier, drawn as it goes */}
      <DrawLine d="M520 290 V150 H660 V290 Z" from={draw} to={draw + 18} color={INK} width={6} />
      <DrawLine d="M510 150 H670 M540 190 H640 M455 182 L520 172" from={draw + 14} to={draw + 30} color={INK} width={6} />
      <circle cx={640} cy={260} r={12} fill={lit ? "#4fe08a" : "#cdbfa6"} stroke={INK} strokeWidth={3} />
      {lit && <circle cx={640} cy={260} r={24} fill="#4fe08a" opacity={0.3} />}
      {/* the floor line and the queue of pastel heads */}
      <DrawLine d="M40 300 H680" from={draw + 6} to={draw + 26} color={INK} width={4} />
      {DHEADS.map((hx, i) => {
        const s = pop(draw + 22 + i * 4);
        const dx = i === 4 ? stepA * 80 : i === 3 ? stepB * 150 : 0;
        return s > 0 ? (
          <g key={hx} transform={`translate(${hx + dx} ${headY}) scale(${s})`}>
            <rect x={-20} y={14} width={40} height={36} rx={14} fill={INK} />
            <circle r={24} fill={PASTELS[(i * 3 + 1) % PASTELS.length]} stroke={INK} strokeWidth={3} />
          </g>
        ) : null;
      })}
      {/* a real reason, then an empty one: the copier says yes to both */}
      {stepA > 0.5 && <DBubble x={450} y={150} s={pop(k.real + 6)} />}
      {frame >= k.empty && <g opacity={0.55}><DBubble x={350} y={130} s={0.8} /></g>}
      {stepB > 0.5 && <DBubble x={480} y={150} empty s={pop(k.empty + 8)} />}
      <Tick x={600} y={110} s={frame >= k.realYes && frame < k.empty ? pop(k.realYes) : 0} />
      {frame >= k.same && <Tick x={380} y={78} s={pop(k.same)} />}
      <Tick x={600} y={110} s={frame >= k.emptyYes ? pop(k.emptyYes) : 0} />
    </Sheet>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<CopyShopBack cam={cam} view="inside" frame={frame} />} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ line 43: the gate

const OTHER_CHECKER = { head: "#d9a37a", cap: "#2d3a5c", coat: "#2d3a5c" };

const GateShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const g = METRO_GATE;
  const x = mix(g.gate.x - 330, g.gate.x + 330, linear(frame, k.gate, k.platform));
  const hero: Body = { x, y: g.floor, scale: S, facing: 1, pose: walkPose(frame * 0.3) };
  hero.pose = { ...hero.pose, armF: aimArm(hero, { x: x + 45, y: g.floor - 150 * S }) };
  const checker: Body = { x: g.gate.x + 230, y: g.floor, scale: S, facing: -1, pose: STAND };
  // He waves you through with a flat, ordinary face: no tag, nobody asked anything.
  const wave = Math.sin((frame - k.gate) / 4) * 18;
  checker.pose = { ...STAND, armF: [130 + wave, 30] };
  const cam = drift(camAt(frame, [[k.gate, { x: g.gate.x - 60, y: 680, zoom: 1.5 }], [k.platform, { x: g.gate.x + 120, y: 680, zoom: 1.55 }]]), frame, "cgate", 3);
  const actors = (
    <>
      <Turnstile x={g.gate.x} y={g.floor} scale={S} lamp="green" open={ramp(frame, k.gate, k.gate + 10)} />
      <Figure {...checker} head={OTHER_CHECKER.head} coat={OTHER_CHECKER.coat} mouth="flat" brows="flat" look={{ x: 0.9, y: 0.2 }}
        blink={blinking(frame, 4)} time={frame} />
      <PeakCap {...checker} color={OTHER_CHECKER.cap} />
      <Figure {...HERO} {...hero} {...EXPRESSIONS.sad} lids={0.4} mouth="flat" look={{ x: 0.7, y: 0.7 }} time={frame} flow={0.2}
        held={<Copies tilt={-14} />} />
    </>
  );
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<MetroBack cam={cam} view="gate" frame={frame} crowd />}
      actors={actors} front={<MetroFront cam={cam} view="gate" />} />
  );
};

// ------------------------------------------------------------------------------------------------ lines 43-44: the platform

const PX = 900;

const PlatformShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const hero: Body = { x: PX, y: METRO_PLATFORM.floor, scale: S, facing: 1, pose: STAND };
  hero.pose = { ...STAND, armF: aimArm(hero, { x: PX + 40, y: METRO_PLATFORM.floor - 150 * S }), armB: aimArm(hero, { x: PX + 24, y: METRO_PLATFORM.floor - 140 * S }) };
  const head = headAt(PX, METRO_PLATFORM.floor, S, STAND);
  const train = frame < k.trainIn ? null : 2600 * (1 - ramp(frame, k.trainIn, k.stop + 10));
  const shot = current(frame, [[k.platform, "close"], [k.stop, "medium"]]);
  const cam = drift(shot === "close"
    ? camAt(frame, [[k.platform, closeUp(head.x + 20, head.y + 40, 2.4)], [k.stop, closeUp(head.x + 20, head.y + 40, 2.75)]])
    : camAt(frame, [[k.stop, { x: PX + 80, y: 640, zoom: 1.4 }], [k.window, { x: PX + 60, y: 630, zoom: 1.5 }]]), frame, "plat", 3);
  const brows = ramp(frame, k.platform + 20, k.platform + 40);
  const face = { brows: brows > 0.5 ? "angry" as const : "flat" as const, lids: mix(0.15, 0.4, brows), mouth: "flat" as const, eyes: 1, look: { x: 0.6, y: 0.5 } };
  const actors = (
    <Figure {...HERO} {...hero} {...face} blink={blinking(frame, 1)} time={frame} flow={train !== null && train > 50 ? 0.6 : 0.1}
      held={<Copies tilt={-4} />} />
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<MetroBack cam={cam} view="platform" frame={frame} train={train} />} actors={actors} />;
};

/** The train's window (at rest, the one at x 680..860) with your face in the dark glass: the copies, brows down. */
const WIN = { x: 680, y: 420, w: 180, h: 150 };

const WindowShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.window, { x: WIN.x + 90, y: WIN.y + 76, zoom: 5.4 }], [k.end, { x: WIN.x + 90, y: WIN.y + 78, zoom: 5.8 }]]), frame, "win", 1);
  const s = 0.62;
  const rx = WIN.x + 96, ry = WIN.y + 78 + 264 * s;
  const body: Body = { x: rx, y: ry, scale: s, facing: -1, pose: STAND };
  body.pose = { ...STAND, armF: aimArm(body, { x: rx - 20, y: ry - 200 * s }) };
  const actors = (
    <g>
      <clipPath id="clerk-win"><rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={18} /></clipPath>
      <g clipPath="url(#clerk-win)">
        <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} fill="#3a3f55" />
        <rect x={WIN.x + 110} y={WIN.y + 20} width={14} height={WIN.h} fill="#ffe9b0" opacity={0.25} />
        <g opacity={0.55}>
          <Figure {...HERO} {...body} brows="angry" lids={0.45} mouth="flat" look={{ x: 0.4, y: 0.4 }} time={frame} held={<Copies tilt={6} />} />
        </g>
        <path d={`M${WIN.x + 20} ${WIN.y + WIN.h} L${WIN.x + 90} ${WIN.y}`} stroke="#fff" strokeWidth={14} opacity={0.12} />
      </g>
      <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={18} fill="none" stroke={INK} strokeWidth={6} />
    </g>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<MetroBack cam={cam} view="platform" frame={frame} train={0} />} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ the beat

const ClerkBeat: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const scene = current(frame, [[0, "street"], [k.inside, "inside"], [k.wall, "wall"], [k.gate, "gate"], [k.platform, "platform"], [k.window, "window"]]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene === "street" && <StreetShot frame={frame} k={k} />}
      {scene === "inside" && <InsideShot frame={frame} k={k} />}
      {scene === "wall" && <WallShot frame={frame} k={k} />}
      {scene === "gate" && <GateShot frame={frame} k={k} />}
      {scene === "platform" && <PlatformShot frame={frame} k={k} />}
      {scene === "window" && <WindowShot frame={frame} k={k} />}
      <Sfx at={k.snap} name="snap" />
    </AbsoluteFill>
  );
};

export const clerk: Beat = { id: "clerk", firstLine: 37, Component: ClerkBeat };
