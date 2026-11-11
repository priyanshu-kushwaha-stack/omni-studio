import { Composition, type CalculateMetadataFunction } from "remotion";
import { FPS, HEIGHT, WIDTH } from "@whatif/kit/theme";
import { SoundOnly } from "@whatif/kit/sound";
import { Film, type FilmProps } from "./Film";

const calculateMetadata: CalculateMetadataFunction<FilmProps> = ({ props }) => ({
  durationInFrames: props.timeline.totalFrames,
});

const placeholder: FilmProps = { timeline: { totalFrames: 60, clips: [], cues: {} }, lines: [], sources: {} };

const FilmSound: React.FC<FilmProps> = (p) => (
  <SoundOnly.Provider value={true}><Film {...p} /></SoundOnly.Provider>
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

/** A proof sheet for checking frames from one bundle: frame i of "Proof" shows film frame props.proof[i]. Render with
 *  --sequence. Not part of the film. */
import { useCurrentFrame } from "remotion";
import { PictureAt } from "./Film";
type ProofProps = FilmProps & { proof?: number[] };
const ProofFrame: React.FC<ProofProps> = (p) => {
  const i = useCurrentFrame();
  const list = p.proof ?? [0];
  return <PictureAt {...p} at={list[Math.min(i, list.length - 1)]} />;
};
export const ProofRoot: React.FC = () => (
  <Composition id="Proof" component={ProofFrame} defaultProps={{ ...placeholder, proof: [0] }}
    calculateMetadata={({ props }) => ({ durationInFrames: (props.proof ?? [0]).length })}
    durationInFrames={1} fps={FPS} width={WIDTH} height={HEIGHT} />
);
