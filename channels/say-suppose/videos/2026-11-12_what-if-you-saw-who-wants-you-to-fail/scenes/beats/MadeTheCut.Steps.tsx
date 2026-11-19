// Made the Cut, the first beat of line 3 ("Ten at night. Extra classes finally let out. And waiting at the bottom of
// the steps ..."): the academy street (sets/AcademyStreet, street view) before the thumbnail's frame. The glass doors
// stand open on the lit lobby; students come out in ones and twos, down the three concrete steps, and split left and
// right along the pavement; your best friend waits at the bottom of the steps by the snack shop, looking up at the
// doors; you come out last, the letter in your hand, and stop on the landing. (v4.2, outside review of v4.1: "the
// academy steps are visually weak; it mostly reads as characters against signboards".)
//
// v7 `long` (outside review of v6: the cold open has already shown the hug, so the film enters it later and from a new
// angle): the shot runs on through "like every night: your best friend": you come out with the letter hidden in your
// jacket, he looks up and reads your face, steps toward you, you come down the steps to him and pull the letter out.
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Backpack } from "@whatif/kit/sets/props";
import { LookContext } from "@whatif/kit/stage/Look";
import { drift } from "@whatif/kit/stage/shots";
import { Stage } from "@whatif/kit/stage/Stage";
import { Letter } from "../parts";
import { blinking, camAt, HERO, linear, MINJUN, mix, noise, PASTELS, ramp } from "../shared";
import { ACADEMY, AcademyStreetBack, academyLights } from "../sets/AcademyStreet";
import { setLook } from "@whatif/kit/sets/common";

const S = ACADEMY.steps;
const LANDING = S.landing, BASE = S.base;
const SCALE = 0.76;

/** One student: out of the doors at `out` (frames after the shot starts), down the steps, then off along the pavement. */
interface Walker { out: number; x: number; dir: 1 | -1; head: string; coat: string; bag: string }
const WALKERS: Walker[] = Array.from({ length: 9 }, (_, i) => ({
  out: Math.round(i * 7 + noise(i + 40) * 6) - 18,
  x: mix(200, 470, noise(i + 11)),
  dir: (i % 3 === 1 ? 1 : -1) as 1 | -1,
  head: PASTELS[(i * 3 + 1) % PASTELS.length],
  coat: i % 2 ? "#2a2d36" : "#3b4a6b",
  bag: ["#3d6fb0", "#b0543d", "#5a7a3d", "#7a5a9a"][i % 4],
}));

/** Where a student is `f` frames after the shot starts: feet on the landing, down the steps (40 frames), then along. */
function walkerAt(w: Walker, f: number) {
  const t = f - w.out;
  const down = linear(t, 0, 40);
  const along = Math.max(0, t - 40);
  const x = w.x + w.dir * (down * 60 + along * 4.2);
  const y = mix(LANDING, BASE + 30, down);
  const scale = mix(SCALE, SCALE * 1.06, down);
  return { x, y, scale, t };
}

export const Steps: React.FC<{ frame: number; from: number; to: number; long?: boolean }> = ({ frame, from, to, long }) => {
  const f = frame - from;
  const span = to - from;
  const cam = drift(long
    ? camAt(frame, [[from, { x: 600, y: 800, zoom: 1.5 }], [from + Math.round(span * 0.55), { x: 620, y: 840, zoom: 1.62 }], [to, { x: 660, y: 900, zoom: 2.3 }]])
    : camAt(frame, [[from, { x: 600, y: 800, zoom: 1.5 }], [to, { x: 610, y: 830, zoom: 1.66 }]]), frame, "steps", 3);
  const look = setLook(academyLights("street"), "night", cam);
  // you come out last and stop on the landing, facing the street, the letter in your hand; `long`: the letter hidden,
  // you come on down the steps to him and pull it out at the bottom
  const youOut = Math.round(span * (long ? 0.3 : 0.45));
  const youWalk = ramp(f, youOut, youOut + 24);
  const down = long ? ramp(f, Math.round(span * 0.55), Math.round(span * 0.55) + 34) : 0;
  const reveal = long ? ramp(f, Math.round(span * 0.84), Math.round(span * 0.84) + 8) : 1;
  const you = { x: mix(mix(330, 420, youWalk), 600, down), y: mix(LANDING, BASE + 10, down), scale: mix(0.8, 0.8 * 1.06, down) };
  const walking = (youWalk > 0 && youWalk < 1) || (down > 0 && down < 1);
  const arm: [number, number] = long ? [mix(20, 150, reveal), mix(110, 20, reveal)] : [70, 70];
  const youPose: Pose = walking ? { ...walkPose(f * 0.3), armF: arm } : { ...STAND, armF: arm };
  const people = WALKERS.map((w) => ({ w, ...walkerAt(w, f) })).filter((p) => p.t >= 0 && p.x > -300 && p.x < 1500).sort((a, b) => a.y - b.y);
  const m0 = ACADEMY.minjun;
  // `long`: he reads your face, then steps toward the foot of the steps
  const toward = long ? ramp(f, Math.round(span * 0.5), Math.round(span * 0.5) + 24) : 0;
  const m = { ...m0, x: mix(m0.x, 690, toward) };
  const wave = f > youOut + 10 && !(long && f > span * 0.5) ? Math.sin((f - youOut) / 4) * 20 : 0;
  const actors = (
    <>
      {f >= youOut && (
        <>
          <Backpack x={you.x - 24} y={you.y - 82} scale={0.63} color="#3d6fb0" />
          <Figure {...you} facing={1} pose={youPose} {...HERO} flow={0.15} time={frame} brows="raised" lids={0} mouth={reveal > 0.5 ? "open" : "smile"} eyes={1.1}
            look={{ x: 0.9, y: long && down > 0 ? 0.1 : 0.3 }} blink={blinking(frame, 0)} held={long && reveal < 0.3 ? undefined : <Letter x={2} y={4} scale={0.42} tilt={-6} />} />
        </>
      )}
      {people.map(({ w, x, y, scale, t }, i) => (
        <g key={i}>
          <Backpack x={x - w.dir * 30 * scale} y={y - 103 * scale} scale={0.78 * scale} color={w.bag} />
          <Figure x={x} y={y} scale={scale} facing={w.dir} pose={walkPose(t * 0.32 + i)} head={w.head} coat={w.coat}
            mouth={i % 3 === 0 ? "smile" : "flat"} lids={0.3} look={{ x: 0.8, y: 0.1 }} time={frame} />
        </g>
      ))}
      {/* your best friend at the bottom of the steps, by the snack shop, looking up at the doors; he waves when you come out */}
      <Figure x={m.x} y={m.y} scale={m.scale} facing={m.facing} pose={toward > 0 && toward < 1 ? walkPose(f * 0.3) : { ...STAND, armB: wave ? [-150 + wave, -20] : [-7, 8], armF: [20, 30] }}
        head={MINJUN.head} coat={MINJUN.coat} brows="raised" mouth={f > youOut + 6 ? "open" : "smile"} eyes={long && f > span * 0.42 ? 1.25 : 1.1} look={{ x: 0.7, y: long && down > 0.5 ? -0.1 : -0.5 }}
        blink={blinking(frame, 2)} time={frame} />
    </>
  );
  return (
    <LookContext.Provider value={look}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<AcademyStreetBack cam={cam} mood="night" frame={frame} view="street" doors={1} />} actors={actors} />
    </LookContext.Provider>
  );
};
