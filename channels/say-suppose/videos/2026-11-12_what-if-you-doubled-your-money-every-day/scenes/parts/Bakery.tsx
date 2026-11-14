// Lotte's bakery counter, the film's home set, in screen pixels: the city behind you through the door (the library's
// `citySkyline.Back`), the tiled wall, bread rack, pretzel sign, the framed 1923 note, the chalkboard and the counter.
// One component for every counter shot: the thumbnail's layout (the owner's look-test pick, "A, the thumbnail"), a
// medium three-shot, and close framings on Lotte or the board, cut from the same drawing.
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { LookContext } from "@whatif/kit/stage/Look";
import { citySkyline } from "@whatif/kit/sets";
import { FRIEND } from "@whatif/kit/sets/cast";
import { setLook } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import { FONT } from "@whatif/kit/fonts";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { useTalk } from "./cast";
import { handAt, mix, Phone, Push, ramp, Tile, type ShotTime } from "./util";

const CAM: Camera = { x: 1150, y: 670, zoom: 2 };
export const COUNTER_TOP = 820;
const BALANCE_DIGITS = "1073741824";
export const LOTTE = { head: "#f0a98e", coat: "#efe9dc" } as const;
const OFFER: Pose = { ...STAND, lean: -6, tilt: -10, armF: [100, 70], armB: [-10, 12] };
const LOTTE_POSES: Record<string, Pose> = {
  chalk: OFFER,
  rest: { ...STAND, armF: [30, 20], armB: [-10, 12] },
  slide: { ...STAND, lean: -8, armF: [80, 10], armB: [-10, 12] },
  palm: { ...STAND, lean: -4, armF: [75, -5], armB: [-10, 12] },
  write: { ...STAND, tilt: 6, armF: [150, 40], armB: [-10, 12] },
  // v5: the savings book held low at the chest, read (the outside review: held overhead it read as a brick).
  read: { ...STAND, tilt: 12, armF: [60, 40], armB: [-10, 12] },
};
const YOU_POSES: Record<string, Pose> = {
  phoneUp: { ...STAND, lean: -3, tilt: -5, armF: [70, 62], armB: [-12, 14] },
  hold: { ...STAND, armF: [40, 50], armB: [-12, 14] },
  rest: { ...STAND, armF: [15, 10], armB: [-12, 14] },
  give: { ...STAND, lean: -4, armF: [80, 10], armB: [-12, 14] },
  ear: { ...STAND, tilt: 4, armF: [150, 140], armB: [-12, 14] },
};

export interface CounterProps {
  mood: MoodName;
  layout?: "thumb" | "medium" | "lotte" | "board" | "note";
  board?: string | string[];
  balance?: string[] | null;
  phone?: "up" | "down" | "none" | "ear";
  spill?: number;
  floor?: boolean;
  /** Split-flap tiles peeling off the phone's glass and dropping by the basket (day two: the 0 and the 2). */
  flaps?: string[];
  /** The card reader on the counter (the opening): idle, or flashing red DECLINED from frame 28. */
  reader?: "idle" | "declined";
  you?: { face?: keyof typeof EXPRESSIONS; pose?: keyof typeof YOU_POSES; look?: { x: number; y: number } };
  lotte?: { face?: keyof typeof EXPRESSIONS; pose?: keyof typeof LOTTE_POSES; held?: "chalk" | "roll" | "coin" | "book" | null } | null;
  jonas?: { face?: keyof typeof EXPRESSIONS; held?: "coins" | "note" | "roll" | null } | null;
  props?: ("deed" | "envelope" | "sacks" | "chess" | "coins" | "book")[];
  lamp?: boolean;
  dark?: number;
}

const Chalk: React.FC = () => <rect x={-4} y={-26} width={8} height={30} rx={3} fill={PAPER} stroke={INK} strokeWidth={2.5} transform="rotate(-20)" />;
const Roll: React.FC = () => <ellipse cx={0} cy={-6} rx={18} ry={11} fill="#d89a58" stroke={INK} strokeWidth={3} />;
const Coin: React.FC = () => <circle cx={0} cy={-6} r={7} fill={MUSTARD} stroke={INK} strokeWidth={2.5} />;
const Note: React.FC = () => <rect x={-16} y={-14} width={32} height={18} rx={2} fill="#9fc0a0" stroke={INK} strokeWidth={2.5} />;
const Book: React.FC = () => <rect x={-14} y={-20} width={28} height={22} rx={2} fill="#7a4a3a" stroke={INK} strokeWidth={2.5} />;
const HELD = { chalk: <Chalk />, roll: <Roll />, coin: <Coin />, note: <Note />, book: <Book />, coins: <Coin /> } as const;

/** The bakery behind Lotte: tiles, the framed note, the chalkboard, the rack, the pretzel sign, the lamp. */
const Wall: React.FC<{ board: string; lamp: boolean }> = ({ board, lamp }) => (
  <g>
    <rect x={980} y={0} width={940} height={COUNTER_TOP + 10} fill="#d9cfb4" />
    {Array.from({ length: 12 }, (_, i) => <line key={`h${i}`} x1={980} y1={i * 72} x2={1920} y2={i * 72} stroke="#b9ae92" strokeWidth={3} />)}
    {Array.from({ length: 14 }, (_, i) => <line key={`v${i}`} x1={980 + i * 72} y1={0} x2={980 + i * 72} y2={COUNTER_TOP} stroke="#b9ae92" strokeWidth={3} />)}
    <rect x={960} y={0} width={30} height={COUNTER_TOP + 10} fill="#5a4030" stroke={INK} strokeWidth={5} />
    <g transform="translate(1440 120)">
      <rect x={0} y={0} width={420} height={250} rx={10} fill="#22302a" stroke="#7a5a3a" strokeWidth={14} />
      <text x={40} y={100} fontFamily={FONT} fontWeight={700} fontSize={58} fill="#efe9dc" opacity={0.85}>Brötchen</text>
      <text x={380} y={205} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={84} fill="#efe9dc">{board}</text>
    </g>
    <g transform="translate(1100 300)">
      <rect x={0} y={0} width={190} height={110} fill="#6b4a32" stroke={INK} strokeWidth={6} />
      <rect x={14} y={14} width={162} height={82} fill="#c9b98f" />
      <text x={95} y={66} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={16} fill="#5a4a2a">50 000 000 Mark</text>
    </g>
    <g transform="translate(1700 470)">
      {[0, 1, 2].map((r) => <rect key={r} x={-170} y={r * 100} width={360} height={14} fill="#6b4a32" stroke={INK} strokeWidth={4} />)}
      {[0, 1, 2].map((r) => [0, 1, 2, 3].map((k) => <ellipse key={`${r}-${k}`} cx={-130 + k * 88} cy={r * 100 - 24} rx={40} ry={26} fill="#c98a4a" stroke={INK} strokeWidth={4} />))}
    </g>
    <g transform="translate(1260 90)">
      <line x1={0} y1={-90} x2={0} y2={-10} stroke={INK} strokeWidth={5} />
      <path d="M-70 40 C-90 -20 -20 -40 0 10 C20 -40 90 -20 70 40 C55 80 -55 80 -70 40Z M-30 30 L30 30" fill="#c98a4a" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    </g>
    <line x1={1160} y1={0} x2={1160} y2={40} stroke={INK} strokeWidth={4} />
    <circle cx={1160} cy={58} r={22} fill={lamp ? "#fff1c8" : "#5a5648"} stroke={INK} strokeWidth={4} />
  </g>
);

const Counter: React.FC<{ props: CounterProps["props"]; t: ShotTime }> = ({ props = [], t }) => (
  <g>
    <rect x={930} y={COUNTER_TOP} width={1000} height={1080 - COUNTER_TOP} fill="#7a5236" stroke={INK} strokeWidth={8} />
    {Array.from({ length: 6 }, (_, i) => <line key={i} x1={930 + i * 170} y1={COUNTER_TOP + 40} x2={930 + i * 170} y2={1080} stroke="#5f3e28" strokeWidth={5} />)}
    <rect x={910} y={COUNTER_TOP - 22} width={1030} height={34} rx={8} fill="#a8774f" stroke={INK} strokeWidth={8} />
    <g transform={`translate(1560 ${COUNTER_TOP - 18})`}>
      <ellipse cx={0} cy={-34} rx={64} ry={30} fill="#d89a58" stroke={INK} strokeWidth={5} />
      <ellipse cx={-70} cy={-24} rx={50} ry={24} fill="#c98a4a" stroke={INK} strokeWidth={5} />
      <path d="M-170 -20 L170 -20 L140 40 L-140 40Z" fill="#b8874f" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    </g>
    {props.includes("deed") && <g transform={`translate(${mix(1060, 1250, ramp(t.f, 20, 60))} ${COUNTER_TOP - 30})`}><rect x={-80} y={-20} width={160} height={30} rx={4} fill="#efe9dc" stroke={INK} strokeWidth={5} /><rect x={-20} y={-14} width={40} height={6} fill={TEAL} /></g>}
    {props.includes("envelope") && <g transform={`translate(${mix(1300, 1080, ramp(t.f, 30, 70))} ${COUNTER_TOP - 26})`}><rect x={-60} y={-24} width={120} height={40} rx={3} fill="#f4efe2" stroke={INK} strokeWidth={5} /><path d="M-60 -24 L0 4 L60 -24" fill="none" stroke={INK} strokeWidth={4} /></g>}
    {props.includes("coins") && [0, 1, 2].map((i) => <circle key={i} cx={1100 + i * 30} cy={COUNTER_TOP - 18} r={13} fill={MUSTARD} stroke={INK} strokeWidth={3} />)}
    {props.includes("book") && <rect x={1330} y={COUNTER_TOP - 40} width={110} height={30} rx={4} fill="#7a4a3a" stroke={INK} strokeWidth={5} />}
    {props.includes("chess") && (
      <g transform={`translate(1240 ${COUNTER_TOP - 28}) scale(1 0.35)`}>
        {Array.from({ length: 64 }, (_, i) => <rect key={i} x={-160 + (i % 8) * 40} y={-160 + Math.floor(i / 8) * 40} width={40} height={40} fill={(i + Math.floor(i / 8)) % 2 ? "#3a2a20" : "#e8dcc0"} />)}
        <rect x={-160} y={-160} width={320} height={320} fill="none" stroke={INK} strokeWidth={10} />
      </g>
    )}
    {props.includes("sacks") && [0, 1, 2].map((i) => <path key={i} d={`M${1020 + i * 120} ${1080} q-10 -150 50 -170 q60 20 50 170Z`} fill="#e8e2cf" stroke={INK} strokeWidth={6} />)}
  </g>
);

/** The spill: digit tiles out of the phone's screen, over the counter's edge, past the basket, and (floor) on to the door. */
const Spill: React.FC<{ amount: number; floor: boolean; from: { x: number; y: number } }> = ({ amount, floor, from }) => {
  const seq = BALANCE_DIGITS.split("");
  const n = Math.round(seq.length * amount);
  const tiles = seq.slice(0, n).map((ch, i) => {
    const t = i / (seq.length - 1);
    return { ch, x: mix(from.x + 60, 1540, t), y: mix(from.y - 60, 955, t) - Math.sin(t * Math.PI) * 40, s: 0.5 + t * 0.55, r: Math.sin(i * 1.7) * 14 };
  });
  return (
    <g>
      {floor && (
        <g>
          <path d="M1560 1000 C 1620 1060, 1500 1090, 1300 1078 S 1000 1070, 600 1090" fill="none" stroke={INK} strokeWidth={70} strokeLinecap="round" />
          <path d="M1560 1000 C 1620 1060, 1500 1090, 1300 1078 S 1000 1070, 600 1090" fill="none" stroke="#f4efe2" strokeWidth={60} strokeLinecap="round" />
        </g>
      )}
      {amount > 0 && (
        <path d={`M${from.x + 40} ${from.y - 80} C 1080 640, 1180 760, 1300 820 S 1480 930, 1560 1000`} fill="none" stroke="#f4efe2"
          strokeWidth={84} strokeLinecap="round" strokeDasharray="2400" strokeDashoffset={2400 * (1 - amount)} />
      )}
      {tiles.map((tl, i) => <Tile key={i} {...tl} />)}
    </g>
  );
};

/** Small flaps peeling off the glass and dropping by the basket (day two: the 0 and the 2 of 0,02). */
const Flaps: React.FC<{ t: ShotTime; chars: string[]; from: { x: number; y: number } }> = ({ t, chars, from }) => {
  const k = ramp(t.f, 20, 100);
  return (
    <g>
      {chars.map((ch, i) => (
        <Tile key={ch} ch={ch} s={0.45} r={mix(0, 30 - i * 50, k)}
          x={mix(from.x + 60 + i * 50, 1400 + i * 70, k)} y={mix(from.y - 120, COUNTER_TOP - 40, k * k) - Math.sin(k * Math.PI) * 120} />
      ))}
    </g>
  );
};

/** The card reader on the counter, its little screen showing 1,40; declined, it flashes red with a cross. */
const Reader: React.FC<{ t: ShotTime; state: "idle" | "declined" }> = ({ t, state }) => {
  const red = state === "declined" && t.f >= 28;
  const on = red && (t.f < 56 || Math.floor(t.f / 8) % 2 === 0);
  return (
    <g transform={`translate(1130 ${COUNTER_TOP - 20}) rotate(-8)`}>
      <rect x={-56} y={-150} width={112} height={160} rx={16} fill="#2a2d36" stroke={INK} strokeWidth={6} />
      <rect x={-42} y={-136} width={84} height={64} rx={6} fill={on ? "#d8344f" : red ? "#7a2030" : "#cfe9d4"} stroke={INK} strokeWidth={3} />
      {red ? (
        <>
          <path d="M-14 -118 L14 -90 M14 -118 L-14 -90" stroke={PAPER} strokeWidth={7} strokeLinecap="round" />
          <text x={0} y={-48} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={17} fill={on ? "#d8344f" : PAPER}>DECLINED</text>
        </>
      ) : <text x={0} y={-94} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={INK}>1,40</text>}
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={-36 + c * 26} y={-34 + r * 14} width={20} height={9} rx={2} fill="#5a5e6a" />))}
    </g>
  );
};

const LAYOUT = {
  thumb: { you: { x: 470, y: 1740, s: 4.3 }, jonas: null, crop: null },
  medium: { you: { x: 330, y: 1290, s: 2.7 }, jonas: { x: 720, y: 1290, s: 2.6 }, crop: null },
  lotte: { you: { x: 330, y: 1290, s: 2.7 }, jonas: { x: 720, y: 1290, s: 2.6 }, crop: { s: 1.7, x: 1560, y: 600 } },
  board: { you: { x: 330, y: 1290, s: 2.7 }, jonas: null, crop: { s: 1.9, x: 1880, y: 245 } },
  note: { you: { x: 330, y: 1290, s: 2.7 }, jonas: null, crop: { s: 2.8, x: 1195, y: 355 } },
} as const;

export const Bakery: React.FC<{ t: ShotTime } & CounterProps> = ({
  t, mood, layout = "medium", board = "1,40", balance = null, phone = "none", spill = 0, floor = false, flaps, reader,
  you = {}, lotte = {}, jonas = null, props = [], lamp = true, dark = 0,
}) => {
  const L = LAYOUT[layout];
  const talk = useTalk();
  const boardNow = Array.isArray(board) ? board[Math.min(board.length - 1, Math.floor(t.p * board.length * 1.15))] : board;
  const yp = YOU_POSES[you.pose ?? (phone === "up" ? "phoneUp" : phone === "ear" ? "ear" : "rest")];
  const hand = handAt(L.you.x, L.you.y, L.you.s, yp);
  const lp = LOTTE_POSES[lotte?.pose ?? "chalk"];
  const city = { ...citySkyline.defaults, birds: false, traffic: true, shoreLamps: false };
  const props2 = { cam: CAM, mood, frame: t.f, options: city };
  const s = L.you.s / 4.3;
  const actors = (
    <g transform={`translate(${CAM.x} ${CAM.y}) scale(${1 / CAM.zoom}) translate(-960 -540)`}>
      <Wall board={boardNow} lamp={lamp} />
      {lotte && (
        <Figure x={1480} y={1320} scale={2.5} facing={-1} pose={lp} {...LOTTE} {...EXPRESSIONS[lotte.face ?? "neutral"]} {...talk("Lotte")}
          time={t.f / 30} look={{ x: 0.9, y: 0.2 }} held={lotte.held ? HELD[lotte.held] : undefined} />
      )}
      <Counter props={props} t={t} />
      {flaps && <Flaps t={t} chars={flaps} from={hand} />}
      {reader && <Reader t={t} state={reader} />}
      {spill > 0 && <Spill amount={spill} floor={floor} from={hand} />}
      {jonas && L.jonas && (
        <Figure x={L.jonas.x} y={L.jonas.y} scale={L.jonas.s} pose={{ ...STAND, armF: [60, 30], armB: [-12, 14] }} {...FRIEND}
          {...EXPRESSIONS[jonas.face ?? "happy"]} {...talk("Jonas")} time={t.f / 30 + 1} look={{ x: 0.9, y: 0.2 }} held={jonas.held ? HELD[jonas.held] : undefined} />
      )}
      <Figure x={L.you.x} y={L.you.y} scale={L.you.s} pose={yp} head={MUSTARD} scarf={TEAL} tuft flow={0.15} time={t.f / 30 + 3}
        {...EXPRESSIONS[you.face ?? "neutral"]} look={you.look ?? { x: 0.9, y: 0.3 }} />
      {phone === "up" && <Phone x={hand.x - 40 * s} y={hand.y + 30 * s} s={s} lines={balance ?? []} />}
      {phone === "ear" && <Phone x={hand.x - 20 * s} y={hand.y + 60 * s} s={s * 0.7} lines={[]} lit={false} rot={20} />}
      {phone === "down" && <g transform={`translate(1150 ${COUNTER_TOP - 14}) scale(1 0.3)`}><rect x={-80} y={-40} width={160} height={80} rx={14} fill="#0d0e14" /></g>}
    </g>
  );
  const look = setLook([...citySkyline.lights(city), { x: 1250, y: 429, r: 300, color: "#ffd8a0", strength: lamp ? 0.35 : 0, moods: ["morning", "day", "dusk", "night", "lamp"] }], mood, CAM);
  const crop = L.crop;
  return (
    <Push t={t} from={crop ? crop.s : 1} to={crop ? crop.s * 1.04 : 1.05} ox={crop ? crop.x : 960} oy={crop ? crop.y : 540}>
      <LookContext.Provider value={look}>
        <Stage cam={CAM} radius={0} origin={{ x: 960, y: 540 }} back={citySkyline.Back(props2)} actors={actors} />
      </LookContext.Provider>
      {dark > 0 && <div style={{ position: "absolute", inset: 0, background: "#05060a", opacity: dark }} />}
    </Push>
  );
};
