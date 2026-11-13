// The doubled-money first cut (script v3, the character voices): the shot under the playhead, the channel's title card after the hook, a
// paper subscribe tag at the street party, the script's tags, bubbles and name tags, the narration and a score cue per section. Render
// with --props=<video>/assets/narration/props.json --public-dir=<video>/assets.
import { AbsoluteFill, Audio, Freeze, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { ScriptLine, Timeline } from "@whatif/kit/timeline";
import { Finish } from "@whatif/kit/stage/Stage";
import { useSoundOnly } from "@whatif/kit/sound";
import { C_FRAMES, Hi, IdentC } from "../../../brand/IdentC";
import { S1_FRAMES, SubscribeTag } from "../../../brand/Subscribe";
import { EndTags } from "./EndTags";
import { BUBBLES, NAMES, SHOTS, TAGS, type Anchor } from "./shots";
import { Bubble, TagStamp } from "./parts/util";
import { NameTag } from "./parts/cast";
import { SCORE } from "./sound";

export type FilmProps = { timeline: Timeline; lines: ScriptLine[]; sources: Record<string, string> };

/** The one spoken line that starts with these words; none or two is an error, so a script edit can't silently shift a shot. */
export function lineOf(words: string, lines: ScriptLine[]): number {
  const hits = lines.flatMap((l, i) => (l.text.startsWith(words) ? [i] : []));
  if (hits.length !== 1) throw new Error(`shot anchor "${words}" matches ${hits.length} lines`);
  return hits[0];
}

const frameOf = (a: Anchor, { clips }: Timeline, lines: ScriptLine[]) => {
  const c = clips[lineOf(a.line, lines)];
  return (a.edge === "end" ? c.from + c.frames : c.from) + (a.plus ?? 0);
};

// Music under the voice and up in the holds (style.md); the owner's G5 levels from the pause film.
const UNDER_VOICE = 0.039;
const IN_HOLDS = 0.22;
const DUCK_IN = 8;
const DUCK_OUT = 18;
/** The one planned silence fades out and back over SILENCE_FADE frames, so it is never a step. */
const SILENCE_FADE = 12;
export function scoreVolume(frame: number, clips: Timeline["clips"], silent: [number, number]): number {
  const quiet = Math.max(0, Math.min(1, (frame - silent[0]) / SILENCE_FADE, (silent[1] - frame) / SILENCE_FADE));
  if (quiet >= 1) return 0;
  return (1 - quiet) * duckVolume(frame, clips);
}
function duckVolume(frame: number, clips: Timeline["clips"]): number {
  let duck = 0;
  for (const c of clips) {
    const end = c.from + c.frames;
    if (frame >= c.from && frame < end) return UNDER_VOICE;
    if (frame < c.from && c.from - frame < DUCK_IN) duck = Math.max(duck, 1 - (c.from - frame) / DUCK_IN);
    if (frame >= end && frame - end < DUCK_OUT) duck = Math.max(duck, 1 - (frame - end) / DUCK_OUT);
  }
  return IN_HOLDS + (UNDER_VOICE - IN_HOLDS) * duck;
}

/** Each cue comes in LEAD frames before its section and crosses the one before it over FADE frames (rules/sound.md #7). */
const LEAD = 30;
const FADE = 45;
const Placed: React.FC<{ src: string; start: number; end: number; gain: (f: number) => number }> = ({ src, start, end, gain }) => {
  const a = Math.max(0, start - LEAD);
  const b = end - LEAD + FADE;
  const w = (f: number) => Math.max(0, Math.min(1, a === 0 ? 1 : (f - a) / FADE, (b - f) / FADE));
  return (
    <Sequence from={a} durationInFrames={Math.max(1, b - a)}>
      <Audio src={staticFile(src)} loop volume={(f) => w(f + a) * gain(f + a)} />
    </Sequence>
  );
};

const Picture: React.FC<FilmProps> = ({ timeline, lines }) => {
  const frame = useCurrentFrame();
  const soundOnly = useSoundOnly();
  if (soundOnly) return null;
  const { totalFrames } = timeline;
  const starts = SHOTS.map((s, i) => (i === 0 ? 0 : frameOf(s.at, timeline, lines)));
  let i = 0;
  for (let k = 0; k < starts.length; k++) if (frame >= starts[k]) i = k;
  const from = starts[i];
  const to = starts[i + 1] ?? totalFrames;
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
        const len = g.frames ?? 120;
        return frame >= at && frame < at + len ? <TagStamp key={k} text={g.text} f={frame - at} /> : null;
      })}
      {NAMES.map((n, k) => {
        const at = frameOf(n.at, timeline, lines);
        const len = n.frames ?? 40;
        return frame >= at && frame < at + len
          ? <NameTag key={`n${k}`} name={n.name} role={n.role} x={n.x} y={n.y} side={n.side} f={frame - at} len={len} /> : null;
      })}
      {BUBBLES.map((b, k) => {
        const at = frameOf(b.at, timeline, lines);
        return frame >= at && frame < at + (b.frames ?? 90) ? <Bubble key={k} text={b.text} x={b.x} y={b.y} f={frame - at} /> : null;
      })}
    </>
  );
};

export const Film: React.FC<FilmProps> = (props) => {
  const { timeline, lines } = props;
  const { clips, totalFrames } = timeline;
  if (!clips.length) return <AbsoluteFill style={{ background: "#000" }} />;
  const at = (line: string, edge: "start" | "end", plus = 0) => frameOf({ line, edge, plus }, timeline, lines);
  // The title card after the premise; the subscribe tag at the party; the one planned silence at the glass door.
  const cardFrom = at("Every night. Whatever's", "end");
  const partyAt = at("Jonas: Who are all", "start", 60);
  const silent: [number, number] = [at("You count. One cent.", "end"), at("Zero, doubled", "start")];
  const endAt = at("So, would you have erased", "end");
  const cues = [...SCORE.map((c) => ({ file: c.file, start: c.from ? at(c.from, "start") : 0 })), { file: "theme-light.mp3", start: endAt }];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Picture {...props} />
      <Overlays {...props} />
      <Sequence from={cardFrom} durationInFrames={C_FRAMES}>
        <IdentC
          front={<Freeze frame={cardFrom - 2}><Picture {...props} /></Freeze>}
          back={<Freeze frame={cardFrom + C_FRAMES}><Picture {...props} /></Freeze>}
          title={["What if you doubled", <>your money <Hi>every day</Hi>?</>]}
        />
      </Sequence>
      <Sequence from={partyAt} durationInFrames={S1_FRAMES}>
        <SubscribeTag />
      </Sequence>
      <Sequence from={endAt} durationInFrames={Math.max(1, totalFrames - endAt)}>
        <EndTags comment={30} />
      </Sequence>
      <Audio src={staticFile("narration/narration.wav")} />
      {cues.map((c, i) => (
        <Placed key={c.file + i} src={`music/${c.file}`} start={c.start} end={cues[i + 1]?.start ?? totalFrames + LEAD}
          gain={(f) => scoreVolume(f, clips, silent) * Math.min(1, (totalFrames - f) / 60)} />
      ))}
    </AbsoluteFill>
  );
};
