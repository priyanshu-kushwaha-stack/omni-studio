// More Hours' small places, each drawn for REF in world coordinates, each a lit Stage: the bus nap (the library bus,
// you slumped at the window under the band, a bus-shelter ad sliding past with a small subscribe tag), the driver's
// rear-view mirror, the nap room at work (a door with a bed plate, cots, pillows, the till on a stool), the couple's
// front door across the street, the grandmother's window with three jars, your hall with the empty key hook, and your
// street's row of front doors and steps.
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND } from "@whatif/kit/rig/pose";
import { bus } from "@whatif/kit/sets";
import { Deep, Floor, setLook, Sky, worldOf } from "@whatif/kit/sets/common";
import { LookContext, type Look } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { CoinArc, Ghost, Jar, Sleeper } from "../parts";
import { GHOST, GRANDMOTHER, PASTELS } from "../shared";

/** A stage lit by a mood plus a few glows. */
export const Lit: React.FC<{ cam: Camera; mood: MoodName; back: React.ReactNode; actors: React.ReactNode; front?: React.ReactNode;
  glows?: { x: number; y: number; r: number; color: string; strength?: number }[]; look?: Partial<Look> }> = ({ cam, mood, back, actors, front, glows = [], look }) => (
  <LookContext.Provider value={setLook(glows.map((g) => ({ ...g, moods: [mood] })), mood, cam, look)}>
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={back} actors={actors} front={front} />
  </LookContext.Provider>
);

// ------------------------------------------------------------------------------------------------ the bus

const BUS_WINDOWS = [-260, 380, 1020, 1660];

/** The bus-shelter ad outside, sliding past (drawn in the street layer's place, clipped to the windows): a lit poster
 *  of someone asleep, and in its corner a small crimson subscribe tag (a play triangle, no words). `x` is where the
 *  panel is in the street layer (depth 0.4). */
export const BusAd: React.FC<{ cam: Camera; x: number }> = ({ cam, x }) => {
  const p = worldOf(cam, x, 330, 0.4);
  return (
    <g>
      <clipPath id="bus-windows">
        {BUS_WINDOWS.map((w) => <rect key={w} x={w} y={300} width={580} height={280} rx={24} />)}
      </clipPath>
      <g clipPath="url(#bus-windows)" transform={`translate(${p.x} ${p.y})`}>
        <rect x={-10} y={0} width={14} height={300} fill="#4a5262" />
        <rect x={200} y={0} width={14} height={300} fill="#4a5262" />
        <rect x={-20} y={-10} width={244} height={230} rx={8} fill="#3b4250" stroke={INK} strokeWidth={4} />
        <rect x={-8} y={2} width={220} height={206} rx={4} fill="#fff4d8" />
        <circle cx={70} cy={110} r={34} fill={PASTELS[1]} />
        <path d="M40 92 Q70 70 100 92" stroke="#1b1d24" strokeWidth={6} fill="none" />
        <circle cx={92} cy={86} r={6} fill={GHOST.light} />
        <path d="M30 170 Q110 140 190 170 V200 H30Z" fill="#7fa0c4" />
        <g transform="translate(160 40)">
          <rect x={-30} y={-18} width={60} height={36} rx={12} fill={CRIMSON} stroke={INK} strokeWidth={3} />
          <path d="M-8 -10 L12 0 L-8 10Z" fill="#fff" />
        </g>
      </g>
    </g>
  );
};

/** The inside of the bus: the library set with the street frozen when the bus stops (`stopped` freezes its frame). */
export const BusStage: React.FC<{ frame: number; streetFrame: number; cam: Camera; mood: MoodName; hangers: number; actors: React.ReactNode }> = ({ frame, streetFrame, cam, mood, hangers, actors }) => {
  const options = { ...bus.defaults, hangers };
  return (
    <LookContext.Provider value={setLook(bus.lights(options), mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={bus.Back({ cam, mood, frame: streetFrame, options })} actors={actors} />
    </LookContext.Provider>
  );
};

/** The driver in the rear-view mirror: a strip of his face, his eyes on you; `band` lights a teal dot under his cap.
 *  Centred at (x, y) in world units. */
export const Mirror: React.FC<{ x: number; y: number; look: number; brows: "flat" | "raised" | "angry"; band: number; blink: boolean }> = ({ x, y, look, brows, band, blink }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-8} y={-160} width={16} height={60} fill="#5c6675" />
    <rect x={-250} y={-110} width={500} height={190} rx={40} fill="#2a2d36" stroke={INK} strokeWidth={6} />
    <clipPath id="mirror-glass"><rect x={-232} y={-92} width={464} height={154} rx={30} /></clipPath>
    <g clipPath="url(#mirror-glass)">
      <rect x={-240} y={-100} width={480} height={170} fill="#c9d4d6" />
      <rect x={-240} y={-100} width={480} height={170} fill="#8fb4d9" />
      <rect x={-240} y={-100} width={480} height={60} fill="#4a5262" />
      {band > 0 && <circle cx={60} cy={-30} r={14} fill={GHOST.light} stroke="#1b1d24" strokeWidth={3} opacity={band} />}
      {band > 0 && <circle cx={60} cy={-30} r={40} fill={GHOST.light} opacity={0.25 * band} />}
      {[-70, 70].map((ex) => (
        <g key={ex}>
          {blink ? <line x1={ex - 22} x2={ex + 22} y1={20} y2={20} stroke={INK} strokeWidth={6} strokeLinecap="round" />
            : <g><ellipse cx={ex + look * 14} cy={20} rx={16} ry={22} fill={INK} /><circle cx={ex + look * 14 + 5} cy={12} r={5} fill="#fff" /></g>}
          <line x1={ex - 30} x2={ex + 30} y1={brows === "raised" ? -16 : -6} y2={brows === "angry" ? (ex < 0 ? 4 : -14) : brows === "raised" ? -16 : -6}
            stroke={INK} strokeWidth={7} strokeLinecap="round" transform={brows === "angry" && ex > 0 ? `rotate(-16 ${ex} -6)` : brows === "angry" ? `rotate(16 ${ex} -6)` : undefined} />
        </g>
      ))}
      <path d="M-240 60 L-160 40 L160 40 L240 60" fill="none" stroke="#fff" strokeWidth={14} opacity={0.18} />
    </g>
  </g>
);

// ------------------------------------------------------------------------------------------------ the nap room

/** The door at work with a bed plate (a drawn bed, no words); `open` 0..1 swings it; behind it the nap room: cots,
 *  a pile of pillows, the till on a stool (its drawer out by `till`). */
export const NAP = { floor: 960, door: { x: 1000, w: 260, top: 360 }, till: { x: 1240, y: 760 }, pillows: { x: 1500, y: 960 } };

export const Till: React.FC<{ x: number; y: number; drawer: number }> = ({ x, y, drawer }) => (
  <g>
    <rect x={x - 60} y={y} width={120} height={16} rx={4} fill="#6b4b3a" stroke={INK} strokeWidth={4} />
    <rect x={x - 50} y={y + 16} width={12} height={NAP.floor - y - 16} fill="#4a3a30" />
    <rect x={x + 38} y={y + 16} width={12} height={NAP.floor - y - 16} fill="#4a3a30" />
    <rect x={x - 70} y={y - 40 + 20} width={140 + drawer * 0} height={30} rx={4} fill="#3b3e47" stroke={INK} strokeWidth={4} transform={`translate(${drawer * 50} 0)`} />
    {drawer > 0 && [0, 1, 2].map((i) => <ellipse key={i} cx={x - 30 + i * 30 + drawer * 50} cy={y - 18} rx={11} ry={5} fill="#ffd36b" stroke={INK} strokeWidth={2} />)}
    <path d={`M${x - 60} ${y - 20} L${x - 50} ${y - 110} H${x + 50} L${x + 60} ${y - 20}Z`} fill="#5c6675" stroke={INK} strokeWidth={5} />
    <rect x={x - 36} y={y - 100} width={72} height={30} rx={4} fill="#1b1d24" />
    <rect x={x - 28} y={y - 92} width={40} height={14} rx={3} fill="#7fe0a0" />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={x - 40 + (i % 3) * 28} y={y - 62 + Math.floor(i / 3) * 18} width={22} height={12} rx={3} fill="#c9ced6" />)}
  </g>
);

const Pillow: React.FC<{ x: number; y: number; s?: number; r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <rect x={x - 60 * s} y={y - 34 * s} width={120 * s} height={68 * s} rx={26 * s} fill="#f7f4ee" stroke={INK} strokeWidth={4} transform={`rotate(${r} ${x} ${y})`} />
);

export const NapRoomBack: React.FC<{ cam: Camera; open: number }> = ({ cam, open }) => {
  const D = NAP.door;
  return (
    <>
      <Deep cam={cam} depth={0.8} flat>
        <rect x={-1400} y={-800} width={4800} height={2400} fill="#e9e4d8" />
        <rect x={-1400} y={600} width={4800} height={300} fill="#ddd6c6" />
        {[-200, 400, 2000].map((x) => <rect key={x} x={x} y={200} width={300} height={200} rx={6} fill="#cfe9f4" stroke="#a5998a" strokeWidth={8} />)}
      </Deep>
      <Deep cam={cam} depth={1}>
        <Floor y={NAP.floor - 20} fill="#8a94a0" gap={160} slant={-90} opacity={0.05} />
        {/* the nap room behind the door: dim, cots, pillows */}
        <rect x={D.x - D.w / 2 + 2} y={D.top} width={D.w - 4} height={NAP.floor - 20 - D.top} fill="#3a3550" />
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x={D.x - 110 + i * 120} y={850 - i * 60} width={110} height={18} rx={6} fill="#7a8a9c" stroke={INK} strokeWidth={3} />
            <ellipse cx={D.x - 90 + i * 120} cy={840 - i * 60} rx={20} ry={10} fill="#f7f4ee" />
          </g>
        ))}
        {/* the door: a frame, the leaf swinging in, the bed plate */}
        <rect x={D.x - D.w / 2 - 16} y={D.top - 16} width={D.w + 32} height={NAP.floor - D.top - 4} fill="none" stroke="#7a6a58" strokeWidth={16} />
        <g transform={`translate(${D.x - D.w / 2} 0) scale(${1 - open * 0.85} 1) translate(${-(D.x - D.w / 2)} 0)`}>
          <rect x={D.x - D.w / 2} y={D.top} width={D.w} height={NAP.floor - 20 - D.top} fill="#b58f6a" stroke={INK} strokeWidth={5} />
          <circle cx={D.x + D.w / 2 - 30} cy={680} r={12} fill="#c9ced6" stroke={INK} strokeWidth={3} />
          <rect x={D.x - 70} y={D.top + 50} width={140} height={90} rx={8} fill={PAPER} stroke={INK} strokeWidth={4} />
          <g transform={`translate(${D.x} ${D.top + 100})`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round">
            <path d="M-50 20 V-30 M-50 0 H50 V20" />
            <circle cx={-32} cy={-12} r={9} fill={INK} />
            <path d="M-18 -10 H46 V0" />
          </g>
        </g>
      </Deep>
    </>
  );
};

/** The till and the pillows, in the actors' slot (the boss stands among them). */
export const NapRoomProps: React.FC<{ drawer: number }> = ({ drawer }) => (
  <g>
    <Till x={NAP.till.x} y={NAP.till.y} drawer={drawer} />
    {Array.from({ length: 7 }, (_, i) => <Pillow key={i} x={NAP.pillows.x + (i % 3) * 70 - (i > 5 ? -40 : 0)} y={NAP.pillows.y - 34 - Math.floor(i / 3) * 56} r={(i * 13) % 11 - 5} />)}
  </g>
);

// ------------------------------------------------------------------------------------------------ the couple's door

export const COUPLE = { floor: 960, door: { x: 820, w: 200, top: 540 }, window: { x: 1150, y: 360, w: 480, h: 360 } };

/** Their house across the street: brick, the door (`open` 0..1), the window with its jar (and inside, when `sleeper`,
 *  one of them asleep under the band with the pale worker and coins dropping, `frame` driving). */
export const CoupleHouse: React.FC<{ cam: Camera; mood: MoodName; frame: number; open: number; sleeper: number; coinsFrom: number }> = ({ cam, mood, frame, open, sleeper, coinsFrom }) => {
  const D = COUPLE.door;
  const W = COUPLE.window;
  const sx = W.x + 120, sy = W.y + W.h - 70;
  return (
    <>
      <Deep cam={cam} depth={0.15} flat><Sky id="couple" mood={mood} x={-1400} y={-800} w={4800} h={1400} /></Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={120} width={4800} height={COUPLE.floor - 120} fill="#b5735f" />
        {Array.from({ length: 24 }, (_, i) => <line key={i} x1={-1400} y1={150 + i * 34} x2={3400} y2={150 + i * 34} stroke="#9a5f4e" strokeWidth={3} />)}
        <rect x={-1400} y={100} width={4800} height={30} fill="#e8dcc4" stroke={INK} strokeWidth={4} />
        {/* the window: their room, the bed, the jar on the sill */}
        <clipPath id="couple-win"><rect x={W.x} y={W.y} width={W.w} height={W.h} /></clipPath>
        <g clipPath="url(#couple-win)">
          <rect x={W.x} y={W.y} width={W.w} height={W.h} fill="#5a5070" />
          <rect x={W.x} y={W.y} width={W.w} height={W.h} fill="#bfefff" opacity={0.35 * sleeper} />
          <ellipse cx={sx - 10} cy={sy + 20} rx={80} ry={36} fill="#262c45" />
          {sleeper > 0 && <Sleeper id="couple" x={sx} y={sy} scale={1.0} head={PASTELS[3]} scarf={undefined} tuft={false} lit={sleeper} />}
          <path d={`M${W.x + 150} ${W.y + W.h} Q${W.x + 200} ${W.y + W.h - 80} ${W.x + 300} ${W.y + W.h - 70} T${W.x + W.w} ${W.y + W.h - 40} V${W.y + W.h}Z`} fill="#3e5c8f" stroke={INK} strokeWidth={4} />
          <Ghost x={W.x + 270} y={W.y + W.h - 60} scale={0.62} t={sleeper} frame={frame} head="#f6cfcf" />
          <Jar x={W.x + W.w - 60} y={W.y + W.h - 6} w={70} h={90} fill={0.6} />
          {sleeper > 0.5 && <CoinArc frame={frame} start={coinsFrom} from={{ x: W.x + 420, y: W.y + 160 }} via={{ x: W.x + 440, y: W.y + 60 }} to={{ x: W.x + W.w - 60, y: W.y + W.h - 96 }} every={6} fall={18} r={11} />}
        </g>
        <rect x={W.x} y={W.y} width={W.w} height={W.h} fill="none" stroke="#efe6d4" strokeWidth={14} />
        <line x1={W.x + W.w / 2} y1={W.y} x2={W.x + W.w / 2} y2={W.y + W.h} stroke="#efe6d4" strokeWidth={10} />
        <rect x={W.x - 16} y={W.y + W.h} width={W.w + 32} height={22} fill="#e8dcc4" stroke={INK} strokeWidth={4} />
        {/* the doorway: the hall light behind, the door leaf swinging in */}
        <rect x={D.x - D.w / 2} y={D.top} width={D.w} height={COUPLE.floor - 40 - D.top} fill="#fff0c4" />
        <g transform={`translate(${D.x + D.w / 2} 0) scale(${1 - open * 0.8} 1) translate(${-(D.x + D.w / 2)} 0)`}>
          <rect x={D.x - D.w / 2} y={D.top} width={D.w} height={COUPLE.floor - 40 - D.top} fill="#3d6fb0" stroke={INK} strokeWidth={5} />
          <circle cx={D.x - D.w / 2 + 30} cy={760} r={11} fill="#e8c23a" stroke={INK} strokeWidth={3} />
        </g>
        <rect x={D.x - D.w / 2 - 18} y={D.top - 18} width={D.w + 36} height={COUPLE.floor - 40 - D.top + 18} fill="none" stroke="#efe6d4" strokeWidth={14} />
        <rect x={D.x - D.w / 2 - 40} y={COUPLE.floor - 40} width={D.w + 80} height={40} fill="#c9c0b0" stroke={INK} strokeWidth={4} />
        <rect x={-1400} y={COUPLE.floor} width={4800} height={400} fill="#9d958a" />
      </Deep>
    </>
  );
};

// ------------------------------------------------------------------------------------------------ the grandmother's window

export const GRAN_WIN = { x: 560, y: 220, w: 800, h: 560 };

/** One window from outside: brick round it, the room, a sleeper under the band with the pale worker typing (`speed`
 *  multiplies the typing), and `jars` jars on the sill filling with coins. (x, y, w, h) the window. */
export const SleeperWindow: React.FC<{ id: string; x: number; y: number; w: number; h: number; frame: number; head: string; ghostHead: string;
  jars: number; fill: number; speed: number; coinsEvery: number; eyes?: "shut" | "open"; mouth?: "smile" | "flat" | "o" }> = ({
  id, x, y, w, h, frame, head, ghostHead, jars, fill, speed, coinsEvery, eyes = "shut", mouth = "smile" }) => {
  const k = w / 800;
  const sill = y + h;
  const jarXs = Array.from({ length: jars }, (_, i) => x + w * (jars === 1 ? 0.8 : 0.52 + (0.36 * i) / Math.max(1, jars - 1)));
  return (
    <g>
      <clipPath id={`sw-${id}`}><rect x={x} y={y} width={w} height={h} /></clipPath>
      <g clipPath={`url(#sw-${id})`}>
        <rect x={x} y={y} width={w} height={h} fill="#e3cfe0" />
        {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={x + 40 * k + (i % 6) * 130 * k} cy={y + 60 * k + Math.floor(i / 6) * 120 * k} r={8 * k} fill="#d0b5cd" />)}
        <rect x={x} y={y} width={w} height={h} fill="#bfefff" opacity={0.3} />
        <ellipse cx={x + 170 * k} cy={y + h - 120 * k} rx={130 * k} ry={52 * k} fill="#f7f4ee" stroke={INK} strokeWidth={4} />
        <Sleeper id={`sw${id}`} x={x + 180 * k} y={y + h - 150 * k} scale={1.5 * k} head={head} scarf={undefined} tuft={false} lit={1} eyes={eyes} mouth={mouth} />
        <path d={`M${x + 250 * k} ${y + h} Q${x + 320 * k} ${y + h - 150 * k} ${x + 470 * k} ${y + h - 140 * k} T${x + w} ${y + h - 80 * k} V${y + h}Z`} fill="#8a6a7f" stroke={INK} strokeWidth={5} />
        <Ghost x={x + 470 * k} y={y + h - 150 * k} scale={1.0 * k} t={1} frame={frame * speed} head={ghostHead} />
        {jarXs.map((jx, i) => (
          <CoinArc key={i} frame={frame} start={-200 + i * Math.floor(coinsEvery / Math.max(1, jars))} from={{ x: x + 640 * k, y: y + h - 330 * k }}
            via={{ x: (x + 640 * k + jx) / 2, y: y + 40 * k }} to={{ x: jx, y: sill - 20 * k }} every={coinsEvery} fall={18} r={14 * k} />
        ))}
      </g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#efe6d4" strokeWidth={18 * k} />
      <rect x={x - 30 * k} y={sill} width={w + 60 * k} height={30 * k} fill="#e8dcc4" stroke={INK} strokeWidth={5} />
      {jarXs.map((jx, i) => <Jar key={i} x={jx} y={sill} w={120 * k} h={160 * k} fill={Math.min(0.95, fill + i * 0.1)} />)}
    </g>
  );
};

/** The grandmother's window in its wall, with her neighbours' windows either side (one jar each). */
export const GranWall: React.FC<{ cam: Camera; frame: number; fill: number }> = ({ cam, frame, fill }) => {
  const G = GRAN_WIN;
  return (
    <>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={-800} width={4800} height={2400} fill="#a7685a" />
        {Array.from({ length: 70 }, (_, i) => <line key={i} x1={-1400} y1={-800 + i * 34} x2={3400} y2={-800 + i * 34} stroke="#8e5548" strokeWidth={3} />)}
        <SleeperWindow id="left" x={-640} y={G.y + 80} w={480} h={340} frame={frame} head={PASTELS[0]} ghostHead="#d9e6f2" jars={1} fill={0.35} speed={1} coinsEvery={30} />
        <SleeperWindow id="right" x={2080} y={G.y + 80} w={480} h={340} frame={frame} head={PASTELS[2]} ghostHead="#d6eedf" jars={1} fill={0.3} speed={1} coinsEvery={30} />
      </Deep>
    </>
  );
};

export const GranWindow: React.FC<{ frame: number; fill: number; storm: number; eyes?: "shut" | "open"; mouth?: "smile" | "flat" | "o" }> = ({ frame, fill, storm, eyes, mouth }) => {
  const G = GRAN_WIN;
  return <SleeperWindow id="gran" x={G.x} y={G.y} w={G.w} h={G.h} frame={frame} head={GRANDMOTHER.head} ghostHead="#ecdcf1" jars={3} fill={fill}
    speed={storm} coinsEvery={Math.max(4, Math.round(12 / storm))} eyes={eyes} mouth={mouth} />;
};

// ------------------------------------------------------------------------------------------------ your hall

export const HALL = { floor: 960, hook: { x: 1000, y: 590 }, door: { x: 1500, w: 260, top: 300 } };

/** Your hall: the wall, the front door, the key-hook board (all hooks empty), a coat on a peg, the mat. */
export const HallBack: React.FC<{ cam: Camera }> = ({ cam }) => {
  const H = HALL.hook;
  const D = HALL.door;
  return (
    <>
      <Deep cam={cam} depth={0.9} flat>
        <rect x={-1400} y={-800} width={4800} height={2400} fill="#e6dcc2" />
        <rect x={-1400} y={640} width={4800} height={300} fill="#cdbb98" />
        <rect x={-1400} y={630} width={4800} height={14} fill="#8a6a4a" />
        <rect x={300} y={240} width={220} height={170} fill={PAPER} stroke="#8a5c3b" strokeWidth={12} />
        <path d="M320 390 q50 -70 90 -30 q30 -40 90 30Z" fill="#9fc0a8" />
      </Deep>
      <Deep cam={cam} depth={1}>
        <Floor y={HALL.floor - 20} fill="#a8774f" gap={180} slant={-70} />
        <rect x={D.x - D.w / 2} y={D.top} width={D.w} height={HALL.floor - 20 - D.top} fill="#1d9a8f" stroke={INK} strokeWidth={6} />
        <rect x={D.x - D.w / 2 + 30} y={D.top + 40} width={D.w - 60} height={160} rx={8} fill="#167d74" />
        <circle cx={D.x - D.w / 2 + 34} cy={640} r={14} fill="#e8c23a" stroke={INK} strokeWidth={3} />
        <rect x={D.x - D.w / 2 - 16} y={D.top - 16} width={D.w + 32} height={HALL.floor - D.top} fill="none" stroke="#efe6d4" strokeWidth={14} />
        <rect x={D.x - 140} y={HALL.floor - 30} width={280} height={18} rx={6} fill="#7a5a3a" />
        {/* the key-hook board, every hook empty */}
        <rect x={H.x - 120} y={H.y - 40} width={240} height={60} rx={8} fill="#8a5c3b" stroke={INK} strokeWidth={5} />
        {[-80, -27, 27, 80].map((dx) => <path key={dx} d={`M${H.x + dx} ${H.y - 4} v26 q0 14 12 10`} fill="none" stroke="#c9ced6" strokeWidth={7} strokeLinecap="round" />)}
        {/* a coat on a peg */}
        <circle cx={600} cy={420} r={10} fill="#5a4a48" />
        <path d="M600 420 L540 470 L520 760 L680 760 L660 470Z" fill="#6d7f8f" stroke={INK} strokeWidth={5} />
      </Deep>
    </>
  );
};

// ------------------------------------------------------------------------------------------------ your street's doors

/** The row of front doors on your street by day: x of each door; yours is the teal one. */
export const DOORS = { floor: 960, step: 920, top: 600, w: 120, xs: [60, 360, 660, 960, 1260, 1560, 1860, 2160], yours: 960 };

export const DoorRowBack: React.FC<{ cam: Camera; mood: MoodName; open: number }> = ({ cam, mood, open }) => (
  <>
    <Deep cam={cam} depth={0.15} flat><Sky id="doors" mood={mood} x={-1400} y={-800} w={4800} h={1400} /></Deep>
    <Deep cam={cam} depth={1}>
      {DOORS.xs.map((x, i) => (
        <g key={x}>
          <rect x={x - 150} y={60} width={300} height={DOORS.floor - 60} fill={["#b5735f", "#c99a6a", "#a7685a", "#b88a72"][i % 4]} stroke={INK} strokeWidth={4} />
          <rect x={x - 156} y={40} width={312} height={26} fill="#e8dcc4" stroke={INK} strokeWidth={4} />
          <rect x={x - 90} y={200} width={180} height={150} fill="#cfe9f4" stroke="#efe6d4" strokeWidth={10} />
          <line x1={x} y1={200} x2={x} y2={350} stroke="#efe6d4" strokeWidth={7} />
          {/* the door; yours opens */}
          <rect x={x - DOORS.w / 2} y={DOORS.top} width={DOORS.w} height={DOORS.step - DOORS.top} fill="#fff0c4" />
          <g transform={x === DOORS.yours ? `translate(${x + DOORS.w / 2} 0) scale(${1 - open * 0.85} 1) translate(${-(x + DOORS.w / 2)} 0)` : undefined}>
            <rect x={x - DOORS.w / 2} y={DOORS.top} width={DOORS.w} height={DOORS.step - DOORS.top} fill={x === DOORS.yours ? "#1d9a8f" : ["#3d4a66", "#7a3a3a", "#4f6b5a", "#5a4a68"][i % 4]} stroke={INK} strokeWidth={5} />
            <circle cx={x - DOORS.w / 2 + 22} cy={770} r={9} fill="#e8c23a" stroke={INK} strokeWidth={3} />
          </g>
          <rect x={x - DOORS.w / 2 - 14} y={DOORS.top - 14} width={DOORS.w + 28} height={DOORS.step - DOORS.top + 14} fill="none" stroke="#efe6d4" strokeWidth={10} />
          <rect x={x - 100} y={DOORS.step} width={200} height={DOORS.floor - DOORS.step} fill="#c9c0b0" stroke={INK} strokeWidth={4} />
        </g>
      ))}
      <rect x={-1400} y={DOORS.floor} width={4800} height={400} fill="#9d958a" />
      <rect x={-1400} y={DOORS.floor} width={4800} height={8} fill="#6f6860" />
    </Deep>
  </>
);

/** Someone walking by, for a street's life: pastel head, coat. */
export const Passer: React.FC<{ x: number; y: number; s: number; i: number; frame: number; facing: 1 | -1 }> = ({ x, y, s, i, frame, facing }) => (
  <Figure x={x} y={y} scale={s} facing={facing} pose={STAND} head={PASTELS[i % PASTELS.length]} coat={["#5a6488", "#7a5a8c"][i % 2]} time={frame}
    blink={(frame + i * 17) % 97 < 4} mouth="flat" />
);

