// Beat "The Weapon" (script v5, lines 51-61): the classroom over two weeks, a montage that turns at every use. One
// component per shot, picked by frame; every frame comes from the narration clips (FourSeats.Times.tsx).
//
//   51  your maths teacher writes the mock scores up; paper: a hundred small heads, the top four lit, TOP 4% (Class,
//       Paper; THE CURVE card lower right from Captions)
//   52  the same paper: four places teal, yours fourth and his fifth (Paper)
//   53  your face, set; mock papers slap down week after week, TRUE stamped, your hand slides one off: ammunition (Paper)
//   54  you stand and say it, cards over every head, three red, him -84; you read the room (Class)
//   55  her "Sit down." (Class)
//   56  your phone: his name swiped out first ("Him first."), then the classmate; the shared folder; week one's three
//       red; week two: you stand again, nine red, him -86 (Paper, Class)
//   57  people notice: you bragging, eyes on the air over their heads; the group chat renamed WEATHERMAN (Class, Paper)
//   58  the rival points at the ceiling: "Weatherman. Cloudy today?"; a chalk cloud over you; the class snickers (Class)
//   59-61 the counter: "You want half?"; you take the smaller half, on principle; his card -88 (Half)
import { AbsoluteFill } from "remotion";
import { MeterSound } from "../parts";
import { current, type Beat, type Shot } from "../shared";
import { moodAt } from "./WhosCrimson.Common";
import { CurveShot, NoticeShot, roomTags, SitShot, StandShot, TaeShot, WeaponShot, WeeksShot } from "./FourSeats.Class";
import { StoreHalf } from "./FourSeats.Half";
import { AmmoShot, HundredSheet, NicknameShot, PhoneShot } from "./FourSeats.Paper";
import { seatsTimes } from "./FourSeats.Times";

type Cut = "curve" | "hundred" | "weapon" | "ammo" | "stand" | "sit" | "phone" | "weeks" | "notice" | "nick" | "tae" | "store";

/** Every card of a room round: his at full volume, the rest of the room quieter. */
const RoundSound: React.FC<{ at: number }> = ({ at }) => {
  const t = roomTags(at);
  return (
    <>
      <MeterSound at={t.minjun} />
      <MeterSound at={t.classmate} volume={0.5} />
      <MeterSound at={t.kang} volume={0.5} />
      {t.far.map((f, i) => <MeterSound key={i} at={f} volume={0.28} />)}
    </>
  );
};

const TheWeapon: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = seatsTimes(clips, shot.to);
  const mood = moodAt(shot);
  const cut = current<Cut>(frame, [[0, "curve"], [k.pct, "hundred"], [k.weapon, "weapon"], [k.ammo, "ammo"], [k.stand, "stand"], [k.sit, "sit"],
    [k.chat, "phone"], [k.weekOne, "weeks"], [k.notice, "notice"], [k.nickname, "nick"], [k.tae, "tae"], [k.store, "store"]]);
  const props = { frame, k, mood };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {cut === "curve" && <CurveShot {...props} />}
      {cut === "hundred" && <HundredSheet {...props} />}
      {cut === "weapon" && <WeaponShot {...props} />}
      {cut === "ammo" && <AmmoShot {...props} />}
      {cut === "stand" && <StandShot {...props} />}
      {cut === "sit" && <SitShot {...props} />}
      {cut === "phone" && <PhoneShot {...props} />}
      {cut === "weeks" && <WeeksShot {...props} />}
      {cut === "notice" && <NoticeShot {...props} />}
      {cut === "nick" && <NicknameShot {...props} />}
      {cut === "tae" && <TaeShot {...props} />}
      {cut === "store" && <StoreHalf frame={frame} k={k} />}
      {/* the cards' sounds, outside the Stage so a cut never clips a click */}
      <RoundSound at={k.roomTag} />
      <RoundSound at={k.week2Tag} />
      <MeterSound at={k.down} />
    </AbsoluteFill>
  );
};

export const fourSeats: Beat = { id: "FourSeats", firstLine: 51, Component: TheWeapon };
