// Who's Red, lines 22-28 (script v5): the school corridor in the morning. You walk in with the letter; the rival, sage head, one
// foot up at the shoe lockers, swapping shoes. "Still here?" You hold up the letter: over your shoulder the card snaps
// open over his head and flicks to -6, and the shot stays on that one axis (your scarf and the letter in the near
// foreground, his face and his -6 beyond: outside review of v4.1, 2:17) until he barely looks up. "Nice. Move." He
// walks off past you, his -6 still over him. v5: "You wanted an enemy." your deadpan face; "You got a receipt with
// legs.": the gag, his body a till receipt (the clerk's "Receipt?" from line 13) on his legs, strolling off under the -6.
// v7 (outside review of v6, 2:45-3:11): no long walk: "Next morning." an insert, your shoe slammed into its cubby; your
// face, the letter flicked up; a low push in on his raised shoe as you stride in. He polishes the shoe the whole time
// and gives you no eye contact, "Still here?" included. "Minus six." cuts to your let-down face; "Nice." without
// looking, and on "Move." his shoe pushes your letter arm aside; he shoulders past. The receipt keeps his sage head on
// top and a barcode where his chest would be.
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { lerpPose, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { schoolCorridor } from "@whatif/kit/sets";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import { headAt, Letter, Meter, YourShoulder } from "../parts";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { blinking, camAt, current, HERO, linear, mix, ramp, TAEHO } from "../shared";
import { armTo, FlatShot, SetShot, Shoe, ShoeLockers } from "./WhosCrimson.Common";
import { handAt } from "./WhosCrimson.More";
import type { CrimsonTimes } from "./WhosCrimson.Times";

const FLOOR = 960;
const S = 1.15;
/** Tae-ho at the lockers, and where you stop in front of him. */
const TX = 1440;
const YX = 1170;
const WALK_FROM = 240;

/** One foot up on the other knee, a shoe in the front hand, bent over it. He faces you (-1). */
const FOOT_UP: Pose = { ...STAND, lean: 14, legF: [74, -84], armF: [34, 34], armB: [-12, 24] };
const FOOT_DOWN: Pose = { ...STAND, lean: 4, armF: [20, 30] };
/** The letter held up toward him, front arm forward and up. */
const LETTER_UP: [number, number] = [128, 14];

function you(frame: number, k: CrimsonTimes) {
  const p = linear(frame, k.walkIn, k.walkEnd);
  // shouldered as he walks past you (line 28)
  const bump = ramp(frame, k.leave + 4, k.leave + 8) * (1 - ramp(frame, k.leave + 12, k.leave + 26));
  const x = mix(WALK_FROM, YX, p) + bump * 14;
  const walking = p > 0 && p < 1 ? lerpPose(walkPose(frame * 0.3), STAND, ramp(frame, k.walkEnd - 8, k.walkEnd)) : STAND;
  // the letter flicked up by your face on "You've worked it out", lowered for the walk; held up to him; knocked aside
  const flick = ramp(frame, k.youSet + 6, k.youSet + 14) * (1 - ramp(frame, k.walkIn - 8, k.walkIn));
  const up = Math.max(flick, ramp(frame, k.raise + 2, k.raise + 12));
  const lower = ramp(frame, k.nudge + 1, k.nudge + 7);
  const armF: [number, number] = [mix(mix(walking.armF[0], LETTER_UP[0], up), 6, lower), mix(mix(walking.armF[1], LETTER_UP[1], up), 14, lower)];
  const pose: Pose = { ...walking, armF, lean: walking.lean - bump * 10, tilt: walking.tilt - bump * 8 };
  return { x, pose, head: headAt(x, FLOOR, S, pose) };
}

/** The rival: polishing the shoe at the lockers (the back hand rubs it with a cloth), foot down on "Nice.", the shoe
 *  pushes your letter arm aside on "Move.", then he walks off past you, his -6 still over him. */
function taeho(frame: number, k: CrimsonTimes, yourHand: { x: number; y: number }) {
  const stood = lerpPose(FOOT_UP, FOOT_DOWN, ramp(frame, k.move + 4, k.move + 16));
  const go = linear(frame, k.leave, k.kang + 6);
  const x = mix(TX, TX - 1200, go);
  let pose: Pose = go > 0 && go < 1 ? walkPose(frame * 0.3) : stood;
  const y = FLOOR + 6;
  const push = ramp(frame, k.nudge - 7, k.nudge) * (1 - ramp(frame, k.nudge + 8, k.nudge + 18));
  if (go === 0 && push > 0) {
    const a = armTo(x, y, S, pose, -1, { x: yourHand.x + 30, y: yourHand.y + 10 });
    pose = { ...pose, armF: [mix(pose.armF[0], a[0], push), mix(pose.armF[1], a[1], push)] };
  }
  const polishing = go === 0 && frame < k.nudge - 7;
  let cloth: { x: number; y: number } | null = null;
  if (polishing) {
    const h = handAt(x, y, S, pose, -1, "front");
    cloth = { x: h.x + Math.sin(frame / 2.6) * 16, y: h.y - 4 + Math.cos(frame / 2.6) * 4 };
    pose = { ...pose, armB: armTo(x, y, S, pose, -1, cloth) };
  }
  return { x, pose, cloth, head: headAt(x, FLOOR, S, pose, -1) };
}

/** Tae-ho's face: on his shoe, then "Still here?" at you, then back down; at `barely` the eyes flick up and drop. */
function taehoFace(frame: number, k: CrimsonTimes) {
  const down = { brows: "flat" as const, lids: 0.4, mouth: "flat" as const, eyes: 1, look: { x: 0.2, y: 0.85 } };
  // "Still here?" and "Nice." without granting you a look: eyes on the shoe
  if (frame >= k.still && frame < k.raise) return { ...down, mouth: "smirk" as const, lids: 0.3 };
  if (frame >= k.move && frame < k.nudge - 6) return { ...down, mouth: "smirk" as const };
  if (frame >= k.move) return { ...down, look: { x: 0.95, y: -0.05 }, lids: 0.45 };
  const glance = ramp(frame, k.barely + 12, k.barely + 20) - ramp(frame, k.barely + 34, k.barely + 44);
  return { ...down, look: { x: mix(0.2, 0.7, glance), y: mix(0.85, -0.35, glance) } };
}

function youFace(frame: number, k: CrimsonTimes) {
  if (frame < k.walkIn) {
    const narrow = ramp(frame, k.youSet + 10, k.youSet + 20);
    return { brows: narrow > 0.5 ? "angry" as const : "flat" as const, lids: mix(0, 0.45, narrow), mouth: narrow > 0.5 ? "smirk" as const : "flat" as const, eyes: 1, look: { x: 0.9, y: -0.1 } };
  }
  if (frame < k.still) return { ...EXPRESSIONS.determined, look: { x: 0.9, y: 0 } };
  if (frame < k.raise) return { ...EXPRESSIONS.sceptical, look: { x: 0.9, y: 0 } };
  if (frame < k.taehoTag + 4) return { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1.05, look: { x: 0.9, y: -0.1 } };
  if (frame < k.youLook) return { brows: "raised" as const, lids: 0, mouth: "o" as const, eyes: 1.2, look: { x: 0.7, y: -0.75 } };
  // "Minus six.": let down, looking up at the feeble number
  if (frame < k.move) return { brows: "sad" as const, lids: 0.3, mouth: "frown" as const, eyes: 1, look: { x: 0.6, y: -0.8 } };
  // deadpan, watching him go (he walks off to your left)
  if (frame >= k.enemy) return { brows: "flat" as const, lids: 0.45, mouth: "flat" as const, eyes: 1, look: { x: -0.95, y: -0.1 } };
  return { brows: "worry" as const, lids: 0.15, mouth: "flat" as const, eyes: 1.05, look: { x: 0.6, y: -0.55 } };
}

/** The receipt with legs: a curling till receipt (torn zigzag ends, printed rows, TOTAL -6%) on Tae-ho's legs and school
 *  shoes, strolling left. (x, FLOOR) is between the feet. */
const RECEIPT_TOP = FLOOR - 430;
const RECEIPT_HEAD = 74;
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
        {Array.from({ length: 3 }, (_, i) => (
          <line key={i} x1={-w / 2 + 22} y1={top + 40 + i * 30} x2={w / 2 - 22 - (i % 3) * 18} y2={top + 40 + i * 30} stroke={INK} strokeWidth={6} opacity={0.35} strokeLinecap="round" />
        ))}
        {/* a barcode where his chest would be */}
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={`b${i}`} x={-w / 2 + 24 + i * 7.4} y={top + 120} width={(i * 5) % 3 === 0 ? 5 : 2.5} height={58} fill={INK} />
        ))}
        <line x1={-w / 2 + 16} y1={top + 210} x2={w / 2 - 16} y2={top + 210} stroke={INK} strokeWidth={3} strokeDasharray="8 6" />
        <text x={0} y={top + 242} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={700} fontSize={26} fill={CRIMSON}>TOTAL -6%</text>
      </g>
      {/* his own sage head on top, half-lidded, unbothered */}
      <g transform={`translate(${step * 4} ${top - RECEIPT_HEAD})`}>
        <rect x={-10} y={30} width={20} height={RECEIPT_HEAD - 34} fill={TAEHO.coat} />
        <circle r={54} fill={TAEHO.head} stroke={INK} strokeWidth={5} />
        <path d="M-40 -30 Q-10 -62 30 -44 Q10 -40 -4 -30Z" fill={INK} opacity={0.75} />
        <path d="M-36 -6 h22 M6 -6 h22" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <ellipse cx={-26} cy={4} rx={5} ry={6} fill={INK} />
        <ellipse cx={16} cy={4} rx={5} ry={6} fill={INK} />
        <path d="M-20 28 H8" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      </g>
      {leg(step)}
    </g>
  );
};

type View = "shoe" | "set" | "push" | "lockers" | "still" | "raise" | "ots" | "youLook" | "barely" | "move" | "leave" | "enemy" | "receipt";

/** "Next morning.": an insert of the shoe lockers by the door, your hand slamming your outdoor shoe into its cubby (the
 *  camera bumps on the slam). */
const ShoeInsert: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const shove = ramp(frame, k.shoeIn + 3, k.shoeIn + 11);
  const bump = frame >= k.shoeIn + 11 && frame < k.shoeIn + 17 ? Math.sin(((frame - k.shoeIn - 11) / 6) * Math.PI) * 10 : 0;
  const cx = 960 + 43, cy = 600;
  const shoe = { x: mix(1500, cx + 4, shove), y: mix(760, cy + 22, shove) };
  const cam = camAt(frame, [[k.shoeIn, { x: 1000, y: 560 + bump, zoom: 2.2 }], [k.youSet, { x: 990, y: 565 + bump, zoom: 2.35 }]]);
  return (
    <FlatShot cam={cam} mood={mood} back={<rect x={-1400} y={-800} width={4800} height={2600} fill="#dfe8cf" />} actors={
      <>
        <ShoeLockers x={960 - 10 - 86 * 2} y={600 + 74 * 2 + 10 + 10} cols={5} rows={4} />
        <rect x={cx - 39} y={cy - 33} width={78} height={66} rx={4} fill="#6e4b30" />
        <Shoe x={shoe.x} y={shoe.y} scale={0.8} tilt={mix(-25, 0, shove)} />
        <polyline points={`2000,980 ${mix(1720, cx + 210, shove)},${mix(860, cy + 70, shove)} ${shoe.x + 34},${shoe.y - 6}`} fill="none" stroke="#23252b"
          strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={shoe.x + 30} cy={shoe.y - 8} r={18} fill={HERO.head} stroke={INK} strokeWidth={4} />
        {/* the letter in your pocket, sticking out of the sleeve's cuff */}
        <rect x={mix(1760, cx + 250, shove)} y={mix(840, cy + 40, shove)} width={70} height={90} rx={4} fill={PAPER} stroke={INK} strokeWidth={4}
          transform={`rotate(-20 ${mix(1760, cx + 250, shove)} ${mix(840, cy + 40, shove)})`} />
      </>
    } />
  );
};

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
  const view = current<View>(frame, [[0, "shoe"], [k.youSet, "set"], [k.push, "push"], [k.lockers, "lockers"], [k.still, "still"], [k.raise, "raise"],
    [k.ots, "ots"], [k.youLook, "youLook"], [k.barely, "barely"], [k.move, "move"], [k.leave, "leave"], [k.enemy, "enemy"], [k.receipt, "receipt"]]);
  if (view === "shoe") return <ShoeInsert frame={frame} k={k} mood={mood} />;
  const y = you(frame, k);
  const t = taeho(frame, k, handAt(y.x, FLOOR, S, y.pose, 1, "front"));
  const th = t.head;
  const cams: Record<Exclude<View, "shoe">, Camera> = {
    set: camAt(frame, [[k.youSet, closeUp(y.head.x + 40, y.head.y, 2.7)], [k.push, closeUp(y.head.x + 40, y.head.y - 4, 2.95)]]),
    // low, pushing in on his raised shoe as you stride into frame from the left
    push: camAt(frame, [[k.push, { x: TX - 330, y: 790, zoom: 1.45 }], [k.lockers, { x: TX - 150, y: 800, zoom: 2.1 }]]),
    lockers: camAt(frame, [[k.lockers, { x: TX - 20, y: 660, zoom: 1.75 }], [k.still, { x: TX - 40, y: 645, zoom: 1.95 }]]),
    still: camAt(frame, [[k.still, closeUp(th.x - 30, th.y + 30, 2.4)], [k.raise, closeUp(th.x - 30, th.y + 30, 2.55)]]),
    raise: camAt(frame, [[k.raise, { x: (YX + TX) / 2, y: 610, zoom: 1.85 }], [k.ots, { x: (YX + TX) / 2 + 10, y: 605, zoom: 1.92 }]]),
    ots: camAt(frame, [[k.ots, closeUp(th.x - 170, th.y - 80, 2.1)], [k.youLook, closeUp(th.x - 130, th.y - 95, 2.3)]]),
    youLook: camAt(frame, [[k.youLook, closeUp(y.head.x + 30, y.head.y - 10, 2.8)], [k.barely, closeUp(y.head.x + 30, y.head.y - 10, 3.0)]]),
    barely: camAt(frame, [[k.barely, closeUp(th.x - 10, th.y - 70, 2.3)], [k.move, closeUp(th.x - 10, th.y - 70, 2.45)]]),
    move: camAt(frame, [[k.move, { x: (YX + TX) / 2 + 20, y: 640, zoom: 1.85 }], [k.leave, { x: (YX + TX) / 2 + 10, y: 640, zoom: 1.95 }]]),
    leave: camAt(frame, [[k.leave, { x: 1150, y: 620, zoom: 1.4 }], [k.enemy, { x: 1060, y: 625, zoom: 1.45 }]]),
    enemy: camAt(frame, [[k.enemy, closeUp(y.head.x - 40, y.head.y, 2.6)], [k.receipt, closeUp(y.head.x - 40, y.head.y, 2.8)]]),
    receipt: camAt(frame, [[k.receipt, { x: 860, y: 620, zoom: 1.45 }], [k.kang, { x: 700, y: 625, zoom: 1.5 }]]),
  };
  const cam = drift(cams[view], frame, "corridor", 3);
  const showYou = view !== "ots" && view !== "lockers" && view !== "still" && view !== "barely";
  const letter = <Letter x={0} y={8} scale={0.42} tilt={view === "push" ? 24 : 6} />;
  const hidden = view === "enemy" && Math.abs(t.x - y.x) < 190;
  const actors = (
    <>
      <ShoeLockers x={TX - 190} y={FLOOR - 14} />
      {showYou && (
        <Figure {...HERO} x={y.x} y={FLOOR} scale={S} pose={y.pose} {...youFace(frame, k)} blink={blinking(frame, 1)} time={frame}
          flow={view === "push" ? 0.25 : 0} held={letter} />
      )}
      {/* in the close-up on your deadpan he is passing right through your spot: leave him out until he is clear */}
      {hidden ? null : view === "receipt" ? (
        <ReceiptWalker x={t.x} frame={frame} />
      ) : (
        <Figure {...TAEHO} x={t.x} y={FLOOR + 6} scale={S} facing={-1} pose={t.pose} {...taehoFace(frame, k)} blink={blinking(frame, 3)} time={frame}
          held={frame < k.leave + 4 ? <Shoe x={6} y={4} scale={0.9} tilt={-20} /> : undefined} />
      )}
      {/* the polishing cloth in his back hand */}
      {t.cloth && view !== "receipt" && <rect x={t.cloth.x - 16} y={t.cloth.y - 12} width={32} height={24} rx={6} fill="#f3efe6" stroke={INK} strokeWidth={3}
        transform={`rotate(${Math.sin(frame / 2.6) * 12} ${t.cloth.x} ${t.cloth.y})`} />}
      {view === "receipt"
        ? <Meter frame={frame} at={k.taehoTag} x={t.x} headY={RECEIPT_TOP - RECEIPT_HEAD} r={th.r} value={-6} until={k.kang} />
        : !hidden && <Meter frame={frame} at={k.taehoTag} x={th.x} headY={th.y} r={th.r} value={-6} until={k.kang} />}
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
