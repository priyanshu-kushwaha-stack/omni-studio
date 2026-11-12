// The first cut's shot list for script v1.1: every `> SCENE:` and `> HOLD:` of script.md as a shot, anchored to a spoken
// line (its start, or its end for a hold after it) by the line's opening words, so a new voice take or a reordered
// script re-times the cut and a line that no longer exists fails the render. Tags are the script's `> TAG:` lines (text
// messages show as a chat bubble; a label as the stamped tag); bubbles are its `> BUBBLE:` lines.
import type { ReactNode } from "react";
import { KeyShot } from "./parts/KeyShot";
import {
  Aunts, BIRTHDAY, BLUE, BreakRoom, Bus, BusStop, Bedroom, Cafe, ClockSheet, Cousin, GREY, Insert, Kitchen, LAV, Man,
  MapSheet, MINT, Office, PEACH, PINK, Roof, RuleSheet, Shoebox, StudySheet, TwoPhones,
} from "./parts/Scenes";
import type { Msg, ShotTime } from "./parts/util";

/** A spoken line by its opening words (story.json's `text`), and which edge of it. */
export interface Anchor { line: string; edge?: "start" | "end"; plus?: number }
export interface ShotDef { at: Anchor; draw: (t: ShotTime) => ReactNode }
export interface TagDef { at: Anchor; text: string; kind?: "message" | "label"; dot?: boolean; from?: string; frames?: number }
export interface BubbleDef { at: Anchor; text: string; x: number; y: number; frames?: number }

export const S = (line: string, plus = 0): Anchor => ({ line, edge: "start", plus });
export const E = (line: string, plus = 0): Anchor => ({ line, edge: "end", plus });

const many = (n: number, from: string, dot = true, lines = 2): Msg[] => Array.from({ length: n }, (_, i) => ({ from, lines: lines + (i % 2), dot }));
const SENT: Msg[] = Array.from({ length: 9 }, (_, i) => ({ from: BLUE, mine: true, lines: 1 + (i % 3), dot: true }));
const HERS: Msg[] = [
  { from: BLUE, mine: true, text: "ok" }, { from: PINK, lines: 3, dot: true }, { from: BLUE, mine: true, text: "fine" },
  { from: PINK, lines: 4, dot: true }, { from: BLUE, mine: true, text: "k" }, { from: PINK, lines: 3, dot: true },
];
const DRAFTS: Msg[] = ["im sory", "pls dont go", "i miss u", "r we ok", "call me?"].map((text) => ({ from: PINK, text }));

const FIRST = "Mother: Make a wish";

export const SHOTS: ShotDef[] = [
  // Make a Wish (lamp, before six): the skit. The column stacks, the cake, the wish, the smoke, the dots; the key shot.
  { at: S(FIRST), draw: (t) => <Insert t={t} mood="lamp" msgs={BIRTHDAY.slice(0, 4).map((m) => ({ ...m, dot: false }))} /> },
  { at: S(FIRST, 2), draw: (t) => <Kitchen t={t} mood="lamp" you="sad" mother="happy" cake /> },
  { at: E(FIRST), draw: (t) => <Kitchen t={t} mood="lamp" you="worried" mother="happy" cake cam="stove" /> },
  { at: E(FIRST, 30), draw: (t) => <Insert t={t} mood="lamp" msgs={BIRTHDAY.slice(0, 4)} dotsAt={8} dotEvery={8} /> },
  { at: S("Mother: What? What is it?"), draw: (t) => <Kitchen t={t} mood="lamp" you="shocked" mother="worried" /> },
  // The thumbnail's frame, exactly (K13), by about 0:12; the dots on; the bare bubble.
  { at: E("Mother: What? What is it?"), draw: (t) => <KeyShot t={t} dotsAt={[0, 6, 12, 18]} smoke={1} /> },
  { at: S("You asked who meant it."), draw: (t) => <KeyShot t={t} push={0.03} /> },
  { at: S("So what if you could see"), draw: (t) => <Insert t={t} mood="lamp" msgs={BIRTHDAY} dotsAt={0} dotEvery={2} highlight={4} /> },
  { at: S("Forty-one messages."), draw: (t) => <Insert t={t} mood="lamp" msgs={[...many(5, PEACH), ...BIRTHDAY.slice(3)]} dotsAt={0} dotEvery={2} highlight={6} /> },
  { at: S("Your father. Eight months"), draw: (t) => <KeyShot t={t} push={0.06} /> },
  // The Rule (morning).
  { at: S("You've always graded"), draw: (t) => <Kitchen t={t} mood="morning" you="sceptical" mother="neutral" /> },
  { at: S("The rule. Every message"), draw: (t) => <RuleSheet t={t} /> },
  { at: S("Only you see them."), draw: (t) => <Kitchen t={t} mood="morning" you="neutral" mother="neutral" cam="stove" /> },
  { at: S("But a dot says who wrote it."), draw: (t) => <Insert t={t} mood="morning" msgs={BIRTHDAY} dotsAt={0} dotEvery={1} /> },
  { at: S("Mother: Dots? What dots?"), draw: (t) => <Kitchen t={t} mood="morning" you="worried" mother="sceptical" cam="twoShot" /> },
  { at: S("Your father is one of"), draw: (t) => <MapSheet t={t} /> },
  { at: S("You start writing him"), draw: (t) => <Insert t={t} mood="morning" msgs={[BIRTHDAY[4], { from: BLUE, mine: true, text: "Dad, I wanted to say" }, { from: "#e4e7ec", mine: true, lines: 2 }]} /> },
  { at: S("You don't send it."), draw: (t) => <Kitchen t={t} mood="morning" you="determined" mother={null} /> },
  // The Detective (day): the bus to work; the landlord, the boss; the aunts; the dating man; the pattern; the study.
  { at: S("The landlord."), draw: (t) => <Insert t={t} mood="day" place="bus" msgs={[{ from: GREY, text: "Rent due Friday." }, { from: GREY, text: "No excuses." }]} /> },
  { at: S("Your boss. So proud"), draw: (t) => <Insert t={t} mood="day" place="bus" msgs={[{ from: "#c9d3e6", lines: 4, dot: true }, { from: "#c9d3e6", text: "noted" }]} dotsAt={10} /> },
  { at: S("Your two aunts."), draw: (t) => <Aunts t={t} /> },
  { at: E("Your two aunts.", 60), draw: (t) => <Aunts t={t} one="happy" two="happy" /> },
  { at: S("Aunt one: Forgive me?"), draw: (t) => <Aunts t={t} one="sceptical" two="happy" /> },
  { at: S("Nobody did anything."), draw: (t) => <Aunts t={t} one="worried" two="relieved" /> },
  { at: S("Your cousin abroad."), draw: (t) => <Insert t={t} mood="day" place="office" msgs={[{ from: "#d6b8ec", text: "Thinking of you always", dot: true }]} contact="#d6b8ec" dotsAt={30} /> },
  { at: S("The man from the dating app."), draw: (t) => <Insert t={t} mood="day" place="office" msgs={many(6, "#9fd3e6", true, 1)} contact="#9fd3e6" dotEvery={4} /> },
  { at: S("Then the pattern."), draw: (t) => <Insert t={t} mood="day" place="office" msgs={[{ from: PINK, lines: 3, dot: true }, { from: "#c9b2e0", text: "eat first" }, { from: MINT, lines: 3, dot: true }, { from: "#8fb8b4", text: "hbd!!" }, { from: GREY, text: "Rent due Friday." }]} dotEvery={5} /> },
  { at: S("Your mother's eat first"), draw: (t) => <Insert t={t} mood="day" place="office" msgs={[{ from: "#c9b2e0", text: "eat first" }]} contact="#c9b2e0" /> },
  { at: S("In a study this year"), draw: (t) => <StudySheet t={t} /> },
  { at: S("And you agree with them."), draw: (t) => <Office t={t} you="sceptical" /> },
  { at: S("But here's problem one."), draw: (t) => <Office t={t} you="worried" cam="screen" /> },
  // The Test (dusk): the bus stop.
  { at: S("Your best friend. Bea."), draw: (t) => <BusStop t={t} you="sad" /> },
  { at: S("You don't ask."), draw: (t) => <Insert t={t} mood="dusk" place="kitchen" msgs={[{ from: PINK, lines: 4, dot: true }, { from: BLUE, mine: true, text: "the goat on the bus?" }]} contact="#f4b8c8" /> },
  { at: S("The day a goat"), draw: (t) => <BusStop t={t} you="happy" /> },
  { at: E("The day a goat"), draw: (t) => <Insert t={t} mood="dusk" msgs={[{ from: BLUE, mine: true, text: "the goat on the bus?" }, { from: PINK, lines: 5, dot: true }]} contact="#f4b8c8" dotsAt={70} /> },
  { at: E("The day a goat", 150), draw: (t) => <Insert t={t} mood="dusk" msgs={[{ from: PINK, lines: 5, dot: true }, { from: BLUE, mine: true, text: "ok" }, { from: PINK, text: "Everything alright?", dot: true }]} contact="#f4b8c8" dotsAt={0} dotEvery={50} /> },
  { at: S("The first time in eleven"), draw: (t) => <BusStop t={t} you="sad" /> },
  { at: S("Then you make the mistake"), draw: (t) => <BusStop t={t} you="determined" /> },
  // Your Own Dots (lamp): the sent folder, the instruction.
  { at: S("Your sent folder."), draw: (t) => <Bedroom t={t} you="neutral" /> },
  { at: E("Your sent folder."), draw: (t) => <Insert t={t} mood="lamp" place="bedroom" msgs={SENT} dotsAt={4} dotEvery={4} contact="#F2B632" /> },
  { at: S("Your thank-you to your boss."), draw: (t) => <Insert t={t} mood="lamp" place="bedroom" msgs={SENT} dotsAt={0} dotEvery={0} contact="#F2B632" /> },
  { at: S("Gmail has offered"), draw: (t) => <Insert t={t} mood="lamp" place="bedroom" msgs={[{ from: BLUE, mine: true, text: "Thank you so much for" }, { from: "#e4e7ec", mine: true, lines: 2 }]} contact="#F2B632" /> },
  { at: S("The detective is a suspect."), draw: (t) => <Bedroom t={t} you="shocked" cam="desk" /> },
  { at: S("You typed that a year ago"), draw: (t) => <Insert t={t} mood="lamp" place="bedroom" msgs={[{ from: "#e4e7ec", text: "can send messages: on" }, { from: "#e4e7ec", text: "can add events: on" }, { from: "#ffe9a8", text: "don't let me lose her" }]} contact="#F2B632" highlight={2} /> },
  { at: S("You switch every suggestion"), draw: (t) => <Bedroom t={t} you="determined" /> },
  { at: S("But here's problem two."), draw: (t) => <Bedroom t={t} you="sad" cam="wide" /> },
  // The Cold Week (day): the montage; the blocked man; the kitchen and "cal me kid".
  { at: S("You type every word"), draw: (t) => <Office t={t} you="determined" /> },
  { at: S("Hers get longer."), draw: (t) => <Insert t={t} mood="day" place="office" msgs={[{ from: PINK, lines: 3, dot: true }, { from: BLUE, mine: true, text: "fine" }, { from: PINK, lines: 4, dot: true }, { from: BLUE, mine: true, text: "busy" }, { from: PINK, lines: 5, dot: true }]} contact="#f4b8c8" dotEvery={10} /> },
  { at: S("The dots become a blade."), draw: (t) => <Bus t={t} mood="day" you="determined" /> },
  { at: E("The dots become a blade."), draw: (t) => <Man t={t} face="worried" /> },
  { at: S("You never see it."), draw: (t) => <Man t={t} face="sad" /> },
  { at: S("Mother: Why so cold"), draw: (t) => <Kitchen t={t} mood="dusk" you="sceptical" mother="sad" /> },
  { at: S("Your father. No dot. You don't call."), draw: (t) => <Insert t={t} mood="dusk" msgs={[{ from: GREY, text: "Hapy birthday kid" }, { from: GREY, text: "cal me kid" }]} contact="#a8c99a" /> },
  { at: S("The one person who never"), draw: (t) => <Kitchen t={t} mood="dusk" you="sad" mother="sad" cam="stove" /> },
  // The Shoebox (lamp).
  { at: E("The one person who never"), draw: (t) => <Shoebox t={t} mother="neutral" /> },
  { at: S("Mother: He never could spell. Look."), draw: (t) => <Shoebox t={t} mother="happy" /> },
  { at: S("For over a hundred years"), draw: (t) => <Shoebox t={t} mother="relieved" /> },
  { at: S("A dot is a greeting card"), draw: (t) => <Kitchen t={t} mood="lamp" you="sceptical" mother="happy" /> },
  { at: S("So you decide to end it."), draw: (t) => <Kitchen t={t} mood="lamp" you="determined" mother={null} cam="stove" /> },
  // The Bench (night): the night bus and the kid; time; the break room.
  { at: S("The night bus."), draw: (t) => <Bus t={t} mood="night" you="sad" kid="neutral" cam="wide" /> },
  { at: S("Bus kid: How do you spell"), draw: (t) => <Bus t={t} mood="night" you="neutral" kid="worried" /> },
  { at: E("Bus kid: How do you spell"), draw: (t) => <Bus t={t} mood="night" you="happy" kid="happy" /> },
  { at: S("What limits a friendship"), draw: (t) => <ClockSheet t={t} /> },
  { at: S("Twelve hours a night."), draw: (t) => <Bus t={t} mood="night" you="sad" cam="seats" /> },
  { at: E("Twelve hours a night."), draw: (t) => <BreakRoom t={t} you="worried" coworker="neutral" cam="wide" /> },
  { at: E("Twelve hours a night.", 120), draw: (t) => <Insert t={t} mood="lamp" place="break" msgs={[{ from: "#ffe9a8", text: "do not miss" }, { from: "#F2B632", lines: 1 }, { from: "#ffe9a8", text: "never leave them unanswered" }]} contact="#f4b8c8" /> },
  { at: S("Coworker: Twelve hours."), draw: (t) => <BreakRoom t={t} you="sad" coworker="worried" cam="wide" /> },
  { at: S("Best friend: You came?"), draw: (t) => <BreakRoom t={t} you="sad" friend="relieved" coworker={null} youSpot="beside" /> },
  { at: S("She was keeping you"), draw: (t) => <BreakRoom t={t} you="sad" friend="relieved" coworker={null} youSpot="beside" cam="wide" /> },
  // The Cost (lamp).
  { at: S("Her side."), draw: (t) => <Insert t={t} mood="lamp" place="break" msgs={HERS} contact="#F2B632" dotsAt={0} dotEvery={0} /> },
  { at: S("Then her drafts."), draw: (t) => <Insert t={t} mood="lamp" place="break" msgs={DRAFTS} contact="#f4b8c8" /> },
  { at: S("Best friend: I didn't know"), draw: (t) => <BreakRoom t={t} you="sad" friend="sad" coworker={null} youSpot="beside" /> },
  { at: S("You'd have believed"), draw: (t) => <BreakRoom t={t} you="sad" friend="sad" coworker={null} youSpot="beside" cam="wide" /> },
  { at: S("Best friend: Eleven years"), draw: (t) => <BreakRoom t={t} you="worried" friend="sceptical" coworker={null} youSpot="beside" /> },
  { at: S("But when you look up"), draw: (t) => <BreakRoom t={t} you="shocked" friend="neutral" coworker={null} youSpot="beside" cam="wide" /> },
  // Fields of Red (day): reviews, the cousin's comments, bots, the offer, the dilemma, the boss.
  { at: S("The restaurant downstairs."), draw: (t) => <Insert t={t} mood="day" place="office" msgs={many(5, "#fff1c6", true, 1)} contact="#e6a0a0" dotEvery={4} /> },
  { at: S("Cousin: Thank you all"), draw: (t) => <Cousin t={t} /> },
  { at: S("Four hundred comments"), draw: (t) => <Insert t={t} mood="day" place="office" msgs={many(8, "#e4e7ec", true, 1)} contact="#d6b8ec" dotEvery={2} /> },
  { at: S("At work, you start calling it."), draw: (t) => <Office t={t} you="determined" boss="sceptical" cam="wide" /> },
  { at: S("One security company"), draw: (t) => <Office t={t} you="neutral" boss="sceptical" cam="wide" screen="chart" /> },
  { at: S("Then your boss's message."), draw: (t) => <Insert t={t} mood="day" place="office" msgs={[{ from: "#c9d3e6", lines: 4, dot: true }]} dotsAt={40} /> },
  { at: S("Your father, under your mother's"), draw: (t) => <Insert t={t} mood="day" place="office" msgs={[...many(5, LAV, true, 1), { from: GREY, text: "cant wait" }]} dotsAt={0} dotEvery={1} highlight={5} contact="#c9b2e0" /> },
  { at: S("If a machine wrote it"), draw: (t) => <Office t={t} you="worried" cam="desk" /> },
  { at: S("Sell what you see"), draw: (t) => <Office t={t} you="sad" boss="happy" cam="wide" /> },
  { at: S("Manager: There's nothing there."), draw: (t) => <Office t={t} you="determined" boss="sceptical" cam="wide" /> },
  { at: S("You walk out."), draw: (t) => <Office t={t} you="relieved" boss="shocked" cam="wide" /> },
  // The Dark City (night): the roof; the windows go out (the one wordless peak, 10 s).
  { at: S("You walk out with the dots"), draw: (t) => <Roof t={t} you="neutral" /> },
  { at: S("Around the turn of the century"), draw: (t) => <Roof t={t} close /> },
  { at: S("Every lit window is a chat."), draw: (t) => <Roof t={t} you="shocked" /> },
  { at: E("Now take away the dotted ones."), draw: (t) => <Roof t={t} close out={[0, 210]} /> },
  { at: S("Those are the people typing."), draw: (t) => <Roof t={t} close out={[-1, 0]} /> },
  // The Cafe (morning).
  { at: S("Your phone buzzes."), draw: (t) => <Insert t={t} mood="night" msgs={[{ from: "#ffe9a8", text: "Coffee. 9am. Corner cafe." }]} dark /> },
  { at: S("You delete it."), draw: (t) => <Cafe t={t} arrive you="neutral" friend="shocked" cam="wide" /> },
  { at: S("Best friend: You booked this?"), draw: (t) => <Cafe t={t} you="sceptical" friend="shocked" /> },
  { at: S("Best friend: ...Neither did I."), draw: (t) => <Cafe t={t} you="shocked" friend="worried" /> },
  { at: S("The best conversation"), draw: (t) => <TwoPhones t={t} /> },
  { at: S("Her instruction. Yours."), draw: (t) => <TwoPhones t={t} texts={["never leave them unanswered", "don't let me lose her"]} /> },
  { at: S("In a 2023 study"), draw: (t) => <Cafe t={t} you="neutral" friend="neutral" cam="wide" /> },
  { at: S("You said a machine"), draw: (t) => <Cafe t={t} you="sad" friend="happy" /> },
  { at: S("Nobody wrote it."), draw: (t) => <Cafe t={t} you="happy" friend="happy" /> },
  // Three Words (lamp).
  { at: S("Your father's message. Two weeks"), draw: (t) => <Kitchen t={t} mood="lamp" you="sad" mother="neutral" /> },
  { at: S("Three words. One of them wrong."), draw: (t) => <Insert t={t} mood="lamp" msgs={[{ from: GREY, text: "Hapy birthday kid" }, { from: GREY, text: "cal me kid" }, { from: GREY, text: "cant wait" }, { from: BLUE, mine: true, text: "Miss you to" }]} contact="#a8c99a" highlight={3} /> },
  { at: S("Send. No dot."), draw: (t) => <Kitchen t={t} mood="lamp" you="neutral" mother="neutral" cam="stove" /> },
  { at: E("Send. No dot.", 60), draw: (t) => <Insert t={t} mood="lamp" msgs={[{ from: BLUE, mine: true, text: "Miss you to" }, { from: GREY, text: "me to kid" }]} contact="#a8c99a" /> },
  { at: S("Mother: He never could spell."), draw: (t) => <Kitchen t={t} mood="lamp" you="happy" mother="happy" /> },
  { at: S("No paragraph."), draw: (t) => <Kitchen t={t} mood="lamp" you="relieved" mother="happy" cam="wide" /> },
  { at: S("Tomorrow someone will send"), draw: (t) => <KeyShot t={t} push={0.05} /> },
  { at: E("Tomorrow someone will send"), draw: (t) => <Insert t={t} mood="lamp" msgs={[{ from: "#d6b8ec", text: "voice note  0:12", dot: true }]} contact="#d6b8ec" dotsAt={60} /> },
  { at: S("So, would you fix the typo?"), draw: (t) => <Kitchen t={t} mood="lamp" you="neutral" mother={null} cam="wide" /> },
];

/** The script's `> TAG:` lines that are text messages (bubbles, lower third) or labels. */
export const TAGS: TagDef[] = [
  { at: E("Your two aunts.", 20), text: "...truly sorry if I caused you hurt.", dot: true, from: MINT, frames: 70 },
  { at: S("Aunt two: She writes"), text: "Of course I forgive you. Family is everything.", dot: true, from: PEACH, frames: 80 },
  { at: E("The dots become a blade.", 20), text: "hey did i say somthing", from: "#9fd3e6", frames: 100 },
];

/** The script's `> BUBBLE:` lines. */
export const BUBBLES: BubbleDef[] = [
  { at: S(FIRST, 40), text: "Who means it?", x: 1180, y: 300, frames: 70 },
  { at: S("Manager: There's nothing"), text: "Exactly.", x: 600, y: 300, frames: 60 },
];
