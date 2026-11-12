// Beat "The Dilemma" (script.md, ## [07:12] The Dilemma; narration lines 78-83). Mood lamp, closing.
//
//   78  closing, the last customers gone: the coffee seller at the edge of frame, phone up, filming; him at the counter,
//       both hands on the box lid; his card flips crimson, TAKES THE BOX 94%; yours drops, POCKETS KEY 97%; her phone;
//       his hands on the lid; his card on "Ninety-four"
//   79  a paper strip of every card you've confirmed, stamped teal one after another as it runs past: PAYS, TAKES THE
//       SIX-TEN, WIPES COUNTER, POCKETS KEY x3; then the brain diagram again, the early signal line drawn as before,
//       then a flat line over it, the early one fading (c06)
//   80  the flat line; "And you're about to.": the counter in the thumbnail's geometry, your eyes going to your pocket
//   81  close on your face; behind you, out of focus, the coffee board on 1.50, the landlord's envelope, the man with the
//       same lunch's empty table
//   82  insert: your hand in your pocket on the key; his hands flat on the lid; the two cards over you, his crimson,
//       yours teal (it ticks); close on yours; her phone still filming and her board
//   83  your hand comes up out of your pocket with the key, a close cut on the thumbnail's geometry; the next beat (The
//       Key) opens on the thumbnail's wide frame with the key on your open palm, a cut on the action
import { AbsoluteFill } from "remotion";
import { STAND, lerpPose, type Pose } from "@whatif/kit/rig/pose";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { FONT } from "@whatif/kit/fonts";
import { INK, PAPER, TEAL } from "@whatif/kit/theme";
import { lineAt, moodNow, pop } from "../kit";
import { TagSounds, type TagKey } from "../device";
import { camAt, current, lineEnd, ramp, type Beat, type Shot } from "../shared";
import { COURT } from "../sets/FoodCourt";
import { BrainShot, onSheet } from "./SixtyPerCent.Brain";
import { body, friendBody, headOf, heads, Phone, PocketShot, reachPose, StallScene, tagShot, type Actor } from "./SixtyPerCent.Parts";
import { HELD_KEY, lidTop, TBOX, thHeads, ThumbScene } from "./TheDilemma.Thumb";

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  return {
    open: from(78), // "Closing. The last customers gone."
    box: from(78) + 10, // his card: TAKES THE BOX 94%
    yours: from(78) + 34, // your card: POCKETS KEY 97%
    phone: at(78, 0.3), // "The coffee seller's phone is already up."
    hands: at(78, 0.56), // "Because his tag says takes the box."
    card: at(78, 0.8), // "Ninety-four."
    strip: from(79), // "Everything it ever got right about you ..."
    pays: at(79, 0.1),
    train: at(79, 0.22), // "... a coffee, a train ..."
    wipes: at(79, 0.28),
    keys: at(79, 0.33), // "... a key."
    brain: at(79, 0.41), // "When scientists watched people choose where real charity money would go ..."
    signal: at(79, 0.46),
    flat: at(79, 0.8), // "... the famous early brain signal was missing."
    never: from(80), // "It has never seen you choose something that mattered."
    about: at(80, 0.52), // "And you're about to."
    face: from(81), // "A month of half price. What did you stop doing for it?"
    pocket: from(82), // "Pocket the key, and the city's right, and your rent stays half."
    lid: at(82, 0.22),
    cards: at(82, 0.42), // "Hold it out ..."
    mine: at(82, 0.62), // "... and your tag goes crimson in front of everyone."
    money: at(82, 0.84), // "And so, maybe, does your money."
    out: from(83), // "You take the key out of your pocket."
    end: to,
  };
}

const hisKeys = (k: T): TagKey[] => [
  { at: k.open - 400, text: "TAKES THE KEY", pct: 88, state: "crimson" },
  { at: k.box, text: "TAKES THE BOX", pct: 94, state: "crimson" },
];
const yourKeys = (k: T): TagKey[] => [
  { at: k.yours, text: "POCKETS KEY", pct: 97, state: "new" },
  { at: k.cards + 4, text: "POCKETS KEY", pct: 97, state: "tick" },
];

// ------------------------------------------------------------------------------------------------ closing (court geometry)

const Closing: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow>; on: "wide" | "phone" | "hands" | "card" | "money" }> = ({ frame, k, mood, on }) => {
  const fb = friendBody({ ...STAND, lean: 20 });
  const friend: Actor = {
    pose: reachPose(fb, { x: 800, y: 672 }, { x: 900, y: 672 }), tag: hisKeys(k),
    face: { brows: "worry", lids: 0.35, mouth: "flat", eyes: 1, look: frame >= k.box + 10 && frame < k.box + 40 ? { x: 0.1, y: -0.9 } : { x: 0.6, y: 0.8 } },
  };
  const you: Actor = {
    pose: { ...STAND, armF: [6, 12] }, tag: yourKeys(k), tagScale: 0.85,
    face: { brows: "worry", lids: 0.2, mouth: "flat", eyes: 1, look: frame >= k.yours + 6 && frame < k.yours + 36 ? { x: 0.3, y: -0.9 } : { x: 0.9, y: 0.2 } },
  };
  const cb = body(COURT.coffee.seller.x, STAND, -1);
  const ch = headOf(undefined, COURT.coffee.seller.x, -1);
  const coffee: Actor = {
    pose: reachPose(cb, { x: ch.x - 210, y: ch.y + 10 }), held: <Phone />,
    face: { brows: "raised", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0.2 } },
  };
  const h = heads(you, friend);
  const cams: Record<typeof on, Camera> = {
    wide: camAt(frame, [[k.open, { x: 930, y: 500, zoom: 1.05 }], [k.phone, { x: 950, y: 500, zoom: 1.12 }]]),
    phone: camAt(frame, [[k.phone, { x: 1560, y: 470, zoom: 2.2 }], [k.hands, { x: 1550, y: 470, zoom: 2.35 }]]),
    hands: camAt(frame, [[k.hands, insert(850, 690, 3.0)], [k.card, insert(850, 690, 3.2)]]),
    card: camAt(frame, [[k.card, tagShot(h.friend, 2.1)], [k.strip, tagShot(h.friend, 2.35)]]),
    money: camAt(frame, [[k.money, { x: 1600, y: 330, zoom: 1.7 }], [k.out, { x: 1620, y: 340, zoom: 1.8 }]]),
  };
  return (
    <StallScene frame={frame} cam={drift(cams[on], frame, `dilemma-${on}`, on === "hands" ? 1.5 : 3)} mood={mood} backMood="lamp" diners={false}
      you={you} friend={friend} coffee={coffee} coffeeBoard={[{ at: 0, value: "1.50" }]} />
  );
};

// ------------------------------------------------------------------------------------------------ the strip of confirmed cards

const STRIP_CARDS = ["PAYS", "TAKES THE SIX-TEN", "WIPES COUNTER", "POCKETS KEY", "POCKETS KEY", "POCKETS KEY"];
const cardW = (t: string) => t.length * 27 + 110;
const STRIP_X = STRIP_CARDS.reduce<number[]>((xs, t, i) => [...xs, i === 0 ? 260 : xs[i - 1] + cardW(STRIP_CARDS[i - 1]) / 2 + 50 + cardW(t) / 2], []);

const MiniCard: React.FC<{ x: number; text: string; s: number }> = ({ x, text, s }) => {
  const w = cardW(text);
  return (
    <g transform={`translate(${x} 540) scale(${s}) rotate(${(x % 7) - 3})`}>
      <rect x={-w / 2 + 8} y={-52} width={w} height={110} rx={12} fill="#000" opacity={0.25} />
      <rect x={-w / 2} y={-60} width={w} height={110} rx={12} fill="#e3f2ee" stroke={INK} strokeWidth={6} />
      <text x={-30} y={8} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#0f6f66" letterSpacing={1}>{text}</text>
      <path d={`M${w / 2 - 64} -6 l14 16 l28 -30`} fill="none" stroke={TEAL} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

const Strip: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const at = [k.pays, k.train, k.wipes, k.keys, k.keys + 8, k.keys + 16];
  const n = Math.max(0, at.filter((a) => frame >= a).length - 1);
  const last = STRIP_X[n];
  const cam = camAt(frame, [[k.strip, { x: 300, y: 540, zoom: 1.5 }], ...at.map((a, i): [number, Camera] => [a + 6, { x: Math.max(300, STRIP_X[i] - 80), y: 540, zoom: 1.5 }]),
    [k.brain, { x: (STRIP_X[0] + STRIP_X[5]) / 2, y: 540, zoom: 0.62 }]]);
  const actors = (
    <g>
      <rect x={-600} y={420} width={STRIP_X[5] + 1400} height={240} fill={PAPER} stroke="#cdbfa6" strokeWidth={5} />
      {Array.from({ length: 60 }, (_, i) => <line key={i} x1={-600 + i * 80} y1={430} x2={-600 + i * 80} y2={448} stroke="#cdbfa6" strokeWidth={4} />)}
      {STRIP_CARDS.map((t, i) => frame >= at[i] && <MiniCard key={i} x={STRIP_X[i]} text={t} s={Math.min(1, pop(frame, at[i], 260))} />)}
      {/* the thread of ticks running on past the last card */}
      <line x1={last + 300} y1={540} x2={last + 2000} y2={540} stroke="#cdbfa6" strokeWidth={4} strokeDasharray="10 16" />
    </g>
  );
  return <Stage cam={drift(cam, frame, "strip", 2)} radius={0} origin={{ x: 960, y: 540 }} back={<rect x={-3000} y={-2000} width={9000} height={5000} fill="#1c1f2b" />} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ the counter (thumbnail geometry)

const DOWN: Pose = { ...STAND, armF: [8, 14] };
const UP: Pose = { ...STAND, lean: 3, armF: [62, 72] };

const Counter: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow>; on: "about" | "face" | "lid" | "cards" | "mine" | "out" }> = ({ frame, k, mood, on }) => {
  const rise = ramp(frame, k.out + 6, k.out + 44);
  const youPose = on === "out" ? lerpPose(DOWN, UP, rise) : DOWN;
  const h = thHeads(youPose);
  const youFace = on === "out"
    ? { brows: rise > 0.5 ? "raised" : "flat", lids: rise > 0.5 ? 0 : 0.25, mouth: "flat", eyes: rise > 0.5 ? 1.15 : 1, look: rise > 0.3 ? { x: 1, y: 0.1 } : { x: 0.6, y: 0.9 } } as const
    : on === "about" ? { brows: "worry", lids: 0.3, mouth: "flat", eyes: 1, look: frame < k.about + 25 ? { x: 1, y: 0.4 } : { x: 0.3, y: 0.95 } } as const
    : on === "face" ? { brows: "worry", lids: 0.2 + 0.15 * Math.sin((frame - k.face) / 30), mouth: "flat", eyes: 1, look: { x: 0.9 - ramp(frame, k.face + 40, k.face + 60) * 0.5, y: 0.15 } } as const
    : on === "mine" ? { brows: "worry", lids: 0.1, mouth: "flat", eyes: 1, look: { x: 0.2, y: -0.95 } } as const
    : { brows: "worry", lids: 0.25, mouth: "flat", eyes: 1, look: { x: 1, y: 0.2 } } as const;
  const friendFace = { brows: "worry", lids: 0.3, mouth: "frown", eyes: 1.05, look: on === "cards" ? { x: 0.3, y: -0.9 } : { x: 0.7, y: 0.8 } } as const;
  const cams: Record<typeof on, Camera> = {
    about: camAt(frame, [[k.about, { x: 960, y: 560, zoom: 1.0 }], [k.face, { x: 900, y: 580, zoom: 1.08 }]]),
    face: camAt(frame, [[k.face, closeUp(h.you.x + 230, h.you.y - 30, 1.45)], [k.pocket, closeUp(h.you.x + 220, h.you.y - 30, 1.58)]]),
    lid: camAt(frame, [[k.lid, insert(TBOX.x + 20, lidTop() - 30, 2.4)], [k.cards, insert(TBOX.x + 20, lidTop() - 30, 2.6)]]),
    cards: camAt(frame, [[k.cards, { x: 960, y: 520, zoom: 0.96 }], [k.mine, { x: 960, y: 520, zoom: 1.02 }]]),
    mine: camAt(frame, [[k.mine, { x: h.you.x + 60, y: 480, zoom: 1.6 }], [k.money, { x: h.you.x + 60, y: 470, zoom: 1.7 }]]),
    out: camAt(frame, [[k.out, { x: 650, y: 800, zoom: 1.55 }], [k.end, { x: 680, y: 790, zoom: 1.6 }]]),
  };
  return (
    <ThumbScene frame={frame} cam={drift(cams[on], frame, `dilemma-th-${on}`, on === "out" ? 1.5 : 3)} mood={mood}
      youPose={youPose} youFace={youFace} youHeld={on === "out" ? HELD_KEY : undefined}
      youTag={on === "cards" || on === "mine" ? yourKeys(k) : undefined}
      friendFace={friendFace} friendTag={hisKeys(k)} bothHands soft={on === "face"} />
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const mood = moodNow(shot);
  const on = current(frame, [[0, "wide"], [k.phone, "phone"], [k.hands, "hands"], [k.card, "card"], [k.strip, "strip"], [k.brain, "brain"],
    [k.about, "about"], [k.face, "face"], [k.pocket, "pocket"], [k.lid, "lid"], [k.cards, "cards"], [k.mine, "mine"], [k.money, "money"], [k.out, "out"]] as [number, string][]);
  let picture: React.ReactNode;
  if (on === "wide" || on === "phone" || on === "hands" || on === "card" || on === "money") picture = <Closing frame={frame} k={k} mood={mood} on={on} />;
  else if (on === "strip") picture = <Strip frame={frame} k={k} />;
  else if (on === "brain") {
    const p = (sx: number, sy: number, zoom: number): Camera => ({ ...onSheet(sx, sy), zoom });
    const cam = camAt(frame, [[k.brain, p(560, 430, 1.05)], [k.signal + 30, p(900, 430, 1.4)], [k.flat, p(1000, 440, 1.5)], [k.about, p(1040, 450, 1.7)]]);
    picture = <BrainShot frame={frame} cam={drift(cam, frame, "brain-flat", 2)} mood={mood}
      t={{ sheet: k.brain, head: k.brain + 2, ring: k.brain + 18, signal: k.signal, flat: k.flat }} />;
  } else if (on === "pocket") {
    const cam = camAt(frame, [[k.pocket, { x: 960, y: 560, zoom: 1.0 }], [k.lid, { x: 960, y: 600, zoom: 1.12 }]]);
    picture = <PocketShot mood={mood} cam={drift(cam, frame, "dilemma-pocket", 2)} inside={1} grip={1} glint={0.5 + 0.5 * Math.sin((frame - k.pocket) / 8)} />;
  } else picture = <Counter frame={frame} k={k} mood={mood} on={on as "about" | "face" | "lid" | "cards" | "mine" | "out"} />;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      <TagSounds keys={hisKeys(k).slice(1)} />
      <TagSounds keys={yourKeys(k)} />
    </AbsoluteFill>
  );
};

export const theDilemma: Beat = { id: "theDilemma", firstLine: 78, Component: Scene };
