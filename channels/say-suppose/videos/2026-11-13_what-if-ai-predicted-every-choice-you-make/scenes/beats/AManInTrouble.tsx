// Beat "A Man in Trouble" (script.md, ## [06:20] A Man in Trouble; narration lines 69-77). Mood dusk.
//
//   69  a paper diagram hung over the tables: two rows of small heads, crimson flags stamped over some in each row,
//       almost twice as many in one row (c21)
//   70  the next sheet: a crowd of small pastel heads at phones, two grey lines of text before each; their tally drawn
//       level with a grey box (c22)
//   71  him at the back of the stall under the crimson card, his face in his hands, then up, wiping a tray; at the
//       nearest tables the faces turn toward the card and away
//   72  three closings in one dissolve, his card 71, 80, 88 (on the spoken numbers), a deeper crimson glow each time;
//       the near tables empty, the couple on a date pick up their trays and go; you count the box alone
//   HOLD (4 s, performed): his phone buzzes; he answers turned away, hand cupped; you counting, listening; he turns
//       further away, sees you looking, covers the phone with his whole hand and makes himself smile
//   73  "Are they gone yet?" (the sister's small voice): close on him, the phone at his ear
//   74  "My sister's fine." (his own voice), the forced smile; his card: LIES 90%
//   75  you both look up at it, then at each other, then back to the tray and the coins (it ticks)
//   76  the tin box full; insert: two envelopes with the landlord's grey seal under the lid; the calendar on the
//       pillar, crossed off to the last day, circled
//   77  him and his card, back to crimson; the near tables turned toward it; a slow push in
import { AbsoluteFill } from "remotion";
import { STAND } from "@whatif/kit/rig/pose";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { CRIMSON } from "@whatif/kit/theme";
import { lineAt, moodNow } from "../kit";
import { TagSounds, type TagKey } from "../device";
import { camAt, current, lineEnd, linear, ramp, type Beat, type Shot } from "../shared";
import { COURT } from "../sets/FoodCourt";
import { CourtPaper, CrowdTally, FlagRows, onPaper } from "./AManInTrouble.Paper";
import { NEAR_DINERS, NearTables, PillarCalendar, type Diner } from "./AManInTrouble.Tables";
import { body, Cloth, heads, Phone, reachPose, StallScene, tagShot, talk, Tray, youBody, type Actor } from "./SixtyPerCent.Parts";

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  const end = (i: number) => lineEnd(clips, i);
  const call = end(72), gap = Math.max(60, from(73) - end(72));
  return {
    rows: from(69), // "In America, a risk score used in courts ..."
    flags: at(69, 0.3), // "... wrongly flagged Black defendants as future criminals ..."
    flagsDone: at(69, 0.85), // "... at almost twice the rate of white defendants."
    crowd: from(70), // "And a crowd of strangers online, given two lines about each defendant ..."
    bars: at(70, 0.55), // "... predicted who'd reoffend about as well as the software did."
    hands: from(71), // "It isn't seeing a thief."
    tray: at(71, 0.3), // "It's seeing a man in trouble."
    turn: at(71, 0.58), // "And it can't tell the two apart."
    away: at(71, 0.8), // "Neither can the food court."
    climb: from(72), // "Every night his number climbs."
    n71: at(72, 0.22), // "Seventy-one."
    n80: at(72, 0.37), // "Eighty."
    n88: at(72, 0.46), // "Eighty-eight."
    fewer: at(72, 0.56), // "Fewer people sit near the stall."
    alone: at(72, 0.8), // "You count the box alone."
    call, // HOLD: the phone
    answer: call + Math.round(gap * 0.12),
    listen: call + Math.round(gap * 0.3),
    turnAway: call + Math.round(gap * 0.55),
    sees: call + Math.round(gap * 0.72),
    cover: call + Math.round(gap * 0.82),
    sister: from(73), // "Are they gone yet?"
    fine: from(74), // "My sister's fine."
    fineEnd: end(74),
    lies: at(74, 0.7),
    read: from(75), // "You both read it."
    liesTick: from(75) + 4,
    box: from(76), // "The month ends."
    envelopes: at(76, 0.3), // "Rent's due tomorrow."
    calendar: at(76, 0.62), // "Both your rents, in one tin box."
    tease: from(77), // "And that's when his tag says the thing the whole court has been waiting for."
    end: to,
  };
}

const hisKeys = (k: T): TagKey[] => [
  { at: k.rows - 400, text: "TAKES THE KEY", pct: 71, state: "crimson" },
  { at: k.n80, text: "TAKES THE KEY", pct: 80, state: "crimson" },
  { at: k.n88, text: "TAKES THE KEY", pct: 88, state: "crimson" },
  { at: k.lies, text: "LIES", pct: 90, state: "new" },
  { at: k.liesTick, text: "LIES", pct: 90, state: "tick" },
  { at: k.tease + 6, text: "TAKES THE KEY", pct: 88, state: "crimson" },
];

/** Him at the back of the stall. */
const BACK_X = 1220;

// ------------------------------------------------------------------------------------------------ the papers

const Papers: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
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
    : camAt(frame, [[k.bars, p(1040, 420, 1.55)], [k.hands, p(900, 400, 1.3)]]);
  return (
    <CourtPaper frame={frame} at={k.crowd} cam={drift(cam, frame, `crowd-${frame < k.bars}`, 3)} mood={mood}>
      <CrowdTally frame={frame} at={k.crowd} bars={k.bars} />
    </CourtPaper>
  );
};

// ------------------------------------------------------------------------------------------------ the stall

/** Your hand going into the box and out, counting. */
function counting(frame: number): Actor {
  const b = youBody({ ...STAND, lean: 14 });
  const dip = (Math.sin(frame / 7) + 1) / 2;
  return { pose: reachPose(b, { x: 760 + dip * 30, y: 668 - dip * 20 }), face: { brows: "none", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.8 } } };
}

const Stall: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const tag = hisKeys(k);
  // Lines 71-72: the near tables and the three closings.
  if (frame < k.call) {
    const on = current(frame, [[k.hands, "hands"], [k.tray, "tray"], [k.turn, "tables"], [k.climb, "closings"], [k.alone, "alone"]]);
    const fb = body(BACK_X, { ...STAND, lean: 12 }, -1);
    const fh = heads(undefined, { x: BACK_X, pose: fb.pose }).friend;
    const friend: Actor = on === "hands"
      ? { x: BACK_X, tag, pose: reachPose(fb, { x: fh.x - 10, y: fh.y + fh.r * 0.2 }, { x: fh.x + 30, y: fh.y + fh.r * 0.35 }), face: { brows: "sad", lids: 1, mouth: "flat", eyes: 1 } }
      : { x: BACK_X, tag, held: <Tray tilt={-4} />, back: <Cloth />,
          pose: { ...STAND, lean: 6, armF: [60, 50], armB: [50 + Math.sin(frame / 5) * 12, 60] },
          face: { brows: "worry", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 0.5, y: 0.8 } } };
    // Which closing (0, 1, 2), and the dissolve from the one before around each spoken number.
    const night = frame < k.n80 - 8 ? 0 : frame < k.n88 - 8 ? 1 : 2;
    const dinersFor = (n: number): Diner[] => NEAR_DINERS.map((d, i): Diner => {
      if (on === "tables") return { ...d, turn: frame < k.away ? 1 : 2 };
      if (on === "hands" || on === "tray") return { ...d, turn: 0 };
      // Fewer each night: the right table gone by the second; the couple pick up their trays on the third.
      if (i >= 2) return n === 0 ? { ...d, turn: 2 } : { ...d, leave: 1 };
      if (n < 2 || frame < k.fewer) return { ...d, turn: n === 1 ? 2 : 0 };
      return { ...d, leave: linear(frame, k.fewer + i * 8, k.fewer + 70 + i * 8) * 1.2 };
    });
    const counts = on === "alone" || on === "closings";
    const you: Actor = counts ? counting(frame) : { pose: STAND, face: { brows: "worry", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.9, y: -0.2 } } };
    const camFor = (n: number): Camera => {
      const cams: Record<typeof on, Camera> = {
        hands: camAt(frame, [[k.hands, { x: fh.x - 40, y: fh.y - 80, zoom: 2.0 }], [k.tray, { x: fh.x - 40, y: fh.y - 80, zoom: 2.1 }]]),
        tray: camAt(frame, [[k.tray, { x: fh.x - 150, y: fh.y - 40, zoom: 1.7 }], [k.turn, { x: fh.x - 170, y: fh.y - 40, zoom: 1.8 }]]),
        tables: camAt(frame, [[k.turn, { x: 700, y: 560, zoom: 1.22 }], [k.climb, { x: 760, y: 540, zoom: 1.3 }]]),
        closings: { x: 820 + n * 40, y: 560 - n * 10, zoom: 1.0 + n * 0.06 },
        alone: camAt(frame, [[k.alone, { x: 780, y: 520, zoom: 1.6 }], [k.call, { x: 790, y: 520, zoom: 1.7 }]]),
      };
      return drift(cams[on], frame, `trouble-${on}`, 3);
    };
    const scene = (n: number) => (
      <StallScene frame={frame} cam={camFor(n)} mood={mood} backMood={counts ? "lamp" : mood}
        diners={!counts} you={you} friend={friend} coffeeBoard={[{ at: 0, value: "1.50" }]} box={{ open: counts ? 1 : 0, full: true }}
        front={<>
          <circle cx={fh.x} cy={fh.y - fh.r * 2.6} r={260} fill={CRIMSON} opacity={0.08 + 0.07 * n} />
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
  }
  // The phone, LIES, the box, the calendar, the tease.
  const on = current(frame, [[k.call, "ring"], [k.listen, "listen"], [k.turnAway, "away"], [k.sister, "sister"], [k.fine, "fine"], [k.read, "read"],
    [k.box, "box"], [k.envelopes, "envelopes"], [k.calendar, "calendar"], [k.tease, "tease"]]);
  const facingAway = frame < k.sees;
  const fb = body(BACK_X, STAND, facingAway ? 1 : -1);
  const fh = heads(undefined, { x: BACK_X, pose: fb.pose, facing: fb.facing }).friend;
  const ear = { x: fh.x + fb.facing * fh.r * 0.95, y: fh.y + fh.r * 0.2 };
  const answered = frame >= k.answer;
  const buzz = !answered ? Math.sin(frame * 2.2) * 6 : 0;
  const covered = frame >= k.cover;
  const phonePose = answered ? reachPose(fb, covered ? { x: ear.x - fb.facing * 6, y: ear.y + 8 } : undefined, ear) : reachPose(fb, undefined, { x: fh.x + fb.facing * 60, y: fh.y + 170 });
  const reading = on === "read";
  const readT = frame - k.read;
  let friend: Actor;
  if (on === "box" || on === "envelopes" || on === "calendar") {
    friend = { x: BACK_X, tag, held: <Tray />, pose: { ...STAND, armF: [60, 50] }, face: { brows: "worry", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 0.5, y: 0.8 } } };
  } else if (on === "tease") {
    friend = { x: BACK_X, tag, held: <Tray />, pose: { ...STAND, armF: [60, 50] }, face: { brows: "worry", lids: 0.2, mouth: "flat", eyes: 1, look: frame < k.tease + 20 ? { x: 0.8, y: 0.1 } : { x: 0.2, y: -0.9 } } };
  } else if (reading) {
    const look = readT < 14 ? { x: 0.2, y: -0.9 } : readT < 28 ? { x: 0.9, y: 0 } : { x: 0.5, y: 0.8 };
    friend = { x: BACK_X, tag, held: readT >= 28 ? <Tray /> : undefined, pose: { ...STAND, armF: readT >= 28 ? [60, 50] : [10, 10] }, face: { brows: "worry", lids: 0.25, mouth: "flat", eyes: 1, look } };
  } else {
    const smile = covered;
    friend = {
      x: BACK_X, facing: fb.facing, tag, pose: phonePose,
      back: <g transform={`translate(${buzz} 0)`}><g transform={`scale(${S_PHONE})`}><Phone /></g></g>,
      face: on === "fine" ? { brows: "worry", lids: 0.1, mouth: frame < k.fineEnd ? talk(frame, k.fine, k.fineEnd, "smile", 6) : "smile", eyes: 1, look: { x: 0.9, y: 0.05 } }
        : on === "sister" ? { brows: "worry", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 0.4, y: 0.6 } }
        : smile ? { brows: "worry", lids: 0.1, mouth: "smile", eyes: 1.05, look: { x: 0.9, y: 0 } }
        : frame >= k.sees ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.1, look: { x: 0.9, y: 0 } }
        : { brows: "worry", lids: 0.3, mouth: answered ? talk(frame, k.answer + 6, k.turnAway, "flat", 8) : "flat", eyes: 1, look: { x: 0.6, y: 0.4 } },
    };
  }
  const youBase = counting(frame);
  const you: Actor = reading
    ? { pose: STAND, face: { brows: "worry", lids: 0.15, mouth: "flat", eyes: 1, look: readT < 14 ? { x: 0.9, y: -0.9 } : readT < 28 ? { x: 1, y: 0 } : { x: 0.8, y: 0.8 } } }
    : on === "listen" || on === "away" || on === "sister" || on === "fine"
      ? { ...youBase, face: { brows: "worry", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 1, y: -0.1 } } }
      : youBase;
  const open = on === "box" || on === "envelopes" ? 1 : 0;
  const h = heads(you, friend);
  const cams: Record<typeof on, Camera> = {
    ring: camAt(frame, [[k.call, { x: BACK_X - 40, y: 520, zoom: 1.75 }], [k.listen, { x: BACK_X - 60, y: 520, zoom: 1.85 }]]),
    listen: camAt(frame, [[k.listen, closeUp(h.you.x + 60, h.you.y, 2.3)], [k.turnAway, closeUp(h.you.x + 60, h.you.y, 2.45)]]),
    away: camAt(frame, [[k.turnAway, { x: (h.you.x + BACK_X) / 2 + 40, y: 500, zoom: 1.5 }], [k.sister, { x: (h.you.x + BACK_X) / 2 + 60, y: 500, zoom: 1.58 }]]),
    sister: camAt(frame, [[k.sister, closeUp(ear.x - 30, fh.y, 2.9)], [k.fine, closeUp(ear.x - 30, fh.y, 3.1)]]),
    fine: camAt(frame, [[k.fine, tagShot(h.friend, 2.05)], [k.read, tagShot(h.friend, 2.15)]]),
    read: camAt(frame, [[k.read, { x: 890, y: 380, zoom: 1.45 }], [k.box, { x: 890, y: 380, zoom: 1.5 }]]),
    box: camAt(frame, [[k.box, insert(COURT.box.x, 690, 2.8)], [k.envelopes, insert(COURT.box.x, 690, 3.0)]]),
    envelopes: camAt(frame, [[k.envelopes, insert(COURT.box.x + 10, 690, 4.2)], [k.calendar, insert(COURT.box.x + 10, 690, 4.5)]]),
    calendar: camAt(frame, [[k.calendar, insert(COURT.pillar.x + 40, 640, 4.2)], [k.tease, insert(COURT.pillar.x + 40, 640, 4.6)]]),
    tease: camAt(frame, [[k.tease, { x: 900, y: 520, zoom: 1.05 }], [k.end, tagShot(h.friend, 1.75)]]),
  };
  const diners: Diner[] = NEAR_DINERS.slice(2).map((d) => ({ ...d, turn: 1 }));
  return (
    <StallScene frame={frame} cam={drift(cams[on], frame, `trouble2-${on}`, on === "calendar" || on === "envelopes" ? 1.5 : 3)} mood={mood} backMood="lamp" diners={false}
      you={on === "box" || on === "envelopes" || on === "calendar" ? { pose: STAND, face: { brows: "flat", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.8 } } } : you}
      friend={friend} box={{ open, full: true, envelopes: true }} coffeeBoard={[{ at: 0, value: "1.50" }]}
      front={<>
        {on === "tease" && <NearTables frame={frame} diners={diners} tables={[1400]} />}
        {(on === "calendar" || on === "envelopes" || on === "box") && <PillarCalendar cam={drift(cams[on], frame, `trouble2-${on}`, on === "calendar" || on === "envelopes" ? 1.5 : 3)} frame={frame} at={k.calendar} done={k.calendar + 40} />}
      </>} />
  );
};

const S_PHONE = 2.2;

// ------------------------------------------------------------------------------------------------ the beat

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const mood = moodNow(shot);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {frame < k.hands ? <Papers frame={frame} k={k} mood={mood} /> : <Stall frame={frame} k={k} mood={mood} />}
      <TagSounds keys={hisKeys(k).slice(1)} />
    </AbsoluteFill>
  );
};

export const aManInTrouble: Beat = { id: "aManInTrouble", firstLine: 69, Component: Scene };
