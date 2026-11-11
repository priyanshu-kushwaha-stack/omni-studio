import { Figure } from "../rig/Figure";
import { LookContext } from "../stage/Look";
import type { MoodName } from "../stage/moods";
import { Stage, type Camera } from "../stage/Stage";
import { poseFor, setLook, type CastMember, type SetDef } from "./common";

/** One cast member on their spot. A spot that does not exist throws, so a typo fails loudly. */
export const OnSpot: React.FC<{ set: SetDef<never>; member: CastMember; time?: number }> = ({ set, member, time = 0 }) => {
  const spot = set.spots[member.spot];
  if (!spot) throw new Error(`set ${set.name} has no spot ${JSON.stringify(member.spot)}: ${Object.keys(set.spots).join(", ")}`);
  return (
    <Figure x={spot.x} y={spot.y} scale={spot.scale} facing={spot.facing} pose={member.pose ?? poseFor(spot)} time={time}
      {...member.face} {...member.who} />
  );
};

/** A set on the kit's Stage, lit by a mood plus the set's own lights, with people on its spots. With no `cast`, `cam`
 *  or `options` it draws the set's example. The pause's wave works as on any Stage (`radius`, `origin`); `actors`
 *  adds anything else to the actors' slot (after the cast). */
export function SetScene<O extends object>({ set, mood, frame = 0, cam, options, cast, radius = 0, origin = { x: 960, y: 540 }, actors }: {
  set: SetDef<O>;
  mood: MoodName;
  frame?: number;
  cam?: Camera;
  options?: Partial<O>;
  cast?: CastMember[];
  radius?: number;
  origin?: { x: number; y: number };
  actors?: React.ReactNode;
}) {
  const ex = set.example;
  const camera = cam ?? set.cameras[ex.camera] ?? set.cameras.wide;
  const props = { cam: camera, mood, frame, options: { ...set.defaults, ...ex.options, ...options } as O };
  const people = cast ?? ex.cast;
  const any = set as unknown as SetDef<never>;
  const { Back, Mid, Front } = set;
  return (
    <LookContext.Provider value={setLook(set.lights, mood, camera)}>
      <Stage cam={camera} radius={radius} origin={origin}
        back={<Back {...props} />}
        actors={
          <>
            {people.filter((m) => m.behind).map((m, i) => <OnSpot key={`b${i}`} set={any} member={m} time={frame} />)}
            {Mid && <Mid {...props} />}
            {people.filter((m) => !m.behind).map((m, i) => <OnSpot key={`f${i}`} set={any} member={m} time={frame} />)}
            {actors}
          </>
        }
        front={Front ? <Front {...props} /> : undefined} />
    </LookContext.Provider>
  );
}
