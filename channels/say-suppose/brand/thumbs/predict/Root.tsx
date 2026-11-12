import { Composition } from "remotion";
import { HEIGHT, WIDTH } from "@whatif/kit/theme";
import { CANDIDATES } from "./data";
import { PredictThumbs } from "./Predict";

/** One frame per candidate: `remotion render ... Thumbs <dir> --sequence` writes them all from one bundle. */
export const Root: React.FC = () => (
  <Composition id="Thumbs" component={PredictThumbs} durationInFrames={CANDIDATES.length} fps={1} width={WIDTH} height={HEIGHT} />
);
