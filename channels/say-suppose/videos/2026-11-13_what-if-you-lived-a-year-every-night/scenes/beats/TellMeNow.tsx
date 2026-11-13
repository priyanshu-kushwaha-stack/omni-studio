// Beat "Tell Me Now" (script.md, ## [09:44] Tell Me Now; lines 92-97). The hatch opens on a dark counter; you pull the
// plug, coil the cable and hang it on the hook by the desk; the stairs; the kitchen in the morning (the library's
// kitchen: kettle, birds on the sill). Your flatmate at the table with her tea, not looking up: "So... my brother..."
// Your bubble: "Tell me now." She looks up, a long look; her hands come off the cup and she tells it; you pull a chair
// round and sit, elbows on the table. The last image: the two of you, and through the doorway behind her the cable on
// its hook and the dark counter. Your boss in the hall doorway with a coil of TWO plugs. The end card.
//
//   92  the hatch opens, counter dark / you pull the plug and coil the cable / hang it on the hook / the stairs / the
//       kitchen, she doesn't look up
//   93  close on her: "So... my brother..."
//   hold (4 s, performed) your bubble "Tell me now." / she looks up, a long look / her hands start moving; you pull the
//        chair round and sit, elbows on the table
//   94  the two of you, closer    95  the last image, the doorway behind her
//   96  the hall doorway: your boss steps in grinning, a coil with two plugs: "Two plugs."
//   97  back at the table, dimmed: COMMENT, LIKE, SUBSCRIBE tags in the left two-thirds; the end card holds 4 s
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { lerpPose, SEATED, seatedY, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { kitchen } from "@whatif/kit/sets/Kitchen";
import { setLook, worldOf } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { Bubble, Cable } from "../parts";
import { FLOOR, POD_ONE, PodHallBack, podHallLights } from "../sets/PodHall";
import { camAt, current, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { aimArm, Boss, Coil, handAt, headOf, Hook, lineTimes, Mate, moodAt, Plug, You, type Body, type Face } from "./Timeline.Cast";
import { Birds, EndCard, HallStairs, HER_SEAT, KitchenChair, KitchenDoorway, stairsAt, Table, TABLE } from "./TellMeNow.Kitchen";

const FIRST = 92;
type T = ReturnType<typeof times>;

function times(shot: Shot) {
  const L = lineTimes(shot.clips, FIRST);
  const s = L.from(1) - L.from(0);
  const sp = (p: number) => Math.round(L.from(0) + s * p);
  const h = L.from(2) - L.end(1);
  const hp = (p: number) => Math.round(L.end(1) + h * p);
  return {
    start: shot.from, end: shot.to,
    doorUp: [sp(0.0), sp(0.1)] as const, unplug: sp(0.2), pull: [sp(0.22), sp(0.3)] as const, coil: [sp(0.28), sp(0.4)] as const,
    hook: sp(0.42), hang: [sp(0.46), sp(0.56)] as const, stairs: sp(0.6), kitchen: sp(0.8),
    l93: L.from(1), l93End: L.end(1),
    bubble: [hp(0.03), hp(0.4)] as const, look: hp(0.32), lookUp: hp(0.36), hands: hp(0.55), chair: [hp(0.5), hp(0.66)] as const,
    sit: hp(0.58), seat: [hp(0.66), hp(0.84)] as const,
    l94: L.from(2), l95: L.from(3),
    boss: L.from(4) - 14, bossIn: [L.from(4) - 14, L.from(4) - 2] as const, bossLine: [L.from(4), L.end(4)] as const,
    card: L.end(4) + 6, comment: L.at(5, 0.28), like: L.at(5, 0.74), subscribe: L.at(5, 0.86),
  };
}

const LIP = { x: POD_ONE.x + 150, y: POD_ONE.y + POD_ONE.h - 6 };
const SOCKET = { x: POD_ONE.x + POD_ONE.w - 24, y: POD_ONE.y + 72 };
const HOOK = { x: 60, y: 700 };

// ------------------------------------------------------------------------------------------------ the hall

const Hall: React.FC<{ frame: number; k: T; on: string; mood: MoodName }> = ({ frame, k, on, mood }) => {
  const cams: Record<string, Camera> = {
    hatch: camAt(frame, [[k.start, { x: 610, y: 700, zoom: 1.9 }], [k.unplug, { x: 620, y: 700, zoom: 2.05 }]]),
    unplug: camAt(frame, [[k.unplug, { x: 640, y: 760, zoom: 2.3 }], [k.hook, { x: 640, y: 770, zoom: 2.45 }]]),
    hook: camAt(frame, [[k.hook, { x: 240, y: 690, zoom: 1.7 }], [k.stairs, { x: 230, y: 690, zoom: 1.8 }]]),
    stairs: camAt(frame, [[k.stairs, { x: 1880, y: 700, zoom: 1.3 }], [k.kitchen, { x: 1980, y: 580, zoom: 1.3 }]]),
    boss: camAt(frame, [[k.boss, { x: 1640, y: 680, zoom: 1.7 }], [k.card, { x: 1640, y: 680, zoom: 1.85 }]]),
  };
  const cam = drift(cams[on], frame, "tellmenow", 2.5);
  const seat = worldOf(cam, LIP.x, LIP.y, 0.85);
  const socket = worldOf(cam, SOCKET.x, SOCKET.y, 0.85);
  const inside = worldOf(cam, POD_ONE.x + 60, POD_ONE.y + 150, 0.85);
  const hook = worldOf(cam, HOOK.x, HOOK.y, 0.85);
  const door = ramp(frame, k.doorUp[0], k.doorUp[1]);
  let actors: React.ReactNode = null;

  if (on === "hatch" || on === "unplug") {
    const out = ramp(frame, k.doorUp[0] + 6, k.doorUp[1] + 10);
    const you: Body = { x: seat.x - 40 * (1 - out), y: seatedY(seat.y, 0.95), scale: 0.95, facing: 1, pose: { ...SEATED, lean: mix(-20, 6, out) } };
    const lap = { x: seat.x + 58, y: seat.y - 28 };
    const pull = ramp(frame, k.pull[0], k.pull[1]);
    const plugAt = { x: mix(socket.x - 18, lap.x, pull), y: mix(socket.y, lap.y, pull) };
    const wound = ramp(frame, k.coil[0], k.coil[1]);
    const coiled = frame >= k.coil[0] + 4;
    you.pose = { ...you.pose, armF: aimArm(you, coiled ? { x: lap.x, y: lap.y - 30 } : plugAt), armB: coiled ? aimArm(you, { x: lap.x - 20, y: lap.y - 20 }) : [30, 40] };
    const face: Face = frame < k.unplug
      ? { brows: "none", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 0.9, y: -0.3 } }
      : { brows: "flat", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.6 } };
    actors = (
      <>
        <rect x={socket.x - 14} y={socket.y - 16} width={28} height={32} rx={5} fill="#0d0f18" stroke="#3a4363" strokeWidth={3} />
        {door > 0.4 && <You body={you} face={face} frame={frame} />}
        {!coiled && door > 0.4 && (
          <>
            <Cable d={`M${plugAt.x - 20} ${plugAt.y + 4} C ${plugAt.x - 10} ${plugAt.y + 90}, ${plugAt.x - 30} ${FLOOR - 16}, ${seat.x - 60} ${FLOOR - 18} S ${seat.x - 100} ${seat.y + 10}, ${inside.x + 30} ${inside.y + 20}`} width={7} />
            <Plug x={plugAt.x} y={plugAt.y} angle={-10 * pull} />
          </>
        )}
        {coiled && <Coil x={lap.x - 6} y={lap.y - 70} r={30} wound={wound} />}
      </>
    );
  } else if (on === "hook") {
    const you: Body = { x: 200, y: FLOOR, scale: 1.08, facing: -1, pose: STAND };
    const hang = ramp(frame, k.hang[0], k.hang[1]);
    const reachTo = { x: mix(hook.x + 30, hook.x, hang), y: mix(hook.y + 40, hook.y, hang) };
    const after = frame >= k.hang[1] - 2;
    you.pose = { ...STAND, lean: 4, armF: aimArm(you, after ? { x: hook.x + 40, y: hook.y + 140 } : reachTo) };
    const hand = handAt(you);
    actors = (
      <>
        <Hook x={hook.x} y={hook.y} />
        <You body={you} face={{ brows: "none", lids: 0.2, mouth: after ? "smile" : "flat", eyes: 1, look: { x: 0.7, y: after ? 0 : -0.6 } }} frame={frame} />
        <Coil x={after ? hook.x : hand.x} y={after ? hook.y : hand.y - 8} r={34} />
      </>
    );
  } else if (on === "stairs") {
    const p = linear(frame, k.stairs, k.kitchen + 6) * 0.95;
    const feet = stairsAt(p);
    actors = (
      <>
        <HallStairs />
        <You body={{ x: feet.x, y: feet.y, scale: 1.05, facing: 1, pose: walkPose(frame * 0.35) }}
          face={{ brows: "raised", lids: 0, mouth: "flat", eyes: 1, look: { x: 1, y: -0.4 } }} frame={frame} />
      </>
    );
  } else {
    // your boss steps into the lit doorway at the foot of the stairs, a new coil with two plugs in both hands
    const step = ramp(frame, k.bossIn[0], k.bossIn[1]);
    const boss: Body = { x: mix(1820, 1630, step), y: FLOOR, scale: 1.12, facing: -1, pose: step < 1 ? walkPose(frame * 0.3) : STAND };
    const coilAt = { x: boss.x - 70, y: FLOOR - 250 };
    boss.pose = { ...boss.pose, armF: aimArm(boss, { x: coilAt.x - 10, y: coilAt.y + 30 }), armB: aimArm(boss, { x: coilAt.x + 26, y: coilAt.y + 34 }) };
    const speaking = frame >= k.bossLine[0] && frame < k.bossLine[1] + 4;
    actors = (
      <>
        <HallStairs door />
        <Boss body={boss} face={{ brows: "raised", lids: 0.15, mouth: speaking ? "open" : "smile", eyes: 1.05, look: { x: 1, y: 0 } }} frame={frame} />
        <Coil x={coilAt.x} y={coilAt.y} r={38} plugs={2} />
      </>
    );
  }
  return (
    <LookContext.Provider value={setLook(podHallLights(), mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={<PodHallBack cam={cam} frame={frame} door={door} counter={{ dark: true }} wedge minutes={0} />}
        actors={actors} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ the kitchen

const OPTIONS = { stove: "kettle" as const, steam: 0.7, counter: [] as ("mug" | "glass" | "tiffin")[] };
const CUP = 1060;

function herBody(frame: number, k: T): Body {
  const her: Body = { x: HER_SEAT, y: seatedY(TABLE.seat, 1.05), scale: 1.05, facing: -1, pose: SEATED };
  const tell = ramp(frame, k.hands, k.hands + 10);
  const g = (a: number) => Math.sin(frame / 7 + a);
  const cupF = { x: CUP + 14, y: TABLE.top - 26 }, cupB = { x: CUP + 34, y: TABLE.top - 18 };
  const tf = { x: her.x - 110 + 26 * g(0), y: TABLE.top - 120 + 30 * g(1.3) };
  const tb = { x: her.x - 70 + 20 * g(2), y: TABLE.top - 90 + 26 * g(0.4) };
  her.pose = {
    ...SEATED, lean: mix(-2, 6, tell),
    armF: aimArm(her, { x: mix(cupF.x, tf.x, tell), y: mix(cupF.y, tf.y, tell) }),
    armB: aimArm(her, { x: mix(cupB.x, tb.x, tell), y: mix(cupB.y, tb.y, tell) }),
  };
  return her;
}

function yourBody(frame: number, k: T): { body: Body; chairX: number } {
  const chairX = mix(690, 880, ramp(frame, k.chair[0], k.chair[1]));
  const sit = ramp(frame, k.seat[0], k.seat[1]);
  const x = frame < k.chair[0] ? 760 : mix(760, 880, sit);
  const pose: Pose = lerpPose({ ...STAND, armF: [frame >= k.chair[0] && frame < k.seat[0] ? -40 : 9, 20] }, { ...SEATED, lean: 16 }, sit);
  const body: Body = { x, y: mix(FLOOR, seatedY(TABLE.seat, 1.05), sit), scale: 1.05, facing: 1, pose };
  if (sit >= 1) body.pose = { ...body.pose, armF: aimArm(body, { x: x + 120, y: TABLE.top - 6 }), armB: aimArm(body, { x: x + 96, y: TABLE.top - 4 }) };
  return { body, chairX };
}

const Kitchen: React.FC<{ frame: number; k: T; on: string; mood: MoodName }> = ({ frame, k, on, mood }) => {
  const her = herBody(frame, k);
  const hh = headOf(her);
  const { body: you, chairX } = yourBody(frame, k);
  const yh = headOf(you);
  const cams: Record<string, Camera> = {
    kitchen: camAt(frame, [[k.kitchen, { x: 960, y: 600, zoom: 1.12 }], [k.l93, { x: 980, y: 620, zoom: 1.2 }]]),
    her: camAt(frame, [[k.l93, closeUp(hh.x - 60, hh.y + 30, 2.2)], [k.bubble[0], closeUp(hh.x - 60, hh.y + 30, 2.35)]]),
    bubble: camAt(frame, [[k.bubble[0], { x: 960, y: 640, zoom: 1.55 }], [k.look, { x: 970, y: 640, zoom: 1.6 }]]),
    look: camAt(frame, [[k.look, closeUp(hh.x - 40, hh.y + 20, 2.4)], [k.sit, closeUp(hh.x - 40, hh.y + 20, 2.7)]]),
    sit: camAt(frame, [[k.sit, { x: 990, y: 700, zoom: 1.5 }], [k.l94, { x: 1000, y: 700, zoom: 1.6 }]]),
    two: camAt(frame, [[k.l94, { x: 1010, y: 710, zoom: 1.75 }], [k.l95, { x: 1015, y: 710, zoom: 1.85 }]]),
    last: camAt(frame, [[k.l95, { x: 1180, y: 600, zoom: 1.1 }], [k.boss, { x: 1160, y: 610, zoom: 1.18 }]]),
    end: camAt(frame, [[k.card, { x: 820, y: 620, zoom: 0.95 }], [k.end, { x: 810, y: 630, zoom: 1.02 }]]),
  };
  const cam = drift(cams[on], frame, "kitchen-now", 2.5);
  const props = { cam, mood, frame, options: OPTIONS };
  const looking = frame >= k.lookUp;
  const telling = frame >= k.hands;
  const herFace: Face = !looking
    ? { brows: "none", lids: 0.45, mouth: frame >= k.l93 && frame < k.l93End + 4 ? "open" : "flat", eyes: 1, look: { x: 0.6, y: 0.85 } }
    : !telling
      ? { brows: "raised", lids: 0, mouth: "flat", eyes: 1.12, look: { x: 1, y: -0.05 } }
      : { brows: "raised", lids: 0.05, mouth: Math.floor((frame - k.hands) / 14) % 3 === 1 ? "open" : "smile", eyes: 1.05, look: { x: 1, y: 0 } };
  const yourFace: Face = frame < k.bubble[0]
    ? { brows: "none", lids: 0.1, mouth: "flat", eyes: 1, look: { x: 1, y: 0.25 } }
    : { brows: "raised", lids: 0, mouth: "smile", eyes: 1.05, look: { x: 1, y: 0.1 } };
  const actors = (
    <>
      <KitchenChair x={HER_SEAT + 8} facing={-1} />
      <KitchenChair x={chairX} facing={1} />
      <Mate body={her} face={herFace} frame={frame} />
      <You body={you} face={yourFace} frame={frame} />
      <Table cupAt={CUP} />
      <Bubble frame={frame} at={k.bubble[0]} until={k.bubble[1]} x={yh.x + 34} y={yh.y - yh.r - 14} text="Tell me now." size={44} side="right" />
    </>
  );
  return (
    <LookContext.Provider value={setLook(kitchen.lights(OPTIONS), mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={<>{kitchen.Back(props)}<KitchenDoorway cam={cam} /><Birds cam={cam} frame={frame} /></>} actors={actors} />
    </LookContext.Provider>
  );
};

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = times(shot);
  const { frame } = shot;
  const mood = moodAt(shot, "morning");
  const on = current(frame, [[0, "hatch"], [k.unplug, "unplug"], [k.hook, "hook"], [k.stairs, "stairs"], [k.kitchen, "kitchen"],
    [k.l93, "her"], [k.bubble[0], "bubble"], [k.look, "look"], [k.sit, "sit"], [k.l94, "two"], [k.l95, "last"], [k.boss, "boss"],
    [k.card, "end"]] as [number, string][]);
  const inHall = on === "hatch" || on === "unplug" || on === "hook" || on === "stairs" || on === "boss";
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {inHall ? <Hall frame={frame} k={k} on={on} mood={mood} /> : <Kitchen frame={frame} k={k} on={on} mood={mood} />}
      {on === "end" && <EndCard frame={frame} dim={ramp(frame, k.card, k.card + 15)} comment={k.comment} like={k.like} subscribe={k.subscribe} />}
      <Sequence from={k.doorUp[0]} durationInFrames={40}><Audio src={staticFile("sfx/hatch.wav")} volume={0.7} /></Sequence>
      <Sequence from={k.pull[1] - 4} durationInFrames={14}><Audio src={staticFile("sfx/click.wav")} volume={0.4} /></Sequence>
    </AbsoluteFill>
  );
};

export const tellMeNow: Beat = { id: "TellMeNow", firstLine: FIRST, Component: Scene };
