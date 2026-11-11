// The copy shop near college, for "The clerk" (Clerk.tsx). Drawn for the REF camera like the shared sets
// (sets/common.tsx). Two views:
//
//   view "street"  outside: the shop front with its window (the copier glowing inside), the open door, a sign board
//                  with a page-stack icon (no words), the pavement where the queue of six stands out of the door
//                  (SHOP_STREET.queue, facing right), and the college wall far back.
//   view "inside"  side on: the door on the street at the left, the queue of six inside (SHOP.queue, facing right),
//                  a bare stretch of wall above them for the paper diagram (SHOP.wall), the counter at the right with
//                  the clerk behind it (draw <ShopCounter/> AFTER the clerk) and the copier behind him, its light bar
//                  sweeping while it runs and copies stacking in its tray (<Copier/> in the actors' slot).
//
// Also here: the clerk himself (grey head, spectacles), the thin folder and the stack of copies.
import { Figure, type FigureProps } from "@whatif/kit/rig/Figure";
import { joints, STAND } from "@whatif/kit/rig/pose";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { headAt } from "../parts";
import { noise, PASTELS } from "../shared";
import { Deep } from "../sets/common";

export type ShopView = "street" | "inside";

/** Inside anchors (feet line 960, scale about 1.15). */
export const SHOP = {
  floor: 960,
  /** The counter: x span and top. You stand at `you` in front of it; the clerk behind it at `clerk`. */
  counter: { from: 1170, to: 1560, top: 806 },
  you: { x: 1080, y: 960 },
  clerk: { x: 1380, y: 960 },
  /** The copier behind the clerk (base centre). */
  copier: { x: 1720, y: 960 },
  /** The queue inside, front (nearest the counter) first, facing right. */
  queue: [930, 800, 670, 540, 410, 280],
  /** The street door. */
  door: { x: 60, w: 200, top: 300 },
  /** A bare stretch of wall above the queue for the paper diagram (centre and size). */
  wall: { x: 620, y: 330, w: 700, h: 340 },
} as const;

/** Street anchors. */
export const SHOP_STREET = {
  floor: 960,
  /** The queue out of the door, front first (the front one stands in the doorway), facing right. */
  queue: [1560, 1420, 1280, 1140, 1000, 860],
  /** You arrive at the back of the queue. */
  arrive: { from: -150, to: 700 },
  door: { x: 1520, w: 230, top: 420 },
  window: { x: 980, y: 400, w: 440, h: 330 },
} as const;

export const CLERK = { head: "#a9adb3", coat: "#4a5560" } as const;

/** The six in the queue: pastel heads, a couple in coats, one with a phone. */
export const QUEUERS = Array.from({ length: 6 }, (_, i) => ({
  head: PASTELS[(i * 5 + 2) % PASTELS.length],
  coat: i % 3 === 1 ? "#3f4a5c" : i === 4 ? "#6a4f6e" : undefined,
  phone: i === 2,
  scale: 1.1 + noise(i + 30) * 0.1,
}));

/** The clerk: a grey head with round spectacles over the eyes. Same props as a Figure. */
export const Clerk: React.FC<Omit<FigureProps, "head">> = (p) => {
  const scale = p.scale ?? 1, facing = p.facing ?? 1, pose = p.pose ?? STAND;
  const h = headAt(p.x, p.y, scale, pose, facing);
  const ex = (p.look?.x ?? 0.4) * 6, ey = (p.look?.y ?? 0) * 4;
  return (
    <>
      <Figure head={CLERK.head} coat={CLERK.coat} {...p} />
      <g transform={`translate(${h.x} ${h.y}) rotate(${pose.tilt * facing}) scale(${scale * facing} ${scale})`}
        fill="none" stroke={INK} strokeWidth={3.5}>
        <circle cx={-10 + ex} cy={-5 + ey} r={14} />
        <circle cx={17 + ex} cy={-5 + ey} r={14} />
        <path d={`M${-24 + ex} ${-8 + ey} L-42 -12`} />
        {/* the hair: a thin grey band round the back */}
        <path d="M-44 -6 Q-46 -30 -26 -40" stroke="#7d8189" strokeWidth={8} strokeLinecap="round" />
      </g>
    </>
  );
};

/** The first student in the queue: a pastel head, a backpack on their back and a folder of their own. Same props as
 *  a Figure (facing 1 means facing the counter; the backpack sits behind). */
export const Student: React.FC<Omit<FigureProps, "head" | "coat">> = (p) => {
  const scale = p.scale ?? 1, facing = p.facing ?? 1, pose = p.pose ?? STAND;
  const j = joints(pose);
  const bx = p.x + (j.shoulder.x - 26) * scale * facing, by = p.y + (j.shoulder.y + 8) * scale;
  return (
    <>
      <g transform={`translate(${bx} ${by}) scale(${scale * facing} ${scale})`}>
        <rect x={-30} y={0} width={40} height={78} rx={14} fill="#d8763f" stroke={INK} strokeWidth={4} />
        <rect x={-26} y={44} width={30} height={22} rx={6} fill="#c25f2c" stroke={INK} strokeWidth={3} />
        <path d="M6 6 Q22 30 10 64" fill="none" stroke={INK} strokeWidth={5} />
      </g>
      <Figure head={QUEUERS[0].head} {...p} held={p.held ?? <Folder tilt={14} scale={0.85} />} />
    </>
  );
};

/** Your thin folder (Figure `held`), or flat on the counter. */
export const Folder: React.FC<{ tilt?: number; scale?: number }> = ({ tilt = -10, scale = 1 }) => (
  <g transform={`rotate(${tilt}) scale(${scale})`}>
    <rect x={-30} y={-46} width={60} height={80} rx={4} fill="#5b8fc4" stroke={INK} strokeWidth={4} />
    <rect x={-24} y={-40} width={48} height={8} rx={3} fill={PAPER} />
  </g>
);

/** The copies, a short stack of paper held against the chest (Figure `held`). */
export const Copies: React.FC<{ tilt?: number; n?: number }> = ({ tilt = -6, n = 5 }) => (
  <g transform={`rotate(${tilt})`}>
    {Array.from({ length: n }, (_, i) => (
      <rect key={i} x={-32 + i * 1.5} y={-48 - i * 3} width={60} height={80} rx={3} fill={PAPER} stroke={INK} strokeWidth={3} />
    ))}
    <rect x={-22} y={-30 - n * 3} width={36} height={6} rx={3} fill={INK} opacity={0.5} />
    <rect x={-22} y={-18 - n * 3} width={28} height={6} rx={3} fill={INK} opacity={0.5} />
  </g>
);

/** The copier, side on, base centre at (x, y). `run` true sweeps the light bar on `frame`; `copies` stacks sheets in
 *  the out tray. */
export const Copier: React.FC<{ x: number; y: number; frame: number; run?: boolean; copies?: number; scale?: number }> = ({
  x, y, frame, run, copies = 0, scale = 1,
}) => {
  const sweep = run ? (Math.sin(frame / 5) + 1) / 2 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={-140} y={-300} width={280} height={300} rx={12} fill="#d9dcd6" stroke={INK} strokeWidth={6} />
      <rect x={-140} y={-300} width={280} height={60} rx={10} fill="#bfc4bd" stroke={INK} strokeWidth={6} />
      <rect x={-150} y={-322} width={300} height={26} rx={6} fill="#a6aca5" stroke={INK} strokeWidth={5} />
      {/* the glass strip and its light */}
      <rect x={-120} y={-262} width={240} height={14} rx={4} fill="#2d3340" />
      {run && <rect x={-120 + sweep * 200} y={-264} width={40} height={18} rx={6} fill="#c8f7d8" />}
      {run && <rect x={-120 + sweep * 200 - 20} y={-278} width={80} height={46} rx={20} fill="#c8f7d8" opacity={0.25} />}
      {/* the panel, a green lamp, paper drawers */}
      <rect x={60} y={-232} width={66} height={36} rx={6} fill="#2d3340" />
      <circle cx={112} cy={-214} r={7} fill={run ? "#4fe08a" : "#3a5a48"} />
      {[0, 1].map((i) => <rect key={i} x={-120} y={-170 + i * 74} width={240} height={60} rx={6} fill="#c9cdc6" stroke={INK} strokeWidth={4} />)}
      {[0, 1].map((i) => <rect key={i} x={-30} y={-148 + i * 74} width={60} height={10} rx={5} fill={INK} opacity={0.5} />)}
      {/* the out tray at the left side, copies stacking */}
      <path d="M-140 -230 L-206 -216 L-206 -204 L-140 -214Z" fill="#a6aca5" stroke={INK} strokeWidth={4} />
      {Array.from({ length: Math.min(8, Math.floor(copies)) }, (_, i) => (
        <rect key={i} x={-200} y={-222 - i * 4} width={58} height={5} rx={2} fill={PAPER} stroke={INK} strokeWidth={1.5} />
      ))}
    </g>
  );
};

/** The counter, for the actors' slot over the clerk's legs: a wooden top, a front panel, a pen cup and a bell. */
export const ShopCounter: React.FC<{ folder?: boolean }> = ({ folder }) => {
  const c = SHOP.counter;
  return (
    <g>
      <rect x={c.from} y={c.top} width={c.to - c.from} height={26} rx={6} fill="#8a5c3b" stroke={INK} strokeWidth={5} />
      <rect x={c.from + 14} y={c.top + 26} width={c.to - c.from - 28} height={SHOP.floor - c.top - 26} fill="#b98f66" stroke={INK} strokeWidth={5} />
      {[0, 1, 2].map((i) => <rect key={i} x={c.from + 40 + i * 116} y={c.top + 60} width={90} height={110} rx={6} fill="none" stroke="#8a6646" strokeWidth={4} />)}
      <rect x={c.to - 90} y={c.top - 46} width={34} height={46} rx={5} fill="#3f6b8a" stroke={INK} strokeWidth={4} />
      {[0, 1, 2].map((i) => <line key={i} x1={c.to - 82 + i * 8} y1={c.top - 46} x2={c.to - 86 + i * 12} y2={c.top - 72} stroke={i === 1 ? "#d8344f" : INK} strokeWidth={4} strokeLinecap="round" />)}
      {folder && <g transform={`translate(${c.from + 120} ${c.top - 4}) rotate(-90)`}><rect x={-4} y={-40} width={8} height={80} fill="#5b8fc4" stroke={INK} strokeWidth={3} /></g>}
    </g>
  );
};

const Inside: React.FC<{ cam: Camera }> = ({ cam }) => {
  const d = SHOP.door;
  return (
    <>
      <Deep cam={cam} depth={0.5} flat>
        {/* the street through the door, far */}
        <rect x={-1400} y={-800} width={4800} height={1700} fill="#bfe0ea" />
      </Deep>
      <Deep cam={cam} depth={0.8} flat>
        <rect x={-1400} y={-800} width={1400 + d.x} height={1760} fill="#cfe3c9" />
        <rect x={d.x + d.w} y={-800} width={4800} height={1760} fill="#cfe3c9" />
        <rect x={d.x} y={-800} width={d.w} height={800 + d.top} fill="#cfe3c9" />
        {/* the street beyond the door: a bright pavement and a passing shape */}
        <rect x={d.x} y={d.top} width={d.w} height={SHOP.floor - d.top} fill="#f3f0e2" opacity={0.6} />
        <rect x={d.x - 14} y={d.top - 14} width={d.w + 28} height={SHOP.floor - d.top + 14} fill="none" stroke="#7a6a58" strokeWidth={14} />
        {/* a skirting board and a long shelf of paper reams over the copier corner */}
        <rect x={-1400} y={900} width={4800} height={60} fill="#b4c9ad" />
        <rect x={1380} y={240} width={720} height={16} fill="#8a6646" />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={1400 + i * 76} y={180 - (i % 3) * 6} width={64} height={60 + (i % 3) * 6} rx={3}
            fill={["#f3e9d7", "#9fc0e0", "#f2b632", "#e6a0a0"][i % 4]} stroke={INK} strokeWidth={3} />
        ))}
        {/* a price board of shapes, no words: a page, a stack, a staple */}
        <rect x={1180} y={330} width={170} height={210} rx={8} fill="#2d3340" stroke="#7a6a58" strokeWidth={8} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={1200} y={350 + i * 62} width={32} height={42} rx={3} fill={PAPER} />
            <rect x={1250} y={362 + i * 62} width={70 - i * 12} height={10} rx={5} fill={PAPER} opacity={0.7} />
          </g>
        ))}
        {/* a wall fan and a strip light */}
        <rect x={300} y={70} width={900} height={18} rx={9} fill="#fdfaf1" opacity={0.85} />
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={SHOP.floor - 20} width={4800} height={700} fill="#a9a59a" />
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-1400 + i * 160} y1={SHOP.floor - 20} x2={-1400 + i * 160 - 80} y2={1700} stroke="#000" strokeWidth={3} opacity={0.08} />)}
        {/* a painted queue line on the floor */}
        <rect x={1010} y={SHOP.floor - 6} width={14} height={60} fill="#e8c23a" />
      </Deep>
    </>
  );
};

const Street: React.FC<{ cam: Camera; frame: number }> = ({ cam, frame }) => {
  const d = SHOP_STREET.door, w = SHOP_STREET.window;
  return (
    <>
      <Deep cam={cam} depth={0.3} flat>
        <rect x={-1400} y={-800} width={4800} height={1700} fill="#bfe0ea" />
        {[-300, 400, 1500, 2300].map((x, i) => <ellipse key={x} cx={x} cy={170 + i * 20} rx={140} ry={34} fill="#fff" opacity={0.8} />)}
      </Deep>
      <Deep cam={cam} depth={0.55} flat>
        {/* the college wall and its gate far back, trees over it */}
        <rect x={-1400} y={560} width={4800} height={260} fill="#c97d5d" />
        {Array.from({ length: 26 }, (_, i) => <rect key={i} x={-1400 + i * 190} y={560} width={8} height={260} fill="#a9654a" />)}
        {[-900, -300, 300, 2100, 2700].map((x) => <circle key={x} cx={x} cy={520} r={110} fill="#5ba06f" />)}
      </Deep>
      <Deep cam={cam} depth={1}>
        <rect x={-1400} y={SHOP_STREET.floor - 20} width={4800} height={700} fill="#cfc6b4" />
        <rect x={-1400} y={SHOP_STREET.floor + 40} width={4800} height={10} fill="#b5ab97" />
        {/* the shop: facade, sign board with a page-stack icon, window, door */}
        <rect x={860} y={180} width={1100} height={SHOP_STREET.floor - 180} fill="#e6cd98" stroke={INK} strokeWidth={6} />
        <rect x={900} y={210} width={1020} height={140} rx={10} fill="#1d9a8f" stroke={INK} strokeWidth={6} />
        {[0, 1, 2].map((i) => <rect key={i} x={1360 + i * 12} y={232 - i * 10} width={90} height={100} rx={4} fill={PAPER} stroke={INK} strokeWidth={4} />)}
        <rect x={w.x} y={w.y} width={w.w} height={w.h} rx={8} fill="#fdf6dc" stroke={INK} strokeWidth={8} />
        <Copier x={w.x + w.w / 2} y={w.y + w.h + 10} frame={frame} run scale={0.85} />
        <rect x={w.x} y={w.y} width={w.w} height={w.h} rx={8} fill="#dff0f4" opacity={0.25} />
        <path d={`M${w.x + 60} ${w.y + w.h} L${w.x + 180} ${w.y}`} stroke="#fff" strokeWidth={24} opacity={0.25} />
        <rect x={d.x} y={d.top} width={d.w} height={SHOP_STREET.floor - d.top} fill="#fff4cf" stroke={INK} strokeWidth={8} />
        <rect x={d.x + d.w - 30} y={d.top} width={30} height={SHOP_STREET.floor - d.top} fill="#7a6a58" />
        {/* a cycle leaning on the wall at the left */}
        <g transform="translate(420 960)" fill="none" stroke={INK} strokeWidth={7}>
          <circle cx={-90} cy={-60} r={58} /><circle cx={90} cy={-60} r={58} />
          <path d="M-90 -60 L-20 -150 L60 -150 L90 -60 M-20 -150 L10 -60 L-90 -60 M60 -150 L70 -180" />
        </g>
      </Deep>
    </>
  );
};

/** The copy shop behind the actors. */
export const CopyShopBack: React.FC<{ cam: Camera; view: ShopView; frame: number }> = ({ cam, view, frame }) =>
  view === "street" ? <Street cam={cam} frame={frame} /> : <Inside cam={cam} />;
