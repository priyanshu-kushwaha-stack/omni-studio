// The Window (script v5), the academy at night, seen from where you stand at the front: a hundred students in six rows
// facing you, and behind them the far wall, all black glass. "Backs.": the chairs scrape round in a ripple and the room
// shows you a hundred backs; and in the glass, the room comes back reversed: a hundred faces looking your way. In the
// peak hold every reflected head gets its card, the digits mirrored. World coordinates are the REF frame (1920x1080 at
// zoom 1). Front-on people are drawn here (FrontPerson), not with the kit's profile Figure.
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook, type MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { INK, MUSTARD, TEAL } from "@whatif/kit/theme";
import { Meter } from "../parts";
import { MINJUN, noise, PASTELS, TAEHO } from "../shared";

// ------------------------------------------------------------------------------------------------ the room's layout

const PER_ROW = 17;
const ROWS = 6;
/** Real rows, nearest (0) to the glass (5): head centre y and radius. */
const realRow = (k: number) => ({ y: 900 - 68 * k, r: 44 - 5 * k });
/** Their reflections in the glass: the row nearest the glass reflects biggest and lowest. */
const REFL_Y = [215, 255, 300, 350, 410, 475];
const REFL_R = [9, 10.5, 12, 14, 16, 18];
/** The glass: from GLASS.top to the sill. */
export const GLASS = { top: 60, sill: 545 } as const;
/** Your own reflection: at the very back of the room in the glass (you stand furthest from it), no card ever. */
export const YOUR_REFL = { x: 960, y: 172, r: 8 } as const;

const stagger = (k: number) => (k % 2 === 0 ? 0.5 : 0);
const seatX = (k: number, i: number, r: number) => 960 + (i - 8 + stagger(k)) * r * 2.9;

export interface Student {
  k: number; i: number; x: number; y: number; r: number; rx: number; ry: number; rr: number;
  head: string; coat: string; value: number; snap: number; turn: number; who?: "minjun" | "taeho";
}

/** Min-jun and the rival's seats. Two seats behind their cards stay empty so a card never lies on a head. */
const MJ = { k: 2, i: 5 };
const TH = { k: 1, i: 9 };
const EMPTY = new Set(["3:5", "2:9"]);

/** Every student: real place, reflected place, colours, the reading the glass shows, and their order in the ripple
 *  of the turn and the ripple of snaps (0..1). */
export const STUDENTS: Student[] = (() => {
  const out: Student[] = [];
  const coats = ["#2f3a52", "#3b3e47", "#4a3f5c", "#2c4a4a", "#55433a"];
  for (let k = 0; k < ROWS; k++) {
    const { y, r } = realRow(k);
    for (let i = 0; i < PER_ROW; i++) {
      if (EMPTY.has(`${k}:${i}`)) continue;
      const n = noise(k * 31 + i * 7 + 3);
      const m = noise(k * 17 + i * 13 + 9);
      let value = Math.round(12 + 83 * m);
      if (n < 0.06) value = 0;
      else if (n < 0.12) value = -Math.round(5 + 25 * m);
      const s: Student = {
        k, i, x: seatX(k, i, r), y, r, rx: seatX(k, i, REFL_R[k]), ry: REFL_Y[k], rr: REFL_R[k],
        head: PASTELS[(k * 5 + i * 3) % PASTELS.length], coat: coats[(k + i) % coats.length], value,
        snap: noise(k * 7 + i * 29 + 1), turn: noise(k * 11 + i * 5 + 2),
      };
      if (k === MJ.k && i === MJ.i) Object.assign(s, { head: MINJUN.head, coat: MINJUN.coat, value: -84, who: "minjun" });
      if (k === TH.k && i === TH.i) Object.assign(s, { head: TAEHO.head, coat: TAEHO.coat, value: -6, who: "taeho" });
      out.push(s);
    }
  }
  return out;
})();
export const MJ_REFL = STUDENTS.find((s) => s.who === "minjun")!;
export const TH_REFL = STUDENTS.find((s) => s.who === "taeho")!;

// ------------------------------------------------------------------------------------------------ people, front on

/**
 * A person seen from the front or the back: shoulders and a head. `turn` 0 faces the camera, 1 shows the back; in
 * between the figure squashes through its side (the chair coming round). `lift` raises a standing person.
 */
const FrontPerson: React.FC<{
  x: number; y: number; r: number; head: string; coat: string; turn: number; mouth?: "smile" | "flat" | "grin" | "smirk";
  look?: number; lift?: number; hero?: boolean; scarf?: boolean;
}> = ({ x, y, r, head, coat, turn, mouth = "flat", look = 0, lift = 0, hero, scarf }) => {
  const sx = Math.max(0.06, Math.abs(Math.cos(Math.PI * Math.min(1, Math.max(0, turn)))));
  const front = turn < 0.5;
  const yy = y - lift;
  const sw = Math.max(1.5, r * 0.08);
  return (
    <g transform={`translate(${x} 0) scale(${sx} 1) translate(${-x} 0)`}>
      <rect x={x - r * 1.35} y={yy + r * 0.72} width={r * 2.7} height={r * 2 + lift} rx={r * 0.9} fill={coat} stroke={INK} strokeWidth={sw} />
      {scarf && <path d={`M${x - r * 1.0} ${yy + r * 0.8} Q${x} ${yy + r * 1.25} ${x + r * 1.0} ${yy + r * 0.8} L${x + r * 0.9} ${yy + r * 1.15} Q${x} ${yy + r * 1.55} ${x - r * 0.9} ${yy + r * 1.15}Z`}
        fill={TEAL} stroke={INK} strokeWidth={sw} />}
      {!front && <line x1={x} y1={yy + r * 1.1} x2={x} y2={yy + r * 2.4} stroke={INK} strokeWidth={sw} opacity={0.35} />}
      <ellipse cx={x - r * 0.98} cy={yy + r * 0.08} rx={r * 0.17} ry={r * 0.24} fill={head} stroke={INK} strokeWidth={sw * 0.8} />
      <ellipse cx={x + r * 0.98} cy={yy + r * 0.08} rx={r * 0.17} ry={r * 0.24} fill={head} stroke={INK} strokeWidth={sw * 0.8} />
      <circle cx={x} cy={yy} r={r} fill={head} stroke={INK} strokeWidth={sw} />
      {hero && <path d={`M${x - r * 0.1} ${yy - r * 0.95} q${r * 0.2} ${-r * 0.5} ${r * 0.5} ${-r * 0.15}`} fill="none" stroke={INK} strokeWidth={sw * 1.4} strokeLinecap="round" />}
      {front ? (
        <g>
          <circle cx={x - r * 0.33 + look * r * 0.1} cy={yy - r * 0.05} r={r * 0.11} fill={INK} />
          <circle cx={x + r * 0.33 + look * r * 0.1} cy={yy - r * 0.05} r={r * 0.11} fill={INK} />
          {mouth === "flat" && <line x1={x - r * 0.22} y1={yy + r * 0.38} x2={x + r * 0.22} y2={yy + r * 0.38} stroke={INK} strokeWidth={sw} strokeLinecap="round" />}
          {mouth === "smile" && <path d={`M${x - r * 0.3} ${yy + r * 0.3} Q${x} ${yy + r * 0.58} ${x + r * 0.3} ${yy + r * 0.3}`} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />}
          {mouth === "grin" && <path d={`M${x - r * 0.36} ${yy + r * 0.26} Q${x} ${yy + r * 0.78} ${x + r * 0.36} ${yy + r * 0.26}Z`} fill={INK} />}
          {mouth === "smirk" && <path d={`M${x - r * 0.25} ${yy + r * 0.4} Q${x + r * 0.1} ${yy + r * 0.44} ${x + r * 0.32} ${yy + r * 0.24}`} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />}
        </g>
      ) : (
        <path d={`M${x - r * 0.25} ${yy - r * 0.55} q${r * 0.25} ${r * 0.18} ${r * 0.45} ${-r * 0.05}`} fill="none" stroke={INK} strokeWidth={sw * 0.8} opacity={0.3} />
      )}
    </g>
  );
};

/** A row's long desk, in front of the row (between it and the camera), with each student's phone on it. */
const RowDesk: React.FC<{ k: number; lit: number }> = ({ k, lit }) => {
  const { y, r } = realRow(k);
  const top = y + r * 1.45;
  const xs = STUDENTS.filter((s) => s.k === k).map((s) => s.x);
  const from = Math.min(...xs) - r * 2, to = Math.max(...xs) + r * 2;
  return (
    <g>
      <rect x={from} y={top} width={to - from} height={r * 0.32} rx={r * 0.08} fill="#a87c52" stroke={INK} strokeWidth={Math.max(2, r * 0.08)} />
      <rect x={from + r * 0.3} y={top + r * 0.32} width={to - from - r * 0.6} height={r * 0.9} fill="#8a5c3b" stroke={INK} strokeWidth={Math.max(2, r * 0.06)} />
      {xs.map((x, i) => (
        <g key={i}>
          <rect x={x + r * 0.4} y={top - r * 0.12} width={r * 0.55} height={r * 0.16} rx={r * 0.04} fill="#23252b" />
          {lit > 0 && <ellipse cx={x + r * 0.67} cy={top - r * 0.3} rx={r * 0.6} ry={r * 0.3} fill="#c8f0ea" opacity={0.35 * lit} />}
        </g>
      ))}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the glass

export interface RoomState {
  frame: number;
  /** Each student's turn (0 facing you .. 1 backs to you): from the student. */
  turnOf: (s: Student) => number;
  /** When each student's card opens in the glass (or null: no card yet). */
  snapOf: (s: Student) => number | null;
  /** The rival standing (0..1). */
  stand: number;
  /** Phones lit on the desks (0..1). */
  lit: number;
  /** A glint sweeping across the glass (0..1 through it), or null. */
  glint: number | null;
  /** How bright the reflections read (0..1): they come up on "every window is a mirror". */
  mirror: number;
}

/** The reflected cards are drawn this many times bigger and scaled down, so the card's ink lines stay as fine as
 *  on a full-size card (at the glass's small radii the Meter's minimum stroke swamped the paper). */
const CARD_UP = 4;

/** One reflected card, its digits mirrored (the card hangs in the glass the wrong way round), with a slow ghost of the
 *  flaps a few frames behind while they run. */
const MirroredCard: React.FC<{ frame: number; at: number; s: Student }> = ({ frame, at, s }) => {
  const running = frame >= at + 4 && frame < at + 26;
  const one = (f: number, o: number, key: string) => (
    <g key={key} opacity={o}>
      <Meter frame={f} at={at} x={s.rx} headY={s.ry} r={s.rr * CARD_UP} value={s.value} until={at + 100000} />
    </g>
  );
  return (
    <g transform={`translate(${s.rx} ${s.ry}) scale(${-1 / CARD_UP} ${1 / CARD_UP}) translate(${-s.rx} ${-s.ry})`}>
      {running && one(frame - 6, 0.18, "g2")}
      {running && one(frame - 3, 0.35, "g1")}
      {one(frame, 1, "c")}
    </g>
  );
};

/** The far wall's black glass with the room reflected in it. */
const Glass: React.FC<{ st: RoomState }> = ({ st }) => {
  const { frame } = st;
  const panes = Array.from({ length: 12 }, (_, i) => -560 + i * 300);
  const sorted = [...STUDENTS].sort((a, b) => a.k - b.k);
  return (
    <g>
      <clipPath id="win-glass"><rect x={-1400} y={GLASS.top} width={4800} height={GLASS.sill - GLASS.top} /></clipPath>
      <rect x={-1400} y={GLASS.top} width={4800} height={GLASS.sill - GLASS.top} fill="#0f1426" />
      <g clipPath="url(#win-glass)">
        {/* the reflected ceiling: two rows of tube lights, and the reflected back wall with its board */}
        <rect x={-1400} y={GLASS.top} width={4800} height={150} fill="#1a2138" opacity={st.mirror} />
        <rect x={810} y={128} width={300} height={56} rx={4} fill="#2a3550" opacity={0.8 * st.mirror} />
        {[-200, 360, 960, 1560, 2120].map((x, i) => <rect key={i} x={x - 110} y={84} width={220} height={9} rx={4} fill="#e8f4ff" opacity={0.5 * st.mirror} />)}
        {[-60, 500, 960, 1420, 1980].map((x, i) => <rect key={i} x={x - 70} y={112} width={140} height={6} rx={3} fill="#e8f4ff" opacity={0.35 * st.mirror} />)}
        <g opacity={0.35 + 0.55 * st.mirror}>
          {/* you, at the back of the reflected room: the mustard head, the tuft, the teal scarf; no card */}
          <FrontPerson x={YOUR_REFL.x} y={YOUR_REFL.y} r={YOUR_REFL.r} head={MUSTARD} coat="#2a2d36" turn={0} mouth="smile" hero scarf />
          {sorted.map((s) => (
            <FrontPerson key={`${s.k}-${s.i}`} x={s.rx} y={s.ry - (s.who === "taeho" ? st.stand * s.rr * 1.4 : 0)} r={s.rr} head={s.head} coat={s.coat}
              turn={1 - st.turnOf(s)} mouth={s.value > 40 ? "smile" : "flat"} />
          ))}
        </g>
        {/* the night through the glass, laid over the reflected people (not the cards) */}
        <rect x={-1400} y={GLASS.top} width={4800} height={GLASS.sill - GLASS.top} fill="#0b1024" opacity={0.42 - 0.22 * st.mirror} />
        {sorted.map((s) => {
          const at = st.snapOf(s);
          return at === null || frame < at ? null : <MirroredCard key={`c${s.k}-${s.i}`} frame={frame} at={at} s={s} />;
        })}
        {/* glare */}
        {panes.map((x, i) => <path key={i} d={`M${x + 40} ${GLASS.top} l60 0 l-150 ${GLASS.sill - GLASS.top} l-60 0Z`} fill="#fff" opacity={0.05} />)}
        {st.glint !== null && (
          <path d={`M${-400 + st.glint * 2800} ${GLASS.top} l220 0 l-260 ${GLASS.sill - GLASS.top} l-220 0Z`} fill="#fff" opacity={0.22 * Math.sin(Math.PI * st.glint)} />
        )}
      </g>
      {/* frames between the panes, the sill */}
      {panes.map((x, i) => <rect key={i} x={x - 9} y={GLASS.top} width={18} height={GLASS.sill - GLASS.top} fill="#c9c2b0" stroke={INK} strokeWidth={4} />)}
      <rect x={-1400} y={GLASS.top - 16} width={4800} height={18} fill="#c9c2b0" stroke={INK} strokeWidth={4} />
      <rect x={-1400} y={GLASS.sill - 4} width={4800} height={22} fill="#d6cfbc" stroke={INK} strokeWidth={4} />
    </g>
  );
};

const RoomBack: React.FC<{ st: RoomState }> = ({ st }) => (
  <g>
    <rect x={-1400} y={-800} width={4800} height={900} fill="#e3dac4" />
    <rect x={-1400} y={GLASS.sill} width={4800} height={1400} fill="#d9cfb6" />
    <rect x={-1400} y={GLASS.sill + 70} width={4800} height={1400} fill="#b7ab92" />
    <Glass st={st} />
  </g>
);

const RoomActors: React.FC<{ st: RoomState }> = ({ st }) => (
  <g>
    {Array.from({ length: ROWS }, (_, n) => ROWS - 1 - n).map((k) => (
      <g key={k}>
        {STUDENTS.filter((s) => s.k === k).map((s) => (
          <FrontPerson key={s.i} x={s.x} y={s.y} r={s.r} head={s.head} coat={s.coat} turn={st.turnOf(s)}
            lift={s.who === "taeho" ? st.stand * s.r * 1.4 : 0} mouth={s.who === "taeho" ? "smirk" : "flat"} look={0} />
        ))}
        <RowDesk k={k} lit={st.lit} />
      </g>
    ))}
  </g>
);

/** The academy room at night through the camera `cam`. The night grade is lighter than the mood's own, so the cards in
 *  the black glass still read on a phone. */
export const RoomShot: React.FC<{ cam: Camera; st: RoomState; mood: MoodName }> = ({ cam, st, mood }) => (
  <LookContext.Provider value={moodLook(mood, { dof: 0, grade: { top: "#6a74c0", bottom: "#3a3c68", opacity: 0.28 }, vignette: 0.4 })}>
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<RoomBack st={st} />} actors={<RoomActors st={st} />} />
  </LookContext.Provider>
);

