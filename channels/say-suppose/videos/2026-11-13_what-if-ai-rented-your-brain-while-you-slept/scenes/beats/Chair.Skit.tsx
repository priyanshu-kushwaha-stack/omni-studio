// The clinic skit (The Chair, and the first two shots of Night One): every frame from the narration clips, and the
// clinic room with you in the chair, the man in the grey suit, the nurse, the band and the pale second you.
import { walkPose, tiptoePose, SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import type { Expression } from "@whatif/kit/rig/expressions";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { INK } from "@whatif/kit/theme";
import { BandBox, Band, Bubble, Coin, CoinArc, deviceAt, Ghost, PaperCap, Thread } from "../parts";
import { BROKER, camAt, GHOST, HERO, lineEnd, mix, NURSE, ramp } from "../shared";
import { CLINIC, ClinicArmrest, ClinicChair, ClinicDoorPanel, ClinicScene, seatedInChair } from "../sets/Clinic";
import { aim, BAND_LIGHT, BandOnHead, Body, handWorld, HeadGear, headToWorld, headWorld, lineAt, Notes, talk, toWorld, type Placed } from "./Chair.Rig";

export type SkitT = ReturnType<typeof skitTimes>;

/** Every frame of the skit, from script v6's clips (shot.v6, story.json numbering): 0 the broker's coin line, 1 the
 *  nurse, 2 the broker's band line, 3 the premise (over the shut door). Before line 0 (3.4 s), all close: 1.5 s you doze
 *  and the grey suit lays the band on (the chime), 1.5 s the pale second you rises big in frame and types, a coin drops
 *  into your palm. Line 0 lands on the coin. The nurse's 2 s hold follows it. */
export function skitTimes(clips: Clip[]) {
  const at = (i: number, p: number) => lineAt(clips, i, p);
  const L = clips[0].from;
  const band = 36; // the band on your forehead: the chime
  const coin = 66; // one coin leaves the desk's edge
  const pluck = lineEnd(clips, 0) + 10; // the nurse takes the band off
  const shut = clips[3].from;
  const thatsIt = lineEnd(clips, 1) + 1;
  return {
    L,
    face: 0, // close on you dozing, eyelids dropping; his grey arm lays the band on
    walk: [2, 22] as const,
    lift: 22,
    band,
    stepBack: [band + 8, band + 30] as const,
    ghostShot: 45, // the ghost rises big in frame
    coin,
    landed: coin + 18,
    coinShot: at(0, 0.48), // "One coin.": close on the coin in your palm
    nurseWalk: [at(0, 0.2), lineEnd(clips, 0) + 2] as const,
    pluckShot: lineEnd(clips, 0) + 2,
    pluck,
    wake: pluck + 6,
    drop: [pluck + 14, pluck + 28] as const, // the band into his box
    notesShot: pluck + 34,
    cotton: [pluck + 36, pluck + 52] as const,
    nurseLine: [clips[1].from, lineEnd(clips, 1)] as const, // "That's all the plasma we can take this week. Come back Thursday."
    notes: [at(1, 0.08), at(1, 0.34), at(1, 0.6)] as const,
    nurseClose: at(1, 0.64),
    thatsIt, // hold, 1 s: you look at the three notes; your bubble "That's it?"
    twoShot: thatsIt + 18, // at the door he tips his head at the coin in your fist
    point: [thatsIt + 20, clips[2].from - 6] as const,
    coinLine: [thatsIt + 18, clips[2].from - 4] as const,
    talk: [[clips[0].from, lineEnd(clips, 0)], [clips[2].from, lineEnd(clips, 2)]] as const,
    bandShot: clips[2].from - 2, // "Wear this tonight. Sleep all night, and get paid for every hour." the band held out
    bandOut: clips[2].from - 4,
    bandLine: [clips[2].from, lineEnd(clips, 2)] as const,
    brokerWalk: [pluck + 40, pluck + 96] as const, // back to the door during her line
    take: lineEnd(clips, 2) - 16, // close: the notes, the coin, the band; you take it
    grab: lineEnd(clips, 2) - 2,
    shut, // line 3: the door swings shut on his back, the band in your hand, its light on
    doorClose: [shut + 2, shut + 26] as const,
  };
}

const C = CLINIC.chair;
const G = { x: 1050, y: 572, scale: 0.9 };
/** Your arms in the chair: the near hand on the armrest (palm up), the far hand on your lap. */
const REST: Pose = { ...SEATED, armF: [30, 60], armB: [40, 50] };
const OPEN: Pose = { ...SEATED, armF: [30, 60], armB: [55, 40] };

type Face = Partial<Expression> & { blink?: boolean; look?: { x: number; y: number } };

/** Where you are in the chair this frame, and your face. */
function you(frame: number, k: SkitT): { f: Placed; face: Face } {
  const jolt = ramp(frame, k.wake, k.wake + 4) * 12 - ramp(frame, k.wake + 4, k.wake + 14) * 6;
  const pose: Pose = { ...(frame >= k.notesShot ? OPEN : REST) };
  const f = { ...seatedInChair(pose, jolt), pose };
  const counting = Math.floor(frame / 7) % 2 === 0 ? "o" : "flat";
  let face: Face;
  if (frame < k.band) {
    const lids = Math.max(ramp(frame, k.face + 10, k.face + 16) - ramp(frame, k.face + 20, k.face + 24), ramp(frame, k.face + 27, k.face + 34));
    face = lids > 0.95 ? { blink: true, mouth: "smile" } : { brows: "flat", lids: lids * 0.85, mouth: counting, eyes: 1, look: { x: 0.8, y: -0.6 } };
  } else if (frame < k.wake) face = { blink: true, mouth: "smile" };
  else if (frame < k.notesShot) face = { brows: "raised", lids: 0, mouth: "o", eyes: 1.3, look: { x: 0.6, y: 0.5 } };
  else if (frame < k.thatsIt) face = { brows: "flat", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.7, y: 0.5 } };
  // the hold: you look down at the three notes in your palm. "That's it?"
  else if (frame < k.twoShot) face = { brows: "worry", lids: 0.15, mouth: talk(frame, k.thatsIt + 4, k.thatsIt + 16, "frown"), eyes: 1.1, look: { x: 0.15, y: 1 } };
  else if (frame >= k.point[0] && frame < k.bandOut) face = { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.5, y: 0.8 } };
  else face = { brows: "raised", lids: 0.1, mouth: "flat", eyes: 1, look: { x: -0.9, y: 0 } };
  return { f, face };
}

/** The band's world point while it is on your head. */
const bandPoint = (f: Placed) => headToWorld(f, { x: 0, y: -28 });

/** The man in the grey suit: across the room on tiptoe, the band on, back a step, then back to the door. At the door,
 *  line 1: he tips his head and points his BACK arm (he faces left) at the coin in your fist, the band low in his front
 *  hand; line 2: he holds the band out. */
function broker(frame: number, k: SkitT, yf: Placed): { f: Placed; band: "hand" | "none"; face: Face } {
  const D = CLINIC.spots.doorway.x;
  const near = 1250;
  const off = 1395;
  const x = frame < k.stepBack[0]
    ? mix(1340, near, ramp(frame, k.walk[0], k.walk[1]))
    : frame < k.brokerWalk[0]
      ? mix(near, off, ramp(frame, k.stepBack[0], k.stepBack[1]))
      : mix(off, D, ramp(frame, k.brokerWalk[0], k.brokerWalk[1]));
  const moving = (frame > k.walk[0] && frame < k.walk[1]) || (frame > k.stepBack[0] && frame < k.stepBack[1])
    || (frame > k.brokerWalk[0] && frame < k.brokerWalk[1]);
  let pose: Pose = moving ? (frame < k.walk[1] ? tiptoePose(frame * 0.32) : walkPose(frame * 0.3)) : STAND;
  const f: Placed = { x, y: CLINIC.floor - 10, scale: C.scale, facing: -1, pose };
  if (frame >= k.lift && frame < k.band + 6) {
    pose = { ...STAND, lean: 10, armF: aim({ ...f, pose: { ...STAND, lean: 10 } }, bandPoint(yf)) };
  } else if (frame >= k.bandOut) {
    // line 2: at the door, holding the band out again
    pose = { ...STAND, armF: [78, 18] };
  } else if (frame >= k.coinLine[0] - 12) {
    // line 1: he tips his head at the coin in your fist, then points at it with his back arm
    const tip = Math.sin(ramp(frame, k.coinLine[0] - 12, k.coinLine[0] + 10) * Math.PI) * -12;
    const p = ramp(frame, k.point[0] - 6, k.point[0] + 6) * (1 - ramp(frame, k.bandOut - 8, k.bandOut));
    const at = aim({ ...f, pose: STAND }, handWorld(yf, "armF"));
    pose = { ...STAND, tilt: tip, armF: [14, 12], armB: [mix(STAND.armB[0], at[0], p), mix(STAND.armB[1], at[1], p)] };
  }
  const band = frame < k.band || frame >= k.coinLine[0] - 12 ? "hand" : "none";
  const line = k.talk.find(([a, b]) => frame >= a && frame < b) ?? null;
  const face: Face = frame < k.band + 6
    ? { brows: "raised", lids: 0.1, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.3 } }
    : line ? { brows: "flat", lids: 0.25, mouth: Math.floor((frame - line[0]) / 5) % 3 === 0 ? "smirk" : "open", eyes: 1, look: { x: 1, y: 0.1 } }
      : { brows: "flat", lids: 0.3, mouth: "smirk", eyes: 1, look: { x: 0.9, y: 0.2 } };
  return { f: { ...f, pose }, band, face };
}

/** The nurse: in through the door, behind the chair, the tube and the band at once, the band into his box; then (after a
 *  cut) at the front of the chair with the cotton and the three notes. */
function nurse(frame: number, k: SkitT, yf: Placed, box: { x: number; y: number }): { f: Placed; behind: boolean; band: boolean; face: Face } | null {
  if (frame < k.nurseWalk[0]) return null;
  const elbow = toWorld(yf, { x: 28, y: -163 });
  if (frame < k.notesShot) {
    const x = mix(1760, 1235, ramp(frame, k.nurseWalk[0], k.nurseWalk[1]));
    const moving = frame < k.nurseWalk[1];
    const base: Placed = { x, y: CLINIC.floor - 20, scale: C.scale, facing: -1, pose: moving ? walkPose(frame * 0.33) : STAND };
    let pose = base.pose;
    if (frame >= k.pluck - 5 && frame < k.drop[0]) {
      pose = { ...STAND, lean: 6, armB: aim({ ...base, pose: { ...STAND, lean: 6 } }, bandPoint(yf)), armF: aim({ ...base, pose: { ...STAND, lean: 6 } }, elbow) };
    } else if (frame >= k.drop[0] && frame < k.drop[1] + 4) {
      pose = { ...STAND, armB: aim({ ...base, pose: STAND }, { x: box.x, y: box.y - 40 }) };
    }
    const face: Face = { brows: "flat", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 0.7, y: 0.5 } };
    return { f: { ...base, pose }, behind: true, band: frame >= k.pluck && frame < k.drop[1], face };
  }
  // at the front of the chair, facing you
  const base: Placed = { x: 790, y: CLINIC.floor - 20, scale: C.scale, facing: 1, pose: STAND };
  const palm = handWorld(yf, "armB");
  const note = k.notes.findIndex((n) => frame >= n - 8 && frame < n + 6);
  const target = frame < k.cotton[1] ? elbow : note >= 0 ? { x: palm.x - 6, y: palm.y - 10 } : { x: palm.x - 70, y: palm.y + 30 };
  const pose: Pose = { ...STAND, lean: 4, armF: aim({ ...base, pose: { ...STAND, lean: 4 } }, target), armB: [20, 70] };
  const talking = frame >= k.nurseLine[0] && frame < k.nurseLine[1];
  const step = Math.floor((frame - k.nurseLine[0]) / 5) % 4;
  const face: Face = { brows: "flat", lids: 0.3, mouth: talking ? (["open", "flat", "o", "flat"] as const)[step] : "flat", eyes: 1, look: { x: 0.8, y: talking ? -0.1 : 0.4 } };
  return { f: { ...base, pose }, behind: false, band: false, face };
}

const Nurse: React.FC<{ n: NonNullable<ReturnType<typeof nurse>> }> = ({ n }) => (
  <g>
    <Body f={n.f} head={NURSE.head} coat={NURSE.coat} {...n.face} />
    <HeadGear f={n.f}><PaperCap x={0} y={0} r={46} /></HeadGear>
    {n.band && (() => { const h = handWorld(n.f, "armB"); return <Band x={h.x} y={h.y + 8} scale={0.62} lit={false} />; })()}
  </g>
);

/** The clinic with everyone in it at this frame, through `cam`. */
export const SkitRoom: React.FC<{ frame: number; k: SkitT; cam: Camera; door?: number }> = ({ frame, k, cam, door = 1 }) => {
  const y = you(frame, k);
  const b = broker(frame, k, y.f);
  const box = toWorld(b.f, { x: 30, y: -150 });
  const n = nurse(frame, k, y.f, box);
  const t = deviceAt(frame, k.band + 6, k.pluck);
  const lit = deviceAt(frame, k.band + 1, k.pluck);
  const light = headToWorld(y.f, BAND_LIGHT);
  const palmF = handWorld(y.f, "armF");
  const palmB = handWorld(y.f, "armB");
  const elbow = toWorld(y.f, { x: 28, y: -163 });
  const tubeOn = frame < k.pluck;
  const deskEdge = { x: G.x - 128 * (G.scale / 0.75), y: G.y - 88 * (G.scale / 0.75) };
  const notes = k.notes.filter((n) => frame >= n).length;
  const actors = (
    <>
      {n?.behind && <Nurse n={n} />}
      <BandBox x={box.x} y={box.y} scale={0.55} />
      <Body f={b.f} head={BROKER.head} coat={BROKER.coat} tie={BROKER.tie} {...b.face}
        held={b.band === "hand" ? <Band x={0} y={10} scale={0.66} lit /> : undefined} />
      <ClinicChair />
      {/* the tube from the machine to the crook of your arm; unclipped, it hangs */}
      <path d={tubeOn ? `M${CLINIC.machine.x + 80} ${CLINIC.machine.top + 60} C${CLINIC.machine.x + 160} ${CLINIC.machine.top + 140} ${elbow.x - 60} ${elbow.y + 60} ${elbow.x} ${elbow.y}`
        : `M${CLINIC.machine.x + 80} ${CLINIC.machine.top + 60} C${CLINIC.machine.x + 140} ${CLINIC.machine.top + 160} ${CLINIC.machine.x + 120} ${CLINIC.machine.top + 220} ${CLINIC.machine.x + 104} ${CLINIC.machine.top + 250}`}
        fill="none" stroke="#c0392b" strokeWidth={6} strokeLinecap="round" opacity={0.85} />
      <Body f={y.f} head={HERO.head} scarf={HERO.scarf} tuft time={frame} {...y.face} />
      <ClinicArmrest />
      {frame >= k.band && frame < k.pluck && <HeadGear f={y.f}><BandOnHead lit={lit} /></HeadGear>}
      {frame >= k.landed && <Coin x={palmF.x - 4} y={palmF.y - 12} r={13} tilt={-20} />}
      {frame >= k.cotton[0] + 6 && <circle cx={elbow.x} cy={elbow.y} r={11} fill="#ffffff" stroke={INK} strokeWidth={3} />}
      {notes > 0 && <Notes x={palmB.x - 6} y={palmB.y - 14} n={notes} scale={0.55} tilt={-10} />}
      {n && !n.behind && frame >= k.notesShot && frame < k.notes[2] + 2 && (() => {
        const h = handWorld(n.f, "armF");
        return frame >= k.cotton[1] ? <Notes x={h.x + 6} y={h.y - 6} n={3 - notes} scale={0.55} tilt={8} /> : null;
      })()}
      {n && !n.behind && <Nurse n={n} />}
      {/* the hold after her line: your bubble, up and to the left of your face (you face left), above the nurse's cap */}
      {frame >= k.thatsIt && frame < k.twoShot && (() => {
        const h = headWorld(y.f);
        return <Bubble frame={frame} at={k.thatsIt + 3} x={h.x - 50} y={h.y - 78} text="That's it?" size={38} side="left" />;
      })()}
      <Thread a={light} b={{ x: G.x + 22, y: G.y - 150 }} t={t} bend={-60} />
      <Ghost x={G.x} y={G.y} scale={G.scale} t={t} frame={frame} facing={-1} head={GHOST.head} />
      <CoinArc frame={frame} start={k.coin} end={k.coin} from={deskEdge} via={{ x: deskEdge.x + 10, y: deskEdge.y - 30 }}
        to={{ x: palmF.x - 4, y: palmF.y - 12 }} every={100} fall={k.landed - k.coin} r={13} />
    </>
  );
  return <ClinicScene frame={frame + 22} mood="morning" cam={cam} door={door} actors={actors} />;
};

/** Close: the notes in one hand, the coin in the other, the band in his grey hand; your hand takes it. */
export const TakeInsert: React.FC<{ frame: number; k: SkitT }> = ({ frame, k }) => {
  const cam: Camera = { x: 760 + (frame - k.take) * 0.4, y: 420, zoom: 2.4 };
  const reachT = ramp(frame, k.take + 2, k.grab);
  const back = ramp(frame, k.grab + 2, k.grab + 20);
  const hand = { x: mix(mix(770, 975, reachT), 820, back), y: mix(mix(585, 470, reachT), 560, back) };
  const his = { x: 990 + back * 50, y: 452 };
  const held = frame >= k.grab;
  const actors = (
    <g>
      {/* his grey sleeve from the right, the band hanging from his fingers until you take it */}
      <path d={`M1240 430 L${his.x + 20} ${his.y}`} stroke={BROKER.coat} strokeWidth={44} strokeLinecap="round" />
      <path d={`M1240 430 L${his.x + 20} ${his.y}`} stroke={INK} strokeWidth={4} fill="none" opacity={0.5} />
      <circle cx={his.x} cy={his.y} r={22} fill={BROKER.head} stroke={INK} strokeWidth={3} />
      {!held && <Band x={his.x - 12} y={his.y + 34} scale={0.85} tilt={-10} />}
      {/* your far hand: the three notes */}
      <path d="M330 700 L520 572" stroke="#3b3e47" strokeWidth={30} strokeLinecap="round" />
      <Notes x={540} y={548} n={3} scale={1.3} tilt={-14} />
      <circle cx={522} cy={572} r={21} fill={HERO.head} />
      {/* your near hand: the coin in the fist, reaching for the band */}
      <path d={`M640 720 L${hand.x} ${hand.y}`} stroke={INK} strokeWidth={30} strokeLinecap="round" />
      {held && <Band x={hand.x + 4} y={hand.y + 30} scale={0.85} tilt={8} />}
      <circle cx={hand.x} cy={hand.y} r={22} fill={HERO.head} />
      <Coin x={hand.x - 18} y={hand.y + 8} r={13} tilt={-30} />
    </g>
  );
  return <ClinicScene frame={frame + 22} mood="morning" cam={cam} door={1} actors={actors} />;
};

/** The door swings shut on his back; you in the chair with the band in your hand; the clock. */
export const DoorShot: React.FC<{ frame: number; k: SkitT }> = ({ frame, k }) => {
  const shutT = ramp(frame, k.doorClose[0], k.doorClose[1]);
  const away = ramp(frame, k.doorClose[0] - 12, k.doorClose[0] + 6);
  const f: Placed = { x: mix(1560, 1700, away), y: CLINIC.floor - 10 - away * 30, scale: C.scale * mix(1, 0.85, away), facing: 1, pose: walkPose(frame * 0.3) };
  const pose: Pose = { ...REST, armB: [70, 60] };
  const yf: Placed = { ...seatedInChair(pose), pose };
  const hand = handWorld(yf, "armB");
  const palm = handWorld(yf, "armF");
  const D = CLINIC.door;
  const actors = (
    <>
      <clipPath id="doorshot-door"><rect x={D.x - D.w / 2 - 300} y={D.top - 200} width={D.w + 300} height={CLINIC.floor - D.top + 200} /></clipPath>
      <g clipPath="url(#doorshot-door)">
        <Body f={f} head={BROKER.head} coat={BROKER.coat} tie={BROKER.tie} />
      </g>
      <ClinicDoorPanel open={1 - shutT} />
      <ClinicChair />
      <Body f={yf} head={HERO.head} scarf={HERO.scarf} tuft time={frame} brows="flat" lids={0.2} mouth="flat" look={{ x: 0.4, y: 0.4 }} />
      <ClinicArmrest />
      <Band x={hand.x - 2} y={hand.y + 10} scale={0.62} tilt={-10} />
      <Coin x={palm.x - 4} y={palm.y - 12} r={13} tilt={-20} />
    </>
  );
  // line 3 over it: a slow push from the closing door onto the band in your hand, its light on
  const cam = camAt(frame, [[k.shut, { x: 1260, y: 560, zoom: 1.3 }], [k.doorClose[1] + 6, { x: 1180, y: 560, zoom: 1.45 }],
    [k.shut + 115, { x: hand.x + 30, y: hand.y - 20, zoom: 2.9 }]]);
  return <ClinicScene frame={frame + 22} mood="morning" cam={cam} door={1 - shutT} actors={actors} />;
};

export { GHOST };
