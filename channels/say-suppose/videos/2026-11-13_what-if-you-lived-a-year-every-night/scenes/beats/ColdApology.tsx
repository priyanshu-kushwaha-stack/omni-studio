// Beat "The Cold Apology" (script.md, ## [04:50]; story lines 50-56). The kitchen by one lamp, rain, the dripping tap.
//   50   wide: her at the table, arms folded, eyes red; you in the doorway in last night's scarf. INSERT (sepia) on "Before
//        you plugged in, a row about the rent": last night, both at this table, the bill between you, both mouths open. Close on her on
//        "fresh"; close on you, blank, searching, on "a year cold".
//   hold your bubble "Sorry about last night." She looks at you a long moment, her head tilts, she unfolds her arms
//        and puts both hands flat on the table.
//   51   close on her: "Which part?"      52  close on you: a cue card in your hand; you glance down at it on "You are."
//   53   INSERT the fall: a figure into the net, 31 m; two stopwatches, the faller's 36% longer.
//   54   INSERT two memory cards: hers thick, yours blank under a year of weather.
//   55   wide: "Yesterday was a year ago." she gets up.     56  she leaves past you and the lamp is yours; push into the
//        doorway: the stairs down to the hall and the hatches' glow.
import { AbsoluteFill } from "remotion";
import { lerpPose, SEATED, seatedY, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { Bubble } from "../parts";
import { camAt, current, FLATMATE, HERO, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { aim, clock, head, InkBars, Person, type Body } from "./CityPlugsIn.Kit";
import { Bill, FLAT, Flat } from "./ColdApology.Flat";
import { CardsInsert, FallInsert } from "./ColdApology.Inserts";

const S = 1.12;
const HER_SEAT = seatedY(FLAT.herChair.top, S);
const YOUR_SEAT = seatedY(FLAT.yourChair.top, S);
const DOOR_X = FLAT.door.x + FLAT.door.w / 2;
const BY_CHAIR = 1430;

function times(clips: Clip[], start: number, endOfBeat: number) {
  const { from, end, at } = clock(clips);
  const hold = end(50) + 4;
  const gap = from(51) - hold;
  return {
    start, endOfBeat,
    row: at(50, 0.34), fresh: at(50, 0.62), cold: at(50, 0.79),
    hold, bubble: hold + 6, tilt: hold + Math.round(gap * 0.35), unfold: [hold + Math.round(gap * 0.55), hold + Math.round(gap * 0.85)] as const,
    which: from(51) - 2, whichSay: [from(51), end(51)] as const,
    card: from(52), glance: at(52, 0.62),
    fall: from(53), drop: [at(53, 0.08), at(53, 0.3)] as const, sweep: [at(53, 0.32), at(53, 0.55)] as const, pct: at(53, 0.5), push: at(53, 0.6),
    cards: from(54), hers: at(54, 0.05), yours: at(54, 0.32), weather: at(54, 0.55),
    rise: from(55) - 4, up: [from(55) + 4, end(55)] as const,
    leave: from(56), walk: [from(56), at(56, 0.5)] as const, step: [at(56, 0.3), at(56, 0.62)] as const, door: at(56, 0.6),
  };
}
type T = ReturnType<typeof times>;

/** Her: arms folded at the table; she tilts her head, unfolds, hands flat; she gets up and walks out of the doorway. */
function herBody(frame: number, k: T): { body: Body; opacity: number } {
  if (frame < k.up[0]) {
    const body: Body = { x: FLAT.herChair.x, y: HER_SEAT, scale: S, facing: 1, pose: SEATED };
    const u = ramp(frame, k.unfold[0], k.unfold[1]);
    const t = ramp(frame, k.tilt, k.tilt + 14);
    const folded: Pose = { ...SEATED, armF: [24, 78], armB: [18, 88] };
    const flatF = aim(body, { x: FLAT.table.x - 150, y: FLAT.table.top - 2 });
    const flatB = aim(body, { x: FLAT.table.x - 190, y: FLAT.table.top - 2 });
    body.pose = { ...folded, tilt: mix(0, 9, t) * (1 - u * 0.5), lean: mix(0, 6, u),
      armF: [mix(folded.armF[0], flatF[0], u), mix(folded.armF[1], flatF[1], u)],
      armB: [mix(folded.armB[0], flatB[0], u), mix(folded.armB[1], flatB[1], u)] };
    return { body, opacity: 1 };
  }
  if (frame < k.walk[0]) {
    const r = ramp(frame, k.up[0], k.up[1]);
    return { body: { x: FLAT.herChair.x + 30 * r, y: mix(HER_SEAT, FLAT.floor, r), scale: S, facing: 1, pose: lerpPose(SEATED, STAND, r) }, opacity: 1 };
  }
  const w = linear(frame, k.walk[0], k.walk[1]);
  const x = mix(FLAT.herChair.x + 30, DOOR_X + 60, w);
  return { body: { x, y: FLAT.floor, scale: S, facing: 1, pose: w < 1 ? walkPose(frame * 0.32) : STAND }, opacity: 1 - ramp(frame, k.walk[1] - 10, k.walk[1]) };
}

/** You: in the doorway; you come in during the inserts to stand by your chair; you step under the lamp as she goes. */
function yourBody(frame: number, k: T): Body {
  let x = DOOR_X;
  let pose: Pose = STAND;
  if (frame >= k.fall && frame < k.rise) {
    x = mix(DOOR_X, BY_CHAIR, ramp(frame, k.fall, k.cards));
  } else if (frame >= k.rise) {
    const s = ramp(frame, k.step[0], k.step[1]);
    x = mix(BY_CHAIR, FLAT.table.x + 170, s);
    if (s > 0 && s < 1) pose = walkPose(frame * 0.3);
    if (frame >= k.walk[0] && frame < k.step[0]) pose = { ...STAND, lean: -6 };
  }
  const body: Body = { x, y: FLAT.floor, scale: S, facing: -1, pose };
  if (frame >= k.card && frame < k.fall) {
    body.pose = { ...STAND, armF: aim(body, { x: x - 70, y: FLAT.floor - 190 }), tilt: frame >= k.glance ? 10 : 0 };
  }
  return body;
}

/** Last night (the sepia insert): both at this table, the bill between you, both mouths going. */
const RowInsert: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.row, { x: 1050, y: 640, zoom: 1.55 }], [k.fresh, { x: 1050, y: 650, zoom: 1.7 }]]), frame, "row", 4);
  const sheBody: Body = { x: FLAT.herChair.x, y: HER_SEAT, scale: S, facing: 1, pose: { ...SEATED, lean: 10 } };
  const youBody: Body = { x: FLAT.yourChair.x, y: YOUR_SEAT, scale: S, facing: -1, pose: { ...SEATED, lean: 12 } };
  const beat = Math.floor((frame - k.row) / 9) % 2;
  sheBody.pose = { ...sheBody.pose, armF: beat ? [100, 10] : aim(sheBody, { x: FLAT.table.x - 60, y: FLAT.table.top - 4 }) };
  youBody.pose = { ...youBody.pose, armF: beat ? aim(youBody, { x: FLAT.table.x + 20, y: FLAT.table.top - 4 }) : [110, 20] };
  return (
    <AbsoluteFill style={{ filter: "sepia(0.8) saturate(0.7) contrast(0.95) brightness(1.05)" }}>
      <Flat cam={cam} frame={frame} table={<Bill x={FLAT.table.x} y={FLAT.table.top - 2} scale={1.3} />}>
        <Person body={sheBody} frame={frame} seed={2} who={{ ...FLATMATE, brows: "angry", mouth: beat ? "open" : "frown", look: { x: 1, y: 0 } }} />
        <Person body={youBody} frame={frame} seed={5} who={{ ...HERO, brows: "angry", mouth: beat ? "frown" : "open", look: { x: 1, y: 0 } }} />
      </Flat>
      <AbsoluteFill style={{ boxShadow: "inset 0 0 0 26px #f3e9d7, inset 0 0 120px 60px rgba(60,40,20,.5)" }} />
    </AbsoluteFill>
  );
};

const ColdApology: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = shot.frame;
  const k = times(shot.clips, shot.from, shot.to);
  const view = current(frame, [[0, "wide"], [k.row, "row"], [k.fresh, "her"], [k.cold, "you"], [k.hold, "sorry"], [k.which, "which"],
    [k.card, "card"], [k.fall, "fall"], [k.cards, "cards"], [k.rise, "rise"], [k.door, "door"]] as [number, string][]);
  if (view === "row") return <RowInsert frame={frame} k={k} />;
  if (view === "fall") return <FallInsert frame={frame} start={k.fall} drop={[k.drop[0], k.drop[1]]} sweep={[k.sweep[0], k.sweep[1]]} pct={k.pct} push={k.push} />;
  if (view === "cards") return <CardsInsert frame={frame} start={k.cards} hers={k.hers} yours={k.yours} weather={k.weather} end={k.rise} />;

  const her = herBody(frame, k);
  const you = yourBody(frame, k);
  const hh = head(her.body);
  const yh = head(you);
  const cams: Record<string, Camera> = {
    wide: camAt(frame, [[k.start, FLAT.cameras.wide], [k.row, { x: 1220, y: 610, zoom: 1.2 }]]),
    her: camAt(frame, [[k.fresh, closeUp(hh.x + 30, hh.y, 2.6)], [k.cold, closeUp(hh.x + 30, hh.y, 2.8)]]),
    you: camAt(frame, [[k.cold, closeUp(yh.x - 30, yh.y, 2.6)], [k.hold, closeUp(yh.x - 30, yh.y, 2.8)]]),
    sorry: camAt(frame, [[k.hold, { x: 1360, y: 620, zoom: 1.3 }], [k.which, { x: 1300, y: 640, zoom: 1.45 }]]),
    which: camAt(frame, [[k.which, closeUp(hh.x + 40, hh.y, 2.7)], [k.card, closeUp(hh.x + 40, hh.y, 2.9)]]),
    card: camAt(frame, [[k.card, closeUp(yh.x - 40, yh.y + 40, 2.4)], [k.fall, closeUp(yh.x - 40, yh.y + 60, 2.6)]]),
    rise: camAt(frame, [[k.rise, { x: 1250, y: 620, zoom: 1.2 }], [k.door, { x: 1300, y: 620, zoom: 1.15 }]]),
    door: camAt(frame, [[k.door, { x: 1500, y: 640, zoom: 1.3 }], [k.endOfBeat, FLAT.cameras.door]]),
  };
  const cam = drift(cams[view], frame, "cold", 4);

  // her face: red-eyed and hurt; the long look; "Which part?"; flat; gone
  const herFace = frame < k.hold
    ? { brows: "angry" as const, lids: 0.4, mouth: "frown" as const, look: { x: 0.2, y: 0.5 } }
    : frame < k.which
      ? { brows: "flat" as const, lids: 0.3, mouth: "flat" as const, look: { x: 1, y: -0.2 } }
      : frame < k.card
        ? { brows: "flat" as const, lids: 0.25, mouth: frame < k.whichSay[1] ? ("open" as const) : ("flat" as const), look: { x: 1, y: -0.2 } }
        : { brows: "sad" as const, lids: 0.45, mouth: "flat" as const, look: { x: 0.9, y: 0.2 } };
  // your face: blank, searching; the apology; caught; watching her go
  const search = Math.sin((frame - k.cold) / 9);
  const yourFace = frame < k.cold
    ? { brows: "none" as const, lids: 0.2, mouth: "flat" as const, look: { x: 1, y: 0.1 } }
    : frame < k.hold
      ? { brows: "worry" as const, lids: 0.1, mouth: "flat" as const, look: { x: search, y: -0.4 } }
      : frame < k.which
        ? { brows: "worry" as const, lids: 0, mouth: "smile" as const, look: { x: 1, y: 0 } }
        : frame < k.rise
          ? { brows: "worry" as const, lids: 0.15, mouth: "o" as const, look: frame >= k.glance && frame < k.fall ? { x: 0.6, y: 0.9 } : { x: 1, y: 0 } }
          : { brows: "sad" as const, lids: 0.4, mouth: "flat" as const, look: frame >= k.walk[0] ? { x: -0.8, y: 0.1 } : { x: 1, y: 0.2 } };
  const cue = frame >= k.card && frame < k.fall ? (
    <g><rect x={-34} y={-24} width={68} height={44} rx={4} fill="#fffaf0" stroke="#23252b" strokeWidth={3} /><InkBars x={-24} y={-14} w={44} n={3} gap={11} thick={4} /></g>
  ) : undefined;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Flat cam={cam} frame={frame}
        over={<Bubble frame={frame} at={k.bubble} until={k.which} x={yh.x - 50} y={yh.y - 70} text="Sorry about last night." size={40} side="left" />}>
        <g opacity={her.opacity}>
          <Person body={her.body} frame={frame} seed={3} who={{ ...FLATMATE, ...herFace, eyes: 1 }} />
        </g>
        <Person body={you} frame={frame} seed={7} who={{ ...HERO, ...yourFace, eyes: 1, held: cue }} />
      </Flat>
    </AbsoluteFill>
  );
};

export const coldApology: Beat = { id: "ColdApology", firstLine: 50, Component: ColdApology };
