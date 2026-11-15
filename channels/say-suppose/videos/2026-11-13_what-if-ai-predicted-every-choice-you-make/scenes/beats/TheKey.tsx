// Beat "The Key" (script.md v2, ## [07:30] The Key; narration lines 86-91). THE PEAK, A TRIUMPH. Opens on the
// thumbnail's frame exactly (TheKey.Frame.tsx copies brand/thumbs/predict's geometry, K17): the counter at closing, one
// lamp, you large at the left, SHOCKED (brows up, mouth a small O, eyes hard right at him), the brass key drawn large
// on your open palm; the tin box between you; your best friend at the right, stunned, his eyes coming UP from the key
// to your face, never ashamed; the crimson 94% card over his head on a thread from the teal lamp.
//
//   86    "Ninety-four.": the thumbnail's frame, the slowest drift in, his eyes coming up
//   PEAK  the 10 s wordless hold (PEAK_FRAMES): his card clatters 94, 96, 98, deeper crimson each flap, the only sounds;
//         his face and the card; the court from behind you, every face turning toward the two of you one after
//         another while every other card stays as it was; your open hand and the key; a slow drift in on his hand on
//         the lid, which does not move; his eyes finishing their rise to your face, with a slow ghost
//   +     your bubble "Trust me?" (a grin); his mouth opens; his card flaps, flaps, flaps, stops BLANK, with no sound
//         at all (the first silence); he looks up at it, you don't
//   87    insert: the blank card under the teal lamp
//   88    "I was going to." (his voice), close, a grin breaking
//   +     the 4 s hold: his hand takes the key off your palm (hands insert); he unlocks the box, lifts the lid (the
//         hinge creak), takes nothing, pushes the open box across to you (coins shifting) and lets go; both cards buzz
//         crimson together: UNPREDICTABLE; the coffee seller's phone slips and clatters on her counter; the kid with
//         the cap is up on his chair at the last lit table
//   89    "Do it again." (the kid's voice), on his chair, arms up
//   90    the two of you grinning under two crimson cards; his card close
//   91    the high wide of the court (TheKey.Court): two crimson cards under one lamp, every face turned to them, every
//         other card teal; on the pillar the city's board flaps down for the first time: CITY SCORE 99.4
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { type Pose } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import { setLook, REF } from "@whatif/kit/sets/common";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { BoardSounds, Tag, TagSounds, type TagKey } from "../device";
import { aimArm, Bubble, lineAt } from "../kit";
import { camAt, current, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import {
  BOX, BrassKey, CARD_AT, COUNTER_TOP, type Face, Him, HIM, HIS_HEAD, KEY_AT, KeyBack, KeyBox, KeyCard, KeyCounter, LAMP, LEAN, OFFER,
  PALM, You, YOUR_HEAD,
} from "./TheKey.Frame";
import { CounterClose, Hands } from "./TheKey.Hands";
import { cityKeys, CourtWide, KidOnChair, PhoneSlip, talking, type CourtTimes } from "./TheKey.Court";

/** The wordless peak's length: ten seconds after "Ninety-four." */
export const PEAK_LEN = 300;
/** The peak's length after "Ninety-four." (line 86): 10 s unless the timeline left less room before line 87 (the
 *  bubble and the 4 s blank hold come after it). */
const peakLen = (clips: Clip[]) => Math.min(PEAK_LEN, Math.max(150, clips[87].from - lineEnd(clips, 86) - 120));
/** The peak's first and last frame in the whole film, computed from the timeline's clips (so a re-voice moves it). The
 *  score's floor (sound.ts PEAK, in seconds) is from / 30 to to / 30. */
export const PEAK_FRAMES = (clips: Clip[]) => ({ from: lineEnd(clips, 86), to: lineEnd(clips, 86) + peakLen(clips) });
export const peakWindow = PEAK_FRAMES;

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  const end = (i: number) => lineEnd(clips, i);
  const peak = end(86);
  const len = peakLen(clips);
  const P = (n: number) => peak + Math.round((n * len) / PEAK_LEN);
  const ask = peak + len;
  const hold88 = end(88);
  const span = Math.max(100, from(89) - hold88);
  const H = (p: number) => hold88 + Math.round(span * p);
  return {
    start: from(86), // "Ninety-four.": the thumbnail's frame
    peak, // the wordless peak starts
    sFace: P(60), // his face and the card
    flap96: P(80),
    sCourt: P(112), // the court from behind you: every face turning
    sHand: P(172), // your open hand, the key
    sLid: P(214), // a slow drift in on his hand on the lid
    sEyes: P(246), // his eyes come up from the key to your face, a slow ghost
    flap98: P(262),
    ask, // your bubble: "Trust me?"
    mouth: ask + 12, // his mouth opens
    flaps: [ask + 26, ask + 36, ask + 46, ask + 56], // his card flaps and flaps and flaps (no sound)
    blank: ask + 66, // and stops, and shows nothing
    up: ask + 80, // he looks up at it; you don't
    l87: from(87), // "The first blank card the city has ever made."
    l88: from(88), // "I was going to." (his voice)
    l88end: end(88),
    take: H(0), // the hands: he takes the key off your palm
    box: H(0.2), // the box close: the key in the lock
    lid: H(0.32), // the lid lifts: the hinge creak
    push: H(0.5), // takes nothing; pushes the open box across, coins shifting
    both: H(0.7), // the two-shot
    unpred: H(0.75), // both cards buzz crimson: UNPREDICTABLE
    slip: H(0.86), // the coffee seller, close
    drop: H(0.9), // her phone slips
    kidUp: H(0.55), // the kid is up on his chair (in the court behind)
    kid: from(89), // "Do it again."
    kidEnd: end(89),
    l90: from(90), // "You can't steal what you've just been handed."
    card90: at(90, 0.55), // "And the machine had no card for that."
    wide: end(90), // the high wide
    flapDown: at(91, 0.82), // "...the city's board flaps down."
    end: to,
  };
}

const courtTimes = (k: T): CourtTimes => ({ start: k.start, peak: k.peak, drop: k.drop, kidUp: k.kidUp, kid: k.kid, kidEnd: k.kidEnd,
  wide: k.wide, flapDown: k.flapDown, end: k.end });

// ------------------------------------------------------------------------------------------------ the counter

const LOOK = (cam: Camera) => setLook([{ x: LAMP.x, y: LAMP.y + 40, r: 520, color: "#ffcf7a", strength: 0.55, moods: ["lamp"] },
  { x: CARD_AT.x, y: 0, r: 260, color: "#1d9a8f", strength: 0.3, moods: ["lamp"] }], "lamp", cam);

/** His card from the thumbnail: 94, then 96 and 98 deeper each flap, then three silent flaps and blank. */
const cardKeys = (k: T) => [
  { at: k.start - 400, text: "94%", deep: 0 },
  { at: k.flap96, text: "96%", deep: 1 },
  { at: k.flap98, text: "98%", deep: 2 },
  ...k.flaps.map((at) => ({ at, text: "98%", deep: 2 })),
  { at: k.blank, text: null, deep: 0 },
];

/** The two cards from UNPREDICTABLE on: the device's tag, flipping from what each was to crimson with no digits. */
const hisTag = (k: T): TagKey[] => [
  { at: k.unpred - 80, text: "", pct: null, state: "blank" },
  { at: k.unpred, text: "UNPREDICTABLE", pct: null, state: "crimson" },
];
const yourTag = (k: T): TagKey[] => [
  { at: k.unpred - 80, text: "POCKETS KEY", pct: 97, state: "new" },
  { at: k.unpred, text: "UNPREDICTABLE", pct: null, state: "crimson" },
];

/** The box slides from its place toward your hand on the push. */
const boxX = (frame: number, k: T) => mix(BOX.x, BOX.x - 120, ramp(frame, k.push + 6, k.push + 22));
const lidOpen = (frame: number, k: T) => ramp(frame, k.lid, k.lid + 10);

/** His pose: the thumbnail's lean, then (from the box close) leaning in to the lock, the lid, the push, and letting go. */
function hisPose(frame: number, k: T): Pose {
  if (frame < k.box) return LEAN;
  const p: Pose = { ...LEAN, lean: mix(10, 22, ramp(frame, k.box, k.box + 8)), tilt: 8 };
  const top = COUNTER_TOP - BOX.h;
  const bx = boxX(frame, k);
  let target = { x: bx, y: top + BOX.h * 0.3 + 25 }; // the key in the lock
  if (frame >= k.lid) target = { x: mix(bx, bx - 30, lidOpen(frame, k)), y: mix(top + 50, top - 110, lidOpen(frame, k)) }; // lifts the lid
  if (frame >= k.lid + 12) target = { x: bx - 10, y: top - 40 }; // over the open box: takes nothing
  if (frame >= k.push) target = { x: bx + BOX.w / 2 + 12, y: top + 40 }; // at the box's side, pushing
  if (frame >= k.push + 24) {
    const go = ramp(frame, k.push + 24, k.push + 34); // lets go
    target = { x: mix(bx + BOX.w / 2 + 12, bx + BOX.w / 2 + 130, go), y: mix(top + 40, top + 100, go) };
  }
  return { ...p, armF: aimArm({ x: HIM.x, y: HIM.y, scale: HIM.scale, facing: -1, pose: p }, target) };
}

/** Your face: shocked (the thumbnail), steady through the peak, a grin on "Trust me?", watching him (never the card),
 *  shocked again as he opens the box, then the triumph. */
function yourFace(frame: number, k: T): Face {
  if (frame < k.peak + 40) return { brows: "raised", lids: 0, mouth: "o", eyes: 1.3, look: { x: 1, y: 0.15 } };
  if (frame < k.ask) return { brows: "raised", lids: 0, mouth: "flat", eyes: 1.2, look: { x: 1, y: 0.05 } };
  if (frame < k.up) return { brows: "raised", lids: 0, mouth: "smirk", eyes: 1.1, look: { x: 1, y: 0 } };
  if (frame < k.box) return { brows: "raised", lids: 0, mouth: "smile", eyes: 1.1, look: { x: 1, y: 0.05 } };
  if (frame < k.unpred) return { brows: "raised", lids: 0, mouth: "o", eyes: 1.25, look: { x: 1, y: 0.35 } };
  return { brows: "raised", lids: 0, mouth: "smile", eyes: 1.15, look: { x: 1, y: 0.05 } };
}

/** His face, stunned, never ashamed; `ghost` is where his eyes were a moment ago while they rise. */
function hisFace(frame: number, k: T): { face: Face; ghost?: Face } {
  const stunned = { brows: "raised" as const, lids: 0, mouth: "o" as const, eyes: 1.25 };
  if (frame < k.sEyes) {
    // the thumbnail: his eyes coming up from the key, not yet at your face
    const rise = ramp(frame, k.start + 4, k.sFace);
    return { face: { ...stunned, look: { x: mix(0.8, 0.95, rise), y: mix(0.65, 0.15, rise) } } };
  }
  if (frame < k.ask) {
    const rise = (f: number) => ramp(f, k.sEyes + 6, k.sEyes + 44);
    const look = (f: number) => ({ x: 0.95, y: mix(0.15, -0.2, rise(f)) });
    const moving = rise(frame) > 0 && rise(frame) < 1;
    return { face: { ...stunned, look: look(frame) }, ghost: moving ? { look: look(frame - 12) } : undefined };
  }
  if (frame < k.up) return { face: { ...stunned, mouth: frame >= k.mouth ? "open" : "o", look: { x: 0.95, y: -0.2 } } };
  if (frame < k.l88) return { face: { brows: "raised", lids: 0, mouth: "o", eyes: 1.3, look: { x: 0.25, y: -1 } } };
  if (frame < k.box) return { face: { brows: "raised", lids: 0, mouth: talking(frame, k.l88, k.l88end) ? "open" : "smile", eyes: 1.1, look: { x: 1, y: -0.1 } } };
  if (frame < k.unpred) return { face: { brows: "flat", lids: 0.1, mouth: "smirk", eyes: 1, look: { x: 0.6, y: 0.7 } } };
  const peek = frame >= k.unpred + 6 && frame < k.unpred + 26;
  return { face: { brows: "raised", lids: 0, mouth: "smile", eyes: 1.15, look: peek ? { x: 0.3, y: -1 } : { x: 1, y: 0 } } };
}

/** The counter world (the thumbnail's frame) with everyone in it at `frame`, through `cam`. */
const Counter: React.FC<{ frame: number; k: T; cam: Camera; bubble?: boolean }> = ({ frame, k, cam, bubble }) => {
  const { face, ghost } = hisFace(frame, k);
  const yourPose: Pose = frame >= k.take ? { ...OFFER, armF: [80, -2] } : OFFER;
  const actors = (
    <>
      <Him frame={frame} face={face} ghost={ghost} pose={hisPose(frame, k)} />
      {frame < k.unpred && <KeyCard frame={frame} keys={cardKeys(k)} />}
      {frame >= k.unpred - 2 && <Tag frame={frame} x={HIS_HEAD.x} headY={HIS_HEAD.y} r={HIS_HEAD.r} scale={0.75} keys={hisTag(k)} />}
      {frame >= k.both && <Tag frame={frame} x={YOUR_HEAD.x} headY={YOUR_HEAD.y} r={YOUR_HEAD.r} scale={0.55} keys={yourTag(k)} />}
      <KeyCounter />
      <KeyBox x={boxX(frame, k)} open={lidOpen(frame, k)} />
      {frame >= k.box && frame < k.lid + 12 && (
        <BrassKey x={boxX(frame, k) + 6} y={COUNTER_TOP - BOX.h + BOX.h * 0.3 + 20} scale={0.5} rotate={70} glint={0} />
      )}
      <You frame={frame} face={yourFace(frame, k)} pose={yourPose} showKey={frame < k.take} />
      {bubble && <Bubble frame={frame} at={k.ask} until={k.up} x={YOUR_HEAD.x + 150} y={YOUR_HEAD.y - 190} text="Trust me?" size={64} side="right" />}
    </>
  );
  return (
    <LookContext.Provider value={LOOK(cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<KeyBack cam={cam} frame={frame} peak={k.peak} drop={k.drop} kidUp={k.kidUp} />} actors={actors} />
    </LookContext.Provider>
  );
};

/** The hands, close: his peach hand comes in, closes on the key on your palm, and takes it away. */
const TakeShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const t0 = k.take, t1 = k.box;
  const p = (a: number) => t0 + Math.round((t1 - t0) * a);
  const cam = drift(camAt(frame, [[t0, { x: 960, y: 600, zoom: 1.0 }], [t1, { x: 950, y: 610, zoom: 1.1 }]]), frame, "take", 3);
  const come = ramp(frame, p(0), p(0.4));
  const go = ramp(frame, p(0.62), p(1));
  const him = { x: mix(1700, 900, come) + go * 420, y: mix(520, 680, come) - go * 140, curl: ramp(frame, p(0.4), p(0.58)) * 0.8, down: true };
  const you = { x: 760, y: 720, curl: 0.05 + go * 0.15 };
  const key = go > 0 ? { x: him.x - 70, y: him.y + 30, rotate: 20 } : { x: 800, y: 690, rotate: -14 };
  return (
    <LookContext.Provider value={LOOK(cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<CounterClose />} actors={<Hands you={you} him={him} keyAt={key} keyOver={go > 0} />} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ the beat

type ShotName = "thumb" | "face" | "court" | "hand" | "lid" | "eyes" | "ask" | "up" | "card" | "him88" | "take" | "box" | "both" | "slip"
  | "kid" | "two90" | "card90" | "wide";

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const ct = courtTimes(k);
  const on = current<ShotName>(frame, [[0, "thumb"], [k.sFace, "face"], [k.sCourt, "court"], [k.sHand, "hand"], [k.sLid, "lid"], [k.sEyes, "eyes"],
    [k.ask, "ask"], [k.up, "up"], [k.l87, "card"], [k.l88, "him88"], [k.take, "take"], [k.box, "box"], [k.both, "both"], [k.slip, "slip"],
    [k.kid, "kid"], [k.l90, "two90"], [k.card90, "card90"], [k.wide, "wide"]]);
  const H = HIS_HEAD;
  const cams: Partial<Record<ShotName, Camera>> = {
    thumb: camAt(frame, [[k.start, REF], [k.sFace, { x: 975, y: 545, zoom: 1.06 }]]),
    face: camAt(frame, [[k.sFace, { x: 1530, y: 545, zoom: 1.9 }], [k.sCourt, { x: 1525, y: 548, zoom: 2.02 }]]),
    court: camAt(frame, [[k.sCourt, { x: 1000, y: 620, zoom: 0.92 }], [k.sHand, { x: 1040, y: 610, zoom: 1.0 }]]),
    hand: camAt(frame, [[k.sHand, insert(KEY_AT.x + 40, KEY_AT.y - 130, 2.1)], [k.sLid, insert(KEY_AT.x + 80, KEY_AT.y - 130, 2.25)]]),
    lid: camAt(frame, [[k.sLid, insert(BOX.x + 60, COUNTER_TOP - 120, 2.6)], [k.sEyes, insert(BOX.x + 60, COUNTER_TOP - 110, 3.0)]]),
    eyes: camAt(frame, [[k.sEyes, { x: 1515, y: 500, zoom: 2.1 }], [k.ask, { x: 1515, y: 505, zoom: 2.3 }]]),
    ask: camAt(frame, [[k.ask, { x: 975, y: 540, zoom: 1.02 }], [k.up, { x: 985, y: 535, zoom: 1.06 }]]),
    up: camAt(frame, [[k.up, { x: 1530, y: 520, zoom: 1.9 }], [k.l87, { x: 1530, y: 505, zoom: 2.0 }]]),
    card: camAt(frame, [[k.l87, insert(CARD_AT.x, CARD_AT.y - 40, 3.0)], [k.l88, insert(CARD_AT.x, CARD_AT.y - 40, 3.4)]]),
    him88: camAt(frame, [[k.l88, closeUp(H.x - 30, H.y - 10, 2.5)], [k.take, closeUp(H.x - 30, H.y - 10, 2.65)]]),
    box: camAt(frame, [[k.box, { x: 1150, y: 700, zoom: 1.6 }], [k.both, { x: 1090, y: 720, zoom: 1.7 }]]),
    both: camAt(frame, [[k.both, { x: 975, y: 540, zoom: 1.0 }], [k.slip, { x: 975, y: 530, zoom: 1.05 }]]),
    two90: camAt(frame, [[k.l90, { x: 990, y: 540, zoom: 1.0 }], [k.card90, { x: 990, y: 530, zoom: 1.08 }]]),
    card90: camAt(frame, [[k.card90, closeUp(H.x - 20, H.y - 140, 2.0)], [k.wide, closeUp(H.x - 20, H.y - 150, 2.2)]]),
  };
  let picture: React.ReactNode;
  if (on === "take") picture = <TakeShot frame={frame} k={k} />;
  else if (on === "slip") picture = <PhoneSlip frame={frame} k={ct} />;
  else if (on === "kid") picture = <KidOnChair frame={frame} k={ct} />;
  else if (on === "wide") picture = <CourtWide frame={frame} k={ct} />;
  else picture = <Counter frame={frame} k={k} cam={drift(cams[on] ?? REF, frame, `key-${on}`, on === "thumb" ? 1.5 : 3)} bubble={on === "ask"} />;
  const sfx = (at: number, file: string, volume: number) => (
    <Sequence from={at} durationInFrames={24}><Audio src={staticFile(`sfx/${file}`)} volume={volume} /></Sequence>
  );
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      {/* the only sounds of the peak: his card's two clatters upward. The flaps to blank make none at all. */}
      {sfx(k.flap96, "flap.wav", 0.85)}
      {sfx(k.flap98, "flap.wav", 0.95)}
      {/* the coins shifting in the open box as he pushes it across */}
      {sfx(k.push + 8, "coin.wav", 0.5)}
      {/* the hinge as he lifts the lid (a slow scrape stands in for a creak), and her phone clattering */}
      {sfx(k.lid, "scrape.wav", 0.35)}
      {sfx(k.drop + 11, "clank.wav", 0.55)}
      <TagSounds keys={hisTag(k).slice(1)} volume={0.8} />
      <TagSounds keys={yourTag(k).slice(1)} volume={0.6} />
      <BoardSounds keys={cityKeys(ct)} volume={0.75} />
    </AbsoluteFill>
  );
};

export const theKey: Beat = { id: "theKey", firstLine: 86, Component: Scene };

/** Sounds named in the script with no file in assets/sfx yet, at their moments (the coordinating session adds them). */
export const KEY_MISSING_SFX = (clips: Clip[], to: number) => {
  const k = times(clips, to);
  return { hingeCreak: k.lid, phoneClatter: k.drop + 11 };
};
