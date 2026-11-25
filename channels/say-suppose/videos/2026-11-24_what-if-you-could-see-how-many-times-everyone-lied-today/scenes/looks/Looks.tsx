// Look test for the owner's G2 note "video again looks very plain 2D ... check how Ifverse videos are created"
// (2026-11-25). One 6 s moment, the opening, shot three ways so only the look changes:
//   0-2.8 s  over your shoulder: the boss under his glowing 47, a blurred you in the foreground; click, 48.
//   2.8-6 s  close on you: your face fills the frame against a soft, out-of-focus room, lit by the counter.
// A: our cast and our code-drawn set, reframed Ifverse-style (close-ups, depth of field, rim light, bloom).
// B: the same framing on a painted plate, dark figures with white eyes (the Ifverse cast look).
// C: the same framing on a painted plate (local FLUX.2 klein, free), our cast.
// Screen-space drawing (1920x1080). Not part of the film.
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Figure, type Mouth, type Brows } from "@whatif/kit/rig/Figure";
import { FONT } from "@whatif/kit/fonts";
import { Camera } from "@whatif/kit/stage/Stage";
import { Counter } from "../parts/Counter";
import { headWorld, HeroMug, handWorld, type Placed } from "../parts/FrameKit";
import { BOSS_POSE, MeetingScene, MUG_POSE } from "../sets/MeetingRoom";
import { BOSS, GLOW, HERO } from "../shared";

export type LookOption = { bg: "code" | "plate"; cast: "pastel" | "ink" };

const CUT = 84;
const CLICK = 44;
const INKHEAD = "#121318";
const RIM = "#ffae5c";

const ease = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** The room behind the actors: our code-drawn meeting room, or the painted plate, blurred by `blur` px. */
const Room: React.FC<{ o: LookOption; close: boolean; frame: number }> = ({ o, close, frame }) => {
  if (o.bg === "plate") {
    const s = close ? 1.7 : 1.18;
    const x = close ? -140 : 0;
    const y = close ? -60 : -40;
    return (
      <AbsoluteFill style={{ filter: `blur(${close ? 18 : 3}px) brightness(${close ? 0.8 : 0.92})` }}>
        <Img src={staticFile("looks/plate-meeting.png")}
          style={{ width: 1920, height: 1080, objectFit: "cover", transform: `translate(${x}px, ${y}px) scale(${s + frame * 0.0004})` }} />
      </AbsoluteFill>
    );
  }
  const cam: Camera = close ? { x: 1180, y: 420, zoom: 3.2 } : { x: 1330, y: 470, zoom: 2.2 };
  return (
    <AbsoluteFill style={{ filter: `blur(${close ? 16 : 2.5}px)` }}>
      <MeetingScene cam={{ ...cam, zoom: cam.zoom + frame * 0.0006 }} mood="lamp" frame={frame} options={{ blinds: 0.25, pool: 1 }} />
    </AbsoluteFill>
  );
};

/** White eyes, brows and mouth over an ink head (the B cast), at a head's screen centre. */
const InkFace: React.FC<{ h: { x: number; y: number; r: number }; facing: 1 | -1; tilt: number; eyes: number;
  brows: Brows; mouth: Mouth; look: { x: number; y: number } }> = ({ h, facing, tilt, eyes, brows, mouth, look }) => {
  const s = h.r / 46;
  const lift = brows === "raised" ? -10 : brows === "worry" ? -4 : 0;
  const inner = brows === "worry" ? 7 : brows === "angry" ? -7 : 0;
  return (
    <g transform={`translate(${h.x} ${h.y}) rotate(${tilt * facing}) scale(${s * facing} ${s})`}>
      {[-12, 16].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={-4} rx={9.5 * Math.min(1.2, eyes)} ry={11.5 * eyes} fill="#fbf7ef" />
          <circle cx={cx + look.x * 3.5} cy={-4 + look.y * 3} r={4.2} fill={INKHEAD} />
        </g>
      ))}
      {brows !== "none" && (
        <>
          <line x1={-24} y1={-22 + lift} x2={-4} y2={-22 + lift - inner} stroke="#fbf7ef" strokeWidth={4.5} strokeLinecap="round" />
          <line x1={8} y1={-22 + lift - inner} x2={28} y2={-22 + lift} stroke="#fbf7ef" strokeWidth={4.5} strokeLinecap="round" />
        </>
      )}
      {mouth === "o" && <ellipse cx={4} cy={22} rx={6.5} ry={8.5} fill="#fbf7ef" />}
      {mouth === "open" && <path d="M-8 15 Q4 12 18 15 Q15 32 5 32 Q-5 32 -8 15Z" fill="#fbf7ef" />}
      {mouth === "smile" && <path d="M-8 16 Q4 30 18 16" fill="none" stroke="#fbf7ef" strokeWidth={4.5} strokeLinecap="round" />}
      {mouth === "flat" && <path d="M-3 20 L13 20" fill="none" stroke="#fbf7ef" strokeWidth={4.5} strokeLinecap="round" />}
    </g>
  );
};

/** A figure in screen space, in either cast. */
const Person: React.FC<{ o: LookOption; p: Placed; head: string; extra: Record<string, unknown>; eyes: number; brows: Brows;
  mouth: Mouth; look: { x: number; y: number }; children?: React.ReactNode }> = ({ o, p, head, extra, eyes, brows, mouth, look, children }) => {
  const ink = o.cast === "ink";
  return (
    <g>
      <Figure x={p.x} y={p.y} scale={p.scale} facing={p.facing} pose={p.pose} head={ink ? INKHEAD : head} {...extra}
        blink={ink} eyes={eyes} brows={ink ? "none" : brows} mouth={ink ? "none" : mouth} look={look} />
      {ink && <InkFace h={headWorld(p)} facing={p.facing} tilt={p.pose.tilt} eyes={eyes} brows={brows} mouth={mouth} look={look} />}
      {children}
    </g>
  );
};

const rimStyle = (dx: number) => ({
  filter: `drop-shadow(${dx}px -3px 0 ${RIM}) drop-shadow(${dx * 1.6}px -4px 14px ${RIM}88)`,
});

const Over: React.FC<{ o: LookOption; frame: number }> = ({ o, frame }) => {
  const talking = frame < CLICK - 6 && Math.floor(frame / 4) % 2 === 0;
  const boss: Placed = { x: 1100, y: 1380, scale: 3.5, facing: -1, pose: BOSS_POSE };
  const bh = headWorld(boss);
  const flash = ease(frame, CLICK, CLICK + 3) * (1 - ease(frame, CLICK + 3, CLICK + 16));
  return (
    <AbsoluteFill>
      <Room o={o} close={false} frame={frame} />
      {/* the counter's light on the room */}
      <AbsoluteFill style={{ mixBlendMode: "screen", background: `radial-gradient(circle at ${bh.x}px ${bh.y - 235}px, ${GLOW}${flash > 0 ? "aa" : "66"} 0%, rgba(0,0,0,0) 420px)` }} />
      <AbsoluteFill style={rimStyle(-7)}>
        <svg width={1920} height={1080}>
          <Person o={o} p={boss} head={BOSS.head} extra={{ coat: BOSS.coat, tie: BOSS.tie, time: frame }} eyes={1.05}
            brows="flat" mouth={talking ? "open" : "smile"} look={{ x: 1, y: 0.1 }} />
          <Counter x={bh.x} y={bh.y - 235} base={46} ticks={[0, CLICK]} frame={frame} size={120} id="look-47" />
        </svg>
      </AbsoluteFill>
      {/* you, the back of your head and shoulder, close and out of focus */}
      <AbsoluteFill style={{ filter: "blur(9px)" }}>
        <svg width={1920} height={1080}>
          <rect x={-60} y={930} width={640} height={420} rx={200} fill={o.cast === "ink" ? "#2a3b8f" : "#2a2c33"} />
          <path d="M60 955 Q290 1010 520 955 L520 1010 Q290 1060 60 1010Z" fill={HERO.scarf} />
          <circle cx={290} cy={770} r={225} fill={o.cast === "ink" ? INKHEAD : HERO.head} />
          {o.cast === "pastel" && <path d="M240 560 Q215 480 300 462 Q275 525 335 545Z" fill="#23252b" />}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Close: React.FC<{ o: LookOption; frame: number }> = ({ o, frame }) => {
  const f = frame - CUT;
  const widen = ease(f, 14, 22);
  const base: Placed = { x: 0, y: 0, scale: 6.4, facing: 1, pose: { ...MUG_POSE, armF: [20, 128] as [number, number] } };
  const h0 = headWorld(base);
  const you: Placed = { ...base, x: 860 - h0.x, y: 500 - h0.y };
  const hand = handWorld(you);
  const push = 1 + f * 0.0007;
  const eyes = 1 + widen * 0.38;
  return (
    <AbsoluteFill>
      <Room o={o} close={true} frame={frame} />
      {/* bokeh: out-of-focus lamps and the boss's 48, far behind */}
      <AbsoluteFill style={{ filter: "blur(10px)" }}>
        <svg width={1920} height={1080}>
          {[[1560, 230, 60, 0.55], [1700, 420, 34, 0.35], [240, 180, 46, 0.3], [1420, 120, 28, 0.4]].map(([x, y, r, a], i) => (
            <circle key={i} cx={x + Math.sin((frame + i * 40) / 40) * 6} cy={y} r={r} fill={GLOW} opacity={a} />
          ))}
          <g opacity={0.85}><Counter x={1600} y={300} base={48} frame={frame} size={70} id="look-48-far" /></g>
        </svg>
      </AbsoluteFill>
      {/* the counter's warm light from the upper right, on your face */}
      <AbsoluteFill style={{ mixBlendMode: "screen", background: `radial-gradient(circle at 1500px 220px, ${GLOW}55 0%, rgba(0,0,0,0) 900px)` }} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "860px 500px", ...rimStyle(8) }}>
        <svg width={1920} height={1080}>
          <Person o={o} p={you} head={HERO.head} extra={{ coat: "#3b4252", scarf: HERO.scarf, tuft: o.cast === "pastel", time: 3 + frame * 0.3, flow: 0.1 }}
            eyes={eyes} brows={widen > 0.5 ? "raised" : "flat"} mouth={widen > 0.5 ? "o" : "flat"} look={{ x: 0.9, y: -0.45 }} />
          <HeroMug x={hand.x + 8} y={hand.y + 4} scale={you.scale} steam={false} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Ifverse-size HUD: one small pill in a corner, never a box over the picture. */
const Hud: React.FC<{ frame: number }> = ({ frame }) => {
  const tag = ease(frame, 120, 130) * (1 - ease(frame, 170, 178));
  return (
    <AbsoluteFill style={{ pointerEvents: "none", fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 48, top: 40, padding: "8px 18px", borderRadius: 40, background: "rgba(14,12,10,.72)",
        color: "#f3e9d7", fontWeight: 800, fontSize: 30, letterSpacing: 2, border: "2px solid rgba(255,207,90,.6)" }}>
        LIES TODAY · {frame >= CLICK ? 48 : 47}
      </div>
      <div style={{ position: "absolute", left: "50%", bottom: 54, transform: `translateX(-50%) translateY(${(1 - tag) * 20}px)`, opacity: tag,
        padding: "10px 26px", borderRadius: 10, background: "rgba(14,12,10,.78)", color: "#f3e9d7", fontWeight: 800, fontSize: 34, letterSpacing: 1.5 }}>
        5% TELL HALF THE LIES
      </div>
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(10,6,20,.5) 100%)" }} />
);

export const LookTest: React.FC<{ o: LookOption }> = ({ o }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000", filter: "contrast(1.06) saturate(1.08)" }}>
      {frame < CUT ? <Over o={o} frame={frame} /> : <Close o={o} frame={frame} />}
      <Grain />
      <Hud frame={frame} />
    </AbsoluteFill>
  );
};
