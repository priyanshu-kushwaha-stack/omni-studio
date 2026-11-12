// The metro platform at dusk (Red, lines 67-68), on the library's metroPlatform set with no train: your best friend
// alone at one end under a pale crimson card; at the other end the pickpocket, teal, and a bench full of people beside
// him.
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { metroPlatform } from "@whatif/kit/sets/MetroPlatform";
import { seatedY, setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { headAt } from "../kit";
import { Tag, type TagKey } from "../device";
import { blinking, FRIEND, PASTELS, PICKPOCKET } from "../shared";
import type { Face } from "./SixtyPerCent.Parts";

export const PLAT = { floor: 960, scale: 1.1, friend: 300, pickpocket: 1390, bench: [1545, 1640, 1735], benchTop: 836 } as const;

const HANDS_IN: Pose = { ...STAND, armF: [-12, 24], armB: [-16, 22] };

export const PlatformShot: React.FC<{
  frame: number; cam: Camera; friendTag: TagKey[]; pickTag: TagKey[]; friendFace: Face; friendPose?: Pose; benchLook?: number;
}> = ({ frame, cam, friendTag, pickTag, friendFace, friendPose = STAND, benchLook = 0 }) => {
  const s = PLAT.scale;
  const fh = headAt(PLAT.friend, PLAT.floor, s, friendPose, 1);
  const ph = headAt(PLAT.pickpocket, PLAT.floor, s, HANDS_IN, -1);
  const options = { train: null, doorOpen: 0, crowd: true };
  const actors = (
    <g>
      {PLAT.bench.map((x, i) => (
        <Figure key={x} x={x} y={seatedY(PLAT.benchTop, s)} scale={s} facing={-1} pose={{ ...SEATED, armF: [30, 50] }} head={PASTELS[(i * 3 + 1) % PASTELS.length]}
          coat={["#5a6488", "#7a3b46", "#2f5f63"][i]} mouth="flat" lids={0.2} look={{ x: 0.5 - benchLook * 0.3, y: 0.3 }} blink={blinking(frame, 10 + i)} time={frame} />
      ))}
      <Figure x={PLAT.pickpocket} y={PLAT.floor} scale={s} facing={-1} pose={HANDS_IN} head={PICKPOCKET.head} coat={PICKPOCKET.coat}
        mouth="flat" lids={0.3} look={{ x: 0.3, y: 0.1 }} blink={blinking(frame, 8)} time={frame} />
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
  pickpocket: headAt(PLAT.pickpocket, PLAT.floor, PLAT.scale, HANDS_IN, -1),
});
