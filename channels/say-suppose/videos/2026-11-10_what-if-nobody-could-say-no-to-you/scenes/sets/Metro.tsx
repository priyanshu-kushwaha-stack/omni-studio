// The metro (scene_plan.md, "Shared sets"). Three views of one set, each drawn for the REF camera (sets/common.tsx):
//
//   view "gate"      the gate concourse at night, the thumbnail's set: strip lights, a route map, a row of turnstiles
//                    far back. Stand people on METRO_GATE.floor (scale about 1.15). For the thumbnail's own framing
//                    (the cold open) use camera REF with figures at the thumbnail's scale (brand/thumbs/nobody.ts).
//                    Put a <Turnstile> on the actors' plane where someone passes a gate (METRO_GATE.gate).
//   view "car"       inside a car: two windows on the city, a bench under them, poles and handles. Sit people on the
//                    bench with CHAIR_SIT (parts2.tsx) at seatedY(METRO_CAR.seat.y, scale). `reflection` draws its
//                    children faintly in the windows (your face in the dark glass). `outside` picks day or night.
//   view "platform"  the platform: tiled far wall, the track, a train that can come in (`train`, world px still to
//                    travel, 0 = stopped; null = no train) with a door that opens (`doorOpen`). You stand on
//                    METRO_PLATFORM.floor; someone in the open door stands at METRO_PLATFORM.door.
//
// Usage:  back={<MetroBack cam={cam} view="gate" frame={frame} />}  front={<MetroFront cam={cam} view="gate" />}
// Typical cameras: wide REF; medium { x, y: floor - 330, zoom: 1.6 }; closeUp(head.x, head.y) from the kit.
import { Figure } from "@whatif/kit/rig/Figure";
import { walkPose } from "@whatif/kit/rig/pose";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { noise, PASTELS } from "../shared";
import { Deep } from "./common";

export type MetroView = "gate" | "car" | "platform";

/** Gate concourse anchors (world units). */
export const METRO_GATE = {
  /** Feet line for people on the concourse (scale about 1.15). */
  floor: 960,
  /** Where the near turnstile stands when a beat draws one: its cabinet's base centre. */
  gate: { x: 1460, y: 960 },
  /** Where the checker stands beside the gate. */
  checker: { x: 1250, y: 960 },
  /** Where you stand facing the gate. */
  hero: { x: 760, y: 960 },
  /** The far turnstile row's cabinet x positions (depth 0.55, the thumbnail's shapes). */
  farGates: [-260, 120, 500, 880, 1260, 1640, 2020, 2400],
  /** The route map on the far wall (centre), for a glance or an insert. */
  map: { x: 360, y: 380 },
} as const;

/** Car interior anchors. */
export const METRO_CAR = {
  /** Feet line for people standing in the aisle. */
  floor: 960,
  /** The bench's seat top; the window seat is at its right end. */
  seat: { x: 1480, y: 860 },
  /** The other bench places, left to right. */
  seats: [420, 640, 860, 1260, 1480],
  /** The two windows (rounded rects): reflections and the city show here. */
  windows: [{ x: 250, y: 290, w: 620, h: 310 }, { x: 1050, y: 290, w: 620, h: 310 }],
  /** The poles, x positions; a hand on a pole is at about y 560-640. */
  poles: [150, 960, 1770],
  /** The ad frame over each window (the SUBSCRIBE tag sits here in the midpoint). */
  ads: [{ x: 560, y: 205 }, { x: 1360, y: 205 }],
} as const;

/** Platform anchors. */
export const METRO_PLATFORM = {
  /** Feet line for people on the platform (near). */
  floor: 960,
  /** The platform edge, where the train's floor is. */
  edge: 860,
  /** Feet of someone standing in the train's open door (scale about 1.0). */
  door: { x: 1250, y: 860 },
  /** A free stretch of tiled wall for a paper diagram (visible when there is no train). */
  wall: { x: 960, y: 420, w: 900, h: 420 },
} as const;

const WALL = "#1d2133";
const FLOOR = "#12141f";
const STRIP = "#dfe9ff";

// ------------------------------------------------------------------------------------------------ the gate concourse

/** A turnstile cabinet seen from the side with its flap arm. Base centre at (x, y). `lamp` lights its top; `open` 0..1
 *  swings the arm down out of the way. Draw it in the actors' slot, behind whoever passes it. */
export const Turnstile: React.FC<{ x: number; y: number; scale?: number; lamp?: "red" | "green" | "off"; open?: number }> = ({
  x, y, scale = 1, lamp = "off", open = 0,
}) => {
  const lampColor = lamp === "green" ? "#4fe08a" : lamp === "red" ? "#ff5a6e" : "#3a4262";
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={4} rx={70} ry={10} fill="#000" opacity={0.3} />
      <rect x={-34} y={-250} width={68} height={250} rx={10} fill="#2f3654" stroke={INK} strokeWidth={5} />
      <rect x={-26} y={-238} width={52} height={36} rx={6} fill="#151826" />
      {lamp !== "off" && <circle cx={0} cy={-220} r={34} fill={lampColor} opacity={0.25} />}
      <circle cx={0} cy={-220} r={11} fill={lampColor} />
      <rect x={-20} y={-170} width={40} height={10} rx={5} fill="#8a95b8" />
      <g transform={`rotate(${open * 70} 34 -150)`}>
        <rect x={30} y={-158} width={150} height={16} rx={8} fill="#5a6488" stroke={INK} strokeWidth={4} />
      </g>
    </g>
  );
};

const GateBack: React.FC<{ cam: Camera; frame: number }> = ({ cam, frame }) => (
  <>
    <Deep cam={cam} depth={0.3} flat>
      <rect x={-1400} y={-800} width={4800} height={1720} fill={WALL} />
      {/* ceiling strips */}
      {[-700, 700, 2100].map((x) => <rect key={x} x={x} y={60} width={900} height={18} rx={9} fill={STRIP} opacity={0.7} />)}
      {/* wall panels */}
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-1300 + i * 400} y={140} width={10} height={740} fill="#262b42" />)}
      {/* the route map: three coloured lines with stations */}
      <rect x={METRO_GATE.map.x - 240} y={METRO_GATE.map.y - 110} width={480} height={220} rx={12} fill="#e8e2d2" stroke="#0f1220" strokeWidth={8} />
      {[["#d8344f", -60, 0], ["#1d9a8f", 0, 30], ["#f2b632", 50, -24]].map(([c, dy, bend], i) => (
        <g key={i}>
          <path d={`M${METRO_GATE.map.x - 200} ${METRO_GATE.map.y + Number(dy)} Q${METRO_GATE.map.x} ${METRO_GATE.map.y + Number(dy) + Number(bend) * 2} ${METRO_GATE.map.x + 200} ${METRO_GATE.map.y + Number(dy)}`}
            fill="none" stroke={String(c)} strokeWidth={10} strokeLinecap="round" />
          {[-150, -60, 30, 120].map((sx) => <circle key={sx} cx={METRO_GATE.map.x + sx} cy={METRO_GATE.map.y + Number(dy) + Number(bend) * (1 - (sx / 200) ** 2)} r={8} fill="#fff" stroke={INK} strokeWidth={3} />)}
        </g>
      ))}
      {/* the station clock */}
      <circle cx={1500} cy={300} r={58} fill="#e8e2d2" stroke="#0f1220" strokeWidth={9} />
      <line x1={1500} y1={300} x2={1500} y2={262} stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <line x1={1500} y1={300} x2={1528} y2={312} stroke={INK} strokeWidth={6} strokeLinecap="round" />
      {/* a hanging direction sign: an arrow and a little train, no words */}
      <rect x={880} y={120} width={300} height={90} rx={10} fill="#22305a" stroke="#0f1220" strokeWidth={6} />
      <path d="M920 165 H990 M970 145 L992 165 L970 185" fill="none" stroke={PAPER} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={1030} y={140} width={110} height={50} rx={14} fill={PAPER} />
      {[1045, 1080, 1110].map((wx) => <rect key={wx} x={wx} y={150} width={22} height={16} rx={3} fill="#22305a" />)}
    </Deep>
    <Deep cam={cam} depth={0.55} flat>
      <rect x={-1400} y={880} width={4800} height={900} fill={FLOOR} />
      {METRO_GATE.farGates.map((x, i) => (
        <g key={x}>
          <rect x={x} y={720} width={60} height={200} rx={10} fill="#2a3048" />
          <rect x={x + 60} y={790} width={140} height={14} rx={7} fill="#3a4262" />
          <circle cx={x + 30} cy={738} r={7} fill={(frame + i * 23) % 140 < 8 ? "#4fe08a" : "#7d3340"} />
        </g>
      ))}
    </Deep>
    <Deep cam={cam} depth={1} flat>
      {/* floor joints running toward the camera */}
      {[-6, -4, -2, 0, 2, 4, 6, 8].map((k) => (
        <line key={k} x1={960 + k * 260} y1={900} x2={960 + k * 520} y2={1400} stroke="#1c2032" strokeWidth={4} />
      ))}
      {[935, 1010, 1120].map((y) => <line key={y} x1={-1400} y1={y} x2={3400} y2={y} stroke="#1c2032" strokeWidth={4} />)}
    </Deep>
  </>
);

// ------------------------------------------------------------------------------------------------ the car

const City: React.FC<{ frame: number; night: boolean; speed: number }> = ({ frame, night, speed }) => {
  const TILE = 2400;
  const off = -((frame * speed) % TILE);
  return (
    <>
      <rect x={-1400} y={-600} width={4800} height={1700} fill={night ? "#141833" : "#a8d4e6"} />
      {[0, 1, 2].map((rep) => (
        <g key={rep} transform={`translate(${off + (rep - 1) * TILE} 0)`}>
          {Array.from({ length: 16 }, (_, i) => {
            const bx = i * 150;
            const h = 140 + noise(i + 3) * 260;
            return (
              <g key={i}>
                <rect x={bx} y={640 - h} width={140} height={h + 300} fill={night ? "#262c52" : ["#d9b99a", "#c7d6cf", "#e6cd98"][i % 3]} />
                {Array.from({ length: Math.floor(h / 50) * 2 }, (_, w) => (
                  <rect key={w} x={bx + 24 + (w % 2) * 56} y={640 - h + 20 + Math.floor(w / 2) * 50} width={34} height={24} rx={3}
                    fill={noise(i * 13 + w) > (night ? 0.55 : 0.85) ? "#ffe9a8" : night ? "#1a1f3d" : "rgba(40,50,60,.2)"} />
                ))}
              </g>
            );
          })}
        </g>
      ))}
      {/* near poles flashing past */}
      {Array.from({ length: 6 }, (_, i) => {
        const x = ((i * 520 - frame * speed * 2.6) % 3000 + 3000) % 3000 - 400;
        return <rect key={i} x={x} y={200} width={26} height={600} fill={night ? "#0c0e1e" : "#5a6470"} opacity={0.8} />;
      })}
    </>
  );
};

const CarBack: React.FC<{ cam: Camera; frame: number; outside: "day" | "night"; speed: number; reflection?: React.ReactNode }> = ({
  cam, frame, outside, speed, reflection,
}) => {
  const night = outside === "night";
  const wall = night ? "#aab4c2" : "#cfd8d6";
  const holes = METRO_CAR.windows.map((w) => `M${w.x + 30} ${w.y} H${w.x + w.w - 30} Q${w.x + w.w} ${w.y} ${w.x + w.w} ${w.y + 30} V${w.y + w.h - 30} Q${w.x + w.w} ${w.y + w.h} ${w.x + w.w - 30} ${w.y + w.h} H${w.x + 30} Q${w.x} ${w.y + w.h} ${w.x} ${w.y + w.h - 30} V${w.y + 30} Q${w.x} ${w.y} ${w.x + 30} ${w.y}Z`).join(" ");
  return (
    <>
      <Deep cam={cam} depth={0.35} flat><City frame={frame} night={night} speed={speed} /></Deep>
      <Deep cam={cam} depth={1}>
        <path d={`M-1400 -800 H3400 V1800 H-1400Z ${holes}`} fillRule="evenodd" fill={wall} />
        {METRO_CAR.windows.map((w, i) => (
          <g key={i}>
            <clipPath id={`metro-win-${i}`}><rect x={w.x} y={w.y} width={w.w} height={w.h} rx={30} /></clipPath>
            <g clipPath={`url(#metro-win-${i})`}>
              <rect x={w.x} y={w.y} width={w.w} height={w.h} fill={night ? "#0b0d1c" : "#ffffff"} opacity={night ? 0.25 : 0.12} />
              {reflection && <g opacity={night ? 0.42 : 0.22}>{reflection}</g>}
              <path d={`M${w.x + 80} ${w.y + w.h} L${w.x + 220} ${w.y}`} stroke="#fff" strokeWidth={26} opacity={0.08} />
            </g>
            <rect x={w.x} y={w.y} width={w.w} height={w.h} rx={30} fill="none" stroke="#5c6675" strokeWidth={14} />
          </g>
        ))}
        {/* ceiling, the grab rail and handles */}
        <rect x={-1400} y={-800} width={4800} height={900} fill={night ? "#8e98a8" : "#b9c4c4"} />
        <rect x={-1400} y={96} width={4800} height={10} fill="#5c6675" />
        {Array.from({ length: 12 }, (_, i) => -400 + i * 260).map((x) => (
          <g key={x}><line x1={x} y1={106} x2={x} y2={150} stroke="#5c6675" strokeWidth={5} /><circle cx={x} cy={166} r={16} fill="none" stroke="#5c6675" strokeWidth={6} /></g>
        ))}
        {/* ad frames */}
        {METRO_CAR.ads.map((a) => <rect key={a.x} x={a.x - 170} y={a.y - 40} width={340} height={80} rx={8} fill={night ? "#7f8a9c" : "#a9b5b5"} stroke="#5c6675" strokeWidth={5} />)}
        {/* the bench */}
        <rect x={-1400} y={600} width={4800} height={260} fill={night ? "#3c5f7a" : "#41708c"} />
        {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-1300 + i * 220} y={612} width={8} height={240} fill="#000" opacity={0.12} />)}
        <rect x={-1400} y={METRO_CAR.seat.y - 6} width={4800} height={34} rx={10} fill={night ? "#4a7090" : "#4f82a0"} stroke={INK} strokeWidth={4} />
        <rect x={-1400} y={METRO_CAR.seat.y + 28} width={4800} height={80} fill="#4a5262" />
        <rect x={-1400} y={METRO_CAR.floor} width={4800} height={600} fill="#5d6574" />
        <rect x={-1400} y={METRO_CAR.floor} width={4800} height={10} fill="#3d4352" />
      </Deep>
    </>
  );
};

// ------------------------------------------------------------------------------------------------ the platform

const Train: React.FC<{ x: number; doorOpen: number }> = ({ x, doorOpen }) => {
  const d = METRO_PLATFORM.door.x;
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={-1400} y={330} width={4800} height={540} rx={30} fill="#c9ced8" stroke={INK} strokeWidth={7} />
      <rect x={-1400} y={720} width={4800} height={26} fill="#d8344f" />
      {Array.from({ length: 14 }, (_, i) => -1300 + i * 330).filter((wx) => Math.abs(wx + 90 - d) > 200).map((wx) => (
        <rect key={wx} x={wx} y={420} width={180} height={150} rx={18} fill="#ffe9b0" stroke={INK} strokeWidth={6} />
      ))}
      {/* the door: the opening shows the lit car; the two leaves slide apart */}
      <rect x={d - 130} y={380} width={260} height={480} fill="#fff1c9" />
      <rect x={d - 130} y={760} width={260} height={100} fill="#8a92a2" />
      <rect x={d - 130 - doorOpen * 120} y={380} width={130} height={480} fill="#b3bac6" stroke={INK} strokeWidth={6} />
      <rect x={d + doorOpen * 120} y={380} width={130} height={480} fill="#b3bac6" stroke={INK} strokeWidth={6} />
      <rect x={d - 150} y={370} width={300} height={500} fill="none" stroke={INK} strokeWidth={8} />
    </g>
  );
};

const PlatformBack: React.FC<{ cam: Camera; train: number | null; doorOpen: number }> = ({ cam, train, doorOpen }) => (
  <>
    <Deep cam={cam} depth={0.5} flat>
      <rect x={-1400} y={-800} width={4800} height={1700} fill="#2a3a4a" />
      {Array.from({ length: 30 }, (_, i) => Array.from({ length: 9 }, (_, r) => (
        <rect key={`${i}-${r}`} x={-1300 + i * 160 + (r % 2) * 80} y={180 + r * 70} width={150} height={62} rx={4} fill={noise(i * 9 + r) > 0.9 ? "#e8e2d2" : "#d7dccf"} opacity={0.9} />
      )))}
      {[-700, 700, 2100].map((x) => <rect key={x} x={x} y={90} width={900} height={18} rx={9} fill={STRIP} opacity={0.7} />)}
    </Deep>
    <Deep cam={cam} depth={0.8} flat>
      <rect x={-1400} y={800} width={4800} height={80} fill="#1a1d28" />
      <rect x={-1400} y={826} width={4800} height={8} fill="#6a6f7c" />
    </Deep>
    <Deep cam={cam} depth={1}>
      {train !== null && <Train x={train} doorOpen={doorOpen} />}
      <rect x={-1400} y={METRO_PLATFORM.edge} width={4800} height={800} fill="#8c8a84" />
      <rect x={-1400} y={METRO_PLATFORM.edge} width={4800} height={14} fill="#5c5a55" />
      <rect x={-1400} y={METRO_PLATFORM.edge + 26} width={4800} height={16} fill="#e8c23a" />
      {[300, 1700].map((x) => <rect key={x} x={x - 40} y={-800} width={80} height={METRO_PLATFORM.edge + 800} fill="#6b7280" stroke={INK} strokeWidth={5} />)}
    </Deep>
  </>
);

// ------------------------------------------------------------------------------------------------ the set

/** A passing crowd far back on the concourse (depth 0.75): pastel commuters walking, for life behind a scene. */
const FarCrowd: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    {Array.from({ length: 9 }, (_, i) => {
      const dir = i % 2 ? 1 : -1;
      const span = 3400;
      const x = ((noise(i) * span + dir * frame * (2.2 + noise(i + 4))) % span + span) % span - 700;
      return <Figure key={i} x={x} y={905} scale={0.55} facing={dir as 1 | -1} pose={walkPose(frame * 0.2 + i)} head={PASTELS[i % PASTELS.length]}
        look={{ x: 0.7, y: 0 }} mouth="flat" time={frame} />;
    })}
  </>
);

/** The metro set behind the actors. `crowd` walks commuters far back on the concourse (gate view). */
export const MetroBack: React.FC<{
  cam: Camera; view: MetroView; frame: number; crowd?: boolean; outside?: "day" | "night"; speed?: number;
  reflection?: React.ReactNode; train?: number | null; doorOpen?: number;
}> = ({ cam, view, frame, crowd, outside = "night", speed = 6, reflection, train = 0, doorOpen = 0 }) => {
  if (view === "car") return <CarBack cam={cam} frame={frame} outside={outside} speed={speed} reflection={reflection} />;
  if (view === "platform") return <PlatformBack cam={cam} train={train} doorOpen={doorOpen} />;
  return (
    <>
      <GateBack cam={cam} frame={frame} />
      {crowd && <Deep cam={cam} depth={0.75} flat><FarCrowd frame={frame} /></Deep>}
    </>
  );
};

/** What passes in front of the actors: on the gate view a blurred near stanchion and rope at the left edge; in the car
 *  the near pole; nothing on the platform. */
export const MetroFront: React.FC<{ cam: Camera; view: MetroView }> = ({ cam, view }) => {
  if (view === "car") {
    return <Deep cam={cam} depth={1.35}><rect x={60} y={-400} width={46} height={1800} rx={23} fill="#c8ccd2" stroke={INK} strokeWidth={6} /></Deep>;
  }
  if (view === "gate") {
    return (
      <Deep cam={cam} depth={1.4}>
        <rect x={-120} y={760} width={40} height={600} rx={18} fill="#3a4262" />
        <path d="M-80 800 Q120 880 340 820" fill="none" stroke="#7d3340" strokeWidth={22} strokeLinecap="round" />
      </Deep>
    );
  }
  return null;
};
