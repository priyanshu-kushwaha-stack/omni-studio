// Beat "The Cheapest Man" (script.md, ## [03:53] The Cheapest Man; narration lines 43-52; day, then dusk, then lamp).
//
//   43     the court at noon: the man with the same lunch, SAME LUNCH 100% teal, not a flicker; the same spoon on the
//          same beat; the clock on twelve; HIS RATE 12 on the pillar; the next table glances at his board, then at
//          their own (64, 71)
//   44     a paper diagram over the court: a rat's tail, a coin, 1902; a row of tails, a row of coins; the cage drawn
//          behind them, filling with rats
//   45-46  the street: the coach in a sandwich board with no lettering and a small red paper subscribe tag pinned to its
//          corner; "Same route. Same lunch. Same face." (his voice); the queue, every card LISTENS 99%
//   47     dusk: the magician reads a tourist's card (CALLS MUM 94%) for a coin; your board 64, 61, 55; your hand out
//          to the till, stopping, your eyes up to OPENS TILL 96%, and only then the hand; tick
//   48     the phone on the counter from above, ringing, his sister's face on it; his face over it; his hand turns it
//          face down; you look at the back of it, then at him; he wipes the counter
//   hold   the six-second performed hold (lamp): TELLS JOKE 62%; his mouth opens, his eyes go up, the grin stays a
//          second after, the mouth shuts, he counts coins with no sound; you look at him; COUNTS COINS 97% teal
//   49-50  the two of you, him counting; his card close
//   51     your hand on the lid, the key, your pocket
//   52     the lamppost outside: CITY SCORE 99.4 flaps to 99.5; up to the steady teal lamp
import { AbsoluteFill } from "remotion";
import { BoardSounds, TagSounds } from "../device";
import { current, type Beat, type Shot as ShotT } from "../shared";
import { CityScore, Habit, PhoneLights, SixtyTwo } from "./TheCheapestMan.Closing";
import { Coach, Hanoi, SameLunch, Tips, YourRate } from "./TheCheapestMan.Noon";
import { boards, tags, times } from "./TheCheapestMan.Times";

const Scene: React.FC<{ shot: ShotT }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const tg = tags(k);
  const bd = boards(k);
  const part = current(frame, [
    [0, "lunch"], [k.hanoi, "hanoi"], [k.street, "coach"], [k.magic, "tips"], [k.rate, "rate"], [k.phone, "phone"],
    [k.hold, "sixty"], [k.habit, "habit"], [k.score, "score"],
  ]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {part === "lunch" && <SameLunch frame={frame} k={k} />}
      {part === "hanoi" && <Hanoi frame={frame} k={k} />}
      {part === "coach" && <Coach frame={frame} k={k} />}
      {part === "tips" && <Tips frame={frame} k={k} />}
      {part === "rate" && <YourRate frame={frame} k={k} />}
      {part === "phone" && <PhoneLights frame={frame} k={k} />}
      {part === "sixty" && <SixtyTwo frame={frame} k={k} />}
      {part === "habit" && <Habit frame={frame} k={k} />}
      {part === "score" && <CityScore frame={frame} k={k} />}
      {/* sounds, outside every Stage */}
      <TagSounds keys={tg.queue(0)} volume={0.8} />
      <TagSounds keys={tg.you.slice(1)} />
      <TagSounds keys={tg.friend} />
      <BoardSounds keys={bd.yours} />
      <BoardSounds keys={bd.city} />
    </AbsoluteFill>
  );
};

export const theCheapestMan: Beat = { id: "theCheapestMan", firstLine: 43, Component: Scene };
