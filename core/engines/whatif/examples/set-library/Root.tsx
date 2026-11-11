import { AbsoluteFill, Composition, useCurrentFrame } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import { SETS, SetScene } from "@whatif/kit/sets";
import { MOODS, type MoodName } from "@whatif/kit/stage/moods";
import { Finish } from "@whatif/kit/stage/Stage";
import { FPS, HEIGHT, INK, PAPER, WIDTH } from "@whatif/kit/theme";

/** Frame n is mood n: morning, day, dusk, night, lamp, frozen. */
export const MOOD_ORDER = Object.keys(MOODS) as MoodName[];

export type LibraryProps = { set: string };

/** One set's example composition in the mood of the frame, with a small label for the contact sheet. Render frames 0-5
 *  with whatif_stills and the props {"set": "<name>"}. */
export const SetPreview: React.FC<LibraryProps> = ({ set }) => {
  const frame = useCurrentFrame();
  const def = SETS[set];
  if (!def) throw new Error(`no set ${set}: ${Object.keys(SETS).join(", ")}`);
  const mood = MOOD_ORDER[frame % MOOD_ORDER.length];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <SetScene set={def} mood={mood} frame={frame * 7} />
      <Finish />
      <div style={{ position: "absolute", left: 28, top: 24, padding: "6px 18px", background: PAPER, color: INK, borderRadius: 8,
        fontFamily: FONT, fontSize: 34, fontWeight: 800, opacity: 0.92 }}>{set} · {mood}</div>
    </AbsoluteFill>
  );
};

export const Root: React.FC = () => (
  <Composition id="SetLibrary" component={SetPreview} defaultProps={{ set: "metro-platform" }}
    durationInFrames={MOOD_ORDER.length} fps={FPS} width={WIDTH} height={HEIGHT} />
);
