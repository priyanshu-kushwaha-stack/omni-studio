// Beat "The Night Shift" (script.md ## The Night Shift; narration lines 44-54). The midpoint: the facts land on you one
// at a time, in your room under one lamp, each a drawn sheet, then your brother's stamps.
//
//   44   the bunk room, one lamp: you sitting up awake on the bottom bunk, the band in your hand, not on; your brother
//        above with the notebook open, chuckling. Push in; close on you.
//   45   INSERT the paper clock draws itself; a third of its face shades dark. Close on you: "Did you think it was for
//        nothing?"
//   46   INSERT a paper mouse asleep; in the callout the gaps between its brain cells widen and a tide washes the specks
//        out. Cut to the bin by your bunk, overflowing; the two of you, your brother laughing.
//   47   INSERT 1924: two paper people at a desk, one asleep, one yawning; the awake one's things fall away. Your
//        brother scribbling. INSERT a rat runs a maze, then sleeps, the maze replaying over its head at double speed.
//   48   INSERT your day as a filing cabinet: the drawers fly open, the pages whirl in; then it is shut and the pages lie
//        on the floor, unfiled.
//   49   close on you, the band in your hand (the darling line).
//   50   the bathroom mirror over your shoulder: grey under the eyes, the band's mark; INSERT the boy at the science
//        fair, a tick a day on the clock behind him; back to the mirror, your hand to the mark.
//   51   your brother stops laughing; he gets out the stamp and the sheet of tags.
//   hold (4 s, performed) KEYS on the hook; DOOR on the door; he stands in front of you, looks at the last tag and
//        presses YOU to your forehead; steps back, nods; you look up at it, cross-eyed.
//   52   "Don't peel it." (his voice)
//   53   close on you with the tag; him; the wide as he goes and you sit alone.
//   54   the gown on its hanger on the top bunk's rail.
import { AbsoluteFill } from "remotion";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { drift, ForegroundHead } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { BunkRoom, BUNK, type BunkRoomProps } from "../sets/BunkRoom";
import { current, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { aimArm, handOf, PaperInsert, Sfx, talk } from "./NightShift.Rig";
import { CabinetSheet, ClockSheet, FairSheet, MazeSheet, MemorySheet, MouseSheet } from "./NightShift.Sheets";
import { Bathroom, Bin, broBody, GownHanger, Notebook, SIT_UP, SittingYou, StampTool, StandingBrother, TagSheet, WallInsert, youHead,
  type Face } from "./NightShift.Rooms";

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i). */
function times(clips: Clip[], start: number, end: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const h = lineEnd(clips, 51) + 2; // performed: the stamps
  const inH = (p: number) => Math.round(h + (from(52) - h) * p);
  return {
    start, end,
    closeYou: at(44, 0.52), // "There was no spare time."
    clock: from(45) - 2, shade: [at(45, 0.1), at(45, 0.5)] as const, youThird: at(45, 0.64), // "Did you think it was for nothing?"
    mouse: from(46) - 2, widen: [at(46, 0.16), at(46, 0.34)] as const, tide: [at(46, 0.34), at(46, 0.6)] as const,
    bin: at(46, 0.62), // "Sleep is when your brain takes the trash out."
    youMonth: at(46, 0.84), // "Yours hasn't in a month."
    memory: from(47) - 2, loss: [at(47, 0.1), at(47, 0.42)] as const,
    brotherReads: at(47, 0.45),
    maze: at(47, 0.55), run: [at(47, 0.58), at(47, 0.79)] as const, sleep: at(47, 0.8), replay: [at(47, 0.82), at(47, 0.99)] as const,
    cabinet: from(48) - 2, open: [at(48, 0.04), at(48, 0.1)] as const, whirl: [at(48, 0.1), at(48, 0.46)] as const,
    shut: at(48, 0.52), fall: [at(48, 0.55), at(48, 0.9)] as const,
    shift: from(49) - 2, lookUp: at(49, 0.45),
    mirror: from(50) - 2, fair: at(50, 0.3), ticks: [at(50, 0.38), at(50, 0.82)] as const, mirror2: at(50, 0.85),
    stops: from(51) - 2, flat: at(51, 0.12), stampOut: at(51, 0.55),
    h, keysAt: inH(0.13), door: inH(0.24), doorAt: inH(0.34), press: inH(0.45), lift: inH(0.5), pressAt: inH(0.62),
    back: inH(0.74), nod: [inH(0.78), inH(0.98)] as const, cross: inH(0.8),
    peel: [from(52), lineEnd(clips, 52)] as const, closer: from(52) - 2,
    alone: from(53) - 2, bro53: at(53, 0.36), wide53: at(53, 0.6), go: [at(53, 0.66), lineEnd(clips, 53)] as const,
    gown: from(54) - 2,
  };
}

type Name = "room" | "closeYou" | "clock" | "youThird" | "mouse" | "bin" | "youMonth" | "memory" | "brotherReads" | "maze"
  | "cabinet" | "shift" | "mirror" | "fair" | "mirror2" | "stops" | "stampOut" | "hook" | "door" | "press" | "closer"
  | "alone" | "bro53" | "wide53" | "gown";

const shotAt = (f: number, k: T): Name => current<Name>(f, [[k.start, "room"], [k.closeYou, "closeYou"], [k.clock, "clock"],
  [k.youThird, "youThird"], [k.mouse, "mouse"], [k.bin, "bin"], [k.youMonth, "youMonth"], [k.memory, "memory"],
  [k.brotherReads, "brotherReads"], [k.maze, "maze"], [k.cabinet, "cabinet"], [k.shift, "shift"], [k.mirror, "mirror"],
  [k.fair, "fair"], [k.mirror2, "mirror2"], [k.stops, "stops"], [k.stampOut, "stampOut"], [k.h, "hook"], [k.door, "door"],
  [k.press, "press"], [k.closer, "closer"], [k.alone, "alone"], [k.bro53, "bro53"], [k.wide53, "wide53"], [k.gown, "gown"]]);

/** Views (over the KEY frame) for the bunk-room shots, keyed [frame, view]. */
type View = { x: number; y: number; zoom: number };
const viewAt = (f: number, keys: [number, View][]): View => {
  if (f <= keys[0][0] || keys.length === 1) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (f < keys[i][0]) {
      const t = ramp(f, keys[i - 1][0], keys[i][0]);
      const [a, b] = [keys[i - 1][1], keys[i][1]];
      return { x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), zoom: mix(a.zoom, b.zoom, t) };
    }
  }
  return keys[keys.length - 1][1];
};

const YH = youHead();
const CLOSE_YOU: View = { x: YH.x + 60, y: YH.y + 40, zoom: 2.0 };
const TWO: View = { x: 960, y: 440, zoom: 0.9 };
const BRO_TOP: View = { x: 1240, y: 210, zoom: 1.7 };

/** The sitting brother's pose on the top bunk (BunkRoom "sit"), arms set. */
const broSit = (armF: [number, number], armB: [number, number] = [20, 40], tilt = 0): Pose =>
  ({ ...STAND, tilt, legB: [90, -80], legF: [92, -86], armF, armB });

const NightShiftShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = shotAt(frame, k);
  const room = (p: Omit<BunkRoomProps, "frame" | "mood">, view: View, children: React.ReactNode) => (
    <BunkRoom frame={frame} mood="lamp" you="none" jarFill={0.9} {...p} view={drift(view, frame, "nightshift", 4)}>{children}</BunkRoom>
  );
  // ---------------------------------------------------------------- the inserts
  if (shot === "clock") return <PaperInsert frame={frame} at={k.clock} end={k.youThird}><ClockSheet frame={frame} at={k.clock} shade={k.shade} /></PaperInsert>;
  if (shot === "mouse") return <PaperInsert frame={frame} at={k.mouse} end={k.bin}><MouseSheet frame={frame} at={k.mouse} widen={k.widen} tide={k.tide} /></PaperInsert>;
  if (shot === "memory") return <PaperInsert frame={frame} at={k.memory} end={k.brotherReads}><MemorySheet frame={frame} at={k.memory} loss={k.loss} /></PaperInsert>;
  if (shot === "maze") return <PaperInsert frame={frame} at={k.maze} end={k.cabinet} tilt={1.5}><MazeSheet frame={frame} at={k.maze} run={k.run} sleep={k.sleep} replay={k.replay} /></PaperInsert>;
  if (shot === "cabinet") return <PaperInsert frame={frame} at={k.cabinet} end={k.shift}><CabinetSheet frame={frame} at={k.cabinet} open={k.open} whirl={k.whirl} shut={k.shut} fall={k.fall} /></PaperInsert>;
  if (shot === "fair") return <PaperInsert frame={frame} at={k.fair} end={k.mirror2} tilt={1}><FairSheet frame={frame} at={k.fair} ticks={k.ticks} /></PaperInsert>;
  if (shot === "hook") return <WallInsert frame={frame} kind="hook" tagAt={k.keysAt} start={k.h} end={k.door} />;
  if (shot === "door") return <WallInsert frame={frame} kind="door" tagAt={k.doorAt} start={k.door} end={k.press} />;
  if (shot === "mirror" || shot === "mirror2") {
    const close = shot === "mirror2";
    const cam = close
      ? { x: 960, y: 400 - ramp(frame, k.mirror2, k.stops) * 10, zoom: 1.55 + ramp(frame, k.mirror2, k.stops) * 0.1 }
      : { x: 980, y: 470 - ramp(frame, k.mirror, k.fair) * 30, zoom: 1.0 + ramp(frame, k.mirror, k.fair) * 0.25 };
    const face: Face = { brows: "sad", lids: 0.4, mouth: close ? "frown" : "flat", look: { x: -0.1, y: 0.05 } };
    return (
      <>
        <Bathroom frame={frame} cam={drift(cam, frame, "mirror", 3)} face={face} touch={close ? ramp(frame, k.mirror2 + 20, k.mirror2 + 36) : 0} />
        {!close && <ForegroundHead x={180} side="left" blur={16} />}
      </>
    );
  }
  // ---------------------------------------------------------------- the bunk room
  const laughing = frame < k.flat;
  const chuckle = Math.floor(frame / 9) % 2 ? "smile" : "open";
  const notebook = <Notebook />;
  const broFace = (face: Partial<Face> & { pose?: Pose; held?: React.ReactNode; facing?: 1 | -1 }) => ({
    pose: broSit([70, 60], [40, 70]), held: notebook, look: { x: 0.4, y: 0.6 }, brows: "raised" as const, mouth: chuckle as Face["mouth"], ...face });
  const you = (face: Face, extra: { pose?: Pose; tagAt?: number } = {}) => <SittingYou frame={frame} face={face} {...extra} />;
  const lookBand: Face = { brows: "worry", lids: 0.25, mouth: "flat", look: { x: 0.7, y: 0.65 } };
  const bin = <Bin x={1540} y={1250} />;

  switch (shot) {
    case "room":
      return room({ brother: "sit", brotherFace: broFace({}) }, viewAt(frame, [[k.start, TWO], [k.closeYou, { x: 820, y: 560, zoom: 1.2 }]]),
        <>{bin}{you(lookBand)}</>);
    case "closeYou":
      return room({ brother: "sit", brotherFace: broFace({}) }, viewAt(frame, [[k.closeYou, CLOSE_YOU], [k.clock, { ...CLOSE_YOU, zoom: 2.2 }]]),
        you({ ...lookBand, lids: 0.35, brows: "sad" }));
    case "youThird":
      return room({ brother: "sit", brotherFace: broFace({}) }, viewAt(frame, [[k.youThird, { ...CLOSE_YOU, zoom: 2.1 }], [k.mouse, { ...CLOSE_YOU, zoom: 2.3 }]]),
        you({ brows: "worry", lids: 0, mouth: "o", eyes: 1.15, look: { x: 0.9, y: -0.1 } }));
    case "bin":
      return room({ brother: "sit", brotherFace: broFace({}) }, viewAt(frame, [[k.bin, { x: 1380, y: 930, zoom: 1.35 }], [k.youMonth, { x: 1500, y: 1000, zoom: 1.6 }]]),
        <>{bin}{you(lookBand)}</>);
    case "youMonth":
      return room({ brother: "sit", brotherFace: broFace({ mouth: "open", look: { x: 0.9, y: 0.9 }, facing: -1 }) },
        viewAt(frame, [[k.youMonth, { x: 1000, y: 560, zoom: 1.05 }], [k.memory, { x: 1000, y: 580, zoom: 1.15 }]]),
        <>{bin}{you({ brows: "angry", lids: 0.35, mouth: "frown", look: { x: 1, y: 0.7 } })}</>);
    case "brotherReads": {
      const w = Math.sin(frame * 0.9) * 6;
      return room({ brother: "sit", brotherFace: broFace({ pose: broSit([70 + w, 60 - w], [40, 70], 6), look: { x: 0.5, y: 0.9 } }) },
        viewAt(frame, [[k.brotherReads, BRO_TOP], [k.maze, { ...BRO_TOP, zoom: 1.85 }]]), you(lookBand));
    }
    case "shift": {
      const up = frame >= k.lookUp;
      return room({ brother: "sit", brotherFace: broFace({ mouth: "smile" }) }, viewAt(frame, [[k.shift, { ...CLOSE_YOU, zoom: 1.9 }], [k.mirror, { ...CLOSE_YOU, x: CLOSE_YOU.x - 20, zoom: 2.35 }]]),
        you(up ? { brows: "sad", lids: 0.3, mouth: "flat", look: { x: 1, y: -0.3 } } : { ...lookBand, brows: "sad", lids: 0.4 }));
    }
    case "stops": {
      const face = laughing ? broFace({ mouth: "open" }) : broFace({ mouth: "flat", brows: "flat", look: { x: 0.8, y: 0.9 }, pose: broSit([40, 30], [30, 40]) });
      return room({ brother: "sit", brotherFace: face }, viewAt(frame, [[k.stops, { ...BRO_TOP, zoom: 1.45 }], [k.stampOut, { ...BRO_TOP, zoom: 1.6 }]]),
        you({ brows: "worry", lids: 0.2, mouth: "flat", look: { x: 0.9, y: -0.6 } }));
    }
    case "stampOut": {
      const down = ramp(frame, k.stampOut + 6, k.stampOut + 12) * (1 - ramp(frame, k.stampOut + 14, k.stampOut + 20));
      return room({ brother: "sit", brotherFace: broFace({ held: <StampTool />, mouth: "flat", brows: "angry", look: { x: 0.9, y: 0.8 }, facing: 1,
        pose: broSit([60 + down * 40, 40 - down * 20], [30, 40]) }) },
        viewAt(frame, [[k.stampOut, { x: 1360, y: 230, zoom: 2.0 }], [k.h, { x: 1370, y: 230, zoom: 2.15 }]]),
        <TagSheet x={1500} y={130} used={frame >= k.stampOut + 12 ? 3 : 2} />);
    }
    default:
      break;
  }

  // ---------------------------------------------------------------- the stamps, and after
  if (shot === "press" || shot === "closer") {
    const head = youHead();
    const forehead = { x: head.x + 10, y: head.y - head.r * 0.52 };
    const step = ramp(frame, k.back, k.back + 10) * 110;
    const nod = frame >= k.nod[0] && frame < k.nod[1] ? Math.sin(((frame - k.nod[0]) / (k.nod[1] - k.nod[0])) * Math.PI * 2) * 9 : 0;
    const reachT = ramp(frame, k.pressAt - 9, k.pressAt) * (1 - ramp(frame, k.back - 2, k.back + 6));
    const base: Pose = { ...STAND, lean: 18 * reachT, tilt: nod };
    const b = broBody(base, 70 + step);
    const look = { x: b.x - 170, y: head.y + 60 };
    const target = { x: mix(look.x, forehead.x, reachT), y: mix(look.y, forehead.y, reachT) };
    const armB = frame < k.back + 6 ? aimArm({ ...b }, target) : ([-6, 14] as [number, number]);
    b.pose = { ...base, armB, armF: [10, 20] };
    const hand = handOf(b, armB);
    const holding = frame < k.pressAt;
    const peel = frame >= k.peel[0] && frame < k.peel[1];
    const broFace2: Face = holding
      ? { brows: "flat", lids: 0.2, mouth: "flat", look: { x: 0.6, y: -0.4 } }
      : { brows: peel ? "angry" : "raised", lids: 0.1, mouth: talk(frame, k.peel[0], k.peel[1], "smile"), look: { x: 0.9, y: 0.1 } };
    const crossed = frame >= k.cross;
    const youFace: Face = crossed
      ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.15, y: -1 } }
      : { brows: "worry", lids: 0.1, mouth: "flat", look: { x: 1, y: -0.2 } };
    const view = shot === "closer"
      ? viewAt(frame, [[k.closer, { x: 760, y: 560, zoom: 1.55 }], [k.alone, { x: 760, y: 560, zoom: 1.65 }]])
      : viewAt(frame, [[k.press, { x: 780, y: 620, zoom: 1.3 }], [k.closer, { x: 790, y: 610, zoom: 1.38 }]]);
    return room({}, view,
      <>
        {you(youFace, { tagAt: k.pressAt })}
        <StandingBrother b={b} face={broFace2} frame={frame} />
        {holding && <g transform={`translate(${hand.x} ${hand.y}) rotate(-8)`}><rect x={-30} y={-18} width={60} height={36} rx={4} fill="#f3e9d7" stroke="#23252b" strokeWidth={3} /></g>}
      </>);
  }
  if (shot === "alone" || shot === "bro53" || shot === "wide53") {
    const walking = ramp(frame, k.go[0], k.go[1]);
    const phase = Math.max(0, frame - k.go[0]) / 5;
    const turned = frame >= k.go[0];
    const base: Pose = turned ? walkPose(phase) : STAND;
    const b = broBody(base, 180 + walking * 1100);
    b.facing = turned ? 1 : -1;
    const broFace3: Face = { brows: "worry", lids: 0.2, mouth: "flat", look: turned ? { x: 0.6, y: 0.3 } : { x: 0.8, y: 0.2 } };
    const youFace: Face = shot === "alone"
      ? { brows: "sad", lids: 0.35, mouth: "flat", look: { x: 0.9, y: 0.1 } }
      : { brows: "sad", lids: 0.45, mouth: "flat", look: { x: 0.7, y: 0.6 } };
    const view = shot === "alone"
      ? viewAt(frame, [[k.alone, { ...CLOSE_YOU, zoom: 2.05 }], [k.bro53, { ...CLOSE_YOU, zoom: 2.25 }]])
      : shot === "bro53"
        ? viewAt(frame, [[k.bro53, { x: b.x - 60, y: 560, zoom: 1.9 }], [k.wide53, { x: b.x - 60, y: 560, zoom: 2.0 }]])
        : viewAt(frame, [[k.wide53, { x: 760, y: 600, zoom: 1.3 }], [k.gown, { x: 940, y: 520, zoom: 0.95 }]]);
    return room({}, view,
      <>
        {you(youFace, { tagAt: k.pressAt, pose: { ...SIT_UP, armF: [40, 60] } })}
        <StandingBrother b={b} face={broFace3} frame={frame} />
      </>);
  }
  // "gown": Saturday is his graduation.
  return room({}, viewAt(frame, [[k.gown, { x: 1500, y: 400, zoom: 1.45 }], [k.end, { x: 1520, y: 380, zoom: 1.6 }]]),
    <>
      {you({ brows: "sad", lids: 0.4, mouth: "flat", look: { x: 0.9, y: -0.5 } }, { tagAt: k.pressAt })}
      <GownHanger x={1560} rail={BUNK.topBunk.y - 58} sway={Math.sin(frame / 14) * 1.5} />
    </>);
};

const NightShift: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = times(shot.clips, shot.from, shot.to);
  const ticks = Array.from({ length: 11 }, (_, i) => Math.round(mix(k.ticks[0], k.ticks[1], (i + 1) / 11.999)));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <NightShiftShot frame={shot.frame} k={k} />
      <Sfx name="paper" at={[k.clock, k.mouse, k.memory, k.maze, k.cabinet, k.fair]} volume={0.3} />
      <Sfx name="whoosh" at={[k.whirl[0]]} volume={0.15} />
      <Sfx name="tick" at={ticks} volume={0.22} frames={12} />
      <Sfx name="stamp" at={[k.stampOut + 12, k.keysAt, k.doorAt, k.pressAt]} volume={0.5} />
    </AbsoluteFill>
  );
};

export const nightShift: Beat = { id: "nightShift", firstLine: 44, Component: NightShift };
