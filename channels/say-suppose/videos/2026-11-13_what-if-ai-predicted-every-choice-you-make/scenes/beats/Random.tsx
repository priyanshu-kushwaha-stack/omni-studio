// Beat "Random" (script.md, ## [01:38] Random; narration lines 15-23). Morning. Your bathroom mirror (sets/
// MirrorBathroom): you try to break the forecast and lose four times; the paper keys F and D; the coffee stall's 3.60;
// your best friend's coin; the court at lunch, a card over every head, ticking. The court scenes are in Random.Court.
//
//   15   the mirror: your face, toothbrush, BRUSHES 97% over you on a thread from the teal lamp over the glass, the small
//        board 100 in the corner; "So guess wrong": you lift your chin at the card
//   hold RAISES RIGHT 71%; you raise your left hand: buzz, crimson, 108; RAISES LEFT 88%; you freeze, hand half up: buzz,
//        117; FREEZES 93%; tongue out: buzz, 121; TONGUE 79%; both hands flat on the basin, staring: buzz, 125;
//        STARES 95%, tick; the tongue goes back in
//   16   "Four reds. Up twenty-five": the board on 125
//   17   a paper sheet over the mirror: the keys F and D; a row of guesses drawing itself over a row of presses, seven
//        joined of ten; your face under it, toothpaste at the corner of your mouth
//   18   "Trying to be random is a pattern.": your face, close
//   19   the coffee stall: her board for you flaps to 3.60; she slides the cup and taps the board, eyebrows up
//   20   "You're up today." (her own voice), close
//   21   your stall: your best friend, a coin on his thumb, FLIPS AGAIN 90%; he flips: tick; pockets it, folds his arms;
//        insert: FLIPS AGAIN 70%; he stares at the seventy
//   hold his hand goes back into his pocket on its own; the coin out; he looks at it; flips: tick; drops it on the counter
//        like it burned and wipes his hand on his apron
//   22   "It's in my head." (his own voice), close
//   23   the court filling for lunch, a card over every head, nearly all teal, ticking; a pan across the tables; the
//        pillar's board flapping down
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import type { Clip as LineClip } from "@whatif/kit/timeline";
import { FONT } from "@whatif/kit/fonts";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { BoardSounds, Tag, TagSounds, type BoardKey, type TagKey } from "../device";
import { aimArm, headAt, lineAt, moodNow, Sheet, type Body } from "../kit";
import { blinking, camAt, current, HERO, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { MIRROR, MirrorBack, MirrorFront, mirrorLights, Toothbrush } from "../sets/MirrorBathroom";
import { CoffeeMorning, coffeeSounds, coinDrop, coinFlips, CoinShot, coinTags, LunchWide, lunchBoardKeys, lunchTags, type CourtTimes } from "./Random.Court";
import type { Face } from "./TheLamp.Court";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: LineClip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  const end = (i: number) => lineEnd(clips, i);
  const e15 = end(15);
  const g = from(16) - e15; // the 6 s hold
  const h = (p: number) => e15 + Math.round(g * p);
  const court: CourtTimes = {
    coffee: from(19), dearer: at(19, 0.36), tap: at(19, 0.58), upToday: from(20), upEnd: end(20),
    coin: from(21), coinEnd: end(21), pocketAgain: end(21) + Math.round((from(22) - end(21)) * 0.12),
    head: from(22), headEnd: end(22), lunch: from(23), pan: at(23, 0.4), boards: at(23, 0.76), end: to,
  };
  return {
    mirror: from(15), // "Morning."
    chin: at(15, 0.71), // "So guess wrong."
    right: h(0.02), // RAISES RIGHT 71%
    raiseLeft: h(0.12),
    red1: h(0.17),
    left: h(0.25), // RAISES LEFT 88%
    freeze: h(0.3),
    red2: h(0.36),
    freezes: h(0.43), // FREEZES 93%
    tongue: h(0.5),
    red3: h(0.55),
    tongueTag: h(0.62), // TONGUE 79%
    flat: h(0.68),
    red4: h(0.74),
    stares: h(0.81), // STARES 95%
    staresTick: h(0.9),
    tongueIn: h(0.84),
    reds: from(16), // "Four reds. Up twenty-five before breakfast."
    sheet: from(17), // the professor's program
    cells: at(17, 0.1),
    cellsDone: at(17, 0.62),
    himself: at(17, 0.87), // "He couldn't beat it himself."
    pattern: from(18), // "Trying to be random is a pattern."
    court,
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ the mirror

function mirrorTags(k: T): TagKey[] {
  const n = (at: number, text: string, pct: number): TagKey => ({ at, text, pct, state: "new" });
  const red = (at: number, text: string, pct: number): TagKey => ({ at, text, pct, state: "crimson" });
  return [
    { at: -1e4, text: "BRUSHES", pct: 97, state: "tick" },
    n(k.right, "RAISES RIGHT", 71), red(k.red1, "RAISES RIGHT", 71),
    n(k.left, "RAISES LEFT", 88), red(k.red2, "RAISES LEFT", 88),
    n(k.freezes, "FREEZES", 93), red(k.red3, "FREEZES", 93),
    n(k.tongueTag, "TONGUE", 79), red(k.red4, "TONGUE", 79),
    n(k.stares, "STARES", 95), { at: k.staresTick, text: "STARES", pct: 95, state: "tick" },
  ];
}

const rateKeys = (k: T): BoardKey[] => [
  { at: -1e4, value: "100" }, { at: k.red1 + 4, value: "108" }, { at: k.red2 + 4, value: "117" }, { at: k.red3 + 4, value: "121" }, { at: k.red4 + 4, value: "125" },
];

const M = MIRROR.you;
const youB = (pose: Pose): Body => ({ x: M.x, y: M.y, scale: M.scale, pose, facing: 1 });

/** Your pose, face and hand in the mirror at a frame. */
function mirrorActing(frame: number, k: T): { pose: Pose; face: Face; tongue: boolean; brush: boolean; paste: boolean } {
  const h = headAt(M.x, M.y, M.scale, STAND, 1);
  const mouthSide = { x: h.x + h.r * 1.3, y: h.y + h.r * 0.6 };
  const sinkL = { x: 760, y: MIRROR.basin + 4 }, sinkR = { x: 1170, y: MIRROR.basin + 4 };
  const down: [number, number] = [-7, 8];
  const brushing = frame < k.right;
  const scrub = Math.sin(frame / 2.2) * 14;
  if (brushing) {
    const lifted = frame >= k.chin;
    return {
      pose: { ...STAND, tilt: lifted ? -12 : 0, armF: aimArm(youB(STAND), { x: mouthSide.x + (lifted ? 30 : 0), y: mouthSide.y + (lifted ? 10 : scrub) }) },
      face: lifted ? { brows: "angry", lids: 0.2, mouth: "smirk", eyes: 1, look: { x: 0, y: -1 } } : { brows: "none", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 0, y: 0 } },
      tongue: false, brush: true, paste: false,
    };
  }
  const up = ramp(frame, k.raiseLeft, k.raiseLeft + 6);
  const raised: [number, number] = [mix(-7, -165, up), mix(8, -10, up)];
  if (frame < k.freeze) return { pose: { ...STAND, tilt: -6, armB: raised }, face: { brows: "angry", lids: 0.1, mouth: frame >= k.red1 ? "o" : "smirk", eyes: 1.05, look: { x: 0, y: -0.9 } }, tongue: false, brush: false, paste: false };
  const half: [number, number] = [mix(-165, -115, ramp(frame, k.freeze, k.freeze + 5)), mix(-10, -40, ramp(frame, k.freeze, k.freeze + 5))];
  if (frame < k.tongue) return { pose: { ...STAND, armB: half }, face: { brows: "raised", lids: 0, mouth: "flat", eyes: 1.15, look: { x: 0, y: -0.9 } }, tongue: false, brush: false, paste: false };
  if (frame < k.flat) return { pose: { ...STAND, armB: [mix(-115, -7, ramp(frame, k.tongue, k.tongue + 6)), mix(-40, 8, ramp(frame, k.tongue, k.tongue + 6))] }, face: { brows: "angry", lids: 0.25, mouth: "open", eyes: 1, look: { x: 0, y: -1 } }, tongue: true, brush: false, paste: false };
  const flat = ramp(frame, k.flat, k.flat + 6);
  const pose: Pose = { ...STAND, lean: 4 * flat, armF: flat > 0 ? aimArm(youB(STAND), { x: mix(1000, sinkR.x, flat), y: mix(1100, sinkR.y, flat) }) : down, armB: flat > 0 ? aimArm(youB(STAND), { x: mix(920, sinkL.x, flat), y: mix(1100, sinkL.y, flat) }) : down };
  const tongue = frame < k.tongueIn;
  return { pose, face: { brows: "flat", lids: frame >= k.staresTick ? 0.35 : 0.1, mouth: tongue ? "open" : "flat", eyes: 1.1, look: { x: 0, y: frame >= k.reds ? -0.5 : 0 } }, tongue, brush: false, paste: false };
}

/** The F and D keys, a row of guesses over a row of presses; seven of ten join. */
const PRESSES = [0, 1, 1, 0, 1, 0, 0, 1, 0, 1];
const MISSES = new Set([2, 5, 8]);
const KeysSheet: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const W = 1080, H = 360;
  const step = (k.cellsDone - k.cells) / 10;
  const color = (v: number) => (v === 0 ? MUSTARD : TEAL);
  return (
    <Sheet frame={frame} at={k.sheet} x={960} y={225} w={W} h={H} tilt={-1}>
      {[["F", MUSTARD, 70], ["D", TEAL, 200]].map(([ch, c, x]) => (
        <g key={ch as string} transform={`translate(${x} 120)`}>
          <rect x={0} y={0} width={110} height={110} rx={16} fill={c as string} stroke={INK} strokeWidth={6} />
          <rect x={0} y={86} width={110} height={24} rx={10} fill="#000" opacity={0.15} />
          <text x={55} y={78} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={72} fill={PAPER}>{ch}</text>
        </g>
      ))}
      {PRESSES.map((p, i) => {
        const shown = frame >= k.cells + step * i;
        if (!shown) return null;
        const x = 390 + i * 66;
        const guess = MISSES.has(i) ? 1 - p : p;
        const join = k.cells + step * i + 4;
        return (
          <g key={i}>
            <circle cx={x} cy={90} r={22} fill={color(guess)} stroke={INK} strokeWidth={4} />
            <rect x={x - 22} y={248} width={44} height={44} rx={8} fill={color(p)} stroke={INK} strokeWidth={4} />
            {!MISSES.has(i) && <DrawLine d={`M${x} 116 V244`} from={join} to={join + 6} color={INK} width={6} />}
          </g>
        );
      })}
    </Sheet>
  );
};

/** Lines 15-18: the mirror. */
const MirrorShots: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const a = mirrorActing(frame, k);
  const pasteOn = frame >= k.sheet;
  const h = headAt(M.x, M.y, M.scale, a.pose, 1);
  const tagKeys = mirrorTags(k);
  const card = { x: h.x, y: h.y - h.r - h.r * 0.95 * 0.6 * 2.1 + 70 };
  const on = current(frame, [[k.mirror, "mid"], [k.chin, "chin"], [k.right, "mid2"], [k.red1 - 4, "card"], [k.freeze + 2, "mid3"], [k.red3 - 2, "board"],
    [k.tongueTag + 4, "mid4"], [k.stares - 2, "face"], [k.reds, "reds"], [k.sheet, "sheet"], [k.pattern, "pattern"]]);
  const MID: Camera = { x: 960, y: 500, zoom: 1.0 };
  const cams: Record<typeof on, Camera> = {
    mid: camAt(frame, [[k.mirror, MID], [k.chin, { x: 960, y: 480, zoom: 1.08 }]]),
    chin: camAt(frame, [[k.chin, closeUp(h.x, h.y - 120, 1.7)], [k.right, closeUp(h.x, h.y - 130, 1.8)]]),
    mid2: camAt(frame, [[k.right, MID], [k.red1, { x: 940, y: 480, zoom: 1.05 }]]),
    card: camAt(frame, [[k.red1 - 4, insert(card.x, card.y + 60, 2.2)], [k.freeze + 2, insert(card.x, card.y + 60, 2.35)]]),
    mid3: camAt(frame, [[k.freeze + 2, { x: 1000, y: 480, zoom: 1.12 }], [k.red3, { x: 1000, y: 470, zoom: 1.18 }]]),
    board: camAt(frame, [[k.red3 - 2, insert(MIRROR.board.x, MIRROR.board.y + 60, 3.0)], [k.tongueTag + 4, insert(MIRROR.board.x, MIRROR.board.y + 60, 3.2)]]),
    mid4: camAt(frame, [[k.tongueTag + 4, MID], [k.stares, { x: 960, y: 520, zoom: 1.06 }]]),
    face: camAt(frame, [[k.stares - 2, closeUp(h.x, h.y - 110, 1.8)], [k.reds, closeUp(h.x, h.y - 110, 1.9)]]),
    reds: camAt(frame, [[k.reds, { x: 1100, y: 420, zoom: 1.2 }], [k.sheet, { x: 1300, y: 300, zoom: 1.6 }]]),
    sheet: camAt(frame, [[k.sheet, { x: 960, y: 450, zoom: 0.98 }], [k.pattern, { x: 960, y: 450, zoom: 1.03 }]]),
    pattern: camAt(frame, [[k.pattern, closeUp(h.x, h.y - 40, 2.2)], [k.end, closeUp(h.x, h.y - 40, 2.35)]]),
  };
  const cam = drift(cams[on], frame, `mirror-${on}`, 2);
  const face: Face = frame >= k.sheet
    ? (frame >= k.himself ? { brows: "worry", lids: 0.3, mouth: "frown", eyes: 1, look: { x: 0, y: -0.7 } } : { brows: "flat", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 0.1, y: -0.8 } })
    : a.face;
  const pose = frame >= k.sheet ? { ...STAND, armF: [-7, 8] as [number, number] } : a.pose;
  const hh = headAt(M.x, M.y, M.scale, pose, 1);
  const actors = (
    <>
      <Figure x={M.x} y={M.y} scale={M.scale} facing={1} pose={pose} {...HERO} coat="#e6e1d6" {...face} blink={blinking(frame, 0)} time={frame} held={a.brush ? <Toothbrush /> : undefined} />
      {a.tongue && frame < k.sheet && <ellipse cx={hh.x + 8 * M.scale} cy={hh.y + 38 * M.scale} rx={9 * M.scale} ry={11 * M.scale} fill="#e86a7a" stroke={INK} strokeWidth={4} />}
      {pasteOn && <circle cx={hh.x + 24 * M.scale} cy={hh.y + 22 * M.scale} r={4.5 * M.scale} fill="#ffffff" stroke={INK} strokeWidth={3} />}
      <MirrorFront frame={frame} rate={rateKeys(k)} />
      <Tag frame={frame} x={hh.x} headY={hh.y} r={hh.r} keys={tagKeys} scale={0.6} threadTop={MIRROR.lamp.y + 20} />
      <KeysSheet frame={frame} k={k} />
    </>
  );
  return (
    <LookContext.Provider value={setLook(mirrorLights, mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<MirrorBack />} actors={actors} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const mood = moodNow(shot);
  const c = k.court;
  const part = current(frame, [[0, "mirror"], [c.coffee, "coffee"], [c.coin - 10, "coin"], [c.lunch, "lunch"]]);
  const coin = coinTags(c);
  const lunch = lunchTags(c);
  const lb = lunchBoardKeys(c);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {part === "mirror" && <MirrorShots frame={frame} k={k} mood={mood} />}
      {part === "coffee" && <CoffeeMorning frame={frame} k={c} mood={mood} />}
      {part === "coin" && <CoinShot frame={frame} k={c} mood={mood} />}
      {part === "lunch" && <LunchWide frame={frame} k={c} mood={mood} />}
      <TagSounds keys={mirrorTags(k)} />
      <BoardSounds keys={rateKeys(k)} volume={0.7} />
      <BoardSounds keys={coffeeSounds(c)} />
      <TagSounds keys={coin.friend} />
      {coinFlips(c).map((f) => <Sequence key={f} from={f} durationInFrames={20}><Audio src={staticFile("sfx/coin.wav")} volume={0.5} /></Sequence>)}
      <Sequence from={coinDrop(c)} durationInFrames={20}><Audio src={staticFile("sfx/coin.wav")} volume={0.9} /></Sequence>
      {["you", "friend", "seller", "d11", "d21", "d3-1"].filter((id) => lunch[id]).map((id) => (
        <TagSounds key={id} keys={lunch[id].filter((x) => x.at >= c.lunch)} volume={0.3} />
      ))}
      <BoardSounds keys={lb.pillar} volume={0.4} />
      <BoardSounds keys={lb.price} volume={0.3} />
    </AbsoluteFill>
  );
};

export const random: Beat = { id: "random", firstLine: 15, Component: Scene };
