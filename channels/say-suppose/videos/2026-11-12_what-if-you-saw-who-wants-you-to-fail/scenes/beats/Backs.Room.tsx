// Backs: the room of a hundred (script v5, 2026-11-14). The academy's big lecture room seen from the front, from the
// board: ten tiered rows of ten, each student a paper bust behind a long desk. Each can turn round on its chair (a flip
// with a hop: the scrape) to show its back. You stand at the front with your score, your own back to us. Also the
// reverse (from behind the class: their backs near, your face at the front), your phone, and the board's countdown.
import { FONT } from "@whatif/kit/fonts";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { HERO, noise, PASTELS, TAEHO } from "../shared";
import { Deep } from "../sets/common";

export const ROWS = 10;
export const COLS = 10;
/** Row r (0 the front): its desk line y, its scale, seat c's x. */
export const rowY = (r: number) => 1010 - r * 50;
export const rowS = (r: number) => 1.12 - r * 0.068;
export const seatX = (r: number, c: number) => 960 + (c - (COLS - 1) / 2) * 182 * rowS(r) + (r % 2 ? 30 : 0) * rowS(r);
/** The rival's seat. */
export const RIVAL = { r: 2, c: 6 };

const COATS = ["#3b3e47", "#2a2d36", "#4a4f63", "#3b4a6b", "#5a4a63", "#33403c"];

export type Face = { look?: number; mouth?: "flat" | "smile" | "smirk" | "o" | "open"; brows?: "none" | "flat" | "angry" | "raised"; lids?: number };

/** One student from the waist up at (x, y = the desk line), scale s. `turn` 0 faces us, 1 shows the back (a flip with a
 *  hop). `tilt` leans the head (the whisper). */
export const Bust: React.FC<{ x: number; y: number; s: number; head: string; coat: string; turn?: number; tilt?: number; face?: Face;
  tuft?: boolean; scarf?: string }> = ({ x, y, s, head, coat, turn = 0, tilt = 0, face = {}, tuft, scarf }) => {
  const sx = Math.max(0.04, Math.abs(Math.cos(Math.PI * turn)));
  const back = turn >= 0.5;
  const hop = Math.sin(Math.PI * Math.min(1, Math.max(0, turn))) * 14;
  const { look = 0, mouth = "flat", brows = "none", lids = 0.15 } = face;
  const ey = -78;
  return (
    <g transform={`translate(${x} ${y - hop * s}) scale(${s})`}>
      <g transform={`scale(${sx} 1)`}>
        <path d="M-66 30 Q-66 -18 -30 -24 L30 -24 Q66 -18 66 30Z" fill={coat} stroke={INK} strokeWidth={5} />
        {back
          ? <path d="M-26 -24 Q0 -6 26 -24" fill="none" stroke="#000" strokeWidth={5} opacity={0.35} />
          : <path d="M-14 -24 L0 -4 L14 -24" fill={PAPER} stroke={INK} strokeWidth={3} />}
        {scarf && <path d="M-34 -26 Q0 -8 34 -26 L30 -10 Q0 6 -30 -10Z" fill={scarf} stroke={INK} strokeWidth={4} />}
        <g transform={`rotate(${tilt} 0 -40)`}>
          <ellipse cx={-44} cy={-74} rx={8} ry={12} fill={head} stroke={INK} strokeWidth={4} />
          <ellipse cx={44} cy={-74} rx={8} ry={12} fill={head} stroke={INK} strokeWidth={4} />
          <circle cx={0} cy={-76} r={44} fill={head} stroke={INK} strokeWidth={5} />
          {tuft && <path d={back ? "M-4 -118 q8 -30 30 -14" : "M-6 -118 q10 -30 32 -12"} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />}
          {back ? (
            <g>
              {/* the back of a head: the nape in shadow, a crown whorl, no face */}
              <path d="M-42 -62 Q0 -44 42 -62 A44 44 0 0 1 -42 -62Z" fill="#000" opacity={0.16} />
              <path d="M2 -100 q10 -2 8 8 q-4 10 -14 4" fill="none" stroke="#000" strokeWidth={4} opacity={0.3} strokeLinecap="round" />
            </g>
          ) : (
            <g>
              {[-15, 15].map((dx) => (
                <g key={dx}>
                  <ellipse cx={dx + look * 6} cy={ey} rx={5.5} ry={7 * (1 - lids)} fill={INK} />
                  {brows === "angry" && <path d={`M${dx - 9} ${ey - 16 + (dx < 0 ? -4 : 4)} L${dx + 9} ${ey - 16 + (dx < 0 ? 4 : -4)}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />}
                  {brows === "flat" && <path d={`M${dx - 8} ${ey - 15} h16`} stroke={INK} strokeWidth={4} strokeLinecap="round" />}
                  {brows === "raised" && <path d={`M${dx - 8} ${ey - 16} q8 -7 16 0`} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />}
                </g>
              ))}
              {mouth === "flat" && <path d="M-8 -54 h16" stroke={INK} strokeWidth={4} strokeLinecap="round" />}
              {mouth === "smile" && <path d="M-11 -56 q11 10 22 0" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />}
              {mouth === "smirk" && <path d="M-8 -54 q12 4 20 -8" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />}
              {mouth === "o" && <ellipse cx={0} cy={-54} rx={5} ry={7} fill={INK} />}
              {mouth === "open" && <path d="M-12 -58 q12 -2 24 0 q-2 14 -12 14 q-10 0 -12 -14Z" fill={INK} />}
            </g>
          )}
        </g>
      </g>
    </g>
  );
};

/** The room's walls and tiers behind the rows (front view, camera at the board). */
const RoomBack: React.FC<{ cam: Camera; dusk?: boolean }> = ({ cam, dusk }) => (
  <Deep cam={cam} depth={0.85} flat>
    <rect x={-1400} y={-800} width={4800} height={2600} fill={dusk ? "#b9ad92" : "#efe4c8"} />
    {/* the back wall: windows high up, a clock, the tiers' steps */}
    {[-200, 260, 1300, 1760].map((x) => (
      <g key={x}>
        <rect x={x} y={70} width={320} height={190} rx={6} fill={dusk ? "#e3a06b" : "#bfe0ea"} stroke="#6b7a72" strokeWidth={10} />
        <line x1={x + 160} y1={70} x2={x + 160} y2={260} stroke="#6b7a72" strokeWidth={8} />
      </g>
    ))}
    <circle cx={960} cy={150} r={56} fill={PAPER} stroke={INK} strokeWidth={6} />
    <path d="M960 150 V112 M960 150 L986 162" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    {Array.from({ length: ROWS }, (_, r) => (
      <rect key={r} x={-1400} y={rowY(r) + 30 * rowS(r)} width={4800} height={60} fill={r % 2 ? "#cdbf9f" : "#d8cbab"} />
    ))}
  </Deep>
);

/** One row's long desk in front of its students. */
const RowDesk: React.FC<{ r: number }> = ({ r }) => {
  const s = rowS(r);
  return (
    <g>
      <rect x={-600} y={rowY(r) - 4 * s} width={3120} height={22 * s} fill="#a87c52" stroke={INK} strokeWidth={4} />
      <rect x={-600} y={rowY(r) + 18 * s} width={3120} height={34 * s} fill="#8a5c3b" />
    </g>
  );
};

export interface Seat { r: number; c: number; x: number; y: number; s: number }
export const SEATS: Seat[] = Array.from({ length: ROWS * COLS }, (_, i) => {
  const r = Math.floor(i / COLS), c = i % COLS;
  return { r, c, x: seatX(r, c), y: rowY(r), s: rowS(r) };
});

/** The room of a hundred from the front. `turnOf(seat)` 0..1, `tiltOf(seat)` degrees, `faceOf(seat)` the face while
 *  turned to us; `front` draws in front of row 0 (you, standing). */
export const HundredRoom: React.FC<{ cam: Camera; turnOf: (s: Seat) => number; tiltOf?: (s: Seat) => number; faceOf?: (s: Seat) => Face;
  shiftOf?: (s: Seat) => number; front?: React.ReactNode; dusk?: boolean }> = ({ cam, turnOf, tiltOf, faceOf, shiftOf, front, dusk }) => (
  <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<RoomBack cam={cam} dusk={dusk} />}
    actors={
      <>
        {Array.from({ length: ROWS }, (_, k) => {
          const r = ROWS - 1 - k;
          return (
            <g key={r}>
              {SEATS.filter((s) => s.r === r).map((s) => {
                const rival = s.r === RIVAL.r && s.c === RIVAL.c;
                const i = s.r * COLS + s.c;
                return (
                  <Bust key={i} x={s.x + (shiftOf?.(s) ?? 0)} y={s.y} s={s.s} head={rival ? TAEHO.head : PASTELS[(i * 3 + s.r) % PASTELS.length]}
                    coat={rival ? TAEHO.coat : COATS[i % COATS.length]} turn={turnOf(s)} tilt={tiltOf?.(s) ?? 0}
                    face={faceOf?.(s) ?? { look: (960 - s.x) / 900, mouth: "flat", lids: 0.15 + noise(i) * 0.2 }} />
                );
              })}
              <RowDesk r={r} />
            </g>
          );
        })}
        {front}
      </>
    } />
);

/** You standing at the front, your back to us (a big bust), the score sheet held up in your front hand. `lower` 0..1
 *  drops the sheet an inch; `lean` tips you sideways (degrees). */
export const YouAtFront: React.FC<{ x?: number; y?: number; s?: number; lower?: number; lean?: number; sheet?: boolean }> = ({
  x = 960, y = 1150, s = 1.9, lower = 0, lean = 0, sheet = true,
}) => (
  <g transform={`rotate(${lean} ${x} ${y + 200})`}>
    {sheet && (
      <g transform={`translate(${x + 120 * s} ${y - 150 * s + lower * 26 * s}) rotate(8) scale(${s})`}>
        <rect x={-34} y={-46} width={68} height={88} rx={4} fill="#efe6d2" stroke={INK} strokeWidth={4} />
        <circle cx={-2} cy={50} r={13} fill={MUSTARD} stroke={INK} strokeWidth={4} />
      </g>
    )}
    {sheet && <path d={`M${x + 50 * s} ${y - 20 * s} Q${x + 110 * s} ${y - 60 * s} ${x + 118 * s} ${y - 100 * s + lower * 26 * s}`} fill="none" stroke={INK} strokeWidth={26 * s} strokeLinecap="round" />}
    <Bust x={x} y={y} s={s} head={HERO.head} coat="#3b3e47" turn={1} tuft scarf={TEAL} />
  </g>
);

/** The reverse: from behind the class, three near rows of backs (dark, big), you at the front facing them with the
 *  sheet, the board behind you. `lower` drops the sheet an inch; `face` your face. */
export const ReverseShot: React.FC<{ frame: number; cam: Camera; lower: number; face: object; pose?: Pose; sit?: number }> = ({ frame, cam, lower, face, pose = STAND, sit = 0 }) => {
  const Y = 900 + sit * 70;
  const armF: [number, number] = [mix2(120, 80, lower), mix2(40, 60, lower)];
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }}
      back={
        <Deep cam={cam} depth={0.9} flat>
          <rect x={-1400} y={-800} width={4800} height={2600} fill="#efe4c8" />
          <rect x={-1400} y={820} width={4800} height={800} fill="#bfae8c" />
          <rect x={560} y={180} width={800} height={420} rx={8} fill="#9aa3ad" stroke={INK} strokeWidth={5} />
          <rect x={580} y={200} width={760} height={380} rx={6} fill="#fdfcf7" />
          <rect x={540} y={760} width={840} height={60} fill="#a87c52" stroke={INK} strokeWidth={4} />
        </Deep>
      }
      actors={
        <>
          <Figure {...HERO} x={960} y={Y} scale={1.25} facing={1} pose={{ ...pose, armF }} {...face} time={frame}
            held={<g transform="rotate(-80)"><rect x={-36} y={-46} width={72} height={92} rx={4} fill="#efe6d2" stroke={INK} strokeWidth={4} /></g>} />
          {/* the near rows: backs, big and dark, in two ranks */}
          {[0, 1].map((rank) => Array.from({ length: 7 }, (_, c) => {
            const s = rank ? 2.6 : 1.9;
            const x = 960 + (c - 3) * (rank ? 470 : 340) + (rank ? 120 : 0);
            return <Bust key={`${rank}-${c}`} x={x} y={rank ? 1300 : 1080} s={s} head={PASTELS[(c * 5 + rank) % PASTELS.length]} coat={COATS[(c + rank) % COATS.length]} turn={1} />;
          }))}
        </>
      } />
  );
};
const mix2 = (a: number, b: number, t: number) => a + (b - a) * t;

/** Your phone in your hand, close: the class group chat, then a grey line "You were removed from the group." */
export const PhoneInsert: React.FC<{ frame: number; at: number; removed: number }> = ({ frame, at, removed }) => {
  const rise = Math.min(1, Math.max(0, (frame - at) / 10));
  const r = Math.min(1, Math.max(0, (frame - removed) / 6));
  const y = 560 + (1 - rise) * 500;
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <rect x={0} y={0} width={1920} height={1080} fill="#2d2f3a" />
      <rect x={0} y={0} width={1920} height={1080} fill="#bfae8c" opacity={0.25} />
      <g transform={`translate(960 ${y}) rotate(-4)`}>
        <rect x={-250} y={-460} width={500} height={920} rx={56} fill="#1c1d24" stroke={INK} strokeWidth={8} />
        <rect x={-222} y={-420} width={444} height={840} rx={30} fill="#f3efe6" />
        <rect x={-222} y={-420} width={444} height={96} rx={30} fill={TEAL} />
        <text x={-190} y={-358} fontFamily={FONT} fontWeight={800} fontSize={34} fill={PAPER}>CLASS 4 · 98</text>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={i % 2 ? -40 : -200} y={-290 + i * 110} width={240} height={74} rx={30} fill={i % 2 ? "#cfe9e5" : PAPER} stroke={INK} strokeWidth={3} />
            <rect x={(i % 2 ? -40 : -200) + 26} y={-262 + i * 110} width={150 + noise(i) * 40} height={14} rx={7} fill={INK} opacity={0.4} />
          </g>
        ))}
        {r > 0 && (
          <g opacity={r} transform={`translate(0 ${80 + (1 - r) * 16})`}>
            <rect x={-195} y={-34} width={390} height={68} rx={34} fill="#d9d4ca" />
            <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#55524c">Removed from group</text>
          </g>
        )}
        <rect x={-200} y={290} width={400} height={70} rx={35} fill="#e4ded2" stroke="#b8b0a2" strokeWidth={3} opacity={r > 0 ? 0.4 : 1} />
      </g>
      {/* your mustard thumb on the phone's edge */}
      <g transform={`translate(${960 + 240} ${y + 330}) rotate(-20)`}>
        <rect x={-40} y={-60} width={80} height={150} rx={40} fill={MUSTARD} stroke={INK} strokeWidth={5} />
      </g>
    </svg>
  );
};

/** The board's corner: the exam countdown, chalked, D-22 rubbed out and rewritten D-21. */
export const Countdown: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const swap = frame >= at + 24;
  const rub = Math.min(1, Math.max(0, (frame - at - 10) / 12));
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <rect x={0} y={0} width={1920} height={1080} fill="#2f4a3e" />
      <rect x={0} y={0} width={1920} height={1080} fill="#000" opacity={0.08} />
      <g transform={`translate(960 ${520 - (frame - at) * 0.3}) rotate(-2)`}>
        <text x={0} y={-150} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} fill="#e9efe6" opacity={0.85} letterSpacing={6}>EXAM</text>
        <text x={0} y={140} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={300} fill="#f4f6f0">{swap ? "D-21" : "D-22"}</text>
        {!swap && rub > 0 && <rect x={-60} y={-100} width={420 * rub} height={280} rx={30} fill="#3f5a4e" opacity={0.95} />}
        <path d="M-330 200 q330 30 660 0" fill="none" stroke={CRIMSON} strokeWidth={14} strokeLinecap="round" opacity={swap ? 1 : 0} />
      </g>
    </svg>
  );
};
