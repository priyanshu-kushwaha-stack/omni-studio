// The Window (script v5), line 98: "what you had backwards". From straight above, your academy room: a hundred desks,
// four lit teal at the front ("four places in a room"). The camera pulls back and back: the room is one block in a sea
// of desks that fills the whole map of the country, and the top four per cent are teal specks scattered from Seoul to
// Jeju. "For a seat that was never in the room": the room's four go grey. World units: the map, x = (lon - 125.8) * 300,
// y = (38.7 - lat) * 360.
import { interpolate } from "remotion";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, TEAL } from "@whatif/kit/theme";
import { mix, noise, PASTELS, ramp } from "../shared";
import { FlatShot } from "./WhosCrimson.Common";

const LONLAT: [number, number][] = [
  [126.1, 37.75], [126.7, 37.95], [127.1, 38.3], [127.8, 38.33], [128.35, 38.6], [128.6, 38.2], [129.0, 37.7], [129.35, 37.1],
  [129.45, 36.4], [129.45, 35.9], [129.4, 35.5], [129.1, 35.1], [128.6, 34.9], [128.0, 34.75], [127.6, 34.6], [127.3, 34.5],
  [126.9, 34.4], [126.5, 34.35], [126.3, 34.6], [126.4, 35.0], [126.45, 35.6], [126.65, 36.0], [126.5, 36.4], [126.15, 36.75],
  [126.4, 37.0], [126.75, 37.2], [126.6, 37.5],
];
const P = LONLAT.map(([lon, lat]) => ({ x: (lon - 125.8) * 300, y: (38.7 - lat) * 360 }));
const MAINLAND = `M${P.map((p) => `${p.x.toFixed(0)} ${p.y.toFixed(0)}`).join(" L")}Z`;
const JEJU = { x: 225, y: 1915, rx: 120, ry: 62 };
const PITCH = 12;
/** Your room: ten by ten desks, in Seoul. */
const ROOM = { x: 300, y: 354, n: 10 };
const ROOM_W = ROOM.n * PITCH;
const SEOUL = { x: ROOM.x + ROOM_W / 2, y: ROOM.y + ROOM_W / 2 };

function inside(x: number, y: number) {
  if (((x - JEJU.x) / JEJU.rx) ** 2 + ((y - JEJU.y) / JEJU.ry) ** 2 < 1) return true;
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    if ((P[i].y > y) !== (P[j].y > y) && x < ((P[j].x - P[i].x) * (y - P[i].y)) / (P[j].y - P[i].y) + P[i].x) c = !c;
  }
  return c;
}

/** The top four per cent: grid cells inside the country (outside your room), one in twenty-five, with a pop order. */
const TOP: { x: number; y: number; order: number }[] = (() => {
  const out: { x: number; y: number; order: number }[] = [];
  for (let gx = 0; gx < 100; gx++) for (let gy = 0; gy < 170; gy++) {
    const x = gx * PITCH, y = gy * PITCH;
    const inRoom = x >= ROOM.x - PITCH && x < ROOM.x + ROOM_W + PITCH && y >= ROOM.y - PITCH && y < ROOM.y + ROOM_W + PITCH;
    if (!inRoom && inside(x + 6, y + 6) && noise(gx * 131 + gy * 17) < 0.04) out.push({ x, y, order: noise(gx * 7 + gy * 3) });
  }
  return out;
})();

/** One desk from above with its student's head, in a 12 x 12 cell. */
const DeskCell: React.FC<{ x: number; y: number; head: string; desk?: string }> = ({ x, y, head, desk = "#b98d60" }) => (
  <g>
    <rect x={x + 1} y={y + 6} width={10} height={5} rx={1} fill={desk} stroke={INK} strokeWidth={0.6} />
    <circle cx={x + 6} cy={y + 3.6} r={2.4} fill={head} stroke={INK} strokeWidth={0.5} />
  </g>
);

export interface MapTimes { from: number; four: number; pull: [number, number]; specks: [number, number]; war: number; never: number; end: number }

export const MapShot: React.FC<{ frame: number; k: MapTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  // the pull back: zoom eases from the room to the whole country, Seoul's place on screen sliding up-left
  const t = ramp(frame, k.pull[0], k.pull[1]);
  const zoom = Math.exp(mix(Math.log(7.2), Math.log(0.5), t)) * (1 + 0.04 * ramp(frame, k.pull[1], k.end));
  const off = { x: mix(0, (SEOUL.x - 600) * 0.5, t), y: mix(0, (SEOUL.y - 990) * 0.5, t) };
  const cam: Camera = { x: SEOUL.x - off.x / zoom, y: SEOUL.y - off.y / zoom, zoom };
  const lit = ramp(frame, k.four, k.four + 10);
  const grey = ramp(frame, k.never, k.never + 24);
  const war = frame >= k.war && frame < k.never ? 0.5 + 0.5 * Math.sin((frame - k.war) / 4) : 0;
  const seat = interpolate(grey, [0, 1], [1, 0]);
  return (
    <FlatShot cam={cam} mood={mood} actors={null} back={
      <g>
        <defs>
          <pattern id="w-desks" width={PITCH * 2} height={PITCH} patternUnits="userSpaceOnUse">
            <DeskCell x={0} y={0} head={PASTELS[0]} />
            <DeskCell x={PITCH} y={0} head={PASTELS[3]} />
          </pattern>
          <pattern id="w-desks2" x={PITCH} y={PITCH} width={PITCH * 2} height={PITCH * 2} patternUnits="userSpaceOnUse">
            <DeskCell x={0} y={0} head={PASTELS[5]} />
            <DeskCell x={PITCH} y={0} head={PASTELS[2]} />
          </pattern>
        </defs>
        <rect x={-6000} y={-6000} width={14000} height={14000} fill="#bcd6d9" />
        {/* the sea's faint ruled lines, like a paper map */}
        {Array.from({ length: 40 }, (_, i) => <line key={i} x1={-2000} y1={-400 + i * 80} x2={3200} y2={-400 + i * 80} stroke="#a9c6c9" strokeWidth={3} />)}
        <g>
          <path d={MAINLAND} fill="#efe3c8" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <ellipse cx={JEJU.x} cy={JEJU.y} rx={JEJU.rx} ry={JEJU.ry} fill="#efe3c8" stroke={INK} strokeWidth={6} />
          <clipPath id="w-land"><path d={MAINLAND} /><ellipse cx={JEJU.x} cy={JEJU.y} rx={JEJU.rx} ry={JEJU.ry} /></clipPath>
          <g clipPath="url(#w-land)">
            <rect x={0} y={0} width={1300} height={2100} fill="url(#w-desks)" />
            <rect x={0} y={0} width={1300} height={2100} fill="url(#w-desks2)" />
            {TOP.map((d, i) => {
              const on = ramp(frame, mix(k.specks[0], k.specks[1], d.order), mix(k.specks[0], k.specks[1], d.order) + 6);
              return on > 0 ? (
                <g key={i} opacity={on}>
                  <circle cx={d.x + 6} cy={d.y + 6} r={11} fill={TEAL} opacity={0.35} />
                  <rect x={d.x + 1} y={d.y + 6} width={10} height={5} rx={1} fill={TEAL} stroke={INK} strokeWidth={0.6} />
                </g>
              ) : null;
            })}
          </g>
        </g>
        {/* your room: walls round a hundred desks, the four seats at the front lit teal */}
        <rect x={ROOM.x - 4} y={ROOM.y - 4} width={ROOM_W + 8} height={ROOM_W + 8} fill="#e6dcc8" stroke={INK} strokeWidth={2.2} />
        {Array.from({ length: ROOM.n * ROOM.n }, (_, n) => {
          const c = n % ROOM.n, r = Math.floor(n / ROOM.n);
          const four = r === 0 && c >= 3 && c <= 6;
          return <DeskCell key={n} x={ROOM.x + c * PITCH} y={ROOM.y + r * PITCH} head={PASTELS[(c * 3 + r * 5) % PASTELS.length]}
            desk={four && lit > 0 ? (seat > 0.5 ? TEAL : "#9a9a94") : "#b98d60"} />;
        })}
        {lit > 0 && (
          <rect x={ROOM.x + 3 * PITCH - 1.5} y={ROOM.y + 4} width={4 * PITCH + 3} height={9} rx={2} fill="none" stroke={TEAL}
            strokeWidth={1.2 + war * 1.5} opacity={lit * seat} />
        )}
        {/* "six weeks of war": the room's walls flush red while the line runs */}
        {war > 0 && <rect x={ROOM.x - 4} y={ROOM.y - 4} width={ROOM_W + 8} height={ROOM_W + 8} fill="none" stroke="#D8344F" strokeWidth={2 + 6 / zoom} opacity={0.4 + 0.5 * war} />}
      </g>
    } />
  );
};
