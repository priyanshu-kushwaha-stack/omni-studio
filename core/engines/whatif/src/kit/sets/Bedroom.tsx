// Your bedroom, side on. From the pause sample's Bedroom (the window with red curtains, the bed, the bedside table
// with the alarm clock, the framed picture), the pause film's Opening.Bedroom (the phone on the bedside) and
// "60 Seconds" (sets.tsx Bedroom: the desk and its lamp). The window shows the mood; the lamp lights at night.
import { EXPRESSIONS } from "../rig/expressions";
import { INK } from "../theme";
import { HERO } from "./cast";
import { Chair, Deep, LIGHTS_ON, lightsOn, MOOD_NAMES, OUTSIDE, REF, seat, Window, type SetDef, type SetProps } from "./common";
import { Books, Laptop } from "./props";

const FLOOR = 960;
const BED = { from: 560, to: 1180, top: 790 };
const DESK = { from: 1380, to: 1820, top: 740 };
const LAMP = { x: 1740, y: 560 };
const CHAIR = { x: 1330, top: 880 };

export interface BedroomOptions {
  /** The desk lamp: null follows the mood (on after dark), or force it. */
  lamp: boolean | null;
  /** The alarm clock's hour hand, 0-12. */
  hour: number;
  /** The phone on the bedside table lights up (a message). */
  phoneLit: boolean;
  /** The curtains, 0 drawn back to 1 closed. */
  curtains: number;
  /** What is on the desk. */
  desk: "laptop" | "books" | "both";
}

const Back: React.FC<SetProps<BedroomOptions>> = ({ cam, mood, frame, options }) => {
  const lampOn = options.lamp ?? lightsOn(mood);
  const dark = OUTSIDE[mood].dark;
  const c = Math.min(1, Math.max(0, options.curtains));
  const sway = Math.sin(frame / 19) * 6;
  const hand = (options.hour % 12) * 30;
  return (
    <>
      <Deep cam={cam} depth={0.85} flat>
        <rect x={-1400} y={-800} width={4800} height={2400} fill={dark ? "#c99a7a" : "#f0c9a0"} />
        <rect x={-1400} y={FLOOR - 120} width={4800} height={14} fill="#c08a64" />
        <Window id="bedroom" mood={mood} x={200} y={190} w={400} h={400} frame="#7a4a32" />
        <rect x={182} y={168} width={436} height={22} rx={4} fill={INK} />
        <path d={`M190 190 H${300 + c * 110 + sway} Q${270 + c * 110 + sway} 420 ${250 + c * 110 + sway} 610 H190Z`} fill="#d8344f" opacity={0.9} />
        <path d={`M610 190 H${500 - c * 110 - sway} Q${530 - c * 110 - sway} 420 ${550 - c * 110 - sway} 610 H610Z`} fill="#d8344f" opacity={0.9} />
        {/* a framed picture and a cricket poster */}
        <rect x={800} y={250} width={190} height={230} rx={6} fill="#fff6e3" stroke={INK} strokeWidth={8} />
        <path d="M830 450 L885 350 L920 410 L945 375 L965 450Z" fill="#7fc29b" />
        <rect x={1180} y={240} width={170} height={240} fill="#1d9a8f" stroke={INK} strokeWidth={5} />
        <circle cx={1265} cy={320} r={34} fill="#f2b632" />
        <rect x={1215} y={380} width={100} height={14} rx={7} fill="#f3e9d7" />
        <rect x={1235} y={408} width={60} height={14} rx={7} fill="#f3e9d7" />
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={FLOOR - 100} width={4800} height={800} fill="#b5764a" />
        <ellipse cx={980} cy={FLOOR - 40} rx={520} ry={44} fill="#d9a766" />
        {/* the bed: headboard, frame, mattress, sheet, pillow */}
        <rect x={BED.from - 30} y={BED.top - 230} width={44} height={FLOOR - BED.top + 230 - 60} rx={14} fill="#6f4a2f" />
        <rect x={BED.to - 30} y={BED.top - 90} width={36} height={FLOOR - BED.top + 30} rx={12} fill="#6f4a2f" />
        <rect x={BED.from} y={BED.top} width={BED.to - BED.from} height={90} rx={16} fill="#fff6e3" stroke={INK} strokeWidth={4} />
        <rect x={BED.from + 160} y={BED.top - 12} width={BED.to - BED.from - 150} height={70} rx={20} fill="#7fa0c4" stroke={INK} strokeWidth={4} />
        <ellipse cx={BED.from + 80} cy={BED.top - 16} rx={84} ry={33} fill="#fffaf0" stroke={INK} strokeWidth={4} />
        {/* the bedside table, the alarm clock and the phone */}
        <rect x={360} y={BED.top - 10} width={160} height={FLOOR - BED.top - 50} rx={8} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
        <circle cx={410} cy={BED.top - 72} r={44} fill="#fff6e3" stroke={INK} strokeWidth={9} />
        <line x1={410} y1={BED.top - 72} x2={410 + Math.sin((hand * Math.PI) / 180) * 26} y2={BED.top - 72 - Math.cos((hand * Math.PI) / 180) * 26} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <line x1={410} y1={BED.top - 72} x2={410} y2={BED.top - 108} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <rect x={462} y={BED.top - 30} width={36} height={20} rx={4} fill={options.phoneLit ? "#cfe9f4" : "#1b1d24"} stroke={INK} strokeWidth={3} />
        {/* the study desk, the lamp, the chair */}
        <rect x={DESK.from} y={DESK.top} width={DESK.to - DESK.from} height={22} rx={5} fill="#8a5c3b" stroke={INK} strokeWidth={5} />
        <rect x={DESK.from + 20} y={DESK.top + 22} width={18} height={FLOOR - DESK.top - 80} fill="#6a4630" />
        <rect x={DESK.to - 38} y={DESK.top + 22} width={18} height={FLOOR - DESK.top - 80} fill="#6a4630" />
        {options.desk !== "books" && <Laptop x={1560} y={DESK.top} scale={0.9} screen={lampOn || !dark ? "code" : "off"} />}
        {options.desk !== "laptop" && <Books x={1450} y={DESK.top} n={4} />}
        <line x1={LAMP.x} y1={LAMP.y + 20} x2={LAMP.x - 30} y2={DESK.top} stroke={INK} strokeWidth={7} />
        <path d={`M${LAMP.x - 60} ${LAMP.y + 30} L${LAMP.x - 30} ${LAMP.y - 30} H${LAMP.x + 30} L${LAMP.x + 50} ${LAMP.y + 30}Z`} fill={lampOn ? "#ffd27a" : "#1d9a8f"} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {lampOn && <polygon points={`${LAMP.x - 60},${LAMP.y + 30} ${LAMP.x + 50},${LAMP.y + 30} ${LAMP.x + 120},${DESK.top} ${LAMP.x - 200},${DESK.top}`} fill="#fff0b0" opacity={0.25} />}
        <Chair x={CHAIR.x} y={CHAIR.top} facing={1} color="#3d6f73" />
      </Deep>
    </>
  );
};

export const bedroom: SetDef<BedroomOptions> = {
  name: "bedroom",
  about: "your bedroom: window with red curtains, bed, bedside alarm clock and phone, study desk with a lamp and laptop",
  spots: {
    bedEdge: seat(900, BED.top, 1.1, 1),
    desk: seat(CHAIR.x, CHAIR.top, 1.1, 1),
    standing: { x: 760, y: FLOOR, scale: 1.15, facing: 1 },
    door: { x: 1250, y: FLOOR, scale: 1.15, facing: -1 },
  },
  cameras: {
    wide: REF,
    bed: { x: 800, y: 620, zoom: 1.5 },
    desk: { x: 1500, y: 600, zoom: 1.7 },
  },
  lights: (o) => [
    { x: LAMP.x, y: LAMP.y + 40, r: 520, color: "#ffd27a", strength: 0.55, moods: o.lamp === null ? LIGHTS_ON : o.lamp ? MOOD_NAMES : [] },
    { x: 400, y: 400, depth: 0.85, r: 420, color: "#fff2cc", strength: 0.35, moods: ["morning", "day"] },
  ],
  defaults: { lamp: null, hour: 7, phoneLit: false, curtains: 0, desk: "both" },
  Back,
  example: {
    camera: "wide",
    options: { phoneLit: true },
    cast: [{ spot: "bedEdge", who: { ...HERO, look: { x: -0.7, y: 0.4 } }, face: EXPRESSIONS.worried }],
  },
};
