import { AbsoluteFill, Composition, useCurrentFrame } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import { MOOD_NAMES, SETS, SetScene } from "@whatif/kit/sets";
import { Finish } from "@whatif/kit/stage/Stage";
import { FPS, HEIGHT, INK, PAPER, WIDTH } from "@whatif/kit/theme";

type LibraryProps = { set: string };

/** One set's example composition in the mood of the frame, with a small label for the contact sheet. Render frames 0-5
 *  with whatif_stills and the props {"set": "<name>"}: frame n is mood n (morning, day, dusk, night, lamp, frozen). */
export const SetPreview: React.FC<LibraryProps> = ({ set }) => {
  const frame = useCurrentFrame();
  const def = SETS[set];
  if (!def) throw new Error(`no set ${set}: ${Object.keys(SETS).join(", ")}`);
  const mood = MOOD_NAMES[frame % MOOD_NAMES.length];
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
    durationInFrames={MOOD_NAMES.length} fps={FPS} width={WIDTH} height={HEIGHT} />
);
