// Beat "The City Plays" (script.md, ## [02:28] The City Plays; narration lines 24-42, mood day). Many quick uses of
// the tags, each its own little scene, then the film's key picture.
//
//   24-25  the metro platform (metroPlatform): the kid with the cap and the man play rock-paper-scissors; the kid wins
//          with rock, fist up; ROCK AGAIN 83% drops; the man reads it, throws paper, wins; rock again, paper again;
//          "No fair." (his own voice), cap off in his hand
//   26     a paper diagram on the platform wall: a fist, a win, an arrow looping back to the fist
//   27-29  the street (street): the magician fans his cards, PALMS THE QUEEN 99%; "Pick a card." (his voice); the
//          crowd reads it and walks off; he looks up at his own card and lowers the fan
//   30-31  a food-court table: the couple; CHECKS PHONE 88% over her, she checks it, tick; SAME JOKE 95% over him, he
//          tells it, tick; the table boards flap 6.40 to 3.20 together; the food steams untouched; "Heard this one."
//   32     the court's television: KICKS LEFT 91%, the keeper already diving left, the save; three strikers, three
//          tags, three saves; a scoreboard of zeros
//   33-35  the platform: the hooded man behind the woman with the bag, TAKES WALLET 97% buzzing crimson, every head
//          turns, "I didn't touch it." (his voice), hands open; the doors shut in his face; the coffee seller turns
//          her back; his card close; the platform steps away from him; dusk: STANDS STILL 99% teal, against a pillar,
//          a woman asleep on the bench beside him with her bag
//   36-37  you on the platform, TAKES THE SIX-TEN 98%; the paper map of your flat, the platform, the court and the
//          stall, the route worn thick, 93; the bars all above 80; the train in, the clock flaps 6:10, tick
//   38-40  your stall: the landlord's envelope; HIGH-FIVES 98% a second before his hand comes up; "Half!"; the slap
//   41-42  THE KEY PICTURE (TheCityPlays.Train, sets/ForecastCoach): your card LOOKS AT PHONE 99% over your face lit
//          by the screen, the pull back down the coach over forty heads and forty cards from forty teal lamps, the
//          fare board 2.10, 2.00, 1.90; the hold: all forty tick together, 1.80, the sunrise in the panes and no face
//          turned to it; line 42: down the aisle to the stranger at the far end, facing the doors, no phone
import { AbsoluteFill } from "remotion";
import { BoardSounds, TagSounds } from "../device";
import { current, type Beat, type Shot as ShotT } from "../shared";
import { CoffeeBack, Doors, Pickpocket, RPS, RpsDiagram, SixTen, StandsStill, Verdict } from "./TheCityPlays.Platform";
import { DateTable, Landlord, Magician, PenaltyTv } from "./TheCityPlays.Town";
import { coachSoundKeys, fareKeys, TrainShot } from "./TheCityPlays.Train";
import { boards, tags, times } from "./TheCityPlays.Times";

const Scene: React.FC<{ shot: ShotT }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const tg = tags(k);
  const bd = boards(k);
  const part = current(frame, [
    [0, "rps"], [k.diagram, "diagram"], [k.magician, "magician"], [k.date, "date"], [k.tv, "tv"], [k.pick2, "pickpocket"],
    [k.doors, "doors"], [k.coffee, "coffee"], [k.verdict, "verdict"], [k.dusk, "still"], [k.sixTen, "sixTen"],
    [k.landlord, "landlord"], [k.t.train, "train"],
  ]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {part === "rps" && <RPS frame={frame} k={k} />}
      {part === "diagram" && <RpsDiagram frame={frame} k={k} />}
      {part === "magician" && <Magician frame={frame} k={k} />}
      {part === "date" && <DateTable frame={frame} k={k} />}
      {part === "tv" && <PenaltyTv frame={frame} k={k} />}
      {part === "pickpocket" && <Pickpocket frame={frame} k={k} />}
      {part === "doors" && <Doors frame={frame} k={k} />}
      {part === "coffee" && <CoffeeBack frame={frame} k={k} />}
      {part === "verdict" && <Verdict frame={frame} k={k} />}
      {part === "still" && <StandsStill frame={frame} k={k} />}
      {part === "sixTen" && <SixTen frame={frame} k={k} />}
      {part === "landlord" && <Landlord frame={frame} k={k} />}
      {part === "train" && <TrainShot frame={frame} t={k.t} />}
      {/* sounds, outside every Stage */}
      <TagSounds keys={tg.kid} />
      <TagSounds keys={tg.magician} />
      <TagSounds keys={tg.her} />
      <TagSounds keys={tg.him} />
      <TagSounds keys={tg.striker} volume={0.7} />
      <TagSounds keys={tg.thief} />
      <TagSounds keys={tg.still.map((x) => ({ ...x, at: k.dusk + 4 }))} volume={0.7} />
      <TagSounds keys={tg.you} />
      <TagSounds keys={tg.friend} />
      <TagSounds keys={coachSoundKeys(k.t)} volume={1.3} />
      <BoardSounds keys={bd.herTable} />
      <BoardSounds keys={bd.clock} />
      <BoardSounds keys={fareKeys(k.t)} />
    </AbsoluteFill>
  );
};

export const theCityPlays: Beat = { id: "theCityPlays", firstLine: 24, Component: Scene };
