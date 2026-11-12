// The Cheapest Man: named moments (frames) from narration line indices 43-52, and every tag's and board's keys,
// shared by the pictures and their sounds.
import type { Clip } from "@whatif/kit/timeline";
import type { BoardKey, TagKey } from "../device";
import { lineAt } from "../kit";
import { lineEnd } from "../shared";

export type T = ReturnType<typeof times>;

export function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  const hold = lineEnd(clips, 48); // the six-second performed hold: TELLS JOKE 62%
  return {
    lunch: from(43), // "The man with the same lunch."
    spoon: at(43, 0.28), // "Same table, same minute, same dish, for a year."
    clock: at(43, 0.52), // the clock at noon, his board on 12
    lowest: at(43, 0.72), // "Lowest rate in the city.": the next tables glance at his board, then their own
    hanoi: from(44), // "People farm it."
    tail: at(44, 0.12), // "In 1902, Hanoi paid a bounty for every rat tail"
    coin: at(44, 0.24),
    rows: at(44, 0.42), // "and officials found people"
    cage: at(44, 0.56), // "breeding rats for the tails."
    street: from(45), // "On the street, a man sells boring."
    coach: from(46), // "Same route. Same lunch. Same face." (his own voice)
    queue: at(46, 0.62),
    magic: from(47), // "The magician reads tags for tips."
    tip: at(47, 0.16),
    rate: at(47, 0.27), // "Your rate falls."
    sixtyOne: at(47, 0.4),
    fiftyFive: at(47, 0.53),
    reach: at(47, 0.64), // "You've learned to read your tag before you reach."
    phone: from(48), // "His phone lights up on the counter."
    look: at(48, 0.24), // "His sister."
    flip: at(48, 0.43), // "He turns it face down."
    ask: at(48, 0.68), // "You don't ask."
    hold,
    jokeTag: hold + 16, // TELLS JOKE 62%
    mouth: hold + 34, // he opens his mouth
    eyesUp: hold + 52, // his eyes go up to the card
    eyesDown: hold + 80, // the eyes leave it; the grin stays
    shut: hold + 108, // he shuts his mouth
    count: hold + 116, // he counts coins, lips moving, no sound
    youLook: hold + 128, // you look at him
    counts: hold + 156, // COUNTS COINS 97%, teal
    reads: from(49), // "He reads the sixty-two. He shuts his mouth. He counts coins instead."
    costs: from(50), // "That's what the discount costs. Not money."
    habit: from(51), // "You count the box. That's the habit.": the lid, the key, your pocket
    key: at(51, 0.3),
    pocket: at(51, 0.62),
    score: from(52), // "And the board says ninety-nine point five now."
    flapScore: at(52, 0.2),
    tilt: at(52, 0.5), // "It's getting better. Or something is.": up to the lamp
    end: to,
  };
}

const k = (at: number, text: string, pct: number | null, state: TagKey["state"]): TagKey => ({ at, text, pct, state });

export function tags(t: T) {
  return {
    lunch: [k(t.lunch - 60, "SAME LUNCH", 100, "tick")],
    queue: (i: number) => [k(t.street + 4 + i * 3, "LISTENS", 99, "tick")],
    tourist: [k(t.magic - 30, "CALLS MUM", 94, "new")],
    you: [k(t.rate - 30, "OPENS TILL", 96, "new"), k(t.reach + 50, "OPENS TILL", 96, "tick")],
    friend: [k(t.jokeTag, "TELLS JOKE", 62, "new"), k(t.counts, "COUNTS COINS", 97, "tick")],
  };
}

export function boards(t: T) {
  const b = (at: number, value: string): BoardKey => ({ at, value });
  return {
    his: [b(t.lunch - 60, "12")],
    n1: [b(t.lunch - 60, "64")],
    n2: [b(t.lunch - 60, "71")],
    yours: [b(t.rate - 60, "64"), b(t.sixtyOne, "61"), b(t.fiftyFive, "55")],
    city: [b(t.score - 60, "99.4"), b(t.flapScore, "99.5")],
  };
}
