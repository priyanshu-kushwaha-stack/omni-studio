// Beat "The Piano" (script.md, ## [01:09] The Piano; lines 12-22 of v3). Why it takes a cable, night one in the inside
// town, and the first morning after: the cardboard keyboard in the kitchen, and "Since when?".
//
//   12  inside your pod, lamp on, cable in; a paper insert: a rat runs its track, then sleeps while the track replays
//       over its head as a fast streak
//   13  a sleeper counting to ten on their fingers at ordinary speed; "So it takes a plug": the plug clicks in
//   14  the inside town in cuts: dawn; the counter-sun whipping across the sky; you in a bakery apron; snow; the piano
//       teacher tapping a key; your hands on the keys, a wrong note; your wince
//   15  you walk past the plain door with one window: its wall clock creeps while the sky counter blurs; you glance in,
//       and walk on (the plant for The Slow Room)
//   16  the same keys, your hands sure; your eyes shut, the teacher nods; the hatch opens on the morning
//   17  the kitchen: "So my brother..."; hold (performed): the cardboard keyboard, you play eyes shut, her spoon stops,
//       she taps the bowl in time, a missed note, the ending together, she slides you the toast, your eyes open
//   18  "Since when?"
//   19  Siffre's cave calendar: two days stamped, the gap torn out, 25
//   20  your face, the smile going        21  a year of days, her week lost in it        22  you'll fix the week
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { seatedY, walkPose } from "@whatif/kit/rig/pose";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { REF } from "../sets/common";
import { camAt, current, lineEnd, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { at, atText, BigHand, HallStage, LyingYou, onPods, Overlay, Person, PodInside, type Face } from "./TellMeTomorrow.Kit";
import { CaveSheet, CountingSleeper, KeysInsert, RatSheet, YearGrid, BENCH } from "./Piano.Parts";
import { Bakery, ROOM_CLOCK, SKY, TeacherRoom, TownStage, walkPast, Walkers } from "./Piano.Town";
import { KITCHEN, KitchenScene, type KitchenState } from "./Piano.Kitchen";
import { POD_ONE_COUNTER } from "../sets/PodHall";

function times(shot: Shot) {
  const c = shot.clips;
  const f = (i: number) => c[i].from;
  const e17 = lineEnd(c, 17), s18 = f(18);
  const gp = (p: number) => Math.round(e17 + (s18 - e17) * p);
  const hands = atText(shot, 14, "and your hands");
  const stamp = at(c, 19, 0.3);
  return {
    start: shot.from, rats: atText(shot, 12, "In rats", -4), replay: atText(shot, 12, "replayed"),
    dream: f(13) - 2, count: atText(shot, 13, "Lucid"), plug: atText(shot, 13, "So it takes", -4),
    dawn: f(14) - 2, sun: atText(shot, 14, "A paper sun", -3), bakery: atText(shot, 14, "A bakery", -3), winter: atText(shot, 14, "A winter", -3),
    teacher: atText(shot, 14, "A piano teacher", -3), hands, wince: Math.max(hands + 26, lineEnd(c, 14) - 16),
    pass: f(15) - 2, minute: atText(shot, 15, "A minute", -4), useless: atText(shot, 15, "Useless", -4),
    sure: f(16) - 2, nod: at(c, 16, 0.42), hatch: Math.min(f(17) - 20, Math.max(at(c, 16, 0.8), lineEnd(c, 16) - 4)),
    kitchen: f(17) - 6, e17, gp, since: s18 - 2,
    siffre: f(19) - 2, stamp, tear: Math.max(stamp + 22, atText(shot, 19, "came")), say25: atText(shot, 19, "25"),
    face20: f(20) - 2, question: atText(shot, 20, "You got"), grid: f(21) - 2, lost: atText(shot, 21, "And her week", -2),
    fix: f(22) - 2, gets: at(c, 22, 0.35), end: shot.to,
  };
}
type T = ReturnType<typeof times>;

const YOU_HEAD = { x: KITCHEN.you + 30, y: seatedY(KITCHEN.seatTop, 1.15) - 175 };
const MATE_HEAD = { x: KITCHEN.mate - 30, y: seatedY(KITCHEN.seatTop, 1.15) - 175 };
const BENCH_HEAD = { x: BENCH.x - 40, y: seatedY(BENCH.top, 1.15) - 175 };

/** The kitchen's state at this frame (who does what), from the morning to "you'll fix the week". */
function kitchenState(frame: number, k: T): KitchenState {
  const g = k.gp;
  if (frame >= k.fix) {
    const walk = frame >= k.gets ? mix(KITCHEN.mate, 1750, ramp(frame, k.gets, k.end)) : null;
    return { youSeated: true, youFace: { brows: "angry", lids: 0.2, mouth: frame > at2(k, 0.6) ? "smile" : "flat", look: { x: 0.9, y: walk ? -0.2 : 0 } },
      mateFace: { brows: "none", lids: 0.2, mouth: "flat", look: { x: 0.8, y: 0 } }, spoon: "eat", mateWalk: walk, toast: 1 };
  }
  if (frame >= k.face20) {
    const going = ramp(frame, k.face20 + 10, k.question);
    return { youSeated: true, youFace: { brows: going > 0.8 ? "sad" : "raised", lids: mix(0, 0.35, going), mouth: going < 0.5 ? "smile" : "flat", look: { x: 0.9, y: 0.1 } },
      mateFace: { brows: "raised", lids: 0.1, mouth: "flat", look: { x: 0.9, y: 0 } }, spoon: "still", toast: 1, card: 1 };
  }
  if (frame >= k.since) {
    return { youSeated: true, youFace: { brows: "raised", lids: 0, mouth: "smile", look: { x: 0.9, y: 0 } },
      mateFace: { brows: "worry", lids: 0.1, mouth: frame < lineEnd2(k) ? "open" : "flat", eyes: 1.1, look: { x: 0.9, y: 0.05 } }, spoon: "talk", toast: 1, card: 1 };
  }
  const miss = frame >= g(0.53) && frame < g(0.6);
  const card = frame < k.e17 ? null : ramp(frame, k.e17, g(0.15));
  const playing = frame >= g(0.17) && frame < g(0.88);
  const eyesOpen = frame >= g(0.92);
  const youFace: Face = eyesOpen ? { brows: "raised", lids: 0, mouth: "smile", eyes: 1.1, look: { x: 0.9, y: -0.1 } }
    : miss ? { brows: "worry", lids: 1, mouth: "wobble" }
    : playing ? { brows: "raised", lids: 1, mouth: frame > g(0.66) ? "smile" : "flat" }
    : { brows: "none", lids: 0.3, mouth: "flat", look: { x: 0.4, y: 0.8 } };
  const spoon = frame < k.e17 ? "talk" : frame < g(0.18) ? "eat" : frame < g(0.42) ? "still" : frame < g(0.84) ? "tap" : "toast";
  const mateFace: Face = frame < k.e17 ? { brows: "raised", lids: 0, mouth: "open", look: { x: 0.9, y: 0 } }
    : spoon === "still" ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.9, y: 0.6 } }
    : { brows: "raised", lids: 0.15, mouth: "smile", look: { x: 0.9, y: 0.4 } };
  return { youSeated: true, youFace, card, playing, mateFace, spoon, toast: ramp(frame, g(0.85), g(0.92)) };
}
const at2 = (k: T, p: number) => Math.round(k.fix + (k.end - k.fix) * p);
const lineEnd2 = (k: T) => k.siffre - 4;

/** Inside your pod, lamp on: you lying with the cable in (a hand pushes the plug in when `plug` is set). */
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
    [k.teacher, "teacher"], [k.hands, "hands"], [k.wince, "wince"], [k.pass, "pass"], [k.minute, "minute"], [k.useless, "useless"], [k.sure, "sure"],
    [k.nod, "nod"], [k.hatch, "hatch"], [k.kitchen, "two"], [g(0.22), "keys1"], [g(0.38), "her"], [g(0.5), "keys2"], [g(0.64), "two2"],
    [g(0.84), "toast"], [g(0.93), "eyes"], [k.since, "since"], [k.siffre, "siffre"], [k.face20, "face20"], [k.grid, "grid"], [k.fix, "fix"],
  ]);

  const walkX = mix(-100, 1500, linear(frame, k.winter, k.teacher));
  const past = walkPast(frame, k.pass, k.minute - 6, k.sure);
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
      picture = <TownStage frame={frame} mood="morning" cam={drift(camAt(frame, [[k.bakery, { x: 900, y: 640, zoom: 1.55 }], [k.winter, { x: 930, y: 650, zoom: 1.7 }]]), frame, "bk", 3)}
        actors={<Bakery frame={frame} />} />;
      break;
    case "winter":
      picture = <TownStage frame={frame} mood="day" snow cam={{ x: walkX + 120, y: 620, zoom: 1.4 }}
        actors={<Person who="you" b={{ x: walkX, y: 910, scale: 1.15, facing: 1, pose: walkPose(frame * 0.3) }} face={{ brows: "worry", lids: 0.2, mouth: "o", look: { x: 0.6, y: -0.4 } }} frame={frame} />} />;
      break;
    case "teacher": case "wince": case "nod": {
      const cam = on === "teacher" ? camAt(frame, [[k.teacher, { x: 820, y: 640, zoom: 1.45 }], [k.hands, { x: 800, y: 640, zoom: 1.55 }]])
        : on === "wince" ? closeUp(BENCH_HEAD.x, BENCH_HEAD.y, 2.4) : camAt(frame, [[k.nod, { x: 840, y: 600, zoom: 1.6 }], [k.hatch, { x: 820, y: 600, zoom: 1.7 }]]);
      const face: Face = on === "wince" ? { brows: "worry", lids: 0.3, mouth: "wobble", look: { x: 0.4, y: 0.6 } }
        : on === "nod" ? { brows: "raised", lids: 1, mouth: "smile" } : { brows: "raised", lids: 0, mouth: "flat", look: { x: 0.6, y: 0.7 } };
      picture = <TeacherRoom frame={frame} cam={drift(cam, frame, "room", 3)} mood="day" face={face} tap={on === "teacher"} nod={on === "nod" ? linear(frame, k.nod, k.hatch) : 0}
        teacher={on === "nod" ? { brows: "raised", lids: 0.4, mouth: "smile", look: { x: 0.6, y: 0.4 } } : { brows: "flat", lids: 0.2, mouth: "flat", look: { x: 0.6, y: 0.6 } }} />;
      break;
    }
    case "hands": over = <Overlay><KeysInsert frame={frame} wrong={k.hands + 12} tempo={9} /></Overlay>; break;
    case "sure": over = <Overlay><KeysInsert frame={frame} sure tempo={6} /></Overlay>; break;
    case "pass": case "minute": case "useless": {
      const mins = 20 + (frame - k.pass) / 120;
      const cam = on === "minute" ? camAt(frame, [[k.minute, insert(ROOM_CLOCK.x, ROOM_CLOCK.y, 2.6)], [k.useless, insert(ROOM_CLOCK.x, ROOM_CLOCK.y, 2.9)]])
        : { x: Math.max(700, Math.min(1300, past.x + 100)), y: 560, zoom: 1.15 };
      picture = <TownStage frame={frame} mood="day" room clockMinutes={mins} cam={drift(cam, frame, "pass", 2)}
        actors={<>
          <Walkers frame={frame} n={2} />
          <Person who="you" b={{ x: past.x, y: 910, scale: 1.1, facing: 1, pose: past.stopped ? { ...walkPose(0), legB: [-5, -2], legF: [6, -3] } : walkPose(frame * 0.24) }}
            face={{ brows: past.stopped ? "flat" : "none", lids: 0.2, mouth: "flat", look: past.look }} frame={frame} />
        </>} />;
      break;
    }
    case "hatch": {
      const cam = insert(onPods(POD_ONE_COUNTER.x, POD_ONE_COUNTER.y + 80).x, onPods(POD_ONE_COUNTER.x, POD_ONE_COUNTER.y + 80).y, 2.0);
      picture = <HallStage frame={frame} cam={cam} mood="morning" hall={{ door: ramp(frame, k.hatch + 2, k.hatch + 12), counter: { value: "365" }, wedge: true }} actors={null} />;
      break;
    }
    default: {
      const kcam: Record<string, Camera> = {
        two: camAt(frame, [[k.kitchen, { x: 900, y: 650, zoom: 1.32 }], [g(0.22), { x: 880, y: 650, zoom: 1.4 }]]),
        her: closeUp(MATE_HEAD.x, MATE_HEAD.y + 40, 2.2),
        two2: camAt(frame, [[g(0.64), { x: 900, y: 640, zoom: 1.4 }], [g(0.84), { x: 900, y: 650, zoom: 1.55 }]]),
        toast: camAt(frame, [[g(0.84), insert(KITCHEN.toast.to + 60, 760, 2.6)], [g(0.93), insert(KITCHEN.toast.to + 40, 760, 2.8)]]),
        eyes: closeUp(YOU_HEAD.x, YOU_HEAD.y, 2.4),
        since: closeUp(MATE_HEAD.x, MATE_HEAD.y, 2.3),
        siffre: { x: 900, y: 600, zoom: 1.2 },
        face20: camAt(frame, [[k.face20, closeUp(YOU_HEAD.x, YOU_HEAD.y, 2.1)], [k.grid, closeUp(YOU_HEAD.x, YOU_HEAD.y, 2.6)]]),
        grid: { x: 900, y: 600, zoom: 1.2 },
        fix: camAt(frame, [[k.fix, { x: 860, y: 640, zoom: 1.5 }], [k.end, { x: 960, y: 620, zoom: 1.3 }]]),
        keys1: REF, keys2: REF,
      };
      picture = <KitchenScene frame={frame} cam={drift(kcam[on] ?? REF, frame, "kit", 3)} mood="morning" s={kitchenState(frame, k)} />;
      if (on === "keys1") over = <Overlay><KeysInsert frame={frame} cardboard tempo={8} /></Overlay>;
      if (on === "keys2") over = <Overlay><KeysInsert frame={frame} cardboard tempo={8} wrong={g(0.53)} tapX={1500} /></Overlay>;
      if (on === "siffre") over = <Overlay dim={0.5}><CaveSheet frame={frame} at={k.siffre + 2} until={k.face20} stamp={k.stamp} tear={k.tear} say25={k.say25} /></Overlay>;
      if (on === "grid") over = <Overlay dim={0.5}><YearGrid frame={frame} at={k.grid + 2} until={k.fix} fill={k.grid + 6} lost={ramp(frame, k.lost, k.lost + 30)} /></Overlay>;
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
    </AbsoluteFill>
  );
};

export const piano: Beat = { id: "Piano", firstLine: 12, Component: Scene };
