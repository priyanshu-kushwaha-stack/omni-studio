// Props for the last four beats (Choice, PaperBeat, Back): Dev with his headphones and his bag, the envelope, the
// strip torn from a flyer with DO YOU WANT TO STAY? written on its back, the meeting page with Dev's signature, and the
// pen from your scarf. World coordinates (or a hand's local ones, for Figure `held`); no sound here.
import { Figure, type FigureProps } from "@whatif/kit/rig/Figure";
import { STAND } from "@whatif/kit/rig/pose";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Headphones, headAt } from "../parts";
import { shoulderAt } from "../parts2";
import { DEV, linear, noise, PASTELS } from "../shared";
import { TANGLE } from "./StageBeat.Hall";

/** The corridor's blocking (Hall view "corridor"): everyone at scale S on the floor line. You stand by the chair
 *  with the flyer stack; Dev stops in front of you, walks to the door, and comes back to read. */
export const CORRIDOR = { floor: 960, s: 1.15, you: 620, devStop: 860, door: 1500, read: 830 } as const;

/** Dev: pale green head, slate coat, headphones round his neck. `bag` 0..1 swings his satchel up onto the shoulder
 *  (0 = none). Every other prop is a Figure prop. */
export const Dev: React.FC<Omit<FigureProps, "head"> & { bag?: number }> = ({ bag = 0, ...p }) => {
  const body = { x: p.x, y: p.y, scale: p.scale ?? 1, pose: p.pose ?? STAND, facing: p.facing ?? 1 };
  const sh = shoulderAt(body);
  const s = body.scale, f = body.facing;
  const hip = { x: body.x - f * 30 * s, y: body.y - 96 * s };
  // The satchel: lifted from the floor by the strap, then hung at the back hip with the strap across the chest.
  const lift = Math.min(1, bag * 1.6);
  const bx = hip.x - f * 14 * s, by = hip.y + (1 - lift) * 70 * s;
  return (
    <>
      {bag > 0 && (
        <g>
          <path d={`M${sh.x + f * 16 * s} ${sh.y - 4 * s} L${bx} ${by - 26 * s}`} stroke="#3a2a22" strokeWidth={7 * s} strokeLinecap="round" />
          <rect x={bx - 34 * s} y={by - 30 * s} width={68 * s} height={54 * s} rx={10 * s} fill="#8a5a3a" stroke={INK} strokeWidth={4 * s} />
          <rect x={bx - 34 * s} y={by - 30 * s} width={68 * s} height={20 * s} rx={8 * s} fill="#6b4430" stroke={INK} strokeWidth={4 * s} />
        </g>
      )}
      <Figure head={DEV.head} coat={DEV.coat} {...p} />
      <Headphones x={body.x} y={body.y} scale={s} pose={body.pose} facing={f} />
    </>
  );
};

/** The envelope with the rest of the money, centred, in local units (about 90 x 56). */
export const Envelope: React.FC<{ x?: number; y?: number; scale?: number; tilt?: number }> = ({ x = 0, y = 0, scale = 1, tilt = -6 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <rect x={-45} y={-28} width={90} height={56} rx={4} fill="#e6cf9a" stroke={INK} strokeWidth={4} />
    <path d="M-45 -28 L0 6 L45 -28" fill="none" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
  </g>
);

/** The strip's size in its own units. */
export const STRIP = { w: 440, h: 92 } as const;
export const STRIP_TEXT = "DO YOU WANT TO STAY?";

/** The strip torn from a flyer, centred, in local units (STRIP). `side` "back" is the cream back with your words,
 *  revealed left to right by `written` 0..1; "front" is the flyer's print (mustard, a crimson ring, rows of tiny
 *  heads). The left edge is torn. `id` keeps its clip apart from other strips on screen. */
export const Strip: React.FC<{ x?: number; y?: number; scale?: number; tilt?: number; side?: "back" | "front"; written?: number; id: string }> = ({
  x = 0, y = 0, scale = 1, tilt = 0, side = "back", written = 1, id,
}) => {
  const { w, h } = STRIP;
  const teeth = Array.from({ length: 9 }, (_, i) => `L${-w / 2 + (i % 2 ? 9 : 0) + noise(i + 3) * 5} ${h / 2 - (i * h) / 8}`).join(" ");
  const outline = `M${-w / 2} ${-h / 2} H${w / 2} V${h / 2} H${-w / 2} ${teeth} Z`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
      <path d={outline} transform="translate(6 8)" fill="#000" opacity={0.22} />
      <path d={outline} fill={side === "back" ? PAPER : MUSTARD} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {side === "back" ? (
        <>
          <clipPath id={`strip-${id}`}><rect x={-w / 2} y={-h / 2} width={w * Math.max(0, Math.min(1, written))} height={h} /></clipPath>
          <text x={0} y={13} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={INK} letterSpacing={1}
            clipPath={`url(#strip-${id})`}>{STRIP_TEXT}</text>
        </>
      ) : (
        <g>
          <circle cx={w / 2 - 54} cy={0} r={28} fill="none" stroke={CRIMSON} strokeWidth={7} />
          {Array.from({ length: 3 }, (_, r) => Array.from({ length: 11 }, (_, c) => (
            <circle key={`${r}-${c}`} cx={-w / 2 + 40 + c * 26 + (r % 2) * 13} cy={-24 + r * 24} r={8} fill={PASTELS[(r * 11 + c) % PASTELS.length]} />
          )))}
        </g>
      )}
    </g>
  );
};

/** The pen from your scarf, in local units (pointing down-left; the tip at 0,0). */
export const Pen: React.FC<{ x?: number; y?: number; scale?: number; tilt?: number }> = ({ x = 0, y = 0, scale = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
    <path d="M0 0 L10 -16 L82 -88 L92 -78 L20 -6 Z" fill={TEAL} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M0 0 L10 -16 L20 -6 Z" fill={INK} />
  </g>
);

/** The meeting page (the insert in The choice), drawn in its own units (MEETING_PAGE): the tangled shape sketched at
 *  the top, folding flat over [foldFrom, foldTo]; ink bars of the minutes; eight signatures, Dev's first, and a
 *  crimson line drawing itself through his name over [strikeFrom, strikeTo]. */
export const MEETING_PAGE = { w: 900, h: 1100 } as const;
const DEV_SIGNATURE = "M150 820 C180 760 210 860 240 800 C260 760 280 840 310 790 C330 760 350 830 380 800 C400 780 420 810 440 795";

export const MeetingPage: React.FC<{ frame: number; foldFrom: number; foldTo: number; strikeFrom: number; strikeTo: number }> = ({
  frame, foldFrom, foldTo, strikeFrom, strikeTo,
}) => {
  const fold = linear(frame, foldFrom, foldTo);
  return (
    <g>
      <g transform={`translate(450 230) scale(0.9 ${Math.max(0.03, 1 - fold * 0.97)})`}>
        <path d={TANGLE} fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={110} y={450 + i * 40} width={420 + noise(i + 11) * 260} height={14} rx={7} fill={INK} opacity={0.45} />
      ))}
      {/* the signatures: Dev's first, the others small ink loops */}
      <path d={DEV_SIGNATURE} fill="none" stroke="#1d4f8f" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={140} y={850} width={320} height={6} rx={3} fill={INK} opacity={0.5} />
      {Array.from({ length: 7 }, (_, i) => {
        const cx = 520 + (i % 2) * 190, cy = 780 + Math.floor(i / 2) * 70;
        return <path key={i} d={`M${cx} ${cy} c20 -30 40 20 60 -10 c14 -20 30 10 46 -6`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0.75} />;
      })}
      <DrawLine d="M120 815 L470 790" from={strikeFrom} to={strikeTo} color={CRIMSON} width={14} />
    </g>
  );
};

/** Dev's face while he speaks a line: the mouth opens and closes on a slow beat (no lip-sync, just talk). */
export const talking = (frame: number, from: number, to: number) => frame >= from && frame < to && Math.floor((frame - from) / 5) % 3 !== 2;

/** Where your head is for a standing figure (re-exported for the corridor's close-ups). */
export const headOf = (x: number, y: number, scale: number, facing: 1 | -1 = 1) => headAt(x, y, scale, STAND, facing);
