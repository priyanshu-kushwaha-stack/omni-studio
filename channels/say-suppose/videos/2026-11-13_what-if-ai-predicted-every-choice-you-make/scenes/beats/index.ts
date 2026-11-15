import { theLamp } from "./TheLamp";
import { halfPrice } from "./HalfPrice";
import { theRule } from "./TheRule";
import { random } from "./Random";
import { yourStall } from "./YourStall";
import { theCityPlays } from "./TheCityPlays";
import { theCheapestMan } from "./TheCheapestMan";
import { sixtyPerCent } from "./SixtyPerCent";
import { red } from "./Red";
import { theDilemma } from "./TheDilemma";
import { theKey } from "./TheKey";
import { theBoard } from "./TheBoard";
import { theQueue } from "./TheQueue";
import type { Beat } from "../shared";

/** The film's beats in order (script.md v2). firstLine must rise; each is the index of the beat's first narration line
 *  (scenes/lines.txt). theCheapestMan plays the v2 section "Boring Pays"; Red absorbs v1's "A Man in Trouble"
 *  (AManInTrouble.*.tsx stay as parts to reuse); theQueue replaces The Train (TheTrain*.tsx stay as parts). */
export const BEATS: Beat[] = [theLamp, halfPrice, theRule, random, yourStall, theCityPlays, theCheapestMan, sixtyPerCent, red, theDilemma, theKey, theBoard, theQueue];
