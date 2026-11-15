// Red's second half (v2: v1's "A Man in Trouble" folded in), reusing AManInTrouble.Paper and AManInTrouble.Tables:
//   74-75  the two paper diagrams hung over the tables (c21, c22)
//   76     him at the back of the stall under the crimson card, wiping a tray; he stops and squints up at the card;
//          the nearest tables turn toward it and away (no face in hands)
//   77     three closings in one dissolve, his card 71, 80, 88 on the spoken numbers; the near tables emptying; then
//          you at the box: COUNTS BOX 97% drops over you, your hand stops over the coins, you look to the back, pick
//          up an iced coffee instead and walk it out of frame
//   79     the calendar's last day; the tin box full, two envelopes with the landlord's grey seal; him and his card,
//          the near table turned toward it
import { AbsoluteFill } from "remotion";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON } from "@whatif/kit/theme";
import type { MoodName } from "@whatif/kit/stage/moods";
import { camAt, current, linear, mix, PASTELS, ramp } from "../shared";
import { COURT } from "../sets/FoodCourt";
import type { TagKey } from "../device";
import { CourtPaper, CrowdTally, FlagRows, onPaper } from "./AManInTrouble.Paper";
import { NearTables, PillarCalendar, type Diner } from "./AManInTrouble.Tables";
import { body, Cloth, heads, reachPose, StallScene, tagShot, Tray, youBody, type Actor } from "./SixtyPerCent.Parts";
import { HELD_CUP, IcedCoffee } from "./Red.Crate";

export interface TroubleTimes {
  rows: number; flags: number; flagsDone: number; crowd: number; bars: number;
  thief: number; trouble: number; turn: number; away: number;
  climb: number; n80: number; n88: number; tonight: number; counts: number; stop: number; cup: number; hold: number;
  calendar: number; box: number; envelopes: number; tease: number; end: number;
}

/** Strangers at the near tables (the date couple is gone in v2). */
const DINERS: Diner[] = [
  { x: 180, head: PASTELS[2], coat: "#3b4a6b", facing: 1 },
  { x: 480, head: PASTELS[4], coat: "#5a3b46", facing: -1 },
  { x: 1250, head: PASTELS[0], coat: "#2f5f63", facing: 1 },
  { x: 1550, head: PASTELS[3], coat: "#2a2d36", facing: -1 },
];

/** Him at the back of the stall. */
const BACK_X = 1220;

// ------------------------------------------------------------------------------------------------ 74-75: the papers

export const Papers: React.FC<{ frame: number; k: TroubleTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const p = (sx: number, sy: number, zoom: number): Camera => ({ ...onPaper(sx, sy), zoom });
  if (frame < k.crowd) {
    const on = current(frame, [[k.rows, "wide"], [k.flags, "rowA"], [k.flagsDone - 40, "both"]]);
    const cams: Record<typeof on, Camera> = {
      wide: camAt(frame, [[k.rows, { x: 960, y: 520, zoom: 0.95 }], [k.flags, { x: 960, y: 500, zoom: 1.12 }]]),
      rowA: camAt(frame, [[k.flags, p(520, 300, 1.7)], [k.flagsDone - 40, p(900, 330, 1.6)]]),
      both: camAt(frame, [[k.flagsDone - 40, p(720, 400, 1.28)], [k.crowd, p(720, 400, 1.36)]]),
    };
    return (
      <CourtPaper frame={frame} at={k.rows} cam={drift(cams[on], frame, `rows-${on}`, 3)} mood={mood}>
        <FlagRows frame={frame} at={k.rows} flags={k.flags} flagsDone={k.flagsDone} />
      </CourtPaper>
    );
  }
  const cam = frame < k.bars
    ? camAt(frame, [[k.crowd, p(400, 380, 1.5)], [k.bars, p(460, 380, 1.62)]])
    : camAt(frame, [[k.bars, p(1040, 420, 1.55)], [k.thief, p(900, 400, 1.3)]]);
  return (
    <CourtPaper frame={frame} at={k.crowd} cam={drift(cam, frame, `crowd-${frame < k.bars}`, 3)} mood={mood}>
      <CrowdTally frame={frame} at={k.crowd} bars={k.bars} />
    </CourtPaper>
  );
};

// ------------------------------------------------------------------------------------------------ 76-77: the stall

/** Your hand over the open box (counting), then stopped. */
function atBox(frame: number, stopped: boolean): Actor {
  const b = youBody({ ...STAND, lean: 14 });
  const dip = stopped ? 0.3 : (Math.sin(frame / 7) + 1) / 2;
  return { pose: reachPose(b, { x: 760 + dip * 30, y: 668 - dip * 20 }), face: { brows: "none", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.8 } } };
}

export const Trouble: React.FC<{ frame: number; k: TroubleTimes; mood: MoodName; hisTag: TagKey[]; yourTag: TagKey[] }> = ({ frame, k, mood, hisTag, yourTag }) => {
  const on = current(frame, [[k.thief, "thief"], [k.trouble, "trouble"], [k.turn, "tables"], [k.climb, "closings"], [k.tonight, "box"]]);
  const fb = body(BACK_X, { ...STAND, lean: 10 }, -1);
  const fh = heads(undefined, { x: BACK_X, pose: fb.pose }).friend;
  // Him: wiping a tray; on "a man in trouble" the cloth stops and he squints up at his card, unimpressed.
  const squint = on === "trouble" && frame >= k.trouble + 10;
  const friend: Actor = on === "box"
    ? { hidden: true }
    : { x: BACK_X, tag: hisTag, held: <Tray tilt={-4} />, back: <Cloth />,
        pose: { ...STAND, lean: 6, armF: [60, 50], armB: [50 + (squint ? 0 : Math.sin(frame / 5) * 12), 60] },
        face: squint ? { brows: "flat", lids: 0.5, mouth: "smirk", eyes: 1, look: { x: 0.15, y: -0.95 } } : { brows: "none", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 0.5, y: 0.8 } } };
  // Which closing (0, 1, 2), and the dissolve from the one before around each spoken number.
  const night = frame < k.n80 - 8 ? 0 : frame < k.n88 - 8 ? 1 : 2;
  const dinersFor = (n: number): Diner[] => DINERS.map((d, i): Diner => {
    if (on === "tables") return { ...d, turn: frame < k.away ? 1 : 2 };
    if (on === "thief" || on === "trouble") return { ...d, turn: 0 };
    if (on === "box") return { ...d, leave: 1 };
    if (i >= 2) return n === 0 ? { ...d, turn: 2 } : { ...d, leave: 1 };
    if (n < 2) return { ...d, turn: n === 1 ? 2 : 0 };
    return { ...d, leave: linear(frame, k.n88 + i * 8, k.n88 + 70 + i * 8) * 1.2 };
  });
  // You: at the box through the closings; at "Tonight your tag says count the box." the card drops, your hand stops,
  // you look to the back, take the iced coffee from the counter and walk it out to the right.
  let you: Actor;
  if (on === "box") {
    const stopped = frame >= k.stop;
    const walking = frame >= k.cup + 10;
    if (walking) {
      const x = mix(COURT.you.x, 1500, ramp(frame, k.cup + 10, k.hold));
      you = { x, tag: yourTag, pose: { ...walkPose((frame - k.cup) * 0.16), armF: [70, 30] }, held: HELD_CUP,
        face: { brows: "none", lids: 0.2, mouth: "smirk", eyes: 1, look: { x: 0.9, y: 0 } } };
    } else if (frame >= k.cup) {
      const b = youBody({ ...STAND, lean: 10 });
      you = { tag: yourTag, pose: reachPose(b, { x: 470, y: 760 }), held: HELD_CUP, face: { brows: "none", lids: 0.2, mouth: "smirk", eyes: 1, look: { x: -0.6, y: 0.6 } } };
    } else {
      const base = atBox(frame, stopped);
      you = { ...base, tag: yourTag,
        face: stopped ? { brows: "raised", lids: 0.1, mouth: "flat", eyes: 1, look: frame < k.stop + 16 ? { x: 0.2, y: -0.95 } : { x: 1, y: -0.1 } } : base.face };
    }
  } else if (on === "closings") {
    you = atBox(frame, false);
  } else {
    you = { pose: STAND, face: { brows: "flat", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.9, y: -0.2 } } };
  }
  const h = heads(you, friend);
  const camFor = (n: number): Camera => {
    const cams: Record<typeof on, Camera> = {
      thief: camAt(frame, [[k.thief, { x: fh.x - 120, y: fh.y - 40, zoom: 1.7 }], [k.trouble, { x: fh.x - 140, y: fh.y - 40, zoom: 1.8 }]]),
      trouble: camAt(frame, [[k.trouble, tagShot(fh, 2.1)], [k.turn, tagShot(fh, 2.25)]]),
      tables: camAt(frame, [[k.turn, { x: 700, y: 560, zoom: 1.22 }], [k.climb, { x: 760, y: 540, zoom: 1.3 }]]),
      closings: { x: 820 + n * 40, y: 560 - n * 10, zoom: 1.0 + n * 0.06 },
      box: camAt(frame, [[k.tonight, tagShot(h.you, 1.9)], [k.cup, { x: 760, y: 500, zoom: 1.35 }], [k.hold, { x: 900, y: 500, zoom: 1.3 }]]),
    };
    return drift(cams[on], frame, `trouble-${on}`, 3);
  };
  const counts = on === "closings" || on === "box";
  const scene = (n: number) => (
    <StallScene frame={frame} cam={camFor(n)} mood={mood} backMood={counts ? "lamp" : mood}
      diners={!counts} you={you} friend={friend} coffeeBoard={[{ at: 0, value: "1.50" }]} box={{ open: counts ? 1 : 0, full: true }}
      front={<>
        {on !== "box" && <circle cx={fh.x} cy={fh.y - fh.r * 2.6} r={260} fill={CRIMSON} opacity={0.08 + 0.07 * n} />}
        {on === "box" && frame < k.cup && <IcedCoffee x={470} y={COURT.counter.top} />}
        <NearTables frame={frame} diners={dinersFor(n)} />
      </>} />
  );
  if (on !== "closings" || night === 0) return scene(night);
  const change = night === 1 ? k.n80 : k.n88;
  const fadeIn = ramp(frame, change - 8, change + 10);
  return (
    <AbsoluteFill>
      <AbsoluteFill>{scene(night)}</AbsoluteFill>
      {fadeIn < 1 && <AbsoluteFill style={{ opacity: 1 - fadeIn }}>{scene(night - 1)}</AbsoluteFill>}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ 79: rent's due

export const Rent: React.FC<{ frame: number; k: TroubleTimes; mood: MoodName; hisTag: TagKey[] }> = ({ frame, k, mood, hisTag }) => {
  const on = current(frame, [[k.calendar, "calendar"], [k.box, "box"], [k.envelopes, "envelopes"], [k.tease, "tease"]]);
  const friend: Actor = {
    x: BACK_X, tag: hisTag, held: <Tray />, pose: { ...STAND, armF: [60, 50] },
    face: { brows: on === "tease" ? "raised" : "flat", lids: 0.2, mouth: "flat", eyes: 1, look: on === "tease" && frame >= k.tease + 20 ? { x: 0.2, y: -0.9 } : { x: 0.8, y: 0.1 } },
  };
  const you: Actor = { pose: STAND, face: { brows: "flat", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.8 } } };
  const h = heads(you, friend);
  const cams: Record<typeof on, Camera> = {
    calendar: camAt(frame, [[k.calendar, insert(COURT.pillar.x + 40, 640, 4.2)], [k.box, insert(COURT.pillar.x + 40, 640, 4.6)]]),
    box: camAt(frame, [[k.box, insert(COURT.box.x, 690, 2.8)], [k.envelopes, insert(COURT.box.x, 690, 3.0)]]),
    envelopes: camAt(frame, [[k.envelopes, insert(COURT.box.x + 10, 690, 4.2)], [k.tease, insert(COURT.box.x + 10, 690, 4.5)]]),
    tease: camAt(frame, [[k.tease, { x: 900, y: 520, zoom: 1.05 }], [k.end, tagShot(h.friend, 1.75)]]),
  };
  const cam = drift(cams[on], frame, `rent-${on}`, on === "tease" ? 3 : 1.5);
  const diners: Diner[] = DINERS.slice(2).map((d) => ({ ...d, turn: 1 }));
  return (
    <StallScene frame={frame} cam={cam} mood={mood} backMood="lamp" diners={false} you={you} friend={friend}
      box={{ open: on === "box" || on === "envelopes" ? 1 : 0, full: true, envelopes: true }} coffeeBoard={[{ at: 0, value: "1.50" }]}
      front={<>
        {on === "tease" && <NearTables frame={frame} diners={diners} tables={[1400]} />}
        {on !== "tease" && <PillarCalendar cam={cam} frame={frame} at={k.calendar} done={k.calendar + 40} />}
      </>} />
  );
};

