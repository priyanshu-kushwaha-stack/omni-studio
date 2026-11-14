// The Window (v7), the academy at night from the side, for the faces: the rival stands up before you can ("Backs. Go
// on, weatherman. Say it again."); you, close, your eyes going from the backs to the glass, recognition, the smile, your
// phone coming up (outside review v6: micro-action, not a held face); your best friend's hug under -84 (the film's
// first picture, again), then his phone up against yours, the finger, the glare that wants to beat you at everything,
// the clap on the shoulder ("That's your best friend"); "Weather?" "Clear." The black glass of the windows runs along
// the back wall, the room's cards glinting teal in it after the peak.
import { Figure, type FigureProps } from "@whatif/kit/rig/Figure";
import { lerpPose, SEATED, seatedY, STAND, type Pose } from "@whatif/kit/rig/pose";
import type { MoodName } from "@whatif/kit/stage/moods";
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook } from "@whatif/kit/stage/moods";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { INK, TEAL } from "@whatif/kit/theme";
import { Bubble, headAt } from "../parts";
import { blinking, camAt, HERO, MINJUN, mix, noise, PASTELS, ramp, TAEHO } from "../shared";
import { aimArm, ArmOver, hug, mixArm, talk, type Body } from "./HerBack.Sister";
import { FlapCard, opened } from "./Window.Glass";

const FLOOR = 960;
const S = 1.15;
const SEAT_TOP = 850;
const SY = seatedY(SEAT_TOP, S);
const YOU_X = 620;
const TH_X = 1260;
const MJ_X = 752;

type Face = Pick<FigureProps, "brows" | "lids" | "mouth" | "eyes" | "look">;

/** The back wall: pale paint, the long black window with the room's faint reflections, the sill; the floor. `teal`
 *  lets the reflected cards glint (after the peak). */
const ClassWall: React.FC<{ frame: number; teal: number }> = ({ frame, teal }) => (
  <g>
    <rect x={-1400} y={-800} width={4800} height={2600} fill="#e3dac4" />
    <rect x={-1400} y={170} width={4800} height={470} fill="#0f1730" />
    {Array.from({ length: 40 }, (_, i) => {
      const x = -900 + i * 110 + noise(i) * 40;
      const y = 300 + noise(i + 9) * 240;
      return (
        <g key={i} opacity={0.5}>
          <circle cx={x} cy={y} r={14} fill={PASTELS[i % PASTELS.length]} opacity={0.35} />
          {teal > 0 && <rect x={x - 18} y={y - 52} width={36} height={16} rx={3} fill={noise(i + 3) < 0.08 ? "#D8344F" : TEAL}
            opacity={teal * (0.6 + 0.3 * Math.sin(frame / 20 + i))} />}
        </g>
      );
    })}
    {Array.from({ length: 16 }, (_, i) => <rect key={i} x={-1000 + i * 300} y={170} width={24} height={470} fill="#c9c2b0" stroke={INK} strokeWidth={4} />)}
    {Array.from({ length: 16 }, (_, i) => <path key={`g${i}`} d={`M${-960 + i * 300} 170 l60 0 l-130 470 l-60 0Z`} fill="#dfe9ff" opacity={0.08} />)}
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

/** A phone in a hand, screen to the camera: a teal badge. Local coordinates, the hand at 0,0. */
const Phone: React.FC<{ badge?: string; tilt?: number }> = ({ badge = "1", tilt = -6 }) => (
  <g transform={`rotate(${tilt}) translate(0 -46)`}>
    <rect x={-27} y={-46} width={54} height={94} rx={9} fill="#23252b" stroke={INK} strokeWidth={4} />
    <rect x={-21} y={-36} width={42} height={72} rx={4} fill="#e9f6f3" />
    <circle cx={0} cy={-6} r={16} fill={TEAL} stroke={INK} strokeWidth={3} />
    <text x={0} y={2} textAnchor="middle" fontWeight={800} fontSize={22} fill="#fff" fontFamily="sans-serif">{badge}</text>
  </g>
);

const Shot: React.FC<{ cam: Camera; mood: MoodName; frame: number; teal: number; children: React.ReactNode }> = ({ cam, mood, frame, teal, children }) => (
  <LookContext.Provider value={moodLook(mood, { dof: 0, grade: { top: "#6a74c0", bottom: "#3a3c68", opacity: 0.28 }, vignette: 0.4 })}>
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<ClassWall frame={frame} teal={teal} />} actors={children} />
  </LookContext.Provider>
);

export interface CloseTimes {
  stand: [number, number]; says: [number, number]; point: number;
  /** Your eyes: down at the backs, up to the glass, it lands ("a face"), the smile ("the right way round"), the phone up. */
  eyes: { down: number; up: number; know: number; smile: number; phone: number };
  /** The hug and what follows: in, apart with his phone up, the finger, the glare, the clap on your shoulder. */
  hug: { from: number; apart: number; point: number; glare: number; clap: number; card: number };
  weather: [number, number]; clear: number; end: number;
}

/** Tae-ho stands up before you can: from his seat to his feet, smirking; his arm out at you on "weatherman". */
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
      <Figure head={PASTELS[1]} coat="#2f3a52" x={TH_X - 330 - 160} y={SY} scale={S} facing={1} pose={SEATED} look={{ x: 1, y: -0.3 }} eyes={1}
        mouth={up > 0.5 ? "o" : "flat"} brows={up > 0.5 ? "raised" : "none"} blink={blinking(frame, 5)} time={frame} />
      <Figure head={TAEHO.head} coat={TAEHO.coat} x={TH_X} y={y} scale={S} facing={-1} pose={pose} brows={up > 0.5 ? "angry" : "flat"} lids={0.2}
        mouth={talk(frame, k.says[0], k.says[1], "smirk")} eyes={1} look={{ x: 1, y: 0 }} blink={blinking(frame, 6)} time={frame} />
    </Shot>
  );
};

/** You, close: eyes down at the backs, up to the glass, the brows go up as it lands, the smile, your phone comes up into
 *  the frame with its badge. */
export const YourEyes: React.FC<{ frame: number; k: CloseTimes; mood: MoodName; from: number; to: number }> = ({ frame, k, mood, from, to }) => {
  const e = k.eyes;
  const up = ramp(frame, e.up, e.up + 10);
  const down = ramp(frame, e.down, e.down + 6) * (1 - up);
  const know = frame >= e.know;
  const smile = frame >= e.smile;
  const phone = ramp(frame, e.phone, e.phone + 10);
  const face: Face = {
    brows: know ? "raised" : "worry", lids: know ? 0 : 0.15, mouth: smile ? "smile" : know ? "o" : "flat", eyes: know ? 1.18 : 1.05,
    look: { x: 1, y: down > 0 ? mix(0, 0.8, down) : mix(0.2, -0.6, up) },
  };
  const body: Body = { x: YOU_X, y: FLOOR, scale: S, facing: 1, pose: STAND };
  body.pose = { ...STAND, armF: mixArm(STAND.armF, aimArm(body, { x: YOU_X + 150, y: FLOOR - 330 }), phone) };
  const h = headAt(YOU_X, FLOOR, S, STAND, 1);
  const cam = drift(camAt(frame, [[from, closeUp(h.x + 40, h.y, 2.7)], [e.know, closeUp(h.x + 40, h.y, 2.95)], [to, closeUp(h.x + 60, h.y + 30, 2.7)]]), frame, "w-eyes", 2);
  return (
    <Shot cam={cam} mood={mood} frame={frame} teal={0}>
      <Figure {...HERO} {...body} {...face} blink={blinking(frame, 1)} time={frame} held={phone > 0.05 ? <Phone /> : undefined} />
    </Shot>
  );
};

/** Your best friend, out of his seat: the hug under -84 (as at the start), apart with his phone up against yours, the
 *  finger at you, the two of you nose to nose, then the clap on your shoulder and the grin. */
export const FriendHug: React.FC<{ frame: number; k: CloseTimes; mood: MoodName; from: number; to: number }> = ({ frame, k, mood, from, to }) => {
  const g = k.hug;
  const t = ramp(frame, g.from - 6, g.from + 6) * (1 - ramp(frame, g.apart, g.apart + 8));
  const h = hug({ youX: YOU_X, herX: MJ_X, floor: FLOOR, scale: S, t, hold: t, frame });
  const mj = h.her;
  const you = h.you;
  const apart = ramp(frame, g.apart, g.apart + 8);
  const point = ramp(frame, g.point, g.point + 6);
  const glare = ramp(frame, g.glare, g.glare + 8) * (1 - ramp(frame, g.clap - 4, g.clap + 4));
  const clap = ramp(frame, g.clap, g.clap + 6);
  if (apart > 0) {
    mj.x = MJ_X + 30 * apart - 16 * glare;
    you.x = YOU_X + 16 * glare;
    mj.pose = { ...STAND, lean: 8 * glare };
    you.pose = { ...STAND, lean: 8 * glare };
    const phoneUp = apart * (1 - point);
    const target = clap > 0 ? { x: you.x + 40, y: FLOOR - 230 } : { x: you.x + 110, y: FLOOR - 250 };
    mj.pose.armB = mixArm(STAND.armB, [150, 30], phoneUp);
    mj.pose.armF = mixArm(STAND.armF, aimArm(mj, target), Math.max(point, clap));
    you.pose.armF = mixArm(STAND.armF, aimArm(you, { x: you.x + 120, y: FLOOR - 330 }), apart * (1 - clap));
  }
  const mh = headAt(mj.x, mj.y, S, mj.pose, -1);
  const yh = headAt(you.x, you.y, S, you.pose, 1);
  const competing = frame >= g.point && frame < g.clap;
  const mjFace: Face = competing ? { brows: "angry", lids: 0.3, mouth: "smirk", eyes: 1.05, look: { x: 1, y: 0 } }
    : { brows: "raised", lids: 0, mouth: frame >= g.clap ? "smile" : t > 0.5 ? "smile" : "open", eyes: 1.1, look: { x: 1, y: 0 } };
  const yourFace: Face = frame >= g.glare && frame < g.clap ? { brows: "angry", lids: 0.25, mouth: "smirk", eyes: 1.05, look: { x: 1, y: 0 } }
    : { brows: "raised", lids: 0, mouth: "smile", eyes: 1.1, look: { x: 1, y: frame >= g.apart && frame < g.point ? -0.2 : 0 } };
  const mid = (mh.x + yh.x) / 2;
  const tight = frame >= g.glare && frame < g.clap;
  const cam = tight
    ? drift(camAt(frame, [[g.glare, { x: mid, y: yh.y + 20, zoom: 2.5 }], [g.clap, { x: mid, y: yh.y + 20, zoom: 2.75 }]]), frame, "w-glare", 1.5)
    : drift(camAt(frame, [[from, { x: mid + 10, y: yh.y + 170, zoom: 1.75 }], [g.glare, { x: mid + 20, y: yh.y + 160, zoom: 1.9 }],
      [g.clap, { x: mid, y: yh.y + 170, zoom: 1.85 }], [to, { x: mid, y: yh.y + 170, zoom: 1.95 }]]), frame, "w-hug", 2);
  return (
    <Shot cam={cam} mood={mood} frame={frame} teal={1}>
      <Desk x={MJ_X + 330} />
      <Chair x={MJ_X + 230} back={1} />
      <Figure head={MINJUN.head} coat={MINJUN.coat} {...mj} {...mjFace} blink={blinking(frame, 4)} time={frame} />
      <Figure {...HERO} {...you} {...yourFace} blink={blinking(frame, 1)} time={frame} held={apart > 0.3 && clap < 0.5 ? <Phone badge="1" tilt={8} /> : undefined} />
      {t > 0.05 && <ArmOver body={mj} hand={MINJUN.head} />}
      {apart > 0.3 && clap < 0.5 && <ArmOver body={mj} arm="back" hand={MINJUN.head} color={INK} held={<Phone badge="2" />} />}
      {/* his card, open since he turned round: -84, the stop crisp */}
      <FlapCard frame={frame} at={g.card} x={mh.x} headY={mh.y} r={mh.r} read={opened(frame, g.card, -84)} />
    </Shot>
  );
};

/** "Weather?" "Clear." The two of you across the room; his mouth twitches into half a smile at the end. */
export const Weather: React.FC<{ frame: number; k: CloseTimes; mood: MoodName; from: number; to: number }> = ({ frame, k, mood, from, to }) => {
  const you = headAt(YOU_X + 180, FLOOR, S, STAND, 1);
  const cam = drift(camAt(frame, [[from, { x: 960, y: 640, zoom: 1.5 }], [to, { x: 960, y: 630, zoom: 1.62 }]]), frame, "w-weather", 2);
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
