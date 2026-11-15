// Beat "Sixty Per Cent" (script.md v2, ## [05:06] Sixty Per Cent; narration lines 60-65). Mood dusk; the court behind
// is closing (shutters down), our own stall's shutter half down.
//
//   60  the stall, the shutter half down; cut to the shutter: a paper sheet unfolds, a head in profile draws itself,
//       a scanner ring round it, two buttons
//   61  a hand hovering over the buttons; a clock ticking a few seconds back; a tally, sixty marks against forty, "60";
//       a coin spinning, fifty and fifty, "50"
//   62  close on your card, WIPES COUNTER 99% (it ticks: you are wiping); your face under it, brows pinched, looking up
//   63  him at the counter turning a coin over, eyes up at his pillar; his board HIS RATE clatters up on "Up." and again
//       on "Up again." to 118; insert: the landlord's envelope in his hand, his face reading it, not smiling; him at
//       the back of the stall, cloth stopped on a tray, eyes on the tin box, a slow push in
//   64  "Machine hates me." (his own voice): deadpan, a thumb jabbed at the board; the board flutters on 118 as if it
//       answered; a double take; you snort into your hand (the laugh)
//   65  the next night's closing: the box, his hand flat on the counter, not yet out; your eyes on it
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { lineAt, moodNow } from "../kit";
import { BoardSounds, TagSounds, type BoardKey, type TagKey } from "../device";
import { camAt, current, lineEnd, type Beat, type Shot } from "../shared";
import { COURT } from "../sets/FoodCourt";
import { BrainShot, onSheet, type BrainTimes } from "./SixtyPerCent.Brain";
import { Cloth, Envelope, friendBody, heads, reachPose, StallScene, tagShot, talk, Tray, youBody, type Actor } from "./SixtyPerCent.Parts";

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  const end = (i: number) => lineEnd(clips, i);
  const flutter = at(64, 0.55);
  return {
    open: from(60), // "You thought it read minds.": the stall, the shutter half down
    sheet: at(60, 0.28), // the sheet unfolds on the shutter
    ring: at(60, 0.62), // "Nothing reads minds.": the scanner ring
    buttons: at(60, 0.85),
    hover: from(61), // "In 2008, brain scans could guess whether a person would press a left or a right button"
    hover2: at(61, 0.22),
    clock: at(61, 0.44), // "... a few seconds before they felt they'd chosen."
    tally: at(61, 0.66), // "The guess was right about sixty per cent of the time."
    tallyDone: at(61, 0.77),
    coin: at(61, 0.88), // "A coin gets fifty."
    card: from(62), // "Sixty. And the card over you says ninety-nine."
    cardTick: at(62, 0.2),
    face: at(62, 0.5), // "So where's the other thirty-nine coming from?"
    his: from(63), // "And your best friend's board never came down after the coin."
    board: at(63, 0.3),
    up1: at(63, 0.55), // "Up."
    up2: at(63, 0.61), // "Up again."
    envelope: at(63, 0.67), // "He's been staring ..."
    stare: at(63, 0.8), // "... at the box all week."
    hates: from(64), // "Machine hates me."
    hatesEnd: end(64),
    flutter, // the board flutters back at him
    react: flutter + 18, // double take; you snort (it runs on under the start of line 65)
    next: Math.max(flutter + 46, at(65, 0.15)), // "Tomorrow his hand comes out, like every night."
    eyes: Math.max(flutter + 90, at(65, 0.5)), // "And the tag over it won't be a joke."
    end: to,
  };
}

const yourKeys = (k: T): TagKey[] => [
  { at: k.card + 4, text: "WIPES COUNTER", pct: 99, state: "new" },
  { at: k.cardTick, text: "WIPES COUNTER", pct: 99, state: "tick" },
];
/** His rate: up on "Up.", up again on "Up again." to 118; on "Machine hates me." it flutters on 118 as if it answered. */
const hisRate = (k: T): BoardKey[] => [
  { at: -1e4, value: "106" }, { at: k.up1, value: "112" }, { at: k.up2, value: "118" }, { at: k.flutter, value: "118" },
];

// ------------------------------------------------------------------------------------------------ the diagram

function brainTimes(k: T): BrainTimes {
  return { sheet: k.sheet, ring: k.ring, buttons: k.buttons, hover: k.hover, clock: k.clock, tally: k.tally, tallyDone: k.tallyDone, coin: k.coin };
}

const Diagram: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.sheet, "head"], [k.hover, "buttons"], [k.hover2, "whole"], [k.clock, "clock"], [k.tally, "tally"], [k.coin, "coin"]]);
  const p = (sx: number, sy: number, zoom: number): Camera => ({ ...onSheet(sx, sy), zoom });
  const cams: Record<typeof on, Camera> = {
    head: camAt(frame, [[k.sheet, p(400, 420, 1.15)], [k.hover, p(380, 420, 1.45)]]),
    buttons: camAt(frame, [[k.hover, p(370, 620, 1.75)], [k.hover2, p(390, 600, 1.85)]]),
    whole: camAt(frame, [[k.hover2, p(560, 470, 1.25)], [k.clock, p(600, 460, 1.3)]]),
    clock: camAt(frame, [[k.clock, p(800, 260, 1.9)], [k.tally, p(820, 270, 2.0)]]),
    tally: camAt(frame, [[k.tally, p(1030, 520, 1.55)], [k.coin, p(1060, 520, 1.62)]]),
    coin: camAt(frame, [[k.coin, p(1000, 560, 1.2)], [k.card, p(960, 520, 1.08)]]),
  };
  const hand = frame >= k.clock ? (Math.floor((frame - k.clock) / 24) % 2 ? "left" : "right") : "hover";
  return <BrainShot frame={frame} t={brainTimes(k)} cam={drift(cams[on], frame, `brain-${on}`, 3)} mood={mood} hand={hand} />;
};

// ------------------------------------------------------------------------------------------------ the stall

/** You wiping the counter, the cloth going round in small circles. */
function wiping(frame: number, lean = 10): Pose {
  const b = youBody({ ...STAND, lean });
  return reachPose(b, { x: 660 + Math.sin(frame / 6) * 46, y: 774 + Math.cos(frame / 6) * 8 });
}

/** Him at the back of the stall (line 63's stare). */
const BACK_X = 1220;
const COIN = <ellipse cx={0} cy={0} rx={12} ry={5} fill="#e8b84a" stroke="#23252b" strokeWidth={3} />;

const StallShots: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.open, "open"], [k.card, "card"], [k.face, "face"], [k.his, "his"], [k.board, "board"], [k.envelope, "envelope"],
    [k.stare, "stare"], [k.hates, "hates"], [k.flutter, "flutter"], [k.react, "react"]]);
  const rate = { label: "HIS RATE", keys: hisRate(k) };
  // You.
  let you: Actor;
  if (on === "open" || on === "card" || on === "face") {
    const pinched = on === "face" || (on === "card" && frame > k.cardTick + 10);
    you = {
      pose: wiping(frame), held: <Cloth />, tag: on === "open" ? undefined : yourKeys(k),
      face: pinched ? { brows: "worry", lids: 0.15, mouth: "flat", eyes: 1, look: { x: 0.2, y: -0.9 } }
        : { brows: "none", lids: 0.25, mouth: "flat", eyes: 1, look: { x: 0.6, y: 0.7 } },
    };
  } else if (on === "react") {
    // The snort: a hand to the mouth, shoulders bouncing, eyes squeezed.
    const b = youBody({ ...STAND, lean: 8 + Math.abs(Math.sin((frame - k.react) / 3)) * 5, tilt: 8 });
    const h = heads({ pose: b.pose }).you;
    you = { pose: reachPose(b, { x: h.x + h.r * 0.55, y: h.y + h.r * 0.45 }), face: { brows: "raised", lids: 0.75, mouth: "smile", eyes: 1, look: { x: 0.9, y: 0 } } };
  } else {
    you = { pose: wiping(frame, 6), held: <Cloth />, face: { brows: "none", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0.1 } } };
  }
  // Him.
  let friend: Actor;
  const fb = friendBody({ ...STAND, lean: 6 });
  if (on === "open" || on === "card" || on === "face") {
    friend = { pose: { ...STAND, armF: [55, 75], armB: [30, 60] }, held: <Tray />, face: { brows: "none", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.5, y: 0.6 } } };
  } else if (on === "his" || on === "board") {
    // Turning a coin over on the counter, eyes up at his board on the pillar.
    const flip = Math.floor((frame - k.his) / 14) % 2;
    friend = { pose: reachPose(fb, { x: 980, y: 776 - flip * 26 }), held: COIN, face: { brows: "flat", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 0.9, y: -0.55 } } };
  } else if (on === "envelope") {
    const h0 = heads(undefined, { pose: fb.pose }).friend;
    friend = { pose: reachPose(fb, { x: h0.x - h0.r * 1.6, y: h0.y + h0.r * 1.4 }), held: <Envelope x={10} y={-6} scale={0.55} tilt={-14} />,
      face: { brows: "flat", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.6 } } };
  } else if (on === "stare") {
    const stop = frame >= k.stare + 14;
    friend = {
      x: BACK_X, held: <Tray tilt={-4} />, back: <Cloth />,
      pose: { ...STAND, lean: 6, armF: [60, 50], armB: [50 + (stop ? 0 : Math.sin(frame / 5) * 12), 60] },
      face: { brows: stop ? "flat" : "none", lids: stop ? 0.2 : 0.4, mouth: "flat", eyes: 1, look: stop ? { x: 0.95, y: 0.55 } : { x: 0.4, y: 0.85 } },
    };
  } else if (on === "hates" || on === "flutter") {
    // Deadpan, a thumb jabbed back over his shoulder at the board.
    const h0 = heads(undefined, { pose: fb.pose }).friend;
    friend = { pose: reachPose(fb, { x: h0.x - h0.r * 2.4, y: h0.y - h0.r * 0.4 }),
      face: { brows: "flat", lids: 0.55, mouth: talk(frame, k.hates + 2, k.hatesEnd, "flat", 6), eyes: 1, look: { x: 0.8, y: 0 } } };
  } else {
    // The double take: throws both hands out at the board, eyes snapping to it, then to you.
    const t = frame - k.react;
    friend = { pose: { ...STAND, lean: -4, armF: [110, -20], armB: [70, -10] },
      face: { brows: t < 12 ? "raised" : "flat", lids: t < 12 ? 0 : 0.5, mouth: t < 12 ? "o" : "smirk", eyes: t < 12 ? 1.25 : 1, look: t < 12 ? { x: 0.9, y: -0.6 } : { x: 0.95, y: 0 } } };
  }
  const h = heads(you, friend);
  const board = { x: COURT.pillar.board.x, y: COURT.pillar.board.y + 50 };
  const cams: Record<typeof on, Camera> = {
    open: camAt(frame, [[k.open, { x: 840, y: 470, zoom: 1.2 }], [k.sheet, { x: 830, y: 480, zoom: 1.3 }]]),
    card: camAt(frame, [[k.card, tagShot(h.you, 2.3)], [k.face, { x: h.you.x, y: h.you.y - 160, zoom: 2.1 }]]),
    face: camAt(frame, [[k.face, closeUp(h.you.x + 20, h.you.y, 2.5)], [k.his, closeUp(h.you.x + 20, h.you.y, 2.7)]]),
    his: camAt(frame, [[k.his, { x: 1000, y: 560, zoom: 1.8 }], [k.board, { x: 980, y: 550, zoom: 1.9 }]]),
    board: camAt(frame, [[k.board, { ...board, zoom: 3.0 }], [k.envelope, { ...board, zoom: 3.4 }]]),
    envelope: camAt(frame, [[k.envelope, closeUp(h.friend.x - 60, h.friend.y + 20, 2.6)], [k.stare, closeUp(h.friend.x - 60, h.friend.y + 20, 2.8)]]),
    stare: camAt(frame, [[k.stare, { x: 1020, y: 560, zoom: 1.35 }], [k.hates, { x: 1120, y: 470, zoom: 1.9 }]]),
    hates: camAt(frame, [[k.hates, closeUp(h.friend.x - 40, h.friend.y, 2.3)], [k.flutter, closeUp(h.friend.x - 40, h.friend.y, 2.45)]]),
    flutter: camAt(frame, [[k.flutter, { ...board, zoom: 3.2 }], [k.react, { ...board, zoom: 3.25 }]]),
    react: camAt(frame, [[k.react, { x: 820, y: 480, zoom: 1.45 }], [k.next, { x: 830, y: 480, zoom: 1.5 }]]),
  };
  return (
    <StallScene frame={frame} cam={drift(cams[on], frame, `sixty-${on}`, 3)} mood={mood} backMood="lamp" ourShutter={0.45}
      you={you} friend={friend} coffeeBoard={[{ at: 0, value: "1.50" }]} pillarBoard={rate}
      box={{ open: on === "stare" ? 0.3 : 0 }} />
  );
};

// ------------------------------------------------------------------------------------------------ the next night

const NextNight: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.next, "next"], [k.eyes, "eyes"]]);
  // The box; his hand flat on the counter, not yet out (the fingers drum once); your eyes on it.
  const drum = Math.max(0, Math.sin((frame - k.next) / 5)) * 6 * (frame < k.next + 40 ? 1 : 0);
  const b = friendBody({ ...STAND, lean: 6 });
  const friend: Actor = { pose: reachPose(b, { x: 980, y: 784 - drum }), face: { brows: "none", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 0.6, y: 0.8 } } };
  const you: Actor = { pose: STAND, face: { brows: "flat", lids: 0.25, mouth: "flat", eyes: 1, look: { x: 1, y: 0.75 } } };
  const h = heads(you, friend);
  const cam = on === "next"
    ? camAt(frame, [[k.next, insert(900, 700, 2.6)], [k.eyes, insert(920, 710, 2.8)]])
    : camAt(frame, [[k.eyes, closeUp(h.you.x + 40, h.you.y, 2.6)], [k.end, closeUp(h.you.x + 40, h.you.y, 2.9)]]);
  return <StallScene frame={frame} cam={drift(cam, frame, `next-${on}`, 2)} mood={mood} backMood="lamp" ourShutter={0.2} you={you} friend={friend} />;
};

// ------------------------------------------------------------------------------------------------ the beat

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const mood = moodNow(shot);
  const part = current(frame, [[0, "open"], [k.sheet, "diagram"], [k.card, "stall"], [k.next, "next"]]);
  const coinTaps = [0, 1, 2].map((i) => k.his + 14 + i * 28).filter((f) => f < k.board);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {(part === "open" || part === "stall") && <StallShots frame={frame} k={k} mood={mood} />}
      {part === "diagram" && <Diagram frame={frame} k={k} mood={mood} />}
      {part === "next" && <NextNight frame={frame} k={k} mood={mood} />}
      <TagSounds keys={yourKeys(k)} />
      <BoardSounds keys={hisRate(k)} volume={0.7} />
      {/* his coin turned over on the steel counter */}
      {coinTaps.map((f) => (
        <Sequence key={f} from={f} durationInFrames={14}><Audio src={staticFile("sfx/coin.wav")} volume={0.25} /></Sequence>
      ))}
      {/* the envelope's paper */}
      <Sequence from={k.envelope} durationInFrames={20}><Audio src={staticFile("sfx/flap.wav")} volume={0.35} /></Sequence>
    </AbsoluteFill>
  );
};

export const sixtyPerCent: Beat = { id: "sixtyPerCent", firstLine: 60, Component: Scene };
