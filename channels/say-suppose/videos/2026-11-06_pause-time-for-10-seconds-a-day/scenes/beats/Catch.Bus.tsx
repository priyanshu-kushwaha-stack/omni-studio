import { AbsoluteFill, interpolate } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { lerpPose, runPose, SIT, SNAP, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Layer, Stage, toScreen, waveRadius, type Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import type { Pause } from "@whatif/kit/world/clock";
import { INK } from "@whatif/kit/theme";
import { Counter, evenTicks } from "../parts";
import { blinking, camAt, current, HERO, linear, mix, ramp, type Shot } from "../shared";
import { Bus, SKY, StreetBack } from "../sets/Street";
import { Fingers, handWorld, Lit } from "./Catch.rig";
import { Poster } from "../../../../brand/Subscribe";

/** The channel's ad on a bus shelter by the stop, in world units on the near pavement, left of the stop's post.
 *  Part of the world: it greys and freezes with everything else during the pause. */
const SH = { x0: 690, x1: 1012, roof: 572, base: 972, ad: { x: 716, y: 632, s: 0.7 } };
const Shelter: React.FC = () => {
  const ad = { w: 214 * SH.ad.s, h: 300 * SH.ad.s };
  return (
    <g>
      <ellipse cx={(SH.x0 + SH.x1) / 2} cy={SH.base + 6} rx={(SH.x1 - SH.x0) / 2 + 26} ry={14} fill="#3a2414" opacity={0.28} />
      <rect x={884} y={SH.roof + 30} width={118} height={SH.base - SH.roof - 90} fill="#d7e8e4" opacity={0.4} />
      <path d={`M894 ${SH.roof + 46} L918 ${SH.roof + 46} L898 ${SH.roof + 110} Z`} fill="#ffffff" opacity={0.3} />
      <rect x={890} y={862} width={108} height={14} rx={4} fill="#b5683a" />
      <rect x={900} y={876} width={7} height={SH.base - 876} fill={INK} />
      <rect x={982} y={876} width={7} height={SH.base - 876} fill={INK} />
      <rect x={SH.x0 + 10} y={SH.roof + 8} width={11} height={SH.base - SH.roof - 8} rx={3} fill={INK} />
      <rect x={SH.x1 - 21} y={SH.roof + 8} width={11} height={SH.base - SH.roof - 8} rx={3} fill={INK} />
      <rect x={874} y={SH.roof + 8} width={9} height={SH.base - SH.roof - 8} rx={3} fill={INK} />
      <rect x={SH.ad.x - 10} y={SH.ad.y - 10} width={ad.w + 20} height={ad.h + 20} rx={7} fill={INK} />
      <g transform={`translate(${SH.ad.x} ${SH.ad.y}) scale(${SH.ad.s})`}>
        <foreignObject x={0} y={0} width={214} height={300}><Poster w={214} h={300} /></foreignObject>
      </g>
      <path d={`M${SH.ad.x} ${SH.ad.y} h${ad.w * 0.5} L${SH.ad.x} ${SH.ad.y + ad.h * 0.45} Z`} fill="#ffffff" opacity={0.12} />
      <rect x={SH.x0} y={SH.roof} width={SH.x1 - SH.x0} height={24} rx={8} fill="#1d9a8f" />
      <rect x={SH.x0} y={SH.roof + 16} width={SH.x1 - SH.x0} height={9} rx={4} fill="#137a71" />
      <rect x={SH.x0 + 12} y={SH.roof + 4} width={SH.x1 - SH.x0 - 24} height={5} rx={2.5} fill="#5cc4b9" opacity={0.7} />
    </g>
  );
};

/** The bus's front while it waits at the stop, and the bus drawn 1.3 times the set's size, wheels on the kerb. */
const BF = 1150;
const BUS_SCALE = 1.3;
const busPoint = (busX: number, lx: number, ly: number) => ({ x: busX + lx * BUS_SCALE, y: 925 + (ly - 885) * BUS_SCALE });
const DOOR = { x0: 118, x1: 232, y0: 630, y1: 850 };
const SEAT_WIN = { x0: 250, x1: 350, y0: 640, y1: 724 };
const KERB = { x: 1190, y: 1010, s: 1.3 };

/** Lines 39-40 (v7): late for the bus; the doors close; you snap, stroll aboard through the frozen doors, and sit. */
export const BusStop: React.FC<{ shot: Shot; pause: Pause }> = ({ shot, pause }) => {
  const { frame, t, wc, cues, clips } = shot;
  const paused = frame >= pause.from && frame < pause.to;
  const tOnce = wc(cues.once);
  const doors = interpolate(t, [wc(cues.doors), tOnce, tOnce + 7], [0, 0.35, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const go = Math.max(0, t - (tOnce + 8));
  const busX = BF - go * go * 0.09;

  const shotName = current(frame, [[clips[39].from, "wide"], [cues.doors, "doors"], [cues.doors + 44, "hand"], [clips[40].from - 10, "board"]] as [number, string][]);
  const cam: Camera =
    shotName === "wide" ? camAt(frame, [[clips[39].from, { x: 980, y: 640, zoom: 1.05 }], [cues.doors, { x: 1200, y: 660, zoom: 1.1 }]])
    : shotName === "doors" ? drift({ x: 1275, y: 740, zoom: 1.6 }, frame, "door")
    : shotName === "hand" ? camAt(frame, [[cues.doors + 44, { x: 1218, y: 740, zoom: 2.3 }], [clips[40].from - 10, { x: 1224, y: 728, zoom: 2.45 }]])
    : camAt(frame, [[clips[40].from - 10, { x: 1290, y: 770, zoom: 1.42 }], [pause.to, { x: 1335, y: 752, zoom: 1.5 }]]);

  // You: run in, stop at the kerb, hand twitching; snap; stroll to the doors and in; then sit by the window.
  const arrive = cues.doors + 24;
  const run = linear(frame, clips[39].from, arrive);
  const stroll = ramp(frame, pause.from + 9, pause.from + 35);
  const stepIn = linear(frame, pause.from + 35, pause.from + 45);
  const seated = frame >= pause.from + 44;
  let x = mix(380, KERB.x, run);
  let y = KERB.y;
  let s = KERB.s;
  let pose: Pose;
  if (frame < arrive) pose = runPose((frame - clips[39].from) * 0.45);
  else if (frame < cues.doors + 44) pose = lerpPose(runPose(0), { ...STAND, lean: 6, drop: 4 }, ramp(frame, arrive, arrive + 10));
  else if (frame < clips[40].from + 5) pose = { ...STAND, armF: [70, 78] };
  else if (frame < pause.from + 9) pose = lerpPose({ ...STAND, armF: [70, 78] }, SNAP, ramp(frame, clips[40].from + 5, pause.from));
  else pose = lerpPose(SNAP, walkPose((frame - pause.from) * 0.32), ramp(frame, pause.from + 6, pause.from + 14));
  if (frame >= pause.from + 9) {
    x = mix(KERB.x, 1378, stroll) + stepIn * 90;
    y = mix(KERB.y, 880, stroll);
    s = mix(KERB.s, 0.95, stroll);
  }
  const inDoor = frame >= pause.from + 33;
  const twitch = frame >= cues.doors + 44 && frame < clips[40].from + 5 ? linear(frame, cues.doors + 44, clips[40].from) * 3 + (frame % 23 < 6 ? 0.4 : 0) : 0;
  const snapK = ramp(frame, pause.from - 6, pause.from);
  const forearm = pose.armF[0] + pose.armF[1];
  const hand = handWorld(x, y, pose, s, 1);
  const origin = toScreen(cam, hand.x, hand.y);

  const dartAt = frame - (cues.doors + 44);
  const keep = clips[39].from + Math.round(clips[39].frames * 0.78);
  const look = shotName === "hand"
    ? (Math.floor(dartAt / 14) % 2 === 0 ? { x: 0.95, y: -0.1 } : { x: 0.35, y: 0.75 })
    : { x: 0.9, y: 0 };
  const face = frame >= clips[40].from
    ? { mouth: "smirk" as const, brows: "raised" as const, lids: 0.25, eyes: 1 }
    : frame >= cues.doors + 44
      ? { mouth: frame >= keep ? ("flat" as const) : ("o" as const), brows: frame >= keep ? ("angry" as const) : ("worry" as const), lids: frame >= keep ? 0.25 : 0, eyes: 1.15 }
      : { mouth: frame < arrive ? ("open" as const) : ("o" as const), brows: "worry" as const, lids: 0, eyes: 1.2 };

  const door = { a: busPoint(busX, DOOR.x0, DOOR.y0), b: busPoint(busX, DOOR.x1, DOOR.y1) };
  const leaf = ((DOOR.x1 - DOOR.x0) / 2) * doors * BUS_SCALE;
  const win = { a: busPoint(busX, SEAT_WIN.x0, SEAT_WIN.y0), b: busPoint(busX, SEAT_WIN.x1, SEAT_WIN.y1) };

  const back = (
    <>
      <StreetBack cam={cam} frame={frame} t={t} paused={paused} />
      <Layer cam={cam} depth={1} flat><g transform="translate(40 0)"><Shelter /></g></Layer>
      <Layer cam={cam} depth={1}>
        {/* the stop: a post and its sign on the near pavement */}
        <rect x={1046} y={600} width={14} height={440} fill={INK} />
        <circle cx={1053} cy={590} r={44} fill="#2c6fbb" stroke={INK} strokeWidth={6} />
        <rect x={1031} y={572} width={44} height={30} rx={6} fill="#f3e9d7" />
        <circle cx={1040} cy={606} r={5} fill="#f3e9d7" /><circle cx={1066} cy={606} r={5} fill="#f3e9d7" />
        <g transform={`translate(${busX} 925) scale(${BUS_SCALE}) translate(${-busX} -885)`}>
          <Bus x={busX} t={t} moving={!paused && go > 0} />
          <g transform={`translate(${busX} 0)`}>
            {/* passengers in the far windows */}
            {[420, 540, 660].map((w, i) => (
              <g key={w}>
                <circle cx={w} cy={692} r={20} fill={["#7fa0c4", "#b58fc7", "#7fc29b"][i]} />
                <rect x={w - 22} y={708} width={44} height={16} rx={6} fill="#3b3e47" />
              </g>
            ))}
            {/* the doors: a dark doorway and two glass leaves that slide shut */}
            <rect x={DOOR.x0} y={DOOR.y0} width={DOOR.x1 - DOOR.x0} height={DOOR.y1 - DOOR.y0} fill="#3b3346" stroke={INK} strokeWidth={6} />
            {[0, 1].map((k) => {
              const w = ((DOOR.x1 - DOOR.x0) / 2) * Math.max(0.12, doors);
              const lx = k === 0 ? DOOR.x0 : DOOR.x1 - w;
              return (
                <g key={k}>
                  <rect x={lx} y={DOOR.y0} width={w} height={DOOR.y1 - DOOR.y0} fill="#cf5b3a" stroke={INK} strokeWidth={5} />
                  <rect x={lx + 6} y={DOOR.y0 + 10} width={Math.max(0, w - 12)} height={120} rx={4} fill="#bfe6ee" />
                </g>
              );
            })}
          </g>
        </g>
      </Layer>
    </>
  );

  const clipId = inDoor ? "boardclip" : seated ? "seatclip" : undefined;
  const hero = (
    <>
      <defs>
        <clipPath id="boardclip">
          <rect x={door.a.x + leaf} y={door.a.y} width={door.b.x - door.a.x - 2 * leaf} height={door.b.y - door.a.y} />
          <rect x={door.a.x - 200} y={door.b.y} width={600} height={400} />
        </clipPath>
        <clipPath id="seatclip"><rect x={win.a.x} y={win.a.y} width={win.b.x - win.a.x} height={win.b.y - win.a.y} /></clipPath>
      </defs>
      {!seated && (
        <g clipPath={clipId ? `url(#${clipId})` : undefined}>
          <Figure {...HERO} x={x} y={y} scale={s} pose={pose} {...face} look={look} time={frame} flow={frame < arrive ? 0.9 : 0.15}
            blink={!paused && blinking(frame, 2)}
            held={shotName === "hand" || (frame >= clips[40].from && frame < pause.from + 10)
              ? <Fingers angle={forearm} twitch={twitch} snap={snapK} /> : undefined} />
        </g>
      )}
      {seated && (
        <g clipPath="url(#seatclip)">
          <Figure {...HERO} x={(win.a.x + win.b.x) / 2 + 4} y={win.a.y + 52 + 0.75 * 264 - ramp(frame, pause.from + 44, pause.from + 52) * 6}
            scale={0.75} pose={SIT} mouth="smirk" brows="raised" lids={0.45} look={{ x: 0.6, y: -0.2 }} time={frame} />
        </g>
      )}
    </>
  );

  return (
    <AbsoluteFill>
      <Lit extra={{ glows: [{ x: 360, y: 150, r: 760, color: "rgba(255,214,150,0.5)" }] }}>
        <Stage cam={cam} radius={paused ? waveRadius(frame, pause) : 0} origin={origin} sky={SKY} back={back} actors={hero} />
      </Lit>
      <Counter ticks={evenTicks(pause.from, pause.to - 8)} until={pause.to + 6} />
    </AbsoluteFill>
  );
};
