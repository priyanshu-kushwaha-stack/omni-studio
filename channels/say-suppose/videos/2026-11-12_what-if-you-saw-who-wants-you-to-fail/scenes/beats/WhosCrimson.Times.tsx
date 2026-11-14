// Every frame Who's Red uses, from the narration clips (script v5, lines 22-47). `at(i, p)`: p of the way through line
// i, placed on the words by their share of the line. The performed moment on the steps (your bubble, his look up, the
// pat) is staged in the gap after line 43; the swat plays inside line 45 and the short gap after it.
import type { Clip } from "@whatif/kit/timeline";
import { clock } from "./WhosCrimson.Common";

export type CrimsonTimes = ReturnType<typeof crimsonTimes>;

export function crimsonTimes(clips: Clip[], to: number) {
  const { from, end, at } = clock(clips);
  const g0 = end(43), gap = from(44) - g0;
  const inGap = (p: number) => Math.round(g0 + gap * p);
  return {
    // 22-28 the corridor, the rival at the shoe lockers
    shoeIn: from(22), // "Next morning.": insert, your hand slams your outdoor shoe into its cubby
    youSet: at(22, 0.24), // "You've worked it out. Red is for enemies.": close on you, the letter up, eyes narrowing
    push: at(22, 0.66), // "So you go looking for one.": low angle, pushing in on his raised shoe; you stride in
    walkIn: at(22, 0.6),
    walkEnd: from(23) + 12,
    lockers: from(23), // "The rival.": on him, one foot up
    still: from(24), // his "Still here?"
    raise: from(25), // two-shot: you hold up the letter
    ots: at(25, 0.45), // over your shoulder on his head
    taehoTag: at(25, 0.55), // the card snaps open, flaps to -6
    youLook: from(26) + 8, // "Minus six.": cut to your face, let down
    barely: at(26, 0.5), // close on him: he barely looks up
    move: from(27), // his "Nice." without looking
    nudge: at(27, 0.55), // "Move.": his shoe pushes your letter arm aside
    leave: from(28), // "Two years of trash talk: minus six.": he walks off past you under his -6
    enemy: at(28, 0.4), // "You wanted an enemy.": your face, deadpan, watching him go
    receipt: at(28, 0.62), // "You got a receipt with legs.": the gag: a till receipt on his legs walks off under the -6
    // 29-31 the classroom, your maths teacher, marking
    kang: from(29),
    kangTag: from(29) + 4,
    good: from(30),
    youKang: from(31),
    kangTwo: at(31, 0.6),
    // 32 the mirror in the school toilets: your back, the sink and your reflection in one shot
    mirror: from(32),
    mirrorUp: at(32, 0.26), // "Nothing opens.": you swat the empty air over your head; the reflection copies
    hops: at(32, 0.36), // "So a mirror isn't a face.": two hops, then nose to the glass; the reflection copies
    ownHead: at(32, 0.61), // "Or the one card you can't see is yours.": you freeze; the tilt up to the air above your real head
    // 33-34 the tour group outside the station
    tourIn: end(32), // the cut to the station, in the gap before the line
    tour: from(33),
    tourTag: end(33) + 2, // the first of eleven cards; the rest ripple down the group (tourTagAt)
    tourClose: at(34, 0.5),
    // 35-37 the bus, the kid
    bus: from(35),
    shoes: at(35, 0.3), // "A little kid in a cap, feet swinging.": his swinging shoes, tilting up to the cap
    tryHim: at(35, 0.62), // "You try him."
    kid: from(36), // his "What did you win?"
    kidTag: end(36) + 2, // +77
    kidGrin: from(37),
    busTwo: at(37, 0.45),
    busAway: at(37, 0.85), // outside: the bus pulls away
    // 38-42 why: the desks, your two faces, the ladder sheet, the track, the kid, the rival far off, the next desk,
    // the same bar, the same exam; your face; the lanes
    desks: from(38), // "So a kid gives you everything,": three panels, the kid's first, +77
    rivalPanel: at(38, 0.28), // "your enemy gives you nothing,": the rival's panel, -6
    friendPanel: at(38, 0.5), // "and your best friend gives you minus eighty-four.": your best friend's panel ...
    friendTag: at(38, 0.76) - 22, // ... his -84 lands on "eighty-four"
    deskFaces: at(38, 0.88), // "Why?": the two of you at your desks, your face falls
    ladder: from(39),
    race: from(40), // the track: the kid outside it, the rival far ahead, you beside your best friend
    raceFaces: Math.round(from(40) + 3.5 * 30), // the two faces on the track
    kidOut: from(41), // "The kid isn't in the race.": he scoots past everyone on the grass, outside the lanes
    taehoFar: at(41, 0.22), // "The rival is twenty places ahead.": far past the finish, up a comically tall 20 post
    minjun: at(41, 0.47), // "Your best friend has the next desk,"
    sameBar: at(41, 0.7), // "the same chocolate bar,": the halves on the two desks
    sameExam: at(41, 0.86), // "the same exam.": one mock paper slaps down on both desks at once
    youLane: from(42), // "But here's the problem.": your face
    lanes: at(42, 0.13), // "Problem one: ...": the real classroom, PROBLEM 1 upper left over the wall
    strangers: at(42, 0.66), // "the card is useless on strangers,": grey zeros over the strangers, who go grey
    friends: at(42, 0.86), // "and lethal on friends.": close: his -84 over him, he steals your bigger half
    // 43 the academy steps at night; the performed moment in the gap after it
    stepsIn: from(43) - 4,
    steps: from(43),
    point: at(43, 0.62), // "You do, ...": you point straight up above his head, bubble: "There's a number over your head!"
    follow: inGap(0.08), // he follows your finger ...
    up: inGap(0.24), // ... looks up, sees nothing ...
    sky: inGap(0.38), // ... looks at the sky ...
    behind: inGap(0.52), // ... twists to look behind himself ...
    back: inGap(0.7), // ... then at you, brows up ...
    pat: inGap(0.82), // ... and pats the top of his own head twice
    ask: from(44), // his "What number?"
    bug: from(45), // his "Is it a bug? Get it off."
    duck: at(45, 0.45), // he ducks, swatting the air over his hair ...
    catches: end(45) + 4, // ... catches your face ...
    laugh: end(45) + 12, // ... laughs ...
    shove: from(46) + 14, // ... and shoves your shoulder
    // 46-47 he can't see it; your face; the street, all the faces you'll have to read
    pair: from(46),
    selfie: at(46, 0.17), // "Nobody sees the cards but you.": his phone up, a selfie check of his own head ...
    grab: at(46, 0.24), // ... while you grab at the empty air over it, twice
    yours: at(46, 0.42), // "And people don't like to admit..."
    wide: from(47), // "So asking is out. You'll have to read them.": close on you, set
    pull: at(47, 0.62), // "All of them.": one quick pull back, up to the lit signs
    end: to,
  };
}
