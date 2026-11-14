// Lines 92-94 of "The Country Holds Its Breath" (HoldsBreath.tsx; v7, outside review of v6): exam morning at the school
// gate, the film's one tender beat. You walk up past the parents (two framings, no long side-scroll); on "and there in
// the crowd" the two parents in front of her step aside and she is there; the light catches her vest's stripes; her
// face; then the laugh: the lunch box "packed like the exam lasts a week", a stack of six tiers the camera tilts up.
// The wordless hold (3.3 s, 2.7 s shorter than v6): your eyes go up the stack; you take it, fingers touch; her mouth
// opens for the words she always says and shuts; one nod; she steps back. Line 93 on her face, nothing over her head;
// the bell; line 94 from inside the yard: the gate slides shut across the frame on "closes", her face behind the bars.
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Sky, Skyline } from "@whatif/kit/sets";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { INK } from "@whatif/kit/theme";
import { headAt } from "../parts";
import { blinking, camAt, current, HERO, linear, mix, ramp } from "../shared";
import { Deep } from "../sets/common";
import type { HoldsTimes as T } from "./HoldsBreath";
import { GATE, GateBack, GateCrowd, JiyoonWithLunch, Parents, TallLunchBox } from "./HoldsBreath.Parts";
import { aimArm, handAt, S, type Body } from "./Notebook.Parts";

const JS = 1.1;
const ME = GATE.you;
const OUT = GATE.jiyoonOut.x;

/** Her face: tired off the night shift, tender. */
const herFace = (frame: number, extra: object = {}) => ({ brows: "worry" as const, lids: 0.12, mouth: "smile" as const, eyes: 1, look: { x: 0.9, y: 0.05 }, blink: blinking(frame, 6), ...extra });

const Gate: React.FC<{ frame: number; cam: Camera; you: React.ReactNode; her: React.ReactNode; part?: number; bell?: number }> = ({
  frame, cam, you, her, part = 0, bell = 0,
}) => (
  <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<GateBack cam={cam} frame={frame} mood="morning" bell={bell} />}
    actors={<>{her}<GateCrowd frame={frame} part={part} />{you}</>} />
);

/** The lunch tower in your hands. */
const yourBox = <TallLunchBox x={4} y={26} scale={0.9} />;
const carry: Pose = { ...STAND, armF: [40, 84], armB: [30, 90] };

// ------------------------------------------------------------------------------------------------ 92: up to the gate

/** "Exam morning. Outside every exam school, parents crowd the gate...": you walk up, the camera with you; then a
 *  closer line of parents along the wall, craning, as you pass. */
export const GateShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.gate, "wide"], [k.crowd, "crowd"]]);
  const x = mix(260, ME, linear(frame, k.gate, k.part - 4));
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.gate, { x: 560, y: 640, zoom: 1.15 }], [k.crowd, { x: 820, y: 640, zoom: 1.2 }]]),
    crowd: camAt(frame, [[k.crowd, { x: 1300, y: 760, zoom: 1.75 }], [k.part, { x: 1240, y: 760, zoom: 1.85 }]]),
  };
  return (
    <Gate frame={frame} cam={drift(cams[shot], frame, "gate", 3)}
      her={<JiyoonWithLunch x={GATE.jiyoon.x} y={GATE.jiyoon.y} scale={JS} frame={frame} face={herFace(frame)} holding={false} out={1} />}
      you={<Figure {...HERO} x={x} y={GATE.floor + 10} scale={S} pose={walkPose(frame * 0.32)} brows="flat" mouth="flat" lids={0.1}
        look={{ x: 0.9, y: 0 }} blink={blinking(frame, 1)} time={frame} />} />
  );
};

/** "...and there in the crowd, straight off the night shift, still in her vest: your sister.": the parents in front of
 *  her step aside, the camera pushes in; her vest's stripes catch the light; her face. */
export const RevealShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.part, "part"], [k.vest, "vest"], [k.sister, "sister"]]);
  const part = ramp(frame, k.part + 4, k.part + 26);
  const step = ramp(frame, k.part + 20, k.vest);
  const herX = mix(GATE.jiyoon.x, OUT, step);
  const head = headAt(herX, GATE.jiyoon.y, JS, STAND, -1);
  const cams: Record<typeof shot, Camera> = {
    part: camAt(frame, [[k.part, { x: 1360, y: 740, zoom: 1.6 }], [k.vest, { x: 1330, y: 720, zoom: 2.0 }]]),
    vest: camAt(frame, [[k.vest, { x: head.x - 10, y: head.y + 150, zoom: 2.7 }], [k.sister, { x: head.x - 10, y: head.y + 140, zoom: 2.85 }]]),
    sister: camAt(frame, [[k.sister, closeUp(head.x - 50, head.y, 2.5)], [k.box, closeUp(head.x - 50, head.y, 2.65)]]),
  };
  return (
    <Gate frame={frame} cam={drift(cams[shot], frame, "reveal", 2)} part={part}
      her={<JiyoonWithLunch x={herX} y={GATE.jiyoon.y} scale={JS} frame={frame} face={herFace(frame, shot === "sister" ? { lids: 0.25 } : {})} holding={false} out={1}
        glint={shot === "vest" ? linear(frame, k.vest + 4, k.sister - 2) : undefined} />}
      you={<Figure {...HERO} x={ME} y={GATE.floor + 10} scale={S} pose={STAND} brows="raised" mouth="flat" lids={0.05} look={{ x: 0.9, y: 0 }}
        blink={blinking(frame, 1)} time={frame} />} />
  );
};

/** "With a lunch box packed like the exam lasts a week.": she brings it up into the foreground in both hands; the
 *  camera starts on her hands and the bottom tier and tilts up, and up, to the knot above her head. */
export const BoxShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const lift = ramp(frame, k.box, k.box + 14);
  const body: Body = { x: OUT, y: GATE.jiyoon.y, scale: JS, facing: -1, pose: { ...STAND, armF: [72, 34] } };
  const hand = handAt(body);
  const top = hand.y + 26 * 0.9 - 6 * 42 * 0.9 * JS - 30;
  const cam = camAt(frame, [[k.box, { x: hand.x + 30, y: hand.y - 10, zoom: 2.9 }], [k.tilt, { x: hand.x + 10, y: hand.y - 40, zoom: 2.7 }],
    [k.react - 4, { x: hand.x - 30, y: top + 60, zoom: 2.3 }]]);
  return (
    <Gate frame={frame} cam={drift(cam, frame, "box", 1.5)} part={1}
      her={<JiyoonWithLunch x={OUT} y={GATE.jiyoon.y} scale={JS} frame={frame} face={herFace(frame, { mouth: "smile", look: { x: 0.9, y: 0.1 } })} holding
        offer={lift} />}
      you={null} />
  );
};

// ------------------------------------------------------------------------------------------------ the hold: the hand-off

/** The wordless hold: your eyes go up the stack; you take it, fingers touching on the bottom tier; her mouth opens and
 *  shuts on the words she always says; one nod; she steps back into the crowd. */
export const HandOffShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.react, "react"], [k.hands, "hands"], [k.nod, "nod"], [k.back, "back"]]);
  const herBody: Body = { x: OUT, y: GATE.jiyoon.y, scale: JS, facing: -1, pose: { ...STAND, armF: [72, 34] } };
  const boxAt = handAt(herBody);
  const handed = frame >= Math.round(mix(k.hands, k.nod, 0.7));
  const out = handed ? ramp(frame, Math.round(mix(k.hands, k.nod, 0.7)), k.nod) : 0;
  const said = frame >= k.nod + 2 && frame < k.nod + 12;
  const nod = linear(frame, k.nod + 12, k.back - 2);
  const leave = ramp(frame, k.back, k.nothing + 10);
  const herX = mix(OUT, 1430, leave);
  const me: Body = { x: ME, y: GATE.floor + 10, scale: S, facing: 1, pose: STAND };
  const reach = aimArm(me, { x: boxAt.x - 30, y: boxAt.y + 10 });
  const reachT = ramp(frame, k.hands - 6, Math.round(mix(k.hands, k.nod, 0.5)));
  me.pose = handed ? carry : { ...STAND, armF: [mix(STAND.armF[0], reach[0], reachT), mix(STAND.armF[1], reach[1], reachT)] };
  const myHead = headAt(me.x, me.y, S, me.pose, 1);
  const herHead = headAt(herX, GATE.jiyoon.y, JS, STAND, -1);
  const up = linear(frame, k.react, k.hands - 4);
  const myFace = shot === "react"
    ? { brows: "raised" as const, lids: 0, mouth: "o" as const, eyes: 1.12, look: { x: 0.7, y: mix(0, -0.9, up) } }
    : { brows: "worry" as const, lids: 0.1, mouth: "flat" as const, eyes: 1.05, look: { x: 0.95, y: -0.05 } };
  const herNow = shot === "nod"
    ? herFace(frame, { mouth: said ? "open" as const : "flat" as const, lids: mix(0.12, 0.45, Math.sin(Math.PI * nod)), brows: said ? "raised" as const : "worry" as const })
    : herFace(frame);
  const cams: Record<typeof shot, Camera> = {
    react: camAt(frame, [[k.react, closeUp(myHead.x + 40, myHead.y - 10, 2.6)], [k.hands, closeUp(myHead.x + 40, myHead.y - 30, 2.5)]]),
    hands: camAt(frame, [[k.hands, { x: (ME + OUT) / 2, y: boxAt.y - 60, zoom: 2.35 }], [k.nod, { x: (ME + OUT) / 2 - 6, y: boxAt.y - 56, zoom: 2.5 }]]),
    nod: camAt(frame, [[k.nod, closeUp(herHead.x - 40, herHead.y, 2.6)], [k.back, closeUp(herHead.x - 40, herHead.y, 2.75)]]),
    back: camAt(frame, [[k.back, { x: 1250, y: 700, zoom: 1.5 }], [k.nothing, { x: 1230, y: 690, zoom: 1.45 }]]),
  };
  const walking = frame >= k.back && leave < 1;
  return (
    <Gate frame={frame} cam={drift(cams[shot], frame, "handoff", 2)} part={1 - ramp(frame, k.back + 6, k.nothing)}
      her={<JiyoonWithLunch x={herX} y={GATE.jiyoon.y} scale={JS} frame={frame} face={herNow} holding={!handed} offer={1} out={out}
        nod={nod} facing={walking ? 1 : -1} walk={walking ? frame * 0.3 : null} />}
      you={<Figure {...HERO} {...me} {...myFace} blink={shot !== "react" && blinking(frame, 3)} time={frame} held={handed ? yourBox : undefined} />} />
  );
};

// ------------------------------------------------------------------------------------------------ 93: nothing opens

/** "Neither of you says a word. Nothing opens. Some faces you don't read.": her face in the crowd and the empty air
 *  over it; then the bell rings and you turn to the gate with the tower. */
export const NothingShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.nothing, "face"], [k.bell, "bell"]]);
  const herHead = headAt(1430, GATE.jiyoon.y, JS, STAND, -1);
  const turned = frame >= k.bell + 14;
  const cams: Record<typeof shot, Camera> = {
    face: camAt(frame, [[k.nothing, closeUp(herHead.x - 30, herHead.y, 2.4)], [k.air, closeUp(herHead.x - 30, herHead.y - 60, 2.3)]]),
    bell: camAt(frame, [[k.bell, { x: 1060, y: 640, zoom: 1.15 }], [k.closes, { x: 1040, y: 640, zoom: 1.2 }]]),
  };
  return (
    <Gate frame={frame} cam={drift(cams[shot], frame, "nothing", 2)} bell={shot === "bell" ? ramp(frame, k.bell, k.bell + 6) : 0}
      her={<JiyoonWithLunch x={1430} y={GATE.jiyoon.y} scale={JS} frame={frame} face={herFace(frame)} holding={false} out={1} />}
      you={<Figure {...HERO} x={ME} y={GATE.floor + 10} scale={S} facing={turned ? -1 : 1} pose={carry} brows="flat" mouth="flat"
        lids={0.1} look={{ x: 0.9, y: 0 }} blink={blinking(frame, 5)} time={frame} held={yourBox} />} />
  );
};

// ------------------------------------------------------------------------------------------------ 94: the gate closes

/** From inside the school yard, looking out: the street, the parents at the gate, your sister among them. */
const InsideBack: React.FC<{ cam: Camera; frame: number; shut: number }> = ({ cam, frame, shut }) => {
  const gap = { from: 560, to: 1360 };
  const panel = gap.to - gap.from;
  const gx = gap.to - panel * shut; // the gate's leading edge slides from behind the right wall to the left pillar
  return (
    <>
      <Deep cam={cam} depth={0.1} flat><Sky id="inside" mood="morning" x={-1400} y={-800} w={4800} h={1600} sunAt={{ x: 400, y: 180 }} /></Deep>
      <Deep cam={cam} depth={0.3} flat><Skyline mood="morning" from={-1400} to={3400} base={560} tall={300} seed={8} /></Deep>
      <Deep cam={cam} depth={0.55} flat>
        <rect x={-1400} y={560} width={4800} height={600} fill="#cfc3aa" />
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-300 + i * 300} y={430} width={240} height={150} fill={["#d9cbb0", "#c7b8a0", "#e2d6bf"][i % 3]} stroke={INK} strokeWidth={4} />)}
      </Deep>
      <Deep cam={cam} depth={0.75}>
        <Parents frame={frame} y={900} s={0.95} xs={[620, 760, 1180, 1300]} seed={4} />
        <JiyoonWithLunch x={960} y={900} scale={0.95} frame={frame} face={herFace(frame, { look: { x: 0.9, y: 0 } })} holding={false} out={1} facing={1} />
      </Deep>
      <Deep cam={cam} depth={0.9}>
        <rect x={-1400} y={880} width={4800} height={600} fill="#bdb09a" />
        {/* the sliding gate: bars on two rails; it rolls out from behind the right wall */}
        <g>
          <rect x={gx} y={520} width={panel} height={16} fill="#3b3e47" />
          <rect x={gx} y={920} width={panel} height={16} fill="#3b3e47" />
          {Array.from({ length: 22 }, (_, i) => <rect key={i} x={gx + 10 + i * 36} y={520} width={12} height={416} fill="#3b3e47" />)}
          <circle cx={gx + 40} cy={950} r={14} fill="#2a2d36" />
          <circle cx={gx + panel - 40} cy={950} r={14} fill="#2a2d36" />
        </g>
        <rect x={-1400} y={480} width={gap.from - 60 + 1400} height={480} fill="#b8644a" stroke={INK} strokeWidth={5} />
        <rect x={gap.to + 60} y={480} width={3400} height={480} fill="#b8644a" stroke={INK} strokeWidth={5} />
        {[gap.from - 60, gap.to].map((px) => <rect key={px} x={px} y={400} width={60} height={560} fill="#e2d6bf" stroke={INK} strokeWidth={5} />)}
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={960} width={4800} height={900} fill="#a99c86" />
      </Deep>
    </>
  );
};

/** "The gate closes behind you.": you walk across the yard away from the gate with the tower of lunch; behind you the
 *  gate rolls shut across the frame on "closes", her face between the bars. */
export const ShutShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shut = ramp(frame, k.closes + 4, k.closes + 30);
  const walk = linear(frame, k.closes, k.exam);
  const pose: Pose = { ...walkPose(frame * 0.3), armF: [40, 84] };
  const cam = drift(camAt(frame, [[k.closes, { x: 960, y: 700, zoom: 1.25 }], [k.exam, { x: 960, y: 690, zoom: 1.35 }]]), frame, "shut", 2);
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<InsideBack cam={cam} frame={frame} shut={shut} />}
      actors={<Figure {...HERO} x={mix(1140, 1640, walk)} y={1070} scale={1.25} facing={1} pose={pose} brows="flat" mouth="flat" lids={0.2}
        look={{ x: 0.9, y: 0 }} time={frame} held={yourBox} />} />
  );
};
