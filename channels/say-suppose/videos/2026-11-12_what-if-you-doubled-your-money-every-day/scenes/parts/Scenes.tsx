// Script v2's new places (the owner's first-cut notes 2, 6 and 7: performed scenes, more situations): the flat at
// midnight, the free tram, Jonas's football ground, the bread balloon over the street, and the flour man at the back
// door. Library sets where one fits; the rest drawn in screen pixels. `focus` crops in on a speaker.
import { SetScene } from "@whatif/kit/sets/SetScene";
import { bedroom, metroCoach, stadium, street } from "@whatif/kit/sets";
import { FRIEND, HERO, PASTELS } from "@whatif/kit/sets/cast";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { INK, PAPER } from "@whatif/kit/theme";
import { LOTTE } from "./Bakery";
import { ease, mix, Push, ramp, type ShotTime } from "./util";

type Face = keyof typeof EXPRESSIONS;
/** A crop on a speaker: [zoom, origin x, origin y]. */
type Focus = [number, number, number] | null;
const Framed: React.FC<{ t: ShotTime; focus?: Focus; children: React.ReactNode }> = ({ t, focus, children }) => (
  <Push t={t} from={focus ? focus[0] : 1} to={focus ? focus[0] * 1.04 : 1.05} ox={focus ? focus[1] : 960} oy={focus ? focus[2] : 540}>
    {children}
  </Push>
);

const SmallPhone: React.FC<{ lit?: boolean }> = ({ lit = true }) => (
  <g transform="rotate(-10)"><rect x={-9} y={-30} width={18} height={30} rx={3} fill="#0d0e14" />
    {lit && <rect x={-6} y={-27} width={12} height={24} rx={2} fill="#cfe9f4" />}</g>
);
const Glass: React.FC = () => <path d="M-8 -26 L8 -26 L6 2 L-6 2Z" fill="#cfe2f0" opacity={0.85} stroke={INK} strokeWidth={2.5} />;
const Sack: React.FC = () => <path d="M-26 0 q-6 -60 26 -66 q32 6 26 66Z" fill="#e8e2cf" stroke={INK} strokeWidth={3} />;
const Bags: React.FC = () => <g>{[0, 1].map((i) => <rect key={i} x={-18 + i * 16} y={-4} width={24} height={30} rx={3} fill={PASTELS[i + 3]} stroke={INK} strokeWidth={2.5} />)}</g>;

/** Your flat above the bakery at midnight. `sleep`: Jonas under his coat, the phone face up and lit. `wake`: Jonas sits
 *  up holding the phone out; you in the doorway, scarf on, a glass of water. `lie`: he lies back down; you hold it. */
export const Midnight: React.FC<{ t: ShotTime; mode: "sleep" | "wake" | "lie" }> = ({ t, mode }) => {
  const sitting = mode === "wake";
  const sleeper = (
    <g>
      <path d="M690 770 C 760 700, 1080 700, 1150 760 L1150 800 L690 800Z" fill={FRIEND.coat} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={650} cy={752} r={40} fill={FRIEND.head} stroke={INK} strokeWidth={6} />
      <path d="M632 748 q8 6 16 0 M662 748 q8 6 16 0" fill="none" stroke={INK} strokeWidth={4} />
    </g>
  );
  const reach = sitting ? ease(ramp(t.p, 0.05, 0.3)) : 0;
  const jonasUp: Pose = { ...SEATED, armF: [mix(30, 85, reach), mix(30, 10, reach)] };
  return (
    <Framed t={t} focus={mode === "sleep" ? [1.3, 800, 760] : null}>
      <SetScene set={bedroom} mood="night" frame={t.f} cam={bedroom.cameras.wide} options={{ lamp: false, hour: 12, phoneLit: mode === "sleep", curtains: 1 }}
        cast={[
          ...(sitting ? [{ spot: "bedEdge", who: { ...FRIEND, held: <SmallPhone /> }, face: EXPRESSIONS.shocked, pose: jonasUp }] : []),
          ...(mode !== "sleep" ? [{ spot: "door", who: { ...HERO, held: mode === "wake" ? <Glass /> : <SmallPhone /> },
            face: EXPRESSIONS[mode === "wake" ? "sceptical" : "shocked"], pose: { ...STAND, armF: [55, 50] as [number, number] } }] : []),
        ]}
        actors={!sitting ? sleeper : undefined} />
    </Framed>
  );
};

/** Day twenty-two: the whole tram free. You at the door tapping your phone on the reader, again and again; the woman with
 *  her bags; Jonas pretending not to know you; the driver half turned at the front. */
export const TramRide: React.FC<{ t: ShotTime; focus?: "woman" | "driver" | "jonas" | "you" | null; full?: boolean }> = ({ t, focus = null, full }) => {
  const tap = full ? 0 : Math.max(0, Math.sin(t.f / 5)) * 18;
  const crops: Record<string, Focus> = { woman: [1.6, 1220, 640], driver: [1.7, 1780, 560], jonas: [1.7, 520, 640], you: [1.6, 846, 560] };
  return (
    <Framed t={t} focus={focus ? crops[focus] : null}>
      <SetScene set={metroCoach} mood="day" frame={t.f} cam={metroCoach.cameras.wide} options={{ speed: full ? 3 : 7, ads: ["#e3b45c", "#7fa0c4"] }}
        cast={[
          { spot: "seatLeft", who: { ...FRIEND, look: { x: -0.9, y: 0.3 } }, face: EXPRESSIONS[focus === "jonas" ? "sceptical" : "neutral"] },
          { spot: "seat", who: { head: "#e6a0a0", coat: "#7a4a5a", held: <Bags /> }, face: EXPRESSIONS[focus === "woman" && !full ? "sceptical" : "happy"] },
          { spot: "window", who: { head: PASTELS[0], coat: "#5a5f6a" }, face: EXPRESSIONS.happy },
          { spot: "pole", who: { ...HERO, held: <SmallPhone /> }, face: EXPRESSIONS.happy, pose: { ...STAND, armF: [70 + tap, 40] } },
        ]}
        actors={<Figure x={1800} y={960} scale={1.2} facing={-1} pose={{ ...STAND, armF: [70, 40] }} head="#c9b79c" coat="#2f3a4a" cap="#2f3a4a"
          {...EXPRESSIONS[focus === "driver" ? "sceptical" : "neutral"]} time={t.f / 30} look={{ x: 0.8, y: 0.1 }} />} />
    </Framed>
  );
};

/** Day thirty-three: the small ground at the end of the tram line. You and Jonas in the front row; the scoreboard. */
export const Ground: React.FC<{ t: ShotTime; jonas: "sit" | "shock" | "jump" | "hands"; score?: string }> = ({ t, jonas, score = "1 : 0" }) => {
  const up = jonas === "jump" && Math.floor(t.f / 18) % 2 === 0;
  const pose: Pose = jonas === "hands" ? { ...SEATED, armF: [-20, -10], armB: [20, -10] }
    : up ? { ...STAND, armF: [170, 10], armB: [-170, -10] } : SEATED;
  return (
    <Framed t={t}>
      <SetScene set={stadium} mood="day" frame={t.f} cam={jonas === "sit" ? stadium.cameras.wide : stadium.cameras.twoShot} options={{ wave: null, flags: false, screen: "replay" }}
        cast={[
          { spot: "seat", who: { ...HERO, held: <SmallPhone /> }, face: EXPRESSIONS.happy, pose: { ...SEATED, armF: [70, 40] } },
          { spot: "neighbour", who: { ...FRIEND, look: { x: 0, y: -0.4 } }, face: EXPRESSIONS[jonas === "sit" ? "sceptical" : jonas === "hands" ? "happy" : "shocked"], pose },
        ]}
        actors={
          <g>
            <rect x={776} y={186} width={368} height={188} fill="#2a6a3a" />
            <text x={960} y={316} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={110} fill={PAPER}>{score}</text>
          </g>
        } />
    </Framed>
  );
};

/** Day thirty-five, dawn: the bread balloon over the roofs, a basket of rolls going up on a rope. Lotte in her doorway,
 *  arms folded; Jonas on the rope; the flour man unloading sacks. `gone`: the balloon drifts off and Lotte goes in. */
export const Balloon: React.FC<{ t: ShotTime; gone?: boolean; focus?: "lotte" | "jonas" | null; jonasFace?: Face; lotteFace?: Face }> = ({
  t, gone, focus = null, jonasFace = "happy", lotteFace = "sceptical",
}) => {
  const drift = gone ? ease(t.p) : 0;
  const bx = mix(1150, 2100, drift) + Math.sin(t.f / 40) * 12;
  const by = mix(360, 120, drift) + Math.sin(t.f / 25) * 8;
  const hand = { x: 1110, y: 760 };
  const crops: Record<string, Focus> = { lotte: [1.7, 330, 720], jonas: [1.6, 1100, 640] };
  return (
    <Framed t={t} focus={focus ? crops[focus] : null}>
      <SetScene set={street} mood="morning" frame={t.f} cam={street.cameras.wide} options={{ auto: false, bus: null, crowd: false }} cast={[]}
        actors={
          <>
            <defs><clipPath id="bal"><ellipse cx={0} cy={0} rx={160} ry={190} /></clipPath></defs>
            <path d={`M${bx} ${by + 250} Q ${mix(bx, hand.x, 0.5) - 40} ${gone ? 900 : 620} ${gone ? hand.x + 20 : hand.x} ${gone ? 980 : hand.y}`}
              fill="none" stroke={INK} strokeWidth={4} opacity={gone ? 1 - ramp(t.p, 0.2, 0.5) : 1} />
            <g transform={`translate(${bx} ${by})`}>
              <g clipPath="url(#bal)">
                {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-160 + i * 40} y={-200} width={40} height={400} fill={i % 2 ? "#d8344f" : PAPER} />)}
              </g>
              <ellipse cx={0} cy={0} rx={160} ry={190} fill="none" stroke={INK} strokeWidth={7} />
              <path d="M-60 175 L-40 230 M60 175 L40 230" stroke={INK} strokeWidth={4} />
              <rect x={-50} y={228} width={100} height={50} rx={6} fill="#b8874f" stroke={INK} strokeWidth={5} />
              {!gone && [0, 1, 2].map((i) => <ellipse key={i} cx={-28 + i * 28} cy={224} rx={18} ry={11} fill="#d89a58" stroke={INK} strokeWidth={3} />)}
            </g>
            {!gone || t.p < 0.4 ? (
              <g>
                <rect x={180} y={620} width={230} height={390} fill="#ffd8a0" opacity={0.5} stroke={INK} strokeWidth={8} />
                <Figure x={300} y={1010} scale={1.3} facing={1} pose={{ ...STAND, armF: [25, 20], armB: [-25, 20] }} {...LOTTE}
                  {...EXPRESSIONS[lotteFace]} time={t.f / 30} look={{ x: 0.8, y: -0.5 }} />
              </g>
            ) : <rect x={180} y={620} width={230} height={390} fill="#3a2a20" stroke={INK} strokeWidth={8} />}
            <Figure x={1060} y={1010} scale={1.35} facing={1} pose={{ ...STAND, armF: gone ? [40, 20] : [150, 10], armB: [-12, 14] }} {...FRIEND}
              {...EXPRESSIONS[gone ? "sad" : jonasFace]} time={t.f / 30 + 1} look={{ x: 0.3, y: -0.8 }} />
            <rect x={1500} y={760} width={420} height={250} rx={14} fill="#8a8f98" stroke={INK} strokeWidth={7} />
            <Figure x={1560} y={1010} scale={1.45} facing={-1} pose={{ ...STAND, armF: [70, 50], armB: [-20, 20] }} head="#c9b79c" coat="#4a4a52" cap="#4a4a52"
              {...EXPRESSIONS.neutral} time={t.f / 30 + 2} look={{ x: 0.5, y: 0 }} held={<Sack />} />
          </>
        } />
    </Framed>
  );
};

/** Day forty, dusk: the bakery's back door. The flour man, arms folded, a sack half off his van; Lotte in the doorway;
 *  above the oven behind her, her grandfather's framed note. `take`: she takes the sack. */
export const BackDoor: React.FC<{ t: ShotTime; speaker?: "flour" | "lotte" | null; take?: boolean; lotteFace?: Face; flourFace?: Face }> = ({
  t, speaker = null, take, lotteFace = "sceptical", flourFace = "determined",
}) => {
  const crops: Record<string, Focus> = { flour: [1.6, 1400, 640], lotte: [1.7, 640, 640] };
  return (
    <Framed t={t} focus={speaker ? crops[speaker] : null}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="bd-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c99a8e" /><stop offset="1" stopColor="#4a5a8c" /></linearGradient>
          <radialGradient id="bd-in" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stopColor="#ffd8a0" /><stop offset="1" stopColor="#6a4a32" /></radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#bd-sky)" />
        <rect x={0} y={140} width={1100} height={870} fill="#8a4a3a" stroke={INK} strokeWidth={8} />
        {Array.from({ length: 14 }, (_, r) => <line key={r} x1={0} y1={200 + r * 60} x2={1100} y2={200 + r * 60} stroke="#6a3a2c" strokeWidth={4} />)}
        <rect x={420} y={340} width={420} height={670} fill="url(#bd-in)" stroke={INK} strokeWidth={10} />
        <g transform="translate(560 400)">
          <rect x={0} y={0} width={140} height={84} fill="#6b4a32" stroke={INK} strokeWidth={5} />
          <rect x={10} y={10} width={120} height={64} fill="#c9b98f" />
          <text x={70} y={50} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={12} fill="#5a4a2a">50 000 000 Mark</text>
        </g>
        <rect x={440} y={600} width={380} height={120} rx={10} fill="#3a2a24" stroke={INK} strokeWidth={6} />
        <rect x={0} y={1010} width={1920} height={70} fill="#3a3a44" />
        <rect x={1180} y={560} width={760} height={420} rx={20} fill="#c9c6c0" stroke={INK} strokeWidth={8} />
        <rect x={1180} y={580} width={160} height={380} fill="#2a2a30" />
        {[0, 1, 2].map((i) => <path key={i} d={`M${1200 + i * 46} 960 q-6 -80 22 -90 q30 10 24 90Z`} fill="#e8e2cf" stroke={INK} strokeWidth={4} />)}
        <circle cx={1300} cy={1000} r={46} fill="#2a2a30" stroke={INK} strokeWidth={6} />
        <circle cx={1800} cy={1000} r={46} fill="#2a2a30" stroke={INK} strokeWidth={6} />
        <Figure x={640} y={1060} scale={1.6} facing={1} pose={{ ...STAND, armF: take ? [80, 30] : [30, 20], armB: [-12, 14] }} {...LOTTE}
          {...EXPRESSIONS[lotteFace]} time={t.f / 30} look={{ x: 0.9, y: 0.1 }} held={take ? <Sack /> : undefined} />
        <Figure x={1080} y={1060} scale={1.8} facing={-1} pose={{ ...STAND, armF: take ? [20, 10] : [35, 25], armB: [-30, 20] }} head="#c9b79c"
          coat="#4a4a52" cap="#4a4a52" {...EXPRESSIONS[flourFace]} time={t.f / 30 + 2} look={{ x: 0.9, y: 0.1 }} />
        {!take && <g transform="translate(1200 900) rotate(-20)"><Sack /></g>}
      </svg>
    </Framed>
  );
};

