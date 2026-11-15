// Staff Last at the desk, morning: the traveller fanning nine flags and you holding up four fingers ("Only four?"),
// the fingers folding one by one; the boss upending the empty crate; his price card turning into drawings (a coin, a
// car, a flat, a street, each crossed out for the next); his look at the three coils on your chair.
import { AbsoluteFill } from "remotion";
import { seatedY, SEATED, STAND, walkPose } from "@whatif/kit/rig/pose";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { BOSS, camAt, HERO, mix, PASTELS, ramp } from "../shared";
import { aim, head, Person, type Body } from "./CityPlugsIn.Kit";
import { CHAIR, DeskFront, DeskLamp, EmptyCrate, Kettle, KeyBoard, Lobby, PEG, YourChair } from "./StaffLast.Set";

export const YOU_SEATED: Body = { x: CHAIR.x, y: seatedY(CHAIR.top, 1.1), scale: 1.1, facing: -1, pose: SEATED };
export const BOSS_AT_DESK: Body = { x: 300, y: 950, scale: 1.12, facing: 1, pose: STAND };
export const you = (face: object) => ({ head: HERO.head, scarf: HERO.scarf, tuft: true, flow: 0.08, ...face });
export const boss = (face: object) => ({ head: BOSS.head, coat: BOSS.coat, tie: BOSS.tie, ...face });

const FLAG_COLOURS = [["#d8344f", PAPER], ["#1d9a8f", "#d9c26a"], ["#7fa0c4", PAPER, "#d8344f"], ["#7fc29b", PAPER], ["#d9c26a", INK],
  ["#b58fc7", PAPER], ["#e6a0a0", "#1d9a8f"], [PAPER, "#d8344f"], ["#2f3e6a", "#d9c26a", PAPER]];

/** A paper fan of nine flags on sticks, `spread` 0 shut to 1 fanned (figure coordinates, for `held`). */
const FlagFan: React.FC<{ spread: number }> = ({ spread }) => (
  <g>
    {FLAG_COLOURS.map((stripes, i) => {
      const a = (i - 4) * 15 * spread + 20;
      return (
        <g key={i} transform={`rotate(${a})`}>
          <line x1={0} y1={0} x2={0} y2={-64} stroke="#8a6a4a" strokeWidth={3} />
          {stripes.map((c, k) => <rect key={k} x={0} y={-64 + k * (22 / stripes.length)} width={30} height={22 / stripes.length} fill={c} stroke={INK} strokeWidth={1} />)}
        </g>
      );
    })}
  </g>
);

/** Your raised hand: `n` of four fingers up (figure coordinates, for `held`). */
const Fingers: React.FC<{ n: number }> = ({ n }) => (
  <g>
    {[-24, -8, 8, 24].slice(0, n).map((a) => (
      <line key={a} x1={0} y1={-2} x2={Math.sin((a * Math.PI) / 180) * 26} y2={-2 - Math.cos((a * Math.PI) / 180) * 26} stroke={HERO.head} strokeWidth={7} strokeLinecap="round" />
    ))}
    <circle r={10} fill={HERO.head} stroke={INK} strokeWidth={2} />
  </g>
);

export interface TravellerTimes { start: number; nine: number; four: number; only: number; fold: number; end: number }

/** The lobby desk in the morning: you behind it; the traveller walks in and fans nine flags; you hold up four fingers,
 *  proud; the traveller looks at the fingers, then at you: "Only four?"; the fingers fold, one by one. */
export const TravellerShot: React.FC<{ frame: number; k: TravellerTimes }> = ({ frame, k }) => {
  const walkIn = ramp(frame, k.start, k.start + 24);
  const trav: Body = { x: mix(1260, 860, walkIn), y: 960, scale: 1.08, facing: -1, pose: walkIn < 1 ? walkPose(frame * 0.35) : { ...STAND, armF: [110, 10] } };
  const spread = ramp(frame, k.nine, k.nine + 8);
  const up = ramp(frame, k.four, k.four + 6) * (1 - ramp(frame, k.fold + 22, k.fold + 32));
  const n = frame < k.fold ? 4 : Math.max(0, 4 - Math.floor((frame - k.fold) / 5));
  const me: Body = { x: 330, y: 950, scale: 1.1, facing: 1, pose: { ...STAND, lean: 4, armF: [mix(20, 130, up), mix(20, 30, up)] } };
  const proud = frame >= k.four && frame < k.only + 6;
  const sunk = frame >= k.fold;
  const lookAt = frame < k.four + 6 ? { x: 1, y: 0 } : frame < k.four + 18 ? { x: 1, y: -0.9 } : { x: 1, y: 0.1 };
  const mh = head(me);
  const cam: Camera = frame >= k.fold
    ? camAt(frame, [[k.fold, closeUp(mh.x + 60, mh.y - 20, 2.3)], [k.end, closeUp(mh.x + 60, mh.y - 10, 2.5)]])
    : frame >= k.four
      ? camAt(frame, [[k.four, { x: 600, y: 640, zoom: 1.6 }], [k.fold, { x: 600, y: 640, zoom: 1.75 }]])
      : frame >= k.nine
        ? camAt(frame, [[k.nine, { x: 760, y: 640, zoom: 1.7 }], [k.four, { x: 740, y: 640, zoom: 1.8 }]])
        : camAt(frame, [[k.start, { x: 640, y: 640, zoom: 1.3 }], [k.nine, { x: 660, y: 640, zoom: 1.4 }]]);
  return (
    <Lobby frame={frame} cam={drift(cam, frame, "sl-trav", 3)} mood="morning">
      <KeyBoard />
      <YourChair coils={3} />
      <Person body={me} frame={frame} seed={1} who={you({ brows: proud ? "raised" : sunk ? "worry" : "none", lids: sunk ? 0.5 : 0.2, mouth: proud ? "smile" : sunk ? "flat" : "flat",
        look: { x: 1, y: 0.05 }, held: up > 0.2 ? <Fingers n={n} /> : undefined })} />
      <DeskFront />
      <DeskLamp lit={false} />
      <Kettle frame={frame} />
      {/* the traveller: a big backpack behind, the fan in front */}
      <g transform={`translate(${trav.x + 34} ${trav.y - 220})`}>
        <rect x={-10} y={-20} width={70} height={110} rx={18} fill="#d98a5a" stroke={INK} strokeWidth={5} />
        <rect x={0} y={30} width={50} height={30} rx={8} fill="#b86a3a" stroke={INK} strokeWidth={4} />
      </g>
      <Person body={trav} frame={frame} seed={6} who={{ head: PASTELS[5], coat: "#5c7a4a", cap: "#d9c26a", brows: frame >= k.only ? "worry" : "raised",
        mouth: frame >= k.only && frame < k.fold - 4 ? "open" : frame >= k.only ? "smile" : "smile", look: lookAt, held: walkIn >= 1 ? <FlagFan spread={spread} /> : undefined }} />
    </Lobby>
  );
};

const Coin = () => <g><circle r={36} fill="#d9b64a" stroke={INK} strokeWidth={5} /><circle r={24} fill="none" stroke={INK} strokeWidth={3} /></g>;
const Car = () => (
  <g>
    <path d="M-60 10 L-50 -14 L-24 -16 L-10 -34 L28 -34 L44 -14 L60 -10 L60 10 Z" fill="#7fa0c4" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={-32} cy={12} r={12} fill={INK} /><circle cx={34} cy={12} r={12} fill={INK} />
  </g>
);
const Flat = () => (
  <g>
    <rect x={-40} y={-50} width={80} height={96} fill="#c9a07a" stroke={INK} strokeWidth={5} />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-28 + (i % 2) * 36} y={-40 + Math.floor(i / 2) * 28} width={20} height={16} fill="#ffd98a" stroke={INK} strokeWidth={2} />)}
  </g>
);
const Street = () => (
  <g>
    {[0, 1, 2, 3].map((i) => (
      <g key={i} transform={`translate(${-75 + i * 50} 0)`}>
        <polygon points="-22,-10 0,-34 22,-10" fill="#7a4b3a" stroke={INK} strokeWidth={3} />
        <rect x={-20} y={-10} width={40} height={36} fill={["#e8b98a", "#d79c7a", "#c9b07a", "#e2c8a0"][i]} stroke={INK} strokeWidth={3} />
      </g>
    ))}
    <rect x={-100} y={28} width={200} height={14} fill="#8d7a62" />
  </g>
);

export interface SumsTimes { start: number; card: number; coin: number; car: number; flat: number; street: number; look: number; end: number }

/** The empty crate upended and shaken (nothing), then the boss at his price card doing sums: the card (screen) gains a
 *  coin, a car, a flat, a street, each crossed out as the next lands; he looks up at the coils by your chair. */
export const SumsShot: React.FC<{ frame: number; k: SumsTimes }> = ({ frame, k }) => {
  const tip = ramp(frame, k.start + 8, k.start + 18);
  const shake = frame >= k.start + 18 && frame < k.card ? Math.sin(frame * 1.6) * 8 : 0;
  const peer = frame >= k.start + 40;
  const atCard = frame >= k.card;
  const writing = atCard && frame < k.look;
  const b: Body = { ...BOSS_AT_DESK, pose: atCard ? { ...STAND, lean: 18, tilt: 16, armF: aim(BOSS_AT_DESK, { x: 430 + Math.sin(frame / 2) * 10 * (writing ? 1 : 0), y: 764 }) }
    : { ...STAND, lean: peer ? 14 : 4, tilt: peer ? 18 : 0, armF: aim(BOSS_AT_DESK, { x: 300 + shake, y: 690 - 160 * tip }), armB: aim(BOSS_AT_DESK, { x: 200 + shake, y: 690 - 160 * tip }) } };
  if (frame >= k.look) b.pose = { ...b.pose, lean: 6, tilt: -6 };
  const bh = head(b);
  const cam: Camera = frame >= k.look + 6
    ? camAt(frame, [[k.look + 6, { x: PEG.x + 10, y: PEG.y + 50, zoom: 2.8 }], [k.end, { x: PEG.x + 10, y: PEG.y + 50, zoom: 3.0 }]])
    : atCard
      ? camAt(frame, [[k.card, closeUp(bh.x + 60, bh.y + 40, 2.0)], [k.look, closeUp(bh.x + 70, bh.y + 40, 2.2)]])
      : camAt(frame, [[k.start, { x: 460, y: 680, zoom: 1.45 }], [k.card, { x: 440, y: 680, zoom: 1.6 }]]);
  const pencil = <rect x={-3} y={-30} width={6} height={34} rx={2} fill="#d9c26a" stroke={INK} strokeWidth={2} transform="rotate(20)" />;
  const steps = [k.coin, k.car, k.flat, k.street];
  const drawings = [Coin, Car, Flat, Street];
  return (
    <>
      <Lobby frame={frame} cam={drift(cam, frame, "sl-sums", 3)} mood="morning">
        <KeyBoard />
        <YourChair coils={3} />
        <Person body={{ ...YOU_SEATED, pose: { ...SEATED, lean: -6, armF: [30, 50], armB: [20, 60] } }} frame={frame} seed={1}
          who={you({ brows: "worry", lids: 0.45, mouth: "flat", look: frame >= k.look ? { x: -1, y: 0 } : { x: 1, y: 0.2 } })} />
        <Person body={b} frame={frame} seed={3} who={boss({ brows: frame >= k.look ? "raised" : peer && !atCard ? "angry" : "flat", lids: atCard && frame < k.look ? 0.4 : 0.1,
          mouth: frame >= k.look ? "smirk" : peer && !atCard ? "frown" : "flat", look: frame >= k.look ? { x: 1, y: -0.1 } : atCard ? { x: 0.8, y: 1 } : { x: 0.5, y: 0.4 }, held: atCard ? pencil : undefined })} />
        <DeskFront />
        {!atCard && <EmptyCrate x={250} y={772} tip={tip} shake={shake} />}
        {atCard && <rect x={380} y={760} width={110} height={14} rx={3} fill={PAPER} stroke={INK} strokeWidth={3} />}
        <DeskLamp lit={false} />
        <Kettle frame={frame} />
      </Lobby>
      {atCard && frame < k.look + 6 && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <svg width={1920} height={1080} viewBox="0 0 1920 1080">
            <g transform={`translate(1460 540) rotate(3) scale(${ramp(frame, k.card, k.card + 8)})`}>
              <rect x={-150} y={-330} width={310} height={680} rx={14} fill="#000" opacity={0.25} transform="translate(12 16)" />
              <rect x={-150} y={-330} width={310} height={680} rx={14} fill={PAPER} stroke="#cdbfa6" strokeWidth={5} />
              {steps.map((at, i) => {
                const D = drawings[i];
                if (frame < at) return null;
                const pop = ramp(frame, at, at + 6);
                const struck = i < 3 && frame >= steps[i + 1];
                return (
                  <g key={i} transform={`translate(5 ${-250 + i * 160}) scale(${0.6 + 0.4 * pop})`}>
                    <D />
                    {struck && <line x1={-90} y1={-40} x2={90} y2={40} stroke={CRIMSON} strokeWidth={12} strokeLinecap="round" />}
                    {struck && <line x1={-90} y1={40} x2={90} y2={-40} stroke={CRIMSON} strokeWidth={12} strokeLinecap="round" />}
                  </g>
                );
              })}
            </g>
          </svg>
        </AbsoluteFill>
      )}
    </>
  );
};
