// Option B: the split-flap board. The counter the viewer just watched becomes a station board: every tile clatters
// through letters, lands on SAY SUPPOSE, and a smaller row spells the episode's what-if. The ringed-Earth crest
// stamps onto the board when the name lands.
import { AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { GOLD, Grain, hash, INK, JOST, Mark, mix, MUSTARD, PAPER, ramp, RUBIK, Sky, PadBed } from "./brand";

export const B_FRAMES = 105;
const ALPH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789?";
const STEP = 3;

/** One split-flap tile. The flap falls over 4 frames when the value changes. */
const Tile: React.FC<{ w: number; h: number; value: string; previous: string; changedAt: number; frame: number; color: string; size: number }> = ({
  w, h, value, previous, changedAt, frame, color, size,
}) => {
  const t = frame - changedAt;
  const fold = Math.max(0, Math.min(1, 1 - t / 2));
  const open = Math.max(0, Math.min(1, (t - 2) / 2));
  const rad = Math.round(w * 0.12);
  const half = (v: string, part: "top" | "bottom", scale = 1, shade = 0) => (
    <div style={{
      position: "absolute", left: 0, width: w, height: h / 2 - 1.5, top: part === "top" ? 0 : h / 2 + 1.5, overflow: "hidden",
      background: part === "top" ? "#2b2e36" : INK, borderRadius: part === "top" ? `${rad}px ${rad}px 0 0` : `0 0 ${rad}px ${rad}px`,
      transform: `scaleY(${scale})`, transformOrigin: part === "top" ? "bottom" : "top",
    }}>
      <div style={{ position: "absolute", left: 0, width: w, height: h, lineHeight: `${h}px`, top: part === "top" ? 0 : -(h / 2 + 1.5),
        textAlign: "center", color, fontFamily: RUBIK, fontWeight: 800, fontSize: size }}>{v}</div>
      {shade > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${shade})` }} />}
    </div>
  );
  return (
    <div style={{ position: "relative", width: w, height: h, filter: "drop-shadow(0 6px 8px rgba(2,1,20,.55))" }}>
      {half(value, "top")}
      {half(previous, "bottom")}
      {fold > 0 && half(previous, "top", fold, (1 - fold) * 0.5)}
      {open > 0 && half(value, "bottom", open, (1 - open) * 0.4)}
      {/* hinge pins */}
      <div style={{ position: "absolute", left: -3, top: h / 2 - 4, width: 6, height: 8, borderRadius: 2, background: "#0b0a24" }} />
      <div style={{ position: "absolute", right: -3, top: h / 2 - 4, width: 6, height: 8, borderRadius: 2, background: "#0b0a24" }} />
    </div>
  );
};

interface RowSpec { text: string; x0: number; y: number; w: number; h: number; gap: number; size: number; color: string; start: (i: number) => number; land: (i: number) => number; seed: number }

function tileState(spec: RowSpec, i: number, f: number) {
  const target = spec.text[i];
  const s = Math.round(spec.start(i));
  const l = Math.round(spec.land(i));
  const pick = (k: number) => (k < 0 ? " " : ALPH[Math.floor(hash(spec.seed * 97 + i * 13 + k) * ALPH.length)]);
  if (f < s) return { value: " ", previous: " ", changedAt: -99 };
  if (f >= l) {
    const kLast = Math.floor((l - 1 - s) / STEP);
    return { value: target, previous: pick(kLast), changedAt: l };
  }
  const k = Math.floor((f - s) / STEP);
  return { value: pick(k), previous: pick(k - 1), changedAt: s + k * STEP };
}

const row1: RowSpec = { text: "SAY SUPPOSE", x0: 250, y: 318, w: 120, h: 164, gap: 10, size: 112, color: MUSTARD, seed: 1,
  start: (i) => 3 + i, land: (i) => 22 + i * 3 };
const row2: RowSpec = { text: "WHAT IF TIME PAUSED?", x0: 303, y: 560, w: 60, h: 84, gap: 6, size: 56, color: PAPER, seed: 2,
  start: (i) => 22 + i * 0.6, land: (i) => 46 + i * 1.5 };

/** Frames on which some tile flips, with how many flip there. */
function flips(): Map<number, number> {
  const m = new Map<number, number>();
  for (const spec of [row1, row2]) {
    for (let i = 0; i < spec.text.length; i++) {
      const s = Math.round(spec.start(i)); const l = Math.round(spec.land(i));
      for (let f = s; f < l; f += STEP) m.set(f, (m.get(f) ?? 0) + 1);
      m.set(l, (m.get(l) ?? 0) + 1);
    }
  }
  return m;
}
const FLIPS = [...flips().entries()].sort((a, b) => a[0] - b[0]);

export const IdentB: React.FC = () => {
  const f = useCurrentFrame();
  const board = spring({ frame: f, fps: 30, config: { damping: 16, stiffness: 160 } });
  const crest = spring({ frame: f - 53, fps: 30, config: { damping: 9, stiffness: 230, mass: 0.6 } });
  const push = mix(1, 1.045, ramp(f, 0, B_FRAMES));
  const line = ramp(f, 76, 88);
  const rows = [row1, row2];
  return (
    <AbsoluteFill style={{ background: "#0c0a4a" }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <Sky frame={f} seed={5} stars={22} reveal={1} avoid={[[170, 150, 1750, 760], [560, 760, 1360, 880]]} />
        <AbsoluteFill style={{ transform: `translateY(${mix(-60, 0, board)}px)`, opacity: Math.min(1, board * 2) }}>
          {/* rods the board hangs from */}
          {[520, 1400].map((x) => (
            <div key={x} style={{ position: "absolute", left: x - 7, top: -20, width: 14, height: 280, background: "#0a0930", borderRadius: 7 }} />
          ))}
          {/* the board */}
          <div style={{ position: "absolute", left: 200, top: 250, width: 1520, height: 470, borderRadius: 34, background: "#17155a",
            boxShadow: "0 22px 0 rgba(3,2,25,.55), inset 0 0 0 10px #201e6e, inset 0 -12px 0 10px #13114a" }} />
          {[[236, 286], [1684, 286], [236, 684], [1684, 684]].map(([x, y], i) => (
            <div key={i} style={{ position: "absolute", left: x - 8, top: y - 8, width: 16, height: 16, borderRadius: 8, background: "#2c2a86",
              boxShadow: "inset 0 -3px 0 #120f48" }} />
          ))}
          <div style={{ position: "absolute", left: 250, top: 524, width: 1420, height: 4, borderRadius: 2, background: "#100e44" }} />
          {rows.map((spec) => [...spec.text].map((_, i) => {
            const st = tileState(spec, i, f);
            return (
              <div key={`${spec.seed}-${i}`} style={{ position: "absolute", left: spec.x0 + i * (spec.w + spec.gap), top: spec.y }}>
                <Tile w={spec.w} h={spec.h} frame={f} size={spec.size} color={spec.color} {...st} />
              </div>
            );
          }))}
          {/* the crest stamps onto the top edge when the name lands */}
          {f >= 53 && (
            <div style={{ position: "absolute", left: 960 - 74, top: 236 - 74, width: 148, height: 148, borderRadius: 74, background: "#0c0a4a",
              boxShadow: `0 0 0 8px ${MUSTARD}, 0 12px 0 8px rgba(3,2,25,.5)`, transform: `scale(${mix(1.6, 1, crest)})`, opacity: Math.min(1, crest * 1.5),
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Mark size={210} id="b-crest" halo={0.4} />
            </div>
          )}
          <div style={{ position: "absolute", left: 0, width: 1920, top: 790, textAlign: "center", fontFamily: JOST, fontWeight: 400, fontSize: 40,
            color: PAPER, letterSpacing: 1, opacity: line, transform: `translateY(${mix(12, 0, line)}px)` }}>
            Change one thing. <span style={{ color: GOLD }}>See what follows.</span>
          </div>
        </AbsoluteFill>
        <Grain />
      </AbsoluteFill>
      {FLIPS.map(([at, n]) => (
        <Sequence key={at} from={at} durationInFrames={6}>
          <Audio src={staticFile("sfx/flip.wav")} volume={Math.min(0.42, 0.12 + n * 0.035)} />
        </Sequence>
      ))}
      <Sequence from={53}><Audio src={staticFile("sfx/pop.wav")} volume={0.5} /></Sequence>
      <PadBed frames={B_FRAMES} />
    </AbsoluteFill>
  );
};
