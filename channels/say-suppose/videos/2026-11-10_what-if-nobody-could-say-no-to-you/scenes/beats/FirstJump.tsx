// Beat "The first jump: a week of small yeses" (script.md, ## [01:10] The first jump; narration lines 13-36). Same
// pattern as Change.tsx: `times()` (FirstJump.Times.tsx) turns the clips into every frame, one component per scene in
// the FirstJump.<Part>.tsx helpers, the beat picks the scene by frame and places the snaps outside the Stage.
//
//   13-14 Monday, the chai stall (Chai): wide; you point one finger at the chutney bowl; insert; he lifts the whole bowl
//         and puts it in your hands; snap. Hold: you holding the bowl, the student looks at it, then at you.
//   15-17 the bus (Bus): you come down the aisle; the auntie's huge bag on the seat; you lean in, "excuse..."; snap, the
//         bag is in her lap, she pats the seat, "Sit, sit, beta."; you sit, close on you.
//   18-19 the auto at night (Auto): he counts your change into your palm, folds his hands, "Thank you, thank you";
//         insert on the meter; another bow; hold: you look at your change, then at the back of his head.
//   20-21 Tuesday (Chai): you lift your glass an inch; snap; he pours: the glass, the saucer, a second saucer slid
//         under, the counter; you hold the glass over the flood like a trophy; close on his smile; "Exactly the same.":
//         Monday and Tuesday side by side, the same smile; close on you, the fun draining.
//   22    the phone (Mirror): typed, sent, a tick, nothing, dots, two small bars; close on you reading it.
//   23    the mirror (Mirror): you tell it to stop worrying; on "It doesn't." your reflection crosses its arms and frowns.
//   24-26 "Do you like me?" (Chai): you lean over the counter wringing your scarf; snap, the nod, the smile, "Of course,
//         of course."; close on his smile; close on you, his smile in the corner; the tag; you walk off.
//   27-28 the platform (Dev): the train pulls in, Dev leans out of the door, "Saved it. Hurry up."; you run.
//   29-31 the car (Dev): the window seat, one cup passed for a sip each; over his shoulder your half-typed message;
//         "Just send it, yaar."; you lock the phone; he shrugs, writes, tears the page out, tucks it in your scarf.
//   32-36 the office (Boss): the doorway, "Friday off?"; snap, "Take Monday too."; your scarf twists, his smile does not
//         move; "The pitch. Mine?"; snap, "All yours. Obviously."; you walk back past Dev's thumbs up, sit, your hands.
import { AbsoluteFill } from "remotion";
import type { Beat, Shot } from "../shared";
import { current } from "../shared";
import { Sfx } from "./Change.parts";
import { AutoShot } from "./FirstJump.Auto";
import { BossShot } from "./FirstJump.Boss";
import { BusShot } from "./FirstJump.Bus";
import { LikeShot, MondayShot, TuesdayShot } from "./FirstJump.Chai";
import { CarShot, PlatformShot } from "./FirstJump.Dev";
import { BathroomShot, PhoneShot } from "./FirstJump.Mirror";
import { times } from "./FirstJump.Times";

const FirstJump: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const scene = current(frame, [
    [0, "monday"], [k.bus, "bus"], [k.auto, "auto"], [k.tue, "tuesday"], [k.phone, "phone"], [k.look, "bathroom"],
    [k.like, "like"], [k.platform, "platform"], [k.car, "car"], [k.office, "office"],
  ]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene === "monday" && <MondayShot frame={frame} k={k} />}
      {scene === "bus" && <BusShot frame={frame} k={k} />}
      {scene === "auto" && <AutoShot frame={frame} k={k} />}
      {scene === "tuesday" && <TuesdayShot frame={frame} k={k} />}
      {scene === "phone" && <PhoneShot frame={frame} k={k} />}
      {scene === "bathroom" && <BathroomShot frame={frame} k={k} />}
      {scene === "like" && <LikeShot frame={frame} k={k} />}
      {scene === "platform" && <PlatformShot frame={frame} k={k} />}
      {scene === "car" && <CarShot frame={frame} k={k} />}
      {scene === "office" && <BossShot frame={frame} k={k} />}
      <Sfx at={k.bowlSnap} name="snap" />
      <Sfx at={k.bagSnap} name="snap" />
      <Sfx at={k.pourSnap} name="snap" />
      <Sfx at={k.likeSnap} name="snap" />
      <Sfx at={k.fridaySnap} name="snap" />
      <Sfx at={k.pitchSnap} name="snap" />
    </AbsoluteFill>
  );
};

export const firstJump: Beat = { id: "firstJump", firstLine: 13, Component: FirstJump };
