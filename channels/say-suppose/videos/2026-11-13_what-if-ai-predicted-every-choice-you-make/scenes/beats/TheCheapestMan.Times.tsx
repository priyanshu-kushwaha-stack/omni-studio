// Boring Pays (v2; the beat keeps its v1 name theCheapestMan): named moments (frames) from narration line indices
// 50-59, and every tag's and board's keys, shared by the pictures and their sounds.
import type { Clip } from "@whatif/kit/timeline";
import type { BoardKey, TagKey } from "../device";
import { lineAt } from "../kit";
import { lineEnd } from "../shared";

export type T = ReturnType<typeof times>;

export function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  const end = (i: number) => lineEnd(clips, i);
  // the 5 s performed hold after line 56: the napkin tie
  const hold = end(56);
  const g = Math.max(90, from(57) - hold);
  const h = (p: number) => hold + Math.round(g * p);
  return {
    lunch: from(50), // "The man with the same lunch."
    spoon: at(50, 0.28), // "Same table, same minute, same dish, for a year."
    clock: at(50, 0.52), // the clock at noon, his board on 12
    lowest: at(50, 0.72), // "Lowest rate in the city.": the next tables glance at his board, then their own
    champ: from(51) - 12, // your friend leaning over your counter to look
    champLine: from(51), // "That's the champion?" (his own voice)
    react: end(51) + 4, // back to the man: the same spoon on the same beat
    hanoi: from(52), // "People farm it."
    tail: at(52, 0.18), // "In 1902, Hanoi paid a bounty for every rat tail."
    coin: at(52, 0.28),
    rows: at(52, 0.46), // "Officials found people breeding rats"
    cage: at(52, 0.6),
    street: from(53), // "On the street, a man sells boring."
    coach: from(54), // "Same route. Same lunch. Same face." (his own voice)
    queue: at(54, 0.62),
    rate: from(55), // "Your rate falls."
    sixtyOne: at(55, 0.2),
    fiftyFive: at(55, 0.36),
    reach: at(55, 0.56), // "You've learned to read your tag before you reach."
    napkin: from(56), // "Quiet all week. Then tonight, the landlord impression. The napkin tie."
    hold,
    mouth: h(0.1), // he opens his mouth for the landlord's first word
    card: h(0.15), // LANDLORD VOICE 97% flaps before any sound comes out
    stop: h(0.22), // he stops with his mouth open
    up: h(0.32), // he looks up at it
    bit: h(0.46), // he finishes the bit anyway, quieter
    tick: h(0.62), // the card ticks: it came true
    pull: h(0.8), // he pulls the napkin off
    knows: from(57), // "It knows the bit." (his own voice)
    costs: from(58), // "That's what the discount costs. Not money."
    score: from(59), // "And the board outside says ninety-nine point five now."
    flapScore: at(59, 0.2),
    tilt: at(59, 0.5), // "It's getting better. Or something is.": up to the lamp
    end: to,
  };
}

const k = (at: number, text: string, pct: number | null, state: TagKey["state"]): TagKey => ({ at, text, pct, state });

export function tags(t: T) {
  return {
    lunch: [k(t.lunch - 60, "SAME LUNCH", 100, "tick")],
    queue: (i: number) => [k(t.street + 4 + i * 3, "LISTENS", 99, "tick")],
    friend: [k(t.card, "LANDLORD VOICE", 97, "new"), k(t.tick, "LANDLORD VOICE", 97, "tick")],
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
