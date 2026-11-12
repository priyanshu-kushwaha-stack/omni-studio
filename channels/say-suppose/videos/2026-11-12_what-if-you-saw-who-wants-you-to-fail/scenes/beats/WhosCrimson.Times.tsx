// Every frame Who's Red uses, from the narration clips (script v3, narration lines 21-47). `at(i, p)`: p of the way
// through line i, placed on the words by their share of the line. The two performed moments on the steps are staged in
// the gaps after lines 42 and 44.
import type { Clip } from "@whatif/kit/timeline";
import { clock } from "./WhosCrimson.Common";

export type CrimsonTimes = ReturnType<typeof crimsonTimes>;

export function crimsonTimes(clips: Clip[], to: number) {
  const { from, end, at } = clock(clips);
  const g0 = end(42), gap = from(43) - g0;
  const inGap = (p: number) => Math.round(g0 + gap * p);
  const h0 = end(44), hold = from(45) - h0;
  const inHold = (p: number) => Math.round(h0 + hold * p);
  return {
    // 21-27 the corridor, the rival at the shoe lockers
    walkIn: from(21), // wide: you walk in with the letter, the rival far right swapping shoes
    youWalk: at(21, 0.45), // "Red is for enemies.": tracking you, set face
    walkEnd: at(21, 0.9),
    lockers: from(22), // "The rival.": on him, one foot up
    still: from(23), // his "Still here?"
    raise: from(24), // two-shot: you hold up the letter
    ots: at(24, 0.45), // over your shoulder on his head
    taehoTag: at(24, 0.55), // the card snaps open, flaps to -6
    youLook: from(25), // your face: brows up at the card
    barely: at(25, 0.45), // close on him: he barely looks up
    move: from(26), // his "Nice. Move."
    leave: from(27), // "Two years of trash talk: minus six.": he walks off under his -6
    nextDesk: at(27, 0.3), // "Your best friend ... the dangerous number is at the next desk.": your best friend, waving
    // 28-30 the classroom, your maths teacher, marking
    kang: from(28),
    kangTag: from(28) + 4,
    good: from(29),
    youKang: from(30),
    kangTwo: at(30, 0.6),
    // 31 the mirror in the school toilets
    mirror: from(31),
    mirrorUp: at(31, 0.4), // "Nothing opens.": your reflection's eyes go up
    ownHead: at(31, 0.61), // "Or the one card you can't see is yours.": above your own head
    // 32-33 the tour group outside the station
    tour: from(32),
    tourTag: end(32) + 2, // eleven cards together
    tourClose: at(33, 0.5),
    // 34-36 the bus, the kid
    bus: from(34),
    tryHim: at(34, 0.62), // "You try him."
    kid: from(35), // his "What did you win?"
    kidTag: end(35) + 2, // +77
    kidGrin: from(36),
    busTwo: at(36, 0.45),
    // 37-41 why: the desks, two paper sheets, the rival far off, your best friend at the next desk, the lanes
    desks: from(37),
    ladder: from(38),
    race: from(39),
    taehoFar: at(40, 0.19), // "The rival is twenty places ahead"
    minjun: at(40, 0.56), // "Your best friend has the next desk"
    youLane: from(41),
    lanes: at(41, 0.27),
    // 42 the academy steps at dusk; then the first performed moment in the gap after it
    steps: from(42),
    point: g0, // you point straight up above his head, mouth open; he looks at your face ...
    follow: inGap(0.14), // ... follows your finger ...
    up: inGap(0.3), // ... looks up, sees nothing ...
    sky: inGap(0.46), // ... looks at the sky ...
    back: inGap(0.6), // ... then at you, brows up ...
    pat: inGap(0.74), // ... and pats the top of his own head twice
    patEnd: from(43),
    ask: from(43), // his "What number?"
    bug: from(44), // his "Is it a bug? Get it off."
    duck: h0, // the second performed moment: he ducks, swatting at his hair ...
    catches: inHold(0.45), // ... catches your face ...
    laugh: inHold(0.6), // ... laughs ...
    shove: inHold(0.82), // ... and shoves your shoulder
    // 45-47 he can't see it; your face; the two of you small on the steps
    pair: from(45),
    yours: from(46),
    wide: from(47),
    end: to,
  };
}
