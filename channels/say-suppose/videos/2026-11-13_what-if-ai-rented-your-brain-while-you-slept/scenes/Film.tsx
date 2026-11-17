import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Clip, ScriptLine, Timeline } from "@whatif/kit/timeline";
import { FPS } from "@whatif/kit/theme";
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook, type MoodName } from "@whatif/kit/stage/moods";
import { Finish } from "@whatif/kit/stage/Stage";
import { BEATS } from "./beats";
import { lastIndex, type Shot } from "./shared";
import { Captions } from "./Captions";
import { V1_TO_V3, v5Lines, v5Timeline } from "./remap";
import { soundPlan } from "./sound";

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

/** v3's clips in the beats' v1 numbering (remap.ts). A v1 line cut later maps onto the same clip as the line before
 *  it; it gets a one-frame clip just before the next line instead, so its insert never shows and every camera key a
 *  beat builds from its lines stays strictly increasing. */
export function beatClips(v3: Clip[]): Clip[] {
  const out = V1_TO_V3.map((n) => v3[n]);
  for (let i = 1; i < out.length; i++) {
    if (V1_TO_V3[i] !== V1_TO_V3[i - 1]) continue;
    let j = i;
    while (j < out.length && V1_TO_V3[j] === V1_TO_V3[i - 1]) j++;
    const next = j < out.length ? out[j].from : out[i - 1].from + out[i - 1].frames + (j - i) * 2 + 2;
    for (let k = i; k < j; k++) out[k] = { ...out[k], from: next - (j - k) * 2, frames: 1 };
  }
  return out;
}

export type FilmProps = { timeline: Timeline; lines: ScriptLine[]; sources: Record<string, string>; narration?: boolean };

/** The picture at the current frame: the beat on, lit by the current line's mood, and the paper finish. Sources are
 *  not shown on screen; they go in the description (owner, 2026-11-07). */
const Picture: React.FC<FilmProps> = ({ timeline, lines: v7Lines }) => {
  const frame = useCurrentFrame();
  const { clips: v7, cues } = timeline;
  // Script v7 (v5 minus its line 24): the beats count v5 lines (remap.ts V5_TO_V7), the cut line a one-frame placeholder.
  const v3 = v5Timeline(v7);
  const v3Lines = v5Lines(v7Lines);
  // The beats count lines in v1 numbering (remap.ts): hand them v3's clips and lines in that numbering.
  const clips = beatClips(v3);
  const lines = V1_TO_V3.map((n) => v3Lines[n]);
  const starts = BEATS.map((b) => (b.openAt ? b.openAt(v3) : b.firstLine === 0 ? 0 : clips[b.firstLine].from));
  const index = Math.max(0, lastIndex(starts, (s) => frame >= s));
  const beat = BEATS[index];
  const to = starts[index + 1] ?? timeline.totalFrames;
  const shot: Shot = { frame, t: frame, wc: (f) => f, cues, clips, lines, pauses: [], from: starts[index], to, v3 };
  const lineIndex = Math.max(0, lastIndex(v7, (c) => frame >= c.from));
  const mood = (v7Lines[lineIndex]?.mood ?? "day") as MoodName;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <LookContext.Provider value={moodLook(mood)}>
        <beat.Component shot={shot} />
      </LookContext.Provider>
      <Captions frame={frame} clips={v7} />
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

/** The globe's peak: the score sinks to the floor across it, over a second each way. */
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
  const { SCORE, BEDS, PEAK } = soundPlan(v5Timeline(clips), totalFrames);
  const outro = (f: number) => Math.min(1, Math.max(0, (totalFrames - f) / OUTRO));
  const score = (f: number) => scoreVolume(f, clips) * peakDip(f, PEAK) * outro(f);
  const bed = (f: number) => (BED_UNDER_VOICE + (1 - BED_UNDER_VOICE) * (scoreVolume(f, clips) - UNDER_VOICE)
    / (IN_HOLDS - UNDER_VOICE)) * outro(f);
  const total = totalFrames / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Picture {...props} />
      {/* The cleaned narration (mix_narration.py): takes trimmed after the last word, faded, click mutes applied. */}
      {props.narration !== false && <Audio src={staticFile("narration/narration.wav")} />}
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
