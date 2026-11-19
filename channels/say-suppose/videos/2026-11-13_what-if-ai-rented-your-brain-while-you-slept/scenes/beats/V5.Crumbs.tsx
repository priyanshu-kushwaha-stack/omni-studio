// Crumbs' v5 moments (script.md, Crumbs). Every frame from shot.v3 (current numbering, V5 in V5.Kit).
//
//   35-38  the clinic, the same morning: you in the chair, the tube at your arm, the band's teal light in your scarf
//          pocket; the nurse counts three notes into your palm (36); close on the pocket, the band's flap turns to $90
//          beside the notes (37); close on her, glancing at your forehead: "Rested, for once." (38)
//   44-46  the notebook page draws itself: two paper bands on one paper head; the first's thread up to a little ghost
//          and $90, the second's thread up to nothing, drooping, and $0 (44-45); then the table: him, two lights under
//          his cap, pleased with himself: "Worth a shot." (45-46)
import { STAND, SEATED, type Pose } from "@whatif/kit/rig/pose";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Clip } from "@whatif/kit/timeline";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { INK } from "@whatif/kit/theme";
import { Band, deviceAt, Ghost, PaperCap, PayFlap, Sheet } from "../parts";
import { BROTHER, camAt, current, GHOST, HERO, lineEnd, mix, NURSE, ramp } from "../shared";
import { CLINIC, ClinicArmrest, ClinicChair, ClinicScene, seatedInChair } from "../sets/Clinic";
import { aim, Body as Fig, handWorld, HeadGear, headWorld, Notes, talk, toWorld, type Placed } from "./Chair.Rig";
import { BRO_SEAT, KitchenTable, TopDown, YOU_SEAT } from "./Crumbs.Kitchen";
import { headOf, type Face } from "./Crumbs.Rig";
import { atV, gapAfter, V5 } from "./V5.Kit";

// ------------------------------------------------------------------------------------------------ 35-38: the chair

export function chairSpan(v3: Clip[]) {
  const c = V5.chair;
  return { from: gapAfter(v3, c - 1), to: v3[c + 4].from };
}

const REST: Pose = { ...SEATED, armF: [30, 60], armB: [55, 40] };

export const ChairAgain: React.FC<{ frame: number; v3: Clip[] }> = ({ frame, v3 }) => {
  const c = V5.chair;
  const { from, to } = chairSpan(v3);
  const notesShot = v3[c + 1].from - 2;
  const bandShot = v3[c + 2].from - 2;
  const nurseShot = v3[c + 3].from - 4;
  const counts = [atV(v3, c + 1, 0.12), atV(v3, c + 1, 0.4), atV(v3, c + 1, 0.68)];
  const flap = atV(v3, c + 2, 0.18);
  const rested = [v3[c + 3].from, lineEnd(v3, c + 3)] as const;

  const yf: Placed = { ...seatedInChair(REST), pose: REST };
  const palm = handWorld(yf, "armB");
  const elbow = toWorld(yf, { x: 28, y: -163 });
  // the scarf pocket on your chest, the band's light showing out of it
  const pocket = toWorld(yf, { x: 22, y: -196 });
  const shown = counts.filter((n) => frame >= n).length;

  // the nurse in front of the chair, facing you: the notes into your palm, then a glance up at your forehead
  const nb: Placed = { x: 790, y: CLINIC.floor - 20, scale: CLINIC.chair.scale, facing: 1, pose: STAND };
  const note = counts.findIndex((n) => frame >= n - 8 && frame < n + 6);
  const target = note >= 0 ? { x: palm.x - 6, y: palm.y - 10 } : { x: palm.x - 70, y: palm.y + 30 };
  nb.pose = { ...STAND, lean: 4, armF: aim({ ...nb, pose: { ...STAND, lean: 4 } }, target), armB: [20, 70] };
  const nh = headWorld(nb);
  const nurseFace = frame < rested[0] - 6
    ? { brows: "flat" as const, lids: 0.3, mouth: "flat" as const, eyes: 1, look: { x: 0.8, y: 0.4 } }
    : { brows: "raised" as const, lids: 0.2, mouth: talk(frame, rested[0], rested[1], "smile"), eyes: 1, look: { x: 0.8, y: -0.4 } };
  const youFace = frame < bandShot
    ? { brows: "none" as const, lids: 0.15, mouth: "smile" as const, eyes: 1, look: { x: 0.6, y: 0.6 } }
    : frame < nurseShot
      ? { brows: "raised" as const, lids: 0.1, mouth: "smile" as const, eyes: 1, look: { x: 0.2, y: 1 } }
      : { brows: "raised" as const, lids: 0, mouth: "smile" as const, eyes: 1.1, look: { x: 0.9, y: 0.1 } };

  const shot = current(frame, [[from, "wide"], [notesShot, "notes"], [bandShot, "band"], [nurseShot, "nurse"]]);
  const mid = { x: (pocket.x + palm.x) / 2 - 40, y: (pocket.y + palm.y) / 2 };
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[from, { x: 1120, y: 560, zoom: 1.08 }], [notesShot, { x: 1100, y: 570, zoom: 1.16 }]]),
    notes: camAt(frame, [[notesShot, { x: 950, y: 610, zoom: 1.85 }], [bandShot, { x: 950, y: 600, zoom: 2.0 }]]),
    band: camAt(frame, [[bandShot, insert(mid.x, mid.y - 20, 2.6)], [nurseShot, insert(mid.x, mid.y - 20, 2.85)]]),
    nurse: camAt(frame, [[nurseShot, closeUp(nh.x + 110, nh.y, 2.5)], [to, closeUp(nh.x + 110, nh.y, 2.65)]]),
  };
  const actors = (
    <>
      <ClinicChair />
      <path d={`M${CLINIC.machine.x + 80} ${CLINIC.machine.top + 60} C${CLINIC.machine.x + 160} ${CLINIC.machine.top + 140} ${elbow.x - 60} ${elbow.y + 60} ${elbow.x} ${elbow.y}`}
        fill="none" stroke="#c0392b" strokeWidth={6} strokeLinecap="round" opacity={0.85} />
      <Fig f={yf} head={HERO.head} scarf={HERO.scarf} tuft time={frame} {...youFace} blink={(frame + 11) % 97 < 4} />
      <ClinicArmrest />
      {/* the band in your scarf pocket: its light peeking out */}
      <circle cx={pocket.x} cy={pocket.y - 4} r={26} fill={GHOST.light} opacity={0.3} />
      <Band x={pocket.x} y={pocket.y - 12} scale={0.32} tilt={-18} />
      <rect x={pocket.x - 20} y={pocket.y - 6} width={40} height={24} rx={6} fill={HERO.scarf} stroke={INK} strokeWidth={3} />
      {shown > 0 && <Notes x={palm.x - 6} y={palm.y - 14} n={shown} scale={0.55} tilt={-10} />}
      {frame < counts[2] + 2 && (() => { const h = handWorld(nb, "armF"); return <Notes x={h.x + 6} y={h.y - 6} n={3 - shown} scale={0.55} tilt={8} />; })()}
      <Fig f={nb} head={NURSE.head} coat={NURSE.coat} {...nurseFace} blink={(frame + 5) % 97 < 4} />
      <HeadGear f={nb}><PaperCap x={0} y={0} r={46} /></HeadGear>
      {/* three notes from the chair, ninety from the band: the band's flap beside the notes, clear of your face */}
      <PayFlap frame={frame} at={flap} until={nurseShot} x={pocket.x + 40} y={pocket.y + 110} value="$90" size={34} />
    </>
  );
  return <ClinicScene frame={frame + 22} mood="morning" cam={drift(cams[shot], frame, "v5-chair", 3)} door={0} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ 44-46: two bands

export function twoBandsSpan(v3: Clip[]) {
  return { from: gapAfter(v3, V5.twoBands - 1), to: v3[V5.worth + 1].from };
}

/** The notebook page: a paper head wearing two bands; one thread to a little ghost ($90), one to nothing ($0). */
const TwoBandsPage: React.FC<{ frame: number; v3: Clip[] }> = ({ frame, v3 }) => {
  const b = V5.twoBands;
  const { from } = twoBandsSpan(v3);
  // the page opens already drawn (the head and the first band; v6 review: no insert opens on blank paper)
  const head = from - 20;
  const band1 = from - 10;
  const band2 = atV(v3, b, 0.48);
  const thread1 = [v3[b + 1].from, atV(v3, b + 1, 0.2)] as const;
  const thread2 = [atV(v3, b + 1, 0.24), atV(v3, b + 1, 0.44)] as const;
  // each pay lands on its word: $90 on "The second band", $0 on "paid nothing"
  const pays = [atV(v3, b + 1, 0.42), atV(v3, b + 1, 0.65)] as const;
  // G3: a fuller move (1.3 to 1.4 read as a held page), kept slow under the voice (owner, G3 note 3): one even pull out
  // from the head with its bands to the whole page, across both lines
  const cam = drift(camAt(frame, [[from, { x: 780, y: 495, zoom: 1.7 }], [Math.max(from + 1, atV(v3, b + 1, 0.66)), { x: 960, y: 460, zoom: 1.32 }]]), frame, "v5-two", 3);
  // the page's own coordinates: 0..1000 by 0..600
  const H = { x: 330, y: 400, r: 120 };
  const L1 = { x: 380, y: 318 };
  const L2 = { x: 300, y: 312 };
  const ghostAt = { x: 690, y: 250 };
  const C = "#c0582f";
  const pop = (at: number) => Math.min(1, Math.max(0, (frame - at) / 6));
  return (
    <TopDown frame={frame} cam={cam} mood="morning">
      <Sheet frame={frame} at={from} x={960} y={470} w={1000} h={600} tilt={-2}>
        {frame >= head && (
          <g opacity={pop(head)}>
            <circle cx={H.x} cy={H.y} r={H.r} fill="#f6d9c8" stroke={INK} strokeWidth={6} />
            <path d={`M${H.x - H.r} ${H.y - 14} A${H.r} ${H.r} 0 0 1 ${H.x + H.r} ${H.y - 14} Z`} fill={BROTHER.cap} stroke={INK} strokeWidth={6} />
            <circle cx={H.x - 30} cy={H.y + 24} r={7} fill={INK} /><circle cx={H.x + 30} cy={H.y + 24} r={7} fill={INK} />
            <path d={`M${H.x - 26} ${H.y + 56} Q${H.x} ${H.y + 74} ${H.x + 26} ${H.y + 56}`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
        {frame >= band1 && (
          <g opacity={pop(band1)}>
            <path d={`M${H.x - H.r + 6} ${H.y - 4} Q${H.x} ${H.y - 30} ${H.x + H.r - 6} ${H.y - 4}`} fill="none" stroke="#1b1d24" strokeWidth={10} strokeLinecap="round" />
            <circle cx={L1.x} cy={L1.y + 64} r={11} fill={GHOST.light} stroke="#1b1d24" strokeWidth={3} />
          </g>
        )}
        {frame >= band2 && (
          <g opacity={pop(band2)}>
            <path d={`M${H.x - H.r + 4} ${H.y - 30} Q${H.x} ${H.y - 58} ${H.x + H.r - 4} ${H.y - 30}`} fill="none" stroke="#1b1d24" strokeWidth={10} strokeLinecap="round" />
            <circle cx={L2.x} cy={L2.y + 36} r={11} fill={GHOST.light} stroke="#1b1d24" strokeWidth={3} />
          </g>
        )}
        {/* band one: its thread climbs to a little worker, who types */}
        <DrawLine d={`M${L1.x} ${L1.y + 54} C${L1.x + 80} ${L1.y - 60} ${ghostAt.x - 140} ${ghostAt.y - 60} ${ghostAt.x - 30} ${ghostAt.y - 50}`}
          from={thread1[0]} to={thread1[1]} color={GHOST.light} width={7} />
        <Ghost x={ghostAt.x} y={ghostAt.y + 70} scale={0.5} t={deviceAt(frame, thread1[1] - 4)} frame={frame} worry={false} />
        {/* band two: its thread climbs, finds nobody home, and droops */}
        <DrawLine d={`M${L2.x} ${L2.y + 26} C${L2.x - 30} ${L2.y - 120} ${L2.x + 40} ${L2.y - 230} ${L2.x - 90} ${L2.y - 200} S${L2.x - 150} ${L2.y - 110} ${L2.x - 170} ${L2.y - 60}`}
          from={thread2[0]} to={thread2[1]} color={C} width={7} />
        <PayFlap frame={frame} at={pays[0]} x={ghostAt.x + 170} y={ghostAt.y + 200} value="$90" size={50} />
        <PayFlap frame={frame} at={pays[1]} x={L2.x - 170} y={L2.y + 30} value="$0" size={50} />
      </Sheet>
    </TopDown>
  );
};

/** Back at the table: him with two lights under the cap, pleased with himself. */
const TwoBandsTable: React.FC<{ frame: number; v3: Clip[]; mood: MoodName }> = ({ frame, v3, mood }) => {
  const b = V5.twoBands;
  const at = atV(v3, b + 1, 0.66);
  const worth = [v3[V5.worth].from, lineEnd(v3, V5.worth)] as const;
  const { to } = twoBandsSpan(v3);
  const bh = headOf(BRO_SEAT);
  const tilt = mix(0, 10, ramp(frame, worth[0] - 6, worth[0] + 6));
  const bro = { ...BRO_SEAT, pose: { ...BRO_SEAT.pose, tilt } };
  const broFace: Face = { brows: "raised", lids: 0.2, mouth: frame >= worth[0] ? talk(frame, worth[0], worth[1], "smirk") : "smirk", eyes: 1, look: { x: 1, y: -0.1 } };
  const youFace: Face = { brows: "flat", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 1, y: 0 } };
  const cam = camAt(frame, [[at, closeUp(bh.x - 60, bh.y - 10, 2.3)], [to, closeUp(bh.x - 60, bh.y - 10, 2.5)]]);
  return (
    <KitchenTable frame={frame} cam={drift(cam, frame, "v5-two-table", 3)} mood={mood} jar={0.3}
      you={{ body: YOU_SEAT, face: youFace }} brother={{ body: bro, face: broFace, light: 1, two: true, bowl: true }} />
  );
};

export const TwoBands: React.FC<{ frame: number; v3: Clip[]; mood: MoodName }> = ({ frame, v3, mood }) =>
  frame < atV(v3, V5.twoBands + 1, 0.66) ? <TwoBandsPage frame={frame} v3={v3} /> : <TwoBandsTable frame={frame} v3={v3} mood={mood} />;

