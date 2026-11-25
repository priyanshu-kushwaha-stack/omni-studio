// Beat "Everybody Texts" (script.md ## [04:24]). Look C (owner, 2026-11-25): painted plates, our cast, close-ups.
// Tuesday, the floor gone silent (plate `office-floor`): heads over phones, a small dim 0 over each, close on two
// texters whose zeros never move, the boss in the aisle holding up a printed memo under his 14 (the readout 14), close
// on you; the canteen, your team texting each other across one table (plate `canteen`); five o'clock at the lift
// (plate `lift-lobby`, parts/EverybodyTexts.Parts.tsx): her 0 as the doors close, your "Fine." twice, nothing clicks
// over you; and your phone buzzing with the man in the white coat.
import { AbsoluteFill } from "remotion";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import { INK, PAPER } from "@whatif/kit/theme";
import { Tag } from "@whatif/kit/ui/Tag";
import { BOSS, current, HERO, mix, PASTELS, ramp, type Beat, type Shot } from "../shared";
import { Readout } from "../parts/Counter";
import { PlateScene } from "../parts/Plate";
import { Body, Handset, headOf } from "../parts/SayItAgain.Kit";
import { counterLight, Cut, onHead, pw, scaleAt, shotAt, type Shot as Cam } from "../parts/SayItAgain.LookC";
import { Canteen, Lift, RivalPhone } from "../parts/EverybodyTexts.Parts";

function cues(shot: Shot) {
  const { at, end } = shot;
  const colE = end("Colleague: You okay?");
  const lift = at("The lift goes.");
  const hold = (p: number) => Math.round(colE + (lift - colE) * p);
  return {
    from: shot.from, tuesday: at("Tuesday. The floor's"), noClick: at("Tuesday. The floor's", 0.85),
    keyboard: at("They didn't stop lying"), keys: at("They didn't stop lying", 0.45),
    lunch: at("At lunch, your team"), table: at("At lunch, your team", 0.62),
    colleague: at("Colleague: You okay?"), colE, fine1: hold(0.04), close: [hold(0.22), hold(0.55)] as const, fine2: hold(0.6),
    up: hold(0.82), lift, tv: at("But then someone on television"), end: shot.to,
  };
}
export type TextCues = ReturnType<typeof cues>;

// ------------------------------------------------------------------------------------------------ the silent floor

const H = 430;
/** People standing in the aisle with their phones: world x and feet y. */
const STANDING: [number, number][] = [[430, 1000], [610, 880], [1260, 900], [1420, 1010], [780, 800]];
/** Heads over the far monitors, bowed to phones. Plate pixels. */
const DESK_HEADS: [number, number][] = [[330, 404], [418, 398], [497, 396], [572, 394], [985, 396], [1048, 399], [1115, 403], [1190, 407], [1290, 412], [1380, 418]];
const BOSS_AISLE = { x: 980, y: 770, scale: scaleAt(770, H) };
const YOU_AISLE = { x: 1640, y: 1080, scale: scaleAt(1080, H) };

const texting = (frame: number, i: number): Pose => ({ ...STAND, armF: [35 + Math.sin(frame / 2.2 + i * 1.7) * 5, 95], armB: [25, 90], tilt: 14 });

const Texters: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    {DESK_HEADS.map(([u, v], i) => {
      const top = pw(u, v);
      const s = scaleAt(top.y + 210, H) * 0.95;
      return (
        <Cut key={`d${i}`} y={top.y + 4} id={`et-d${i}`}>
          <Body x={top.x} y={top.y + 236 * s} scale={s} facing={u < 760 ? 1 : -1} pose={{ ...STAND, tilt: 14 }} head={PASTELS[i % 8]} coat="#3b3e47"
            frame={frame} id={`et-d${i}`} count={{ base: 0 }} size={28 * s} look={{ x: 0.5, y: 0.9 }} mouth="flat" seed={i} />
        </Cut>
      );
    })}
    {[...STANDING].sort((a, b) => a[1] - b[1]).map(([x, y], i) => {
      const s = scaleAt(y, H);
      return (
        <Body key={`s${i}`} x={x} y={y} scale={s} facing={i % 2 ? -1 : 1} pose={texting(frame, i)} head={PASTELS[(i * 3 + 2) % 8]}
          coat={["#3d5a6c", "#5d6470", "#6b4b3a", "#2f3242", "#7a5a8c"][i]} frame={frame} id={`et-s${i}`} count={{ base: 0 }} size={30 * s}
          look={{ x: 0.5, y: 0.85 }} mouth="flat" seed={i + 4} held={<Handset scale={1.1} rotate={-60} />} />
      );
    })}
  </g>
);

const Memo: React.FC = () => (
  <g transform="rotate(-8)">
    <rect x={-40} y={-60} width={80} height={104} rx={4} fill={PAPER} stroke={INK} strokeWidth={4} />
    {[0, 1, 2, 3].map((r) => <rect key={r} x={-28} y={-44 + r * 20} width={56 - (r % 2) * 16} height={8} rx={4} fill={INK} opacity={0.5} />)}
  </g>
);

function floorShots(k: TextCues): Cam[] {
  const [x1, y1] = STANDING[1];
  const t = headOf(x1, y1, scaleAt(y1, H), texting(0, 1), -1);
  const b = headOf(BOSS_AISLE.x, BOSS_AISLE.y, BOSS_AISLE.scale, STAND, -1);
  const y = headOf(YOU_AISLE.x, YOU_AISLE.y, YOU_AISLE.scale, STAND, -1);
  return [
    { at: k.from, cam: { x: 960, y: 560, zoom: 1.0 }, to: { x: 960, y: 560, zoom: 1.07 } },
    { at: k.tuesday + 64, cam: onHead(t, 0.15, 140), to: onHead(t, 0.16, 140), name: "texter" },
    { at: k.keyboard, cam: onHead(b, 0.15, -260, 40), to: onHead(b, 0.16, -260, 40), name: "boss" },
    { at: k.keys, cam: onHead(y, 0.17, 170), to: onHead(y, 0.18, 170), name: "you" },
  ];
}

const Floor: React.FC<{ frame: number; k: TextCues }> = ({ frame, k }) => {
  const s = shotAt(frame, floorShots(k), k.lunch);
  const memoUp = ramp(frame, k.tuesday + 6, k.tuesday + 20);
  const bossPose: Pose = { ...STAND, armF: [mix(30, 85, memoUp), mix(20, 45, memoUp)] };
  return (
    <PlateScene plate="office-floor" cam={drift(s.cam, frame, "etf", 2)} mood="day" rimFrom="right"
      lights={[counterLight(headOf(BOSS_AISLE.x, BOSS_AISLE.y, BOSS_AISLE.scale, STAND, -1), "day", 0.3)]}
      actors={
        <>
          <Texters frame={frame} />
          <Body {...BOSS_AISLE} facing={-1} pose={bossPose} head={BOSS.head} coat={BOSS.coat} tie={BOSS.tie} frame={frame} id="boss-memo"
            count={{ base: 14 }} size={34 * BOSS_AISLE.scale} mouth="smirk" look={{ x: 1, y: 0 }} seed={2} held={<Memo />} />
          <Body {...YOU_AISLE} facing={-1} pose={{ ...STAND, armF: [30, 60] }} head={HERO.head} scarf={HERO.scarf} tuft frame={frame}
            id="you-floor" look={{ x: 1, y: 0.15 }} brows="flat" lids={0.3} mouth="flat" />
        </>
      } />
  );
};

const Component: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = cues(shot);
  const f = shot.frame;
  const on = current(f, [
    [shot.from, "floor"], [k.lunch - 2, "canteen"], [k.colleague - 6, "lift"], [k.tv, "rival"],
  ] as [number, "floor" | "canteen" | "lift" | "rival"][]);
  const memo = on === "floor" && ((f >= k.tuesday + 24 && f < k.tuesday + 64) || (f >= k.keyboard && f < k.keys));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {on === "floor" && <Floor frame={f} k={k} />}
      {on === "canteen" && <Canteen frame={f} k={k} />}
      {on === "lift" && <Lift frame={f} k={k} />}
      {on === "rival" && <RivalPhone frame={f} k={k} />}
      <Readout label="EVERYONE YOU CAN SEE" value={14} frame={f} on={k.tuesday - 9} off={k.keyboard} />
      {memo && <Tag at={f >= k.keyboard ? k.keyboard + 4 : k.tuesday + 24} text="MEMO: SENT IT FRIDAY." x={1040} y={f >= k.keyboard ? 820 : 200} size={44} tilt={-3} />}
    </AbsoluteFill>
  );
};

export const everybodyTexts: Beat = { id: "EverybodyTexts", first: "Tuesday. The floor's", lead: 0.3, Component };
