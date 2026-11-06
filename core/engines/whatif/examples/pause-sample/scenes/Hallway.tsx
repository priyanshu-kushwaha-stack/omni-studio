import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, tiptoePose, walkPose } from "@whatif/kit/rig/pose";
import { Layer, Stage, toScreen, waveRadius, type Camera } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { INK } from "@whatif/kit/theme";
import { blinking, HERO, linear, mix, ramp, type Shot } from "./shared";

const FLOOR = 800;
const BOSS_X = 1240;

export const Hallway: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, t, cues, clips } = shot;
  const pause = shot.pauses[2];
  const start = clips[4].from;
  const end = clips[5].from;
  const after = frame >= pause.to;
  const go = linear(frame, pause.from + 6, pause.to);
  const x = mix(720, 1600, go) + Math.max(0, frame - pause.to) * 5;
  const y = mix(868, 925, Math.sin(Math.PI * go));
  const cam: Camera = { x: mix(1010, 1290, ramp(frame, start, end)), y: 590, zoom: mix(1.34, 1.42, ramp(frame, start, end)) };
  const origin = toScreen(cam, BOSS_X - 60, 500);
  const puzzled = frame - pause.to;

  const back = (
    <>
      <Layer cam={cam} depth={0.85}>
        <rect x={-400} y={-300} width={3000} height={1500} fill="#f2dfc0" />
        <rect x={-400} y={560} width={3000} height={240} fill="#cf9d6e" />
        <rect x={-400} y={552} width={3000} height={12} fill="#8a5c3b" />
        {[-140, 300, 740, 1180, 1620, 2060].map((d, i) => (
          <g key={d}>
            <rect x={d} y={330} width={190} height={470} rx={6} fill={i % 2 ? "#1d9a8f" : "#8a5c3b"} stroke={INK} strokeWidth={6} />
            <rect x={d + 35} y={375} width={120} height={120} rx={5} fill="#fff6e3" />
            <circle cx={d + 160} cy={600} r={10} fill={INK} />
            <rect x={d + 228} y={350} width={154} height={100} rx={5} fill="#fff6e3" stroke={INK} strokeWidth={6} />
            <path d={`M${d + 245} 430 l34 -46 l22 28 l18 -18 l28 36Z`} fill="#d8344f" opacity={0.8} />
          </g>
        ))}
        {[0, 440, 880, 1320, 1760, 2200].map((l) => (
          <rect key={l} x={l - 100} y={150} width={200} height={20} rx={8} fill="#fffbe6" />
        ))}
        <rect x={-400} y={100} width={3000} height={50} fill="#8a5c3b" />
      </Layer>
      <Layer cam={cam} depth={1}>
        <rect x={-500} y={FLOOR} width={3400} height={500} fill="#7d8c91" />
        <rect x={-500} y={FLOOR + 90} width={3400} height={10} fill="#677579" />
        <g transform="translate(1810 800)">
          <path d="M-46 0 L-34 -80 H34 L46 0Z" fill="#b55f3b" />
          <path d="M0 -80 Q-90 -160 -70 -230 Q-20 -190 0 -100 Q10 -210 60 -250 Q70 -160 0 -80Z" fill="#1d9a8f" />
        </g>
      </Layer>
      <Layer cam={cam} depth={1}>
        <g transform={`translate(${BOSS_X - 400} 255)`}>
          <rect width={420} height={118} rx={26} fill="#fff" stroke={INK} strokeWidth={6} />
          <path d="M370 112 L400 165 L330 116Z" fill="#fff" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <rect x={320} y={100} width={60} height={14} fill="#fff" />
          <text x={210} y={76} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={46} fill={INK}>GOT A MINU—</text>
        </g>
        <Figure
          x={BOSS_X} y={FLOOR + 40} scale={1.22} facing={-1}
          pose={{ ...walkPose(start * 0.3), lean: 5, armF: [100, 38], armB: [-10, 15], legF: [15, -6], legB: [-14, -8] }}
          head="#7fa0c4" tie="#c96f2d" mouth="open" eyes={1.1}
          look={after ? { x: puzzled > 8 ? -1 : 0.8, y: 0 } : { x: 0.8, y: 0 }}
          blink={false}
        />
        {after && puzzled > 6 && (
          <text x={BOSS_X + 90} y={410} fontFamily={FONT} fontWeight={800} fontSize={120} fill="#d8344f" textAnchor="middle" transform={`rotate(10 ${BOSS_X + 90} 410)`} opacity={ramp(frame, pause.to + 6, pause.to + 10)}>?</text>
        )}
      </Layer>
    </>
  );
  const moving = frame >= pause.from + 6;
  const hero = (
    <Figure
      {...HERO}
      x={x} y={y}
      pose={!moving ? STAND : after ? walkPose(frame * 0.34) : tiptoePose(frame * 0.3)}
      mouth={moving ? "smirk" : "flat"}
      flow={moving ? 0.35 : 0}
      time={frame}
      blink={blinking(frame, 5)}
      look={frame > pause.from && !moving ? { x: 0.9, y: 0 } : { x: 0.6, y: 0 }}
    />
  );
  return <Stage cam={cam} radius={waveRadius(frame, pause)} origin={origin} back={back} actors={hero} />;
};
