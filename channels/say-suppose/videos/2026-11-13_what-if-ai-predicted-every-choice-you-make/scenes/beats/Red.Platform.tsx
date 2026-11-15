// The metro platform at dusk (Red, lines 71-73), on the library's metroPlatform set with no train: your best friend at
// the left end under a pale crimson card; the pickpocket, teal, sitting at the left end of a long bench. The commuters
// standing near your friend sidestep his card so far that they all end up squeezed onto the bench beside the
// pickpocket, who looks delighted and pats the seat ("Plenty of room, everyone.").
import { Figure } from "@whatif/kit/rig/Figure";
import { lerpPose, SEATED, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { metroPlatform } from "@whatif/kit/sets/MetroPlatform";
import { seatedY, setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { headAt } from "../kit";
import { Tag, type TagKey } from "../device";
import { blinking, FRIEND, mix, PASTELS, PICKPOCKET, ramp } from "../shared";
import type { Face } from "./SixtyPerCent.Parts";

export const PLAT = { floor: 960, scale: 1.1, friend: 300, pickpocket: 1330, benchTop: 836, bench: { from: 1270, to: 1890 } } as const;

/** The commuters: where they stand at first (near him), and the seat they squeeze into. */
const COMMUTERS = [
  { stand: 560, seat: 1430, coat: "#5a6488" },
  { stand: 660, seat: 1515, coat: "#7a3b46" },
  { stand: 760, seat: 1600, coat: "#2f5f63" },
  { stand: 850, seat: 1685, coat: "#6b5a33" },
  { stand: 940, seat: 1770, coat: "#3d4a78" },
];

export interface PlatformProps {
  frame: number;
  cam: Camera;
  friendTag: TagKey[];
  pickTag: TagKey[];
  friendFace: Face;
  friendPose?: Pose;
  /** The sidestep starts (frame); they walk to the bench and sit over about 50 frames, staggered. */
  squeeze: number;
  /** The pickpocket's face and the frames he talks (line 72). */
  pickFace: Face;
  /** 0..1: his hand patting the seat beside him. */
  pat?: number;
}

export const PlatformShot: React.FC<PlatformProps> = ({ frame, cam, friendTag, pickTag, friendFace, friendPose = STAND, squeeze, pickFace, pat = 0 }) => {
  const s = PLAT.scale;
  const sy = seatedY(PLAT.benchTop, s);
  const fh = headAt(PLAT.friend, PLAT.floor, s, friendPose, 1);
  const pPose: Pose = { ...SEATED, armF: [30 + pat * 40 + Math.abs(Math.sin(frame / 4)) * 14 * pat, 40] };
  const ph = headAt(PLAT.pickpocket, sy, s, pPose, 1);
  const options = { train: null, doorOpen: 0, crowd: true };
  const actors = (
    <g>
      {/* the long bench */}
      <rect x={PLAT.bench.from} y={PLAT.benchTop - 6} width={PLAT.bench.to - PLAT.bench.from} height={20} rx={6} fill="#6b6f7a" stroke={INK} strokeWidth={5} />
      {[PLAT.bench.from + 40, PLAT.bench.to - 40].map((x) => <rect key={x} x={x - 8} y={PLAT.benchTop + 14} width={16} height={PLAT.floor - PLAT.benchTop - 14} fill="#4a4d5a" />)}
      {COMMUTERS.map((c, i) => {
        const go = ramp(frame, squeeze + i * 5, squeeze + 36 + i * 5);
        const sit = ramp(frame, squeeze + 36 + i * 5, squeeze + 48 + i * 5);
        const x = mix(c.stand, c.seat, go);
        const walking = go > 0 && go < 1;
        // Before they go: glancing at his card. Walking: eyes on it over the shoulder. Seated: squeezed, eyes front.
        const pose: Pose = walking ? walkPose((frame - squeeze) * 0.22 + i) : sit > 0 ? lerpPose(STAND, SEATED, sit) : STAND;
        const y = sit > 0 ? mix(PLAT.floor, sy, sit) : PLAT.floor;
        const look = go === 0 ? { x: -0.9, y: -0.4 } : walking ? { x: -0.8, y: -0.3 } : { x: 0.3, y: 0.1 };
        return (
          <Figure key={i} x={x} y={y} scale={s} facing={walking || go === 0 ? (go === 0 ? -1 : 1) : 1} pose={pose} head={PASTELS[(i * 3 + 1) % PASTELS.length]}
            coat={c.coat} mouth="flat" brows={go === 0 ? "raised" : "flat"} lids={0.2} look={look} blink={blinking(frame, 10 + i)} time={frame} />
        );
      })}
      <Figure x={PLAT.pickpocket} y={sy} scale={s} facing={1} pose={pPose} head={PICKPOCKET.head} coat={PICKPOCKET.coat}
        mouth="flat" {...pickFace} blink={blinking(frame, 8)} time={frame} />
      <Figure x={PLAT.friend} y={PLAT.floor} scale={s} facing={1} pose={friendPose} head={FRIEND.head} coat={FRIEND.coat} mouth="flat" {...friendFace}
        blink={blinking(frame, 2)} time={frame} />
      <g opacity={0.72}><Tag frame={frame} x={fh.x} headY={fh.y} r={fh.r} keys={friendTag} scale={1.5} /></g>
      <Tag frame={frame} x={ph.x} headY={ph.y} r={ph.r} keys={pickTag} scale={1.5} />
    </g>
  );
  return (
    <LookContext.Provider value={setLook(metroPlatform.lights(options), "dusk", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={metroPlatform.Back({ cam, mood: "dusk", frame, options })} actors={actors} />
    </LookContext.Provider>
  );
};

/** Head positions on the platform, for framing. */
export const platHeads = () => ({
  friend: headAt(PLAT.friend, PLAT.floor, PLAT.scale, STAND, 1),
  pickpocket: headAt(PLAT.pickpocket, seatedY(PLAT.benchTop, PLAT.scale), PLAT.scale, SEATED, 1),
});
