// The 3D base render with the channel's stamped tag (mustard Rubik 800 on an ink plate with a paper edge), top left,
// off the face and out of the badge zone. Frame i is candidate i. Render with --public-dir pointing
// at the video's renders/packaging/ (where base-thumb.png is).
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import { INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { CANDIDATES, type Tag } from "./data";

const WordTag: React.FC<{ t: Tag }> = ({ t }) => (
  <div style={{
    position: "absolute", top: t.y, ...(t.side === "left" ? { left: t.x } : { right: t.x }), transform: `rotate(${t.tilt}deg)`, transformOrigin: t.side === "left" ? "left center" : "right center",
    background: INK, color: MUSTARD, border: `7px solid ${PAPER}`, borderRadius: 22, textAlign: "left",
    fontFamily: FONT, fontWeight: 800, fontSize: t.size, lineHeight: 1.02, letterSpacing: 2,
    padding: `${t.size * 0.13}px ${t.size * 0.22}px ${t.size * 0.09}px`, whiteSpace: "nowrap",
    boxShadow: "0 14px 26px rgba(0,0,0,.45)",
  }}>{t.lines.map((l) => <div key={l}>{l}</div>)}</div>
);

export const TenYearsThumbs: React.FC = () => {
  const c = CANDIDATES[useCurrentFrame()];
  return (
    <AbsoluteFill>
      <Img src={staticFile(c.base)} style={{ width: "100%", height: "100%" }} />
      <WordTag t={c.tag} />
    </AbsoluteFill>
  );
};
