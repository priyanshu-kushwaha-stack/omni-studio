// Helpers for "The Queue" (TheQueue.tsx), the train (library metroCoach, the parts from TheTrain*.tsx): every head on
// its phone under LOOKS AT PHONE 99%, two crimson cards in the middle of the bench; the passengers either side lean
// over to read them, their cards flap to NOSY 99%, and they snap back to their phones, caught; the fare board ticks
// down for them. Then his hand, palm up; you drop the key in without looking (the clink); "Trust me?"; across the
// aisle the kid with the cap, feet swinging, no phone, a BLANK card, the platform's teal lamps blinking past behind
// him; he catches you looking and winks; the last image: his blank card, the teal lamps, your crimson card at the top.
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, type Pose } from "@whatif/kit/rig/pose";
import { metroCoach } from "@whatif/kit/sets";
import { LookContext } from "@whatif/kit/stage/Look";
import { setLook } from "@whatif/kit/sets/common";
import { drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { HandPhone } from "@whatif/kit/sets/props";
import { TEAL } from "@whatif/kit/theme";
import { RateBoard, Tag, type BoardKey, type TagKey } from "../device";
import { headAt } from "../kit";
import { blinking, camAt, FRIEND, HERO, KID, mix, PASTELS, ramp } from "../shared";
import { BrassKey } from "./TheKey.Frame";
import { Hands } from "./TheKey.Hands";
import { talking } from "./TheKey.Court";
import { BenchClose, PHONE_SIT, SEAT_S, SEAT_Y, Wink } from "./TheTrain.Parts";
import { crimson } from "./TheQueue.Court";
import { Deep } from "../sets/common";

/** The moments these shots need (TheQueue.tsx's times()). */
export interface TT {
  start: number; train: number; coach: number; lean: number; nosy: number; snap: number; hold: number; drop: number; fall: number; close: number;
  grin: number; trust: number; trustEnd: number; kid: number; winkShot: number; wink: number; last: number;
}

/** Where everyone sits: you and him in the middle of the bench, phones either side. */
export const YOU_X = 800;
export const HIM_X = 965;
const PASSENGERS = [-280, -70, 140, 360, 580, 1185, 1405, 1625, 1845, 2065];
/** The nosy ones: the two either side of you, and the next two out. */
const NOSY = new Set([360, 580, 1185, 1405]);

const looks = (from: number): TagKey => ({ at: from, text: "LOOKS AT PHONE", pct: 99, state: "tick" });

/** Every card ticks together; the fare board ticks down with them. */
const tickTimes = (k: TT) => [k.train + 20, k.coach + 16, k.snap + 14, k.hold + 60, k.hold + 130];
export const fareKeys = (k: TT): BoardKey[] => [
  { at: k.start - 400, value: "1.70" }, ...tickTimes(k).map((at, i) => ({ at, value: ["1.60", "1.50", "1.40", "1.30", "1.20"][i] })),
];
/** A passenger's card: ticks with the rest; the nosy ones flap to NOSY 99% while they lean over, then snap back. */
export const passengerKeys = (k: TT, nosy: boolean, i: number): TagKey[] => {
  const keys = [looks(k.start - 400), ...tickTimes(k).map(looks)];
  if (!nosy) return keys;
  return [...keys, { at: k.nosy + i * 3, text: "NOSY", pct: 99, state: "tick" as const }, looks(k.snap + i * 2)].sort((a, b) => a.at - b.at);
};

/** One passenger on the bench with a phone; the nosy ones lean toward your two cards and look up at them, then snap
 *  back down to the phone, caught. */
const Rider: React.FC<{ frame: number; x: number; i: number; k: TT }> = ({ frame, x, i, k }) => {
  const nosy = NOSY.has(x);
  const toward: 1 | -1 = x < YOU_X ? 1 : -1;
  const facing: 1 | -1 = nosy ? toward : i % 2 ? 1 : -1;
  const lean = nosy ? ramp(frame, k.lean + (i % 2) * 4, k.lean + 14) * (1 - ramp(frame, k.snap, k.snap + 4)) : 0;
  const pose: Pose = { ...PHONE_SIT, lean: mix(PHONE_SIT.lean, 18, lean), tilt: mix(PHONE_SIT.tilt, -6, lean) };
  const h = headAt(x, SEAT_Y, SEAT_S, pose, facing);
  const caught = nosy && frame >= k.snap && frame < k.snap + 40;
  return (
    <g>
      <Figure x={x} y={SEAT_Y} scale={SEAT_S} facing={facing} pose={pose} head={PASTELS[i % PASTELS.length]} coat={["#3b4a6b", "#2a2d36", "#5f3d6b", "#2f5f63"][i % 4]}
        mouth={lean > 0.5 ? "o" : "flat"} brows={lean > 0.5 || caught ? "raised" : "none"} lids={lean > 0.5 ? 0 : 0.35} eyes={lean > 0.5 ? 1.15 : 1}
        look={lean > 0.5 ? { x: 0.8, y: -0.8 } : { x: 0.5, y: 0.9 }} blink={blinking(frame, i + 5)} time={frame} held={<HandPhone lit scale={1.1} />} />
      <Tag frame={frame} x={h.x} headY={h.y} r={h.r} scale={0.62} threadTop={75} keys={passengerKeys(k, nosy, i)} />
    </g>
  );
};

/** Your seated pose: facing the window, the back hand out behind you for the key. */
function yourPose(frame: number, k: TT): Pose {
  const give = ramp(frame, k.hold + 24, k.hold + 40) * (1 - ramp(frame, k.close + 8, k.close + 26));
  return { ...SEATED, armB: [mix(10, -55, give), mix(25, -30, give)] };
}
function hisPose(frame: number, k: TT): Pose {
  const out = ramp(frame, k.hold + 2, k.hold + 22);
  return { ...SEATED, armF: [mix(25, 78, out), mix(35, -18, out)] };
}

const coachProps = (cam: Camera, frame: number) => ({ cam, mood: "morning" as const, frame, options: { ...metroCoach.defaults, speed: 7 } });

export const Coach: React.FC<{ frame: number; k: TT; cam: Camera; youLook?: { x: number; y: number } }> = ({ frame, k, cam, youLook = { x: 0.7, y: -0.25 } }) => {
  const yp = yourPose(frame, k);
  const hp = hisPose(frame, k);
  const yh = headAt(YOU_X, SEAT_Y, SEAT_S, yp, -1);
  const hh = headAt(HIM_X, SEAT_Y, SEAT_S, hp, -1);
  const grinning = frame >= k.hold + 6;
  const actors = (
    <>
      {PASSENGERS.map((x, i) => <Rider key={x} frame={frame} x={x} i={i} k={k} />)}
      <Figure x={YOU_X} y={SEAT_Y} scale={SEAT_S} facing={-1} pose={yp} {...HERO} brows="none" lids={0.15} mouth="smile" eyes={1}
        look={youLook} time={frame} blink={blinking(frame, 1)} />
      <Figure x={HIM_X} y={SEAT_Y} scale={SEAT_S} facing={-1} pose={hp} head={FRIEND.head} coat={FRIEND.coat} brows={grinning ? "raised" : "none"} lids={0.1}
        mouth={talking(frame, k.trust, k.trustEnd) ? "open" : grinning ? "smile" : "flat"} eyes={1.05} look={{ x: 0.9, y: -0.15 }} time={frame} blink={blinking(frame, 2)}
        held={frame >= k.close ? <BrassKey x={0} y={-6} scale={0.22} rotate={30} glint={0} /> : undefined} />
      <Tag frame={frame} x={yh.x} headY={yh.y} r={yh.r} scale={0.75} threadTop={75} keys={crimson(k.start - 400)} />
      <Tag frame={frame} x={hh.x} headY={hh.y - 70} r={hh.r} scale={0.75} threadTop={75} keys={crimson(k.start - 400)} />
      <RateBoard frame={frame} x={1760} y={120} size={40} label="FARE" keys={fareKeys(k)} />
    </>
  );
  const p = coachProps(cam, frame);
  return (
    <LookContext.Provider value={setLook(metroCoach.lights(p.options), "morning", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={metroCoach.Back(p)} actors={actors} front={metroCoach.Front?.(p)} />
    </LookContext.Provider>
  );
};

/** The hands insert: you drop the key into his open palm without looking (the clink); his fingers close. */
export const DropShot: React.FC<{ frame: number; k: TT }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.drop, { x: 960, y: 560, zoom: 1.0 }], [k.grin, { x: 960, y: 580, zoom: 1.1 }]]), frame, "q-drop", 3);
  const fall = Math.pow(ramp(frame, k.fall, k.fall + 10), 2);
  const you = { x: 760, y: 470, curl: mix(0.4, 0, ramp(frame, k.fall - 6, k.fall + 2)), down: true };
  const him = { x: 1060, y: 760, curl: ramp(frame, k.close, k.close + 14) * 0.85 };
  const key = { x: mix(860, 990, fall), y: mix(520, 740, fall), rotate: mix(-30, 10, fall), scale: 1.4 };
  return (
    <LookContext.Provider value={setLook([], "morning", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<BenchClose frame={frame} />} actors={<Hands you={you} him={him} keyAt={key} himDrop={240} />} />
    </LookContext.Provider>
  );
};

/** The platform's teal lamps blinking past behind the windows (metroCoach's two WINDOWS, world at depth 1), clipped to
 *  the glass so they never cross the wall. */
const WINDOWS = [{ x: 250, y: 290, w: 620, h: 310 }, { x: 1050, y: 290, w: 620, h: 310 }];
const LampsPast: React.FC<{ frame: number; cam: Camera }> = ({ frame, cam }) => (
  <Deep cam={cam} depth={1}>
    <clipPath id="queue-lamps-glass">{WINDOWS.map((w, i) => <rect key={i} x={w.x} y={w.y} width={w.w} height={w.h} rx={30} />)}</clipPath>
    <g clipPath="url(#queue-lamps-glass)">
      {Array.from({ length: 5 }, (_, i) => {
        const x = (((i * 700 - frame * 26) % 3500) + 3500) % 3500 - 300;
        return (
          <g key={i}>
            <rect x={x - 6} y={300} width={12} height={300} fill="#5c6675" opacity={0.6} />
            <circle cx={x} cy={360} r={46} fill={TEAL} opacity={0.25} />
            <circle cx={x} cy={360} r={16} fill="#7fe0d4" />
          </g>
        );
      })}
    </g>
  </Deep>
);

/** Across the aisle: the kid with the cap, feet swinging, no phone, a blank card; the teal lamps blinking past behind
 *  him; he catches you looking and winks. `last` frames the final image: his blank card, the lamps, your crimson card
 *  hanging in at the top edge. */
export const KidShot: React.FC<{ frame: number; k: TT; cam: Camera; last?: boolean }> = ({ frame, k, cam, last = false }) => {
  const kx = 960;
  const swing = Math.sin(frame / 7) * 22;
  const pose: Pose = { ...SEATED, armF: [20, 30], legF: [92, -92 + swing], legB: [88, -88 - swing] };
  const caught = frame >= k.winkShot + 8;
  const look = caught ? { x: 0.2, y: 0.05 } : { x: 0.9, y: -0.3 };
  const kh = headAt(kx, SEAT_Y, SEAT_S, pose, -1);
  const winking = frame >= k.wink && frame < k.wink + 16;
  const actors = (
    <>
      {[400, 620, 1300, 1520].map((x, i) => {
        const h = headAt(x, SEAT_Y, SEAT_S, PHONE_SIT, i % 2 ? -1 : 1);
        return (
          <g key={x}>
            <Figure x={x} y={SEAT_Y} scale={SEAT_S} facing={i % 2 ? -1 : 1} pose={PHONE_SIT} head={PASTELS[(i + 3) % PASTELS.length]} coat={["#3b4a6b", "#2a2d36"][i % 2]}
              mouth="flat" lids={0.35} look={{ x: 0.5, y: 0.9 }} blink={blinking(frame, i + 8)} time={frame} held={<HandPhone lit scale={1.1} />} />
            <Tag frame={frame} x={h.x} headY={h.y} r={h.r} scale={0.62} threadTop={75} keys={[looks(k.start - 400)]} />
          </g>
        );
      })}
      <Figure x={kx} y={SEAT_Y} scale={SEAT_S} facing={-1} pose={pose} head={KID.head} coat={KID.coat} cap={KID.cap}
        brows={caught ? "raised" : "none"} mouth={caught ? "smirk" : "flat"} eyes={1.05} look={look} time={frame} blink={blinking(frame, 4) && !winking} />
      {winking && <Wink x={kx} y={SEAT_Y} scale={SEAT_S} facing={-1} pose={pose} head={KID.head} look={look} />}
      <Tag frame={frame} x={kh.x} headY={kh.y} r={kh.r} scale={0.75} threadTop={75} keys={[{ at: k.start - 400, text: "", pct: null, state: "blank" }]} />
      {/* your crimson card, hanging into the top of the frame from your side of the aisle */}
      {last && <Tag frame={frame} x={1300} headY={-40} r={70} scale={0.9} threadTop={-900} keys={crimson(k.start - 400)} />}
    </>
  );
  const p = coachProps(cam, frame);
  return (
    <LookContext.Provider value={setLook(metroCoach.lights(p.options), "morning", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<g>{metroCoach.Back(p)}<LampsPast frame={frame} cam={cam} /></g>} actors={actors} />
    </LookContext.Provider>
  );
};
