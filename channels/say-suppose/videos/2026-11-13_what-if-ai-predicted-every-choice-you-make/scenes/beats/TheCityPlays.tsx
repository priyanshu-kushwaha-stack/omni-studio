// Beat "The City Plays" (script.md v2, ## [02:54] The City Plays; narration lines 33-49, mood day). You use the tags
// on a stranger, then the whole city copies you and it backfires on everyone.
//
//   33-34  the metro platform (metroPlatform): the hood behind the woman's bag, TAKES WALLET 97% buzzing crimson; the
//          hold: you reach past her and tug her bag to her far side before his hand moves; she turns, startled; he steps
//          back, hands open and empty; every head turns; "I didn't touch it." (his voice)
//   35     "Call the police?": his open, empty hands under the card; you, palms up; his card close
//   36     every head turned anyway; the doors shut on him; the coffee seller turns her back; the card close; the
//          platform stepping away; dusk: STANDS STILL 99% teal, against a pillar, a woman asleep beside him with her bag
//   37-39  the kid and the man, rock-paper-scissors: rock wins, fist up; ROCK AGAIN 83%; the man reads it, paper, paper;
//          the cap off in his hand; "No fair." (his voice); cap back on, rock AGAIN, paper again
//   40-41  the street: the magician's fan, PALMS THE QUEEN 99%; "Pick a card." (his voice); the crowd walks; the fan
//          goes down
//   42     the court's television: KICKS LEFT 91%, the keeper diving left before the kick, the save
//   43     the betting shop window: the bookie reads the match, the odds board clatters to a line of 1.00
//   44     three strikers, three KICKS LEFT cards, three saves; the 0-0 scoreboard
//   45     the newsreader on the television over a league table of nils: "Another nil-nil."
//   46-47  you on the platform, TAKES THE SIX-TEN 98%; the paper map, the route worn thick, 93; the train, 6:10, tick
//   48-49  the forty-phone train (TheCityPlays.Train): LOOKS AT PHONE 99% forty times, the fare board 2.10 to 1.80, and
//          the stranger at the far end with no phone and no card
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { BoardSounds, TagSounds } from "../device";
import { current, type Beat, type Shot as ShotT } from "../shared";
import { BettingShop } from "./TheCityPlays.Bookie";
import { CoffeeBack, Doors, Pickpocket, Police, RPS, SixTen, StandsStill, Verdict } from "./TheCityPlays.Platform";
import { Magician, PenaltyTv } from "./TheCityPlays.Town";
import { coachSoundKeys, fareKeys, TrainShot } from "./TheCityPlays.Train";
import { boards, tags, times } from "./TheCityPlays.Times";

const Scene: React.FC<{ shot: ShotT }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const tg = tags(k);
  const bd = boards(k);
  const part = current(frame, [
    [0, "pickpocket"], [k.police, "police"], [k.anyway, "pickpocket"], [k.doors, "doors"], [k.coffee, "coffee"], [k.verdict, "verdict"],
    [k.dusk, "still"], [k.start, "rps"], [k.magician, "magician"], [k.tv, "tv"], [k.bet, "bet"], [k.row, "tv"], [k.sixTen, "sixTen"],
    [k.t.train, "train"],
  ]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {part === "pickpocket" && <Pickpocket frame={frame} k={k} />}
      {part === "police" && <Police frame={frame} k={k} />}
      {part === "doors" && <Doors frame={frame} k={k} />}
      {part === "coffee" && <CoffeeBack frame={frame} k={k} />}
      {part === "verdict" && <Verdict frame={frame} k={k} />}
      {part === "still" && <StandsStill frame={frame} k={k} />}
      {part === "rps" && <RPS frame={frame} k={k} />}
      {part === "magician" && <Magician frame={frame} k={k} />}
      {part === "tv" && <PenaltyTv frame={frame} k={k} />}
      {part === "bet" && <BettingShop frame={frame} k={k} />}
      {part === "sixTen" && <SixTen frame={frame} k={k} />}
      {part === "train" && <TrainShot frame={frame} t={k.t} />}
      {/* sounds, outside every Stage */}
      <TagSounds keys={tg.thief} />
      <TagSounds keys={tg.still.map((x) => ({ ...x, at: k.dusk + 4 }))} volume={0.7} />
      <TagSounds keys={tg.kid} />
      <TagSounds keys={tg.magician} />
      <TagSounds keys={tg.striker} volume={0.7} />
      {[0, 1, 2].map((i) => (
        <TagSounds key={i} volume={0.5} keys={[{ at: k.row + 6 + i * 9 - 8, text: "KICKS LEFT", pct: 91, state: "new" }, { at: k.row + 6 + i * 9 + 8, text: "KICKS LEFT", pct: 91, state: "tick" }]} />
      ))}
      <TagSounds keys={tg.you} />
      <Sequence from={k.doors} durationInFrames={40}><Audio src={staticFile("sfx/hiss.wav")} volume={0.55} /></Sequence>
      <TagSounds keys={coachSoundKeys(k.t)} volume={1.3} />
      {bd.odds.map((keys, i) => <BoardSounds key={i} keys={keys} volume={0.7} />)}
      <BoardSounds keys={bd.clock} />
      <BoardSounds keys={fareKeys(k.t)} />
    </AbsoluteFill>
  );
};

export const theCityPlays: Beat = { id: "theCityPlays", firstLine: 33, Component: Scene };
