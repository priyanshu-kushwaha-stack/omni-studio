// Beat "Sixty Per Cent" (script.md, ## [04:53] Sixty Per Cent; narration lines 53-59). Mood dusk; the court behind
// is closing (shutters down), our own stall's shutter half down.
//
//   53  the stall, the shutter half down; cut to the shutter: a paper sheet unfolds, a head in profile draws itself,
//       a scanner ring round it, two buttons
//   54  a hand hovering over the buttons; a clock ticking a few seconds back; a tally, sixty marks against forty, "60";
//       a coin spinning, fifty and fifty, "50"
//   55  close on your card, WIPES COUNTER 99% (it ticks: you are wiping); your face under it, brows pinched, looking up
//   56  him with a napkin folded into a tie, chest out, the landlord's walk; you laughing, a hand over your mouth
//   HOLD (5 s, performed): his slow nod and the envelope hand; you lean on the box laughing; his card drops,
//       LANDLORD VOICE 97%; he stops mid-word, looks up at it; finishes the bit, quieter (the card ticks); pulls the
//       napkin off
//   57  "It knows the bit." (his own voice), the napkin in his hand
//   58  insert: six in the morning, him alone, coins in rows, COUNTS COINS 88%; insert: the walkway at ten at night,
//       him under a lamp with the phone, CHECKS PHONE 91%
//   59  the next night's closing: the box, his hand flat on the counter, not yet out; your eyes on it
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { lineAt, moodNow } from "../kit";
import { TagSounds, type TagKey } from "../device";
import { camAt, current, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { COURT } from "../sets/FoodCourt";
import { BrainShot, onSheet, type BrainTimes } from "./SixtyPerCent.Brain";
import { WalkwayShot, WALK } from "./SixtyPerCent.Walkway";
import { Cloth, CoinRows, friendBody, heads, reachPose, StallScene, tagShot, talk, Tray, youBody, type Actor } from "./SixtyPerCent.Parts";

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  const end = (i: number) => lineEnd(clips, i);
  const hold = end(56), gap = Math.max(60, from(57) - end(56));
  return {
    open: from(53), // "You thought it read minds.": the stall, the shutter half down
    sheet: at(53, 0.28), // the sheet unfolds on the shutter
    ring: at(53, 0.62), // "Nothing reads minds.": the scanner ring
    buttons: at(53, 0.85),
    hover: from(54), // "In 2008, brain scans could guess whether a person would press a left or a right button"
    hover2: at(54, 0.22), // "... whether a person would press a left or a right button"
    clock: at(54, 0.44), // "... a few seconds before they felt they'd chosen."
    tally: at(54, 0.66), // "The guess was right about sixty times in a hundred."
    tallyDone: at(54, 0.77),
    coin: at(54, 0.88), // "A coin gets fifty."
    card: from(55), // "Sixty. And the card over you says ninety-nine."
    cardTick: at(55, 0.2),
    face: at(55, 0.5), // "So where's the other thirty-nine coming from?"
    tie: from(56), // "Quiet all week. Then tonight, the landlord impression."
    laugh: at(56, 0.62), // "The napkin tie. The one that always gets you."
    hold, // HOLD: the nod and the envelope hand
    flap: hold + Math.round(gap * 0.36), // his card: LANDLORD VOICE 97%
    up: hold + Math.round(gap * 0.46), // he stops mid-word, looks up
    quiet: hold + Math.round(gap * 0.62), // finishes the bit, quieter
    napkinOff: hold + Math.round(gap * 0.8),
    knows: from(57) - 2, // "It knows the bit."
    knowsEnd: end(57),
    six: from(58), // "At six in the morning his tag says counts coins."
    ten: at(58, 0.52), // "At ten at night, checks phone."
    next: from(59), // "Tomorrow his hand comes out, like every night."
    eyes: at(59, 0.5), // "And the tag over it won't be a joke."
    end: to,
  };
}

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

/** Him behind the counter doing the landlord: chest out, a slow pompous walk, the back hand behind him. */
function landlordWalk(frame: number, from: number): Pose {
  const w = walkPose((frame - from) * 0.12);
  return { ...w, lean: -7, tilt: -6, armB: [-22, 64], armF: [20 + Math.sin((frame - from) / 8) * 10, 30] };
}

/** The landlord's slow nod and the envelope hand: the front arm out, palm down, flicking. */
function landlordNod(frame: number, from: number, size = 1): Pose {
  const t = (frame - from) / 14;
  return { ...STAND, lean: -5, tilt: -4 + Math.sin(t) * 9 * size, armB: [-22, 64], armF: [78 + Math.sin(t * 1.6) * 8 * size, 18] };
}

const StallShots: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.open, "open"], [k.card, "card"], [k.face, "face"], [k.tie, "tie"], [k.laugh, "laugh"], [k.hold, "bit"],
    [k.flap, "flap"], [k.quiet, "quiet"], [k.knows, "knows"]]);
  const yourTag: TagKey[] = [
    { at: k.card + 4, text: "WIPES COUNTER", pct: 99, state: "new" },
    { at: k.cardTick, text: "WIPES COUNTER", pct: 99, state: "tick" },
  ];
  const hisTag: TagKey[] = [
    { at: k.flap, text: "LANDLORD VOICE", pct: 97, state: "new" },
    { at: k.quiet + 8, text: "LANDLORD VOICE", pct: 97, state: "tick" },
  ];
  // You.
  const laughing = frame >= k.laugh && frame < k.knows;
  const leanBox = frame >= k.hold && frame < k.flap + 20;
  const fade = ramp(frame, k.up, k.up + 30);
  let you: Actor;
  if (on === "open" || on === "card" || on === "face") {
    const pinched = on === "face" || (on === "card" && frame > k.cardTick + 10);
    you = {
      pose: wiping(frame), held: <Cloth />, tag: on === "open" ? undefined : yourTag,
      face: pinched ? { brows: "worry", lids: 0.15, mouth: "flat", eyes: 1, look: { x: 0.2, y: -0.9 } }
        : { brows: "none", lids: 0.25, mouth: "flat", eyes: 1, look: { x: 0.6, y: 0.7 } },
    };
  } else if (leanBox) {
    const b = youBody({ ...STAND, lean: 22, drop: 14 });
    you = { pose: reachPose(b, { x: 730, y: 672 }, { x: 700, y: 676 }), face: { brows: "raised", lids: 0.55, mouth: "open", eyes: 1, look: { x: 0.9, y: -0.1 } } };
  } else if (laughing) {
    const b = youBody({ ...STAND, lean: 6, tilt: 8 });
    const h = heads({ pose: b.pose }).you;
    const smile = frame >= k.quiet ? mix(1, 0, fade) : 1;
    you = {
      pose: frame >= k.quiet ? b.pose : reachPose(b, { x: h.x + h.r * 0.55, y: h.y + h.r * 0.45 }),
      face: { brows: smile > 0.5 ? "raised" : "flat", lids: smile > 0.5 ? 0.6 : 0.15, mouth: smile > 0.5 ? "smile" : "flat", eyes: 1, look: { x: 0.9, y: frame >= k.up ? -0.6 : 0 } },
    };
  } else {
    you = { pose: STAND, face: { brows: "raised", lids: 0.2, mouth: "smile", eyes: 1, look: { x: 0.9, y: 0 } } };
  }
  // Him.
  let friend: Actor;
  const tieOn = frame >= k.tie;
  const napkin = tieOn ? ramp(frame, k.napkinOff, k.napkinOff + 14) : undefined;
  if (on === "open" || on === "card" || on === "face") {
    friend = { pose: { ...STAND, armF: [55, 75], armB: [30, 60] }, held: <Tray />, face: { brows: "none", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.5, y: 0.6 } } };
  } else if (frame < k.hold) {
    const x = mix(1200, 1040, ramp(frame, k.tie, k.laugh + 20));
    friend = { x, pose: landlordWalk(frame, k.tie), napkin, face: { brows: "flat", lids: 0.45, mouth: talk(frame, k.tie + 10, k.hold, "smirk", 7), eyes: 1, look: { x: 0.6, y: -0.2 } } };
  } else if (frame < k.up) {
    friend = { x: 1040, pose: landlordNod(frame, k.hold), napkin, tag: hisTag, face: { brows: "flat", lids: 0.45, mouth: talk(frame, k.hold, k.up, "flat", 6), eyes: 1, look: { x: 0.8, y: 0 } } };
  } else if (frame < k.quiet) {
    friend = { x: 1040, pose: { ...landlordNod(k.up, k.hold), tilt: 4 }, napkin, tag: hisTag, face: { brows: "raised", lids: 0, mouth: "o", eyes: 1.15, look: { x: 0.1, y: -1 } } };
  } else {
    const off = frame >= k.napkinOff;
    const b = friendBody({ ...STAND, lean: -2 });
    friend = {
      x: 1040, napkin, tag: hisTag,
      pose: off ? reachPose({ ...b, x: 1040 }, { x: 960, y: 700 }) : landlordNod(frame, k.hold, 0.4),
      held: off ? <g transform="rotate(30)"><path d="M-12 -30 L12 -30 L8 30 L0 40 L-8 30Z" fill="#f3e9d7" stroke="#23252b" strokeWidth={3} /></g> : undefined,
      face: on === "knows"
        ? { brows: "worry", lids: 0.3, mouth: talk(frame, k.knows + 2, k.knowsEnd, "flat", 6), eyes: 1, look: frame < k.knows + 30 ? { x: 0.2, y: -0.9 } : { x: 0.9, y: 0 } }
        : { brows: "flat", lids: 0.35, mouth: talk(frame, k.quiet, k.napkinOff, "flat", 9), eyes: 1, look: { x: 0.8, y: 0.2 } },
    };
  }
  const h = heads(you, friend);
  const cams: Record<typeof on, Camera> = {
    open: camAt(frame, [[k.open, { x: 840, y: 470, zoom: 1.2 }], [k.sheet, { x: 830, y: 480, zoom: 1.3 }]]),
    card: camAt(frame, [[k.card, tagShot(h.you, 2.3)], [k.face, { x: h.you.x, y: h.you.y - 160, zoom: 2.1 }]]),
    face: camAt(frame, [[k.face, closeUp(h.you.x + 20, h.you.y, 2.5)], [k.tie, closeUp(h.you.x + 20, h.you.y, 2.7)]]),
    tie: camAt(frame, [[k.tie, { x: 1060, y: 520, zoom: 1.7 }], [k.laugh, { x: 1000, y: 520, zoom: 1.8 }]]),
    laugh: camAt(frame, [[k.laugh, closeUp(h.you.x + 30, h.you.y, 2.4)], [k.hold, closeUp(h.you.x + 30, h.you.y, 2.55)]]),
    bit: camAt(frame, [[k.hold, { x: 820, y: 470, zoom: 1.45 }], [k.flap, { x: 840, y: 460, zoom: 1.52 }]]),
    flap: camAt(frame, [[k.flap, tagShot(h.friend, 1.9)], [k.quiet, tagShot(h.friend, 2.05)]]),
    quiet: camAt(frame, [[k.quiet, { x: 860, y: 470, zoom: 1.5 }], [k.knows, { x: 900, y: 460, zoom: 1.6 }]]),
    knows: camAt(frame, [[k.knows, closeUp(h.friend.x - 20, h.friend.y - 30, 2.4)], [k.six, closeUp(h.friend.x - 20, h.friend.y - 30, 2.6)]]),
  };
  return (
    <StallScene frame={frame} cam={drift(cams[on], frame, `sixty-${on}`, 3)} mood={mood} backMood="lamp" ourShutter={0.45}
      you={you} friend={friend} coffeeBoard={[{ at: 0, value: "1.50" }]} />
  );
};

// ------------------------------------------------------------------------------------------------ the two inserts and the next night

const Inserts: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.six, "six"], [k.ten, "ten"], [k.next, "next"], [k.eyes, "eyes"]]);
  if (on === "ten") {
    const tag: TagKey[] = [{ at: k.ten + 6, text: "CHECKS PHONE", pct: 91, state: "new" }, { at: k.ten + 34, text: "CHECKS PHONE", pct: 91, state: "tick" }];
    const cam = camAt(frame, [[k.ten, { x: WALK.friend.x + 60, y: 380, zoom: 1.7 }], [k.next, { x: WALK.friend.x + 40, y: 370, zoom: 1.85 }]]);
    return <WalkwayShot frame={frame} cam={drift(cam, frame, "walk", 3)} tag={tag} from={k.ten} />;
  }
  if (on === "six") {
    const tag: TagKey[] = [{ at: k.six + 6, text: "COUNTS COINS", pct: 88, state: "new" }, { at: k.six + 34, text: "COUNTS COINS", pct: 88, state: "tick" }];
    const coins = Math.min(24, 4 + Math.floor((frame - k.six) / 5));
    const n = coins - 1;
    const target = { x: 600 + (n % 8) * 34, y: 780 - Math.floor(n / 8) * 14 };
    const b = friendBody({ ...STAND, lean: 18 });
    const friend: Actor = { pose: reachPose(b, target), tag, face: { brows: "flat", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0.9 } } };
    const cam = camAt(frame, [[k.six, { x: 900, y: 450, zoom: 1.35 }], [k.ten, { x: 910, y: 440, zoom: 1.45 }]]);
    return (
      <StallScene frame={frame} cam={drift(cam, frame, "six", 3)} mood="morning" backMood="morning" diners={false}
        friend={friend} box={{ hidden: true }} front={<CoinRows x={600} y={786} n={24} shown={coins} />} />
    );
  }
  // The next night: the box; his hand flat on the counter, not yet out; your eyes on it.
  const b = friendBody({ ...STAND, lean: 6 });
  const friend: Actor = { pose: reachPose(b, { x: 980, y: 784 }), face: { brows: "none", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 0.6, y: 0.8 } } };
  const you: Actor = { pose: STAND, face: { brows: "worry", lids: 0.25, mouth: "flat", eyes: 1, look: { x: 1, y: 0.75 } } };
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
  const part = current(frame, [[0, "open"], [k.sheet, "diagram"], [k.card, "stall"], [k.six, "inserts"]]);
  const yourTag: TagKey[] = [{ at: k.card + 4, text: "WIPES COUNTER", pct: 99, state: "new" }, { at: k.cardTick, text: "WIPES COUNTER", pct: 99, state: "tick" }];
  const hisTag: TagKey[] = [{ at: k.flap, text: "LANDLORD VOICE", pct: 97, state: "new" }, { at: k.quiet + 8, text: "LANDLORD VOICE", pct: 97, state: "tick" }];
  const sixTag: TagKey[] = [{ at: k.six + 6, text: "COUNTS COINS", pct: 88, state: "new" }, { at: k.six + 34, text: "COUNTS COINS", pct: 88, state: "tick" }];
  const tenTag: TagKey[] = [{ at: k.ten + 6, text: "CHECKS PHONE", pct: 91, state: "new" }, { at: k.ten + 34, text: "CHECKS PHONE", pct: 91, state: "tick" }];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {(part === "open" || part === "stall") && <StallShots frame={frame} k={k} mood={mood} />}
      {part === "diagram" && <Diagram frame={frame} k={k} mood={mood} />}
      {part === "inserts" && <Inserts frame={frame} k={k} mood={mood} />}
      <TagSounds keys={yourTag} />
      <TagSounds keys={hisTag} />
      <TagSounds keys={sixTag} volume={0.8} />
      <TagSounds keys={tenTag} volume={0.8} />
      {/* the coins going into rows at six in the morning */}
      {[0, 1, 2, 3].map((i) => (
        <Sequence key={i} from={k.six + 8 + i * 15} durationInFrames={14}><Audio src={staticFile("sfx/coin.wav")} volume={0.35} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const sixtyPerCent: Beat = { id: "sixtyPerCent", firstLine: 53, Component: Scene };
