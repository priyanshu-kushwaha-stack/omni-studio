// Seven Years a Week's set piece (v7, NIGHT 7): the hotel lobby at midnight. The glass front at the right with a
// coach's headlights through it; stairs at the left with your boss frozen on them, a coffee in his hand; the front desk
// in the middle, a board of key hooks behind it, and you alone behind it. Guests pour in from the door in four
// clusters, each with its own made-up flag on the luggage tags. In the hold you check them in: bowing left, bowing
// right, a little flag popping over your head as you switch language mid-bow, four keys dealt down the counter like
// cards; the lobby applauds, a coin drops on the desk, the boss's coffee tips and he doesn't notice. REF coordinates.
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { mix, noise, PASTELS, ramp } from "../shared";
import { handAt, headOf, Person, type Body, type Face } from "./TellMeTomorrow.Kit";

const FLOOR = 960;
const DESK = { from: 720, to: 1180, top: 780 };
/** The made-up flags of the four languages (as on the FlagsSheet): field colour and mark colour. */
export const FLAGS: [string, string][] = [[TEAL, MUSTARD], [CRIMSON, PAPER], ["#7fa0c4", INK], ["#5aa04a", "#c9a0d6"]];
/** Where each cluster stands (x of its front guest) and which side of the desk it is on. */
const CLUSTERS = [{ x: 440, side: -1 }, { x: 610, side: -1 }, { x: 1300, side: 1 }, { x: 1480, side: 1 }];
/** The boss on the stairs. */
export const STAIR_BOSS = { x: 250, y: 642 };

/** A small flag (field and mark), (x, y) its top-left, `w` wide. */
export const Flag: React.FC<{ x: number; y: number; w: number; i: number }> = ({ x, y, w, i }) => {
  const [a, b] = FLAGS[i % 4];
  const h = w * 0.62;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} rx={w * 0.05} fill={a} stroke={INK} strokeWidth={Math.max(2, w * 0.04)} />
      {i % 2 ? <circle cx={w / 2} cy={h / 2} r={h * 0.28} fill={b} /> : <rect x={0} y={h * 0.34} width={w} height={h * 0.32} fill={b} />}
    </g>
  );
};

export interface LobbyTimes { start: number; hold: number; end: number; tip: number; clap: number; coin: number }

/** One guest: their cluster, row and place, where they arrive from (the door) and when. */
function guests() {
  const out: { c: number; x: number; scale: number; head: string; coat: string; delay: number; back: boolean }[] = [];
  CLUSTERS.forEach((cl, c) => {
    for (let r = 0; r < 5; r++) {
      const back = r >= 3;
      out.push({
        c, x: cl.x + (back ? (r - 3) * 70 - 20 : (r - 1) * 60) * 1, scale: back ? 0.86 : 0.98 + noise(c * 9 + r) * 0.06,
        head: PASTELS[(c * 5 + r) % PASTELS.length], coat: ["#4a4f5c", "#6a5a4c", "#3f5a6a", "#5a4a6a"][(c + r) % 4], delay: c * 6 + r * 3, back,
      });
    }
  });
  return out.sort((a, b) => Number(b.back) - Number(a.back));
}
const GUESTS = guests();

const Stairs: React.FC = () => (
  <g>
    <polygon points={`-400,${FLOOR - 40} 430,${FLOOR - 40} 70,330 -400,330`} fill="#3b3f52" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 9 }, (_, i) => {
      const x = 430 - i * 40, y = FLOOR - 40 - i * 70;
      return <path key={i} d={`M${x} ${y} L${x - 40} ${y} L${x - 40} ${y - 70}`} fill="none" stroke="#565b72" strokeWidth={6} />;
    })}
    <line x1={470} y1={FLOOR - 140} x2={110} y2={230} stroke="#8a6a4f" strokeWidth={12} strokeLinecap="round" />
  </g>
);

export interface LobbyProps {
  frame: number;
  cam: Camera;
  mood: MoodName;
  t: LobbyTimes;
}

/** The lobby: everything at this frame (arrivals, the check-in hold, the boss's coffee). */
export const Lobby: React.FC<LobbyProps> = ({ frame, cam, mood, t }) => {
  const inHold = frame >= t.hold;
  // you: alone at the desk; in the hold you bow left, bow right, switching sides every 14 frames
  const beat = Math.floor((frame - t.hold) / 14);
  const side: 1 | -1 = inHold ? (beat % 2 ? 1 : -1) : -1;
  const bowP = inHold ? Math.sin((((frame - t.hold) % 14) / 14) * Math.PI) : 0;
  const deal = inHold && frame >= t.hold + 30 && frame < t.hold + 46;
  const youB: Body = { x: 950, y: FLOOR, scale: 1.12, facing: side, pose: { ...STAND, lean: bowP * 38, armF: deal ? [95, 5] : [20 + bowP * 30, 30], armB: deal ? [80, 10] : [10, 20] } };
  const youH = headOf(youB);
  const youFace: Face = inHold ? { brows: "raised", lids: bowP > 0.5 ? 0.6 : 0, mouth: bowP > 0.3 ? "open" : "smile", look: { x: 0.9, y: 0.1 } }
    : { brows: "raised", lids: 0, mouth: "o", eyes: 1.15, look: { x: 0.9, y: 0 } };
  // the boss on the stairs, frozen; his mug tips from t.tip and pours
  const tip = ramp(frame, t.tip, t.tip + 12);
  const bossB: Body = { x: STAIR_BOSS.x, y: STAIR_BOSS.y, scale: 1.05, facing: 1, pose: { ...STAND, armF: [70, 50], armB: [10, 20] } };
  const clap = inHold && frame >= t.clap;
  const look = setLook([
    { x: 1640, y: 700, r: 420, color: "#fff2c0", strength: 0.55, moods: ["night", "lamp", "dusk"] },
    { x: 950, y: 520, r: 360, color: "#ffe2a6", strength: 0.35, moods: ["night", "lamp", "dusk", "morning", "day"] },
  ], mood, cam);
  return (
    <LookContext.Provider value={look}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={
          <g>
            <rect x={-1400} y={-900} width={4700} height={2900} fill="#2a2f45" />
            {/* the glass front, the coach outside with its headlights */}
            <rect x={1380} y={200} width={900} height={FLOOR - 240} fill="#0f1322" />
            <rect x={1460} y={420} width={760} height={330} rx={60} fill="#d9d2c0" stroke={INK} strokeWidth={6} />
            {[0, 1, 2, 3].map((k) => <rect key={k} x={1520 + k * 150} y={460} width={120} height={110} rx={14} fill="#2b3250" stroke={INK} strokeWidth={4} />)}
            {[1560, 1700].map((x) => <circle key={x} cx={x} cy={680} r={34} fill="#fff6dc" stroke={INK} strokeWidth={4} />)}
            <polygon points="1560,680 1700,680 1300,920 1000,920" fill="#fff2c0" opacity={0.18} />
            {[1380, 1640, 1900].map((x) => <rect key={x} x={x} y={200} width={18} height={FLOOR - 240} fill="#565b72" stroke={INK} strokeWidth={4} />)}
            <rect x={1380} y={190} width={900} height={20} fill="#565b72" stroke={INK} strokeWidth={4} />
            <rect x={1400} y={220} width={500} height={FLOOR - 280} fill="#9fc0e0" opacity={0.12} />
            {/* the key board behind the desk and a strip of crimson counter tiles over it */}
            <rect x={780} y={330} width={340} height={200} rx={10} fill="#5b4636" stroke={INK} strokeWidth={6} />
            {Array.from({ length: 12 }, (_, i) => (
              <g key={i}>
                <circle cx={820 + (i % 6) * 52} cy={370 + Math.floor(i / 6) * 90} r={6} fill={PAPER} />
                {i % 5 !== 2 && <rect x={812 + (i % 6) * 52} y={380 + Math.floor(i / 6) * 90} width={16} height={34} rx={4} fill={MUSTARD} stroke={INK} strokeWidth={2} />}
              </g>
            ))}
            <rect x={830} y={250} width={240} height={60} rx={8} fill={INK} />
            {[0, 1, 2].map((k) => <rect key={k} x={860 + k * 64} y={258} width={50} height={44} rx={5} fill={CRIMSON} stroke={PAPER} strokeWidth={3} />)}
            <rect x={-1400} y={FLOOR - 40} width={4700} height={900} fill="#3a3044" />
            <rect x={-1400} y={FLOOR - 46} width={4700} height={10} fill="#4a4058" />
            <Stairs />
          </g>
        }
        actors={
          <>
            <Person who="boss" b={bossB} face={{ brows: "raised", lids: 0, mouth: "o", eyes: 1.25, look: { x: 0.95, y: 0.1 } }} frame={frame} seed={3}
              held={<g transform={`rotate(${tip * 110})`}><rect x={-14} y={-26} width={28} height={30} rx={5} fill={PAPER} stroke={INK} strokeWidth={3} />
                <path d="M14 -18 q12 4 0 16" fill="none" stroke={INK} strokeWidth={3} /></g>} />
            {tip > 0.4 && (() => {
              const { x: hx, y: hy } = handAt(bossB, "front");
              return [0, 1, 2, 3, 4].map((d) => {
                const q = ((frame - t.tip + d * 5) % 25) / 25;
                return <ellipse key={d} cx={hx + 20 + q * 30} cy={hy + q * 180} rx={6} ry={10} fill="#6b4226" opacity={0.9} />;
              });
            })()}
            {tip > 0.8 && <ellipse cx={STAIR_BOSS.x + 60} cy={STAIR_BOSS.y + 2} rx={60 * ramp(frame, t.tip + 10, t.tip + 40)} ry={8} fill="#6b4226" />}
            <Person who="you" b={youB} face={youFace} frame={frame} />
            {inHold && bowP > 0.15 && <Flag x={youH.x - 34} y={youH.y - 150 - bowP * 20} w={68} i={(beat + 4) % 4} />}
            {/* the desk */}
            <rect x={DESK.from} y={DESK.top} width={DESK.to - DESK.from} height={FLOOR - 40 - DESK.top} rx={8} fill="#5b4636" stroke={INK} strokeWidth={6} />
            <rect x={DESK.from - 16} y={DESK.top - 22} width={DESK.to - DESK.from + 32} height={26} rx={8} fill="#7a5d47" stroke={INK} strokeWidth={6} />
            {/* four keys dealt down the counter */}
            {inHold && frame >= t.hold + 32 && [-2, -1, 1, 2].map((d, i) => {
              const q = ramp(frame, t.hold + 32 + i * 2, t.hold + 44 + i * 2);
              return (
                <g key={d} transform={`translate(${950 + d * 110 * q} ${DESK.top - 24}) rotate(${d * 10 * q})`}>
                  <rect x={-14} y={-8} width={28} height={10} rx={3} fill={MUSTARD} stroke={INK} strokeWidth={3} />
                </g>
              );
            })}
            {frame >= t.coin && (
              <circle cx={mix(1290, 1100, ramp(frame, t.coin, t.coin + 12))} cy={mix(620, DESK.top - 30, ramp(frame, t.coin, t.coin + 12)) - Math.sin(ramp(frame, t.coin, t.coin + 12) * Math.PI) * 90}
                r={14} fill={MUSTARD} stroke={INK} strokeWidth={3} />
            )}
            {/* the guests: in from the door, then in their four clusters, applauding in the hold */}
            {GUESTS.map((g, i) => {
              const p = ramp(frame, t.start + g.delay, t.start + g.delay + 46);
              const x = mix(1950, g.x, p);
              const moving = p > 0 && p < 1;
              const cl = CLUSTERS[g.c];
              const faceIn: 1 | -1 = moving ? -1 : (cl.side === -1 ? 1 : -1);
              const c = clap ? ((frame + i * 2) % 8 < 4 ? 1 : 0) : 0;
              const pose: Pose = moving ? walkPose(frame * 0.3 + i) : clap ? { ...STAND, armF: [85 + c * 12, 50 - c * 20], armB: [70 - c * 6, 60] } : { ...STAND, armF: [14, 20], armB: [-4, 10] };
              const b: Body = { x, y: g.back ? FLOOR - 26 : FLOOR, scale: g.scale, facing: faceIn, pose };
              const bag = { x: x + (faceIn === 1 ? -50 : 50) * g.scale, y: b.y };
              return (
                <g key={i}>
                  <Person who={{ head: g.head, coat: g.coat }} b={b} face={{ brows: "raised", lids: 0, mouth: clap ? "open" : inHold ? "o" : "smile", eyes: inHold ? 1.15 : 1, look: { x: 0.9, y: 0 } }}
                    frame={frame} seed={i + 9} />
                  {!g.back && (
                    <g>
                      <rect x={bag.x - 24 * g.scale} y={bag.y - 70 * g.scale} width={48 * g.scale} height={70 * g.scale} rx={8} fill={["#3d6fb0", "#a8582e", "#5a6070", "#7a2b3a"][i % 4]} stroke={INK} strokeWidth={4} />
                      <Flag x={bag.x - 16 * g.scale} y={bag.y - 96 * g.scale} w={32 * g.scale} i={g.c} />
                    </g>
                  )}
                  {clap && c === 1 && !g.back && <path d={`M${x + faceIn * 70} ${b.y - 250} l${faceIn * 14} -10 M${x + faceIn * 72} ${b.y - 232} l${faceIn * 16} 0`} stroke={PAPER} strokeWidth={4} strokeLinecap="round" />}
                </g>
              );
            })}
          </>
        } />
    </LookContext.Provider>
  );
};

/** "Is he real?": two guests of a cluster in close, one whispering behind a hand, both wide-eyed at the desk. */
export const Whisper: React.FC<{ frame: number; cam: Camera; mood: MoodName; talking: boolean }> = ({ frame, cam, mood, talking }) => {
  const look = setLook([{ x: 1640, y: 700, r: 420, color: "#fff2c0", strength: 0.5, moods: ["night", "lamp", "dusk"] }], mood, cam);
  const a: Body = { x: 1240, y: FLOOR, scale: 1.1, facing: -1, pose: { ...STAND, lean: 10, tilt: 8, armF: [130, 60], armB: [10, 20] } };
  const b: Body = { x: 1100, y: FLOOR, scale: 1.1, facing: -1, pose: { ...STAND, tilt: -6, armF: [20, 20], armB: [10, 20] } };
  return (
    <LookContext.Provider value={look}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={<g><rect x={-1400} y={-900} width={4700} height={2900} fill="#2a2f45" /><rect x={-1400} y={FLOOR - 40} width={4700} height={900} fill="#3a3044" />
          <rect x={780} y={330} width={340} height={200} rx={10} fill="#5b4636" stroke={INK} strokeWidth={6} /></g>}
        actors={
          <>
            <Person who={{ head: PASTELS[1], coat: "#5a4a6a" }} b={b} face={{ brows: "raised", lids: 0, mouth: "o", eyes: 1.3, look: { x: 0.9, y: 0 } }} frame={frame} seed={21} />
            <Person who={{ head: PASTELS[4], coat: "#3f5a6a" }} b={a} face={{ brows: "worry", lids: 0, mouth: talking && frame % 8 < 4 ? "open" : "o", eyes: 1.2, look: { x: 0.9, y: 0.1 } }} frame={frame} seed={22} />
            <Flag x={1180} y={830} w={40} i={2} />
          </>
        } />
    </LookContext.Provider>
  );
};
