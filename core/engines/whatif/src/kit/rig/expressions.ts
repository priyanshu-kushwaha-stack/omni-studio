import type { Brows, Mouth } from "./Figure";

export interface Expression { brows: Brows; lids: number; mouth: Mouth; eyes: number; look?: { x: number; y: number } }

/** Named faces (style.md: faces act with brows and eyelids). Spread one onto a Figure: <Figure {...EXPRESSIONS.sad} />. */
export const EXPRESSIONS = {
  neutral: { brows: "none", lids: 0, mouth: "flat", eyes: 1 },
  happy: { brows: "none", lids: 0, mouth: "smile", eyes: 1 },
  sceptical: { brows: "flat", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 0.6, y: 0 } },
  worried: { brows: "worry", lids: 0.15, mouth: "wobble", eyes: 1, look: { x: 0.5, y: 0.2 } },
  sad: { brows: "sad", lids: 0.55, mouth: "frown", eyes: 1, look: { x: 0.2, y: 0.6 } },
  shocked: { brows: "raised", lids: 0, mouth: "o", eyes: 1.3 },
  determined: { brows: "angry", lids: 0.25, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0 } },
  relieved: { brows: "raised", lids: 0.5, mouth: "smile", eyes: 1, look: { x: 0.3, y: -0.2 } },
  afraid: { brows: "worry", lids: 0, mouth: "open", eyes: 1.35, look: { x: -0.6, y: 0 } },
} satisfies Record<string, Expression>;
