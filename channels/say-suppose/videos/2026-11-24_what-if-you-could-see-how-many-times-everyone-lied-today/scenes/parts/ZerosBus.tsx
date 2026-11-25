// The bus in look C (Zeros): the painted plate `bus-interior`, looking down the aisle between rows of blue seats to the
// far window. Riders are heads over the painted seat backs (each figure drawn only above its seat's top edge), nearly
// all with a dim 0, a few 1s; at the back on the right, the mint man in headphones on the phone, 9, then 10; his feet
// go up, he leans back with a hand behind his head. A red light shows through the far window once the bus has stopped. You, holding the
// pole by the side window, for your reaction. Plate world units. No AI images.
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, STAND } from "@whatif/kit/rig/pose";
import { HandPhone } from "@whatif/kit/sets/props";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK } from "@whatif/kit/theme";
import { HERO, PASTELS } from "../shared";
import { Counter } from "./Counter";
import { Above, ActorLayer, byHead, counterLight, dof } from "./FrameLook";
import { BUS_MAN, headWorld, Lanyard, Person, talk, type Placed } from "./FrameKit";
import { PlateScene } from "./Plate";

/** Seats with a rider: the head's x, the seat back's top edge, the rider's scale; far rows first. */
const SLOTS: [number, number, number][] = [
  [620, 575, 0.85], [585, 580, 1.05], [525, 590, 1.3], [450, 608, 1.7], [1360, 595, 1.25], [1480, 610, 1.6], [1260, 585, 1.0],
  [275, 638, 2.3], [-60, 650, 2.4], [1690, 640, 2.1], [1990, 655, 2.4],
];
const ONES = [2, 5, 9];
/** Standing riders in the aisle: feet, scale. */
const STANDING: [number, number, number][] = [[960, 860, 1.15], [720, 905, 1.5]];
/** The man at the back on the right, and the top of the seat in front of him. */
export const MAN = { x: 1182, top: 575, scale: 0.85, front: 583 } as const;
export const MAN_HEAD = { x: MAN.x, y: MAN.top - 36 * MAN.scale };
/** You by the right-hand window, holding the pole (only in your close-up). */
export const YOU_BUS = { x: 1880, y: 330 } as const;
const YOU_SCALE = 2.6;

const rider = (x: number, top: number, s: number, i: number): Placed =>
  byHead({ scale: s, facing: i % 3 ? -1 : 1, pose: SEATED }, { x, y: top - 36 * s });

export const BusScene: React.FC<{ frame: number; cam: Camera; r: number; count: { base: number; ticks: number[] }; man: { talk: [number, number]; feet: number };
  stopped: boolean; you?: { brows: "raised" | "flat"; mouth: "o" | "flat" } }> = ({ frame, cam, r, count, man, stopped, you }) => {
  const m = byHead({ scale: MAN.scale, facing: -1, pose: SEATED }, MAN_HEAD);
  const mh = headWorld(m);
  const cy = mh.y - mh.r - 22;
  const feet = man.feet;
  return (
    <>
      <PlateScene plate="bus-interior" cam={cam} mood="day" blur={dof(cam, r)} rimFrom="right" lights={[counterLight({ x: mh.x, y: cy }, 0.4, 90)]}
        actors={
          <>
            {stopped && (
              <g>
                <rect x={1004} y={430} width={8} height={90} fill={INK} opacity={0.7} />
                <rect x={994} y={400} width={28} height={58} rx={6} fill={INK} opacity={0.8} />
                <circle cx={1008} cy={414} r={8} fill={CRIMSON} />
                <circle cx={1008} cy={414} r={18 + Math.sin(frame * 0.5) * 3} fill={CRIMSON} opacity={0.3} />
              </g>
            )}
            <Above id="bus-man" y={MAN.top}>
              <Figure x={m.x} y={m.y} scale={m.scale} facing={-1} pose={{ ...SEATED, armF: [140, 40], lean: -10 * feet, tilt: -6 * feet, armB: [10 + 150 * feet, 30] }} head={BUS_MAN.head} coat={BUS_MAN.coat} time={frame}
                mouth={talk(frame, man.talk[0], man.talk[1], feet > 0 ? "smile" : "flat")} lids={0.3} look={{ x: 0.4, y: -0.2 }} held={<HandPhone />} />
            </Above>
            <path d={`M${mh.x - mh.r * 1.08} ${mh.y} Q${mh.x} ${mh.y - mh.r * 1.75} ${mh.x + mh.r * 1.08} ${mh.y}`} fill="none" stroke={INK} strokeWidth={mh.r * 0.2} />
            {[-1, 1].map((d) => <rect key={d} x={mh.x + d * mh.r * 1.08 - mh.r * 0.26} y={mh.y - mh.r * 0.35} width={mh.r * 0.52} height={mh.r * 0.74} rx={mh.r * 0.18} fill="#d8344f" stroke={INK} strokeWidth={mh.r * 0.08} />)}
            <Counter x={mh.x} y={cy} base={count.base} ticks={count.ticks} frame={frame} size={22} id="bus-man" />
            {SLOTS.map(([x, top, s], i) => (
              <Above key={i} id={`rider${i}`} y={top}>
                <Person f={rider(x, top, s, i)} who={{ head: PASTELS[(i * 5) % PASTELS.length], coat: "#4a5568", mouth: "flat", look: { x: 0.6, y: 0.2 }, blink: (frame + i * 13) % 91 < 4 }}
                  frame={frame} id={`rider${i}`} count={{ base: ONES.includes(i) ? 1 : 0, size: Math.min(34, 15 * s), dim: !ONES.includes(i) }} />
              </Above>
            ))}
            {STANDING.map(([x, y, s], i) => (
              <Person key={i} f={{ x, y, scale: s, facing: i ? 1 : -1, pose: { ...STAND, armB: [-170, 10] } }} who={{ head: PASTELS[(i * 3 + 2) % PASTELS.length], coat: "#5a6488", mouth: "flat", look: { x: 0.5, y: 0.2 } }}
                frame={frame} id={`stand${i}`} count={{ base: 0, size: 16 * s, dim: true }} />
            ))}
          </>
        } />
      {you && (
        <ActorLayer cam={cam} mood="day" rimFrom="right">
          <YouOnBus frame={frame} you={you} />
        </ActorLayer>
      )}
    </>
  );
};

const YouOnBus: React.FC<{ frame: number; you: { brows: "raised" | "flat"; mouth: "o" | "flat" } }> = ({ frame, you }) => {
  const f = byHead({ scale: YOU_SCALE, facing: -1, pose: { ...STAND, armB: [-165, 10] } }, YOU_BUS);
  return (
    <g>
      <Figure x={f.x} y={f.y} scale={f.scale} facing={-1} pose={f.pose} head={HERO.head} scarf={HERO.scarf} tuft time={frame} brows={you.brows} mouth={you.mouth}
        eyes={you.brows === "raised" ? 1.2 : 1} look={{ x: 1, y: 0.1 }} />
      <Lanyard f={f} />
    </g>
  );
};

export const YOU_BUS_R = 46 * YOU_SCALE;
