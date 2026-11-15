/** The cold open (G2 round 18, 2026-11-14; the owner: "lets plan and fix the opening"). The room's story editor, two
 *  rounds running: the first seven seconds must show the thumbnail's frame, and the title question and the stakes must
 *  land by 0:30. So the film opens on the hug at ten at night with minus eighty-four landing about three seconds in,
 *  plays the title question over it, then three flashes of what is coming under the stakes line (the class's cards,
 *  the street of a thousand, the hundred backs), and cuts on white to the approved platform skit.
 *
 *  Nothing is drawn twice: each moment is the later beat itself, played at a source frame. story.json's first COLD
 *  lines are the cold open's; the beats keep counting lines from the platform, so they get the clips after them. */
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import type { Clip } from "@whatif/kit/timeline";
import { MeterSound } from "./parts";

/** How many story.json lines the cold open speaks before the platform. */
export const COLD = 3;

const at = (clips: Clip[], i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
const end = (clips: Clip[], i: number) => clips[i].from + clips[i].frames;

/** A cut of the cold open: from frame `from` of the film it plays the later film from `src` on, in real time. A `soft`
 *  cut is a plain cut inside the hug (no white flash, no snap). */
type Cut = { from: number; src: number; soft?: boolean };

/** Frames of the thumbnail's wide before the cut into the two-shot. */
const WIDE = 24;

/** The cuts, from the film's clips (`all`, with the cold open's lines) and the beats' clips (`clips`, without them). */
export function coldCuts(all: Clip[], clips: Clip[]): Cut[] {
  const words = (i: number, p: number) => at(all, i, p);
  // the hug (beats' line 3, "Ten at night ... your best friend"): the thumbnail's two-shot first (outside review v6),
  // then the bubble (0.84 of the line) and the card (0.9) under the title question, which starts about 0.6 s in
  // (final_edit qc: the first word within 1 s)
  const bubble = at(clips, 3, 0.84);
  return [
    { from: 0, src: at(clips, 3, 0.42) }, // the thumbnail's frame
    { from: WIDE, src: bubble - 6, soft: true }, // "I made it." at about 1 s; -84 locked by about 2 s
    { from: words(1, 0), src: at(clips, 54, 0.52) }, // "Six weeks before the big exam": the class under its cards
    { from: words(1, 0.3), src: end(clips, 69) + 4 }, // "A card that shows you who's really racing you": the thousand
    { from: words(1, 0.58), src: at(clips, 88, 0.46) }, // "... a hundred chairs turn their backs on you": the wave, Tae-ho last, the backs
  ];
}

/** The later film's frame shown at cold-open frame `frame`. */
export function coldSource(frame: number, cuts: Cut[]): number {
  let cut = cuts[0];
  for (const c of cuts) if (frame >= c.from) cut = c;
  return cut.src + (frame - cut.from);
}

/** The cold-open frame the card snaps over him. */
export function coldSnap(clips: Clip[]): number {
  return WIDE + at(clips, 3, 0.9) - (at(clips, 3, 0.84) - 6);
}

/** The cold open's own sounds (the beats' sounds play only at their own frames): the card's snap over him, a soft snap
 *  under each flash, and the white flash into the platform. */
export const ColdSound: React.FC<{ cuts: Cut[]; end: number; snap: number }> = ({ cuts, end: to, snap }) => {
  const flashes = cuts.filter((c, i) => i > 0 && !c.soft);
  return (
    <>
      <MeterSound at={snap} />
      <MeterSound at={flashes[0].from + 10} soft volume={0.6} />
      <MeterSound at={flashes[1].from + 2} soft volume={0.7} />
      <Sequence from={to - 4} durationInFrames={16}><Audio src={staticFile("sfx/flutter.wav")} volume={0.4} /></Sequence>
    </>
  );
};

/** A white flash on each cut and into the platform, a few frames, over the picture. */
export const ColdFlash: React.FC<{ frame: number; cuts: Cut[]; end: number }> = ({ frame, cuts, end: to }) => {
  const marks = [...cuts.slice(1).filter((c) => !c.soft).map((c) => c.from), to];
  let a = 0;
  for (const m of marks) {
    const d = frame - m;
    if (d >= 0 && d < 8) a = Math.max(a, (m === to ? 0.95 : 0.55) * (1 - d / 8));
  }
  return a > 0 ? <AbsoluteFill style={{ background: "#fffaf0", opacity: a }} /> : null;
};
