// Who's Red, lines 43-47 (script v5): the academy steps at dusk (builder A's AcademyStreet, street view), you and your
// best friend sitting with your bags between your feet. No card opens: you said nothing good.
//
// Two performed moments, the narrator silent:
//   after line 42 (5 s): you point straight up at the air above his head, mouth open. He follows your finger: looks
//   up, sees nothing, looks at the sky, then at you, brows up. He pats the top of his own head twice, checking.
//   Then his own lines, "What number?" and "Is it a bug? Get it off."
//   v4 (owner on v3, 2026-11-13: "You can ask him on the academy step ? And then there was no dialogue. I think we
//   should have one there by the Hero."): you ask it, in a bubble, as you point: "There's a number over your head!"
//   after line 44 (2 s): he ducks, swatting at his own hair, then catches your face, laughs, and shoves your shoulder.
//   v4.2 (outside review of v4.1, 4:00-4:15): the shove turns you a little away and you stay turned; his hand stays on
//   your shoulder; the framings after it change (closer on the hand and his laugh, then on your smile failing). The
//   steps come in during line 41 ("The same race. The ones you'd miss."), the lanes sheet cut short.
//   v5: the steps come in on line 43 ("So why not just ask him?"); the bubble and his look up play in the gap after it;
//   the swat plays inside "Is it a bug? Get it off." and the laugh and shove land on "He can't see it."; no failing
//   smile now (the owner: exciting, not sad): a knowing look at the empty air over his head, then set and determined
//   on "You'll have to read them. All of them." as the camera pulls out over the street.
//   v7 (outside review of v6, 4:34-4:58): you point and ask on "You do," (the bubble by your left, its tail on you);
//   his search gets the time: up, the sky, a twist to look behind himself, back to you, the pats. "Nobody sees the
//   cards but you.": his phone up for a selfie check of his own head while you grab at the empty air over it, twice.
//   "So asking is out.": close on you, set; "All of them.": one quick pull back, up to the lit signs.
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { lerpPose, SEATED, seatedY, type Pose } from "@whatif/kit/rig/pose";
import { Backpack, setLook } from "@whatif/kit/sets";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { Bubble, headAt } from "../parts";
import { blinking, camAt, current, HERO, MINJUN, mix, ramp } from "../shared";
import { ACADEMY, academyLights, AcademyStreetBack } from "../sets/AcademyStreet";
import { armTo } from "./WhosCrimson.Common";
import type { CrimsonTimes } from "./WhosCrimson.Times";

/** You on the landing's edge (ACADEMY.sitYou); he sits closer than the set's spot so his hand can reach your shoulder. */
const SY = ACADEMY.sitYou;
const SM = { ...ACADEMY.sitMinjun, x: 432 };
const yY = seatedY(SY.seatTop, SY.scale);
const mY = seatedY(SM.seatTop, SM.scale);
/** Pointing straight up: upper arm forward, forearm up, the hand in front of your face, not across it (you face 1). */
const POINT: Pose = { ...SEATED, armF: [95, 55] };

type View = "steps" | "point" | "up" | "behind" | "back" | "pat" | "ask" | "bug" | "duck" | "catches" | "pair" | "selfie" | "yours" | "wide" | "pull";

const say = { brows: "raised" as const, lids: 0, mouth: "open" as const, eyes: 1.1 };

/** His face through both moments: your face, your finger, straight up, the sky, you, the pat; his lines; the swat; your
 *  face; the laugh. */
function minjunFace(frame: number, k: CrimsonTimes, view: View) {
  if (view === "steps") return { ...EXPRESSIONS.happy, look: { x: 0.9, y: 0 } };
  if (frame < k.follow) return { brows: "none" as const, lids: 0, mouth: "flat" as const, eyes: 1, look: { x: 0.95, y: 0 } };
  if (frame < k.up) return { brows: "none" as const, lids: 0, mouth: "flat" as const, eyes: 1.05, look: { x: 0.75, y: -0.6 } };
  if (frame < k.sky) return { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1.1, look: { x: 0.05, y: -1 } };
  if (frame < k.behind) return { brows: "raised" as const, lids: 0, mouth: "o" as const, eyes: 1.1, look: { x: -0.75, y: -0.9 } };
  if (frame < k.back) return { brows: "worry" as const, lids: 0, mouth: "flat" as const, eyes: 1.1, look: { x: -1, y: -0.2 } };
  if (frame < k.pat) return { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1.15, look: { x: 0.95, y: -0.05 } };
  if (frame < k.ask) return { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1, look: { x: 0.2, y: -0.85 } };
  if (frame < k.bug) return { ...say, look: { x: 0.95, y: 0 } };
  if (frame < k.duck) return { ...say, brows: "worry" as const, eyes: 1.25, look: { x: 0.3, y: -0.9 } };
  if (frame < k.catches) return { brows: "worry" as const, lids: 0.3, mouth: "wobble" as const, eyes: 1, look: { x: 0.2, y: 0.6 } };
  if (frame < k.laugh) return { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1.15, look: { x: 0.95, y: -0.1 } };
  if (frame < k.selfie) return { brows: "raised" as const, lids: 0.2, mouth: frame < k.pair + 20 ? "open" as const : "smile" as const, eyes: 1, look: { x: 0.9, y: 0 } };
  // the selfie check: eyes on the phone, then up at the air, nothing
  if (frame < k.yours) return { brows: frame < k.grab + 10 ? "raised" as const : "worry" as const, lids: 0, mouth: "flat" as const, eyes: 1.1,
    look: frame < k.grab + 10 ? { x: 0.9, y: 0.1 } : { x: 0.3, y: -0.9 } };
  return { ...EXPRESSIONS.happy, look: { x: 0.9, y: -0.1 } };
}

function yourFace(frame: number, k: CrimsonTimes, view: View) {
  if (view === "steps") return { ...EXPRESSIONS.sceptical, look: { x: 0.9, y: -0.3 } };
  if (frame < k.back) return { brows: "raised" as const, lids: 0, mouth: "open" as const, eyes: 1.1, look: { x: 0.8, y: -0.75 } };
  if (frame < k.catches) return { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1.05, look: { x: 0.85, y: -0.5 } };
  if (frame < k.laugh) return { brows: "worry" as const, lids: 0.1, mouth: "flat" as const, eyes: 1.05, look: { x: 0.9, y: -0.2 } };
  // after the shove, grinning along with him; then a knowing look up at the empty air over his head; then set
  if (frame < k.grab) return { brows: "none" as const, lids: 0.1, mouth: "smile" as const, eyes: 1, look: { x: 0.8, y: -0.3 } };
  if (frame < k.yours) return { brows: "angry" as const, lids: 0, mouth: "flat" as const, eyes: 1.1, look: { x: 0.6, y: -0.9 } };
  if (frame < k.wide) return { ...EXPRESSIONS.sceptical, look: { x: 0.7, y: -0.85 } };
  return { ...EXPRESSIONS.determined, look: { x: 1, y: -0.1 } };
}

export const StepsShot: React.FC<{ frame: number; k: CrimsonTimes }> = ({ frame, k }) => {
  const mood: MoodName = "dusk";
  const view = current<View>(frame, [[0, "steps"], [k.point, "point"], [k.up, "up"], [k.behind, "behind"], [k.back, "back"], [k.pat, "pat"], [k.ask, "ask"], [k.bug, "bug"],
    [k.duck, "duck"], [k.catches, "catches"], [k.pair, "pair"], [k.selfie, "selfie"], [k.yours, "yours"], [k.wide, "wide"], [k.pull, "pull"]]);
  // you: the arm goes up and stays while he looks; down when he looks back at you; rocked back by the shove
  const point = ramp(frame, k.point + 2, k.point + 12) * (1 - ramp(frame, k.back + 4, k.back + 16));
  // the selfie check and your grab at the air over his head
  const phone = ramp(frame, k.selfie, k.selfie + 8) * (1 - ramp(frame, k.yours + 4, k.yours + 14));
  const grab = ramp(frame, k.grab, k.grab + 6) * (1 - ramp(frame, k.yours - 4, k.yours + 6));
  // the shove rocks you back and leaves you turned a little away until the wide
  const rock = ramp(frame, k.shove + 2, k.shove + 8) * (1 - 0.55 * ramp(frame, k.shove + 14, k.shove + 30)) * (1 - ramp(frame, k.wide - 8, k.wide + 8));
  const yBase = lerpPose(SEATED, POINT, point);
  const yPose: Pose = { ...yBase, lean: yBase.lean - 12 * rock, tilt: yBase.tilt - 10 * rock };
  const yx = SY.x - 8 * rock;
  const yh = headAt(yx, yY, SY.scale, yPose, SY.facing);
  // him: head back to look up; the duck (lean and drop) while he swats; the lean in for the shove
  const lookUp = ramp(frame, k.up - 4, k.up + 6) * (1 - ramp(frame, k.back - 4, k.back + 4)) + ramp(frame, k.bug, k.bug + 8) * (1 - ramp(frame, k.duck, k.duck + 6));
  const duck = ramp(frame, k.duck, k.duck + 6) * (1 - ramp(frame, k.catches, k.catches + 8));
  const shoving = ramp(frame, k.shove - 6, k.shove + 2) * (1 - ramp(frame, k.shove + 12, k.shove + 26));
  // his hand stays on your shoulder after the shove, until the wide
  const handOn = ramp(frame, k.shove - 6, k.shove + 2) * (1 - ramp(frame, k.selfie - 10, k.selfie));
  const mBase: Pose = { ...SEATED, tilt: -16 * lookUp + 14 * duck, lean: 26 * duck + 22 * Math.max(shoving, 0.8 * handOn), drop: 10 * duck };
  const mh0 = headAt(SM.x, mY, SM.scale, mBase, SM.facing);
  // the back hand on his head: two pats (pat .. ask), then the swatting (bug .. catches)
  const patting = frame >= k.pat - 6 && frame < k.ask + 4;
  const swatting = frame >= k.bug + 10 && frame < k.catches + 4;
  const handUp = patting
    ? ramp(frame, k.pat - 6, k.pat) * (1 - ramp(frame, k.ask - 2, k.ask + 4))
    : swatting ? ramp(frame, k.bug + 10, k.bug + 16) * (1 - ramp(frame, k.catches - 2, k.catches + 4)) : 0;
  const tap = patting
    ? Math.abs(Math.sin(((frame - k.pat) / Math.max(1, k.ask - k.pat)) * Math.PI * 2)) * 12
    : Math.abs(Math.sin((frame - k.bug) / 2.2)) * 14;
  const sway = swatting ? Math.sin((frame - k.bug) / 2.2) * mh0.r * 0.6 : 0;
  const handAtHead = { x: mh0.x + 4 + sway, y: mh0.y - mh0.r * 0.9 - tap };
  const armB: [number, number] = handUp > 0
    ? (() => { const a = armTo(SM.x, mY, SM.scale, mBase, SM.facing, handAtHead); return [mix(SEATED.armB[0], a[0], handUp), mix(SEATED.armB[1], a[1], handUp)]; })()
    : SEATED.armB;
  const yShoulder = { x: yx + 14 * SY.scale, y: yY - 205 * SY.scale };
  const shoveArm = armTo(SM.x, mY, SM.scale, mBase, SM.facing, yShoulder);
  let mPose: Pose = { ...mBase, armB, armF: [mix(SEATED.armF[0], shoveArm[0], handOn), mix(SEATED.armF[1], shoveArm[1], handOn)] };
  if (phone > 0) {
    const sel = armTo(SM.x, mY, SM.scale, mBase, SM.facing, { x: mh0.x - 70 * SM.scale, y: mh0.y + 10 * SM.scale });
    mPose = { ...mPose, armF: [mix(SEATED.armF[0], sel[0], phone), mix(SEATED.armF[1], sel[1], phone)], tilt: mPose.tilt + 8 * phone };
  }
  const mh = headAt(SM.x, mY, SM.scale, mPose, SM.facing);
  if (grab > 0) {
    const clutch = Math.abs(Math.sin((frame - k.grab) / 4)) * 16;
    const g = armTo(yx, yY, SY.scale, yPose, SY.facing, { x: mh.x - 6, y: mh.y - mh.r - 34 - clutch });
    yPose.armF = [mix(yPose.armF[0], g[0], grab), mix(yPose.armF[1], g[1], grab)];
  }
  const cams: Record<View, Camera> = {
    steps: camAt(frame, [[k.stepsIn, { x: 440, y: 790, zoom: 1.4 }], [k.point, { x: 400, y: 810, zoom: 1.75 }]]),
    point: camAt(frame, [[k.point, { x: 270, y: 790, zoom: 2.0 }], [k.up, { x: 280, y: 785, zoom: 2.1 }]]),
    up: camAt(frame, [[k.up, closeUp(mh.x + 10, mh.y - 30, 3.8)], [k.sky, closeUp(mh.x + 10, mh.y - 80, 3.8)], [k.behind, closeUp(mh.x + 10, mh.y - 90, 3.9)]]),
    behind: camAt(frame, [[k.behind, { x: 400, y: 800, zoom: 2.9 }], [k.back, { x: 405, y: 800, zoom: 3.0 }]]),
    back: camAt(frame, [[k.back, { x: 372, y: 805, zoom: 2.7 }], [k.pat, { x: 372, y: 805, zoom: 2.8 }]]),
    pat: camAt(frame, [[k.pat, closeUp(mh.x + 10, mh.y - 50, 3.3)], [k.ask, closeUp(mh.x + 10, mh.y - 55, 3.4)]]),
    ask: camAt(frame, [[k.ask, closeUp(mh.x + 40, mh.y - 30, 3.6)], [k.bug, closeUp(mh.x + 40, mh.y - 30, 3.7)]]),
    bug: camAt(frame, [[k.bug, closeUp(mh.x + 10, mh.y - 50, 3.3)], [k.duck, closeUp(mh.x + 10, mh.y - 40, 3.2)]]),
    duck: camAt(frame, [[k.duck, { x: 380, y: 815, zoom: 2.6 }], [k.catches, { x: 380, y: 815, zoom: 2.7 }]]),
    catches: camAt(frame, [[k.catches, { x: 372, y: 805, zoom: 2.6 }], [k.pair, { x: 372, y: 810, zoom: 2.45 }]]),
    pair: camAt(frame, [[k.pair, closeUp((yh.x + mh.x) / 2 + 20, yh.y + 30, 3.2)], [k.selfie, closeUp((yh.x + mh.x) / 2 + 30, yh.y + 25, 3.35)]]),
    // the selfie and the grab: wide enough for the air over his head
    selfie: camAt(frame, [[k.selfie, { x: (yh.x + mh.x) / 2 + 10, y: yh.y - 10, zoom: 2.7 }], [k.yours, { x: (yh.x + mh.x) / 2 + 10, y: yh.y - 15, zoom: 2.85 }]]),
    yours: camAt(frame, [[k.yours, closeUp(yh.x + 10, yh.y + 10, 3.6)], [k.wide, closeUp(yh.x + 4, yh.y + 6, 3.95)]]),
    wide: camAt(frame, [[k.wide, closeUp(yh.x + 20, yh.y + 10, 3.0)], [k.pull, closeUp(yh.x + 20, yh.y + 6, 3.3)]]),
    pull: camAt(frame, [[k.pull, { x: 440, y: 790, zoom: 2.2 }], [Math.min(k.end - 1, k.pull + 45), { x: 760, y: 560, zoom: 1.0 }], [k.end, { x: 790, y: 520, zoom: 1.02 }]]),
  };
  const cam = drift(cams[view], frame, "steps", view === "pull" ? 4 : 2);
  return (
    <LookContext.Provider value={setLook(academyLights("street"), mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<AcademyStreetBack cam={cam} mood={mood} frame={frame} view="street" />} actors={
        <>
          <Backpack x={366} y={1002} scale={0.36} color="#3d6fb0" />
          <Figure {...MINJUN} x={SM.x} y={mY} scale={SM.scale} facing={view === "behind" ? -SM.facing as 1 | -1 : SM.facing} pose={mPose} {...minjunFace(frame, k, view)}
            blink={blinking(frame, 2)} time={frame} held={phone > 0.3 ? <rect x={-14} y={-46} width={28} height={50} rx={5} fill="#23252b" stroke="#9aa0a8" strokeWidth={3} /> : undefined} />
          <Figure {...HERO} x={yx} y={yY} scale={SY.scale} facing={SY.facing} pose={yPose} {...yourFace(frame, k, view)} blink={blinking(frame, 1)} time={frame} />
          {/* your question as you point, above both heads, until he looks up (script v4's BUBBLE) */}
          <Bubble frame={frame} at={k.point + 4} until={k.up} x={yh.x - 6} y={yh.y - yh.r - 16} size={17} side="left"
            text="There's a number over your head!" />
          {/* his hand on his crown (the back arm itself stays behind his head), patting, then swatting */}
          {handUp > 0.5 && <circle cx={mh.x + 4 + sway} cy={mh.y - mh.r * 0.92 - tap} r={11 * SM.scale * 1.15} fill={MINJUN.head} stroke="#23252b" strokeWidth={3} />}
        </>
      } />
    </LookContext.Provider>
  );
};
