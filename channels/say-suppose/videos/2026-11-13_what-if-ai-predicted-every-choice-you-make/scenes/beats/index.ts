import { theLamp } from "./TheLamp";
import { halfPrice } from "./HalfPrice";
import { theRule } from "./TheRule";
import { random } from "./Random";
import { theCityPlays } from "./TheCityPlays";
import { theCheapestMan } from "./TheCheapestMan";
import { sixtyPerCent } from "./SixtyPerCent";
import { red } from "./Red";
import { aManInTrouble } from "./AManInTrouble";
import { theDilemma } from "./TheDilemma";
import { theKey } from "./TheKey";
import { theBoard } from "./TheBoard";
import { theTrain } from "./TheTrain";
import type { Beat } from "../shared";

/** The film's beats in order (script.md). firstLine must rise; each is the index of the beat's first narration line
 *  (scenes/lines.txt). */
export const BEATS: Beat[] = [theLamp, halfPrice, theRule, random, theCityPlays, theCheapestMan, sixtyPerCent, red, aManInTrouble, theDilemma, theKey, theBoard, theTrain];
