import { platform } from "./Platform";
import { madeTheCut } from "./MadeTheCut";
import { rule } from "./Rule";
import { whosCrimson } from "./WhosCrimson";
import { herBack } from "./HerBack";
import { fourSeats } from "./FourSeats";
import { fiveHundred } from "./FiveHundred";
import { thousandTags } from "./ThousandTags";
import { second } from "./Second";
import { notebook } from "./Notebook";
import { backs } from "./Backs";
import { holdsBreath } from "./HoldsBreath";
import { windowBeat } from "./Window";
import { twoLetters } from "./TwoLetters";
import type { Beat } from "../shared";

/** The film's beats in order (script v5, 2026-11-14), with story.json line numbers. firstLine must rise:
 *  Platform 0, Made the Cut 1, The Rule 7, Who's Red 22, Her Back 48, The Weapon 51, Five Hundred 62,
 *  A Thousand Cards 66, Second 74, The Ladder 78, Backs 84, The Country Holds Its Breath 91, The Window 97,
 *  The Door 110. (SayItAgain, TextOpensNothing and LoadingDock are v4 beats kept as parts to borrow from.) */
export const BEATS: Beat[] = [platform, madeTheCut, rule, whosCrimson, herBack, fourSeats, fiveHundred, thousandTags, second, notebook, backs, holdsBreath, windowBeat, twoLetters];
