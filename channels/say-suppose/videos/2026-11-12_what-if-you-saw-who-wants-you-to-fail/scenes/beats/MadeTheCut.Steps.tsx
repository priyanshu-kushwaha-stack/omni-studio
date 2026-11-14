// Made the Cut, the first beat of line 3 ("Ten at night. Extra classes finally let out. And waiting at the bottom of
// the steps ..."): the academy street (sets/AcademyStreet, street view) before the thumbnail's frame. The glass doors
// stand open on the lit lobby; students come out in ones and twos, down the three concrete steps, and split left and
// right along the pavement; your best friend waits at the bottom of the steps by the snack shop, looking up at the
// doors; you come out last, the letter in your hand, and stop on the landing. (v4.2, outside review of v4.1: "the
// academy steps are visually weak; it mostly reads as characters against signboards".)
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

export const Steps: React.FC<{ frame: number; from: number; to: number }> = ({ frame, from, to }) => {
  const f = frame - from;
  const cam = drift(camAt(frame, [[from, { x: 600, y: 800, zoom: 1.5 }], [to, { x: 610, y: 830, zoom: 1.66 }]]), frame, "steps", 3);
  const look = setLook(academyLights("street"), "night", cam);
  // you come out last and stop on the landing, facing the street, the letter in your hand
  const youOut = Math.round((to - from) * 0.45);
  const youWalk = ramp(f, youOut, youOut + 24);
  const you = { x: mix(330, 420, youWalk), y: LANDING, scale: 0.8 };
  const walking = youWalk > 0 && youWalk < 1;
  const youPose: Pose = walking ? { ...walkPose(f * 0.3), armF: [70, 70] } : { ...STAND, armF: [70, 70] };
  const people = WALKERS.map((w) => ({ w, ...walkerAt(w, f) })).filter((p) => p.t >= 0 && p.x > -300 && p.x < 1500).sort((a, b) => a.y - b.y);
  const m = ACADEMY.minjun;
  const wave = f > youOut + 10 ? Math.sin((f - youOut) / 4) * 20 : 0;
  const actors = (
    <>
      {f >= youOut && (
        <>
          <Backpack x={you.x - 24} y={you.y - 82} scale={0.63} color="#3d6fb0" />
          <Figure {...you} facing={1} pose={youPose} {...HERO} flow={0.15} time={frame} brows="raised" lids={0} mouth="smile" eyes={1.1}
            look={{ x: 0.9, y: 0.3 }} blink={blinking(frame, 0)} held={<Letter x={2} y={4} scale={0.42} tilt={-6} />} />
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
      <Figure x={m.x} y={m.y} scale={m.scale} facing={m.facing} pose={{ ...STAND, armB: wave ? [-150 + wave, -20] : [-7, 8], armF: [20, 30] }}
        head={MINJUN.head} coat={MINJUN.coat} brows="raised" mouth={f > youOut + 6 ? "open" : "smile"} eyes={1.1} look={{ x: 0.7, y: -0.5 }}
        blink={blinking(frame, 2)} time={frame} />
    </>
  );
  return (
    <LookContext.Provider value={look}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<AcademyStreetBack cam={cam} mood="night" frame={frame} view="street" doors={1} />} actors={actors} />
    </LookContext.Provider>
  );
};
