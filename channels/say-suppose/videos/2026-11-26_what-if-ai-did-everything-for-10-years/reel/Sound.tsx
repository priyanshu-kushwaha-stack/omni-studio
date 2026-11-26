// The reel's sound: the narration (already mixed and click-checked) over one music bed, ducked under speech.
// theme-dark for the storm, the night and Year 10, theme-light for the bright years, crossfading on section starts.
// The planned silence at the blackout is full silence: the music cuts when "Echo: Pump four's bearing is a little w…"
// ends, and from "You: Echo?" until "Echo: Okay. What do you think?" there is only a quiet synthesized wind; the light
// theme comes back on Echo's question. Every music edge fades over 4 frames or more (no clicks). The beds are long
// seamless files made by prep_sound.sh (assets/reel/music, assets/reel/sfx).
import { Audio, Sequence, staticFile } from "remotion";
import type { ScriptLine, Timeline } from "@whatif/kit/timeline";
import { clamp01, type ReelProps } from "./data";

const XF = 45; // section crossfade
const CUT = 4; // the fade into the planned silence (133 ms)
const OUTRO = 60;

/** The first line at or after `after` that equals or starts with `words`. */
function lineOf(words: string, lines: ScriptLine[], after = 0): number {
  for (let i = after; i < lines.length; i++) if (lines[i].text === words || lines[i].text.startsWith(words)) return i;
  throw new Error(`sound anchor "${words}" matches no line after ${after}`);
}

/** The score's level: about 28 dB under the voice while it speaks, about 12 dB under in the holds; ducks ramp. */
const UNDER_VOICE = 0.039;
const IN_HOLDS = 0.24;
function duck(frame: number, clips: Timeline["clips"]): number {
  let d = 0;
  for (const c of clips) {
    const end = c.from + c.frames;
    if (frame >= c.from && frame < end) return UNDER_VOICE;
    if (frame < c.from && c.from - frame < 8) d = Math.max(d, 1 - (c.from - frame) / 8);
    if (frame >= end && frame - end < 18) d = Math.max(d, 1 - (frame - end) / 18);
  }
  return IN_HOLDS + (UNDER_VOICE - IN_HOLDS) * d;
}

interface Seg { src: string; from: number; to: number; fadeIn: number; fadeOut: number; gain: number; ducked: boolean }

/** Equal-power edges: rising over fadeIn frames from `from`, falling over fadeOut frames to `to`. */
function edge(f: number, s: Seg): number {
  const rise = s.fadeIn ? clamp01((f - s.from) / s.fadeIn) : 1;
  const fall = s.fadeOut ? clamp01((s.to - f) / s.fadeOut) : 1;
  return Math.sin((Math.PI / 2) * Math.min(rise, fall));
}

export function soundPlan({ clips, totalFrames }: Timeline, lines: ScriptLine[]): Seg[] {
  const S = (i: number) => clips[i].from;
  const E = (i: number) => clips[i].from + clips[i].frames;
  const y2041 = lineOf("Echo: Good morning. Forty emails", lines);
  const y10 = lineOf("A plan, for the whole city.", lines, y2041);
  const pump = lineOf("Echo: Pump four's bearing is a little w", lines, y10);
  const echo = lineOf("You: Echo?", lines, pump);
  const back = lineOf("Echo: Okay. What do you think?", lines, echo);
  const h = XF / 2;
  const m = (src: string, from: number, to: number, fadeIn: number, fadeOut: number): Seg => ({
    src, from, to, fadeIn, fadeOut, gain: 1, ducked: true,
  });
  return [
    m("reel/music/dark.wav", 0, S(y2041) + h, 6, XF),
    m("reel/music/light.wav", S(y2041) - h, S(y10) + h, XF, XF),
    m("reel/music/dark.wav", S(y10) - h, E(pump), XF, CUT),
    { src: "reel/sfx/wind.wav", from: S(echo), to: S(back) + h, fadeIn: 15, fadeOut: XF, gain: 0.5, ducked: false },
    m("reel/music/light.wav", S(back) - h, totalFrames, XF, OUTRO),
  ];
}

export const ReelSound: React.FC<ReelProps> = ({ timeline, lines }) => {
  if (!timeline.clips.length) return null;
  const plan = soundPlan(timeline, lines);
  return (
    <>
      <Audio src={staticFile("narration/narration.wav")} />
      {plan.map((s, k) => (
        <Sequence key={k} from={s.from} durationInFrames={Math.max(1, s.to - s.from)}>
          <Audio src={staticFile(s.src)} loop
            volume={(f) => s.gain * edge(f + s.from, s) * (s.ducked ? duck(f + s.from, timeline.clips) : 1)} />
        </Sequence>
      ))}
    </>
  );
};
