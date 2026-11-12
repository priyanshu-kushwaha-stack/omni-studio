import { Composition } from "remotion";
import { HEIGHT, WIDTH } from "@whatif/kit/theme";
import { CANDIDATES } from "./data";
import { YearThumbs } from "./YearNight";

/** One frame per candidate: `remotion render ... Thumbs <dir> --sequence` writes them all from one bundle. */
export const Root: React.FC = () => (
  <Composition id="Thumbs" component={YearThumbs} durationInFrames={CANDIDATES.length} fps={1} width={WIDTH} height={HEIGHT} />
);
