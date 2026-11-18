// Part B's check (not part of the film): one still per frame, each a 3x3 contact sheet of part B's shots at a film
// frame (the shot drawn with its tags and bubbles, at a third of its size), so few renders cover every shot. Frames are
// the middle of each shot unless `frames` is given in the props. Render with --props=<video>/assets/narration/props.json
// (plus "frames") and `npx remotion still ... BCheck --frame=<sheet>`.
import { AbsoluteFill, Composition, useCurrentFrame, type CalculateMetadataFunction } from "remotion";
import type { ScriptLine, Timeline } from "@whatif/kit/timeline";
import { Finish } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { FPS, HEIGHT, WIDTH } from "@whatif/kit/theme";
import { BUBBLES_B, SHOTS_B, TAGS_B } from "../../../shots/b";
import { S, type Anchor } from "../../../shotTypes";
import { Bubble, CastTag, TagStamp } from "../../util";

type Props = { timeline: Timeline; lines: ScriptLine[]; sources: Record<string, string>; frames?: number[] };

function lineOf(words: string, lines: ScriptLine[]): number {
  const exact = lines.flatMap((l, i) => (l.text === words ? [i] : []));
  const hits = exact.length ? exact : lines.flatMap((l, i) => (l.text.startsWith(words) ? [i] : []));
  if (hits.length !== 1) throw new Error(`anchor "${words}" matches ${hits.length} lines`);
  return hits[0];
}
const frameOf = (a: Anchor, { clips }: Timeline, lines: ScriptLine[]) => {
  const c = clips[lineOf(a.line, lines)];
  return (a.edge === "end" ? c.from + c.frames : c.from) + (a.plus ?? 0);
};

function framesOf(p: Props): number[] {
  if (p.frames?.length) return p.frames;
  const starts = SHOTS_B.map((s) => frameOf(s.at, p.timeline, p.lines));
  const end = frameOf(S("So you give the money back."), p.timeline, p.lines);
  return starts.map((s, i) => s + Math.floor(((starts[i + 1] ?? end) - s) * 0.6));
}

const Panel: React.FC<Props & { frame: number; k: number }> = ({ frame, k, timeline, lines }) => {
  const starts = SHOTS_B.map((s) => frameOf(s.at, timeline, lines));
  const end = frameOf(S("So you give the money back."), timeline, lines);
  let i = -1;
  for (let j = 0; j < starts.length; j++) if (frame >= starts[j]) i = j;
  if (i < 0 || frame >= end) return null;
  const to = starts[i + 1] ?? end;
  const t = { f: frame - starts[i], dur: to - starts[i], p: Math.min(1, (frame - starts[i]) / (to - starts[i])) };
  return (
    <div style={{ position: "absolute", left: (k % 3) * 640, top: Math.floor(k / 3) * 360, width: WIDTH, height: HEIGHT, transform: "scale(0.3333)",
      transformOrigin: "0 0", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "#000" }}>
        {SHOTS_B[i].draw(t)}
        <Finish />
        {TAGS_B.map((g, n) => {
          const at = frameOf(g.at, timeline, lines);
          const len = g.frames ?? (g.kind === "cast" ? 120 : 90);
          if (frame < at || frame >= at + len) return null;
          return g.kind === "cast" ? <CastTag key={n} text={g.text} f={frame - at} /> : <TagStamp key={n} text={g.text} f={frame - at} />;
        })}
        {BUBBLES_B.map((b, n) => {
          const at = frameOf(b.at, timeline, lines);
          return frame >= at && frame < at + (b.frames ?? 75) ? <Bubble key={n} text={b.text} x={b.x} y={b.y} f={frame - at} /> : null;
        })}
        <div style={{ position: "absolute", right: 20, bottom: 14, background: "#fff", padding: "4px 14px", fontFamily: FONT, fontSize: 40, borderRadius: 8 }}>
          {`#${i} · ${frame}`}
        </div>
      </AbsoluteFill>
    </div>
  );
};

const Sheet: React.FC<Props & { sheet: number }> = (p) => {
  const all = framesOf(p);
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      {all.slice(p.sheet * 9, p.sheet * 9 + 9).map((f, k) => <Panel key={k} {...p} frame={f} k={k} />)}
    </AbsoluteFill>
  );
};

const Check: React.FC<Props> = (p) => <Sheet {...p} sheet={useCurrentFrame()} />;

const meta: CalculateMetadataFunction<Props> = ({ props }) => ({
  durationInFrames: Math.max(1, Math.ceil((props.timeline.clips.length ? framesOf(props).length : 1) / 9)),
});

const placeholder: Props = { timeline: { totalFrames: 60, clips: [], cues: {} }, lines: [], sources: {} };

export const Root: React.FC = () => (
  <Composition id="BCheck" component={Check} defaultProps={placeholder} calculateMetadata={meta} durationInFrames={1} fps={FPS} width={WIDTH} height={HEIGHT} />
);
