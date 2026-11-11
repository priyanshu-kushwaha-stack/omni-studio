// Beat "The loan" (script.md, ## [06:05] The loan; narration lines 62-72). Same pattern as Change.tsx: `times()` from
// the clips, one component per shot, the beat picks by frame, the snap outside the Stage.
//
//   62    the canteen at dusk, wide: Dev counts notes from his fold onto the table, one by one; insert on his bike key
//         with the cracked cover ("a clutch for the bike"); close on Dev counting ("his sister's fees").
//   63    insert from above: your phone lights, a crimson cross over the payment; close on you, your eyes come up to
//         him; the two-shot, "Lend me some?".
//   64    snap: the YES tag over Dev; he grins and pushes the whole fold across the table: "Take it all. Seriously."
//   65    close on you holding the notes; over your shoulder, Dev smiling under his tag ("because you asked").
//   hold  the two-shot: you hold the notes, Dev back at his plate, humming; insert on the bike key between you.
//   66    close on you; Dev eating, humming, not knowing.
//   67    lamp: Dev's family dinner under one lamp (his mother, his sister, the thalis); his mother points at the bike key
//         by his plate: "The clutch? You had it." He opens his mouth, closes it, frowns at his food.
//   68    close on Dev looking at his hands; a thought bubble: two empty frames, then the canteen, your mouth open, his
//         own nod. The camera goes to the empty frames ("can't remember wanting to").
//   69    the paper on the wall: a figure turning pegs, a hand with one note ("paid less"), the flat mouth curls into a
//         smile; the second panel, a thick fold ("paid more"), the mouth stays flat (Festinger and Carlsmith, c05).
//   70    close on Dev; he lifts his head and makes a small smile at his mother.
//   71    the two-shot: "Needed to help a friend." Hold: his mother nods, Dev eats, the smile stays.
//   72    close on the smile, too long; on "why" it goes.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import type { Pose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, ForegroundHead, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { Bubble, headAt, Sheet, YesTag } from "../parts";
import { aimArm, CHAIR_SIT, handAt, seatedY, type Body } from "../parts2";
import { blinking, camAt, current, HERO, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { Chair } from "../sets/common";
import { Sfx } from "./Change.parts";
import {
  BouncedPhone, CANTEEN, CanteenBack, CanteenChairs, CanteenTable, Dev, DevMother, DINNER, DinnerBack, DinnerTable,
  DissonancePaper, Fold, LampLight, Memory, Note, Pile, Sister, talk, ThoughtCloud,
} from "./Loan.parts";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i). */
function times(clips: Clip[], start: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  return {
    start,
    // 62: the canteen.
    count: at(62, 0.2), // "counting money"
    key: at(62, 0.58), // "a clutch for the bike"
    dev: at(62, 0.8), // "his sister's fees"
    // 63: the bounce and the ask.
    phone: from(63) - 4,
    cross: at(63, 0.1), // "bounced"
    you: at(63, 0.36), // "You look at him across the table"
    ask: at(63, 0.8), // "and you ask": bubble
    // 64: the yes.
    snap: from(64) - 4,
    push: from(64) + 6,
    devTalk: [from(64), lineEnd(clips, 64)] as const,
    // 65 and the hold.
    hold: from(65),
    take: from(65) + 4,
    ots: at(65, 0.45), // "because you asked"
    hum: lineEnd(clips, 65), // the 2 s hold
    keyIns: lineEnd(clips, 65) + 30,
    // 66.
    sad: from(66),
    unaware: at(66, 0.56), // "He doesn't know"
    // 67-72: the dinner.
    dinner: lineEnd(clips, 66) + 2,
    momTalk: [from(67), lineEnd(clips, 67)] as const,
    open: at(67, 0.7),
    frown: lineEnd(clips, 67) + 6,
    thought: from(68),
    blank: at(68, 0.48), // "He can't remember wanting to"
    paper: from(69),
    work: at(69, 0.16), // "students ... dull work"
    note: at(69, 0.23), // "paid less": the hand with one note
    noteCam: at(69, 0.3),
    smile: at(69, 0.5), // "later rated it more enjoyable"
    curl: at(69, 0.56),
    curlEnd: at(69, 0.72),
    twenty: at(69, 0.78), // "than students paid more"
    hands: from(70),
    did: at(70, 0.45), // "Dev does what they did"
    lift: at(70, 0.8), // "He makes one up"
    says: from(71),
    devSays: [from(71), lineEnd(clips, 71)] as const,
    nod: lineEnd(clips, 71) + 4,
    believe: from(72),
    why: at(72, 0.84), // "his why"
  };
}

// ------------------------------------------------------------------------------------------------ the canteen

const S = 1.15;
const SEAT_Y = seatedY(CANTEEN.seat, S);
const TOTAL = 14;
/** Dev counts one note every PERIOD frames from the beat's start until the phone lights. */
const PERIOD = 14;

const youBody = (): Body => ({ x: CANTEEN.you, y: SEAT_Y, scale: S, facing: 1, pose: CHAIR_SIT });
const devBody = (): Body => ({ x: CANTEEN.dev, y: SEAT_Y, scale: S, facing: -1, pose: CHAIR_SIT });
const YOU_HEAD = headAt(CANTEEN.you, SEAT_Y, S, CHAIR_SIT);
const DEV_HEAD = headAt(CANTEEN.dev, SEAT_Y, S, CHAIR_SIT, -1);

/** Where the notes are at a frame: on the table (count, x) and in whose hand. */
function money(frame: number, k: T) {
  const counting = Math.max(0, Math.min(Math.floor((k.phone - 6 - k.start) / PERIOD), Math.floor((frame - k.start) / PERIOD + 0.5)));
  const onPile = frame >= k.snap + 6 ? TOTAL : Math.min(TOTAL - 3, counting);
  const slide = ramp(frame, k.push + 2, k.push + 24);
  const x = mix(CANTEEN.pileFrom, CANTEEN.pileTo, slide);
  const taken = frame >= k.take + 10;
  return { onPile, x, taken, inFold: TOTAL - onPile };
}

/** Dev's arms: counting (a note from the fold to the pile), resting, dumping the fold, pushing, then eating. */
function devArms(frame: number, k: T, body: Body, m: ReturnType<typeof money>): { pose: Pose; carrying: boolean } {
  const fold = { x: CANTEEN.dev - 72, y: 826 };
  const rest = { x: CANTEEN.dev - 92, y: 834 };
  let front = rest, back = fold, carrying = false, lean = 0;
  if (frame < k.phone - 6) {
    const u = ((frame - k.start) % PERIOD) / PERIOD;
    const p = 0.5 - 0.5 * Math.cos(u * Math.PI * 2);
    front = { x: mix(fold.x - 8, CANTEEN.pileFrom + 10, p), y: mix(fold.y - 6, 824, p) };
    carrying = u < 0.5;
  } else if (frame >= k.snap && frame < k.push + 30) {
    const dump = ramp(frame, k.snap, k.snap + 6) * (1 - ramp(frame, k.snap + 8, k.snap + 14));
    back = { x: mix(fold.x, CANTEEN.pileFrom + 12, dump), y: mix(fold.y, 826, dump) };
    const reach = ramp(frame, k.snap + 2, k.push + 2) * (1 - ramp(frame, k.push + 18, k.push + 30));
    front = { x: mix(rest.x, Math.max(m.x + 34, 1000), reach), y: mix(rest.y, 828, reach) };
    lean = 16 * reach;
  } else if (frame >= k.hum) {
    const u = ((frame - k.hum) % 44) / 44;
    const p = 0.5 - 0.5 * Math.cos(u * Math.PI * 2);
    front = { x: mix(CANTEEN.devPlate, DEV_HEAD.x - 30, p), y: mix(830, DEV_HEAD.y + 30, p) };
  }
  const pose = { ...CHAIR_SIT, lean };
  const b = { ...body, pose };
  return { pose: { ...pose, armF: aimArm(b, front), armB: aimArm(b, back) }, carrying };
}

/** Your arms: resting by the phone, then taking the notes and holding them at your chest. */
function youArms(frame: number, k: T, body: Body, m: ReturnType<typeof money>): Pose {
  const rest = { x: CANTEEN.phone.x + 4, y: 832 };
  const chest = { x: CANTEEN.you + 78, y: 790 };
  const reach = ramp(frame, k.take, k.take + 10);
  const lift = ramp(frame, k.take + 10, k.take + 22);
  const front = frame < k.take ? rest : lift > 0 ? { x: mix(m.x - 10, chest.x, lift), y: mix(826, chest.y, lift) } : { x: mix(rest.x, m.x - 10, reach), y: 826 };
  const lean = 10 * reach * (1 - lift);
  const b = { ...body, pose: { ...CHAIR_SIT, lean } };
  return { ...b.pose, armF: aimArm(b, front), armB: aimArm(b, { x: CANTEEN.you + 70, y: 834 }) };
}

const Canteen: React.FC<{ frame: number; k: T; cam: Camera; you: object; dev: object; showYou?: boolean; humming?: boolean }> = ({
  frame, k, cam, you, dev, showYou = true, humming,
}) => {
  const m = money(frame, k);
  const y = youBody(), d = devBody();
  const da = devArms(frame, k, d, m);
  d.pose = { ...da.pose, tilt: humming ? Math.sin(frame / 9) * 5 : 0 };
  y.pose = youArms(frame, k, y, m);
  const lit = frame >= k.phone ? 1 - ramp(frame, k.you + 40, k.you + 70) : 0;
  const devHead = headAt(d.x, d.y, S, d.pose, -1);
  const actors = (
    <>
      <CanteenChairs />
      {showYou && (
        <Figure {...HERO} {...y} {...you} blink={blinking(frame, 1)} time={frame}
          held={m.taken ? <g transform="translate(6 -8)"><Fold n={TOTAL} scale={0.9} /></g> : null} />
      )}
      <Dev {...d} {...dev} blink={blinking(frame, 3)} time={frame} held={da.carrying ? <Note x={-6} y={-8} scale={0.85} /> : null} />
      {m.inFold > 0 && frame < k.snap + 8 && (() => {
        const hb = handAt(d, "back");
        return <g transform={`translate(${hb.x} ${hb.y})`}><Fold n={m.inFold} scale={0.85} /></g>;
      })()}
      <CanteenTable lit={lit}>{!m.taken && m.onPile > 0 && <Pile x={m.x} y={CANTEEN.table.top} n={m.onPile} scale={0.85} />}</CanteenTable>
      <YesTag frame={frame} at={k.snap} x={devHead.x} headY={devHead.y} r={devHead.r} />
      <Bubble frame={frame} at={k.ask} until={k.snap + 12} x={YOU_HEAD.x + YOU_HEAD.r * 1.05} y={YOU_HEAD.y - YOU_HEAD.r * 0.9} text="Lend me some?" size={28} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<CanteenBack cam={cam} frame={frame} />} actors={actors} />;
};

const CanteenShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.start, "wide"], [k.count, "count"], [k.key, "key"], [k.dev, "dev"], [k.you, "you"], [k.ask, "ask"],
    [k.hold, "hold"], [k.ots, "ots"], [k.hum, "hum"], [k.keyIns, "keyIns"], [k.sad, "sad"], [k.unaware, "unaware"]]);
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.start, { x: 960, y: 620, zoom: 1.15 }], [k.count, { x: 970, y: 650, zoom: 1.3 }]]),
    count: camAt(frame, [[k.count, { x: 1080, y: 770, zoom: 2.3 }], [k.key, { x: 1070, y: 776, zoom: 2.5 }]]),
    key: camAt(frame, [[k.key, insert(CANTEEN.key.x - 6, CANTEEN.key.y - 20, 5)], [k.dev, insert(CANTEEN.key.x - 6, CANTEEN.key.y - 22, 5.6)]]),
    dev: camAt(frame, [[k.dev, closeUp(DEV_HEAD.x - 50, DEV_HEAD.y + 40, 2.9)], [k.phone, closeUp(DEV_HEAD.x - 50, DEV_HEAD.y + 40, 3.15)]]),
    you: camAt(frame, [[k.you, closeUp(YOU_HEAD.x + 50, YOU_HEAD.y, 2.6)], [k.ask, closeUp(YOU_HEAD.x + 50, YOU_HEAD.y, 2.85)]]),
    ask: camAt(frame, [[k.ask, { x: 960, y: 700, zoom: 1.8 }], [k.snap, { x: 960, y: 700, zoom: 1.85 }], [k.hold, { x: 980, y: 690, zoom: 1.95 }]]),
    hold: camAt(frame, [[k.hold, closeUp(YOU_HEAD.x + 70, YOU_HEAD.y + 50, 2.3)], [k.ots, closeUp(YOU_HEAD.x + 70, YOU_HEAD.y + 50, 2.5)]]),
    ots: camAt(frame, [[k.ots, { x: 1110, y: 640, zoom: 2.2 }], [k.hum, { x: 1120, y: 640, zoom: 2.35 }]]),
    hum: camAt(frame, [[k.hum, { x: 960, y: 700, zoom: 1.6 }], [k.keyIns, { x: 960, y: 700, zoom: 1.7 }]]),
    keyIns: camAt(frame, [[k.keyIns, insert(CANTEEN.key.x - 20, CANTEEN.key.y - 30, 3.6)], [k.sad, insert(CANTEEN.key.x - 20, CANTEEN.key.y - 30, 4)]]),
    sad: camAt(frame, [[k.sad, closeUp(YOU_HEAD.x + 40, YOU_HEAD.y, 2.7)], [k.unaware, closeUp(YOU_HEAD.x + 40, YOU_HEAD.y, 3)]]),
    unaware: camAt(frame, [[k.unaware, { x: 1090, y: 720, zoom: 2.1 }], [k.dinner, { x: 1080, y: 720, zoom: 2.2 }]]),
  };
  const cam = drift(cams[shot], frame, "loan", shot === "key" || shot === "keyIns" ? 1.5 : 3);
  const up = ramp(frame, k.you + 14, k.you + 26);
  const you = ({
    wide: { ...EXPRESSIONS.neutral, look: { x: 0.9, y: 0.5 } },
    count: { ...EXPRESSIONS.neutral, look: { x: 0.9, y: 0.5 } },
    key: EXPRESSIONS.neutral,
    dev: EXPRESSIONS.neutral,
    you: { ...EXPRESSIONS.worried, mouth: "flat" as const, look: { x: mix(0.3, 0.9, up), y: mix(0.95, -0.05, up) }, lids: mix(0.35, 0.1, up) },
    ask: frame < k.snap
      ? { brows: "worry" as const, lids: 0.1, mouth: frame >= k.ask ? "o" as const : "flat" as const, eyes: 1.05, look: { x: 1, y: 0 } }
      : { ...EXPRESSIONS.shocked, mouth: "flat" as const, eyes: 1.15, look: { x: 1, y: frame > k.snap + 20 ? -0.5 : 0 } },
    hold: { ...EXPRESSIONS.worried, mouth: "flat" as const, look: { x: 0.6, y: 0.8 } },
    ots: EXPRESSIONS.worried,
    hum: { ...EXPRESSIONS.sad, look: { x: 0.6, y: 0.75 } },
    keyIns: { ...EXPRESSIONS.sad, look: { x: 0.6, y: 0.75 } },
    sad: { ...EXPRESSIONS.sad, look: { x: 0.5, y: 0.8 } },
    unaware: { ...EXPRESSIONS.sad, look: { x: 0.9, y: 0.3 } },
  } as const)[shot];
  const grin = frame >= k.snap + 2;
  const devFace = grin
    ? frame >= k.hum
      ? { brows: "raised" as const, lids: 0.45, mouth: Math.floor(frame / 12) % 2 ? "o" as const : "smile" as const, eyes: 1, look: { x: 0.4, y: 0.7 } }
      : { brows: "raised" as const, lids: 0, mouth: talk(frame, k.devTalk[0], k.devTalk[1], "smile"), eyes: 1.05, look: { x: 1, y: 0.1 } }
    : frame >= k.ask - 10
      ? { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1.05, look: { x: 1, y: 0 } }
      : { brows: "flat" as const, lids: 0.35, mouth: "flat" as const, eyes: 1, look: { x: 0.6, y: 0.9 } };
  return (
    <>
      <Canteen frame={frame} k={k} cam={cam} you={you} dev={devFace} showYou={shot !== "ots"} humming={frame >= k.hum} />
      {shot === "ots" && <ForegroundHead x={230} side="left" blur={16} />}
    </>
  );
};

const PhoneShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.phone, { x: 960, y: 560, zoom: 1.15 }], [k.you, { x: 960, y: 540, zoom: 1.3 }]]), frame, "bounce", 2);
  const lit = ramp(frame, k.phone + 4, k.phone + 10);
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<BouncedPhone x={960} y={560} lit={lit} cross={k.cross} />} actors={null} />;
};

// ------------------------------------------------------------------------------------------------ the dinner

const DEV_SEAT_Y = seatedY(DINNER.seat, S);
const DEV_AT = headAt(DINNER.dev, DEV_SEAT_Y, S, CHAIR_SIT);
const MOM_AT = headAt(DINNER.mother, DEV_SEAT_Y, S, CHAIR_SIT, -1);
const sheetAt = (sx: number, sy: number) => ({ x: DINNER.sheet.x - DINNER.sheet.w / 2 + sx, y: DINNER.sheet.y - DINNER.sheet.h / 2 + sy });

const Dinner: React.FC<{ frame: number; k: T; cam: Camera; dev: object; devPose: Pose; mom: object; momPose: Pose; thought?: boolean }> = ({
  frame, k, cam, dev, devPose, mom, momPose, thought,
}) => {
  const sis = DINNER.sister;
  const sisY = seatedY(sis.seat, sis.scale);
  const sisBody: Body = { x: sis.x, y: sisY, scale: sis.scale, facing: frame < k.thought ? -1 : 1, pose: CHAIR_SIT };
  sisBody.pose = { ...CHAIR_SIT, armF: aimArm(sisBody, { x: sis.x + sisBody.facing * 10, y: 828 + Math.sin(frame / 13) * 6 }) };
  const devHead = headAt(DINNER.dev, DEV_SEAT_Y, S, devPose);
  const paper = frame >= k.paper ? (
    <Sheet frame={frame} at={k.paper} x={DINNER.sheet.x} y={DINNER.sheet.y} w={DINNER.sheet.w} h={DINNER.sheet.h}>
      <DissonancePaper frame={frame} c={{ work: k.paper + 10, note: k.note, curl: k.curl, curlEnd: k.curlEnd, twenty: k.twenty }} />
    </Sheet>
  ) : null;
  const actors = (
    <>
      <Chair x={DINNER.dev} y={DINNER.seat} scale={S} facing={1} />
      <Chair x={DINNER.mother} y={DINNER.seat} scale={S} facing={-1} />
      <Sister {...sisBody} look={{ x: 0.7, y: 0.3 }} mouth="flat" blink={blinking(frame, 6)} time={frame} />
      <Dev x={DINNER.dev} y={DEV_SEAT_Y} scale={S} facing={1} pose={devPose} {...dev} blink={blinking(frame, 3)} time={frame} />
      <DevMother x={DINNER.mother} y={DEV_SEAT_Y} scale={S} facing={-1} pose={momPose} {...mom} blink={blinking(frame, 5)} time={frame} />
      <DinnerTable eaten={ramp(frame, k.nod, k.believe + 60) * 0.6} />
      {thought && (
        <ThoughtCloud frame={frame} at={k.thought + 6} x={930} y={450} w={460} h={260} tx={devHead.x + 40} ty={devHead.y - 60}>
          <Memory frame={frame} w={460} h={260} empty={ramp(frame, k.blank, k.blank + 12)} />
        </ThoughtCloud>
      )}
    </>
  );
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<><DinnerBack cam={cam} frame={frame} />{paper}</>} actors={actors} front={<LampLight />} />
  );
};

const DinnerShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.dinner, "wide"], [k.thought, "thought"], [k.blank, "blank"], [k.paper, "paperWide"], [k.work, "work"],
    [k.noteCam, "note"], [k.smile, "smile"], [k.twenty, "twenty"], [k.hands, "hands"], [k.says, "says"], [k.believe, "believe"]]);
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.dinner, { x: 960, y: 560, zoom: 1.05 }], [k.frown, { x: 900, y: 600, zoom: 1.25 }], [k.thought, { x: 860, y: 620, zoom: 1.4 }]]),
    thought: camAt(frame, [[k.thought, { x: 860, y: 560, zoom: 1.75 }], [k.blank, { x: 880, y: 540, zoom: 1.85 }]]),
    blank: camAt(frame, [[k.blank, { x: 800, y: 480, zoom: 2.3 }], [k.paper, { x: 780, y: 470, zoom: 2.5 }]]),
    paperWide: camAt(frame, [[k.paper, { x: 1180, y: 480, zoom: 1.2 }], [k.work, { x: 1250, y: 420, zoom: 1.45 }]]),
    work: camAt(frame, [[k.work, { ...sheetAt(200, 230), zoom: 2.2 }], [k.noteCam, { ...sheetAt(220, 230), zoom: 2.35 }]]),
    note: camAt(frame, [[k.noteCam, { ...sheetAt(280, 260), zoom: 2.4 }], [k.smile, { ...sheetAt(270, 250), zoom: 2.5 }]]),
    smile: camAt(frame, [[k.smile, { ...sheetAt(255, 170), zoom: 3.3 }], [k.twenty, { ...sheetAt(258, 160), zoom: 3.8 }]]),
    twenty: camAt(frame, [[k.twenty, { ...sheetAt(570, 230), zoom: 2.3 }], [k.twenty + 34, { ...sheetAt(560, 230), zoom: 2.3 }], [k.hands, { ...sheetAt(370, 215), zoom: 1.9 }]]),
    hands: camAt(frame, [[k.hands, closeUp(DEV_AT.x + 40, DEV_AT.y + 20, 2.5)], [k.lift, closeUp(DEV_AT.x + 40, DEV_AT.y + 10, 2.7)], [k.says, closeUp(DEV_AT.x + 50, DEV_AT.y, 2.8)]]),
    says: camAt(frame, [[k.says, { x: 960, y: 640, zoom: 1.4 }], [k.believe, { x: 940, y: 640, zoom: 1.5 }]]),
    believe: camAt(frame, [[k.believe, closeUp(DEV_AT.x + 30, DEV_AT.y, 2.6)], [k.why, closeUp(DEV_AT.x + 30, DEV_AT.y, 3)], [k.why + 60, closeUp(DEV_AT.x + 30, DEV_AT.y, 3.1)]]),
  };
  const cam = drift(cams[shot], frame, "dinner", 3);

  // Dev: frowns at the food; looks at his hands; lifts his head with the made-up smile; says it; eats; the smile goes.
  const devBody: Body = { x: DINNER.dev, y: DEV_SEAT_Y, scale: S, facing: 1, pose: CHAIR_SIT };
  const plate = { x: DINNER.plates.dev, y: 830 };
  let front = { x: plate.x - 20, y: 832 }, back = { x: plate.x - 50, y: 836 };
  if (frame >= k.thought && frame < k.lift + 6) {
    front = { x: DINNER.dev + 80, y: 790 };
    back = { x: DINNER.dev + 66, y: 800 };
  } else if (frame >= k.nod) {
    const u = ((frame - k.nod) % 40) / 40;
    const p = 0.5 - 0.5 * Math.cos(u * Math.PI * 2);
    front = { x: mix(plate.x - 10, DEV_AT.x + 30, p), y: mix(830, DEV_AT.y + 30, p) };
  }
  const devPose = { ...CHAIR_SIT, lean: frame >= k.thought && frame < k.lift ? 8 : 0, armF: aimArm(devBody, front), armB: aimArm(devBody, back) };
  const smiled = frame >= k.lift + 4 && frame < k.why + 6;
  const dev = frame < k.open
    ? { ...EXPRESSIONS.neutral, look: { x: 0.9, y: 0.1 } }
    : frame < k.frown
      ? { brows: "raised" as const, lids: 0, mouth: frame < lineEnd2(k) ? "open" as const : "flat" as const, eyes: 1.05, look: { x: 1, y: 0 } }
      : frame < k.thought
        ? { brows: "angry" as const, lids: 0.3, mouth: "frown" as const, eyes: 1, look: { x: 0.6, y: 0.9 } }
        : frame < k.lift
          ? { brows: "worry" as const, lids: 0.35, mouth: "flat" as const, eyes: 1, look: { x: 0.8, y: 0.95 } }
          : smiled
            ? { brows: "raised" as const, lids: 0.1, mouth: talk(frame, k.devSays[0], k.devSays[1], frame < k.lift + 10 ? "smirk" : "smile"), eyes: 1.05, look: { x: 1, y: -0.05 } }
            : { ...EXPRESSIONS.sad, mouth: "flat" as const, lids: 0.45, look: { x: 0.7, y: 0.85 } };
  // His mother: points at the key while she asks; then watches him; nods at his answer.
  const momBody: Body = { x: DINNER.mother, y: DEV_SEAT_Y, scale: S, facing: -1, pose: CHAIR_SIT };
  const pointing = frame >= k.momTalk[0] - 4 && frame < k.frown + 14;
  const nod = frame >= k.nod && frame < k.believe + 10 ? Math.sin(((frame - k.nod) / 9) * Math.PI) * 7 : 0;
  const momPose = {
    ...CHAIR_SIT, tilt: nod, lean: pointing ? 8 : 0,
    armF: pointing ? aimArm(momBody, { x: DINNER.key.x, y: 800 }) : aimArm(momBody, { x: DINNER.plates.mother + 20, y: 832 }),
    armB: aimArm(momBody, { x: DINNER.plates.mother + 40, y: 836 }),
  };
  const mom = {
    brows: frame < k.says ? "raised" as const : "none" as const, lids: frame >= k.nod ? 0.3 : 0,
    mouth: talk(frame, k.momTalk[0], k.momTalk[1], frame >= k.nod ? "smile" : "flat"), eyes: 1, look: { x: 1, y: 0.1 },
  };
  return <Dinner frame={frame} k={k} cam={cam} dev={dev} devPose={devPose} mom={mom} momPose={momPose} thought={frame >= k.thought && frame < k.paper} />;
};

/** The end of his mother's line, where Dev's open mouth closes. */
const lineEnd2 = (k: T) => k.momTalk[1];

// ------------------------------------------------------------------------------------------------ the beat

const Loan: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.from);
  const scene = current(frame, [[0, "canteen"], [k.phone, "phone"], [k.you, "canteen"], [k.dinner, "dinner"]]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene === "canteen" && <CanteenShot frame={frame} k={k} />}
      {scene === "phone" && <PhoneShot frame={frame} k={k} />}
      {scene === "dinner" && <DinnerShot frame={frame} k={k} />}
      <Sfx at={k.snap} name="snap" />
    </AbsoluteFill>
  );
};

export const loan: Beat = { id: "loan", firstLine: 62, Component: Loan };
