// Home: the door with the empty hook, the Sunday lunches on the floor, and the line that crosses the house to the tulsi.
import { SIT, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { INK, PAPER } from "@whatif/kit/theme";
import type { Beat, Shot } from "../shared";
import { Cousin, DistTag, Dots, Extra, Grandpa, Mango, Mother, You } from "../parts";
import { ease, local, push, Room, Set, Window } from "./kit";

const HOOK = { x: 1180, y: 430 };

/** The hall: the front door, the brass hook with nothing on it, a shoe rack. */
const Hall: React.FC = () => (
  <g>
    <Room wall="#d9b98f" floor="#8a6a4f" horizon={820} />
    <rect x={1380} y={180} width={360} height={640} fill="#6b4a33" stroke="#3b2a1f" strokeWidth={12} />
    <circle cx={1700} cy={520} r={14} fill="#c9a33a" />
    <rect x={1395} y={195} width={330} height={610} fill="none" stroke="#835c40" strokeWidth={6} />
    <path d={`M${HOOK.x} ${HOOK.y} q0 30 18 34`} fill="none" stroke="#c9a33a" strokeWidth={10} strokeLinecap="round" />
    <circle cx={HOOK.x} cy={HOOK.y} r={10} fill="#a8862a" />
    <rect x={160} y={700} width={360} height={120} fill="#5a3f2a" />
    {[0, 1, 2].map((i) => <rect key={i} x={190 + i * 110} y={680} width={80} height={24} rx={10} fill={["#3a2a2a", "#7a5a8c", "#2c4d66"][i]} />)}
  </g>
);

/** 4. Home at dusk: grandfather looking at the empty hook; you come in out of the rain. */
const Door: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const x = 1720 - ease(f, 0, 50) * 360;
  return (
    <Set cam={push(f, d, { x: 1100, y: 560, zoom: 1.1 }, { x: 1080, y: 520, zoom: 1.25 })} back={<Hall />}
      actors={
        <>
          <Grandpa f={f} x={980} y={960} s={2.5} pose={{ ...STAND, tilt: -10 }} mouth="flat" brows="sad" lids={0.3} look={{ x: 0.9, y: -0.6 }} />
          <You f={f} x={x} y={1000} s={2.5} facing={-1} pose={f < 50 ? walkPose(f / 6) : STAND} mouth="flat" look={{ x: 0.6, y: 0 }} />
        </>
      } />
  );
};

/** 5. Close on the hook; he taps it once and turns to you. "Some things stay lost." */
const HookClose: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const tap = f > 12 && f < 24;
  const pose: Pose = tap ? { ...STAND, armF: [150, 20] } : { ...STAND, armF: [20, 30] };
  return (
    <Set cam={push(f, d, { x: 1120, y: 460, zoom: 2.2 }, { x: 1060, y: 520, zoom: 1.7 })} back={<Hall />}
      actors={<Grandpa f={f} x={980} y={960} s={2.5} pose={pose} facing={1} mouth="smile" lids={0.35} look={{ x: f > 30 ? 0.9 : 0.6, y: f > 30 ? 0 : -0.6 }} />} />
  );
};

/** The lunch room: everyone on the floor round steel plates, a ceiling fan, the shelf with the folded photograph. */
const Lunch: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <Room wall="#e7c9a0" floor="#b38b62" horizon={760} />
    <Window x={140} y={170} w={320} h={300} sky="#f6e3b5" />
    {/* the shelf and the folded photograph: two boys in a mango tree, one folded to face the wall */}
    <rect x={1360} y={360} width={420} height={18} fill="#6b4a33" />
    <g transform="translate(1450 250)">
      <rect width={130} height={110} fill={PAPER} stroke={INK} strokeWidth={5} />
      <rect x={10} y={10} width={110} height={90} fill="#8fbf7a" />
      <circle cx={45} cy={50} r={16} fill="#e8c9a0" stroke={INK} strokeWidth={3} />
      <path d="M70 10 L120 10 L120 100 L70 100 Z" fill="#cfc3a8" stroke={INK} strokeWidth={4} />
    </g>
    {/* the fan */}
    <g transform="translate(960 70)">
      <rect x={-6} y={-70} width={12} height={70} fill="#555" />
      {[0, 1, 2].map((i) => <ellipse key={i} rx={170} ry={14} fill="#7a7a7a" transform={`rotate(${f * 7 + i * 120}) scale(1 0.35)`} />)}
      <circle r={20} fill="#444" />
    </g>
    {/* the mat and the plates */}
    <rect x={260} y={820} width={1400} height={120} rx={20} fill="#c94f4f" opacity={0.85} />
    {[460, 760, 1060, 1360].map((x) => <ellipse key={x} cx={x} cy={880} rx={90} ry={22} fill="#d9dde3" stroke={INK} strokeWidth={4} />)}
  </g>
);

const STORY: Pose = { ...SIT, armF: [150, 30], armB: [20, 20] };

/** 6. Sunday lunch: grandfather mid-story, hand up; you and your cousin mouthing it with him. */
const SundayLunch: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const talk = Math.floor(f / 7) % 2 === 0;
  return (
    <Set cam={push(f, d, { x: 960, y: 560, zoom: 1.0 }, { x: 900, y: 600, zoom: 1.2 })} back={<Lunch f={f} />}
      actors={
        <>
          <Grandpa f={f} x={760} y={860} s={2.1} pose={{ ...STORY, armF: [150 + 20 * Math.sin(f / 10), 30] }} mouth={talk ? "open" : "smile"} brows="raised" look={{ x: 0.7, y: -0.2 }} />
          <Mother f={f} x={460} y={860} s={2.0} pose={SIT} mouth="smile" look={{ x: 0.8, y: 0 }} seed={2} />
          <You f={f} x={1080} y={860} s={2.1} pose={SIT} facing={-1} mouth={talk ? "o" : "smirk"} look={{ x: 0.3, y: 0 }} seed={3} />
          <Cousin f={f} x={1360} y={860} s={2.0} pose={SIT} facing={-1} mouth={talk ? "o" : "smirk"} look={{ x: 0.7, y: 0 }} seed={4} />
        </>
      } />
  );
};

/** 7. He slides you the best mango slice without looking; your eyes go to the folded photograph. */
const MangoSlice: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const slide = ease(f, 6, 30);
  return (
    <Set cam={push(f, d, { x: 980, y: 700, zoom: 1.6 }, { x: 1300, y: 420, zoom: 1.9 })} back={<Lunch f={f} />}
      actors={
        <>
          <Grandpa f={f} x={760} y={860} s={2.1} pose={{ ...SIT, armF: [80, 20] }} mouth="open" brows="raised" look={{ x: -0.5, y: -0.2 }} />
          <Mango x={860 + slide * 200} y={876} r={20} rot={20} />
          <You f={f} x={1080} y={860} s={2.1} pose={SIT} facing={-1} mouth="smile" look={{ x: f > 40 ? -0.9 : 0.4, y: f > 40 ? -0.8 : 0.4 }} seed={3} />
        </>
      } />
  );
};

/** 24. Sunday lunch again: your cousin waves a spoon: "Find the deed. We're rich." */
const LunchAgain: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  return (
    <Set cam={push(f, d, { x: 1200, y: 600, zoom: 1.5 }, { x: 1100, y: 600, zoom: 1.3 })} back={<Lunch f={f} />}
      actors={
        <>
          <Grandpa f={f} x={760} y={860} s={2.1} pose={SIT} mouth="flat" look={{ x: 0.7, y: 0 }} />
          <You f={f} x={1080} y={860} s={2.1} pose={SIT} facing={-1} mouth="smile" look={{ x: -0.6, y: 0 }} seed={3} />
          <Cousin f={f} x={1360} y={860} s={2.0} pose={{ ...SIT, armF: [130 + 15 * Math.sin(f / 4), 30] }} facing={-1} mouth="open" brows="raised" look={{ x: 0.8, y: 0 }} seed={4} />
        </>
      } />
  );
};

/** 25. Everyone laughs; your grandfather doesn't. He looks at his plate. */
const NoLaugh: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const bob = Math.sin(f / 3) * 4;
  return (
    <Set cam={push(f, d, { x: 960, y: 600, zoom: 1.1 }, { x: 780, y: 560, zoom: 2.0 })} back={<Lunch f={f} />}
      actors={
        <>
          <Mother f={f} x={460} y={860 + bob} s={2.0} pose={SIT} mouth="open" lids={0.4} look={{ x: 0.8, y: 0 }} seed={2} />
          <Grandpa f={f} x={760} y={860} s={2.1} pose={{ ...SIT, tilt: 14 }} mouth="flat" brows="sad" lids={0.55} look={{ x: 0.3, y: 0.9 }} />
          <You f={f} x={1080} y={860} s={2.1} pose={SIT} facing={-1} mouth={f > 40 ? "flat" : "open"} brows={f > 40 ? "worry" : "none"} look={{ x: 0.8, y: 0 }} seed={3} />
          <Cousin f={f} x={1360} y={860 + bob} s={2.0} pose={SIT} facing={-1} mouth="open" lids={0.4} look={{ x: 0.8, y: 0 }} seed={4} />
          <Extra i={5} f={f} x={260} y={860 + bob} s={1.9} pose={SIT} mouth="open" />
        </>
      } />
  );
};

/** 26. You whisper. The line turns from the front door, crosses the living room, out the back, to the tulsi. A
 *  top-down plan of the house, drawn as a paper map, so the route reads in one picture. */
const ToTulsi: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d, at } = local(shot);
  const start = 10;
  const path = [{ x: 820, y: 640 }, { x: 640, y: 600 }, { x: 600, y: 420 }, { x: 900, y: 360 }, { x: 1180, y: 380 }, { x: 1420, y: 330 }, { x: 1560, y: 300 }];
  const back = (
    <g>
      <rect width={1920} height={1080} fill="#3b2a1f" />
      {/* the house from above: the front door at the bottom left, the living room, the back door, the courtyard */}
      <rect x={300} y={240} width={820} height={560} fill="#d9b98f" stroke={INK} strokeWidth={10} />
      <rect x={1120} y={180} width={560} height={420} fill="#9c8a6a" stroke={INK} strokeWidth={10} />
      <rect x={360} y={770} width={140} height={30} fill="#6b4a33" />
      <rect x={1100} y={330} width={30} height={120} fill="#6b4a33" />
      <rect x={420} y={420} width={260} height={130} rx={14} fill="#a86a4a" />
      {/* the tulsi pot from above */}
      <circle cx={1560} cy={300} r={58} fill="#b5653a" stroke={INK} strokeWidth={6} />
      {[0, 1, 2, 3, 4, 5].map((i) => <ellipse key={i} cx={1560 + Math.cos(i) * 26} cy={300 + Math.sin(i) * 26} rx={22} ry={12} fill="#4f8a3a" transform={`rotate(${i * 60} ${1560 + Math.cos(i) * 26} ${300 + Math.sin(i) * 26})`} />)}
    </g>
  );
  return (
    <Set cam={push(f, d, { x: 900, y: 520, zoom: 1.05 }, { x: 1300, y: 380, zoom: 1.55 })} back={back}
      actors={
        <>
          <Dots frame={f} at={start} dur={Math.max(40, at(51) - start)} path={path} size={13} shrink={0.2} gap={40} />
          <g transform="translate(820 660)"><circle r={34} fill="#f2b632" stroke={INK} strokeWidth={5} /><circle cx={0} cy={-26} r={12} fill="#23252b" /></g>
          <DistTag frame={f} at={at(51)} x={1600} y={200} text="6.1 m" />
        </>
      } />
  );
};

export const homeScenes: Beat[] = [
  { id: "door", after: 9, Component: Door },
  { id: "hook", after: 10, Component: HookClose },
  { id: "lunch", after: 11, Component: SundayLunch },
  { id: "slice", after: 13, Component: MangoSlice },
];
export const lunchAgainScenes: Beat[] = [
  { id: "lunch-again", after: 44, Component: LunchAgain },
  { id: "no-laugh", after: 46, Component: NoLaugh },
  { id: "to-tulsi", after: 48, Component: ToTulsi },
];
