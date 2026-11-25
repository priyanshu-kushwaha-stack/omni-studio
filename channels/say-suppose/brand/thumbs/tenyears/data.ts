// G1 thumbnail candidates for "What If AI Did Everything for 10 Years?" (2026-11-26). The picture is a 3D render in the
// owner's A4 cinematic look (videos/2026-11-26_what-if-ai-did-everything-for-10-years/scenes3d/film3d.py --shot thumb):
// your flat in 2041; you, large at the left, lenses on and glowing, delighted, eyes on the overlays; through the long
// window the lit city, drones in lanes, and the sky beginning to turn green behind you. One variable: the tag (K15).
export interface Tag { text: string; lines: string[]; x: number; y: number; size: number; tilt: number }
export interface Candidate { id: string; value: string; tag: Tag }

export const VALUES: { value: string; lines: string[] }[] = [
  { value: "TOO LATE?", lines: ["TOO LATE?"] },
  { value: "NOBODY NOTICED", lines: ["NOBODY", "NOTICED"] },
  { value: "ECHO?", lines: ["ECHO?"] },
];

export const CANDIDATES: Candidate[] = VALUES.map((v, i) => ({
  id: "abc"[i], value: v.value,
  tag: { text: v.value, lines: v.lines, x: 44, y: 34, size: 190, tilt: -3 },
}));
