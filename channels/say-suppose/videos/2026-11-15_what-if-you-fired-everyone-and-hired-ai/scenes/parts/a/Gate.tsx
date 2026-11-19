// Part A's plant-gate scenes, on part B's plant-gate set (parts/b/sets.tsx, reused as it is): Marco in brand-new
// overalls asking the boss for work; one week later, the hard hat in his hands, a steel worker walking in past him and
// the boss not meeting his eye; then Marco walking off as the gate shuts. No AI images.
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import type { Camera } from "@whatif/kit/stage/Stage";
import { BOSS, MARCO_OVERALLS } from "../Cast";
import { on, Place, steelOn } from "../Places";
import { SmallAppPhone } from "../Props";
import { ease, ramp, type ShotTime } from "../util";
import { gateWalk, plantGate } from "../b/sets";
import { Clipboard, HatInHand } from "./Bits";

const GATE_CAM: Camera = { x: 1000, y: 680, zoom: 1.2 };
const MARCO_BARE = { ...MARCO_OVERALLS, wear: [] };

/** "You hiring?" / "Night shift. Somebody has to watch the machines.": Marco at the gate, grinning, the boss with his
 *  clipboard; `speaker` gets the push and the gesture. */
export const GateHire: React.FC<{ t: ShotTime; speaker: "marco" | "boss" }> = ({ t, speaker }) => {
  const f = t.f;
  const marco = speaker === "marco";
  // the wave is the back arm, drawn behind the head, so it never crosses his face
  const wave = marco ? { ...STAND, armB: [-155 + Math.sin(f * 0.5) * 14, -20] as [number, number] } : { ...STAND, tilt: Math.sin(f * 0.4) * 4 };
  return (
    <Place t={t} set={plantGate} mood="morning" cam={GATE_CAM} options={{ gate: 0.5 }} push={[1, 1.05]} pushAt={marco ? { x: 430, y: 520 } : { x: 1500, y: 520 }}
      cast={[
        on("near", MARCO_OVERALLS, "happy", { pose: wave, look: { x: 0.9, y: -0.1 } }),
        on("right", BOSS, marco ? "sceptical" : "happy", {
          held: <Clipboard s={1.1} />, pose: marco ? { ...STAND, armF: [60, 60] } : { ...STAND, armF: [60, 60], armB: [-120, -10] }, look: { x: 0.9, y: 0 },
        }),
      ]} />
  );
};

/** One week later: the hard hat in Marco's hands, a steel worker walking in past him on a chirp, the boss turned away.
 *  "What happened to watching?" (`speaker` marco) / "I typed WATCHER." (the boss, eyes on his phone). */
export const GateWeekLater: React.FC<{ t: ShotTime; speaker: "marco" | "boss" }> = ({ t, speaker }) => {
  const f = t.f;
  const marco = speaker === "marco";
  const w = gateWalk(Math.min(1, f / 50));
  return (
    <Place t={t} set={plantGate} mood="morning" cam={GATE_CAM} options={{ gate: 1 }} push={[1, 1.05]} pushAt={marco ? { x: 430, y: 520 } : { x: 1500, y: 520 }}
      cast={[
        on("near", MARCO_BARE, marco ? "worried" : "sad", { held: <HatInHand hard s={1.1} />, pose: marco ? { ...STAND, armF: [92, -10] } : { ...STAND, armF: [50, 50] }, look: { x: 0.9, y: 0 } }),
        on("right", BOSS, marco ? "neutral" : "sceptical", { facing: 1, held: marco ? <Clipboard s={1.1} /> : <SmallAppPhone s={1.6} />, pose: { ...STAND, armF: [60, 70] }, look: { x: 0.5, y: 0.7 } }),
      ]}
      steel={w.gone || !marco ? [] : [steelOn("gate", { pose: walkPose(f * 0.3), facing: -1, dx: w.dx, dy: w.dy, scale: w.scale })]} />
  );
};

/** Marco walks off along the pavement, hard hat in hand; two more machines walk in and the gate shuts behind them. */
export const GateWalkOff: React.FC<{ t: ShotTime }> = ({ t }) => {
  const f = t.f;
  return (
    <Place t={t} set={plantGate} mood="morning" cam="wide" options={{ gate: 1 - ease(ramp(f, 30, 60)) }} push={[1, 1.04]}
      cast={[on("near", MARCO_BARE, "sad", { dx: -f * 5, facing: -1, held: <HatInHand hard s={1.1} />, pose: walkPose(f * 0.22) })]}
      steel={[0, 1].map((i) => {
        const w = gateWalk(Math.min(1, Math.max(0, (f - i * 14) / 40)));
        return w.gone ? null : steelOn("gate", { pose: walkPose(f * 0.3 + i), facing: -1, dx: w.dx, dy: w.dy, scale: w.scale });
      }).filter((m): m is NonNullable<typeof m> => m !== null)}
    />
  );
};

/** The gate's camera, for a phone insert's backdrop. */
export const GateBg: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={plantGate} mood="morning" cam={GATE_CAM} options={{ gate: 1 }} dim={0.45} push={[1.02, 1.05]} />
);
