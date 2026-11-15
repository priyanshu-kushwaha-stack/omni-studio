// Staff Last at night: you nod off in your chair at the desk (lamp lit), chin sinking; a paper inset of a fortnight of
// inside sky, the counter-sun crossing fourteen times while tally marks add up; you jerk awake with a stave of music
// pouring out of your mouth, conducting; your boss leans in from the stairs, "No naps.", slaps the tag on your chair and
// the music stops dead. Then the hall wide from your chair: a thousand portholes, every counter blurring, and you alone
// with the kettle and the rota.
import { AbsoluteFill } from "remotion";
import { STAND } from "@whatif/kit/rig/pose";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { camAt, mix, ramp } from "../shared";
import { aim, head, Person, type Body } from "./CityPlugsIn.Kit";
import { boss, you, YOU_SEATED } from "./StaffLast.Desk";
import { Coil, DeskFront, DeskLamp, HOOK, Kettle, KeyBoard, Lobby, Padlock, PEG, Rota, YourChair } from "./StaffLast.Set";

/** The coils padlocked on the hook (they stay there). */
const Locked: React.FC = () => (
  <KeyBoard>
    {[0, 1, 2].map((i) => <g key={i} transform={`translate(${HOOK.x + 12 + i * 4} ${HOOK.y + 34 + i * 7})`}><Coil s={0.9} turn={i * 30} /></g>)}
    <Padlock x={HOOK.x + 12} y={HOOK.y + 6} shut={1} />
  </KeyBoard>
);

/** The fortnight inset (screen pixels): a band of inside sky over ink roofs, the counter-sun crossing it `n` times, a
 *  tally mark for every crossing. */
const Fortnight: React.FC<{ frame: number; from: number; to: number }> = ({ frame, from, to }) => {
  const period = Math.max(4, (to - from) / 14);
  const done = Math.min(14, Math.floor((frame - from) / period));
  const q = ((frame - from) / period) % 1;
  const sx = 40 + q * 440, sy = 200 - Math.sin(q * Math.PI) * 150;
  const open = ramp(frame, from, from + 10);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <g transform={`translate(1190 120) scale(1 ${open})`}>
          <rect x={10} y={14} width={520} height={330} rx={12} fill="#000" opacity={0.25} />
          <rect width={520} height={330} rx={12} fill={PAPER} stroke="#cdbfa6" strokeWidth={5} />
          <rect x={20} y={20} width={480} height={220} rx={6} fill={done < 14 ? "#9fc0e0" : "#c9d8e8"} />
          <path d="M40 200 Q260 -100 480 200" fill="none" stroke={INK} strokeWidth={3} strokeDasharray="8 12" opacity={0.5} />
          {done < 14 && (
            <g transform={`translate(${sx} ${sy})`}>
              <circle r={34} fill="#fff1c4" opacity={0.6} />
              <rect x={-30} y={-16} width={60} height={32} rx={6} fill={INK} />
              {[0, 1, 2].map((t) => <rect key={t} x={-26 + t * 18} y={-11} width={14} height={22} rx={2} fill={CRIMSON} />)}
            </g>
          )}
          <path d="M20 240 L20 200 L60 200 L60 180 L100 180 L100 210 L150 210 L150 170 L200 170 L200 205 L260 205 L260 185 L320 185 L320 215 L380 215 L380 175 L430 175 L430 200 L500 200 L500 240Z" fill="#5a4a5a" />
          {Array.from({ length: done }, (_, i) => {
            const g = Math.floor(i / 5), m = i % 5;
            const x0 = 40 + g * 110;
            return m < 4
              ? <line key={i} x1={x0 + m * 18} y1={262} x2={x0 + m * 18} y2={312} stroke={INK} strokeWidth={6} strokeLinecap="round" />
              : <line key={i} x1={x0 - 10} y1={300} x2={x0 + 66} y2={270} stroke={CRIMSON} strokeWidth={6} strokeLinecap="round" />;
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** A stave of music pouring out of a mouth at (x, y) towards the upper left, `len` px long, notes riding it. */
const Stave: React.FC<{ x: number; y: number; len: number; frame: number }> = ({ x, y, len, frame }) => {
  const pts = (k: number) => {
    const out: string[] = [];
    for (let s = 0; s <= len; s += 12) {
      const w = Math.sin(s / 70 - frame / 5) * 26 * (s / Math.max(1, len));
      const spread = (k - 2) * (6 + s * 0.035);
      out.push(`${x - s * 0.86 + spread * 0.5},${y - s * 0.5 + w + spread}`);
    }
    return out.join(" ");
  };
  const notes = Array.from({ length: 7 }, (_, n) => {
    const s = (frame * 7 + n * 90) % Math.max(1, len);
    const k = n % 5;
    const w = Math.sin(s / 70 - frame / 5) * 26 * (s / Math.max(1, len));
    const spread = (k - 2) * (6 + s * 0.035);
    return { x: x - s * 0.86 + spread * 0.5, y: y - s * 0.5 + w + spread, s };
  });
  return (
    <g>
      {[0, 1, 2, 3, 4].map((k) => <polyline key={k} points={pts(k)} fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />)}
      {notes.filter((n) => n.s > 30).map((n, i) => (
        <g key={i} transform={`translate(${n.x} ${n.y}) rotate(-25)`}>
          <ellipse rx={10} ry={7} fill={INK} />
          <line x1={9} y1={0} x2={9} y2={-34} stroke={INK} strokeWidth={3.5} />
          {i % 2 === 0 && <path d="M9 -34 q12 6 10 18" fill="none" stroke={INK} strokeWidth={3.5} />}
        </g>
      ))}
    </g>
  );
};

export interface NapTimes { start: number; inset: number; wake: number; boss: number; slap: number; end: number }

export const NapShot: React.FC<{ frame: number; k: NapTimes }> = ({ frame, k }) => {
  const sink = ramp(frame, k.start + 4, k.inset);
  const awake = frame >= k.wake;
  const cut = frame >= k.slap;
  const jolt = awake ? Math.max(0, 1 - (frame - k.wake) / 6) * 26 : 0;
  const nod = !awake && sink >= 1 ? Math.sin(frame / 14) * 3 : 0;
  const conduct = awake && !cut ? Math.sin(frame / 4) * 28 : 0;
  const me: Body = { ...YOU_SEATED, y: YOU_SEATED.y - jolt, pose: { ...YOU_SEATED.pose, lean: awake ? (cut ? 2 : -4) : mix(0, 10, sink), tilt: awake ? (cut ? 0 : -10) : mix(0, 34, sink) + nod,
    armF: awake && !cut ? [110 + conduct, 40] : [mix(30, 8, sink), mix(50, 10, sink)], armB: awake && !cut ? [70 - conduct, 50] : [mix(20, 4, sink), mix(60, 8, sink)] } };
  const mh = head(me);
  const mouth = { x: mh.x - 12 * me.scale, y: mh.y + 22 * me.scale };
  const staveLen = awake && !cut ? Math.min(620, (frame - k.wake) * 18) : 0;
  const lean = ramp(frame, k.boss, k.boss + 10);
  const bossAt: Body = { x: mix(1250, 880, lean), y: 950, scale: 1.12, facing: -1, pose: { ...STAND, lean: 28 * lean } };
  const tagSpot = { x: PEG.x - 2, y: PEG.y + 46 };
  const slapT = ramp(frame, k.slap - 6, k.slap);
  bossAt.pose = { ...bossAt.pose, armF: lean > 0 ? aim(bossAt, { x: mix(bossAt.x - 60, tagSpot.x, slapT), y: mix(tagSpot.y - 80, tagSpot.y, slapT) }) : [20, 20] };
  const tag = cut ? Math.min(1, 0.6 + (frame - k.slap) / 10) : 0;
  const singing = awake && !cut;
  const cam: Camera = frame >= k.boss
    ? camAt(frame, [[k.boss, { x: 760, y: 660, zoom: 1.55 }], [k.end, { x: 760, y: 670, zoom: 1.65 }]])
    : awake
      ? camAt(frame, [[k.wake, { x: 520, y: 600, zoom: 1.45 }], [k.boss, { x: 500, y: 590, zoom: 1.35 }]])
      : camAt(frame, [[k.start, closeUp(mh.x - 30, mh.y + 30, 2.0)], [k.wake, closeUp(mh.x - 30, mh.y + 40, 2.35)]]);
  return (
    <>
      <Lobby frame={frame} cam={drift(cam, frame, "sl-nap", 2)} mood="night">
        <Locked />
        <DeskFront />
        <DeskLamp lit />
        <Kettle frame={frame} />
        <YourChair tag={tag} />
        <Person body={me} frame={frame} seed={1} who={you({ brows: singing ? "raised" : cut ? "worry" : "none", lids: awake ? 0 : mix(0.4, 1, sink), eyes: awake ? 1.3 : 1,
          mouth: singing ? (Math.floor(frame / 6) % 2 ? "o" : "open") : cut ? "o" : "flat", look: cut ? { x: -1, y: 0 } : { x: 1, y: -0.2 }, blink: awake ? false : undefined })} />
        {staveLen > 0 && <Stave x={mouth.x} y={mouth.y} len={staveLen} frame={frame} />}
        {lean > 0 && <Person body={bossAt} frame={frame} seed={3} who={boss({ brows: "angry", lids: 0.2, mouth: frame >= k.slap - 10 && frame < k.end - 8 ? "open" : "flat", look: { x: 1, y: 0.3 } })} />}
      </Lobby>
      {frame >= k.inset && frame < k.wake && <Fortnight frame={frame} from={k.inset} to={k.wake} />}
    </>
  );
};

/** The hall wide from your chair: the camera pulls back and up from you to a thousand portholes, every counter
 *  blurring; you alone with the kettle (steaming) and the rota, which you lift and look at on "the rota". */
export const WideShot: React.FC<{ frame: number; start: number; rota: number; end: number }> = ({ frame, start, rota, end }) => {
  const lift = ramp(frame, rota, rota + 10);
  const me: Body = { ...YOU_SEATED, pose: { ...YOU_SEATED.pose, lean: 4, tilt: mix(0, 12, lift), armF: [mix(30, 120, lift), mix(50, 40, lift)], armB: [20, 60] } };
  const p = ramp(frame, start, end - 6);
  const cam: Camera = { x: mix(620, 960, p), y: mix(690, 430, p), zoom: mix(1.9, 0.62, p) };
  return (
    <Lobby frame={frame} cam={drift(cam, frame, "sl-wide", 2)} mood="night" tiers flutter>
      <Locked />
      <DeskFront />
      <DeskLamp lit />
      <Kettle frame={frame} steam={lift} />
      <YourChair tag={1} />
      <Person body={me} frame={frame} seed={1} who={you({ brows: "flat", lids: 0.5, mouth: "flat", look: lift > 0.5 ? { x: 0.8, y: 0.4 } : { x: -0.6, y: -0.6 }, held: lift > 0.1 ? Rota : undefined })} />
    </Lobby>
  );
};
