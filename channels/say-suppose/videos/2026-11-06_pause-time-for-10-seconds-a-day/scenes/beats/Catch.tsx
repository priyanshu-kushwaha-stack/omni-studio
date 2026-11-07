import { AbsoluteFill } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import type { Beat, Shot } from "../shared";

/** Placeholder until the beat is built (scene_plan.md, beat "Catch"). */
const Catch: React.FC<{ shot: Shot }> = ({ shot }) => (
  <AbsoluteFill style={{ background: "#23252B", color: "#F3E9D7", fontFamily: FONT, fontWeight: 800, fontSize: 64,
    justifyContent: "center", alignItems: "center" }}>
    Catch · frame {shot.frame - shot.from}
  </AbsoluteFill>
);

export const theCatch: Beat = { id: "catch", firstLine: 38, Component: Catch, pauses: () => [] };
