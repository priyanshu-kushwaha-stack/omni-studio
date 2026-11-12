// The Cheapest Man, by day and at dusk: the man with the same lunch (43), the Hanoi rat-tail diagram (44), the coach
// who sells boring (45, 46), the magician reading tags for tips and your rate falling (47).
import { Figure } from "@whatif/kit/rig/Figure";
import { seatedY, SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { street } from "@whatif/kit/sets/Street";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { RateBoard, Tag, TealLamp } from "../device";
import { aimArm, Apron, headAt, Sheet, type Body } from "../kit";
import { blinking, camAt, COACH, current, HERO, MAGICIAN, mix, PASTELS, ramp, SAME_LUNCH } from "../shared";
import { COURT, FoodCourtBack, foodCourtLights, StallCounter, StallLamp } from "../sets/FoodCourt";
import { CardFan, Coin, glide, Rat, SandwichBoard, Shot, Stamp, Tail, talk } from "./TheCityPlays.Parts";
import { boards, tags, type T } from "./TheCheapestMan.Times";

// ------------------------------------------------------------------------------------------------ the same lunch

const LS = 1.9;
const LUNCH: Body = { x: 470, y: seatedY(900, LS), scale: LS, facing: 1, pose: SEATED };
const NEIGHBOURS: { x: number; facing: 1 | -1; head: string; coat: string }[] = [
  { x: 1120, facing: -1, head: PASTELS[2], coat: "#4a3b46" },
  { x: 1440, facing: -1, head: PASTELS[6], coat: "#2f4a48" },
];

/** The wall clock on the pillar at noon; its minute hand nudges each second, never off twelve. */
const Clock: React.FC<{ x: number; y: number; frame: number }> = ({ x, y, frame }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={52} fill={PAPER} stroke={INK} strokeWidth={7} />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-40} x2={0} y2={-32} stroke={INK} strokeWidth={4} transform={`rotate(${i * 30})`} />)}
    <line x1={0} y1={0} x2={0} y2={-24} stroke={INK} strokeWidth={8} strokeLinecap="round" />
    <line x1={0} y1={0} x2={0} y2={-38} stroke={INK} strokeWidth={5} strokeLinecap="round" transform={`rotate(${(Math.floor(frame / 30) % 2) * 1.5})`} />
    <line x1={0} y1={0} x2={0} y2={-40} stroke={CRIMSON} strokeWidth={2} transform={`rotate(${(frame % 1800) * 0.2})`} />
  </g>
);

const Tray: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <rect x={x - 90} y={y - 10} width={180} height={12} rx={4} fill="#c9a24a" stroke={INK} strokeWidth={4} />
    <path d={`M${x - 46} ${y - 10} Q${x} ${y + 34} ${x + 46} ${y - 10}Z`} fill="#e8e4da" stroke={INK} strokeWidth={4} transform={`translate(0 -20)`} />
    <ellipse cx={x} cy={y - 30} rx={46} ry={8} fill="#e0a23c" stroke={INK} strokeWidth={3} />
    <rect x={x + 56} y={y - 22} width={20} height={14} rx={3} fill="#5aa04a" stroke={INK} strokeWidth={3} />
  </g>
);

export const SameLunch: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const tg = tags(k);
  const bd = boards(k);
  const lh = headAt(LUNCH.x, LUNCH.y, LS, SEATED, 1);
  const on = current(frame, [[k.lunch, "wide"], [k.spoon, "him"], [k.clock, "clock"], [k.lowest, "glance"]]);
  const cams: Record<typeof on, Camera> = {
    wide: camAt(frame, [[k.lunch, { x: 760, y: 590, zoom: 1.25 }], [k.spoon, { x: 740, y: 600, zoom: 1.32 }]]),
    him: camAt(frame, [[k.spoon, closeUp(lh.x + 60, lh.y - 30, 2.3)], [k.clock, closeUp(lh.x + 60, lh.y - 30, 2.45)]]),
    clock: camAt(frame, [[k.clock, insert(330, 500, 1.9)], [k.lowest, insert(320, 490, 2.0)]]),
    glance: glide(frame, k.lowest, k.hanoi, { x: 420, y: 520, zoom: 1.7 }, { x: 980, y: 600, zoom: 1.35 }),
  };
  const cam = drift(cams[on], frame, "lunch", 3);
  // the same spoon, the same rhythm: down to the bowl, up to the mouth, every 36 frames
  const sp = (Math.sin(((frame - k.lunch) / 36) * Math.PI * 2) + 1) / 2;
  const pose: Pose = { ...SEATED, armF: [mix(52, 70, sp), mix(40, 112, sp)] };
  const glance = (i: number) => {
    const t = frame - k.lowest - i * 8;
    return t < 0 ? { x: 0.6, y: 0.4 } : t < 34 ? { x: 0.9, y: -0.6 } : { x: 0.2, y: 0.8 };
  };
  const actors = (
    <>
      <RateBoard frame={frame} x={COURT.pillar.board.x + 30} y={COURT.pillar.board.y} size={58} label="HIS RATE" keys={bd.his} />
      <TealLamp frame={frame} x={COURT.pillar.lamp.x + 30} y={COURT.pillar.lamp.y} />
      <Clock x={150} y={640} frame={frame} />
      <Figure {...LUNCH} pose={pose} head={SAME_LUNCH.head} coat={SAME_LUNCH.coat} tie={SAME_LUNCH.tie} brows="none" lids={0.35}
        mouth={sp > 0.8 ? "o" : "flat"} eyes={1} look={{ x: 0.6, y: 0.5 }} blink={blinking(frame, 4)} time={frame}
        held={<rect x={-4} y={-30} width={8} height={30} rx={3} fill="#c9ced6" stroke={INK} strokeWidth={2} />} />
      {NEIGHBOURS.map((n, i) => (
        <Figure key={i} x={n.x} y={seatedY(900, 1.7)} scale={1.7} facing={n.facing} pose={{ ...SEATED, armF: [50, 50] }} head={n.head} coat={n.coat}
          brows={frame >= k.lowest + i * 8 + 34 ? "worry" : "none"} lids={0.2} mouth="flat" look={glance(i)} blink={blinking(frame, i + 11)} time={frame} />
      ))}
      {/* his table and tray; the neighbours' table and their own boards */}
      <rect x={520} y={836} width={360} height={22} rx={6} fill="#8a8f9c" stroke={INK} strokeWidth={6} />
      <rect x={560} y={858} width={280} height={300} fill="#6b6f7a" stroke={INK} strokeWidth={6} />
      <Tray x={680} y={834} />
      <rect x={1020} y={836} width={520} height={22} rx={6} fill="#8a8f9c" stroke={INK} strokeWidth={6} />
      <rect x={1060} y={858} width={440} height={300} fill="#6b6f7a" stroke={INK} strokeWidth={6} />
      <RateBoard frame={frame} x={1200} y={778} size={30} keys={bd.n1} />
      <RateBoard frame={frame} x={1380} y={778} size={30} keys={bd.n2} />
      <Tag frame={frame} x={lh.x} headY={lh.y} r={lh.r} keys={tg.lunch} />
    </>
  );
  return <Shot cam={cam} mood="day" lights={foodCourtLights} back={<FoodCourtBack cam={cam} mood="day" frame={frame} />} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ Hanoi, 1902

export const Hanoi: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const a = k.hanoi;
  const cam = drift(frame < k.cage
    ? camAt(frame, [[a, { x: 960, y: 520, zoom: 1.2 }], [k.cage, { x: 920, y: 470, zoom: 1.4 }]])
    : glide(frame, k.cage, k.street, { x: 920, y: 470, zoom: 1.4 }, { x: 900, y: 600, zoom: 1.7 }), frame, "hanoi", 2);
  const pop = (at: number) => Math.min(1, Math.max(0, (frame - at) / 6));
  const rats = Math.round(mix(2, 14, ramp(frame, k.cage + 10, k.street - 10)));
  const sheet = (
    <Sheet frame={frame} at={a} x={960} y={540} w={1120} h={660} tilt={-1}>
      {/* one tail, one coin */}
      <g transform={`translate(190 150) scale(${pop(k.tail)})`}><Tail x={0} y={0} s={1.8} /></g>
      <DrawLine d="M290 150 H420" from={k.tail + 8} to={k.tail + 18} color={INK} width={7} />
      {frame >= k.tail + 18 && <path d="M420 150 l-22 -14 v28z" fill={INK} />}
      <g transform={`translate(500 150) scale(${pop(k.coin)})`}><Coin x={0} y={0} r={42} /></g>
      <g transform={`translate(880 130) scale(${pop(k.tail)})`}><Stamp x={0} y={0} text="1902" color={CRIMSON} size={64} /></g>
      {/* a row of tails, a row of coins */}
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <g transform={`translate(${120 + i * 70} 330) scale(${pop(k.rows + i * 3) * 0.9})`}><Tail x={0} y={0} s={1} /></g>
          <g transform={`translate(${640 + i * 70} 330) scale(${pop(k.rows + 10 + i * 3)})`}><Coin x={0} y={0} r={26} /></g>
        </g>
      ))}
      {/* the cage behind them, filling with rats */}
      <DrawLine d="M120 440 H1000 V620 H120Z" from={k.cage} to={k.cage + 18} color={INK} width={8} />
      {Array.from({ length: 16 }, (_, i) => (
        <DrawLine key={i} d={`M${170 + i * 52} 440 V620`} from={k.cage + 10 + i} to={k.cage + 22 + i} color={INK} width={5} />
      ))}
      {Array.from({ length: rats }, (_, i) => (
        <Rat key={i} x={180 + ((i * 137) % 780)} y={580 - (i % 3) * 38} s={0.75} flip={i % 2 === 1} />
      ))}
    </Sheet>
  );
  return <Shot cam={cam} mood="day" lights={foodCourtLights} back={<FoodCourtBack cam={cam} mood="day" frame={frame} />} actors={sheet} />;
};

// ------------------------------------------------------------------------------------------------ the coach

const COACH_B: Body = { x: 640, y: 1010, scale: 1.35, facing: 1, pose: STAND };
const QUEUE = [990, 1170, 1350, 1530];

export const Coach: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const tg = tags(k);
  const ch = headAt(COACH_B.x, COACH_B.y, COACH_B.scale, STAND, 1);
  const on = current(frame, [[k.street, "wide"], [k.coach, "coach"], [k.queue, "queue"]]);
  const cams: Record<typeof on, Camera> = {
    wide: camAt(frame, [[k.street, { x: 1060, y: 640, zoom: 1.2 }], [k.coach, { x: 1040, y: 640, zoom: 1.3 }]]),
    coach: camAt(frame, [[k.coach, closeUp(ch.x + 80, ch.y + 60, 1.9)], [k.queue, closeUp(ch.x + 80, ch.y + 40, 2.05)]]),
    queue: glide(frame, k.queue, k.magic, { x: 1000, y: 560, zoom: 1.9 }, { x: 1480, y: 560, zoom: 1.9 }),
  };
  const cam = drift(cams[on], frame, "coach", 3);
  const phrase = Math.max(0, Math.min(2, Math.floor((frame - k.coach) / ((k.queue - k.coach) / 2.2))));
  const speaking = frame >= k.coach && frame < k.magic - 6;
  const pose: Pose = speaking ? { ...STAND, armB: [[150, 120, 160][phrase], 20], armF: [30, 40] } : { ...STAND, armF: [40, 50] };
  const actors = (
    <>
      {QUEUE.map((x, i) => {
        const h = headAt(x, 1020, 1.2, STAND, -1);
        return (
          <g key={i}>
            <Figure x={x} y={1020} scale={1.2} facing={-1} pose={STAND} head={PASTELS[(i * 3 + 2) % 8]} coat={["#2a2d36", "#3b4a6b", "#4a3b46", "#2f4a48"][i]}
              brows="none" lids={0.45} mouth="flat" look={{ x: 0.8, y: 0.15 }} blink={blinking(frame, i + 3)} time={frame} />
            <Tag frame={frame} x={h.x} headY={h.y} r={h.r} keys={tg.queue(i)} scale={0.95} />
          </g>
        );
      })}
      <Figure {...COACH_B} pose={pose} head={COACH.head} coat={COACH.coat} brows="raised" lids={0} mouth={talk(frame, k.coach + 2, k.magic - 8, "smile", 6)}
        eyes={1.1} look={{ x: 0.9, y: 0 }} blink={blinking(frame, 9)} time={frame} />
      <SandwichBoard b={{ ...COACH_B, pose }} frame={frame} />
    </>
  );
  const options = { ...street.defaults, auto: false, crowd: true };
  return <Shot cam={cam} mood="day" lights={street.lights(options)} back={street.Back({ cam, mood: "day", frame, options })} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ dusk: tips, and your rate

const MAG2: Body = { x: 800, y: 1010, scale: 1.3, facing: 1, pose: STAND };
const TOURIST: Body = { x: 1150, y: 1010, scale: 1.25, facing: -1, pose: STAND };

/** "The magician reads tags for tips.": a folding table on the street at dusk, the tourist's card, the coin. */
export const Tips: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const tg = tags(k);
  const th = headAt(TOURIST.x, TOURIST.y, TOURIST.scale, STAND, -1);
  const cam = drift(camAt(frame, [[k.magic, { x: 980, y: 640, zoom: 1.55 }], [k.rate, { x: 990, y: 650, zoom: 1.68 }]]), frame, "tips", 3);
  const pointing = frame >= k.magic + 8;
  const give = ramp(frame, k.tip, k.tip + 14);
  const hand = { x: mix(1060, 980, give), y: mix(880, 870, give) };
  const tPose: Pose = frame >= k.tip - 4 ? { ...STAND, armF: aimArm(TOURIST, hand) } : STAND;
  const actors = (
    <>
      <Figure {...MAG2} pose={{ ...STAND, armF: pointing ? [128, 6] : [60, 40], armB: [60, 60] }} head={MAGICIAN.head} coat={MAGICIAN.coat}
        brows="raised" lids={0.2} mouth={talk(frame, k.magic + 8, k.tip, "smirk")} eyes={1} look={{ x: 0.6, y: -0.7 }} blink={blinking(frame, 7)} time={frame}
        held={pointing ? undefined : <CardFan spread={0.4} />} />
      <Figure {...TOURIST} pose={tPose} head={PASTELS[5]} coat="#c97a3a" brows={frame >= k.magic + 20 ? "raised" : "none"} lids={0}
        mouth={frame >= k.magic + 20 ? "o" : "smile"} eyes={frame >= k.magic + 20 ? 1.25 : 1} look={{ x: 0.9, y: 0.2 }} blink={blinking(frame, 2)} time={frame} />
      {/* the folding table and the tip tin */}
      <rect x={880} y={846} width={220} height={16} rx={4} fill="#5a3b2a" stroke={INK} strokeWidth={5} />
      <path d="M900 862 L1080 1010 M1080 862 L900 1010" stroke={INK} strokeWidth={8} />
      <rect x={950} y={812} width={64} height={36} rx={6} fill="#9aa1ab" stroke={INK} strokeWidth={4} />
      {frame >= k.tip + 14 && <Coin x={982} y={810 + Math.min(1, (frame - k.tip - 14) / 6) * 8} r={10} />}
      {frame >= k.tip && frame < k.tip + 14 && <Coin x={hand.x} y={hand.y - 6} r={10} />}
      <Tag frame={frame} x={th.x} headY={th.y} r={th.r} keys={tg.tourist} />
    </>
  );
  const options = { ...street.defaults, auto: false, crowd: false };
  return <Shot cam={cam} mood="dusk" lights={street.lights(options)} back={street.Back({ cam, mood: "dusk", frame, options })} actors={actors} />;
};

/** "Your rate falls. Sixty-one. Fifty-five. You've learned to read your tag before you reach.": your board on the
 *  pillar; then you at the till, the hand going out, stopping, your eyes up to your card, then the hand. */
export const YourRate: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const tg = tags(k);
  const bd = boards(k);
  const you: Body = { x: COURT.you.x, y: COURT.you.y, scale: COURT.scale, facing: 1, pose: STAND };
  const yh = headAt(you.x, you.y, you.scale, STAND, 1);
  const till = { x: 700, y: COURT.counter.top - 40 };
  const on = current(frame, [[k.rate, "board"], [k.reach - 6, "you"]]);
  const cam = drift(on === "board"
    ? camAt(frame, [[k.rate, insert(COURT.pillar.board.x + 30, COURT.pillar.board.y + 50, 2.7)], [k.reach - 6, insert(COURT.pillar.board.x + 30, COURT.pillar.board.y + 50, 2.95)]])
    : camAt(frame, [[k.reach - 6, closeUp(yh.x - 20, yh.y + 10, 1.45)], [k.phone, closeUp(yh.x - 10, yh.y + 5, 1.55)]]), frame, "rate", 2);
  // out, stop half way, the eyes up, then the hand on
  const out = frame < k.reach ? 0 : frame < k.reach + 12 ? ramp(frame, k.reach, k.reach + 12) * 0.55 : frame < k.reach + 40 ? 0.55 : 0.55 + 0.45 * ramp(frame, k.reach + 40, k.reach + 50);
  const target = { x: mix(you.x + 60, till.x, out), y: mix(you.y - 360, till.y - 6, out) };
  const pose: Pose = { ...STAND, armF: aimArm(you, target) };
  const up = frame >= k.reach + 16 && frame < k.reach + 40;
  const actors = (
    <>
      <RateBoard frame={frame} x={COURT.pillar.board.x + 30} y={COURT.pillar.board.y} size={58} label="YOUR RATE" keys={bd.yours} />
      <TealLamp frame={frame} x={COURT.pillar.lamp.x + 30} y={COURT.pillar.lamp.y} />
      <Figure {...you} pose={pose} {...HERO} coat="#3b3e47" brows={up ? "flat" : "none"} lids={up ? 0.1 : 0.3} mouth="flat" eyes={1}
        look={up ? { x: 0.3, y: -0.95 } : { x: 0.8, y: 0.5 }} blink={blinking(frame, 0)} time={frame} />
      <Apron b={{ ...you, pose }} />
      <StallCounter />
      {/* the till: a small drawer box on the counter */}
      <rect x={till.x - 60} y={till.y - 30} width={120} height={70} rx={8} fill="#3a4150" stroke={INK} strokeWidth={6} />
      <rect x={till.x - 44} y={till.y - 18} width={88} height={22} rx={4} fill="#7fe0d4" opacity={0.6} />
      <Tag frame={frame} x={yh.x} headY={yh.y} r={yh.r} keys={tg.you} />
    </>
  );
  return (
    <Shot cam={cam} mood="dusk" lights={foodCourtLights} back={<><FoodCourtBack cam={cam} mood="dusk" frame={frame} /><StallLamp /></>} actors={actors} />
  );
};

