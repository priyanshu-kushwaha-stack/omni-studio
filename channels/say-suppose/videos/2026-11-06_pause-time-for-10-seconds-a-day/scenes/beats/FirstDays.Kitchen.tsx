import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { lerpPose, SNAP, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Layer, Stage, toScreen, waveRadius, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { INK, MUSTARD } from "@whatif/kit/theme";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { Tag } from "@whatif/kit/ui/Tag";
import { Counter, evenTicks } from "../parts";
import { blinking, camAt, current, HERO, linear, mix, ramp, type Shot } from "../shared";
import { armTo, blendArm, body, CROUCH, firstDaysPauses, Sfx } from "./FirstDays.common";

/** Lines 10-13: the phone. Kitchen (the sample's, as the first room of a house drawn in section), the side-on
 *  cutaway with the tape, and the catch. */

const FLOOR = 880;
const FEET = 905;
const HERO_X = 1050;
/** The phone leaves your hand here and hangs a hand's width above the tiles. */
const P0 = { x: 1112, y: 700 };
const P1 = { x: 1190, y: 872 };
/** The stroll: from the kitchen to the bedroom, about 12 m (175 world units a metre). */
const WALK_TO = 3150;
const TAPE_Y = 948;
/** Rooms, left to right, between cut walls. */
const WALLS = [-260, 1800, 2760, 3700];
const WALL_W = 60;

export const Phone: React.FC<{ rotate?: number; squash?: number; glow?: number }> = ({ rotate = 0, squash = 1, glow = 1 }) => (
  <g transform={`rotate(${rotate}) scale(1 ${squash})`}>
    <rect x={-17} y={-30} width={34} height={60} rx={7} fill={INK} />
    <rect x={-13} y={-25} width={26} height={47} rx={3} fill={glow > 0.5 ? "#8fdcec" : "#2f3a4a"} />
    <rect x={-9} y={-20} width={18} height={6} rx={2} fill="#fff" opacity={0.7 * glow} />
    <rect x={-9} y={-10} width={12} height={4} rx={2} fill="#fff" opacity={0.5 * glow} />
    <path d="M-11 -23 L3 -23 L-11 -4Z" fill="#fff" opacity={0.35} />
    <circle cx={0} cy={26} r={2.2} fill="#6b6f78" />
  </g>
);

const Sky: React.FC<{ cam: Camera }> = ({ cam }) => (
  <Layer cam={cam} depth={0.45}>
    <rect x={-4000} y={-3000} width={12000} height={6000} fill="#a8dcea" />
    <circle cx={2600} cy={-240} r={90} fill="#fff1b8" />
    <path d="M-4000 560 Q400 400 1000 520 T2600 500 T6000 520 V3000 H-4000Z" fill="#7fc29b" />
  </Layer>
);

/** The house: kitchen, living room, bedroom, cut open with its front wall off. World units. */
const House: React.FC<{ cam: Camera }> = ({ cam }) => {
  const [w0, w1, w2, w3] = WALLS;
  return (
    <Layer cam={cam} depth={1}>
      {/* roof and the ceiling slab */}
      <path d={`M${w0 - 140} 40 L${(w0 + w3) / 2 + 30} -430 L${w3 + WALL_W + 140} 40Z`} fill="#9c3b4a" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
      <path d={`M${w0 + 40} 10 L${(w0 + w3) / 2 + 30} -380 L${w3 + WALL_W - 40} 10Z`} fill="#6b2a35" />
      <rect x={1500} y={-330} width={120} height={200} fill="#8a5c3b" stroke={INK} strokeWidth={8} />
      {/* kitchen back wall with its window (the sample's) */}
      <path d={`M${w0 + WALL_W} 90 H${w1} V${FLOOR} H${w0 + WALL_W}Z M180 180 H520 V520 H180Z`} fillRule="evenodd" fill="#d6e8d8" />
      <line x1={350} y1={180} x2={350} y2={520} stroke={INK} strokeWidth={9} />
      <line x1={180} y1={350} x2={520} y2={350} stroke={INK} strokeWidth={9} />
      <rect x={168} y={514} width={366} height={18} rx={4} fill={INK} />
      <rect x={650} y={150} width={540} height={210} rx={10} fill="#1d9a8f" />
      <line x1={920} y1={150} x2={920} y2={360} stroke="#147a70" strokeWidth={7} />
      <circle cx={898} cy={330} r={8} fill={INK} /><circle cx={942} cy={330} r={8} fill={INK} />
      <rect x={1360} y={230} width={320} height={650} rx={22} fill="#f3e9d7" stroke={INK} strokeWidth={7} />
      <line x1={1360} y1={445} x2={1680} y2={445} stroke={INK} strokeWidth={7} />
      <rect x={1395} y={345} width={18} height={70} rx={8} fill={INK} /><rect x={1395} y={475} width={18} height={100} rx={8} fill={INK} />
      <rect x={420} y={655} width={750} height={225} fill="#d8344f" />
      <line x1={670} y1={655} x2={670} y2={880} stroke="#a82238" strokeWidth={7} />
      <line x1={920} y1={655} x2={920} y2={880} stroke="#a82238" strokeWidth={7} />
      <rect x={400} y={636} width={790} height={26} rx={7} fill="#f3e9d7" stroke={INK} strokeWidth={5} />
      <rect x={500} y={560} width={120} height={76} rx={14} fill={INK} />
      <rect x={528} y={544} width={18} height={18} rx={3} fill="#f3e9d7" /><rect x={570} y={544} width={18} height={18} rx={3} fill="#f3e9d7" />
      {/* living room */}
      <rect x={w1 + WALL_W} y={90} width={w2 - w1 - WALL_W} height={FLOOR - 90} fill="#f2dfc0" />
      <rect x={w1 + WALL_W} y={560} width={w2 - w1 - WALL_W} height={FLOOR - 560} fill="#e2c49c" />
      <rect x={2080} y={260} width={260} height={190} rx={6} fill="#fff6e3" stroke={INK} strokeWidth={8} />
      <path d="M2100 430 l60 -80 l40 50 l30 -30 l60 60Z" fill="#7fc29b" />
      <circle cx={2290} cy={310} r={22} fill="#f2b632" />
      <rect x={2000} y={700} width={420} height={110} rx={28} fill="#3d6f73" />
      <rect x={1980} y={760} width={460} height={100} rx={22} fill="#4b8186" />
      <rect x={2000} y={850} width={22} height={30} fill="#3a2a20" /><rect x={2400} y={850} width={22} height={30} fill="#3a2a20" />
      <line x1={2620} y1={420} x2={2620} y2={876} stroke={INK} strokeWidth={8} />
      <path d="M2560 470 L2585 400 H2655 L2680 470Z" fill="#ffd27a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {/* bedroom */}
      <path d={`M${w2 + WALL_W} 90 H${w3} V${FLOOR} H${w2 + WALL_W}Z M3170 220 H3420 V480 H3170Z`} fillRule="evenodd" fill="#cfe0f0" />
      <rect x={3160} y={210} width={270} height={20} rx={4} fill={INK} />
      <path d="M3170 230 H3215 Q3200 360 3190 480 H3170Z M3420 230 H3375 Q3390 360 3400 480 H3420Z" fill="#d8344f" opacity={0.85} />
      <rect x={2860} y={330} width={190} height={548} rx={10} fill="#8a5c3b" stroke={INK} strokeWidth={7} />
      <line x1={2955} y1={330} x2={2955} y2={878} stroke={INK} strokeWidth={6} />
      <rect x={3060} y={640} width={36} height={240} rx={10} fill="#6f4a2f" />
      <rect x={3090} y={740} width={520} height={90} rx={14} fill="#fff6e3" />
      <rect x={3300} y={700} width={310} height={60} rx={18} fill="#1d7f9a" />
      <ellipse cx={3160} cy={722} rx={70} ry={28} fill="#fffaf0" />
      <rect x={3590} y={700} width={30} height={180} rx={10} fill="#6f4a2f" />
      {/* floor of every room, in perspective, then the cut floor slab and the ground */}
      <rect x={w0} y={FLOOR} width={w3 + WALL_W - w0} height={130} fill="#c98f5e" />
      {Array.from({ length: 16 }, (_, i) => <line key={i} x1={-200 + i * 125} y1={FLOOR} x2={-200 + i * 125 - 30} y2={FLOOR + 130} stroke="#b37a4c" strokeWidth={4} />)}
      <line x1={w0 + WALL_W} y1={FLOOR + 50} x2={w1} y2={FLOOR + 50} stroke="#b37a4c" strokeWidth={4} />
      <rect x={w1} y={FLOOR} width={w3 - w1} height={130} fill="#a8774f" />
      <rect x={w2 + WALL_W} y={FLOOR} width={w3 - w2 - WALL_W} height={130} fill="#9c8bb0" opacity={0.5} />
      <rect x={-6000} y={FLOOR + 130} width={14000} height={1500} fill="#7a5236" />
      <rect x={-6000} y={FLOOR + 118} width={14000} height={22} fill="#5f9c58" />
      {[[-900, 1200, 40], [600, 1300, 28], [1700, 1420, 36], [2900, 1250, 30], [4300, 1350, 44], [5200, 1230, 26]].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.7} fill="#5e3e28" />
      ))}
      <rect x={w0 - 20} y={FLOOR + 130} width={w3 + WALL_W - w0 + 40} height={60} fill={INK} />
      {/* the cut walls and the ceiling slab, hatched like a drawing's section */}
      <rect x={w0 - 20} y={30} width={w3 + WALL_W - w0 + 40} height={60} fill={INK} />
      {WALLS.map((x, i) => {
        const inner = i > 0 && i < WALLS.length - 1;
        return (
          <g key={x}>
            <rect x={x} y={90} width={WALL_W} height={inner ? 430 - 90 : FLOOR - 90} fill={INK} />
            {inner && <rect x={x - 6} y={510} width={WALL_W + 12} height={16} fill="#5a4636" />}
          </g>
        );
      })}
    </Layer>
  );
};

export const Kitchen: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, t, wc, cues, clips } = shot;
  const pause = firstDaysPauses(cues, clips).phone;
  const lPhone = clips[10].from;
  const lStroll = clips[12].from;
  const lCrack = clips[13].from;
  const catchAt = lCrack - 20;

  // The phone: a slow-motion tumble from your hand (world time), frozen at the snap, plucked at line 14.
  const fallLen = wc(cues.snap2) - wc(cues.slip);
  const k = Math.min(1, Math.max(0, (t - wc(cues.slip)) / fallLen));
  const fallen = { x: mix(P0.x, P1.x, k), y: mix(P0.y, P1.y, Math.pow(k, 1.35)) };
  const grab = lCrack + 8;
  const grabbed = frame >= grab;

  // Shots.
  const shotName = current(frame, [
    [shot.from, "hands"], [lPhone + 88, "tumble"], [lPhone + 142, "face"], [clips[11].from, "snap"], [lStroll, "pull"], [catchAt, "catch"],
  ] as [number, string][]);

  // You. Before the snap: slow-motion fumble. Snap on "today". Stroll right with the tape, turn back. Then the catch.
  const walkStart = cues.snap2 + 45;
  const walkK = linear(frame, walkStart, cues.tape);
  const back = Math.max(0, frame - (cues.tape + 25)) * 4;
  let x = mix(HERO_X, WALK_TO, walkK) - back;
  let facing: 1 | -1 = frame >= cues.tape + 25 ? -1 : 1;
  let y = FEET;
  let pose: Pose = STAND;
  let held: React.ReactNode;
  let mouth: "flat" | "o" | "smirk" | "wobble" | "smile" = "flat";
  let brows: "none" | "raised" | "worry" | "angry" | "flat" = "none";
  let eyes = 1;
  let look = { x: 0.5, y: 0.6 };
  if (frame < cues.slip) {
    pose = { ...STAND, armF: armTo(x, y, STAND, 1, 1, P0.x, P0.y) };
    held = <Phone rotate={-14} />;
  } else if (frame < clips[11].from) {
    const slow = ramp(frame, cues.slip, cues.slip + 120);
    const base = lerpPose(STAND, { ...STAND, lean: 9, drop: 8, armB: [-30, 30] }, slow);
    const hand = armTo(x, y, base, 1, 1, P0.x, P0.y);
    const toward = armTo(x, y, base, 1, 1, P0.x + 34, P0.y + 30);
    pose = { ...base, armF: blendArm(hand, toward, ramp(frame, cues.slip, cues.slip + 40)) };
    mouth = frame > cues.slip + 20 ? "o" : "flat";
    brows = frame > cues.slip + 40 ? "worry" : "raised";
    eyes = mix(1, 1.3, ramp(frame, cues.slip, cues.slip + 30));
    look = { x: 0.6, y: 0.9 };
    if (frame > lPhone + 142) { mouth = "wobble"; brows = "worry"; }
  } else if (frame < walkStart) {
    const snap = ramp(frame, cues.snap2 - 6, cues.snap2);
    const relax = ramp(frame, cues.snap2 + 14, cues.snap2 + 30);
    pose = lerpPose(lerpPose(STAND, SNAP, snap), { ...STAND, lean: 6 }, relax);
    brows = frame < cues.snap2 + 14 ? "angry" : "raised";
    mouth = frame < cues.snap2 + 18 ? "flat" : "smirk";
    look = frame < cues.snap2 + 16 ? { x: 0.7, y: 0.5 } : { x: 0.7, y: 0.9 };
  } else if (frame < catchAt) {
    const walking = walkK > 0 && walkK < 1 || (frame > cues.tape + 25);
    const phase = (mix(HERO_X, WALK_TO, walkK) + back) / 24;
    pose = walking ? walkPose(phase) : STAND;
    mouth = "smirk";
    look = frame > cues.tape - 4 && frame < cues.tape + 25 ? { x: -0.4, y: 0.4 } : { x: 0.6, y: 0 };
    if (frame >= cues.tape && frame < cues.tape + 25) { brows = "raised"; mouth = "smile"; }
  } else {
    // Line 14: crouched beside the phone, facing left; pluck, stand, check the screen, smirk.
    x = 1286; facing = -1;
    const up = ramp(frame, grab + 2, grab + 22);
    const base = lerpPose(CROUCH, { ...STAND, lean: 4, tilt: 8 }, up);
    const toPhone = armTo(x, y, base, -1, 1, P1.x, P1.y);
    const rest: [number, number] = [30, 40];
    const head = body(x, y, base, -1).head;
    const check = armTo(x, y, base, -1, 1, head.x - 78, head.y + 58);
    let arm = blendArm(rest, toPhone, ramp(frame, catchAt + 4, grab));
    arm = blendArm(arm, check, up);
    pose = { ...base, armF: arm };
    look = up > 0.5 ? { x: 0.8, y: 0.5 } : { x: 0.9, y: 0.7 };
    eyes = frame > cues.crack + 4 && frame < cues.crack + 20 ? 1.15 : 1;
    brows = frame > cues.crack + 14 ? "flat" : "raised";
    mouth = frame > cues.crack + 14 ? "smirk" : "flat";
    if (grabbed) held = <Phone rotate={mix(-100, 18, up)} squash={mix(0.6, 1, up)} />;
  }

  const hero = body(x, y, pose, facing);
  const camKitchen: Camera = camAt(frame, [[shot.from, { x: 1080, y: 640, zoom: 1.75 }], [lPhone + 88, { x: 1095, y: 655, zoom: 1.95 }]]);
  const cams: Record<string, Camera> = {
    hands: camKitchen,
    tumble: camAt(frame, [[lPhone + 88, { x: 1150, y: 790, zoom: 2.5 }], [lPhone + 142, { x: 1160, y: 800, zoom: 2.75 }]]),
    face: drift(closeUp(hero.head.x + 20, hero.head.y, 2.7), frame, "face2"),
    snap: camAt(frame, [[clips[11].from, { x: 1110, y: 690, zoom: 1.55 }], [lStroll, { x: 1130, y: 700, zoom: 1.65 }]]),
    pull: camAt(frame, [[lStroll + 95, { x: 1750, y: 390, zoom: 0.47 }], [catchAt, { x: 1790, y: 400, zoom: 0.5 }]]),
    catch: camAt(frame, [[catchAt, { x: 1222, y: 790, zoom: 2.5 }], [grab, { x: 1222, y: 780, zoom: 2.55 }], [grab + 24, { x: 1240, y: 660, zoom: 2.45 }], [shot.to, { x: 1236, y: 650, zoom: 2.6 }]]),
  };
  let cam = cams[shotName];
  if (shotName === "pull" && frame < lStroll + 95) {
    // Pull out through the walls: eased, with the view's width (1/zoom) growing evenly.
    const k2 = ramp(frame, lStroll, lStroll + 95);
    cam = { x: mix(1130, 1750, k2), y: mix(700, 390, k2), zoom: 1 / mix(1 / 1.65, 1 / 0.47, k2) };
  }

  const snapCam = cams.snap;
  const snapHand = body(HERO_X, FEET, SNAP, 1).handF;
  const origin = frame < lStroll + 100 ? toScreen(snapCam, snapHand.x, snapHand.y) : toScreen(cam, P1.x, P1.y);

  const tapeEnd = mix(HERO_X, WALK_TO, walkK);
  const back_ = (
    <>
      <Sky cam={cam} />
      <House cam={cam} />
      {!grabbed && (
        <g transform={`translate(${fallen.x} ${fallen.y})`}>
          {frame >= cues.slip && <Phone rotate={mix(-14, -100, k)} squash={mix(1, 0.6, k)} />}
        </g>
      )}
    </>
  );
  const tapeTicks = Array.from({ length: 13 }, (_, i) => HERO_X + i * 175).filter((tx) => tx <= tapeEnd + 1);
  const actors = (
    <>
      {walkK > 0 && frame < catchAt && (
        <g>
          <DrawLine d={`M${HERO_X} ${TAPE_Y} H${WALK_TO}`} from={walkStart} to={cues.tape} color={INK} width={42} />
          <DrawLine d={`M${HERO_X} ${TAPE_Y} H${WALK_TO}`} from={walkStart} to={cues.tape} color={MUSTARD} width={30} />
          {tapeTicks.map((tx, i) => <line key={tx} x1={tx} y1={TAPE_Y - 15} x2={tx} y2={TAPE_Y + (i % 5 === 0 ? 12 : 0)} stroke={INK} strokeWidth={6} />)}
          <rect x={HERO_X - 26} y={TAPE_Y - 30} width={44} height={60} rx={10} fill="#3b3e47" stroke={INK} strokeWidth={5} />
        </g>
      )}
      <Figure
        {...HERO}
        x={x} y={y} facing={facing}
        pose={pose}
        held={held}
        mouth={mouth}
        brows={brows}
        eyes={eyes}
        look={look}
        blink={blinking(frame, 3) && frame > cues.slip + 30}
        flow={pose === STAND ? 0 : 0.2}
        time={frame}
      />
    </>
  );

  const tapeScreen = toScreen(cam, WALK_TO, TAPE_Y);
  return (
    <AbsoluteFill>
      <Stage cam={cam} radius={waveRadius(frame, pause)} origin={origin} back={back_} actors={actors} />
      {shotName === "hands" && <Tag at={lPhone + 51} text="0.45 S" x={1250} y={190} size={72} tilt={-3} />}
      {shotName === "pull" && <Tag at={cues.tape} text="10–14 M" x={Math.min(1500, tapeScreen.x - 120)} y={tapeScreen.y + 34} size={60} tilt={2} bg="#d8344f" color="#fff6e3" />}
      <Counter ticks={evenTicks(pause.from, pause.to)} until={pause.to} />
      <Sfx at={cues.slip + 2} name="whoosh" volume={0.25} />
      <Sfx at={cues.snap2 - 3} name="timestop" volume={0.42} />
      <Sfx at={pause.to - 13} name="resume" volume={0.3} />
    </AbsoluteFill>
  );
};
