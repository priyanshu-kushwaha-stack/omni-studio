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
//
// v7 (outside review of v6): the set-up in three framings (close on you leaning in, the wind-up from lower and wider,
// the arms-out wide); then silence on the clerk, the cat asleep, the receipt pushed an inch closer; "A lie opens
// nothing": a card stamped LIE tries to unfold over him, shudders, and folds and drops. The cat: it opens one eye; you
// crouch lower and hold the letter at it; it swats the letter and you recoil; the eye closes.
import { lerpPose, STAND, type Pose } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
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

type Shots = "lean" | "windup" | "shout" | "air" | "nap" | "push" | "flop" | "lieCard" | "letter" | "stare" | "snacks";

/** "A lie opens nothing.": a cream card stamped LIE that starts to unfold over a head, shudders half open, then folds
 *  back and drops out of frame. World units; (x, y) its centre, h its height. */
const FailedCard: React.FC<{ frame: number; at: number; x: number; y: number; h: number }> = ({ frame, at, x, y, h }) => {
  const t = frame - at;
  if (t < 0 || t > 40) return null;
  const open = t < 10 ? (t / 10) * 0.7 : t < 20 ? 0.7 + Math.sin(t * 2.2) * 0.08 : Math.max(0, 0.7 * (1 - (t - 20) / 6));
  const drop = t > 22 ? Math.pow((t - 22) / 18, 2) * h * 6 : 0;
  const w = h * 2.5;
  return (
    <g transform={`translate(${x} ${y + drop}) rotate(${t > 22 ? (t - 22) * 2 : -3}) scale(1 ${Math.max(0.02, open)})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h * 0.14} fill={PAPER} stroke={INK} strokeWidth={6} />
      <g transform="rotate(-8)">
        <rect x={-w * 0.3} y={-h * 0.34} width={w * 0.6} height={h * 0.68} rx={h * 0.1} fill="none" stroke={CRIMSON} strokeWidth={8} />
        <text x={0} y={h * 0.22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={h * 0.62} fill={CRIMSON}>LIE</text>
      </g>
    </g>
  );
};

/** Lines 15-16: the lie test. */
export const LieShots: React.FC<{ frame: number; k: T; mood: Mood }> = ({ frame, k, mood }) => {
  const on = current<Shots>(frame, [[k.lie, "lean"], [k.idea, "windup"], [k.shout, "shout"], [k.silence, "air"], [k.nap, "nap"], [k.closer - 4, "push"],
    [k.flop, "flop"], [k.lieCard, "lieCard"], [k.truth, "letter"], [k.oneLetter, "stare"], [k.snacks, "snacks"]]);
  const ch = headAt(STORE.clerk.x, STORE.floor, S, STAND, -1);
  const yh = headAt(YOU_CLERK, STORE.floor, S, STAND, 1);
  const c = STORE.cat;
  const cams: Record<Shots, Camera> = {
    // three different framings for the set-up (outside review: seven seconds on one counter composition)
    lean: camAt(frame, [[k.lie, closeUp(yh.x + 80, yh.y + 40, 2.6)], [k.idea, closeUp(yh.x + 90, yh.y + 40, 2.75)]]),
    windup: camAt(frame, [[k.idea, { x: 1420, y: 760, zoom: 1.45 }], [k.shout, { x: 1440, y: 740, zoom: 1.35 }]]),
    shout: camAt(frame, [[k.shout, { x: 1300, y: 560, zoom: 1.05 }], [k.silence, { x: 1300, y: 560, zoom: 1.08 }]]),
    // the clerk close, with room over his head where no card opens
    air: camAt(frame, [[k.silence, { x: ch.x - 60, y: ch.y - 110, zoom: 2.3 }], [k.nap, { x: ch.x - 60, y: ch.y - 100, zoom: 2.45 }]]),
    nap: camAt(frame, [[k.nap, insert(c.x + 20, c.y - 110, 3.4)], [k.closer, insert(c.x + 20, c.y - 110, 3.6)]]),
    push: camAt(frame, [[k.closer - 4, { x: ch.x - 120, y: ch.y - 20, zoom: 2.2 }], [k.flop, { x: ch.x - 140, y: ch.y - 10, zoom: 2.4 }]]),
    flop: camAt(frame, [[k.flop, closeUp(yh.x + 30, yh.y, 2.6)], [k.lieCard, closeUp(yh.x + 30, yh.y + 10, 2.7)]]),
    lieCard: camAt(frame, [[k.lieCard, { x: ch.x - 60, y: ch.y - 120, zoom: 2.2 }], [k.truth, { x: ch.x - 60, y: ch.y - 130, zoom: 2.3 }]]),
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
    push: { brows: "raised", lids: 0.1, mouth: "flat", eyes: 1.1, look: { x: 0.9, y: 0 } },
    lieCard: { brows: "sad", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 0.9, y: -0.5 } },
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
      {on === "lieCard" && <FailedCard frame={frame} at={k.lieCard + 4} x={ch.x} y={ch.y - ch.r * 2.4} h={ch.r * 1.6} />}
    </g>
  );
  return (
    <StoreShot frame={frame} cam={cam} mood={mood} youX={YOU_CLERK} youFace={youFace} youPose={youPose} youHeld={holding ? LETTER : undefined}
      bubble={{ at: k.shout, until: k.silence, text: "I won the lottery!", size: 40, side: "right" }} mjX={1150}
      mjFace={chewFace(frame)} mjHeld={HALF} clerkFace={clerkFace} clerkHeld={clerkHeld} clerkArm={clerkArm} clerkBlink={blinkNow || undefined}
      counterExtra={counterExtra} catEyes="shut" />
  );
};

type CatShot = "crouch" | "eye" | "offer" | "swat" | "cat" | "you";

/** The cat's paw, swatting: out from its chest toward the letter and back. World units, at the cat's head height. */
const Paw: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  if (t <= 0 || t >= 1) return null;
  const out = Math.sin(t * Math.PI);
  const px = x + 30 + out * 120, py = y - 20 - out * 40;
  return (
    <g>
      <path d={`M${x + 30} ${y + 20} Q${x + 60} ${py} ${px} ${py}`} fill="none" stroke={INK} strokeWidth={24} strokeLinecap="round" />
      <path d={`M${x + 30} ${y + 20} Q${x + 60} ${py} ${px} ${py}`} fill="none" stroke="#d9893b" strokeWidth={15} strokeLinecap="round" />
      <circle cx={px} cy={py} r={16} fill="#f3e2c8" stroke={INK} strokeWidth={4} />
      {out > 0.6 && [0, 1, 2].map((i) => <line key={i} x1={px + 18} y1={py - 14 + i * 12} x2={px + 40} y2={py - 22 + i * 16} stroke={INK} strokeWidth={4} strokeLinecap="round" />)}
    </g>
  );
};

/** Line 17, four acted beats: the cat opens one eye; you crouch lower and hold the letter at it, mouth moving; it
 *  swats the letter and you recoil; its eye closes; you. */
export const CatShots: React.FC<{ frame: number; k: T; mood: Mood }> = ({ frame, k, mood }) => {
  const on = current<CatShot>(frame, [[k.cat, "crouch"], [k.eye, "eye"], [k.speak, "offer"], [k.catStare, "swat"], [k.catShut, "cat"], [k.never, "you"]]);
  const YX = 470;
  const swatAt = k.catStare + 8;
  const recoil = ramp(frame, swatAt + 6, swatAt + 14) * (1 - ramp(frame, k.catShut - 10, k.catShut));
  const offer = ramp(frame, k.speak, k.speak + 12);
  const pose: Pose = { ...CROUCH, drop: mix(50, 64, offer), lean: mix(16, 24, offer) - recoil * 14, armF: [mix(62, 85, offer) - recoil * 30, mix(30, 15, offer) + recoil * 60] };
  const yh = headAt(YX, STORE.floor, S, pose, -1);
  const c = STORE.cat;
  const cams: Record<CatShot, Camera> = {
    crouch: camAt(frame, [[k.cat, { x: 350, y: 760, zoom: 2.1 }], [k.eye, { x: 340, y: 760, zoom: 2.2 }]]),
    eye: camAt(frame, [[k.eye, insert(c.x + 20, c.y - 120, 3.6)], [k.speak, insert(c.x + 20, c.y - 120, 3.8)]]),
    offer: camAt(frame, [[k.speak, closeUp(yh.x - 60, yh.y + 30, 2.6)], [k.catStare, closeUp(yh.x - 80, yh.y + 30, 2.75)]]),
    swat: camAt(frame, [[k.catStare, { x: (c.x + yh.x) / 2, y: c.y - 110, zoom: 2.6 }], [k.catShut, { x: (c.x + yh.x) / 2 - 10, y: c.y - 110, zoom: 2.7 }]]),
    cat: camAt(frame, [[k.catShut, insert(c.x + 20, c.y - 120, 3.7)], [k.never, insert(c.x + 20, c.y - 120, 3.9)]]),
    you: camAt(frame, [[k.never, closeUp(yh.x - 30, yh.y, 2.8)], [k.phone, closeUp(yh.x - 30, yh.y, 3.0)]]),
  };
  const cam = drift(cams[on], frame, "cat", 2.5);
  const speaking = on === "offer" && frame >= k.speak + 8 && frame < k.speak + 40;
  const youFace: Look = on === "you" ? { brows: "worry", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.3 } }
    : recoil > 0.3 ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.25, look: { x: 0.9, y: 0.2 } }
    : { brows: "raised", lids: 0, mouth: speaking && Math.floor(frame / 5) % 2 ? "open" : "smile", eyes: 1.05, look: { x: 0.9, y: 0.4 } };
  const catEyes = frame >= k.eye && frame < k.catShut + 10 ? "one" : "shut";
  const catHead = { x: c.x + 18, y: c.y - 112 };
  return (
    <StoreShot frame={frame} cam={cam} mood={mood} youX={YX} youFacing={-1} youPose={pose} youFace={youFace} youHeld={LETTER}
      mjFace={{ brows: "none", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 0.5, y: 0.3 } }} mjHeld={HALF} catEyes={catEyes}
      youExtra={<Paw x={catHead.x} y={catHead.y + 50} t={(frame - swatAt) / 12} />} />
  );
};
