// Beat "Crumbs" (script.md ## [01:56] Crumbs; narration lines 17-32). A week of mornings, each crumb a little performed
// scene with a gap, then the drawn facts. Every frame comes from the narration clips (`at(i, p)`: p of the way through
// line i; p from the take's word timings).
//
//   17    the breakfast table: you, craving; INSERT the crayon drawing a food you can't name (it is a shoe, steaming)
//   hold  (3 s) close on you drawing, tongue out; you turn the page round; he squints, tilts, tilts back, looks at you
//   18    him: "That's a shoe."; your offended face
//   19    the cutaway: your shower | the wall | her front room; you hum (notes); she frowns, gets up; her fist
//   hold  (2 s) three bangs (the tiles jump); silence, the water runs; her notes come back through the wall
//   20    both sides: she hums it back, you stare at the tiles with the soap; close on you; close on her
//   21    the table: the fitted sheet held up; INSERT top-down it folds into a perfect square; his jaw; his spoon falls;
//         INSERT the floor: the spoon lands
//   22    the bridge at dawn, the queue walking in, you in it behind the woman; close: you know the word (an arch in a
//         thought cloud); you walk up beside her; INSERT the plaster in her elbow; you say it (an arch in a bubble)
//   23-24 her: "Hmph, not mine."; the shrug; she walks on with the queue, you stop; close on you: whose is it?
//   25-26 Saturday: his palm out across the table; the teal light under his cap; your face; him: "Okay. What'd you get?"
//   27    the notebook slapped down; INSERT top-down two columns (his cap, your tuft), the crumbs doodled in; INSERT the
//         knot; his smug face; you, prim, saying sorry in someone else's voice; the notebook takes both
//   28    the page: the scientist asleep, the dream of a frog's heart; the night corridor, running with a candle; the
//         heart beating in its dish on the bench
//   29    the table: you tap your temple
//   30    your phone; INSERT the box of squiggly letters, typed; the old newspapers coming out as clean lines
//   31    the papers riffle faster; the bunk room at night, the band on, the ghost, the coins (the same bargain)
//   32    the jar a quarter full; your eyes on it; eight coins in; the clock; your eyes on the clock
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { dir, joints, LIMB, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Clip } from "@whatif/kit/timeline";
import { INK } from "@whatif/kit/theme";
import { Bubble, ClinkSound, CoinArc, DeviceSound, landings } from "../parts";
import { BRIDGE, BridgeScene } from "../sets/Bridge";
import { BunkRoom } from "../sets/BunkRoom";
import { BRIDGE_WOMAN, blinking, camAt, current, lineEnd, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { BRO_SEAT, CLOCK, Crayon, FoldingSheet, HeldPage, KitchenTable, Notebook, SheetBlob, SheetSquare, ShoeDrawing, Spoon,
  TABLE, TopDown, TopHand, YOU_SEAT, type CrumbKind } from "./Crumbs.Kitchen";
import { CaptchaPhone, DreamingScientist, HeartOnBench, KnotInsert, Newspapers, NightCorridor, PageStage } from "./Crumbs.Inserts";
import { aimArm, headOf, talk, ThoughtCloud, You, type Body, type Face } from "./Crumbs.Rig";
import { SHOWER, ShowerStage } from "./Crumbs.Shower";
import { ChairAgain, chairSpan, TwoBands, twoBandsSpan } from "./V5.Crumbs";
import { isV5 } from "./V5.Kit";

type T = ReturnType<typeof times>;

function times(clips: Clip[], start: number, end: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const h17 = lineEnd(clips, 17);
  const g17 = from(18) - h17;
  const in17 = (p: number) => Math.round(h17 + g17 * p);
  const h19 = lineEnd(clips, 19);
  const g19 = from(20) - h19;
  const in19 = (p: number) => Math.round(h19 + g19 * p);
  return {
    start, end, at, from,
    // 17 + hold + 18: the drawing
    crave: at(17, 0.18), draw: at(17, 0.66), drawLines: [at(17, 0.7), h17 - 4] as const,
    tongue: h17, turn: in17(0.27), squint: in17(0.48), tiltA: in17(0.58), tiltB: in17(0.72), looks: in17(0.88),
    shoeLine: [at(18, 0.4), at(18, 0.9)] as const, offended: at(18, 0.82),
    // 19 + hold + 20: the shower
    showerWide: from(19), hum: at(19, 0.2), granWakes: at(19, 0.64), granUp: at(19, 0.72), fist: at(19, 0.81),
    bangs: [in19(0.02), in19(0.18), in19(0.34)], frozen: in19(0.45), backHum: in19(0.65),
    both: from(20), stare: at(20, 0.43), granHum: at(20, 0.73),
    // 21: the sheet and the spoon
    sheet: from(21), fold: at(21, 0.27), folds: [at(21, 0.33), at(21, 0.43), at(21, 0.57)] as const, proud: at(21, 0.64),
    jaw: at(21, 0.74), slip: at(21, 0.78), floor: at(21, 0.83), lands: at(21, 0.9),
    // 22-24: the bridge
    bridge: from(22), know: at(22, 0.13), join: at(22, 0.43), walkTwo: at(22, 0.65), elbow: at(22, 0.83), say: at(22, 0.93),
    hmph: from(23), notMine: [at(23, 0.45), at(23, 0.95)] as const, shrug: from(24), walksOn: at(24, 0.3), whose: at(24, 0.7),
    // 25-27: Saturday and the notebook
    saturday: from(25), capLight: at(25, 0.61), youShock: at(25, 0.9), whatd: [at(26, 0.45), at(26, 0.95)] as const,
    slap: from(27), book: at(27, 0.14), knot: at(27, 0.61), smug: at(27, 0.72), sorry: at(27, 0.8), writes: at(27, 0.93),
    crumbs: [
      [at(27, 0.16), 0, "squiggle"], [at(27, 0.22), 1, "shoe"], [at(27, 0.37), 1, "bowl"], [at(27, 0.43), 0, "note"],
      [at(27, 0.48), 1, "word"], [at(27, 0.53), 0, "face"], [at(27, 0.94), 0, "knot"], [at(27, 0.97), 1, "sorry"],
    ] as [number, 0 | 1, CrumbKind][],
    // 28: the page
    page: from(28), bed: at(28, 0.24), dream: at(28, 0.62), corridor: at(28, 0.76), heart: at(28, 0.89),
    // 29-31: keep it; the phone; the papers; the night
    keep: from(29), temple: at(29, 0.64),
    // 30-31 (the reCAPTCHA aside and "Spare seconds") were cut in v4 (owner on v3: "Around 4:00. review it again."),
    // so the phone, papers and night shots are empty and "keep it" holds until the jar: they start past this beat's
    // end (line 33 opens More Hours), in rising order so every camera key stays strictly increasing.
    phoneHand: from(33) + 1, captcha: from(33) + 2, papers: from(33) + 3, fast: from(33) + 4, night: from(33) + 5,
    coinsNight: from(33) + 6,
    // 32: the jar and the clock (cut since v3: its one-frame clip would give equal camera keys, so each step is at
    // least a frame after the one before)
    ...rising([from(32), at(32, 0.26), at(32, 0.45), at(32, 0.79), at(32, 0.9)], ["jar", "eyesJar", "eight", "clock", "eyesClock"] as const),
  };
}

/** Frames named in order, each nudged to at least one frame after the one before (keys stay strictly increasing). */
function rising<N extends string>(frames: number[], names: readonly N[]): Record<N, number> {
  const out = {} as Record<N, number>;
  let last = -Infinity;
  names.forEach((n, i) => { last = Math.max(frames[i], last + 1); out[n] = last; });
  return out;
}

const WALK = 0.9;

/** The woman's x on the bridge (she walks with the queue), and yours. */
const womanX = (f: number, k: T) => {
  // she stops while she answers you, then walks on with the queue
  const te = f < k.hmph ? f : f < k.walksOn ? k.hmph : f - (k.walksOn - k.hmph);
  return 1000 + (te - k.join) * WALK;
};
function youX(f: number, k: T) {
  const behind = womanX(f, k) - BRIDGE.queue.gap;
  const beside = womanX(f, k) - 105;
  if (f < k.join) return behind;
  if (f < k.walksOn) return mix(behind, beside, ramp(f, k.join, k.join + 40));
  return womanX(k.hmph, k) - 105;
}

/** The queue's offset so that its slot 3 is the woman and slot 2 is you. */
const queueOffset = (k: T) => {
  const Q = BRIDGE.queue;
  const span = Q.to - Q.from;
  return ((((1000 - k.join * WALK) - Q.from - 3 * Q.gap) % span) + span) % span;
};
/** The queue walks on, except for the woman (slot 3) and you (slot 2), who are drawn by the beat. */

/** The plaster inside her elbow (where she sold the pale part of her blood). */
function elbowOf(b: Body) {
  const j = joints(b.pose);
  const a = dir(b.pose.armF[0]);
  return { x: b.x + (j.shoulder.x + a.x * LIMB) * b.scale * b.facing, y: b.y + (j.shoulder.y + a.y * LIMB) * b.scale };
}

const SHRUG: Pose = { ...STAND, armF: [32, 108], armB: [-32, -108], tilt: -6 };

const BridgeShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const walking = frame < k.walksOn;
  const wx = womanX(frame, k);
  const yx = youX(frame, k);
  const shrugging = frame >= k.hmph && frame < k.walksOn;
  const shrugK = frame < k.shrug ? 0.5 * ramp(frame, k.hmph, k.hmph + 8) : ramp(frame, k.shrug, k.shrug + 8) * (1 - ramp(frame, k.walksOn - 10, k.walksOn));
  const wPose: Pose = shrugging ? { ...SHRUG, armF: [mix(30, 32, shrugK), mix(60, 108, shrugK)], armB: [mix(-10, -32, shrugK), mix(-20, -108, shrugK)] }
    : { ...walkPose(frame * 0.09 + 1.3), armF: [30, 60] };
  const woman: Body = { x: wx, y: BRIDGE.queue.y + 6, scale: 1.05, facing: 1, pose: wPose };
  const yPose: Pose = walking && frame < k.hmph ? walkPose(frame * 0.09) : { ...STAND, armB: [-7, 8], armF: frame >= k.say && frame < k.hmph ? [60, 30] : [9, 10] };
  const you: Body = { x: yx, y: BRIDGE.queue.y + 8, scale: 1.1, facing: 1, pose: yPose };
  const yh = headOf(you);
  const wh = headOf(woman);
  const el = elbowOf(woman);
  const shot = current(frame, [[k.start, "wide"], [k.know, "know"], [k.join, "join"], [k.walkTwo, "two"], [k.elbow, "elbow"],
    [k.say, "say"], [k.hmph, "her"], [k.shrug, "shrug"], [k.walksOn, "on"], [k.whose, "whose"]]);
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.start, { x: 900, y: 560, zoom: 1.0 }], [k.know, { x: 960, y: 580, zoom: 1.08 }]]),
    know: camAt(frame, [[k.know, closeUp(yh.x + 40, yh.y, 2.5)], [k.join, closeUp(yh.x + 40, yh.y - 20, 2.7)]]),
    join: { x: wx - 60, y: 690, zoom: 1.55 },
    two: { x: wx - 50, y: 660, zoom: 1.9 },
    elbow: { x: el.x + 10, y: el.y + 20, zoom: 4.2 },
    say: { x: (wx + yx) / 2 + 40, y: 620, zoom: 1.85 },
    her: closeUp(wh.x - 20, wh.y, 2.6),
    shrug: { x: wx - 20, y: 720, zoom: 1.7 },
    on: camAt(frame, [[k.walksOn, { x: yx + 200, y: 600, zoom: 1.25 }], [k.whose, { x: yx + 260, y: 590, zoom: 1.15 }]]),
    whose: camAt(frame, [[k.whose, closeUp(yh.x + 30, yh.y, 2.5)], [k.end, closeUp(yh.x + 30, yh.y, 2.7)]]),
  };
  const cam = drift(cams[shot], frame, "crumbs-bridge", 3);
  const youFace: Face = frame < k.know ? { brows: "none", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.1 } }
    : frame < k.join ? { brows: "raised", lids: 0, mouth: frame < k.know + 30 ? "o" : "smile", eyes: 1.2, look: { x: 0.4, y: -0.6 } }
      : frame < k.say ? { brows: "raised", lids: 0, mouth: "smile", eyes: 1.1, look: { x: 1, y: -0.1 } }
        : frame < k.hmph ? { brows: "raised", lids: 0, mouth: talk(frame, k.say + 2, k.hmph - 2, "smile"), eyes: 1.1, look: { x: 1, y: -0.1 } }
          : frame < k.whose ? { brows: "worry", lids: 0.1, mouth: "flat", eyes: 1, look: { x: 1, y: 0 } }
            : { brows: "worry", lids: 0.15, mouth: "frown", eyes: 1, look: { x: -0.4, y: -0.5 } };
  const herFace: Face = frame < k.hmph ? { brows: "none", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.2 } }
    : { brows: frame < k.notMine[0] ? "raised" : "flat", lids: 0.3, mouth: talk(frame, k.notMine[0], k.notMine[1], "flat"), eyes: 1, look: { x: -0.9, y: 0 } };
  const bag = (
    <g>
      <path d="M-12 -2 q12 -26 24 0" fill="none" stroke={INK} strokeWidth={4} />
      <rect x={-22} y={-2} width={44} height={52} rx={6} fill="#e6a0a0" stroke={INK} strokeWidth={4} />
    </g>
  );
  const facing = frame >= k.hmph && frame < k.walksOn ? -1 : 1;
  const herBody = { ...woman, facing } as Body;
  const people = (
    <>
      <Figure {...herBody} head={BRIDGE_WOMAN.head} coat={BRIDGE_WOMAN.coat} {...herFace} blink={blinking(frame, 6)} time={frame} held={shrugging ? undefined : bag} />
      {facing === 1 && <rect x={el.x - 13} y={el.y - 8} width={26} height={16} rx={6} fill="#f0d9b5" stroke={INK} strokeWidth={2.5} transform={`rotate(30 ${el.x} ${el.y})`} />}
      <You body={you} face={youFace} frame={frame} />
      <ThoughtCloud x={yh.x + 50} y={yh.y - 50} t={ramp(frame, k.know + 20, k.know + 34) * (1 - ramp(frame, k.join - 6, k.join))} size={110}>
        <g stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" transform="scale(0.8)">
          <path d="M-80 20 Q0 -50 80 20" /><path d="M-80 20 H80" />
          {[-50, -20, 20, 50].map((dx) => <line key={dx} x1={dx} y1={20} x2={dx} y2={-20 + Math.abs(dx) * 0.5} />)}
        </g>
      </ThoughtCloud>
      {/* you try the word on her (owner, v3: a hero bubble with a made-up word, so the moment reads) */}
      <Bubble frame={frame} at={k.say + 2} until={k.notMine[0]} x={yh.x + 30} y={yh.y - 62} text="Vesh-tarra?" size={40} side="left" />
    </>
  );
  return <BridgeScene frame={frame} mood="morning" cam={cam} queue={8} walk={WALK} skip={[2, 3]} offset={queueOffset(k)} actors={people} />;
};

// ------------------------------------------------------------------------------------------------ the kitchen

const seatPose = (b: Body, armF?: [number, number], extra: Partial<Pose> = {}): Body => ({ ...b, pose: { ...b.pose, ...(armF ? { armF } : {}), ...extra } });

const KitchenShot: React.FC<{ frame: number; k: T; mood: MoodName }> = ({ frame, k, mood }) => {
  const you0 = YOU_SEAT;
  const bro0 = BRO_SEAT;
  const yh = headOf(you0);
  const bh = headOf(bro0);
  const spoon = <Spoon rot={-140} s={1} y={-6} />;
  // which morning is on
  if (frame < k.showerWide) {
    // morning two: the drawing
    const drawing = frame >= k.draw && frame < k.turn;
    const jiggle = drawing ? Math.sin(frame * 1.3) * 6 : 0;
    const you = seatPose(you0, frame < k.turn ? aimArm(you0, { x: 720 + jiggle, y: TABLE.top - 20 }) : aimArm(you0, { x: 690, y: 690 }));
    const turn = ramp(frame, k.turn, k.turn + 10);
    const bTilt = frame < k.tiltA ? 0 : frame < k.tiltB ? 14 : frame < k.looks ? -14 : 0;
    const bro = seatPose(bro0, undefined, { tilt: mix(0, bTilt, ramp(frame, frame < k.tiltB ? k.tiltA : k.tiltB, (frame < k.tiltB ? k.tiltA : k.tiltB) + 6)) });
    const youFace: Face = frame < k.crave ? { brows: "none", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 0.6, y: 0.2 } }
      : frame < k.draw ? { brows: "raised", lids: 0.2, mouth: "o", eyes: 1.1, look: { x: 0.2, y: -0.8 } }
        : frame < k.turn ? { brows: "angry", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 0.7, y: 0.8 } }
          : frame < k.offended ? { brows: "raised", lids: 0, mouth: "smile", eyes: 1.1, look: { x: 1, y: 0 } }
            : { brows: "angry", lids: 0.3, mouth: "frown", eyes: 1, look: { x: 0.6, y: 0.6 } };
    const broFace: Face = frame < k.squint ? { brows: "none", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.6, y: 0.4 } }
      : { brows: "flat", lids: frame < k.looks ? 0.55 : 0.4, mouth: talk(frame, k.shoeLine[0], k.shoeLine[1], "flat"), eyes: 1,
        look: frame < k.looks ? { x: 0.9, y: 0.5 } : { x: 1, y: -0.1 } };
    const held = frame < k.turn ? (drawing || frame < k.draw ? <Crayon /> : undefined) : <HeldPage turn={turn} />;
    const page = frame < k.turn ? (
      <g><rect x={640} y={TABLE.top - 12} width={170} height={8} fill="#f3e9d7" stroke={INK} strokeWidth={2} /></g>
    ) : null;
    const shot = current(frame, [[k.start, "wide"], [k.crave, "crave"], [k.tongue, "tongue"], [k.turn, "two"], [k.squint, "bro"], [k.offended, "you"]]);
    const cams: Record<typeof shot, Camera> = {
      wide: camAt(frame, [[k.start, { x: 940, y: 600, zoom: 1.12 }], [k.crave, { x: 930, y: 620, zoom: 1.25 }]]),
      crave: camAt(frame, [[k.crave, closeUp(yh.x + 40, yh.y, 2.5)], [k.draw, closeUp(yh.x + 40, yh.y, 2.75)]]),
      tongue: closeUp(yh.x + 70, yh.y + 30, 2.4),
      two: { x: 945, y: 650, zoom: 1.5 },
      bro: camAt(frame, [[k.squint, closeUp(bh.x - 40, bh.y, 2.6)], [k.offended, closeUp(bh.x - 40, bh.y, 2.85)]]),
      you: closeUp(yh.x + 50, yh.y, 2.6),
    };
    return (
      <KitchenTable frame={frame} cam={drift(cams[shot], frame, "crumbs-k2", 3)} mood={mood}
        you={{ body: you, face: youFace, held, tongue: frame >= k.tongue && frame < k.turn }} brother={{ body: bro, face: broFace, held: spoon }} onTable={page} />
    );
  }
  if (frame < k.bridge) {
    // morning four: the fitted sheet; his spoon
    const standing: Body = { x: 560, y: TABLE.floor + 20, scale: 1.15, facing: 1, pose: STAND };
    standing.pose = { ...STAND, armF: frame < k.fold ? aimArm(standing, { x: 690, y: 640 }) : [40, 20], armB: frame < k.fold ? [60, 60] : [-7, 8] };
    const sh = headOf(standing);
    const drop = ramp(frame, k.slip, k.lands);
    const proud = frame >= k.proud;
    const youFace: Face = frame < k.fold ? { brows: "angry", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 0.7, y: -0.2 } }
      : { brows: "raised", lids: 0.35, mouth: "smile", eyes: 1, look: { x: 1, y: 0.1 } };
    const broFace: Face = frame < k.jaw ? { brows: "none", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 1, y: 0.2 } }
      : { brows: "raised", lids: 0, mouth: "open", eyes: 1.35, look: { x: 1, y: 0.4 } };
    const bro = seatPose(bro0, frame < k.slip ? [40, 60] : [10, 10]);
    const sx = mix(1225, 1200, drop);
    const sy = mix(735, TABLE.floor - 6, drop * drop);
    const shot = current(frame, [[k.sheet, "two"], [k.proud, "proud"], [k.jaw, "jaw"]]);
    const cams: Record<typeof shot, Camera> = {
      two: camAt(frame, [[k.sheet, { x: 930, y: 640, zoom: 1.4 }], [k.fold, { x: 920, y: 630, zoom: 1.55 }]]),
      proud: { x: 900, y: 640, zoom: 1.6 },
      jaw: camAt(frame, [[k.jaw, closeUp(bh.x - 40, bh.y + 20, 2.4)], [k.floor, closeUp(bh.x - 40, bh.y + 30, 2.2)]]),
    };
    void sh;
    return (
      <KitchenTable frame={frame} cam={drift(cams[shot], frame, "crumbs-k4", 3)} mood={mood}
        you={{ body: standing, face: youFace, held: frame < k.fold ? <SheetBlob /> : undefined, seated: false }}
        brother={{ body: bro, face: broFace, held: frame < k.slip ? spoon : undefined }}
        onTable={proud ? <SheetSquare x={760} /> : null}
        extra={frame >= k.slip ? <Spoon x={sx} y={sy} rot={mix(-140, 260, drop)} /> : null} />
    );
  }
  // Saturday: the palm, the light under the cap; the notebook; keep it; the phone; the jar and the clock
  const light = ramp(frame, k.capLight, k.capLight + 14);
  const palm = frame >= k.saturday && frame < k.slap;
  const bro = seatPose(bro0, palm ? aimArm(bro0, { x: 1080, y: 690 }) : frame >= k.writes ? aimArm(bro0, { x: 1040, y: TABLE.top - 8 }) : undefined);
  const youArm = frame >= k.temple && frame < k.phoneHand ? aimArm(you0, { x: yh.x + 34, y: yh.y - 6 })
    : frame >= k.phoneHand && frame < k.jar ? aimArm(you0, { x: 650, y: 700 }) : frame >= k.sorry && frame < k.writes ? aimArm(you0, { x: 590, y: 760 }) : undefined;
  const you = seatPose(you0, youArm, frame >= k.sorry && frame < k.writes ? { lean: 8, tilt: -8 } : {});
  const youFace: Face = frame < k.youShock ? { brows: "none", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.2 } }
    : frame < k.slap ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.3, look: { x: 1, y: -0.2 } }
      : frame < k.sorry ? { brows: "none", lids: 0.2, mouth: "smile", eyes: 1, look: { x: 0.8, y: 0.5 } }
        : frame < k.writes ? { brows: "raised", lids: 0.55, mouth: talk(frame, k.sorry + 4, k.writes - 4, "smirk"), eyes: 1, look: { x: 0.9, y: -0.3 } }
          : frame < k.temple ? { brows: "none", lids: 0.2, mouth: "smile", eyes: 1, look: { x: 1, y: 0 } }
            : frame < k.phoneHand ? { brows: "raised", lids: 0.3, mouth: "smile", eyes: 1, look: { x: 0.6, y: -0.4 } }
              : frame < k.jar ? { brows: "none", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.8 } }
                : frame < k.eyesClock ? { brows: "worry", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 1, y: 0.7 } }
                  : { brows: "angry", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 0.1, y: -1 } };
  const broFace: Face = frame < k.slap ? { brows: "raised", lids: 0.1, mouth: talk(frame, k.whatd[0], k.whatd[1], "smile"), eyes: 1, look: { x: 1, y: -0.1 } }
    : frame < k.sorry ? { brows: "none", lids: 0.3, mouth: "smile", eyes: 1, look: { x: 1, y: 0.4 } }
      : frame < k.keep ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 1, y: 0 } }
        : { brows: "none", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 1, y: 0.2 } };
  const held = frame >= k.phoneHand && frame < k.jar ? (
    <g transform="rotate(-8) translate(-8 -44)"><rect x={-16} y={-4} width={34} height={58} rx={6} fill="#1b1d24" /><rect x={-13} y={0} width={28} height={48} rx={3} fill="#cfe9f4" /></g>
  ) : undefined;
  const notebook = frame >= k.slap ? <rect x={900} y={TABLE.top - 12} width={210} height={10} fill="#5a6488" stroke={INK} strokeWidth={2} /> : null;
  const coins = frame >= k.eight ? (
    <CoinArc frame={frame} start={k.eight + 2} end={k.eight + 30} from={{ x: 980, y: 420 }} via={{ x: 960, y: 480 }} to={{ x: 940, y: TABLE.top - 80 }} every={4} fall={14} r={14} />
  ) : null;
  const jarFill = frame < k.eight ? 0.25 : mix(0.25, 0.33, linear(frame, k.eight, k.eight + 44));
  const clockT = frame < k.clock ? 1.2 : 1.2 + (frame - k.clock) * 0.35;
  // the clock is on the back wall (depth 0.85): aim the camera where the layer draws it
  const onWall = (x: number, d: number, ref: number) => (x - ref * (1 - d)) / d;
  const shot = current(frame, [[k.saturday, "wide"], [k.capLight, "cap"], [k.youShock, "shock"], [k.whatd[0] - 10, "bro"], [k.slap, "two"],
    [k.smug, "smug"], [k.sorry, "sorry"], [k.writes, "two2"], [k.keep, "keep"], [k.temple, "temple"], [k.phoneHand, "phone"],
    [k.jar, "jar"], [k.eyesJar, "eyesJar"], [k.eight, "jar8"], [k.clock, "clock"], [k.eyesClock, "eyesClock"]]);
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.saturday, { x: 960, y: 600, zoom: 1.1 }], [k.capLight, { x: 980, y: 620, zoom: 1.25 }]]),
    cap: camAt(frame, [[k.capLight, closeUp(bh.x - 20, bh.y - 30, 3.2)], [k.youShock, closeUp(bh.x - 20, bh.y - 30, 3.5)]]),
    shock: closeUp(yh.x + 40, yh.y, 2.7),
    bro: camAt(frame, [[k.whatd[0] - 10, { x: bh.x - 160, y: bh.y + 60, zoom: 2.1 }], [k.slap, { x: bh.x - 170, y: bh.y + 60, zoom: 2.25 }]]),
    two: { x: 945, y: 650, zoom: 1.45 },
    smug: closeUp(bh.x - 40, bh.y, 2.6),
    sorry: camAt(frame, [[k.sorry, closeUp(yh.x + 50, yh.y + 10, 2.5)], [k.writes, closeUp(yh.x + 50, yh.y + 10, 2.7)]]),
    two2: { x: 945, y: 650, zoom: 1.45 },
    keep: camAt(frame, [[k.keep, { x: 900, y: 640, zoom: 1.35 }], [k.temple, { x: 880, y: 640, zoom: 1.45 }]]),
    temple: closeUp(yh.x + 40, yh.y, 2.6),
    phone: camAt(frame, [[k.phoneHand, { x: 680, y: 650, zoom: 1.9 }], [k.captcha, { x: 670, y: 660, zoom: 2.1 }]]),
    jar: camAt(frame, [[k.jar, insert(940, TABLE.top - 80, 3.0)], [k.eyesJar, insert(940, TABLE.top - 80, 3.3)]]),
    eyesJar: closeUp(yh.x + 50, yh.y + 10, 2.6),
    jar8: insert(940, TABLE.top - 110, 2.8),
    clock: camAt(frame, [[k.clock, insert(onWall(CLOCK.x, 0.85, 960), onWall(CLOCK.y, 0.85, 540), 4.2)], [k.eyesClock, insert(onWall(CLOCK.x, 0.85, 960), onWall(CLOCK.y, 0.85, 540), 4.6)]]),
    eyesClock: closeUp(yh.x + 40, yh.y - 10, 2.6),
  };
  return (
    <KitchenTable frame={frame} cam={drift(cams[shot], frame, "crumbs-k6", 3)} mood={mood} jar={frame >= k.jar ? jarFill : frame >= k.keep ? 0.25 : null}
      clock={clockT} you={{ body: you, face: youFace, held }} brother={{ body: bro, face: broFace, light, two: true, bowl: true }}
      onTable={notebook} extra={<>
        {coins}
        {/* "You wake saying sorry in a voice that isn't yours": your bubble by your mouth */}
        {(() => { const h = headOf(you); return <Bubble frame={frame} at={k.sorry + 4} until={k.writes} x={h.x + 58} y={h.y - 8} text="Sorry." size={40} />; })()}
        {/* v5: two teal lights under his cap. Your bubble: "Two?" */}
        {(() => { const h = headOf(you); return <Bubble frame={frame} at={k.youShock + 2} until={k.whatd[0]} x={h.x + 58} y={h.y - 40} text="Two?" size={40} />; })()}
      </>} />
  );
};

// ------------------------------------------------------------------------------------------------ the shower

const ShowerShot: React.FC<{ frame: number; k: T; mood: MoodName }> = ({ frame, k, mood }) => {
  const humming = frame < k.bangs[0];
  const youFace: Face = humming ? { brows: "raised", lids: 0.9, mouth: "o", eyes: 1, look: { x: 0.6, y: -0.3 } }
    : frame < k.backHum ? { brows: "raised", lids: 0, mouth: "flat", eyes: 1.25, look: { x: 1, y: 0 } }
      : { brows: "raised", lids: 0, mouth: "o", eyes: 1.35, look: { x: 1, y: -0.1 } };
  const sit = frame < k.granUp ? 1 : 0;
  const granFace: Face = frame < k.granWakes ? { brows: "none", lids: 0.6, mouth: "smile", eyes: 1, look: { x: 0.6, y: 0.4 } }
    : frame < k.bangs[0] - 10 ? { brows: "angry", lids: 0.25, mouth: "frown", eyes: 1, look: { x: 1, y: 0 } }
      : frame < k.backHum ? { brows: "angry", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 1, y: 0 } }
        : { brows: "raised", lids: 0.85, mouth: "o", eyes: 1, look: { x: 1, y: -0.2 } };
  const shot = current(frame, [[k.showerWide, "wide"], [k.hum, "hum"], [k.granWakes, "gran"], [k.fist, "wall"], [k.frozen, "frozen"],
    [k.backHum, "wall2"], [k.both, "both"], [k.stare, "stare"], [k.granHum, "granHum"]]);
  const yHead = { x: SHOWER.you.x, y: SHOWER.you.y - 304 * SHOWER.you.scale };
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.showerWide, { x: 960, y: 560, zoom: 1.0 }], [k.hum, { x: 940, y: 570, zoom: 1.08 }]]),
    hum: camAt(frame, [[k.hum, closeUp(yHead.x + 60, yHead.y, 2.3)], [k.granWakes, closeUp(yHead.x + 80, yHead.y - 20, 2.5)]]),
    gran: camAt(frame, [[k.granWakes, { x: 1330, y: 640, zoom: 1.7 }], [k.fist, { x: 1250, y: 640, zoom: 1.85 }]]),
    wall: { x: 1060, y: 640, zoom: 2.3 },
    frozen: closeUp(yHead.x + 60, yHead.y, 2.5),
    wall2: { x: 900, y: 620, zoom: 1.9 },
    both: camAt(frame, [[k.both, { x: 900, y: 600, zoom: 1.2 }], [k.stare, { x: 880, y: 610, zoom: 1.3 }]]),
    stare: closeUp(yHead.x + 60, yHead.y, 2.6),
    granHum: closeUp(1110, 656, 2.6),
  };
  const notes = [
    { from: k.hum - 30, to: k.bangs[0] - 6, dir: 1 as const, color: "#f2b632" },
    { from: k.backHum, to: k.granHum + 30, dir: -1 as const, color: "#c9a0d6" },
  ];
  return (
    <ShowerStage frame={frame} cam={drift(cams[shot], frame, "crumbs-shower", 3)} mood={mood}
      you={{ face: youFace, soap: frame >= k.frozen }} gran={{ sit, fist: frame >= k.fist ? 1 : 0, face: granFace, hum: frame >= k.backHum }}
      bangs={k.bangs} notes={notes} />
  );
};

// ------------------------------------------------------------------------------------------------ the inserts

const Inserts: React.FC<{ frame: number; k: T; mood: MoodName }> = ({ frame, k, mood }) => {
  // the crayon drawing (morning two)
  if (frame >= k.draw && frame < k.tongue) {
    const cam = drift(camAt(frame, [[k.draw, { x: 960, y: 560, zoom: 1.0 }], [k.tongue, { x: 960, y: 560, zoom: 1.12 }]]), frame, "crumbs-draw", 3);
    const p = linear(frame, k.drawLines[0], k.drawLines[1]);
    const hx = mix(640, 1290, Math.min(1, p * 1.2));
    const hy = 700 - Math.sin(p * Math.PI * 3) * 140;
    return (
      <TopDown frame={frame} cam={cam} mood={mood}>
        <ShoeDrawing from={k.drawLines[0]} to={k.drawLines[1]} />
        <TopHand x={hx + 30} y={hy + 150} crayon />
      </TopDown>
    );
  }
  // the fitted sheet folding
  if (frame >= k.fold && frame < k.proud) {
    const stage = frame < k.folds[0] ? 0 : frame < k.folds[1] ? 1 + (frame - k.folds[0]) / 100 : frame < k.folds[2] ? 2 + (frame - k.folds[1]) / 100 : 3 + (frame - k.folds[2]) / 100;
    return (
      <TopDown frame={frame} cam={drift({ x: 960, y: 560, zoom: 1.75 }, frame, "crumbs-fold", 3)} mood={mood}>
        <FoldingSheet stage={stage} frame={frame} />
      </TopDown>
    );
  }
  // the spoon on the floor
  if (frame >= k.floor && frame < k.bridge) {
    const p = linear(frame, k.floor, k.lands);
    const bounce = frame > k.lands ? Math.abs(Math.sin((frame - k.lands) / 3)) * 30 * Math.max(0, 1 - (frame - k.lands) / 18) : 0;
    return (
      <TopDown frame={frame} cam={drift({ x: 960, y: 560, zoom: 1.1 }, frame, "crumbs-floor", 3)} mood={mood} surface="floor">
        <Spoon x={mix(1300, 960, p)} y={mix(-100, 560, p) - bounce} rot={mix(-60, 200, p) + bounce} s={3} />
      </TopDown>
    );
  }
  // the notebook's two columns
  if ((frame >= k.book && frame < k.knot) || (frame >= k.writes && frame < k.page)) {
    return (
      <TopDown frame={frame} cam={drift(camAt(frame, [[k.book, { x: 960, y: 560, zoom: 1.0 }], [k.knot, { x: 960, y: 600, zoom: 1.12 }]]), frame, "crumbs-book", 3)} mood={mood}>
        <Notebook frame={frame} open={ramp(frame, k.book, k.book + 10)} crumbs={k.crumbs} />
        {frame >= k.writes && <TopHand x={640 + Math.sin(frame / 3) * 20} y={760} rot={30} color="#f0a98e" />}
      </TopDown>
    );
  }
  // the knot
  if (frame >= k.knot && frame < k.smug) {
    return (
      <TopDown frame={frame} cam={drift({ x: 960, y: 560, zoom: 1.05 }, frame, "crumbs-knot", 3)} mood={mood}>
        <KnotInsert frame={frame} from={k.knot + 4} to={k.smug - 6} />
      </TopDown>
    );
  }
  // the page: the scientist, the corridor, the heart
  if (frame >= k.page && frame < k.keep) {
    const cam = frame < k.corridor
      ? drift(camAt(frame, [[k.page, { x: 960, y: 560, zoom: 1.0 }], [k.corridor, { x: 960, y: 520, zoom: 1.1 }]]), frame, "crumbs-page", 3)
      : drift({ x: 960, y: 560, zoom: 1.0 }, frame, "crumbs-page2", 3);
    return (
      <PageStage cam={cam} mood={mood}>
        {frame < k.corridor && <DreamingScientist frame={frame} bed={linear(frame, k.bed - 6, k.bed + 6) + (frame < k.bed - 6 ? 0 : 0)} dream={linear(frame, k.dream, k.dream + 12)} />}
        {frame >= k.corridor && frame < k.heart && <NightCorridor frame={frame} from={k.corridor} to={k.heart} />}
        {frame >= k.heart && <HeartOnBench frame={frame} from={k.heart} />}
      </PageStage>
    );
  }
  // the box of squiggly letters
  if (frame >= k.captcha && frame < k.papers) {
    const typed = linear(frame, k.captcha + 12, k.papers - 14);
    return <CaptchaPhone frame={frame} cam={drift(camAt(frame, [[k.captcha, { x: 1180, y: 520, zoom: 1.45 }], [k.papers, { x: 1180, y: 500, zoom: 1.6 }]]), frame, "crumbs-cap", 3)}
      mood={mood} typed={typed} thumb={0.2 + typed * 0.6} />;
  }
  // the newspapers coming out as clean lines
  if (frame >= k.papers && frame < k.night) {
    const cam = camAt(frame, [[k.papers, { x: 820, y: 580, zoom: 1.05 }], [k.fast, { x: 760, y: 600, zoom: 1.2 }], [k.night, { x: 700, y: 600, zoom: 1.4 }]]);
    return <CaptchaPhone frame={frame} cam={drift(cam, frame, "crumbs-papers", 3)} mood={mood} typed={1} thumb={null}
      extra={<Newspapers frame={frame} from={k.papers + 8} fast={k.fast} every={16} />} />;
  }
  return null;
};

const CrumbsShot: React.FC<{ frame: number; k: T; mood: MoodName }> = ({ frame, k, mood }) => {
  const ins = <Inserts frame={frame} k={k} mood={mood} />;
  const isInsert = (frame >= k.draw && frame < k.tongue) || (frame >= k.fold && frame < k.proud) || (frame >= k.floor && frame < k.bridge)
    || (frame >= k.book && frame < k.smug) || (frame >= k.writes && frame < k.keep) || (frame >= k.captcha && frame < k.night);
  if (isInsert) return ins;
  if (frame >= k.showerWide && frame < k.sheet) return <ShowerShot frame={frame} k={k} mood={mood} />;
  if (frame >= k.bridge && frame < k.saturday) return <BridgeShot frame={frame} k={k} />;
  if (frame >= k.night && frame < k.jar) {
    return <BunkRoom frame={frame} mood="night" view={{ x: 900, y: 560, zoom: mix(1.15, 1.0, linear(frame, k.night, k.jar)) }}
      device={{ on: k.night - 4 }} coins={{ from: k.coinsNight }} jarFill={0.5} />;
  }
  return <KitchenShot frame={frame} k={k} mood={mood} />;
};

/** The v5 moments (V5.Crumbs) drawn over the old beat's picture where their lines play; the beat's sound runs on. */
function v5Moment(frame: number, v3: Clip[], mood: MoodName) {
  if (!isV5(v3)) return null;
  const chair = chairSpan(v3);
  if (frame >= chair.from && frame < chair.to) return <ChairAgain frame={frame} v3={v3} />;
  const two = twoBandsSpan(v3);
  if (frame >= two.from && frame < two.to) return <TwoBands frame={frame} v3={v3} mood={mood} />;
  return null;
}

const Crumbs: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = times(shot.clips, shot.from, shot.to);
  const i = Math.max(17, shot.clips.findIndex((c, n) => n >= 17 && shot.frame < c.from + c.frames + 11));
  const mood = (shot.lines[i]?.mood ?? "morning") as MoodName;
  const kitchenMood: MoodName = mood === "day" ? "morning" : mood;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {v5Moment(shot.frame, shot.v3, kitchenMood) ?? <CrumbsShot frame={shot.frame} k={k} mood={kitchenMood} />}
      {k.bangs.map((b) => <Sequence key={b} from={b} durationInFrames={20}><Audio src={staticFile("sfx/knock.wav")} volume={0.55} /></Sequence>)}
      <ClinkSound at={[k.lands, k.lands + 7]} volume={0.9} />
      <Sequence from={k.slap} durationInFrames={20}><Audio src={staticFile("sfx/paper.wav")} volume={0.4} /></Sequence>
      {k.jar - k.night > 30 && <DeviceSound at={k.night - 4} frames={k.jar - k.night} volume={0.8} />}
      {k.jar - k.night > 30 && <ClinkSound at={landings(k.coinsNight, k.jar - 30)} volume={0.6} />}
      <ClinkSound at={landings(k.eight + 2, k.eight + 30, 4, 14)} volume={0.7} />
    </AbsoluteFill>
  );
};

export const crumbs: Beat = { id: "crumbs", firstLine: 17, Component: Crumbs };
