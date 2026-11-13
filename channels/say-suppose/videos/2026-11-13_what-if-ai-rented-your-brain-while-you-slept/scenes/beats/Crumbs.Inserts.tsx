// Crumbs' drawn inserts (facts are drawn, style.md): the notebook page where the scientist sleeps, dreams of a frog's
// heart, runs down the night corridor with a candle, and the heart beats in its dish on a bench; the phone with the box
// of squiggly letters; the stack of old newspapers whose smudged pages come out as clean lines; the word for bridge
// (a speech bubble with a drawn arch in it, no letters); the knot nobody taught him. REF screen coordinates.
import { Figure } from "@whatif/kit/rig/Figure";
import { runPose, STAND } from "@whatif/kit/rig/pose";
import { phone } from "@whatif/kit/sets";
import { Deep, setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { CRIMSON, INK, PAPER, TEAL } from "@whatif/kit/theme";
import { BROTHER, linear, mix, noise, ramp } from "../shared";

const PENCIL = "#3d4a66";

// ------------------------------------------------------------------------------------------------ the notebook page

/** A notebook page filling the frame (ruled, a margin), for drawn facts. */
export const PageStage: React.FC<{ cam: Camera; mood: MoodName; children: React.ReactNode }> = ({ cam, mood, children }) => (
  <LookContext.Provider value={setLook([], mood, cam, { dof: 0 })}>
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
      back={
        <Deep cam={cam} depth={1}>
          <rect x={-800} y={-600} width={3600} height={2400} fill="#a8774f" />
          <rect x={120} y={20} width={1680} height={1040} rx={14} fill="#fbf6ea" stroke="#cdbfa6" strokeWidth={5} />
          {Array.from({ length: 18 }, (_, i) => <line key={i} x1={140} y1={120 + i * 54} x2={1780} y2={120 + i * 54} stroke="#c9d8ea" strokeWidth={3} />)}
          <line x1={260} y1={20} x2={260} y2={1060} stroke="#e6a0a0" strokeWidth={4} />
        </Deep>
      }
      actors={<>{children}</>} />
  </LookContext.Provider>
);

/** The scientist asleep in his bed on the page (a nightcap), and the dream cloud with a frog's heart in it. */
export const DreamingScientist: React.FC<{ frame: number; bed: number; dream: number }> = ({ frame, bed, dream }) => (
  <g>
    <g opacity={Math.min(1, bed * 2)}>
      <rect x={560} y={700} width={720} height={60} rx={10} fill="none" stroke={PENCIL} strokeWidth={7} />
      <line x1={580} y1={760} x2={580} y2={840} stroke={PENCIL} strokeWidth={7} />
      <line x1={1260} y1={760} x2={1260} y2={840} stroke={PENCIL} strokeWidth={7} />
      <rect x={560} y={600} width={24} height={240} rx={8} fill="none" stroke={PENCIL} strokeWidth={7} />
      <g transform="translate(700 690) rotate(-90)">
        <Figure x={0} y={0} scale={0.9} pose={STAND} head="#e8c9a0" coat="#f7f4ee" blink mouth="o" look={{ x: 0.5, y: 0 }} />
        <path d="M-30 -268 Q10 -330 60 -300 L40 -262Z" fill="#9fc0e0" stroke={INK} strokeWidth={4} />
      </g>
      <path d="M760 690 Q900 640 1240 690 L1240 700 L760 700Z" fill="#7fa0c4" opacity={0.6} />
      {[0, 1, 2].map((k) => {
        const p = ((frame / 40 + k / 3) % 1);
        return <path key={k} d={`M${740 + p * 60} ${600 - p * 100} l26 0 l-26 24 l26 0`} fill="none" stroke={PENCIL} strokeWidth={5} opacity={1 - p} />;
      })}
    </g>
    {dream > 0 && (
      <g opacity={Math.min(1, dream * 2)} transform={`translate(980 330) scale(${0.6 + 0.4 * Math.min(1, dream * 2)})`}>
        {[[-160, 20, 90], [-60, -50, 110], [70, -40, 105], [170, 20, 90], [40, 60, 100], [-90, 70, 90]].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#fbf6ea" stroke={PENCIL} strokeWidth={6} />
        ))}
        {[[-160, 20, 90], [-60, -50, 110], [70, -40, 105], [170, 20, 90], [40, 60, 100], [-90, 70, 90]].map(([x, y, r], i) => (
          <circle key={`i${i}`} cx={x} cy={y} r={r - 5} fill="#fbf6ea" />
        ))}
        <circle cx={-220} cy={200} r={18} fill="#fbf6ea" stroke={PENCIL} strokeWidth={5} />
        <circle cx={-260} cy={270} r={11} fill="#fbf6ea" stroke={PENCIL} strokeWidth={5} />
        <g transform={`scale(${1 + 0.08 * Math.sin(frame / 4)})`}><Heart s={1} /></g>
      </g>
    )}
  </g>
);

/** A heart (the frog's), drawn red with pencil veins. */
const Heart: React.FC<{ s: number }> = ({ s }) => (
  <g transform={`scale(${s})`}>
    <path d="M0 60 C-90 10 -80 -70 -20 -60 Q0 -56 0 -34 Q0 -56 20 -60 C80 -70 90 10 0 60Z" fill={CRIMSON} stroke={INK} strokeWidth={5} />
    <path d="M-30 -30 q20 30 10 60 M20 -40 q-6 30 10 50" fill="none" stroke="#8a1f30" strokeWidth={4} />
    <path d="M-10 -58 q-6 -30 6 -46 M12 -58 q8 -26 26 -36" fill="none" stroke="#8a1f30" strokeWidth={8} strokeLinecap="round" />
  </g>
);

/** The night corridor on the page, drawing itself, and him running down it in his nightshirt with a candle. */
export const NightCorridor: React.FC<{ frame: number; from: number; to: number }> = ({ frame, from, to }) => {
  const p = linear(frame, from, to);
  const draw = (a: number, b: number) => [Math.round(mix(from, to, a)), Math.round(mix(from, to, b))] as const;
  const lines: [string, readonly [number, number]][] = [
    ["M300 160 L760 420 L760 700 L300 980", draw(0, 0.18)],
    ["M1620 160 L1160 420 L1160 700 L1620 980", draw(0.05, 0.22)],
    ["M760 420 L1160 420 M760 700 L1160 700", draw(0.12, 0.26)],
    ["M420 300 L420 860 L560 780 L560 380Z", draw(0.18, 0.3)],
    ["M1500 300 L1500 860 L1360 780 L1360 380Z", draw(0.22, 0.34)],
  ];
  const x = mix(380, 1500, p);
  const y = mix(990, 860, Math.sin(p * Math.PI) * 0.2 + p * 0.1);
  const candle = (
    <g transform="translate(0 -6)">
      <rect x={-8} y={-34} width={16} height={34} fill="#f3e9d7" stroke={INK} strokeWidth={3} />
      <path d={`M0 -36 q-10 -14 0 -${30 + Math.sin(frame) * 4} q10 16 0 30Z`} fill="#f2b632" stroke={INK} strokeWidth={2} />
    </g>
  );
  return (
    <g>
      {lines.map(([d, [a, b]], i) => <DrawLine key={i} d={d} from={a} to={b} color={PENCIL} width={7} />)}
      <circle cx={x + 40} cy={y - 330} r={140} fill="#ffe6a0" opacity={0.25} />
      <Figure x={x} y={y} scale={0.95} pose={{ ...runPose(frame * 0.5), armF: [110, 20] }} head="#e8c9a0" coat="#f7f4ee" mouth="o" eyes={1.2}
        brows="raised" look={{ x: 0.8, y: 0 }} held={candle} time={frame} />
      <path d={`M${x - 20} ${y - 330} Q${x + 30} ${y - 400} ${x + 60} ${y - 320} L${x + 20} ${y - 300}Z`} fill="#9fc0e0" stroke={INK} strokeWidth={4} />
      {[0, 1, 2].map((k) => <line key={k} x1={x - 110 - k * 30} y1={y - 200 + k * 40} x2={x - 170 - k * 30} y2={y - 200 + k * 40} stroke={PENCIL} strokeWidth={5} strokeLinecap="round" />)}
    </g>
  );
};

/** The frog's heart beating in a dish on the lab bench, a pulse line drawing itself on a paper strip. */
export const HeartOnBench: React.FC<{ frame: number; from: number }> = ({ frame, from }) => {
  const beat = Math.max(0, Math.sin((frame - from) / 5)) ** 3;
  const pulse = Array.from({ length: 40 }, (_, i) => `${i === 0 ? "M" : "L"}${520 + i * 22} ${360 - (i % 6 === 3 ? 70 : i % 6 === 4 ? -30 : 0)}`).join(" ");
  return (
    <g>
      <line x1={260} y1={820} x2={1700} y2={820} stroke={PENCIL} strokeWidth={9} />
      <line x1={340} y1={820} x2={340} y2={1040} stroke={PENCIL} strokeWidth={9} />
      <line x1={1620} y1={820} x2={1620} y2={1040} stroke={PENCIL} strokeWidth={9} />
      <ellipse cx={960} cy={800} rx={260} ry={40} fill="#cfe9f4" stroke={PENCIL} strokeWidth={6} />
      <g transform={`translate(960 720) scale(${1 + beat * 0.14})`}><Heart s={1.2} /></g>
      <path d="M1040 660 Q1160 560 1300 600 L1300 800" fill="none" stroke={PENCIL} strokeWidth={6} />
      <rect x={1260} y={600} width={90} height={200} rx={12} fill="#cfe9f4" opacity={0.6} stroke={PENCIL} strokeWidth={6} />
      <rect x={500} y={270} width={920} height={170} fill={PAPER} stroke={PENCIL} strokeWidth={4} />
      <DrawLine d={pulse} from={from} to={from + 50} color={CRIMSON} width={6} />
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the phone and the papers

/** The box of squiggly letters on a phone screen centred at (cx, top): two warped "words" drawn as waves (no letters),
 *  a strike line, the answer field filling with ink bars (`typed` 0..1), the teal button. `s` scales it. */
export const CaptchaBox: React.FC<{ cx: number; top: number; s?: number; typed: number; frame: number; seed?: number }> = ({ cx, top, s = 1, typed, frame, seed = 0 }) => {
  const wave = (x0: number, y0: number, n: number, k: number) =>
    `M${x0} ${y0} ` + Array.from({ length: n }, (_, i) => `q14 ${(-30 - noise(k + i) * 30) * (i % 2 ? -1 : 1)} 28 ${(noise(k + i + 7) - 0.5) * 30}`).join(" ");
  return (
    <g transform={`translate(${cx} ${top}) scale(${s})`}>
      <rect x={-160} y={0} width={320} height={420} rx={14} fill="#f6f7f9" stroke="#c7ccd6" strokeWidth={4} />
      <rect x={-140} y={24} width={280} height={150} rx={8} fill="#e9e3d2" stroke="#b9b1a2" strokeWidth={3} />
      <path d={wave(-126, 90, 4, seed)} fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" transform="rotate(-6 -70 90)" />
      <path d={wave(10, 110, 4, seed + 20)} fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" transform="rotate(8 60 110)" />
      <path d="M-130 120 Q-20 70 130 110" fill="none" stroke="#6b6258" strokeWidth={4} />
      <rect x={-140} y={200} width={280} height={56} rx={10} fill="#fff" stroke="#c7ccd6" strokeWidth={4} />
      {Array.from({ length: 6 }, (_, i) => {
        const w = 26 + noise(seed + i) * 14;
        const shown = typed * 6 - i;
        return shown > 0 ? <rect key={i} x={-124 + i * 42} y={218} width={w * Math.min(1, shown)} height={18} rx={9} fill={INK} /> : null;
      })}
      {Math.floor(frame / 12) % 2 === 0 && <rect x={-124 + Math.min(6, typed * 6) * 42} y={212} width={4} height={30} fill={CRIMSON} />}
      <rect x={-80} y={290} width={160} height={60} rx={30} fill={typed >= 1 ? TEAL : "#9fb7c4"} />
      <path d="M-18 320 l12 12 l26 -26" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

/** The phone close-up (the library `phone` set) with the box of squiggly letters on its screen. */
export const CaptchaPhone: React.FC<{ frame: number; cam: Camera; mood: MoodName; typed: number; thumb: number | null; extra?: React.ReactNode }> = ({ frame, cam, mood, typed, thumb, extra }) => {
  const options = { ...phone.defaults, mode: "off" as const, thumb, behind: "desk" as const };
  const props = { cam, mood, frame, options };
  return (
    <LookContext.Provider value={setLook(phone.lights(options), mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={phone.Back(props)}
        actors={
          <>
            {phone.Mid?.(props)}
            <rect x={1012} y={240} width={336} height={640} rx={18} fill="#eef1f4" />
            <CaptchaBox cx={1180} top={290} s={1} typed={typed} frame={frame} seed={Math.floor(typed * 0) + 3} />
            {thumb !== null && (
              <g transform={`translate(${1012 + thumb * 336} ${720 - Math.max(0, Math.sin(frame * 0.9)) * 14})`}>
                <path d="M0 0 C-20 60 -60 160 -150 260 L-40 330 C10 230 40 90 30 10 Q16 -26 0 0Z" fill="#f2b632" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
                <ellipse cx={12} cy={6} rx={16} ry={22} fill="#f7cf6e" />
              </g>
            )}
            {extra}
          </>
        } />
    </LookContext.Provider>
  );
};

/** One newspaper page from above: yellowed with grey smudges (`clean` 0), or the same page as crisp lines of ink
 *  (`clean` 1), at (x, y) rotated `rot`. */
const NewsPage: React.FC<{ x: number; y: number; rot: number; clean: number; seed: number; s?: number }> = ({ x, y, rot, clean, seed, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-170} y={-220} width={340} height={440} fill={clean > 0.5 ? "#fbf8f0" : "#e8d9a8"} stroke="#9a8a6a" strokeWidth={4} />
    <rect x={-150} y={-200} width={300} height={44} fill={INK} opacity={0.75} />
    {Array.from({ length: 18 }, (_, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = -150 + col * 156;
      const by = -140 + row * 38;
      const w = 130 - noise(seed + i) * 40;
      return (
        <g key={i}>
          <rect x={bx} y={by} width={w} height={14} rx={7} fill={INK} opacity={0.85 * clean} />
          <ellipse cx={bx + w / 2} cy={by + 7} rx={w / 2 + 8} ry={13} fill="#8a7a5a" opacity={0.45 * (1 - clean)} />
        </g>
      );
    })}
  </g>
);

/** The old newspapers on the desk beside the phone: pages lift off the yellowed stack one by one (one every `every`
 *  frames from `from`, faster after `fast`) and land on the clean pile as crisp lines. */
export const Newspapers: React.FC<{ frame: number; from: number; fast: number; every?: number }> = ({ frame, from, fast, every = 14 }) => {
  const times: number[] = [];
  for (let t = from, k = 0; t < frame + 1 && k < 80; k++) {
    times.push(t);
    t += t >= fast ? Math.max(3, every / 4) : every;
  }
  const flying = 16;
  const landed = times.filter((t) => frame - t >= flying).length;
  const old = { x: 360, y: 600 };
  const clean = { x: 760, y: 640 };
  return (
    <g>
      {Array.from({ length: Math.max(1, 12 - Math.floor(landed / 3)) }, (_, i) => (
        <NewsPage key={`o${i}`} x={old.x + (noise(i) - 0.5) * 12} y={old.y - i * 3} rot={(noise(i + 4) - 0.5) * 8} clean={0} seed={i} s={0.9} />
      ))}
      {Array.from({ length: Math.min(30, landed) }, (_, i) => (
        <NewsPage key={`c${i}`} x={clean.x + (noise(i + 50) - 0.5) * 10} y={clean.y - i * 2.5} rot={(noise(i + 9) - 0.5) * 6} clean={1} seed={i + 30} s={0.9} />
      ))}
      {times.map((t, i) => {
        const p = (frame - t) / flying;
        if (p < 0 || p >= 1) return null;
        const e = ramp(p, 0, 1);
        return <NewsPage key={`f${i}`} x={mix(old.x, clean.x, e)} y={mix(old.y - 40, clean.y - landed * 2.5, e) - Math.sin(p * Math.PI) * 160}
          rot={mix(-4, 6, e)} clean={linear(p, 0.3, 0.7)} seed={i + 30} s={0.9 + Math.sin(p * Math.PI) * 0.08} />;
      })}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the word, the knot

/** A speech bubble holding a drawing instead of words (the word for bridge: an arch over water). Tail tip at (x, y). */
export const DoodleBubble: React.FC<{ frame: number; at: number; until?: number; x: number; y: number; side?: 1 | -1; s?: number }> = ({ frame, at, until, x, y, side = 1, s = 1 }) => {
  if (frame < at || (until !== undefined && frame >= until)) return null;
  const k = Math.min(1, (frame - at) / 6);
  const pop = k < 1 ? 0.6 + 0.5 * k : 1 + 0.06 * Math.max(0, 1 - (frame - at - 6) / 6);
  const bx = x + side * 40 * s;
  const by = y - 150 * s;
  return (
    <g transform={`translate(${x} ${y}) scale(${pop * s}) translate(${-x} ${-y})`}>
      <path d={`M${x} ${y} L${x + side * 30} ${y - 70} L${x + side * 80} ${y - 70}Z`} fill={PAPER} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x={side === 1 ? bx : bx - 240} y={by - 60} width={240} height={140} rx={60} fill={PAPER} stroke={INK} strokeWidth={5} />
      <rect x={x + side * 28 - (side === 1 ? 0 : 52)} y={y - 78} width={52} height={12} fill={PAPER} />
      <g transform={`translate(${side === 1 ? bx + 120 : bx - 120} ${by + 10})`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round">
        <path d="M-80 10 Q0 -60 80 10" />
        <path d="M-80 10 H80" />
        {[-50, -20, 20, 50].map((dx) => <line key={dx} x1={dx} y1={10} x2={dx} y2={-30 + Math.abs(dx) * 0.5} />)}
        <path d="M-90 34 q15 -10 30 0 t30 0 t30 0 t30 0 t30 0 t30 0" stroke="#3d6fb0" />
      </g>
    </g>
  );
};

/** The knot nobody taught him, from above: a sneaker's lace tying itself into a fancy knot, his peach hands at the
 *  ends. `from`..`to` frames draw it. */
export const KnotInsert: React.FC<{ frame: number; from: number; to: number }> = ({ frame, from, to }) => {
  const p = linear(frame, from, to);
  const knot = "M700 520 C780 420 900 420 940 520 C980 620 860 700 820 600 C780 500 1000 440 1060 520 C1120 600 1020 680 960 620 C900 560 1060 420 1180 470 C1260 500 1240 600 1170 590";
  return (
    <g>
      <path d="M560 760 Q520 420 760 360 L1180 340 Q1400 360 1420 560 L1420 780 Q960 860 560 760Z" fill="#f3f0e6" stroke={INK} strokeWidth={8} />
      <path d="M760 360 Q960 300 1180 340 L1150 640 Q960 680 790 640Z" fill="#d8344f" stroke={INK} strokeWidth={6} />
      {[420, 480, 540, 600].map((y) => <g key={y}><circle cx={820} cy={y} r={9} fill={INK} /><circle cx={1110} cy={y} r={9} fill={INK} /></g>)}
      <DrawLine d={knot} from={from} to={to} color="#f7f4ee" width={22} />
      <DrawLine d={knot} from={from} to={to} color={INK} width={6} />
      {[[700 + p * 80, 520 - p * 40, 30], [1170 + p * 40, 590 + p * 10, -30]].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <ellipse rx={56} ry={44} fill={BROTHER.head} stroke={INK} strokeWidth={5} />
          <ellipse cx={-34} cy={-30} rx={16} ry={26} fill={BROTHER.head} stroke={INK} strokeWidth={4} />
        </g>
      ))}
    </g>
  );
};
