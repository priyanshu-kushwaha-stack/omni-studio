/** The film's sound plan in seconds (cues.yaml is the intent; this is where it plays). Placeholder: the light theme
 *  under the whole film until the cues are made (make_music.py) and the beds (make_ambience.py). */

/** One score cue per section;  is under assets/music/. */
export const SCORE: { file: string; from: number; to: number }[] = [{ file: "theme-light.mp3", from: 0, to: 9999 }];

/** The key's wordless peak: the score drops to a floor and one held note plays. Set from props.json. */
export const PEAK = { from: 9998, to: 9999, floor: 0.1 };

/** Ambience beds (assets/sfx/bed-<name>.wav), each from its start to the next one's. */
export const BEDS: [number, string][] = [];
