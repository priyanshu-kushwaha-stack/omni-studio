// Beat "Night One" (script.md v7, ## [01:19] Night One; lines 11-18; this file keeps the old name Piano.tsx). Why it
// takes a cable, night one in the inside town (the teacher's back room planted for the climax), and the first morning:
// the cardboard piano, "Since when?", your "Morning, Haruko." and her "Who's Haruko?".
//
//   11  inside your pod, lamp on: the rat insert (the track replayed as a fast streak over its sleeping head); a sleeper
//       counting to ten on their fingers at ordinary speed; "So it takes a plug": the plug clicks in
//   12  the inside town in cuts: dawn; the counter-sun racing; you in a bakery apron beside Haruko (teal headscarf);
//       snow; the piano teacher tapping a key; his back room, radios and lamps in pieces, you holding a lamp cord up to
//       the light (a clear 2 s); "You've got time": your hands on the keys, a wrong note, your wince
//   13  the same keys, your hands sure; your eyes shut, the teacher nods; the hatch opens on the morning
//   14  the kitchen: "So my brother..."; hold (performed): you lift the cardboard keys out of the recycling, shut your
//       eyes and play; her spoon stops mid-air, milk dripping off it; she taps the bowl in time; the ending with a
//       flourish; eyes open, chin up, waiting for applause
//   15  "Since when?"; your bubble "Morning, Haruko."      16  "Who's Haruko?"
//   17  Haruko waving from the inside town; Siffre's cave calendar, a run of pages fluttering away; back to the table:
//       her brows up, your grin stuck in place
//   18  "You wanted applause" (chin still up); "a wrong name" (her squint); "Fine." (your shrug); "all the time in the
//       world" (you lean back, hands behind your head)
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { SEATED, seatedY, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { Bubble } from "../parts";
import { POD_ONE_COUNTER } from "../sets/PodHall";
import { camAt, current, lineEnd, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { at, atText, BigHand, HallStage, LyingYou, onPods, Overlay, Person, PodInside, type Face } from "./TellMeTomorrow.Kit";
import { CaveSheet, CountingSleeper, KeysInsert, RatSheet, BENCH } from "./Piano.Parts";
import { Bakery, SKY, TeacherRoom, TownStage, Walkers } from "./Piano.Town";
import { KITCHEN, KitchenScene, type KitchenState } from "./Piano.Kitchen";
import { Workshop } from "./Piano.Workshop";

function times(shot: Shot) {
  const c = shot.clips;
  const f = (i: number) => c[i].from;
  const e = (i: number) => lineEnd(c, i);
  const t = (i: number, p: string | string[], n = -3) => atText(shot, i, p, n);
  const back = t(12, "and a back room");
  const time = Math.min(f(13) - 34, Math.max(back + 62, t(12, "You've got time")));
  const e14 = e(14), s15 = f(15);
  const stamp = t(17, "came out", 0);
  return {
    start: shot.from, rats: t(11, "In rats", -4), replay: t(11, "replayed", 0), dream: t(11, "But a dream", -2), count: t(11, "Lucid", 0),
    plug: t(11, "So it takes", -4),
    dawn: f(12) - 2, sun: t(12, "A paper sun"), bakery: t(12, "A bakery"), winter: t(12, "A winter"), teacher: t(12, "A piano teacher"),
    back, time, wince: time + 24,
    sure: f(13) - 2, nod: t(13, "Your hands", -2), hatch: Math.min(f(14) - 20, Math.max(at(c, 13, 0.8), e(13) - 6)),
    kitchen: f(14) - 6, e14, gp: (p: number) => Math.round(e14 + (s15 - e14) * p),
    since: s15 - 2, bubble: Math.max(s15 + 6, e(15) - 8), who: f(16) - 2, whoEnd: e(16),
    haruko: f(17) - 2, siffre: t(17, "Michel"), stamp, tear: Math.max(stamp + 22, t(17, "25 days", 0)), say25: t(17, "25", 0),
    stuck: t(17, "You've come out"),
    applause: f(18) - 2, wrong: t(18, "You got"), fine: t(18, "Fine", -2), world: Math.max(t(18, "Fine", 22), t(18, "You've got all", -2)), end: shot.to,
  };
}
type T = ReturnType<typeof times>;

const YOU_HEAD = { x: KITCHEN.you + 30, y: seatedY(KITCHEN.seatTop, 1.15) - 175 };
const MATE_HEAD = { x: KITCHEN.mate - 30, y: seatedY(KITCHEN.seatTop, 1.15) - 175 };
const BENCH_HEAD = { x: BENCH.x - 40, y: seatedY(BENCH.top, 1.15) - 175 };

/** Seated poses for you in the kitchen: the flourish (both arms flung up), chin up, the shrug, hands behind your head. */
const FLOURISH: Pose = { ...SEATED, lean: -4, tilt: -8, armF: [165, 15], armB: [150, 20] };
const CHIN_UP: Pose = { ...SEATED, lean: -6, tilt: -14, armF: [30, 40], armB: [20, 40] };
const SHRUG: Pose = { ...SEATED, lean: 0, tilt: 8, armF: [70, 110], armB: [60, 120] };
const LEAN_BACK: Pose = { ...SEATED, lean: -14, tilt: -6, armF: [175, 150], armB: [170, 150] };

/** The kitchen's state at this frame, from "So my brother..." to "all the time in the world". */
function kitchenState(frame: number, k: T): KitchenState {
  const g = k.gp;
  if (frame >= k.applause) {
    const pose = frame >= k.world ? LEAN_BACK : frame >= k.fine ? SHRUG : CHIN_UP;
    return {
      youSeated: true, youPose: pose, card: 1,
      youFace: frame >= k.world ? { brows: "raised", lids: 0.55, mouth: "smirk", look: { x: 0.6, y: -0.5 } }
        : frame >= k.fine ? { brows: "raised", lids: 0.3, mouth: "flat", look: { x: 0.9, y: 0 } }
        : { brows: "raised", lids: 0.2, mouth: "smile", look: { x: 0.9, y: -0.4 } },
      mateFace: frame >= k.wrong && frame < k.fine ? { brows: "angry", lids: 0.45, mouth: "flat", look: { x: 0.9, y: 0 } }
        : { brows: "raised", lids: 0.1, mouth: "flat", look: { x: 0.9, y: 0 } },
      spoon: "eat",
    };
  }
  if (frame >= k.since) {
    // "Since when?", your bubble, "Who's Haruko?", and (after the inserts) her brows up, your grin stuck
    const who = frame >= k.who;
    return {
      youSeated: true, youPose: CHIN_UP, card: 1,
      youFace: { brows: "raised", lids: 0, mouth: "smile", eyes: who ? 1.1 : 1, look: { x: 0.9, y: who ? 0 : -0.2 } },
      mateFace: who ? { brows: "worry", lids: 0.1, mouth: frame < k.whoEnd ? "open" : "flat", eyes: 1.1, look: { x: 0.9, y: 0.05 } }
        : { brows: "raised", lids: 0, mouth: frame < k.bubble ? "open" : "o", eyes: 1.15, look: { x: 0.9, y: 0 } },
      spoon: "still",
    };
  }
  const card = frame < k.e14 ? null : ramp(frame, k.e14, g(0.15));
  const playing = frame >= g(0.17) && frame < g(0.82);
  const flourish = frame >= g(0.82) && frame < g(0.9);
  const chin = frame >= g(0.9);
  const youFace: Face = chin ? { brows: "raised", lids: 0.2, mouth: "smile", eyes: 1.05, look: { x: 0.9, y: -0.4 } }
    : flourish ? { brows: "raised", lids: 1, mouth: "open" }
    : playing ? { brows: "raised", lids: 1, mouth: frame > g(0.6) ? "smile" : "flat" }
    : { brows: "none", lids: 0.3, mouth: "flat", look: { x: 0.4, y: 0.8 } };
  const spoon = frame < k.e14 ? "talk" : frame < g(0.24) ? "eat" : frame < g(0.46) ? "still" : frame < g(0.82) ? "tap" : "still";
  const mateFace: Face = frame < k.e14 ? { brows: "raised", lids: 0, mouth: "open", look: { x: 0.9, y: 0 } }
    : spoon === "still" ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.25, look: { x: 0.9, y: 0.5 } }
    : { brows: "raised", lids: 0.15, mouth: "smile", look: { x: 0.9, y: 0.4 } };
  return { youSeated: true, youFace, card, playing, mateFace, spoon, drip: spoon === "still", youPose: flourish ? FLOURISH : chin ? CHIN_UP : undefined };
}

/** Inside your pod, lamp on: you lying with the cable in (a hand pushes the plug in when `plugAt` is set). */
function podShot(frame: number, cam: Camera, plugAt?: number) {
  const reach = plugAt === undefined ? 1 : ramp(frame, plugAt - 14, plugAt);
  const hand = { x: mix(1320, 1640, reach), y: mix(760, 500, reach) };
  const lamp = setLook([{ x: 420, y: 200, r: 520, color: "#ffd98a", strength: 0.45, moods: ["night", "lamp", "dusk", "morning", "day", "frozen"] }], "lamp", cam);
  return (
    <LookContext.Provider value={lamp}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<PodInside cable={plugAt === undefined || frame >= plugAt} />}
        actors={
          <>
            <LyingYou frame={frame} x={900} y={640} s={2.6} face={{ brows: "none", lids: 0.85, mouth: "smile", look: { x: 0.2, y: -0.6 } }} />
            {plugAt !== undefined && frame < plugAt && <path d={`M470 650 C 800 640, 1100 700, ${hand.x} ${hand.y}`} fill="none" stroke="#1D9A8F" strokeWidth={14} />}
            {plugAt !== undefined && <BigHand from={{ x: hand.x + 220, y: hand.y + 520 }} x={hand.x} y={hand.y} r={46} />}
          </>
        } />
    </LookContext.Provider>
  );
}

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot);
  const g = k.gp;
  const on = current(frame, [
    [0, "pod"], [k.rats, "rats"], [k.dream, "dream"], [k.plug, "plug"], [k.dawn, "dawn"], [k.sun, "sun"], [k.bakery, "bakery"], [k.winter, "winter"],
    [k.teacher, "teacher"], [k.back, "back"], [Math.min(k.time - 30, k.back + 66), "back2"], [k.time, "hands"], [k.wince, "wince"], [k.sure, "sure"], [k.nod, "nod"], [k.hatch, "hatch"],
    [k.kitchen, "two"], [g(0.22), "keys1"], [g(0.36), "her"], [g(0.5), "keys2"], [g(0.62), "two2"], [g(0.88), "eyes"], [k.since, "since"],
    [k.who, "who"], [k.haruko, "haruko"], [k.siffre, "siffre"], [k.stuck, "stuck"], [k.applause, "applause"], [k.wrong, "wrong"], [k.fine, "fine"],
  ]);

  const walkX = mix(-100, 1500, linear(frame, k.winter, k.teacher));
  let picture: React.ReactNode = null;
  let over: React.ReactNode = null;
  switch (on) {
    case "pod": case "rats":
      picture = podShot(frame, drift(camAt(frame, [[k.start, { x: 960, y: 560, zoom: 1.0 }], [k.dream, { x: 820, y: 600, zoom: 1.2 }]]), frame, "pod", 3));
      if (on === "rats") over = <Overlay dim={0.4}><RatSheet frame={frame} at={k.rats + 2} until={k.dream} replay={k.replay} /></Overlay>;
      break;
    case "dream": over = <Overlay><CountingSleeper frame={frame} at={k.count} /></Overlay>; break;
    case "plug": picture = podShot(frame, drift(camAt(frame, [[k.plug, insert(1500, 520, 1.9)], [k.dawn, insert(1560, 500, 2.1)]]), frame, "plug", 2), k.plug + 18); break;
    case "dawn":
      picture = <TownStage frame={frame} mood="morning" cam={camAt(frame, [[k.dawn, { x: 900, y: 420, zoom: 1.1 }], [k.sun, { x: 980, y: 380, zoom: 1.15 }]])}
        actors={<Walkers frame={frame} />} />;
      break;
    case "sun":
      picture = <TownStage frame={frame} mood="day" cam={camAt(frame, [[k.sun, { x: SKY.x - 420, y: SKY.y + 120, zoom: 2.0 }], [k.bakery, { x: SKY.x + 260, y: SKY.y + 60, zoom: 2.2 }]])} actors={null} />;
      break;
    case "bakery":
      picture = <TownStage frame={frame} mood="morning" cam={drift(camAt(frame, [[k.bakery, { x: 1060, y: 640, zoom: 1.4 }], [k.winter, { x: 1090, y: 650, zoom: 1.5 }]]), frame, "bk", 3)}
        actors={<Bakery frame={frame} />} />;
      break;
    case "haruko":
      picture = <TownStage frame={frame} mood="morning" cam={drift(camAt(frame, [[k.haruko, { x: 960, y: 620, zoom: 1.6 }], [k.siffre, { x: 960, y: 600, zoom: 1.75 }]]), frame, "hk", 3)}
        actors={<Bakery frame={frame} wave />} />;
      break;
    case "winter":
      picture = <TownStage frame={frame} mood="day" snow cam={{ x: walkX + 120, y: 620, zoom: 1.4 }}
        actors={<Person who="you" b={{ x: walkX, y: 910, scale: 1.15, facing: 1, pose: walkPose(frame * 0.3) }} face={{ brows: "worry", lids: 0.2, mouth: "o", look: { x: 0.6, y: -0.4 } }} frame={frame} />} />;
      break;
    case "back": case "back2": {
      // the plant: wide on the bench of radios and lamps in pieces, then close on you holding the lamp cord to the bulb
      const b2 = Math.min(k.time - 30, k.back + 66);
      const cam = on === "back" ? camAt(frame, [[k.back, { x: 1000, y: 600, zoom: 1.15 }], [b2, { x: 1060, y: 600, zoom: 1.25 }]])
        : camAt(frame, [[b2, { x: 1300, y: 520, zoom: 1.9 }], [k.time, { x: 1290, y: 510, zoom: 2.05 }]]);
      picture = <Workshop frame={frame} mood="day" cam={drift(cam, frame, "ws", 3)} nod={on === "back2" ? linear(frame, b2 + 20, k.time) : 0}
        face={on === "back2" && frame > b2 + 24 ? { brows: "raised", lids: 0, mouth: "smile", eyes: 1.1, look: { x: 0.4, y: -0.9 } } : { brows: "raised", lids: 0, mouth: "o", eyes: 1.15, look: { x: 0.5, y: -0.9 } }}
        teacher={on === "back2" ? { brows: "raised", lids: 0.3, mouth: "smile", look: { x: 0.9, y: -0.2 } } : { brows: "flat", lids: 0.3, mouth: "flat", look: { x: 0.6, y: 0.6 } }} />;
      break;
    }
    case "teacher": case "wince": case "nod": {
      const cam = on === "teacher" ? camAt(frame, [[k.teacher, { x: 820, y: 640, zoom: 1.45 }], [k.back, { x: 800, y: 640, zoom: 1.55 }]])
        : on === "wince" ? closeUp(BENCH_HEAD.x, BENCH_HEAD.y, 2.4) : camAt(frame, [[k.nod, { x: 840, y: 600, zoom: 1.6 }], [k.hatch, { x: 820, y: 600, zoom: 1.7 }]]);
      const face: Face = on === "wince" ? { brows: "worry", lids: 0.3, mouth: "wobble", look: { x: 0.4, y: 0.6 } }
        : on === "nod" ? { brows: "raised", lids: 1, mouth: "smile" } : { brows: "raised", lids: 0, mouth: "flat", look: { x: 0.6, y: 0.7 } };
      picture = <TeacherRoom frame={frame} cam={drift(cam, frame, "room", 3)} mood="day" face={face} tap={on === "teacher"} nod={on === "nod" ? linear(frame, k.nod, k.hatch) : 0}
        teacher={on === "nod" ? { brows: "raised", lids: 0.4, mouth: "smile", look: { x: 0.6, y: 0.4 } } : on === "wince" ? { brows: "worry", lids: 0.2, mouth: "flat", look: { x: 0.6, y: 0.6 } } : { brows: "flat", lids: 0.2, mouth: "flat", look: { x: 0.6, y: 0.6 } }} />;
      break;
    }
    case "hands": over = <Overlay><KeysInsert frame={frame} wrong={k.time + 10} tempo={9} /></Overlay>; break;
    case "sure": over = <Overlay><KeysInsert frame={frame} sure tempo={6} /></Overlay>; break;
    case "hatch": {
      const p = onPods(POD_ONE_COUNTER.x, POD_ONE_COUNTER.y + 80);
      picture = <HallStage frame={frame} cam={insert(p.x, p.y, 2.0)} mood="morning" hall={{ door: ramp(frame, k.hatch + 2, k.hatch + 12), counter: { value: "365" }, wedge: true }} actors={null} />;
      break;
    }
    case "siffre":
      picture = <KitchenScene frame={frame} cam={{ x: 900, y: 600, zoom: 1.2 }} mood="morning" s={kitchenState(frame, k)} />;
      over = <Overlay dim={0.5}><CaveSheet frame={frame} at={k.siffre + 2} until={k.stuck} stamp={k.stamp} tear={k.tear} say25={k.say25} /></Overlay>;
      break;
    default: {
      const kcam: Record<string, Camera> = {
        two: camAt(frame, [[k.kitchen, { x: 900, y: 650, zoom: 1.32 }], [g(0.22), { x: 880, y: 650, zoom: 1.4 }]]),
        her: camAt(frame, [[g(0.36), closeUp(MATE_HEAD.x - 20, MATE_HEAD.y + 50, 2.0)], [g(0.5), closeUp(MATE_HEAD.x - 20, MATE_HEAD.y + 50, 2.2)]]),
        two2: camAt(frame, [[g(0.62), { x: 900, y: 640, zoom: 1.4 }], [g(0.88), { x: 860, y: 640, zoom: 1.55 }]]),
        eyes: closeUp(YOU_HEAD.x + 10, YOU_HEAD.y, 2.3),
        since: closeUp(MATE_HEAD.x - 40, MATE_HEAD.y, 2.0),
        who: camAt(frame, [[k.who, { x: 900, y: 600, zoom: 1.45 }], [k.haruko, { x: 920, y: 600, zoom: 1.55 }]]),
        stuck: camAt(frame, [[k.stuck, { x: 900, y: 620, zoom: 1.35 }], [k.applause, { x: 880, y: 620, zoom: 1.45 }]]),
        applause: closeUp(YOU_HEAD.x + 20, YOU_HEAD.y, 2.2),
        wrong: closeUp(MATE_HEAD.x - 30, MATE_HEAD.y, 2.3),
        fine: camAt(frame, [[k.fine, { x: 880, y: 640, zoom: 1.5 }], [k.end, { x: 940, y: 620, zoom: 1.3 }]]),
      };
      picture = <KitchenScene frame={frame} cam={drift(kcam[on] ?? { x: 960, y: 560, zoom: 1 }, frame, "kit", 3)} mood="morning" s={kitchenState(frame, k)} />;
      if (on === "keys1") over = <Overlay><KeysInsert frame={frame} cardboard tempo={8} /></Overlay>;
      if (on === "keys2") over = <Overlay><KeysInsert frame={frame} cardboard tempo={8} tapX={1500} /></Overlay>;
      if (on === "since" || on === "who") {
        // your bubble pops over the cut to the two-shot; in the close on her it sits at the top left, clear of her face
        over = on === "who"
          ? <Overlay><Bubble frame={frame} at={k.bubble} until={k.who + 20} x={560} y={330} text="Morning, Haruko." size={46} side="right" /></Overlay>
          : <Overlay><Bubble frame={frame} at={k.bubble} x={220} y={300} text="Morning, Haruko." size={46} side="right" /></Overlay>;
      }
    }
  }

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      {over}
      <Sequence from={k.plug + 18} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} /></Sequence>
      <Sequence from={k.hatch + 2} durationInFrames={20}><Audio src={staticFile("sfx/hatch.wav")} volume={0.8} /></Sequence>
      <Sequence from={k.stamp} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} volume={0.6} /></Sequence>
      <Sequence from={k.stamp + 10} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} volume={0.6} /></Sequence>
      <Sequence from={k.tear} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} volume={0.7} /></Sequence>
      <Sequence from={k.tear + 4} durationInFrames={30}><Audio src={staticFile("sfx/flutter.wav")} volume={0.5} /></Sequence>
    </AbsoluteFill>
  );
};

export const piano: Beat = { id: "Piano", firstLine: 11, Component: Scene };
