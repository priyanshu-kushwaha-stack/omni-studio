// Staff Last, the catch: "Staff last." and the 3 s hold, performed: his hand out; you hand over two coils; the hand
// stays out; you hand over the third; he hangs all three on the hook behind the desk, snaps a padlock on it and pats
// it. "The guy who can juggle": you juggling three mugs, deadpan, while your flatmate walks past with her mop on her
// shoulder, yawning, not looking (in the key shot her jaw dropped). Then trapped: a glance at the exit, at your old
// hatch (the taped-over socket under it), at the hook he is polishing, and the view of it from your chair.
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { camAt, FLATMATE, linear, mix, ramp } from "../shared";
import { aim, hand, head, Person, type Body } from "./CityPlugsIn.Kit";
import { boss, BOSS_AT_DESK, you, YOU_SEATED } from "./StaffLast.Desk";
import { Coil, DeskFront, DeskLamp, HOOK, Kettle, KeyBoard, Lobby, Padlock, PEG, YourChair } from "./StaffLast.Set";

type Pt = { x: number; y: number };
const lerp = (a: Pt, b: Pt, t: number): Pt => ({ x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) - Math.sin(t * Math.PI) * 40 });
const pegAt = (i: number): Pt => ({ x: PEG.x + 10 + i * 5, y: PEG.y + 26 + i * 8 });
const hookAt = (i: number): Pt => ({ x: HOOK.x + 12 + i * 4, y: HOOK.y + 34 + i * 7 });
const deskAt = (i: number): Pt => ({ x: 390 + i * 40, y: 756 });
const REACH = { x: 500, y: 742 };
const PALM = { x: 470, y: 738 };

/** The hold's phases, as fractions of the hold. */
const P = { grab: 0.06, give: 0.12, took: 0.2, drop: 0.28, third: 0.44, give3: 0.5, took3: 0.56, scoop: 0.62, hang: 0.7, lockOpen: 0.74, snap: 0.78, pat: 0.8 };

export const HandoverShot: React.FC<{ frame: number; staff: number; hold: number; end: number }> = ({ frame, staff, hold, end }) => {
  const t = linear(frame, hold, end);
  const ph = (a: number, b: number) => (t <= a ? 0 : t >= b ? 1 : (t - a) / (b - a));
  // the boss: hand out over the desk, drops two coils on the desk, hand out again, scoops, turns, hangs, locks, pats
  let bossBody: Body = { ...BOSS_AT_DESK, pose: { ...STAND, lean: 22, tilt: 4, armF: aim({ ...BOSS_AT_DESK, pose: { ...STAND, lean: 22 } }, PALM) } };
  const leaning: Body = { ...BOSS_AT_DESK, pose: { ...STAND, lean: 22 } };
  if (t > P.took && t < P.drop) bossBody.pose = { ...bossBody.pose, armF: aim(leaning, lerp(PALM, deskAt(0), ph(P.took, P.drop) < 0.5 ? ph(P.took, P.drop) * 2 : 2 - ph(P.took, P.drop) * 2)) };
  if (t >= P.scoop) {
    const walk = ph(P.scoop, P.hang);
    const x = mix(300, 236, walk);
    const at: Body = { x, y: 950, scale: 1.12, facing: -1, pose: { ...STAND, lean: 4 } };
    const target = t < P.hang ? { x: x - 60, y: 760 } : t < P.pat ? { x: HOOK.x + 14, y: HOOK.y + 30 } : { x: HOOK.x + 14, y: HOOK.y + 20 - Math.abs(Math.sin((t - P.pat) * 40)) * 16 };
    bossBody = { ...at, pose: { ...(walk > 0 && walk < 1 ? walkPose(frame * 0.4) : at.pose), armF: aim(at, target), armB: aim(at, { x: x - 30, y: 780 }) } };
  }
  const bossHand = hand(bossBody);
  // you: reach back to the peg, hold out to his palm, sit back; again for the third
  const back1 = ph(0, P.grab) * (1 - ph(P.grab, P.give));
  const back3 = ph(P.drop + 0.1, P.third) * (1 - ph(P.third, P.give3));
  const out1 = ph(P.grab, P.give) * (1 - ph(P.took, P.drop));
  const out3 = ph(P.third, P.give3) * (1 - ph(P.took3, P.scoop));
  const me: Body = { ...YOU_SEATED, pose: { ...YOU_SEATED.pose, lean: mix(-4, 18, Math.max(out1, out3)) } };
  me.pose = { ...me.pose, armF: out1 + out3 > 0 ? aim(me, { x: mix(560, REACH.x, Math.max(out1, out3)), y: mix(800, REACH.y, Math.max(out1, out3)) }) : [30, 50],
    armB: back1 + back3 > 0.05 ? aim(me, pegAt(0)) : [20, 60] };
  const myHand = hand(me);
  const coilAt = (i: number): Pt => {
    if (i < 2) {
      if (t < P.grab) return pegAt(i);
      if (t < P.give) return lerp(pegAt(i), myHand, ph(P.grab, P.give));
      if (t < P.took) return lerp(myHand, bossHand, ph(P.give, P.took));
      if (t < P.drop) return lerp(bossHand, deskAt(i), ph(P.took, P.drop));
      if (t < P.scoop) return deskAt(i);
      if (t < P.hang) return { x: bossHand.x + i * 6, y: bossHand.y + i * 8 };
      return hookAt(i);
    }
    if (t < P.third) return pegAt(2);
    if (t < P.give3) return lerp(pegAt(2), myHand, ph(P.third, P.give3));
    if (t < P.took3) return lerp(myHand, bossHand, ph(P.give3, P.took3));
    if (t < P.hang) return { x: bossHand.x + 12, y: bossHand.y + 16 };
    return hookAt(2);
  };
  const onPeg = t < P.grab ? 3 : t < P.third ? 1 : 0;
  const coils = [0, 1, 2].filter((i) => !(i < 2 ? t < P.grab : t < P.third)).map((i) => ({ i, ...coilAt(i) }));
  const bh = head(bossBody);
  const cam: Camera = frame < hold
    ? camAt(frame, [[staff, closeUp(bh.x + 70, bh.y + 30, 2.3)], [hold, closeUp(bh.x + 80, bh.y + 30, 2.45)]])
    : camAt(frame, [[hold, { x: 450, y: 690, zoom: 1.55 }], [mix(hold, end, P.scoop), { x: 440, y: 690, zoom: 1.62 }], [end, { x: 340, y: 680, zoom: 1.75 }]]);
  const lock = t >= P.lockOpen ? ramp(t, P.lockOpen + 0.03, P.snap) : -1;
  const sad = t >= P.drop;
  return (
    <Lobby frame={frame} cam={drift(cam, frame, "sl-hand", 2)} mood="morning">
      <KeyBoard />
      <YourChair coils={onPeg} />
      <Person body={bossBody} frame={frame} seed={3} who={boss({ brows: t >= P.drop && t < P.third ? "raised" : "flat", lids: 0.25,
        mouth: frame < hold || t >= P.pat ? "smirk" : "flat", look: t >= P.scoop ? { x: 1, y: 0.2 } : { x: 1, y: 0.4 } })} />
      <DeskFront />
      <DeskLamp lit={false} />
      <Kettle frame={frame} />
      <Person body={me} frame={frame} seed={1} who={you({ brows: sad ? "worry" : "flat", lids: sad ? 0.5 : 0.3, mouth: t >= P.hang ? "frown" : "flat",
        look: t >= P.scoop ? { x: 1, y: -0.3 } : t >= P.drop && t < P.third ? { x: 1, y: 0.3 } : { x: 1, y: 0.1 } })} />
      {coils.map((c) => <g key={c.i} transform={`translate(${c.x} ${c.y})`}><Coil s={0.9} turn={c.i * 30} /></g>)}
      {t >= P.lockOpen && <Padlock x={HOOK.x + 12} y={HOOK.y + 6} shut={lock} />}
    </Lobby>
  );
};

/** A white mug (world coordinates, centred). */
const Mug: React.FC<{ x: number; y: number; turn: number }> = ({ x, y, turn }) => (
  <g transform={`translate(${x} ${y}) rotate(${turn})`}>
    <path d="M14 -8 a10 10 0 0 1 0 18" fill="none" stroke={INK} strokeWidth={5} />
    <rect x={-14} y={-16} width={28} height={30} rx={5} fill={PAPER} stroke={INK} strokeWidth={4} />
  </g>
);

/** "You're the guy who can juggle": three mugs, deadpan; your flatmate crosses behind with the mop, yawning. */
export const JuggleShot: React.FC<{ frame: number; start: number; mate: number; end: number }> = ({ frame, start, mate, end }) => {
  const bob = Math.sin(frame / 5) * 6;
  const me: Body = { ...YOU_SEATED, pose: { ...YOU_SEATED.pose, lean: 2, tilt: -6, armF: [76 + bob, 56], armB: [56 - bob, 74] } };
  const fh = hand(me), bk = hand(me, "back");
  const mugs = [0, 1, 2].map((j) => {
    const p = ((frame - start) / 30 + j / 3) % 1;
    if (p < 0.55) { const u = p / 0.55; return { x: mix(fh.x, bk.x, u), y: mix(fh.y, bk.y, u) - Math.sin(u * Math.PI) * 150, turn: u * 300 }; }
    const u = (p - 0.55) / 0.45;
    return { x: mix(bk.x, fh.x, u), y: mix(bk.y, fh.y, u) + Math.sin(u * Math.PI) * 20, turn: 300 + u * 60 };
  });
  const walk = linear(frame, mate, end);
  const mx = mix(1380, -200, walk);
  const mateBody: Body = { x: mx, y: 960, scale: 1.06, facing: -1, pose: walkPose(frame * 0.32) };
  const grip = { x: mx - 46, y: 960 - 200 };
  mateBody.pose = { ...mateBody.pose, armF: aim(mateBody, grip) };
  const yawn = walk > 0.3 && walk < 0.55;
  const mopTail = { x: mx + 190, y: 960 - 320 };
  const cam: Camera = camAt(frame, [[start, { x: 660, y: 690, zoom: 1.7 }], [end, { x: 640, y: 690, zoom: 1.8 }]]);
  const folded: Pose = { ...STAND, armF: [70, 110], armB: [60, 110] };
  return (
    <Lobby frame={frame} cam={drift(cam, frame, "sl-jug", 3)} mood="morning">
      <KeyBoard>
        <g transform={`translate(${hookAt(1).x} ${hookAt(1).y})`}><Coil s={0.9} /></g>
        <g transform={`translate(${hookAt(2).x} ${hookAt(2).y})`}><Coil s={0.9} turn={60} /></g>
        <Padlock x={HOOK.x + 12} y={HOOK.y + 6} shut={1} />
      </KeyBoard>
      <Person body={{ ...BOSS_AT_DESK, pose: folded }} frame={frame} seed={3} who={boss({ brows: "flat", lids: 0.3, mouth: "smirk", look: { x: 1, y: 0.3 } })} />
      <DeskFront />
      <DeskLamp lit={false} />
      <Kettle frame={frame} />
      {walk > 0 && walk < 1 && (
        <g>
          <line x1={grip.x - 30} y1={grip.y + 14} x2={mopTail.x} y2={mopTail.y} stroke="#c9915a" strokeWidth={9} strokeLinecap="round" />
          <g>{[-24, -12, 0, 12, 24].map((dx) => <path key={dx} d={`M${mopTail.x} ${mopTail.y} q${dx * 0.6} 30 ${dx} ${70 + Math.abs(dx) * 0.5}`} fill="none" stroke="#dcd6c6" strokeWidth={10} strokeLinecap="round" />)}
            <rect x={mopTail.x - 22} y={mopTail.y - 10} width={44} height={16} rx={5} fill="#8a8f9c" stroke={INK} strokeWidth={3} /></g>
          <Person body={mateBody} frame={frame} seed={7} who={{ head: FLATMATE.head, coat: FLATMATE.coat, lids: 0.5, brows: "none", mouth: yawn ? "o" : "flat", look: { x: 1, y: 0.1 } }} />
        </g>
      )}
      <YourChair />
      <Person body={me} frame={frame} seed={1} who={you({ brows: "flat", lids: 0.6, mouth: "flat", look: { x: 0.2, y: -0.8 } })} />
      {mugs.map((m, i) => <Mug key={i} {...m} />)}
    </Lobby>
  );
};

export interface TrappedTimes { start: number; hatch: number; cables: number; padlocked: number; end: number }

/** Trapped: you glance at the way out and half rise; at your old hatch (the taped socket under it) and sink; the boss
 *  polishing the padlock with his sleeve; the hook from your chair, and his little wave. */
export const TrappedShot: React.FC<{ frame: number; k: TrappedTimes }> = ({ frame, k }) => {
  // you half rise for the way out; on "lose the hatch" you get up and make for the exit, stop, and look back at your
  // old hatch (the taped socket under it in plain view); you are back in the chair by the time we see you again
  const rise = ramp(frame, k.start + 4, k.start + 12);
  const going = frame >= k.hatch && frame < k.padlocked;
  const step = ramp(frame, k.hatch, k.hatch + 18);
  const standing: Body = { x: mix(YOU_SEATED.x + 30, 900, step), y: 960, scale: 1.1, facing: step < 1 ? 1 : -1,
    pose: step < 1 ? walkPose(frame * 0.4) : { ...STAND, lean: -4, tilt: -8, armF: [14, 20], armB: [-6, 14] } };
  const me: Body = going ? standing
    : { ...YOU_SEATED, y: YOU_SEATED.y - 26 * (frame < k.hatch ? rise : 0), pose: { ...YOU_SEATED.pose, lean: frame < k.hatch ? mix(-4, 14, rise) : -4, armF: [30, 50], armB: [20, 60] } };
  const wave = ramp(frame, k.end - 34, k.end - 28);
  const polishing = frame >= k.cables && frame < k.end - 34;
  const bAt: Body = { x: 236, y: 950, scale: 1.12, facing: wave > 0 ? 1 : -1, pose: { ...STAND, lean: 6 } };
  const rub = { x: HOOK.x + 14 + Math.cos(frame / 3) * 10, y: HOOK.y + 12 + Math.sin(frame / 3) * 6 };
  bAt.pose = { ...bAt.pose, armF: wave > 0 ? [mix(20, 160, wave) + Math.sin(frame) * 10 * wave, 20] : polishing ? aim(bAt, rub) : [20, 20] };
  const look = frame < k.hatch ? { x: -1, y: 0 } : frame < k.cables ? (step < 1 ? { x: 1, y: 0 } : { x: 1, y: 0.4 }) : { x: 1, y: -0.2 };
  const mh = head(me);
  const cam: Camera = frame >= k.padlocked
    ? camAt(frame, [[k.padlocked, { x: 430, y: 690, zoom: 1.55 }], [k.end, { x: 410, y: 690, zoom: 1.62 }]])
    : frame >= k.cables
      ? camAt(frame, [[k.cables, { x: 210, y: 640, zoom: 2.3 }], [k.padlocked, { x: 200, y: 640, zoom: 2.5 }]])
      : frame >= k.hatch
        ? camAt(frame, [[k.hatch, { x: 660, y: 600, zoom: 1.55 }], [k.cables, { x: 640, y: 600, zoom: 1.65 }]])
        : camAt(frame, [[k.start, closeUp(mh.x - 20, mh.y + 20, 2.0)], [k.hatch, closeUp(mh.x - 20, mh.y + 20, 2.1)]]);
  return (
    <Lobby frame={frame} cam={drift(cam, frame, "sl-trap", 2)} mood="morning">
      <KeyBoard>
        {[0, 1, 2].map((i) => <g key={i} transform={`translate(${hookAt(i).x} ${hookAt(i).y})`}><Coil s={0.9} turn={i * 30} /></g>)}
        <Padlock x={HOOK.x + 12} y={HOOK.y + 6} shut={1} />
      </KeyBoard>
      <Person body={bAt} frame={frame} seed={3} who={boss({ brows: "flat", lids: polishing ? 0.45 : 0.2, mouth: "smirk", look: wave > 0 ? { x: 1, y: 0 } : { x: 1, y: 0.2 } })} />
      <DeskFront />
      <DeskLamp lit={false} />
      <Kettle frame={frame} />
      <YourChair />
      <Person body={me} frame={frame} seed={1} who={you({ brows: frame < k.hatch ? "raised" : "worry", lids: frame >= k.padlocked ? 0.45 : 0.25,
        mouth: frame >= k.end - 28 ? "frown" : "flat", look })} />
    </Lobby>
  );
};
