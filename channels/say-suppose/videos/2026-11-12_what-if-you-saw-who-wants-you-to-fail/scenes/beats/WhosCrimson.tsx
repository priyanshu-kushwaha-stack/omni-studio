// Beat "Who's Red" (script.md v5, ## Who's Red; narration lines 22-47). One component per place, picked by frame; every
// frame comes from the narration clips (WhosCrimson.Times.tsx). The rival, your maths teacher, the kid and your best
// friend speak their own lines (no bubbles); you speak only in a bubble.
//
//   22-28  the corridor at the shoe lockers: the rival, -6, over your shoulder; he walks off under it; your deadpan;
//          the gag, a receipt with legs strolling off under the -6 (Corridor)
//   29-31  your maths teacher marking at her lectern, +41, never looking up (Class)
//   32     the mirror in the school toilets: nothing opens (More)
//   33-34  the tour group outside the station: eleven zeros rippling open in a row; the group flows round you (More)
//   35-37  the bus home: the kid in the cap, +77; the bus pulls away (More)
//   38     the desks and the chocolate bar, alive; the two of you at your desks (Track)
//   39     the ladder sheet (Class)
//   40-41  the track; the kid outside it (Track); the rival far off; your best friend at the next desk (Class); the same
//          bar, the same exam (Track)
//   42     your face; the lanes, lower right under PROBLEM 1: grey zeros on strangers, crimson on the friend (Class)
//   43-47  the academy steps: your bubble, he looks up and pats his head, "What number?", swats "the bug", laughs;
//          your look; the street of faces you'll have to read (Steps)
import { AbsoluteFill } from "remotion";
import { MeterSound } from "../parts";
import { current, type Beat, type Shot } from "../shared";
import { moodAt } from "./WhosCrimson.Common";
import { ClassWhy, KangShot, LadderSheet, LanesPaper } from "./WhosCrimson.Class";
import { CorridorShot } from "./WhosCrimson.Corridor";
import { BusShot, MirrorShot, tourTagAt, TourShot } from "./WhosCrimson.More";
import { StepsShot } from "./WhosCrimson.Steps";
import { crimsonTimes } from "./WhosCrimson.Times";
import { DesksWhy, SameShot, TrackShot } from "./WhosCrimson.Track";

type Place = "corridor" | "kang" | "mirror" | "tour" | "bus" | "desks" | "ladder" | "track" | "why" | "same" | "lanes" | "steps";

const WhosRed: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = crimsonTimes(clips, shot.to);
  const mood = moodAt(shot);
  const place = current<Place>(frame, [[0, "corridor"], [k.kang, "kang"], [k.mirror, "mirror"], [k.tourIn, "tour"], [k.bus, "bus"],
    [k.desks, "desks"], [k.ladder, "ladder"], [k.race, "track"], [k.taehoFar, "why"], [k.sameBar, "same"], [k.youLane, "why"], [k.lanes, "lanes"], [k.stepsIn, "steps"]]);
  const props = { frame, k, mood };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {place === "corridor" && <CorridorShot {...props} />}
      {place === "kang" && <KangShot {...props} />}
      {place === "mirror" && <MirrorShot {...props} />}
      {place === "tour" && <TourShot {...props} />}
      {place === "bus" && <BusShot {...props} />}
      {place === "desks" && <DesksWhy {...props} />}
      {place === "ladder" && <LadderSheet {...props} />}
      {place === "track" && <TrackShot {...props} />}
      {place === "why" && <ClassWhy {...props} />}
      {place === "same" && <SameShot {...props} />}
      {place === "lanes" && <LanesPaper {...props} />}
      {place === "steps" && <StepsShot frame={frame} k={k} />}
      {/* the cards' sounds, outside the Stage so a cut never clips a click */}
      <MeterSound at={k.taehoTag} />
      <MeterSound at={k.kangTag} />
      {Array.from({ length: 11 }, (_, i) => <MeterSound key={i} at={tourTagAt(k, i)} volume={i === 0 ? 1 : 0.22} />)}
      <MeterSound at={k.kidTag} />
    </AbsoluteFill>
  );
};

export const whosCrimson: Beat = { id: "WhosCrimson", firstLine: 22, Component: WhosRed };
