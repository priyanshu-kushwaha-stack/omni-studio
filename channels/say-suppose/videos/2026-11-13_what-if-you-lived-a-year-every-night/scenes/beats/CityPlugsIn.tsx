// Beat "The City Plugs In" (script.md, ## [03:25]; story lines 35-49): the "a lot happens" beat, a fast cut per use.
//   35   your boss sells coil after coil off the crate to a queue; every hatch in the hall flutters at once as the camera
//        pulls back; then the hotel's tiers, a thousand hatches blurring to one last click.
//   36   the exam hall: she writes calmly beside a year of revision stacked as a paper tower; the board's notice stamped
//        on the hall door.      37  close on her: "Define sleeping."
//   38   the operating room: the surgeon's hands flicker through ten thousand rehearsals; the door opens on the nurse
//        holding up the fresh scan; the hands stop.
//   39   the office at dawn: a report a foot thick drops on the desk; the boss behind glass doesn't look up from a thicker one.
//   40-42 the court: "Three nights." and the gavel; the prisoner's smirk; he walks out of a hatch grey-eyed and bows.
//   43-44 the wedding: the calm bride takes the bouncing groom's hand; "I do. Still."
//   45-47 the classroom: kids slumped like commuters; "Miss. We've done this." / "Sit down."
//   48   the silent morning train; the couple; the angry one; the calm one; the 3 s wordless hold.
//   49   pull back; the inside town filling up.
// Every cut uses its own set: the pod hall, the exam hall, the library sets for office, wedding, classroom and metro
// coach; the operating room and the court are drawn simply here.
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import type { Clip } from "@whatif/kit/timeline";
import { CounterSound } from "../parts";
import { current, type Beat, type Shot } from "../shared";
import { clock } from "./CityPlugsIn.Kit";
import { FlutterShot, ReleaseShot, SellShot, ThousandShot } from "./CityPlugsIn.Hall";
import { ClassShot, CourtShot, WeddingShot } from "./CityPlugsIn.Court";
import { FillingShot, TrainShot } from "./CityPlugsIn.Train";
import { ExamShot, NoticeShot, OfficeShot, SurgeonShot } from "./CityPlugsIn.Uses";

function times(clips: Clip[], start: number, endOfBeat: number) {
  const { from, end, at } = clock(clips);
  return {
    start, endOfBeat,
    flutter: at(35, 0.42), thousand: at(35, 0.7), click: end(35) + 4,
    exam: from(36) - 2, notice: at(36, 0.62), stamp: at(36, 0.75), define: from(37) - 2,
    surgeon: from(38) - 2, scan: at(38, 0.44), stop: at(38, 0.74),
    office: from(39) - 2, drop: from(39) + 12, cabin: at(39, 0.55),
    court: from(40) - 2, judge: from(41) - 2, strike: end(41) + 2, prisoner: from(42) - 2, release: at(42, 0.44), bow: at(42, 0.82),
    wedding: from(43) - 2, hand: at(43, 0.72), vow: from(44) - 2,
    klass: from(45) - 2, kid: from(46) - 2, teacher: from(47) - 2,
    train: from(48) - 2, couple: at(48, 0.38), angry: at(48, 0.62), calm: at(48, 0.8), hold: end(48) + 2, town: from(49), fill: at(49, 0.45),
  };
}

const CityPlugsIn: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = shot.frame;
  const k = times(shot.clips, shot.from, shot.to);
  const view = current(frame, [[0, "sell"], [k.flutter, "flutter"], [k.thousand, "thousand"], [k.exam, "exam"], [k.notice, "notice"], [k.define, "define"],
    [k.surgeon, "surgeon"], [k.office, "office"], [k.court, "court"], [k.release, "release"], [k.wedding, "wedding"], [k.klass, "class"],
    [k.train, "train"], [k.fill, "fill"]] as [number, string][]);
  const t = { start: k.train, couple: k.couple, angry: k.angry, calm: k.calm, hold: k.hold, town: k.town, fill: k.fill, end: k.endOfBeat };
  let picture: React.ReactNode = null;
  if (view === "sell") picture = <SellShot frame={frame} start={k.start} end={k.flutter} />;
  if (view === "flutter") picture = <FlutterShot frame={frame} start={k.flutter} end={k.thousand} />;
  if (view === "thousand") picture = <ThousandShot frame={frame} start={k.thousand} stop={k.click} end={k.exam} />;
  if (view === "exam") picture = <ExamShot frame={frame} start={k.exam} end={k.notice} />;
  if (view === "notice") picture = <NoticeShot frame={frame} start={k.notice} stamp={k.stamp} end={k.define} />;
  if (view === "define") picture = <ExamShot frame={frame} start={k.exam} define={k.define} end={k.surgeon} />;
  if (view === "surgeon") picture = <SurgeonShot frame={frame} start={k.surgeon} scan={k.scan} stop={k.stop} end={k.office} />;
  if (view === "office") picture = <OfficeShot frame={frame} start={k.office} drop={k.drop} cabin={k.cabin} end={k.court} />;
  if (view === "court") picture = <CourtShot frame={frame} start={k.court} judge={k.judge} strike={k.strike} prisoner={k.prisoner} end={k.release} />;
  if (view === "release") picture = <ReleaseShot frame={frame} start={k.release} bow={k.bow} end={k.wedding} />;
  if (view === "wedding") picture = <WeddingShot frame={frame} start={k.wedding} hand={k.hand} vow={k.vow} end={k.klass} />;
  if (view === "class") picture = <ClassShot frame={frame} start={k.klass} kid={k.kid} teacher={k.teacher} end={k.train} />;
  if (view === "train") picture = <TrainShot frame={frame} k={t} />;
  if (view === "fill") picture = <FillingShot frame={frame} k={t} />;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      <CounterSound at={k.flutter} volume={0.6} />
      <CounterSound at={k.click - 36} volume={0.9} />
      {[k.stamp, k.drop, k.strike].map((at, i) => (
        <Sequence key={i} from={at} durationInFrames={12}><Audio src={staticFile("sfx/snap.wav")} volume={0.6} /></Sequence>
      ))}
      <Sequence from={k.release + 2} durationInFrames={20}><Audio src={staticFile("sfx/hatch.wav")} volume={0.6} /></Sequence>
    </AbsoluteFill>
  );
};

export const cityPlugsIn: Beat = { id: "CityPlugsIn", firstLine: 35, Component: CityPlugsIn };
