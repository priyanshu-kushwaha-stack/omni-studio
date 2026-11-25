import { Composition } from "remotion";
import { FPS, HEIGHT, WIDTH } from "@whatif/kit/theme";
import { LookTest } from "./Looks";

export const LooksRoot: React.FC = () => (
  <>
    <Composition id="LookA" component={LookTest} defaultProps={{ o: { bg: "code", cast: "pastel" } as const }} durationInFrames={180} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="LookB" component={LookTest} defaultProps={{ o: { bg: "plate", cast: "ink" } as const }} durationInFrames={180} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="LookC" component={LookTest} defaultProps={{ o: { bg: "plate", cast: "pastel" } as const }} durationInFrames={180} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
