// G1 thumbnails for "What If You Saw 60 Seconds Into the Future?" (2026-11-10). Its own root, so the batch-1
// files stay as they were and parallel film sessions do not collide on Root.tsx.
//   cd core/engines/whatif && pnpm exec remotion render ../../../channels/say-suppose/brand/thumbs/sixty-index.tsx Thumbs out/thumbs-sixty --sequence --image-format=png
import { registerRoot } from "remotion";
import { Composition } from "remotion";
import { HEIGHT, WIDTH } from "@whatif/kit/theme";
import { SIXTY } from "./sixty";
import { SixtyThumbs } from "./SixtyThumbs";

const Root: React.FC = () => (
  <Composition id="Thumbs" component={SixtyThumbs} durationInFrames={SIXTY.length} fps={1} width={WIDTH} height={HEIGHT} />
);
registerRoot(Root);
