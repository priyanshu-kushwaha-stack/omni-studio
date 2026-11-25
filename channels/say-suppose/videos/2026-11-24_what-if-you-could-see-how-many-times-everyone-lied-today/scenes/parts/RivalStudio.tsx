// The evening studio of the rival and the polygraph (Rival.tsx, Polygraph.tsx): the library's tv-studio (its back wall,
// glass and light rig) with the big screen showing the rival's thermal picture, and the people placed on the studio
// floor by the beats. World coordinates as the set (REF). No AI images.
import { AbsoluteFill } from "remotion";
import { Deep, setLook, tvStudio, type TvStudioOptions } from "@whatif/kit/sets";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { ThermalFace } from "./RivalParts";

/** The debate's rule on the big screen: a CLOSING clock, its crimson wedge sweeping down as `sweep` runs 0 to 1. */
const ClosingClock: React.FC<{ sweep: number }> = ({ sweep }) => {
  const cx = PIC.x + 190, cy = PIC.y + PIC.h / 2, r = 130;
  const a = (1 - sweep * 0.75) * Math.PI * 2;
  const end = { x: cx + Math.sin(a) * r, y: cy - Math.cos(a) * r };
  return (
    <g>
      <rect x={PIC.x} y={PIC.y} width={PIC.w} height={PIC.h} fill="#1b2240" />
      <circle cx={cx} cy={cy} r={r + 12} fill={PAPER} stroke={INK} strokeWidth={6} />
      <path d={`M${cx} ${cy} L${cx} ${cy - r} A${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${end.x} ${end.y}Z`} fill={CRIMSON} />
      <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={10} fill={INK} />
      <text x={PIC.x + 560} y={cy + 30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={86} fill={PAPER} letterSpacing={4}>CLOSING</text>
    </g>
  );
};

export const FLOOR = 980;
/** The big screen's picture area (tv-studio SCREEN less its crimson band). */
const PIC = { x: 510, y: 130, w: 900, h: 344 };

export type ScreenShow = { thermal: "you" | "rival" | "leader"; nose: string } | { tv: TvStudioOptions["screen"] } | { closing: number };

export const RivalStudio: React.FC<{ cam: Camera; mood: MoodName; frame: number; show: ScreenShow; actors: React.ReactNode; over?: React.ReactNode }> = ({
  cam, mood, frame, show, actors, over,
}) => {
  const o: TvStudioOptions = { ...tvStudio.defaults, screen: "tv" in show ? show.tv : "face", live: true };
  const p = { cam, mood, frame, options: o };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <LookContext.Provider value={setLook(tvStudio.lights(o), mood, cam)}>
        <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
          back={
            <>
              {tvStudio.Back(p)}
              {"thermal" in show && (
                <Deep cam={cam} depth={0.9}>
                  <ThermalFace x={PIC.x} y={PIC.y} w={PIC.w} h={PIC.h} who={show.thermal} nose={show.nose} frame={frame} id="studio" />
                </Deep>
              )}
              {"closing" in show && (
                <Deep cam={cam} depth={0.9}>
                  <ClosingClock sweep={show.closing} />
                </Deep>
              )}
            </>
          }
          actors={actors} />
      </LookContext.Provider>
      {over}
    </AbsoluteFill>
  );
};
