// Inside a metro coach, side on. From "Nobody Could Say No" (sets/Metro.tsx, view "car": two windows on the city, the
// bench, poles, grab handles, the ad frames, the near pole in front) with the city behind the glass following the mood.
import { EXPRESSIONS } from "../rig/expressions";
import { STAND } from "../rig/pose";
import { INK } from "../theme";
import { FRIEND, HERO, PASTELS } from "./cast";
import { Deep, LIGHTS_ON, noise, OUTSIDE, REF, seat, Sky, type SetDef, type SetProps } from "./common";

const FLOOR = 960;
const SEAT = 860;
const WINDOWS = [{ x: 250, y: 290, w: 620, h: 310 }, { x: 1050, y: 290, w: 620, h: 310 }];
const ADS = [560, 1360];

export interface MetroCoachOptions {
  /** How fast the city slides past, world px a frame (0 standing at a station). */
  speed: number;
  /** Something faint in the dark glass (your reflection), drawn in world units. */
  reflection: React.ReactNode;
  /** Colours of the two ad frames over the windows (null leaves them plain). */
  ads: [string, string] | null;
}

/** The city sliding past: far buildings, lit windows after dark, near poles flashing by. */
const City: React.FC<{ frame: number; mood: SetProps<MetroCoachOptions>["mood"]; speed: number }> = ({ frame, mood, speed }) => {
  const o = OUTSIDE[mood];
  const TILE = 2400;
  const off = -((frame * speed) % TILE);
  return (
    <>
      <Sky id="metro-coach" mood={mood} x={-1400} y={-600} w={4800} h={1700} sunAt={{ x: 1300, y: 330 }} />
      {[0, 1, 2].map((rep) => (
        <g key={rep} transform={`translate(${off + (rep - 1) * TILE} 0)`}>
          {Array.from({ length: 16 }, (_, i) => {
            const bx = i * 150;
            const h = 140 + noise(i + 3) * 260;
            return (
              <g key={i}>
                <rect x={bx} y={640 - h} width={140} height={h + 300} fill={o.dark ? "#262c52" : ["#d9b99a", "#c7d6cf", "#e6cd98"][i % 3]} />
                {Array.from({ length: Math.floor(h / 50) * 2 }, (_, w) => (
                  <rect key={w} x={bx + 24 + (w % 2) * 56} y={640 - h + 20 + Math.floor(w / 2) * 50} width={34} height={24} rx={3}
                    fill={noise(i * 13 + w) < o.lit ? "#ffe9a8" : o.dark ? "#1a1f3d" : "rgba(40,50,60,.2)"} />
                ))}
              </g>
            );
          })}
        </g>
      ))}
      {speed > 0 && Array.from({ length: 6 }, (_, i) => {
        const x = (((i * 520 - frame * speed * 2.6) % 3000) + 3000) % 3000 - 400;
        return <rect key={i} x={x} y={200} width={26} height={600} fill={o.dark ? "#0c0e1e" : "#5a6470"} opacity={0.8} />;
      })}
    </>
  );
};

const Back: React.FC<SetProps<MetroCoachOptions>> = ({ cam, mood, frame, options }) => {
  const dark = OUTSIDE[mood].dark;
  const wall = dark ? "#aab4c2" : "#cfd8d6";
  const holes = WINDOWS.map((w) => `M${w.x + 30} ${w.y} H${w.x + w.w - 30} Q${w.x + w.w} ${w.y} ${w.x + w.w} ${w.y + 30} V${w.y + w.h - 30} Q${w.x + w.w} ${w.y + w.h} ${w.x + w.w - 30} ${w.y + w.h} H${w.x + 30} Q${w.x} ${w.y + w.h} ${w.x} ${w.y + w.h - 30} V${w.y + 30} Q${w.x} ${w.y} ${w.x + 30} ${w.y}Z`).join(" ");
  return (
    <>
      <Deep cam={cam} depth={0.35} flat><City frame={frame} mood={mood} speed={options.speed} /></Deep>
      <Deep cam={cam} depth={1}>
        <path d={`M-1400 -800 H3400 V1800 H-1400Z ${holes}`} fillRule="evenodd" fill={wall} />
        {WINDOWS.map((w, i) => (
          <g key={i}>
            <clipPath id={`coach-win-${i}`}><rect x={w.x} y={w.y} width={w.w} height={w.h} rx={30} /></clipPath>
            <g clipPath={`url(#coach-win-${i})`}>
              <rect x={w.x} y={w.y} width={w.w} height={w.h} fill={dark ? "#0b0d1c" : "#ffffff"} opacity={dark ? 0.25 : 0.12} />
              {options.reflection && <g opacity={dark ? 0.42 : 0.22}>{options.reflection}</g>}
              <path d={`M${w.x + 80} ${w.y + w.h} L${w.x + 220} ${w.y}`} stroke="#fff" strokeWidth={26} opacity={0.08} />
            </g>
            <rect x={w.x} y={w.y} width={w.w} height={w.h} rx={30} fill="none" stroke="#5c6675" strokeWidth={14} />
          </g>
        ))}
        {/* ceiling, grab rail and handles */}
        <rect x={-1400} y={-800} width={4800} height={900} fill={dark ? "#8e98a8" : "#b9c4c4"} />
        <rect x={-1400} y={60} width={4800} height={14} rx={6} fill="#eef4ff" opacity={0.8} />
        <rect x={-1400} y={96} width={4800} height={10} fill="#5c6675" />
        {Array.from({ length: 12 }, (_, i) => -400 + i * 260).map((x) => (
          <g key={x}><line x1={x} y1={106} x2={x} y2={150} stroke="#5c6675" strokeWidth={5} /><circle cx={x} cy={166} r={16} fill="none" stroke="#5c6675" strokeWidth={6} /></g>
        ))}
        {ADS.map((x, i) => (
          <g key={x}>
            <rect x={x - 170} y={165} width={340} height={80} rx={8} fill={dark ? "#7f8a9c" : "#a9b5b5"} stroke="#5c6675" strokeWidth={5} />
            {options.ads && <rect x={x - 156} y={177} width={312} height={56} rx={4} fill={options.ads[i]} />}
            {options.ads && <circle cx={x - 110} cy={205} r={18} fill="#f3e9d7" />}
          </g>
        ))}
        {/* the bench under the windows, the floor */}
        <rect x={-1400} y={600} width={4800} height={260} fill={dark ? "#3c5f7a" : "#41708c"} />
        {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-1300 + i * 220} y={612} width={8} height={240} fill="#000" opacity={0.12} />)}
        <rect x={-1400} y={SEAT - 6} width={4800} height={34} rx={10} fill={dark ? "#4a7090" : "#4f82a0"} stroke={INK} strokeWidth={4} />
        <rect x={-1400} y={SEAT + 28} width={4800} height={80} fill="#4a5262" />
        <rect x={-1400} y={FLOOR} width={4800} height={600} fill="#5d6574" />
        <rect x={-1400} y={FLOOR} width={4800} height={10} fill="#3d4352" />
        {[960].map((x) => <rect key={x} x={x - 14} y={100} width={28} height={FLOOR - 100} rx={14} fill="#c8ccd2" stroke={INK} strokeWidth={5} />)}
      </Deep>
    </>
  );
};

/** The near pole, soft in front of everyone. */
const Front: React.FC<SetProps<MetroCoachOptions>> = ({ cam }) => (
  <Deep cam={cam} depth={1.35}><rect x={120} y={-400} width={46} height={1800} rx={23} fill="#c8ccd2" stroke={INK} strokeWidth={6} /></Deep>
);

export const metroCoach: SetDef<MetroCoachOptions> = {
  name: "metro-coach",
  about: "inside a metro coach: the city sliding past two windows, the bench, poles and handles, a reflection in the glass",
  spots: {
    window: seat(1480, SEAT, 1.1, -1),
    seat: seat(1220, SEAT, 1.1, -1),
    seatLeft: seat(520, SEAT, 1.1, 1),
    pole: { x: 846, y: FLOOR + 20, scale: 1.2, facing: 1 },
    aisle: { x: 640, y: FLOOR + 20, scale: 1.2, facing: 1 },
  },
  cameras: {
    wide: REF,
    windowSeat: { x: 1340, y: 640, zoom: 1.6 },
    pole: { x: 880, y: 560, zoom: 1.5 },
  },
  lights: () => [{ x: 960, y: 70, r: 700, color: "#eef4ff", strength: 0.25, moods: LIGHTS_ON }],
  defaults: { speed: 6, reflection: null, ads: ["#1d9a8f", "#d8344f"] },
  Back,
  Front,
  example: {
    camera: "wide",
    cast: [
      { spot: "window", who: { ...FRIEND, look: { x: 0.2, y: 0.5 } }, face: EXPRESSIONS.sceptical },
      { spot: "seatLeft", who: { head: PASTELS[1], coat: "#7a5a8c" }, face: EXPRESSIONS.neutral },
      { spot: "pole", who: { ...HERO, look: { x: 0.9, y: 0 } }, face: EXPRESSIONS.worried, pose: { ...STAND, armF: [92, 8] } },
    ],
  },
};
