// Beat "Midnight" (script.md ## [11:08] Midnight; narration lines 86-89). Your room at night. The clock at eleven
// fifty-eight; you by the bedside drawer, the pen in one hand, the band in the other, its teal light on; your brother on
// the top bunk, his band in his hand, watching you. Two performed moments, the narrator silent:
//
//   86   INSERT the clock, 11:58; you at the drawer; INSERT the band in your hand, its light on; your brother watching.
//   87   close on you; you look at the pages on the bunk, then decide.
//   hold (3 s, performed) the drawer opens; your band goes in and its light goes out; your brother leans down from the
//        top bunk and drops his on top (click); INSERT his foot shuts the drawer.
//   hold (3 s, performed) three knocks at the front door; you both look at the door; nobody moves; the knocking stops;
//        steps go down the stairs.
//   125  (v5) the landing outside your shut door, lit: the grey suit waits; "Nobody opens." he goes down the stairs.
//   88   you lie down with nothing on your forehead; the jar, as full as it will ever be; "Yours is the only window on
//        the street not working": the hundred windows at night, every pane lit but yours.
//   89   the room, wide: nothing above the blanket where the pale second you used to type. Nobody's typing.
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { INK, PAPER, TEAL } from "@whatif/kit/theme";
import { FONT } from "@whatif/kit/fonts";
import { Band, BandBox } from "../parts";
import { windowIndex, WindowStreetScene, WS, yourWindow } from "../sets/WindowStreet";
import { BunkRoom, BUNK } from "../sets/BunkRoom";
import { BrotherInBed, brotherLying } from "./Midnight.Brother";
import { blinking, BROKER, BROTHER, camAt, current, GHOST, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { aimArm, handAt, headOf, Pen, talk, WallClock, You, type Body, type Face } from "./Contract.Kit";
import { atV, isV5, V5 } from "./V5.Kit";

type T = ReturnType<typeof times>;

function times(clips: Clip[], start: number, end: number, v3: Clip[]) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const holdA = lineEnd(clips, 87); // performed: the drawer
  // v5: "Scam. Told you." once the drawer is shut, the knock, "Come back Thursday." (him grinning down from the top
  // bunk at the door), then "Nobody opens." over the steps going down. Before v5 the two holds shared the gap to 88.
  const v5 = isV5(v3);
  const aEnd = v5 ? Math.max(v3[V5.scam].from - 2, holdA + 60) : Math.round(holdA + (holdA + 90 > from(88) ? (from(88) - holdA) / 2 : 90));
  const inA = (p: number) => Math.round(holdA + (aEnd - holdA) * p);
  const scam = aEnd;
  const holdB = v5 ? Math.max(lineEnd(v3, V5.scam) + 4, scam + 24) : aEnd; // performed: the knock
  const bEnd = v5 ? Math.max(v3[V5.thursday].from - 3, holdB + 40) : from(88) - 3;
  const inB = (p: number) => Math.round(holdB + (bEnd - holdB) * p);
  const thursday = bEnd;
  const stepsAt = v5 ? Math.max(lineEnd(v3, V5.thursday) + 4, thursday + 20) : from(88) - 2;
  const lie = Math.max(from(88) - 3, stepsAt + 1);
  return {
    start, end,
    you86: at(86, 0.22), band86: at(86, 0.5), bro86: at(86, 0.78),
    close87: from(87) - 3, pages87: at(87, 0.35), decide87: at(87, 0.7),
    holdA, open: [inA(0.02), inA(0.14)] as const, bandIn: [inA(0.14), inA(0.32)] as const, out: inA(0.3),
    lean: [inA(0.34), inA(0.5)] as const, drop: [inA(0.52), inA(0.66)] as const, click: inA(0.66),
    footShot: inA(0.7), shut: [inA(0.76), inA(0.92)] as const,
    scam, scamLine: v5 ? [v3[V5.scam].from, lineEnd(v3, V5.scam)] as const : [scam, scam] as const,
    holdB, knocks: [inB(0.06), inB(0.17), inB(0.28)], look: inB(0.12), youLook: inB(0.42), broLook: inB(0.68),
    thursday, thursdayLine: v5 ? [v3[V5.thursday].from, lineEnd(v3, V5.thursday)] as const : [thursday, thursday] as const,
    stepsAt,
    lie, jar88: at(88, 0.45), shut88: at(88, 0.66), eyes88: at(88, 0.86),
    wide89: from(89) - 3,
    // v6 review, on v5's lines: "The man in the grey suit, at midnight, for your answer." (v5 125) the landing outside
    // your shut door, lit, him waiting there; "Nobody opens." he turns and goes down the stairs (the steps follow him).
    // "Yours is the only window on the street not working." (v5 126 at 0.58) the hundred windows at night, every pane
    // lit with a typist but yours.
    ...(v5 ? (() => {
      const leave = Math.min(lie - 8, Math.max(stepsAt + 20, atV(v3, V5.nobody, 0.72)));
      const st = (p: number) => Math.round(leave + (lie - leave) * p);
      return { landing: stepsAt, leave, windows: Math.max(lie + 2, at(88, 0.58)), steps: [st(0.08), st(0.3), st(0.52), st(0.74)] };
    })() : { landing: lie - 2, leave: lie - 1, windows: from(89) - 4, steps: [inB(0.7), inB(0.78), inB(0.86), inB(0.94)] }),
  };
}

// ------------------------------------------------------------------------------------------------ the room (KEY px)

const S = 3.0;
const YOU = { x: 410, feet: 1250 };
const DRAWER = { x: 100, y: 870 };
function brotherAt(frame: number, k: T) {
  const lean = ramp(frame, k.lean[0], k.lean[1]);
  // while he whispers "Come back Thursday." his hand comes up by his mouth (the cupped hand Room draws)
  const talking = frame >= k.thursday && frame < k.stepsAt;
  const b = brotherLying(lean, talking);
  return { hand: b.hand, head: b.head, lean, talking };
}

/** Your brother on the top bunk, lying in bed, leaning down; his band in his hand until he drops it (G3: a figure in
 *  bed, Midnight.Brother.tsx, not the rotated rig that read as a grey wedge). */
const BrotherLean: React.FC<{ frame: number; k: T; face: Face }> = ({ frame, k, face }) => {
  const b = brotherAt(frame, k);
  return (
    <BrotherInBed lean={b.lean} talking={b.talking} face={face} blink={blinking(frame, 3)}
      holding={frame < k.drop[0] ? <Band x={0} y={12} scale={0.55} lit tilt={10} /> : undefined} />
  );
};

function you(frame: number, k: T) {
  // You step aside (right) while he leans down to drop his band and shut the drawer, and back for the knock.
  // v5: you stay aside through "Come back Thursday." so his head, leaning down, never sits over yours
  const aside = ramp(frame, k.lean[0], k.lean[1]) * (1 - ramp(frame, k.stepsAt + 4, k.stepsAt + 24));
  // and further aside while he talks down from the bunk (123-124), so his head, leaning down, is clear of yours
  const clear = ramp(frame, k.footShot, k.scam) * (1 - ramp(frame, k.stepsAt + 4, k.stepsAt + 24));
  const body: Body = { x: YOU.x + 170 * aside + 330 * clear, y: YOU.feet, scale: S, facing: -1, pose: { ...STAND, lean: 6 } };
  const opening = ramp(frame, k.open[0], k.open[1]);
  const into = ramp(frame, k.bandIn[0], k.bandIn[1]);
  const shown = frame >= k.band86 && frame < k.close87 ? 1 : 0;
  // The band hand: low at your side, lifted to look at (86), to the drawer (hold A), then back to your side.
  const side = { x: body.x - 50, y: 950 };
  const lifted = { x: YOU.x - 110, y: 760 };
  const drawer = { x: DRAWER.x + 40, y: DRAWER.y - 10 };
  const target = frame < k.holdA ? (shown ? lifted : side) : into < 1 ? { x: mix(drawer.x + 60, drawer.x, into), y: mix(drawer.y - 40, drawer.y, into) } : side;
  const t = frame >= k.holdA && frame < k.bandIn[0] ? { x: mix(side.x, drawer.x + 60, opening), y: mix(side.y, drawer.y - 40, opening) } : target;
  body.pose = { ...body.pose, armF: aimArm(body, t), armB: aimArm(body, { x: body.x + 50, y: 950 }) };
  return body;
}

const Room: React.FC<{ frame: number; k: T; view: { x: number; y: number; zoom: number }; lying?: boolean }> = ({ frame, k, view, lying }) => {
  const body = you(frame, k);
  const lookDoor = frame >= k.look && frame < k.lie;
  const face: Face = frame < k.close87
    ? { brows: "worry", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.5 } }
    : frame < k.pages87
      ? { brows: "worry", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.7, y: 0.6 } }
      : frame < k.decide87
        ? { brows: "none", lids: 0.15, mouth: "flat", eyes: 1, look: { x: -0.8, y: 0.5 } }
        : frame < k.holdB
          ? { brows: "angry", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0.5 } }
          : lookDoor
            ? { brows: "raised", lids: 0, mouth: "flat", eyes: 1.2, look: { x: -1, y: 0 } }
            : { brows: "none", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 0.5, y: 0.2 } };
  const broFace: Face = frame >= k.scam && frame < k.holdB
    ? { brows: "flat", lids: 0.35, mouth: talk(frame, k.scamLine[0], k.scamLine[1], "smirk"), eyes: 1, look: { x: 0.3, y: 0.9 } }
    : frame >= k.thursday && frame < k.stepsAt
      ? { brows: "raised", lids: 0.1, mouth: talk(frame, k.thursdayLine[0], k.thursdayLine[1], "smile"), eyes: 1.1, look: { x: -0.8, y: -0.4 } }
      : frame < k.holdB
    ? { brows: "flat", lids: 0, mouth: "flat", eyes: 1, look: { x: 0.2, y: 0.9 } }
    : lookDoor
      ? { brows: "raised", lids: 0, mouth: "flat", eyes: 1.2, look: { x: -0.8, y: -0.4 } }
      : { brows: "none", lids: 0, mouth: "flat", eyes: 1, look: { x: 0.2, y: 0.9 } };
  const b = brotherAt(frame, k);
  const lit = frame < k.out;
  const into = ramp(frame, k.bandIn[0], k.bandIn[1]);
  const fall = ramp(frame, k.drop[0], k.drop[1]);
  const shut = ramp(frame, k.shut[0], k.shut[1]);
  const drawerOpen = lying ? 0 : frame < k.holdA ? 0 : ramp(frame, k.open[0], k.open[1]) * (1 - shut);
  if (lying) {
    return (
      <BunkRoom frame={frame} mood="night" view={view} you="noband" youEyes={frame < k.eyes88 ? "open" : "shut"} brother="asleep" brotherBand={false}
        jarFill={0.85} />
    );
  }
  return (
    <BunkRoom frame={frame} mood="night" view={view} you="none" jarFill={0.85}>
      <BrotherLean frame={frame} k={k} face={broFace} />
      {/* "Come back Thursday.": a hand cupped by his mouth, whispered at the door */}
      {frame >= k.thursday && frame < k.stepsAt && <circle cx={b.head.x - 70} cy={b.head.y + 70} r={30} fill={BROTHER.head} stroke={INK} strokeWidth={4} />}
      {/* his band falling to the drawer */}
      {fall > 0 && frame < k.click && <Band x={mix(b.hand.x, DRAWER.x + 60, fall)} y={mix(b.hand.y + 10, DRAWER.y - 30, fall * fall)} scale={0.55} lit
        tilt={fall * 200} />}
      {/* his foot, down off the bunk, pushing the drawer shut */}
      {frame >= k.footShot && frame < k.holdB && (
        <g>
          {/* a short leg, bent at the knee, coming into the top of the insert (not a long pole from the bunk) */}
          <path d={`M${mix(360, 340, shut)} 560 Q${mix(250, 230, shut)} 700 ${mix(330, 250, shut)} ${DRAWER.y + 10}`} fill="none" stroke={BROTHER.coat} strokeWidth={30} strokeLinecap="round" />
          <ellipse cx={mix(318, 238, shut)} cy={DRAWER.y + 26} rx={36} ry={18} fill="#e9e4da" stroke={INK} strokeWidth={4} />
        </g>
      )}
      <You body={body} face={face} frame={frame}
        held={into < 0.99 ? <Band x={0} y={8} scale={0.7} lit={lit} tilt={-20} /> : undefined} />
      {/* the pen in the other hand */}
      <g transform={`translate(${handAt(body, "back").x} ${handAt(body, "back").y})`}><Pen x={0} y={0} tilt={-70} scale={1.5} /></g>
      <defs>
        <radialGradient id="midnight-band-glow">
          <stop offset="0" stopColor={GHOST.light} stopOpacity={0.4} />
          <stop offset="1" stopColor={GHOST.light} stopOpacity={0} />
        </radialGradient>
      </defs>
      {lit && into < 0.99 && <circle cx={handAt(body).x} cy={handAt(body).y} r={180} fill="url(#midnight-band-glow)" opacity={frame >= k.band86 ? 1 : 0.5} />}
      {/* the drawer, once your band is in it: a teal glow in the gap, out when the light goes out */}
      {/* the drawer pulled toward you: its dark inside shows above the front */}
      {drawerOpen > 0.02 && (
        <g>
          <rect x={34} y={DRAWER.y - 20 - 46 * drawerOpen} width={192} height={46 * drawerOpen + 4} fill="#1b1210" stroke={INK} strokeWidth={4} />
          {frame >= k.bandIn[1] && <Band x={130} y={DRAWER.y - 20 - 20 * drawerOpen} scale={0.5} lit={frame < k.out} />}
          {frame >= k.click && <Band x={150} y={DRAWER.y - 26 - 20 * drawerOpen} scale={0.5} lit={false} tilt={12} />}
          <rect x={30 - 6 * drawerOpen} y={DRAWER.y - 20} width={200 + 12 * drawerOpen} height={96 + 8 * drawerOpen} rx={8} fill="#6f4a33" stroke={INK} strokeWidth={5} />
          <circle cx={130} cy={DRAWER.y + 28} r={11} fill="#c9a36b" stroke={INK} strokeWidth={3} />
        </g>
      )}
    </BunkRoom>
  );
};

/** The clock on your wall, close: eleven fifty-eight, the second hand going round. */
const ClockInsert: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.start, { x: 960, y: 540, zoom: 1.0 }], [k.you86, { x: 960, y: 540, zoom: 1.1 }]]), frame, "mclock", 3);
  const sec = ((frame - k.start) / 30) * 6;
  const actors = (
    <>
      <rect x={-1000} y={-800} width={4000} height={2800} fill="#5b4a52" />
      <rect x={-1000} y={-800} width={4000} height={2800} fill="#0b1024" opacity={0.45} />
      <WallClock x={960} y={540} r={330} hour={11} minute={58} />
      <line x1={960} y1={540} x2={960 + Math.sin((sec * Math.PI) / 180) * 290} y2={540 - Math.cos((sec * Math.PI) / 180) * 290} stroke="#d8344f" strokeWidth={6}
        strokeLinecap="round" />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={null} actors={actors} />;
};

/** G3: the landing outside your front door, lit: a warm wall lamp by the door, the door with its HOME label, a doormat,
 *  the stair rail going down to the right (where the grey suit leaves), the ceiling light. World px. */
const LandingSet: React.FC = () => (
  <g>
    <rect x={-1000} y={-800} width={4000} height={2800} fill="#4b4057" />
    {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-1000 + i * 140} y={-800} width={60} height={1760} fill="#55496a" opacity={0.6} />)}
    {/* the wainscot and the floor */}
    <rect x={-1000} y={700} width={4000} height={260} fill="#3a3046" />
    <line x1={-1000} y1={700} x2={3000} y2={700} stroke={INK} strokeWidth={6} />
    <rect x={-1000} y={960} width={4000} height={800} fill="#5e4636" />
    {Array.from({ length: 24 }, (_, i) => <line key={i} x1={-1000 + i * 180} y1={960} x2={-1000 + i * 180 - 60} y2={1400} stroke="#4a3729" strokeWidth={4} />)}
    <line x1={-1000} y1={960} x2={3000} y2={960} stroke={INK} strokeWidth={6} />
    {/* the ceiling light and its pool */}
    <circle cx={1150} cy={200} r={300} fill="#ffd98a" opacity={0.16} />
    <rect x={1110} y={150} width={80} height={36} rx={10} fill="#ffe2a8" stroke={INK} strokeWidth={4} />
    {/* the wall lamp by the door, a warm cone on the wall */}
    <defs>
      <radialGradient id="landing-lamp">
        <stop offset="0" stopColor="#ffd98a" stopOpacity={0.55} />
        <stop offset="1" stopColor="#ffd98a" stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={600} cy={430} r={330} fill="url(#landing-lamp)" />
    <rect x={590} y={440} width={20} height={40} fill="#2a2230" stroke={INK} strokeWidth={4} />
    <path d="M555 440 L645 440 L625 380 L575 380 Z" fill="#ffe2a8" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {/* your front door, shut, lit by the lamp, the HOME label on it */}
    <rect x={720} y={316} width={370} height={650} fill="#3e2819" stroke={INK} strokeWidth={8} />
    <rect x={740} y={330} width={330} height={630} fill="#8a5a3a" stroke={INK} strokeWidth={6} />
    <rect x={740} y={330} width={330} height={630} fill="#ffd98a" opacity={0.12} />
    <rect x={780} y={480} width={250} height={170} rx={6} fill="none" stroke="#5c3a24" strokeWidth={6} />
    <rect x={780} y={680} width={250} height={240} rx={6} fill="none" stroke="#5c3a24" strokeWidth={6} />
    <circle cx={1030} cy={660} r={15} fill="#e0b56b" stroke={INK} strokeWidth={4} />
    <g transform="translate(905 410) rotate(-3)">
      <rect x={-105} y={-40} width={210} height={80} rx={8} fill={PAPER} stroke={INK} strokeWidth={5} />
      <text x={0} y={19} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill={TEAL}>HOME</text>
    </g>
    {/* the doormat */}
    <path d="M760 962 L1050 962 L1080 1000 L730 1000 Z" fill="#9a7a4a" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {[800, 860, 920, 980].map((x) => <line key={x} x1={x} y1={966} x2={x - 6} y2={996} stroke="#7d6038" strokeWidth={5} />)}
    {/* the stairs down, the rail and its posts */}
    <path d="M1560 960 L1560 1010 L1700 1010 L1700 1060 L1840 1060 L1840 1110 L2600 1110 L2600 960 Z" fill="#4a3729" stroke={INK} strokeWidth={5} />
    <rect x={1540} y={640} width={40} height={322} rx={8} fill="#6b4630" stroke={INK} strokeWidth={5} />
    <circle cx={1560} cy={636} r={26} fill="#6b4630" stroke={INK} strokeWidth={5} />
    {[1640, 1730, 1820, 1910, 2000].map((x, i) => <rect key={x} x={x} y={680 + i * 45} width={14} height={300} fill="#6b4630" stroke={INK} strokeWidth={3} />)}
    <path d="M1560 650 L2100 880" stroke={INK} strokeWidth={30} strokeLinecap="round" />
    <path d="M1560 650 L2100 880" stroke="#8a5a3a" strokeWidth={20} strokeLinecap="round" />
  </g>
);

/** Script v6 line 100: the landing outside your front door at midnight. The grey suit knocks, waits, and goes. */
const Landing: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  // v5's knocks are heard before "Come back Thursday": here he only waits at the shut door, then goes
  const gone = ramp(frame, k.leave, k.leave + 70);
  const x = mix(1240, 2200, gone);
  const pose: Pose = frame < k.leave
    ? { ...STAND, armF: [-20, -60], armB: [30, 60] }
    : walkPose(frame * 0.3);
  const cam = drift(camAt(frame, [[k.landing, { x: 1040, y: 600, zoom: 1.25 }], [k.lie, { x: 1080, y: 590, zoom: 1.4 }]]), frame, "landing", 3);
  const actors = (
    <>
      <LandingSet />
      <Figure x={x} y={960} scale={1.6} facing={frame < k.leave ? -1 : 1} pose={pose} head={BROKER.head} coat={BROKER.coat} tie={BROKER.tie}
        brows="flat" lids={0.3} mouth="smirk" look={{ x: 0.9, y: 0 }} blink={blinking(frame, 6)} time={frame} />
      <BandBox x={x + (frame < k.leave ? 50 : -50)} y={700} scale={0.8} color={GHOST.light} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={null} actors={actors} />;
};

/** Script v6 line 101: the hundred windows at night, every pane lit with a sleeper and a typist, but one: yours. */
const OnlyDark: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const Y = yourWindow();
  const mine = windowIndex(WS.yours.col, WS.yours.row);
  // v7 (owner, G3 note 3): a slow push onto your one dark pane (v6 pulled from 2.3 to 1.55 in 3 s under the line)
  const cam = camAt(frame, [[k.windows, { x: Y.x + 30, y: Y.y - 10, zoom: 1.55 }], [Math.max(k.windows + 1, k.wide89), { x: Y.x + 40, y: Y.y, zoom: 1.78 }]]);
  return <WindowStreetScene frame={frame} mood="night" cam={drift(cam, frame, "onlydark", 3)} onAt={(i) => (i === mine ? 1e9 : -999)} coins={false} />;
};

const MidnightShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.start, "clock"], [k.you86, "you86"], [k.band86, "band86"], [k.bro86, "bro86"], [k.close87, "close87"],
    [k.pages87, "pages87"], [k.decide87, "decide87"], [k.holdA, "drawer"], [k.lean[0], "lean"], [k.footShot, "foot"], [k.scam, "scam"], [k.holdB, "knock"], [k.youLook, "youLook"],
    [k.broLook, "broLook"], [k.thursday, "thursday"], [k.stepsAt, "steps"], [k.landing, "landing"], [k.lie, "lie"], [k.jar88, "jar88"], [k.shut88, "shut88"],
    [k.windows, "windows"], [k.wide89, "wide89"]]);
  if (shot === "clock") return <ClockInsert frame={frame} k={k} />;
  if (shot === "landing") return <Landing frame={frame} k={k} />;
  if (shot === "windows") return <OnlyDark frame={frame} k={k} />;
  const yh = headOf(you(frame, k));
  const bh = brotherAt(frame, k).head;
  const bandHand = handAt(you(frame, k));
  const penHand = handAt(you(frame, k), "back");
  const views: Record<string, { x: number; y: number; zoom: number }> = {
    you86: camAt(frame, [[k.you86, { x: 620, y: 470, zoom: 1.0 }], [k.band86, { x: 600, y: 480, zoom: 1.08 }]]),
    // script v6: both hands in frame, the pen in one, the band with its teal light in the other
    // G3: both hands AND your face in frame (v6 cropped your head at the top): the pen in one hand, the band with its
    // teal light in the other, a slow push
    band86: camAt(frame, [[k.band86, { x: (bandHand.x + penHand.x) / 2 + 20, y: 560, zoom: 1.32 }],
      [k.bro86, { x: (bandHand.x + penHand.x) / 2 + 10, y: 555, zoom: 1.42 }]]),
    bro86: camAt(frame, [[k.bro86, { x: bh.x + 120, y: bh.y + 60, zoom: 2.3 }], [k.close87, { x: bh.x + 120, y: bh.y + 60, zoom: 2.45 }]]),
    close87: camAt(frame, [[k.close87, { x: yh.x - 40, y: yh.y + 30, zoom: 2.4 }], [k.pages87, { x: yh.x - 40, y: yh.y + 30, zoom: 2.55 }]]),
    // G3: a cut on "Only the crumbs" to the two of you, him on the top bunk over you, so the close never holds 6 s
    pages87: camAt(frame, [[k.pages87, { x: 640, y: 330, zoom: 1.3 }], [k.decide87, { x: 610, y: 340, zoom: 1.42 }]]),
    decide87: camAt(frame, [[k.decide87, { x: yh.x - 20, y: yh.y + 30, zoom: 2.9 }], [k.holdA, { x: yh.x - 20, y: yh.y + 30, zoom: 3.0 }]]),
    drawer: camAt(frame, [[k.holdA, { x: 400, y: 700, zoom: 1.45 }], [k.lean[0], { x: 380, y: 720, zoom: 1.55 }]]),
    lean: camAt(frame, [[k.lean[0], { x: 640, y: 470, zoom: 1.0 }], [k.footShot, { x: 620, y: 480, zoom: 1.04 }]]),
    foot: camAt(frame, [[k.footShot, { x: 260, y: 780, zoom: 2.2 }], [k.scam, { x: 250, y: 790, zoom: 2.35 }]]),
    scam: camAt(frame, [[k.scam, { x: 720, y: 460, zoom: 1.45 }], [k.holdB, { x: 720, y: 460, zoom: 1.55 }]]),
    knock: camAt(frame, [[k.holdB, { x: 700, y: 500, zoom: 1.0 }], [k.youLook, { x: 700, y: 510, zoom: 1.06 }]]),
    youLook: camAt(frame, [[k.youLook, { x: yh.x - 30, y: yh.y + 30, zoom: 2.5 }], [k.broLook, { x: yh.x - 30, y: yh.y + 30, zoom: 2.6 }]]),
    broLook: camAt(frame, [[k.broLook, { x: bh.x + 80, y: bh.y + 50, zoom: 2.4 }], [k.thursday, { x: bh.x + 80, y: bh.y + 50, zoom: 2.5 }]]),
    thursday: camAt(frame, [[k.thursday, { x: bh.x + 220, y: bh.y + 120, zoom: 1.9 }], [k.stepsAt, { x: bh.x + 220, y: bh.y + 120, zoom: 2.0 }]]),
    steps: camAt(frame, [[k.stepsAt, { x: 760, y: 500, zoom: 1.0 }], [k.lie, { x: 800, y: 500, zoom: 1.05 }]]),
    lie: camAt(frame, [[k.lie, { x: 560, y: 640, zoom: 2.0 }], [k.jar88, { x: 540, y: 650, zoom: 2.15 }]]),
    jar88: camAt(frame, [[k.jar88, { x: BUNK.jar.x + 60, y: BUNK.jar.y - 110, zoom: 2.6 }], [k.shut88, { x: BUNK.jar.x + 60, y: BUNK.jar.y - 110, zoom: 2.8 }]]),
    shut88: camAt(frame, [[k.shut88, { x: 540, y: 640, zoom: 2.2 }], [k.wide89, { x: 560, y: 640, zoom: 2.4 }]]),
    wide89: camAt(frame, [[k.wide89, { x: 960, y: 555, zoom: 1.18 }], [k.end, { x: 960, y: 540, zoom: 1.0 }]]), // v7: gentler
  };
  const v = drift(views[shot], frame, "midnight", 3);
  const lying = frame >= k.lie;
  return <Room frame={frame} k={k} view={v} lying={lying} />;
};

const MidnightSound: React.FC<{ k: T }> = ({ k }) => (
  <>
    <Sequence from={k.click} durationInFrames={6}><Audio src={staticFile("sfx/tick.wav")} volume={0.7} /></Sequence>
    <Sequence from={k.shut[1] - 2} durationInFrames={12}><Audio src={staticFile("sfx/knock.wav")} volume={0.25} /></Sequence>
    {k.knocks.map((f) => <Sequence key={f} from={f} durationInFrames={12}><Audio src={staticFile("sfx/knock.wav")} volume={0.75} /></Sequence>)}
    {k.steps.map((f) => <Sequence key={f} from={f} durationInFrames={12}><Audio src={staticFile("sfx/knock.wav")} volume={0.12} playbackRate={0.85} /></Sequence>)}
  </>
);

const Midnight: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = times(shot.clips, shot.from, shot.to, shot.v3);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <MidnightShot frame={shot.frame} k={k} />
      <MidnightSound k={k} />
    </AbsoluteFill>
  );
};

export const midnight: Beat = { id: "midnight", firstLine: 86, Component: Midnight };
