// Beat "The Stadium" (script.md ## [03:48]): the picture only this premise can show. The wordless rise (its 5 s hold
// opens the beat: lead 6.6 s): from your seat up out of the stands until the whole bowl is below, sixty thousand dim
// plates like frost, the floodlights going off, the directors' box a bonfire of double digits, the readout climbing to
// 41,300. Then two rows down the crimson stranger counting the box on their fingers, the space over their head behind
// a railing; the crowd stands for a corner and the coat is gone. The striker goes down; his counter flares crimson and
// clicks. Back to the bowl for the big study (the box's fire, then the frost of white lies), and to you as the city
// turns to look.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { SIT, STAND, type Pose } from "@whatif/kit/rig/pose";
import { CRIMSON, INK, TEAL } from "@whatif/kit/theme";
import { stadium as stadiumSet } from "@whatif/kit/sets";
import type { Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import { Readout } from "../parts/Counter";
import { Body, counterSpot, Handset, MoodStage } from "../parts/SayItAgain.Kit";
import { BowlBack, FloodsOff, PitchBack, TierCounters } from "../sets/Stadium.Bowl";
import { camAt, current, GLOW, HERO, mix, PASTELS, ramp, STRANGER, type Beat, type Shot } from "../shared";

function cues(shot: Shot) {
  const { at, end } = shot;
  const two = at("Two rows down.");
  const spreadE = end("Can this spread?");
  const striker = at("Striker: He got me!");
  return {
    start: shot.from, upFrom: shot.from + 12, cross: Math.round(mix(shot.from, two, 0.3)), upTo: two - 14, two,
    spread: at("Can this spread?"), spreadE, lean: spreadE + 4, stand: Math.round(mix(spreadE, striker, 0.35)),
    sit: Math.round(mix(spreadE, striker, 0.8)), striker, strikerE: end("Striker: He got me!"), click: at("Click."),
    sixty: at("Sixty thousand people"), diary: at("Sixty thousand people", 0.42), prolific: at("Sixty thousand people", 0.6),
    white: at("Sixty thousand people", 0.72), frost: at("Sixty thousand people", 0.86), stop: at("You stop watching the pitch"), box: at("You stop watching the pitch", 0.5),
    problem: at("Problem one."), end: shot.to,
  };
}
type K = ReturnType<typeof cues>;

const MOOD = "night" as const;

// ------------------------------------------------------------------------------------------------ the stands (library)

/** The library stadium from the stands at night, the floodlights going off, dim counters over the crowd. */
const Stands: React.FC<{ frame: number; cam: Camera; dim: number; wave: number | null; rise?: number; actors: React.ReactNode; front?: boolean }> = ({
  frame, cam, dim, wave, rise = 0, actors, front = true }) => {
  const props = { cam, mood: MOOD, frame, options: { ...stadiumSet.defaults, wave, flags: false, screen: "replay" as const } };
  return (
    <MoodStage mood={MOOD} cam={cam}
      back={<>{stadiumSet.Back(props)}<FloodsOff cam={cam} dim={dim} /><TierCounters cam={cam} frame={frame} rise={rise} /></>}
      actors={actors} front={front ? stadiumSet.Front?.(props) : undefined} />
  );
};

const Seat: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  // the rise begins here: up from your shoulder, the floodlights going off
  const cam = camAt(frame, [[k.start, { x: 900, y: 640, zoom: 1.5 }], [k.cross + 6, { x: 960, y: 300, zoom: 1.0 }]]);
  const dim = ramp(frame, k.upFrom, k.cross);
  return (
    <Stands frame={frame} cam={cam} dim={dim} wave={null}
      actors={
        <>
          <Body x={760} y={980} scale={1.2} pose={{ ...STAND, armF: [30, 30] }} head={HERO.head} scarf={HERO.scarf} tuft frame={frame} id="you-seat"
            look={{ x: 0.6, y: -0.5 }} brows="raised" mouth="o" eyes={1.15} />
          <Body x={1080} y={980} scale={1.2} facing={-1} head={PASTELS[2]} coat="#3d5a6c" frame={frame} id="nb1" count={{ base: 0 }} look={{ x: -0.5, y: -0.4 }} mouth="smile" seed={3} />
        </>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ the bowl from above

const Bowl: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  const cam = camAt(frame, [
    [k.cross - 6, { x: 960, y: 980, zoom: 2.8 }], [k.upTo, { x: 960, y: 560, zoom: 1.0 }],
    [k.sixty - 2, { x: 960, y: 560, zoom: 1.02 }], [k.diary, { x: 980, y: 560, zoom: 1.08 }],
    [k.prolific, { x: 1560, y: 540, zoom: 2.3 }], [k.white + 10, { x: 1500, y: 540, zoom: 2.0 }],
    [k.frost, { x: 960, y: 560, zoom: 1.0 }], [k.stop, { x: 970, y: 560, zoom: 1.03 }],
  ]);
  const lights = 1 - ramp(frame, k.cross, mix(k.cross, k.upTo, 0.6));
  const boxTicks = Array.from({ length: 24 }, (_, i) => k.diary + i * 11);
  return <MoodStage mood={MOOD} cam={drift(cam, frame, "bowl", 3)} dof={0} back={<BowlBack cam={cam} frame={frame} lights={lights} boxTicks={boxTicks} />} actors={null} />;
};

// ------------------------------------------------------------------------------------------------ two rows down

const Stranger: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  const stand = ramp(frame, k.stand, k.stand + 10) * (1 - ramp(frame, k.sit, k.sit + 10));
  const gone = frame >= k.stand + 10;
  const lean = ramp(frame, k.lean, k.lean + 14);
  const cam = camAt(frame, [[k.two - 2, { x: 980, y: 640, zoom: 1.2 }], [k.spread, { x: 1060, y: 660, zoom: 1.35 }],
    [k.lean, { x: 1080, y: 660, zoom: 1.4 }], [k.stand, { x: 1080, y: 660, zoom: 1.3 }]]);
  // counting on their fingers: the hand bobs once per count
  const tap = Math.floor((frame - k.two) / 14);
  const sx = 1300, sy = 925, ss = 0.86;
  const sPose: Pose = { ...STAND, armF: [100 + (tap % 2) * 8, 40], armB: [30, 60], tilt: -6 };
  const c = counterSpot(sx, sy, ss, sPose, 1, 40);
  const youPose: Pose = { ...STAND, lean: 8 * lean, tilt: -10 * lean, armF: [40 + 20 * lean, 30] };
  return (
    <Stands frame={frame} cam={drift(cam, frame, "rows", 4)} dim={1} wave={frame >= k.stand && frame < k.sit ? mix(-0.2, 1.2, ramp(frame, k.stand, k.sit)) : null}
      rise={stand}
      actors={
        <>
          {!gone && (
            <g>
              <Figure x={sx} y={sy} scale={ss} facing={1} pose={sPose} head={STRANGER.head} coat={STRANGER.coat} time={frame}
                look={{ x: 0.9, y: -0.2 }} brows="flat" lids={0.3} mouth="flat" blink={(frame + 40) % 97 < 4} />
              {/* fingers: small strokes over the raised hand, one more each count */}
              {(() => {
                const hx = sx + 91 * ss, hy = sy - 268 * ss;
                return Array.from({ length: 1 + (tap % 5) }, (_, i) => (
                  <line key={i} x1={hx - 10 + i * 6} y1={hy} x2={hx - 12 + i * 7} y2={hy - 18} stroke={STRANGER.head} strokeWidth={5} strokeLinecap="round" />
                ));
              })()}
              {/* the plate over their head shows only its glow: a railing is in the way */}
              <ellipse cx={c.x} cy={c.y} rx={70} ry={46} fill={GLOW} opacity={0.18} />
            </g>
          )}
          {/* the railing of the row in front of them, across the space over their head */}
          <rect x={1140} y={c.y - 30} width={360} height={22} rx={10} fill={TEAL} stroke={INK} strokeWidth={4} />
          <rect x={1140} y={c.y + 6} width={360} height={14} rx={7} fill={TEAL} stroke={INK} strokeWidth={3} />
          {[1160, 1300, 1460].map((x) => <rect key={x} x={x} y={c.y - 30} width={10} height={130} fill={TEAL} />)}
          {/* the crowd in front stands for the corner */}
          {Array.from({ length: 9 }, (_, i) => {
            const x = 1060 + i * 64;
            const y = 1010 - stand * 150 + Math.sin(frame / 7 + i) * 3;
            return (
              <g key={i}>
                <rect x={x - 26} y={y - 40} width={52} height={160} rx={20} fill={["#3d6fb0", CRIMSON, "#1d9a8f", "#d9c26a"][i % 4]} />
                <circle cx={x} cy={y - 62} r={30} fill={PASTELS[(i * 3) % PASTELS.length]} />
              </g>
            );
          })}
          <Body x={700} y={1000} scale={1.35} pose={youPose} head={HERO.head} scarf={HERO.scarf} tuft frame={frame} id="you-rows"
            look={gone ? { x: 0.9, y: 0.4 } : { x: 1, y: 0.35 }} brows={gone ? "raised" : "flat"} lids={gone ? 0 : 0.25} mouth={gone ? "o" : "flat"} />
        </>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ the pitch

const Pitch: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  const down = ramp(frame, k.striker - 10, k.striker + 4);
  const sx = 900, sy = 900, ss = 1.1;
  const sPose: Pose = down < 1
    ? { ...STAND, lean: mix(0, -40, down), armF: [mix(30, 205, down), 0], armB: [mix(-30, 160, down), 0] }
    : { ...SIT, drop: 104, armF: [205 + Math.sin(frame / 4) * 6, -4], armB: [160 - Math.sin(frame / 4) * 6, 4], tilt: -14 };
  const flare = frame >= k.striker ? CRIMSON : GLOW;
  const c = counterSpot(sx, sy, ss, sPose, 1, 64);
  const cam = camAt(frame, [[k.sit, { x: 1000, y: 600, zoom: 1.05 }], [k.striker, { x: 960, y: 600, zoom: 1.25 }], [k.click, { x: 930, y: 560, zoom: 1.45 }]]);
  return (
    <MoodStage mood={MOOD} cam={drift(cam, frame, "pitch", 4)} back={<PitchBack cam={cam} frame={frame} />}
      glows={frame >= k.striker ? [{ x: 960 + (c.x - cam.x) * cam.zoom, y: 540 + (c.y - cam.y) * cam.zoom, r: 260, color: CRIMSON, strength: 0.45 }] : []}
      actors={
        <>
          <ellipse cx={1180} cy={sy + 6} rx={14} ry={14} fill="#f3f3f3" stroke={INK} strokeWidth={3} />
          <Body x={1260} y={sy + 10} scale={1.05} facing={-1} pose={{ ...STAND, armF: [100, 10], armB: [-80, 10] }} head={PASTELS[5]} coat="#f3e9d7"
            frame={frame} id="defender" count={{ base: 0 }} brows="worry" mouth="o" look={{ x: 0.8, y: 0.4 }} seed={4} />
          <Body x={sx} y={sy} scale={ss} facing={1} pose={sPose} head={PASTELS[3]} coat={CRIMSON} frame={frame} id="striker" size={64}
            count={{ base: 1, ticks: [k.click], glow: flare }} mouth={frame >= k.striker ? "open" : "flat"} brows={frame >= k.striker ? "sad" : "angry"}
            look={{ x: 0.3, y: -0.6 }} seed={7} />
          {frame >= k.click && frame < k.click + 16 && (
            <circle cx={c.x} cy={c.y} r={60 + (frame - k.click) * 9} fill="none" stroke={CRIMSON} strokeWidth={10} opacity={1 - (frame - k.click) / 16} />
          )}
        </>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ you watch the box

/** "You stop watching the pitch. You watch the box.": you, close, eyes down on the pitch, then turning up and right to
 *  the directors' box, whose fire lights your face from the right. */
const BoxWatch: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  const turn = ramp(frame, k.box - 8, k.box + 10);
  const cam = camAt(frame, [[k.stop - 2, { x: 860, y: 700, zoom: 1.6 }], [k.problem, { x: 900, y: 680, zoom: 1.75 }]]);
  return (
    <MoodStage mood={MOOD} cam={drift(cam, frame, "boxwatch", 3)}
      glows={[{ x: 1900, y: 260, r: 700 * (0.3 + 0.7 * turn), color: "#ff8a3a", strength: 0.5 }]}
      back={<>{stadiumSet.Back({ cam, mood: MOOD, frame, options: { ...stadiumSet.defaults, wave: null, flags: false, screen: "replay" } })}
        <FloodsOff cam={cam} dim={1} /><TierCounters cam={cam} frame={frame} /></>}
      actors={
        <>
          <Body x={760} y={980} scale={1.2} pose={{ ...STAND, tilt: mix(8, -10, turn), armF: [20, 30] }} head={HERO.head} scarf={HERO.scarf} tuft
            frame={frame} id="you-box" look={{ x: mix(0.3, 1, turn), y: mix(0.8, -0.5, turn) }} brows={turn > 0.5 ? "angry" : "flat"} lids={mix(0.3, 0.15, turn)} mouth="flat" />
          <Body x={1080} y={980} scale={1.2} facing={-1} head={PASTELS[2]} coat="#3d5a6c" frame={frame} id="nb-box" count={{ base: 0 }}
            look={{ x: -0.6, y: 0.5 }} mouth="smile" seed={3} />
        </>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ the city turns to look

const Turned: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  const turn = ramp(frame, k.problem + 10, k.problem + 30);
  const cam = camAt(frame, [[k.problem - 2, { x: 920, y: 640, zoom: 1.45 }], [k.end, { x: 880, y: 660, zoom: 1.65 }]]);
  return (
    <Stands frame={frame} cam={drift(cam, frame, "turned", 4)} dim={1} wave={null}
      actors={
        <>
          <Body x={760} y={980} scale={1.2} pose={{ ...STAND, armF: [20, 30] }} head={HERO.head} scarf={HERO.scarf} tuft frame={frame} id="you-turned"
            look={{ x: mix(0.6, 1, turn), y: 0 }} brows={turn > 0.5 ? "worry" : "flat"} mouth="flat" lids={0.1} />
          <Body x={1080} y={980} scale={1.2} facing={-1} pose={{ ...STAND, armF: turn > 0.5 ? [118, 20] : [20, 30] }} head={PASTELS[2]} coat="#3d5a6c"
            frame={frame} id="nb-t1" count={{ base: 0 }} look={{ x: mix(-0.5, 0.9, turn), y: 0 }} mouth={turn > 0.5 ? "o" : "smile"} seed={3}
            held={turn > 0.5 ? <Handset scale={1.3} /> : undefined} />
          <Body x={1500} y={980} scale={1.2} facing={-1} head={PASTELS[6]} coat="#6b4b3a" frame={frame} id="nb-t2" count={{ base: 1 }}
            look={{ x: mix(-0.6, 1, ramp(frame, k.problem + 22, k.problem + 40)), y: 0 }} brows="raised" mouth="flat" seed={6} />
        </>
      } />
  );
};

const Component: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = cues(shot);
  const f = shot.frame;
  const value = Math.round(mix(212, 41300, ramp(f, k.cross, k.upTo))) + (f >= k.click ? 1 : 0);
  const on = current(f, [
    [shot.from, "seat"], [k.cross, "bowl"], [k.two - 2, "rows"], [k.sit, "pitch"], [k.sixty - 2, "bowl"], [k.stop - 2, "boxwatch"], [k.problem - 2, "turned"],
  ] as [number, "seat" | "bowl" | "rows" | "pitch" | "boxwatch" | "turned"][]);
  // a short dissolve from the stands into the bowl, so the rise reads as one move
  const mixIn = ramp(f, k.cross, k.cross + 14);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {on === "seat" && <Seat frame={f} k={k} />}
      {on === "bowl" && (
        <>
          <Bowl frame={f} k={k} />
          {f < k.cross + 14 && <AbsoluteFill style={{ opacity: 1 - mixIn }}><Seat frame={f} k={k} /></AbsoluteFill>}
        </>
      )}
      {on === "rows" && <Stranger frame={f} k={k} />}
      {on === "pitch" && <Pitch frame={f} k={k} />}
      {on === "boxwatch" && <BoxWatch frame={f} k={k} />}
      {on === "turned" && <Turned frame={f} k={k} />}
      <Readout label="EVERYONE YOU CAN SEE" value={value} frame={f} on={k.upFrom + 20} />
    </AbsoluteFill>
  );
};

export const stadium: Beat = { id: "Stadium", first: "Two rows down.", lead: 6.6, Component };
