// The Statement [06:00] (look C, debate-night plate): Thursday, the debate studio, the clock at eight. A short wide
// from the back of the hall; close on the leader at his lectern with his sheet of paper and a 0; close on the challenger
// clicking to 6; over the challenger's shoulder to the leader; every question from the host at her desk (close) gets
// "As I wrote in my statement" (close). Zero, zero, zero: close on the 0 pulsing. The studio monitor, split: the rival
// (70) pointing at the leader's cool blue nose. Problem three on the leader's zero. Close on you at the desk, the clock
// at eight twenty-two behind you, the dilemma; in the hold the paper in his hand, then you write a card and slide it to
// the host; the card. EVERYONE YOU CAN SEE: 88.
import { AbsoluteFill } from "remotion";
import { SEATED, seatedY, STAND, type Pose } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { INK } from "@whatif/kit/theme";
import { camAt, current, GLOW, HERO, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { Readout } from "../parts/Counter";
import { CardProp, CHALLENGER, handAt, headAt, HOST, LEADER, lineNth, Person, SASH, SheetProp, speaking, wordAt, type Face } from "../parts/RivalParts";
import { counterLight, OverShoulder } from "../parts/Rival.Shots";
import { D, DebateScene, SplitMonitor } from "../sets/Debate";

const MOOD = "night" as const;
const SIZE = 36 * D.s;

type View = "wide" | "leader" | "challenger" | "two" | "hostQ" | "leaderA" | "zeros" | "monitor" | "problem" | "you" | "paper" | "desk" | "card";

/** The card you slid across, seen from above on the wooden desk, sliding into the host's hand. Screen pixels. */
export const CardInsert: React.FC<{ frame: number; from: number; to: number; text: string }> = ({ frame, from, to, text }) => {
  const slide = ramp(frame, from + 4, Math.round(mix(from, to, 0.55)));
  const x = mix(1240, 820, slide);
  const take = ramp(frame, Math.round(mix(from, to, 0.5)), Math.round(mix(from, to, 0.7)));
  return (
    <AbsoluteFill style={{ background: "#3a2416" }}>
      <svg width={1920} height={1080}>
        <defs>
          <radialGradient id="desk-pool" cx="0.5" cy="0.45" r="0.7">
            <stop offset="0" stopColor="#9a6438" /><stop offset="1" stopColor="#3a2416" />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#desk-pool)" />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M0 ${90 + i * 120} Q960 ${60 + i * 122} 1920 ${100 + i * 118}`} fill="none" stroke="#6e4426" strokeWidth={4} opacity={0.5} />)}
        <g transform={`translate(${mix(260, 420, take)} 560)`}>
          <rect x={-400} y={-50} width={420} height={100} rx={40} fill="#6a3d78" stroke={INK} strokeWidth={6} />
          <circle cx={40} cy={0} r={62} fill="#f2a0bd" stroke={INK} strokeWidth={6} />
        </g>
        <g transform={`translate(${x + 330} 600)`} opacity={1 - take}>
          <rect x={0} y={-46} width={520} height={92} rx={40} fill={INK} />
          <circle cx={0} cy={0} r={58} fill="#f2b632" stroke={INK} strokeWidth={6} />
        </g>
        <g transform={`translate(${x} 560) rotate(${mix(-8, 3, slide)})`}>
          <rect x={-300} y={-160} width={600} height={340} rx={12} fill="#000" opacity={0.3} transform="translate(14 18)" />
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
    <AbsoluteFill style={{ background: "#0d1230" }}>
      <svg width={1920} height={1080}>
        <g transform={`translate(960 560) scale(${z}) translate(-800 -450)`}>
          <SplitMonitor frame={frame} point={ramp(frame, from + 6, from + 24)} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

function cues(shot: Shot) {
  const LA1 = lineNth(shot, "Leader: As I wrote", 0);
  const LA2 = lineNth(shot, "Leader: As I wrote", 1);
  return {
    C6: shot.at("The challenger's"), EQ: shot.at("Every question"), HQ1: shot.at("Host: Did you take"), LA1, HQ2: shot.at("Host: Did you know"), LA2,
    ZZ: shot.at("Zero. Zero"), OC: shot.at("On the other channel"), P3: shot.at("Problem three"), IF: shot.at("If you could see"),
    liar: wordAt(shot, "Call his zero", "Call him"), H0: shot.end("Call his zero"), REM: shot.at("You remember"),
    c6: [shot.at("The challenger's", 0.18), shot.at("The challenger's", 0.64)],
  };
}
type K = ReturnType<typeof cues>;

const viewAt = (f: number, shot: Shot, k: K) => current<View>(f, [[shot.from, "wide"], [shot.from + 75, "leader"], [k.C6, "challenger"], [k.EQ, "two"],
  [k.HQ1, "hostQ"], [k.LA1.at, "leaderA"], [k.HQ2, "hostQ"], [k.LA2.at, "leaderA"], [k.ZZ, "zeros"], [k.OC, "monitor"], [k.P3, "problem"], [k.IF, "you"],
  [k.H0, "paper"], [k.H0 + 18, "desk"], [k.REM, "card"]]);

type H = { x: number; y: number; r: number };
function camera(v: View, f: number, shot: Shot, k: K, h: { leader: H; challenger: H; host: H; you: H; hand: { x: number; y: number } }): Camera {
  const mcu = (p: H, z: number, from: number, to: number, dx = 0): Camera =>
    camAt(f, [[from, { x: p.x + dx, y: p.y - 0.55 * p.r, zoom: z }], [to, { x: p.x + dx, y: p.y - 0.6 * p.r, zoom: z + 0.15 }]]);
  const L = h.leader;
  switch (v) {
    case "wide": return camAt(f, [[shot.from, { x: 960, y: 560, zoom: 1.0 }], [shot.from + 75, { x: 950, y: 570, zoom: 1.05 }]]);
    case "leader": return mcu(L, 2.9, shot.from + 75, k.C6, 70);
    case "challenger": return mcu(h.challenger, 2.9, k.C6, k.EQ, -70);
    case "two": return camAt(f, [[k.EQ, { x: L.x + 170, y: L.y + 30, zoom: 2.2 }], [k.HQ1, { x: L.x + 160, y: L.y + 20, zoom: 2.3 }]]);
    case "hostQ": return f < k.LA1.at ? mcu(h.host, 2.9, k.HQ1, k.LA1.at, 40) : mcu(h.host, 3.0, k.HQ2, k.LA2.at, 40);
    case "leaderA": return f < k.HQ2 ? mcu(L, 3.0, k.LA1.at, k.HQ2, 60) : mcu(L, 3.1, k.LA2.at, k.ZZ, 60);
    case "zeros": return camAt(f, [[k.ZZ, { x: L.x, y: L.y - 1.3 * L.r, zoom: 4.0 }], [k.OC, { x: L.x, y: L.y - 1.4 * L.r, zoom: 4.5 }]]);
    case "problem": {
      const z = mix(2.5, 2.9, ramp(f, k.P3, k.IF));
      return { x: L.x - 230 / z, y: L.y - 0.5 * L.r, zoom: z };
    }
    case "you": return camAt(f, [[k.IF, { x: h.you.x + 110, y: h.you.y + 0.3 * h.you.r, zoom: 3.2 }], [k.H0, { x: h.you.x + 100, y: h.you.y + 0.25 * h.you.r, zoom: 3.4 }]]);
    case "paper": return { x: h.hand.x + 10, y: h.hand.y - 30, zoom: 5.5 };
    default: return camAt(f, [[k.H0 + 18, { x: (h.host.x + h.you.x) / 2 + 20, y: h.you.y + 70, zoom: 2.5 }], [k.REM, { x: (h.host.x + h.you.x) / 2 + 20, y: h.you.y + 60, zoom: 2.65 }]]);
  }
}

function youLook(f: number, k: K) {
  const write = ramp(f, k.H0 + 30, k.H0 + 50);
  const slide = ramp(f, k.H0 + 50, k.REM + 6);
  const pose: Pose = f >= k.H0 + 18
    ? { ...SEATED, armF: write > 0 && write < 1 ? [72 + Math.sin(f / 2) * 6, 40] : slide > 0 ? [mix(60, 95, slide), mix(40, 10, slide)] : [40, 50] }
    : SEATED;
  const face: Partial<Face> = f >= k.H0 ? { brows: "angry", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 1, y: f >= k.H0 + 18 ? 0.5 : -0.2 } }
    : f >= k.liar ? { brows: "worry", lids: 0.2, mouth: "wobble", eyes: 1, look: { x: 0.4, y: 0.6 } }
      : f >= k.IF ? { brows: "worry", lids: 0, mouth: "flat", eyes: 1.1, look: { x: 1, y: -0.1 } }
        : { brows: "flat", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 1, y: 0 } };
  return { pose, face, write, card: f >= k.H0 + 30 ? mix(D.you + 50, D.host - 30, slide) : null };
}

const StatementBeat: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = shot.frame;
  const k = cues(shot);
  const v = viewAt(f, shot, k);
  if (v === "monitor") return <MonitorInsert frame={f} from={k.OC} to={k.P3} />;
  if (v === "card") return <CardInsert frame={f} from={k.REM} to={shot.to} text="READ IT OUT LOUD." />;

  const answering = (f >= k.LA1.at && f < k.LA1.end) || (f >= k.LA2.at && f < k.LA2.end);
  const leaderPose: Pose = { ...STAND, armF: answering ? [70, 60] : [30, 95], armB: [20, 40] };
  const hostTalks = speaking(shot, "Host: Did you take") || speaking(shot, "Host: Did you know");
  const me = youLook(f, k);
  const seatY = seatedY(D.seat, D.s);
  const h = {
    leader: headAt(D.leader, D.floor, D.s, leaderPose, 1), challenger: headAt(D.challenger, D.floor, D.s, STAND, -1),
    host: headAt(D.host, seatY, D.s, SEATED, 1), you: headAt(D.you, seatY, D.s, me.pose, 1), hand: handAt(D.leader, D.floor, D.s, leaderPose, 1),
  };
  const cam = drift(camera(v, f, shot, k, h), f, `statement-${v}`, 4);
  const pulses = [0, 0.33, 0.66].map((s) => shot.at("Zero. Zero", s));
  const since = Math.min(...pulses.map((p) => (f >= p ? f - p : 999)));
  const ring = v === "zeros" && since < 20 ? since / 20 : -1;
  const cY = h.leader.y - h.leader.r - SIZE * 0.95;
  const actors = (
    <>
      <Person id="st-leader" who={LEADER} x={D.leader} y={D.floor} scale={D.s} facing={1} pose={leaderPose} frame={f} seed={3} count={{ base: 0, size: SIZE }}
        sash={SASH} held={<SheetProp tilt={-6} scale={0.75} />} face={{ brows: "raised", lids: 0.3, mouth: answering ? "open" : "smile", eyes: 1, look: { x: 0.9, y: 0 } }} />
      {ring >= 0 && <circle cx={h.leader.x} cy={cY} r={SIZE * (0.9 + ring)} fill="none" stroke={GLOW} strokeWidth={6 * (1 - ring)} opacity={1 - ring} />}
      {v !== "two" && (
        <Person id="st-challenger" who={CHALLENGER} x={D.challenger} y={D.floor} scale={D.s} facing={-1} pose={{ ...STAND, armF: [55, 50] }} frame={f} seed={7}
          count={{ base: 4, ticks: k.c6, size: SIZE }} face={{ brows: "none", lids: 0.25, mouth: "smile", eyes: 1, look: { x: 0.9, y: 0 } }} />
      )}
      <Person id="st-host" who={HOST} x={D.host} y={seatY} scale={D.s} facing={1} pose={{ ...SEATED, armF: [45, 50] }} frame={f} seed={4}
        count={{ base: 2, size: SIZE * 0.9 }} earpiece face={{ brows: hostTalks ? "raised" : "none", lids: 0, mouth: hostTalks ? "open" : "flat", eyes: 1, look: { x: 1, y: -0.1 } }} />
      <Person id="st-you" who={HERO} x={D.you} y={seatY} scale={D.s} facing={1} pose={me.pose} face={me.face} frame={f} seed={1} count={null} />
    </>
  );
  const onDesk = me.card !== null ? <g transform={`translate(${me.card} ${D.deskTop - 6}) rotate(-4)`}><CardProp scale={1.1} scrawl={me.write} /></g> : undefined;
  const minutes = Math.round(mix(0, 22, linear(f, shot.from, k.IF)));
  const lights = [counterLight(h.leader.x, cY, 300, 0.3), counterLight(h.challenger.x, h.challenger.y - h.challenger.r - SIZE, 260, 0.22)];
  return (
    <DebateScene cam={cam} mood={MOOD} frame={f} minutes={minutes} actors={actors} onDesk={onDesk} lights={lights}
      over={
        <>
          {v === "two" && <OverShoulder who={CHALLENGER} x={1560} y={800} r={240} lit={0.6} />}
          {v !== "paper" && <Readout label="EVERYONE YOU CAN SEE" value={88} frame={f} on={shot.from + 15} />}
        </>
      } />
  );
};

/** Statement: the leader's zero, the split monitor, the dilemma, and the card. */
export const statement: Beat = { id: "Statement", first: "Thursday. Eight o'clock.", lead: 0.3, Component: StatementBeat };
