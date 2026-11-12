// Who's Red, lines 14-19: the school corridor in the morning. You walk in with the letter; the rival, sage head, one
// foot up at the shoe lockers, swapping shoes. "Still here?" You hold up the letter: over your shoulder the card snaps
// open over his head and flicks to -6. Your brows go up; he barely looks up. "Nice. Move."
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { lerpPose, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { schoolCorridor } from "@whatif/kit/sets";
import { closeUp, drift, ForegroundHead } from "@whatif/kit/stage/shots";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import { headAt, Letter, Meter } from "../parts";
import { blinking, camAt, current, HERO, linear, mix, ramp, TAEHO } from "../shared";
import { SetShot, Shoe, ShoeLockers } from "./WhosCrimson.Common";
import type { CrimsonTimes } from "./WhosCrimson.Times";

const FLOOR = 960;
const S = 1.15;
/** Tae-ho at the lockers, and where you stop in front of him. */
const TX = 1440;
const YX = 1010;
const WALK_FROM = 240;

/** One foot up on the other knee, a shoe in the front hand, bent over it. He faces you (-1). */
const FOOT_UP: Pose = { ...STAND, lean: 14, legF: [74, -84], armF: [34, 34], armB: [-12, 24] };
const FOOT_DOWN: Pose = { ...STAND, lean: 4, armF: [20, 30] };
/** The letter held up toward him, front arm forward and up. */
const LETTER_UP: [number, number] = [128, 14];

function you(frame: number, k: CrimsonTimes) {
  const p = linear(frame, k.walkIn, k.walkEnd);
  const x = mix(WALK_FROM, YX, p);
  const walking = lerpPose(walkPose(frame * 0.3), STAND, ramp(frame, k.walkEnd - 8, k.walkEnd));
  const up = ramp(frame, k.raise + 2, k.raise + 12);
  const lower = ramp(frame, k.move + 8, k.move + 22);
  const armF: [number, number] = [mix(mix(walking.armF[0], LETTER_UP[0], up), 20, lower), mix(mix(walking.armF[1], LETTER_UP[1], up), 30, lower)];
  const pose: Pose = { ...walking, armF };
  return { x, pose, head: headAt(x, FLOOR, S, pose) };
}

function taeho(frame: number, k: CrimsonTimes) {
  const pose = lerpPose(FOOT_UP, FOOT_DOWN, ramp(frame, k.move + 4, k.move + 16));
  const bob = Math.sin(frame / 11) * 2;
  return { pose: { ...pose, armF: [pose.armF[0] + bob, pose.armF[1]] as [number, number] }, head: headAt(TX, FLOOR, S, pose, -1) };
}

/** Tae-ho's face: on his shoe, then "Still here?" at you, then back down; at `barely` the eyes flick up and drop. */
function taehoFace(frame: number, k: CrimsonTimes) {
  const down = { brows: "flat" as const, lids: 0.4, mouth: "flat" as const, eyes: 1, look: { x: 0.2, y: 0.85 } };
  if (frame >= k.still && frame < k.raise) return { ...down, mouth: "smirk" as const, lids: 0.3, look: { x: 0.95, y: 0 } };
  if (frame >= k.move) return { ...down, look: { x: 0.95, y: -0.05 }, lids: 0.45 };
  const glance = ramp(frame, k.barely + 12, k.barely + 20) - ramp(frame, k.barely + 34, k.barely + 44);
  return { ...down, look: { x: mix(0.2, 0.7, glance), y: mix(0.85, -0.35, glance) } };
}

function youFace(frame: number, k: CrimsonTimes) {
  if (frame < k.still) return { ...EXPRESSIONS.determined, look: { x: 0.9, y: 0 } };
  if (frame < k.raise) return { ...EXPRESSIONS.sceptical, look: { x: 0.9, y: 0 } };
  if (frame < k.taehoTag + 4) return { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1.05, look: { x: 0.9, y: -0.1 } };
  if (frame < k.move) return { brows: "raised" as const, lids: 0, mouth: "o" as const, eyes: 1.2, look: { x: 0.7, y: -0.75 } };
  return { brows: "worry" as const, lids: 0.15, mouth: "flat" as const, eyes: 1.05, look: { x: 0.6, y: -0.55 } };
}

type View = "wide" | "track" | "lockers" | "still" | "raise" | "ots" | "youLook" | "barely" | "move";

export const CorridorShot: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const view = current<View>(frame, [[0, "wide"], [k.youWalk, "track"], [k.lockers, "lockers"], [k.still, "still"], [k.raise, "raise"],
    [k.ots, "ots"], [k.youLook, "youLook"], [k.barely, "barely"], [k.move, "move"]]);
  const y = you(frame, k);
  const t = taeho(frame, k);
  const th = t.head;
  const cams: Record<View, Camera> = {
    wide: camAt(frame, [[k.walkIn, { x: 1000, y: 620, zoom: 1.12 }], [k.youWalk, { x: 1040, y: 615, zoom: 1.22 }]]),
    track: { x: y.x + 170, y: 650, zoom: 1.75 },
    lockers: camAt(frame, [[k.lockers, { x: TX - 70, y: 650, zoom: 1.75 }], [k.still, { x: TX - 80, y: 640, zoom: 1.95 }]]),
    still: camAt(frame, [[k.still, closeUp(th.x - 30, th.y - 10, 2.5)], [k.raise, closeUp(th.x - 30, th.y - 10, 2.65)]]),
    raise: camAt(frame, [[k.raise, { x: (YX + TX) / 2, y: 610, zoom: 1.7 }], [k.ots, { x: (YX + TX) / 2 + 10, y: 605, zoom: 1.78 }]]),
    ots: camAt(frame, [[k.ots, closeUp(th.x - 150, th.y - 80, 2.15)], [k.youLook, closeUp(th.x - 140, th.y - 85, 2.3)]]),
    youLook: camAt(frame, [[k.youLook, closeUp(y.head.x - 30, y.head.y - 30, 2.6)], [k.barely, closeUp(y.head.x - 30, y.head.y - 35, 2.8)]]),
    barely: camAt(frame, [[k.barely, closeUp(th.x - 10, th.y - 70, 2.3)], [k.move, closeUp(th.x - 10, th.y - 70, 2.45)]]),
    move: camAt(frame, [[k.move, { x: (YX + TX) / 2 + 20, y: 610, zoom: 1.6 }], [k.kang, { x: (YX + TX) / 2 + 20, y: 605, zoom: 1.7 }]]),
  };
  const cam = drift(cams[view], frame, "corridor", 3);
  const showYou = view !== "ots" && view !== "lockers" && view !== "still" && view !== "barely";
  const letter = <Letter x={0} y={8} scale={0.42} tilt={view === "wide" || view === "track" ? 24 : 6} />;
  const actors = (
    <>
      <ShoeLockers x={TX - 190} y={FLOOR - 14} />
      <Figure {...TAEHO} x={TX} y={FLOOR} scale={S} facing={-1} pose={t.pose} {...taehoFace(frame, k)} blink={blinking(frame, 3)} time={frame}
        held={<Shoe x={6} y={4} scale={0.9} tilt={-20} />} />
      <Meter frame={frame} at={k.taehoTag} x={th.x} headY={th.y} r={th.r} value={-6} until={k.kang} />
      {showYou && (
        <Figure {...HERO} x={y.x} y={FLOOR} scale={S} pose={y.pose} {...youFace(frame, k)} blink={blinking(frame, 1)} time={frame}
          flow={view === "wide" || view === "track" ? 0.25 : 0} held={letter} />
      )}
    </>
  );
  return (
    <>
      <SetShot set={schoolCorridor} mood={mood} frame={frame} cam={cam} options={{ bags: false }} actors={actors} />
      {view === "ots" && <ForegroundHead x={250} side="left" blur={16} />}
    </>
  );
};
