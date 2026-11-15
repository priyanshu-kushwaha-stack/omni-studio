// Tomorrow's end (Tomorrow.tsx, lines 79-83): you half out of your pod, stretching; the hatch above yours, dark all
// film, flutters and clicks to 365; in the 4 s hold its door swings up and your flatmate climbs out a year older, apron
// on, lids heavy, your own sly grin, and pulls her mop out after her; your hand goes up, your bubble "So, last night...";
// "Tell me tomorrow."; the last image held uncut (her grin, your open mouth, the bubble, the kettle on the desk with no
// lead); then the hall doorway: your boss with a new coil and two plugs, "Two plugs.", cut before your face; the closing
// question and the end card over him (tags in the left two-thirds, the right third the quiet stairs).
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { SEATED, seatedY, STAND, walkPose } from "@whatif/kit/rig/pose";
import { worldOf } from "@whatif/kit/sets/common";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { Bubble, CounterSound, FLUTTER_FRAMES } from "../parts";
import { Deep } from "../sets/common";
import { FLOOR, POD_ONE } from "../sets/PodHall";
import { camAt, current, mix, ramp } from "../shared";
import { HallStage, NightDesk, Temples } from "./NightThirty.Hall";
import { EndCard, HallStairs } from "./TellMeNow.Kitchen";
import { aimArm, Boss, Coil, handAt, headOf, Mate, You, type Body, type Face } from "./Timeline.Cast";
import { UPPER_POD, UpperPod } from "./Tomorrow.Parts";
import type { TM } from "./Tomorrow";

const LIP = { x: POD_ONE.x + 150, y: POD_ONE.y + POD_ONE.h - 6 };
const UPPER_LIP = { x: UPPER_POD.x + 200, y: UPPER_POD.y + UPPER_POD.h - 6 };

/** The two of you at your hatches: you on the lower lip, her climbing out onto the upper one. */
function cast(frame: number, k: TM, cam: Camera) {
  const seat = worldOf(cam, LIP.x, LIP.y, 0.85);
  const up = worldOf(cam, UPPER_LIP.x, UPPER_LIP.y, 0.85);
  const s = 0.92;
  const stretch = frame < k.hold ? Math.sin(Math.PI * Math.min(1, Math.max(0, (frame - k.l79) / 50))) : 0;
  const you: Body = { x: seat.x, y: seatedY(seat.y, s), scale: s, facing: 1, pose: { ...SEATED, lean: 2, armF: [40, 50], armB: [-6, 30] } };
  if (stretch > 0) you.pose = { ...you.pose, armF: [mix(40, 168, stretch), 10], armB: [mix(-6, 158, stretch), 14], lean: -4 };
  const yh = headOf(you);
  const handUp = frame >= k.hand;
  if (handUp) you.pose = { ...you.pose, lean: -6, armF: aimArm(you, { x: yh.x + 70, y: yh.y - 40 }) };
  const youFace: Face = frame < k.flutter + FLUTTER_FRAMES
    ? { brows: "flat", lids: 0.55, mouth: stretch > 0.4 ? "o" : "smirk", eyes: 0.9, look: { x: 0.8, y: -0.1 } }
    : frame < k.hand ? { brows: "raised", lids: 0, mouth: "flat", eyes: 1.15, look: { x: 0.4, y: -1 } }
    : { brows: "raised", lids: 0.05, mouth: "open", eyes: 1.05, look: { x: 0.5, y: -1 } };
  // her: from inside the upper pod out onto its lip, a year older; the mop pulled out after her
  const out = ramp(frame, k.out[0], k.out[1]);
  const her: Body = { x: mix(up.x - 130, up.x, out), y: seatedY(up.y, s) + mix(30, 0, out), scale: s, facing: -1, pose: { ...SEATED, lean: mix(-30, 4, out), tilt: 4 } };
  const mop = ramp(frame, k.mop[0], k.mop[1]);
  const hh = headOf(her);
  if (frame >= k.mop[0]) her.pose = { ...her.pose, armF: aimArm(her, { x: mix(hh.x + 100, hh.x - 30, mop), y: mix(hh.y + 120, hh.y + 70, mop) }) };
  const speaking = frame >= k.l80 && frame < k.l80End;
  const herFace: Face = speaking
    ? { brows: "flat", lids: 0.55, mouth: Math.floor((frame - k.l80) / 5) % 2 ? "open" : "smirk", eyes: 0.95, look: { x: 0.9, y: 0.6 } }
    : { brows: "flat", lids: 0.6, mouth: "smirk", eyes: 0.9, look: { x: 0.9, y: 0.6 } };
  return { you, youFace, her, herFace, out, mop, seat };
}

/** Lines 79-83: the hatch above yours, the twist, the last image, the boss with two plugs and the end card. */
export const EndScene: React.FC<{ frame: number; k: TM }> = ({ frame, k }) => {
  const on = current(frame, [[k.l79, "pods"], [k.hold, "climb"], [k.l80, "her"], [k.l81, "last"], [k.bossIn[0], "boss"]] as [number, string][]);
  const base: Camera = { x: 600, y: 590, zoom: 1.7 };
  const c0 = cast(frame, k, base);
  const hh = headOf(c0.her);
  const cams: Record<string, Camera> = {
    pods: camAt(frame, [[k.l79, { x: 600, y: 600, zoom: 1.75 }], [k.hold, { x: 600, y: 590, zoom: 1.7 }]]),
    climb: camAt(frame, [[k.hold, { x: 600, y: 590, zoom: 1.7 }], [k.l80, { x: 610, y: 580, zoom: 1.8 }]]),
    her: camAt(frame, [[k.l80, closeUp(hh.x - 20, hh.y + 30, 2.5)], [k.l81, closeUp(hh.x - 20, hh.y + 30, 2.65)]]),
    last: camAt(frame, [[k.l81, { x: 560, y: 610, zoom: 1.5 }], [k.bossIn[0], { x: 570, y: 610, zoom: 1.62 }]]),
    boss: camAt(frame, [[k.bossIn[0], { x: 1560, y: 680, zoom: 1.75 }], [k.l83, { x: 1560, y: 680, zoom: 1.9 }], [k.l83 + 30, { x: 1550, y: 640, zoom: 1.2 }], [k.end, { x: 1552, y: 640, zoom: 1.24 }]]),
  };
  const cam = drift(cams[on], frame, `tm-${on}`, 2);
  const c = cast(frame, k, cam);
  const yh = headOf(c.you);
  const herHand = handAt(c.her);
  const open = ramp(frame, k.open[0], k.open[1]);
  const upperClip = worldOf(cam, UPPER_POD.x + 16, UPPER_POD.y - 300, 0.85);
  let actors: React.ReactNode;
  if (on === "boss") {
    const step = ramp(frame, k.bossIn[0], k.bossIn[1]);
    const boss: Body = { x: mix(1820, 1630, step), y: FLOOR, scale: 1.12, facing: -1, pose: step < 1 ? walkPose(frame * 0.3) : STAND };
    const coilAt = { x: boss.x - 70, y: FLOOR - 250 };
    boss.pose = { ...boss.pose, armF: aimArm(boss, { x: coilAt.x - 10, y: coilAt.y + 30 }), armB: aimArm(boss, { x: coilAt.x + 26, y: coilAt.y + 34 }) };
    const speaking = frame >= k.l82 && frame < k.l82End + 4;
    actors = (
      <>
        <HallStairs door />
        <Boss body={boss} face={{ brows: "raised", lids: 0.15, mouth: speaking ? "open" : "smile", eyes: 1.05, look: { x: 1, y: 0 } }} frame={frame} />
        <Coil x={coilAt.x} y={coilAt.y} r={38} plugs={2} />
      </>
    );
  } else {
    const herVisible = frame >= k.out[0];
    actors = (
      <>
        <NightDesk lamp={false} kettleLead={false} lampCord={false} />
        <You body={c.you} face={c.youFace} frame={frame} />
        {herVisible && (
          <g>
            <clipPath id="tm-upper"><rect x={upperClip.x} y={upperClip.y} width={2000} height={300 + UPPER_POD.h - 10} /></clipPath>
            <g clipPath={c.out < 1 ? "url(#tm-upper)" : undefined}>
              <Mate body={c.her} face={c.herFace} frame={frame} />
              <Temples body={c.her} />
              {frame >= k.mop[0] && <line x1={herHand.x} y1={herHand.y} x2={herHand.x + mix(-220, 60, c.mop)} y2={herHand.y + mix(10, -300, c.mop)} stroke="#c9915a" strokeWidth={9} strokeLinecap="round" />}
            </g>
          </g>
        )}
        <Bubble frame={frame} at={k.bubble} until={k.bossIn[0]} x={yh.x - 30} y={yh.y - 36} text="So, last night..." size={34} side="left" />
      </>
    );
  }
  const card = ramp(frame, k.l83 + 20, k.l83 + 40);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <HallStage cam={cam} frame={frame} mood="morning" hall={{ door: 1, counter: { value: "365" }, wedge: true, minutes: 55 }}
        back={<Deep cam={cam} depth={0.85}><UpperPod frame={frame} open={open} flutter={k.flutter} /></Deep>} actors={actors} />
      {frame >= k.l83 + 20 && <EndCard frame={frame} dim={card} comment={k.comment} like={k.like} subscribe={k.subscribe} />}
      <CounterSound at={k.flutter} volume={0.8} />
      <Sequence from={k.open[0]} durationInFrames={40}><Audio src={staticFile("sfx/hatch.wav")} volume={0.7} /></Sequence>
    </AbsoluteFill>
  );
};
