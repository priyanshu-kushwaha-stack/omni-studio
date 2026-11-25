// The debate studio for "The Statement" and "Read It Aloud" (Statement.tsx, ReadItAloud.tsx), look C: the painted
// debate-night plate (two wooden lecterns centre stage, the host's desk front-left with its gooseneck microphone, dark
// audience seats either side, four blue screens, spotlights) seen from the back of the hall. Over it in code: the leader
// and the challenger behind the lecterns and the host and you behind the desk (the painted lecterns and desk are laid
// back over them), the clock on the wall (eight o'clock), the audience in the front rows from behind with small dim
// counters and one crimson head with none, the press in the back rows. Also the split monitor of the other network
// (an insert), and the reverse on the stranger (the plate turned round and soft). No AI images.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { runPose } from "@whatif/kit/rig/pose";
import type { SetLight } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { AudienceBacks, Fingers, Person, RIVAL, ThermalFace } from "../parts/RivalParts";
import { plateBlur, PlateScene } from "../parts/Plate";
import { platePath, PlateCut, pw } from "../parts/Rival.Shots";
import { blinking, mix, PASTELS, STRANGER } from "../shared";

/** Floor behind the lecterns, the lecterns' centres, the people's scale there, the desk (seat top, host and you). */
export const D = { floor: 943, s: 1.65, leader: 694, challenger: 1255, seat: 822, host: 288, you: 132, deskTop: 729 };
export const CLOCK = { ...pw(480, 470), r: 30 };
/** Front rows from behind: the stranger is index 6 of the right block (no counter). */
const RIGHT = [4, 9, 0, 3, 12, 6, 2, 5, 1];
const LEFT = [2, 7, 1, 5, 0, 3];
export const STRANGER_SEAT = 6;

const LECTERNS = [platePath([[532, 495], [665, 495], [665, 703], [532, 703]]), platePath([[889, 495], [1025, 495], [1025, 703], [889, 703]])];
const DESK = platePath([[194, 553], [379, 553], [379, 700], [194, 700]]);

/** The other network on a monitor, split: the rival in his white coat with a 70, pointing at the leader's cool blue nose.
 *  Drawn in its own 1600 by 900 box from (0, 0). */
export const SplitMonitor: React.FC<{ frame: number; point?: number }> = ({ frame, point = 1 }) => (
  <g>
    <rect x={-30} y={-30} width={1660} height={960} rx={26} fill={INK} />
    <rect x={0} y={0} width={800} height={900} fill="#25305e" />
    <rect x={0} y={640} width={800} height={260} fill="#1a2248" />
    <clipPath id="split-left"><rect x={0} y={0} width={800} height={900} /></clipPath>
    <g clipPath="url(#split-left)">
      <Person id="split-rival" who={RIVAL} x={360} y={1040} scale={2.0} facing={1} frame={frame} seed={8}
        pose={{ lean: 0, tilt: -6, armB: [-7, 8], armF: [mix(20, 96, point), mix(30, -6, point)], legB: [-5, -2], legF: [6, -3], drop: 0 }}
        face={{ brows: "raised", lids: 0.4, mouth: "smirk", eyes: 1, look: { x: 1, y: 0 } }} count={{ base: 70, size: 110 }} />
    </g>
    <ThermalFace x={800} y={0} w={800} h={900} who="leader" nose="#3d7bff" frame={frame} id="split" />
    <rect x={0} y={840} width={1600} height={60} fill={CRIMSON} />
    <rect x={30} y={856} width={380} height={28} rx={14} fill={PAPER} opacity={0.85} />
    <line x1={800} y1={0} x2={800} y2={840} stroke={INK} strokeWidth={10} />
    <circle cx={1560} cy={40} r={16} fill={CRIMSON} opacity={Math.floor(frame / 15) % 2 ? 1 : 0.35} />
  </g>
);

/** The wall clock: eight o'clock plus `minutes`. */
export const Clock: React.FC<{ x: number; y: number; r: number; minutes: number }> = ({ x, y, r, minutes }) => {
  const m = (minutes / 60) * 360;
  const h = ((8 + minutes / 60) / 12) * 360;
  const hand = (deg: number, len: number, w: number) => (
    <line x1={x} y1={y} x2={x + Math.sin((deg * Math.PI) / 180) * len} y2={y - Math.cos((deg * Math.PI) / 180) * len} stroke={INK} strokeWidth={w} strokeLinecap="round" />
  );
  return (
    <g>
      <circle cx={x} cy={y} r={r + r * 0.14} fill="#9aa3b4" stroke={INK} strokeWidth={r * 0.08} />
      <circle cx={x} cy={y} r={r} fill="#e9e4d6" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={x + Math.sin(a) * r * 0.8} y1={y - Math.cos(a) * r * 0.8} x2={x + Math.sin(a) * r * 0.93} y2={y - Math.cos(a) * r * 0.93} stroke={INK} strokeWidth={i % 3 ? r * 0.03 : r * 0.08} />;
      })}
      {hand(h, r * 0.5, r * 0.12)}
      {hand(m, r * 0.78, r * 0.07)}
      <circle cx={x} cy={y} r={r * 0.09} fill={CRIMSON} />
    </g>
  );
};

/** Code-drawn background things go as soft as the painted room around them. */
export const Soft: React.FC<{ cam: Camera; id: string; children: React.ReactNode }> = ({ cam, id, children }) => {
  const sd = Math.round((plateBlur(cam.zoom) / cam.zoom) * 4) / 4;
  if (sd <= 0) return <g>{children}</g>;
  return (
    <g filter={`url(#${id}-${sd * 4})`}>
      <defs><filter id={`${id}-${sd * 4}`} x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={sd} /></filter></defs>
      {children}
    </g>
  );
};

/** The audience in the front rows, from behind, in the dark seats either side of the stage. */
const Audience: React.FC<{ frame: number; laugh: number; empty?: boolean }> = ({ frame, laugh, empty }) => (
  <g opacity={0.9}>
    <AudienceBacks from={pw(1050, 0).x} to={pw(1536, 0).x} y={pw(0, 528).y} n={9} frame={frame} laugh={laugh} counts={RIGHT} r={22} counterSize={20}
      stranger={empty ? -1 : STRANGER_SEAT} empty={empty ? [STRANGER_SEAT] : []} seed={11} />
    <AudienceBacks from={pw(0, 0).x} to={pw(500, 0).x} y={pw(0, 532).y} n={6} frame={frame} laugh={laugh} counts={LEFT} r={22} counterSize={20} seed={4} />
  </g>
);

/** The press in the back rows (nearest the camera), heads and shoulders over the seats; from `run` they stand and
 *  run for the side doors. */
export const Press: React.FC<{ frame: number; run?: number }> = ({ frame, run }) => (
  <g>
    {[[-60, 1070], [170, 1100], [380, 1135], [1560, 1135], [1780, 1100], [2010, 1070]].map(([x, y], i) => {
      const t = run === undefined ? 0 : Math.max(0, Math.min(1, (frame - run - (i % 3) * 4) / 70));
      const door = x < 960 ? -500 : 2420;
      const px = mix(x, door, t * t);
      if (t > 0) {
        return <Figure key={i} x={px} y={y + 120} scale={2.0} facing={door < x ? -1 : 1} pose={runPose(frame * 0.6 + i)} head={PASTELS[(i + 2) % 8]}
          coat="#3d4250" brows="raised" eyes={1.1} mouth="o" blink={false} time={frame} />;
      }
      return (
        <g key={i}>
          <rect x={x - 110} y={y - 30} width={220} height={260} rx={80} fill="#262a36" stroke={INK} strokeWidth={5} />
          <circle cx={x} cy={y - 90} r={78} fill={PASTELS[(i + 2) % 8]} stroke={INK} strokeWidth={5} opacity={0.85} />
        </g>
      );
    })}
  </g>
);

/** The debate studio on the plate. `actors` stand behind the lecterns and the desk; `onDesk` lies on the desk top. */
export const DebateScene: React.FC<{
  cam: Camera; mood: MoodName; frame: number; minutes: number; actors: React.ReactNode; onDesk?: React.ReactNode; lights?: SetLight[];
  laugh?: number; empty?: boolean; run?: number; press?: boolean; over?: React.ReactNode; clockInFocus?: boolean;
}> = ({ cam, mood, frame, minutes, actors, onDesk, lights = [], laugh = 0, empty, run, press = true, over, clockInFocus }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <PlateScene plate="debate-night" cam={cam} mood={mood} rim="cool" rimFrom="right" lights={lights}
      behind={
        <>
          <Soft cam={cam} id="debate-back">
            {!clockInFocus && <Clock x={CLOCK.x} y={CLOCK.y} r={CLOCK.r} minutes={minutes} />}
            <Audience frame={frame} laugh={laugh} empty={empty} />
          </Soft>
          {clockInFocus && <Clock x={CLOCK.x} y={CLOCK.y} r={CLOCK.r} minutes={minutes} />}
        </>
      }
      actors={actors}
      front={
        <>
          {LECTERNS.map((d, i) => <PlateCut key={i} name="debate-night" cam={cam} d={d} id={`lectern-${i}`} />)}
          <PlateCut name="debate-night" cam={cam} d={DESK} id="desk" />
          {onDesk}
          {press && <Press frame={frame} run={run} />}
        </>
      } />
    {over}
  </AbsoluteFill>
);

/** The reverse: the crimson stranger in the front row seen from the stage, counting on their fingers, the hall behind
 *  them the plate turned round and soft. World units on the flipped plate. */
export const STRANGER_FACE = { x: 1080, y: 640, r: 120 };
export const StrangerReverse: React.FC<{ cam: Camera; mood: MoodName; frame: number; fingers: number; lights?: SetLight[] }> = ({
  cam, mood, frame, fingers, lights = [],
}) => {
  const { x, y, r } = STRANGER_FACE;
  const blink = blinking(frame, 9);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <PlateScene plate="debate-night" cam={cam} mood={mood} rim="cool" rimFrom="left" flip blur={18} dim={0.7} lights={lights}
        actors={
          <g>
            {[[x - 330, 0.6], [x + 330, 0.6]].map(([bx, a], i) => (
              <g key={i} opacity={a}>
                <path d={`M${bx - r * 1.4} ${y + r * 3} Q${bx - r * 1.3} ${y + r * 0.9} ${bx} ${y + r * 0.85} Q${bx + r * 1.3} ${y + r * 0.9} ${bx + r * 1.4} ${y + r * 3}Z`} fill="#2f3242" />
                <circle cx={bx} cy={y + 20} r={r * 0.9} fill={PASTELS[i * 3 + 1]} />
              </g>
            ))}
            <path d={`M${x - r * 1.6} ${y + r * 3} Q${x - r * 1.5} ${y + r * 0.9} ${x} ${y + r * 0.85} Q${x + r * 1.5} ${y + r * 0.9} ${x + r * 1.6} ${y + r * 3}Z`} fill={STRANGER.coat} stroke={INK} strokeWidth={5} />
            <circle cx={x} cy={y} r={r} fill={STRANGER.head} stroke={INK} strokeWidth={4} />
            {[-0.32, 0.32].map((dx) => <ellipse key={dx} cx={x + dx * r + r * 0.06} cy={y - r * 0.26} rx={r * 0.13} ry={blink ? r * 0.03 : r * 0.19} fill={INK} />)}
            <path d={`M${x - r * 0.2} ${y + r * 0.45} H${x + r * 0.2}`} fill="none" stroke={INK} strokeWidth={r * 0.08} strokeLinecap="round" />
            <g transform={`translate(${x + r * 1.25} ${y + r * 0.95}) scale(${r / 40})`}><Fingers n={fingers} color={STRANGER.head} tilt={10} /></g>
          </g>
        } />
    </AbsoluteFill>
  );
};
