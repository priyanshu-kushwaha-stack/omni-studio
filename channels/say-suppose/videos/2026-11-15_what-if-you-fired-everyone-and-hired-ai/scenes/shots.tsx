// The first cut's shot list: every `> SCENE:` and `> HOLD:` of script.md as shots, in film order, built in three
// parts (shots/a.tsx: Who Eats? to The Plant; shots/b.tsx: The Whole Town to Make Them Buy; shots/c.tsx: The Cheque
// to Stool Four). Tags are the script's `> TAG:` lines and cards; bubbles are its `> BUBBLE:` lines.
import { BUBBLES_A, SHOTS_A, TAGS_A } from "./shots/a";
import { BUBBLES_B, SHOTS_B, TAGS_B } from "./shots/b";
import { BUBBLES_C, SHOTS_C, TAGS_C } from "./shots/c";
import type { BubbleDef, ShotDef, TagDef } from "./shotTypes";

export { E, S } from "./shotTypes";
export type { Anchor, BubbleDef, ShotDef, TagDef } from "./shotTypes";

export const SHOTS: ShotDef[] = [...SHOTS_A, ...SHOTS_B, ...SHOTS_C];
export const TAGS: TagDef[] = [...TAGS_A, ...TAGS_B, ...TAGS_C];
export const BUBBLES: BubbleDef[] = [...BUBBLES_A, ...BUBBLES_B, ...BUBBLES_C];
