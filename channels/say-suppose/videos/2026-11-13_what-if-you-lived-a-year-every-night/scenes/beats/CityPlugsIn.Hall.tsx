// The City Plugs In, in the hotel: your boss sells every coil off the crate before dawn to a queue; the hall's hatches
// all flutter at once as the camera pulls back; then the hotel's tiers, a thousand hatches, their strips blurring
// until one last click, and the prisoner climbing out of a hatch grey-eyed.
import { LookContext } from "@whatif/kit/stage/Look";
import { drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { setLook } from "@whatif/kit/sets/common";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { CRIMSON, INK } from "@whatif/kit/theme";
import { Counter } from "../parts";
import { PodHallBack, podHallLights, PODHALL, POD_ONE } from "../sets/PodHall";
import { BOSS, camAt, linear, mix, noise, PASTELS, ramp } from "../shared";
import { aim, OwnSet, Person, type Body } from "./CityPlugsIn.Kit";

const FLOOR = 960;
const COIL = <g><circle r={20} fill="none" stroke={INK} strokeWidth={13} /><circle r={20} fill="none" stroke="#1D9A8F" strokeWidth={7} /></g>;

/** The night desk's front, redrawn over the boss so he stands behind it. */
const DeskFront: React.FC<{ coils: number }> = ({ coils }) => (
  <g>
    {Array.from({ length: coils }, (_, i) => (
      <g key={i} transform={`translate(${210 + (i % 3) * 50} ${680 - Math.floor(i / 3) * 24})`}>{COIL}</g>
    ))}
    <rect x={170} y={690} width={180} height={84} rx={6} fill="#b8895a" stroke={INK} strokeWidth={5} />
    <rect x={110} y={790} width={420} height={170} rx={10} fill="#5b4636" stroke={INK} strokeWidth={6} />
    <rect x={96} y={772} width={448} height={28} rx={8} fill="#7a5d47" stroke={INK} strokeWidth={6} />
  </g>
);

/** Before dawn: the boss hands coil after coil across the desk to a queue that never ends. */
export const SellShot: React.FC<{ frame: number; start: number; end: number }> = ({ frame, start, end }) => {
  const p = linear(frame, start, end);
  const sold = Math.floor(p * 7);
  const step = (p * 7) % 1;
  const cam: Camera = drift(camAt(frame, [[start, { x: 520, y: 640, zoom: 1.55 }], [end, { x: 560, y: 640, zoom: 1.7 }]]), frame, "cp-sell", 3);
  const boss: Body = { x: 300, y: FLOOR - 10, scale: 1.12, facing: 1, pose: STAND };
  const reachOut = Math.sin(Math.min(1, step * 2) * Math.PI);
  boss.pose = { ...STAND, lean: 6 * reachOut, armF: aim(boss, { x: mix(330, 520, reachOut), y: mix(760, 720, reachOut) }) };
  // the queue shuffles up one place every sale; the front one walks off with a coil
  const queue = [0, 1, 2, 3, 4].map((q) => {
    const x = 600 + q * 140 - step * 140 * (q > 0 ? 1 : 0);
    const leaving = q === 0 && step > 0.5;
    const body: Body = { x: leaving ? mix(600, 1300, (step - 0.5) * 2) : x, y: FLOOR, scale: 1.0, facing: leaving ? 1 : -1,
      pose: leaving || (q > 0 && step < 0.6) ? walkPose(frame * 0.4 + q) : STAND };
    return { body, held: leaving ? COIL : undefined, id: sold + q };
  });
  return (
    <LookContext.Provider value={setLook(podHallLights(), "night", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<PodHallBack cam={cam} frame={frame} />}
        actors={
          <>
            <Person body={boss} frame={frame} seed={1} who={{ ...BOSS, mouth: "smirk", brows: "raised", lids: 0.1, look: { x: 1, y: 0.2 } }} />
            <DeskFront coils={Math.max(0, 6 - sold)} />
            {queue.map((q, i) => (
              <Person key={q.id} body={q.body} frame={frame} seed={q.id} who={{ head: PASTELS[q.id % PASTELS.length], coat: "#3f4a5c", mouth: i === 0 ? "smile" : "flat", look: { x: 1, y: 0 }, held: q.held }} />
            ))}
          </>
        } />
    </LookContext.Provider>
  );
};

/** Every hatch in the hall flutters at once while the camera pulls back from pod one to the whole hall. */
export const FlutterShot: React.FC<{ frame: number; start: number; end: number }> = ({ frame, start, end }) => {
  const cam: Camera = drift(camAt(frame, [[start, PODHALL.cameras.podOne], [end, { x: 960, y: 520, zoom: 0.96 }]]), frame, "cp-fl", 3);
  return (
    <LookContext.Provider value={setLook(podHallLights(), "night", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<PodHallBack cam={cam} frame={frame} flutterAll counter={{ at: start }} />} actors={<></>} />
    </LookContext.Provider>
  );
};

const COLS = 34;
const ROWS = 15;
const PW = 110;
const PH = 80;

/** The hotel's tiers: a thousand hatches on one wall, every strip blurring, the one in the middle the big counter.
 *  The strips stop on the click at `stop`. */
export const ThousandShot: React.FC<{ frame: number; start: number; stop: number; end: number }> = ({ frame, start, stop, end }) => {
  const cam: Camera = drift(camAt(frame, [[start, { x: 960, y: 540, zoom: 2.4 }], [end, { x: 960, y: 560, zoom: 0.55 }]]), frame, "cp-th", 2);
  const x0 = 960 - (COLS * PW) / 2;
  const y0 = 540 - (ROWS * PH) / 2;
  const frames: string[] = [];
  const lamps: string[] = [];
  const tiles: string[] = [];
  const marks: string[] = [];
  const still = frame >= stop;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (r === 7 && c === 17) continue;
      const x = x0 + c * PW, y = y0 + r * PH;
      frames.push(`M${x + 8} ${y + 22}h${PW - 16}v${PH - 26}h${-(PW - 16)}Z`);
      lamps.push(`M${x + PW / 2 + 12} ${y + 50}a12 12 0 1 0 -24 0a12 12 0 1 0 24 0Z`);
      for (let t = 0; t < 3; t++) {
        const tx = x + PW / 2 - 24 + t * 16;
        tiles.push(`M${tx} ${y + 4}h14v14h-14Z`);
        const v = still ? [3, 6, 5][t] : Math.floor(noise(frame * 3 + r * 40 + c + t * 7) * 9);
        marks.push(`M${tx + 3} ${y + 6 + (v % 3) * 3}h8v2h-8Z`);
      }
    }
  }
  const cx = x0 + 17 * PW + PW / 2, cy = y0 + 7 * PH + PH / 2;
  return (
    <OwnSet mood="night" cam={cam} back={<rect x={-3000} y={-2000} width={8000} height={5000} fill="#151a2a" />}>
      <path d={frames.join("")} fill="#262d45" stroke={INK} strokeWidth={4} />
      <path d={lamps.join("")} fill="#ffc46b" opacity={0.85} />
      <path d={tiles.join("")} fill={CRIMSON} />
      <path d={marks.join("")} fill="#f3e9d7" />
      <rect x={cx - PW / 2 + 8} y={cy - PH / 2 + 22} width={PW - 16} height={PH - 26} fill="#262d45" stroke={INK} strokeWidth={4} />
      <Counter frame={frame} x={cx} y={cy - 4} tile={22} at={stop - 36} />
    </OwnSet>
  );
};

/** Three nights served: he climbs out of a hatch, grey-eyed, and bows to the court. */
export const ReleaseShot: React.FC<{ frame: number; start: number; bow: number; end: number }> = ({ frame, start, bow, end }) => {
  const cam: Camera = drift(camAt(frame, [[start, { x: 640, y: 700, zoom: 1.7 }], [end, { x: 660, y: 700, zoom: 1.9 }]]), frame, "cp-rel", 3);
  const out = ramp(frame, start + 4, start + 26);
  const b = ramp(frame, bow, bow + 12);
  const body: Body = { x: mix(POD_ONE.x + 140, 760, out), y: FLOOR, scale: 1.1, facing: 1, pose: out < 1 ? walkPose(frame * 0.25) : { ...STAND, lean: 34 * b, armF: [10, 20], armB: [-10, 20] } };
  return (
    <LookContext.Provider value={setLook(podHallLights(), "night", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<PodHallBack cam={cam} frame={frame} door={1} counter={{ value: "365" }} />}
        actors={<Person body={body} frame={frame} seed={9} temples who={{ head: PASTELS[1], coat: "#8a8a8a", lids: 0.62, brows: "flat", mouth: b > 0 ? "smile" : "flat", look: { x: 1, y: 0.3 } }} />} />
    </LookContext.Provider>
  );
};
