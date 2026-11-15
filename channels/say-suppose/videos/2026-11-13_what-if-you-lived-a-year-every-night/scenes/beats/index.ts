import { tellMeTomorrow } from "./TellMeTomorrow";
import { rule } from "./Rule";
import { piano } from "./Piano";
import { sevenYears } from "./SevenYears";
import { cityPlugsIn } from "./CityPlugsIn";
import { staffLast } from "./StaffLast";
import { nightThirty } from "./NightThirty";
import { kettleLead } from "./KettleLead";
import { tomorrow } from "./Tomorrow";
import type { Beat } from "../shared";

/** The film's beats in order (script.md v7). firstLine must rise; it is the index into story.json lines.
 *  Piano.tsx is the beat "Night One". */
export const BEATS: Beat[] = [tellMeTomorrow, rule, piano, sevenYears, cityPlugsIn, staffLast, nightThirty, kettleLead, tomorrow];
