// Beat "The Chair" (script.md ## [00:00] The Chair; narration lines 0-1, and the performed lead-in before line 0).
// The plasma clinic at dawn (sets/Clinic). The skit, the narrator silent:
//
//   lead-in, hold 1 (3 s)  INSERT the wall clock: a tick inside half a second. Close on you in the chair, lips counting,
//                          eyelids dropping, lifting, dropping. The room, wide: the man in the grey suit tiptoes over
//                          from the door with his shoebox and lays a band on your forehead. A soft teal chime.
//   hold 2 (2 s)           the dotted thread rises; the pale second you sits up on a floating chair over your lap,
//                          typing; INSERT one coin drops from the desk's edge into your open palm. Clink.
//   hold 3 (2 s)           the nurse, in from the door, unclips the tube and plucks the band off; the ghost folds; you
//                          wake with a jolt, the coin in your hand; she drops the band in his box without looking.
//                          Cut: at the front of the chair, cotton on your arm.
//   0  "Thursday. Not before." (the nurse) counting three notes into your palm; close on her for "Not before."
//   hold 4 (1 s)           close on you: a nod, you knew. The door: he holds the band out again, tips his head.
//   1  "Sleep tonight. Get paid." (the broker) at the door, your shoulder in the near frame.
//   then                   CLOSE the notes in one hand, the coin in the other, the band in his hand: you take it
//                          (it runs on into Night One).
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { ClinkSound, DeviceSound } from "../parts";
import { camAt, current, type Beat, type Shot } from "../shared";
import { CLINIC } from "../sets/Clinic";
import { SkitRoom, skitTimes, TakeInsert, type SkitT } from "./Chair.Skit";

/** The clock ticks once a second (the room's clock runs 22 frames ahead, so the first tick lands at frame 8). */
export const TICK_OFFSET = 22;
export const ticks = (from: number, to: number) => {
  const out: number[] = [];
  for (let f = from; f < to; f++) if ((f + TICK_OFFSET) % 30 === 0) out.push(f);
  return out;
};

const YOU_HEAD = { x: 1090, y: 600 };
const NURSE_HEAD = { x: 800, y: 590 };

function camera(frame: number, k: SkitT): Camera | "take" {
  const shot = current(frame, [[0, "clock"], [k.face, "face"], [k.wide, "wide"], [k.ghostShot, "ghost"], [k.coinShot, "coin"],
    [k.coinShot + 14, "pluck"], [k.notesShot, "notes"], [k.nurseClose, "nurse"], [k.nod, "nod"], [k.brokerShot, "door"],
    [k.take, "take"]] as [number, string][]);
  const C = CLINIC.clock;
  switch (shot) {
    case "clock": return camAt(frame, [[0, insert(C.x + 40, C.y + 20, 3.1)], [k.face, insert(C.x + 30, C.y + 20, 3.3)]]);
    case "face": return camAt(frame, [[k.face, closeUp(YOU_HEAD.x - 120, YOU_HEAD.y - 40, 2.5)], [k.wide, closeUp(YOU_HEAD.x - 110, YOU_HEAD.y - 30, 2.7)]]);
    case "wide": return camAt(frame, [[k.wide, { x: 1120, y: 560, zoom: 1.08 }], [k.ghostShot, { x: 1110, y: 570, zoom: 1.16 }]]);
    case "ghost": return camAt(frame, [[k.ghostShot, { x: 1030, y: 560, zoom: 1.7 }], [k.coinShot, { x: 1020, y: 545, zoom: 1.9 }]]);
    case "coin": return camAt(frame, [[k.coinShot, insert(930, 610, 3.0)], [k.coinShot + 14, insert(930, 630, 3.2)]]);
    case "pluck": return camAt(frame, [[k.coinShot + 14, { x: 1130, y: 600, zoom: 1.65 }], [k.notesShot, { x: 1150, y: 600, zoom: 1.75 }]]);
    case "notes": return camAt(frame, [[k.notesShot, { x: 950, y: 610, zoom: 1.85 }], [k.nurseClose, { x: 950, y: 600, zoom: 2.05 }]]);
    case "nurse": return camAt(frame, [[k.nurseClose, closeUp(NURSE_HEAD.x + 110, NURSE_HEAD.y, 2.5)], [k.nod, closeUp(NURSE_HEAD.x + 110, NURSE_HEAD.y, 2.65)]]);
    case "nod": return camAt(frame, [[k.nod, closeUp(YOU_HEAD.x - 90, YOU_HEAD.y - 20, 2.6)], [k.brokerShot, closeUp(YOU_HEAD.x - 90, YOU_HEAD.y - 20, 2.75)]]);
    case "door": return camAt(frame, [[k.brokerShot, { x: 1500, y: 600, zoom: 1.75 }], [k.take, { x: 1530, y: 590, zoom: 1.95 }]]);
    default: return "take";
  }
}

/** The skit's sound: the clock, the band (chime and typing), the coin, the notes, the band coming off. */
export const SkitSound: React.FC<{ k: SkitT; to: number }> = ({ k, to }) => (
  <>
    {ticks(0, to).map((f) => (
      <Sequence key={f} from={f} durationInFrames={12}><Audio src={staticFile("sfx/tick.wav")} volume={f < k.L ? 0.32 : 0.14} /></Sequence>
    ))}
    <DeviceSound at={k.band} frames={k.pluck - k.band - 6} volume={0.9} />
    <ClinkSound at={[k.landed]} volume={0.8} />
    {/* the band off: the chime again, lower and slower (the file can't play backwards) */}
    <Sequence from={k.pluck} durationInFrames={40}><Audio src={staticFile("sfx/chime.wav")} volume={0.18} playbackRate={0.7} /></Sequence>
    {k.notes.map((f) => <Sequence key={f} from={f} durationInFrames={20}><Audio src={staticFile("sfx/paper.wav")} volume={0.3} /></Sequence>)}
  </>
);

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = skitTimes(clips);
  const cam = camera(frame, k);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {cam === "take" ? <TakeInsert frame={frame} k={k} /> : <SkitRoom frame={frame} k={k} cam={drift(cam, frame, "chair", 3)} />}
      <SkitSound k={k} to={shot.to} />
    </AbsoluteFill>
  );
};

export const chair: Beat = { id: "chair", firstLine: 0, Component: Scene };
