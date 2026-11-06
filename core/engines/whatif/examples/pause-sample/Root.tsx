import { Composition, type CalculateMetadataFunction } from "remotion";
import { FPS, HEIGHT, WIDTH } from "@whatif/kit/theme";
import { Video, type VideoProps } from "./Video";

const calculateMetadata: CalculateMetadataFunction<VideoProps> = ({ props }) => ({
  durationInFrames: props.timeline.totalFrames,
});

const placeholder: VideoProps = { timeline: { totalFrames: 60, clips: [], cues: {} } };

export const Root: React.FC = () => (
  <Composition
    id="Video"
    component={Video}
    defaultProps={placeholder}
    calculateMetadata={calculateMetadata}
    durationInFrames={60}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
