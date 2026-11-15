// Your Stall, the landlord's letter (29-31, moved here from v1's The City Plays): the envelope, "Keep it up.", the tear,
// HIGH-FIVES 98% a second before his hand comes up, "Half!", the slap; then the thought you can't put down (32).
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { PAPER } from "@whatif/kit/theme";
import { Tag } from "../device";
import { aimArm, Apron, headAt, type Body } from "../kit";
import { blinking, camAt, FRIEND, HERO, LANDLORD, mix, ramp } from "../shared";
import { COURT, FoodCourtBack, foodCourtLights, StallCounter, StallLamp } from "../sets/FoodCourt";
import { Envelope, glide, RoleTag, Shot, talk } from "./TheCityPlays.Parts";
import { tags, type T } from "./YourStall.Times";

export const Landlord: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const tg = tags(k);
  const push = frame >= k.handUp - 6;
  const cam = drift(push
    ? camAt(frame, [[k.handUp - 6, { x: 830, y: 470, zoom: 1.5 }], [k.thought, { x: 820, y: 460, zoom: 1.6 }]])
    : camAt(frame, [[k.landlord, { x: 960, y: 560, zoom: 1.4 }], [k.handUp - 6, { x: 980, y: 560, zoom: 1.5 }]]), frame, "land", 3);
  const step = ramp(frame, k.handUp - 10, k.handUp + 4);
  const meet = { x: 760, y: 360 };
  const fr: Body = { x: mix(COURT.friend.x, 940, step), y: COURT.friend.y, scale: COURT.scale, facing: step > 0.5 ? -1 : 1, pose: STAND };
  const yu: Body = { x: COURT.you.x, y: COURT.you.y, scale: COURT.scale, facing: 1, pose: STAND };
  const up = ramp(frame, k.handUp, k.slap);
  const frPose: Pose = frame >= k.handUp ? { ...STAND, armB: [-7, 8], armF: up > 0 ? aimArm(fr, { x: mix(fr.x - 60, meet.x + 10, up), y: mix(380, meet.y, up) }) : [80, 40] }
    : frame >= k.take ? { ...STAND, armF: [70, 50] } : STAND;
  const yuPose: Pose = frame >= k.slap - 8 ? { ...STAND, armF: aimArm(yu, { x: mix(700, meet.x - 10, ramp(frame, k.slap - 8, k.slap)), y: meet.y }) } : { ...STAND, armF: [40, 60] };
  const lb: Body = { x: COURT.customer.x, y: COURT.customer.y, scale: COURT.scale, facing: -1, pose: frame < k.take ? { ...STAND, armF: [mix(30, 88, ramp(frame, k.landlord, k.landlord + 12)), 20] } : STAND };
  const torn = ramp(frame, k.tear, k.tear + 10);
  const fh = headAt(fr.x, fr.y, fr.scale, frPose, fr.facing);
  const slapped = frame >= k.slap;
  const reading = frame >= k.tear && frame < k.hiCard;
  const actors = (
    <>
      <Figure {...yu} pose={yuPose} {...HERO} coat="#3b3e47" brows={slapped || frame >= k.hiCard ? "raised" : "none"} lids={0} mouth={frame >= k.hiCard ? "smile" : "flat"} eyes={1.05}
        look={frame >= k.hiCard && !slapped ? { x: 0.7, y: -0.5 } : { x: 0.9, y: 0.1 }} blink={blinking(frame, 0)} time={frame} />
      <Apron b={{ ...yu, pose: yuPose }} />
      <Figure {...fr} pose={frPose} head={FRIEND.head} coat={FRIEND.coat}
        brows={frame >= k.hiCard ? "raised" : "none"} lids={reading ? 0.3 : 0}
        mouth={talk(frame, k.handUp + 6, k.handUp + 24, frame >= k.tear ? "smile" : "flat", 6)} eyes={frame >= k.hiCard ? 1.2 : 1.05}
        look={reading ? { x: 0.6, y: 0.6 } : { x: 0.9, y: 0 }} blink={blinking(frame, 2)} time={frame}
        held={frame >= k.take && frame < k.handUp ? <Envelope open={torn} /> : undefined} />
      <Apron b={{ ...fr, pose: frPose }} />
      {frame >= k.handUp && <g transform={`translate(${fr.x + 30} ${COURT.counter.top - 6}) rotate(-8)`}><Envelope open={1} /></g>}
      <StallCounter />
      {slapped && frame < k.slap + 8 && <circle cx={meet.x} cy={meet.y} r={30 + (frame - k.slap) * 6} fill="none" stroke={PAPER} strokeWidth={6} opacity={1 - (frame - k.slap) / 8} />}
      <Figure {...lb} head={LANDLORD.head} coat={LANDLORD.coat} tie={LANDLORD.tie} {...EXPRESSIONS.neutral} lids={0.4}
        mouth={talk(frame, k.keep, k.keep + 26, "flat")} look={{ x: 0.9, y: 0.2 }} blink={blinking(frame, 8)} time={frame}
        held={frame < k.take ? <Envelope /> : undefined} />
      <Tag frame={frame} x={fh.x} headY={fh.y} r={fh.r} keys={tg.friend} />
      <RoleTag frame={frame} at={k.landlord + 6} {...headAt(lb.x, lb.y, lb.scale, lb.pose, -1)} text="LANDLORD" side={-1} hold={Math.min(75, k.handUp - 12 - k.landlord)} />
    </>
  );
  return (
    <Shot cam={cam} mood="day" lights={foodCourtLights}
      back={<><FoodCourtBack cam={cam} mood="day" frame={frame} /><StallLamp on={false} /></>} actors={actors} />
  );
};

/** Line 32: you close, grinning, the letter waving beside you; on "anyone's" your eyes go out over the court. */
export const Thought: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const yu: Body = { x: COURT.you.x, y: COURT.you.y, scale: COURT.scale, facing: 1, pose: STAND };
  const yh = headAt(yu.x, yu.y, yu.scale, STAND, 1);
  const fr: Body = { x: 1060, y: COURT.friend.y, scale: COURT.scale, facing: 1, pose: { ...STAND, armF: [118 + Math.sin(frame / 5) * 12, -20] } };
  const out = frame >= k.anyone;
  const cam: Camera = drift(out
    ? glide(frame, k.anyone, k.end, closeUp(yh.x + 80, yh.y - 20, 2.4), closeUp(yh.x + 60, yh.y - 10, 2.9))
    : glide(frame, k.thought, k.anyone, { x: 760, y: 520, zoom: 1.6 }, closeUp(yh.x + 100, yh.y - 20, 2.1)), frame, "thought", 2);
  // the eyes slide over the diners, left to right, as the idea lands
  const scan = out ? Math.sin((frame - k.anyone) / 14) * 0.7 : 0.6;
  const actors = (
    <>
      <Figure {...fr} head={FRIEND.head} coat={FRIEND.coat} brows="raised" lids={0} mouth="smile" eyes={1.05} look={{ x: 0.5, y: -0.4 }}
        blink={blinking(frame, 2)} time={frame} held={<Envelope open={1} tilt={-30} />} />
      <Apron b={fr} />
      <Figure {...yu} pose={{ ...STAND, armF: out ? aimArm(yu, { x: yh.x + yh.r * 0.9, y: yh.y + yh.r * 1.1 }) : [40, 60] }} {...HERO} coat="#3b3e47"
        brows={out ? "flat" : "raised"} lids={out ? 0.25 : 0} mouth={out ? "smirk" : "smile"} eyes={1}
        look={out ? { x: scan, y: 0.05 } : { x: 0.6, y: -0.2 }} blink={blinking(frame, 0)} time={frame} />
      <Apron b={yu} />
      <StallCounter />
    </>
  );
  return <Shot cam={cam} mood="day" lights={foodCourtLights} back={<FoodCourtBack cam={cam} mood="day" frame={frame} />} actors={actors} />;
};
