// Part C of the first cut's shot list: The Cheque, Hammers, The Dial, Stool Four (story.json lines 71-103, from "So you
// give the money back." to the end card). Every `> SCENE:` and `> HOLD:` of those sections as shots in film order,
// anchored to the spoken lines (shotTypes.ts S/E); a shot lasts until the next one's anchor. The cards that fit on one
// line are label tags; the three that don't (Pigou, the model's fix, Visa) are stamped in their shots on two lines
// (parts/c/kit.tsx Stamp2, the same look). Scenes: parts/c/.
import { E, S, type BubbleDef, type ShotDef, type TagDef } from "../shotTypes";
import { CardAndPhone, CardAtTill, DIAL_LOW, DIAL_NAPKIN, DIAL_TOWN, LayDown, MayorThumbs, PhoneAndNapkin, TownNapkin } from "../parts/c/Inserts";
import { act, mix, ramp, Stamp2 } from "../parts/c/kit";
import { AgentSheet, AlaskaSheet, BoardSheet, FixesSheet, LoopSheet, LudditeSheet, PigouSheet, QuartetSheet, TabSheet } from "../parts/c/Papers";
import { Peak } from "../parts/c/Rooms";
import {
  Apprentice, Band, BankBack, BossDoor, BossReads, BossTurns, ChequeQueue, ChequeTable, CoinRound, CustomerCross, CustomerIn, Dilemma,
  FileOut, FirstLight, GateBack, Hammers, Keepers, Lunch, March, MarcoEats, MarcoLooks, MarcoSits, MarcoTicks, MayorAsks, NoMachines,
  NoPlant, Owners, OwnersSum, PastStranger, PlumberCar, Richest, SlideNapkin, SmilingFace, Standoff, StoolsEmpty, StoolsFill, TillCash,
  TruckScene, TwoBack, TwoCooks, Week, YouLook,
} from "../parts/c/Scenes";

const GIVE = "So you give the money back.";
const ALASKA = "It's been done, more or less.";
const QUARTET = "A string quartet takes";
const COMES = "And then the town comes";
const TRIED = "It's been tried.";
const BOSS_SMASH = "Plant boss: Smash ours";
const P3 = "Problem three.";
const MARCO_LINE = "Marco: I used to make";
const OWNERS = "Every owner in town was right";
const SMASH = "Smash them, and the plant";
const REMEMBER = "And you remember the one thing";
const TOO_FAR = "Too far.";
const THERE = "There. A machine shift";
const PIGOU = "In 1920 the economist";
const MAYOR = "Mayor: And who owns";
const ONLY = "Only you can turn it.";
const RIVAL_COOK = "Rival: Cheaper to hire";
const FRIDAY = "Friday noon.";
const MODEL = "In the two economists' model";
const RICHEST = "You're still the richest";
const STILL = "Plant boss: Still cheaper";
const TOMORROW = "Tomorrow, when you pay";
const VISA = "That part's true too.";
const LAST = "So, who do you think paid";

export const SHOTS_C: ShotDef[] = [
  // The Cheque (day): you give the money back; the square; Alaska; the stools fill for a week, then empty; the keepers.
  { at: S(GIVE), draw: (t) => <TillCash t={t} /> },
  { at: S("You write every resident a cheque."), draw: (t) => <ChequeTable t={t} /> },
  { at: S(ALASKA), draw: (t) => <AlaskaSheet t={t} /> },
  { at: S(ALASKA, 132), draw: (t) => <ChequeQueue t={t} /> },
  { at: E(ALASKA), draw: (t) => <StoolsFill t={t} /> },
  { at: S("The stools fill for a week."), draw: (t) => <Week t={t} /> },
  { at: S("Then the money goes into tills"), draw: (t) => <LoopSheet t={t} /> },
  { at: S("It pays the bills."), draw: (t) => <StoolsEmpty t={t} /> },
  { at: S("Who keeps the money?"), draw: (t) => <Keepers t={t} /> },
  { at: S(QUARTET), draw: (t) => <Band t={t} /> },
  { at: S(QUARTET, 110), draw: (t) => <QuartetSheet t={t} /> },
  { at: E(QUARTET), draw: (t) => <PlumberCar t={t} /> },
  { at: S("Your old waitress is"), draw: (t) => <Apprentice t={t} /> },
  { at: S("Your old waitress is", 96), draw: (t) => <Apprentice t={t} close /> },
  // Hammers (lamp): the town marches; the hammers over the counter; nobody can hit a smiling face; the Luddites; the
  // stranger passed; the boss in the doorway; problem three; Marco's burger; the dilemma; the napkin and the phone.
  { at: S(COMES), draw: (t) => <March t={t} /> },
  { at: E(COMES), draw: (t) => <Hammers t={t} /> },
  { at: S("Nobody can bring themselves"), draw: (t) => <SmilingFace t={t} /> },
  { at: S(TRIED), draw: (t) => <LudditeSheet t={t} /> },
  { at: S(TRIED, 200), draw: (t) => <PastStranger t={t} /> },
  { at: S(BOSS_SMASH), draw: (t) => <BossDoor t={t} /> },
  { at: S(BOSS_SMASH, 104), draw: (t) => <BossDoor t={t} wide /> },
  { at: S(P3), draw: (t) => <Standoff t={t} /> },
  { at: E(P3), draw: (t) => <MarcoSits t={t} /> },
  { at: S(MARCO_LINE), draw: (t) => <MarcoEats t={t} /> },
  { at: E(MARCO_LINE), draw: (t) => <MarcoEats t={t} eat /> },
  { at: S(OWNERS), draw: (t) => <Owners t={t} /> },
  { at: S(OWNERS, 72), draw: (t) => <Owners t={t} wide /> },
  { at: S(SMASH), draw: (t) => <Dilemma t={t} smash /> },
  { at: S(SMASH, 102), draw: (t) => <Dilemma t={t} smash={false} /> },
  { at: E(SMASH), draw: (t) => <LayDown t={t} /> },
  // The Dial (morning): first light; the ring all the way up and everything files out; the rival and the truck; too
  // far; back down to the napkin's line; two cooks back; the tab; the town's cheque; Pigou; the mayor's thumbs; the
  // town's number; the owners' second sum; the truck reloaded; the bank and the gate; Friday noon; THE PEAK; the fix.
  { at: S(REMEMBER), draw: (t) => <FirstLight t={t} /> },
  { at: S(REMEMBER, 44), draw: (t) => <PhoneAndNapkin t={t} value={DIAL_LOW} thumb glow={0} /> },
  { at: E(REMEMBER), draw: (t) => <PhoneAndNapkin t={t} value={mix(DIAL_LOW, 1, act(t.f, 2, 10))} thumb push={0.08} /> },
  { at: E(REMEMBER, 16), draw: (t) => <FileOut t={t} /> },
  { at: S("Rival: Mine too?"), draw: (t) => <TruckScene t={t} load={8} away={act(t.f, 0, t.dur + 20)} rival="chase" /> },
  { at: S(TOO_FAR), draw: (t) => <NoMachines t={t} /> },
  { at: S(TOO_FAR, 92), draw: (t) => <NoPlant t={t} /> },
  { at: E(TOO_FAR), draw: (t) => <PhoneAndNapkin t={t} value={mix(1, DIAL_NAPKIN, act(t.f, 2, 40))} thumb glow={ramp(t.f, 40, 48)} /> },
  { at: E(TOO_FAR, 56), draw: (t) => <TwoBack t={t} /> },
  { at: S(THERE, 24), draw: (t) => <TwoCooks t={t} /> },
  { at: S(THERE, 84), draw: (t) => <TabSheet t={t} /> },
  { at: S("The app pays it to you."), draw: (t) => <ChequeQueue t={t} mood="morning" phone /> },
  { at: S(PIGOU), draw: (t) => <PigouWithCard t={t} /> },
  { at: S(PIGOU, 186), draw: (t) => <PhoneAndNapkin t={t} value={DIAL_NAPKIN} glow={0.5 + 0.5 * Math.sin(t.f * 0.2)} /> },
  { at: S(MAYOR), draw: (t) => <MayorAsks t={t} /> },
  { at: E(MAYOR), draw: (t) => <PhoneAndNapkin t={t} value={DIAL_NAPKIN} push={0.06}><MayorThumbs f={t.f} v={DIAL_NAPKIN} /></PhoneAndNapkin> },
  { at: E(MAYOR, 76), draw: (t) => <SlideNapkin t={t} /> },
  { at: S(ONLY), draw: (t) => <TownNumber t={t} /> },
  { at: S(ONLY, 150), draw: (t) => (
    <PhoneAndNapkin t={t} value={mix(DIAL_NAPKIN, DIAL_TOWN, act(t.f, 8, 36))} thumb={t.f < 52} napkin={<TownNapkin x={560} y={560} n={6.4} hands={false} />} />
  ) },
  { at: E(ONLY), draw: (t) => <OwnersSum t={t} /> },
  { at: E(ONLY, 44), draw: (t) => <TruckScene t={t} load={mix(2, 8, ramp(t.f, 0, 46))} away={0} rival="count" /> },
  { at: S(RIVAL_COOK), draw: (t) => <TruckScene t={t} load={8} away={0} rival="shrug" cam={{ x: 1450, y: 700, zoom: 1.7 }} /> },
  { at: E(RIVAL_COOK), draw: (t) => <BankBack t={t} /> },
  { at: E(RIVAL_COOK, 54), draw: (t) => <GateBack t={t} /> },
  { at: S(FRIDAY), draw: (t) => <BoardSheet t={t} /> },
  { at: E(FRIDAY), draw: (t) => <Peak t={t} /> },
  { at: S(MODEL), draw: (t) => <FixesSheet t={t} stage={0} /> },
  { at: S(MODEL, 196), draw: (t) => <FixWithCard t={t} /> },
  { at: S(MODEL, 300), draw: (t) => <MarcoTicks t={t} /> },
  { at: S(RICHEST), draw: (t) => <Richest t={t} /> },
  { at: S(RICHEST, 64), draw: (t) => <Lunch t={t} push={[1.06, 1]} /> },
  // Stool Four (day): the boss on stool four; the napkin in his tie pocket; the money going round; the steel customer
  // back in a cap with a card that isn't yours; your phone does not ping; Visa; three looks; the last image.
  { at: S(STILL), draw: (t) => <Lunch t={t} cam={{ x: 1000, y: 740, zoom: 1.75 }} boss={{ face: { brows: "raised", lids: 0, mouth: "smirk", eyes: 1 } }} /> },
  { at: E(STILL), draw: (t) => <BossReads t={t} /> },
  { at: S(TOMORROW), draw: (t) => <CoinRound t={t} /> },
  { at: S(TOMORROW, 100), draw: (t) => <CustomerIn t={t} /> },
  { at: E(TOMORROW), draw: (t) => <CardAtTill t={t} /> },
  { at: E(TOMORROW, 30), draw: (t) => <CardAndPhone t={t} /> },
  { at: S(VISA), draw: (t) => <CrossWithCard t={t} /> },
  { at: S(VISA, 122), draw: (t) => <AgentSheet t={t} /> },
  { at: E(VISA), draw: (t) => <MarcoLooks t={t} /> },
  { at: E(VISA, 20), draw: (t) => <YouLook t={t} /> },
  { at: E(VISA, 40), draw: (t) => <BossTurns t={t} /> },
  { at: S(LAST), draw: (t) => <CustomerCross t={t} gate /> },
  { at: E(LAST), draw: (t) => <CustomerCross t={t} gate close /> },
];

/** Pigou's paper with its card (two lines). */
function PigouWithCard({ t }: { t: Parameters<ShotDef["draw"]>[0] }) {
  return <><PigouSheet t={t} /><Stamp2 lines={["1920, Pigou: tax the things", "that hurt your neighbours"]} f={t.f - 4} len={170} /></>;
}
/** The model's fix, with its card (two lines). */
function FixWithCard({ t }: { t: Parameters<ShotDef["draw"]>[0] }) {
  return <><FixesSheet t={t} stage={1} /><Stamp2 lines={["the model's fix: a tax", "on the machine itself"]} f={t.f - 2} len={100} /></>;
}
/** The steel customer crossing the road with the bag, with the Visa card (two lines). */
function CrossWithCard({ t }: { t: Parameters<ShotDef["draw"]>[0] }) {
  return <><CustomerCross t={t} /><Stamp2 lines={["2025, Visa: agents completed", "real purchases in pilot trials"]} f={t.f - 4} len={116} /></>;
}
/** The town writes its number on your napkin, over each other's crossings-out (top-down on the counter). */
function TownNumber({ t }: { t: Parameters<ShotDef["draw"]>[0] }) {
  return <PhoneAndNapkin t={t} value={DIAL_NAPKIN} push={0.03} napkin={<TownNapkin x={600} y={560} s={1.4} n={mix(0, 6.4, ramp(t.f, 2, 146))} />} />;
}


export const TAGS_C: TagDef[] = [
  { at: S(ALASKA, 6), text: "since 1982, Alaska's yearly cheque", kind: "label", frames: 124 },
  { at: S(QUARTET, 112), text: "a string quartet", kind: "label", frames: 120 },
  { at: S(TRIED, 4), text: "1811 to 1816, the Luddites", kind: "label", frames: 150 },
  { at: S(P3), text: "PROBLEM THREE", kind: "label", frames: 100 },
];

export const BUBBLES_C: BubbleDef[] = [];
