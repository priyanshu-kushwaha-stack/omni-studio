import { Figure } from "@whatif/kit/rig/Figure";
import { joints, lerpPose, reach, STAND, type Pose } from "@whatif/kit/rig/pose";
import { Layer, Stage, toScreen, waveRadius, type Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { blinking, HERO, mix, noise, ramp, type Shot } from "./shared";

const FLOOR = 880;
const FEET = 905;
const MUG = { x: 1140, y: 626 };
const GRAVITY = 1.45;

const Mug: React.FC<{ rotate?: number }> = ({ rotate = 0 }) => (
  <g transform={`rotate(${rotate})`}>
    <path d="M27 -14 q24 2 22 20 q-3 16 -22 13" fill="none" stroke="#fff6e3" strokeWidth={8} />
    <rect x={-28} y={-29} width={56} height={58} rx={9} fill="#fff6e3" stroke={INK} strokeWidth={4} />
    <rect x={-24} y={-25} width={48} height={11} rx={4} fill="#6b3f20" />
  </g>
);

export const Kitchen: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, t, wc, cues } = shot;
  const pause = shot.pauses[1];
  const knock = cues.catch - 15;
  const fall = t - wc(knock);
  const pos = (dt: number) => (dt <= 0 ? MUG : { x: MUG.x + dt * 3.2, y: MUG.y + 0.5 * GRAVITY * dt * dt });
  const frozen = pos(wc(cues.catch) - wc(knock));
  const grabbed = frame >= cues.coffee;

  const heroX = mix(1050, 1115, ramp(frame, cues.catch + 3, cues.coffee - 6));
  const base: Pose = lerpPose(STAND, { ...STAND, lean: 7, drop: 7 }, ramp(frame, cues.catch + 3, cues.coffee - 6));
  const sh = joints(base).shoulder;
  const from = (x: number, y: number) => reach(x - heroX - sh.x, y - FEET - sh.y);
  const rest: [number, number] = [14, 22];
  const toMug = from(MUG.x, MUG.y);
  const toFrozen = from(frozen.x, frozen.y);
  const sip = from(heroX + 58, FEET + joints(base).head.y + 14);
  const blend = (a: [number, number], b: [number, number], k: number): [number, number] => [mix(a[0], b[0], k), mix(a[1], b[1], k)];
  let arm = blend(rest, toMug, ramp(frame, knock - 9, knock));
  arm = blend(arm, rest, ramp(frame, knock + 1, knock + 6));
  arm = blend(arm, toFrozen, ramp(frame, cues.catch + 8, cues.coffee));
  arm = blend(arm, sip, ramp(frame, pause.to + 2, pause.to + 12));
  const sipping = ramp(frame, pause.to + 4, pause.to + 12);

  const cam: Camera = { x: mix(990, 1130, ramp(frame, shot.clips[2].from, cues.catch)), y: mix(630, 680, ramp(frame, cues.dumb, cues.catch)), zoom: mix(1.5, 2.1, ramp(frame, cues.dumb, cues.catch + 8)) };
  const origin = toScreen(cam, frozen.x, frozen.y);

  const back = (
    <>
      <Layer cam={cam} depth={0.45}>
        <rect x={-1500} y={-600} width={5000} height={2000} fill="#a8dcea" />
        <path d="M-1500 560 Q400 400 1000 520 T2600 500 V1200 H-1500Z" fill="#7fc29b" />
      </Layer>
      <Layer cam={cam} depth={1}>
        <path d="M-500 -400 H2800 V1400 H-500Z M180 180 H520 V520 H180Z" fillRule="evenodd" fill="#d6e8d8" />
        <line x1={350} y1={180} x2={350} y2={520} stroke={INK} strokeWidth={9} />
        <line x1={180} y1={350} x2={520} y2={350} stroke={INK} strokeWidth={9} />
        <rect x={168} y={514} width={366} height={18} rx={4} fill={INK} />
        <rect x={650} y={150} width={540} height={210} rx={10} fill="#1d9a8f" />
        <line x1={920} y1={150} x2={920} y2={360} stroke="#147a70" strokeWidth={7} />
        <circle cx={898} cy={330} r={8} fill={INK} /><circle cx={942} cy={330} r={8} fill={INK} />
        <rect x={1360} y={230} width={320} height={650} rx={22} fill="#f3e9d7" stroke={INK} strokeWidth={7} />
        <line x1={1360} y1={445} x2={1680} y2={445} stroke={INK} strokeWidth={7} />
        <rect x={1395} y={345} width={18} height={70} rx={8} fill={INK} /><rect x={1395} y={475} width={18} height={100} rx={8} fill={INK} />
        <rect x={-500} y={FLOOR} width={3300} height={500} fill="#c98f5e" />
        <rect x={420} y={655} width={750} height={225} fill="#d8344f" />
        <line x1={670} y1={655} x2={670} y2={880} stroke="#a82238" strokeWidth={7} />
        <line x1={920} y1={655} x2={920} y2={880} stroke="#a82238" strokeWidth={7} />
        <rect x={400} y={636} width={790} height={26} rx={7} fill="#f3e9d7" stroke={INK} strokeWidth={5} />
        <rect x={500} y={560} width={120} height={76} rx={14} fill={INK} />
        <rect x={528} y={544} width={18} height={18} rx={3} fill="#f3e9d7" /><rect x={570} y={544} width={18} height={18} rx={3} fill="#f3e9d7" />
      </Layer>
      {Array.from({ length: 8 }, (_, i) => {
        const d = fall - 1.5 - noise(i) * 2;
        if (d <= 0) return null;
        const p = pos(d);
        const x = p.x + (noise(i + 5) - 0.5) * d * 7;
        const y = p.y - 24 - noise(i + 9) * d * 2.4;
        return y < FLOOR ? <circle key={i} cx={x} cy={y} r={5 + noise(i + 2) * 7} fill="#6b3f20" /> : null;
      })}
      {frame > pause.to + 6 && <ellipse cx={1250} cy={FLOOR + 22} rx={mix(10, 92, ramp(frame, pause.to + 5, pause.to + 12))} ry={13} fill="#6b3f20" />}
      {!grabbed && <g transform={`translate(${pos(fall).x} ${pos(fall).y})`}><Mug rotate={fall > 0 ? fall * 3.4 : 0} /></g>}
    </>
  );
  const hero = (
    <Figure
      {...HERO}
      x={heroX} y={FEET}
      pose={{ ...base, armF: arm, tilt: mix(0, -18, sipping) }}
      blink={sipping > 0.5 || blinking(frame, 2)}
      mouth={sipping > 0.5 ? "none" : frame >= cues.catch ? "smirk" : "flat"}
      eyes={frame >= knock && frame < cues.catch ? 1.3 : 1}
      look={{ x: 0.7, y: frame >= knock && frame < cues.coffee ? 0.8 : 0 }}
      time={t}
      held={grabbed ? <Mug rotate={mix(49, 0, ramp(frame, cues.coffee, cues.coffee + 8))} /> : undefined}
    />
  );
  return <Stage cam={cam} radius={waveRadius(frame, pause)} origin={origin} back={back} actors={hero} />;
};
