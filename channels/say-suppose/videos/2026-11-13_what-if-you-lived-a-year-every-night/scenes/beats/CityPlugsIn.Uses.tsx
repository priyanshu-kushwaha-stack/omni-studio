// The City Plugs In, the first uses: the exam hall (a student writing calmly beside a year of revision stacked as a
// paper tower; "Define sleeping."), the board's notice stamped on the hall door, the operating room (the surgeon's hands
// flickering through ten thousand rehearsals until the nurse holds up the fresh scan), and the office at dawn (a report
// a foot thick dropped on the desk, the boss behind glass not looking up from a thicker one).
import { seatedY, SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { examHall } from "@whatif/kit/sets/ExamHall";
import { officeDesk } from "@whatif/kit/sets/OfficeDesk";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { camAt, mix, PASTELS, ramp } from "../shared";
import { aim, head, InkBars, InSet, OwnSet, Person, type Body } from "./CityPlugsIn.Kit";

const UNIFORM = { coat: "#2f3e6a", tie: CRIMSON } as const;
const STUDENT = { head: PASTELS[6], ...UNIFORM } as const;

/** The year of revision: a tower of paper taller than she is, leaning a little. */
const PaperTower: React.FC<{ x: number; base: number; grow: number }> = ({ x, base, grow }) => {
  const n = Math.round(46 * grow);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x - 60 + Math.sin(i * 0.7) * 6 + i * 0.4} y={base - (i + 1) * 13} width={120} height={13} fill={i % 2 ? PAPER : "#e6dcc6"} stroke={INK} strokeWidth={2} />
      ))}
    </g>
  );
};

/** The exam: she writes calmly and fast; the others chew their pens. `define` from her line: she looks up at the
 *  invigilator with a smirk. */
export const ExamShot: React.FC<{ frame: number; start: number; define?: number; end: number }> = ({ frame, start, define, end }) => {
  const s = examHall.spots;
  const her: Body = { x: s.seat2.x, y: s.seat2.y, scale: s.seat2.scale, facing: 1, pose: SEATED };
  const writing = define === undefined || frame < define;
  const pen = { x: s.seat2.x + 150 + Math.sin(frame / 2) * 18 * (writing ? 1 : 0), y: 758 };
  her.pose = { ...SEATED, lean: writing ? 14 : 0, tilt: writing ? 12 : -4, armF: writing ? aim(her, pen) : [40, 60] };
  const others: Body[] = [s.seat1, s.seat3].map((sp) => ({ x: sp.x, y: sp.y, scale: sp.scale, facing: 1, pose: { ...SEATED, lean: 14, tilt: 14, armF: [70, 115] } }));
  const hh = head(her);
  const cam: Camera = define !== undefined && frame >= define
    ? camAt(frame, [[define, closeUp(hh.x + 60, hh.y, 2.5)], [end, closeUp(hh.x + 60, hh.y, 2.7)]])
    : camAt(frame, [[start, { x: 760, y: 600, zoom: 1.3 }], [end, { x: 700, y: 560, zoom: 1.15 }]]);
  return (
    <InSet set={examHall} mood="day" frame={frame} cam={drift(cam, frame, "cp-exam", 3)} options={{ minute: 50 + (frame % 300) / 30 }}
      behind={<PaperTower x={s.seat2.x - 130} base={958} grow={ramp(frame, start, start + 30)} />}>
      {others.map((b, i) => (
        <Person key={i} body={b} frame={frame} seed={i + 3} who={{ head: PASTELS[i * 2 + 1], ...UNIFORM, brows: "worry", lids: 0.2, mouth: "wobble", look: { x: 0.3, y: 0.7 } }} />
      ))}
      <Person body={her} frame={frame} seed={2}
        who={writing ? { ...STUDENT, brows: "none", lids: 0.45, mouth: "flat", look: { x: 0.8, y: 0.8 } }
          : { ...STUDENT, brows: "raised", lids: 0.4, mouth: frame < end - 30 ? "open" : "smirk", look: { x: 1, y: -0.1 } }} />
      <Person body={{ x: s.invigilator.x, y: s.invigilator.y, scale: s.invigilator.scale, facing: -1, pose: { ...STAND, armF: [40, 80], armB: [30, 90] } }}
        frame={frame} seed={8} who={{ head: PASTELS[0], coat: "#4a4f5c", brows: define !== undefined ? "angry" : "flat", lids: 0.2, mouth: "flat", look: { x: 1, y: 0.1 } }} />
    </InSet>
  );
};

/** The exam board's notice on the hall door: ink bars, and the stamp slamming on (a moon struck through). */
export const NoticeShot: React.FC<{ frame: number; start: number; stamp: number; end: number }> = ({ frame, start, stamp, end }) => {
  const st = ramp(frame, stamp, stamp + 5);
  const cam: Camera = drift(camAt(frame, [[start, { x: 960, y: 520, zoom: 1.3 }], [end, { x: 960, y: 520, zoom: 1.6 }]]), frame, "cp-note", 3);
  return (
    <OwnSet mood="day" cam={cam} back={
      <g>
        <rect x={-1400} y={-900} width={4800} height={2900} fill="#efe2c2" />
        <rect x={700} y={100} width={520} height={1000} fill="#8a5c3b" stroke={INK} strokeWidth={8} />
        <rect x={760} y={160} width={400} height={180} rx={6} fill="#cfe0ea" stroke={INK} strokeWidth={6} />
        <circle cx={1160} cy={640} r={18} fill="#d9c26a" stroke={INK} strokeWidth={4} />
      </g>
    }>
      <g transform="rotate(-2 960 560)">
        <rect x={800} y={400} width={320} height={380} fill={PAPER} stroke={INK} strokeWidth={5} />
        <rect x={830} y={430} width={260} height={22} fill={INK} opacity={0.8} />
        <InkBars x={830} y={480} w={250} n={6} gap={24} thick={9} />
        <circle cx={960} cy={398} r={9} fill={CRIMSON} />
      </g>
      {frame >= stamp && (
        <g transform={`translate(1010 680) rotate(-12) scale(${mix(1.8, 1, st)})`} opacity={mix(0.2, 0.9, st)}>
          <circle r={74} fill="none" stroke={CRIMSON} strokeWidth={12} />
          <path d="M14 -34 A36 36 0 1 0 14 34 A28 28 0 1 1 14 -34Z" fill={CRIMSON} />
          <line x1={-54} y1={-54} x2={54} y2={54} stroke={CRIMSON} strokeWidth={12} />
        </g>
      )}
    </OwnSet>
  );
};

/** The operating room, drawn simply: green tiles, the round lamp, the table, the theatre door with a round window
 *  (`waiting`: the nurse's head behind it). The door slides open (`door` 0..1). */
const Theatre: React.FC<{ door: number; waiting: boolean }> = ({ door, waiting }) => (
  <g>
    <rect x={-1400} y={-900} width={4800} height={2900} fill="#bcd8cc" />
    {Array.from({ length: 14 }, (_, i) => <line key={i} x1={-400 + i * 200} y1={0} x2={-400 + i * 200} y2={900} stroke="#a3c4b6" strokeWidth={4} />)}
    <rect x={-1400} y={900} width={4800} height={900} fill="#8fa8a0" />
    <rect x={1440} y={260} width={300} height={640} fill="#2a3a36" />
    <g transform={`translate(${300 * door} 0)`}>
      <rect x={1440} y={260} width={300} height={640} fill="#e9eef0" stroke={INK} strokeWidth={6} />
      <circle cx={1590} cy={420} r={64} fill={waiting ? "#cfe0ea" : "#9fb6c4"} stroke={INK} strokeWidth={6} />
      {waiting && <circle cx={1600} cy={440} r={40} fill={PASTELS[3]} />}
      {waiting && <rect x={1540} y={380} width={46} height={40} rx={4} fill="#1e2433" stroke={INK} strokeWidth={3} />}
    </g>
    <line x1={760} y1={-200} x2={760} y2={160} stroke={INK} strokeWidth={10} />
    <ellipse cx={760} cy={200} rx={190} ry={60} fill="#e9eef0" stroke={INK} strokeWidth={8} />
    <ellipse cx={760} cy={215} rx={140} ry={30} fill="#fffbe6" />
    <polygon points="620,225 900,225 1060,700 460,700" fill="#fffbe6" opacity={0.18} />
  </g>
);

const Patient: React.FC = () => (
  <g>
    <rect x={460} y={700} width={600} height={30} rx={8} fill="#9aa1ab" stroke={INK} strokeWidth={5} />
    <rect x={740} y={730} width={30} height={170} fill="#5c6675" />
    <circle cx={500} cy={662} r={40} fill="#e6c4a0" stroke={INK} strokeWidth={4} />
    <path d="M530 700 Q560 640 700 650 Q900 640 1040 690 L1040 702 L530 702Z" fill="#7fb6c9" stroke={INK} strokeWidth={5} />
  </g>
);

/** The scan: a dark film of ink ribs and a fresh crimson stamp. */
const ScanSheet = (
  <g transform="translate(0 -40)">
    <rect x={-70} y={-90} width={140} height={110} rx={6} fill="#1e2433" stroke={INK} strokeWidth={4} />
    {[0, 1, 2, 3].map((i) => <path key={i} d={`M-44 ${-70 + i * 22} q44 -14 88 0`} fill="none" stroke="#e9eef0" strokeWidth={4} />)}
    <circle cx={40} cy={4} r={16} fill="none" stroke={CRIMSON} strokeWidth={5} />
    <circle cx={40} cy={4} r={7} fill={CRIMSON} />
  </g>
);

export interface SurgeonTimes { start: number; door: number; nurse: number; take: number; end: number }

/** The surgeon rehearsing ten thousand times (hands flicker between grips, with ghosts, lids heavy, stance perfect); on
 *  "the scan waiting outside" the camera finds the nurse behind the door's window; on "New scan." the door slides and
 *  she holds it up, and the hands stop; on "Newer than what?" the surgeon's deadpan double take: a glance, back to the
 *  patient, then the snap round, eyes huge. */
export const SurgeonShot: React.FC<{ frame: number; k: SurgeonTimes }> = ({ frame, k }) => {
  const still = frame >= k.nurse;
  const grips = [{ x: 720, y: 660 }, { x: 800, y: 650 }, { x: 860, y: 670 }, { x: 760, y: 630 }];
  const base: Body = { x: 860, y: 900, scale: 1.12, facing: -1, pose: { ...STAND, lean: 16 } };
  const at = (n: number): Pose => ({ ...base.pose, armF: aim(base, grips[n % 4]), armB: aim(base, grips[(n + 2) % 4]) });
  const n = Math.floor(frame / 2);
  const snap = k.take + 22;
  const turned = frame >= snap;
  const hop = turned ? Math.sin(Math.min(1, (frame - snap) / 8) * Math.PI) * 18 : 0;
  const surgeon: Body = { ...base, y: base.y - hop, facing: turned ? 1 : -1,
    pose: !still ? at(n) : turned ? { ...STAND, lean: -8, armF: [120, 30], armB: [100, 40] } : { ...base.pose, lean: 6, armF: [70, 40], armB: [60, 50] } };
  // the glance: at the nurse, back to the patient, then the snap
  const glance = frame >= k.take && frame < k.take + 10;
  const look = turned ? { x: 1, y: -0.1 } : glance || (still && frame < k.take) ? { x: -1, y: 0 } : { x: 0.6, y: 0.8 };
  const door = ramp(frame, k.nurse - 8, k.nurse + 4);
  const sh = head(surgeon);
  const cam: Camera = turned
    ? camAt(frame, [[snap, closeUp(sh.x + 40, sh.y + 30, 2.6)], [k.end, closeUp(sh.x + 40, sh.y + 30, 2.8)]])
    : frame >= k.nurse
      ? camAt(frame, [[k.nurse, { x: 1220, y: 600, zoom: 1.25 }], [snap, { x: 1200, y: 600, zoom: 1.35 }]])
      : frame >= k.door
        ? camAt(frame, [[k.door, { x: 1300, y: 520, zoom: 1.6 }], [k.nurse, { x: 1500, y: 470, zoom: 2.2 }]])
        : camAt(frame, [[k.start, { x: 780, y: 620, zoom: 1.7 }], [k.door, { x: 820, y: 620, zoom: 2.0 }]]);
  const scrubs = { head: PASTELS[5], coat: "#5aa08f", cap: "#5aa08f" } as const;
  return (
    <OwnSet mood="day" cam={drift(cam, frame, "cp-sur", 3)} back={<Theatre door={door} waiting={frame >= k.door && frame < k.nurse} />}
      glows={[{ x: 960, y: 200, r: 500, color: "#fffbe6", strength: 0.25 }]}>
      <Patient />
      {!still && [1, 2].map((g) => (
        <g key={g} opacity={0.25}><Person body={{ ...surgeon, pose: at(n + g) }} frame={frame} seed={1} who={{ ...scrubs, blink: true }} /></g>
      ))}
      <Person body={surgeon} frame={frame} seed={1} who={{ ...scrubs, brows: turned ? "raised" : "flat", lids: turned ? 0 : 0.55,
        mouth: turned ? (frame < k.end - 10 ? "open" : "wobble") : "flat", eyes: turned ? 1.4 : 1, look, blink: turned ? false : undefined }} />
      {frame >= k.nurse - 4 && (
        <Person body={{ x: 1590, y: 900, scale: 1.08, facing: -1, pose: { ...STAND, armF: [150, 20] } }} frame={frame} seed={4}
          who={{ head: PASTELS[3], coat: "#7fa0c4", cap: "#7fa0c4", brows: "raised", mouth: frame >= k.nurse && frame < k.take ? "open" : "flat", look: { x: 1, y: 0 }, held: ScanSheet }} />
      )}
    </OwnSet>
  );
};

/** A report a foot thick: a stack of paper bound with a crimson band. */
const Report: React.FC<{ x: number; y: number; h: number }> = ({ x, y, h }) => (
  <g>
    {Array.from({ length: Math.round(h / 8) }, (_, i) => <rect key={i} x={x - 90 + (i % 2) * 3} y={y - (i + 1) * 8} width={180} height={8} fill={i % 2 ? PAPER : "#e6dcc6"} stroke={INK} strokeWidth={1.5} />)}
    <rect x={x - 10} y={y - h} width={20} height={h} fill={CRIMSON} opacity={0.85} />
  </g>
);

/** The office at dawn: the report drops on the desk; the boss behind his glass reads a thicker one, never looking up. */
export const OfficeShot: React.FC<{ frame: number; start: number; drop: number; cabin: number; meh: number; end: number }> = ({ frame, start, drop, cabin, meh, end }) => {
  const s = officeDesk.spots;
  const fall = ramp(frame, drop - 8, drop);
  const sag = ramp(frame, meh, meh + 14);
  const worker: Body = { x: s.desk.x, y: seatedY(850, 1.1), scale: 1.1, facing: 1, pose: { ...SEATED, lean: frame >= drop ? mix(-6, 18, sag) : 6, tilt: 14 * sag } };
  const boss: Body = { x: 2090, y: s.cabin.y, scale: 1.1, facing: -1, pose: { ...STAND, lean: 10, tilt: 12, armF: [70, 40] } };
  const page = Math.floor((frame - cabin) / 24) % 2 === 1;
  const cam: Camera = frame >= meh
    ? camAt(frame, [[meh, { x: 1400, y: 600, zoom: 1.0 }], [end, { x: 1380, y: 610, zoom: 1.08 }]])
    : frame >= cabin
    ? camAt(frame, [[cabin, { x: 1960, y: 600, zoom: 1.6 }], [meh, { x: 1980, y: 600, zoom: 1.75 }]])
    : camAt(frame, [[start, { x: 1000, y: 620, zoom: 1.35 }], [cabin, { x: 1060, y: 640, zoom: 1.5 }]]);
  return (
    <InSet set={officeDesk} mood="morning" frame={frame} cam={drift(cam, frame, "cp-off", 3)} options={{ screen: "mail" }}>
      <Person body={worker} frame={frame} seed={2} who={{ head: PASTELS[2], coat: "#4a5c6a", brows: frame >= meh ? "worry" : frame >= drop ? "raised" : "none", lids: frame >= meh ? 0.55 : 0.3,
        mouth: frame >= meh ? "frown" : frame >= drop ? "smile" : "flat", look: frame >= meh ? { x: 1, y: 0.8 } : { x: 1, y: 0.1 } }} />
      <g transform={`translate(0 ${mix(-600, 0, fall)})`}><Report x={1000} y={760} h={150} /></g>
      <Report x={1960} y={720} h={230} />
      <Person body={boss} frame={frame} seed={6} who={{ head: PASTELS[1], coat: "#2f3242", tie: "#8a2b3a", brows: "flat", lids: 0.5, mouth: "flat", look: { x: 0.8, y: 0.9 },
        held: <rect x={-30} y={-6} width={60} height={page ? 6 : 10} fill={PAPER} stroke={INK} strokeWidth={2} transform={page ? "rotate(-30)" : undefined} /> }} />
    </InSet>
  );
};
