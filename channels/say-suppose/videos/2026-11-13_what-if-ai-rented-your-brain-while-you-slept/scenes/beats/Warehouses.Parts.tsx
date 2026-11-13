// The Warehouses' pieces (builder C): the cap and band overlay for your brother (the clerk lifts the brim), a broker
// with his shoebox, the seated breakfast table, and the drawn sheets: the map with its pale river, the chess robot with
// the man inside, the labeller at night, the clerk's clipboard of faces.
import { Figure, type FigureProps } from "@whatif/kit/rig/Figure";
import { HEAD_R, joints, SEATED, seatedY, type Pose } from "@whatif/kit/rig/pose";
import { Chair } from "@whatif/kit/sets/common";
import { Laptop } from "@whatif/kit/sets/props";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Band, BandBox, Coin } from "../parts";
import { BROKER, BROTHER, GHOST, HERO, linear, mix, PASTELS, ramp } from "../shared";
import { Draw, type Body } from "./NightShift.Rig";
import { FaceMarks } from "./NightShift.Rooms";

// ---------------------------------------------------------------- your brother's cap and band

/** Your brother's red cap (drawn here, not by the Figure, so it can tip up: `lift` degrees) and the band under its brim
 *  with its teal light (`lit` 0..1), over a Figure's head; `bags` greys under his eyes. */
export const CapAndBand: React.FC<{ b: Body; lift?: number; lit?: number; bags?: number; look?: { x: number; y: number }; cap?: boolean }> = ({
  b, lift = 0, lit = 1, bags = 0.8, look, cap = true }) => {
  const j = joints(b.pose);
  const R = HEAD_R;
  return (
    <g>
      <FaceMarks b={b} look={look} bags={bags} />
      <g transform={`translate(${b.x} ${b.y}) scale(${b.scale * b.facing} ${b.scale}) translate(${j.head.x} ${j.head.y}) rotate(${b.pose.tilt})`}>
        <path d={`M${-R + 3} -24 Q2 -34 ${R - 3} -22`} fill="none" stroke="#1b1d24" strokeWidth={7} strokeLinecap="round" />
        <circle cx={30} cy={-26} r={6.5} fill={lit > 0.05 ? GHOST.light : "#2a3a3a"} stroke="#1b1d24" strokeWidth={2} opacity={0.4 + 0.6 * lit} />
        {cap && (
          <g transform={`rotate(${-lift} ${-R} -8)`}>
            <path d={`M${-R} -8 A${R} ${R} 0 0 1 ${R} -8 L${R + 24} -6 L${R} 2 L${-R} -2Z`} fill={BROTHER.cap} />
          </g>
        )}
        {/* the light shows under the brim even with the cap down */}
        {lit > 0.05 && <ellipse cx={34} cy={cap && lift < 5 ? -1 : -26} rx={cap && lift < 5 ? 18 : 18} ry={cap && lift < 5 ? 6 : 18} fill={GHOST.light} opacity={0.4 * lit} />}
      </g>
    </g>
  );
};

/** The cap in a hand (his, walking home). Hand units. */
export const HeldCap: React.FC = () => (
  <g transform="rotate(20) translate(0 8)">
    <path d="M-30 0 A30 26 0 0 1 30 0 L48 2 L30 8 L-30 6Z" fill={BROTHER.cap} stroke={INK} strokeWidth={3} />
  </g>
);

/** A broker in a grey suit and tie, the shoebox of bands under his arm (in the back hand). */
export const Broker: React.FC<{ x: number; y: number; scale: number; facing: 1 | -1; frame: number; pose?: Pose; face?: Partial<FigureProps>; seed?: number }> = ({
  x, y, scale, facing, frame, pose, face, seed = 0 }) => (
  <Figure x={x} y={y} scale={scale} facing={facing} pose={pose} head={BROKER.head} coat={BROKER.coat} tie={BROKER.tie}
    mouth="flat" brows="flat" lids={0.3} look={{ x: 0.9, y: 0.1 }} blink={(frame + seed * 23) % 97 < 4} time={frame}
    held={<BandBox x={0} y={40} scale={0.5} />} {...face} />
);

// ---------------------------------------------------------------- the breakfast table, sat at

export const BTABLE = { top: 800, seat: 850, you: 470, bro: 1460, band: { x: 1110, y: 790 } } as const;

/** The two of you at the table, seated (The Rule's places), and what's on it this morning (`morning` 0, 1, 2). */
export const Breakfast: React.FC<{ frame: number; morning: number; youFace: Partial<FigureProps>; broFace: Partial<FigureProps> }> = ({ frame, morning, youFace, broFace }) => {
  const s = 1.15;
  const yp: Pose = { ...SEATED, lean: 6 + morning * 3, armF: [80, 40], armB: [70, 50] };
  const bp: Pose = { ...SEATED, lean: 4 + morning * 4, armF: [70, 50], armB: [60, 60] };
  return (
    <g>
      <Chair x={BTABLE.you - 20} y={BTABLE.seat} scale={1.2} facing={1} color="#8a5c3b" />
      <Chair x={BTABLE.bro + 20} y={BTABLE.seat} scale={1.2} facing={-1} color="#8a5c3b" />
      <Figure x={BTABLE.you} y={seatedY(BTABLE.seat, s)} scale={s} pose={yp} {...HERO} time={frame} blink={(frame + 5) % 97 < 4} {...youFace} />
      <Figure x={BTABLE.bro} y={seatedY(BTABLE.seat, s)} scale={s} facing={-1} pose={bp} head={BROTHER.head} coat={BROTHER.coat} cap={BROTHER.cap}
        blink={(frame + 31) % 97 < 4} {...broFace} />
    </g>
  );
};

/** What's on the table each of the three mornings (drawn in front of the people, on the table top). */
export const TableThings: React.FC<{ morning: number }> = ({ morning }) => (
  <g>
    {morning === 0 && (
      <g>
        <path d="M1220 750 Q1290 820 1360 750Z" fill="#e6a0a0" stroke={INK} strokeWidth={5} />
        <ellipse cx={1290} cy={750} rx={70} ry={10} fill="#f6e3b0" stroke={INK} strokeWidth={4} />
        <rect x={700} y={732} width={56} height={66} rx={8} fill={PAPER} stroke={INK} strokeWidth={4} />
      </g>
    )}
    {morning === 1 && (
      <g>
        <ellipse cx={720} cy={792} rx={90} ry={14} fill="#eef1f4" stroke={INK} strokeWidth={4} />
        <rect x={680} y={764} width={70} height={24} rx={8} fill="#d9a766" stroke={INK} strokeWidth={4} />
        <rect x={1270} y={736} width={56} height={62} rx={8} fill="#7fa0c4" stroke={INK} strokeWidth={4} />
      </g>
    )}
    {morning === 2 && <rect x={1270} y={736} width={56} height={62} rx={8} fill={PAPER} stroke={INK} strokeWidth={4} />}
    <Band x={BTABLE.band.x} y={BTABLE.band.y - 8} scale={0.6} lit={false} />
  </g>
);

// ---------------------------------------------------------------- the map

const CONTINENTS = {
  na: "M120 170 C180 110 330 100 420 150 C470 180 440 250 400 290 C360 330 330 360 300 420 C270 380 220 360 190 320 C150 280 90 230 120 170Z",
  sa: "M330 450 C380 440 420 480 410 540 C400 600 360 660 340 700 C320 650 300 600 300 540 C300 500 300 460 330 450Z",
  eu: "M560 150 C610 120 680 130 700 170 C690 200 650 220 600 220 C570 210 550 180 560 150Z",
  af: "M580 250 C650 240 710 270 720 330 C730 400 690 470 650 540 C610 500 590 440 570 390 C550 330 550 270 580 250Z",
  as: "M720 130 C820 90 980 100 1080 150 C1120 190 1080 250 1010 280 C940 310 880 300 820 280 C770 260 720 220 720 130Z",
  au: "M960 520 C1010 500 1080 510 1090 560 C1080 600 1020 610 980 590 C950 570 940 540 960 520Z",
};
/** The shaded country: the United States, as a band across North America's middle. */
const US = "M150 230 C230 210 360 210 430 230 C430 260 410 290 380 310 C320 320 240 320 190 300 C160 280 150 255 150 230Z";
const RIVERS = [
  "M400 270 C460 250 520 210 600 190",
  "M400 280 C480 300 540 330 620 330",
  "M330 310 C340 380 350 420 350 480",
  "M420 260 C560 200 720 160 860 190",
  "M420 290 C600 380 800 460 990 540",
];

/** A paper map: one country shaded, a pale river of plasma running out of it to the rest of the world. No words. */
export const MapSheet: React.FC<{ frame: number; at: number; flow: readonly [number, number] }> = ({ frame, at, flow }) => (
  <g transform="translate(40 20)">
    {Object.values(CONTINENTS).map((d, i) => <Draw key={i} d={d} t={linear(frame, at + 4 + i * 2, at + 22 + i * 2)} w={5} fill="#d9cfb2" />)}
    <path d={US} fill={MUSTARD} stroke={INK} strokeWidth={4} opacity={ramp(frame, at + 22, at + 32)} />
    {RIVERS.map((d, i) => {
      const t = linear(frame, mix(flow[0], flow[1], i / RIVERS.length), mix(flow[0], flow[1], (i + 1.6) / RIVERS.length));
      return (
        <g key={i}>
          <Draw d={d} t={t} w={22} color="#f3dc8f" />
          {t >= 1 && <path d={d} fill="none" stroke="#fff6cf" strokeWidth={6} strokeDasharray="10 26" strokeDashoffset={-frame * 2} strokeLinecap="round" />}
        </g>
      );
    })}
  </g>
);

// ---------------------------------------------------------------- the chess robot, and the cents

/** The chess robot: a cabinet with a chessboard on top and a robed figure in a turban behind it; the cabinet's little
 *  door opens on the man hidden inside. Then, at `cents`, a laptop with a grid of little tasks and tiny coins. */
export const ChessSheet: React.FC<{ frame: number; at: number; door: number; cents: number }> = ({ frame, at, door, cents }) => {
  const open = ramp(frame, door, door + 14);
  const C = { x: 160, y: 420, w: 400, h: 230 };
  const arm = Math.sin(frame / 10) * 6;
  return (
    <g opacity={ramp(frame, at + 2, at + 12)}>
      {/* the automaton behind the cabinet */}
      <Figure x={C.x + 280} y={C.y + 20} scale={1.1} facing={-1} pose={{ ...SEATED, armF: [70 + arm, 30], armB: [40, 60] }} head="#c9b48f" coat="#5a3a6a"
        eyes={0.9} mouth="flat" brows="flat" look={{ x: 0.7, y: 0.6 }} />
      <g transform={`translate(${C.x + 280 - 4} ${C.y + 20 - 264 * 1.1})`}>
        <ellipse cx={0} cy={-34} rx={56} ry={30} fill={PAPER} stroke={INK} strokeWidth={4} />
        <path d="M-50 -38 Q0 -20 50 -38 M-46 -26 Q0 -8 46 -26" fill="none" stroke={INK} strokeWidth={3} opacity={0.5} />
        <path d="M6 -62 q10 -40 -6 -60" fill="none" stroke="#d8344f" strokeWidth={8} strokeLinecap="round" />
        <circle cx={0} cy={-48} r={8} fill="#d8344f" />
      </g>
      {/* the cabinet and the board */}
      <rect x={C.x} y={C.y} width={C.w} height={C.h} fill="#8a5a3a" stroke={INK} strokeWidth={6} />
      <path d={`M${C.x - 10} ${C.y} L${C.x + 40} ${C.y - 40} H${C.x + C.w + 40} L${C.x + C.w + 10} ${C.y}Z`} fill="#6b4b3a" stroke={INK} strokeWidth={5} />
      {Array.from({ length: 16 }, (_, i) => (
        <path key={i} d={`M${C.x + 30 + (i % 8) * 46 + Math.floor(i / 8) * 20} ${C.y - 8 - Math.floor(i / 8) * 20} h23 l10 -10 h-23z`} fill={i % 2 ? PAPER : INK} opacity={0.85} />
      ))}
      {/* inside: the hidden man, crouched with a candle */}
      <rect x={C.x + 20} y={C.y + 20} width={180} height={C.h - 40} fill="#2a1c14" />
      <g opacity={open}>
        <circle cx={C.x + 160} cy={C.y + 70} r={22} fill="#ffd27a" opacity={0.5} />
        <rect x={C.x + 154} y={C.y + 80} width={10} height={30} fill={PAPER} />
        <Figure x={C.x + 90} y={C.y + 200} scale={0.62} pose={{ ...SEATED, lean: 40, armF: [120, 20], armB: [80, 40] }} head={PASTELS[4]} coat="#3f4a5c"
          eyes={1.2} brows="raised" mouth="o" look={{ x: 0.6, y: -0.6 }} />
      </g>
      <g transform={`translate(${C.x + 20} 0) scale(${1 - open * 0.92} 1) translate(${-(C.x + 20)} 0)`}>
        <rect x={C.x + 20} y={C.y + 20} width={180} height={C.h - 40} fill="#a8774a" stroke={INK} strokeWidth={5} />
        <circle cx={C.x + 180} cy={C.y + C.h / 2} r={8} fill={MUSTARD} stroke={INK} strokeWidth={2} />
      </g>
      <rect x={C.x + 220} y={C.y + 20} width={160} height={C.h - 40} fill="#a8774a" stroke={INK} strokeWidth={5} />
      {/* the cents: a laptop of little tasks, tiny coins */}
      {frame >= cents && (
        <g opacity={ramp(frame, cents, cents + 10)}>
          <Laptop x={900} y={560} scale={1.6} screen="off" facing={-1} />
          {Array.from({ length: 12 }, (_, i) => {
            const done = frame >= cents + 8 + i * 6;
            return <rect key={i} x={790 + (i % 4) * 44} y={360 + Math.floor(i / 4) * 44} width={34} height={34} rx={4} fill={done ? TEAL : "#eef1f5"} stroke={INK} strokeWidth={3} />;
          })}
          <path d="M1060 640 L1072 700 H1128 L1140 640Z" fill="#9aa1ab" stroke={INK} strokeWidth={4} />
          {Array.from({ length: 12 }, (_, i) => {
            const t = (frame - (cents + 8 + i * 6)) / 10;
            if (t < 0) return null;
            const p = Math.min(1, t);
            return <Coin key={i} x={mix(1000, 1100, p)} y={mix(560, 660, p * p) - Math.sin(p * Math.PI) * 60} r={7} />;
          })}
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- the labeller at night

/** Someone at a laptop at night drawing boxes round the shapes on the screen, one after another; a few tiny coins. */
export const LabelSheet: React.FC<{ frame: number; at: number; end: number }> = ({ frame, at, end }) => {
  const shapes = [
    { x: 520, y: 250, d: "M500 270 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0 M512 250 l6 -14 l6 14 M532 250 l6 -14 l6 14" },
    { x: 650, y: 250, d: "M620 280 h60 v-20 l-14 -16 h-32 l-14 16Z" },
    { x: 780, y: 250, d: "M780 220 l26 50 h-52Z M776 270 v16 h8 v-16" },
    { x: 520, y: 360, d: "M500 380 h44 l-8 -30 h-28Z" },
    { x: 650, y: 360, d: "M630 340 h40 v40 h-40Z" },
    { x: 780, y: 360, d: "M760 380 q20 -50 40 0Z" },
  ];
  return (
    <g opacity={ramp(frame, at + 2, at + 12)}>
      <rect x={430} y={160} width={440} height={290} rx={12} fill="#eef1f5" stroke={INK} strokeWidth={8} />
      <path d="M400 470 H900 L880 450 H420Z" fill="#3a3f4c" stroke={INK} strokeWidth={4} />
      {shapes.map((s, i) => {
        const t = linear(frame, mix(at + 14, end - 10, i / shapes.length), mix(at + 14, end - 10, (i + 0.7) / shapes.length));
        return (
          <g key={i}>
            <path d={s.d} fill={PASTELS[(i * 3) % 8]} stroke={INK} strokeWidth={3} />
            <Draw d={`M${s.x - 50} ${s.y - 30}h100v80h-100Z`} t={t} w={4} color="#d8344f" />
          </g>
        );
      })}
      <Figure x={260} y={seatedY(560, 1.1)} scale={1.1} pose={{ ...SEATED, lean: 10, armF: [80 + Math.sin(frame) * 3, 40], armB: [70, 50] }} head={PASTELS[2]} coat="#4f6f5a"
        lids={0.45} brows="flat" mouth="flat" look={{ x: 0.9, y: 0.2 }} />
      <rect x={160} y={560} width={140} height={14} fill="#6b4b3a" />
      {[0, 1].map((i) => <Coin key={i} x={960 + i * 4} y={600 - i * 10} r={10} />)}
    </g>
  );
};

// ---------------------------------------------------------------- the clerk's clipboard

/** The clerk's clipboard: six faces in rows; two are grey under the eyes and get a cross, the rest a tick. */
export const ClipboardSheet: React.FC<{ frame: number; at: number }> = ({ frame, at }) => (
  <g opacity={ramp(frame, at, at + 8)}>
    <rect x={420} y={60} width={400} height={680} rx={20} fill="#8a5a3a" stroke={INK} strokeWidth={6} />
    <rect x={450} y={110} width={340} height={600} fill={PAPER} stroke={INK} strokeWidth={3} />
    <rect x={560} y={40} width={120} height={50} rx={10} fill="#9aa1ab" stroke={INK} strokeWidth={5} />
    {Array.from({ length: 6 }, (_, i) => {
      const y = 170 + i * 90;
      const tired = i === 1 || i === 4;
      const shown = frame >= at + 8 + i * 6;
      return shown ? (
        <g key={i}>
          <circle cx={530} cy={y} r={30} fill={PASTELS[(i * 3 + 1) % 8]} stroke={INK} strokeWidth={3} />
          <circle cx={522} cy={y - 4} r={4} fill={INK} /><circle cx={540} cy={y - 4} r={4} fill={INK} />
          {tired && <path d={`M514 ${y + 8} Q522 ${y + 14} 530 ${y + 8} M532 ${y + 8} Q540 ${y + 14} 548 ${y + 8}`} fill="none" stroke="#6b6e78" strokeWidth={4} />}
          <rect x={590} y={y - 8} width={110} height={14} rx={7} fill={INK} opacity={0.3} />
          {tired
            ? <Draw d={`M720 ${y - 18} l32 32 M752 ${y - 18} l-32 32`} t={linear(frame, at + 14 + i * 6, at + 22 + i * 6)} w={7} color="#d8344f" />
            : <Draw d={`M718 ${y} l12 14 l24 -28`} t={linear(frame, at + 14 + i * 6, at + 22 + i * 6)} w={7} color={TEAL} />}
        </g>
      ) : null;
    })}
  </g>
);
