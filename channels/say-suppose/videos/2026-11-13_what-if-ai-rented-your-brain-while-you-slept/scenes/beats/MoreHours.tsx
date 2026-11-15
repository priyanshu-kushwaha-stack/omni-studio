// Beat "More Hours" (script.md ## [04:01] More Hours; narration lines 33-43). A "therefore" chain, fast, then THE
// picture only this premise can show, then the cost. Every frame comes from the narration clips (`at(i, p)`).
//
//   33  the bus: you slumped at the window, the band lights, the pale worker rises and types, two coins into your lap,
//       a bus-shelter ad slides by with a small subscribe tag; the bus stops, empty, you wake; the driver's eyes in the
//       mirror; INSERT your palm, two coins; the craving (a pickle in a thought cloud)
//   34  the mirror again: a teal light comes on under the driver's cap; the clinic at noon (builder A's Clinic): the
//       nurse with a light under her paper cap pulls the blind; INSERT the clock at twelve; she goes, the door shuts;
//       the office: the jar on your desk, your boss sees it; the door with the bed plate, unlocked; the till
//   35  the boss at the till by the pillows: "Twenty per cent. Pillows are mine."; you, with your pillow
//   36  across the street, the couple's doorway: the band handed over like a baton; INSERT their window, the jar never
//       stops; the warehouse by the bridge (builder C's front), cots carried in; the clerk with the clipboard
//   37  the grandmother's window: three jars; INSERT her worker typing like a storm; pull back: her neighbours, one jar
//   38  her face: "Finally."
//   39  dusk, your street (WindowStreet): the coffee shop's paper sign and its shutter; the pillow shop lit, a queue;
//       your window; then (hold, 5 s) the pull back and up past a hundred windows; late windows light; the stranger
//       walks under the lamp below, never looking up (the only time)
//   40  your window: the clock runs, the jar becomes a shelf of jars
//   41  your hall: the empty hook, your pockets; the cash machine: your finger stops over the keys; your street: you
//       walk past your door, turn, past it again
//   hold (4 s) you sit on the wrong step, look up and down; your brother comes out of the right door two along, sits,
//       thumbs over his shoulder
//   42  him: "You live here."; your face
//   43  the two of you on the step, the camera easing back; close on you looking at your door
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, seatedY, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { bankAtm, officeDesk, SetScene } from "@whatif/kit/sets";
import { worldOf } from "@whatif/kit/sets/common";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { INK } from "@whatif/kit/theme";
import { Band, ClinkSound, Coin, CoinArc, DeviceSound, deviceAt, Ghost, Jar, landings, PaperCap, Thread } from "../parts";
import { CLINIC, ClinicScene } from "../sets/Clinic";
import { WAREHOUSE, warehouseFront } from "../sets/Warehouse";
import { StrangerWalking, windowIndex, WindowStreetScene, WS, yourWindow } from "../sets/WindowStreet";
import { BOSS, CLERK, GHOST, HERO, NURSE, PASTELS, blinking, camAt, current, lineEnd, linear, mix, noise, ramp, type Beat, type Shot } from "../shared";
import { aimArm, Brother, handAt, headOf, Pickle, talk, ThoughtCloud, You, type Body, type Face } from "./Crumbs.Rig";
import { BusAd, BusStage, COUPLE, CoupleHouse, DoorRowBack, DOORS, GranWall, GranWindow, GRAN_WIN, HallBack, HALL, Lit, Mirror, NAP,
  NapRoomBack, NapRoomProps } from "./MoreHours.Places";
import { NewsWindow, newsSpan, NoonBunk, noonSpan } from "./V5.More";
import { isV5, V5 } from "./V5.Kit";

type T = ReturnType<typeof times>;

function times(clips: Clip[], start: number, end: number, v3: Clip[]) {
  const from = (i: number) => clips[i].from;
  // v5: the news (58) and noon on the bunk (59-61) sit between v1's 39 and 40, so the pull back ends before the news
  // and the shelf of jars opens on "So you push the nights instead." (62)
  const v5 = isV5(v3);
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const h39 = lineEnd(clips, 39);
  const h41 = lineEnd(clips, 41);
  const g41 = from(42) - h41;
  const in41 = (p: number) => Math.round(h41 + g41 * p);
  return {
    start, end,
    // 33: the bus
    bus: from(33), on: from(33) + 6, medium: at(33, 0.12), coins: from(33) + 20, wake: at(33, 0.31), mirror: at(33, 0.42),
    palm: at(33, 0.57), pickles: at(33, 0.76),
    // 34-35: the driver, the clinic, the office, the nap room, the till
    driver: from(34), driverBand: from(34) + 14, clinic: at(34, 0.15), blind: [at(34, 0.18), at(34, 0.33)] as const, noon: at(34, 0.36),
    nurseOut: at(34, 0.43), office: at(34, 0.54), bossEyes: at(34, 0.63), napDoor: at(34, 0.77), doorOpen: [at(34, 0.81), at(34, 0.88)] as const,
    till: at(34, 0.9), ding: at(34, 0.95),
    twenty: [from(35), at(35, 0.42)] as const, pillows: [at(35, 0.5), at(35, 0.95)] as const, youPillow: at(35, 0.8),
    // 36: the couple, the warehouse, the clerk
    street: from(36), couple: at(36, 0.15), pass: [at(36, 0.22), at(36, 0.3)] as const, inside: at(36, 0.33), jarNever: at(36, 0.38),
    warehouse: at(36, 0.51), clerk: at(36, 0.79),
    // 37-38: the grandmother
    gran: from(37), storm: at(37, 0.38), outEarn: at(37, 0.68), finally: [from(38), lineEnd(clips, 38)] as const,
    // 39-40: the hundred windows
    coffee: from(39), sign: from(39) + 8, shut: [at(39, 0.28), at(39, 0.38)] as const, pillow: at(39, 0.44), yours: at(39, 0.72),
    pull: [at(39, 0.8), v5 ? Math.max(at(39, 0.8) + 2, newsSpan(v3).from - 8) : h39 + Math.round((from(40) - h39) * 0.85)] as const,
    stranger: [h39 + 10, v5 ? newsSpan(v3).from : from(40)] as const, hold: h39,
    shelf: v5 ? v3[V5.push].from - 3 : from(40), clockRuns: v5 ? v3[V5.push].from - 3 : from(40),
    jars: v5 ? Math.round(v3[V5.push].from + v3[V5.push].frames * 0.72) : at(40, 0.55), // "Your jar becomes a shelf of jars."
    // 41 + hold + 42-43: the cost
    hall: from(41), keys: at(41, 0.21), pockets: at(41, 0.28), atm: at(41, 0.36), keypad: at(41, 0.42), atmFace: at(41, 0.55),
    doors: at(41, 0.67), turn: at(41, 0.86), sit: in41(0.2), broOut: in41(0.3), broWalk: [in41(0.36), in41(0.78)] as const,
    broSit: in41(0.84), thumb: in41(0.9), live: [from(42), lineEnd(clips, 42)] as const, sheepish: lineEnd(clips, 42) - 4,
    // v1 43 was cut in v6 (a one-frame placeholder): its three shots fold into the beat's last frames, strictly increasing
    ...(clips[43].frames > 1 ? { last: from(43), lastClose: at(43, 0.39), lastWide: at(43, 0.78) }
      : { last: end - 3, lastClose: end - 2, lastWide: end - 1 }),
  };
}

// ------------------------------------------------------------------------------------------------ 33-34: the bus

const BUS_YOU = { x: 1360, y: seatedY(840, 1.1), scale: 1.1, facing: -1 as const };
const BUS_GHOST = { x: 1140, y: 640, scale: 0.75 };
const LAP = { x: 1300, y: 830 };

const BusShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const asleep = frame < k.wake;
  const t = deviceAt(frame, k.on, k.wake - 2);
  const body: Body = { ...BUS_YOU, pose: asleep ? { ...SEATED, lean: -4, tilt: -16 } : { ...SEATED, tilt: 0 } };
  if (frame >= k.palm && frame < k.pickles) body.pose = { ...body.pose, armF: aimArm(body, { x: 1250, y: 760 }) };
  const h = headOf(body);
  const light = { x: h.x - h.r * 0.62, y: h.y - h.r * 0.6 };
  const face: Face = asleep ? { brows: "none", lids: 1, mouth: "smile", eyes: 1, look: { x: 0.3, y: 0.3 } }
    : frame < k.palm ? { brows: "raised", lids: 0.1, mouth: "o", eyes: 1.2, look: { x: 0.9, y: -0.1 } }
      : frame < k.pickles ? { brows: "raised", lids: 0, mouth: "smile", eyes: 1.1, look: { x: 0.6, y: 0.8 } }
        : { brows: "raised", lids: 0.45, mouth: "smile", eyes: 1, look: { x: 0.4, y: -0.7 } };
  const coinsHeld = (
    <g><Coin x={-8} y={-6} r={12} /><Coin x={10} y={-12} r={12} tilt={30} /></g>
  );
  const shot = current(frame, [[k.bus, "wide"], [k.medium, "medium"], [k.wake, "awake"], [k.mirror, "mirror"], [k.palm, "palm"],
    [k.pickles, "pickles"], [k.driver, "mirror2"]]);
  const hand = handAt(body);
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.bus, { x: 1120, y: 580, zoom: 1.12 }], [k.medium, { x: 1160, y: 590, zoom: 1.2 }]]),
    medium: camAt(frame, [[k.medium, { x: 1230, y: 640, zoom: 1.65 }], [k.wake, { x: 1250, y: 650, zoom: 1.8 }]]),
    awake: camAt(frame, [[k.wake, { x: 1000, y: 580, zoom: 1.0 }], [k.mirror, { x: 1050, y: 590, zoom: 1.08 }]]),
    mirror: { x: 700, y: 150, zoom: 2.4 },
    palm: camAt(frame, [[k.palm, insert(hand.x, hand.y - 20, 3.4)], [k.pickles, insert(hand.x, hand.y - 20, 3.8)]]),
    pickles: camAt(frame, [[k.pickles, closeUp(h.x - 60, h.y - 40, 2.3)], [k.driver, closeUp(h.x - 60, h.y - 40, 2.5)]]),
    mirror2: { x: 700, y: 150, zoom: 2.6 },
  };
  const cam = drift(cams[shot], frame, "more-bus", 3);
  const adX = 2300 - (frame - k.bus) * 7;
  const mirrorOn = shot === "mirror" || shot === "mirror2";
  const actors = (
    <>
      <BusAd cam={cam} x={adX} />
      <You body={body} face={face} frame={frame} band held={frame >= k.palm && frame < k.pickles ? coinsHeld : undefined} />
      <Thread a={light} b={{ x: BUS_GHOST.x + 30, y: BUS_GHOST.y - 170 * BUS_GHOST.scale }} t={t} bend={120} />
      <Ghost x={BUS_GHOST.x} y={BUS_GHOST.y} scale={BUS_GHOST.scale} t={t} frame={frame} facing={-1} />
      <CoinArc frame={frame} start={k.coins} end={k.coins + 18} from={{ x: 1010, y: 540 }} via={{ x: 1180, y: 400 }} to={LAP} every={18} fall={26} r={14} />
      {frame >= k.coins + 26 && frame < k.palm && <Coin x={LAP.x - 10} y={LAP.y} r={14} />}
      {frame >= k.coins + 44 && frame < k.palm && <Coin x={LAP.x + 14} y={LAP.y - 4} r={14} tilt={20} />}
      <ThoughtCloud x={h.x - 40} y={h.y - 60} t={ramp(frame, k.pickles + 10, k.pickles + 24)} side={-1} size={120}><Pickle s={1} /></ThoughtCloud>
      {mirrorOn && (
        <Mirror x={700} y={150} look={1} brows={frame < k.driver ? "flat" : "raised"} band={shot === "mirror2" ? ramp(frame, k.driverBand, k.driverBand + 10) : 0}
          blink={blinking(frame, 9)} />
      )}
    </>
  );
  return <BusStage frame={frame} streetFrame={Math.min(frame, k.wake)} cam={cam} mood="day" hangers={asleep ? 2 : 0} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ 34: the clinic at noon

const ClinicShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const W = CLINIC.window;
  const out = ramp(frame, k.nurseOut, k.nurseOut + 22);
  const nurse: Body = { x: mix(560, 1675, out), y: CLINIC.floor - 10, scale: 1.3, facing: out > 0 ? 1 : -1, pose: STAND };
  const pulling = frame < k.noon;
  if (pulling) nurse.pose = { ...STAND, armB: frame < k.blind[1] ? aimArm(nurse, { x: 480, y: mix(420, 640, ramp(frame, k.blind[0], k.blind[1])) }) : STAND.armB };
  else if (out > 0) nurse.pose = walkPose(frame * 0.22);
  const h = headOf(nurse);
  const shot = current(frame, [[k.clinic, "wide"], [k.noon, "clock"], [k.nurseOut, "out"]]);
  const lock = (x: number, d: number, ref: number) => (x - ref * (1 - d)) / d;
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.clinic, { x: 760, y: 560, zoom: 1.25 }], [k.noon, { x: 640, y: 560, zoom: 1.45 }]]),
    clock: camAt(frame, [[k.noon, insert(lock(CLINIC.clock.x, 0.86, 960), lock(CLINIC.clock.y, 0.86, 540), 4.0)], [k.nurseOut, insert(lock(CLINIC.clock.x, 0.86, 960), lock(CLINIC.clock.y, 0.86, 540), 4.4)]]),
    out: camAt(frame, [[k.nurseOut, { x: 1100, y: 580, zoom: 1.1 }], [k.office, { x: 1150, y: 580, zoom: 1.15 }]]),
  };
  const cam = drift(cams[shot], frame, "more-clinic", 3);
  // the blind drops over the window (the window is on the back wall, depth 0.86)
  const b = worldOf(cam, W.x, W.y, 0.86);
  const drop = ramp(frame, k.blind[0], k.blind[1]);
  const face: Face = { brows: "none", lids: 0.4, mouth: "smile", eyes: 1, look: { x: 0.8, y: -0.2 } };
  const actors = (
    <>
      <rect x={b.x} y={b.y} width={W.w} height={W.h * drop} fill="#efe6d4" stroke={INK} strokeWidth={4} />
      {Array.from({ length: Math.floor(drop * 8) }, (_, i) => <line key={i} x1={b.x} x2={b.x + W.w} y1={b.y + 40 + i * 44} y2={b.y + 40 + i * 44} stroke="#cdbfa6" strokeWidth={4} />)}
      {out < 1 && (
        <g opacity={1 - ramp(frame, k.nurseOut + 16, k.nurseOut + 22)}>
          <Figure head={NURSE.head} coat={NURSE.coat} {...nurse} {...face} blink={blinking(frame, 7)} time={frame} />
          <PaperCap x={h.x} y={h.y} r={h.r} lit />
          <circle cx={h.x + h.r * 0.5} cy={h.y - h.r * 0.5} r={h.r * 0.5} fill={GHOST.light} opacity={0.25} />
        </g>
      )}
    </>
  );
  const minutes = 720 - Math.floor(k.noon / 30) / 60;
  return <ClinicScene frame={frame} mood="day" cam={cam} actors={actors} door={frame < k.nurseOut ? 0 : 1 - ramp(frame, k.nurseOut + 22, k.nurseOut + 30)} clock={minutes} />;
};

// ------------------------------------------------------------------------------------------------ 34-35: the office, the nap room

const OfficeShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const desk = officeDesk.spots.desk;
  const cabin = officeDesk.spots.cabin;
  const bossBody: Body = { x: cabin.x, y: cabin.y, scale: cabin.scale, facing: cabin.facing, pose: STAND };
  const bh = headOf(bossBody);
  const shot = current(frame, [[k.office, "wide"], [k.bossEyes, "boss"]]);
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.office, { x: 1180, y: 580, zoom: 1.15 }], [k.bossEyes, { x: 1240, y: 590, zoom: 1.25 }]]),
    boss: camAt(frame, [[k.bossEyes, closeUp(bh.x - 40, bh.y, 2.5)], [k.napDoor, closeUp(bh.x - 40, bh.y, 2.75)]]),
  };
  const bossFace = frame < k.bossEyes + 20 ? { brows: "flat" as const, lids: 0.45, mouth: "flat" as const, eyes: 1, look: { x: 1, y: 0.5 } }
    : { brows: "angry" as const, lids: 0.3, mouth: "smirk" as const, eyes: 1, look: { x: 1, y: 0.5 } };
  return (
    <SetScene set={officeDesk} mood="day" frame={frame} cam={drift(cams[shot], frame, "more-office", 3)} options={{ screen: "code" }}
      cast={[
        { spot: "desk", who: { ...HERO, look: { x: 0.9, y: 0.3 }, blink: blinking(frame, 1) }, face: { brows: "none", lids: 0.5, mouth: "flat", eyes: 1 } },
        { spot: "cabin", who: { ...BOSS, look: bossFace.look, blink: blinking(frame, 5) }, face: { ...bossFace } },
      ]}
      actors={<Jar x={1180} y={762} w={90} h={115} fill={0.7} />} />
  );
};

const NapShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const open = ramp(frame, k.doorOpen[0], k.doorOpen[1]);
  const atTill = frame >= k.till;
  const boss: Body = { x: atTill ? 1360 : 1190, y: NAP.floor, scale: 1.15, facing: -1, pose: STAND };
  if (!atTill && frame < k.doorOpen[1]) boss.pose = { ...STAND, armF: aimArm(boss, { x: NAP.door.x + NAP.door.w / 2 - 30, y: 680 + Math.sin(frame / 3) * 4 }) };
  if (atTill) boss.pose = { ...STAND, armF: aimArm(boss, { x: NAP.till.x + 40, y: NAP.till.y - 60 }) };
  if (frame >= k.pillows[0]) boss.pose = { ...boss.pose, armB: aimArm(boss, { x: 1460, y: 880 + Math.abs(Math.sin(frame / 4)) * 16 }) };
  const bh = headOf(boss);
  const you: Body = { x: 760, y: NAP.floor, scale: 1.1, facing: 1, pose: { ...STAND, armF: [40, 60] } };
  const yh = headOf(you);
  const drawer = ramp(frame, k.ding, k.ding + 5);
  const shot = current(frame, [[k.napDoor, "door"], [k.till, "till"], [k.twenty[0], "boss"], [k.youPillow, "you"]]);
  const cams: Record<typeof shot, Camera> = {
    door: camAt(frame, [[k.napDoor, { x: 1060, y: 620, zoom: 1.45 }], [k.till, { x: 1100, y: 640, zoom: 1.55 }]]),
    till: camAt(frame, [[k.till, insert(NAP.till.x + 20, NAP.till.y - 40, 3.0)], [k.twenty[0], insert(NAP.till.x + 20, NAP.till.y - 40, 3.3)]]),
    boss: camAt(frame, [[k.twenty[0], { x: bh.x + 10, y: bh.y + 150, zoom: 2.0 }], [k.youPillow, { x: bh.x + 20, y: bh.y + 150, zoom: 2.15 }]]),
    you: closeUp(yh.x + 40, yh.y, 2.6),
  };
  const talking = talk(frame, k.twenty[0] + 2, k.twenty[1], "smirk") !== "smirk" ? talk(frame, k.twenty[0] + 2, k.twenty[1], "smirk") : talk(frame, k.pillows[0], k.pillows[1], "smirk");
  const bossFace: Face = { brows: "angry", lids: 0.3, mouth: frame >= k.twenty[0] ? talking : "smirk", eyes: 1, look: { x: 1, y: frame >= k.twenty[0] ? -0.1 : 0.2 } };
  const pillow = <rect x={-40} y={-30} width={80} height={46} rx={18} fill="#f7f4ee" stroke={INK} strokeWidth={4} />;
  const actors = (
    <>
      <NapRoomProps drawer={drawer} />
      <Figure {...BOSS} {...boss} {...bossFace} blink={blinking(frame, 5)} time={frame}
        held={!atTill && frame < k.doorOpen[1] ? <g><circle r={8} fill="none" stroke="#c9ced6" strokeWidth={4} /><rect x={4} y={-3} width={22} height={6} fill="#c9ced6" /></g> : undefined} />
      {frame >= k.twenty[0] && <You body={you} face={{ brows: frame >= k.youPillow ? "flat" : "raised", lids: frame >= k.youPillow ? 0.5 : 0.1, mouth: "flat", eyes: 1, look: { x: 1, y: 0 } }} frame={frame} held={pillow} />}
    </>
  );
  const cam = drift(cams[shot], frame, "more-nap", 3);
  return <Lit cam={cam} mood="day" back={<NapRoomBack cam={cam} open={open} />} actors={actors} glows={[{ x: 1000, y: 600, r: 300, color: "#bfefff", strength: 0.2 }]} />;
};

// ------------------------------------------------------------------------------------------------ 36: the couple, the warehouse

const CoupleShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const D = COUPLE.door;
  const goB = ramp(frame, k.couple, k.pass[0]);
  const awayB = ramp(frame, k.pass[1], k.jarNever);
  const bx = mix(D.x, D.x + 200, goB) + awayB * 500;
  const comeA = ramp(frame, k.couple - 20, k.pass[0] + 6);
  const inA = ramp(frame, k.pass[1], k.inside);
  const ax = mix(260, D.x - 150, comeA) + inA * 150;
  const handed = frame >= Math.round((k.pass[0] + k.pass[1]) / 2);
  const B: Body = { x: bx, y: COUPLE.floor - 40, scale: 1.1, facing: 1, pose: goB < 1 || awayB > 0 ? walkPose(frame * 0.2) : STAND };
  if (frame >= k.pass[0] - 6 && frame < k.pass[1]) B.pose = { ...STAND, armB: [-70, 0] };
  const A: Body = { x: ax, y: COUPLE.floor - (inA > 0 ? 40 : 0), scale: 1.1, facing: 1, pose: comeA < 1 || inA > 0 ? walkPose(frame * 0.2 + 1) : STAND };
  if (frame >= k.pass[0] - 6 && frame < k.pass[1] + 6) A.pose = { ...A.pose, armF: [84, 0] };
  const bBack = handAt(B, "back");
  const band = handed ? null : <Band x={bBack.x} y={bBack.y} scale={0.6} lit={false} />;
  const shot = current(frame, [[k.street, "wide"], [k.couple, "door"], [k.jarNever, "window"]]);
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.street, { x: 960, y: 560, zoom: 1.0 }], [k.couple, { x: 920, y: 580, zoom: 1.1 }]]),
    door: camAt(frame, [[k.couple, { x: 860, y: 640, zoom: 1.6 }], [k.jarNever, { x: 880, y: 640, zoom: 1.7 }]]),
    window: camAt(frame, [[k.jarNever, { x: COUPLE.window.x + 260, y: COUPLE.window.y + 200, zoom: 2.0 }], [k.warehouse, { x: COUPLE.window.x + 280, y: COUPLE.window.y + 210, zoom: 2.2 }]]),
  };
  const cam = drift(cams[shot], frame, "more-couple", 3);
  const sleeper = ramp(frame, k.inside, k.inside + 14);
  const actors = (
    <>
      {inA < 1 && (
        <g opacity={1 - ramp(frame, k.inside - 8, k.inside)}>
          <Figure x={A.x} y={A.y} scale={A.scale} facing={1} pose={A.pose} head={PASTELS[3]} coat="#9fc0e0" mouth={frame < k.pass[0] ? "o" : "smile"} eyes={0.9} lids={0.5}
            look={{ x: 1, y: 0 }} blink={blinking(frame, 3)} time={frame} held={handed ? <Band x={0} y={0} scale={0.6} lit={false} /> : undefined} />
        </g>
      )}
      {awayB < 1 && (
        <g>
          <Figure x={B.x} y={B.y} scale={B.scale} facing={1} pose={B.pose} head={PASTELS[5]} coat="#3d4a66" mouth="o" eyes={1} lids={0.2} brows="raised"
            look={{ x: 1, y: 0 }} blink={blinking(frame, 4)} time={frame} />
          {band}
        </g>
      )}
      {frame >= k.pass[0] && frame < k.pass[1] + 4 && [0, 1, 2].map((i) => (
        <line key={i} x1={bBack.x - 30 - i * 10} y1={bBack.y - 30 + i * 30} x2={bBack.x - 80 - i * 10} y2={bBack.y - 30 + i * 30} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      ))}
    </>
  );
  return <Lit cam={cam} mood="day" back={<CoupleHouse cam={cam} mood="day" frame={frame} open={frame < k.couple ? 0 : 1 - ramp(frame, k.inside + 4, k.inside + 14)} sleeper={sleeper} coinsFrom={k.jarNever} />} actors={actors} />;
};

const WarehouseShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const D = WAREHOUSE.door;
  const p = linear(frame, k.warehouse - 10, k.clerk + 30);
  const carry = (lead: number, i: number) => {
    const x = mix(2000, D.x + 40, Math.min(1, p * 1.4 - lead));
    const pose: Pose = { ...walkPose(frame * 0.22 + i), armF: [70, 20], armB: [60, 30] };
    return { x, pose };
  };
  const carriers = [0, 0.45].map((lead, n) => {
    const a = carry(lead, n * 2);
    const b = { x: a.x + 260, pose: { ...walkPose(frame * 0.22 + n * 2 + 1.4), armF: [70, 20], armB: [60, 30] } as Pose };
    const fade = ramp(a.x, D.x + 40, D.x + 120);
    return (
      <g key={n} opacity={Math.max(0, fade)}>
        <Figure x={a.x} y={WAREHOUSE.floor} scale={1.05} facing={-1} pose={a.pose} head={PASTELS[n * 2]} coat="#e8792f" mouth="flat" time={frame} blink={blinking(frame, n)} />
        <rect x={a.x - 20} y={WAREHOUSE.floor - 180} width={300} height={22} rx={6} fill="#7a8a9c" stroke={INK} strokeWidth={4} />
        <line x1={a.x + 10} y1={WAREHOUSE.floor - 158} x2={a.x + 30} y2={WAREHOUSE.floor - 130} stroke={INK} strokeWidth={5} />
        <line x1={a.x + 250} y1={WAREHOUSE.floor - 158} x2={a.x + 230} y2={WAREHOUSE.floor - 130} stroke={INK} strokeWidth={5} />
        <Figure x={b.x} y={WAREHOUSE.floor} scale={1.05} facing={-1} pose={b.pose} head={PASTELS[n * 2 + 1]} coat="#e8792f" mouth="flat" time={frame} blink={blinking(frame, n + 3)} />
      </g>
    );
  });
  const clerk = WAREHOUSE.clerk;
  const tick = Math.sin(frame / 3) * 6;
  const clerkBody: Body = { x: clerk.x, y: clerk.y, scale: clerk.scale, facing: clerk.facing, pose: { ...STAND, armF: [70, 50], armB: [60, 70 + tick] } };
  const ch = headOf(clerkBody);
  const board = <g transform="rotate(-10)"><rect x={-26} y={-44} width={52} height={66} rx={4} fill="#c9a36b" stroke={INK} strokeWidth={3} /><rect x={-20} y={-34} width={40} height={48} fill="#f7f4ee" /></g>;
  const shot = current(frame, [[k.warehouse, "wide"], [k.clerk, "clerk"]]);
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.warehouse, { x: 1100, y: 560, zoom: 1.0 }], [k.clerk, { x: 1060, y: 580, zoom: 1.12 }]]),
    clerk: camAt(frame, [[k.clerk, closeUp(ch.x - 30, ch.y + 30, 2.3)], [k.gran, closeUp(ch.x - 30, ch.y + 30, 2.5)]]),
  };
  return (
    <SetScene set={warehouseFront} mood="day" frame={frame} cam={drift(cams[shot], frame, "more-wh", 3)} options={{ door: 1, inside: "cots", crate: true, streetLamp: true }}
      cast={[]}
      actors={
        <>
          {carriers}
          <Figure {...CLERK} {...clerkBody} brows="flat" lids={0.35} mouth="flat" eyes={1} look={{ x: 0.8, y: 0.6 }} blink={blinking(frame, 8)} time={frame} held={board} />
        </>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ 37-38: the grandmother

const GranShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const G = GRAN_WIN;
  const storm = frame >= k.storm && frame < k.outEarn ? 3 : 1.6;
  const shot = current(frame, [[k.gran, "window"], [k.storm, "storm"], [k.outEarn, "back"], [k.finally[0] - 4, "face"]]);
  const head = { x: G.x + 180, y: G.y + G.h - 150 };
  const cams: Record<typeof shot, Camera> = {
    window: camAt(frame, [[k.gran, { x: 960, y: 520, zoom: 1.3 }], [k.storm, { x: 960, y: 530, zoom: 1.4 }]]),
    storm: { x: G.x + 520, y: G.y + 300, zoom: 2.2 },
    back: camAt(frame, [[k.outEarn, { x: 960, y: 520, zoom: 1.2 }], [k.finally[0] - 4, { x: 960, y: 500, zoom: 0.58 }]]),
    face: closeUp(head.x + 40, head.y - 20, 2.6),
  };
  const cam = drift(cams[shot], frame, "more-gran", 3);
  const speaking = frame >= k.finally[0] && frame < k.finally[1] + 6;
  const fill = mix(0.4, 0.85, linear(frame, k.gran, k.finally[0]));
  return (
    <Lit cam={cam} mood="day" back={<GranWall cam={cam} frame={frame} fill={fill} />}
      actors={<GranWindow frame={frame} fill={fill} storm={storm} eyes={speaking ? "open" : "shut"} mouth={speaking ? (Math.floor(frame / 4) % 2 ? "o" : "smile") : "smile"} />}
      glows={[{ x: 960, y: 500, r: 500, color: "#bfefff", strength: 0.25 }]} />
  );
};

// ------------------------------------------------------------------------------------------------ 39-40: the hundred windows

/** Log-space zoom between two cameras, so a pull back from 6x to 0.85x moves evenly. */
function pullCam(a: Camera, b: Camera, t: number): Camera {
  const z = Math.exp(mix(Math.log(a.zoom), Math.log(b.zoom), t));
  // keep the start point on screen as long as possible: blend the centre with the same curve as the zoom
  const u = (1 / z - 1 / a.zoom) / (1 / b.zoom - 1 / a.zoom);
  return { x: mix(a.x, b.x, u), y: mix(a.y, b.y, u), zoom: z };
}

/** Windows that light late, during the hold (a chime here and there). */
const lateOn = (i: number, k: T) => (noise(i * 7 + 3) < 0.1 ? k.hold + 10 + Math.round(noise(i + 91) * 120) : -999);
const lateWindows = (k: T) => Array.from({ length: WS.cols * WS.rows }, (_, i) => lateOn(i, k)).filter((f) => f > 0).sort((a, b) => a - b);

const StreetShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const Y = yourWindow();
  const shot = current(frame, [[k.coffee, "coffee"], [k.pillow, "pillow"], [k.yours, "yours"], [k.shelf, "shelf"]]);
  const start: Camera = { x: Y.x, y: Y.y + 4, zoom: 6.2 };
  const final: Camera = { x: 960, y: 370, zoom: 0.85 };
  const cams: Record<typeof shot, Camera> = {
    coffee: camAt(frame, [[k.coffee, { x: 470, y: 830, zoom: 2.6 }], [k.shut[1], { x: 500, y: 830, zoom: 2.4 }]]),
    pillow: camAt(frame, [[k.pillow, { x: 1300, y: 850, zoom: 2.1 }], [k.yours, { x: 1420, y: 850, zoom: 2.0 }]]),
    yours: pullCam(start, final, ramp(frame, k.pull[0], k.pull[1])),
    shelf: camAt(frame, [[k.shelf, { x: Y.x, y: Y.y + 4, zoom: 5.4 }], [k.end, { x: Y.x, y: Y.y + 4, zoom: 6.0 }]]),
  };
  const cam = drift(cams[shot], frame, "more-street", shot === "yours" ? 1 : 2);
  const jars = frame < k.jars ? 1 : Math.min(6, 2 + Math.floor((frame - k.jars) / 7));
  const sx = mix(420, 1020, linear(frame, k.stranger[0], k.stranger[1]));
  const stranger = frame >= k.stranger[0] && frame < k.stranger[1] ? (
    <StrangerWalking x={sx} y={WS.pavement + 46} scale={0.6} pose={walkPose(frame * 0.2)} frame={frame} />
  ) : null;
  return (
    <WindowStreetScene frame={frame} mood="dusk" cam={cam} onAt={(i) => (i === windowIndex(WS.yours.col, WS.yours.row) ? -999 : lateOn(i, k))}
      jars={jars} clock={frame >= k.clockRuns ? (frame - k.clockRuns) * 0.45 : 0.4} shut={ramp(frame, k.shut[0], k.shut[1])} sign={frame >= k.sign}
      queue={5} actors={stranger} />
  );
};

// ------------------------------------------------------------------------------------------------ 41-43: the cost

const HallShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const you: Body = { x: 900, y: HALL.floor, scale: 1.15, facing: 1, pose: STAND };
  const reaching = frame >= k.keys - 20 && frame < k.pockets;
  if (reaching) you.pose = { ...STAND, armF: aimArm(you, { x: HALL.hook.x - 27, y: HALL.hook.y + 14 + Math.sin(frame / 3) * 4 }) };
  if (frame >= k.pockets) you.pose = { ...STAND, armF: [18 + Math.sin(frame / 2) * 10, 60], armB: [-18 - Math.sin(frame / 2.3) * 10, 60] };
  const h = headOf(you);
  const face: Face = frame < k.keys ? { brows: "none", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 1, y: -0.2 } }
    : frame < k.pockets ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 1, y: -0.2 } }
      : { brows: "worry", lids: 0.1, mouth: "wobble", eyes: 1.1, look: { x: 0.4, y: 0.7 } };
  const shot = current(frame, [[k.hall, "wide"], [k.keys, "hook"], [k.pockets, "you"]]);
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.hall, { x: 1000, y: 600, zoom: 1.2 }], [k.keys, { x: 960, y: 590, zoom: 1.35 }]]),
    hook: camAt(frame, [[k.keys, insert(HALL.hook.x - 10, HALL.hook.y + 10, 3.4)], [k.pockets, insert(HALL.hook.x - 10, HALL.hook.y + 10, 3.7)]]),
    you: camAt(frame, [[k.pockets, { x: h.x + 30, y: h.y + 160, zoom: 2.0 }], [k.atm, { x: h.x + 30, y: h.y + 150, zoom: 2.15 }]]),
  };
  const cam = drift(cams[shot], frame, "more-hall", 3);
  return <Lit cam={cam} mood="day" back={<HallBack cam={cam} />} actors={<You body={you} face={face} frame={frame} />} />;
};

const AtmShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const spot = bankAtm.spots.atm;
  const you: Body = { x: spot.x, y: spot.y, scale: spot.scale, facing: 1, pose: STAND };
  const key = { x: 1500, y: 600 };
  const press = frame < k.keypad + 8 ? Math.abs(Math.sin(frame / 4)) * 16 : 22;
  you.pose = { ...STAND, armF: aimArm(you, { x: key.x - 10, y: key.y - press }) };
  const h = headOf(you);
  const shot = current(frame, [[k.atm, "wide"], [k.keypad, "keys"], [k.atmFace, "face"]]);
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.atm, { x: 1340, y: 600, zoom: 1.45 }], [k.keypad, { x: 1360, y: 600, zoom: 1.55 }]]),
    keys: camAt(frame, [[k.keypad, insert(key.x, key.y + 10, 3.2)], [k.atmFace, insert(key.x, key.y + 10, 3.5)]]),
    face: camAt(frame, [[k.atmFace, closeUp(h.x + 40, h.y, 2.6)], [k.doors, closeUp(h.x + 40, h.y, 2.9)]]),
  };
  const face: Face = frame < k.keypad ? { brows: "none", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 1, y: 0.3 } }
    : { brows: "worry", lids: 0, mouth: "flat", eyes: 1.15, look: { x: 0.2, y: -0.1 } };
  return (
    <SetScene set={bankAtm} mood="day" frame={frame} cam={drift(cams[shot], frame, "more-atm", 3)} options={{ screen: "menu", queue: 2 }} cast={[]}
      actors={<You body={you} face={face} frame={frame} />} />
  );
};

const STEP_SIT: Pose = { ...SEATED, legB: [64, -40], legF: [70, -44] };

/** Your x on your street: past your door, turn, past it again, to the wrong step. */
function youOnStreet(f: number, k: T) {
  if (f < k.turn) return { x: mix(700, 1180, linear(f, k.doors, k.turn)), facing: 1 as const, walking: true };
  if (f < k.turn + 6) return { x: 1180, facing: -1 as const, walking: false };
  if (f < k.sit - 6) return { x: mix(1180, 380, linear(f, k.turn + 6, k.sit - 6)), facing: -1 as const, walking: true };
  return { x: 380, facing: -1 as const, walking: false };
}

const DoorsShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const w = youOnStreet(frame, k);
  const sitting = frame >= k.sit - 6;
  const you: Body = sitting ? { x: 360, y: DOORS.step + 112 * 1.15, scale: 1.15, facing: -1, pose: STEP_SIT }
    : { x: w.x, y: DOORS.floor + 10, scale: 1.15, facing: w.facing, pose: w.walking ? walkPose(frame * 0.3) : STAND };
  const looking = frame >= k.sit && frame < k.broOut ? (Math.floor((frame - k.sit) / 12) % 2 ? -1 : 1) : 0;
  const yh = headOf(you);
  // your brother: out of your door, walks left, sits beside you, thumbs over his shoulder at your door
  const broX = frame < k.broWalk[0] ? DOORS.yours : mix(DOORS.yours, 480, linear(frame, k.broWalk[0], k.broWalk[1]));
  const broSitting = frame >= k.broSit;
  const bro: Body = broSitting ? { x: 480, y: DOORS.step + 112 * 1.15, scale: 1.15, facing: -1, pose: STEP_SIT }
    : { x: broX, y: frame < k.broWalk[0] ? DOORS.step : DOORS.floor + 10, scale: 1.15, facing: -1, pose: frame >= k.broWalk[0] ? walkPose(frame * 0.3) : STAND };
  if (frame >= k.thumb) bro.pose = { ...bro.pose, armB: [-140, -30] };
  const bh = headOf(bro);
  const open = frame < k.broOut ? 0 : 1 - ramp(frame, k.broWalk[0] + 20, k.broWalk[0] + 34);
  const youFace: Face = frame < k.sit ? { brows: "none", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 1, y: 0 } }
    : frame < k.sheepish ? { brows: "worry", lids: 0.1, mouth: "flat", eyes: 1.05, look: { x: looking === 0 ? 0.6 : looking, y: 0 } }
      : frame < k.lastClose ? { brows: "raised", lids: 0.3, mouth: "smile", eyes: 1, look: { x: -0.9, y: -0.1 } }
        : { brows: "sad", lids: 0.4, mouth: "flat", eyes: 1, look: { x: -1, y: -0.2 } };
  const broFace: Face = { brows: frame >= k.live[0] ? "raised" : "none", lids: 0.3, mouth: talk(frame, k.live[0], k.live[1] + 4, "smile"), eyes: 1, look: { x: 1, y: 0 } };
  const shot = current(frame, [[k.doors, "walk"], [k.sit - 6, "step"], [k.broOut, "two"], [k.live[0], "live"], [k.sheepish, "you"], [k.last, "last"],
    [k.lastClose, "close"], [k.lastWide, "wide"]]);
  const cams: Record<typeof shot, Camera> = {
    walk: { x: w.x + (w.facing === 1 ? 120 : -120), y: 680, zoom: 1.4 },
    step: closeUp(yh.x - 30, yh.y + 40, 2.2),
    two: camAt(frame, [[k.broOut, { x: 660, y: 700, zoom: 1.3 }], [k.live[0], { x: 640, y: 710, zoom: 1.4 }]]),
    live: closeUp((yh.x + bh.x) / 2, bh.y + 40, 2.1),
    you: closeUp(yh.x - 20, yh.y, 2.6),
    last: camAt(frame, [[k.last, { x: 600, y: 700, zoom: 1.6 }], [k.lastClose, { x: 640, y: 660, zoom: 1.25 }]]),
    close: camAt(frame, [[k.lastClose, closeUp(yh.x - 20, yh.y, 2.6)], [k.lastWide, closeUp(yh.x - 20, yh.y, 2.8)]]),
    wide: camAt(frame, [[k.lastWide, { x: 700, y: 640, zoom: 1.3 }], [k.end, { x: 760, y: 600, zoom: 1.1 }]]),
  };
  const cam = drift(cams[shot], frame, "more-doors", 3);
  const actors = (
    <>
      {frame >= k.broOut && <Brother body={bro} face={broFace} frame={frame} />}
      <You body={you} face={youFace} frame={frame} />
    </>
  );
  return <Lit cam={cam} mood="day" back={<DoorRowBack cam={cam} mood="day" open={open} />} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ the beat

const MoreHoursShot: React.FC<{ frame: number; k: T; v3: Clip[] }> = ({ frame, k, v3 }) => {
  if (isV5(v3)) {
    const news = newsSpan(v3);
    const noon = noonSpan(v3);
    if (frame >= news.from && frame < news.to) return <NewsWindow frame={frame} v3={v3} />;
    if (frame >= noon.from && frame < noon.to) return <NoonBunk frame={frame} v3={v3} />;
  }
  if (frame < k.clinic) return <BusShot frame={frame} k={k} />;
  if (frame < k.office) return <ClinicShot frame={frame} k={k} />;
  if (frame < k.napDoor) return <OfficeShot frame={frame} k={k} />;
  if (frame < k.street) return <NapShot frame={frame} k={k} />;
  if (frame < k.warehouse) return <CoupleShot frame={frame} k={k} />;
  if (frame < k.gran) return <WarehouseShot frame={frame} k={k} />;
  if (frame < k.coffee) return <GranShot frame={frame} k={k} />;
  if (frame < k.hall) return <StreetShot frame={frame} k={k} />;
  if (frame < k.atm) return <HallShot frame={frame} k={k} />;
  if (frame < k.doors) return <AtmShot frame={frame} k={k} />;
  return <DoorsShot frame={frame} k={k} />;
};

const MoreHours: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = times(shot.clips, shot.from, shot.to, shot.v3);
  const late = lateWindows(k);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <MoreHoursShot frame={shot.frame} k={k} v3={shot.v3} />
      <DeviceSound at={k.on} frames={k.wake - k.on} volume={0.8} />
      <ClinkSound at={landings(k.coins, k.coins + 18, 18, 26)} volume={0.6} />
      <DeviceSound at={k.driverBand} frames={0} volume={0.5} />
      <DeviceSound at={k.jarNever} frames={k.warehouse - k.jarNever} chime={false} volume={0.6} />
      <ClinkSound at={landings(k.jarNever, k.warehouse - 20, 6, 18).filter((_, i) => i % 2 === 0)} volume={0.35} />
      <Sequence from={k.ding} durationInFrames={20}><Audio src={staticFile("sfx/clink.wav")} volume={0.5} /></Sequence>
      <Sequence from={k.sign} durationInFrames={20}><Audio src={staticFile("sfx/paper.wav")} volume={0.4} /></Sequence>
      {/* the hundred windows: the patter of a hundred keyboards, coins landing in glass, a chime as a late window lights */}
      <DeviceSound at={k.yours} frames={k.shelf - k.yours} chime={false} volume={1.4} />
      <ClinkSound at={Array.from({ length: Math.floor((k.shelf - k.yours) / 5) }, (_, i) => k.yours + 6 + i * 5 + Math.round(noise(i) * 3))} volume={0.35} />
      {late.slice(0, 5).map((f) => <DeviceSound key={f} at={f} frames={0} volume={0.35} />)}
      <ClinkSound at={Array.from({ length: Math.max(0, 6 - 1) }, (_, i) => k.jars + 7 * i)} volume={0.6} />
      <Sequence from={k.broOut} durationInFrames={20}><Audio src={staticFile("sfx/knock.wav")} volume={0.25} /></Sequence>
    </AbsoluteFill>
  );
};

export const moreHours: Beat = { id: "moreHours", firstLine: 33, Component: MoreHours };

