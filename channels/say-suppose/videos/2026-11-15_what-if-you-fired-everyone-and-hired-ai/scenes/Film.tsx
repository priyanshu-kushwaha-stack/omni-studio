// The fired-everyone first cut (adapted from the AI-texts film): the shot under the playhead (shots.tsx), the channel's title card after the premise, a paper
// subscribe tag on the night bus, the script's message tags, the narration, a score cue per section and an ambience bed
// per set (sound.ts; owner, 2026-11-13: "better sound ... to break the continuous background music"), and the roof's
// wordless peak as a floor with one held note. Render with --props=<video>/assets/narration/props.json
// --public-dir=<video>/assets.
import { AbsoluteFill, Audio, Freeze, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { ScriptLine, Timeline } from "@whatif/kit/timeline";
import { Finish } from "@whatif/kit/stage/Stage";
import { useSoundOnly } from "@whatif/kit/sound";
import { FPS } from "@whatif/kit/theme";
import { C_FRAMES, Hi, IdentC } from "../../../brand/IdentC";
import { S1_FRAMES, SubscribeTag } from "../../../brand/Subscribe";
import { EndTags } from "./EndTags";
import { BUBBLES, SHOTS, TAGS, type Anchor } from "./shots";
import { BEDS, CARD, END, PEAK, SCORE, SUBSCRIBE } from "./sound";
import { Bubble, CastTag, TagStamp, TextBubble } from "./parts/util";

export type FilmProps = { timeline: Timeline; lines: ScriptLine[]; sources: Record<string, string> };

/** The one spoken line that starts with these words; none or two is an error, so a script edit can't silently shift a shot. */
export function lineOf(words: string, lines: ScriptLine[]): number {
  const exact = lines.flatMap((l, i) => (l.text === words ? [i] : []));
  const hits = exact.length ? exact : lines.flatMap((l, i) => (l.text.startsWith(words) ? [i] : []));
  if (hits.length !== 1) throw new Error(`shot anchor "${words}" matches ${hits.length} lines`);
  return hits[0];
}

export const frameOf = (a: Anchor, { clips }: Timeline, lines: ScriptLine[]) => {
  const c = clips[lineOf(a.line, lines)];
  return (a.edge === "end" ? c.from + c.frames : c.from) + (a.plus ?? 0);
};

/** The score's level (taste.md 2026-11-08): about 26 dB under the voice while it speaks, about 8 dB under in the
 *  holds; ducks ramp (core/studio/rules/no-audio-clicks.md). */
const UNDER_VOICE = 0.039;
const IN_HOLDS = 0.24;
const DUCK_IN = 8;
const DUCK_OUT = 18;
export function scoreVolume(frame: number, clips: Timeline["clips"]): number {
  let duck = 0;
  for (const c of clips) {
    const end = c.from + c.frames;
    if (frame >= c.from && frame < end) return UNDER_VOICE;
    if (frame < c.from && c.from - frame < DUCK_IN) duck = Math.max(duck, 1 - (c.from - frame) / DUCK_IN);
    if (frame >= end && frame - end < DUCK_OUT) duck = Math.max(duck, 1 - (frame - end) / DUCK_OUT);
  }
  return IN_HOLDS + (UNDER_VOICE - IN_HOLDS) * duck;
}

const Picture: React.FC<FilmProps> = ({ timeline, lines }) => {
  const frame = useCurrentFrame();
  if (useSoundOnly()) return null;
  const starts = SHOTS.map((s, i) => (i === 0 ? 0 : frameOf(s.at, timeline, lines)));
  let i = 0;
  for (let k = 0; k < starts.length; k++) if (frame >= starts[k]) i = k;
  const from = starts[i];
  const to = starts[i + 1] ?? timeline.totalFrames;
  const dur = Math.max(1, to - from);
  const t = { f: frame - from, dur, p: Math.min(1, (frame - from) / dur) };
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {SHOTS[i].draw(t)}
      <Finish />
    </AbsoluteFill>
  );
};

const Overlays: React.FC<FilmProps> = ({ timeline, lines }) => {
  const frame = useCurrentFrame();
  if (useSoundOnly()) return null;
  return (
    <>
      {TAGS.map((g, k) => {
        const at = frameOf(g.at, timeline, lines);
        const len = g.frames ?? (g.kind === "cast" ? 120 : 90);
        if (frame < at || frame >= at + len) return null;
        return g.kind === "label" ? <TagStamp key={k} text={g.text} f={frame - at} />
          : g.kind === "cast" ? <CastTag key={k} text={g.text} f={frame - at} />
          : <TextBubble key={k} text={g.text} f={frame - at} dot={g.dot} from={g.from} />;
      })}
      {BUBBLES.map((b, k) => {
        const at = frameOf(b.at, timeline, lines);
        return frame >= at && frame < at + (b.frames ?? 75) ? <Bubble key={k} text={b.text} x={b.x} y={b.y} f={frame - at} /> : null;
      })}
    </>
  );
};

/** A gain that rises over `fade` frames after `from` (at once at the film's start) and falls over `fade` frames to `to`. */
function windowGain(f: number, from: number, to: number, fade: number): number {
  const rise = from === 0 ? 1 : (f - from) / fade;
  return Math.max(0, Math.min(1, rise, (to - f) / fade));
}

/** A sound placed from `from` to `to` (film frames), starting `lead` frames early and crossfading over `fade`. */
const Placed: React.FC<{ src: string; from: number; to: number; lead: number; fade: number; total: number; gain: (f: number) => number }> = ({
  src, from, to, lead, fade, total, gain,
}) => {
  const start = Math.max(0, from - lead);
  const end = Math.min(total, to - lead + fade);
  return (
    <Sequence from={start} durationInFrames={Math.max(1, end - start)}>
      <Audio src={staticFile(src)} loop volume={(f) => windowGain(f + start, start, end, fade) * gain(f + start)} />
    </Sequence>
  );
};

export const Film: React.FC<FilmProps> = (props) => {
  const { timeline, lines } = props;
  const { clips, totalFrames } = timeline;
  if (!clips.length) return <AbsoluteFill style={{ background: "#000" }} />;
  const at = (a: Anchor) => frameOf(a, timeline, lines);
  const cardFrom = at(CARD);
  const subAt = at(SUBSCRIBE);
  const endAt = at(END);
  const peak = [at(PEAK.from), at(PEAK.to)] as const;
  const outro = (f: number) => Math.min(1, Math.max(0, (totalFrames - f) / 60));
  const peakDip = (f: number) => 1 - (1 - PEAK.floor) * Math.max(0, Math.min(1, (f - peak[0]) / FPS, (peak[1] - f) / FPS));
  const score = (f: number) => scoreVolume(f, clips) * peakDip(f) * outro(f);
  const bed = (f: number) => (0.4 + 0.6 * (scoreVolume(f, clips) - UNDER_VOICE) / (IN_HOLDS - UNDER_VOICE)) * outro(f);
  const scoreAt = SCORE.map((c) => at(c.at));
  const bedAt = BEDS.map((b) => at(b.at));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Picture {...props} />
      <Overlays {...props} />
      <Sequence from={cardFrom} durationInFrames={C_FRAMES}>
        <IdentC
          front={<Freeze frame={cardFrom - 2}><Picture {...props} /></Freeze>}
          back={<Freeze frame={cardFrom + C_FRAMES}><Picture {...props} /></Freeze>}
          title={["What if you fired", <>everyone and hired <Hi>AI</Hi>?</>]}
        />
      </Sequence>
      <Sequence from={subAt} durationInFrames={S1_FRAMES}>
        <SubscribeTag />
      </Sequence>
      <Sequence from={endAt} durationInFrames={Math.max(1, totalFrames - endAt)}>
        <EndTags comment={30} />
      </Sequence>
      <Audio src={staticFile("narration/narration.wav")} />
      {SCORE.map((c, i) => (
        <Placed key={`s${i}`} src={`music/${c.file}`} from={i === 0 ? 0 : scoreAt[i]} to={scoreAt[i + 1] ?? totalFrames + FPS}
          lead={FPS} fade={Math.round(1.5 * FPS)} total={totalFrames} gain={score} />
      ))}
      <Sequence from={peak[0]} durationInFrames={Math.max(1, peak[1] - peak[0] + 3 * FPS)}>
        <Audio src={staticFile("sfx/peak-note.wav")} volume={0.07} />
      </Sequence>
      {BEDS.map((b, i) => (
        <Placed key={`b${i}`} src={`sfx/bed-${b.name}.wav`} from={i === 0 ? 0 : bedAt[i]} to={bedAt[i + 1] ?? totalFrames + FPS}
          lead={Math.round(0.5 * FPS)} fade={Math.round(0.8 * FPS)} total={totalFrames} gain={bed} />
      ))}
    </AbsoluteFill>
  );
};
