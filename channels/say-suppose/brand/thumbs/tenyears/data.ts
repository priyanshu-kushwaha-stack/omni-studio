// G1 thumbnails for "What If AI Did Everything for 10 Years?" (2026-11-26). Each picture is a 3D render in the owner's
// A4 look (videos/2026-11-26_what-if-ai-did-everything-for-10-years/scenes3d/film3d.py --shot <base>), with the
// channel's stamped tag. Round 1 (base "thumb"): one picture, three tags; the owner picked title A + "TOO LATE?" and
// asked for a better picture. Round 2: three pictures, the same tag (the variable is the picture, K15).
export interface Tag { text: string; lines: string[]; x: number; y: number; size: number; tilt: number; side: "left" | "right" }
export interface Candidate { id: string; value: string; base: string; tag: Tag }

const tag = (side: "left" | "right" = "left"): Tag => ({ text: "TOO LATE?", lines: ["TOO LATE?"], x: 44, y: 34, size: 190, tilt: side === "left" ? -3 : 3, side });

export const CANDIDATES: Candidate[] = [
  { id: "1", value: "close-up, a drone brings coffee", base: "base-thumb2.png", tag: tag("left") },
  { id: "2", value: "lounging, drones serve you", base: "base-thumb3.png", tag: tag("right") },
  { id: "3", value: "the lens fails, a drone drops", base: "base-thumb4.png", tag: tag("left") },
];
