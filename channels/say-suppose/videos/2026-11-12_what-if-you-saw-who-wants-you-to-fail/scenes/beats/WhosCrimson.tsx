// Beat "Who's Red" (script.md v3, ## Who's Red; narration lines 21-47). One component per place, picked by frame; every
// frame comes from the narration clips (WhosCrimson.Times.tsx). Roles, not names: nothing named on screen; the rival,
// your maths teacher, the kid and your best friend speak their own lines (no bubbles).
//
//   21-27  the corridor at the shoe lockers: the rival, -6, over your shoulder; he walks off under it (Corridor); your
//          best friend at the next desk, waving; the rival rows away; the two desks; your best friend watching you (Class)
//   28-30  your maths teacher marking at her lectern, +41, never looking up (Class)
//   31     the mirror in the school toilets: nothing opens (More)
//   32-33  the tour group outside the station: eleven zeros rippling open in a row; the group flows round you (More)
//   34-36  the bus home: the kid in the cap, +77; the bus pulls away (More)
//   37     the desks and the chocolate bar, alive; the two of you at your desks (Track)
//   38     the ladder sheet (Class)
//   39-40  the track: the kid outside it, the rival far ahead, you beside your best friend; your faces; the kid (Track)
//   40-41  the rival far off; your best friend; your face; the lanes, short (Class)
//   42-47  the academy steps at dusk, two performed moments round his lines; no card (Steps)
import { AbsoluteFill } from "remotion";
import { MeterSound } from "../parts";
import { current, type Beat, type Shot } from "../shared";
import { moodAt } from "./WhosCrimson.Common";
import { ClassWhy, KangShot, LadderSheet, LanesPaper, NextDeskShot } from "./WhosCrimson.Class";
import { CorridorShot } from "./WhosCrimson.Corridor";
import { BusShot, MirrorShot, tourTagAt, TourShot } from "./WhosCrimson.More";
import { StepsShot } from "./WhosCrimson.Steps";
import { crimsonTimes } from "./WhosCrimson.Times";
import { DesksWhy, TrackShot } from "./WhosCrimson.Track";

type Place = "corridor" | "next" | "kang" | "mirror" | "tour" | "bus" | "desks" | "ladder" | "track" | "why" | "lanes" | "steps";

const WhosRed: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = crimsonTimes(clips, shot.to);
  const mood = moodAt(shot);
  const place = current<Place>(frame, [[0, "corridor"], [k.nextDesk, "next"], [k.kang, "kang"], [k.mirror, "mirror"], [k.tourIn, "tour"], [k.bus, "bus"],
    [k.desks, "desks"], [k.ladder, "ladder"], [k.race, "track"], [k.taehoFar, "why"], [k.lanes, "lanes"], [k.stepsIn, "steps"]]);
  const props = { frame, k, mood };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {place === "corridor" && <CorridorShot {...props} />}
      {place === "next" && <NextDeskShot {...props} />}
      {place === "kang" && <KangShot {...props} />}
      {place === "mirror" && <MirrorShot {...props} />}
      {place === "tour" && <TourShot {...props} />}
      {place === "bus" && <BusShot {...props} />}
      {place === "desks" && <DesksWhy {...props} />}
      {place === "ladder" && <LadderSheet {...props} />}
      {place === "track" && <TrackShot {...props} />}
      {place === "why" && <ClassWhy {...props} />}
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

export const whosCrimson: Beat = { id: "WhosCrimson", firstLine: 21, Component: WhosRed };
