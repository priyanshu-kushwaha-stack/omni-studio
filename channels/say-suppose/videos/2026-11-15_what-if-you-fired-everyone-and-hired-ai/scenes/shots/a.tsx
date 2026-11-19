// Part A of the shot list, script v2: Who Eats? (the key shot, the flip back six weeks), The App (the phone call with
// Marco, the first machine walking in on the chime), The Rule (the whistle, the three rule lines on paper, the dial
// turned to cheap, "So what does it eat?"), Fired ("That's my grill.", the flip-off, the new hires, the firing, your
// first napkin, the rush, "Don't show him.") and The Plant (the paint shop, fifty machines, the pillow, three shifts,
// the boss's napkin, Marco at the gate twice). From frame 0 to part B's first anchor ("Banker: ATMs didn't kill
// tellers"). In-line cuts (the `plus` frames) are timed to the take's word timings (assets/narration/*.words.json)
// and land on the words they name.
import { STAND } from "@whatif/kit/rig/pose";
import { BOSS, YOU } from "../parts/Cast";
import { KeyShot } from "../parts/KeyShot";
import { DinerShot, on, PaintShopShot } from "../parts/Places";
import { CallerPhone, later, PageFlip, PhoneInsert } from "../parts/a/Bits";
import {
  BossAsks, Cheap, Dishwasher, EmptyHook, FirstFlip, FlipOff, GrillTalk, LunchFills, MarcoBurstsIn, MarcoPleads, MarcoRants,
  MarcoRuns, MorningCount, OnYourHat, Pays, PieOffer, PlantView, RobotAtDoor, Rush, ShowPhone, Shrug, SteelWaitress, Smug, Trio,
  Walkout, WaitressCalls, WhatsItEat,
} from "../parts/a/Diner";
import { GateBg, GateHire, GateWalkOff, GateWeekLater } from "../parts/a/Gate";
import { FewerPainters, FiftyWalkIn, HandOver, PaintWave, ThreeShifts, WalkIn, WatchCheck } from "../parts/a/Plant";
import { NapkinTable, Pillow, RuleBoard } from "../parts/a/Sheets";
import { ease, mix, ramp, type ShotTime } from "../parts/util";
import { E, S, type BubbleDef, type ShotDef, type TagDef } from "../shotTypes";

const L0 = "What if you fired everyone";
/** Line 0's "...and its last customer", frames into the line (its word timing). */
const LAST_CUSTOMER = 162;
const L1 = "Waitress: Marco's sick.";
const L2 = "Marco: It isn't me.";
const L3 = "Waitress: It's the fourth Monday";
const L4 = "Marco: Tell them Tuesday.";
const L5 = "Waitress: Marco? A cook";
const L6 = "Marco: Is he on the payroll?";
const L7 = "He isn't.";
const L9 = "Every lunch, the same count.";
const L10 = "The rule is three lines.";
const L11 = "Waitress: So what does it eat?";
const L12 = "Nothing. It never eats";
const L13 = "And Marco's cough clears up";
const L15 = "Waitress: It was your grill";
const L16 = "Marco: We'll see.";
const L17 = "Waitress: Marco. It's on your hat.";
const L18 = "Marco: It can't even taste it!";
const L19 = "You fire all three";
const L20 = "Then the whistle blows";
const L21 = "Plant boss: Where'd you get";
const L22 = "Marco: Don't show him.";
const L24 = "The boss rents fifty";
const L25 = "Plant boss: They don't stop for lunch?";
const L26 = "They don't stop for anything.";
const L27 = "Marco: You hiring?";
const L28 = "Plant boss: Night shift.";
const L30 = "Plant boss: I typed WATCHER.";
const L31 = "And by now the whole town";

/** Any job in town, typed one after another. */
const JOBS = ["COOK", "WAITRESS", "PAINTER", "BANKER", "PLUMBER", "TEACHER"];

/** The morning diner dimmed under the rule paper, the steel cook flipping behind you. */
const ruleBg = (t: ShotTime) => (
  <DinerShot t={t} mood="morning" dim={0.45} push={[1.02, 1.05]}
    cast={[on("till", YOU, "happy", { behind: true, phone: true, pose: { ...STAND, armF: [70, 60] } })]}
    steel={[{ spot: "grill", behind: true, held: "spatula", flip: t.f / 30, flipHeight: 180, toolAngle: -18 }]} />
);

/** The paint shop dimmed under an insert. */
const shopBg = (t: ShotTime, mood: "day" | "dusk" | "night" = "day", painters: "human" | "robot" = "robot") => (
  <PaintShopShot t={t} mood={mood} painters={painters} dim={0.45} push={[1.02, 1.05]} speed={2} />
);

/** The phone's ping badge after each ping frame. */
const pingAt = (f: number, pings: number[]) => {
  const last = pings.filter((p) => p <= f).pop();
  return last === undefined ? 0 : Math.max(0, 1 - (f - last) / 18) * ramp(f, last, last + 3);
};

export const SHOTS_A: ShotDef[] = [
  // ---- Who Eats? (night): the thumbnail's frame at frame 0; the clang and the first burger landing inside 0.5 s.
  { at: S(L0, -102), draw: (t) => <KeyShot t={t} push={0.03} face={t.f < 56 ? "thumb" : "sceptical"} /> },
  { at: S(L0), draw: (t) => <KeyShot t={later(t, 102)} push={[1.03, 1.08]} pushAt={{ x: 1000, y: 700 }} face="thumb" /> },
  // "...and its last customer": the grin goes.
  { at: S(L0, LAST_CUSTOMER), draw: (t) => <KeyShot t={later(t, 102 + LAST_CUSTOMER)} push={[1.08, 1.14]} pushAt={{ x: 520, y: 520 }} face="worried" /> },
  // The page turns back to the grey Monday morning: six weeks earlier. You count empty stools; the phone held out.
  {
    at: E(L0),
    draw: (t) => <PageFlip f={t.f} dur={16} from={<KeyShot t={later(t, 400)} push={0} face="worried" />} to={<MorningCount t={t} you="neutral" waitress="sceptical" />} />,
  },
  // ---- The App (morning): the call, cutting to whoever speaks.
  { at: S(L1), draw: (t) => <MorningCount t={t} cam="counter" you="worried" waitress="sceptical" look={{ x: 0.9, y: 0 }} /> },
  { at: S(L2), draw: (t) => <CallerPhone t={t} face="sad" coughs={[2, 52]} /> },
  {
    at: S(L3),
    draw: (t) => <MorningCount t={t} cam="counter" you={t.f < 45 ? "sceptical" : "worried"} waitress="determined" look={t.f < 45 ? { x: 0.9, y: 0 } : { x: 0.8, y: 0.7 }} />,
  },
  { at: S(L4), draw: (t) => <CallerPhone t={t} face="happy" coughs={[24]} /> },
  // You look at the stools, the gate, the clock; your pocket buzzes; the tile; C, O, O, K; the chime; the first flip.
  {
    at: E(L4),
    draw: (t) => <MorningCount t={t} cam="counter" you="worried" waitress="sceptical" look={t.f < 8 ? { x: 0.8, y: 0.7 } : t.f < 15 ? { x: 0.2, y: -0.9 } : { x: 0.9, y: -0.7 }} buzz={12} />,
  },
  {
    at: E(L4, 22),
    draw: (t) => <PhoneInsert t={t} phone={t.f < 6 ? { mode: "home", ping: ramp(t.f, 0, 3) } : { mode: "app", job: "COOK", typed: (t.f - 6) / 3, value: 0.5 }} />,
  },
  { at: E(L4, 46), draw: (t) => <RobotAtDoor t={t} /> },
  { at: E(L4, 64), draw: (t) => <FirstFlip t={t} askAt={1e6} /> },
  // "A cook just walked in. A steel one." She is back on the phone, eyes on the cook; Marco hears "better at it".
  { at: S(L5, 30), draw: (t) => <WaitressCalls t={t} smirk={118} /> },
  { at: S(L5, 146), draw: (t) => <CallerPhone t={t} face={t.f < 45 ? "worried" : "sceptical"} talk={t.f >= 45} /> },
  { at: S(L7), draw: (t) => <Trio t={t} you="happy" waitress="sceptical" /> },
  {
    at: S(L7, 66),
    draw: (t) => {
      const i = Math.min(JOBS.length - 1, Math.floor(t.f / 22));
      return <PhoneInsert t={t} phone={{ mode: "app", job: JOBS[i], typed: (t.f - i * 22) / 2, value: 0.02, readout: t.f > 30 ? "NO WAGE" : undefined }} />;
    },
  },
  // ---- The Rule (morning). Under the title card: the whistle, the gate, the overalls crossing.
  {
    at: E(L7),
    draw: (t) => <DinerShot t={t} mood="morning" cam="window" crowd={ramp(t.f, 40, 90)} gate={ramp(t.f, 20, 50)} push={[1, 1.06]} options={{ whistle: ramp(t.f, 0, 10) }} />,
  },
  { at: S(L9, 112), draw: (t) => <LunchFills t={t} every={7} /> },
  // "You have never once wondered where the overalls get the money": a worker pays over the counter.
  { at: S(L9, 196), draw: (t) => <Pays t={t} /> },
  // The rule on paper, a row per step, on the words.
  { at: S(L10), draw: (t) => <RuleBoard t={t} step={0} bg={ruleBg(t)} fresh /> },
  { at: S(L10, 45), draw: (t) => <RuleBoard t={t} step={1} bg={ruleBg(t)} /> },
  { at: S(L10, 248), draw: (t) => <RuleBoard t={t} step={2} bg={ruleBg(t)} /> },
  { at: S(L10, 352), draw: (t) => <RuleBoard t={t} step={3} bg={ruleBg(t)} value={0.55 + 0.3 * Math.sin(t.f * 0.06)} /> },
  // "Only you can turn it. Remember that.": the dial, close, the push landing on it.
  {
    at: S(L10, 462),
    draw: (t) => <PhoneInsert t={t} phone={{ mode: "app", job: "COOK", value: 0.55 + 0.25 * Math.sin(t.f * 0.08), thumb: true }} push={[1, 1.5]} pushAt={{ x: 960, y: 620 }} />,
  },
  // Your thumb drags the ring all the way down. Click. "Cheap."
  {
    at: E(L10),
    draw: (t) => <PhoneInsert t={t} phone={{ mode: "app", job: "COOK", value: mix(0.62, 0, ease(ramp(t.f, 2, 20))), thumb: true, readout: t.f > 20 ? "CHEAP" : undefined }} push={[1.3, 1.35]} pushAt={{ x: 960, y: 700 }} />,
  },
  { at: E(L10, 30), draw: (t) => <Cheap t={t} /> },
  { at: S(L11), draw: (t) => <WhatsItEat t={t} /> },
  { at: E(L11), draw: (t) => <WhatsItEat t={t} close /> },
  // "Nothing. It never eats, and it never buys a slice of your pie." / "Right now that's the best part of the deal." /
  // "By the sixth Friday...": the key shot's empty stools.
  { at: S(L12), draw: (t) => <PieOffer t={t} /> },
  { at: S(L12, 107), draw: (t) => <Shrug t={t} /> },
  { at: S(L12, 168), draw: (t) => <KeyShot t={later(t, 200)} push={[1.04, 1.1]} pushAt={{ x: 1100, y: 900 }} face="worried" /> },
  // Marco hears "robot": the cough is gone; he runs past the window with his own spatula.
  { at: S(L13), draw: (t) => <CallerPhone t={t} face={t.f < 86 ? "sad" : "shocked"} coughs={[6, 40]} talk={false} jolt={86} /> },
  { at: S(L13, 111), draw: (t) => <MarcoRuns t={t} /> },
  // ---- Fired (day): "That's my grill." / "It was your grill on Mondays." / "We'll see."
  { at: E(L13), draw: (t) => <MarcoBurstsIn t={t} talkAt={11} /> },
  { at: S(L15), draw: (t) => <GrillTalk t={t} speaker="waitress" thumb={48} /> },
  { at: S(L16), draw: (t) => <GrillTalk t={t} speaker="marco" /> },
  { at: E(L16), draw: (t) => <FlipOff t={t} /> },
  { at: S(L17), draw: (t) => <OnYourHat t={t} /> },
  { at: S(L18), draw: (t) => <MarcoRants t={t} hat /> },
  { at: E(L18), draw: (t) => <SteelWaitress t={t} /> },
  { at: E(L18, 44), draw: (t) => <Dishwasher t={t} /> },
  // You fire all three; the dishwasher who left last year; the napkin (the tag is the napkin's own line); simple.
  { at: S(L19), draw: (t) => <Walkout t={t} /> },
  { at: S(L19, 101), draw: (t) => <EmptyHook t={t} /> },
  { at: S(L19, 194), draw: (t) => <NapkinTable t={t} /> },
  { at: S(L19, 300), draw: (t) => <Smug t={t} /> },
  // The rush; on stool four, staring; "Where'd you get the cooks?" / "Don't show him." / you show him.
  { at: S(L20), draw: (t) => <Rush t={t} /> },
  { at: S(L20, 131), draw: (t) => <BossAsks t={t} face="shocked" /> },
  { at: S(L21), draw: (t) => <BossAsks t={t} /> },
  { at: S(L22), draw: (t) => <MarcoPleads t={t} /> },
  { at: E(L22), draw: (t) => <ShowPhone t={t} /> },
  { at: S("You show him."), draw: (t) => <PlantView t={t} /> },
  // ---- The Plant (day)
  { at: S(L24), draw: (t) => <WalkIn t={t} /> },
  { at: S(L24, 36), draw: (t) => <HandOver t={t} /> },
  {
    at: S(L24, 76),
    draw: (t) => <PhoneInsert t={t} bg={shopBg(t, "day", "human")} phone={{ mode: "app", job: "PAINTER 50", typed: 7 + t.f / 4, value: 0.02, readout: t.f > 18 ? "CHEAP" : undefined }} />,
  },
  {
    at: S(L24, 118),
    draw: (t) => <PhoneInsert t={t} bg={shopBg(t, t.f < 12 ? "day" : t.f < 32 ? "dusk" : "night")} phone={{ mode: "home", ping: pingAt(t.f, [12, 32]) }} />,
  },
  { at: S(L24, 164), draw: (t) => <Pillow t={t} pings={[8, 40]} /> },
  { at: E(L24), draw: (t) => <FiftyWalkIn t={t} /> },
  { at: E(L24, 45), draw: (t) => <PaintWave t={t} /> },
  {
    at: S(L25),
    draw: (t) => (
      <PaintShopShot t={t} mood="day" painters="robot" cam={{ x: 900, y: 290, zoom: 2.1 }} speed={3} push={[1, 1.05]}
        cast={[on("walk1", BOSS, "shocked", { behind: true, dx: 240, facing: -1, pose: { ...STAND, armF: [100, 20] }, look: { x: -0.4, y: 0.8 } }),
          on("walk2", YOU, "happy", { behind: true, dx: -220, facing: 1, look: { x: 0.8, y: 0 } })]} />
    ),
  },
  { at: E(L25), draw: (t) => <WatchCheck t={t} /> },
  // "They don't stop for anything." / the guess: fifty fewer painters, the boss sure of it / but a cheap shift is a
  // cheap shift: three shifts, five hundred, and his own napkin.
  { at: S(L26), draw: (t) => <PaintWave t={later(t, 40)} cam="line" boss="sad" /> },
  { at: S(L26, 46), draw: (t) => <FewerPainters t={t} /> },
  {
    at: S(L26, 152),
    draw: (t) => <PhoneInsert t={t} bg={shopBg(t)} phone={{ mode: "app", job: "PAINTER 50", value: 0, readout: "CHEAP" }} push={[1.05, 1.3]} pushAt={{ x: 960, y: 760 }} />,
  },
  { at: S(L26, 216), draw: (t) => <ThreeShifts t={t} each={27} /> },
  {
    at: S(L26, 296),
    draw: (t) => <PhoneInsert t={t} bg={shopBg(t, "night")} phone={{ mode: "app", job: "PAINTER 500", typed: 10 + t.f / 6, value: 0.02, readout: "CHEAP" }} />,
  },
  { at: S(L26, 328), draw: (t) => <NapkinTable t={t} his surface="desk" /> },
  // The gate: "You hiring?" / "Night shift." / one week later: "What happened to watching?" / "I typed WATCHER."
  { at: S(L27), draw: (t) => <GateHire t={t} speaker="marco" /> },
  { at: S(L28), draw: (t) => <GateHire t={t} speaker="boss" /> },
  { at: E(L28), draw: (t) => <GateWeekLater t={t} speaker="marco" /> },
  { at: S(L30), draw: (t) => <GateWeekLater t={t} speaker="boss" /> },
  { at: S(L30, 24), draw: (t) => <PhoneInsert t={t} bg={<GateBg t={t} />} phone={{ mode: "app", job: "WATCHER", typed: t.f / 2, value: 0.02, readout: "CHEAP" }} /> },
  { at: S(L31, 20), draw: (t) => <GateWalkOff t={t} /> },
];

export const TAGS_A: TagDef[] = [
  { at: S(L0, -102), text: "ORDER UP", kind: "label", frames: 90 },
  { at: E(L0, 6), text: "SIX WEEKS EARLIER", kind: "label", frames: 54 },
  { at: E(L0, 20), text: "YOUR WAITRESS: asks the question nobody answers", kind: "cast", frames: 108 },
  { at: S(L2, 8), text: "YOUR COOK, MARCO: late every Monday", kind: "cast", frames: 120 },
  { at: E(L4, 24), text: "HIRE. Any job. No wage.", kind: "label", frames: 50 },
  { at: E(L6), text: "ORDER UP", kind: "label", frames: 46 },
  { at: S(L20, 133), text: "THE PLANT BOSS: four hundred people across the road", kind: "cast", frames: 120 },
  { at: E(L28, 2), text: "ONE WEEK LATER", kind: "label", frames: 70 },
];

export const BUBBLES_A: BubbleDef[] = [
  { at: S(L0, -80), text: "Who eats?", x: 660, y: 140, frames: 66 },
  { at: E(L10, 32), text: "Cheap.", x: 980, y: 170, frames: 28 },
];
