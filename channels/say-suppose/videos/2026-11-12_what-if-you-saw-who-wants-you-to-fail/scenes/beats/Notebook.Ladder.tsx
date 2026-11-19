// The Ladder's new pictures (script v5, 2026-11-14):
//   L80  "He isn't sawing your chair. He's building a ladder. Out of your mistakes.": a paper sheet. On the left, the
//        thing you feared: your best friend crouched at your chair's leg with a saw; a red X stamps over it. On the right
//        a paper ladder builds itself rung by rung, each rung a torn page of your mistakes (your ringed mark on it), and
//        he climbs it.
//   L83  "A card has one colour for every kind of hurt.": two cards, both red, over your best friend (-91, with his
//        ladder) and the rival (-71); then "until you remember the rival is minus seventy-one, and he does not build
//        ladders": the rival alone under his lamp, a saw in his hand, grinning (the laugh).
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Stage } from "@whatif/kit/stage/Stage";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { headAt, Meter, Sheet } from "../parts";
import { blinking, camAt, MINJUN, mix, noise, ramp, TAEHO } from "../shared";
import { Chair } from "../sets/common";
import { Dim, MistakeMark } from "./Notebook.Parts";

/** A handsaw: a grey toothed blade and a wooden grip. (x, y) is the grip; the blade runs to +x. */
export const Saw: React.FC<{ x: number; y: number; scale?: number; tilt?: number }> = ({ x, y, scale = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <path d={`M20 -22 L190 -12 L190 14 ${Array.from({ length: 12 }, (_, i) => `L${176 - i * 14} 22 L${169 - i * 14} 14`).join(" ")} L20 14Z`}
      fill="#c9ced6" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-34} y={-26} width={60} height={46} rx={14} fill="#a8743f" stroke={INK} strokeWidth={4} />
    <rect x={-18} y={-12} width={26} height={18} rx={8} fill="#5a3a22" />
  </g>
);

// ------------------------------------------------------------------------------------------------ L80 the ladder

const RAIL_L = 700, RAIL_R = 880, LADDER_TOP = 70, LADDER_FOOT = 600;
const RUNGS = 6;
const rungY = (i: number) => LADDER_FOOT - 70 - i * 82;

/** One rung: a torn notebook page laid across the rails, your ringed mistake on it. */
const PageRung: React.FC<{ i: number; pop: number }> = ({ i, pop }) => {
  if (pop <= 0) return null;
  const y = rungY(i);
  const tilt = (noise(i) - 0.5) * 5;
  return (
    <g transform={`translate(${(RAIL_L + RAIL_R) / 2} ${y}) rotate(${tilt}) scale(${pop})`}>
      <path d="M-120 -26 L118 -24 L124 -8 L116 4 L122 26 L-118 24 L-124 6 L-116 -6Z" fill={PAPER} stroke={INK} strokeWidth={4} />
      <line x1={-104} y1={-8} x2={104} y2={-8} stroke="#9fc0e0" strokeWidth={2} />
      <line x1={-104} y1={10} x2={104} y2={10} stroke="#9fc0e0" strokeWidth={2} />
      <rect x={-96} y={-4} width={70} height={9} rx={4} fill={INK} opacity={0.55} />
      <MistakeMark x={34} y={0} scale={0.9} />
    </g>
  );
};

/** Where your best friend stands on the ladder at climb `c` (0 the floor .. RUNGS-1 the top rung). */
function onLadder(c: number) {
  const y = c <= 0 ? LADDER_FOOT : mix(LADDER_FOOT, rungY(RUNGS - 1) - 24, c / (RUNGS - 1));
  return { x: (RAIL_L + RAIL_R) / 2 + 10, y };
}

/** The sheet (1120 x 640). `saw` the saw picture; `cross` the X stamps; `build` the rungs; `climb` he climbs. */
export const LadderSheet: React.FC<{ frame: number; at: number; cross: number; build: number; climb: number }> = ({ frame, at, cross, build, climb }) => {
  const sawing = Math.sin(frame / 2.2) * 14 * (frame < cross + 4 ? 1 : 0);
  const x = ramp(frame, cross, cross + 6);
  const dim = mix(1, 0.45, ramp(frame, cross + 6, cross + 20));
  const rails = ramp(frame, build - 10, build + 6);
  const c = mix(0, RUNGS - 1.2, ramp(frame, climb, climb + 70));
  const me = onLadder(c);
  const moving = frame > climb && frame < climb + 70;
  const pose: Pose = moving ? { ...walkPose(frame * 0.4), armF: [150, 10], armB: [140, 20] } : { ...STAND, armF: [150, 10], armB: [-20, 20] };
  const crouch: Pose = { ...SEATED, lean: 30, armF: [70 + sawing, 20], armB: [60, 30] };
  return (
    <Sheet frame={frame} at={at} x={960} y={470} w={1120} h={640} tilt={-1.5}>
      {/* the fear: your chair, your best friend sawing at its leg */}
      <g opacity={dim}>
        <Chair x={250} y={430} scale={1.3} color="#c99a68" />
        <Figure x={410} y={560} scale={0.75} facing={-1} pose={crouch} head={MINJUN.head} coat={MINJUN.coat} brows="angry" mouth="smirk" eyes={1}
          lids={0.3} look={{ x: 0.8, y: 0.6 }} time={frame} />
        <Saw x={340 + sawing} y={500} scale={0.8} tilt={180} />
        <line x1={60} y1={600} x2={520} y2={600} stroke={INK} strokeWidth={5} />
      </g>
      {x > 0 && (
        <g stroke={CRIMSON} strokeWidth={22} strokeLinecap="round" opacity={0.9}>
          <line x1={110} y1={220} x2={110 + 400 * x} y2={220 + 380 * x} />
          <line x1={510} y1={220} x2={510 - 400 * x} y2={220 + 380 * x} />
        </g>
      )}
      {/* the truth: a paper ladder out of your mistake pages */}
      {rails > 0 && (
        <g>
          {[RAIL_L, RAIL_R].map((rx) => (
            <rect key={rx} x={rx - 12} y={mix(LADDER_FOOT, LADDER_TOP, rails)} width={24} height={(LADDER_FOOT - LADDER_TOP) * rails} rx={6}
              fill="#efe3cc" stroke={INK} strokeWidth={4} />
          ))}
          {Array.from({ length: RUNGS }, (_, i) => <PageRung key={i} i={i} pop={ramp(frame, build + 8 + i * 9, build + 16 + i * 9)} />)}
          <line x1={600} y1={600} x2={1000} y2={600} stroke={INK} strokeWidth={5} />
        </g>
      )}
      {frame >= climb - 10 && (
        <Figure x={me.x} y={me.y} scale={0.62} facing={1} pose={pose} head={MINJUN.head} coat={MINJUN.coat} brows="flat" mouth="smile" eyes={1}
          look={{ x: 0.4, y: -0.9 }} blink={blinking(frame, 2)} time={frame} />
      )}
    </Sheet>
  );
};

// ------------------------------------------------------------------------------------------------ L83 one colour

/** Your chair with a saw cut in its front leg (`cut` 0..1 deep) and a little heap of sawdust. Chair's own coords. */
const SawnChair: React.FC<{ x: number; y: number; scale: number; cut: number; notchY?: number }> = ({ x, y, scale, cut, notchY }) => (
  <g>
    <Chair x={x} y={y} scale={scale} color="#c99a68" />
    <path d={`M${x + 33 * scale} ${notchY ?? y + 38 * scale} l${-12 * scale * cut} ${4 * scale} l${12 * scale * cut} ${4 * scale}Z`} fill="#14151c" />
    <ellipse cx={x + 40 * scale} cy={y + 64 * scale} rx={26 * scale} ry={5 * scale} fill="#e2c08e" opacity={0.9} />
  </g>
);

/** Two cards side by side, both red, already landed (no flaps running): your best friend up on his paper ladder of
 *  your mistakes (-91), the rival beside your chair with a cut in its leg, hands behind his back (-71). You smile at
 *  "sweet" (SweetShot), then the camera slides onto the rival. */
export const TwoRedShot: React.FC<{ frame: number; at: number; rival: number }> = ({ frame, at, rival }) => {
  const S2 = 1.25;
  const MJ = { x: 600, y: 980 }, TH = { x: 1330, y: 980 };
  const LIFT = 150; // he stands on the second rung
  const mh = headAt(MJ.x, MJ.y - LIFT, S2, STAND, 1);
  const th = headAt(TH.x, TH.y, S2, STAND, -1);
  const landed = at - 30;
  const cam = camAt(frame, [[at, { x: 970, y: 640, zoom: 1.4 }], [rival - 20, { x: 980, y: 640, zoom: 1.45 }], [rival + 10, { x: 1260, y: 600, zoom: 1.7 }]]);
  return (
    <AbsoluteFill style={{ background: "#14151c" }}>
      <Stage cam={drift(cam, frame, "twored", 2)} radius={0} origin={{ x: 0, y: 0 }}
        back={
          <g>
            <rect x={-1400} y={-800} width={4800} height={2600} fill="#14151c" />
            <ellipse cx={MJ.x} cy={MJ.y + 10} rx={260} ry={40} fill="#ffd98a" opacity={0.12} />
            <ellipse cx={TH.x} cy={TH.y + 10} rx={300} ry={40} fill="#ffd98a" opacity={0.12} />
          </g>
        }
        actors={
          <>
            {/* his paper ladder of your mistake pages, him standing on it */}
            <g transform={`translate(${MJ.x} ${MJ.y})`}>
              <rect x={-90} y={-470} width={18} height={470} fill="#efe3cc" stroke={INK} strokeWidth={4} />
              <rect x={72} y={-470} width={18} height={470} fill="#efe3cc" stroke={INK} strokeWidth={4} />
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={i} transform={`translate(0 ${-70 - i * 90})`}>
                  <rect x={-100} y={-14} width={200} height={30} fill={PAPER} stroke={INK} strokeWidth={3} />
                  <MistakeMark x={40} y={0} scale={0.6} />
                </g>
              ))}
            </g>
            <Figure x={MJ.x} y={MJ.y - LIFT} scale={S2} facing={1} pose={{ ...STAND, armF: [150, 10], armB: [-20, 20] }} head={MINJUN.head} coat={MINJUN.coat}
              brows="flat" mouth="smile" lids={0.15} eyes={1} look={{ x: 0.8, y: -0.3 }} blink={blinking(frame, 2)} time={frame} />
            <SawnChair x={TH.x + 190} y={TH.y - 70} scale={1.3} cut={1} />
            <Figure x={TH.x} y={TH.y} scale={S2} facing={-1} pose={{ ...STAND, armF: [-30, 40], armB: [-40, 50] }} head={TAEHO.head} coat={TAEHO.coat} brows="angry"
              mouth="smirk" lids={0.3} eyes={1} look={{ x: 0.8, y: 0 }} blink={blinking(frame, 4)} time={frame} />
            <Meter frame={frame} at={landed} until={rival + 140} x={mh.x} headY={mh.y} r={mh.r} value={-91} />
            <Meter frame={frame} at={landed} until={rival + 140} x={th.x} headY={th.y} r={th.r} value={-71} />
          </>
        } />
    </AbsoluteFill>
  );
};

/** "...and he does not build ladders.": the rival under one lamp, a saw in his hand, its blade in the front leg of
 *  your chair (entering from the left); he looks up at you, grins, and saws; shavings drop from the cut. */
export const RivalSawShot: React.FC<{ frame: number; at: number; to: number }> = ({ frame, at, to }) => {
  const X = 980, Y = 990, SC = 1.3;
  const head = headAt(X, Y, SC, STAND, -1);
  const up = ramp(frame, at + 16, at + 26);
  const sawing = ramp(frame, at + 30, at + 40);
  const stroke = Math.sin(Math.max(0, frame - at - 30) / 3) * 26 * sawing;
  // the chair stands on his floor; its front leg crosses the blade (his hand low, the blade tilted down to the left)
  const CH = { x: 679, y: 804, s: 3 };
  const cutX = CH.x + 37 * CH.s, cutY = 852;
  const cam = camAt(frame, [[at, closeUp(head.x - 120, head.y + 130, 1.8)], [to, closeUp(head.x - 110, head.y + 120, 2.0)]]);
  const chips = sawing > 0 ? [0, 1, 2, 3].map((i) => {
    const t = ((frame - at - 30 + i * 9) % 36) / 36;
    return { x: cutX + (noise(i) - 0.5) * 30 + t * 20, y: cutY + 10 + t * t * 260, o: 1 - t, r: (noise(i + 5) * 40) };
  }) : [];
  return (
    <AbsoluteFill style={{ background: "#14151c" }}>
      <Stage cam={drift(cam, frame, "rivalsaw", 2)} radius={0} origin={{ x: 0, y: 0 }}
        back={
          <g>
            <rect x={-1400} y={-800} width={4800} height={2600} fill="#17181f" />
            <defs>
              <radialGradient id="nb-rival-pool">
                <stop offset="0%" stopColor="#ffd98a" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#ffb85a" stopOpacity={0} />
              </radialGradient>
            </defs>
            <ellipse cx={X - 160} cy={720} rx={560} ry={420} fill="url(#nb-rival-pool)" />
          </g>
        }
        actors={
          <>
            <SawnChair x={CH.x} y={CH.y} scale={CH.s} cut={mix(0.3, 1, sawing * ramp(frame, at + 30, to))} notchY={cutY - 6} />
            {chips.map((c, i) => (
              <rect key={i} x={c.x} y={c.y} width={12} height={5} rx={2} fill="#e2c08e" stroke={INK} strokeWidth={1.5} opacity={c.o} transform={`rotate(${c.r} ${c.x} ${c.y})`} />
            ))}
            <Figure x={X} y={Y} scale={SC} facing={-1} pose={{ ...STAND, lean: -6, armF: [25, 5] }} head={TAEHO.head} coat={TAEHO.coat}
              brows={up > 0.5 ? "angry" : "flat"} mouth={up > 0.5 ? "smirk" : "flat"} lids={mix(0.5, 0.2, up)} eyes={1}
              look={{ x: mix(0.4, 0.9, up), y: mix(0.9, -0.1, up) }} blink={blinking(frame, 4)} time={frame}
              held={<Saw x={stroke} y={0} scale={0.9} tilt={15} />} />
          </>
        } />
      <Dim amount={0.08} />
    </AbsoluteFill>
  );
};
