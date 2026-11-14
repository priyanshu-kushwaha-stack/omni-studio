// Beat "The Loading Dock" (script.md v3, ## The Loading Dock; narration lines 117-127). The peak. Six o'clock at the
// depot: the shift walks out, your sister stops when she sees you at the foot of the steps; you climb them and say it to
// her face. Her card opens (soft snap) and runs to -68, the same. She holds on, and this time you hold her too. "Say it
// again..." (her own voice). "You do." Then the 9 s wordless peak, the film's longest moment: the card folds, snaps open
// again on the same number, and the camera drifts in on it, then on her hands on your back.
//
//   117  wide: the shift comes out of the shutters, she stops; you climb the steps; close on her: the card, -68.
//   118  close on you, the card in frame: "Minus sixty-eight. The same."
//   119  the two: the hug, and your arms come up round her.     120  close on her at your shoulder: "Say it again..."
//   121  close on you: "You do." (your mouth moves).
//   hold the 9 s peak, no words: the card folds; nothing; it snaps open and runs to -68 again (the lamps full on); a
//        slow drift in on the number (her shoulder shaking, a slow-motion ghost); then her hands on your back, and your
//        hands close on the back of the vest.
//   122  the two under the lamps: "The card gets two minutes."   123  close on you, the card in frame.
//   124  close on her; on "She was in it first" it dissolves to your letter on the fridge at home, and
//   125  your letter dissolves to hers in the same place, six years ago, fresh (a match cut); the memory widens.
//   126  the podium on paper (c08), in its own frame over the blurred, dimmed dock: medal-toned heads, bronze beams,
//        silver sours up at gold, bronze looks down at nothing; the camera goes to silver, then to bronze.
//   127  close on you: your eyes leave the card and settle on her; her hands on your back; wide under the lamps as the
//        second card folds; you don't move. (No foreground silhouette: outside review of v4.1.)
// The shift that walks out in 117 is in silhouette, behind and quickly gone (outside review of v4.1).
import { AbsoluteFill } from "remotion";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { Figure } from "@whatif/kit/rig/Figure";
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { headAt, Meter, MeterSound } from "../parts";
import { HOME, HomeBack } from "../sets/Home";
import { DOCK, dockLamps, LoadingDockBack, LoadingDockFront } from "../sets/LoadingDock";
import { camAt, current, JIYOON, lineEnd, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { ArmOver, hug, Sister, talk, useGlows, You, type Body, type Face } from "./HerBack.Sister";
import { LETTER_CAM, SnapMarks, YourLetter } from "./LoadingDock.Inserts";
import { Podium } from "./LoadingDock.Podium";

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i). */
function times(clips: Clip[], start: number, end: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const peak = lineEnd(clips, 121) + 2;
  const g = from(122) - peak;
  const inPeak = (p: number) => Math.round(peak + g * p);
  return {
    start,
    end,
    herOut: [start + 6, at(117, 0.3)] as const, // "Her shift ends": she walks out and stops
    sees: at(117, 0.3),
    steps: at(117, 0.36), // the steps shot
    climb: [at(117, 0.5), at(117, 0.8)] as const, // "You stand on the loading dock"
    face: at(117, 0.8), // "And you say it."
    sayIt: [at(117, 0.78), lineEnd(clips, 117)] as const,
    tag: at(117, 0.9),
    same: from(118) - 2, // "The same."
    hugShot: from(119) - 2, // "She holds on"
    hug: [from(119) - 4, at(119, 0.3)] as const,
    hold: [at(119, 0.6), at(119, 0.9)] as const, // "this time you don't go stiff"
    lamps: [at(119, 0.3), peak + 30] as const, // the sodium lamps flicker on
    her93: from(120) - 2, // "Say it again."
    again: [from(120), lineEnd(clips, 120)] as const,
    you94: from(121) - 2, // "You do."
    sayAgain: [from(121), lineEnd(clips, 121) + 4] as const,
    peak, // the 9 s wordless peak
    fold: inPeak(0.05), // the card folds
    tag2: inPeak(0.17), // and snaps open again
    drift: inPeak(0.3), // the slow drift in on the number
    peakB: inPeak(0.64), // her hands on your back
    grip: inPeak(0.8), // your hands close on the back of the vest
    two: from(122) - 2, // "The card gets two minutes. It doesn't get to choose what you do next."
    you123: from(123) - 2, // "You said nobody outside your lane bleeds."
    her96: from(124) - 2, // "She was never outside your lane."
    yours: at(124, 0.6), // "She was in it first.": dissolve to your letter on the fridge at home
    flash: from(125) - 2, // "Six years ago it was her letter on the fridge.": your letter dissolves to hers
    podium: from(126) - 2, // "At the 1992 Olympics"
    bronze: at(126, 0.21),
    silver: at(126, 0.41),
    silverThinks: at(126, 0.55),
    bronzeThinks: at(126, 0.79),
    ots: from(127) - 2, // "She's not watching you fail."
    down: at(127, 0.27), // "She's watching the life she handed you"
    close: at(127, 0.5), // "walk up the dock with the news"
    wide: at(127, 0.76), // "And she wants it in." The second card folds; you don't move.
    fold2: at(127, 0.84),
  };
}

// ------------------------------------------------------------------------------------------------ blocking

const S = 1.12;
const TOP = DOCK.top;
const YOU_X = DOCK.meet.you;
const HER_X = DOCK.meet.her;
const CARD = headAt(HER_X, TOP, S, STAND, -1);
/** The card's paper (Meter's geometry over CARD): its centre and size, for the snap marks. */
const CARD_H = CARD.r * 1.05;
const CARD_BOX = { x: CARD.x, y: CARD.y - CARD.r - CARD_H, w: CARD_H * 2.5, h: CARD_H };
const YOU_HEAD = headAt(YOU_X, TOP, S, STAND, 1);
const HER_HAND = { x: YOU_X - 22 * S, y: TOP - 196 * S };
const YOUR_HAND = { x: HER_X - 30 * S, y: TOP - 196 * S };

/** The feet line on the steps (a straight ramp, so the climb is smooth). */
const stepY = (x: number) => (x <= DOCK.steps.from ? DOCK.ground : x >= DOCK.steps.to ? TOP : mix(DOCK.ground, TOP, (x - DOCK.steps.from) / (DOCK.steps.to - DOCK.steps.from)));

/** The shift walking out of the bays and off along the dock to the right: dark silhouettes, smaller, quick, gone before
 *  she reaches you (outside review of v4.1: the passing worker drew the eye from the two of you). */
const Shift: React.FC<{ frame: number; k: T }> = ({ frame, k }) => (
  <g opacity={0.7}>
    {[0, 1, 2, 3].map((i) => {
      const bay = DOCK.bays[1 + (i % 2)];
      const t0 = k.start - 40 + i * 14;
      const p = linear(frame, t0, t0 + 150);
      if (p <= 0 || p >= 1) return null;
      const body = { x: bay.x + mix(40, 1000, p), y: TOP, scale: S * 0.86, facing: 1 as const, pose: walkPose(frame * 0.3 + i) };
      return <Figure key={i} head="#2c2838" coat="#2c2838" {...body} look={{ x: 1, y: 0 }} eyes={0} mouth="none" time={frame} />;
    })}
  </g>
);

/** Your body: at the foot of the steps, climbing, then on the dock in front of her. */
function yourBody(frame: number, k: T): Body {
  const p = ramp(frame, k.climb[0], k.climb[1]);
  const x = mix(DOCK.foot.x, YOU_X, p);
  return { x, y: stepY(x), scale: S, facing: 1, pose: p > 0 && p < 1 ? walkPose(frame * 0.3) : STAND };
}

/** Her body before the hug: walking out from the first bay and stopping. */
function herBody(frame: number, k: T): Body {
  const p = ramp(frame, k.herOut[0], k.herOut[1]);
  return { x: mix(1010, HER_X, p), y: TOP, scale: S, facing: -1, pose: p > 0 && p < 1 ? walkPose(frame * 0.25) : STAND };
}

/** The dock with the two of you, the shift, the card(s). `showYou` false for over-her-shoulder shots. */
const Dock: React.FC<{ frame: number; k: T; cam: Camera; you: Face; her: Face; showYou?: boolean }> = ({
  frame, k, cam, you, her, showYou = true,
}) => {
  const lamps = ramp(frame, k.lamps[0], k.lamps[1]);
  const look = useGlows(cam, dockLamps(lamps));
  const t = ramp(frame, k.hug[0], k.hug[1]);
  const hold = ramp(frame, k.hold[0], k.hold[1]);
  const inPeak = frame >= k.peak && frame < k.two;
  const squeeze = ramp(frame, k.grip, k.grip + 18);
  const shake = inPeak ? 2.6 : t > 0 ? 0.8 : 0;
  const h = hug({ youX: YOU_X, herX: HER_X, floor: TOP, scale: S, t, hold, squeeze, shake, frame });
  const sis = t > 0 ? h.her : herBody(frame, k);
  const yb = t > 0 ? h.you : yourBody(frame, k);
  const ghost = inPeak ? hug({ youX: YOU_X, herX: HER_X, floor: TOP, scale: S, t, hold, squeeze, shake, frame: frame - 5 }).her : null;
  const card1Until = k.fold;
  const actors = (
    <>
      <Shift frame={frame} k={k} />
      {ghost && <Sister body={ghost} face={her} frame={frame} duty="open" opacity={0.3} />}
      <Sister body={sis} face={her} frame={frame} duty="open" />
      {showYou && <You body={yb} face={you} frame={frame} />}
      {t > 0.05 && showYou && <ArmOver body={sis} hand={JIYOON.head} />}
      <Meter frame={frame} at={k.tag} x={CARD.x} headY={CARD.y} r={CARD.r} value={-68} until={card1Until} />
      <Meter frame={frame} at={k.tag2} x={CARD.x} headY={CARD.y} r={CARD.r} value={-68} until={k.fold2} />
      <SnapMarks frame={frame} at={k.tag2} {...CARD_BOX} />
    </>
  );
  return (
    <LookContext.Provider value={look}>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<LoadingDockBack cam={cam} frame={frame} lamps={lamps} dark={linear(frame, k.start, k.end) * 0.8} />}
        actors={actors} front={<LoadingDockFront cam={cam} lamps={lamps} />} />
    </LookContext.Provider>
  );
};

/** Six years ago: the fridge with her letter on it, fresh, and the brushes in the jar; warm and faded. */
const Memory: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.flash, LETTER_CAM(HOME.hers.x)], [k.flash + 24, LETTER_CAM(HOME.hers.x)], [k.podium, { x: 1300, y: 640, zoom: 2.3 }]]), frame, "dock-memory", 2);
  return (
    <AbsoluteFill style={{ filter: "sepia(0.55) saturate(0.85) brightness(1.06)" }}>
      <LookContext.Provider value={moodLook("morning")}>
        <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<HomeBack cam={cam} mood="morning" frame={frame} calendar={false} yours={null} hers="fresh" hour={6} />}
          actors={null} />
      </LookContext.Provider>
      <AbsoluteFill style={{ boxShadow: "inset 0 0 120px 30px rgba(243,233,215,0.6)" }} />
    </AbsoluteFill>
  );
};

/** The podium in its own frame: the dock behind it blurred and dimmed (the empty bays, not the two of you); the camera
 *  goes to silver on "Silver thinks", then to bronze on "Bronze thinks". */
const PodiumShot: React.FC<{ frame: number; k: T; you: Face; her: Face }> = ({ frame, k, you, her }) => {
  const behind = { x: 1560, y: 520, zoom: 1.3 };
  const cam = drift(camAt(frame, [[k.podium, { x: 960, y: 560, zoom: 1.0 }], [k.silverThinks - 4, { x: 950, y: 556, zoom: 1.05 }],
    [k.silverThinks + 12, { x: 780, y: 500, zoom: 1.3 }], [k.bronzeThinks - 4, { x: 790, y: 500, zoom: 1.33 }], [k.bronzeThinks + 12, { x: 1170, y: 600, zoom: 1.3 }],
    [k.ots, { x: 1120, y: 590, zoom: 1.24 }]]), frame, "dock-podium", 2);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: "blur(14px) brightness(0.5)" }}>
        <Dock frame={frame} k={k} cam={behind} you={you} her={her} />
      </AbsoluteFill>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={null}
        actors={
          <g transform="translate(960 545) scale(2.45) translate(-960 -545)">
            <Podium frame={frame} at={k.podium + 2} x={960} y={545} bronze={k.bronze} silver={k.silver} silverThinks={k.silverThinks} bronzeThinks={k.bronzeThinks} />
          </g>
        } />
    </AbsoluteFill>
  );
};

/** One shot over another fading in across `len` frames from `at` (a dissolve). */
const Dissolve: React.FC<{ frame: number; at: number; len: number; under: React.ReactNode; over: React.ReactNode }> = ({ frame, at, len, under, over }) =>
  frame >= at + len ? <>{over}</> : (
    <AbsoluteFill>
      {under}
      <AbsoluteFill style={{ opacity: ramp(frame, at, at + len) }}>{over}</AbsoluteFill>
    </AbsoluteFill>
  );

const DockShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.start, "wide"], [k.steps, "steps"], [k.face, "face"], [k.same, "same"], [k.hugShot, "hug"],
    [k.her93, "her93"], [k.you94, "you94"], [k.peak, "fold"], [k.drift, "peakA"], [k.peakB, "peakB"], [k.two, "two"],
    [k.you123, "you123"], [k.her96, "her96"], [k.yours, "yours"], [k.flash, "flash"], [k.podium, "podium"], [k.ots, "ots"],
    [k.close, "close"], [k.wide, "wideEnd"]]);
  const hugHead = headAt(HER_X, TOP, S, { ...STAND, lean: 22, drop: 14 }, -1);
  const cams: Record<Exclude<typeof shot, "flash" | "yours" | "podium">, Camera> = {
    wide: camAt(frame, [[k.start, { x: 900, y: 560, zoom: 1.0 }], [k.steps, { x: 860, y: 580, zoom: 1.08 }]]),
    steps: camAt(frame, [[k.steps, { x: 640, y: 680, zoom: 1.5 }], [k.face, { x: 700, y: 620, zoom: 1.65 }]]),
    face: camAt(frame, [[k.face, closeUp(CARD.x - 30, CARD.y - 30, 2.3)], [k.same, closeUp(CARD.x - 30, CARD.y - 40, 2.5)]]),
    same: camAt(frame, [[k.same, { x: (YOU_HEAD.x + CARD.x) / 2, y: YOU_HEAD.y - 50, zoom: 2.5 }], [k.hugShot, { x: (YOU_HEAD.x + CARD.x) / 2, y: YOU_HEAD.y - 50, zoom: 2.65 }]]),
    hug: camAt(frame, [[k.hugShot, { x: 800, y: 560, zoom: 1.7 }], [k.her93, { x: 800, y: 560, zoom: 1.85 }]]),
    her93: camAt(frame, [[k.her93, closeUp(hugHead.x, hugHead.y - 20, 2.9)], [k.you94, closeUp(hugHead.x, hugHead.y - 20, 3.1)]]),
    you94: camAt(frame, [[k.you94, closeUp(YOU_HEAD.x + 50, YOU_HEAD.y - 20, 2.7)], [k.peak, closeUp(YOU_HEAD.x + 50, YOU_HEAD.y - 20, 2.85)]]),
    fold: camAt(frame, [[k.peak, { x: CARD.x - 50, y: CARD.y - 40, zoom: 2.3 }], [k.drift, { x: CARD.x - 50, y: CARD.y - 50, zoom: 2.45 }]]),
    peakA: camAt(frame, [[k.drift, { x: CARD.x - 50, y: CARD.y - 50, zoom: 2.45 }], [k.peakB - 6, insert(CARD.x, CARD.y - 115, 3.9)]]),
    peakB: camAt(frame, [[k.peakB, insert(HER_HAND.x + 30, HER_HAND.y + 20, 3.6)], [k.two, insert(HER_HAND.x + 60, HER_HAND.y + 20, 4.1)]]),
    two: camAt(frame, [[k.two, { x: 830, y: 540, zoom: 1.4 }], [k.you123, { x: 820, y: 545, zoom: 1.5 }]]),
    you123: camAt(frame, [[k.you123, { x: YOU_HEAD.x + 70, y: YOU_HEAD.y - 50, zoom: 2.6 }], [k.her96, { x: YOU_HEAD.x + 70, y: YOU_HEAD.y - 50, zoom: 2.8 }]]),
    her96: camAt(frame, [[k.her96, closeUp(hugHead.x + 10, hugHead.y - 20, 3.0)], [k.flash, closeUp(hugHead.x + 10, hugHead.y - 20, 3.3)]]),
    ots: camAt(frame, [[k.ots, closeUp(YOU_HEAD.x + 40, YOU_HEAD.y - 40, 3.0)], [k.close, closeUp(YOU_HEAD.x + 30, YOU_HEAD.y - 30, 3.4)]]),
    close: camAt(frame, [[k.close, insert(HER_HAND.x + 40, HER_HAND.y + 10, 3.0)], [k.wide, insert(HER_HAND.x + 40, HER_HAND.y + 10, 3.3)]]),
    wideEnd: camAt(frame, [[k.wide, { x: 820, y: 560, zoom: 1.6 }], [k.end, { x: 900, y: 540, zoom: 1.05 }]]),
  };

  // You: looking up from the yard; saying it; eyes on the card; holding on; saying it again; eyes down to her.
  const you: Face = frame < k.climb[0]
    ? { brows: "worry", lids: 0.1, mouth: "flat", eyes: 1, look: { x: 0.8, y: -0.5 } }
    : frame < k.tag + 8
      ? { brows: "raised", lids: 0.05, mouth: talk(frame, k.sayIt[0], k.tag + 6, "smile"), eyes: 1.05, look: { x: 1, y: -0.05 } }
      : frame < k.hold[0]
        ? { brows: "worry", lids: 0.1, mouth: "flat", eyes: 1.1, look: { x: 0.6, y: -0.8 } }
        : frame < k.sayAgain[0]
          ? { brows: "worry", lids: 0.45, mouth: "smile", eyes: 1, look: { x: 0.8, y: -0.4 } }
          : frame < k.peak
            ? { brows: "raised", lids: 0.2, mouth: talk(frame, k.sayAgain[0], k.sayAgain[1], "smile"), eyes: 1.05, look: { x: 0.6, y: -0.8 } }
            : frame < k.down
              ? { brows: "worry", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.6, y: -0.85 } }
              : frame < k.wide
                ? { brows: "worry", lids: 0.55, mouth: "smile", eyes: 1, look: { x: 0.9, y: 0.6 } }
                : { brows: "sad", lids: 0.85, mouth: "smile", eyes: 1, look: { x: 0.9, y: 0.6 } };
  // Her: tired from the shift; she sees you; glad, and hurt; eyes shut in the hug, asking again; shaking at the peak.
  const her: Face = frame < k.sees
    ? { brows: "none", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 1, y: 0.2 } }
    : frame < k.climb[0]
      ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.9, y: 0.5 } }
      : frame < k.tag
        ? { brows: "raised", lids: 0.1, mouth: "smile", eyes: 1.1, look: { x: 1, y: 0.1 } }
        : frame < k.hug[0]
          ? { brows: "worry", lids: 0.2, mouth: "smile", eyes: 1.05, look: { x: 1, y: 0 } }
          : { brows: "worry", lids: 0.85, mouth: frame < k.peak ? talk(frame, k.again[0], k.again[1], "smile") : "wobble", eyes: 1, look: { x: 1, y: 0.3 } };
  const dock = (name: keyof typeof cams) => (
    <Dock frame={frame} k={k} cam={drift(cams[name], frame, "dock", name === "fold" || name === "peakA" || name === "peakB" ? 1.5 : 3)} you={you} her={her} />
  );
  // "She was in it first": the hug dissolves to your letter on the fridge at home, and yours to hers six years ago in
  // the same place (a match cut, outside review of v4.1).
  const yours = <YourLetter frame={frame} from={k.yours} to={k.flash + 12} />;
  if (shot === "yours") return <Dissolve frame={frame} at={k.yours} len={12} under={dock("her96")} over={yours} />;
  if (shot === "flash") return <Dissolve frame={frame} at={k.flash} len={14} under={yours} over={<Memory frame={frame} k={k} />} />;
  if (shot === "podium") return <PodiumShot frame={frame} k={k} you={you} her={her} />;
  return dock(shot);
};

const LoadingDock: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = times(shot.clips, shot.from, shot.to);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <DockShot frame={shot.frame} k={k} />
      <MeterSound at={k.tag} soft />
      <MeterSound at={k.tag2} soft volume={0.8} />
    </AbsoluteFill>
  );
};

export const loadingDock: Beat = { id: "LoadingDock", firstLine: 117, Component: LoadingDock };
