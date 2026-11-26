import { chair } from "./Chair";
import { nightOne } from "./NightOne";
import { rule } from "./Rule";
import { crumbs } from "./Crumbs";
import { moreHours } from "./MoreHours";
import { nightShift } from "./NightShift";
import { photo } from "./Photo";
import { warehouses } from "./Warehouses";
import { contract } from "./Contract";
import { oneMind } from "./OneMind";
import { midnight } from "./Midnight";
import { morning } from "./Morning";
import type { Beat } from "../shared";

/** The film's beats in order (script.md). firstLine must rise. */
export const BEATS: Beat[] = [chair, nightOne, rule, crumbs, moreHours, nightShift, photo, warehouses, contract, oneMind, midnight, morning];
