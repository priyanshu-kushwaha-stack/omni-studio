// Beat "The Weapon" (script v7, lines 51-61; outside review of v6, sheets 20-23 and top-15 #6: performed classroom
// action, not slides). One component per shot, picked by frame; every frame comes from the narration clips
// (FourSeats.Times.tsx).
//
//   51  the national exam: a country-wide field of exam desks, the camera pulling back; the top band lights teal;
//       TOP 4% = TOP GRADE, one big card (Nation)
//   52  "So you picture your class": a hundred heads built fast, four places, you fourth, him fifth (Paper); then the two
//       real desks side by side, 4 and 5 on paper tents (Class)
//   53  your face, set; "A mock score": your hand slaps WEEK 1 down, TRUE once; WEEK 2, WEEK 3; "Fresh ammunition"
//       (Class, Paper)
//   54  you stand and say it, the paper beside your head; his card first (-84), your eyes on it; two rows back the rival
//       (-6) notices where you looked; the room, three red (Class)
//   55  her "Sit down." (Class)
//   56  your phone: MIN-JUN -84% into the REMOVED bin ("Him first."), the folders lock, WEEK 1: 3, WEEK 2: 9 (Phone)
//   57  week two in the room: his card first again, everyone follows your eyes up, a knowing look (Class); the
//       contact renamed WEATHERMAN (Phone)
//   58  the rival points at the ceiling: "Weatherman. Cloudy today?"; the cloud on "Cloudy" (Class)
//   59-61 the counter: "You want half?"; you measure the halves and take the smaller, on principle; his card -84 and
//       ticking down to -88 (Half)
import { AbsoluteFill } from "remotion";
import { MeterSound } from "../parts";
import { current, type Beat, type Shot } from "../shared";
import { moodAt } from "./WhosCrimson.Common";
import { DesksShot, NoticeShot, roomTags, SitShot, StandShot, TaeShot, WeaponShot } from "./FourSeats.Class";
import { StoreHalf } from "./FourSeats.Half";
import { NationShot } from "./FourSeats.Nation";
import { AmmoShot, HundredSheet } from "./FourSeats.Paper";
import { NicknameShot, PhoneShot } from "./FourSeats.Phone";
import { seatsTimes } from "./FourSeats.Times";

type Cut = "nation" | "hundred" | "desks" | "weapon" | "ammo" | "stand" | "sit" | "phone" | "notice" | "nick" | "tae" | "store";

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
  const cut = current<Cut>(frame, [[0, "nation"], [k.hundred, "hundred"], [k.desks, "desks"], [k.weapon, "weapon"], [k.ammo, "ammo"], [k.stand, "stand"],
    [k.sit, "sit"], [k.chat, "phone"], [k.notice, "notice"], [k.nickname, "nick"], [k.tae, "tae"], [k.store, "store"]]);
  const props = { frame, k, mood };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {cut === "nation" && <NationShot {...props} />}
      {cut === "hundred" && <HundredSheet {...props} />}
      {cut === "desks" && <DesksShot {...props} />}
      {cut === "weapon" && <WeaponShot {...props} />}
      {cut === "ammo" && <AmmoShot {...props} />}
      {cut === "stand" && <StandShot {...props} />}
      {cut === "sit" && <SitShot {...props} />}
      {cut === "phone" && <PhoneShot {...props} />}
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
