import { tellMeTomorrow } from "./TellMeTomorrow";
import { rule } from "./Rule";
import { piano } from "./Piano";
import { sevenYears } from "./SevenYears";
import { cityPlugsIn } from "./CityPlugsIn";
import { coldApology } from "./ColdApology";
import { nightThirty } from "./NightThirty";
import { wasYesterday } from "./WasYesterday";
import { timeline } from "./Timeline";
import { herOffer } from "./HerOffer";
import { slowRoom } from "./SlowRoom";
import { tellMeNow } from "./TellMeNow";
import type { Beat } from "../shared";

/** The film's beats in order (script.md v2). firstLine must rise; it is the index into story.json lines. */
export const BEATS: Beat[] = [tellMeTomorrow, rule, piano, sevenYears, cityPlugsIn, coldApology, nightThirty, wasYesterday, timeline, herOffer, slowRoom, tellMeNow];
