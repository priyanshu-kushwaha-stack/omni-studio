// Beat "Seven Years a Week" (script.md, ## [02:24] Seven Years a Week; lines 23-34 of v3). A week of nights, seven
// years inside, and what it costs out here.
//
//   23  five fast cuts, each night opening on pod one's counter fluttering to 365 and the clock ticking once: the wok on
//       fire, then her nose wrinkling at the fancy breakfast; the library where you sleep on a stack, then her note
//       sliding off your pillow unread; a blackboard of a made-up alphabet; another; her asking, your mouth open
//   24  NIGHT 7: the hall in the morning, you on the lip, heavy-lidded; seven counters stamp onto a sheet
//   25  four paper flags, the tape of class hours to 2,200; the flags bounce on "Four languages"
//   26  the flat's door: your finger at the keypad       27  the keypad over your shoulder, other doors' keypads
//       flashing their own codes behind it; your stare
//   28  the drawer of cards: new in, old out the back     29  a year of new cards drops on one old one
//   30  the door opens from inside: her, toast in hand, "Right. So my brother..."     31  you, mouth open, nothing
//   32  the boss at the desk watching your counter, a price card in his hand   33  "Triple.": one coin crossed out,
//       three drawn   34  the street at midnight, the queue to the hotel, the old sleeper at its head
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { STAND } from "@whatif/kit/rig/pose";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CounterSound, TickSound } from "../parts";
import { POD_ONE_COUNTER } from "../sets/PodHall";
import { camAt, current, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { at, atText, BossAtDesk, HallStage, onPods, Overlay, PodInside, TagLabel, YouOnLip } from "./TellMeTomorrow.Kit";
import { KITCHEN, KitchenScene, type KitchenState } from "./Piano.Kitchen";
import { BoardCut, DrawerSheet, FlagsSheet, LibraryCut, PriceCard, SevenSheet, WokCut } from "./SevenYears.Cuts";
import { KeypadInsert, LandingScene, QueueStreet } from "./SevenYears.Door";
import { LookContext } from "@whatif/kit/stage/Look";
import { setLook } from "@whatif/kit/sets/common";
import { Stage } from "@whatif/kit/stage/Stage";
import { seatedY } from "@whatif/kit/rig/pose";

function times(shot: Shot) {
  const c = shot.clips;
  const f = (i: number) => c[i].from;
  const t = (i: number, p: string | string[], n = -3) => atText(shot, i, p, n);
  const n4 = t(23, "Night four"), n5 = t(23, "Night five");
  const sleep = t(28, "Sleep is when");
  const card = at(c, 32, 0.55);
  return {
    start: shot.from, cook: t(23, "you learn to cook"), hates: t(23, "and make her"), n3: t(23, "Night three"), lib: t(23, "the inside town"),
    note: t(23, "and not the note"), n4, board1: n4 + 18, n5, board2: n5 + 18, asks: t(23, "When she asks"), word: t(23, "the word you need"),
    n7: f(24) - 2, seven: at(c, 24, 0.3), flags: f(25) - 2, tape: t(25, "2,200"), ticks: t(25, "Four languages"),
    door: f(26) - 2, code: f(27) - 2, stare: at(c, 27, 0.72), drawer: f(28) - 2,
    swaps: [sleep + 12, sleep + 44, t(28, "And one small") + 10, t(28, "the new rubbing") - 6], pile: f(29) - 2,
    open: f(30) - 8, cant: f(31) - 2, desk: f(32) - 2, card, triple: f(33) - 4, street: lineEnd(c, 33) + 6,
    old: t(34, "And here's problem one"), out: t(34, "You're forgetting out here"), end: shot.to,
  };
}
type T = ReturnType<typeof times>;

const CLOCK = onPods(300, 250);
const POD = onPods(POD_ONE_COUNTER.x, POD_ONE_COUNTER.y + 80);
const NIGHTS = (k: T) => [k.start, k.n3, k.n4, k.n5];
const MATE_HEAD = { x: KITCHEN.mate - 30, y: seatedY(KITCHEN.seatTop, 1.15) - 175 };
const YOU_HEAD = { x: KITCHEN.you + 30, y: seatedY(KITCHEN.seatTop, 1.15) - 175 };

/** The kitchen cuts: her nose wrinkling at the fancy breakfast; her asking how you slept; your open mouth. */
function kitchenCut(frame: number, on: string, k: T) {
  const s: KitchenState = on === "hates"
    ? { youSeated: true, youFace: { brows: "raised", lids: 0, mouth: "smile", look: { x: 0.9, y: 0.2 } }, push: ramp(frame, k.hates + 12, k.hates + 30),
        mateFace: { brows: "angry", lids: 0.4, mouth: "frown", look: { x: 0.6, y: 0.7 } } }
    : on === "asks"
    ? { youSeated: true, youFace: { brows: "flat", lids: 0.5, mouth: "flat", look: { x: 0.9, y: 0 } }, spoon: "talk", mateFace: { brows: "raised", lids: 0, mouth: "open", look: { x: 0.9, y: 0 } } }
    : { youSeated: true, youFace: { brows: "worry", lids: 0.1, mouth: "o", eyes: 1.15, look: { x: 0.9, y: -0.3 } }, spoon: "still", mateFace: { brows: "raised", lids: 0.1, mouth: "flat", look: { x: 0.9, y: 0 } } };
  const cam: Camera = on === "hates" ? camAt(frame, [[k.hates, { x: 920, y: 640, zoom: 1.45 }], [k.n3, { x: 960, y: 640, zoom: 1.6 }]])
    : on === "asks" ? closeUp(MATE_HEAD.x, MATE_HEAD.y, 2.3) : camAt(frame, [[k.word, closeUp(YOU_HEAD.x, YOU_HEAD.y, 2.2)], [k.n7, closeUp(YOU_HEAD.x, YOU_HEAD.y, 2.6)]]);
  return <KitchenScene frame={frame} cam={drift(cam, frame, "sy-k", 2)} mood="morning" s={s} />;
}

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot);
  const on = current(frame, [
    [0, "night"], [k.cook, "wok"], [k.hates, "hates"], [k.n3, "night"], [k.lib, "lib"], [k.note, "note"], [k.n4, "night"], [k.board1, "board1"],
    [k.n5, "night"], [k.board2, "board2"], [k.asks, "asks"], [k.word, "word"], [k.n7, "n7"], [k.flags, "flags"], [k.door, "door"], [k.code, "code"],
    [k.stare, "stare"], [k.drawer, "drawer"], [k.open, "open"], [k.cant, "cant"], [k.desk, "desk"], [k.card, "card"], [k.triple, "triple"], [k.street, "street"],
  ]);
  const nightAt = NIGHTS(k).filter((n) => frame >= n).pop() ?? k.start;

  let picture: React.ReactNode = null;
  let over: React.ReactNode = null;
  switch (on) {
    case "night": {
      const cam = camAt(frame, [[nightAt, { x: (CLOCK.x + POD.x) / 2, y: (CLOCK.y + POD.y) / 2, zoom: 1.55 }], [nightAt + 30, { x: (CLOCK.x + POD.x) / 2 + 20, y: (CLOCK.y + POD.y) / 2, zoom: 1.65 }]]);
      picture = <HallStage frame={frame} cam={cam} mood="night" hall={{ door: 0, counter: { at: nightAt + 2 }, minutes: frame >= nightAt + 20 ? 11 : 10 }} actors={null} />;
      break;
    }
    case "wok": picture = <WokCut frame={frame} cam={drift(camAt(frame, [[k.cook, { x: 940, y: 640, zoom: 1.5 }], [k.hates, { x: 980, y: 620, zoom: 1.7 }]]), frame, "wok", 4)} />; break;
    case "hates": case "asks": case "word": picture = kitchenCut(frame, on, k); break;
    case "lib": picture = <LibraryCut frame={frame} cam={drift(camAt(frame, [[k.lib, { x: 980, y: 600, zoom: 1.25 }], [k.note, { x: 1000, y: 640, zoom: 1.5 }]]), frame, "lib", 3)} />; break;
    case "note": {
      const cam = camAt(frame, [[k.note, insert(430, 680, 2.0)], [k.n4, insert(470, 700, 2.3)]]);
      picture = (
        <LookContext.Provider value={setLook([], "morning", cam)}>
          <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<PodInside lamp={false} cable={false} note={ramp(frame, k.note + 8, k.n4 - 2)} />} actors={null} />
        </LookContext.Provider>
      );
      break;
    }
    case "board1": case "board2": {
      const one = on === "board1";
      const from = one ? k.board1 : k.board2;
      const until = one ? k.n5 : k.asks;
      picture = <BoardCut frame={frame} kind={one ? 0 : 1} from={from} until={until} cam={drift({ x: one ? 1380 : 1440, y: 480, zoom: 1.6 }, frame, "board", 3)} />;
      break;
    }
    case "n7": case "flags": {
      const cam = on === "n7" ? camAt(frame, [[k.n7, { x: 700, y: 640, zoom: 1.35 }], [k.flags, { x: 620, y: 640, zoom: 1.5 }]]) : { x: 960, y: 560, zoom: 1.0 };
      picture = <HallStage frame={frame} cam={drift(cam, frame, "n7", 3)} mood="morning" hall={{ door: 1, counter: { value: "365" }, wedge: true }}
        actors={<YouOnLip frame={frame} cam={cam} face={{ brows: "flat", lids: 0.72, mouth: "flat", look: { x: 0.8, y: 0.3 } }} />} />;
      over = on === "n7"
        ? <Overlay dim={frame >= k.seven ? 0.35 : 0}><SevenSheet frame={frame} at={k.seven} until={k.flags} /></Overlay>
        : <Overlay dim={0.45}><FlagsSheet frame={frame} at={k.flags + 2} until={k.door} tape={k.tape} ticks={k.ticks} /></Overlay>;
      break;
    }
    case "door": case "stare": case "open": case "cant": {
      const open = on === "open" || on === "cant" ? ramp(frame, k.open, k.open + 12) : 0;
      const tries = (frame - k.door) % 40;
      const press = on === "door" ? (tries < 12 ? 0.3 : tries < 18 ? 1 : 0.4) : on === "stare" ? 0.3 : 0;
      const cam: Camera = on === "door" ? camAt(frame, [[k.door, { x: 1300, y: 600, zoom: 1.4 }], [k.code, { x: 1380, y: 600, zoom: 1.55 }]])
        : on === "stare" ? closeUp(1560, 650, 2.3)
        : on === "open" ? camAt(frame, [[k.open, { x: 1300, y: 600, zoom: 1.3 }], [k.cant, { x: 1260, y: 600, zoom: 1.4 }]])
        : camAt(frame, [[k.cant, closeUp(1560, 650, 2.1)], [k.desk, closeUp(1560, 650, 2.5)]]);
      const youFace = on === "door" ? { brows: "worry" as const, lids: 0.15, mouth: "flat" as const, look: { x: 0.8, y: 0.3 } }
        : on === "stare" ? { brows: "flat" as const, lids: 0.45, mouth: "flat" as const, look: { x: 0.8, y: 0.2 } }
        : { brows: "worry" as const, lids: 0.1, mouth: "o" as const, eyes: 1.05, look: on === "cant" ? { x: 0.3, y: -0.8 } : { x: 0.9, y: 0 } };
      const mate = open > 0 ? { x: mix(1230, 1170, ramp(frame, k.open + 10, k.open + 24)), talk: frame < lineEnd(shot.clips, 30), face: { brows: "raised" as const, lids: 0, mouth: frame < lineEnd(shot.clips, 30) ? "open" as const : "smile" as const, look: { x: 0.9, y: 0 } } } : undefined;
      picture = <LandingScene frame={frame} cam={drift(cam, frame, "door", 2)} mood="morning" open={open} you={{ face: youFace, press, pose: on === "open" || on === "cant" ? { ...STAND, armF: [10, 20], armB: [-6, 10] } : undefined }} mate={mate} />;
      break;
    }
    case "code": over = <Overlay><KeypadInsert frame={frame} from={k.code} /></Overlay>; break;
    case "drawer":
      picture = <LandingScene frame={frame} cam={{ x: 1300, y: 600, zoom: 1.4 }} mood="morning" open={0} you={{ face: { brows: "flat", lids: 0.4, mouth: "flat", look: { x: 0.8, y: 0.2 } }, press: 0.3 }} />;
      over = <Overlay dim={0.55}><DrawerSheet frame={frame} at={k.drawer + 2} until={k.open} swaps={k.swaps} pile={k.pile} /></Overlay>;
      break;
    case "desk": case "triple": {
      const cam = on === "desk" ? camAt(frame, [[k.desk, { x: 450, y: 620, zoom: 1.45 }], [k.card, { x: 420, y: 630, zoom: 1.6 }]]) : closeUp(300, 640, 2.3);
      const card = <g transform="translate(-6 -30) rotate(-8)"><rect x={-34} y={-24} width={68} height={48} rx={4} fill="#f3e9d7" stroke="#23252b" strokeWidth={4} /></g>;
      picture = <HallStage frame={frame} cam={drift(cam, frame, "desk", 2)} mood="night" hall={{ door: 0, counter: on === "desk" ? { at: k.desk + 6 } : { value: "365" } }}
        actors={<BossAtDesk frame={frame} held={card}
          pose={on === "desk" ? { ...STAND, lean: 4, armF: [70, 60], armB: [20, 40] } : { ...STAND, lean: -4, tilt: -6, armF: [95, 40], armB: [20, 40] }}
          face={on === "desk" ? { brows: "raised", lids: 0.2, mouth: "flat", look: { x: 0.9, y: 0.2 } } : { brows: "raised", lids: 0.25, mouth: frame < lineEnd(shot.clips, 33) + 2 ? "open" : "smile", look: { x: 0.9, y: 0 } }} />} />;
      break;
    }
    case "card": over = <Overlay><PriceCard frame={frame} cross={k.card + 4} three={k.card + 16} /></Overlay>; break;
    case "street": {
      const cam = frame < k.old ? camAt(frame, [[k.street, { x: 300, y: 700, zoom: 1.25 }], [k.old, { x: 1400, y: 700, zoom: 1.3 }]])
        : frame < k.out ? camAt(frame, [[k.old, closeUp(1650, 700, 2.2)], [k.out, closeUp(1650, 690, 2.4)]])
        : camAt(frame, [[k.out, { x: 1300, y: 640, zoom: 1.6 }], [k.end, { x: 1100, y: 620, zoom: 1.12 }]]);
      picture = <QueueStreet frame={frame} cam={drift(cam, frame, "queue", 3)} />;
      break;
    }
  }

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      {over}
      <Overlay><TagLabel text="NIGHT 7" frame={frame} at={k.n7 + 4} until={k.flags} /></Overlay>
      {NIGHTS(k).map((n) => <CounterSound key={n} at={n + 2} volume={0.8} />)}
      {NIGHTS(k).map((n) => <TickSound key={`t${n}`} at={n + 20} />)}
      {[12, 34, 60, 90].map((p) => <Sequence key={p} from={k.code + p} durationInFrames={8}><Audio src={staticFile("sfx/click.wav")} volume={0.6} /></Sequence>)}
      <Sequence from={k.open} durationInFrames={20}><Audio src={staticFile("sfx/hatch.wav")} volume={0.5} /></Sequence>
      <CounterSound at={k.desk + 6} volume={0.8} />
      <Sequence from={k.card + 4} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} volume={0.5} /></Sequence>
      {k.swaps.map((s) => <Sequence key={s} from={s} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} volume={0.35} /></Sequence>)}
    </AbsoluteFill>
  );
};

export const sevenYears: Beat = { id: "SevenYears", firstLine: 23, Component: Scene };
