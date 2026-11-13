// Night One's bunk-room pieces, drawn in KEY coordinates as <BunkRoom> children: your arm holding the band up before
// you put it on, your brother hanging off the top bunk with the jar (morning), and you on the pillow with your own face.
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import type { Expression } from "@whatif/kit/rig/expressions";
import { INK } from "@whatif/kit/theme";
import { Band, Blanket, Jar, Sleeper } from "../parts";
import { BUNK } from "../sets/BunkRoom";
import { BROTHER, HERO } from "../shared";
import { aim, handLocal, type Placed } from "./Chair.Rig";

/** Your arm out from under the blanket, the band held up over your face (unlit). */
export const BandHeldUp: React.FC<{ lift: number }> = ({ lift }) => {
  const hand = { x: 760 - lift * 30, y: 450 - lift * 40 };
  return (
    <g>
      <path d={`M860 720 Q850 560 ${hand.x} ${hand.y}`} fill="none" stroke={INK} strokeWidth={40} strokeLinecap="round" />
      <Band x={hand.x - 6} y={hand.y + 52} scale={1.5} lit={false} tilt={-6} />
      <circle cx={hand.x} cy={hand.y} r={28} fill={HERO.head} />
    </g>
  );
};

/** You on the pillow, your own face (the BunkRoom draws you with a fixed face), under the blanket. */
export const YouOnPillow: React.FC<{ eyes: "open" | "shut"; mouth: "smile" | "flat" | "o"; band: boolean }> = ({ eyes, mouth, band }) => {
  const Y = BUNK.you;
  return (
    <g>
      <Sleeper id="you-own" x={Y.x} y={Y.y} scale={Y.scale} tilt={Y.tilt} head={HERO.head} scarf={HERO.scarf} band={band} lit={0}
        eyes={eyes} mouth={mouth} />
      <Blanket x0={560} x1={1630} top={680} base={900} />
    </g>
  );
};

/** The hung brother's placement, upside down off the top bunk at `x` (as BunkRoom's own, but anywhere along it). In
 *  KEY pixels a figure-local point (lx, ly) lands at (x + 1.3 lx, top - 1.3 ly). */
const HANG_TOP = BUNK.topBunk.y - 30 + 150;
const WATCH_TOP = BUNK.topBunk.y - 30 + 40;
const S = 1.3;
const local = (x: number, w: { x: number; y: number }) => ({ x: (w.x - x) / S, y: -(w.y - HANG_TOP) / S });
const world = (x: number, l: { x: number; y: number }) => ({ x: x + S * l.x, y: HANG_TOP - S * l.y });

/** Your brother hanging down off the top bunk at `x`: the jar in one hand (shaken over your face), the other palm out. */
export const HangingBrother: React.FC<{ x: number; frame: number; shake: number; palm: number; face: Partial<Expression>;
  jarAt?: { x: number; y: number } }> = ({ x, frame, shake, palm, face, jarAt }) => {
  // In the figure's own (upright) frame: aim the arms with the mirrored targets. Hung upside down, his shoulders are
  // right above his head, so the hands go out to the sides at head height and never across his face.
  const body: Placed = { x: 0, y: 0, scale: 1, facing: 1, pose: { ...STAND, tilt: 6 } };
  const jarTarget = shake > 0
    ? { x: 600 + Math.sin(frame * 1.6) * 16 * shake, y: 548 + Math.cos(frame * 2.1) * 8 * shake }
    : jarAt ?? { x: 880, y: 545 };
  const palmTarget = { x: 600 + 10 * (1 - palm), y: 600 };
  const restTarget = { x: 870, y: 610 };
  const armF = aim(body, local(x, palm > 0 ? (jarAt ?? { x: 880, y: 545 }) : jarTarget));
  const armB = aim(body, local(x, palm > 0 ? palmTarget : restTarget));
  const pose: Pose = { ...STAND, tilt: 6, armB, armF };
  const jarHand = world(x, handLocal(pose, "armF"));
  return (
    <g>
      <g transform={`translate(${x} ${HANG_TOP}) rotate(180) translate(${-x} 0)`}>
        <Figure x={x} y={0} scale={S} facing={-1} pose={pose} head={BROTHER.head} coat={BROTHER.coat}
          eyes={1.1} {...face} blink={(frame + 31) % 97 < 4} />
      </g>
      <Jar x={jarHand.x} y={jarHand.y + 112} w={88} h={110} fill={0.32} />
    </g>
  );
};

/** Your brother on the top bunk at `x`, lying on his front over the edge, head and an arm down, watching ("watch"), or
 *  leaning further over ("lean"). BunkRoom's own brother sits behind the ghost's laptop in the key frame, so Night One
 *  draws him here, to the right of the desk. */
export const TopBrother: React.FC<{ x: number; frame: number; lean: number; face: Partial<Expression> }> = ({ x, frame, lean, face }) => {
  const top = WATCH_TOP + lean * 70;
  const pose: Pose = { ...STAND, tilt: 10 + lean * 8, armF: [62 + lean * 10, 20], armB: [-62, -10] };
  return (
    <g transform={`translate(${x} ${top}) rotate(180) translate(${-x} 0)`}>
      <Figure x={x} y={0} scale={S} facing={-1} pose={pose} head={BROTHER.head} coat={BROTHER.coat}
        eyes={1.1} {...face} blink={(frame + 31) % 97 < 4} />
    </g>
  );
};

