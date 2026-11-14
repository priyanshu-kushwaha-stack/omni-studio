// Who's Red, line 32: the mirror in the school toilets, as a test that turns into a laugh (outside review of v6,
// 3:19-3:26: eight seconds of a soft, blurred hold, no laugh). One set-up over your shoulder, everything sharp: your back
// big in the near foreground, the sink, your reflection in the glass. Your reflection copies every attempt, each one more
// awkward:
//   "The mirror in the school toilets."  you hold the letter up to the glass and say it; so does your reflection
//   "Nothing opens."                     you swat the empty air over your head; your reflection swats over its own
//   "So a mirror isn't a face."          two hops to catch it, then nose to the glass, squinting; it copies
//   "Or the one card you can't see is yours."  you freeze; your eyes go up; the camera tilts off the glass to the empty
//                                        air above your real head, and your hand pats it, twice; your reflection too
import { Figure } from "@whatif/kit/rig/Figure";
import { joints, STAND, type Pose } from "@whatif/kit/rig/pose";
import type { MoodName } from "@whatif/kit/stage/moods";
import { drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, MUSTARD, TEAL } from "@whatif/kit/theme";
import { Letter } from "../parts";
import { blinking, camAt, current, HERO, mix, ramp } from "../shared";
import { armTo, FlatShot } from "./WhosCrimson.Common";
import { talk } from "./HerBack.Sister";
import { handAt } from "./WhosCrimson.More";
import type { CrimsonTimes } from "./WhosCrimson.Times";

/** The school toilets' wall: pale tiles, a dado line, the floor. */
const TileWall: React.FC = () => (
  <g>
    <rect x={-1400} y={-800} width={4800} height={2600} fill="#d6e4e2" />
    <path d={Array.from({ length: 60 }, (_, i) => `M${-1400 + i * 90} -800 V1000`).join(" ") + Array.from({ length: 22 }, (_, i) => ` M-1400 ${-800 + i * 90} H3400`).join("")}
      stroke="#b9cbc8" strokeWidth={3} />
    <rect x={-1400} y={880} width={4800} height={20} fill="#8fa8a4" />
    <rect x={-1400} y={1000} width={4800} height={800} fill="#a9b6b3" />
  </g>
);

const MIRROR = { x: 760, y: 90, w: 640, h: 600 } as const;
/** Your reflection, facing out of the glass (-1). */
const REFL = { x: 1090, y: 950, scale: 1.8 } as const;
/** Your own head from behind, in the near foreground at the lower left (world). */
const BACK = { x: 640, y: 840, r: 132 } as const;

/** What both of you do at a frame: `hop` lifts you (world px), `lean` brings you nearer the glass (0..1), `free` is where
 *  your free hand is relative to the top of your head (null: down), `up` tips your head back. */
interface Act { hop: number; lean: number; free: { x: number; y: number } | null; up: number }

function act(frame: number, k: CrimsonTimes): Act {
  // "Nothing opens.": a swat back and forth over your head
  const swat = frame >= k.mirrorUp + 4 && frame < k.hops;
  const swing = Math.sin((frame - k.mirrorUp) / 3.2);
  // "So a mirror isn't a face.": two hops, reaching, then nose to the glass
  const hopEnd = Math.round(mix(k.hops, k.ownHead, 0.55));
  const hopping = frame >= k.hops && frame < hopEnd;
  const hop = hopping ? Math.abs(Math.sin(((frame - k.hops) / (hopEnd - k.hops)) * Math.PI * 2)) * 46 : 0;
  const lean = ramp(frame, hopEnd, hopEnd + 8) * (1 - ramp(frame, k.ownHead + 4, k.ownHead + 14));
  // "Or the one card you can't see is yours.": the freeze, the eyes up, then two pats on the air over your own head
  const patFrom = k.ownHead + 30;
  const patting = frame >= patFrom && frame < k.tourIn;
  const pat = patting ? Math.abs(Math.sin((frame - patFrom) / 5)) * 26 : 0;
  const free = swat ? { x: swing * 110, y: -70 } : hopping ? { x: 30, y: -110 } : patting ? { x: 10, y: -46 - pat } : null;
  const up = ramp(frame, k.ownHead + 10, k.ownHead + 24);
  return { hop, lean, free, up };
}

/** The mirror over the sink: glass, frame, basin and tap, and your reflection inside the glass doing what you do. */
const MirrorAndSink: React.FC<{ frame: number; k: CrimsonTimes; a: Act }> = ({ frame, k, a }) => {
  const m = MIRROR;
  const scale = REFL.scale * (1 + 0.14 * a.lean);
  const y = REFL.y - a.hop * 0.9 + a.lean * 60;
  let pose: Pose = { ...STAND, lean: 0 };
  const sh = { x: REFL.x, y: y - 205 * scale };
  // the letter up by the face, on the same side of the screen as your real one
  pose = { ...pose, armF: armTo(REFL.x, y, scale, pose, -1, { x: REFL.x - 120 * scale, y: sh.y - 20 * scale }) };
  // the free arm copying yours, drawn by hand (to a point above the head the rig's arm can't reach)
  const js = joints(pose).shoulder;
  const sx = REFL.x - js.x * scale, sy = y + js.y * scale;
  const freeHand = a.free ? { x: REFL.x + 40 + a.free.x * 1.1, y: y - 330 * scale + a.free.y * 1.2 } : null;
  const saying = frame >= k.mirror + 22 && frame < k.mirrorUp - 4;
  const face = {
    brows: a.up > 0.5 ? "raised" as const : a.lean > 0.5 ? "angry" as const : a.free ? "worry" as const : "raised" as const,
    lids: a.lean > 0.5 ? 0.55 : 0,
    mouth: saying ? talk(frame, k.mirror + 22, k.mirrorUp - 4, "flat") : a.up > 0.5 ? "o" as const : a.free ? "flat" as const : "flat" as const,
    eyes: a.up > 0.5 ? 1.15 : 1.05,
    look: { x: 0.05, y: a.up > 0.5 ? -1 : a.free ? -0.7 : 0.05 },
  };
  const hand = handAt(REFL.x, y, scale, pose, -1, "front");
  return (
    <g>
      <clipPath id="mirror-glass"><rect x={m.x} y={m.y} width={m.w} height={m.h} rx={10} /></clipPath>
      <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={10} fill="#c5dadd" />
      <g clipPath="url(#mirror-glass)">
        <path d={Array.from({ length: 10 }, (_, i) => `M${m.x + i * 90} ${m.y} V${m.y + m.h}`).join(" ")} stroke="#aec4c6" strokeWidth={3} />
        <Figure {...HERO} x={REFL.x} y={y} scale={scale} facing={-1} pose={pose} {...face} blink={blinking(frame, 1)} time={frame} />
        <Letter x={hand.x} y={hand.y + 30} scale={0.72} tilt={8} />
        {freeHand && (
          <>
            <polyline points={`${sx},${sy} ${mix(sx, freeHand.x, 0.5) + 30},${mix(sy, freeHand.y, 0.5)} ${freeHand.x},${freeHand.y}`} fill="none" stroke={INK}
              strokeWidth={13 * scale} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={freeHand.x} cy={freeHand.y} r={9 * scale} fill={MUSTARD} />
          </>
        )}
        {[0, 1].map((i) => <path key={i} d={`M${m.x + 80 + i * 260} ${m.y} l90 0 l-260 ${m.h} l-90 0Z`} fill="#fff" opacity={0.12} />)}
      </g>
      <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={10} fill="none" stroke="#8a949c" strokeWidth={18} />
      <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={10} fill="none" stroke={INK} strokeWidth={5} />
      <path d={`M${m.x + 90} 760 H${m.x + m.w - 90} Q${m.x + m.w - 110} 850 ${m.x + m.w / 2} 856 Q${m.x + 110} 850 ${m.x + 90} 760Z`} fill="#f4f6f5" stroke={INK} strokeWidth={6} />
      <rect x={m.x + 70} y={748} width={m.w - 140} height={18} rx={8} fill="#e9ecea" stroke={INK} strokeWidth={5} />
      <path d={`M${m.x + m.w / 2 - 10} 748 V722 Q${m.x + m.w / 2 - 10} 708 ${m.x + m.w / 2 + 20} 708 H${m.x + m.w / 2 + 40}`} fill="none" stroke="#8a949c" strokeWidth={14} strokeLinecap="round" />
    </g>
  );
};

/** You from behind, big in the near foreground: the back of your head and its tuft, the teal scarf, your shoulders, the
 *  letter (its back) held up at the glass on the left, and your free right arm doing what `a` says. */
const YouFromBehind: React.FC<{ a: Act }> = ({ a }) => {
  const { x, r } = BACK;
  const y = BACK.y - a.hop - a.lean * 20;
  const s = 1 - a.lean * 0.06;
  const hy = y - a.up * 10;
  const free = a.free ? { x: x + 60 + a.free.x, y: hy - r + a.free.y } : null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>
      <rect x={x - 250} y={y + r - 30} width={500} height={600} rx={170} fill={INK} />
      <polyline points={`${x - 200},${y + r + 40} ${x - 300},${y + 10} ${x - 330},${y - 120}`} fill="none" stroke={INK} strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" />
      <g transform={`translate(${x - 336} ${y - 96}) rotate(6)`}>
        <rect x={-64} y={-170} width={128} height={172} rx={6} fill="#efe6d2" stroke={INK} strokeWidth={5} />
        {[0, 1, 2].map((i) => <line key={i} x1={-40} y1={-140 + i * 24} x2={44} y2={-140 + i * 24} stroke={INK} strokeWidth={5} opacity={0.12} />)}
      </g>
      <circle cx={x - 330} cy={y - 100} r={24} fill={MUSTARD} stroke={INK} strokeWidth={5} />
      {free && (
        <>
          <polyline points={`${x + 200},${y + r + 40} ${mix(x + 290, free.x + 40, 0.5)},${mix(y + r, free.y, 0.5)} ${free.x},${free.y}`} fill="none" stroke={INK}
            strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={free.x} cy={free.y} r={26} fill={MUSTARD} stroke={INK} strokeWidth={5} />
        </>
      )}
      <path d={`M${x - 220} ${y + r - 40} Q${x} ${y + r + 30} ${x + 220} ${y + r - 40} L${x + 200} ${y + r + 40} Q${x} ${y + r + 100} ${x - 200} ${y + r + 40}Z`}
        fill={TEAL} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <circle cx={x} cy={hy} r={r} fill={MUSTARD} stroke={INK} strokeWidth={9} />
      <path d={`M${x - 8} ${hy - r + 4} q${10 - a.up * 6} -58 46 -18`} fill="none" stroke={INK} strokeWidth={16} strokeLinecap="round" />
    </g>
  );
};

type MirrorView = "glass" | "swat" | "hops" | "own";

export const MirrorShot: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const view = current<MirrorView>(frame, [[0, "glass"], [k.mirrorUp, "swat"], [k.hops, "hops"], [k.ownHead, "own"]]);
  const a = act(frame, k);
  const tilt = ramp(frame, k.ownHead + 16, k.ownHead + 40);
  const cams: Record<MirrorView, Camera> = {
    glass: camAt(frame, [[k.mirror, { x: 990, y: 560, zoom: 1.12 }], [k.mirrorUp, { x: 1000, y: 540, zoom: 1.2 }]]),
    swat: camAt(frame, [[k.mirrorUp, { x: 1010, y: 470, zoom: 1.32 }], [k.hops, { x: 1020, y: 460, zoom: 1.38 }]]),
    hops: camAt(frame, [[k.hops, { x: 980, y: 520, zoom: 1.2 }], [k.ownHead, { x: 1040, y: 470, zoom: 1.45 }]]),
    // the tilt off the glass to the empty air above your real head
    own: camAt(frame, [[k.ownHead, { x: 990, y: 500, zoom: 1.3 }], [k.ownHead + 16, { x: 985, y: 505, zoom: 1.3 }],
      [Math.max(k.ownHead + 17, k.tourIn), { x: mix(985, 760, 1), y: mix(505, 560, 1), zoom: mix(1.3, 1.32, tilt) }]]),
  };
  const cam = drift(cams[view], frame, "mirror", 2);
  return (
    <FlatShot cam={cam} mood={mood} back={<TileWall />} actors={
      <>
        <MirrorAndSink frame={frame} k={k} a={a} />
        <YouFromBehind a={a} />
      </>
    } />
  );
};
