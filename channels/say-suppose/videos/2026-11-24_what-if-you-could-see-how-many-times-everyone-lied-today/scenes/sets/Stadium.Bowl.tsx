// The Stadium beat's set, look C: the painted stadium-night plate (the bowl seen from high in the stands, the pitch
// floodlit, glass boxes up on either side) with what only this premise shows drawn in code over it: sixty thousand dim
// counters over the painted seats like frost on a window (zeros frost-white, ones a touch warmer, a few twinkling as
// people click), the directors' box in the right-hand glass blazing with a dozen double digits like a bonfire, the
// commentary box glowing above it, the floodlights going off, and a paper subscribe tag on one hoarding. World units
// as the plate. No AI images.
import { AbsoluteFill } from "remotion";
import type { SetLight } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import { Counter } from "../parts/Counter";
import { plateBlur, PlateScene } from "../parts/Plate";
import { pw } from "../parts/Rival.Shots";
import { PaperTag } from "../parts/SayItAgain.Kit";
import { mix, noise } from "../shared";

/** The bowl's centre and the pitch's edge in plate pixels (the 1536 x 864 painting). */
const BOWL = { u: 762, v: 612 };

type Seat = { x: number; y: number; w: number; one: boolean };

/** A counter over every painted seat: rows of ellipses round the pitch, skipping the glass boxes and the sky. */
const SEATS: Seat[] = (() => {
  const out: Seat[] = [];
  const rows = 28;
  for (let r = 0; r < rows; r++) {
    const t = r / (rows - 1);
    const rx = mix(432, 1090, t), ry = mix(180, 340, t);
    const n = Math.round(240 + t * 420);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (r % 2) * (Math.PI / n);
      const u = BOWL.u + Math.cos(a) * rx, v = BOWL.v + Math.sin(a) * ry;
      if (u < 4 || u > 1532 || v < 292 || v > 860) continue;
      if ((u < 338 && v < 398) || (u > 1188 && v < 398)) continue;
      const near = Math.min(1, Math.max(0, (v - 290) / 570));
      const p = pw(u + (noise(r * 991 + i) - 0.5) * 3, v);
      out.push({ ...p, w: mix(3.2, 9.5, near * near), one: noise(r * 997 + i) > 0.6 });
    }
  }
  return out;
})();

const rectPath = (s: Seat) => `M${s.x.toFixed(1)} ${s.y.toFixed(1)}h${s.w.toFixed(1)}v${(s.w * 0.8).toFixed(1)}h${(-s.w).toFixed(1)}Z`;
const ZEROS = SEATS.filter((s) => !s.one).map(rectPath).join("");
const ONES = SEATS.filter((s) => s.one).map(rectPath).join("");

/** The frost: every counter in the stands, `on` 0..1 as the floodlights go off; a few twinkle as people click. */
export const Frost: React.FC<{ frame: number; on: number }> = ({ frame, on }) => {
  if (on <= 0) return null;
  const flash = SEATS.filter((_, i) => noise(i * 13 + Math.floor(frame / 9)) > 0.9988).map(rectPath).join("");
  return (
    <g opacity={on}>
      <defs><filter id="frost-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={4} /></filter></defs>
      <g filter="url(#frost-glow)" opacity={0.8}>
        <path d={ZEROS} fill="#cfe3ff" />
        <path d={ONES} fill="#ffd98a" />
      </g>
      <path d={ZEROS} fill="#dceaff" opacity={0.62} />
      <path d={ONES} fill="#ffe9b0" opacity={0.78} />
      <path d={flash} fill="#fff4c0" stroke="#ffcf5a" strokeWidth={3} />
    </g>
  );
};

const BOX_COUNTS = [12, 31, 17, 44, 26, 19, 38, 23, 15, 41, 29, 33];
/** The directors' box: the lit lower floor of the right-hand glass box. */
export const BOX = { x: 1790, y: 372 };

/** The directors' box ablaze and the commentary box over it: their counters and their fire. */
export const BoxFire: React.FC<{ frame: number; ticks: number[] }> = ({ frame, ticks }) => {
  const g = 0.85 + Math.sin(frame / 5) * 0.08 + Math.sin(frame / 2.3) * 0.05;
  return (
    <g>
      <defs>
        <radialGradient id="box-fire" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffb347" stopOpacity={0.8} />
          <stop offset="0.45" stopColor="#ff7a2a" stopOpacity={0.32} />
          <stop offset="1" stopColor="#ff5a1a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={BOX.x} cy={BOX.y} rx={300 * g} ry={170 * g} fill="url(#box-fire)" />
      <ellipse cx={BOX.x} cy={205} rx={150} ry={60} fill="url(#box-fire)" opacity={0.45} />
      {BOX_COUNTS.map((n, i) => (
        <Counter key={i} x={BOX.x - 100 + (i % 4) * 66} y={BOX.y - 62 + Math.floor(i / 4) * 54} base={n} glow="#ff9a4a"
          ticks={ticks.filter((_, j) => j % 12 === i)} frame={frame} size={17} id={`box${i}`} />
      ))}
      {[7, 9, 5].map((n, i) => <Counter key={i} x={BOX.x - 50 + i * 50} y={210} base={n} frame={frame} size={14} id={`comm${i}`} />)}
    </g>
  );
};

/** The two painted floodlights, going dark: `off` 0..1. */
const FloodsOff: React.FC<{ off: number }> = ({ off }) => (
  <g opacity={off}>
    {[pw(345, 210), pw(1229, 208)].map((p, i) => (
      <g key={i}>
        <ellipse cx={p.x} cy={p.y} rx={90} ry={70} fill="#0b0d1c" opacity={0.75} />
        <ellipse cx={p.x} cy={p.y} rx={52} ry={40} fill="#3a3e50" />
      </g>
    ))}
  </g>
);

/** The stadium at night on the plate: `off` 0..1 the floodlights going off (the plate dims, the frost comes up). */
export const StadiumScene: React.FC<{
  cam: Camera; mood: MoodName; frame: number; off: number; boxTicks?: number[]; lights?: SetLight[];
  actors?: React.ReactNode; front?: React.ReactNode; over?: React.ReactNode;
}> = ({ cam, mood, frame, off, boxTicks = [], lights = [], actors, front, over }) => {
  const hoarding = pw(905, 768);
  const boxLight: SetLight = { x: BOX.x, y: BOX.y, r: 420, color: "#ff8a3a", strength: 0.32, moods: [mood] };
  // the code-drawn stadium goes soft with the painted one as the camera closes in
  const sd = Math.round((plateBlur(cam.zoom) / cam.zoom) * 4) / 4;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <PlateScene plate="stadium-night" cam={cam} mood={mood} rim="cool" rimFrom="right" dim={mix(1, 0.5, off)} lights={[boxLight, ...lights]}
        behind={
          <>
            <g filter={sd > 0 ? `url(#stadium-soft-${sd * 4})` : undefined}>
              {sd > 0 && <defs><filter id={`stadium-soft-${sd * 4}`} x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={sd} /></filter></defs>}
              <FloodsOff off={off} />
              <Frost frame={frame} on={0.25 + 0.75 * off} />
              <PaperTag frame={frame} at={-1000} x={hoarding.x} y={hoarding.y} text="SUBSCRIBE" size={14} tilt={-2} />
            </g>
            {/* the box stays sharp: the camera only closes on it to read it */}
            <BoxFire frame={frame} ticks={boxTicks} />
          </>
        }
        actors={actors} front={front} />
      {over}
    </AbsoluteFill>
  );
};
