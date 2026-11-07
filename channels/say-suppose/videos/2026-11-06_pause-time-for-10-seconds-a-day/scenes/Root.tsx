import { Composition, type CalculateMetadataFunction } from "remotion";
import { FPS, HEIGHT, WIDTH } from "@whatif/kit/theme";
import { Film, type FilmProps } from "./Film";

const calculateMetadata: CalculateMetadataFunction<FilmProps> = ({ props }) => ({
  durationInFrames: props.timeline.totalFrames,
});

const placeholder: FilmProps = { timeline: { totalFrames: 60, clips: [], cues: {} }, lines: [], sources: {} };

/** Render with --props=<video>/assets/narration/props.json --public-dir=<video>/assets. */
export const Root: React.FC = () => (
  <Composition id="RoughCut" component={Film} defaultProps={placeholder} calculateMetadata={calculateMetadata}
    durationInFrames={60} fps={FPS} width={WIDTH} height={HEIGHT} />
);
