// Beat "A Thousand Cards" (script.md v2.1, ## [03:05] A Thousand Cards; narration lines 37-43), the film's signature
// picture. The academy street at ten (AcademyStreet view "street", night).
//
//   37    close on you at the foot of the academy steps, thinking; the street from below: the steps, your best friend
//         and the class by the snack shop
//   38    "about a thousand after-school academies": the camera climbs the sign towers
//   39    "Inspectors have patrolled the streets": an inspector with a clipboard walks the pavement, checks his watch
//   40    the wide: every door on the street opens at once and the crowd pours out
//   41    "So you climb the academy steps": you climb to the landing; the letter goes up; "and say it into the crowd":
//         the wide: a thousand cards snap open over a thousand heads in a ripple from the steps, nearly all grey zeros,
//         a scatter of teal, three red by the snack shop
//   hold  the camera rises and pulls back until the street is a field of cards; the stranger at the bus stop at the
//         bottom of the frame reads the timetable and never looks up (no card: he never faces you)
//   42    the field; "And three red": down to the snack shop, the three red cards over your class
//   43    close on your face lit from below, eyes on the red cards; over your shoulder, your best friend looking up,
//         waving
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS, type Expression } from "@whatif/kit/rig/expressions";
import { joints, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { closeUp, drift, ForegroundHead } from "@whatif/kit/stage/shots";
import { Stage, toScreen, type Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { INK, PAPER } from "@whatif/kit/theme";
import { headAt, Letter, Meter, MeterSound } from "../parts";
import { blinking, camAt, current, HERO, lineEnd, linear, MINJUN, mix, PASTELS, ramp, STRANGER, type Beat, type Shot } from "../shared";
import { ACADEMY, academyLights, AcademyStreetBack, AcademyStreetFront } from "../sets/AcademyStreet";
import { lineAt, moodNow } from "./MadeTheCut.parts";
import { Crowd } from "./ThousandTags.Crowd";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  return {
    steps: from(37), // close on you at the foot of the steps
    below: at(37, 0.5), // "So maybe the number fades ...": the street from below
    towers: from(38), // "about a thousand after-school academies": climb the towers
    inspector: from(39), // "Inspectors have patrolled the streets"
    watch: at(39, 0.62), // he checks his watch
    wide: from(40), // "So at ten, every door on the street opens at once."
    doors: at(40, 0.42), // the doors open
    you: from(41), // "So you climb the academy steps"
    climbed: at(41, 0.4), // on the landing
    raise: at(41, 0.46), // the letter goes up
    say: at(41, 0.62), // "and say it into the crowd": the cards snap open
    rise: lineEnd(clips, 41) + 6, // the hold: the camera keeps rising
    field: at(42, 0.36), // the field of cards
    three: at(42, 0.56), // "And three red. All by the snack shop."
    face: from(43), // close on your face, lit from below
    ots: at(43, 0.5), // over your shoulder: your best friend waving
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ the cast

const YOU = ACADEMY.you;
const MJ = ACADEMY.minjun;

/** Your class by the snack shop: your best friend and five more; three red (his -84 and two others). */
const CLASS = [
  { x: 880, y: 1112, head: PASTELS[1], value: -31 },
  { x: 965, y: 1124, head: PASTELS[7], value: 12 },
  { x: 1050, y: 1108, head: PASTELS[3], value: -17 },
  { x: 1135, y: 1126, head: PASTELS[4], value: 0 },
  { x: 1215, y: 1112, head: PASTELS[2], value: 6 },
];

/** Raising the letter: the front arm goes forward and up toward the crowd, below the face (no arm crosses it). */
/** Where you stand: at the foot of the steps until line 41, then up the three treads to the landing. */
function youAt(frame: number, k: T): { x: number; y: number; walking: boolean } {
  const p = linear(frame, k.you + 4, k.climbed);
  const s = ACADEMY.steps;
  const treads = [ACADEMY.floor + 6, s.treads[2], s.treads[1], s.treads[0]];
  const step = Math.min(3, Math.floor(p * 3.999));
  const within = p * 4 - step;
  const y = step >= 3 ? treads[3] : mix(treads[step], treads[step + 1], Math.min(1, within * 1.6));
  return { x: mix(YOU.x - 10, YOU.x, p), y, walking: p > 0 && p < 1 };
}

function yourPose(frame: number, k: T): Pose {
  if (youAt(frame, k).walking) return walkPose(frame * 0.3);
  const up = ramp(frame, k.raise, k.raise + 10);
  return { ...STAND, armF: [mix(30, 106, up), mix(60, 18, up)], tilt: mix(0, -6, up) };
}

/** The class and your best friend, with their cards from `say`. He waves on the over-the-shoulder. */
const Class: React.FC<{ frame: number; k: T; wave: boolean }> = ({ frame, k, wave }) => {
  const s = ACADEMY.classSpot.scale;
  const mjPose: Pose = wave ? { ...STAND, armB: [-150 + Math.sin(frame / 4) * 18, -20] } : STAND;
  const mh = headAt(MJ.x, MJ.y, MJ.scale, mjPose, -1);
  return (
    <g>
      {CLASS.map((c, i) => {
        const h = headAt(c.x, c.y, s, STAND, -1);
        return (
          <g key={i}>
            <Figure x={c.x} y={c.y} scale={s} facing={-1} head={c.head} coat="#2a2d36" {...EXPRESSIONS.neutral}
              look={{ x: 0.7, y: -0.4 }} blink={blinking(frame, i + 10)} time={frame} />
            <Meter frame={frame} at={k.say + 3 + i * 2} x={h.x} headY={h.y} r={h.r} value={c.value} until={k.end} />
          </g>
        );
      })}
      <Figure x={MJ.x} y={MJ.y} scale={MJ.scale} facing={-1} pose={mjPose} head={MINJUN.head} coat={MINJUN.coat}
        {...(wave ? { ...EXPRESSIONS.happy, mouth: "open" as const } : EXPRESSIONS.happy)} look={{ x: 0.8, y: -0.6 }} blink={blinking(frame, 2)} time={frame} />
      <Meter frame={frame} at={k.say + 2} x={mh.x} headY={mh.y} r={mh.r} value={-84} until={k.end} />
    </g>
  );
};

/** The stranger at the bus stop: crimson head, a long dark coat, reading the timetable. Never looks up. */
const Stranger: React.FC<{ frame: number }> = ({ frame }) => {
  const st = ACADEMY.stranger;
  const j = joints(STAND);
  const s = st.scale;
  return (
    <g>
      <Figure x={st.x} y={st.y} scale={s} facing={1} head={STRANGER.head} coat={STRANGER.coat} brows="flat" lids={0.45} mouth="flat"
        look={{ x: 1, y: 0.25 }} blink={blinking(frame, 9)} time={frame} />
      {/* the coat's long skirt, to the calf */}
      <path d={`M${st.x + (j.hip.x - 34) * s} ${st.y + (j.hip.y + 50) * s} L${st.x + (j.hip.x + 34) * s} ${st.y + (j.hip.y + 50) * s}
        L${st.x + (j.hip.x + 42) * s} ${st.y - 26 * s} L${st.x + (j.hip.x - 42) * s} ${st.y - 26 * s}Z`} fill={STRANGER.coat} stroke={INK} strokeWidth={5 * s} strokeLinejoin="round" />
    </g>
  );
};

/** The inspector walking the pavement on line 41: grey coat, a yellow armband, a clipboard; he stops to check his
 *  watch. */
function inspectorAt(frame: number, k: T) {
  const p = linear(frame, k.inspector - 10, k.wide);
  const x = mix(2400, 3150, Math.min(p, 0.62) + Math.max(0, p - 0.85) * 1.2);
  const walking = frame < k.watch || frame > k.watch + 40;
  return { x, y: 1180, scale: 0.66, walking };
}

const Inspector: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const ins = inspectorAt(frame, k);
  const pose: Pose = ins.walking ? walkPose(frame * 0.24) : { ...STAND, armF: [70, 95] };
  return (
    <g>
      <Figure x={ins.x} y={ins.y} scale={ins.scale} facing={1} pose={pose} head={PASTELS[0]} coat="#6b6f7a" brows="flat" lids={0.3}
        mouth="flat" look={ins.walking ? { x: 0.8, y: 0.1 } : { x: 0.5, y: 0.9 }} time={frame}
        held={<rect x={-14} y={-30} width={34} height={44} rx={4} fill={PAPER} stroke={INK} strokeWidth={4} />} />
      <rect x={ins.x - 18 * ins.scale} y={ins.y - 190 * ins.scale} width={36 * ins.scale} height={14 * ins.scale} fill="#f2b632" />
    </g>
  );
}

// ------------------------------------------------------------------------------------------------ the shot

const Street: React.FC<{ frame: number; k: T; cam: Camera; face: Partial<Expression>; wave?: boolean; you?: boolean }> = ({ frame, k, cam, face, wave = false, you = true }) => {
  const doors = ramp(frame, k.doors, k.doors + 14);
  const pose = yourPose(frame, k);
  const me = youAt(frame, k);
  const actors = (
    <>
      <Crowd frame={frame} cam={cam} doors={k.doors} say={k.say} until={k.end} you={{ x: YOU.x, y: YOU.y }} />
      {you && (
        <Figure x={me.x} y={me.y} scale={YOU.scale} facing={1} pose={pose} {...HERO} {...face} blink={blinking(frame, 0)} time={frame}
          flow={0.2} held={<Letter x={4} y={8} scale={0.45} tilt={-4} />} />
      )}
      <Class frame={frame} k={k} wave={wave} />
      {frame >= k.inspector && frame < k.wide && <Inspector frame={frame} k={k} />}
      <Stranger frame={frame} />
    </>
  );
  return (
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
      back={<AcademyStreetBack cam={cam} mood="night" frame={frame} view="street" doors={doors} />}
      actors={actors} front={<AcademyStreetFront cam={cam} />} />
  );
};

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const on = current(frame, [
    [0, "steps"], [k.below, "below"], [k.towers, "towers"], [k.inspector, "inspector"], [k.wide, "wide"], [k.you, "climb"], [k.raise, "you"], [k.say - 2, "say"],
    [k.three, "three"], [k.face, "face"], [k.ots, "ots"],
  ]);
  const me = youAt(frame, k);
  const yh = headAt(me.x, me.y, YOU.scale, yourPose(frame, k), 1);
  const mh = headAt(MJ.x, MJ.y, MJ.scale, STAND, -1);
  const ins = inspectorAt(frame, k);
  const cams: Record<typeof on, Camera> = {
    steps: camAt(frame, [[k.steps, closeUp(yh.x + 30, yh.y, 2.4)], [k.below, closeUp(yh.x + 30, yh.y, 2.6)]]),
    below: camAt(frame, [[k.below, { x: 640, y: 860, zoom: 1.45 }], [k.towers, { x: 700, y: 840, zoom: 1.35 }]]),
    towers: camAt(frame, [[k.towers, { x: 1000, y: 760, zoom: 1.15 }], [k.inspector, { x: 1000, y: 260, zoom: 1.2 }]]),
    inspector: { x: ins.x + 60, y: 920, zoom: 1.6 },
    wide: camAt(frame, [[k.wide, { x: 980, y: 640, zoom: 0.92 }], [k.you, { x: 960, y: 650, zoom: 0.98 }]]),
    climb: camAt(frame, [[k.you, { x: 470, y: 880, zoom: 1.55 }], [k.raise, { x: 480, y: 850, zoom: 1.7 }]]),
    you: camAt(frame, [[k.raise, closeUp(yh.x + 50, yh.y + 20, 2.3)], [k.say, closeUp(yh.x + 50, yh.y + 10, 2.5)]]),
    say: camAt(frame, [[k.say, { x: 820, y: 780, zoom: 1.0 }], [k.rise, { x: 860, y: 720, zoom: 0.86 }], [k.field, { x: 980, y: 600, zoom: 0.47 }], [k.three, { x: 980, y: 590, zoom: 0.45 }]]),
    three: camAt(frame, [[k.three, { x: 990, y: 930, zoom: 2.0 }], [k.face, { x: 990, y: 925, zoom: 2.15 }]]),
    face: camAt(frame, [[k.face, closeUp(yh.x + 40, yh.y, 2.7)], [k.ots, closeUp(yh.x + 40, yh.y, 2.9)]]),
    ots: camAt(frame, [[k.ots, closeUp(mh.x + 30, mh.y - 40, 2.3)], [k.end, closeUp(mh.x + 30, mh.y - 50, 2.45)]]),
  };
  const cam = drift(cams[on], frame, "tags", on === "say" ? 2 : 3);
  const faces: Record<typeof on, Partial<Expression>> = {
    steps: { ...EXPRESSIONS.sceptical, look: { x: 0.8, y: 0.3 } },
    below: { ...EXPRESSIONS.determined, look: { x: 0.9, y: 0.4 } },
    towers: EXPRESSIONS.determined,
    inspector: EXPRESSIONS.determined,
    wide: { ...EXPRESSIONS.determined, look: { x: 0.9, y: 0.5 } },
    climb: { ...EXPRESSIONS.determined, look: { x: 0.9, y: 0.2 } },
    you: frame < k.raise ? { ...EXPRESSIONS.determined, look: { x: 0.9, y: 0.5 } } : { brows: "raised", lids: 0, mouth: "open", eyes: 1.15, look: { x: 0.9, y: 0.4 } },
    say: { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.9, y: 0.4 } },
    three: { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.9, y: 0.4 } },
    face: { brows: "angry", lids: mix(0.1, 0.35, ramp(frame, k.face + 20, k.face + 50)), mouth: "flat", eyes: 1, look: { x: 0.85, y: 0.65 } },
    ots: EXPRESSIONS.determined,
  };
  // The close-up on your face takes the signboards' light from below.
  const under = on === "face" ? [{ x: toScreen(cam, yh.x, yh.y).x, y: 1180, r: 700, color: "#ff6f91", strength: 0.35 }] : [];
  const look = setLook(academyLights("street"), moodNow(shot), cam, { glows: under });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <LookContext.Provider value={look}>
        <Street frame={frame} k={k} cam={cam} face={faces[on]} wave={on === "ots"} you={on !== "ots"} />
      </LookContext.Provider>
      {on === "ots" && <ForegroundHead x={260} side="left" blur={18} />}
      <MeterSound at={k.say} />
      {[3, 7, 11, 16, 22].map((d, i) => <MeterSound key={d} at={k.say + d} soft={i % 2 === 1} volume={0.55 - i * 0.07} />)}
    </AbsoluteFill>
  );
};

export const thousandTags: Beat = { id: "ThousandTags", firstLine: 37, Component: Scene };
