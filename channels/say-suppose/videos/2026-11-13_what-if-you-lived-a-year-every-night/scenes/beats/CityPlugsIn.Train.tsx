// The silent morning train (the picture only this premise can show): the library metro coach in the morning, every
// seat full, every face lids-heavy, nobody talking, the carriage swaying. On one bench the couple: she stares at the
// floor, jaw set; he looks out of the window, calm. The old sleeper on the end seat under the hotel's price board; the
// stranger standing at the far end, the one face not yawning. A wordless hold; then the inside town filling up.
import { seatedY, SEATED, STAND } from "@whatif/kit/rig/pose";
import { metroCoach } from "@whatif/kit/sets/MetroCoach";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON } from "@whatif/kit/theme";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { Stage } from "@whatif/kit/stage/Stage";
import { TownBack, townLights } from "../sets/InsideTown";
import { camAt, mix, OLD, PASTELS, ramp, STRANGER } from "../shared";
import { aim, head, InkBars, InSet, Person, type Body } from "./CityPlugsIn.Kit";
import { Crowd } from "./NightThirty.Parts";

const SEAT_TOP = 860;
const SY = seatedY(SEAT_TOP, 1.05);
/** The riders along the bench (x, facing), the couple at ANGRY and CALM, the old sleeper at the end. */
const RIDERS: [number, 1 | -1][] = [[250, 1], [390, -1], [530, 1], [1080, -1], [1220, 1], [1380, -1]];
const ANGRY = 690;
const CALM = 830;
const OLD_X = 1660;
const STRANGER_X = 1850;
const COATS = ["#3f4a5c", "#5c3f4a", "#4a5c3f", "#3b3e47", "#6a5a4c", "#2f4a5a"];

/** The hotel's price board as a bench poster over the old sleeper: a crimson strip of tiles, ink bars, no words. */
const PriceBoard: React.FC = () => (
  <g>
    <rect x={OLD_X - 150} y={170} width={300} height={110} rx={8} fill="#2b2f3d" stroke="#5c6675" strokeWidth={6} />
    {[0, 1, 2].map((i) => <rect key={i} x={OLD_X - 130 + i * 40} y={190} width={32} height={42} rx={4} fill={CRIMSON} stroke="#f3e9d7" strokeWidth={2} />)}
    <InkBars x={OLD_X + 10} y={196} w={110} n={3} gap={18} thick={8} color="#f3e9d7" />
  </g>
);

export interface TrainTimes { start: number; couple: number; angry: number; calm: number; hold: number; town: number; fill: number; end: number }

export const TrainShot: React.FC<{ frame: number; k: TrainTimes }> = ({ frame, k }) => {
  const sway = Math.sin(frame / 11);
  const lean = (base: number) => base + sway * 2.5;
  const holdT = ramp(frame, k.hold, k.town);
  const riders: Body[] = RIDERS.map(([x, f]) => ({ x, y: SY, scale: 1.05, facing: f, pose: { ...SEATED, lean: lean(-4), tilt: 10 * f } }));
  const angry: Body = { x: ANGRY, y: SY, scale: 1.05, facing: 1, pose: { ...SEATED, lean: lean(10), tilt: 6 } };
  const calm: Body = { x: CALM, y: SY, scale: 1.05, facing: 1, pose: { ...SEATED, lean: lean(-6), tilt: -8 } };
  // their hands on the bench, an inch apart, neither moving
  angry.pose = { ...angry.pose, armB: aim(angry, { x: ANGRY + 36, y: SEAT_TOP - 6 }) };
  calm.pose = { ...calm.pose, armB: aim(calm, { x: CALM - 52, y: SEAT_TOP - 6 }) };
  const old: Body = { x: OLD_X, y: SY, scale: 1.05, facing: -1, pose: { ...SEATED, lean: lean(-8), armF: [24, 70], armB: [20, 74] } };
  const stranger: Body = { x: STRANGER_X, y: 980, scale: 1.12, facing: -1, pose: { ...STAND, lean: sway * 1.5, armF: [30, 70] } };
  const ah = head(angry), ch = head(calm);
  const wide: Camera = { x: 960 + sway * 5, y: 560, zoom: 1.0 };
  const cam: Camera = frame >= k.hold
    ? camAt(frame, [[k.hold, { x: 1000, y: 580, zoom: 1.04 }], [k.town, { x: 1020, y: 600, zoom: 1.14 }], [k.fill, { x: 980, y: 560, zoom: 0.98 }]])
    : frame >= k.calm
      ? camAt(frame, [[k.calm, closeUp(ch.x + 10, ch.y, 2.6)], [k.hold, closeUp(ch.x + 10, ch.y, 2.8)]])
      : frame >= k.angry
        ? camAt(frame, [[k.angry, closeUp(ah.x + 20, ah.y, 2.6)], [k.calm, closeUp(ah.x + 20, ah.y, 2.8)]])
        : frame >= k.couple
          ? camAt(frame, [[k.couple, { x: 760, y: 700, zoom: 1.8 }], [k.angry, { x: 760, y: 720, zoom: 2.0 }]])
          : camAt(frame, [[k.start, wide], [k.couple, { ...wide, zoom: 1.06 }]]);
  return (
    <InSet set={metroCoach} mood="morning" frame={frame} cam={drift({ ...cam, x: cam.x + sway * 3 }, frame, "cp-train", 2)} options={{ speed: 7, ads: ["#1d9a8f", "#d8344f"] }}
      behind={<PriceBoard />}>
      {riders.map((b, i) => (
        <Person key={i} body={b} frame={frame} seed={i + 11} who={{ head: PASTELS[(i * 3 + 1) % PASTELS.length], coat: COATS[i % COATS.length], lids: 0.62 + (i % 3) * 0.08, mouth: "flat", look: { x: 0.3, y: 0.5 } }} />
      ))}
      <Person body={angry} frame={frame} seed={21} who={{ head: PASTELS[3], coat: "#5c3f4a", brows: "angry", lids: 0.3, mouth: "frown", look: { x: 0.6, y: 1 } }} />
      <Person body={calm} frame={frame} seed={22} who={{ head: PASTELS[0], coat: "#3f4a5c", brows: "none", lids: 0.6, mouth: "smile", look: { x: -0.7, y: -0.6 } }} />
      <Person body={old} frame={frame} seed={23} who={{ ...OLD, lids: mix(0.82, 0.92, ramp(frame, k.hold + 30, k.hold + 44)), mouth: "flat", look: { x: 0.3, y: 0.4 } }} />
      <Person body={stranger} frame={frame} seed={24} who={{ head: STRANGER.head, coat: STRANGER.coat, lids: 0, mouth: "flat", eyes: 1.05, look: { x: 1, y: 0.25 + holdT * 0.1 } }} />
    </InSet>
  );
};

/** Inside is filling up: the town's street, more people arriving every few frames. */
export const FillingShot: React.FC<{ frame: number; k: TrainTimes }> = ({ frame, k }) => {
  const n = 4 + Math.floor(ramp(frame, k.fill, k.end) * 18);
  const cam: Camera = drift(camAt(frame, [[k.fill, { x: 960, y: 620, zoom: 1.35 }], [k.end, { x: 960, y: 560, zoom: 0.98 }]]), frame, "cp-fill", 3);
  return (
    <LookContext.Provider value={setLook(townLights(), "morning", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<TownBack cam={cam} frame={frame} />}
        actors={<Crowd frame={frame} n={n} rows={3} speed={1.2} seed={9} />} />
    </LookContext.Provider>
  );
};

