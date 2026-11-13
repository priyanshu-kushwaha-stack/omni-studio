// Pieces for "One Mind" (OneMind.tsx): the brother's laptop side on (the lid opens), the laptop's screen (strangers'
// pages: the same face a hundred ways, the same tune into a hundred phones, and at the end the same machine), the
// computers sheet (2020's home computers linked into one), the leaflet's one-brain diagram, and the machine the pages
// make. World coordinates; children of a <Stage> slot. No sound here.
import { Figure } from "@whatif/kit/rig/Figure";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { Band, Jar, StampTag } from "../parts";
import { BROTHER, GHOST, HERO, mix, noise, PASTELS, ramp } from "../shared";
import { CrumbPage, StrangerFace, Tune } from "./Contract.Kit";

/** The brother's laptop side on, its hinge at (x, y); `open` 0..1 lifts the lid; the screen faces +x when facing 1. */
export const SideLaptop: React.FC<{ x: number; y: number; open: number; scale?: number; facing?: 1 | -1; glow?: number }> = ({
  x, y, open, scale = 1, facing = 1, glow = 1 }) => {
  const a = mix(-178, -100, open);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
      <rect x={0} y={-12} width={200} height={14} rx={4} fill="#3a3f4c" stroke={INK} strokeWidth={4} />
      <g transform={`rotate(${a})`}>
        <rect x={0} y={-8} width={196} height={12} rx={4} fill="#2a2d36" stroke={INK} strokeWidth={4} />
        {open > 0.3 && <rect x={10} y={2} width={176} height={4} fill="#cfefff" opacity={glow * (open - 0.3) / 0.7} />}
      </g>
      {open > 0.3 && <polygon points={`20,-30 260,-260 300,0`} fill="#cfefff" opacity={0.08 * glow * open} />}
    </g>
  );
};

/** The machine both drawings make: a housing, a frame, three gears, a funnel and a pipe. Lines that draw themselves
 *  from `at` over `span` frames. (x, y) is its centre, `s` its scale. */
export const Machine: React.FC<{ x: number; y: number; s?: number; at: number; span: number; color?: string; width?: number }> = ({
  x, y, s = 1, at, span, color = "#2b4a8a", width = 6 }) => {
  const parts = [
    "M-380 -200 H380 Q420 -200 420 -160 V200 Q420 240 380 240 H-380 Q-420 240 -420 200 V-160 Q-420 -200 -380 -200Z",
    "M-420 240 L-470 330 M420 240 L470 330 M-470 330 H470 M-300 240 V330 M300 240 V330",
    "M-290 20 a90 90 0 1 0 180 0 a90 90 0 1 0 -180 0",
    "M0 -40 a60 60 0 1 0 120 0 a60 60 0 1 0 -120 0",
    "M140 90 a110 110 0 1 0 220 0 a110 110 0 1 0 -220 0",
    "M-200 20 L60 -40 L250 90",
    "M-60 -200 L-130 -330 H130 L60 -200",
    "M420 0 H530 V-160 H620",
    "M-420 -60 H-520 V120 H-600",
  ];
  const step = span / parts.length;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {parts.map((d, i) => <DrawLine key={i} d={d} from={Math.round(at + i * step * 0.8)} to={Math.round(at + i * step * 0.8 + step * 1.6)}
        color={color} width={width} />)}
    </g>
  );
};

/** The pages of crumbs on the bed, top down: scattered, then sliding edge to edge (`join` 0..1) into a 3 x 2 sheet. */
export const PagesTop: React.FC<{ x: number; y: number; join: number; shade?: number }> = ({ x, y, join, shade = 0 }) => {
  const W = 300, H = 400;
  const scattered = [[-420, -250, -14], [40, -300, 10], [420, -200, -6], [-380, 230, 8], [10, 260, -10], [440, 270, 12]];
  return (
    <g transform={`translate(${x} ${y})`}>
      {scattered.map(([sx, sy, st], i) => {
        const gx = (i % 3 - 1) * W, gy = (Math.floor(i / 3) - 0.5) * H;
        const t = ramp(join, i * 0.06, 0.62 + i * 0.06);
        return <CrumbPage key={i} x={mix(sx, gx, t)} y={mix(sy, gy, t)} tilt={mix(st, 0, t)} kind={i} w={W} h={H} shade={shade} />;
      })}
    </g>
  );
};

/** One stranger's post on the laptop: a card with a pastel dot and grey bars, and the crumb they posted (a face drawn
 *  their way, or a phone humming the tune). */
const Post: React.FC<{ x: number; y: number; i: number }> = ({ x, y, i }) => {
  const face = i % 3 !== 2;
  const c = PASTELS[i % PASTELS.length];
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-130} y={-110} width={260} height={220} rx={12} fill="#ffffff" stroke="#c8ced8" strokeWidth={3} />
      <circle cx={-104} cy={-86} r={13} fill={c} />
      <rect x={-84} y={-92} width={80 + noise(i) * 60} height={10} rx={5} fill="#b9c0cc" />
      {face ? (
        <StrangerFace x={0} y={16} s={0.9 + noise(i + 7) * 0.3} color={["#3a4a6a", "#7a3b2e", "#1f5c63", INK, "#6a3a7a"][i % 5]} hand={i % 2}
          fill={i % 4 === 0 ? c : undefined} />
      ) : (
        <g>
          <rect x={-64} y={-50} width={50} height={92} rx={8} fill="#1b1d24" />
          <rect x={-58} y={-42} width={38} height={72} rx={4} fill="#cfe9f4" />
          <Tune x={40} y={0} s={0.8} color={INK} />
        </g>
      )}
    </g>
  );
};

/** The laptop's screen, filling the frame: the strangers' page, scrolling; `machine` 0..1 slides the posts together
 *  into the machine drawing (its lines draw from `machineAt`). */
export const LaptopScreen: React.FC<{ frame: number; scroll: number; machine: number; machineAt: number; hand?: { x: number; stop: number } }> = ({
  frame, scroll, machine, machineAt, hand }) => {
  const cols = 6, rows = 5;
  return (
    <g>
      <rect x={-200} y={-200} width={2320} height={1480} fill="#1b1d24" />
      <rect x={70} y={40} width={1780} height={960} rx={16} fill="#eef1f5" />
      <clipPath id="onemind-screen"><rect x={70} y={40} width={1780} height={960} rx={16} /></clipPath>
      <g clipPath="url(#onemind-screen)">
        <rect x={70} y={40} width={1780} height={70} fill="#d9dee6" />
        <rect x={110} y={64} width={420} height={22} rx={11} fill="#ffffff" />
        {Array.from({ length: cols * rows }, (_, i) => {
          const c = i % cols, r = Math.floor(i / cols);
          const gx = 250 + c * 290, gy = 250 + r * 240 - scroll;
          const tx = 960 + (c - 2.5) * 200, ty = 560 + (r - 2) * 150;
          const t = ramp(machine, (noise(i + 3) * 0.3), 0.7 + noise(i + 3) * 0.3);
          return (
            <g key={i} transform={`translate(${mix(gx, tx, t)} ${mix(gy, ty, t)}) scale(${mix(1, 0.75, t)})`} opacity={1 - 0.55 * t}>
              <Post x={0} y={0} i={i} />
            </g>
          );
        })}
        {machine > 0 && <Machine x={960} y={560} s={0.95} at={machineAt} span={50} color="#1d3f86" width={9} />}
      </g>
      {hand && (
        <g>
          <rect x={-200} y={1010} width={2320} height={300} fill="#2a2d36" />
          {Array.from({ length: 14 }, (_, i) => <rect key={i} x={140 + i * 120} y={1030} width={104} height={40} rx={6} fill="#3a3f4c" />)}
          <circle cx={hand.x + (frame < hand.stop ? Math.sin(frame * 1.9) * 10 : 0)} cy={1040 - (frame < hand.stop ? Math.abs(Math.sin(frame * 1.3)) * 12 : 0)}
            r={46} fill={BROTHER.head} stroke={INK} strokeWidth={4} />
          <path d={`M${hand.x + 30} 1060 Q${hand.x + 160} 1120 ${hand.x + 300} 1300`} fill="none" stroke="#5d6470" strokeWidth={56} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

/** A home computer of the 2000s: a beige monitor and a tower. (x, y) is the monitor's base centre. */
const HomeComputer: React.FC<{ x: number; y: number; on: number }> = ({ x, y, on }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-46} y={-78} width={92} height={70} rx={8} fill="#d8cfb8" stroke={INK} strokeWidth={3} />
    <rect x={-36} y={-70} width={72} height={52} rx={4} fill={on > 0 ? "#bff6ef" : "#3a3f4c"} opacity={on > 0 ? 0.5 + 0.5 * on : 1} />
    {on > 0 && [0, 1, 2].map((i) => <rect key={i} x={-28} y={-62 + i * 14} width={30 + ((i * 17) % 26)} height={6} rx={3} fill={TEAL} opacity={0.7} />)}
    <rect x={-14} y={-8} width={28} height={8} fill="#c4bba3" stroke={INK} strokeWidth={2} />
    <rect x={54} y={-70} width={30} height={70} rx={4} fill="#d8cfb8" stroke={INK} strokeWidth={3} />
    <circle cx={69} cy={-16} r={4} fill={on > 0 ? "#7ff0a0" : "#556"} />
  </g>
);

/** The computers sheet: twelve home computers come on one by one, then dotted threads link them into one. */
export const ComputersSheet: React.FC<{ frame: number; on: [number, number]; link: [number, number] }> = ({ frame, on, link }) => {
  const pts = Array.from({ length: 12 }, (_, i) => ({ x: 220 + (i % 4) * 260 + (Math.floor(i / 4) % 2) * 60, y: 230 + Math.floor(i / 4) * 210 }));
  const hub = { x: 640, y: 410 };
  return (
    <g>
      {pts.map((p, i) => {
        const tOn = ramp(frame, on[0] + i * ((on[1] - on[0]) / 12), on[0] + (i + 1) * ((on[1] - on[0]) / 12));
        return <HomeComputer key={i} x={p.x} y={p.y} on={tOn} />;
      })}
      {pts.map((p, i) => {
        const a = Math.round(link[0] + i * ((link[1] - link[0]) / 14));
        return <DrawLine key={`l${i}`} d={`M${p.x} ${p.y - 40} Q${(p.x + hub.x) / 2} ${hub.y - 120} ${hub.x} ${hub.y}`} from={a} to={a + 12} color={GHOST.light} width={5} dash />;
      })}
      {frame >= link[1] - 6 && <circle cx={hub.x} cy={hub.y} r={22 + 4 * Math.sin(frame / 5)} fill={GHOST.light} opacity={0.8} />}
    </g>
  );
};

/** The leaflet's page one, remembered: one head, one band, one jar; then (`many` 0..1) heads all round it on threads. */
export const LeafletOne: React.FC<{ frame: number; stamps: [number, number, number]; many: number }> = ({ frame, stamps, many }) => (
  <g>
    {Array.from({ length: 14 }, (_, i) => {
      const t = ramp(many, i / 18, i / 18 + 0.3);
      if (t <= 0) return null;
      const a = (i / 14) * Math.PI * 2 + 0.3;
      const x = 640 + Math.cos(a) * mix(120, 470, t), y = 400 + Math.sin(a) * mix(80, 300, t);
      return (
        <g key={i} opacity={t}>
          <line x1={500} y1={330} x2={x} y2={y} stroke={GHOST.light} strokeWidth={4} strokeDasharray="2 10" strokeLinecap="round" />
          <circle cx={x} cy={y} r={30} fill={PASTELS[i % PASTELS.length]} stroke={INK} strokeWidth={3} />
          <path d={`M${x - 24} ${y - 12} Q${x} ${y - 22} ${x + 24} ${y - 12}`} fill="none" stroke="#1b1d24" strokeWidth={5} />
          <circle cx={x + 14} cy={y - 16} r={4} fill={GHOST.light} />
        </g>
      );
    })}
    <g transform="translate(500 400) scale(1.4)">
      <Figure x={0} y={160} pose={{ lean: 0, tilt: 0, armB: [-7, 8], armF: [9, 10], legB: [-5, -2], legF: [6, -3], drop: 0 }} head={HERO.head} scarf={HERO.scarf} tuft
        blink mouth="smile" />
      <path d="M-40 -26 Q2 -36 44 -24" fill="none" stroke="#1b1d24" strokeWidth={9} strokeLinecap="round" />
      <circle cx={30} cy={-29} r={8} fill={GHOST.light} stroke="#1b1d24" strokeWidth={3} />
    </g>
    <Band x={840} y={260} scale={1.2} />
    <Jar x={880} y={560} w={120} h={150} fill={0.5} />
    <StampTag frame={frame} at={stamps[0]} x={400} y={640} text="BRAIN" size={46} tilt={-6} />
    <StampTag frame={frame} at={stamps[1]} x={760} y={170} text="BAND" size={46} tilt={5} />
    <StampTag frame={frame} at={stamps[2]} x={1010} y={640} text="JAR" size={46} tilt={-3} />
  </g>
);

/** Music notes drifting up from a mouth: the tune (the same three notes for both of you). `t` 0..1 through the hum. */
export const HumNotes: React.FC<{ x: number; y: number; t: number; dir: 1 | -1; color: string }> = ({ x, y, t, dir, color }) => {
  if (t <= 0 || t >= 1) return null;
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const p = (t * 1.6 - i * 0.25);
        if (p <= 0 || p >= 1) return null;
        const nx = x + dir * (40 + p * 160), ny = y - 20 - p * 140 + Math.sin(p * 6 + i) * 10;
        return (
          <g key={i} transform={`translate(${nx} ${ny}) scale(${1.4})`} opacity={Math.min(1, (1 - p) * 3)} fill={color} stroke={color} strokeWidth={3}>
            <ellipse cx={0} cy={[8, -4, 4][i]} rx={8} ry={6} />
            <line x1={7} y1={[8, -4, 4][i]} x2={7} y2={[8, -4, 4][i] - 32} strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
};

/** The blanket, top down, for the bed inserts. */
export const BedTop: React.FC = () => (
  <g>
    <rect x={-1400} y={-900} width={4800} height={2900} fill="#3e5c8f" />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M-1400 ${-600 + i * 230} Q480 ${-560 + i * 230} 3400 ${-640 + i * 230}`} fill="none" stroke="#2f4a78"
      strokeWidth={12} opacity={0.6} />)}
    <rect x={-1400} y={-900} width={4800} height={260} fill={PAPER} opacity={0.9} />
  </g>
);

export { MUSTARD };
