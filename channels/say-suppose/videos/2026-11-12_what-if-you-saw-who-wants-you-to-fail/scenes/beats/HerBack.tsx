// Beat "Her Back" (script.md v3, ## Her Back; narration lines 48-52). The flat at eleven under one lamp. Plants the
// fridge (your letter, the calendar) and the jar of brushes; your sister in the hall doorway with her back to you,
// pulling on the work vest. Two performed moments, the narrator silent:
//
//   48   "Eleven.": close on the clock at eleven and her work vest on its hook by the hall doorway, pulling out to the
//        room under the lamp; the fridge and your letter; INSERT the jar of brushes, bristles up.
//   49   the doorway: her back, the vest off the hook and over one shoulder; over your shoulder (the edge of your head
//        and scarf) at "She doesn't turn round".
//   hold (3 s, performed) her back fills the frame: the vest on one arm, then the other, the zip up; she tilts her
//        head to listen, and does not turn.
//   50   still on her back, head tilted: "Say it again." (her own voice)
//   hold (4 s, performed) close on you: your mouth moves, the letter in your hand lifts an inch and drops; the two
//        of you: nothing over her head, her shoulders shake once (the laugh); she raps the door frame twice with her
//        knuckles, her goodbye, and goes; the stairwell light falls across the fridge and the letter.
//   51   close on you in the light; the empty doorway.
//   52   your eyes go from the empty doorway to the letter; the letter in the fading light; your eyes go to the window,
//        full of the academy's lights; you turn and grab your bag, and the beat cuts on that action (outside review of
//        v4.1, 4:48: ten seconds of similar solitary framings, no visible decision).
import { AbsoluteFill } from "remotion";
import { STAND } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { Letter, YourShoulder } from "../parts";
import { HOME, HOME_LAMP, HomeBack, HomeTable } from "../sets/Home";
import { camAt, current, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { AcademyWindow, Bag, grabBag, VestOnHook } from "./HerBack.Room";
import { aimArm, SisterBack, talk, useGlows, You, type Body, type Face } from "./HerBack.Sister";

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i). */
function times(clips: Clip[], start: number, end: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const holdA = lineEnd(clips, 49) + 2; // performed: the vest goes on; she tilts her head
  const holdB = lineEnd(clips, 50) + 2; // performed: you say it to her back; the laugh; she goes
  const gapB = from(51) - holdB;
  const inB = (p: number) => Math.round(holdB + gapB * p);
  return {
    start,
    end,
    fridge: at(48, 0.25), // "The letter's already on the fridge"
    jar: at(48, 0.57), // "next to the jar where her paintbrushes have stood"
    doorway: from(49) - 3, // "She's in the doorway, pulling on her work vest"
    ots: at(49, 0.69), // "She doesn't turn round"
    holdA,
    vest: [holdA + 2, Math.round(mix(holdA, from(50), 0.74))] as const,
    listen: Math.round(mix(holdA, from(50), 0.78)),
    againLine: [from(50), lineEnd(clips, 50)] as const, // "Say it again."
    holdB,
    sayIt: [holdB + 2, inB(0.28)] as const,
    lift: [inB(0.1), inB(0.2), inB(0.27)] as const, // the letter lifts an inch, holds, drops
    two: inB(0.3), // nothing over her head
    laughs: [inB(0.34), inB(0.46)] as const,
    rap: [inB(0.48), inB(0.68)] as const, // two knocks on the door frame, her goodbye
    gone: [inB(0.66), inB(0.92)] as const, // she goes down the hall to the stairwell door
    lightShot: inB(0.74), // the stairwell light across the fridge and the letter
    light: [inB(0.7), inB(0.88), at(52, 0.25), at(52, 0.55)] as const, // up, full, fading, out
    clock: start, // "Eleven.": the clock and the vest on its hook
    pullOut: at(48, 0.08),
    you35: from(51) - 2, // "You say it to her back."
    door35: at(51, 0.6), // "A back is not a face.": the empty doorway
    eyes36: from(52) - 2, // "She laughs, and she's gone.": your eyes go from the doorway to the letter
    letter36: at(52, 0.14), // the letter in the fading light
    close: at(52, 0.3), // "Her number stays hidden.": your eyes go up to the window
    window: at(52, 0.47), // "And before you risk seeing it,": the window full of academy lights
    grab: at(52, 0.64), // "you test the rule on everyone else.": you turn and grab your bag; cut on the action
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
  const grabbing = frame >= k.grab;
  const grab = grabBag(frame, k.grab, S);
  const vest = ramp(frame, k.vest[0], k.vest[1]);
  const laugh = frame >= k.laughs[0] && frame < k.laughs[1] ? Math.sin(((frame - k.laughs[0]) / (k.laughs[1] - k.laughs[0])) * Math.PI) : 0;
  const away = ramp(frame, k.gone[0], k.gone[1]);
  const listen = ramp(frame, k.listen, k.listen + 10) * 17;
  const speak = frame >= k.againLine[0] && frame < k.againLine[1] ? Math.sin((frame - k.againLine[0]) / 6) * 2 : 0;
  const light = lightAt(frame, k);
  const body: Body = { x: YOU_X, y: FLOOR, scale: S, facing: 1, pose: STAND };
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
      {!(grabbing && grab.bag) && <Bag at={null} />}
      {showYou && <You body={grabbing ? grab.body : body} face={you} frame={frame} held={<Letter x={0} y={12} scale={0.36} tilt={-6} />} />}
      {grabbing && grab.bag && <Bag at={grab.bag} />}
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
    [k.holdA, "back"], [k.holdB, "you"], [k.two, "two"], [k.lightShot, "light"], [k.you35, "you35"], [k.door35, "door35"],
    [k.eyes36, "eyes36"], [k.letter36, "letter36"], [k.close, "close"], [k.window, "window"], [k.grab, "grab"]]);
  const yours = HOME.yours;
  const w = HOME.window;
  const cams: Record<typeof shot, Camera> = {
    // "Eleven.": the clock at eleven, her vest on its hook beside the empty hall doorway
    clock: camAt(frame, [[k.start, { x: 1625, y: 440, zoom: 2.45 }], [k.pullOut, { x: 1620, y: 430, zoom: 2.6 }]]),
    wide: camAt(frame, [[k.pullOut, { x: 1420, y: 560, zoom: 1.35 }], [k.fridge, { x: 1270, y: 570, zoom: 1.1 }]]),
    fridge: camAt(frame, [[k.fridge, { x: 1270, y: 620, zoom: 2.2 }], [k.jar, { x: 1250, y: 620, zoom: 2.45 }]]),
    jar: camAt(frame, [[k.jar, insert(HOME.jar.x + 40, 540, 3.0)], [k.doorway, insert(HOME.jar.x + 20, 545, 3.4)]]),
    doorway: camAt(frame, [[k.doorway, { x: 1700, y: 640, zoom: 1.75 }], [k.ots, { x: 1720, y: 640, zoom: 1.9 }]]),
    ots: camAt(frame, [[k.ots, { x: 1740, y: 650, zoom: 2.15 }], [k.holdA, { x: 1750, y: 650, zoom: 2.3 }]]),
    back: camAt(frame, [[k.holdA, closeUp(HER_X + 10, HEAD_Y + 110, 3.35)], [k.againLine[0], closeUp(HER_X + 10, HEAD_Y + 80, 3.5)], [k.holdB, closeUp(HER_X + 10, HEAD_Y + 70, 3.65)]]),
    you: camAt(frame, [[k.holdB, closeUp(YOU_X + 50, HEAD_Y + 50, 2.4)], [k.two, closeUp(YOU_X + 50, HEAD_Y + 50, 2.55)]]),
    two: camAt(frame, [[k.two, { x: 1660, y: 520, zoom: 1.8 }], [k.lightShot, { x: 1670, y: 515, zoom: 1.88 }]]),
    light: camAt(frame, [[k.lightShot, { x: 1380, y: 620, zoom: 1.7 }], [k.you35, { x: 1360, y: 640, zoom: 1.85 }]]),
    you35: camAt(frame, [[k.you35, closeUp(YOU_X + 40, HEAD_Y, 2.6)], [k.door35, closeUp(YOU_X + 40, HEAD_Y, 2.8)]]),
    door35: camAt(frame, [[k.door35, { x: HER_X - 10, y: 600, zoom: 1.9 }], [k.eyes36, { x: HER_X - 10, y: 610, zoom: 2.05 }]]),
    eyes36: camAt(frame, [[k.eyes36, closeUp(YOU_X + 20, HEAD_Y, 2.7)], [k.letter36, closeUp(YOU_X + 10, HEAD_Y, 2.85)]]),
    letter36: camAt(frame, [[k.letter36, insert(yours.x, yours.y - 60, 3.6)], [k.close, insert(yours.x, yours.y - 60, 4.0)]]),
    close: camAt(frame, [[k.close, closeUp(YOU_X - 10, HEAD_Y, 2.7)], [k.window, closeUp(YOU_X - 20, HEAD_Y - 10, 2.95)]]),
    window: camAt(frame, [[k.window, insert(w.x + w.w / 2, w.y + w.h / 2, 3.5)], [k.grab, insert(w.x + w.w / 2, w.y + w.h / 2, 3.9)]]),
    grab: camAt(frame, [[k.grab, { x: YOU_X - 40, y: 740, zoom: 2.0 }], [k.end, { x: YOU_X - 60, y: 750, zoom: 2.2 }]]),
  };
  const cam = drift(cams[shot], frame, "herback", 3);
  // You: watching her; saying it to her back (a grin, the letter lifting); the empty air; then quiet; your eyes go from
  // the doorway to the letter, from the letter to the window; set; the bag.
  const toLetter = ramp(frame, k.eyes36 + 18, k.eyes36 + 26);
  const toWindow = ramp(frame, k.close + 10, k.close + 20);
  const you: Face = frame < k.holdB
    ? { brows: "none", lids: 0.1, mouth: "flat", eyes: 1, look: { x: 1, y: 0 } }
    : frame < k.two
      ? { brows: "raised", lids: 0, mouth: talk(frame, k.sayIt[0], k.sayIt[1], "smile"), eyes: 1.1, look: { x: 1, y: -0.05 } }
      : frame < k.lightShot
        ? { brows: "raised", lids: 0, mouth: "smile", eyes: 1.05, look: { x: 0.8, y: -0.6 } }
        : frame < k.eyes36
          ? { brows: "worry", lids: 0.15, mouth: "flat", eyes: 1, look: { x: 1, y: 0 } }
          : frame < k.close
            ? { brows: "worry", lids: 0.2, mouth: "flat", eyes: 1, look: { x: mix(1, -1, toLetter), y: mix(0, 0.35, toLetter) } }
            : frame < k.grab
              ? { brows: toWindow > 0.5 ? "flat" : "worry", lids: mix(0.25, 0.1, toWindow), mouth: "flat", eyes: mix(1, 1.08, toWindow), look: { x: -1, y: mix(0.35, -0.35, toWindow) } }
              : { brows: "angry", lids: 0.15, mouth: "flat", eyes: 1, look: { x: 0.9, y: ramp(frame, k.grab + 26, k.grab + 40) * 0.7 - 0.1 } };
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
