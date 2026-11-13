// Seven Years a Week's inside cuts and paper inserts: the wok on fire in the inside town, the library where you fall
// asleep on a stack, the two blackboards of made-up alphabets (squiggles, no real letters; on the kit classroom), the
// seven nights of counters, the four paper flags and the tape of class hours, the drawer of cards, the price card.
import { SEATED, seatedY, STAND, type Pose } from "@whatif/kit/rig/pose";
import { classroom } from "@whatif/kit/sets/Classroom";
import { Deep, setLook } from "@whatif/kit/sets/common";
import { FONT } from "@whatif/kit/fonts";
import { LookContext } from "@whatif/kit/stage/Look";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Counter, Sheet } from "../parts";
import { BOSS, linear, mix, noise, ramp } from "../shared";
import { aimArm, BigHand, Person, type Body } from "./TellMeTomorrow.Kit";
import { TownStage } from "./Piano.Town";

const STREET = 910;

/** The wok on fire at a street stall in the inside town; you toss it, flames leap. */
export const WokCut: React.FC<{ frame: number; cam: Camera }> = ({ frame, cam }) => {
  const toss = Math.sin(frame / 4);
  const wok = { x: 1000, y: 700 - Math.max(0, toss) * 30 };
  const you: Body = { x: 840, y: STREET, scale: 1.15, facing: 1, pose: STAND };
  const pose: Pose = { ...STAND, lean: 6, armF: aimArm({ ...you, pose: { ...STAND, lean: 6 } }, { x: wok.x - 70, y: wok.y }), armB: [40, 70] };
  return (
    <TownStage frame={frame} cam={cam} mood="day" actors={
      <>
        <Person who="you" b={{ ...you, pose }} face={{ brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.7, y: 0.3 } }} frame={frame} coat={PAPER} />
        <rect x={900} y={760} width={260} height={STREET - 760} fill="#5c6470" stroke={INK} strokeWidth={6} />
        <rect x={890} y={744} width={280} height={22} rx={6} fill="#3b3e47" stroke={INK} strokeWidth={5} />
        {[0, 1, 2, 3, 4].map((k) => {
          const h = 60 + noise(Math.floor(frame / 2) + k * 9) * 110;
          return <path key={k} d={`M${wok.x - 60 + k * 30} ${wok.y} q${-14 + k * 4} ${-h * 0.5} ${8} ${-h} q${10} ${h * 0.5} ${12} ${h}Z`} fill={k % 2 ? "#ffb23a" : CRIMSON} opacity={0.9} />;
        })}
        <path d={`M${wok.x - 80} ${wok.y} Q${wok.x} ${wok.y + 60} ${wok.x + 80} ${wok.y}Z`} fill={INK} />
        <line x1={wok.x - 80} y1={wok.y} x2={wok.x - 150} y2={wok.y - 10} stroke={INK} strokeWidth={12} strokeLinecap="round" />
      </>
    } />
  );
};

/** The inside town's library: shelves floor to ceiling, a lamp, you asleep with your head on a stack of books. */
export const LibraryCut: React.FC<{ frame: number; cam: Camera }> = ({ frame, cam }) => {
  const s = 1.15;
  const seat = 820;
  const b: Body = { x: 860, y: seatedY(seat, s), scale: s, facing: 1, pose: { ...SEATED, lean: 52 + Math.sin(frame / 20) * 2, tilt: 20, armF: [100, 40], armB: [80, 50] } };
  const look = setLook([{ x: 1150, y: 600, r: 420, color: "#ffd98a", strength: 0.5, moods: ["lamp"] }], "lamp", cam);
  return (
    <LookContext.Provider value={look}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={
          <g>
            <rect x={-1400} y={-900} width={4700} height={2900} fill="#5a3e30" />
            {Array.from({ length: 6 }, (_, r) => Array.from({ length: 14 }, (_, c) => {
              const x = -260 + c * 180;
              return (
                <g key={`${r}-${c}`}>
                  <rect x={x} y={60 + r * 150} width={170} height={12} fill="#3a2a20" />
                  {Array.from({ length: 7 }, (_, k) => (
                    <rect key={k} x={x + 6 + k * 23} y={60 + r * 150 - 90 - noise(r * 99 + c * 7 + k) * 30} width={20} height={90 + noise(r * 99 + c * 7 + k) * 30}
                      fill={["#d8344f", "#1d9a8f", "#f2b632", "#7fa0c4", "#c9a0d6", "#e3c39a"][(r + c + k) % 6]} stroke={INK} strokeWidth={2} />
                  ))}
                </g>
              );
            }))}
            <rect x={-1400} y={940} width={4700} height={900} fill="#3a2a20" />
          </g>
        }
        actors={
          <>
            <rect x={760} y={seat} width={160} height={20} rx={5} fill="#6b4b3a" stroke={INK} strokeWidth={4} />
            <Person who="you" b={b} face={{ brows: "none", lids: 1, mouth: "o", look: { x: 0, y: 0.5 } }} frame={frame} />
            <rect x={950} y={800} width={460} height={22} rx={6} fill="#8a6a4f" stroke={INK} strokeWidth={5} />
            <rect x={980} y={822} width={16} height={130} fill="#6b4b3a" /><rect x={1370} y={822} width={16} height={130} fill="#6b4b3a" />
            {Array.from({ length: 6 }, (_, k) => (
              <rect key={k} x={1050 + (k % 2) * 10} y={782 - k * 22} width={150 - k * 6} height={20} rx={3} fill={["#d8344f", TEAL, MUSTARD, "#7fa0c4"][k % 4]} stroke={INK} strokeWidth={3} />
            ))}
            <line x1={1300} y1={800} x2={1300} y2={640} stroke={INK} strokeWidth={8} />
            <path d="M1250 650 L1350 650 L1330 610 L1270 610Z" fill="#ffd27a" stroke={INK} strokeWidth={5} />
            <text x={1020} y={620 - ((frame * 2) % 60)} fontFamily={FONT} fontWeight={800} fontSize={44} fill={PAPER} opacity={0.7}>z</text>
          </>
        } />
    </LookContext.Provider>
  );
};

/** A made-up alphabet: rows of chalk squiggles drawn on as `drawn` goes 0..1. `kind` 0 is loops, 1 is angles. */
const Squiggles: React.FC<{ kind: 0 | 1; drawn: number; x: number; y: number; color: string }> = ({ kind, drawn, x, y, color }) => {
  const glyphs = 24;
  const shown = Math.floor(glyphs * drawn);
  return (
    <g>
      {Array.from({ length: shown }, (_, i) => {
        const gx = x + (i % 8) * 70, gy = y + Math.floor(i / 8) * 100;
        const a = noise(i + kind * 50), b = noise(i + kind * 50 + 17);
        // invented glyphs: each a different hook, loop or zigzag from noise, so no two repeat and none is a real letter
        const c = noise(i * 3 + kind * 71);
        const d = kind === 0
          ? `M${gx} ${gy + 30} q${10 + a * 30} ${-40 - b * 20} ${20 + c * 20} ${-6} t${10 + b * 20} ${14 - c * 20} ${c > 0.5 ? `m${-8} ${-30} l${4} ${-6}` : `q${-6} ${24} ${-24} ${18}`}`
          : `M${gx} ${gy + 10 + c * 20} l${10 + a * 20} ${30 - b * 20} l${-6 + c * 20} ${-36 + a * 10} l${8 + b * 14} ${24 + c * 16}${a > 0.5 ? ` m${-20} ${-40} h${12 + c * 10}` : ` m${-4} ${10} l${10} ${12}`}`;
        return <path key={i} d={d} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />;
      })}
    </g>
  );
};

/** The kit classroom with its board turned blackboard: you at it, chalk in hand, writing a made-up alphabet. */
export const BoardCut: React.FC<{ frame: number; cam: Camera; kind: 0 | 1; from: number; until: number }> = ({ frame, cam, kind, from, until }) => {
  const options = { ...classroom.defaults, board: "blank" as const, farRow: true };
  const props = { cam, mood: "day" as const, frame, options };
  const drawn = linear(frame, from, until);
  const i = Math.floor(24 * drawn);
  const target = { x: 1330 + (i % 8) * 70 * 0.92 + 30, y: 230 + Math.floor(i / 8) * 100 * 0.92 + 20 };
  const you: Body = { x: 1190, y: 900, scale: 1.15, facing: 1, pose: STAND };
  const reachPose = { ...STAND, lean: -4 };
  const pose: Pose = { ...reachPose, armF: aimArm({ ...you, pose: reachPose }, { x: Math.min(target.x, 1330), y: Math.max(target.y + 160, 560) + Math.sin(frame / 2) * 6 }), armB: [10, 20] };
  return (
    <LookContext.Provider value={setLook(classroom.lights(options), "day", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={classroom.Back(props)}
        actors={
          <>
            <Deep cam={cam} depth={0.92}>
              <rect x={1300} y={180} width={620} height={360} rx={6} fill={kind === 0 ? "#2f4a3a" : "#24262c"} />
              <Squiggles kind={kind} drawn={drawn} x={1340} y={220} color={kind === 0 ? PAPER : "#bfe0f0"} />
            </Deep>
            <Person who="you" b={{ ...you, pose }} face={{ brows: "angry", lids: 0.2, mouth: "flat", look: { x: 0.7, y: -0.6 } }} frame={frame} />
          </>
        } />
    </LookContext.Provider>
  );
};

/** Seven nights: seven counters stamp onto a paper sheet, one by one, each on 365. */
export const SevenSheet: React.FC<{ frame: number; at: number; until: number }> = ({ frame, at: from, until }) => {
  const step = Math.max(6, Math.round((until - from - 30) / 7));
  return (
    <Sheet frame={frame} at={from} until={until} x={960} y={600} w={1500} h={380} tilt={-1}>
      {Array.from({ length: 7 }, (_, i) => {
        const t = from + 10 + i * step;
        if (frame < t) return null;
        const s = mix(1.4, 1, ramp(frame, t, t + 5));
        return <g key={i} transform={`translate(${130 + i * 205} 190) scale(${s})`}><Counter frame={frame} x={0} y={0} tile={52} value="365" /></g>;
      })}
    </Sheet>
  );
};

/** Four paper flags (made-up colours and shapes, no country's), stacked; a tape of class hours unrolls beside them
 *  with 2,200 on its end. `ticks` bounces each flag in turn. */
export const FlagsSheet: React.FC<{ frame: number; at: number; until: number; tape: number; ticks: number }> = ({ frame, at: from, until, tape, ticks }) => {
  const flags = [[TEAL, MUSTARD], [CRIMSON, PAPER], ["#7fa0c4", INK], ["#5aa04a", "#c9a0d6"]];
  const unroll = ramp(frame, tape, tape + 40);
  return (
    <Sheet frame={frame} at={from} until={until} x={960} y={540} w={1400} h={720} tilt={1.5}>
      {flags.map(([a, b], i) => {
        const shown = frame >= from + 6 + i * 6;
        const bounce = frame >= ticks + i * 8 ? Math.sin(Math.min(1, (frame - ticks - i * 8) / 8) * Math.PI) * 24 : 0;
        return shown ? (
          <g key={i} transform={`translate(${120 + i * 26} ${430 - i * 110 - bounce}) rotate(${-4 + i * 3})`}>
            <rect width={300} height={180} rx={6} fill={a} stroke={INK} strokeWidth={5} />
            {i % 2 ? <circle cx={150} cy={90} r={50} fill={b} /> : <rect x={0} y={60} width={300} height={60} fill={b} />}
          </g>
        ) : null;
      })}
      {frame >= tape && (
        <g transform="translate(560 330)">
          <circle cx={0} cy={0} r={80} fill={MUSTARD} stroke={INK} strokeWidth={6} />
          <circle cx={0} cy={0} r={22} fill={INK} />
          <rect x={0} y={40} width={720 * unroll} height={70} fill="#f6d36b" stroke={INK} strokeWidth={5} />
          {Array.from({ length: Math.floor(36 * unroll) }, (_, i) => <line key={i} x1={20 + i * 20} y1={40} x2={20 + i * 20} y2={i % 5 ? 62 : 80} stroke={INK} strokeWidth={3} />)}
          {unroll > 0.9 && <text x={500} y={200} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={110} fill={CRIMSON}>2,200</text>}
        </g>
      )}
    </Sheet>
  );
};

/** The drawer of cards (c14, c13): a new card drops in at the front, every card shuffles back one, and the oldest
 *  slides out the back and falls (`swap` frames start each swap). From `pile`, a tall stack of new cards drops onto
 *  the one old card left, which flattens. */
export const DrawerSheet: React.FC<{ frame: number; at: number; until: number; swaps: number[]; pile: number }> = ({ frame, at: from, until, swaps, pile }) => {
  const done = swaps.filter((s) => frame >= s + 16).length;
  const live = swaps.find((s) => frame >= s && frame < s + 16);
  const p = live === undefined ? 0 : linear(frame, live, live + 16);
  const piling = frame >= pile;
  const drop = ramp(frame, pile, pile + 14);
  return (
    <Sheet frame={frame} at={from} until={until} x={960} y={540} w={1400} h={740} tilt={-1}>
      {!piling && (
        <g>
          <rect x={200} y={300} width={1000} height={300} fill="#8a5c3b" stroke={INK} strokeWidth={8} />
          <rect x={180} y={580} width={1040} height={50} rx={6} fill="#6b4630" stroke={INK} strokeWidth={6} />
          {Array.from({ length: 9 }, (_, i) => {
            const x = 260 + (i + p) * 100;
            const old = i === 8;
            const fall = old ? p : 0;
            return (
              <g key={`${done}-${i}`} transform={`translate(${x + fall * 120} ${200 + fall * fall * 400}) rotate(${fall * 60})`}>
                <rect x={0} y={0} width={70} height={240} rx={6} fill={old ? "#e9dcc2" : PAPER} stroke={INK} strokeWidth={4} />
                {[0, 1, 2].map((k) => <rect key={k} x={12} y={30 + k * 30} width={46 - k * 10} height={8} rx={3} fill={INK} opacity={0.6} />)}
              </g>
            );
          })}
          {live !== undefined && (
            <g transform={`translate(260 ${mix(-80, 200, p)})`}>
              <rect x={0} y={0} width={70} height={240} rx={6} fill="#fff6dc" stroke={MUSTARD} strokeWidth={6} />
            </g>
          )}
        </g>
      )}
      {piling && (
        <g>
          <rect x={560} y={mix(640, 660, drop)} width={280} height={mix(40, 14, drop)} rx={4} fill="#e9dcc2" stroke={INK} strokeWidth={4} />
          {Array.from({ length: 20 }, (_, i) => (
            <rect key={i} x={560 + noise(i) * 20 - 10} y={mix(-700, 640, drop) - 14 - i * 28} width={280} height={24} rx={3} fill={i % 2 ? "#fff6dc" : PAPER} stroke={INK} strokeWidth={3} />
          ))}
        </g>
      )}
    </Sheet>
  );
};

/** The price card in the boss's hand: one coin, crossed out at `cross`; three coins drawn from `three`. */
export const PriceCard: React.FC<{ frame: number; cross: number; three: number }> = ({ frame, cross, three }) => {
  const c = ramp(frame, cross, cross + 8);
  return (
    <g>
      <rect width={1920} height={1080} fill="#2a2420" />
      <g transform="translate(960 520) rotate(-3)">
        <rect x={-460} y={-260} width={920} height={520} rx={16} fill="#000" opacity={0.35} transform="translate(16 20)" />
        <rect x={-460} y={-260} width={920} height={520} rx={16} fill={PAPER} stroke={INK} strokeWidth={8} />
        <circle cx={-260} cy={-60} r={80} fill={MUSTARD} stroke={INK} strokeWidth={6} />
        <line x1={-360} y1={40} x2={mix(-360, -160, c)} y2={mix(40, -160, c)} stroke={CRIMSON} strokeWidth={18} strokeLinecap="round" />
        {[0, 1, 2].map((k) => frame >= three + k * 5 ? (
          <circle key={k} cx={20 + k * 150} cy={-60} r={70 * ramp(frame, three + k * 5, three + k * 5 + 5)} fill={MUSTARD} stroke={INK} strokeWidth={6} />
        ) : null)}
        <rect x={-380} y={120} width={500} height={24} rx={8} fill={INK} opacity={0.7} />
        <rect x={-380} y={170} width={320} height={24} rx={8} fill={INK} opacity={0.5} />
      </g>
      <BigHand from={{ x: 1900, y: 1180 }} x={mix(1500, 1300, c)} y={mix(780, 640, c)} r={70} skin={BOSS.head} sleeve="#3b3f4a" />
    </g>
  );
};
