// The counter's click (assets/sfx/click.wav), at every click the script names (clickData.ts, from make_clicks.py).
// Outside the Stage, so the sound composition keeps it. About 14 dB under the voice; a "soft click" softer.
import { Audio, Sequence, staticFile } from "remotion";
import type { Clip, ScriptLine } from "@whatif/kit/timeline";
import { FPS } from "@whatif/kit/theme";
import { CLICKS } from "./clickData";
import { findLine } from "./shared";

const LEVEL = 0.35;

export const Clicks: React.FC<{ clips: Clip[]; lines: ScriptLine[] }> = ({ clips, lines }) => {
  let from = 0;
  const frames: { f: number; soft: boolean }[] = [];
  for (const c of CLICKS) {
    let i: number;
    try { i = findLine(lines, (c.after ?? c.on)!, from); } catch { continue; }
    from = i;
    const base = c.after ? clips[i].from + clips[i].frames : clips[i].from - 3;
    for (const s of c.at) frames.push({ f: Math.max(0, Math.round(base + s * FPS)), soft: !!c.soft });
  }
  return (
    <>
      {frames.map(({ f, soft }, k) => (
        <Sequence key={k} from={f} durationInFrames={6}>
          <Audio src={staticFile("sfx/click.wav")} volume={soft ? LEVEL * 0.6 : LEVEL} />
        </Sequence>
      ))}
    </>
  );
};
