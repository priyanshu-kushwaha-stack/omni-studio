// Beat "Seven Years a Week" (script.md v7, ## [02:26] Seven Years a Week; lines 19-31). A week of nights, seven
// years inside: eggs, the lottery loophole, four languages, the midnight coach party, the door code, and "Triple.".
//
//   19  pod one's counter flutters to 365, the clock ticks; the wok on fire inside; you slide a plate of eggs to her
//   20  "I hate eggs.": she pushes the plate back with one finger
//   21  your face ("She told you yesterday"); night three: the counter; the newsagent's stand, every paper the same
//       yellowed sheet; that sheet close; the square, a crowd in waistcoats arguing over it, one trader holding it up
//   22  four blackboards of four made-up alphabets in four cuts; the four flags and the tape of class hours (2,200)
//   23  NIGHT 7: the lobby at midnight, a coach's headlights through the glass, forty guests pour in in four flagged
//       clusters; you alone at the desk; the boss frozen on the stairs with a coffee. Hold (performed): bowing left,
//       bowing right, a flag over your head as you switch language mid-bow, four keys dealt down the counter; the boss's
//       coffee tips; applause; a coin drops on the desk
//   24  "Is he real?": two guests, one whispering
//   25  morning: you strut home to the flat's door, press the keypad, stop; press, stop
//   26  the keypad over your shoulder, other keypads flashing behind it; the drawer of cards, new in, old out; a year of
//       cards drops on the one old card, which shoots out and skids across the floor
//   27  the door opens from inside: her, toast in hand, stepping back, "Right. So my brother..."
//   28  you on the mat, mouth slightly open
//   29  night: the boss at the desk watching your counter flutter, a price card in hand; the card: one coin crossed out,
//       two drawn, crossed out too
//   30  "Triple.": three coins on his card, a grin      31  the street at midnight: the queue, the old sleeper first,
//       a pillow under his arm
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { seatedY, STAND, walkPose } from "@whatif/kit/rig/pose";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { CounterSound, TickSound } from "../parts";
import { POD_ONE_COUNTER } from "../sets/PodHall";
import { camAt, current, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { atText, BossAtDesk, HallStage, onPods, Overlay, TagLabel } from "./TellMeTomorrow.Kit";
import { KITCHEN, KitchenScene, type KitchenState } from "./Piano.Kitchen";
import { BoardCut, DrawerSheet, ExperimentSheet, FlagsSheet, PriceCard, WokCut, type BoardKind } from "./SevenYears.Cuts";
import { KeypadInsert, LandingScene, QueueStreet } from "./SevenYears.Door";
import { Lobby, Whisper } from "./SevenYears.Lobby";
import { ChatCut, NewsagentCut, SheetClose, SquareCut } from "./SevenYears.Town";

function times(shot: Shot) {
  const c = shot.clips;
  const f = (i: number) => c[i].from;
  const e = (i: number) => lineEnd(c, i);
  const t = (i: number, p: string | string[], n = -3) => atText(shot, i, p, n);
  const boards = f(22) - 2, flags = t(22, "The hard ones");
  const bstep = Math.max(10, Math.round((flags - boards) / 4));
  const sleep = t(26, "Sleep is when", -4);
  const flagsAt = t(22, "The hard ones");
  const cant = f(28) - 2;
  const cantWide = cant + 70;
  const card = Math.max(f(29) + 30, Math.round(f(29) + (e(29) - f(29)) * 0.45));
  return {
    start: shot.from, eggs: t(19, "You make her"), hate: f(20) - 2, told: f(21) - 2,
    n3: t(21, "Night three"), news: t(21, "lottery", -8), sheet: t(21, "Its newest"), market: t(21, "Inside, the stock"),
    boards, bstep, flags: flagsAt, tape: t(22, "2,200", 0), ticks: t(22, "Four languages", 0),
    chats: Math.min(t(22, "You've had"), flagsAt + 140),
    lobby: f(23) - 2, hold: e(23) + 2, real: f(24) - 2, lobby2: f(24) + 78, home: f(25) - 2, press: t(25, "Then you go", -2),
    code: f(26) - 2, drawer: sleep, swaps: [sleep + 12, sleep + 36, sleep + 60], exp: t(26, "and one small", -4),
    pile: t(26, "A year of new", -6), skid: t(26, "Last night", 0),
    open: f(27) - 8, cant, cantWide, cantLook: Math.max(cantWide + 40, t(28, "You're forgetting out", -2)),
    desk: f(29) - 2, card, triple: f(30) - 4, street: f(31) - 2, end: shot.to,
  };
}
type T = ReturnType<typeof times>;

const CLOCK = onPods(300, 250);
const POD = onPods(POD_ONE_COUNTER.x, POD_ONE_COUNTER.y + 80);
/** The two nights' counter shots: when each starts and when its counter starts to flutter (night two's is already
 *  running as the shot cuts in, so it lands on 365 before the eggs). */
const NIGHTS = (k: T) => [{ from: k.eggs - 28, at: k.eggs - 38 }, { from: k.n3, at: k.n3 + 2 }];
const MATE_HEAD = { x: KITCHEN.mate - 30, y: seatedY(KITCHEN.seatTop, 1.15) - 175 };
const YOU_HEAD = { x: KITCHEN.you + 30, y: seatedY(KITCHEN.seatTop, 1.15) - 175 };

/** The kitchen cuts: you slide the eggs across; "I hate eggs." and the one-finger push; your face. */
function kitchenCut(frame: number, on: string, k: T) {
  const slide = ramp(frame, k.eggs + 4, k.eggs + 20);
  const push = ramp(frame, k.hate + 16, k.hate + 34);
  const plateX = on === "eggs" ? mix(KITCHEN.card.x - 40, KITCHEN.bowl.x - 150, slide) : mix(KITCHEN.bowl.x - 150, KITCHEN.card.x + 10, push);
  const s: KitchenState = on === "eggs"
    ? { youSeated: true, youFace: { brows: "raised", lids: 0, mouth: "smile", look: { x: 0.9, y: 0.1 } }, plate: { x: plateX, by: slide < 1 ? "you" : undefined },
        mateFace: { brows: "raised", lids: 0, mouth: "flat", look: { x: 0.7, y: 0.7 } }, spoon: "still" }
    : on === "hate"
    ? { youSeated: true, youFace: { brows: "raised", lids: 0, mouth: frame > k.hate + 30 ? "o" : "smile", look: { x: 0.9, y: 0.1 } }, plate: { x: plateX, by: frame >= k.hate + 14 ? "her" : undefined },
        mateFace: { brows: "flat", lids: 0.55, mouth: frame < lineEnd2(k) ? "open" : "flat", look: { x: 0.9, y: 0 } }, spoon: "still" }
    : { youSeated: true, youFace: { brows: "worry", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.9, y: -0.2 } }, plate: { x: KITCHEN.card.x + 10 },
        mateFace: { brows: "flat", lids: 0.5, mouth: "flat", look: { x: 0.9, y: 0 } }, spoon: "eat" };
  const cam: Camera = on === "eggs" ? camAt(frame, [[k.eggs, { x: 920, y: 640, zoom: 1.45 }], [k.hate, { x: 940, y: 640, zoom: 1.55 }]])
    : on === "hate" ? camAt(frame, [[k.hate, closeUp(MATE_HEAD.x - 120, MATE_HEAD.y + 70, 1.9)], [k.told, closeUp(MATE_HEAD.x - 120, MATE_HEAD.y + 70, 2.05)]])
    : camAt(frame, [[k.told, closeUp(YOU_HEAD.x, YOU_HEAD.y, 2.2)], [k.n3, closeUp(YOU_HEAD.x, YOU_HEAD.y, 2.5)]]);
  return <KitchenScene frame={frame} cam={drift(cam, frame, "sy-k", 2)} mood="morning" s={s} />;
}
const lineEnd2 = (k: T) => k.hate + 26;

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(shot);
  const on = current(frame, [
    [0, "wok"], [k.eggs - 28, "night"], [k.eggs, "eggs"], [k.hate, "hate"], [k.told, "told"], [k.n3, "night"], [k.news, "news"], [k.sheet, "sheet"],
    [k.market, "market"], [k.boards, "board"], [k.flags, "flags"], [k.chats, "chats"], [k.lobby, "lobby"], [k.real, "real"], [k.lobby2, "lobby"],
    [k.home, "door"], [k.code, "code"], [k.drawer, "drawer"], [k.exp, "exp"], [k.pile, "pile"], [k.open, "open"], [k.cant, "cant"],
    [k.cantWide, "chat2"], [k.cantLook, "cant2"], [k.desk, "desk"], [k.card, "card"], [k.triple, "triple"], [k.street, "street"],
  ]);
  const night = NIGHTS(k).filter((n) => frame >= n.from).pop() ?? NIGHTS(k)[0];

  let picture: React.ReactNode = null;
  let over: React.ReactNode = null;
  switch (on) {
    case "night": {
      const cam = camAt(frame, [[night.from, { x: (CLOCK.x + POD.x) / 2, y: (CLOCK.y + POD.y) / 2, zoom: 1.55 }], [night.from + 30, { x: (CLOCK.x + POD.x) / 2 + 20, y: (CLOCK.y + POD.y) / 2, zoom: 1.65 }]]);
      picture = <HallStage frame={frame} cam={cam} mood="night" hall={{ door: 0, counter: { at: night.at }, minutes: frame >= night.at + 18 ? 11 : 10 }} actors={null} />;
      break;
    }
    case "wok": picture = <WokCut frame={frame} cam={drift(camAt(frame, [[k.start, { x: 940, y: 640, zoom: 1.5 }], [k.eggs - 28, { x: 980, y: 620, zoom: 1.7 }]]), frame, "wok", 4)} />; break;
    case "eggs": case "hate": case "told": picture = kitchenCut(frame, on, k); break;
    case "news": picture = <NewsagentCut frame={frame} from={k.news + 4} cam={drift(camAt(frame, [[k.news, { x: 1000, y: 640, zoom: 1.35 }], [k.sheet, { x: 1030, y: 640, zoom: 1.5 }]]), frame, "news", 3)} />; break;
    case "sheet":
      picture = <NewsagentCut frame={k.sheet} from={k.news + 4} cam={{ x: 1030, y: 640, zoom: 1.5 }} />;
      over = <Overlay dim={0.5}><SheetClose frame={frame} at={k.sheet + 2} until={k.market} /></Overlay>;
      break;
    case "market": picture = <SquareCut frame={frame} cam={drift(camAt(frame, [[k.market, { x: 960, y: 520, zoom: 1.12 }], [k.boards, { x: 960, y: 560, zoom: 1.3 }]]), frame, "sq", 3)} />; break;
    case "board": {
      const i = Math.min(3, Math.floor((frame - k.boards) / k.bstep)) as BoardKind;
      const from = k.boards + i * k.bstep;
      picture = <BoardCut frame={frame} kind={i} from={from} until={from + k.bstep} cam={drift({ x: [1380, 1440, 1400, 1460][i], y: 480, zoom: 1.6 }, frame, "board", 3)} />;
      break;
    }
    case "flags":
      picture = <HallStage frame={frame} cam={{ x: 960, y: 560, zoom: 1.0 }} mood="night" hall={{ door: 0, counter: { value: "365" } }} actors={null} />;
      over = <Overlay dim={0.45}><FlagsSheet frame={frame} at={k.flags + 2} until={k.chats} tape={k.tape} ticks={k.ticks} /></Overlay>;
      break;
    case "chats": {
      const step = Math.max(12, Math.round((k.lobby - k.chats) / 4));
      const i = Math.min(3, Math.floor((frame - k.chats) / step));
      const from = k.chats + i * step;
      picture = <ChatCut frame={frame} i={i} from={from} cam={drift(camAt(frame, [[from, { x: 850 + i * 120, y: 640, zoom: 1.55 }], [from + step, { x: 850 + i * 120, y: 640, zoom: 1.65 }]]), frame, "chat", 3)} />;
      break;
    }
    case "lobby": {
      const lt = { start: k.lobby + 10, hold: k.hold, end: k.real, tip: k.hold + Math.round((k.real - k.hold) * 0.3), clap: k.hold + Math.round((k.real - k.hold) * 0.55), coin: k.hold + Math.round((k.real - k.hold) * 0.72) };
      const tipShot = frame >= lt.tip - 4 && frame < lt.tip + 26;
      const cam = tipShot ? closeUp(310, 470, 2.1)
        : frame < k.hold ? camAt(frame, [[k.lobby, { x: 1000, y: 560, zoom: 1.0 }], [k.hold, { x: 960, y: 580, zoom: 1.08 }]])
        : camAt(frame, [[k.hold, { x: 950, y: 620, zoom: 1.3 }], [lt.tip - 4, { x: 950, y: 620, zoom: 1.4 }], [lt.tip + 26, { x: 960, y: 580, zoom: 1.05 }], [k.real, { x: 960, y: 570, zoom: 1.0 }]]);
      picture = <Lobby frame={frame} cam={drift(cam, frame, "lobby", 3)} mood="night" t={lt} />;
      break;
    }
    case "real": picture = <Whisper frame={frame} mood="night" talking={frame < lineEnd(clips, 24)} cam={drift(camAt(frame, [[k.real, closeUp(1170, 640, 2.0)], [k.home, closeUp(1170, 640, 2.2)]]), frame, "real", 2)} />; break;
    case "door": case "open": case "cant": case "chat2": case "cant2": {
      const strut = on === "door" && frame < k.press;
      const youX = strut ? mix(2100, 1580, ramp(frame, k.home, k.press)) : 1580;
      const inside = on !== "door";
      const open = inside ? ramp(frame, k.open, k.open + 12) : 0;
      const tries = (frame - k.press) % 30;
      const press = on === "door" && !strut ? (tries < 10 ? 0.3 : tries < 16 ? 1 : 0.4) : 0;
      const cam: Camera = on === "door" ? camAt(frame, [[k.home, { x: 1360, y: 600, zoom: 1.3 }], [k.code, { x: 1420, y: 600, zoom: 1.55 }]])
        : on === "open" ? camAt(frame, [[k.open, { x: 1300, y: 600, zoom: 1.3 }], [k.cant, { x: 1260, y: 600, zoom: 1.4 }]])
        : on === "chat2" ? camAt(frame, [[k.cantWide, { x: 1340, y: 610, zoom: 1.3 }], [k.cantLook, { x: 1360, y: 610, zoom: 1.4 }]])
        : on === "cant2" ? camAt(frame, [[k.cantLook, closeUp(1560, 650, 2.3)], [k.desk, closeUp(1560, 650, 2.6)]])
        : camAt(frame, [[k.cant, closeUp(1560, 650, 2.1)], [k.cantWide, closeUp(1560, 650, 2.4)]]);
      const youFace = strut ? { brows: "raised" as const, lids: 0.1, mouth: "smile" as const, look: { x: 0.9, y: -0.2 } }
        : on === "door" ? { brows: "worry" as const, lids: 0.15, mouth: "flat" as const, look: { x: 0.8, y: 0.3 } }
        : on === "cant2" ? { brows: "flat" as const, lids: 0.4, mouth: "flat" as const, look: { x: -1, y: 0 } }
        : { brows: "raised" as const, lids: 0, mouth: "o" as const, eyes: 1.05, look: on === "cant" ? { x: 0.6, y: -0.3 } : { x: 0.9, y: 0 } };
      const talk = frame < lineEnd(clips, 27) || on === "chat2";
      const mate = open > 0 ? { x: mix(1230, 1140, ramp(frame, k.open + 10, k.open + 24)), talk, face: { brows: "raised" as const, lids: 0, mouth: talk && frame % 10 < 5 ? "open" as const : "smile" as const, look: { x: 0.9, y: 0 } } } : undefined;
      picture = <LandingScene frame={frame} cam={drift(cam, frame, "door", 2)} mood="morning" open={open}
        you={{ x: youX, face: youFace, press, pose: strut ? walkPose(frame * 0.34)
          : on === "chat2" ? { ...STAND, tilt: Math.sin(frame / 5) * 7, armF: [150, 120], armB: [-6, 10] }
          : inside ? { ...STAND, armF: [10, 20], armB: [-6, 10] } : undefined }} mate={mate} />;
      break;
    }
    case "code": over = <Overlay><KeypadInsert frame={frame} from={k.code} /></Overlay>; break;
    case "drawer":
      picture = <LandingScene frame={frame} cam={{ x: 1300, y: 600, zoom: 1.4 }} mood="morning" open={0} you={{ face: { brows: "flat", lids: 0.4, mouth: "flat", look: { x: 0.8, y: 0.2 } }, press: 0.3 }} />;
      over = <Overlay dim={0.55}><DrawerSheet frame={frame} at={k.drawer + 2} until={k.exp} swaps={k.swaps} pile={k.pile} /></Overlay>;
      break;
    case "exp": case "pile":
      picture = <LandingScene frame={frame} cam={{ x: 1300, y: 600, zoom: 1.4 }} mood="morning" open={0} you={{ face: { brows: "flat", lids: 0.4, mouth: "flat", look: { x: 0.8, y: 0.2 } }, press: 0.3 }} />;
      over = on === "exp"
        ? <Overlay dim={0.55}><ExperimentSheet frame={frame} at={k.exp + 2} until={k.pile} storm={k.exp + 40} /></Overlay>
        : <Overlay dim={0.55}><DrawerSheet frame={frame} at={k.pile} until={k.open} swaps={[]} pile={k.pile + 8} skid={k.skid} /></Overlay>;
      break;
    case "desk": case "triple": {
      const cam = on === "desk" ? camAt(frame, [[k.desk, { x: 450, y: 620, zoom: 1.45 }], [k.card, { x: 420, y: 630, zoom: 1.6 }]]) : closeUp(330, 640, 2.3);
      const coins = on === "triple" ? 3 : 1;
      const held = (
        <g transform="translate(-6 -30) rotate(-8)">
          <rect x={-34} y={-24} width={68} height={48} rx={4} fill="#f3e9d7" stroke={INK} strokeWidth={4} />
          {Array.from({ length: coins }, (_, i) => <circle key={i} cx={(i - (coins - 1) / 2) * 20} cy={-4} r={8} fill="#f2b632" stroke={INK} strokeWidth={2} />)}
        </g>
      );
      const talking = on === "triple" && frame < lineEnd(clips, 30) + 2;
      picture = <HallStage frame={frame} cam={drift(cam, frame, "desk", 2)} mood="night" hall={{ door: 0, counter: on === "desk" ? { at: k.desk + 6 } : { value: "365" } }}
        actors={<BossAtDesk frame={frame} held={held}
          pose={on === "desk" ? { ...STAND, lean: 4, armF: [70, 60], armB: [20, 40] } : { ...STAND, lean: -4, tilt: -6, armF: [100, 40], armB: [20, 40] }}
          face={on === "desk" ? { brows: "raised", lids: 0.2, mouth: "flat", look: { x: 0.9, y: -0.3 } } : { brows: "raised", lids: 0.25, mouth: talking ? "open" : "smirk", eyes: 1.1, look: { x: -0.3, y: 0 } }} />} />;
      break;
    }
    case "card": over = <Overlay><PriceCard frame={frame} cross={k.card + 4} two={k.card + 14} cross2={Math.min(k.triple - 10, k.card + 30)} /></Overlay>; break;
    case "street": {
      const cam = camAt(frame, [[k.street, { x: 600, y: 700, zoom: 1.2 }], [Math.round(mix(k.street, k.end, 0.55)), { x: 1450, y: 700, zoom: 1.3 }], [k.end, closeUp(1640, 700, 2.0)]]);
      picture = <QueueStreet frame={frame} cam={drift(cam, frame, "queue", 3)} />;
      break;
    }
  }

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      {over}
      <Overlay><TagLabel text="NIGHT 7" frame={frame} at={k.lobby + 4} until={k.hold} /></Overlay>
      {NIGHTS(k).map((n) => <CounterSound key={n.at} at={n.at} volume={0.8} />)}
      {NIGHTS(k).map((n) => <TickSound key={`t${n.at}`} at={n.at + 18} />)}
      {[0, 1, 2, 3].map((p) => <Sequence key={p} from={k.press + 12 + p * 30} durationInFrames={8}><Audio src={staticFile("sfx/click.wav")} volume={0.5} /></Sequence>)}
      {[12, 34, 60, 90].map((p) => <Sequence key={`c${p}`} from={k.code + p} durationInFrames={8}><Audio src={staticFile("sfx/click.wav")} volume={0.6} /></Sequence>)}
      <Sequence from={k.open} durationInFrames={20}><Audio src={staticFile("sfx/hatch.wav")} volume={0.5} /></Sequence>
      <Sequence from={k.skid} durationInFrames={20}><Audio src={staticFile("sfx/flutter.wav")} volume={0.5} /></Sequence>
      <CounterSound at={k.desk + 6} volume={0.8} />
      <Sequence from={k.card + 4} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} volume={0.5} /></Sequence>
      <Sequence from={Math.min(k.triple - 10, k.card + 30)} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} volume={0.5} /></Sequence>
      {k.swaps.map((s) => <Sequence key={s} from={s} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} volume={0.35} /></Sequence>)}
      <Sequence from={k.hold + 32} durationInFrames={20}><Audio src={staticFile("sfx/flutter.wav")} volume={0.6} /></Sequence>
      <Sequence from={k.hold + Math.round((k.real - k.hold) * 0.72) + 12} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} volume={0.7} /></Sequence>
    </AbsoluteFill>
  );
};

export const sevenYears: Beat = { id: "SevenYears", firstLine: 19, Component: Scene };
