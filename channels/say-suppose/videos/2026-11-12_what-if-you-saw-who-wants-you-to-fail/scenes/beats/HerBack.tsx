// Beat "Her Back" (script.md v5, ## Her Back; narration lines 48-50). The flat at eleven under one lamp: the fridge
// with your letter, the jar of her brushes; your sister in the hall doorway with her back to you, pulling on the work
// vest. Short now, and a gentle laugh, not sad (owner, v5):
//
//   48   "Eleven.": close on the clock and her vest on its hook, pulling out to the room; the fridge and your letter;
//        INSERT the jar of brushes; "She's in the doorway, pulling on her vest.": her back, the vest going on; over your
//        shoulder at "She doesn't turn round", her head tilting to listen.
//   49   close on her back: "Say it again." (her own voice)
//   hold (3 s, performed) close on you: your mouth moves, the letter lifts an inch; the two of you: no snap, nothing
//        over her head; her shoulders shake once (the laugh); she raps the door frame twice and goes; the stairwell
//        light falls across the fridge and the letter.
//   50   "You say it to her back.": close on you in the light; "Nothing opens. A back is not a face.": the empty doorway;
//        "Your sister has the only unreadable face in Seoul,": you, a huff of a laugh, shaking your head, grinning;
//        "because she never points it at you.": the fridge, your letter beside her brushes, the light fading.
import { AbsoluteFill } from "remotion";
import { STAND } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { Letter, YourShoulder } from "../parts";
import { HOME, HOME_LAMP, HomeBack, HomeTable } from "../sets/Home";
import { camAt, current, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { AcademyWindow, Bag, VestOnHook } from "./HerBack.Room";
import { aimArm, SisterBack, talk, useGlows, You, type Body, type Face } from "./HerBack.Sister";

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i). */
function times(clips: Clip[], start: number, end: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const holdB = lineEnd(clips, 49) + 2; // performed: you say it to her back; the laugh; she goes
  const gapB = from(50) - holdB;
  const inB = (p: number) => Math.round(holdB + gapB * p);
  const doorway = at(48, 0.62);
  return {
    start,
    end,
    clock: start, // "Eleven.": the clock and the vest on its hook
    pullOut: at(48, 0.05), // "Home."
    fridge: at(48, 0.1), // "The letter's already on the fridge"
    jar: at(48, 0.3), // "next to the jar where her paintbrushes have stood for six years"
    doorway, // "She's in the doorway, pulling on her vest."
    vest: [doorway + 4, at(48, 0.86)] as const,
    ots: at(48, 0.86), // "She doesn't turn round."
    listen: at(48, 0.9),
    back: from(49) - 6, // close on her back
    againLine: [from(49), lineEnd(clips, 49)] as const, // "Say it again."
    holdB,
    sayIt: [holdB + 2, inB(0.3)] as const,
    lift: [inB(0.1), inB(0.2), inB(0.28)] as const, // the letter lifts an inch, holds, drops
    two: inB(0.3), // nothing over her head
    laughs: [inB(0.34), inB(0.48)] as const,
    rap: [inB(0.5), inB(0.68)] as const, // two knocks on the door frame, her goodbye
    gone: [inB(0.66), inB(0.92)] as const, // she goes down the hall to the stairwell door
    lightShot: inB(0.76), // the stairwell light across the fridge and the letter
    light: [inB(0.7), inB(0.88), at(50, 0.6), at(50, 0.95)] as const, // up, full, fading, out
    you50: from(50) - 2, // "You say it to her back."
    door50: at(50, 0.16), // "Nothing opens. A back is not a face.": the empty doorway
    grin: at(50, 0.36), // "Your sister has the only unreadable face in Seoul,": your huff of a laugh
    fridgeEnd: at(50, 0.7), // "because she never points it at you.": the letter beside her brushes
  };
}

const S = 1.15;
const FLOOR = HOME.floor;
const YOU_X = HOME.spots.kitchen.x;
const HER_X = HOME.doorway.x;
const HEAD_Y = FLOOR - 304;
const D = HOME.doorway;

/** The stairwell light: up as the far door opens, full, then fading as it shuts. */
const lightAt = (frame: number, k: T) => ramp(frame, k.light[0], k.light[1]) * (1 - ramp(frame, k.light[2], k.light[3]));

/** The kitchen: the room, the table, you with the letter, her back in the doorway (her vest on its hook until she is
 *  there), the window full of academy lights, your bag at your feet, the stairwell light. */
const Kitchen: React.FC<{ frame: number; k: T; cam: Camera; you: Face; showYou?: boolean }> = ({ frame, k, cam, you, showYou = true }) => {
  const vest = ramp(frame, k.vest[0], k.vest[1]);
  const laugh = frame >= k.laughs[0] && frame < k.laughs[1] ? Math.sin(((frame - k.laughs[0]) / (k.laughs[1] - k.laughs[0])) * Math.PI) : 0;
  const away = ramp(frame, k.gone[0], k.gone[1]);
  const listen = ramp(frame, k.listen, k.listen + 10) * 17;
  const speak = frame >= k.againLine[0] && frame < k.againLine[1] ? Math.sin((frame - k.againLine[0]) / 6) * 2 : 0;
  const light = lightAt(frame, k);
  const huff = frame >= k.grin && frame < k.grin + 24 ? Math.abs(Math.sin(((frame - k.grin) / 24) * Math.PI * 3)) * 6 : 0;
  const body: Body = { x: YOU_X, y: FLOOR - huff, scale: S, facing: 1, pose: STAND };
  const lift = ramp(frame, k.lift[0], k.lift[1]) * (1 - ramp(frame, k.lift[2] - 2, k.lift[2] + 3));
  body.pose = { ...STAND, armF: aimArm(body, { x: YOU_X + 66, y: FLOOR - 186 - lift * 16 }) };
  const look = useGlows(cam, [HOME_LAMP, ...(light > 0 ? [{ x: D.x, y: 640, r: 520, color: "#fff2c8", strength: 0.35 * light }] : [])]);
  const herThere = frame >= k.doorway;
  const actors = (
    <>
      <AcademyWindow frame={frame} />
      <VestOnHook on={!herThere} />
      <HomeTable bowl={false} />
      {/* the stairwell light: the hall glows, and a wedge falls across the floor, the fridge and your letter */}
      {light > 0 && (
        <g opacity={light}>
          <rect x={D.x - D.w / 2} y={D.top} width={D.w} height={FLOOR - D.top} fill="#ffe7b0" opacity={0.55} />
          <path d={`M${D.x - D.w / 2} ${D.top + 40} L${D.x - D.w / 2} ${FLOOR} L${HOME.fridge.from + 20} ${FLOOR + 60} L${HOME.fridge.from + 40} ${HOME.yours.y - 150}Z`}
            fill="#fff2c8" opacity={0.3} />
        </g>
      )}
      <clipPath id="herback-doorway"><rect x={D.x - D.w / 2} y={D.top} width={D.w} height={FLOOR - D.top + 40} /></clipPath>
      {herThere && away < 1 && (
        <g clipPath="url(#herback-doorway)" opacity={1 - ramp(frame, mix(k.gone[0], k.gone[1], 0.6), k.gone[1])}>
          <SisterBack x={HER_X + away * 10} y={mix(FLOOR, FLOOR - 70, away)} scale={mix(S, S * 0.72, away)} frame={frame} vest={vest} laugh={laugh}
            tilt={speak} headTilt={listen * (1 - away)} rap={ramp(frame, k.rap[0], k.rap[1])} />
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

const HerBackShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.start, "clock"], [k.pullOut, "wide"], [k.fridge, "fridge"], [k.jar, "jar"], [k.doorway, "doorway"], [k.ots, "ots"],
    [k.back, "back"], [k.holdB, "you"], [k.two, "two"], [k.lightShot, "light"], [k.you50, "you50"], [k.door50, "door50"],
    [k.grin, "grin"], [k.fridgeEnd, "fridgeEnd"]]);
  const yours = HOME.yours;
  const cams: Record<typeof shot, Camera> = {
    // "Eleven.": the clock at eleven, her vest on its hook beside the empty hall doorway
    clock: camAt(frame, [[k.start, { x: 1625, y: 440, zoom: 2.45 }], [k.pullOut, { x: 1620, y: 430, zoom: 2.6 }]]),
    wide: camAt(frame, [[k.pullOut, { x: 1420, y: 560, zoom: 1.35 }], [k.fridge, { x: 1270, y: 570, zoom: 1.1 }]]),
    fridge: camAt(frame, [[k.fridge, { x: 1270, y: 620, zoom: 2.2 }], [k.jar, { x: 1250, y: 620, zoom: 2.45 }]]),
    jar: camAt(frame, [[k.jar, insert(HOME.jar.x + 40, 540, 3.0)], [k.doorway, insert(HOME.jar.x + 20, 545, 3.4)]]),
    doorway: camAt(frame, [[k.doorway, { x: 1700, y: 640, zoom: 1.75 }], [k.ots, { x: 1720, y: 640, zoom: 1.9 }]]),
    ots: camAt(frame, [[k.ots, { x: 1740, y: 650, zoom: 2.15 }], [k.back, { x: 1750, y: 650, zoom: 2.3 }]]),
    back: camAt(frame, [[k.back, closeUp(HER_X + 60, HEAD_Y + 90, 3.4)], [k.holdB, closeUp(HER_X + 60, HEAD_Y + 70, 3.65)]]),
    you: camAt(frame, [[k.holdB, closeUp(YOU_X + 50, HEAD_Y + 50, 2.4)], [k.two, closeUp(YOU_X + 50, HEAD_Y + 50, 2.55)]]),
    two: camAt(frame, [[k.two, { x: 1660, y: 520, zoom: 1.8 }], [k.lightShot, { x: 1670, y: 515, zoom: 1.88 }]]),
    light: camAt(frame, [[k.lightShot, { x: 1380, y: 620, zoom: 1.7 }], [k.you50, { x: 1360, y: 640, zoom: 1.85 }]]),
    you50: camAt(frame, [[k.you50, closeUp(YOU_X + 40, HEAD_Y, 2.6)], [k.door50, closeUp(YOU_X + 40, HEAD_Y, 2.8)]]),
    door50: camAt(frame, [[k.door50, { x: HER_X - 10, y: 600, zoom: 1.9 }], [k.grin, { x: HER_X - 10, y: 610, zoom: 2.05 }]]),
    grin: camAt(frame, [[k.grin, closeUp(YOU_X + 20, HEAD_Y, 2.5)], [k.fridgeEnd, closeUp(YOU_X + 20, HEAD_Y, 2.8)]]),
    fridgeEnd: camAt(frame, [[k.fridgeEnd, insert(yours.x - 140, yours.y - 40, 2.6)], [k.end, insert(yours.x - 150, yours.y - 40, 3.0)]]),
  };
  const cam = drift(cams[shot], frame, "herback", 3);
  // You: watching her; saying it to her back (a grin, the letter lifting); the empty air; then the doorway; then a huff
  // of a laugh, shaking your head (eyes swing side to side), a fond grin.
  const shake = frame >= k.grin && frame < k.grin + 40 ? Math.sin(((frame - k.grin) / 40) * Math.PI * 4) * 0.7 : 0;
  const you: Face = frame < k.holdB
    ? { brows: "none", lids: 0.1, mouth: "flat", eyes: 1, look: { x: 1, y: 0 } }
    : frame < k.two
      ? { brows: "raised", lids: 0, mouth: talk(frame, k.sayIt[0], k.sayIt[1], "smile"), eyes: 1.1, look: { x: 1, y: -0.05 } }
      : frame < k.lightShot
        ? { brows: "raised", lids: 0, mouth: "smile", eyes: 1.05, look: { x: 0.8, y: -0.6 } }
        : frame < k.grin
          ? { brows: "raised", lids: 0.1, mouth: "flat", eyes: 1, look: { x: 1, y: 0 } }
          : { brows: "none", lids: 0.35, mouth: frame < k.grin + 24 ? "open" : "smile", eyes: 1, look: { x: shake, y: 0.2 } };
  return (
    <>
      <Kitchen frame={frame} k={k} cam={cam} you={you} showYou={shot !== "ots" && shot !== "clock"} />
      {/* over your shoulder at her: a narrow edge of your head and scarf; her vest and back stay clear */}
      {shot === "ots" && <YourShoulder side="left" />}
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
