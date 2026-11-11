// Beat "The office: a wake of yes" (script.md, ## [04:50] The office; narration lines 52-61). Same pattern as
// Change.tsx: `times()` from the clips, one component per shot, the beat picks by frame, the snaps sit outside the Stage.
//
//   52    the office floor from straight above: you walk down the aisle asking as you go, and a wake of YES tags flips
//         up behind you, snap, snap, snap, every head turning to you with the same smile.
//   hold  the camera climbs; the wake runs on like dominoes down the whole floor and the far rows; Dev's head among
//         them, his smile the same as the rest.
//   53    inserts: a chair rolls to you, a charger is handed up, a page is signed; then low along the row, heads
//         turning as you pass; the camera searches the row and finds Dev, the same smile; high again: the whole floor.
//   54    side on, close: the smiling desks behind you; you stop looking at faces.
//   55    the glass meeting room: nine round the table, the boss at the head, Dev at your left with a pen, the pitch
//         stack, your tangled shape on the whiteboard; close on you. "Do you agree?"
//   56    eight tags snap round the table like a wave, eight nods; Dev's pen comes down. "Unanimous. Love it."
//   57    insert: Dev's signature drawing itself; the far side nodding as one; close on you.
//   58    a paper diagram over the whiteboard: a ring of heads nodding, their bubbles flattening one by one into one tick.
//   59    round the table, face by face, all the same face; wide: the room commits.
//   60    the boss slides a glossy flyer down the table to you. "Next Friday. The whole floor's coming."
//   61    close on the flyer: a date ringed in crimson, the tiny stage with your shape on it, rows and rows of heads.
//   hold  you push your chair back; Dev caps his pen and taps the signature, grinning; close on the grin.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { STAND } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import type { Clip } from "@whatif/kit/timeline";
import { Bubble, headAt, Headphones, YesTag } from "../parts";
import { aimArm, CHAIR_SIT, seatedY, type Body } from "../parts2";
import { blinking, BOSS, camAt, current, DEV, HERO, lineEnd, linear, mix, PASTELS, ramp, type Beat, type Shot } from "../shared";
import { Chair } from "../sets/common";
import { MeetingTable, OfficeBack, OfficeFront, OFFICE_DOOR, OFFICE_FLOOR, OFFICE_MEETING } from "../sets/Office";
import { Sfx } from "./Change.parts";
import { Charger, DeskPage, DEV_SEAT, flipFrames, FloorPeople, SEATS, TopArm, TopChair, TopDownYou, walkX, type Walk } from "./Office.Floor";
import { BOSS_SEAT, FAR, FlyerSide, FlyerTop, MS, PAGE, Pen, RingDiagram, TablePage, Tangle, YOU_SEAT } from "./Office.Meeting";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  return {
    floor: from(52), // top-down, you walk the aisle, the wake behind you
    climb: lineEnd(clips, 52), // the hold: the camera climbs, the dominoes run the floor
    chair: from(53), // "A chair,"
    charger: at(53, 0.085), // "a charger,"
    sign: at(53, 0.16), // "a signature."
    turns: at(53, 0.25), // "Everyone you pass turns to you with the same smile"
    search: at(53, 0.49), // "and somewhere in that row ..."
    dev: at(53, 0.62), // ... the camera finds Dev
    cant: at(53, 0.88), // "You can't find them.": high again
    walkEnd: lineEnd(clips, 53),
    faces: from(54) - 2, // side on, the smiling desks behind you
    stopLook: at(54, 0.56), // "So you stop looking at faces."
    meeting: from(55) - 2, // the meeting room
    board: at(55, 0.2), // "Your first draft.": the tangled shape
    draft: at(55, 0.49), // "The one you'd have thrown out": close on you
    ask: at(55, 0.82), // bubble "Do you agree?"
    wave: from(56) - 8, // eight tags round the table, 4 frames apart
    pen: from(56) + 22, // Dev's pen comes down
    boss: from(56),
    bossEnd: lineEnd(clips, 56),
    page: from(57) - 2, // insert: the signature
    nodders: at(57, 0.45), // the far side nodding as one
    echo: at(57, 0.78), // "It's an echo.": close on you
    diagram: from(58) - 4, // the ring diagram over the whiteboard
    flatten: at(58, 0.3),
    round: from(59) - 2, // face by face round the table
    commits: at(59, 0.5), // "And a room like that commits."
    flyer: from(60) - 6, // the boss slides the flyer
    next: from(60),
    nextEnd: lineEnd(clips, 60),
    flyerClose: from(61) - 2, // close on the flyer
    ring: at(61, 0.02),
    rows: at(61, 0.3), // "Two hundred people."
    stage: at(61, 0.56), // "And the draft ... is going on a stage."
    hold: lineEnd(clips, 61), // you push back; Dev caps his pen and taps the page
    grin: lineEnd(clips, 61) + 36,
    end: to,
  };
}

const walkOf = (k: T): Walk => ({ x0: -540, x1: 2700, f0: k.floor, f1: k.walkEnd });

/** A speaking mouth: open and closed in turn while a line plays. */
const talk = (frame: number, from: number, to: number, rest: "smile" | "flat" = "smile") =>
  frame >= from && frame < to ? (Math.floor((frame - from) / 5) % 2 === 0 ? "open" as const : "smile" as const) : rest;

// ------------------------------------------------------------------------------------------------ 52-53: the floor

const FloorShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const w = walkOf(k);
  const flips = flipFrames(w, k.climb + 4);
  const ax = OFFICE_FLOOR.aisle.y;
  const x = walkX(w, frame);
  const you = { x, y: ax };
  const look = Math.sin((frame - k.floor) / 11) * 70;
  const colAt = (f: number) => Math.min(10, Math.max(0, Math.floor((walkX(w, f) + 420) / 290) + 1));
  const signSeat = SEATS[colAt(k.sign) * 2 + 1];
  const chargerSeat = SEATS[colAt(k.charger) * 2];
  const dev = SEATS[DEV_SEAT];
  const shot = current(frame, [[k.floor, "walk"], [k.climb, "climb"], [k.chair, "chair"], [k.charger, "charger"], [k.sign, "sign"],
    [k.turns, "turns"], [k.search, "search"], [k.dev, "dev"], [k.cant, "high"]]);
  const climbFrom = walkX(w, k.climb);
  const high: Camera = { x: 1030, y: 530, zoom: 0.62 };
  const cams: Record<typeof shot, Camera> = {
    walk: camAt(frame, [[k.floor, { x: x + 170, y: ax, zoom: 1.35 }], [k.climb, { x: x + 170, y: ax, zoom: 1.25 }]]),
    climb: camAt(frame, [[k.climb, { x: climbFrom + 170, y: ax, zoom: 1.25 }], [k.chair - 8, high]]),
    chair: { x: x + 40, y: ax + 50, zoom: 2.1 },
    charger: { x: x + 10, y: ax - 60, zoom: 2.1 },
    sign: camAt(frame, [[k.sign, { x: signSeat.x, y: signSeat.y + 60, zoom: 2.3 }], [k.turns, { x: signSeat.x, y: signSeat.y + 70, zoom: 2.45 }]]),
    turns: { x: x + 120, y: ax, zoom: 1.15 },
    search: camAt(frame, [[k.search, { x: x + 400, y: ax + 60, zoom: 1.4 }], [k.dev, { x: dev.x, y: dev.y - 20, zoom: 1.6 }]]),
    dev: camAt(frame, [[k.dev, { x: dev.x, y: dev.y - 20, zoom: 1.9 }], [k.cant, { x: dev.x, y: dev.y - 30, zoom: 2.2 }]]),
    high: camAt(frame, [[k.cant, { ...high, zoom: 0.7 }], [k.faces, high]]),
  };
  const cam = drift(cams[shot], frame, "floor", 4);
  // The inserts: a chair rolls up beside you, a charger is handed down from a desk, a page is signed.
  const chairT = ramp(frame, k.chair, k.chair + 18);
  const chairAt = { x: mix(x + 300, x + 30, chairT), y: mix(ax + 230, ax + 100, chairT) };
  const reachT = ramp(frame, k.charger, k.charger + 12);
  const hand = { x: mix(chargerSeat.x, x + 30, reachT), y: mix(chargerSeat.y + 20, ax - 46, reachT) };
  const page = { x: signSeat.x, y: signSeat.y + 115 };
  const pen = { x: page.x - 30 + linear(frame, k.sign + 6, k.sign + 22) * 60, y: page.y + 46 + Math.sin(frame) * 4 };
  const actors = (
    <>
      <FloorPeople frame={frame} flips={flips} you={you} />
      {shot === "chair" && <TopChair x={chairAt.x} y={chairAt.y} turn={-30 + chairT * 30} />}
      {shot === "charger" && <TopArm x0={chargerSeat.x} y0={chargerSeat.y + 20} x1={hand.x} y1={hand.y} head={chargerSeat.head}><Charger y={-6} scale={0.9} /></TopArm>}
      {shot === "sign" && (
        <>
          <DeskPage x={page.x} y={page.y} />
          <DrawLine d={`M${page.x - 34} ${page.y + 44} q10 -26 20 0 t20 -4 q8 -16 18 6`} from={k.sign + 6} to={k.sign + 22} color="#1d3a8a" width={4} />
          <TopArm x0={signSeat.x + 30} y0={signSeat.y + 20} x1={pen.x} y1={pen.y} head={signSeat.head}>
            <rect x={-3} y={-4} width={6} height={30} rx={3} fill="#1d3a8a" transform="rotate(-30)" />
          </TopArm>
        </>
      )}
      <TopDownYou x={x} y={ax} step={frame * 0.32} look={look} held={frame >= k.charger + 14 ? <Charger scale={0.6} /> : undefined} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<OfficeBack cam={cam} view="floor" />} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ 54: stop looking

const FacesShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const S = 1.15;
  const hero: Body = { x: 760, y: OFFICE_DOOR.floor, scale: S, facing: -1, pose: STAND };
  const head = headAt(hero.x, hero.y, S, STAND, -1);
  const away = ramp(frame, k.stopLook, k.stopLook + 12);
  const sitters = [{ x: 170, head: PASTELS[0] }, { x: 500, head: DEV.head }];
  const seatTop = 850;
  const cam = drift(current(frame, [[k.faces, "two"], [k.stopLook - 10, "close"]]) === "two"
    ? camAt(frame, [[k.faces, { x: 500, y: 640, zoom: 1.5 }], [k.stopLook - 10, { x: 540, y: 640, zoom: 1.62 }]])
    : camAt(frame, [[k.stopLook - 10, closeUp(head.x - 60, head.y, 2.3)], [k.meeting, closeUp(head.x - 60, head.y + 6, 2.6)]]), frame, "faces", 3);
  const face = away > 0.5
    ? { ...EXPRESSIONS.sad, lids: 0.6, look: { x: 0.3, y: 0.95 } }
    : { ...EXPRESSIONS.worried, look: { x: 0.9, y: Math.sin(frame / 14) * 0.2 } };
  const actors = (
    <>
      {sitters.map((s, i) => {
        const y = seatedY(seatTop, S);
        const h = headAt(s.x, y, S, CHAIR_SIT, 1);
        return (
          <g key={i}>
            <Chair x={s.x - 6} y={seatTop} scale={S} facing={1} />
            <Figure x={s.x} y={y} scale={S} facing={1} pose={{ ...CHAIR_SIT, tilt: 6 }} head={s.head} coat={i ? DEV.coat : undefined}
              brows="raised" mouth="smile" eyes={1.05} look={{ x: 0.9, y: 0 }} blink={blinking(frame, i + 4)} time={frame} />
            {i === 1 && <Headphones x={s.x} y={y} scale={S} pose={CHAIR_SIT} facing={1} />}
            <YesTag frame={frame} at={k.floor} x={h.x} headY={h.y - 10} r={h.r} />
          </g>
        );
      })}
      <Figure {...HERO} {...hero} {...face} blink={blinking(frame, 1)} time={frame} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<OfficeBack cam={cam} view="doorway" />} actors={actors} front={<OfficeFront cam={cam} view="doorway" />} />;
};

// ------------------------------------------------------------------------------------------------ 55-61: the meeting room

/** The meeting room's people: the far side (Dev first), you at the left end, the boss at the head. */
function meetingCast(frame: number, k: T) {
  const tagAt = (i: number) => k.wave + i * 4; // 0-6 the far side, 7 the boss
  const sync = frame >= k.nodders && frame < k.diagram ? Math.max(0, Math.sin((frame - k.nodders) / 5)) * 4 : 0;
  const nod = (i: number) => (frame < tagAt(i) ? 0 : Math.max(0, Math.sin((frame - tagAt(i)) / 4)) * 5 * Math.max(0, 1 - (frame - tagAt(i)) / 50)) + sync;
  const far = FAR.map((p, i) => {
    const b: Body = { x: p.x, y: p.y, scale: MS, facing: -1, pose: { ...CHAIR_SIT, lean: nod(i), tilt: nod(i) * 1.2 } };
    return { ...p, b, h: headAt(p.x, p.y, MS, b.pose, -1), yes: frame >= tagAt(i) };
  });
  // Dev: his pen to the page at `pen`, signs, then caps it and taps the page in the hold.
  const dev = far[0];
  const toPage = ramp(frame, k.pen - 8, k.pen) * (1 - ramp(frame, k.pen + 30, k.pen + 40));
  const tap = frame >= k.hold + 18 ? Math.max(0, Math.sin((frame - k.hold - 18) / 3)) : 0;
  const capping = frame >= k.hold && frame < k.hold + 18;
  dev.b.pose = {
    ...dev.b.pose,
    armF: toPage > 0 ? aimArm(dev.b, { x: PAGE.x + 6 + Math.sin(frame / 2) * 6 * (frame > k.pen ? 1 : 0), y: PAGE.y - 14 })
      : tap > 0 || frame >= k.hold + 18 ? aimArm(dev.b, { x: PAGE.x + 4, y: PAGE.y - 14 - tap * 18 })
        : capping ? aimArm(dev.b, { x: dev.x - 40, y: dev.y - 190 }) : aimArm(dev.b, { x: dev.x - 50, y: PAGE.y - 8 }),
    armB: capping ? aimArm(dev.b, { x: dev.x - 30, y: dev.y - 185 }) : [10, 25],
  };
  const boss: Body = { x: BOSS_SEAT.x, y: BOSS_SEAT.y, scale: MS, facing: -1, pose: { ...CHAIR_SIT, lean: nod(7), tilt: nod(7) * 1.2 } };
  const slide = ramp(frame, k.flyer, k.flyer + 30);
  boss.pose = { ...boss.pose, armF: frame >= k.flyer - 4 && frame < k.flyer + 40 ? aimArm(boss, { x: BOSS_SEAT.x - 120 - slide * 10, y: OFFICE_MEETING.table.top - 6 }) : aimArm(boss, { x: BOSS_SEAT.x - 80, y: OFFICE_MEETING.table.top - 4 }) };
  const pushed = ramp(frame, k.hold + 4, k.hold + 22);
  const you: Body = { x: YOU_SEAT.x - pushed * 70, y: YOU_SEAT.y, scale: MS, facing: 1, pose: CHAIR_SIT };
  you.pose = { ...CHAIR_SIT, armF: aimArm(you, { x: OFFICE_MEETING.table.from + 16, y: OFFICE_MEETING.table.top - 4 }) };
  return { far, dev, boss, you, tagAt, slide, bh: headAt(boss.x, boss.y, MS, boss.pose, -1), yh: headAt(you.x, you.y, MS, you.pose, 1) };
}

const MeetingShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const c = meetingCast(frame, k);
  const shot = current(frame, [[k.meeting, "wide"], [k.board, "board"], [k.draft, "draft"], [k.ask, "ask"], [k.wave, "wave"],
    [k.nodders, "nodders"], [k.echo, "echo"], [k.round, "round"], [k.commits, "commits"], [k.flyer, "flyer"], [k.hold, "hold"], [k.grin, "grin"]]);
  const wb = OFFICE_MEETING.whiteboard;
  const flyerX = mix(BOSS_SEAT.x - 150, YOU_SEAT.x + 120, c.slide);
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.meeting, { x: 960, y: 580, zoom: 1.0 }], [k.board, { x: 960, y: 590, zoom: 1.08 }]]),
    board: camAt(frame, [[k.board, { x: wb.x, y: wb.y + 10, zoom: 1.9 }], [k.draft, { x: wb.x, y: wb.y + 10, zoom: 2.1 }]]),
    draft: camAt(frame, [[k.draft, closeUp(c.yh.x + 40, c.yh.y, 2.6)], [k.ask, closeUp(c.yh.x + 40, c.yh.y, 2.8)]]),
    ask: camAt(frame, [[k.ask, { x: 760, y: 600, zoom: 1.55 }], [k.wave, { x: 780, y: 600, zoom: 1.6 }]]),
    wave: camAt(frame, [[k.wave, { x: 980, y: 590, zoom: 1.25 }], [k.page, { x: 960, y: 600, zoom: 1.35 }]]),
    nodders: camAt(frame, [[k.nodders, { x: 900, y: 610, zoom: 1.85 }], [k.echo, { x: 1080, y: 610, zoom: 1.9 }]]),
    echo: camAt(frame, [[k.echo, closeUp(c.yh.x + 40, c.yh.y, 2.7)], [k.diagram, closeUp(c.yh.x + 40, c.yh.y, 2.95)]]),
    round: camAt(frame, [[k.round, { x: FAR[0].x, y: c.far[0].h.y + 10, zoom: 2.5 }], [k.commits, { x: BOSS_SEAT.x - 60, y: c.far[0].h.y + 20, zoom: 2.5 }]]),
    commits: camAt(frame, [[k.commits, { x: 960, y: 560, zoom: 1.12 }], [k.flyer, { x: 960, y: 570, zoom: 1.02 }]]),
    flyer: camAt(frame, [[k.flyer, { x: BOSS_SEAT.x - 220, y: 690, zoom: 1.7 }], [k.flyer + 34, { x: YOU_SEAT.x + 260, y: 690, zoom: 1.7 }], [k.flyerClose, { x: YOU_SEAT.x + 240, y: 680, zoom: 1.8 }]]),
    hold: camAt(frame, [[k.hold, { x: 500, y: 650, zoom: 1.85 }], [k.grin, { x: 490, y: 650, zoom: 1.9 }]]),
    grin: camAt(frame, [[k.grin, closeUp(c.dev.h.x - 20, c.dev.h.y, 2.6)], [k.end, closeUp(c.dev.h.x - 20, c.dev.h.y, 2.85)]]),
  };
  const cam = drift(cams[shot], frame, "meeting", 3);
  const yFace = ({
    wide: { ...EXPRESSIONS.worried, look: { x: 0.9, y: -0.2 } },
    board: { ...EXPRESSIONS.worried, look: { x: 0.9, y: -0.4 } },
    draft: { brows: "worry" as const, lids: 0.1, mouth: "smirk" as const, eyes: 1, look: { x: 0.7, y: -0.5 } },
    ask: { brows: "raised" as const, lids: 0, mouth: frame < k.wave ? talk(frame, k.ask, k.ask + 22) : "o" as const, eyes: 1.1, look: { x: 0.95, y: -0.1 } },
    wave: { ...EXPRESSIONS.shocked, look: { x: 0.95, y: -0.2 } },
    nodders: EXPRESSIONS.worried,
    echo: { ...EXPRESSIONS.sad, look: { x: 0.9, y: -0.1 } },
    round: EXPRESSIONS.worried,
    commits: { ...EXPRESSIONS.worried, look: { x: 0.95, y: -0.1 } },
    flyer: { ...EXPRESSIONS.afraid, look: { x: 0.8, y: 0.6 } },
    hold: { ...EXPRESSIONS.worried, look: { x: 0.9, y: -0.3 } },
    grin: { ...EXPRESSIONS.worried, look: { x: 0.9, y: -0.3 } },
  } as const)[shot];
  const smile = { brows: "raised" as const, lids: 0, mouth: "smile" as const, eyes: 1.05 };
  const before = { brows: "none" as const, lids: 0.1, mouth: "flat" as const, eyes: 1 };
  const devFace = shot === "hold" || shot === "grin"
    ? { brows: "raised" as const, lids: 0.3, mouth: "smirk" as const, eyes: 1, look: { x: 0.9, y: 0 } }
    : frame >= k.pen && frame < k.pen + 34 ? { ...smile, look: { x: 0.6, y: 0.9 } } : { ...(c.far[0].yes ? smile : before), look: { x: 0.9, y: 0 } };
  const signed = ramp(frame, k.pen, k.pen + 30);
  const bossTalks = (frame >= k.boss && frame < k.bossEnd) || (frame >= k.next && frame < k.nextEnd);
  const actors = (
    <>
      {c.far.map((p, i) => (
        <Figure key={i} {...p.b} head={p.head} coat={p.coat} {...(i === 0 ? devFace : { ...(p.yes ? smile : before), look: { x: 0.9, y: 0 } })}
          blink={blinking(frame, i + 3)} time={frame} held={i === 0 ? <Pen capped={frame >= k.hold + 10} tilt={frame >= k.pen ? 170 : 120} /> : undefined} />
      ))}
      <Headphones x={c.dev.x} y={c.dev.y} scale={MS} pose={c.dev.b.pose} facing={-1} />
      <MeetingTable />
      <TablePage x={PAGE.x} y={PAGE.y} signed={signed} />
      {frame >= k.flyer && frame < k.flyerClose + 4 && <FlyerSide x={flyerX} y={OFFICE_MEETING.table.top} />}
      {frame >= k.flyerClose + 4 && <FlyerSide x={YOU_SEAT.x + 120} y={OFFICE_MEETING.table.top} />}
      <Chair x={c.you.x - 6} y={c.you.y - 112 * MS} scale={MS} facing={1} />
      <Figure {...HERO} {...c.you} {...yFace} blink={blinking(frame, 1)} time={frame} />
      <Chair x={BOSS_SEAT.x + 6} y={BOSS_SEAT.y - 112 * MS} scale={MS} facing={-1} />
      <Figure {...c.boss} head={BOSS.head} tie={BOSS.tie} coat={BOSS.coat}
        {...(frame >= c.tagAt(7) ? smile : before)} mouth={bossTalks ? talk(frame, 0, Infinity) : frame >= c.tagAt(7) ? "smile" : "flat"}
        look={{ x: 0.9, y: 0 }} blink={blinking(frame, 9)} time={frame} />
      {c.far.map((p, i) => <YesTag key={`t${i}`} frame={frame} at={c.tagAt(i)} x={p.h.x} headY={p.h.y - 8} r={p.h.r} />)}
      <YesTag frame={frame} at={c.tagAt(7)} x={c.bh.x} headY={c.bh.y - 8} r={c.bh.r} />
      <Bubble frame={frame} at={k.ask} until={k.wave + 26} x={c.yh.x + c.yh.r * 0.6} y={c.yh.y - c.yh.r * 1.1} text="Do you agree?" size={30} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<><OfficeBack cam={cam} view="meeting" /><Tangle cam={cam} /></>} actors={actors} />;
};

/** Insert: Dev's hand and pen on the page, his signature drawing itself. */
const PageShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.page, { x: 960, y: 630, zoom: 1.7 }], [k.nodders, { x: 975, y: 640, zoom: 1.85 }]]), frame, "page", 2);
  const t = linear(frame, k.page + 4, k.page + 34);
  const pen = { x: 860 + t * 220, y: 690 + Math.sin(frame / 1.5) * 8 };
  const back = <rect x={-1000} y={-1000} width={4000} height={3000} fill="#6b4b3a" />;
  const actors = (
    <g>
      <g transform="translate(960 560) scale(2.6) translate(-960 -560)">
        <DeskPage x={960} y={560} />
      </g>
      <DrawLine d="M850 690 q30 -70 60 0 t60 -10 q24 -50 50 16 t40 -20" from={k.page + 4} to={k.page + 34} color="#1d3a8a" width={8} />
      <TopArm x0={1500} y0={1200} x1={pen.x + 40} y1={pen.y + 70} head={DEV.head}>
        <rect x={-6} y={-90} width={12} height={90} rx={5} fill="#1d3a8a" transform="rotate(-30)" />
      </TopArm>
    </g>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} />;
};

/** The ring diagram over the whiteboard. */
const DiagramShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const wb = OFFICE_MEETING.whiteboard;
  const cam = drift(camAt(frame, [[k.diagram, { x: wb.x, y: wb.y + 10, zoom: 2.0 }], [k.round, { x: wb.x, y: wb.y + 10, zoom: 2.3 }]]), frame, "ring", 2);
  const gap = Math.max(3, Math.floor((k.round - 20 - k.flatten) / 8));
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }}
      back={<><OfficeBack cam={cam} view="meeting" /><Tangle cam={cam} dim={0.4} /><RingDiagram cam={cam} frame={frame} at={k.diagram} flatten={k.flatten} gap={gap} /></>}
      actors={null} />
  );
};

/** Close on the flyer. */
const FlyerShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.flyerClose, { x: 1180, y: 420, zoom: 1.7 }], [k.rows - 6, { x: 1100, y: 440, zoom: 1.6 }], [k.rows + 10, { x: 960, y: 560, zoom: 1.45 }], [k.stage, { x: 960, y: 520, zoom: 1.5 }], [k.hold, { x: 960, y: 380, zoom: 2.3 }]]), frame, "flyer", 2);
  const back = <rect x={-1000} y={-1000} width={4000} height={3000} fill="#6b4b3a" />;
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={<FlyerTop x={960} y={540} frame={frame} ring={k.ring} rows={k.rows} />} />;
};

// ------------------------------------------------------------------------------------------------ the beat

const OfficeBeat: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const scene = current(frame, [[0, "floor"], [k.faces, "faces"], [k.meeting, "meeting"], [k.page, "page"], [k.nodders, "meeting"],
    [k.diagram, "diagram"], [k.round, "meeting"], [k.flyerClose, "flyer"], [k.hold, "meeting"]]);
  const flips = flipFrames(walkOf(k), k.climb + 4);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene === "floor" && <FloorShot frame={frame} k={k} />}
      {scene === "faces" && <FacesShot frame={frame} k={k} />}
      {scene === "meeting" && <MeetingShot frame={frame} k={k} />}
      {scene === "page" && <PageShot frame={frame} k={k} />}
      {scene === "diagram" && <DiagramShot frame={frame} k={k} />}
      {scene === "flyer" && <FlyerShot frame={frame} k={k} />}
      {/* the wake: a snap for every desk along the aisle (the far rows flip silently under them) */}
      {SEATS.map((s, i) => (s.row === 0 && flips[i] < k.faces ? <Sfx key={i} at={flips[i]} name="snap" volume={0.32} /> : null))}
      {Array.from({ length: 8 }, (_, i) => <Sfx key={`m${i}`} at={k.wave + i * 5} name="snap" volume={0.26} />)}
    </AbsoluteFill>
  );
};

export const office: Beat = { id: "office", firstLine: 52, Component: OfficeBeat };
