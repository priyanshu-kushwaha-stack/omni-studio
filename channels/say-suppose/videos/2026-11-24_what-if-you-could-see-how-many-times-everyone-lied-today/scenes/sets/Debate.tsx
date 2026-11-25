// The debate studio for "The Statement" and "Read It Aloud" (Statement.tsx, ReadItAloud.tsx), drawn for REF like the
// library sets: a navy back wall with a crimson-and-teal arc of light, the light rig, the studio monitor on the left wall
// (the other network, split), the clock on the right wall; two lecterns, the host's desk with its gooseneck microphone;
// the front row from behind in the near foreground. And the reverse: the hall seen from the stage, rows of faces, the
// press in the back rows, the doors at both sides. No library set fits a two-lectern debate. No AI images.
import { Deep, Floor, setLook } from "@whatif/kit/sets";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { runPose } from "@whatif/kit/rig/pose";
import { Figure } from "@whatif/kit/rig/Figure";
import { CRIMSON, INK, PAPER, TEAL } from "@whatif/kit/theme";
import { AudienceBacks, Fingers, Person, RIVAL, ThermalFace } from "../parts/RivalParts";
import { Counter } from "../parts/Counter";
import { blinking, mix, PASTELS, STRANGER } from "../shared";

export const D_FLOOR = 990;
export const LECTERN_TOP = 800;
export const LEADER_X = 590;
export const CHALLENGER_X = 1080;
export const DESK = { from: 1340, to: 1870, top: 772 };
export const SEAT_TOP = 830;
export const HOST_X = 1470;
export const YOU_X = 1730;
export const CLOCK = { x: 1600, y: 430, r: 56 };
export const MONITOR = { x: 130, y: 220, w: 400, h: 225 };
/** Front-row counters: the stranger (index 2) has none. */
export const FRONT = [4, 9, 0, 3, 12, 6, 2];

/** The other network on a monitor, split: the rival in his white coat with a 70, pointing at the leader's cool blue nose.
 *  Drawn in its own 1600 by 900 box from (0, 0). */
export const SplitMonitor: React.FC<{ frame: number; point?: number }> = ({ frame, point = 1 }) => (
  <g>
    <rect x={-30} y={-30} width={1660} height={960} rx={26} fill={INK} />
    <rect x={0} y={0} width={800} height={900} fill="#25305e" />
    <rect x={0} y={640} width={800} height={260} fill="#1a2248" />
    <clipPath id="split-left"><rect x={0} y={0} width={800} height={900} /></clipPath>
    <g clipPath="url(#split-left)">
      <Person id="split-rival" who={RIVAL} x={360} y={1040} scale={2.0} facing={1} frame={frame} seed={8}
        pose={{ lean: 0, tilt: -6, armB: [-7, 8], armF: [mix(20, 96, point), mix(30, -6, point)], legB: [-5, -2], legF: [6, -3], drop: 0 }}
        face={{ brows: "raised", lids: 0.4, mouth: "smirk", eyes: 1, look: { x: 1, y: 0 } }} count={{ base: 70, size: 110 }} />
    </g>
    <ThermalFace x={800} y={0} w={800} h={900} who="leader" nose="#3d7bff" frame={frame} id="split" />
    <rect x={0} y={840} width={1600} height={60} fill={CRIMSON} />
    <rect x={30} y={856} width={380} height={28} rx={14} fill={PAPER} opacity={0.85} />
    <line x1={800} y1={0} x2={800} y2={840} stroke={INK} strokeWidth={10} />
    <circle cx={1560} cy={40} r={16} fill={CRIMSON} opacity={Math.floor(frame / 15) % 2 ? 1 : 0.35} />
  </g>
);

/** The wall clock: eight o'clock plus `minutes`. */
export const Clock: React.FC<{ x: number; y: number; r: number; minutes: number }> = ({ x, y, r, minutes }) => {
  const m = (minutes / 60) * 360;
  const h = ((8 + minutes / 60) / 12) * 360;
  const hand = (deg: number, len: number, w: number) => (
    <line x1={x} y1={y} x2={x + Math.sin((deg * Math.PI) / 180) * len} y2={y - Math.cos((deg * Math.PI) / 180) * len} stroke={INK} strokeWidth={w} strokeLinecap="round" />
  );
  return (
    <g>
      <circle cx={x} cy={y} r={r + 8} fill="#c9ced6" stroke={INK} strokeWidth={5} />
      <circle cx={x} cy={y} r={r} fill={PAPER} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={x + Math.sin(a) * r * 0.8} y1={y - Math.cos(a) * r * 0.8} x2={x + Math.sin(a) * r * 0.93} y2={y - Math.cos(a) * r * 0.93} stroke={INK} strokeWidth={i % 3 ? 2 : 5} />;
      })}
      {hand(h, r * 0.5, 7)}
      {hand(m, r * 0.78, 4)}
      <circle cx={x} cy={y} r={5} fill={CRIMSON} />
    </g>
  );
};

const Back: React.FC<{ cam: Camera; mood: MoodName; frame: number; minutes: number }> = ({ cam, frame, minutes }) => (
  <>
    <Deep cam={cam} depth={0.7} flat>
      <rect x={-1400} y={-800} width={4800} height={2400} fill="#151a3c" />
      {Array.from({ length: 18 }, (_, i) => <rect key={i} x={-1300 + i * 280} y={-800} width={120} height={2400} fill="#1b2147" />)}
      <path d="M260 980 A570 570 0 0 1 1400 980" fill="none" stroke={CRIMSON} strokeWidth={26} opacity={0.9} />
      <path d="M330 980 A500 500 0 0 1 1330 980" fill="none" stroke={TEAL} strokeWidth={14} opacity={0.8} />
      {Array.from({ length: 13 }, (_, i) => {
        const a = Math.PI + (i / 12) * Math.PI;
        return <circle key={i} cx={830 + Math.cos(a) * 610} cy={980 + Math.sin(a) * 610} r={9} fill="#fff6d0" opacity={0.5 + 0.5 * Math.sin(frame / 10 + i)} />;
      })}
      <rect x={-1400} y={40} width={4800} height={24} fill="#3b3e47" />
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i}>
          <path d={`M${-930 + i * 360} 64 h60 l12 50 h-84Z`} fill="#5c6675" />
          <ellipse cx={-900 + i * 360} cy={114} rx={36} ry={8} fill="#fff6d0" />
        </g>
      ))}
    </Deep>
    <Deep cam={cam} depth={0.85}>
      <g transform={`translate(${MONITOR.x} ${MONITOR.y}) scale(${MONITOR.w / 1600})`}><SplitMonitor frame={frame} /></g>
      <line x1={MONITOR.x + MONITOR.w / 2} y1={MONITOR.y - 8} x2={MONITOR.x + MONITOR.w / 2} y2={-200} stroke="#3b3e47" strokeWidth={8} />
      <Clock x={CLOCK.x} y={CLOCK.y} r={CLOCK.r} minutes={minutes} />
    </Deep>
    <Deep cam={cam} depth={1}>
      <Floor y={D_FLOOR - 30} fill="#262c52" gap={220} slant={-90} />
      <rect x={-1400} y={D_FLOOR - 30} width={4800} height={14} fill="#3d4a7a" />
      <ellipse cx={830} cy={D_FLOOR + 10} rx={700} ry={60} fill="#3d4a7a" opacity={0.5} />
    </Deep>
  </>
);

const Lectern: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <path d={`M${x - 90} ${LECTERN_TOP + 14} L${x + 90} ${LECTERN_TOP + 14} L${x + 70} ${D_FLOOR - 30} L${x - 70} ${D_FLOOR - 30}Z`} fill="#e8eef0" stroke={INK} strokeWidth={6} />
    <rect x={x - 80} y={LECTERN_TOP + 60} width={160} height={30} fill={CRIMSON} />
    <circle cx={x} cy={LECTERN_TOP + 140} r={26} fill="none" stroke={TEAL} strokeWidth={6} />
    <path d={`M${x - 104} ${LECTERN_TOP + 18} L${x + 104} ${LECTERN_TOP + 18} L${x + 90} ${LECTERN_TOP - 6} L${x - 90} ${LECTERN_TOP - 6}Z`} fill="#c9ced6" stroke={INK} strokeWidth={5} />
  </g>
);

/** The lecterns and the host's desk, drawn over the people standing and sitting behind them. `mic` is the gooseneck's x. */
export const DebateMid: React.FC<{ mic: number; card?: { x: number; scrawl: number } }> = ({ mic, card }) => (
  <g>
    <Lectern x={LEADER_X + 50} />
    <Lectern x={CHALLENGER_X - 50} />
    <path d={`M${DESK.from} ${DESK.top} H${DESK.to} L${DESK.to - 30} ${D_FLOOR - 30} H${DESK.from + 30}Z`} fill="#e8eef0" stroke={INK} strokeWidth={6} />
    <rect x={DESK.from + 20} y={DESK.top + 50} width={DESK.to - DESK.from - 40} height={34} fill={CRIMSON} />
    <rect x={DESK.from - 10} y={DESK.top - 16} width={DESK.to - DESK.from + 20} height={20} rx={6} fill="#c9ced6" stroke={INK} strokeWidth={4} />
    <g>
      <rect x={mic - 22} y={DESK.top - 26} width={44} height={12} rx={4} fill="#2a2d36" />
      <path d={`M${mic} ${DESK.top - 22} Q${mic} ${DESK.top - 90} ${mic - 30} ${DESK.top - 112}`} fill="none" stroke="#2a2d36" strokeWidth={6} />
      <ellipse cx={mic - 36} cy={DESK.top - 118} rx={13} ry={18} fill="#5c6675" stroke={INK} strokeWidth={3} transform={`rotate(-40 ${mic - 36} ${DESK.top - 118})`} />
    </g>
    {card && (
      <g transform={`translate(${card.x} ${DESK.top - 18})`}>
        <rect x={-34} y={-10} width={68} height={12} rx={2} fill="#fffaf0" stroke={INK} strokeWidth={3} />
        <rect x={-26} y={-7} width={52 * card.scrawl} height={4} rx={2} fill={INK} opacity={0.6} />
      </g>
    )}
  </g>
);

/** The debate studio on a Stage: `actors` are drawn behind the lecterns and the desk (their legs hidden), `over` in
 *  front of them; the front row from behind in the near foreground. */
export const DebateStage: React.FC<{
  cam: Camera; mood: MoodName; frame: number; minutes: number; mic: number; card?: { x: number; scrawl: number };
  actors: React.ReactNode; over?: React.ReactNode; laugh?: number; empty?: boolean; frontRow?: boolean;
}> = ({ cam, mood, frame, minutes, mic, card, actors, over, laugh = 0, empty, frontRow = true }) => (
  <LookContext.Provider value={setLook([{ x: 830, y: 700, depth: 0.7, r: 620, color: "#9fb7ff", strength: 0.22, moods: ["night", "lamp", "dusk", "day", "morning", "frozen"] }], mood, cam)}>
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
      back={<Back cam={cam} mood={mood} frame={frame} minutes={minutes} />}
      actors={<>{actors}<DebateMid mic={mic} card={card} />{over}</>}
      front={frontRow ? (
        <Deep cam={cam} depth={1.25}>
          <AudienceBacks from={110} to={1290} y={1100} n={7} frame={frame} laugh={laugh} counts={FRONT} stranger={empty ? -1 : 2} empty={empty ? [2] : []}
            seed={11} r={58} counterSize={36} />
        </Deep>
      ) : undefined} />
  </LookContext.Provider>
);

/** A face in the audience seen from the stage: head, eyes looking up, shoulders; a counter over it unless `none`. */
const Bust: React.FC<{ x: number; y: number; r: number; head: string; coat: string; frame: number; seed: number; look: number; count: number | null;
  fingers?: number; phone?: boolean; mouth?: "flat" | "o" | "smile"; id: string }> = ({ x, y, r, head, coat, frame, seed, look, count, fingers, phone, mouth = "flat", id }) => {
  const blink = blinking(frame, seed);
  return (
    <g>
      <path d={`M${x - r * 1.6} ${y + r * 3} Q${x - r * 1.5} ${y + r * 0.9} ${x} ${y + r * 0.85} Q${x + r * 1.5} ${y + r * 0.9} ${x + r * 1.6} ${y + r * 3}Z`} fill={coat} stroke={INK} strokeWidth={4} />
      <circle cx={x} cy={y} r={r} fill={head} stroke={INK} strokeWidth={3} />
      {[-0.32, 0.32].map((dx) => <ellipse key={dx} cx={x + dx * r + look * r * 0.08} cy={y - r * 0.12 - r * 0.12} rx={r * 0.13} ry={blink ? r * 0.03 : r * 0.19} fill={INK} />)}
      {mouth === "o" ? <ellipse cx={x} cy={y + r * 0.42} rx={r * 0.13} ry={r * 0.17} fill={INK} />
        : <path d={mouth === "smile" ? `M${x - r * 0.25} ${y + r * 0.38} Q${x} ${y + r * 0.58} ${x + r * 0.25} ${y + r * 0.38}` : `M${x - r * 0.2} ${y + r * 0.45} H${x + r * 0.2}`}
          fill="none" stroke={INK} strokeWidth={r * 0.08} strokeLinecap="round" />}
      {fingers !== undefined && <g transform={`translate(${x + r * 1.15} ${y + r * 0.9}) scale(${r / 40})`}><Fingers n={fingers} color={head} tilt={10} /></g>}
      {phone && <g transform={`translate(${x - r * 1.1} ${y + r * 0.7})`}><rect x={-r * 0.3} y={-r * 0.55} width={r * 0.6} height={r} rx={r * 0.1} fill="#1b1d24" /><rect x={-r * 0.22} y={-r * 0.46} width={r * 0.44} height={r * 0.8} fill="#cfe9f4" /></g>}
      {count !== null && <Counter x={x} y={y - r - r * 0.62} base={count} frame={frame} size={r * 0.62} id={id} />}
    </g>
  );
};

/** The reverse: the hall from the stage. The press in the two back rows (they run for the doors from `run`), the front
 *  row with the stranger (index 3) counting on their fingers (`fingers`), or their seat empty. World REF coordinates. */
export const HallShot: React.FC<{ cam: Camera; mood: MoodName; frame: number; fingers?: number; strangerGone?: boolean; run?: number }> = ({
  cam, mood, frame, fingers, strangerGone, run,
}) => {
  const press = Array.from({ length: 12 }, (_, i) => ({ row: i < 6 ? 0 : 1, k: i % 6 }));
  const running = run !== undefined && frame >= run;
  return (
    <LookContext.Provider value={setLook([{ x: 960, y: 200, depth: 0.7, r: 700, color: "#fff2cc", strength: 0.2, moods: ["night", "lamp", "dusk", "day", "morning", "frozen"] }], mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={
          <Deep cam={cam} depth={0.8} flat>
            <rect x={-1400} y={-800} width={4800} height={2400} fill="#1a1e3a" />
            {[0, 1, 2].map((t) => <rect key={t} x={-1400} y={430 + t * 180} width={4800} height={40} fill="#2a2f52" />)}
            {[60, 1700].map((dx) => (
              <g key={dx}>
                <rect x={dx} y={300} width={180} height={420} rx={6} fill="#3a2c2a" stroke={INK} strokeWidth={6} />
                <rect x={dx + 50} y={250} width={80} height={34} rx={6} fill="#3fbf6a" />
                <circle cx={dx + 150} cy={520} r={9} fill="#c9a24a" />
              </g>
            ))}
          </Deep>
        }
        actors={
          <>
            {press.map(({ row, k }, i) => {
              const x = 470 + k * 196 + row * 98;
              const y = 360 + row * 170;
              const r = 34 + row * 6;
              if (running) {
                const door = x < 960 ? 150 : 1790;
                const t = Math.min(1, (frame - run - (i % 4) * 3) / 40);
                if (t >= 1) return null;
                const px = mix(x, door, Math.max(0, t));
                return <Figure key={i} x={px} y={y + r * 3} scale={0.5 + row * 0.08} facing={door < x ? -1 : 1} pose={runPose(frame * 0.6 + i)}
                  head={PASTELS[(i + 2) % 8]} coat="#3d4250" brows="raised" eyes={1.1} mouth="o" blink={false} time={frame} />;
              }
              return <Bust key={i} x={x} y={y} r={r} head={PASTELS[(i + 2) % 8]} coat={i % 3 ? "#3d4250" : "#5a4a3a"} frame={frame} seed={i} look={1}
                count={(i * 5) % 9} phone={i % 2 === 0} id={`press-${i}`} />;
            })}
            {Array.from({ length: 7 }, (_, k) => {
              const x = 260 + k * 233;
              const y = 760;
              const isStranger = k === 3;
              return (
                <g key={k}>
                  <rect x={x - 90} y={y + 30} width={180} height={220} rx={20} fill="#7a2232" stroke={INK} strokeWidth={5} />
                  {isStranger
                    ? !strangerGone && <Bust x={x} y={y} r={66} head={STRANGER.head} coat={STRANGER.coat} frame={frame} seed={9} look={0.4} count={null}
                      fingers={fingers} id="hall-stranger" />
                    : <Bust x={x} y={y} r={62} head={PASTELS[k % 8]} coat="#2f3242" frame={frame} seed={k + 3} look={0.6} count={FRONT[k]}
                      mouth={running ? "o" : "flat"} id={`front-${k}`} />}
                </g>
              );
            })}
          </>
        } />
    </LookContext.Provider>
  );
};
