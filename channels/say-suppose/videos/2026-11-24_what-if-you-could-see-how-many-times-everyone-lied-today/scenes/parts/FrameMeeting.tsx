// The Monday meeting room in look C (Frame and Zeros): the painted plates `meeting-lamp` (night, one lamp over the
// head of the table) and `meeting-morning`, in plate world units (x -240..2160, y -135..1215). The boss stands behind
// the far end of the painted table under the lamp; a copy of the plate cut to the table's shape is laid over him, so
// the table is in front of his legs. You stand close to the lens at the left. No AI images.
import { AbsoluteFill } from "remotion";
import { Figure, type Brows, type Mouth } from "@whatif/kit/rig/Figure";
import type { Pose } from "@whatif/kit/rig/pose";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import { BOSS, HERO } from "../shared";
import { Counter } from "./Counter";
import { ActorLayer, counterLight, dof, PlateCut } from "./FrameLook";
import { headWorld, HeroMug, handWorld, Lanyard, type Placed } from "./FrameKit";
import { PlateScene, type PlateName } from "./Plate";

/** The boss's feet behind the far end of the table, under the lamp. */
export const BOSS_AT = { x: 977, y: 805, scale: 1.15 } as const;
/** The painted table (top and apron) in meeting-lamp, for the cut that stands in front of the boss. */
const TABLE: [number, number][] = [[803, 650], [1152, 650], [1302, 757], [1302, 792], [636, 792], [636, 757]];
/** Your head, close to the lens at the left (the thumbnail's you), and your scale there. */
export const YOU_HEAD = { x: 634, y: 605 } as const;
export const YOU_SCALE = 1.88;
/** The thumbnail's camera: you large at the left, the boss under his counter at the right third. */
export const THUMB_CAM: Camera = { x: 870, y: 560, zoom: 2.2 };
/** The counter's digit height over the boss, in world units. */
export const BOSS_COUNT = 40;

export const counterOverBoss = (boss: Placed) => {
  const h = headWorld(boss);
  return { x: h.x, y: h.y - h.r - BOSS_COUNT * 0.8 };
};

export interface BossState { pose: Pose; x?: number; mouth: Mouth; brows?: Brows; count: { base: number; ticks?: number[]; on?: number } | null; blink?: boolean }
export interface YouState { pose: Pose; face: { brows: Brows; lids?: number; mouth: Mouth; eyes?: number }; look: { x: number; y: number }; blink?: boolean; mug?: boolean }

/** The meeting room through `cam`: the boss behind the table under his counter, you at the left. `blur` overrides the
 *  depth of field (default: read from the face the camera is on, `subject`). */
export const MeetingPlate: React.FC<{
  cam: Camera; frame: number; plate?: PlateName; mood?: MoodName; boss?: BossState; you?: YouState; subject?: "boss" | "you";
  blur?: number; glow?: number; extra?: React.ReactNode;
}> = ({ cam, frame, plate = "meeting-lamp", mood = "lamp", boss, you, subject = "boss", blur, glow = 0.55, extra }) => {
  const b: Placed | null = boss ? { x: boss.x ?? BOSS_AT.x, y: BOSS_AT.y, scale: BOSS_AT.scale, facing: -1, pose: boss.pose } : null;
  const c = b ? counterOverBoss(b) : null;
  const y: Placed | null = you ? youAt(you.pose) : null;
  const r = subject === "you" && y ? headWorld(y).r : 46 * BOSS_AT.scale;
  const px = blur ?? dof(cam, r);
  const lights = c && boss?.count ? [counterLight(c, glow, 220)] : [];
  return (
    <AbsoluteFill>
      <PlateScene plate={plate} cam={cam} mood={mood} blur={px} rimFrom="right" lights={lights}
        front={b && plate === "meeting-lamp" ? <PlateCut id={`table-${Math.round(px * 4)}`} plate={plate} cam={cam} blur={px} points={TABLE} /> : undefined}
        actors={
          <>
            {b && boss && (
              <g>
                <Figure x={b.x} y={b.y} scale={b.scale} facing={-1} pose={b.pose} head={BOSS.head} coat={BOSS.coat} tie={BOSS.tie}
                  brows={boss.brows ?? "flat"} lids={0} mouth={boss.mouth} eyes={1.05} look={{ x: 1, y: 0.1 }} time={frame} blink={boss.blink} />
                {c && boss.count && <Counter x={c.x} y={c.y} base={boss.count.base} ticks={boss.count.ticks} on={boss.count.on} frame={frame} size={BOSS_COUNT} id="meet-boss" />}
              </g>
            )}
            {extra}
          </>
        } />
      {y && you && <ActorLayer cam={cam} mood={mood} rimFrom="right"><YouFigure f={y} s={you} frame={frame} /></ActorLayer>}
    </AbsoluteFill>
  );
};

/** You placed by your head at YOU_HEAD (the pose moves your feet, never your face). */
export function youAt(pose: Pose): Placed {
  const h = headWorld({ x: 0, y: 0, scale: YOU_SCALE, facing: 1, pose });
  return { x: YOU_HEAD.x - h.x, y: YOU_HEAD.y - h.y, scale: YOU_SCALE, facing: 1, pose };
}

const YouFigure: React.FC<{ f: Placed; s: YouState; frame: number }> = ({ f, s, frame }) => {
  const hand = handWorld(f);
  return (
    <g>
      <Figure x={f.x} y={f.y} scale={f.scale} pose={f.pose} head={HERO.head} scarf={HERO.scarf} tuft flow={0.15} time={3 + frame * 0.3}
        look={s.look} blink={s.blink} {...s.face} />
      <Lanyard f={f} />
      {(s.mug ?? true) && <HeroMug x={hand.x + 8} y={hand.y + 4} scale={f.scale} steam={false} />}
    </g>
  );
};
