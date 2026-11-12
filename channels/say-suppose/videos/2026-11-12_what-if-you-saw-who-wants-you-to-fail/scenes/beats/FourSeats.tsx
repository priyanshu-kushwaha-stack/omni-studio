// Beat "Four Seats" (script.md, ## [03:31] Four Seats; narration lines 46-59): the classroom over two weeks, a montage
// that turns at every use. One component per shot, picked by frame; every frame comes from the narration clips
// (FourSeats.Times.tsx).
//
//   46     the classroom: Ms. Kang draws the old curve on the board (Class)
//   47-48  paper: the top four per cent, and ten after you; the class from above, four seats, two heads (Paper)
//   49-50  your face, set; you stand and say the mock score; cards over every head, Min-jun -84 (Class)
//   51     the phone: the group chat, names dropping out (Paper)
//   52     the past-paper folder stops at your desk (Class)
//   53-54  the store at night: "Half?"; you walk past; his hand stays out, then drops (Store)
//   55-57  paper: your climb in three stamps; the room redder, Min-jun -88; the closer, the sharper (Paper, Class)
//   58-59  Min-jun at -91; the rank list with you first, the chair beside you empty (Class)
import { AbsoluteFill } from "remotion";
import { MeterSound } from "../parts";
import { current, type Beat, type Shot } from "../shared";
import { moodAt } from "./WhosCrimson.Common";
import { CurveShot, DownShot, FolderShot, RedShot, roomTags, StandShot, TopShot, WeaponShot } from "./FourSeats.Class";
import { ChatShot, ClimbSheet, CutsSheet, PercentSheet, SeatsSheet } from "./FourSeats.Paper";
import { StoreNight } from "./FourSeats.Store";
import { seatsTimes } from "./FourSeats.Times";

type Cut = "curve" | "pct" | "seats" | "weapon" | "stand" | "chat" | "folder" | "store" | "climb" | "red" | "cuts" | "down" | "top";

/** Every card of a room round: Min-jun's at full volume, the rest of the room quieter. */
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

const FourSeats: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = seatsTimes(clips, shot.to);
  const mood = moodAt(shot);
  const cut = current<Cut>(frame, [[0, "curve"], [k.pct, "pct"], [k.seats, "seats"], [k.weapon, "weapon"], [k.stand, "stand"], [k.chat, "chat"],
    [k.folder, "folder"], [k.store, "store"], [k.climb, "climb"], [k.red, "red"], [k.cuts, "cuts"], [k.down, "down"], [k.top, "top"]]);
  const props = { frame, k, mood };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {cut === "curve" && <CurveShot {...props} />}
      {cut === "pct" && <PercentSheet {...props} />}
      {cut === "seats" && <SeatsSheet {...props} />}
      {cut === "weapon" && <WeaponShot {...props} />}
      {cut === "stand" && <StandShot {...props} />}
      {cut === "chat" && <ChatShot {...props} />}
      {cut === "folder" && <FolderShot {...props} />}
      {cut === "store" && <StoreNight frame={frame} k={k} />}
      {cut === "climb" && <ClimbSheet {...props} />}
      {cut === "red" && <RedShot {...props} />}
      {cut === "cuts" && <CutsSheet {...props} />}
      {cut === "down" && <DownShot {...props} />}
      {cut === "top" && <TopShot {...props} />}
      {/* the cards' sounds, outside the Stage so a cut never clips a click */}
      <RoundSound at={k.roomTag} />
      <RoundSound at={k.redTag} />
      <MeterSound at={k.downTag} />
    </AbsoluteFill>
  );
};

export const fourSeats: Beat = { id: "FourSeats", firstLine: 46, Component: FourSeats };
