// Two subscribe nudges, no voice. S1: a small paper tag hangs in at a resting moment, top-left, and peels away.
// S2: an ad for the channel on a bus shelter in the bus-stop scene, drawn like the rest of that world.
import { AbsoluteFill, spring, useCurrentFrame } from "remotion";
import { CRIMSON, easeIn, INK, JOST, Mark, mix, MUSTARD, PAPER, ramp, RUBIK } from "./brand";

export const S1_FRAMES = 120;

const TW = 640;

/** The paper tag: a luggage-tag shape with a punched hole and a string up out of frame. */
export const PaperTag: React.FC = () => (
  <div style={{ position: "relative", width: TW, height: 84 }}>
    <svg width={TW} height={84} style={{ position: "absolute", overflow: "visible" }}>
      <defs>
        <filter id="tag-cut" x="-10%" y="-30%" width="120%" height="170%">
          <feDropShadow dx="0" dy="6" stdDeviation="3" floodColor="#05031f" floodOpacity="0.45" />
        </filter>
      </defs>
      <path d="M-4 -400 C 4 -200, 10 -60, 22 42" stroke="#d9c9a6" strokeWidth={2.5} fill="none" opacity={0.85} />
      <path filter="url(#tag-cut)" d={`M24 0 H${TW - 14} a14 14 0 0 1 14 14 V70 a14 14 0 0 1 -14 14 H24 L0 60 V24 Z`} fill={PAPER} />
      <path d={`M24 0 H${TW - 14} a14 14 0 0 1 14 14 V18 H0 V24 Z`} fill="#fff6e6" opacity={0.55} />
      <circle cx={22} cy={42} r={7} fill="#3a3f7a" />
      <circle cx={22} cy={42} r={7} fill="none" stroke="#c9b48e" strokeWidth={2.5} />
    </svg>
    <div style={{ position: "absolute", left: 40, top: 0, height: 84, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 60, height: 60, borderRadius: 30, background: "#0c0a4a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Mark size={84} id="s1-mark" halo={0} />
      </div>
      <div style={{ fontFamily: RUBIK, fontWeight: 800, fontSize: 30, color: CRIMSON, letterSpacing: 0.3, whiteSpace: "nowrap" }}>Subscribe</div>
      <div style={{ fontFamily: JOST, fontWeight: 500, fontSize: 28, color: INK, opacity: 0.85, whiteSpace: "nowrap" }}>· a new what-if every day</div>
    </div>
  </div>
);

/** S1, an overlay: slides down on its string at its own frame 0, hangs about 3 s, peels up and away by S1_FRAMES. */
export const SubscribeTag: React.FC = () => {
  const f = useCurrentFrame();
  const drop = spring({ frame: f - 6, fps: 30, config: { damping: 9, stiffness: 120, mass: 0.8 } });
  const peel = easeIn(ramp(f, 100, 116));
  const sway = Math.sin(f * 0.09) * 1.4 * (1 - peel);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 96, top: 86, transformOrigin: "22px -300px",
        transform: `translateY(${mix(-220, 0, drop) - peel * 240}px) rotate(${-2.5 + sway - peel * 12}deg) scale(0.86)`, opacity: 1 - peel * 0.4,
        filter: "brightness(0.9) saturate(0.92)" }}>
        <PaperTag />
      </div>
    </AbsoluteFill>
  );
};

/** The poster on the shelter, drawn as print in the paper style. */
export const Poster: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <div style={{ position: "relative", width: w, height: h, background: "#0c0a4a", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 34%, #26229a 0%, #0c0a4a 80%)" }} />
    {[[24, 30, 7], [176, 46, 9], [40, 150, 5], [184, 196, 6], [150, 18, 4]].map(([x, y, s], i) => (
      <svg key={i} width={s * 2} height={s * 2} style={{ position: "absolute", left: x - s, top: y - s }}>
        <path transform={`translate(${s} ${s})`} d={`M0 ${-s} Q${s * 0.16} ${-s * 0.16} ${s} 0 Q${s * 0.16} ${s * 0.16} 0 ${s} Q${-s * 0.16} ${s * 0.16} ${-s} 0 Q${-s * 0.16} ${-s * 0.16} 0 ${-s}Z`} fill="#ffcf5a" />
      </svg>
    ))}
    <div style={{ position: "absolute", left: 0, width: w, top: 22, display: "flex", justifyContent: "center" }}>
      <Mark size={w * 0.82} id="s2-mark" halo={0.6} />
    </div>
    <div style={{ position: "absolute", left: 0, width: w, top: h * 0.6, textAlign: "center", fontFamily: JOST, fontWeight: 600, fontSize: w * 0.132,
      color: MUSTARD, lineHeight: 1 }}>Say Suppose</div>
    <div style={{ position: "absolute", left: 0, width: w, top: h * 0.6 + w * 0.19, textAlign: "center", fontFamily: JOST, fontWeight: 500, fontSize: w * 0.073,
      color: PAPER, lineHeight: 1.15 }}>a new what-if<br />every day</div>
    <div style={{ position: "absolute", left: w * 0.2, width: w * 0.6, top: h - w * 0.2, height: w * 0.12, borderRadius: w * 0.06, background: CRIMSON,
      color: PAPER, fontFamily: RUBIK, fontWeight: 800, fontSize: w * 0.066, display: "flex", alignItems: "center", justifyContent: "center", letterSpacing: 1 }}>
      SUBSCRIBE
    </div>
  </div>
);

/** S2: a bus shelter carrying the channel's ad, drawn in screen pixels as it was mocked over the v7 bus-stop frame.
 *  Scenes draw their own shelter in world units and reuse Poster; this is the reference drawing. */
export const SubscribeShelter: React.FC = () => {
  const X0 = 548; const X1 = 968; const ROOF = 556; const BASE = 938;
  const AD = { x: 586, y: 606, w: 214, h: 300 };
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: "sepia(0.12) saturate(0.9) contrast(0.95)" }}>
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <defs>
            <filter id="sh-cut" x="-10%" y="-10%" width="120%" height="125%">
              <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#2a1c10" floodOpacity="0.3" />
            </filter>
            <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#e9f3ee" stopOpacity="0.42" />
              <stop offset="1" stopColor="#bcd3cf" stopOpacity="0.22" />
            </linearGradient>
          </defs>
          <ellipse cx={(X0 + X1) / 2} cy={BASE + 6} rx={(X1 - X0) / 2 + 30} ry={16} fill="#3a2414" opacity={0.28} />
          <g filter="url(#sh-cut)">
            {/* glass back panel */}
            <rect x={808} y={ROOF + 30} width={140} height={BASE - ROOF - 92} fill="url(#glass)" />
            <path d={`M818 ${ROOF + 46} L846 ${ROOF + 46} L824 ${ROOF + 120} Z`} fill="#ffffff" opacity={0.28} />
            {/* bench */}
            <rect x={816} y={826} width={126} height={16} rx={4} fill="#b5683a" />
            <rect x={828} y={842} width={8} height={BASE - 842} fill={INK} />
            <rect x={922} y={842} width={8} height={BASE - 842} fill={INK} />
            {/* posts */}
            <rect x={X0 + 18} y={ROOF + 8} width={12} height={BASE - ROOF - 8} rx={3} fill={INK} />
            <rect x={X1 - 30} y={ROOF + 8} width={12} height={BASE - ROOF - 8} rx={3} fill={INK} />
            <rect x={798} y={ROOF + 8} width={10} height={BASE - ROOF - 8} rx={3} fill={INK} />
            {/* ad lightbox frame */}
            <rect x={AD.x - 12} y={AD.y - 12} width={AD.w + 24} height={AD.h + 24} rx={8} fill={INK} />
            {/* roof */}
            <rect x={X0} y={ROOF} width={X1 - X0} height={26} rx={8} fill="#1d9a8f" />
            <rect x={X0} y={ROOF + 18} width={X1 - X0} height={10} rx={4} fill="#137a71" />
            <rect x={X0 + 14} y={ROOF + 4} width={X1 - X0 - 28} height={5} rx={2.5} fill="#5cc4b9" opacity={0.7} />
          </g>
        </svg>
        <div style={{ position: "absolute", left: AD.x, top: AD.y, boxShadow: "0 0 26px rgba(255,214,140,.35)" }}>
          <Poster w={AD.w} h={AD.h} />
          {/* lightbox sheen */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(125deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,0) 38%)" }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
