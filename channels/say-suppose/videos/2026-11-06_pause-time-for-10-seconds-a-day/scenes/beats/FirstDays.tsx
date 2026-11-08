import type { Beat, Shot } from "../shared";
import { firstDaysPauses } from "./FirstDays.common";
import { BossHallway, ClockHallway } from "./FirstDays.Hallway";
import { HomeLamp } from "./FirstDays.Home";
import { Kitchen } from "./FirstDays.Kitchen";
import { OfficeKitchen } from "./FirstDays.Office";

/** Beat 2, the first days (scene_plan.md, lines 10 to 21): the phone, the boss, the samosa, the chappal, then the
 *  clock that sticks and the remote. Each set is its own file, FirstDays.<Set>.tsx. */
const FirstDays: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  if (frame < clips[14].from) return <Kitchen shot={shot} />;
  if (frame < clips[16].from) return <BossHallway shot={shot} />;
  if (frame < clips[18].from) return <OfficeKitchen shot={shot} />;
  if (frame < clips[19].from) return <HomeLamp shot={shot} />;
  return <ClockHallway shot={shot} />;
};

export const firstDays: Beat = {
  id: "firstDays",
  firstLine: 10,
  Component: FirstDays,
  pauses: (cues, clips) => {
    const p = firstDaysPauses(cues, clips);
    return [p.phone, p.boss, p.samosa, p.chappal];
  },
};
