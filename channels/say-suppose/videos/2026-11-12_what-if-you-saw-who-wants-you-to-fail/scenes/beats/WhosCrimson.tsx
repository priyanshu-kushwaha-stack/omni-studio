// Beat "Who's Crimson" (script.md, ## [01:13] Who's Crimson; narration lines 14-32). One component per place, picked by
// frame; every frame comes from the narration clips (WhosCrimson.Times.tsx).
//
//   14-19  the school corridor at the shoe lockers: Tae-ho, sage head, one foot up; the letter; -6 (Corridor)
//   20-22  the classroom: Ms. Kang, glasses, red pen; +41 (Class)
//   23     the store counter, a grey 0; the metro platform, eleven grey 0s; the store cat, nothing (Out)
//   24-26  a top-down insert of two desks and two kimbap halves; two paper sheets (Class)
//   27-28  Tae-ho far off, head down; Min-jun at the next desk, looking straight at you; your face; the lanes (Class)
//   29-32  the academy steps at dusk: you point above his head; "What number?"; no card (Out)
import { AbsoluteFill } from "remotion";
import { MeterSound } from "../parts";
import { current, type Beat, type Shot } from "../shared";
import { moodAt } from "./WhosCrimson.Common";
import { ClassWhy, KangShot, LanesPaper, WhyPaper } from "./WhosCrimson.Class";
import { CorridorShot } from "./WhosCrimson.Corridor";
import { CatShot, ClerkShot, StepsShot, TourShot, tourTagAt } from "./WhosCrimson.Out";
import { crimsonTimes } from "./WhosCrimson.Times";

type Place = "corridor" | "kang" | "clerk" | "tour" | "cat" | "paper" | "why" | "lanes" | "steps";

const WhosCrimson: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = crimsonTimes(clips, shot.to);
  const mood = moodAt(shot);
  const place = current<Place>(frame, [[0, "corridor"], [k.kang, "kang"], [k.clerk, "clerk"], [k.tour, "tour"], [k.cat, "cat"],
    [k.desks, "paper"], [k.taehoFar, "why"], [k.lanes, "lanes"], [k.steps, "steps"]]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {place === "corridor" && <CorridorShot frame={frame} k={k} mood={mood} />}
      {place === "kang" && <KangShot frame={frame} k={k} mood={mood} />}
      {place === "clerk" && <ClerkShot frame={frame} k={k} mood={mood} />}
      {place === "tour" && <TourShot frame={frame} k={k} mood={mood} />}
      {place === "cat" && <CatShot frame={frame} k={k} mood={mood} />}
      {place === "paper" && <WhyPaper frame={frame} k={k} mood={mood} />}
      {place === "why" && <ClassWhy frame={frame} k={k} mood={mood} />}
      {place === "lanes" && <LanesPaper frame={frame} k={k} mood={mood} />}
      {place === "steps" && <StepsShot frame={frame} k={k} />}
      {/* the cards' sounds, outside the Stage so a cut never clips a click */}
      <MeterSound at={k.taehoTag} />
      <MeterSound at={k.kangTag} />
      <MeterSound at={k.clerkTag} />
      {Array.from({ length: 11 }, (_, i) => <MeterSound key={i} at={tourTagAt(k, i)} volume={0.32} />)}
    </AbsoluteFill>
  );
};

export const whosCrimson: Beat = { id: "WhosCrimson", firstLine: 14, Component: WhosCrimson };
