// The Polygraph and the Dishes [05:25] (G2 first cut). The studio: the polygraph rolls in on its trolley and is wired to
// the rival's fingers, his own thermal camera on him (his nose orange on the big screen), a test subject on a stool
// reading twenty statements, the scoreboard YOU / POLYGRAPH / RIVAL counting to 20 / 13 / 11 while the rival sweats.
// The host shakes your hand: the job; on "Dodge a direct challenge" she points up at the big screen, a CLOSING
// clock sweeping down (the debate's rule). Then the one tender beat, short and
// warm: the kitchen at lamp light, your flatmate at the sink with his 1, you in the doorway ("Why say it?"); you take
// the sponge and wash the plates, he sits down with his spoon, the 1 glowing over him like a nightlight.
import { lerpPose, SEATED, seatedY, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import { toScreen } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { camAt, current, GLOW, HERO, mix, PASTELS, ramp, type Beat, type Shot } from "../shared";
import {
  Bubble, CardProp, FLATMATE, handAt, headAt, HOST, Mic, PlateProp, Person, Polygraph, RIVAL, Scoreboard, Sponge, Spoon, Stool, ThermalCam,
  wordAt, type Face,
} from "../parts/RivalParts";
import { FLOOR, RivalStudio } from "../parts/RivalStudio";
import { CHAIR, DOOR_X, K_FLOOR, KitchenShot, SINK } from "../parts/NineKitchen";

const S = 1.1;
const SEAT_TOP = 760;
const POLY_X = 960;
const RIVAL_X = 600;
const SUBJECT_X = 1260;
const YOU_X = 1540;
const HOST_X = 1770;
const LIES = [1, 2, 4, 7, 8, 11, 13, 14, 17, 19];

type View = "machine" | "rig" | "board" | "sweat" | "job" | "rules";

const Studio: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = shot.frame;
  const S0 = shot.end("So the network");
  const S1 = shot.at("Twenty out of twenty");
  const polyHi = wordAt(shot, "Twenty out of twenty", "The polygraph");
  const rivalHi = wordAt(shot, "Twenty out of twenty", "The rival");
  const J = shot.at("Live fact-checker");
  const dodge = wordAt(shot, "Live fact-checker", "Dodge");
  const mid = Math.round(mix(S0, S1, 0.5));
  const view = current<View>(f, [[shot.from, "machine"], [S0, "rig"], [mid, "board"], [rivalHi, "sweat"], [J, "job"], [dodge, "rules"]]);

  // twenty statements across the hold; your column takes every one, the polygraph thirteen, the rival eleven
  const st = Array.from({ length: 20 }, (_, i) => Math.round(S0 + (S1 - S0 - 4) * (i + 0.5) / 20));
  const done = st.filter((t) => f >= t).length;
  const scores: [number, number, number] = [done, Math.round((13 * done) / 20), Math.round((11 * done) / 20)];
  const hi = f < S1 ? -1 : f < polyHi ? 0 : f < rivalHi ? 1 : 2;

  const roll = ramp(f, shot.from + 4, Math.round(mix(shot.from, S0, 0.45)));
  const polyX = mix(1500, POLY_X, roll);
  const wired = ramp(f, Math.round(mix(shot.from, S0, 0.5)), Math.round(mix(shot.from, S0, 0.7)));
  const sweat = ramp(f, S0 + 10, S0 + 40);
  const shake = f >= J ? ramp(f, J + 6, J + 26) : 0;
  const unwire = f >= J ? ramp(f, J + 10, J + 30) : 0;

  const rivalPose: Pose = { ...SEATED, armF: [mix(25, 78, wired * (1 - unwire)), mix(35, 8, wired * (1 - unwire))], tilt: f >= J ? 6 : 0 };
  const rivalAt = { x: RIVAL_X, y: seatedY(SEAT_TOP, S) };
  const hand = handAt(rivalAt.x, rivalAt.y, S, rivalPose, 1);
  const rivalFace: Partial<Face> = f >= J ? { brows: "angry", lids: 0.35, mouth: "frown", eyes: 1, look: { x: 0.8, y: 0.3 } }
    : sweat > 0.3 ? { brows: "worry", lids: 0, mouth: "wobble", eyes: 1.15, look: { x: 0.6, y: -0.6 } }
      : { brows: "raised", lids: 0.4, mouth: "smirk", eyes: 1, look: { x: 0.8, y: 0 } };

  const reading = f >= S0 && f < S1;
  const subjectFace: Partial<Face> = { brows: "none", lids: 0.1, mouth: reading && Math.floor((f - S0) / 5) % 2 === 0 ? "open" : "flat", eyes: 1, look: { x: 0.4, y: 0.6 } };

  const youPose: Pose = { ...SEATED, armF: [mix(25, 70, shake), mix(35, 10, shake)] };
  const youFace: Partial<Face> = f >= J ? { brows: "raised", lids: 0, mouth: "smile", eyes: 1, look: { x: -1, y: 0 } }
    : { brows: "flat", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 1, y: -0.2 } };
  const hostX = mix(HOST_X, 1690, shake);
  const hostPose: Pose = f >= dodge ? { ...STAND, armF: [150, 10] } : f >= J ? { ...STAND, armF: [mix(30, 72, shake), mix(30, 8, shake)] } : { ...STAND, armF: [90, 28] };

  const cam = drift((() => {
    switch (view) {
      case "machine": return camAt(f, [[shot.from, { x: 1040, y: 560, zoom: 1.02 }], [S0, { x: 1000, y: 580, zoom: 1.12 }]]);
      case "rig": return camAt(f, [[S0, { x: 760, y: 610, zoom: 1.55 }], [mid, { x: 780, y: 600, zoom: 1.65 }]]);
      case "board": return camAt(f, [[mid, { x: 1560, y: 360, zoom: 1.75 }], [rivalHi, { x: 1570, y: 360, zoom: 1.85 }]]);
      case "sweat": return camAt(f, [[rivalHi, { x: 640, y: 560, zoom: 1.9 }], [J, { x: 640, y: 560, zoom: 2.0 }]]);
      case "job": return camAt(f, [[J, { x: 1600, y: 740, zoom: 1.6 }], [dodge, { x: 1600, y: 735, zoom: 1.68 }]]);
      default: return camAt(f, [[dodge, { x: 1000, y: 470, zoom: 1.02 }], [shot.at("Flatmate: You never"), { x: 960, y: 500, zoom: 1.06 }]]);
    }
  })(), f, "poly", 4);

  const box = { x: polyX - 130, y: FLOOR - 330 + 40 };
  const actors = (
    <>
      <ThermalCam x={380} y={FLOOR} aim={1} scale={0.78} />
      <Stool x={RIVAL_X} top={SEAT_TOP} floor={FLOOR} />
      <Stool x={SUBJECT_X} top={SEAT_TOP} floor={FLOOR} />
      <Stool x={YOU_X} top={SEAT_TOP} floor={FLOOR} />
      <Polygraph x={polyX} floor={FLOOR} frame={f} wild={0.3 + sweat * 0.6} />
      <Person id="pg-rival" who={RIVAL} x={rivalAt.x} y={rivalAt.y} scale={S} pose={rivalPose} face={rivalFace} frame={f} seed={2}
        count={{ base: 65 }} sweat={sweat * (1 - unwire)} />
      {wired > 0 && [0, 1, 2].map((k) => (
        <path key={k} d={`M${hand.x} ${hand.y} Q${mix(hand.x, box.x, 0.5)} ${hand.y + 90 + k * 20} ${box.x} ${box.y + k * 30}`}
          fill="none" stroke={["#d8344f", "#1d9a8f", INK][k]} strokeWidth={4} opacity={wired * (1 - unwire)} />
      ))}
      <Person id="pg-subject" who={{ head: PASTELS[2], coat: "#4a5a6a" }} x={SUBJECT_X} y={seatedY(SEAT_TOP, S)} scale={S} facing={-1}
        pose={{ ...SEATED, armF: [55, 60] }} face={subjectFace} frame={f} seed={5} count={{ base: 0, ticks: st.filter((_, i) => LIES.includes(i)) }}
        held={<CardProp tilt={10} />} />
      <Person id="pg-you" who={HERO} x={YOU_X} y={seatedY(SEAT_TOP, S)} scale={S} facing={-1} pose={youPose} face={youFace} frame={f} seed={1} count={null} />
      <Person id="pg-host" who={HOST} x={hostX} y={FLOOR} scale={1.12} facing={-1} pose={hostPose} frame={f} seed={4} count={{ base: 3 }} earpiece
        face={{ brows: "raised", lids: 0, mouth: f >= J ? "smile" : "flat", eyes: 1, look: { x: 1, y: 0 } }} held={f >= J ? undefined : <Mic />} />
      <line x1={1420} y1={0} x2={1420} y2={200} stroke="#3b3e47" strokeWidth={5} />
      <line x1={1720} y1={0} x2={1720} y2={200} stroke="#3b3e47" strokeWidth={5} />
      <Scoreboard x={1290} y={196} scores={scores} hi={hi} />
    </>
  );
  const show = f >= dodge ? { closing: ramp(f, dodge + 6, shot.at("Flatmate: You never")) } : { thermal: "rival" as const, nose: "#ff6a00" };
  return <RivalStudio cam={cam} mood="night" frame={f} show={show} actors={actors} />;
};

type KView = "door" | "him" | "wide" | "spoon";

const Dishes: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = shot.frame;
  const K = shot.at("Flatmate: You never");
  const K2 = shot.at("Flatmate: You'd had");
  const C = shot.end("Flatmate: You'd had") + 2;
  const W0 = C + 4;
  const W1 = shot.at("Flatmate: Still counts") + 15;
  const SC = shot.at("Flatmate: Still counts");
  const OUT = shot.at("Still counts. And");
  const view = current<KView>(f, [[K, "door"], [K2, "him"], [C, "wide"], [SC, "spoon"]]);

  // the hold: you cross to the sink and take the sponge; he goes to the chair and sits with his spoon
  const len = Math.max(60, W1 - W0);
  const youGo = ramp(f, W0, W0 + len * 0.38);
  const handOver = f >= W0 + len * 0.42;
  const himGo = ramp(f, W0 + len * 0.45, W0 + len * 0.85);
  const himSit = ramp(f, W0 + len * 0.8, W0 + len);
  const youMoving = Math.min(ramp(f, W0, W0 + 6), 1 - ramp(f, W0 + len * 0.34, W0 + len * 0.4));
  const himMoving = Math.min(ramp(f, W0 + len * 0.45, W0 + len * 0.5), 1 - ramp(f, W0 + len * 0.8, W0 + len * 0.86));
  const washing = handOver;
  const plates = washing ? Math.max(3, 7 - Math.floor((f - (W0 + len * 0.42)) / 40)) : 7;

  const youX = mix(DOOR_X, SINK.x + 150, youGo);
  const youBase: Pose = lerpPose(STAND, walkPose(f * 0.4), youMoving);
  const youPose: Pose = washing ? { ...youBase, armF: [62 + Math.sin(f / 5) * 6, 40], armB: [40, 30] } : youBase;
  const himX = mix(SINK.x - 80, CHAIR.x, himGo);
  const himFacing = himGo > 0 && himGo < 1 ? -1 : himGo >= 1 ? 1 : 1;
  const himStand: Pose = himGo > 0 ? lerpPose(STAND, walkPose(f * 0.4 + 2), himMoving) : { ...STAND, armF: [70, 30] };
  const himPose: Pose = himSit > 0 ? { ...lerpPose(himStand, SEATED, himSit), armF: [60, 95] } : himStand;
  const himY = mix(K_FLOOR, seatedY(CHAIR.seat, S), himSit);

  const youFace: Partial<Face> = f >= C ? { brows: "none", lids: 0.3, mouth: "smile", eyes: 1, look: { x: 0.6, y: 0.5 } }
    : { brows: "sad", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 1, y: 0 } };
  const himTalks = (f >= K && f < shot.end("Flatmate: You never")) || (f >= K2 && f < shot.end("Flatmate: You'd had")) || (f >= SC && f < shot.end("Flatmate: Still counts"));
  const himFace: Partial<Face> = { brows: f >= K2 && f < C ? "worry" : "none", lids: 0.35, mouth: himTalks ? "open" : "smile", eyes: 1, look: { x: 1, y: 0 } };

  const cam = drift((() => {
    switch (view) {
      case "door": return camAt(f, [[K, { x: 1330, y: 620, zoom: 1.4 }], [K2, { x: 1340, y: 610, zoom: 1.48 }]]);
      case "him": return camAt(f, [[K2, { x: 1120, y: 600, zoom: 1.85 }], [C, { x: 1110, y: 600, zoom: 1.95 }]]);
      case "wide": return camAt(f, [[C, { x: 1000, y: 580, zoom: 1.15 }], [SC, { x: 900, y: 590, zoom: 1.22 }]]);
      default: return camAt(f, [[SC, { x: 520, y: 620, zoom: 1.7 }], [OUT, { x: 560, y: 610, zoom: 1.6 }], [shot.to, { x: 900, y: 560, zoom: 1.12 }]]);
    }
  })(), f, "dishes", 3);

  const head = headAt(himX, himY, S, himPose, himFacing as 1 | -1);
  const counterAt = toScreen(cam, head.x, head.y - head.r - 66);
  const night = 0.5 + 0.5 * ramp(f, W0, W1);
  const yourHead = headAt(youX, K_FLOOR, S, youBase, -1);
  const him = (
    <Person id="dish-him" who={FLATMATE} x={himX} y={himY} scale={S} facing={himFacing as 1 | -1} pose={himPose} face={himFace} frame={f} seed={6}
      count={{ base: 1, size: 68 }} held={handOver ? <Spoon /> : <Sponge />} />
  );
  return (
    <KitchenShot cam={cam} mood="lamp" frame={f} plates={plates}
      glows={[{ x: counterAt.x, y: counterAt.y, r: 260 * cam.zoom, color: GLOW, strength: 0.25 * night }]}
      seated={himSit > 0 ? him : undefined}
      onTable={<ellipse cx={420} cy={796} rx={50} ry={12} fill="#f4f4f0" stroke={INK} strokeWidth={3} />}
      actors={
        <>
          {himSit <= 0 && him}
          <Person id="dish-you" who={HERO} x={youX} y={K_FLOOR} scale={S} facing={-1} pose={youPose} face={youFace} frame={f} seed={1} count={null}
            held={washing ? <PlateProp turn={f * 4} /> : undefined} />
          <Bubble frame={f} at={shot.end("Flatmate: You never") + 4} until={K2 + 20} x={yourHead.x - 10} y={yourHead.y - yourHead.r - 20}
            text="Why say it?" size={40} side="left" />
        </>
      } />
  );
};

const PolygraphBeat: React.FC<{ shot: Shot }> = ({ shot }) =>
  shot.frame < shot.at("Flatmate: You never") ? <Studio shot={shot} /> : <Dishes shot={shot} />;

/** Polygraph: the scoreboard 20 / 13 / 11, the job, and the dishes at lamp light. */
export const polygraph: Beat = { id: "Polygraph", first: "So the network brings", lead: 0.3, Component: PolygraphBeat };
