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

/** Frames of the tape rewind that ends the cold open (the owner, 2026-11-17: "Tape rewind sound/shot at 0:18 just
 *  before the script"): the whole cold open runs backwards at speed, back to the hug, then the platform. timing.yaml's
 *  air after line 1 grew by the same 0.8 s, so the backs and the rival's grin keep their time. */
export const REWIND = 24;

/** The cold-open frame to show at `frame`: itself, or in the rewind, the cold open run backwards to its first frame. */
export function coldFrame(frame: number, end: number): number {
  const r0 = end - REWIND;
  if (frame < r0) return frame;
  const p = (frame - r0) / REWIND;
  return Math.max(0, Math.round(r0 * (1 - p * p * (3 - 2 * p)))); // eased: spins up, then slows into the stop
}

/** The rewind's look over the picture: tape tracking bands rolling up, a dimmer, flatter picture, and the rewind mark. */
export const ColdRewind: React.FC<{ frame: number; end: number }> = ({ frame, end: to }) => {
  const d = frame - (to - REWIND);
  if (d < 0 || frame >= to) return null;
  const bands = [0, 1, 2].map((i) => ((d * 47 + i * 360) % 1080) - 40);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "#1b1d2a", opacity: 0.22 }} />
      {bands.map((y, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, height: 26 + i * 10,
          background: "linear-gradient(#ffffff00, #f4efe2aa 40%, #ffffff55 60%, #ffffff00)" }} />
      ))}
      <div style={{ position: "absolute", left: 120, top: 150, color: "#fffaf0", fontFamily: "Inter, sans-serif",
        fontWeight: 800, fontSize: 64, letterSpacing: -6, textShadow: "0 3px 0 #0006" }}>◀◀</div>
    </AbsoluteFill>
  );
};

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
      <Sequence from={to - REWIND - 2} durationInFrames={27}><Audio src={staticFile("sfx/rewind.wav")} volume={0.55} /></Sequence>
    </>
  );
};

/** A white flash on each cut and into the platform, a few frames, over the picture. */
export const ColdFlash: React.FC<{ frame: number; cuts: Cut[]; end: number }> = ({ frame, cuts, end: to }) => {
  const marks = [...cuts.slice(1).filter((c) => !c.soft).map((c) => c.from), to];
  let a = 0;
  for (const m of marks) {
    const d = frame - m;
    if (d >= 0 && d < 8) a = Math.max(a, (m === to ? 0.5 : 0.55) * (1 - d / 8));
  }
  return a > 0 ? <AbsoluteFill style={{ background: "#fffaf0", opacity: a }} /> : null;
};
