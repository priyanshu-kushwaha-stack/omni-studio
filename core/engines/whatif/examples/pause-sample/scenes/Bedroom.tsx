import { AbsoluteFill, spring } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { lerpPose, SIT, type Pose } from "@whatif/kit/rig/pose";
import { Layer, Stage, toScreen, waveRadius, type Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { Flip } from "@whatif/kit/ui/Flip";
import { Tag } from "@whatif/kit/ui/Tag";
import { blinking, HERO, mix, noise, ramp, type Shot } from "./shared";

const LYING: Pose = { ...SIT, armB: [5, 4], armF: [8, 6], legB: [0, -2], legF: [0, -2] };
const HIP_X = 925;
const FEET_Y = 847;

export const Bedroom: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, t, cues } = shot;
  const pause = shot.pauses[0];
  const push = ramp(frame, 0, 170);
  const cam: Camera = { x: mix(1000, 1060, push), y: mix(610, 590, push), zoom: mix(1.42, 1.62, push) };
  const sit = ramp(frame, cues.wake, cues.wake + 18);
  const paused = frame >= pause.from && frame < pause.to;
  const origin = toScreen(cam, HIP_X, 620);

  const angle = Math.sin(t / 13) * 9;
  const tick = Math.floor(t / 15) * 18;
  const back = (
    <>
      <Layer cam={cam} depth={0.3}>
        <rect x={-1500} y={-600} width={5000} height={1500} fill="#a8dcea" />
        <circle cx={-200} cy={230} r={72} fill="#fff1b8" />
        <path d="M-1500 680 Q300 470 2000 680 V1000 H-1500Z" fill="#7fc29b" />
      </Layer>
      <Layer cam={cam} depth={1}>
        <path d="M-400 -300 H2500 V1400 H-400Z M250 170 H660 V620 H250Z" fillRule="evenodd" fill="#f0c9a0" />
        <rect x={232} y={150} width={446} height={24} rx={4} fill={INK} />
        <path d={`M240 174 H${330 + Math.sin(t / 19) * 8} Q${300 + Math.sin(t / 19) * 14} 400 ${275 + Math.sin(t / 19) * 12} 640 H240Z`} fill="#d8344f" opacity={0.85} />
        <path d={`M670 174 H${580 - Math.sin(t / 22) * 8} Q${610 - Math.sin(t / 22) * 14} 400 ${635 - Math.sin(t / 22) * 12} 640 H670Z`} fill="#d8344f" opacity={0.85} />
        <rect x={1610} y={250} width={190} height={240} rx={6} fill="#fff6e3" stroke={INK} strokeWidth={8} />
        <path d="M1640 450 L1695 350 L1730 410 L1755 375 L1775 450Z" fill="#7fc29b" />
        <rect x={-400} y={860} width={2900} height={500} fill="#b5764a" />
        <ellipse cx={1050} cy={930} rx={560} ry={52} fill="#d9a766" />
      </Layer>
      <polygon points="260,620 650,620 1320,1000 620,1000" fill="#fff4c6" opacity={0.22} />
      <g transform={`rotate(${angle} 1060 -40)`}>
        <line x1={1060} y1={-40} x2={1060} y2={250} stroke={INK} strokeWidth={6} />
        <path d="M1000 310 Q1060 200 1120 310Z" fill="#1d9a8f" />
        <ellipse cx={1060} cy={312} rx={26} ry={9} fill="#fff1b8" />
      </g>
      <Layer cam={cam} depth={1}>
        <rect x={690} y={560} width={44} height={300} rx={14} fill="#6f4a2f" />
        <rect x={1290} y={690} width={36} height={170} rx={12} fill="#6f4a2f" />
        <rect x={726} y={730} width={574} height={90} rx={16} fill="#fff6e3" />
        <ellipse cx={805} cy={712} rx={84} ry={33} fill="#fffaf0" />
        <rect x={1360} y={722} width={160} height={138} rx={8} fill="#8a5c3b" />
        <rect x={1380} y={778} width={120} height={8} rx={4} fill="#6f4a2f" />
        <circle cx={1394} cy={600} r={18} fill={INK} />
        <circle cx={1466} cy={600} r={18} fill={INK} />
        <circle cx={1430} cy={662} r={60} fill="#fff6e3" stroke={INK} strokeWidth={11} />
        <line x1={1430} y1={662} x2={1430} y2={624} stroke={INK} strokeWidth={7} strokeLinecap="round" />
        <line x1={1430} y1={662} x2={1456} y2={676} stroke={INK} strokeWidth={7} strokeLinecap="round" />
        <line x1={1430} y1={662} x2={1430 + Math.sin(tick * Math.PI / 180) * 50} y2={662 - Math.cos(tick * Math.PI / 180) * 50} stroke="#d8344f" strokeWidth={4} strokeLinecap="round" />
      </Layer>
      {Array.from({ length: 22 }, (_, i) => {
        const x = 300 + noise(i) * 1000 + Math.sin(t / 30 + i) * 26;
        const y = 300 + ((noise(i + 40) * 600 - t * (0.5 + noise(i + 9))) % 600 + 600) % 600;
        return <circle key={i} cx={x} cy={y} r={2.5 + noise(i + 3) * 4} fill="#fffbe6" opacity={0.75} />;
      })}
    </>
  );
  const front = (
    <Layer cam={cam} depth={1}>
      <path d="M905 696 Q1100 660 1302 700 V808 H905Z" fill="#1d7f9a" />
      <path d="M905 744 H1302 M905 772 H1302" stroke="#f3e9d7" strokeWidth={9} opacity={0.6} />
    </Layer>
  );
  const scan = paused && frame < cues.ten ? Math.sin((frame - pause.from) / 7) : 0;
  const hero = (
    <Figure
      {...HERO}
      x={HIP_X} y={FEET_Y}
      rotate={mix(-86, 0, sit)}
      pose={lerpPose(LYING, SIT, sit)}
      blink={frame < cues.wake || blinking(frame)}
      eyes={paused ? 1.3 : 1}
      mouth={paused ? "o" : frame < cues.wake ? "flat" : "smile"}
      look={frame >= cues.ten && paused ? { x: 0.9, y: -0.8 } : { x: 0.4 + scan * 0.9, y: 0 }}
      time={t}
    />
  );

  const card = spring({ frame: frame - cues.ten, fps: 30, config: { damping: 12, stiffness: 170 } });
  return (
    <AbsoluteFill>
      <Stage cam={cam} radius={waveRadius(frame, pause)} origin={origin} back={back} actors={hero} front={front} />
      {frame >= cues.ten && (
        <div style={{ position: "absolute", left: 1590, top: 70, transform: `scale(${card})`, transformOrigin: "center" }}>
          <Flip value="10" previous="10" changedAt={cues.ten} />
        </div>
      )}
      <Tag at={cues.ten + 8} text="SECONDS" x={1500} y={330} size={58} />
      <Tag at={cues.once} text="ONCE A DAY" x={1420} y={430} size={58} tilt={2} bg="#d8344f" color="#fff6e3" />
    </AbsoluteFill>
  );
};
