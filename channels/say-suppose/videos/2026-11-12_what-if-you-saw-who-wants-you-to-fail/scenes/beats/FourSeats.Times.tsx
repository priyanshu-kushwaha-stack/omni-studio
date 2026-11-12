// Every frame Four Seats uses, from the narration clips (narration lines 46-59). `at(i, p)`: p of the way through line
// i, placed on the words by their share of the line.
import type { Clip } from "@whatif/kit/timeline";
import { clock } from "./WhosCrimson.Common";

export type SeatsTimes = ReturnType<typeof seatsTimes>;

export function seatsTimes(clips: Clip[], to: number) {
  const { from, end, at } = clock(clips);
  const holdEnd = from(55);
  return {
    // 46-49 the curve, the four seats, the weapon
    curve: from(46), // the classroom: Ms. Kang draws the old curve on the board
    board: at(46, 0.5), // push in on the board
    pct: from(47), // paper: the curve, the top four per cent shaded ...
    widen: at(47, 0.55), // ... and the five-tier scale after you, widened to ten (dashed)
    seats: from(48), // paper: the class from above, four seats
    minjunSeat: at(48, 0.5), // "Min-jun wants one."
    youSeat: at(48, 0.78), // "So do you."
    weapon: from(49), // your face, set
    // 50 the first mock score: you stand and say it; cards over every head (Min-jun -84)
    stand: from(50),
    roomTag: at(50, 0.5),
    read: at(50, 0.9), // you read the room
    // 51 the group chat; 52 the past-paper folder
    chat: from(51),
    folder: from(52),
    reach: at(52, 0.35), // Min-jun reaches for it
    keep: at(52, 0.62), // "You keep the seat."
    // 53-54 the store at night, the half kimbap; the hold
    store: from(53),
    half: end(53) + 2, // the bubble "Half?"
    past: from(54), // you walk past it
    hold: end(54) + 4, // his hand stays out ...
    drop: Math.round(end(54) + (holdEnd - end(54)) * 0.62), // ... a beat too long, then drops
    // 55-58 the climb
    climb: from(55), // paper: the rank list, you climb in three stamps
    red: from(56), // the room again, redder; Min-jun -88
    redTag: at(56, 0.15),
    cuts: from(57), // paper: the closer, the sharper it cuts
    down: from(58), // close on Min-jun: -91
    downTag: from(58) + 4,
    // 59 the top: the rank list with you first, the chair beside you empty
    top: from(59),
    pull: at(59, 0.45),
    end: to,
  };
}
