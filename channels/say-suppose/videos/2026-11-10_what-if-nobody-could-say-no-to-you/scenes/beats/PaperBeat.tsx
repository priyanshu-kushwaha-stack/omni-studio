// Beat "The paper" (script.md, ## [11:30] The paper; narration lines 105-107). Same pattern as Change.tsx. The
// wordless peak itself (Dev reads the paper, the grey closes in, black, the empty corridor) sits in the narration gap
// after line 104, so it starts in The choice's frames; this beat draws its tail (PaperBeat.Peak.tsx), then:
//
//   105   the metro home at night: you at the window seat, the tiffin on your lap, the envelope on top; in the dark
//         window, small paper memories in full colour (Dev's hand flat on the seat, the one paper cup, the notebook
//         page, the tiffin at the gate); closer on the glass.
//   106   your reflection in the window: over your head, for the first time in the film, nothing at all; close on you.
//   107   medium on you; the hold: the city's lights go by, the tiffin on your lap, your face still.
import { AbsoluteFill } from "remotion";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { camAt, current, lineEnd, ramp, type Beat, type Shot } from "../shared";
import { MetroBack, MetroFront } from "../sets/Metro";
import { PaperPeak, peakTimes } from "./PaperBeat.Peak";
import { Memories, MEMORY_SPOTS, Reflection, reflectionHead, SeatedYou, seatHead } from "./PaperBeat.Metro";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i). */
function times(clips: Clip[], to: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const peak = peakTimes(clips);
  return {
    peak,
    metro: peak.metro, // the metro home
    memories: [peak.metro + 10, at(105, 0.34), at(105, 0.54), at(105, 0.72)],
    glass: at(105, 0.46), // closer on the memories in the glass
    reflect: from(106) - 2, // your reflection, nothing over your head
    you: at(106, 0.58), // close on you
    chance: from(107) - 2, // "The chance of being told no."
    wide: lineEnd(clips, 107) + 2, // the hold: the city's lights go by
    still: lineEnd(clips, 107) + 40, // your face, still
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ the car

const Car: React.FC<{ frame: number; k: T; cam: Camera; face: object; reflection?: boolean; speed?: number }> = ({ frame, k, cam, face, reflection, speed = 7 }) => {
  const back = <MetroBack cam={cam} view="car" frame={frame} outside="night" speed={speed} reflection={reflection ? <Reflection frame={frame} /> : undefined} />;
  const actors = (
    <>
      <Memories frame={frame} at={k.memories} until={k.reflect} />
      <SeatedYou frame={frame} face={face} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} front={<MetroFront cam={cam} view="car" />} />;
};

const HomeShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.metro, "seat"], [k.glass, "glass"], [k.reflect, "reflect"], [k.you, "you"], [k.chance, "chance"], [k.wide, "wide"], [k.still, "still"]]);
  const first = MEMORY_SPOTS[0], last = MEMORY_SPOTS[3];
  const cams: Record<typeof shot, Camera> = {
    seat: camAt(frame, [[k.metro, { x: 1380, y: 600, zoom: 1.45 }], [k.glass, { x: 1360, y: 580, zoom: 1.55 }]]),
    glass: camAt(frame, [[k.glass, { x: first.x + 110, y: 450, zoom: 2.2 }], [k.reflect, { x: last.x - 110, y: 440, zoom: 2.35 }]]),
    reflect: camAt(frame, [[k.reflect, closeUp(reflectionHead.x + 40, reflectionHead.y - 10, 2.5)], [k.you, closeUp(reflectionHead.x + 40, reflectionHead.y - 60, 2.7)]]),
    you: camAt(frame, [[k.you, closeUp(seatHead.x - 30, seatHead.y, 2.6)], [k.chance, closeUp(seatHead.x - 30, seatHead.y, 2.85)]]),
    chance: camAt(frame, [[k.chance, { x: seatHead.x - 120, y: seatHead.y + 60, zoom: 1.9 }], [k.wide, { x: seatHead.x - 110, y: seatHead.y + 50, zoom: 2.1 }]]),
    wide: camAt(frame, [[k.wide, { x: 1180, y: 560, zoom: 1.1 }], [k.still, { x: 1220, y: 570, zoom: 1.16 }]]),
    still: camAt(frame, [[k.still, closeUp(seatHead.x - 20, seatHead.y, 2.7)], [k.end, closeUp(seatHead.x - 20, seatHead.y, 2.9)]]),
  };
  const soft = ramp(frame, k.memories[1], k.memories[3]);
  const faces = {
    seat: { ...EXPRESSIONS.sad, lids: 0.45, mouth: "flat" as const, look: { x: -0.3, y: -0.6 } },
    glass: { ...EXPRESSIONS.relieved, lids: 0.4, look: { x: -0.3, y: -0.6 }, mouth: soft > 0.5 ? "smile" as const : "flat" as const },
    reflect: { ...EXPRESSIONS.neutral, look: { x: -0.4, y: -0.5 } },
    you: { brows: "flat" as const, lids: 0.35, eyes: 1, mouth: "flat" as const, look: { x: 0.3, y: 0.3 } },
    chance: { ...EXPRESSIONS.relieved, lids: 0.45, mouth: "flat" as const, look: { x: 0.5, y: 0.4 } },
    wide: { brows: "flat" as const, lids: 0.4, eyes: 1, mouth: "flat" as const, look: { x: 0.6, y: 0.4 } },
    still: { brows: "flat" as const, lids: 0.4, eyes: 1, mouth: "flat" as const, look: { x: 0.6, y: 0.35 } },
  };
  const cam = drift(cams[shot], frame, "home", shot === "glass" ? 2 : 3);
  return <Car frame={frame} k={k} cam={cam} face={faces[shot]} reflection={frame >= k.reflect} speed={shot === "wide" ? 9 : 7} />;
};

// ------------------------------------------------------------------------------------------------ the beat

const PaperBeat: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {frame < k.metro ? <PaperPeak frame={frame} p={k.peak} /> : <HomeShot frame={frame} k={k} />}
    </AbsoluteFill>
  );
};

export const paper: Beat = { id: "paper", firstLine: 105, Component: PaperBeat };
