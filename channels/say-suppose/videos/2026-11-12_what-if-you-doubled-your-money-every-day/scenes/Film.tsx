// The doubled-money first cut (G2 drop 2): the shot under the playhead, the channel's title card after the hook, a
// paper subscribe tag at the street party, the script's tags and bubbles, the narration and the music bed. Render
// with --props=<video>/assets/narration/props.json --public-dir=<video>/assets.
import { AbsoluteFill, Audio, Freeze, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { ScriptLine, Timeline } from "@whatif/kit/timeline";
import { Finish } from "@whatif/kit/stage/Stage";
import { useSoundOnly } from "@whatif/kit/sound";
import { C_FRAMES, Hi, IdentC } from "../../../brand/IdentC";
import { S1_FRAMES, SubscribeTag } from "../../../brand/Subscribe";
import { EndTags } from "./EndTags";
import { BUBBLES, SHOTS, TAGS, type Anchor } from "./shots";
import { Bubble, TagStamp } from "./parts/util";

export type FilmProps = { timeline: Timeline; lines: ScriptLine[]; sources: Record<string, string> };

const frameOf = (a: Anchor, clips: Timeline["clips"]) => {
  const c = clips[a.line];
  return (a.edge === "end" ? c.from + c.frames : c.from) + (a.plus ?? 0);
};

// Music under the voice and up in the holds (style.md); the owner's G5 levels from the pause film.
const UNDER_VOICE = 0.039;
const IN_HOLDS = 0.22;
const DUCK_IN = 8;
const DUCK_OUT = 18;
export function scoreVolume(frame: number, clips: Timeline["clips"], silent: [number, number]): number {
  if (frame >= silent[0] && frame < silent[1]) return 0;
  let duck = 0;
  for (const c of clips) {
    const end = c.from + c.frames;
    if (frame >= c.from && frame < end) return UNDER_VOICE;
    if (frame < c.from && c.from - frame < DUCK_IN) duck = Math.max(duck, 1 - (c.from - frame) / DUCK_IN);
    if (frame >= end && frame - end < DUCK_OUT) duck = Math.max(duck, 1 - (frame - end) / DUCK_OUT);
  }
  return IN_HOLDS + (UNDER_VOICE - IN_HOLDS) * duck;
}

const Picture: React.FC<FilmProps> = ({ timeline }) => {
  const frame = useCurrentFrame();
  const soundOnly = useSoundOnly();
  if (soundOnly) return null;
  const { clips, totalFrames } = timeline;
  const starts = SHOTS.map((s, i) => (i === 0 ? 0 : frameOf(s.at, clips)));
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

const Overlays: React.FC<FilmProps> = ({ timeline }) => {
  const frame = useCurrentFrame();
  if (useSoundOnly()) return null;
  const { clips } = timeline;
  return (
    <>
      {TAGS.map((g, k) => {
        const at = frameOf(g.at, clips);
        const len = g.frames ?? 120;
        return frame >= at && frame < at + len ? <TagStamp key={k} text={g.text} f={frame - at} /> : null;
      })}
      {BUBBLES.map((b, k) => {
        const at = frameOf(b.at, clips);
        return frame >= at && frame < at + (b.frames ?? 90) ? <Bubble key={k} text={b.text} x={b.x} y={b.y} f={frame - at} /> : null;
      })}
    </>
  );
};

export const Film: React.FC<FilmProps> = (props) => {
  const { clips, totalFrames } = props.timeline;
  if (!clips.length) return <AbsoluteFill style={{ background: "#000" }} />;
  const cardFrom = clips[9].from + clips[9].frames;
  const partyAt = clips[27].from + 60;
  const silent: [number, number] = [clips[81].from + clips[81].frames, clips[82].from];
  const endAt = clips[88].from + clips[88].frames;
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
      <Audio src={staticFile("music/theme-dark.mp3")} loop volume={(f) => scoreVolume(f, clips, silent)} />
    </AbsoluteFill>
  );
};
