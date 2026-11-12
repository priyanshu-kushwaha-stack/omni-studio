// The first cut's shot list: every `> SCENE:` and `> HOLD:` of script.md as a shot, anchored to a narration line
// (its start, or its end for a hold after it), so a new voice take re-times the cut. Line numbers are story.json's
// (0-based). Tags are the script's `> TAG:` lines; bubbles its `> BUBBLE:`.
import type { ReactNode } from "react";
import { Street, Bank, Flat, Passers, Tram, Wheat } from "./parts/Places";
import { Bakery } from "./parts/Bakery";
import { Berlin1923, Cairo } from "./parts/Archive";
import { Chess } from "./parts/Chess";
import { Door, EndCard, Hand } from "./parts/Door";
import { PhoneClose } from "./parts/PhoneClose";
import { balanceOn, phoneLines, ramp, type ShotTime } from "./parts/util";

export interface Anchor { line: number; edge?: "start" | "end"; plus?: number }
export interface ShotDef { at: Anchor; draw: (t: ShotTime) => ReactNode }

const S = (line: number, plus = 0): Anchor => ({ line, edge: "start", plus });
const E = (line: number, plus = 0): Anchor => ({ line, edge: "end", plus });
const day = (n: number) => phoneLines(balanceOn(n));

export const SHOTS: ShotDef[] = [
  // Two Cents (morning): the thumbnail's frame, exactly; the 0 and the 2 peel off and drop by the basket.
  { at: S(0), draw: (t) => <Bakery t={t} mood="morning" layout="thumb" phone="up" balance={day(2)} flaps you={{ face: "happy" }} lotte={{ face: t.f > 200 ? "sceptical" : "neutral", held: "chalk" }} /> },
  { at: S(1), draw: (t) => <PhoneClose t={t} mood="morning" mode="double" days={[1, 2]} /> },
  { at: S(2), draw: (t) => <Bakery t={t} mood="morning" phone="up" balance={day(2)} you={{ face: "happy" }} lotte={{ held: "chalk" }} /> },
  { at: S(5), draw: (t) => <Bakery t={t} mood="morning" layout="lotte" lotte={{ pose: "palm" }} jonas={{}} /> },
  { at: S(6), draw: (t) => <Bakery t={t} mood="morning" props={["coins"]} jonas={{ held: "coins", face: "happy" }} you={{ face: "neutral" }} lotte={{ pose: "palm" }} /> },
  { at: S(8), draw: (t) => <PhoneClose t={t} mood="morning" mode="double" days={[2, 6]} /> },
  { at: S(9), draw: (t) => <Bakery t={t} mood="morning" layout="lotte" lotte={{ face: "happy", pose: "slide", held: "roll" }} jonas={{}} /> },
  // The Chessboard (lamp, after closing).
  { at: E(9), draw: (t) => <Bakery t={t} mood="lamp" props={["chess"]} you={{ face: "happy" }} lotte={{ pose: "rest" }} /> },
  { at: S(13), draw: (t) => <Bakery t={t} mood="lamp" layout="lotte" props={["chess"]} lotte={{ face: "sceptical", pose: "rest" }} /> },
  { at: S(14), draw: (t) => <Chess t={t} mode="board" squares={[0, 16]} /> },
  { at: E(14), draw: (t) => <Chess t={t} mode="dune" /> },
  { at: S(15), draw: (t) => <PhoneClose t={t} mood="lamp" mode="double" days={[2, 4]} /> },
  // Nothing, Nothing, a Roll (morning montage).
  { at: S(16), draw: (t) => <Bakery t={t} mood="morning" phone="up" balance={day(8)} you={{ face: "sceptical" }} lotte={{ held: "roll", pose: "slide" }} /> },
  { at: E(16), draw: (t) => <Bakery t={t} mood="morning" props={["coins"]} jonas={{ held: "coins" }} phone="up" balance={day(8)} you={{ face: "neutral" }} lotte={{ face: "sceptical" }} /> },
  { at: S(17), draw: (t) => <Bakery t={t} mood="morning" props={["coins"]} you={{ face: "happy", pose: "give" }} lotte={{ pose: "palm" }} /> },
  { at: S(18), draw: (t) => <Bakery t={t} mood="morning" layout="lotte" lotte={{ pose: "palm", held: "coin" }} /> },
  { at: S(20), draw: (t) => <Bakery t={t} mood="morning" jonas={{ face: "sceptical" }} you={{ face: "neutral" }} lotte={{ face: "happy" }} /> },
  { at: S(22), draw: (t) => <Bakery t={t} mood="morning" layout="board" board="1,40" lotte={{ pose: "write", held: "chalk" }} /> },
  { at: S(23), draw: (t) => <Bakery t={t} mood="morning" jonas={{ held: "note", face: "happy" }} you={{ face: "happy", pose: "give" }} lotte={{}} /> },
  { at: E(23), draw: (t) => <Bakery t={t} mood="morning" jonas={{ held: "note", face: "neutral" }} you={{ face: "neutral", look: { x: 1, y: 0.1 } }} lotte={{ face: "sceptical" }} /> },
  { at: S(24), draw: (t) => <Bakery t={t} mood="morning" you={{ face: "sceptical" }} jonas={{ face: "happy" }} lotte={{}} /> },
  { at: S(25), draw: (t) => <Tram t={t} mood="morning" /> },
  { at: S(26), draw: (t) => <Bakery t={t} mood="morning" phone="up" balance={day(21)} you={{ face: "worried" }} lotte={{}} /> },
  // Yesterday's Number (dusk): the street party, then the morning after.
  { at: S(27), draw: (t) => <Street t={t} mood="dusk" mode="party" /> },
  { at: E(29), draw: (t) => <PhoneClose t={t} mood="dusk" mode="double" days={[22, 23]} /> },
  { at: S(30), draw: (t) => <Street t={t} mood="morning" mode="after" /> },
  { at: S(31), draw: (t) => <PhoneClose t={t} mood="day" mode="double" days={[23, 27]} /> },
  { at: S(33), draw: (t) => <Bakery t={t} mood="day" phone="up" balance={day(24)} you={{ face: "worried" }} lotte={{}} /> },
  // One Careful Question (day): the bank.
  { at: E(33), draw: (t) => <Bank t={t} /> },
  { at: E(38), draw: (t) => <Bank t={t} page /> },
  { at: S(39), draw: (t) => <Bakery t={t} mood="morning" props={["deed"]} you={{ face: "happy", pose: "give" }} lotte={{ pose: "slide", held: "roll" }} /> },
  { at: S(40), draw: (t) => <Bakery t={t} mood="morning" layout="lotte" lotte={{ face: "happy", pose: "slide", held: "roll" }} /> },
  // Day thirty-one: the key shot, the thumbnail's frame grown huge (the owner's look-test pick, A).
  { at: S(42), draw: (t) => <Bakery t={t} mood="morning" layout="thumb" phone="up" balance={day(31)} you={{ face: "happy" }} lotte={{ held: "chalk" }} /> },
  { at: E(44), draw: (t) => <Bakery t={t} mood="morning" layout="thumb" phone="up" balance={day(31)} spill={ramp(t.p, 0, 0.7)} floor={t.p > 0.6} you={{ face: "happy" }} lotte={{ face: "shocked", held: "chalk" }} /> },
  { at: S(45), draw: (t) => <Bakery t={t} mood="morning" layout="thumb" phone="up" balance={day(31)} spill={1} floor you={{ face: "shocked" }} lotte={{ face: "shocked", held: "chalk" }} /> },
  { at: S(47), draw: (t) => <Bakery t={t} mood="morning" layout="board" board={["1,40", "1,40", "1,60"]} spill={1} lotte={{ held: "chalk" }} /> },
  // Can't Spend It (day).
  { at: S(48), draw: (t) => <Street t={t} mood="day" mode="spend" /> },
  { at: S(49), draw: (t) => <Berlin1923 t={t} /> },
  { at: S(50), draw: (t) => <Bakery t={t} mood="day" layout="note" lotte={{}} /> },
  { at: S(51), draw: (t) => <Bakery t={t} mood="day" phone="up" balance={day(38)} you={{ face: "sceptical" }} lotte={{ pose: "rest" }} /> },
  // Lotte's Chalkboard (dusk, then lamp).
  { at: S(53), draw: (t) => <Bakery t={t} mood="dusk" layout="board" board={["1,40", "2,10", "3,00", "4,20"]} lotte={{ pose: "write", held: "chalk" }} /> },
  { at: S(54), draw: (t) => <><Bakery t={t} mood="dusk" props={["sacks"]} lotte={{ face: "sad" }} you={{ face: "worried" }} /><Passers t={t} /></> },
  { at: S(55), draw: (t) => <Bakery t={t} mood="dusk" layout="lotte" board="4,20" lotte={{ face: "sad", pose: "rest" }} /> },
  { at: E(56), draw: (t) => <Bakery t={t} mood="lamp" layout="lotte" board="4,20" props={["book"]} lotte={{ face: "sad", pose: "write", held: "book" }} /> },
  { at: S(57), draw: (t) => <Bakery t={t} mood="lamp" layout="note" board="4,20" lotte={{ face: "sad" }} /> },
  { at: S(58), draw: (t) => <Bakery t={t} mood="lamp" layout="lotte" board="4,20" lotte={{ face: "sad", pose: "rest" }} /> },
  { at: E(60), draw: (t) => <Bakery t={t} mood="lamp" layout="board" board={["", "4,20"]} lotte={{ pose: "write", held: "chalk" }} /> },
  { at: S(61), draw: (t) => <Bakery t={t} mood="lamp" phone="up" balance={day(42)} you={{ face: "worried" }} lotte={{ face: "sad", pose: "rest" }} /> },
  // Not Me (morning).
  { at: S(62), draw: (t) => <Street t={t} mood="morning" mode="give" /> },
  { at: S(63), draw: (t) => <Bakery t={t} mood="morning" props={["envelope", "sacks"]} you={{ face: "worried", pose: "give" }} lotte={{ face: "determined", pose: "slide" }} /> },
  { at: S(65), draw: (t) => <Bakery t={t} mood="morning" layout="board" board={["4,20", "5,10", "6,30"]} lotte={{ pose: "write", held: "chalk" }} /> },
  { at: S(66), draw: (t) => <Cairo t={t} /> },
  { at: E(66), draw: (t) => <Bakery t={t} mood="morning" jonas={{ held: "coins", face: "sad" }} lotte={{ face: "sad" }} you={{ face: "worried" }} /> },
  { at: S(67), draw: (t) => <Bakery t={t} mood="morning" phone="up" balance={day(50)} jonas={{ face: "sad" }} you={{ face: "worried", pose: "give" }} lotte={{ face: "sad" }} /> },
  { at: S(69), draw: (t) => <Bakery t={t} mood="morning" jonas={{ face: "sad" }} you={{ face: "afraid" }} lotte={{ face: "sad" }} /> },
  { at: S(70), draw: (t) => <PhoneClose t={t} mood="morning" mode="double" days={[50, 55]} /> },
  // The Planet (night).
  { at: S(71), draw: (t) => <Wheat t={t} level={[0, 320]} /> },
  { at: E(71), draw: (t) => <Wheat t={t} level={[320, 980]} /> },
  { at: S(72), draw: (t) => <Bakery t={t} mood="night" phone="up" balance={day(55)} props={["sacks"]} you={{ face: "worried" }} lotte={{ face: "sad", pose: "rest" }} /> },
  { at: S(73), draw: (t) => <Bakery t={t} mood="night" phone="ear" you={{ face: "determined", pose: "ear" }} lotte={{ face: "sad", pose: "rest" }} /> },
  // Exactly Zero (lamp).
  { at: S(74), draw: (t) => <Flat t={t} ear face="determined" /> },
  { at: S(75), draw: (t) => <Flat t={t} face="worried" /> },
  { at: E(75), draw: (t) => <PhoneClose t={t} mood="lamp" mode="countdown" days={[55, 55]} cents={[2 ** 54, 0]} /> },
  { at: S(76), draw: (t) => <Flat t={t} face="relieved" /> },
  { at: S(77), draw: (t) => <PhoneClose t={t} mood="lamp" mode="refund" days={[55, 55]} /> },
  { at: S(79), draw: (t) => <Flat t={t} face="determined" /> },
  { at: E(79), draw: (t) => <Door t={t} give /> },
  // The wordless peak: the lock screen's coin with nothing to tear, then Lotte's closed hand, the camera drifting in.
  { at: E(81), draw: (t) => <PhoneClose t={t} mood="lamp" mode="still" days={[56, 56]} /> },
  { at: E(81, 100), draw: (t) => <Hand t={t} /> },
  { at: E(82), draw: (t) => <Door t={t} lampOut /> },
  // Back to the Counter (morning).
  { at: S(83), draw: (t) => <Bakery t={t} mood="morning" board="3,90" props={["coins"]} phone="down" jonas={{ held: "coins", face: "happy" }} you={{ face: "neutral" }} lotte={{ pose: "palm" }} /> },
  { at: E(83), draw: (t) => <Bakery t={t} mood="morning" layout="lotte" board="3,90" phone="down" lotte={{ pose: t.p < 0.6 ? "palm" : "rest", face: "neutral" }} /> },
  { at: S(85), draw: (t) => <Bakery t={t} mood="morning" layout="board" board="3,90" lotte={{ pose: "rest" }} /> },
  { at: S(86), draw: (t) => <Bakery t={t} mood="morning" layout="lotte" board="3,90" lotte={{ face: "happy", pose: "slide", held: "roll" }} /> },
  { at: S(87), draw: (t) => <Bakery t={t} mood="morning" board="3,90" phone="down" you={{ face: "happy" }} lotte={{ face: "happy" }} /> },
  { at: E(87), draw: (t) => <Bakery t={t} mood="morning" board="3,90" phone="down" jonas={{ held: "coins", face: t.p > 0.4 ? "shocked" : "happy" }} you={{ face: "happy" }} lotte={{ pose: "write", held: "chalk" }} /> },
  { at: E(88), draw: (t) => <EndCard t={t} /> },
];

export interface TagDef { at: Anchor; text: string; frames?: number }
export const TAGS: TagDef[] = [
  { at: E(13), text: "1 · 2 · 4 · 8" },
  { at: S(16), text: `DAY 8 · ${balanceOn(8)}` },
  { at: S(17), text: `DAY 11 · ${balanceOn(11)}` },
  { at: S(22), text: `DAY 14 · ${balanceOn(14)}` },
  { at: S(23), text: `DAY 17 · ${balanceOn(17)}` },
  { at: S(24), text: `DAY 19 · ${balanceOn(19)}` },
  { at: E(25), text: "DAY 21 · 10.485,76" },
  { at: S(27), text: `DAY 22 · ${balanceOn(22)}` },
  { at: E(33), text: "DAY 24 · 83.886,08" },
  { at: S(39), text: `DAY 28 · ${balanceOn(28)}` },
  { at: E(43), text: "DAY 31 · 10.737.418,24" },
  { at: E(48), text: "DAY 36 · 343.597.383,68" },
  { at: S(53), text: `DAY 40 · ${balanceOn(40)}` },
  { at: S(62), text: `DAY 45 · ${balanceOn(45)}` },
  { at: E(70), text: "DAY 55 · 180.143.985.094.819,84" },
  { at: E(75), text: "23:50 · 0,00" },
  { at: E(76), text: "23:57 · 0,01" },
  { at: E(81), text: "23:59 · 0,00" },
  { at: S(83), text: "DAY 56" },
];

export interface BubbleDef { at: Anchor; text: string; x: number; y: number; frames?: number }
export const BUBBLES: BubbleDef[] = [{ at: E(36), text: "Mine.", x: 960, y: 520, frames: 90 }];
