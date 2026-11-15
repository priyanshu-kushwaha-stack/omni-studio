// Tomorrow's pieces (Tomorrow.tsx): the rota on paper (your row drawn in every night, running off the edge), the hatch
// above yours (the pod hall's one hatch dark all film) swinging open with its own counter, the hall's front doors and
// the drawn cranes the timeline runs off between, and the harbour at dawn (roofs whose counters click to 365 in a wave,
// a bridge drawing itself across the water, a passer-by under it who does not look up).
import { Figure } from "@whatif/kit/rig/Figure";
import { walkPose } from "@whatif/kit/rig/pose";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Counter, Sheet } from "../parts";
import { linear, mix, noise, PASTELS, ramp } from "../shared";

/** The rota: a grid of nights, a head per row; your row (mustard) fills in cell by cell from `fill` and runs on past the
 *  sheet's edge. Screen pixels, centre (x, y). */
export const RotaSheet: React.FC<{ frame: number; at: number; until?: number; fill: number; x: number; y: number }> = ({ frame, at, until, fill, x, y }) => {
  const w = 1000, h = 560, cols = 10, rows = 5;
  const cw = 76, ch = 74, x0 = 190, y0 = 90;
  const done = Math.floor(linear(frame, fill, fill + 50) * 15);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <Sheet frame={frame} at={at} until={until} x={x} y={y} w={w} h={h} tilt={1.5}>
        {Array.from({ length: rows }, (_, r) => (
          <g key={r}>
            <circle cx={110} cy={y0 + r * ch + ch / 2} r={24} fill={r === 2 ? MUSTARD : PASTELS[(r * 3) % PASTELS.length]} stroke={INK} strokeWidth={3} />
            {r === 2 && <path d={`M104 ${y0 + r * ch + 4} q-4 -14 8 -16 q-4 8 4 10z`} fill={INK} />}
            {Array.from({ length: cols }, (_, c) => (
              <rect key={c} x={x0 + c * cw} y={y0 + r * ch} width={cw} height={ch} fill="none" stroke="#cdbfa6" strokeWidth={2} />
            ))}
            {r !== 2 && Array.from({ length: cols }, (_, c) => noise(r * 13 + c) > 0.62 && (
              <path key={`m${c}`} d={`M${x0 + c * cw + 18} ${y0 + r * ch + 40} l12 12 l24 -26`} fill="none" stroke={INK} strokeWidth={4} opacity={0.5} />
            ))}
          </g>
        ))}
        {Array.from({ length: Math.min(done, 15) }, (_, c) => (
          <rect key={`y${c}`} x={x0 + c * cw + 8} y={y0 + 2 * ch + 12} width={cw - 16} height={ch - 24} rx={8} fill={TEAL} stroke={INK} strokeWidth={3}
            transform={c >= cols ? `rotate(${(c - cols) * 3} ${x0 + c * cw} ${y0 + 2 * ch})` : undefined} />
        ))}
      </Sheet>
    </svg>
  );
};

/** The hatch above yours (upper tier, second from the left: the one the hall always draws dark), drawn over the hall's
 *  own in a Deep 0.85 layer: its door swinging up (`open` 0..1) and its counter, dark until `flutter`. */
export const UPPER_POD = { x: 450, y: 395, w: 270, h: 200 };
export const UpperPod: React.FC<{ frame: number; open: number; flutter?: number }> = ({ frame, open, flutter }) => {
  const { x, y, w, h } = UPPER_POD;
  return (
    <g>
      {open > 0 && (
        <g>
          <rect x={x + 16} y={y + 16} width={w - 32} height={h - 32} rx={22} fill="#0a0c16" />
          <rect x={x + 30} y={y + 24} width={60} height={14} rx={6} fill="#ffc46b" opacity={0.9 * open} />
          <rect x={x + 14} y={y + 14} width={w - 28} height={(h - 44) * (1 - open)} rx={22} fill="#1d2338" stroke="#3a4363" strokeWidth={4} />
          <rect x={x + 6} y={y - 6 - 22 * open} width={w - 12} height={22 * open + 8} rx={8} fill="#323a5a" stroke={INK} strokeWidth={4} />
        </g>
      )}
      <Counter frame={frame} x={x + w / 2} y={y - 26} tile={30} at={flutter} dark={flutter === undefined || frame < flutter} />
    </g>
  );
};

/** The hall's front doors at x, and the street beyond; actors slot. */
export const HallDoors: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x} y={500} width={240} height={420} fill="#0e1220" stroke="#4a4f60" strokeWidth={14} />
    <line x1={x + 120} y1={500} x2={x + 120} y2={920} stroke="#4a4f60" strokeWidth={8} />
  </g>
);

/** Drawn cranes standing in the dark the timeline runs into: lattice towers, jibs, a red light each. */
export const Cranes: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    {[2650, 3050, 3450].map((x, i) => {
      const top = 240 + i * 40;
      return (
        <g key={x} opacity={0.85}>
          <rect x={x - 18} y={top} width={36} height={910 - top} fill="none" stroke="#2c3550" strokeWidth={6} />
          {Array.from({ length: Math.floor((910 - top) / 60) }, (_, k) => (
            <path key={k} d={`M${x - 18} ${top + k * 60} L${x + 18} ${top + k * 60 + 60} M${x + 18} ${top + k * 60} L${x - 18} ${top + k * 60 + 60}`} stroke="#2c3550" strokeWidth={3} />
          ))}
          <rect x={x - 220} y={top - 20} width={420} height={20} fill="#2c3550" />
          <line x1={x + 120} y1={top} x2={x + 120} y2={top + 160 + 20 * Math.sin(frame / 40 + i)} stroke="#2c3550" strokeWidth={3} />
          <circle cx={x} cy={top - 30} r={7} fill={CRIMSON} opacity={(frame + i * 20) % 60 < 30 ? 0.9 : 0.3} />
        </g>
      );
    })}
  </g>
);

/** The harbour at dawn (REF coordinates): rows of roofs, each with a small counter that flutters to 365 in a wave from
 *  `wave`; the water; a bridge drawing itself across from `bridge`; a passer-by on the quay from `walk`. */
export const Harbour: React.FC<{ frame: number; wave: number; bridge: number; walk: number }> = ({ frame, wave, bridge, walk }) => {
  const b = ramp(frame, bridge, bridge + 24);
  const span = { x0: 300, x1: 1640, y: 640 };
  const deck = `M${span.x0} ${span.y} L${span.x1} ${span.y}`;
  const arc = `M${span.x0} ${span.y} Q${(span.x0 + span.x1) / 2} ${span.y - 300} ${span.x1} ${span.y}`;
  const walker = { x: mix(200, 1500, linear(frame, walk, walk + 140)), y: 960 };
  return (
    <g>
      <defs>
        <linearGradient id="tm-dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f7c99a" /><stop offset="1" stopColor="#f3e2c4" /></linearGradient>
        <clipPath id="tm-bridge"><rect x={span.x0 - 20} y={0} width={(span.x1 - span.x0 + 40) * b} height={1080} /></clipPath>
      </defs>
      <rect x={-1400} y={-900} width={4800} height={2900} fill="url(#tm-dawn)" />
      {Array.from({ length: 3 }, (_, r) => Array.from({ length: 13 }, (_, i) => {
        const x = -60 + i * 160 + (r % 2) * 80, base = 300 + r * 70;
        const c = ["#7a4b3a", "#8a5c3b", "#6b4b5a"][(i + r) % 3];
        return (
          <g key={`${r}-${i}`}>
            <rect x={x} y={base} width={140} height={120} fill={["#e8b98a", "#d79c7a", "#c9b07a", "#e2c8a0"][(i * 3 + r) % 4]} stroke={INK} strokeWidth={3} />
            <polygon points={`${x - 8},${base} ${x + 70},${base - 50} ${x + 148},${base}`} fill={c} stroke={INK} strokeWidth={3} />
            <Counter frame={frame} x={x + 70} y={base - 60} tile={18} at={wave + Math.round(i * 3 + r * 5 + noise(i + r * 20) * 6)} />
          </g>
        );
      }))}
      <rect x={-1400} y={540} width={4800} height={300} fill="#5f8fb0" />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-100 + i * 280 + ((frame * 0.6) % 60)} ${600 + (i % 3) * 60} q20 -8 40 0`} stroke="#9fc0e0" strokeWidth={4} fill="none" />)}
      <g clipPath="url(#tm-bridge)">
        <path d={arc} fill="none" stroke={INK} strokeWidth={18} />
        <path d={arc} fill="none" stroke={TEAL} strokeWidth={10} />
        {Array.from({ length: 13 }, (_, i) => {
          const t = (i + 1) / 14, x = mix(span.x0, span.x1, t);
          const yA = span.y - 600 * t * (1 - t);
          return <line key={i} x1={x} y1={yA} x2={x} y2={span.y} stroke={INK} strokeWidth={4} />;
        })}
        <path d={deck} stroke={INK} strokeWidth={22} />
        <path d={deck} stroke="#c9b07a" strokeWidth={14} />
      </g>
      {b > 0 && b < 1 && <circle cx={mix(span.x0, span.x1, b)} cy={span.y - 10} r={14} fill={PAPER} stroke={INK} strokeWidth={3} />}
      <rect x={-1400} y={840} width={4800} height={900} fill="#9a9488" stroke={INK} strokeWidth={4} />
      {frame >= walk && (
        <g>
          <Figure x={walker.x} y={walker.y} scale={1.0} facing={1} pose={{ ...walkPose(frame * 0.3), armF: [70, 60] }} head={PASTELS[1]} coat="#3f4a5c"
            time={frame} blink={false} lids={0.5} mouth={Math.floor((frame - walk) / 40) % 2 ? "o" : "flat"} look={{ x: 0.8, y: 0.6 }} />
          <rect x={walker.x + 56} y={walker.y - 236} width={22} height={28} rx={4} fill={PAPER} stroke={INK} strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

/** A sheet held out (the rota in your boss's hand), figure-local units for `held`. */
export const HeldRota: React.FC = () => (
  <g transform="rotate(-8)">
    <rect x={-10} y={-70} width={110} height={80} rx={4} fill={PAPER} stroke={INK} strokeWidth={3} />
    {[0, 1, 2].map((r) => <rect key={r} x={4} y={-58 + r * 22} width={80} height={10} rx={3} fill={r === 1 ? TEAL : INK} opacity={0.6} />)}
  </g>
);

