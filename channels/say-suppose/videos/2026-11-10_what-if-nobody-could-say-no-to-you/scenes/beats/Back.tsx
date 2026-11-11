// Beat "Back to you" (script.md, ## [12:30] Back to you; narration lines 108-112). Same pattern as Change.tsx. The
// metro home at night (PaperBeat.Metro.tsx), then the end card. The last 15 s (from `quiet`) keep the right third of
// the frame quiet for end screens: every shot from there puts its subject in the left two-thirds.
//
//   108   medium: you take out your phone; top-down insert, the message box to the boss, empty.
//   109   "You type it once.": one line of ink bars, typed once, and the thumb stops.
//   110   the thumb over send, Dev's notebook page tucked under the phone's edge; send, one tick.
//   hold  you put the phone face up on the tiffin lid; the train hums; your face in the window, watching the phone.
//   111   insert: the phone on the lid, three dots under your message; the hold: the dots pulse, you watch them.
//   112   the end card: you small at the left with the torn strip, LIKE, SUBSCRIBE and COMMENT tags beside you.
import { AbsoluteFill } from "remotion";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { PhoneTop } from "../parts2";
import { camAt, current, lineEnd, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { MetroBack, MetroFront } from "../sets/Metro";
import { Sfx } from "./Change.parts";
import { EndCard, LapTop, LidTop, PhoneAlone, TuckedPage } from "./Back.EndCard";
import { Reflection, SeatedYou, seatHead } from "./PaperBeat.Metro";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i). */
function times(clips: Clip[], to: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const send = lineEnd(clips, 110) + 4;
  return {
    out: from(108), // medium: you take out the phone
    insert: at(108, 0.45), // top-down: the empty box
    thumbIn: at(108, 0.75),
    type: from(109), // typed once
    typeTo: lineEnd(clips, 109) + 10,
    over: from(110) - 4, // the thumb over send
    send, // send; one tick
    lid: send + 24, // the phone face up on the tiffin lid; your face in the window
    dots: from(111) - 4, // insert: three dots
    watch: lineEnd(clips, 111) + 18, // you watch them
    card: from(112) - 8, // the end card
    tags: from(112) + 4,
    quiet: to - 450, // the last 15 s
    end: to,
  };
}

/** A camera that puts world point (x, y) at screen x 620 (inside the left two-thirds) from `quiet` on, centred before. */
const framed = (frame: number, k: T, x: number, y: number, zoom: number): Camera =>
  ({ x: frame >= k.quiet ? x + 340 / zoom : x, y, zoom });

// ------------------------------------------------------------------------------------------------ the car

const CarShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.out, "out"], [k.lid, "lid"], [k.watch, "watch"]]);
  const cams: Record<typeof shot, Camera> = {
    out: camAt(frame, [[k.out, framed(frame, k, seatHead.x - 60, seatHead.y + 80, 1.9)], [k.insert, framed(frame, k, seatHead.x - 50, seatHead.y + 90, 2.05)]]),
    lid: camAt(frame, [[k.lid, framed(frame, k, seatHead.x - 140, seatHead.y + 20, 1.6)], [k.dots, framed(frame, k, seatHead.x - 120, seatHead.y + 30, 1.72)]]),
    watch: camAt(frame, [[k.watch, framed(frame, k, seatHead.x - 30, seatHead.y, 2.6)], [k.card, framed(frame, k, seatHead.x - 30, seatHead.y, 2.8)]]),
  };
  const faces = {
    out: { brows: "raised" as const, lids: 0.15, eyes: 1, mouth: "smirk" as const, look: { x: 0.4, y: 0.7 } },
    lid: { brows: "raised" as const, lids: 0.15, eyes: 1.05, mouth: "flat" as const, look: { x: 0.35, y: 0.85 } },
    watch: { brows: "raised" as const, lids: 0, eyes: 1.15, mouth: frame >= k.watch + 30 ? "smile" as const : "o" as const, look: { x: 0.35, y: 0.85 } },
  };
  const phone = shot === "out" ? ramp(frame, k.out + 6, k.out + 26) : 0;
  const cam = drift(cams[shot], frame, "back-car", 3);
  // Your face in the window watching the phone, not the city.
  const back = <MetroBack cam={cam} view="car" frame={frame} outside="night" speed={6} reflection={<Reflection frame={frame} look={{ x: 0.4, y: 0.9 }} />} />;
  const actors = <SeatedYou frame={frame} face={faces[shot]} phone={phone} onLid={shot !== "out"} />;
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} front={<MetroFront cam={cam} view="car" />} />;
};

// ------------------------------------------------------------------------------------------------ the phone

const PX = 960, PY = 560, PS = 1.1;

/** The thumb while typing: hops over the keys, then rests at the side; over send from `over`; a press at `send`. */
function thumbAt(frame: number, k: T) {
  if (frame < k.thumbIn) return null;
  if (frame >= k.over) {
    const to = ramp(frame, k.over, k.over + 12);
    const press = ramp(frame, k.send - 4, k.send) * (1 - ramp(frame, k.send + 2, k.send + 8));
    return { x: mix(0.6, 0.86, to), y: mix(0.9, -0.12, to) + press * 0.05 };
  }
  if (frame >= k.type && frame < k.typeTo) {
    const hop = Math.floor(frame / 3);
    return { x: 0.1 + ((hop * 37) % 80) / 100, y: 0.15 + ((hop * 53) % 50) / 100 };
  }
  return { x: 0.6, y: mix(1.3, 0.9, ramp(frame, k.thumbIn, k.thumbIn + 10)) };
}

const PhoneShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const typed = frame >= k.send ? 0 : linear(frame, k.type, k.typeTo);
  const cam = drift(camAt(frame, [[k.insert, framed(frame, k, PX, PY + 20, 1.2)], [k.over, framed(frame, k, PX, PY + 40, 1.32)], [k.lid, framed(frame, k, PX + 60, PY + 120, 1.55)]]), frame, "back-phone", 1.5);
  const actors = (
    <>
      <TuckedPage x={PX - 40} y={PY + 120} scale={PS} />
      <PhoneTop x={PX} y={PY} scale={PS} frame={frame} typed={typed} seed={7} sent={frame >= k.send} ticks={1} thumb={thumbAt(frame, k)}
        cursor={frame < k.typeTo} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<LapTop />} actors={actors} />;
};

const DotsShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.dots, framed(frame, k, PX, PY - 60, 1.25)], [k.watch, framed(frame, k, PX, PY - 120, 1.5)]]), frame, "back-dots", 1.5);
  const actors = (
    <>
      <TuckedPage x={PX - 40} y={PY + 120} scale={PS} />
      <PhoneAlone x={PX} y={PY} scale={PS} frame={frame} sent ticks={1} seed={7} dots={frame >= k.dots + 10} cursor={false} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<LidTop x={PX} y={PY} />} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ the beat

const Back: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const scene = current(frame, [[0, "car"], [k.insert, "phone"], [k.lid, "car"], [k.dots, "dots"], [k.watch, "car"], [k.card, "card"]]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene === "car" && <CarShot frame={frame} k={k} />}
      {scene === "phone" && <PhoneShot frame={frame} k={k} />}
      {scene === "dots" && <DotsShot frame={frame} k={k} />}
      {scene === "card" && <EndCard frame={frame} from={k.card} to={k.end} tags={k.tags} />}
      {/* One quiet pop for the end card's tags. */}
      <Sfx at={k.tags} name="snap-soft" volume={0.2} />
    </AbsoluteFill>
  );
};

export const back: Beat = { id: "back", firstLine: 108, Component: Back };
