// The Piano's inside-town pictures: the montage of night one (dawn, the counter-sun, the bakery, the winter, the
// piano teacher), the walk past the slow room with its one window and slow wall clock (a plant for The Slow Room), and
// the teacher's room. Each returns a lit Stage for one camera.
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, seatedY, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { TownBack, townLights, TOWN, TOWN_FLOOR } from "../sets/InsideTown";
import { mix, noise, PASTELS } from "../shared";
import { aimArm, Person, type Body, type Face } from "./TellMeTomorrow.Kit";
import { BENCH, PIANO_AT, PianoRoom, ROOM_FLOOR } from "./Piano.Parts";

/** A camera target for a point on a set layer at `depth`: the camera centred there sees it centred. */
export const onLayer = (x: number, y: number, depth: number) => ({ x: (x - (1 - depth) * 960) / depth, y: (y - (1 - depth) * 540) / depth });

/** The sky counter's camera target (TownBack draws it at 960, 150 on its 0.45 layer). */
export const SKY = onLayer(960, 150, 0.45);
/** The slow room's window clock, on the 0.8 layer. */
export const ROOM_CLOCK = onLayer(TOWN.window.x + TOWN.window.w / 2, TOWN.window.y + 80, 0.8);

const STREET = TOWN_FLOOR - 50;

/** The inside town on a Stage, lit for `mood`, with `actors` on the street. */
export const TownStage: React.FC<{ frame: number; cam: Camera; mood: MoodName; room?: boolean; clockMinutes?: number; snow?: boolean; actors: React.ReactNode }> = ({
  frame, cam, mood, room, clockMinutes, snow, actors,
}) => (
  <LookContext.Provider value={setLook(townLights(room), mood, cam)}>
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<TownBack cam={cam} frame={frame} room={room} clockMinutes={clockMinutes} />}
      actors={
        <>
          {snow && <rect x={-1400} y={STREET - 20} width={4700} height={400} fill="#f4f6fb" />}
          {actors}
          {snow && Array.from({ length: 70 }, (_, i) => (
            <circle key={i} cx={cam.x - 1100 + noise(i) * 2200} cy={cam.y - 650 + ((noise(i + 40) * 1300 + frame * (2 + noise(i + 3) * 2)) % 1300)} r={5 + noise(i + 7) * 6} fill="#fff" opacity={0.9} />
          ))}
        </>
      } />
  </LookContext.Provider>
);

/** A few other sleepers walking the street. */
export const Walkers: React.FC<{ frame: number; n?: number; y?: number }> = ({ frame, n = 3, y = STREET }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const dirn = i % 2 ? 1 : -1;
      const x = ((frame * 2 * dirn + i * 700) % 2600 + 2600) % 2600 - 300;
      return <Figure key={i} x={x} y={y} scale={0.95} facing={dirn as 1 | -1} pose={walkPose(frame * 0.25 + i * 2)} head={PASTELS[(i + 3) % PASTELS.length]}
        mouth="smile" look={{ x: 0.6, y: 0 }} time={frame / 30} />;
    })}
  </>
);

/** The bakery: a counter of loaves on the street, you behind it in a cream apron, kneading; flour puffs. */
export const Bakery: React.FC<{ frame: number }> = ({ frame }) => {
  const knead = Math.sin(frame / 4);
  const you: Body = { x: 920, y: STREET, scale: 1.15, facing: 1, pose: { ...STAND, lean: 14, armF: [70 + knead * 12, 50], armB: [55 - knead * 12, 60] } };
  return (
    <>
      <rect x={640} y={430} width={600} height={60} fill="#d8344f" stroke={INK} strokeWidth={6} />
      {[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={640 + k * 100} y={430} width={50} height={60} fill={PAPER} opacity={0.9} />)}
      <Person who="you" b={you} face={{ brows: "raised", lids: 0, mouth: "smile", look: { x: 0.6, y: 0.8 } }} frame={frame} coat={PAPER} />
      <rect x={680} y={760} width={520} height={STREET - 760} fill="#a8774f" stroke={INK} strokeWidth={6} />
      <rect x={664} y={744} width={552} height={26} rx={6} fill="#c9935f" stroke={INK} strokeWidth={6} />
      {[0, 1, 2, 3].map((k) => <ellipse key={k} cx={740 + k * 60} cy={726} rx={34} ry={20} fill="#d9a35a" stroke={INK} strokeWidth={4} />)}
      <ellipse cx={1010 + knead * 6} cy={730} rx={60} ry={22} fill="#efe2c4" stroke={INK} strokeWidth={4} />
      {[0, 1, 2].map((k) => (
        <circle key={k} cx={1010 + noise(Math.floor(frame / 6) + k) * 80 - 40} cy={690 - ((frame + k * 7) % 20) * 3} r={10} fill="#fff" opacity={0.6} />
      ))}
    </>
  );
};

/** The piano teacher's room: the teacher standing at the keybed's end, you on the bench, hands on the keys. `nod` 0..1
 *  bobs the teacher's head; `face` is yours. */
export const TeacherRoom: React.FC<{ frame: number; cam: Camera; mood: MoodName; face: Face; teacher: Face; tap: boolean; nod?: number }> = ({
  frame, cam, mood, face, teacher, tap, nod = 0,
}) => {
  const s = 1.15;
  const play = Math.sin(frame / 3) * 4;
  const youBase: Body = { x: BENCH.x, y: seatedY(BENCH.top, s), scale: s, facing: -1, pose: SEATED };
  const keys = { x: PIANO_AT.x + 40 + play, y: PIANO_AT.y - 14 };
  const youPose: Pose = { ...SEATED, lean: 10, armF: aimArm({ ...youBase, pose: { ...SEATED, lean: 10 } }, keys), armB: aimArm({ ...youBase, pose: { ...SEATED, lean: 10 } }, { x: keys.x + 40, y: keys.y }) };
  const tb: Body = { x: 1020, y: ROOM_FLOOR - 40, scale: 1.15, facing: -1, pose: STAND };
  const tapPose: Pose = { ...STAND, lean: 10, tilt: Math.sin(nod * Math.PI * 4) * 10, armF: tap ? aimArm({ ...tb, pose: { ...STAND, lean: 10 } }, { x: PIANO_AT.x + 80, y: PIANO_AT.y - 20 + (frame % 10 < 4 ? 8 : 0) }) : [20, 60], armB: [10, 20] };
  return (
    <LookContext.Provider value={setLook([{ x: 1450, y: 350, r: 500, color: "#fff1cc", strength: 0.35, moods: ["morning", "day", "night", "lamp", "dusk", "frozen"] }], mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<PianoRoom frame={frame} />}
        actors={
          <>
            <Person who="piano" b={{ ...tb, pose: tapPose }} face={teacher} frame={frame} seed={4} />
            <Person who="you" b={{ ...youBase, pose: youPose }} face={face} frame={frame} />
          </>
        } />
    </LookContext.Provider>
  );
};

/** You walking the street past the slow room, glancing in at `glance` for a beat, then on. */
export function walkPast(frame: number, from: number, glance: number, until: number) {
  const before = Math.min(1, Math.max(0, (frame - from) / Math.max(1, glance - from)));
  const after = Math.min(1, Math.max(0, (frame - glance - 20) / Math.max(1, until - glance - 20)));
  const x = frame < glance ? mix(300, 1060, before) : frame < glance + 20 ? 1060 : mix(1060, 1900, after);
  const stopped = frame >= glance && frame < glance + 20;
  const look = stopped ? { x: 0.9, y: -0.5 } : { x: 0.7, y: 0 };
  return { x, stopped, look };
}
