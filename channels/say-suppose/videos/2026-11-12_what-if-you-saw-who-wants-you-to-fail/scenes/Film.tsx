import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { ScriptLine, Timeline } from "@whatif/kit/timeline";
import { FPS } from "@whatif/kit/theme";
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook, type MoodName } from "@whatif/kit/stage/moods";
import { Finish } from "@whatif/kit/stage/Stage";
import { BEATS } from "./beats";
import { lastIndex, type Shot } from "./shared";
import { Captions } from "./Captions";
import { soundPlan } from "./sound";
import { COLD, coldCuts, ColdFlash, ColdSound, coldSource } from "./ColdOpen";

/** The score's level, the owner's (taste.md 2026-11-08, G5 of the pause-time film): about 26 dB under the voice while
 *  it speaks, rising to about 8 dB under it in the wordless holds. It dips DUCK_IN frames before a line and comes back
 *  over DUCK_OUT frames after it, so no duck is a step (core/studio/rules/no-audio-clicks.md). */
const UNDER_VOICE = 0.039;
const IN_HOLDS = 0.3;
const DUCK_IN = 8;
const DUCK_OUT = 18;
/** Each score cue and each ambience bed comes in LEAD seconds before its section and crosses the one before it over
 *  FADE seconds, so the next scene's sound is under the cut (rules/sound.md #7). Beds sit BED_UNDER_VOICE under the
 *  voice and come up to full (about 8 dB under the hold music) in the holds. */
const SCORE_LEAD = 1.0;
const SCORE_FADE = 1.5;
const BED_LEAD = 0.5;
const BED_FADE = 0.8;
const BED_UNDER_VOICE = 0.4;
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
const Picture: React.FC<FilmProps> = ({ timeline, lines: allLines }) => {
  const frame = useCurrentFrame();
  const { clips: all, cues } = timeline;
  // v5 (2026-11-14): the beats count lines in story.json's own numbering, from the platform on. G2 round 18: the cold
  // open speaks story.json's first COLD lines, so the beats get the clips and lines after them (frames unchanged).
  const clips = all.slice(COLD);
  const lines = allLines.slice(COLD);
  const coldEnd = all[COLD - 1].from; // "It started this morning.": the platform
  const starts = BEATS.map((b) => (b.firstLine === 0 ? coldEnd : clips[b.firstLine].from));
  const cuts = coldCuts(all, clips);
  const cold = frame < coldEnd;
  const src = cold ? coldSource(frame, cuts) : frame;
  const index = Math.max(0, lastIndex(starts, (s) => src >= s));
  const beat = BEATS[index];
  const to = starts[index + 1] ?? timeline.totalFrames;
  const shot: Shot = { frame: src, t: src, wc: (f) => f, cues, clips, lines, pauses: [], from: starts[index], to, v4: clips };
  const lineIndex = Math.max(0, lastIndex(clips, (c) => src >= c.from));
  const mood = (lines[lineIndex]?.mood ?? "day") as MoodName;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <LookContext.Provider value={moodLook(mood)}>
        <beat.Component shot={shot} />
      </LookContext.Provider>
      {!cold && <Captions frame={frame} clips={clips} />}
      <ColdFlash frame={frame} cuts={cuts} end={coldEnd} />
      <Finish />
    </AbsoluteFill>
  );
};

/** A gain that rises over `fade` frames from `from` (at once when `from` is the film's start) and falls over `fade`
 *  frames to `to` (frames of the film). */
function window(f: number, from: number, to: number, fade: number): number {
  const rise = from === 0 ? 1 : (f - from) / fade;
  return Math.max(0, Math.min(1, rise, (to - f) / fade));
}

/** The dock's peak: the score sinks to the floor across it, over a second each way. */
function peakDip(f: number, peak: { from: number; to: number; floor: number }): number {
  const a = peak.from * FPS;
  const b = peak.to * FPS;
  const d = Math.max(0, Math.min(1, (f - a) / FPS, (b - f) / FPS));
  return 1 - (1 - peak.floor) * d;
}

/** A sound placed from `from` to `to` seconds with its lead and crossfade, its gain given per film frame. */
const Placed: React.FC<{ src: string; from: number; to: number; lead: number; fade: number; total: number;
  gain: (f: number) => number }> = ({ src, from, to, lead, fade, total, gain }) => {
  const start = Math.max(0, Math.round((from - lead) * FPS));
  const end = Math.min(total, Math.round((to - lead + fade) * FPS));
  return (
    <Sequence from={start} durationInFrames={Math.max(1, end - start)}>
      <Audio src={staticFile(src)} loop
        volume={(f) => window(f + start, start, end, Math.round(fade * FPS)) * gain(f + start)} />
    </Sequence>
  );
};

/** The whole film: the picture, the narration, the score (a cue per section) and a bed per set. */
export const Film: React.FC<FilmProps> = (props) => {
  const { clips, totalFrames } = props.timeline;
  if (!clips.length) return <AbsoluteFill style={{ background: "#000" }} />;
  const outro = (f: number) => Math.min(1, Math.max(0, (totalFrames - f) / OUTRO));
  const { score: SCORE, beds: BEDS, peak: PEAK } = soundPlan(clips.slice(COLD), totalFrames, clips[COLD - 1].from);
  const score = (f: number) => scoreVolume(f, clips) * peakDip(f, PEAK) * outro(f);
  const bed = (f: number) => (BED_UNDER_VOICE + (1 - BED_UNDER_VOICE) * (scoreVolume(f, clips) - UNDER_VOICE)
    / (IN_HOLDS - UNDER_VOICE)) * outro(f);
  const total = totalFrames / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Picture {...props} />
      {/* The cleaned narration (mix_narration.py): takes trimmed after the last word, faded, click mutes applied. */}
      {props.narration !== false && <Audio src={staticFile("narration/narration.wav")} />}
      <ColdSound cuts={coldCuts(clips, clips.slice(COLD))} end={clips[COLD - 1].from} />
      {SCORE.map((c, i) => (
        <Placed key={`s${i}`} src={`music/${c.file}`} from={c.from} to={i === SCORE.length - 1 ? total + 1 : c.to}
          lead={SCORE_LEAD} fade={SCORE_FADE} total={totalFrames} gain={score} />
      ))}
      {/* One held low note across the peak (make_sfx.sh), about -34 dB: quieter than the hold music it replaces, so
       *  the peak is a floor and not a swell. */}
      <Sequence from={Math.round(PEAK.from * FPS)} durationInFrames={Math.round((PEAK.to - PEAK.from + 3) * FPS)}>
        <Audio src={staticFile("sfx/peak-note.wav")} volume={0.07} />
      </Sequence>
      {/* An ambience bed per set (make_ambience.py), so no moment is digital silence and the muted-music test holds. */}
      {BEDS.map(([from, name], i) => (
        <Placed key={`b${i}`} src={`sfx/bed-${name}.wav`} from={from} to={BEDS[i + 1]?.[0] ?? total + 1}
          lead={BED_LEAD} fade={BED_FADE} total={totalFrames} gain={bed} />
      ))}
    </AbsoluteFill>
  );
};
