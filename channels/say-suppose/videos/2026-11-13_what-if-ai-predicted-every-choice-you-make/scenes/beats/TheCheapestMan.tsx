// Beat "theCheapestMan", playing the v2 section "Boring Pays" (script.md v2, ## [04:16] Boring Pays; narration lines
// 50-59; day, then dusk, then lamp).
//
//   50     the court at noon: the man with the same lunch, SAME LUNCH 100% teal, the same spoon on the same beat; the
//          clock on twelve; HIS RATE 12 on the pillar; the next table glances at his board, then at their own (64, 71)
//   51     your friend leaning over your counter, hand shading his eyes; round to you: "That's the champion?" (his
//          voice); you snort into your hand; cut back to the man, spoon, spoon
//   52     a paper diagram over the court: a rat's tail, a coin, 1902; a row of tails, a row of coins; the cage behind
//          them, filling with rats
//   53-54  the street: the coach in a sandwich board with no lettering and a small paper subscribe tag pinned to its
//          corner; "Same route. Same lunch. Same face." (his voice); the queue, every card LISTENS 99%
//   55     dusk: your board 64, 61, 55; your hand out to the till, stopping, your eyes up, only then the hand
//   56     closing (lamp): your friend with a napkin folded into a tie, chest out, the landlord's strut; you laughing,
//          hand over your mouth
//   hold   the 5 s performed hold: his mouth opens and LANDLORD VOICE 97% flaps before any sound; he stops, mouth open;
//          looks up at it; your laugh cut off, a double take; he finishes the bit quieter (tick) and pulls the napkin off
//   57-58  "It knows the bit." (his voice, deadpan); you crack up again; his teal card close, the napkin on the counter
//   59     the lamppost outside: CITY SCORE 99.4 flaps to 99.5; up to the steady teal lamp
import { AbsoluteFill } from "remotion";
import { BoardSounds, TagSounds } from "../device";
import { current, type Beat, type Shot as ShotT } from "../shared";
import { Champion, CityScore, Napkin } from "./TheCheapestMan.Closing";
import { Coach, Hanoi, SameLunch, YourRate } from "./TheCheapestMan.Noon";
import { boards, tags, times } from "./TheCheapestMan.Times";

const Scene: React.FC<{ shot: ShotT }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const tg = tags(k);
  const bd = boards(k);
  const part = current(frame, [
    [0, "lunch"], [k.champ, "champ"], [k.react, "lunch"], [k.hanoi, "hanoi"], [k.street, "coach"], [k.rate, "rate"], [k.napkin, "napkin"],
    [k.score, "score"],
  ]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {part === "lunch" && <SameLunch frame={frame} k={k} />}
      {part === "champ" && <Champion frame={frame} k={k} />}
      {part === "hanoi" && <Hanoi frame={frame} k={k} />}
      {part === "coach" && <Coach frame={frame} k={k} />}
      {part === "rate" && <YourRate frame={frame} k={k} />}
      {part === "napkin" && <Napkin frame={frame} k={k} />}
      {part === "score" && <CityScore frame={frame} k={k} />}
      {/* sounds, outside every Stage */}
      <TagSounds keys={tg.queue(0)} volume={0.8} />
      <TagSounds keys={tg.friend} />
      <BoardSounds keys={bd.yours} />
      <BoardSounds keys={bd.city} />
    </AbsoluteFill>
  );
};

export const theCheapestMan: Beat = { id: "theCheapestMan", firstLine: 50, Component: Scene };
