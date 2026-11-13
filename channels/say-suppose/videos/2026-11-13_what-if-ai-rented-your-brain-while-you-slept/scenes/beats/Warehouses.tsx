// Beat "The Warehouses" (script.md ## The Warehouses; narration lines 62-70). The price of a night falls for everyone.
//
//   62   three breakfasts in one dissolve: the band on the table, its split-flap falling $90, $41, $12; the two of you
//        at the table, glum.
//   63   the bridge at dusk, the queue walking in, three brokers in grey suits with shoeboxes at the far end; INSERT the
//        paper map, one country shaded, a pale river running out to the world; a broker hands a walker a band and it
//        lights ("Now they cross to sleep").
//   64   night: the warehouse by the bridge from the street, the roller door up on the rows; inside, the rows of cots,
//        the pale workers, the threads to the rafters, the coins into the trough.
//   65   INSERT the chess robot: the cabinet's little door opens on the man inside; the laptop of little tasks, tiny
//        coins. Back inside, up to the rafters: the human inside the machine, in bulk.
//   66   the clerk at the door with his clipboard, looking at each sleeper's eyes: one waved in; INSERT the clipboard,
//        two faces in six crossed out; a grey-eyed one turned away.
//   67   INSERT the labeller at night, boxes round shapes, a few tiny coins; back inside, the coins stop.
//   68   midnight, the door, one lamp: your brother walks up, cap on, band on, grey under the eyes.
//   hold (4 s, performed) the clerk looks him up and down; lifts the brim with one finger, looks at the teal light,
//        lets the brim drop; shakes his head once.
//   69   "Rested ones only." (the clerk's voice)
//   hold (2 s, performed) he walks home, cap in his hand, the teal light going dark.
//   70   along the bridge under the lamps; the man in the grey suit under the far lamp, watching him go.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { joints, HEAD_R, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { SetScene } from "@whatif/kit/sets";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { Band, ClinkSound, DeviceSound, headAt, landings, PayFlap } from "../parts";
import { BRIDGE, BridgeScene } from "../sets/Bridge";
import { WAREHOUSE, warehouseFront, warehouseInside, type WarehouseFrontOptions } from "../sets/Warehouse";
import { BROTHER, camAt, CLERK, current, GHOST, lineEnd, mix, PASTELS, ramp, type Beat, type Shot } from "../shared";
import { aimArm, handOf, PaperInsert, Sfx, talk, type Body } from "./NightShift.Rig";
import { FaceMarks } from "./NightShift.Rooms";
import { MorningKitchen } from "./Photo.Parts";
import { BTABLE, Breakfast, Broker, CapAndBand, ChessSheet, ClipboardSheet, HeldCap, LabelSheet, MapSheet, TableThings } from "./Warehouses.Parts";

type T = ReturnType<typeof times>;

function times(clips: Clip[], start: number, end: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const h4 = lineEnd(clips, 68) + 2; // performed: the brim
  const in4 = (p: number) => Math.round(h4 + (from(69) - h4) * p);
  const h5 = lineEnd(clips, 69) + 2; // performed: he walks home
  return {
    start, end,
    flaps: [at(62, 0.02), at(62, 0.2), at(62, 0.38)] as const, wideTable: at(62, 0.55),
    bridge: from(63) - 2, map: at(63, 0.12), flow: [at(63, 0.2), at(63, 0.46)] as const, cross: at(63, 0.48),
    sleep: at(63, 0.78), lit: at(63, 0.9),
    front: from(64) - 2, inside: at(64, 0.24), rows: at(64, 0.62),
    chess: from(65) - 2, door: at(65, 0.2), cents: at(65, 0.42), bulk: at(65, 0.72),
    clerkA: from(66) - 2, nodA: at(66, 0.16), inA: [at(66, 0.2), at(66, 0.36)] as const, clip: at(66, 0.36),
    clerkB: at(66, 0.62), shakeB: at(66, 0.68), awayB: [at(66, 0.76), lineEnd(clips, 66) + 8] as const,
    label: from(67) - 2, heading: at(67, 0.6),
    arrive: from(68) - 2, walkIn: [from(68), lineEnd(clips, 68)] as const,
    h4, look: [in4(0.02), in4(0.26)] as const, lift: [in4(0.3), in4(0.4)] as const, drop: in4(0.62), shake: [in4(0.74), in4(0.96)] as const,
    rested: [from(69), lineEnd(clips, 69)] as const, closeClerk: from(69) - 2,
    h5, home: from(70) - 2, broker: at(70, 0.6),
  };
}

type Name = "flap" | "wideTable" | "bridge" | "map" | "cross" | "sleep" | "front" | "inside" | "rows" | "chess" | "bulk"
  | "clerkA" | "clip" | "clerkB" | "label" | "heading" | "arrive" | "brim" | "closeClerk" | "walkOff" | "home" | "broker";

const shotAt = (f: number, k: T): Name => current<Name>(f, [[k.start, "flap"], [k.wideTable, "wideTable"], [k.bridge, "bridge"],
  [k.map, "map"], [k.cross, "cross"], [k.sleep, "sleep"], [k.front, "front"], [k.inside, "inside"], [k.rows, "rows"], [k.chess, "chess"],
  [k.bulk, "bulk"], [k.clerkA, "clerkA"], [k.clip, "clip"], [k.clerkB, "clerkB"], [k.label, "label"], [k.heading, "heading"],
  [k.arrive, "arrive"], [k.h4, "brim"], [k.closeClerk, "closeClerk"], [k.h5, "walkOff"], [k.home, "home"], [k.broker, "broker"]]);

// ---------------------------------------------------------------- 62: three breakfasts

const BreakfastBit: React.FC<{ frame: number; k: T; wide: boolean }> = ({ frame, k, wide }) => {
  const m = frame >= k.flaps[2] ? 2 : frame >= k.flaps[1] ? 1 : 0;
  const values = ["$90", "$41", "$12"];
  const cam: Camera = wide
    ? camAt(frame, [[k.wideTable, { x: 960, y: 600, zoom: 1.12 }], [k.bridge, { x: 980, y: 610, zoom: 1.2 }]])
    : camAt(frame, [[k.start, insert(BTABLE.band.x, 700, 2.6)], [k.wideTable, insert(BTABLE.band.x, 700, 3.0)]]);
  const glum = { brows: "sad" as const, lids: 0.35 + m * 0.1, mouth: "flat" as const, look: { x: 0.9, y: 0.6 } };
  const scene = (mm: number) => (
    <MorningKitchen frame={frame} cam={drift(cam, frame, "wh-table", 2)} jarFill={0.95}
      actors={
        <g>
          <Breakfast frame={frame} morning={mm} youFace={glum} broFace={{ ...glum, look: { x: 0.9, y: 0.7 } }} />
          <TableThings morning={mm} />
          {values.map((v, i) => (
            <PayFlap key={v} frame={frame} at={k.flaps[i]} until={i < 2 ? k.flaps[i + 1] : undefined} x={BTABLE.band.x} y={wide ? 660 : 690}
              value={v} size={wide ? 44 : 60} />
          ))}
        </g>
      } />
  );
  // a dissolve: the morning before fades out over the new one for 10 frames
  const prev = m > 0 ? 1 - ramp(frame, k.flaps[m], k.flaps[m] + 10) : 0;
  return (
    <AbsoluteFill>
      {scene(m)}
      {prev > 0.01 && <AbsoluteFill style={{ opacity: prev }}>{scene(m - 1)}</AbsoluteFill>}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 63: the bridge at dusk

const BROKERS = [1500, 1640, 1780];
const WALKER = { x: 1360, head: PASTELS[5], coat: "#5a6488" };

const BridgeBit: React.FC<{ frame: number; k: T; shot: Name }> = ({ frame, k, shot }) => {
  const scale = 1.1;
  const close = shot === "sleep";
  const giving = close ? ramp(frame, k.sleep + 4, k.sleep + 16) * (1 - ramp(frame, k.lit - 6, k.lit)) : 0;
  const wb: Body = { x: WALKER.x, y: BRIDGE.floor, scale, facing: 1, pose: STAND };
  const wHead = headAt(WALKER.x, BRIDGE.floor, scale, STAND, 1);
  const handing = { x: wHead.x + 70, y: wHead.y + 140 };
  const bk: Body = { x: BROKERS[0], y: BRIDGE.floor, scale, facing: -1, pose: STAND };
  const armF = close && frame < k.lit ? aimArm(bk, { x: mix(BROKERS[0] - 40, handing.x, giving), y: mix(BRIDGE.floor - 180, handing.y, giving) }) : ([10, 14] as [number, number]);
  bk.pose = { ...STAND, armF };
  const hand = handOf(bk, armF);
  // the walker takes it and it goes on: his arm to his forehead, then the light
  const on = frame >= k.lit;
  const wArm = close && frame >= k.lit - 6 && frame < k.lit + 8 ? aimArm(wb, { x: wHead.x + 10, y: wHead.y - 30 }) : ([8, 12] as [number, number]);
  wb.pose = { ...STAND, armF: wArm };
  const cam: Camera = close
    ? camAt(frame, [[k.sleep, { x: 1440, y: 700, zoom: 2.1 }], [k.front, { x: 1430, y: 690, zoom: 2.3 }]])
    : shot === "cross"
      ? camAt(frame, [[k.cross, { x: 1150, y: 690, zoom: 1.55 }], [k.sleep, { x: 1250, y: 690, zoom: 1.6 }]])
      : camAt(frame, [[k.bridge, { x: 960, y: 560, zoom: 1.0 }], [k.map, { x: 1020, y: 560, zoom: 1.08 }]]);
  return (
    <BridgeScene frame={frame} mood="dusk" cam={drift(cam, frame, "wh-bridge", 3)} queue={close ? 0 : 7} walk={1.6}
      under={
        <g>
          {BROKERS.slice(close ? 1 : 0).map((x, i) => <Broker key={x} x={x} y={BRIDGE.floor} scale={scale} facing={-1} frame={frame} seed={i} />)}
        </g>
      }
      actors={close ? (
        <g>
          <Broker x={BROKERS[0]} y={BRIDGE.floor} scale={scale} facing={-1} frame={frame} pose={bk.pose} face={{ mouth: "smirk" }} />
          {frame < k.lit && giving > 0.02 && <Band x={hand.x} y={hand.y} scale={0.5} lit={false} />}
          <Figure x={wb.x} y={wb.y} scale={scale} pose={wb.pose} head={WALKER.head} coat={WALKER.coat} mouth="flat" brows={on ? "flat" : "worry"} lids={0.3}
            look={{ x: 0.9, y: 0.1 }} blink={(frame + 9) % 97 < 4} />
          <g transform={`translate(${wHead.x} ${wHead.y})`} opacity={frame >= k.lit - 2 ? 1 : 0}>
            <path d={`M${-(HEAD_R - 3) * scale} ${-24 * scale} Q0 ${-36 * scale} ${(HEAD_R - 3) * scale} ${-22 * scale}`} fill="none" stroke="#1b1d24" strokeWidth={8} strokeLinecap="round" />
            <circle cx={30 * scale} cy={-28 * scale} r={7} fill={on ? GHOST.light : "#2a3a3a"} stroke="#1b1d24" strokeWidth={2} />
            {on && <circle cx={30 * scale} cy={-28 * scale} r={20} fill={GHOST.light} opacity={0.35} />}
          </g>
        </g>
      ) : undefined} />
  );
};

// ---------------------------------------------------------------- 64-67: the warehouse

const FRONT_NIGHT: Partial<WarehouseFrontOptions> = { door: 0.85, inside: "sleepers" };

const InsideBit: React.FC<{ frame: number; k: T; shot: Name }> = ({ frame, k, shot }) => {
  const cam: Camera =
    shot === "inside" ? camAt(frame, [[k.inside, { x: 960, y: 560, zoom: 1.02 }], [k.rows, { x: 900, y: 600, zoom: 1.15 }]])
      : shot === "rows" ? camAt(frame, [[k.rows, { x: 760, y: 820, zoom: 1.9 }], [k.chess, { x: 700, y: 800, zoom: 2.1 }]])
        : shot === "bulk" ? camAt(frame, [[k.bulk, { x: 960, y: 420, zoom: 1.5 }], [k.clerkA, { x: 960, y: 560, zoom: 1.0 }]])
          : camAt(frame, [[k.heading, { x: 520, y: 760, zoom: 1.6 }], [k.arrive, { x: 600, y: 780, zoom: 1.85 }]]);
  return (
    <SetScene set={warehouseInside} mood="night" frame={frame} cam={drift(cam, frame, "wh-in", 3)} cast={[]}
      options={{ device: 1, coinsFrom: shot === "heading" ? null : k.inside, frontRow: true }} />
  );
};

/** Someone in the queue at the door: pastel head, a coat, grey under the eyes if tired. */
const Queuer: React.FC<{ b: Body; head: string; coat: string; frame: number; tired?: boolean; face?: object; seed: number }> = ({ b, head, coat, frame, tired, face, seed }) => (
  <g>
    <Figure x={b.x} y={b.y} scale={b.scale} facing={b.facing} pose={b.pose} head={head} coat={coat} mouth="flat" brows={tired ? "sad" : "none"}
      lids={tired ? 0.45 : 0.1} look={{ x: 0.9, y: 0 }} blink={(frame + seed * 41) % 97 < 4} time={frame} {...face} />
    {tired && <FaceMarks b={b} look={{ x: 0.9, y: 0 }} bags={1} />}
  </g>
);

const C = WAREHOUSE.clerk;
const clerkHead = headAt(C.x, C.y, C.scale, STAND, -1);
const CLIPBOARD = (
  <g transform="rotate(-10)">
    <rect x={-26} y={-44} width={52} height={70} rx={5} fill="#8a5a3a" stroke="#23252b" strokeWidth={3} />
    <rect x={-20} y={-36} width={40} height={56} fill="#f3e9d7" />
  </g>
);

/** The street front at night: the clerk, the queue (66) or your brother (68-69). */
const FrontBit: React.FC<{ frame: number; k: T; shot: Name }> = ({ frame, k, shot }) => {
  const s = 1.12;
  let actors: React.ReactNode;
  let cam: Camera;
  let options: Partial<WarehouseFrontOptions> = FRONT_NIGHT;
  if (shot === "front") {
    cam = camAt(frame, [[k.front, { x: 1000, y: 560, zoom: 1.0 }], [k.inside, { x: 1080, y: 640, zoom: 1.35 }]]);
    actors = <Figure x={C.x} y={C.y} scale={C.scale} facing={-1} head={CLERK.head} coat={CLERK.coat} held={CLIPBOARD} mouth="flat" look={{ x: 0.9, y: 0 }} />;
  } else if (shot === "clerkA" || shot === "clerkB") {
    const A = shot === "clerkA";
    const inA = ramp(frame, k.inA[0], k.inA[1]);
    const ax = mix(510, 1090, inA);
    const aBody: Body = { x: ax, y: WAREHOUSE.floor, scale: s, facing: 1, pose: frame >= k.inA[0] && inA < 1 ? walkPose((frame - k.inA[0]) / 5) : STAND };
    const away = ramp(frame, k.awayB[0], k.awayB[1]);
    const bx = A ? 340 : mix(510, -260, away);
    const bBody: Body = { x: bx, y: WAREHOUSE.floor, scale: s, facing: !A && frame >= k.awayB[0] ? -1 : 1,
      pose: !A && frame >= k.awayB[0] ? walkPose((frame - k.awayB[0]) / 5) : STAND };
    const cBody: Body = { x: A ? 180 : 340, y: WAREHOUSE.floor, scale: s, facing: 1, pose: STAND };
    const nod = A && frame >= k.nodA && frame < k.nodA + 12 ? Math.sin(((frame - k.nodA) / 12) * Math.PI * 2) * 6 : 0;
    const shake = !A && frame >= k.shakeB && frame < k.shakeB + 18 ? Math.sin(((frame - k.shakeB) / 18) * Math.PI * 2) * 9 : 0;
    const clerkPose: Pose = { ...STAND, tilt: nod, lean: shake ? 0 : -2 };
    const peer = A ? (frame < k.nodA ? { x: 0.9, y: 0.2 } : { x: -0.6, y: 0 }) : { x: 0.9, y: 0.15 };
    cam = A
      ? camAt(frame, [[k.clerkA, { x: 640, y: 700, zoom: 1.9 }], [k.clip, { x: 760, y: 690, zoom: 1.7 }]])
      : camAt(frame, [[k.clerkB, { x: 600, y: 700, zoom: 1.8 }], [k.label, { x: 460, y: 680, zoom: 1.45 }]]);
    actors = (
      <g>
        <Queuer b={cBody} head={PASTELS[1]} coat="#5a4a3f" frame={frame} seed={3} />
        {A ? <Queuer b={bBody} head={PASTELS[3]} coat="#6a4f6f" frame={frame} tired seed={2} />
          : <Queuer b={bBody} head={PASTELS[3]} coat="#6a4f6f" frame={frame} tired seed={2} face={{ mouth: frame >= k.shakeB ? "frown" : "flat", look: { x: 0.9, y: frame >= k.shakeB ? 0.6 : 0 } }} />}
        <Figure x={C.x} y={C.y} scale={C.scale} facing={-1} pose={clerkPose} head={CLERK.head} coat={CLERK.coat} held={CLIPBOARD}
          mouth="flat" brows="flat" lids={0.3} look={peer} blink={(frame + 17) % 97 < 4} />
        {A && inA < 0.97 && <Queuer b={aBody} head={PASTELS[0]} coat="#3f4a5c" frame={frame} seed={1} face={{ mouth: frame >= k.nodA ? "smile" : "flat" }} />}
      </g>
    );
  } else {
    // your brother at the door at midnight (68), the brim (hold), "Rested ones only." (69)
    options = { door: 0.35, inside: "sleepers" };
    const walkT = ramp(frame, k.walkIn[0], k.walkIn[1] + 4);
    const bx = mix(-120, 500, walkT);
    const walking = frame < k.walkIn[1] + 4 && frame >= k.walkIn[0];
    const bro: Body = { x: bx, y: WAREHOUSE.floor, scale: 1.15, facing: 1, pose: walking ? walkPose((frame - k.walkIn[0]) / 5) : STAND };
    const j = joints(bro.pose);
    const brim = { x: bro.x + (j.head.x + HEAD_R + 14) * bro.scale, y: bro.y + (j.head.y - 4) * bro.scale };
    const liftT = frame >= k.lift[0] && frame < k.drop + 6 ? ramp(frame, k.lift[0], k.lift[1]) * (1 - ramp(frame, k.drop, k.drop + 5)) : 0;
    const reachT = ramp(frame, k.lift[0] - 8, k.lift[0]) * (1 - ramp(frame, k.drop + 4, k.drop + 12));
    const cb: Body = { x: C.x, y: C.y, scale: C.scale, facing: -1, pose: STAND };
    const rest: [number, number] = [-6, 14];
    const aim = aimArm(cb, { x: brim.x + 4, y: brim.y - liftT * 20 });
    const shake = frame >= k.shake[0] && frame < k.shake[1] ? Math.sin(((frame - k.shake[0]) / (k.shake[1] - k.shake[0])) * Math.PI * 2) * 10 : 0;
    const upDown = frame >= k.look[0] && frame < k.look[1] ? Math.sin(((frame - k.look[0]) / (k.look[1] - k.look[0])) * Math.PI) : 0;
    cb.pose = { ...STAND, tilt: shake, armB: [mix(rest[0], aim[0], reachT), mix(rest[1], aim[1], reachT)] };
    const clerkLook = liftT > 0.3 ? { x: 0.9, y: -0.3 } : { x: 0.9, y: -0.1 + upDown * 0.9 };
    const broFace = { brows: "worry" as const, lids: 0.45, mouth: frame >= k.shake[0] ? ("frown" as const) : ("flat" as const), look: { x: 0.9, y: liftT > 0.3 ? -0.5 : 0 } };
    const brHead = headAt(500, WAREHOUSE.floor, 1.15, STAND, 1);
    cam = shot === "arrive"
      ? camAt(frame, [[k.arrive, { x: 700, y: 620, zoom: 1.25 }], [k.h4, { x: 620, y: 680, zoom: 1.7 }]])
      : shot === "brim"
        ? frame < k.lift[0]
          ? camAt(frame, [[k.h4, { x: 600, y: 700, zoom: 1.9 }], [k.lift[0], { x: 600, y: 680, zoom: 2.0 }]])
          : frame < k.shake[0]
            ? camAt(frame, [[k.lift[0], closeUp(brHead.x + 40, brHead.y, 3.4)], [k.shake[0], closeUp(brHead.x + 40, brHead.y, 3.6)]])
            : camAt(frame, [[k.shake[0], closeUp(clerkHead.x - 40, clerkHead.y + 10, 3.0)], [k.closeClerk, closeUp(clerkHead.x - 40, clerkHead.y + 10, 3.1)]])
        : camAt(frame, [[k.closeClerk, closeUp(clerkHead.x - 30, clerkHead.y + 10, 3.1)], [k.h5, closeUp(clerkHead.x - 30, clerkHead.y + 10, 3.3)]]);
    actors = (
      <g>
        <Figure x={bro.x} y={bro.y} scale={bro.scale} facing={1} pose={bro.pose} head={BROTHER.head} coat={BROTHER.coat} {...broFace}
          blink={(frame + 31) % 97 < 4} time={frame} />
        <CapAndBand b={bro} lift={liftT * 34} lit={1} look={broFace.look} />
        <Figure x={C.x} y={C.y} scale={C.scale} facing={-1} pose={cb.pose} head={CLERK.head} coat={CLERK.coat} held={CLIPBOARD}
          mouth={talk(frame, k.rested[0], k.rested[1], "flat")} brows="flat" lids={0.25} look={clerkLook} blink={(frame + 17) % 97 < 4} />
      </g>
    );
  }
  return <SetScene set={warehouseFront} mood="night" frame={frame} cam={drift(cam, frame, "wh-front", 3)} cast={[]} options={options} actors={actors} />;
};

/** He walks home: the front (the hold), then the bridge under the lamps (70), the broker under the far lamp. */
const HomeBit: React.FC<{ frame: number; k: T; shot: Name }> = ({ frame, k, shot }) => {
  const dim = 1 - ramp(frame, k.h5 + 10, k.home + 40);
  const capArm: [number, number] = [20, 30];
  if (shot === "walkOff") {
    const bx = mix(500, 180, ramp(frame, k.h5, k.home));
    const b: Body = { x: bx, y: WAREHOUSE.floor, scale: 1.15, facing: -1, pose: { ...walkPose((frame - k.h5) / 6), armF: capArm } };
    const cam = camAt(frame, [[k.h5, { x: 520, y: 640, zoom: 1.5 }], [k.home, { x: 380, y: 620, zoom: 1.35 }]]);
    return (
      <SetScene set={warehouseFront} mood="night" frame={frame} cam={drift(cam, frame, "wh-off", 3)} cast={[]} options={{ door: 0.35, inside: "sleepers" }}
        actors={
          <g>
            <Figure x={b.x} y={b.y} scale={b.scale} facing={-1} pose={b.pose} head={BROTHER.head} coat={BROTHER.coat} brows="sad" lids={0.5} mouth="frown"
              look={{ x: 0.8, y: 0.5 }} held={<HeldCap />} time={frame} />
            <CapAndBand b={b} lift={0} lit={dim} look={{ x: 0.8, y: 0.5 }} cap={false} />
            <Figure x={C.x} y={C.y} scale={C.scale} facing={-1} head={CLERK.head} coat={CLERK.coat} held={CLIPBOARD} mouth="flat" brows="flat" look={{ x: 0.9, y: 0 }} />
          </g>
        } />
    );
  }
  // the bridge at night: he walks left past the lamps; the broker under the far lamp, watching
  const bx = mix(1250, 380, ramp(frame, k.home, k.end));
  const b: Body = { x: bx, y: BRIDGE.floor, scale: 1.1, facing: -1, pose: { ...walkPose((frame - k.home) / 6), armF: capArm } };
  const brokerX = BRIDGE.lamps[1] + 150;
  const turnHead = ramp(frame, k.broker + 10, k.broker + 30);
  const cam = shot === "home"
    ? camAt(frame, [[k.home, { x: 1150, y: 680, zoom: 1.5 }], [k.broker, { x: 900, y: 680, zoom: 1.5 }]])
    : camAt(frame, [[k.broker, { x: 1350, y: 650, zoom: 1.7 }], [k.end, { x: 1300, y: 640, zoom: 1.85 }]]);
  return (
    <BridgeScene frame={frame} mood="night" cam={drift(cam, frame, "wh-home", 3)} queue={0}
      actors={
        <g>
          {shot === "broker" && <Broker x={brokerX} y={BRIDGE.floor} scale={1.1} facing={-1} frame={frame} face={{ look: { x: 0.9 - turnHead * 0.3, y: 0.1 }, mouth: "smirk" }} />}
          <Figure x={b.x} y={b.y} scale={b.scale} facing={-1} pose={b.pose} head={BROTHER.head} coat={BROTHER.coat} brows="sad" lids={0.5} mouth="frown"
            look={{ x: 0.8, y: 0.5 }} held={<HeldCap />} time={frame} />
          <CapAndBand b={b} lift={0} lit={0} look={{ x: 0.8, y: 0.5 }} cap={false} />
        </g>
      } />
  );
};

const WarehousesShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = shotAt(frame, k);
  switch (shot) {
    case "flap": case "wideTable": return <BreakfastBit frame={frame} k={k} wide={shot === "wideTable"} />;
    case "bridge": case "cross": case "sleep": return <BridgeBit frame={frame} k={k} shot={shot} />;
    case "map": return <PaperInsert frame={frame} at={k.map} end={k.cross} table="#3e3348"><MapSheet frame={frame} at={k.map} flow={k.flow} /></PaperInsert>;
    case "inside": case "rows": case "bulk": case "heading": return <InsideBit frame={frame} k={k} shot={shot} />;
    case "chess": return <PaperInsert frame={frame} at={k.chess} end={k.bulk} table="#2e2a3a"><ChessSheet frame={frame} at={k.chess} door={k.door} cents={k.cents} /></PaperInsert>;
    case "clip": return <PaperInsert frame={frame} at={k.clip} end={k.clerkB} table="#2e2a3a" tilt={2}><ClipboardSheet frame={frame} at={k.clip} /></PaperInsert>;
    case "label": return <PaperInsert frame={frame} at={k.label} end={k.heading} table="#2e2a3a"><LabelSheet frame={frame} at={k.label} end={k.heading} /></PaperInsert>;
    case "walkOff": case "home": case "broker": return <HomeBit frame={frame} k={k} shot={shot} />;
    default: return <FrontBit frame={frame} k={k} shot={shot} />;
  }
};

const Warehouses: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = times(shot.clips, shot.from, shot.to);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <WarehousesShot frame={shot.frame} k={k} />
      <Sfx name="flip" at={[...k.flaps]} volume={0.3} frames={20} />
      <Sfx name="paper" at={[k.map, k.chess, k.clip, k.label]} volume={0.3} />
      <DeviceSound at={k.lit} frames={0} volume={0.6} />
      {/* the warehouse: a thousand keyboards, the trough's coins */}
      <DeviceSound at={k.inside} frames={k.chess - k.inside} chime={false} volume={1.4} />
      <DeviceSound at={k.bulk} frames={k.clerkA - k.bulk} chime={false} volume={1.4} />
      <DeviceSound at={k.heading} frames={k.arrive - k.heading} chime={false} volume={0.9} />
      <ClinkSound at={landings(k.inside, k.chess - 30, 14, 22)} volume={0.5} />
      <ClinkSound at={landings(k.bulk, k.clerkA - 30, 14, 22)} volume={0.5} />
    </AbsoluteFill>
  );
};

export const warehouses: Beat = { id: "warehouses", firstLine: 62, Component: Warehouses };
