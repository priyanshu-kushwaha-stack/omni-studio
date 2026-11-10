import { createContext, useContext } from "react";

/** True inside a video's sound composition (the audio pass, G4/G5 speed-ups plan): Stage (the whole world: sets,
 *  figures, light), Figure, PauseBars and Finish render nothing, so Remotion walks a near-empty tree for the <Audio>
 *  elements. Sounds must sit outside <Stage> and <Figure>. */
export const SoundOnly = createContext(false);
export const useSoundOnly = () => useContext(SoundOnly);
