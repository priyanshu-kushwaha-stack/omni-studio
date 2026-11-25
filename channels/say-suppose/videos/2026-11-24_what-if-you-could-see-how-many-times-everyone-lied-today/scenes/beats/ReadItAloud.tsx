// Read It Aloud [08:05] (G2 first cut): the host reads your card into her microphone; the leader laughs, the challenger
// nods ("Go on. Read it."); he laughs, looks at the clock, reads. Line one: nothing. Line two: click, 1. The wordless peak
// (10 s): his counter climbs line by line to 14, the glow spreading down his face, his grin fixed, the readout to 102;
// the crimson stranger in the front row counts on their fingers in step with you. You write fast; the host reads the
// fourteen lines; "Prove it." "Ten out of ten, remember?" The press runs for the doors, the stranger's seat is empty;
// "I have never told a lie in my life." click, 15. Morning: headlines spin up over the studio; your face on a front page.
import { AbsoluteFill } from "remotion";
import { SEATED, seatedY, STAND, type Pose } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import { MUSTARD } from "@whatif/kit/theme";
import { camAt, current, GLOW, HERO, mix, ramp, type Beat, type Shot } from "../shared";
import { countAt, Readout } from "../parts/Counter";
import { CardProp, CHALLENGER, Fingers, headAt, HOST, LEADER, Person, SASH, SheetProp, speaking, wordAt, type Face } from "../parts/RivalParts";
import { FrontPage, Headlines } from "../parts/ReadItAloudPapers";
import { CHALLENGER_X, CLOCK, D_FLOOR, DebateStage, HallShot, HOST_X, LEADER_X, SEAT_TOP, YOU_X } from "../sets/Debate";

const MOOD = "night" as const;
const S = 1.1;

type View = "hostRead" | "laughNod" | "challenger" | "leaderLaugh" | "clock" | "leader" | "nothing" | "peakLeader" | "peakHall" | "peakYou"
  | "peakClose" | "desk" | "prove" | "tenOutOfTen" | "run" | "aftermath" | "never" | "papers" | "front";

/** The camera position that centres a point drawn on a layer at `depth` (parallax), for the clock insert. */
const centreOn = (x: number, y: number, depth: number, zoom: number) => ({
  x: (x - 960 * (1 - depth)) / depth, y: (y - 540 * (1 - depth)) / depth, zoom,
});

const ReadItAloudBeat: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = shot.frame;
  const HR2 = shot.at("Host: If it's true");
  const GO = shot.at("Challenger: Go on");
  const HL = shot.at("He laughs");
  const looks = wordAt(shot, "He laughs", "He looks");
  const reads = wordAt(shot, "He laughs", "He reads");
  const L1 = shot.at("Leader: Line one");
  const NOT = shot.at("Nothing.");
  const L2 = shot.at("Leader: Line two");
  const C1 = shot.at("Click. One.");
  const PK0 = shot.end("Click. One.");
  const PK1 = shot.at("Host: Fourteen");
  const PR = shot.at("Leader: Prove it");
  const TT = shot.at("Host: Ten out of ten");
  const RUN0 = shot.end("Host: Ten out of ten");
  const CW = shot.at("The country watches");
  const NEV = shot.at("Leader: I have never");
  const C15 = shot.at("Click. Fifteen");
  const LC = shot.at("The lines are checked");
  const MORN = shot.at("And in the morning");

  // the peak: thirteen more ticks, 2 to 14, across the hold
  const span = Math.max(60, PK1 - 30 - (PK0 + 8));
  const peakTicks = Array.from({ length: 13 }, (_, k) => Math.round(PK0 + 8 + (k * span) / 12));
  const ticks = [C1, ...peakTicks, C15];
  const count = countAt(0, ticks, f);
  const pk = (s: number) => Math.round(mix(PK0, PK1, s));

  const view = current<View>(f, [[shot.from, "hostRead"], [shot.at("Host: If it's true", 0.45), "laughNod"], [GO, "challenger"], [HL, "leaderLaugh"],
    [looks, "clock"], [reads, "leader"], [NOT, "nothing"], [L2, "leader"], [C1, "nothing"], [PK0, "peakLeader"], [pk(0.36), "peakHall"],
    [pk(0.52), "peakYou"], [pk(0.64), "peakClose"], [PK1, "desk"], [PR, "prove"], [TT, "tenOutOfTen"], [RUN0, "run"], [CW, "aftermath"],
    [NEV, "never"], [LC, "papers"], [MORN, "front"]]);

  if (view === "front") return <FrontPage frame={f} from={MORN} to={shot.to} />;

  const minutes = f < looks ? 22 : 23;
  const laughing = (f >= shot.at("Host: If it's true", 0.45) && f < GO) || (f >= HL && f < looks);
  const reading = f >= reads && f < RUN0;
  const angry = f >= PR && f < PR + 50 || f >= NEV;
  const peak = f >= PK0 && f < PK1;
  const hot = f < L1 ? -1 : f < L2 ? 0 : f < PK0 ? 1 : f < PK1 ? Math.min(8, 2 + Math.floor(((f - PK0) / (PK1 - PK0)) * 7)) : -1;
  const leaderPose: Pose = { ...STAND, tilt: laughing ? -14 : angry ? 4 : 0, armF: reading || f >= NEV ? [118, 22] : [62, 70], armB: [20, 40] };
  const leaderTalks = speaking(shot, "Leader: Line one") || speaking(shot, "Leader: Line two") || speaking(shot, "Leader: Prove it")
    || speaking(shot, "Leader: I have never") || (peak && Math.floor((f - PK0) / 9) % 3 !== 2);
  const leaderFace: Partial<Face> = angry
    ? { brows: "angry", lids: 0.1, mouth: "open", eyes: 1.1, look: { x: 0.9, y: 0 } }
    : laughing ? { brows: "raised", lids: 0.5, mouth: "open", eyes: 1, look: { x: 0.8, y: -0.4 } }
      : f >= looks && f < reads ? { brows: "raised", lids: 0, mouth: "smile", eyes: 1, look: { x: 1, y: -0.8 } }
        : { brows: "raised", lids: 0.3, mouth: peak ? "smile" : leaderTalks ? "open" : "smile", eyes: 1, look: { x: 0.9, y: reading ? 0.3 : 0 } };
  const leaderHead = headAt(LEADER_X, D_FLOOR, S, leaderPose, 1);
  const glow = Math.min(1, count / 14);

  const nod = f >= shot.at("Host: If it's true", 0.45) && f < HL ? Math.sin(f / 5) * 7 : 0;
  const hand = f >= RUN0 && f < NEV ? 1 : 0;
  const challengerPose: Pose = { ...STAND, tilt: nod + (f >= PR ? 4 : 0), armF: hand ? [160, -150] : [55, 50] };
  const challengerFace: Partial<Face> = hand ? { brows: "raised", lids: 0, mouth: "none", eyes: 1.3, look: { x: 0.8, y: -0.2 } }
    : speaking(shot, "Challenger: Go on") ? { brows: "flat", lids: 0.2, mouth: "open", eyes: 1, look: { x: 1, y: 0 } }
      : { brows: "none", lids: 0.25, mouth: "smile", eyes: 1, look: { x: 0.9, y: 0 } };

  const hostTalks = speaking(shot, "Host: Read it") || speaking(shot, "Host: If it's true") || speaking(shot, "Host: Fourteen") || speaking(shot, "Host: Ten out of ten");
  const holdsCard = f < GO || (f >= PK1 + 12 && f < RUN0);
  const hostFace: Partial<Face> = { brows: "raised", lids: 0, mouth: hostTalks ? "open" : f >= TT ? "smile" : "flat", eyes: 1, look: { x: holdsCard ? 0.5 : 1, y: holdsCard ? 0.6 : -0.1 } };

  // you: watching above his mouth, counting on your fingers in the peak, then writing fast
  const counting = peak;
  const scribble = f >= PK1 - 10 && f < PK1 + 14;
  const youPose: Pose = counting ? { ...SEATED, armF: [140, 30] } : scribble ? { ...SEATED, armF: [72 + Math.sin(f) * 8, 40] } : SEATED;
  const youFace: Partial<Face> = counting ? { brows: "raised", lids: 0, mouth: "flat", eyes: 1.15, look: { x: 1, y: -0.8 } }
    : f >= TT ? { brows: "none", lids: 0.2, mouth: "smile", eyes: 1, look: { x: 1, y: 0 } }
      : { brows: "flat", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 1, y: -0.3 } };
  const fingers = ((count - 1) % 5) + 1;

  const clockCam = centreOn(CLOCK.x, CLOCK.y, 0.85, 3.0);
  const cam = drift((() => {
    switch (view) {
      case "hostRead": return camAt(f, [[shot.from, { x: 1600, y: 630, zoom: 1.7 }], [HR2, { x: 1590, y: 630, zoom: 1.8 }]]);
      case "laughNod": return camAt(f, [[shot.at("Host: If it's true", 0.45), { x: 840, y: 620, zoom: 1.35 }], [GO, { x: 840, y: 620, zoom: 1.42 }]]);
      case "challenger": return camAt(f, [[GO, { x: 1060, y: 610, zoom: 1.8 }], [HL, { x: 1070, y: 610, zoom: 1.9 }]]);
      case "leaderLaugh": return { x: 660, y: 620, zoom: 1.8 };
      case "clock": return clockCam;
      case "leader": return camAt(f, [[reads, { x: 660, y: 620, zoom: 1.7 }], [C1, { x: 650, y: 600, zoom: 1.95 }]]);
      case "nothing": return { x: leaderHead.x, y: leaderHead.y - 60, zoom: 2.5 };
      case "peakLeader": return camAt(f, [[PK0, { x: leaderHead.x, y: leaderHead.y - 40, zoom: 2.0 }], [pk(0.36), { x: leaderHead.x, y: leaderHead.y - 70, zoom: 2.5 }]]);
      case "peakHall": return camAt(f, [[pk(0.36), { x: 960, y: 640, zoom: 1.25 }], [pk(0.52), { x: 960, y: 700, zoom: 1.5 }]]);
      case "peakYou": return camAt(f, [[pk(0.52), { x: 1660, y: 560, zoom: 2.1 }], [pk(0.64), { x: 1660, y: 560, zoom: 2.25 }]]);
      case "peakClose": return camAt(f, [[pk(0.64), { x: leaderHead.x + 70, y: leaderHead.y - 60, zoom: 2.3 }], [PK1, { x: leaderHead.x + 70, y: leaderHead.y - 80, zoom: 2.9 }]]);
      case "desk": return camAt(f, [[PK1, { x: 1600, y: 640, zoom: 1.7 }], [PR, { x: 1590, y: 640, zoom: 1.78 }]]);
      case "prove": return { x: 650, y: 610, zoom: 2.0 };
      case "tenOutOfTen": return camAt(f, [[TT, { x: 1560, y: 630, zoom: 1.7 }], [RUN0, { x: 1560, y: 630, zoom: 1.8 }]]);
      case "run": return camAt(f, [[RUN0, { x: 960, y: 560, zoom: 1.0 }], [CW, { x: 960, y: 580, zoom: 1.06 }]]);
      case "aftermath": return camAt(f, [[CW, { x: 900, y: 580, zoom: 1.05 }], [NEV, { x: 880, y: 590, zoom: 1.12 }]]);
      case "never": return camAt(f, [[NEV, { x: 660, y: 600, zoom: 1.85 }], [LC, { x: 650, y: 590, zoom: 2.05 }]]);
      default: return camAt(f, [[LC, { x: 960, y: 560, zoom: 1.0 }], [MORN, { x: 960, y: 560, zoom: 1.05 }]]);
    }
  })(), f, "read", view === "peakClose" ? 2 : 3);

  const readout = <Readout label="EVERYONE YOU CAN SEE" value={88 + Math.min(14, count)} frame={f} on={shot.from + 10} off={RUN0 + 20} />;
  if (view === "peakHall" || view === "run") {
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <HallShot cam={view === "run" ? cam : { ...cam, y: cam.y }} mood={MOOD} frame={f} fingers={view === "peakHall" ? fingers : undefined}
          strangerGone={view === "run"} run={view === "run" ? RUN0 + 4 : undefined} />
      </AbsoluteFill>
    );
  }

  const glowR = 70 + glow * 170;
  const actors = (
    <>
      <defs>
        <radialGradient id="leader-glow" cx="0.5" cy="0.3" r="0.6">
          <stop offset="0" stopColor={GLOW} stopOpacity={0.55} />
          <stop offset="1" stopColor={GLOW} stopOpacity={0} />
        </radialGradient>
      </defs>
      <Person id="ra-leader" who={LEADER} x={LEADER_X} y={D_FLOOR} scale={S} facing={1} pose={leaderPose} face={leaderFace} frame={f} seed={3}
        count={{ base: 0, ticks, size: 68 + glow * 14 }} sash={SASH} held={<SheetProp tilt={-6} hot={hot} />} />
      {count > 0 && (
        <ellipse cx={leaderHead.x} cy={leaderHead.y - leaderHead.r * 0.4 + glow * 40} rx={glowR * 0.8} ry={glowR} fill="url(#leader-glow)"
          opacity={0.25 + glow * 0.6} style={{ mixBlendMode: "screen" }} />
      )}
      <Person id="ra-challenger" who={CHALLENGER} x={CHALLENGER_X} y={D_FLOOR} scale={S} facing={-1} pose={challengerPose} face={challengerFace}
        frame={f} seed={7} count={{ base: 6 }} />
      <Person id="ra-host" who={HOST} x={HOST_X} y={seatedY(SEAT_TOP, S)} scale={S} facing={-1} pose={{ ...SEATED, armF: holdsCard ? [70, 60] : [45, 50] }}
        face={hostFace} frame={f} seed={4} count={{ base: 2 }} earpiece held={holdsCard ? <CardProp tilt={14} scale={1.2} /> : undefined} />
      <Person id="ra-you" who={HERO} x={YOU_X} y={seatedY(SEAT_TOP, S)} scale={S} facing={-1} pose={youPose} face={youFace} frame={f} seed={1} count={null}
        held={counting ? <Fingers n={fingers} color={MUSTARD} /> : undefined} />
    </>
  );
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <DebateStage cam={cam} mood={MOOD} frame={f} minutes={minutes} mic={1580} card={scribble ? { x: 1680, scrawl: ramp(f, PK1 - 10, PK1 + 10) } : undefined}
        actors={actors} empty={f >= RUN0} laugh={0} />
      {view !== "clock" && view !== "papers" && readout}
      {view === "papers" && <Headlines frame={f} ats={[0, 0.2, 0.42, 0.64].map((s) => shot.at("The lines are checked", s))} />}
    </AbsoluteFill>
  );
};

/** ReadItAloud: the statement read line by line, the peak to 14, the press running, 15, and the morning's papers. */
export const readItAloud: Beat = { id: "ReadItAloud", first: "Host: Read it out loud.", lead: 0.3, Component: ReadItAloudBeat };
