import { AbsoluteFill } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import { MUSTARD, PAPER } from "@whatif/kit/theme";
import { lastIndex, type Shot } from "../shared";

/** A stand-in until the beat's scene is built: the beat's name and the line being spoken. */
export const Placeholder: React.FC<{ shot: Shot; title: string }> = ({ shot, title }) => {
  const i = Math.max(0, lastIndex(shot.clips, (c) => shot.frame >= c.from));
  return (
    <AbsoluteFill style={{ background: "#1c2030", padding: 120, fontFamily: FONT, color: PAPER, justifyContent: "center" }}>
      <div style={{ fontSize: 44, color: MUSTARD, fontWeight: 800 }}>{title}</div>
      <div style={{ fontSize: 56, fontWeight: 800, marginTop: 30 }}>{shot.lines[i]?.text}</div>
    </AbsoluteFill>
  );
};
