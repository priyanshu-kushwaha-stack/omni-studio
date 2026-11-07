import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { ScriptLine, Timeline } from "@whatif/kit/timeline";
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook, type MoodName } from "@whatif/kit/stage/moods";
import { PauseBars } from "@whatif/kit/stage/PauseBars";
import { Finish } from "@whatif/kit/stage/Stage";
import { SourceTag } from "@whatif/kit/ui/SourceTag";
import { sourceLabel } from "@whatif/kit/ui/source";
import { worldClock } from "@whatif/kit/world/clock";
import { BEATS } from "./beats";
import { lastIndex, type Shot } from "./shared";

export type FilmProps = { timeline: Timeline; lines: ScriptLine[]; sources: Record<string, string> };

/** The whole video: the beat on at this frame, lit by its line's mood (frozen while paused), with pause bars,
 *  source tags on cited lines, the narration and the bed. */
export const Film: React.FC<FilmProps> = ({ timeline, lines, sources }) => {
  const frame = useCurrentFrame();
  const { clips, cues } = timeline;
  if (!clips.length) return <AbsoluteFill style={{ background: "#000" }} />;
  const pauses = BEATS.flatMap((b) => b.pauses(cues, clips)).sort((a, b) => a.from - b.from);
  const starts = BEATS.map((b) => (b.firstLine === 0 ? 0 : clips[b.firstLine].from));
  const index = Math.max(0, lastIndex(starts, (s) => frame >= s));
  const beat = BEATS[index];
  const to = starts[index + 1] ?? timeline.totalFrames;
  const wc = (f: number) => worldClock(f, pauses);
  const shot: Shot = { frame, t: wc(frame), wc, cues, clips, lines, pauses, from: starts[index], to };

  const lineIndex = Math.max(0, lastIndex(clips, (c) => frame >= c.from));
  const paused = pauses.some((p) => frame >= p.from && frame < p.to);
  const mood = (paused ? "frozen" : lines[lineIndex]?.mood ?? "day") as MoodName;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <LookContext.Provider value={moodLook(mood)}>
        <beat.Component shot={shot} />
      </LookContext.Provider>
      <PauseBars frame={frame} pauses={pauses} />
      {lines.map((l, i) => l.claims?.length ? (
        <SourceTag key={i} text={sourceLabel(l.claims, sources)} from={clips[i].from} to={clips[i].from + clips[i].frames} />
      ) : null)}
      <Finish />
      {clips.map((c) => (
        <Sequence key={c.file} from={c.from} durationInFrames={c.frames}>
          <Audio src={staticFile(c.file)} />
        </Sequence>
      ))}
      <Audio src={staticFile("sfx/pad.wav")} loop volume={0.22} />
    </AbsoluteFill>
  );
};
