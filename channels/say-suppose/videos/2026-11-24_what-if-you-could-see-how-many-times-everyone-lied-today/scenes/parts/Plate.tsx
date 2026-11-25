// Look C (owner, 2026-11-25: "C: painted room, our cast"): a painted background plate behind the code puppets, the way
// Ifverse films read as more than flat 2D (look-study-ifverse.md). Plates are empty rooms made on this Mac with FLUX.2
// klein (renders/plates/plates.sh, copied to assets/plates/); the characters, counters and props stay code.
//
// PlateScene is a set: the plate fills the REF frame (1920x1080 world units, overscanned by `over` so a camera can pan),
// moves with the camera like the actors' plane, and goes soft as the camera closes in (depth of field: a close-up sits
// against a blurred room). The actors get the warm rim light and the mood's grade from the Stage.
import { staticFile } from "remotion";
import { setLook, type SetLight } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";

export type PlateName =
  | "meeting-lamp" | "meeting-morning" | "kitchen-morning" | "kitchen-lamp" | "hallway-morning" | "street-day"
  | "bus-interior" | "office-floor" | "boss-office" | "garage" | "restaurant-dusk" | "party-night" | "tv-morning"
  | "stadium-night" | "canteen" | "lift-lobby" | "tv-night" | "debate-night";

/** Screen-pixel blur of the plate for a camera: sharp at a wide shot, soft in a medium shot, very soft in a close-up. */
export function plateBlur(zoom: number, focus = 1.3): number {
  return Math.max(0, Math.min(22, (zoom - focus) * 7));
}

/** Rim light for look C: a warm edge on the side toward the light (dx < 0 lit from the left). */
export const RIM: Record<"warm" | "cool", string> = { warm: "#ffae5c", cool: "#a9d4ff" };

export const PlateBack: React.FC<{ name: PlateName; cam: Camera; over?: number; blur?: number; flip?: boolean; dim?: number;
  shift?: { x: number; y: number } }> = ({ name, cam, over = 1.25, blur, flip, dim = 1, shift = { x: 0, y: 0 } }) => {
  const w = 1920 * over;
  const h = 1080 * over;
  const px = blur ?? plateBlur(cam.zoom);
  const sd = Math.round((px / cam.zoom) * 4) / 4;
  const id = `plate-blur-${Math.round(sd * 4)}`;
  return (
    <g>
      {sd > 0 && (
        <defs>
          <filter id={id} x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={sd} /></filter>
        </defs>
      )}
      <g transform={flip ? "translate(1920 0) scale(-1 1)" : undefined} filter={sd > 0 ? `url(#${id})` : undefined}>
        <image href={staticFile(`plates/${name}.png`)} x={960 - w / 2 + shift.x} y={540 - h / 2 + shift.y} width={w} height={h}
          preserveAspectRatio="xMidYMid slice" style={{ filter: dim !== 1 ? `brightness(${dim})` : undefined }} />
      </g>
    </g>
  );
};

/** A plate as the Stage's back, with the actors (and optional front layer) over it, lit by the mood. */
export const PlateScene: React.FC<{
  plate: PlateName; cam: Camera; mood: MoodName; lights?: SetLight[]; rim?: "warm" | "cool"; rimFrom?: "left" | "right";
  over?: number; blur?: number; flip?: boolean; dim?: number; shift?: { x: number; y: number };
  behind?: React.ReactNode; actors?: React.ReactNode; front?: React.ReactNode;
}> = ({ plate, cam, mood, lights = [], rim = "warm", rimFrom = "left", over, blur, flip, dim, shift, behind, actors, front }) => {
  const look = setLook(lights, mood, cam, {
    rim: { color: RIM[rim], dx: rimFrom === "left" ? -7 : 7, dy: -3 },
    // the plate is already painted in its light: grade it lightly, and let the actors take a little more of the mood
    grade: undefined, actorGrade: 0.15, dof: 0, vignette: 0.42,
  });
  return (
    <LookContext.Provider value={look}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={<PlateBack name={plate} cam={cam} over={over} blur={blur} flip={flip} dim={dim} shift={shift} />}
        actors={<>{behind}{actors}</>} front={front} />
    </LookContext.Provider>
  );
};
