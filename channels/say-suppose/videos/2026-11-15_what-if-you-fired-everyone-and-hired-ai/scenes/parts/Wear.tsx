// What the kit's Figure cannot draw, drawn on top of it at the rig's own joints (no kit edit): hats, a pencil behind
// the ear, glasses, a painter's mask (head, turned with the pose's tilt); a sash, an apron bib, a toolbelt, a long coat
// (body, leaning with the pose); a microphone, a wrench or a hammer in the front hand. `Dressed` is a Figure plus its
// `wear`; spread a Person from Cast.ts into it.
import { Figure, type FigureProps } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, STAND } from "@whatif/kit/rig/pose";
import { useSoundOnly } from "@whatif/kit/sound";
import { CRIMSON, INK, MUSTARD } from "@whatif/kit/theme";
import type { WearItem } from "./Cast";
import { Hammer, Mic, Wrench } from "./Props";

const PaperHat: React.FC<{ tilt: number; color: string }> = ({ tilt, color }) => (
  <g transform={`rotate(${tilt} 0 -40)`}>
    <path d="M-42 -30 L46 -30 L38 -62 Q4 -80 -34 -62 Z" fill={color} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M-36 -40 L40 -40" stroke={INK} strokeWidth={3} opacity={0.5} />
    <path d="M2 -72 L2 -42" stroke={INK} strokeWidth={2.5} opacity={0.35} />
  </g>
);

const HardHat: React.FC<{ tilt: number; color: string }> = ({ tilt, color }) => (
  <g transform={`rotate(${tilt} 0 -40)`}>
    <path d="M-50 -24 Q-48 -86 2 -88 Q52 -86 52 -24 Z" fill={color} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M2 -88 V-26" stroke={INK} strokeWidth={4} opacity={0.4} />
    <rect x={-60} y={-28} width={124} height={12} rx={6} fill={color} stroke={INK} strokeWidth={4} />
  </g>
);

/** The head's wear, in the Figure's head coordinates (centre at the origin, face toward +x, radius 46). */
const HeadWear: React.FC<{ item: WearItem }> = ({ item }) => {
  switch (item.kind) {
    case "paperHat": return <PaperHat tilt={item.tilt ?? 0} color={item.color ?? "#fbfbf6"} />;
    case "hardHat": return <HardHat tilt={item.tilt ?? 0} color={item.color ?? "#f7d038"} />;
    case "pencil":
      return (
        <g>
          <line x1={-56} y1={-34} x2={-24} y2={24} stroke={INK} strokeWidth={11} strokeLinecap="round" />
          <line x1={-56} y1={-34} x2={-26} y2={20} stroke={item.color ?? MUSTARD} strokeWidth={7} strokeLinecap="round" />
          <circle cx={-56} cy={-34} r={5} fill="#e88a9a" stroke={INK} strokeWidth={2} />
        </g>
      );
    case "glasses":
      return (
        <g fill="#fff" fillOpacity={0.12} stroke={item.color ?? INK} strokeWidth={4}>
          <circle cx={-5} cy={-5} r={15} />
          <circle cx={22} cy={-5} r={15} />
          <path d="M10 -7 Q13.5 -11 7 -7" fill="none" />
          <path d="M-20 -7 L-42 -12" fill="none" />
        </g>
      );
    case "mask":
      return (
        <g>
          <path d="M-18 16 L-44 2" stroke={INK} strokeWidth={4} />
          <ellipse cx={10} cy={22} rx={28} ry={18} fill={item.color ?? "#f3f1ea"} stroke={INK} strokeWidth={4} />
          <circle cx={14} cy={24} r={8} fill="#9aa1ab" stroke={INK} strokeWidth={3} />
        </g>
      );
    default: return null;
  }
};

const HEAD_KINDS = new Set(["paperHat", "hardHat", "pencil", "glasses", "mask"]);
const HAND_KINDS = new Set(["mic", "wrench", "hammer"]);

/** A kit Figure with its `wear` drawn on. Same props as Figure. Only `rotate` 0 places wear exactly (a rotated
 *  figure's wear turns with it about the same point, so it still sits right). */
export const Dressed: React.FC<FigureProps & { wear?: WearItem[] }> = ({ wear = [], ...fig }) => {
  if (useSoundOnly()) return null;
  const pose = fig.pose ?? STAND;
  const scale = fig.scale ?? 1;
  const facing = fig.facing ?? 1;
  const j = joints(pose, fig.torso);
  const a = dir(pose.armF[0]), b = dir(pose.armF[0] + pose.armF[1]);
  const hand = { x: j.shoulder.x + (a.x + b.x) * LIMB, y: j.shoulder.y + (a.y + b.y) * LIMB };
  const { neck, hip } = j;
  const body = wear.filter((w) => !HEAD_KINDS.has(w.kind) && !HAND_KINDS.has(w.kind));
  const head = wear.filter((w) => HEAD_KINDS.has(w.kind));
  const hands = wear.filter((w) => HAND_KINDS.has(w.kind));
  return (
    <g>
      <Figure {...fig} />
      {wear.length > 0 && (
        <g transform={`translate(${fig.x} ${fig.y}) rotate(${fig.rotate ?? 0} 0 ${j.hip.y * scale}) scale(${scale * facing} ${scale})`}>
          {body.map((w, i) => {
            switch (w.kind) {
              case "longCoat":
                return (
                  <g key={i}>
                    <path d={`M${hip.x - 34} ${hip.y + 50} L${hip.x + 34} ${hip.y + 50} L${hip.x + 44} ${hip.y + 132} L${hip.x - 40} ${hip.y + 132} Z`}
                      fill={w.color ?? "#3f3346"} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
                    <line x1={hip.x + 4} y1={hip.y + 70} x2={hip.x + 6} y2={hip.y + 132} stroke={INK} strokeWidth={3} opacity={0.5} />
                  </g>
                );
              case "apron":
                return (
                  <g key={i}>
                    <path d={`M${neck.x - 13} ${neck.y + 14} L${neck.x + 15} ${neck.y + 14} L${hip.x + 30} ${hip.y + 58} L${hip.x - 28} ${hip.y + 58} Z`}
                      fill={w.color ?? "#f3e9d7"} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
                    <rect x={hip.x - 14} y={hip.y + 6} width={30} height={22} rx={3} fill="none" stroke={INK} strokeWidth={3} opacity={0.55} />
                  </g>
                );
              case "sash":
                return (
                  <g key={i}>
                    <line x1={neck.x + 14} y1={neck.y + 8} x2={hip.x - 22} y2={hip.y + 34} stroke={INK} strokeWidth={28} strokeLinecap="butt" />
                    <line x1={neck.x + 14} y1={neck.y + 8} x2={hip.x - 22} y2={hip.y + 34} stroke={w.color ?? CRIMSON} strokeWidth={21} strokeLinecap="butt" />
                    <line x1={neck.x + 14} y1={neck.y + 8} x2={hip.x - 22} y2={hip.y + 34} stroke={MUSTARD} strokeWidth={3} strokeDasharray="10 8" />
                    <circle cx={hip.x - 18} cy={hip.y + 30} r={11} fill={MUSTARD} stroke={INK} strokeWidth={3} />
                  </g>
                );
              case "toolbelt":
                return (
                  <g key={i}>
                    <rect x={hip.x - 38} y={hip.y + 2} width={78} height={16} rx={4} fill="#7a4a2a" stroke={INK} strokeWidth={4} />
                    <rect x={hip.x + 10} y={hip.y + 12} width={28} height={34} rx={4} fill="#9a6a3a" stroke={INK} strokeWidth={4} />
                    <rect x={hip.x - 34} y={hip.y + 12} width={24} height={30} rx={4} fill="#9a6a3a" stroke={INK} strokeWidth={4} />
                    <rect x={hip.x - 4} y={hip.y + 14} width={8} height={44} rx={3} fill="#a8743f" stroke={INK} strokeWidth={3} />
                    <rect x={hip.x - 14} y={hip.y + 52} width={28} height={12} rx={3} fill="#6b7280" stroke={INK} strokeWidth={3} />
                  </g>
                );
              case "badge":
                return <rect key={i} x={neck.x + 2} y={neck.y + 26} width={22} height={14} rx={3} fill={w.color ?? MUSTARD} stroke={INK} strokeWidth={3} />;
              default: return null;
            }
          })}
          {head.length > 0 && (
            <g transform={`translate(${j.head.x} ${j.head.y}) rotate(${pose.tilt})`}>
              {head.map((w, i) => <HeadWear key={i} item={w} />)}
            </g>
          )}
          {hands.map((w, i) => (
            <g key={i} transform={`translate(${hand.x} ${hand.y})`}>
              {w.kind === "mic" ? <Mic s={0.9} /> : w.kind === "wrench" ? <Wrench s={0.55} rot={-10} /> : <Hammer s={0.6} rot={-10} />}
            </g>
          ))}
        </g>
      )}
    </g>
  );
};
