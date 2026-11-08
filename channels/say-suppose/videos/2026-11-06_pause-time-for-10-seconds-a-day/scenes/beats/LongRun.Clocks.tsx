import { spring } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND } from "@whatif/kit/rig/pose";
import { Layer, Stage, type Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import { CRIMSON, HEIGHT, INK, PAPER, WIDTH } from "@whatif/kit/theme";
import { blinking, camAt, cutAt, linear, mix, type Shot } from "../shared";
import { beatTimes, smooth, You } from "./LongRun.parts";

const DUSK_SKY = (
  <>
    <defs>
      <linearGradient id="clock-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6f6aa8" />
        <stop offset="0.55" stopColor="#f0a77a" />
        <stop offset="1" stopColor="#fbd9a8" />
      </linearGradient>
    </defs>
    <rect width={WIDTH} height={HEIGHT} fill="url(#clock-sky)" />
  </>
);

const Clock: React.FC<{ x: number; y: number; r: number; sec: number; min: number; hour: number; bump: number }> = ({ x, y, r, sec, min, hour, bump }) => (
  <g transform={`translate(${x} ${y}) scale(${1 + bump * 0.05})`}>
    <rect x={-10} y={r - 10} width={20} height={1000} fill="#6f4a2f" />
    <circle r={r + 16} fill="#c98f5e" stroke={INK} strokeWidth={8} />
    <circle r={r} fill={PAPER} stroke={INK} strokeWidth={6} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i * 30 * Math.PI) / 180;
      return <line key={i} x1={Math.sin(a) * (r - 14)} y1={-Math.cos(a) * (r - 14)} x2={Math.sin(a) * (r - (i % 3 ? 30 : 44))} y2={-Math.cos(a) * (r - (i % 3 ? 30 : 44))} stroke={INK} strokeWidth={i % 3 ? 5 : 9} strokeLinecap="round" />;
    })}
    <line x1={0} y1={0} x2={0} y2={-r * 0.5} stroke={INK} strokeWidth={14} strokeLinecap="round" transform={`rotate(${hour})`} />
    <line x1={0} y1={0} x2={0} y2={-r * 0.76} stroke={INK} strokeWidth={9} strokeLinecap="round" transform={`rotate(${min})`} />
    <line x1={0} y1={r * 0.15} x2={0} y2={-r * 0.84} stroke={CRIMSON} strokeWidth={4} strokeLinecap="round" transform={`rotate(${sec})`} />
    <circle r={12} fill={INK} />
  </g>
);

/** Line 62: two paper clocks side by side; yours gives a small extra tick, then over fifty years creeps ahead. */
export const Clocks: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, cues, clips } = shot;
  const b = beatTimes(cues, clips);
  const start = b.clocks;
  const years = clips[57].from + 87;   // "Over fifty years"
  const twoDays = clips[57].from + 149; // "two days"
  const end = b.mirror;

  // ordinary seconds, one a second, with a little overshoot on each tick
  const ticks = Math.floor((frame - start) / 30);
  const since = (frame - start) % 30;
  const kick = spring({ frame: since, fps: 30, config: { damping: 9, stiffness: 260 } });
  const baseSec = (ticks - 1 + kick) * 6;
  // the years: hands sweep
  const sweep = smooth(linear(frame, years, twoDays + 6)) * 360 * 14;
  // your extra ticks: one on "pauses", then many through the years
  const extraOne = frame >= cues.clocks ? spring({ frame: frame - cues.clocks, fps: 30, config: { damping: 8, stiffness: 240 } }) : 0;
  const extraMany = smooth(linear(frame, years, twoDays + 6)) * 52;
  const extraDeg = extraOne * 6 + extraMany;
  const bumpOne = frame >= cues.clocks && frame < cues.clocks + 12 ? Math.sin(((frame - cues.clocks) / 12) * Math.PI) : 0;
  const bumpMany = frame >= years && frame < twoDays + 6 ? Math.max(0, Math.sin((frame - years) * 0.9)) * 0.5 : 0;

  const theirs = { sec: baseSec + sweep * 3, min: sweep, hour: sweep / 12 };
  const yours = { sec: baseSec + extraDeg + sweep * 3, min: sweep + extraDeg, hour: (sweep + extraDeg) / 12 };

  const L = { x: 700, y: 470 };
  const R = { x: 1240, y: 470 };
  const cam: Camera = cutAt(frame, [
    [start, drift(camAt(frame, [[start, { x: 970, y: 560, zoom: 0.98 }], [cues.clocks - 16, { x: 1000, y: 540, zoom: 1.06 }]]), frame, "clocks", 4)],
    [cues.clocks - 16, drift(camAt(frame, [[cues.clocks - 16, { x: R.x, y: R.y + 60, zoom: 1.75 }], [years, { x: R.x, y: R.y + 50, zoom: 1.85 }]]), frame, "yours", 3)],
    [years, drift(camAt(frame, [[years, { x: 970, y: 560, zoom: 1.0 }], [twoDays, { x: 1040, y: 540, zoom: 1.12 }], [end, { x: 1150, y: 520, zoom: 1.35 }]]), frame, "years", 4)],
  ]);

  const back = (
    <>
      <Layer cam={cam} depth={0.3} flat>
        {[[200, 200, 1], [1500, 140, 1.3], [900, 90, 0.8], [1800, 330, 0.9]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x + Math.sin(frame / 90 + i) * 20} ${y}) scale(${s})`} opacity={0.85}>
            <ellipse cx={0} cy={0} rx={130} ry={40} fill="#fbe0c4" /><ellipse cx={-50} cy={-26} rx={70} ry={40} fill="#fbe0c4" /><ellipse cx={50} cy={-20} rx={60} ry={36} fill="#fbe0c4" />
          </g>
        ))}
      </Layer>
      <Layer cam={cam} depth={0.7} flat>
        <path d="M-800 820 Q300 690 1000 790 T2800 760 V1500 H-800Z" fill="#7e5d8f" />
      </Layer>
      <Layer cam={cam} depth={1}>
        <path d="M-800 900 Q400 840 1000 880 T2800 870 V1600 H-800Z" fill="#5a4470" />
      </Layer>
    </>
  );
  const actors = (
    <>
      <Clock x={L.x} y={L.y} r={210} {...theirs} bump={0} />
      <Clock x={R.x} y={R.y} r={210} {...yours} bump={bumpOne + bumpMany} />
      <Figure x={L.x - 330} y={905} scale={1.05} facing={1} head="#7fa0c4" pose={STAND} mouth="flat" look={{ x: 0.6, y: -0.6 }} lids={0.2} blink={blinking(frame, 5)} />
      <You x={R.x + 330} y={905} scale={1.05} facing={-1} age={mix(0.9, 1, linear(frame, years, twoDays))} pose={STAND}
        mouth={frame >= cues.clocks && frame < cues.clocks + 20 ? "o" : "flat"} brows={frame >= cues.clocks ? "raised" : "none"} eyes={frame >= cues.clocks && frame < cues.clocks + 30 ? 1.2 : 1}
        look={{ x: 0.7, y: -0.6 }} lids={0.2} blink={blinking(frame, 2)} time={frame} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} sky={DUSK_SKY} back={back} actors={actors} />;
};
