// Beat "The Door" (script v7, ## The Door; lines 110-113). Rebuilt on the outside review of v6 (#8): the door setup
// compressed into one two-shot, the unseen snap felt in the picture, the dark window on the right third of the closes on
// you, and a distinct end card after the cliffhanger has shut.
//
//   110  "Morning": the match cut from the academy's black glass: the kitchen window, night going pale with sunrise.
//        "The fridge. Your sister": the kitchen, her at the fridge, clear of the brush jar; "the jar of brushes": her hand
//        draws one out; "and the door": knocks on it, it opens; from "Your best friend" ONE two-shot (him in the
//        doorway, you inside, the dark window behind you): his letter whipped up on "a letter of his own", your smile
//        freezing on "For the first time".   111  "I got in!" in the same two-shot.
//   hold (4.3 s) his fist; the snap above you, out of frame: the shadow sweeps your brow, his grin falters at once;
//        close on you, his shoulder at the left, the window at the right: your eyes lift, then your head turns to it.
//   112  her at the fridge, facing you both, two fingers up: "Say it again."
//   hold (2.3 s) he does; the second snap; close on you: the turn to the window.
//   113  "Now it's his news": the two-shot, him beaming again. "Your turn to be the friend": you hug him (as he hugged
//        you on the first night). "Be honest: what number would open over your head?": close on you, eyes up, then the
//        turn to the window. Cut before the glass. "Tell us in the comments": the end card (TwoLetters.EndCard).
import { AbsoluteFill } from "remotion";
import { STAND } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { INK } from "@whatif/kit/theme";
import { headAt, MeterSound } from "../parts";
import { HOME, HomeBack } from "../sets/Home";
import { camAt, current, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { aimArm, hug, mixArm, Sister, talk, You, type Body, type Face } from "./HerBack.Sister";
import { EndCard, MinJun } from "./TwoLetters.EndCard";
import { HisShoulder } from "./TwoLetters.Fridge";
import { CardOverYou, cardOver, underCard } from "./TwoLetters.Ending";

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i, word times). */
function times(clips: Clip[], start: number, end: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const hold4 = lineEnd(clips, 111) + 1;
  const hold2 = lineEnd(clips, 112) + 1;
  const snap1 = hold4 + 18;
  const snap2 = hold2 + 22;
  return {
    start, end,
    dawn: [start, at(110, 0.08)] as const, // "Morning": the window going pale
    wide: at(110, 0.08), // "The fridge."
    sister: at(110, 0.17), // "Your sister"
    jar: at(110, 0.26), // "the jar of brushes"
    reach: [at(110, 0.27), at(110, 0.32)] as const,
    lift: [at(110, 0.33), at(110, 0.4)] as const,
    knock: [at(110, 0.42), at(110, 0.46)] as const, // "and the door."
    open: [at(110, 0.46), at(110, 0.51)] as const,
    two: at(110, 0.42),
    letterUp: at(110, 0.62), // "A letter of his own."
    freeze: at(110, 0.77), // "For the first time": your smile stops
    says: [from(111), lineEnd(clips, 111)] as const, // "I got in!"
    hold4,
    fist: [hold4, hold4 + 12] as const,
    snap1,
    falter: snap1 + 5,
    youLift: snap1 + 16, // close on you: the eyes lift
    lift1: [snap1 + 20, snap1 + 36] as const,
    turn1: snap1 + 62, // then turn to the dark window behind you
    her: from(112) - 1, // "Say it again."
    fingers: [from(112) - 1, from(112) + 8] as const,
    herSays: [from(112), lineEnd(clips, 112)] as const,
    hold2,
    again: [hold2 + 2, hold2 + 20] as const, // he says it again
    snap2,
    youTurn: snap2 + 10, // close on you: your head turns to the window
    turn2: snap2 + 24,
    under: from(113) - 1, // "Now it's his news"
    friend: at(113, 0.15), // "Your turn to be the friend": you hug him
    hug: [at(113, 0.15), at(113, 0.2)] as const,
    honest: at(113, 0.31), // "Be honest: what number would open over your head?"
    eyesUp: [at(113, 0.39), at(113, 0.45)] as const,
    turn3: [at(113, 0.5), at(113, 0.55)] as const,
    card: at(113, 0.585), // the cut to the end card
    comment: at(113, 0.62), // "Tell us in the comments"
    like: at(113, 0.885),
    subscribe: at(113, 0.925),
  };
}

// ------------------------------------------------------------------------------------------------ blocking

const S = 1.15;
const FLOOR = HOME.floor;
const HER_X = 1250; // in front of the fridge, half a body clear of the brush jar (review v6)
const MJ_X = HOME.frontDoor.x;
const ME_X = 390;
const ME_HEAD = headAt(ME_X, FLOOR, S, STAND, -1);
const MJ_HEAD = headAt(MJ_X, FLOOR, S, STAND, 1);
const HER_HEAD = headAt(HER_X, FLOOR, S, { ...STAND, lean: 6 }, -1);
const JAR_MOUTH = { x: HOME.jar.x + 6, y: HOME.jar.y - 96 };
/** The kitchen window, drawn tall (to the counter line) over the set's, so it sits in the right third of the closes on
 *  you; the glass is dim even in the morning. */
const PANE = { x: 470, y: 300, w: 230, h: 560 };
/** The closes on you: the window's glass on the right third of the frame. The bottom third of the (blank) card peeks
 *  in at the top so the head has room above the tuft (owner, before picture lock: no frame zoomed in a lot). */
const ME_CLOSE = (zoom: number) => underCard(ME_HEAD, ME_HEAD.x + 60, zoom, cardOver(ME_HEAD).h * 0.32 * zoom);

/** A paintbrush held upright (local coordinates, the hand at 0,0): wood, ferrule, bristles with old teal paint. */
const Brush: React.FC = () => (
  <g transform="rotate(-10)">
    <rect x={-4} y={-120} width={8} height={130} rx={3} fill="#c98f5e" stroke={INK} strokeWidth={2.5} />
    <rect x={-5} y={-132} width={10} height={16} rx={2} fill="#b8bec8" stroke={INK} strokeWidth={2.5} />
    <path d="M-5 -132 Q-7 -154 0 -166 Q7 -154 5 -132Z" fill="#e7d3b1" stroke={INK} strokeWidth={2.5} />
    <path d="M-4 -150 Q0 -168 4 -150 Q3 -160 0 -166 Q-3 -160 -4 -150Z" fill="#1d9a8f" />
  </g>
);

/** Two fingers up ("again"), the hand at 0,0. */
const TwoFingers: React.FC<{ skin: string }> = ({ skin }) => (
  <g transform="rotate(-8)" fill={skin} stroke={INK} strokeWidth={3}>
    <rect x={-9} y={-44} width={9} height={36} rx={4.5} transform="rotate(-10 -4 -8)" />
    <rect x={2} y={-46} width={9} height={38} rx={4.5} transform="rotate(8 6 -8)" />
    <circle cx={0} cy={0} r={13} />
  </g>
);

/** The kitchen window: at `day` 0 night-dark, at 1 the pale dawn; dim glass with sheen, a frame and a mullion. */
const Pane: React.FC<{ day: number }> = ({ day }) => {
  const w = PANE;
  return (
    <g>
      <rect x={w.x} y={w.y} width={w.w} height={w.h} fill="#141a2c" />
      <rect x={w.x} y={w.y} width={w.w} height={w.h} fill="#5d7088" opacity={0.55 * day} />
      <rect x={w.x} y={w.y} width={w.w} height={w.h * 0.45} fill="#f6c98e" opacity={0.35 * day * day} />
      <path d={`M${w.x + 30} ${w.y} l60 0 l-150 ${w.h} l-60 0Z`} fill="#fff" opacity={0.1} />
      <path d={`M${w.x + 140} ${w.y} l16 0 l-150 ${w.h} l-16 0Z`} fill="#fff" opacity={0.12} />
      <rect x={w.x} y={w.y} width={w.w} height={w.h} fill="none" stroke="#9a7452" strokeWidth={14} />
      <line x1={w.x + w.w / 2} y1={w.y} x2={w.x + w.w / 2} y2={w.y + w.h} stroke="#9a7452" strokeWidth={9} />
      <rect x={w.x - 16} y={w.y + w.h} width={w.w + 32} height={16} fill="#b9895f" stroke={INK} strokeWidth={4} />
    </g>
  );
};

/** How light the kitchen window is: night at the cut, dawn by "The fridge", then dimming back to dark glass. */
const dayOf = (frame: number, k: T) => ramp(frame, k.dawn[0] + 4, k.dawn[1]) * (1 - 0.75 * ramp(frame, k.two, k.two + 30));

/** Her by the fridge: the front hand goes to the jar and draws one brush out; on "Say it again" two fingers up. */
function herAt(frame: number, k: T): { body: Body; held: React.ReactNode } {
  const body: Body = { x: HER_X, y: FLOOR, scale: S, facing: -1, pose: { ...STAND, lean: 6 } };
  if (frame >= k.fingers[0]) {
    const up = ramp(frame, k.fingers[0], k.fingers[1]);
    body.pose = { ...body.pose, armF: mixArm(STAND.armF, aimArm(body, { x: HER_X - 90, y: FLOOR - 330 }), up) };
    return { body, held: <TwoFingers skin="#f0a98e" /> };
  }
  const reach = ramp(frame, k.reach[0], k.reach[1]);
  const lift = ramp(frame, k.lift[0], k.lift[1]);
  const up = { x: HER_X - 80, y: FLOOR - 290 };
  const target = { x: mix(JAR_MOUTH.x + 40, up.x, lift), y: mix(JAR_MOUTH.y, up.y, lift) };
  body.pose = { ...body.pose, lean: 6 + 14 * reach * (1 - lift), armF: mixArm(STAND.armF, aimArm(body, target), reach) };
  return { body, held: frame >= k.lift[0] ? <Brush /> : undefined };
}

const Kitchen: React.FC<{ frame: number; k: T; cam: Camera; her: Face }> = ({ frame, k, cam, her }) => {
  const h = herAt(frame, k);
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }}
      back={<g><HomeBack cam={cam} mood="morning" frame={frame} /><Pane day={dayOf(frame, k)} /></g>}
      actors={<Sister body={h.body} face={her} frame={frame} duty="off" held={h.held} />} />
  );
};

/** Knuckle marks on the outside of the closed door. */
const Knocks: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  if (frame < k.knock[0] || frame >= k.open[0]) return null;
  const n = frame < (k.knock[0] + k.knock[1]) / 2 ? 1 : 2;
  return (
    <g stroke={INK} strokeWidth={6} strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => (
        <g key={i} transform={`translate(${MJ_X + 40 + i * 30} ${560 + i * 40})`}>
          <path d="M-30 -10 l-18 -10 M-30 10 l-20 6 M-30 0 l-22 -2" />
        </g>
      ))}
    </g>
  );
};

/** Who is where at the door at a frame: him in the doorway (letter, fist, the grin), you inside; on "Your turn to be the
 *  friend" you step in and hug him. */
function doorBodies(frame: number, k: T): { mj: Body; me: Body } {
  const hugT = ramp(frame, k.hug[0], k.hug[1]) * (1 - ramp(frame, k.honest, k.honest + 8));
  if (hugT > 0) {
    const h = hug({ youX: MJ_X, herX: MJ_X + 150, floor: FLOOR, scale: S, t: hugT, hold: hugT, frame });
    return { mj: h.you, me: h.her };
  }
  const mj: Body = { x: MJ_X, y: FLOOR, scale: S, facing: 1, pose: STAND };
  const up = ramp(frame, k.letterUp - 4, k.letterUp + 4) * (1 - 0.65 * ramp(frame, k.falter, k.falter + 20)) + 0.65 * ramp(frame, k.under, k.under + 10);
  const fist = ramp(frame, k.fist[0], k.fist[1]) * (1 - ramp(frame, k.falter, k.falter + 16));
  mj.pose = { ...STAND, armF: mixArm(STAND.armF, aimArm(mj, { x: MJ_X + 80, y: FLOOR - 270 }), Math.min(1, up)), armB: mixArm(STAND.armB, [128, 84], fist) };
  const turned = (frame >= k.turn1 && frame < k.hold2) || (frame >= k.turn2 && frame < k.under) || frame >= k.turn3[1];
  return { mj, me: { x: ME_X, y: FLOOR, scale: S, facing: turned ? 1 : -1, pose: STAND } };
}

/** The front door: him on the threshold, you inside, the dark window behind you; the card over you (unseen). */
const Door: React.FC<{ frame: number; k: T; cam: Camera; mj: Face; you: Face; showYou: boolean; showHim: boolean; paper: boolean }> = ({
  frame, k, cam, mj, you, showYou, showHim, paper,
}) => {
  const open = ramp(frame, k.open[0], k.open[1]);
  const b = doorBodies(frame, k);
  const myHead = headAt(b.me.x, b.me.y, S, b.me.pose, b.me.facing);
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<g><HomeBack cam={cam} mood="morning" frame={frame} door={open} /><Pane day={dayOf(frame, k)} /></g>} actors={
      <>
        <Knocks frame={frame} k={k} />
        {showHim && open > 0.3 && <MinJun body={b.mj} face={mj} frame={frame} letter={frame >= k.letterUp - 4 ? 1 : 0} />}
        {showYou && <You body={b.me} face={you} frame={frame} />}
        <CardOverYou frame={frame} at={frame >= k.snap2 ? k.snap2 : k.snap1} head={myHead} paper={paper} />
      </>
    } />
  );
};

/** Min-jun: grinning in the doorway; "I got in!"; on the first snap the grin falters at once and his eyes go up; he
 *  says it again; from "Now it's his news" he is beaming again. */
function minJunFace(frame: number, k: T): Face {
  if (frame >= k.under) return { brows: "raised", lids: 0, mouth: frame >= k.hug[0] ? "smile" : "open", eyes: 1.1, look: { x: 1, y: 0 } };
  if (frame < k.snap1) return { brows: "raised", lids: 0, mouth: talk(frame, k.says[0], k.says[1], "smile"), eyes: 1.1, look: { x: 1, y: 0 } };
  if (frame >= k.again[0] && frame < k.again[1]) return { brows: "raised", lids: 0, mouth: talk(frame, k.again[0], k.again[1], "smile"), eyes: 1.1, look: { x: 1, y: 0 } };
  const up = ramp(frame, k.snap1 + 2, k.snap1 + 10);
  const look = { x: 1 - 0.25 * up, y: mix(0.05, -1, up) };
  return { brows: frame < k.falter ? "raised" : "worry", lids: 0.05, mouth: frame < k.falter ? "smile" : "flat", eyes: 1.18, look };
}

/** You: smiling for him; the smile freezes on "For the first time"; from the snap your eyes start to lift, then go to
 *  the window; at the end your eyes go up again, then the window. */
function yourFace(frame: number, k: T): Face {
  const on = { x: 1, y: 0.05 };
  if (frame < k.freeze) return { brows: "raised", lids: 0, mouth: "smile", eyes: 1.05, look: on };
  if (frame < k.snap1) return { brows: "flat", lids: 0, mouth: "smile", eyes: 1.0, look: on };
  if (frame >= k.hug[0] && frame < k.honest) return { brows: "raised", lids: 0.3, mouth: "smile", eyes: 1, look: on };
  if (frame >= k.honest) {
    const up = ramp(frame, k.eyesUp[0], k.eyesUp[1]);
    return { brows: "worry", lids: 0.05, mouth: "flat", eyes: 1.12, look: { x: 1 - 0.3 * up, y: mix(0, -0.9, up) } };
  }
  const lift = ramp(frame, k.lift1[0], k.lift1[1]);
  if (frame < k.turn1) return { brows: "worry", lids: 0.05, mouth: "flat", eyes: 1.12, look: { x: 1 - 0.3 * lift, y: mix(0.05, -0.9, lift) } };
  return { brows: "worry", lids: 0.05, mouth: "flat", eyes: 1.12, look: { x: 1, y: -0.1 } };
}

const TwoShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.start, "dawn"], [k.wide, "wide"], [k.sister, "sister"], [k.jar, "jar"], [k.two, "two"], [k.youLift, "lift"],
    [k.her, "her"], [k.hold2, "mj2"], [k.youTurn, "turn"], [k.under, "under"], [k.honest, "honest"], [k.card, "card"]]);
  if (shot === "card") return <EndCard frame={frame} from={k.card} comment={k.comment} like={k.like} subscribe={k.subscribe} />;
  const mid = (MJ_HEAD.x + ME_HEAD.x) / 2;
  const cams: Record<string, Camera> = {
    dawn: camAt(frame, [[k.start, insert(PANE.x + PANE.w / 2, PANE.y + 200, 2.6)], [k.wide, insert(PANE.x + PANE.w / 2, PANE.y + 220, 2.3)]]),
    wide: camAt(frame, [[k.wide, { x: 1180, y: 600, zoom: 1.12 }], [k.sister, { x: 1190, y: 610, zoom: 1.22 }]]),
    sister: camAt(frame, [[k.sister, closeUp(HER_HEAD.x - 40, HER_HEAD.y + 10, 2.1)], [k.jar, closeUp(HER_HEAD.x - 50, HER_HEAD.y + 10, 2.25)]]),
    jar: camAt(frame, [[k.jar, { x: (HOME.jar.x + HER_HEAD.x) / 2, y: HER_HEAD.y + 40, zoom: 2.0 }], [k.two, { x: (HOME.jar.x + HER_HEAD.x) / 2, y: HER_HEAD.y + 20, zoom: 2.1 }]]),
    two: camAt(frame, [[k.two, underCard(ME_HEAD, mid + 40, 1.8)], [k.says[0], underCard(ME_HEAD, mid + 10, 2.0)], [k.youLift, underCard(ME_HEAD, mid, 2.1)]]),
    lift: camAt(frame, [[k.youLift, ME_CLOSE(2.1)], [k.her, ME_CLOSE(2.25)]]),
    her: camAt(frame, [[k.her, { x: HER_HEAD.x - 120, y: HER_HEAD.y + 150, zoom: 1.75 }], [k.hold2, { x: HER_HEAD.x - 120, y: HER_HEAD.y + 140, zoom: 1.85 }]]),
    mj2: camAt(frame, [[k.hold2, closeUp(MJ_HEAD.x + 70, MJ_HEAD.y - 10, 2.4)], [k.youTurn, closeUp(MJ_HEAD.x + 70, MJ_HEAD.y - 10, 2.55)]]),
    turn: camAt(frame, [[k.youTurn, ME_CLOSE(2.15)], [k.under, ME_CLOSE(2.3)]]),
    under: camAt(frame, [[k.under, underCard(ME_HEAD, mid + 20, 2.1)], [k.honest, underCard(ME_HEAD, mid + 30, 2.25)]]),
    honest: camAt(frame, [[k.honest, ME_CLOSE(2.05)], [k.card, ME_CLOSE(2.3)]]),
  };
  const cam = drift(cams[shot], frame, "twoletters", shot === "dawn" || shot === "wide" || shot === "sister" || shot === "jar" ? 3 : 1.5);
  if (shot === "dawn" || shot === "wide" || shot === "sister" || shot === "jar" || shot === "her") {
    const saying = frame >= k.herSays[0] && frame < k.herSays[1];
    const her: Face = shot === "her"
      ? { brows: "raised", lids: 0.2, mouth: saying ? talk(frame, k.herSays[0], k.herSays[1], "smirk") : "smirk", eyes: 1.05, look: { x: 1, y: 0 } }
      : frame >= k.lift[1] - 4
        ? { brows: "raised", lids: 0.1, mouth: "smile", eyes: 1.05, look: { x: 0.6, y: -0.6 } }
        : { brows: "none", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 1, y: 0.3 } };
    return <Kitchen frame={frame} k={k} cam={cam} her={her} />;
  }
  const close = shot === "lift" || shot === "turn" || shot === "honest";
  const scene = <Door frame={frame} k={k} cam={cam} mj={minJunFace(frame, k)} you={yourFace(frame, k)} showYou={shot !== "mj2"}
    showHim={!close} paper={shot !== "mj2" && shot !== "under"} />;
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
