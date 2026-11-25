// The evening studio of the rival and the polygraph (Rival.tsx, Polygraph.tsx), look C: the painted tv-night plate (a
// spotlit floor, two bar stools, a city backdrop, light stands) with the code puppets on its floor, and one code prop
// the story needs: the rival's monitor on a rolling stand, showing his thermal picture or the debate's CLOSING clock.
// World coordinates as the plate (REF 1920 x 1080). No AI images.
import { AbsoluteFill } from "remotion";
import type { SetLight } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { PlateScene } from "./Plate";
import { ThermalFace } from "./RivalParts";

/** The painted floor under the stools, the stools' seat tops and centres, and the scale of a person there. */
export const FLOOR = 1037;
export const SEAT_TOP = 735;
export const STOOL = { left: 776, right: 1158 };
export const S = 2.3;
/** The monitor's picture, on its stand at the left of the floor. */
export const MONITOR = { x: 110, y: 300, w: 330, h: 210 };

export type ScreenShow = { thermal: "you" | "rival" | "leader"; nose: string } | { closing: number };

/** The debate's rule on the monitor: a CLOSING clock, its crimson wedge sweeping down as `sweep` runs 0 to 1. */
const ClosingClock: React.FC<{ sweep: number }> = ({ sweep }) => {
  const { x, y, w, h } = MONITOR;
  const cx = x + h * 0.5, cy = y + h / 2, r = h * 0.36;
  const a = (1 - sweep * 0.75) * Math.PI * 2;
  const end = { x: cx + Math.sin(a) * r, y: cy - Math.cos(a) * r };
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#1b2240" />
      <circle cx={cx} cy={cy} r={r + 6} fill={PAPER} stroke={INK} strokeWidth={3} />
      <path d={`M${cx} ${cy} L${cx} ${cy - r} A${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${end.x} ${end.y}Z`} fill={CRIMSON} />
      <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <text x={x + w * 0.68} y={cy + 9} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={PAPER} letterSpacing={1}>CLOSING</text>
    </g>
  );
};

/** The monitor on its rolling stand, its picture lit. */
const Monitor: React.FC<{ show: ScreenShow; frame: number }> = ({ show, frame }) => {
  const { x, y, w, h } = MONITOR;
  const cx = x + w / 2;
  return (
    <g>
      <rect x={cx - 9} y={y + h} width={18} height={FLOOR - y - h - 20} fill="#2a2d36" />
      <path d={`M${cx - 90} ${FLOOR - 14} H${cx + 90}`} stroke="#2a2d36" strokeWidth={14} strokeLinecap="round" />
      {[-80, 80].map((d) => <circle key={d} cx={cx + d} cy={FLOOR - 4} r={10} fill={INK} />)}
      <rect x={x - 16} y={y - 16} width={w + 32} height={h + 32} rx={12} fill="#15161c" stroke={INK} strokeWidth={4} />
      {"thermal" in show
        ? <ThermalFace x={x} y={y} w={w} h={h} who={show.thermal} nose={show.nose} frame={frame} id="studio" />
        : <ClosingClock sweep={show.closing} />}
      <circle cx={x + w - 4} cy={y + h + 8} r={4} fill={CRIMSON} />
    </g>
  );
};

/** The monitor's light on the floor around it (world units, for `lights`). */
const monitorLight = (show: ScreenShow): SetLight => ({
  x: MONITOR.x + MONITOR.w / 2, y: MONITOR.y + MONITOR.h / 2, r: 300, strength: 0.22,
  color: "thermal" in show ? "#ff7a3a" : "#8fa6ff", moods: ["night", "lamp", "dusk", "day", "morning", "frozen"],
});

export const RivalStudio: React.FC<{
  cam: Camera; mood: MoodName; frame: number; show: ScreenShow; actors: React.ReactNode; front?: React.ReactNode;
  lights?: SetLight[]; over?: React.ReactNode;
}> = ({ cam, mood, frame, show, actors, front, lights = [], over }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <PlateScene plate="tv-night" cam={cam} mood={mood} rim="warm" rimFrom="left" lights={[monitorLight(show), ...lights]}
      behind={<Monitor show={show} frame={frame} />} actors={actors} front={front} />
    {over}
  </AbsoluteFill>
);
