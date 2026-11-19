// The paper facts of "A Text Would Open Nothing" (beats/TextOpensNothing.tsx): the class-and-country sheet ("you treated
// the four per cent like four places in a room") and the regret pie with her paintbrush in the education wedge. Drawn
// in a <Sheet>'s own units.
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, TEAL } from "@whatif/kit/theme";
import { mix } from "../shared";

const GREY = "#9a9a94";
/** The country's heads: lighter than the class's, so a crowd of thousands stays paper and the teal and the two of you pop. */
const CROWD = "#bdb8ad";

/** A paper head with shoulders, centre of the head at (x, y), head radius r. */
const Head: React.FC<{ x: number; y: number; r: number; fill: string; line?: number }> = ({ x, y, r, fill, line = 0 }) => (
  <g>
    <rect x={x - r * 1.25} y={y + r * 0.9} width={r * 2.5} height={r * 1.3} rx={r * 0.6} fill={fill} stroke={line ? INK : undefined} strokeWidth={line} />
    <circle cx={x} cy={y} r={r} fill={fill} stroke={line ? INK : undefined} strokeWidth={line} />
  </g>
);

/** A labelled panel: an ink frame and its title along the top. */
const Panel: React.FC<{ x: number; w: number; label: string; shown: number; children?: React.ReactNode }> = ({ x, w, label, shown, children }) => (
  <g opacity={Math.min(1, shown * 1.4)}>
    <rect x={x} y={40} width={w} height={560} rx={16} fill="#fbf5e8" stroke={INK} strokeWidth={6} />
    <text x={x + w / 2} y={102} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={46} letterSpacing={3} fill={INK}>{label}</text>
    <line x1={x + 30} y1={124} x2={x + w - 30} y2={124} stroke="#d9ccb2" strokeWidth={4} />
    {children}
  </g>
);

// the country: a crowd of heads, its top four per cent the first TOP of them
const COLS = 52, ROWS = 36, GAP = 12, TOP = Math.round(COLS * ROWS * 0.04);
const GRID = { x: 590, y: 150 };
const YOU_AT = 18, HIM_AT = 21; // both in the first row, well inside the top 4%
const at = (i: number) => ({ x: GRID.x + (i % COLS) * GAP + GAP / 2, y: GRID.y + Math.floor(i / COLS) * GAP + GAP / 2 });

/**
 * The sheet (1400 x 640): two large panels, YOUR CLASS and THE COUNTRY (outside review of v4.1). `panels` 0..1 draws the
 * frames and labels; `room` 0..1 brings in the class, twenty-four heads; `lit` 0..1 lights four of them teal (the four
 * places you thought there were). `sea` 0..1 fills the country with you and him in it and zooms out from the two of you
 * to thousands of heads; `teal` 0..1 lights the top four per cent; `pair` 0..1 rings the two of you, both inside it.
 */
export const ClassAndCountry: React.FC<{
  frame: number; panels: number; room: number; lit: number; sea: number; zoom: number; teal: number; pair: number; you: string; him: string;
}> = ({ frame, panels, room, lit, sea, zoom, teal, pair, you, him }) => {
  const pulse = 1 + 0.12 * Math.max(0, Math.sin(frame / 4));
  const s = mix(5, 1, zoom);
  const focus = { x: (at(YOU_AT).x + at(HIM_AT).x) / 2, y: at(YOU_AT).y };
  const target = { x: mix(960, focus.x, zoom), y: mix(230, focus.y, zoom) };
  const lights = Math.round(teal * TOP);
  return (
    <g>
      <Panel x={40} w={460} label="YOUR CLASS" shown={panels}>
        {Array.from({ length: 24 }, (_, i) => {
          const shown = room * 24 - i;
          if (shown <= 0) return null;
          const on = i < 4 && lit > 0;
          const r = 21 * Math.min(1, shown) * (on ? mix(1, pulse, lit) : 1);
          return <Head key={i} x={110 + (i % 6) * 64} y={190 + Math.floor(i / 6) * 100} r={r} fill={on ? TEAL : GREY} line={on ? 3 : 0} />;
        })}
      </Panel>
      <Panel x={560} w={800} label="THE COUNTRY" shown={panels}>
        <clipPath id="ton-country"><rect x={575} y={134} width={770} height={452} rx={8} /></clipPath>
        {sea > 0 && (
          <g clipPath="url(#ton-country)" opacity={Math.min(1, sea * 2)}>
            <g transform={`translate(${target.x} ${target.y}) scale(${s}) translate(${-focus.x} ${-focus.y})`}>
              {Array.from({ length: COLS * ROWS }, (_, i) => {
                const p = at(i);
                if (i === YOU_AT || i === HIM_AT) return null;
                return <Head key={i} x={p.x} y={p.y - 1.5} r={3.6} fill={i < lights ? TEAL : CROWD} />;
              })}
              {[[YOU_AT, you], [HIM_AT, him]].map(([i, c]) => {
                const p = at(i as number);
                return (
                  <g key={i}>
                    <Head x={p.x} y={p.y - 1.5} r={mix(3.6, 5, zoom)} fill={c as string} line={0.8} />
                    {pair > 0 && <circle cx={p.x} cy={p.y} r={mix(10, 17, zoom) * (pair < 1 ? pair : pulse)} fill="none" stroke={c as string} strokeWidth={4} />}
                  </g>
                );
              })}
            </g>
          </g>
        )}
        {teal >= 1 && (
          <g>
            <path d={`M${GRID.x + COLS * GAP + 10} ${GRID.y} h14 v${GAP * 2} h-14`} fill="none" stroke={TEAL} strokeWidth={5} />
            <text x={GRID.x + COLS * GAP + 30} y={GRID.y + 26} fontFamily={FONT} fontWeight={800} fontSize={28} fill={TEAL}>TOP 4%</text>
          </g>
        )}
      </Panel>
    </g>
  );
};

/** Her paintbrush: a wooden handle, a steel ferrule, a bristle tip wet with crimson. Centre (x, y), pointing up-right. */
const Brush: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) rotate(38) scale(${s})`}>
    <rect x={-6} y={-6} width={12} height={70} rx={5} fill="#c98f5e" stroke={INK} strokeWidth={4} />
    <rect x={-8} y={-26} width={16} height={22} rx={3} fill="#b8bec8" stroke={INK} strokeWidth={4} />
    <path d="M-8 -26 Q-10 -52 0 -66 Q10 -52 8 -26Z" fill="#e7d3b1" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M-6 -46 Q0 -70 6 -46 Q4 -58 0 -66 Q-4 -58 -6 -46Z" fill={CRIMSON} />
  </g>
);

/** A pie on paper: about a third teal (education) with her paintbrush in it (outside review of v4.1: the regret is
 *  hers), the rest the other regrets; eleven dots for the eleven studies along the bottom. Centre (cx, cy). */
export const RegretPie: React.FC<{ cx: number; cy: number; r: number; shown: number }> = ({ cx, cy, r, shown }) => {
  const wedge = (a0: number, a1: number) => {
    const p = (a: number) => `${cx + Math.sin(a) * r} ${cy - Math.cos(a) * r}`;
    return `M${cx} ${cy} L${p(a0)} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)}Z`;
  };
  const third = (Math.PI * 2) / 3;
  const slices = [0.22, 0.18, 0.15, 0.13]; // the other kinds, in grey
  let a = third;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#d9d2c2" stroke={INK} strokeWidth={6} />
      {slices.map((f, i) => {
        const a0 = a;
        a += f * Math.PI * 2;
        return <path key={i} d={wedge(a0, Math.min(a, Math.PI * 2))} fill={["#c9c1b0", "#d9d2c2", "#c4bcab", "#d2cab9"][i]} stroke={INK} strokeWidth={4} />;
      })}
      {shown > 0 && <path d={wedge(0, third * Math.min(1, shown))} fill={TEAL} stroke={INK} strokeWidth={6} />}
      {shown >= 1 && (
        <Brush x={cx + r * 0.47} y={cy - r * 0.2} s={r / 170} />
      )}
      {Array.from({ length: 11 }, (_, i) => <circle key={i} cx={cx - 150 + i * 30} cy={cy + r + 50} r={9} fill={INK} opacity={0.75} />)}
    </g>
  );
};
