// The silent morning train, played for comedy (the picture only this premise can show): the library metro coach in
// the morning, every seat full, every face a year older in mind and smug about it (lids heavy, chins up, tiny
// satisfied smirks), nobody on a phone, thick finished books on laps, the carriage swaying. On one bench the couple:
// she stares at the floor, jaw set; he looks out of the window, serene, reading a thick book with a heart on the cover.
// A kid in a school cap with a briefcase on his knees; the old sleeper on the end seat. The 3 s hold: he turns a page;
// she glances at the book, sees the heart, and her jaw sets harder; the kid checks his pocket watch; the old sleeper's
// lids drop another notch.
import { seatedY, SEATED, STAND } from "@whatif/kit/rig/pose";
import { metroCoach } from "@whatif/kit/sets/MetroCoach";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { camAt, mix, OLD, PASTELS, ramp } from "../shared";
import { hand, head, InSet, Person, type Body } from "./CityPlugsIn.Kit";

const SEAT_TOP = 860;
const SY = seatedY(SEAT_TOP, 1.05);
/** The smug riders along the bench (x, facing); the couple at ANGRY and CALM, the kid at KID, the old sleeper at OLD_X. */
const RIDERS: [number, 1 | -1][] = [[250, 1], [390, -1], [530, 1], [1220, 1], [1380, -1]];
const ANGRY = 690;
const CALM = 830;
const KID = 1060;
const OLD_X = 1660;
const STANDER = 1860;
const COATS = ["#3f4a5c", "#5c3f4a", "#4a5c3f", "#3b3e47", "#6a5a4c", "#2f4a5a"];

const Heart: React.FC<{ s?: number; fill?: string }> = ({ s = 1, fill = CRIMSON }) => (
  <path transform={`scale(${s})`} d="M0 10 C-14 -2 -16 -14 -7 -17 C-3 -18 0 -15 0 -12 C0 -15 3 -18 7 -17 C16 -14 14 -2 0 10Z" fill={fill} />
);

/** A thick finished book, closed (held in a hand, figure coordinates). */
const ThickBook: React.FC<{ c: string }> = ({ c }) => (
  <g transform="translate(6 -14)">
    <rect x={-30} y={-22} width={60} height={40} rx={4} fill={PAPER} stroke={INK} strokeWidth={3} />
    <rect x={-30} y={-30} width={60} height={12} rx={3} fill={c} stroke={INK} strokeWidth={3} />
  </g>
);

/** His book: thick, held up, the cover (with its drawn heart) towards her; `flip` 0..1 sweeps a page over. */
const HeartBook: React.FC<{ flip: number }> = ({ flip }) => (
  <g transform="translate(8 -40)">
    <rect x={-44} y={-58} width={88} height={110} rx={6} fill="#f6d9d9" stroke={INK} strokeWidth={4} />
    <rect x={-44} y={-58} width={14} height={110} fill="#e2b3b3" stroke={INK} strokeWidth={3} />
    <g transform="translate(8 -6)"><Heart s={2.2} /></g>
    <rect x={44} y={-54} width={16} height={104} fill={PAPER} stroke={INK} strokeWidth={3} />
    {flip > 0 && flip < 1 && <path d={`M44 -54 Q${44 + 70 * Math.cos(flip * Math.PI)} -40 ${44 + 80 * Math.cos(flip * Math.PI)} -20 L${44 + 80 * Math.cos(flip * Math.PI)} 50 L44 50Z`} fill={PAPER} stroke={INK} strokeWidth={3} />}
  </g>
);

const Briefcase: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-58} y={-46} width={116} height={64} rx={8} fill="#7a4f34" stroke={INK} strokeWidth={5} />
    <path d="M-18 -46 v-14 h36 v14" fill="none" stroke={INK} strokeWidth={6} />
    <rect x={-6} y={-30} width={12} height={10} fill="#d9c26a" stroke={INK} strokeWidth={2} />
  </g>
);

const Watch = (
  <g transform="translate(4 -8)">
    <path d="M0 0 Q-20 30 -10 60" fill="none" stroke="#d9c26a" strokeWidth={3} />
    <circle r={16} fill="#d9c26a" stroke={INK} strokeWidth={4} />
    <circle r={10} fill={PAPER} />
    <line x1={0} y1={0} x2={0} y2={-7} stroke={INK} strokeWidth={2.5} />
    <line x1={0} y1={0} x2={5} y2={2} stroke={INK} strokeWidth={2.5} />
  </g>
);

export interface TrainTimes { start: number; smug: number; books: number; couple: number; angry: number; calm: number; book: number; hold: number; end: number }

export const TrainShot: React.FC<{ frame: number; k: TrainTimes }> = ({ frame, k }) => {
  const sway = Math.sin(frame / 11);
  const lean = (base: number) => base + sway * 2.5;
  const h = k.hold;
  const flip = ramp(frame, h + 4, h + 14);
  const glance = ramp(frame, h + 14, h + 20) * (1 - ramp(frame, h + 34, h + 40));
  const harder = ramp(frame, h + 28, h + 32);
  const shake = frame >= h + 28 && frame < h + 34 ? Math.sin(frame * 3) * 3 : 0;
  const watchUp = ramp(frame, h + 38, h + 48);
  const oldLids = mix(0.84, 0.95, ramp(frame, h + 58, h + 66));
  const riders: Body[] = RIDERS.map(([x, f]) => ({ x, y: SY, scale: 1.05, facing: f, pose: { ...SEATED, lean: lean(-6), tilt: -7, armF: [24, 70], armB: [20, 74] } }));
  const angry: Body = { x: ANGRY + shake, y: SY, scale: 1.05, facing: 1, pose: { ...SEATED, lean: lean(10), tilt: mix(6, -4, glance) + harder * 8, armF: [30, 60], armB: [24, 70] } };
  const calm: Body = { x: CALM, y: SY, scale: 1.05, facing: 1, pose: { ...SEATED, lean: lean(-6), tilt: -6, armF: [60, 70], armB: [50, 90] } };
  const kid: Body = { x: KID, y: SY, scale: 0.92, facing: -1, pose: { ...SEATED, lean: lean(2), tilt: -4 + watchUp * 10, armF: [mix(30, 110, watchUp), mix(60, 70, watchUp)], armB: [30, 60] } };
  const old: Body = { x: OLD_X, y: SY, scale: 1.05, facing: -1, pose: { ...SEATED, lean: lean(-8), armF: [24, 70], armB: [20, 74] } };
  const stander: Body = { x: STANDER, y: 980, scale: 1.12, facing: -1, pose: { ...STAND, lean: sway * 1.5, armF: [60, 60], armB: [172, 6] } };
  const ah = head(angry), ch = head(calm);
  const bookAt = hand(calm);
  const wide: Camera = { x: 960, y: 560, zoom: 1.0 };
  const cam: Camera = frame >= k.hold
    ? camAt(frame, [[k.hold, { x: 1080, y: 640, zoom: 1.25 }], [k.end, { x: 1060, y: 650, zoom: 1.32 }]])
    : frame >= k.book
      ? camAt(frame, [[k.book, closeUp(bookAt.x + 10, bookAt.y - 60, 2.8)], [k.hold, closeUp(bookAt.x + 10, bookAt.y - 60, 3.0)]])
      : frame >= k.calm
        ? camAt(frame, [[k.calm, closeUp(ch.x + 10, ch.y + 20, 2.5)], [k.book, closeUp(ch.x + 10, ch.y + 40, 2.6)]])
        : frame >= k.angry
          ? camAt(frame, [[k.angry, closeUp(ah.x + 20, ah.y, 2.6)], [k.calm, closeUp(ah.x + 20, ah.y, 2.8)]])
          : frame >= k.couple
            ? camAt(frame, [[k.couple, { x: 760, y: 680, zoom: 1.8 }], [k.angry, { x: 760, y: 700, zoom: 2.0 }]])
            : frame >= k.books
              ? camAt(frame, [[k.books, { x: 1240, y: 660, zoom: 1.55 }], [k.couple, { x: 1460, y: 660, zoom: 1.6 }]])
              : frame >= k.smug
                ? camAt(frame, [[k.smug, { x: 300, y: 640, zoom: 1.6 }], [k.books, { x: 560, y: 640, zoom: 1.6 }]])
                : camAt(frame, [[k.start, wide], [k.smug, { ...wide, zoom: 1.06 }]]);
  return (
    <InSet set={metroCoach} mood="morning" frame={frame} cam={drift({ ...cam, x: cam.x + sway * 3 }, frame, "cp-train", 2)} options={{ speed: 7, ads: ["#1d9a8f", "#d8344f"] }}>
      {riders.map((b, i) => (
        <Person key={i} body={b} frame={frame} seed={i + 11} who={{ head: PASTELS[(i * 3 + 1) % PASTELS.length], coat: COATS[i % COATS.length], lids: 0.6 + (i % 3) * 0.06,
          mouth: "smirk", brows: "flat", look: { x: 0.6, y: -0.2 }, held: <ThickBook c={PASTELS[(i * 5 + 2) % PASTELS.length]} /> }} />
      ))}
      <Person body={angry} frame={frame} seed={21} who={{ head: PASTELS[3], coat: "#5c3f4a", brows: "angry", lids: mix(0.3, 0.45, harder), eyes: 1 + glance * 0.15,
        mouth: harder > 0.5 ? "frown" : "flat", look: glance > 0.5 ? { x: 1, y: 0.5 } : { x: 0.6, y: 1 } }} />
      <Person body={calm} frame={frame} seed={22} who={{ head: PASTELS[0], coat: "#3f4a5c", brows: "none", lids: 0.6, mouth: "smile",
        look: frame >= k.hold && frame < h + 16 ? { x: 1, y: 0.6 } : { x: -0.7, y: -0.6 }, held: <HeartBook flip={flip} /> }} />
      <Briefcase x={KID - 40} y={SEAT_TOP - 10} />
      <Person body={kid} frame={frame} seed={25} who={{ head: PASTELS[4], coat: "#2f3e6a", tie: CRIMSON, cap: "#2f3e6a", lids: 0.62, mouth: "smirk", brows: "flat",
        look: watchUp > 0.5 ? { x: 0.8, y: 0.3 } : { x: 1, y: 0 }, held: watchUp > 0.05 ? Watch : undefined }} />
      <Person body={old} frame={frame} seed={23} who={{ ...OLD, lids: oldLids, mouth: "smile", look: { x: 0.3, y: 0.4 } }} />
      <Person body={stander} frame={frame} seed={24} who={{ head: PASTELS[6], coat: "#6a5a4c", lids: 0.6, mouth: "smirk", brows: "flat", look: { x: 0.8, y: 0.5 },
        held: <ThickBook c="#7fc29b" /> }} />
    </InSet>
  );
};
