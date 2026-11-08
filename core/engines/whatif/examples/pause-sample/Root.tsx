import { Composition, type CalculateMetadataFunction } from "remotion";
import { FPS, HEIGHT, WIDTH } from "@whatif/kit/theme";
import { VideoLit } from "./Lit";
import { Video, type VideoProps } from "./Video";

const calculateMetadata: CalculateMetadataFunction<VideoProps> = ({ props }) => ({
  durationInFrames: props.timeline.totalFrames,
});

const placeholder: VideoProps = { timeline: { totalFrames: 60, clips: [], cues: {} } };

export const Root: React.FC = () => (
  <>
    {/* The owner's sample as it was: the parity test renders this one. */}
    <Composition id="Video" component={Video} defaultProps={placeholder} calculateMetadata={calculateMetadata}
      durationInFrames={60} fps={FPS} width={WIDTH} height={HEIGHT} />
    {/* The same sample with the adopted quality layer. */}
    <Composition id="VideoLit" component={VideoLit} defaultProps={placeholder} calculateMetadata={calculateMetadata}
      durationInFrames={60} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
