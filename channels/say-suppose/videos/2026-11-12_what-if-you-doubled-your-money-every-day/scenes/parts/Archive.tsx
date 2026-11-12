// Two paper-cut history beats in a sepia grade: Berlin, 1923 (a wheelbarrow of notes outside a bakery, children
// stacking brick-towers of notes, a wall papered in them, a chalkboard price wiped and rewritten), and Mansa Musa's
// gold in Cairo. Story pictures of sourced claims (c01, c03, c06); no real photographs, all drawn in code.
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { STAND } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { INK } from "@whatif/kit/theme";
import { mix, Push, ramp, type ShotTime } from "./util";

const SEPIA = { paper: "#e9d8b4", mid: "#b8956a", dark: "#5a4128", note: "#cdbb8e" };

const NoteBrick: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect x={-34} y={-14} width={68} height={28} fill={SEPIA.note} stroke={SEPIA.dark} strokeWidth={3} />
    <rect x={-34} y={-4} width={68} height={8} fill={SEPIA.mid} opacity={0.6} />
  </g>
);

const PRICES = ["10.000", "1.000.000", "1.000.000.000", "200.000.000.000"];

export const Berlin1923: React.FC<{ t: ShotTime }> = ({ t }) => {
  const price = PRICES[Math.min(PRICES.length - 1, Math.floor(t.p * PRICES.length * 1.2))];
  const tower = Math.floor(mix(2, 9, ramp(t.p, 0.1, 0.9)));
  return (
    <Push t={t} from={1} to={1.06}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, filter: "sepia(0.4)" }}>
        <rect width={1920} height={1080} fill={SEPIA.paper} />
        {Array.from({ length: 16 }, (_, r) => Array.from({ length: 12 }, (_, c) => (
          <NoteBrick key={`${r}-${c}`} x={1040 + c * 74 + (r % 2) * 30} y={40 + r * 40} r={(r * 7 + c * 3) % 5 - 2} />
        )))}
        <rect x={0} y={860} width={1920} height={220} fill={SEPIA.mid} />
        <g transform="translate(560 220)">
          <rect x={0} y={0} width={360} height={200} rx={8} fill="#2f3428" stroke={SEPIA.dark} strokeWidth={12} />
          <text x={180} y={80} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={40} fill="#efe6cf">Brot</text>
          <text x={180} y={150} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={price.length > 12 ? 30 : 44} fill="#efe6cf">{price}</text>
        </g>
        <g transform="translate(300 860)">
          <path d="M-140 -60 L120 -60 L90 0 L-110 0Z" fill={SEPIA.mid} stroke={SEPIA.dark} strokeWidth={6} />
          {Array.from({ length: 10 }, (_, i) => <NoteBrick key={i} x={-90 + (i % 5) * 46} y={-80 - Math.floor(i / 5) * 26} />)}
          <circle cx={-110} cy={20} r={28} fill={SEPIA.dark} />
          <line x1={120} y1={-60} x2={200} y2={-130} stroke={SEPIA.dark} strokeWidth={8} />
        </g>
        {[0, 1].map((k) => (
          <g key={k}>
            {Array.from({ length: tower }, (_, i) => <NoteBrick key={i} x={700 + k * 200} y={840 - i * 28} r={(i % 3) - 1} />)}
            <Figure x={640 + k * 330} y={1000} scale={0.9} facing={k ? -1 : 1} pose={{ ...STAND, armF: [100, 30], armB: [-20, 20] }}
              head={k ? "#d9c08a" : "#c9a87a"} coat={SEPIA.dark} {...EXPRESSIONS.happy} time={t.f / 30 + k} />
          </g>
        ))}
      </svg>
    </Push>
  );
};

export const Cairo: React.FC<{ t: ShotTime }> = ({ t }) => {
  const pile = mix(40, 220, ramp(t.p, 0.05, 0.8));
  return (
    <Push t={t} from={1} to={1.06}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, filter: "sepia(0.3)" }}>
        <rect width={1920} height={1080} fill="#f0d9a8" />
        {[300, 700, 1200, 1600].map((x, i) => (
          <g key={x}>
            <rect x={x - 90} y={520 - i * 20} width={180} height={340 + i * 20} fill="#d9b88a" stroke={SEPIA.dark} strokeWidth={5} />
            <path d={`M${x - 90} ${520 - i * 20} Q${x} ${380 - i * 20} ${x + 90} ${520 - i * 20}Z`} fill="#c9a06a" stroke={SEPIA.dark} strokeWidth={5} />
          </g>
        ))}
        <rect x={0} y={860} width={1920} height={220} fill="#c9a06a" />
        <ellipse cx={960} cy={880} rx={pile * 1.6} ry={pile * 0.5} fill="#e8b53a" stroke={SEPIA.dark} strokeWidth={5} />
        {Array.from({ length: 14 }, (_, i) => {
          const k = ((t.f / 40 + i / 14) % 1);
          return <circle key={i} cx={760 + (i % 7) * 60} cy={mix(560, 860, k)} r={12} fill="#f2c94c" stroke={SEPIA.dark} strokeWidth={3} />;
        })}
        <Figure x={760} y={1000} scale={1.3} pose={{ ...STAND, armF: [120, 20], armB: [-60, 20] }} head="#8a5a3a" coat="#efe6cf"
          {...EXPRESSIONS.happy} time={t.f / 30} />
        {[0, 1, 2].map((i) => (
          <Figure key={i} x={1250 + i * 160} y={1000} scale={1.05} facing={-1} pose={{ ...STAND, armF: [100, 20], armB: [-20, 20] }}
            head={["#b8956a", "#d9b88a", "#a87a5a"][i]} coat="#7a6a58" {...EXPRESSIONS.happy} time={t.f / 30 + i} />
        ))}
      </svg>
    </Push>
  );
};

export const INK_ = INK;
