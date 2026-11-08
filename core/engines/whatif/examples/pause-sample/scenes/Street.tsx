import { AbsoluteFill, interpolate } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { lerpPose, runPose, SNAP, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Layer, Stage, toScreen, waveRadius, type Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, HEIGHT, INK, WIDTH } from "@whatif/kit/theme";
import { Flip } from "@whatif/kit/ui/Flip";
import { Tag } from "@whatif/kit/ui/Tag";
import { blinking, HERO, linear, mix, noise, ramp, type Shot } from "./shared";

const ROAD_TOP = 725;
const ROAD_BOTTOM = 930;
const KID_FEET = 862;
const BUS_STOP_X = 1400;
const BUS_SPEED = 11;
const LIGHT_X = 2450;

const CROWD = [-40, 130, 300, 480, 850, 1020, 1190, 1350, 1530].map((x, i) => ({
  x,
  head: ["#c96f2d", "#7fa0c4", "#b58fc7", "#7fc29b", "#e6a0a0", "#d9c26a"][i % 6],
  facing: (i % 3 === 0 ? -1 : 1) as 1 | -1,
  pose: { ...walkPose(i * 1.7), armF: i % 4 === 0 ? [110, 60] : walkPose(i * 1.7).armF } as Pose,
  scale: 0.62 + noise(i) * 0.06,
}));

const STRANGER_X = 655;
const COAT = "#3f3346";

const SKY = (
  <>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8fd0e4" />
        <stop offset="0.75" stopColor="#fbe7c2" />
      </linearGradient>
    </defs>
    <rect width={WIDTH} height={HEIGHT} fill="url(#sky)" />
  </>
);

const Bus: React.FC<{ x: number; t: number; moving: boolean }> = ({ x, t, moving }) => (
  <g transform={`translate(${x} 0)`}>
    <ellipse cx={380} cy={885} rx={410} ry={20} fill="#000" opacity={0.25} />
    {moving && [0, 1, 2].map((i) => <rect key={i} x={790 + ((t * 9 + i * 40) % 90)} y={700 + i * 55} width={120} height={7} rx={4} fill="#fff" opacity={0.5} />)}
    <path d="M28 610 Q0 610 0 650 V850 H760 V610Z" fill="#cf5b3a" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <rect x={0} y={750} width={760} height={24} fill="#f3e9d7" />
    <path d="M14 636 H104 V735 H6 V650 Q6 636 14 636Z" fill="#bfe6ee" stroke={INK} strokeWidth={6} />
    {[130, 250, 370, 490, 610].map((w) => <rect key={w} x={w} y={640} width={100} height={84} rx={9} fill="#bfe6ee" stroke={INK} strokeWidth={6} />)}
    <circle cx={62} cy={700} r={24} fill="#d9c26a" />
    <circle cx={50} cy={695} r={4} fill={INK} /><circle cx={64} cy={695} r={4} fill={INK} />
    <circle cx={12} cy={806} r={14} fill="#fff1b8" stroke={INK} strokeWidth={5} />
    {[150, 610].map((w) => (
      <g key={w} transform={`rotate(${-t * 14} ${w} 852)`}>
        <circle cx={w} cy={852} r={38} fill={INK} /><circle cx={w} cy={852} r={15} fill="#f3e9d7" />
        <rect x={w - 3} y={824} width={6} height={18} fill="#f3e9d7" />
      </g>
    ))}
  </g>
);

const Pigeon: React.FC<{ x: number; y: number; flap: number }> = ({ x, y, flap }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse rx={23} ry={11} fill="#5f6a75" />
    <circle cx={-20} cy={-7} r={8} fill="#5f6a75" />
    <path d={`M0 -4 Q12 ${-34 * flap} 30 ${-30 * flap} L18 2Z`} fill="#3f4852" />
    <path d={`M-4 -4 Q-6 ${-30 * flap} -20 ${-32 * flap} L-14 2Z`} fill="#3f4852" />
  </g>
);

export const Street: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, t, wc, cues, clips } = shot;
  const pause = shot.pauses[3];
  const paused = frame >= pause.from;

  // Camera: walk with the hero, look down the road at the bus, whip back to the kid, then hunt the crowd.
  const keys: [number, Camera][] = [
    [clips[5].from, { x: 590, y: 650, zoom: 1.3 }],
    [cues.bus - 12, { x: 640, y: 650, zoom: 1.3 }],
    [cues.bus + 4, { x: 2300, y: 610, zoom: 1.12 }],
    [cues.kid - 8, { x: 2200, y: 610, zoom: 1.12 }],
    [cues.kid + 6, { x: 790, y: 650, zoom: 1.16 }],
    [cues.pause, { x: 800, y: 650, zoom: 1.2 }],
    [cues.notice, { x: 980, y: 670, zoom: 1.38 }],
    [cues.someone - 6, { x: 1010, y: 650, zoom: 1.5 }],
    [cues.someone + 26, { x: 770, y: 610, zoom: 1.7 }],
    [cues.looking, { x: 755, y: 590, zoom: 2.05 }],
    [cues.you - 2, { x: 750, y: 565, zoom: 2.8 }],
    [cues.you + 10, { x: 748, y: 558, zoom: 5.2 }],
  ];
  const at = (pick: (c: Camera) => number) =>
    interpolate(frame, keys.map((k) => k[0]), keys.map((k) => pick(k[1])), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cam: Camera = { x: at((c) => c.x), y: at((c) => c.y), zoom: at((c) => c.zoom) };

  const busX = BUS_STOP_X + (wc(cues.pause) - t) * BUS_SPEED;
  const kidWalk = ramp(t, wc(cues.kid) - 30, wc(cues.pause));
  const kidX = mix(1095, 1225, kidWalk);
  const ballX = kidX + 118 + kidWalk * 16;

  const walkEnd = cues.kid + 8;
  const strolled = 215 + (Math.min(frame, walkEnd) - clips[5].from) * 1.5;
  const runT = linear(frame, cues.run, cues.notice - 6);
  const heroX = mix(strolled, 1085, runT);
  const heroY = mix(1010, 895, runT);
  const heroScale = mix(1.3, 1, runT);
  const running = frame >= cues.run && frame < cues.notice - 6;
  const stopped = frame >= cues.notice - 6;
  const turned = frame >= cues.notice + 12;
  const snap = ramp(frame, cues.pause - 7, cues.pause + 1);
  let pose: Pose = frame < walkEnd ? walkPose(frame * 0.3) : lerpPose(STAND, SNAP, snap);
  if (running) pose = runPose((frame - cues.run) * 0.44);
  if (stopped) pose = lerpPose(runPose(0), { ...STAND, armF: turned ? [-30, 20] : [70, 18] }, ramp(frame, cues.notice - 6, cues.notice + 4));
  const origin = toScreen(cam, heroX + 20, heroY - 300 * heroScale);

  const strangerGo = ramp(frame, cues.someone + 4, cues.looking);
  const strangerX = mix(STRANGER_X, STRANGER_X + 92, strangerGo);
  const strangerY = mix(715, 752, strangerGo);
  const strangerMoving = frame >= cues.someone + 4 && frame < cues.looking;
  const facesUs = ramp(frame, cues.looking, cues.looking + 14);
  const colour = ramp(frame, cues.someone - 8, cues.someone + 8);

  const strangerProps = {
    x: strangerX, y: strangerY, scale: 0.74, coat: COAT, mouth: frame >= cues.you + 6 ? ("smirk" as const) : ("none" as const),
    pose: strangerMoving ? walkPose((frame - cues.someone) * 0.2) : STAND,
    look: { x: mix(0.8, -0.28, facesUs), y: mix(0, 0.1, facesUs) },
    eyes: frame >= cues.you ? 1.15 : 1,
  };

  const back = (
    <>
      <Layer cam={cam} depth={0.25} flat>
        <circle cx={700} cy={250} r={85} fill="#fff1b8" />
        <path d="M-900 560 L-700 380 H-540 V260 H-350 V420 H-150 V300 H60 V450 H260 V230 H460 V430 H700 V330 H900 V240 H1120 V440 H1400 V300 H1650 V420 H1900 V270 H2200 V430 H2500 V320 H2800 V760 H-900Z" fill="#c9dcd2" />
      </Layer>
      <Layer cam={cam} depth={0.6} flat>
        {Array.from({ length: 13 }, (_, i) => {
          const bx = -700 + i * 370;
          const h = 240 + noise(i) * 240;
          const color = ["#e4b48e", "#dc9d8f", "#e6cd98", "#a3c7bf", "#d4ae93"][i % 5];
          return (
            <g key={i}>
              <rect x={bx} y={700 - h} width={350} height={h + 40} fill={color} />
              {Array.from({ length: Math.floor(h / 75) * 3 }, (_, w) => (
                <rect key={w} x={bx + 34 + (w % 3) * 102} y={700 - h + 28 + Math.floor(w / 3) * 75} width={66} height={46} rx={4} fill={noise(i * 10 + w) > 0.8 ? "#fff1b8" : "rgba(40,50,60,.22)"} />
              ))}
            </g>
          );
        })}
      </Layer>
      <Layer cam={cam} depth={1}>
        <rect x={-800} y={ROAD_TOP - 45} width={5000} height={50} fill="#d9cbb0" />
        <rect x={-800} y={ROAD_TOP} width={5000} height={ROAD_BOTTOM - ROAD_TOP} fill="#4b4f57" />
        <rect x={-800} y={ROAD_BOTTOM} width={5000} height={400} fill="#d9cbb0" />
        <rect x={-800} y={ROAD_BOTTOM} width={5000} height={14} fill="#b7a98f" />
        <rect x={-800} y={ROAD_TOP - 6} width={5000} height={10} fill="#b7a98f" />
        {Array.from({ length: 34 }, (_, i) => <rect key={i} x={-700 + i * 160} y={826} width={88} height={9} rx={3} fill="#f3e9d7" opacity={0.85} />)}
        {Array.from({ length: 7 }, (_, i) => <rect key={i} x={1012 + i * 54} y={735} width={32} height={185} fill="#f3e9d7" opacity={0.9} />)}
      </Layer>
      <Layer cam={cam} depth={1}>
        {[60, 1590, 2850].map((x) => (
          <g key={x}>
            <rect x={x - 11} y={470} width={22} height={225} fill="#6f4a2f" />
            <circle cx={x} cy={430} r={92} fill="#4c9a76" /><circle cx={x - 62} cy={475} r={58} fill="#4c9a76" /><circle cx={x + 62} cy={478} r={62} fill="#3f8a68" />
          </g>
        ))}
        <rect x={LIGHT_X - 8} y={420} width={16} height={280} fill={INK} />
        <rect x={LIGHT_X - 36} y={290} width={72} height={185} rx={13} fill={INK} />
        {frame >= cues.red - 4 && <circle cx={LIGHT_X} cy={330} r={46 + Math.sin(frame * 0.5) * 7} fill={CRIMSON} opacity={0.35} />}
        <circle cx={LIGHT_X} cy={330} r={24} fill={CRIMSON} />
        <circle cx={LIGHT_X} cy={383} r={24} fill="#57482a" /><circle cx={LIGHT_X} cy={436} r={24} fill="#28503c" />
        {CROWD.map((c, i) => (
          <Figure key={i} x={c.x} y={712 + (i % 2) * 9} scale={c.scale} facing={c.facing} pose={c.pose} head={c.head} look={{ x: 0.6, y: 0 }} mouth={i % 3 === 0 ? "smile" : "flat"} blink={!paused && blinking(frame, i)} />
        ))}
        {colour < 1 && <Figure {...strangerProps} x={STRANGER_X} y={715} pose={STAND} look={{ x: 0.8, y: 0 }} eyes={1} mouth="none" head={CRIMSON} />}
      </Layer>
      {Array.from({ length: 6 }, (_, i) => {
        const x = 500 + i * 180 + ((t * (2 + noise(i) * 2)) % 700);
        const y = 180 + noise(i + 20) * 170 - (t % 300) * 0.25;
        return <Pigeon key={i} x={x} y={y} flap={Math.sin(t * 0.8 + i)} />;
      })}
      {Array.from({ length: 14 }, (_, i) => {
        const x = 1400 + noise(i) * 420 + Math.sin(t / 15 + i) * 30;
        const y = 420 + ((noise(i + 30) * 320 + t * (1.5 + noise(i + 7))) % 320);
        return <ellipse key={i} cx={x} cy={y} rx={13} ry={6.5} fill="#4c9a76" transform={`rotate(${t * 5 + i * 40} ${x} ${y})`} />;
      })}
      <Bus x={busX} t={t} moving={!paused} />
      <g transform={`translate(${ballX} ${KID_FEET - 26 - Math.abs(Math.sin(t * 0.22)) * 42}) rotate(${t * 9})`}>
        <circle r={26} fill="#f3e9d7" stroke={INK} strokeWidth={5} /><path d="M-26 0 H26 M0 -26 V26" stroke={CRIMSON} strokeWidth={5} />
      </g>
      <Figure x={kidX} y={KID_FEET} scale={0.72} pose={walkPose(t * 0.4)} head="#e0a070" cap="#2c6fbb" look={{ x: 0.8, y: 0 }} mouth="smile" />
    </>
  );

  const stranger = colour > 0 && (
    <g opacity={colour}>
      <Figure {...strangerProps} head={CRIMSON} />
    </g>
  );
  const hero = (
    <>
      <Figure
        {...HERO}
        x={heroX} y={heroY} scale={heroScale} facing={turned ? -1 : 1}
        pose={pose}
        flow={running ? 1 : frame < walkEnd ? 0.25 : 0}
        time={frame}
        mouth={frame >= cues.kid ? (running ? "open" : turned ? "flat" : "o") : "smile"}
        eyes={frame >= cues.kid ? 1.25 : 1}
        blink={frame < cues.kid && blinking(frame, 3)}
        look={frame >= cues.bus && frame < cues.kid ? { x: 1, y: 0 } : { x: 0.8, y: 0 }}
      />
      {stranger}
    </>
  );

  const ticks = [
    { at: cues.pause, n: 10 }, { at: cues.nine, n: 9 }, { at: cues.eight, n: 8 }, { at: cues.seven, n: 7 },
    { at: cues.seven + 56, n: 6 }, { at: cues.seven + 112, n: 5 }, { at: cues.seven + 168, n: 4 }, { at: cues.seven + 224, n: 3 },
  ];
  const now = [...ticks].reverse().findIndex((k) => frame >= k.at);
  const i = now < 0 ? -1 : ticks.length - 1 - now;
  return (
    <AbsoluteFill>
      <Stage cam={cam} radius={paused ? waveRadius(frame, pause) : 0} origin={origin} sky={SKY} back={back} actors={hero} />
      {frame < cues.pause && <Tag at={cues.day12} text="DAY 12" x={70} y={60} size={78} />}
      {i >= 0 && frame < cues.looking && (
        <div style={{ position: "absolute", right: 60, top: 50, transform: "scale(0.85)", transformOrigin: "top right" }}>
          <Flip value={String(ticks[i].n)} previous={String(ticks[Math.max(0, i - 1)].n)} changedAt={ticks[i].at} />
        </div>
      )}
    </AbsoluteFill>
  );
};
