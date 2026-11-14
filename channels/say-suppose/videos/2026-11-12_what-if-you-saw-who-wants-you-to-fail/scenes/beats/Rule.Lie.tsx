// The Rule, lines 15-17 (v5, new): the lie test at the counter, then the cat.
//
//   15  "So you try the obvious cheat.": the clerk's card has folded; you lean on the counter, the letter laid down,
//       a sly look up; "Make something up, and scan the whole world for free.": you straighten and wind up
//       the hold: arms out, grin wide, "I won the lottery!"; silence, no snap; close on the clerk with the empty air
//       over his head: he blinks once and holds the receipt an inch closer; the cat asleep on its crate, tail flicking
//   16  "Nothing. A lie opens nothing.": your face falls, the arms come down; "The card works on good news that's true,
//       and yours.": the letter on the counter, and the receipt slid onto it; "So you've got exactly one letter": you
//       holding it up, looking at it; "and you're spending it on a man who scans snacks.": the clerk, deadpan, sweeps a
//       crisp packet across the scanner, beep, and looks at you
//   17  the cat (one line in v5; was two in v4): you crouch by the crate; the cat opens one eye; your mouth moves; no snap;
//       the cat staring; the eye closes; you
import { lerpPose, STAND, type Pose } from "@whatif/kit/rig/pose";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { headAt, Letter } from "../parts";
import { camAt, current, mix, ramp } from "../shared";
import { STORE } from "../sets/Store";
import { chewFace, CROUCH, HALF, LETTER, Receipt, S, StoreShot, YOU_CLERK, type Look, type Mood } from "./Rule.Store";
import type { T } from "./Rule";

/** Leaning on the counter, both hands on it. */
const LEAN: Pose = { ...STAND, lean: 12, armF: [70, 30], armB: [55, 40] };
/** Arms flung out wide, chin up. */
const WIDE: Pose = { ...STAND, lean: -6, tilt: -8, armF: [125, 15], armB: [-125, -15] };
/** Where the letter lies on the counter. */
const ON_COUNTER = { x: 1545, y: STORE.counter.top - 10 };

/** A crisp packet in the clerk's hand. */
const CRISPS = (
  <g transform="translate(6 -6) rotate(-12)">
    <path d="M-18 24 L-20 -30 Q0 -38 20 -30 L18 24Z" fill="#e8792f" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <circle cx={0} cy={-4} r={8} fill={PAPER} opacity={0.8} />
  </g>
);

/** The scanner's red flash and the till lighting up, on the beep. */
const Beep: React.FC = () => (
  <g>
    <rect x={1556} y={STORE.counter.top - 40} width={68} height={42} rx={6} fill={CRIMSON} opacity={0.35} />
    <line x1={1566} y1={STORE.counter.top - 36} x2={1614} y2={STORE.counter.top - 36} stroke={CRIMSON} strokeWidth={6} strokeLinecap="round" />
    <rect x={STORE.till.x - 58} y={STORE.till.y - 40} width={116} height={64} rx={4} fill="#ffffff" opacity={0.6} />
  </g>
);

type Shots = "lean" | "windup" | "shout" | "air" | "nap" | "flop" | "letter" | "stare" | "snacks";

/** Lines 15-16: the lie test. */
export const LieShots: React.FC<{ frame: number; k: T; mood: Mood }> = ({ frame, k, mood }) => {
  const on = current<Shots>(frame, [[k.lie, "lean"], [k.idea, "windup"], [k.shout, "shout"], [k.silence, "air"], [k.nap, "nap"],
    [k.flop, "flop"], [k.truth, "letter"], [k.oneLetter, "stare"], [k.snacks, "snacks"]]);
  const ch = headAt(STORE.clerk.x, STORE.floor, S, STAND, -1);
  const yh = headAt(YOU_CLERK, STORE.floor, S, STAND, 1);
  const c = STORE.cat;
  const cams: Record<Shots, Camera> = {
    lean: camAt(frame, [[k.lie, { x: 1580, y: 650, zoom: 1.8 }], [k.idea, { x: 1575, y: 645, zoom: 1.88 }]]),
    windup: camAt(frame, [[k.idea, { x: 1560, y: 630, zoom: 1.7 }], [k.shout, { x: 1555, y: 620, zoom: 1.6 }]]),
    shout: camAt(frame, [[k.shout, { x: 1545, y: 600, zoom: 1.5 }], [k.silence, { x: 1545, y: 600, zoom: 1.52 }]]),
    // the clerk close, with room over his head where no card opens
    air: camAt(frame, [[k.silence, { x: ch.x - 60, y: ch.y - 110, zoom: 2.3 }], [k.nap, { x: ch.x - 60, y: ch.y - 100, zoom: 2.45 }]]),
    nap: camAt(frame, [[k.nap, insert(c.x + 20, c.y - 110, 3.4)], [k.flop, insert(c.x + 20, c.y - 110, 3.6)]]),
    flop: camAt(frame, [[k.flop, closeUp(yh.x + 30, yh.y, 2.6)], [k.truth, closeUp(yh.x + 30, yh.y + 10, 2.85)]]),
    letter: camAt(frame, [[k.truth, insert(ON_COUNTER.x + 40, ON_COUNTER.y - 50, 4.6)], [k.oneLetter, insert(ON_COUNTER.x + 40, ON_COUNTER.y - 50, 4.9)]]),
    stare: camAt(frame, [[k.oneLetter, { x: 1400, y: 640, zoom: 2.0 }], [k.snacks, { x: 1410, y: 640, zoom: 2.1 }]]),
    snacks: camAt(frame, [[k.snacks, { x: 1690, y: 640, zoom: 2.6 }], [k.cat, { x: 1695, y: 640, zoom: 2.75 }]]),
  };
  const cam = drift(cams[on], frame, `lie-${on}`, on === "letter" || on === "nap" ? 1.5 : 3);

  // you: lean, wind up, fling the arms out, hold, then they sink
  const rise = ramp(frame, k.idea + 6, k.shout);
  const fling = ramp(frame, k.shout - 4, k.shout + 4);
  const sink = ramp(frame, k.flop + 6, k.flop + 46);
  let youPose: Pose = lerpPose(LEAN, { ...STAND, lean: -3, armF: [40, 30], armB: [-40, -20] }, rise);
  if (frame >= k.shout - 4) youPose = lerpPose(youPose, WIDE, fling);
  if (frame >= k.flop) youPose = lerpPose(WIDE, STAND, sink);
  if (on === "stare") youPose = { ...STAND, armF: [72, 62] };
  if (on === "snacks") youPose = STAND;
  const holding = on === "stare" || on === "snacks";
  const falling = ramp(frame, k.flop + 4, k.flop + 30);
  const faces: Record<Shots, Look> = {
    lean: { brows: "raised", lids: 0.3, mouth: "smirk", eyes: 1, look: { x: 0.3, y: -0.8 } },
    windup: { brows: "raised", lids: 0, mouth: "smile", eyes: 1.05, look: { x: 0.9, y: -0.1 } },
    shout: { brows: "raised", lids: 0, mouth: "open", eyes: 1.15, look: { x: 0.9, y: -0.2 } },
    air: { brows: "raised", lids: 0, mouth: "smile", eyes: 1.1, look: { x: 0.9, y: -0.6 } },
    nap: { brows: "raised", lids: 0, mouth: "smile", eyes: 1.1, look: { x: 0.9, y: -0.6 } },
    flop: falling < 0.5 ? { brows: "raised", lids: 0, mouth: "smile", eyes: 1.1, look: { x: 0.9, y: -0.6 } }
      : { brows: "sad", lids: mix(0.1, 0.45, falling), mouth: "flat", eyes: 1, look: { x: 0.9, y: mix(-0.3, 0.2, falling) } },
    letter: { brows: "sad", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 0.6, y: 0.6 } },
    stare: { brows: "worry", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.7, y: 0.5 } },
    snacks: { brows: "flat", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0.1 } },
  };
  const youFace = faces[on];

  // the clerk: the receipt held out, bent, then an inch closer; for "snacks", the crisp packet over the scanner
  const closer = ramp(frame, k.closer, k.closer + 10);
  const sweep = ramp(frame, k.snacks + 6, k.snacks + 28);
  const beep = on === "snacks" && frame >= k.snacks + 16 && frame < k.snacks + 24;
  const clerkArm: [number, number] = on === "snacks" ? [mix(40, 100, sweep), mix(60, 10, sweep)] : [mix(78, 97, closer), mix(28, 0, closer)];
  const clerkHeld = on === "snacks" ? CRISPS : <Receipt />;
  const blinkNow = frame >= k.blinkAt && frame < k.blinkAt + 6;
  const clerkFace: Look = on === "snacks" && frame < k.snacks + 30
    ? { brows: "none", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 0.3, y: 0.7 } }
    : { brows: "flat", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.05 } };

  // the counter: the letter laid down from line 15 on (until you pick it up), and the receipt slid onto it
  const slide = ramp(frame, k.truth + 30, k.truth + 50);
  const counterExtra = (
    <g>
      {!holding && <Letter x={ON_COUNTER.x} y={ON_COUNTER.y} scale={on === "letter" ? 0.55 : 0.42} tilt={-12} />}
      {on === "letter" && frame >= k.truth + 24 && (
        <g transform={`translate(${mix(ON_COUNTER.x + 160, ON_COUNTER.x + 6, slide)} ${ON_COUNTER.y - 70}) rotate(-24) scale(1.1)`}><Receipt /></g>
      )}
      {beep && <Beep />}
    </g>
  );
  return (
    <StoreShot frame={frame} cam={cam} mood={mood} youX={YOU_CLERK} youFace={youFace} youPose={youPose} youHeld={holding ? LETTER : undefined}
      bubble={{ at: k.shout, until: k.silence, text: "I won the lottery!", size: 40, side: "right" }} mjX={1150}
      mjFace={chewFace(frame)} mjHeld={HALF} clerkFace={clerkFace} clerkHeld={clerkHeld} clerkArm={clerkArm} clerkBlink={blinkNow || undefined}
      counterExtra={counterExtra} catEyes="shut" />
  );
};

type CatShot = "crouch" | "stare" | "cat" | "you";

/** Line 17: you crouch by the crate; the cat opens one eye; your mouth moves; nothing; the cat stares; the eye closes. */
export const CatShots: React.FC<{ frame: number; k: T; mood: Mood }> = ({ frame, k, mood }) => {
  const on = current<CatShot>(frame, [[k.cat, "crouch"], [k.catStare, "stare"], [k.catShut, "cat"], [k.never, "you"]]);
  const YX = 500;
  const yh = headAt(YX, STORE.floor, S, CROUCH, -1);
  const c = STORE.cat;
  const cams: Record<CatShot, Camera> = {
    crouch: camAt(frame, [[k.cat, { x: 350, y: 760, zoom: 2.1 }], [k.catStare, { x: 340, y: 760, zoom: 2.25 }]]),
    stare: camAt(frame, [[k.catStare, insert(c.x + 20, c.y - 120, 3.4)], [k.catShut, insert(c.x + 20, c.y - 120, 3.7)]]),
    cat: camAt(frame, [[k.catShut, insert(c.x + 20, c.y - 120, 3.7)], [k.never, insert(c.x + 20, c.y - 120, 3.9)]]),
    you: camAt(frame, [[k.never, closeUp(yh.x - 30, yh.y, 2.8)], [k.phone, closeUp(yh.x - 30, yh.y, 3.0)]]),
  };
  const cam = drift(cams[on], frame, "cat", 2.5);
  const speaking = frame >= k.speak && frame < k.speak + 40;
  const youFace: Look = on === "you" ? { brows: "worry", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.3 } }
    : { brows: "raised", lids: 0, mouth: speaking && Math.floor(frame / 5) % 2 ? "open" : "smile", eyes: 1.05, look: { x: 0.9, y: 0.4 } };
  const catEyes = frame >= k.eye && frame < k.catShut + 10 ? "one" : "shut";
  return (
    <StoreShot frame={frame} cam={cam} mood={mood} youX={YX} youFacing={-1} youPose={CROUCH} youFace={youFace} youHeld={LETTER}
      mjFace={{ brows: "none", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 0.5, y: 0.3 } }} mjHeld={HALF} catEyes={catEyes} />
  );
};
