import { AbsoluteFill, Audio, Freeze, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { ScriptLine, Timeline } from "@whatif/kit/timeline";
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook, type MoodName } from "@whatif/kit/stage/moods";
import { PauseBars } from "@whatif/kit/stage/PauseBars";
import { Finish } from "@whatif/kit/stage/Stage";
import { SourceTag } from "@whatif/kit/ui/SourceTag";
import { sourceLabel } from "@whatif/kit/ui/source";
import { worldClock } from "@whatif/kit/world/clock";
import { C_FRAMES, Hi, IdentC } from "../../../brand/IdentC";
import { S1_FRAMES, SubscribeTag } from "../../../brand/Subscribe";
import { BEATS } from "./beats";
import { lastIndex, type Shot } from "./shared";

/** The score's level (build_score.py makes assets/music/score.wav): low under every narration line, rising toward
 *  the voice's level in the wordless holds (style.md). It dips DUCK_IN frames before a line and comes back over
 *  DUCK_OUT frames after it, so no duck is a step. */
const UNDER_VOICE = 0.16;
const IN_HOLDS = 0.6;
const DUCK_IN = 8;
const DUCK_OUT = 18;

export function scoreVolume(frame: number, clips: { from: number; frames: number }[]): number {
  let duck = 0;
  for (const c of clips) {
    const end = c.from + c.frames;
    if (frame >= c.from && frame < end) return UNDER_VOICE;
    if (frame < c.from && c.from - frame < DUCK_IN) duck = Math.max(duck, 1 - (c.from - frame) / DUCK_IN);
    if (frame >= end && frame - end < DUCK_OUT) duck = Math.max(duck, 1 - (frame - end) / DUCK_OUT);
  }
  return IN_HOLDS + (UNDER_VOICE - IN_HOLDS) * duck;
}

export type FilmProps = { timeline: Timeline; lines: ScriptLine[]; sources: Record<string, string> };

/** The picture at the current frame: the beat on, lit by its line's mood (frozen while paused), pause bars, source tags
 *  on cited lines and the paper finish. No narration or bed: the title card renders it again inside a <Freeze>. */
const Picture: React.FC<FilmProps> = ({ timeline, lines, sources }) => {
  const frame = useCurrentFrame();
  const { clips, cues } = timeline;
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
    </AbsoluteFill>
  );
};

/** The whole video: the picture, the channel's title card after the hook (owner's pick, 2026-11-07: option C in
 *  channels/say-suppose/brand), a paper subscribe tag after the rescue, the narration and the score. */
export const Film: React.FC<FilmProps> = (props) => {
  const { clips, cues } = props.timeline;
  if (!clips.length) return <AbsoluteFill style={{ background: "#000" }} />;
  // The card is made from the hook's last frozen frame and opens onto line 1's first frame; it ends as line 1 starts.
  // <Freeze frame> takes film frames here: the faces render the film itself at those frames.
  const cardFrom = clips[1].from - C_FRAMES;
  const frozenHook = cues.flash - 2;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Picture {...props} />
      <Sequence from={cardFrom} durationInFrames={C_FRAMES}>
        <IdentC
          front={<Freeze frame={frozenHook}><Picture {...props} /></Freeze>}
          back={<Freeze frame={clips[1].from}><Picture {...props} /></Freeze>}
          title={["What if you could pause time", <>for <Hi>10 seconds</Hi> a day?</>]}
        />
      </Sequence>
      {/* After the rescue, on your trembling hands: a quiet moment the story can spare. */}
      <Sequence from={cues.hands} durationInFrames={S1_FRAMES}>
        <SubscribeTag />
      </Sequence>
      {clips.map((c) => (
        <Sequence key={c.file} from={c.from} durationInFrames={c.frames}>
          <Audio src={staticFile(c.file)} />
        </Sequence>
      ))}
      <Audio src={staticFile("music/score.wav")} volume={(f) => scoreVolume(f, clips)} />
    </AbsoluteFill>
  );
};
