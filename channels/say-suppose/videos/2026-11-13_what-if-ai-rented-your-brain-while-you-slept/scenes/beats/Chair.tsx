// Beat "The Chair" (script.md v3 ## [00:00] The Chair; v3 lines 0-2, and the performed lead-in before line 0). Times come
// from shot.v3 (v3 numbering): v1's line 1 is v3's line 2, and v3's line 1 is new.
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
//   0  "That's all the plasma we can take this week. Come back Thursday." (the nurse) counting three notes into your
//      palm; close on her for "Come back Thursday."
//   hold (1 s)             close on you: you look down at the three notes in your palm; your bubble "That's it?"
//   1  "You fell asleep for ten seconds, and you earned a coin." (the broker) two-shot, the door and the chair: he tips
//      his head and points his back arm at the coin in your fist; you look at it.
//   2  "Wear this tonight. Sleep all night, and get paid for every hour." at the door, the band held out.
//   then                   CLOSE the notes in one hand, the coin in the other, the band in his hand: you take it
//                          (it runs on into Night One).
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { ClinkSound, DeviceSound } from "../parts";
import { camAt, current, type Beat, type Shot } from "../shared";
import { DoorShot, SkitRoom, skitTimes, TakeInsert, type SkitT } from "./Chair.Skit";
import { BunkRoom, KEY_VIEW } from "../sets/BunkRoom";

/** G3, the first 30 seconds (studio-whatif-edit.md): the opening frames are the thumbnail's picture (the bunk room after
 *  midnight, you asleep with the band lit, the pale second you typing, coins arcing into the jar), so the autoplay
 *  preview looks like the thumbnail; a hard cut at THUMB_OPEN to the clinic close. */
const THUMB_OPEN = 14;
const ThumbOpen: React.FC<{ frame: number }> = ({ frame }) => (
  <BunkRoom frame={frame + 200} mood="night" view={{ ...KEY_VIEW, zoom: 1 + frame * 0.002 }} you="band" device={{ on: -100 }}
    coins={{ from: -100 }} jarFill={0.55} />
);

/** The clock ticks once a second (the room's clock runs 22 frames ahead, so the first tick lands at frame 8). */
export const TICK_OFFSET = 22;
export const ticks = (from: number, to: number) => {
  const out: number[] = [];
  for (let f = from; f < to; f++) if ((f + TICK_OFFSET) % 30 === 0) out.push(f);
  return out;
};

const YOU_HEAD = { x: 1090, y: 600 };
const NURSE_HEAD = { x: 800, y: 590 };

function camera(frame: number, k: SkitT): Camera | "take" | "shut" {
  const shot = current(frame, [[0, "face"], [k.ghostShot, "ghost"], [k.coinShot, "coin"], [k.pluckShot, "pluck"],
    [k.notesShot, "notes"], [k.nurseClose, "nurse"], [k.thatsIt, "thatsIt"], [k.twoShot, "two"], [k.bandShot, "door"],
    [k.take, "take"], [k.shut, "shut"]] as [number, string][]);
  switch (shot) {
    // 0-1.5 s: close on you dozing, the clock behind; his grey arm lays the band across your forehead
    case "face": return camAt(frame, [[0, closeUp(YOU_HEAD.x - 20, YOU_HEAD.y - 60, 2.6)], [k.ghostShot, closeUp(YOU_HEAD.x - 10, YOU_HEAD.y - 60, 2.8)]]);
    // 1.5-3.4 s: the pale second you rises big in frame, types; the coin drops into your palm
    case "ghost": return camAt(frame, [[k.ghostShot, { x: 1010, y: 482, zoom: 2.3 }], [k.coinShot, { x: 1000, y: 492, zoom: 2.5 }]]);
    // the coin kept up and right of the lower-left caption card
    case "coin": return camAt(frame, [[k.coinShot, insert(890, 672, 3.1)], [k.pluckShot, insert(888, 668, 3.35)]]);
    case "pluck": return camAt(frame, [[k.pluckShot, { x: 1130, y: 600, zoom: 1.65 }], [k.notesShot, { x: 1150, y: 600, zoom: 1.75 }]]);
    case "notes": return camAt(frame, [[k.notesShot, { x: 950, y: 610, zoom: 1.85 }], [k.nurseClose, { x: 950, y: 600, zoom: 2.05 }]]);
    case "nurse": return camAt(frame, [[k.nurseClose, closeUp(NURSE_HEAD.x + 110, NURSE_HEAD.y, 2.5)], [k.thatsIt, closeUp(NURSE_HEAD.x + 110, NURSE_HEAD.y, 2.65)]]);
    case "thatsIt": return camAt(frame, [[k.thatsIt, closeUp(YOU_HEAD.x - 110, YOU_HEAD.y - 40, 2.3)], [k.twoShot, closeUp(YOU_HEAD.x - 110, YOU_HEAD.y - 40, 2.45)]]);
    case "two": return camAt(frame, [[k.twoShot, { x: 1290, y: 560, zoom: 1.45 }], [k.bandShot, { x: 1300, y: 560, zoom: 1.55 }]]);
    case "door": return camAt(frame, [[k.bandShot, { x: 1500, y: 600, zoom: 1.75 }], [k.take, { x: 1530, y: 590, zoom: 1.95 }]]);
    case "take": return "take";
    default: return "shut";
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
  const { frame, v6 } = shot;
  const k = skitTimes(v6);
  const cam = camera(frame, k);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {frame < THUMB_OPEN ? <ThumbOpen frame={frame} /> : cam === "take" ? <TakeInsert frame={frame} k={k} /> : cam === "shut" ? <DoorShot frame={frame} k={k} />
        : <SkitRoom frame={frame} k={k} cam={drift(cam, frame, "chair", 3)} />}
      <SkitSound k={k} to={shot.to} />
      <Sequence from={k.doorClose[1] - 2} durationInFrames={20}><Audio src={staticFile("sfx/knock.wav")} volume={0.22} /></Sequence>
    </AbsoluteFill>
  );
};

export const chair: Beat = { id: "chair", firstLine: 0, Component: Scene };
