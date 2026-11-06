import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Timeline } from "@whatif/kit/timeline";
import { Bedroom } from "./scenes/Bedroom";
import { Hallway } from "./scenes/Hallway";
import { Kitchen } from "./scenes/Kitchen";
import { makeShot } from "./scenes/shared";
import { Street } from "./scenes/Street";
import { Finish } from "@whatif/kit/stage/Stage";
import type { Pause } from "@whatif/kit/world/clock";

export type VideoProps = { timeline: Timeline };

export function pausesFor({ cues, clips, totalFrames }: Timeline): Pause[] {
  return [
    { from: cues.teasePause, to: clips[2].from - 2 },
    { from: cues.catch, to: cues.coffee + 16 },
    { from: cues.dodge + 3, to: cues.hallway + 14 },
    { from: cues.pause, to: totalFrames + 60 },
  ];
}

const Sfx: React.FC<{ at: number; name: string; volume?: number }> = ({ at, name, volume = 1 }) => (
  <Sequence from={Math.max(0, at)}><Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} /></Sequence>
);

const SoundDesign: React.FC<{ timeline: Timeline; pauses: Pause[] }> = ({ timeline, pauses }) => {
  const { cues, clips } = timeline;
  const blackout = clips[12].from + clips[12].frames + 9;
  const streetFrom = clips[5].from;
  return (
    <>
      <Audio src={staticFile("sfx/pad.wav")} volume={(f) => (f < blackout ? 0.34 : 0)} />
      <Sequence from={streetFrom} durationInFrames={cues.pause - streetFrom + 4}>
        <Audio src={staticFile("sfx/street.wav")} volume={0.42} />
      </Sequence>
      <Sequence from={cues.bus - 6} durationInFrames={cues.pause - cues.bus + 10}>
        <Audio src={staticFile("sfx/bus.wav")} volume={0.75} />
      </Sequence>
      <Sfx at={cues.teasePause - 3} name="timestop" volume={0.45} />
      <Sfx at={pauses[0].to - 13} name="resume" volume={0.3} />
      <Sfx at={cues.ten} name="flip" volume={0.7} />
      <Sfx at={cues.once} name="pop" volume={0.5} />
      <Sfx at={cues.catch - 3} name="timestop" volume={0.45} />
      <Sfx at={cues.coffee} name="clink" volume={0.65} />
      <Sfx at={pauses[1].to - 13} name="resume" volume={0.3} />
      <Sfx at={cues.dodge} name="timestop" volume={0.4} />
      <Sfx at={pauses[2].to - 13} name="resume" volume={0.3} />
      <Sfx at={pauses[2].to + 6} name="pop" volume={0.4} />
      <Sfx at={cues.day12} name="pop" volume={0.45} />
      <Sfx at={cues.bus - 12} name="whoosh" volume={0.4} />
      <Sfx at={cues.kid - 8} name="whoosh" volume={0.5} />
      <Sfx at={cues.pause - 5} name="timestop" volume={0.85} />
      <Sfx at={cues.run} name="whoosh" volume={0.35} />
      {[cues.nine, cues.eight, cues.seven, cues.seven + 56, cues.seven + 112, cues.seven + 168, cues.seven + 224]
        .filter((f) => f < cues.looking)
        .map((f) => <Sfx key={f} at={f} name="flip" volume={0.8} />)}
      <Sfx at={cues.you + 2} name="sting" volume={0.9} />
    </>
  );
};

export const Video: React.FC<VideoProps> = ({ timeline }) => {
  const frame = useCurrentFrame();
  const pauses = pausesFor(timeline);
  const shot = makeShot(frame, timeline, pauses);
  const { clips } = timeline;
  const blackout = clips[12].from + clips[12].frames + 9;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {frame < clips[2].from && <Bedroom shot={shot} />}
      {frame >= clips[2].from && frame < clips[4].from && <Kitchen shot={shot} />}
      {frame >= clips[4].from && frame < clips[5].from && <Hallway shot={shot} />}
      {frame >= clips[5].from && frame < blackout && <Street shot={shot} />}
      {frame < blackout && <Finish />}
      {clips.map((c) => (
        <Sequence key={c.file} from={c.from} durationInFrames={c.frames}>
          <Audio src={staticFile(c.file)} />
        </Sequence>
      ))}
      <SoundDesign timeline={timeline} pauses={pauses} />
    </AbsoluteFill>
  );
};
