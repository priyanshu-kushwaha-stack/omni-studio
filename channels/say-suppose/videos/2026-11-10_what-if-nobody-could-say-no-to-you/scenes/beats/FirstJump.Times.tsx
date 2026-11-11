// Timing and small shared bits for the beat "The first jump" (FirstJump.tsx and its FirstJump.<Part>.tsx helpers).
// Every frame the beat uses comes from the narration clips here, so a new take re-times the whole beat.
import type { Mouth } from "@whatif/kit/rig/Figure";
import { joints, type Pose } from "@whatif/kit/rig/pose";
import { INK, PAPER, TEAL } from "@whatif/kit/theme";
import type { Clip } from "@whatif/kit/timeline";
import { aimArm, type Body } from "../parts2";
import { lineEnd } from "../shared";

export type T = ReturnType<typeof times>;

/** Every frame the beat uses (`at(i, p)`: p of the way through line i; `end(i)` the line's last frame). */
export function times(clips: Clip[], to: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const end = (i: number) => lineEnd(clips, i);
  const half = (a: number, b: number) => Math.round((a + b) / 2);
  return {
    clips,
    // 13-14 Monday, the chai stall: wide; you point at the bowl; insert; he lifts the whole bowl; it lands in your hands.
    stall: from(13),
    point: at(13, 0.42), // "A little extra chutney?"
    bowlIn: at(13, 0.74), // insert: your fingertip, the bowl; his hand comes in
    lift: end(13) - 8, // he lifts the whole bowl
    give: from(14) - 3, // two-shot: the bowl travels into your hands
    bowlSnap: from(14) + 6,
    turn: from(14) + 20, // he turns back to the kettle
    stand: end(14) + 2, // the hold: you holding the bowl, the student looks at the bowl ...
    student: half(end(14), from(15)), // ... then at you
    // 15-17 the bus.
    bus: from(15) - 3,
    bag: at(15, 0.34), // "the auntie's bag is on the seat"
    lean: at(15, 0.58), // "and you get as far as ..."
    excuse: at(15, 0.8), // your mouth opens: "excuse..."
    bagSnap: at(15, 0.88), // the bag is already in her lap
    pat: from(16), // "Sit, sit, beta." she pats the seat
    sit: from(17) + 2, // you sit, squeezed
    squeeze: at(17, 0.45), // close on you and the bag
    // 18-19 the auto at night.
    auto: from(18) - 8, // he counts your change into your hand ...
    fold: from(18) + 16, // ... folds his hands: "Thank you, thank you."
    meter: from(19) - 2, // insert: the meter, glowing
    bow: at(19, 0.5), // "He thanks you for the fare.": another bow
    back: end(19) + 2, // the hold: you look at your change ...
    backLook: half(end(19), from(20)), // ... then at the back of his head
    // 20-21 Tuesday: the flood.
    tue: from(20),
    raise: at(20, 0.5), // "A little more chai?": you lift your glass an inch
    pourSnap: end(20) + 2,
    pour: end(20) + 4, // insert: the glass, the saucer, a second saucer, the counter
    trophy: from(21) - 20, // you hold the glass above the flood
    beam: at(21, 0.12), // close on his smile: "Same glad smile as yesterday."
    same: at(21, 0.55), // "Exactly the same.": Monday and Tuesday side by side
    drain: at(21, 0.84), // close on you, the fun draining
    // 22 the phone; 23 the mirror.
    phone: from(22) - 4,
    typed: at(22, 0.2),
    send: at(22, 0.25),
    nothing: at(22, 0.36), // "In writing, nothing."
    dots: at(22, 0.54),
    reply: at(22, 0.64), // "let's discuss": two small bars
    look: at(22, 0.84), // "like a boss": close on you in the bathroom with the phone
    mirror: from(23) - 2,
    doesnt: at(23, 0.6), // "It doesn't.": the reflection frowns back
    // 24-26 "Do you like me?"
    like: end(23) - 2,
    likeSnap: from(24) + 2,
    smile: from(25), // "He says yes. Same smile."
    noIdea: at(25, 0.55), // "And you have no idea." and the hold: close on you, his smile in the corner
    tagIn: from(26) - 2, // "A yes.": the tag
    thing: at(26, 0.3), // "A thing."
    walk: at(26, 0.56), // "Never what anyone feels.": you walk off; he is back at the kettle
    // 27-31 Dev.
    platform: from(27),
    devClose: at(27, 0.36), // "Your oldest friend."
    youClose: at(27, 0.66), // "You've never had to ask him for anything."
    saved: from(28) - 2, // "Saved it. Hurry up."
    run: from(28) + 12,
    car: from(29) - 2, // "He saves the window seat."
    cup: at(29, 0.5), // "He splits the last chai."
    ots: end(29) - 10, // over his shoulder: your phone, the message half typed
    yaar: from(30) + 10, // "Just send it, yaar."
    lock: end(30) + 2, // you lock the phone
    shrug: from(31) + 2,
    write: at(31, 0.24),
    tear: at(31, 0.54),
    tuck: at(31, 0.64),
    note: end(31) - 6, // insert: the page in your scarf
    // 32-36 the office.
    office: from(32),
    door2: at(32, 0.5),
    friday: end(32) - 12, // bubble "Friday off?"
    fridaySnap: from(33) - 2, // "Take Monday too."
    twist: from(34), // close on you, the scarf twisting
    still: at(34, 0.42), // close on the boss: the smile does not move an inch
    pitch: at(34, 0.72), // bubble "The pitch. Mine?"
    pitchSnap: from(35) - 2, // "All yours. Obviously."
    walkBack: end(35) + 2, // the hold: you walk back past Dev, thumbs up, you sit
    sitDown: end(35) + 2 + Math.round((from(36) - end(35)) * 0.8),
    hands: from(36), // "You got the project you wanted."
    earned: at(36, 0.45), // "And you will never know if you earned it."
    end: to,
  };
}

/** A speaking mouth over line `clip`: two shapes in turn, about four changes a second, `rest` outside the line. */
export function talk(frame: number, clip: Clip, rest: Mouth = "smile", a: Mouth = "open", b: Mouth = "smile"): Mouth {
  if (frame < clip.from || frame >= clip.from + clip.frames) return rest;
  return Math.floor((frame - clip.from) / 7) % 2 === 0 ? a : b;
}

/** A twisted end of your teal scarf between two hands at (x, y): it wrings on `frame` (nerves). World units. */
export const ScarfTwist: React.FC<{ x: number; y: number; scale: number; frame: number }> = ({ x, y, scale, frame }) => {
  const w = Math.sin(frame / 5) * 14;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${w})`}>
      <path d="M-26 -8 Q-10 -20 0 -6 Q10 8 26 -4 L28 8 Q10 20 0 6 Q-10 -8 -24 4Z" fill={TEAL} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    </g>
  );
};

/** A small torn notebook page with a line of ink (no letters), centred at (x, y). */
export const NotePage: React.FC<{ x: number; y: number; scale?: number; tilt?: number }> = ({ x, y, scale = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <path d="M-30 -22 H30 V18 L24 22 L18 18 L12 22 L6 18 L0 22 L-6 18 L-12 22 L-18 18 L-24 22 L-30 18Z" fill={PAPER} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    {[-14, -6, 2].map((ly, i) => <line key={ly} x1={-30} y1={ly} x2={30} y2={ly} stroke="#9fc0e0" strokeWidth={1.5} opacity={0.8 - i * 0.1} />)}
    <rect x={-22} y={-11} width={34} height={5} rx={2.5} fill={INK} />
    <rect x={-22} y={-3} width={22} height={5} rx={2.5} fill={INK} />
  </g>
);

type Pt = { x: number; y: number };

/** A body at (x, y) in `base` pose with its front and/or back hand put on world points (aimArm, after the lean). */
export function aimed(x: number, y: number, scale: number, facing: 1 | -1, base: Pose, front?: Pt | null, back?: Pt | null): Body {
  const b: Body = { x, y, scale, facing, pose: base };
  b.pose = { ...base, armF: front ? aimArm(b, front) : base.armF, armB: back ? aimArm(b, back) : base.armB };
  return b;
}

/** Draws children in a figure's head space (the same transform Figure uses for the face), for a moustache or a bindi. */
export const OnHead: React.FC<Body & { children: React.ReactNode }> = ({ x, y, scale, pose, facing, children }) => {
  const j = joints(pose);
  return <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale}) translate(${j.head.x} ${j.head.y}) rotate(${pose.tilt})`}>{children}</g>;
};

/** A thick ink moustache under the eyes, in head space (use inside <OnHead>). */
export const Moustache: React.FC = () => (
  <path d="M-8 11 Q2 4 6 9 Q10 4 22 11 Q14 16 6 12 Q-2 16 -8 11Z" fill={INK} />
);
