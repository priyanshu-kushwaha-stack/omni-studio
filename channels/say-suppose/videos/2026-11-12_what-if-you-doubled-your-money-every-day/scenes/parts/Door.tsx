// Three minutes to midnight: the bakery's glass door at night, Lotte behind it with her keys and her lamp, you outside.
// The cent goes into her palm; then the close on her closed hand, the camera drifting in; then she turns the key and
// the lamp goes out. Screen pixels.
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { STAND } from "@whatif/kit/rig/pose";
import { HERO } from "@whatif/kit/sets/cast";
import { INK, MUSTARD } from "@whatif/kit/theme";
import { LOTTE } from "./Bakery";
import { ease, mix, Push, ramp, type ShotTime } from "./util";

export const Door: React.FC<{ t: ShotTime; lampOut?: boolean; give?: boolean }> = ({ t, lampOut, give }) => {
  const lamp = lampOut ? 1 - ramp(t.p, 0.4, 0.6) : 1;
  const open = give ? ease(ramp(t.p, 0, 0.2)) : 0;
  const reach = give ? ramp(t.p, 0.3, 0.6) : 0;
  return (
    <Push t={t}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <rect width={1920} height={1080} fill="#10131e" />
        <rect x={0} y={900} width={1920} height={180} fill="#1c1f2a" />
        <rect x={760} y={120} width={820} height={800} fill="#2a2220" stroke={INK} strokeWidth={10} />
        <defs>
          <radialGradient id="door-lamp" cx="0.5" cy="0.35" r="0.6">
            <stop offset="0" stopColor="#ffd8a0" stopOpacity={0.9 * lamp} />
            <stop offset="1" stopColor="#3a2a20" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect x={790} y={150} width={760} height={750} fill="url(#door-lamp)" />
        <circle cx={1170} cy={220} r={26} fill={lamp > 0.5 ? "#fff1c8" : "#4a4638"} stroke={INK} strokeWidth={4} />
        <Figure x={1250} y={1180} scale={2.2} facing={-1} pose={{ ...STAND, armF: [mix(30, 85, reach), mix(20, -5, reach)], armB: [-10, 12] }}
          {...LOTTE} {...EXPRESSIONS[give ? "sad" : "neutral"]} time={t.f / 30} look={{ x: 0.9, y: 0.25 }}
          held={<circle cx={0} cy={-6} r={7} fill="#c9c6c0" stroke={INK} strokeWidth={2.5} />} />
        <rect x={790} y={150} width={mix(760, 560, open)} height={750} fill="#9fc0e0" opacity={0.16} stroke={INK} strokeWidth={8} />
        <Figure x={430} y={1250} scale={2.4} pose={{ ...STAND, armF: [mix(20, 80, reach), mix(10, -5, reach)], armB: [-12, 14] }}
          {...HERO} {...EXPRESSIONS[give ? "relieved" : "worried"]} time={t.f / 30 + 2} look={{ x: 0.9, y: 0.2 }}
          held={give ? <circle cx={0} cy={-6} r={7} fill={MUSTARD} stroke={INK} strokeWidth={2.5} /> : undefined} />
        <rect x={0} y={0} width={1920} height={1080} fill="#000" opacity={mix(0, 0.55, 1 - lamp)} />
      </svg>
    </Push>
  );
};

/** Lotte's closed hand around the cent, close; the camera drifts in slowly (the wordless peak). */
export const Hand: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Push t={t} from={1} to={1.18} ox={1000} oy={560}>
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="hand-lamp" cx="0.5" cy="0.45" r="0.7">
          <stop offset="0" stopColor="#5a4632" />
          <stop offset="1" stopColor="#120e10" />
        </radialGradient>
      </defs>
      <rect width={1920} height={1080} fill="url(#hand-lamp)" />
      <g transform="translate(1000 600)">
        <path d="M-420 260 C-300 120 -220 40 -120 20 L180 -40 C260 -60 300 -10 280 40 L240 160 C200 260 60 300 -120 300Z"
          fill={LOTTE.head} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${-60 + i * 70} ${-10 - i * 8} q40 -60 90 -20 q20 40 -10 80`} fill={LOTTE.head} stroke={INK} strokeWidth={9} />
        ))}
        <circle cx={60} cy={30} r={26} fill={MUSTARD} stroke={INK} strokeWidth={6} opacity={0.85} />
      </g>
    </svg>
  </Push>
);

/** The end card: like, subscribe and comment tags in the left two-thirds; the right third quiet (YouTube's end screens). */
export const EndCard: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Push t={t} from={1} to={1.04} ox={500} oy={540}>
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="end-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9d9b8" />
          <stop offset="1" stopColor="#c9a87a" />
        </linearGradient>
      </defs>
      <rect width={1920} height={1080} fill="url(#end-sky)" />
      <rect x={0} y={880} width={1920} height={200} fill="#a8774f" />
      <Figure x={520} y={1100} scale={2.2} pose={{ ...STAND, armF: [40, 30], armB: [-12, 14] }} {...HERO} {...EXPRESSIONS.happy}
        time={t.f / 30} look={{ x: 0.6, y: 0.2 }} />
    </svg>
  </Push>
);
