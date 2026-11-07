import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { SIT, STAND, walkPose } from "@whatif/kit/rig/pose";
import { Layer, Stage, toScreen, type Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import { INK } from "@whatif/kit/theme";
import { Tag } from "@whatif/kit/ui/Tag";
import { Counter } from "../parts";
import { blinking, current, HERO, mix, MOTHER, ramp, type Shot } from "../shared";
import { Bus, StreetBack } from "../sets/Street";
import { FLOOR_Y, HomeBack, LAMP, STAIR_X, STEP_H, STEP_W } from "../sets/Home";
import { Lit } from "./Catch.rig";
import { NIGHT_SKY } from "./Catch.NightRoom";

/** A streetlamp on the near pavement. */
const StreetLamp: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x - 7} y={520} width={14} height={520} fill={INK} />
    <path d={`M${x} 530 Q${x + 10} 470 ${x + 70} 470`} stroke={INK} strokeWidth={10} fill="none" />
    <path d={`M${x + 46} 466 h52 l-8 18 h-36 Z`} fill={INK} />
    <ellipse cx={x + 72} cy={486} rx={18} ry={6} fill="#fff1b8" />
  </g>
);

/** A small car with its lights on, driving left. */
const Car: React.FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => (
  <g transform={`translate(${x} ${y})`}>
    <polygon points="-4,-30 -260,-70 -260,30" fill="#fff1b8" opacity={0.22} />
    <path d="M0 0 h220 v-40 l-40 -8 l-30 -34 h-90 l-30 34 l-30 8 Z" fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M62 -46 l24 -28 h56 l22 28 Z" fill="#bfe6ee" stroke={INK} strokeWidth={4} />
    <circle cx={50} cy={4} r={20} fill={INK} /><circle cx={175} cy={4} r={20} fill={INK} />
    <circle cx={4} cy={-28} r={8} fill="#fff1b8" />
  </g>
);

/** Line 47, MONTH 6: two-second shots of you watching, at the crossing, on the bus, at the foot of the stairs. */
export const Montage: React.FC<{ shot: Shot; end: number }> = ({ shot, end }) => {
  const { frame, t, cues } = shot;
  const m = cues.month6;
  const name = current(frame, [[m, "crossing"], [m + 50, "bus"], [m + 100, "stairs"]] as [number, string][]);
  const local = frame - (name === "crossing" ? m : name === "bus" ? m + 50 : m + 100);
  const dart = Math.floor(local / 13) % 3;

  let cam: Camera;
  let scene: React.ReactNode;
  if (name === "crossing") {
    cam = drift({ x: mix(1080, 1120, local / 50), y: 760, zoom: 1.5 }, frame, "m1");
    const lampAt = toScreen(cam, 872, 486);
    scene = (
      <Lit extra={{ glows: [{ x: lampAt.x, y: lampAt.y, r: 520, color: "rgba(255,214,140,0.55)" }] }}>
        <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} sky={NIGHT_SKY}
          back={<><StreetBack cam={cam} frame={frame} t={t} crowd red={dart !== 1} /><Layer cam={cam} depth={1}><StreetLamp x={800} /><Car x={1900 - local * 16} y={880} color="#7fa0c4" /></Layer></>}
          actors={<Figure {...HERO} x={1010} y={1010} scale={1.3} pose={{ ...STAND, armF: [20, 30] }} mouth="flat" brows="flat" lids={0.3}
            look={dart === 0 ? { x: 0.95, y: 0 } : dart === 1 ? { x: -0.4, y: 0 } : { x: 0.6, y: 0.4 }} time={frame} blink={blinking(frame, 4)} />} />
      </Lit>
    );
  } else if (name === "bus") {
    const busX = 1300 - local * 9;
    cam = { x: busX + 420, y: 700, zoom: 1.6 };
    const sx = (lx: number) => busX + lx * 1.3;
    const sy = (ly: number) => 925 + (ly - 885) * 1.3;
    const inside = toScreen(cam, sx(300), sy(680));
    scene = (
      <Lit extra={{ glows: [{ x: inside.x, y: inside.y, r: 640, color: "rgba(255,226,170,0.42)" }] }}>
        <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} sky={NIGHT_SKY}
          back={<><StreetBack cam={cam} frame={frame} t={t} /><Layer cam={cam} depth={1}>
            <g transform={`translate(${busX} 925) scale(1.3) translate(${-busX} -885)`}>
              <Bus x={busX} t={t} moving />
              {[420, 540, 660].map((w, i) => (
                <g key={w} transform={`translate(${busX} 0)`}>
                  <circle cx={w} cy={692 + (i === 1 ? Math.sin(frame / 6) * 2 : 0)} r={20} fill={["#7fa0c4", "#c9c3e0", "#7fc29b"][i]} />
                  {i === 1 && <path d={`M${w - 20} 684 Q${w} 664 ${w + 20} 684`} fill="#e9e2f2" />}
                  <rect x={w - 22} y={708} width={44} height={16} rx={6} fill="#3b3e47" />
                </g>
              ))}
            </g>
          </Layer></>}
          actors={<>
            <defs><clipPath id="m2seat"><rect x={sx(250)} y={sy(640)} width={130} height={sy(724) - sy(640)} /></clipPath></defs>
            <g clipPath="url(#m2seat)">
              <Figure {...HERO} x={sx(300) + 4} y={sy(640) + 52 + 198} scale={0.75} pose={SIT} mouth="flat" brows="flat" lids={0.25}
                look={dart === 1 ? { x: -0.3, y: 0.1 } : { x: 0.95, y: 0.1 }} facing={1} time={frame} />
            </g>
          </>} />
      </Lit>
    );
  } else {
    cam = drift({ x: 1300, y: 640, zoom: 1.45 }, frame, "m3");
    const st = mix(6, 3.2, ramp(frame, m + 100, end));
    const mx = STAIR_X + (st - 0.5) * STEP_W;
    const my = FLOOR_Y - st * STEP_H - Math.abs(Math.sin(Math.PI * st)) * 5;
    const lamp = toScreen(cam, LAMP.x, LAMP.y + 40);
    scene = (
      <Lit extra={{ glows: [{ x: lamp.x, y: lamp.y, r: 760, color: "rgba(255,186,104,0.6)" }, { x: 1300, y: 560, r: 900, color: "rgba(255,190,120,0.25)" }] }}>
        <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<HomeBack cam={cam} />}
          actors={<>
            <Figure x={mx} y={my} scale={0.95} facing={-1} pose={{ ...walkPose(st * Math.PI), lean: -3, armF: [150, 20], armB: [20, 20] }} {...MOTHER}
              mouth="smile" brows="raised" lids={0.3} look={{ x: 0.6, y: 0.7 }} blink={blinking(frame, 5)} />
            <Figure {...HERO} x={1150} y={FLOOR_Y} pose={{ ...STAND, lean: 4, armF: [60, 40], armB: [45, 40] }} mouth="flat" brows="worry" lids={0.15}
              look={{ x: 0.75, y: -0.7 }} time={frame} />
          </>} />
      </Lit>
    );
  }

  return (
    <AbsoluteFill>
      {scene}
      <Tag at={m} text="MONTH 6" x={70} y={70} size={72} />
      <Counter ticks={[{ at: m, n: 10 }]} until={end} />
    </AbsoluteFill>
  );
};
