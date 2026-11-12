// Places for the AI-texts first cut: library sets (kitchen, bus, office desk, bedroom, street, canteen, rooftop, city
// skyline) with the film's cast on their spots, a slow push so every shot moves, and an optional screen-space overlay
// (a phone, a paper drawing) drawn over the set. Everything is drawn in code; no AI images.
import { AbsoluteFill } from "remotion";
import { SetScene } from "@whatif/kit/sets/SetScene";
import type { CastMember, SetDef } from "@whatif/kit/sets/common";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { MoodName } from "@whatif/kit/stage/moods";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { HandPhone } from "@whatif/kit/sets/props";
import { CRIMSON, MUSTARD, TEAL } from "@whatif/kit/theme";
import { Push, type ShotTime } from "./util";

/** The cast (channels/say-suppose/cast.md; packaging.md, Cast). Roles, not names. */
export const YOU = { head: MUSTARD, scarf: TEAL, tuft: true } as const;
export const MOTHER = { head: "#c9b2e0", coat: "#7a6a8c" } as const;
export const BEST = { head: "#f4b8c8", coat: "#3d4a66" } as const;
export const FATHER = { head: "#a8c99a", coat: "#4a6a8a" } as const;
export const AUNT1 = { head: "#a8dcc4", coat: "#6b8a7a" } as const;
export const AUNT2 = { head: "#f6c09a", coat: "#8a6b5a" } as const;
export const MAN = { head: "#9fd3e6", coat: "#3b4a6b" } as const;
export const COUSIN = { head: "#d6b8ec", coat: "#5a4a7a" } as const;
export const BOSS = { head: "#8fa6c4", coat: "#2f3242", tie: CRIMSON } as const;
export const COWORKER = { head: "#8fb8b4", coat: "#4a5a5a" } as const;
export const KID = { head: "#e6c08a", coat: "#c96f2d", cap: "#3d6fb0" } as const;
export const STRANGER = { head: "#D8344F", coat: "#3f3346" } as const;

export type Face = keyof typeof EXPRESSIONS;

/** Someone on a spot: who, a named face, a pose, and a phone in the front hand. */
export const on = (spot: string, who: CastMember["who"], face: Face = "neutral", extra: Partial<CastMember> & { phone?: boolean } = {}): CastMember => {
  const { phone, ...rest } = extra;
  return { spot, who: phone ? { ...who, held: <HandPhone scale={1.2} /> } : who, face: EXPRESSIONS[face], ...rest };
};

/** A library set on the stage with a push-in, then any screen-space overlay (SVG) and HTML on top. */
export function Place<O extends object>({ t, set, mood, cam, cast = [], options, overlay, html, push = [1, 1.05], dim = 0 }: {
  t: ShotTime; set: SetDef<O>; mood: MoodName; cam?: Camera | keyof SetDef<O>["cameras"]; cast?: CastMember[];
  options?: Partial<O>; overlay?: React.ReactNode; html?: React.ReactNode; push?: [number, number]; dim?: number;
}) {
  const camera = typeof cam === "string" ? set.cameras[cam] : cam;
  return (
    <AbsoluteFill>
      <Push t={t} from={push[0]} to={push[1]}>
        <AbsoluteFill>
          <SetScene set={set} mood={mood} frame={t.f} cam={camera} options={options} cast={cast} />
        </AbsoluteFill>
      </Push>
      {dim > 0 && <AbsoluteFill style={{ background: "#05060a", opacity: dim }} />}
      {overlay && (
        <AbsoluteFill>
          <svg width={1920} height={1080} viewBox="0 0 1920 1080">{overlay}</svg>
        </AbsoluteFill>
      )}
      {html}
    </AbsoluteFill>
  );
}
