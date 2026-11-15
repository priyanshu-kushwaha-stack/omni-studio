// The Kettle Lead's wordless peak (the 9 s hold after line 71), a triumph cut slow: the homemade plug goes into the
// spare socket; nothing; one flap twitches; you climb in and the door comes down; your boss steps past the mop; the
// counter flutters, slowly at first (001, 002, 003) and then in a card storm, his face lit crimson by it, the hall's
// portholes glowing round this one hatch; a dissolve to dawn, the wedge crossing the floor; the click on 365; the door
// up: you half out, lids heavy, the opening's grin, grey at the temples; your boss exactly where he stood, tie loose,
// a cold coffee; your flatmate asleep on the stairs, the mop over her shoulder like a rifle. Your bubble: "Staff first."
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { lerpPose, SEATED, seatedY, STAND, walkPose } from "@whatif/kit/rig/pose";
import { Mug } from "@whatif/kit/sets/props";
import { worldOf } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { toScreen, type Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK } from "@whatif/kit/theme";
import { Bubble } from "../parts";
import { FLOOR, POD_ONE, POD_ONE_COUNTER } from "../sets/PodHall";
import { BOSS, camAt, linear, mix, ramp } from "../shared";
import { BarMop, HallStage, HomePlug, NightDesk, Sockets, SPARE, Temples } from "./NightThirty.Hall";
import { BOSS_SCALE, bossOnStairs, FOOT, WORK } from "./KettleLead.Hall";
import { HallStairs, stairsAt } from "./TellMeNow.Kitchen";
import { aimArm, handAt, headOf, Mate, You, type Body } from "./Timeline.Cast";
import type { KL } from "./KettleLead";

const LIP = { x: POD_ONE.x + 150, y: POD_ONE.y + POD_ONE.h - 6 };
/** Where your boss ends up: a step past the mop, in front of your hatch. */
const BOSS_AT = 900;

export function peakTimes(k: KL) {
  const g = k.teach - k.peak;
  const q = (f: number) => Math.round(k.peak + g * f);
  return {
    plug: q(0.05), still: q(0.1), twitch: q(0.15), climb: [q(0.2), q(0.28)] as const, door: [q(0.26), q(0.32)] as const,
    step: [q(0.28), q(0.4)] as const, flutter: q(0.31), face: q(0.4), pull: q(0.5), dissolve: [q(0.6), q(0.7)] as const, click: q(0.72),
    up: [q(0.76), q(0.82)] as const, reveal: q(0.76), bubble: Math.max(q(0.86), k.teach - 45),
  };
}
export type PK = ReturnType<typeof peakTimes>;

/** The counter on your hatch at this frame: dark; one flap twitching; then 001, 002, 003 slowly, a storm up to 365. */
export function peakCounter(frame: number, p: PK): { value?: string; dark?: boolean } {
  if (frame >= p.twitch && frame < p.twitch + 5) return { value: "000" };
  if (frame < p.flutter) return { dark: true };
  const steps = [p.flutter, p.flutter + 14, p.flutter + 26];
  if (frame < steps[1]) return { value: "001" };
  if (frame < steps[2]) return { value: "002" };
  if (frame < steps[2] + 10) return { value: "003" };
  const t = linear(frame, steps[2] + 10, p.click);
  const n = frame >= p.click ? 365 : Math.max(4, Math.min(364, Math.round(4 + 360 * t * t)));
  return { value: String(n).padStart(3, "0") };
}

/** The frames where a counter tick is heard (the slow first flaps), for KettleLead.tsx's sound. */
export const peakTicks = (p: PK) => [p.twitch, p.flutter, p.flutter + 14, p.flutter + 26];

/** A loose tie: knot pulled down, the tail swung aside. At (x, y), the neck. */
const LooseTie: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y + 16 * s}) rotate(24) scale(${s})`}>
    <path d="M0 0 l10 12 l-6 44 l-10 -6 l-4 -38 Z" fill={BOSS.tie} stroke={INK} strokeWidth={2} />
  </g>
);

function bossBody(frame: number, p: PK): Body {
  if (frame < p.step[0]) return bossOnStairs(frame, 0.24, false);
  const t = ramp(frame, p.step[0], p.step[1]);
  const from = stairsAt(0.24);
  const walking = t > 0 && t < 1;
  return { x: mix(from.x, BOSS_AT, t), y: mix(from.y, FLOOR, Math.min(1, t * 3)), scale: BOSS_SCALE, facing: -1, pose: walking ? walkPose(frame * 0.3) : { ...STAND, lean: frame >= p.reveal ? -6 : 2 } };
}

/** One camera's view of the peak, in a given mood. */
const PeakHall: React.FC<{ frame: number; k: KL; p: PK; cam: Camera; mood: MoodName; on: string }> = ({ frame, k, p, cam, mood, on }) => {
  const door = frame < p.door[0] ? 1 : frame < p.up[0] ? 1 - ramp(frame, p.door[0], p.door[1]) : ramp(frame, p.up[0], p.up[1]);
  const seat = worldOf(cam, LIP.x, LIP.y, 0.85);
  const spare = worldOf(cam, SPARE.x, SPARE.y, 0.85);
  const counter = peakCounter(frame, p);
  const morning = mood === "morning";
  // you: pushing the plug in, staring, climbing in; after the click, half out on the lip
  let you: Body | null = null;
  if (frame < p.climb[0]) {
    you = { x: WORK.x, y: FLOOR, scale: WORK.scale, facing: -1, pose: { ...STAND, lean: 10 } };
    const push = ramp(frame, k.peak, p.plug);
    you.pose = { ...you.pose, armF: aimArm(you, { x: spare.x + mix(60, 30, push), y: spare.y }) };
  } else if (frame < p.reveal) {
    const t = ramp(frame, p.climb[0], p.climb[1]);
    you = { x: mix(WORK.x, seat.x - 30, t), y: mix(FLOOR, seatedY(seat.y, 0.95), t), scale: mix(WORK.scale, 0.95, t), facing: -1, pose: lerpPose(STAND, { ...SEATED, lean: -20 }, t) };
    if (door < 0.45) you = null;
  } else if (door > 0.45) {
    you = { x: seat.x, y: seatedY(seat.y, 0.95), scale: 0.95, facing: 1, pose: { ...SEATED, lean: 4, tilt: 6, armF: [40, 50], armB: [-6, 30] } };
  }
  const boss = bossBody(frame, p);
  const bh = headOf(boss);
  const mateBody: Body = morning
    ? { x: 1830, y: seatedY(856, FOOT.scale), scale: FOOT.scale, facing: -1, pose: { ...SEATED, lean: -8, tilt: 22, armF: [150, 30], armB: [30, 40] } }
    : { x: FOOT.x, y: FLOOR, scale: FOOT.scale, facing: frame >= p.step[0] ? -1 : 1, pose: { ...STAND, armF: [70, 20], armB: [20, 30] } };
  const mh = handAt(mateBody);
  const mopFromBack = handAt(mateBody, "back");
  if (frame >= p.reveal) boss.pose = { ...boss.pose, armF: aimArm(boss, { x: bh.x - 70, y: bh.y + 110 }) };
  const bossHand = handAt(boss);
  const lit = frame >= p.flutter && !morning;
  const youFace = frame < p.climb[0]
    ? { brows: (frame < p.twitch ? "flat" : "raised") as "flat" | "raised", lids: 0.1, mouth: "flat" as const, eyes: frame >= p.twitch ? 1.2 : 1, look: { x: 0.8, y: frame >= p.still ? -0.7 : 0.2 } }
    : frame < p.reveal ? { brows: "raised" as const, lids: 0, mouth: "smile" as const, eyes: 1, look: { x: 1, y: 0 } }
    : { brows: "flat" as const, lids: 0.62, mouth: "smirk" as const, eyes: 0.9, look: { x: 0.95, y: 0.05 } };
  const actors = (
    <>
      <HallStairs />
      <Sockets cam={cam} tape={0} spareIn={frame >= p.plug} />
      <NightDesk lamp={false} lampPlug={{ x: 740, y: 940 }} kettlePlug={{ x: 772, y: 944 }} />
      {you && <You body={you} face={youFace} frame={frame} />}
      {you && frame >= p.reveal && <Temples body={you} />}
      {frame < p.reveal ? (
        <Figure {...boss} head={BOSS.head} coat={BOSS.coat} tie={BOSS.tie} time={frame} blink={frame % 97 < 4}
          brows={frame >= p.face ? "raised" : "flat"} lids={frame >= p.flutter ? 0 : 0.2} mouth={frame >= p.flutter ? "o" : "flat"} eyes={frame >= p.flutter ? 1.25 : 1}
          look={{ x: 1, y: frame >= p.step[1] ? -0.4 : 0.3 }} />
      ) : (
        <>
          <Figure {...boss} head={BOSS.head} coat={BOSS.coat} time={frame} blink={false} brows="raised" lids={0} mouth="open" eyes={1.3} look={{ x: 1, y: -0.2 }} />
          <LooseTie x={boss.x - 4} y={bh.y + 40 * BOSS_SCALE} s={BOSS_SCALE} />
          <Mug x={bossHand.x - 6} y={bossHand.y + 22} scale={0.5} />
        </>
      )}
      {lit && (
        <g>
          <defs>
            <radialGradient id="kl-crimson" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor={CRIMSON} stopOpacity={0.5} />
              <stop offset="1" stopColor={CRIMSON} stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle cx={bh.x - 30} cy={bh.y + 30} r={bh.r * 3} fill="url(#kl-crimson)" />
        </g>
      )}
      <Mate body={mateBody} frame={frame} face={morning
        ? { brows: "none", lids: 1, mouth: "o", eyes: 1, look: { x: 0, y: 0.3 } }
        : { brows: "raised", lids: 0, mouth: frame >= p.flutter ? "o" : "smile", eyes: 1.15, look: { x: 1, y: 0.1 } }} />
      {morning
        ? <line x1={mh.x + 10} y1={mh.y + 20} x2={mh.x + 150} y2={mh.y - 260} stroke="#c9915a" strokeWidth={9} strokeLinecap="round" />
        : frame < p.step[0] && <BarMop x1={mh.x - 30} x2={mh.x + 190} y={mh.y} />}
      {!morning && frame >= p.step[0] && <line x1={mopFromBack.x} y1={mopFromBack.y} x2={mopFromBack.x - 40} y2={FLOOR - 10} stroke="#c9915a" strokeWidth={9} strokeLinecap="round" />}
      {on === "plug" && frame < p.plug + 2 && <HomePlug x={spare.x + mix(60, 30, ramp(frame, k.peak, p.plug)) - 26} y={spare.y} scale={0.7} />}
      {you && frame >= p.bubble && (
        <Bubble frame={frame} at={p.bubble} x={headOf(you).x + 46} y={headOf(you).y - 60} text="Staff first." size={40} side="right" />
      )}
    </>
  );
  const c = worldOf(cam, POD_ONE_COUNTER.x, POD_ONE_COUNTER.y, 0.85);
  const cs = toScreen(cam, c.x, c.y);
  const glows = lit ? [{ x: cs.x, y: cs.y, r: 340 * cam.zoom, color: CRIMSON, strength: 0.55 }] : [];
  return (
    <HallStage cam={cam} frame={frame} mood={mood} lamp={false} glows={glows}
      hall={{ door, counter, wedge: morning, flutterAll: !morning && frame < p.flutter, minutes: morning ? 50 : 42 }} actors={actors} />
  );
};

/** The peak, shot by shot, with the dawn dissolve as two hall layers crossfading. */
export const PeakScene: React.FC<{ frame: number; k: KL }> = ({ frame, k }) => {
  const p = peakTimes(k);
  const bossNow = bossBody(frame, p);
  const bh = headOf(bossNow);
  const spareCam: Camera = { x: 720, y: 770, zoom: 3.0 };
  const sp = worldOf(spareCam, SPARE.x, SPARE.y, 0.85);
  const wide: Camera = { x: 980, y: 620, zoom: 1.0 };
  let on = "plug";
  let cam: Camera;
  if (frame < p.still) cam = camAt(frame, [[k.peak, { x: sp.x + 40, y: sp.y, zoom: 3.0 }], [p.still, { x: sp.x + 40, y: sp.y, zoom: 3.2 }]]);
  else if (frame < p.climb[0]) { on = "still"; cam = camAt(frame, [[p.still, { x: 690, y: 690, zoom: 2.0 }], [p.climb[0], { x: 690, y: 690, zoom: 2.1 }]]); }
  else if (frame < p.face) { on = "climb"; cam = camAt(frame, [[p.climb[0], wide], [p.face, { ...wide, zoom: 1.04 }]]); }
  else if (frame < p.dissolve[0]) {
    on = "face";
    cam = camAt(frame, [[p.face, closeUp(bh.x - 140, bh.y + 20, 2.3)], [p.pull, closeUp(bh.x - 160, bh.y + 20, 2.45)], [p.pull + 34, { x: 820, y: 620, zoom: 1.2 }], [p.dissolve[0], { x: 830, y: 620, zoom: 1.12 }]]);
  } else if (frame < p.reveal) { on = "dawn"; cam = camAt(frame, [[p.dissolve[0], { x: 830, y: 620, zoom: 1.12 }], [p.reveal, { x: 900, y: 630, zoom: 1.04 }]]); }
  else { on = "reveal"; cam = camAt(frame, [[p.reveal, { x: 980, y: 630, zoom: 1.0 }], [p.bubble - 10, { x: 980, y: 630, zoom: 1.02 }], [k.teach, { x: 820, y: 660, zoom: 1.2 }]]); }
  cam = drift(cam, frame, "kl-peak", 2);
  if (on !== "dawn") {
    return <PeakHall frame={frame} k={k} p={p} cam={cam} mood={on === "reveal" ? "morning" : "night"} on={on} />;
  }
  const d = ramp(frame, p.dissolve[0], p.dissolve[1]);
  return (
    <AbsoluteFill>
      <PeakHall frame={frame} k={k} p={p} cam={cam} mood="night" on={on} />
      <AbsoluteFill style={{ opacity: d }}>
        <PeakHall frame={frame} k={k} p={p} cam={cam} mood="morning" on={on} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

