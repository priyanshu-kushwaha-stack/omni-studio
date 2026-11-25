// The Rival [04:55] (G2 first cut): the evening studio. The rival, sage head, white coat, beside his thermal camera, a 62
// over him and your face in heat colours on the big screen; he clicks to 63 and pats the camera. The thermal insert on
// "Nobody's nose is a counter": the nose warms, then cools. The host walks you both to two stools with the camera between you ("Say it out
// loud."); he says he has never lied, 64, the audience laughs, his camera swings round and his own nose glows orange;
// "Zero.", 65; the host turns to you and nothing comes out ("I can't see mine."); the audience laughs at the wrong one;
// problem two: a slow push on the empty place over your head.
import { interpolateColors } from "remotion";
import { lerpPose, SEATED, seatedY, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import { PAPER } from "@whatif/kit/theme";
import { camAt, current, HERO, mix, ramp, type Beat, type Shot } from "../shared";
import { AudienceBacks, Bubble, headAt, HOST, Mic, Person, RIVAL, Stool, ThermalCam, wordAt, type Face } from "../parts/RivalParts";
import { FLOOR, RivalStudio } from "../parts/RivalStudio";

const MOOD = "night" as const;
const SEAT_TOP = 760;
const S = 1.1;
const RIVAL_STOOL = 760;
const YOU_STOOL = 1160;
const CAM_X = 960;
const HOST_X = 1470;
const AUD = [3, 7, 2, 5, 11, 4, 6, 9, 1];
const WARM = "#ff7a1a";
const COOL = "#3d7bff";

type View = "open" | "screen" | "walk" | "two" | "laugh" | "host" | "zero" | "you" | "wrong" | "problem";

/** Where everyone stands at frame f: before the walk, standing apart; after it, on the stools. */
function blocking(f: number, B: number, R1: number) {
  const len = Math.max(30, Math.min(75, R1 - B - 20));
  const w = ramp(f, B + 5, B + 5 + len);
  const moving = Math.min(ramp(f, B + 3, B + 12), 1 - ramp(f, B + len - 2, B + len + 8));
  const sit = ramp(f, B + len, B + len + 18);
  const walk = (seed: number): Pose => lerpPose(STAND, walkPose(f * 0.38 + seed), moving);
  const seated = (seed: number) => lerpPose(walk(seed), SEATED, sit);
  return {
    rival: { x: mix(560, RIVAL_STOOL, w), y: mix(FLOOR, seatedY(SEAT_TOP, S), sit), pose: seated(0) },
    you: { x: mix(1390, YOU_STOOL, w), y: mix(FLOOR, seatedY(SEAT_TOP, S), sit), pose: seated(1.5) },
    cam: mix(830, CAM_X, w),
    host: { x: mix(2080, HOST_X, w), pose: lerpPose(STAND, walkPose(f * 0.38 + 3), Math.min(ramp(f, B, B + 8), 1 - ramp(f, B + len - 4, B + len + 6))) },
  };
}

const RivalBeat: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = shot.frame;
  const t63 = shot.end("Rival: A liar's nose") + 12;
  const A = shot.at("Nobody's nose");
  const cool = wordAt(shot, "Nobody's nose", "is a counter");
  const B = shot.at("The host puts you");
  const R1 = shot.at("Rival: I have never");
  const t64 = shot.end("Rival: I have never") + 10;
  const H = shot.at("Host: And how many");
  const Z = shot.at("Rival: Zero");
  const t65 = shot.end("Rival: Zero") + 10;
  const turn = t65 + 16;
  const L = shot.at("The audience laughs");
  const P = shot.at("Problem two");
  const view = current<View>(f, [[shot.from, "open"], [A, "screen"], [B, "walk"], [R1, "two"], [t64 - 2, "laugh"],
    [H, "host"], [Z, "zero"], [turn, "you"], [L, "wrong"], [P, "problem"]]);

  const at = blocking(f, B, R1);
  const swing = ramp(f, t64 + 8, t64 + 26);
  const aim = mix(1, -1, swing);
  const nose = interpolateColors(f, [cool, cool + 18], [WARM, COOL]);
  const show = aim > 0 ? { thermal: "you" as const, nose: f < A ? WARM : nose } : { thermal: "rival" as const, nose: "#ff6a00" };

  // the rival: pats his camera in the hold, chin up for the audience, too quick on "Zero."
  const pat = f >= t63 && f < t63 + 50 ? ramp(f, t63, t63 + 10) * (1 - ramp(f, t63 + 40, t63 + 50)) : 0;
  const rivalPose: Pose = f < B
    ? { ...at.rival.pose, armF: [mix(9, 78, pat) + Math.sin(f / 3) * 8 * pat, mix(10, 30, pat)] }
    : { ...at.rival.pose, tilt: f >= R1 && f < t64 + 30 ? -8 : 0, armF: f >= Z && f < t65 + 20 ? [120, -30] : at.rival.pose.armF };
  const rivalTalks = (f >= shot.at("Rival: A liar's nose") && f < shot.end("Rival: A liar's nose")) || (f >= R1 && f < t64 - 10) || (f >= Z && f < t65 - 10);
  const rivalFace: Partial<Face> = rivalTalks
    ? { brows: "raised", lids: 0.3, mouth: "open", eyes: 1, look: { x: 0.9, y: -0.2 } }
    : swing > 0.5 && f < H ? { brows: "worry", lids: 0, mouth: "flat", eyes: 1.15, look: { x: 0.8, y: -0.5 } }
      : { brows: "raised", lids: 0.4, mouth: "smirk", eyes: 1, look: { x: 0.8, y: 0 } };

  // you: watching him, then the host turns to you and nothing comes out
  const youFace: Partial<Face> = f >= L
    ? { brows: "sad", lids: 0.45, mouth: "frown", eyes: 1, look: { x: 0.5, y: 0.5 } }
    : f >= turn ? { brows: "worry", lids: 0, mouth: f < turn + 40 ? "o" : "flat", eyes: 1.2, look: { x: -0.7, y: -0.1 } }
      : f >= t64 ? { brows: "raised", lids: 0.3, mouth: "smirk", eyes: 1, look: { x: 1, y: 0 } }
        : { brows: "flat", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 1, y: -0.1 } };

  // the host: mic to her mouth for her question, then out to you
  const hostPose: Pose = { ...at.host.pose, armF: f >= turn ? [100, 12] : f >= H && f < Z ? [55, 105] : [90, 28] };
  const hostTalks = f >= H && f < shot.end("Host: And how many");
  const hostFace: Partial<Face> = hostTalks ? { brows: "raised", lids: 0, mouth: "open", eyes: 1, look: { x: 1, y: -0.2 } }
    : { brows: "raised", lids: 0.1, mouth: "smile", eyes: 1, look: { x: 1, y: f >= turn ? 0.1 : 0 } };

  const yourHead = headAt(at.you.x, at.you.y, S, at.you.pose, -1);
  const laugh = view === "laugh" || view === "wrong" ? 1 : 0;

  const cam = drift((() => {
    switch (view) {
      case "open": return camAt(f, [[shot.from, { x: 880, y: 560, zoom: 1.12 }], [A, { x: 800, y: 600, zoom: 1.3 }]]);
      case "screen": return camAt(f, [[A, { x: 960, y: 290, zoom: 1.95 }], [B, { x: 960, y: 296, zoom: 2.1 }]]);
      case "walk": return camAt(f, [[B, { x: 1020, y: 600, zoom: 1.06 }], [R1, { x: 960, y: 620, zoom: 1.18 }]]);
      case "two": return camAt(f, [[R1, { x: 960, y: 640, zoom: 1.38 }], [t64, { x: 960, y: 630, zoom: 1.5 }]]);
      case "laugh": return camAt(f, [[t64, { x: 960, y: 600, zoom: 1.0 }], [H, { x: 960, y: 600, zoom: 1.05 }]]);
      case "host": return camAt(f, [[H, { x: 1310, y: 640, zoom: 1.5 }], [Z, { x: 1320, y: 640, zoom: 1.58 }]]);
      case "zero": return camAt(f, [[Z, { x: 790, y: 600, zoom: 1.85 }], [turn, { x: 780, y: 595, zoom: 1.95 }]]);
      case "you": return camAt(f, [[turn, { x: 1250, y: 600, zoom: 1.75 }], [L, { x: 1240, y: 590, zoom: 1.95 }]]);
      case "wrong": return camAt(f, [[L, { x: 960, y: 600, zoom: 1.0 }], [P, { x: 1000, y: 610, zoom: 1.08 }]]);
      default: {
        // your head low and right, so the counters sit under the PROBLEM card (upper left)
        const z = mix(1.9, 2.2, ramp(f, P, shot.to));
        return { x: yourHead.x - 380 / z, y: yourHead.y - 160 / z, zoom: z };
      }
    }
  })(), f, "rival", 4);

  const actors = (
    <>
      <Stool x={RIVAL_STOOL} top={SEAT_TOP} floor={FLOOR} />
      <Stool x={YOU_STOOL} top={SEAT_TOP} floor={FLOOR} />
      <Person id="rival" who={RIVAL} x={at.rival.x} y={at.rival.y} scale={S} facing={1} pose={rivalPose} face={rivalFace} frame={f} seed={2}
        count={{ base: 62, ticks: [t63, t64, t65] }} sweat={swing > 0.5 && f < H ? 0.8 : 0} />
      <Person id="you" who={HERO} x={at.you.x} y={at.you.y} scale={S} facing={-1} pose={at.you.pose} face={youFace} frame={f} seed={1} count={null} />
      <ThermalCam x={at.cam} y={FLOOR} aim={aim} scale={0.78} />
      <Person id="host" who={HOST} x={at.host.x} y={FLOOR} scale={1.12} facing={-1} pose={hostPose} face={hostFace} frame={f} seed={4}
        count={{ base: 3 }} earpiece held={<Mic tilt={f >= H && f < Z ? -10 : -40} />} />
      {(view === "laugh" || view === "wrong" || view === "walk") && (
        <AudienceBacks from={120} to={1800} y={1075} n={9} frame={f} laugh={laugh} counts={AUD} seed={3} />
      )}
      <Bubble frame={f} at={shot.at("The host puts you", 0.5)} until={R1 + 24} x={yourHead.x + 10} y={yourHead.y - yourHead.r - 60} text="Say it out loud." size={40} />
      <Bubble frame={f} at={turn + 30} until={P} x={yourHead.x + 10} y={yourHead.y - yourHead.r - 60} text="I can't see mine." size={40} />
      {view === "problem" && (
        <rect x={yourHead.x - 62} y={yourHead.y - yourHead.r - 150} width={124} height={92} rx={22} fill="none" stroke={PAPER}
          strokeWidth={6} strokeDasharray="16 12" opacity={0.4 + 0.3 * Math.sin(f / 8)} />
      )}
    </>
  );
  return <RivalStudio cam={cam} mood={MOOD} frame={f} show={show} actors={actors} />;
};

/** Rival: the thermal camera, the nose that cools, the stools, 62 to 65, and the one number you can't see. */
export const rival: Beat = { id: "Rival", first: "Rival: A liar's nose", lead: 0.3, Component: RivalBeat };
