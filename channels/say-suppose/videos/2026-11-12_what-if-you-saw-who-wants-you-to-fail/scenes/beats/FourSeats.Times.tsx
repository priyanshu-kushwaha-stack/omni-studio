// Every frame Four in a Hundred uses, from the narration clips (script v2.1, narration lines 44-53). `at(i, p)`: p of
// the way through line i, placed on the words by their share of the line. The performed moment at the store (the
// chocolate bar, after "Half?") is staged in the gap between the end of line 48 and the start of line 49.
import type { Clip } from "@whatif/kit/timeline";
import { clock } from "./WhosCrimson.Common";

export type SeatsTimes = ReturnType<typeof seatsTimes>;

export function seatsTimes(clips: Clip[], to: number) {
  const { from, end, at } = clock(clips);
  const g0 = end(48);
  const gap = from(49) - g0;
  const inGap = (p: number) => Math.round(g0 + gap * p);
  return {
    // 44 one plain fact: the curve, the top four per cent
    curve: from(44), // your maths teacher draws the curve on the board
    pct: at(44, 0.42), // paper: the curve, the top four per cent teal
    // 45 a hundred of you, four places; you fourth, him fifth
    hundred: from(45),
    heads: at(45, 0.3), // "A hundred of you."
    four: at(45, 0.56), // "Four places."
    fourth: at(45, 0.72), // "You're fourth."
    fifth: at(45, 0.86), // "He's fifth."
    // 46 the weapon; 47 the first mock score and the two weeks after it
    weapon: from(46),
    stand: from(47), // the room; you stand ...
    up: at(47, 0.2), // ... "you stand up"
    roomTag: at(47, 0.38), // "say it out loud": cards over every head; him -84
    read: at(47, 0.5), // "and read the room"
    away: at(47, 0.62), // "Anyone who goes red, you stop helping.": you turn away from a red one
    notes: at(47, 0.84), // "Stop lending notes.": a hand out for your notes; you shake your head
    second: at(47, 0.93), // the next mock score: him, -88
    // 48 the store at night; then the performed moment in the gap after it
    store: from(48),
    half: g0 + 2, // the bubble "Half?" as he snaps the bar ...
    snap: inGap(0.05),
    offer: inGap(0.1), // ... and holds out the bigger half, looking at you, half a smile
    halfEnd: inGap(0.3),
    look: inGap(0.2), // you look at the chocolate ...
    card: inGap(0.3), // ... then at the card over his head, still on -88 ...
    pastHim: inGap(0.38), // ... then past him
    walk: inGap(0.44), // you walk
    stay: inGap(0.64), // his hand stays out one beat too long ...
    drop: inGap(0.74), // ... then drops
    pocket: inGap(0.86), // he looks at the half, then puts both halves in his pocket
    // 49-53 the climb
    climb: from(49), // the hundred heads: yours goes first
    red: from(50), // the room again, redder; him -91
    redTag: at(50, 0.15),
    cuts: from(51), // paper: the closer, the sharper it cuts
    down: from(52), // close on him under -91
    top: from(53), // the rank list with you first; the desk beside you empty
    pull: at(53, 0.4),
    end: to,
  };
}
