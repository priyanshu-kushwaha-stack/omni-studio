// Part B of the first cut, script v2: The Whole Town (day), Rich (dusk, then the sixth Friday at night) and The Missing
// Line (night, one lamp), from "Banker: ATMs didn't kill tellers, you know." to just before "So you type the one job nobody...",
// which is part C's first anchor (Make Them Buy is part C's; its components stay exported from parts/b/night.tsx).
// Every `> SCENE:` and `> HOLD:` is a shot anchored to a spoken line, cut inside long lines on the spoken words (the
// take's word timings); exchanges cut to each speaker; facts set up as surprises show the guess first. Cards and cast
// introductions are tags; bubbles are the script's `> BUBBLE:` lines.
import { KeyShot } from "../parts/KeyShot";
import type { BubbleDef, ShotDef, TagDef } from "../shotTypes";
import { E, S } from "../shotTypes";
import {
  AppByFriday, AtmCash, BankerGlasses, BankTellers, FarmsOverSquare, Hairdresser, KeynesOne, KeynesTwo, KeyToTown, LastWage,
  MayorTypes, Napkins, PlumberFolded, PlumberNo, ReporterCounter, RivalSigns, SashFix, ShelfStacker, SomeoneThought,
  TellersOverDiner, UnderCar, WhereItWent,
} from "../parts/b/town";
import {
  BossFaceDown, CountStools, Crumbs, DarkLot, EmptyTill, Ford, GoingRound, MarcoAtGlass, MarcoHalfWave, ModelPaper, NapkinFirst,
  NapkinRead, NapkinWrite, OldGrill, Owners, SameNapkin, ShiftsRollBack, SilentPhone, StopFirstCard,
} from "../parts/b/night";
import {
  BankEmpty, BankerAndBoss, BossScoffs, CoinsAcross, CrowdDream, ExplainSlices, ExplainSum, MayorAndRival, Midnight, NextTown, OutOfWork, OwnersTalk,
  SixthFriday,
} from "../parts/b/v2";

// The Whole Town
const BANKER = "Banker: ATMs didn't kill tellers";
const BOSS_ASKS = "Plant boss: Then what are you doing here?";
const RENTING = "Banker: Renting twelve.";
const TELLERS = "Most people would guess";
const HIPS = "His twelve ask about mothers' hips.";
const MAYOR = "Mayor: New jobs always come.";
const NAME_ONE = "Rival: Name one.";
const FARMING = "Mayor: Farming.";
const FARMS = "She's right too.";
const EIGHT = "Rival: Eight cooks, please.";
const RENT = "Your competition pays you rent.";
const PLUMBER = "Plumber: I'm not typing my own job in.";
const WONT = "He won't, the hairdresser won't";
const MILLIONAIRE = "Reporter: The town's first machine millionaire!";
const SIX = "And six Fridays in";
// Rich
const KEY = "The mayor hands you a key";
const DREAM = "Reporter: Isn't this the dream?";
const ALLOWED = "Marco: Nobody has to.";
const KEYNES = "Someone did dream it.";
const SIXTH = "Then the sixth Friday.";
const FORTY = "Forty stools, nobody on them.";
// The Missing Line
const MISSED = "Here's the line you missed.";
const OWNERS_SUM = "Then every owner in town did the same sum";
const ROUND = "Money out was never out.";
const COOK = "You didn't fire a cook.";
const ECON = "Two economists only wrote";
const FORD = "You'd think a boss who doubled";
const ALL_STOP = "Rival: So we all stop.";
const STOP_FIRST = "Plant boss: You stop first.";
const NO = "Rival: And pay a cook";
const NOBODY = "Banker: Then nobody stops.";
const EVERYONE = "Everyone in town has done the sum.";
const KNOWING = "In the model, knowing is not enough";
const PINGS = "The pings stop.";

export const SHOTS_B: ShotDef[] = [
  // The Whole Town (day): the banker and the boss at lunch; the boss sure, the tellers' card, the cash machine, the
  // glasses, the bank's twelve.
  { at: S(BANKER), draw: (t) => <BankerAndBoss t={t} speaker="banker" /> },
  { at: S(BOSS_ASKS), draw: (t) => <BankerAndBoss t={t} speaker="boss" /> },
  { at: S(RENTING), draw: (t) => <BankerAndBoss t={t} speaker="banker" smug /> },
  { at: S(TELLERS), draw: (t) => <BankEmpty t={t} /> },
  { at: S(TELLERS, 62), draw: (t) => <BankerAndBoss t={t} speaker="boss" guess /> },
  { at: S(TELLERS, 112), draw: (t) => <BankerAndBoss t={t} speaker="banker" smug /> },
  { at: S(TELLERS, 140), draw: (t) => <TellersOverDiner t={t} /> },
  { at: S(TELLERS, 380), draw: (t) => <AtmCash t={t} /> },
  { at: E(TELLERS), draw: (t) => <BankerGlasses t={t} /> },
  { at: S(HIPS), draw: (t) => <BankTellers t={t} /> },
  // The mayor and the rival; the farms; MAYOR'S ASSISTANT and the sash; the rival takes the phone.
  { at: S(MAYOR), draw: (t) => <MayorAndRival t={t} speaker="mayor" /> },
  { at: S(NAME_ONE), draw: (t) => <MayorAndRival t={t} speaker="rival" /> },
  { at: S(FARMING), draw: (t) => <MayorAndRival t={t} speaker="mayor" answer /> },
  { at: S(FARMS), draw: (t) => <MayorAndRival t={t} speaker="mayor" answer /> },
  { at: S(FARMS, 29), draw: (t) => <FarmsOverSquare t={t} /> },
  { at: S(FARMS, 327), draw: (t) => <MayorTypes t={t} /> },
  { at: E(FARMS), draw: (t) => <SashFix t={t} /> },
  { at: S(EIGHT), draw: (t) => <MayorAndRival t={t} speaker="rival" phone /> },
  // The montage (the rival signs for eight cooks, the shelf-stacker, the mechanic); every owner's napkin.
  { at: S(RENT), draw: (t) => <RivalSigns t={t} /> },
  { at: S(RENT, 46), draw: (t) => <ShelfStacker t={t} /> },
  { at: S(RENT, 67), draw: (t) => <UnderCar t={t} /> },
  { at: S(RENT, 87), draw: (t) => <Napkins t={t} fanAt={100} /> },
  // The plumber's finger; the hairdresser; everyone else in the app by Friday.
  { at: S(PLUMBER), draw: (t) => <PlumberNo t={t} /> },
  { at: S(WONT), draw: (t) => <PlumberFolded t={t} /> },
  { at: S(WONT, 28), draw: (t) => <Hairdresser t={t} /> },
  { at: S(WONT, 60), draw: (t) => <AppByFriday t={t} /> },
  // The reporter at the split-flap counter (the subscribe tag hangs top left from +30: kept clear); "Cheap."; the
  // stranger at the plant gate, gone when the camera comes back; the last human wage.
  { at: S(MILLIONAIRE), draw: (t) => <ReporterCounter t={t} from={4200} /> },
  { at: E(MILLIONAIRE), draw: (t) => <ReporterCounter t={t} from={7600} pose="posing" stranger /> },
  { at: E(MILLIONAIRE, 32), draw: (t) => <ReporterCounter t={t} from={8800} pose="posing" cam={{ x: 470, y: 560, zoom: 1.6 }} /> },
  { at: S(SIX), draw: (t) => <LastWage t={t} /> },
  // Rich (dusk): the key, the convoy; the reporter and the crowd; Marco answers; Keynes; where the hours and the pay went.
  { at: S(KEY), draw: (t) => <KeyToTown t={t} /> },
  { at: S(KEY, 92), draw: (t) => <KeyToTown t={t} wide /> },
  { at: S(KEY, 180), draw: (t) => <NextTown t={t} /> },
  { at: S(DREAM), draw: (t) => <CrowdDream t={t} /> },
  { at: S(ALLOWED), draw: (t) => <CrowdDream t={t} marco /> },
  { at: S(KEYNES), draw: (t) => <SomeoneThought t={t} /> },
  { at: S(KEYNES, 49), draw: (t) => <KeynesOne t={t} catchAt={250} /> },
  { at: S(KEYNES, 361), draw: (t) => <KeynesTwo t={t} /> },
  { at: S(KEYNES, 484), draw: (t) => <WhereItWent t={t} turn={90} toYou={140} /> },
  // The sixth Friday (night): the whistle, the gate, nobody; the thumbnail's frame; forty stools counted; the coins
  // that crossed your counter; the overalls out of work; problem one, the napkin.
  { at: S(SIXTH), draw: (t) => <SixthFriday t={t} /> },
  { at: E(SIXTH), draw: (t) => <KeyShot t={t} sync phone push={[1.3, 1]} pushAt={{ x: 1250, y: 260 }} /> },
  { at: S(FORTY), draw: (t) => <CountStools t={t} /> },
  { at: S(FORTY, 72), draw: (t) => <CoinsAcross t={t} /> },
  { at: S(FORTY, 184), draw: (t) => <OutOfWork t={t} /> },
  { at: S(FORTY, 280), draw: (t) => <NapkinRead t={t} look="napkin" /> },
  // The Missing Line (night, one lamp): the cooks, Marco's half wave, the third line; the worked sum, step by step.
  { at: E(FORTY), draw: (t) => <NapkinRead t={t} look="cooks" /> },
  { at: E(FORTY, 40), draw: (t) => <MarcoHalfWave t={t} /> },
  { at: E(FORTY, 85), draw: (t) => <NapkinWrite t={t} /> },
  { at: S(MISSED), draw: (t) => <ExplainSum t={t} /> },
  { at: S(MISSED, 332), draw: (t) => <ExplainSum t={t} from={332} zoom={[1, 1.12]} /> },
  { at: S(OWNERS_SUM), draw: (t) => <ExplainSlices t={t} /> },
  { at: S(ROUND), draw: (t) => <GoingRound t={t} /> },
  { at: S(COOK), draw: (t) => <MarcoAtGlass t={t} /> },
  { at: S(COOK, 55), draw: (t) => <OldGrill t={t} /> },
  // The paper; Ford (the guess, then the fact).
  { at: S(ECON), draw: (t) => <ModelPaper t={t} /> },
  { at: S(ECON, 214), draw: (t) => <Crumbs t={t} /> },
  { at: S(ECON, 400), draw: (t) => <NapkinFirst t={t} /> },
  { at: S(FORD), draw: (t) => <BossScoffs t={t} /> },
  { at: S(FORD, 105), draw: (t) => <Ford t={t} /> },
  // The owners' meeting: the card trick of napkins; "So we all stop." / "You stop first." / "No." / "Then nobody stops.".
  { at: E(FORD), draw: (t) => <Owners t={t} napkins="raise" /> },
  { at: S(ALL_STOP), draw: (t) => <OwnersTalk t={t} speaker="rival" /> },
  { at: S(STOP_FIRST), draw: (t) => <OwnersTalk t={t} speaker="boss" /> },
  { at: S(NO), draw: (t) => <OwnersTalk t={t} speaker="rivalNo" /> },
  { at: S(NOBODY), draw: (t) => <OwnersTalk t={t} speaker="banker" /> },
  { at: S(EVERYONE), draw: (t) => <Owners t={t} napkins="up" /> },
  { at: S(EVERYONE, 59), draw: (t) => <Napkins t={t} lines={3} /> },
  { at: S(KNOWING), draw: (t) => <Owners t={t} phones /> },
  { at: S(KNOWING, 59), draw: (t) => <StopFirstCard t={t} /> },
  { at: S(KNOWING, 156), draw: (t) => <SameNapkin t={t} /> },
  // The one planned silence; problem two; midnight.
  { at: E(KNOWING), draw: (t) => <SilentPhone t={t} /> },
  { at: E(KNOWING, 45), draw: (t) => <BossFaceDown t={t} /> },
  { at: S(PINGS), draw: (t) => <DarkLot t={t} /> },
  { at: S(PINGS, 89), draw: (t) => <ShiftsRollBack t={t} /> },
  { at: S(PINGS, 169), draw: (t) => <EmptyTill t={t} /> },
  { at: S(PINGS, 338), draw: (t) => <Midnight t={t} /> },
];

export const TAGS_B: TagDef[] = [
  { at: S(BANKER), text: "THE BANKER: has read one history book.", kind: "cast", frames: 140 },
  { at: S(MAYOR), text: "THE MAYOR: says what mayors say.", kind: "cast", frames: 68 },
  { at: S(NAME_ONE), text: "THE RIVAL: runs the other diner.", kind: "cast", frames: 110 },
  { at: S(PLUMBER), text: "THE PLUMBER: fixes his own pipes.", kind: "cast", frames: 85 },
  { at: S(MILLIONAIRE), text: "THE REPORTER: always live.", kind: "cast", frames: 93 },
  { at: S(KEYNES, 49), text: "1930, Keynes: technological unemployment", kind: "label", frames: 150 },
  { at: E(SIXTH), text: "ORDER UP", kind: "label" },
  { at: S(FORTY, 280), text: "PROBLEM ONE", kind: "label", frames: 100 },
  { at: E(FORTY, 120), text: "...and he ate here.", kind: "label", frames: 80 },
  { at: S(MISSED, 330), text: "400 a week. 40 here. 360 everywhere else.", kind: "label", frames: 130 },
  { at: S(ECON, 10), text: "2026, two economists: The AI Layoff Trap", kind: "label", frames: 160 },
  { at: S(ECON, 405), text: "One model. Not yet checked.", kind: "label", frames: 110 },
  { at: S(FORD, 109), text: "1914: Ford's five-dollar day", kind: "label", frames: 150 },
  { at: S(KNOWING, 21), text: "Knowing this is not enough", kind: "label", frames: 120 },
  { at: S(PINGS, 300), text: "PROBLEM TWO", kind: "label", frames: 100 },
];

export const BUBBLES_B: BubbleDef[] = [
  { at: E(MILLIONAIRE), text: "Cheap.", x: 1480, y: 470, frames: 55 },
  { at: E(SIXTH, 66), text: "Who eats?", x: 690, y: 180, frames: 70 },
];
