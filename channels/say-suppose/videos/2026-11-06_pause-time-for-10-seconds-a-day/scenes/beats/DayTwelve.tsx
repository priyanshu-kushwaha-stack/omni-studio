import { AbsoluteFill } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import type { Beat, Shot } from "../shared";

/** Placeholder until the beat is built (scene_plan.md, beat "DayTwelve"). */
const DayTwelve: React.FC<{ shot: Shot }> = ({ shot }) => (
  <AbsoluteFill style={{ background: "#23252B", color: "#F3E9D7", fontFamily: FONT, fontWeight: 800, fontSize: 64,
    justifyContent: "center", alignItems: "center" }}>
    DayTwelve · frame {shot.frame - shot.from}
  </AbsoluteFill>
);

export const dayTwelve: Beat = { id: "dayTwelve", firstLine: 25, Component: DayTwelve, pauses: () => [] };
