// Helpers for "The Key" and "The Train": the hands insert, drawn close. Your mustard hand comes in from the left,
// his peach hand from the right; a hand is a palm, a thumb and four fingers that curl (0 open, 1 closed), palm up or
// palm down; the brass key lies between them. Screen pixels at REF: the insert's camera only drifts and pushes.
import { INK } from "@whatif/kit/theme";
import { FRIEND, HERO } from "../shared";
import { BrassKey } from "./TheKey.Frame";

const SLEEVE = "#3b3e47";

/** One hand at (x, y): `dir` 1 points the fingers right; `down` turns it palm down (the back of the hand up). */
export const Hand: React.FC<{ x: number; y: number; color: string; dir: 1 | -1; down?: boolean; curl: number; s?: number }> = ({
  x, y, color, dir, down = false, curl, s = 1,
}) => {
  const len = 118 * (1 - curl * 0.45);
  return (
    <g transform={`translate(${x} ${y}) scale(${dir * s} ${(down ? -1 : 1) * s})`}>
      {[-38, -13, 12, 36].map((fy, i) => (
        <g key={fy} transform={`translate(62 ${fy}) rotate(${-curl * (78 + i * 6)})`}>
          <rect x={-6} y={-13} width={len - i * 10 + 6} height={26} rx={13} fill={color} stroke={INK} strokeWidth={6} />
        </g>
      ))}
      <ellipse cx={0} cy={0} rx={96} ry={62} fill={color} stroke={INK} strokeWidth={7} />
      <g transform={`translate(18 -46) rotate(${-38 - curl * 30})`}>
        <rect x={-6} y={-15} width={86} height={30} rx={15} fill={color} stroke={INK} strokeWidth={6} />
      </g>
      <path d="M-40 18 Q0 34 46 14" fill="none" stroke={INK} strokeWidth={4} opacity={down ? 0 : 0.35} strokeLinecap="round" />
    </g>
  );
};

/** A forearm from off screen to a wrist at (x, y), coming from the left (`from` -1) or the right (1). */
const Arm: React.FC<{ x: number; y: number; from: 1 | -1; drop?: number }> = ({ x, y, from, drop = 260 }) => (
  <path d={`M${x + from * 1400} ${y + drop} L${x} ${y}`} stroke={SLEEVE} strokeWidth={118} strokeLinecap="round" fill="none" />
);

export interface HandPlace { x: number; y: number; curl: number; down?: boolean }

/** The insert's picture (actors slot): your arm and hand, his arm and hand, the key. His hand is drawn over yours. */
export const Hands: React.FC<{ you: HandPlace; him: HandPlace | null; keyAt: { x: number; y: number; rotate?: number; scale?: number } | null;
  keyOver?: boolean; himDrop?: number }> = ({ you, him, keyAt: key, keyOver = false, himDrop = -120 }) => {
  const keyPic = key && <BrassKey x={key.x} y={key.y} rotate={key.rotate ?? -14} scale={key.scale ?? 1.5} glint={0.35} />;
  return (
    <g>
      <Arm x={you.x - 80} y={you.y + 10} from={-1} />
      <Hand x={you.x} y={you.y} color={HERO.head} dir={1} down={you.down} curl={you.curl} s={1.15} />
      {!keyOver && keyPic}
      {him && <Arm x={him.x + 80} y={him.y + 10} from={1} drop={himDrop} />}
      {him && <Hand x={him.x} y={him.y} color={FRIEND.head} dir={-1} down={him.down} curl={him.curl} s={1.15} />}
      {keyOver && keyPic}
    </g>
  );
};

/** The stall's counter top seen close: warm planks under the lamp. */
export const CounterClose: React.FC = () => (
  <g>
    <rect x={-1400} y={-900} width={4800} height={2800} fill="#14161f" />
    <rect x={-1400} y={560} width={4800} height={1400} fill="#8a5d3c" />
    {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-1400} y1={640 + i * 70} x2={3400} y2={620 + i * 74} stroke="#5a3b2a" strokeWidth={5} opacity={0.6} />)}
    <rect x={-1400} y={540} width={4800} height={30} fill="#5a3b2a" />
    <ellipse cx={900} cy={760} rx={900} ry={260} fill="#ffd98a" opacity={0.12} />
  </g>
);
