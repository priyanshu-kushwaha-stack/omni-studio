// The courtyard of a family house, side on. From "Find Anything Ever Lost" (Late.tsx Yard and Tulsi, Street.tsx
// Courtyard: the tulsi on its plinth, the neem tree) and "Nobody Could Say No" (sets/MothersHouse.tsx: the tulsi pot,
// the house front and its step), with the neighbours' roofs and water tanks beyond and a charpai to sit on.
import { EXPRESSIONS } from "../rig/expressions";
import { INK } from "../theme";
import { ELDER, HERO } from "./cast";
import { Deep, defineSet, lightsOn, noise, OUTSIDE, seatedY, Sky, type SetProps } from "./common";
import { ChaiGlass } from "./props";

const FLOOR = 960;
const TULSI = { x: 1000, top: 760 };
const CHARPAI = { from: 1300, to: 1720, top: 850 };
const DOOR = { x: 300, top: 470 };

export interface CourtyardOptions {
  /** The clothesline with washing across the back. */
  washing: boolean;
  /** A diya lit at the tulsi's foot (it glows after dark). */
  diya: boolean;
  /** A steel glass of chai on the charpai. */
  chai: boolean;
}

const Neem: React.FC<{ frame: number; dark: boolean }> = ({ frame, dark }) => (
  <g>
    <path d="M1560 760 L1590 420 L1550 220 L1610 90" fill="none" stroke="#6b4a33" strokeWidth={60} strokeLinecap="round" />
    {[[1440, 200], [1680, 160], [1560, 70], [1740, 310], [1410, 350], [1620, 280], [1300, 260]].map(([x, y], i) => (
      <ellipse key={i} cx={x} cy={y} rx={180} ry={104} fill={dark ? ["#2f4a3a", "#284234", "#35523f"][i % 3] : ["#5a8a3a", "#4f7f34", "#6a9a48"][i % 3]}
        transform={`rotate(${Math.sin(frame / 40 + i) * 3} ${x} ${y})`} />
    ))}
  </g>
);

const Back: React.FC<SetProps<CourtyardOptions>> = ({ cam, mood, frame, options }) => {
  const o = OUTSIDE[mood];
  const on = lightsOn(mood);
  return (
    <>
      <Deep cam={cam} depth={0.25} flat>
        <Sky id="courtyard" mood={mood} x={-1400} y={-800} w={4800} h={1700} sunAt={{ x: 620, y: 200 }} />
      </Deep>
      <Deep cam={cam} depth={0.45} flat>
        {/* the neighbours' roofs: flat tops, water tanks, a dish */}
        {Array.from({ length: 10 }, (_, i) => {
          const x = -1100 + i * 460;
          const top = 380 + noise(i + 2) * 90;
          return (
            <g key={i}>
              <rect x={x} y={top} width={440} height={600} fill={o.dark ? "#2a2f52" : ["#e4b48e", "#e6cd98", "#a3c7bf", "#dc9d8f"][i % 4]} />
              <rect x={x + 60} y={top - 70} width={90} height={70} rx={10} fill={o.dark ? "#1a1e38" : "#2f3340"} />
              <rect x={x + 250} y={top + 60} width={70} height={60} rx={6} fill={noise(i + 9) < o.lit + 0.1 ? "#ffe39a" : o.dark ? "#1a1f3d" : "#6c7f8f"} />
            </g>
          );
        })}
      </Deep>
      <Deep cam={cam} depth={0.7}>
        {/* the courtyard's back wall and the neem leaning over it */}
        <rect x={-1400} y={560} width={4800} height={400} fill={o.dark ? "#a98d72" : "#e6d7b6"} />
        <rect x={-1400} y={548} width={4800} height={18} fill={o.dark ? "#8a7058" : "#cbb48c"} />
        <Neem frame={frame} dark={o.dark} />
        {options.washing && (
          <g>
            <path d="M-200 600 Q700 660 1300 600" fill="none" stroke={INK} strokeWidth={3} />
            {[[80, "#d8344f", 120], [300, "#1d9a8f", 90], [520, "#f2b632", 160], [820, "#7fa0c4", 110], [1040, "#e6a0a0", 100]].map(([x, c, h], i) => (
              <path key={i} d={`M${x} ${620 + (i % 2) * 6} h${70 + i * 6} l-6 ${h} h${-58 - i * 6}Z`} fill={String(c)} stroke={INK} strokeWidth={3} />
            ))}
          </g>
        )}
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={FLOOR - 40} width={4800} height={800} fill={o.dark ? "#8a7458" : "#cdb98f"} />
        {Array.from({ length: 20 }, (_, i) => <line key={i} x1={-1400 + i * 240} y1={FLOOR - 40} x2={-1400 + i * 240 - 100} y2={1700} stroke="#000" strokeWidth={3} opacity={0.08} />)}
        {/* the house: its side wall at the left, the door and the step */}
        <rect x={-1400} y={200} width={1900} height={FLOOR - 240} fill={o.dark ? "#c99a7a" : "#f0c9a0"} stroke={INK} strokeWidth={6} />
        <rect x={DOOR.x - 100} y={DOOR.top} width={200} height={FLOOR - 40 - DOOR.top} fill={on ? "#ffd99a" : "#6b3f2a"} stroke={INK} strokeWidth={6} />
        {!on && <circle cx={DOOR.x + 64} cy={720} r={8} fill="#e8c23a" />}
        <rect x={DOOR.x - 150} y={FLOOR - 50} width={300} height={30} fill="#bfb3a0" stroke={INK} strokeWidth={5} />
        <path d={`M${DOOR.x - 120} ${DOOR.top - 10} H${DOOR.x + 120}`} stroke="#5aa04a" strokeWidth={12} strokeDasharray="20 10" />
        {/* the tulsi on its painted plinth */}
        <path d={`M${TULSI.x - 80} ${FLOOR - 40} L${TULSI.x - 66} ${TULSI.top} H${TULSI.x + 66} L${TULSI.x + 80} ${FLOOR - 40}Z`} fill="#d8763f" stroke={INK} strokeWidth={5} />
        <rect x={TULSI.x - 84} y={TULSI.top - 16} width={168} height={22} rx={4} fill="#c96f2d" stroke={INK} strokeWidth={4} />
        <path d={`M${TULSI.x - 24} ${TULSI.top + 70} q24 -40 48 0 q-24 40 -48 0`} fill="#f3e9d7" />
        {[-40, -16, 8, 32].map((dx, i) => (
          <g key={dx}>
            <line x1={TULSI.x + dx * 0.4} y1={TULSI.top - 14} x2={TULSI.x + dx} y2={TULSI.top - 120 - i * 10} stroke="#3f6b3a" strokeWidth={5} />
            {[0.4, 0.7, 1].map((p) => (
              <ellipse key={p} cx={TULSI.x + dx * (0.4 + 0.6 * p)} cy={TULSI.top - 14 - (106 + i * 10) * p} rx={15} ry={8} fill="#5ba06f"
                transform={`rotate(${dx} ${TULSI.x + dx * (0.4 + 0.6 * p)} ${TULSI.top - 14 - (106 + i * 10) * p})`} />
            ))}
          </g>
        ))}
        {options.diya && (
          <g transform={`translate(${TULSI.x - 120} ${FLOOR - 44})`}>
            <path d="M-18 0 Q0 14 18 0Z" fill="#c96f2d" stroke={INK} strokeWidth={3} />
            <path d={`M0 -4 Q${-6 + Math.sin(frame / 3) * 2} -18 0 -30 Q6 -18 0 -4Z`} fill="#ffcf5a" />
          </g>
        )}
        {/* the charpai: wooden frame, woven top */}
        <rect x={CHARPAI.from} y={CHARPAI.top} width={CHARPAI.to - CHARPAI.from} height={22} rx={6} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={CHARPAI.from + 20 + i * 33} y1={CHARPAI.top + 4} x2={CHARPAI.from + 36 + i * 33} y2={CHARPAI.top + 18} stroke="#e6d2a0" strokeWidth={4} />)}
        {[CHARPAI.from + 10, CHARPAI.to - 30].map((x) => <rect key={x} x={x} y={CHARPAI.top + 20} width={20} height={FLOOR - CHARPAI.top - 40} fill="#6a4630" />)}
        {options.chai && <ChaiGlass x={CHARPAI.to - 70} y={CHARPAI.top} scale={0.8} />}
      </Deep>
    </>
  );
};

export const courtyard = defineSet<CourtyardOptions>({
  name: "courtyard",
  about: "family courtyard: the tulsi on its plinth, a neem over the back wall, washing, a charpai, the house door",
  spots: {
    tulsi: { x: 860, y: FLOOR, scale: 1.15, facing: 1 },
    charpai: { x: 1470, y: seatedY(CHARPAI.top, 1.1), scale: 1.1, facing: -1, sit: true },
    door: { x: DOOR.x + 40, y: FLOOR - 50, scale: 1.15, facing: 1 },
    yard: { x: 1180, y: FLOOR + 20, scale: 1.2, facing: -1 },
  },
  cameras: {
    wide: { x: 960, y: 540, zoom: 1 },
    tulsi: { x: 980, y: 660, zoom: 1.6 },
    charpai: { x: 1380, y: 650, zoom: 1.5 },
  },
  lights: [
    { x: DOOR.x, y: 650, r: 380, color: "#ffd99a", strength: 0.45, moods: ["dusk", "night", "lamp"] },
    { x: TULSI.x - 120, y: FLOOR - 70, r: 160, color: "#ffcf5a", strength: 0.6, moods: ["dusk", "night", "lamp"] },
  ],
  defaults: { washing: true, diya: true, chai: true },
  Back,
  example: {
    camera: "wide",
    cast: [
      { spot: "charpai", who: { ...ELDER, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.happy },
      { spot: "tulsi", who: { ...HERO, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.sceptical },
    ],
  },
});
