// The kitchen at lamp light for the Dishes (Polygraph.tsx), look C: the painted kitchen-lamp plate (the lamp under the
// cupboards on the left, the sink under the night window, the table with its chairs in front) with the code puppets in
// it. The painted table stands in front of anyone at the sink or on its far chair: a piece of the plate is laid back
// over them. Code props only for the action: a stack of dirty plates by the sink. World coordinates as the plate.
import { AbsoluteFill } from "remotion";
import type { SetLight } from "@whatif/kit/sets/common";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { PlateScene } from "./Plate";
import { platePath, PlateCut } from "./Rival.Shots";

/** Floor in front of the counter, the counter top, where you stand in the doorway and at the sink, where he washes,
 *  the far chair (behind the table), and the scale of a person at the counter. */
export const K = { floor: 990, behind: 960, top: 628, door: 420, youSink: 870, himSink: 1070, chair: 1229, seat: 803, s: 2.0 };

/** The table, its legs and the near chair: everything in front of the sink and the far chair. */
const TABLE = platePath([[765, 556], [1375, 556], [1378, 600], [1352, 864], [765, 864]]);

/** Dirty plates stacked on the counter by the sink: `n` left. */
const Plates: React.FC<{ n: number }> = ({ n }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <ellipse key={i} cx={790 + Math.sin(i * 2.1) * 4} cy={K.top - 6 - i * 9} rx={40} ry={7} fill={i % 3 === 1 ? "#e9e2d0" : "#f4f4f0"} stroke={INK} strokeWidth={2.5} />
    ))}
  </g>
);

export const KitchenPlate: React.FC<{ cam: Camera; plates: number; actors: React.ReactNode; lights?: SetLight[]; over?: React.ReactNode }> = ({
  cam, plates, actors, lights = [], over,
}) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <PlateScene plate="kitchen-lamp" cam={cam} mood="lamp" rim="warm" rimFrom="left" lights={lights}
      behind={<Plates n={plates} />} actors={actors} front={<PlateCut name="kitchen-lamp" cam={cam} d={TABLE} id="kitchen-table" />} />
    {over}
  </AbsoluteFill>
);
