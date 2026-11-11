// A lane on Diwali, side on: house fronts hung with string lights and paper lanterns (akash kandil), diyas on the
// steps, a rangoli on the ground, sparklers and rockets after dark, the crowd. Built for the library from the bazaar
// (lane of fronts, bunting, strung bulbs) and the courtyard (the diya). Decorated by day; it glows from dusk.
import { Figure } from "../rig/Figure";
import { EXPRESSIONS } from "../rig/expressions";
import { STAND, walkPose } from "../rig/pose";
import { INK } from "../theme";
import { HERO, PASTELS, SIBLING } from "./cast";
import { Deep, LIGHTS_ON, lightsOn, noise, OUTSIDE, REF, Sky, type SetDef, type SetProps } from "./common";

const FLOOR = 980;
const RANGOLI = { x: 1000, y: 1010 };
const LANTERNS = [300, 860, 1500];

export interface FestivalStreetOptions {
  /** The rangoli on the ground. */
  rangoli: boolean;
  /** Rockets bursting in the sky after dark. */
  rockets: boolean;
  /** People walking the lane behind. */
  crowd: boolean;
}

/** A sparkler for a hand (Figure `held`): a stick and a fizz of sparks on `frame`. */
export const Sparkler: React.FC<{ frame: number }> = ({ frame }) => (
  <g transform="rotate(-30)">
    <line x1={0} y1={0} x2={0} y2={-70} stroke="#7a8490" strokeWidth={4} />
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2 + frame * 0.7;
      const r = 14 + ((frame * 3 + i * 7) % 20);
      return <line key={i} x1={0} y1={-70} x2={Math.cos(a) * r} y2={-70 + Math.sin(a) * r} stroke="#ffe39a" strokeWidth={3} strokeLinecap="round" />;
    })}
    <circle cx={0} cy={-70} r={7} fill="#fff6d0" />
  </g>
);

const Lantern: React.FC<{ x: number; y: number; color: string; lit: boolean; sway: number }> = ({ x, y, color, lit, sway }) => (
  <g transform={`translate(${x} ${y}) rotate(${sway})`}>
    <line x1={0} y1={-80} x2={0} y2={-40} stroke={INK} strokeWidth={3} />
    <path d="M0 -40 L44 0 L0 60 L-44 0Z" fill={color} stroke={INK} strokeWidth={4} />
    {lit && <circle cx={0} cy={6} r={20} fill="#fff1b8" opacity={0.85} />}
    {[-20, 0, 20].map((dx) => <line key={dx} x1={dx} y1={56} x2={dx} y2={110} stroke={color} strokeWidth={5} />)}
  </g>
);

const Back: React.FC<SetProps<FestivalStreetOptions>> = ({ cam, mood, frame, options }) => {
  const o = OUTSIDE[mood];
  const on = lightsOn(mood);
  return (
    <>
      <Deep cam={cam} depth={0.12} flat>
        <Sky id="festival" mood={mood} x={-1400} y={-800} w={4800} h={1400} sunAt={{ x: 1500, y: 140 }} />
        {options.rockets && o.dark && [[400, 160, "#ff9a8a"], [1300, 100, "#ffe39a"], [1800, 220, "#9fe0c8"]].map(([x, y, c], i) => {
          const p = ((frame / 40 + i / 3) % 1);
          return (
            <g key={i} opacity={1 - p}>
              {Array.from({ length: 12 }, (_, k) => {
                const a = (k / 12) * Math.PI * 2;
                return <line key={k} x1={Number(x) + Math.cos(a) * 20 * p} y1={Number(y) + Math.sin(a) * 20 * p} x2={Number(x) + Math.cos(a) * 110 * p} y2={Number(y) + Math.sin(a) * 110 * p} stroke={String(c)} strokeWidth={5} strokeLinecap="round" />;
              })}
            </g>
          );
        })}
      </Deep>
      <Deep cam={cam} depth={0.55}>
        {/* house fronts with balconies, string lights down their faces */}
        {Array.from({ length: 9 }, (_, i) => {
          const x = -1000 + i * 420;
          const h = 560 + (i % 3) * 60;
          const col = o.dark ? ["#4a3f68", "#3f4870", "#523e5e"][i % 3] : ["#e6a0a0", "#f0d58e", "#a3c7bf", "#c9a0d6", "#e4b48e"][i % 5];
          return (
            <g key={i}>
              <rect x={x} y={820 - h} width={400} height={h + 200} fill={col} stroke="#3b2a1f" strokeWidth={6} />
              <rect x={x + 50} y={820 - h + 60} width={110} height={100} fill={on ? "#ffd27a" : "#6c7f8f"} />
              <rect x={x + 240} y={820 - h + 60} width={110} height={100} fill={on && noise(i) > 0.3 ? "#ffd27a" : "#6c7f8f"} />
              <rect x={x + 150} y={640} width={100} height={180} fill="#6b3f2a" stroke="#3b2a1f" strokeWidth={4} />
              <path d={`M${x + 140} 640 Q${x + 200} 680 ${x + 260} 640`} fill="none" stroke="#f2a23c" strokeWidth={12} strokeDasharray="12 6" />
              {Array.from({ length: 6 }, (_, k) => (
                <circle key={k} cx={x + 20 + (k % 2) * 360} cy={820 - h + 30 + Math.floor(k / 2) * 160} r={8}
                  fill={on ? ["#ffe39a", "#ff9a8a", "#9fe0c8"][(k + i) % 3] : "#d9d2c0"} opacity={on ? 0.75 + 0.25 * Math.sin(frame * 0.25 + k + i) : 1} />
              ))}
            </g>
          );
        })}
        {/* strings of lights across the lane */}
        {[160, 260].map((y, r) => (
          <g key={y}>
            <path d={`M-1000 ${y} Q500 ${y + 60} 1900 ${y} T3400 ${y}`} fill="none" stroke={INK} strokeWidth={3} />
            {Array.from({ length: 48 }, (_, i) => <circle key={i} cx={-980 + i * 92} cy={y + 30 + Math.sin(i * 0.5 + r) * 24} r={9}
              fill={on ? ["#ffe39a", "#ff9a8a", "#9fe0c8", "#c9a0d6"][(i + r) % 4] : "#d9d2c0"} opacity={on ? 0.7 + 0.3 * Math.sin(frame * 0.3 + i) : 1} />)}
          </g>
        ))}
        {options.crowd && Array.from({ length: 6 }, (_, i) => (
          <Figure key={i} x={((noise(i) * 2600 + frame * (i % 2 ? 1.4 : -1.2)) % 2600 + 2600) % 2600 - 400} y={860} scale={0.7} facing={i % 2 ? 1 : -1}
            pose={walkPose(frame * 0.18 + i)} head={PASTELS[(i * 3) % PASTELS.length]} coat={["#b0306a", "#e0793f", "#3d6fb0", "#f2b632"][i % 4]} mouth="smile" time={frame} />
        ))}
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={880} width={4800} height={800} fill={o.dark ? "#6d6458" : "#c9b796"} />
        {options.rangoli && (
          <g transform={`translate(${RANGOLI.x} ${RANGOLI.y}) scale(1 0.32)`}>
            {[150, 110, 70, 34].map((r, i) => <circle key={r} r={r} fill={["#d8344f", "#f2b632", "#1d9a8f", "#f3e9d7"][i]} />)}
            {Array.from({ length: 8 }, (_, k) => <ellipse key={k} cx={Math.cos((k / 8) * Math.PI * 2) * 120} cy={Math.sin((k / 8) * Math.PI * 2) * 120} rx={26} ry={26} fill="#b58fc7" />)}
          </g>
        )}
        {[680, 760, 1240, 1320].map((x) => (
          <g key={x} transform={`translate(${x} ${FLOOR - 40})`}>
            <path d="M-16 0 Q0 12 16 0Z" fill="#c96f2d" stroke={INK} strokeWidth={3} />
            <path d={`M0 -4 Q${-5 + Math.sin(frame / 3 + x) * 2} -16 0 -26 Q5 -16 0 -4Z`} fill="#ffcf5a" />
          </g>
        ))}
      </Deep>
    </>
  );
};

/** Paper lanterns hanging near the camera, soft. */
const Front: React.FC<SetProps<FestivalStreetOptions>> = ({ cam, mood, frame }) => (
  <Deep cam={cam} depth={1.3}>
    {LANTERNS.map((x, i) => <Lantern key={x} x={x} y={110 + (i % 2) * 40} color={["#d8344f", "#f2b632", "#1d9a8f"][i]} lit={lightsOn(mood)} sway={Math.sin(frame / 25 + i) * 5} />)}
  </Deep>
);

export const festivalStreet: SetDef<FestivalStreetOptions> = {
  name: "festival-street",
  about: "a lane on Diwali: string lights, paper lanterns, diyas and a rangoli, rockets after dark, a crowd; Sparkler prop",
  spots: {
    hero: { x: 720, y: FLOOR + 20, scale: 1.2, facing: 1 },
    friend: { x: 1300, y: FLOOR + 20, scale: 1.2, facing: -1 },
    rangoli: { x: 1000, y: FLOOR + 50, scale: 1.25, facing: 1 },
    doorstep: { x: 480, y: FLOOR - 10, scale: 1.1, facing: 1 },
  },
  cameras: {
    wide: REF,
    twoShot: { x: 1000, y: 640, zoom: 1.45 },
    sky: { x: 1000, y: 280, zoom: 1.1 },
  },
  lights: () => [
    { x: 960, y: 220, depth: 0.55, r: 900, color: "#ffd27a", strength: 0.25, moods: LIGHTS_ON },
    { x: 1000, y: FLOOR - 50, r: 300, color: "#ffcf5a", strength: 0.35, moods: LIGHTS_ON },
  ],
  defaults: { rangoli: true, rockets: true, crowd: true },
  Back,
  Front,
  example: {
    camera: "wide",
    cast: [
      { spot: "hero", who: { ...HERO, look: { x: 0.8, y: -0.2 } }, face: EXPRESSIONS.happy, pose: { ...STAND, armF: [70, 40] } },
      { spot: "friend", who: { ...SIBLING, look: { x: 0.8, y: 0 } }, face: EXPRESSIONS.happy },
    ],
  },
};
