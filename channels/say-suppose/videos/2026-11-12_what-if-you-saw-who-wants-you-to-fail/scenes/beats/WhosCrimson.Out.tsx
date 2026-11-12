// Who's Crimson out of school. Line 23: the store counter (the clerk, a grey zero, one click), the metro platform (a
// tour group in a row, eleven grey zeros), the store cat on its crate (nothing at all). Lines 29-32: the academy steps
// at dusk, you and Min-jun sitting with your bags between your feet; you point above his head; "What number?"; his
// blank face, then a grin; the two of you small on the steps. No card opens on the steps: you said nothing good.
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { lerpPose, SEATED, seatedY, STAND, type Pose } from "@whatif/kit/rig/pose";
import { Backpack, metroPlatform, setLook } from "@whatif/kit/sets";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { TEAL } from "@whatif/kit/theme";
import { Bubble, headAt, Letter, Meter } from "../parts";
import { blinking, camAt, current, HERO, MINJUN, PASTELS, ramp } from "../shared";
import { ACADEMY, academyLights, AcademyStreetBack } from "../sets/AcademyStreet";
import { Cat, STORE, StoreBack, StoreCounter, storeLook } from "../sets/Store";
import { SetShot } from "./WhosCrimson.Common";
import type { CrimsonTimes } from "./WhosCrimson.Times";

/** The letter held out toward someone, front arm forward and up (facing 1). */
const LETTER_UP: [number, number] = [124, 16];
/** The clerk: a pastel head and the store's teal uniform. */
export const CLERK = { head: PASTELS[4], coat: "#2f7f74" } as const;

// ------------------------------------------------------------------------------------------------ 23 the store counter

export const ClerkShot: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  // the clerk stands left of the till so the screen never covers the face
  const c = { ...STORE.clerk, x: STORE.clerk.x - 90 }, u = STORE.customer;
  const ch = headAt(c.x, c.y, c.scale, STAND, c.facing);
  const pose: Pose = { ...STAND, armF: LETTER_UP };
  const cam = drift(camAt(frame, [[k.clerk, { x: 1420, y: 690, zoom: 1.9 }], [k.tour, { x: 1480, y: 660, zoom: 2.15 }]]), frame, "clerk", 3);
  return (
    <LookContext.Provider value={storeLook(mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<StoreBack cam={cam} mood={mood} frame={frame} />} actors={
        <>
          <Figure {...CLERK} x={c.x} y={c.y} scale={c.scale} facing={c.facing} pose={STAND} brows="none" lids={0.45} mouth="flat" eyes={1}
            look={{ x: 0.8, y: 0.1 }} blink={blinking(frame, 7)} time={frame} />
          <StoreCounter />
          <Meter frame={frame} at={k.clerkTag} x={ch.x} headY={ch.y} r={ch.r} value={0} until={k.tour} />
          <Figure {...HERO} x={u.x} y={u.y} scale={u.scale} pose={pose} brows="raised" lids={0} mouth="flat" eyes={1.05}
            look={{ x: 0.8, y: frame >= k.clerkTag + 10 ? -0.6 : -0.1 }} blink={blinking(frame, 1)} time={frame}
            held={<Letter x={0} y={8} scale={0.42} tilt={6} />} />
        </>
      } />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ 23 the tour group

/** The tour group in a row along the platform, a guide with a teal flag at its head. */
const TOUR = { from: 600, step: 118, n: 11, y: 960, scale: 0.84 } as const;
export const tourHead = (i: number) => headAt(TOUR.from + i * TOUR.step, TOUR.y, TOUR.scale, STAND, -1);
/** The frame tourist i's card snaps open: one after another down the row. */
export const tourTagAt = (k: CrimsonTimes, i: number) => k.tourTag + i * 3;

const Flag: React.FC = () => (
  <g>
    <line x1={0} y1={0} x2={0} y2={-120} stroke="#3b3e47" strokeWidth={6} />
    <path d="M0 -120 L56 -104 L0 -88Z" fill={TEAL} stroke="#23252b" strokeWidth={3} />
  </g>
);

export const TourShot: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const cam = drift(camAt(frame, [[k.tour, { x: 960, y: 640, zoom: 1.1 }], [k.cat, { x: 1000, y: 630, zoom: 1.2 }]]), frame, "tour", 3);
  const yPose: Pose = { ...STAND, armF: LETTER_UP };
  return (
    <SetShot set={metroPlatform} mood={mood} frame={frame} cam={cam} options={{ train: null, crowd: true }} actors={
      <>
        {Array.from({ length: TOUR.n }, (_, i) => {
          const x = TOUR.from + i * TOUR.step;
          const h = tourHead(i);
          const guide = i === 0;
          return (
            <g key={i}>
              <Figure head={PASTELS[(i * 3 + 1) % PASTELS.length]} coat={["#6d7f8f", "#b58fc7", "#5a6488", "#c98a5a"][i % 4]} x={x} y={TOUR.y} scale={TOUR.scale}
                facing={-1} pose={guide ? { ...STAND, armF: [40, 50] } : STAND} brows="none" lids={0.1} mouth={i % 3 === 0 ? "smile" : "flat"} eyes={1}
                look={{ x: 0.6, y: 0.05 }} blink={blinking(frame, i + 2)} time={frame} held={guide ? <Flag /> : undefined} />
              <Meter frame={frame} at={tourTagAt(k, i)} x={h.x} headY={h.y} r={h.r} value={0} until={k.cat} tilt={i % 2 ? 3 : -3} />
            </g>
          );
        })}
        <Figure {...HERO} x={300} y={960} scale={1.15} pose={yPose} brows="raised" lids={0} mouth="flat" eyes={1.1}
          look={{ x: 0.9, y: -0.3 }} blink={blinking(frame, 1)} time={frame} held={<Letter x={0} y={8} scale={0.42} tilt={6} />} />
      </>
    } />
  );
};

// ------------------------------------------------------------------------------------------------ 23 the cat

export const CatShot: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const close = frame >= k.catBlink;
  const cam = close
    ? drift(camAt(frame, [[k.catBlink, { x: 230, y: 790, zoom: 3.0 }], [k.desks, { x: 230, y: 790, zoom: 3.2 }]]), frame, "catc", 2)
    : drift(camAt(frame, [[k.cat, { x: 400, y: 760, zoom: 2.0 }], [k.catBlink, { x: 380, y: 770, zoom: 2.15 }]]), frame, "cat", 3);
  const yx = 560;
  const pose: Pose = { ...STAND, lean: 10, armF: [78, 12] };
  return (
    <LookContext.Provider value={storeLook(mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<StoreBack cam={cam} mood={mood} frame={frame} />} actors={
        <>
          <Cat {...STORE.cat} frame={frame} look={close ? 0.9 : 0.6} />
          <Figure {...HERO} x={yx} y={STORE.floor} scale={STORE.scale} facing={-1} pose={pose} brows="raised" lids={0.1}
            mouth={close ? "smile" : "flat"} eyes={1.05} look={{ x: 0.8, y: 0.6 }} blink={blinking(frame, 1)} time={frame}
            held={<Letter x={0} y={8} scale={0.42} tilt={-6} />} />
        </>
      } />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ 29-32 the steps

const SY = ACADEMY.sitYou, SM = ACADEMY.sitMinjun;
const yY = seatedY(SY.seatTop, SY.scale);
const mY = seatedY(SM.seatTop, SM.scale);
/** Pointing above his head: the front arm forward and up, clear of your face (you face him, 1). */
const POINT: Pose = { ...SEATED, armF: [116, 6] };
/** His shoulder toward yours: a lean in. */
const NUDGE: Pose = { ...SEATED, lean: 12, armF: [40, 40] };

type StepsView = "steps" | "point" | "ask" | "blank" | "pair" | "wide";

export const StepsShot: React.FC<{ frame: number; k: CrimsonTimes }> = ({ frame, k }) => {
  const mood: MoodName = "dusk";
  const view = current<StepsView>(frame, [[0, "steps"], [k.point, "point"], [k.ask, "ask"], [k.blank, "blank"], [k.pair, "pair"], [k.wide, "wide"]]);
  const point = ramp(frame, k.point + 4, k.point + 14) * (1 - ramp(frame, k.pair, k.pair + 14));
  const yPose = lerpPose(SEATED, POINT, point);
  const mPose = lerpPose(SEATED, NUDGE, ramp(frame, k.pair + 10, k.pair + 24) * (1 - ramp(frame, k.wide + 30, k.wide + 50)));
  const yh = headAt(SY.x, yY, SY.scale, yPose, SY.facing);
  const mh = headAt(SM.x, mY, SM.scale, SEATED, SM.facing);
  const grin = frame >= k.grin;
  const mFace = view === "steps"
    ? { ...EXPRESSIONS.happy, look: { x: 0.9, y: 0 } }
    : grin
      ? { brows: "raised" as const, lids: 0.1, mouth: "smile" as const, eyes: 1, look: { x: 0.9, y: -0.05 } }
      : { brows: "none" as const, lids: 0, mouth: "flat" as const, eyes: 1.05, look: { x: 0.95, y: 0 } };
  const yFace = view === "steps"
    ? { ...EXPRESSIONS.sceptical, look: { x: 0.9, y: -0.3 } }
    : view === "point" || view === "ask"
      ? { brows: "raised" as const, lids: 0, mouth: "open" as const, eyes: 1.1, look: { x: 0.8, y: -0.7 } }
      : { brows: "worry" as const, lids: 0.2, mouth: "flat" as const, eyes: 1, look: { x: 0.7, y: -0.75 } };
  const cams: Record<StepsView, Camera> = {
    steps: camAt(frame, [[k.steps, { x: 470, y: 820, zoom: 1.55 }], [k.point, { x: 450, y: 830, zoom: 1.75 }]]),
    point: camAt(frame, [[k.point, closeUp(yh.x + 40, yh.y - 50, 3.0)], [k.ask, closeUp(yh.x + 50, yh.y - 55, 3.15)]]),
    ask: camAt(frame, [[k.ask, closeUp(mh.x + 10, mh.y - 50, 3.0)], [k.blank, closeUp(mh.x + 10, mh.y - 50, 3.1)]]),
    blank: camAt(frame, [[k.blank, closeUp(mh.x - 10, mh.y - 20, 3.3)], [k.pair, closeUp(mh.x - 10, mh.y - 20, 3.5)]]),
    pair: camAt(frame, [[k.pair, { x: 420, y: 860, zoom: 2.2 }], [k.wide, { x: 420, y: 850, zoom: 2.35 }]]),
    wide: camAt(frame, [[k.wide, { x: 520, y: 800, zoom: 1.5 }], [k.end, { x: 700, y: 640, zoom: 0.95 }]]),
  };
  const cam = drift(cams[view], frame, "steps", view === "wide" ? 4 : 3);
  return (
    <LookContext.Provider value={setLook(academyLights("street"), mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<AcademyStreetBack cam={cam} mood={mood} frame={frame} view="street" />} actors={
        <>
          <Backpack x={398} y={1000} scale={0.4} color="#3d6fb0" />
          <Backpack x={432} y={1004} scale={0.38} color="#d8344f" />
          <Figure {...MINJUN} x={SM.x} y={mY} scale={SM.scale} facing={SM.facing} pose={mPose} {...mFace} blink={blinking(frame, 2)} time={frame} />
          <Figure {...HERO} x={SY.x} y={yY} scale={SY.scale} facing={SY.facing} pose={yPose} {...yFace} blink={blinking(frame, 1)} time={frame} />
          <Bubble frame={frame} at={k.ask} until={k.askEnd} x={mh.x + mh.r * 0.5} y={mh.y - mh.r * 1.05} text="What number?" size={20} side="right" />
        </>
      } />
    </LookContext.Provider>
  );
};
