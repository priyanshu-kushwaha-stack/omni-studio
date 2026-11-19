// Line 95 of "The Country Holds Its Breath" (HoldsBreath.tsx; v7, outside review of v6, top-15 #7): the grounded-flights
// fact as a kinetic montage instead of one static runway card. A jet taxis up to the runway ("In November 2025"); the
// tower raises a STOP paddle ("South Korea stopped its planes"); the nose wheel rolls to a halt at the hold line
// ("taking off"); planes stack up circling in the sky ("and landing, for 35 minutes"); the empty runway with the paper
// plane held still, one second; then one pencil on one answer sheet in the silent hall ("so their noise wouldn't
// disturb the students"). Also the sheet's corner that match-cuts into the day pad's page 1 (line 96).
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND } from "@whatif/kit/rig/pose";
import { Sky } from "@whatif/kit/sets";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { drift, insert } from "@whatif/kit/stage/shots";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, PAPER, TEAL } from "@whatif/kit/theme";
import { camAt, linear, mix, PASTELS, ramp } from "../shared";
import { Deep } from "../sets/common";
import { TopHand } from "./HoldsBreath.Choc";
import { GroundedJet, RunwayBack } from "./HoldsBreath.Parts";

const World: React.FC<{ cam: Camera; back: React.ReactNode; actors?: React.ReactNode }> = ({ cam, back, actors = null }) => (
  <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} />
);

// ------------------------------------------------------------------------------------------------ the jet taxis up

/** The airport: a jet taxis in from the right and brakes beside the threshold (nose to the left). */
export const TaxiShot: React.FC<{ frame: number; a: number; b: number }> = ({ frame, a, b }) => {
  const roll = ramp(frame, a - 20, b - 10);
  const cam = drift(camAt(frame, [[a, { x: 1000, y: 560, zoom: 1.0 }], [b, { x: 1060, y: 560, zoom: 1.12 }]]), frame, "taxi", 2);
  return (
    <World cam={cam} back={<RunwayBack cam={cam} mood="morning" />}
      actors={<g transform={`translate(${mix(2350, 1480, roll)} 0) scale(-1 1) translate(${-0} 0)`}><GroundedJet x={0} y={706} scale={0.78} /></g>} />
  );
};

// ------------------------------------------------------------------------------------------------ the tower: STOP

/** The control tower's cab, close: a controller behind the glass raises a round red STOP paddle. */
export const TowerShot: React.FC<{ frame: number; a: number; b: number }> = ({ frame, a, b }) => {
  const up = ramp(frame, a + 4, a + 18);
  const cam = drift(camAt(frame, [[a, { x: 740, y: 640, zoom: 1.0 }], [b, { x: 750, y: 630, zoom: 1.06 }]]), frame, "tower", 2);
  const pose = { ...STAND, armF: [mix(20, 168, up), mix(30, 4, up)] as [number, number] };
  const paddle = (
    <g transform={`rotate(${mix(0, 180, up)})`}>
      <rect x={-6} y={0} width={12} height={110} fill="#6a6a70" stroke={INK} strokeWidth={3} />
      <g transform={`translate(0 160) rotate(${mix(0, 180, up)})`}>
        <circle r={78} fill={CRIMSON} stroke={INK} strokeWidth={7} />
        <circle r={64} fill="none" stroke={PAPER} strokeWidth={6} />
        <text y={20} transform="scale(-1 1)" textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill={PAPER}>STOP</text>
      </g>
    </g>
  );
  return (
    <World cam={cam}
      back={
        <>
          <Deep cam={cam} depth={0.1} flat><Sky id="tower" mood="morning" x={-1400} y={-800} w={4800} h={2600} sunAt={{ x: 300, y: 200 }} /></Deep>
          <Deep cam={cam} depth={1}>
            {/* the cab: a wide band of slanted glass on a concrete shaft */}
            <rect x={760} y={760} width={760} height={600} fill="#d9d2c2" stroke={INK} strokeWidth={6} />
            <path d="M640 330 L1640 330 L1560 760 L720 760Z" fill="#9fc0e0" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
            <rect x={600} y={270} width={1080} height={70} rx={10} fill="#c9c2b2" stroke={INK} strokeWidth={6} />
            <rect x={700} y={740} width={880} height={40} fill="#c9c2b2" stroke={INK} strokeWidth={6} />
          </Deep>
        </>
      }
      actors={
        <g>
          <Figure x={1220} y={1010} scale={1.25} facing={-1} pose={pose} head={PASTELS[5]} coat="#3b4a6b" brows="flat" lids={0.2} mouth="flat"
            look={{ x: 0.9, y: -0.2 }} time={frame} held={paddle} />
          {[880, 1080, 1280, 1480].map((x) => <path key={x} d={`M${x} 330 L${x - 20} 760`} stroke={INK} strokeWidth={8} />)}
          <path d="M680 520 L1600 520" stroke="#ffffff" strokeWidth={10} opacity={0.25} />
        </g>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ the wheel stops

/** The nose wheel, close, rolling to a halt at the yellow hold line; the strut dips once as it brakes. */
export const WheelShot: React.FC<{ frame: number; a: number; b: number; stop: number }> = ({ frame, a, b, stop }) => {
  // distance rolled: full speed, braking to zero at `stop` (the integral of a speed that ramps down)
  const speed = (f: number) => 1 - ramp(f, a + 4, stop);
  let dist = 0;
  for (let f = a; f < Math.min(frame, stop); f++) dist += 14 * speed(f);
  const roll = dist;
  const R = 150;
  const spin = (roll / R) * (180 / Math.PI);
  const dip = Math.sin(Math.PI * linear(frame, stop - 4, stop + 14)) * 18;
  const total = (() => { let d = 0; for (let f = a; f < stop; f++) d += 14 * speed(f); return d; })();
  const lineX = 1230 + (total - roll); // the hold line slides in under the wheel and stops just ahead of it
  const cam = drift(camAt(frame, [[a, { x: 960, y: 760, zoom: 1.0 }], [b, { x: 980, y: 760, zoom: 1.06 }]]), frame, "wheel", 1.5);
  return (
    <World cam={cam}
      back={
        <>
          <Deep cam={cam} depth={0.2} flat><Sky id="wheel" mood="morning" x={-1400} y={-800} w={4800} h={1600} sunAt={{ x: 1600, y: 120 }} /></Deep>
          <Deep cam={cam} depth={0.6} flat><rect x={-1400} y={700} width={4800} height={200} fill="#a9bf8f" /></Deep>
          <Deep cam={cam} depth={1}>
            <rect x={-1400} y={840} width={4800} height={900} fill="#6b6f78" />
            {Array.from({ length: 14 }, (_, i) => {
              const x = ((i * 260 - roll * 0.999) % 3640 + 3640) % 3640 - 800;
              return <rect key={i} x={x} y={900} width={120} height={14} fill="#5c606a" />;
            })}
            {[0, 46, 120, 166].map((dx, i) => (
              <path key={dx} d={`M${lineX + dx} 846 L${lineX + dx + 22} 846 L${lineX + dx + 60} 1080 L${lineX + dx + 38} 1080Z`} fill="#e8c23a"
                strokeDasharray={i > 1 ? "30 24" : undefined} opacity={i > 1 ? 0.85 : 1} />
            ))}
        <g transform={`translate(0 ${dip})`}>
          <path d="M-200 -40 L2200 -40 L2200 260 Q1200 330 -200 300Z" fill="#f2f0ea" stroke={INK} strokeWidth={8} />
          <rect x={-200} y={210} width={2400} height={22} fill={TEAL} />
          <rect x={880} y={280} width={170} height={60} rx={8} fill="#c9ced6" stroke={INK} strokeWidth={6} />
          <rect x={940} y={300} width={50} height={370} fill="#9aa3ad" stroke={INK} strokeWidth={6} />
          <g transform={`translate(965 ${840 - R - dip}) rotate(${spin})`}>
            <circle r={R} fill="#2a2d36" stroke={INK} strokeWidth={8} />
            <circle r={R * 0.55} fill="#9aa3ad" stroke={INK} strokeWidth={6} />
            {[0, 60, 120, 180, 240, 300].map((d) => <circle key={d} cx={R * 0.36 * Math.cos(d * Math.PI / 180)} cy={R * 0.36 * Math.sin(d * Math.PI / 180)} r={10} fill={INK} />)}
            <circle r={18} fill={INK} />
          </g>
        </g>

          </Deep>
        </>
      }
    />
  );
};

// ------------------------------------------------------------------------------------------------ the stack

const Jet: React.FC<{ x: number; y: number; dir: 1 | -1; s?: number }> = ({ x, y, dir, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
    <path d="M-70 0 Q-70 -16 -40 -16 L60 -16 Q80 -12 84 0 Q80 10 60 10 L-40 10 Q-70 10 -70 0Z" fill="#f2f0ea" stroke={INK} strokeWidth={5} />
    <path d="M-56 -12 L-80 -48 L-58 -48 L-30 -14Z" fill={TEAL} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M10 0 L-30 30 L-10 30 L34 2Z" fill="#c9ced6" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

/** Planes that can't land stack up circling over the city: one joins the loop, then another, and another. */
export const StackShot: React.FC<{ frame: number; a: number; b: number }> = ({ frame, a, b }) => {
  const n = 6;
  const cam = drift(camAt(frame, [[a, { x: 1100, y: 470, zoom: 1.05 }], [b, { x: 1060, y: 480, zoom: 0.95 }]]), frame, "stack", 2);
  const cx = 1180, cy = 430, rx = 520, ry = 150;
  return (
    <World cam={cam}
      back={
        <>
          <Deep cam={cam} depth={0.1} flat><Sky id="stack" mood="morning" x={-1400} y={-800} w={4800} h={2600} sunAt={{ x: 400, y: 160 }} /></Deep>
          <Deep cam={cam} depth={0.4} flat>
            <rect x={-1400} y={900} width={4800} height={600} fill="#a9bf8f" />
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={PAPER} strokeWidth={6} strokeDasharray="26 22" opacity={0.75} />
          </Deep>
        </>
      }
      actors={
        <g>
          {Array.from({ length: n }, (_, i) => {
            const join = mix(a, b - 12, i / n);
            if (frame < join) return null;
            const t = (frame - join) / 70 + i / n;
            const ang = t * Math.PI * 2;
            const x = cx + Math.cos(ang) * rx, y = cy + Math.sin(ang) * ry - i * 6;
            const enter = linear(frame, join, join + 10);
            return <Jet key={i} x={mix(2300, x, enter)} y={mix(200, y, enter)} dir={Math.sin(ang) > 0 ? -1 : 1} s={0.9} />;
          })}
        </g>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ the empty runway

/** The empty runway, nothing moving, the paper plane held still overhead. */
export const EmptyRunwayShot: React.FC<{ frame: number; a: number; b: number; plane: { x: number; y: number } }> = ({ frame, a, b, plane }) => {
  const cam = drift(camAt(frame, [[a, { x: 960, y: 520, zoom: 1.05 }], [b, { x: 960, y: 510, zoom: 1.1 }]]), frame, "empty", 1);
  return <World cam={cam} back={<RunwayBack cam={cam} mood="morning" plane={plane} />} />;
};

// ------------------------------------------------------------------------------------------------ the pencil

/** Your answer sheet from above in the silent hall: one teal pencil writing, line after line. `stop` freezes it. */
export const PencilShot: React.FC<{ frame: number; a: number; b: number; stop?: number }> = ({ frame, a, b, stop = Infinity }) => {
  const f = Math.min(frame, stop);
  const lines = 6;
  const per = 26;
  const k = (f - a) / per;
  const row = Math.min(lines - 1, Math.floor(k));
  const along = Math.min(1, k - row);
  const tip = { x: 640 + along * 560 + Math.sin(f * 1.3) * 4, y: 360 + row * 80 };
  const cam = drift(camAt(frame, [[a, insert(940, 560, 1.25)], [b, insert(960, 570, 1.4)]]), frame, "pencil", 1.5);
  return (
    <World cam={cam}
      back={
        <Deep cam={cam} depth={1}>
          <rect x={-1400} y={-800} width={4800} height={2600} fill="#c9a77a" />
          <rect x={520} y={160} width={820} height={940} rx={6} fill={PAPER} stroke={INK} strokeWidth={6} />
          <text x={600} y={260} fontFamily={FONT} fontWeight={800} fontSize={56} fill={INK} opacity={0.8}>ENGLISH · LISTENING</text>
          {Array.from({ length: lines }, (_, i) => (
            <g key={i}>
              <circle cx={590} cy={350 + i * 80} r={14} fill="none" stroke={INK} strokeWidth={4} />
              {i < row && <rect x={636} y={342 + i * 80} width={560} height={12} rx={6} fill="#4a4d58" opacity={0.7} />}
              {i === row && <rect x={636} y={342 + i * 80} width={Math.max(0, along * 560)} height={12} rx={6} fill="#4a4d58" opacity={0.7} />}
            </g>
          ))}
        </Deep>
      }
      actors={
        <g>
          <g transform={`translate(${tip.x} ${tip.y}) rotate(-35)`}>
            <rect x={-8} y={-200} width={16} height={190} rx={4} fill={TEAL} stroke={INK} strokeWidth={4} />
            <path d="M-8 -10 L8 -10 L0 8Z" fill="#e2c9a0" stroke={INK} strokeWidth={3} />
          </g>
          <TopHand x={tip.x + 70} y={tip.y - 90} from={{ x: 1500, y: 1300 }} />
        </g>
      } />
  );
};

/** Line 96, "Results come in a month.": the corner of your answer sheet, its page number "1" where the day pad's
 *  number will be, so the cut to the pad matches. */
export const CornerShot: React.FC<{ frame: number; a: number }> = ({ frame, a }) => {
  const cam = drift(insert(960, 540, 1.0), frame - a, "corner", 1);
  return (
    <World cam={cam}
      back={
        <Deep cam={cam} depth={1}>
          <rect x={-1400} y={-800} width={4800} height={2600} fill="#c9a77a" />
          <path d="M-200 150 L1800 150 L1800 1300 L-200 1300Z" fill={PAPER} stroke={INK} strokeWidth={6} />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={160} y={560 + i * 90} width={1100 - (i % 2) * 300} height={14} rx={7} fill="#4a4d58" opacity={0.6} />)}
          {/* the page number, where the day pad's number lands after the cut (DayPad: 1600, ~360) */}
          <circle cx={1600} cy={354} r={110} fill="none" stroke={INK} strokeWidth={6} />
          <text x={1600} y={404} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={140} fill={INK}>1</text>
        </Deep>
      } />
  );
};
