import { frame } from "./Frame";
import { click } from "./Click";
import { rule } from "./Rule";
import { zeros } from "./Zeros";
import { floor } from "./Floor";
import { sayItAgain } from "./SayItAgain";
import { tenOutOfTen } from "./TenOutOfTen";
import { stadium } from "./Stadium";
import { everybodyTexts } from "./EverybodyTexts";
import { rival } from "./Rival";
import { polygraph } from "./Polygraph";
import { statement } from "./Statement";
import { readItAloud } from "./ReadItAloud";
import { nine } from "./Nine";
import type { Beat } from "../shared";

/** The film's beats in order. Each finds its first line by its opening words (shared.ts findLine). */
export const BEATS: Beat[] = [frame, click, rule, zeros, floor, sayItAgain, tenOutOfTen, stadium, everybodyTexts, rival, polygraph, statement, readItAloud, nine];
