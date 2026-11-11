// Sets and props for the sixty-seconds first cut, drawn as flat paper-cut layers (style.md, Look). World units match
// the screen at the default camera {960, 540, 1}; floors sit near y 980 so figures at scale 1.3-1.5 stand in frame.
import { Layer, type Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { noise } from "./shared";

export const FLOOR = 990;

// ---------- props ----------

/** A cutting-chai glass, upright at (x, y) = its base centre. `k` scales it. */
export const Glass: React.FC<{ x: number; y: number; k?: number; tilt?: number }> = ({ x, y, k = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${k})`}>
    <path d="M-17 -44 L17 -44 L13 0 L-13 0 Z" fill="#f6efe2" opacity={0.6} stroke="#fff8ea" strokeWidth={2} />
    <path d="M-16 -36 L16 -36 L13 -1 L-13 -1 Z" fill="#c9823f" />
    <path d="M-16 -36 L16 -36 L15.5 -32 L-15.5 -32 Z" fill="#e7b277" />
  </g>
);
export const Saucer: React.FC<{ x: number; y: number; k?: number }> = ({ x, y, k = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <ellipse rx={34} ry={8} fill="#cfd6dc" stroke={INK} strokeWidth={3} />
  </g>
);
/** Shards and a splash on a floor or counter at (x, y). */
export const Smash: React.FC<{ x: number; y: number; k?: number; chai?: boolean }> = ({ x, y, k = 1, chai = true }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    {chai && <path d="M-80 4 Q-30 -14 20 -6 Q70 -14 100 4 Q60 14 0 12 Q-50 16 -80 4Z" fill="#c9823f" opacity={0.85} />}
    <path d="M-40 -2 L-26 -34 L-14 -4Z" fill="#f6efe2" />
    <path d="M-4 -2 L8 -42 L20 -18 L30 -40 L36 -2Z" fill="#f6efe2" />
    <path d="M52 -2 L66 -26 L76 -2Z" fill="#f6efe2" />
    {[[-70, -20], [88, -24], [40, -50]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={5} fill="#c9823f" />)}
  </g>
);
/** A phone in a hand-sized frame, screen content passed as children (drawn in a 60x110 box). */
export const Phone: React.FC<{ x: number; y: number; k?: number; children?: React.ReactNode }> = ({ x, y, k = 1, children }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <rect x={-34} y={-62} width={68} height={124} rx={10} fill={INK} />
    <rect x={-29} y={-55} width={58} height={110} rx={5} fill="#eaf4f7" />
    <g transform="translate(0 0)">{children}</g>
  </g>
);
export const Dots: React.FC<{ frame: number; x?: number; y?: number; k?: number }> = ({ frame, x = 0, y = 0, k = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <rect x={-26} y={-12} width={52} height={24} rx={12} fill="#d4dde2" />
    {[0, 1, 2].map((i) => <circle key={i} cx={-12 + i * 12} cy={0} r={4.5} fill="#56606a" opacity={0.4 + 0.6 * ((Math.floor(frame / 6) + i) % 3 === 0 ? 1 : 0)} />)}
  </g>
);
export const Bus: React.FC<{ x: number; y: number; k?: number; doors?: number }> = ({ x, y, k = 1, doors = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <path d="M24 -260 Q0 -260 0 -225 V0 H640 V-260Z" fill="#cf5b3a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={0} y={-110} width={640} height={20} fill={PAPER} />
    {[110, 220, 330, 440, 550].map((w) => <rect key={w} x={w} y={-232} width={86} height={74} rx={8} fill="#bfe6ee" stroke={INK} strokeWidth={5} />)}
    <rect x={14 + doors * 0} y={-232} width={80} height={226} rx={6} fill={doors > 0.5 ? "#2a2f3a" : "#bfe6ee"} stroke={INK} strokeWidth={5} />
    <circle cx={10} cy={-40} r={13} fill="#fff1b8" stroke={INK} strokeWidth={4} />
    {[120, 520].map((w) => <circle key={w} cx={w} cy={6} r={32} fill={INK} />)}
  </g>
);
/** A wall TV showing a cricket pitch; `ball` 0..1 runs the delivery; `six` lifts the ball out. */
export const TV: React.FC<{ x: number; y: number; k?: number; ball?: number; six?: number }> = ({ x, y, k = 1, ball = 0, six = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <rect x={-210} y={-130} width={420} height={260} rx={10} fill={INK} />
    <rect x={-196} y={-116} width={392} height={232} fill="#5aa86a" />
    <rect x={-30} y={-116} width={60} height={232} fill="#d9c896" />
    <rect x={-10} y={-90} width={20} height={14} fill={PAPER} /><rect x={-10} y={76} width={20} height={14} fill={PAPER} />
    <circle cx={0 + six * 150} cy={-80 + ball * 150 - six * 200} r={7} fill={CRIMSON} />
  </g>
);
export const Laptop: React.FC<{ x: number; y: number; k?: number; children?: React.ReactNode }> = ({ x, y, k = 1, children }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <rect x={-170} y={-230} width={340} height={220} rx={10} fill={INK} />
    <rect x={-158} y={-218} width={316} height={196} rx={4} fill="#eef1f5" />
    <path d="M-210 0 H210 L190 -12 H-190Z" fill="#3a3f4c" />
    <g transform="translate(0 -120)">{children}</g>
  </g>
);
export const Coin: React.FC<{ x: number; y: number; k?: number; spin?: number }> = ({ x, y, k = 1, spin = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${k * Math.max(0.15, Math.abs(Math.cos(spin)))} ${k})`}>
    <circle r={20} fill="#ffd54a" stroke={INK} strokeWidth={4} />
  </g>
);
export const Card: React.FC<{ x: number; y: number; up?: boolean; r?: number }> = ({ x, y, up = false, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect x={-22} y={-32} width={44} height={64} rx={5} fill={up ? PAPER : "#3d6fb0"} stroke={INK} strokeWidth={3} />
    {up && <circle r={8} fill={CRIMSON} />}
  </g>
);
export const Pan: React.FC<{ x: number; y: number; tip?: number }> = ({ x, y, tip = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${-tip * 70})`}>
    <path d="M-70 -40 H70 V-6 Q70 0 64 0 H-64 Q-70 0 -70 -6Z" fill="#5c626b" stroke={INK} strokeWidth={4} />
    <rect x={-66} y={-46} width={132} height={10} fill="#c9823f" />
    <rect x={70} y={-30} width={110} height={12} rx={6} fill={INK} />
  </g>
);

// ---------- sets ----------

/** The night street outside college: the chai stall at right, the bus stop across the road. */
export const StreetNight: React.FC<{ cam: Camera; lit?: boolean }> = ({ cam, lit = true }) => (
  <>
    <Layer cam={cam} depth={0.3} flat>
      <rect x={-1200} y={-600} width={4400} height={2400} fill="#141826" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={-900 + i * 330} y={380 - noise(i) * 200} width={290} height={600} fill="#1d2234" />
      ))}
      {Array.from({ length: 40 }, (_, i) => (
        <rect key={i} x={-860 + (i % 12) * 330 + (i % 3) * 80} y={420 - noise(i % 12) * 200 + Math.floor(i / 12) * 90} width={40} height={30}
          fill={noise(i * 3) > 0.6 ? "#f2c66a" : "#262c40"} opacity={0.8} />
      ))}
    </Layer>
    <Layer cam={cam} depth={0.7}>
      <rect x={-1200} y={700} width={4400} height={150} fill="#2b2f3a" />
      {Array.from({ length: 20 }, (_, i) => <rect key={i} x={-1100 + i * 220} y={772} width={110} height={8} fill={PAPER} opacity={0.5} />)}
      {/* the bus stop across the road */}
      <rect x={-260} y={520} width={12} height={180} fill="#596173" />
      <rect x={-300} y={500} width={260} height={24} fill="#596173" />
      <rect x={-280} y={540} width={90} height={60} fill="#6b8aa0" opacity={0.6} />
    </Layer>
    <Layer cam={cam} depth={1}>
      <rect x={-1200} y={850} width={4400} height={600} fill="#3a3530" />
      {/* the chai stall */}
      <rect x={980} y={560} width={760} height={440} fill="#5a3b2a" />
      <rect x={960} y={540} width={800} height={40} fill="#7a5038" />
      <rect x={940} y={830} width={840} height={30} rx={6} fill="#8a5d40" />
      <path d="M1600 760 Q1600 690 1660 690 Q1720 690 1720 760Z" fill="#9aa3ad" />
      <rect x={1700} y={700} width={50} height={10} fill="#9aa3ad" />
      {lit && <circle cx={1250} cy={600} r={150} fill={MUSTARD} opacity={0.18} />}
      <circle cx={1250} cy={588} r={18} fill="#fff1c8" />
    </Layer>
  </>
);

/** The college canteen, afternoon: a wall TV, a long bench, tiled wall. */
export const Canteen: React.FC<{ cam: Camera }> = ({ cam }) => (
  <>
    <Layer cam={cam} depth={0.6}>
      <rect x={-1200} y={-600} width={4400} height={2400} fill="#e8dcc0" />
      {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-1000 + i * 150} y={620} width={146} height={300} fill={i % 2 ? "#cfe0d6" : "#d9e8df"} />)}
      <rect x={1300} y={160} width={300} height={220} rx={8} fill="#b8d4e6" stroke="#8a7a60" strokeWidth={10} />
    </Layer>
    <Layer cam={cam} depth={1}>
      <rect x={-1200} y={920} width={4400} height={600} fill="#bfae8c" />
      <rect x={100} y={860} width={1200} height={30} rx={6} fill="#8a5d40" />
      {[140, 1240].map((x) => <rect key={x} x={x} y={890} width={20} height={80} fill="#6a4630" />)}
    </Layer>
  </>
);

/** Your room at night: a desk, a lamp, a window. */
export const Bedroom: React.FC<{ cam: Camera }> = ({ cam }) => (
  <>
    <Layer cam={cam} depth={0.6}>
      <rect x={-1200} y={-600} width={4400} height={2400} fill="#262a44" />
      <rect x={1250} y={180} width={360} height={300} fill="#141a30" stroke="#3a4060" strokeWidth={12} />
      <circle cx={1500} cy={260} r={30} fill="#f3e9d7" opacity={0.7} />
    </Layer>
    <Layer cam={cam} depth={1}>
      <rect x={-1200} y={940} width={4400} height={600} fill="#3a2f38" />
      <rect x={500} y={780} width={900} height={30} rx={6} fill="#8a5d40" />
      <rect x={540} y={810} width={20} height={160} fill="#6a4630" /><rect x={1340} y={810} width={20} height={160} fill="#6a4630" />
      <circle cx={600} cy={600} r={160} fill={MUSTARD} opacity={0.15} />
      <path d="M560 780 L600 640 L640 780Z" fill="#2f3340" /><path d="M560 640 H640 L620 600 H580Z" fill={MUSTARD} />
    </Layer>
  </>
);

/** The metro platform, side-on: tunnel, platform edge, pillars. `train` draws a train at the platform (0 gone, 1 in). */
export const Platform: React.FC<{ cam: Camera; train?: number; doors?: number }> = ({ cam, train = 0, doors = 0 }) => (
  <>
    <Layer cam={cam} depth={0.5}>
      <rect x={-1500} y={-600} width={5000} height={2400} fill="#d7d0c2" />
      <rect x={-1500} y={180} width={5000} height={40} fill="#3d6fb0" />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-1300 + i * 520} y={260} width={180} height={90} rx={6} fill="#efe9dc" stroke="#9a9384" strokeWidth={6} />)}
    </Layer>
    <Layer cam={cam} depth={0.85}>
      <rect x={-1500} y={420} width={5000} height={380} fill="#2c2f38" />
      {train > 0 && (
        <g transform={`translate(${(1 - train) * 3200} 0)`}>
          <rect x={-1500} y={430} width={5000} height={360} rx={30} fill="#e6e8ec" />
          <rect x={-1500} y={700} width={5000} height={26} fill="#3d6fb0" />
          {Array.from({ length: 12 }, (_, i) => (
            <g key={i}>
              <rect x={-1400 + i * 420} y={480} width={180} height={150} rx={10} fill="#9fc1d6" />
              <rect x={-1180 + i * 420 - doors * 40} y={470} width={80} height={320} fill={doors > 0.5 ? "#3a3f4c" : "#cfd4da"} stroke="#8a909a" strokeWidth={4} />
              <rect x={-1100 + i * 420 + doors * 40} y={470} width={80} height={320} fill={doors > 0.5 ? "#3a3f4c" : "#cfd4da"} stroke="#8a909a" strokeWidth={4} />
            </g>
          ))}
        </g>
      )}
    </Layer>
    <Layer cam={cam} depth={1}>
      <rect x={-1500} y={800} width={5000} height={30} fill={MUSTARD} />
      <rect x={-1500} y={830} width={5000} height={700} fill="#bdb5a6" />
      {[-700, 300, 1300, 2300].map((x) => <rect key={x} x={x} y={-200} width={70} height={1030} fill="#a39c8d" />)}
    </Layer>
  </>
);

/** Inside a metro carriage: the dark window, the grab pole, the seats. `tunnel` shifts the tunnel lights. */
export const Carriage: React.FC<{ cam: Camera; tunnel?: number; day?: boolean }> = ({ cam, tunnel = 0, day = false }) => (
  <>
    <Layer cam={cam} depth={0.4} flat>
      <rect x={-1500} y={-600} width={5000} height={2400} fill={day ? "#a9c8d8" : "#10131c"} />
      {!day && Array.from({ length: 14 }, (_, i) => <rect key={i} x={((i * 400 - tunnel * 30) % 5600) - 1500} y={380} width={60} height={14} fill="#f2c66a" opacity={0.7} />)}
      {day && Array.from({ length: 10 }, (_, i) => <rect key={i} x={((i * 520 - tunnel * 12) % 5200) - 1500} y={300 + noise(i) * 120} width={300} height={500} fill="#8fb0c2" />)}
    </Layer>
    <Layer cam={cam} depth={1}>
      <rect x={-1500} y={-600} width={5000} height={720} fill="#e6e8ec" />
      <rect x={-1500} y={700} width={5000} height={900} fill="#e6e8ec" />
      <rect x={-1500} y={680} width={5000} height={24} fill="#3d6fb0" />
      <rect x={-1500} y={120} width={5000} height={14} fill="#c5cad2" />
      {[-200, 1200].map((x) => <rect key={x} x={x} y={120} width={18} height={900} fill="#b8bec7" />)}
      <rect x={-1500} y={860} width={5000} height={130} fill="#5d7fa8" />
      <rect x={-1500} y={990} width={5000} height={600} fill="#9a9fa8" />
    </Layer>
  </>
);

/** Grandfather's room: a cane chair, a radio, the wedding photo. */
export const GrandpaRoom: React.FC<{ cam: Camera }> = ({ cam }) => (
  <>
    <Layer cam={cam} depth={0.6}>
      <rect x={-1200} y={-600} width={4400} height={2400} fill="#e3c9a0" />
      <rect x={-1200} y={700} width={4400} height={20} fill="#c9a87a" />
      <rect x={1180} y={240} width={220} height={170} fill="#a07a50" />
      <rect x={1196} y={256} width={188} height={138} fill="#f3e9d7" />
      <circle cx={1260} cy={320} r={22} fill="#e0a070" /><circle cx={1320} cy={320} r={22} fill="#a9c9a4" />
      <rect x={300} y={360} width={240} height={240} fill="#c9e2ec" stroke="#a07a50" strokeWidth={14} />
    </Layer>
    <Layer cam={cam} depth={1}>
      <rect x={-1200} y={960} width={4400} height={600} fill="#b98f62" />
      <rect x={1460} y={720} width={180} height={110} rx={10} fill="#7a5038" /><circle cx={1510} cy={775} r={28} fill="#3a2f28" />
      <rect x={1440} y={830} width={220} height={140} fill="#8a5d40" />
    </Layer>
  </>
);

/** Home: the kitchen (stove at left) running into the dinner table (right). */
export const Home: React.FC<{ cam: Camera; table?: boolean }> = ({ cam, table = true }) => (
  <>
    <Layer cam={cam} depth={0.6}>
      <rect x={-1200} y={-600} width={4400} height={2400} fill="#c8d6c0" />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-200 + i * 90} y={420} width={86} height={86} fill={i % 2 ? "#e9efe4" : "#dfe8d8"} />)}
      <rect x={1500} y={200} width={300} height={260} fill="#2a3048" stroke="#7a6a50" strokeWidth={12} />
    </Layer>
    <Layer cam={cam} depth={1}>
      <rect x={-1200} y={960} width={4400} height={600} fill="#a88a6a" />
      <rect x={-200} y={720} width={900} height={250} fill="#d9d2c4" />
      <rect x={-200} y={700} width={900} height={24} fill="#8a8a8a" />
      <rect x={120} y={690} width={140} height={14} fill={INK} />
      {table && (
        <g>
          <rect x={900} y={780} width={900} height={26} rx={6} fill="#8a5d40" />
          <rect x={940} y={806} width={20} height={160} fill="#6a4630" /><rect x={1740} y={806} width={20} height={160} fill="#6a4630" />
          {[1000, 1250, 1500, 1700].map((x) => <ellipse key={x} cx={x} cy={776} rx={48} ry={10} fill="#eef1f5" stroke={INK} strokeWidth={3} />)}
        </g>
      )}
    </Layer>
  </>
);

/** The office Diwali party: string lights and a card table. */
export const Party: React.FC<{ cam: Camera; frame: number }> = ({ cam, frame }) => (
  <>
    <Layer cam={cam} depth={0.6}>
      <rect x={-1200} y={-600} width={4400} height={2400} fill="#2e2a44" />
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={i} cx={-800 + i * 100} cy={150 + Math.sin(i * 0.6) * 40} r={9} fill={[MUSTARD, CRIMSON, "#7fc29b"][i % 3]}
          opacity={0.6 + 0.4 * Math.sin(frame * 0.2 + i)} />
      ))}
    </Layer>
    <Layer cam={cam} depth={1}>
      <rect x={-1200} y={960} width={4400} height={600} fill="#4a3a3a" />
      <ellipse cx={960} cy={830} rx={520} ry={70} fill="#2f6b4a" stroke="#5a3b2a" strokeWidth={16} />
      <rect x={940} y={860} width={40} height={110} fill="#5a3b2a" />
    </Layer>
  </>
);

/** A paper diagram panel in screen space: cream card, ink drawing, appears on `p` (0..1). */
export const Diagram: React.FC<{ x: number; y: number; w: number; h: number; p: number; children: React.ReactNode }> = ({ x, y, w, h, p, children }) => (
  <g transform={`translate(${x} ${y + (1 - p) * 30})`} opacity={p}>
    <rect width={w} height={h} rx={14} fill={PAPER} stroke="#c9b893" strokeWidth={4} />
    {children}
  </g>
);
