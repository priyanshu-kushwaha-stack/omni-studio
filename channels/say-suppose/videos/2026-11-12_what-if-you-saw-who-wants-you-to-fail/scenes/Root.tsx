import { Composition, type CalculateMetadataFunction } from "remotion";
import { SoundOnly } from "@whatif/kit/sound";
import { FPS, HEIGHT, WIDTH } from "@whatif/kit/theme";
import { Film, type FilmProps } from "./Film";

const calculateMetadata: CalculateMetadataFunction<FilmProps> = ({ props }) => ({
  durationInFrames: props.timeline.totalFrames,
});

const placeholder: FilmProps = { timeline: { totalFrames: 60, clips: [], cues: {} }, lines: [], sources: {} };

/** The film's sound alone: the same tree with Stage, Figure and Finish drawing nothing (kit/sound.ts). */
const FilmSound: React.FC<FilmProps> = (props) => (
  <SoundOnly.Provider value={true}>
    <Film {...props} />
  </SoundOnly.Provider>
);

/** Render with --props=<video>/assets/narration/props.json --public-dir=<video>/assets. */
export const Root: React.FC = () => (
  <>
    <Composition id="RoughCut" component={Film} defaultProps={placeholder} calculateMetadata={calculateMetadata}
      durationInFrames={60} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="RoughCutSound" component={FilmSound} defaultProps={placeholder} calculateMetadata={calculateMetadata}
      durationInFrames={60} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
