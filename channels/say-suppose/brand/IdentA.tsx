// Option A: the ringed Earth. Cut from the frozen hook to the indigo sky; the paper Earth turns into view, the ring
// sweeps round it on a whoosh, the wordmark stamps in with the line under it, and an iris through the planet opens
// on the next scene.
import { AbsoluteFill, Audio, Img, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { easeIn, easeInOut, easeOut, GOLD, Grain, JOST, mix, PAPER, ramp, RingedEarth, Sky, Wordmark, PadBed } from "./brand";

export const A_FRAMES = 105;
const CX = 960;
const CY = 400;
const R = 168;

export const IdentA: React.FC = () => {
  const f = useCurrentFrame();
  // The globe arrives already turning and settles on the Americas, like the channel art.
  const arrive = spring({ frame: f, fps: 30, config: { damping: 14, stiffness: 90, mass: 0.9 } });
  const lon = mix(40, -78, easeOut(ramp(f, 0, 44)));
  const ring = easeInOut(ramp(f, 12, 36));
  const stamp = spring({ frame: f - 38, fps: 30, config: { damping: 9, stiffness: 220, mass: 0.6 } });
  const line = easeOut(ramp(f, 50, 64));
  // A slow drift in while it holds, then a dive into the planet; an iris from its centre opens on the bedroom.
  const push = mix(1, 1.04, ramp(f, 36, 90)) * mix(1, 1.9, easeIn(ramp(f, 88, A_FRAMES - 1)));
  const iris = easeIn(ramp(f, 92, A_FRAMES - 1)) * 1250;
  const textOut = 1 - ramp(f, 86, 93);
  const globe = `translate(${CX} ${mix(CY + 140, CY, arrive)}) scale(${mix(0.55, 1, arrive)}) rotate(${mix(-14, 0, arrive)})`;
  const layer: React.CSSProperties = { transform: `scale(${push})`, transformOrigin: `${CX}px ${CY}px` };

  return (
    <AbsoluteFill style={{ background: "#0c0a4a" }}>
      <AbsoluteFill style={layer}>
        <Sky frame={f} seed={3} reveal={ramp(f, 0, 18)} avoid={[[480, 660, 1440, 940], [700, 180, 1220, 620]]} />
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <g transform={globe}>
            <RingedEarth r={R} lon={lon} ring={ring} spark id="a" />
          </g>
        </svg>
        {f >= 38 && (
          <div style={{ position: "absolute", left: 0, width: 1920, top: 690, display: "flex", justifyContent: "center" }}>
            <Wordmark size={132} style={{ transform: `scale(${mix(1.35, 1, stamp)})`, opacity: Math.min(1, stamp * 1.6) * textOut }} />
          </div>
        )}
        <div style={{ position: "absolute", left: 0, width: 1920, top: 850, textAlign: "center", fontFamily: JOST, fontWeight: 400,
          fontSize: 44, color: PAPER, letterSpacing: 1, opacity: line * textOut, transform: `translateY(${mix(14, 0, line)}px)` }}>
          Change one thing. <span style={{ color: GOLD }}>See what follows.</span>
        </div>
        <Grain />
      </AbsoluteFill>
      {iris > 0 && (
        <AbsoluteFill style={{ clipPath: `circle(${iris}px at ${CX}px ${CY}px)` }}>
          <Img src={staticFile("frames/bedroom-first.png")} style={{ width: 1920, height: 1080 }} />
        </AbsoluteFill>
      )}
      {iris > 0 && iris < 1240 && (
        <svg width={1920} height={1080} style={{ position: "absolute" }}>
          <circle cx={CX} cy={CY} r={iris} fill="none" stroke={GOLD} strokeWidth={12} opacity={0.85} />
        </svg>
      )}
      {iris > 0 && f < A_FRAMES - 2 && (
        <AbsoluteFill style={{ ...layer, opacity: 1 - ramp(f, 97, 102) }}>
          <svg width={1920} height={1080} style={{ position: "absolute" }}>
            <g transform={globe}><RingedEarth r={R} lon={lon} ring={ring} id="a-front" frontOnly /></g>
          </svg>
        </AbsoluteFill>
      )}
      <Sequence from={10}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.9} /></Sequence>
      <Sequence from={38}><Audio src={staticFile("sfx/pop.wav")} volume={0.55} /></Sequence>
      <Sequence from={92}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.45} /></Sequence>
      <PadBed frames={A_FRAMES} />
    </AbsoluteFill>
  );
};
