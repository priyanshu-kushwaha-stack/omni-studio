// Every frame Who's Red uses, from the narration clips (script v2.1, narration lines 14-31). `at(i, p)`: p of the way
// through line i, placed on the words by their share of the line. The performed moment on the steps (two holds round
// his "What number?") is staged in the gap between the end of line 28 and the start of line 29.
import type { Clip } from "@whatif/kit/timeline";
import { clock } from "./WhosCrimson.Common";

export type CrimsonTimes = ReturnType<typeof crimsonTimes>;

export function crimsonTimes(clips: Clip[], to: number) {
  const { from, end, at } = clock(clips);
  const g0 = end(28);
  const gap = from(29) - g0;
  const inGap = (p: number) => Math.round(g0 + gap * p);
  return {
    // 14-19 the corridor, the rival at the shoe lockers
    walkIn: from(14), // wide: you walk in with the letter, the rival far right swapping shoes
    youWalk: at(14, 0.45), // "Red is for enemies.": tracking you, set face
    walkEnd: at(14, 0.9),
    lockers: from(15), // "The rival.": on him, one foot up
    still: from(16), // "Still here?"
    raise: from(17), // two-shot: you hold up the letter
    ots: at(17, 0.45), // over your shoulder on his head
    taehoTag: at(17, 0.55), // the card snaps open, flaps to -6
    youLook: from(18), // your face: brows up at the card
    barely: at(18, 0.45), // close on him: he barely looks up
    move: from(19), // "Nice. Move."
    // 20-22 the classroom, your maths teacher
    kang: from(20),
    kangTag: from(20) + 4,
    good: from(21),
    youKang: from(22),
    kangTwo: at(22, 0.6),
    // 23-27 why: the desks, two paper sheets, the rival far off, your best friend at the next desk, the lanes
    desks: from(23),
    ladder: from(24),
    race: from(25),
    taehoFar: from(26),
    minjun: at(26, 0.46), // "Your best friend has the next desk"
    youLane: from(27),
    lanes: at(27, 0.3),
    // 28 the academy steps at dusk; then the performed moment in the gap after it
    steps: from(28),
    point: g0, // you point straight up above his head, mouth open; he looks at your face ...
    follow: inGap(0.12), // ... follows your finger ...
    up: inGap(0.27), // ... looks up, sees nothing ...
    sky: inGap(0.42), // ... looks at the sky ...
    back: inGap(0.53), // ... then at you, brows up
    ask: inGap(0.64), // the bubble "What number?"
    askEnd: inGap(0.86),
    pat: inGap(0.74), // he pats the top of his own head twice ...
    laugh: inGap(0.88), // ... laughs ...
    shove: inGap(0.95), // ... and shoves your shoulder
    // 29-31 he can't see it; your face; the two of you small on the steps
    pair: from(29),
    yours: from(30),
    wide: from(31),
    end: to,
  };
}
