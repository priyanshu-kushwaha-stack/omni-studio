// The first cut's shot list for script v6 (wider: the owner's "very zoomed in" note of 2026-11-15 and the GTA-money reference): every `> SCENE:` and `> HOLD:` of script.md as a shot, anchored to a spoken
// line (its start, or its end for a hold after it) by the line's opening words, so a new voice take or a reordered
// script re-times the cut and a line that no longer exists fails the render. Tags are the script's `> TAG:` lines;
// bubbles its `> BUBBLE:`, cards its `> CARD:`. A shot's `sfx` are its sound effects (make_sfx.sh), at a share of the
// shot (`p`) or a frame into it (`f`), so they move with the picture.
import type { ReactNode } from "react";
import { Street, Bank, FormClose } from "./parts/Places";
import { Balloon, BackDoor, Ground, Midnight } from "./parts/Scenes";
import { Bakery } from "./parts/Bakery";
import { Cairo } from "./parts/Archive";
import { Chess } from "./parts/Chess";
import { Door, EndCard, Hand } from "./parts/Door";
import { PhoneClose } from "./parts/PhoneClose";
import { Airdrop, Atm, Cosmos, Globe, News, NightRun, Shares, ShopPhone } from "./parts/Future";
import { Berlin1923, Kitchen, Penthouse, Sea, StickyNote, TramsFree } from "./parts/Wide";
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
  // Midnight (v6: the power arrives, in order; owner: "Midnight, as written"): the coin tears in the lead-in.
  { at: S("Jonas: Did your phone", -80), draw: (t) => <Midnight t={t} mode="sleep" /> },
  { at: S("Jonas: Did your phone", -60), draw: (t) => <PhoneClose t={t} mood="night" mode="double" days={[1, 2]} />, sfx: rips([1, 2], 0.6) },
  { at: S("Jonas: Did your phone"), draw: (t) => <Midnight t={t} mode="wake" /> },
  { at: S("Jonas: Two cents."), draw: (t) => <Midnight t={t} mode="lie" /> },
  { at: S("Two cents. Last night"), draw: (t) => <PhoneClose t={t} mood="lamp" mode="double" days={[2, 2]} /> },
  { at: S("What if your money"), draw: (t) => <PhoneClose t={t} mood="lamp" mode="double" days={[2, 6]} />, sfx: rips([2, 6]) },
  { at: S("Sounds like the best thing"), draw: (t) => <Penthouse t={t} night /> },
  // The Rule, the sticky note, the chessboard.
  { at: S("There is no off switch"), draw: (t) => <Bakery t={t} mood="morning" layout="thumb" phone="up" balance={day(2)} you={{ face: "happy" }} lotte={{ held: "chalk" }} /> },
  { at: S("So you make yourself a rule"), draw: (t) => <StickyNote t={t} text="STOP AT 1.000 €" /> },
  { at: S("A king, a chessboard"), draw: (t) => <Chess t={t} mode="board" squares={[0, 16]} /> },
  { at: S("A king, a chessboard", 200), draw: (t) => <Chess t={t} mode="dune" /> },
  { at: S("For ten days"), draw: (t) => <PhoneClose t={t} mood="morning" mode="double" days={[2, 11]} />, sfx: rips([2, 11], 0.2) },
  // Everything You Ever Wanted: one line, one picture.
  { at: S("Day eleven."), draw: (t) => <Bakery t={t} mood="morning" props={["coins"]} you={{ face: "happy", pose: "give" }} lotte={{ pose: "palm" }} /> },
  { at: S("Anna: I saw."), draw: (t) => <Bakery t={t} mood="morning" layout="board" board="1,40" lotte={{ pose: "write", held: "chalk" }} /> },
  { at: S("Day seventeen."), draw: (t) => <Kitchen t={t} /> },
  { at: S("Day twenty-one."), draw: (t) => <Street t={t} mood="day" mode="party" lotteFace="happy" jonasFace="shocked" /> },
  { at: S("Day twenty-two."), draw: (t) => <TramsFree t={t} /> },
  { at: E("Day twenty-two."), draw: (t) => <StickyNote t={t} old="STOP AT 1.000 €" text="STOP AT 1 MILLION" /> },
  { at: S("Herr Brandt: Is it a mistake"), draw: (t) => <Bank t={t} /> },
  { at: E("Herr Brandt: Is it a mistake"), draw: (t) => <FormClose t={t} mode="sign" /> },
  { at: S("Herr Brandt: Not a mistake."), draw: (t) => <FormClose t={t} mode="stamp" />, sfx: [{ file: "stamp", f: 5, vol: 0.25 }] },
  { at: S("Day twenty-seven."), draw: (t) => <Penthouse t={t} /> },
  { at: S("Day twenty-eight."), draw: (t) => <Bakery t={t} mood="morning" props={["deed"]} you={{ face: "happy", pose: "give" }} lotte={{ face: "happy", pose: "slide" }} /> },
  { at: S("Anna has never seen the sea."), draw: (t) => <Sea t={t} /> },
  { at: S("Day thirty."), draw: (t) => <Ground t={t} jonas="jump" score="3 : 2" /> },
  { at: S("Jonas: I don't know what"), draw: (t) => <Ground t={t} jonas="hands" score="4 : 2" /> },
  { at: E("Jonas: I don't know what"), draw: (t) => <Bakery t={t} mood="morning" layout="thumb" phone="up" balance={day(31)} spill={ramp(t.p, 0, 0.7)} floor={t.p > 0.6} jonas={{ face: "shocked" }} you={{ face: "happy" }} lotte={{ face: "shocked", held: "chalk" }} />,
    sfx: [{ file: "pour", f: 0, vol: 1 }] },
  { at: S("Day thirty-one."), draw: (t) => <Bakery t={t} mood="morning" layout="thumb" phone="up" balance={day(31)} spill={1} floor jonas={{ face: "shocked" }} you={{ face: "shocked" }} lotte={{ face: "shocked", held: "chalk" }} /> },
  { at: S("Jonas: Is that..."), draw: (t) => <Bakery t={t} mood="morning" phone="up" balance={day(31)} spill={1} floor jonas={{ face: "shocked" }} you={{ face: "happy" }} lotte={{ face: "shocked", held: "chalk" }} /> },
  { at: S("The sticky note gets a new number. It always"), draw: (t) => <StickyNote t={t} old="STOP AT 1 MILLION" text="STOP AT 1 BILLION" /> },
  // What It Costs.
  { at: S("So you spend."), draw: (t) => <Atm t={t} /> },
  { at: S("A car. A tiny jet."), draw: (t) => <ShopPhone t={t} mode="spend" /> },
  { at: S("At midnight, what's left"), draw: (t) => <ShopPhone t={t} mode="midnight" />, sfx: [{ file: "rip", p: 0.45, vol: 0.4 }] },
  { at: S("You're thinking it."), draw: (t) => <Shares t={t} /> },
  { at: S("Day thirty-five."), draw: (t) => <Balloon t={t} /> },
  { at: S("Anna: I have two hands"), draw: (t) => <Balloon t={t} focus="lotte" lotteFace="determined" /> },
  { at: E("Anna: I have two hands"), draw: (t) => <Balloon t={t} phase="rise" orders={[1000, 40000]} />, sfx: [{ file: "whoosh", f: 10, vol: 0.5 }] },
  { at: S("Money is a ticket"), draw: (t) => <Bakery t={t} mood="day" lotte={{ pose: "rest" }} props={["coins"]} you={{ face: "sceptical" }} /> },
  { at: S("And everything you spend"), draw: (t) => <Street t={t} mood="day" mode="spend" youFace="worried" /> },
  { at: S("Karl: Same flour."), draw: (t) => <BackDoor t={t} speaker="flour" /> },
  { at: S("Karl: The whole street"), draw: (t) => <BackDoor t={t} take lotteFace="sceptical" flourFace="happy" /> },
  { at: S("Day forty."), draw: (t) => <Bakery t={t} mood="dusk" layout="board" board={["1,40", "2,10", "3,00", "4,20"]} lotte={{ pose: "write", held: "chalk" }} /> },
  { at: E("Day forty."), draw: (t) => <Bakery t={t} mood="lamp" layout="lotte" board="4,20" props={["book"]} lotte={{ face: "sad", pose: "read", held: "book" }} /> },
  { at: S("It isn't taken"), draw: (t) => <Bakery t={t} mood="lamp" layout="note" board="4,20" lotte={{ face: "sad" }} /> },
  // Bigger: the city, history, the news, the Earth, the universe.
  { at: S("So you try the obvious"), draw: (t) => <Airdrop t={t} /> },
  { at: E("So you try the obvious"), draw: (t) => <Airdrop t={t} board />, sfx: [{ file: "buzz", f: 4, vol: 0.3 }] },
  { at: S("Nobody goes to work"), draw: (t) => <Bakery t={t} mood="morning" layout="board" board={["4,20", "42,00", "63,00"]} lotte={{ pose: "write", held: "chalk" }} /> },
  { at: S("Jonas: Sixty-three?"), draw: (t) => <Bakery t={t} mood="morning" board="63,00" jonas={{ held: "coins", face: "shocked" }} lotte={{ face: "sceptical" }} you={{ face: "worried" }} /> },
  { at: S("Jonas: Not me."), draw: (t) => <Bakery t={t} mood="morning" board="63,00" phone="up" balance={day(50)} jonas={{ face: "sceptical" }} you={{ face: "worried", pose: "give" }} lotte={{ face: "neutral" }} /> },
  { at: S("This has happened before."), draw: (t) => <Cairo t={t} /> },
  { at: S("Right here in Berlin"), draw: (t) => <Berlin1923 t={t} /> },
  // "Anna's board is heading the same way. Give it all away? You hit zero. Berlin doesn't." (room round 13, rule #21)
  { at: E("Right here in Berlin", -150), draw: (t) => <Bakery t={t} mood="morning" layout="board" board={["63,00", "630,00"]} lotte={{ pose: "write", held: "chalk", face: "sceptical" }} /> },
  { at: S("Day fifty-two."), draw: (t) => <News t={t} /> },
  { at: S("Day fifty-five."), draw: (t) => <Globe t={t} /> },
  { at: S("Never hit zero"), draw: (t) => <Cosmos t={t} /> },
  { at: S("You look from the galaxies"), draw: (t) => <StickyNote t={t} old="STOP AT 1 BILLION" text="STOP AT 0,00" /> },
  // Exactly Zero.
  { at: S("You call Herr Brandt"), draw: (t) => <Penthouse t={t} night phone /> },
  { at: S("Herr Brandt: Everything goes"), draw: (t) => <Bank t={t} night />, sfx: [{ file: "tear", p: 0.3, vol: 0.35 }] },
  { at: S("Herr Brandt: Fifty minutes"), draw: (t) => <Penthouse t={t} night phone /> },
  { at: E("Herr Brandt: Fifty minutes"), draw: (t) => <PhoneClose t={t} mood="lamp" mode="countdown" days={[55, 55]} cents={[2 ** 54, 0]} /> },
  { at: S("Zero. Everything."), draw: (t) => <Penthouse t={t} night /> },
  { at: S("Then the phone buzzes"), draw: (t) => <PhoneClose t={t} mood="lamp" mode="refund" days={[55, 55]} />, sfx: [{ file: "buzz", f: 2, vol: 0.4 }] },
  { at: S("Who takes one cent"), draw: (t) => <NightRun t={t} /> },
  { at: S("Anna: All counted?"), draw: (t) => <Door t={t} give />, sfx: [{ file: "coin", p: 0.6, vol: 0.6 }] },
  { at: E("You count. One cent."), draw: (t) => <PhoneClose t={t} mood="lamp" mode="still" days={[56, 56]} /> },
  { at: S("Zero, doubled"), draw: (t) => <Hand t={t} /> },
  { at: S("Anna: Counted."), draw: (t) => <Door t={t} lampOut />, sfx: [{ file: "key", p: 0.3, vol: 0.8 }, { file: "lamp", p: 0.5, vol: 0.7 }] },
  // Back to the Counter, and the cliffhanger.
  { at: S("Day fifty-six."), draw: (t) => <Bakery t={t} mood="morning" board="3,90" props={["coins"]} phone="down" jonas={{ held: "coins", face: "happy" }} you={{ face: "happy" }} lotte={{ pose: "palm" }} /> },
  { at: S("A coin isn't a thing"), draw: (t) => <Bakery t={t} mood="morning" layout="lotte" board="3,90" lotte={{ face: "happy", pose: "slide", held: "roll" }} jonas={{}} /> },
  { at: S("Then Jonas's phone rips."), draw: (t) => <PhoneClose t={t} mood="morning" mode="double" days={[1, 2]} />, sfx: rips([1, 2], 0.6) },
  { at: S("Jonas: Did my phone"), draw: (t) => <Bakery t={t} mood="morning" board="3,90" phone="down" jonas={{ face: "shocked" }} you={{ face: "shocked" }} lotte={{ face: "shocked" }} /> },
  { at: E("Be honest."), draw: (t) => <EndCard t={t} /> },
];

export interface TagDef { at: Anchor; text: string; frames?: number }
export const TAGS: TagDef[] = [
  { at: S("For ten days", 60), text: `DAY 11 · ${balanceOn(11)}` },
  { at: S("Day seventeen."), text: `DAY 17 · ${balanceOn(17)}` },
  { at: S("Day twenty-one."), text: `DAY 21 · ${balanceOn(21)}` },
  { at: S("Day twenty-two."), text: `DAY 22 · ${balanceOn(22)}` },
  { at: S("Herr Brandt: Is it a mistake"), text: `DAY 24 · ${balanceOn(24)}` },
  { at: S("Day twenty-seven."), text: `DAY 27 · ${balanceOn(27)}` },
  { at: S("Day twenty-eight."), text: `DAY 28 · ${balanceOn(28)}` },
  { at: S("Anna has never seen the sea."), text: `DAY 29 · ${balanceOn(29)}` },
  { at: S("Day thirty."), text: `DAY 30 · ${balanceOn(30)}` },
  { at: E("Jonas: I don't know what"), text: "DAY 31 · 10.737.418,24" },
  { at: S("You're thinking it."), text: `DAY 34 · ${balanceOn(34)}` },
  { at: S("Day thirty-five."), text: `DAY 35 · ${balanceOn(35)}` },
  { at: S("Karl: Same flour."), text: "DAY 40" },
  { at: S("So you try the obvious"), text: `DAY 50 · ${balanceOn(50)}` },
  { at: S("Day fifty-two."), text: "DAY 52" },
  { at: S("Day fifty-five."), text: "DAY 55 · 180.143.985.094.819,84" },
  { at: S("Never hit zero", 30), text: "DAY 267" },
  { at: E("Herr Brandt: Fifty minutes"), text: "23:50 · 0,00" },
  { at: S("Then the phone buzzes", 60), text: "23:57 · 0,01" },
  { at: E("You count. One cent."), text: "23:59 · 0,00" },
  { at: S("Day fifty-six."), text: "DAY 56" },
];

export interface BubbleDef { at: Anchor; text: string; x: number; y: number; frames?: number }
export const BUBBLES: BubbleDef[] = [
  { at: E("Herr Brandt: So it was"), text: "Yes.", x: 1100, y: 380, frames: 50 },
  { at: E("Jonas: Sixty-three?"), text: "Take it. All of it.", x: 760, y: 330, frames: 75 },
];

/** A character's name tag the first time they are in frame. Screen pixels. */
export interface NameDef { at: Anchor; name: string; role?: string; does?: string; x: number; y: number; side?: "left" | "right"; frames?: number }
export const NAMES: NameDef[] = [
  { at: S("Jonas: Did your phone"), name: "JONAS", role: "your flatmate", does: "pays for your roll every morning", x: 860, y: 200, frames: 75 },
  { at: S("There is no off switch"), name: "YOU", x: 250, y: 170 },
  { at: S("There is no off switch"), name: "ANNA", role: "the baker", does: "slips you a free roll every day", x: 1250, y: 190, side: "left", frames: 75 },
  { at: S("Herr Brandt: Is it a mistake"), name: "HERR BRANDT", role: "your bank", does: "checks every cent", x: 1480, y: 470, frames: 60 },
  { at: S("Karl: Same flour."), name: "KARL", role: "the flour man", does: "brings Anna her flour", x: 1300, y: 300, frames: 60 },
];

/** Fact and problem cards: only a real fact or a turn the viewer must hold, one at a time. */
export interface CardDef { at: Anchor; top: string; sub: string; problem?: boolean; secs?: number; right?: boolean }
export const CARDS: CardDef[] = [
  { at: S("There is no off switch", 60), top: "THE RULE", sub: "Every midnight: × 2 · the only way out: exactly 0,00 at midnight", secs: 6 },
  { at: S("A king, a chessboard", 150), top: "IT'S TRUE", sub: "64 squares of doubling: more wheat than the world grows in 1,000 years", secs: 6 },
  { at: S("You bought a thousand", 30), top: "PROBLEM 1", sub: "You can't spend it", problem: true },
  { at: S("Day forty.", 30), top: "WHERE THE MONEY LANDS", sub: "New money raises prices there first", secs: 5 },
  { at: S("Nobody goes to work", 90), top: "PROBLEM 2", sub: "You can't give it away", problem: true },
  { at: S("Jonas: Not me.", 10), top: "PROBLEM 3", sub: "Whoever holds it makes the bread cost more", problem: true, right: true },
  { at: S("Right here in Berlin", 60), top: "IT'S TRUE · BERLIN, LATE 1923", sub: "A loaf of bread: about 200 billion marks", secs: 6, right: true },
  { at: S("Day fifty-five.", 150), top: "IT'S TRUE", sub: "The whole world makes about $128 trillion a year (IMF, 2026)", secs: 6 },
  { at: S("Never hit zero", 120), top: "IT'S TRUE · DAY 267", sub: "More cents than the estimated hydrogen atoms in the observable universe (about 10^80)", secs: 6 },
];
