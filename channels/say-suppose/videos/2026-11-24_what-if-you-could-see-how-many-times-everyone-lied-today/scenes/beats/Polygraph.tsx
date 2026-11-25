// The Polygraph and the Dishes [05:25] (look C). The studio (tv-night plate): the polygraph rolls in on its trolley and
// is wired to the rival's fingers on his stool, his own thermal picture on his monitor (his nose orange); close on
// the test subject on the other stool reading twenty statements, close on you as your ticks land; the small scoreboard
// YOU / POLYGRAPH / RIVAL counting to 20 / 13 / 11, the needles wandering, the rival sweating close up. The host shakes
// your hand: the job; on "Dodge a direct challenge" the monitor shows the CLOSING clock sweeping down (the debate's
// rule). Then the one tender beat, short and warm: the kitchen at lamp light (kitchen-lamp plate), over your shoulder
// to your flatmate at the sink with his 1, close on you ("Why say it?"), close on him; you take the sponge and wash the
// plates, he sits down behind the table with his spoon, the 1 glowing over him like a nightlight.
import { lerpPose, SEATED, seatedY, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { camAt, current, HERO, mix, PASTELS, ramp, type Beat, type Shot } from "../shared";
import {
  Bubble, CardProp, FLATMATE, handAt, headAt, HOST, Mic, PlateProp, Person, Polygraph, RIVAL, Scoreboard, Sponge, Spoon,
  wordAt, type Face,
} from "../parts/RivalParts";
import { FLOOR, MONITOR, RivalStudio, S, SEAT_TOP, STOOL } from "../parts/RivalStudio";
import { K, KitchenPlate } from "../parts/Polygraph.Kitchen";
import { counterLight, OverShoulder } from "../parts/Rival.Shots";

const SIZE = 36 * S;
const POLY = { x: 540, s: 1.1 };
const YOU_X = 1500;
const HOST_X = 1790;
const LIES = [1, 2, 4, 7, 8, 11, 13, 14, 17, 19];
const BOARD = { x: 1300, y: 50, s: 0.7 };

type View = "machine" | "rig" | "reading" | "watch" | "board" | "needles" | "sweat" | "job" | "rules" | "nod";

function studioCues(shot: Shot) {
  const S0 = shot.end("So the network");
  const S1 = shot.at("Twenty out of twenty");
  const J = shot.at("Live fact-checker");
  const dodge = wordAt(shot, "Live fact-checker", "Dodge");
  return {
    S0, S1, J, dodge, mid: Math.round(mix(shot.from, S0, 0.5)), polyHi: wordAt(shot, "Twenty out of twenty", "The polygraph"),
    rivalHi: wordAt(shot, "Twenty out of twenty", "The rival"), K: shot.at("Flatmate: You never"),
    st: Array.from({ length: 20 }, (_, i) => Math.round(S0 + (S1 - S0 - 4) * (i + 0.5) / 20)),
  };
}
type SC = ReturnType<typeof studioCues>;

type H = { x: number; y: number; r: number };
function studioCam(v: View, f: number, c: SC, shot: Shot, h: { rival: H; subject: H; you: H; host: H }, polyX: number): Camera {
  const mcu = (p: H, z: number, from: number, to: number, dx = 0): Camera =>
    camAt(f, [[from, { x: p.x + dx, y: p.y - 0.55 * p.r, zoom: z }], [to, { x: p.x + dx, y: p.y - 0.6 * p.r, zoom: z + 0.15 }]]);
  const cu = (p: H, z: number, from: number, to: number): Camera =>
    camAt(f, [[from, { x: p.x, y: p.y + 0.25 * p.r, zoom: z }], [to, { x: p.x, y: p.y + 0.2 * p.r, zoom: z + 0.15 }]]);
  switch (v) {
    case "machine": return camAt(f, [[shot.from, { x: 900, y: 590, zoom: 1.02 }], [c.mid, { x: 880, y: 600, zoom: 1.1 }]]);
    case "rig": return camAt(f, [[c.mid, { x: (polyX + h.rival.x) / 2 + 40, y: 600, zoom: 1.6 }], [c.S0, { x: (polyX + h.rival.x) / 2 + 40, y: 610, zoom: 1.72 }]]);
    case "reading": return mcu(h.subject, 2.1, c.S0, c.S0 + 45, -40);
    case "watch": return cu(h.you, 2.7, c.S0 + 45, c.S1);
    case "board": return camAt(f, [[c.S1, { x: BOARD.x + 196, y: BOARD.y + 120, zoom: 2.6 }], [c.polyHi, { x: BOARD.x + 196, y: BOARD.y + 118, zoom: 2.75 }]]);
    case "needles": return camAt(f, [[c.polyHi, { x: polyX + 60, y: FLOOR - 330, zoom: 2.6 }], [c.rivalHi, { x: polyX + 70, y: FLOOR - 335, zoom: 2.8 }]]);
    case "sweat": return mcu(h.rival, 2.3, c.rivalHi, c.J, 40);
    case "job": return camAt(f, [[c.J, { x: (h.you.x + h.host.x) / 2, y: h.you.y + 40, zoom: 1.75 }], [c.dodge, { x: (h.you.x + h.host.x) / 2, y: h.you.y + 30, zoom: 1.85 }]]);
    case "rules": {
      const m = { x: MONITOR.x + MONITOR.w / 2, y: MONITOR.y + MONITOR.h / 2 };
      return camAt(f, [[c.dodge, { ...m, zoom: 3.6 }], [c.dodge + 50, { ...m, zoom: 3.9 }]]);
    }
    default: return cu(h.you, 2.8, c.dodge + 50, c.K);
  }
}

function studioFaces(f: number, c: SC, sweat: number) {
  const rivalFace: Partial<Face> = f >= c.J ? { brows: "angry", lids: 0.35, mouth: "frown", eyes: 1, look: { x: 0.8, y: 0.3 } }
    : sweat > 0.3 ? { brows: "worry", lids: 0, mouth: "wobble", eyes: 1.15, look: { x: 0.6, y: -0.6 } }
      : { brows: "raised", lids: 0.4, mouth: "smirk", eyes: 1, look: { x: 0.8, y: 0 } };
  const youFace: Partial<Face> = f >= c.J ? { brows: "raised", lids: 0, mouth: "smile", eyes: 1, look: { x: 1, y: 0 } }
    : { brows: "flat", lids: 0.3, mouth: "flat", eyes: 1, look: { x: -1, y: -0.3 } };
  return { rivalFace, youFace };
}

const Studio: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = shot.frame;
  const c = studioCues(shot);
  const v = current<View>(f, [[shot.from, "machine"], [c.mid, "rig"], [c.S0, "reading"], [c.S0 + 45, "watch"], [c.S1, "board"],
    [c.polyHi, "needles"], [c.rivalHi, "sweat"], [c.J, "job"], [c.dodge, "rules"], [c.dodge + 50, "nod"]]);
  const done = c.st.filter((t) => f >= t).length;
  const scores: [number, number, number] = [done, Math.round((13 * done) / 20), Math.round((11 * done) / 20)];
  const hi = f < c.S1 ? -1 : f < c.polyHi ? 0 : f < c.rivalHi ? 1 : 2;
  const polyX = mix(-300, POLY.x, ramp(f, shot.from + 4, Math.round(mix(shot.from, c.S0, 0.45))));
  const wired = ramp(f, c.mid, Math.round(mix(shot.from, c.S0, 0.75)));
  const sweat = ramp(f, c.S0 + 10, c.S0 + 40);
  const shake = f >= c.J ? ramp(f, c.J + 6, c.J + 26) : 0;
  const unwire = f >= c.J ? ramp(f, c.J + 10, c.J + 30) : 0;
  const seatY = seatedY(SEAT_TOP, S);
  const w = wired * (1 - unwire);
  const rivalPose: Pose = { ...SEATED, armB: [mix(10, -55, w), mix(25, -30, w)], tilt: f >= c.J ? 6 : 0 };
  const hand = handAt(STOOL.left, seatY, S, { ...rivalPose, armF: rivalPose.armB }, 1);
  const { rivalFace, youFace } = studioFaces(f, c, sweat);
  const reading = f >= c.S0 && f < c.S1;
  const youPose: Pose = { ...STAND, armF: [mix(9, 70, shake), mix(10, 10, shake)] };
  const hostX = mix(HOST_X, 1690, shake);
  const hostPose: Pose = f >= c.J ? { ...STAND, armF: [mix(30, 72, shake), mix(30, 8, shake)] } : { ...STAND, armF: [25, 70] };
  const h = {
    rival: headAt(STOOL.left, seatY, S, rivalPose, 1), subject: headAt(STOOL.right, seatY, S, SEATED, -1),
    you: headAt(YOU_X, FLOOR, S, youPose, 1), host: headAt(hostX, FLOOR, S, hostPose, -1),
  };
  const cam = drift(studioCam(v, f, c, shot, h, polyX), f, "poly", 5);
  const box = { x: polyX + 110 * POLY.s, y: FLOOR - 300 * POLY.s };
  const subjectTicks = c.st.filter((_, i) => LIES.includes(i));
  const actors = (
    <>
      <g transform={`translate(${polyX} ${FLOOR}) scale(${POLY.s}) translate(${-polyX} ${-FLOOR})`}>
        <Polygraph x={polyX} floor={FLOOR} frame={f} wild={0.3 + sweat * 0.6} />
      </g>
      <Person id="pg-rival" who={RIVAL} x={STOOL.left} y={seatY} scale={S} facing={1} pose={rivalPose} face={rivalFace} frame={f} seed={2}
        count={{ base: 65, size: SIZE }} sweat={sweat * (1 - unwire)} />
      {wired > 0 && [0, 1, 2].map((k) => (
        <path key={k} d={`M${hand.x} ${hand.y} Q${mix(hand.x, box.x, 0.5)} ${hand.y + 50 + k * 14} ${box.x} ${box.y + k * 34}`}
          fill="none" stroke={["#d8344f", "#1d9a8f", INK][k]} strokeWidth={5} opacity={w} />
      ))}
      <Person id="pg-subject" who={{ head: PASTELS[2], coat: "#4a5a6a" }} x={STOOL.right} y={seatY} scale={S} facing={-1}
        pose={{ ...SEATED, armF: [30, 110] }} frame={f} seed={5} count={{ base: 0, ticks: subjectTicks, size: SIZE }} held={<CardProp tilt={-6} scale={1.2} />}
        face={{ brows: "none", lids: 0.1, mouth: reading && Math.floor((f - c.S0) / 5) % 2 === 0 ? "open" : "flat", eyes: 1, look: { x: 0.4, y: 0.6 } }} />
      <Person id="pg-you" who={HERO} x={YOU_X} y={FLOOR} scale={S} facing={1} pose={youPose} face={youFace} frame={f} seed={1} count={null} />
      <Person id="pg-host" who={HOST} x={hostX} y={FLOOR} scale={S} facing={-1} pose={hostPose} frame={f} seed={4} count={{ base: 3, size: SIZE * 0.9 }} earpiece
        face={{ brows: "raised", lids: 0, mouth: f >= c.J ? "smile" : "flat", eyes: 1, look: { x: 1, y: 0 } }} held={f >= c.J ? undefined : <Mic />} />
      {v !== "watch" && v !== "job" && v !== "nod" && (
        <g>
          {[BOARD.x + 30, BOARD.x + 360].map((x) => <line key={x} x1={x} y1={-200} x2={x} y2={BOARD.y} stroke="#3b3e47" strokeWidth={4} />)}
          <g transform={`translate(${BOARD.x} ${BOARD.y}) scale(${BOARD.s})`}><Scoreboard x={0} y={0} scores={scores} hi={hi} /></g>
        </g>
      )}
    </>
  );
  const show = f >= c.dodge ? { closing: ramp(f, c.dodge + 6, c.K) } : { thermal: "rival" as const, nose: "#ff6a00" };
  const lights = [counterLight(h.subject.x, h.subject.y - h.subject.r - SIZE * 0.95, 320, 0.28), counterLight(h.rival.x, h.rival.y - h.rival.r - SIZE, 320, 0.22)];
  return <RivalStudio cam={cam} mood="night" frame={f} show={show} actors={actors} lights={lights} />;
};

type KView = "door" | "you" | "him" | "wide" | "spoon" | "wash" | "night";

function kitchenCues(shot: Shot) {
  const K0 = shot.at("Flatmate: You never");
  const K2 = shot.at("Flatmate: You'd had");
  const C = shot.end("Flatmate: You'd had") + 2;
  const SC = shot.at("Flatmate: Still counts");
  const OUT = shot.at("Still counts. And");
  return { K0, K2, C, SC, OUT, W0: C + 4, W1: SC + 15, K0e: shot.end("Flatmate: You never"), K2e: shot.end("Flatmate: You'd had"), SCe: shot.end("Flatmate: Still counts") };
}
type KC = ReturnType<typeof kitchenCues>;

function kitchenCam(v: KView, f: number, c: KC, shot: Shot, him: H, you: H): Camera {
  const mcu = (p: H, z: number, from: number, to: number): Camera =>
    camAt(f, [[from, { x: p.x, y: p.y - 0.5 * p.r, zoom: z }], [to, { x: p.x, y: p.y - 0.55 * p.r, zoom: z + 0.15 }]]);
  const cu = (p: H, z: number, from: number, to: number): Camera =>
    camAt(f, [[from, { x: p.x, y: p.y + 0.25 * p.r, zoom: z }], [to, { x: p.x, y: p.y + 0.2 * p.r, zoom: z + 0.15 }]]);
  switch (v) {
    case "door": return camAt(f, [[c.K0, { x: him.x - 60, y: him.y + 80, zoom: 1.7 }], [c.K0 + 55, { x: him.x - 50, y: him.y + 70, zoom: 1.8 }]]);
    case "you": return cu(you, 2.8, c.K0 + 55, c.K2 + 15);
    case "him": return mcu(him, 2.5, c.K2 + 15, c.C);
    case "wide": return camAt(f, [[c.C, { x: 900, y: 600, zoom: 1.1 }], [c.SC, { x: 920, y: 600, zoom: 1.16 }]]);
    case "spoon": return mcu(him, 2.4, c.SC, c.OUT);
    case "wash": return cu(you, 2.6, c.OUT, c.OUT + 60);
    default: return camAt(f, [[c.OUT + 60, { x: 1000, y: 560, zoom: 1.5 }], [shot.to, { x: 960, y: 580, zoom: 1.15 }]]);
  }
}

const Dishes: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = shot.frame;
  const c = kitchenCues(shot);
  const v = current<KView>(f, [[c.K0, "door"], [c.K0 + 55, "you"], [c.K2 + 15, "him"], [c.C, "wide"], [c.SC, "spoon"], [c.OUT, "wash"], [c.OUT + 60, "night"]]);
  // the hold: you cross to the sink and take the sponge; he goes to the far chair and sits with his spoon
  const len = Math.max(60, c.W1 - c.W0);
  const youGo = ramp(f, c.W0, c.W0 + len * 0.38);
  const handOver = f >= c.W0 + len * 0.42;
  const himGo = ramp(f, c.W0 + len * 0.45, c.W0 + len * 0.85);
  const himSit = ramp(f, c.W0 + len * 0.8, c.W0 + len);
  const youMoving = Math.min(ramp(f, c.W0, c.W0 + 6), 1 - ramp(f, c.W0 + len * 0.34, c.W0 + len * 0.4));
  const himMoving = Math.min(ramp(f, c.W0 + len * 0.45, c.W0 + len * 0.5), 1 - ramp(f, c.W0 + len * 0.8, c.W0 + len * 0.86));
  const plates = handOver ? Math.max(3, 7 - Math.floor((f - (c.W0 + len * 0.42)) / 40)) : 7;
  const youX = mix(K.door, K.youSink, youGo);
  const youBase: Pose = lerpPose(STAND, walkPose(f * 0.4), youMoving);
  const youPose: Pose = handOver ? { ...youBase, armF: [62 + Math.sin(f / 5) * 6, 40], armB: [40, 30] } : youBase;
  const himX = mix(K.himSink, K.chair, himGo);
  const himFacing: 1 | -1 = himGo > 0 && himGo < 1 ? 1 : -1;
  const himStand: Pose = himGo > 0 ? lerpPose(STAND, walkPose(f * 0.4 + 2), himMoving) : { ...STAND, armF: [70, 30] };
  const himPose: Pose = himSit > 0 ? { ...lerpPose(himStand, SEATED, himSit), armF: [60, 95] } : himStand;
  const himY = mix(K.behind, seatedY(K.seat, K.s), himSit);
  const youFace: Partial<Face> = f >= c.C ? { brows: "none", lids: 0.3, mouth: "smile", eyes: 1, look: { x: 0.6, y: 0.5 } }
    : { brows: "sad", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 1, y: 0 } };
  const himTalks = (f >= c.K0 && f < c.K0e) || (f >= c.K2 && f < c.K2e) || (f >= c.SC && f < c.SCe);
  const himFace: Partial<Face> = { brows: f >= c.K2 && f < c.C ? "worry" : "none", lids: 0.35, mouth: himTalks ? "open" : "smile", eyes: 1, look: { x: -1, y: 0 } };
  const him = headAt(himX, himY, K.s, himPose, himFacing);
  const you = headAt(youX, K.floor, K.s, youBase, 1);
  const cam = drift(kitchenCam(v, f, c, shot, him, you), f, "dishes", 4);
  const size = 36 * K.s;
  const night = 0.5 + 0.5 * ramp(f, c.W0, c.W1);
  return (
    <KitchenPlate cam={cam} plates={plates} lights={[counterLight(him.x, him.y - him.r - size * 0.95, 380, 0.3 * night)]}
      actors={
        <>
          <Person id="dish-him" who={FLATMATE} x={himX} y={himY} scale={K.s} facing={himFacing} pose={himPose} face={himFace} frame={f} seed={6}
            count={{ base: 1, size }} held={handOver ? <Spoon /> : <Sponge />} />
          {v !== "door" && <Person id="dish-you" who={HERO} x={youX} y={K.floor} scale={K.s} facing={1} pose={youPose} face={youFace} frame={f} seed={1}
            count={null} held={handOver ? <PlateProp turn={f * 4} /> : undefined} />}
          <Bubble frame={f} at={c.K0e + 4} until={c.K2 + 20} x={you.x + 10} y={you.y - you.r - 10} text="Why say it?" size={40 / cam.zoom} />
        </>
      }
      over={v === "door" ? <OverShoulder who={{ ...HERO, coat: "#3b4252" }} x={330} y={830} r={250} /> : undefined} />
  );
};

const PolygraphBeat: React.FC<{ shot: Shot }> = ({ shot }) =>
  shot.frame < shot.at("Flatmate: You never") ? <Studio shot={shot} /> : <Dishes shot={shot} />;

/** Polygraph: the scoreboard 20 / 13 / 11, the job, and the dishes at lamp light. */
export const polygraph: Beat = { id: "Polygraph", first: "So the network brings", lead: 0.3, Component: PolygraphBeat };
