// The first cut's shot list for script v5 (the exciting-not-sad rules of 2026-11-13 and the Gemini outside review): every `> SCENE:` and `> HOLD:` of script.md as a shot, anchored to a spoken
// line (its start, or its end for a hold after it) by the line's opening words, so a new voice take or a reordered
// script re-times the cut and a line that no longer exists fails the render. Tags are the script's `> TAG:` lines;
// bubbles its `> BUBBLE:`, cards its `> CARD:`. A shot's `sfx` are its sound effects (make_sfx.sh), at a share of the
// shot (`p`) or a frame into it (`f`), so they move with the picture.
import type { ReactNode } from "react";
import { Street, Bank, Flat, FormClose } from "./parts/Places";
import { Balloon, BackDoor, Ground, Midnight, TramRide } from "./parts/Scenes";
import { Bakery } from "./parts/Bakery";
import { Cairo } from "./parts/Archive";
import { Chess } from "./parts/Chess";
import { Door, EndCard, Hand } from "./parts/Door";
import { PhoneClose } from "./parts/PhoneClose";
import { Airdrop, Atm, BarChart, Cosmos, Globe, News, NightRun, Shares, ShopPhone } from "./parts/Future";
import { balanceOn, phoneLines, ramp, type ShotTime } from "./parts/util";

/** A spoken line by its opening words (story.json's `text`), and which edge of it. */
export interface Anchor { line: string; edge?: "start" | "end"; plus?: number }
export interface Sfx { file: string; p?: number; f?: number; vol?: number }
export interface ShotDef { at: Anchor; draw: (t: ShotTime) => ReactNode; sfx?: Sfx[] }

const S = (line: string, plus = 0): Anchor => ({ line, edge: "start", plus });
const E = (line: string, plus = 0): Anchor => ({ line, edge: "end", plus });
const day = (n: number) => phoneLines(balanceOn(n));
/** The midnight rip (the rule's sound, rules/sound.md #8) each time PhoneClose's coin tears: night n tears at
 *  local 0.55 of its stretch, as PhoneClose draws it (the nights fill the shot's first half). */
const rips = ([a, b]: [number, number], vol = 0.3): Sfx[] =>
  Array.from({ length: b - a }, (_, n) => ({ file: "rip", p: (n + 0.55) / ((b - a) * 2), vol }));

export const SHOTS: ShotDef[] = [
  // Flash-forward (v5, the outside review's hook): the thumbnail's spill, the Earth, then a rewind to one cent.
  { at: S("Day thirty-one. Ten million"), draw: (t) => <Bakery t={t} mood="morning" layout="thumb" phone="up" balance={day(31)} spill={ramp(t.p, 0, 0.6)} floor={t.p > 0.5} jonas={{ face: "shocked" }} you={{ face: "happy" }} lotte={{ face: "shocked", held: "chalk" }} />,
    sfx: [{ file: "pour", f: 0, vol: 1 }] },
  { at: S("Day fifty-five. More money"), draw: (t) => <Globe t={t} /> },
  { at: S("And it starts with one cent"), draw: (t) => <PhoneClose t={t} mood="morning" mode="countdown" days={[1, 1]} cents={[2 ** 30, 1]} /> },
  // One Cent (performed): you tap, it flashes red at once; Jonas reads your 0,01 and pays.
  { at: E("And it starts with one cent"), draw: (t) => <Bakery t={t} mood="morning" layout="thumb" phone="up" balance={day(1)} reader="declined" you={{ face: "worried" }} lotte={{ face: "sceptical", pose: "rest" }} />,
    sfx: [{ file: "tap", f: 8, vol: 1 }, { file: "declined", f: 28, vol: 0.35 }] },
  { at: S("Jonas: One cent?"), draw: (t) => <Bakery t={t} mood="morning" phone="up" balance={day(1)} reader="declined" jonas={{ face: "shocked" }} you={{ face: "worried" }} lotte={{ face: "sceptical", pose: "rest" }} /> },
  { at: S("Jonas: My treat."), draw: (t) => <Bakery t={t} mood="morning" reader="idle" props={["coins"]} jonas={{ face: "happy", held: t.p < 0.4 ? "coins" : null }} you={{ face: "sad" }} lotte={{ pose: "palm", held: t.p < 0.4 ? null : "coin" }} /> },
  { at: E("Jonas: My treat."), draw: (t) => <Midnight t={t} mode="sleep" /> },
  { at: E("Jonas: My treat.", 30), draw: (t) => <PhoneClose t={t} mood="night" mode="double" days={[1, 2]} />, sfx: rips([1, 2], 0.6) },
  { at: S("Jonas: Did your phone"), draw: (t) => <Midnight t={t} mode="wake" /> },
  { at: S("Jonas: Two cents."), draw: (t) => <Midnight t={t} mode="lie" /> },
  // Two Cents: the narrator, the premise, the title card.
  { at: S("Two cents. Last night"), draw: (t) => <PhoneClose t={t} mood="lamp" mode="double" days={[2, 2]} /> },
  { at: S("What if your money"), draw: (t) => <PhoneClose t={t} mood="lamp" mode="double" days={[2, 6]} />, sfx: rips([2, 6]) },
  // The Rule.
  { at: S("Here's the rule, once"), draw: (t) => <Bakery t={t} mood="morning" layout="thumb" phone="up" balance={day(2)} flaps={["0", "2"]} you={{ face: "happy" }} lotte={{ held: "chalk" }} /> },
  { at: S("There is no off switch"), draw: (t) => <PhoneClose t={t} mood="morning" mode="double" days={[2, 2]} /> },
  { at: S("Two cents. You laugh"), draw: (t) => <Bakery t={t} mood="morning" phone="up" balance={day(2)} jonas={{ held: t.p < 0.5 ? "coins" : "roll", face: "happy" }} you={{ face: "happy" }} lotte={{ pose: t.p < 0.5 ? "palm" : "slide", held: t.p < 0.5 ? null : "roll" }} /> },
  { at: S("Lotte doesn't laugh"), draw: (t) => <Bakery t={t} mood="morning" layout="lotte" lotte={{ face: "sceptical", pose: "rest" }} jonas={{}} /> },
  { at: E("Lotte doesn't laugh"), draw: (t) => <Bakery t={t} mood="lamp" props={["chess"]} you={{ face: "neutral" }} lotte={{ pose: "rest" }} /> },
  { at: S("Lotte: My grandfather"), draw: (t) => <Bakery t={t} mood="lamp" layout="lotte" props={["chess"]} lotte={{ face: "happy", pose: "rest" }} /> },
  { at: S("A king, a chessboard"), draw: (t) => <Chess t={t} mode="board" squares={[0, 16]} /> },
  { at: E("A king, a chessboard"), draw: (t) => <Chess t={t} mode="dune" /> },
  { at: S("But you're counting squares"), draw: (t) => <PhoneClose t={t} mood="lamp" mode="double" days={[2, 4]} />, sfx: rips([2, 4]) },
  // Your Own Roll: you pay, Jonas behind (the outside review: you at the front, not Jonas).
  { at: S("Day eleven."), draw: (t) => <PhoneClose t={t} mood="morning" mode="double" days={[8, 11]} />, sfx: rips([8, 11]) },
  { at: S("Lotte: One forty."), draw: (t) => <Bakery t={t} mood="morning" props={["coins"]} you={{ face: "happy", pose: "give" }} lotte={{ pose: "palm" }} /> },
  { at: S("Jonas: Lotte. Lotte!"), draw: (t) => <Bakery t={t} mood="morning" jonas={{ face: "shocked" }} you={{ face: "happy" }} lotte={{ held: "coin", pose: "palm" }} /> },
  { at: S("Lotte: I saw."), draw: (t) => <Bakery t={t} mood="morning" layout="board" board="1,40" lotte={{ pose: "write", held: "chalk" }} /> },
  { at: S("Jonas: Three years."), draw: (t) => <Bakery t={t} mood="morning" jonas={{ face: "sceptical" }} you={{ face: "happy" }} lotte={{ face: "happy" }} /> },
  // Thirty-One Cakes: the cakes and the band are drawn now.
  { at: S("Day eighteen."), draw: (t) => <Bakery t={t} mood="day" you={{ face: "happy", pose: "give" }} lotte={{ face: "happy", pose: "write", held: "chalk" }} /> },
  { at: S("Day nineteen."), draw: (t) => <PhoneClose t={t} mood="day" mode="double" days={[18, 19]} />, sfx: rips([18, 19]) },
  { at: S("Day twenty-one."), draw: (t) => <Street t={t} mood="day" mode="give" youFace="happy" /> },
  { at: S("Jonas: Who are all"), draw: (t) => <Street t={t} mood="day" mode="party" lotteFace="happy" jonasFace="shocked" /> },
  { at: S("Lotte: Your party."), draw: (t) => <Street t={t} mood="day" mode="party" focus="lotte" lotteFace="neutral" /> },
  { at: S("Jonas: I said a small"), draw: (t) => <Street t={t} mood="day" mode="party" focus="jonas" jonasFace="worried" /> },
  { at: S("Lotte: Your friend ordered"), draw: (t) => <Street t={t} mood="day" mode="party" focus="lotte" lotteFace="sceptical" /> },
  { at: S("Jonas: I'm thirty-one"), draw: (t) => <Street t={t} mood="day" mode="party" focus="jonas" jonasFace="shocked" /> },
  { at: S("Lotte: Sixty-two"), draw: (t) => <Street t={t} mood="day" mode="party" lotteFace="happy" jonasFace="shocked" /> },
  { at: S("Jonas: Did you count the candles"), draw: (t) => <Street t={t} mood="day" mode="party" focus="jonas" jonasFace="happy" /> },
  { at: S("Lotte: Counts everything"), draw: (t) => <Street t={t} mood="day" mode="party" focus="lotte" lotteFace="happy" /> },
  { at: S("Every morning you planned"), draw: (t) => <Street t={t} mood="dusk" mode="party" lotteFace="happy" jonasFace="happy" /> },
  // The Whole Tram, packed.
  { at: S("Frau Weber: Who's paying"), draw: (t) => <TramRide t={t} focus="woman" /> },
  { at: S("Mehmet: That one"), draw: (t) => <TramRide t={t} focus="driver" /> },
  { at: S("Frau Weber: Well."), draw: (t) => <TramRide t={t} focus="woman" full /> },
  { at: E("Frau Weber: Well."), draw: (t) => <TramRide t={t} full /> },
  // Yesterday's Number: the bar chart (one night taller than all the nights before it).
  { at: S("But here's the problem"), draw: (t) => <Street t={t} mood="dusk" mode="after" /> },
  { at: S("Ask people to carry on"), draw: (t) => <BarChart t={t} /> },
  { at: S("The number's ahead"), draw: (t) => <Bakery t={t} mood="day" phone="up" balance={day(24)} you={{ face: "worried" }} lotte={{}} /> },
  // The Man from the Bank.
  { at: S("Herr Brandt: Where does"), draw: (t) => <Bank t={t} /> },
  { at: E("Herr Brandt: Is it a mistake"), draw: (t) => <FormClose t={t} mode="sign" /> },
  { at: S("Herr Brandt: Not a mistake."), draw: (t) => <FormClose t={t} mode="stamp" />, sfx: [{ file: "stamp", f: 5, vol: 0.25 }] },
  // A Billion Cents.
  { at: S("Day twenty-eight."), draw: (t) => <Bakery t={t} mood="morning" props={["deed"]} you={{ face: "happy", pose: "give" }} lotte={{ pose: "slide", held: "roll" }} /> },
  { at: S("Lotte: Yesterday's. Free."), draw: (t) => <Bakery t={t} mood="morning" layout="lotte" lotte={{ face: "happy", pose: "slide", held: "roll" }} /> },
  { at: S("Lotte: Morning. All counted?"), draw: (t) => <Bakery t={t} mood="morning" layout="thumb" phone="up" balance={day(31)} you={{ face: "happy" }} lotte={{ held: "chalk", pose: "palm" }} /> },
  { at: S("You hold the phone up"), draw: (t) => <Bakery t={t} mood="morning" layout="thumb" phone="up" balance={day(31)} you={{ face: "happy" }} lotte={{ held: "chalk" }} /> },
  { at: E("You hold the phone up"), draw: (t) => <Bakery t={t} mood="morning" layout="thumb" phone="up" balance={day(31)} spill={ramp(t.p, 0, 0.7)} floor={t.p > 0.6} you={{ face: "happy" }} lotte={{ face: "shocked", held: "chalk" }} />,
    sfx: [{ file: "pour", f: 0, vol: 1 }] },
  { at: S("Ten million euros."), draw: (t) => <Bakery t={t} mood="morning" layout="thumb" phone="up" balance={day(31)} spill={1} floor you={{ face: "shocked" }} lotte={{ face: "shocked", held: "chalk" }} /> },
  { at: S("Jonas: Is that..."), draw: (t) => <Bakery t={t} mood="morning" phone="up" balance={day(31)} spill={1} floor jonas={{ face: "shocked" }} you={{ face: "happy" }} lotte={{ face: "shocked", held: "chalk" }} /> },
  // Spend It: the spending run backfires; the club.
  { at: S("First, the obvious trick."), draw: (t) => <Atm t={t} /> },
  { at: S("So you spend."), draw: (t) => <ShopPhone t={t} mode="spend" /> },
  { at: S("At midnight, what's left"), draw: (t) => <ShopPhone t={t} mode="midnight" />, sfx: [{ file: "rip", p: 0.45, vol: 0.4 }] },
  { at: S("Day thirty-three."), draw: (t) => <Ground t={t} jonas="sit" score="0 : 2" /> },
  { at: S("Jonas: You bought my club"), draw: (t) => <Ground t={t} jonas="shock" score="0 : 2" /> },
  { at: S("Jonas: They're winning"), draw: (t) => <Ground t={t} jonas="jump" score="3 : 2" /> },
  { at: S("Jonas: I don't know what"), draw: (t) => <Ground t={t} jonas="hands" score="4 : 2" /> },
  // Why not invest it? (rules #21: the loophole said and answered.)
  { at: S("You're thinking it."), draw: (t) => <Bakery t={t} mood="day" phone="up" balance={day(34)} you={{ face: "sceptical" }} lotte={{ pose: "rest" }} /> },
  { at: S("You try. You buy shares."), draw: (t) => <Shares t={t} /> },
  // Bread From the Sky: BREAD-NET's thousand drones; Lotte has one oven.
  { at: S("Day thirty-five. A hundred"), draw: (t) => <Balloon t={t} /> },
  { at: S("Jonas: Bread from the sky"), draw: (t) => <Balloon t={t} focus="jonas" jonasFace="happy" /> },
  { at: S("Lotte: And who bakes"), draw: (t) => <Balloon t={t} focus="lotte" lotteFace="sceptical" /> },
  { at: S("Jonas: You do. Look."), draw: (t) => <Balloon t={t} focus="jonas" jonasFace="happy" orders={[40, 100]} /> },
  { at: S("Lotte: I have two hands"), draw: (t) => <Balloon t={t} focus="lotte" lotteFace="determined" /> },
  { at: E("Lotte: I have two hands"), draw: (t) => <Balloon t={t} phase="rise" orders={[1000, 40000]} />, sfx: [{ file: "whoosh", f: 10, vol: 0.5 }] },
  { at: S("Day thirty-seven."), draw: (t) => <Street t={t} mood="day" mode="spend" youFace="worried" /> },
  { at: S("Here's what you'd believed"), draw: (t) => <PhoneClose t={t} mood="day" mode="double" days={[37, 39]} />, sfx: rips([37, 39]) },
  { at: S("It isn't. Money is a ticket"), draw: (t) => <Bakery t={t} mood="day" lotte={{ pose: "rest" }} props={["coins"]} you={{ face: "sceptical" }} /> },
  { at: S("But everything you spend"), draw: (t) => <Bakery t={t} mood="dusk" layout="board" board={["1,40", "2,10"]} lotte={{ pose: "write", held: "chalk" }} /> },
  // Lotte's Chalkboard: Karl, the prices, the one quiet beat (her savings book, about 20 s).
  { at: S("Karl: Same flour."), draw: (t) => <BackDoor t={t} speaker="flour" /> },
  { at: S("Lotte: Triple? Karl"), draw: (t) => <BackDoor t={t} speaker="lotte" lotteFace="shocked" /> },
  { at: S("Karl: Same sack."), draw: (t) => <BackDoor t={t} speaker="flour" up={t.p > 0.5} /> },
  { at: S("Karl: So the mill"), draw: (t) => <BackDoor t={t} flourFace="neutral" lotteFace="worried" /> },
  { at: S("Lotte: And I charge"), draw: (t) => <BackDoor t={t} speaker="lotte" lotteFace="sceptical" /> },
  { at: S("Karl: Everyone does."), draw: (t) => <BackDoor t={t} take lotteFace="sceptical" flourFace="happy" /> },
  { at: S("Day forty."), draw: (t) => <Bakery t={t} mood="dusk" board={["1,40", "2,10", "3,00", "4,20"]} jonas={{ face: "worried", held: "coins" }} lotte={{ pose: "write", held: "chalk" }} /> },
  { at: E("Day forty."), draw: (t) => <Bakery t={t} mood="lamp" layout="lotte" board="4,20" props={["book"]} lotte={{ face: "sad", pose: "read", held: "book" }} /> },
  { at: S("Lotte: A third."), draw: (t) => <Bakery t={t} mood="lamp" layout="lotte" board="4,20" lotte={{ face: "sad", pose: "rest" }} /> },
  { at: S("It isn't taken"), draw: (t) => <Bakery t={t} mood="lamp" layout="note" board="4,20" lotte={{ face: "sad" }} /> },
  // A Million Each: the airdrop, the city stops, the board climbs; Mansa Musa; Jonas's "Not me".
  { at: S("So you try the obvious"), draw: (t) => <Airdrop t={t} /> },
  { at: E("So you try the obvious"), draw: (t) => <Airdrop t={t} board />, sfx: [{ file: "buzz", f: 4, vol: 0.3 }] },
  { at: S("Lotte: Flour. Not money."), draw: (t) => <Bakery t={t} mood="morning" props={["sacks"]} phone="up" balance={day(50)} you={{ face: "happy", pose: "give" }} lotte={{ face: "determined", pose: "slide" }} /> },
  { at: S("Nobody goes to work"), draw: (t) => <Bakery t={t} mood="morning" layout="board" board={["4,20", "42,00", "63,00"]} lotte={{ pose: "write", held: "chalk" }} /> },
  { at: S("This has happened before."), draw: (t) => <Cairo t={t} /> },
  { at: S("Jonas: Sixty-three?"), draw: (t) => <Bakery t={t} mood="morning" board="63,00" jonas={{ held: "coins", face: "shocked" }} lotte={{ face: "sceptical" }} you={{ face: "worried" }} /> },
  { at: S("Lotte: Since that one."), draw: (t) => <Bakery t={t} mood="morning" layout="lotte" board="63,00" lotte={{ face: "sceptical", pose: "slide" }} jonas={{}} /> },
  { at: S("Jonas: Not me."), draw: (t) => <Bakery t={t} mood="morning" board="63,00" phone="up" balance={day(50)} jonas={{ face: "sceptical" }} you={{ face: "worried", pose: "give" }} lotte={{ face: "neutral" }} /> },
  { at: S("Jonas: Then it's me"), draw: (t) => <Bakery t={t} mood="morning" board="63,00" jonas={{ face: "happy" }} you={{ face: "afraid" }} lotte={{ face: "neutral" }} /> },
  // The Planet: the news, the Earth, the universe, the call.
  { at: S("Day fifty-two. You're"), draw: (t) => <News t={t} /> },
  { at: S("Day fifty-five. The number"), draw: (t) => <Globe t={t} /> },
  { at: S("Never hit zero"), draw: (t) => <Cosmos t={t} /> },
  { at: S("And there's only one way out"), draw: (t) => <Bakery t={t} mood="night" board="63,00" phone="up" balance={day(55)} you={{ face: "determined" }} lotte={{ face: "neutral", pose: "rest" }} /> },
  { at: S("You call Herr Brandt"), draw: (t) => <Bakery t={t} mood="night" board="63,00" phone="ear" you={{ face: "determined", pose: "ear" }} lotte={{ face: "neutral", pose: "rest" }} /> },
  // Exactly Zero: the call, the torn form, the refund, the run, the cent, midnight, "Counted."
  { at: S("Herr Brandt: So it was"), draw: (t) => <Flat t={t} ear face="determined" /> },
  { at: S("Herr Brandt: Everything goes"), draw: (t) => <Bank t={t} night />, sfx: [{ file: "tear", p: 0.3, vol: 0.35 }] },
  { at: S("Herr Brandt: Fifty minutes"), draw: (t) => <Flat t={t} face="determined" /> },
  { at: E("Herr Brandt: Fifty minutes"), draw: (t) => <PhoneClose t={t} mood="lamp" mode="countdown" days={[55, 55]} cents={[2 ** 54, 0]} /> },
  { at: S("Zero. Everything."), draw: (t) => <Flat t={t} face="relieved" /> },
  { at: S("Then the phone buzzes"), draw: (t) => <PhoneClose t={t} mood="lamp" mode="refund" days={[55, 55]} />, sfx: [{ file: "buzz", f: 2, vol: 0.4 }] },
  { at: S("One cent at midnight"), draw: (t) => <Flat t={t} face="afraid" /> },
  { at: S("Who takes one cent"), draw: (t) => <NightRun t={t} /> },
  { at: S("Lotte: All counted?"), draw: (t) => <Door t={t} give />, sfx: [{ file: "coin", p: 0.6, vol: 0.6 }] },
  { at: E("You count. One cent."), draw: (t) => <PhoneClose t={t} mood="lamp" mode="still" days={[56, 56]} /> },
  { at: S("Zero, doubled"), draw: (t) => <Hand t={t} /> },
  { at: S("Lotte: Counted."), draw: (t) => <Door t={t} lampOut />, sfx: [{ file: "key", p: 0.3, vol: 0.8 }, { file: "lamp", p: 0.5, vol: 0.7 }] },
  // Back to the Counter, and the cliffhanger: Jonas's phone rips.
  { at: S("Day fifty-six."), draw: (t) => <Bakery t={t} mood="morning" board="3,90" props={["coins"]} phone="down" jonas={{ held: "coins", face: "happy" }} you={{ face: "happy" }} lotte={{ pose: "palm" }} /> },
  { at: S("A coin isn't a thing"), draw: (t) => <Bakery t={t} mood="morning" layout="lotte" board="3,90" lotte={{ face: "happy", pose: "slide", held: "roll" }} jonas={{}} /> },
  { at: S("Then Jonas's phone rips."), draw: (t) => <PhoneClose t={t} mood="morning" mode="double" days={[1, 2]} />, sfx: rips([1, 2], 0.6) },
  { at: S("Jonas: Did my phone"), draw: (t) => <Bakery t={t} mood="morning" board="3,90" phone="down" jonas={{ face: "shocked" }} you={{ face: "shocked" }} lotte={{ face: "shocked" }} /> },
  { at: E("Be honest."), draw: (t) => <EndCard t={t} /> },
];

export interface TagDef { at: Anchor; text: string; frames?: number }
export const TAGS: TagDef[] = [
  { at: S("Day thirty-one. Ten million"), text: "DAY 31 · 10.737.418,24" },
  { at: S("Day fifty-five. More money"), text: "DAY 55" },
  { at: E("Lotte: My grandfather"), text: "1 · 2 · 4 · 8" },
  { at: S("Day eleven.", 45), text: `DAY 11 · ${balanceOn(11)}` },
  { at: S("Day eighteen."), text: `DAY 18 · ${balanceOn(18)}` },
  { at: S("Day nineteen.", 30), text: `DAY 19 · ${balanceOn(19)}` },
  { at: S("Day twenty-one."), text: `DAY 21 · ${balanceOn(21)}` },
  { at: S("Frau Weber: Who's paying"), text: `DAY 22 · ${balanceOn(22)}` },
  { at: S("Herr Brandt: Where does"), text: "DAY 24 · 83.886,08" },
  { at: S("Day twenty-eight."), text: `DAY 28 · ${balanceOn(28)}` },
  { at: S("You hold the phone up"), text: "DAY 31 · 10.737.418,24" },
  { at: S("Day thirty-three."), text: `DAY 33 · ${balanceOn(33)}` },
  { at: S("You try. You buy shares."), text: `DAY 34 · ${balanceOn(34)}` },
  { at: S("Day thirty-five. A hundred"), text: `DAY 35 · ${balanceOn(35)}` },
  { at: E("Day thirty-seven."), text: "DAY 37 · 687.194.767,36" },
  { at: S("Karl: Same flour."), text: "DAY 40" },
  { at: S("So you try the obvious"), text: `DAY 50 · ${balanceOn(50)}` },
  { at: S("Day fifty-two. You're"), text: "DAY 52" },
  { at: S("Day fifty-five. The number"), text: "DAY 55 · 180.143.985.094.819,84" },
  { at: S("Never hit zero", 30), text: "DAY 267" },
  { at: E("Herr Brandt: Fifty minutes"), text: "23:50 · 0,00" },
  { at: S("Then the phone buzzes", 60), text: "23:57 · 0,01" },
  { at: E("You count. One cent."), text: "23:59 · 0,00" },
  { at: S("Day fifty-six."), text: "DAY 56" },
];

export interface BubbleDef { at: Anchor; text: string; x: number; y: number; frames?: number }
export const BUBBLES: BubbleDef[] = [
  { at: E("Herr Brandt: Where does"), text: "Mine.", x: 960, y: 520, frames: 60 },
  { at: E("Herr Brandt: So it was"), text: "Yes.", x: 1100, y: 380, frames: 50 },
  { at: E("Lotte: Since that one."), text: "Take it. All of it.", x: 760, y: 330, frames: 75 },
];

/** A character's name tag the first time they are in frame (owner, 2026-11-13). Screen pixels. */
export interface NameDef { at: Anchor; name: string; role?: string; does?: string; x: number; y: number; side?: "left" | "right"; frames?: number }
export const NAMES: NameDef[] = [
  { at: E("And it starts with one cent"), name: "YOU", x: 250, y: 170 },
  { at: E("And it starts with one cent"), name: "LOTTE", role: "the baker", does: "slips you a free roll every day", x: 1250, y: 190, side: "left", frames: 75 },
  { at: S("Jonas: One cent?"), name: "JONAS", role: "your flatmate", does: "pays for your roll every morning", x: 860, y: 260, frames: 75 },
  { at: S("Frau Weber: Who's paying"), name: "FRAU WEBER", role: "on the tram", x: 1330, y: 520 },
  { at: S("Mehmet: That one"), name: "MEHMET", role: "the driver", x: 1680, y: 500, side: "left" },
  { at: S("Herr Brandt: Where does"), name: "HERR BRANDT", role: "your bank", does: "checks every cent", x: 1480, y: 470, frames: 60 },
  { at: S("Day thirty-five. A hundred"), name: "KARL", role: "the flour man", does: "brings Lotte her flour", x: 1900, y: 560, side: "left", frames: 60 },
];

/** Fact and problem cards: only a real fact or a turn the viewer must hold, one at a time. */
export interface CardDef { at: Anchor; top: string; sub: string; problem?: boolean; secs?: number; right?: boolean }
export const CARDS: CardDef[] = [
  { at: S("There is no off switch", 60), top: "THE RULE", sub: "Every midnight: × 2 · the only way out: exactly 0,00 at midnight", secs: 6 },
  { at: S("A king, a chessboard", 150), top: "IT'S TRUE", sub: "64 squares of doubling: more wheat than the world grows in 1,000 years", secs: 6 },
  { at: S("Day thirty-seven.", 120), top: "PROBLEM 1", sub: "You can't spend it", problem: true },
  { at: S("Day forty.", 30), top: "WHERE THE MONEY LANDS", sub: "New money raises prices there first", secs: 5 },
  { at: S("Nobody goes to work", 90), top: "PROBLEM 2", sub: "You can't give it away", problem: true },
  { at: S("This has happened before.", 75), top: "IT'S TRUE · 1324", sub: "Mansa Musa gave away so much gold, it stayed cheap in Cairo for 12 years", secs: 7 },
  { at: S("Jonas: Then it's me", 30), top: "PROBLEM 3", sub: "Whoever holds it makes the bread cost more", problem: true, right: true },
  { at: S("Day fifty-five. The number", 150), top: "IT'S TRUE", sub: "The whole world makes about $128 trillion a year (IMF, 2026)", secs: 6 },
  { at: S("Never hit zero", 120), top: "IT'S TRUE · DAY 267", sub: "More cents than the estimated hydrogen atoms in the observable universe (about 10^80)", secs: 6 },
];
