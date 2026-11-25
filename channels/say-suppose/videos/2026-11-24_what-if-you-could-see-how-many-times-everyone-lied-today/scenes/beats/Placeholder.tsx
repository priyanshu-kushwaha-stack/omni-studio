// A beat not drawn yet: its name on paper, so the cut runs end to end while beats are built.
import { AbsoluteFill } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import { INK, PAPER } from "@whatif/kit/theme";
import type { Shot } from "../shared";

export const placeholder = (name: string): React.FC<{ shot: Shot }> => () => (
  <AbsoluteFill style={{ background: PAPER, color: INK, fontFamily: FONT, fontWeight: 800, fontSize: 90,
    alignItems: "center", justifyContent: "center" }}>{name}</AbsoluteFill>
);
