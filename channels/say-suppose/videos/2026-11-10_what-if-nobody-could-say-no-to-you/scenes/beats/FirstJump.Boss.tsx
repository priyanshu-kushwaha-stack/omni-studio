// "The first jump", lines 32-36: the boss (sets/Office.tsx, view "doorway"). You in the door gap with a hand on the
// frame; "Friday off?"; snap, "Take Monday too."; you stay, the scarf twisting; the boss's smile does not move an inch;
// "The pitch. Mine?"; snap again, "All yours. Obviously."; the hold: you walk back past Dev (thumbs up), sit, and look
// at your hands.
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { lerpPose, STAND, walkPose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { INK } from "@whatif/kit/theme";
import { Bubble, headAt, Headphones, YesTag } from "../parts";
import { CHAIR_SIT, seatedY } from "../parts2";
import { blinking, BOSS, camAt, current, DEV, HERO, mix, ramp } from "../shared";
import { Chair } from "../sets/common";
import { OfficeBack, OfficeFront, OFFICE_DOOR } from "../sets/Office";
import { aimed, ScarfTwist, talk, type T } from "./FirstJump.Times";

const S = 1.15;
const D = OFFICE_DOOR;
const SEAT = 850;
/** Your chair (right of your desk, facing it) and Dev's (right of his). */
const YOUR_CHAIR = D.yourDesk.x + 175;
const DEV_CHAIR = D.devDesk.x + 175;

/** A thumbs-up fist for a hand (Figure `held`, hand space). */
const Thumb: React.FC<{ color: string }> = ({ color }) => (
  <g transform="scale(1.5)">
    <rect x={-6} y={-24} width={10} height={20} rx={5} fill={color} stroke={INK} strokeWidth={2.5} transform="rotate(-18 -1 -6)" />
    <rect x={-12} y={-8} width={26} height={22} rx={6} fill={color} stroke={INK} strokeWidth={2.5} />
    {[-2, 4, 10].map((ky) => <line key={ky} x1={6} y1={ky} x2={14} y2={ky} stroke={INK} strokeWidth={2} strokeLinecap="round" />)}
  </g>
);

export const BossShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const c = k.clips;
  const shot = current(frame, [[k.office, "wide"], [k.door2, "two"], [k.twist, "you"], [k.still, "boss"], [k.pitch, "ask"], [k.walkBack, "walk"], [k.hands, "hands"]]);
  // You: in the door gap, a hand on the frame; then both hands wringing your scarf; then the walk back, the chair,
  // and your hands in your lap.
  const walking = frame >= k.walkBack;
  const sit = ramp(frame, k.sitDown - 6, k.sitDown + 6);
  const walkX = mix(D.hero.x, YOUR_CHAIR, ramp(frame, k.walkBack, k.sitDown - 6));
  const wringing = frame >= k.twist && !walking;
  const chest = { x: D.hero.x + 60, y: 745 };
  let you;
  if (!walking) {
    you = aimed(D.hero.x, D.floor, S, 1, STAND, wringing ? chest : { x: D.frame.x - 4, y: 640 }, wringing ? { x: chest.x - 16, y: chest.y + 8 } : null);
  } else {
    const base = sit > 0 ? lerpPose(STAND, CHAIR_SIT, sit) : walkPose(frame * 0.34);
    const lap = { x: YOUR_CHAIR - 70, y: SEAT - 14 };
    you = aimed(walkX, mix(D.floor, seatedY(SEAT, S), sit), S, -1, base, sit > 0.5 ? lap : null, sit > 0.5 ? { x: lap.x + 14, y: lap.y + 6 } : null);
  }
  const youHead = headAt(you.x, you.y, S, you.pose, you.facing);
  const yFace = ({
    wide: { ...EXPRESSIONS.worried, mouth: "flat" as const, look: { x: 0.9, y: 0 } },
    two: frame < k.fridaySnap ? { brows: "worry" as const, lids: 0, mouth: "smile" as const, eyes: 1.05, look: { x: 0.95, y: 0 } } : { ...EXPRESSIONS.shocked, eyes: 1.2, look: { x: 0.95, y: 0 } },
    you: { ...EXPRESSIONS.worried, eyes: 1.05, look: { x: 0.9, y: 0.1 } },
    boss: EXPRESSIONS.worried,
    ask: frame < k.pitchSnap ? { ...EXPRESSIONS.determined, mouth: "flat" as const } : { ...EXPRESSIONS.shocked, mouth: "smile" as const, eyes: 1.15, look: { x: 0.95, y: 0 } },
    walk: sit > 0 ? { brows: "flat" as const, lids: 0.3, mouth: "flat" as const, eyes: 1, look: { x: 0.5, y: 0.8 } } : { ...EXPRESSIONS.happy, look: { x: 0.9, y: 0.1 } },
    hands: { brows: "sad" as const, lids: mix(0.3, 0.55, ramp(frame, k.earned, k.earned + 30)), mouth: "flat" as const, eyes: 1, look: { x: 0.5, y: 0.9 } },
  })[shot];
  // The boss: the same smile from the first yes on; generous hands on "Take Monday too" (and a glance back at his
  // screen); open arms on "All yours. Obviously."; between, not one inch of movement.
  const yes = frame >= k.fridaySnap;
  const generous = ramp(frame, c[33].from, c[33].from + 8) * (1 - ramp(frame, c[33].from + c[33].frames, c[33].from + c[33].frames + 8));
  const arms = ramp(frame, k.pitchSnap + 4, k.pitchSnap + 12) * (1 - ramp(frame, k.walkBack + 10, k.walkBack + 20));
  const nod = yes && frame < k.fridaySnap + 24 ? Math.sin((frame - k.fridaySnap) / 4) * 6 : 0;
  const boss = aimed(D.boss.x, D.floor, S, -1, { ...STAND, tilt: nod },
    generous > 0 ? { x: D.boss.x - 110, y: 700 } : arms > 0 ? { x: D.boss.x - 120, y: 640 } : null,
    arms > 0 ? { x: D.boss.x + 90, y: 640 } : null);
  const bossHead = headAt(boss.x, boss.y, S, boss.pose, -1);
  const glanceBack = c[33].from + c[33].frames - 10;
  const bFace = yes
    ? { brows: "raised" as const, lids: 0, mouth: frame >= c[33].from ? talk(frame, c[33], talk(frame, c[35], "smile"), "open", "smile") : "smile" as const, eyes: 1.05,
      look: frame >= glanceBack && frame < k.twist ? { x: -0.8, y: 0.3 } : { x: 0.9, y: 0.05 } }
    : { ...EXPRESSIONS.neutral, look: { x: 0.9, y: 0.05 } };
  // Dev at his desk: when you pass him he turns round with a thumbs up.
  const passed = walking && walkX < DEV_CHAIR + 120;
  const dev = aimed(DEV_CHAIR, seatedY(SEAT, S), S, passed ? 1 : -1, CHAIR_SIT, passed ? { x: DEV_CHAIR + 70, y: 640 } : { x: DEV_CHAIR - 90, y: 790 }, null);
  const dFace = passed ? { ...EXPRESSIONS.happy, brows: "raised" as const, look: { x: 0.6, y: -0.1 } } : { ...EXPRESSIONS.neutral, look: { x: 0.9, y: -0.2 } };
  const actors = (
    <>
      <Chair x={DEV_CHAIR} y={SEAT} scale={S} facing={-1} />
      <Chair x={YOUR_CHAIR} y={SEAT} scale={S} facing={-1} />
      <Figure x={dev.x} y={dev.y} scale={S} facing={dev.facing} pose={dev.pose} head={DEV.head} coat={DEV.coat} {...dFace} blink={blinking(frame, 7)} time={frame}
        held={passed ? <Thumb color={DEV.head} /> : undefined} />
      <Headphones x={dev.x} y={dev.y} scale={S} pose={dev.pose} facing={dev.facing} />
      <Figure x={boss.x} y={boss.y} scale={S} facing={-1} pose={boss.pose} head={BOSS.head} tie={BOSS.tie} coat={BOSS.coat} {...bFace} blink={blinking(frame, 4)} time={frame} />
      <Figure {...HERO} x={you.x} y={you.y} scale={S} facing={you.facing} pose={you.pose} {...yFace} blink={blinking(frame, 1)} time={frame} flow={walking && sit === 0 ? 0.2 : 0} />
      {wringing && <ScarfTwist x={chest.x - 8} y={chest.y + 2} scale={S} frame={frame} />}
      <YesTag frame={frame} at={k.fridaySnap} until={k.pitchSnap} x={bossHead.x} headY={bossHead.y} r={bossHead.r} />
      <YesTag frame={frame} at={k.pitchSnap} x={bossHead.x} headY={bossHead.y} r={bossHead.r} tilt={3} />
      <Bubble frame={frame} at={k.friday} until={k.fridaySnap + 16} x={youHead.x + youHead.r * 0.6} y={youHead.y - youHead.r * 1.2} text="Friday off?" size={30} />
      <Bubble frame={frame} at={k.pitch} until={k.pitchSnap + 16} x={youHead.x + youHead.r * 0.6} y={youHead.y - youHead.r * 1.2} text="The pitch. Mine?" size={28} />
    </>
  );
  const two = { x: (D.hero.x + D.boss.x) / 2, y: 640, zoom: 1.6 };
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.office, { x: 900, y: 560, zoom: 1.02 }], [k.door2, { x: 960, y: 580, zoom: 1.14 }]]),
    two: camAt(frame, [[k.door2, two], [k.twist, { ...two, zoom: 1.7 }]]),
    you: camAt(frame, [[k.twist, closeUp(youHead.x + 60, youHead.y + 30, 2.4)], [k.still, closeUp(youHead.x + 60, youHead.y + 30, 2.6)]]),
    // Held dead still: the smile does not move an inch.
    boss: closeUp(bossHead.x - 30, bossHead.y - 30, 2.6),
    ask: camAt(frame, [[k.pitch, { ...two, zoom: 1.65 }], [k.walkBack, { ...two, zoom: 1.8 }]]),
    walk: camAt(frame, [[k.walkBack, { x: 760, y: 620, zoom: 1.4 }], [k.sitDown, { x: 520, y: 640, zoom: 1.5 }]]),
    hands: camAt(frame, [[k.hands, closeUp(youHead.x - 40, youHead.y + 60, 2.3)], [k.earned, closeUp(youHead.x - 40, youHead.y + 70, 2.5)], [k.end, closeUp(youHead.x - 40, youHead.y + 70, 2.75)]]),
  };
  const cam = shot === "boss" ? cams.boss : drift(cams[shot], frame, "boss", 3);
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<OfficeBack cam={cam} view="doorway" />} actors={actors}
      front={<OfficeFront cam={cam} view="doorway" />} />
  );
};
