// Beat "The Rule" (script.md v2, ## [00:45] The Rule; narration lines 7-15). The walk home at night along a covered
// walkway (sets/CoveredWalkway): a lamppost every twenty paces, each with a teal lamp and a rate board; your cards hang
// from the lamp you're under and hand over to the next with a flap; your best friend humming beside you (HUMS 99%).
//
//   7    "Over every head, a tag.": the walkway wide, walking; "What you'll do in the next ten seconds": insert, your card,
//        POCKETS KEY 91%, its split-flap digits; "how sure the city is": the two of you; "every lamppost": a tilt up a post
//   8    "everything gets cheaper": walking; "Your coffee. Your fare. Your rent.": three lamppost boards flapping down;
//        "It knows you.": your face, content
//   9    "Break it": insert, your card crimson for a few frames, a buzz, back to teal; "your prices climb": a YOUR RATE
//        board flaps up one notch and back; "One more thing.": the two of you under the lamps; "Remember that.": your face,
//        half lit
//   hold he jumps, grabs his card and rips it off its thread (a paper tear) and holds it up, triumphant; the next lamp
//        drops a fresh one over him before he lands: TEARS OFF TAG 99%; he reads it, looks at the torn one in his hand,
//        reads the new one again (the double take), lets the torn one drop; you're laughing
//   10   "Oh, come on." (his own voice), deadpan, close
//   11   "Tear it off": insert, the torn card on the walkway, your feet walking away; "the next lamp prints another": the
//        next lamp, his card handed over with a flap; "It saw that coming too.": his face, a sheepish look up
//   12   HUMS 99% over him; "He stops.": he stops mid-note, STOPS 88%, tick; "It saw that too.": he glares at it
//   13   "It likes me." (his own voice): humming again, louder, arms out, walking backwards; HUMS 99%, tick
//   14   the gantry over the main road, a price lit on it, cars under it, the price stepping up with the hour; "by time of
//        day since 1998": a paper sheet, a clock and a day's price curve drawing itself, 1998
//   15   your lamppost at the corner: YOUR RATE 100, a crimson arrow up and a teal arrow down beside it
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { setLook } from "@whatif/kit/sets/common";
import type { Clip as LineClip } from "@whatif/kit/timeline";
import { CRIMSON, INK, TEAL } from "@whatif/kit/theme";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { BoardSounds, TagSounds, type BoardKey, type TagKey } from "../device";
import { aimArm, handAt, headAt, lineAt, Sheet } from "../kit";
import { blinking, camAt, current, FRIEND, HERO, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { boardAt, lampAt, lampX, Lampposts, nearestLamp, WALKWAY, WalkwayBack, walkwayLights } from "../sets/CoveredWalkway";
import { HungTag, Notes, Stamp, TAG_SCALE, TornCard, type Face } from "./TheRule.Parts";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;
const SPEED = 3.6;
const START_X = 200;
const BESIDE = 310;
const CORNER = 6;

function times(clips: LineClip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  const e9 = lineEnd(clips, 9);
  const G = from(10) - e9; // the tear and the 3 s hold
  const h = (p: number) => e9 + Math.round(G * p);
  return {
    walk: from(7), // "Over every head, a tag."
    card: at(7, 0.24), // "What you'll do in the next ten seconds"
    sure: at(7, 0.53), // "and how sure the city is."
    post: at(7, 0.76), // "It watches from every lamppost."
    cheaper: from(8), // "Do what it says, and everything gets cheaper."
    coffee: at(8, 0.3), // "Your coffee."
    fare: at(8, 0.41), // "Your fare."
    rent: at(8, 0.51), // "Your rent."
    knows: at(8, 0.6), // "It knows you. Ninety-nine times in a hundred, it knows you."
    breakIt: from(9), // "Break it,"
    crimson: at(9, 0.04),
    climb: at(9, 0.12), // "and your prices climb."
    climbUp: at(9, 0.15),
    climbBack: at(9, 0.23),
    more: at(9, 0.27), // "One more thing. It knows every choice you've ever made. ..."
    remember: at(9, 0.9), // "Remember that."
    stop: e9, // you both stop walking
    jump: h(0.05), // he jumps
    tear: h(0.13), // grabs his card at the top of the jump and rips it off (a paper tear)
    fresh: h(0.19), // the next lamp drops a fresh one: TEARS OFF TAG 99%
    land: h(0.25),
    readNew: h(0.33), // he reads the new card
    lookTorn: h(0.48), // looks at the torn one in his hand
    readAgain: h(0.63), // looks at the new one again
    dropTorn: h(0.8), // lets the torn one drop
    come: from(10), // "Oh, come on."
    comeEnd: lineEnd(clips, 10),
    tearLine: from(11), // "Tear it off,"
    nextLamp: at(11, 0.3), // "and the next lamp prints another."
    sawIt: at(11, 0.66), // "It saw that coming too."
    hums: from(12), // "He hums all the way home."
    stops: at(12, 0.47), // "He stops."
    glare: at(12, 0.7), // "It saw that too."
    likes: from(13), // "It likes me."
    likesEnd: lineEnd(clips, 13),
    gantry: from(14), // "Nobody here finds a price on a choice strange."
    billed: at(14, 0.36), // "This city has billed drivers ..."
    price1: at(14, 0.5),
    price2: at(14, 0.64),
    sheet: at(14, 0.7), // "by time of day since 1998."
    since: at(14, 0.83),
    corner: from(15), // "Tomorrow you'll find out which way yours moves."
    end: to,
  };
}

/** Where you are on the walk at a frame: walking until the tear, standing through it and "Oh, come on.", walking again
 *  until the gantry; at the corner you stand. */
const youX = (frame: number, k: T) =>
  START_X + SPEED * (Math.max(0, Math.min(frame, k.stop) - k.walk) + Math.max(0, Math.min(frame, k.gantry) - k.comeEnd));

/** The first frame a walker `ahead` of you passes under lamppost i (or null). */
function crossing(i: number, k: T, ahead = 0): number | null {
  for (let f = k.walk; f < k.gantry; f += 1) if (youX(f, k) + ahead >= lampX(i)) return f > k.walk ? f : null;
  return null;
}

// ------------------------------------------------------------------------------------------------ the tags

const handOvers = (k: T, ahead: number, a: number, b: number) =>
  Array.from({ length: CORNER }, (_, i) => crossing(i + 1, k, ahead)).filter((f): f is number => f !== null && f > a && f < b);

function tagKeys(k: T) {
  const you: TagKey[] = [{ at: -1e4, text: "POCKETS KEY", pct: 91, state: "tick" }];
  for (const f of handOvers(k, 0, k.walk, k.gantry)) you.push({ at: f, text: "POCKETS KEY", pct: 91, state: "tick" });
  you.push({ at: k.crimson, text: "POCKETS KEY", pct: 91, state: "crimson" }, { at: k.crimson + 7, text: "POCKETS KEY", pct: 91, state: "tick" });
  you.sort((a, b) => a.at - b.at);
  // his first card, HUMS 99%, until he tears it off
  const hums: TagKey[] = [{ at: -1e4, text: "HUMS", pct: 99, state: "tick" }];
  for (const f of handOvers(k, BESIDE, k.walk, k.tear)) hums.push({ at: f, text: "HUMS", pct: 99, state: "tick" });
  // the fresh one, then the humming game
  const fresh: TagKey[] = [{ at: k.fresh, text: "TEARS OFF TAG", pct: 99, state: "new" }, { at: k.fresh + 18, text: "TEARS OFF TAG", pct: 99, state: "tick" }];
  const handed = [...handOvers(k, BESIDE, k.comeEnd, k.hums), k.nextLamp + 4].sort((a, b) => a - b);
  for (const f of handed) fresh.push({ at: f, text: "TEARS OFF TAG", pct: 99, state: "tick" });
  fresh.push(
    { at: k.hums + 2, text: "HUMS", pct: 99, state: "new" }, { at: k.hums + 20, text: "HUMS", pct: 99, state: "tick" },
    { at: k.stops + 4, text: "STOPS", pct: 88, state: "new" }, { at: k.stops + 20, text: "STOPS", pct: 88, state: "tick" },
    { at: k.likesEnd - 4, text: "HUMS", pct: 99, state: "new" }, { at: k.likesEnd + 12, text: "HUMS", pct: 99, state: "tick" },
  );
  return { you, hums, fresh };
}
type Tags = ReturnType<typeof tagKeys>;

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

/** His jump: height above the floor at a frame (up to the tear, down by the landing). */
const jumpY = (frame: number, k: T) => (frame >= k.jump && frame < k.land ? Math.sin(((frame - k.jump) / (k.land - k.jump)) * Math.PI) * 120 : 0);

interface WalkProps {
  frame: number; k: T; cam: Camera; tags: Tags; youFace: Face; friendFace: Face;
  halfLit?: boolean; backwards?: boolean; standing?: boolean; extra?: React.ReactNode; empty?: boolean;
}

/** The two of you on the walkway at a frame: you walking right, him beside you (or ahead walking backwards, arms
 *  out), humming; your cards hung from the lamps; the tear and the torn card. */
const WalkShot: React.FC<WalkProps> = ({ frame, k, cam, tags, youFace, friendFace, halfLit, backwards, standing, extra, empty }) => {
  const x = standing ? lampX(CORNER) - 175 : youX(frame, k);
  const fx = standing ? x + 340 : x + (backwards ? 420 : BESIDE);
  const still = standing || (frame >= k.stop && frame < k.comeEnd);
  const phase = (still ? 0 : youX(frame, k) / SPEED) * 0.22;
  const yPose: Pose = still ? { ...STAND, tilt: standing ? -12 : 4 } : walkPose(phase);
  const out = backwards ? ramp(frame, k.likes, k.likes + 10) : 0;
  const fWalk = still ? STAND : walkPose(phase + 1.3);
  const lift = jumpY(frame, k);
  const fy = WALKWAY.floor - lift;
  // his front hand: up to the card in the jump, held high in triumph, down to read it, open to drop it
  const fb0 = { x: fx, y: fy, scale: S, pose: fWalk, facing: 1 as const };
  const h0 = headAt(fx, fy, S, fWalk, 1);
  const tearing = frame >= k.jump && frame < k.dropTorn + 8;
  let armF = fWalk.armF;
  if (tearing) {
    // the card hangs at standing height; the hand goes up past the far side of his head, never across his face
    const cardTop = { x: h0.x + h0.r * 1.15, y: h0.y + lift - h0.r * 1.7 };
    const high = { x: h0.x + h0.r * 1.6, y: h0.y - h0.r * 1.9 };
    const read = { x: fx + 110, y: h0.y + h0.r * 1.6 };
    const target = frame < k.tear ? cardTop : frame < k.readNew ? high : frame < k.lookTorn - 6 ? { x: fx + 70, y: h0.y - h0.r * 0.5 } : read;
    armF = aimArm(fb0, target);
  }
  const fPose: Pose = { ...fWalk, armF: out > 0 ? [mix(fWalk.armF[0], 100, out), mix(fWalk.armF[1], 0, out)] : armF,
    armB: out > 0 ? [mix(fWalk.armB[0], -100, out), mix(fWalk.armB[1], 0, out)] : fWalk.armB,
    tilt: standing ? -12 : frame >= k.readNew && frame < k.come ? (frame >= k.lookTorn && frame < k.readAgain ? 10 : -12) : 0 };
  const fFacing: 1 | -1 = backwards ? -1 : 1;
  const yh = headAt(x, WALKWAY.floor, S, yPose, 1);
  const fh = headAt(fx, fy, S, fPose, fFacing);
  const hand = handAt({ x: fx, y: fy, scale: S, pose: fPose, facing: fFacing }, "front");
  const humming = (frame >= k.walk && frame < k.jump) || (frame >= k.hums && frame < k.stops + 4) || frame >= k.likesEnd - 6;
  const loud = frame >= k.likes;
  const { boards, labels } = boardKeys(k);
  // the torn card: in his hand from the tear, falling at the drop, lying on the walkway after
  const fall = ramp(frame, k.dropTorn, k.dropTorn + 10);
  const dropX = youX(k.stop, k) + BESIDE + 160;
  let torn: React.ReactNode = null;
  if (frame >= k.tear && frame < k.dropTorn) torn = <TornCard x={hand.x + 6} y={hand.y - 26} size={h0.r * 0.75} tilt={frame < k.readNew ? -12 : 8} />;
  else if (frame >= k.dropTorn && frame < k.gantry) torn = <TornCard x={frame < k.dropTorn + 10 ? mix(hand.x, dropX, fall) : dropX} y={mix(hand.y - 26, WALKWAY.floor + 30, fall)} size={h0.r * 0.75} tilt={mix(8, 78, fall)} />;
  const actors = empty ? <Lampposts frame={frame} boards={boards} labels={labels} /> : (
    <>
      <Lampposts frame={frame} boards={boards} labels={labels} />
      {torn}
      <Figure x={fx} y={fy} scale={S} facing={fFacing} pose={fPose} head={FRIEND.head} coat="#2a2d36" {...friendFace}
        mouth={friendFace.mouth ?? (humming ? "smile" : "flat")} blink={blinking(frame, 3)} time={frame} />
      <Figure x={x} y={WALKWAY.floor} scale={S} facing={1} pose={yPose} {...HERO} coat="#2a2d36" {...youFace} blink={blinking(frame, 0)} time={frame} flow={still ? 0 : 0.25} />
      {halfLit && <path d={`M${yh.x} ${yh.y - yh.r} A${yh.r} ${yh.r} 0 0 0 ${yh.x} ${yh.y + yh.r} Z`} fill="#0a0c18" opacity={0.5} />}
      {humming && <Notes frame={frame} mouth={{ x: fh.x + fFacing * fh.r * 0.6, y: fh.y + fh.r * 0.2 }} dir={fFacing}
        from={frame >= k.likesEnd - 6 ? k.likesEnd - 6 : frame >= k.hums ? k.hums : k.walk} to={frame >= k.likesEnd - 6 ? k.end : frame >= k.hums ? k.stops + 4 : k.jump} size={loud ? 1.5 : 1} />}
      <HungTag frame={frame} x={x} h={yh} keys={tags.you} />
      <HungTag frame={frame} x={fx} h={{ ...fh, y: fh.y + lift }} keys={tags.hums} until={k.tear} />
      <HungTag frame={frame} x={fx} h={{ ...fh, y: fh.y + lift }} keys={tags.fresh} />
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

/** Lines 7-9: the rule, walking. */
const RuleShots: React.FC<{ frame: number; k: T; tags: Tags }> = ({ frame, k, tags }) => {
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
    default: { const h = headAt(x, WALKWAY.floor, S, STAND, 1); cam = camAt(frame, [[k.remember, closeUp(h.x + 30, h.y, 2.6)], [k.stop, closeUp(h.x + 30, h.y, 2.75)]]); youFace = { brows: "raised", lids: 0.3, mouth: "smirk", eyes: 1, look: { x: 0.3, y: -0.8 } }; halfLit = true; }
  }
  return <WalkShot frame={frame} k={k} cam={drift(cam, frame, `rule-${on}`, 2)} tags={tags} youFace={youFace} friendFace={friendHum} halfLit={halfLit} />;
};

/** The hold, line 10 and line 11: the tear, the fresh card, the double take, "Oh, come on.", the torn card left behind. */
const TearShots: React.FC<{ frame: number; k: T; tags: Tags }> = ({ frame, k, tags }) => {
  const on = current(frame, [[k.stop, "jump"], [k.readNew, "take"], [k.come, "come"], [k.tearLine, "floor"], [k.nextLamp, "lamp"], [k.sawIt, "saw"]]);
  const x = youX(frame, k);
  const fx = x + BESIDE;
  const fh = headAt(fx, WALKWAY.floor, S, STAND, 1);
  let cam: Camera;
  let friendFace: Face;
  let youFace: Face;
  if (on === "jump") {
    cam = camAt(frame, [[k.stop, { x: fx - 120, y: 470, zoom: 1.45 }], [k.readNew, { x: fx - 100, y: 450, zoom: 1.55 }]]);
    const up = frame >= k.jump;
    friendFace = frame >= k.tear ? { brows: "raised", lids: 0, mouth: "open", eyes: 1.15, look: { x: 0.4, y: 0.2 } }
      : up ? { brows: "angry", lids: 0.1, mouth: "smirk", eyes: 1.05, look: { x: 0.1, y: -1 } } : { ...friendHum, look: { x: 0.2, y: -1 } };
    youFace = frame >= k.tear ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.15, look: { x: 1, y: -0.3 } } : { ...content, look: { x: 1, y: -0.2 } };
  } else if (on === "take") {
    // the double take: up at the new card, down at the torn one, up again; then the drop
    const z = frame >= k.readAgain ? 2.25 : 2.0;
    const dy = frame >= k.lookTorn && frame < k.readAgain ? 60 : -60;
    cam = camAt(frame, [[k.readNew, { x: fh.x + 20, y: fh.y + dy, zoom: z }], [k.come, { x: fh.x + 20, y: fh.y + dy, zoom: z + 0.08 }]]);
    const lookUp = frame < k.lookTorn || frame >= k.readAgain;
    friendFace = frame >= k.readAgain
      ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.3, look: { x: 0.2, y: -1 } }
      : lookUp ? { brows: "raised", lids: 0, mouth: "flat", eyes: 1.1, look: { x: 0.2, y: -1 } }
      : { brows: "flat", lids: 0.15, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0.6 } };
    if (frame >= k.dropTorn) friendFace = { brows: "flat", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 0.2, y: -1 } };
    youFace = { brows: "raised", lids: 0.35, mouth: "open", eyes: 1, look: { x: 1, y: -0.3 } };
  } else if (on === "come") {
    cam = camAt(frame, [[k.come, closeUp(fh.x, fh.y - 120, 2.3)], [k.tearLine, closeUp(fh.x, fh.y - 120, 2.4)]]);
    const talking = frame < k.comeEnd && Math.floor((frame - k.come) / 5) % 2 === 0;
    friendFace = { brows: "flat", lids: 0.5, mouth: talking ? "open" : "flat", eyes: 1, look: { x: 0, y: 0.05 } };
    youFace = { brows: "raised", lids: 0.4, mouth: "open", eyes: 1, look: { x: 1, y: -0.2 } };
  } else if (on === "floor") {
    // the torn card on the walkway; your feet walk away from it
    const dropX = youX(k.stop, k) + BESIDE + 160;
    cam = camAt(frame, [[k.tearLine, insert(dropX, WALKWAY.floor - 40, 2.6)], [k.nextLamp, insert(dropX + 40, WALKWAY.floor - 50, 2.7)]]);
    friendFace = friendHum;
    youFace = content;
  } else if (on === "lamp") {
    const n = nearestLamp(fx + 300);
    const l = lampAt(n);
    cam = camAt(frame, [[k.nextLamp, { x: l.x - 80, y: l.y + 300, zoom: 1.5 }], [k.sawIt, { x: l.x + 40, y: l.y + 330, zoom: 1.6 }]]);
    friendFace = { brows: "raised", lids: 0.1, mouth: "flat", eyes: 1.05, look: { x: 0.3, y: -1 } };
    youFace = content;
  } else {
    cam = camAt(frame, [[k.sawIt, closeUp(fh.x - 80, fh.y - 100, 2.0)], [k.hums, closeUp(fh.x - 80, fh.y - 110, 2.1)]]);
    friendFace = { brows: "raised", lids: 0.25, mouth: "smirk", eyes: 1, look: { x: 0.2, y: -1 } };
    youFace = { brows: "raised", lids: 0.3, mouth: "smile", eyes: 1, look: { x: 1, y: -0.1 } };
  }
  return <WalkShot frame={frame} k={k} cam={drift(cam, frame, `tear-${on}`, 2)} tags={tags} youFace={youFace} friendFace={friendFace} />;
};

/** Lines 12-13: HUMS 99%; he stops and watches it; STOPS 88%; the glare; "It likes me.", arms out, backwards. */
const HumShots: React.FC<{ frame: number; k: T; tags: Tags }> = ({ frame, k, tags }) => {
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

/** Line 14: the gantry over the main road, the price stepping up; then the paper: a clock, a day's price, 1998. */
const GantryShots: React.FC<{ frame: number; k: T; tags: Tags }> = ({ frame, k, tags }) => {
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

/** Line 15: your lamppost at the corner, YOUR RATE 100, the two arrows; you both look up. */
const CornerShot: React.FC<{ frame: number; k: T; tags: Tags }> = ({ frame, k, tags }) => {
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
      youFace={{ brows: "raised", lids: 0.15, mouth: "smirk", eyes: 1, look: { x: 0.6, y: -0.9 } }}
      friendFace={{ brows: "raised", lids: 0.2, mouth: "smile", eyes: 1, look: { x: -0.4, y: -0.9 } }} />
  );
};

// ------------------------------------------------------------------------------------------------ the beat

/** The frame he rips his card off its thread (the paper tear's sound, which has no file yet). */
export const ruleTear = (clips: LineClip[], to: number) => times(clips, to).tear;

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const tags = tagKeys(k);
  const { boards } = boardKeys(k);
  const part = current(frame, [[0, "rule"], [k.stop, "tear"], [k.hums, "hum"], [k.gantry, "gantry"], [k.corner, "corner"]]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {part === "rule" && <RuleShots frame={frame} k={k} tags={tags} />}
      {part === "tear" && <TearShots frame={frame} k={k} tags={tags} />}
      {part === "hum" && <HumShots frame={frame} k={k} tags={tags} />}
      {part === "gantry" && <GantryShots frame={frame} k={k} tags={tags} />}
      {part === "corner" && <CornerShot frame={frame} k={k} tags={tags} />}
      <TagSounds keys={tags.you} volume={0.7} />
      <TagSounds keys={tags.hums} volume={0.7} />
      <TagSounds keys={tags.fresh} volume={0.8} />
      <Sequence from={k.tear} durationInFrames={30}><Audio src={staticFile("sfx/tear.wav")} volume={0.45} /></Sequence>
      {Object.values(boards).map((keys, i) => <BoardSounds key={i} keys={keys} volume={0.5} />)}
      <BoardSounds keys={gantryKeys(k)} volume={0.4} />
    </AbsoluteFill>
  );
};

export const theRule: Beat = { id: "theRule", firstLine: 7, Component: Scene };
