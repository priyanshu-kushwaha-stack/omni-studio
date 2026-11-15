// Beat "Staff Last" (script.md v7, ## [05:40]; story lines 49-57): the catch.
//   49-50 the lobby desk: a traveller fans nine flags; you hold up four fingers, proud; "Only four?"; they fold.
//   51    the boss upends the empty crate (the head start lasted as long as the crate); his price card becomes a column
//         of drawings, a coin, a car, a flat, a street, each crossed out for the next; he looks up at your three coils.
//   52    "Staff last." and the 3 s hold: two coils, the hand stays out, the third; hook, padlock, pat.
//   53    you juggling three mugs, deadpan; your flatmate walks past with her mop, yawning, not looking.
//   54    trapped: the way out, your old hatch with the taped-over socket under it, the hook he polishes, his wave.
//   55-56 the nap, a fortnight of inside sky in an inset, the opera pouring out; "No naps." and the tag on your chair.
//   57    the hall wide from your chair: a thousand portholes, you alone with the kettle and the rota.
// The plants for the next beats (the desk lamp, the kettle and its lead, the taped-over spare socket under your old
// hatch) are in StaffLast.Set and on screen throughout.
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Tag } from "@whatif/kit/ui/Tag";
import { current, lineEnd, type Beat, type Shot } from "../shared";
import { clock, phrase } from "./CityPlugsIn.Kit";
import { SumsShot, TravellerShot } from "./StaffLast.Desk";
import { HandoverShot, JuggleShot, TrappedShot } from "./StaffLast.Hook";
import { NapShot, WideShot } from "./StaffLast.Night";

function times(shot: Shot) {
  const { from, at } = clock(shot.clips);
  const end = (i: number) => lineEnd(shot.clips, i);
  const p = (i: number, text: string, nudge = 0) => phrase(shot, i, text, nudge);
  const hold = end(52) + 2;
  return {
    start: shot.from, endOfBeat: shot.to,
    nine: p(49, "nine", 2), four: end(49) + 2, only: from(50), fold: end(50) + 4,
    sums: from(51) + 44, card: p(51, "And your boss"), coin: p(51, "doing sums", 6), car: p(51, "a car"), flat: p(51, "Then a flat"), street: p(51, "Then a street"),
    look: end(51) - 6,
    staff: from(52) - 2, hold, juggle: from(53) - 2, mate: p(53, "Out here", -8),
    trapped: from(54) - 2, hatch: p(54, "Then you lose"), cables: p(54, "He has the only"), padlocked: p(54, "padlocked"),
    nap: from(55) - 2, inset: p(55, "A twenty"), wake: p(55, "You wake up"), boss: from(56) - 10, slap: at(56, 0.75),
    wide: from(57) - 2, rota: p(57, "You're doing"),
  };
}

const StaffLast: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = shot.frame;
  const k = times(shot);
  const view = current(frame, [[0, "traveller"], [k.sums, "sums"], [k.staff, "handover"], [k.juggle, "juggle"], [k.trapped, "trapped"],
    [k.nap, "nap"], [k.wide, "wide"]] as [number, string][]);
  let picture: React.ReactNode = null;
  if (view === "traveller") picture = <TravellerShot frame={frame} k={{ start: k.start, nine: k.nine, four: k.four, only: k.only, fold: k.fold, end: k.sums }} />;
  if (view === "sums") picture = <SumsShot frame={frame} k={{ start: k.sums, card: k.card, coin: k.coin, car: k.car, flat: k.flat, street: k.street, look: k.look, end: k.staff }} />;
  if (view === "handover") picture = <HandoverShot frame={frame} staff={k.staff} hold={k.hold} end={k.juggle} />;
  if (view === "juggle") picture = <JuggleShot frame={frame} start={k.juggle} mate={k.mate} end={k.trapped} />;
  if (view === "trapped") picture = <TrappedShot frame={frame} k={{ start: k.trapped, hatch: k.hatch, cables: k.cables, padlocked: k.padlocked, end: k.nap }} />;
  if (view === "nap") picture = <NapShot frame={frame} k={{ start: k.nap, inset: k.inset, wake: k.wake, boss: k.boss, slap: k.slap, end: k.wide }} />;
  if (view === "wide") picture = <WideShot frame={frame} start={k.wide} rota={k.rota} end={k.endOfBeat} />;
  const snapAt = k.hold + Math.round((k.juggle - k.hold) * 0.78);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      {frame >= k.slap && frame < k.wide + 45 && <Tag at={k.slap + 2} text="NO NAPS" x={120} y={90} size={64} />}
      {[k.sums + 30, snapAt, k.slap].map((at, i) => (
        <Sequence key={i} from={at} durationInFrames={12}><Audio src={staticFile("sfx/snap.wav")} volume={i === 2 ? 0.8 : 0.6} /></Sequence>
      ))}
      {[k.car, k.flat, k.street].map((at, i) => (
        <Sequence key={`c${i}`} from={at} durationInFrames={8}><Audio src={staticFile("sfx/click.wav")} volume={0.4} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const staffLast: Beat = { id: "StaffLast", firstLine: 49, Component: StaffLast };
