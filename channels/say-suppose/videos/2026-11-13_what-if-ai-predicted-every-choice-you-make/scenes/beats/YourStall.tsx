// Beat "Your Stall" (script.md v2, ## [02:28] Your Stall; narration lines 26-32, mood day). The first win.
//
//   26     the lunch queue: ORDERS NOODLES 92%, ORDERS RICE 88%, CHANGES MIND 81% drop over three heads; your eyes on the
//          cards, never a face; the first plate slides across the steel before his mouth opens
//   hold   the 5 s performed hold: plates two and three land as mouths open, tick, tick, tick; the third man gets rice
//          and noodles both: the plate, you, the plate again; your board on the pillar 100, 94, 90
//   27     the coffee seller close, mouth open; "Show-off." (her voice); she slowly looks up at her own queue's cards
//   28     the queue doubled, served one a second, the camera down its length; the court next door: another cook,
//          eyes up on ORDERS RICE 88%, plating before the customer speaks
//   29-31  the landlord's envelope; "Keep it up."; the tear; HIGH-FIVES 98% a second before the hand comes up; "Half!";
//          the slap, tick
//   32     you close, grinning; on "anyone's" your eyes slide out over the court
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { BoardSounds, TagSounds } from "../device";
import { current, type Beat, type Shot as ShotT } from "../shared";
import { Landlord, Thought } from "./YourStall.Landlord";
import { Busy, busyTicks, CoffeeLook, NextDoor, Queue } from "./YourStall.Queue";
import { boards, tags, times } from "./YourStall.Times";

const Scene: React.FC<{ shot: ShotT }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const tg = tags(k);
  const bd = boards(k);
  const part = current(frame, [
    [0, "queue"], [k.coffee, "coffee"], [k.busy, "busy"], [k.nextDoor, "next"], [k.landlord, "landlord"], [k.thought, "thought"],
  ]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {part === "queue" && <Queue frame={frame} k={k} />}
      {part === "coffee" && <CoffeeLook frame={frame} k={k} />}
      {part === "busy" && <Busy frame={frame} k={k} />}
      {part === "next" && <NextDoor frame={frame} k={k} />}
      {part === "landlord" && <Landlord frame={frame} k={k} />}
      {part === "thought" && <Thought frame={frame} k={k} />}
      {/* sounds, outside every Stage */}
      {tg.queue.map((keys, i) => <TagSounds key={i} keys={keys} volume={0.9} />)}
      <TagSounds keys={busyTicks(k)} volume={0.35} />
      <TagSounds keys={[{ at: k.nextDoor + 2, text: "ORDERS RICE", pct: 88, state: "new" }, { at: k.nextDoor + 33, text: "ORDERS RICE", pct: 88, state: "tick" }]} volume={0.7} />
      <TagSounds keys={tg.friend} />
      {[k.p1, k.p2, k.p3].map((f) => <Sequence key={f} from={f} durationInFrames={24}><Audio src={staticFile("sfx/scrape.wav")} volume={0.45} /></Sequence>)}
      <Sequence from={k.tear} durationInFrames={30}><Audio src={staticFile("sfx/tear.wav")} volume={0.6} /></Sequence>
      <BoardSounds keys={bd.yours} />
    </AbsoluteFill>
  );
};

export const yourStall: Beat = { id: "yourStall", firstLine: 26, Component: Scene };
