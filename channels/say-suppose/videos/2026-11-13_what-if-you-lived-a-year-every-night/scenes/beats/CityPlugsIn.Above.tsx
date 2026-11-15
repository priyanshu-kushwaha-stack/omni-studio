// The City Plugs In, "Inside is filling up." (story line 48): the inside town from above at dusk, the counter-sun
// blurring over it. Paper roofs spread from the old centre to the edge of the frame as new blocks draw themselves
// (an outline first, then the roof drops in), and every face from the montage walks the lanes, seen from overhead: the
// student, the surgeon in her cap, the bride in her veil, the kids in caps, the old sleeper, a crowd thickening.
import { AbsoluteFill } from "remotion";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK } from "@whatif/kit/theme";
import { SkyCounter } from "../sets/InsideTown";
import { camAt, linear, noise, OLD, PASTELS } from "../shared";
import { OwnSet } from "./CityPlugsIn.Kit";

const CX = 960;
const CY = 540;
const BW = 240;
const BH = 170;
const PX = 310;
const PY = 240;
const ROOFS = ["#c96f4a", "#b85c46", "#d98a5a", "#a8664e", "#c9a07a", "#8f5a48", "#d0a066"];
const MAXD = Math.hypot(6 * PX, 4 * PY);

interface Block { c: number; r: number; d: number }
const BLOCKS: Block[] = [];
for (let c = -6; c <= 6; c++) for (let r = -4; r <= 4; r++) BLOCKS.push({ c, r, d: Math.hypot(c * PX, r * PY) });

/** How far the town has grown at this frame: the radius (world px) inside which blocks exist. */
const reachAt = (frame: number, start: number, end: number) => 420 + (MAXD + 200 - 420) * linear(frame, start, end - 10);

const BlockView: React.FC<{ b: Block; grow: number; seed: number }> = ({ b, grow, seed }) => {
  const x = CX + b.c * PX - BW / 2, y = CY + b.r * PY - BH / 2;
  const outline = Math.min(1, grow * 2);
  const fill = Math.max(0, grow * 2 - 1);
  const park = noise(seed + 4) > 0.86;
  return (
    <g>
      <rect x={x} y={y} width={BW} height={BH} rx={10} fill="none" stroke="#f3e9d7" strokeWidth={8} pathLength={1} strokeDasharray={`${outline} 1`} />
      {fill > 0 && (
        <g transform={`translate(${x + BW / 2} ${y + BH / 2}) scale(${0.85 + 0.15 * fill}) translate(${-(x + BW / 2)} ${-(y + BH / 2)})`} opacity={fill}>
          {park ? (
            <g>
              <rect x={x} y={y} width={BW} height={BH} rx={10} fill="#8fb37a" stroke={INK} strokeWidth={5} />
              {[0, 1, 2, 3, 4].map((t) => <circle key={t} cx={x + 30 + noise(seed + t) * (BW - 60)} cy={y + 30 + noise(seed + t + 9) * (BH - 60)} r={22} fill="#5f8f5a" stroke={INK} strokeWidth={4} />)}
            </g>
          ) : (
            [0, 1].map((k) => {
              const rx = x + k * (BW / 2) + 6, rw = BW / 2 - 12;
              const col = ROOFS[Math.floor(noise(seed + k) * ROOFS.length)];
              return (
                <g key={k}>
                  <rect x={rx + 8} y={y + 12} width={rw} height={BH - 12} rx={6} fill="#000" opacity={0.25} />
                  <rect x={rx} y={y + 4} width={rw} height={BH - 12} rx={6} fill={col} stroke={INK} strokeWidth={5} />
                  <line x1={rx + rw / 2} y1={y + 8} x2={rx + rw / 2} y2={y + BH - 12} stroke={INK} strokeWidth={4} opacity={0.5} />
                  <rect x={rx + rw / 2 + 14} y={y + 26} width={16} height={22} fill="#7a4b3a" stroke={INK} strokeWidth={3} />
                </g>
              );
            })
          )}
        </g>
      )}
    </g>
  );
};

/** Someone seen from overhead: shoulders and a head; `kind` 1 student, 2 surgeon (teal cap), 3 bride (veil), 4 kid
 *  (navy cap), 5 the old sleeper (grey), else a pastel head. */
const Overhead: React.FC<{ x: number; y: number; kind: number; seed: number; angle: number }> = ({ x, y, kind, seed, angle }) => {
  const head = kind === 1 ? PASTELS[6] : kind === 5 ? OLD.head : PASTELS[seed % PASTELS.length];
  const coat = kind === 1 || kind === 4 ? "#2f3e6a" : kind === 2 ? "#5aa08f" : kind === 3 ? "#fbf6ee" : kind === 5 ? OLD.coat : ["#3f4a5c", "#5c3f4a", "#4a5c3f", "#6a5a4c"][seed % 4];
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <ellipse cx={5} cy={6} rx={26} ry={16} fill="#000" opacity={0.25} />
      {kind === 3 && <path d="M-6 -14 L-40 -22 L-40 22 L-6 14Z" fill="#fffaf0" stroke="#e9e1cf" strokeWidth={3} />}
      <ellipse rx={26} ry={15} fill={coat} stroke={INK} strokeWidth={4} />
      <circle r={14} fill={head} stroke={INK} strokeWidth={3} />
      {(kind === 2 || kind === 4) && <circle r={10} fill={kind === 2 ? "#5aa08f" : "#2f3e6a"} />}
    </g>
  );
};

export const AboveShot: React.FC<{ frame: number; start: number; end: number }> = ({ frame, start, end }) => {
  const reach = reachAt(frame, start, end);
  const cam: Camera = camAt(frame, [[start, { x: CX, y: CY + 20, zoom: 1.7 }], [end, { x: CX, y: CY, zoom: 0.62 }]]);
  const walkers = Array.from({ length: 90 }, (_, i) => {
    const horiz = noise(i + 1) > 0.5;
    const lane = Math.floor(noise(i + 2) * 8) - 4;
    const dir = noise(i + 3) > 0.5 ? 1 : -1;
    const speed = 2 + noise(i + 4) * 2.5;
    const span = horiz ? 13 * PX : 9 * PY;
    const along = ((((noise(i + 5) * span + dir * (frame - start) * speed) % span) + span) % span) - span / 2;
    const x = horiz ? CX + along : CX + (lane + 0.5) * PX;
    const y = horiz ? CY + (lane + 0.5) * PY : CY + along;
    const kind = i < 12 ? (i % 5) + 1 : 0;
    const angle = horiz ? (dir > 0 ? 0 : 180) : dir > 0 ? 90 : -90;
    return { x, y, kind, angle, i, on: Math.hypot(x - CX, y - CY) < reach - 60 };
  }).filter((w) => w.on);
  return (
    <>
      <OwnSet mood="dusk" cam={cam} back={<rect x={-3000} y={-2000} width={8000} height={5000} fill="#b9a68c" />}>
        {BLOCKS.map((b, i) => (b.d < reach ? <BlockView key={i} b={b} grow={Math.min(1, (reach - b.d) / 220)} seed={i * 3} /> : null))}
        {walkers.map((w) => <Overhead key={w.i} x={w.x} y={w.y} kind={w.kind} seed={w.i} angle={w.angle} />)}
        {/* the old square at the centre, where you came in: a crimson-paved plaza */}
        <circle cx={CX + PX / 2} cy={CY + PY / 2} r={34} fill={CRIMSON} stroke={INK} strokeWidth={5} />
      </OwnSet>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <svg width={1920} height={1080} viewBox="0 0 1920 1080">
          <circle cx={1660} cy={170} r={260} fill="#ffcf8a" opacity={0.18} />
          <g transform="translate(1660 170) scale(0.8) translate(-960 -150)"><SkyCounter frame={frame} /></g>
        </svg>
      </AbsoluteFill>
    </>
  );
};
