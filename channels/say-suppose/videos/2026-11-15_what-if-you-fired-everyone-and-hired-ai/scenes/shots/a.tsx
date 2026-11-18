// Part A of the shot list: Who Eats? (the key shot, the flip back six weeks), The App (the skit with Marco on speaker,
// the first machine walking in on the chime), The Rule (the whistle, the three rule lines on paper, the dial turned to
// cheap, "What's it eat?"), Fired (the flip-off, the new hires, the firing, Flippy, your first napkin, the rush with the
// plant boss) and The Plant (the paint shop, fifty machines, the pillow, Jevons, the boss's napkin). Spoken lines 0-29
// of story.json; part B starts at "Marco: Got hired here!". In-line cuts are timed to the take's word timings
// (assets/narration/*.words.json) and land on the words they name.
import { STAND } from "@whatif/kit/rig/pose";
import { BOSS, YOU } from "../parts/Cast";
import { KeyShot } from "../parts/KeyShot";
import { DinerShot, on, PaintShopShot } from "../parts/Places";
import { later, PageFlip, CallerPhone, PhoneInsert } from "../parts/a/Bits";
import {
  BossAsks, Cheap, Crew, Dishwasher, EmptyHook, FirstFlip, FlipOff, FlippyGrill, LunchFills, MarcoBurstsIn, MarcoRants,
  MarcoRuns, MorningCount, PlantView, RobotAtDoor, Rush, ShowPhone, Shrug, SteelWaitress, Smug, Trio, Walkout, WhatsItEat,
} from "../parts/a/Diner";
import { FiftyWalkIn, HandOver, PaintWave, ThreeShifts, WalkIn, WatchCheck } from "../parts/a/Plant";
import { JevonsSheet, NapkinTable, Pillow, RuleBoard } from "../parts/a/Sheets";
import { ease, mix, ramp, type ShotTime } from "../parts/util";
import { E, S, type BubbleDef, type ShotDef, type TagDef } from "../shotTypes";

const L0 = "What if you fired everyone";
const L2 = "Marco: Fourth Monday";
const L3 = "Waitress: Is it on the payroll?";
const L6 = "Six weeks from now";
const L12 = "And the app has one dial.";
const L13 = "Waitress: What's it eat?";
const L15 = "And Marco's cough clears up";
const L16 = "Marco: Who's this?";
const L18 = "You fire all three";
const L19 = "It's true, by the way.";
const L20 = "Your first napkin.";
const L22 = "Plant boss: Where'd you get";
const L24 = "The boss rents fifty";
const L25 = "Plant boss: They don't stop for lunch?";
const L27 = "In 1865 the economist Jevons";
const L28 = "So the boss runs three shifts";

/** Any job in town, typed one after another. */
const JOBS = ["COOK", "WAITRESS", "PAINTER", "BANKER", "PLUMBER", "TEACHER"];

/** The morning diner dimmed under the rule paper, the steel cook flipping behind you. */
const ruleBg = (t: ShotTime) => (
  <DinerShot t={t} mood="morning" dim={0.45} push={[1.02, 1.05]}
    cast={[on("till", YOU, "happy", { behind: true, phone: true, pose: { ...STAND, armF: [70, 60] } })]}
    options={{ robots: 0 }} steel={[{ spot: "grill", behind: true, held: "spatula", flip: t.f / 30, flipHeight: 180, toolAngle: -18 }]} />
);

/** The paint shop dimmed under an insert or a paper. */
const shopBg = (t: ShotTime, mood: "day" | "dusk" | "night" = "day", painters: "human" | "robot" = "robot") => (
  <PaintShopShot t={t} mood={mood} painters={painters} dim={0.45} push={[1.02, 1.05]} speed={2} />
);

export const SHOTS_A: ShotDef[] = [
  // ---- Who Eats? (night): the thumbnail's frame at frame 0; the clang and the first burger landing inside 0.5 s.
  { at: S(L0, -102), draw: (t) => <KeyShot t={t} push={0.03} face={t.f < 56 ? "thumb" : "sceptical"} /> },
  { at: S(L0), draw: (t) => <KeyShot t={later(t, 102)} push={[1.03, 1.1]} pushAt={{ x: 1000, y: 700 }} face="worried" /> },
  // The page turns back to the grey Monday morning: six weeks earlier. You count empty stools; the phone held out.
  {
    at: E(L0),
    draw: (t) => <PageFlip f={t.f} dur={16} from={<KeyShot t={later(t, 178)} push={0} face="worried" />} to={<MorningCount t={t} you="neutral" waitress="sceptical" />} />,
  },
  // ---- The App (morning)
  { at: S("Waitress: Marco's sick."), draw: (t) => <MorningCount t={t} cam="counter" you="worried" waitress="sceptical" look={{ x: 0.9, y: 0 }} /> },
  { at: S(L2), draw: (t) => <CallerPhone t={t} face={t.f < 60 ? "sad" : "worried"} coughs={[2, 64]} /> },
  {
    at: S(L2, 76),
    draw: (t) => {
      const look = t.f < 20 ? { x: 0.8, y: 0.7 } : t.f < 42 ? { x: 0.2, y: -0.9 } : { x: 0.9, y: -0.7 };
      return <MorningCount t={t} cam="counter" you={t.f < 46 ? "worried" : "sceptical"} waitress="sceptical" look={look} buzz={50} />;
    },
  },
  // Your pocket buzzes: the steel tile you never installed; you type C, O, O, K.
  {
    at: E(L2),
    draw: (t) => <PhoneInsert t={t} phone={t.f < 10 ? { mode: "home", ping: ramp(t.f, 0, 4) } : { mode: "app", job: "COOK", typed: (t.f - 10) / 3, value: 0.5 }} />,
  },
  { at: E(L2, 27), draw: (t) => <RobotAtDoor t={t} /> },
  { at: E(L2, 49), draw: (t) => <FirstFlip t={t} askAt={41} /> },
  { at: S("It is not."), draw: (t) => <Trio t={t} you="happy" waitress="sceptical" /> },
  {
    at: S("So what if you could hire"),
    draw: (t) => {
      const i = Math.min(JOBS.length - 1, Math.floor(t.f / 22));
      return <PhoneInsert t={t} phone={{ mode: "app", job: JOBS[i], typed: (t.f - i * 22) / 2, value: 0.02, readout: t.f > 30 ? "NO WAGE" : undefined }} />;
    },
  },
  // Six weeks from now: the key shot again; at "and its last customer" the grin goes.
  { at: S(L6), draw: (t) => <KeyShot t={later(t, 40)} push={[1, 1.05]} face="thumb" /> },
  { at: S(L6, 106), draw: (t) => <KeyShot t={later(t, 146)} push={[1.05, 1.12]} pushAt={{ x: 520, y: 520 }} face="worried" cash /> },
  // ---- The Rule (morning). Under the title card: the whistle, the gate, the overalls crossing (the card's back face
  // is this shot's frame 120).
  {
    at: E(L6),
    draw: (t) => <DinerShot t={t} mood="morning" cam="window" crowd={ramp(t.f, 40, 90)} gate={ramp(t.f, 20, 50)} push={[1, 1.06]} options={{ whistle: ramp(t.f, 0, 10) }} />,
  },
  { at: S("You have never once wondered"), draw: (t) => <LunchFills t={t} every={7} /> },
  { at: S("The rule. Three lines."), draw: (t) => <RuleBoard t={t} step={0} bg={ruleBg(t)} fresh /> },
  { at: S("Type a job."), draw: (t) => <RuleBoard t={t} step={1} bg={ruleBg(t)} /> },
  { at: S("Hire as many as you like."), draw: (t) => <RuleBoard t={t} step={2} bg={ruleBg(t)} /> },
  { at: S(L12), draw: (t) => <RuleBoard t={t} step={3} bg={ruleBg(t)} value={0.55 + 0.3 * Math.sin(t.f * 0.06)} /> },
  // "Only you can turn it. Remember that.": the dial, close, the push landing on it.
  {
    at: S(L12, 122),
    draw: (t) => <PhoneInsert t={t} phone={{ mode: "app", job: "COOK", value: 0.55 + 0.25 * Math.sin(t.f * 0.08), thumb: true }} push={[1, 1.5]} pushAt={{ x: 960, y: 620 }} />,
  },
  // Your thumb drags the ring all the way down. Click. "Cheap."
  {
    at: E(L12),
    draw: (t) => <PhoneInsert t={t} phone={{ mode: "app", job: "COOK", value: mix(0.62, 0, ease(ramp(t.f, 2, 20))), thumb: true, readout: t.f > 20 ? "CHEAP" : undefined }} push={[1.3, 1.35]} pushAt={{ x: 960, y: 700 }} />,
  },
  { at: E(L12, 30), draw: (t) => <Cheap t={t} /> },
  { at: S(L13), draw: (t) => <WhatsItEat t={t} /> },
  { at: E(L13, 12), draw: (t) => <Shrug t={t} /> },
  { at: S("Nobody answers that."), draw: (t) => <WhatsItEat t={t} close /> },
  // Marco hears "robot": the cough is gone; he runs past the window on his way in.
  { at: S(L15), draw: (t) => <CallerPhone t={t} face={t.f < 78 ? "sad" : "shocked"} coughs={[4, 34]} talk={false} jolt={78} /> },
  { at: S(L15, 104), draw: (t) => <MarcoRuns t={t} /> },
  // ---- Fired (day)
  { at: E(L15), draw: (t) => <MarcoBurstsIn t={t} talkAt={11} /> },
  { at: E(L16), draw: (t) => <FlipOff t={t} /> },
  { at: E(L16, 90), draw: (t) => <SteelWaitress t={t} /> },
  { at: E(L16, 134), draw: (t) => <Dishwasher t={t} /> },
  { at: S("Marco: It can't even taste it!"), draw: (t) => <MarcoRants t={t} /> },
  { at: S(L18), draw: (t) => <Walkout t={t} /> },
  { at: S(L18, 96), draw: (t) => <EmptyHook t={t} /> },
  { at: S(L19), draw: (t) => <FlippyGrill t={t} /> },
  { at: S(L19, 120), draw: (t) => <Crew t={t} /> },
  // Your first napkin: three wages gone, burgers the same (the tag is the napkin's own line).
  { at: S(L20), draw: (t) => <NapkinTable t={t} /> },
  { at: S(L20, 102), draw: (t) => <Smug t={t} /> },
  { at: S("Forty stools fed"), draw: (t) => <Rush t={t} /> },
  { at: S(L22), draw: (t) => <BossAsks t={t} /> },
  { at: E(L22), draw: (t) => <ShowPhone t={t} /> },
  { at: S("And the plant across the road"), draw: (t) => <PlantView t={t} /> },
  // ---- The Plant (day)
  { at: S(L24), draw: (t) => <WalkIn t={t} /> },
  { at: S(L24, 36), draw: (t) => <HandOver t={t} /> },
  {
    at: S(L24, 73),
    draw: (t) => <PhoneInsert t={t} bg={shopBg(t, "day", "human")} phone={{ mode: "app", job: "PAINTER 50", typed: 7 + t.f / 4, value: 0.02, readout: t.f > 18 ? "CHEAP" : undefined }} />,
  },
  {
    at: S(L24, 121),
    draw: (t) => {
      const pings = [16, 40];
      const last = pings.filter((p) => p <= t.f).pop();
      const ping = last === undefined ? 0 : Math.max(0, 1 - (t.f - last) / 18) * ramp(t.f, last, last + 3);
      return <PhoneInsert t={t} bg={shopBg(t, t.f < 16 ? "day" : t.f < 40 ? "dusk" : "night")} phone={{ mode: "home", ping }} />;
    },
  },
  { at: S(L24, 182), draw: (t) => <Pillow t={t} pings={[8, 56]} /> },
  { at: E(L24), draw: (t) => <FiftyWalkIn t={t} /> },
  { at: E(L24, 55), draw: (t) => <PaintWave t={t} /> },
  {
    at: S(L25),
    draw: (t) => (
      <PaintShopShot t={t} mood="day" painters="robot" cam={{ x: 900, y: 290, zoom: 2.1 }} speed={3} push={[1, 1.05]}
        cast={[on("walk1", BOSS, "shocked", { behind: true, dx: 240, facing: -1, pose: { ...STAND, armF: [100, 20] }, look: { x: -0.4, y: 0.8 } }),
          on("walk2", YOU, "happy", { behind: true, dx: -220, facing: 1, look: { x: 0.8, y: 0 } })]} />
    ),
  },
  { at: E(L25), draw: (t) => <WatchCheck t={t} /> },
  { at: S("They don't stop for anything."), draw: (t) => <PaintWave t={later(t, 40)} cam="line" boss="sad" /> },
  { at: S(L27), draw: (t) => <JevonsSheet t={t} bg={shopBg(t)} /> },
  { at: S(L28), draw: (t) => <ThreeShifts t={t} each={28} /> },
  {
    at: S(L28, 82),
    draw: (t) => <PhoneInsert t={t} bg={shopBg(t, "night")} phone={{ mode: "app", job: "PAINTER 500", typed: 10 + t.f / 6, value: 0.02, readout: "CHEAP" }} />,
  },
  // His napkin, in his hand: wages gone, cars the same; your sum beside it, the same line missing from both.
  { at: S("His napkin. Your sum."), draw: (t) => <NapkinTable t={t} his surface="desk" missingAt={54} /> },
];

export const TAGS_A: TagDef[] = [
  { at: S(L0, -102), text: "ORDER UP", kind: "label", frames: 90 },
  { at: E(L0, 6), text: "SIX WEEKS EARLIER", kind: "label", frames: 54 },
  { at: E(L0, 20), text: "YOUR WAITRESS: asks the question nobody answers", kind: "cast", frames: 108 },
  { at: S(L2, 10), text: "YOUR COOK, MARCO: late every Monday", kind: "cast", frames: 120 },
  { at: E(L2, 2), text: "HIRE. Any job. No wage.", kind: "label", frames: 64 },
  { at: E(L3), text: "ORDER UP", kind: "label", frames: 46 },
  { at: S(L19, 40), text: "2018, Pasadena: Flippy's first day", kind: "label", frames: 120 },
  { at: S("Forty stools fed", 16), text: "THE PLANT BOSS: four hundred people across the road", kind: "cast", frames: 120 },
  { at: S(L27, 4), text: "1865, Jevons: cheaper means more", kind: "label", frames: 150 },
];

export const BUBBLES_A: BubbleDef[] = [
  { at: S(L0, -80), text: "Who eats?", x: 660, y: 140, frames: 66 },
  { at: E(L12, 32), text: "Cheap.", x: 980, y: 170, frames: 28 },
];
