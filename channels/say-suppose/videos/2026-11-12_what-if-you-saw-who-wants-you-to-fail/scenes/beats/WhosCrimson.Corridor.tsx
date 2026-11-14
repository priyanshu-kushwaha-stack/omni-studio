// Who's Red, lines 22-28 (script v5): the school corridor in the morning. You walk in with the letter; the rival, sage head, one
// foot up at the shoe lockers, swapping shoes. "Still here?" You hold up the letter: over your shoulder the card snaps
// open over his head and flicks to -6, and the shot stays on that one axis (your scarf and the letter in the near
// foreground, his face and his -6 beyond: outside review of v4.1, 2:17) until he barely looks up. "Nice. Move." He
// walks off past you, his -6 still over him. v5: "You wanted an enemy." your deadpan face; "You got a receipt with
// legs.": the gag, his body a till receipt (the clerk's "Receipt?" from line 13) on his legs, strolling off under the -6.
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { lerpPose, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { schoolCorridor } from "@whatif/kit/sets";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import { headAt, Letter, Meter, YourShoulder } from "../parts";
import { CRIMSON, INK } from "@whatif/kit/theme";
import { blinking, camAt, current, HERO, linear, mix, ramp, TAEHO } from "../shared";
import { SetShot, Shoe, ShoeLockers } from "./WhosCrimson.Common";
import type { CrimsonTimes } from "./WhosCrimson.Times";

const FLOOR = 960;
const S = 1.15;
/** Tae-ho at the lockers, and where you stop in front of him. */
const TX = 1440;
const YX = 1010;
const WALK_FROM = 240;

/** One foot up on the other knee, a shoe in the front hand, bent over it. He faces you (-1). */
const FOOT_UP: Pose = { ...STAND, lean: 14, legF: [74, -84], armF: [34, 34], armB: [-12, 24] };
const FOOT_DOWN: Pose = { ...STAND, lean: 4, armF: [20, 30] };
/** The letter held up toward him, front arm forward and up. */
const LETTER_UP: [number, number] = [128, 14];

function you(frame: number, k: CrimsonTimes) {
  const p = linear(frame, k.walkIn, k.walkEnd);
  const x = mix(WALK_FROM, YX, p);
  const walking = lerpPose(walkPose(frame * 0.3), STAND, ramp(frame, k.walkEnd - 8, k.walkEnd));
  const up = ramp(frame, k.raise + 2, k.raise + 12);
  const lower = ramp(frame, k.move + 8, k.move + 22);
  const armF: [number, number] = [mix(mix(walking.armF[0], LETTER_UP[0], up), 20, lower), mix(mix(walking.armF[1], LETTER_UP[1], up), 30, lower)];
  const pose: Pose = { ...walking, armF };
  return { x, pose, head: headAt(x, FLOOR, S, pose) };
}

/** The rival: at the lockers, foot down on "Nice. Move.", then he walks off past you, his -6 still over him. */
function taeho(frame: number, k: CrimsonTimes) {
  const stood = lerpPose(FOOT_UP, FOOT_DOWN, ramp(frame, k.move + 4, k.move + 16));
  const go = linear(frame, k.leave, k.kang + 6);
  const x = mix(TX, TX - 1200, go);
  const pose = go > 0 && go < 1 ? walkPose(frame * 0.3) : stood;
  const bob = go > 0 ? 0 : Math.sin(frame / 11) * 2;
  return { x, pose: { ...pose, armF: [pose.armF[0] + bob, pose.armF[1]] as [number, number] }, head: headAt(x, FLOOR, S, pose, -1) };
}

/** Tae-ho's face: on his shoe, then "Still here?" at you, then back down; at `barely` the eyes flick up and drop. */
function taehoFace(frame: number, k: CrimsonTimes) {
  const down = { brows: "flat" as const, lids: 0.4, mouth: "flat" as const, eyes: 1, look: { x: 0.2, y: 0.85 } };
  if (frame >= k.still && frame < k.raise) return { ...down, mouth: "smirk" as const, lids: 0.3, look: { x: 0.95, y: 0 } };
  if (frame >= k.move) return { ...down, look: { x: 0.95, y: -0.05 }, lids: 0.45 };
  const glance = ramp(frame, k.barely + 12, k.barely + 20) - ramp(frame, k.barely + 34, k.barely + 44);
  return { ...down, look: { x: mix(0.2, 0.7, glance), y: mix(0.85, -0.35, glance) } };
}

function youFace(frame: number, k: CrimsonTimes) {
  if (frame < k.still) return { ...EXPRESSIONS.determined, look: { x: 0.9, y: 0 } };
  if (frame < k.raise) return { ...EXPRESSIONS.sceptical, look: { x: 0.9, y: 0 } };
  if (frame < k.taehoTag + 4) return { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1.05, look: { x: 0.9, y: -0.1 } };
  if (frame < k.move) return { brows: "raised" as const, lids: 0, mouth: "o" as const, eyes: 1.2, look: { x: 0.7, y: -0.75 } };
  // deadpan, watching him go (he walks off to your left)
  if (frame >= k.enemy) return { brows: "flat" as const, lids: 0.45, mouth: "flat" as const, eyes: 1, look: { x: -0.95, y: -0.1 } };
  return { brows: "worry" as const, lids: 0.15, mouth: "flat" as const, eyes: 1.05, look: { x: 0.6, y: -0.55 } };
}

/** The receipt with legs: a curling till receipt (torn zigzag ends, printed rows, TOTAL -6%) on Tae-ho's legs and school
 *  shoes, strolling left. (x, FLOOR) is between the feet. */
const RECEIPT_TOP = FLOOR - 470;
const ReceiptWalker: React.FC<{ x: number; frame: number }> = ({ x, frame }) => {
  const w = 150, top = RECEIPT_TOP, bottom = FLOOR - 170;
  // torn zigzag ends: along the top left to right, along the bottom right to left
  const n = 7, tw = w / n;
  const zigTop = Array.from({ length: n }, (_, i) => `L${-w / 2 + (i + 0.5) * tw} ${top - 12} L${-w / 2 + (i + 1) * tw} ${top}`).join(" ");
  const zigBottom = Array.from({ length: n }, (_, i) => `L${w / 2 - (i + 0.5) * tw} ${bottom + 12} L${w / 2 - (i + 1) * tw} ${bottom}`).join(" ");
  const step = Math.sin(frame * 0.3);
  const bob = Math.abs(Math.cos(frame * 0.3)) * -8;
  const leg = (s: number) => {
    const a = s * 26;
    const kx = Math.sin((a * Math.PI) / 180) * 90, ky = Math.cos((a * Math.PI) / 180) * 90;
    return (
      <g>
        <polyline points={`0,${bottom - 4} ${-kx},${bottom + ky} ${-kx * 1.6},${FLOOR - 18}`} fill="none" stroke="#3b3e47" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
        <g transform={`translate(${-kx * 1.6 - 8} ${FLOOR - 4}) scale(-1 1)`}><Shoe scale={0.85} /></g>
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${bob})`}>
      {leg(-step)}
      <g transform={`rotate(${step * 3} 0 ${bottom})`}>
        <path d={`M${-w / 2} ${top} ${zigTop} L${w / 2} ${bottom} ${zigBottom} Z`}
          fill="#fbf8f0" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={-w / 2 + 22} y1={top + 40 + i * 30} x2={w / 2 - 22 - (i % 3) * 18} y2={top + 40 + i * 30} stroke={INK} strokeWidth={6} opacity={0.35} strokeLinecap="round" />
        ))}
        <line x1={-w / 2 + 16} y1={top + 252} x2={w / 2 - 16} y2={top + 252} stroke={INK} strokeWidth={3} strokeDasharray="8 6" />
        <text x={0} y={top + 286} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={700} fontSize={26} fill={CRIMSON}>TOTAL -6%</text>
      </g>
      {leg(step)}
    </g>
  );
};

type View = "wide" | "track" | "lockers" | "still" | "raise" | "ots" | "barely" | "move" | "leave" | "enemy" | "receipt";

/** Your arm and the letter held up toward him, in the near foreground of the over-the-shoulder shot (screen space, over
 *  YourShoulder's edge at the left). The letter rises an inch as the card snaps open. */
const LetterUp: React.FC<{ frame: number; k: CrimsonTimes }> = ({ frame, k }) => {
  const lift = ramp(frame, k.ots, k.ots + 8) * 18 + ramp(frame, k.taehoTag, k.taehoTag + 6) * 10;
  const lx = 330, ly = 720 - lift;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, filter: "blur(3px)", pointerEvents: "none" }}>
      <polyline points={`60,1080 170,${ly + 170} ${lx - 20},${ly - 10}`} fill="none" stroke="#23252b" strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" />
      <Letter x={lx} y={ly + 40} scale={1.55} tilt={-9} />
      <circle cx={lx - 26} cy={ly - 6} r={22} fill="#23252b" />
    </svg>
  );
};

export const CorridorShot: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const view = current<View>(frame, [[0, "wide"], [k.youWalk, "track"], [k.lockers, "lockers"], [k.still, "still"], [k.raise, "raise"],
    [k.ots, "ots"], [k.barely, "barely"], [k.move, "move"], [k.leave, "leave"], [k.enemy, "enemy"], [k.receipt, "receipt"]]);
  const y = you(frame, k);
  const t = taeho(frame, k);
  const th = t.head;
  const cams: Record<View, Camera> = {
    wide: camAt(frame, [[k.walkIn, { x: 1000, y: 620, zoom: 1.12 }], [k.youWalk, { x: 1040, y: 615, zoom: 1.22 }]]),
    track: { x: y.x + 170, y: 650, zoom: 1.75 },
    lockers: camAt(frame, [[k.lockers, { x: TX - 70, y: 650, zoom: 1.75 }], [k.still, { x: TX - 80, y: 640, zoom: 1.95 }]]),
    still: camAt(frame, [[k.still, closeUp(th.x - 30, th.y - 10, 2.5)], [k.raise, closeUp(th.x - 30, th.y - 10, 2.65)]]),
    raise: camAt(frame, [[k.raise, { x: (YX + TX) / 2, y: 610, zoom: 1.7 }], [k.ots, { x: (YX + TX) / 2 + 10, y: 605, zoom: 1.78 }]]),
    ots: camAt(frame, [[k.ots, closeUp(th.x - 170, th.y - 80, 2.1)], [k.barely, closeUp(th.x - 130, th.y - 95, 2.35)]]),
    barely: camAt(frame, [[k.barely, closeUp(th.x - 10, th.y - 70, 2.3)], [k.move, closeUp(th.x - 10, th.y - 70, 2.45)]]),
    move: camAt(frame, [[k.move, { x: (YX + TX) / 2 + 20, y: 610, zoom: 1.6 }], [k.leave, { x: (YX + TX) / 2 + 20, y: 605, zoom: 1.7 }]]),
    leave: camAt(frame, [[k.leave, { x: 1050, y: 620, zoom: 1.3 }], [k.enemy, { x: 1000, y: 625, zoom: 1.35 }]]),
    enemy: camAt(frame, [[k.enemy, closeUp(y.head.x - 40, y.head.y, 2.6)], [k.receipt, closeUp(y.head.x - 40, y.head.y, 2.8)]]),
    receipt: camAt(frame, [[k.receipt, { x: 760, y: 640, zoom: 1.45 }], [k.kang, { x: 640, y: 645, zoom: 1.5 }]]),
  };
  const cam = drift(cams[view], frame, "corridor", 3);
  const showYou = view !== "ots" && view !== "lockers" && view !== "still" && view !== "barely";
  const letter = <Letter x={0} y={8} scale={0.42} tilt={view === "wide" || view === "track" ? 24 : 6} />;
  const actors = (
    <>
      <ShoeLockers x={TX - 190} y={FLOOR - 14} />
      {showYou && (
        <Figure {...HERO} x={y.x} y={FLOOR} scale={S} pose={y.pose} {...youFace(frame, k)} blink={blinking(frame, 1)} time={frame}
          flow={view === "wide" || view === "track" ? 0.25 : 0} held={letter} />
      )}
      {/* in the close-up on your deadpan he is passing right through your spot: leave him out until he is clear */}
      {view === "enemy" && Math.abs(t.x - y.x) < 190 ? null : view === "receipt" ? (
        <ReceiptWalker x={t.x} frame={frame} />
      ) : (
        <Figure {...TAEHO} x={t.x} y={FLOOR + 6} scale={S} facing={-1} pose={t.pose} {...taehoFace(frame, k)} blink={blinking(frame, 3)} time={frame}
          held={frame < k.move + 10 ? <Shoe x={6} y={4} scale={0.9} tilt={-20} /> : undefined} />
      )}
      {view === "receipt"
        ? <Meter frame={frame} at={k.taehoTag} x={t.x} headY={RECEIPT_TOP - 40} r={th.r} value={-6} until={k.kang} />
        : !(view === "enemy" && Math.abs(t.x - y.x) < 190) && <Meter frame={frame} at={k.taehoTag} x={th.x} headY={th.y} r={th.r} value={-6} until={k.kang} />}
    </>
  );
  return (
    <>
      <SetShot set={schoolCorridor} mood={mood} frame={frame} cam={cam} options={{ bags: false }} actors={actors} />
      {view === "ots" && <LetterUp frame={frame} k={k} />}
      {view === "ots" && <YourShoulder side="left" />}
    </>
  );
};
