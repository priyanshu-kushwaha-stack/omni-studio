import { useCurrentFrame } from "remotion";
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook, type MoodName } from "@whatif/kit/stage/moods";
import { PauseBars } from "@whatif/kit/stage/PauseBars";
import { pausesFor, Video, type VideoProps } from "./Video";

/** The owner's sample with the adopted quality layer: a mood light per scene, frozen light and letterbox while paused. */
export const VideoLit: React.FC<VideoProps> = ({ timeline }) => {
  const frame = useCurrentFrame();
  const pauses = pausesFor(timeline);
  const { clips } = timeline;
  const paused = pauses.some((p) => frame >= p.from && frame < p.to);
  const scene: MoodName = frame < clips[2].from ? "morning" : frame < clips[5].from ? "day" : "dusk";
  const mood: MoodName = paused ? "frozen" : scene;
  return (
    <LookContext.Provider value={moodLook(mood)}>
      <Video timeline={timeline} />
      <PauseBars frame={frame} pauses={pauses} />
    </LookContext.Provider>
  );
};
