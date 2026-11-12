// Beat "Who's Red" (script.md v2.1, ## Who's Red; narration lines 14-31). One component per place, picked by frame;
// every frame comes from the narration clips (WhosCrimson.Times.tsx). Roles, not names: nothing named on screen.
//
//   14-19  the school corridor at the shoe lockers: the rival, sage head, one foot up; the letter; -6 (Corridor)
//   20-22  the classroom: your maths teacher, glasses, red pen; +41 (Class)
//   23-25  a top-down insert of two desks and two halves of a chocolate bar; two paper sheets (Class)
//   26-27  the rival far off, head down; your best friend at the next desk, looking straight at you; your face; the
//          lanes (Class)
//   28-31  the academy steps at dusk, and the performed moment round "What number?"; no card (Steps)
import { AbsoluteFill } from "remotion";
import { MeterSound } from "../parts";
import { current, type Beat, type Shot } from "../shared";
import { moodAt } from "./WhosCrimson.Common";
import { ClassWhy, KangShot, LanesPaper, WhyPaper } from "./WhosCrimson.Class";
import { CorridorShot } from "./WhosCrimson.Corridor";
import { StepsShot } from "./WhosCrimson.Steps";
import { crimsonTimes } from "./WhosCrimson.Times";

type Place = "corridor" | "kang" | "paper" | "why" | "lanes" | "steps";

const WhosRed: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = crimsonTimes(clips, shot.to);
  const mood = moodAt(shot);
  const place = current<Place>(frame, [[0, "corridor"], [k.kang, "kang"], [k.desks, "paper"], [k.taehoFar, "why"], [k.lanes, "lanes"], [k.steps, "steps"]]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {place === "corridor" && <CorridorShot frame={frame} k={k} mood={mood} />}
      {place === "kang" && <KangShot frame={frame} k={k} mood={mood} />}
      {place === "paper" && <WhyPaper frame={frame} k={k} mood={mood} />}
      {place === "why" && <ClassWhy frame={frame} k={k} mood={mood} />}
      {place === "lanes" && <LanesPaper frame={frame} k={k} mood={mood} />}
      {place === "steps" && <StepsShot frame={frame} k={k} />}
      {/* the cards' sounds, outside the Stage so a cut never clips a click */}
      <MeterSound at={k.taehoTag} />
      <MeterSound at={k.kangTag} />
    </AbsoluteFill>
  );
};

export const whosCrimson: Beat = { id: "WhosCrimson", firstLine: 14, Component: WhosRed };
