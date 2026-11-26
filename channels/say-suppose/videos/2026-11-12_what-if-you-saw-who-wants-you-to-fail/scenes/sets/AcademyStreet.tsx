// The cram-school street in Daechi-dong (scene_plan.md, "Shared sets"; owner: builder A), drawn for the REF camera
// (sets/common.tsx), night or dusk: towers faced with lit academy signboards (bars for lettering, never words: the
// thumbnail's drawing, channels/say-suppose/brand/thumbs/envy/Envy.tsx), a far skyline, and two views of the street:
//
//   view "thumb":  the thumbnail's frame at REF, exactly: three sign towers and the pavement, nothing else. You and
//                  Min-jun stand NEAR the camera, big (ACADEMY.thumb), their feet below the frame.
//   view "street": the same towers with their ground-floor doors (`doors` 0..1 slides them open), and on the actors'
//                  plane our academy's front (concrete steps up to glass doors that open), the snack shop, the
//                  pavement and the road where the crowd stands, and the bus stop with its timetable board on the near
//                  pavement below the frame (pull the camera back and up to see it).
//
// Usage: back={<AcademyStreetBack cam={cam} mood="night" frame={frame} view="street" doors={d} />}; the figures in the
// actors' slot at the ACADEMY spots; front={<AcademyStreetFront cam={cam} />} adds the bus shelter's near post and roof
// edge over the stranger (street view only). Light: <LookContext.Provider value={setLook(academyLights(view), mood,
// cam)}> adds the signboards' glow to the mood (optional).
// Street view cameras: ACADEMY_CAMS.wide, .steps, .kimbap (the snack shop), .busStop, .field (the pulled-back wide).
import type { Camera } from "@whatif/kit/stage/Stage";
import { OUTSIDE, Sky, Skyline, type SetLight } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { mix, noise } from "../shared";
import { Deep, REF } from "./common";

export type StreetView = "thumb" | "street";

/** The depth the sign towers stand at. */
export const TOWER_DEPTH = 0.75;

/** Named places on the street, world units at REF. */
export const ACADEMY = {
  /** The thumbnail's frame (view "thumb", camera REF): the pavement's top edge and where you two stand, big. */
  thumb: {
    pavement: 924,
    hero: { x: 440, y: 1760, scale: 4.3, facing: 1 as const },
    friend: { x: 1390, y: 1640, scale: 3.3, facing: -1 as const },
  },
  /** Street view. The pavement in front of the steps and the snack shop: the main feet line. */
  floor: 1080,
  /** Our academy's front: concrete steps up to glass doors. Tread tops from the landing down; the pavement at `base`. */
  steps: { from: 20, to: 660, landing: 960, treads: [960, 1000, 1040] as const, base: 1080 },
  /** The glass doors on the landing: their opening, top and bottom. */
  doors: { from: 160, to: 520, top: 640, bottom: 960 },
  /** You on the landing, facing the street (1). */
  you: { x: 400, y: 960, scale: 0.78, facing: 1 as const },
  /** Your best friend two steps down, by the snack shop, facing you (-1). */
  minjun: { x: 760, y: 1090, scale: 0.74, facing: -1 as const },
  /** The snack shop front: from x `from` to `to`, its window, its door, base on the pavement. (`kimbap` is the old
   *  name, kept for anyone who used it.) */
  snackShop: { from: 760, to: 1260, top: 560, base: 1080, window: { x: 790, y: 690, w: 300, h: 310 }, door: { x: 1110, w: 120 } },
  kimbap: { from: 760, to: 1260, top: 560, base: 1080, window: { x: 790, y: 690, w: 300, h: 310 }, door: { x: 1110, w: 120 } },
  /** Where your class stands in front of the snack shop (x range, feet line). */
  classSpot: { from: 820, to: 1220, y: 1110, scale: 0.7 },
  /** The kerb between the pavement and the road, and the road's far and near edges. */
  kerb: 1260,
  road: { from: 1270, to: 1500 },
  /** The bus stop on the near pavement: the shelter's span, the feet line, and the timetable board's centre. */
  busStop: { from: 1440, to: 1900, base: 1600, timetable: { x: 1840, y: 1380, w: 130, h: 180 } },
  /** The stranger at the bus stop, reading the timetable (facing it, 1). Crimson head, long coat. */
  stranger: { x: 1700, y: 1600, scale: 1.0, facing: 1 as const },
  /** Sitting on the steps (Who's Crimson, dusk): hips on the landing's edge, feet on the second tread. */
  sitYou: { x: 300, seatTop: 960, scale: 0.78, facing: 1 as const },
  sitMinjun: { x: 520, seatTop: 960, scale: 0.76, facing: -1 as const },
  /** The crowd's rows (feet lines) on the far pavement, the pavement and the road, with the scale at each. */
  crowd: { x: [-1400, 3400] as const, far: [968, 1010, 1050] as const, near: [1110, 1160, 1210, 1270, 1330, 1390, 1450] as const },
} as const;

/** A crowd member's scale from their feet line: further up the frame is further away. */
export const crowdScale = (y: number) => mix(0.36, 0.86, (y - 960) / (1500 - 960));

/** Street-view framings (world units). */
export const ACADEMY_CAMS: Record<"wide" | "steps" | "kimbap" | "busStop" | "field" | "towers", Camera> = {
  wide: { x: 960, y: 640, zoom: 0.9 },
  steps: { x: 520, y: 840, zoom: 1.7 },
  kimbap: { x: 960, y: 900, zoom: 1.8 },
  busStop: { x: 1700, y: 1380, zoom: 2.0 },
  field: { x: 980, y: 560, zoom: 0.46 },
  towers: { x: 960, y: 300, zoom: 1.25 },
};

const SIGN_COLORS = ["#2fd3c3", "#ff6f91", "#f4efe2", "#7fb2ff", "#ffb36b", "#b38cff"];

/** The sign towers: the thumbnail's three (x -40, 820, 1500) and more either side for wider shots. */
const TOWERS: { x: number; w: number; top: number; seed: number; dim: number }[] = [
  { x: -1500, w: 480, top: -180, seed: 3, dim: 0.7 },
  { x: -960, w: 440, top: 110, seed: 5, dim: 0.62 },
  { x: -40, w: 520, top: 60, seed: 1, dim: 0.55 },
  { x: 820, w: 460, top: 140, seed: 4, dim: 0.8 },
  { x: 1500, w: 460, top: 20, seed: 2, dim: 0.8 },
  { x: 2060, w: 440, top: -140, seed: 0, dim: 0.72 },
  { x: 2600, w: 500, top: 90, seed: 3, dim: 0.66 },
  { x: 3180, w: 460, top: -60, seed: 5, dim: 0.7 },
];

/** A tower's ground-floor door (street view): its centre x and width, in the tower layer's coordinates. */
export const towerDoors = () => TOWERS.map((t) => ({ x: t.x + t.w * 0.4, w: 90, top: 820, bottom: 935 }));

/**
 * A sign tower: a building faced with lit academy boards stacked floor on floor, bars for lettering, no words (the
 * thumbnail's Tower). `ground` (street view) stops the boards above a lit ground floor with a door that slides open.
 */
const Tower: React.FC<{ x: number; w: number; top: number; seed: number; dim: number; lit: number; ground?: number | null; mood: MoodName }> = ({
  x, w, top, seed, dim, lit, ground = null, mood,
}) => {
  const last = ground === null ? 900 : 800;
  const rows = Math.max(0, Math.floor((last - top) / 92));
  const body = OUTSIDE[mood].dark ? "#1c2138" : "#4a3f63";
  return (
    <g>
      <g opacity={dim}>
        <rect x={x} y={top} width={w} height={1080 - top} fill={body} stroke={INK} strokeWidth={6} />
        {Array.from({ length: rows }, (_, r) => {
          const c = SIGN_COLORS[(r * 3 + seed) % SIGN_COLORS.length];
          const narrow = (r + seed) % 3 === 0;
          const bw = narrow ? w * 0.55 : w - 36;
          const bx = narrow ? x + (r % 2 ? w - bw - 18 : 18) : x + 18;
          const by = top + 20 + r * 92;
          return (
            <g key={r} opacity={lit}>
              <rect x={bx} y={by} width={bw} height={64} rx={6} fill={c} stroke={INK} strokeWidth={5} />
              <rect x={bx + 16} y={by + 22} width={bw * 0.55} height={18} rx={9} fill={INK} opacity={0.55} />
              <circle cx={bx + bw - 30} cy={by + 32} r={14} fill={INK} opacity={0.45} />
            </g>
          );
        })}
        <rect x={x + w - 46} y={top + 30} width={36} height={Math.min(560, 1000 - top)} rx={6} fill={SIGN_COLORS[(seed + 2) % 6]} stroke={INK} strokeWidth={5} opacity={lit} />
      </g>
      {ground !== null && <GroundFloor x={x} w={w} open={ground} />}
    </g>
  );
};

/** A tower's lit ground floor: a warm lobby behind glass and a sliding door. */
const GroundFloor: React.FC<{ x: number; w: number; open: number }> = ({ x, w, open }) => {
  const d = { x: x + w * 0.4, w: 90 };
  const slide = open * (d.w / 2 - 4);
  return (
    <g>
      <rect x={x + 10} y={812} width={w - 20} height={128} fill="#f6e2b0" opacity={0.85} stroke={INK} strokeWidth={4} />
      <rect x={x + 24} y={826} width={d.x - d.w / 2 - x - 40} height={100} fill="#fff4d6" opacity={0.7} />
      {/* the door's two leaves part from the middle */}
      <rect x={d.x - d.w / 2} y={820} width={d.w} height={116} fill="#2a2d38" />
      <rect x={d.x - d.w / 2 - slide} y={820} width={d.w / 2} height={116} fill="#cfe9f4" opacity={0.85} stroke={INK} strokeWidth={3} />
      <rect x={d.x + slide} y={820} width={d.w / 2} height={116} fill="#cfe9f4" opacity={0.85} stroke={INK} strokeWidth={3} />
      {open > 0.2 && <rect x={d.x - slide + 2} y={822} width={Math.max(0, slide * 2 - 4)} height={112} fill="#fff1c4" opacity={0.9} />}
    </g>
  );
};

/** Our academy's front, on the actors' plane: the dark face with its own column of boards, glass doors on the landing
 *  and three concrete steps down to the pavement. `open` 0..1 slides the doors. */
const AcademyFront: React.FC<{ open: number; lit: number }> = ({ open, lit }) => {
  const s = ACADEMY.steps, d = ACADEMY.doors;
  const half = (d.to - d.from) / 2;
  const slide = open * (half - 10);
  const tread = (i: number) => ({ x0: s.from + (2 - i) * 40 + 40, x1: s.to - (2 - i) * 40 - 40 });
  return (
    <g>
      <rect x={-200} y={-900} width={920} height={1860} fill="#232845" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 13 }, (_, r) => (
        <g key={r} opacity={lit}>
          <rect x={-170 + (r % 2) * 60} y={-860 + r * 110} width={r % 2 ? 640 : 820} height={80} rx={8} fill={SIGN_COLORS[(r * 2 + 1) % 6]} stroke={INK} strokeWidth={6} />
          <rect x={-140 + (r % 2) * 60} y={-834 + r * 110} width={(r % 2 ? 640 : 820) * 0.5} height={24} rx={12} fill={INK} opacity={0.5} />
        </g>
      ))}
      {/* the canopy over the doors */}
      <rect x={d.from - 70} y={d.top - 50} width={d.to - d.from + 140} height={36} rx={6} fill="#3b3e47" stroke={INK} strokeWidth={5} />
      {/* the lobby behind the glass and the two leaves */}
      <rect x={d.from} y={d.top} width={d.to - d.from} height={d.bottom - d.top} fill="#fff1c4" stroke={INK} strokeWidth={6} />
      <rect x={d.from + 30} y={d.top + 40} width={d.to - d.from - 60} height={60} rx={6} fill="#f2b632" opacity={0.6} />
      <rect x={d.from - slide} y={d.top} width={half} height={d.bottom - d.top} fill="#cfe9f4" opacity={0.55} stroke="#6f7a82" strokeWidth={8} />
      <rect x={d.from + half + slide} y={d.top} width={half} height={d.bottom - d.top} fill="#cfe9f4" opacity={0.55} stroke="#6f7a82" strokeWidth={8} />
      <rect x={d.from + half - 26 - slide} y={d.top + 130} width={10} height={80} rx={5} fill="#6f7a82" />
      <rect x={d.from + half + 16 + slide} y={d.top + 130} width={10} height={80} rx={5} fill="#6f7a82" />
      {/* the steps, landing first, each tread wider than the one above */}
      {[0, 1, 2].map((i) => {
        const t = tread(i);
        const y = s.treads[i];
        return (
          <g key={i}>
            <rect x={t.x0} y={y} width={t.x1 - t.x0} height={s.base - y + 4} fill={["#9a9ca3", "#8d8f96", "#808289"][i]} stroke={INK} strokeWidth={5} />
            <rect x={t.x0} y={y} width={t.x1 - t.x0} height={8} fill="#c4c6cc" />
          </g>
        );
      })}
    </g>
  );
};

/** The snack shop: a lightbox with a steaming cup drawn on it (no words), a striped awning, a warm window with rows
 *  of snacks and cups, and its door. */
const SnackShop: React.FC = () => {
  const k = ACADEMY.snackShop, w = k.window;
  return (
    <g>
      <rect x={k.from} y={k.top} width={k.to - k.from} height={k.base - k.top} fill="#3a3046" stroke={INK} strokeWidth={6} />
      <rect x={k.from + 20} y={k.top - 90} width={k.to - k.from - 40} height={90} rx={10} fill="#fff4d6" stroke={INK} strokeWidth={6} />
      <path d={`M${k.from + 116} ${k.top - 60} h64 l-8 44 h-48z`} fill="#f7f4ea" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M${k.from + 136} ${k.top - 66} q-8 -10 0 -18 M${k.from + 156} ${k.top - 66} q-8 -10 0 -18`} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <rect x={k.from + 230} y={k.top - 64} width={180} height={18} rx={9} fill={CRIMSON} opacity={0.8} />
      <rect x={k.from + 230} y={k.top - 36} width={120} height={14} rx={7} fill={INK} opacity={0.5} />
      {/* the awning */}
      <path d={`M${k.from - 20} ${k.top + 20} H${k.to + 20} L${k.to} ${k.top + 100} H${k.from}Z`} fill="#e8792f" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M${k.from + i * 80} ${k.top + 20} h40 l-3 80 h-40Z`} fill={PAPER} opacity={0.9} />
      ))}
      {/* the window: warm inside, shelves of snacks and cups */}
      <rect x={w.x} y={w.y} width={w.w} height={w.h} fill="#ffd98a" stroke={INK} strokeWidth={6} />
      {[0, 1].map((r) => Array.from({ length: 6 }, (_, i) => (
        <g key={`${r}-${i}`} transform={`translate(${w.x + 30 + i * 48} ${w.y + 86 + r * 80})`}>
          {(i + r) % 2 === 0
            ? <><rect x={-12} y={-44} width={24} height={44} rx={3} fill={["#d8344f", "#1d9a8f", "#7fa0c4"][i % 3]} stroke={INK} strokeWidth={3} /><rect x={-12} y={-28} width={24} height={10} fill="#5a3422" /></>
            : <path d="M-14 -40 h28 l-4 40 h-20z" fill="#f7f4ea" stroke={INK} strokeWidth={3} />}
        </g>
      )))}
      <rect x={w.x} y={w.y + 220} width={w.w} height={20} fill="#9a6a44" />
      <rect x={k.door.x} y={w.y} width={k.door.w} height={k.base - w.y} fill="#cfe9f4" opacity={0.7} stroke={INK} strokeWidth={6} />
      <rect x={k.door.x + 12} y={w.y + 150} width={8} height={70} rx={4} fill="#6f7a82" />
    </g>
  );
};

/** The bus stop on the near pavement: back glass, the roof, the bench, the timetable board (a grid of bars, no
 *  words) on its own post. The near post and roof edge are in <AcademyStreetFront>. */
const BusStop: React.FC = () => {
  const b = ACADEMY.busStop, t = b.timetable;
  return (
    <g>
      <rect x={b.from} y={b.base - 400} width={b.to - b.from - 120} height={330} fill="#cfe9f4" opacity={0.25} stroke="#6f7a82" strokeWidth={8} />
      <rect x={b.from - 10} y={b.base - 440} width={18} height={440} fill="#6f7a82" stroke={INK} strokeWidth={4} />
      <rect x={b.from + 40} y={b.base - 130} width={260} height={18} rx={6} fill="#9a6a44" stroke={INK} strokeWidth={4} />
      <rect x={b.from + 60} y={b.base - 112} width={12} height={112} fill="#3b3e47" />
      <rect x={b.from + 270} y={b.base - 112} width={12} height={112} fill="#3b3e47" />
      {/* the timetable board */}
      <rect x={t.x - 8} y={t.y} width={16} height={b.base - t.y} fill="#6f7a82" stroke={INK} strokeWidth={4} />
      <rect x={t.x - t.w / 2} y={t.y - t.h / 2} width={t.w} height={t.h} rx={8} fill="#f4efe2" stroke={INK} strokeWidth={6} />
      <rect x={t.x - t.w / 2 + 12} y={t.y - t.h / 2 + 12} width={t.w - 24} height={24} rx={4} fill="#1d9a8f" />
      {Array.from({ length: 6 }, (_, r) => (
        <g key={r}>
          <rect x={t.x - t.w / 2 + 14} y={t.y - t.h / 2 + 50 + r * 20} width={28} height={9} rx={4} fill={INK} opacity={0.55} />
          <rect x={t.x - t.w / 2 + 52} y={t.y - t.h / 2 + 50 + r * 20} width={40 + noise(r + 3) * 20} height={9} rx={4} fill={INK} opacity={0.35} />
        </g>
      ))}
    </g>
  );
};

/** The sky, the far skyline and the towers (both views), then the street's ground and, in the street view, our
 *  academy, the snack shop and the bus stop. `doors` opens every door on the street at once (street view). */
export const AcademyStreetBack: React.FC<{ cam: Camera; mood: MoodName; frame: number; view: StreetView; doors?: number }> = ({
  cam, mood, frame, view, doors = 0,
}) => {
  const o = OUTSIDE[mood];
  const lit = mood === "night" || mood === "lamp" ? 1 : mood === "dusk" ? 0.85 : 0.45;
  const street = view === "street";
  return (
    <>
      <Deep cam={cam} depth={0.05} flat>
        <Sky id="academy" mood={mood} x={-2600} y={-2200} w={7200} h={2900} sunAt={{ x: 1320, y: -120 }} />
      </Deep>
      <Deep cam={cam} depth={0.2} flat>
        <Skyline mood={mood} from={-2600} to={4600} base={940} tall={700} seed={7} colors={["#b9a6c4", "#c9b4c8", "#a99ab8"]} />
      </Deep>
      <Deep cam={cam} depth={0.32} flat>
        <Skyline mood={mood} from={-2400} to={4400} base={960} tall={520} seed={2} />
        {/* the far traffic between the towers */}
        {o.dark && Array.from({ length: 8 }, (_, i) => {
          const x = (((i * 620 + frame * (i % 2 ? 5 : -4)) % 5600) + 5600) % 5600 - 1800;
          return <circle key={i} cx={x} cy={918} r={7} fill={i % 2 ? "#ff8a8a" : "#fff4c8"} />;
        })}
      </Deep>
      <Deep cam={cam} depth={TOWER_DEPTH}>
        {TOWERS.map((t, i) => <Tower key={i} {...t} lit={lit} mood={mood} ground={street ? doors : null} />)}
        {!street && (
          <g>
            <rect x={-2000} y={930} width={6000} height={1200} fill="#2a2d38" />
            <rect x={-2000} y={924} width={6000} height={14} fill="#4a4e5c" />
          </g>
        )}
        {street && <rect x={-2000} y={936} width={6000} height={40} fill="#3a3e4c" />}
      </Deep>
      {street && (
        <Deep cam={cam} depth={1}>
          {/* the pavement, the kerb, the road with its lane marks, the near pavement */}
          <rect x={-2600} y={960} width={7600} height={ACADEMY.kerb - 960} fill={o.dark ? "#454857" : "#5f6072"} />
          {Array.from({ length: 40 }, (_, i) => <line key={i} x1={-2600 + i * 190} y1={960} x2={-2660 + i * 190 - 120} y2={ACADEMY.kerb} stroke="#000" strokeWidth={3} opacity={0.12} />)}
          <rect x={-2600} y={ACADEMY.kerb} width={7600} height={14} fill="#8d8f96" />
          <rect x={-2600} y={ACADEMY.road.from} width={7600} height={ACADEMY.road.to - ACADEMY.road.from} fill={o.dark ? "#1b1d25" : "#3d3f4c"} />
          {Array.from({ length: 24 }, (_, i) => <rect key={i} x={-2600 + i * 320} y={1380} width={150} height={10} rx={5} fill={PAPER} opacity={0.5} />)}
          <rect x={-2600} y={ACADEMY.road.to} width={7600} height={14} fill="#8d8f96" />
          <rect x={-2600} y={ACADEMY.road.to + 14} width={7600} height={900} fill={o.dark ? "#454857" : "#5f6072"} />
          <AcademyFront open={doors} lit={lit} />
          <SnackShop />
          <BusStop />
        </Deep>
      )}
    </>
  );
};

/** In front of the actors (street view): the bus shelter's near post and the edge of its roof. */
export const AcademyStreetFront: React.FC<{ cam: Camera }> = ({ cam }) => {
  const b = ACADEMY.busStop;
  return (
    <Deep cam={cam} depth={1}>
      <rect x={b.from - 30} y={b.base - 470} width={b.to - b.from - 60} height={34} rx={6} fill="#4a4e5c" stroke={INK} strokeWidth={5} />
      <rect x={b.to - 110} y={b.base - 450} width={18} height={450} fill="#6f7a82" stroke={INK} strokeWidth={4} />
    </Deep>
  );
};

/** The signboards' glow, the snack shop's window and the academy doors, for setLook (after dark and at dusk). */
export const academyLights = (view: StreetView): SetLight[] => {
  const moods: MoodName[] = ["dusk", "night", "lamp"];
  const towers = TOWERS.map((t, i) => ({ x: t.x + t.w / 2, y: Math.max(200, t.top + 300), depth: TOWER_DEPTH, r: 520, color: SIGN_COLORS[(i + 2) % 6], strength: 0.14, moods }));
  if (view === "thumb") return towers;
  const k = ACADEMY.snackShop.window, d = ACADEMY.doors;
  return [
    ...towers,
    { x: k.x + k.w / 2, y: k.y + k.h / 2, r: 360, color: "#ffd98a", strength: 0.35, moods },
    { x: (d.from + d.to) / 2, y: (d.top + d.bottom) / 2, r: 320, color: "#fff1c4", strength: 0.3, moods },
  ];
};

/** The REF camera, for the thumb view's opening frame. */
export const THUMB_CAM: Camera = REF;
