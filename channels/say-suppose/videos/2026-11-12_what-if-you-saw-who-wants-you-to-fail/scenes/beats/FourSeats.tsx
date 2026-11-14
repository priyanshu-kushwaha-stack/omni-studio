// Beat "Four in a Hundred" (script.md v3; narration lines 62-79): the classroom over two weeks, a montage that turns at
// every use. One component per shot, picked by frame; every frame comes from the narration clips
// (FourSeats.Times.tsx). Roles, not names; the teacher, the rival, your best friend and the clerk speak their own lines.
//
//   62     your maths teacher writes the mock scores up; paper: a hundred small heads, the top four lit, TOP 4% (Class, Paper)
//   63     the same paper: four places teal, yours fourth and his fifth (Paper)
//   64-65  your face, set; week one: you stand and say it, cards over every head, three red, him -84 (Class)
//   66     her "Sit down." (Class)
//   67     your phone: the group chat, a name swiped out, another; the shared folder, a name removed; a hand out for
//          your notes, you shake your head and turn your back (Paper, Class)
//   68     week one's three red; week two's nine, him -88 (Class)
//   69-70  the rival: "What's with you?"; still -6 (Class)
//   71-72  the store at night and the performed moment: the half held out, walked past; the cat watches you go (Store)
//   73-74  the next night: the door slides open on the dark street; his empty spot; you alone; the clerk's "Just you
//          tonight?" (Store)
//   75-79  you climb: a tally 4 -> 3 -> 2; the room redder, him -91; his desk slides toward yours, his card deeper red; him
//          close; second place, the bench beside you empty; from above, his empty desk and the untouched half (Paper,
//          Class, Desks)
// The card over him is one reading at a time: -84 folds as -88 opens, -88 folds as -91 opens.
import { AbsoluteFill } from "remotion";
import { MeterSound } from "../parts";
import { current, type Beat, type Shot } from "../shared";
import { moodAt } from "./WhosCrimson.Common";
import { CurveShot, DownShot, HelpShot, RedShot, RivalShot, roomTags, SitShot, StandShot, TopShot, WeaponShot, WeeksShot } from "./FourSeats.Class";
import { DesksCloser, desksTags } from "./FourSeats.Desks";
import { HundredSheet, PhoneShot, TallySheet } from "./FourSeats.Paper";
import { NextNight, StoreNight } from "./FourSeats.Store";
import { seatsTimes } from "./FourSeats.Times";

type Cut = "curve" | "hundred" | "weapon" | "stand" | "sit" | "phone" | "help" | "weeks" | "rival" | "store" | "night" | "climb" | "red" | "cuts"
  | "down" | "top";

/** Every card of a room round: his at full volume, the rest of the room quieter. */
const RoundSound: React.FC<{ at: number; rival?: boolean }> = ({ at, rival }) => {
  const t = roomTags(at);
  return (
    <>
      <MeterSound at={t.minjun} />
      <MeterSound at={t.classmate} volume={0.5} />
      <MeterSound at={t.kang} volume={0.5} />
      {rival && <MeterSound at={t.rival} volume={0.4} />}
      {t.far.map((f, i) => <MeterSound key={i} at={f} volume={0.28} />)}
    </>
  );
};

const FourInAHundred: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = seatsTimes(clips, shot.to);
  const mood = moodAt(shot);
  const cut = current<Cut>(frame, [[0, "curve"], [k.pct, "hundred"], [k.weapon, "weapon"], [k.stand, "stand"], [k.sit, "sit"],
    [k.chat, "phone"], [k.notes, "help"], [k.weekOne, "weeks"], [k.rival, "rival"], [k.store, "store"], [k.nextNight, "night"], [k.climb, "climb"],
    [k.red, "red"], [k.cuts, "cuts"], [k.down, "down"], [k.top, "top"]]);
  const props = { frame, k, mood };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {cut === "curve" && <CurveShot {...props} />}
      {cut === "hundred" && <HundredSheet {...props} />}
      {cut === "weapon" && <WeaponShot {...props} />}
      {cut === "stand" && <StandShot {...props} />}
      {cut === "sit" && <SitShot {...props} />}
      {cut === "phone" && <PhoneShot {...props} />}
      {cut === "help" && <HelpShot {...props} />}
      {cut === "weeks" && <WeeksShot {...props} />}
      {cut === "rival" && <RivalShot {...props} />}
      {cut === "store" && <StoreNight frame={frame} k={k} />}
      {cut === "night" && <NextNight frame={frame} k={k} />}
      {cut === "climb" && <TallySheet {...props} />}
      {cut === "red" && <RedShot {...props} />}
      {cut === "cuts" && <DesksCloser {...props} />}
      {cut === "down" && <DownShot {...props} />}
      {cut === "top" && <TopShot {...props} />}
      {/* the cards' sounds, outside the Stage so a cut never clips a click */}
      <RoundSound at={k.roomTag} />
      <RoundSound at={k.week2Tag} rival />
      <RoundSound at={k.redTag} />
      {desksTags(k).map((at, i) => <MeterSound key={at} at={at} volume={0.45 + i * 0.1} />)}
    </AbsoluteFill>
  );
};

export const fourSeats: Beat = { id: "FourSeats", firstLine: 62, Component: FourInAHundred };
