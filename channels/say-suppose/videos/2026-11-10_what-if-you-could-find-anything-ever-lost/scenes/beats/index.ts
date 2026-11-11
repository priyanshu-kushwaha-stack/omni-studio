import { endScenes, platformScenes } from "./Platform";
import { homeScenes, lunchAgainScenes } from "./Home";
import { receiptScenes, streetScenes } from "./Street";
import { fortuneScenes, treasureScenes } from "./Treasure";
import { choiceScenes, roofScenes, tulsiScenes } from "./Late";
import type { Beat } from "../shared";

/** The film's scenes in script order: one per `> SCENE:` line (the power cut and the gate share one), plus the
 *  wordless peak. Each starts when the spoken line `after` ends, or on line `atLine`'s first frame. */
export const BEATS: Beat[] = [
  ...platformScenes, ...homeScenes, ...streetScenes, ...treasureScenes, ...receiptScenes, ...fortuneScenes,
  ...lunchAgainScenes, ...tulsiScenes, ...roofScenes, ...choiceScenes, ...endScenes,
];
