// Every frame Four in a Hundred uses, from the narration clips (script v3, narration lines 62-79). `at(i, p)`: p of the
// way through line i, placed on the words by their share of the line. The performed moment at the store (after his
// "Half...?") is staged in the gap between the end of line 72 and the start of line 73.
import type { Clip } from "@whatif/kit/timeline";
import { clock } from "./WhosCrimson.Common";

export type SeatsTimes = ReturnType<typeof seatsTimes>;

export function seatsTimes(clips: Clip[], to: number) {
  const { from, end, at } = clock(clips);
  const g0 = end(72), gap = from(73) - g0;
  const inGap = (p: number) => Math.round(g0 + gap * p);
  return {
    // 62 one plain fact: your maths teacher lists the mock scores on the board; then (outside review of v4.1: no bell curve,
    // no blank paper) straight to a hundred heads, and the top four places light with TOP 4% on "the top 4 per cent"
    curve: from(62),
    pct: at(62, 0.42),
    top4: at(62, 0.68),
    // 63 a hundred of you, four places; you fourth, him fifth
    hundred: from(63),
    heads: at(63, 0.3), // "A hundred of you."
    four: at(63, 0.56), // "Four places."
    fourth: at(63, 0.72), // "You're fourth."
    fifth: at(63, 0.86), // "He's fifth."
    // 64 the weapon; 65 week one's mock score: you stand, cards over every head (him -84, three red)
    weapon: from(64),
    stand: from(65),
    up: at(65, 0.42), // "you stand up"
    roomTag: at(65, 0.62), // "say it out loud"
    read: at(65, 0.82), // "and read the room"
    // 66 your maths teacher: "Sit down."
    sit: from(66),
    // 67 out of the group chat; the shared folder; no notes; no help
    chat: from(67),
    folder: at(67, 0.43), // "No more past papers from the shared folder."
    notes: at(67, 0.8), // "No notes. No help.": a hand out for your notes, you shake your head, turn your back
    // 68 week one, three red; week two, nine (him -88)
    weekOne: from(68),
    weekTwo: at(68, 0.55),
    week2Tag: at(68, 0.6),
    // 69-70 the rival: "What's with you?"; still -6
    rival: from(69),
    still6: from(70),
    // 71-72 the store at night; then the performed moment in the gap after his "Half...?"
    store: from(71),
    half: from(72), // his "Half...?", the bigger half held out, half a smile
    look: inGap(0.08), // you look at the chocolate ...
    card: inGap(0.18), // ... then at the card over his head, still on -88 ...
    pastHim: inGap(0.28), // ... then past him
    walk: inGap(0.36), // you walk
    stay: inGap(0.5), // his hand stays out one beat too long ...
    drop: inGap(0.6), // ... then drops
    pocket: inGap(0.7), // he looks at the half, then puts both halves in his pocket
    cat: inGap(0.86), // the cat on the crate watches you go
    // 73-74 the next night: a second on the glass door sliding open on the dark street (the reset), then the empty spot by
    // the chiller where your best friend always stands, you walking past it alone; the clerk looks past you, then at you
    nextNight: from(73),
    empty: from(73) + 32,
    clerk: from(74), // his "Just you tonight?"
    clerkYou: at(74, 0.6),
    // 75 you climb: a tally, 4 -> 3 -> 2
    climb: from(75),
    fourth2: at(75, 0.4),
    third: at(75, 0.6),
    second: at(75, 0.85),
    // 76-78 the room redder, him -91; the closer, the sharper (his desk slides toward yours in three steps, his card
    // deeper red each time); him close, still -91
    red: from(76),
    redTag: at(76, 0.15),
    cuts: from(77),
    nearer: at(77, 0.36),
    nearest: at(77, 0.68),
    down: from(78),
    // 79 second place; the room, the bench beside you empty; then from above, held: his empty desk, his chocolate half
    // untouched
    top: from(79),
    pull: at(79, 0.3),
    emptyDesk: at(79, 0.55),
    end: to,
  };
}
