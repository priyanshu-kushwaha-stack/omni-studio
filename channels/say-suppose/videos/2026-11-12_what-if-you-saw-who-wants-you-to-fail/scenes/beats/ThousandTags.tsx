// Beat "A Thousand Cards" (script.md v3, ## [04:39] A Thousand Cards; narration lines 53-61), the film's signature
// picture. The academy street at ten (AcademyStreet view "street", night).
//
//   53    close on you at the foot of the academy steps; the street from below: the steps, your best friend and the
//         class by the snack shop
//   54    "about 1,000 after-school academies": the camera climbs the sign towers
//   55    "Inspectors have patrolled the streets": an inspector with a clipboard walks the pavement, checks his watch
//   56    the wide: every door on the street opens at once and the crowd pours out
//   57    "You climb the academy steps": you climb to the landing; the letter goes up; "and say it into the crowd": the
//         wide: a thousand cards snap open in a ripple from the steps, nearly all grey zeros, a scatter of teal, three
//         red by the snack shop
//   hold  the camera rises and pulls back until the street is a field of cards; the stranger at the bus stop at the
//         bottom of the frame reads the timetable and never looks up (no card: he never faces you)
//   58    the field; "every red card points back to your class": down to the class by the snack shop
//   59    "One is your best friend.": him under -84; "So who are the other two?": your face, lit from below
//   60    the girl from your row (lilac head, a calculator) under -30; the boy, your old walking partner (grey-blue
//         head), laughing, under -44
//   61    your face, lit from below; over your shoulder, your best friend looking up, waving
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS, type Expression } from "@whatif/kit/rig/expressions";
import { joints, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { Stage, toScreen, type Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { INK, PAPER } from "@whatif/kit/theme";
import { headAt, Letter, Meter, MeterSound, YourShoulder } from "../parts";
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
    steps: from(53), // close on you at the foot of the steps
    below: at(53, 0.5), // "So maybe a bigger crowd ...": the street from below
    towers: from(54), // "about 1,000 after-school academies": climb the towers
    inspector: from(55), // "Inspectors have patrolled the streets"
    watch: at(55, 0.62), // he checks his watch
    wide: from(56), // "So at ten, every door on the street opens at once."
    doors: at(56, 0.36), // the doors open
    you: from(57), // "You climb the academy steps"
    climbed: at(57, 0.4), // on the landing
    raise: at(57, 0.46), // the letter goes up
    say: at(57, 0.62), // "and say it into the crowd": the cards snap open
    rise: lineEnd(clips, 57) + 6, // the hold: the camera keeps rising
    field: at(58, 0.3), // the field of cards
    lock: at(58, 0.42), // the wide held; then the grey and teal cards dim and the camera pushes in on the class
    three: at(58, 0.62), // "every red card points back to your class"
    mj: from(59), // "One is your best friend."
    look: at(59, 0.5), // "So who are the other two?": your eyes go card to card
    girl: from(60), // "The girl who borrows your calculator. Minus thirty."
    boy: at(60, 0.5), // "The boy you walked home with all of first year. Minus forty-four."
    face: from(61), // close on your face, lit from below
    ots: at(61, 0.5), // over your shoulder: your best friend waving
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ the cast

const YOU = ACADEMY.you;
const MJ = ACADEMY.minjun;

/** Your class by the snack shop: your best friend and five more; three red: his -84, the girl from your row with the
 *  calculator (-30) and the boy, your old walking partner, laughing (-44). */
const GIRL = { head: "#c9a0d6" } as const;
const BOY = { head: "#8fa3b8" } as const;
const CLASS = [
  { x: 880, y: 1112, head: GIRL.head, value: -30, who: "girl" },
  { x: 965, y: 1124, head: PASTELS[7], value: 12, who: "" },
  { x: 1050, y: 1108, head: BOY.head, value: -44, who: "boy" },
  { x: 1135, y: 1126, head: PASTELS[4], value: 0, who: "" },
  { x: 1215, y: 1112, head: PASTELS[2], value: 6, who: "" },
];

/** The girl's calculator, for her front hand. */
const CALC = (
  <g transform="rotate(-10) translate(-4 -34)">
    <rect x={-16} y={-4} width={32} height={46} rx={5} fill="#3b3e47" stroke={INK} strokeWidth={3} />
    <rect x={-11} y={1} width={22} height={10} rx={2} fill="#bfe6d6" />
    {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={-11 + c * 8} y={15 + r * 8} width={6} height={5} rx={1} fill={PAPER} />))}
  </g>
);

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
const Class: React.FC<{ frame: number; k: T; wave: boolean; dim: number }> = ({ frame, k, wave, dim }) => {
  const s = ACADEMY.classSpot.scale;
  const mjPose: Pose = wave ? { ...STAND, armB: [-150 + Math.sin(frame / 4) * 18, -20] } : STAND;
  const mh = headAt(MJ.x, MJ.y, MJ.scale, mjPose, -1);
  return (
    <g>
      {CLASS.map((c, i) => {
        const h = headAt(c.x, c.y, s, STAND, -1);
        return (
          <g key={i}>
            <Figure x={c.x} y={c.y} scale={s} facing={-1} head={c.head} coat="#2a2d36"
              {...(c.who === "boy" ? { brows: "raised" as const, lids: 0.35, mouth: (Math.floor(frame / 6) % 2 ? "open" : "smile") as "open" | "smile", eyes: 1, look: { x: 0.9, y: 0 } }
                : c.who === "girl" ? { brows: "flat" as const, lids: 0.3, mouth: "flat" as const, eyes: 1, look: { x: 0.4, y: 0.6 } }
                : { ...EXPRESSIONS.neutral, look: { x: 0.7, y: -0.4 } })}
              pose={c.who === "girl" ? { ...STAND, armF: [50, 80] } : STAND} held={c.who === "girl" ? CALC : undefined}
              blink={blinking(frame, i + 10)} time={frame} />
            <g opacity={c.value < 0 ? 1 : 1 - 0.72 * dim}>
              <Meter frame={frame} at={k.say + 3 + i * 2} x={h.x} headY={h.y} r={h.r} value={c.value} until={k.end} />
            </g>
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

/** The inspector walking the pavement on line 55: not to be mistaken for your best friend (outside review of v4.1), so a
 *  warm tan head under a navy peaked cap with a badge, a navy uniform coat with a reflective stripe across the chest, a
 *  yellow armband and a clipboard; he stops to check his watch. */
function inspectorAt(frame: number, k: T) {
  const p = linear(frame, k.inspector - 10, k.wide);
  const x = mix(2400, 3150, Math.min(p, 0.62) + Math.max(0, p - 0.85) * 1.2);
  const walking = frame < k.watch || frame > k.watch + 40;
  return { x, y: 1180, scale: 0.66, walking };
}

const INSPECTOR = { head: "#c08a5c", coat: "#26334d", cap: "#1c2740" } as const;

const CLIPBOARD = (
  <g transform="rotate(-8) translate(-4 -34)">
    <rect x={-20} y={-6} width={42} height={56} rx={4} fill="#9a6a3e" stroke={INK} strokeWidth={4} />
    <rect x={-14} y={2} width={30} height={42} fill={PAPER} />
    {[0, 1, 2].map((i) => <line key={i} x1={-10} y1={12 + i * 10} x2={i === 2 ? 2 : 12} y2={12 + i * 10} stroke={INK} strokeWidth={3} opacity={0.6} />)}
    <rect x={-8} y={-11} width={18} height={10} rx={3} fill="#c9ccd2" stroke={INK} strokeWidth={3} />
  </g>
);

const Inspector: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const ins = inspectorAt(frame, k);
  const pose: Pose = ins.walking ? walkPose(frame * 0.24) : { ...STAND, armF: [70, 95] };
  const s = ins.scale;
  const h = headAt(ins.x, ins.y, s, pose, 1);
  const j = joints(pose);
  const nx = ins.x + j.neck.x * s, ny = ins.y + j.neck.y * s;
  const hx = ins.x + j.hip.x * s, hy = ins.y + j.hip.y * s;
  const band = (t: number) => ({ x: mix(nx, hx, t), y: mix(ny, hy, t) });
  const b1 = band(0.34), b2 = band(0.8);
  return (
    <g>
      <Figure x={ins.x} y={ins.y} scale={s} facing={1} pose={pose} head={INSPECTOR.head} coat={INSPECTOR.coat} brows="flat" lids={0.3}
        mouth="flat" look={ins.walking ? { x: 0.8, y: 0.1 } : { x: 0.5, y: 0.9 }} time={frame} held={CLIPBOARD} />
      {/* the reflective stripes across the chest and the hem */}
      {[b1, b2].map((b, i) => (
        <g key={i}>
          <line x1={b.x - 25 * s} y1={b.y} x2={b.x + 25 * s} y2={b.y} stroke={INK} strokeWidth={13 * s} strokeLinecap="round" />
          <line x1={b.x - 23 * s} y1={b.y} x2={b.x + 23 * s} y2={b.y} stroke="#eef3f6" strokeWidth={8 * s} strokeLinecap="round" />
        </g>
      ))}
      <rect x={ins.x - 18 * s} y={ins.y - 190 * s} width={36 * s} height={14 * s} fill="#f2b632" />
      {/* the peaked cap: a navy crown over the top of the head, a brim forward, a small gold badge */}
      <path d={`M${h.x - h.r * 1.04} ${h.y - h.r * 0.28} A${h.r * 1.04} ${h.r * 1.04} 0 0 1 ${h.x + h.r * 1.04} ${h.y - h.r * 0.28} Z`}
        fill={INSPECTOR.cap} stroke={INK} strokeWidth={4 * s} strokeLinejoin="round" />
      <path d={`M${h.x + h.r * 0.2} ${h.y - h.r * 0.3} H${h.x + h.r * 1.55} Q${h.x + h.r * 1.6} ${h.y - h.r * 0.12} ${h.x + h.r * 1.3} ${h.y - h.r * 0.12} H${h.x + h.r * 0.2}Z`}
        fill={INSPECTOR.cap} stroke={INK} strokeWidth={4 * s} strokeLinejoin="round" />
      <circle cx={h.x + h.r * 0.25} cy={h.y - h.r * 0.68} r={h.r * 0.16} fill="#f2b632" stroke={INK} strokeWidth={3 * s} />
    </g>
  );
}

// ------------------------------------------------------------------------------------------------ the shot

const Street: React.FC<{ frame: number; k: T; cam: Camera; face: Partial<Expression>; wave?: boolean; you?: boolean; dim: number }> = ({ frame, k, cam, face, wave = false, you = true, dim }) => {
  const doors = ramp(frame, k.doors, k.doors + 14);
  const pose = yourPose(frame, k);
  const me = youAt(frame, k);
  const actors = (
    <>
      <Crowd frame={frame} cam={cam} doors={k.doors} say={k.say} until={k.end} you={{ x: YOU.x, y: YOU.y }} dim={dim} />
      {you && (
        <Figure x={me.x} y={me.y} scale={YOU.scale} facing={1} pose={pose} {...HERO} {...face} blink={blinking(frame, 0)} time={frame}
          flow={0.2} held={<Letter x={4} y={8} scale={0.45} tilt={-4} />} />
      )}
      <Class frame={frame} k={k} wave={wave} dim={dim} />
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
    [k.three, "three"], [k.mj, "mj"], [k.look, "look"], [k.girl, "girl"], [k.boy, "boy"], [k.face, "face"], [k.ots, "ots"],
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
    // the field held wide, then (the outside review of v4.1: guide the eye to the three red cards) the grey and teal cards
    // dim and the camera pushes in on your class, where the only red cards are
    say: camAt(frame, [[k.say, { x: 820, y: 780, zoom: 1.0 }], [k.rise, { x: 860, y: 720, zoom: 0.86 }], [k.field, { x: 980, y: 600, zoom: 0.47 }],
      [k.lock, { x: 980, y: 600, zoom: 0.45 }], [k.three, { x: 990, y: 935, zoom: 1.45 }]]),
    three: camAt(frame, [[k.three, { x: 990, y: 930, zoom: 2.0 }], [k.mj, { x: 990, y: 925, zoom: 2.15 }]]),
    mj: camAt(frame, [[k.mj, closeUp(mh.x - 10, mh.y - 60, 3.0)], [k.look, closeUp(mh.x - 10, mh.y - 65, 3.15)]]),
    look: camAt(frame, [[k.look, closeUp(yh.x + 40, yh.y, 2.7)], [k.girl, closeUp(yh.x + 40, yh.y, 2.85)]]),
    girl: camAt(frame, [[k.girl, closeUp(CLASS[0].x, CLASS[0].y - 210, 3.8)], [k.boy, closeUp(CLASS[0].x, CLASS[0].y - 212, 3.95)]]),
    boy: camAt(frame, [[k.boy, closeUp(CLASS[2].x, CLASS[2].y - 210, 3.8)], [k.face, closeUp(CLASS[2].x, CLASS[2].y - 212, 3.95)]]),
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
    mj: EXPRESSIONS.determined,
    look: { brows: "worry", lids: 0.1, mouth: "flat", eyes: 1.1, look: { x: 0.85, y: Math.sin((frame - k.look) / 10) * 0.25 + 0.55 } },
    girl: EXPRESSIONS.determined,
    boy: EXPRESSIONS.determined,
    face: { brows: "angry", lids: mix(0.1, 0.35, ramp(frame, k.face + 20, k.face + 50)), mouth: "flat", eyes: 1, look: { x: 0.85, y: 0.65 } },
    ots: EXPRESSIONS.determined,
  };
  // The close-up on your face takes the signboards' light from below.
  const under = on === "face" || on === "look" ? [{ x: toScreen(cam, yh.x, yh.y).x, y: 1180, r: 700, color: "#ff6f91", strength: 0.35 }] : [];
  const look = setLook(academyLights("street"), moodNow(shot), cam, { glows: under });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <LookContext.Provider value={look}>
        <Street frame={frame} k={k} cam={cam} face={faces[on]} wave={on === "ots"} you={on !== "ots"} dim={ramp(frame, k.lock, k.lock + 20)} />
      </LookContext.Provider>
      {on === "ots" && <YourShoulder side="left" />}
      <MeterSound at={k.say} />
      {[3, 7, 11, 16, 22].map((d, i) => <MeterSound key={d} at={k.say + d} soft={i % 2 === 1} volume={0.55 - i * 0.07} />)}
    </AbsoluteFill>
  );
};

export const thousandTags: Beat = { id: "ThousandTags", firstLine: 53, Component: Scene };
