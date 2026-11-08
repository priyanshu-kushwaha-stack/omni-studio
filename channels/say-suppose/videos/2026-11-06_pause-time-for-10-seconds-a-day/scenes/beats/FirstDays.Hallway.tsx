import { AbsoluteFill } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import { Figure } from "@whatif/kit/rig/Figure";
import { lerpPose, SNAP, STAND, tiptoePose, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Layer, Stage, toScreen, waveRadius, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { CRIMSON, INK } from "@whatif/kit/theme";
import { Tag } from "@whatif/kit/ui/Tag";
import { Bubble, Counter, evenTicks } from "../parts";
import { blinking, camAt, current, HERO, linear, mix, ramp, type Shot } from "../shared";
import { armTo, blendArm, body, firstDaysPauses, onLayer, Sfx } from "./FirstDays.common";

/** Lines 14-15 (the boss) and 19-21 (the clock that sticks, the remote): the office hallway from the owner's sample,
 *  with an office door that opens and a wall clock. */

const FLOOR = 800;
const HERO_Y = 868;
/** The boss's door is drawn on the wall layer (depth 0.85); at this hallway's cameras it shows about here. */
const BOSS_X = 1415;
const BOSS_Y = FLOOR + 40;
const BOSS_SCALE = 1.22;
const BOSS_DOOR = 1180;
const WALL_DEPTH = 0.85;
/** The wall clock, in the wall layer's units. */
const CLOCK = { x: 1485, y: 400, r: 66 };

const Clock: React.FC<{ second: number }> = ({ second }) => {
  const a = (deg: number, len: number) => ({ x: CLOCK.x + Math.sin((deg * Math.PI) / 180) * len, y: CLOCK.y - Math.cos((deg * Math.PI) / 180) * len });
  const h = a(304, 30);
  const m = a(60, 46);
  const s = a(second, 54);
  const tail = a(second + 180, 14);
  return (
    <g>
      <circle cx={CLOCK.x} cy={CLOCK.y + 6} r={CLOCK.r + 8} fill="#000" opacity={0.15} />
      <circle cx={CLOCK.x} cy={CLOCK.y} r={CLOCK.r + 8} fill={INK} />
      <circle cx={CLOCK.x} cy={CLOCK.y} r={CLOCK.r} fill="#fff6e3" />
      {Array.from({ length: 12 }, (_, i) => {
        const p = a(i * 30, CLOCK.r - 9);
        const q = a(i * 30, CLOCK.r - (i % 3 === 0 ? 22 : 15));
        return <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={INK} strokeWidth={i % 3 === 0 ? 6 : 3} strokeLinecap="round" />;
      })}
      <line x1={CLOCK.x} y1={CLOCK.y} x2={h.x} y2={h.y} stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <line x1={CLOCK.x} y1={CLOCK.y} x2={m.x} y2={m.y} stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <line x1={tail.x} y1={tail.y} x2={s.x} y2={s.y} stroke={CRIMSON} strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={CLOCK.x} cy={CLOCK.y} r={6} fill={CRIMSON} />
    </g>
  );
};

/** The sample's hallway: wall, doors, frames and lights at depth 0.85; the floor and a plant at depth 1. */
const HallBack: React.FC<{ cam: Camera; door?: number; second?: number; plain?: boolean; plant?: boolean }> = ({ cam, door = 0, second, plain, plant = true }) => (
  <>
    <Layer cam={cam} depth={WALL_DEPTH}>
      <rect x={-400} y={-300} width={3000} height={1500} fill="#f2dfc0" />
      <rect x={-400} y={560} width={3000} height={240} fill="#cf9d6e" />
      <rect x={-400} y={552} width={3000} height={12} fill="#8a5c3b" />
      {!plain && [-140, 300, 740, 1180, 1620, 2060].map((d, i) => (
        <g key={d}>
          {d === BOSS_DOOR && door > 0 && <rect x={d} y={330} width={190} height={470} fill="#2d2a33" />}
          <g transform={d === BOSS_DOOR ? `translate(${d} 0) scale(${1 - 0.8 * door} 1) translate(${-d} 0)` : undefined}>
            <rect x={d} y={330} width={190} height={470} rx={6} fill={i % 2 ? "#1d9a8f" : "#8a5c3b"} stroke={INK} strokeWidth={6} />
            <rect x={d + 35} y={375} width={120} height={120} rx={5} fill="#fff6e3" />
            <circle cx={d + 160} cy={600} r={10} fill={INK} />
          </g>
          {d !== BOSS_DOOR && (
            <>
              <rect x={d + 228} y={350} width={154} height={100} rx={5} fill="#fff6e3" stroke={INK} strokeWidth={6} />
              <path d={`M${d + 245} 430 l34 -46 l22 28 l18 -18 l28 36Z`} fill="#d8344f" opacity={0.8} />
            </>
          )}
        </g>
      ))}
      {plain && [-180, 820, 2000].map((d) => (
        <g key={d}>
          <rect x={d} y={330} width={230} height={150} rx={5} fill="#fff6e3" stroke={INK} strokeWidth={6} />
          <path d={`M${d + 20} 460 l50 -70 l34 40 l26 -26 l60 56Z`} fill="#7fc29b" opacity={0.85} />
        </g>
      ))}
      {second !== undefined && <Clock second={second} />}
      {[0, 440, 880, 1320, 1760, 2200].map((l) => (
        <rect key={l} x={l - 100} y={150} width={200} height={20} rx={8} fill="#fffbe6" />
      ))}
      <rect x={-400} y={100} width={3000} height={50} fill="#8a5c3b" />
    </Layer>
    <Layer cam={cam} depth={1}>
      <rect x={-500} y={FLOOR} width={3400} height={500} fill="#7d8c91" />
      <rect x={-500} y={FLOOR + 90} width={3400} height={10} fill="#677579" />
      {plant && <g transform="translate(1810 800)">
        <path d="M-46 0 L-34 -80 H34 L46 0Z" fill="#b55f3b" />
        <path d="M0 -80 Q-90 -160 -70 -230 Q-20 -190 0 -100 Q10 -210 60 -250 Q70 -160 0 -80Z" fill="#1d9a8f" />
      </g>}
    </Layer>
  </>
);

/** Lines 14-15: the boss steps out waving; "Vanish." You tiptoe under his arm; he blinks at the empty hallway. */
export const BossHallway: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, t, wc, cues, clips } = shot;
  const pause = firstDaysPauses(cues, clips).boss;
  const start = clips[14].from;
  const end = clips[16].from;

  const shotName = current(frame, [[start, "wide"], [start + 66, "you"], [cues.vanish - 34, "two"], [pause.to, "boss"]] as [number, string][]);

  // The boss: the door opens on "boss", he steps out and waves (world time, so he freezes).
  const out = ramp(t, wc(cues.boss), wc(cues.boss) + 20);
  const doorOpen = ramp(t, wc(cues.boss) - 4, wc(cues.boss) + 4);
  const bossX = mix(BOSS_X + 25, BOSS_X, out);
  const bossScale = mix(1.08, BOSS_SCALE, out);
  const bossY = mix(FLOOR + 6, BOSS_Y, out);
  const wave = Math.sin(t / 3.2);
  const bossPose: Pose = { ...walkPose(0.6), lean: 5, armF: [118 + 14 * wave, 30 + 10 * wave], armB: [-10, 15], legF: [12, -4], legB: [-12, -6] };
  const puzzled = frame - pause.to;
  const bossHead = body(bossX, bossY, bossPose, -1, bossScale).head;

  // You: walk in, stop; snap on "Vanish."; tiptoe under his arm; gone.
  const stopAt = cues.boss + 34;
  const walkK = linear(frame, start, stopAt);
  const go = linear(frame, pause.from + 6, pause.to - 2);
  let x = mix(640, 1000, walkK);
  let pose: Pose = walkK < 1 ? walkPose(x / 15) : STAND;
  let y = HERO_Y;
  if (frame >= pause.from - 6) {
    const snap = ramp(frame, pause.from - 6, pause.from);
    pose = lerpPose(STAND, SNAP, snap);
  }
  if (go > 0) {
    x = mix(1000, 1820, go);
    y = mix(HERO_Y, HERO_Y + 30, Math.sin(Math.PI * go));
    pose = tiptoePose(frame * 0.55);
  }
  const hero = body(x, y, pose, 1);
  const decide = cues.boss + 96; // "vanish?"

  const cams: Record<string, Camera> = {
    wide: drift({ x: 1090, y: 560, zoom: 1.15 }, frame, "bw"),
    you: drift(closeUp(hero.head.x + 30, hero.head.y, 2.6), frame, "byou"),
    two: camAt(frame, [[cues.vanish - 34, { x: 1150, y: 580, zoom: 1.3 }], [pause.to, { x: 1190, y: 585, zoom: 1.38 }]]),
    boss: drift(closeUp(bossHead.x - 90, bossHead.y, 2.4), frame, "bboss"),
  };
  const cam = cams[shotName];
  const snapHand = body(1000, HERO_Y, SNAP, 1).handF;
  const origin = toScreen(cams.two, snapHand.x, snapHand.y);

  const lookYou = shotName === "you"
    ? frame < cues.boss + 78 ? { x: 0.9, y: -0.1 } : frame < decide ? { x: -0.9, y: 0.1 } : { x: 0.7, y: 0 }
    : { x: 0.8, y: -0.1 };
  const back = (
    <>
      <HallBack cam={cam} door={doorOpen} />
      <Layer cam={cam} depth={1}>
        {frame >= cues.boss - 2 && (
          <Figure
            x={bossX} y={bossY} scale={bossScale} facing={-1}
            pose={bossPose}
            head="#7fa0c4" tie="#c96f2d"
            mouth={frame < pause.to ? "open" : puzzled < 10 ? "flat" : "o"}
            brows={frame < pause.to ? "raised" : "worry"}
            eyes={frame < pause.to ? 1.1 : 1.2}
            look={frame < pause.to ? { x: 0.8, y: 0.1 } : puzzled < 12 ? { x: 0.9, y: 0.2 } : { x: -0.9, y: 0 }}
            blink={frame >= pause.to && (puzzled % 10) < 3}
          />
        )}
        {frame >= pause.to + 8 && (
          <text x={bossHead.x + 70} y={bossHead.y - 70} fontFamily={FONT} fontWeight={800} fontSize={90} fill={CRIMSON} textAnchor="middle"
            transform={`rotate(12 ${bossHead.x + 70} ${bossHead.y - 70})`} opacity={ramp(frame, pause.to + 8, pause.to + 12)}>?</text>
        )}
      </Layer>
    </>
  );
  const actors = shotName === "boss" ? null : (
    <Figure
      {...HERO}
      x={x} y={y}
      pose={pose}
      mouth={go > 0 ? "smirk" : frame >= decide + 6 ? "smirk" : frame >= cues.boss + 40 ? "o" : "flat"}
      brows={go > 0 ? "flat" : frame >= decide ? "angry" : frame >= cues.boss + 30 ? "raised" : "none"}
      eyes={frame >= cues.boss + 30 && frame < decide ? 1.2 : 1}
      lids={frame >= decide && go === 0 ? 0.25 : 0}
      look={lookYou}
      blink={blinking(frame, 7)}
      flow={walkK < 1 || go > 0 ? 0.3 : 0}
      time={frame}
    />
  );

  // The bubble types out and stops dead at the snap.
  const typed = "Got a minu—".slice(0, Math.max(0, Math.floor((frame - (cues.boss + 22)) / 3)));
  const bubbleHead = toScreen(cam, bossHead.x, bossHead.y);
  const r = 46 * bossScale * cam.zoom;
  const showBubble = (shotName === "wide" || shotName === "two") && typed.length > 0 && frame < pause.to;

  return (
    <AbsoluteFill>
      <Stage cam={cam} radius={waveRadius(frame, pause)} origin={origin} back={back} actors={actors} />
      {showBubble && <Bubble at={cues.boss + 22} text={typed} x={bubbleHead.x - r - 360} y={bubbleHead.y - r - 130} tail="right" size={46} />}
      <Counter ticks={evenTicks(pause.from, pause.to)} until={pause.to} />
      <Sfx at={pause.from - 3} name="timestop" volume={0.42} until={end} />
      <Sfx at={pause.to - 13} name="resume" volume={0.3} until={end} />
    </AbsoluteFill>
  );
};

/** Ticks of the second hand: one a second, except where it sticks (chronostasis). Returns degrees. */
function secondHand(frame: number, base: number, sticks: { at: number; len: number }[]): number {
  let f = frame;
  for (const s of sticks) f -= Math.min(Math.max(frame - s.at, 0), s.len);
  const n = Math.floor((f - base) / 30);
  const ph = (f - base) - n * 30;
  const settle = ph < 2 ? ph / 2 : ph < 4 ? 1 + 0.12 * Math.sin(((ph - 2) / 2) * Math.PI) : 1;
  return (n - 1 + settle) * 6 + 90;
}

/** Remote control, in the hand: paper, dark, with a red button. */
const Remote: React.FC<{ rotate?: number }> = ({ rotate = 0 }) => (
  <g transform={`rotate(${rotate})`}>
    <rect x={-15} y={-48} width={30} height={92} rx={10} fill="#3b3e47" stroke={INK} strokeWidth={4} />
    <circle cx={0} cy={-32} r={7} fill={CRIMSON} />
    {[-12, 0, 12, 24].map((yy) => [-7, 7].map((xx) => <rect key={`${xx}${yy}`} x={xx - 4} y={yy - 3} width={8} height={6} rx={2} fill="#f3e9d7" opacity={0.85} />))}
  </g>
);

/** Lines 19-21: the clock that sticks (one big insert), your face with the word, then the remote. Perception, not
 *  pauses. Three compositions, all on a plain stretch of the hallway wall, so no door repeats behind you. */
export const ClockHallway: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, cues, clips } = shot;
  const X = 1600;
  const lClock = clips[19].from;
  const lReal = clips[20].from;
  const lRemote = clips[21].from;
  // A tick lands on "stick" and the hand holds for over two seconds, then jumps and ticks on.
  const sticks = [{ at: cues.stick + 4, len: 40 }];
  const base = cues.stick - 30 * Math.ceil((cues.stick - lClock) / 30) - 30;
  const second = secondHand(frame, base, sticks);
  const jump = cues.stick + 30 + 40;

  const faceAt = jump + 8;
  const walkEnd = cues.remote - 44;
  const handAt = cues.remote - 30;
  const shotName = current(frame, [[lClock, "clock"], [faceAt, "face"], [lRemote, "walk"], [handAt, "hand"]] as [number, string][]);

  // You: looking up at the clock, then at us as the word lands; then a stroll, a palm, the remote.
  const walkK = linear(frame, lRemote, walkEnd);
  const x = shotName === "walk" ? mix(X - 330, X, walkK) : X;
  const walking = shotName === "walk" && walkK < 1;
  const head = body(X, HERO_Y, STAND).head;
  const palm = ramp(frame, walkEnd, walkEnd + 12);
  const palmAt = { x: X + 92, y: head.y + 150 };
  const arm = blendArm(STAND.armF, armTo(X, HERO_Y, STAND, 1, 1, palmAt.x, palmAt.y), palm);
  const pose: Pose = walking ? walkPose(x / 15) : { ...STAND, armF: arm };
  const caught = frame >= cues.remote;
  const fallK = linear(frame, cues.remote - 14, cues.remote);
  const fallY = mix(palmAt.y - 330, palmAt.y - 30, fallK * fallK);

  const looks: [number, { x: number; y: number }][] = [
    [faceAt, { x: 1, y: -0.9 }], [lReal + 12, { x: 0.15, y: 0.05 }], [lReal + 40, { x: 1, y: -0.9 }], [lReal + 52, { x: 0.15, y: 0.05 }],
    [lRemote, { x: 0.8, y: 0 }], [walkEnd - 6, { x: 0.6, y: 0.9 }], [cues.remote + 20, { x: 0.1, y: 0.05 }],
  ];
  const look = looks.reduce((on, [at, l]) => (frame >= at ? l : on), looks[0][1]);
  const face = shotName === "face"
    ? frame < lReal + 12
      ? { mouth: "o" as const, brows: "raised" as const, lids: 0, eyes: 1.25 }
      : frame < cues.term
        ? { mouth: "smile" as const, brows: "none" as const, lids: 0, eyes: 1 }
        : { mouth: "smirk" as const, brows: "raised" as const, lids: 0.15, eyes: 1 }
    : caught
      ? { mouth: "smile" as const, brows: "raised" as const, lids: 0, eyes: 1.1 }
      : { mouth: "smirk" as const, brows: "none" as const, lids: 0, eyes: 1 };

  const clockCam: Camera = { x: CLOCK.x / WALL_DEPTH, y: CLOCK.y / WALL_DEPTH, zoom: 4.2 };
  const cams: Record<string, Camera> = {
    clock: drift(camAt(frame, [[lClock, clockCam], [cues.stick, { ...clockCam, zoom: 4.7 }], [faceAt, { ...clockCam, zoom: 5.3 }]]), frame, "clk", 3),
    face: drift(camAt(frame, [[faceAt, { x: head.x + 100, y: head.y - 40, zoom: 3.1 }], [lRemote, { x: head.x + 95, y: head.y - 36, zoom: 3.35 }]]), frame, "cf"),
    walk: camAt(frame, [[lRemote, { x: X - 250, y: 560, zoom: 1.45 }], [handAt, { x: X - 20, y: 570, zoom: 1.6 }]]),
    hand: camAt(frame, [[handAt, { x: palmAt.x - 60, y: 690, zoom: 2.5 }], [shot.to, { x: palmAt.x - 70, y: 680, zoom: 2.75 }]]),
  };
  const cam = cams[shotName];

  const back = <HallBack cam={cam} second={second} plain plant={shotName !== "clock"} />;
  const actors = shotName === "clock" ? null : (
    <>
      {shotName === "hand" && !caught && frame >= cues.remote - 14 && (
        <g transform={`translate(${palmAt.x} ${fallY}) rotate(${mix(-150, -70, fallK)})`}><Remote /></g>
      )}
      <Figure
        {...HERO}
        x={x} y={HERO_Y}
        pose={pose}
        {...face}
        look={look}
        blink={blinking(frame, 11)}
        flow={walking ? 0.25 : 0}
        time={frame}
        held={caught ? <g transform={`translate(0 ${-6 + 6 * Math.min(1, (frame - cues.remote) / 5)}) rotate(-70)`}><Remote /></g> : undefined}
      />
    </>
  );
  const clockScreen = onLayer(cam, CLOCK.x, CLOCK.y, WALL_DEPTH);
  return (
    <AbsoluteFill>
      <Stage cam={cam} radius={0} origin={clockScreen} back={back} actors={actors} />
      {shotName === "face" && <Tag at={cues.term} text="CHRONOSTASIS" x={1100} y={600} size={64} tilt={-2} bg={CRIMSON} color="#fff6e3" />}
      <Sfx at={cues.remote} name="pop" volume={0.45} until={shot.to} />
    </AbsoluteFill>
  );
};
