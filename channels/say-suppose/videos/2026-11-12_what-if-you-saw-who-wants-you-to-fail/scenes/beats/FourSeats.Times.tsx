// Every frame The Weapon uses (script v7, lines 51-61), from the narration clips. `at(i, p)`: p of the way through line
// i, placed on the words by their share of the line.
import type { Clip } from "@whatif/kit/timeline";
import { clock } from "./WhosCrimson.Common";

export type SeatsTimes = ReturnType<typeof seatsTimes>;

export function seatsTimes(clips: Clip[], to: number) {
  const { from, end, at } = clock(clips);
  return {
    // 51 the national exam: a country-wide field of exam desks; TOP 4% = TOP GRADE on "the top 4 per cent"
    curve: from(51),
    pct: at(51, 0.55),
    top4: at(51, 0.62),
    // 52 "So you picture your class.": the field collapses to a hundred heads; four places; you fourth, him fifth;
    //    then the two real desks side by side
    hundred: from(52),
    heads: at(52, 0.33),
    four: at(52, 0.6),
    fourth: at(52, 0.73),
    fifth: at(52, 0.87),
    desks: at(52, 0.87) + 16,
    // 53 the gift inside the lie rule: your face; "A mock score": your hand slaps WEEK 1 down; "true": TRUE, once;
    //    "a new one every week": WEEK 2, WEEK 3; "Fresh ammunition": your hand slides the newest off
    weapon: from(53),
    ammo: at(53, 0.36),
    stamp: at(53, 0.53),
    week2Paper: at(53, 0.66),
    week3Paper: at(53, 0.76),
    fresh: at(53, 0.88),
    // 54 two weeks: you stand ("stand up"), say it, the cards snap open; your eyes go to his card first; two rows back
    //    the rival notices; then the room ("read the room")
    stand: from(54),
    up: at(54, 0.28),
    roomTag: at(54, 0.58),
    // 55 "Sit down."
    sit: from(55),
    // 56 the phone: "out of the group chat", "Him first." (his row into the REMOVED bin), "No past papers. No notes."
    //    (the folders lock), "Week one, three red." (3), "Week two, nine." (9)
    chat: from(56),
    himFirst: at(56, 0.39),
    folder: at(56, 0.48),
    notes: at(56, 0.61),
    weekOne: at(56, 0.7),
    three: at(56, 0.78),
    weekTwo: at(56, 0.87),
    nine: at(56, 0.96),
    // 57 people notice: week two's cards over the room, you brag and stare at the air above their heads; "The group
    //    chat has a name for you now." (the renamed contact)
    notice: from(57),
    week2Tag: from(57) + 2,
    nickname: at(57, 0.62),
    // 58 the rival: "Weatherman. Cloudy today?" (the cloud on "Cloudy"; the class snickers)
    tae: from(58),
    cloudy: at(58, 0.38),
    taeEnd: end(58),
    // 59-61 the counter at night; "You want half?" (you measure the halves); "You take the smaller half"; his card
    //    opens and keeps going down to -88
    store: from(59),
    half: from(60),
    take: from(61),
    principle: at(61, 0.38),
    down: at(61, 0.55),
    end: to,
  };
}
