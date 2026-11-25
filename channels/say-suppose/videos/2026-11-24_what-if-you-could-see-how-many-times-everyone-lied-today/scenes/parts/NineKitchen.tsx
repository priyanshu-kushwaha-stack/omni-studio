// The flat's kitchen for the dishes (Polygraph.tsx, lamp) and the last morning (Nine.tsx): the library's kitchen with a
// small table and a chair by the window, and a sink with its stack of plates on the platform. World coordinates (REF).
import { kitchen, SetScene } from "@whatif/kit/sets";
import type { Glow } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import { Chair, Sink, Table } from "./RivalParts";

export const K_FLOOR = 960;
export const K_TOP = 760;
/** The chair by the window faces right, toward the sink and the doorway. */
export const CHAIR = { x: 250, seat: 822 };
export const TABLE = { x: 470, top: 800 };
export const SINK = { x: 1180 };
/** The doorway at the right edge. */
export const DOOR_X = 1560;

/** The kitchen with its furniture; `seated` is drawn between the chair and the table (the table hides the legs). */
export const KitchenShot: React.FC<{
  cam: Camera; mood: MoodName; frame: number; plates: number; seated?: React.ReactNode; actors?: React.ReactNode; onTable?: React.ReactNode; glows?: Glow[];
}> = ({ cam, mood, frame, plates, seated, actors, onTable, glows = [] }) => (
  <SetScene set={kitchen} mood={mood} frame={frame} cam={cam} options={{ stove: "kettle", steam: 0, counter: [] }} cast={[]} look={{ glows }}
    actors={
      <>
        <Sink x={SINK.x} top={K_TOP} plates={plates} />
        <Chair x={CHAIR.x} seat={CHAIR.seat} floor={K_FLOOR} back={-1} />
        {seated}
        <Table x={TABLE.x} top={TABLE.top} floor={K_FLOOR} w={320} />
        {onTable}
        {actors}
      </>
    } />
);
