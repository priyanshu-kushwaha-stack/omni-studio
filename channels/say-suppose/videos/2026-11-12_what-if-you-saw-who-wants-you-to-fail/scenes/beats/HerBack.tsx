// Beat "Her Back" (script.md v5, ## Her Back; narration lines 48-50). The flat at eleven under one lamp: the fridge
// with your letter, the jar of her brushes; your sister in the hall doorway with her back to you, pulling on the work
// vest. Short, and a gentle laugh, not sad (owner, v5). v7 (outside review of v6, 4:59-5:24): no still life and no
// held backs; every stretch has her doing something, and the scene ends on the door, not on the empty kitchen.
//
//   48   "Eleven.": from the kitchen lamp (the cut from the academy's lit signs) to the clock and her vest on its hook;
//        the room; the fridge and your letter; INSERT the jar of brushes: her hand comes in and lifts her lunch bag from
//        beside it; "She's in the doorway, pulling on her vest.": her back, the vest going on, the zip; over your shoulder
//        at "She doesn't turn round", her head tilting to listen.
//   49   close on her back: "Say it again." (her own voice), her head tilted, one finger up
//   hold (3 s, performed) close on you: your mouth moves, the letter lifts an inch; the two of you: no snap, nothing
//        over her head; you crane round to see her face and she sidesteps, keeping her back to you; her shoulders
//        bounce (the laugh)
//   50   "You say it to her back.": she raps the door frame twice; "Nothing opens. A back is not a face.": over your
//        shoulder, the camera follows the empty air above her head down the hall, the stairwell door's light opening;
//        "Your sister has the only unreadable face in Seoul,": you, a huff of a laugh, shaking your head;
//        "because she never points it at you.": the doorway, the stairwell light narrowing to nothing as that door shuts.
import { AbsoluteFill } from "remotion";
import { STAND } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { Letter, YourShoulder } from "../parts";
import { HOME, HOME_LAMP, HomeBack, HomeTable } from "../sets/Home";
import { INK } from "@whatif/kit/theme";
import { camAt, current, JIYOON, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { AcademyWindow, Bag, VestOnHook } from "./HerBack.Room";
import { aimArm, SisterBack, talk, useGlows, You, type Body, type Face } from "./HerBack.Sister";

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i). */
function times(clips: Clip[], start: number, end: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const holdB = lineEnd(clips, 49) + 2; // performed: you say it to her back; you crane round; she sidesteps; the laugh
  const gapB = from(50) - holdB;
  const inB = (p: number) => Math.round(holdB + gapB * p);
  const doorway = at(48, 0.62);
  const jar = at(48, 0.3);
  return {
    start,
    end,
    clock: start, // "Eleven.": from the lamp to the clock and the vest on its hook
    pullOut: at(48, 0.05), // "Home."
    fridge: at(48, 0.1), // "The letter's already on the fridge"
    jar, // "next to the jar where her paintbrushes have stood for six years"
    lunch: [jar + 16, jar + 34, Math.min(doorway - 4, jar + 74)] as const, // her hand in, the bag taken, out of frame
    doorway, // "She's in the doorway, pulling on her vest."
    vest: [doorway + 4, at(48, 0.86)] as const,
    ots: at(48, 0.86), // "She doesn't turn round."
    listen: at(48, 0.9),
    back: from(49) - 6, // close on her back
    againLine: [from(49), lineEnd(clips, 49)] as const, // "Say it again."
    finger: [from(49) - 4, from(49) + 4, holdB + 4, holdB + 12] as const, // up, held, down
    holdB,
    sayIt: [holdB + 2, inB(0.3)] as const,
    lift: [inB(0.1), inB(0.2), inB(0.28)] as const, // the letter lifts an inch, holds, drops
    two: inB(0.3), // nothing over her head
    peek: [inB(0.36), inB(0.5), inB(0.86), inB(0.98)] as const, // you crane round to see her face, and back
    sidestep: [inB(0.46), inB(0.58)] as const, // she steps aside, back still to you
    laughs: [inB(0.66), inB(0.92)] as const,
    rap: [from(50), at(50, 0.14)] as const, // "You say it to her back.": two knocks on the door frame, her goodbye
    gone: [at(50, 0.15), at(50, 0.36)] as const, // "Nothing opens. A back is not a face.": she goes down the hall
    light: [at(50, 0.28), at(50, 0.36), at(50, 0.74), end - 3] as const, // the stairwell door: opening, open, shutting, shut
    rapShot: from(50) - 2,
    leave: at(50, 0.15),
    grin: at(50, 0.36), // "Your sister has the only unreadable face in Seoul,": your huff of a laugh
    door: at(50, 0.7), // "because she never points it at you.": the doorway, the light narrowing to nothing
  };
}

const S = 1.15;
const FLOOR = HOME.floor;
const YOU_X = HOME.spots.kitchen.x;
const HER_X = HOME.doorway.x;
const HEAD_Y = FLOOR - 304;
const D = HOME.doorway;

/** The stairwell door down the hall: how far open, 0..1 (the light through it narrows as it shuts). */
const lightAt = (frame: number, k: T) => ramp(frame, k.light[0], k.light[1]) * (1 - ramp(frame, k.light[2], k.light[3]));

/** Her lunch bag on the counter beside the jar, (x, y) its base centre. */
const LunchBag: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <path d={`M${x - 40} ${y} L${x - 36} ${y - 62} L${x + 36} ${y - 62} L${x + 40} ${y}Z`} fill="#4a7f6f" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d={`M${x - 18} ${y - 62} Q${x} ${y - 96} ${x + 18} ${y - 62}`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    <rect x={x - 26} y={y - 40} width={52} height={14} rx={4} fill="#f4efe2" opacity={0.8} />
  </g>
);
const LUNCH = { x: 1000, y: HOME.counter.top } as const;

/** The kitchen: the room, the table, you with the letter, her back in the doorway (her vest on its hook until she is
 *  there), the window full of academy lights, your bag at your feet, the stairwell light. */
const Kitchen: React.FC<{ frame: number; k: T; cam: Camera; you: Face; showYou?: boolean }> = ({ frame, k, cam, you, showYou = true }) => {
  const vest = ramp(frame, k.vest[0], k.vest[1]);
  const laugh = frame >= k.laughs[0] && frame < k.laughs[1] ? Math.sin(((frame - k.laughs[0]) / (k.laughs[1] - k.laughs[0])) * Math.PI) : 0;
  const finger = ramp(frame, k.finger[0], k.finger[1]) * (1 - ramp(frame, k.finger[2], k.finger[3]));
  const aside = ramp(frame, k.sidestep[0], k.sidestep[1]) * 46;
  const peek = ramp(frame, k.peek[0], k.peek[1]) * (1 - ramp(frame, k.peek[2], k.peek[3]));
  // her hand in the jar insert: in, the bag taken, up and out
  const handIn = ramp(frame, k.jar, k.lunch[0] + 4) * (1 - ramp(frame, k.lunch[1] + 6, k.lunch[2]));
  const taken = frame >= k.lunch[1];
  const bagAt = taken ? { x: mix(LUNCH.x, 1520, ramp(frame, k.lunch[1] + 6, k.lunch[2])), y: mix(LUNCH.y, 260, ramp(frame, k.lunch[1] + 6, k.lunch[2])) } : LUNCH;
  const away = ramp(frame, k.gone[0], k.gone[1]);
  const listen = ramp(frame, k.listen, k.listen + 10) * 17;
  const speak = frame >= k.againLine[0] && frame < k.againLine[1] ? Math.sin((frame - k.againLine[0]) / 6) * 2 : 0;
  const light = lightAt(frame, k);
  const huff = frame >= k.grin && frame < k.grin + 24 ? Math.abs(Math.sin(((frame - k.grin) / 24) * Math.PI * 3)) * 6 : 0;
  const body: Body = { x: YOU_X + peek * 26, y: FLOOR - huff - peek * 10, scale: S, facing: 1, pose: { ...STAND, lean: 16 * peek, tilt: 10 * peek } };
  const lift = ramp(frame, k.lift[0], k.lift[1]) * (1 - ramp(frame, k.lift[2] - 2, k.lift[2] + 3));
  body.pose = { ...body.pose, armF: aimArm(body, { x: body.x + 66, y: FLOOR - 186 - lift * 16 }) };
  const look = useGlows(cam, [HOME_LAMP, ...(light > 0 ? [{ x: D.x, y: 640, r: 520, color: "#fff2c8", strength: 0.35 * light }] : [])]);
  const herThere = frame >= k.doorway;
  const actors = (
    <>
      <AcademyWindow frame={frame} />
      <VestOnHook on={!herThere} />
      <HomeTable bowl={false} />
      {/* the stairwell light: the hall glows, and a wedge falls across the floor, the fridge and your letter */}
      {light > 0 && (
        <g>
          <rect x={D.x - D.w / 2} y={D.top} width={D.w * light} height={FLOOR - D.top} fill="#ffe7b0" opacity={0.6} />
          <path d={`M${D.x - D.w / 2} ${D.top + 40} L${D.x - D.w / 2} ${FLOOR} L${mix(D.x - D.w / 2, HOME.fridge.from + 20, light)} ${FLOOR + 60} L${mix(D.x - D.w / 2, HOME.fridge.from + 40, light)} ${HOME.yours.y - 150}Z`}
            fill="#fff2c8" opacity={0.3 * light} />
        </g>
      )}
      {!taken || bagAt.y > 262 ? <LunchBag x={bagAt.x} y={bagAt.y} /> : null}
      {handIn > 0 && (
        <g>
          <polyline points={`1700,180 ${mix(1700, 1180, handIn)},${mix(180, 470, handIn)} ${mix(1600, taken ? bagAt.x + 4 : LUNCH.x + 4, handIn)},${mix(220, (taken ? bagAt.y : LUNCH.y) - 92, handIn)}`}
            fill="none" stroke={JIYOON.coat} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={mix(1600, (taken ? bagAt.x : LUNCH.x) + 4, handIn)} cy={mix(220, (taken ? bagAt.y : LUNCH.y) - 94, handIn)} r={16} fill={JIYOON.head} stroke={INK} strokeWidth={3} />
        </g>
      )}
      <clipPath id="herback-doorway"><rect x={D.x - D.w / 2} y={D.top} width={D.w} height={FLOOR - D.top + 40} /></clipPath>
      {herThere && away < 1 && (
        <g clipPath="url(#herback-doorway)" opacity={1 - ramp(frame, mix(k.gone[0], k.gone[1], 0.6), k.gone[1])}>
          <SisterBack x={HER_X + aside * (1 - away) + away * 10} y={mix(FLOOR, FLOOR - 70, away)} scale={mix(S, S * 0.72, away)} frame={frame} vest={vest} laugh={laugh}
            tilt={speak} headTilt={listen * (1 - away) + 12 * finger + 10 * ramp(frame, k.sidestep[0], k.sidestep[1]) * (1 - away)}
            rap={ramp(frame, k.rap[0], k.rap[1])} finger={finger} />
        </g>
      )}
      <Bag at={null} />
      {showYou && <You body={body} face={you} frame={frame} held={<Letter x={0} y={12} scale={0.36} tilt={-6} />} />}
    </>
  );
  return (
    <LookContext.Provider value={look}>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<HomeBack cam={cam} mood="lamp" frame={frame} />} actors={actors} />
    </LookContext.Provider>
  );
};

type View = "clock" | "wide" | "fridge" | "jar" | "doorway" | "ots" | "back" | "you" | "two" | "rap" | "leave" | "grin" | "door";

const HerBackShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current<View>(frame, [[k.start, "clock"], [k.pullOut, "wide"], [k.fridge, "fridge"], [k.jar, "jar"], [k.doorway, "doorway"], [k.ots, "ots"],
    [k.back, "back"], [k.holdB, "you"], [k.two, "two"], [k.rapShot, "rap"], [k.leave, "leave"], [k.grin, "grin"], [k.door, "door"]]);
  const away = ramp(frame, k.gone[0], k.gone[1]);
  const herHead = mix(FLOOR, FLOOR - 70, away) - 266 * mix(S, S * 0.72, away);
  const cams: Record<View, Camera> = {
    // "Eleven.": from the kitchen lamp across to the clock at eleven and her vest on its hook
    clock: camAt(frame, [[k.start, { x: HOME.lamp.x, y: HOME.lamp.y + 40, zoom: 2.5 }], [k.start + 8, { x: HOME.lamp.x + 20, y: HOME.lamp.y + 40, zoom: 2.5 }],
      [k.pullOut - 2, { x: 1625, y: 440, zoom: 2.45 }]]),
    wide: camAt(frame, [[k.pullOut, { x: 1420, y: 560, zoom: 1.35 }], [k.fridge, { x: 1270, y: 570, zoom: 1.1 }]]),
    fridge: camAt(frame, [[k.fridge, { x: 1270, y: 620, zoom: 2.2 }], [k.jar, { x: 1250, y: 620, zoom: 2.45 }]]),
    jar: camAt(frame, [[k.jar, insert(HOME.jar.x - 10, 560, 2.7)], [k.doorway, insert(HOME.jar.x - 20, 565, 3.0)]]),
    doorway: camAt(frame, [[k.doorway, { x: 1700, y: 640, zoom: 1.75 }], [k.ots, { x: 1720, y: 640, zoom: 1.9 }]]),
    ots: camAt(frame, [[k.ots, { x: 1740, y: 650, zoom: 2.15 }], [k.back, { x: 1750, y: 650, zoom: 2.3 }]]),
    // her whole head with room over it, yours whole at the left (owner, before picture lock)
    back: camAt(frame, [[k.back, { x: HER_X - 30, y: HEAD_Y + 50, zoom: 2.75 }], [k.holdB, { x: HER_X - 25, y: HEAD_Y + 40, zoom: 2.9 }]]),
    you: camAt(frame, [[k.holdB, closeUp(YOU_X + 50, HEAD_Y + 50, 2.4)], [k.two, closeUp(YOU_X + 50, HEAD_Y + 50, 2.55)]]),
    two: camAt(frame, [[k.two, { x: 1680, y: 540, zoom: 1.8 }], [k.rapShot, { x: 1690, y: 535, zoom: 1.88 }]]),
    rap: camAt(frame, [[k.rapShot, { x: 1790, y: 560, zoom: 2.2 }], [k.leave, { x: 1795, y: 555, zoom: 2.3 }]]),
    // over your shoulder: the empty air above her head, followed down the hall
    leave: camAt(frame, [[k.leave, { x: HER_X + 20, y: HEAD_Y - 20, zoom: 2.3 }], [k.grin, { x: HER_X + 30, y: herHead - 70, zoom: 2.6 }]]),
    grin: camAt(frame, [[k.grin, closeUp(YOU_X + 20, HEAD_Y, 2.5)], [k.door, closeUp(YOU_X + 20, HEAD_Y, 2.8)]]),
    door: camAt(frame, [[k.door, { x: D.x - 20, y: 600, zoom: 1.9 }], [k.end, { x: D.x - 10, y: 610, zoom: 2.1 }]]),
  };
  const cam = drift(cams[shot], frame, "herback", 3);
  // You: watching her; saying it to her back (a grin, the letter lifting); craning round; a dry look when she
  // sidesteps; watching her go; then a huff of a laugh, shaking your head (eyes swing side to side), a fond grin.
  const shake = frame >= k.grin && frame < k.grin + 40 ? Math.sin(((frame - k.grin) / 40) * Math.PI * 4) * 0.7 : 0;
  const you: Face = frame < k.holdB
    ? { brows: "none", lids: 0.1, mouth: "flat", eyes: 1, look: { x: 1, y: 0 } }
    : frame < k.two
      ? { brows: "raised", lids: 0, mouth: talk(frame, k.sayIt[0], k.sayIt[1], "smile"), eyes: 1.1, look: { x: 1, y: -0.05 } }
      : frame < k.peek[0]
        ? { brows: "raised", lids: 0, mouth: "smile", eyes: 1.05, look: { x: 0.8, y: -0.6 } }
        : frame < k.sidestep[1]
          ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.15, look: { x: 1, y: -0.3 } }
          : frame < k.rapShot
            ? { brows: "flat", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 1, y: -0.1 } }
            : frame < k.grin
              ? { brows: "raised", lids: 0.1, mouth: "flat", eyes: 1, look: { x: 1, y: 0 } }
              : { brows: "none", lids: 0.35, mouth: frame < k.grin + 24 ? "open" : "smile", eyes: 1, look: { x: shake, y: 0.2 } };
  return (
    <>
      <Kitchen frame={frame} k={k} cam={cam} you={you} showYou={shot !== "ots" && shot !== "clock" && shot !== "leave"} />
      {/* over your shoulder at her: a narrow edge of your head and scarf; her vest and back stay clear */}
      {(shot === "ots" || shot === "leave") && <YourShoulder side="left" />}
    </>
  );
};

const HerBack: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = times(shot.clips, shot.from, shot.to);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <HerBackShot frame={shot.frame} k={k} />
    </AbsoluteFill>
  );
};

export const herBack: Beat = { id: "HerBack", firstLine: 48, Component: HerBack };
