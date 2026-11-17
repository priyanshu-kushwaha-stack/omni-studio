// The leaflet, top-down on the kitchen table: paper sheets whose drawings draw themselves as the narrator explains.
// No words on the sheets; the only lettering is the three stamped tags (BRAIN, BAND, JAR).
//   page one   the sleeper and the band; the dotted thread, the pale second you at its desk; coins into a jar; a clock
//   the link   one laptop, three sleepers threaded to it, a ring round each head; the stamps
//   crumbs     a spoon with a drop, a speech bubble with a squiggle, a face that isn't yours; a tick
//   page two   a paper you, the head shaded in, one bulb beside it, lit dim (v7: "about twenty watts, a dim bulb")
//   page four  a wardrobe computer, its plug and a spinning coin meter; then a paper you lying flat, its meter at $0
import { interpolate } from "remotion";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { FONT } from "@whatif/kit/fonts";
import { INK, MUSTARD } from "@whatif/kit/theme";
import { Sheet, StampTag } from "../parts";
import { GHOST, ramp } from "../shared";

export const SHEET = { x: 960, y: 540, w: 1100, h: 720 };
/** A sheet-local point in world units (the sheet is drawn at SHEET, tilt -2, almost square to the frame). */
export const onSheet = (x: number, y: number) => ({ x: SHEET.x - SHEET.w / 2 + x, y: SHEET.y - SHEET.h / 2 + y });

const circle = (x: number, y: number, r: number) => `M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;
const W = 6;

/** Ink that draws itself from `a` over `n` frames. */
const Ink: React.FC<{ d: string; a: number; n?: number; color?: string; width?: number }> = ({ d, a, n = 12, color = INK, width = W }) => (
  <DrawLine d={d} from={a} to={a + n} color={color} width={width} />
);

const Pop: React.FC<{ frame: number; a: number; children: React.ReactNode; x: number; y: number }> = ({ frame, a, children, x, y }) => {
  if (frame < a) return null;
  const s = interpolate(frame, [a, a + 6, a + 10], [0.4, 1.12, 1], { extrapolateRight: "clamp" });
  return <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>{children}</g>;
};

/** A sleeper's head on a pillow with the band, at (x, y), drawn from frame a. */
const SleeperInk: React.FC<{ x: number; y: number; r: number; a: number; frame: number }> = ({ x, y, r, a, frame }) => (
  <g>
    <Ink d={`M${x - r * 2.4} ${y + r * 1.1} Q${x} ${y + r * 1.8} ${x + r * 2.4} ${y + r * 1.1}`} a={a} n={8} />
    <Ink d={circle(x, y, r)} a={a + 4} n={10} />
    <Ink d={`M${x - r * 0.75} ${y - r * 0.5} Q${x} ${y - r * 0.85} ${x + r * 0.75} ${y - r * 0.5}`} a={a + 14} n={6} width={W + 3} />
    {frame >= a + 20 && <circle cx={x + r * 0.45} cy={y - r * 0.7} r={r * 0.18} fill={GHOST.light} stroke={INK} strokeWidth={3} />}
  </g>
);

/** Page one: the deal, drawn, a piece per phrase. From `a` ("Wear the band to bed") the sleeper and the band; from `work`
 *  ("the company runs its work on your brain") the dotted thread and the pale second you at its desk; from `pays` ("the
 *  band pays you") a coin falls into a jar; from `hour` ("by the hour") a clock. */
export const PageOne: React.FC<{ frame: number; a: number; work: number; pays: number; hour: number }> = ({ frame, a, work, pays, hour }) => {
  const coins = [0, 1, 2, 3].filter((i) => frame >= pays + 16 + i * 6);
  return (
    <g>
      <SleeperInk x={260} y={520} r={56} a={a + 2} frame={frame} />
      <Ink d="M330 560 Q520 540 700 580 L740 640" a={a + 10} n={10} />
      <DrawLine d="M285 470 C330 360 470 280 560 250" from={work} to={work + 14} color={GHOST.light} width={9} dash />
      {/* the pale second you at its desk */}
      <Ink d={circle(600, 196, 38)} a={work + 12} n={8} color="#5fb8bd" />
      <Ink d="M600 234 V320 M600 262 L690 286 M562 320 H640 M572 320 V362 M628 320 V362" a={work + 16} n={10} color="#5fb8bd" />
      <Ink d="M670 296 H830 M690 296 V364 M810 296 V364 M705 296 L695 236 H770 L780 296" a={work + 20} n={12} />
      {/* the pay: coins into a jar, and the hour */}
      <Ink d="M890 460 V610 Q890 624 904 624 H996 Q1010 624 1010 610 V460 M880 452 H1020" a={pays - 4} n={10} />
      {coins.map((i) => <circle key={i} cx={950 + ((i % 2) * 2 - 1) * 20} cy={600 - i * 22} r={16} fill="#ffd36b" stroke={INK} strokeWidth={3} />)}
      {frame < pays + 28 && frame >= pays && <circle cx={840 + (frame - pays) * 3} cy={320 + ((frame - pays) % 14) * 16} r={14} fill="#ffd36b" stroke={INK} strokeWidth={3} />}
      <Ink d={circle(960, 170, 54)} a={hour} n={10} />
      <Ink d="M960 170 V132 M960 170 L988 184" a={hour + 8} n={6} />
    </g>
  );
};

/** One job, many bands; each brain stays its own. `rings` from frame `ringAt`. */
export const PageLink: React.FC<{ frame: number; a: number; ringAt: number }> = ({ frame, a, ringAt }) => {
  const heads = [250, 550, 850];
  return (
    <g>
      <Ink d="M480 170 L468 90 H630 L642 170 Z M440 170 H680" a={a + 2} n={12} />
      {heads.map((x, i) => (
        <g key={x}>
          <SleeperInk x={x} y={430} r={46} a={a + 8 + i * 6} frame={frame} />
          <DrawLine d={`M${x + 20} ${398} C${x + 20} 300 ${560 + (i - 1) * 30} 260 ${560 + (i - 1) * 30} 175`} from={a + 22 + i * 6} to={a + 36 + i * 6} color={GHOST.light} width={8} dash />
          <DrawLine d={circle(x, 445, 112)} from={ringAt + i * 8} to={ringAt + i * 8 + 14} color="#d8344f" width={6} />
        </g>
      ))}
    </g>
  );
};

/** The crumbs: a taste, a word, a face; then the leaflet's tick ("harmless"). */
export const PageCrumbs: React.FC<{ frame: number; taste: number; word: number; face: number; tick: number }> = ({ frame, taste, word, face, tick }) => (
  <g>
    <Pop frame={frame} a={taste} x={250} y={340}>
      <path d="M190 400 L290 300" stroke="#9aa1ab" strokeWidth={14} strokeLinecap="round" />
      <ellipse cx={300} cy={290} rx={34} ry={22} fill="#b8bec8" stroke={INK} strokeWidth={4} transform="rotate(-45 300 290)" />
      <path d="M320 330 Q332 352 320 362 Q308 352 320 330Z" fill="#e6a23c" stroke={INK} strokeWidth={3} />
    </Pop>
    <Pop frame={frame} a={word} x={550} y={330}>
      <path d="M450 260 H650 Q670 260 670 280 V370 Q670 390 650 390 H540 L505 425 L512 390 H450 Q430 390 430 370 V280 Q430 260 450 260Z" fill="#fff" stroke={INK} strokeWidth={5} />
      <path d="M465 325 q15 -30 30 0 t30 0 t30 0 t30 0 t30 0" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    </Pop>
    <Pop frame={frame} a={face} x={850} y={330}>
      <circle cx={850} cy={330} r={78} fill="#c9a0d6" stroke={INK} strokeWidth={5} opacity={0.85} />
      <circle cx={826} cy={316} r={9} fill={INK} /><circle cx={872} cy={316} r={9} fill={INK} />
      <path d="M822 360 Q850 340 878 360" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <path d="M770 300 Q850 210 930 300" fill="none" stroke={INK} strokeWidth={10} />
    </Pop>
    {/* the tick sits right of the crumbs: the CRUMBS card is up, lower left, when "harmless" is said */}
    <DrawLine d="M880 520 L940 580 L1060 460" from={tick} to={tick + 10} color="#1d9a8f" width={16} />
  </g>
);

/** Page two: a paper you, the head shaded in from `head` ("Your brain"), a bulb that glows beside it from `bulb` ("about
 *  twenty watts") and dims from `dim` ("unused power"). */
export const PageTwo: React.FC<{ frame: number; a: number; head: number; bulb: number }> = ({ frame, a, head, bulb }) => {
  const sh = ramp(frame, head, head + 14);
  // v7: one dim bulb, lit low on "twenty watts" and held there (never a bright bulb that dims)
  const glow = 0.32 * ramp(frame, bulb, bulb + 18);
  return (
    <g>
      <circle cx={300} cy={200} r={66} fill="#e6a0a0" opacity={0.8 * sh} />
      <Ink d={circle(300, 200, 70)} a={a + 2} n={10} />
      <Ink d="M300 270 V480 M300 330 L220 420 M300 330 L380 420 M300 480 L240 640 M300 480 L360 640" a={a + 10} n={16} />
      {/* the head's power, out to the bulb */}
      <DrawLine d="M376 200 C460 170 560 250 700 290" from={bulb - 6} to={bulb + 8} color="#1d9a8f" width={6} dash />
      {/* the bulb */}
      {glow > 0.02 && <circle cx={820} cy={300} r={170} fill="#ffe39a" opacity={0.45 * glow} />}
      <circle cx={820} cy={300} r={78} fill={glow > 0.05 ? `rgba(255,227,154,${0.35 + 0.65 * glow})` : "#f3e9d7"} stroke={INK} strokeWidth={6} opacity={frame >= bulb - 12 ? 1 : 0} />
      <Ink d="M790 376 H850 V420 H790 Z M800 440 H840" a={bulb - 10} n={10} />
      {frame >= bulb - 12 && <path d="M800 320 L812 280 L828 320 L840 280" fill="none" stroke={INK} strokeWidth={4} opacity={0.6} />}
    </g>
  );
};

/** A coin meter: a little box with a dial of digits; `spin` 0..1 rolls them (a running cost), `value` when still. */
const Meter: React.FC<{ x: number; y: number; frame: number; spin: number; value: string }> = ({ x, y, frame, spin, value }) => {
  const digits = value.split("");
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-110} y={-60} width={220} height={120} rx={14} fill="#f3e9d7" stroke={INK} strokeWidth={6} />
      <circle cx={-78} cy={-30} r={14} fill="#ffd36b" stroke={INK} strokeWidth={3} />
      {digits.map((d, i) => (
        <g key={i} transform={`translate(${-40 + i * 44} 8)`}>
          <rect x={-18} y={-30} width={36} height={60} rx={5} fill="#2f3542" />
          <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={MUSTARD}>
            {spin > 0.02 && d !== "0" ? String((Math.floor(frame / (2 + i)) + i * 3) % 10) : d}
          </text>
        </g>
      ))}
    </g>
  );
};

/** Page four: why not a computer. A paper computer the size of a wardrobe, its plug, and a coin meter beside it, all
 *  drawn when the page opens; from `cost` ("Computers cost money to run") the meter spins; from `lying` ("You're already
 *  lying there") a paper you lies flat beside it, its meter at nothing. */
export const PageFour: React.FC<{ frame: number; a: number; cost: number; lying: number }> = ({ frame, a, cost, lying }) => {
  const spin = frame >= cost ? 1 : 0;
  const lit = Math.floor(frame / 6) % 3;
  return (
    <g>
      {/* the wardrobe computer */}
      <Ink d="M120 110 H360 V620 H120 Z" a={a} n={10} />
      {[0, 1, 2, 3, 4, 5].map((i) => <Ink key={i} d={`M150 ${170 + i * 60} H330`} a={a + 4} n={6} />)}
      {[0, 1, 2].map((i) => frame >= a + 8 && <circle key={i} cx={170 + i * 30} cy={140} r={8} fill={i === lit ? "#7ff0e6" : "#9aa1ab"} stroke={INK} strokeWidth={2} />)}
      {/* its plug, into the wall */}
      <Ink d="M360 560 C430 560 430 640 500 640 H520 M520 624 V656 M520 632 H540 M520 648 H540" a={a + 6} n={10} />
      {frame >= a + 10 && <Meter x={440} y={190} frame={frame} spin={spin} value="$480" />}
      {frame >= cost && frame < cost + 40 && [0, 1, 2].map((i) => {
        const t = ((frame - cost) / 40 + i / 3) % 1;
        return <circle key={i} cx={560 + t * 60} cy={170 - t * 120} r={13} fill="#ffd36b" stroke={INK} strokeWidth={3} opacity={1 - t} />;
      })}
      {/* the paper you, lying flat, its meter at nothing */}
      {frame >= lying && (
        <g>
          <Ink d="M690 560 Q850 520 1040 560" a={lying} n={8} />
          <Ink d={circle(720, 500, 44)} a={lying + 2} n={8} />
          <Ink d="M764 500 H1000 M820 500 L800 450 M900 500 L930 450 M1000 500 L1040 470 M1000 500 L1040 530" a={lying + 6} n={10} />
          <Meter x={880} y={250} frame={frame} spin={0} value="$0" />
        </g>
      )}
    </g>
  );
};

/** The three stamps under the link page's heads: BRAIN, BAND, JAR. World coordinates. */
export const LinkStamps: React.FC<{ frame: number; at: readonly [number, number, number] }> = ({ frame, at }) => (
  <>
    {["BRAIN", "BAND", "JAR"].map((t, i) => {
      const p = onSheet([250, 550, 850][i], 640);
      return <StampTag key={t} frame={frame} at={at[i]} x={p.x} y={p.y} text={t} size={50} tilt={[-5, 3, -3][i]} />;
    })}
  </>
);

/** The table seen from above, a sheet on it; `children` draw on the sheet, `over` in world units on top. */
export const LeafletInsert: React.FC<{ frame: number; at: number; cam: Camera; children: React.ReactNode; over?: React.ReactNode; tilt?: number }> = ({
  frame, at, cam, children, over, tilt = -2,
}) => {
  const back = (
    <g>
      <rect x={-800} y={-600} width={3600} height={2400} fill="#b27a4d" />
      {Array.from({ length: 16 }, (_, i) => (
        <path key={i} d={`M-800 ${-200 + i * 110} C200 ${-170 + i * 110} 1400 ${-240 + i * 110} 2800 ${-190 + i * 110}`} fill="none" stroke="#8a5c3b" strokeWidth={5} opacity={0.35} />
      ))}
      <circle cx={1700} cy={130} r={150} fill="#e6a0a0" stroke={INK} strokeWidth={6} />
      <circle cx={1700} cy={130} r={110} fill="#f6e3b0" />
      <circle cx={190} cy={940} r={120} fill="#cfe9f4" opacity={0.5} stroke="#8a96a8" strokeWidth={8} />
    </g>
  );
  return (
    <LookContext.Provider value={setLook([], "morning", cam, { dof: 0 })}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={back} actors={(
        <>
          <Sheet frame={frame} at={at} x={SHEET.x} y={SHEET.y} w={SHEET.w} h={SHEET.h} tilt={tilt}>{children}</Sheet>
          {over}
        </>
      )} />
    </LookContext.Provider>
  );
};
