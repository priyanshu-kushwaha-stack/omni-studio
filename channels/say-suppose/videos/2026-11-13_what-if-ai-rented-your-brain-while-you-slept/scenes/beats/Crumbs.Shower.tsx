// The shower and the wall (Crumbs, morning three): a cutaway, the shared wall in section down the middle. Left, your
// shower: blue tiles, the shower head, falling water, steam, a curtain to the chest. Right, the grandmother's front
// room: lilac wallpaper, a framed picture, a lamp, her armchair. The tune goes out of your mouth as drawn notes; her
// lilac fist bangs the wall (the tiles jump); then her notes come back through it. World coordinates at REF.
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, seatedY, STAND } from "@whatif/kit/rig/pose";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { GRANDMOTHER, blinking, noise } from "../shared";
import { aimArm, Note, You, type Body, type Face } from "./Crumbs.Rig";

export const SHOWER = {
  wall: { from: 900, to: 980 },
  floor: 990,
  you: { x: 560, y: 1010, scale: 1.3, facing: 1 as const },
  chair: { x: 1500, top: 850 },
  /** Where her fist meets the wall, and where it lands on your side. */
  bang: { x: 982, y: 640 },
  showerHead: { x: 470, y: 230 },
};

/** How far the tiles jump after the bangs at `bangs` (frames): a quick decaying shake. */
export function shake(frame: number, bangs: number[]) {
  let v = 0;
  for (const b of bangs) {
    const d = frame - b;
    if (d >= 0 && d < 10) v += Math.sin(d * 2.2) * (10 - d) * 0.9;
  }
  return v;
}

/** Her fist's distance from the wall: 0 at each bang, back 40 between. */
function fistPull(frame: number, bangs: number[]) {
  let pull = 40;
  for (const b of bangs) {
    const d = frame - b;
    if (d > -6 && d < 5) pull = Math.min(pull, Math.abs(d) * 7);
  }
  return pull;
}

const Back: React.FC<{ frame: number; jump: number }> = ({ frame, jump }) => {
  const W = SHOWER.wall;
  const H = SHOWER.showerHead;
  return (
    <g>
      {/* your side: tiles (they jump when she bangs) */}
      <g transform={`translate(${jump} 0)`}>
        <rect x={-900} y={-600} width={1800} height={2000} fill="#cfe6ec" />
        {Array.from({ length: 22 }, (_, i) => <line key={`v${i}`} x1={-900 + i * 84} y1={-600} x2={-900 + i * 84} y2={SHOWER.floor} stroke="#a9cbd4" strokeWidth={4} />)}
        {Array.from({ length: 20 }, (_, i) => <line key={`h${i}`} x1={-900} y1={-600 + i * 84} x2={W.from} y2={-600 + i * 84} stroke="#a9cbd4" strokeWidth={4} />)}
        {/* the shower head on its pipe */}
        <rect x={H.x - 8} y={-400} width={16} height={H.y + 400 - 20} fill="#9aa3ad" stroke={INK} strokeWidth={3} />
        <path d={`M${H.x} ${H.y - 24} q40 -10 70 20 l-30 30 Z`} fill="#b8c0c9" stroke={INK} strokeWidth={4} />
        <rect x={180} y={540} width={90} height={14} rx={6} fill="#9aa3ad" stroke={INK} strokeWidth={3} />
        <rect x={190} y={510} width={70} height={30} rx={8} fill="#f2a0b0" stroke={INK} strokeWidth={3} />
      </g>
      {/* the falling water: dashed streaks that run down */}
      {Array.from({ length: 9 }, (_, i) => {
        const x0 = H.x + 40 + i * 10;
        const x1 = H.x + 20 + i * 30;
        return <path key={i} d={`M${x0} ${H.y + 20} L${x1} ${SHOWER.floor}`} stroke="#ffffff" strokeWidth={5} opacity={0.55}
          strokeDasharray="40 50" strokeDashoffset={-frame * 18 - i * 23} />;
      })}
      {/* her side: wallpaper, a framed picture, a lamp */}
      <rect x={W.to} y={-600} width={1400} height={2000} fill="#e9d6e6" />
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={W.to + 40 + (i % 8) * 120 + (Math.floor(i / 8) % 2) * 60} cy={-40 + Math.floor(i / 8) * 150} r={9} fill="#d5b8d3" />)}
      <rect x={1240} y={300} width={180} height={140} fill="#f3e9d7" stroke="#8a5c3b" strokeWidth={12} />
      <path d="M1260 420 l50 -60 l40 40 l30 -30 l30 50Z" fill="#9fc0a8" />
      <rect x={1700} y={480} width={12} height={360} fill="#5a4a48" />
      <path d="M1660 480 h92 l-20 -70 h-52Z" fill="#f3d38a" stroke={INK} strokeWidth={4} />
      <rect x={W.to} y={SHOWER.floor} width={1400} height={600} fill="#a8865f" />
      <rect x={-900} y={SHOWER.floor} width={W.from + 900} height={600} fill="#e8eef0" />
      {/* the wall in section */}
      <rect x={W.from} y={-600} width={W.to - W.from} height={2200} fill="#c9b8a6" stroke={INK} strokeWidth={5} />
      {Array.from({ length: 30 }, (_, i) => <line key={i} x1={W.from} y1={-600 + i * 70} x2={W.to} y2={-560 + i * 70} stroke="#a8957f" strokeWidth={4} />)}
    </g>
  );
};

/** Her armchair. */
const Armchair: React.FC = () => {
  const C = SHOWER.chair;
  return (
    <g>
      <rect x={C.x - 70} y={C.top - 10} width={170} height={70} rx={20} fill="#8a6a7f" stroke={INK} strokeWidth={5} />
      <rect x={C.x + 60} y={C.top - 190} width={60} height={250} rx={24} fill="#8a6a7f" stroke={INK} strokeWidth={5} />
      <rect x={C.x - 80} y={C.top - 50} width={40} height={110} rx={16} fill="#7a5a6f" stroke={INK} strokeWidth={5} />
      <rect x={C.x - 60} y={C.top + 60} width={14} height={80} fill="#4a3a30" />
      <rect x={C.x + 90} y={C.top + 60} width={14} height={80} fill="#4a3a30" />
    </g>
  );
};

/** The steam: soft pale puffs rising on your side. */
const Steam: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    {Array.from({ length: 10 }, (_, i) => {
      const p = ((frame * 0.004 + noise(i)) % 1);
      return <circle key={i} cx={260 + noise(i + 5) * 560} cy={900 - p * 900} r={90 + noise(i + 2) * 70} fill="#ffffff" opacity={0.22 * Math.sin(p * Math.PI)} />;
    })}
  </g>
);

/** The grandmother: in her armchair (`sit`), or standing at the wall banging it with her back arm raised. */
export type GranState = { sit: number; fist: number; face: Face; hum: boolean };

export const ShowerStage: React.FC<{
  frame: number; cam: Camera; mood: MoodName; you: { face: Face; soap?: boolean; hum?: boolean }; gran: GranState;
  bangs: number[]; notes?: { from: number; to: number; dir: 1 | -1; color: string }[]; extra?: React.ReactNode;
}> = ({ frame, cam, mood, you, gran, bangs, notes = [], extra }) => {
  const jump = shake(frame, bangs);
  const Y = SHOWER.you;
  const body: Body = { ...Y, pose: { ...STAND, armF: you.soap ? [70, 40] : [20, 20], armB: [-10, 20] } };
  const soap = <rect x={-18} y={-14} width={36} height={24} rx={10} fill="#f2a0b0" stroke={INK} strokeWidth={3} />;
  // her standing body at the wall; the back arm aims at the wall, pulled back between bangs
  const standing: Body = { x: 1110, y: SHOWER.floor, scale: 1.1, facing: -1, pose: STAND };
  const pull = fistPull(frame, bangs);
  standing.pose = { ...STAND, armB: gran.fist > 0 ? aimArm(standing, { x: SHOWER.bang.x + pull, y: SHOWER.bang.y }) : STAND.armB, lean: -4 * gran.fist };
  const seated: Body = { x: SHOWER.chair.x, y: seatedY(SHOWER.chair.top, 1.1), scale: 1.1, facing: -1, pose: { ...SEATED, armF: [40, 60] } };
  const her = gran.sit > 0.5 ? seated : standing;
  const actors = (
    <>
      <Steam frame={frame} />
      <You body={body} face={{ ...you.face }} frame={frame} held={you.soap ? soap : undefined} band={false} />
      {/* the shower curtain, chest-high */}
      <path d={`M220 760 Q300 740 380 762 T540 760 T700 762 T860 758 V${SHOWER.floor + 40} H220Z`} fill="#7fc2c9" opacity={0.92} stroke={INK} strokeWidth={4} />
      {[300, 420, 540, 660, 780].map((x) => <line key={x} x1={x} y1={770} x2={x - 10} y2={SHOWER.floor} stroke="#5aa6ae" strokeWidth={5} />)}
      <Armchair />
      <Figure head={GRANDMOTHER.head} coat={GRANDMOTHER.coat} {...her} {...gran.face} blink={gran.hum ? true : blinking(frame, 6)} time={frame} />
      {/* the impact on your side of the wall */}
      {bangs.map((b) => frame >= b && frame < b + 8 ? (
        <g key={b} stroke={INK} strokeWidth={6} strokeLinecap="round">
          <line x1={880} y1={610} x2={840} y2={590} /><line x1={876} y1={640} x2={830} y2={642} /><line x1={880} y1={670} x2={842} y2={692} />
        </g>
      ) : null)}
      {notes.map((n, k) => <NoteStream key={k} frame={frame} {...n} />)}
      {extra}
    </>
  );
  return (
    <LookContext.Provider value={setLook([{ x: 1706, y: 440, r: 300, color: "#fff2cc", strength: 0.35, moods: [mood] }], mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<Back frame={frame} jump={jump} />} actors={actors} />
    </LookContext.Provider>
  );
};

/** A stream of notes from a mouth: rising and drifting toward `dir`, one every 9 frames between `from` and `to`. Yours
 *  start at your mouth and float right; hers start at her mouth and float left through the wall. */
const NoteStream: React.FC<{ frame: number; from: number; to: number; dir: 1 | -1; color: string }> = ({ frame, from, to, dir, color }) => {
  const start = dir === 1 ? { x: 615, y: 630 } : { x: 1075, y: 650 };
  return (
    <g>
      {Array.from({ length: Math.ceil((to - from) / 9) }, (_, i) => {
        const born = from + i * 9;
        const age = frame - born;
        if (age < 0 || age > 60) return null;
        const x = start.x + dir * age * (dir === 1 ? 6 : 9);
        const y = start.y - age * 2.2 + Math.sin(age / 5 + i) * 14;
        return <Note key={i} x={x} y={y} s={0.9} color={color} double={i % 3 === 1} opacity={Math.min(1, age / 6, (60 - age) / 10)} />;
      })}
    </g>
  );
};
