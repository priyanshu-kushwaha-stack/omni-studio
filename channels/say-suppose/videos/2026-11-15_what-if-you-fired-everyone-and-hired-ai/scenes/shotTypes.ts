// The shot-list types and anchors shared by shots.tsx, shots/a.tsx, shots/b.tsx, shots/c.tsx and sound.ts. A shot,
// tag or bubble is anchored to a spoken line of story.json by the line's opening words (its start, or its end for a
// hold after it), so a new voice take or a reordered script re-times the cut, and a line that no longer exists fails
// the render (Film.tsx lineOf).
import type { ReactNode } from "react";
import type { ShotTime } from "./parts/util";

export interface Anchor { line: string; edge?: "start" | "end"; plus?: number }
export interface ShotDef { at: Anchor; draw: (t: ShotTime) => ReactNode }
export interface TagDef { at: Anchor; text: string; kind?: "message" | "label" | "cast"; dot?: boolean; from?: string; frames?: number }
export interface BubbleDef { at: Anchor; text: string; x: number; y: number; frames?: number }

/** At the start of the spoken line that begins with these words, plus some frames. */
export const S = (line: string, plus = 0): Anchor => ({ line, edge: "start", plus });
/** At the end of that line (a hold after it), plus some frames. */
export const E = (line: string, plus = 0): Anchor => ({ line, edge: "end", plus });
