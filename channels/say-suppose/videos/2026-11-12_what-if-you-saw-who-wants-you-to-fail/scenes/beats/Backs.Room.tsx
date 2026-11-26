// Backs: the same classroom from the front, from where you stand (outside review of v6, sheet 36: the v6 room of tiered
// rows read as the five-hundred-seat hall; "plain backs, not visible faces"). A flat floor, the back wall with its
// noticeboard, clock and door, the side wall's windows, and eight rows of twelve students who have spun their chairs
// round: from here each is a desk, a chair back and the back of a head. No faces anywhere in this view. Also your phone
// (REMOVED FROM GROUP, large) and the tear-off countdown (21 DAYS).
import { FONT } from "@whatif/kit/fonts";
import { classroom, Deep, setLook } from "@whatif/kit/sets";
import { LookContext } from "@whatif/kit/stage/Look";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { HERO, noise, PASTELS, TAEHO } from "../shared";

export const POV_ROWS = 8;
export const POV_COLS = 12;
const HORIZON = 470;
const z = (r: number) => 1 + r * 0.4;
/** Row r (0 nearest): its desk-front line y, its scale, seat c's x. */
export const povY = (r: number) => HORIZON + 560 / z(r);
export const povS = (r: number) => 1.15 / z(r);
export const povX = (r: number, c: number) => 960 + (c - (POV_COLS - 1) / 2) * 196 * povS(r) + (r % 2 ? 22 : -22) * povS(r);
/** The rival's seat in this view (sage head, black jacket): near, right of centre, so his wave reads. */
export const POV_RIVAL = { r: 1, c: 8 };
/** The boy straight in front of you (the lean gag). */
export const POV_BOY = { r: 0, c: 6 };

const COATS = ["#3b3e47", "#2a2d36", "#4a4f63", "#3b4a6b", "#5a4a63", "#33403c"];

/** The back of a student from the waist up: shoulders, ears, the back of the head (a crown whorl, the nape in shadow).
 *  (x, y) is the shoulders' base. `tilt` leans the head; `arm` 0..1 raises a hand over the shoulder (waving). */
export const BackBust: React.FC<{ x: number; y: number; s: number; head: string; coat: string; tilt?: number; tuft?: boolean; scarf?: string;
  arm?: number; wave?: number }> = ({ x, y, s, head, coat, tilt = 0, tuft, scarf, arm = 0, wave = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {arm > 0 && (
      <g transform={`rotate(${-20 + wave} 52 -10)`}>
        <path d={`M52 -10 L${60 + 14 * arm} ${-10 - 230 * arm}`} stroke={INK} strokeWidth={30} strokeLinecap="round" />
        <path d={`M52 -10 L${60 + 14 * arm} ${-10 - 230 * arm}`} stroke={coat} strokeWidth={20} strokeLinecap="round" />
        <circle cx={60 + 14 * arm} cy={-18 - 240 * arm} r={24} fill={head} stroke={INK} strokeWidth={4} />
      </g>
    )}
    <path d="M-68 34 Q-68 -16 -30 -24 L30 -24 Q68 -16 68 34Z" fill={coat} stroke={INK} strokeWidth={5} />
    <path d="M-26 -24 Q0 -6 26 -24" fill="none" stroke="#000" strokeWidth={5} opacity={0.3} />
    {scarf && <path d="M-34 -26 Q0 -8 34 -26 L30 -10 Q0 6 -30 -10Z" fill={scarf} stroke={INK} strokeWidth={4} />}
    <g transform={`rotate(${tilt} 0 -30)`}>
      <ellipse cx={-44} cy={-74} rx={8} ry={12} fill={head} stroke={INK} strokeWidth={4} />
      <ellipse cx={44} cy={-74} rx={8} ry={12} fill={head} stroke={INK} strokeWidth={4} />
      <circle cx={0} cy={-76} r={44} fill={head} stroke={INK} strokeWidth={5} />
      {tuft && <path d="M-4 -118 q8 -30 30 -14" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />}
      <path d="M-42 -62 Q0 -44 42 -62 A44 44 0 0 1 -42 -62Z" fill="#000" opacity={0.16} />
      <path d="M2 -100 q10 -2 8 8 q-4 10 -14 4" fill="none" stroke="#000" strokeWidth={4} opacity={0.3} strokeLinecap="round" />
    </g>
  </g>
);

/** One turned seat seen from the front: the student's back, the chair's back panel over the lower back, the desk nearest. */
const PovSeat: React.FC<{ r: number; c: number; shift?: number; tilt?: number; arm?: number; wave?: number }> = ({ r, c, shift = 0, tilt = 0, arm, wave }) => {
  const s = povS(r), y = povY(r), x = povX(r, c);
  const i = r * POV_COLS + c;
  const rival = r === POV_RIVAL.r && c === POV_RIVAL.c;
  const top = y - 118 * s; // the desk top's front edge
  return (
    <g>
      <BackBust x={x + shift} y={top - 40 * s} s={s * 0.95} head={rival ? TAEHO.head : PASTELS[(i * 3 + r) % PASTELS.length]}
        coat={rival ? TAEHO.coat : COATS[i % COATS.length]} tilt={tilt} arm={arm} wave={wave} />
      {/* the chair: two posts and the back panel, over the student's lower back */}
      <rect x={x - 46 * s} y={top - 52 * s} width={92 * s} height={34 * s} rx={8 * s} fill="#7d5a45" stroke={INK} strokeWidth={4} />
      <rect x={x - 40 * s} y={top - 20 * s} width={9 * s} height={22 * s} fill="#5a3f30" />
      <rect x={x + 31 * s} y={top - 20 * s} width={9 * s} height={22 * s} fill="#5a3f30" />
      {/* the desk: its top seen from above, the front panel, two legs */}
      <path d={`M${x - 84 * s} ${top} L${x + 84 * s} ${top} L${x + 72 * s} ${top - 22 * s} L${x - 72 * s} ${top - 22 * s}Z`} fill="#a87c52" stroke={INK} strokeWidth={4} />
      <rect x={x - 84 * s} y={top} width={168 * s} height={38 * s} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
      <rect x={x - 78 * s} y={top + 38 * s} width={10 * s} height={y - top - 38 * s} fill="#6a4630" />
      <rect x={x + 68 * s} y={top + 38 * s} width={10 * s} height={y - top - 38 * s} fill="#6a4630" />
      {noise(i) > 0.6 && <rect x={x - 30 * s} y={top - 18 * s} width={44 * s} height={12 * s} rx={3} fill="#f3e9d7" />}
    </g>
  );
};

/** The back wall and the left wall's windows, the floor with its seams running to the back. */
const PovBack: React.FC<{ cam: Camera }> = ({ cam }) => (
  <Deep cam={cam} depth={0.85} flat>
    <rect x={-1400} y={-800} width={4800} height={2600} fill="#f1e6c8" />
    <rect x={-1400} y={HORIZON + 10} width={4800} height={90} fill="#bfd0c6" />
    <rect x={-1400} y={HORIZON + 100} width={4800} height={1600} fill="#a9a08e" />
    <path d={Array.from({ length: 21 }, (_, i) => `M${960 + (i - 10) * 90} ${HORIZON + 100} L${960 + (i - 10) * 420} 1700`).join("")} stroke="#000" strokeWidth={3} opacity={0.07} />
    {/* the left wall going past you, three windows */}
    <path d={`M-600 -300 L260 160 L260 ${HORIZON + 100} L-600 1300Z`} fill="#e6dab9" />
    {[0, 1, 2].map((i) => {
      const x0 = -380 + i * 200, x1 = x0 + 140;
      const t = (x: number) => 160 + ((x + 600) / 860) * 0;
      return <path key={i} d={`M${x0} ${t(x0) + 40 - i * 30} L${x1} ${t(x1) + 70 - i * 28} L${x1} ${380 - i * 10} L${x0} ${430 - i * 14}Z`} fill="#bfe0ea" stroke="#6b7a72" strokeWidth={8} />;
    })}
    {/* the back wall: a noticeboard with pinned sheets, the clock, the door */}
    <rect x={560} y={250} width={420} height={170} rx={6} fill="#c79a62" stroke={INK} strokeWidth={5} />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={580 + i * 100} y={268 + (i % 2) * 18} width={76} height={100} fill={PAPER} transform={`rotate(${i % 2 ? 3 : -3} ${618 + i * 100} 318)`} />)}
    <circle cx={1180} cy={250} r={40} fill={PAPER} stroke={INK} strokeWidth={5} />
    <path d="M1180 250 V222 M1180 250 L1198 258" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <rect x={1400} y={250} width={150} height={HORIZON - 150} rx={4} fill="#8a6a50" stroke={INK} strokeWidth={5} />
    <circle cx={1530} cy={400} r={8} fill={INK} />
  </Deep>
);

/** The room of backs from the front. `shiftOf` / `tiltOf` move a seat's student (the lean gag); `armOf` / `waveOf` raise a
 *  hand over a shoulder. `front` draws nearest (you, from behind). */
export const PovRoom: React.FC<{ cam: Camera; shiftOf?: (r: number, c: number) => number; tiltOf?: (r: number, c: number) => number;
  armOf?: (r: number, c: number) => number; waveOf?: (r: number, c: number) => number; front?: React.ReactNode; over?: React.ReactNode }> = ({
  cam, shiftOf, tiltOf, armOf, waveOf, front, over,
}) => (
  <LookContext.Provider value={setLook(classroom.lights(classroom.defaults), "day", cam)}>
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<PovBack cam={cam} />}
      actors={
        <>
          {Array.from({ length: POV_ROWS }, (_, k) => {
            const r = POV_ROWS - 1 - k;
            return Array.from({ length: POV_COLS }, (_, c) => (
              <PovSeat key={`${r}-${c}`} r={r} c={c} shift={shiftOf?.(r, c)} tilt={tiltOf?.(r, c)} arm={armOf?.(r, c)} wave={waveOf?.(r, c)} />
            ));
          })}
          {over}
          {front}
        </>
      } />
  </LookContext.Provider>
);

/** You standing at the front with your back to us (a big bust), the score sheet in your front hand: `lower` 0..1 brings
 *  it down from over your head to your side; `lean` tips you sideways (degrees). */
export const YouFromBehind: React.FC<{ x?: number; y?: number; s?: number; lower?: number; lean?: number }> = ({ x = 960, y = 1180, s = 2.1, lower = 0, lean = 0 }) => {
  const hx = x + 118 * s, hy = y - 150 * s + lower * 120 * s;
  return (
    <g transform={`rotate(${lean} ${x} ${y + 200})`}>
      <g transform={`translate(${hx} ${hy}) rotate(${8 - lower * 14}) scale(${s})`}>
        <rect x={-34} y={-46} width={68} height={88} rx={4} fill="#efe6d2" stroke={INK} strokeWidth={4} />
        <circle cx={-2} cy={50} r={13} fill={MUSTARD} stroke={INK} strokeWidth={4} />
      </g>
      <path d={`M${x + 50 * s} ${y - 20 * s} Q${x + 110 * s} ${y - 60 * s + lower * 40 * s} ${hx} ${hy + 50 * s}`} fill="none" stroke={INK} strokeWidth={26 * s} strokeLinecap="round" />
      <BackBust x={x} y={y} s={s} head={HERO.head} coat="#3b3e47" tuft scarf={TEAL} />
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the phone

/** Your phone, close, in your hand: the class chat; on `removed` the line REMOVED FROM GROUP slams across the screen in
 *  large type; at `drop` the phone sags in your hand. */
export const PhoneInsert: React.FC<{ frame: number; at: number; removed: number; drop: number }> = ({ frame, at, removed, drop }) => {
  const rise = Math.min(1, Math.max(0, (frame - at) / 10));
  const r = Math.min(1, Math.max(0, (frame - removed) / 5));
  const sag = Math.min(1, Math.max(0, (frame - drop) / 14));
  const y = 560 + (1 - rise) * 520 + sag * 70;
  const slam = 1 + (1 - r) * 0.5;
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <rect x={0} y={0} width={1920} height={1080} fill="#2d2f3a" />
      <g transform={`translate(960 ${y}) rotate(${-2 + sag * 6})`}>
        <rect x={-300} y={-520} width={600} height={1040} rx={64} fill="#1c1d24" stroke={INK} strokeWidth={8} />
        <rect x={-270} y={-480} width={540} height={960} rx={34} fill="#f3efe6" />
        <rect x={-270} y={-480} width={540} height={110} rx={34} fill={TEAL} />
        <text x={-230} y={-410} fontFamily={FONT} fontWeight={800} fontSize={40} fill={PAPER}>CLASS 4 · 98</text>
        {[0, 1, 2].map((i) => (
          <g key={i} opacity={1 - r * 0.6}>
            <rect x={i % 2 ? -40 : -240} y={-330 + i * 120} width={280} height={84} rx={34} fill={i % 2 ? "#cfe9e5" : PAPER} stroke={INK} strokeWidth={3} />
            <rect x={(i % 2 ? -40 : -240) + 30} y={-298 + i * 120} width={170 + noise(i) * 50} height={16} rx={8} fill={INK} opacity={0.4} />
          </g>
        ))}
      </g>
      {/* your mustard thumb on the phone's edge */}
      <g transform={`translate(${960 + 290} ${y + 360}) rotate(-20)`}>
        <rect x={-44} y={-64} width={88} height={160} rx={44} fill={MUSTARD} stroke={INK} strokeWidth={5} />
      </g>
      {r > 0 && (
        <g opacity={r} transform={`translate(960 ${520 + sag * 40}) rotate(-3) scale(${slam})`}>
          <rect x={-760} y={-200} width={1520} height={400} rx={36} fill={PAPER} stroke={CRIMSON} strokeWidth={14} />
          <rect x={-742} y={-182} width={1484} height={364} rx={26} fill="none" stroke={INK} strokeWidth={4} opacity={0.3} />
          <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={150} fill={CRIMSON} letterSpacing={8}>REMOVED</text>
          <text x={0} y={130} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={120} fill={INK} letterSpacing={6}>FROM GROUP</text>
        </g>
      )}
    </svg>
  );
};

// ------------------------------------------------------------------------------------------------ the countdown

/** The exam countdown on a tear-off pad: the 22 page rips away in one pull at `tear` and lands on 21 DAYS. */
export const Countdown: React.FC<{ frame: number; at: number; tear: number }> = ({ frame, at, tear }) => {
  const rip = Math.min(1, Math.max(0, (frame - tear) / 9));
  const settle = Math.min(1, Math.max(0, (frame - tear - 6) / 8));
  const push = 1 + Math.min(1, Math.max(0, (frame - at) / 60)) * 0.05;
  const Page: React.FC<{ n: number }> = ({ n }) => (
    <g>
      <rect x={-380} y={-300} width={760} height={600} rx={18} fill={PAPER} stroke={INK} strokeWidth={6} />
      <rect x={-380} y={-300} width={760} height={130} rx={18} fill={CRIMSON} stroke={INK} strokeWidth={6} />
      <text x={0} y={-212} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={80} fill={PAPER} letterSpacing={8}>EXAM IN</text>
      <text x={0} y={120} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={300} fill={INK}>{n}</text>
      <text x={0} y={250} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={96} fill={INK} letterSpacing={10}>DAYS</text>
    </g>
  );
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <rect x={0} y={0} width={1920} height={1080} fill="#f1e6c8" />
      <rect x={0} y={760} width={1920} height={320} fill="#bfd0c6" />
      <g transform={`translate(960 ${560}) scale(${push * (1 + (1 - settle) * 0.03 * (rip > 0 ? 1 : 0))})`}>
        <rect x={-372} y={-284} width={760} height={600} rx={18} fill="#000" opacity={0.25} />
        <Page n={21} />
        {rip < 1 && (
          <g transform={`translate(${rip * 900} ${-rip * 700}) rotate(${rip * 40} 380 -300)`} opacity={1 - rip * 0.3}>
            <Page n={22} />
          </g>
        )}
        {[-240, -80, 80, 240].map((x) => <circle key={x} cx={x} cy={-322} r={14} fill="#7a8088" stroke={INK} strokeWidth={4} />)}
      </g>
    </svg>
  );
};
