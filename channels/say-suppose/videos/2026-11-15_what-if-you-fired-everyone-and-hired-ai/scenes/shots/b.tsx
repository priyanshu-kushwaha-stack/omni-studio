// Part B of the first cut: story.json lines 30-70, from "Marco: Got hired here!" (the end of The Plant) through The
// Whole Town (day), Rich (dusk, then the sixth Friday at night), The Missing Line (night, one lamp) and Make Them Buy
// (lamp), to "A price is never zero. A wage can be." and its hold. Part C starts at "So you give the money back.".
// Every `> SCENE:` and `> HOLD:` is a shot anchored to a spoken line; cards and cast introductions are tags.
import { KeyShot } from "../parts/KeyShot";
import type { BubbleDef, ShotDef, TagDef } from "../shotTypes";
import { E, S } from "../shotTypes";
import {
  AppByFriday, AtmCash, BankerArrives, BankerGlasses, BankerTalks, BankTellers, FarmsOverSquare, GateAgain, GateHired, GateWalkOff,
  Hairdresser, KeynesOne, KeynesTwo, KeyToTown, LastWage, MayorSpeaks, MayorTypes, Napkins, PlumberFolded, PlumberNo, RentIn,
  ReporterCounter, ReporterDream, RivalSigns, SashFix, ShelfStacker, SomeoneThought, TellersOverDiner, UnderCar, WhereItWent,
} from "../parts/b/town";
import {
  BossFaceDown, BossHopeful, BreadPennies, CardIsYours, CountStools, Crumbs, CustomerIn, CustomerOrders, CustomerPays, DarkLot,
  EmptyCrossing, EmptyTill, Ford, Ghosts, GoingRound, MarcoAtGlass, MarcoHalfWave, MarcoOutside, ModelPaper, NapkinFirst, NapkinRead,
  NapkinWrite, OldGrill, Owners, PieSits, PriceBoardShot, PriceWage, SaleStreet, SameNapkin, SavedLost, ShiftsRollBack, SilentPhone, StopFirstCard,
  TypeCustomer, UnionHall, YouManager,
} from "../parts/b/night";

const HIRED = "Marco: Got hired here!";
const BANK_IN = "Again. And the bank manager";
const ATMS = "Banker: ATMs didn't kill tellers";
const TELLERS = "He's right. From 1980 to 2010";
const COUNTED = "The machine counted the cash.";
const TWELVE = "He rents twelve.";
const MAYOR = "Mayor: New jobs always come.";
const FARMS = "They did. In 1900";
const TYPE_IN = "Here, you type the new job in.";
const RIVAL = "Rival: Don't tell my customers.";
const RENT = "Your competition pays you rent.";
const NAPKINS = "Every owner in town, the same napkin.";
const PLUMBER = "Plumber: I'm not typing my own job in.";
const WONT = "The plumber won't.";
const MILLIONAIRE = "Reporter: The town's first machine millionaire!";
const SIX = "And six Fridays in";
const KEY = "The key to the town.";
const DREAM = "Reporter: Isn't this the dream?";
const KEYNES = "Someone thought so.";
const MEANT = "He meant the hours shared out";
const FORTY = "Forty stools. Nobody on them.";
const ATE = "Marco ate here.";
const SAVED = "You saved every wage you paid.";
const ECON = "Two economists wrote this sum down";
const ROUND = "Money out was never out.";
const COOK = "You didn't fire a cook.";
const STORY = "An old story, a union leader's own";
const MANAGER = "You're the manager.";
const FORD = "Not a new sum, either.";
const STOP = "Rival: You stop first.";
const EVERYONE = "Everyone in town has done the sum.";
const LOSES = "The one who stops first loses";
const PINGS = "The pings stop.";
const TWO = "Problem two.";
const CUSTOMER = "So you type CUSTOMER.";
const CARD = "Its card is your card.";
const SICK = "A machine never calls in sick.";
const PRICES = "Plant boss: Prices will fall.";
const HALVES = "The plant halves its cars.";
const ZERO = "A price is never zero.";

export const SHOTS_B: ShotDef[] = [
  // End of The Plant (morning): Marco hired at the gate; one week later, let go; the bank manager walks in.
  { at: S(HIRED), draw: (t) => <GateHired t={t} /> },
  { at: E(HIRED), draw: (t) => <GateAgain t={t} /> },
  { at: S(BANK_IN), draw: (t) => <GateWalkOff t={t} /> },
  { at: S(BANK_IN, 28), draw: (t) => <BankerArrives t={t} /> },
  // The Whole Town (day): the banker, the tellers, the cash machine, the bank's twelve.
  { at: S(ATMS), draw: (t) => <BankerTalks t={t} /> },
  { at: S(TELLERS), draw: (t) => <TellersOverDiner t={t} /> },
  { at: S(COUNTED), draw: (t) => <AtmCash t={t} /> },
  { at: E(COUNTED), draw: (t) => <BankerGlasses t={t} /> },
  { at: S(TWELVE), draw: (t) => <BankTellers t={t} /> },
  // The mayor, the farms, MAYOR'S ASSISTANT and the sash.
  { at: S(MAYOR), draw: (t) => <MayorSpeaks t={t} /> },
  { at: S(FARMS), draw: (t) => <FarmsOverSquare t={t} /> },
  { at: S(TYPE_IN), draw: (t) => <MayorTypes t={t} /> },
  { at: E(TYPE_IN), draw: (t) => <SashFix t={t} /> },
  // The rival rents eight cooks; the montage (shelf-stacker, mechanic, rent arriving); every owner's napkin.
  { at: S(RIVAL), draw: (t) => <RivalSigns t={t} /> },
  { at: E(RIVAL), draw: (t) => <ShelfStacker t={t} /> },
  { at: S(RENT, 11), draw: (t) => <UnderCar t={t} /> },
  { at: S(RENT, 33), draw: (t) => <RentIn t={t} /> },
  { at: S(NAPKINS), draw: (t) => <Napkins t={t} /> },
  // The plumber's finger; the hairdresser; everyone else in the app by Friday.
  { at: S(PLUMBER), draw: (t) => <PlumberNo t={t} /> },
  { at: S(WONT), draw: (t) => <PlumberFolded t={t} /> },
  { at: S(WONT, 36), draw: (t) => <Hairdresser t={t} /> },
  { at: S(WONT, 72), draw: (t) => <AppByFriday t={t} /> },
  // The reporter at the split-flap counter (the subscribe tag hangs top left from +30: kept clear); the stranger at
  // the plant gate in the hold, gone when the camera comes back; the last human wage.
  { at: S(MILLIONAIRE), draw: (t) => <ReporterCounter t={t} from={4200} /> },
  { at: E(MILLIONAIRE), draw: (t) => <ReporterCounter t={t} from={6500} pose="posing" stranger /> },
  { at: E(MILLIONAIRE, 32), draw: (t) => <ReporterCounter t={t} from={7700} pose="posing" cam={{ x: 470, y: 560, zoom: 1.6 }} /> },
  { at: S(SIX), draw: (t) => <LastWage t={t} /> },
  // Rich (dusk): the key to the town, the convoy, the reporter, Keynes, where the hours and the pay went.
  { at: S(KEY), draw: (t) => <KeyToTown t={t} /> },
  { at: S(KEY, 70), draw: (t) => <KeyToTown t={t} wide /> },
  { at: S(DREAM), draw: (t) => <ReporterDream t={t} /> },
  { at: S(KEYNES), draw: (t) => <SomeoneThought t={t} /> },
  { at: S(KEYNES, 60), draw: (t) => <KeynesOne t={t} /> },
  { at: S(KEYNES, 300), draw: (t) => <KeynesTwo t={t} /> },
  { at: S(MEANT), draw: (t) => <WhereItWent t={t} turn={66} toYou={118} /> },
  { at: E(MEANT), draw: (t) => <SomeoneThought t={t} pat /> },
  // The sixth Friday (night): the thumbnail's frame, the camera pulling back from the window; forty stools counted.
  { at: E(MEANT, 30), draw: (t) => <KeyShot t={t} sync phone push={[1.3, 1]} pushAt={{ x: 1250, y: 260 }} /> },
  { at: S(FORTY), draw: (t) => <CountStools t={t} /> },
  { at: S(FORTY, 72), draw: (t) => <EmptyCrossing t={t} /> },
  // The Missing Line (night, one lamp): the napkin, Marco's half wave, the third line.
  { at: E(FORTY), draw: (t) => <NapkinRead t={t} look="napkin" /> },
  { at: E(FORTY, 45), draw: (t) => <NapkinRead t={t} look="cooks" /> },
  { at: E(FORTY, 70), draw: (t) => <MarcoHalfWave t={t} /> },
  { at: E(FORTY, 95), draw: (t) => <NapkinWrite t={t} /> },
  { at: S(ATE), draw: (t) => <Ghosts t={t} /> },
  { at: S(SAVED), draw: (t) => <SavedLost t={t} /> },
  { at: S(ECON), draw: (t) => <ModelPaper t={t} /> },
  { at: S(ECON, 170), draw: (t) => <Crumbs t={t} /> },
  { at: S(ECON, 370), draw: (t) => <NapkinFirst t={t} /> },
  { at: S(ROUND), draw: (t) => <GoingRound t={t} /> },
  { at: S(COOK), draw: (t) => <MarcoAtGlass t={t} /> },
  { at: S(COOK, 55), draw: (t) => <OldGrill t={t} /> },
  { at: S(STORY), draw: (t) => <MarcoAtGlass t={t} /> },
  { at: S(STORY, 60), draw: (t) => <UnionHall t={t} part="hall" /> },
  { at: S(STORY, 200), draw: (t) => <UnionHall t={t} part="cars" /> },
  { at: S(MANAGER), draw: (t) => <YouManager t={t} /> },
  { at: S(MANAGER, 45), draw: (t) => <MarcoOutside t={t} /> },
  { at: S(FORD), draw: (t) => <Ford t={t} /> },
  // The owners' meeting: the card trick of napkins, "You stop first", everyone right; the one planned silence.
  { at: E(FORD), draw: (t) => <Owners t={t} napkins="raise" /> },
  { at: S(STOP), draw: (t) => <Owners t={t} point cam="stools" /> },
  { at: S(EVERYONE), draw: (t) => <Owners t={t} napkins="up" /> },
  { at: S(EVERYONE, 72), draw: (t) => <Napkins t={t} lines={3} /> },
  { at: S(LOSES), draw: (t) => <StopFirstCard t={t} /> },
  { at: S(LOSES, 130), draw: (t) => <Owners t={t} phones /> },
  { at: S(LOSES, 250), draw: (t) => <SameNapkin t={t} /> },
  { at: E(LOSES), draw: (t) => <SilentPhone t={t} /> },
  { at: E(LOSES, 45), draw: (t) => <BossFaceDown t={t} /> },
  { at: S(PINGS), draw: (t) => <DarkLot t={t} /> },
  { at: S(PINGS, 80), draw: (t) => <ShiftsRollBack t={t} /> },
  { at: S(TWO), draw: (t) => <EmptyTill t={t} /> },
  // Make Them Buy (lamp): CUSTOMER typed; the steel customer, the pie, your card; prices fall; a wage can be zero.
  { at: S(CUSTOMER), draw: (t) => <TypeCustomer t={t} /> },
  { at: E(CUSTOMER, 10), draw: (t) => <CustomerIn t={t} /> },
  { at: E(CUSTOMER, 45), draw: (t) => <CustomerOrders t={t} /> },
  { at: E(CUSTOMER, 85), draw: (t) => <CustomerPays t={t} /> },
  { at: S(CARD), draw: (t) => <CardIsYours t={t} /> },
  { at: S(CARD, 50), draw: (t) => <CustomerPays t={t} again /> },
  { at: S(SICK), draw: (t) => <PieSits t={t} /> },
  { at: S(PRICES), draw: (t) => <BossHopeful t={t} /> },
  { at: S(HALVES), draw: (t) => <PriceBoardShot t={t} /> },
  { at: S(HALVES, 55), draw: (t) => <BreadPennies t={t} /> },
  { at: S(HALVES, 105), draw: (t) => <SaleStreet t={t} /> },
  { at: S(HALVES, 160), draw: (t) => <PieSits t={t} cam={{ x: 900, y: 660, zoom: 1.4 }} /> },
  { at: S(ZERO), draw: (t) => <PriceWage t={t} /> },
];

export const TAGS_B: TagDef[] = [
  { at: E(HIRED), text: "ONE WEEK LATER", kind: "label", frames: 50 },
  { at: S(BANK_IN, 34), text: "THE BANKER: has read one history book.", kind: "cast" },
  { at: S(MAYOR), text: "THE MAYOR: says what mayors say.", kind: "cast" },
  { at: S(RIVAL), text: "THE RIVAL: runs the other diner.", kind: "cast", frames: 62 },
  { at: S(PLUMBER), text: "THE PLUMBER: fixes his own pipes.", kind: "cast", frames: 85 },
  { at: S(MILLIONAIRE), text: "THE REPORTER: always live.", kind: "cast" },
  { at: S(KEYNES, 60), text: "1930, Keynes: technological unemployment", kind: "label", frames: 150 },
  { at: E(MEANT, 30), text: "ORDER UP", kind: "label" },
  { at: S(FORTY, 72), text: "PROBLEM ONE", kind: "label", frames: 100 },
  { at: E(FORTY, 120), text: "...and he ate here.", kind: "label", frames: 120 },
  { at: S(ECON, 10), text: "Two economists' model: The AI Layoff Trap", kind: "label", frames: 160 },
  { at: S(ECON, 380), text: "One model. Not yet checked.", kind: "label", frames: 110 },
  { at: S(STORY), text: "A story, retold since the 1950s", kind: "label", frames: 150 },
  { at: S(FORD, 20), text: "1914: Ford's five-dollar day", kind: "label", frames: 150 },
  { at: S(LOSES), text: "Knowing this is not enough", kind: "label", frames: 120 },
  { at: S(TWO), text: "PROBLEM TWO", kind: "label", frames: 100 },
];

export const BUBBLES_B: BubbleDef[] = [
  { at: E(MEANT, 96), text: "Who eats?", x: 690, y: 180, frames: 70 },
];
