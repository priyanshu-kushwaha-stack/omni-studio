// The Window (script v5), results day at home. 97: your phone in your hands, three top grades stamping into a column
// ("Top grade. Top grade. Top grade."), then the scholarship seal; your face, a grin you can't hold in. 99-100: your
// sister asleep on the sofa after the shift, vest still on, mouth open; you kneel by her face and nudge her shoulder;
// one eye opens (sleepy, the other still shut); you hold the phone up to it and say it ("I made it."); the card runs
// all the way up the teal to +100; "Before the other eye even opens.": close on her, one eye open under a +100, the
// other still shut, a slow smile. World coordinates of the flat (sets/Home.tsx).
import { spring } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import type { MoodName } from "@whatif/kit/stage/moods";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { FPS, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Bubble, headAt, Meter } from "../parts";
import { HOME, HomeBack } from "../sets/Home";
import { camAt, current, JIYOON, mix, ramp } from "../shared";
import { aimArm, mixArm, Sister, You, type Body } from "./HerBack.Sister";

// ------------------------------------------------------------------------------------------------ 97 the phone

/** The phone, big, in your two mustard thumbs: a results screen with three subject rows; each row's grade stamps on at
 *  its time; the scholarship seal slams on at `seal`. (x, y) is the phone's centre, world units. */
const ResultsPhone: React.FC<{ frame: number; x: number; y: number; rows: number[]; seal: number }> = ({ frame, x, y, rows, seal }) => {
  const w = 420, h = 780;
  const stamp = (at: number) => (frame < at ? 0 : spring({ frame: frame - at, fps: FPS, config: { damping: 9, stiffness: 240, mass: 0.5 } }));
  const icons = ["#3d6fb0", "#D8344F", "#7fc29b"];
  return (
    <g transform={`translate(${x} ${y}) rotate(-4)`}>
      <rect x={-w / 2 + 14} y={-h / 2 + 18} width={w} height={h} rx={56} fill="#000" opacity={0.3} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={56} fill="#23252b" stroke={INK} strokeWidth={8} />
      <rect x={-w / 2 + 24} y={-h / 2 + 60} width={w - 48} height={h - 120} rx={20} fill="#f6f1e4" />
      <rect x={-50} y={-h / 2 + 24} width={100} height={18} rx={9} fill="#3a3d45" />
      {/* the header bar: the exam board's colour, no words */}
      <rect x={-w / 2 + 24} y={-h / 2 + 60} width={w - 48} height={70} rx={20} fill={TEAL} />
      <rect x={-w / 2 + 24} y={-h / 2 + 100} width={w - 48} height={30} fill={TEAL} />
      <rect x={-120} y={-h / 2 + 84} width={240} height={20} rx={10} fill="#e9f6f3" opacity={0.8} />
      {rows.map((at, i) => {
        const ry = -h / 2 + 200 + i * 130;
        const s = stamp(at);
        return (
          <g key={i}>
            <rect x={-w / 2 + 50} y={ry} width={60} height={60} rx={12} fill={icons[i]} stroke={INK} strokeWidth={4} />
            <rect x={-w / 2 + 130} y={ry + 12} width={130} height={14} rx={7} fill="#cfc6b2" />
            <rect x={-w / 2 + 130} y={ry + 36} width={90} height={12} rx={6} fill="#e0d8c6" />
            {s > 0 && (
              <g transform={`translate(${w / 2 - 80} ${ry + 30}) scale(${s * (1 + 0.6 * (1 - Math.min(1, s)))}) rotate(-8)`}>
                <circle r={46} fill={MUSTARD} stroke={INK} strokeWidth={5} />
                <text y={22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} fill={INK}>1</text>
              </g>
            )}
          </g>
        );
      })}
      {frame >= seal && (
        <g transform={`translate(0 ${h / 2 - 150}) scale(${stamp(seal)}) rotate(-10)`}>
          <circle r={74} fill="none" stroke={TEAL} strokeWidth={10} />
          <circle r={56} fill={TEAL} opacity={0.9} />
          <path d="M-26 0 L-6 22 L30 -22" fill="none" stroke={PAPER} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {/* your thumbs over the edges */}
      <ellipse cx={-w / 2 - 6} cy={60} rx={40} ry={70} fill={MUSTARD} stroke={INK} strokeWidth={6} />
      <ellipse cx={w / 2 + 6} cy={110} rx={40} ry={70} fill={MUSTARD} stroke={INK} strokeWidth={6} />
    </g>
  );
};

export interface HomeTimes {
  rows: number[]; seal: number; face: number; sofa: number; crouch: [number, number]; say: number; snap: number;
  nudge: [number, number]; eye: number; close: number; smile: number; end: number;
}

const S = 1.15;
/** The sofa under the window, its seat top. */
const SOFA = { from: 360, to: 760, seat: 800 };
/** Her lying along the seat, head at the right arm. */
const HER_FEET = { x: 395, y: 812 };
const HER_HEAD = { x: HER_FEET.x + 264 * S, y: HER_FEET.y };
/** You, kneeling at her head, facing her. */
const YOU_X = 975;
const KNEEL: Pose = { ...STAND, lean: 16, drop: 56, legB: [0, -90], legF: [90, -90], armF: [70, 40], armB: [40, 60] };

/** The sofa: a back, two arms, the seat cushions. Drawn before her. */
const Sofa: React.FC = () => (
  <g>
    <rect x={SOFA.from + 10} y={600} width={SOFA.to - SOFA.from - 20} height={210} rx={30} fill="#5c7d8a" stroke={INK} strokeWidth={6} />
    <rect x={SOFA.from + 40} y={SOFA.seat - 6} width={SOFA.to - SOFA.from - 80} height={70} rx={18} fill="#6f93a0" stroke={INK} strokeWidth={5} />
    <rect x={SOFA.from - 10} y={700} width={70} height={210} rx={26} fill="#4f6f7b" stroke={INK} strokeWidth={6} />
    <rect x={SOFA.to - 60} y={700} width={70} height={210} rx={26} fill="#4f6f7b" stroke={INK} strokeWidth={6} />
    <rect x={SOFA.from + 20} y={900} width={SOFA.to - SOFA.from - 40} height={30} fill="#3f5b66" stroke={INK} strokeWidth={4} />
  </g>
);

/** The z's of a snore drifting up from her open mouth. */
const Snore: React.FC<{ frame: number; x: number; y: number }> = ({ frame, x, y }) => (
  <g>
    {[0, 1, 2].map((i) => {
      const p = ((frame + i * 26) % 78) / 78;
      return (
        <text key={i} x={x + 30 * p + i * 6} y={y - 140 * p} fontFamily={FONT} fontWeight={800} fontSize={30 + 22 * p} fill={INK}
          opacity={Math.sin(Math.PI * p) * 0.75}>z</text>
      );
    })}
  </g>
);

/** Shuts her far eye again over an open-eyed face, inside her rotated group: the Figure's head transform, then a lid of
 *  her skin over the eye and its closed line (Figure.tsx draws the eyes at -10 and 17, shifted by look.x * 12). */
const OneEyeShut: React.FC<{ body: Body }> = ({ body }) => (
  <g transform={`translate(${body.x} ${body.y}) scale(${body.scale * body.facing} ${body.scale}) translate(0 -264)`}>
    <rect x={-10 + 12 - 11} y={-5 - 15} width={22} height={30} fill={JIYOON.head} />
    <path d={`M${-10 + 12 - 9} 4 Q${2} 10 ${-10 + 12 + 9} 4`} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
  </g>
);

export const HomeShot: React.FC<{ frame: number; k: HomeTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const shot = current(frame, [[0, "phone"], [k.face, "face"], [k.sofa, "sofa"], [k.nudge[0], "nudge"], [k.say, "two"], [k.snap, "card"], [k.close, "eye"]]);
  // her: a standing figure laid along the sofa (rotated about her feet), asleep, mouth open; the nudge rocks her
  const breathe = Math.sin(frame / 22) * 1.5;
  const nudging = frame >= k.nudge[0] && frame < k.nudge[1];
  const poke = nudging ? Math.max(0, Math.sin((frame - k.nudge[0]) / 3.2)) : 0;
  const her: Body = { x: HER_FEET.x, y: HER_FEET.y - poke * 4, scale: S, facing: -1, pose: { ...STAND, armF: [4 + breathe, 6], armB: [-4, 6], lean: 0 } };
  const herHead = { x: HER_HEAD.x, y: HER_HEAD.y, r: 46 * S };
  const oneEye = frame >= k.eye;
  const herFace = oneEye
    ? { brows: "flat" as const, lids: 0.45, mouth: frame >= k.smile ? "smile" as const : "flat" as const, eyes: 1, look: { x: 1, y: 0 } }
    : { brows: "none" as const, lids: 1, mouth: "o" as const, eyes: 1, look: { x: 1, y: 0 } };
  // you: in on a crouch; kneeling at her face; your hand nudges her shoulder; the phone held up to her one eye
  const c = ramp(frame, k.crouch[0], k.crouch[1]);
  const back = ramp(frame, k.eye - 10, k.eye + 4); // you sit back on your heels once her eye is open, out of the card's way
  const you: Body = { x: mix(YOU_X + 80, YOU_X - 70, c) + 70 * back, y: HOME.floor, scale: S, facing: -1, pose: { ...KNEEL } };
  const shoulder = { x: HER_FEET.x + 212 * S, y: HER_FEET.y - 18 };
  const reachIn = ramp(frame, k.nudge[0] - 6, k.nudge[0]) * (1 - ramp(frame, k.nudge[1], k.nudge[1] + 6));
  const phoneAt = { x: you.x - 165, y: you.y - 150 }; // held low, at her one open eye, under the card
  const showPhone = frame >= k.eye - 4;
  you.pose = {
    ...you.pose,
    armF: mixArm(KNEEL.armF, aimArm(you, { x: shoulder.x + 18 - poke * 14, y: shoulder.y }), reachIn),
    armB: showPhone ? aimArm(you, { x: phoneAt.x + 10, y: phoneAt.y + 30 }) : KNEEL.armB,
  };
  const yh = headAt(you.x, you.y, S, you.pose, -1);
  const youFace = frame >= k.snap
    ? { brows: "raised" as const, lids: 0, mouth: "smile" as const, eyes: 1.15, look: { x: 0.8, y: frame >= k.close ? 0.3 : -0.8 } }
    : { brows: "raised" as const, lids: 0, mouth: frame >= k.say - 4 ? "smile" as const : "flat" as const, eyes: 1.05, look: { x: 1, y: 0.4 } };
  if (shot === "phone" || shot === "face") {
    const cam: Camera = shot === "phone"
      ? drift(camAt(frame, [[0, insert(1150, 560, 1.15)], [k.face, insert(1150, 560, 1.28)]]), frame, "w-phone", 3)
      : drift(camAt(frame, [[k.face, closeUp(1150, 700, 2.4)], [k.sofa, closeUp(1150, 700, 2.6)]]), frame, "w-face", 2);
    const pose: Pose = { ...STAND, armF: [100, 40], armB: [80, 50] };
    return (
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<HomeBack cam={cam} mood={mood} frame={frame} />}
        actors={shot === "phone"
          ? <ResultsPhone frame={frame} x={1150} y={560} rows={k.rows} seal={k.seal} />
          : <You body={{ x: 1180, y: HOME.floor + 120, scale: 1.4, facing: -1, pose }} face={{ brows: "raised", lids: 0, mouth: "smile", eyes: 1.15, look: { x: 0.8, y: 0.6 } }}
            frame={frame} />} />
    );
  }
  const cams: Record<string, Camera> = {
    sofa: camAt(frame, [[k.sofa, { x: 640, y: 640, zoom: 1.3 }], [k.nudge[0], { x: 660, y: 650, zoom: 1.42 }]]),
    nudge: camAt(frame, [[k.nudge[0], { x: 740, y: 640, zoom: 1.85 }], [k.say, { x: 750, y: 630, zoom: 1.95 }]]),
    two: camAt(frame, [[k.say, { x: 760, y: 610, zoom: 1.9 }], [k.snap, { x: 770, y: 600, zoom: 2.0 }]]),
    card: camAt(frame, [[k.snap, { x: 720, y: 560, zoom: 1.7 }], [k.close, { x: 730, y: 560, zoom: 1.78 }]]),
    eye: camAt(frame, [[k.close, closeUp(herHead.x + 20, herHead.y - 70, 2.6)], [k.end, closeUp(herHead.x + 20, herHead.y - 70, 2.85)]]),
  };
  const cam = drift(cams[shot], frame, "w-sofa", 3);
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<HomeBack cam={cam} mood={mood} frame={frame} />} actors={
      <g>
        <Sofa />
        <g transform={`rotate(90 ${HER_FEET.x} ${HER_FEET.y})`}>
          <Sister body={her} face={herFace} frame={frame} duty="open" />
          {oneEye && <OneEyeShut body={her} />}
        </g>
        {!oneEye && <Snore frame={frame} x={herHead.x + 10} y={herHead.y - 50} />}
        {frame >= k.crouch[0] && (
          <g>
            <You body={you} face={youFace} frame={frame} />
            {showPhone && (
              <g transform={`translate(${phoneAt.x} ${phoneAt.y}) rotate(-12)`}>
                <rect x={-26} y={-46} width={52} height={92} rx={9} fill="#23252b" stroke={INK} strokeWidth={4} />
                <rect x={-20} y={-36} width={40} height={70} rx={4} fill="#f6f1e4" />
                {[0, 1, 2].map((i) => <circle key={i} cx={10} cy={-22 + i * 22} r={7} fill={MUSTARD} stroke={INK} strokeWidth={2} />)}
              </g>
            )}
          </g>
        )}
        <Bubble frame={frame} at={k.say} until={k.close} x={yh.x - 40} y={yh.y - 60} text="I made it." side="left" size={40} />
        <Meter frame={frame} at={k.snap} x={herHead.x} headY={herHead.y} r={herHead.r} value={100} until={k.end} />
      </g>
    } />
  );
};
