import { AbsoluteFill } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import type { Beat, Shot } from "../shared";

/** Placeholder until the beat is built (scene_plan.md, beat "LongRun"). */
const LongRun: React.FC<{ shot: Shot }> = ({ shot }) => (
  <AbsoluteFill style={{ background: "#23252B", color: "#F3E9D7", fontFamily: FONT, fontWeight: 800, fontSize: 64,
    justifyContent: "center", alignItems: "center" }}>
    LongRun · frame {shot.frame - shot.from}
  </AbsoluteFill>
);

export const longRun: Beat = { id: "longRun", firstLine: 52, Component: LongRun, pauses: () => [] };
