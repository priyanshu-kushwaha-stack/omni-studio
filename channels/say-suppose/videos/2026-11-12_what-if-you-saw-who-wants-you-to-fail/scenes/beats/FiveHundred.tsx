// Beat "Five Hundred" (script v7, ## Five Hundred; lines 62-65; outside review of v6, sheets 24-25).
//   62  "Then your maths teacher does the worst thing a teacher can do.": Ms. Kang slowly turns her eyes on you; you sink
//   63  "Up.": close on her, the red pen jabbing up (FourSeats.Class UpShot)
//   64  the school hall: five hundred faces; you cross the stage to the microphone, the letter up
//   hold  your bubble "I got the scholarship.", large; five hundred cards snap open in blocks, front to back: grey,
//       grey, your class's red row alone, grey, grey, grey, and last one teal at the very back (ringed); the grey dim
//   65  "Grey in rows, like seats." the hall; "One red row: yours." pushed in on it, the grey dimmed; "And one blazing
//       teal at the very back": the janitor under +97; "the janitor, who thinks you said the heating's fixed": the
//       radiator warms, he nods at it, thumbs up; then from the back of the hall, he claps, alone (the laugh)
import { AbsoluteFill } from "remotion";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { Bubble, MeterSound } from "../parts";
import { camAt, current, lineEnd, ramp, type Beat, type Shot } from "../shared";
import { moodAt } from "./WhosCrimson.Common";
import { UpShot } from "./FourSeats.Class";
import { Audience, HallBack, JANITOR, JANITOR_DELAY, Janitor, OnStage, Radiator, RED_ROW, rowDelay, rowY, youOnStage } from "./FiveHundred.Hall";

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
    janitorTag: wave + JANITOR_DELAY,
    rows: c[65].from,
    red: at(65, 0.27),
    back: at(65, 0.4),
    warm: at(65, 0.63),
    alone: at(65, 0.86),
    end: shot.to,
  };
}

type View = "kang" | "hall" | "mic" | "wide" | "red" | "janitor" | "radiator" | "alone";

const FiveHundred: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot);
  const mood = moodAt(shot);
  const view = current<View>(frame, [[0, "kang"], [k.hall, "hall"], [k.mic, "mic"], [k.wide, "wide"], [k.red, "red"], [k.back, "janitor"], [k.warm, "radiator"], [k.alone, "alone"]]);
  if (view === "kang") {
    return <AbsoluteFill style={{ background: "#000" }}><UpShot frame={frame} from={k.kang} up={k.up} to={k.hall} mood={mood} /></AbsoluteFill>;
  }
  const you = youOnStage(frame, k.hall + 4, k.walked, k.mic - 6);
  const yh = you.head;
  const jy = JANITOR.y - 150 * JANITOR.scale;
  const cams: Record<Exclude<View, "kang">, Camera> = {
    hall: camAt(frame, [[k.hall, { x: 1250, y: 600, zoom: 1.05 }], [k.mic, { x: 980, y: 580, zoom: 1.0 }]]),
    mic: camAt(frame, [[k.mic, closeUp(yh.x + 190, yh.y - 30, 2.1)], [k.wide, closeUp(yh.x + 190, yh.y - 40, 2.25)]]),
    wide: camAt(frame, [[k.wide, { x: 1150, y: 700, zoom: 1.0 }], [k.rows, { x: 1180, y: 560, zoom: 0.9 }], [k.red, { x: 1190, y: 540, zoom: 0.92 }]]),
    red: camAt(frame, [[k.red, { x: 1300, y: rowY(RED_ROW) - 40, zoom: 1.7 }], [k.back, { x: 1340, y: rowY(RED_ROW) - 40, zoom: 1.9 }]]),
    janitor: camAt(frame, [[k.back, { x: JANITOR.x - 40, y: jy - 10, zoom: 3.6 }], [k.warm, { x: JANITOR.x - 50, y: jy - 10, zoom: 3.9 }]]),
    radiator: camAt(frame, [[k.warm, { x: JANITOR.x + 70, y: jy + 20, zoom: 3.0 }], [k.alone, { x: JANITOR.x + 80, y: jy + 20, zoom: 3.15 }]]),
    alone: camAt(frame, [[k.alone, { x: 1960, y: 360, zoom: 2.3 }], [k.end, { x: 1980, y: 350, zoom: 2.45 }]]),
  };
  const v = view as Exclude<View, "kang">;
  const cam = drift(cams[v], frame, "hall", v === "janitor" || v === "radiator" ? 2 : 3);
  const redAt = k.wave + rowDelay(RED_ROW);
  const dim = v === "red" ? 0.85 : ramp(frame, redAt + 18, redAt + 30);
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
            <Radiator frame={frame} warm={ramp(frame, k.warm, k.warm + 20)} />
            <Janitor frame={frame} at={k.janitorTag} until={k.end} nod={ramp(frame, k.warm + 14, k.warm + 22)} clap={frame >= k.alone ? 1 : 0}
              halo={v === "wide" || v === "red" ? 1 : 0} />
            <Audience frame={frame} wave={k.wave} until={k.end} turn={ramp(frame, k.hall + 10, k.hall + 40)} dim={dim} />
            <OnStage frame={frame} you={you} face={face} />
            <Bubble frame={frame} at={k.bubble} until={k.wide} x={yh.x + 50} y={yh.y - yh.r - 4} text="I got the scholarship." size={34} side="right" />
          </>
        } />
      </LookContext.Provider>
      {[0, 8, 18, 30, 38, 46].map((d, i) => <MeterSound key={d} at={k.wave + d} soft={i % 2 === 1} volume={i === 2 ? 0.7 : 0.6 - i * 0.07} />)}
      <MeterSound at={k.janitorTag} volume={0.5} />
    </AbsoluteFill>
  );
};

export const fiveHundred: Beat = { id: "FiveHundred", firstLine: 62, Component: FiveHundred };
