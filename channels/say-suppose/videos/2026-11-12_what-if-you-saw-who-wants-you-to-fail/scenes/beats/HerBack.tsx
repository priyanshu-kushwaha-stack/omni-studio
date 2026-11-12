// Beat "Her Back" (script.md, ## [02:23] Her Back; narration lines 33-38). The flat at eleven under one lamp. Plants the
// fridge (your letter, the calendar) and the kimchi jar of brushes; Ji-yoon in the hall doorway with her back to you,
// pulling on the vest. You say it to her back: nothing opens. She laughs and goes.
//
//   33  the room, wide, under the lamp; the fridge and your letter; INSERT the jar of brushes, bristles up.
//   34  the doorway: her back, the vest going on; over your shoulder at "She doesn't turn round".
//   35  close on her back: "Say it again."
//   36  close on you saying it; the two-shot with the empty air over her head; close on her back again.
//   37  she laughs (her shoulders), and walks off down the dark hall.
//   38  close on you; then the room, wide, the doorway empty.
import { AbsoluteFill } from "remotion";
import { STAND } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, ForegroundHead, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { HOME, HOME_LAMP, HomeBack, HomeTable } from "../sets/Home";
import { camAt, current, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { SisterBack, talk, useGlows, You, type Body, type Face } from "./HerBack.Sister";

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i). */
function times(clips: Clip[], start: number, end: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  return {
    start,
    end,
    fridge: at(33, 0.21), // "The letter's already on the fridge"
    jar: at(33, 0.52), // "next to the kimchi jar where her brushes have stood"
    doorway: from(34) - 3, // "She's in the doorway, pulling on the vest"
    vest: [from(34), at(34, 0.8)] as const,
    ots: at(34, 0.66), // "She doesn't turn round"
    again: from(35) - 3, // "Say it again"
    againLine: [from(35), lineEnd(clips, 35)] as const,
    you: from(36) - 2, // "You say it to her back"
    sayIt: [from(36), at(36, 0.34)] as const,
    empty: at(36, 0.36), // "Nothing opens"
    notFace: at(36, 0.66), // "A back is not a face"
    laugh: from(37) - 2, // "She laughs"
    laughs: [from(37), at(37, 0.55)] as const,
    gone: [at(37, 0.52), lineEnd(clips, 37) + 8] as const, // "and she's gone"
    close: from(38) - 2, // "And she still hasn't seen your face say it"
    notYet: at(38, 0.74), // "Not yet."
  };
}

const S = 1.15;
const FLOOR = HOME.floor;
const YOU_X = HOME.spots.kitchen.x;
const HER_X = HOME.doorway.x;
const HEAD_Y = FLOOR - 304;
const D = HOME.doorway;

/** The kitchen: the room, the table, you, and Ji-yoon's back in the doorway (clipped to the opening as she walks off). */
const Kitchen: React.FC<{ frame: number; k: T; cam: Camera; you: Face; showYou?: boolean }> = ({ frame, k, cam, you, showYou = true }) => {
  const vest = ramp(frame, k.vest[0], k.vest[1]);
  const laugh = frame >= k.laughs[0] && frame < k.laughs[1] + 10 ? 1 - ramp(frame, k.laughs[1] - 6, k.laughs[1] + 10) : 0;
  const away = ramp(frame, k.gone[0], k.gone[1]);
  const speak = frame >= k.againLine[0] && frame < k.againLine[1] ? Math.sin((frame - k.againLine[0]) / 6) * 2.5 : 0;
  const body: Body = { x: YOU_X, y: FLOOR, scale: S, facing: 1, pose: STAND };
  const look = useGlows(cam, [HOME_LAMP]);
  const actors = (
    <>
      <HomeTable bowl={false} />
      <clipPath id="herback-doorway"><rect x={D.x - D.w / 2} y={D.top} width={D.w} height={FLOOR - D.top + 40} /></clipPath>
      {away < 1 && (
        <g clipPath="url(#herback-doorway)" opacity={1 - ramp(frame, mix(k.gone[0], k.gone[1], 0.6), k.gone[1])}>
          <SisterBack x={HER_X + away * 10} y={mix(FLOOR, FLOOR - 70, away)} scale={mix(S, S * 0.72, away)} frame={frame} vest={vest} laugh={laugh}
            tilt={speak} />
          {away > 0 && <rect x={D.x - D.w / 2} y={D.top} width={D.w} height={FLOOR - D.top} fill="#1e1f2c" opacity={away * 0.55} />}
        </g>
      )}
      {showYou && <You body={body} face={you} frame={frame} />}
    </>
  );
  return (
    <LookContext.Provider value={look}>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<HomeBack cam={cam} mood="lamp" frame={frame} />} actors={actors} />
    </LookContext.Provider>
  );
};

const HerBackShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.start, "wide"], [k.fridge, "fridge"], [k.jar, "jar"], [k.doorway, "doorway"], [k.ots, "ots"],
    [k.again, "back"], [k.you, "you"], [k.empty, "empty"], [k.notFace, "back2"], [k.laugh, "laugh"], [k.close, "close"], [k.notYet, "end"]]);
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.start, { x: 1240, y: 560, zoom: 1.02 }], [k.fridge, { x: 1270, y: 570, zoom: 1.1 }]]),
    fridge: camAt(frame, [[k.fridge, { x: 1270, y: 590, zoom: 2.2 }], [k.jar, { x: 1250, y: 590, zoom: 2.45 }]]),
    jar: camAt(frame, [[k.jar, insert(HOME.jar.x + 40, 540, 3.0)], [k.doorway, insert(HOME.jar.x + 20, 545, 3.4)]]),
    doorway: camAt(frame, [[k.doorway, { x: 1700, y: 640, zoom: 1.75 }], [k.ots, { x: 1720, y: 640, zoom: 1.9 }]]),
    ots: camAt(frame, [[k.ots, { x: 1760, y: 650, zoom: 2.15 }], [k.again, { x: 1770, y: 650, zoom: 2.3 }]]),
    back: camAt(frame, [[k.again, closeUp(HER_X, HEAD_Y + 50, 2.7)], [k.you, closeUp(HER_X, HEAD_Y + 50, 2.95)]]),
    you: camAt(frame, [[k.you, closeUp(YOU_X + 40, HEAD_Y, 2.7)], [k.empty, closeUp(YOU_X + 40, HEAD_Y, 2.9)]]),
    empty: camAt(frame, [[k.empty, { x: 1660, y: 520, zoom: 1.8 }], [k.notFace, { x: 1680, y: 500, zoom: 1.95 }]]),
    back2: camAt(frame, [[k.notFace, closeUp(HER_X, HEAD_Y + 70, 3.0)], [k.laugh, closeUp(HER_X, HEAD_Y + 70, 3.2)]]),
    laugh: camAt(frame, [[k.laugh, { x: 1740, y: 630, zoom: 1.85 }], [k.close, { x: 1760, y: 620, zoom: 1.7 }]]),
    close: camAt(frame, [[k.close, closeUp(YOU_X + 40, HEAD_Y, 2.6)], [k.notYet, closeUp(YOU_X + 40, HEAD_Y, 2.9)]]),
    end: camAt(frame, [[k.notYet, { x: 1500, y: 600, zoom: 1.5 }], [k.end, { x: 1360, y: 570, zoom: 1.12 }]]),
  };
  const cam = drift(cams[shot], frame, "herback", 3);
  // You: watching her; saying it (a grin); looking at the empty air over her head; then quiet.
  const you: Face = frame < k.you
    ? { brows: "none", lids: 0.1, mouth: "flat", eyes: 1, look: { x: 1, y: 0 } }
    : frame < k.empty
      ? { brows: "raised", lids: 0, mouth: talk(frame, k.sayIt[0], k.sayIt[1], "smile"), eyes: 1.1, look: { x: 1, y: -0.05 } }
      : frame < k.close
        ? { brows: "flat", lids: 0.1, mouth: "flat", eyes: 1.05, look: { x: 0.8, y: -0.7 } }
        : frame < k.notYet
          ? { brows: "worry", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.7, y: 0.35 } }
          : { brows: "worry", lids: 0.15, mouth: "smirk", eyes: 1, look: { x: 1, y: -0.05 } };
  return (
    <>
      <Kitchen frame={frame} k={k} cam={cam} you={you} showYou={shot !== "ots"} />
      {shot === "ots" && <ForegroundHead x={330} side="left" blur={16} />}
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

export const herBack: Beat = { id: "HerBack", firstLine: 33, Component: HerBack };
