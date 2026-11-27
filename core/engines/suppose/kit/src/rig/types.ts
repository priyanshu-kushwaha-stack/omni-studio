// Piece sizes for the generic cut-out people (from the pilot's castData.ts, without its cast data).
export type Piece = {src: string; w: number; h: number};
export type Parts = Record<'head' | 'torso' | 'uarmL' | 'uarmR' | 'farmL' | 'farmR' | 'thighL' | 'thighR' | 'shinL' | 'shinR', Piece> & {
  hip?: number; // where the thighs meet the torso, as a fraction of its height (long coats sit low)
  sh?: [number, number]; // torso edges at shoulder height, fractions of its width
  face?: [number, number, number]; // face centre x, y and width, fractions of the head
};
export type CastMember = Parts & {height: number; roles: string[]; signature: string; voice?: {desc: string; seed: number} | null};
