// The City Plugs In, the later uses: the classroom of forty-year-olds in uniform ("Miss. We've done this." / "Sit
// down."), every wedding (four quick aisles, the calm bride taking the bouncing groom's hand; "I do. Still."), and the
// courtroom drawn simply (a high bench, a gavel, the dock; "Three nights.").
import { SEATED, STAND, walkPose } from "@whatif/kit/rig/pose";
import { classroom } from "@whatif/kit/sets/Classroom";
import { weddingHall } from "@whatif/kit/sets/WeddingHall";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { camAt, linear, mix, PASTELS, ramp } from "../shared";
import { aim, head, InSet, OnFace, OwnSet, Person, type Body } from "./CityPlugsIn.Kit";

const FLOOR = 960;
const BENCH = { x: 1260, top: 560 };

/** The court: panelled wall, the judge's high bench, the dock with its rail. */
const Court: React.FC = () => (
  <g>
    <rect x={-1400} y={-900} width={4800} height={2900} fill="#c9a77a" />
    {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-600 + i * 240} y={120} width={200} height={640} rx={8} fill="#b8935f" stroke="#8a6a44" strokeWidth={5} />)}
    <rect x={-1400} y={FLOOR - 30} width={4800} height={900} fill="#6b4b3a" />
    <circle cx={1260} cy={200} r={70} fill="#d9c26a" stroke={INK} strokeWidth={6} />
    <path d="M1225 200 h70 M1260 165 v70" stroke={INK} strokeWidth={6} />
  </g>
);

const BenchFront: React.FC<{ gavel: number }> = ({ gavel }) => (
  <g>
    <rect x={BENCH.x - 300} y={BENCH.top} width={600} height={FLOOR - 30 - BENCH.top} fill="#7a4f34" stroke={INK} strokeWidth={6} />
    <rect x={BENCH.x - 320} y={BENCH.top - 24} width={640} height={30} rx={6} fill="#8a5c3b" stroke={INK} strokeWidth={6} />
    {[0, 1, 2].map((i) => <rect key={i} x={BENCH.x - 250 + i * 180} y={BENCH.top + 50} width={140} height={250} rx={6} fill="none" stroke="#5b3a26" strokeWidth={5} />)}
    {/* the sound block and the gavel, lifted then struck */}
    <rect x={BENCH.x + 150} y={BENCH.top - 40} width={70} height={18} rx={4} fill="#5b3a26" />
    <g transform={`rotate(${-50 * gavel} ${BENCH.x + 260} ${BENCH.top - 40})`}>
      <rect x={BENCH.x + 170} y={BENCH.top - 62} width={90} height={10} fill="#5b3a26" />
      <rect x={BENCH.x + 150} y={BENCH.top - 82} width={30} height={50} rx={6} fill="#7a4f34" stroke={INK} strokeWidth={4} />
    </g>
  </g>
);

const Dock: React.FC = () => (
  <g>
    <rect x={280} y={760} width={360} height={FLOOR - 790} fill="#7a4f34" stroke={INK} strokeWidth={6} />
    <rect x={270} y={740} width={380} height={24} rx={6} fill="#8a5c3b" stroke={INK} strokeWidth={5} />
    {[320, 400, 480, 560].map((x) => <line key={x} x1={x} y1={600} x2={x} y2={740} stroke={INK} strokeWidth={6} />)}
    <rect x={290} y={590} width={340} height={14} rx={6} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
  </g>
);

/** The courts: wide on "Then the courts"; the judge's "Three nights." and the gavel; the prisoner's long-weekend smirk. */
export const CourtShot: React.FC<{ frame: number; start: number; judge: number; strike: number; prisoner: number; end: number }> = ({
  frame, start, judge, strike, prisoner, end,
}) => {
  const lift = ramp(frame, strike - 10, strike - 4) * (1 - ramp(frame, strike - 3, strike));
  const judgeBody: Body = { x: BENCH.x, y: BENCH.top + 40, scale: 1.0, facing: -1, pose: { ...STAND, armF: [60 + 80 * lift, 50], armB: [40, 60] } };
  const pris: Body = { x: 460, y: FLOOR - 40, scale: 1.05, facing: 1, pose: { ...STAND, armF: aim({ x: 460, y: FLOOR - 40, scale: 1.05, facing: 1, pose: STAND }, { x: 560, y: 740 }) } };
  const jh = head(judgeBody), ph = head(pris);
  const cam: Camera = frame >= prisoner
    ? camAt(frame, [[prisoner, closeUp(ph.x + 30, ph.y, 2.5)], [end, closeUp(ph.x + 30, ph.y, 2.7)]])
    : frame >= judge
      ? camAt(frame, [[judge, closeUp(jh.x - 40, jh.y + 30, 2.2)], [prisoner, closeUp(jh.x - 20, jh.y + 50, 2.0)]])
      : camAt(frame, [[start, { x: 900, y: 560, zoom: 1.05 }], [judge, { x: 920, y: 560, zoom: 1.15 }]]);
  return (
    <OwnSet mood="day" cam={drift(cam, frame, "cp-court", 3)} back={<Court />}>
      <Person body={judgeBody} frame={frame} seed={1} who={{ head: PASTELS[7], coat: "#1f2128", brows: "flat", lids: 0.35, mouth: frame >= judge && frame < strike ? "open" : "flat", look: { x: 1, y: 0.3 } }} />
      <BenchFront gavel={lift} />
      <Person body={pris} frame={frame} seed={4} who={{ head: PASTELS[1], coat: "#e07a3f", brows: frame >= prisoner ? "raised" : "none", lids: 0.1, mouth: frame >= strike ? "smirk" : "flat", look: { x: 1, y: -0.3 } }} />
      <Dock />
    </OwnSet>
  );
};

const CURTAINS = ["#1d9a8f", "#d9c26a", "#7fa0c4", "#d8344f"];

/** One aisle: she walks slowly, calm, lids heavy, under a veil; he bounces on his toes at the stage; at `hand` she takes
 *  his hand like an old friend's. `n` picks the couple and the curtain (the fourth is the one we stay with). */
const Aisle: React.FC<{ frame: number; n: number; start: number; hand: number; vow?: number; end: number; cam: Camera }> = ({ frame, n, start, hand, vow, end, cam }) => {
  const p = linear(frame, start - 40, hand);
  const bx = mix(240, 900, p);
  const calm = ramp(frame, hand, hand + 20);
  const thrilled = vow !== undefined ? ramp(frame, end - 24, end - 8) : 0;
  const bounce = Math.abs(Math.sin(frame / 4)) * 14 * (1 - calm * 0.7 + thrilled * 1.2);
  const groom: Body = { x: 1060, y: 990 - bounce, scale: 1.15, facing: -1, pose: { ...STAND, drop: -2, armF: [20, 20] } };
  const bride: Body = { x: bx, y: 990, scale: 1.15, facing: 1, pose: p < 1 ? walkPose(frame * 0.12) : STAND };
  if (frame >= hand) {
    const meet = { x: (bx + groom.x) / 2, y: 990 - 150 };
    const t = ramp(frame, hand, hand + 12);
    bride.pose = { ...STAND, armF: [mix(10, aim(bride, meet)[0], t), mix(10, aim(bride, meet)[1], t)] };
    groom.pose = { ...groom.pose, armF: [mix(20, aim(groom, meet)[0], t), mix(20, aim(groom, meet)[1], t)] };
  }
  const veil = <path d="M-20 -50 Q6 -60 26 -40 Q-6 -34 -34 -10 L-58 50 Q-62 20 -48 -20Z" fill="#fffaf0" opacity={0.8} stroke="#e9e1cf" strokeWidth={3} />;
  const talking = vow !== undefined && frame >= vow && frame < end - 24;
  return (
    <InSet set={weddingHall} mood="lamp" frame={frame} cam={drift(cam, frame, `cp-wed${n}`, 3)} options={{ thrones: false, curtain: CURTAINS[n] }}>
      <Person body={groom} frame={frame} seed={2 + n} who={{ head: PASTELS[(n * 3) % PASTELS.length], coat: "#3b3f4a", tie: "#c9a33a", brows: thrilled > 0 ? "raised" : "worry",
        eyes: 1.2 + thrilled * 0.2, mouth: thrilled > 0 ? "open" : frame >= hand ? "o" : "smile", look: { x: 1, y: 0 } }} />
      <Person body={bride} frame={frame} seed={5 + n} who={{ head: PASTELS[(n * 3 + 3) % PASTELS.length], coat: "#fbf6ee", brows: "none", lids: 0.62,
        mouth: talking ? (Math.floor(frame / 5) % 2 ? "open" : "smile") : "smile", look: { x: 1, y: 0.1 } }} />
      <OnFace body={bride}>{veil}</OnFace>
    </InSet>
  );
};

export interface WeddingTimes { start: number; cuts: [number, number, number]; main: number; hand: number; vow: number; end: number }

/** Every wedding: three quick aisles, every bride the same calm walk, then the fourth, where she takes his hand; on her
 *  line, close on her ("I do. Still."), and the groom finally lets himself bounce. */
export const WeddingShot: React.FC<{ frame: number; k: WeddingTimes }> = ({ frame, k }) => {
  if (frame < k.main) {
    const i = frame >= k.cuts[2] ? 2 : frame >= k.cuts[1] ? 1 : 0;
    const from = i === 0 ? k.start : k.cuts[i];
    const to = i === 2 ? k.main : k.cuts[i + 1];
    const cams: Camera[] = [{ x: 560, y: 640, zoom: 1.35 }, { x: 760, y: 620, zoom: 1.15 }, { x: 640, y: 660, zoom: 1.5 }];
    const cam = camAt(frame, [[from, cams[i]], [to, { ...cams[i], x: cams[i].x + 80 }]]);
    return <Aisle frame={frame} n={i} start={from + 20} hand={to + 200} end={to} cam={cam} />;
  }
  const bride: Body = { x: 900, y: 990, scale: 1.15, facing: 1, pose: STAND };
  const bh = head(bride);
  const cam: Camera = frame >= k.vow
    ? camAt(frame, [[k.vow, closeUp(bh.x + 90, bh.y, 2.2)], [k.end - 24, closeUp(bh.x + 90, bh.y, 2.35)], [k.end - 10, { x: 980, y: 700, zoom: 1.6 }]])
    : camAt(frame, [[k.main, { x: 640, y: 640, zoom: 1.25 }], [k.hand, { x: 900, y: 650, zoom: 1.45 }]]);
  return <Aisle frame={frame} n={3} start={k.main} hand={k.hand} vow={k.vow} end={k.end} cam={cam} />;
};

/** The classroom: forty-year-olds in uniform on the bench, slumped like commuters (grey temples, a moustache, reading
 *  glasses, a folded newspaper); the teacher at the board with chalk. On "Miss. We've done this." the middle kid half
 *  rises, palm up, patient; on "Sit down." he sinks back and folds his arms. */
export const ClassShot: React.FC<{ frame: number; start: number; grown: number; kid: number; teacher: number; end: number }> = ({ frame, start, grown, kid, teacher, end }) => {
  const s = classroom.spots;
  const seats = [s.seat1, s.seat2, s.seat3];
  const rise = ramp(frame, kid + 6, kid + 18) * (1 - ramp(frame, teacher + 6, teacher + 14));
  const kids: Body[] = seats.map((sp, i) => ({ x: sp.x, y: sp.y, scale: sp.scale, facing: 1, pose: { ...SEATED, lean: -12 + i * 2, tilt: 8, armF: [24, 78], armB: [18, 88] } }));
  kids[0].pose = { ...kids[0].pose, armF: [60, 50] };
  kids[1] = { ...kids[1], y: kids[1].y - 46 * rise, pose: { ...kids[1].pose, lean: mix(-12, 16, rise), tilt: mix(8, -4, rise), armF: rise > 0.3 ? [mix(24, 85, rise), mix(78, 15, rise)] : [24, 78] } };
  const teach: Body = { x: s.teacher.x, y: s.teacher.y, scale: s.teacher.scale, facing: -1, pose: { ...STAND, armF: frame >= teacher ? [95, 0] : [150, 20] } };
  const kh = head(kids[1]), th = head(teach);
  const cam: Camera = frame >= teacher + 14
    ? camAt(frame, [[teacher + 14, { x: 1000, y: 600, zoom: 1.15 }], [end, { x: 980, y: 600, zoom: 1.2 }]])
    : frame >= teacher
      ? camAt(frame, [[teacher, closeUp(th.x - 40, th.y + 40, 2.4)], [teacher + 14, closeUp(th.x - 40, th.y + 40, 2.5)]])
      : frame >= kid
        ? camAt(frame, [[kid, closeUp(kh.x + 50, kh.y, 2.4)], [teacher, closeUp(kh.x + 50, kh.y - 30, 2.5)]])
        : camAt(frame, [[start, { x: 960, y: 560, zoom: 1.05 }], [grown, { x: 900, y: 600, zoom: 1.2 }], [kid, { x: 760, y: 640, zoom: 1.6 }]]);
  const chalk = <rect x={-12} y={-4} width={24} height={8} rx={3} fill={PAPER} />;
  const paper = <g transform="translate(10 -20)"><rect x={-50} y={-40} width={100} height={70} fill={PAPER} stroke={INK} strokeWidth={3} /><rect x={-40} y={-30} width={80} height={8} fill={INK} opacity={0.7} /><rect x={-40} y={-14} width={60} height={5} fill={INK} opacity={0.5} /><rect x={-40} y={-4} width={70} height={5} fill={INK} opacity={0.5} /></g>;
  const moustache = <path d="M-4 15 Q5 6 11 12 Q17 6 26 15 Q12 20 -4 15Z" fill={INK} />;
  const glasses = <g fill="none" stroke={INK} strokeWidth={3.5}><circle cx={-10} cy={-5} r={13} /><circle cx={17} cy={-5} r={13} /><line x1={3} y1={-6} x2={4} y2={-6} /></g>;
  return (
    <InSet set={classroom} mood="day" frame={frame} cam={drift(cam, frame, "cp-class", 3)} options={{ board: "diagram", drawn: 1 }}>
      {kids.map((b, i) => (
        <Person key={i} body={b} frame={frame} seed={i + 2} temples
          who={{ head: PASTELS[(i * 3 + 2) % PASTELS.length], coat: "#2f3e6a", tie: "#d8344f", cap: "#2f3e6a", brows: i === 1 && frame >= kid ? "flat" : "none", lids: 0.72,
            mouth: i === 1 && frame >= kid && frame < teacher ? (Math.floor(frame / 5) % 2 ? "open" : "flat") : "flat", look: i === 0 ? { x: 0.6, y: 0.8 } : { x: 1, y: 0.2 },
            held: i === 0 ? paper : undefined }} />
      ))}
      <OnFace body={kids[0]}>{moustache}</OnFace>
      <OnFace body={kids[2]}>{glasses}</OnFace>
      <Person body={teach} frame={frame} seed={8} who={{ head: PASTELS[0], coat: "#6b4b3a", brows: frame >= teacher ? "angry" : "raised", mouth: frame >= teacher ? "open" : "flat",
        eyes: frame >= kid && frame < teacher ? 1.2 : 1, look: { x: 1, y: 0.1 }, held: chalk }} />
    </InSet>
  );
};
