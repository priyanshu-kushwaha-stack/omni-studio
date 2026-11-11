// The sixty-seconds first cut: every shot anchored to a narration line (or the end of one, for holds), lit by its
// line's mood, with the narration and a light music bed under it.
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import type { Clip, ScriptLine, Timeline } from "@whatif/kit/timeline";
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook, type MoodName } from "@whatif/kit/stage/moods";
import { Finish } from "@whatif/kit/stage/Stage";
import { FPS } from "@whatif/kit/theme";
import * as A1 from "./act1";
import * as A2 from "./act2";
import * as A3 from "./act3";
import { makeS, type S } from "./shared";

type Start = (c: Clip[]) => number;
const L = (i: number): Start => (c) => c[i].from;
const E = (i: number, sec = 0): Start => (c) => c[i].from + c[i].frames + Math.round(sec * FPS);

/** The shot list, in film order (script.md's > SCENE lines). */
const SHOTS: [Start, React.FC<{ s: S }>][] = [
  [() => 0, A1.Click], [L(3), A1.StillThere],
  [L(6), A1.StreetWide], [L(7), A1.Pour], [L(8), A1.Step], [L(10), A1.Rub], [L(11), A1.Gift], [L(13), A1.Laugh],
  [E(13, 3), A1.BusGap], [L(14), A1.Catch],
  [L(17), A1.CanteenSix], [L(21), A1.Pitch], [L(23), A1.Alone], [L(25), A1.BossDots],
  [E(27, 1.5), A1.PlatformWide], [L(29), A1.Seat],
  [L(31), A2.Reflection], [L(34), A2.FlashLag],
  [L(37), A2.GrandpaStory], [L(43), A2.MomKitchen],
  [L(48), A2.CoinToss], [L(51), A2.Cards], [L(54), A2.Roulette], [L(56), A2.AloneTable],
  [L(57), A2.Finishing], [E(58), A2.Doubling], [L(59), A2.PanKnock], [L(62), A2.Rumour],
  [L(64), A3.Early], [E(67), A3.Doorway],
  [L(69), A3.Steer], [E(74), A3.Peak],
  [L(75), A3.Brake], [L(77), A3.Lorenz],
  [L(80), A3.Choice], [L(82), A3.Turn],
  [L(87), A3.BusStop], [E(90, 2), A3.EndCard],
];

// Music sits low under the voice and rises a little in the holds (style.md; taste.md 2026-11-08: about 26 dB under
// speech, light, through the whole film). A first-cut level; the owner sets the real one by ear at the picture lock.
const UNDER_VOICE = 0.05;
const IN_HOLDS = 0.22;
const DUCK = 12;
export function bedVolume(frame: number, clips: { from: number; frames: number }[]): number {
  let duck = 0;
  for (const c of clips) {
    const end = c.from + c.frames;
    if (frame >= c.from && frame < end) return UNDER_VOICE;
    if (frame < c.from && c.from - frame < DUCK) duck = Math.max(duck, 1 - (c.from - frame) / DUCK);
    if (frame >= end && frame - end < DUCK) duck = Math.max(duck, 1 - (frame - end) / DUCK);
  }
  return IN_HOLDS + (UNDER_VOICE - IN_HOLDS) * duck;
}

export type FilmProps = { timeline: Timeline; lines: ScriptLine[]; sources: Record<string, string> };

/** The picture alone at a given film frame, for the proof sheet. */
export const PictureAt: React.FC<FilmProps & { at: number }> = (p) => <Picture {...p} />;

const Picture: React.FC<FilmProps & { at?: number }> = ({ timeline, lines, at }) => {
  const now = useCurrentFrame();
  const frame = at ?? now;
  const { clips, totalFrames } = timeline;
  const starts = SHOTS.map(([st]) => st(clips));
  let k = 0;
  for (let i = 0; i < starts.length; i++) if (frame >= starts[i]) k = i;
  const to = starts[k + 1] ?? totalFrames;
  const Shot = SHOTS[k][1];
  let li = 0;
  for (let i = 0; i < clips.length; i++) if (frame >= clips[i].from) li = i;
  const mood = (lines[li]?.mood ?? "night") as MoodName;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <LookContext.Provider value={moodLook(mood)}>
        <Shot s={makeS(frame, starts[k], to, clips)} />
      </LookContext.Provider>
      <Finish />
    </AbsoluteFill>
  );
};

export const Film: React.FC<FilmProps> = (props) => {
  const { clips } = props.timeline;
  if (!clips.length) return <AbsoluteFill style={{ background: "#000" }} />;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Picture {...props} />
      <Audio src={staticFile("narration/narration.wav")} />
      <Audio src={staticFile("music/bed.mp3")} loop volume={(f) => bedVolume(f, clips)} />
    </AbsoluteFill>
  );
};
