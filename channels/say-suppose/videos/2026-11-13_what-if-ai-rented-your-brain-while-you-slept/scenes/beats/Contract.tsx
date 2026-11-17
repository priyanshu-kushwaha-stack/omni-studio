// Beat "The Contract" (script.md ## [09:06] The Contract; narration lines 71-77). The library kitchen at night under
// one lamp hung over the table. The man in the grey suit seated with a cream contract and a pen; the kitchen clock
// behind him; your brother in the doorway. Two performed moments, the narrator silent:
//
//   71   the room, wide; TOP-DOWN the contract (three coins stamp in its header: triple pay; twelve boxes: a year);
//        close on the broker (a smirk, a tap on the pen); close on you.
//   72   the contract's margin: a doodle draws itself (a sleeper, a screen glowing over the bed with a ball on it, a
//        bottle floating up into a dream cloud); close on you; a page of forty small signatures slides over, each one
//        signing itself.
//   73   close on you, the lamp and the pen; the pen in the lamp's light; closer on you.
//   74   you pick up the pen.
//   hold (3 s, performed) TOP-DOWN the pen goes to the line and touches it; your brother's hand comes down flat on the
//        page, over the line and the pen; the room: he's at your shoulder.
//   75   close on him: "Not yet. Look." (his own voice)
//   hold (3 s, performed) TOP-DOWN he tips the notebook out: pages of crumbs in two columns; the broker looks at them,
//        then at the clock, and stands.
//   76   the broker standing, the clock behind him: "Offer closes midnight." (his own voice)
//   77   INSERT the kitchen clock at eleven.
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { lerpPose, SEATED, STAND } from "@whatif/kit/rig/pose";
import { kitchen } from "@whatif/kit/sets";
import { Chair, Deep, setLook, worldOf } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { CRIMSON, INK, MUSTARD } from "@whatif/kit/theme";
import { Coin } from "../parts";
import { BROTHER, camAt, current, lineEnd, linear, mix, noise, ramp, type Beat, type Shot } from "../shared";
import { aimArm, Broker, Brother, CrumbPage, headOf, mixArm, Notebook, Pen, talk, WallClock, You, type Body, type Face } from "./Contract.Kit";
import { isV5, V5 } from "./V5.Kit";
import { ShoeQuery, shoeSpan } from "./V5.Late";

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i). */
function times(clips: Clip[], start: number, end: number, v3: Clip[]) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const hold1 = lineEnd(clips, 74); // performed: the pen to the line; his hand comes down flat
  const in1 = (p: number) => Math.round(hold1 + (from(75) - hold1) * p);
  const hold2 = lineEnd(clips, 75); // performed: the notebook tipped out; the broker looks, at the clock, stands
  // v5: "Six weeks of crumbs" and "Is that a shoe?" (V5.Late's insert) come before "Offer closes midnight": the pages tip
  // out before the shoe, and he looks at the clock and stands after it
  const v5 = isV5(v3);
  const tipEnd = v5 ? v3[V5.shoe].from - 4 : from(76);
  const in2 = (p: number) => Math.round(hold2 + (tipEnd - hold2) * p);
  const side2 = v5 ? in2(0.7) : in2(0.46);
  const lookClock = v5 ? Math.max(side2 + 2, Math.min(lineEnd(v3, V5.shoe) + 10, from(76) - 6)) : in2(0.62);
  const stand = v5 ? [lookClock + 2, Math.max(lookClock + 3, from(76) - 2)] as const : [in2(0.74), in2(0.98)] as const;
  return {
    start, end,
    contract: at(71, 0.13), coins: at(71, 0.28), year: at(71, 0.44),
    broker: at(71, 0.6), you71: at(71, 0.8),
    // 72 (the margin doodle, the forty signatures) was cut in v5: its one-frame clip would put these keys out of order,
    // so they fold into the frames just before 73, strictly increasing
    ...(clips[72].frames > 1 ? {
      margin: from(72) - 4, screen: at(72, 0.17), cloud: at(72, 0.33), bottle: at(72, 0.4), you72: at(72, 0.55), sigs: at(72, 0.62),
    } : (() => { const b0 = from(73) - 11; return { margin: b0, screen: b0 + 1, cloud: b0 + 2, bottle: b0 + 3, you72: b0 + 4, sigs: b0 + 5 }; })()),
    close73: from(73) - 4, pen73: at(73, 0.42), closer73: at(73, 0.7),
    pick: from(74) - 3, reach: [from(74) - 3, lineEnd(clips, 74)] as const,
    hold1, toLine: [in1(0.02), in1(0.36)] as const, slam: [in1(0.5), in1(0.6)] as const, room1: in1(0.78),
    notYet: [from(75), lineEnd(clips, 75)] as const,
    hold2, tip: v5 ? [in2(0.04), in2(0.55)] as const : [in2(0.04), in2(0.4)] as const, side2, lookClock, stand,
    closes: [from(76), lineEnd(clips, 76)] as const,
    clock: from(77) - 4,
  };
}

// ------------------------------------------------------------------------------------------------ the kitchen, side on

const S = 1.15;
const FLOOR = 960;
const SEAT = 896; // feet on the floor: the seat is a shin above it
const TABLE = { from: 900, to: 1300, top: 836 };
const LAMP = { x: 1100, y: 430 };
const YOU_X = 810;
const BROKER_X = 1390;
/** Drawn on the back wall (depth 0.85): the clock over the fridge and the doorway to the hall. */
const CLOCK = { x: 1580, y: 196, r: 46 };
const DOOR = { x: 2000, w: 230, top: 350 };
const WALL = 0.85;
const seatedY = SEAT + 2 * 56 * S;
const BROTHER_AT_TABLE = 990;

/** The pendant lamp over the table, and the dark beyond its pool of light. */
const LampPool: React.FC = () => (
  <g>
    <defs>
      <radialGradient id="contract-pool" cx={LAMP.x} cy={LAMP.y + 160} r={980} gradientUnits="userSpaceOnUse">
        <stop offset="0.25" stopColor="#0b0d1a" stopOpacity={0} />
        <stop offset="1" stopColor="#0b0d1a" stopOpacity={0.72} />
      </radialGradient>
    </defs>
    <rect x={-1400} y={-900} width={4800} height={2700} fill="url(#contract-pool)" />
  </g>
);

const Lamp: React.FC = () => (
  <g>
    <line x1={LAMP.x} y1={-900} x2={LAMP.x} y2={LAMP.y - 20} stroke={INK} strokeWidth={5} />
    <path d={`M${LAMP.x - 26} ${LAMP.y - 22} H${LAMP.x + 26} L${LAMP.x + 82} ${LAMP.y + 34} H${LAMP.x - 82}Z`} fill="#2f4f4a" stroke={INK} strokeWidth={5}
      strokeLinejoin="round" />
    <ellipse cx={LAMP.x} cy={LAMP.y + 36} rx={40} ry={10} fill="#fff1b8" />
    <polygon points={`${LAMP.x - 80},${LAMP.y + 36} ${LAMP.x + 80},${LAMP.y + 36} ${TABLE.to + 60},${TABLE.top} ${TABLE.from - 60},${TABLE.top}`}
      fill="#fff0b0" opacity={0.12} />
  </g>
);

/** The kitchen table side on; a cream contract flat on it, the pen across it (until you pick it up), pages tipped out. */
const Table: React.FC<{ pen: boolean; pages: number }> = ({ pen, pages }) => (
  <g>
    <rect x={TABLE.from + 20} y={TABLE.top + 20} width={18} height={FLOOR - TABLE.top - 20} fill="#5a3a28" />
    <rect x={TABLE.to - 38} y={TABLE.top + 20} width={18} height={FLOOR - TABLE.top - 20} fill="#5a3a28" />
    <rect x={TABLE.from} y={TABLE.top} width={TABLE.to - TABLE.from} height={24} rx={5} fill="#7a5238" stroke={INK} strokeWidth={5} />
    <rect x={1010} y={TABLE.top - 5} width={180} height={6} rx={2} fill="#f3e9d7" stroke={INK} strokeWidth={2} />
    {pen && <Pen x={1090} y={TABLE.top - 10} tilt={-4} scale={0.9} />}
    {Array.from({ length: Math.round(pages * 5) }, (_, i) => (
      <rect key={i} x={950 + i * 62} y={TABLE.top - 9 - (i % 2) * 3} width={110} height={5} rx={2} fill="#f7f0e0" stroke={INK} strokeWidth={1.5}
        transform={`rotate(${(i % 3) - 1} ${1000 + i * 62} ${TABLE.top})`} />
    ))}
  </g>
);

/** What the room is doing at a frame: who is where and how. */
function cast(frame: number, k: T) {
  // You: seated, hands on the table; you reach for the pen on "You pick up the pen" and hold it after.
  const you: Body = { x: YOU_X, y: seatedY, scale: S, facing: 1, pose: { ...SEATED, lean: 4 } };
  const rest = aimArm(you, { x: 930, y: TABLE.top - 4 });
  const pen = aimArm(you, { x: 1080, y: TABLE.top - 8 });
  const lifted = aimArm(you, { x: 1010, y: TABLE.top - 46 });
  const r = ramp(frame, k.reach[0], mix(k.reach[0], k.reach[1], 0.55));
  const up = ramp(frame, mix(k.reach[0], k.reach[1], 0.55), k.reach[1] + 6);
  const backDown = ramp(frame, k.notYet[0], k.notYet[0] + 12); // pinned under his hand: the pen goes back down
  you.pose = { ...you.pose, armF: frame < k.reach[0] ? rest : mixArm(mixArm(rest, pen, r), lifted, up * (1 - backDown)),
    armB: aimArm(you, { x: 900, y: TABLE.top + 8 }) };
  const youFace: Face = frame < k.broker
    ? { brows: "none", lids: 0.25, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0.4 } }
    : frame < k.close73
      ? { brows: "worry", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 0.7, y: 0.6 } }
      : frame < k.closer73
        ? { brows: "worry", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.5 } }
        : frame < k.hold1
          ? { brows: "angry", lids: 0.25, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0.5 } }
          : frame < k.hold2
            ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.15, look: { x: 0.6, y: -0.8 } }
            : { brows: "worry", lids: 0.1, mouth: "flat", eyes: 1.05, look: { x: 0.9, y: -0.3 } };

  // The broker: seated, then up on his feet when the clock says enough.
  const stand = ramp(frame, k.stand[0], k.stand[1]);
  const broker: Body = { x: BROKER_X + stand * 20, y: mix(seatedY, FLOOR, stand), scale: S, facing: -1,
    pose: lerpPose({ ...SEATED, lean: frame < k.broker || frame >= k.you71 ? -4 : 6 }, { ...STAND, lean: -2 }, stand) };
  const tap = frame >= k.broker && frame < k.you71 ? Math.abs(Math.sin((frame - k.broker) / 5)) : 0;
  broker.pose.armF = mixArm(aimArm(broker, { x: 1130 - tap * 6, y: TABLE.top - 6 - tap * 12 }), [10, 12], stand);
  broker.pose.armB = mixArm(aimArm(broker, { x: 1250, y: TABLE.top + 4 }), [-8, 10], stand);
  const lookClock = frame >= k.lookClock;
  const brokerFace: Face = frame < k.broker
    ? { brows: "none", lids: 0.35, mouth: "smirk", eyes: 0.95, look: { x: 0.8, y: 0.2 } }
    : frame < k.hold2
      ? { brows: frame >= k.hold1 ? "raised" : "flat", lids: frame >= k.hold1 ? 0 : 0.4, mouth: frame >= k.hold1 ? "flat" : "smirk", eyes: 1,
        look: frame >= k.hold1 ? { x: 0.6, y: 0.6 } : { x: 0.9, y: 0.1 } }
      : frame < k.closes[0]
        ? { brows: lookClock ? "flat" : "raised", lids: 0.2, mouth: "flat", eyes: 1, look: lookClock ? { x: -0.7, y: -0.9 } : { x: 0.7, y: 0.7 } }
        : { brows: "flat", lids: 0.4, mouth: talk(frame, k.closes[0], k.closes[1], "flat"), eyes: 1, look: { x: 0.9, y: 0.1 } };

  // Your brother: in the doorway, arms folded, until he comes to the table (off screen, under the top-down shot).
  const atTable = frame >= k.slam[0];
  const tipping = ramp(frame, k.tip[0], k.tip[1]);
  const bro: Body = { x: BROTHER_AT_TABLE, y: FLOOR, scale: S, facing: 1, pose: { ...STAND, lean: 10 } };
  if (atTable) {
    bro.pose.armF = frame < k.hold2 ? aimArm(bro, { x: 1060, y: TABLE.top - 4 }) : mixArm([150, 40], [90, 10], tipping);
    bro.pose.armB = [-6, 14];
  } else {
    bro.pose = { ...STAND, lean: 2, armF: [70, 110], armB: [60, 100] };
  }
  const broFace: Face = !atTable
    ? { brows: "flat", lids: 0, mouth: "flat", eyes: 0.9, look: { x: 0.9, y: 0.3 } }
    : { brows: "angry", lids: 0.1, mouth: talk(frame, k.notYet[0], k.notYet[1], "flat"), eyes: 1.05, look: { x: 0.9, y: 0.3 } };
  return { you, youFace, broker, brokerFace, bro, broFace, atTable, tipping };
}

/** The kitchen side on at camera `cam`. */
const Room: React.FC<{ frame: number; k: T; cam: Camera; hideYou?: boolean }> = ({ frame, k, cam, hideYou }) => {
  const c = cast(frame, k);
  const door = worldOf(cam, DOOR.x, FLOOR, WALL);
  const bro = c.atTable ? c.bro : { ...c.bro, x: door.x, facing: -1 as const };
  const options = { ...kitchen.defaults, stove: "kettle" as const, steam: 0, counter: ["mug" as const] };
  const props = { cam, mood: "lamp" as const, frame, options };
  const lampAt = { x: 960 + (LAMP.x - cam.x) * cam.zoom, y: 540 + (LAMP.y + 30 - cam.y) * cam.zoom };
  const look = setLook([], "lamp", cam, { glows: [{ ...lampAt, r: 520 * cam.zoom, color: "#ffd98a", strength: 0.45 }] });
  const back = (
    <>
      {kitchen.Back(props)}
      <Deep cam={cam} depth={WALL} flat>
        <rect x={DOOR.x - DOOR.w / 2 - 16} y={DOOR.top - 16} width={DOOR.w + 32} height={FLOOR - DOOR.top + 16} fill="#8a6446" stroke={INK} strokeWidth={5} />
        <rect x={DOOR.x - DOOR.w / 2} y={DOOR.top} width={DOOR.w} height={FLOOR - DOOR.top} fill="#2b2a38" />
        <rect x={DOOR.x - DOOR.w / 2} y={FLOOR - 120} width={DOOR.w} height={120} fill="#3a3646" />
        <WallClock x={CLOCK.x} y={CLOCK.y} r={CLOCK.r} hour={11} minute={frame >= k.clock ? 0 : 58} />
      </Deep>
    </>
  );
  const actors = (
    <>
      <LampPool />
      {!c.atTable && <Brother body={bro} face={c.broFace} frame={frame} />}
      <Chair x={YOU_X - 6} y={SEAT} scale={S} facing={1} color="#6b4b3a" />
      <Chair x={BROKER_X + 6} y={SEAT} scale={S} facing={-1} color="#6b4b3a" />
      {c.atTable && <Brother body={bro} face={c.broFace} frame={frame}
        held={frame >= k.hold2 && c.tipping < 1 ? <Notebook x={10} y={-30} w={70} h={90} tilt={-40 + c.tipping * 80} /> : undefined} />}
      <Broker body={c.broker} face={c.brokerFace} frame={frame} />
      {!hideYou && <You body={c.you} face={c.youFace} frame={frame}
        held={frame >= mix(k.reach[0], k.reach[1], 0.5) && frame < k.notYet[0] + 12 ? <Pen x={6} y={-4} tilt={-50} scale={0.8} /> : undefined} />}
      <Table pen={frame < mix(k.reach[0], k.reach[1], 0.5) || frame >= k.notYet[0] + 12} pages={ramp(frame, k.tip[0], k.tip[1])} />
      <Lamp />
    </>
  );
  return (
    <LookContext.Provider value={look}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={back} actors={actors} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ the table, top down

/** Contract layout, in the top-down world (REF pixels). */
const PAGE = { x: 960, y: 560, w: 620, h: 860, tilt: -3 };
const MARGIN = { x: PAGE.x + 220, y: PAGE.y + 70 };
const SIGN = { x: PAGE.x - 40, y: PAGE.y + 322 };

/** The margin doodle: a sleeper in bed, a screen glowing over the bed (a ball on it), a dream cloud, a bottle floating up
 *  into it. Pencil lines that draw themselves. */
const Doodle: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const c = "#36507a";
  const t0 = k.margin + 6;
  const bob = ramp(frame, k.bottle, Math.max(k.bottle + 1, k.you72 - 4));
  return (
    <g transform={`translate(${MARGIN.x} ${MARGIN.y})`}>
      <DrawLine d="M-70 90 H70 M-70 90 V60 M70 90 V70 M-70 60 Q-60 52 -40 56 H70 V70" from={t0} to={t0 + 24} color={c} width={3.5} />
      <DrawLine d="M-58 52 m-14 0 a14 12 0 1 0 28 0 a14 12 0 1 0 -28 0" from={t0 + 16} to={t0 + 34} color={c} width={3.5} />
      <DrawLine d="M-40 58 Q0 40 66 62" from={t0 + 28} to={t0 + 46} color={c} width={3.5} />
      {frame >= k.screen && (
        <g opacity={linear(frame, k.screen, k.screen + 10)}>
          <rect x={-10} y={-40} width={70} height={46} rx={4} fill="#cfefff" opacity={0.6} />
          <rect x={-10} y={-40} width={70} height={46} rx={4} fill="none" stroke={c} strokeWidth={3.5} />
          <ellipse cx={25} cy={-17} rx={12} ry={8} fill="#a0603a" />
          <line x1={20} y1={-17} x2={30} y2={-17} stroke="#fff" strokeWidth={1.5} />
          <circle cx={25} cy={-17} r={46} fill="#cfefff" opacity={0.18 + 0.08 * Math.sin(frame / 4)} />
        </g>
      )}
      <DrawLine d="M-80 -110 q-6 -30 22 -34 q8 -24 36 -16 q20 -18 40 0 q26 -4 26 22 q20 12 -2 30 H-74 q-16 -2 -6 -2z" from={k.cloud} to={k.cloud + 28} color={c} width={3.5} />
      {frame >= k.bottle && (
        <g transform={`translate(${mix(30, -20, bob)} ${mix(-50, -118, bob)}) rotate(${mix(10, -20, bob)})`} opacity={linear(frame, k.bottle, k.bottle + 6)}>
          <path d="M-7 18 V-4 Q-7 -10 -3 -14 V-22 H3 V-14 Q7 -10 7 -4 V18Z" fill="#8a6a2a" stroke={c} strokeWidth={2.5} />
          <rect x={-6} y={0} width={12} height={8} fill="#f3e9d7" />
        </g>
      )}
    </g>
  );
};

/** A page of forty small signatures, each one signing itself. */
const Signatures: React.FC<{ frame: number; at: number; end: number }> = ({ frame, at, end }) => {
  if (frame < at) return null;
  const slide = ramp(frame, at, at + 14);
  const step = Math.max(2, (end - at - 22) / 40);
  return (
    <g transform={`translate(${mix(1900, 1010, slide)} ${545}) rotate(${mix(14, 4, slide)})`}>
      <rect x={-342} y={-436} width={700} height={880} rx={8} fill="#000" opacity={0.25} />
      <rect x={-350} y={-445} width={700} height={880} rx={8} fill="#fbf5e8" stroke="#cdbfa6" strokeWidth={3} />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-300} y={-400 + i * 18} width={i === 5 ? 300 : 600} height={8} rx={4} fill="#9a917f" opacity={0.6} />)}
      {Array.from({ length: 40 }, (_, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const x = -290 + col * 150, y = -260 + row * 66;
        const a = noise(i + 3) * 10, b = noise(i + 40) * 14;
        const d = `M${x} ${y} q${8 + a} -${18 + b} ${14} -2 q${4} ${12} ${12 + a} -${6 + a / 2} q${6} -${10} ${10} ${4} q${8} ${8} ${20 + b} -${10} q${6} ${8} ${30} ${2}`;
        const from = Math.round(at + 18 + i * step);
        return (
          <g key={i}>
            <line x1={x - 6} y1={y + 8} x2={x + 110} y2={y + 8} stroke="#b9ad96" strokeWidth={2} />
            <DrawLine d={d} from={from} to={from + 8} color={["#1f2f5a", "#2a2d36", "#3a4a6a"][i % 3]} width={3} />
          </g>
        );
      })}
    </g>
  );
};

/** Your hand with the pen, from the bottom of the frame. */
const YourHand: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <path d={`M${x - 330} 1300 Q${x - 210} ${y + 220} ${x - 30} ${y + 40}`} fill="none" stroke={INK} strokeWidth={44} strokeLinecap="round" />
    <Pen x={x + 22} y={y - 40} tilt={-62} scale={2.2} />
    <circle cx={x} cy={y} r={38} fill={MUSTARD} stroke={INK} strokeWidth={4} />
  </g>
);

/** Your brother's hand, flat, from the right edge: a palm and four fingers. `press` 0..1 squashes it on landing. */
const FlatHand: React.FC<{ x: number; y: number; s: number; press: number }> = ({ x, y, s, press }) => (
  <g transform={`translate(${x} ${y}) scale(${s * (1 + press * 0.06)})`}>
    <path d="M60 10 Q400 -60 1100 -260" fill="none" stroke="#5d6470" strokeWidth={70} strokeLinecap="round" />
    <path d="M60 10 Q400 -60 1100 -260" fill="none" stroke={INK} strokeWidth={4} opacity={0.4} />
    <ellipse cx={0} cy={0} rx={70} ry={62} fill={BROTHER.head} stroke={INK} strokeWidth={4} />
    {[-48, -18, 14, 44].map((dy, i) => (
      <rect key={i} x={-150 + Math.abs(dy) * 0.4} y={dy - 13} width={100} height={26} rx={13} fill={BROTHER.head} stroke={INK} strokeWidth={3.5} />
    ))}
    <rect x={-40} y={52} width={70} height={24} rx={12} fill={BROTHER.head} stroke={INK} strokeWidth={3.5} transform="rotate(30 -5 64)" />
  </g>
);

const Table3D: React.FC<{ frame: number; k: T; cam: Camera }> = ({ frame, k, cam }) => {
  const coins = [0, 1, 2].map((i) => ramp(frame, k.coins + i * 6, k.coins + i * 6 + 8));
  const months = linear(frame, k.year, k.year + 36);
  const hand = ramp(frame, k.toLine[0], k.toLine[1]);
  const touch = frame >= k.toLine[1] + 4;
  const handAt = { x: mix(SIGN.x - 260, SIGN.x - 46, hand), y: mix(SIGN.y + 260, SIGN.y + 22, hand) + (touch ? 4 : 0) };
  const slam = ramp(frame, k.slam[0], k.slam[1]);
  const press = frame >= k.slam[1] ? Math.max(0, 1 - (frame - k.slam[1]) / 6) : 0;
  const pages = [
    { x: 650, y: 380, t: -12 }, { x: 1250, y: 330, t: 9 }, { x: 640, y: 790, t: 7 }, { x: 1290, y: 760, t: -8 }, { x: 960, y: 560, t: 3 },
  ];
  const actors = (
    <>
      <defs>
        <radialGradient id="contract-top-pool" cx={960} cy={480} r={1100} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffe2a8" stopOpacity={0.35} />
          <stop offset="0.5" stopColor="#0b0d1a" stopOpacity={0} />
          <stop offset="1" stopColor="#0b0d1a" stopOpacity={0.7} />
        </radialGradient>
      </defs>
      <rect x={-1200} y={-900} width={4400} height={2900} fill="#6e4a33" />
      {Array.from({ length: 16 }, (_, i) => <line key={i} x1={-1200} x2={3200} y1={-500 + i * 150} y2={-500 + i * 150 + 20} stroke="#4a2f20" strokeWidth={5} opacity={0.6} />)}
      {/* the contract */}
      <g transform={`translate(${PAGE.x} ${PAGE.y}) rotate(${PAGE.tilt})`}>
        <rect x={-PAGE.w / 2 + 14} y={-PAGE.h / 2 + 18} width={PAGE.w} height={PAGE.h} rx={8} fill="#000" opacity={0.3} />
        <rect x={-PAGE.w / 2} y={-PAGE.h / 2} width={PAGE.w} height={PAGE.h} rx={8} fill="#f6ecd6" stroke="#cdbfa6" strokeWidth={3} />
        <rect x={-PAGE.w / 2 + 40} y={-PAGE.h / 2 + 50} width={300} height={22} rx={8} fill="#5a5448" />
        <circle cx={PAGE.w / 2 - 80} cy={-PAGE.h / 2 + 80} r={42} fill={CRIMSON} opacity={0.85} />
        <circle cx={PAGE.w / 2 - 80} cy={-PAGE.h / 2 + 80} r={30} fill="none" stroke="#f6ecd6" strokeWidth={3} opacity={0.7} />
        {coins.map((c, i) => c > 0 && (
          <g key={i} transform={`translate(${-PAGE.w / 2 + 70 + i * 62} ${-PAGE.h / 2 + 130}) scale(${0.6 + 0.4 * c})`} opacity={c}>
            <Coin x={0} y={0} r={24} tilt={i * 20} />
          </g>
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i}>
            <rect x={-PAGE.w / 2 + 50 + i * 30} y={-PAGE.h / 2 + 180} width={24} height={24} rx={3} fill="none" stroke="#7a705e" strokeWidth={2} />
            {months * 12 > i && <rect x={-PAGE.w / 2 + 54 + i * 30} y={-PAGE.h / 2 + 184} width={16} height={16} rx={2} fill={CRIMSON} opacity={0.7} />}
          </g>
        ))}
        {Array.from({ length: 13 }, (_, i) => (
          <rect key={i} x={-PAGE.w / 2 + 40} y={-PAGE.h / 2 + 240 + i * 34} width={[380, 400, 360, 410, 300][i % 5]} height={10} rx={5} fill="#9a917f" opacity={0.7} />
        ))}
        <line x1={-PAGE.w / 2 + 60} y1={SIGN.y - PAGE.y + 12} x2={60} y2={SIGN.y - PAGE.y + 12} stroke={INK} strokeWidth={3} />
        <path d={`M${-PAGE.w / 2 + 60} ${SIGN.y - PAGE.y - 14} l16 16 m0 -16 l-16 16`} stroke={INK} strokeWidth={3} />
      </g>
      {frame < k.hold1 && <Pen x={1250} y={900} tilt={-30} scale={2.2} />}
      {frame >= k.margin && frame < k.hold1 && <Doodle frame={frame} k={k} />}
      <Signatures frame={frame} at={k.sigs} end={k.close73} />
      {/* the notebook tipped out: pages slide across the contract */}
      {frame >= k.hold2 && pages.map((p, i) => {
        const t = ramp(frame, k.tip[0] + i * 4, k.tip[1] - (4 - i) * 2);
        return <CrumbPage key={i} x={mix(1650, p.x, t)} y={mix(140, p.y, t)} tilt={mix(-30, p.t, t)} kind={i} w={300} h={400} />;
      })}
      {frame >= k.hold2 && <Notebook x={mix(1600, 1720, ramp(frame, k.tip[0], k.tip[1]))} y={120} tilt={-60 + 30 * ramp(frame, k.tip[0], k.tip[1])} w={300} h={400} />}
      {frame >= k.hold1 && frame < k.hold2 && <YourHand x={handAt.x} y={handAt.y} />}
      {frame >= k.slam[0] && frame < k.hold2 && <FlatHand x={mix(2300, SIGN.x + 60, slam)} y={mix(-200, SIGN.y - 30, slam)} s={1.25} press={press} />}
      <rect x={-1200} y={-900} width={4400} height={2900} fill="url(#contract-top-pool)" />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={null} actors={actors} />;
};

/** The kitchen clock, close: eleven. */
const ClockInsert: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.clock, { x: 960, y: 540, zoom: 1 }], [k.end, { x: 960, y: 540, zoom: 1.12 }]]), frame, "clock", 4);
  const actors = (
    <>
      <rect x={-1000} y={-800} width={4000} height={2800} fill="#3e4a44" />
      <rect x={-1000} y={-800} width={4000} height={2800} fill="url(#clock-pool)" />
      <defs>
        <radialGradient id="clock-pool" cx={760} cy={900} r={1200} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffd98a" stopOpacity={0.35} />
          <stop offset="1" stopColor="#0b0d1a" stopOpacity={0.6} />
        </radialGradient>
      </defs>
      <WallClock x={960} y={540} r={330} hour={11} minute={0} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={null} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ the cut

const youHead = () => headOf({ x: YOU_X, y: seatedY, scale: S, facing: 1, pose: { ...SEATED, lean: 4 } });
const brokerHead = () => headOf({ x: BROKER_X, y: seatedY, scale: S, facing: -1, pose: SEATED });

const ContractShot: React.FC<{ frame: number; k: T; v3: Clip[] }> = ({ frame, k, v3 }) => {
  if (isV5(v3)) {
    const shoe = shoeSpan(v3);
    if (frame >= shoe.from && frame < shoe.to) return <ShoeQuery frame={frame} v3={v3} />;
  }
  // v1 72 (the margin doodle, the signatures) is cut: its shots fold into one-frame slots before 73, so they leave the
  // cut list (they flashed for 7 frames between "...for a year" and "Sign")
  const cut72 = k.sigs - k.margin <= 5;
  const shot = current(frame, [[k.start, "wide"], [k.contract, "contract"], [k.broker, "broker"], [k.you71, "you71"],
    ...(cut72 ? [] : [[k.margin, "margin"], [k.you72, "you72"], [k.sigs, "sigs"]] as [number, string][]), [k.close73, "close73"], [k.pen73, "pen73"], [k.closer73, "closer73"], [k.pick, "pick"],
    [k.hold1, "hand"], [k.room1, "room1"], [k.notYet[0], "notYet"], [k.hold2, "tip"], [k.side2, "side2"], [k.closes[0], "closes"],
    [k.clock, "clock"]]);
  if (shot === "clock") return <ClockInsert frame={frame} k={k} />;
  const y = youHead(), b = brokerHead();
  const top = ["contract", "margin", "sigs", "hand", "tip"].includes(shot);
  const cams: Record<string, Camera> = {
    wide: camAt(frame, [[k.start, { x: 1330, y: 600, zoom: 1.12 }], [k.contract, { x: 1300, y: 610, zoom: 1.2 }]]),
    // v7 (owner, G3 note 3): one slow push onto the contract's terms; it used to pull from 2.3 back to 1.6 in 1.6 s under
    // the line, just before the cut
    contract: camAt(frame, [[k.contract, { x: 900, y: 420, zoom: 2.0 }], [k.broker, { x: 885, y: 375, zoom: 2.3 }]]),
    broker: camAt(frame, [[k.broker, closeUp(b.x - 60, b.y + 30, 2.5)], [k.you71, closeUp(b.x - 60, b.y + 30, 2.7)]]),
    you71: camAt(frame, [[k.you71, closeUp(y.x + 60, y.y + 30, 2.5)], [k.margin, closeUp(y.x + 60, y.y + 30, 2.75)]]),
    margin: camAt(frame, [[k.margin, insert(MARGIN.x - 10, MARGIN.y + 10, 3.4)], [k.cloud, insert(MARGIN.x - 10, MARGIN.y - 20, 3.2)],
      [k.you72, insert(MARGIN.x - 10, MARGIN.y - 50, 3.5)]]),
    you72: camAt(frame, [[k.you72, closeUp(y.x + 70, y.y + 40, 2.6)], [k.sigs, closeUp(y.x + 70, y.y + 40, 2.8)]]),
    sigs: camAt(frame, [[k.sigs, { x: 1010, y: 545, zoom: 1.15 }], [k.close73, { x: 990, y: 520, zoom: 1.55 }]]),
    close73: camAt(frame, [[k.close73, { x: 930, y: 640, zoom: 2.0 }], [k.pen73, { x: 930, y: 650, zoom: 2.15 }]]),
    pen73: camAt(frame, [[k.pen73, insert(1080, TABLE.top - 40, 3.6)], [k.closer73, insert(1060, TABLE.top - 50, 3.9)]]),
    closer73: camAt(frame, [[k.closer73, closeUp(y.x + 40, y.y + 20, 2.8)], [k.pick, closeUp(y.x + 40, y.y + 20, 3.1)]]),
    pick: camAt(frame, [[k.pick, { x: 960, y: 740, zoom: 1.7 }], [k.hold1, { x: 980, y: 740, zoom: 1.8 }]]),
    hand: camAt(frame, [[k.hold1, { x: SIGN.x - 100, y: SIGN.y - 20, zoom: 1.9 }], [k.slam[0], { x: SIGN.x - 60, y: SIGN.y - 40, zoom: 2.1 }],
      [k.room1, { x: SIGN.x - 40, y: SIGN.y - 60, zoom: 2.2 }]]),
    room1: camAt(frame, [[k.room1, { x: 1060, y: 680, zoom: 1.5 }], [k.notYet[0], { x: 1050, y: 680, zoom: 1.55 }]]),
    notYet: camAt(frame, [[k.notYet[0], closeUp(BROTHER_AT_TABLE + 70, 640, 2.6)], [k.hold2, closeUp(BROTHER_AT_TABLE + 70, 640, 2.8)]]),
    tip: camAt(frame, [[k.hold2, { x: 1080, y: 500, zoom: 1.1 }], [k.side2, { x: 1040, y: 520, zoom: 1.25 }]]),
    side2: camAt(frame, [[k.side2, { x: 1300, y: 600, zoom: 1.6 }], [k.lookClock, { x: 1380, y: 520, zoom: 1.45 }], [k.closes[0], { x: 1420, y: 480, zoom: 1.45 }]]),
    closes: camAt(frame, [[k.closes[0], { x: 1480, y: 480, zoom: 1.55 }], [k.clock, { x: 1490, y: 470, zoom: 1.65 }]]),
  };
  const cam = drift(cams[shot], frame, "contract", top ? 2 : 3);
  return top ? <Table3D frame={frame} k={k} cam={cam} /> : <Room frame={frame} k={k} cam={cam} />;
};

/** The pages tip out (paper), the pen touches, his hand lands (a soft thud), and the clock ticks at eleven. */
const ContractSound: React.FC<{ k: T }> = ({ k }) => (
  <>
    <Sequence from={k.slam[1]} durationInFrames={12}><Audio src={staticFile("sfx/knock.wav")} volume={0.35} /></Sequence>
    {[0, 6, 12].map((d) => (
      <Sequence key={d} from={k.tip[0] + d} durationInFrames={16}><Audio src={staticFile("sfx/paper.wav")} volume={0.5} /></Sequence>
    ))}
    {[0, 30].map((d) => (
      <Sequence key={d} from={k.clock + 4 + d} durationInFrames={6}><Audio src={staticFile("sfx/tick.wav")} volume={0.4} /></Sequence>
    ))}
  </>
);

const Contract: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = times(shot.clips, shot.from, shot.to, shot.v3);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ContractShot frame={shot.frame} k={k} v3={shot.v3} />
      <ContractSound k={k} />
    </AbsoluteFill>
  );
};

export const contract: Beat = { id: "contract", firstLine: 71, Component: Contract };
