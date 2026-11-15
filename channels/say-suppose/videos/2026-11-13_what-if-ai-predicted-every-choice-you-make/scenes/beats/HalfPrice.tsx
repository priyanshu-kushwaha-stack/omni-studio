// Beat "Half Price" (script.md v2, ## [00:07] Half Price; narration lines 3-6). The title question by about 0:08, the
// stakes with the rate board's two arrows, the habit on three other nights, the wave of heads.
//
//   3    the title question: close on your face under your teal card, eyes on her price board; then his, pointing up at
//        his own card with the cup, delighted
//   4    "Obey your tag, and your rent halves.": the lamppost outside the court, YOUR RATE 100 under the teal lamp, the
//        small teal arrow pulsing; "Break it, and it goes crimson where every head can see": a flash across the court, a
//        stranger's card buzzing crimson, every face near him turning; "and your prices climb.": the board again, the
//        crimson arrow pulsing
//   5    "Closing time. A food court in Singapore.": the court wide at closing; three other nights at the same counter, the
//        lamp warmer each time (the coins into the tin; his open hand; your key held out over it and pulled back); then
//        tonight, the two teal ticks, you both grin; "Tonight it came with a number.": insert, your 91
//   6    the wave: heads tilt up at their own cards one after another and every card ticks teal in turn; "It's right
//        ninety-nine times in a hundred.": a pan across the cards; "About everybody.": the two of you looking up
// The title ident (C) the script puts after line 6 is not drawn here (brand/IdentC.tsx is outside the scenes build).
import { AbsoluteFill } from "remotion";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import type { Clip as LineClip } from "@whatif/kit/timeline";
import { CRIMSON, INK, TEAL } from "@whatif/kit/theme";
import { RateBoard, TagSounds, TealLamp, type BoardKey, type TagKey } from "../device";
import { aimArm, handAt, lineAt, moodNow, Strollers } from "../kit";
import { camAt, current, mix, ramp, type Beat, type Shot } from "../shared";
import { COURT, Key } from "../sets/FoodCourt";
import { LAMPPOST, Lamppost, LamppostBack, lamppostLights } from "../sets/CourtLamppost";
import {
  CL, CloseShot, Coin, CourtShot, EXTRAS, friendBody, friendHead, IcedCoffee, Palm, youBody, youHead,
  type CourtTags, type Face, type Mood,
} from "./TheLamp.Court";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: LineClip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  return {
    face: from(3), // the title question, your face
    his: at(3, 0.56), // "and paid you every time it was right?": his, pointing at his card with the cup
    point: at(3, 0.62),
    post: from(4), // "Obey your tag, and your rent halves."
    halves: at(4, 0.16),
    flash: at(4, 0.4), // "Break it, and it goes crimson where every head can see,"
    buzz: at(4, 0.46),
    climb: at(4, 0.8), // "and your prices climb."
    court: from(5), // "Closing time. A food court in Singapore."
    n1: at(5, 0.2), // "Every night you count the box."
    n2: at(5, 0.36), // "Every night he holds out his hand."
    n3: at(5, 0.52), // "Every night you pocket the key."
    joke: at(5, 0.69), // "The oldest joke you two have.": tonight
    number: at(5, 0.85), // "Tonight it came with a number."
    wave: from(6), // "And here's the thing."
    right: at(6, 0.36), // "It's right ninety-nine times in a hundred."
    everybody: at(6, 0.8), // "About everybody."
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ the tags

const held = (text: string, pct: number): TagKey[] => [{ at: -1e4, text, pct, state: "tick" }];

/** Who ticks when in the wave: left to right across the court. */
const ORDER = [...EXTRAS.map((e) => ({ id: e.id, x: e.x })), { id: "you", x: COURT.you.x }, { id: "friend", x: COURT.friend.x },
  { id: "seller", x: COURT.coffee.seller.x }].sort((a, b) => a.x - b.x);
const waveAt = (k: T, id: string) => k.wave + 6 + ORDER.findIndex((o) => o.id === id) * 7;

/** Tonight's cards: yours and his teal (the script's); everyone else's digits only, still running crimson, the stranger's
 *  buzzing crimson at the flash; then the wave ticks every card teal in turn. */
function tagKeys(k: T): CourtTags {
  const out: CourtTags = {
    you: [...held("POCKETS KEY", 91), { at: waveAt(k, "you"), text: "POCKETS KEY", pct: 91, state: "tick" }],
    friend: [...held("PAYS", 97), { at: waveAt(k, "friend"), text: "PAYS", pct: 97, state: "tick" }],
    seller: [{ at: -1e4, text: "", pct: 98, state: "new" }, { at: waveAt(k, "seller"), text: "", pct: 98, state: "tick" }],
  };
  for (const e of EXTRAS) {
    const keys: TagKey[] = [{ at: -1e4, text: "", pct: e.pct, state: "new" }];
    if (e.id === "last") keys.push({ at: k.buzz, text: "", pct: e.pct, state: "crimson" });
    keys.push({ at: waveAt(k, e.id), text: "", pct: e.pct, state: "tick" });
    out[e.id] = keys;
  }
  return out;
}

const RATE: BoardKey[] = [{ at: -1e4, value: "100" }];
const HALF: BoardKey[] = [{ at: -1e4, value: "1.50" }];

// ------------------------------------------------------------------------------------------------ line 3: the question

const CLOSE: Camera = { x: 960, y: 540, zoom: 1 };
const COFFEE_HELD = <IcedCoffee x={6} y={-8} scale={1} />;

/** Line 3: your face under your teal card, eyes on her board; then his, pointing up at his own card with the cup. */
const Question: React.FC<{ frame: number; k: T; mood: Mood; tags: CourtTags }> = ({ frame, k, mood, tags }) => {
  const two = { you: tags.you!, friend: tags.friend! };
  if (frame < k.his) {
    const h = youHead({ ...STAND, lean: 4 });
    const cam = drift(camAt(frame, [[k.face, closeUp(h.x + 140, h.y - 70, 1.45)], [k.his, closeUp(h.x + 140, h.y - 80, 1.56)]]), frame, "q-you", 1.5);
    const slyAt = k.face + Math.round((k.his - k.face) * 0.55);
    return (
      <CloseShot frame={frame} cam={cam} mood={mood} teal={-1e4} glowFace={0.6}
        you={{ pose: { ...STAND, lean: 4, tilt: -3, armF: [6, 14] }, face: { brows: "raised", lids: frame >= slyAt ? 0.25 : 0.05, mouth: frame >= slyAt ? "smirk" : "flat", eyes: 1.05, look: { x: 1, y: -0.45 } } }}
        friend={{ pose: STAND, face: {}, held: COFFEE_HELD }} tags={two} />
    );
  }
  const fh = friendHead(STAND);
  const cam = drift(camAt(frame, [[k.his, closeUp(fh.x - 40, fh.y - 160, 1.55)], [k.post, closeUp(fh.x - 40, fh.y - 170, 1.66)]]), frame, "q-him", 1.5);
  const point = ramp(frame, k.point, k.point + 8);
  const rest: Pose = { ...STAND, lean: 4, armF: [40, 60] };
  const fPose: Pose = { ...rest, tilt: -8 * point, armF: [mix(40, 168, point), mix(60, 4, point)] };
  return (
    <CloseShot frame={frame} cam={cam} mood={mood} teal={-1e4}
      you={{ pose: { ...STAND, lean: 4, armF: [6, 14] }, face: { brows: "raised", mouth: "smirk", look: { x: 1, y: -0.3 } } }}
      friend={{ pose: fPose, face: { brows: "raised", lids: 0, mouth: point > 0.5 ? "open" : "smile", eyes: 1.15, look: { x: 1, y: point > 0.5 ? 0.05 : -0.6 } }, held: COFFEE_HELD }}
      tags={two} />
  );
};

// ------------------------------------------------------------------------------------------------ line 4: the stakes

/** A small arrow beside the rate board, pulsing on its word: teal points down (cheaper), crimson points up. */
const Arrow: React.FC<{ x: number; y: number; up: boolean; pulse: number }> = ({ x, y, up, pulse }) => {
  const s = 1 + 0.45 * pulse;
  const color = up ? CRIMSON : TEAL;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={44} fill={color} opacity={0.35 * pulse} />
      <path d={up ? "M-22 12 L0 -20 L22 12Z" : "M-22 -12 L0 20 L22 -12Z"} fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

/** Lines 4: the lamppost outside the court, YOUR RATE 100, the teal arrow on "halves", the crimson one on "climb". */
const PostShot: React.FC<{ frame: number; k: T; mood: Mood }> = ({ frame, k, mood }) => {
  const b = LAMPPOST.board;
  const first = frame < k.flash;
  const cam = first
    ? drift(camAt(frame, [[k.post, insert(b.x, b.y - 30, 1.7)], [k.flash, insert(b.x, b.y + 10, 2.3)]]), frame, "post", 1.5)
    : drift(camAt(frame, [[k.climb, insert(b.x, b.y + 30, 2.5)], [k.court, insert(b.x, b.y + 30, 2.7)]]), frame, "post2", 1.5);
  const beat = (f0: number) => (frame >= f0 ? Math.max(0, Math.sin(((frame - f0) / 9) * Math.PI)) * Math.max(0, 1 - (frame - f0) / 60) : 0);
  const pulseDown = first ? beat(k.halves) : 0;
  const pulseUp = first ? 0 : beat(k.climb + 2);
  const actors = (
    <>
      <Lamppost />
      <TealLamp frame={frame} x={LAMPPOST.lamp.x - 30} y={LAMPPOST.lamp.y} size={30} />
      <RateBoard frame={frame} x={b.x} y={b.y} size={52} label="YOUR RATE" keys={RATE} />
      <Arrow x={b.x - 140} y={b.y + 60} up={false} pulse={pulseDown} />
      <Arrow x={b.x + 140} y={b.y + 60} up pulse={pulseUp} />
    </>
  );
  return (
    <LookContext.Provider value={setLook(lamppostLights(), mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={<><LamppostBack cam={cam} frame={frame} /><Strollers cam={cam} depth={0.7} frame={frame} y={1000} scale={1.4} count={3} seed={4} /></>}
        actors={actors} />
    </LookContext.Provider>
  );
};

/** Line 4, the flash: a stranger's card buzzes crimson across the court; every face near him turns. */
const FlashShot: React.FC<{ frame: number; k: T; mood: Mood; tags: CourtTags }> = ({ frame, k, mood, tags }) => {
  const cam = drift(camAt(frame, [[k.flash, { x: 1150, y: 500, zoom: 1.25 }], [k.climb, { x: 1230, y: 480, zoom: 1.45 }]]), frame, "flash", 2);
  const turn = ramp(frame, k.buzz + 4, k.buzz + 12);
  const toward = (x: number) => ({ x: x * turn + 0.4 * (1 - turn), y: mix(0.4, -0.15, turn) });
  const looks = { mop: toward(1), cook: toward(-1), guard: toward(1), last: { x: 0.2, y: frame >= k.buzz ? -1 : 0.3 } };
  return (
    <CourtShot frame={frame} cam={cam} mood={mood} tags={tags} looks={looks} up={{ last: ramp(frame, k.buzz, k.buzz + 6) }} lampOn={-1e4} pillarKeys={RATE}
      you={{ pose: STAND, face: { brows: turn > 0.5 ? "raised" : "none", mouth: turn > 0.5 ? "o" : "flat", eyes: 1 + 0.15 * turn, look: toward(1) } }}
      friend={{ pose: STAND, face: { brows: turn > 0.5 ? "raised" : "none", mouth: turn > 0.5 ? "o" : "smile", eyes: 1 + 0.15 * turn, look: toward(-1) }, held: COFFEE_HELD }}
      seller={{ face: { brows: turn > 0.5 ? "raised" : "none", lids: 0.1, eyes: 1.05, look: toward(1) } }} />
  );
};

// ------------------------------------------------------------------------------------------------ line 5: every night

const OFFER: Pose = { ...STAND, lean: 6, tilt: 4, armF: [84, -6], armB: [-6, 14] };
const OFFER_HAND = handAt(youBody(OFFER), "front");

/** Line 5: the court at closing; three other nights, warmer each time; tonight, the two ticks; your 91. */
const Nights: React.FC<{ frame: number; k: T; mood: Mood; tags: CourtTags }> = ({ frame, k, mood, tags }) => {
  const on = current(frame, [[k.court, "court"], [k.n1, "coins"], [k.n2, "hand"], [k.n3, "pocket"], [k.joke, "tonight"], [k.number, "number"]]);
  const two = { you: tags.you!, friend: tags.friend! };
  if (on === "court") {
    // closing time: the court wide, shutters half down, the last people, every card over every head
    const cam = drift(camAt(frame, [[k.court, { x: 960, y: 540, zoom: 1.0 }], [k.n1, { x: 900, y: 560, zoom: 1.08 }]]), frame, "closing", 2);
    return (
      <CourtShot frame={frame} cam={cam} mood={mood} tags={tags} lampOn={-1e4} pillarKeys={RATE} priceKeys={HALF}
        you={{ pose: { ...STAND, armF: [30, 50] }, face: { lids: 0.2, mouth: "smile", look: { x: 1, y: 0.3 } } }}
        friend={{ pose: { ...STAND, armF: [40, 60] }, face: { lids: 0.1, mouth: "smile", look: { x: 1, y: 0.1 } }, held: COFFEE_HELD }}
        seller={{ face: { lids: 0.35, look: { x: 0.3, y: 0.8 } } }} />
    );
  }
  if (on === "coins") {
    const cam = drift(camAt(frame, [[k.n1, insert(CL.box.x - 40, 840, 2.1)], [k.n2, insert(CL.box.x - 40, 840, 2.25)]]), frame, "n1", 2);
    const t = (frame - k.n1) % 16;
    const over = { x: CL.box.x - 20, y: 790 };
    const down = { x: 690, y: 1030 };
    const p = t < 5 ? 0 : t < 10 ? ramp(t, 5, 10) : 1 - ramp(t, 10, 16);
    const hand = { x: mix(over.x, down.x, p), y: mix(over.y, down.y, p) };
    const falling = t < 5 ? [{ x: over.x + 20, y: mix(over.y + 40, CL.top - 70, t / 5) }] : [];
    return (
      <CloseShot frame={frame} cam={cam} mood={mood} warm={1}
        you={{ pose: { ...STAND, lean: 6, armF: aimArm(youBody(STAND), hand) }, face: { lids: 0.35, mouth: "flat", look: { x: 0.8, y: 0.7 } }, held: t >= 10 ? <Coin x={4} y={-2} r={4.5} /> : undefined }}
        friend={{ pose: { ...STAND, lean: 10, armF: aimArm(friendBody({ ...STAND, lean: 10 }), { x: 1290 + Math.sin(frame / 4) * 50, y: CL.top - 8 }) }, face: { lids: 0.3, look: { x: 0.5, y: 0.8 } } }}
        box={{ open: 1, key: null, coinsIn: 3 + Math.floor((frame - k.n1) / 16) }} coins={falling} />
    );
  }
  if (on === "hand") {
    const out = ramp(frame, k.n2, k.n2 + 12);
    const palm = { x: mix(1320, 1235, out), y: mix(950, 865, out) };
    const cam = drift(camAt(frame, [[k.n2, insert(1250, 760, 1.9)], [k.n3, insert(1240, 760, 2.02)]]), frame, "n2", 2);
    return (
      <CloseShot frame={frame} cam={cam} mood={mood} warm={2}
        you={{ pose: { ...STAND, lean: 6 }, face: { mouth: "smile", look: { x: 1, y: 0.2 } } }}
        friend={{ pose: { ...STAND, lean: 10, tilt: -6, armF: aimArm(friendBody({ ...STAND, lean: 10 }), palm) }, face: { brows: "raised", mouth: "smile", eyes: 1.05, look: { x: 1, y: 0.1 } }, held: <Palm color="#f4b393" /> }} />
    );
  }
  if (on === "pocket") {
    // another night: your key held out over his palm, then pulled back, a grin
    const back = ramp(frame, k.n3 + Math.round((k.joke - k.n3) * 0.45), k.joke - 2);
    const hand = { x: mix(OFFER_HAND.x, 600, back), y: mix(OFFER_HAND.y, 1100, back * back) };
    const pose: Pose = back > 0 ? { ...OFFER, armF: aimArm(youBody(OFFER), hand) } : OFFER;
    const kh = handAt(youBody(pose), "front");
    const cam = drift(camAt(frame, [[k.n3, { x: 900, y: 640, zoom: 1.35 }], [k.joke, { x: 880, y: 660, zoom: 1.45 }]]), frame, "n3", 2);
    return (
      <CloseShot frame={frame} cam={cam} mood={mood} warm={3}
        you={{ pose, face: { brows: "raised", mouth: "smirk", look: { x: 1, y: 0.1 } } }}
        friend={{ pose: { ...STAND, lean: 10, tilt: back > 0.5 ? 8 : -6, armF: aimArm(friendBody({ ...STAND, lean: 10 }), { x: 1235, y: OFFER_HAND.y + 40 }) },
          face: { brows: "raised", mouth: back > 0.5 ? "smirk" : "smile", eyes: 1.05, look: { x: 1, y: mix(0.2, 0.7, back) } }, held: <Palm color="#f4b393" /> }}
        extra={<Key x={kh.x + mix(20, 0, back)} y={kh.y - mix(30, 10, back)} scale={mix(1.2, 0.7, back)} rotate={mix(-14, 30, back)} />} />
    );
  }
  if (on === "tonight") {
    const cam = drift(camAt(frame, [[k.joke, { x: 960, y: 520, zoom: 1.0 }], [k.number, { x: 960, y: 500, zoom: 1.05 }]]), frame, "tonight", 2);
    const grin = frame >= k.joke + 12;
    const f: Face = grin ? { brows: "raised", mouth: "smile", eyes: 1, look: { x: 1, y: 0.05 } } : { brows: "raised", mouth: "flat", eyes: 1.05, look: { x: 0.25, y: -1 } };
    return (
      <CloseShot frame={frame} cam={cam} mood={mood} teal={-1e4}
        you={{ pose: { ...STAND, lean: 4, tilt: grin ? 6 : -6, armF: [6, 14] }, face: f }}
        friend={{ pose: { ...STAND, lean: 4, tilt: grin ? 6 : -10, armF: [40, 60] }, face: f, held: COFFEE_HELD }} tags={two} />
    );
  }
  const h = youHead({ ...STAND, lean: 4 });
  const cardY = h.y - h.r - h.r * 0.95 * 0.5 * 2.1;
  const cam = drift(camAt(frame, [[k.number, insert(h.x + 20, cardY + 90, 3.0)], [k.wave, insert(h.x + 20, cardY + 90, 3.3)]]), frame, "num", 1.5);
  return (
    <CloseShot frame={frame} cam={cam} mood={mood} teal={-1e4}
      you={{ pose: { ...STAND, lean: 4, armF: [6, 14] }, face: { brows: "raised", look: { x: 0.25, y: -1 } } }}
      friend={{ pose: STAND, face: {}, held: COFFEE_HELD }} tags={two} />
  );
};

// ------------------------------------------------------------------------------------------------ line 6: the wave

/** Line 6: heads tilt up at their cards one after another, each card ticking teal; the pan; the two of you. */
const Wave: React.FC<{ frame: number; k: T; mood: Mood; tags: CourtTags }> = ({ frame, k, mood, tags }) => {
  const on = current(frame, [[k.wave, "wave"], [k.right, "pan"], [k.everybody, "us"]]);
  if (on === "us") {
    const cam = drift(camAt(frame, [[k.everybody, CLOSE], [k.end, { x: 960, y: 500, zoom: 1.08 }]]), frame, "everybody", 2);
    const f: Face = { brows: "raised", mouth: "o", eyes: 1.1, look: { x: 0.2, y: -1 } };
    return (
      <CloseShot frame={frame} cam={cam} mood={mood} teal={-1e4}
        you={{ pose: { ...STAND, lean: 4, tilt: -12, armF: [6, 14] }, face: f }}
        friend={{ pose: { ...STAND, lean: 4, tilt: -12, armF: [40, 60] }, face: { ...f, mouth: "smile" }, held: COFFEE_HELD }}
        tags={{ you: tags.you!, friend: tags.friend! }} />
    );
  }
  const cam = on === "wave"
    ? drift(camAt(frame, [[k.wave, { x: 960, y: 560, zoom: 1.0 }], [k.right, { x: 960, y: 540, zoom: 1.08 }]]), frame, "wave", 3)
    : camAt(frame, [[k.right, { x: 650, y: 470, zoom: 1.4 }], [k.everybody, { x: 1350, y: 470, zoom: 1.4 }]]);
  const up: Record<string, number> = {};
  for (const o of ORDER) up[o.id] = ramp(frame, waveAt(k, o.id) - 4, waveAt(k, o.id) + 6);
  const lookUp = (u: number, down: { x: number; y: number }): Face => ({ brows: u > 0.5 ? "raised" : "none", mouth: u > 0.5 ? "smile" : "flat", eyes: 1 + 0.08 * u, look: { x: mix(down.x, 0.2, u), y: mix(down.y, -1, u) } });
  return (
    <CourtShot frame={frame} cam={cam} mood={mood} tags={tags} up={up} pillarKeys={RATE} priceKeys={HALF} lampOn={-1e4}
      you={{ pose: { ...STAND, tilt: -12 * up.you, armF: [8, 20] }, face: lookUp(up.you, { x: 1, y: 0.2 }) }}
      friend={{ pose: { ...STAND, tilt: -12 * up.friend, armF: [40, 60] }, face: lookUp(up.friend, { x: 1, y: 0.3 }), held: COFFEE_HELD }}
      seller={{ pose: { ...STAND, tilt: -12 * up.seller }, face: { ...lookUp(up.seller, { x: 0.3, y: 0.7 }), lids: 0.3 } }} />
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const mood = moodNow(shot);
  const tags = tagKeys(k);
  const part = current(frame, [[0, "question"], [k.post, "post"], [k.flash, "flash"], [k.climb, "post"], [k.court, "nights"], [k.wave, "wave"]]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {part === "question" && <Question frame={frame} k={k} mood={mood} tags={tags} />}
      {part === "post" && <PostShot frame={frame} k={k} mood={mood} />}
      {part === "flash" && <FlashShot frame={frame} k={k} mood={mood} tags={tags} />}
      {part === "nights" && <Nights frame={frame} k={k} mood={mood} tags={tags} />}
      {part === "wave" && <Wave frame={frame} k={k} mood={mood} tags={tags} />}
      {/* the stranger's buzz, then the wave's flaps and ticks, one after another */}
      <TagSounds keys={tags.last!.filter((x) => x.at > 0)} volume={0.8} />
      {Object.entries(tags).filter(([who]) => who !== "last").map(([who, keys]) => (
        <TagSounds key={who} keys={keys.filter((x) => x.at > 0)} volume={0.35} />
      ))}
    </AbsoluteFill>
  );
};

export const halfPrice: Beat = { id: "halfPrice", firstLine: 3, Component: Scene };
