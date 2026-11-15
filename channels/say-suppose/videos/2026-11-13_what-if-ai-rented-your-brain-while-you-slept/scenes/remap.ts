/** v1 -> current line map (script v5; first written for v3, the owner's notes on the first cut, 2026-11-13). The beats were built on v1's line
 *  numbers; v3 changed or added lines but kept the order. Film hands each beat the v3 clips in v1 numbering
 *  (V1_TO_V3[i] is v1 line i's v3 line), so a beat's line numbers still name the same moment; a beat rebuilt for v3
 *  reads shot.v3 instead. New v3 lines sit inside the beat that holds them. V1_FROM is each v1 line's start frame in the
 *  v1 cut: the sound plan (sound.ts) was spotted in v1 seconds and is retimed through these anchors. */
export const V1_TO_V3: number[] = [0, 2, 3, 5, 8, 10, 11, 12, 13, 14, 15, 18, 20, 23, 24, 27, 28, 29, 30, 31, 32, 33, 39, 40, 41, 42, 43, 47, 48, 49, 50, 50, 50, 51, 52, 53, 54, 55, 56, 57, 63, 64, 65, 66, 67, 68, 69, 70, 72, 73, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 84, 85, 86, 90, 93, 94, 95, 95, 96, 98, 99, 100, 100, 101, 102, 103, 106, 107, 108, 110, 111, 112, 115, 117, 119, 120, 121, 122, 126, 127, 128, 129, 130, 132, 134, 137];
export const V1_FROM: number[] = [222, 328, 406, 530, 631, 898, 1020, 1052, 1087, 1297, 1479, 1738, 2021, 2270, 2624, 2923, 2970, 3111, 3372, 3450, 3712, 3826, 4009, 4327, 4393, 4511, 4653, 4720, 5149, 5507, 5631, 6052, 6223, 6420, 6625, 6964, 7071, 7496, 7659, 7705, 8094, 8238, 8623, 8666, 8842, 8963, 9114, 9469, 9873, 10052, 10193, 10569, 10770, 10810, 11023, 11093, 11398, 11524, 11585, 11887, 12035, 12191, 12421, 12542, 13021, 13217, 13587, 13884, 14103, 14324, 14426, 14634, 14946, 15416, 15688, 15809, 15943, 15998, 16066, 16389, 16519, 16720, 16948, 17643, 17835, 17978, 18104, 18278, 18571, 18725, 18833, 18983, 19172, 19380, 19563, 19674];
export const V1_TOTAL = 20067;

/** v5 -> v6 line map (script v6, 2026-11-15: the Cursor frame-by-frame review; review-cursor-v5.md). Every beat built
 *  up to v5 counts lines in v5 numbering (through V1_TO_V3, or V5 in beats/V5.Kit.tsx); v5Timeline hands them a
 *  virtual v5 timeline cut from v6's clips. -1 is a v5 line v6 cut or moved out of order: it gets a one-frame clip just
 *  before the next kept line, so its insert never shows and every camera key stays strictly increasing. The four v6
 *  lines with no v5 source (0 the coin, 3 the premise, 5 the graduation, 78 the broker's why-you) are drawn by beats
 *  from shot.v6. */
export const V5_TO_V6: number[] = [1, -1, 2, 4, -1, -1, 6, -1, -1, 7, 8, 9, 10, 11, 12, 13, -1, -1, 14, 15, 16, -1, -1, -1, 17, 18, -1, 19, 20, 21, 22, 23, 24, 25, 26, 27, -1, -1, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, -1, -1, 38, 39, 40, 41, 42, 43, 44, 45, 46, -1, -1, -1, 47, -1, 48, 49, -1, 50, -1, 51, 52, 53, -1, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, -1, -1, 68, -1, 69, 70, 71, -1, 72, 73, 74, 75, 76, 77, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, -1, -1, -1, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112];
export const V5_TOTAL = 138;

export function v5Timeline<T extends { from: number; frames: number }>(v6: T[]): T[] {
  const out: T[] = new Array(V5_TO_V6.length);
  for (let i = 0; i < V5_TO_V6.length; i++) {
    const n = V5_TO_V6[i];
    if (n >= 0) { out[i] = v6[n]; continue; }
    let j = i;
    while (j < V5_TO_V6.length && V5_TO_V6[j] < 0) j++;
    const prev = i > 0 ? out[i - 1] : undefined;
    const next = j < V5_TO_V6.length ? v6[V5_TO_V6[j]].from : (prev ? prev.from + prev.frames : 0) + (j - i) * 2 + 2;
    for (let k = i; k < j; k++) out[k] = { ...(prev ?? v6[0]), from: next - (j - k) * 2, frames: 1 };
    i = j - 1;
  }
  return out;
}

/** v6's line objects in v5 numbering (a cut line borrows the next kept line's, so its mood is the coming scene's). */
export function v5Lines<T>(v6: T[]): T[] {
  return V5_TO_V6.map((n, i) => {
    if (n >= 0) return v6[n];
    const j = V5_TO_V6.findIndex((m, k) => k > i && m >= 0);
    return v6[j >= 0 ? V5_TO_V6[j] : v6.length - 1];
  });
}
