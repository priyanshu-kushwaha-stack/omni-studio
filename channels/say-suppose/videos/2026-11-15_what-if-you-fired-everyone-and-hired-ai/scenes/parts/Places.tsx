// Places for the fired-everyone first cut (adapted from the AI-texts film's parts/Places.tsx): a set on the kit's
// Stage with a slow push so every shot moves, the cast on its spots (`on(spot, who, face)`, drawn with their `wear`),
// steel machines on spots (`steelOn(spot, ...)`), and an optional screen-space overlay (SVG) and HTML on top. Ready
// shots for this film's own sets: <DinerShot> and <PaintShopShot>. Library sets work the same through <Place>.
import { AbsoluteFill } from "remotion";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { poseFor, setLook, type CastMember, type SetDef } from "@whatif/kit/sets/common";
import { LookContext, type Look } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { diner, type DinerOptions } from "../sets/Diner";
import { paintShop, type PaintShopOptions } from "../sets/PaintShop";
import type { Person, WearItem } from "./Cast";
import { SmallAppPhone } from "./Props";
import { Robot, type RobotProps } from "./Robot";
import { Push, type ShotTime } from "./util";
import { Dressed } from "./Wear";

export type Face = keyof typeof EXPRESSIONS;

/** A cast member on a spot (the kit's CastMember) plus what they wear and a nudge off the spot (world units). */
export interface Member extends CastMember {
  wear?: WearItem[];
  dx?: number;
  dy?: number;
}

/** Someone on a spot: who (a Person from Cast.ts), a named face, and extras: `pose`, `behind` (behind the set's Mid:
 *  the counter, the railing), `phone` (the app phone in the front hand), `held` (anything in the front hand), `look`,
 *  `facing`, `dx`/`dy` to nudge them off the spot. */
export const on = (
  spot: string, who: Person, face: Face = "neutral",
  extra: { pose?: Pose; behind?: boolean; phone?: boolean; held?: React.ReactNode; look?: { x: number; y: number }; facing?: 1 | -1; dx?: number; dy?: number } = {},
): Member => {
  const { phone, held, look, facing, pose, behind, dx, dy } = extra;
  const { wear, ...fig } = who;
  const expr = EXPRESSIONS[face] as CastMember["face"];
  return {
    spot, face: expr, pose, behind, dx, dy, wear,
    who: { ...fig, ...(look ? { look } : expr?.look ? { look: expr.look } : {}), ...(facing ? { facing } : {}), ...(phone ? { held: <SmallAppPhone s={1.3} /> } : held ? { held } : {}) },
  };
};

/** A steel machine on a spot: Robot props (held, flip, cap, role, pose...), `behind` to stand behind the Mid. A seat
 *  spot sits it down (SEATED) unless a pose is given. */
export interface SteelMember extends Partial<RobotProps> { spot: string; behind?: boolean; dx?: number; dy?: number }
export const steelOn = (spot: string, props: Partial<RobotProps> & { behind?: boolean; dx?: number; dy?: number } = {}): SteelMember => ({ spot, ...props });

function spotOf(set: Pick<SetDef, "name" | "spots">, spot: string) {
  const s = set.spots[spot];
  if (!s) throw new Error(`set ${set.name} has no spot ${JSON.stringify(spot)}: ${Object.keys(set.spots).join(", ")}`);
  return s;
}

const Person_: React.FC<{ set: Pick<SetDef, "name" | "spots">; m: Member; time: number }> = ({ set, m, time }) => {
  const s = spotOf(set, m.spot);
  return (
    <Dressed x={s.x + (m.dx ?? 0)} y={s.y + (m.dy ?? 0)} scale={s.scale} facing={s.facing} pose={m.pose ?? poseFor(s)} time={time}
      {...m.face} {...m.who} wear={m.wear} />
  );
};

const Steel: React.FC<{ set: Pick<SetDef, "name" | "spots">; m: SteelMember; frame: number }> = ({ set, m, frame }) => {
  const s = spotOf(set, m.spot);
  const { spot: _spot, behind: _behind, dx = 0, dy = 0, ...rest } = m;
  return <Robot x={s.x + dx} y={s.y + dy} scale={s.scale} facing={s.facing} pose={s.sit ? SEATED : STAND} frame={frame} {...rest} />;
};

/** The kit's SetScene, with this film's people (wear) and steel machines on spots. Draw order: the set's Back, the
 *  `behind` cast and steel, the set's Mid, the rest of the cast and steel, `actors`, the set's Front. */
export function SetStage<O extends object>({ set, mood, frame = 0, cam, options, cast = [], steel = [], look, actors, radius = 0 }: {
  set: SetDef<O>; mood: MoodName; frame?: number; cam?: Camera; options?: Partial<O>; cast?: Member[]; steel?: SteelMember[];
  look?: Partial<Look>; actors?: React.ReactNode; radius?: number;
}) {
  const camera = cam ?? set.cameras.wide;
  const props = { cam: camera, mood, frame, options: { ...set.defaults, ...options } as O };
  return (
    <LookContext.Provider value={setLook(set.lights(props.options), mood, camera, look)}>
      <Stage cam={camera} radius={radius} origin={{ x: 960, y: 540 }}
        back={set.Back(props)}
        actors={
          <>
            {steel.filter((m) => m.behind).map((m, i) => <Steel key={`sb${i}`} set={set} m={m} frame={frame} />)}
            {cast.filter((m) => m.behind).map((m, i) => <Person_ key={`b${i}`} set={set} m={m} time={frame} />)}
            {set.Mid?.(props)}
            {steel.filter((m) => !m.behind).map((m, i) => <Steel key={`sf${i}`} set={set} m={m} frame={frame} />)}
            {cast.filter((m) => !m.behind).map((m, i) => <Person_ key={`f${i}`} set={set} m={m} time={frame} />)}
            {actors}
          </>
        }
        front={set.Front?.(props)} />
    </LookContext.Provider>
  );
}

export interface PlaceProps<O extends object> {
  t: ShotTime;
  set: SetDef<O>;
  mood: MoodName;
  /** A camera, or the name of one of the set's cameras. */
  cam?: Camera | string;
  cast?: Member[];
  steel?: SteelMember[];
  options?: Partial<O>;
  /** Screen-space SVG (1920 x 1080) over the set: a paper drawing, an insert. */
  overlay?: React.ReactNode;
  /** HTML over everything: tags, bubbles. */
  html?: React.ReactNode;
  /** The push-in over the shot, from and to (1 is no zoom). */
  push?: [number, number];
  /** Where the push zooms toward, in screen pixels. */
  pushAt?: { x: number; y: number };
  /** Darken the set under an overlay, 0..1. */
  dim?: number;
  look?: Partial<Look>;
  /** World-space extras in the actors' slot (drawn last). */
  actors?: React.ReactNode;
}

/** A set on the stage with a push-in, then any screen-space overlay (SVG) and HTML on top. */
export function Place<O extends object>({ t, set, mood, cam, cast = [], steel = [], options, overlay, html, push = [1, 1.05], pushAt, dim = 0, look, actors }: PlaceProps<O>) {
  const camera = typeof cam === "string" ? set.cameras[cam] : cam;
  if (typeof cam === "string" && !camera) throw new Error(`set ${set.name} has no camera ${cam}: ${Object.keys(set.cameras).join(", ")}`);
  return (
    <AbsoluteFill>
      <Push t={t} from={push[0]} to={push[1]} ox={pushAt?.x ?? 960} oy={pushAt?.y ?? 540}>
        <AbsoluteFill>
          <SetStage set={set} mood={mood} frame={t.f} cam={camera} options={options} cast={cast} steel={steel} look={look} actors={actors} />
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

type DinerCam = keyof typeof diner.cameras;

/** The diner, ready to shoot. Shorthands for the common switches (`robots`, `grill`, `plates`, `lamps`, `clock`,
 *  `crowd`, `gate`); anything else in `options`. */
export const DinerShot: React.FC<Omit<PlaceProps<DinerOptions>, "set" | "cam"> & {
  cam?: DinerCam | Camera; robots?: number; grill?: DinerOptions["grill"]; plates?: DinerOptions["plates"]; lamps?: DinerOptions["lamps"];
  clock?: number; crowd?: number; gate?: number;
}> = ({ cam = "wide", robots, grill, plates, lamps, clock, crowd, gate, options, ...rest }) => {
  const o: Partial<DinerOptions> = { ...options };
  if (robots !== undefined) o.robots = robots;
  if (grill !== undefined) o.grill = grill;
  if (plates !== undefined) o.plates = plates;
  if (lamps !== undefined) o.lamps = lamps;
  if (clock !== undefined) o.clock = clock;
  if (crowd !== undefined) o.crowd = crowd;
  if (gate !== undefined) o.gate = gate;
  return <Place set={diner} cam={cam} options={o} {...rest} />;
};

type PaintCam = keyof typeof paintShop.cameras;

/** The paint shop, ready to shoot: `painters` human or robot (and how many of the four near stations), `speed` of the
 *  line, `spray` on. */
export const PaintShopShot: React.FC<Omit<PlaceProps<PaintShopOptions>, "set" | "cam"> & {
  cam?: PaintCam | Camera; painters?: PaintShopOptions["painters"]; count?: number; speed?: number; spray?: number;
}> = ({ cam = "wide", painters, count, speed, spray, options, ...rest }) => {
  const o: Partial<PaintShopOptions> = { ...options };
  if (painters !== undefined) o.painters = painters;
  if (count !== undefined) o.count = count;
  if (speed !== undefined) o.speed = speed;
  if (spray !== undefined) o.spray = spray;
  return <Place set={paintShop} cam={cam} options={o} {...rest} />;
};
