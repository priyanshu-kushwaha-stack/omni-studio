// Read It Aloud [06:35] (look C, debate-night plate): close on the host reading your card into her microphone; the
// leader laughs, the challenger nods ("Go on. Read it."); close on him laughing, the clock, him reading. Line one:
// close on the 0, nothing. Line two: click, 1. The wordless peak (10 s), the film's biggest moment, all slow close-ups
// in the counter's light: his counter climbing line by line to 14 over his fixed grin, the glow spreading down his
// face; the reverse on the crimson stranger in the front row counting on their fingers in step with you; you counting;
// the digits close, still climbing; the readout to 102. Every visible tick is one of clickData's clicks. You write
// fast; the host reads the fourteen lines; "Prove it." "Ten out of ten, remember?" The press runs for the doors, the
// stranger's seat is empty; "I have never told a lie in my life." click, 15; close on you. Morning: headlines spin up
// over the studio; your face on a front page.
import { AbsoluteFill } from "remotion";
import { SEATED, seatedY, STAND, type Pose } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { MUSTARD } from "@whatif/kit/theme";
import { camAt, current, GLOW, HERO, mix, ramp, type Beat, type Shot } from "../shared";
import { countAt, Readout } from "../parts/Counter";
import { CardProp, CHALLENGER, Fingers, headAt, HOST, LEADER, Person, SASH, SheetProp, speaking, wordAt, type Face } from "../parts/RivalParts";
import { FrontPage, Headlines } from "../parts/ReadItAloudPapers";
import { clickFrames, counterLight } from "../parts/Rival.Shots";
import { CLOCK, D, DebateScene, STRANGER_FACE, StrangerReverse } from "../sets/Debate";

const MOOD = "night" as const;
const SIZE = 36 * D.s;

type View = "hostRead" | "laughNod" | "challenger" | "leaderLaugh" | "clock" | "leader" | "nothing" | "peakLeader" | "peakStranger" | "peakYou"
  | "peakClose" | "desk" | "prove" | "tenOutOfTen" | "run" | "aftermath" | "never" | "react" | "papers" | "front";

function cues(shot: Shot) {
  const PK0 = shot.end("Click. One.");
  const PK1 = shot.at("Host: Fourteen");
  const C1 = shot.at("Click. One.");
  const C15 = shot.at("Click. Fifteen");
  const peak = clickFrames(shot, "Click. One.", "after");
  return {
    HR2: shot.at("Host: If it's true"), laugh: shot.at("Host: If it's true", 0.45), GO: shot.at("Challenger: Go on"), HL: shot.at("He laughs"),
    looks: wordAt(shot, "He laughs", "He looks"), reads: wordAt(shot, "He laughs", "He reads"), L1: shot.at("Leader: Line one"), NOT: shot.at("Nothing."),
    L2: shot.at("Leader: Line two"), C1, PK0, PK1, PR: shot.at("Leader: Prove it"), TT: shot.at("Host: Ten out of ten"), RUN0: shot.end("Host: Ten out of ten"),
    CW: shot.at("The country watches"), NEV: shot.at("Leader: I have never"), C15, LC: shot.at("The lines are checked"), MORN: shot.at("And in the morning"),
    ticks: [C1, ...peak, C15], pk: (s: number) => Math.round(mix(PK0, PK1, s)),
  };
}
type K = ReturnType<typeof cues>;

const viewAt = (f: number, shot: Shot, k: K) => current<View>(f, [[shot.from, "hostRead"], [k.laugh, "laughNod"], [k.GO, "challenger"],
  [k.HL, "leaderLaugh"], [k.looks, "clock"], [k.looks + 45, "leader"], [k.NOT, "nothing"], [k.L2, "leader"], [k.C1, "nothing"], [k.PK0, "peakLeader"],
  [k.pk(0.34), "peakStranger"], [k.pk(0.5), "peakYou"], [k.pk(0.64), "peakClose"], [k.PK1, "desk"], [k.PR, "prove"], [k.TT, "tenOutOfTen"],
  [k.RUN0, "run"], [k.CW, "aftermath"], [k.NEV, "never"], [k.C15 + 12, "react"], [k.LC, "papers"], [k.MORN, "front"]]);

type H = { x: number; y: number; r: number };
function camera(v: View, f: number, shot: Shot, k: K, h: { leader: H; challenger: H; host: H; you: H }): Camera {
  const mcu = (p: H, z: number, from: number, to: number, dx = 0, dz = 0.15): Camera =>
    camAt(f, [[from, { x: p.x + dx, y: p.y - 0.55 * p.r, zoom: z }], [to, { x: p.x + dx, y: p.y - 0.6 * p.r, zoom: z + dz }]]);
  const L = h.leader;
  const digits = (z0: number, z1: number, from: number, to: number): Camera =>
    camAt(f, [[from, { x: L.x, y: L.y - 1.2 * L.r, zoom: z0 }], [to, { x: L.x, y: L.y - 1.3 * L.r, zoom: z1 }]]);
  const lecterns = (from: number, to: number): Camera =>
    camAt(f, [[from, { x: (L.x + h.challenger.x) / 2, y: L.y + 60, zoom: 1.8 }], [to, { x: (L.x + h.challenger.x) / 2, y: L.y + 50, zoom: 1.9 }]]);
  switch (v) {
    case "hostRead": return mcu(h.host, 2.9, shot.from, k.laugh, 40);
    case "laughNod": return lecterns(k.laugh, k.GO);
    case "challenger": return mcu(h.challenger, 2.9, k.GO, k.HL, -70);
    case "leaderLaugh": return mcu(L, 2.9, k.HL, k.looks, 70);
    case "clock": return camAt(f, [[k.looks, { x: CLOCK.x, y: CLOCK.y, zoom: 6.0 }], [k.looks + 45, { x: CLOCK.x, y: CLOCK.y, zoom: 6.4 }]]);
    case "leader": return f < k.NOT ? mcu(L, 3.0, k.looks + 45, k.NOT, 60) : mcu(L, 3.1, k.L2, k.C1, 60);
    case "nothing": return f < k.L2 ? digits(4.2, 4.4, k.NOT, k.L2) : digits(4.2, 4.5, k.C1, k.PK0);
    case "peakLeader": return camAt(f, [[k.PK0, { x: L.x + 30, y: L.y - 0.9 * L.r, zoom: 2.9 }], [k.pk(0.34), { x: L.x + 20, y: L.y - 1.0 * L.r, zoom: 3.7 }]]);
    case "peakStranger": return camAt(f, [[k.pk(0.34), { x: STRANGER_FACE.x + 60, y: STRANGER_FACE.y + 60, zoom: 1.45 }], [k.pk(0.5), { x: STRANGER_FACE.x + 60, y: STRANGER_FACE.y + 50, zoom: 1.65 }]]);
    case "peakYou": return camAt(f, [[k.pk(0.5), { x: h.you.x + 40, y: h.you.y + 0.1 * h.you.r, zoom: 3.2 }], [k.pk(0.64), { x: h.you.x + 40, y: h.you.y, zoom: 3.5 }]]);
    case "peakClose": return camAt(f, [[k.pk(0.64), { x: L.x + 20, y: L.y - 1.05 * L.r, zoom: 3.8 }], [k.PK1, { x: L.x + 10, y: L.y - 1.2 * L.r, zoom: 5.2 }]]);
    case "desk": return camAt(f, [[k.PK1, { x: (h.host.x + h.you.x) / 2 + 20, y: h.you.y + 40, zoom: 2.4 }], [k.PR, { x: (h.host.x + h.you.x) / 2 + 20, y: h.you.y + 30, zoom: 2.55 }]]);
    case "prove": return mcu(L, 3.3, k.PR, k.TT, 50);
    case "tenOutOfTen": return mcu(h.host, 3.0, k.TT, k.RUN0, 40);
    case "run": return camAt(f, [[k.RUN0, { x: 960, y: 560, zoom: 1.0 }], [k.CW, { x: 960, y: 570, zoom: 1.04 }]]);
    case "aftermath": return lecterns(k.CW, k.NEV);
    case "never": return mcu(L, 3.0, k.NEV, k.C15 + 12, 60);
    case "react": return camAt(f, [[k.C15 + 12, { x: h.you.x + 110, y: h.you.y + 0.25 * h.you.r, zoom: 3.2 }], [k.LC, { x: h.you.x + 110, y: h.you.y + 0.2 * h.you.r, zoom: 3.4 }]]);
    default: return camAt(f, [[k.LC, { x: 960, y: 560, zoom: 1.0 }], [k.MORN, { x: 960, y: 560, zoom: 1.05 }]]);
  }
}

/** The leader: laughing, looking at the clock, reading, the grin fixed through the peak, angry at the end. */
function leaderLook(shot: Shot, f: number, k: K) {
  const laughing = (f >= k.laugh && f < k.GO) || (f >= k.HL && f < k.looks);
  const reading = f >= k.reads && f < k.RUN0;
  const angry = (f >= k.PR && f < k.PR + 50) || f >= k.NEV;
  const peak = f >= k.PK0 && f < k.PK1;
  const hot = f < k.L1 ? -1 : f < k.L2 ? 0 : f < k.PK0 ? 1 : f < k.PK1 ? Math.min(8, 2 + Math.floor(((f - k.PK0) / (k.PK1 - k.PK0)) * 7)) : -1;
  const pose: Pose = { ...STAND, tilt: laughing ? -14 : angry ? 4 : 0, armF: reading || f >= k.NEV ? [80, 50] : [30, 95], armB: [20, 40] };
  const talks = speaking(shot, "Leader: Line one") || speaking(shot, "Leader: Line two") || speaking(shot, "Leader: Prove it")
    || speaking(shot, "Leader: I have never") || (peak && Math.floor((f - k.PK0) / 9) % 3 !== 2);
  const face: Partial<Face> = angry ? { brows: "angry", lids: 0.1, mouth: "open", eyes: 1.1, look: { x: 0.9, y: 0 } }
    : laughing ? { brows: "raised", lids: 0.5, mouth: "open", eyes: 1, look: { x: 0.8, y: -0.4 } }
      : f >= k.looks && f < k.reads ? { brows: "raised", lids: 0, mouth: "smile", eyes: 1, look: { x: -1, y: -0.6 } }
        : { brows: "raised", lids: 0.3, mouth: peak ? "smile" : talks ? "open" : "smile", eyes: 1, look: { x: 0.9, y: reading ? 0.3 : 0 } };
  return { pose, face, hot };
}

function sidesLook(shot: Shot, f: number, k: K) {
  const nod = f >= k.laugh && f < k.HL ? Math.sin(f / 5) * 7 : 0;
  const hand = f >= k.RUN0 && f < k.NEV;
  const challenger = {
    pose: { ...STAND, tilt: nod + (f >= k.PR ? 4 : 0), armF: hand ? [160, -150] : [55, 50] } as Pose,
    face: (hand ? { brows: "raised", lids: 0, mouth: "none", eyes: 1.3, look: { x: 0.8, y: -0.2 } }
      : speaking(shot, "Challenger: Go on") ? { brows: "flat", lids: 0.2, mouth: "open", eyes: 1, look: { x: 1, y: 0 } }
        : { brows: "none", lids: 0.25, mouth: "smile", eyes: 1, look: { x: 0.9, y: 0 } }) as Partial<Face>,
  };
  const hostTalks = speaking(shot, "Host: Read it") || speaking(shot, "Host: If it's true") || speaking(shot, "Host: Fourteen") || speaking(shot, "Host: Ten out of ten");
  const holds = f < k.GO || (f >= k.PK1 + 12 && f < k.RUN0);
  const host = {
    holds, pose: { ...SEATED, armF: holds ? [70, 60] : [45, 50] } as Pose,
    face: { brows: "raised", lids: 0, mouth: hostTalks ? "open" : f >= k.TT ? "smile" : "flat", eyes: 1, look: { x: holds ? 0.5 : 1, y: holds ? 0.6 : -0.1 } } as Partial<Face>,
  };
  const counting = f >= k.PK0 && f < k.PK1;
  const scribble = f >= k.PK1 - 10 && f < k.PK1 + 14;
  const you = {
    counting, scribble, pose: (counting ? { ...SEATED, armF: [150, 20] } : scribble ? { ...SEATED, armF: [72 + Math.sin(f) * 8, 40] } : SEATED) as Pose,
    face: (counting ? { brows: "raised", lids: 0, mouth: "flat", eyes: 1.15, look: { x: 1, y: -0.8 } }
      : f >= k.TT ? { brows: "none", lids: 0.2, mouth: "smile", eyes: 1, look: { x: 1, y: 0 } }
        : f >= k.C15 ? { brows: "raised", lids: 0, mouth: "flat", eyes: 1.15, look: { x: 1, y: -0.2 } }
          : { brows: "flat", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 1, y: -0.3 } }) as Partial<Face>,
  };
  return { challenger, host, you };
}

/** The counter's light spreading down his face as it climbs (`glow` 0..1). */
const FaceGlow: React.FC<{ head: H; glow: number }> = ({ head, glow }) => {
  const r = 70 + glow * 170;
  return (
    <g>
      <defs>
        <radialGradient id="leader-glow" cx="0.5" cy="0.3" r="0.6">
          <stop offset="0" stopColor={GLOW} stopOpacity={0.55} />
          <stop offset="1" stopColor={GLOW} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={head.x} cy={head.y - head.r * 0.4 + glow * 40} rx={r * 0.8} ry={r} fill="url(#leader-glow)" opacity={0.25 + glow * 0.6}
        style={{ mixBlendMode: "screen" }} />
    </g>
  );
};

const ReadItAloudBeat: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = shot.frame;
  const k = cues(shot);
  const v = viewAt(f, shot, k);
  if (v === "front") return <FrontPage frame={f} from={k.MORN} to={shot.to} />;
  const count = countAt(0, k.ticks, f);
  const glow = Math.min(1, count / 14);
  const fingers = ((count - 1) % 5) + 1;
  const ld = leaderLook(shot, f, k);
  const s = sidesLook(shot, f, k);
  const seatY = seatedY(D.seat, D.s);
  const h = {
    leader: headAt(D.leader, D.floor, D.s, ld.pose, 1), challenger: headAt(D.challenger, D.floor, D.s, s.challenger.pose, -1),
    host: headAt(D.host, seatY, D.s, s.host.pose, 1), you: headAt(D.you, seatY, D.s, s.you.pose, 1),
  };
  const cam = drift(camera(v, f, shot, k, h), f, `read-${v}`, v.startsWith("peak") ? 2 : 4);
  const cY = h.leader.y - h.leader.r - (SIZE + glow * 14) * 0.95;
  const lights = [counterLight(h.leader.x, cY, 260 + glow * 260, 0.25 + glow * 0.4)];
  const readout = <Readout label="EVERYONE YOU CAN SEE" value={88 + Math.min(14, count)} frame={f} on={shot.from + 10} off={k.RUN0 + 20} />;
  if (v === "peakStranger") {
    return (
      <AbsoluteFill>
        <StrangerReverse cam={cam} mood={MOOD} frame={f} fingers={fingers} />
        {readout}
      </AbsoluteFill>
    );
  }
  const actors = (
    <>
      <Person id="ra-leader" who={LEADER} x={D.leader} y={D.floor} scale={D.s} facing={1} pose={ld.pose} face={ld.face} frame={f} seed={3}
        count={{ base: 0, ticks: k.ticks, size: SIZE + glow * 14 }} sash={SASH} held={<SheetProp tilt={-6} scale={0.75} hot={ld.hot} />} />
      {count > 0 && <FaceGlow head={h.leader} glow={glow} />}
      <Person id="ra-challenger" who={CHALLENGER} x={D.challenger} y={D.floor} scale={D.s} facing={-1} pose={s.challenger.pose} face={s.challenger.face}
        frame={f} seed={7} count={{ base: 6, size: SIZE }} />
      <Person id="ra-host" who={HOST} x={D.host} y={seatY} scale={D.s} facing={1} pose={s.host.pose} face={s.host.face} frame={f} seed={4}
        count={{ base: 2, size: SIZE * 0.9 }} earpiece held={s.host.holds ? <CardProp tilt={14} scale={1.2} /> : undefined} />
      <Person id="ra-you" who={HERO} x={D.you} y={seatY} scale={D.s} facing={1} pose={s.you.pose} face={s.you.face} frame={f} seed={1} count={null}
        held={s.you.counting ? <Fingers n={fingers} color={MUSTARD} /> : undefined} />
    </>
  );
  const onDesk = s.you.scribble ? <g transform={`translate(${D.you + 50} ${D.deskTop - 6}) rotate(-4)`}><CardProp scale={1.1} scrawl={ramp(f, k.PK1 - 10, k.PK1 + 10)} /></g> : undefined;
  return (
    <DebateScene cam={cam} mood={MOOD} frame={f} minutes={f < k.looks ? 22 : 23} actors={actors} onDesk={onDesk} lights={lights}
      empty={f >= k.RUN0} run={v === "run" ? k.RUN0 + 4 : undefined} press={f < k.CW} clockInFocus={v === "clock"}
      over={
        <>
          {v !== "clock" && v !== "papers" && readout}
          {v === "papers" && <Headlines frame={f} ats={[0, 0.2, 0.42, 0.64].map((t) => shot.at("The lines are checked", t))} />}
        </>
      } />
  );
};

/** ReadItAloud: the statement read line by line, the peak to 14, the press running, 15, and the morning's papers. */
export const readItAloud: Beat = { id: "ReadItAloud", first: "Host: Read it out loud.", lead: 0.3, Component: ReadItAloudBeat };
