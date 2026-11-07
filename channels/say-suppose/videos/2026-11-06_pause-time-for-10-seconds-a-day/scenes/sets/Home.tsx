import { Layer, type Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";

/** Your family's living room: a floor lamp on the left, a sofa, a framed photo, and a wooden staircase rising to the
 *  right to a landing. World units; actors on the floor stand at FLOOR_Y at scale 1. Lit by the `lamp` mood: add
 *  a glow at the lamp's screen position (toScreen(cam, LAMP.x, LAMP.y)) for the warm pool. */
export const FLOOR_Y = 880;
export const LAMP = { x: 420, y: 470 };
export const SOFA = { from: 600, to: 1020, seat: 760 };
/** Stairs: STEPS steps of STEP_W by STEP_H rising to the right from STAIR_X at the floor to the landing. */
export const STAIR_X = 1240;
export const STEP_W = 64;
export const STEP_H = 46;
export const STEPS = 10;
export const LANDING_Y = FLOOR_Y - STEPS * STEP_H;

/** The middle of the top of step n (1 = the bottom step, STEPS = the landing edge); 0 is the floor at the foot. */
export const stepTop = (n: number) => ({ x: STAIR_X + (n - 0.5) * STEP_W, y: FLOOR_Y - n * STEP_H });

export const HomeBack: React.FC<{ cam: Camera; lampOn?: boolean }> = ({ cam, lampOn = true }) => {
  const stairs = Array.from({ length: STEPS }, (_, i) => i + 1);
  return (
    <>
      <Layer cam={cam} depth={0.85}>
        <rect x={-800} y={-400} width={3800} height={1300} fill="#c98f6b" />
        <rect x={-800} y={140} width={3800} height={14} fill="#a8704f" />
        {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-760 + i * 128} y={160} width={6} height={720} fill="#b97f5d" opacity={0.5} />)}
        <rect x={60} y={260} width={300} height={260} rx={8} fill="#2a3352" stroke={INK} strokeWidth={10} />
        <path d="M60 390 H360 M210 260 V520" stroke={INK} strokeWidth={8} />
        <circle cx={290} cy={320} r={18} fill="#fff1b8" opacity={0.85} />
        <rect x={720} y={300} width={180} height={140} rx={6} fill="#f3e9d7" stroke={INK} strokeWidth={8} />
        <circle cx={785} cy={360} r={20} fill="#e0a070" /><circle cx={840} cy={366} r={16} fill="#f2b632" />
        <path d="M750 430 Q785 395 815 430 M815 430 Q840 400 870 430" fill="none" stroke={INK} strokeWidth={6} />
      </Layer>
      <Layer cam={cam} depth={1}>
        <rect x={-800} y={FLOOR_Y} width={3800} height={500} fill="#7a4e32" />
        <rect x={-800} y={FLOOR_Y} width={3800} height={12} fill="#5b3822" />
        <ellipse cx={820} cy={FLOOR_Y + 40} rx={380} ry={34} fill="#9c3b4a" opacity={0.8} />
        <path d={`M${STAIR_X} ${FLOOR_Y} ${stairs.map((n) => `V${FLOOR_Y - n * STEP_H} H${STAIR_X + n * STEP_W}`).join(" ")} H2600 V${FLOOR_Y} Z`} fill="#8a5c3b" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {stairs.map((n) => <rect key={n} x={STAIR_X + (n - 1) * STEP_W} y={FLOOR_Y - n * STEP_H} width={STEP_W + 6} height={9} fill="#b07a4f" />)}
        <rect x={STAIR_X + STEPS * STEP_W} y={LANDING_Y} width={1000} height={9} fill="#b07a4f" />
        <line x1={STAIR_X + 20} y1={FLOOR_Y - 150} x2={STAIR_X + STEPS * STEP_W + 20} y2={LANDING_Y - 150} stroke={INK} strokeWidth={10} strokeLinecap="round" />
        {stairs.filter((n) => n % 2 === 1).map((n) => (
          <line key={n} x1={STAIR_X + (n - 0.5) * STEP_W} y1={FLOOR_Y - n * STEP_H} x2={STAIR_X + (n - 0.5) * STEP_W + 20} y2={FLOOR_Y - n * STEP_H - 150} stroke={INK} strokeWidth={6} />
        ))}
        <rect x={SOFA.from} y={SOFA.seat - 120} width={SOFA.to - SOFA.from} height={110} rx={30} fill="#3d6f73" />
        <rect x={SOFA.from - 30} y={SOFA.seat - 40} width={SOFA.to - SOFA.from + 60} height={110} rx={24} fill="#4b8186" />
        <rect x={SOFA.from - 10} y={SOFA.seat + 60} width={26} height={60} fill="#3a2a20" />
        <rect x={SOFA.to - 16} y={SOFA.seat + 60} width={26} height={60} fill="#3a2a20" />
        <line x1={LAMP.x} y1={LAMP.y + 40} x2={LAMP.x} y2={FLOOR_Y - 4} stroke={INK} strokeWidth={8} />
        <ellipse cx={LAMP.x} cy={FLOOR_Y - 4} rx={46} ry={10} fill={INK} />
        <path d={`M${LAMP.x - 70} ${LAMP.y + 50} L${LAMP.x - 42} ${LAMP.y - 40} H${LAMP.x + 42} L${LAMP.x + 70} ${LAMP.y + 50}Z`} fill={lampOn ? "#ffd27a" : "#b08a52"} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {lampOn && <polygon points={`${LAMP.x - 70},${LAMP.y + 50} ${LAMP.x + 70},${LAMP.y + 50} ${LAMP.x + 260},${FLOOR_Y} ${LAMP.x - 260},${FLOOR_Y}`} fill="#fff0b0" opacity={0.18} />}
      </Layer>
    </>
  );
};
