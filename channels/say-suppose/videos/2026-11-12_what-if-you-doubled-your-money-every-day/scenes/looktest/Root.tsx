import { Composition } from "remotion";
import { HEIGHT, WIDTH } from "@whatif/kit/theme";
import { LookTest } from "./Bakery";

/** Three framings of the day-thirty-one spill, one per frame, for the owner's pick (studio-whatif-edit, look test). */
export const Root: React.FC = () => (
  <Composition id="LookTest" component={LookTest} durationInFrames={3} fps={1} width={WIDTH} height={HEIGHT} />
);
