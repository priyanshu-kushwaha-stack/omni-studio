import { AbsoluteFill, Composition, type CalculateMetadataFunction } from "remotion";
import { FPS, HEIGHT, WIDTH } from "@whatif/kit/theme";
import type { ReelProps } from "./data";
import { ReelPicture } from "./Reel";
import { ReelSound } from "./Sound";

const calculateMetadata: CalculateMetadataFunction<ReelProps> = ({ props }) => ({
  durationInFrames: props.timeline.totalFrames,
});

const placeholder: ReelProps = { timeline: { totalFrames: 60, clips: [], cues: {} }, lines: [], sources: {} };

/** Picture and sound together, for the studio preview; renders use the two passes (reel/render.sh). */
const Reel: React.FC<ReelProps> = (props) => (
  <AbsoluteFill>
    <ReelPicture {...props} />
    <ReelSound {...props} />
  </AbsoluteFill>
);

/** Render with --props=<video>/assets/narration/props.json --public-dir=<video>/assets. */
export const Root: React.FC = () => (
  <>
    <Composition id="ReelPicture" component={ReelPicture} defaultProps={placeholder} calculateMetadata={calculateMetadata}
      durationInFrames={60} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="ReelSound" component={ReelSound} defaultProps={placeholder} calculateMetadata={calculateMetadata}
      durationInFrames={60} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Reel" component={Reel} defaultProps={placeholder} calculateMetadata={calculateMetadata}
      durationInFrames={60} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
