// Beat "The Key" (script.md, ## [07:57] The Key; narration lines 84-89). THE PEAK. Opens on the thumbnail's frame
// exactly (TheKey.Frame.tsx copies brand/thumbs/predict's geometry): the counter at closing, one lamp, you large at the
// left with the key on your open palm, the tin box between you, your best friend at the right with a hand flat on the
// lid, the crimson 94% card over his head on a thread from the teal lamp.
//
//   84    "Ninety-four.": the thumbnail's frame, the slowest drift in
//   PEAK  the 10 s wordless peak (PEAK_FRAMES): his card flaps 94, 96, 98, deeper crimson each flap, the only sounds;
//         every face in the dark court turns toward you one after another while every other card stays as it was;
//         his face and the card; your open hand and the key with the faces turning behind it; a slow drift in on his
//         hand on the lid, which does not move; his eyes coming up from the key to your face with a slow ghost
//   +     your bubble "Why are you scared?"; his mouth opens; his card flaps and flaps and stops BLANK with no sound
//         at all (the first silence); he looks up at it, you don't
//   85    insert: the blank card under the teal lamp
//   86    "I was going to." (his voice); then the hands insert: his hand comes off the lid and closes over the key on
//         your palm, and stays; his eyes shut once
//   87    "Someone's at my sister's. Tonight." (his voice, close, his arm still out to your hand)
//   +     he takes the key, unlocks the box, lifts the lid, takes nothing, pushes the open box across to you and lets
//         go; both cards buzz crimson together: UNPREDICTABLE
//   88    the coffee seller lowers her phone; you, not looking up; the two of you under two crimson cards
//   89    the high wide of the court (sets/FoodCourt): two crimson cards under one lamp, every face turned to them,
//         every other card still teal
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import { setLook, REF } from "@whatif/kit/sets/common";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { Tag, TagSounds, type TagKey } from "../device";
import { aimArm, Bubble, headAt, lineAt } from "../kit";
import { blinking, camAt, COFFEE, current, FRIEND, HERO, lineEnd, mix, PASTELS, ramp, type Beat, type Shot } from "../shared";
import { CashBox, COURT, FoodCourtBack, foodCourtLights, StallCounter, StallLamp } from "../sets/FoodCourt";
import {
  BOX, BrassKey, CARD_AT, COUNTER_TOP, type Face, Him, HIM, HIS_HEAD, KEY_AT, KeyBack, KeyBox, KeyCard, KeyCounter, LAMP, LEAN, OFFER,
  PALM, You, YOUR_HEAD,
} from "./TheKey.Frame";
import { CounterClose, Hands } from "./TheKey.Hands";
import { HandPhone } from "@whatif/kit/sets/props";

/** The wordless peak's length: ten seconds after "Ninety-four." */
export const PEAK_LEN = 300;
/** The peak's first and last frame in the whole film, from a timeline's clips (the score drops to a floor between). */
export const peakWindow = (clips: Clip[]) => ({ from: lineEnd(clips, 84), to: lineEnd(clips, 84) + PEAK_LEN });
/** The peak in whole-film frames for the narration this beat was built on (assets/narration/props.json, 30 fps). The
 *  score's floor (sound.ts PEAK, in seconds) is from / 30 to to / 30. peakWindow() recomputes it from any timeline. */
export const PEAK_FRAMES = { from: 14109, to: 14409 } as const;

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  const end = (i: number) => lineEnd(clips, i);
  const peak = end(84);
  const ask = peak + PEAK_LEN;
  const hold86 = end(86);
  const hold87 = end(87);
  return {
    start: from(84), // "Ninety-four.": the thumbnail's frame
    peak, // the wordless peak starts
    sFace: peak + 75, // his face and the card
    flap96: peak + 92,
    sHand: peak + 140, // your open hand, the key, the faces turning behind
    sLid: peak + 188, // a slow drift in on his hand on the lid
    sEyes: peak + 240, // his eyes come up from the key to your face, a slow ghost
    flap98: peak + 262,
    ask, // the bubble: "Why are you scared?"
    mouth: ask + 12, // his mouth opens
    flaps: [ask + 26, ask + 36, ask + 46, ask + 56], // his card flaps and flaps and flaps (no sound)
    blank: ask + 66, // and stops, and shows nothing
    up: ask + 80, // he looks up at it; you don't
    l85: from(85), // "The first blank card the city has ever made."
    l86: from(86), // "I was going to." (his voice)
    hold86, // the hands: his hand comes off the lid and closes over the key on your palm
    shut: hold86 + 58, // his face: his eyes shut once
    l87: from(87), // "Someone's at my sister's. Tonight." (his voice)
    hold87, // he takes the key
    box: hold87 + 20, // unlocks the box, lifts the lid, takes nothing, pushes it across
    lid: hold87 + 36,
    push: hold87 + 60,
    both: hold87 + 86, // the two-shot
    unpred: hold87 + 94, // both cards buzz crimson: UNPREDICTABLE
    coffee: from(88) + 18, // the coffee seller lowers her phone
    you88: at(88, 0.5), // you, not looking up
    two88: at(88, 0.78),
    wide: from(89), // the high wide of the court
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ the counter

const LOOK = (cam: Camera) => setLook([{ x: LAMP.x, y: LAMP.y + 40, r: 520, color: "#ffcf7a", strength: 0.55, moods: ["lamp"] },
  { x: CARD_AT.x, y: 0, r: 260, color: "#1d9a8f", strength: 0.3, moods: ["lamp"] }], "lamp", cam);

/** His card from the thumbnail: 94, then 96 and 98 deeper each flap, then the silent flaps to blank. */
const cardKeys = (k: T) => [
  { at: k.start - 400, text: "94%", deep: 0 },
  { at: k.flap96, text: "96%", deep: 1 },
  { at: k.flap98, text: "98%", deep: 2 },
  { at: k.flaps[0], text: "61%", deep: 1 },
  { at: k.flaps[1], text: "33%", deep: 0 },
  { at: k.flaps[2], text: "12%", deep: 0 },
  { at: k.flaps[3], text: "4%", deep: 0 },
  { at: k.blank, text: null, deep: 0 },
];

/** The two cards from UNPREDICTABLE on: the device's tag, flipping from what each was to crimson with no digits. */
const hisTag = (k: T): TagKey[] => [
  { at: k.unpred - 80, text: "", pct: null, state: "blank" },
  { at: k.unpred, text: "UNPREDICTABLE", pct: null, state: "crimson" },
];
const yourTag = (k: T): TagKey[] => [
  { at: k.unpred - 80, text: "POCKETS KEY", pct: 97, state: "tick" },
  { at: k.unpred, text: "UNPREDICTABLE", pct: null, state: "crimson" },
];

/** His pose through the beat: the thumbnail's lean, then the arm out to your hand, then leaning in to the lock, the
 *  lid, the push, and letting go. */
function hisPose(frame: number, k: T): Pose {
  if (frame < k.l87) return LEAN;
  if (frame < k.box) {
    const b = { x: HIM.x, y: HIM.y, scale: HIM.scale, facing: -1 as const, pose: LEAN };
    return { ...LEAN, lean: 16, armF: aimArm({ ...b, pose: { ...LEAN, lean: 16 } }, PALM) };
  }
  const lean = mix(16, 24, ramp(frame, k.box, k.box + 10));
  const p: Pose = { ...LEAN, lean, tilt: 8 };
  const top = COUNTER_TOP - BOX.h;
  const bx = boxX(frame, k);
  let target = { x: bx, y: top + BOX.h * 0.3 + 25 }; // the lock
  if (frame >= k.lid) target = { x: mix(bx, bx - 30, ramp(frame, k.lid, k.lid + 14)), y: mix(top + 50, top - 110, ramp(frame, k.lid, k.lid + 14)) };
  if (frame >= k.lid + 16) target = { x: bx - 10, y: top - 40 }; // over the open box: takes nothing
  if (frame >= k.push - 6) target = { x: bx + BOX.w / 2 + 12, y: top + 40 }; // at the box's side, pushing
  if (frame >= k.push + 26) target = { x: mix(bx + BOX.w / 2 + 12, bx + BOX.w / 2 + 120, ramp(frame, k.push + 26, k.push + 40)), y: mix(top + 40, top + 90, ramp(frame, k.push + 26, k.push + 40)) };
  const b = { x: HIM.x, y: HIM.y, scale: HIM.scale, facing: -1 as const, pose: p };
  return { ...p, armF: aimArm(b, target) };
}

/** The box slides from its place to your hand on the push. */
const boxX = (frame: number, k: T) => mix(BOX.x, BOX.x - 100, ramp(frame, k.push, k.push + 24));
const lidOpen = (frame: number, k: T) => ramp(frame, k.lid, k.lid + 14);

/** Your face through the beat. */
function yourFace(frame: number, k: T): Face {
  if (frame < k.peak + 40) return { brows: "raised", lids: 0, mouth: "o", eyes: 1.3, look: { x: 1, y: 0.15 } };
  if (frame < k.ask) return { brows: "worry", lids: 0.1, mouth: "flat", eyes: 1.15, look: { x: 1, y: 0.05 } };
  if (frame < k.l86) return { brows: "worry", lids: 0.1, mouth: frame < k.ask + 20 ? "open" : "flat", eyes: 1.1, look: { x: 1, y: 0.05 } };
  if (frame < k.box) return { brows: "sad", lids: 0.25, mouth: "flat", eyes: 1, look: { x: 1, y: 0.1 } };
  if (frame < k.unpred) return { brows: "raised", lids: 0, mouth: "o", eyes: 1.15, look: { x: 1, y: 0.35 } };
  return { brows: "worry", lids: 0.2, mouth: frame > k.two88 ? "smile" : "flat", eyes: 1, look: { x: 1, y: 0.05 } };
}

/** Speaking: the mouth opens and shuts while his line plays (no lip-sync). */
const talking = (frame: number, from: number, until: number) => frame >= from && frame < until && Math.floor((frame - from) / 5) % 2 === 0;

/** His face through the beat; `ghost` is where his eyes were a moment ago while they rise. */
function hisFace(frame: number, k: T, clips: Clip[]): { face: Face; ghost?: Face } {
  const rise = (f: number) => ramp(f, k.sEyes + 8, k.sEyes + 56);
  if (frame < k.sEyes) return { face: { brows: "worry", lids: 0.3, mouth: "frown", eyes: 1.05, look: { x: 0.7, y: 0.8 } } };
  if (frame < k.ask) {
    const look = (f: number) => ({ x: mix(0.7, 1, rise(f)), y: mix(0.8, -0.1, rise(f)) });
    const face: Face = { brows: "worry", lids: mix(0.3, 0.1, rise(frame)), mouth: "frown", eyes: 1.08, look: look(frame) };
    const moving = rise(frame) > 0 && rise(frame) < 1;
    return { face, ghost: moving ? { look: look(frame - 12) } : undefined };
  }
  if (frame < k.up) return { face: { brows: "worry", lids: 0.05, mouth: frame >= k.mouth ? "o" : "frown", eyes: 1.1, look: { x: 1, y: -0.1 } } };
  if (frame < k.l86) return { face: { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.25, y: -1 } } };
  if (frame < k.l87) {
    const shut = frame >= k.shut + 10 && frame < k.shut + 26;
    return { face: { brows: "sad", lids: shut ? 1 : 0.4, mouth: talking(frame, k.l86, lineEnd(clips, 86)) ? "open" : "frown", eyes: 1, look: { x: 0.8, y: 0.7 } } };
  }
  if (frame < k.box) return { face: { brows: "sad", lids: 0.3, mouth: talking(frame, k.l87, k.hold87) ? "open" : "frown", eyes: 1, look: { x: 1, y: 0 } } };
  if (frame < k.unpred) return { face: { brows: "worry", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 0.6, y: 0.7 } } };
  return { face: { brows: "sad", lids: 0.35, mouth: frame > k.two88 ? "smile" : "flat", eyes: 1, look: { x: 1, y: 0 } } };
}

/** The counter world (the thumbnail's frame) with everyone in it at `frame`, through `cam`. */
const Counter: React.FC<{ frame: number; k: T; cam: Camera; clips: Clip[]; bubble?: boolean }> = ({ frame, k, cam, clips, bubble }) => {
  const pose = hisPose(frame, k);
  const { face, ghost } = hisFace(frame, k, clips);
  const holdsKey = frame >= k.hold87 && frame < k.push - 6;
  const held = holdsKey ? <BrassKey x={0} y={0} scale={0.36} rotate={20} glint={0} /> : undefined;
  const yourPose: Pose = frame >= k.box ? { ...OFFER, armF: [80, -2] } : OFFER;
  const actors = (
    <>
      <Him frame={frame} face={face} ghost={ghost} pose={pose} held={held} />
      {frame < k.unpred && <KeyCard frame={frame} keys={cardKeys(k)} />}
      {frame >= k.unpred - 2 && <Tag frame={frame} x={HIS_HEAD.x} headY={HIS_HEAD.y} r={HIS_HEAD.r} scale={0.75} keys={hisTag(k)} />}
      {frame >= k.both && <Tag frame={frame} x={YOUR_HEAD.x} headY={YOUR_HEAD.y} r={YOUR_HEAD.r} scale={0.55} keys={yourTag(k)} />}
      <KeyCounter />
      <KeyBox x={boxX(frame, k)} open={lidOpen(frame, k)} />
      <You frame={frame} face={yourFace(frame, k)} pose={yourPose} showKey={frame < k.hold87} />
      {bubble && <Bubble frame={frame} at={k.ask} until={k.up} x={YOUR_HEAD.x + 150} y={YOUR_HEAD.y - 190} text="Why are you scared?" size={52} side="right" />}
    </>
  );
  return (
    <LookContext.Provider value={LOOK(cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<KeyBack cam={cam} frame={frame} peak={k.peak} lower={k.coffee + 4} />} actors={actors} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ the inserts

/** The hands, close: his hand comes off the lid and closes over the key on your palm, and stays (86); then takes the
 *  key and goes (87). */
const HandsShot: React.FC<{ frame: number; k: T; take: boolean }> = ({ frame, k, take }) => {
  const t0 = take ? k.hold87 : k.hold86;
  const cam = drift(camAt(frame, [[t0, { x: 960, y: 600, zoom: 1.0 }], [t0 + 60, { x: 930, y: 620, zoom: 1.12 }]]), frame, "hands", 3);
  const you = { x: 760, y: 720, curl: 0.05 };
  let him = null as null | { x: number; y: number; curl: number; down: boolean };
  let key = { x: 800, y: 690, rotate: -14 };
  if (!take) {
    const come = ramp(frame, t0 + 2, t0 + 24);
    him = { x: mix(1700, 950, come), y: mix(560, 690, come), curl: ramp(frame, t0 + 24, t0 + 40) * 0.8, down: true };
    you.curl = ramp(frame, t0 + 30, t0 + 46) * 0.35;
  } else {
    const go = ramp(frame, t0 + 4, t0 + 20);
    him = { x: mix(950, 1260, go), y: mix(690, 560, go), curl: 0.8, down: true };
    you.curl = mix(0.35, 0, go);
    key = { x: him.x - 70, y: him.y + 40, rotate: 20 };
  }
  return (
    <LookContext.Provider value={LOOK(cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<CounterClose />} actors={<Hands you={you} him={him} keyAt={key} />} />
    </LookContext.Provider>
  );
};

/** The coffee seller, close at the edge of the dark court, lowering her phone. */
const CoffeeShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.coffee - 18, { x: 1300, y: 640, zoom: 1.3 }], [k.you88, { x: 1290, y: 650, zoom: 1.38 }]]), frame, "coffee", 3);
  const t = ramp(frame, k.coffee + 4, k.coffee + 22);
  const s = 2.6;
  const x = 1300, y = 1500;
  const pose: Pose = { ...STAND, armF: [mix(150, 40, t), mix(30, 30, t)], armB: [mix(140, 20, t), 40] };
  const h = headAt(x, y, s, pose, -1);
  const actors = (
    <>
      <Figure x={x} y={y} scale={s} facing={-1} pose={pose} head={COFFEE.head} coat={COFFEE.coat} time={frame}
        brows={t > 0.4 ? "raised" : "flat"} lids={t > 0.4 ? 0.1 : 0.35} mouth={t > 0.4 ? "flat" : "flat"} eyes={t > 0.4 ? 1.15 : 1}
        look={{ x: 1, y: mix(0.3, 0, t) }} blink={blinking(frame, 9)} held={<g transform="scale(1.6)"><HandPhone lit /></g>} />
      <path d={`M${h.x - h.r * 0.9} ${h.y - h.r * 0.55} Q${h.x} ${h.y - h.r * 1.45} ${h.x + h.r * 0.9} ${h.y - h.r * 0.55} Z`} fill={COFFEE.cap}
        stroke="#23252b" strokeWidth={6} />
      <Tag frame={frame} x={h.x} headY={h.y} r={h.r} scale={0.6} keys={[{ at: k.start - 400, text: "FILMS", pct: 95, state: "tick" }]} />
    </>
  );
  return (
    <LookContext.Provider value={LOOK(cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<KeyBack cam={cam} frame={frame} peak={k.peak} lower={k.coffee + 4} />} actors={actors} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ the wide

/** Faces in the dark court for the wide, each under its own teal card, every one turned toward the stall. */
const CROWD = [
  { x: -520, s: 1.5, text: "GOES HOME" }, { x: -250, s: 1.6, text: "SWEEPS" }, { x: 20, s: 1.55, text: "STACKS CHAIRS" },
  { x: 2050, s: 1.6, text: "LOCKS UP" }, { x: 2330, s: 1.5, text: "WALKS OUT" }, { x: 2600, s: 1.45, text: "CHECKS PHONE" },
];

const WideShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.wide, { x: 980, y: 380, zoom: 0.6 }], [k.end, { x: 900, y: 470, zoom: 0.7 }]]), frame, "key-wide", 2);
  const S = COURT.scale;
  const you = { x: COURT.you.x, y: COURT.floor };
  const him = { x: COURT.friend.x, y: COURT.floor };
  const yh = headAt(you.x, you.y, S, STAND, 1);
  const hh = headAt(him.x, him.y, S, STAND, -1);
  const coffeeHead = headAt(COURT.coffee.seller.x, COURT.coffee.seller.y, S, STAND, -1);
  const still = (text: string, pct: number): TagKey[] => [{ at: k.start - 400, text, pct, state: "tick" }];
  const actors = (
    <>
      <StallLamp />
      <Figure x={you.x} y={you.y} scale={S} facing={1} pose={STAND} {...HERO} brows="worry" lids={0.2} mouth="flat" look={{ x: 1, y: 0 }} time={frame} blink={blinking(frame, 1)} />
      <Figure x={him.x} y={him.y} scale={S} facing={-1} pose={STAND} head={FRIEND.head} coat={FRIEND.coat} brows="sad" lids={0.35} mouth="flat" look={{ x: 1, y: 0 }} time={frame} blink={blinking(frame, 2)} />
      <StallCounter box={false} />
      <CashBox x={COURT.box.x - 90} y={COURT.counter.top} open={1} />
      <Figure x={COURT.coffee.seller.x} y={COURT.coffee.seller.y} scale={S} facing={-1} pose={{ ...STAND, armF: [30, 30] }} head={COFFEE.head} coat={COFFEE.coat}
        brows="raised" mouth="flat" eyes={1.1} look={{ x: 1, y: 0 }} time={frame} held={<HandPhone lit={false} />} />
      <Tag frame={frame} x={coffeeHead.x} headY={coffeeHead.y} r={coffeeHead.r} scale={0.8} keys={still("FILMS", 95)} />
      {CROWD.map((c, i) => {
        const facing: 1 | -1 = c.x < 800 ? 1 : -1;
        const h = headAt(c.x, COURT.floor + 20, c.s, STAND, facing);
        return (
          <g key={i}>
            <Figure x={c.x} y={COURT.floor + 20} scale={c.s} facing={facing} pose={STAND} head={PASTELS[(i * 3) % PASTELS.length]} coat={i % 2 ? "#2a2d36" : "#3b4a6b"}
              brows="raised" mouth="flat" eyes={1.1} look={{ x: 1, y: 0.1 }} time={frame} blink={blinking(frame, i + 4)} />
            <Tag frame={frame} x={h.x} headY={h.y} r={h.r} scale={0.9} keys={still(c.text, 90 + ((i * 7) % 9))} />
          </g>
        );
      })}
      <Tag frame={frame} x={yh.x} headY={yh.y} r={yh.r} scale={0.85} keys={[{ at: k.start - 400, text: "UNPREDICTABLE", pct: null, state: "crimson" }]} />
      <Tag frame={frame} x={hh.x} headY={hh.y} r={hh.r} scale={0.85} keys={[{ at: k.start - 400, text: "UNPREDICTABLE", pct: null, state: "crimson" }]} />
    </>
  );
  return (
    <LookContext.Provider value={setLook(foodCourtLights, "lamp", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<FoodCourtBack cam={cam} mood="lamp" frame={frame} diners={false} />} actors={actors} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ the beat

type ShotName = "thumb" | "face" | "hand" | "lid" | "eyes" | "ask" | "up" | "card" | "him86" | "hands86" | "shut" | "him87" | "take"
  | "box" | "both" | "coffee" | "you88" | "two88" | "wide";

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const on = current<ShotName>(frame, [[0, "thumb"], [k.sFace, "face"], [k.sHand, "hand"], [k.sLid, "lid"], [k.sEyes, "eyes"], [k.ask, "ask"],
    [k.up, "up"], [k.l85, "card"], [k.l86, "him86"], [k.hold86, "hands86"], [k.shut, "shut"], [k.l87, "him87"], [k.hold87, "take"],
    [k.box, "box"], [k.both, "both"], [k.coffee - 18, "coffee"], [k.you88, "you88"], [k.two88, "two88"], [k.wide, "wide"]]);
  const H = HIS_HEAD;
  const cams: Partial<Record<ShotName, Camera>> = {
    thumb: camAt(frame, [[k.start, REF], [k.sFace, { x: 975, y: 545, zoom: 1.06 }]]),
    face: camAt(frame, [[k.sFace, { x: 1530, y: 545, zoom: 1.9 }], [k.sHand, { x: 1525, y: 548, zoom: 2.02 }]]),
    hand: camAt(frame, [[k.sHand, insert(KEY_AT.x + 40, KEY_AT.y - 130, 2.3)], [k.sLid, insert(KEY_AT.x + 90, KEY_AT.y - 130, 2.4)]]),
    lid: camAt(frame, [[k.sLid, insert(BOX.x + 60, COUNTER_TOP - 120, 2.6)], [k.sEyes, insert(BOX.x + 60, COUNTER_TOP - 110, 3.1)]]),
    eyes: camAt(frame, [[k.sEyes, { x: 1515, y: 560, zoom: 2.25 }], [k.ask, { x: 1515, y: 555, zoom: 2.45 }]]),
    ask: camAt(frame, [[k.ask, { x: 975, y: 540, zoom: 1.02 }], [k.up, { x: 985, y: 535, zoom: 1.06 }]]),
    up: camAt(frame, [[k.up, { x: 1530, y: 545, zoom: 2.0 }], [k.l85, { x: 1530, y: 535, zoom: 2.1 }]]),
    card: camAt(frame, [[k.l85, insert(CARD_AT.x, CARD_AT.y - 40, 3.0)], [k.l86, insert(CARD_AT.x, CARD_AT.y - 40, 3.5)]]),
    him86: camAt(frame, [[k.l86, closeUp(H.x - 30, H.y - 10, 2.5)], [k.hold86, closeUp(H.x - 30, H.y - 10, 2.6)]]),
    shut: camAt(frame, [[k.shut, closeUp(H.x - 20, H.y, 2.8)], [k.l87, closeUp(H.x - 20, H.y, 2.95)]]),
    him87: camAt(frame, [[k.l87, closeUp(H.x + 10, H.y, 2.8)], [k.hold87, closeUp(H.x + 10, H.y + 5, 3.0)]]),
    box: camAt(frame, [[k.box, { x: 1120, y: 760, zoom: 1.6 }], [k.both, { x: 1080, y: 770, zoom: 1.72 }]]),
    both: camAt(frame, [[k.both, { x: 975, y: 540, zoom: 1.0 }], [k.coffee - 18, { x: 975, y: 535, zoom: 1.05 }]]),
    you88: camAt(frame, [[k.you88, { x: 540, y: 575, zoom: 1.8 }], [k.two88, { x: 540, y: 575, zoom: 1.92 }]]),
    two88: camAt(frame, [[k.two88, { x: 990, y: 560, zoom: 1.0 }], [k.wide, { x: 990, y: 560, zoom: 1.08 }]]),
  };
  let picture: React.ReactNode;
  if (on === "hands86" || on === "take") picture = <HandsShot frame={frame} k={k} take={on === "take"} />;
  else if (on === "coffee") picture = <CoffeeShot frame={frame} k={k} />;
  else if (on === "wide") picture = <WideShot frame={frame} k={k} />;
  else picture = <Counter frame={frame} k={k} cam={drift(cams[on] ?? REF, frame, `key-${on}`, on === "thumb" ? 1.5 : 3)} clips={clips} bubble={on === "ask"} />;
  const flap = (at: number) => (
    <Sequence from={at} durationInFrames={24}><Audio src={staticFile("sfx/flap.wav")} volume={0.85} /></Sequence>
  );
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      {/* the only sounds of the peak: his card's two flaps upward. The flaps to blank make none at all. */}
      {flap(k.flap96)}
      {flap(k.flap98)}
      <TagSounds keys={hisTag(k).slice(1)} volume={0.8} />
      <TagSounds keys={yourTag(k).slice(1)} volume={0.6} />
    </AbsoluteFill>
  );
};


export const theKey: Beat = { id: "theKey", firstLine: 84, Component: Scene };
