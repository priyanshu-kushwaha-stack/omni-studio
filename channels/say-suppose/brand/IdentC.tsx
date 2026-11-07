// Option C: the title card, fern-like, in paper. The frozen hook frame shrinks into a paper print on the indigo sky,
// the ringed-Earth mark and name sit above it, the episode's question sits under it in Rubik; then the card flips
// over, its back is the bedroom, and it grows to fill the screen.
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { easeInOut, Grain, JOST, Mark, mix, MUSTARD, PAPER, ramp, RUBIK, Sky, PadBed } from "./brand";

export const C_FRAMES = 120;

/** Mustard emphasis inside a title line. */
export const Hi: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: MUSTARD }}>{children}</span>;
const CARD = { x: 480, y: 214, w: 960, h: 470 };
const FULL = { x: 0, y: 0, w: 1920, h: 1080 };

const lerpRect = (a: typeof CARD, b: typeof CARD, t: number) => ({
  x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), w: mix(a.w, b.w, t), h: mix(a.h, b.h, t),
});

/** A face of the card: a full 1920x1080 scene scaled to fill the card's width, centre-cropped to its height. */
const Face: React.FC<{ w: number; h: number; mat: number; radius: number; back?: boolean; children: React.ReactNode }> = ({ w, h, mat, radius, back, children }) => {
  const iw = w - mat * 2;
  const ih = h - mat * 2;
  const s = iw / 1920;
  return (
    <div style={{ position: "absolute", inset: 0, background: PAPER, borderRadius: radius, backfaceVisibility: "hidden",
      transform: back ? "rotateY(180deg)" : undefined, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: mat, top: mat, width: iw, height: ih, overflow: "hidden", borderRadius: Math.max(0, radius - mat * 0.6) }}>
        <div style={{ position: "absolute", left: 0, top: (ih - 1080 * s) / 2, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: "0 0" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

/** front: the scene the card is made from (the hook's frozen frame). back: the scene it opens onto. title: the
 *  episode's question, as two lines; wrap the key words in <Hi>. Starts at its own frame 0, lasts C_FRAMES. */
export const IdentC: React.FC<{ front: React.ReactNode; back: React.ReactNode; title: [React.ReactNode, React.ReactNode] }> = ({ front, back: backScene, title }) => {
  const f = useCurrentFrame();
  const shrink = spring({ frame: f, fps: 30, config: { damping: 17, stiffness: 110, mass: 0.9 } });
  const flip = easeInOut(ramp(f, 80, 96));
  const grow = easeInOut(ramp(f, 96, 115));
  const rect = f < 96 ? lerpRect(FULL, CARD, shrink) : lerpRect(CARD, FULL, grow);
  const settled = f < 96 ? shrink : 1 - grow;
  const mat = 14 * settled;
  const radius = 22 * settled;
  const tilt = f < 96 ? mix(0, -1.6, shrink) : mix(-1.6, 0, grow);
  const sky = ramp(f, 0, 12);
  const brand = spring({ frame: f - 14, fps: 30, config: { damping: 12, stiffness: 160 } });
  const l1 = easeInOut(ramp(f, 20, 32));
  const l2 = easeInOut(ramp(f, 26, 38));
  const textOut = 1 - ramp(f, 78, 88);
  // The back face is the bedroom; it shows once the card passes edge-on.
  const back = flip > 0.5;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ opacity: sky }}>
        <Sky frame={f} seed={9} stars={24} reveal={sky} avoid={[[440, 90, 1480, 960]]} />
      </AbsoluteFill>
      {/* soft shadow under the card */}
      <div style={{ position: "absolute", left: rect.x + 30 * settled, top: rect.y + 40 * settled, width: rect.w - 60 * settled, height: rect.h - 30 * settled,
        borderRadius: radius, background: "rgba(2,1,22,.55)", filter: `blur(${26 * settled}px)`, opacity: settled * (1 - Math.sin(flip * Math.PI) * 0.6),
        transform: `rotate(${tilt}deg)` }} />
      <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h, perspective: 2200 }}>
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotate(${tilt}deg) rotateY(${flip * 180}deg)` }}>
          {!back && <Face w={rect.w} h={rect.h} mat={mat} radius={radius}>{front}</Face>}
          {back && <Face w={rect.w} h={rect.h} mat={mat} radius={radius} back>{backScene}</Face>}
        </div>
      </div>
      {/* the brand above the card */}
      <div style={{ position: "absolute", left: 0, width: 1920, top: 96, display: "flex", justifyContent: "center", alignItems: "center", gap: 10,
        opacity: Math.min(1, brand * 1.4) * textOut, transform: `translateY(${mix(-18, 0, brand)}px)` }}>
        <Mark size={96} id="c-mark" halo={0.5} />
        <div style={{ fontFamily: JOST, fontWeight: 600, fontSize: 50, color: MUSTARD, letterSpacing: 0.5, textShadow: "0 3px 0 rgba(4,2,30,.55)" }}>Say Suppose</div>
      </div>
      {/* the episode's question under it */}
      <div style={{ position: "absolute", left: 0, width: 1920, top: 742, textAlign: "center", fontFamily: RUBIK, fontWeight: 800, fontSize: 70,
        lineHeight: 1.18, color: PAPER, letterSpacing: 0.5, textShadow: "0 5px 0 rgba(4,2,30,.5)" }}>
        <div style={{ opacity: l1 * textOut, transform: `translateY(${mix(22, 0, l1)}px)` }}>{title[0]}</div>
        <div style={{ opacity: l2 * textOut, transform: `translateY(${mix(22, 0, l2)}px)` }}>
          {title[1]}
        </div>
      </div>
      <AbsoluteFill style={{ opacity: settled }}><Grain opacity={0.07} vignette={0.5} /></AbsoluteFill>
      <Sequence from={1}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.6} /></Sequence>
      <Sequence from={15}><Audio src={staticFile("sfx/pop.wav")} volume={0.4} /></Sequence>
      <Sequence from={86}><Audio src={staticFile("sfx/flip.wav")} volume={0.6} /></Sequence>
      <Sequence from={95}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.55} /></Sequence>
      <PadBed frames={C_FRAMES} />
    </AbsoluteFill>
  );
};
