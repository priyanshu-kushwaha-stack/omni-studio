// Beat "Everybody Texts" (script.md ## [04:24]): Tuesday, the floor gone silent, every head over a phone and a 0 over
// each, the boss at his door holding up a printed memo (readout 14: his, from before the memos); the canteen, your whole
// team round one table texting each other, you at the end with your mug; five o'clock at the lift (her 0 as the doors
// close, your "Fine." twice and nothing clicks over you); and your phone buzzing with the man in the white coat.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { seatedY, SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { canteen, officeDesk, phone, SetScene } from "@whatif/kit/sets";
import { Tag } from "@whatif/kit/ui/Tag";
import type { Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import { Readout } from "../parts/Counter";
import { HeroMug } from "../parts/FrameKit";
import { Body, Bubble, Handset, headOf, talk } from "../parts/SayItAgain.Kit";
import { BOSS, camAt, current, HERO, mix, PASTELS, ramp, type Beat, type Shot } from "../shared";

const COLLEAGUE = { head: "#9fc0e0", coat: "#6b4b3a" } as const;
const RIVAL = { head: "#9cb89a", coat: "#f4f4ef" } as const;

function cues(shot: Shot) {
  const { at, end } = shot;
  const colE = end("Colleague: You okay?");
  const lift = at("The lift goes.");
  const hold = (p: number) => Math.round(colE + (lift - colE) * p);
  return {
    tuesday: at("Tuesday. The floor's"), noClick: at("Tuesday. The floor's", 0.85),
    keyboard: at("They didn't stop lying"), keys: at("They didn't stop lying", 0.45),
    lunch: at("At lunch, your team"), table: at("At lunch, your team", 0.62),
    colleague: at("Colleague: You okay?"), colE, fine1: hold(0.04), close: [hold(0.22), hold(0.55)] as const, fine2: hold(0.6),
    up: hold(0.82), lift, tv: at("But then someone on television"), end: shot.to,
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
    [k.noClick, { x: 160, y: 700, zoom: 1.6 }], [k.keyboard - 2, { x: 220, y: 690, zoom: 1.65 }],
    [k.keyboard, { x: 1500, y: 580, zoom: 1.35 }], [k.keys - 2, { x: 1540, y: 580, zoom: 1.4 }],
    [k.keys, { x: -240, y: 830, zoom: 2.1 }], [k.lunch, { x: -180, y: 830, zoom: 2.2 }],
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

// ------------------------------------------------------------------------------------------------ the canteen

/** Your team round one table, heads down, texting each other; a 0 over each. */
const TEAM = [880, 1030, 1180, 1330, 1480];

const Canteen: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  const cam = camAt(frame, [[k.lunch - 4, { x: 1000, y: 600, zoom: 1.05 }], [k.table, { x: 1060, y: 620, zoom: 1.25 }]]);
  return (
    <SetScene set={canteen} mood="day" frame={frame} cam={drift(cam, frame, "canteen", 4)} options={{ food: false, tv: "cricket", ball: (frame % 90) / 60 }}
      cast={[]}
      actors={
        <>
          <Body x={640} y={seatedY(850, 1.1)} scale={1.1} pose={{ ...SEATED, armF: [70, 50] }} head={HERO.head} scarf={HERO.scarf} tuft frame={frame}
            id="you-canteen" look={{ x: 1, y: 0.1 }} brows="flat" lids={0.35} mouth="flat" held={<HeroMug x={0} y={0} scale={1} tilt={6} steam={false} />} />
          {TEAM.map((x, i) => {
            const thumb = Math.sin(frame / 2.2 + i * 1.7) * 6;
            return (
              <Body key={x} x={x} y={seatedY(850, 1.0)} scale={1.0} facing={i % 2 ? -1 : 1} pose={{ ...SEATED, armF: [118 + thumb, 70], tilt: 10 }}
                head={PASTELS[(i * 2 + 1) % 8]} coat={["#3d5a6c", "#6b4b3a", "#5d6470", "#2f3242", "#7a5a8c"][i]} frame={frame} id={`team${i}`}
                count={{ base: 0 }} look={{ x: 0.5, y: 0.8 }} mouth="flat" seed={i + 3} held={<Handset scale={1.1} rotate={-30} />} />
            );
          })}
        </>
      } />
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
    [shot.from, "floor"], [k.lunch - 2, "canteen"], [k.colleague - 6, "lift"], [k.tv, "rival"],
  ] as [number, "floor" | "canteen" | "lift" | "rival"][]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {on === "floor" && <Floor frame={f} k={k} />}
      {on === "canteen" && <Canteen frame={f} k={k} />}
      {on === "lift" && <Lift frame={f} k={k} />}
      {on === "rival" && <Rival frame={f} k={k} />}
      <Readout label="EVERYONE YOU CAN SEE" value={14} frame={f} on={k.tuesday - 9} off={k.keyboard} />
      {on === "floor" && ((f >= k.tuesday + 24 && f < k.noClick) || (f >= k.keyboard && f < k.keys)) && (
        <Tag at={f >= k.keyboard ? k.keyboard + 4 : k.tuesday + 24} text="MEMO: SENT IT FRIDAY." x={1040} y={330} size={48} tilt={-3} />
      )}
    </AbsoluteFill>
  );
};

export const everybodyTexts: Beat = { id: "EverybodyTexts", first: "Tuesday. The floor's", lead: 0.3, Component };
