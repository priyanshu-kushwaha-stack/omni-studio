import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import type { Beat, Shot } from "../shared";
import { LaneScene } from "./LongRun.Lane";
import { QuickCuts } from "./LongRun.Cuts";
import { MotherScene } from "./LongRun.Mother";
import { Year40 } from "./LongRun.Year40";
import { Clocks } from "./LongRun.Clocks";
import { MirrorScene } from "./LongRun.Mirror";
import { beatPauses, beatTimes } from "./LongRun.parts";

/** Beat 5, the long run (scene_plan.md, lines 52 to 64): the bank daydream, the catch in the lane, three small
 *  saves, your mother on the stairs, forty years of one street, two paper clocks, and the mirror. */
const Sfx: React.FC<{ at: number; name: string; volume: number }> = ({ at, name, volume }) => (
  <Sequence from={at}><Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} /></Sequence>
);

const LongRun: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, cues, clips } = shot;
  const b = beatTimes(cues, clips);
  const scene =
    frame < b.cuts ? <LaneScene shot={shot} />
    : frame < b.mother ? <QuickCuts shot={shot} />
    : frame < b.year40 ? <MotherScene shot={shot} />
    : frame < b.clocks ? <Year40 shot={shot} />
    : frame < b.mirror ? <Clocks shot={shot} />
    : <MirrorScene shot={shot} />;
  return (
    <AbsoluteFill>
      {scene}
      <Sfx at={cues.vault} name="pop" volume={0.45} />
      <Sfx at={b.hit} name="whoosh" volume={0.25} />
      <Sfx at={cues.six_hit - 2} name="timestop" volume={0.4} />
      <Sfx at={cues.caught} name="resume" volume={0.4} />
      <Sfx at={b.bottleSnap - 1} name="timestop" volume={0.18} />
      <Sfx at={b.panSnap - 1} name="timestop" volume={0.18} />
      <Sfx at={cues.small - 1} name="timestop" volume={0.18} />
      <Sfx at={cues.clocks} name="flip" volume={0.5} />
    </AbsoluteFill>
  );
};

export const longRun: Beat = { id: "longRun", firstLine: 52, Component: LongRun, pauses: beatPauses };
