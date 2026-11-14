// Every frame The Weapon uses (script v5, lines 51-61), from the narration clips. `at(i, p)`: p of the way through line
// i, placed on the words by their share of the line.
import type { Clip } from "@whatif/kit/timeline";
import { clock } from "./WhosCrimson.Common";

export type SeatsTimes = ReturnType<typeof seatsTimes>;

export function seatsTimes(clips: Clip[], to: number) {
  const { from, end, at } = clock(clips);
  const weekOne = at(56, 0.66);
  const weekTwo = at(56, 0.85);
  return {
    // 51 the curve: your maths teacher writes the mock scores up; then a hundred heads, TOP 4% on "the top 4 per cent"
    curve: from(51),
    pct: at(51, 0.48),
    top4: at(51, 0.7),
    // 52 a hundred of you, four places; you fourth, him fifth
    hundred: from(52),
    heads: at(52, 0.3),
    four: at(52, 0.56),
    fourth: at(52, 0.72),
    fifth: at(52, 0.86),
    // 53 the gift inside the lie rule: your face; "A mock score is true": papers slap down week after week, TRUE stamped
    weapon: from(53),
    ammo: at(53, 0.4),
    stamp: at(53, 0.5),
    fresh: at(53, 0.78),
    // 54 two weeks: you stand, say it, every card snaps open; read the room
    stand: from(54),
    up: at(54, 0.4),
    roomTag: at(54, 0.62),
    read: at(54, 0.8),
    // 55 "Sit down."
    sit: from(55),
    // 56 out of the group chat ("Him first."), no past papers, no notes; week one three red, week two nine
    chat: from(56),
    himFirst: at(56, 0.34),
    folder: at(56, 0.47),
    notes: weekOne,
    weekOne,
    weekTwo,
    week2Tag: weekTwo + 4,
    // 57 people notice: you brag and stare above their heads; "The group chat has a name for you now."
    notice: from(57),
    nickname: at(57, 0.6),
    rival: from(57),
    redTag: from(57),
    // 58 the rival: "Weatherman. Cloudy today?" (and the gap after it: the class snickers)
    tae: from(58),
    taeEnd: end(58),
    // 59-61 the counter at night; "You want half?"; you take the smaller half, on principle; his card -88
    store: from(59),
    half: from(60),
    take: from(61),
    principle: at(61, 0.3),
    down: at(61, 0.55),
    end: to,
  };
}
