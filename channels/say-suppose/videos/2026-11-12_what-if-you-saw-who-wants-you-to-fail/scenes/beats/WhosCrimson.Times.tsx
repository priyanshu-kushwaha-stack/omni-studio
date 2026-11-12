// Every frame Who's Crimson uses, from the narration clips (narration lines 14-32). `at(i, p)`: p of the way through
// line i, placed on the words by their share of the line.
import type { Clip } from "@whatif/kit/timeline";
import { clock } from "./WhosCrimson.Common";

export type CrimsonTimes = ReturnType<typeof crimsonTimes>;

export function crimsonTimes(clips: Clip[], to: number) {
  const { from, end, at } = clock(clips);
  return {
    // 14-19 the corridor, Tae-ho at the shoe lockers
    walkIn: from(14), // wide: you walk in with the letter, Tae-ho far right swapping shoes
    youWalk: at(14, 0.45), // "Crimson is for enemies.": tracking you, set face
    walkEnd: at(14, 0.9),
    lockers: from(15), // "Tae-ho, at the shoe lockers.": on him, one foot up
    still: from(16), // "Still here?"
    raise: from(17), // two-shot: you hold up the letter
    ots: at(17, 0.45), // over your shoulder on his head
    taehoTag: at(17, 0.55), // the card snaps open, flaps to -6
    youLook: from(18), // your face: brows up at the card
    barely: at(18, 0.45), // close on him: he barely looks up
    move: from(19), // "Nice. Move."
    // 20-22 the classroom, Ms. Kang
    kang: from(20),
    kangTag: from(20) + 4,
    good: from(21),
    youKang: from(22),
    kangTwo: at(22, 0.6),
    // 23 the store, the platform, the cat
    clerk: from(23),
    clerkTag: from(23) + 8,
    tour: at(23, 0.29),
    tourTag: at(23, 0.32),
    cat: at(23, 0.62),
    catBlink: at(23, 0.86), // "Cats don't count."
    // 24-28 why: the desks, two paper sheets, Tae-ho far off, Min-jun at the next desk, the lanes
    desks: from(24),
    ladder: from(25),
    race: from(26),
    taehoFar: from(27),
    minjun: at(27, 0.4),
    youLane: from(28),
    lanes: at(28, 0.3),
    // 29-32 the academy steps at dusk
    steps: from(29),
    point: at(29, 0.5),
    ask: end(29) + 2, // the bubble "What number?"
    askEnd: at(30, 0.55),
    blank: from(30),
    grin: at(30, 0.6),
    pair: from(31),
    wide: from(32),
    end: to,
  };
}
