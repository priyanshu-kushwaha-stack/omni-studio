// Part A's check composition: part A's shots, tags and bubbles exactly as Film.tsx places them, picture only (no
// sound, no title card), for stills while the film's sound plan is still being built. Not part of the film.
import { AbsoluteFill, Composition, useCurrentFrame, type CalculateMetadataFunction } from "remotion";
import { Finish } from "@whatif/kit/stage/Stage";
import { FPS, HEIGHT, WIDTH } from "@whatif/kit/theme";
import { frameOf, type FilmProps } from "../../../Film";
import { BUBBLES_A, SHOTS_A, TAGS_A } from "../../../shots/a";
import { Bubble, CastTag, TagStamp, TextBubble } from "../../util";

const CheckA: React.FC<FilmProps> = ({ timeline, lines }) => {
  const frame = useCurrentFrame();
  const starts = SHOTS_A.map((s, i) => (i === 0 ? 0 : frameOf(s.at, timeline, lines)));
  let i = 0;
  for (let k = 0; k < starts.length; k++) if (frame >= starts[k]) i = k;
  const from = starts[i];
  const dur = Math.max(1, (starts[i + 1] ?? timeline.totalFrames) - from);
  const t = { f: frame - from, dur, p: Math.min(1, (frame - from) / dur) };
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {SHOTS_A[i].draw(t)}
      <Finish />
      {TAGS_A.map((g, k) => {
        const at = frameOf(g.at, timeline, lines);
        const len = g.frames ?? (g.kind === "cast" ? 120 : 90);
        if (frame < at || frame >= at + len) return null;
        return g.kind === "label" ? <TagStamp key={k} text={g.text} f={frame - at} />
          : g.kind === "cast" ? <CastTag key={k} text={g.text} f={frame - at} />
          : <TextBubble key={k} text={g.text} f={frame - at} dot={g.dot} from={g.from} />;
      })}
      {BUBBLES_A.map((b, k) => {
        const at = frameOf(b.at, timeline, lines);
        return frame >= at && frame < at + (b.frames ?? 75) ? <Bubble key={k} text={b.text} x={b.x} y={b.y} f={frame - at} /> : null;
      })}
    </AbsoluteFill>
  );
};

const placeholder: FilmProps = { timeline: { totalFrames: 60, clips: [], cues: {} }, lines: [], sources: {} };
const calculateMetadata: CalculateMetadataFunction<FilmProps> = ({ props }) => ({ durationInFrames: props.timeline.totalFrames });

export const Root: React.FC = () => (
  <Composition id="RoughCut" component={CheckA} defaultProps={placeholder} calculateMetadata={calculateMetadata}
    durationInFrames={60} fps={FPS} width={WIDTH} height={HEIGHT} />
);
