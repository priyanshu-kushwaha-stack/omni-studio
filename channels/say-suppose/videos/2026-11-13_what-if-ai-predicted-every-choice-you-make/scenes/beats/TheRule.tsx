// Beat "The Rule" (script.md, ## [00:48] The Rule; narration lines 8-14). The walk home at night along a covered
// walkway (sets/CoveredWalkway): a lamppost every twenty paces, each with a teal lamp and a rate board; your tags hang
// from the lamp you're under and hand over to the next with a flap; your best friend humming beside you.
//
//   8    "Over every head, a tag.": the walkway wide, walking; "What you'll do in the next ten seconds": insert, your card,
//        the forecast line and its split-flap digits; "how sure the city is": the two of you walking; "every lamppost":
//        the camera tilts up a post to its lamp
//   9    "everything gets cheaper": walking; "Your coffee. Your fare. Your rent.": three inserts, three lamppost boards
//        flapping down; "It knows you.": you walking, content
//   10   "Break it": insert, your card crimson for a few frames, a buzz, back to teal; "your prices climb": a YOUR RATE board
//        flaps up one notch and back; "One more thing.": the two of you under the lamps; "Remember that.": your face, half lit
//   11   HUMS 99% over him; "He stops.": he stops mid-note and watches it, STOPS 88%, tick; "It saw that too.": he glares
//   12   "It likes me." (his own voice): humming again, louder, arms out, walking backwards; HUMS 99%, tick
//   13   beyond the walkway the gantry over the main road, a price lit on it, cars under it, the price stepping up with
//        the hour; "by time of day since 1998": a paper sheet, a clock and a day's price curve drawing itself, 1998
//   14   your lamppost at the corner: YOUR RATE 100, a crimson arrow up and a teal arrow down beside it
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { setLook } from "@whatif/kit/sets/common";
import type { Clip as LineClip } from "@whatif/kit/timeline";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, PAPER, TEAL } from "@whatif/kit/theme";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { BoardSounds, Tag, TagSounds, type BoardKey, type TagKey } from "../device";
import { headAt, lineAt, Sheet } from "../kit";
import { blinking, camAt, current, FRIEND, HERO, mix, ramp, type Beat, type Shot } from "../shared";
import { boardAt, lampAt, lampX, Lampposts, nearestLamp, WALKWAY, WalkwayBack, walkwayLights } from "../sets/CoveredWalkway";

type Face = Partial<{ brows: "none" | "raised" | "worry" | "sad" | "angry" | "flat"; lids: number; mouth: "none" | "smile" | "smirk" | "o" | "flat" | "open" | "frown"; eyes: number; look: { x: number; y: number } }>;

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;
const SPEED = 3.6;
const START_X = 200;
const BESIDE = 310;
const CORNER = 6;

function times(clips: LineClip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  return {
    walk: from(8), // "Over every head, a tag."
    card: at(8, 0.24), // "What you'll do in the next ten seconds"
    sure: at(8, 0.53), // "and how sure the city is."
    post: at(8, 0.76), // "It watches from every lamppost."
    cheaper: from(9), // "Do what it says, and everything gets cheaper."
    coffee: at(9, 0.3), // "Your coffee."
    fare: at(9, 0.41), // "Your fare."
    rent: at(9, 0.51), // "Your rent."
    knows: at(9, 0.6), // "It knows you. Ninety-nine times in a hundred, it knows you."
    breakIt: from(10), // "Break it, and your tag goes crimson"
    crimson: at(10, 0.14),
    climb: at(10, 0.3), // "and your prices climb."
    climbUp: at(10, 0.34),
    climbBack: at(10, 0.43),
    more: at(10, 0.46), // "One more thing. It knows every choice you've ever made. ..."
    remember: at(10, 0.92), // "Remember that."
    hums: from(11), // "He hums all the way home."
    stops: at(11, 0.47), // "He stops."
    glare: at(11, 0.7), // "It saw that too."
    likes: from(12), // "It likes me."
    likesEnd: clips[12].from + clips[12].frames,
    gantry: from(13), // "Nobody here finds a price on a choice strange."
    billed: at(13, 0.36), // "This city has billed drivers ..."
    price1: at(13, 0.5),
    price2: at(13, 0.64),
    sheet: at(13, 0.7), // "by time of day since 1998."
    since: at(13, 0.83),
    corner: from(14), // "Tomorrow you'll find out which way yours moves."
    end: to,
  };
}

/** Where you are on the walk at a frame (you walk until the gantry; at the corner you stand). */
const youX = (frame: number, k: T) => START_X + SPEED * (Math.min(frame, k.gantry) - k.walk);
/** The frame you pass under lamppost i. */
const crossing = (i: number, k: T, ahead = 0) => k.walk + Math.round((lampX(i) - START_X - ahead) / SPEED);

// ------------------------------------------------------------------------------------------------ the tags

function tagKeys(k: T) {
  const posts = Array.from({ length: CORNER }, (_, i) => i + 1);
  const you: TagKey[] = [{ at: -1e4, text: "WALKS HOME", pct: 98, state: "tick" }];
  for (const i of posts) {
    const f = crossing(i, k);
    if (f > k.walk && f < k.gantry) you.push({ at: f, text: "WALKS HOME", pct: 98, state: "tick" });
  }
  you.push({ at: k.crimson, text: "WALKS HOME", pct: 98, state: "crimson" }, { at: k.crimson + 6, text: "WALKS HOME", pct: 98, state: "tick" });
  you.sort((a, b) => a.at - b.at);
  const friend: TagKey[] = [{ at: -1e4, text: "WALKS HOME", pct: 97, state: "tick" }];
  for (const i of posts) {
    const f = crossing(i, k, BESIDE);
    if (f > k.walk && f < k.hums - 20) friend.push({ at: f, text: "WALKS HOME", pct: 97, state: "tick" });
  }
  friend.push(
    { at: k.hums + 2, text: "HUMS", pct: 99, state: "new" }, { at: k.hums + 20, text: "HUMS", pct: 99, state: "tick" },
    { at: k.stops + 4, text: "STOPS", pct: 88, state: "new" }, { at: k.stops + 20, text: "STOPS", pct: 88, state: "tick" },
    { at: k.likesEnd - 4, text: "HUMS", pct: 99, state: "new" }, { at: k.likesEnd + 12, text: "HUMS", pct: 99, state: "tick" },
  );
  return { you, friend };
}

function boardKeys(k: T): { boards: Record<number, BoardKey[]>; labels: Record<number, string> } {
  return {
    boards: {
      2: [{ at: -1e4, value: "3.00" }, { at: k.coffee + 6, value: "1.50" }],
      3: [{ at: -1e4, value: "100" }, { at: k.climbUp, value: "101" }, { at: k.climbBack, value: "100" }],
      4: [{ at: -1e4, value: "2.10" }, { at: k.fare + 6, value: "1.05" }],
      5: [{ at: -1e4, value: "1800" }, { at: k.rent + 6, value: "900" }],
      [CORNER]: [{ at: -1e4, value: "100" }],
    },
    labels: { 3: "YOUR RATE", [CORNER]: "YOUR RATE" },
  };
}

const gantryKeys = (k: T): BoardKey[] => [{ at: -1e4, value: "2.00" }, { at: k.price1, value: "3.00" }, { at: k.price2, value: "4.00" }];

// ------------------------------------------------------------------------------------------------ the walk

const S = WALKWAY.scale;
const TAG_SCALE = 0.6;

/** A small paper music note floating up from a hummer's mouth. */
const Note: React.FC<{ x: number; y: number; s: number; o: number }> = ({ x, y, s, o }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={0} rx={11} ry={8} fill={PAPER} stroke={INK} strokeWidth={3} transform="rotate(-20)" />
    <line x1={9} y1={-2} x2={9} y2={-42} stroke={PAPER} strokeWidth={5} />
    <path d="M9 -42 q16 6 14 22" fill="none" stroke={PAPER} strokeWidth={5} strokeLinecap="round" />
  </g>
);

const Notes: React.FC<{ frame: number; mouth: { x: number; y: number }; dir: 1 | -1; from: number; to: number; size: number }> = ({ frame, mouth, dir, from, to, size }) => (
  <g>
    {Array.from({ length: 6 }, (_, i) => {
      const born = Math.floor((frame - from) / 14) * 14 + from - i * 14;
      if (born < from || born >= to) return null;
      const age = (frame - born) / 60;
      if (age < 0 || age > 1) return null;
      return <Note key={born} x={mouth.x + dir * (30 + age * 120)} y={mouth.y - 20 - age * 170 + Math.sin(age * 9) * 10} s={size * (0.7 + age * 0.4)} o={1 - age} />;
    })}
  </g>
);

/** A card hanging from the lamp you're under: the thread from the lamp to the card, then the card. */
const HungTag: React.FC<{ frame: number; x: number; h: { x: number; y: number; r: number }; keys: TagKey[] }> = ({ frame, x, h, keys }) => {
  const hh = h.r * 0.95 * TAG_SCALE;
  const top = h.y - h.r - hh * 2.1;
  const lamp = lampAt(nearestLamp(x));
  return (
    <g>
      <line x1={lamp.x} y1={lamp.y + 12} x2={h.x} y2={top} stroke={PAPER} strokeWidth={3} opacity={0.6} />
      <Tag frame={frame} x={h.x} headY={h.y} r={h.r} keys={keys} scale={TAG_SCALE} threadTop={top} />
    </g>
  );
};

interface WalkProps {
  frame: number; k: T; cam: Camera; tags: ReturnType<typeof tagKeys>; youFace: Face; friendFace: Face;
  halfLit?: boolean; backwards?: boolean; standing?: boolean; extra?: React.ReactNode; empty?: boolean;
}

/** The two of you on the walkway at a frame: you walking right, him beside you (or ahead of you walking backwards,
 *  arms out), humming, your cards hung from the lamps. */
const WalkShot: React.FC<WalkProps> = ({ frame, k, cam, tags, youFace, friendFace, halfLit, backwards, standing, extra, empty }) => {
  const x = standing ? lampX(CORNER) - 175 : youX(frame, k);
  const fx = standing ? x + 340 : x + (backwards ? 420 : BESIDE);
  const phase = frame * 0.22;
  const yPose: Pose = standing ? { ...STAND, tilt: -12 } : walkPose(phase);
  const out = backwards ? ramp(frame, k.likes, k.likes + 10) : 0;
  const fWalk = standing ? STAND : walkPose(phase + 1.3);
  const fPose: Pose = { ...fWalk, armF: out > 0 ? [mix(fWalk.armF[0], 100, out), mix(fWalk.armF[1], 0, out)] : fWalk.armF, armB: out > 0 ? [mix(fWalk.armB[0], -100, out), mix(fWalk.armB[1], 0, out)] : fWalk.armB, tilt: standing ? -12 : 0 };
  const fFacing: 1 | -1 = backwards ? -1 : 1;
  const yh = headAt(x, WALKWAY.floor, S, yPose, 1);
  const fh = headAt(fx, WALKWAY.floor, S, fPose, fFacing);
  const humming = (frame >= k.walk && frame < k.stops + 4) || frame >= k.likesEnd - 6;
  const loud = frame >= k.likes;
  const { boards, labels } = boardKeys(k);
  const actors = empty ? <Lampposts frame={frame} boards={boards} labels={labels} /> : (
    <>
      <Lampposts frame={frame} boards={boards} labels={labels} />
      <Figure x={fx} y={WALKWAY.floor} scale={S} facing={fFacing} pose={fPose} head={FRIEND.head} coat="#2a2d36" {...friendFace}
        mouth={friendFace.mouth ?? (humming ? "smile" : "flat")} blink={blinking(frame, 3)} time={frame} />
      <Figure x={x} y={WALKWAY.floor} scale={S} facing={1} pose={yPose} {...HERO} coat="#2a2d36" {...youFace} blink={blinking(frame, 0)} time={frame} flow={standing ? 0 : 0.25} />
      {halfLit && <path d={`M${yh.x} ${yh.y - yh.r} A${yh.r} ${yh.r} 0 0 0 ${yh.x} ${yh.y + yh.r} Z`} fill="#0a0c18" opacity={0.5} />}
      {humming && <Notes frame={frame} mouth={{ x: fh.x + fFacing * fh.r * 0.6, y: fh.y + fh.r * 0.2 }} dir={fFacing} from={frame >= k.likesEnd - 6 ? k.likesEnd - 6 : k.walk} to={frame >= k.likesEnd - 6 ? k.end : k.stops + 4} size={loud ? 1.5 : 1} />}
      <HungTag frame={frame} x={x} h={yh} keys={tags.you} />
      <HungTag frame={frame} x={fx} h={fh} keys={tags.friend} />
      {extra}
    </>
  );
  return (
    <LookContext.Provider value={setLook(walkwayLights, "night", cam, empty ? { focus: WALKWAY.gantry.depth, dof: 3 } : {})}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<WalkwayBack cam={cam} frame={frame} gantry={gantryKeys(k)} />} actors={actors} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ the shots

/** The card's centre over a walker's head. */
function cardOf(x: number) {
  const h = headAt(x, WALKWAY.floor, S, STAND, 1);
  const hh = h.r * 0.95 * TAG_SCALE;
  return { x: h.x, y: h.y - h.r - hh * 2.1 + hh * 0.9 };
}

const content: Face = { brows: "none", lids: 0.1, mouth: "smile", eyes: 1, look: { x: 0.9, y: 0 } };
const friendHum: Face = { brows: "raised", lids: 0.35, eyes: 1, look: { x: 0.9, y: -0.1 } };

/** Lines 8-10: the rule, walking. */
const RuleShots: React.FC<{ frame: number; k: T; tags: ReturnType<typeof tagKeys> }> = ({ frame, k, tags }) => {
  const on = current(frame, [[k.walk, "wide"], [k.card, "card"], [k.sure, "two"], [k.post, "post"], [k.cheaper, "wide2"], [k.coffee, "b2"],
    [k.fare, "b4"], [k.rent, "b5"], [k.knows, "you"], [k.breakIt, "crimson"], [k.climb, "b3"], [k.more, "two2"], [k.remember, "remember"]]);
  const x = youX(frame, k);
  const track = (z: number, dy = 0, dx = 130): Camera => ({ x: x + dx, y: 540 + dy, zoom: z });
  let cam: Camera;
  let youFace: Face = content;
  let halfLit = false;
  const boardCam = (i: number, a: number, b: number) => camAt(frame, [[a, insert(boardAt(i).x, boardAt(i).y + 45, 3.2)], [b, insert(boardAt(i).x, boardAt(i).y + 45, 3.45)]]);
  switch (on) {
    case "wide": cam = track(1.0, 0); break;
    case "card": { const c = cardOf(x); cam = insert(c.x + 40, c.y + 60, 2.4); break; }
    case "two": cam = track(1.55, 20); youFace = { ...content, look: { x: 0.9, y: -0.3 } }; break;
    case "post": {
      const p = lampX(nearestLamp(x + 500));
      cam = camAt(frame, [[k.post, { x: p + 20, y: 860, zoom: 2.2 }], [k.post + 14, { x: p + 20, y: 860, zoom: 2.2 }], [k.cheaper - 4, { x: p + 50, y: 300, zoom: 2.2 }]]);
      break;
    }
    case "wide2": cam = track(1.1, 10, 200); break;
    case "b2": cam = boardCam(2, k.coffee, k.fare); break;
    case "b4": cam = boardCam(4, k.fare, k.rent); break;
    case "b5": cam = boardCam(5, k.rent, k.knows); break;
    case "you": { const h = headAt(x, WALKWAY.floor, S, STAND, 1); cam = camAt(frame, [[k.knows, closeUp(h.x + 120, h.y - 40, 1.9)], [k.breakIt, closeUp(h.x + 120, h.y - 50, 2.0)]]); youFace = { ...content, mouth: frame > k.knows + 40 ? "smirk" : "smile" }; break; }
    case "crimson": {
      const c = cardOf(x);
      cam = insert(c.x + 40, c.y + 70, 2.4);
      youFace = frame >= k.crimson && frame < k.crimson + 14 ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.2, y: -1 } } : { ...content, look: { x: 0.2, y: -1 } };
      break;
    }
    case "b3": cam = boardCam(3, k.climb, k.more); break;
    case "two2": cam = track(1.3, 10, 130); youFace = { brows: "flat", lids: 0.25, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0.1 } }; break;
    default: { const h = headAt(x, WALKWAY.floor, S, STAND, 1); cam = camAt(frame, [[k.remember, closeUp(h.x + 30, h.y, 2.6)], [k.hums, closeUp(h.x + 30, h.y, 2.75)]]); youFace = { brows: "flat", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.3, y: -0.8 } }; halfLit = true; }
  }
  return <WalkShot frame={frame} k={k} cam={drift(cam, frame, `rule-${on}`, 2)} tags={tags} youFace={youFace} friendFace={friendHum} halfLit={halfLit} />;
};

/** Lines 11-12: HUMS 99%; he stops and watches it; STOPS 88%; the glare; "It likes me.", arms out, backwards. */
const HumShots: React.FC<{ frame: number; k: T; tags: ReturnType<typeof tagKeys> }> = ({ frame, k, tags }) => {
  const on = current(frame, [[k.hums, "hums"], [k.stops, "stops"], [k.glare, "glare"], [k.likes, "likes"]]);
  const x = youX(frame, k);
  const fx = x + BESIDE;
  const fh = headAt(fx, WALKWAY.floor, S, STAND, 1);
  let cam: Camera;
  let friendFace: Face;
  if (on === "hums") {
    cam = camAt(frame, [[k.hums, { x: fx - 40, y: 430, zoom: 1.75 }], [k.stops, { x: fx - 30, y: 420, zoom: 1.85 }]]);
    friendFace = frame >= k.hums + 6 ? { brows: "raised", lids: 0.2, eyes: 1.05, look: { x: 0.2, y: -1 } } : friendHum;
  } else if (on === "stops") {
    cam = camAt(frame, [[k.stops, { x: fh.x, y: fh.y - 150, zoom: 2.2 }], [k.glare, { x: fh.x, y: fh.y - 150, zoom: 2.35 }]]);
    friendFace = { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.15, y: -1 } };
  } else if (on === "glare") {
    cam = camAt(frame, [[k.glare, closeUp(fh.x, fh.y - 70, 2.6)], [k.likes, closeUp(fh.x, fh.y - 70, 2.75)]]);
    friendFace = { brows: "angry", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 0.2, y: -1 } };
  } else {
    cam = camAt(frame, [[k.likes, { x: x + 200, y: 520, zoom: 1.35 }], [k.gantry, { x: x + 200, y: 520, zoom: 1.25 }]]);
    const talking = frame < k.likesEnd && Math.floor((frame - k.likes) / 5) % 2 === 0;
    friendFace = { brows: "raised", lids: frame < k.likesEnd ? 0 : 0.35, mouth: talking ? "open" : "smile", eyes: 1.05, look: { x: 0.6, y: -0.6 } };
  }
  const youFace: Face = on === "likes" ? { brows: "raised", lids: 0.1, mouth: "smile", eyes: 1, look: { x: 1, y: 0 } } : { ...content, look: { x: 1, y: -0.2 } };
  return <WalkShot frame={frame} k={k} cam={drift(cam, frame, `hum-${on}`, 2)} tags={tags} youFace={youFace} friendFace={friendFace} backwards={on === "likes"} />;
};

/** Stamped split-flap digits on the paper, the narrator's number. */
const Stamp: React.FC<{ x: number; y: number; text: string; size: number; color: string }> = ({ x, y, text, size, color }) => (
  <g transform={`translate(${x} ${y})`}>
    {text.split("").map((ch, i, all) => (
      <g key={i} transform={`translate(${(i - (all.length - 1) / 2) * size * 0.66} 0)`}>
        <rect x={-size * 0.3} y={-size * 0.44} width={size * 0.6} height={size * 0.88} rx={size * 0.08} fill={color} stroke={INK} strokeWidth={4} />
        <text x={0} y={size * 0.27} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size * 0.68} fill={PAPER}>{ch}</text>
      </g>
    ))}
  </g>
);

/** Line 13: the gantry over the main road, the price stepping up; then the paper: a clock, a day's price, 1998. */
const GantryShots: React.FC<{ frame: number; k: T; tags: ReturnType<typeof tagKeys> }> = ({ frame, k, tags }) => {
  if (frame >= k.sheet) {
    const cam = drift(camAt(frame, [[k.sheet, { x: 960, y: 540, zoom: 1.0 }], [k.corner, { x: 960, y: 540, zoom: 1.05 }]]), frame, "sheet", 2);
    const hand = ((frame - k.sheet) / 40) * 360;
    const curve = "M40 330 L120 326 C160 322 170 120 215 120 C260 120 268 318 310 318 L350 318 C390 318 398 100 445 100 C490 100 500 330 540 330";
    const sheet = (
      <Sheet frame={frame} at={k.sheet} x={960} y={520} w={1100} h={620} tilt={-1.5}>
        <circle cx={250} cy={310} r={170} fill="none" stroke={INK} strokeWidth={10} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={250 + Math.sin(a) * 140} y1={310 - Math.cos(a) * 140} x2={250 + Math.sin(a) * 160} y2={310 - Math.cos(a) * 160} stroke={INK} strokeWidth={8} />;
        })}
        <line x1={250} y1={310} x2={250 + Math.sin((hand * Math.PI) / 180) * 120} y2={310 - Math.cos((hand * Math.PI) / 180) * 120} stroke={CRIMSON} strokeWidth={12} strokeLinecap="round" />
        <circle cx={250} cy={310} r={14} fill={INK} />
        <g transform="translate(500 80)">
          <line x1={20} y1={360} x2={560} y2={360} stroke={INK} strokeWidth={8} />
          <line x1={20} y1={360} x2={20} y2={60} stroke={INK} strokeWidth={8} />
          <DrawLine d={curve} from={k.sheet + 8} to={k.since} color={TEAL} width={16} />
        </g>
        {frame >= k.since && <Stamp x={840} y={545} text="1998" size={110} color={CRIMSON} />}
      </Sheet>
    );
    return (
      <LookContext.Provider value={setLook([], "night", cam)}>
        <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<rect x={-1400} y={-900} width={4800} height={2600} fill="#1a1d2c" />} actors={sheet} />
      </LookContext.Provider>
    );
  }
  // the gantry is on a depth 0.45 layer: these cameras put it in frame
  const g = WALKWAY.gantry;
  const camFor = (lx: number, ly: number, zoom: number): Camera => ({ x: (lx - 960 * (1 - g.depth)) / g.depth, y: (ly - 540 * (1 - g.depth)) / g.depth, zoom });
  const cam = frame < k.billed
    ? drift(camAt(frame, [[k.gantry, camFor(g.x, g.y + 40, 1.5)], [k.billed, camFor(g.x, g.y + 40, 1.62)]]), frame, "gantry", 2)
    : drift(camAt(frame, [[k.billed, camFor(g.x + 20, g.y + 50, 2.6)], [k.sheet, camFor(g.x + 20, g.y + 50, 2.8)]]), frame, "gantry2", 1.5);
  return <WalkShot frame={frame} k={k} cam={cam} tags={tags} youFace={content} friendFace={friendHum} empty />;
};

/** Line 14: your lamppost at the corner, YOUR RATE 100, the two arrows; you both look up. */
const CornerShot: React.FC<{ frame: number; k: T; tags: ReturnType<typeof tagKeys> }> = ({ frame, k, tags }) => {
  const b = boardAt(CORNER);
  const cam = drift(camAt(frame, [[k.corner, { x: b.x + 40, y: 560, zoom: 1.45 }], [k.corner + 20, { x: b.x + 40, y: 560, zoom: 1.45 }], [k.end, { x: b.x + 60, y: 480, zoom: 2.0 }]]), frame, "corner", 2);
  const arrows = (
    <g>
      <path d={`M${b.x - 34} ${b.y - 62} l22 -30 l22 30z`} fill={CRIMSON} stroke={INK} strokeWidth={4} />
      <path d={`M${b.x + 12} ${b.y - 92} l22 30 l22 -30z`} fill={TEAL} stroke={INK} strokeWidth={4} />
    </g>
  );
  return (
    <WalkShot frame={frame} k={k} cam={cam} tags={tags} standing extra={arrows}
      youFace={{ brows: "flat", lids: 0.15, mouth: "flat", eyes: 1, look: { x: 0.6, y: -0.9 } }}
      friendFace={{ brows: "raised", lids: 0.2, mouth: "smile", eyes: 1, look: { x: -0.4, y: -0.9 } }} />
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const tags = tagKeys(k);
  const { boards } = boardKeys(k);
  const part = current(frame, [[0, "rule"], [k.hums, "hum"], [k.gantry, "gantry"], [k.corner, "corner"]]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {part === "rule" && <RuleShots frame={frame} k={k} tags={tags} />}
      {part === "hum" && <HumShots frame={frame} k={k} tags={tags} />}
      {part === "gantry" && <GantryShots frame={frame} k={k} tags={tags} />}
      {part === "corner" && <CornerShot frame={frame} k={k} tags={tags} />}
      <TagSounds keys={tags.you} volume={0.7} />
      <TagSounds keys={tags.friend} volume={0.7} />
      {Object.values(boards).map((keys, i) => <BoardSounds key={i} keys={keys} volume={0.5} />)}
      <BoardSounds keys={gantryKeys(k)} volume={0.4} />
    </AbsoluteFill>
  );
};

export const theRule: Beat = { id: "theRule", firstLine: 8, Component: Scene };
