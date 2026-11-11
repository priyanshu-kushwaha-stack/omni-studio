// Beat "The stage" (script.md, ## [09:20] The stage; narration lines 90-95). Same pattern as Change.tsx: `times()`
// from the clips, one component per shot, the beat picks by frame, the snaps sit outside the Stage.
//
//   90    the hall from the back of the rows: you at the lectern, your tangled draft on a screen the size of a wall;
//         the reverse: two hundred pastel faces, the boss in the front row, Dev at the sound desk; the screen.
//   91    you click; close on you; insert on the screen, the mess draws itself in crimson; a few heads tilt.
//   hold  medium on you: "Is this good?"; two hundred snaps like rain, a YES tag on every head, every face the smile,
//         applause; the camera pulls back over the rows of tags, every head tilting the same way.
//   92    from the back: you stand still at the lectern over the near rows' tags.
//   93    you click to the next slide: the Milgram diagram draws itself on the screen; insert, the dial's labels
//         appear left to right over the crowd.
//   94    the dial swings to its end, the switches flip, the hands stay on them; the calm voice; the crowd smiling.
//   95    close on you, the crowd's smile on the glass behind you; your mouth opens on "It's yours".
//   hold  the applause fades, the dial flickers out; Dev at the back, not clapping.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { STAND } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { INK } from "@whatif/kit/theme";
import { Bubble, headAt, Sheet, YesTag } from "../parts";
import { aimArm, type Body } from "../parts2";
import { blinking, camAt, current, HERO, lineEnd, noise, ramp, type Beat, type Shot } from "../shared";
import { Deep, REF } from "../sets/common";
import { Crowd, crowdHeads, HallBack, HallFront, HALL_ROWS, HALL_STAGE, Lectern } from "../sets/Hall";
import { Sfx } from "./Change.parts";
import { BossSeat, DevAtDesk, FrontTags, Milgram, MILGRAM, ScreenSlide, type MilgramTimes } from "./StageBeat.Hall";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i). */
function times(clips: Clip[], to: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const ask = lineEnd(clips, 91) + 2;
  const snaps = ask + 34;
  const milgram: MilgramTimes = {
    draw: from(93) + 6,
    labels: Array.from({ length: 8 }, (_, i) => at(93, 0.32 + i * 0.08)),
    swingFrom: at(94, 0.1),
    swingTo: at(94, 0.6),
    voice: at(94, 0.66),
  };
  return {
    wide: from(90), // the hall from the back
    rows: at(90, 0.4), // "Two hundred people"
    screen: at(90, 0.7), // "your first draft on a screen the size of a wall"
    click: from(91) - 4, // you click; close on you
    mess: at(91, 0.3), // insert: the mess draws in
    messTo: at(91, 0.62),
    tilt: at(91, 0.66), // a few heads tilt
    ask, // "Is this good?"
    snaps, // the rain of tags starts; RAIN frames long
    pull: snaps + 40, // the pull back over the rows of tags
    still: at(92, 0.55), // "You've made sure of it.": you, still, at the lectern from the back
    slide: from(93) - 4, // you click to the next slide
    diagram: at(93, 0.27), // insert: the diagram over the crowd
    dial: from(94), // closer on the dial, then down to the hands
    calm: at(94, 0.68), // "A calm voice told them to go on.": the crowd smiling
    yours: from(95) - 2, // close on you
    open: at(95, 0.8), // "It's yours."
    fade: lineEnd(clips, 95) + 4, // the applause fades, the dial flickers out
    dev: lineEnd(clips, 95) + 38, // Dev at the back, not clapping
    end: to,
    milgram,
  };
}

const RAIN = 42;
/** The frame head i's tag snaps up: a scatter over RAIN frames, like rain on a tin roof. */
const tagAt = (k: T, i: number) => k.snaps + Math.round(noise(i * 3 + 1) * RAIN);
/** The applause: from the rain until it fades in the last hold. */
const clapAt = (frame: number, k: T) => ramp(frame, k.snaps + 18, k.snaps + 40) * (1 - ramp(frame, k.fade, k.fade + 50));

// ------------------------------------------------------------------------------------------------ you at the lectern

const LX = HALL_STAGE.lectern.x, LY = HALL_STAGE.lectern.y, LS = 0.9;

/** You behind the lectern, the clicker in your front hand; `click` 0..1 lifts it. */
function lecternBody(click: number): Body {
  const b: Body = { x: LX, y: LY, scale: LS, facing: -1, pose: STAND };
  b.pose = { ...STAND, armF: aimArm(b, { x: LX - 50, y: LY - 158 - click * 26 }), armB: [-4, 14] };
  return b;
}
const clicker = <rect x={-7} y={-16} width={14} height={26} rx={4} fill={INK} />;

/** A click at each frame in `clicks`: the hand lifts and comes down over 10 frames. */
const clickLift = (frame: number, clicks: number[]) => Math.max(0, ...clicks.map((c) => ramp(frame, c, c + 4) * (1 - ramp(frame, c + 5, c + 10))));

const StageView: React.FC<{
  frame: number; k: T; cam: Camera; face: object; mode: "draft" | "milgram"; smiles?: number; flicker?: number; tags?: boolean; extra?: React.ReactNode;
}> = ({ frame, k, cam, face, mode, smiles, flicker, tags = true, extra }) => {
  const body = lecternBody(clickLift(frame, [k.click + 6, k.slide + 6]));
  const back = (
    <>
      <HallBack cam={cam} view="stage" frame={frame} />
      <ScreenSlide cam={cam} frame={frame} mode={mode} milgram={k.milgram} messFrom={k.mess} messTo={k.messTo} smiles={smiles} flicker={flicker} />
    </>
  );
  const actors = (
    <>
      <Figure {...HERO} {...body} {...face} blink={blinking(frame, 1)} time={frame} held={clicker} />
      <Lectern />
      {extra}
    </>
  );
  const front = (
    <>
      <HallFront cam={cam} view="stage" />
      {tags && <FrontTags cam={cam} frame={frame} at={(i) => tagAt(k, i + 400)} />}
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} front={front} />;
};

const youHead = headAt(LX, LY, LS, STAND, -1);

// ------------------------------------------------------------------------------------------------ line 90-91

const OpenShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.wide, "wide"], [k.screen, "screen"], [k.click, "click"], [k.mess, "mess"]]);
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.wide, { x: 960, y: 520, zoom: 1.0 }], [k.rows, { x: 1000, y: 500, zoom: 1.12 }]]),
    screen: camAt(frame, [[k.screen, { x: 1020, y: 420, zoom: 1.25 }], [k.click, { x: 1060, y: 430, zoom: 1.36 }]]),
    click: camAt(frame, [[k.click, closeUp(youHead.x - 40, youHead.y, 2.6)], [k.mess, closeUp(youHead.x - 40, youHead.y, 2.85)]]),
    mess: camAt(frame, [[k.mess, { x: 900, y: 340, zoom: 1.75 }], [k.tilt, { x: 900, y: 345, zoom: 1.9 }]]),
  };
  const faces = {
    wide: { ...EXPRESSIONS.worried, mouth: "flat" as const, look: { x: 0.2, y: 0.1 } },
    screen: { ...EXPRESSIONS.worried, look: { x: 0.9, y: -0.4 } },
    click: frame < k.click + 24
      ? { ...EXPRESSIONS.worried, mouth: "flat" as const, look: { x: 0.9, y: -0.5 } }
      : { ...EXPRESSIONS.sad, lids: 0.3, eyes: 1.1, mouth: "wobble" as const, look: { x: 0.95, y: -0.6 } },
    mess: EXPRESSIONS.sad,
  };
  const cam = drift(cams[shot], frame, "stage-open", 3);
  return <StageView frame={frame} k={k} cam={cam} face={faces[shot]} mode="draft" tags={false} />;
};

/** The rows view: the crowd, the boss, Dev at the desk. `tilt` and `smile` per head; tags from the rain. */
const RowsView: React.FC<{ frame: number; k: T; cam: Camera; tilt?: (i: number) => number; tags?: boolean; devLook?: { x: number; y: number }; front?: React.ReactNode }> = ({
  frame, k, cam, tilt, tags = true, devLook, front,
}) => {
  const clap = clapAt(frame, k);
  const smile = (i: number) => tags && frame >= tagAt(k, i);
  const back = (
    <>
      <Deep cam={cam} depth={1} flat><rect x={-1400} y={880} width={4800} height={1400} fill="#2a2440" /></Deep>
      <HallBack cam={cam} view="rows" frame={frame} />
      <DevAtDesk cam={cam} frame={frame} look={devLook} face={frame >= k.fade ? "frown" : "flat"} />
    </>
  );
  const heads = crowdHeads();
  const actors = (
    <>
      <Crowd frame={frame} tilt={tilt} smile={smile} clap={clap} />
      <BossSeat frame={frame} tagAt={tags ? tagAt(k, 999) : Number.MAX_SAFE_INTEGER} clap={clap} />
      {tags && heads.map((h) => <YesTag key={h.i} frame={frame} at={tagAt(k, h.i)} x={h.x} headY={h.y} r={h.r} tilt={-6 + noise(h.i + 5) * 12} />)}
      {front}
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} />;
};

const RowsShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.rows, "rows"], [k.tilt, "tilt"]]);
  const few = ramp(frame, k.tilt + 4, k.tilt + 20);
  const cam = drift(shot === "rows"
    ? camAt(frame, [[k.rows, { x: 760, y: 720, zoom: 1.25 }], [k.screen, { x: 1180, y: 640, zoom: 1.2 }]])
    : camAt(frame, [[k.tilt, { x: 960, y: 760, zoom: 1.5 }], [k.ask, { x: 1000, y: 760, zoom: 1.6 }]]), frame, "rows", 3);
  return <RowsView frame={frame} k={k} cam={cam} tags={false} tilt={(i) => (i % 9 === 4 ? -16 * few : 0)} />;
};

// ------------------------------------------------------------------------------------------------ the ask, the rain

const AskShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.ask, { x: youHead.x - 160, y: youHead.y + 30, zoom: 1.9 }], [k.snaps, { x: youHead.x - 150, y: youHead.y + 30, zoom: 2.05 }]]), frame, "ask", 2);
  const face = { ...EXPRESSIONS.worried, brows: "raised" as const, mouth: frame < k.ask + 28 ? "open" as const : "flat" as const, eyes: 1.1, look: { x: 0.3, y: 0.1 } };
  const bubble = <Bubble frame={frame} at={k.ask + 4} x={youHead.x - youHead.r * 0.9} y={youHead.y - youHead.r * 1.15} text="Is this good?" size={26} side="left" />;
  return <StageView frame={frame} k={k} cam={cam} face={face} mode="draft" tags={false} extra={bubble} />;
};

const RainShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  // In close on the middle rows as the tags rain up, then the long pull back over every row; every head tilts the
  // same way.
  const cam = drift(camAt(frame, [[k.snaps - 4, { x: 960, y: 760, zoom: 1.45 }], [k.pull, { x: 960, y: 720, zoom: 1.3 }], [k.still, { x: 960, y: 560, zoom: 0.84 }]]), frame, "rain", 3);
  const same = ramp(frame, k.pull, k.pull + 50) * 9;
  return <RowsView frame={frame} k={k} cam={cam} tilt={() => same} />;
};

const StillShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.still, { x: 1200, y: 600, zoom: 1.15 }], [k.slide, { x: 1260, y: 590, zoom: 1.25 }]]), frame, "still", 2);
  return <StageView frame={frame} k={k} cam={cam} face={{ ...EXPRESSIONS.sad, mouth: "flat" as const, lids: 0.4, look: { x: 0.1, y: 0.4 } }} mode="draft" />;
};

// ------------------------------------------------------------------------------------------------ lines 93-94: Milgram

const SlideShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.slide, { x: 1080, y: 430, zoom: 1.2 }], [k.diagram, { x: 1000, y: 380, zoom: 1.45 }]]), frame, "slide", 2);
  return <StageView frame={frame} k={k} cam={cam} face={{ ...EXPRESSIONS.sceptical, look: { x: 0.9, y: -0.5 } }} mode="milgram" />;
};

const DiagramShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  // The sheet over the crowd (rows view behind it): whole, the labels arriving; then on the dial as it swings; then
  // down to the hands on the switches.
  const SX = 960, SY = 560;
  const toSheet = (x: number, y: number) => ({ x: SX - MILGRAM.w / 2 + x, y: SY - MILGRAM.h / 2 + y });
  const dial = toSheet(750, 380), hands = toSheet(750, 700);
  const cam = drift(camAt(frame, [
    [k.diagram, { x: SX, y: SY, zoom: 1.08 }], [k.dial - 1, { x: SX, y: SY - 10, zoom: 1.14 }],
    [k.dial, { ...dial, zoom: 1.5 }], [k.milgram.swingTo, { ...dial, zoom: 1.62 }], [k.calm, { ...hands, zoom: 1.7 }],
  ]), frame, "diagram", 2);
  const sheet = (
    <Sheet frame={frame} at={k.diagram - 14} x={SX} y={SY} w={MILGRAM.w + 80} h={MILGRAM.h + 60} tilt={-1}>
      <g transform="translate(40 30)"><Milgram frame={frame} t={k.milgram} /></g>
    </Sheet>
  );
  return <RowsView frame={frame} k={k} cam={cam} tilt={() => 9} front={sheet} />;
};

const CalmShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.calm, { x: 700, y: 820, zoom: 1.7 }], [k.yours, { x: 1100, y: 800, zoom: 1.8 }]]), frame, "calm", 2);
  return <RowsView frame={frame} k={k} cam={cam} tilt={() => 9} />;
};

// ------------------------------------------------------------------------------------------------ line 95 and the hold

const YoursShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.yours, closeUp(youHead.x - 140, youHead.y + 10, 2.3)], [k.fade, closeUp(youHead.x - 80, youHead.y + 10, 2.8)]]), frame, "yours", 2);
  const face = frame < k.open
    ? { ...EXPRESSIONS.worried, mouth: "flat" as const, lids: 0.2, eyes: 1.1, look: { x: 0.2, y: 0.2 } }
    : { ...EXPRESSIONS.shocked, mouth: "o" as const, eyes: 1.2, look: { x: 0.1, y: 0.35 } };
  return <StageView frame={frame} k={k} cam={cam} face={face} mode="milgram" smiles={ramp(frame, k.yours, k.yours + 30)} />;
};

const FadeShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.fade, { x: 1000, y: 440, zoom: 1.12 }], [k.dev, { x: 980, y: 460, zoom: 1.05 }]]), frame, "fade", 2);
  return <StageView frame={frame} k={k} cam={cam} face={{ ...EXPRESSIONS.sad, look: { x: 0.3, y: 0.5 } }} mode="milgram" smiles={1}
    flicker={ramp(frame, k.fade + 10, k.fade + 30)} />;
};

/** The camera that centres a point authored on a Deep layer of depth d (sets/common.tsx), at a zoom. */
const onLayer = (x: number, y: number, d: number, zoom: number): Camera => ({ x: (x - REF.x * (1 - d)) / d, y: (y - REF.y * (1 - d)) / d, zoom });

const DevShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const d = HALL_ROWS.desk;
  const cam = drift(camAt(frame, [[k.dev, onLayer(d.x + 20, d.y - 70, 0.4, 2.6)], [k.end, onLayer(d.x + 36, d.y - 90, 0.4, 3.3)]]), frame, "dev", 2);
  return <RowsView frame={frame} k={k} cam={cam} tilt={() => 9} devLook={{ x: -0.3, y: 0.4 }} />;
};

// ------------------------------------------------------------------------------------------------ the beat

const StageBeat: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const scene = current(frame, [
    [0, "open"], [k.rows, "rows"], [k.screen, "open"], [k.tilt, "rows"], [k.ask, "ask"], [k.snaps - 4, "rain"], [k.still, "still"],
    [k.slide, "slide"], [k.diagram, "diagram"], [k.calm, "calm"], [k.yours, "yours"], [k.fade, "fade"], [k.dev, "dev"],
  ]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene === "open" && <OpenShot frame={frame} k={k} />}
      {scene === "rows" && <RowsShot frame={frame} k={k} />}
      {scene === "ask" && <AskShot frame={frame} k={k} />}
      {scene === "rain" && <RainShot frame={frame} k={k} />}
      {scene === "still" && <StillShot frame={frame} k={k} />}
      {scene === "slide" && <SlideShot frame={frame} k={k} />}
      {scene === "diagram" && <DiagramShot frame={frame} k={k} />}
      {scene === "calm" && <CalmShot frame={frame} k={k} />}
      {scene === "yours" && <YoursShot frame={frame} k={k} />}
      {scene === "fade" && <FadeShot frame={frame} k={k} />}
      {scene === "dev" && <DevShot frame={frame} k={k} />}
      {/* Two hundred snaps like rain: one clear snap, then a scatter of quieter ones across the rain. */}
      <Sfx at={k.snaps} name="snap" />
      {Array.from({ length: 28 }, (_, j) => <Sfx key={j} at={k.snaps + 2 + Math.round(noise(j + 100) * RAIN)} name={j % 3 ? "snap" : "snap-soft"} volume={0.16 + noise(j + 7) * 0.12} />)}
    </AbsoluteFill>
  );
};

export const stage: Beat = { id: "stage", firstLine: 90, Component: StageBeat };

