import { FONT } from "@whatif/kit/fonts";
import { Layer, type Camera } from "@whatif/kit/stage/Stage";
import { HEIGHT, INK, PAPER, WIDTH } from "@whatif/kit/theme";
import { noise } from "../shared";

/** Your bedroom at night (Beat 4): a bed on the left, a big window on the right onto the street and the building
 *  across it. World units at the actors' plane; the floor is at N_FLOOR. The city behind the window is authored in
 *  "appear" coordinates: where each thing shows when the camera sits at REF. Other cameras get real parallax. */
export const N_FLOOR = 880;
export const WIN = { x0: 1180, x1: 1720, y0: 200, y1: 720 };
export const REF = { x: 1450, y: 460 };
/** The building across the street sits at this depth. */
export const OPP = 0.6;
/** The window with the curtain, in the building across the street (appear coordinates, depth OPP). */
export const CW = { x: 1450, y: 482, w: 66, h: 88 };
/** Lying in bed: the hip of a figure rotated -86 (as in the sample bedroom). */
export const BED = { hipX: 470, feetY: 847, pillowX: 352, edgeX: 800, seatY: 735 };
export const CLOCK = { x: 140, y: 700 };
export const WALL_COUNTER = { x: 470, y: 430 };

/** The camera that centres a point of the city (appear coordinates at depth d). */
export const camOnCity = (d: number, ax: number, ay: number, zoom: number): Camera => ({
  x: (ax - REF.x * (1 - d)) / d,
  y: (ay - REF.y * (1 - d)) / d,
  zoom,
});

/** Where a point of the city (appear coordinates at depth d) is on screen for this camera. */
export const cityToScreen = (cam: Camera, d: number, ax: number, ay: number) => {
  const wx = ax - REF.x * (1 - d) + cam.x * (1 - d);
  const wy = ay - REF.y * (1 - d) + cam.y * (1 - d);
  return { x: WIDTH / 2 + (wx - cam.x) * cam.zoom, y: HEIGHT / 2 + (wy - cam.y) * cam.zoom };
};

const City: React.FC<{ cam: Camera; d: number; flat?: boolean; children: React.ReactNode }> = ({ cam, d, flat = true, children }) => (
  <Layer cam={cam} depth={d} flat={flat}>
    <g transform={`translate(${-REF.x * (1 - d)} ${-REF.y * (1 - d)})`}>{children}</g>
  </Layer>
);

export const NIGHT_SKY = (
  <>
    <defs>
      <linearGradient id="nightsky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4a57a8" />
        <stop offset="1" stopColor="#a58fca" />
      </linearGradient>
    </defs>
    <rect width={WIDTH} height={HEIGHT} fill="url(#nightsky)" />
    {Array.from({ length: 70 }, (_, i) => (
      <circle key={i} cx={noise(i) * WIDTH} cy={noise(i + 99) * HEIGHT * 0.7} r={1.5 + noise(i + 7) * 2.2} fill="#fffbe6" opacity={0.5 + noise(i + 3) * 0.5} />
    ))}
  </>
);

const Win: React.FC<{ x: number; y: number; w?: number; h?: number; lit?: string }> = ({ x, y, w = 66, h = 88, lit }) => (
  <g>
    <rect x={x - w / 2 - 6} y={y - h / 2 - 6} width={w + 12} height={h + 12} rx={3} fill="#2a2440" />
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill={lit ?? "#1c2040"} />
    <line x1={x} y1={y - h / 2} x2={x} y2={y + h / 2} stroke="#2a2440" strokeWidth={5} />
    <rect x={x - w / 2 - 10} y={y + h / 2 + 4} width={w + 20} height={8} fill="#3a3352" />
  </g>
);

/** What the window across the street shows: a lamp-lit room, and a curtain that is open at 0 and drawn shut at 1. */
export const CurtainWindow: React.FC<{ shut: number }> = ({ shut }) => {
  const { x, y, w, h } = CW;
  const left = x - w / 2;
  const edge = left + 12 + (w - 12) * shut;
  const swing = Math.sin(shut * Math.PI) * 10;
  return (
    <g>
      <rect x={left - 8} y={y - h / 2 - 8} width={w + 16} height={h + 16} rx={3} fill="#2a2440" />
      <rect x={left} y={y - h / 2} width={w} height={h} fill="#ffcf7a" />
      <path d={`M${x + 8} ${y + 8} l14 -20 h10 l14 20 Z`} fill="#c98a3a" />
      <line x1={x + 23} y1={y + 8} x2={x + 23} y2={y + h / 2} stroke="#8a5a2a" strokeWidth={3} />
      <rect x={left} y={y + h / 2 - 16} width={w} height={16} fill="#e0a860" />
      <path d={`M${left} ${y - h / 2} H${edge} Q${edge - 6 + swing} ${y} ${edge + swing} ${y + h / 2} H${left} Z`} fill="#c55a74" />
      {[0.3, 0.6, 0.85].map((k) => (
        <line key={k} x1={left + (edge - left) * k} y1={y - h / 2} x2={left + (edge - left) * k + swing * k} y2={y + h / 2} stroke="#93405a" strokeWidth={3} />
      ))}
      <rect x={left - 4} y={y - h / 2 - 4} width={w + 8} height={6} fill={INK} />
      <rect x={left - 10} y={y + h / 2 + 4} width={w + 20} height={9} fill="#3a3352" />
    </g>
  );
};

/** A paper split-flap pinned to the wall, reading `n`. World units. */
export const WallCounter: React.FC<{ n: string; x?: number; y?: number }> = ({ n, x = WALL_COUNTER.x, y = WALL_COUNTER.y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={0} width={120} height={150} rx={14} fill={INK} />
    <line x1={0} y1={75} x2={120} y2={75} stroke="#4a4d58" strokeWidth={4} />
    <text x={60} y={104} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={84} fill={PAPER}>{n}</text>
    <rect x={38} y={-10} width={44} height={22} fill="#e8d7a8" opacity={0.85} transform="rotate(-6 60 0)" />
  </g>
);

export type Weather = "clear" | "rain" | "snow";

/** The bedroom, the window and the city behind it. `t` drives the city (cars, smoke, birds), so it freezes with the
 *  world. `shut` is the curtain across the street. `clock` is the bedside display. */
export const NightBack: React.FC<{ cam: Camera; t: number; frame: number; shut?: number; clock?: string; counter?: string; weather?: Weather; moon?: number; room?: boolean }> = ({
  cam, t, frame, shut = 0, clock = "23:12", counter, weather = "clear", moon = 1, room = true,
}) => {
  const cars = [0, 1, 2].map((i) => ({ x: 700 + ((t * (5 + i * 1.5) + i * 520) % 1700), dir: i % 2 === 0 ? 1 : -1, color: ["#d9c26a", "#7fa0c4", "#cf5b3a"][i] }));
  return (
    <>
      {/* moon and a plane, far away */}
      <City cam={cam} d={0.1}>
        <circle cx={1290} cy={290} r={46} fill="#fff3cf" />
        {moon < 1 && <circle cx={1290 + 46 * moon * 0.9} cy={282} r={44} fill="#5a63ab" />}
        <circle cx={1290} cy={290} r={80} fill="#fff3cf" opacity={0.12} />
      </City>
      <City cam={cam} d={0.22}>
        <g transform={`translate(${1520 + t * 0.6} ${250})`}>
          <path d="M-22 0 L22 -3 L26 2 L-20 5 Z M-4 0 L-12 -14 L-4 -14 L6 0 Z" fill="#2c2f55" />
          {(Math.floor(t / 18) % 2 === 0) && <circle cx={24} cy={0} r={4} fill="#ff5a6a" />}
        </g>
        {/* a bird crossing the moon */}
        <g transform={`translate(${1250 + (t * 1.4) % 300} ${300 - Math.sin(t / 40) * 10})`}>
          <path d={`M0 0 Q-14 ${-14 * Math.sin(t * 0.35)} -26 ${-4 - 10 * Math.sin(t * 0.35)} M0 0 Q14 ${-14 * Math.sin(t * 0.35)} 26 ${-4 - 10 * Math.sin(t * 0.35)}`} stroke="#2c2f55" strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      </City>
      {/* far skyline */}
      <City cam={cam} d={0.35}>
        {Array.from({ length: 12 }, (_, i) => {
          const bx = 560 + i * 150;
          const top = 330 + noise(i + 50) * 120;
          return (
            <g key={i}>
              <rect x={bx} y={top} width={140} height={800 - top} fill={i % 2 ? "#3c4374" : "#454c80"} />
              {Array.from({ length: 12 }, (_, w) => noise(i * 13 + w) > 0.72 && (
                <rect key={w} x={bx + 16 + (w % 4) * 30} y={top + 20 + Math.floor(w / 4) * 34} width={16} height={20} fill="#ffd98a" opacity={0.85} />
              ))}
            </g>
          );
        })}
      </City>
      {/* the buildings across the street */}
      <City cam={cam} d={OPP}>
        <rect x={500} y={378} width={560} height={420} fill="#363f66" />
        <rect x={490} y={366} width={580} height={16} fill="#3a4370" />
        <rect x={1060} y={418} width={790} height={380} fill="#3f3760" />
        <rect x={1050} y={404} width={810} height={18} fill="#4b4170" />
        <rect x={1850} y={350} width={520} height={450} fill="#383f62" />
        <rect x={1840} y={338} width={540} height={16} fill="#3a4370" />
        {/* chimney and its smoke */}
        <rect x={1740} y={360} width={36} height={50} fill="#4b4170" />
        {Array.from({ length: 5 }, (_, i) => {
          const k = ((t * 0.6 + i * 22) % 110) / 110;
          return <circle key={i} cx={1758 + k * 40 + Math.sin(k * 6 + i) * 6} cy={350 - k * 120} r={10 + k * 22} fill="#c9c3e0" opacity={0.45 * (1 - k)} />;
        })}
        {/* windows; one row carries little lives that freeze with the world */}
        {[560, 670, 790, 900, 1000].map((x, i) => <Win key={`a${x}`} x={x} y={450} lit={i === 3 ? "#ffd98a" : undefined} />)}
        {[560, 670, 790, 900, 1000].map((x, i) => <Win key={`b${x}`} x={x} y={570} lit={i === 1 ? "#ffe3a0" : undefined} />)}
        {[1120, 1230, 1340, 1560, 1670, 1780].map((x, i) => <Win key={`c${x}`} x={x} y={CW.y} lit={i === 4 ? "#ffd98a" : undefined} />)}
        {[1120, 1230, 1340, 1450, 1560, 1670, 1780].map((x, i) => <Win key={`d${x}`} x={x} y={600} lit={i === 1 ? "#8fb8ff" : i === 5 ? "#ffd98a" : undefined} />)}
        {[1920, 2030, 2140, 2250].map((x, i) => <Win key={`e${x}`} x={x} y={430} lit={i === 1 ? "#ffd98a" : undefined} />)}
        {[1920, 2030, 2140, 2250].map((x, i) => <Win key={`f${x}`} x={x} y={560} lit={i === 2 ? "#ffd98a" : undefined} />)}
        {/* someone watering a plant (the drops fall with the world) */}
        <g>
          <circle cx={892} cy={438} r={12} fill={INK} />
          <rect x={884} y={448} width={16} height={30} rx={6} fill={INK} />
          <path d="M898 456 L918 452 L922 458 L902 462 Z" fill={INK} />
          {[0, 1, 2].map((i) => <circle key={i} cx={924 + i * 2} cy={462 + ((t * 1.2 + i * 6) % 18)} r={2.5} fill="#7fa0ff" />)}
          <path d="M916 494 h20 l-4 -12 h-12 Z" fill="#7fc29b" />
        </g>
        {/* the blue light of a television */}
        <g>
          <circle cx={1222} cy={608} r={11} fill={INK} /><rect x={1208} y={618} width={30} height={22} rx={6} fill={INK} />
        </g>
        {/* a cat on a lit sill */}
        <g>
          <ellipse cx={1680} cy={535} rx={16} ry={10} fill={INK} /><circle cx={1668} cy={524} r={8} fill={INK} />
          <path d="M1662 518 l2 -8 l4 6 Z M1670 517 l3 -8 l3 7 Z" fill={INK} />
          <path d={`M1694 534 q${12 + Math.sin(t / 9) * 6} -4 ${10 + Math.sin(t / 9) * 4} -20`} stroke={INK} strokeWidth={4} fill="none" />
        </g>
        {/* someone mid-yawn, arms up */}
        <g>
          <circle cx={2030} cy={420} r={11} fill={INK} /><rect x={2022} y={430} width={16} height={26} rx={6} fill={INK} />
          <path d={`M2024 434 l-12 ${-16 - Math.sin(t / 25) * 6} M2036 434 l12 ${-16 - Math.sin(t / 25) * 6}`} stroke={INK} strokeWidth={5} strokeLinecap="round" />
        </g>
        <CurtainWindow shut={shut} />
        {/* shopfronts at street level */}
        <rect x={500} y={668} width={1870} height={50} fill="#3a3352" />
        {[620, 980, 1300, 1620, 2000].map((x, i) => (
          <g key={x}>
            <rect x={x} y={672} width={150} height={42} fill={i % 2 ? "#ffd98a" : "#7fc29b"} opacity={0.75} />
            <path d={`M${x - 10} 672 h170 l-12 -16 h-146 Z`} fill={["#cf5b3a", "#1d9a8f", "#d9c26a", "#b58fc7", "#cf5b3a"][i]} />
          </g>
        ))}
      </City>
      {/* the street below, its lamps and cars */}
      <City cam={cam} d={0.78}>
        <rect x={500} y={716} width={1900} height={700} fill="#2a2d45" />
        <rect x={500} y={800} width={1900} height={600} fill="#4a4a62" />
        <rect x={500} y={796} width={1900} height={8} fill="#6a6a85" />
        <rect x={500} y={714} width={1900} height={6} fill="#5a5d7a" />
        {[1000, 1460, 1920].map((x) => (
          <g key={x}>
            <rect x={x - 4} y={600} width={8} height={120} fill="#1d1f33" />
            <path d={`M${x - 18} 600 h36 l-6 -10 h-24 Z`} fill="#1d1f33" />
            <circle cx={x} cy={604} r={7} fill="#ffe7a8" />
          </g>
        ))}
        {cars.map((c, i) => (
          <g key={i} transform={`translate(${c.x} ${728 + i * 4}) scale(${c.dir} 1)`}>
            <path d="M-50 0 h100 v-16 l-18 -4 l-14 -14 h-38 l-14 14 l-16 4 Z" fill={c.color} />
            <circle cx={-30} cy={2} r={8} fill={INK} /><circle cx={30} cy={2} r={8} fill={INK} />
            <polygon points="50,-12 120,-24 120,6" fill="#fff1b8" opacity={0.35} />
            <circle cx={50} cy={-10} r={4} fill="#fff1b8" />
            {[0, 1, 2].map((p) => <circle key={p} cx={-58 - p * 14} cy={-6 - p * 3} r={4 + p * 2} fill="#c9c3e0" opacity={0.4 - p * 0.1} />)}
          </g>
        ))}
        {/* a cyclist, and a man up a ladder at a shopfront */}
        <g transform={`translate(${700 + ((t * 4.2) % 1500)} 742)`}>
          <circle cx={-18} cy={0} r={13} fill="none" stroke="#1d1f33" strokeWidth={4} /><circle cx={18} cy={0} r={13} fill="none" stroke="#1d1f33" strokeWidth={4} />
          <path d="M-18 0 L-2 -18 L18 0 M-2 -18 L10 -18" stroke="#1d1f33" strokeWidth={4} fill="none" />
          <circle cx={-2} cy={-44} r={8} fill="#d9c26a" /><path d="M-2 -36 L-4 -18" stroke="#1d1f33" strokeWidth={7} />
        </g>
        <path d="M1596 716 L1616 640 M1616 716 L1636 640 M1600 700 h20 M1604 684 h20 M1608 668 h20 M1612 652 h20" stroke="#8a7a5a" strokeWidth={3} />
        <circle cx={1630} cy={612} r={8} fill="#e6a0a0" /><rect x={1624} y={620} width={12} height={22} rx={4} fill="#1d1f33" />
        <path d={`M1634 624 l12 ${-6 - Math.sin(t / 7) * 6}`} stroke="#1d1f33" strokeWidth={4} strokeLinecap="round" />
      </City>
      {room && <>
      {/* weather on the glass */}
      <Layer cam={cam} depth={1} flat>
        <defs><clipPath id="winclip"><rect x={WIN.x0} y={WIN.y0} width={WIN.x1 - WIN.x0} height={WIN.y1 - WIN.y0} /></clipPath></defs>
        <g clipPath="url(#winclip)">
          {weather === "rain" && Array.from({ length: 40 }, (_, i) => {
            const x = WIN.x0 + noise(i) * 560;
            const y = WIN.y0 + ((noise(i + 20) * 540 + frame * (14 + noise(i + 4) * 6)) % 560) - 20;
            return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 30} stroke="#cfe0ff" strokeWidth={3} opacity={0.5} />;
          })}
          {weather === "snow" && Array.from({ length: 50 }, (_, i) => {
            const x = WIN.x0 + noise(i) * 560 + Math.sin(frame / 20 + i) * 12;
            const y = WIN.y0 + ((noise(i + 20) * 540 + frame * (1.6 + noise(i + 4) * 1.2)) % 540);
            return <circle key={i} cx={x} cy={y} r={3 + noise(i + 2) * 3} fill="#ffffff" opacity={0.8} />;
          })}
          <path d={`M${WIN.x0 + 60} ${WIN.y1} L${WIN.x0 + 300} ${WIN.y0} H${WIN.x0 + 360} L${WIN.x0 + 120} ${WIN.y1} Z`} fill="#ffffff" opacity={0.05} />
        </g>
      </Layer>
      {/* the room */}
      <Layer cam={cam} depth={1}>
        <path d={`M-900 -500 H3200 V${N_FLOOR} H-900 Z M${WIN.x0} ${WIN.y0} V${WIN.y1} H${WIN.x1} V${WIN.y0} Z`} fillRule="evenodd" fill="#9aa4d4" />
        {Array.from({ length: 34 }, (_, i) => {
          const x = -880 + i * 120;
          if (x > WIN.x0 - 20 && x < WIN.x1 + 20) return null;
          return <rect key={i} x={x} y={-500} width={8} height={N_FLOOR + 500} fill="#8a95c6" />;
        })}
        <rect x={WIN.x0 - 14} y={WIN.y0 - 14} width={WIN.x1 - WIN.x0 + 28} height={WIN.y1 - WIN.y0 + 28} fill="none" stroke={INK} strokeWidth={16} />
        <rect x={WIN.x0} y={310} width={WIN.x1 - WIN.x0} height={12} fill={INK} />
        <rect x={WIN.x0 - 40} y={WIN.y1 + 2} width={WIN.x1 - WIN.x0 + 80} height={30} rx={4} fill="#8c6f86" />
        <rect x={WIN.x0 - 40} y={WIN.y1 + 26} width={WIN.x1 - WIN.x0 + 80} height={8} fill="#5d4a63" />
        <rect x={WIN.x0 - 110} y={168} width={WIN.x1 - WIN.x0 + 220} height={12} rx={6} fill={INK} />
        <path d={`M${WIN.x0 - 100} 176 H${WIN.x0 + 20} Q${WIN.x0 - 10} 480 ${WIN.x0 + 10} 790 H${WIN.x0 - 110} Z`} fill="#4b3a6b" />
        <path d={`M${WIN.x1 + 100} 176 H${WIN.x1 - 20} Q${WIN.x1 + 10} 480 ${WIN.x1 - 10} 790 H${WIN.x1 + 110} Z`} fill="#4b3a6b" />
        <path d={`M${WIN.x0 - 70} 190 Q${WIN.x0 - 50} 480 ${WIN.x0 - 60} 780 M${WIN.x1 + 60} 190 Q${WIN.x1 + 44} 480 ${WIN.x1 + 52} 780`} stroke="#3a2c55" strokeWidth={6} fill="none" />
        {/* a framed photo, the wall counter */}
        <rect x={760} y={300} width={150} height={120} rx={6} fill="#f3e9d7" stroke={INK} strokeWidth={8} />
        <circle cx={812} cy={350} r={18} fill="#e0a070" /><circle cx={860} cy={356} r={14} fill="#f2b632" />
        <path d="M782 412 Q812 380 838 412 M838 412 Q860 388 888 412" fill="none" stroke={INK} strokeWidth={6} />
        {counter && <WallCounter n={counter} />}
        {/* floor and rug */}
        <rect x={-900} y={N_FLOOR} width={4200} height={500} fill="#3c3550" />
        <rect x={-900} y={N_FLOOR} width={4200} height={12} fill="#2b2540" />
        <ellipse cx={1050} cy={N_FLOOR + 50} rx={420} ry={34} fill="#5b4a7a" opacity={0.9} />
        {/* bedside table and the clock */}
        <rect x={40} y={740} width={200} height={140} rx={8} fill="#5d4a63" />
        <rect x={56} y={790} width={168} height={8} rx={4} fill="#3e3048" />
        <rect x={CLOCK.x - 62} y={CLOCK.y - 30} width={124} height={44} rx={10} fill={INK} />
        <text x={CLOCK.x} y={CLOCK.y + 4} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#ff6a74">{clock}</text>
        {/* the bed */}
        <rect x={240} y={560} width={44} height={300} rx={14} fill="#5a4060" />
        <rect x={840} y={690} width={36} height={170} rx={12} fill="#5a4060" />
        <rect x={276} y={730} width={574} height={90} rx={16} fill="#e9e2f2" />
        <ellipse cx={BED.pillowX} cy={712} rx={84} ry={33} fill="#f5f0fa" />
      </Layer>
      </>}
    </>
  );
};

/** The quilt over you in bed. Drawn in front of the figure. */
export const NightBedFront: React.FC<{ cam: Camera; off?: number }> = ({ cam, off = 0 }) => (
  <Layer cam={cam} depth={1}>
    <g transform={`translate(452 0) scale(${1 - 0.6 * off} 1) translate(-452 0)`}>
      <path d="M452 696 Q650 660 852 700 V812 H452Z" fill="#46508f" />
      <path d="M452 744 H852 M452 772 H852" stroke="#e9e2f2" strokeWidth={9} opacity={0.5} />
    </g>
  </Layer>
);
