// Helpers for "The Board" (TheBoard.tsx): the paper diagrams, each pinned over the lamppost at night, and the city at
// night from above. Facts are drawn, never written: the only marks are numbers the narrator says (6, 1975, 160, 4,
// 1948). Each diagram takes `t(p)`, the frame p of the way through its narration line, so it draws itself on the words.
import { interpolate } from "remotion";
import { Sky, Skyline } from "@whatif/kit/sets/common";
import type { Camera } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { CRIMSON, INK, PAPER, TEAL } from "@whatif/kit/theme";
import { Sheet } from "../kit";
import { noise, PASTELS, ramp } from "../shared";
import { Deep } from "../sets/common";

type At = (p: number) => number;

/** A number stamped on the paper in ink tiles, the card's own lettering. */
export const Stamp: React.FC<{ frame: number; at: number; x: number; y: number; text: string; size?: number; color?: string }> = ({
  frame, at, x, y, text, size = 80, color = INK,
}) => {
  if (frame < at) return null;
  const s = interpolate(frame, [at, at + 6], [1.4, 1], { extrapolateRight: "clamp" });
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(-4)`} opacity={Math.min(1, (frame - at) / 4)}>
      {text.split("").map((ch, i, all) => {
        const cx = (i - (all.length - 1) / 2) * size * 0.64;
        return (
          <g key={i} transform={`translate(${cx} 0)`}>
            <rect x={-size * 0.29} y={-size * 0.44} width={size * 0.58} height={size * 0.88} rx={size * 0.08} fill={color} stroke={INK} strokeWidth={3} />
            <text x={0} y={size * 0.27} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size * 0.7} fill={PAPER}>{ch}</text>
          </g>
        );
      })}
    </g>
  );
};

/** An ink figure on paper: a pastel head and a stick body; `arm` points the front arm (degrees from down, 90 forward). */
const InkMan: React.FC<{ x: number; y: number; s?: number; head?: string; arm?: number; facing?: 1 | -1 }> = ({ x, y, s = 1, head = PASTELS[0], arm = 10, facing = 1 }) => {
  const a = (arm * Math.PI) / 180;
  return (
    <g transform={`translate(${x} ${y}) scale(${facing * s} ${s})`}>
      <line x1={0} y1={-40} x2={0} y2={-110} stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <line x1={0} y1={-40} x2={-16} y2={0} stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <line x1={0} y1={-40} x2={16} y2={0} stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <line x1={0} y1={-98} x2={Math.sin(a) * 62} y2={-98 + Math.cos(a) * 62} stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <circle cx={0} cy={-136} r={26} fill={head} stroke={INK} strokeWidth={5} />
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ 91: the tracked drivers

/** A car with a small box on its dashboard and a teal light; a brake pedal; a tally of hard brakes, then the same tally
 *  six months on, a fifth shorter (ten marks, then eight). */
export const DriveSheet: React.FC<{ frame: number; t: At }> = ({ frame, t }) => {
  const car = "M120 560 L190 450 L330 400 L560 400 L650 470 L760 485 L760 575 L120 575 Z";
  const blink = Math.floor(frame / 10) % 2 === 0;
  const mark = (row: number, i: number, at: number, color: string) => (
    <DrawLine key={`${row}-${i}`} d={`M${900 + i * 52} ${row} v-110`} from={at} to={at + 5} color={color} width={12} />
  );
  return (
    <Sheet frame={frame} at={t(0)} x={960} y={540} w={1500} h={820}>
      <DrawLine d={car} from={t(0.02)} to={t(0.2)} color={INK} width={10} />
      <DrawLine d="M250 590 a50 50 0 1 0 0.1 0" from={t(0.12)} to={t(0.2)} color={INK} width={10} />
      <DrawLine d="M640 590 a50 50 0 1 0 0.1 0" from={t(0.14)} to={t(0.22)} color={INK} width={10} />
      <DrawLine d="M340 410 L360 470 M520 410 L560 470" from={t(0.16)} to={t(0.22)} color={INK} width={6} />
      {frame >= t(0.24) && (
        <g>
          <rect x={430} y={440} width={70} height={40} rx={6} fill="#3a4150" stroke={INK} strokeWidth={5} />
          <circle cx={465} cy={460} r={12} fill={blink ? "#7fe0d4" : TEAL} />
          {blink && <circle cx={465} cy={460} r={30} fill={TEAL} opacity={0.25} />}
        </g>
      )}
      {/* the brake pedal and a foot on it */}
      <DrawLine d="M300 490 L330 545 M310 545 h50" from={t(0.3)} to={t(0.36)} color={CRIMSON} width={10} />
      {/* the tallies: hard brakes, then six months on */}
      {Array.from({ length: 10 }, (_, i) => mark(320, i, t(0.4) + i * 4, CRIMSON))}
      <Stamp frame={frame} at={t(0.6)} x={830} y={510} text="6" size={70} color={TEAL} />
      <DrawLine d="M830 450 v-40" from={t(0.6)} to={t(0.63)} color={INK} width={6} />
      {Array.from({ length: 8 }, (_, i) => mark(640, i, t(0.66) + i * 4, CRIMSON))}
      {frame >= t(0.84) && [8, 9].map((i) => (
        <rect key={i} x={900 + i * 52 - 6} y={530} width={12} height={110} fill="none" stroke={INK} strokeWidth={3} strokeDasharray="10 8" opacity={0.6} />
      ))}
    </Sheet>
  );
};

// ------------------------------------------------------------------------------------------------ 92: the curve

/** A smooth curve; a hand presses down on it; the curve breaks under the hand and the far half falls away. */
export const CurveSheet: React.FC<{ frame: number; t: At }> = ({ frame, t }) => {
  const press = ramp(frame, t(0.36), t(0.56));
  const snap = ramp(frame, t(0.6), t(0.72));
  const sag = ramp(frame, t(0.72), t(0.98));
  const left = "M150 640 C350 640 500 560 750 430";
  const right = "M750 430 C960 330 1150 250 1350 230";
  const handY = interpolate(press, [0, 1], [-260, 300]);
  return (
    <Sheet frame={frame} at={t(0)} x={960} y={540} w={1500} h={820}>
      <Stamp frame={frame} at={t(0.12)} x={190} y={130} text="1975" size={64} />
      <DrawLine d={left} from={t(0.04)} to={t(0.18)} color={TEAL} width={16} />
      {frame < t(0.6) ? (
        <DrawLine d={right} from={t(0.18)} to={t(0.32)} color={TEAL} width={16} />
      ) : (
        <g transform={`translate(${750 + snap * 20} ${430 + snap * 30 + sag * 40}) rotate(${snap * 38 + sag * 14}) translate(-750 -430)`}>
          <path d={right} fill="none" stroke={CRIMSON} strokeWidth={16} strokeLinecap="round" />
        </g>
      )}
      {frame >= t(0.6) && <path d="M735 400 l18 22 l-14 12 l20 26" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" opacity={snap} />}
      {/* the hand, from above, palm down */}
      {frame >= t(0.34) && (
        <g transform={`translate(760 ${handY})`}>
          <rect x={-58} y={-900} width={116} height={820} rx={50} fill="#3b3e47" stroke={INK} strokeWidth={6} />
          {[-42, -14, 14, 42].map((fx, i) => <rect key={fx} x={fx - 13} y={-30} width={26} height={110 - Math.abs(i - 1.5) * 12} rx={13} fill="#d9c9a6" stroke={INK} strokeWidth={5} />)}
          <ellipse cx={0} cy={-60} rx={74} ry={64} fill="#d9c9a6" stroke={INK} strokeWidth={6} />
        </g>
      )}
    </Sheet>
  );
};

// ------------------------------------------------------------------------------------------------ 94: the desks

/** A hundred and sixty small desks, each with a mountain of paper; one desk with four cards; two bars above, almost
 *  the same height. */
export const DesksSheet: React.FC<{ frame: number; t: At }> = ({ frame, t }) => {
  const grow = ramp(frame, t(0.16), t(0.46));
  const desks = [];
  for (let r = 0; r < 10; r++) {
    const on = t(0.04) + r * 7;
    if (frame < on) continue;
    for (let c = 0; c < 16; c++) {
      const x = 90 + c * 64, y = 330 + r * 54;
      const h = 8 + grow * (16 + noise(r * 16 + c) * 16);
      desks.push(
        <g key={`${r}-${c}`}>
          <rect x={x - 22} y={y} width={44} height={8} fill={INK} />
          <line x1={x - 18} y1={y + 8} x2={x - 18} y2={y + 26} stroke={INK} strokeWidth={4} />
          <line x1={x + 18} y1={y + 8} x2={x + 18} y2={y + 26} stroke={INK} strokeWidth={4} />
          <path d={`M${x - 16} ${y} L${x} ${y - h} L${x + 16} ${y}Z`} fill="#f7f1e3" stroke="#a89878" strokeWidth={2} />
        </g>,
      );
    }
  }
  const one = t(0.56);
  const bars = ramp(frame, t(0.7), t(0.86));
  return (
    <Sheet frame={frame} at={t(0)} x={960} y={540} w={1600} h={900}>
      <Stamp frame={frame} at={t(0.03)} x={130} y={110} text="160" size={64} />
      {desks}
      {frame >= one && (
        <g>
          <rect x={1260} y={760} width={200} height={14} fill={INK} />
          <line x1={1275} y1={774} x2={1275} y2={830} stroke={INK} strokeWidth={6} />
          <line x1={1445} y1={774} x2={1445} y2={830} stroke={INK} strokeWidth={6} />
          {[0, 1, 2, 3].map((i) => {
            const p = ramp(frame, one + i * 5, one + i * 5 + 8);
            return <rect key={i} x={1290 + i * 40} y={720 - p * 10} width={34} height={44} rx={4} fill={PAPER} stroke={INK} strokeWidth={4} transform={`rotate(${(i - 1.5) * 8} ${1307 + i * 40} 742)`} opacity={p} />;
          })}
          <Stamp frame={frame} at={one + 24} x={1540} y={740} text="4" size={60} color={TEAL} />
        </g>
      )}
      {bars > 0 && (
        <g>
          <rect x={540} y={290 - 200 * bars} width={110} height={200 * bars} fill={TEAL} stroke={INK} strokeWidth={5} />
          <rect x={1305} y={680 - 186 * bars} width={110} height={186 * bars} fill={TEAL} stroke={INK} strokeWidth={5} opacity={0.85} />
          <line x1={500} y1={90} x2={1460} y2={90} stroke={INK} strokeWidth={3} strokeDasharray="12 10" opacity={bars * 0.5} />
        </g>
      )}
    </Sheet>
  );
};

// ------------------------------------------------------------------------------------------------ 97-98: the bank and the comet

/** A tall sheet: below, a man pointing at a bank and a queue growing outside it; above, a comet on a dotted orbit, a
 *  small figure pointing at it, and the comet not moving; at the end, a person under a card, who moves when pointed at. */
export const ProphetSheet: React.FC<{ frame: number; t: At; u: At }> = ({ frame, t, u }) => {
  const queue = Array.from({ length: 9 }, (_, i) => t(0.24) + i * 8);
  const jab = frame >= u(0) ? Math.sin((frame - u(0)) / 7) * 10 : 0;
  const person = ramp(frame, u(0.62), u(0.78));
  const turnToPerson = frame >= u(0.55);
  return (
    <Sheet frame={frame} at={t(0)} x={960} y={720} w={1500} h={1480} tilt={-1.5}>
      <Stamp frame={frame} at={t(0.06)} x={180} y={890} text="1948" size={60} />
      {/* the bank: steps, columns, a pediment */}
      <DrawLine d="M520 1220 h460 M540 1190 h420 M560 1160 V980 M660 1160 V980 M760 1160 V980 M860 1160 V980 M940 1160 V980 M540 980 h420 L750 880 Z" from={t(0.02)} to={t(0.16)} color={INK} width={9} />
      {frame >= t(0.14) && <InkMan x={330} y={1220} s={1.1} head={PASTELS[4]} arm={frame >= t(0.18) ? 80 : 10} />}
      {queue.map((at, i) => frame >= at && (
        <InkMan key={i} x={1030 + i * 48} y={1220} s={0.62} head={PASTELS[(i + 2) % PASTELS.length]} facing={-1} />
      ))}
      {/* the comet's orbit, the comet, the one who points */}
      <DrawLine d="M250 420 A520 220 0 1 1 1250 420 A520 220 0 1 1 250 420" from={t(0.62)} to={t(0.74)} color={INK} width={5} dash />
      {frame >= t(0.7) && (
        <g transform="translate(1180 270)">
          <path d="M0 0 L-260 -70 L-250 -40 L-300 -20 L-240 -6 Z" fill="#f2b632" opacity={0.7} />
          <circle r={34} fill="#f2b632" stroke={INK} strokeWidth={6} />
        </g>
      )}
      {frame >= t(0.76) && <InkMan x={420} y={760} s={1} head={PASTELS[1]} arm={turnToPerson ? 95 : 150 + jab} />}
      {/* a person under a card: pointed at, the person moves */}
      {frame >= u(0.5) && (
        <g transform={`translate(${880 + person * 170} 760)`}>
          <InkMan x={0} y={0} s={1} head={PASTELS[3]} arm={10 + person * 40} />
          <line x1={0} y1={-170} x2={0} y2={-240} stroke={INK} strokeWidth={3} />
          <rect x={-60} y={-280} width={120} height={50} rx={8} fill={person > 0.5 ? "#e3f2ee" : PAPER} stroke={INK} strokeWidth={4} />
          <rect x={-40} y={-262} width={80} height={14} rx={7} fill={person > 0.5 ? TEAL : CRIMSON} />
        </g>
      )}
      {frame >= u(0.62) && <DrawLine d="M980 790 h120" from={u(0.62)} to={u(0.74)} color={CRIMSON} width={8} dash />}
    </Sheet>
  );
};

// ------------------------------------------------------------------------------------------------ 99: the city from above

/** The city at night from above: teal lights on lampposts in rows to the horizon, a small figure under each near one,
 *  a thousand ticks at once like rain, and two crimson dots by the food court's roof. */
export const CityNight: React.FC<{ cam: Camera; frame: number }> = ({ cam, frame }) => {
  const H = 330;
  const rows = [];
  for (let z = 1.3; z < 34; z *= 1.16) rows.push(z);
  const lights: React.ReactNode[] = [];
  const ticks: string[] = [];
  const dots: string[] = [];
  const people: React.ReactNode[] = [];
  rows.forEach((z, ri) => {
    const y = H + 760 / z;
    const step = 1500 / z;
    const n = Math.ceil(2600 / step);
    for (let i = -n; i <= n; i++) {
      const x = 960 + (i + (ri % 2) * 0.5) * step;
      if (Math.abs(x - 960) < 70 && z > 2.3 && z < 3.3) continue; // the food court's roof
      const r = Math.max(2.6, 34 / z);
      dots.push(`M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`);
      const seed = ri * 211 + i * 7;
      if (noise(seed + Math.floor(frame / 4) * 13) < 0.06) ticks.push(`M${x - r * 0.8} ${y - r * 2.6}h${r * 1.6}v${r * 1.1}h${-r * 1.6}Z`);
      if (z < 4.5 && ri % 1 === 0 && i % 2 === 0) {
        const s = 30 / z;
        people.push(
          <g key={`${ri}-${i}`} transform={`translate(${x} ${y + s * 4.2})`}>
            <line x1={0} y1={-s * 2.5} x2={0} y2={0} stroke="#0b0d1a" strokeWidth={s * 0.6} strokeLinecap="round" />
            <circle cy={-s * 3} r={s * 0.75} fill={PASTELS[Math.abs(seed) % PASTELS.length]} opacity={0.8} />
          </g>,
        );
      }
    }
  });
  const roof = { x: 960, y: H + 760 / 2.75 };
  return (
    <g>
      <Deep cam={cam} depth={0.05} flat><Sky id="city-night" mood="night" x={-1400} y={-900} w={4800} h={1240} sunAt={{ x: 1500, y: 90 }} /></Deep>
      <Deep cam={cam} depth={0.1} flat><Skyline mood="night" from={-1400} to={3400} base={H + 10} tall={170} seed={3} /></Deep>
      <Deep cam={cam} depth={0.6} flat>
        <rect x={-1400} y={H} width={4800} height={2000} fill="#1a2046" />
        {rows.map((z, i) => <line key={i} x1={-1400} y1={H + 760 / z + 10 / z} x2={3400} y2={H + 760 / z + 10 / z} stroke="#1c2244" strokeWidth={Math.max(1, 14 / z)} />)}
        <path d={dots.join("")} fill={TEAL} opacity={0.35} transform="scale(1 1)" strokeWidth={10} stroke={TEAL} strokeOpacity={0.25} />
        <path d={dots.join("")} fill="#9ff0e4" />
        {people}
        <path d={ticks.join("")} fill="#e3f2ee" />
        {/* the food court's long low roof, and the two crimson dots by it */}
        <rect x={roof.x - 150} y={roof.y - 40} width={300} height={56} rx={6} fill="#2a2f45" stroke="#0b0d1a" strokeWidth={4} />
        <rect x={roof.x - 140} y={roof.y + 10} width={280} height={8} fill="#ffcf7a" opacity={0.6} />
        {/* the lamp over them: one shade dimmer than every other teal light in the city */}
        <line x1={roof.x + 60} y1={roof.y + 60} x2={roof.x + 60} y2={roof.y - 70} stroke="#0b0d1a" strokeWidth={5} />
        <circle cx={roof.x + 60} cy={roof.y - 78} r={30} fill={TEAL} opacity={0.12} />
        <circle cx={roof.x + 60} cy={roof.y - 78} r={11} fill="#3f8f86" stroke="#0b0d1a" strokeWidth={2} />
        {[-26, 26].map((dx) => (
          <g key={dx}>
            <circle cx={roof.x + dx} cy={roof.y + 50} r={44} fill={CRIMSON} opacity={0.3} />
            <circle cx={roof.x + dx} cy={roof.y + 50} r={14} fill={CRIMSON} stroke="#0b0d1a" strokeWidth={2} />
          </g>
        ))}
      </Deep>
    </g>
  );
};

/** Where the two crimson dots are in the city wide (layer depth 0.6, authored at REF). */
export const CRIMSON_DOTS = { x: 960, y: 330 + 760 / 2.75 + 50, depth: 0.6 };
