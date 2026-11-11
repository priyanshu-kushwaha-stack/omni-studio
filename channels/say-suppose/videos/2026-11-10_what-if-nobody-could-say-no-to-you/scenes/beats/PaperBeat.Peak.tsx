// The wordless peak (script.md, ## The paper: the 9 s HOLD after "Paper. Where it has no power.", line 104), then the
// cut to black and the empty grey corridor with colour seeping back from the door. It sits in the narration's gap
// between line 104 and line 105, so it starts inside The choice's frames: Choice.tsx draws it from `peakTimes().take`
// and PaperBeat.tsx draws its tail up to `metro`.
//
// The grey closes in from the edges: under a normal (colour) Stage, a second, fully grey Stage (the kit's grey wave at
// full radius) is laid on top with a radial mask whose clear centre shrinks to nothing. The grey Stage greys its back
// and front layers only, so Dev and the corridor go in the back slot (grey) and you and the paper in the actors' slot
// (always full colour).
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { Stage, toScreen, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { headAt } from "../parts";
import { aimArm, handAt, type Body } from "../parts2";
import { blinking, camAt, HERO, lineEnd, linear, mix, ramp } from "../shared";
import { Deep } from "../sets/common";
import { HallBack, HALL_CORRIDOR } from "../sets/Hall";
import { CORRIDOR, Dev, Strip } from "./Choice.Props";

// ------------------------------------------------------------------------------------------------ timing

export type PeakTimes = ReturnType<typeof peakTimes>;

/** The peak's frames, from the gap between line 104's end and line 105's start: Dev walks back and takes the paper,
 *  the 9 s hold (the paper trembles at 2/9 of it, the push in on his face at 5/9, his eyes lift at 8/9), black, then
 *  the empty corridor for 2.5 s, which runs into line 105's first second. */
export function peakTimes(clips: Clip[]) {
  const take = lineEnd(clips, 104) + 4;
  const reach = take + 40;
  const metro = clips[105].from + 24;
  const corridor = metro - 75;
  const black = corridor - 12;
  const P = Math.max(120, black - reach);
  return {
    take, // Dev turns from the door and walks back
    reach, // he has the paper: the hold starts, the grey closes in
    tremble: reach + Math.round(P * (2 / 9)),
    push: reach + Math.round(P * (5 / 9)),
    lift: reach + Math.round(P * (8 / 9)),
    black: reach + P,
    corridor: reach + P + 12,
    metro: Math.max(metro, reach + P + 12 + 45),
  };
}

// ------------------------------------------------------------------------------------------------ the grey from the edges

const FULL = 2400;

/** A colour Stage with a grey copy over it everywhere outside a clear circle (screen px) of radius `r` at (x, y), with
 *  a soft edge. r = 0: all grey (actors still colour); r past the corners: all colour. */
export const GreyEdges: React.FC<{
  cam: Camera; back: React.ReactNode; actors: React.ReactNode; front?: React.ReactNode; x: number; y: number; r: number; feather?: number;
}> = ({ cam, back, actors, front, x, y, r, feather = 140 }) => {
  const stage = (grey: boolean) => (
    <Stage cam={cam} radius={grey ? FULL : 0} origin={{ x: 960, y: 540 }} back={back} actors={actors} front={front} />
  );
  if (r >= 2300) return stage(false);
  if (r <= 0) return stage(true);
  const mask = `radial-gradient(circle at ${x}px ${y}px, transparent ${r}px, black ${r + feather}px)`;
  return (
    <AbsoluteFill>
      {stage(false)}
      <AbsoluteFill style={{ maskImage: mask, WebkitMaskImage: mask }}>{stage(true)}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ the peak

const { floor: F, s: S } = CORRIDOR;

const PeakShot: React.FC<{ frame: number; p: PeakTimes }> = ({ frame, p }) => {
  // Dev comes back from the door, slower than he left, and stops in front of you.
  const walk = linear(frame, p.take + 4, p.reach - 6);
  const devX = mix(CORRIDOR.door, CORRIDOR.read, Math.sin((walk * Math.PI) / 2));
  const walking = walk > 0 && walk < 1;
  const dev: Body = { x: devX, y: F, scale: S, facing: -1, pose: walking ? walkPose(frame * 0.2) : STAND };
  const you: Body = { x: CORRIDOR.you, y: F, scale: S, facing: 1, pose: STAND };

  // The paper: held out at arm's length in your hand, then in both of his at his chest, reading.
  const outAt = { x: CORRIDOR.you + 120, y: F - 214 * S };
  const readAt = { x: CORRIDOR.read - 58, y: F - 200 * S };
  const handover = ramp(frame, p.reach - 10, p.reach + 4);
  const slow = Math.max(0, frame - p.reach);
  const tremble = ramp(frame, p.tremble, p.tremble + 30) * (1 - ramp(frame, p.lift, p.lift + 10) * 0.6);
  const shake = (t: number) => Math.sin(t * 1.7) * 2.2 + Math.sin(t * 3.1) * 1.2;
  const paperAt = (f: number) => ({
    x: mix(outAt.x, readAt.x, handover) + shake(f) * tremble * 0.8,
    y: mix(outAt.y, readAt.y, handover) - linear(f, p.reach, p.black) * 10 + shake(f + 9) * tremble * 0.5,
    tilt: mix(-2, 8, handover) + shake(f + 3) * tremble,
  });
  const paper = paperAt(frame);
  const ghost = paperAt(frame - 5);

  // Your arm: out with the strip, then slowly down once he has it.
  const lower = ramp(frame, p.reach + 20, p.reach + 80);
  you.pose = { ...STAND, armF: aimArm(you, { x: mix(outAt.x - 6, CORRIDOR.you + 40, lower), y: mix(outAt.y + 6, F - 150 * S, lower) }) };
  // His hands come up to the paper from behind it.
  dev.pose = walking && handover < 0.5
    ? { ...dev.pose, armF: aimArm(dev, { x: mix(devX - 70, paper.x + 30, handover * 2), y: mix(F - 160 * S, paper.y, handover * 2) }) }
    : { ...STAND, tilt: mix(0, -6, ramp(frame, p.reach, p.push)) + mix(0, 6, ramp(frame, p.lift, p.lift + 24)),
      armF: aimArm(dev, { x: paper.x + 40, y: paper.y + 4 }), armB: aimArm(dev, { x: paper.x - 30, y: paper.y + 8 }) };

  // Faces. Dev: reading, slow; his eyes lift to you at 8/9, his mouth begins to open. You: holding your breath.
  const lifted = ramp(frame, p.lift, p.lift + 22);
  const devFace = {
    brows: lifted > 0.4 ? "raised" as const : "sad" as const, lids: mix(0.3, 0.05, lifted), eyes: mix(1, 1.12, lifted),
    mouth: frame >= p.lift + 16 ? "o" as const : "flat" as const,
    look: { x: mix(0.5, 0.95, lifted), y: mix(0.8, 0, lifted) },
  };
  const youFace = {
    brows: lifted > 0.5 ? "raised" as const : "worry" as const, lids: 0.05, eyes: mix(1.1, 1.25, lifted), mouth: "flat" as const,
    look: { x: 0.95, y: mix(0.25, 0.05, lifted) },
  };

  const devHead = headAt(devX, F, S, dev.pose, -1);
  const mid = (CORRIDOR.you + CORRIDOR.read) / 2;
  const cam = drift(camAt(frame, [
    [p.take, { x: 1060, y: 640, zoom: 1.3 }], [p.reach, { x: mid + 20, y: 650, zoom: 1.7 }],
    [p.push, { x: mid + 10, y: 650, zoom: 1.85 }], [p.lift, closeUp(devHead.x, devHead.y + 50, 3.5)], [p.black, closeUp(devHead.x - 10, devHead.y + 50, 3.9)],
  ]), frame, "peak", 2);

  const back = (
    <>
      <HallBack cam={cam} view="corridor" frame={frame} doorOpen={0.55} />
      <Deep cam={cam} depth={1}>
        <Dev {...dev} {...devFace} blink={blinking(Math.floor(frame / 2), 6) && lifted === 0} time={slow * 0.4} bag={1} />
      </Deep>
    </>
  );
  const hand = handAt(you, "front");
  const actors = (
    <>
      <Figure {...HERO} {...you} {...youFace} blink={blinking(Math.floor(frame / 2), 1) && lifted === 0} time={frame * 0.4} flow={0.05} />
      {tremble > 0 && <g opacity={0.25}><Strip id="ghost" x={ghost.x} y={ghost.y} tilt={ghost.tilt} scale={0.42} side="front" /></g>}
      <Strip id="peak" x={handover > 0 ? paper.x : hand.x + 40} y={handover > 0 ? paper.y : hand.y} tilt={paper.tilt} scale={0.42} side={handover > 0.5 ? "front" : "back"} />
    </>
  );
  // The clear circle shrinks from past the corners to nothing over the first half of the hold.
  const r = mix(1300, 0, ramp(frame, p.reach, p.reach + Math.round((p.black - p.reach) * 0.55)));
  return <GreyEdges cam={cam} back={back} actors={actors} x={960} y={520} r={frame < p.reach ? 2400 : r} />;
};

// ------------------------------------------------------------------------------------------------ black, the empty corridor

/** A flyer on the floor (the stack's top one, dropped), in world coordinates. */
const FloorFlyer: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) scale(1 0.32) rotate(-14)`}>
    <rect x={-70} y={-50} width={140} height={100} rx={4} fill={MUSTARD} stroke={INK} strokeWidth={5} />
    <rect x={-56} y={-36} width={112} height={40} rx={3} fill={PAPER} />
  </g>
);

const EmptyCorridor: React.FC<{ frame: number; p: PeakTimes }> = ({ frame, p }) => {
  const cam = drift(camAt(frame, [[p.corridor, { x: 1150, y: 600, zoom: 1.1 }], [p.metro, { x: 1200, y: 600, zoom: 1.16 }]]), frame, "empty", 2);
  const back = (
    <>
      <HallBack cam={cam} view="corridor" frame={frame} doorOpen={0.55} />
      <Deep cam={cam} depth={1}><FloorFlyer x={900} y={HALL_CORRIDOR.floor + 20} /></Deep>
    </>
  );
  const door = toScreen(cam, HALL_CORRIDOR.door.x, (HALL_CORRIDOR.door.top + HALL_CORRIDOR.door.bottom) / 2);
  const r = mix(0, 2400, ramp(frame, p.corridor + 16, p.metro - 4));
  return <GreyEdges cam={cam} back={back} actors={<g />} x={door.x} y={door.y} r={r} feather={220} />;
};

/** The peak and its tail: the hold, black, the empty corridor. Draw it for frames in [p.take, p.metro). */
export const PaperPeak: React.FC<{ frame: number; p: PeakTimes }> = ({ frame, p }) => {
  if (frame < p.black) return <PeakShot frame={frame} p={p} />;
  if (frame < p.corridor) return <AbsoluteFill style={{ background: "#000" }} />;
  return <EmptyCorridor frame={frame} p={p} />;
};
