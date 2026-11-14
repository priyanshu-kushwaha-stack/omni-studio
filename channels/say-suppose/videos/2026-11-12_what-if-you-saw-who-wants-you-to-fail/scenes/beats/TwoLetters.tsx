// Beat "The Door" (script v5, ## The Door; lines 110-113). Morning in the flat. Your sister at the fridge, by the jar of
// brushes: she draws one out and looks at it. The front door: your best friend, grinning, a letter of his own. "I got
// in!" (his voice). The hold: he holds it up the way you held yours; a paper snap above you, out of frame (the card
// over YOU: never seen, only its edge, its shadow, its light: TwoLetters.Ending); his grin falters at your face; your
// eyes start to lift, then turn to the dark window behind you: cut before the glass. "Say it again." (her, from the
// fridge, a brush in her hand). He does; a second snap; your head turns to the window. Cut. "Now it's his news. And the
// card is over you.": the two of you under the card; close on you; the closing question; the end card's tags over the
// two of you in the left two-thirds, the right third quiet for YouTube's end screen.
//
//   110  wide: the kitchen, her at the fridge ("Morning. The fridge."); close on her ("Your sister"); the jar, her hand
//        drawing a brush ("the jar of brushes"); the front door opening ("and the door"); his face, his letter up ("Your
//        best friend. A letter of his own."); close on you, smiling ("the good news isn't yours").
//   111  his face: "I got in!".   hold (4 s) the two of you; the snap; his eyes go up, the grin falters; close on you:
//        your eyes lift, then your head turns to the window.   112  her at the fridge: "Say it again."
//   hold (2 s) his face, saying it again; the second snap; close on you, your head turns.   113  under the card.
import { AbsoluteFill } from "remotion";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { INK } from "@whatif/kit/theme";
import { headAt, MeterSound } from "../parts";
import { HOME, HomeBack } from "../sets/Home";
import { camAt, current, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { aimArm, mixArm, Sister, talk, You, type Body, type Face } from "./HerBack.Sister";
import { EndTags, MinJun } from "./TwoLetters.EndCard";
import { HisShoulder } from "./TwoLetters.Fridge";
import { CardOverYou, underCard } from "./TwoLetters.Ending";

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i). */
function times(clips: Clip[], start: number, end: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const hold4 = lineEnd(clips, 111) + 1;
  const hold2 = lineEnd(clips, 112) + 1;
  const snap1 = hold4 + 30;
  const snap2 = hold2 + 22;
  return {
    start, end,
    sister: at(110, 0.11), // "Your sister"
    reach: [at(110, 0.13), at(110, 0.2)] as const, // her hand to the jar
    lift: [at(110, 0.22), at(110, 0.3)] as const, // one brush drawn out and held up
    jar: at(110, 0.19), // "the jar of brushes"
    door: at(110, 0.3), // "and the door."
    open: [at(110, 0.31), at(110, 0.36)] as const,
    mj1: at(110, 0.4), // "Your best friend."
    letterUp: at(110, 0.5), // "A letter of his own."
    youA: at(110, 0.66), // "For the first time, the good news isn't yours."
    mjClose: from(111) - 2,
    says: [from(111), lineEnd(clips, 111)] as const, // "I got in!"
    hold4,
    fist: [hold4, hold4 + 14] as const,
    snap1,
    falter: snap1 + 22,
    youLift: snap1 + 36, // close on you: the eyes lift
    lift1: [snap1 + 40, snap1 + 56] as const,
    turn1: snap1 + 70, // then turn to the dark window behind you
    her: from(112) - 1, // "Say it again."
    herSays: [from(112), lineEnd(clips, 112)] as const,
    hold2,
    again: [hold2 + 2, hold2 + 24] as const, // he says it again
    snap2,
    youTurn: snap2 + 12, // close on you: your head turns to the window
    turn2: snap2 + 22,
    under: from(113) - 1, // "Now it's his news": the two of you, under the card
    close: at(113, 0.125), // "And the card is over you": close on you
    honest: at(113, 0.29), // "Be honest: what number would open over your head?"
    card: at(113, 0.545), // "Tell us in the comments": the two of you, the tags
    comment: at(113, 0.565),
    back: at(113, 0.72), // his eyes come back down to your face
    like: at(113, 0.875),
    subscribe: at(113, 0.915),
  };
}

// ------------------------------------------------------------------------------------------------ blocking

const S = 1.15;
const FLOOR = HOME.floor;
const HER_X = 1185; // in front of the fridge's left side, by the jar
const MJ_X = HOME.frontDoor.x;
const ME_X = 390;
const ME_HEAD = headAt(ME_X, FLOOR, S, STAND, -1);
const MJ_HEAD = headAt(MJ_X, FLOOR, S, STAND, 1);
const HER_HEAD = headAt(HER_X, FLOOR, S, { ...STAND, lean: 6 }, -1);
const JAR_MOUTH = { x: HOME.jar.x + 6, y: HOME.jar.y - 96 };

/** A paintbrush held upright (local coordinates, the hand at 0,0): wood, ferrule, bristles with old teal paint. */
const Brush: React.FC = () => (
  <g transform="rotate(-10)">
    <rect x={-4} y={-120} width={8} height={130} rx={3} fill="#c98f5e" stroke={INK} strokeWidth={2.5} />
    <rect x={-5} y={-132} width={10} height={16} rx={2} fill="#b8bec8" stroke={INK} strokeWidth={2.5} />
    <path d="M-5 -132 Q-7 -154 0 -166 Q7 -154 5 -132Z" fill="#e7d3b1" stroke={INK} strokeWidth={2.5} />
    <path d="M-4 -150 Q0 -168 4 -150 Q3 -160 0 -166 Q-3 -160 -4 -150Z" fill="#1d9a8f" />
  </g>
);

/** The kitchen window, dark: the pane in shadow, one glare across it, nothing in it yet. Over the set's window. */
const DarkPane: React.FC = () => {
  const w = HOME.window;
  return (
    <g>
      <rect x={w.x} y={w.y} width={w.w} height={w.h} fill="#141a2c" />
      <path d={`M${w.x + 30} ${w.y} l50 0 l-90 ${w.h} l-50 0Z`} fill="#fff" opacity={0.08} />
      <rect x={w.x} y={w.y} width={w.w} height={w.h} fill="none" stroke="#9a7452" strokeWidth={14} />
      <line x1={w.x + w.w / 2} y1={w.y} x2={w.x + w.w / 2} y2={w.y + w.h} stroke="#9a7452" strokeWidth={9} />
    </g>
  );
};

/** Her by the jar: the front hand goes to the jar, draws one brush out and holds it up to look at it. */
function herAt(frame: number, k: T): { body: Body; brush: boolean } {
  const body: Body = { x: HER_X, y: FLOOR, scale: S, facing: -1, pose: { ...STAND, lean: 6 } };
  const reach = ramp(frame, k.reach[0], k.reach[1]);
  const lift = ramp(frame, k.lift[0], k.lift[1]);
  const up = { x: HER_X - 70, y: FLOOR - 290 };
  const target = { x: mix(JAR_MOUTH.x, up.x, lift), y: mix(JAR_MOUTH.y, up.y, lift) };
  body.pose = { ...body.pose, armF: mixArm(STAND.armF, aimArm(body, target), reach) };
  return { body, brush: frame >= k.lift[0] };
}

const Kitchen: React.FC<{ frame: number; k: T; cam: Camera; her: Face }> = ({ frame, k, cam, her }) => {
  const h = herAt(frame, k);
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }}
      back={<HomeBack cam={cam} mood="morning" frame={frame} />}
      actors={<Sister body={h.body} face={her} frame={frame} duty="off" held={h.brush ? <Brush /> : undefined} />} />
  );
};

/** The front door: your best friend on the threshold, his letter up; you inside, the dark window behind you; the card
 *  over you (unseen) from the first snap. `turned` turns you to face the window. */
const Door: React.FC<{ frame: number; k: T; cam: Camera; mj: Face; you: Face; showYou: boolean; showHim: boolean; turned: boolean }> = ({
  frame, k, cam, mj, you, showYou, showHim, turned,
}) => {
  const open = ramp(frame, k.open[0], k.open[1]);
  const body: Body = { x: MJ_X, y: FLOOR, scale: S, facing: 1, pose: STAND };
  const up = ramp(frame, k.letterUp - 6, k.letterUp + 6) * (1 - 0.65 * ramp(frame, k.falter + 6, k.falter + 30));
  const fist = ramp(frame, k.fist[0], k.fist[1]) * (1 - ramp(frame, k.falter + 4, k.falter + 22));
  body.pose = { ...STAND, armF: mixArm(STAND.armF, aimArm(body, { x: MJ_X + 80, y: FLOOR - 270 }), up), armB: mixArm(STAND.armB, [128, 84], fist) };
  const step = ramp(frame, k.open[1], k.open[1] + 12);
  const me: Body = { x: ME_X, y: FLOOR, scale: S, facing: turned ? 1 : -1, pose: step > 0 && step < 1 ? walkPose(frame * 0.3) : STAND };
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<HomeBack cam={cam} mood="morning" frame={frame} door={open} />} actors={
      <>
        <DarkPane />
        {showHim && open > 0.3 && <MinJun body={body} face={mj} frame={frame} letter={1} />}
        {showYou && <You body={me} face={you} frame={frame} />}
        <CardOverYou frame={frame} at={frame >= k.snap2 ? k.snap2 : k.snap1} head={ME_HEAD} />
      </>
    } />
  );
};

/** Min-jun: "I got in!"; joy; on the first snap his eyes go up and the grin falters; he says it again; at the end his
 *  eyes come back down to your face. */
function minJunFace(frame: number, k: T): Face {
  if (frame < k.fist[0]) return { brows: "raised", lids: 0, mouth: talk(frame, k.says[0], k.says[1], "smile"), eyes: 1.1, look: { x: 1, y: 0 } };
  if (frame >= k.again[0] && frame < k.again[1]) return { brows: "raised", lids: 0, mouth: talk(frame, k.again[0], k.again[1], "smile"), eyes: 1.1, look: { x: 1, y: 0 } };
  if (frame < k.snap1 + 4) return { brows: "raised", lids: 0, mouth: "open", eyes: 1.15, look: { x: 1, y: 0 } };
  const up = ramp(frame, k.snap1 + 4, k.snap1 + 16) * (1 - ramp(frame, k.back, k.back + 14));
  const look = { x: 1 - 0.25 * up, y: mix(0.05, -1, up) };
  if (frame < k.falter) return { brows: "raised", lids: 0, mouth: "smile", eyes: 1.2, look };
  return { brows: frame < k.falter + 12 ? "none" : "worry", lids: 0.05, mouth: "flat", eyes: 1.15, look };
}

/** You: smiling for him; from the snap your smile stops; your eyes start to lift (to the card you can't see), then go
 *  to the window. */
function yourFace(frame: number, k: T): Face {
  const on = { x: 1, y: 0.05 };
  if (frame < k.snap1) return { brows: "raised", lids: 0, mouth: "smile", eyes: 1.05, look: on };
  const lift = ramp(frame, k.lift1[0], k.lift1[1]);
  if (frame < k.turn1) return { brows: "worry", lids: 0.05, mouth: "flat", eyes: 1.1, look: { x: 1 - 0.3 * lift, y: mix(0.05, -0.9, lift) } };
  if (frame < k.under) return { brows: "worry", lids: 0.05, mouth: "flat", eyes: 1.12, look: { x: 1, y: -0.1 } };
  return { brows: "worry", lids: frame >= k.honest + 40 && frame < k.honest + 52 ? 0.35 : 0.08, mouth: "flat", eyes: 1.1, look: { x: 1, y: -0.05 } };
}

const TwoShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.start, "wide"], [k.sister, "sister"], [k.jar, "jar"], [k.door, "door"], [k.mj1, "mj1"], [k.youA, "youA"],
    [k.mjClose, "mj"], [k.hold4, "twoA"], [k.youLift, "lift"], [k.her, "her"], [k.hold2, "mj2"], [k.youTurn, "turn"], [k.under, "under"],
    [k.close, "close"], [k.honest, "honest"], [k.card, "card"]]);
  const mid = (MJ_HEAD.x + ME_HEAD.x) / 2;
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.start, { x: 1300, y: 600, zoom: 1.12 }], [k.sister, { x: 1290, y: 610, zoom: 1.2 }]]),
    sister: camAt(frame, [[k.sister, closeUp(HER_HEAD.x - 90, HER_HEAD.y + 10, 2.2)], [k.jar, closeUp(HER_HEAD.x - 90, HER_HEAD.y + 10, 2.35)]]),
    jar: camAt(frame, [[k.jar, insert(HOME.jar.x + 40, HOME.jar.y - 150, 2.7)], [k.door, insert(HOME.jar.x + 50, HOME.jar.y - 170, 2.9)]]),
    door: camAt(frame, [[k.door, { x: 470, y: 600, zoom: 1.45 }], [k.mj1, { x: 455, y: 600, zoom: 1.55 }]]),
    mj1: camAt(frame, [[k.mj1, closeUp(MJ_HEAD.x + 90, MJ_HEAD.y + 10, 2.0)], [k.youA, closeUp(MJ_HEAD.x + 90, MJ_HEAD.y + 10, 2.15)]]),
    youA: camAt(frame, [[k.youA, closeUp(ME_HEAD.x + 60, ME_HEAD.y - 10, 2.4)], [k.mjClose, closeUp(ME_HEAD.x + 60, ME_HEAD.y - 10, 2.55)]]),
    mj: camAt(frame, [[k.mjClose, closeUp(MJ_HEAD.x + 70, MJ_HEAD.y - 10, 2.4)], [k.hold4, closeUp(MJ_HEAD.x + 70, MJ_HEAD.y - 10, 2.6)]]),
    twoA: camAt(frame, [[k.hold4, underCard(ME_HEAD, mid, 1.95)], [k.youLift, underCard(ME_HEAD, mid - 4, 2.1)]]),
    lift: camAt(frame, [[k.youLift, underCard(ME_HEAD, ME_HEAD.x - 40, 2.8)], [k.her, underCard(ME_HEAD, ME_HEAD.x - 40, 3.0)]]),
    her: camAt(frame, [[k.her, closeUp(HER_HEAD.x - 90, HER_HEAD.y + 10, 2.3)], [k.hold2, closeUp(HER_HEAD.x - 90, HER_HEAD.y + 10, 2.4)]]),
    mj2: camAt(frame, [[k.hold2, closeUp(MJ_HEAD.x + 70, MJ_HEAD.y - 10, 2.5)], [k.youTurn, closeUp(MJ_HEAD.x + 70, MJ_HEAD.y - 10, 2.6)]]),
    turn: camAt(frame, [[k.youTurn, underCard(ME_HEAD, ME_HEAD.x - 40, 3.0)], [k.under, underCard(ME_HEAD, ME_HEAD.x - 40, 3.15)]]),
    under: camAt(frame, [[k.under, underCard(ME_HEAD, mid, 2.35)], [k.close, underCard(ME_HEAD, mid - 4, 2.5)]]),
    close: camAt(frame, [[k.close, underCard(ME_HEAD, ME_HEAD.x - 50, 2.7)], [k.honest, underCard(ME_HEAD, ME_HEAD.x - 50, 2.8)]]),
    honest: camAt(frame, [[k.honest, underCard(ME_HEAD, ME_HEAD.x - 50, 2.85)], [k.card, underCard(ME_HEAD, ME_HEAD.x - 56, 3.15)]]),
    card: camAt(frame, [[k.card, underCard(ME_HEAD, MJ_HEAD.x + 760 / 2.2, 2.2)], [k.end, underCard(ME_HEAD, MJ_HEAD.x + 760 / 2.3, 2.3)]]),
  };
  const under = ["twoA", "lift", "turn", "under", "close", "honest", "card"].includes(shot);
  const cam = drift(cams[shot], frame, "twoletters", under ? 1.5 : 3);
  if (shot === "wide" || shot === "sister" || shot === "jar" || shot === "her") {
    const saying = frame >= k.herSays[0] && frame < k.herSays[1];
    const her: Face = shot === "her"
      ? { brows: "raised", lids: 0.25, mouth: saying ? talk(frame, k.herSays[0], k.herSays[1], "smirk") : "smirk", eyes: 1, look: { x: 1, y: 0 } }
      : frame >= k.lift[1] - 4
        ? { brows: "raised", lids: 0.1, mouth: "smile", eyes: 1.05, look: { x: 0.6, y: -0.6 } }
        : { brows: "none", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 1, y: 0.3 } };
    return <Kitchen frame={frame} k={k} cam={cam} her={her} />;
  }
  const turned = (frame >= k.turn1 && frame < k.hold2) || frame >= k.turn2;
  const close = shot === "lift" || shot === "turn" || shot === "close" || shot === "honest";
  const scene = <Door frame={frame} k={k} cam={cam} mj={minJunFace(frame, k)} you={yourFace(frame, k)} showYou={shot !== "mj" && shot !== "mj1" && shot !== "mj2"}
    showHim={shot !== "youA" && !close} turned={turned} />;
  if (shot === "card") return <AbsoluteFill>{scene}<EndTags frame={frame} comment={k.comment} like={k.like} subscribe={k.subscribe} x={760} /></AbsoluteFill>;
  return close ? <AbsoluteFill>{scene}<HisShoulder /></AbsoluteFill> : scene;
};

const TwoLetters: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = times(shot.clips, shot.from, shot.to);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <TwoShot frame={shot.frame} k={k} />
      <MeterSound at={k.snap1} volume={0.75} />
      <MeterSound at={k.snap2} volume={0.6} />
    </AbsoluteFill>
  );
};

export const twoLetters: Beat = { id: "TwoLetters", firstLine: 110, Component: TwoLetters };
