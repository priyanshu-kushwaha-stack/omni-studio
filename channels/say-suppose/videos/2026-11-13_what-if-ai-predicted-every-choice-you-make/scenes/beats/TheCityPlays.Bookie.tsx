// The City Plays, the world copying your trick: the bookie's betting-shop window clattering to a line of ones (43), and
// the newsreader on the court's television over a league table of nils (45).
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { street } from "@whatif/kit/sets/Street";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { RateBoard } from "../device";
import { aimArm, headAt, type Body } from "../kit";
import { blinking, camAt, current, mix, PASTELS, ramp } from "../shared";
import { Coin, Shot, talk } from "./TheCityPlays.Parts";
import { boards, type T } from "./TheCityPlays.Times";

/** The newsreader (v2's one new role): a navy head, a dark jacket. */
export const NEWSREADER = { head: "#3d4f86", coat: "#2a2d36" } as const;

const BOOKIE = { head: PASTELS[4], coat: "#5a3b2a" } as const;
const BOOKIE_B: Body = { x: 1010, y: 900, scale: 1.3, facing: 1, pose: STAND };
const BOARD_X = 1250;
const boardY = (i: number) => 330 + i * 125;

/** Line 43: "Bet on it?": the betting shop window, the bookie behind the glass with the match on a little television,
 *  the odds board clattering to 1.00 row by row; outside, two punters with coins out, faces falling. */
export const BettingShop: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const bd = boards(k);
  const bh = headAt(BOOKIE_B.x, BOOKIE_B.y, BOOKIE_B.scale, STAND, 1);
  const on = current(frame, [[k.bet, "window"], [k.bookie, "bookie"], [k.ones - 4, "board"], [k.ones + 26, "punters"]]);
  const cams: Record<typeof on, Camera> = {
    window: camAt(frame, [[k.bet, { x: 1000, y: 580, zoom: 1.2 }], [k.bookie, { x: 1000, y: 570, zoom: 1.3 }]]),
    bookie: camAt(frame, [[k.bookie, closeUp(bh.x + 20, bh.y + 10, 2.2)], [k.ones - 4, closeUp(bh.x + 40, bh.y + 10, 2.35)]]),
    board: camAt(frame, [[k.ones - 4, { x: BOARD_X - 20, y: 520, zoom: 2.0 }], [k.ones + 26, { x: BOARD_X - 20, y: 520, zoom: 2.15 }]]),
    punters: camAt(frame, [[k.ones + 26, { x: 1000, y: 620, zoom: 1.25 }], [k.row, { x: 1000, y: 620, zoom: 1.32 }]]),
  };
  const cam = drift(cams[on], frame, "bookie", 3);
  // the bookie: eyes up on the little television, then his hand up to the board as it flips
  const flipping = frame >= k.ones - 6 && frame < k.ones + 26;
  const bPose: Pose = flipping ? { ...STAND, armF: aimArm(BOOKIE_B, { x: BOARD_X - 80, y: boardY(Math.min(3, Math.max(0, Math.floor((frame - k.ones) / 5)))) + 40 }) } : { ...STAND, armF: [60, 60] };
  const bFace = frame >= k.ones
    ? { brows: "raised" as const, lids: 0.1, mouth: "smirk" as const, eyes: 1, look: { x: 0.9, y: -0.2 } }
    : frame >= k.bookie ? { brows: "flat" as const, lids: 0.2, mouth: "smirk" as const, eyes: 1, look: { x: -0.6, y: -0.8 } }
    : { brows: "none" as const, lids: 0.3, mouth: "flat" as const, eyes: 1, look: { x: 0.8, y: 0.1 } };
  const fell = frame >= k.ones + 10;
  const punter = (x: number, facing: 1 | -1, i: number) => (
    <Figure key={i} x={x} y={1060} scale={1.5} facing={facing} pose={{ ...STAND, armF: fell ? [30, 20] : [80, 30] }} head={PASTELS[i]} coat={["#2f4a48", "#4a3b46"][i % 2]}
      brows={fell ? "raised" : "none"} lids={fell ? 0 : 0.1} mouth={fell ? "o" : "smile"} eyes={fell ? 1.25 : 1} look={{ x: 0.5, y: -0.7 }}
      blink={blinking(frame, i)} time={frame} held={<Coin x={0} y={-6} r={11} />} />
  );
  const tvKeeper = ramp(frame, k.bet + 10, k.bet + 20);
  const actors = (
    <>
      {/* the shop front and its dim inside */}
      <rect x={520} y={220} width={1000} height={720} fill="#3a2a22" stroke={INK} strokeWidth={8} />
      <rect x={560} y={260} width={920} height={600} fill="#2b3142" />
      {/* the little television in the corner of the shop, the keeper already diving left */}
      <line x1={700} y1={260} x2={700} y2={300} stroke={INK} strokeWidth={6} />
      <rect x={600} y={300} width={200} height={124} rx={8} fill="#14161f" stroke={INK} strokeWidth={5} />
      <rect x={612} y={312} width={176} height={100} fill="#4c9a5a" />
      <path d="M650 400 V340 H750 V400" fill="none" stroke={PAPER} strokeWidth={4} />
      <circle cx={mix(700, 662, tvKeeper)} cy={mix(372, 386, tvKeeper)} r={9} fill="#f2b632" stroke={INK} strokeWidth={2} />
      <Figure {...BOOKIE_B} pose={bPose} head={BOOKIE.head} coat={BOOKIE.coat} {...bFace} blink={blinking(frame, 7)} time={frame} />
      {/* the odds board */}
      <rect x={BOARD_X - 150} y={290} width={300} height={520} rx={10} fill="#14161f" stroke={INK} strokeWidth={6} />
      {bd.odds.map((keys, i) => <RateBoard key={i} frame={frame} x={BOARD_X} y={boardY(i)} size={66} keys={keys} />)}
      {/* the glass */}
      <rect x={560} y={260} width={920} height={600} fill="#cfe9f4" opacity={0.14} />
      <path d="M640 280 L760 280 L600 840 L560 840Z M820 280 L860 280 L700 840 L660 840Z" fill={PAPER} opacity={0.1} />
      <rect x={520} y={860} width={1000} height={80} fill="#2a1d18" stroke={INK} strokeWidth={6} />
      {punter(640, 1, 0)}
      {punter(1450, -1, 1)}
    </>
  );
  const options = { ...street.defaults, auto: false, crowd: true };
  return <Shot cam={cam} mood="day" lights={street.lights(options)} back={street.Back({ cam, mood: "day", frame, options })} actors={actors} />;
};

/** Line 45, drawn in REF units for the television's picture: the newsreader at her desk, deadpan, "Another nil-nil.";
 *  beside her a league table, every row 0-0, popping in one under another. */
export const News: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const nb: Body = { x: 430, y: 1000, scale: 1.7, facing: 1, pose: { ...STAND, armF: [40, 70], armB: [30, 70] } };
  const after = frame >= k.news + 34;
  const rows = [0, 1, 2, 3, 4, 5];
  const team = ["#d8344f", "#1d4f9a", "#e0b04a", "#3d9a8b", "#b06aa0", "#e07a5f"];
  return (
    <g>
      <rect x={-200} y={-200} width={2320} height={1480} fill="#1b2240" />
      <rect x={-200} y={-200} width={900} height={1480} fill="#22305a" />
      <Figure {...nb} head={NEWSREADER.head} coat={NEWSREADER.coat} brows={after ? "raised" : "flat"} lids={after ? 0.15 : 0.35}
        mouth={talk(frame, k.news + 2, k.news + 30, "flat")} eyes={1} look={after ? { x: 0.9, y: -0.1 } : { x: 0.3, y: 0.05 }} blink={blinking(frame, 3)} time={frame} />
      <rect x={140} y={760} width={680} height={24} rx={6} fill="#c9ced6" stroke={INK} strokeWidth={5} />
      <rect x={170} y={784} width={620} height={400} fill="#2f3a66" stroke={INK} strokeWidth={5} />
      {/* the league table */}
      <rect x={900} y={150} width={900} height={790} rx={14} fill="#121831" stroke={INK} strokeWidth={6} />
      {rows.map((i) => {
        const at = k.news + 2 + i * 4;
        if (frame < at) return null;
        const y = 210 + i * 122;
        const s = Math.min(1, (frame - at) / 5);
        return (
          <g key={i} transform={`translate(0 ${(1 - s) * 30})`} opacity={s}>
            <rect x={930} y={y - 6} width={840} height={100} rx={8} fill={i % 2 ? "#1b2240" : "#202a52"} />
            <circle cx={990} cy={y + 44} r={30} fill={team[i]} stroke={INK} strokeWidth={4} />
            <rect x={1045} y={y + 32} width={300} height={24} rx={12} fill={PAPER} opacity={0.35} />
            <RateBoard frame={frame} x={1610} y={y + 4} size={56} keys={[{ at: 0, value: "0-0" }]} />
          </g>
        );
      })}
    </g>
  );
};
