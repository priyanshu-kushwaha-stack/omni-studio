// The Kettle Lead in the hall (KettleLead.tsx, lines 64-71): your boss smug at the desk under his padlocked coils; you a
// month ago turning his plug over under the lamp; the next night shift (the lamp unplugged, the kettle unplugged, the
// tape peeled off the spare socket under your old hatch); the stairs (two shoes and a tie coming down), your flatmate
// barring the foot of the stairs with her mop ("Sir. So my brother, right..." / "Not now." / "He bought a kettle."),
// the wide where he is caught between the story and the hall, her fingers counting behind her back, the last wire in
// your teeth. World coordinates on the pod hall.
import { SEATED, seatedY, STAND, walkPose } from "@whatif/kit/rig/pose";
import { worldOf } from "@whatif/kit/sets/common";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { FLOOR } from "../sets/PodHall";
import { camAt, FLATMATE, linear, mix, ramp } from "../shared";
import { DESK, DeskChair, HallStage, HomePlug, NightDesk, Sockets, SPARE, YOUR_SEAT, BarMop } from "./NightThirty.Hall";
import { CountingHand } from "./KettleLead.Inserts";
import { HallStairs, stairsAt } from "./TellMeNow.Kitchen";
import { aimArm, Boss, Coil, handAt, headOf, Hook, Mate, Plug, You, type Body, type Face } from "./Timeline.Cast";
import type { KL } from "./KettleLead";

/** Where you work on the night shift: standing right of your old hatch, facing it. */
export const WORK = { x: 790, scale: 1.08 };
/** Her place at the foot of the stairs, facing up them; his stair. */
export const FOOT = { x: 1700, scale: 1.04 };
export const BOSS_SCALE = 1.08;
const HOOK = { x: 130, y: 560 };

/** The padlocked hook behind the desk with your three coils on it (Staff Last). */
export const LockedCoils: React.FC = () => (
  <g>
    <Hook x={HOOK.x} y={HOOK.y} />
    {[-22, 0, 22].map((dx, i) => <Coil key={i} x={HOOK.x + dx} y={HOOK.y + 4 + i * 3} r={30} />)}
    <g transform={`translate(${HOOK.x + 4} ${HOOK.y + 36})`}>
      <path d="M-12 0 V-14 Q0 -28 12 -14 V0" fill="none" stroke="#c9ced6" strokeWidth={6} />
      <rect x={-18} y={-2} width={36} height={30} rx={6} fill="#c9a24a" stroke="#23252b" strokeWidth={4} />
      <circle cx={0} cy={12} r={4} fill="#23252b" />
    </g>
  </g>
);

/** Your boss on the stairs at `p` (0 the foot, 1 the top), coming down. */
export function bossOnStairs(frame: number, p: number, moving: boolean): Body {
  const at = stairsAt(p);
  return { x: at.x, y: at.y, scale: BOSS_SCALE, facing: -1, pose: moving ? walkPose(frame * 0.3) : { ...STAND, lean: 4 } };
}

/** How far down the stairs he is at this frame: from the top to the third stair as the footsteps sound, held there. */
export const bossP = (frame: number, k: KL) => mix(0.95, 0.24, linear(frame, k.steps - 12, k.bar + 4));

/** You at work by the socket: bent over your hands, the homemade plug in the front hand once it is made. */
export function workBody(frame: number, fast: number): Body {
  const b: Body = { x: WORK.x, y: FLOOR, scale: WORK.scale, facing: -1, pose: { ...STAND, lean: 12 } };
  const h = headOf(b);
  const w = Math.sin(frame * 0.5 * fast);
  b.pose = { ...b.pose, armF: aimArm(b, { x: h.x - 70 + 8 * w, y: h.y + 120 }), armB: aimArm(b, { x: h.x - 40 - 8 * w, y: h.y + 126 }) };
  return b;
}

/** Your flatmate at the foot of the stairs, facing up them, the mop held across; `n` fingers up behind her back. */
export function mateAtFoot(frame: number, k: KL): { body: Body; slide: number } {
  const slide = ramp(frame, k.bar - 10, k.bar);
  const b: Body = { x: mix(1480, FOOT.x, slide), y: FLOOR, scale: FOOT.scale, facing: 1, pose: slide < 1 ? walkPose(frame * 0.5) : STAND };
  const h = headOf(b);
  b.pose = { ...b.pose, lean: -4, armF: aimArm(b, { x: h.x + 70, y: h.y + 130 }), armB: aimArm(b, { x: h.x - 70, y: h.y + 150 }) };
  return { body: b, slide };
}

export const fingers = (frame: number, k: KL) => Math.min(5, 1 + Math.floor(Math.max(0, frame - k.l71) / 30));

/** Lines 64 (the boss, a month ago), 66 (the night shift) and 67-71 (the stairs) in the hall. */
export const HallShot: React.FC<{ frame: number; k: KL; on: string }> = ({ frame, k, on }) => {
  const spareCam: Camera = { x: 700, y: 760, zoom: 2.4 };
  const sp = worldOf(spareCam, SPARE.x, SPARE.y, 0.85);
  const p = bossP(frame, k);
  const boss = bossOnStairs(frame, p, frame < k.bar + 4 && frame >= k.steps - 12);
  const bh = headOf(boss);
  const mate = mateAtFoot(frame, k);
  const mh = headOf(mate.body);
  const mateBack = handAt(mate.body, "back");
  const you = workBody(frame, frame >= k.l71 ? 3 : frame >= k.steps ? 2 : 1);
  const yh = headOf(you);
  const cams: Record<string, Camera> = {
    boss: camAt(frame, [[k.start, { x: 420, y: 650, zoom: 1.45 }], [k.room, { x: 400, y: 640, zoom: 1.6 }]]),
    month: camAt(frame, [[k.month, { x: 330, y: 690, zoom: 2.4 }], [k.draw, { x: 340, y: 690, zoom: 2.7 }]]),
    shift: camAt(frame, [[k.shift, { x: 760, y: 600, zoom: 1.05 }], [k.lampOff - 8, { x: 700, y: 640, zoom: 1.25 }]]),
    unplug: camAt(frame, [[k.lampOff - 8, { x: 690, y: 800, zoom: 2.0 }], [k.tape[0], { x: 690, y: 800, zoom: 2.15 }]]),
    tape: camAt(frame, [[k.tape[0], { x: sp.x + 30, y: sp.y - 10, zoom: 2.4 }], [k.hands, { x: sp.x + 30, y: sp.y - 10, zoom: 2.7 }]]),
    shoes: camAt(frame, [[k.steps, { x: stairsAt(0.7).x, y: stairsAt(0.7).y - 120, zoom: 2.8 }], [k.steps + 30, { x: stairsAt(0.4).x, y: stairsAt(0.4).y - 120, zoom: 2.8 }]]),
    bar: camAt(frame, [[k.bar - 10, { x: 1830, y: 650, zoom: 1.45 }], [k.notNow, { x: 1840, y: 650, zoom: 1.55 }]]),
    notNow: camAt(frame, [[k.notNow, closeUp(bh.x - 40, bh.y + 30, 2.6)], [k.kettle, closeUp(bh.x - 40, bh.y + 30, 2.75)]]),
    kettle: camAt(frame, [[k.kettle, closeUp(mh.x + 50, mh.y + 30, 2.6)], [k.l71, closeUp(mh.x + 50, mh.y + 30, 2.8)]]),
    caught: camAt(frame, [[k.l71, { x: 1220, y: 620, zoom: 0.92 }], [k.fingers, { x: 1240, y: 620, zoom: 0.98 }]]),
    fingers: camAt(frame, [[k.fingers, { x: mateBack.x + 60, y: mateBack.y - 60, zoom: 2.5 }], [k.teeth, { x: mateBack.x + 60, y: mateBack.y - 60, zoom: 2.7 }]]),
    teeth: camAt(frame, [[k.teeth, closeUp(yh.x - 30, yh.y + 30, 2.6)], [k.blur, closeUp(yh.x - 30, yh.y + 30, 2.9)]]),
  };
  const cam = drift(cams[on] ?? cams.shift, frame, `kl-${on}`, 2.5);

  // the desk: lamp and kettle plugged in until the night shift pulls them
  const pull = (at: number) => ramp(frame, at, at + 10);
  const lampPlug = frame >= k.lampOff ? { x: mix(DESK.strip.x - 24, 740, pull(k.lampOff)), y: mix(DESK.strip.y - 4, 860, pull(k.lampOff)) } : null;
  const kettlePlug = frame >= k.kettleOff ? { x: mix(DESK.strip.x + 22, 770, pull(k.kettleOff)), y: mix(DESK.strip.y - 4, 880, pull(k.kettleOff)) } : null;
  const lampOn = frame < k.lampOff + 4 || on === "boss" || on === "month";
  const tape = on === "tape" ? 1 - ramp(frame, k.tape[0] + 6, k.tape[1]) : frame >= k.tape[1] ? 0 : 1;

  let actors: React.ReactNode;
  if (on === "boss") {
    const b: Body = { x: 250, y: FLOOR, scale: 1.12, facing: 1, pose: { ...STAND, lean: -4 } };
    const pat = Math.sin(frame / 5) > 0.3;
    b.pose = { ...b.pose, armB: aimArm(b, { x: HOOK.x + 10, y: HOOK.y + (pat ? 44 : 56) }), armF: [30, 40] };
    const me: Body = { x: 720, y: FLOOR, scale: 1.08, facing: -1, pose: { ...STAND, armF: [40, 60] } };
    actors = (
      <>
        <LockedCoils />
        <Boss body={b} face={{ brows: "raised", lids: 0.35, mouth: "smirk", eyes: 1, look: { x: 1, y: 0.1 } }} frame={frame} />
        <NightDesk />
        <You body={me} face={{ brows: "flat", lids: 0.3, mouth: frame > k.start + 40 ? "smirk" : "flat", eyes: 1, look: frame > k.start + 40 ? { x: -0.6, y: 0.1 } : { x: 1, y: 0 } }} frame={frame} />
      </>
    );
  } else if (on === "month") {
    const s = YOUR_SEAT.scale;
    const b: Body = { x: YOUR_SEAT.x, y: seatedY(YOUR_SEAT.top, s), scale: s, facing: 1, pose: { ...SEATED, lean: 14 } };
    const h = headOf(b);
    const plugAt = { x: h.x + 110, y: h.y + 50 };
    b.pose = { ...b.pose, armF: aimArm(b, plugAt), armB: aimArm(b, { x: plugAt.x - 30, y: plugAt.y + 30 }) };
    actors = (
      <>
        <DeskChair x={YOUR_SEAT.x} top={YOUR_SEAT.top} tag={false} />
        <You body={b} face={{ brows: "flat", lids: 0.3, mouth: "flat", eyes: 1.05, look: { x: 1, y: 0.3 } }} frame={frame} />
        <NightDesk />
        <Coil x={330} y={DESK.top - 70} r={28} />
        <Plug x={plugAt.x} y={plugAt.y} angle={Math.sin(frame / 10) * 70} scale={1.1} />
      </>
    );
  } else {
    const unplugging = on === "unplug";
    const peeling = on === "tape";
    const w: Body = unplugging || peeling ? { x: WORK.x, y: FLOOR, scale: WORK.scale, facing: -1, pose: { ...STAND, lean: unplugging ? 34 : 8, drop: unplugging ? 26 : 0 } } : you;
    if (unplugging) {
      const target = frame >= k.kettleOff - 8 ? (kettlePlug ?? { x: DESK.strip.x + 22, y: DESK.strip.y }) : (lampPlug ?? { x: DESK.strip.x - 24, y: DESK.strip.y });
      w.pose = { ...w.pose, armF: aimArm(w, target), armB: [20, 40] };
    }
    if (peeling) {
      const t = ramp(frame, k.tape[0] + 6, k.tape[1]);
      w.pose = { ...w.pose, armF: aimArm(w, { x: sp.x + 20 + 40 * t, y: sp.y + 30 * t }), armB: [10, 30] };
    }
    const youFace: Face = on === "teeth" || on === "caught"
      ? { brows: "angry", lids: 0.1, mouth: "flat", eyes: 1.1, look: { x: 0.9, y: 0.6 } }
      : { brows: "flat", lids: 0.2, mouth: frame >= k.tape[1] - 6 && peeling ? "smirk" : "flat", eyes: 1, look: { x: 1, y: 0.4 } };
    const plugMade = frame >= k.teeth;
    const hand = handAt(w);
    const showBoss = frame >= k.steps - 12;
    const bossFace: Face = frame < k.bar ? { brows: "flat", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 1, y: 0.4 } }
      : frame < k.notNow ? { brows: "raised", lids: 0, mouth: "flat", eyes: 1.1, look: { x: 1, y: 0.5 } }
      : frame < k.kettle ? { brows: "angry", lids: 0.15, mouth: frame < k.notNowEnd ? "open" : "frown", eyes: 1, look: { x: 1, y: 0.5 } }
      : frame < k.kettleEnd + 6 ? { brows: "flat", lids: 0.2, mouth: "frown", eyes: 1, look: { x: 1, y: 0.5 } }
      : { brows: "raised", lids: 0, mouth: "o", eyes: 1.25, look: Math.floor(frame / 16) % 2 ? { x: 1, y: 0.5 } : { x: 1, y: 0.05 } };
    if (frame >= k.notNow && frame < k.kettle) boss.pose = { ...boss.pose, armF: aimArm(boss, { x: bh.x - 110, y: bh.y + 60 }) };
    const mateFace: Face = frame < k.notNow
      ? { brows: "raised", lids: 0, mouth: frame >= k.bar && frame < k.barEnd && Math.floor(frame / 5) % 2 ? "open" : "smile", eyes: 1.1, look: { x: 1, y: -0.4 } }
      : frame < k.kettle ? { brows: "raised", lids: 0.1, mouth: "flat", eyes: 1, look: { x: 1, y: -0.4 } }
      : { brows: "flat", lids: 0.35, mouth: frame < k.kettleEnd && Math.floor(frame / 5) % 2 ? "open" : "flat", eyes: 1, look: { x: 1, y: -0.4 } };
    const back = handAt(mate.body, "back"), front = handAt(mate.body);
    actors = (
      <>
        <HallStairs />
        <Sockets cam={cam} tape={tape} />
        <NightDesk lamp={lampOn} lampPlug={lampPlug} kettlePlug={kettlePlug} />
        <You body={w} face={youFace} frame={frame} />
        {plugMade && !unplugging && !peeling && <HomePlug x={hand.x - 10} y={hand.y} angle={160} scale={0.6} />}
        {on === "teeth" && <path d={`M${yh.x - 80} ${yh.y + 26} q40 -10 90 2`} stroke="#d9873a" strokeWidth={8} fill="none" strokeLinecap="round" />}
        {showBoss && <Boss body={boss} face={bossFace} frame={frame} />}
        {frame >= k.bar - 10 && (
          <>
            <Mate body={mate.body} face={mateFace} frame={frame} />
            {mate.slide >= 1 && <BarMop x1={front.x - 30} x2={front.x + 190} y={front.y} />}
            {frame >= k.l71 && <CountingHand x={back.x - 6} y={back.y - 4} n={fingers(frame, k)} s={0.8} color={FLATMATE.head} />}
          </>
        )}
      </>
    );
  }
  return (
    <HallStage cam={cam} frame={frame} mood="night" lamp={on === "boss" || on === "month" || frame < k.lampOff + 4}
      hall={{ door: on === "boss" || on === "month" ? 0 : 1, flutterAll: on !== "boss" && on !== "month", minutes: 40 }} actors={actors} />
  );
};

