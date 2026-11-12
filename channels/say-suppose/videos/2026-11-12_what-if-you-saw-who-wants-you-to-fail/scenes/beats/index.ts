import { platform } from "./Platform";
import { madeTheCut } from "./MadeTheCut";
import { rule } from "./Rule";
import { whosCrimson } from "./WhosCrimson";
import { herBack } from "./HerBack";
import { thousandTags } from "./ThousandTags";
import { fourSeats } from "./FourSeats";
import { notebook } from "./Notebook";
import { sayItAgain } from "./SayItAgain";
import { holdsBreath } from "./HoldsBreath";
import { textOpensNothing } from "./TextOpensNothing";
import { loadingDock } from "./LoadingDock";
import { twoLetters } from "./TwoLetters";
import type { Beat } from "../shared";

/** The film's beats in order (script.md). firstLine must rise. */
export const BEATS: Beat[] = [platform, madeTheCut, rule, whosCrimson, herBack, thousandTags, fourSeats, notebook, sayItAgain, holdsBreath, textOpensNothing, loadingDock, twoLetters];
