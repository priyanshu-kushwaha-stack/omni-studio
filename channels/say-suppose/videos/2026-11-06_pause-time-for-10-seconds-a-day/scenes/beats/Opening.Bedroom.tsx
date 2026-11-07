import { Layer, type Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { noise } from "../shared";

/** Your bedroom: the owner's sample Bedroom (core/engines/whatif/examples/pause-sample/scenes/Bedroom.tsx), copied
 *  and extended with a night sky, a ringing alarm clock with settable hands, a phone on the bedside, a pillow that
 *  can leave the bed, dust that can be stirred, and the cat. World units; the floor starts at FLOOR. */
export const HIP_X = 925;
export const FEET_Y = 847;
export const FLOOR = 860;
export const CLOCK = { x: 1420, y: 662 };
export const PILLOW = { x: 805, y: 712 };
export const PHONE = { x: 1545, y: 676 };
export const WINDOW = { x: 455, y: 395 };

/** Clock hands in degrees clockwise from 12. */
export interface ClockHands { hour: number; minute: number; second: number }

const FUR = "#e08a3c";
const STRIPE = "#b8642a";
const BELLY = "#f6d8a8";
const PINK = "#e58a8a";

const hand = (deg: number, len: number) => ({
  x2: CLOCK.x + Math.sin((deg * Math.PI) / 180) * len,
  y2: CLOCK.y - Math.cos((deg * Math.PI) / 180) * len,
});

/** The bedside alarm clock. `shake` tilts it about its base (degrees); `ringing` draws the hammer and the ring lines. */
const AlarmClock: React.FC<{ shake: number; ringing: boolean; hands: ClockHands; hammer: number; glow?: number }> = ({ shake, ringing, hands, hammer, glow = 0 }) => (
  <g transform={`rotate(${shake} ${CLOCK.x} 722)`}>
    <rect x={CLOCK.x - 44} y={712} width={14} height={12} rx={3} fill={INK} />
    <rect x={CLOCK.x + 30} y={712} width={14} height={12} rx={3} fill={INK} />
    <circle cx={CLOCK.x - 36} cy={600} r={18} fill={INK} />
    <circle cx={CLOCK.x + 36} cy={600} r={18} fill={INK} />
    {ringing && <rect x={CLOCK.x - 3 + hammer * 22} y={582} width={6} height={30} rx={3} fill={INK} transform={`rotate(${hammer * 25} ${CLOCK.x} 612)`} />}
    {glow > 0 && <circle cx={CLOCK.x} cy={CLOCK.y} r={90} fill="#fff1b8" opacity={0.35 * glow} />}
    <circle cx={CLOCK.x} cy={CLOCK.y} r={60} fill="#fff6e3" stroke={INK} strokeWidth={11} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i * 30 * Math.PI) / 180;
      return <circle key={i} cx={CLOCK.x + Math.sin(a) * 44} cy={CLOCK.y - Math.cos(a) * 44} r={i % 3 === 0 ? 4 : 2.2} fill={INK} />;
    })}
    <line x1={CLOCK.x} y1={CLOCK.y} {...hand(hands.hour, 26)} stroke={INK} strokeWidth={8} strokeLinecap="round" />
    <line x1={CLOCK.x} y1={CLOCK.y} {...hand(hands.minute, 40)} stroke={INK} strokeWidth={6} strokeLinecap="round" />
    <line x1={CLOCK.x} y1={CLOCK.y} {...hand(hands.second, 48)} stroke="#d8344f" strokeWidth={4} strokeLinecap="round" />
    <circle cx={CLOCK.x} cy={CLOCK.y} r={6} fill={INK} />
    {ringing && [-1, 1].map((s) => (
      <g key={s} stroke={INK} strokeWidth={6} strokeLinecap="round" fill="none">
        <path d={`M${CLOCK.x + s * 66} 572 q${s * 16} 6 ${s * 22} 22`} />
        <path d={`M${CLOCK.x + s * 84} 556 q${s * 24} 10 ${s * 32} 36`} />
        <path d={`M${CLOCK.x + s * 80} 640 l${s * 22} 2`} />
      </g>
    ))}
  </g>
);

/** The phone on its little stand on the bedside table. `lit` 0..1 lights the screen; `rock` tilts it (a buzz). */
const Phone: React.FC<{ lit: number; rock: number }> = ({ lit, rock }) => (
  <g transform={`rotate(${-8 + rock} ${PHONE.x} 722)`}>
    <path d={`M${PHONE.x - 30} 722 L${PHONE.x - 12} 700 H${PHONE.x + 26} L${PHONE.x + 34} 722Z`} fill="#5a5f6b" />
    <rect x={PHONE.x - 24} y={PHONE.y - 48} width={48} height={92} rx={9} fill={INK} />
    <rect x={PHONE.x - 18} y={PHONE.y - 40} width={36} height={74} rx={5} fill={lit > 0 ? "#bfe6ee" : "#3a4150"} />
    {lit > 0 && (
      <g opacity={lit}>
        <circle cx={PHONE.x} cy={PHONE.y} r={70} fill="#dff6ff" opacity={0.35} />
        <rect x={PHONE.x - 13} y={PHONE.y - 26} width={26} height={16} rx={5} fill="#f2b632" />
        <rect x={PHONE.x - 13} y={PHONE.y - 4} width={26} height={5} rx={2.5} fill={INK} opacity={0.5} />
        <rect x={PHONE.x - 13} y={PHONE.y + 6} width={18} height={5} rx={2.5} fill={INK} opacity={0.5} />
      </g>
    )}
  </g>
);

/** A pillow, centred on (x, y). */
export const Pillow: React.FC<{ x: number; y: number; tilt?: number }> = ({ x, y, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
    <ellipse rx={84} ry={33} fill="#fffaf0" />
    <path d="M-70 -4 Q0 8 70 -4" fill="none" stroke="#e7dcc6" strokeWidth={5} />
    <path d="M-84 0 l-10 -8 M-84 0 l-10 8 M84 0 l10 -8 M84 0 l10 8" stroke="#fffaf0" strokeWidth={6} strokeLinecap="round" />
  </g>
);

export const BedroomBack: React.FC<{
  cam: Camera;
  t: number;
  night?: boolean;
  shake?: number;
  ringing?: boolean;
  hammer?: number;
  hands: ClockHands;
  clockGlow?: number;
  pillow?: boolean;
  phoneLit?: number;
  phoneRock?: number;
  /** Push dust away from a point (world units): the air that moves for you. */
  stir?: { x: number; y: number; r: number; push: number };
}> = ({ cam, t, night, shake = 0, ringing = false, hammer = 0, hands, clockGlow = 0, pillow = true, phoneLit = 0, phoneRock = 0, stir }) => {
  const angle = night ? 0 : Math.sin(t / 13) * 9;
  return (
    <>
      <Layer cam={cam} depth={0.3}>
        <rect x={-1500} y={-600} width={5000} height={1500} fill={night ? "#1b2347" : "#a8dcea"} />
        {night ? (
          <>
            {Array.from({ length: 46 }, (_, i) => (
              <circle key={i} cx={-1400 + noise(i + 70) * 3200} cy={-300 + noise(i + 140) * 900} r={2 + noise(i + 5) * 3} fill="#f3ecd0" opacity={0.5 + noise(i + 9) * 0.5} />
            ))}
            <circle cx={-200} cy={230} r={60} fill="#f3ecd0" />
            <circle cx={-176} cy={214} r={52} fill="#1b2347" />
          </>
        ) : (
          <circle cx={-200} cy={230} r={72} fill="#fff1b8" />
        )}
        <path d="M-1500 680 Q300 470 2000 680 V1000 H-1500Z" fill={night ? "#24402f" : "#7fc29b"} />
      </Layer>
      <Layer cam={cam} depth={1}>
        <path d="M-400 -300 H2500 V1400 H-400Z M250 170 H660 V620 H250Z" fillRule="evenodd" fill="#f0c9a0" />
        <rect x={232} y={150} width={446} height={24} rx={4} fill={INK} />
        <path d={`M240 174 H${330 + Math.sin(t / 19) * 8} Q${300 + Math.sin(t / 19) * 14} 400 ${275 + Math.sin(t / 19) * 12} 640 H240Z`} fill="#d8344f" opacity={0.85} />
        <path d={`M670 174 H${580 - Math.sin(t / 22) * 8} Q${610 - Math.sin(t / 22) * 14} 400 ${635 - Math.sin(t / 22) * 12} 640 H670Z`} fill="#d8344f" opacity={0.85} />
        <rect x={1610} y={250} width={190} height={240} rx={6} fill="#fff6e3" stroke={INK} strokeWidth={8} />
        <path d="M1640 450 L1695 350 L1730 410 L1755 375 L1775 450Z" fill="#7fc29b" />
        <rect x={-400} y={FLOOR} width={2900} height={500} fill="#b5764a" />
        <ellipse cx={1050} cy={930} rx={560} ry={52} fill="#d9a766" />
      </Layer>
      {!night && <polygon points="260,620 650,620 1320,1000 620,1000" fill="#fff4c6" opacity={0.22} />}
      {night && <polygon points="260,620 650,620 1120,1000 520,1000" fill="#b9c8ff" opacity={0.12} />}
      <g transform={`rotate(${angle} 1060 -40)`}>
        <line x1={1060} y1={-40} x2={1060} y2={250} stroke={INK} strokeWidth={6} />
        <path d="M1000 310 Q1060 200 1120 310Z" fill="#1d9a8f" />
        <ellipse cx={1060} cy={312} rx={26} ry={9} fill={night ? "#7f8a8c" : "#fff1b8"} />
      </g>
      <Layer cam={cam} depth={1}>
        <rect x={690} y={560} width={44} height={300} rx={14} fill="#6f4a2f" />
        <rect x={1290} y={690} width={36} height={170} rx={12} fill="#6f4a2f" />
        <rect x={726} y={730} width={574} height={90} rx={16} fill="#fff6e3" />
        {pillow && <Pillow x={PILLOW.x} y={PILLOW.y} />}
        <rect x={1350} y={722} width={250} height={138} rx={8} fill="#8a5c3b" />
        <rect x={1372} y={778} width={206} height={8} rx={4} fill="#6f4a2f" />
        <circle cx={1475} cy={810} r={7} fill="#6f4a2f" />
        <AlarmClock shake={shake} ringing={ringing} hands={hands} hammer={hammer} glow={clockGlow} />
        <Phone lit={phoneLit} rock={phoneRock} />
      </Layer>
      {Array.from({ length: 22 }, (_, i) => {
        let x = 300 + noise(i) * 1000 + Math.sin(t / 30 + i) * 26;
        let y = 300 + ((noise(i + 40) * 600 - t * (0.5 + noise(i + 9))) % 600 + 600) % 600;
        if (stir && stir.push > 0) {
          const dx = x - stir.x;
          const dy = y - stir.y;
          const d = Math.max(1, Math.hypot(dx, dy));
          const k = Math.max(0, 1 - d / stir.r) * stir.push;
          x += (dx / d) * k;
          y += (dy / d) * k - k * 0.3;
        }
        return <circle key={i} cx={x} cy={y} r={2.5 + noise(i + 3) * 4} fill="#fffbe6" opacity={night ? 0.25 : 0.75} />;
      })}
    </>
  );
};

/** The duvet over the bed: drawn in front of the actors, so whoever is in bed is tucked in. */
export const BedroomFront: React.FC<{ cam: Camera; children?: React.ReactNode }> = ({ cam, children }) => (
  <Layer cam={cam} depth={1}>
    <path d="M905 696 Q1100 660 1302 700 V808 H905Z" fill="#1d7f9a" />
    <path d="M905 744 H1302 M905 772 H1302" stroke="#f3e9d7" strokeWidth={9} opacity={0.6} />
    {children}
  </Layer>
);

export type CatPose = "curl" | "sit" | "leap";

/** The cat. (x, y) is its feet for "sit" and "curl" and its middle for "leap". It faces right at facing 1.
 *  `rot` tilts a leap (degrees, nose down positive). `spikes` puts its fur on end. `lick` raises a paw. */
export const Cat: React.FC<{
  x: number; y: number; pose: CatPose; facing?: 1 | -1; rot?: number; scale?: number;
  look?: number; blink?: boolean; spikes?: boolean; lick?: boolean;
}> = ({ x, y, pose, facing = 1, rot = 0, scale = 0.85, look = 0, blink = false, spikes = false, lick = false }) => {
  const eyeRy = blink ? 0.9 : pose === "leap" ? 7 : 5.5;
  if (pose === "curl") {
    return (
      <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
        <ellipse cx={0} cy={-24} rx={56} ry={26} fill={FUR} />
        <path d="M-30 -44 q8 14 0 26 M-6 -48 q8 16 0 30 M18 -46 q8 14 0 26" stroke={STRIPE} strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M-52 -14 Q-24 8 38 -2" stroke={FUR} strokeWidth={13} fill="none" strokeLinecap="round" />
        <circle cx={40} cy={-30} r={22} fill={FUR} />
        <path d="M26 -44 L28 -66 L42 -50Z M46 -50 L60 -64 L60 -40Z" fill={FUR} />
        <path d="M30 -32 q5 4 10 0 M46 -32 q5 4 10 0" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d="M41 -24 l4 3 l4 -3Z" fill={PINK} />
      </g>
    );
  }
  if (pose === "leap") {
    return (
      <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale}) rotate(${rot})`}>
        <path d="M-56 -4 Q-96 -24 -122 -62" stroke={FUR} strokeWidth={13} fill="none" strokeLinecap="round" />
        <path d="M-40 8 L-84 24 M-34 10 L-74 36" stroke={FUR} strokeWidth={12} strokeLinecap="round" />
        {spikes && <path d="M-40 -16 l6 -16 l6 14 l6 -18 l6 16 l6 -18 l6 16 l6 -16 l6 14 l6 -16 l6 14 l6 -14 l4 12" fill={FUR} />}
        <ellipse cx={0} cy={0} rx={62} ry={21} fill={FUR} />
        <ellipse cx={8} cy={9} rx={38} ry={9} fill={BELLY} />
        <path d="M-28 -18 q6 12 0 24 M-6 -20 q6 14 0 28 M16 -20 q6 12 0 24" stroke={STRIPE} strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M40 8 L84 22 M46 6 L92 8" stroke={FUR} strokeWidth={12} strokeLinecap="round" />
        <circle cx={66} cy={-14} r={24} fill={FUR} />
        <path d="M48 -26 L36 -48 L58 -36Z M68 -36 L72 -60 L84 -32Z" fill={FUR} />
        <circle cx={60 + look * 3} cy={-17} r={eyeRy} fill={INK} /><circle cx={78 + look * 3} cy={-17} r={eyeRy} fill={INK} />
        {!blink && <><circle cx={62 + look * 3} cy={-20} r={2.2} fill="#fff" /><circle cx={80 + look * 3} cy={-20} r={2.2} fill="#fff" /></>}
        <ellipse cx={72} cy={-2} rx={4} ry={5} fill={INK} />
        <path d="M74 -6 L104 -12 M74 -4 L104 2 M64 -6 L40 -14" stroke={INK} strokeWidth={1.6} opacity={0.6} />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * facing} ${scale})`}>
      <path d="M-24 -8 Q-74 -8 -64 -54" stroke={FUR} strokeWidth={12} fill="none" strokeLinecap="round" />
      <ellipse cx={-4} cy={-40} rx={31} ry={40} fill={FUR} />
      <path d="M-26 -58 q12 6 0 16 M-30 -36 q12 6 0 16" stroke={STRIPE} strokeWidth={6} fill="none" strokeLinecap="round" />
      <ellipse cx={9} cy={-34} rx={14} ry={26} fill={BELLY} />
      <rect x={2} y={-24} width={11} height={24} rx={5} fill={FUR} />
      {lick ? <ellipse cx={26} cy={-70} rx={7} ry={12} fill={FUR} transform="rotate(-30 26 -70)" /> : <rect x={16} y={-24} width={11} height={24} rx={5} fill={FUR} />}
      <circle cx={14} cy={-88} r={25} fill={FUR} />
      <path d="M-4 -102 L-2 -128 L14 -110Z M18 -110 L34 -128 L36 -102Z" fill={FUR} />
      <path d="M0 -104 L1 -118 L9 -108Z M22 -108 L31 -118 L31 -104Z" fill={PINK} />
      <path d="M6 -106 q4 6 0 10 M14 -108 q4 6 0 10" stroke={STRIPE} strokeWidth={4} fill="none" strokeLinecap="round" />
      {blink || lick ? (
        <path d={`M3 -88 q5 4 10 0 M19 -88 q5 4 10 0`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
      ) : (
        <>
          <ellipse cx={8 + look * 3} cy={-89} rx={3.6} ry={eyeRy} fill={INK} /><ellipse cx={24 + look * 3} cy={-89} rx={3.6} ry={eyeRy} fill={INK} />
          <circle cx={9 + look * 3} cy={-91} r={1.5} fill="#fff" /><circle cx={25 + look * 3} cy={-91} r={1.5} fill="#fff" />
        </>
      )}
      <path d="M13 -80 l4 3 l4 -3Z" fill={PINK} />
      <path d="M13 -76 L-12 -74 M13 -74 L-10 -68 M21 -76 L46 -74 M21 -74 L44 -68" stroke={INK} strokeWidth={1.5} opacity={0.6} />
    </g>
  );
};
