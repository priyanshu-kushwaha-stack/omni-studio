import { Audio, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { CRIMSON, easeOut, INDIGO, INK, JOST, Mark, MUSTARD, PAPER, ramp, RUBIK } from "../../../../brand/brand";

/** End-card asks: three paper luggage tags (the brand's PaperTag look) that stamp in on their strings one after
 *  another, top-left, clear of your face and of the right third where YouTube's end screens go. Screen pixels. */

const H = 72;

const ThumbsUp = () => (
  <svg width={46} height={46} viewBox="0 0 46 46">
    <rect x={4} y={20} width={9} height={20} rx={2} fill={CRIMSON} stroke={INK} strokeWidth={2.5} />
    <path d="M13 22 L20 21 L23 7 Q25 3 29 5 Q31 7 30 12 L28 20 H38 Q42 20 41 25 L38 37 Q37 40 33 40 H13 Z"
      fill={MUSTARD} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
    <path d="M28 27 H39 M27 33 H37" stroke={INK} strokeWidth={2} strokeLinecap="round" opacity={0.55} />
  </svg>
);

const Speech = () => (
  <svg width={48} height={44} viewBox="0 0 48 44">
    <path d="M8 4 H40 Q45 4 45 9 V27 Q45 32 40 32 H22 L12 41 L14 32 H8 Q3 32 3 27 V9 Q3 4 8 4 Z" fill={INDIGO} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
    {[14, 24, 34].map((x) => <circle key={x} cx={x} cy={18} r={3.4} fill={MUSTARD} />)}
  </svg>
);

const Ring = () => (
  <div style={{ width: 52, height: 52, borderRadius: 26, background: INDIGO, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Mark size={72} id="end-tag-mark" halo={0} />
  </div>
);

/** One tag: the luggage-tag shape with a punched hole and a string running up out of frame. */
const Tag: React.FC<{ at: number; x: number; y: number; w: number; tilt: number; children: React.ReactNode }> = ({ at, x, y, w, tilt, children }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const drop = spring({ frame: f - at, fps: 30, config: { damping: 10, stiffness: 150, mass: 0.7 } });
  const sway = Math.sin((f - at) * 0.08 + x) * 1.1 * easeOut(ramp(f, at + 10, at + 30));
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: H, transformOrigin: `20px ${H / 2}px`,
      transform: `rotate(${tilt + sway + (1 - drop) * 8}deg) scale(${1.45 * drop})`, filter: "brightness(0.93) saturate(0.95)" }}>
      <svg width={w} height={H} style={{ position: "absolute", overflow: "visible" }}>
        <defs>
          <filter id={`end-tag-cut-${x}`} x="-10%" y="-30%" width="120%" height="170%">
            <feDropShadow dx="0" dy="5" stdDeviation="3" floodColor="#05031f" floodOpacity="0.45" />
          </filter>
        </defs>
        <path d={`M20 ${-y - 40} C 24 ${-y / 2}, 22 -20, 20 ${H / 2}`} stroke="#d9c9a6" strokeWidth={2.5} fill="none" opacity={0.85} />
        <path filter={`url(#end-tag-cut-${x})`} d={`M22 0 H${w - 12} a12 12 0 0 1 12 12 V${H - 12} a12 12 0 0 1 -12 12 H22 L0 ${H - 20} V20 Z`} fill={PAPER} />
        <path d={`M22 0 H${w - 12} a12 12 0 0 1 12 12 V16 H0 V20 Z`} fill="#fff6e6" opacity={0.55} />
        <circle cx={20} cy={H / 2} r={6} fill="#3a3f7a" />
        <circle cx={20} cy={H / 2} r={6} fill="none" stroke="#c9b48e" strokeWidth={2.5} />
      </svg>
      <div style={{ position: "absolute", left: 38, top: 0, height: H, display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}>
        {children}
      </div>
    </div>
  );
};

const Word: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <div style={{ fontFamily: RUBIK, fontWeight: 800, fontSize: 30, color, letterSpacing: 0.3 }}>{children}</div>
);

/** `comment` is the frame "Tell us below" is spoken; the other two land 0.6 s and 1.2 s before it. */
export const EndTags: React.FC<{ comment: number }> = ({ comment }) => {
  const like = comment - 36;
  const sub = comment - 18;
  return (
    <>
      {[like, sub, comment].map((at) => (
        <Sequence key={at} from={at} durationInFrames={6} layout="none">
          <Audio src={staticFile("sfx/pop.wav")} volume={0.08} />
        </Sequence>
      ))}
      <Tag at={like} x={84} y={36} w={240} tilt={-2.5}>
        <ThumbsUp /><Word color={INDIGO}>Like it?</Word>
      </Tag>
      <Tag at={sub} x={130} y={146} w={268} tilt={1.5}>
        <Ring /><Word color={CRIMSON}>Subscribe</Word>
      </Tag>
      <Tag at={comment} x={84} y={256} w={500} tilt={-1.5}>
        <Speech /><Word color={INDIGO}>Comment</Word>
        <div style={{ fontFamily: JOST, fontWeight: 500, fontSize: 28, color: INK, opacity: 0.85 }}>your ten seconds</div>
      </Tag>
    </>
  );
};
