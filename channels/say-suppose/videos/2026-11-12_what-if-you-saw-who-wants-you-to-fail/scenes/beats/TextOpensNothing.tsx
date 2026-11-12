// Beat "A Text Would Open Nothing" (script.md "## [06:55] A Text Would Open Nothing"; narration lines 91-101; mood day).
// Every frame comes from the clips (`times`), one component per shot.
//
//   91   results, the phone in your hand: three boxes, each a big 1, one per "Grade one"; your face at the edge.
//   92   the classroom: Min-jun at the next desk turns his phone to you; insert: his 1.
//   93   paper: everyone who sat it as a sea of dots, the top four per cent teal.
//   94   the same sheet: your class's seats on the left, four teal; "a seat" lifts the four, "a sea" the teal dots.
//   95   close on Min-jun, your notebook on his desk; close on you, softening. He holds out half a kimbap: "Half?"
//   96   you take it.
//   97   the phone: her name, the box; you type half a line. 98 the thumb hovers over send and stops.
//   99   the bus: you at the window, the city sliding past.
//   100  a bus shelter goes by with a small paper subscribe tag (no voice); paper: a third of all regrets.
//   101  your thumb over her name, the half-typed text; the phone face down on your knee; you look up: the depot gates.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { SEATED, seatedY, type Pose } from "@whatif/kit/rig/pose";
import { bus, classroom, HandPhone, phone } from "@whatif/kit/sets";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { Bubble, Kimbap, Sheet, headAt } from "../parts";
import { blinking, camAt, current, HERO, JIYOON, linear, MINJUN, mix, ramp, type Beat, type Shot } from "../shared";
import { Deep } from "../sets/common";
import { MistakeBookSide } from "./HoldsBreath.Parts";
import { aimArm, Dim, Fade, handAt, timer, type Body } from "./Notebook.Parts";
import { DepotGates, HeldResult, PastTheWindow, PHONE, PhoneBack, RegretPie, ResultScreen, SeatAndSea, ShelterAd, Thumb } from "./TextOpensNothing.Parts";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const { from, at, end } = timer(clips);
  return {
    results: from(91),
    g1: at(91, 0.16), // "Grade one."
    g2: at(91, 0.34), // "Grade one."
    g3: at(91, 0.52), // "Grade one."
    holds: at(91, 0.72), // "The scholarship holds."
    minjun: from(92), // the classroom, Min-jun at the next desk
    his: at(92, 0.5), // "grade one in maths too": his phone
    sea: from(93), // the sea of dots
    teal: at(93, 0.55), // "the top four per cent of everyone who sat it"
    seat: from(94), // the class's seats come in
    seatHi: at(94, 0.42), // "A seat in one case"
    seaHi: at(94, 0.7), // "and a sea in the other"
    gave: from(95), // close on Min-jun, your notebook on his desk
    never: at(95, 0.55), // "It was never a seat."
    half: end(95) - 8, // he holds out half a kimbap: "Half?"
    take: from(96), // "You take it."
    her: from(97), // the phone: her name, the box
    keep: from(98) + 4, // "A text would open nothing": the thumb over send
    bus: from(99), // "You're on the bus."
    ad: from(100) - 4, // the shelter ad goes by
    pie: at(100, 0.4), // "the most common regret of a life is education, about a third"
    thumb: from(101), // your thumb over her name
    down: at(101, 0.42), // the phone face down
    up: at(101, 0.78), // you look up: the depot gates
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ line 91

const ResultsShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.results, { x: 960, y: 540, zoom: 1 }], [k.minjun, { x: 1060, y: 540, zoom: 1.12 }]]), frame, "results", 3);
  const props = { cam, mood: "day" as const, frame, options: { ...phone.defaults, mode: "off" as const, thumb: null, behind: "desk" as const } };
  const spot = phone.spots.face;
  const face = frame < k.g1
    ? { ...EXPRESSIONS.worried, look: { x: 1, y: 0.2 } }
    : frame < k.holds ? { ...EXPRESSIONS.shocked, look: { x: 1, y: 0.25 } } : { ...EXPRESSIONS.relieved, look: { x: 1, y: 0.2 } };
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={phone.Back(props)}
      actors={
        <>
          <Figure {...HERO} x={spot.x} y={spot.y} scale={spot.scale} facing={spot.facing} {...face} blink={blinking(frame, 2)} time={frame} />
          {phone.Mid?.(props)}
          <ResultScreen frame={frame} at={[k.g1, k.g2, k.g3]} />
        </>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ lines 92-96

const ROOM_OPTS = { ...classroom.defaults, board: "blank" as const, drawn: 0, farRow: true };
const SS = 1.05;
const SEAT_TOP = 850;
const ME_X = 640;
const HIM_X = 900;

/** You and Min-jun side by side at your bench desks, him turned toward you. `his` and `mine` set the arm poses. */
const Desks: React.FC<{
  frame: number; cam: Camera; myFace: object; hisFace: object; myArm?: [number, number]; hisArm?: [number, number]; hisProp?: React.ReactNode;
  myProp?: React.ReactNode; notebook?: boolean; over?: React.ReactNode;
}> = ({ frame, cam, myFace, hisFace, myArm, hisArm, hisProp, myProp, notebook, over }) => {
  const props = { cam, mood: "day" as const, frame, options: ROOM_OPTS };
  const y = seatedY(SEAT_TOP, SS);
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={classroom.Back(props)}
      actors={
        <>
          <Figure {...HERO} x={ME_X} y={y} scale={SS} pose={myArm ? { ...SEATED, armF: myArm } : SEATED} {...myFace} blink={blinking(frame, 1)} time={frame} />
          <Figure head={MINJUN.head} coat={MINJUN.coat} x={HIM_X} y={y} scale={SS} facing={-1} pose={hisArm ? { ...SEATED, armF: hisArm } : SEATED}
            {...hisFace} blink={blinking(frame, 4)} time={frame} />
          {classroom.Mid?.(props)}
          {notebook && <MistakeBookSide x={HIM_X + 120} y={762} tilt={-7.6} scale={0.9} />}
          {hisProp}
          {myProp}
          {over}
        </>
      }
      front={classroom.Front?.(props)} />
  );
};

const me: Body = { x: ME_X, y: seatedY(SEAT_TOP, SS), scale: SS, facing: 1, pose: SEATED };
const him: Body = { x: HIM_X, y: seatedY(SEAT_TOP, SS), scale: SS, facing: -1, pose: SEATED };
const myHead = headAt(me.x, me.y, SS, SEATED);
const hisHead = headAt(him.x, him.y, SS, SEATED, -1);

const MinjunShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.minjun, "two"], [k.his, "his"]]);
  const up = ramp(frame, k.minjun + 6, k.minjun + 20);
  const arm: [number, number] = [mix(20, 72, up), mix(20, 40, up)];
  const hand = handAt({ ...him, pose: { ...SEATED, armF: arm } });
  const cams: Record<typeof shot, Camera> = {
    two: camAt(frame, [[k.minjun, { x: 780, y: 650, zoom: 1.6 }], [k.his, { x: 790, y: 640, zoom: 1.7 }]]),
    his: camAt(frame, [[k.his, insert(hand.x - 10, hand.y - 30, 3.2)], [k.sea, insert(hand.x - 10, hand.y - 30, 3.5)]]),
  };
  const seen = ramp(frame, k.minjun + 24, k.minjun + 36);
  return (
    <Desks frame={frame} cam={drift(cams[shot], frame, "minjun", 2)} hisArm={arm}
      myFace={seen > 0.5 ? { ...EXPRESSIONS.happy, eyes: 1.1, brows: "raised" as const, look: { x: 0.9, y: 0 } } : { ...EXPRESSIONS.relieved, look: { x: 0.9, y: 0.1 } }}
      hisFace={{ ...EXPRESSIONS.happy, brows: "raised" as const, look: { x: 0.9, y: 0 } }}
      hisProp={<HeldResult x={hand.x - 6} y={hand.y - 70} scale={1} tilt={-6} head={MINJUN.head} />} />
  );
};

const SeaShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = { x: 780, y: 620, zoom: 1.25 };
  const zoom = mix(1, 1.05, linear(frame, k.sea, k.gave));
  return (
    <>
      <Desks frame={frame} cam={drift(cam, frame, "sea", 3)} myFace={{ ...EXPRESSIONS.sceptical, look: { x: 0.6, y: -0.3 } }}
        hisFace={{ ...EXPRESSIONS.neutral, look: { x: -0.4, y: -0.3 } }} />
      <Dim amount={0.4} />
      <Stage cam={{ x: 960, y: 540, zoom }} radius={0} origin={{ x: 0, y: 0 }} back={null}
        actors={
          <Sheet frame={frame} at={k.sea} x={960} y={520} w={1400} h={640} tilt={-1.5}>
            <SeatAndSea frame={frame} sea={linear(frame, k.sea + 6, k.sea + 40)} teal={ramp(frame, k.teal, k.teal + 8)}
              seats={ramp(frame, k.seat, k.seat + 16)} pulseSeats={frame >= k.seatHi && frame < k.seaHi ? 1 : 0} pulseSea={frame >= k.seaHi ? 1 : 0} />
          </Sheet>
        } />
    </>
  );
};

const GaveShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.gave, "him"], [k.never, "me"], [k.half, "two"]]);
  const out = ramp(frame, k.half, k.half + 14);
  const arm: [number, number] = [mix(20, 80, out), mix(20, 12, out)];
  const hand = handAt({ ...him, pose: { ...SEATED, armF: arm } });
  const cams: Record<typeof shot, Camera> = {
    him: camAt(frame, [[k.gave, closeUp(hisHead.x - 30, hisHead.y, 2.6)], [k.never, closeUp(hisHead.x - 30, hisHead.y, 2.85)]]),
    me: camAt(frame, [[k.never, closeUp(myHead.x + 40, myHead.y, 2.6)], [k.half, closeUp(myHead.x + 40, myHead.y, 2.8)]]),
    two: camAt(frame, [[k.half, { x: 790, y: 630, zoom: 1.75 }], [k.take, { x: 790, y: 630, zoom: 1.8 }]]),
  };
  const soft = ramp(frame, k.never + 10, k.never + 26);
  const myFace = shot === "me"
    ? { brows: soft > 0.5 ? "raised" as const : "flat" as const, lids: mix(0.2, 0.35, soft), mouth: soft > 0.5 ? "smile" as const : "flat" as const, eyes: 1, look: { x: 0.9, y: 0.1 } }
    : { ...EXPRESSIONS.relieved, look: { x: 0.9, y: 0.1 } };
  return (
    <Desks frame={frame} cam={drift(cams[shot], frame, "gave", 2)} hisArm={arm} notebook
      myFace={myFace} hisFace={{ ...EXPRESSIONS.happy, look: { x: 0.9, y: shot === "him" ? 0.5 : 0.05 } }}
      hisProp={out > 0 ? <Kimbap x={hand.x - 8} y={hand.y - 18} scale={0.5} half tilt={-10} /> : null}
      over={<Bubble frame={frame} at={k.half + 10} until={k.take + 24} x={hisHead.x + 40} y={hisHead.y - 74} text="Half?" side="right" />} />
  );
};

const TakeShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const hisArm: [number, number] = [80, 12];
  const hisHand = handAt({ ...him, pose: { ...SEATED, armF: hisArm } });
  const reach = ramp(frame, k.take + 2, k.take + 14);
  const got = frame >= k.take + 16;
  const back = ramp(frame, k.take + 18, k.take + 34);
  const reachArm = aimArm(me, { x: hisHand.x - 30, y: hisHand.y });
  const restArm: [number, number] = [60, 50];
  const myArm: [number, number] = got
    ? [mix(reachArm[0], restArm[0], back), mix(reachArm[1], restArm[1], back)]
    : [mix(SEATED.armF[0], reachArm[0], reach), mix(SEATED.armF[1], reachArm[1], reach)];
  const hisNow: [number, number] = got ? [mix(80, 20, back), mix(12, 20, back)] : hisArm;
  const myHand = handAt({ ...me, pose: { ...SEATED, armF: myArm } });
  const cam = drift(camAt(frame, [[k.take, { x: 790, y: 630, zoom: 1.8 }], [k.her, { x: 770, y: 640, zoom: 1.95 }]]), frame, "take", 2);
  return (
    <Desks frame={frame} cam={cam} myArm={myArm} hisArm={hisNow} notebook
      myFace={{ ...EXPRESSIONS.happy, lids: 0.2, look: { x: 0.9, y: 0.1 } }} hisFace={{ ...EXPRESSIONS.happy, look: { x: 0.9, y: 0.05 } }}
      hisProp={!got ? <Kimbap x={hisHand.x - 8} y={hisHand.y - 18} scale={0.5} half tilt={-10} /> : null}
      myProp={got ? <Kimbap x={myHand.x + 8} y={myHand.y - 18} scale={0.5} half tilt={8} /> : null} />
  );
};

// ------------------------------------------------------------------------------------------------ lines 97-98

const HerShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const typed = 0.55 * ramp(frame, k.her + 30, k.keep - 10);
  const thumbX = frame < k.keep ? 0.15 + 0.6 * ((Math.sin(frame / 5) + 1) / 2) * Math.min(1, typed * 3) : mix(0.6, 0.86, ramp(frame, k.keep, k.keep + 20));
  const cam = drift(camAt(frame, [[k.her, { x: 1000, y: 540, zoom: 1.0 }], [k.keep, { x: 1080, y: 560, zoom: 1.15 }], [k.bus, { x: 1180, y: 640, zoom: 1.6 }]]), frame, "her", 3);
  const props = {
    cam, mood: "day" as const, frame,
    options: { ...phone.defaults, mode: "message" as const, typed, sent: 0 as const, reply: 0, dots: false, contact: JIYOON.head, thumb: thumbX, behind: "desk" as const },
  };
  const spot = phone.spots.face;
  const sink = ramp(frame, k.keep + 20, k.keep + 40);
  const face = { brows: sink > 0.5 ? "sad" as const : "worry" as const, lids: mix(0.15, 0.45, sink), mouth: "flat" as const, eyes: 1, look: { x: 1, y: 0.3 } };
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={phone.Back(props)}
      actors={<><Figure {...HERO} x={spot.x} y={spot.y} scale={spot.scale} facing={spot.facing} {...face} blink={blinking(frame, 5)} time={frame} />{phone.Mid?.(props)}</>} />
  );
};

// ------------------------------------------------------------------------------------------------ lines 99-101

const WIN = bus.spots.window;

/** The bus with you at the window, the street going past at `street` (a frame count for the street's slide) and
 *  something past the windows. */
const OnBus: React.FC<{ frame: number; street: number; cam: Camera; face: object; outside?: React.ReactNode; phoneUp?: boolean }> = ({
  frame, street, cam, face, outside, phoneUp = true,
}) => {
  const props = { cam, mood: "day" as const, frame: street, options: { ...bus.defaults, speed: 7, hangers: 2 } };
  const pose: Pose = phoneUp ? { ...SEATED, armF: [40, 80] } : { ...SEATED, armF: [30, 50] };
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }}
      back={<>{bus.Back(props)}{outside && <Deep cam={cam} depth={1} flat><PastTheWindow cam={cam} id="bus">{outside}</PastTheWindow></Deep>}</>}
      actors={<Figure {...HERO} x={WIN.x} y={WIN.y} scale={WIN.scale} facing={WIN.facing} pose={pose} {...face} blink={blinking(frame, 3)} time={frame}
        held={phoneUp ? <HandPhone lit /> : undefined} />} />
  );
};

const myBusHead = headAt(WIN.x, WIN.y, WIN.scale, SEATED, WIN.facing);

const BusShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.bus, { x: 960, y: 540, zoom: 1.0 }], [k.ad, { x: 1150, y: 600, zoom: 1.25 }]]), frame, "bus", 3);
  return <OnBus frame={frame} street={frame} cam={cam} face={{ ...EXPRESSIONS.neutral, lids: 0.3, look: { x: 0.5, y: 0.7 } }} />;
};

const AdShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.ad, { x: 1300, y: 540, zoom: 1.7 }], [k.thumb, { x: 1330, y: 560, zoom: 1.85 }]]), frame, "ad", 2);
  const x = 1750 - (frame - k.ad) * 7;
  const follow = linear(frame, k.ad + 10, k.ad + 90);
  const face = { brows: "none" as const, lids: 0.25, mouth: "flat" as const, eyes: 1, look: { x: mix(-0.6, 0.6, follow), y: -0.5 } };
  return (
    <>
      <OnBus frame={frame} street={frame} cam={cam} face={face} phoneUp={false} outside={<ShelterAd x={x} />} />
      <Fade opacity={ramp(frame, k.pie, k.pie + 10)}><Dim amount={0.35} /></Fade>
      <Stage cam={{ x: 960, y: 540, zoom: 1 }} radius={0} origin={{ x: 0, y: 0 }} back={null}
        actors={
          <Sheet frame={frame} at={k.pie} x={1300} y={440} w={600} h={560} tilt={2}>
            <RegretPie cx={300} cy={250} r={170} shown={ramp(frame, k.pie + 14, k.pie + 34)} />
          </Sheet>
        } />
    </>
  );
};

const ThumbShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const flip = linear(frame, k.down, k.down + 14);
  const land = ramp(frame, k.down + 7, k.down + 20);
  const cam = drift(camAt(frame, [[k.thumb, { x: 1180, y: 420, zoom: 1.45 }], [k.down, { x: 1180, y: 440, zoom: 1.5 }], [k.up, { x: 1180, y: 640, zoom: 1.2 }]]), frame, "thumb", 2);
  const props = {
    cam, mood: "day" as const, frame,
    options: { ...phone.defaults, mode: "message" as const, typed: 0.55, sent: 0 as const, reply: 0, dots: false, contact: JIYOON.head, thumb: null, behind: "metro" as const },
  };
  const sx = flip < 0.5 ? 1 - flip * 2 : flip * 2 - 1;
  const at = `translate(${PHONE.x} ${PHONE.y + 140 * land}) rotate(${8 * land}) scale(${Math.max(0.001, sx)} 1) translate(${-PHONE.x} ${-PHONE.y})`;
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={phone.Back(props)}
      actors={
        <>
          {land > 0 && <ellipse cx={PHONE.x - 40} cy={PHONE.y + 260} rx={620} ry={420} fill="#3b3e47" opacity={land} />}
          <g transform={at}>
            {flip < 0.5 ? <>{phone.Mid?.(props)}<Thumb x={1160} y={282} /></> : <PhoneBack x={PHONE.x} y={PHONE.y} />}
          </g>
        </>
      } />
  );
};

const LookUpShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const span = Math.max(1, k.end - k.up);
  const t = linear(frame, k.up, k.end);
  const slide = span * 0.5 * (1 - (1 - t) * (1 - t));
  const street = k.up + slide;
  const gateX = 1000 + (span * 0.5 - slide) * 7;
  const cam = drift(camAt(frame, [[k.up, closeUp(myBusHead.x - 20, myBusHead.y - 20, 2.4)], [k.up + Math.round(span * 0.45), { x: 1430, y: 480, zoom: 1.8 }]]), frame, "look", 2);
  const lift = ramp(frame, k.up + 4, k.up + 18);
  const face = { brows: lift > 0.5 ? "raised" as const : "flat" as const, lids: mix(0.35, 0, lift), mouth: "flat" as const, eyes: mix(1, 1.1, lift), look: { x: 0.3, y: mix(0.8, -0.5, lift) } };
  return <OnBus frame={frame} street={street} cam={cam} face={face} phoneUp={false} outside={<DepotGates x={gateX} />} />;
};

// ------------------------------------------------------------------------------------------------ the beat

const TextOpensNothing: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const scene = current(frame, [
    [0, "results"], [k.minjun, "minjun"], [k.sea, "sea"], [k.gave, "gave"], [k.take, "take"], [k.her, "her"], [k.bus, "bus"],
    [k.ad, "ad"], [k.thumb, "thumb"], [k.up, "up"],
  ]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene === "results" && <ResultsShot frame={frame} k={k} />}
      {scene === "minjun" && <MinjunShot frame={frame} k={k} />}
      {scene === "sea" && <SeaShot frame={frame} k={k} />}
      {scene === "gave" && <GaveShot frame={frame} k={k} />}
      {scene === "take" && <TakeShot frame={frame} k={k} />}
      {scene === "her" && <HerShot frame={frame} k={k} />}
      {scene === "bus" && <BusShot frame={frame} k={k} />}
      {scene === "ad" && <AdShot frame={frame} k={k} />}
      {scene === "thumb" && <ThumbShot frame={frame} k={k} />}
      {scene === "up" && <LookUpShot frame={frame} k={k} />}
    </AbsoluteFill>
  );
};

export const textOpensNothing: Beat = { id: "TextOpensNothing", firstLine: 91, Component: TextOpensNothing };
