// Thumbnails for "What If Nobody Could Say No to You?", drawn with the engine's kit like Thumbs.tsx: a night metro gate,
// you at the left with your hand out, and three people who all say yes with the same smile. No AI images.
import { AbsoluteFill, Composition, useCurrentFrame } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { Finish, Stage, type Camera } from "@whatif/kit/stage/Stage";
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook } from "@whatif/kit/stage/moods";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, HEIGHT, INK, MUSTARD, PAPER, TEAL, WIDTH } from "@whatif/kit/theme";
import { CANDIDATES, ROW, rowFeet, type NobodyCandidate } from "./nobody";
import type { Tag } from "./batch1";

const CAM: Camera = { x: 960, y: 540, zoom: 1 };
const blur = (n: number) => `url(#dof-${Math.max(1, Math.min(40, Math.round(n * 2)))})`;
const LOOK = moodLook("night", { grade: { top: "#4a5aa8", bottom: "#24264a", opacity: 0.3 } });

const WordTag: React.FC<{ t: Tag }> = ({ t }) => (
  <div style={{
    position: "absolute", top: t.y, ...(t.align === "right" ? { right: t.x } : { left: t.x }),
    transform: `rotate(${t.tilt}deg)`, transformOrigin: t.align === "right" ? "right center" : "left center",
    background: INK, color: MUSTARD, border: `7px solid ${PAPER}`, borderRadius: 22,
    fontFamily: FONT, fontWeight: 800, fontSize: t.size, lineHeight: 1, letterSpacing: 2,
    padding: `${t.size * 0.13}px ${t.size * 0.22}px ${t.size * 0.09}px`, whiteSpace: "nowrap",
    boxShadow: "0 14px 26px rgba(0,0,0,.45)",
  }}>{t.text}</div>
);

/** The fixed smile: one wide closed-lip curve, drawn the same on all three faces, over the rig's own mouth. */
const SAME_SMILE = { brows: "raised" as const, lids: 0, mouth: "smile" as const, eyes: 1.05, look: { x: -0.9, y: 0 } };

const Row: React.FC = () => {
  const s = ROW.scale;
  const pose = { ...EXPRESSIONS.neutral, ...SAME_SMILE };
  const body = { lean: 0, tilt: ROW.tilt, armF: [6, 8] as [number, number], armB: [-6, 8] as [number, number], legB: [-4, -2] as [number, number], legF: [5, -3] as [number, number], drop: 0 };
  const [bx, cx, mx] = ROW.xs;
  return (
    <>
      {/* the boss: lilac head, tie */}
      <Figure x={rowFeet(bx).x} y={rowFeet(bx).y} scale={s} facing={-1} head="#b58fc7" tie={CRIMSON} pose={body} {...pose} />
      {/* the ticket checker: pale blue head, cap */}
      <Figure x={rowFeet(cx).x} y={rowFeet(cx).y} scale={s} facing={-1} head="#8fb4d9" cap="#2d3a5c" coat="#2d3a5c" pose={body} {...pose} />
      {/* your mother: pink head, bun, shawl */}
      <g>
        <circle cx={mx + 30 * s} cy={ROW.y - 40 * s} r={19 * s} fill="#3a2a2a" />
        <Figure x={rowFeet(mx).x} y={rowFeet(mx).y} scale={s} facing={-1} head="#e6a0a0" coat="#7a5a8c" pose={body} {...pose} />
      </g>
    </>
  );
};

/** One crimson arrow (K8), in from the right edge under the tag, to your mother's smile. */
const Arrow: React.FC = () => {
  // the smile sits about 0.55 head radii below and left of the head centre (the face looks left)
  const tip = { x: ROW.xs[2] + 46 * ROW.scale + 14, y: ROW.y + 22 * ROW.scale };
  return (
    <g fill="none" stroke={CRIMSON} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round">
      <path d={`M1898 420 Q1905 ${tip.y} ${tip.x + 8} ${tip.y}`} />
      <path d={`M${tip.x + 52} ${tip.y - 38} L${tip.x + 4} ${tip.y} L${tip.x + 52} ${tip.y + 38}`} />
    </g>
  );
};

const Gate: React.FC<{ c: NobodyCandidate }> = ({ c }) => {
  const back = (
    <>
      <rect width={1920} height={1080} fill="#181b29" />
      <g filter={blur(8)}>
        {/* the concourse: a strip light, the far wall, two turnstiles */}
        <rect x={700} y={60} width={900} height={18} rx={9} fill="#dfe9ff" opacity={0.7} />
        <rect x={0} y={880} width={1920} height={200} fill="#12141f" />
        {[880, 1260, 1640].map((x) => (
          <g key={x}>
            <rect x={x} y={720} width={60} height={200} rx={10} fill="#2a3048" />
            <rect x={x + 60} y={790} width={140} height={14} rx={7} fill="#3a4262" />
          </g>
        ))}
      </g>
    </>
  );
  const h = c.hero;
  const actors = (
    <>
      <Row />
      <Figure x={h.x} y={h.y} scale={h.scale} facing={1} pose={h.pose} head={MUSTARD} scarf={TEAL} tuft flow={0.25} time={3}
        {...EXPRESSIONS.shocked} brows="worry" eyes={1.3} look={h.look} />
    </>
  );
  return (
    <>
      <Stage cam={CAM} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}><Arrow /></svg>
    </>
  );
};

export const NobodyThumb: React.FC<{ c: NobodyCandidate }> = ({ c }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <LookContext.Provider value={LOOK}>
      <Gate c={c} />
    </LookContext.Provider>
    <Finish />
    <WordTag t={c.tag} />
  </AbsoluteFill>
);

const Frames: React.FC = () => {
  const frame = useCurrentFrame();
  return <NobodyThumb c={CANDIDATES[Math.min(frame, CANDIDATES.length - 1)]} />;
};

export const NobodyRoot: React.FC = () => (
  <Composition id="Thumbs" component={Frames} durationInFrames={CANDIDATES.length} fps={1} width={WIDTH} height={HEIGHT} />
);
