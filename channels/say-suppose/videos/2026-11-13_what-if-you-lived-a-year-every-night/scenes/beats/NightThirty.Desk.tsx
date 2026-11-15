// Night Thirty at the night desk (NightThirty.tsx, lines 60-63): three in the morning, one lamp. You behind the desk,
// chin on your hand, NO NAPS on your chair; your flatmate comes in with two mugs, puts one in front of you and sits on
// the desk; "So. My brother."; she tells it with her hands, you laugh once, she points at you; then she mimes the kettle
// and your eyes slide to the lamp's cord, the kettle's lead and the taped socket under your old hatch, and you smile.
import { lerpPose, SEATED, seatedY, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Mug } from "@whatif/kit/sets/props";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { worldOf } from "@whatif/kit/sets/common";
import type { Camera } from "@whatif/kit/stage/Stage";
import { FLOOR } from "../sets/PodHall";
import { camAt, current, linear, mix, ramp } from "../shared";
import { DESK, DeskChair, HallStage, HER_PERCH, LeaningMop, NightDesk, Sockets, SPARE, YOUR_SEAT } from "./NightThirty.Hall";
import { aimArm, handAt, headOf, Mate, You, type Body, type Face } from "./Timeline.Cast";
import type { NT } from "./NightThirty";

const YOUR_MUG = 296;
const HER_MUG = 352;

function yourBody(frame: number, k: NT): { body: Body; face: Face; sip: boolean } {
  const s = YOUR_SEAT.scale;
  const body: Body = { x: YOUR_SEAT.x, y: seatedY(YOUR_SEAT.top, s), scale: s, facing: 1, pose: { ...SEATED, lean: 10 } };
  const laughing = frame >= k.laugh && frame < k.laugh + 22;
  const sip = frame >= k.thirty + 8 && frame < k.l62End - 6;
  const up = ramp(frame, k.l61, k.l61 + 20);
  body.pose = { ...body.pose, lean: mix(12, 2, up) + (laughing ? -16 : 0), tilt: laughing ? -24 : mix(10, 0, up) };
  const h = headOf(body);
  // chin on the hand until she speaks; then the hand on the desk; the mug to the mouth for the sip
  const chin = { x: h.x + 22 * s, y: h.y + 44 * s };
  const rest = { x: YOUR_MUG - 26, y: DESK.top - 12 };
  const mouth = { x: h.x + 34 * s, y: h.y + 30 * s };
  const target = sip ? mouth : frame < k.l61 ? chin : rest;
  body.pose = { ...body.pose, armF: aimArm(body, target), armB: aimArm(body, { x: h.x + 40, y: DESK.top - 6 }) };
  let face: Face;
  if (frame < k.walk[0] + 50) face = { brows: "flat", lids: 0.6, mouth: "flat", eyes: 1, look: { x: 0.6, y: 0.5 } };
  else if (frame < k.l61) face = { brows: "none", lids: 0.45, mouth: frame >= k.set ? "smile" : "flat", eyes: 1, look: { x: 1, y: frame >= k.sit[0] ? -0.2 : 0.2 } };
  else if (frame < k.hold) face = { brows: "raised", lids: mix(0.45, 0, up), mouth: "flat", eyes: 1.05, look: { x: 1, y: -0.3 } };
  else if (laughing) face = { brows: "raised", lids: 0.75, mouth: "open", eyes: 1, look: { x: 0.6, y: 0.6 } };
  else if (frame >= k.terrible && frame < k.four) face = { brows: "worry", lids: 0.15, mouth: Math.floor((frame - k.terrible) / 9) % 2 ? "open" : "smile", eyes: 1.1, look: { x: 1, y: -0.2 } };
  else if (sip) face = { brows: "raised", lids: 0.25, mouth: "flat", eyes: 1, look: { x: 1, y: -0.3 } };
  else if (frame < k.l63) face = { brows: "raised", lids: 0, mouth: "smile", eyes: 1.05, look: { x: 1, y: -0.3 } };
  else if (frame < k.cord) face = { brows: "raised", lids: 0.1, mouth: "smile", eyes: 1, look: { x: 1, y: -0.1 } };
  else if (frame < k.smile) face = { brows: "flat", lids: 0.25, mouth: "flat", eyes: 1, look: { x: 1, y: 0.3 } };
  else face = { brows: "flat", lids: 0.35, mouth: "smirk", eyes: 1, look: { x: 1, y: 0.2 } };
  return { body, face, sip };
}

/** Her arms while telling: two hands drawing the story in the air in front of her. */
function telling(her: Body, frame: number, big = 1): [Pose["armF"], Pose["armB"]] {
  const h = headOf(her);
  const g = (a: number) => Math.sin(frame / 6.5 + a);
  const f = { x: h.x - (80 + 30 * g(0)) * big, y: h.y + 70 + 40 * g(1.4) * big };
  const b = { x: h.x - (40 + 24 * g(2.1)) * big, y: h.y + 100 + 30 * g(0.5) * big };
  return [aimArm(her, f), aimArm(her, b)];
}

function herBody(frame: number, k: NT, you: Body): { body: Body; face: Face; mugInHand: number } {
  const s = HER_PERCH.scale;
  const walk = linear(frame, k.walk[0], k.walk[1]);
  const sit = ramp(frame, k.sit[0], k.sit[1]);
  const standX = HER_PERCH.x + 70;
  let body: Body;
  if (frame < k.sit[0]) {
    body = { x: mix(1180, standX, walk), y: FLOOR, scale: s, facing: -1, pose: walk < 1 ? walkPose(frame * 0.32) : STAND };
  } else {
    body = { x: mix(standX, HER_PERCH.x, sit), y: mix(FLOOR, seatedY(DESK.top, s), sit), scale: s, facing: -1, pose: lerpPose(STAND, { ...SEATED, lean: 2 }, sit) };
  }
  const h = headOf(body);
  // two mugs carried in front; one set down in front of you; hers held, then set down when she starts telling
  const mugInHand = frame < k.set ? 2 : frame < k.hold ? 1 : 0;
  if (mugInHand > 0) {
    const reachSet = frame >= k.set - 10 && frame < k.set + 6;
    const front = reachSet ? { x: YOUR_MUG + 10, y: DESK.top - 30 } : { x: body.x - 70 * s, y: h.y + 120 * s };
    body.pose = { ...body.pose, armF: aimArm(body, front), armB: aimArm(body, { x: body.x - 40 * s, y: h.y + 126 * s }) };
  }
  let face: Face = { brows: "none", lids: 0.25, mouth: "smile", eyes: 1, look: { x: 1, y: 0.1 } };
  const lean = (n: number) => { body.pose = { ...body.pose, lean: n }; };
  if (frame >= k.l61 && frame < k.hold) {
    lean(mix(2, 12, ramp(frame, k.l61, k.l61 + 10)));
    face = { brows: "raised", lids: 0.1, mouth: frame < k.l61End && Math.floor((frame - k.l61) / 5) % 2 === 0 ? "open" : "smile", eyes: 1.08, look: { x: 1, y: 0.1 } };
  } else if (frame >= k.hold && frame < k.l63 + 30) {
    const big = frame >= k.terrible && frame < k.four ? 1.8 : 1;
    const [armF, armB] = telling(body, frame, big);
    lean(8 + 4 * Math.sin(frame / 11));
    body.pose = { ...body.pose, armF, armB, tilt: 6 * Math.sin(frame / 13) };
    face = { brows: "raised", lids: 0, mouth: Math.floor(frame / 7) % 2 ? "open" : "smile", eyes: big > 1 ? 1.25 : 1.08, look: { x: 1, y: 0.05 } };
    if (frame >= k.point && frame < k.point + 26) {
      const yh = headOf(you);
      body.pose = { ...body.pose, armF: aimArm(body, { x: yh.x + 40, y: yh.y + 10 }), tilt: -6 };
      face = { brows: "raised", lids: 0.2, mouth: "smile", eyes: 1, look: { x: 1, y: 0 } };
    }
    if (frame >= k.l63 && frame < k.l63 + 30) {
      // she gets to the kettle: one hand holds the handle in the air, the other tips the pot
      body.pose = { ...body.pose, armF: aimArm(body, { x: h.x - 90, y: h.y + 40 + 20 * ramp(frame, k.l63, k.l63 + 20) }), armB: aimArm(body, { x: h.x - 40, y: h.y + 70 }), tilt: -10 };
      face = { brows: "raised", lids: 0, mouth: "o", eyes: 1.15, look: { x: 1, y: 0.2 } };
    }
  } else if (frame >= k.l63 + 30) {
    const [armF, armB] = telling(body, frame, 0.7);
    body.pose = { ...body.pose, armF, armB, lean: 6 };
    face = { brows: "raised", lids: 0.05, mouth: Math.floor(frame / 8) % 2 ? "open" : "smile", eyes: 1.05, look: { x: 1, y: 0.05 } };
  }
  return { body, face, mugInHand };
}

/** The night desk at 3 a.m. (lines 60-63, with the 4 s hold after 61). */
export const DeskScene: React.FC<{ frame: number; k: NT }> = ({ frame, k }) => {
  const you = yourBody(frame, k);
  const her = herBody(frame, k, you.body);
  const yh = headOf(you.body), hh = headOf(her.body);
  const on = current(frame, [[k.desk, "desk"], [k.l61, "her"], [k.hold, "story"], [k.l62, "story2"], [k.terrible, "you"], [k.four, "herclose"],
    [k.thirty, "two"], [k.l63, "mime"], [k.cord, "cord"], [k.kettle, "kettle"], [k.socket, "socket"], [k.smile, "smile"]] as [number, string][]);
  const spareCam: Camera = { x: 660, y: 790, zoom: 3.0 };
  const sp = worldOf(spareCam, SPARE.x, SPARE.y, 0.85);
  const cams: Record<string, Camera> = {
    desk: camAt(frame, [[k.desk, { x: 600, y: 640, zoom: 1.3 }], [k.sit[0], { x: 520, y: 650, zoom: 1.4 }], [k.l61, { x: 330, y: 640, zoom: 1.65 }]]),
    her: camAt(frame, [[k.l61, closeUp(hh.x - 70, hh.y + 40, 2.1)], [k.hold, closeUp(hh.x - 80, hh.y + 40, 2.25)]]),
    story: camAt(frame, [[k.hold, { x: 330, y: 570, zoom: 1.42 }], [k.l62, { x: 330, y: 590, zoom: 1.52 }]]),
    story2: camAt(frame, [[k.l62, { x: 320, y: 640, zoom: 1.8 }], [k.terrible, { x: 320, y: 640, zoom: 1.9 }]]),
    you: camAt(frame, [[k.terrible, closeUp(yh.x + 40, yh.y + 30, 2.5)], [k.four, closeUp(yh.x + 40, yh.y + 30, 2.7)]]),
    herclose: camAt(frame, [[k.four, closeUp(hh.x - 60, hh.y + 40, 2.4)], [k.thirty, closeUp(hh.x - 60, hh.y + 40, 2.55)]]),
    two: camAt(frame, [[k.thirty, { x: 320, y: 560, zoom: 1.42 }], [k.l63, { x: 320, y: 580, zoom: 1.55 }]]),
    mime: camAt(frame, [[k.l63, { x: 340, y: 640, zoom: 1.9 }], [k.cord, { x: 350, y: 640, zoom: 2.0 }]]),
    cord: camAt(frame, [[k.cord, { x: 520, y: 720, zoom: 3.0 }], [k.kettle, { x: 560, y: 830, zoom: 3.1 }]]),
    kettle: camAt(frame, [[k.kettle, { x: 560, y: 780, zoom: 2.9 }], [k.socket, { x: 600, y: 820, zoom: 3.0 }]]),
    socket: camAt(frame, [[k.socket, { x: sp.x, y: sp.y - 30, zoom: 3.1 }], [k.smile, { x: sp.x, y: sp.y - 30, zoom: 3.5 }]]),
    smile: camAt(frame, [[k.smile, closeUp(yh.x + 30, yh.y + 20, 2.7)], [k.end, closeUp(yh.x + 30, yh.y + 20, 3.0)]]),
  };
  const cam = drift(cams[on], frame, `nt-${on}`, 2.5);
  const mugs = [...(frame >= k.set && !you.sip ? [YOUR_MUG] : []), ...(her.mugInHand === 0 ? [HER_MUG] : [])];
  const hand = handAt(her.body), back = handAt(her.body, "back");
  const yourHand = handAt(you.body);
  const minutes = mix(2, 9, linear(frame, k.desk, k.end));
  const actors = (
    <>
      <DeskChair x={YOUR_SEAT.x} top={YOUR_SEAT.top} />
      <You body={you.body} face={you.face} frame={frame} />
      <NightDesk mugs={mugs} />
      <LeaningMop x={600} y={958} angle={-18} scale={0.95} />
      <Sockets cam={cam} tape={1} />
      <Mate body={her.body} face={her.face} frame={frame} />
      {her.mugInHand >= 1 && <Mug x={back.x - 4} y={back.y + 16} scale={0.5} />}
      {her.mugInHand >= 2 && <Mug x={hand.x - 4} y={hand.y + 16} scale={0.5} />}
      {you.sip && <Mug x={yourHand.x + 8} y={yourHand.y + 18} scale={0.5} rotate={-14} />}
    </>
  );
  return <HallStage cam={cam} frame={frame} mood="lamp" clock={{ minutes, hours: 3 }} hall={{ door: 0 }} actors={actors} />;
};
