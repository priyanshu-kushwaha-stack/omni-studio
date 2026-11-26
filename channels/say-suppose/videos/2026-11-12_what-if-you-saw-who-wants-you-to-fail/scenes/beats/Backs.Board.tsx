// Backs: the rival's diagram of your trick, on the whiteboard, close (outside review of v6, sheet 35: "eleven seconds of
// abstract flowchart", "blank diagram boxes force narration to explain everything"; fix: "three large pictograms").
// Three big drawings land each on its words, fast, his marker hand drawing them: YOU with your score sheet and speech
// marks ("you say your news"), an arrow to A FACE ("to a face"), your look arcing up over the face to an EYE and a "?"
// ("and you read something"); then he strikes the face out with one crimson X: no face, nothing to read.
import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
import { CRIMSON, INK, MUSTARD } from "@whatif/kit/theme";
import { TAEHO } from "../shared";

type Stroke = { d: string; at: number; len: number; color: string; width: number; dash?: boolean };

/** When each drawing lands: `you` (you and your news), `face`, `eye` (the look and the eye), `cross` (the X). */
export type BoardTimes = { you: number; face: number; eye: number; cross: number };

const P1 = { x: 470, y: 640 };
const P2 = { x: 1110, y: 640 };

function strokes(t: BoardTimes): Stroke[] {
  const circle = (x: number, y: number, r: number) => `M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;
  return [
    // you: a head with the tuft, your sheet held up, speech marks
    { d: `${circle(P1.x, P1.y, 110)} M${P1.x - 14} ${P1.y - 110} q-6 -50 30 -60`, at: t.you, len: 8, color: INK, width: 14 },
    { d: `M${P1.x + 120} ${P1.y + 40} l90 -10 l10 -120 l-90 10 Z M${P1.x + 140} ${P1.y - 20} h50 M${P1.x + 138} ${P1.y + 6} h50`, at: t.you + 5, len: 6, color: INK, width: 10 },
    { d: `M${P1.x + 250} ${P1.y - 60} q30 30 0 60 M${P1.x + 290} ${P1.y - 80} q46 50 0 100`, at: t.you + 10, len: 5, color: INK, width: 10 },
    // the arrow to a face
    { d: `M${P1.x + 340} ${P2.y + 90} H${P2.x - 160} m-40 -30 l40 30 l-40 30`, at: t.face - 6, len: 6, color: INK, width: 12 },
    { d: `${circle(P2.x, P2.y, 120)} M${P2.x - 40} ${P2.y - 26} v22 M${P2.x + 40} ${P2.y - 26} v22 M${P2.x - 40} ${P2.y + 50} h80`, at: t.face, len: 9, color: INK, width: 14 },
    // your look, up over the face, to the eye and the "?"
    { d: `M${P1.x + 40} ${P1.y - 120} Q${P1.x + 220} ${P2.y - 470} ${P2.x - 120} ${P2.y - 330}`, at: t.eye, len: 8, color: CRIMSON, width: 10, dash: true },
    { d: `M${P2.x - 110} ${P2.y - 330} q110 -80 220 0 q-110 80 -220 0 ${circle(P2.x, P2.y - 330, 30)}`, at: t.eye + 7, len: 7, color: CRIMSON, width: 12 },
    { d: `M${P2.x + 210} ${P2.y - 380} q0 -70 60 -70 q60 0 60 60 q0 40 -60 60 v46 M${P2.x + 270} ${P2.y - 210} v6`, at: t.eye + 13, len: 8, color: INK, width: 16 },
    // the face struck out
    { d: `M${P2.x - 170} ${P2.y - 170} L${P2.x + 170} ${P2.y + 170} M${P2.x + 170} ${P2.y - 170} L${P2.x - 170} ${P2.y + 170}`, at: t.cross, len: 8, color: CRIMSON, width: 26 },
  ];
}

const progress = (frame: number, s: Stroke) => Math.min(1, Math.max(0, (frame - s.at) / s.len));

/** His hand and marker at the tip of the stroke being drawn (or resting by the last one). */
const MarkerHand: React.FC<{ frame: number; list: Stroke[] }> = ({ frame, list }) => {
  let on = list[0];
  for (const s of list) if (frame >= s.at) on = s;
  const p = progress(frame, on);
  const tip = getPointAtLength(on.d, getLength(on.d) * p);
  const lift = p >= 1 ? 30 : 0;
  return (
    <g transform={`translate(${tip.x + 6} ${tip.y - lift}) rotate(38)`}>
      <rect x={-9} y={-6} width={18} height={84} rx={6} fill={INK} />
      <rect x={-9} y={-6} width={18} height={20} rx={5} fill={on.color === CRIMSON ? CRIMSON : "#3b3e47"} />
      <circle cx={0} cy={80} r={28} fill={TAEHO.head} stroke={INK} strokeWidth={5} />
      <rect x={-30} y={100} width={60} height={420} rx={22} fill={TAEHO.coat} stroke={INK} strokeWidth={5} />
    </g>
  );
};

/** The board close, full frame. */
export const BoardInsert: React.FC<{ frame: number; t: BoardTimes; from: number }> = ({ frame, t, from }) => {
  const list = strokes(t);
  const push = 1 + Math.min(1, Math.max(0, (frame - from) / 150)) * 0.06;
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <rect x={0} y={0} width={1920} height={1080} fill="#9aa3ad" />
      <g transform={`translate(960 560) scale(${push}) translate(-960 -560)`}>
        <rect x={40} y={40} width={1840} height={1000} rx={14} fill="#fdfcf7" />
        <rect x={40} y={40} width={1840} height={1000} rx={14} fill="none" stroke="#7a8088" strokeWidth={8} />
        <circle cx={P1.x} cy={P1.y} r={104} fill={MUSTARD} opacity={progress(frame, list[0]) >= 1 ? 0.9 : 0} />
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {list.map((s, i) => {
            const p = progress(frame, s);
            if (p <= 0) return null;
            const ev = evolvePath(p, s.d);
            return (
              <g key={i}>
                <path d={s.d} stroke={s.color} strokeWidth={s.width} {...ev} />
                {s.dash && p >= 1 && <path d={s.d} stroke="#fdfcf7" strokeWidth={s.width / 2} strokeDasharray="14 22" />}
              </g>
            );
          })}
        </g>
        <MarkerHand frame={frame} list={list} />
      </g>
    </svg>
  );
};
