import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, STAND, type Pose } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook } from "@whatif/kit/stage/moods";
import { Layer, Stage, toScreen } from "@whatif/kit/stage/Stage";
import { HEIGHT, INK, WIDTH } from "@whatif/kit/theme";
import { Counter } from "../parts";
import { blinking, camAt, HERO, linear, mix, noise, ramp } from "../shared";

const X = 600;
const FLOOR = 880;
const SCALE = 1.4;

const SKY = (
  <>
    <defs>
      <linearGradient id="endsky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4a5a8c" />
        <stop offset="0.62" stopColor="#c99a8e" />
        <stop offset="0.8" stopColor="#f0c39a" />
      </linearGradient>
    </defs>
    <rect width={WIDTH} height={HEIGHT} fill="url(#endsky)" />
  </>
);

/** The end card: you, small, in the left two-thirds, weighing your phone against a paper counter. The right third
 *  stays empty for YouTube's end screens, and nothing sits in the lower right. */
export const EndCard: React.FC<{ frame: number; from: number }> = ({ frame, from }) => {
  // The script marks line 70 frozen, but the pause has ended: light the end card as a calm evening.
  const look = moodLook("dusk");
  const rel = frame - from;
  const cam = camAt(frame, [[from, { x: 960, y: 540, zoom: 1 }], [from + 270, { x: 905, y: 560, zoom: 1.06 }]]);

  // Weighing: one hand rises as the other falls, slowly.
  const w = Math.sin(rel * 0.075) * ramp(rel, 6, 30);
  const phase = rel < 70 ? 0 : rel < 140 ? 1 : rel < 200 ? 0 : 2;
  const eyesOn = [{ x: 0.9, y: 0.3 }, { x: -0.8, y: 0.3 }, { x: -0.15, y: 0.1 }][phase];
  const tilt = [4, -5, 0][phase];
  const pose: Pose = { ...STAND, tilt, armF: [72 + 14 * w, 28], armB: [-72 + 14 * w, -26] };

  const j = joints(pose);
  const [u, f] = pose.armB;
  const back = { x: X + (j.shoulder.x + (dir(u).x + dir(u + f).x) * LIMB) * SCALE, y: FLOOR + (j.shoulder.y + (dir(u).y + dir(u + f).y) * LIMB) * SCALE };
  const counterAt = toScreen(cam, back.x, back.y);
  const pool = toScreen(cam, X, FLOOR - 220);

  const phone = (
    <g transform="rotate(-8)">
      <rect x={-15} y={-54} width={30} height={54} rx={6} fill={INK} />
      <rect x={-11} y={-49} width={22} height={40} rx={2} fill="#a6e6ff" />
    </g>
  );

  const backdrop = (
    <>
      <Layer cam={cam} depth={1} flat>
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx={60 + noise(i) * 1100} cy={70 + noise(i + 40) * 280} r={2 + noise(i + 9) * 3} fill="#fff6e3" opacity={0.6} />
        ))}
        <circle cx={X} cy={FLOOR - 230} r={300} fill="#fbe7c2" opacity={0.9} />
      </Layer>
      <Layer cam={cam} depth={1}>
        <rect x={-600} y={FLOOR} width={3200} height={600} fill="#4a4f6e" />
        <rect x={-600} y={FLOOR} width={3200} height={10} fill="#3a3e58" />
        <ellipse cx={X + 10} cy={FLOOR + 6} rx={170} ry={16} fill="#000" opacity={0.3} />
      </Layer>
    </>
  );

  const hero = (
    <Figure {...HERO} x={X} y={FLOOR} scale={SCALE} pose={pose} time={frame} held={phone}
      look={eyesOn} eyes={1.05} brows={phase === 2 ? "raised" : "flat"} lids={phase === 2 ? 0 : 0.18}
      mouth={phase === 2 ? "smile" : "flat"} blink={blinking(frame, 2)} />
  );

  const fade = 1 - linear(rel, 0, 12);
  return (
    <AbsoluteFill>
      <LookContext.Provider value={{ ...look, glows: [...(look.glows ?? []), { x: pool.x, y: pool.y, r: 520, color: "rgba(255,206,150,0.35)" }] }}>
        <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} sky={SKY} back={backdrop} actors={hero} />
      </LookContext.Provider>
      <Counter ticks={[{ at: from + 8, n: 10 }]} x={counterAt.x - 48} y={counterAt.y - 112} scale={0.5} />
      {fade > 0 && <AbsoluteFill style={{ background: "#000", opacity: mix(0, 1, fade) }} />}
    </AbsoluteFill>
  );
};
