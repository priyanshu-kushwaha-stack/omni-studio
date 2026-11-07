import { opening } from "./Opening";
import { firstDays } from "./FirstDays";
import { dayTwelve } from "./DayTwelve";
import { theCatch } from "./Catch";
import { longRun } from "./LongRun";
import { ending } from "./Ending";
import type { Beat } from "../shared";

/** The film's beats in order (scene_plan.md). */
export const BEATS: Beat[] = [opening, firstDays, dayTwelve, theCatch, longRun, ending];
