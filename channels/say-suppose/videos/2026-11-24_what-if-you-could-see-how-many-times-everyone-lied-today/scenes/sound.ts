// The film's sound plan (G2 first cut, 2026-11-25): a score cue per section and an ambience bed per set, placed on
// script lines by their opening words, so a revised script re-times them. The cues and beds are the channel's own,
// made locally for earlier films (ACE-Step cues with a channel theme as reference, synthesised beds; rights in
// brand/music-rights.md); this film's own score is quoted at picture lock (studio-whatif-edit).
import type { Clip, ScriptLine } from "@whatif/kit/timeline";
import { FPS } from "@whatif/kit/theme";
import { findLine } from "./shared";

/** [first words of the line it starts on, file under assets/music/]. */
const SCORE: [string, string][] = [
  ["Boss: I fought", "theme-dark-thin.wav"],     // the frame: the channel's dark signal under the 47
  ["Leader: And I have never", "cues/crumbs.wav"], // the kitchen skit, the rule: comic
  ["A 2011 talk", "cues/wonder.wav"],             // zeros on the street and the bus
  ["Boss: Nobody's losing", "cues/hunt.wav"],     // the floor, set piece one
  ["Lunch. Your car's", "cues/boom.wav"],         // say it again: mechanics, the date
  ["Poker night.", "cues/crowd.wav"],             // poker, the clip, the morning show
  ["Two rows down.", "cues/awe.wav"],             // the stadium
  ["Tuesday. The floor's", "cues/unease.wav"],    // everybody texts
  ["Rival: A liar's nose", "cues/market.wav"],   // the rival
  ["So the network brings", "cues/hunt.wav"],     // the polygraph
  ["Flatmate: You never used", "cues/home.wav"],  // the dishes, the one tender beat
  ["Thursday. Eight o'clock.", "cues/dread.wav"], // the statement
  ["Host: Read it out loud.", "cues/resolve.wav"],// read it aloud
  ["Morning. Interviews", "cues/dawn.wav"],       // nine
  ["So, would you want", "theme-light.mp3"],      // the end card: the signal again
];

/** [first words of the line its set comes in on, bed name under assets/sfx/bed-<name>.wav]. */
const BEDS: [string, string][] = [
  ["Boss: I fought", "office"], ["Leader: And I have never", "kitchen"], ["A 2011 talk", "street-day"],
  ["The bus. Forty heads.", "bus"], ["In one US survey", "office"], ["Lunch. Your car's", "street"],
  ["Dusk. A first date.", "store"], ["Poker night.", "home"],
  ["Host: Ten out of ten.", "hall"], ["Two rows down.", "dock"], ["Tuesday. The floor's", "office"],
  ["Rival: A liar's nose", "hall"], ["Flatmate: You never used", "kitchen-lamp"],
  ["Thursday. Eight o'clock.", "hall"], ["Morning. Interviews", "kitchen"],
];

/** The wordless peak: the hold after the leader's line two. */
const PEAK_AFTER = "Click. One.";

export type SoundPlan = {
  score: { file: string; from: number; to: number }[];
  beds: [number, string][];
  peak: { from: number; to: number; floor: number };
};

export function soundPlan(clips: Clip[], lines: ScriptLine[], totalFrames: number): SoundPlan {
  let from = 0;
  const at = (prefix: string, k: number) => {
    if (k === 0) return 0;
    const i = findLine(lines, prefix, from);
    from = i;
    return clips[i].from / FPS;
  };
  const starts = SCORE.map(([p], k) => at(p, k));
  const score = SCORE.map(([, file], k) => ({ file, from: starts[k], to: starts[k + 1] ?? totalFrames / FPS }));
  from = 0;
  const beds = BEDS.map(([p, name], k): [number, string] => [at(p, k), name]);
  const p = findLine(lines, PEAK_AFTER);
  const next = clips[p + 1] ?? clips[p];
  return { score, beds, peak: { from: (clips[p].from + clips[p].frames) / FPS, to: next.from / FPS, floor: 0.1 } };
}
