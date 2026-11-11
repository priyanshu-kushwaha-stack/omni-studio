import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { ScriptLine, Timeline } from "@whatif/kit/timeline";
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook, type MoodName } from "@whatif/kit/stage/moods";
import { Finish } from "@whatif/kit/stage/Stage";
import { BEATS } from "./beats";
import { lastIndex, type Shot } from "./shared";

/** The score's level, the owner's (taste.md 2026-11-08, G5 of the pause-time film): about 26 dB under the voice while
 *  it speaks, rising to about 8 dB under it in the wordless holds. It dips DUCK_IN frames before a line and comes back
 *  over DUCK_OUT frames after it, so no duck is a step (core/studio/rules/no-audio-clicks.md). */
const UNDER_VOICE = 0.039;
const IN_HOLDS = 0.3;
const DUCK_IN = 8;
const DUCK_OUT = 18;
/** The cost (script line 81, "Sunday. You've managed a whole lunch without a question.") is where the light theme
 *  hands over to the dark one; they cross over XFADE frames. */
const DARK_FROM_LINE = 81;
const XFADE = 60;
/** The score fades out over the film's last OUTRO frames, so the loop never stops mid-wave. */
const OUTRO = 60;

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

export type FilmProps = { timeline: Timeline; lines: ScriptLine[]; sources: Record<string, string>; narration?: boolean };

/** The picture at the current frame: the beat on, lit by the current line's mood, and the paper finish. Sources are
 *  not shown on screen; they go in the description (owner, 2026-11-07). */
const Picture: React.FC<FilmProps> = ({ timeline, lines }) => {
  const frame = useCurrentFrame();
  const { clips, cues } = timeline;
  const starts = BEATS.map((b) => (b.firstLine === 0 ? 0 : clips[b.firstLine].from));
  const index = Math.max(0, lastIndex(starts, (s) => frame >= s));
  const beat = BEATS[index];
  const to = starts[index + 1] ?? timeline.totalFrames;
  const shot: Shot = { frame, t: frame, wc: (f) => f, cues, clips, lines, pauses: [], from: starts[index], to };
  const lineIndex = Math.max(0, lastIndex(clips, (c) => frame >= c.from));
  const mood = (lines[lineIndex]?.mood ?? "day") as MoodName;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <LookContext.Provider value={moodLook(mood)}>
        <beat.Component shot={shot} />
      </LookContext.Provider>
      <Finish />
    </AbsoluteFill>
  );
};

/** The whole film: the picture, the narration and the score (the channel's two themes, light then dark). */
export const Film: React.FC<FilmProps> = (props) => {
  const { clips, totalFrames } = props.timeline;
  if (!clips.length) return <AbsoluteFill style={{ background: "#000" }} />;
  const dark = clips[DARK_FROM_LINE]?.from ?? totalFrames;
  const lightVol = (f: number) => scoreVolume(f, clips) * Math.min(1, Math.max(0, (dark + XFADE - f) / XFADE));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Picture {...props} />
      {/* The cleaned narration (mix_narration.py): takes trimmed after the last word, faded, click mutes applied. */}
      {props.narration !== false && <Audio src={staticFile("narration/narration.wav")} />}
      <Sequence durationInFrames={dark + XFADE}>
        <Audio src={staticFile("music/theme-light.mp3")} loop volume={lightVol} />
      </Sequence>
      <Sequence from={dark}>
        <Audio src={staticFile("music/theme-dark.mp3")} loop
          volume={(f) => scoreVolume(f + dark, clips) * Math.min(1, f / XFADE)
            * Math.min(1, Math.max(0, (totalFrames - (f + dark)) / OUTRO))} />
      </Sequence>
      {/* A room tone about 50 dB under the voice for the whole film (make_sfx.sh), so no moment is digital silence;
       *  it fades over the last few frames only. */}
      <Audio src={staticFile("sfx/roomtone.wav")} loop
        volume={(f) => Math.min(1, f / 6, Math.max(0, (totalFrames - f) / 6))} />
    </AbsoluteFill>
  );
};
