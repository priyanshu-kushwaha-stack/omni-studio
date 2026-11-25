// The Statement [07:19] (G2 first cut): Thursday, the debate studio, the clock at eight. The leader at his lectern with
// his sheet of paper and a 0; the challenger clicking to 6; you at the desk beside the host; the front row from behind,
// one crimson head in a long coat with no counter at all; EVERYONE YOU CAN SEE: 88. Every question gets "As I wrote in
// my statement." Zero, zero, zero: the 0 pulses. The studio monitor, split: the rival (70) pointing at the leader's cool
// blue nose. Problem three on the leader's zero. Close on you, the clock at eight twenty-two, the dilemma; in the hold
// you look at the paper in his hand, pull the host's microphone toward you, write a card and slide it to her; the card.
import { AbsoluteFill } from "remotion";
import { SEATED, seatedY, STAND, type Pose } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import { FONT } from "@whatif/kit/fonts";
import { INK } from "@whatif/kit/theme";
import { camAt, current, GLOW, HERO, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { Readout } from "../parts/Counter";
import { CHALLENGER, handAt, headAt, HOST, LEADER, lineNth, Person, SASH, SheetProp, speaking, wordAt, type Face } from "../parts/RivalParts";
import { CHALLENGER_X, D_FLOOR, DebateStage, DESK, HOST_X, LEADER_X, SEAT_TOP, SplitMonitor, YOU_X } from "../sets/Debate";

const MOOD = "night" as const;
const S = 1.1;

type View = "wide" | "challenger" | "two" | "hostQ" | "leaderA" | "zeros" | "monitor" | "problem" | "you" | "paper" | "desk" | "card";

/** The card you slid across, seen from above on the desk, sliding into the host's hand. Screen pixels. */
export const CardInsert: React.FC<{ frame: number; from: number; to: number; text: string }> = ({ frame, from, to, text }) => {
  const slide = ramp(frame, from + 4, Math.round(mix(from, to, 0.55)));
  const x = mix(1240, 820, slide);
  const take = ramp(frame, Math.round(mix(from, to, 0.5)), Math.round(mix(from, to, 0.7)));
  return (
    <AbsoluteFill style={{ background: "#2a2f52" }}>
      <svg width={1920} height={1080}>
        <rect x={0} y={0} width={1920} height={1080} fill="#d9dfe3" />
        <rect x={0} y={0} width={1920} height={60} fill="#c9ced6" />
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={0} y1={160 + i * 120} x2={1920} y2={130 + i * 120} stroke="#c9ced6" strokeWidth={3} />)}
        {/* the host's pink hand coming in from the left */}
        <g transform={`translate(${mix(260, 420, take)} 560)`}>
          <rect x={-400} y={-50} width={420} height={100} rx={40} fill="#6a3d78" stroke={INK} strokeWidth={6} />
          <circle cx={40} cy={0} r={62} fill="#f2a0bd" stroke={INK} strokeWidth={6} />
        </g>
        {/* your mustard hand pushing it from the right */}
        <g transform={`translate(${x + 330} 600)`} opacity={1 - take}>
          <rect x={0} y={-46} width={520} height={92} rx={40} fill={INK} />
          <circle cx={0} cy={0} r={58} fill="#f2b632" stroke={INK} strokeWidth={6} />
        </g>
        <g transform={`translate(${x} 560) rotate(${mix(-8, 3, slide)})`}>
          <rect x={-300} y={-160} width={600} height={340} rx={12} fill="#000" opacity={0.25} transform="translate(14 18)" />
          <rect x={-300} y={-160} width={600} height={340} rx={12} fill="#fffaf0" stroke={INK} strokeWidth={6} />
          {[0, 1, 2, 3].map((i) => <line key={i} x1={-260} y1={-70 + i * 60} x2={260} y2={-70 + i * 60} stroke="#bcd3e6" strokeWidth={3} />)}
          <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={52} fill={INK} transform="rotate(-2)">{text}</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** The studio monitor filling the frame: the other network, split. Screen pixels. */
const MonitorInsert: React.FC<{ frame: number; from: number; to: number }> = ({ frame, from, to }) => {
  const z = mix(0.94, 1.0, ramp(frame, from, to));
  return (
    <AbsoluteFill style={{ background: "#151a3c" }}>
      <svg width={1920} height={1080}>
        <g transform={`translate(960 560) scale(${z}) translate(-800 -450)`}>
          <SplitMonitor frame={frame} point={ramp(frame, from + 6, from + 24)} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const StatementBeat: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = shot.frame;
  const C6 = shot.at("The challenger's");
  const EQ = shot.at("Every question");
  const HQ1 = shot.at("Host: Did you take");
  const LA1 = lineNth(shot, "Leader: As I wrote", 0);
  const HQ2 = shot.at("Host: Did you know");
  const LA2 = lineNth(shot, "Leader: As I wrote", 1);
  const ZZ = shot.at("Zero. Zero");
  const OC = shot.at("On the other channel");
  const P3 = shot.at("Problem three");
  const IF = shot.at("If you could see");
  const liar = wordAt(shot, "Call his zero", "Call him");
  const H0 = shot.end("Call his zero");
  const REM = shot.at("You remember");
  const view = current<View>(f, [[shot.from, "wide"], [C6, "challenger"], [EQ, "two"], [HQ1, "hostQ"], [LA1.at, "leaderA"], [HQ2, "hostQ"],
    [LA2.at, "leaderA"], [ZZ, "zeros"], [OC, "monitor"], [P3, "problem"], [IF, "you"], [H0, "paper"], [H0 + 18, "desk"], [REM, "card"]]);

  if (view === "monitor") return <MonitorInsert frame={f} from={OC} to={P3} />;
  if (view === "card") return <CardInsert frame={f} from={REM} to={shot.to} text="READ IT OUT LOUD." />;

  const minutes = Math.round(mix(0, 22, linear(f, shot.from, IF)));
  const answering = (f >= LA1.at && f < LA1.end) || (f >= LA2.at && f < LA2.end);
  const leaderPose: Pose = { ...STAND, armF: answering ? [110, 30] : [62, 70], armB: [20, 40] };
  const leaderFace: Partial<Face> = { brows: "raised", lids: 0.3, mouth: answering ? "open" : "smile", eyes: 1, look: { x: 0.9, y: 0 } };
  const leaderHead = headAt(LEADER_X, D_FLOOR, S, leaderPose, 1);
  const leaderHand = handAt(LEADER_X, D_FLOOR, S, leaderPose, 1);
  const challengerFace: Partial<Face> = { brows: "none", lids: 0.25, mouth: "smile", eyes: 1, look: { x: 0.9, y: 0 } };
  const hostTalks = speaking(shot, "Host: Did you take") || speaking(shot, "Host: Did you know");
  const hostFace: Partial<Face> = { brows: hostTalks ? "raised" : "none", lids: 0, mouth: hostTalks ? "open" : "flat", eyes: 1, look: { x: 1, y: -0.1 } };

  // you: the dilemma, then the hold: the paper, the microphone, the card
  const pull = ramp(f, H0 + 20, H0 + 30);
  const write = ramp(f, H0 + 30, H0 + 50);
  const slide = ramp(f, H0 + 50, REM + 6);
  const mic = mix(1580, 1660, pull);
  const cardX = mix(1690, 1540, slide);
  const youPose: Pose = f >= H0 + 18
    ? { ...SEATED, armF: write > 0 && write < 1 ? [72 + Math.sin(f / 2) * 6, 40] : slide > 0 ? [mix(60, 85, slide), mix(40, 10, slide)] : [mix(30, 80, pull), mix(40, 20, pull)] }
    : SEATED;
  const youFace: Partial<Face> = f >= H0 ? { brows: "angry", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 1, y: f >= H0 + 18 ? 0.5 : -0.2 } }
    : f >= liar ? { brows: "worry", lids: 0.2, mouth: "wobble", eyes: 1, look: { x: 0.4, y: 0.6 } }
      : f >= IF ? { brows: "worry", lids: 0, mouth: "flat", eyes: 1.1, look: { x: 1, y: -0.1 } }
        : { brows: "flat", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 1, y: 0 } };

  // the 0 pulses on each "Zero"
  const pulses = [0, 0.33, 0.66].map((s) => shot.at("Zero. Zero", s));
  const sincePulse = Math.min(...pulses.map((p) => (f >= p ? f - p : 999)));
  const ring = view === "zeros" && sincePulse < 20 ? sincePulse / 20 : -1;

  const cam = drift((() => {
    switch (view) {
      case "wide": return camAt(f, [[shot.from, { x: 960, y: 560, zoom: 1.0 }], [C6, { x: 980, y: 580, zoom: 1.08 }]]);
      case "challenger": return camAt(f, [[C6, { x: 1060, y: 600, zoom: 1.7 }], [EQ, { x: 1070, y: 600, zoom: 1.8 }]]);
      case "two": return camAt(f, [[EQ, { x: 1040, y: 620, zoom: 1.15 }], [HQ1, { x: 1040, y: 620, zoom: 1.2 }]]);
      case "hostQ": return camAt(f, [[f < LA1.at ? HQ1 : HQ2, { x: 1560, y: 620, zoom: 1.75 }], [f < LA1.at ? LA1.at : LA2.at, { x: 1570, y: 620, zoom: 1.82 }]]);
      case "leaderA": return camAt(f, [[f < HQ2 ? LA1.at : LA2.at, { x: 660, y: 620, zoom: 1.8 }], [f < HQ2 ? HQ2 : ZZ, { x: 650, y: 610, zoom: 1.9 }]]);
      case "zeros": return camAt(f, [[ZZ, { x: leaderHead.x, y: leaderHead.y - 70, zoom: 2.6 }], [OC, { x: leaderHead.x, y: leaderHead.y - 80, zoom: 2.9 }]]);
      case "problem": {
        const z = mix(1.6, 1.8, ramp(f, P3, IF));
        return { x: leaderHead.x - 190 / z, y: 640, zoom: z };
      }
      case "you": return camAt(f, [[IF, { x: 1640, y: 560, zoom: 2.15 }], [H0, { x: 1650, y: 570, zoom: 2.4 }]]);
      case "paper": return { x: leaderHand.x + 10, y: leaderHand.y - 50, zoom: 3.4 };
      default: return camAt(f, [[H0 + 18, { x: 1620, y: 680, zoom: 1.9 }], [REM, { x: 1610, y: 690, zoom: 2.0 }]]);
    }
  })(), f, "statement", 3);

  const actors = (
    <>
      <Person id="st-leader" who={LEADER} x={LEADER_X} y={D_FLOOR} scale={S} facing={1} pose={leaderPose} face={leaderFace} frame={f} seed={3}
        count={{ base: 0 }} sash={SASH} held={<SheetProp tilt={-6} />} />
      {ring >= 0 && (
        <circle cx={leaderHead.x} cy={leaderHead.y - leaderHead.r - 64} r={60 + ring * 70} fill="none" stroke={GLOW} strokeWidth={8 * (1 - ring)} opacity={1 - ring} />
      )}
      <Person id="st-challenger" who={CHALLENGER} x={CHALLENGER_X} y={D_FLOOR} scale={S} facing={-1} pose={{ ...STAND, armF: [55, 50] }} face={challengerFace}
        frame={f} seed={7} count={{ base: 4, ticks: [shot.at("The challenger's", 0.12), shot.at("The challenger's", 0.42)] }} />
      <Person id="st-host" who={HOST} x={HOST_X} y={seatedY(SEAT_TOP, S)} scale={S} facing={-1} pose={{ ...SEATED, armF: [45, 50] }} face={hostFace}
        frame={f} seed={4} count={{ base: 2 }} earpiece />
      <Person id="st-you" who={HERO} x={YOU_X} y={seatedY(SEAT_TOP, S)} scale={S} facing={-1} pose={youPose} face={youFace} frame={f} seed={1} count={null} />
    </>
  );
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <DebateStage cam={cam} mood={MOOD} frame={f} minutes={minutes} mic={mic} card={f >= H0 + 30 ? { x: cardX, scrawl: write } : undefined} actors={actors} />
      {view !== "paper" && <Readout label="EVERYONE YOU CAN SEE" value={88} frame={f} on={shot.from + 15} />}
    </AbsoluteFill>
  );
};

/** Statement: the leader's zero, the split monitor, the dilemma, and the card. */
export const statement: Beat = { id: "Statement", first: "Thursday. Eight o'clock.", lead: 0.3, Component: StatementBeat };
