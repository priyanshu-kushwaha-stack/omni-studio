// Part C of the first cut's shot list, re-anchored to script v2: Make Them Buy, The Cheque, Hammers, The Dial, Stool
// Four (story.json lines 65-95, from "So you type the one job nobody in town is doing any more: CUSTOMER." to the end
// card). Every `> SCENE:` and `> HOLD:` of those sections as shots in film order, anchored to the spoken lines
// (shotTypes.ts S/E, offsets on the voiced words); a shot lasts until the next one's anchor. Exchanges cut to each
// speaker on their line; "You'd think..." facts show the guess first, then the paper on the fact's words. Make Them
// Buy reuses part B's shots (parts/b/night.tsx). Cards that fit on one line are label tags; Visa's is stamped in its
// shot on two lines (parts/c/kit.tsx Stamp2, the same look). Scenes: parts/c/.
import { E, S, type BubbleDef, type ShotDef, type TagDef } from "../shotTypes";
import {
  BossHopeful, BreadPennies, CardIsYours, CustomerIn as CustomerInB, CustomerOrders, CustomerPays, PieSits, PriceBoardShot, PriceWage,
  SaleStreet, TypeCustomer,
} from "../parts/b/night";
import { Hairdresser, PlumberNo } from "../parts/b/town";
import { CardAndPhone, CardAtTill, DIAL_LOW, DIAL_NAPKIN, LayDown, MayorThumbs, PhoneAndNapkin, TownNapkin } from "../parts/c/Inserts";
import { act, mix, ramp, Stamp2 } from "../parts/c/kit";
import { AgentSheet, AlaskaSheet, BoardSheet, FixesSheet, LoopSheet, LudditeSheet } from "../parts/c/Papers";
import { Peak } from "../parts/c/Rooms";
import {
  Apprentice, BankBack, BossDoor, BossReads, BossTurns, ChequeTable, CoinRound, CustomerCross, CustomerIn, FileOut,
  FirstLight, GateBack, Hammers, Lunch, March, MarcoEats, MarcoLooks, MarcoSits, MayorAsks, NoMachines, NoPlant, Owners,
  OwnersSum, PastStranger, PlumberCar, Richest, SlideNapkin, SmilingFace, StoolsEmpty, StoolsFill, TillCash, TruckScene, TwoBack,
  TwoCooks, Week, YouLook,
} from "../parts/c/Scenes";
import { DialSum, EmptyStools, FirstToTry, LampPhone, MarcoAsks, MarcoReplies, QueueQuits, RentersWatch, RivalBuyWith, YouSure } from "../parts/c/v2";

const CUSTOMER = "So you type the one job";
const TILL = "The till rings, and your apron";
const SICK = "A machine never calls in sick.";
const PRICES = "Plant boss: Prices will fall.";
const BUY_WITH = "Rival: Buy with what?";
const HALF = "He cuts his cars in half";
const ALASKA = "You'd think a yearly cheque";
const WHOSE = "Mayor: Out of whose rent?";
const MINE = "Rival: Mine.";
const WEEK = "It works for a week.";
const KEEP = "Only the plumber and the hairdresser";
const SMILE = "Nobody can bring themselves";
const SMASH = "Plant boss: Smash our machines";
const IF_NOT = "Marco: And if we don't smash";
const FOR_NOBODY = "Plant boss: Then it makes them here.";
const OWNERS = "Every owner in town was right";
const NEITHER = "You pick neither.";
const EIGHT = "Rival: Mine too?";
const TOO_FAR = "Too far.";
const COSTS = "A machine now costs";
const MAYOR = "Mayor: And who owns";
const ONLY = "Only you can turn it.";
const RIVAL_COOK = "Rival: Cheaper to hire";
const FRIDAY = "Friday noon, the board";
const MODEL = "The two economists' model";
const RICHEST = "You're still the richest";
const STILL = "Plant boss: Still cheaper";
const CUSTOMER_Q = "Marco: Cheaper than a customer?";
const TOMORROW = "Tomorrow, when you pay";
const FANTASY = "You'd think that was the sequel's";
const LAST = "So, would you have turned the dial?";

type T = Parameters<ShotDef["draw"]>[0];

export const SHOTS_C: ShotDef[] = [
  // Make Them Buy (lamp): the one job nobody is doing; CUSTOMER typed; the steel customer, the pie, your card; the boss's
  // hope and the rival's question; the cars cut in half; a price is never zero; you give the money back. Part B's shots.
  { at: S(CUSTOMER), draw: (t) => <EmptyStools t={t} /> },
  { at: S(CUSTOMER, 100), draw: (t) => <TypeCustomer t={t} /> },
  { at: E(CUSTOMER, 10), draw: (t) => <CustomerInB t={t} /> },
  { at: E(CUSTOMER, 45), draw: (t) => <CustomerOrders t={t} /> },
  { at: E(CUSTOMER, 85), draw: (t) => <CustomerPays t={t} /> },
  { at: S(TILL), draw: (t) => <CustomerPays t={t} again /> },
  { at: S(TILL, 96), draw: (t) => <CardIsYours t={t} /> },
  { at: S(TILL, 180), draw: (t) => <PieSits t={t} cam={{ x: 900, y: 660, zoom: 1.4 }} /> },
  { at: S(SICK), draw: (t) => <PieSits t={t} /> },
  { at: S(PRICES), draw: (t) => <BossHopeful t={t} /> },
  { at: S(BUY_WITH), draw: (t) => <RivalBuyWith t={t} /> },
  { at: S(HALF), draw: (t) => <PriceBoardShot t={t} /> },
  { at: S(HALF, 45), draw: (t) => <BreadPennies t={t} /> },
  { at: S(HALF, 75), draw: (t) => <SaleStreet t={t} /> },
  { at: S(HALF, 100), draw: (t) => <PriceWage t={t} /> },
  { at: S(HALF, 190), draw: (t) => <TillCash t={t} /> },
  // The Cheque (day): "a fairy tale" (you doubtful), Alaska on its words, then the cheques; the mayor asks whose rent,
  // the rival answers; the stools fill for a week, then empty; the plumber's car; only the plumber and the hairdresser
  // keep it; the line turns away and the town comes for the machines.
  { at: S(ALASKA), draw: (t) => <ChequeTable t={t} focus="doubt" /> },
  { at: S(ALASKA, 140), draw: (t) => <AlaskaSheet t={t} /> },
  { at: S(ALASKA, 366), draw: (t) => <ChequeTable t={t} /> },
  { at: S(WHOSE), draw: (t) => <ChequeTable t={t} focus="mayor" /> },
  { at: S(MINE), draw: (t) => <ChequeTable t={t} focus="rival" /> },
  { at: E(MINE), draw: (t) => <StoolsFill t={t} /> },
  { at: S(WEEK), draw: (t) => <Week t={t} /> },
  { at: S(WEEK, 38), draw: (t) => <LoopSheet t={t} /> },
  { at: S(WEEK, 205), draw: (t) => <StoolsEmpty t={t} /> },
  { at: E(WEEK), draw: (t) => <PlumberCar t={t} /> },
  { at: S(KEEP), draw: (t) => <Apprentice t={t} close /> },
  { at: S(KEEP, 85), draw: (t) => <PlumberNo t={t} /> },
  { at: S(KEEP, 125), draw: (t) => <Hairdresser t={t} /> },
  { at: S(KEEP, 161), draw: (t) => <QueueQuits t={t} /> },
  { at: S(KEEP, 258), draw: (t) => <March t={t} /> },
  // Hammers (lamp): the hammers over the counter; nobody can hit a smiling face; "nobody had ever tried this" (the
  // painter sure he's first), the Luddites on their words; the stranger passed; the boss and Marco's exchange; Marco
  // eats; every owner right; you pick neither: the napkin, the phone, the ring.
  { at: E(KEEP), draw: (t) => <Hammers t={t} /> },
  { at: S(SMILE), draw: (t) => <SmilingFace t={t} /> },
  { at: S(SMILE, 95), draw: (t) => <FirstToTry t={t} /> },
  { at: S(SMILE, 165), draw: (t) => <LudditeSheet t={t} /> },
  { at: S(SMILE, 345), draw: (t) => <PastStranger t={t} /> },
  { at: S(SMASH), draw: (t) => <BossDoor t={t} /> },
  { at: S(SMASH, 125), draw: (t) => <BossDoor t={t} wide /> },
  { at: S(IF_NOT), draw: (t) => <MarcoAsks t={t} /> },
  { at: S(FOR_NOBODY), draw: (t) => <BossDoor t={t} /> },
  { at: E(FOR_NOBODY), draw: (t) => <MarcoSits t={t} /> },
  { at: S(OWNERS), draw: (t) => <MarcoEats t={t} eat /> },
  { at: S(OWNERS, 62), draw: (t) => <Owners t={t} wide /> },
  { at: E(OWNERS), draw: (t) => <LayDown t={t} /> },
  { at: S(NEITHER), draw: (t) => <LampPhone t={t} /> },
  { at: S(NEITHER, 60), draw: (t) => <PhoneAndNapkin t={t} value={DIAL_LOW} thumb mood="lamp" /> },
  // The Dial (morning): first light; the ring all the way up and everything files out; the rival and the truck; too
  // far; back down to the napkin's line; two cooks back; the napkin's sum (360 to the app, to you, out as the town's
  // cheque); the mayor's thumbs; the town's number; the renters ready to walk; the owners' second sum; the truck
  // reloaded; the bank and the gate; Friday noon; THE PEAK; the model's fix.
  { at: E(NEITHER), draw: (t) => <FirstLight t={t} /> },
  { at: E(NEITHER, 30), draw: (t) => <PhoneAndNapkin t={t} value={mix(DIAL_LOW, 1, act(t.f, 2, 10))} thumb push={0.08} /> },
  { at: E(NEITHER, 46), draw: (t) => <FileOut t={t} /> },
  { at: S(EIGHT), draw: (t) => <TruckScene t={t} load={8} away={act(t.f, 0, t.dur + 20)} rival="chase" /> },
  { at: S(TOO_FAR), draw: (t) => <NoMachines t={t} /> },
  { at: S(TOO_FAR, 90), draw: (t) => <NoPlant t={t} /> },
  { at: E(TOO_FAR), draw: (t) => <PhoneAndNapkin t={t} value={mix(1, DIAL_NAPKIN, act(t.f, 2, 40))} thumb glow={ramp(t.f, 40, 48)} /> },
  { at: E(TOO_FAR, 55), draw: (t) => <TwoBack t={t} /> },
  { at: S(COSTS), draw: (t) => <TwoCooks t={t} /> },
  { at: S(COSTS, 114), draw: (t) => <DialSum t={t} f={t.f + 100} zoom={[1, 1.03]} /> },
  // The take re-voiced with "its rent plus" (2026-11-19): words from "but" on run 14 frames later and the take
  // slows to 50 frames later by "so", so this napkin step maps the new 344-595 onto DialSum's old 330-545.
  { at: S(COSTS, 344), draw: (t) => <DialSum t={t} f={330 + (t.f * 215) / 251} zoom={[1.03, 1.08]} /> },
  { at: S(COSTS, 595), draw: (t) => <TwoCooks t={t} cam={{ x: 1180, y: 600, zoom: 1.6 }} /> },
  { at: S(MAYOR), draw: (t) => <MayorAsks t={t} /> },
  { at: E(MAYOR), draw: (t) => <PhoneAndNapkin t={t} value={DIAL_NAPKIN} push={0.06}><MayorThumbs f={t.f} v={DIAL_NAPKIN} /></PhoneAndNapkin> },
  { at: E(MAYOR, 76), draw: (t) => <SlideNapkin t={t} /> },
  { at: S(ONLY), draw: (t) => <TownNumber t={t} /> },
  { at: S(ONLY, 131), draw: (t) => (
    <PhoneAndNapkin t={t} value={mix(DIAL_NAPKIN - 0.06, DIAL_NAPKIN, act(t.f, 8, 36))} thumb={t.f < 60} napkin={<TownNapkin x={560} y={560} n={6.4} hands={false} />} />
  ) },
  { at: S(ONLY, 225), draw: (t) => <RentersWatch t={t} /> },
  { at: E(ONLY), draw: (t) => <OwnersSum t={t} /> },
  { at: E(ONLY, 44), draw: (t) => <TruckScene t={t} load={mix(2, 8, ramp(t.f, 0, 46))} away={0} rival="count" /> },
  { at: S(RIVAL_COOK), draw: (t) => <TruckScene t={t} load={8} away={0} rival="shrug" cam={{ x: 1450, y: 700, zoom: 1.7 }} /> },
  { at: E(RIVAL_COOK), draw: (t) => <BankBack t={t} /> },
  { at: E(RIVAL_COOK, 54), draw: (t) => <GateBack t={t} /> },
  { at: S(FRIDAY), draw: (t) => <BoardSheet t={t} /> },
  { at: E(FRIDAY), draw: (t) => <Peak t={t} /> },
  { at: S(MODEL), draw: (t) => <PhoneAndNapkin t={t} value={DIAL_NAPKIN} glow={0.5 + 0.5 * Math.sin(t.f * 0.2)} /> },
  { at: S(MODEL, 112), draw: (t) => <FixesSheet t={t} stage={0} one /> },
  { at: S(MODEL, 150), draw: (t) => <FixesSheet t={t} stage={1} /> },
  { at: S(RICHEST), draw: (t) => <Richest t={t} /> },
  { at: S(RICHEST, 64), draw: (t) => <Lunch t={t} push={[1.06, 1]} /> },
  // Stool Four (day): the boss asks, Marco answers from the grill; the napkin in the boss's tie pocket; the money going
  // round; the steel customer back in a cap with a card that isn't yours; your phone does not ping; "the sequel's
  // fantasy" (you sure), Visa on its words; three looks; the last image.
  { at: S(STILL), draw: (t) => <Lunch t={t} cam={{ x: 1000, y: 740, zoom: 1.75 }} boss={{ face: { brows: "raised", lids: 0, mouth: "smirk", eyes: 1 } }} /> },
  { at: S(CUSTOMER_Q), draw: (t) => <MarcoReplies t={t} /> },
  { at: E(CUSTOMER_Q), draw: (t) => <BossReads t={t} /> },
  { at: S(TOMORROW), draw: (t) => <CoinRound t={t} /> },
  { at: S(TOMORROW, 100), draw: (t) => <CustomerIn t={t} /> },
  { at: E(TOMORROW), draw: (t) => <CardAtTill t={t} /> },
  { at: E(TOMORROW, 30), draw: (t) => <CardAndPhone t={t} /> },
  { at: S(FANTASY), draw: (t) => <YouSure t={t} /> },
  { at: S(FANTASY, 60), draw: (t) => <CrossWithCard t={t} /> },
  { at: S(FANTASY, 160), draw: (t) => <AgentSheet t={t} /> },
  { at: E(FANTASY), draw: (t) => <MarcoLooks t={t} /> },
  { at: E(FANTASY, 20), draw: (t) => <YouLook t={t} /> },
  { at: E(FANTASY, 40), draw: (t) => <BossTurns t={t} /> },
  { at: S(LAST), draw: (t) => <CustomerCross t={t} gate /> },
  { at: E(LAST), draw: (t) => <CustomerCross t={t} gate close /> },
];

/** The steel customer crossing the road with the bag, with the Visa card (two lines) on "In 2025". */
function CrossWithCard({ t }: { t: T }) {
  return <><CustomerCross t={t} /><Stamp2 lines={["2025, Visa: agents completed", "hundreds of real transactions in pilots"]} f={t.f - 6} len={96} /></>;
}
/** The town writes its number on your napkin, over each other's crossings-out (top-down on the counter). */
function TownNumber({ t }: { t: T }) {
  return <PhoneAndNapkin t={t} value={DIAL_NAPKIN} push={0.03} napkin={<TownNapkin x={600} y={560} s={1.4} n={mix(0, 6.4, ramp(t.f, 2, 128))} />} />;
}

export const TAGS_C: TagDef[] = [
  { at: S(ALASKA, 144), text: "since 1982, Alaska's yearly cheque", kind: "label", frames: 150 },
  { at: S(SMILE, 170), text: "1811 to 1816, the Luddites", kind: "label", frames: 150 },
  { at: S(COSTS, 117), text: "+360 a week, per machine.", kind: "label", frames: 120 },
  { at: S(MODEL, 152), text: "the model's fix: tax the machine itself", kind: "label", frames: 92 },
];

export const BUBBLES_C: BubbleDef[] = [];

