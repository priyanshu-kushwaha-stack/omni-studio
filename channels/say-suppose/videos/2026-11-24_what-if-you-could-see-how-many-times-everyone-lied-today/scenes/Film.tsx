// The film: the beat on at each frame, lit by its line's mood, the script's cards, the paper finish; under it the
// narration, a score cue per section and an ambience bed per set (G2 first cut, 2026-11-25; levels as the fail and
// AI-rents films, taste.md 2026-11-08).
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { ScriptLine, Timeline } from "@whatif/kit/timeline";
import { FPS } from "@whatif/kit/theme";
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook, type MoodName } from "@whatif/kit/stage/moods";
import { Finish } from "@whatif/kit/stage/Stage";
import { BEATS } from "./beats";
import { findLine, lastIndex, makeShot } from "./shared";
import { Cards } from "./Cards";
import { soundPlan } from "./sound";
import { Clicks } from "./Clicks";

const UNDER_VOICE = 0.039;
const IN_HOLDS = 0.3;
const DUCK_IN = 8;
const DUCK_OUT = 18;
const SCORE_LEAD = 1.0;
const SCORE_FADE = 1.5;
const BED_LEAD = 0.5;
const BED_FADE = 0.8;
const BED_UNDER_VOICE = 0.4;
const MASTER = 1.2;
/** Voice B reads quieter than the old narrator: the narration alone comes up by NARR (the fail film's mix). */
const NARR = 1.75;
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

/** Each beat's start frame: its first line's start, less its lead (the hold that opens it); the first beat at 0. */
export function beatStarts(timeline: Timeline, lines: ScriptLine[]): { start: number; first: number }[] {
  let from = 0;
  return BEATS.map((b, k) => {
    const first = findLine(lines, b.first, from);
    from = first;
    const at = timeline.clips[first].from - Math.round((b.lead ?? 0) * FPS);
    return { start: k === 0 ? 0 : Math.max(0, at), first };
  });
}

const Picture: React.FC<FilmProps> = ({ timeline, lines }) => {
  const frame = useCurrentFrame();
  const { clips } = timeline;
  const starts = beatStarts(timeline, lines);
  const index = Math.max(0, lastIndex(starts, (s) => frame >= s.start));
  const beat = BEATS[index];
  const to = starts[index + 1]?.start ?? timeline.totalFrames;
  const shot = makeShot(frame, clips, lines, starts[index].start, to, starts[index].first);
  const lineIndex = Math.max(0, lastIndex(clips, (c) => frame >= c.from));
  const mood = (lines[lineIndex]?.mood ?? "day") as MoodName;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <LookContext.Provider value={moodLook(mood)}>
        <beat.Component shot={shot} />
      </LookContext.Provider>
      <Cards frame={frame} clips={clips} lines={lines} />
      <Finish />
    </AbsoluteFill>
  );
};

function window(f: number, from: number, to: number, fade: number): number {
  const rise = from === 0 ? 1 : (f - from) / fade;
  return Math.max(0, Math.min(1, rise, (to - f) / fade));
}

function peakDip(f: number, peak: { from: number; to: number; floor: number }): number {
  const a = peak.from * FPS;
  const b = peak.to * FPS;
  const d = Math.max(0, Math.min(1, (f - a) / FPS, (b - f) / FPS));
  return 1 - (1 - peak.floor) * d;
}

const Placed: React.FC<{ src: string; from: number; to: number; lead: number; fade: number; total: number;
  gain: (f: number) => number }> = ({ src, from, to, lead, fade, total, gain }) => {
  const start = Math.max(0, Math.round((from - lead) * FPS));
  const end = Math.min(total, Math.round((to - lead + fade) * FPS));
  return (
    <Sequence from={start} durationInFrames={Math.max(1, end - start)}>
      <Audio src={staticFile(src)} loop
        volume={(f) => window(f + start, start, end, Math.round(fade * FPS)) * gain(f + start) * MASTER} />
    </Sequence>
  );
};

export const Film: React.FC<FilmProps> = (props) => {
  const { clips, totalFrames } = props.timeline;
  if (!clips.length) return <AbsoluteFill style={{ background: "#000" }} />;
  const outro = (f: number) => Math.min(1, Math.max(0, (totalFrames - f) / OUTRO));
  const { score: SCORE, beds: BEDS, peak: PEAK } = soundPlan(clips, props.lines, totalFrames);
  const score = (f: number) => scoreVolume(f, clips) * peakDip(f, PEAK) * outro(f);
  const bed = (f: number) => (BED_UNDER_VOICE + (1 - BED_UNDER_VOICE) * (scoreVolume(f, clips) - UNDER_VOICE)
    / (IN_HOLDS - UNDER_VOICE)) * outro(f);
  const total = totalFrames / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Picture {...props} />
      {props.narration !== false && <Audio src={staticFile("narration/narration.wav")} volume={MASTER * NARR} />}
      <Clicks clips={clips} lines={props.lines} />
      {SCORE.map((c, i) => (
        <Placed key={`s${i}`} src={`music/${c.file}`} from={c.from} to={i === SCORE.length - 1 ? total + 1 : c.to}
          lead={SCORE_LEAD} fade={SCORE_FADE} total={totalFrames} gain={score} />
      ))}
      {BEDS.map(([from, name], i) => (
        <Placed key={`b${i}`} src={`sfx/bed-${name}.wav`} from={from} to={BEDS[i + 1]?.[0] ?? total + 1}
          lead={BED_LEAD} fade={BED_FADE} total={totalFrames} gain={bed} />
      ))}
    </AbsoluteFill>
  );
};
