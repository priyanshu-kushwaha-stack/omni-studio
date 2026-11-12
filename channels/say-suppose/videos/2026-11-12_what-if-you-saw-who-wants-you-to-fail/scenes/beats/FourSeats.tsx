// Beat "Four in a Hundred" (script.md v2.1; narration lines 44-53): the classroom over two weeks, a montage that turns
// at every use. One component per shot, picked by frame; every frame comes from the narration clips
// (FourSeats.Times.tsx). Roles, not names: nothing named on screen.
//
//   44     your maths teacher draws the curve; paper: the top four per cent (Class, Paper)
//   45     paper: a hundred small heads, four places teal, yours fourth and his fifth (Paper)
//   46-47  your face, set; you stand and say the mock score, cards over every head (him -84); you turn your back on a
//          red one; a hand out for your notes, you shake your head; the next score, him -88 (Class)
//   48     the store at night, and the performed moment with the chocolate bar; his card still on -88 (Store)
//   49-52  paper: yours goes first; the room redder (him -91); the closer, the sharper; him close, still -91
//   53     the rank list with you first; the desk beside you empty (Class)
// The card over him is one reading at a time: -84 folds when the scene cuts away, -88 opens later, -91 later still.
import { AbsoluteFill } from "remotion";
import { MeterSound } from "../parts";
import { current, type Beat, type Shot } from "../shared";
import { moodAt } from "./WhosCrimson.Common";
import { AwayShot, CurveShot, DownShot, NotesShot, RedShot, roomTags, SecondShot, StandShot, TopShot, WeaponShot } from "./FourSeats.Class";
import { CutsSheet, HundredSheet, PercentSheet } from "./FourSeats.Paper";
import { StoreNight } from "./FourSeats.Store";
import { seatsTimes } from "./FourSeats.Times";

type Cut = "curve" | "pct" | "hundred" | "weapon" | "stand" | "away" | "notes" | "second" | "store" | "climb" | "red" | "cuts" | "down" | "top";

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

const FourInAHundred: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = seatsTimes(clips, shot.to);
  const mood = moodAt(shot);
  const cut = current<Cut>(frame, [[0, "curve"], [k.pct, "pct"], [k.hundred, "hundred"], [k.weapon, "weapon"], [k.stand, "stand"], [k.away, "away"],
    [k.notes, "notes"], [k.second - 4, "second"], [k.store, "store"], [k.climb, "climb"], [k.red, "red"], [k.cuts, "cuts"], [k.down, "down"], [k.top, "top"]]);
  const props = { frame, k, mood };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {cut === "curve" && <CurveShot {...props} />}
      {cut === "pct" && <PercentSheet {...props} />}
      {cut === "hundred" && <HundredSheet {...props} />}
      {cut === "weapon" && <WeaponShot {...props} />}
      {cut === "stand" && <StandShot {...props} />}
      {cut === "away" && <AwayShot {...props} />}
      {cut === "notes" && <NotesShot {...props} />}
      {cut === "second" && <SecondShot {...props} />}
      {cut === "store" && <StoreNight frame={frame} k={k} />}
      {cut === "climb" && <HundredSheet {...props} climbing />}
      {cut === "red" && <RedShot {...props} />}
      {cut === "cuts" && <CutsSheet {...props} />}
      {cut === "down" && <DownShot {...props} />}
      {cut === "top" && <TopShot {...props} />}
      {/* the cards' sounds, outside the Stage so a cut never clips a click */}
      <RoundSound at={k.roomTag} />
      <MeterSound at={k.second} />
      <RoundSound at={k.redTag} />
    </AbsoluteFill>
  );
};

export const fourSeats: Beat = { id: "FourSeats", firstLine: 44, Component: FourInAHundred };
