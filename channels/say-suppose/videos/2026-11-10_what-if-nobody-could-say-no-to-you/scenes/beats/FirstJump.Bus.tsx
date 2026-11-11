// The bus of "The first jump" (lines 15-17), drawn here (a single-use set): inside a city bus side on, the street
// sliding past the windows, a bench under them. The auntie's huge bag is on the seat you want; you lean in and get as
// far as "excuse..."; snap, the bag is in her lap and she pats the seat for you. You sit, squeezed.
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { lerpPose, STAND, walkPose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { headAt, YesTag } from "../parts";
import { CHAIR_SIT, handAt, seatedY } from "../parts2";
import { blinking, camAt, current, HERO, mix, noise, ramp } from "../shared";
import { Deep } from "../sets/common";
import { aimed, OnHead, talk, type T } from "./FirstJump.Times";

const BUS = { floor: 960, seat: 840, rail: 170, windows: [-260, 380, 1020, 1660] };
const S = 1.15;
const A = 1.1;
/** The auntie: a lilac head, a magenta sari, a red bindi. She sits at the window end of the bench, facing forward. */
const AUNTIE = { x: 1300, head: "#c9a0d6", coat: "#b0306a" };
/** The bag on the seat beside her, and in her lap after the yes (its bottom centre). */
const BAG_SEAT = { x: 1140, y: BUS.seat };
const BAG_LAP = { x: 1435, y: BUS.seat - 4 };
const SIT_X = 1120;

/** The street outside, sliding left. */
const Street: React.FC<{ frame: number }> = ({ frame }) => {
  const TILE = 2400;
  const off = -((frame * 7) % TILE);
  return (
    <>
      <rect x={-1400} y={-600} width={4800} height={1700} fill="#bfe0ea" />
      {[0, 1, 2].map((rep) => (
        <g key={rep} transform={`translate(${off + (rep - 1) * TILE} 0)`}>
          {Array.from({ length: 12 }, (_, i) => {
            const bx = i * 200, h = 160 + noise(i + 5) * 200;
            return (
              <g key={i}>
                <rect x={bx} y={620 - h} width={190} height={h + 300} fill={["#e8c9a0", "#cfe0c8", "#f0d58e", "#e3b8a8"][i % 4]} />
                <rect x={bx + 20} y={560} width={150} height={40} fill={["#d8344f", "#1d9a8f", "#f2b632"][i % 3]} />
                {[0, 1].map((w) => <rect key={w} x={bx + 30 + w * 80} y={640 - h + 30} width={50} height={40} rx={4} fill="#8fa6b5" />)}
              </g>
            );
          })}
          {[300, 1100, 1900].map((tx) => <circle key={tx} cx={tx} cy={470} r={90} fill="#5ba06f" />)}
        </g>
      ))}
    </>
  );
};

/** The bus inside: windows on the street, the bench, the grab rail and straps, the floor. */
const BusBack: React.FC<{ cam: Camera; frame: number }> = ({ cam, frame }) => {
  const holes = BUS.windows.map((x) => `M${x + 24} 300 H${x + 556} Q${x + 580} 300 ${x + 580} 324 V556 Q${x + 580} 580 ${x + 556} 580 H${x + 24} Q${x} 580 ${x} 556 V324 Q${x} 300 ${x + 24} 300Z`).join(" ");
  return (
    <>
      <Deep cam={cam} depth={0.4} flat><Street frame={frame} /></Deep>
      <Deep cam={cam} depth={1}>
        <path d={`M-1400 -800 H3400 V1800 H-1400Z ${holes}`} fillRule="evenodd" fill="#cfe3d4" />
        {BUS.windows.map((x) => <rect key={x} x={x} y={300} width={580} height={280} rx={24} fill="none" stroke="#7a8a80" strokeWidth={14} />)}
        <rect x={-1400} y={-800} width={4800} height={950} fill="#e9efe6" />
        <rect x={-1400} y={BUS.rail - 6} width={4800} height={12} rx={6} fill="#9aa39c" stroke={INK} strokeWidth={3} />
        {Array.from({ length: 10 }, (_, i) => -300 + i * 300).map((x) => (
          <g key={x}><line x1={x} y1={BUS.rail} x2={x} y2={BUS.rail + 70} stroke="#5c6675" strokeWidth={5} /><circle cx={x} cy={BUS.rail + 86} r={16} fill="none" stroke="#5c6675" strokeWidth={6} /></g>
        ))}
        {/* the bench under the windows, the back rest, the floor */}
        <rect x={-1400} y={620} width={4800} height={220} fill="#2f7a6a" />
        {Array.from({ length: 16 }, (_, i) => <rect key={i} x={-1300 + i * 240} y={632} width={8} height={200} fill="#000" opacity={0.12} />)}
        <rect x={-1400} y={BUS.seat - 8} width={4800} height={34} rx={10} fill="#3a8f7c" stroke={INK} strokeWidth={4} />
        <rect x={-1400} y={BUS.seat + 26} width={4800} height={100} fill="#4a5262" />
        <rect x={-1400} y={BUS.floor} width={4800} height={600} fill="#6b6258" />
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-1400 + i * 160} y1={BUS.floor} x2={-1400 + i * 160 - 120} y2={BUS.floor + 300} stroke="#5a524a" strokeWidth={4} />)}
        <rect x={1720} y={-800} width={46} height={1760} rx={20} fill="#e2c03a" stroke={INK} strokeWidth={5} />
      </Deep>
    </>
  );
};

/** The huge woven bag: red, blue and cream checks, two handles, a long gourd and greens poking out. Bottom centre (x, y). */
const BigBag: React.FC<{ x: number; y: number; scale?: number; tilt?: number }> = ({ x, y, scale = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <path d="M-60 -170 Q-90 -230 -50 -250 Q-30 -200 -40 -168Z" fill="#5ba06f" stroke={INK} strokeWidth={4} />
    <rect x={-10} y={-260} width={36} height={130} rx={18} fill="#9cc66a" stroke={INK} strokeWidth={4} transform="rotate(14 8 -195)" />
    <path d="M-100 -164 Q-104 -6 -84 0 H84 Q104 -6 100 -164Z" fill={PAPER} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <clipPath id="fj-bag"><path d="M-100 -164 Q-104 -6 -84 0 H84 Q104 -6 100 -164Z" /></clipPath>
    <g clipPath="url(#fj-bag)">
      {[-90, -50, -10, 30, 70].map((sx) => <rect key={sx} x={sx} y={-170} width={20} height={180} fill={CRIMSON} opacity={0.75} />)}
      {[-150, -110, -70, -30].map((sy) => <rect key={sy} x={-110} y={sy} width={220} height={18} fill="#3f6fb5" opacity={0.6} />)}
    </g>
    <path d="M-100 -164 Q-104 -6 -84 0 H84 Q104 -6 100 -164Z" fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M-60 -160 Q-40 -220 -10 -160 M20 -160 Q50 -220 70 -160" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
  </g>
);

export const BusShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const c = k.clips;
  const shot = current(frame, [[k.bus, "wide"], [k.bag, "bag"], [k.lean, "lean"], [k.pat, "pat"], [k.sit, "sit"], [k.squeeze, "squeeze"]]);
  // You: walk in down the aisle, take a strap, lean in toward the seat with an open hand; then sit.
  const walkIn = ramp(frame, k.bus, k.bag - 4);
  const walking = walkIn > 0 && walkIn < 1;
  const sitting = ramp(frame, k.sit, k.sit + 14);
  const lean = 15 * ramp(frame, k.lean, k.lean + 10) * (1 - sitting);
  const youX = frame < k.sit ? mix(520, 900, walkIn) : mix(900, SIT_X, sitting);
  const base = walking ? walkPose(frame * 0.32) : lerpPose({ ...STAND, lean }, CHAIR_SIT, sitting);
  const asking = frame >= k.lean && sitting === 0;
  const you = aimed(youX, mix(BUS.floor, seatedY(BUS.seat, S), sitting), S, 1, base,
    asking ? { x: 1030, y: 770 } : sitting > 0.5 ? { x: SIT_X + 70, y: 830 } : null,
    sitting > 0 ? { x: SIT_X + 40, y: 840 } : walking ? null : { x: youX - 20, y: 520 });
  const youHead = headAt(you.x, you.y, S, you.pose);
  const yFace = ({
    wide: { ...EXPRESSIONS.neutral, look: { x: 0.9, y: 0.2 } },
    bag: { ...EXPRESSIONS.sceptical, look: { x: 0.9, y: 0.6 } },
    lean: frame < k.excuse ? { brows: "worry" as const, lids: 0, mouth: "smile" as const, eyes: 1, look: { x: 0.9, y: 0.2 } }
      : frame < k.bagSnap ? { brows: "worry" as const, lids: 0, mouth: "open" as const, eyes: 1, look: { x: 0.9, y: 0.2 } }
        : { ...EXPRESSIONS.shocked, eyes: 1.25, look: { x: 0.9, y: 0.1 } },
    pat: { ...EXPRESSIONS.shocked, eyes: 1.2, look: { x: 0.9, y: 0.3 } },
    sit: { ...EXPRESSIONS.shocked, mouth: "flat" as const, eyes: 1.1, look: { x: 0.9, y: -0.1 } },
    squeeze: { brows: "flat" as const, lids: 0.35, mouth: "flat" as const, eyes: 1, look: { x: 0.95, y: -0.15 } },
  })[shot];
  // The strap you hold hangs from the rail to your back hand.
  const strapHand = handAt(you, "back");
  // The bag: on the seat, then (snap) in her lap, as fast as a blink.
  const moved = ramp(frame, k.bagSnap - 3, k.bagSnap + 3);
  const bag = { x: mix(BAG_SEAT.x, BAG_LAP.x, moved), y: mix(BAG_SEAT.y, BAG_LAP.y, moved) - Math.sin(moved * Math.PI) * 60 };
  // Her: looking out of the window; after the yes, eyes back at you, smiling, patting the seat beside her.
  const yes = frame >= k.bagSnap;
  const pat = yes ? Math.abs(Math.sin((frame - k.bagSnap) / 4)) * 16 : 0;
  const aunt = aimed(AUNTIE.x, seatedY(BUS.seat, A), A, 1, CHAIR_SIT,
    yes ? { x: BAG_LAP.x - 40, y: BAG_LAP.y - 120 } : { x: AUNTIE.x + 90, y: 820 },
    yes && sitting < 0.5 ? { x: SIT_X + 60, y: BUS.seat - 12 - pat } : null);
  const auntHead = headAt(aunt.x, aunt.y, A, aunt.pose);
  const aFace = yes
    ? { brows: "raised" as const, lids: 0, mouth: talk(frame, c[16], "smile", "open", "smile"), eyes: 1.05, look: { x: -0.85, y: 0.1 } }
    : { ...EXPRESSIONS.neutral, look: { x: 0.9, y: -0.1 } };
  const actors = (
    <>
      {sitting === 0 && !walking && <line x1={strapHand.x} y1={BUS.rail} x2={strapHand.x} y2={strapHand.y - 14} stroke="#5c6675" strokeWidth={5} />}
      {sitting === 0 && !walking && <circle cx={strapHand.x} cy={strapHand.y - 2} r={15} fill="none" stroke="#5c6675" strokeWidth={6} />}
      <Figure x={aunt.x} y={aunt.y} scale={A} pose={aunt.pose} head={AUNTIE.head} coat={AUNTIE.coat} {...aFace} blink={blinking(frame, 8)} time={frame} />
      <OnHead {...aunt}><circle cx={4} cy={-26} r={5} fill={CRIMSON} /></OnHead>
      <BigBag x={bag.x} y={bag.y} scale={0.95} tilt={moved > 0 && moved < 1 ? 12 : 0} />
      <Figure {...HERO} x={you.x} y={you.y} scale={S} pose={you.pose} {...yFace} blink={blinking(frame, 1)} time={frame} flow={walking ? 0.2 : 0} />
      <YesTag frame={frame} at={k.bagSnap} x={auntHead.x} headY={auntHead.y} r={auntHead.r} />
    </>
  );
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.bus, { x: 980, y: 560, zoom: 1.08 }], [k.bag, { x: 1000, y: 580, zoom: 1.18 }]]),
    bag: camAt(frame, [[k.bag, { x: 1250, y: 700, zoom: 2.0 }], [k.lean, { x: 1240, y: 705, zoom: 2.15 }]]),
    lean: camAt(frame, [[k.lean, { x: 1090, y: 640, zoom: 1.7 }], [k.bagSnap, { x: 1110, y: 640, zoom: 1.8 }], [k.pat, { x: 1150, y: 650, zoom: 1.65 }]]),
    pat: camAt(frame, [[k.pat, { x: 1170, y: 650, zoom: 1.6 }], [k.sit, { x: 1190, y: 660, zoom: 1.66 }]]),
    sit: camAt(frame, [[k.sit, { x: 1230, y: 680, zoom: 1.55 }], [k.squeeze, { x: 1240, y: 690, zoom: 1.6 }]]),
    squeeze: camAt(frame, [[k.squeeze, closeUp(youHead.x + 110, youHead.y - 10, 2.3)], [k.auto, closeUp(youHead.x + 115, youHead.y - 10, 2.55)]]),
  };
  // The bus rocks a little on the road.
  const rock = Math.sin(frame / 6) * 3 + Math.sin(frame / 2.3) * 0.8;
  const cam0 = drift(cams[shot], frame, "bus", 3);
  const cam = { ...cam0, y: cam0.y + rock / cam0.zoom };
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<BusBack cam={cam} frame={frame} />} actors={actors} />;
};
