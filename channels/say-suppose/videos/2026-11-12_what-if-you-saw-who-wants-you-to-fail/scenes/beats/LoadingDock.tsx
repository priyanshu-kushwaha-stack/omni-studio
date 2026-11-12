// Beat "The Loading Dock" (script.md, ## [07:44] The Loading Dock; narration lines 102-112). The peak. Six o'clock at
// the depot: the shift walks out, Ji-yoon stops when she sees you at the foot of the steps; you climb them and say it
// to her face. Her card opens (soft snap) and runs to -68, the same. She holds on, and this time you hold her too. "Say
// it again." You do: the card folds and snaps open again on the same number. Then the 9 s wordless peak.
//
//   102  wide: the shift comes out of the shutters, she stops; you climb the steps; close on her: the card, -68.
//   103  close on you, the card in frame: "The same."
//   104  the two: the hug, and your arms come up round her.        105  close on her at your shoulder: "Say it again."
//   106  close on you saying it; the card folds, the sodium lamps come full on, the card snaps open: -68 again.
//   hold the 9 s peak, no words: a slow drift in on the number (her shoulder shaking, a slow-motion ghost); then her
//        hands on your back, your grip closing on the vest.
//   107  the two under the lamps.     108  close on her.     109  memory: the fridge six years ago, her letter, fresh.
//   110  the podium on paper (c08): bronze smiles, silver frowns up at gold, bronze looks down at nothing.
//   111  over her shoulder on your face: eyes on the card, then down to her; your hands close on the vest.
//   112  the card; her arms; wide under the lamps as the second card folds; you don't move.
import { AbsoluteFill } from "remotion";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { Figure } from "@whatif/kit/rig/Figure";
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, ForegroundHead, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { headAt, Meter, MeterSound, Vest } from "../parts";
import { HomeBack } from "../sets/Home";
import { DOCK, dockLamps, LoadingDockBack, LoadingDockFront } from "../sets/LoadingDock";
import { camAt, current, JIYOON, lineEnd, linear, mix, PASTELS, ramp, type Beat, type Shot } from "../shared";
import { ArmOver, hug, Sister, talk, useGlows, You, type Body, type Face } from "./HerBack.Sister";
import { Podium } from "./LoadingDock.Podium";

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i). */
function times(clips: Clip[], start: number, end: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const peak = lineEnd(clips, 106) + 2;
  return {
    start,
    end,
    herOut: [start + 6, at(102, 0.3)] as const, // "Her shift ends": she walks out and stops
    sees: at(102, 0.3),
    steps: at(102, 0.36), // the steps shot
    climb: [at(102, 0.5), at(102, 0.8)] as const, // "You stand on the dock"
    face: at(102, 0.8), // "And you say it."
    sayIt: [at(102, 0.78), lineEnd(clips, 102)] as const,
    tag: at(102, 0.9),
    same: from(103) - 2, // "The same."
    hugShot: from(104) - 2, // "She holds on"
    hug: [from(104) - 4, at(104, 0.3)] as const,
    hold: [at(104, 0.6), at(104, 0.9)] as const, // "this time you don't go stiff"
    lamps: [at(104, 0.4), at(106, 0.5)] as const, // the sodium lamps flicker on
    her105: from(105) - 2, // "Say it again."
    again: [from(105), lineEnd(clips, 105)] as const,
    you106: from(106) - 2, // "You say it again."
    sayAgain: [from(106), at(106, 0.25)] as const,
    foldShot: at(106, 0.3), // "The flaps fold at sixty seconds."
    fold: at(106, 0.4),
    tag2: at(106, 0.84), // "And snap open."
    peak, // the 9 s wordless peak: drift in on the number
    peakB: Math.round(mix(peak, from(107), 0.5)), // her hands on your back
    grip: Math.round(mix(peak, from(107), 0.78)),
    two: from(107) - 2, // "You said nobody outside your lane bleeds."
    her108: from(108) - 2, // "She was never outside your lane."
    flash: from(109) - 2, // "Six years ago it was her letter on the fridge."
    podium: from(110) - 2, // "At the 1992 Olympics"
    bronze: at(110, 0.21),
    silver: at(110, 0.41),
    silverThinks: at(110, 0.55),
    bronzeThinks: at(110, 0.79),
    ots: from(111) - 2, // "She's not watching you fail."
    down: at(111, 0.27), // "She's watching the life she handed you"
    vest: at(111, 0.6), // "walk up the dock with the news"
    close: at(111, 0.68),
    card3: from(112) - 2, // "The same number"
    arms: at(112, 0.25), // "the same arms"
    wide: at(112, 0.52), // "you hold on through the second sixty"
    fold2: at(112, 0.8),
  };
}

// ------------------------------------------------------------------------------------------------ blocking

const S = 1.12;
const TOP = DOCK.top;
const YOU_X = DOCK.meet.you;
const HER_X = DOCK.meet.her;
const CARD = headAt(HER_X, TOP, S, STAND, -1);
const YOU_HEAD = headAt(YOU_X, TOP, S, STAND, 1);
const HER_HAND = { x: YOU_X - 22 * S, y: TOP - 196 * S };
const YOUR_HAND = { x: HER_X + 18 * S, y: TOP - 214 * S };

/** The feet line on the steps (a straight ramp, so the climb is smooth). */
const stepY = (x: number) => (x <= DOCK.steps.from ? DOCK.ground : x >= DOCK.steps.to ? TOP : mix(DOCK.ground, TOP, (x - DOCK.steps.from) / (DOCK.steps.to - DOCK.steps.from)));

/** The shift walking out of the bays and off along the dock to the right. */
const Shift: React.FC<{ frame: number; k: T }> = ({ frame, k }) => (
  <g>
    {[0, 1, 2, 3].map((i) => {
      const bay = DOCK.bays[1 + (i % 2)];
      const t0 = k.start + i * 18;
      const p = linear(frame, t0, t0 + 260);
      if (p <= 0 || p >= 1) return null;
      const body = { x: bay.x + mix(-40, 900, p), y: TOP, scale: S * 0.96, facing: 1 as const, pose: walkPose(frame * 0.25 + i) };
      return (
        <g key={i}>
          <Figure head={PASTELS[(i * 3 + 1) % PASTELS.length]} coat="#6b6f7a" {...body} look={{ x: 1, y: 0 }} mouth="flat" time={frame} />
          <Vest {...body} />
        </g>
      );
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
const Dock: React.FC<{ frame: number; k: T; cam: Camera; you: Face; her: Face; showYou?: boolean; podium?: boolean }> = ({
  frame, k, cam, you, her, showYou = true, podium,
}) => {
  const lamps = ramp(frame, k.lamps[0], k.lamps[1]);
  const look = useGlows(cam, dockLamps(lamps));
  const t = ramp(frame, k.hug[0], k.hug[1]);
  const hold = ramp(frame, k.hold[0], k.hold[1]);
  const inPeak = frame >= k.peak && frame < k.two;
  const squeeze = ramp(frame, k.grip, k.grip + 18) + ramp(frame, k.vest, k.vest + 14) * 0.6;
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
      {podium && <Podium frame={frame} at={k.podium + 4} x={1230} y={470} bronze={k.bronze} silver={k.silver} silverThinks={k.silverThinks} bronzeThinks={k.bronzeThinks} />}
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
  const cam = drift(camAt(frame, [[k.flash, { x: 1300, y: 600, zoom: 2.1 }], [k.podium, { x: 1330, y: 620, zoom: 2.5 }]]), frame, "dock-memory", 3);
  return (
    <AbsoluteFill style={{ filter: "sepia(0.55) saturate(0.85) brightness(1.06)" }}>
      <LookContext.Provider value={moodLook("morning")}>
        <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<HomeBack cam={cam} mood="morning" frame={frame} calendar={false} yours={null} hers="fresh" hour={6} />}
          actors={null} />
      </LookContext.Provider>
      <AbsoluteFill style={{ boxShadow: "inset 0 0 160px 60px rgba(243,233,215,0.85)" }} />
    </AbsoluteFill>
  );
};

const DockShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.start, "wide"], [k.steps, "steps"], [k.face, "face"], [k.same, "same"], [k.hugShot, "hug"],
    [k.her105, "her105"], [k.you106, "you106"], [k.foldShot, "fold"], [k.peak, "peakA"], [k.peakB, "peakB"], [k.two, "two"],
    [k.her108, "her108"], [k.flash, "flash"], [k.podium, "podium"], [k.ots, "ots"], [k.vest, "vest"], [k.close, "close"],
    [k.card3, "card3"], [k.arms, "arms"], [k.wide, "wideEnd"]]);
  if (shot === "flash") return <Memory frame={frame} k={k} />;
  const hugHead = headAt(HER_X, TOP, S, { ...STAND, lean: 22, drop: 14 }, -1);
  const cams: Record<Exclude<typeof shot, "flash">, Camera> = {
    wide: camAt(frame, [[k.start, { x: 900, y: 560, zoom: 1.0 }], [k.steps, { x: 860, y: 580, zoom: 1.08 }]]),
    steps: camAt(frame, [[k.steps, { x: 640, y: 680, zoom: 1.5 }], [k.face, { x: 700, y: 620, zoom: 1.65 }]]),
    face: camAt(frame, [[k.face, closeUp(CARD.x - 30, CARD.y - 30, 2.3)], [k.same, closeUp(CARD.x - 30, CARD.y - 40, 2.5)]]),
    same: camAt(frame, [[k.same, { x: (YOU_HEAD.x + CARD.x) / 2, y: YOU_HEAD.y - 50, zoom: 2.5 }], [k.hugShot, { x: (YOU_HEAD.x + CARD.x) / 2, y: YOU_HEAD.y - 50, zoom: 2.65 }]]),
    hug: camAt(frame, [[k.hugShot, { x: 800, y: 560, zoom: 1.7 }], [k.her105, { x: 800, y: 560, zoom: 1.85 }]]),
    her105: camAt(frame, [[k.her105, closeUp(hugHead.x, hugHead.y - 20, 2.9)], [k.you106, closeUp(hugHead.x, hugHead.y - 20, 3.1)]]),
    you106: camAt(frame, [[k.you106, closeUp(YOU_HEAD.x + 50, YOU_HEAD.y - 20, 2.7)], [k.foldShot, closeUp(YOU_HEAD.x + 50, YOU_HEAD.y - 20, 2.85)]]),
    fold: camAt(frame, [[k.foldShot, { x: CARD.x - 40, y: CARD.y - 60, zoom: 2.6 }], [k.peak, { x: CARD.x - 40, y: CARD.y - 70, zoom: 2.8 }]]),
    peakA: camAt(frame, [[k.peak, { x: 800, y: 560, zoom: 1.9 }], [k.peakB - 10, insert(CARD.x, CARD.y - 115, 3.8)]]),
    peakB: camAt(frame, [[k.peakB, insert(HER_HAND.x + 40, HER_HAND.y + 10, 3.0)], [k.two, insert(HER_HAND.x + 40, HER_HAND.y + 10, 3.5)]]),
    two: camAt(frame, [[k.two, { x: 830, y: 540, zoom: 1.4 }], [k.her108, { x: 820, y: 545, zoom: 1.5 }]]),
    her108: camAt(frame, [[k.her108, closeUp(hugHead.x + 10, hugHead.y - 20, 3.0)], [k.flash, closeUp(hugHead.x + 10, hugHead.y - 20, 3.3)]]),
    podium: camAt(frame, [[k.podium, { x: 1000, y: 520, zoom: 1.45 }], [k.silverThinks, { x: 1120, y: 490, zoom: 1.85 }], [k.ots, { x: 1180, y: 480, zoom: 2.1 }]]),
    ots: camAt(frame, [[k.ots, closeUp(YOU_HEAD.x + 70, YOU_HEAD.y - 30, 2.8)], [k.vest, closeUp(YOU_HEAD.x + 70, YOU_HEAD.y - 20, 3.0)]]),
    vest: camAt(frame, [[k.vest, insert(YOUR_HAND.x - 10, YOUR_HAND.y + 10, 3.3)], [k.close, insert(YOUR_HAND.x - 10, YOUR_HAND.y + 10, 3.6)]]),
    close: camAt(frame, [[k.close, closeUp(YOU_HEAD.x + 40, YOU_HEAD.y, 2.6)], [k.card3, closeUp(YOU_HEAD.x + 40, YOU_HEAD.y, 2.85)]]),
    card3: camAt(frame, [[k.card3, insert(CARD.x, CARD.y - 115, 3.8)], [k.arms, insert(CARD.x, CARD.y - 110, 4.1)]]),
    arms: camAt(frame, [[k.arms, insert(HER_HAND.x + 40, HER_HAND.y + 10, 3.0)], [k.wide, insert(HER_HAND.x + 40, HER_HAND.y + 10, 3.2)]]),
    wideEnd: camAt(frame, [[k.wide, { x: 820, y: 560, zoom: 1.6 }], [k.end, { x: 900, y: 540, zoom: 1.05 }]]),
  };
  const cam = drift(cams[shot], frame, "dock", shot === "peakA" || shot === "peakB" ? 1.5 : 3);

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
  return (
    <>
      <Dock frame={frame} k={k} cam={cam} you={you} her={her} podium={shot === "podium"} />
      {shot === "ots" && <ForegroundHead x={1720} side="right" blur={18} />}
    </>
  );
};

const LoadingDock: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = times(shot.clips, shot.from, shot.to);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <DockShot frame={shot.frame} k={k} />
      <MeterSound at={k.tag} soft />
      <MeterSound at={k.tag2} soft />
    </AbsoluteFill>
  );
};

export const loadingDock: Beat = { id: "LoadingDock", firstLine: 102, Component: LoadingDock };
