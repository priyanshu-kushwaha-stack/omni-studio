// The City Plays (v2): named moments (frames) from narration line indices 33-49, and every tag's and board's keys,
// shared by the pictures and their sounds.
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
    train: from(48) + 4, // "The morning train.": cut to your card over your face
    pull: from(48) + 14, // the camera pulls back down the coach
    pulled: end(48) - 4,
    wave1: at(48, 0.3), // "Forty heads.": a ripple of ticks; the fare board 2.00
    wave2: at(48, 0.62), // "Forty tags, the same three words.": 1.90
    together: end(48) + 18, // the 3 s hold: all forty tick together; 1.80
    push: from(49), // "But here's the problem.": down the aisle to the stranger, no phone, no card
    end: to,
  };
  // the pickpocket (33-36): the 3 s performed hold after line 33
  const tug = end(33) + 6;
  // rock-paper-scissors (37-39)
  const read = at(37, 0.8);
  return {
    pick2: from(33), // "The platform. A hood behind a woman's bag"
    crimson: at(33, 0.55), // "and the first crimson the city has seen.": TAKES WALLET 97%
    tug, // you reach past her and tug her bag to her far side
    startle: tug + 12, // she turns to you, startled
    back: tug + 28, // he steps back, both hands open and empty
    turn: tug + 50, // every head on the platform turns toward his card
    touch: from(34), // "I didn't touch it." (his own voice)
    police: from(35), // "Call the police? For what."
    shrug: at(35, 0.4), // "He hasn't done anything.": you, palms up
    forecast: at(35, 0.74), // "That's the point of a forecast.": his card close
    anyway: from(36), // "Every head turns anyway."
    doors: at(36, 0.1), // "Doors shut on him."
    coffee: at(36, 0.2), // "The coffee seller won't pour."
    verdict: at(36, 0.32), // "A crimson tag is a verdict everyone can read"
    gap: at(36, 0.5), // "and nobody asks for the trial.": the platform steps away from him
    dusk: at(36, 0.68), // "By the weekend his tag says stands still."
    safest: at(36, 0.86), // "Safest man on the platform."
    start: from(37), // the kid and the man, rock-paper-scissors for the seat by the door
    throw1: at(37, 0.32), // rock beats scissors
    win: at(37, 0.46), // "Wins with rock.": the fist in the air
    rpsTag: at(37, 0.66), // "His tag says rock again.": ROCK AGAIN 83%
    read, // the man reads it
    throw2: Math.max(read + 40, end(37) + 6), // rock again, paper
    noFair: from(38) - 3, // "No fair." (his own voice)
    throw3: from(38) + 4, // rock again, paper again; the cap comes off in his hand
    capOff: at(38, 0.55),
    throw4: Math.max(from(39) + 20, at(39, 0.5)), // the cap back on, and rock AGAIN; paper again
    diagram: from(40) - 8, // (the end of the rock-paper-scissors shots)
    magician: from(40) - 8, // the street: the magician's fan
    pick: from(40), // "Pick a card." (his own voice)
    leave: Math.max(from(40) + 26, lineEnd(clips, 40) + 2), // the crowd reads his card and walks off
    magClose: at(41, 0.12), // he looks up at his own card
    noAct: at(41, 0.55), // "By lunch, no act.": the fan goes down
    tv: from(42), // "The whole city tries your trick.": the court's television
    screen: at(42, 0.3), // "The penalty kick."
    kickTag: at(42, 0.55), // "Tag says left"
    dive: at(42, 0.72), // "keeper goes left": already diving
    kick: at(42, 0.8),
    bet: from(43), // "Bet on it?": the betting shop window
    bookie: at(43, 0.45), // "The bookie read it first"
    ones: at(43, 0.68), // "and pays a dollar for a dollar.": the odds board clatters to ones
    row: from(44), // "Soon every striker obeys": three strikers, three tags, three saves
    zeros: at(44, 0.6), // "and nobody scores.": a scoreboard of zeros
    news: from(45), // "Another nil-nil." (the newsreader's voice) over a league table of nils
    sixTen: from(46), // you on the platform, TAKES THE SIX-TEN 98%
    map: at(46, 0.1),
    route: at(46, 0.25),
    ninety: at(46, 0.82), // "ninety-three per cent"
    timetable: from(47), // "You thought you were a free spirit. You're a timetable."
    arrive: at(47, 0.35),
    board: at(47, 0.55), // the platform clock flaps to 6:10 as the train stops; your card ticks
    t: train,
    end: to,
  };
}

const k = (at: number, text: string, pct: number | null, state: TagKey["state"]): TagKey => ({ at, text, pct, state });

/** Every tag in the beat, by who wears it. */
export function tags(t: T) {
  return {
    thief: [k(t.crimson, "TAKES WALLET", 97, "crimson")],
    still: [k(t.dusk - 30, "STANDS STILL", 99, "tick")],
    kid: [k(t.rpsTag, "ROCK AGAIN", 83, "new"), k(t.throw2 + 4, "ROCK AGAIN", 83, "tick"), k(t.throw3 + 4, "ROCK AGAIN", 83, "tick"), k(t.throw4 + 4, "ROCK AGAIN", 83, "tick")],
    magician: [k(t.magician + 6, "PALMS THE QUEEN", 99, "new")],
    striker: [k(t.kickTag, "KICKS LEFT", 91, "new"), k(t.kick + 2, "KICKS LEFT", 91, "tick")],
    you: [k(t.sixTen + 8, "TAKES THE SIX-TEN", 98, "new"), k(t.board + 2, "TAKES THE SIX-TEN", 98, "tick")],
  };
}

/** The betting shop's odds, before and after the bookie reads the tag. */
export const ODDS = ["4.50", "3.20", "6.00", "2.75"];

/** Every board in the beat. */
export function boards(t: T) {
  const b = (at: number, value: string): BoardKey => ({ at, value });
  return {
    score: [b(t.zeros - 10, "0-0")],
    clock: [b(t.sixTen - 30, "6:09"), b(t.board, "6:10")],
    odds: ODDS.map((v, i) => [b(t.bet - 30, v), b(t.ones + i * 5, "1.00")]),
  };
}
