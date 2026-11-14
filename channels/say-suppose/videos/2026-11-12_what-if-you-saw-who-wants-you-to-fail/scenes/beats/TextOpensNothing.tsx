// Beat "A Text Would Open Nothing" (script.md v3; narration lines 106-116; mood day). Every frame comes from the clips
// (`times`), one component per shot.
//
//   106 results, the phone in your hand: three boxes, each a big 1 (top grade), one per "Top grade"; your face at the edge.
//   107 the classroom: your best friend at the next desk turns his phone to you; insert: his 1.
//   108 paper, two large panels from the first frame, YOUR CLASS and THE COUNTRY: the class's twenty-four heads come in
//       and four light teal on "four places in a room"; then "everyone in the country who sat it": the country fills with
//       heads, you and him among them, and zooms out from the two of you to thousands; the top four per cent light teal;
//       on "His grade never cost you yours" your head and his are ringed, both inside it. Then the two of you: he holds
//       out half a chocolate bar, "Half?"
//   109 his line, "Half?", in his own voice, with the bubble.
//   110 you take it, looking at him, not at the air above him, and eat it.
//   111 your phone buzzes: the group chat, "Congrats!" and "You did it!" legible, then seven more as notification dots,
//       a count badge running to nine; your face, and no card over anyone.
//   112 paper over the two of you: a third of all regrets are about education, her paintbrush in that third.
//   113 insert: her jar of brushes on the counter at home.
//   114 the phone: her name; you type "I got the scholarship"; your thumb holds over send while a bus goes by in the
//       glass ("or take the bus"); on "say it to her face" the phone goes face down.
//   115 "A text would open nothing": the phone face down; on "You could keep her forever" you're already on the bus:
//   116 a shelter ad with a paper subscribe tag slides by, then the warehouse gates come into the window.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { SEATED, seatedY, type Pose } from "@whatif/kit/rig/pose";
import { bus, classroom, phone } from "@whatif/kit/sets";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { drift, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { MUSTARD } from "@whatif/kit/theme";
import { Bubble, Chocolate, Sheet, headAt } from "../parts";
import { blinking, camAt, current, HERO, JIYOON, linear, MINJUN, mix, ramp, type Beat, type Shot } from "../shared";
import { Deep } from "../sets/common";
import { HOME, HomeBack } from "../sets/Home";
import { aimArm, Dim, handAt, timer, type Body } from "./Notebook.Parts";
import { BusReflection, DepotGates, DraftText, HeldResult, NineMessages, PastTheWindow, PHONE, PhoneBack, ResultScreen, SendThumb, ShelterAd } from "./TextOpensNothing.Parts";
import { ClassAndCountry, RegretPie } from "./TextOpensNothing.Paper";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const { from, at } = timer(clips);
  return {
    results: from(106),
    g1: at(106, 0.16), // "Top grade."
    g2: at(106, 0.32), // "Top grade."
    g3: at(106, 0.48), // "Top grade."
    holds: at(106, 0.7), // "The scholarship holds."
    friend: from(107), // the classroom, your best friend at the next desk
    his: at(107, 0.5), // "top grade in maths too": his phone
    sheet: from(108), // "Here's what you had backwards."
    room: at(108, 0.285), // "four places in a room"
    sea: at(108, 0.555), // "it's the top 4 per cent of everyone in the country who sat it"
    teal: at(108, 0.64),
    pair: at(108, 0.82), // "His grade never cost you yours."
    half: at(108, 0.95), // he holds out half a chocolate bar
    bubble: from(109) - 2, // "Half?" (his own voice)
    take: from(110), // "You take it."
    buzz: from(111), // "Your phone buzzes. Nine messages from the nine you cut."
    nine: at(111, 0.62), // "Not one card. A screen opens nothing.": your face, nothing over anyone
    regret: from(112), // a third of all regrets
    pie: at(112, 0.3),
    jar: from(113), // "Her brushes have stood in a jar for six years."
    her: from(114), // the phone: her name, the box
    typed: [from(114) + 9, from(114) + 80] as const, // "I got the scholarship", letter by letter
    hold: from(114) + 84, // the thumb over send, "or take the bus": a bus goes by in the glass
    down: at(114, 0.79), // "say it to her face": the phone face down
    text: from(115), // "A text would open nothing"
    bus: at(115, 0.4), // "You could keep her forever on a screen": already on the bus
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ line 106

const ResultsShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.results, { x: 960, y: 540, zoom: 1 }], [k.friend, { x: 1060, y: 540, zoom: 1.12 }]]), frame, "results", 3);
  const props = { cam, mood: "day" as const, frame, options: { ...phone.defaults, mode: "off" as const, thumb: null, behind: "desk" as const } };
  const spot = phone.spots.face;
  const face = frame < k.g1
    ? { ...EXPRESSIONS.worried, look: { x: 1, y: 0.2 } }
    : frame < k.holds ? { ...EXPRESSIONS.shocked, look: { x: 1, y: 0.25 } } : { brows: "raised" as const, lids: 0.1, mouth: "smile" as const, eyes: 1.05, look: { x: 1, y: 0.2 } };
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

// ------------------------------------------------------------------------------------------------ lines 107-112

const ROOM_OPTS = { ...classroom.defaults, board: "blank" as const, drawn: 0, farRow: true };
const SS = 1.05;
const SEAT_TOP = 850;
const ME_X = 640;
const HIM_X = 900;

/** You and your best friend side by side at your desks, him turned toward you. */
const Desks: React.FC<{
  frame: number; cam: Camera; myFace: object; hisFace: object; myArm?: [number, number]; hisArm?: [number, number]; hisProp?: React.ReactNode;
  myProp?: React.ReactNode; over?: React.ReactNode;
}> = ({ frame, cam, myFace, hisFace, myArm, hisArm, hisProp, myProp, over }) => {
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
const hisHead = headAt(him.x, him.y, SS, SEATED, -1);
const myHead = headAt(me.x, me.y, SS, SEATED);

const FriendShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.friend, "two"], [k.his, "his"]]);
  const up = ramp(frame, k.friend + 6, k.friend + 20);
  const arm: [number, number] = [mix(20, 72, up), mix(20, 40, up)];
  const hand = handAt({ ...him, pose: { ...SEATED, armF: arm } });
  const cams: Record<typeof shot, Camera> = {
    two: camAt(frame, [[k.friend, { x: 780, y: 650, zoom: 1.6 }], [k.his, { x: 790, y: 640, zoom: 1.7 }]]),
    his: camAt(frame, [[k.his, insert(hand.x - 10, hand.y - 30, 3.2)], [k.sheet, insert(hand.x - 10, hand.y - 30, 3.5)]]),
  };
  const seen = ramp(frame, k.friend + 24, k.friend + 36);
  return (
    <Desks frame={frame} cam={drift(cams[shot], frame, "friend", 2)} hisArm={arm}
      myFace={seen > 0.5 ? { ...EXPRESSIONS.happy, eyes: 1.1, brows: "raised" as const, look: { x: 0.9, y: 0 } } : { brows: "raised" as const, lids: 0.1, mouth: "smile" as const, eyes: 1, look: { x: 0.9, y: 0.1 } }}
      hisFace={{ ...EXPRESSIONS.happy, brows: "raised" as const, look: { x: 0.9, y: 0 } }}
      hisProp={<HeldResult x={hand.x - 6} y={hand.y - 70} scale={1} tilt={-6} head={MINJUN.head} />} />
  );
};

const SheetShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const zoom = mix(1, 1.05, linear(frame, k.sheet, k.half));
  return (
    <>
      <Desks frame={frame} cam={drift({ x: 780, y: 620, zoom: 1.25 }, frame, "sheet", 3)} myFace={{ ...EXPRESSIONS.sceptical, look: { x: 0.6, y: -0.3 } }}
        hisFace={{ ...EXPRESSIONS.neutral, look: { x: -0.4, y: -0.3 } }} />
      <Dim amount={0.4} />
      <Stage cam={{ x: 960, y: 540, zoom }} radius={0} origin={{ x: 0, y: 0 }} back={null}
        actors={
          <Sheet frame={frame} at={k.sheet} x={960} y={520} w={1400} h={640} tilt={-1.5}>
            <ClassAndCountry frame={frame} panels={linear(frame, k.sheet + 6, k.sheet + 18)} room={linear(frame, k.sheet + 14, k.sheet + 44)}
              lit={ramp(frame, k.room, k.room + 10)} sea={linear(frame, k.sea - 4, k.sea + 8)} zoom={ramp(frame, k.sea + 36, k.sea + 84)}
              teal={linear(frame, k.teal, k.teal + 14)} pair={ramp(frame, k.pair, k.pair + 10)} you={MUSTARD} him={MINJUN.head} />
          </Sheet>
        } />
    </>
  );
};

/** His arm out with the half bar (`out` 0..1); your arm taking it (`reach` 0..1) and bringing it to your mouth (`eat`). */
function chocolateArms(out: number, reach: number, got: boolean, eat: number) {
  const hisArm: [number, number] = got ? [mix(80, 20, eat), mix(12, 20, eat)] : [mix(20, 80, out), mix(20, 12, out)];
  const hisHand = handAt({ ...him, pose: { ...SEATED, armF: [80, 12] } });
  const reachArm = aimArm(me, { x: hisHand.x - 30, y: hisHand.y });
  const mouthArm = aimArm(me, { x: myHead.x + 30, y: myHead.y + 26 });
  const myArm: [number, number] = got
    ? [mix(reachArm[0], mouthArm[0], eat), mix(reachArm[1], mouthArm[1], eat)]
    : [mix(SEATED.armF[0], reachArm[0], reach), mix(SEATED.armF[1], reachArm[1], reach)];
  return { hisArm, myArm, hisHand: handAt({ ...him, pose: { ...SEATED, armF: hisArm } }), myHand: handAt({ ...me, pose: { ...SEATED, armF: myArm } }) };
}

const HalfShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const reach = ramp(frame, k.take + 2, k.take + 14);
  const got = frame >= k.take + 16;
  const eat = ramp(frame, k.take + 16, k.buzz - 2);
  const { hisArm, myArm, hisHand, myHand } = chocolateArms(ramp(frame, k.half, k.half + 12), reach, got, eat);
  const cam = drift(camAt(frame, [[k.half, { x: 790, y: 640, zoom: 1.75 }], [k.regret, { x: 780, y: 640, zoom: 1.95 }]]), frame, "half", 2);
  // You look at him, at his face: level, never above his head.
  const mine = got
    ? { brows: "raised" as const, lids: 0.1, mouth: eat > 0.6 ? "o" as const : "smile" as const, eyes: 1, look: { x: 0.9, y: 0.05 } }
    : { brows: "worry" as const, lids: 0.05, mouth: "flat" as const, eyes: 1.05, look: { x: 0.95, y: 0.05 } };
  return (
    <Desks frame={frame} cam={cam} myArm={myArm} hisArm={hisArm}
      myFace={mine} hisFace={{ ...EXPRESSIONS.happy, look: { x: 0.9, y: 0.05 } }}
      hisProp={!got ? <Chocolate x={hisHand.x - 14} y={hisHand.y - 14} scale={0.9} half="left" tilt={-8} /> : null}
      myProp={got && eat < 0.9 ? <Chocolate x={myHand.x + 14} y={myHand.y - 14} scale={0.9} half="right" tilt={8} /> : null}
      over={<Bubble frame={frame} at={k.bubble} until={k.take + 14} x={hisHead.x + 40} y={hisHead.y - 74} text="Half?" side="right" />} />
  );
};

/** Your phone buzzes: the group chat fills with nine messages, one after another, and nothing opens over anyone. */
const BuzzShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shake = frame < k.buzz + 14 ? Math.sin(frame * 2.4) * 7 : 0;
  const cam = drift(camAt(frame, [[k.buzz, { x: 1060, y: 540, zoom: 1.1 }], [k.nine, { x: 1120, y: 520, zoom: 1.25 }], [k.regret, { x: 700, y: 520, zoom: 1.2 }]]), frame, "buzz", 2);
  const props = { cam, mood: "day" as const, frame, options: { ...phone.defaults, mode: "off" as const, thumb: null, behind: "desk" as const } };
  const spot = phone.spots.face;
  const step = (k.nine - k.buzz - 10) / 9;
  const shown = Array.from({ length: 9 }, (_, i) => Math.round(k.buzz + 8 + i * step));
  const after = ramp(frame, k.nine, k.nine + 16);
  const face = frame < k.nine
    ? { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1.1, look: { x: 1, y: 0.2 } }
    : { brows: "flat" as const, lids: mix(0, 0.35, after), mouth: "flat" as const, eyes: 1, look: { x: mix(1, 0.4, after), y: mix(0.2, -0.3, after) } };
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={phone.Back(props)}
      actors={
        <>
          <Figure {...HERO} x={spot.x} y={spot.y} scale={spot.scale} facing={spot.facing} {...face} blink={blinking(frame, 2)} time={frame} />
          <g transform={`translate(${shake} 0)`}>
            {phone.Mid?.(props)}
            <NineMessages frame={frame} at={shown} />
          </g>
        </>
      } />
  );
};

const RegretShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift({ x: 760, y: 640, zoom: 1.6 }, frame, "regret", 2);

  return (
    <>
      <Desks frame={frame} cam={cam} myArm={[40, 60]} hisArm={[20, 20]}
        myFace={{ brows: "none", lids: 0.25, mouth: "flat", eyes: 1, look: { x: 0.3, y: 0.6 } }} hisFace={{ ...EXPRESSIONS.happy, look: { x: 0.9, y: 0.05 } }} />
      <Dim amount={ramp(frame, k.pie, k.pie + 10) * 0.35} />
      <Stage cam={{ x: 960, y: 540, zoom: 1 }} radius={0} origin={{ x: 0, y: 0 }} back={null}
        actors={
          <Sheet frame={frame} at={k.pie} x={1260} y={450} w={600} h={560} tilt={2}>
            <RegretPie cx={300} cy={250} r={170} shown={ramp(frame, k.pie + 14, k.pie + 34)} />
          </Sheet>
        } />
    </>
  );
};

// ------------------------------------------------------------------------------------------------ lines 113-115

const JarShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.jar, insert(HOME.jar.x, HOME.jar.y - 110, 2.6)], [k.her, insert(HOME.jar.x, HOME.jar.y - 130, 3.0)]]), frame, "jar", 2);
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<HomeBack cam={cam} mood="day" frame={frame} />} actors={null} />;
};

/** Her name on the phone: you type "I got the scholarship" (legible), your thumb comes to rest over send and holds
 *  there while a bus goes past in the glass, the camera close on the draft. */
const HerShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const typed = linear(frame, k.typed[0], k.typed[1]);
  const hold = ramp(frame, k.hold, k.hold + 10);
  const typing = typed > 0 && typed < 1;
  const cam = drift(camAt(frame, [[k.her, { x: 1040, y: 560, zoom: 1.05 }], [k.typed[0] + 20, { x: 1150, y: 600, zoom: 1.5 }], [k.down, { x: 1170, y: 610, zoom: 1.62 }]]), frame, "her", 2);
  const props = {
    cam, mood: "day" as const, frame,
    options: { ...phone.defaults, mode: "message" as const, typed: 0, sent: 0 as const, reply: 0, dots: false, contact: JIYOON.head,
      thumb: frame < k.hold ? 0.2 + 0.55 * ((Math.sin(frame / 2.5) + 1) / 2) * (typing ? 1 : 0.3) : null, behind: "desk" as const },
  };
  const spot = phone.spots.face;
  const face = { brows: "worry" as const, lids: 0.15, mouth: "flat" as const, eyes: 1, look: { x: 1, y: 0.3 } };
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={phone.Back(props)}
      actors={
        <>
          <Figure {...HERO} x={spot.x} y={spot.y} scale={spot.scale} facing={spot.facing} {...face} blink={blinking(frame, 5)} time={frame} />
          {phone.Mid?.(props)}
          <DraftText frame={frame} typed={typed} hold={hold} />
          <BusReflection p={linear(frame, k.hold + 4, k.hold + 40)} />
          {frame >= k.hold && <SendThumb lift={1 - hold} />}
        </>
      } />
  );
};

/** "Say it to her face": the phone turns over and goes face down on the desk; it stays there through "A text would open
 *  nothing" while the camera eases back. */
const TextShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const flip = linear(frame, k.down, k.down + 14);
  const land = ramp(frame, k.down + 7, k.down + 20);
  const cam = drift(camAt(frame, [[k.down, { x: 1170, y: 610, zoom: 1.62 }], [k.down + 20, { x: 1180, y: 600, zoom: 1.4 }], [k.bus, { x: 1180, y: 640, zoom: 1.2 }]]), frame, "text", 2);
  const props = {
    cam, mood: "day" as const, frame,
    options: { ...phone.defaults, mode: "message" as const, typed: 0, sent: 0 as const, reply: 0, dots: false, contact: JIYOON.head, thumb: null, behind: "desk" as const },
  };
  const sx = flip < 0.5 ? 1 - flip * 2 : flip * 2 - 1;
  const at = `translate(${PHONE.x} ${PHONE.y + 140 * land}) rotate(${8 * land}) scale(${Math.max(0.001, sx)} 1) translate(${-PHONE.x} ${-PHONE.y})`;
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={phone.Back(props)}
      actors={
        <>
          {land > 0 && <ellipse cx={PHONE.x - 40} cy={PHONE.y + 260} rx={620} ry={420} fill="#3b3e47" opacity={land} />}
          <g transform={at}>{flip < 0.5 ? <>{phone.Mid?.(props)}<DraftText frame={frame} typed={1} hold={0} /></> : <PhoneBack x={PHONE.x} y={PHONE.y} />}</g>
        </>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ line 116

const WIN = bus.spots.window;

/** The bus with you at the window, the street slid `slide` px, and things going past the windows. */
const OnBus: React.FC<{ frame: number; slide: number; cam: Camera; face: object; outside?: React.ReactNode }> = ({ frame, slide, cam, face, outside }) => {
  const props = { cam, mood: "day" as const, frame: slide / 7, options: { ...bus.defaults, speed: 7, hangers: 2 } };
  const pose: Pose = { ...SEATED, armF: [30, 50] };
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }}
      back={<>{bus.Back(props)}{outside && <Deep cam={cam} depth={1} flat><PastTheWindow cam={cam} id="bus">{outside}</PastTheWindow></Deep>}</>}
      actors={<Figure {...HERO} x={WIN.x} y={WIN.y} scale={WIN.scale} facing={WIN.facing} pose={pose} {...face} blink={blinking(frame, 3)} time={frame} />} />
  );
};

/** You're on the bus: the shelter ad slides past behind you, the bus slows, the warehouse gates come into the window,
 *  and you look up at them. One slide drives the street, the ad and the gates together. */
const BusShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const t = linear(frame, k.bus, k.end);
  const slide = 1300 * (1 - (1 - t) * (1 - t));
  const lift = ramp(frame, mix(k.bus, k.end, 0.45), mix(k.bus, k.end, 0.7));
  const face = { brows: lift > 0.5 ? "raised" as const : "none" as const, lids: mix(0.3, 0, lift), mouth: "flat" as const, eyes: mix(1, 1.1, lift),
    look: { x: mix(-0.5, 0.2, lift), y: mix(-0.2, -0.6, lift) } };
  const cam = drift(camAt(frame, [[k.bus, { x: 1360, y: 560, zoom: 1.35 }], [k.end, { x: 1420, y: 500, zoom: 1.5 }]]), frame, "bus", 2);
  return (
    <OnBus frame={frame} slide={slide} cam={cam} face={face}
      outside={<><ShelterAd x={1100 - slide} /><DepotGates x={2300 - slide} /></>} />
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const TextOpensNothing: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const scene = current(frame, [
    [0, "results"], [k.friend, "friend"], [k.sheet, "sheet"], [k.half, "half"], [k.buzz, "buzz"], [k.regret, "regret"], [k.jar, "jar"], [k.her, "her"],
    [k.down, "text"], [k.bus, "bus"],
  ]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene === "results" && <ResultsShot frame={frame} k={k} />}
      {scene === "friend" && <FriendShot frame={frame} k={k} />}
      {scene === "sheet" && <SheetShot frame={frame} k={k} />}
      {scene === "half" && <HalfShot frame={frame} k={k} />}
      {scene === "buzz" && <BuzzShot frame={frame} k={k} />}
      {scene === "regret" && <RegretShot frame={frame} k={k} />}
      {scene === "jar" && <JarShot frame={frame} k={k} />}
      {scene === "her" && <HerShot frame={frame} k={k} />}
      {scene === "text" && <TextShot frame={frame} k={k} />}
      {scene === "bus" && <BusShot frame={frame} k={k} />}
    </AbsoluteFill>
  );
};

export const textOpensNothing: Beat = { id: "TextOpensNothing", firstLine: 106, Component: TextOpensNothing };
