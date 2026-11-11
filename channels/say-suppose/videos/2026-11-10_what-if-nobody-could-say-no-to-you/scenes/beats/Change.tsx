// Beat "The change" (script.md, ## [00:00] The change; narration lines 0-7). The style reference for this film's
// beats: one `times()` turns the narration clips into every frame the beat uses, then one small component per shot,
// then the beat picks the shot by frame and places the sounds outside the Stage.
//
//   0     the thumbnail's picture: the metro gate at night, you with your hand out, the boss, the checker and your
//         mother nodding in a row with one smile; three YES tags snap up before the first word (hers slow and soft).
//         Then close on her smile ("Even your mother"), then close on you.
//   1     that morning: top-down on your phone in the queue, a line typed and deleted four times.
//   2     close on you in the queue, the queue shuffles forward.
//   3-4   the phone rings (the bun-and-shawl icon); you answer, eyes on the floor; "Fine, Ma."; close, ask nothing.
//   5     the gate: the checker holds out a fine slip; insert on yesterday's ticket; you take the slip, brows up.
//         "Let me off?"
//   6     he tears the slip in half, in quarters, puts the pieces in your palm and smiles.
//   7     snap: the stamped YES over his cap. He doesn't see it; your eyes go up to it and stay.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { CANDIDATES, ROW, rowFeet } from "../../../../brand/thumbs/nobody";
import { headOf } from "../../../../brand/thumbs/batch1";
import { Bubble, Bun, headAt, Shawl, YesTag } from "../parts";
import { aimArm, FineSlip, handAt, HandPhone, OldTicket, PhoneTop, type Body } from "../parts2";
import { BOSS, blinking, camAt, current, HERO, lineEnd, mix, MOTHER, PASTELS, ramp, type Beat, type Shot } from "../shared";
import { REF } from "../sets/common";
import { MetroBack, MetroFront, Turnstile, METRO_GATE } from "../sets/Metro";
import { Checker, checkerTagAt, piecesFrom, CX, FloorTop, FLOOR, HX, S, Sfx } from "./Change.parts";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips: line i starts at clips[i].from. `at(i, p)` is a point p of the
 *  way through line i (there are no word cues for this film yet), so a new take re-times the whole beat. */
function times(clips: Clip[]) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  return {
    // 0: three snaps in the 0.3 s hold before the first word: the boss, the checker, your mother (slow, soft).
    tags: [0, 6, 12] as const,
    mother: at(0, 0.4), // "Even your mother."
    you: at(0, 0.66), // "You'd never know what she really thought."
    // 1: the phone insert, four drafts.
    phone: from(1) - 4,
    // 2: close on you in the queue.
    queue: from(2) - 2,
    shuffle: at(2, 0.5),
    // 3-4: the call.
    ring: lineEnd(clips, 2) - 18,
    answer: from(3) - 2,
    shuffle2: from(3) + 30,
    fine: lineEnd(clips, 3) + 2, // bubble "Fine, Ma."
    nothing: at(4, 0.45),
    // 5-7: the gate.
    gate: from(5) - 6,
    ticket: at(5, 0.36), // "Yesterday's ticket."
    joke: at(5, 0.68), // "And you make a joke."
    letMeOff: lineEnd(clips, 5) + 1,
    tear: from(6) - 2, // half at +8, quarters at +18, into your palm by `pieces`
    pieces: piecesFrom(clips),
    snap: checkerTagAt(clips),
    eyesUp: from(7) + 10,
    both: at(7, 0.58),
  };
}

// ------------------------------------------------------------------------------------------------ shot 0: the thumbnail

/** The thumbnail's hero (candidate b, "EVEN HER?") and the row: drawn at the thumbnail's own screen scale under REF. */
const THUMB_HERO = CANDIDATES[1].hero;

const Row: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  // One nod, the same on all three at the same moment: the smile that is the same smile.
  const nod = Math.sin(frame / 9) * 2.5;
  const body: Pose = { ...STAND, tilt: ROW.tilt + nod, armF: [6, 8], armB: [-6, 8], legB: [-4, -2], legF: [5, -3] };
  const face = { brows: "raised" as const, lids: 0, mouth: "smile" as const, eyes: 1.05, look: { x: -0.9, y: 0 } };
  const [bx, cx, mx] = ROW.xs;
  const s = ROW.scale;
  const m = rowFeet(mx);
  return (
    <>
      <Figure x={rowFeet(bx).x} y={rowFeet(bx).y} scale={s} facing={-1} head={BOSS.head} tie={BOSS.tie} pose={body} {...face} blink={blinking(frame, 2)} />
      <Checker x={rowFeet(cx).x} y={rowFeet(cx).y} scale={s} facing={-1} pose={body} {...face} blink={blinking(frame, 2)} />
      <Bun x={m.x} y={m.y} scale={s} pose={body} facing={-1} />
      <Figure x={m.x} y={m.y} scale={s} facing={-1} head={MOTHER.head} coat={MOTHER.coat} pose={body} {...face} blink={blinking(frame, 2)} />
      <Shawl x={m.x} y={m.y} scale={s} pose={body} facing={-1} />
      {ROW.xs.map((x, i) => {
        const h = headAt(rowFeet(x).x, rowFeet(x).y, s, body, -1);
        return <YesTag key={x} frame={frame} at={k.tags[i]} x={h.x} headY={h.y} r={h.r} slow={i === 2} />;
      })}
    </>
  );
};

const ThumbShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const h = headOf(THUMB_HERO);
  const cam = current(frame, [[0, "row"], [k.mother, "mother"], [k.you, "you"]]);
  const cams: Record<typeof cam, Camera> = {
    row: camAt(frame, [[0, REF], [k.mother, { x: 1000, y: 560, zoom: 1.06 }]]),
    mother: camAt(frame, [[k.mother, { x: 1640, y: 560, zoom: 1.55 }], [k.you, { x: 1630, y: 570, zoom: 1.68 }]]),
    you: camAt(frame, [[k.you, { x: h.x + 260, y: h.y - 10, zoom: 1.3 }], [k.phone, { x: h.x + 240, y: h.y, zoom: 1.42 }]]),
  };
  // You: shocked as the tags go up, then worried; on "never know" the lids drop and the eyes go to her.
  const lateness = ramp(frame, k.you + 20, k.you + 40);
  const face = frame < k.mother
    ? { ...EXPRESSIONS.shocked, brows: "worry" as const, eyes: 1.3, look: THUMB_HERO.look }
    : { ...EXPRESSIONS.worried, eyes: 1.2, lids: mix(0.1, 0.45, lateness), mouth: lateness > 0.5 ? "frown" as const : "wobble" as const,
      look: { x: 0.95, y: mix(0.05, -0.1, lateness) } };
  const hand = Math.sin(frame / 14) * 2;
  const actors = (
    <>
      <Row frame={frame} k={k} />
      <Figure {...HERO} x={THUMB_HERO.x} y={THUMB_HERO.y} scale={THUMB_HERO.scale} pose={{ ...THUMB_HERO.pose, armF: [THUMB_HERO.pose.armF[0] + hand, THUMB_HERO.pose.armF[1]] }}
        flow={0.25} time={frame} {...face} blink={blinking(frame, 5) && frame > k.mother} />
    </>
  );
  const c = drift(cams[cam], frame, "thumb", 4);
  return <Stage cam={c} radius={0} origin={{ x: 0, y: 0 }} back={<MetroBack cam={c} view="gate" frame={frame} />} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ shot 1: the drafts

/** Four drafts: typed over 55% of each cycle, held, deleted fast. The thumb hops over the keys, then sits on delete. */
function drafts(frame: number, from: number, to: number) {
  const len = (to - from) / 4;
  const n = Math.min(3, Math.max(0, Math.floor((frame - from) / len)));
  const u = Math.max(0, (frame - from - n * len) / len);
  const typed = u < 0.55 ? u / 0.55 : u < 0.7 ? 1 : u < 0.92 ? 1 - (u - 0.7) / 0.22 : 0;
  const deleting = u >= 0.7 && u < 0.92;
  const hop = Math.floor(frame / 3);
  const thumb = deleting ? { x: 0.93, y: 0.72 } : u < 0.55 ? { x: 0.1 + ((hop * 37) % 80) / 100, y: 0.15 + ((hop * 53) % 50) / 100 } : { x: 0.6, y: 0.9 };
  return { typed, thumb, n };
}

const PhoneShot: React.FC<{ frame: number; k: T; mode: "message" | "call" }> = ({ frame, k, mode }) => {
  const d = drafts(frame, k.phone + 4, k.queue - 4);
  const ringing = mode === "call";
  const cam: Camera = ringing
    ? { x: 960 + Math.sin(frame * 2.1) * 6, y: 560, zoom: 1.3 }
    : camAt(frame, [[k.phone, { x: 960, y: 560, zoom: 1.22 }], [k.queue, { x: 960, y: 580, zoom: 1.36 }]]);
  const actors = ringing
    ? <PhoneTop x={960} y={560} scale={1.1} frame={frame} mode="call" />
    : <PhoneTop x={960} y={560} scale={1.1} frame={frame} typed={d.typed} seed={d.n * 3} thumb={d.thumb} cursor={d.typed < 1} />;
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<FloorTop step={ringing ? 30 : 0} />} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ shots 2-4: the queue

/** The queue at the gate: people ahead of you (right) and behind (left), all facing the turnstiles. It shuffles forward
 *  by STEP at each shuffle frame. You hold your phone low, or at your ear once you answer. */
const STEP = 70;
const QX = 760;

const QueueShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const steps = [k.shuffle, k.shuffle2];
  const moved = steps.reduce((a, s) => a + ramp(frame, s, s + 16), 0) * STEP;
  const walking = steps.some((s) => frame >= s && frame < s + 16);
  const legs = (i: number): Pose => (walking ? walkPose(frame * 0.4 + i) : STAND);
  const atEar = frame >= k.answer;
  const hero: Body = { x: QX + moved, y: FLOOR, scale: S, facing: 1, pose: legs(0) };
  const head = headAt(hero.x, hero.y, S, hero.pose);
  const lower = ramp(frame, k.nothing, k.nothing + 14);
  // Low in the front hand; at your ear in the BACK hand (drawn behind your head, so it never covers the face); then
  // lowered into the front hand again for "ask her nothing".
  const onEar = atEar && lower < 0.5;
  hero.pose = onEar
    ? { ...hero.pose, armB: aimArm(hero, { x: head.x - head.r * 0.7, y: head.y + 12 }) }
    : { ...hero.pose, armF: aimArm(hero, atEar ? { x: mix(head.x + 20, head.x + 55, lower), y: mix(head.y + 60, head.y + 115, lower) } : { x: head.x + 55, y: head.y + 115 }) };
  const ear = handAt(hero, "back");
  const ringing = frame >= k.ring && frame < k.answer;

  const shot = current(frame, [[k.queue, "close"], [k.answer, "medium"], [k.nothing, "sad"]]);
  const keyed: Camera = {
    close: camAt(frame, [[k.queue, closeUp(head.x + 40, head.y, 2.3)], [k.ring, closeUp(head.x + 50, head.y + 10, 2.5)]]),
    medium: camAt(frame, [[k.answer, { x: QX + 140, y: 700, zoom: 1.7 }], [k.nothing, { x: QX + 160, y: 690, zoom: 1.8 }]]),
    sad: camAt(frame, [[k.nothing, closeUp(head.x + 30, head.y, 2.6)], [k.gate, closeUp(head.x + 30, head.y + 6, 2.9)]]),
  }[shot];
  const cam = drift(keyed, frame, "queue", 3);
  const face = shot === "close"
    ? { ...EXPRESSIONS.worried, look: { x: 0.5, y: 0.85 }, lids: 0.3 }
    : shot === "medium"
      ? { ...EXPRESSIONS.worried, mouth: frame >= k.fine && frame < k.fine + 20 ? "smile" as const : "flat" as const, look: { x: 0.2, y: 0.95 }, lids: 0.45 }
      : { ...EXPRESSIONS.sad, look: { x: 0.4, y: 0.8 } };
  const others = [-2, -1, 1, 2].map((q, i) => (
    <Figure key={q} x={QX + q * 180 + moved} y={FLOOR + (i % 2) * 6} scale={S * (0.96 + (i % 2) * 0.06)} pose={legs(i + 1)}
      head={PASTELS[(i * 3 + 1) % PASTELS.length]} coat={i === 2 ? "#3f4a5c" : undefined} look={{ x: 0.8, y: 0.3 }} mouth="flat"
      blink={blinking(frame, i + 3)} time={frame} />
  ));
  const actors = (
    <>
      {others}
      {onEar && <g transform={`translate(${ear.x} ${ear.y}) scale(${S})`}><HandPhone frame={frame} /></g>}
      <Figure {...HERO} {...hero} {...face} blink={blinking(frame, 1)} time={frame}
        held={onEar ? undefined : <HandPhone frame={frame} ringing={ringing} lit={shot !== "sad" || lower < 1} />} />
      <Turnstile x={METRO_GATE.gate.x + 220} y={FLOOR} scale={S} lamp="red" />
      <Bubble frame={frame} at={k.fine} until={k.nothing + 12} x={head.x + head.r * 1.05} y={head.y - head.r * 0.9} text="Fine, Ma." size={30} />
    </>
  );
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<MetroBack cam={cam} view="gate" frame={frame} crowd />}
      actors={actors} front={<MetroFront cam={cam} view="gate" />} />
  );
};

// ------------------------------------------------------------------------------------------------ shots 5-7: the gate

/** Where the slip is held between you: in front of the checker's chest, a little toward you. */
const SLIP = { x: (HX + CX) / 2 + 22, y: FLOOR - 205 * S };
/** Your palm, held out low to take the pieces. */
const PALM = { x: SLIP.x - 30, y: SLIP.y + 40 };

const GateShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const hero: Body = { x: HX, y: FLOOR, scale: S, facing: 1, pose: STAND };
  const checker: Body = { x: CX, y: FLOOR, scale: S, facing: -1, pose: STAND };
  const heroHead = headAt(HX, FLOOR, S, STAND);
  const checkerHead = headAt(CX, FLOOR, S, STAND, -1);

  // The checker holds the slip out; tears it (two hands) at `tear`; drops the pieces into your palm; arm back down.
  const half = k.tear + 8, quarters = k.tear + 18, drop = k.pieces - 4, pieces = k.pieces;
  const give = ramp(frame, k.gate, k.gate + 14) * (1 - ramp(frame, pieces + 4, pieces + 18));
  const parted = ramp(frame, k.tear, half) * 14 + ramp(frame, half + 2, quarters) * 10 - ramp(frame, quarters + 2, drop) * 24;
  const slipAt = frame < drop ? SLIP : { x: mix(SLIP.x, PALM.x + 6, ramp(frame, drop - 6, drop)), y: mix(SLIP.y, PALM.y - 24, ramp(frame, drop - 6, drop)) };
  const cArmF = aimArm(checker, { x: slipAt.x + parted / 2, y: slipAt.y - parted * 0.2 });
  const cArmB = aimArm(checker, { x: SLIP.x - parted / 2, y: SLIP.y + parted * 0.2 });
  const tearing = ramp(frame, k.tear - 6, k.tear) * (1 - ramp(frame, quarters + 2, drop));
  checker.pose = {
    ...STAND,
    armF: [mix(STAND.armF[0], cArmF[0], give), mix(STAND.armF[1], cArmF[1], give)],
    armB: [mix(STAND.armB[0], cArmB[0], tearing), mix(STAND.armB[1], cArmB[1], tearing)],
  };
  const slip = frame < pieces
    ? <FineSlip x={0} y={0} scale={0.42} tilt={-6} pieces={frame < half ? 1 : frame < quarters ? 2 : 4} spread={Math.max(0, parted)} />
    : null;

  // You: the old ticket at your chest; reach to pinch the slip's corner on the joke; then palm up for the pieces.
  const pinch = ramp(frame, k.joke + 4, k.joke + 16) * (1 - ramp(frame, k.tear - 6, k.tear));
  const palm = ramp(frame, k.tear, k.tear + 12);
  const chest = { x: HX + 70, y: FLOOR - 200 * S };
  const target = palm > 0 ? { x: mix(SLIP.x - 16, PALM.x, palm), y: mix(SLIP.y, PALM.y, palm) } : { x: mix(chest.x, SLIP.x - 16, pinch), y: mix(chest.y, SLIP.y, pinch) };
  hero.pose = { ...STAND, armF: aimArm(hero, target) };
  const heroHeld = frame < k.joke + 4
    ? <OldTicket x={0} y={-6} scale={0.4} tilt={frame < k.joke ? -14 + Math.sin(frame / 6) * 6 : 0} />
    : frame >= pieces ? <FineSlip x={8} y={-10} scale={0.36} pieces={4} spread={10} /> : null;

  // Faces. Him: a flat official look, then from the tear the smile, the same smile as the row; never at the tag.
  const smiling = frame >= k.tear + 4;
  const cFace = smiling ? { brows: "raised" as const, lids: 0, mouth: "smile" as const, eyes: 1.05, look: { x: 0.9, y: 0.1 } } : { ...EXPRESSIONS.sceptical, look: { x: 0.9, y: 0.2 } };
  const shot = current(frame, [[k.gate, "wide"], [k.ticket, "ticket"], [k.joke, "joke"], [k.tear, "tear"], [k.snap, "tag"], [k.eyesUp, "eyes"], [k.both, "both"]]);
  const yFace = ({
    wide: { ...EXPRESSIONS.worried, look: { x: 0.8, y: 0.3 } },
    ticket: { ...EXPRESSIONS.worried, look: { x: 0.6, y: 0.8 } },
    joke: { ...EXPRESSIONS.happy, brows: "raised" as const, mouth: frame < k.letMeOff ? "smirk" as const : "smile" as const, look: { x: 1, y: 0 } },
    tear: { ...EXPRESSIONS.shocked, eyes: 1.15, look: { x: 0.9, y: 0.4 } },
    tag: { ...EXPRESSIONS.shocked, eyes: 1.15, look: { x: 0.9, y: 0.2 } },
    eyes: { ...EXPRESSIONS.shocked, mouth: "flat" as const, eyes: 1.25, look: { x: 0.6, y: -0.95 } },
    both: { ...EXPRESSIONS.worried, mouth: "flat" as const, brows: "raised" as const, eyes: 1.2, look: { x: 0.55, y: -0.95 } },
  } as const)[shot];

  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.gate, { x: 1130, y: 720, zoom: 1.45 }], [k.ticket, { x: 1110, y: 712, zoom: 1.58 }]]),
    ticket: camAt(frame, [[k.ticket, insert(chest.x + 4, chest.y - 4, 4.2)], [k.joke, insert(chest.x + 4, chest.y - 4, 4.6)]]),
    joke: camAt(frame, [[k.joke, { x: (HX + CX) / 2, y: 690, zoom: 1.9 }], [k.tear, { x: (HX + CX) / 2 + 10, y: 692, zoom: 2.0 }]]),
    tear: camAt(frame, [[k.tear, { x: SLIP.x, y: 700, zoom: 2.3 }], [k.snap, { x: SLIP.x, y: 704, zoom: 2.45 }]]),
    tag: camAt(frame, [[k.snap, { x: checkerHead.x - 40, y: checkerHead.y - 90, zoom: 2.0 }], [k.eyesUp, { x: checkerHead.x - 40, y: checkerHead.y - 96, zoom: 2.1 }]]),
    eyes: camAt(frame, [[k.eyesUp, closeUp(heroHead.x + 20, heroHead.y - 10, 2.7)], [k.both, closeUp(heroHead.x + 20, heroHead.y - 14, 2.95)]]),
    both: camAt(frame, [[k.both, { x: (HX + CX) / 2 + 30, y: 600, zoom: 1.5 }], [k.both + 60, { x: (HX + CX) / 2 + 30, y: 590, zoom: 1.58 }]]),
  };
  const cam = drift(cams[shot], frame, "gate", shot === "ticket" ? 1.5 : 3);
  const actors = (
    <>
      <Turnstile x={METRO_GATE.gate.x} y={FLOOR} scale={S} lamp="red" />
      <Checker {...checker} {...cFace} blink={blinking(frame, 4)} time={frame} held={slip} />
      <Figure {...HERO} {...hero} {...yFace} blink={blinking(frame, 1) && shot !== "eyes"} time={frame} held={heroHeld} />
      <YesTag frame={frame} at={k.snap} x={checkerHead.x} headY={checkerHead.y - 10} r={checkerHead.r} />
      <Bubble frame={frame} at={k.letMeOff} until={k.tear + 8} x={heroHead.x - heroHead.r * 0.2} y={heroHead.y - heroHead.r * 1.75} text="Let me off?" size={26} side="left" />
    </>
  );
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<MetroBack cam={cam} view="gate" frame={frame} crowd />}
      actors={actors} front={<MetroFront cam={cam} view="gate" />} />
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const Change: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips);
  const scene = current(frame, [[0, "thumb"], [k.phone, "phone"], [k.queue, "queue"], [k.ring, "ring"], [k.answer, "queue"], [k.gate, "gate"]]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene === "thumb" && <ThumbShot frame={frame} k={k} />}
      {scene === "phone" && <PhoneShot frame={frame} k={k} mode="message" />}
      {scene === "ring" && <PhoneShot frame={frame} k={k} mode="call" />}
      {scene === "queue" && <QueueShot frame={frame} k={k} />}
      {scene === "gate" && <GateShot frame={frame} k={k} />}
      <Sfx at={k.tags[0]} name="snap" />
      <Sfx at={k.tags[1]} name="snap" />
      <Sfx at={k.tags[2]} name="snap-soft" />
      <Sfx at={k.snap} name="snap" />
    </AbsoluteFill>
  );
};

export const change: Beat = { id: "change", firstLine: 0, Component: Change };
