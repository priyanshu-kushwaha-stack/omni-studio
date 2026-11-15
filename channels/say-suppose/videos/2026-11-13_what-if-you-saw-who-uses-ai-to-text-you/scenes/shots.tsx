// The first cut's shot list for script v2.3 (exciting, not sad): every `> SCENE:` and `> HOLD:` of script.md as a shot, anchored to a spoken
// line (its start, or its end for a hold after it) by the line's opening words, so a new voice take or a reordered
// script re-times the cut and a line that no longer exists fails the render. Tags are the script's `> TAG:` lines (text
// messages show as a chat bubble; a label as the stamped tag); bubbles are its `> BUBBLE:` lines.
import type { ReactNode } from "react";
import { KeyShot } from "./parts/KeyShot";
import {
  Aunts, BIRTHDAY, BLUE, BreakRoom, Bus, BusStop, Bedroom, Cafe, Cousin, Diner, GREY, Insert, Kitchen, LAV, Man,
  MapSheet, MINT, Office, PEACH, PINK, Roof, RuleSheet, StudySheet, TwoPhones,
} from "./parts/Scenes";
import type { Msg, ShotTime } from "./parts/util";

/** A spoken line by its opening words (story.json's `text`), and which edge of it. */
export interface Anchor { line: string; edge?: "start" | "end"; plus?: number }
export interface ShotDef { at: Anchor; draw: (t: ShotTime) => ReactNode }
export interface TagDef { at: Anchor; text: string; kind?: "message" | "label" | "cast"; dot?: boolean; from?: string; frames?: number }
export interface BubbleDef { at: Anchor; text: string; x: number; y: number; frames?: number }

export const S = (line: string, plus = 0): Anchor => ({ line, edge: "start", plus });
export const E = (line: string, plus = 0): Anchor => ({ line, edge: "end", plus });

const many = (n: number, from: string, dot = true, lines = 2): Msg[] => Array.from({ length: n }, (_, i) => ({ from, lines: lines + (i % 2), dot }));
const SENT: Msg[] = Array.from({ length: 9 }, (_, i) => ({ from: BLUE, mine: true, lines: 1 + (i % 3), dot: true }));
const FIRST = "Mother: Make a wish";
const DAD = "#a8c99a";
const BOSSC = "#c9d3e6";
const COUSIN_C = "#d6b8ec";

export const SHOTS: ShotDef[] = [
  // Make a Wish (lamp, before six): the skit; the dots in the smoke; the key shot by about 0:07, you stunned (K17).
  { at: S(FIRST), draw: (t) => <Insert t={t} mood="lamp" msgs={BIRTHDAY.slice(0, 4).map((m) => ({ ...m, dot: false }))} /> },
  { at: S(FIRST, 1), draw: (t) => <Kitchen t={t} mood="lamp" you="happy" mother="happy" cake /> },
  { at: E(FIRST), draw: (t) => <Kitchen t={t} mood="lamp" you="neutral" mother="happy" cake cam="stove" /> },
  { at: E(FIRST, 24), draw: (t) => <Insert t={t} mood="lamp" msgs={BIRTHDAY.slice(0, 4)} dotsAt={4} dotEvery={6} /> },
  { at: S("Mother: What? What is it?"), draw: (t) => <Kitchen t={t} mood="lamp" you="shocked" mother="worried" /> },
  { at: E("Mother: What? What is it?"), draw: (t) => <KeyShot t={t} dotsAt={[0, 5, 10, 15]} smoke={1} /> },
  { at: S("You asked who meant it."), draw: (t) => <KeyShot t={t} push={0.03} /> },
  { at: S("So what if you could see"), draw: (t) => <Insert t={t} mood="lamp" msgs={BIRTHDAY} dotsAt={0} dotEvery={2} highlight={4} /> },
  { at: S("Catch anyone you like."), draw: (t) => <Kitchen t={t} mood="lamp" you="determined" mother={null} cam="stove" /> },
  { at: S("Forty-one birthday wishes."), draw: (t) => <Insert t={t} mood="lamp" msgs={[...many(5, PEACH), ...BIRTHDAY.slice(3)]} dotsAt={0} dotEvery={2} highlight={6} /> },
  { at: S("And the only wish"), draw: (t) => <KeyShot t={t} push={0.06} /> },
  // The Rule (morning).
  { at: S("You've always graded"), draw: (t) => <Kitchen t={t} mood="morning" you="happy" mother="neutral" /> },
  { at: S("The rule. Every message"), draw: (t) => <RuleSheet t={t} /> },
  { at: S("Only you see them."), draw: (t) => <Kitchen t={t} mood="morning" you="determined" mother="neutral" cam="stove" /> },
  { at: S("But a dot says who wrote it."), draw: (t) => <Insert t={t} mood="morning" msgs={BIRTHDAY} dotsAt={0} dotEvery={1} /> },
  { at: S("Mother: Dots? What dots?"), draw: (t) => <Kitchen t={t} mood="morning" you="happy" mother="sceptical" cam="twoShot" /> },
  { at: S("Your father is one of"), draw: (t) => <MapSheet t={t} /> },
  { at: S("Four words in"), draw: (t) => <Insert t={t} mood="morning" msgs={[BIRTHDAY[4], { from: BLUE, mine: true, text: "Dad, I wanted to say" }, { from: "#e4e7ec", mine: true, lines: 2 }]} /> },
  { at: S("You don't send it."), draw: (t) => <Kitchen t={t} mood="morning" you="determined" mother={null} /> },
  // The Detective (day): customs on the bus; the boss; the aunts; asking; autocorrect; the study.
  { at: S("You go through your phone"), draw: (t) => <Bus t={t} mood="day" you="sceptical" /> },
  { at: E("You go through your phone"), draw: (t) => <Insert t={t} mood="day" place="bus" msgs={many(5, "#9fd3e6", true, 1)} contact="#9fd3e6" dotEvery={3} /> },
  { at: S("Your boss. So proud"), draw: (t) => <Insert t={t} mood="day" place="bus" msgs={[{ from: BOSSC, lines: 4, dot: true }, { from: BOSSC, text: "noted" }]} dotsAt={10} /> },
  { at: S("Your two aunts."), draw: (t) => <Aunts t={t} /> },
  { at: E("Your two aunts.", 50), draw: (t) => <Aunts t={t} one="happy" two="happy" /> },
  { at: S("Aunt one: Forgive me?"), draw: (t) => <Aunts t={t} one="sceptical" two="happy" /> },
  { at: S("Nobody did anything."), draw: (t) => <Aunts t={t} one="shocked" two="relieved" /> },
  { at: S("Now, the obvious move."), draw: (t) => <Bus t={t} mood="day" you="sceptical" /> },
  { at: S("Aunt one: Every word"), draw: (t) => <Aunts t={t} one="happy" two="neutral" /> },
  { at: S("Dot. On the answer."), draw: (t) => <Insert t={t} mood="day" place="bus" msgs={[{ from: BLUE, mine: true, text: "Did you write that?" }, { from: MINT, text: "Every word, my love", dot: true }]} contact="#a8dcc4" dotsAt={12} /> },
  { at: S("Your mother's eat first"), draw: (t) => <Insert t={t} mood="day" place="bus" msgs={[{ from: "#c9b2e0", text: "eat first" }]} contact="#c9b2e0" /> },
  { at: S("Nobody suspects a thing."), draw: (t) => <StudySheet t={t} /> },
  { at: S("But here's problem one."), draw: (t) => <Bus t={t} mood="day" you="worried" cam="aisle" /> },
  // The Test (dusk): the bus stop; the goat; the file.
  { at: S("Your best friend. Bea."), draw: (t) => <BusStop t={t} you="sceptical" /> },
  { at: S("You don't ask."), draw: (t) => <Insert t={t} mood="dusk" msgs={[{ from: PINK, lines: 4, dot: true }, { from: BLUE, mine: true, text: "the goat on the bus?" }]} contact="#f4b8c8" /> },
  { at: E("You don't ask."), draw: (t) => <Insert t={t} mood="dusk" msgs={[{ from: BLUE, mine: true, text: "the goat on the bus?" }, { from: PINK, lines: 5, dot: true }]} contact="#f4b8c8" dotsAt={90} /> },
  { at: S("Perfect. In nine seconds."), draw: (t) => <BusStop t={t} you="shocked" /> },
  { at: S("So the machine knows"), draw: (t) => <BusStop t={t} you="worried" /> },
  { at: S("You delete your long reply."), draw: (t) => <Insert t={t} mood="dusk" msgs={[{ from: PINK, lines: 5, dot: true }, { from: BLUE, mine: true, text: "ok" }]} contact="#f4b8c8" /> },
  { at: E("You delete your long reply."), draw: (t) => <Insert t={t} mood="dusk" msgs={[{ from: PINK, lines: 5, dot: true }, { from: BLUE, mine: true, text: "ok" }, { from: PINK, text: "Everything alright?", dot: true }]} contact="#f4b8c8" dotsAt={0} dotEvery={40} /> },
  { at: S("Two seconds. Dot."), draw: (t) => <BusStop t={t} you="determined" /> },
  // Your Own Dots (lamp): the sent folder, the switches.
  { at: S("Your sent folder."), draw: (t) => <Bedroom t={t} you="sceptical" /> },
  { at: E("Your sent folder."), draw: (t) => <Insert t={t} mood="lamp" place="bedroom" msgs={SENT} dotsAt={4} dotEvery={4} contact="#F2B632" /> },
  { at: S("Your thank-you to your boss."), draw: (t) => <Insert t={t} mood="lamp" place="bedroom" msgs={SENT} dotsAt={0} dotEvery={0} contact="#F2B632" /> },
  { at: S("For years, Gmail has offered"), draw: (t) => <Insert t={t} mood="lamp" place="bedroom" msgs={[{ from: BLUE, mine: true, text: "Thank you so much for" }, { from: "#e4e7ec", mine: true, lines: 2 }]} contact="#F2B632" /> },
  { at: S("The detective is a suspect."), draw: (t) => <Bedroom t={t} you="shocked" cam="desk" /> },
  { at: S("You typed that a year ago"), draw: (t) => <Insert t={t} mood="lamp" place="bedroom" msgs={[{ from: "#e4e7ec", text: "can send messages: on" }, { from: "#e4e7ec", text: "can add events: on" }, { from: "#ffe9a8", text: "don't let me lose her" }]} contact="#F2B632" highlight={2} /> },
  { at: S("You switch every suggestion"), draw: (t) => <Bedroom t={t} you="determined" /> },
  { at: S("Problem two."), draw: (t) => <Bedroom t={t} you="happy" cam="wide" /> },
  // Set for Two (day, then evening): nineteen dots; one comes.
  { at: S("Saturday. Your mother's party"), draw: (t) => <Insert t={t} mood="day" msgs={[...many(5, LAV, true, 1), { from: COUSIN_C, text: "wouldn't miss it!" }]} contact="#c9b2e0" dotsAt={0} dotEvery={4} highlight={5} /> },
  { at: E("Saturday. Your mother's party"), draw: (t) => <Kitchen t={t} mood="day" you="determined" mother="happy" cam="twoShot" tv={{}} /> },
  { at: S("One came."), draw: (t) => <Kitchen t={t} mood="dusk" you="happy" mother="shocked" cam="wide" /> },
  { at: E("One came."), draw: (t) => <Kitchen t={t} mood="dusk" you="happy" mother="sceptical" cam="stove" /> },
  { at: S("Your mother sends your father"), draw: (t) => <Insert t={t} mood="dusk" msgs={[{ from: "#c9b2e0", lines: 3 }, { from: GREY, text: "cal me kid" }]} contact={DAD} /> },
  { at: S("No dot. You don't call."), draw: (t) => <Kitchen t={t} mood="dusk" you="relieved" mother="neutral" /> },
  // Catch Her at It (night): her four a.m. replies; the night bus; the break room; the one tender beat; her machine.
  { at: S("But your best friend's dot"), draw: (t) => <Insert t={t} mood="lamp" place="bedroom" msgs={many(5, PINK, true, 2)} contact="#f4b8c8" dotEvery={3} /> },
  { at: S("Two a.m. The night bus."), draw: (t) => <Bus t={t} mood="night" you="determined" kid="neutral" cam="wide" /> },
  { at: S("Bus kid: How do you spell"), draw: (t) => <Bus t={t} mood="night" you="neutral" kid="worried" /> },
  { at: E("Bus kid: How do you spell"), draw: (t) => <Bus t={t} mood="night" you="happy" kid="happy" /> },
  { at: E("Six years old."), draw: (t) => <BreakRoom t={t} you="sceptical" coworker="neutral" cam="wide" /> },
  { at: S("Shift lead: Twelve hours."), draw: (t) => <BreakRoom t={t} you="sceptical" coworker="neutral" cam="wide" /> },
  { at: E("Shift lead: Twelve hours.", 40), draw: (t) => <Insert t={t} mood="lamp" place="break" msgs={[{ from: "#ffe9a8", text: "do not miss" }, { from: "#F2B632", lines: 1 }, { from: "#ffe9a8", text: "never leave them unanswered" }]} contact="#f4b8c8" /> },
  { at: S("That's who answers you"), draw: (t) => <BreakRoom t={t} you="relieved" coworker={null} youSpot="beside" /> },
  { at: S("Best friend: You came?"), draw: (t) => <BreakRoom t={t} you="happy" friend="relieved" coworker={null} youSpot="beside" /> },
  { at: S("Best friend: Eleven years"), draw: (t) => <BreakRoom t={t} you="happy" friend="happy" coworker={null} youSpot="beside" cam="wide" /> },
  { at: E("Best friend: Eleven years"), draw: (t) => <Insert t={t} mood="lamp" place="break" msgs={[{ from: PINK, lines: 4, dot: true }]} contact="#f4b8c8" dotsAt={20} /> },
  { at: S("Her machine is still texting"), draw: (t) => <BreakRoom t={t} you="shocked" friend="shocked" coworker={null} youSpot="beside" cam="wide" /> },
  // The Office (day): the coworker's paragraph, the retype, three in a row, the floor, the boss's notebook.
  { at: S("Monday. The office."), draw: (t) => <Office t={t} you="neutral" coworker="happy" boss="neutral" cam="wide" /> },
  { at: S("He writes something. Dot."), draw: (t) => <Insert t={t} mood="day" place="office" msgs={[{ from: "#8fb8b4", lines: 4, dot: true }]} dotsAt={14} /> },
  { at: S("Coworker: Prove it."), draw: (t) => <Office t={t} you="determined" coworker="sceptical" cam="wide" /> },
  { at: S("You can't. A screenshot"), draw: (t) => <Insert t={t} mood="day" place="office" msgs={[{ from: "#8fb8b4", lines: 4 }]} /> },
  { at: S("Coworker: Fine."), draw: (t) => <Office t={t} you="sceptical" coworker="determined" cam="wide" /> },
  { at: S("Coworker: I typed every letter!"), draw: (t) => <Office t={t} you="happy" coworker="shocked" cam="wide" /> },
  { at: S("Dot. The dot follows"), draw: (t) => <Insert t={t} mood="day" place="office" msgs={[{ from: "#8fb8b4", lines: 4, dot: true }]} dotsAt={8} /> },
  { at: E("Dot. The dot follows"), draw: (t) => <Office t={t} you="determined" coworker="happy" cam="wide" /> },
  { at: S("By lunch, the whole floor"), draw: (t) => <Office t={t} you="happy" coworker="worried" cam="wide" screen="off" /> },
  { at: S("Manager: How do you know?"), draw: (t) => <Office t={t} you="neutral" boss="sceptical" cam="wide" /> },
  { at: S("You shrug."), draw: (t) => <Office t={t} you="sceptical" boss="neutral" cam="desk" /> },
  // Fields of Red (day): the street of red points; the restaurant; the cousin's comments; the dating man types.
  { at: S("Then you look up"), draw: (t) => <Roof t={t} you="shocked" /> },
  { at: S("The restaurant downstairs."), draw: (t) => <Insert t={t} mood="day" msgs={[...many(4, "#fff1c6", true, 1), { from: "#e4e7ec", text: "2 stars. fish was ok." }]} contact="#e6a0a0" dotEvery={4} highlight={4} /> },
  { at: E("The restaurant downstairs."), draw: (t) => <Diner t={t} you="neutral" /> },
  { at: S("One bare review."), draw: (t) => <Diner t={t} you="happy" /> },
  { at: S("Cousin: Thank you all"), draw: (t) => <Cousin t={t} /> },
  { at: S("Four hundred comments"), draw: (t) => <Insert t={t} mood="day" place="office" msgs={many(8, "#e4e7ec", true, 1)} contact="#d6b8ec" dotEvery={2} /> },
  { at: S("The dating-app man."), draw: (t) => <Insert t={t} mood="day" place="office" msgs={many(5, "#9fd3e6", true, 1)} contact="#9fd3e6" dotEvery={3} /> },
  { at: E("The dating-app man."), draw: (t) => <Man t={t} face="worried" /> },
  { at: S("His first real message."), draw: (t) => <Insert t={t} mood="dusk" place="office" msgs={[{ from: "#9fd3e6", lines: 3, dot: true }, { from: "#9fd3e6", text: "ur prety. dinner?" }]} contact="#9fd3e6" /> },
  { at: S("You can make one man type."), draw: (t) => <BusStop t={t} you="determined" /> },
  // The Offer (lamp): the news; the station; the boss's ask; the dilemma; "There's nothing there."
  { at: S("Newsreader: The senator's"), draw: (t) => <Kitchen t={t} mood="lamp" you="sceptical" mother="happy" cam="wide" tv={{ dot: true }} /> },
  { at: S("Dot. A machine apologised"), draw: (t) => <Kitchen t={t} mood="lamp" you="sceptical" mother="happy" cam="twoShot" tv={{ dot: true }} /> },
  { at: S("You could call the station."), draw: (t) => <Kitchen t={t} mood="lamp" you="worried" mother="neutral" cam="stove" tv={{ dot: true }} /> },
  { at: S("Then your boss. The senator's"), draw: (t) => <Insert t={t} mood="lamp" msgs={[{ from: BOSSC, lines: 4, dot: true }]} dotsAt={50} /> },
  { at: S("That bonus could bring"), draw: (t) => <Insert t={t} mood="lamp" msgs={[{ from: GREY, text: "Hapy birthday kid" }, { from: GREY, text: "cal me kid" }]} contact={DAD} /> },
  { at: S("You'd sell."), draw: (t) => <Kitchen t={t} mood="lamp" you="worried" mother={null} cam="stove" /> },
  { at: S("So you do the cleverest"), draw: (t) => <Office t={t} you="determined" boss="happy" cam="wide" /> },
  { at: S("Manager: There's nothing there."), draw: (t) => <Office t={t} you="happy" boss="sceptical" cam="wide" /> },
  { at: S("Nobody can buy"), draw: (t) => <Office t={t} you="relieved" boss="shocked" cam="desk" /> },
  // The Dark City (night): the roof; the windows go out (the one wordless peak, 10 s); the answer key.
  { at: S("On the roof, you see"), draw: (t) => <Roof t={t} you="happy" /> },
  { at: S("Around the turn of the century"), draw: (t) => <Roof t={t} close /> },
  { at: E("Now take away the dotted ones."), draw: (t) => <Roof t={t} close out={[0, 210]} /> },
  { at: S("Half the city is talking"), draw: (t) => <Roof t={t} you="happy" out={[-1, 0]} /> },
  { at: S("Your phone buzzes on the roof."), draw: (t) => <Insert t={t} mood="night" msgs={[{ from: "#ffe9a8", text: "Coffee. 9am. Corner cafe." }]} dark /> },
  // The Cafe (morning).
  { at: S("You delete it."), draw: (t) => <Cafe t={t} arrive you="neutral" friend="shocked" cam="wide" /> },
  { at: S("Best friend: You booked this?"), draw: (t) => <Cafe t={t} you="sceptical" friend="shocked" /> },
  { at: S("Best friend: ...Neither did I."), draw: (t) => <Cafe t={t} you="shocked" friend="worried" /> },
  { at: S("Two phones. The night"), draw: (t) => <TwoPhones t={t} /> },
  { at: S("Her instruction. Yours."), draw: (t) => <TwoPhones t={t} texts={["never leave them unanswered", "don't let me lose her"]} /> },
  { at: S("In a 2023 study"), draw: (t) => <Cafe t={t} you="happy" friend="happy" cam="wide" /> },
  { at: S("Neither of you wrote it."), draw: (t) => <Cafe t={t} you="happy" friend="happy" /> },
  // Three Words (lamp): the boss types by hand; the gag; the voice note's half-formed dot.
  { at: S("That evening. Your boss."), draw: (t) => <Insert t={t} mood="lamp" msgs={[{ from: BOSSC, text: "Monday. My office. Bring the phone." }]} contact="#8fa6c4" /> },
  { at: S("The first thing he's ever typed"), draw: (t) => <Kitchen t={t} mood="lamp" you="worried" mother="neutral" /> },
  { at: S("Your father, still at the bottom."), draw: (t) => <Insert t={t} mood="lamp" msgs={[{ from: GREY, text: "Hapy birthday kid" }, { from: GREY, text: "cal me kid" }, { from: BLUE, mine: true, text: "Miss you to" }]} contact={DAD} highlight={2} /> },
  { at: E("Your father, still at the bottom.", 30), draw: (t) => <Insert t={t} mood="lamp" msgs={[{ from: BLUE, mine: true, text: "Miss you to" }, { from: GREY, text: "me to kid" }]} contact={DAD} /> },
  { at: S("Mother: He never could spell."), draw: (t) => <Kitchen t={t} mood="lamp" you="happy" mother="happy" /> },
  { at: S("Then your cousin drops"), draw: (t) => <Insert t={t} mood="lamp" msgs={[{ from: "#d6b8ec", text: "voice note  0:12", dot: true }]} contact="#d6b8ec" dotsAt={70} /> },
  { at: E("Then your cousin drops", 50), draw: (t) => <Kitchen t={t} mood="lamp" you="shocked" mother={null} cam="stove" /> },
  { at: S("So, how many of your last"), draw: (t) => <Kitchen t={t} mood="lamp" you="sceptical" mother={null} cam="wide" /> },
];


/** The script's `> TAG:` lines: text messages (bubbles, lower third), cards (stamped labels) and cast tags. */
export const TAGS: TagDef[] = [
  { at: S(FIRST, 4), text: "YOUR MOTHER: runs the family chat, types with one finger.", kind: "cast" },
  { at: E("Your two aunts.", 4), text: "AUNT ONE: types one word and presses the button.", kind: "cast", frames: 80 },
  { at: E("Your two aunts.", 20), text: "...truly sorry if I caused you hurt.", dot: true, from: MINT, frames: 70 },
  { at: S("Aunt two: She writes"), text: "Of course I forgive you. Family is everything.", dot: true, from: PEACH, frames: 80 },
  { at: S("Nobody suspects a thing.", 90), text: "Told nothing, most never suspected.", kind: "label", frames: 150 },
  { at: S("But here's problem one."), text: "PROBLEM ONE", kind: "label" },
  { at: S("Your best friend. Bea."), text: "YOUR BEST FRIEND: works nights, writes the paragraphs.", kind: "cast" },
  { at: S("Problem two."), text: "PROBLEM TWO", kind: "label" },
  { at: S("Saturday. Your mother's party", 40), text: "YOUR COUSIN: abroad, posts videos to the family.", kind: "cast" },
  { at: S("Shift lead: Twelve hours."), text: "SHIFT LEAD: runs the night floor, whispers.", kind: "cast" },
  { at: S("Monday. The office."), text: "YOUR COWORKER: writes everything in ten minutes.", kind: "cast", frames: 100 },
  { at: S("Coworker: Ten minutes."), text: "YOUR BOSS: praises in paragraphs, types the bad news.", kind: "cast", frames: 100 },
  { at: S("The dating-app man."), text: "THE DATING-APP MAN: a month of flirting, never typed a word.", kind: "cast" },
];

/** The script's `> BUBBLE:` lines. */
export const BUBBLES: BubbleDef[] = [
  { at: S(FIRST, 30), text: "Who means it?", x: 1180, y: 300, frames: 60 },
  { at: E("Now, the obvious move.", 4), text: "Did you write that?", x: 1100, y: 300, frames: 60 },
  { at: E("Saturday. Your mother's party", 4), text: "Cook for one.", x: 1150, y: 300, frames: 60 },
  { at: E("He writes something. Dot.", 2), text: "A machine wrote that.", x: 520, y: 300, frames: 60 },
  { at: E("Manager: There's nothing", 2), text: "Exactly.", x: 600, y: 300, frames: 60 },
];
