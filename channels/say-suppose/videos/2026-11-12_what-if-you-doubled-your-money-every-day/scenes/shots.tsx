// The first cut's shot list for script v3 (v2 plus the owner's eight notes of 2026-11-13): every `> SCENE:` and `> HOLD:` of script.md as a shot, anchored to a spoken
// line (its start, or its end for a hold after it) by the line's opening words, so a new voice take or a reordered
// script re-times the cut and a line that no longer exists fails the render. Tags are the script's `> TAG:` lines;
// bubbles its `> BUBBLE:`.
import type { ReactNode } from "react";
import { Street, Bank, Flat, FormClose, Wheat } from "./parts/Places";
import { Balloon, BackDoor, Ground, Midnight, TramRide } from "./parts/Scenes";
import { Bakery } from "./parts/Bakery";
import { Cairo } from "./parts/Archive";
import { Chess } from "./parts/Chess";
import { Door, EndCard, Hand } from "./parts/Door";
import { PhoneClose } from "./parts/PhoneClose";
import { balanceOn, phoneLines, ramp, type ShotTime } from "./parts/util";

/** A spoken line by its opening words (story.json's `text`), and which edge of it. */
export interface Anchor { line: string; edge?: "start" | "end"; plus?: number }
export interface ShotDef { at: Anchor; draw: (t: ShotTime) => ReactNode }

const S = (line: string, plus = 0): Anchor => ({ line, edge: "start", plus });
const E = (line: string, plus = 0): Anchor => ({ line, edge: "end", plus });
const day = (n: number) => phoneLines(balanceOn(n));

export const SHOTS: ShotDef[] = [
  // One Cent (morning, performed, no narrator): the thumbnail's frame. You tap your phone on the card reader and it
  // flashes red, DECLINED; Jonas reads your 0,01 out loud; Jonas pays; Lotte's free day-old roll (v3, note 2).
  { at: S("Lotte: Declined."), draw: (t) => <Bakery t={t} mood="morning" layout="thumb" phone="up" balance={day(1)} reader="declined" you={{ face: "worried" }} lotte={{ face: "sceptical", pose: "rest" }} /> },
  { at: S("Jonas: One cent?"), draw: (t) => <Bakery t={t} mood="morning" phone="up" balance={day(1)} reader="declined" jonas={{ face: "shocked" }} you={{ face: "worried" }} lotte={{ face: "sceptical", pose: "rest" }} /> },
  { at: S("Lotte: One cent."), draw: (t) => <Bakery t={t} mood="morning" layout="lotte" reader="declined" lotte={{ face: "happy", pose: "rest" }} jonas={{}} /> },
  { at: S("Jonas: You count"), draw: (t) => <Bakery t={t} mood="morning" reader="idle" jonas={{ face: "happy", held: "coins" }} you={{ face: "sceptical" }} lotte={{ pose: "rest" }} /> },
  { at: S("Jonas: My treat."), draw: (t) => <Bakery t={t} mood="morning" reader="idle" props={["coins"]} jonas={{ face: "happy", held: t.p < 0.4 ? "coins" : null }} you={{ face: "sad" }} lotte={{ pose: "palm", held: t.p < 0.4 ? null : "coin" }} /> },
  { at: S("Lotte: And a day-old"), draw: (t) => <Bakery t={t} mood="morning" layout="lotte" lotte={{ face: "happy", pose: "slide", held: "roll" }} jonas={{}} /> },
  // Midnight, the flat: the lock screen's coin tears into two (the hold), then Jonas.
  { at: E("Lotte: And a day-old"), draw: (t) => <Midnight t={t} mode="sleep" /> },
  { at: E("Lotte: And a day-old", 45), draw: (t) => <PhoneClose t={t} mood="night" mode="double" days={[1, 2]} /> },
  { at: S("Jonas: Did your phone"), draw: (t) => <Midnight t={t} mode="wake" /> },
  { at: S("Jonas: Two cents."), draw: (t) => <Midnight t={t} mode="lie" /> },
  // Two Cents (lamp): the narrator's first words, your face in the phone's glow; the premise; then the title card.
  { at: S("Two cents. Last night"), draw: (t) => <PhoneClose t={t} mood="lamp" mode="double" days={[2, 2]} /> },
  { at: S("What if your money"), draw: (t) => <PhoneClose t={t} mood="lamp" mode="double" days={[2, 6]} /> },
  // The Rule (morning): two cents' worth, the thumbnail's frame again; the 0 and the 2 peel off.
  { at: S("Here's the rule, once"), draw: (t) => <Bakery t={t} mood="morning" layout="thumb" phone="up" balance={day(2)} flaps={["0", "2"]} you={{ face: "happy" }} lotte={{ held: "chalk" }} /> },
  { at: S("There is no off switch"), draw: (t) => <PhoneClose t={t} mood="morning" mode="double" days={[2, 3]} /> },
  // Jonas pays on screen (v3, note 4): coins into Lotte's palm, two rolls back to him.
  { at: S("Two cents. You laugh"), draw: (t) => <Bakery t={t} mood="morning" phone="up" balance={day(2)} jonas={{ held: t.p < 0.5 ? "coins" : "roll", face: "happy" }} you={{ face: "happy" }} lotte={{ pose: t.p < 0.5 ? "palm" : "slide", held: t.p < 0.5 ? null : "roll" }} /> },
  { at: S("Lotte doesn't laugh"), draw: (t) => <Bakery t={t} mood="morning" layout="lotte" lotte={{ face: "sceptical", pose: "rest" }} jonas={{}} /> },
  // The king's wheat (lamp, after closing).
  { at: E("Lotte doesn't laugh"), draw: (t) => <Bakery t={t} mood="lamp" props={["chess"]} you={{ face: "neutral" }} lotte={{ pose: "rest" }} /> },
  { at: S("Lotte: My grandfather"), draw: (t) => <Bakery t={t} mood="lamp" layout="lotte" props={["chess"]} lotte={{ face: "sad", pose: "rest" }} /> },
  { at: S("A king, a chessboard"), draw: (t) => <Chess t={t} mode="board" squares={[0, 16]} /> },
  { at: E("A king, a chessboard"), draw: (t) => <Chess t={t} mode="dune" /> },
  { at: S("But you're counting squares"), draw: (t) => <PhoneClose t={t} mood="lamp" mode="double" days={[2, 4]} /> },
  // Your Own Roll (morning).
  { at: S("Day eleven."), draw: (t) => <PhoneClose t={t} mood="morning" mode="double" days={[8, 11]} /> },
  { at: S("Lotte: One forty."), draw: (t) => <Bakery t={t} mood="morning" props={["coins"]} you={{ face: "happy", pose: "give" }} lotte={{ pose: "palm" }} jonas={{ face: "happy" }} /> },
  { at: S("Jonas: Lotte. Lotte!"), draw: (t) => <Bakery t={t} mood="morning" jonas={{ face: "shocked" }} you={{ face: "happy" }} lotte={{ held: "coin", pose: "palm" }} /> },
  { at: S("Lotte: I saw."), draw: (t) => <Bakery t={t} mood="morning" layout="board" board="1,40" lotte={{ pose: "write", held: "chalk" }} /> },
  { at: S("Jonas: Three years."), draw: (t) => <Bakery t={t} mood="morning" jonas={{ face: "sceptical" }} you={{ face: "happy" }} lotte={{ face: "happy" }} /> },
  { at: E("Jonas: Three years.", 30), draw: (t) => <Bakery t={t} mood="morning" jonas={{ held: "note", face: "happy" }} you={{ face: "happy" }} lotte={{ face: "neutral" }} /> },
  // Thirty-One Cakes (day): a cake, a band, the street; then the party.
  { at: S("Day eighteen."), draw: (t) => <Bakery t={t} mood="day" you={{ face: "happy", pose: "give" }} lotte={{ face: "happy", pose: "write", held: "chalk" }} /> },
  { at: S("Day nineteen."), draw: (t) => <PhoneClose t={t} mood="day" mode="double" days={[18, 20]} /> },
  { at: S("Day twenty-one."), draw: (t) => <Street t={t} mood="day" mode="give" youFace="happy" /> },
  { at: S("Jonas: Who are all"), draw: (t) => <Street t={t} mood="day" mode="party" focus="jonas" jonasFace="shocked" /> },
  { at: S("Lotte: Your party."), draw: (t) => <Street t={t} mood="day" mode="party" focus="lotte" lotteFace="neutral" /> },
  { at: S("Jonas: I said a small"), draw: (t) => <Street t={t} mood="day" mode="party" focus="jonas" jonasFace="worried" /> },
  { at: S("Lotte: Your friend ordered"), draw: (t) => <Street t={t} mood="day" mode="party" focus="lotte" lotteFace="sceptical" /> },
  { at: S("Jonas: I'm thirty-one"), draw: (t) => <Street t={t} mood="day" mode="party" focus="jonas" jonasFace="shocked" /> },
  { at: S("Lotte: Sixty-two"), draw: (t) => <Street t={t} mood="day" mode="party" lotteFace="happy" jonasFace="shocked" /> },
  { at: S("Jonas: Did you count the candles"), draw: (t) => <Street t={t} mood="day" mode="party" focus="jonas" jonasFace="happy" /> },
  { at: S("Lotte: Counts everything"), draw: (t) => <Street t={t} mood="day" mode="party" focus="lotte" lotteFace="happy" /> },
  { at: S("Every morning you planned"), draw: (t) => <Street t={t} mood="dusk" mode="party" lotteFace="happy" jonasFace="happy" /> },
  // The Whole Tram (day).
  { at: S("Frau Weber: Who's paying"), draw: (t) => <TramRide t={t} focus="woman" /> },
  { at: S("Mehmet: That one"), draw: (t) => <TramRide t={t} focus="driver" /> },
  { at: S("Frau Weber: Why?"), draw: (t) => <TramRide t={t} focus="woman" /> },
  { at: S("Jonas: That one can't"), draw: (t) => <TramRide t={t} focus="jonas" /> },
  { at: S("Frau Weber: Well."), draw: (t) => <TramRide t={t} focus="woman" full /> },
  { at: E("Frau Weber: Well."), draw: (t) => <TramRide t={t} full /> },
  // Yesterday's Number (dusk).
  { at: S("But here's the problem"), draw: (t) => <Street t={t} mood="dusk" mode="after" /> },
  { at: S("Ask people to carry on"), draw: (t) => <PhoneClose t={t} mood="dusk" mode="double" days={[22, 23]} /> },
  { at: S("Each new night"), draw: (t) => <PhoneClose t={t} mood="day" mode="double" days={[23, 24]} /> },
  { at: S("The number's ahead"), draw: (t) => <Bakery t={t} mood="day" phone="up" balance={day(24)} you={{ face: "worried" }} lotte={{}} /> },
  // The Man from the Bank (day): you sign NOT A MISTAKE and he stamps it (v3, note 5: the form, not "Remember that, too").
  { at: S("Herr Brandt: Where does"), draw: (t) => <Bank t={t} /> },
  { at: E("Herr Brandt: Is it a mistake"), draw: (t) => <FormClose t={t} mode="sign" /> },
  { at: S("Herr Brandt: Not a mistake."), draw: (t) => <FormClose t={t} mode="stamp" /> },
  { at: E("Herr Brandt: Not a mistake.", 30), draw: (t) => <Bank t={t} page /> },
  // A Billion Cents (morning): the deed, then day thirty-one, the key shot.
  { at: S("Day twenty-eight."), draw: (t) => <Bakery t={t} mood="morning" props={["deed"]} you={{ face: "happy", pose: "give" }} lotte={{ pose: "slide", held: "roll" }} /> },
  { at: S("You hand her the deed"), draw: (t) => <Bakery t={t} mood="morning" layout="lotte" lotte={{ face: "neutral", pose: "slide", held: "roll" }} /> },
  { at: S("Lotte: Day-old. Free."), draw: (t) => <Bakery t={t} mood="morning" layout="lotte" lotte={{ face: "happy", pose: "slide", held: "roll" }} /> },
  { at: S("Day thirty-one."), draw: (t) => <Bakery t={t} mood="morning" layout="thumb" phone="up" balance={day(31)} you={{ face: "happy" }} lotte={{ held: "chalk" }} /> },
  { at: S("Lotte: Morning. Counted?"), draw: (t) => <Bakery t={t} mood="morning" layout="lotte" lotte={{ held: "chalk", pose: "palm" }} jonas={{}} /> },
  { at: S("You hold the phone up"), draw: (t) => <Bakery t={t} mood="morning" layout="thumb" phone="up" balance={day(31)} you={{ face: "happy" }} lotte={{ held: "chalk" }} /> },
  { at: E("You hold the phone up"), draw: (t) => <Bakery t={t} mood="morning" layout="thumb" phone="up" balance={day(31)} spill={ramp(t.p, 0, 0.7)} floor={t.p > 0.6} you={{ face: "happy" }} lotte={{ face: "shocked", held: "chalk" }} /> },
  { at: S("Ten million euros."), draw: (t) => <Bakery t={t} mood="morning" layout="thumb" phone="up" balance={day(31)} spill={1} floor you={{ face: "shocked" }} lotte={{ face: "shocked", held: "chalk" }} /> },
  { at: S("Jonas: Is that..."), draw: (t) => <Bakery t={t} mood="morning" phone="up" balance={day(31)} spill={1} floor jonas={{ face: "shocked" }} you={{ face: "neutral" }} lotte={{ face: "shocked", held: "chalk" }} /> },
  { at: E("Jonas: Is that..."), draw: (t) => <Bakery t={t} mood="morning" layout="board" board={["1,40", "", "1,40"]} lotte={{ pose: "write", held: "chalk" }} /> },
  // Can't Spend It (day): Jonas's club, the bread balloon, the spending run.
  { at: S("So you spend."), draw: (t) => <Street t={t} mood="day" mode="spend" /> },
  { at: S("Day thirty-three."), draw: (t) => <Ground t={t} jonas="sit" score="0 : 2" /> },
  { at: S("Jonas: You bought my club"), draw: (t) => <Ground t={t} jonas="shock" score="0 : 2" /> },
  { at: S("Jonas: They're winning"), draw: (t) => <Ground t={t} jonas="jump" score="3 : 2" /> },
  { at: S("Jonas: I don't know what"), draw: (t) => <Ground t={t} jonas="hands" score="3 : 2" /> },
  { at: S("By Sunday you could"), draw: (t) => <Ground t={t} jonas="hands" score="4 : 2" /> },
  // The balloon is Jonas's delivery idea; Lotte has one oven (v3, note 6).
  { at: S("Day thirty-five."), draw: (t) => <Balloon t={t} /> },
  { at: S("Jonas: Bread from the sky"), draw: (t) => <Balloon t={t} focus="jonas" jonasFace="happy" /> },
  { at: S("Lotte: And who bakes"), draw: (t) => <Balloon t={t} focus="lotte" lotteFace="sceptical" /> },
  { at: S("Jonas: You do. Look."), draw: (t) => <Balloon t={t} focus="jonas" jonasFace="happy" orders={[40, 100]} /> },
  { at: S("Lotte: I have two hands"), draw: (t) => <Balloon t={t} focus="lotte" lotteFace="determined" /> },
  { at: E("Lotte: I have two hands"), draw: (t) => <Balloon t={t} phase="rise" orders={[100, 400]} /> },
  { at: S("The balloon comes back"), draw: (t) => <Balloon t={t} phase="back" orders={[400, 400]} jonasFace="worried" /> },
  { at: S("Day thirty-seven."), draw: (t) => <Street t={t} mood="day" mode="spend" youFace="worried" /> },
  { at: S("Here's what you'd believed"), draw: (t) => <PhoneClose t={t} mood="day" mode="double" days={[37, 39]} /> },
  { at: S("It isn't. Money is a ticket"), draw: (t) => <Bakery t={t} mood="day" lotte={{ pose: "rest" }} props={["coins"]} you={{ face: "sceptical" }} /> },
  { at: S("But everything you spend"), draw: (t) => <Bakery t={t} mood="dusk" layout="board" board={["1,40", "2,10"]} lotte={{ pose: "write", held: "chalk" }} /> },
  // Lotte's Chalkboard (dusk): Karl at the back door, prices rise where the money lands (v3, note 8); Jonas reads the board.
  { at: S("Karl: Same flour."), draw: (t) => <BackDoor t={t} speaker="flour" /> },
  { at: S("Lotte: Triple? Karl"), draw: (t) => <BackDoor t={t} speaker="lotte" lotteFace="shocked" /> },
  { at: S("Karl: Same sack."), draw: (t) => <BackDoor t={t} speaker="flour" up={t.p > 0.5} /> },
  { at: S("Karl: So the mill"), draw: (t) => <BackDoor t={t} flourFace="neutral" lotteFace="worried" /> },
  { at: S("Lotte: And I charge"), draw: (t) => <BackDoor t={t} speaker="lotte" lotteFace="sad" /> },
  { at: S("Karl: Everyone does."), draw: (t) => <BackDoor t={t} take lotteFace="sad" flourFace="neutral" /> },
  { at: S("Day forty."), draw: (t) => <Bakery t={t} mood="dusk" board={["1,40", "2,10", "3,00", "4,20"]} jonas={{ face: "worried", held: "coins" }} lotte={{ pose: "write", held: "chalk" }} /> },
  { at: S("Lotte: Same rolls."), draw: (t) => <Bakery t={t} mood="dusk" layout="lotte" board="4,20" lotte={{ face: "sad", pose: "rest" }} /> },
  { at: S("Same rolls. Four twenty"), draw: (t) => <Bakery t={t} mood="dusk" layout="board" board="4,20" lotte={{ pose: "rest" }} /> },
  { at: E("Same rolls. Four twenty"), draw: (t) => <Bakery t={t} mood="lamp" layout="lotte" board="4,20" props={["book"]} lotte={{ face: "sad", pose: "write", held: "book" }} /> },
  { at: S("Lotte: A third."), draw: (t) => <Bakery t={t} mood="lamp" layout="lotte" board="4,20" lotte={{ face: "sad", pose: "rest" }} /> },
  { at: S("So she knows"), draw: (t) => <Bakery t={t} mood="lamp" layout="note" board="4,20" lotte={{ face: "sad" }} /> },
  { at: S("It isn't taken"), draw: (t) => <Bakery t={t} mood="lamp" layout="lotte" board="4,20" lotte={{ face: "sad", pose: "rest" }} /> },
  { at: E("It isn't taken"), draw: (t) => <Bakery t={t} mood="lamp" layout="board" board={["", "4,20"]} lotte={{ pose: "write", held: "chalk" }} /> },
  { at: S("You counted the price"), draw: (t) => <Bakery t={t} mood="lamp" phone="up" balance={day(40)} you={{ face: "worried" }} lotte={{ face: "sad", pose: "rest" }} /> },
  // Not Me (morning).
  { at: S("So you try the obvious"), draw: (t) => <Street t={t} mood="morning" mode="give" /> },
  { at: S("Lotte: Flour. Not money."), draw: (t) => <Bakery t={t} mood="morning" props={["envelope", "sacks"]} you={{ face: "worried", pose: "give" }} lotte={{ face: "determined", pose: "slide" }} /> },
  { at: S("By Saturday the board"), draw: (t) => <Bakery t={t} mood="morning" layout="board" board={["4,20", "5,10", "6,30"]} lotte={{ pose: "write", held: "chalk" }} /> },
  { at: S("Mansa Musa's gifts"), draw: (t) => <Cairo t={t} /> },
  { at: S("Jonas: Six thirty?"), draw: (t) => <Bakery t={t} mood="morning" board="6,30" jonas={{ held: "coins", face: "sad" }} lotte={{ face: "sad" }} you={{ face: "worried" }} /> },
  { at: S("Lotte: Since that one."), draw: (t) => <Bakery t={t} mood="morning" layout="lotte" board="6,30" lotte={{ face: "sad", pose: "slide" }} jonas={{}} /> },
  { at: S("Jonas: Not me."), draw: (t) => <Bakery t={t} mood="morning" board="6,30" phone="up" balance={day(45)} jonas={{ face: "sad" }} you={{ face: "worried", pose: "give" }} lotte={{ face: "sad" }} /> },
  { at: S("Jonas: Then it's me"), draw: (t) => <Bakery t={t} mood="morning" board="6,30" jonas={{ face: "sad" }} you={{ face: "afraid" }} lotte={{ face: "sad" }} /> },
  { at: E("Jonas: Then it's me"), draw: (t) => <Bakery t={t} mood="morning" layout="lotte" board="6,30" lotte={{ face: "sad", pose: "slide", held: "roll" }} jonas={{ face: "sad" }} /> },
  { at: S("Three problems."), draw: (t) => <PhoneClose t={t} mood="morning" mode="double" days={[50, 55]} /> },
  { at: S("And the only exit"), draw: (t) => <Bakery t={t} mood="morning" board="6,30" phone="up" balance={day(55)} you={{ face: "afraid" }} lotte={{ face: "sad", pose: "rest" }} /> },
  // The Planet (night).
  { at: S("Day fifty-five."), draw: (t) => <Wheat t={t} level={[0, 320]} /> },
  { at: E("You have more than that"), draw: (t) => <Wheat t={t} level={[320, 980]} /> },
  { at: S("Here's your choice."), draw: (t) => <Bakery t={t} mood="night" phone="up" balance={day(55)} props={["sacks"]} you={{ face: "worried" }} lotte={{ face: "sad", pose: "rest" }} /> },
  { at: S("You call Herr Brandt"), draw: (t) => <Bakery t={t} mood="night" phone="ear" you={{ face: "determined", pose: "ear" }} lotte={{ face: "sad", pose: "rest" }} /> },
  // Exactly Zero (lamp).
  { at: S("Herr Brandt: So it was"), draw: (t) => <Flat t={t} ear face="determined" /> },
  // Across the city he tears up the form you signed on day twenty-four (v3, note 5's payoff).
  { at: S("Herr Brandt: Everything goes"), draw: (t) => <Bank t={t} night /> },
  { at: S("Herr Brandt: Fifty minutes"), draw: (t) => <Flat t={t} face="determined" /> },
  { at: E("Herr Brandt: Fifty minutes"), draw: (t) => <PhoneClose t={t} mood="lamp" mode="countdown" days={[55, 55]} cents={[2 ** 54, 0]} /> },
  { at: S("Zero. Everything."), draw: (t) => <Flat t={t} face="relieved" /> },
  { at: S("Then the phone buzzes"), draw: (t) => <PhoneClose t={t} mood="lamp" mode="refund" days={[55, 55]} /> },
  { at: S("One cent at midnight"), draw: (t) => <Flat t={t} face="afraid" /> },
  { at: S("Who do you pay"), draw: (t) => <Flat t={t} face="determined" /> },
  { at: S("Lotte: Counted?"), draw: (t) => <Door t={t} give /> },
  // The wordless peak: the lock screen's coin with nothing to tear, then Lotte's closed hand, the camera drifting in.
  { at: E("You count. One cent."), draw: (t) => <PhoneClose t={t} mood="lamp" mode="still" days={[56, 56]} /> },
  { at: E("You count. One cent.", 100), draw: (t) => <Hand t={t} /> },
  { at: E("Zero, doubled"), draw: (t) => <Door t={t} lampOut /> },
  // Back to the Counter (morning).
  { at: S("Day fifty-six."), draw: (t) => <Bakery t={t} mood="morning" board="3,90" props={["coins"]} phone="down" jonas={{ held: "coins", face: "happy" }} you={{ face: "neutral" }} lotte={{ pose: "palm" }} /> },
  { at: E("Day fifty-six."), draw: (t) => <Bakery t={t} mood="morning" layout="lotte" board="3,90" phone="down" lotte={{ pose: t.p < 0.6 ? "palm" : "rest", face: "neutral" }} jonas={{}} /> },
  { at: S("The board says three"), draw: (t) => <Bakery t={t} mood="morning" layout="board" board="3,90" lotte={{ pose: "rest" }} /> },
  { at: S("Lotte slides you"), draw: (t) => <Bakery t={t} mood="morning" layout="lotte" board="3,90" lotte={{ face: "happy", pose: "slide", held: "roll" }} jonas={{}} /> },
  { at: S("A coin isn't a thing"), draw: (t) => <Bakery t={t} mood="morning" board="3,90" phone="down" you={{ face: "happy" }} lotte={{ face: "happy" }} jonas={{ face: "happy" }} /> },
  { at: E("A coin isn't a thing"), draw: (t) => <Bakery t={t} mood="morning" board="3,90" phone="down" jonas={{ held: "coins", face: t.p > 0.4 ? "shocked" : "happy" }} you={{ face: "happy" }} lotte={{ pose: "write", held: "chalk" }} /> },
  { at: E("So, would you have erased"), draw: (t) => <EndCard t={t} /> },
];

export interface TagDef { at: Anchor; text: string; frames?: number }
export const TAGS: TagDef[] = [
  { at: E("Lotte: My grandfather"), text: "1 · 2 · 4 · 8" },
  { at: S("Day eleven."), text: `DAY 11 · ${balanceOn(11)}` },
  { at: S("Day eighteen."), text: `DAY 18 · ${balanceOn(18)}` },
  { at: S("Day nineteen."), text: `DAY 19 · ${balanceOn(19)}` },
  { at: S("Day twenty-one."), text: `DAY 21 · ${balanceOn(21)}` },
  { at: S("Frau Weber: Who's paying"), text: `DAY 22 · ${balanceOn(22)}` },
  { at: S("Herr Brandt: Where does"), text: "DAY 24 · 83.886,08" },
  { at: S("Day twenty-eight."), text: `DAY 28 · ${balanceOn(28)}` },
  { at: S("You hold the phone up"), text: "DAY 31 · 10.737.418,24" },
  { at: S("Day thirty-three."), text: `DAY 33 · ${balanceOn(33)}` },
  { at: S("Day thirty-five."), text: `DAY 35 · ${balanceOn(35)}` },
  { at: E("Day thirty-seven."), text: "DAY 37 · 687.194.767,36" },
  { at: S("Karl: Same flour."), text: "DAY 40" },
  { at: S("So you try the obvious"), text: `DAY 45 · ${balanceOn(45)}` },
  { at: S("Day fifty-five."), text: "DAY 55 · 180.143.985.094.819,84" },
  { at: E("Herr Brandt: Fifty minutes"), text: "23:50 · 0,00" },
  { at: S("Then the phone buzzes"), text: "23:57 · 0,01" },
  { at: E("You count. One cent."), text: "23:59 · 0,00" },
  { at: S("Day fifty-six."), text: "DAY 56" },
];

export interface BubbleDef { at: Anchor; text: string; x: number; y: number; frames?: number }
export const BUBBLES: BubbleDef[] = [
  { at: E("Herr Brandt: Where does"), text: "Mine.", x: 960, y: 520, frames: 60 },
  { at: E("Herr Brandt: So it was"), text: "Yes.", x: 1100, y: 380, frames: 50 },
];

/** A character's name tag, about a second, the first time they are in frame (owner, 2026-11-13). Screen pixels. */
export interface NameDef { at: Anchor; name: string; role?: string; x: number; y: number; side?: "left" | "right"; frames?: number }
export const NAMES: NameDef[] = [
  { at: S("Lotte: Declined."), name: "YOU", x: 250, y: 170 },
  { at: S("Lotte: Declined."), name: "LOTTE", role: "the baker", x: 1250, y: 190, side: "left" },
  { at: S("Jonas: One cent?"), name: "JONAS", role: "your flatmate", x: 860, y: 260 },
  { at: S("Frau Weber: Who's paying"), name: "FRAU WEBER", role: "on the tram", x: 1330, y: 520 },
  { at: S("Mehmet: That one"), name: "MEHMET", role: "the driver", x: 1680, y: 500, side: "left" },
  { at: S("Herr Brandt: Where does"), name: "HERR BRANDT", role: "your bank", x: 1480, y: 470 },
  { at: S("Day thirty-five."), name: "KARL", role: "the flour man", x: 1560, y: 620, side: "left" },
];
