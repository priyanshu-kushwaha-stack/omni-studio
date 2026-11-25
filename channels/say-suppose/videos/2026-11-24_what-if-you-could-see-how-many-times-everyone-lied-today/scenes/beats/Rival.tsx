// The Rival [04:55] (look C, tv-night plate): the evening studio. The rival, sage head, white coat, beside his thermal
// camera, a 62 over him and your face in heat colours on his monitor; over your shoulder he tells you about noses, close
// on him as he clicks to 63 and pats the camera, close on you. The monitor fills the frame on "Nobody's nose is a
// counter": the nose warms, then cools. The host walks you both to the two painted stools with the camera between you
// ("Say it out loud."); close on him: he has never lied, 64; the audience laughs from the dark, his camera swings round
// and his own nose glows orange on the monitor; close on the host's question, on his "Zero.", 65; close on you: nothing
// comes out ("I can't see mine."); over the audience's laughing heads to you; problem two: a slow push on the empty
// place over your head.
import { interpolateColors } from "remotion";
import { lerpPose, SEATED, seatedY, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { PAPER } from "@whatif/kit/theme";
import { camAt, current, HERO, mix, ramp, type Beat, type Shot } from "../shared";
import { Bubble, headAt, HOST, Mic, Person, RIVAL, ThermalCam, wordAt, type Face } from "../parts/RivalParts";
import { FLOOR, MONITOR, RivalStudio, S, SEAT_TOP, STOOL } from "../parts/RivalStudio";
import { clickFrames, counterLight, CrowdBacks, OverShoulder } from "../parts/Rival.Shots";

const MOOD = "night" as const;
const HOST_X = 1590;
const WARM = "#ff7a1a";
const COOL = "#3d7bff";
const SIZE = 36 * S;
const AUDIENCE = ["#4a5874", "#5c4d6e", "#4b6a5a", "#6e5050", "#6a6040", "#55667a"];

type View = "open" | "ots" | "pat" | "you63" | "screen" | "walk" | "two" | "laugh" | "smirk" | "host" | "zero" | "you" | "wrong" | "problem";

function cues(shot: Shot) {
  const [t63] = clickFrames(shot, "Rival: A liar's nose");
  const [t64] = clickFrames(shot, "Rival: I have never");
  const [t65] = clickFrames(shot, "Rival: Zero");
  const A = shot.at("Nobody's nose");
  const R1 = shot.at("Rival: I have never");
  const H = shot.at("Host: And how many");
  return {
    t63, t64, t65, A, R1, H, turn: t65 + 16, cool: wordAt(shot, "Nobody's nose", "is a counter"), B: shot.at("The host puts you"),
    Z: shot.at("Rival: Zero"), L: shot.at("The audience laughs"), P: shot.at("Problem two"),
    talk: shot.at("Rival: A liar's nose"), talkE: shot.end("Rival: A liar's nose"), hostE: shot.end("Host: And how many"),
  };
}
type K = ReturnType<typeof cues>;

const view = (f: number, shot: Shot, k: K) => current<View>(f, [[shot.from, "open"], [k.talk + 50, "ots"], [k.t63 - 56, "pat"],
  [k.t63 + 22, "you63"], [k.A, "screen"], [k.B, "walk"], [k.R1, "two"], [k.t64 + 8, "laugh"], [k.t64 + 34, "smirk"], [k.H, "host"],
  [k.Z, "zero"], [k.turn, "you"], [k.L, "wrong"], [k.P, "problem"]]);

/** Where everyone is at frame f: before the walk, standing apart; after it, on the stools. */
function blocking(f: number, B: number, R1: number) {
  const len = Math.max(30, Math.min(75, R1 - B - 20));
  const w = ramp(f, B + 5, B + 5 + len);
  const moving = Math.min(ramp(f, B + 3, B + 12), 1 - ramp(f, B + len - 2, B + len + 8));
  const sit = ramp(f, B + len, B + len + 18);
  const walk = (seed: number): Pose => lerpPose(STAND, walkPose(f * 0.38 + seed), moving);
  const seated = (seed: number) => lerpPose(walk(seed), SEATED, sit);
  const seatY = seatedY(SEAT_TOP, S);
  return {
    rival: { x: mix(560, STOOL.left, w), y: mix(FLOOR, seatY, sit), pose: seated(0) },
    you: { x: mix(1390, STOOL.right, w), y: mix(FLOOR, seatY, sit), pose: seated(1.5) },
    cam: mix(800, 967, w),
    host: { x: mix(2300, HOST_X, w), pose: lerpPose(STAND, walkPose(f * 0.38 + 3), Math.min(ramp(f, B, B + 8), 1 - ramp(f, B + len - 4, B + len + 6))) },
  };
}

function rivalLook(f: number, k: K, at: ReturnType<typeof blocking>, swing: number) {
  const pat = f >= k.t63 && f < k.t63 + 50 ? ramp(f, k.t63, k.t63 + 10) * (1 - ramp(f, k.t63 + 40, k.t63 + 50)) : 0;
  const pose: Pose = f < k.B
    ? { ...at.rival.pose, armF: [mix(9, 82, pat) + Math.sin(f / 3) * 8 * pat, mix(10, 24, pat)] }
    : { ...at.rival.pose, tilt: f >= k.R1 && f < k.t64 + 30 ? -8 : 0, armF: f >= k.Z && f < k.t65 + 20 ? [120, -30] : at.rival.pose.armF };
  const talks = (f >= k.talk && f < k.talkE) || (f >= k.R1 && f < k.t64 - 10) || (f >= k.Z && f < k.t65 - 10);
  const face: Partial<Face> = talks
    ? { brows: "raised", lids: 0.3, mouth: "open", eyes: 1, look: { x: 0.9, y: -0.2 } }
    : swing > 0.5 && f < k.H ? { brows: "worry", lids: 0, mouth: "flat", eyes: 1.15, look: { x: 0.8, y: -0.5 } }
      : { brows: "raised", lids: 0.4, mouth: "smirk", eyes: 1, look: { x: 0.8, y: 0 } };
  return { pose, face };
}

function youFace(f: number, k: K): Partial<Face> {
  if (f >= k.L) return { brows: "sad", lids: 0.45, mouth: "frown", eyes: 1, look: { x: 0.5, y: 0.5 } };
  if (f >= k.turn) return { brows: "worry", lids: 0, mouth: f < k.turn + 40 ? "o" : "flat", eyes: 1.2, look: { x: -0.7, y: -0.1 } };
  if (f >= k.t64) return { brows: "raised", lids: 0.3, mouth: "smirk", eyes: 1, look: { x: 1, y: 0 } };
  if (f >= k.t63 && f < k.A) return { brows: "raised", lids: 0.1, mouth: "flat", eyes: 1.1, look: { x: 1, y: -0.4 } };
  return { brows: "flat", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 1, y: -0.1 } };
}

type H = { x: number; y: number; r: number };
/** The camera for each framing: MCUs keep the counter in, close-ups of you fill the frame with your head. */
function camera(v: View, f: number, k: K, shot: Shot, h: { rival: H; you: H; host: H }): Camera {
  const mcu = (p: H, z0: number, z1: number, from: number, to: number, dx = 0): Camera =>
    camAt(f, [[from, { x: p.x + dx, y: p.y - 0.55 * p.r, zoom: z0 }], [to, { x: p.x + dx, y: p.y - 0.6 * p.r, zoom: z1 }]]);
  const cu = (p: H, z0: number, z1: number, from: number, to: number, dx = 0): Camera =>
    camAt(f, [[from, { x: p.x + dx, y: p.y + 0.25 * p.r, zoom: z0 }], [to, { x: p.x + dx, y: p.y + 0.2 * p.r, zoom: z1 }]]);
  switch (v) {
    case "open": return camAt(f, [[shot.from, { x: 900, y: 600, zoom: 1.02 }], [k.talk + 50, { x: 860, y: 610, zoom: 1.1 }]]);
    case "ots": return camAt(f, [[k.talk + 50, { x: h.rival.x + 260, y: h.rival.y + 60, zoom: 1.75 }], [k.t63 - 56, { x: h.rival.x + 250, y: h.rival.y + 50, zoom: 1.85 }]]);
    case "pat": return mcu(h.rival, 2.1, 2.25, k.t63 - 56, k.t63 + 22, 90);
    case "you63": return cu(h.you, 2.9, 3.05, k.t63 + 22, k.A);
    case "screen": return camAt(f, [[k.A, { x: MONITOR.x + MONITOR.w / 2, y: MONITOR.y + MONITOR.h / 2, zoom: 4.6 }], [k.B, { x: MONITOR.x + MONITOR.w / 2, y: MONITOR.y + MONITOR.h / 2, zoom: 4.9 }]]);
    case "walk": return camAt(f, [[k.B, { x: 1060, y: 640, zoom: 1.08 }], [k.R1, { x: 990, y: 640, zoom: 1.22 }]]);
    case "two": return mcu(h.rival, 2.2, 2.4, k.R1, k.t64 + 8, 60);
    case "laugh": return camAt(f, [[k.t64 + 8, { x: 900, y: 600, zoom: 1.12 }], [k.t64 + 34, { x: 880, y: 600, zoom: 1.16 }]]);
    case "smirk": return cu(h.you, 2.8, 2.95, k.t64 + 34, k.H);
    case "host": return mcu(h.host, 2.1, 2.25, k.H, k.Z, -60);
    case "zero": return mcu(h.rival, 2.4, 2.55, k.Z, k.turn, 60);
    case "you": return cu(h.you, 2.7, 3.0, k.turn, k.L);
    case "wrong": return camAt(f, [[k.L, { x: h.you.x - 120, y: h.you.y + 120, zoom: 1.6 }], [k.P, { x: h.you.x - 110, y: h.you.y + 110, zoom: 1.7 }]]);
    default: {
      // your head low and right, so the empty place over it sits clear of the PROBLEM card (upper left)
      const z = mix(2.0, 2.3, ramp(f, k.P, shot.to));
      return { x: h.you.x - 250 / z, y: h.you.y - 110, zoom: z };
    }
  }
}

const RivalBeat: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = shot.frame;
  const k = cues(shot);
  const v = view(f, shot, k);
  const at = blocking(f, k.B, k.R1);
  const swing = ramp(f, k.t64 + 8, k.t64 + 26);
  const aim = mix(1, -1, swing);
  const nose = interpolateColors(f, [k.cool, k.cool + 18], [WARM, COOL]);
  const show = aim > 0 ? { thermal: "you" as const, nose: f < k.A ? WARM : nose } : { thermal: "rival" as const, nose: "#ff6a00" };
  const rival = rivalLook(f, k, at, swing);
  const hostPose: Pose = { ...at.host.pose, armF: f >= k.turn ? [100, 12] : f >= k.H && f < k.Z ? [55, 105] : [90, 28] };
  const hostTalks = f >= k.H && f < k.hostE;
  const hostFace: Partial<Face> = hostTalks ? { brows: "raised", lids: 0, mouth: "open", eyes: 1, look: { x: 1, y: -0.2 } }
    : { brows: "raised", lids: 0.1, mouth: "smile", eyes: 1, look: { x: 1, y: f >= k.turn ? 0.1 : 0 } };
  const h = {
    rival: headAt(at.rival.x, at.rival.y, S, rival.pose, 1), you: headAt(at.you.x, at.you.y, S, at.you.pose, -1),
    host: headAt(at.host.x, FLOOR, S, hostPose, -1),
  };
  const cam = drift(camera(v, f, k, shot, h), f, "rival", 5);
  const bubble = 40 / cam.zoom;
  const lights = [counterLight(h.rival.x, h.rival.y - h.rival.r - SIZE * 0.95, 360, 0.3), counterLight(h.host.x, h.host.y - h.host.r - SIZE * 0.95, 260, 0.18)];
  const actors = (
    <>
      <ThermalCam x={at.cam} y={FLOOR - 40} aim={aim} scale={0.95} />
      <Person id="rival" who={RIVAL} x={at.rival.x} y={at.rival.y} scale={S} facing={1} pose={rival.pose} face={rival.face} frame={f} seed={2}
        count={{ base: 62, ticks: [k.t63, k.t64, k.t65], size: SIZE }} sweat={swing > 0.5 && f < k.H ? 0.8 : 0} />
      {v !== "ots" && <Person id="you" who={HERO} x={at.you.x} y={at.you.y} scale={S} facing={-1} pose={at.you.pose} face={youFace(f, k)} frame={f} seed={1} count={null} />}
      <Person id="host" who={HOST} x={at.host.x} y={FLOOR} scale={S} facing={-1} pose={hostPose} face={hostFace} frame={f} seed={4}
        count={{ base: 3, size: SIZE * 0.9 }} earpiece held={<Mic tilt={f >= k.H && f < k.Z ? -10 : -40} />} />
      <Bubble frame={f} at={shot.at("The host puts you", 0.5)} until={k.R1 + 24} x={h.you.x + 10} y={h.you.y - h.you.r - 20} text="Say it out loud." size={bubble} />
      <Bubble frame={f} at={k.turn + 30} until={k.P} x={h.you.x + 10} y={h.you.y - h.you.r - 20} text="I can't see mine." size={bubble} />
      {v === "problem" && (
        <rect x={h.you.x - 70} y={h.you.y - h.you.r - 150} width={140} height={104} rx={24} fill="none" stroke={PAPER}
          strokeWidth={6} strokeDasharray="16 12" opacity={0.4 + 0.3 * Math.sin(f / 8)} />
      )}
    </>
  );
  const over = (
    <>
      {v === "ots" && <OverShoulder who={{ ...HERO, coat: "#3b4252" }} x={1560} y={840} r={250} lit={0.5} />}
      {(v === "laugh" || v === "wrong") && <CrowdBacks frame={f} laugh={1} heads={AUDIENCE} r={v === "wrong" ? 150 : 110} y={v === "wrong" ? 1010 : 1040} />}
    </>
  );
  return <RivalStudio cam={cam} mood={MOOD} frame={f} show={show} actors={actors} lights={lights} over={over} />;
};

/** Rival: the thermal camera, the nose that cools, the stools, 62 to 65, and the one number you can't see. */
export const rival: Beat = { id: "Rival", first: "Rival: A liar's nose", lead: 0.3, Component: RivalBeat };
