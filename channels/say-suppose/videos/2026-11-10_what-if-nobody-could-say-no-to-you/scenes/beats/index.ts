import { change } from "./Change";
import { rule } from "./Rule";
import { firstJump } from "./FirstJump";
import { clerk } from "./Clerk";
import { sunday } from "./Sunday";
import { office } from "./Office";
import { loan } from "./Loan";
import { midpoint } from "./Midpoint";
import { cost } from "./Cost";
import { stage } from "./StageBeat";
import { choice } from "./Choice";
import { paper } from "./PaperBeat";
import { back } from "./Back";
import type { Beat } from "../shared";

/** The film's beats in order (script.md). firstLine must rise. */
export const BEATS: Beat[] = [change, rule, firstJump, clerk, sunday, office, loan, midpoint, cost, stage, choice, paper, back];
