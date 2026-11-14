// More Hours' v5 moments (script.md, More Hours). Every frame from shot.v3 (current numbering, V5 in V5.Kit).
//
//   58     the evening news: one window of the hundred, close: the TV on, a newsreader mid-sentence, the hundred
//          windows behind her; on the sofa in front of it, the viewer asleep under the band, her pale worker typing.
//          Pull back: every window the same. Nobody's up to watch it.
//   59-61  noon, the bunk room in hard daylight: you flat on the bottom bunk, eyes squeezed shut, the band on; above
//          you the pale figure on its floating chair, arms folded, laptop shut; one eye opens; it taps its wrist; your
//          brother at the door with a sandwich, takes a bite: "You're doing it wrong."
import { STAND } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { INK } from "@whatif/kit/theme";
import { bandLight, Blanket, Ghost, Sleeper, Thread } from "../parts";
import { BUNK, BunkRoom } from "../sets/BunkRoom";
import { windowAt, WindowStreetScene } from "../sets/WindowStreet";
import { camAt, current, GHOST, lineEnd, PASTELS } from "../shared";
import { aimArm, Brother, handAt, talk, type Body, type Face } from "./Crumbs.Rig";
import { atV, FoldedGhost, gapAfter, V5 } from "./V5.Kit";

// ------------------------------------------------------------------------------------------------ 58: the news

export function newsSpan(v3: Clip[]) {
  return { from: v3[V5.news].from - 6, to: gapAfter(v3, V5.news) };
}

const NEWS_WIN = { col: 3, row: 2 };

/** The room behind one window: the TV with the news on, the viewer asleep on the sofa in front of it. Window px. */
const NewsRoom: React.FC<{ frame: number; talking: boolean }> = ({ frame, talking }) => {
  const r = windowAt(NEWS_WIN.col, NEWS_WIN.row);
  const x0 = r.x + 16;
  const w = r.w - 32;
  const mouth = talking && Math.floor(frame / 4) % 2 === 0;
  return (
    <g>
      <clipPath id="v5-news-room"><rect x={x0} y={r.y} width={w} height={r.h} /></clipPath>
      <g clipPath="url(#v5-news-room)">
        <rect x={x0} y={r.y} width={w} height={r.h} fill="#1d2140" />
        <circle cx={x0 + 24} cy={r.y + 46} r={44} fill="#bfd8ff" opacity={0.22} />
        {/* the TV on its cabinet */}
        <rect x={x0 + 6} y={r.y + 66} width={38} height={22} fill="#5a3a28" stroke={INK} strokeWidth={1.5} />
        <rect x={x0 + 2} y={r.y + 30} width={46} height={34} rx={3} fill="#22252e" stroke={INK} strokeWidth={1.5} />
        <rect x={x0 + 5} y={r.y + 33} width={40} height={27} rx={2} fill="#2b3f7a" />
        {/* behind the newsreader: the hundred windows, every one lit teal (everyone at work, asleep) */}
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={x0 + 7 + (i % 6) * 6.3} y={r.y + 35 + Math.floor(i / 6) * 5} width={4} height={3.4} fill="#9fe7ec" opacity={0.8} />
        ))}
        <rect x={x0 + 5} y={r.y + 52} width={40} height={8} fill="#8a96a8" />
        <path d={`M${x0 + 17} ${r.y + 60} Q${x0 + 25} ${r.y + 44} ${x0 + 33} ${r.y + 60}Z`} fill="#c0392b" />
        <circle cx={x0 + 25} cy={r.y + 44} r={5} fill={PASTELS[3]} stroke={INK} strokeWidth={1} />
        <ellipse cx={x0 + 25} cy={r.y + 46.4} rx={1.6} ry={mouth ? 1.3 : 0.4} fill={INK} />
        {/* the sofa and the viewer asleep on it, the band on, her worker typing above */}
        <rect x={x0 + 50} y={r.y + 64} width={w - 46} height={24} rx={5} fill="#7a5a8c" stroke={INK} strokeWidth={1.5} />
        <Sleeper id="v5-news" x={x0 + 60} y={r.y + 64} scale={0.28} tilt={-72} head={PASTELS[1]} scarf={undefined} tuft={false} lit={1} />
        <path d={`M${x0 + 66} ${r.y + 88} Q${x0 + 72} ${r.y + 66} ${x0 + 90} ${r.y + 68} T${x0 + 112} ${r.y + 74} V${r.y + 90} H${x0 + 66}Z`}
          fill="#3e5c8f" stroke={INK} strokeWidth={1.5} />
        <Ghost x={x0 + 72} y={r.y + 54} scale={0.17} t={1} frame={frame} head="#e3d6ef" worry={false} />
      </g>
    </g>
  );
};

export const NewsWindow: React.FC<{ frame: number; v3: Clip[] }> = ({ frame, v3 }) => {
  const { from, to } = newsSpan(v3);
  const r = windowAt(NEWS_WIN.col, NEWS_WIN.row);
  const c = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  const back = atV(v3, V5.news, 0.55);
  const cam = camAt(frame, [[from, { x: c.x, y: c.y, zoom: 6.4 }], [back, { x: c.x, y: c.y, zoom: 5.6 }], [to, { x: c.x + 120, y: c.y - 30, zoom: 2.2 }]]);
  return (
    <WindowStreetScene frame={frame} mood="night" cam={drift(cam, frame, "v5-news", 1)} shut={1} sign queue={0}
      actors={<NewsRoom frame={frame} talking={frame < lineEnd(v3, V5.news) + 30} />} />
  );
};

// ------------------------------------------------------------------------------------------------ 59-61: noon

export function noonSpan(v3: Clip[]) {
  return { from: gapAfter(v3, V5.news), to: v3[V5.push].from - 3 };
}

const Y = BUNK.you;
const G = BUNK.ghost;
/** Your brother in the doorway, side on, facing into the room. */
const BRO: Body = { x: 1780, y: 1230, scale: 2.2, facing: -1, pose: STAND };

export const NoonBunk: React.FC<{ frame: number; v3: Clip[] }> = ({ frame, v3 }) => {
  const n = V5.noon;
  const { from, to } = noonSpan(v3);
  const h0 = lineEnd(v3, n);
  const hold = (p: number) => Math.round(h0 + (v3[n + 1].from - h0) * p);
  const eye = hold(0.3);
  const tapAt = hold(0.5);
  const bite = [hold(0.78), hold(0.92)] as const;
  const wrong = [v3[V5.wrong].from, lineEnd(v3, V5.wrong)] as const;
  const shot = current(frame, [[from, "wide"], [eye, "eye"], [tapAt, "ghost"], [v3[n + 1].from - 3, "two"], [wrong[0] - 3, "bro"],
    [wrong[1] + 6, "wide2"]]);
  const views: Record<typeof shot, { x: number; y: number; zoom: number }> = {
    wide: camAt(frame, [[from, { x: 960, y: 560, zoom: 1.0 }], [eye, { x: 940, y: 560, zoom: 1.06 }]]),
    eye: { x: 560, y: 640, zoom: 2.2 },
    ghost: camAt(frame, [[tapAt, { x: 1010, y: 560, zoom: 1.9 }], [v3[n + 1].from - 3, { x: 1000, y: 560, zoom: 2.05 }]]),
    two: camAt(frame, [[v3[n + 1].from - 3, { x: 780, y: 560, zoom: 1.3 }], [wrong[0] - 3, { x: 800, y: 560, zoom: 1.4 }]]),
    bro: camAt(frame, [[wrong[0] - 3, { x: 1640, y: 470, zoom: 2.1 }], [wrong[1] + 6, { x: 1640, y: 470, zoom: 2.25 }]]),
    wide2: camAt(frame, [[wrong[1] + 6, { x: 960, y: 560, zoom: 1.08 }], [to, { x: 960, y: 560, zoom: 1.0 }]]),
  };
  const open = frame >= eye;
  const light = bandLight(Y.x, Y.y, Y.scale, Y.tilt);
  const biting = frame >= bite[0] && frame < bite[1];
  const bro: Body = { ...BRO };
  const hb = { x: BRO.x - 30, y: BRO.y - 420 };
  // the sandwich in his BACK hand (he faces left), up to his mouth for the bite
  bro.pose = { ...STAND, armB: biting ? aimArm(BRO, { x: BRO.x - 70, y: BRO.y - 600 }) : aimArm(BRO, hb) };
  const hand = handAt(bro, "back");
  const broFace: Face = { brows: frame >= wrong[0] ? "raised" : "none", lids: 0.3, mouth: biting ? "o" : talk(frame, wrong[0], wrong[1], "flat"),
    eyes: 1, look: { x: 1, y: 0.3 } };
  return (
    <BunkRoom frame={frame} mood="day" view={drift(views[shot], frame, "v5-noon", 2)} you="none" jarFill={0.7}>
      {/* hard daylight through the red curtains */}
      <polygon points="-200,-200 420,-200 1100,1100 300,1100" fill="#fff1c8" opacity={0.16} />
      <Sleeper id="v5-noon" x={Y.x} y={Y.y} scale={Y.scale} tilt={Y.tilt} eyes={open ? "open" : "shut"} mouth={open ? "o" : "flat"}
        lit={1} />
      <Blanket x0={560} x1={1630} top={680} base={900} />
      <circle cx={light.x} cy={light.y} r={34} fill={GHOST.light} opacity={0.3} />
      <Thread a={light} b={{ x: G.x + 30, y: G.y - 230 }} t={0.55} />
      <FoldedGhost x={G.x} y={G.y} scale={G.scale} frame={frame} facing={-1} tap={frame >= tapAt ? 1 : 0}
        look={open ? { x: 0.7, y: 0.7 } : { x: 0.5, y: 0.9 }} brows={frame >= tapAt ? "angry" : "flat"} />
      <Brother body={bro} face={broFace} frame={frame} />
      <g transform={`translate(${hand.x} ${hand.y}) rotate(-20)`}>
        <rect x={-42} y={-26} width={84} height={22} rx={8} fill="#e9c98f" stroke={INK} strokeWidth={4} />
        <rect x={-44} y={-6} width={88} height={10} fill="#7fc29b" stroke={INK} strokeWidth={3} />
        <rect x={-42} y={4} width={84} height={22} rx={8} fill="#e9c98f" stroke={INK} strokeWidth={4} />
      </g>
    </BunkRoom>
  );
};
