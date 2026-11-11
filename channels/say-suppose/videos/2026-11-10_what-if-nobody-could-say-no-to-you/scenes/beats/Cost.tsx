// Beat "The cost" (script.md, ## [08:30] The cost; narration lines 81-89). Same pattern as Change.tsx: `times()` from
// the clips, one component per shot, the beat picks by frame, the snaps outside the Stage. Slow, close and quiet: few
// cuts, slow pushes, the camera stays on her.
//
//   81    your mother's gate at dusk, wide: she lifts the tiffin stack and the pickle jar over the gate into your arms;
//         the two-shot ("a whole lunch without a question"); close on her: she noticed; she looks down, says nothing.
//   82    over your shoulder: "So quiet today."
//   83    close on you, the tiffin in your arms, searching her face as you searched the chai man's.
//   84    the two at the gate: "You're happy, aren't you?" (bubble).
//   hold  the tag flips up over her head, slowly, with the soft snap; she smiles the smile; slow push to her face.
//   85    close on her: "Of course, beta."
//   hold  the camera stays on her face; you are out of frame, only your hands on the tiffin show.
//   86    still on her; then the two-shot: "Tell me the truth?"
//   87    the soft snap again: the tag flips again; she nods, leans in, puts a hand on your arm, and begins.
//   88    close on you, still, her hand on your arm; close on her mouth still moving; close on you again.
//   hold  wide: she pats your arm, waves, walks to the door with the tag still over her head; you stand in the lane.
//   89    she goes in: the tag goes with her. You stay at the gate with the tiffin.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { LIMB, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, ForegroundHead } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { INK, MUSTARD } from "@whatif/kit/theme";
import { Bubble, Bun, headAt, Shawl, YesTag } from "../parts";
import { aimArm, handAt, shoulderAt, type Body } from "../parts2";
import { blinking, camAt, current, HERO, lineEnd, linear, mix, MOTHER, ramp, type Beat, type Shot } from "../shared";
import { MOTHER_GATE, MothersGate, MothersHouseBack, Tiffin } from "../sets/MothersHouse";
import { Sfx } from "./Change.parts";
import { talk } from "./Loan.parts";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i). */
function times(clips: Clip[], start: number, end: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const tag = lineEnd(clips, 84) + 6;
  const walk = lineEnd(clips, 88) + 56;
  return {
    start,
    end,
    give: [start + 8, at(81, 0.3)] as const, // she lifts the tiffin over the gate into your arms
    two: at(81, 0.32), // "a whole lunch without a question"
    noticed: at(81, 0.68), // "She noticed"
    didnt: at(81, 0.84), // "She didn't say"
    ots: from(82) - 4,
    quiet: [from(82), lineEnd(clips, 82)] as const,
    you: lineEnd(clips, 82) + 4,
    comes: at(83, 0.38), // "it comes out"
    never: at(83, 0.56), // "The one thing you've never asked anyone"
    ask: at(84, 0.45), // the two at the gate; the bubble
    bubble: at(84, 0.55), // "You're happy, aren't you?"
    tag, // the slow tag, the soft snap
    settle: tag + 44, // the 4 s hold: push to her face
    course: [from(85), lineEnd(clips, 85)] as const, // "Of course, beta."
    hands: lineEnd(clips, 85) + 4, // the camera stays on her; only your hands on the tiffin
    two2: at(86, 0.58), // the two-shot
    truth: at(86, 0.62), // "Tell me the truth?"
    snap2: from(87) - 6,
    lean: from(87) - 4,
    begins: [from(87), lineEnd(clips, 88) - 10] as const, // her mouth keeps moving under the music
    listen: from(88),
    mouth: at(88, 0.31), // "and she tells you something"
    which: at(88, 0.53), // "no way on earth to know which it was"
    pat: lineEnd(clips, 88) + 2,
    wave: lineEnd(clips, 88) + 24,
    walk,
    inside: at(89, 0.8), // "And it's gone": she goes in, the tag with her
  };
}

// ------------------------------------------------------------------------------------------------ blocking

const S = 1.15;
const FLOOR = MOTHER_GATE.floor;
const YOU_X = 700;
const HER_X = 900;
const YOU_HEAD = headAt(YOU_X, FLOOR, S, STAND);
const HER_HEAD = headAt(HER_X, FLOOR, S, STAND, -1);
/** The tiffin in your arms (its base centre) and its scale. */
const HELD = { x: 792, y: 822 };
const TS = 0.7;

/** Where the tiffin is: in her hands over the gate, lifted across into yours. */
function tiffinAt(frame: number, k: T) {
  const p = ramp(frame, k.give[0], k.give[1]);
  return { x: mix(HER_X - 66, HELD.x, p), y: mix(818, HELD.y, p) - Math.sin(p * Math.PI) * 70, p };
}

/** Your mother: bun, figure, shawl. */
const Mom: React.FC<{ body: Body; face: object; frame: number }> = ({ body, face, frame }) => (
  <>
    <Bun {...body} />
    <Figure head={MOTHER.head} coat={MOTHER.coat} {...body} {...face} blink={blinking(frame, 5)} time={frame} />
    <Shawl {...body} />
  </>
);

/** Her body at a frame: handing over, leaning in with a hand on your arm, patting, waving, walking to the door. */
function herBody(frame: number, k: T): { body: Body; walking: boolean; gone: boolean } {
  const tf = tiffinAt(frame, k);
  const body: Body = { x: HER_X, y: FLOOR, scale: S, facing: -1, pose: STAND };
  if (frame >= k.walk) {
    const p = linear(frame, k.walk, k.inside - 4);
    body.facing = 1;
    body.x = mix(HER_X + 40, MOTHER_GATE.door.x, p);
    body.y = mix(FLOOR, MOTHER_GATE.door.y, ramp(frame, mix(k.walk, k.inside, 0.75), k.inside - 4));
    body.pose = p < 1 ? walkPose(frame * 0.22) : STAND;
    return { body, walking: true, gone: frame >= k.inside };
  }
  const lean = ramp(frame, k.lean, k.lean + 16) * (1 - ramp(frame, k.wave, k.wave + 10));
  const nod = frame >= k.snap2 && frame < k.snap2 + 24 ? Math.sin(((frame - k.snap2) / 12) * Math.PI) * 7 : 0;
  let pose: Pose = { ...STAND, lean: 16 * lean, tilt: nod };
  const b = { ...body, pose };
  if (frame < k.give[1] + 6) {
    const hold = 1 - ramp(frame, k.give[1] - 4, k.give[1] + 6);
    pose = { ...pose, armF: aimArm(b, { x: tf.x + 28, y: tf.y - 40 }).map((v, i) => mix(STAND.armF[i], v, hold)) as [number, number],
      armB: aimArm(b, { x: tf.x + 34, y: tf.y - 10 }).map((v, i) => mix(STAND.armB[i], v, hold)) as [number, number] };
  } else if (frame >= k.lean && frame < k.wave) {
    const pat = frame >= k.pat ? Math.abs(Math.sin(((frame - k.pat) / 6) * Math.PI)) * 12 : 0;
    pose = { ...pose, armF: aimArm(b, { x: YOU_X + 46, y: 750 - pat }) };
  } else if (frame >= k.wave) {
    pose = { ...pose, armB: aimArm(b, { x: HER_X - 110 + Math.sin(((frame - k.wave) / 7) * Math.PI) * 22, y: 605 }) };
  }
  body.pose = pose;
  return { body, walking: false, gone: false };
}

/** Her forearm and hand drawn again over the gate and the tiffin, so the hand on your arm shows. */
const HerHand: React.FC<{ body: Body }> = ({ body }) => {
  const sh = shoulderAt(body);
  const [u] = body.pose.armF;
  const elbow = { x: sh.x + Math.sin((u * Math.PI) / 180) * LIMB * S * body.facing, y: sh.y + Math.cos((u * Math.PI) / 180) * LIMB * S };
  const hand = handAt(body, "front");
  return (
    <g>
      <line x1={mix(elbow.x, hand.x, 0.35)} y1={mix(elbow.y, hand.y, 0.35)} x2={hand.x} y2={hand.y} stroke={INK} strokeWidth={13 * S} strokeLinecap="round" />
      <circle cx={hand.x} cy={hand.y} r={9 * S} fill={MOTHER.head} />
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the scene

/** The gate scene: her (behind the gate), the gate, the tiffin, you. `you` false leaves your figure out, `hands` draws
 *  only your two hands on the tiffin (you out of frame). */
const Gate: React.FC<{ frame: number; k: T; cam: Camera; you: object; her: object; showYou?: boolean; hands?: boolean }> = ({
  frame, k, cam, you, her, showYou = true, hands,
}) => {
  const h = herBody(frame, k);
  const hh = headAt(h.body.x, h.body.y, S, h.body.pose, h.body.facing);
  const tf = tiffinAt(frame, k);
  const yb: Body = { x: YOU_X, y: FLOOR, scale: S, facing: 1, pose: STAND };
  const take = ramp(frame, k.give[1] - 14, k.give[1]);
  yb.pose = {
    ...STAND,
    armF: take > 0 ? aimArm(yb, { x: tf.x - 30, y: tf.y - 54 }) : STAND.armF,
    armB: take > 0 ? aimArm(yb, { x: tf.x - 26, y: tf.y - 16 }) : STAND.armB,
  };
  const tagAt = frame >= k.snap2 ? k.snap2 : k.tag;
  const onArm = frame >= k.lean + 8 && frame < k.wave;
  const door = ramp(frame, k.inside - 22, k.inside - 12) * (1 - ramp(frame, k.inside + 6, k.inside + 16));
  const actors = (
    <>
      {door > 0 && <rect x={MOTHER_GATE.door.x - 90} y={560} width={180 * door} height={MOTHER_GATE.door.y - 560} fill="#2a1a14" />}
      {!h.gone && <Mom body={h.body} face={h.walking ? { ...her, look: { x: 0.8, y: 0 } } : her} frame={frame} />}
      <MothersGate open={0} />
      <Tiffin x={tf.x} y={tf.y} scale={TS} jar />
      {showYou && <Figure {...HERO} {...yb} {...you} blink={blinking(frame, 1)} time={frame} />}
      {hands && (
        <g>
          <line x1={tf.x - 30} y1={tf.y - 54} x2={tf.x - 520} y2={tf.y + 260} stroke={INK} strokeWidth={15} strokeLinecap="round" />
          <line x1={tf.x - 26} y1={tf.y - 16} x2={tf.x - 470} y2={tf.y + 300} stroke="#3b3e47" strokeWidth={15} strokeLinecap="round" />
          <circle cx={tf.x - 30} cy={tf.y - 54} r={10.4} fill={MUSTARD} />
          <circle cx={tf.x - 26} cy={tf.y - 16} r={10.4} fill={MUSTARD} />
        </g>
      )}
      {onArm && <HerHand body={h.body} />}
      {!h.gone && frame >= k.tag && <YesTag frame={frame} at={tagAt} x={hh.x} headY={hh.y} r={hh.r} slow until={k.inside} />}
      <Bubble frame={frame} at={k.bubble} until={k.tag + 10} x={YOU_HEAD.x + YOU_HEAD.r * 1.05} y={YOU_HEAD.y - YOU_HEAD.r * 0.9} text="You're happy, aren't you?" size={24} />
      <Bubble frame={frame} at={k.truth} until={k.snap2 + 8} x={YOU_HEAD.x + YOU_HEAD.r * 1.05} y={YOU_HEAD.y - YOU_HEAD.r * 0.9} text="Tell me the truth?" size={24} side="left" />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<MothersHouseBack cam={cam} view="gate" frame={frame} />} actors={actors} />;
};

/** The smile: the same one as everyone's (brows up, the smile). */
const SMILE = { brows: "raised" as const, lids: 0, mouth: "smile" as const, eyes: 1.05, look: { x: 1, y: 0.05 } };

const CostShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.start, "wide"], [k.two, "two"], [k.noticed, "noticed"], [k.ots, "ots"], [k.you, "you"], [k.ask, "ask"],
    [k.tag, "tag"], [k.settle, "face"], [k.hands, "hands"], [k.two2, "two2"], [k.lean, "lean"], [k.listen, "listen"], [k.mouth, "mouth"],
    [k.which, "which"], [k.pat, "away"]]);
  const lh = headAt(HER_X, FLOOR, S, { ...STAND, lean: 12 }, -1);
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.start, { x: 960, y: 600, zoom: 1.12 }], [k.two, { x: 900, y: 630, zoom: 1.3 }]]),
    two: camAt(frame, [[k.two, { x: 810, y: 660, zoom: 1.75 }], [k.noticed, { x: 810, y: 660, zoom: 1.88 }]]),
    noticed: camAt(frame, [[k.noticed, closeUp(HER_HEAD.x - 30, HER_HEAD.y, 2.5)], [k.ots, closeUp(HER_HEAD.x - 30, HER_HEAD.y, 2.85)]]),
    ots: camAt(frame, [[k.ots, { x: 980, y: HER_HEAD.y + 60, zoom: 2.1 }], [k.you, { x: 975, y: HER_HEAD.y + 60, zoom: 2.2 }]]),
    you: camAt(frame, [[k.you, closeUp(YOU_HEAD.x + 40, YOU_HEAD.y + 20, 2.5)], [k.never, closeUp(YOU_HEAD.x + 40, YOU_HEAD.y + 20, 2.7)], [k.ask, closeUp(YOU_HEAD.x + 40, YOU_HEAD.y + 20, 3)]]),
    ask: camAt(frame, [[k.ask, { x: 880, y: 630, zoom: 1.85 }], [k.tag, { x: 880, y: 625, zoom: 1.95 }]]),
    tag: camAt(frame, [[k.tag, { x: HER_HEAD.x, y: HER_HEAD.y - 70, zoom: 2.0 }], [k.settle, { x: HER_HEAD.x, y: HER_HEAD.y - 70, zoom: 2.1 }]]),
    face: camAt(frame, [[k.settle, { x: HER_HEAD.x, y: HER_HEAD.y - 60, zoom: 2.1 }], [k.course[0], closeUp(HER_HEAD.x, HER_HEAD.y - 30, 2.7)], [k.hands, closeUp(HER_HEAD.x, HER_HEAD.y - 20, 2.85)]]),
    hands: camAt(frame, [[k.hands, closeUp(HER_HEAD.x - 70, HER_HEAD.y + 50, 2.5)], [k.two2, closeUp(HER_HEAD.x - 70, HER_HEAD.y + 40, 2.75)]]),
    two2: camAt(frame, [[k.two2, { x: 830, y: 630, zoom: 1.85 }], [k.lean, { x: 830, y: 635, zoom: 1.9 }]]),
    lean: camAt(frame, [[k.lean, { x: 820, y: 650, zoom: 2.0 }], [k.listen, { x: 815, y: 655, zoom: 2.15 }]]),
    listen: camAt(frame, [[k.listen, closeUp(YOU_HEAD.x + 70, YOU_HEAD.y + 40, 2.4)], [k.mouth, closeUp(YOU_HEAD.x + 70, YOU_HEAD.y + 40, 2.55)]]),
    mouth: camAt(frame, [[k.mouth, closeUp(lh.x - 30, lh.y, 2.8)], [k.which, closeUp(lh.x - 30, lh.y, 3.1)]]),
    which: camAt(frame, [[k.which, closeUp(YOU_HEAD.x + 40, YOU_HEAD.y + 10, 2.6)], [k.pat, closeUp(YOU_HEAD.x + 40, YOU_HEAD.y + 10, 3)]]),
    away: camAt(frame, [[k.pat, { x: 1080, y: 600, zoom: 1.2 }], [k.inside, { x: 1060, y: 610, zoom: 1.26 }], [k.end, { x: 1000, y: 620, zoom: 1.32 }]]),
  };
  const cam = drift(cams[shot], frame, "cost", 2.5);

  // Her face: warm at the handover; she noticed (worry), looks down; asks gently; the smile from the tag on, talking.
  const her = frame < k.noticed
    ? { ...EXPRESSIONS.happy, brows: "raised" as const, look: { x: 1, y: 0.2 } }
    : frame < k.didnt
      ? { brows: "worry" as const, lids: 0.1, mouth: "flat" as const, eyes: 1, look: { x: 1, y: 0.05 } }
      : frame < k.ots
        ? { brows: "worry" as const, lids: 0.35, mouth: "smirk" as const, eyes: 1, look: { x: 0.6, y: 0.75 } }
        : frame < k.tag
          ? { brows: "worry" as const, lids: 0.1, mouth: talk(frame, k.quiet[0], k.quiet[1], "flat"), eyes: 1, look: { x: 1, y: 0.05 } }
          : { ...SMILE, mouth: frame < k.begins[0] ? talk(frame, k.course[0], k.course[1], "smile") : talk(frame, k.begins[0], k.begins[1], "smile") };
  // You: eyes on the tiffin; then searching her face; asking; then still.
  const you = frame < k.you
    ? { ...EXPRESSIONS.sad, lids: 0.35, look: { x: 0.7, y: 0.75 } }
    : frame < k.tag + 20
      ? { brows: "worry" as const, lids: 0, mouth: frame >= k.bubble ? "o" as const : frame >= k.comes ? "wobble" as const : "flat" as const, eyes: 1.1, look: { x: 1, y: -0.05 } }
      : frame < k.truth
        ? { ...EXPRESSIONS.worried, mouth: "flat" as const, look: { x: 1, y: -0.05 } }
        : frame < k.snap2 + 4
          ? { brows: "worry" as const, lids: 0, mouth: "o" as const, eyes: 1.1, look: { x: 1, y: 0 } }
          : frame < k.pat
            ? { brows: "none" as const, lids: 0.2, mouth: "flat" as const, eyes: 1, look: { x: 1, y: 0 } }
            : { ...EXPRESSIONS.sad, look: { x: 1, y: -0.1 } };
  return (
    <>
      <Gate frame={frame} k={k} cam={cam} you={you} her={her} showYou={shot !== "ots" && shot !== "hands"} hands={shot === "hands"} />
      {shot === "ots" && <ForegroundHead x={260} side="left" blur={16} />}
    </>
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const Cost: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.from, shot.to);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <CostShot frame={frame} k={k} />
      <Sfx at={k.tag} name="snap-soft" />
      <Sfx at={k.snap2} name="snap-soft" />
    </AbsoluteFill>
  );
};

export const cost: Beat = { id: "cost", firstLine: 81, Component: Cost };
