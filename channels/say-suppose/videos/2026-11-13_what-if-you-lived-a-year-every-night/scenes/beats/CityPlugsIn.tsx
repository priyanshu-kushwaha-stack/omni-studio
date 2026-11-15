// Beat "The City Plugs In" (script.md v7, ## [03:52]; story lines 32-48): the ladder that climbs, a fast cut per use.
//   32   your boss sells every coil off the crate before dawn; the hotel's tiers, a thousand hatches blurring in a storm
//        of crimson cards to one last click on 365; the queue from the hotel door down the street, round the corner and
//        up the quay road to the harbour cranes, the old sleeper at its head.
//   33   one student: the exam, a year of revision stacked behind her as a paper tower; the board's notice stamped on
//        the hall door.      34  close on her: "Define sleeping."
//   35   one surgeon: hands flickering through ten thousand rehearsals, lids heavy; the nurse waiting behind the door's
//        window.   36  the door slides, "New scan."   37  the deadpan double take, "Newer than what?"
//   38   every office: a report a foot thick drops on the desk; the boss doesn't look up from a thicker one; the
//        worker deflates on "nobody's impressed".
//   39-41 every school: forty-year-olds in uniform (grey temples, a moustache, glasses, a newspaper); "Miss. We've done
//        this." as he half rises; "Sit down." and he sinks.
//   42-43 every wedding: four quick aisles, every bride the same calm walk; "I do. Still."
//   44-46 the courts: "Three nights." and the gavel; the smirk; he walks out of a hatch grey-eyed and bows, dives back
//        in, is pulled out by the ankles by a guard, and does the bladder hop.
//   47   the silent morning train for comedy, and the 3 s hold (the page, the heart, the jaw, the watch, the lids).
//   48   the inside town from above, filling up.
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { CounterSound } from "../parts";
import { current, lineEnd, type Beat, type Shot } from "../shared";
import { AboveShot } from "./CityPlugsIn.Above";
import { ClassShot, CourtShot, WeddingShot } from "./CityPlugsIn.Court";
import { SellShot, ThousandShot } from "./CityPlugsIn.Hall";
import { clock, phrase } from "./CityPlugsIn.Kit";
import { QueueShot } from "./CityPlugsIn.Queue";
import { ReleaseShot } from "./CityPlugsIn.Release";
import { TrainShot } from "./CityPlugsIn.Train";
import { ExamShot, NoticeShot, OfficeShot, SurgeonShot } from "./CityPlugsIn.Uses";

function times(shot: Shot) {
  const { from, at } = clock(shot.clips);
  const p = (i: number, text: string, nudge = 0) => phrase(shot, i, text, nudge);
  const stop = p(32, "and your hotel");
  const release = p(46, "He walks out", -4);
  return {
    start: shot.from, endOfBeat: shot.to,
    thousand: p(32, "By the end of the week", -4), stop, queue: stop + 12,
    exam: from(33) - 2, notice: p(33, "Next morning"), stamp: p(33, "bans", 4), define: from(34) - 2,
    surgeon: from(35) - 2, door: p(35, "and the scan waiting"), nurse: from(36), take: from(36) + 4,
    office: from(38) - 2, drop: from(38) + 12, cabin: p(38, "Every boss"), meh: p(38, "and nobody"),
    klass: from(39) - 2, grown: p(39, "forty-year-olds", -6), kid: from(40) - 2, teacher: from(41) - 2,
    wedding: from(42) - 2, cut1: at(42, 0.13), cut2: at(42, 0.26), main: at(42, 0.38), hand: at(42, 0.82), vow: from(43) - 2,
    court: from(44) - 2, judge: from(45) - 2, strike: lineEnd(shot.clips, 45) + 2, prisoner: from(46) - 2,
    release, bow: p(46, "and thanks the court"), climb: p(46, "He asks to stay"), guard: p(46, "Nobody gets"), pull: p(46, "The alarm"),
    bladder: p(46, "So is his bladder"),
    train: from(47) - 2, smug: p(47, "Every face"), books: p(47, "Nobody on a phone"), couple: p(47, "Two people"), angry: p(47, "Only one"),
    calm: p(47, "The other forgave"), book: p(47, "has written a book"), hold: lineEnd(shot.clips, 47) + 2, above: from(48),
  };
}

const CityPlugsIn: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = shot.frame;
  const k = times(shot);
  const view = current(frame, [[0, "sell"], [k.thousand, "thousand"], [k.queue, "queue"], [k.exam, "exam"], [k.notice, "notice"], [k.define, "define"],
    [k.surgeon, "surgeon"], [k.office, "office"], [k.klass, "class"], [k.wedding, "wedding"], [k.court, "court"], [k.release, "release"],
    [k.train, "train"], [k.above, "above"]] as [number, string][]);
  let picture: React.ReactNode = null;
  if (view === "sell") picture = <SellShot frame={frame} start={k.start} end={k.thousand} />;
  if (view === "thousand") picture = <ThousandShot frame={frame} start={k.thousand} stop={k.stop} end={k.queue} />;
  if (view === "queue") picture = <QueueShot frame={frame} start={k.queue} end={k.exam} />;
  if (view === "exam") picture = <ExamShot frame={frame} start={k.exam} end={k.notice} />;
  if (view === "notice") picture = <NoticeShot frame={frame} start={k.notice} stamp={k.stamp} end={k.define} />;
  if (view === "define") picture = <ExamShot frame={frame} start={k.exam} define={k.define} end={k.surgeon} />;
  if (view === "surgeon") picture = <SurgeonShot frame={frame} k={{ start: k.surgeon, door: k.door, nurse: k.nurse, take: k.take, end: k.office }} />;
  if (view === "office") picture = <OfficeShot frame={frame} start={k.office} drop={k.drop} cabin={k.cabin} meh={k.meh} end={k.klass} />;
  if (view === "class") picture = <ClassShot frame={frame} start={k.klass} grown={k.grown} kid={k.kid} teacher={k.teacher} end={k.wedding} />;
  if (view === "wedding") picture = <WeddingShot frame={frame} k={{ start: k.wedding, cuts: [k.wedding, k.cut1, k.cut2], main: k.main, hand: k.hand, vow: k.vow, end: k.court }} />;
  if (view === "court") picture = <CourtShot frame={frame} start={k.court} judge={k.judge} strike={k.strike} prisoner={k.prisoner} end={k.release} />;
  if (view === "release") picture = <ReleaseShot frame={frame} k={{ start: k.release, bow: k.bow, climb: k.climb, guard: k.guard, pull: k.pull, bladder: k.bladder, end: k.train }} />;
  if (view === "train") picture = <TrainShot frame={frame} k={{ start: k.train, smug: k.smug, books: k.books, couple: k.couple, angry: k.angry, calm: k.calm, book: k.book, hold: k.hold, end: k.above }} />;
  if (view === "above") picture = <AboveShot frame={frame} start={k.above} end={k.endOfBeat} />;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      <CounterSound at={k.thousand + 4} volume={0.6} />
      <CounterSound at={k.stop - 36} volume={0.9} />
      {[k.stamp, k.drop, k.strike, k.pull + 12].map((at, i) => (
        <Sequence key={i} from={at} durationInFrames={12}><Audio src={staticFile("sfx/snap.wav")} volume={0.6} /></Sequence>
      ))}
      <Sequence from={k.release + 2} durationInFrames={20}><Audio src={staticFile("sfx/hatch.wav")} volume={0.6} /></Sequence>
      <Sequence from={k.climb + 14} durationInFrames={20}><Audio src={staticFile("sfx/hatch.wav")} volume={0.4} /></Sequence>
    </AbsoluteFill>
  );
};

export const cityPlugsIn: Beat = { id: "CityPlugsIn", firstLine: 32, Component: CityPlugsIn };
