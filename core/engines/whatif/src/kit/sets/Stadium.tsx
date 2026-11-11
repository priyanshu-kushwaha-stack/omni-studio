// A cricket stadium from the stands: tiers of the crowd going back (heads, flags, arms up on a wave), the floodlights,
// the big screen (shapes, no words), the green field and the pitch far below, and the railing of your row in front.
// Built for the library from the gully cricket lane and the wedding hall (rows of heads), drawn for REF.
import { EXPRESSIONS } from "../rig/expressions";
import { STAND } from "../rig/pose";
import { CRIMSON, INK, MUSTARD, TEAL } from "../theme";
import { FRIEND, HERO, PASTELS } from "./cast";
import { Deep, LIGHTS_ON, lightsOn, noise, OUTSIDE, REF, seat, Sky, type SetDef, type SetProps } from "./common";

const FLOOR = 980;

export interface StadiumOptions {
  /** The crowd's wave rolls along the stands: its position 0 to 1 across the frame, or null for none. */
  wave: number | null;
  /** Flags waving in the crowd. */
  flags: boolean;
  /** What the big screen shows. */
  screen: "six" | "out" | "replay";
}

/** One tier of the crowd: heads in a row, arms up where the wave passes. */
const Tier: React.FC<{ y: number; r: number; gap: number; seed: number; frame: number; wave: number | null; flags: boolean }> = ({ y, r, gap, seed, frame, wave, flags }) => (
  <g>
    {Array.from({ length: Math.ceil(4000 / gap) }, (_, i) => {
      const x = -1100 + i * gap + (seed % 2) * gap * 0.5;
      const up = wave !== null && Math.abs(x - (-200 + wave * 2400)) < gap * 3;
      const bob = Math.sin(frame / 9 + i + seed) * 2;
      return (
        <g key={i} transform={`translate(${x} ${y + bob - (up ? r * 0.6 : 0)})`}>
          <rect x={-r * 0.8} y={r * 0.6} width={r * 1.6} height={r * 2.6} rx={r * 0.6} fill={["#1d9a8f", "#3d6fb0", CRIMSON, MUSTARD, "#f3e9d7"][(i + seed) % 5]} />
          <circle r={r} fill={PASTELS[(i * 3 + seed) % PASTELS.length]} />
          {up && <path d={`M${-r * 0.9} ${r} L${-r * 1.2} ${-r * 1.4} M${r * 0.9} ${r} L${r * 1.2} ${-r * 1.4}`} stroke={INK} strokeWidth={r * 0.3} strokeLinecap="round" />}
          {flags && noise(i * 7 + seed) > 0.86 && (
            <g transform={`translate(${r} ${-r}) rotate(${Math.sin(frame / 8 + i) * 10})`}>
              <line x1={0} y1={0} x2={0} y2={-r * 3} stroke={INK} strokeWidth={3} />
              <rect x={0} y={-r * 3} width={r * 2.2} height={r * 0.5} fill="#ff9933" />
              <rect x={0} y={-r * 2.5} width={r * 2.2} height={r * 0.5} fill="#ffffff" />
              <rect x={0} y={-r * 2} width={r * 2.2} height={r * 0.5} fill="#138808" />
            </g>
          )}
        </g>
      );
    })}
  </g>
);

const Back: React.FC<SetProps<StadiumOptions>> = ({ cam, mood, frame, options }) => {
  const on = lightsOn(mood) || OUTSIDE[mood].dark;
  return (
    <>
      <Deep cam={cam} depth={0.1} flat>
        <Sky id="stadium" mood={mood} x={-1400} y={-800} w={4800} h={1300} sunAt={{ x: 400, y: 160 }} />
        {[100, 1800].map((x) => (
          <g key={x}>
            <rect x={x - 10} y={60} width={20} height={400} fill="#4a5262" />
            <rect x={x - 90} y={20} width={180} height={90} rx={8} fill="#3b3e47" />
            {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={x - 66 + (i % 4) * 44} cy={44 + Math.floor(i / 4) * 40} r={14} fill={on ? "#fffbe0" : "#9aa1ab"} />)}
          </g>
        ))}
      </Deep>
      <Deep cam={cam} depth={0.25} flat>
        {/* the far stand and the big screen */}
        <path d="M-1400 420 Q960 300 3400 420 V700 H-1400Z" fill={OUTSIDE[mood].dark ? "#2a2f52" : "#8a94a0"} />
        <Tier y={420} r={8} gap={22} seed={1} frame={frame} wave={null} flags={false} />
        <rect x={760} y={170} width={400} height={220} rx={8} fill={INK} />
        <rect x={776} y={186} width={368} height={188} fill={options.screen === "out" ? "#d8344f" : "#2f3550"} />
        {options.screen === "six" && <path d="M860 330 Q960 140 1060 330" fill="none" stroke={MUSTARD} strokeWidth={10} strokeDasharray="20 12" />}
        {options.screen === "six" && <circle cx={1060} cy={250} r={14} fill={CRIMSON} />}
        {options.screen === "out" && [0, 1, 2].map((k) => <rect key={k} x={900 + k * 40} y={230} width={14} height={110} fill="#f3e9d7" transform={`rotate(${(k - 1) * 18} ${907 + k * 40} 340)`} />)}
        {options.screen === "replay" && <path d="M930 240 L1010 280 L930 320Z" fill="#f3e9d7" />}
      </Deep>
      <Deep cam={cam} depth={0.4} flat>
        {/* the field far below and the pitch */}
        <ellipse cx={960} cy={720} rx={1900} ry={200} fill="#4c9a5a" />
        <ellipse cx={960} cy={720} rx={1500} ry={150} fill="none" stroke="#f3e9d7" strokeWidth={5} opacity={0.7} />
        <rect x={900} y={690} width={120} height={60} fill="#d9c896" />
      </Deep>
      <Deep cam={cam} depth={0.65}><Tier y={780} r={20} gap={58} seed={2} frame={frame} wave={options.wave} flags={options.flags} /></Deep>
      <Deep cam={cam} depth={0.82}><Tier y={860} r={28} gap={82} seed={3} frame={frame} wave={options.wave} flags={options.flags} /></Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={FLOOR - 60} width={4800} height={800} fill="#8a94a0" />
        <rect x={-1400} y={FLOOR - 60} width={4800} height={16} fill="#6b7280" />
      </Deep>
    </>
  );
};

/** Your row's railing, near and soft, in team colours. */
const Front: React.FC<SetProps<StadiumOptions>> = ({ cam }) => (
  <Deep cam={cam} depth={1.2}>
    <rect x={-1400} y={980} width={4800} height={18} rx={9} fill={TEAL} stroke={INK} strokeWidth={4} />
    {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-1300 + i * 160} y={990} width={10} height={300} fill={TEAL} />)}
  </Deep>
);

export const stadium: SetDef<StadiumOptions> = {
  name: "stadium",
  about: "cricket stadium from the stands: tiers of crowd with flags and a wave, floodlights, big screen, the field below",
  spots: {
    seat: { x: 760, y: FLOOR, scale: 1.2, facing: 1 },
    neighbour: { x: 1080, y: FLOOR, scale: 1.2, facing: -1 },
    aisle: { x: 1600, y: FLOOR, scale: 1.2, facing: -1 },
  },
  cameras: {
    wide: REF,
    screen: { x: 960, y: 280, zoom: 2.2 },
    twoShot: { x: 920, y: 640, zoom: 1.5 },
  },
  lights: () => [
    { x: 100, y: 64, depth: 0.1, r: 700, color: "#fffbe0", strength: 0.3, moods: LIGHTS_ON },
    { x: 1800, y: 64, depth: 0.1, r: 700, color: "#fffbe0", strength: 0.3, moods: LIGHTS_ON },
  ],
  defaults: { wave: 0.35, flags: true, screen: "six" },
  Back,
  Front,
  example: {
    camera: "wide",
    cast: [
      { spot: "seat", who: { ...HERO, flow: 0.4, look: { x: 0.6, y: -0.4 } }, face: EXPRESSIONS.shocked, pose: { ...STAND, armF: [60, 100], armB: [-160, -10] } },
      { spot: "neighbour", who: { ...FRIEND, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.happy },
    ],
  },
};
