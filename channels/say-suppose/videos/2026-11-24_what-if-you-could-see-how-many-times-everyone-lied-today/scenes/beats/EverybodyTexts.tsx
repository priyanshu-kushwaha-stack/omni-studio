// Beat "Everybody Texts" (script.md ## [05:10]): Tuesday, the floor gone silent, every head over a phone and a 0 over
// each, the boss at his door holding up a printed memo (readout 14: his, from before the memos); the canteen with you
// alone at a long table and your date's text, "It's not you."; five o'clock at the lift (her 0 as the doors close,
// your "Fine." twice and nothing clicks over you); dusk outside the rally (the leader reading a sheet behind a rope, 0;
// the challenger across the square with a megaphone, 4); and your phone buzzing with the man in the white coat.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { seatedY, SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { canteen, officeDesk, phone, SetScene, street } from "@whatif/kit/sets";
import { Tag } from "@whatif/kit/ui/Tag";
import type { Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import { Readout } from "../parts/Counter";
import { Body, Bubble, Handset, headOf, talk } from "../parts/SayItAgain.Kit";
import { BOSS, camAt, current, HERO, mix, PASTELS, ramp, type Beat, type Shot } from "../shared";

const COLLEAGUE = { head: "#9fc0e0", coat: "#6b4b3a" } as const;
const LEADER = { head: "#8a96a3", coat: "#2f3a55" } as const;
const CHALLENGER = { head: "#c87533", coat: "#3d5a6c" } as const;
const RIVAL = { head: "#9cb89a", coat: "#f4f4ef" } as const;
const DATE = { head: "#b9a6e0" } as const;

function cues(shot: Shot) {
  const { at, end } = shot;
  const colE = end("Colleague: You okay?");
  const lift = at("The lift goes.");
  const hold = (p: number) => Math.round(colE + (lift - colE) * p);
  return {
    tuesday: at("Tuesday. The floor's"), noClick: at("No click."), write: at("Just write it down"), diary: at("A diary study found"),
    keyboard: at("They didn't stop lying"), lunch: at("Nobody sits with you"), texts: at("Nobody sits with you", 0.36),
    colleague: at("Colleague: You okay?"), colE, fine1: hold(0.04), close: [hold(0.22), hold(0.55)] as const, fine2: hold(0.6),
    up: hold(0.82), lift, team: at("The leader's team learns"), leader: at("Leader: As I wrote"), leaderE: end("Leader: As I wrote"),
    zero: at("Zero, in the flesh"), across: at("Zero, in the flesh", 0.32), tv: at("But then someone on television"), end: shot.to,
  };
}
type K = ReturnType<typeof cues>;

// ------------------------------------------------------------------------------------------------ the silent floor

const ROW1 = Array.from({ length: 16 }, (_, i) => -560 + i * 120).filter((x) => x < 860 || x > 1320);
const ROW2 = Array.from({ length: 8 }, (_, i) => -620 + i * 170);

const Texter: React.FC<{ x: number; y: number; scale: number; i: number; frame: number }> = ({ x, y, scale, i, frame }) => {
  const thumb = Math.sin(frame / 2.2 + i * 1.7) * 6;
  const pose: Pose = { ...STAND, armF: [118 + thumb, 70], armB: [60, 80], tilt: 10 };
  return (
    <Body x={x} y={y} scale={scale} facing={i % 2 ? -1 : 1} pose={pose} head={PASTELS[i % PASTELS.length]} coat={["#3d5a6c", "#5d6470", "#6b4b3a", "#2f3242"][i % 4]}
      frame={frame} id={`tx-${i}-${Math.round(y)}`} count={{ base: 0 }} size={58 * scale} look={{ x: 0.5, y: 0.8 }} mouth="flat" seed={i}
      held={<Handset scale={1.1} rotate={-30} />} />
  );
};

const Floor: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  const cam = camAt(frame, [
    [k.tuesday - 9, { x: 900, y: 560, zoom: 0.86 }], [k.noClick - 2, { x: 820, y: 580, zoom: 0.92 }],
    [k.noClick, { x: 160, y: 700, zoom: 1.6 }], [k.write - 2, { x: 220, y: 690, zoom: 1.65 }],
    [k.write, { x: 1500, y: 580, zoom: 1.35 }], [k.diary - 2, { x: 1540, y: 580, zoom: 1.4 }],
    [k.diary, { x: 900, y: 560, zoom: 0.88 }], [k.keyboard - 2, { x: 860, y: 570, zoom: 0.95 }],
    [k.keyboard, { x: -240, y: 830, zoom: 2.1 }], [k.lunch, { x: -180, y: 830, zoom: 2.2 }],
  ]);
  const memoUp = ramp(frame, k.tuesday + 6, k.tuesday + 20);
  const bossPose: Pose = { ...STAND, armF: [mix(30, 150, memoUp), mix(20, 10, memoUp)] };
  return (
    <SetScene set={officeDesk} mood="day" frame={frame} cam={drift(cam, frame, "floor", 4)} options={{ colleagues: false, screen: "mail" }} cast={[]}
      actors={
        <>
          {ROW1.map((x, i) => <Texter key={`a${i}`} x={x} y={770} scale={0.46} i={i} frame={frame} />)}
          <rect x={-1400} y={700} width={2260} height={90} fill="#8a94a0" stroke={INK} strokeWidth={4} />
          <rect x={1320} y={700} width={220} height={90} fill="#8a94a0" stroke={INK} strokeWidth={4} />
          {ROW2.map((x, i) => <Texter key={`b${i}`} x={x} y={930} scale={0.66} i={i + 5} frame={frame} />)}
          <rect x={-1400} y={850} width={2010} height={120} fill="#9aa4ad" stroke={INK} strokeWidth={4} />
          <Body x={780} y={seatedY(850, 1.1)} scale={1.1} pose={{ ...SEATED, armF: [70, 60] }} head={HERO.head} scarf={HERO.scarf} tuft frame={frame}
            id="you-floor" look={{ x: -1, y: 0.1 }} brows="flat" lids={0.25} mouth="flat" />
          <Body x={1780} y={940} scale={1.1} facing={-1} pose={bossPose} head={BOSS.head} coat={BOSS.coat} tie={BOSS.tie} frame={frame} id="boss-memo"
            count={{ base: 14 }} mouth="smirk" look={{ x: 1, y: 0 }} seed={2}
            held={<g transform="rotate(-8)"><rect x={-40} y={-60} width={80} height={104} rx={4} fill={PAPER} stroke={INK} strokeWidth={4} />
              {[0, 1, 2, 3].map((r) => <rect key={r} x={-28} y={-44 + r * 20} width={56 - (r % 2) * 16} height={8} rx={4} fill={INK} opacity={0.5} />)}</g>} />
        </>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ the canteen, the text

const Canteen: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  const cam = camAt(frame, [[k.lunch - 4, { x: 1000, y: 600, zoom: 1.05 }], [k.texts, { x: 820, y: 620, zoom: 1.35 }]]);
  return (
    <SetScene set={canteen} mood="day" frame={frame} cam={drift(cam, frame, "canteen", 4)} options={{ food: false, tv: "cricket", ball: (frame % 90) / 60 }}
      cast={[]}
      actors={
        <>
          <Body x={640} y={seatedY(850, 1.1)} scale={1.1} pose={{ ...SEATED, armF: [70, 50] }} head={HERO.head} scarf={HERO.scarf} tuft frame={frame}
            id="you-canteen" look={{ x: 0.2, y: 0.6 }} brows="sad" lids={0.45} mouth="flat" held={<Handset scale={1.2} />} />
          {[1500, 1640, 1780].map((x, i) => (
            <Body key={x} x={x} y={970} scale={1.0} facing={1} pose={{ ...STAND, armF: [70, 40] }} head={PASTELS[(i * 2 + 1) % 8]}
              coat={["#3d5a6c", "#6b4b3a", "#5d6470"][i]} frame={frame} id={`queue${i}`} count={{ base: 0 }} look={{ x: 1, y: 0 }} mouth="flat" seed={i + 3}
              held={i === 1 ? <Handset scale={1.2} /> : undefined} />
          ))}
        </>
      } />
  );
};

const Text: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  const shown = ramp(frame, k.texts + 8, k.texts + 14);
  const cam = camAt(frame, [[k.texts, { x: 1180, y: 520, zoom: 1.3 }], [k.colleague, { x: 1180, y: 500, zoom: 1.45 }]]);
  return (
    <SetScene set={phone} mood="day" frame={frame} cam={cam} options={{ mode: "message", typed: 0, sent: 2, reply: 0, dots: shown < 1, contact: DATE.head, thumb: null, behind: "desk" }}
      cast={[{ spot: "face", who: { ...HERO, look: { x: 1, y: 0.2 }, time: frame }, face: { brows: "sad", lids: 0.4, mouth: "flat", eyes: 1 }, behind: true }]}
      actors={shown > 0 ? (
        <g opacity={shown}>
          <rect x={1032} y={452} width={260} height={62} rx={22} fill="#ffffff" stroke="#d9dee6" strokeWidth={3} />
          <text x={1052} y={494} fontFamily={FONT} fontWeight={800} fontSize={32} fill={INK}>It's not you.</text>
        </g>
      ) : undefined} />
  );
};

// ------------------------------------------------------------------------------------------------ five o'clock, the lift

const LIFT = { x: 360, top: 360, w: 360, floor: 955 };

const Lift: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  const shut = ramp(frame, k.close[0], k.close[1]);
  const up = ramp(frame, k.up, k.up + 12);
  const cam = camAt(frame, [[k.colleague - 4, { x: 680, y: 600, zoom: 1.25 }], [k.close[1], { x: 720, y: 600, zoom: 1.3 }],
    [k.fine2, { x: 980, y: 560, zoom: 1.5 }], [k.lift + 40, { x: 1000, y: 520, zoom: 1.7 }]]);
  const you = { x: 1020, y: 975, scale: 1.18 };
  const youPose: Pose = { ...STAND, tilt: mix(0, 8, up), armF: [20, 20] };
  const yh = headOf(you.x, you.y, you.scale, youPose, -1);
  const half = LIFT.w / 2;
  return (
    <SetScene set={officeDesk} mood="day" frame={frame} cam={drift(cam, frame, "lift", 4)} options={{ colleagues: false, screen: "off" }} cast={[]}
      actors={
        <>
          {/* the lift: steel surround, its lit car, the clock over it at five */}
          <rect x={LIFT.x - half - 40} y={LIFT.top - 40} width={LIFT.w + 80} height={LIFT.floor - LIFT.top + 40} fill="#b9c0c8" stroke={INK} strokeWidth={6} />
          <rect x={LIFT.x - half} y={LIFT.top} width={LIFT.w} height={LIFT.floor - LIFT.top} fill="#fdf3d8" />
          <g transform={`translate(${LIFT.x} ${LIFT.top - 110})`}>
            <circle r={52} fill={PAPER} stroke={INK} strokeWidth={6} />
            <line x1={0} y1={0} x2={0} y2={-36} stroke={INK} strokeWidth={6} strokeLinecap="round" />
            <line x1={0} y1={0} x2={-22} y2={12} stroke={INK} strokeWidth={6} strokeLinecap="round" />
          </g>
          <Body x={LIFT.x} y={LIFT.floor} scale={1.0} facing={1} head={COLLEAGUE.head} coat={COLLEAGUE.coat} frame={frame} id="colleague" count={{ base: 0 }}
            mouth={talk(frame, k.colleague, k.colE, "flat")} brows="worry" look={{ x: 1, y: 0 }} seed={4} />
          {/* the doors close on her zero */}
          <rect x={LIFT.x - half} y={LIFT.top} width={half * shut} height={LIFT.floor - LIFT.top} fill="#9aa4ad" stroke={INK} strokeWidth={4} />
          <rect x={LIFT.x + half - half * shut} y={LIFT.top} width={half * shut} height={LIFT.floor - LIFT.top} fill="#9aa4ad" stroke={INK} strokeWidth={4} />
          <Figure x={you.x} y={you.y} scale={you.scale} facing={-1} pose={youPose} {...HERO} time={frame}
            look={up > 0.5 ? { x: 0.2, y: -1 } : { x: 1, y: 0 }} brows={up > 0.5 ? "worry" : "flat"} lids={up > 0.5 ? 0 : 0.2} mouth="flat"
            blink={(frame + 20) % 97 < 4} />
          <Bubble frame={frame} at={k.fine1} until={k.close[1]} x={yh.x - 30} y={yh.y - yh.r - 10} text="Fine." side="left" size={46} />
          <Bubble frame={frame} at={k.fine2} until={k.up + 6} x={yh.x - 30} y={yh.y - yh.r - 10} text="Fine." side="left" size={46} />
        </>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ dusk, the rally

const Rally: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  const cam = camAt(frame, [[k.team - 4, { x: 900, y: 620, zoom: 1.15 }], [k.leader - 4, { x: 760, y: 600, zoom: 1.55 }],
    [k.across, { x: 820, y: 600, zoom: 1.4 }], [k.across + 24, { x: 1560, y: 560, zoom: 1.6 }], [k.tv, { x: 1560, y: 560, zoom: 1.7 }]]);
  const read = frame >= k.leader - 6;
  return (
    <SetScene set={street} mood="dusk" frame={frame} cam={drift(cam, frame, "rally", 4)} options={{ crowd: false, auto: false, bus: null, red: true }} cast={[]}
      actors={
        <>
          {/* across the square: the challenger with a megaphone */}
          {Array.from({ length: 7 }, (_, i) => (
            <Figure key={i} x={1400 + i * 70 + (i > 3 ? 120 : 0)} y={712} scale={0.5} facing={-1} head={PASTELS[(i * 3) % 8]} coat="#5d6470" time={frame}
              pose={{ ...STAND, armF: [150 + Math.sin(frame / 6 + i) * 10, 0] }} look={{ x: 0.5, y: -0.3 }} mouth="open" />
          ))}
          <Body x={1660} y={708} scale={0.7} facing={-1} pose={{ ...STAND, armF: [100, 0] }} head={CHALLENGER.head} coat={CHALLENGER.coat} frame={frame}
            id="challenger" count={{ base: 4 }} size={42} mouth={Math.floor(frame / 6) % 2 ? "open" : "flat"} brows="angry" look={{ x: 1, y: 0 }} seed={5}
            held={<path d="M0 -10 L40 -26 V26 L0 10Z" fill={PAPER} stroke={INK} strokeWidth={4} />} />
          {/* the leader at a podium behind a rope, a sheet in his hand */}
          <Body x={700} y={985} scale={1.15} facing={1} pose={{ ...STAND, armF: read ? [100, 50] : [60, 40], tilt: read ? 8 : 0 }} head={LEADER.head} coat={LEADER.coat}
            tie={CRIMSON} frame={frame} id="leader" count={{ base: 0 }} mouth={talk(frame, k.leader, k.leaderE, "flat")} look={{ x: 0.6, y: read ? 0.7 : 0 }} seed={2}
            held={<rect x={-30} y={-46} width={60} height={80} rx={3} fill={PAPER} stroke={INK} strokeWidth={3} />} />
          <path d="M610 770 H830 L810 1000 H630Z" fill="#6b4b3a" stroke={INK} strokeWidth={6} />
          <circle cx={720} cy={850} r={30} fill={PAPER} stroke={INK} strokeWidth={4} />
          {[260, 560, 860, 1160].map((x) => <rect key={x} x={x - 6} y={890} width={12} height={110} fill="#c9a77a" stroke={INK} strokeWidth={3} />)}
          <path d="M260 900 Q410 940 560 900 Q710 940 860 900 Q1010 940 1160 900" fill="none" stroke={CRIMSON} strokeWidth={10} />
          {/* the press in front of the rope, backs to you */}
          {[380, 1000].map((x, i) => (
            <Body key={x} x={x} y={1060} scale={1.15} facing={i ? -1 : 1} pose={{ ...STAND, armF: [130, -20] }} head={PASTELS[(i * 5 + 2) % 8]}
              coat={["#3d5a6c", "#6b4b3a"][i]} frame={frame} id={`press${i}`} count={{ base: i }} look={{ x: 0.8, y: -0.3 }} mouth="flat" seed={i + 7}
              held={<rect x={-6} y={-30} width={12} height={34} rx={5} fill={INK} />} />
          ))}
        </>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ the man in the white coat

/** The clip on your phone: a studio, the man in the white coat, a thermal camera on his shoulder. On a screen there is no
 *  counter (the film's rule: counters only show in the room); his 62 shows in the next beat, in person. */
const Rival: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  const buzz = (frame - k.tv) % 24 < 8 ? Math.sin(frame * 2.4) * 7 : 0;
  const cam0 = camAt(frame, [[k.tv, { x: 1180, y: 540, zoom: 1.25 }], [k.end, { x: 1180, y: 500, zoom: 1.5 }]]);
  const cam: Camera = { ...cam0, x: cam0.x + buzz };
  return (
    <SetScene set={phone} mood="dusk" frame={frame} cam={cam} options={{ mode: "feed", thumb: 0.65, behind: "desk" }}
      cast={[{ spot: "face", who: { ...HERO, look: { x: 1, y: 0.1 }, time: frame }, face: { brows: "raised", lids: 0, mouth: "o", eyes: 1.2 }, behind: true }]}
      actors={
        <g>
          <clipPath id="et-clip"><rect x={1012} y={300} width={336} height={420} /></clipPath>
          <g clipPath="url(#et-clip)">
            <rect x={1012} y={300} width={336} height={420} fill="#1b2240" />
            <rect x={1012} y={300} width={336} height={60} fill="#22314a" />
            <Figure x={1150} y={860} scale={1.25} facing={1} pose={{ ...STAND, armF: [110, 60] }} head={RIVAL.head} coat={RIVAL.coat} time={frame}
              mouth={Math.floor(frame / 5) % 3 === 2 ? "flat" : "open"} brows="raised" look={{ x: 0.6, y: 0 }} />
            <g transform="translate(1210 470)">
              <rect x={0} y={-30} width={100} height={60} rx={10} fill="#2a2d36" stroke={INK} strokeWidth={4} />
              <circle cx={110} cy={0} r={20} fill="#3b3e47" stroke={INK} strokeWidth={4} />
              <circle cx={110} cy={0} r={9} fill="#ff7a3c" />
            </g>
          </g>
          <rect x={1012} y={680} width={336} height={40} fill={CRIMSON} />
        </g>
      } />
  );
};

const Component: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = cues(shot);
  const f = shot.frame;
  const on = current(f, [
    [shot.from, "floor"], [k.lunch - 2, "canteen"], [k.texts, "text"], [k.colleague - 6, "lift"], [k.team - 2, "rally"], [k.tv, "rival"],
  ] as [number, "floor" | "canteen" | "text" | "lift" | "rally" | "rival"][]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {on === "floor" && <Floor frame={f} k={k} />}
      {on === "canteen" && <Canteen frame={f} k={k} />}
      {on === "text" && <Text frame={f} k={k} />}
      {on === "lift" && <Lift frame={f} k={k} />}
      {on === "rally" && <Rally frame={f} k={k} />}
      {on === "rival" && <Rival frame={f} k={k} />}
      <Readout label="EVERYONE YOU CAN SEE" value={14} frame={f} on={k.tuesday - 9} off={k.keyboard} />
      {on === "floor" && ((f >= k.tuesday + 24 && f < k.noClick) || (f >= k.write && f < k.diary)) && (
        <Tag at={f >= k.write ? k.write + 4 : k.tuesday + 24} text="MEMO: SENT IT FRIDAY." x={1040} y={330} size={48} tilt={-3} />
      )}
    </AbsoluteFill>
  );
};

export const everybodyTexts: Beat = { id: "EverybodyTexts", first: "Tuesday. The floor's", lead: 0.3, Component };
