// The Window (v7), the academy at night, seen from where you stand at the front: a hundred students at their desks
// facing you, and behind them the far wall, all black glass. "Backs.": the chairs come round in a ripple and the room
// shows you a hundred BACKS (dark hair, the nape, no faces); and in the glass, the room comes back reversed: a hundred
// FACES looking your way. On the outside review of v6 the glass has to read as glass: a blue tint over everything in it,
// a faint double image (two panes), heavy mullions, diagonal sheen over the cards, the reflected desks, and one phone
// held up whose screen we only see in the glass, its words backwards. The cards in the glass are mirrored (digits,
// scale, hinge). The real rows are a nearer layer that slides faster than the glass when the camera moves (parallax).
// World coordinates are the REF frame (1920x1080 at zoom 1). Front-on people are drawn here (FrontPerson).
import { FONT } from "@whatif/kit/fonts";
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook, type MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { MINJUN, noise, PASTELS, TAEHO } from "../shared";
import { FlapCard, type Reading } from "./Window.Glass";

// ------------------------------------------------------------------------------------------------ the room's layout

const PER_ROW = 17;
const ROWS = 6;
/** Real rows, nearest the camera (0) to nearest the glass (5): head centre y and radius. */
const realRow = (k: number) => ({ y: 900 - 68 * k, r: 44 - 5 * k });
/** Their reflections: the row nearest the glass reflects biggest and lowest. Rows are spaced so a card over one row
 *  never lies on a face of the row behind it (gap > 2.6 r + the next radius). */
const REFL_R = [13, 15, 17, 19.5, 22, 25];
const REFL_Y = [146, 198, 257, 331, 408, 495];
/** The glass: from GLASS.top to the sill. */
export const GLASS = { top: 50, sill: 548 } as const;
/** Your own reflection: at the very back of the room in the glass (you stand furthest from it), no card ever. */
export const YOUR_REFL = { x: 1110, y: 98, r: 12 } as const; // mid-pane: a mullion stands at x 960
/** The camera the real rows are laid out for; the nearer layer slides PARALLAX more than the glass away from it. */
const REF_CAM = { x: 960, y: 470 };
const PARALLAX = 0.35;

const stagger = (k: number) => (k % 2 === 0 ? 0.5 : 0);
const seatX = (k: number, i: number, r: number) => 960 + (i - 8 + stagger(k)) * r * 2.9;
const HAIR = ["#2b2530", "#3a2c26", "#24262e", "#4a3a2e", "#33282a"];

export interface Student {
  k: number; i: number; x: number; y: number; r: number; rx: number; ry: number; rr: number;
  head: string; coat: string; hair: string | null;
  /** The reading the card opens on (the race), the one the teal wave turns it to (null: it stays). */
  value: number; after: number | null;
  /** Order in the ripple of the turn and in the cascade of snaps (0..1). */
  snap: number; turn: number; who?: "minjun" | "taeho" | "phone";
}

/** Min-jun, the rival, and the girl at the back holding her phone up to the glass. */
const MJ = { k: 4, i: 13 };
const TH = { k: 4, i: 4 };
const PHONE = { k: 5, i: 9 };

export const STUDENTS: Student[] = (() => {
  const out: Student[] = [];
  const coats = ["#2f3a52", "#3b3e47", "#4a3f5c", "#2c4a4a", "#55433a"];
  for (let k = 0; k < ROWS; k++) {
    const { y, r } = realRow(k);
    for (let i = 0; i < PER_ROW; i++) {
      const n = noise(k * 31 + i * 7 + 3);
      const m = noise(k * 17 + i * 13 + 9);
      // about two in five were red at the race; the wave turns all but a few of them teal
      const red = n < 0.4;
      const value = red ? -Math.round(6 + 40 * m) : Math.round(14 + 80 * m);
      const after = red ? (n < 0.05 ? null : Math.round(8 + 30 * noise(k * 5 + i * 11))) : null;
      const s: Student = {
        k, i, x: seatX(k, i, r), y, r, rx: seatX(k, i, REFL_R[k]), ry: REFL_Y[k], rr: REFL_R[k],
        head: PASTELS[(k * 5 + i * 3) % PASTELS.length], coat: coats[(k + i) % coats.length], hair: HAIR[(k * 3 + i) % HAIR.length],
        value, after, snap: noise(k * 7 + i * 29 + 1), turn: noise(k * 11 + i * 5 + 2),
      };
      if (k === MJ.k && i === MJ.i) Object.assign(s, { head: MINJUN.head, coat: MINJUN.coat, hair: null, value: -84, after: null, who: "minjun" });
      if (k === TH.k && i === TH.i) Object.assign(s, { head: TAEHO.head, coat: TAEHO.coat, hair: null, value: -6, after: null, who: "taeho" });
      if (k === PHONE.k && i === PHONE.i) Object.assign(s, { value: 88, after: null, who: "phone" });
      out.push(s);
    }
  }
  return out;
})();
export const MJ_REFL = STUDENTS.find((s) => s.who === "minjun")!;
export const TH_REFL = STUDENTS.find((s) => s.who === "taeho")!;
export const PHONE_REFL = STUDENTS.find((s) => s.who === "phone")!;

// ------------------------------------------------------------------------------------------------ people, front on

type Mouth = "smile" | "flat" | "grin" | "smirk";

/**
 * A person seen from the front or the back: shoulders and a head. `turn` 0 faces the camera, 1 shows the back; in
 * between the figure squashes through its side (the chair coming round). From the back: the hair over the head, the
 * nape, the ears, no face. `lift` raises a standing person; `nod` dips the head (0..1); `lookY` moves the eyes up (-1).
 */
const FrontPerson: React.FC<{
  x: number; y: number; r: number; head: string; coat: string; turn: number; mouth?: Mouth; hair?: string | null;
  look?: number; lookY?: number; lift?: number; nod?: number; hero?: boolean; scarf?: boolean; brows?: boolean;
}> = ({ x, y, r, head, coat, turn, mouth = "flat", hair = null, look = 0, lookY = 0, lift = 0, nod = 0, hero, scarf, brows }) => {
  const sx = Math.max(0.06, Math.abs(Math.cos(Math.PI * Math.min(1, Math.max(0, turn)))));
  const front = turn < 0.5;
  const yy = y - lift + nod * r * 0.22;
  const sw = Math.max(1.2, r * 0.08);
  return (
    <g transform={`translate(${x} 0) scale(${sx} 1) translate(${-x} 0)`}>
      <rect x={x - r * 1.35} y={y - lift + r * 0.72} width={r * 2.7} height={r * 2 + lift} rx={r * 0.9} fill={coat} stroke={INK} strokeWidth={sw} />
      {scarf && <path d={`M${x - r * 1.0} ${yy + r * 0.8} Q${x} ${yy + r * 1.25} ${x + r * 1.0} ${yy + r * 0.8} L${x + r * 0.9} ${yy + r * 1.15} Q${x} ${yy + r * 1.55} ${x - r * 0.9} ${yy + r * 1.15}Z`}
        fill={TEAL} stroke={INK} strokeWidth={sw} />}
      {!front && <line x1={x} y1={yy + r * 1.1} x2={x} y2={yy + r * 2.4} stroke={INK} strokeWidth={sw} opacity={0.35} />}
      <ellipse cx={x - r * 0.98} cy={yy + r * 0.08} rx={r * 0.17} ry={r * 0.24} fill={head} stroke={INK} strokeWidth={sw * 0.8} />
      <ellipse cx={x + r * 0.98} cy={yy + r * 0.08} rx={r * 0.17} ry={r * 0.24} fill={head} stroke={INK} strokeWidth={sw * 0.8} />
      <circle cx={x} cy={yy} r={r} fill={!front && hair ? hair : head} stroke={INK} strokeWidth={sw} />
      {/* from the back: the nape under the hair */}
      {!front && hair && <path d={`M${x - r * 0.62} ${yy + r * 0.62} Q${x} ${yy + r * 0.35} ${x + r * 0.62} ${yy + r * 0.62} A${r} ${r} 0 0 1 ${x - r * 0.62} ${yy + r * 0.62}Z`} fill={head} />}
      {/* from the front: a fringe */}
      {front && hair && <path d={`M${x - r * 0.97} ${yy - r * 0.2} A${r} ${r} 0 0 1 ${x + r * 0.97} ${yy - r * 0.2} Q${x + r * 0.3} ${yy - r * 0.5} ${x - r * 0.1} ${yy - r * 0.38} Q${x - r * 0.6} ${yy - r * 0.48} ${x - r * 0.97} ${yy - r * 0.2}Z`} fill={hair} />}
      {hero && <path d={`M${x - r * 0.1} ${yy - r * 0.95} q${r * 0.2} ${-r * 0.5} ${r * 0.5} ${-r * 0.15}`} fill="none" stroke={INK} strokeWidth={sw * 1.4} strokeLinecap="round" />}
      {front && (
        <g>
          {brows && <path d={`M${x - r * 0.5} ${yy - r * 0.32} l${r * 0.3} ${r * 0.06} M${x + r * 0.5} ${yy - r * 0.32} l${-r * 0.3} ${r * 0.06}`} stroke={INK} strokeWidth={sw} strokeLinecap="round" />}
          <circle cx={x - r * 0.33 + look * r * 0.1} cy={yy - r * 0.05 + lookY * r * 0.1} r={r * 0.11} fill={INK} />
          <circle cx={x + r * 0.33 + look * r * 0.1} cy={yy - r * 0.05 + lookY * r * 0.1} r={r * 0.11} fill={INK} />
          {mouth === "flat" && <line x1={x - r * 0.22} y1={yy + r * 0.38} x2={x + r * 0.22} y2={yy + r * 0.38} stroke={INK} strokeWidth={sw} strokeLinecap="round" />}
          {mouth === "smile" && <path d={`M${x - r * 0.3} ${yy + r * 0.3} Q${x} ${yy + r * 0.58} ${x + r * 0.3} ${yy + r * 0.3}`} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />}
          {mouth === "grin" && <path d={`M${x - r * 0.36} ${yy + r * 0.26} Q${x} ${yy + r * 0.78} ${x + r * 0.36} ${yy + r * 0.26}Z`} fill={INK} />}
          {mouth === "smirk" && <path d={`M${x - r * 0.25} ${yy + r * 0.4} Q${x + r * 0.1} ${yy + r * 0.44} ${x + r * 0.32} ${yy + r * 0.24}`} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />}
        </g>
      )}
    </g>
  );
};

/** A phone held up beside a head: its back (dark, the camera dot) or its screen (a teal badge, "TOP 4%"); `mirror`
 *  draws the screen backwards, as the glass shows it. (x, y) is the phone's centre; h its height. */
const HeldPhone: React.FC<{ x: number; y: number; h: number; screen: boolean; mirror?: boolean; hand: string; badge?: string }> = ({
  x, y, h, screen, mirror, hand, badge = "1",
}) => {
  const w = h * 0.56;
  return (
    <g transform={`translate(${x} ${y}) scale(${mirror ? -1 : 1} 1) rotate(-8)`}>
      <circle cx={0} cy={h * 0.48} r={h * 0.2} fill={hand} stroke={INK} strokeWidth={h * 0.03} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h * 0.1} fill="#23252b" stroke={INK} strokeWidth={h * 0.04} />
      {screen ? (
        <g>
          <rect x={-w / 2 + h * 0.05} y={-h / 2 + h * 0.07} width={w - h * 0.1} height={h * 0.86} rx={h * 0.05} fill="#e9f6f3" />
          <circle cx={0} cy={-h * 0.12} r={h * 0.17} fill={TEAL} stroke={INK} strokeWidth={h * 0.025} />
          <text x={0} y={-h * 0.05} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={h * 0.22} fill={PAPER}>{badge}</text>
          <text x={0} y={h * 0.22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={h * 0.15} fill={INK}>TOP</text>
          <text x={0} y={h * 0.37} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={h * 0.13} fill={TEAL}>4%</text>
        </g>
      ) : (
        <circle cx={-w * 0.22} cy={-h * 0.36} r={h * 0.05} fill="#555" />
      )}
    </g>
  );
};

/** One student's desk, in front of them (between them and the camera), with their phone on it, lit. */
const Desk: React.FC<{ s: Student; lit: number }> = ({ s, lit }) => {
  const { x, r } = s;
  const top = s.y + r * 1.45;
  return (
    <g>
      <rect x={x - r * 1.3} y={top} width={r * 2.6} height={r * 0.3} rx={r * 0.08} fill="#a87c52" stroke={INK} strokeWidth={Math.max(2, r * 0.07)} />
      <rect x={x - r * 1.1} y={top + r * 0.3} width={r * 2.2} height={r * 0.85} fill="#8a5c3b" stroke={INK} strokeWidth={Math.max(2, r * 0.06)} />
      <rect x={x + r * 0.3} y={top - r * 0.12} width={r * 0.55} height={r * 0.16} rx={r * 0.04} fill="#23252b" />
      {lit > 0 && <ellipse cx={x + r * 0.57} cy={top - r * 0.3} rx={r * 0.6} ry={r * 0.3} fill="#c8f0ea" opacity={0.35 * lit} />}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------ the glass

export interface RoomState {
  frame: number;
  /** Each student's turn (0 facing you .. 1 backs to you). */
  turnOf: (s: Student) => number;
  /** Each student's card in the glass: when it opened and what it reads now, or null (none yet). */
  cardOf: (s: Student) => { at: number; read: Reading } | null;
  /** The rival standing (0..1). */
  stand: number;
  /** Phones lit on the desks (0..1); phones raised at the front rows, showing their badges (0..1). */
  lit: number;
  raise: number;
  /** The girl at the back holding her phone up to the glass (0..1). */
  phoneUp: number;
  /** A glint sweeping across the glass (0..1 through it), or null. */
  glint: number | null;
  /** How bright the reflections read (0..1): they come up on "every window is a mirror". */
  mirror: number;
  /** Your reflection looking up for a card that isn't there (0..1); the rival's grudging nod in the glass (0..1). */
  youUp: number;
  thNod: number;
}

const PANES = Array.from({ length: 12 }, (_, i) => -540 + i * 300);

/** The reflected room: ceiling lights, the board, the desks' edges, the people (faces), the phone's screen. */
const Reflected: React.FC<{ st: RoomState; ghost?: boolean }> = ({ st, ghost }) => {
  const sorted = [...STUDENTS].sort((a, b) => a.k - b.k);
  return (
    <g>
      <rect x={-1400} y={GLASS.top} width={4800} height={34} fill="#1a2138" />
      <rect x={830} y={60} width={260} height={30} rx={4} fill="#2a3550" opacity={0.8} />
      {[-200, 360, 960, 1560, 2120].map((x, i) => <rect key={i} x={x - 110} y={58} width={220} height={7} rx={3} fill="#e8f4ff" opacity={0.55} />)}
      <FrontPerson x={YOUR_REFL.x} y={YOUR_REFL.y} r={YOUR_REFL.r} head={MUSTARD} coat="#2a2d36" turn={0} mouth="smile" hero scarf lookY={-st.youUp} />
      {sorted.map((s) => {
        const turned = st.turnOf(s);
        const lift = s.who === "taeho" ? st.stand * s.rr * 1.4 : 0;
        return (
          <g key={`${s.k}-${s.i}`}>
            <FrontPerson x={s.rx} y={s.ry - lift} r={s.rr} head={s.head} coat={s.coat} hair={s.hair} turn={1 - turned}
              mouth={s.who === "taeho" ? (st.thNod > 0.6 ? "smirk" : "flat") : s.value > 40 || (s.after ?? 0) > 0 ? "smile" : "flat"}
              nod={s.who === "taeho" ? Math.sin(Math.PI * Math.min(1, st.thNod * 1.6)) : 0} brows={s.who === "taeho"} />
            {/* the reflected desk's edge in front of each reflected student (the desks are between them and the glass) */}
            {!ghost && <rect x={s.rx - s.rr * 1.3} y={s.ry + s.rr * 1.45} width={s.rr * 2.6} height={s.rr * 0.26} fill="#6b5240" opacity={0.75} />}
            {s.who === "phone" && st.phoneUp > 0 && !ghost && (
              <HeldPhone x={s.rx + s.rr * 1.5} y={s.ry - s.rr * 0.3 * st.phoneUp} h={s.rr * 1.9} screen mirror hand={s.head} />
            )}
          </g>
        );
      })}
    </g>
  );
};

/** The far wall's black glass with the room reflected in it. */
const Glass: React.FC<{ st: RoomState }> = ({ st }) => {
  const { frame } = st;
  const sorted = [...STUDENTS].sort((a, b) => a.k - b.k);
  return (
    <g>
      <clipPath id="win-glass"><rect x={-1400} y={GLASS.top} width={4800} height={GLASS.sill - GLASS.top} /></clipPath>
      <rect x={-1400} y={GLASS.top} width={4800} height={GLASS.sill - GLASS.top} fill="#0f1730" />
      <g clipPath="url(#win-glass)">
        {/* the second pane's faint double image, a few units up and right */}
        <g opacity={0.16 * st.mirror} transform="translate(5 -4)"><Reflected st={st} ghost /></g>
        <g opacity={0.3 + 0.62 * st.mirror}><Reflected st={st} /></g>
        {/* the night through the glass, a blue tint over the reflected room (not the cards) */}
        <rect x={-1400} y={GLASS.top} width={4800} height={GLASS.sill - GLASS.top} fill="#16306a" opacity={0.5 - 0.26 * st.mirror} />
        {sorted.map((s) => {
          const c = st.cardOf(s);
          return c === null || frame < c.at ? null
            : <FlapCard key={`c${s.k}-${s.i}`} frame={frame} at={c.at} x={s.rx} headY={s.ry} r={s.rr} read={c.read} mirror opacity={0.94} />;
        })}
        {/* sheen: broad diagonal bands over everything in the glass, cards too */}
        {PANES.map((x, i) => (
          <g key={i}>
            <path d={`M${x + 40} ${GLASS.top} l70 0 l-170 ${GLASS.sill - GLASS.top} l-70 0Z`} fill="#dfe9ff" opacity={0.09} />
            <path d={`M${x + 130} ${GLASS.top} l18 0 l-170 ${GLASS.sill - GLASS.top} l-18 0Z`} fill="#dfe9ff" opacity={0.12} />
          </g>
        ))}
        {st.glint !== null && (
          <path d={`M${-400 + st.glint * 2800} ${GLASS.top} l240 0 l-280 ${GLASS.sill - GLASS.top} l-240 0Z`} fill="#fff" opacity={0.3 * Math.sin(Math.PI * st.glint)} />
        )}
      </g>
      {/* heavy mullions between the panes, a lit edge on each, a latch; the head rail and the sill */}
      {PANES.map((x, i) => (
        <g key={i}>
          <rect x={x - 16} y={GLASS.top} width={32} height={GLASS.sill - GLASS.top} fill="#c9c2b0" stroke={INK} strokeWidth={5} />
          <rect x={x - 11} y={GLASS.top} width={6} height={GLASS.sill - GLASS.top} fill="#efe9da" />
          <rect x={x + 16} y={GLASS.top + 230} width={14} height={44} rx={4} fill="#8f897a" stroke={INK} strokeWidth={3} />
        </g>
      ))}
      <rect x={-1400} y={GLASS.top - 22} width={4800} height={24} fill="#c9c2b0" stroke={INK} strokeWidth={5} />
      <rect x={-1400} y={GLASS.sill - 4} width={4800} height={26} fill="#d6cfbc" stroke={INK} strokeWidth={5} />
    </g>
  );
};

const RoomBack: React.FC<{ st: RoomState }> = ({ st }) => (
  <g>
    <rect x={-1400} y={-800} width={4800} height={880} fill="#e3dac4" />
    <rect x={-1400} y={GLASS.sill} width={4800} height={1400} fill="#d9cfb6" />
    <rect x={-1400} y={GLASS.sill + 70} width={4800} height={1400} fill="#b7ab92" />
    <Glass st={st} />
  </g>
);

/** The real rows: people, then their desks in front of them. The front two rows raise their phones on "Everyone has a
 *  result", the girl at the back holds hers up to the glass after the turn (we see its back). */
const RoomActors: React.FC<{ st: RoomState; cam: Camera }> = ({ st, cam }) => (
  <g transform={`translate(${(cam.x - REF_CAM.x) * -PARALLAX} ${(cam.y - REF_CAM.y) * -PARALLAX})`}>
    {Array.from({ length: ROWS }, (_, n) => ROWS - 1 - n).map((k) => (
      <g key={k}>
        {STUDENTS.filter((s) => s.k === k).map((s) => {
          const turn = st.turnOf(s);
          const raiser = k <= 1 && noise(s.i * 3 + k) < 0.35 && turn < 0.5;
          const up = raiser ? st.raise * (1 - turn * 2) : 0;
          return (
            <g key={s.i}>
              <FrontPerson x={s.x} y={s.y} r={s.r} head={s.head} coat={s.coat} hair={s.hair} turn={turn}
                lift={s.who === "taeho" ? st.stand * s.r * 1.4 : 0} mouth={s.who === "taeho" ? "smirk" : up > 0.5 ? "grin" : "flat"} />
              {up > 0.02 && <HeldPhone x={s.x + s.r * 1.45} y={s.y + s.r * (1.3 - 1.6 * up)} h={s.r * 1.5} screen hand={s.head}
                badge={String(1 + Math.floor(noise(s.i + 40) * 3))} />}
              {s.who === "phone" && st.phoneUp > 0 && <HeldPhone x={s.x + s.r * 1.5} y={s.y - s.r * 0.3 * st.phoneUp} h={s.r * 1.9} screen={false} hand={s.head} />}
            </g>
          );
        })}
        {STUDENTS.filter((s) => s.k === k).map((s) => <Desk key={`d${s.i}`} s={s} lit={st.lit} />)}
      </g>
    ))}
  </g>
);

/** The academy room at night through the camera `cam`. The night grade is lighter than the mood's own, so the cards in
 *  the black glass still read on a phone. */
export const RoomShot: React.FC<{ cam: Camera; st: RoomState; mood: MoodName }> = ({ cam, st, mood }) => (
  <LookContext.Provider value={moodLook(mood, { dof: 0, grade: { top: "#6a74c0", bottom: "#3a3c68", opacity: 0.24 }, vignette: 0.4 })}>
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<RoomBack st={st} />} actors={<RoomActors st={st} cam={cam} />} />
  </LookContext.Provider>
);
