// Close on the phone in your hand: the lock screen's coin (the rule device: at midnight it tears into two coins) and
// a split-flap counter, DAY on the left, BALANCE on the right. Modes: the doubling night by night, a countdown to
// zero, the one-cent refund, the still coin at midnight. Screen pixels; the room behind is a soft wash in the mood.
import { FONT } from "@whatif/kit/fonts";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { balanceOn, ease, euros, mix, Push, ramp, type ShotTime } from "./util";

const BACK: Record<string, [string, string]> = {
  morning: ["#e9d9b8", "#c9a87a"], day: ["#d9d4c4", "#a9a493"], dusk: ["#c99a8e", "#4a5a8c"],
  night: ["#1c2238", "#0b0e18"], lamp: ["#4a3a2c", "#141018"],
};

const Flap: React.FC<{ x: number; y: number; w: number; text: string; size?: number }> = ({ x, y, w, text, size = 64 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={0} width={w} height={size * 1.5} rx={12} fill={INK} stroke={PAPER} strokeWidth={4} />
    <line x1={0} y1={size * 0.75} x2={w} y2={size * 0.75} stroke="#0d0e12" strokeWidth={4} />
    <text x={w / 2} y={size * 1.12} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={PAPER}>{text}</text>
  </g>
);

/** The coin icon; `tear` 0..1 splits it into two coins. */
const CoinIcon: React.FC<{ x: number; y: number; tear: number; dim?: boolean }> = ({ x, y, tear, dim }) => {
  const d = ease(tear) * 70;
  const coin = (dx: number, clip?: "l" | "r") => (
    <g transform={`translate(${dx} 0)`}>
      <circle r={60} fill={dim ? "#8a7a50" : MUSTARD} stroke={INK} strokeWidth={6} clipPath={clip ? `url(#half-${clip})` : undefined} />
      <text y={22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} fill={INK}>€</text>
    </g>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id="half-l"><rect x={-70} y={-70} width={70} height={140} /></clipPath>
        <clipPath id="half-r"><rect x={0} y={-70} width={70} height={140} /></clipPath>
      </defs>
      {tear < 0.02 ? coin(0) : <>{coin(-d)}{coin(d)}</>}
    </g>
  );
};

export interface PhoneCloseProps {
  mood: string;
  mode: "double" | "countdown" | "refund" | "still";
  days?: [number, number];
  cents?: [number, number];
}

export const PhoneClose: React.FC<{ t: ShotTime } & PhoneCloseProps> = ({ t, mood, mode, days = [2, 3], cents = [0, 0] }) => {
  const [a, b] = BACK[mood] ?? BACK.day;
  const nights = days[1] - days[0];
  // The doubling: one midnight per stretch of the shot; the coin tears as the flap turns.
  const step = nights > 0 ? Math.min(nights, Math.floor(t.p * nights * 1.1)) : 0;
  const local = nights > 0 ? (t.p * nights * 1.1) % 1 : 0;
  const tear = mode === "double" ? ramp(local, 0.55, 0.85) : 0;
  let day = days[0] + step;
  let bal = balanceOn(day);
  if (mode === "countdown") {
    const k = ease(ramp(t.f, 10, t.dur - 20));
    const v = Math.round(mix(cents[0], cents[1], k));
    bal = euros(v);
    day = days[0];
  }
  if (mode === "refund") bal = t.p < 0.3 ? "0,00" : "0,01";
  if (mode === "still") bal = "0,00";
  const buzz = mode === "refund" && t.p > 0.25 && t.p < 0.45 ? Math.sin(t.f * 2.6) * 6 : 0;
  return (
    <Push t={t} from={1} to={mode === "still" ? 1.12 : 1.05}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="pc-bg" cx="0.5" cy="0.45" r="0.75">
            <stop offset="0" stopColor={a} />
            <stop offset="1" stopColor={b} />
          </radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#pc-bg)" />
        <g transform={`translate(${960 + buzz} 560) rotate(-4)`}>
          <path d="M-330 470 C-360 200 -300 60 -250 40 L250 40 C300 60 360 200 330 470Z" fill={MUSTARD} opacity={0.0} />
          <rect x={-270} y={-470} width={540} height={980} rx={64} fill="#0d0e14" />
          <rect x={-246} y={-446} width={492} height={932} rx={48} fill={mood === "night" || mood === "lamp" ? "#1a2a30" : "#e9f6f2"} />
          <rect x={-246} y={-446} width={492} height={932} rx={48} fill={TEAL} opacity={0.15} />
          <CoinIcon x={0} y={-230} tear={tear} dim={mode === "still"} />
          <Flap x={-210} y={-60} w={150} text={`${day}`} size={64} />
          <Flap x={-40} y={-60} w={250} text={bal.length > 9 ? "···" : bal} size={bal.length > 6 ? 46 : 64} />
          {bal.length > 9 && (
            <text x={0} y={190} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={Math.min(60, 760 / bal.length)} fill={mood === "night" || mood === "lamp" ? PAPER : INK}>{bal} €</text>
          )}
          <text x={-135} y={100} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill={INK} opacity={0.6}>DAY</text>
          <text x={85} y={100} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill={INK} opacity={0.6}>€</text>
          {mode === "refund" && t.p > 0.25 && (
            <g transform={`translate(0 ${mix(-500, -360, ramp(t.p, 0.25, 0.35))})`}>
              <rect x={-220} y={-50} width={440} height={100} rx={22} fill={PAPER} stroke={INK} strokeWidth={4} />
              <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={36} fill={INK}>Refund · 0,01 €</text>
            </g>
          )}
        </g>
      </svg>
    </Push>
  );
};
