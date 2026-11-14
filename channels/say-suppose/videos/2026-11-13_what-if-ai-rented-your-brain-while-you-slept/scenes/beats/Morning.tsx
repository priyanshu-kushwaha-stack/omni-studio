// Beat "Morning" (script.md ## [11:35] Morning; narration lines 90-95) and the end card.
//
//   90   morning light through the red curtains; you wake, look at the window, then the top bunk, and smile.
//   91   the dream: a paper bridge in your own colours, mustard and teal, in the air over your pillow; your smile.
//   92   he hangs down off the top bunk, palm out: "What'd you get, then?" (his own voice)
//   hold (3 s, performed) you open your hand: nothing; INSERT the empty hand; he looks at it, grins, drops back.
//   hold (3 s, performed) the hall: you walk past KEYS without reading it and take your keys off the hook, on to the
//        front door.
//   93   at the door you feel the tag on your forehead, peel it off and stick it on the frame; INSERT YOU on the frame;
//        the door opens on the morning and you go.
//   94   the clinic steps: the grey suit with a new box, thinner bands with a small RED light; he holds one out as you
//        pass: "This one's for daytime." (his own voice)
//   hold (2 s, performed) you walk past; he watches you go, the band still held out. (From here the right third of the
//        frame stays quiet for the end screens.)
//   95   + hold: the end card: you walking off in the left third of the street; COMMENT, LIKE, SUBSCRIBE in the middle.
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { joints, STAND, walkPose } from "@whatif/kit/rig/pose";
import { INK } from "@whatif/kit/theme";
import { street } from "@whatif/kit/sets";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { Band, BandBox, Blanket, Sleeper, StampTag } from "../parts";
import { BUNK, BunkRoom } from "../sets/BunkRoom";
import { CLINIC_OUT, ClinicOutside } from "../sets/Clinic";
import { blinking, BROTHER, camAt, current, lineEnd, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { aimArm, Broker, headOf, talk, You, type Body, type Face } from "./Contract.Kit";
import { EndTags, HALL, HallBack, Keys, OpenHand, PaperBridge } from "./Morning.Hall";
import { gapAfter, isV5, V5 } from "./V5.Kit";
import { DaytimeStreet, twistSpan } from "./V5.Late";

type T = ReturnType<typeof times>;

/** The daytime band's small red light. */
const CRIMSON_LIGHT = "#ff4a5a";

function times(clips: Clip[], start: number, end: number, v3: Clip[]) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const holdE = lineEnd(clips, 92); // performed: the empty hand
  const inE = (p: number) => Math.round(holdE + (holdE + 90 > from(93) ? (from(93) - holdE) / 2 : 90) * p);
  const holdW = inE(1); // performed: the hall, the keys
  const inW = (p: number) => Math.round(holdW + (from(93) - holdW) * p);
  const holdP = lineEnd(clips, 94); // performed: you walk past him
  // v5: the clinic steps open on "Thursday. The clinic steps." (133); he calls "Everyone else already said yes." after
  // you (135); then the twist, the street awake (136, V5.Late), before the end card
  const v5 = isV5(v3);
  const clinic = v5 ? gapAfter(v3, V5.steps - 1) : from(94) - 4;
  const twist = v5 ? twistSpan(v3).from : from(95) - 2;
  return {
    start, end,
    wake: at(90, 0.15), window: at(90, 0.32), up: at(90, 0.56), smile: at(90, 0.76),
    bridge: [at(91, 0.16), at(91, 0.66)] as const, smile91: at(91, 0.72),
    hang: from(92) - 4, what: [from(92), lineEnd(clips, 92)] as const,
    holdE, raise: [inE(0.02), inE(0.2)] as const, handShot: inE(0.22), grinShot: inE(0.5), grin: inE(0.58), drop: inE(0.82),
    holdW, walk1: [inW(0.0), inW(0.48)] as const, take: [inW(0.5), inW(0.64)] as const, walk2: [inW(0.66), from(93) + 4] as const,
    feel: [from(93), at(93, 0.14)] as const, stick: [at(93, 0.14), at(93, 0.3)] as const, tagShot: at(93, 0.32), doorShot: at(93, 0.56),
    open: [at(93, 0.58), at(93, 0.74)] as const, out: [at(93, 0.7), lineEnd(clips, 93) + 6] as const,
    clinic, daytime: [from(94), lineEnd(clips, 94)] as const, holdP, pass: [clinic + 6, Math.max(clinic + 7, twist - 20)] as const, turn: holdP + 16,
    yes: v5 ? [v3[V5.yes].from, lineEnd(v3, V5.yes)] as const : [holdP, holdP] as const, twist,
    card: from(95) - 2, comment: at(95, 0.42), like: at(95, 0.8), subscribe: at(95, 0.9),
  };
}

// ------------------------------------------------------------------------------------------------ the bunk, morning

/** Your brother on the top bunk on his front, leaning down over its edge, his arm hanging down with the palm out.
 *  (The figure is rotated about its hip, so his face stays the right way up, tipped toward you.) */
const HANG = { hipX: 1420, hipY: 126, scale: 2.2, rot: -114 };
const BrotherHang: React.FC<{ frame: number; face: Face }> = ({ frame, face }) => {
  const pose = { ...STAND, legB: [-4, 0] as [number, number], legF: [4, 0] as [number, number], armB: [80, 10] as [number, number],
    armF: [96, -10] as [number, number] };
  const a = (HANG.rot * Math.PI) / 180;
  // the palm: the arm's tip, from the rig's joints, through the same rotation
  const j = joints(pose);
  const tip = { x: j.shoulder.x + (Math.sin((96 * Math.PI) / 180) + Math.sin((86 * Math.PI) / 180)) * 56, y: j.shoulder.y + (Math.cos((96 * Math.PI) / 180) + Math.cos((86 * Math.PI) / 180)) * 56 };
  const lx = -tip.x * HANG.scale, ly = tip.y * HANG.scale, hy = j.hip.y * HANG.scale;
  const y0 = HANG.hipY + 112 * HANG.scale;
  const palm = { x: HANG.hipX + lx * Math.cos(a) - (ly - hy) * Math.sin(a), y: y0 + hy + lx * Math.sin(a) + (ly - hy) * Math.cos(a) };
  return (
    <g>
      <Figure x={HANG.hipX} y={y0} scale={HANG.scale} facing={-1} rotate={HANG.rot} pose={pose} head={BROTHER.head} coat={BROTHER.coat}
        {...face} blink={blinking(frame, 3)} time={frame} />
      <circle cx={palm.x} cy={palm.y} r={30} fill={BROTHER.head} stroke={INK} strokeWidth={4} />
    </g>
  );
};

const Y = BUNK.you;

const Bed: React.FC<{ frame: number; k: T; view: { x: number; y: number; zoom: number } }> = ({ frame, k, view }) => {
  const tilt = frame < k.window ? -72 : frame < k.up ? mix(-72, -62, ramp(frame, k.window, k.window + 10)) : mix(-62, -84, ramp(frame, k.up, k.up + 10));
  const eyes = frame < k.wake ? "shut" : "open";
  const mouth = frame >= k.smile ? "smile" : "flat";
  const b = ramp(frame, k.bridge[0], k.bridge[0] + 12) * (1 - ramp(frame, k.bridge[1] - 10, k.bridge[1]));
  const hanging = frame >= k.hang && frame < k.drop;
  const raise = ramp(frame, k.raise[0], k.raise[1]) * (1 - ramp(frame, k.drop, k.drop + 14));
  const brotherFace: Face = frame < k.grin
    ? { brows: "raised", lids: 0, mouth: talk(frame, k.what[0], k.what[1], "flat"), eyes: 1.1, look: { x: 0.2, y: -0.6 } }
    : { brows: "raised", lids: 0, mouth: "smile", eyes: 1.05, look: { x: 0.3, y: -0.5 } };
  return (
    <BunkRoom frame={frame} mood="morning" view={view} you="none" jarFill={0.85} brother={hanging ? "none" : "asleep"} brotherBand={false}>
      {hanging && <BrotherHang frame={frame} face={brotherFace} />}
      {/* morning through the curtains */}
      <polygon points="-200,-200 420,-200 1100,1100 300,1100" fill="#fff1c8" opacity={0.12} />
      <Sleeper id="morning-you" x={Y.x} y={Y.y} scale={Y.scale} tilt={tilt} band={false} eyes={eyes} mouth={mouth} />
      <Blanket x0={560} x1={1630} top={680} base={900} />
      {raise > 0 && <OpenHand sx={640} sy={760} hx={mix(700, 1000, raise)} hy={mix(800, 560, raise)} />}
      {b > 0 && <PaperBridge x={620} y={mix(470, 440, linear(frame, k.bridge[0], k.bridge[1]))} s={1.15} opacity={b} />}
    </BunkRoom>
  );
};

// ------------------------------------------------------------------------------------------------ the hall

const HS = 1.2;
function hallYou(frame: number, k: T): { body: Body; keys: boolean; tag: { x: number; y: number } | null } {
  const w1 = ramp(frame, k.walk1[0], k.walk1[1]), w2 = ramp(frame, k.walk2[0], k.walk2[1]), w3 = ramp(frame, k.out[0], k.out[1]);
  const x = frame < k.walk2[0] ? mix(260, 980, w1) : frame < k.out[0] ? mix(980, 1390, w2) : mix(1390, 1700, w3);
  const walking = (frame >= k.walk1[0] && frame < k.walk1[1]) || (frame >= k.walk2[0] && frame < k.walk2[1]) || (frame >= k.out[0] && frame < k.out[1]);
  const body: Body = { x, y: HALL.floor, scale: HS, facing: 1, pose: walking ? walkPose(frame / 4.2) : { ...STAND } };
  const take = ramp(frame, k.take[0], k.take[1]);
  if (frame >= k.take[0] && frame < k.walk2[0]) {
    const up = take < 0.5 ? take * 2 : 2 - take * 2;
    body.pose = { ...body.pose, armF: aimArm(body, { x: mix(x + 30, HALL.hook.x, up), y: mix(HALL.floor - 200, HALL.hook.y + 40, up) }) };
  }
  const head = headOf(body);
  const feel = ramp(frame, k.feel[0], k.feel[1]), stick = ramp(frame, k.stick[0], k.stick[1]);
  if (frame >= k.feel[0] && frame < k.stick[1] + 6) {
    const onHead = { x: head.x + 14, y: head.y - 38 };
    const frameAt = { x: HALL.door.x - HALL.door.w / 2 - 12, y: 600 };
    const hand = frame < k.stick[0] ? { x: mix(x + 30, onHead.x, feel), y: mix(HALL.floor - 200, onHead.y, feel) }
      : { x: mix(onHead.x, frameAt.x, stick), y: mix(onHead.y, frameAt.y, stick) };
    // the BACK arm reaches up to the forehead and out to the frame (a raised front arm would cross the face)
    body.pose = { ...body.pose, armB: aimArm(body, hand) };
    return { body, keys: frame < k.take[0] + (k.take[1] - k.take[0]) / 2, tag: hand };
  }
  return { body, keys: frame < k.take[0] + (k.take[1] - k.take[0]) / 2, tag: frame < k.feel[0] ? { x: head.x + 14, y: head.y - 38 } : null };
}

const Hall: React.FC<{ frame: number; k: T; cam: Camera }> = ({ frame, k, cam }) => {
  const h = hallYou(frame, k);
  const open = ramp(frame, k.open[0], k.open[1]);
  const D = HALL.door;
  const stuck = frame >= k.stick[1];
  const face: Face = frame < k.feel[0]
    ? { brows: "none", lids: 0.1, mouth: "smile", eyes: 1, look: { x: 1, y: 0 } }
    : frame < k.stick[1]
      ? { brows: "raised", lids: 0, mouth: "flat", eyes: 1.1, look: { x: 0.6, y: -0.6 } }
      : { brows: "none", lids: 0.15, mouth: "smile", eyes: 1, look: { x: 1, y: -0.1 } };
  const youOut = frame >= k.out[0] && h.body.x > D.x - D.w / 2 + 30;
  const actors = (
    <>
      <StampTag frame={frame} at={k.start} x={HALL.hook.x} y={HALL.hook.y - 80} text="KEYS" size={40} tilt={-5} />
      <StampTag frame={frame} at={k.start} x={D.x} y={470} text="DOOR" size={40} tilt={4} />
      <clipPath id="morning-hall-door"><rect x={-1400} y={-800} width={D.x + D.w / 2 + 1400} height={2600} /></clipPath>
      <g clipPath={youOut ? "url(#morning-hall-door)" : undefined} opacity={youOut ? 1 - ramp(frame, k.out[1] - 8, k.out[1]) : 1}>
        <You body={h.body} face={face} frame={frame} held={!h.keys ? <Keys x={0} y={0} s={0.8} /> : undefined} />
      </g>
      {h.tag && <StampTag frame={frame} at={k.start} x={h.tag.x} y={h.tag.y} text="YOU" size={22} tilt={-8} />}
      {stuck && <StampTag frame={frame} at={k.stick[1]} x={D.x - D.w / 2 - 12} y={600} text="YOU" size={30} tilt={-82} />}
    </>
  );
  const look = setLook([{ x: D.x, y: 600, r: 500, color: "#fff1c8", strength: 0.5 * open, moods: ["morning", "day"] }], "morning", cam);
  return (
    <LookContext.Provider value={look}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<HallBack cam={cam} mood="morning" keys={h.keys} open={open} />} actors={actors} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ the clinic steps

const Steps: React.FC<{ frame: number; k: T; cam: Camera }> = ({ frame, k, cam }) => {
  const O = CLINIC_OUT;
  const p = ramp(frame, k.pass[0], k.pass[1]);
  const x = mix(1620, 520, p);
  const me: Body = { x, y: O.floor, scale: 1.2, facing: -1, pose: walkPose(frame / 4.2) };
  const turned = frame >= k.turn;
  const broker: Body = { x: O.step.x + 40, y: O.step.top, scale: 1.2, facing: turned ? -1 : 1, pose: { ...STAND } };
  // He holds the band out toward you: his front arm while he faces you; once he turns to watch you go, the back arm.
  const reachTo = { x: broker.x + (turned ? -1 : 1) * 150, y: O.step.top - 170 };
  if (turned) broker.pose = { ...broker.pose, armB: aimArm({ ...broker }, reachTo), armF: aimArm(broker, { x: broker.x + 30, y: O.step.top - 120 }) };
  else broker.pose = { ...broker.pose, armF: aimArm(broker, reachTo), armB: aimArm(broker, { x: broker.x - 40, y: O.step.top - 120 }) };
  const bandAt = reachTo;
  const speaking = frame >= k.yes[0] ? talk(frame, k.yes[0], k.yes[1], "smirk") : talk(frame, k.daytime[0], k.daytime[1], "smirk");
  const bFace: Face = { brows: frame >= k.yes[0] && frame < k.yes[1] ? "raised" : "flat", lids: 0.35, mouth: speaking, eyes: 1, look: { x: 1, y: 0.1 } };
  const myFace: Face = { brows: "none", lids: 0.15, mouth: "flat", eyes: 1, look: { x: 1, y: 0 } };
  const actors = (
    <>
      <Broker body={broker} face={bFace} frame={frame} />
      <BandBox x={broker.x + (turned ? 40 : -40)} y={O.step.top - 100} scale={0.7} color={CRIMSON_LIGHT} />
      <Band x={bandAt.x} y={bandAt.y} scale={0.55} lit color={CRIMSON_LIGHT} />
      <You body={me} face={myFace} frame={frame} held={<Keys x={0} y={0} s={0.7} />} />
    </>
  );
  return <ClinicOutside frame={frame} mood="day" cam={cam} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ the end card

const EndCard: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.card, { x: 720, y: 620, zoom: 1.1 }], [k.end, { x: 690, y: 620, zoom: 1.14 }]]), frame, "endcard", 3);
  const p = linear(frame, k.card, k.end);
  const me: Body = { x: mix(400, 120, p), y: 1010, scale: 1.1, facing: -1, pose: walkPose(frame / 4.6) };
  const props = { cam, mood: "day" as const, frame, options: { ...street.defaults, auto: false } };
  return (
    <AbsoluteFill>
      <LookContext.Provider value={setLook(street.lights(street.defaults), "day", cam)}>
        <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={street.Back(props)}
          actors={<You body={me} face={{ brows: "none", lids: 0.1, mouth: "smile", eyes: 1, look: { x: 1, y: -0.1 } }} frame={frame}
            held={<Keys x={0} y={0} s={0.7} />} />} front={street.Front?.(props)} />
      </LookContext.Provider>
      <EndTags frame={frame} comment={k.comment} like={k.like} subscribe={k.subscribe} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ the cut

const MorningShot: React.FC<{ frame: number; k: T; v3: Clip[] }> = ({ frame, k, v3 }) => {
  const shot = current(frame, [[k.start, "wake"], [k.up, "up"], [k.bridge[0] - 6, "bridge"], [k.smile91, "smile91"], [k.hang, "hang"],
    [k.handShot, "hand"], [k.grinShot, "grin"], [k.drop, "drop"], [k.holdW, "hall"], [k.feel[0], "feel"], [k.tagShot, "tag"],
    [k.doorShot, "door"], [k.clinic, "clinic"], [k.holdP, "pass"], [k.twist, "twist"], [k.card, "card"]]);
  if (shot === "card") return <EndCard frame={frame} k={k} />;
  if (shot === "twist") return <DaytimeStreet frame={frame} v3={v3} />;
  const d = (c: Camera) => drift(c, frame, "morning", 3);
  if (shot === "clinic" || shot === "pass") {
    const cams: Camera = shot === "clinic"
      ? camAt(frame, [[k.clinic, { x: 1180, y: 660, zoom: 1.55 }], [k.holdP, { x: 1150, y: 660, zoom: 1.6 }]])
      : camAt(frame, [[k.holdP, { x: 1150, y: 640, zoom: 1.12 }], [Math.max(k.holdP + 1, k.twist), { x: 1100, y: 640, zoom: 1.1 }]]);
    return <Steps frame={frame} k={k} cam={d(cams)} />;
  }
  if (shot === "hall" || shot === "feel" || shot === "tag" || shot === "door") {
    const h = hallYou(frame, k);
    const D = HALL.door;
    const cams: Record<string, Camera> = {
      hall: { x: mix(820, 1100, ramp(frame, k.walk1[0], k.walk2[1])), y: 600, zoom: 1.15 },
      feel: camAt(frame, [[k.feel[0], { x: h.body.x + 80, y: 520, zoom: 2.0 }], [k.tagShot, { x: h.body.x + 60, y: 530, zoom: 2.1 }]]),
      tag: camAt(frame, [[k.tagShot, { x: D.x - D.w / 2 - 12, y: 600, zoom: 3.4 }], [k.doorShot, { x: D.x - D.w / 2 - 12, y: 600, zoom: 3.7 }]]),
      door: camAt(frame, [[k.doorShot, { x: 1480, y: 600, zoom: 1.45 }], [k.clinic, { x: 1520, y: 600, zoom: 1.55 }]]),
    };
    return <Hall frame={frame} k={k} cam={d(cams[shot])} />;
  }
  const views: Record<string, { x: number; y: number; zoom: number }> = {
    wake: camAt(frame, [[k.start, { x: 560, y: 640, zoom: 1.9 }], [k.up, { x: 580, y: 620, zoom: 2.0 }]]),
    up: camAt(frame, [[k.up, { x: 760, y: 520, zoom: 1.35 }], [k.bridge[0], { x: 760, y: 520, zoom: 1.42 }]]),
    bridge: camAt(frame, [[k.bridge[0] - 6, { x: 600, y: 560, zoom: 1.6 }], [k.smile91, { x: 600, y: 540, zoom: 1.75 }]]),
    smile91: camAt(frame, [[k.smile91, { x: 540, y: 660, zoom: 2.3 }], [k.hang, { x: 540, y: 660, zoom: 2.45 }]]),
    hang: camAt(frame, [[k.hang, { x: 900, y: 520, zoom: 1.05 }], [k.handShot, { x: 930, y: 600, zoom: 1.15 }]]),
    hand: camAt(frame, [[k.handShot, { x: 1000, y: 560, zoom: 2.6 }], [k.grinShot, { x: 1000, y: 560, zoom: 2.8 }]]),
    grin: camAt(frame, [[k.grinShot, { x: 1110, y: 340, zoom: 2.3 }], [k.drop, { x: 1110, y: 340, zoom: 2.45 }]]),
    drop: camAt(frame, [[k.drop, { x: 900, y: 560, zoom: 1.15 }], [k.holdW, { x: 900, y: 560, zoom: 1.1 }]]),
  };
  return <Bed frame={frame} k={k} view={d(views[shot])} />;
};

/** The keys off the hook, the tag pressed on the frame, the door. */
const MorningSound: React.FC<{ k: T }> = ({ k }) => (
  <>
    <Sequence from={k.take[0] + 4} durationInFrames={20}><Audio src={staticFile("sfx/clink.wav")} volume={0.18} /></Sequence>
    <Sequence from={k.stick[1] - 2} durationInFrames={12}><Audio src={staticFile("sfx/paper.wav")} volume={0.45} /></Sequence>
    <Sequence from={k.open[0]} durationInFrames={12}><Audio src={staticFile("sfx/tick.wav")} volume={0.5} /></Sequence>
  </>
);

const Morning: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = times(shot.clips, shot.from, shot.to, shot.v3);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <MorningShot frame={shot.frame} k={k} v3={shot.v3} />
      <MorningSound k={k} />
    </AbsoluteFill>
  );
};

export const morning: Beat = { id: "morning", firstLine: 90, Component: Morning };
