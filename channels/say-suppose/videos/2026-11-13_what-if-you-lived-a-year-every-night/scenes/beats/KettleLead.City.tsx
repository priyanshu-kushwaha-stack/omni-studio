// The Kettle Lead after the peak (KettleLead.tsx, lines 72-74): inside, you on a bakery crate in the town square with the
// long drawing held up and the teacher beside you, a crowd copying it, then every copy held up at once; the hall where a
// thousand glowing heads cross the hatch lips at once, each with the drawing over it; the city in fast cuts (sleepers
// holding up their own lamp cords, a shop wall of empty kettle hooks and a shrug, a queue carrying kettles into the
// hotel and out without them, your boss's crate on the pavement and its price card crossed out down to a kettle); three
// made-up flags over three parliaments, a kettle stamped with a crimson cross under each, the crosses peeled off, the
// ministers on a bench with heavy lids and smug smiles.
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { Figure } from "@whatif/kit/rig/Figure";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { TOWN_FLOOR, TownBack, townLights } from "../sets/InsideTown";
import { Deep } from "../sets/common";
import { BOSS, camAt, HERO, mix, noise, OLD, PASTELS, PIANO, ramp } from "../shared";
import { Extra, HallStage, Kettle, LeadPlug } from "./NightThirty.Hall";
import { OwnStage, PlugDrawing } from "./KettleLead.Inserts";
import { aimArm, headOf, type Body } from "./Timeline.Cast";
import type { KL } from "./KettleLead";

const COATS = ["#3f4a5c", "#5c3f4a", "#4a5c3f", "#3b3e47", "#6a5a4c", "#2f4a5a"];
const COLS = [150, 450, 750, 1050, 1350, 1650];
const PODS = COLS.flatMap((x, i) => [{ x, y: 395, i: i * 2 }, { x, y: 640, i: i * 2 + 1 }]);

/** 72a: the town square: you on a crate with the drawing up, the teacher pointing, the crowd copying; all copies up at `up`. */
export const Teaching: React.FC<{ frame: number; k: KL }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.teach, { x: 960, y: 610, zoom: 1.12 }], [k.heads, { x: 960, y: 600, zoom: 1.22 }]]), frame, "kl-teach", 3);
  const street = TOWN_FLOOR - 60;
  const you: Body = { x: 700, y: street - 80, scale: 1.0, facing: 1, pose: STAND };
  const sheet = { x: 760, y: 420, w: 460, h: 120 };
  you.pose = { ...STAND, lean: -4, armF: aimArm(you, { x: sheet.x + 30, y: sheet.y + 60 }), armB: aimArm(you, { x: sheet.x + 10, y: sheet.y + 100 }) };
  const teacher: Body = { x: 1330, y: street, scale: 1.02, facing: -1, pose: STAND };
  teacher.pose = { ...STAND, armF: aimArm(teacher, { x: sheet.x + sheet.w - 40 + 20 * Math.sin(frame / 8), y: sheet.y + 70 }) };
  const up = frame >= k.copiesUp;
  const crowd = Array.from({ length: 9 }, (_, i) => {
    const x = 240 + i * 180 + (i % 2) * 30;
    const b: Body = { x, y: TOWN_FLOOR + 70 + (i % 2) * 30, scale: 1.05 + (i % 2) * 0.08, facing: x < 960 ? 1 : -1, pose: STAND };
    const h = headOf(b);
    const write = Math.sin(frame / 3 + i);
    b.pose = up ? { ...STAND, armF: aimArm(b, { x: h.x + 30 * b.facing, y: h.y - 140 }) } : { ...STAND, lean: 10, armF: aimArm(b, { x: h.x + 50 * b.facing, y: h.y + 110 + 6 * write }), armB: aimArm(b, { x: h.x + 70 * b.facing, y: h.y + 120 }) };
    return { b, i, h: headOf(b) };
  });
  return (
    <LookContext.Provider value={setLook(townLights(), "day", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<TownBack cam={cam} frame={frame} />} actors={
        <>
          <rect x={620} y={street - 80} width={170} height={80} rx={6} fill="#b8895a" stroke={INK} strokeWidth={5} />
          <line x1={620} y1={street - 40} x2={790} y2={street - 40} stroke={INK} strokeWidth={3} opacity={0.5} />
          <Figure {...you} head={HERO.head} scarf={HERO.scarf} tuft flow={0.1} time={frame} blink={frame % 97 < 4} brows="raised" lids={0.1} mouth={Math.floor(frame / 8) % 2 ? "open" : "smile"} look={{ x: 1, y: -0.3 }} />
          <PlugDrawing {...sheet} grow={1} held />
          <Figure {...teacher} head={PIANO.head} coat={PIANO.coat} time={frame} blink={(frame + 9) % 97 < 4} brows="raised" lids={0.2} mouth="smile" look={{ x: 1, y: -0.5 }} />
          {crowd.map(({ b, i, h }) => {
            const old = i === 4;
            const hand = up ? { x: h.x + 30 * b.facing, y: h.y - 150 } : { x: h.x + 60 * b.facing, y: h.y + 110 };
            return (
              <g key={i}>
                <Extra body={b} frame={frame} seed={i + 20} head={old ? OLD.head : PASTELS[i % PASTELS.length]} coat={old ? OLD.coat : i === 2 ? "#f3efe6" : COATS[i % COATS.length]}
                  lids={old ? 0.8 : up ? 0 : 0.3} mouth={up ? "open" : "flat"} brows={up ? "raised" : "flat"} look={up ? { x: 0.4, y: -0.8 } : { x: 0.6, y: 0.8 }} cap={i === 6 ? "#5f9e8a" : undefined} />
                <g transform={`translate(${hand.x} ${hand.y}) rotate(${up ? -4 * b.facing : 70 * b.facing})`}>
                  <rect x={-50} y={-30} width={100} height={60} rx={4} fill={PAPER} stroke={INK} strokeWidth={3} />
                  <path d="M-38 0 q12 -18 24 0 t24 0 t24 0" fill="none" stroke={TEAL} strokeWidth={4} />
                </g>
              </g>
            );
          })}
        </>
      } />
    </LookContext.Provider>
  );
};

/** Every pod in the hall swung open with a head rising over its lip (`rise` 0..1); `glow` puts a halo and the little
 *  drawing over each head; `cords` has them hold up a lamp cord instead. Back slot, REF coordinates at depth 0.85. */
export const OpenPods: React.FC<{ frame: number; rise: number; glow?: boolean; cords?: boolean; skip?: number }> = ({ frame, rise, glow, cords, skip = 3 }) => (
  <g>
    <defs>
      <radialGradient id="kl-halo" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#fff3c4" stopOpacity={0.9} />
        <stop offset="1" stopColor="#ffd98a" stopOpacity={0} />
      </radialGradient>
    </defs>
    {PODS.filter((p) => p.i !== skip).map((p) => {
      const r = Math.max(0, Math.min(1, rise * 1.3 - noise(p.i) * 0.3));
      const b: Body = { x: p.x + 135, y: p.y + 200 + mix(150, 40, r), scale: 0.62, facing: noise(p.i + 3) > 0.5 ? 1 : -1, pose: { ...STAND, armF: cords ? [170, 0] : [20, 20] } };
      const h = headOf(b);
      return (
        <g key={p.i}>
          <rect x={p.x + 16} y={p.y + 16} width={238} height={168} rx={22} fill="#0a0c16" />
          <rect x={p.x + 6} y={p.y - 28} width={258} height={30} rx={8} fill="#323a5a" stroke={INK} strokeWidth={4} />
          <clipPath id={`kl-pod-${p.i}`}><rect x={p.x + 16} y={p.y - 200} width={238} height={384} /></clipPath>
          <g clipPath={`url(#kl-pod-${p.i})`}>
            {glow && <circle cx={h.x} cy={h.y} r={h.r * 2.4 * r} fill="url(#kl-halo)" />}
            <Figure {...b} head={PASTELS[p.i % PASTELS.length]} coat={COATS[p.i % COATS.length]} time={frame} blink={(frame + p.i * 37) % 97 < 4}
              lids={0.55} mouth="smirk" look={{ x: 0.6, y: -0.3 }} />
            {cords && r > 0.5 && <LeadPlug x={h.x + 40 * b.facing} y={h.y - 70} angle={-90} color="#efe6d2" scale={0.8} />}
          </g>
          <rect x={p.x} y={p.y + 176} width={270} height={24} rx={8} fill="#262d45" stroke={INK} strokeWidth={4} />
          {glow && r > 0.8 && (
            <g transform={`translate(${h.x + 50} ${h.y - 70}) rotate(-6)`}>
              <rect x={-34} y={-20} width={68} height={40} rx={4} fill={PAPER} stroke={INK} strokeWidth={3} />
              <path d="M-26 0 q8 -12 16 0 t16 0 t16 0" fill="none" stroke={TEAL} strokeWidth={3} />
            </g>
          )}
        </g>
      );
    })}
  </g>
);

/** 72b and 73a: the hall with every hatch open, glowing heads (night) or sleepers holding up their lamp cords (morning). */
export const PodsShot: React.FC<{ frame: number; from: number; cam: Camera; morning?: boolean }> = ({ frame, from, cam, morning }) => (
  <HallStage cam={cam} frame={frame} mood={morning ? "morning" : "night"} hall={{ door: 1, counter: { value: "365" }, wedge: morning }}
    back={<Deep cam={cam} depth={0.85}><OpenPods frame={frame} rise={ramp(frame, from, from + 14)} glow={!morning} cords={morning} /></Deep>} actors={<></>} />
);

/** 73b: a shop wall of empty kettle hooks and the shopkeeper's shrug at `shrug`. */
export const EmptyHooks: React.FC<{ frame: number; from: number; shrug: number; to: number }> = ({ frame, from, shrug, to }) => {
  const cam = drift(camAt(frame, [[from, { x: 960, y: 560, zoom: 1.1 }], [to, { x: 960, y: 580, zoom: 1.25 }]]), frame, "kl-shop", 3);
  const s = frame >= shrug;
  const keeper: Body = { x: 960, y: 1000, scale: 1.2, facing: 1, pose: s ? { ...STAND, armF: [38, 72], armB: [-38, -72], drop: 4, tilt: 8 } : { ...STAND, armF: [20, 30] } };
  return (
    <OwnStage cam={cam} mood="morning" back={
      <g>
        <rect x={-1400} y={-900} width={4800} height={2900} fill="#d9c49a" />
        <rect x={260} y={140} width={1400} height={560} rx={10} fill="#b8895a" stroke={INK} strokeWidth={6} />
        {Array.from({ length: 18 }, (_, i) => {
          const x = 360 + (i % 6) * 240, y = 230 + Math.floor(i / 6) * 170;
          return (
            <g key={i}>
              <rect x={x - 46} y={y + 6} width={92} height={110} rx={10} fill="none" stroke="#8a6a3a" strokeWidth={3} strokeDasharray="10 8" />
              <path d={`M${x} ${y - 6} v16 q0 12 12 6`} fill="none" stroke="#c9ced6" strokeWidth={6} strokeLinecap="round" />
            </g>
          );
        })}
        <rect x={-1400} y={820} width={4800} height={900} fill="#8a5c3b" stroke={INK} strokeWidth={6} />
      </g>
    } actors={
      <Extra body={keeper} frame={frame} seed={13} head={PASTELS[4]} coat="#7a5d47" mouth={s ? "flat" : "smile"} brows={s ? "raised" : "none"} lids={s ? 0.3 : 0} look={{ x: 0.2, y: 0 }} />
    } />
  );
};

/** The hotel front on the street at morning: a dark wall, a lit door with a crimson awning, the pavement. */
const HotelFront: React.FC = () => (
  <g>
    <rect x={-1400} y={-900} width={4800} height={2900} fill="#9fc0e0" />
    <rect x={200} y={120} width={1500} height={760} fill="#3a3f55" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={300 + (i % 5) * 300} cy={220 + Math.floor(i / 5) * 160} r={34} fill="#ffc46b" stroke={INK} strokeWidth={4} />)}
    <rect x={820} y={560} width={260} height={320} fill="#ffe2a6" stroke="#7a5d47" strokeWidth={12} />
    <path d="M790 560 L1110 560 L1080 520 L820 520 Z" fill={CRIMSON} stroke={INK} strokeWidth={5} />
    <rect x={-1400} y={880} width={4800} height={900} fill="#9a9488" />
    <rect x={-1400} y={876} width={4800} height={10} fill="#7a756b" />
  </g>
);

/** 73c: a queue carrying kettles into the hotel and walking out without them. */
export const KettleQueue: React.FC<{ frame: number; from: number; to: number }> = ({ frame, from, to }) => {
  const cam = drift(camAt(frame, [[from, { x: 960, y: 620, zoom: 1.0 }], [to, { x: 960, y: 640, zoom: 1.12 }]]), frame, "kl-queue", 3);
  const walkers = Array.from({ length: 10 }, (_, i) => {
    const inbound = i % 2 === 0;
    const span = 1500;
    const t = ((frame - from) * 4.2 + i * 150) % span;
    const x = inbound ? 160 + t * 0.53 : 950 - t * 0.6;
    if (inbound && x > 930) return null;
    const b: Body = { x, y: 960 + (inbound ? 0 : 30), scale: inbound ? 0.95 : 1.0, facing: inbound ? 1 : -1, pose: walkPose(frame * 0.35 + i) };
    if (inbound) b.pose = { ...b.pose, armF: [70, 30] };
    return { b, i, inbound };
  });
  return (
    <OwnStage cam={cam} mood="morning" back={<HotelFront />} actors={
      <>
        {walkers.map((w) => w && (
          <g key={w.i}>
            <Extra body={w.b} frame={frame} seed={w.i} head={PASTELS[w.i % PASTELS.length]} coat={COATS[w.i % COATS.length]} mouth={w.inbound ? "flat" : "smile"} lids={0.4} />
            {w.inbound && <Kettle x={w.b.x + 70 * w.b.scale} y={w.b.y - 150 * w.b.scale} scale={0.55} />}
          </g>
        ))}
      </>
    } />
  );
};

/** One little drawing on the boss's price card, by row: coin, car, flat, street, more streets, a bridge, a tower... */
const CardItem: React.FC<{ i: number }> = ({ i }) => (
  <g>
    {i % 4 === 0 && <circle r={16} fill={MUSTARD} stroke={INK} strokeWidth={3} />}
    {i % 4 === 1 && <rect x={-26} y={-10} width={52} height={20} rx={6} fill={CRIMSON} stroke={INK} strokeWidth={3} />}
    {i % 4 === 2 && <rect x={-16} y={-20} width={32} height={40} fill="#c9b07a" stroke={INK} strokeWidth={3} />}
    {i % 4 === 3 && <path d="M-30 14 V-6 L-18 -18 L-6 -6 V14 M-4 14 V-10 L10 -22 L24 -10 V14 Z" fill="#e8b98a" stroke={INK} strokeWidth={3} />}
  </g>
);

/** 73d: your boss's crate on the pavement and its price card: eleven drawings crossed out one by one, then a kettle. */
export const CrateOut: React.FC<{ frame: number; k: KL }> = ({ frame, k }) => {
  const close = frame >= k.crosses[0] && frame < k.sulk;
  const cam = close
    ? drift(camAt(frame, [[k.crosses[0], { x: 1240, y: 530, zoom: 3.0 }], [k.sulk, { x: 1240, y: 540, zoom: 2.8 }]]), frame, "kl-card", 2)
    : drift(camAt(frame, [[k.crate, { x: 1080, y: 620, zoom: 1.2 }], [k.end, { x: 1100, y: 640, zoom: 1.35 }]]), frame, "kl-crate", 3);
  const n = Math.round(11 * ramp(frame, k.crosses[0] + 6, k.crosses[1]));
  const sulk = frame >= k.sulk;
  const carry = ramp(frame, k.crate, k.crate + 30);
  const boss: Body = sulk
    ? { x: 1120, y: 993, scale: 1.1, facing: -1, pose: { ...STAND, legF: [88, -88], legB: [92, -92], lean: 14, armF: [60, 120], armB: [50, 130] } }
    : { x: mix(950, 1080, carry), y: 960, scale: 1.1, facing: 1, pose: carry < 1 ? { ...walkPose(frame * 0.3), armF: [80, 40], armB: [70, 40] } : { ...STAND, armF: [40, 30] } };
  const crateY = carry < 1 && !sulk ? headOf(boss).y + 110 : 960;
  return (
    <OwnStage cam={cam} mood="morning" back={<HotelFront />} actors={
      <>
        <g transform={`translate(1240 ${960 - 60})`}>
          <line x1={0} y1={60} x2={0} y2={-260} stroke="#8a6a3a" strokeWidth={10} />
          <rect x={-90} y={-520} width={180} height={300} rx={8} fill={PAPER} stroke={INK} strokeWidth={4} />
          {Array.from({ length: 11 }, (_, i) => (
            <g key={i} transform={`translate(${-48 + (i % 3) * 48} ${-490 + Math.floor(i / 3) * 52}) scale(0.7)`}>
              <CardItem i={i} />
              {i < n && <path d="M-30 14 L30 -14 M-30 -14 L30 14" stroke={CRIMSON} strokeWidth={6} strokeLinecap="round" />}
            </g>
          ))}
          {n >= 11 && (
            <g transform="translate(48 -330)">
              <Kettle x={0} y={18} scale={0.4} />
              <ellipse cx={0} cy={2} rx={34} ry={30} fill="none" stroke={CRIMSON} strokeWidth={4} />
            </g>
          )}
        </g>
        <g transform={`translate(${sulk ? 1120 : boss.x + 60} ${crateY})`}>
          <rect x={-90} y={-90} width={180} height={90} rx={6} fill="#b8895a" stroke={INK} strokeWidth={5} />
          <line x1={-90} y1={-45} x2={90} y2={-45} stroke={INK} strokeWidth={3} opacity={0.5} />
        </g>
        <Figure {...boss} head={BOSS.head} coat={BOSS.coat} tie={BOSS.tie} time={frame} blink={frame % 97 < 4}
          brows={sulk ? "flat" : "raised"} lids={sulk ? 0.5 : 0.1} mouth={sulk ? "frown" : "smile"} look={sulk ? { x: 0.3, y: 0.5 } : { x: 1, y: 0 }} />
      </>
    } />
  );
};

/** A made-up flag (no country's): `i` picks its bands and shape. Waves with the frame. */
const Flag: React.FC<{ x: number; y: number; i: number; frame: number }> = ({ x, y, i, frame }) => {
  const w = Math.sin(frame / 6 + i) * 8;
  const c = [[TEAL, MUSTARD], [CRIMSON, PAPER], ["#5a6aa8", "#7fc29b"]][i];
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + 200} stroke={INK} strokeWidth={6} />
      <path d={`M${x} ${y} q60 ${w} 120 0 v80 q-60 ${-w} -120 0z`} fill={c[0]} stroke={INK} strokeWidth={4} />
      {i === 0 && <circle cx={x + 60} cy={y + 40} r={18} fill={c[1]} />}
      {i === 1 && <rect x={x + 44} y={y + 2} width={22} height={78} fill={c[1]} />}
      {i === 2 && <path d={`M${x} ${y + 40} h120`} stroke={c[1]} strokeWidth={22} />}
    </g>
  );
};

/** 74: three parliaments under three flags, a kettle under each stamped with a cross at `stamp`, peeled at `peel`; then
 *  the ministers on a bench at `bench`, lids heavy, smug. */
export const Parliaments: React.FC<{ frame: number; k: KL }> = ({ frame, k }) => {
  if (frame >= k.ministers) {
    const cam = drift(camAt(frame, [[k.ministers, { x: 960, y: 600, zoom: 1.15 }], [k.end, { x: 960, y: 620, zoom: 1.3 }]]), frame, "kl-min", 2);
    return (
      <OwnStage cam={cam} mood="morning" back={
        <g>
          <rect x={-1400} y={-900} width={4800} height={2900} fill="#c9b8a0" />
          {[300, 700, 1100, 1500].map((x) => <rect key={x} x={x} y={120} width={80} height={700} fill="#e8dcc6" stroke={INK} strokeWidth={4} />)}
          <rect x={-1400} y={840} width={4800} height={900} fill="#7a4a3e" />
          <rect x={380} y={760} width={1160} height={30} rx={8} fill="#8a5c3b" stroke={INK} strokeWidth={5} />
        </g>
      } actors={
        <>
          {[0, 1, 2, 3, 4].map((i) => {
            const b: Body = { x: 480 + i * 240, y: 760 + 112 * 1.05, scale: 1.05, facing: i < 2 ? 1 : -1, pose: { ...STAND, legF: [88, -88], legB: [92, -92], armF: [30, 50], armB: [20, 60] } };
            return <Extra key={i} body={b} frame={frame} seed={i + 40} head={PASTELS[(i * 3 + 1) % PASTELS.length]} coat="#3b3f4a" tie={[CRIMSON, TEAL, MUSTARD, "#5a6aa8", CRIMSON][i]}
              lids={0.78} mouth="smirk" brows="flat" look={{ x: 0.3, y: 0.2 }} />;
          })}
        </>
      } />
    );
  }
  const cam = drift(camAt(frame, [[k.flags, { x: 960, y: 560, zoom: 1.0 }], [k.ministers, { x: 960, y: 580, zoom: 1.1 }]]), frame, "kl-parl", 2);
  const stamp = ramp(frame, k.stamp, k.stamp + 6);
  const peel = ramp(frame, k.peel, k.peel + 18);
  return (
    <OwnStage cam={cam} mood="morning" back={
      <g>
        <rect x={-1400} y={-900} width={4800} height={2900} fill="#9fc0e0" />
        <rect x={-1400} y={860} width={4800} height={900} fill="#b9a68c" />
      </g>
    } actors={
      <>
        {[0, 1, 2].map((i) => {
          const x = 380 + i * 580;
          const dome = ["#e8dcc6", "#d7c49a", "#c9d0d6"][i];
          return (
            <g key={i}>
              <Flag x={x - 4} y={120} i={i} frame={frame} />
              <path d={`M${x - 150} 470 Q${x} ${i === 1 ? 330 : 360} ${x + 150} 470 Z`} fill={dome} stroke={INK} strokeWidth={5} />
              <rect x={x - 190} y={470} width={380} height={240} fill={dome} stroke={INK} strokeWidth={5} />
              {[0, 1, 2, 3, 4].map((c) => <rect key={c} x={x - 160 + c * 72} y={500} width={24} height={200} fill="#fff" opacity={0.6} stroke={INK} strokeWidth={2} />)}
              <rect x={x - 210} y={700} width={420} height={24} fill={dome} stroke={INK} strokeWidth={4} />
              <Kettle x={x} y={860} scale={1.0} />
              {frame >= k.stamp && (
                <g transform={`translate(${x + 60 * peel} ${800 - 140 * peel}) rotate(${-40 * peel}) scale(${(1.6 - 0.6 * stamp) * (1 - 0.3 * peel)})`} opacity={1 - peel}>
                  <path d="M-46 -46 L46 46 M-46 46 L46 -46" stroke={CRIMSON} strokeWidth={18} strokeLinecap="round" />
                </g>
              )}
            </g>
          );
        })}
      </>
    } />
  );
};

