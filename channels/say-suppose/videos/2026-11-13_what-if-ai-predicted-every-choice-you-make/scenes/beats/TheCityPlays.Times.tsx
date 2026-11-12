// The City Plays: named moments (frames) from narration line indices 24-42, and every tag's and board's keys, shared
// by the pictures and their sounds.
import type { Clip } from "@whatif/kit/timeline";
import type { BoardKey, TagKey } from "../device";
import { lineAt } from "../kit";
import { lineEnd } from "../shared";
import type { TrainTimes } from "./TheCityPlays.Train";

export type T = ReturnType<typeof times>;

export function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  const end = (i: number) => lineEnd(clips, i);
  const train: TrainTimes = {
    train: from(41) + 4, // "The morning train.": cut to your card over your face
    pull: from(41) + 14, // the camera pulls back down the coach
    pulled: end(41) - 4,
    wave1: at(41, 0.3), // "Forty heads.": a ripple of ticks; the fare board 2.00
    wave2: at(41, 0.62), // "Forty tags, the same three words.": 1.90
    together: end(41) + 18, // the hold: all forty tick together; 1.80
    push: from(42), // "But here's the problem.": down the aisle to the stranger
    end: to,
  };
  return {
    start: from(24),
    // rock-paper-scissors on the platform (24, 25)
    throw1: at(24, 0.3), // "...with the man beside him.": rock beats scissors
    win: at(24, 0.42), // "Wins with rock.": the fist in the air
    rpsTag: at(24, 0.56), // "His tag says rock again.": ROCK AGAIN 83%
    read: at(24, 0.68), // the man reads it
    throw2: at(24, 0.9), // "Eighty-three.": rock again, paper
    noFair: from(25) - 3, // "No fair.": rock again, paper again; the cap comes off in his hand
    throw3: from(25) + 4,
    capOff: at(25, 0.55),
    diagram: from(26), // the paper on the platform wall
    // the magician (27-29)
    magician: from(27),
    pick: from(28), // "Pick a card." (his own voice)
    leave: at(28, 0.6), // the crowd reads his card and walks off
    magClose: at(29, 0.1), // he looks up at his own card
    noAct: at(29, 0.55), // "By lunch, no act.": the fan goes down
    // the date (30, 31)
    date: from(30),
    herTag: at(30, 0.18),
    herPhone: at(30, 0.28),
    hisTag: at(30, 0.44),
    joke: at(30, 0.5),
    obey: at(30, 0.64), // "Both obey.": two-shot
    boards: at(30, 0.7), // the table boards flap down together
    half: at(30, 0.82), // "Half price.": the food steams, untouched
    heard: from(31), // "Heard this one." (her own voice)
    // the penalty kick on the TV (32)
    tv: from(32),
    screen: at(32, 0.13),
    kickTag: at(32, 0.2), // "Tag says left"
    dive: at(32, 0.34), // "keeper goes left": already diving
    kick: at(32, 0.4),
    row: at(32, 0.53), // "Soon every striker obeys": three strikers, three saves
    zeros: at(32, 0.77), // "and nobody scores.": a scoreboard of zeros
    // the pickpocket (33-35)
    pick2: from(33), // "Then the first crimson the city has seen."
    crimson: at(33, 0.45),
    turn: at(33, 0.72), // every head turns at once
    touch: from(34), // "I didn't touch it." (his own voice): hands open, a step back
    doors: at(35, 0.09), // "Doors shut on him."
    coffee: at(35, 0.2), // "The coffee seller won't pour."
    verdict: at(35, 0.33), // "A crimson tag is a verdict everyone can read"
    gap: at(35, 0.5), // "and nobody asks for the trial.": the platform steps away from him
    dusk: at(35, 0.66), // "By the weekend his tag says stands still."
    safest: at(35, 0.85), // "Safest man on the platform."
    // your six-ten (36, 37)
    sixTen: from(36),
    map: at(36, 0.14),
    route: at(36, 0.3),
    ninety: at(36, 0.6), // "ninety-three per cent"
    bars: at(36, 0.73), // "Nobody fell below eighty per cent."
    timetable: from(37), // "You thought you were a free spirit. You're a timetable."
    arrive: at(37, 0.35),
    board: at(37, 0.55), // the platform clock flaps to 6:10 as the train stops; your card ticks
    // the landlord (38-40)
    landlord: from(38),
    take: at(38, 0.6),
    keep: from(39), // "Keep it up." (his own voice)
    tear: from(39) + 2,
    hiCard: from(39) + 6, // HIGH-FIVES 98%, a second before his hand comes up
    handUp: from(40) - 4, // "Half!" (his own voice)
    slap: from(40) + 6,
    // the morning train (41, the hold, 42)
    t: train,
    end: to,
  };
}

const k = (at: number, text: string, pct: number | null, state: TagKey["state"]): TagKey => ({ at, text, pct, state });

/** Every tag in the beat, by who wears it. */
export function tags(t: T) {
  return {
    kid: [k(t.rpsTag, "ROCK AGAIN", 83, "new"), k(t.throw2 + 4, "ROCK AGAIN", 83, "tick"), k(t.throw3 + 4, "ROCK AGAIN", 83, "tick")],
    magician: [k(t.magician + 6, "PALMS THE QUEEN", 99, "new")],
    her: [k(t.herTag, "CHECKS PHONE", 88, "new"), k(t.herPhone + 8, "CHECKS PHONE", 88, "tick")],
    him: [k(t.hisTag, "SAME JOKE", 95, "new"), k(t.joke + 26, "SAME JOKE", 95, "tick")],
    striker: [k(t.kickTag, "KICKS LEFT", 91, "new"), k(t.kick + 2, "KICKS LEFT", 91, "tick")],
    thief: [k(t.crimson, "TAKES WALLET", 97, "crimson")],
    still: [k(t.dusk - 30, "STANDS STILL", 99, "tick")],
    you: [k(t.sixTen + 8, "TAKES THE SIX-TEN", 98, "new"), k(t.board + 2, "TAKES THE SIX-TEN", 98, "tick")],
    friend: [k(t.hiCard, "HIGH-FIVES", 98, "new"), k(t.slap, "HIGH-FIVES", 98, "tick")],
  };
}

/** Every board in the beat. */
export function boards(t: T) {
  const b = (at: number, value: string): BoardKey => ({ at, value });
  return {
    herTable: [b(t.date - 30, "6.40"), b(t.boards, "3.20")],
    hisTable: [b(t.date - 30, "6.40"), b(t.boards + 3, "3.20")],
    score: [b(t.zeros - 10, "0-0")],
    clock: [b(t.sixTen - 30, "6:09"), b(t.board, "6:10")],
  };
}
