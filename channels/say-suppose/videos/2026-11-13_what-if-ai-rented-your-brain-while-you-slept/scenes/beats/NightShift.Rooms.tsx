// The Night Shift's people and places beyond the bunk room's own: you sitting up awake on the bottom bunk (KEY
// coordinates, drawn as BunkRoom children), the overflowing bin, the gown on its hanger, your brother standing at the
// bunk with the stamp, the bathroom mirror, and the wall inserts where the KEYS and DOOR tags land.
import { Figure, type FigureProps } from "@whatif/kit/rig/Figure";
import { joints, SIT, STAND, type Pose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { Deep } from "@whatif/kit/sets/common";
import { INK, PAPER } from "@whatif/kit/theme";
import { Band, headAt, StampTag } from "../parts";
import { BROTHER, HERO, mix, ramp } from "../shared";
import { aimArm, type Body } from "./NightShift.Rig";

export type Face = Pick<FigureProps, "brows" | "lids" | "mouth" | "eyes" | "look" | "blink">;

// ---------------------------------------------------------------- you, sitting up on the bottom bunk

/** You sitting up in the bottom bunk, back to the pillow, legs under the blanket (KEY pixels). */
export const YOU_SIT = { x: 610, seat: 850, scale: 2.0 } as const;
export const SIT_UP: Pose = { ...SIT, lean: -4, armF: [62, 74], armB: [20, 50] };
export const youBody = (pose: Pose = SIT_UP): Body => ({ x: YOU_SIT.x, y: YOU_SIT.seat + 112 * YOU_SIT.scale, scale: YOU_SIT.scale, facing: 1, pose });
export const youHead = (pose: Pose = SIT_UP) => headAt(YOU_SIT.x, YOU_SIT.seat + 112 * YOU_SIT.scale, YOU_SIT.scale, pose, 1);

/** Grey under the eyes and the band's pink mark across the forehead, over a Figure's head. */
export const FaceMarks: React.FC<{ b: Body; look?: { x: number; y: number }; bags?: number; mark?: number }> = ({ b, look = { x: 0.4, y: 0 }, bags = 0, mark = 0 }) => {
  const j = joints(b.pose);
  const ex = look.x * 12;
  const ey = look.y * 8;
  return (
    <g transform={`translate(${b.x} ${b.y}) scale(${b.scale * b.facing} ${b.scale}) translate(${j.head.x} ${j.head.y}) rotate(${b.pose.tilt})`}>
      {bags > 0 && [-10, 17].map((cx) => (
        <path key={cx} d={`M${cx + ex - 9} ${8 + ey} Q${cx + ex} ${15 + ey} ${cx + ex + 9} ${8 + ey} Q${cx + ex} ${11 + ey} ${cx + ex - 9} ${8 + ey}Z`} fill="#6b6e78" stroke="#6b6e78" strokeWidth={3} strokeLinejoin="round" opacity={0.75 * bags} />
      ))}
      {mark > 0 && <path d="M-30 -35 Q2 -45 32 -34" fill="none" stroke="#d97f78" strokeWidth={6} strokeLinecap="round" opacity={0.75 * mark} />}
    </g>
  );
};

/** You, awake on the bottom bunk: the band in your hand (unlit), the blanket over your legs. `tagAt` presses the YOU
 *  tag to your forehead at that frame. */
export const SittingYou: React.FC<{ frame: number; face: Face; pose?: Pose; band?: boolean; tagAt?: number; mark?: number }> = ({
  frame, face, pose = SIT_UP, band = true, tagAt, mark = 0.4 }) => {
  const b = youBody(pose);
  const h = youHead(pose);
  return (
    <g>
      {/* the pillow propped up against the post behind you, and the duvet bunched at the head end */}
      <ellipse cx={420} cy={700} rx={110} ry={170} fill="#e9dcc4" stroke={INK} strokeWidth={6} transform="rotate(-12 420 700)" />
      <path d="M300 860 C290 760 360 700 450 720 C520 690 600 730 620 860Z" fill="#3e5c8f" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <Figure x={b.x} y={b.y} scale={b.scale} pose={pose} {...HERO} {...face}
        held={band ? <Band x={6} y={-6} scale={0.55} lit={false} tilt={-20} /> : undefined} />
      <FaceMarks b={b} look={face.look} mark={mark} />
      <path d={`M${b.x + 20} ${YOU_SIT.seat + 6} C${b.x + 60} ${YOU_SIT.seat - 70} ${b.x + 200} ${YOU_SIT.seat - 50} ${b.x + 300} ${YOU_SIT.seat - 40}
        C${b.x + 420} ${YOU_SIT.seat - 30} ${b.x + 520} ${YOU_SIT.seat - 20} ${b.x + 600} ${YOU_SIT.seat + 6}Z`} fill="#3e5c8f" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {tagAt !== undefined && <StampTag frame={frame} at={tagAt} x={h.x + 10} y={h.y - h.r * 0.52} text="YOU" size={30} tilt={-7} />}
    </g>
  );
};

// ---------------------------------------------------------------- the room's things

/** The bin by the bunk, overflowing: crumpled paper heaped over the rim, a cup, a ball on the floor. (x, y) its base. */
export const Bin: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const balls = [[-60, -270, 34], [-10, -300, 40], [48, -276, 32], [20, -250, 30], [-40, -240, 28], [70, -246, 26], [-80, -246, 24]];
  return (
    <g>
      <path d={`M${x - 95} ${y - 250} L${x - 80} ${y} H${x + 80} L${x + 95} ${y - 250}Z`} fill="#7d8590" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {[-50, 0, 50].map((dx) => <line key={dx} x1={x + dx} y1={y - 236} x2={x + dx * 0.85} y2={y - 14} stroke={INK} strokeWidth={3} opacity={0.3} />)}
      <path d={`M${x - 10} ${y - 330} L${x + 40} ${y - 332} L${x + 34} ${y - 262} L${x - 4} ${y - 262}Z`} fill="#f7f4ee" stroke={INK} strokeWidth={4} transform={`rotate(14 ${x} ${y - 300})`} />
      {balls.map(([dx, dy, r], i) => (
        <g key={i}>
          <circle cx={x + dx} cy={y + dy} r={r} fill={i % 3 ? "#f3ead8" : "#e6dcc6"} stroke={INK} strokeWidth={4} />
          <path d={`M${x + dx - r * 0.5} ${y + dy - r * 0.1} l${r * 0.4} ${r * 0.3} l${r * 0.3} ${-r * 0.4}`} fill="none" stroke={INK} strokeWidth={3} opacity={0.5} />
        </g>
      ))}
      <rect x={x - 106} y={y - 262} width={212} height={20} rx={8} fill="#8f98a3" stroke={INK} strokeWidth={5} />
      {[[150, -24, 26], [-160, -20, 22]].map(([dx, dy, r], i) => <circle key={i} cx={x + dx} cy={y + dy} r={r} fill="#f3ead8" stroke={INK} strokeWidth={4} />)}
    </g>
  );
};

/** The gown on a hanger, hooked over the top bunk's rail (KEY pixels). */
export const GownHanger: React.FC<{ x: number; rail: number; sway?: number }> = ({ x, rail, sway = 0 }) => (
  <g>
    <g transform={`rotate(${sway} ${x} ${rail})`}>
      <path d={`M${x} ${rail + 8} q0 -26 18 -26 q18 0 14 18`} fill="none" stroke="#9aa1ab" strokeWidth={6} strokeLinecap="round" />
      <path d={`M${x} ${rail + 10} L${x - 110} ${rail + 70} H${x + 110}Z`} fill="none" stroke="#9aa1ab" strokeWidth={8} strokeLinejoin="round" />
      <path d={`M${x - 112} ${rail + 70} L${x - 150} ${rail + 520} H${x + 150} L${x + 112} ${rail + 70} L${x + 30} ${rail + 62} L${x} ${rail + 120} L${x - 30} ${rail + 62}Z`}
        fill="#2b2f5a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M${x - 30} ${rail + 62} L${x} ${rail + 120} L${x + 30} ${rail + 62}`} fill="none" stroke="#f2b632" strokeWidth={8} strokeLinejoin="round" />
      <path d={`M${x - 60} ${rail + 150} Q${x - 80} ${rail + 330} ${x - 90} ${rail + 510} M${x + 50} ${rail + 160} Q${x + 70} ${rail + 340} ${x + 80} ${rail + 510}`} fill="none" stroke="#000" strokeWidth={5} opacity={0.25} />
    </g>
  </g>
);

/** An open notebook, held (in a Figure's hand units). */
export const Notebook: React.FC = () => (
  <g transform="rotate(-20) translate(-10 -30)">
    <path d="M0 0 L-62 -14 L-62 34 L0 46Z" fill={PAPER} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M0 0 L58 -16 L58 32 L0 46Z" fill="#fffaf0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    {[0, 1, 2].map((i) => <path key={i} d={`M8 ${10 + i * 11} L48 ${-1 + i * 11}`} stroke={INK} strokeWidth={3} opacity={0.4} />)}
  </g>
);

/** A rubber stamp, held: a wooden knob and handle on a dark pad. */
export const StampTool: React.FC = () => (
  <g transform="translate(0 -8)">
    <circle cx={0} cy={-46} r={14} fill="#a8774a" stroke={INK} strokeWidth={4} />
    <rect x={-7} y={-36} width={14} height={26} fill="#a8774a" stroke={INK} strokeWidth={3} />
    <rect x={-26} y={-12} width={52} height={16} rx={3} fill="#5a3a28" stroke={INK} strokeWidth={4} />
    <rect x={-24} y={4} width={48} height={7} fill="#c0392b" />
  </g>
);

/** The sheet of cream tags on the mattress (a few already stamped: crimson bars, no letters). */
export const TagSheet: React.FC<{ x: number; y: number; used?: number }> = ({ x, y, used = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(-6)`}>
    <rect x={-90} y={-60} width={180} height={120} rx={6} fill={PAPER} stroke={INK} strokeWidth={4} />
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x={-80 + (i % 2) * 85} y={-50 + Math.floor(i / 2) * 55} width={75} height={45} rx={4} fill="none" stroke="#cdbfa6" strokeWidth={3} strokeDasharray="6 5" />
        {i < used && <rect x={-70 + (i % 2) * 85} y={-32 + Math.floor(i / 2) * 55} width={55} height={10} rx={5} fill="#d8344f" opacity={0.7} />}
      </g>
    ))}
  </g>
);

/** Your brother standing at the bunk (KEY pixels), facing you on the left. */
export const BRO_STAND = { x: 840, y: 1150, scale: 2.45 } as const;
export const broBody = (pose: Pose, dx = 0): Body => ({ x: BRO_STAND.x + dx, y: BRO_STAND.y, scale: BRO_STAND.scale, facing: -1, pose });

export const StandingBrother: React.FC<{ b: Body; face: Face; held?: React.ReactNode; frame: number }> = ({ b, face, held, frame }) => (
  <Figure x={b.x} y={b.y} scale={b.scale} facing={b.facing} pose={b.pose} head={BROTHER.head} coat={BROTHER.coat} cap={BROTHER.cap}
    {...face} blink={face.blink ?? (frame + 31) % 97 < 4} held={held} />
);

// ---------------------------------------------------------------- the bathroom mirror

const MIRROR = { x: 600, y: 110, w: 760, h: 660 };

/** The bathroom: tiles, the mirror over the basin, a light over it; in the glass, you, grey under the eyes, the band's
 *  mark on your forehead. `touch` (0..1) lifts your hand to the mark. */
export const Bathroom: React.FC<{ frame: number; cam: Camera; face: Face; touch?: number }> = ({ frame, cam, face, touch = 0 }) => {
  const b: Body = { x: MIRROR.x + MIRROR.w / 2, y: 470 + 264 * 2.25, scale: 2.25, facing: -1, pose: STAND };
  const brow = { x: b.x - 10 * b.scale, y: 470 - 36 * b.scale };
  const reachTo = aimArm(b, brow);
  const rest: [number, number] = [-8, 12];
  const pose: Pose = { ...STAND, armB: [mix(rest[0], reachTo[0], touch), mix(rest[1], reachTo[1], touch)], armF: [8, 10] };
  b.pose = pose;
  return (
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
      back={
        <>
          <Deep cam={cam} depth={0.9} flat>
            <rect x={-800} y={-600} width={3600} height={2400} fill="#bcd3d6" />
            <path d={[...Array.from({ length: 30 }, (_, i) => `M${-800 + i * 120} -600V1800`), ...Array.from({ length: 22 }, (_, i) => `M-800 ${-600 + i * 120}H2800`)].join("")} stroke="#9fb9bd" strokeWidth={5} />
          </Deep>
          <Deep cam={cam} depth={1}>
            <rect x={MIRROR.x - 24} y={MIRROR.y - 24} width={MIRROR.w + 48} height={MIRROR.h + 48} rx={18} fill="#8a6a4a" stroke={INK} strokeWidth={6} />
            <rect x={MIRROR.x} y={MIRROR.y} width={MIRROR.w} height={MIRROR.h} fill="#c7dadf" />
            <rect x={MIRROR.x + 180} y={MIRROR.y - 90} width={400} height={30} rx={15} fill="#fff6d8" stroke={INK} strokeWidth={4} />
          </Deep>
        </>
      }
      actors={
        <g>
          <clipPath id="ns-mirror"><rect x={MIRROR.x} y={MIRROR.y} width={MIRROR.w} height={MIRROR.h} /></clipPath>
          <g clipPath="url(#ns-mirror)">
            {/* the room behind you, in the glass: the far tiles and the door */}
            <rect x={MIRROR.x} y={MIRROR.y} width={MIRROR.w} height={MIRROR.h} fill="#a9c0c4" />
            <rect x={MIRROR.x + 520} y={MIRROR.y + 120} width={200} height={560} fill="#8a6a4a" opacity={0.6} />
            <Figure x={b.x} y={b.y} scale={b.scale} facing={-1} pose={pose} {...HERO} {...face} />
            <FaceMarks b={b} look={face.look} bags={1} mark={1} />
            <path d={`M${MIRROR.x + 60} ${MIRROR.y + MIRROR.h} L${MIRROR.x + 260} ${MIRROR.y} H${MIRROR.x + 330} L${MIRROR.x + 130} ${MIRROR.y + MIRROR.h}Z`} fill="#fff" opacity={0.12} />
          </g>
          {/* the basin and the shelf */}
          <rect x={360} y={800} width={1240} height={36} rx={10} fill="#eef1f4" stroke={INK} strokeWidth={6} />
          <path d="M760 836 Q980 980 1200 836Z" fill="#eef1f4" stroke={INK} strokeWidth={6} />
          <rect x={960} y={760} width={22} height={44} fill="#9aa1ab" stroke={INK} strokeWidth={3} />
          <path d="M971 760 q0 -30 50 -30" fill="none" stroke="#9aa1ab" strokeWidth={12} strokeLinecap="round" />
          <rect x={1420} y={720} width={60} height={82} rx={8} fill="#7fc29b" stroke={INK} strokeWidth={4} />
          <line x1={1440} y1={724} x2={1430} y2={640} stroke={INK} strokeWidth={6} />
          <rect x={1420} y={624} width={22} height={24} rx={4} fill="#d8344f" />
        </g>
      } />
  );
};

// ---------------------------------------------------------------- the wall inserts (KEYS on the hook, DOOR on the door)

/** A close insert on the wall by the door (`kind` "hook": the key rack with the keys on it; "door": the door's panel and
 *  knob). Your brother's arm comes in from the right and slaps the tag on at `tagAt`. */
export const WallInsert: React.FC<{ frame: number; kind: "hook" | "door"; tagAt: number; start: number; end: number }> = ({ frame, kind, tagAt, start, end }) => {
  const p = Math.min(1, Math.max(0, (frame - start) / Math.max(1, end - start)));
  const cam: Camera = { x: 960 + p * 30, y: 540, zoom: 1.02 + p * 0.06 };
  const tag = kind === "hook" ? { x: 900, y: 420 } : { x: 980, y: 470 };
  const reachIn = ramp(frame, tagAt - 12, tagAt - 1) * (1 - ramp(frame, tagAt + 8, tagAt + 20));
  const hand = { x: tag.x + 150 + (1 - reachIn) * 900, y: tag.y + 20 };
  return (
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
      back={
        <Deep cam={cam} depth={0.95}>
          <rect x={-800} y={-600} width={3600} height={2400} fill="#c99a7a" />
          {kind === "hook" ? (
            <g>
              <rect x={640} y={520} width={560} height={60} rx={10} fill="#8a5a3a" stroke={INK} strokeWidth={6} />
              {[740, 920, 1100].map((x) => <path key={x} d={`M${x} 560 v40 q0 26 26 26`} fill="none" stroke="#3a3f4c" strokeWidth={12} strokeLinecap="round" />)}
              <circle cx={936} cy={660} r={30} fill="none" stroke="#b8bec8" strokeWidth={9} />
              <path d="M930 690 L918 800 M918 760 h22 M918 785 h16" stroke="#e0b84a" strokeWidth={14} strokeLinecap="round" />
              <path d="M950 688 L992 790 M980 760 l16 -8" stroke="#b8bec8" strokeWidth={14} strokeLinecap="round" />
            </g>
          ) : (
            <g>
              <rect x={460} y={-200} width={1000} height={1600} fill="#8a5a3a" stroke={INK} strokeWidth={8} />
              <rect x={540} y={-120} width={840} height={440} rx={10} fill="none" stroke="#5f3e2b" strokeWidth={10} />
              <rect x={540} y={420} width={840} height={600} rx={10} fill="none" stroke="#5f3e2b" strokeWidth={10} />
              <circle cx={1360} cy={700} r={34} fill="#d9b25a" stroke={INK} strokeWidth={6} />
              <rect x={1300} y={-200} width={20} height={1600} fill="#000" opacity={0.08} />
            </g>
          )}
        </Deep>
      }
      actors={
        <g>
          <StampTag frame={frame} at={tagAt} x={tag.x} y={tag.y} text={kind === "hook" ? "KEYS" : "DOOR"} size={64} tilt={kind === "hook" ? -5 : 4} />
          {reachIn > 0.02 && (
            <g>
              <line x1={hand.x + 30} y1={hand.y + 10} x2={hand.x + 900} y2={hand.y + 260} stroke={BROTHER.coat} strokeWidth={70} strokeLinecap="round" />
              <circle cx={hand.x} cy={hand.y} r={40} fill={BROTHER.head} stroke={INK} strokeWidth={4} />
            </g>
          )}
        </g>
      } />
  );
};
