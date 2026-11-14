// The Window (script v5), the academy at night from the side, for the faces: the rival stands up before you can
// ("Backs. Go on, weatherman. Say it again."), your eyes going from the backs to the glass, you saying it ("I made
// it."), your best friend turned round in his seat, -84 and grinning, then the grin that wants to beat you at
// everything; the rival back to -6, arms folded; your face, never so happy to be hated less; "Weather?" "Clear." The
// black glass of the windows runs along the back wall, the room's cards glinting teal in it after the peak.
import { Figure, type FigureProps } from "@whatif/kit/rig/Figure";
import { lerpPose, SEATED, seatedY, STAND, type Pose } from "@whatif/kit/rig/pose";
import type { MoodName } from "@whatif/kit/stage/moods";
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook } from "@whatif/kit/stage/moods";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { INK, TEAL } from "@whatif/kit/theme";
import { Bubble, headAt, Meter } from "../parts";
import { blinking, camAt, HERO, MINJUN, mix, noise, PASTELS, ramp, TAEHO } from "../shared";
import { talk } from "./HerBack.Sister";

const FLOOR = 960;
const S = 1.15;
const SEAT_TOP = 850;
const SY = seatedY(SEAT_TOP, S);
const YOU_X = 620;
const TH_X = 1260;
const MJ_X = 1160;

type Face = Pick<FigureProps, "brows" | "lids" | "mouth" | "eyes" | "look">;

/** The back wall: pale paint, the long black window with the room's faint reflections, the sill; desks along the
 *  floor. `teal` lets the reflected cards glint (after the peak). */
const ClassWall: React.FC<{ frame: number; teal: number }> = ({ frame, teal }) => (
  <g>
    <rect x={-1400} y={-800} width={4800} height={2600} fill="#e3dac4" />
    <rect x={-1400} y={170} width={4800} height={470} fill="#0f1426" />
    {Array.from({ length: 40 }, (_, i) => {
      const x = -900 + i * 110 + noise(i) * 40;
      const y = 300 + noise(i + 9) * 240;
      return (
        <g key={i} opacity={0.5}>
          <circle cx={x} cy={y} r={14} fill={PASTELS[i % PASTELS.length]} opacity={0.35} />
          {teal > 0 && <rect x={x - 18} y={y - 52} width={36} height={16} rx={3} fill={noise(i + 3) < 0.1 ? "#9a9a94" : TEAL}
            opacity={teal * (0.6 + 0.3 * Math.sin(frame / 20 + i))} />}
        </g>
      );
    })}
    {Array.from({ length: 16 }, (_, i) => <rect key={i} x={-1000 + i * 300} y={170} width={16} height={470} fill="#c9c2b0" stroke={INK} strokeWidth={4} />)}
    {Array.from({ length: 16 }, (_, i) => <path key={`g${i}`} d={`M${-960 + i * 300} 170 l50 0 l-120 470 l-50 0Z`} fill="#fff" opacity={0.05} />)}
    <rect x={-1400} y={156} width={4800} height={16} fill="#c9c2b0" stroke={INK} strokeWidth={4} />
    <rect x={-1400} y={636} width={4800} height={22} fill="#d6cfbc" stroke={INK} strokeWidth={4} />
    <rect x={-1400} y={FLOOR - 10} width={4800} height={900} fill="#b7ab92" />
    <line x1={-1400} y1={FLOOR - 10} x2={3400} y2={FLOOR - 10} stroke={INK} strokeWidth={5} />
  </g>
);

const Desk: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x - 110} y={760} width={220} height={18} rx={5} fill="#a87c52" stroke={INK} strokeWidth={5} />
    <rect x={x - 96} y={778} width={192} height={30} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
    {[-90, 76].map((d) => <rect key={d} x={x + d} y={808} width={14} height={FLOOR - 818} fill="#6a4630" stroke={INK} strokeWidth={3} />)}
  </g>
);

const Chair: React.FC<{ x: number; back: 1 | -1 }> = ({ x, back }) => (
  <g>
    <rect x={x - 56} y={SEAT_TOP} width={112} height={14} rx={5} fill="#c99a68" stroke={INK} strokeWidth={4} />
    <rect x={x + back * 48 - 7} y={SEAT_TOP - 104} width={14} height={118} rx={5} fill="#c99a68" stroke={INK} strokeWidth={4} />
    {[-48, 38].map((d) => <rect key={d} x={x + d} y={SEAT_TOP + 14} width={10} height={FLOOR - SEAT_TOP - 24} fill="#8a6440" />)}
  </g>
);

const Shot: React.FC<{ cam: Camera; mood: MoodName; frame: number; teal: number; children: React.ReactNode }> = ({ cam, mood, frame, teal, children }) => (
  <LookContext.Provider value={moodLook(mood, { dof: 0, grade: { top: "#6a74c0", bottom: "#3a3c68", opacity: 0.28 }, vignette: 0.4 })}>
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<ClassWall frame={frame} teal={teal} />} actors={children} />
  </LookContext.Provider>
);

export interface CloseTimes {
  stand: [number, number]; says: [number, number]; point: number; backsEnd: number;
  eyes: [number, number]; dawn: number; bubble: number;
  mj: number; mjSnap: number; mjCompete: number; th: number; thSnap: number; beam: number;
  weather: [number, number]; clear: number; end: number;
}

/** Tae-ho stands up before you can: from his seat to his feet, smirking; "Backs. Go on, weatherman. Say it again.",
 *  his arm out at you on "weatherman". */
export const RivalStands: React.FC<{ frame: number; k: CloseTimes; mood: MoodName; from: number; to: number }> = ({ frame, k, mood, from, to }) => {
  const up = ramp(frame, k.stand[0], k.stand[1]);
  const point = ramp(frame, k.point, k.point + 8);
  const base = lerpPose(SEATED, STAND, up);
  const pose: Pose = { ...base, armF: [mix(base.armF[0], 92, point), mix(base.armF[1], 4, point)] };
  const y = mix(SY, FLOOR, up);
  const h = headAt(TH_X, FLOOR, S, STAND, -1);
  const cam = drift(camAt(frame, [[from, { x: TH_X - 140, y: h.y + 140, zoom: 1.7 }], [to, { x: TH_X - 120, y: h.y + 80, zoom: 2.05 }]]), frame, "w-rival", 3);
  return (
    <Shot cam={cam} mood={mood} frame={frame} teal={0}>
      <Chair x={TH_X} back={1} />
      <Desk x={TH_X - 330} />
      <Figure head={PASTELS[1]} coat="#2f3a52" x={TH_X - 330 - 160} y={SY} scale={S} facing={1} pose={SEATED} look={{ x: 1, y: -0.3 }} eyes={1} mouth="flat"
        blink={blinking(frame, 5)} time={frame} />
      <Figure head={TAEHO.head} coat={TAEHO.coat} x={TH_X} y={y} scale={S} facing={-1} pose={pose} brows={up > 0.5 ? "angry" : "flat"} lids={0.2}
        mouth={talk(frame, k.says[0], k.says[1], "smirk")} eyes={1} look={{ x: 1, y: 0 }} blink={blinking(frame, 6)} time={frame} />
    </Shot>
  );
};

/** You, close: your eyes go from the backs (down) up to the glass, and the smile dawns on "the right way round". */
export const YourEyes: React.FC<{ frame: number; k: CloseTimes; mood: MoodName; from: number; to: number }> = ({ frame, k, mood, from, to }) => {
  const h = headAt(YOU_X, FLOOR, S, STAND, 1);
  const up = ramp(frame, k.eyes[0], k.eyes[1]);
  const dawn = frame >= k.dawn;
  const face: Face = { brows: dawn ? "raised" : "worry", lids: dawn ? 0 : 0.15, mouth: dawn ? "smile" : "flat", eyes: dawn ? 1.15 : 1.05,
    look: { x: 1, y: mix(0.6, -0.5, up) } };
  const cam = drift(camAt(frame, [[from, closeUp(h.x + 40, h.y, 2.7)], [to, closeUp(h.x + 40, h.y, 3.0)]]), frame, "w-eyes", 2);
  return (
    <Shot cam={cam} mood={mood} frame={frame} teal={0}>
      <Figure {...HERO} x={YOU_X} y={FLOOR} scale={S} facing={1} pose={STAND} {...face} blink={blinking(frame, 1)} time={frame} />
    </Shot>
  );
};

/** You stand at the front and say it: "I made it." The class's backs to you at the right. */
export const YouSayIt: React.FC<{ frame: number; k: CloseTimes; mood: MoodName; from: number; to: number }> = ({ frame, k, mood, from, to }) => {
  const h = headAt(YOU_X, FLOOR, S, STAND, 1);
  const cam = drift(camAt(frame, [[from, { x: YOU_X + 260, y: 640, zoom: 1.45 }], [to, { x: YOU_X + 250, y: 630, zoom: 1.52 }]]), frame, "w-say", 2);
  return (
    <Shot cam={cam} mood={mood} frame={frame} teal={0}>
      {[0, 1].map((i) => (
        <g key={i}>
          <Chair x={1000 + i * 360} back={-1} />
          <Figure head={PASTELS[(i * 3 + 2) % 8]} coat="#3b3e47" x={1000 + i * 360} y={SY} scale={S} facing={1} pose={SEATED} eyes={1} mouth="flat"
            look={{ x: 1, y: 0 }} blink={blinking(frame, i + 7)} time={frame} />
          <Desk x={1000 + i * 360 - 190} />
        </g>
      ))}
      <Figure {...HERO} x={YOU_X} y={FLOOR} scale={S} facing={1} pose={{ ...STAND, lean: -3 }} brows="raised" lids={0} mouth="smile" eyes={1.1}
        look={{ x: 1, y: -0.2 }} blink={blinking(frame, 1)} time={frame} />
      <Bubble frame={frame} at={k.bubble} x={h.x + 40} y={h.y - 60} text="I made it." size={44} />
    </Shot>
  );
};

/** Your best friend, turned round in his seat to you: -84 over him, a grin, a thumbs up; then the look that wants to
 *  beat you at everything until you both die (brows down, the grin gone sly, a finger at you). */
export const FriendStill: React.FC<{ frame: number; k: CloseTimes; mood: MoodName; from: number; to: number }> = ({ frame, k, mood, from, to }) => {
  const compete = frame >= k.mjCompete;
  const thumb = ramp(frame, k.mjSnap + 10, k.mjSnap + 20) * (1 - ramp(frame, k.mjCompete - 4, k.mjCompete + 4));
  const point = ramp(frame, k.mjCompete, k.mjCompete + 8);
  const pose: Pose = { ...SEATED, armF: [mix(mix(25, 130, thumb), 90, point), mix(mix(35, -100, thumb), 0, point)] };
  const h = headAt(MJ_X, SY, S, SEATED, -1);
  const cam = drift(camAt(frame, [[from, closeUp(h.x - 60, h.y - 40, 2.05)], [to, closeUp(h.x - 60, h.y - 40, 2.3)]]), frame, "w-mj", 2);
  return (
    <Shot cam={cam} mood={mood} frame={frame} teal={1}>
      <Desk x={MJ_X + 200} />
      <Chair x={MJ_X} back={1} />
      <Figure head={MINJUN.head} coat={MINJUN.coat} x={MJ_X} y={SY} scale={S} facing={-1} pose={pose} brows={compete ? "angry" : "raised"} lids={compete ? 0.35 : 0}
        mouth={compete ? "smirk" : "smile"} eyes={1.05} look={{ x: 1, y: 0 }} blink={blinking(frame, 4)} time={frame} />
      <Meter frame={frame} at={k.mjSnap} x={h.x} headY={h.y} r={h.r} value={-84} until={k.th} />
    </Shot>
  );
};

/** The rival turned round: the card opens at -6; arms folded, a sour look, a shrug. Then you, beaming at it. */
export const RivalSix: React.FC<{ frame: number; k: CloseTimes; mood: MoodName; from: number; to: number }> = ({ frame, k, mood, from, to }) => {
  const beam = frame >= k.beam;
  const th = headAt(TH_X, SY, S, SEATED, -1);
  const you = headAt(YOU_X, FLOOR, S, STAND, 1);
  const shrug = frame > k.thSnap + 30 && frame < k.thSnap + 44 ? Math.sin(((frame - k.thSnap - 30) / 14) * Math.PI) * 10 : 0;
  const cam = beam
    ? drift(camAt(frame, [[k.beam, closeUp(you.x + 40, you.y, 2.6)], [to, closeUp(you.x + 40, you.y, 2.9)]]), frame, "w-beam", 2)
    : drift(camAt(frame, [[from, closeUp(th.x - 60, th.y - 40, 2.1)], [k.beam, closeUp(th.x - 60, th.y - 40, 2.3)]]), frame, "w-six", 2);
  return (
    <Shot cam={cam} mood={mood} frame={frame} teal={1}>
      <Desk x={TH_X + 200} />
      <Chair x={TH_X} back={1} />
      <Figure head={TAEHO.head} coat={TAEHO.coat} x={TH_X} y={SY - shrug} scale={S} facing={-1} pose={{ ...SEATED, armF: [70, 110], armB: [60, 110] }}
        brows="flat" lids={0.4} mouth="flat" eyes={1} look={{ x: 1, y: 0.1 }} blink={blinking(frame, 6)} time={frame} />
      <Meter frame={frame} at={k.thSnap} x={th.x} headY={th.y} r={th.r} value={-6} />
      <Figure {...HERO} x={YOU_X} y={FLOOR} scale={S} facing={1} pose={STAND} brows="raised" lids={beam ? 0.15 : 0} mouth={beam ? "open" : "smile"} eyes={1.15}
        look={{ x: 1, y: 0 }} blink={blinking(frame, 1)} time={frame} />
    </Shot>
  );
};

/** "Weather?" "Clear." The two of you across the room; his mouth twitches into half a smile at the end. */
export const Weather: React.FC<{ frame: number; k: CloseTimes; mood: MoodName; from: number; to: number }> = ({ frame, k, mood, from, to }) => {
  const you = headAt(YOU_X + 180, FLOOR, S, STAND, 1);
  const cam = drift(camAt(frame, [[from, { x: 960, y: 640, zoom: 1.5 }], [to, { x: 960, y: 630, zoom: 1.6 }]]), frame, "w-weather", 2);
  return (
    <Shot cam={cam} mood={mood} frame={frame} teal={1}>
      <Figure {...HERO} x={YOU_X + 180} y={FLOOR} scale={S} facing={1} pose={STAND} brows="raised" lids={0.1} mouth="smile" eyes={1.05}
        look={{ x: 1, y: 0 }} blink={blinking(frame, 1)} time={frame} />
      <Figure head={TAEHO.head} coat={TAEHO.coat} x={TH_X + 40} y={FLOOR} scale={S} facing={-1} pose={STAND} brows={frame >= k.clear + 8 ? "raised" : "flat"} lids={0.25}
        mouth={frame >= k.clear + 8 ? "smirk" : talk(frame, k.weather[0], k.weather[1], "flat")} eyes={1} look={{ x: 1, y: 0 }} blink={blinking(frame, 6)} time={frame} />
      <Bubble frame={frame} at={k.clear} x={you.x + 40} y={you.y - 60} text="Clear." size={46} />
    </Shot>
  );
};
