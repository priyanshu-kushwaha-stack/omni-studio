import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Layer, Stage, toScreen, type Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import { INK, PAPER, WIDTH, HEIGHT } from "@whatif/kit/theme";
import { Tag } from "@whatif/kit/ui/Tag";
import { ROAD_BOTTOM, ROAD_TOP, SKY, StreetBack } from "../sets/Street";
import { blinking, camAt, current, cutAt, linear, mix, noise, ramp, STRANGER, type Shot } from "../shared";
import { armTo, beatTimes, blendArm, Lit, You } from "./LongRun.parts";

type Season = "autumn" | "rain" | "winter" | "summer";
const LEAVES: Record<Season, [string, string]> = {
  autumn: ["#d9822b", "#c4632a"],
  rain: ["#3f8a68", "#336f56"],
  winter: ["#e9eef2", "#d3dce3"],
  summer: ["#5aae6c", "#3f8a58"],
};
const FULL = 2400;

/** Lines 60-61: one street through the seasons (YEAR 40), then you, older, reading the street at a corner. */
export const Year40: React.FC<{ shot: Shot }> = ({ shot }) => {
  const b = beatTimes(shot.cues, shot.clips);
  return shot.frame < b.corner ? <Seasons shot={shot} /> : <Corner shot={shot} />;
};

const Umbrella = (
  <g>
    <line x1={0} y1={10} x2={0} y2={-110} stroke={INK} strokeWidth={6} />
    <path d="M-110 -100 Q0 -230 110 -100 Q80 -115 55 -100 Q28 -115 0 -100 Q-28 -115 -55 -100 Q-80 -115 -110 -100Z" fill="#2c6fbb" stroke={INK} strokeWidth={5} />
  </g>
);

const Seasons: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, t } = shot;
  const b = beatTimes(shot.cues, shot.clips);
  const span = (b.corner - b.year40) / 4;
  const season = current<Season>(frame, [[b.year40, "autumn"], [b.year40 + span, "rain"], [b.year40 + 2 * span, "winter"], [b.year40 + 3 * span, "summer"]]);
  const k = (frame - b.year40) / (b.corner - b.year40);
  const frozen = season === "winter";
  const cam: Camera = drift(camAt(frame, [[b.year40, { x: 1020, y: 700, zoom: 1.02 }], [b.corner, { x: 1000, y: 720, zoom: 1.16 }]]), frame, "seasons", 5);
  const age = mix(0.45, 1, k);
  const youP = { x: 640, y: 1012, scale: 1.25, facing: 1 as const, pose: { ...STAND, armF: season === "rain" ? [120, 40] : [9, 10] } as Pose };
  const walkers = [0, 1, 2].map((i) => ({ x: 300 + i * 520 + ((frame * (1.6 + i * 0.4)) % 300) * (i % 2 ? -1 : 1), head: ["#7fa0c4", "#e6a0a0", "#7fc29b"][i] }));

  const groundTint = season === "winter" ? "#f4f6f8" : season === "rain" ? "#6a7f95" : null;
  const back = (
    <>
      <StreetBack cam={cam} frame={frame} t={t} crowd={frozen} paused={frozen} leaves={LEAVES[season]} />
      <Layer cam={cam} depth={1}>
        {groundTint && <rect x={-800} y={ROAD_BOTTOM + 8} width={5000} height={420} fill={groundTint} opacity={season === "winter" ? 0.8 : 0.35} />}
        {groundTint && season === "winter" && <rect x={-800} y={ROAD_TOP - 46} width={5000} height={40} fill={groundTint} opacity={0.85} />}
        {season === "rain" && Array.from({ length: 12 }, (_, i) => <ellipse key={i} cx={-200 + i * 260} cy={ROAD_BOTTOM + 60 + noise(i) * 200} rx={70} ry={10} fill="#a9c4dc" opacity={0.5} />)}
        {!frozen && walkers.map((w, i) => (
          <Figure key={i} x={w.x} y={712 + (i % 2) * 8} scale={0.66} facing={i % 2 ? -1 : 1} head={w.head} pose={season === "rain" ? { ...walkPose(frame * 0.3 + i), armF: [120, 40] } : walkPose(frame * 0.3 + i)} blink={blinking(frame, i)} held={season === "rain" ? Umbrella : undefined} />
        ))}
      </Layer>
    </>
  );
  // falling leaves, rain, hanging snow
  const front = (
    <Layer cam={cam} depth={1.15}>
      {season === "autumn" && Array.from({ length: 22 }, (_, i) => {
        const x = -100 + noise(i) * 2300 + Math.sin(frame / 12 + i) * 40;
        const y = ((noise(i + 9) * 1100 + frame * (2.4 + noise(i + 3) * 2)) % 1100) - 50;
        return <ellipse key={i} cx={x} cy={y} rx={15} ry={7} fill={i % 2 ? "#d9822b" : "#c4632a"} transform={`rotate(${frame * 5 + i * 40} ${x} ${y})`} />;
      })}
      {season === "rain" && Array.from({ length: 70 }, (_, i) => {
        const x = -200 + noise(i) * 2600;
        const y = ((noise(i + 4) * 1200 + frame * 38) % 1200) - 80;
        return <line key={i} x1={x} y1={y} x2={x - 12} y2={y + 46} stroke="#d8e8f5" strokeWidth={3} opacity={0.6} />;
      })}
      {season === "winter" && Array.from({ length: 60 }, (_, i) => (
        <circle key={i} cx={-200 + noise(i) * 2600} cy={-40 + noise(i + 7) * 1150} r={4 + noise(i + 2) * 6} fill="#fff" opacity={0.85} />
      ))}
    </Layer>
  );
  const sx = toScreen(cam, 640, 600);
  const actors = (
    <>
      {frozen && (
        // the stranger, far back among the frozen crowd, facing you
        <Figure x={1272} y={716} scale={0.56} facing={-1} head={STRANGER.head} coat={STRANGER.coat} pose={STAND} look={{ x: 0.4, y: 0.1 }} mouth="none" />
      )}
      <You {...youP} age={age} mouth="flat" look={{ x: 0.7, y: 0 }} lids={0.2} blink={!frozen && blinking(frame, 3)} time={frame}
        held={season === "rain" ? Umbrella : undefined} />
    </>
  );
  return (
    <AbsoluteFill>
      <Lit glows={season === "summer" ? [{ x: sx.x + 300, y: 120, r: 700, color: "rgba(255,230,160,0.35)" }] : []}>
        <Stage cam={cam} radius={frozen ? FULL : 0} origin={{ x: WIDTH / 2, y: HEIGHT / 2 }} sky={SKY} back={back} actors={actors} front={front} />
      </Lit>
      <Tag at={b.year40} text="YEAR 40" x={70} y={90} size={78} />
    </AbsoluteFill>
  );
};

/* ---------- the corner: you read the street ---------- */

const Dog: React.FC<{ x: number; y: number; t: number; sit: number }> = ({ x, y, t, sit }) => {
  const trot = sit < 1 ? Math.sin(t * 0.6) * 18 * (1 - sit) : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(1.15)`}>
      <path d={`M-38 -44 Q-62 ${-70 + Math.sin(t * 0.8) * 10} -56 -82`} fill="none" stroke="#9a6a3c" strokeWidth={8} strokeLinecap="round" />
      {[-26, 26].map((lx, i) => <line key={lx} x1={lx} y1={-30} x2={lx + (i ? trot : -trot) * 0.6} y2={0} stroke="#7a5230" strokeWidth={9} strokeLinecap="round" />)}
      <g transform={`rotate(${-sit * 22} 30 -10)`}>
        <ellipse cx={0} cy={-42} rx={44} ry={20} fill="#c08850" stroke={INK} strokeWidth={4} />
        <circle cx={44} cy={-62} r={20} fill="#c08850" stroke={INK} strokeWidth={4} />
        <path d="M30 -76 Q22 -78 24 -50 Q34 -52 40 -74Z" fill="#7a5230" />
        <circle cx={52} cy={-66} r={4} fill={INK} />
        <circle cx={64} cy={-58} r={5} fill={INK} />
      </g>
      <path d={`M-40 -36 Q-90 -10 ${-150 + Math.sin(t * 0.3) * 10} -4`} fill="none" stroke="#d8344f" strokeWidth={4} />
    </g>
  );
};

const Car: React.FC<{ x: number; t: number; phoneDown: number }> = ({ x, t, phoneDown }) => (
  <g transform={`translate(${x} 0)`}>
    <ellipse cx={170} cy={905} rx={190} ry={14} fill="#000" opacity={0.25} />
    <path d="M0 880 V820 Q0 800 30 795 L90 740 Q110 724 140 724 H250 Q280 724 300 746 L340 795 V880Z" fill="#7fa0c4" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M100 790 L130 742 H180 V790Z M195 742 H245 Q262 742 275 758 L300 790 H195Z" fill="#cfe3ee" stroke={INK} strokeWidth={5} />
    <circle cx={160} cy={768 + phoneDown * 8} r={20} fill="#e6a0a0" />
    <circle cx={150} cy={762 + phoneDown * 10} r={3.5} fill={INK} /><circle cx={164} cy={762 + phoneDown * 10} r={3.5} fill={INK} />
    {phoneDown > 0.2 && <rect x={128} y={784} width={16} height={22} rx={3} fill="#bfe9ff" stroke={INK} strokeWidth={2} opacity={phoneDown} />}
    {[70, 270].map((w) => (
      <g key={w} transform={`rotate(${-t * 10} ${w} 880)`}>
        <circle cx={w} cy={880} r={30} fill={INK} /><circle cx={w} cy={880} r={12} fill={PAPER} /><rect x={w - 3} y={856} width={6} height={14} fill={PAPER} />
      </g>
    ))}
  </g>
);

const LADDER = { x: 1340, y: 1018, len: 470, lean: 11 };

const Corner: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, t, cues, clips } = shot;
  const b = beatTimes(cues, clips);
  const start = b.corner;
  const ladderLook = clips[61].from + 16;    // "accident"
  const dogLook = cues.before + 13;          // "it happens"
  const carLook = clips[61].from + 87;       // "Most days"
  const act = carLook + 4;
  const steady = act + 36;
  const whistle = act + 46;
  const driverUp = clips[61].from + 147;     // "pause"

  const stepK = ramp(frame, act, act + 26);
  const youX = mix(900, 1150, stepK);
  const walking = stepK > 0 && stepK < 1;
  const body: Pose = walking ? walkPose((frame - act) * 0.3) : STAND;
  const youP = { x: youX, y: 1012, scale: 1.25, facing: 1 as const, pose: body };

  const wobble = 3.4 * Math.sin(t * 0.21) * (1 - ramp(frame, steady - 4, steady + 6));
  const rail = { x: LADDER.x - Math.sin((LADDER.lean * Math.PI) / 180) * 210, y: LADDER.y - 210 };
  const armF = blendArm(body.armF, armTo(youP, rail.x - 8, rail.y), ramp(frame, act + 22, steady));
  const armB = blendArm(body.armB, [70, 70], ramp(frame, whistle - 4, whistle + 4) * (1 - ramp(frame, whistle + 24, whistle + 32)));

  const dogSit = ramp(frame, whistle + 6, whistle + 16);
  const dogX = mix(380, 560, linear(frame, start, whistle + 6));
  const d = Math.max(0, Math.min(frame - driverUp, 22));
  const carX = 2050 - 4.6 * (Math.min(frame, driverUp) - start) - 4.6 * (d - (d * d) / 44);
  const phoneDown = 1 - ramp(frame, driverUp - 2, driverUp + 6);

  const cam = cutAt(frame, [
    [start, drift(camAt(frame, [[start, { x: 1120, y: 780, zoom: 1.3 }], [act, { x: 1110, y: 770, zoom: 1.45 }]]), frame, "corner", 4)],
    [act, drift(camAt(frame, [[act, { x: 1150, y: 760, zoom: 1.08 }], [clips[62].from, { x: 1170, y: 770, zoom: 1.14 }]]), frame, "corner2", 5)],
  ]);
  const look = frame < ladderLook ? { x: 0.5, y: 0 }
    : frame < dogLook ? { x: 1, y: -0.8 }
    : frame < carLook ? { x: -1, y: -0.2 }
    : frame < act + 30 ? { x: 1, y: -0.1 } : frame < whistle + 20 ? { x: -0.9, y: -0.3 } : { x: 0.9, y: -0.2 };

  const back = <StreetBack cam={cam} frame={frame} t={t} leaves={LEAVES.autumn} />;
  const actors = (
    <>
      <Dog x={dogX} y={716} t={t} sit={dogSit} />
      <Car x={carX} t={t} phoneDown={phoneDown} />
      {/* lamp post with a ladder and a man changing the bulb */}
      <rect x={1252} y={420} width={18} height={600} fill={INK} />
      <path d="M1261 430 Q1261 380 1310 380 H1350" fill="none" stroke={INK} strokeWidth={14} />
      <path d="M1330 380 h50 l-12 34 h-26z" fill="#ffe9a8" stroke={INK} strokeWidth={5} />
      <g transform={`rotate(${-LADDER.lean + wobble} ${LADDER.x} ${LADDER.y})`}>
        {[-26, 26].map((dx) => <line key={dx} x1={LADDER.x + dx} y1={LADDER.y} x2={LADDER.x + dx} y2={LADDER.y - LADDER.len} stroke="#c98f5e" strokeWidth={10} />)}
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={LADDER.x - 26} x2={LADDER.x + 26} y1={LADDER.y - 40 - i * 58} y2={LADDER.y - 40 - i * 58} stroke="#c98f5e" strokeWidth={8} />)}
        <Figure x={LADDER.x + 30} y={LADDER.y - 230} scale={0.95} facing={-1} head="#7fc29b" cap="#cf5b3a"
          pose={{ ...STAND, lean: -4, armF: [176, 10], armB: [150, 30], legF: [20, -40], legB: [-6, -10] }} mouth={wobble > 1.5 || wobble < -1.5 ? "o" : "flat"} look={{ x: 0.6, y: -0.7 }} time={t} />
      </g>
      <You {...youP} pose={{ ...body, armF, armB }} age={1} lids={0.25} mouth={frame >= whistle && frame < whistle + 20 ? "o" : frame >= driverUp + 10 ? "smile" : "flat"}
        brows={frame >= ladderLook && frame < act ? "flat" : "none"} look={look} blink={blinking(frame, 3)} time={frame} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} sky={SKY} back={back} actors={actors} />;
};
