// Beat "Five Hundred" (script v5, ## [04:40] Five Hundred; lines 62-65).
//   62  "Then your maths teacher does the worst thing a teacher can do.": Ms. Kang slowly turns her eyes on you; you sink
//   63  "Up.": close on her, the red pen jabbing up (FourSeats.Class UpShot)
//   64  the school hall: five hundred faces; you cross the stage to the microphone, the letter up
//   hold  your bubble "I got the scholarship."; five hundred cards snap open, rolling back through the hall like a wave:
//       grey in rows, one red row near the front (your class), one blazing teal at the very back; the camera rises
//   65  "Grey in rows, like seats." the hall; "One red row: yours." pushed in on it; "And one blazing teal at the very
//       back": the janitor with his mop under +97; "who thinks you said the heating's fixed": a big thumbs up, a nod at
//       the radiator (the laugh)
import { AbsoluteFill } from "remotion";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { Bubble, MeterSound } from "../parts";
import { camAt, current, lineEnd, ramp, type Beat, type Shot } from "../shared";
import { moodAt } from "./WhosCrimson.Common";
import { UpShot } from "./FourSeats.Class";
import { Audience, HallBack, JANITOR, Janitor, OnStage, RED_ROW, rowY, youOnStage } from "./FiveHundred.Hall";

function times(shot: Shot) {
  const c = shot.clips;
  const at = (i: number, p: number) => Math.round(c[i].from + c[i].frames * p);
  const bubble = lineEnd(c, 64) + 12;
  const wave = bubble + 44;
  return {
    kang: c[62].from,
    up: c[63].from,
    hall: c[64].from,
    walked: at(64, 0.55),
    mic: at(64, 0.72),
    bubble,
    wide: wave - 4,
    wave,
    janitorTag: wave + 62,
    rows: c[65].from,
    red: at(65, 0.3),
    back: at(65, 0.52),
    thumbs: at(65, 0.7),
    end: shot.to,
  };
}

type View = "kang" | "hall" | "mic" | "wide" | "red" | "janitor";

const FiveHundred: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot);
  const mood = moodAt(shot);
  const view = current<View>(frame, [[0, "kang"], [k.hall, "hall"], [k.mic, "mic"], [k.wide, "wide"], [k.red, "red"], [k.back, "janitor"]]);
  if (view === "kang") {
    return <AbsoluteFill style={{ background: "#000" }}><UpShot frame={frame} from={k.kang} up={k.up} to={k.hall} mood={mood} /></AbsoluteFill>;
  }
  const you = youOnStage(frame, k.hall + 4, k.walked, k.mic - 6);
  const yh = you.head;
  const jy = JANITOR.y - 150 * JANITOR.scale;
  const cams: Record<Exclude<View, "kang">, Camera> = {
    hall: camAt(frame, [[k.hall, { x: 1250, y: 600, zoom: 1.05 }], [k.mic, { x: 980, y: 580, zoom: 1.0 }]]),
    mic: camAt(frame, [[k.mic, closeUp(yh.x + 90, yh.y - 10, 2.2)], [k.wide, closeUp(yh.x + 90, yh.y - 20, 2.4)]]),
    wide: camAt(frame, [[k.wide, { x: 1150, y: 700, zoom: 1.0 }], [k.rows, { x: 1180, y: 560, zoom: 0.9 }], [k.red, { x: 1190, y: 540, zoom: 0.92 }]]),
    red: camAt(frame, [[k.red, { x: 1300, y: rowY(RED_ROW) - 40, zoom: 1.7 }], [k.back, { x: 1340, y: rowY(RED_ROW) - 40, zoom: 1.9 }]]),
    janitor: camAt(frame, [[k.back, { x: JANITOR.x - 40, y: jy - 10, zoom: 3.6 }], [k.end, { x: JANITOR.x - 50, y: jy - 10, zoom: 3.9 }]]),
  };
  const v = view as Exclude<View, "kang">;
  const cam = drift(cams[v], frame, "hall", v === "janitor" ? 2 : 3);
  const nervous = frame >= k.mic && frame < k.wave;
  const face = nervous
    ? { brows: "worry" as const, lids: 0, mouth: frame >= k.bubble && frame < k.bubble + 30 ? "open" as const : "wobble" as const, eyes: 1.15, look: { x: 1, y: 0.1 } }
    : frame >= k.wave ? { brows: "raised" as const, lids: 0, mouth: "o" as const, eyes: 1.2, look: { x: 1, y: -0.1 } }
    : { brows: "worry" as const, lids: 0.1, mouth: "flat" as const, eyes: 1, look: { x: 1, y: 0 } };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <LookContext.Provider value={setLook([], mood, cam, { dof: 0 })}>
        <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<HallBack />} actors={
          <>
            <Janitor frame={frame} at={k.janitorTag} until={k.end} thumbs={ramp(frame, k.thumbs, k.thumbs + 8)} />
            <Audience frame={frame} wave={k.wave} until={k.end} turn={ramp(frame, k.hall + 10, k.hall + 40)} />
            <OnStage frame={frame} you={you} face={face} />
            <Bubble frame={frame} at={k.bubble} until={k.rows} x={yh.x + 50} y={yh.y - yh.r - 4} text="I got the scholarship." size={22} side="right" />
          </>
        } />
      </LookContext.Provider>
      {[0, 6, 13, 21, 30, 40].map((d, i) => <MeterSound key={d} at={k.wave + d} soft={i % 2 === 1} volume={0.6 - i * 0.07} />)}
      <MeterSound at={k.janitorTag} volume={0.5} />
    </AbsoluteFill>
  );
};

export const fiveHundred: Beat = { id: "FiveHundred", firstLine: 62, Component: FiveHundred };
