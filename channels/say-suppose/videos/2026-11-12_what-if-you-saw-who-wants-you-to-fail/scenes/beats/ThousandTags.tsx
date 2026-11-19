// Beat "A Thousand Cards" (script v7, ## A Thousand Cards; lines 66-73), the film's signature picture. The academy
// street at ten (AcademyStreet view "street", night). Outside review of v6, sheets 25-28 and top-15 #10.
//
//   66    close on you at the foot of the steps; the news desk: you say it to the camera, wait, nothing; a wall of home
//         screens with empty card spaces sliding into one glass screen; the operator swivels the camera away while you
//         keep presenting (ThousandTags.Tv); "a crowd is a thousand faces": the last students run in through our doors,
//         the street empty for a moment
//   67    "about 1,000 after-school academies": the camera climbs the sign towers, 1,000 ACADEMIES rolls up
//   68    "only until ten at night": the street clock counting down, 21:59:5x; "Inspectors": the inspector marches in,
//         his torch on our doors, a late teacher peeks out, a tap on the watch, the teacher ducks back in
//   69    "So at ten": the clock hits 22:00:00; every door opens and a stream pours from each, door after door; you climb
//         to the landing, the letter up, your bubble; in the hold a thousand cards ripple open ring by ring from the
//         steps, small grey zeros, a scatter of teal, a dozen larger red by the snack shop; the camera rises
//   70    the field; "Nine hundred and eighty-eight ...": close on you, sheepish, sour faces and jerked thumbs (the laugh)
//   71    the rest dim, a crimson ring finds your class by the snack shop, the camera dives to it
//   72    the girl, her calculator big in the foreground, -30 pulsing on "Minus thirty"; first year: you and the boy under
//         one umbrella; the boy now, laughing under -44, pulsing on "Minus forty-four"
//   73    your face, lit from below; "And your list was right.": the REMOVED list, the girl's and the boy's rows tick red;
//         over your shoulder, your best friend waving under -88
//   The stranger stands at the bus stop at the bottom of the street reading the timetable throughout.
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
import { Bubble, headAt, Letter, Meter, MeterSound, YourShoulder } from "../parts";
import { blinking, camAt, current, HERO, lineEnd, linear, MINJUN, mix, PASTELS, ramp, STRANGER, type Beat, type Shot } from "../shared";
import { ACADEMY, academyLights, AcademyStreetBack, AcademyStreetFront } from "../sets/AcademyStreet";
import { lineAt, moodNow } from "./MadeTheCut.parts";
import { Crowd } from "./ThousandTags.Crowd";
import { TvShot } from "./ThousandTags.Tv";
import { AcademyCount, CLOCK, LateStudents, LateTeacher, MemoryShot, StreetClock } from "./ThousandTags.Late";
import { ListShot } from "./FourSeats.Phone";
import { CRIMSON } from "@whatif/kit/theme";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  const say = lineEnd(clips, 69) + 4;
  return {
    steps: from(66), // "Just your class, or all of Seoul?": close on you at the foot of the steps
    tv: at(66, 0.17), // "Why not go on the news ...": you at a news desk, live
    screens: at(66, 0.43), // "Because a screen isn't a face.": the home screens
    gag: at(66, 0.57), // "Your sister's video call settled that.": the operator swivels the camera away
    below: at(66, 0.71), // "But a crowd is a thousand faces, and this street has one.": the last students run in
    towers: from(67), // "about 1,000 after-school academies": climb the towers, the count
    count: at(67, 0.68),
    clock: from(68), // "And Seoul lets them teach only until ten at night.": the street clock
    inspector: at(68, 0.56), // "Inspectors have patrolled the streets"
    ten: from(69) + 6, // "So at ten": 22:00:00
    wide: at(69, 0.14), // "every door on the street opens at once."
    doors: at(69, 0.22), // the doors open
    you: at(69, 0.5), // "You climb the academy steps"
    climbed: at(69, 0.78), // on the landing
    raise: at(69, 0.84), // the letter goes up
    say, // in the hold: a thousand cards snap open
    rise: say + 20, // the camera keeps rising
    field: from(70), // "You just told a thousand strangers ...": the field of cards
    annoyed: at(70, 0.42), // "Nine hundred and eighty-eight of them would like you to get off the steps."
    lock: from(71), // "And every red card points back to your class.": the rest dim
    three: at(71, 0.3), // dive to the red cluster by the snack shop
    girl: from(72), // "The girl who borrows your calculator. Minus thirty."
    thirty: at(72, 0.29),
    memory: at(72, 0.38), // "The boy you walked home with all of first year."
    boy: at(72, 0.7), // "Minus forty-four."
    fortyFour: at(72, 0.86),
    face: from(73), // "So. Red means they want you to fail.": your face, lit from below
    list: at(73, 0.6), // "And your list was right.": the REMOVED list
    ots: at(73, 0.6) + 44, // over your shoulder, your best friend waving under his red card
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ the cast

const YOU = ACADEMY.you;
/** Your best friend's card here: -88 since the counter (The Weapon). */
const MJ_VALUE = -88;
const MJ = ACADEMY.minjun;

/** Your class by the snack shop: your best friend and five more, all red: his -88, the girl from your row with the
 *  calculator (-30), the boy, your old walking partner, laughing (-44), and three more. */
const GIRL = { head: "#c9a0d6" } as const;
const BOY = { head: "#8fa3b8" } as const;
const CLASS = [
  { x: 880, y: 1112, head: GIRL.head, value: -30, who: "girl" },
  { x: 965, y: 1124, head: PASTELS[7], value: -18, who: "" },
  { x: 1050, y: 1108, head: BOY.head, value: -44, who: "boy" },
  { x: 1135, y: 1126, head: PASTELS[4], value: -12, who: "" },
  { x: 1215, y: 1112, head: PASTELS[2], value: -25, who: "" },
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
/** A one-off pulse, 1 -> 1.3 -> 1 over 10 frames from `at`, so a card lands on its spoken number. */
const pulse = (frame: number, at: number) => (frame < at || frame > at + 10 ? 1 : 1 + 0.3 * Math.sin((Math.PI * (frame - at)) / 10));

const Class: React.FC<{ frame: number; k: T; wave: boolean; dim: number; bigCalc?: boolean }> = ({ frame, k, wave, dim, bigCalc }) => {
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
              pose={c.who === "girl" ? { ...STAND, armF: bigCalc ? [70, 70] : [50, 80] } : STAND}
              held={c.who === "girl" ? <g transform={`scale(${bigCalc ? 2.1 : 1})`}>{CALC}</g> : undefined}
              blink={blinking(frame, i + 10)} time={frame} />
            <g opacity={c.value < 0 ? 1 : 1 - 0.72 * dim}
              transform={`translate(${h.x} ${h.y - h.r * 2.6}) scale(${pulse(frame, c.who === "girl" ? k.thirty : c.who === "boy" ? k.fortyFour : -99)}) translate(${-h.x} ${-(h.y - h.r * 2.6)})`}>
              <Meter frame={frame} at={k.say + 3 + i * 2} x={h.x} headY={h.y} r={h.r} value={c.value} until={k.end} />
            </g>
          </g>
        );
      })}
      <Figure x={MJ.x} y={MJ.y} scale={MJ.scale} facing={-1} pose={mjPose} head={MINJUN.head} coat={MINJUN.coat}
        {...(wave ? { ...EXPRESSIONS.happy, mouth: "open" as const } : EXPRESSIONS.happy)} look={{ x: 0.8, y: -0.6 }} blink={blinking(frame, 2)} time={frame} />
      <Meter frame={frame} at={k.say + 2} x={mh.x} headY={mh.y} r={mh.r} value={MJ_VALUE} until={k.end} />
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
  const p = linear(frame, k.inspector, k.inspector + 30);
  return { x: mix(1380, 800, p), y: ACADEMY.floor, scale: 0.74, walking: p > 0 && p < 1 };
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
  // march in; the torch up at the doors; a tap on the watch; then a tick on the clipboard
  const tap = frame >= k.inspector + 50 && frame < k.inspector + 64;
  const pose: Pose = ins.walking ? walkPose(frame * 0.3) : tap ? { ...STAND, armF: [70, 95] } : frame < k.inspector + 70 ? { ...STAND, armF: [98, 8] } : { ...STAND, armF: [60, 80] };
  const s = ins.scale;
  const h = headAt(ins.x, ins.y, s, pose, 1);
  const j = joints(pose);
  const nx = ins.x + j.neck.x * s, ny = ins.y + j.neck.y * s;
  const hx = ins.x + j.hip.x * s, hy = ins.y + j.hip.y * s;
  const band = (t: number) => ({ x: mix(nx, hx, t), y: mix(ny, hy, t) });
  const b1 = band(0.34), b2 = band(0.8);
  // he walks right to left: drawn facing right and mirrored about his feet; the torch beam in world space
  const torch = { x: 2 * ins.x - (h.x + 44 * s), y: h.y + 40 * s };
  return (
    <g>
      {!ins.walking && !tap && frame < k.inspector + 70 && (
        <path d={`M${torch.x} ${torch.y} L${ACADEMY.doors.from + 30} ${ACADEMY.doors.top + 40} L${ACADEMY.doors.from + 90} ${ACADEMY.doors.bottom - 30}Z`}
          fill="#fff4b0" opacity={0.3} />
      )}
    <g transform={`translate(${2 * ins.x} 0) scale(-1 1)`}>
      <Figure x={ins.x} y={ins.y} scale={s} facing={1} pose={pose} head={INSPECTOR.head} coat={INSPECTOR.coat} brows="flat" lids={0.3}
        mouth="flat" look={ins.walking ? { x: 0.8, y: 0.1 } : tap ? { x: 0.5, y: 0.9 } : { x: 1, y: -0.1 }} time={frame} held={CLIPBOARD} />
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
    </g>
  );
}

// ------------------------------------------------------------------------------------------------ the shot

const Street: React.FC<{ frame: number; k: T; cam: Camera; face: Partial<Expression>; wave?: boolean; you?: boolean; dim: number; annoyed?: number; bigCalc?: boolean; ring?: number }> = ({
  frame, k, cam, face, wave = false, you = true, dim, annoyed = 0, bigCalc, ring = 0,
}) => {
  // the doors: open for the last students (line 66), a crack for the late teacher (68), then all at ten
  const late = ramp(frame, k.below + 6, k.below + 14) * (1 - ramp(frame, k.below + 80, k.below + 92));
  const peek = frame >= k.inspector + 30 && frame < k.inspector + 74 ? 0.3 : 0;
  const doors = Math.max(ramp(frame, k.doors, k.doors + 14), late, peek);
  const pose = yourPose(frame, k);
  const me = youAt(frame, k);
  const actors = (
    <>
      {frame >= k.below && frame < k.towers && <LateStudents frame={frame} from={k.below + 4} />}
      <LateTeacher frame={frame} peek={k.inspector + 34} duck={k.inspector + 62} />
      <StreetClock frame={frame} ten={k.ten} />
      <Crowd frame={frame} cam={cam} doors={k.doors} say={k.say} until={k.end} you={{ x: YOU.x, y: YOU.y }} dim={dim} annoyed={annoyed} />
      {you && (
        <Figure x={me.x} y={me.y} scale={YOU.scale} facing={1} pose={pose} {...HERO} {...face} blink={blinking(frame, 0)} time={frame}
          flow={0.2} held={<Letter x={4} y={8} scale={0.45} tilt={-4} />} />
      )}
      <Class frame={frame} k={k} wave={wave} dim={dim} bigCalc={bigCalc} />
      {ring > 0 && <circle cx={1030} cy={980} r={300 + 10 * Math.sin(frame / 5)} fill="none" stroke={CRIMSON} strokeWidth={14} opacity={0.85 * ring} />}
      {frame >= k.inspector && frame < k.wide && <Inspector frame={frame} k={k} />}
      {you && <Bubble frame={frame} at={k.say - 4} until={k.say + 40} x={headAt(me.x, me.y, YOU.scale, pose, 1).x + 40}
        y={headAt(me.x, me.y, YOU.scale, pose, 1).y - 50} text="I got the scholarship." size={52} side="right" />}
      <Stranger frame={frame} />
    </>
  );
  return (
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
      back={<AcademyStreetBack cam={cam} mood="night" frame={frame} view="street" doors={doors} />}
      actors={actors} front={<AcademyStreetFront cam={cam} />} />
  );
};

type View = "steps" | "tv" | "below" | "towers" | "clock" | "inspector" | "ten" | "wide" | "climb" | "you" | "say" | "annoyed" | "dim" | "girl" | "memory" | "boy" | "face" | "list" | "ots";

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const on = current<View>(frame, [
    [0, "steps"], [k.tv, "tv"], [k.below, "below"], [k.towers, "towers"], [k.clock, "clock"], [k.inspector, "inspector"], [k.ten - 6, "ten"], [k.wide, "wide"],
    [k.you, "climb"], [k.raise, "you"], [k.say - 2, "say"], [k.annoyed, "annoyed"], [k.lock, "dim"], [k.girl, "girl"], [k.memory, "memory"], [k.boy, "boy"],
    [k.face, "face"], [k.list, "list"], [k.ots, "ots"],
  ]);
  const mood = moodNow(shot);
  if (on === "tv") {
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <TvShot frame={frame} from={k.tv} screens={k.screens} gag={k.gag} to={k.below} mood="day" />
      </AbsoluteFill>
    );
  }
  if (on === "memory") {
    return <AbsoluteFill style={{ background: "#000" }}><MemoryShot frame={frame} from={k.memory} to={k.boy} mood="dusk" /></AbsoluteFill>;
  }
  if (on === "list") {
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <ListShot frame={frame} from={k.list} tickA={k.list + 8} tickB={k.list + 20} to={k.ots} mood="night" />
      </AbsoluteFill>
    );
  }
  const me = youAt(frame, k);
  const yh = headAt(me.x, me.y, YOU.scale, yourPose(frame, k), 1);
  const mh = headAt(MJ.x, MJ.y, MJ.scale, STAND, -1);
  const ins = inspectorAt(frame, k);
  const cams: Record<Exclude<View, "tv" | "memory" | "list">, Camera> = {
    steps: camAt(frame, [[k.steps, closeUp(yh.x + 30, yh.y, 2.4)], [k.tv, closeUp(yh.x + 30, yh.y, 2.6)]]),
    below: camAt(frame, [[k.below, { x: 700, y: 860, zoom: 1.3 }], [k.towers, { x: 720, y: 850, zoom: 1.36 }]]),
    towers: camAt(frame, [[k.towers, { x: 1000, y: 420, zoom: 1.15 }], [k.clock, { x: 1000, y: 120, zoom: 1.2 }]]),
    clock: camAt(frame, [[k.clock, { x: CLOCK.x - 40, y: CLOCK.y - 40, zoom: 2.6 }], [k.inspector, { x: CLOCK.x - 40, y: CLOCK.y - 50, zoom: 2.9 }]]),
    inspector: camAt(frame, [[k.inspector, { x: Math.min(900, ins.x - 80), y: 860, zoom: 1.4 }], [k.inspector + 30, { x: 680, y: 860, zoom: 1.4 }], [k.ten, { x: 660, y: 860, zoom: 1.5 }]]),
    ten: camAt(frame, [[k.ten - 6, { x: CLOCK.x - 40, y: CLOCK.y - 50, zoom: 3.0 }], [k.wide, { x: CLOCK.x - 40, y: CLOCK.y - 50, zoom: 3.2 }]]),
    wide: camAt(frame, [[k.wide, { x: 980, y: 640, zoom: 0.92 }], [k.you, { x: 960, y: 650, zoom: 0.98 }]]),
    climb: camAt(frame, [[k.you, { x: 470, y: 880, zoom: 1.55 }], [k.raise, { x: 480, y: 850, zoom: 1.7 }]]),
    you: camAt(frame, [[k.raise, closeUp(yh.x + 50, yh.y + 20, 2.3)], [k.say, closeUp(yh.x + 50, yh.y + 10, 2.5)]]),
    // the snap in the hold, then the camera rises until the street is a field of cards
    say: camAt(frame, [[k.say, { x: 820, y: 780, zoom: 1.0 }], [k.rise, { x: 860, y: 720, zoom: 0.86 }], [k.field, { x: 980, y: 600, zoom: 0.47 }],
      [k.annoyed, { x: 980, y: 610, zoom: 0.45 }]]),
    // the laugh: you on the landing with the crowd's sour faces in the foreground
    annoyed: camAt(frame, [[k.annoyed, { x: 560, y: 930, zoom: 1.9 }], [k.lock, { x: 550, y: 925, zoom: 2.05 }]]),
    // every red card points back to your class: the rest dim and the camera pushes in on the red cluster
    dim: camAt(frame, [[k.lock, { x: 980, y: 640, zoom: 0.5 }], [k.lock + 12, { x: 1000, y: 820, zoom: 0.8 }], [k.three, { x: 1010, y: 960, zoom: 1.5 }], [k.girl, { x: 1000, y: 930, zoom: 1.9 }]]),
    girl: camAt(frame, [[k.girl, closeUp(CLASS[0].x + 20, CLASS[0].y - 180, 3.3)], [k.memory, closeUp(CLASS[0].x + 20, CLASS[0].y - 182, 3.45)]]),
    boy: camAt(frame, [[k.boy, closeUp(CLASS[2].x, CLASS[2].y - 210, 3.8)], [k.face, closeUp(CLASS[2].x, CLASS[2].y - 212, 3.95)]]),
    face: camAt(frame, [[k.face, closeUp(yh.x + 40, yh.y, 2.7)], [k.ots, closeUp(yh.x + 40, yh.y, 2.9)]]),
    ots: camAt(frame, [[k.ots, closeUp(mh.x + 30, mh.y - 40, 2.3)], [k.end, closeUp(mh.x + 30, mh.y - 50, 2.45)]]),
  };
  const view = on as Exclude<View, "tv" | "memory" | "list">;
  const cam = drift(cams[view], frame, "tags", on === "say" ? 2 : 3);
  const awed: Partial<Expression> = { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.9, y: 0.4 } };
  const faces: Record<Exclude<View, "tv" | "memory" | "list">, Partial<Expression>> = {
    steps: { ...EXPRESSIONS.sceptical, look: { x: 0.8, y: 0.3 } },
    below: { ...EXPRESSIONS.determined, look: { x: 0.9, y: 0.4 } },
    towers: EXPRESSIONS.determined,
    clock: EXPRESSIONS.determined,
    inspector: { ...EXPRESSIONS.determined, look: { x: 0.9, y: 0.3 } },
    ten: EXPRESSIONS.determined,
    wide: { ...EXPRESSIONS.determined, look: { x: 0.9, y: 0.5 } },
    climb: { ...EXPRESSIONS.determined, look: { x: 0.9, y: 0.2 } },
    you: frame < k.raise ? { ...EXPRESSIONS.determined, look: { x: 0.9, y: 0.5 } } : { brows: "raised", lids: 0, mouth: "open", eyes: 1.15, look: { x: 0.9, y: 0.4 } },
    say: awed,
    annoyed: { brows: "worry", lids: 0, mouth: "smile", eyes: 1.1, look: { x: Math.sin((frame - k.annoyed) / 6) * 0.6 + 0.3, y: 0.5 } },
    dim: awed,
    girl: EXPRESSIONS.determined,
    boy: EXPRESSIONS.determined,
    face: { brows: "angry", lids: mix(0.1, 0.35, ramp(frame, k.face + 20, k.face + 50)), mouth: "flat", eyes: 1, look: { x: 0.85, y: 0.65 } },
    ots: EXPRESSIONS.determined,
  };
  // The close-up on your face takes the signboards' light from below.
  const under = on === "face" ? [{ x: toScreen(cam, yh.x, yh.y).x, y: 1180, r: 700, color: "#ff6f91", strength: 0.35 }] : [];
  const look = setLook(academyLights("street"), mood, cam, { glows: under });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <LookContext.Provider value={look}>
        <Street frame={frame} k={k} cam={cam} face={faces[view]} wave={on === "ots"} you={on !== "ots"} dim={ramp(frame, k.lock, k.lock + 20)}
          annoyed={on === "annoyed" ? ramp(frame, k.annoyed, k.annoyed + 6) : 0} bigCalc={on === "girl"}
          ring={on === "dim" ? ramp(frame, k.lock + 6, k.lock + 14) * (1 - ramp(frame, k.three + 10, k.three + 20)) : 0} />
      </LookContext.Provider>
      {on === "ots" && <YourShoulder side="left" />}
      <MeterSound at={k.say} />
      {[4, 10, 17, 25, 34, 44].map((d, i) => <MeterSound key={d} at={k.say + d} soft={i % 2 === 1} volume={0.55 - i * 0.06} />)}
      {on === "towers" && <AcademyCount frame={frame} from={k.towers + 4} to={k.count} until={k.clock} />}
    </AbsoluteFill>
  );
};

export const thousandTags: Beat = { id: "ThousandTags", firstLine: 66, Component: Scene };
