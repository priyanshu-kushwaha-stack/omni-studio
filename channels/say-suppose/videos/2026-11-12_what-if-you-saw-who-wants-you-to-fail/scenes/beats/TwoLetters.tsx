// Beat "Two Letters" (script.md v3, ## Two Letters; narration lines 128-134). Morning at the fridge. Your sister peels
// the calendar off, and behind it is her own letter, gone yellow; a 5 s performed moment, the narrator silent: she
// smooths it flat, tapes your result beside it, rests her hand between the two, looks at you once and doesn't ask.
// Then the door: your best friend with a letter of his own. "I got in!" (his own voice). He holds it up the way you held
// yours, grinning, fist half raised; a paper snap sounds above YOU, out of frame; his grin falters at your face; your
// eyes start to lift, then stop on his. Cut before your answer. End card.
//
//   128  the kitchen, morning; she reaches to the calendar, peels its tape, lifts it off on "Hers".
//   hold (5 s, performed) INSERT her letter, yellow at the edges, a seal like yours; her palm smooths it flat; she
//        tapes your result beside it, lining up the edges; her hand flat on the door between the two; the two-shot:
//        she looks at you in the doorway, her mouth opens to ask and closes; the brushes in the jar.
//   129  the two of you; you come a step into the room.   130  closer; she glances at you, half a second.
//   131  close on her, looking at the jar; the jar.
//   132  the front door: your best friend, grinning, his own letter.   133  his face (your point of view): "I got in!"
//   hold (4 s, performed) the letter up, grinning, fist half raised; the snap above you (sound only); his grin falters
//        at your face; close on you: your eyes start to lift, then stop on his. Cut.
//   134  + hold: the end card: the two of you at the fridge in the left third, the tags in the middle, the right third quiet.
import { AbsoluteFill } from "remotion";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { headAt, Letter, MeterSound } from "../parts";
import { Calendar, HOME, HomeBack, HomeTable, LETTER_S } from "../sets/Home";
import { camAt, current, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { aimArm, handAt, mixArm, Sister, talk, You, type Body, type Face } from "./HerBack.Sister";
import { EndTags, MinJun } from "./TwoLetters.EndCard";

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i). */
function times(clips: Clip[], start: number, end: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const hold5 = lineEnd(clips, 128) + 2; // performed: her letter, smoothed, yours taped beside it, the look
  const in5 = (p: number) => Math.round(hold5 + (from(129) - hold5) * p);
  const hold4 = lineEnd(clips, 133) + 2; // performed: the letter up and the grin; the snap; his grin falters; your eyes
  const in4 = (p: number) => Math.round(hold4 + (from(134) - hold4) * p);
  return {
    start,
    end,
    unpinShot: at(128, 0.24), // "She unpins the calendar"
    reach: [at(128, 0.28), at(128, 0.42)] as const,
    peel: [at(128, 0.44), at(128, 0.58)] as const, // the tape comes away
    lift: [at(128, 0.6), at(128, 0.84)] as const, // the calendar off: "Hers."
    hold5,
    reveal: [hold5, in5(0.2)] as const, // her letter, yellow at the edges, a seal like yours
    smooth: [in5(0.2), in5(0.4)] as const, // her palm smooths it flat
    stepIn: [in5(0.34), in5(0.44)] as const,
    tape: [in5(0.42), in5(0.62)] as const, // she tapes your result beside it, lining up the edges
    press: in5(0.58),
    flat: [in5(0.62), in5(0.66)] as const, // her hand flat on the door between the two
    glance: in5(0.76), // she looks at you in the doorway once
    ask: [in5(0.82), in5(0.9)] as const, // her mouth opens to ask, and closes
    jar5: in5(0.92), // the brushes in the jar
    two: from(129) - 2, // "For once, silence leaves both of you in the room."
    walk: [at(129, 0.1), at(129, 0.7)] as const,
    closer: from(130) - 2, // "Tomorrow someone you love will pause half a second"
    pause: [at(130, 0.34), at(130, 0.52)] as const,
    her104: from(131) - 2, // "That half-second is the other life, going past."
    jar104: at(131, 0.62),
    door: from(132) - 2, // "Then the door."
    open: [from(132), from(132) + 8] as const,
    letterUp: at(132, 0.32), // "A letter of his own."
    says: [from(133), lineEnd(clips, 133)] as const, // "I got in!" (his own voice)
    mj1: at(132, 0.5), // "He says it."
    youA: at(132, 0.74), // "the good news isn't yours"
    mjClose: from(133) - 2,
    hold4,
    fist: [hold4, in4(0.14)] as const, // the letter up, the grin, his fist half raised
    snap: in4(0.25), // a paper snap above you, out of frame
    falter: in4(0.32), // his grin falters at your face
    you4: in4(0.55), // close on you
    lift4: [in4(0.6), in4(0.74)] as const, // your eyes start to lift
    stop4: [in4(0.78), in4(0.9)] as const, // and stop on his
    card: from(134) - 2, // "So, would you still say it to her face?"
    comment: at(134, 0.46), // "Tell us in the comments"
    like: at(134, 0.79), // "hit like"
    subscribe: at(134, 0.85), // "and subscribe"
  };
}

// ------------------------------------------------------------------------------------------------ blocking

const S = 1.15;
const FLOOR = HOME.floor;
const HER_X = HOME.spots.fridge.x;
const HER_TAPE = 1405;
const YOU_DOOR = HOME.doorway.x;
const YOU_IN = 1650;
const MJ_X = HOME.frontDoor.x;
const ME_X = 440;
const HER_HEAD = headAt(HER_X, FLOOR, S, STAND, -1);
const ME_HEAD = headAt(ME_X, FLOOR, S, STAND, -1);
const MJ_HEAD = headAt(MJ_X, FLOOR, S, STAND, 1);
const BETWEEN = { x: (HOME.beside.x + HOME.hers.x) / 2, y: HOME.hers.y - 40 };

/**
 * Her at the fridge. Her far (back) arm does the reaching, so no raised near arm crosses her face: up to the
 * calendar's tape, the calendar lifted off and down to her side (leant on the counter by the time we see her letter), her palm across her
 * letter, your result (held in her near hand till then) carried up beside hers and taped, her hand flat between the two.
 */
function herAt(frame: number, k: T) {
  const stepIn = ramp(frame, k.stepIn[0], k.stepIn[1]);
  const x = mix(HER_X, HER_TAPE, stepIn);
  const moving = stepIn > 0 && stepIn < 1;
  const body: Body = { x, y: FLOOR, scale: S, facing: -1, pose: moving ? walkPose(frame * 0.3) : { ...STAND, lean: 8 } };
  const cal = HOME.calendar;
  const tapeAt = { x: cal.x, y: cal.y - 80 };
  let armB = body.pose.armB;
  let calendar: { x: number; y: number; tilt: number } | null = null;
  const lift = ramp(frame, k.lift[0], k.lift[1]);
  if (frame < k.smooth[0]) {
    const reach = ramp(frame, k.reach[0], k.reach[1]) * (1 - ramp(frame, k.lift[1], k.smooth[0]));
    const peel = ramp(frame, k.peel[0], k.peel[1]);
    const target = { x: mix(tapeAt.x + 40 * peel, HER_X - 70, lift), y: mix(tapeAt.y + 6 * peel, FLOOR - 250, lift) };
    armB = mixArm(STAND.armB, aimArm(body, target), reach);
    if (frame >= k.lift[0] && frame < k.hold5) calendar = { x: target.x, y: target.y + 80, tilt: mix(0, -14, lift) };
  } else if (frame < k.tape[0]) {
    // the palm smooths her letter, twice across
    const s = (frame - k.smooth[0]) / Math.max(1, k.smooth[1] - k.smooth[0]);
    const sweep = Math.sin(s * Math.PI * 2) * 22;
    armB = mixArm(STAND.armB, aimArm(body, { x: HOME.hers.x + sweep, y: HOME.hers.y - 56 }), ramp(frame, k.smooth[0], k.smooth[0] + 6));
  }
  // your result: in her near hand, then carried up beside hers by her far hand and taped, edges lined up
  const m = ramp(frame, k.tape[0], k.press);
  let yours: { x: number; y: number; tilt: number; tapes?: number } | null = null;
  let carried: { x: number; y: number; tilt: number } | null = null;
  if (frame >= k.tape[0] && frame < k.flat[0]) {
    const b = HOME.beside;
    const target = { x: mix(x - 80, b.x + 10, m), y: mix(FLOOR - 250, b.y - 70, m) };
    armB = aimArm(body, target);
    if (frame < k.press) carried = { x: target.x - 10, y: target.y + 70, tilt: mix(-10, b.tilt, m) };
  }
  if (frame >= k.press) yours = { ...HOME.beside, tapes: 2 };
  if (frame >= k.flat[0]) armB = mixArm(armB, aimArm(body, BETWEEN), ramp(frame, k.flat[0], k.flat[1]));
  body.pose = { ...body.pose, armB };
  if (frame < k.tape[0]) {
    const h = handAt(body, "front");
    carried = { x: h.x + 14, y: h.y + 110, tilt: 8 };
  }
  const calendarAt = calendar ?? (frame >= k.hold5 ? { x: 960, y: 600, tilt: -5 } : frame >= k.lift[1] ? (() => {
    const h = handAt(body, "back");
    return { x: h.x, y: h.y + 80, tilt: -14 };
  })() : null);
  return { body, calendar: calendarAt, yours, carried };
}

/** Your place: in the doorway, then a step into the room. */
function youAt(frame: number, k: T): Body {
  const p = ramp(frame, k.walk[0], k.walk[1]);
  return { x: mix(YOU_DOOR, YOU_IN, p), y: FLOOR, scale: S, facing: -1, pose: p > 0 && p < 1 ? walkPose(frame * 0.25) : STAND };
}

// ------------------------------------------------------------------------------------------------ scenes

/** The kitchen in the morning: the fridge, her, you. The calendar and your result in her hands are drawn after her. */
const Kitchen: React.FC<{ frame: number; k: T; cam: Camera; you: Face; her: Face }> = ({ frame, k, cam, you, her }) => {
  const h = herAt(frame, k);
  const actors = (
    <>
      <HomeTable bowl={false} />
      <Sister body={h.body} face={her} frame={frame} duty="off" />
      {h.calendar && <Calendar x={h.calendar.x} y={h.calendar.y} tilt={h.calendar.tilt} scale={0.92} />}
      {h.carried && <Letter x={h.carried.x} y={h.carried.y} scale={LETTER_S} tilt={h.carried.tilt} />}
      <You body={youAt(frame, k)} face={you} frame={frame} />
    </>
  );
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} actors={actors}
      back={<HomeBack cam={cam} mood="morning" frame={frame} calendar={frame < k.lift[0]} yours={h.yours} />} />
  );
};

/** The front door: your best friend on the threshold, his letter up; you inside (left out in his close-ups, which are
 *  your point of view). */
const Door: React.FC<{ frame: number; k: T; cam: Camera; mj: Face; you: Face; showYou: boolean; showHim: boolean }> = ({
  frame, k, cam, mj, you, showYou, showHim,
}) => {
  const open = ramp(frame, k.open[0], k.open[1]);
  const body: Body = { x: MJ_X, y: FLOOR, scale: S, facing: 1, pose: STAND };
  const up = ramp(frame, k.letterUp - 6, k.letterUp + 6) * (1 - ramp(frame, k.falter + 6, k.falter + 24));
  // his near arm holds the letter up the way you held yours; his far fist comes half up in the hold, then sinks
  const fist = ramp(frame, k.fist[0], k.fist[1]) * (1 - ramp(frame, k.falter + 4, k.falter + 22));
  body.pose = { ...STAND, armF: mixArm(STAND.armF, aimArm(body, { x: MJ_X + 80, y: FLOOR - 270 }), up), armB: mixArm(STAND.armB, [128, 84], fist) };
  const me: Body = { x: ME_X, y: FLOOR, scale: S, facing: -1, pose: STAND };
  const actors = (
    <>
      {showHim && open > 0.3 && <MinJun body={body} face={mj} frame={frame} letter={1} />}
      {showYou && <You body={me} face={you} frame={frame} />}
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<HomeBack cam={cam} mood="morning" frame={frame} door={open} />} actors={actors} />;
};

/** The end card's tableau: the two of you at the fridge, small, in the left third. */
const Tableau: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = camAt(frame, [[k.card, { x: 1960, y: 545, zoom: 1.0 }], [k.end, { x: 1930, y: 555, zoom: 1.04 }]]);
  const her: Body = { x: HER_TAPE + 30, y: FLOOR, scale: S, facing: -1, pose: { ...STAND, lean: 4 } };
  const me: Body = { x: YOU_IN - 60, y: FLOOR, scale: S, facing: -1, pose: STAND };
  const actors = (
    <>
      <Sister body={her} face={{ brows: "none", lids: 0.3, mouth: "smile", eyes: 1, look: { x: 1, y: -0.1 } }} frame={frame} duty="off" />
      <You body={me} face={{ brows: "none", lids: 0.2, mouth: "smile", eyes: 1, look: { x: 1, y: -0.1 } }} frame={frame} />
    </>
  );
  return (
    <AbsoluteFill>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} actors={actors}
        back={<HomeBack cam={cam} mood="morning" frame={frame} calendar={false} yours={{ ...HOME.beside, tapes: 2 }} />} />
      <EndTags frame={frame} comment={k.comment} like={k.like} subscribe={k.subscribe} />
    </AbsoluteFill>
  );
};

const TwoShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.start, "wide"], [k.unpinShot, "unpin"], [k.hold5, "reveal"], [k.smooth[0], "smooth"],
    [k.tape[0], "tape"], [k.flat[0], "flat"], [k.glance, "glance"], [k.jar5, "jar5"], [k.two, "two"], [k.closer, "closer"],
    [k.her104, "her104"], [k.jar104, "jar104"], [k.door, "door"], [k.mj1, "mj1"], [k.youA, "youA"], [k.mjClose, "mj"], [k.you4, "you4"], [k.card, "card"]]);
  if (shot === "card") return <Tableau frame={frame} k={k} />;
  const herTape = headAt(HER_TAPE, FLOOR, S, { ...STAND, lean: 8 }, -1);
  const cams: Record<Exclude<typeof shot, "card">, Camera> = {
    wide: camAt(frame, [[k.start, { x: 1460, y: 580, zoom: 1.1 }], [k.unpinShot, { x: 1440, y: 590, zoom: 1.2 }]]),
    unpin: camAt(frame, [[k.unpinShot, { x: 1360, y: 640, zoom: 2.0 }], [k.hold5, { x: 1370, y: 650, zoom: 2.2 }]]),
    reveal: camAt(frame, [[k.hold5, insert(HOME.hers.x - 10, HOME.hers.y - 50, 4.6)], [k.smooth[0], insert(HOME.hers.x - 10, HOME.hers.y - 50, 5.0)]]),
    smooth: camAt(frame, [[k.smooth[0], insert(HOME.hers.x - 30, HOME.hers.y - 50, 3.6)], [k.tape[0], insert(HOME.hers.x - 40, HOME.hers.y - 50, 3.4)]]),
    tape: camAt(frame, [[k.tape[0], { x: 1320, y: 690, zoom: 2.9 }], [k.flat[0], { x: 1320, y: 700, zoom: 3.1 }]]),
    flat: camAt(frame, [[k.flat[0], insert(BETWEEN.x, BETWEEN.y - 20, 3.6)], [k.glance, insert(BETWEEN.x, BETWEEN.y - 20, 3.9)]]),
    glance: camAt(frame, [[k.glance, { x: 1600, y: 610, zoom: 1.75 }], [k.jar5, { x: 1600, y: 610, zoom: 1.85 }]]),
    jar5: camAt(frame, [[k.jar5, insert(HOME.jar.x + 30, 540, 3.1)], [k.two, insert(HOME.jar.x + 30, 535, 3.3)]]),
    two: camAt(frame, [[k.two, { x: 1560, y: 620, zoom: 1.5 }], [k.closer, { x: 1560, y: 620, zoom: 1.6 }]]),
    closer: camAt(frame, [[k.closer, { x: 1530, y: 610, zoom: 2.0 }], [k.her104, { x: 1530, y: 610, zoom: 2.15 }]]),
    her104: camAt(frame, [[k.her104, closeUp(herTape.x - 60, herTape.y, 2.6)], [k.jar104, closeUp(herTape.x - 60, herTape.y, 2.85)]]),
    jar104: camAt(frame, [[k.jar104, insert(HOME.jar.x + 30, 540, 3.0)], [k.door, insert(HOME.jar.x + 30, 530, 3.3)]]),
    door: camAt(frame, [[k.door, { x: 470, y: 600, zoom: 1.45 }], [k.mj1, { x: 455, y: 600, zoom: 1.55 }]]),
    mj1: camAt(frame, [[k.mj1, closeUp(MJ_HEAD.x + 90, MJ_HEAD.y + 10, 2.0)], [k.youA, closeUp(MJ_HEAD.x + 90, MJ_HEAD.y + 10, 2.15)]]),
    youA: camAt(frame, [[k.youA, closeUp(ME_HEAD.x + 60, ME_HEAD.y - 10, 2.4)], [k.mjClose, closeUp(ME_HEAD.x + 60, ME_HEAD.y - 10, 2.55)]]),
    mj: camAt(frame, [[k.mjClose, closeUp(MJ_HEAD.x + 70, MJ_HEAD.y - 10, 2.4)], [k.you4, closeUp(MJ_HEAD.x + 70, MJ_HEAD.y - 10, 2.85)]]),
    you4: camAt(frame, [[k.you4, closeUp(ME_HEAD.x + 60, ME_HEAD.y - 10, 2.7)], [k.card, closeUp(ME_HEAD.x + 60, ME_HEAD.y - 10, 2.95)]]),
  };
  const cam = drift(cams[shot], frame, "twoletters", 3);
  if (shot === "door" || shot === "mj1" || shot === "youA" || shot === "mj" || shot === "you4") {
    // Him: grinning, his letter up, "I got in!"; the grin and the fist in the hold; the snap; the grin falters.
    const mj: Face = frame < k.fist[0]
      ? { brows: "raised", lids: 0, mouth: talk(frame, k.says[0], k.says[1], "smile"), eyes: 1.1, look: { x: 1, y: 0 } }
      : frame < k.falter
        ? { brows: "raised", lids: 0, mouth: "smile", eyes: 1.15, look: { x: 1, y: 0 } }
        : frame < k.falter + 12
          ? { brows: "none", lids: 0, mouth: "flat", eyes: 1.1, look: { x: 1, y: 0 } }
          : { brows: "worry", lids: 0.1, mouth: "flat", eyes: 1.15, look: { x: 1, y: 0.05 } };
    // You: smiling at him; then your eyes start to lift toward the snap above you, and stop on his.
    const lift = ramp(frame, k.lift4[0], k.lift4[1]) * (1 - ramp(frame, k.stop4[0], k.stop4[1]));
    const you: Face = frame < k.snap
      ? { brows: "raised", lids: 0, mouth: "smile", eyes: 1.05, look: { x: 1, y: 0 } }
      : { brows: lift > 0.2 ? "raised" : "worry", lids: 0.05, mouth: "flat", eyes: 1.1, look: { x: 1 - 0.5 * lift, y: -0.9 * lift } };
    return <Door frame={frame} k={k} cam={cam} mj={mj} you={you} showYou={shot !== "mj" && shot !== "mj1"} showHim={shot !== "you4" && shot !== "youA"} />;
  }
  // Her: at the fridge; her mouth opens to ask and closes; the half-second glance; looking at the jar.
  const asking = frame >= k.ask[0] && frame < k.ask[1];
  const looking = (frame >= k.glance && frame < k.jar5) || (frame >= k.pause[0] && frame < k.pause[1]);
  const her: Face = asking
    ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.05, look: { x: -1, y: 0 } }
    : looking
      ? { brows: "raised", lids: 0.1, mouth: "flat", eyes: 1, look: { x: -1, y: 0 } }
      : frame >= k.her104
        ? { brows: "none", lids: 0.3, mouth: "smile", eyes: 1, look: { x: 1, y: 0.2 } }
        : { brows: "none", lids: 0.25, mouth: frame >= k.flat[0] ? "smile" : "flat", eyes: 1, look: { x: 1, y: 0.05 } };
  const you: Face = frame < k.two
    ? { brows: "worry", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 1, y: 0.05 } }
    : { brows: "none", lids: 0.25, mouth: "smile", eyes: 1, look: { x: 1, y: 0.1 } };
  return <Kitchen frame={frame} k={k} cam={cam} you={you} her={her} />;
};

const TwoLetters: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = times(shot.clips, shot.from, shot.to);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <TwoShot frame={shot.frame} k={k} />
      <MeterSound at={k.snap} volume={0.5} />
    </AbsoluteFill>
  );
};

export const twoLetters: Beat = { id: "TwoLetters", firstLine: 128, Component: TwoLetters };

