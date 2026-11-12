// Helpers for "Say It Again" (SayItAgain.tsx): the second letter held up on the landing (an insert), the run home past
// the store's light, and the paper sheet for the couples fact (c09). World coordinates, for a <Stage> slot.
import { Figure } from "@whatif/kit/rig/Figure";
import { runPose } from "@whatif/kit/rig/pose";
import { Skyline } from "@whatif/kit/sets/common";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Letter, Sheet } from "../parts";
import { Deep } from "../sets/common";
import { blinking, HERO, mix, PASTELS, ramp } from "../shared";

/** The letter held up in both hands on the dark landing outside the flat: it rises into frame at `rise`, a teal seal
 *  stamps on at `stamp` (four years, paid), the hands go still and then tremble a little at `holds` (if the exam holds). */
export const LetterInsert: React.FC<{ frame: number; cam: Camera; rise: number; stamp: number; holds: number }> = ({ frame, cam, rise, stamp, holds }) => {
  const up = ramp(frame, rise, rise + 16);
  const shake = frame >= holds ? Math.sin(frame * 1.9) * 1.6 * Math.min(1, (frame - holds) / 10) : 0;
  const y = mix(1240, 820, up) + shake;
  const st = frame < stamp ? 0 : Math.min(1, (frame - stamp) / 5);
  const back = (
    <Deep cam={cam} depth={0.9} flat>
      <rect x={-1400} y={-800} width={4800} height={2800} fill="#4b4d63" />
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-1400 + i * 360} y={-800} width={4} height={2800} fill="#000" opacity={0.08} />)}
      <circle cx={1500} cy={140} r={36} fill="#ffe39a" />
      <circle cx={1500} cy={140} r={120} fill="#ffe39a" opacity={0.12} />
      <rect x={300} y={300} width={90} height={40} rx={6} fill="#cbc6b8" opacity={0.7} />
    </Deep>
  );
  const actors = (
    <g>
      <g transform={`translate(960 ${y})`}>
        {/* the arms from below, the hands at the letter's sides */}
        <path d="M-380 520 L-150 -40" stroke={INK} strokeWidth={40} strokeLinecap="round" />
        <path d="M380 520 L150 -40" stroke="#3b3e47" strokeWidth={40} strokeLinecap="round" />
        <Letter x={0} y={140} scale={2.6} tilt={-3} />
        {st > 0 && (
          <g transform={`translate(-80 30) rotate(-12) scale(${mix(1.6, 1, st)})`} opacity={st}>
            <circle r={70} fill="none" stroke={TEAL} strokeWidth={10} />
            <circle r={52} fill="none" stroke={TEAL} strokeWidth={5} />
            <path d="M-34 0 L-8 26 L36 -24" fill="none" stroke={TEAL} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
        <circle cx={-160} cy={-40} r={34} fill={MUSTARD} stroke={INK} strokeWidth={5} />
        <circle cx={160} cy={-40} r={34} fill={MUSTARD} stroke={INK} strokeWidth={5} />
      </g>
    </g>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} />;
};

/** Running home at night: you run right along the pavement while the convenience store's white window slides away
 *  behind you; the camera follows. `p` 0..1 across the shot. */
export const NightRun: React.FC<{ frame: number; p: number }> = ({ frame, p }) => {
  const x = mix(700, 1500, p);
  const cam: Camera = { x: x + 140, y: 600, zoom: 1.5 };
  const floor = 900;
  const back = (
    <>
      <Deep cam={cam} depth={0.3} flat>
        <rect x={-1400} y={-800} width={4800} height={2800} fill="#14183a" />
      </Deep>
      <Deep cam={cam} depth={0.55} flat>
        <Skyline mood="night" from={-1400} to={3400} base={760} tall={420} seed={5} />
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={floor - 6} width={4800} height={900} fill="#3a3d52" />
        <rect x={-1400} y={floor - 6} width={4800} height={10} fill="#565a72" />
        {/* the convenience store: white window, shelves, the counter's light spilling on the pavement */}
        <rect x={260} y={380} width={520} height={floor - 386} fill="#f4f8fb" stroke={INK} strokeWidth={6} />
        {[0, 1, 2].map((r) => <rect key={r} x={290} y={460 + r * 110} width={300} height={14} fill="#c9ced6" />)}
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${300 + i * 32} ${450 + (i % 3) * 110} l14 -26 l14 26z`} fill="#f3e9d7" stroke={INK} strokeWidth={2} />)}
        <rect x={640} y={430} width={110} height={floor - 436} fill="#dfe9ee" stroke={INK} strokeWidth={4} />
        <rect x={250} y={340} width={540} height={46} fill={TEAL} stroke={INK} strokeWidth={5} />
        <path d={`M260 ${floor} L780 ${floor} L900 ${floor + 200} L140 ${floor + 200}Z`} fill="#f4f8fb" opacity={0.14} />
        {/* street lamps and a dark doorway further on */}
        {[1200, 1900, 2600].map((lx) => (
          <g key={lx}>
            <rect x={lx} y={300} width={12} height={floor - 300} fill="#2a2d3e" />
            <ellipse cx={lx + 6} cy={300} rx={34} ry={10} fill="#ffe39a" />
            <path d={`M${lx - 20} 306 L${lx - 120} ${floor} H${lx + 132} L${lx + 32} 306Z`} fill="#ffe39a" opacity={0.08} />
          </g>
        ))}
      </Deep>
    </>
  );
  const actors = (
    <Figure {...HERO} x={x} y={floor} scale={1.1} pose={runPose(frame * 0.42)} brows="raised" mouth="open" eyes={1.1} look={{ x: 1, y: 0 }}
      blink={blinking(frame, 1)} time={frame} flow={0.9} held={<Letter x={0} y={10} scale={0.36} tilt={-20} />} />
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} />;
};

/** The couples fact on paper (c09): one of two heads hears news (a little letter), the other throws both arms up; a
 *  line climbs and a heart pops at its top. Centre (x, y); drawn from `at`. */
export const CouplesSheet: React.FC<{ frame: number; at: number; until?: number; x: number; y: number }> = ({ frame, at, until, x, y }) => {
  const W = 420, H = 280;
  const arms = ramp(frame, at + 12, at + 24);
  const heart = ramp(frame, at + 52, at + 62);
  const burst = frame >= at + 20 ? 0.6 + 0.4 * Math.sin((frame - at) / 4) : 0;
  return (
    <Sheet frame={frame} at={at} until={until} x={x} y={y} w={W} h={H} tilt={-2}>
      {/* the pair */}
      <g transform="translate(70 170)">
        <rect x={-14} y={0} width={28} height={70} rx={10} fill={INK} />
        <circle cx={0} cy={-26} r={30} fill={PASTELS[0]} stroke={INK} strokeWidth={3} />
        <circle cx={10} cy={-30} r={4} fill={INK} />
        <g transform="translate(26 6) rotate(-14)">
          <rect x={0} y={-30} width={30} height={40} rx={3} fill={PAPER} stroke={INK} strokeWidth={3} />
          <circle cx={20} cy={0} r={5} fill={TEAL} />
        </g>
      </g>
      <g transform="translate(160 170)">
        <rect x={-14} y={0} width={28} height={70} rx={10} fill={INK} />
        <circle cx={0} cy={-26} r={30} fill={PASTELS[3]} stroke={INK} strokeWidth={3} />
        <circle cx={-10} cy={-30} r={4} fill={INK} />
        <path d="M-14 -12 Q-4 -4 6 -12" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
        <line x1={-12} y1={10} x2={mix(-30, -40, arms)} y2={mix(40, -60, arms)} stroke={INK} strokeWidth={9} strokeLinecap="round" />
        <line x1={12} y1={10} x2={mix(30, 40, arms)} y2={mix(40, -60, arms)} stroke={INK} strokeWidth={9} strokeLinecap="round" />
        {burst > 0 && [-50, -20, 20, 50].map((a) => (
          <line key={a} x1={Math.sin((a * Math.PI) / 180) * 50} y1={-30 - Math.cos((a * Math.PI) / 180) * 50}
            x2={Math.sin((a * Math.PI) / 180) * 70} y2={-30 - Math.cos((a * Math.PI) / 180) * 70} stroke={MUSTARD} strokeWidth={6} strokeLinecap="round" opacity={burst} />
        ))}
      </g>
      {/* the climbing line and the heart */}
      <DrawLine d={`M${W / 2 + 30} ${H / 2 + 60} L${W / 2 + 80} ${H / 2 + 30} L${W / 2 + 120} ${H / 2 + 6} L${W / 2 + 170} ${H / 2 - 70}`}
        from={at + 20} to={at + 52} color={TEAL} width={9} />
      {heart > 0 && (
        <g transform={`translate(${W / 2 + 175} ${H / 2 - 92}) scale(${heart})`}>
          <path d="M0 14 C-30 -8 -18 -34 0 -18 C18 -34 30 -8 0 14Z" fill={CRIMSON} stroke={INK} strokeWidth={3} />
        </g>
      )}
    </Sheet>
  );
};
