// Part C's check: one still per frame, four film frames of part C side by side (2 x 2), each drawn from SHOTS_C at its
// own time with part C's label tags, so a handful of stills shows many shots. Not part of the film. Render with
// --props='{"pages":[[f,f,f,f],...],"timeline":...,"lines":...}' (see the builder's notes); frame k draws pages[k].
import { AbsoluteFill, Composition, useCurrentFrame } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import type { ScriptLine, Timeline } from "@whatif/kit/timeline";
import { Finish } from "@whatif/kit/stage/Stage";
import { FPS, HEIGHT, WIDTH } from "@whatif/kit/theme";
import { frameOf } from "../../../Film";
import { SHOTS_C, TAGS_C } from "../../../shots/c";
import { TagStamp } from "../../util";

type Props = { pages: number[][]; timeline: Timeline; lines: ScriptLine[] };

const Panel: React.FC<{ F: number; timeline: Timeline; lines: ScriptLine[] }> = ({ F, timeline, lines }) => {
  const starts = SHOTS_C.map((s) => frameOf(s.at, timeline, lines));
  let i = 0;
  for (let k = 0; k < starts.length; k++) if (F >= starts[k]) i = k;
  const from = starts[i];
  const to = starts[i + 1] ?? timeline.totalFrames;
  const dur = Math.max(1, to - from);
  const t = { f: F - from, dur, p: Math.min(1, (F - from) / dur) };
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {SHOTS_C[i].draw(t)}
      <Finish />
      {TAGS_C.map((g, k) => {
        const at = frameOf(g.at, timeline, lines);
        const len = g.frames ?? 90;
        return F >= at && F < at + len ? <TagStamp key={k} text={g.text} f={F - at} /> : null;
      })}
      <div style={{ position: "absolute", left: 16, bottom: 12, background: "#fff", color: "#000", fontFamily: FONT, fontSize: 40, padding: "2px 12px", borderRadius: 8 }}>
        {`#${i} f${F} (+${F - from}/${dur})`}
      </div>
    </AbsoluteFill>
  );
};

const Grid: React.FC<Props> = ({ pages, timeline, lines }) => {
  const k = useCurrentFrame();
  const page = pages[k] ?? [];
  return (
    <AbsoluteFill style={{ background: "#222" }}>
      {page.map((F, j) => (
        <div key={j} style={{ position: "absolute", left: (j % 2) * 960, top: Math.floor(j / 2) * 540, width: 1920, height: 1080, transform: "scale(0.5)", transformOrigin: "0 0" }}>
          <Panel F={F} timeline={timeline} lines={lines} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

export const Root: React.FC = () => (
  <Composition id="CGrid" component={Grid} durationInFrames={20} fps={FPS} width={WIDTH} height={HEIGHT}
    defaultProps={{ pages: [], timeline: { totalFrames: 60, clips: [], cues: {} }, lines: [] } as Props} />
);
