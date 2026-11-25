// Where the SayItAgain beat's people stand on its look C plates (owner, 2026-11-25: painted rooms, our cast), and the
// few props the action needs. `garage`: the car is painted up on the lift, the open door behind it, eye line at world
// y 450; garage two is the same plate flipped (positions mirror at x 1920 - x). `restaurant-dusk`: two small round
// tables with candles and glasses painted, chairs painted round them; the diners sit in those chairs and lose what the
// table hides (Cut). No AI characters; no words on the walls.
import { STAND } from "@whatif/kit/rig/pose";
import { INK } from "@whatif/kit/theme";
import { pw, scaleAt } from "../parts/SayItAgain.LookC";

const GH = 450;
export const GARAGE = {
  mech: { x: 900, y: 960, scale: scaleAt(960, GH), pose: STAND },
  you: { x: 420, y: 1050, scale: scaleAt(1050, GH) },
};

/** Seat tops and scales for the four diners, and the table edges that hide their laps (world units). */
export const DINER = {
  you: { x: 70, seat: 943, scale: 2.0 },
  date: { x: 416, seat: 865, scale: 1.7, cut: { y: 790, x: [30, 500] as [number, number] } },
  woman: { x: 1487, seat: 865, scale: 1.6, cut: { y: 800, x: [1440, 1900] as [number, number] } },
  man: { x: 1840, seat: 959, scale: 2.0 },
  phone: pw(300, 586),
};

export const Rag: React.FC = () => <rect x={-14} y={-10} width={30} height={22} rx={4} fill="#d8344f" stroke={INK} strokeWidth={3} />;
export const Wallet: React.FC = () => <rect x={-16} y={-12} width={32} height={24} rx={4} fill="#6b4b3a" stroke={INK} strokeWidth={3} />;

export const WineGlass: React.FC = () => (
  <g>
    <path d="M-14 -46 h28 q0 30 -14 36 q-14 -6 -14 -36Z" fill="#e9f3f4" opacity={0.85} stroke={INK} strokeWidth={3} />
    <path d="M-10 -34 h20 q-2 16 -10 20 q-8 -4 -10 -20Z" fill="#9b2335" />
    <line x1={0} y1={-10} x2={0} y2={12} stroke={INK} strokeWidth={3} />
  </g>
);

/** Your phone lying face up on the tablecloth, his photo lit. */
export const TablePhone: React.FC = () => (
  <g transform={`translate(${DINER.phone.x} ${DINER.phone.y})`}>
    <path d="M-40 0 L-30 -14 H40 L30 0Z" fill="#1b1d24" />
    <path d="M-34 -2 L-27 -12 H34 L27 -2Z" fill="#cfe9f4" />
  </g>
);
