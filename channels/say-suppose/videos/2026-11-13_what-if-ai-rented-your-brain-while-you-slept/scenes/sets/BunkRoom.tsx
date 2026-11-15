// The bunk room: the film's key location and the G1 thumbnail's frame (brand/thumbs/brainrent/Rent.tsx), drawn the same
// way so the key shot and the thumbnail are one picture. The library's bedroom (`bedroom.Back`: the wall, the window
// with its red curtains, the night outside) at the thumbnail's camera, KEY_CAM {870, 690, 2}; over it, in KEY screen
// coordinates (the 1920x1080 thumbnail frame), the bunk bed (your bottom bunk, your brother's top bunk), the bedside
// table with the jar, you asleep with the band, and the rule device: the thread, the pale second you at its floating
// desk, the coins.
//
// How beats use it: <BunkRoom frame mood view ...>. `view` is a 2D camera over the KEY frame ({x, y} the centre in KEY
// pixels, zoom 1 = the thumbnail's framing exactly; 2 = twice as close). Close-ups, inserts and over-the-shoulders are
// views. `children` draw in KEY coordinates over everything (a bubble, a tag, a hand).
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { LookContext } from "@whatif/kit/stage/Look";
import { bedroom } from "@whatif/kit/sets";
import { setLook } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { bandLight, Blanket, CoinArc, deviceAt, Ghost, Jar, Sleeper, Thread } from "../parts";
import { BROTHER, HERO } from "../shared";

/** The thumbnail's stage camera over the library bedroom. */
export const KEY_CAM: Camera = { x: 870, y: 690, zoom: 2 };
/** The thumbnail's framing, as a view: zoom 1, centred. */
export const KEY_VIEW = { x: 960, y: 540, zoom: 1 };

/** Where everything is, in KEY pixels (the thumbnail's numbers). */
export const BUNK = {
  you: { x: 470, y: 700, scale: 3.1, tilt: -72 },
  ghost: { x: 1010, y: 880, scale: 1.65 },
  jar: { x: 150, y: 742 },
  /** The ghost's desk edge, where coins leave, and the top of the arc. */
  coinFrom: { x: 1115, y: 702 },
  // script v6: a low arc down over your head into the jar (it rose up along the thread before: coins come DOWN)
  coinVia: { x: 640, y: 480 },
  /** The top bunk's mattress top, and where your brother's head lies on it. */
  topBunk: { y: 170, from: 280, to: 1700 },
  brother: { x: 1300, y: 120 },
  drawer: { x: 130, y: 900 },
  door: { x: 1820, y: 560 },
};

/** The Stage camera for a view over the KEY frame: the view's centre and zoom, mapped into the bedroom's world. */
export const viewCam = (view: { x: number; y: number; zoom: number }): Camera => ({
  x: KEY_CAM.x + (view.x - 960) / KEY_CAM.zoom, y: KEY_CAM.y + (view.y - 540) / KEY_CAM.zoom, zoom: KEY_CAM.zoom * view.zoom,
});

/** The room after midnight: the set's wall taken down toward the dark, so the ghost's glow carries the frame. */
const NIGHT_DARK: Record<MoodName, number> = { morning: 0, day: 0, dusk: 0.15, night: 0.42, lamp: 0.3, frozen: 0.2 };

/** Screen-space group inside the Stage's camera: actors here are authored in KEY (1920x1080) pixels. */
const OnScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <g transform={`translate(${KEY_CAM.x} ${KEY_CAM.y}) scale(${1 / KEY_CAM.zoom}) translate(-960 -540)`}>{children}</g>
);

/** The bunk bed: the bottom bunk (yours, a dark pillow so the mustard head reads, K4), the posts, the top bunk. */
const Bunks: React.FC<{ top: boolean }> = ({ top }) => (
  <g>
    <rect x={250} y={-200} width={60} height={1310} rx={18} fill="#4a3022" stroke={INK} strokeWidth={6} />
    <rect x={1690} y={-200} width={56} height={1310} rx={18} fill="#4a3022" stroke={INK} strokeWidth={6} />
    <rect x={290} y={850} width={1420} height={90} rx={20} fill="#e9dcc4" stroke={INK} strokeWidth={6} />
    <rect x={280} y={930} width={1440} height={200} fill="#5a3a28" stroke={INK} strokeWidth={6} />
    <ellipse cx={420} cy={800} rx={210} ry={95} fill="#262c45" stroke={INK} strokeWidth={6} />
    {top && (
      <g>
        <rect x={290} y={BUNK.topBunk.y + 30} width={1420} height={70} rx={14} fill="#5a3a28" stroke={INK} strokeWidth={6} />
        <rect x={300} y={BUNK.topBunk.y - 20} width={1400} height={56} rx={16} fill="#e9dcc4" stroke={INK} strokeWidth={6} />
        <rect x={300} y={BUNK.topBunk.y - 70} width={1400} height={24} rx={10} fill="#4a3022" stroke={INK} strokeWidth={5} />
        {[480, 760, 1040, 1320].map((x) => <rect key={x} x={x} y={BUNK.topBunk.y - 70} width={16} height={56} fill="#4a3022" />)}
      </g>
    )}
  </g>
);

/** The bedside table with the drawer (the band goes in it at Midnight) and the jar. */
const Bedside: React.FC<{ jarFill: number; drawerOpen: number }> = ({ jarFill, drawerOpen }) => (
  <g>
    <rect x={20} y={BUNK.jar.y} width={220} height={400} rx={10} fill="#5f3e2b" stroke={INK} strokeWidth={6} />
    <rect x={40 + drawerOpen * 60} y={BUNK.drawer.y - 50} width={180} height={90} rx={8} fill="#6f4a33" stroke={INK} strokeWidth={5} />
    <circle cx={130 + drawerOpen * 60} cy={BUNK.drawer.y - 5} r={10} fill="#c9a36b" stroke={INK} strokeWidth={3} />
    {jarFill >= 0 && <Jar x={BUNK.jar.x} y={BUNK.jar.y} fill={jarFill} />}
  </g>
);

export type BrotherPose = "none" | "watch" | "hang" | "asleep" | "sit";

/** Your brother on the top bunk: watching over the edge, hanging down (palm out), asleep, or sitting up. */
const Brother: React.FC<{ pose: BrotherPose; frame: number; face?: Partial<React.ComponentProps<typeof Figure>>; band?: boolean }> = ({ pose, frame, face, band }) => {
  if (pose === "none") return null;
  const b = BUNK.brother;
  if (pose === "asleep") {
    return <Sleeper id="brother" x={b.x} y={b.y - 40} scale={1.4} tilt={-82} head={BROTHER.head} scarf={undefined} tuft={false}
      cap={BROTHER.cap} band={!!band} />;
  }
  if (pose === "sit") {
    return <Figure x={b.x} y={BUNK.topBunk.y + 230} scale={1.3} facing={-1} pose={{ ...STAND, legB: [90, -80], legF: [92, -86] }}
      head={BROTHER.head} coat={BROTHER.coat} cap={BROTHER.cap} {...face} />;
  }
  // watch / hang: lying on his front over the edge, head and an arm down; `hang` drops lower with the palm out.
  const drop = pose === "hang" ? 150 : 40;
  const palm: Pose = { ...STAND, lean: 0, tilt: 10, armF: [pose === "hang" ? 170 : 150, 20], armB: [-170, 0] };
  return (
    <g transform={`translate(${b.x} ${BUNK.topBunk.y - 30 + drop}) rotate(180) translate(${-b.x} 0)`}>
      <Figure x={b.x} y={0} scale={1.3} facing={-1} pose={palm} head={BROTHER.head} coat={BROTHER.coat} cap={BROTHER.cap}
        eyes={1.1} {...face} blink={(frame + 31) % 97 < 4} />
    </g>
  );
};

export interface BunkRoomProps {
  frame: number;
  mood: MoodName;
  /** A 2D camera over the KEY frame; KEY_VIEW is the thumbnail. */
  view?: { x: number; y: number; zoom: number };
  /** The rule device: on at `on`, off at `off` (frames). Without `device` you sleep with the band unlit or no band. */
  device?: { on: number; off?: number; worry?: boolean };
  /** Coins drop from `from` to `to` (frames), into the jar. */
  coins?: { from: number; to?: number };
  /** You in the bottom bunk: asleep with the band, asleep without it, or out of bed (a beat draws you itself). */
  you?: "band" | "noband" | "none";
  youEyes?: "shut" | "open";
  jarFill?: number;
  topBunk?: boolean;
  brother?: BrotherPose;
  brotherFace?: Partial<React.ComponentProps<typeof Figure>>;
  brotherBand?: boolean;
  drawerOpen?: number;
  children?: React.ReactNode;
}

export const BunkRoom: React.FC<BunkRoomProps> = ({
  frame, mood, view = KEY_VIEW, device, coins, you = "band", youEyes = "shut", jarFill = 0.55, topBunk = true,
  brother = "none", brotherFace, brotherBand, drawerOpen = 0, children,
}) => {
  const room = { ...bedroom.defaults, lamp: mood === "lamp" ? true : false, hour: 3, curtains: mood === "night" ? 0.25 : 0, phoneLit: false };
  const t = device ? deviceAt(frame, device.on, device.off) : 0;
  const Y = BUNK.you;
  const light = bandLight(Y.x, Y.y, Y.scale, Y.tilt);
  const G = BUNK.ghost;
  const actors = (
    <OnScreen>
      <g>
        <rect x={-40} y={-240} width={2000} height={1400} fill="#0b1024" opacity={NIGHT_DARK[mood]} />
        <Bedside jarFill={jarFill} drawerOpen={drawerOpen} />
        <Bunks top={topBunk} />
        <Brother pose={brother} frame={frame} face={brotherFace} band={brotherBand} />
        {you !== "none" && <circle cx={Y.x} cy={Y.y} r={46 * Y.scale * 1.9} fill="url(#bunk-shade)" />}
        <defs>
          <radialGradient id="bunk-shade" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.45" stopColor="#07080d" stopOpacity={mood === "night" || mood === "lamp" ? 0.92 : 0.4} />
            <stop offset="1" stopColor="#07080d" stopOpacity={0} />
          </radialGradient>
        </defs>
        {you !== "none" && <Sleeper id="you" x={Y.x} y={Y.y} scale={Y.scale} tilt={Y.tilt} head={HERO.head} scarf={HERO.scarf}
          band={you === "band"} lit={device ? t : 0} eyes={youEyes} mouth={youEyes === "shut" ? "smile" : "flat"} />}
        {you !== "none" && <Blanket x0={560} x1={1630} top={680} base={900} />}
        <Thread a={light} b={{ x: G.x - 30, y: G.y - 230 }} t={t} />
        <Ghost x={G.x} y={G.y} scale={G.scale} t={t} frame={frame} worry={device?.worry ?? true} />
        {coins && <CoinArc frame={frame} start={coins.from} end={coins.to} from={BUNK.coinFrom} via={BUNK.coinVia}
          to={{ x: BUNK.jar.x + 10, y: BUNK.jar.y - 200 }} />}
        {children}
      </g>
    </OnScreen>
  );
  const cam = viewCam(view);
  const glow = { x: 960 + (BUNK.coinFrom.x + 50 - view.x) * view.zoom, y: 540 + (BUNK.coinFrom.y - 100 - view.y) * view.zoom, r: 420 * view.zoom, color: "#bfe8ff", strength: 0.5 * t };
  return (
    <LookContext.Provider value={setLook([...bedroom.lights(room)], mood, cam, { glows: t > 0 ? [glow] : [] })}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={bedroom.Back({ cam, mood, frame, options: room })} actors={actors} />
    </LookContext.Provider>
  );
};

/** The whole frame filled by the bunk room (a beat's default picture). */
export const BunkRoomFrame: React.FC<BunkRoomProps> = (p) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <BunkRoom {...p} />
  </AbsoluteFill>
);

export { CRIMSON, PAPER };
