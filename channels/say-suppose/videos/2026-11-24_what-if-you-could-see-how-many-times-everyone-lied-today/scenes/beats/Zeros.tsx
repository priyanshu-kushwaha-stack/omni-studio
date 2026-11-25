// Beat "Zeros" (script.md ## [01:08] Zeros).
//   - your street (library `street`, day): a postman, a jogger, a woman with a pram, each with a dim 0, one 1; the
//     camera pulls out on the street in full; your face falls, then your eyebrows go up;
//   - the bus (library `bus`): a pan down forty heads (thirty-two 0, six 1) to the mint man at the back on the phone, 9;
//     "Nearly there, love." click, 10; he puts his feet up; the bus stops at a red light; the readout EVERYONE YOU CAN
//     SEE: 19;
//   - "Who's doing the lying?" office doors; they swing open on the meeting room, the 47 blazing over the boss.
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { runPose, SEATED, STAND, walkPose } from "@whatif/kit/rig/pose";
import { bus } from "@whatif/kit/sets/Bus";
import { street } from "@whatif/kit/sets/Street";
import { HandPhone } from "@whatif/kit/sets/props";
import { SetScene } from "@whatif/kit/sets/SetScene";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK } from "@whatif/kit/theme";
import { BOSS, camAt, current, GLOW, HERO, linear, PASTELS, ramp, type Beat, type Shot } from "../shared";
import { Counter, Readout } from "../parts/Counter";
import { BUS_MAN, Clicks, headWorld, Lanyard, Person, talk, type Placed } from "../parts/FrameKit";
import { BOSS_POSE, meetingRoom, MeetingScene } from "../sets/MeetingRoom";

function times(shot: Shot) {
  const L = (p: string, s = 0) => shot.at(p, s);
  const busMan = [L("Bus man: Nearly there"), shot.end("Bus man: Nearly there")] as const;
  return {
    start: shot.from, full: L("You've heard it.", 0.5), falls: L("You've heard it.", 0.72), brows: L("You've heard it.", 0.9),
    bus: L("The bus. Forty heads"), heads: L("The bus. Forty heads", 0.12), phone: L("The bus. Forty heads", 0.74), busMan,
    tick: busMan[1] + 8, feet: busMan[1] + 22, diary: L("A diary study"), survey: L("In a US national survey"), who: L("Who's doing the lying"),
    doors: L("In the same survey"), city: L("The city isn't lying"), office: L("The city isn't lying", 0.8), meeting: L("And he's about to run"),
    end: shot.to,
  };
}
type T = ReturnType<typeof times>;

// ---- the street ----

const Street: React.FC<{ frame: number; k: T; cam: Camera }> = ({ frame, k, cam }) => {
  const t = frame - k.start;
  const post: Placed = { x: 1180 - t * 1.2, y: 1000, scale: 1.25, facing: -1, pose: walkPose(frame * 0.17) };
  const jog: Placed = { x: -200 + t * 7, y: 905, scale: 1.05, facing: 1, pose: runPose(frame * 0.32) };
  const pram: Placed = { x: 1500 - t * 1.6, y: 712, scale: 0.7, facing: -1, pose: { ...walkPose(frame * 0.15), armF: [70, 20] } };
  const youFace = frame < k.falls ? { brows: "raised" as const, mouth: "smile" as const, eyes: 1.1 }
    : frame < k.brows ? { brows: "sad" as const, mouth: "frown" as const, lids: 0.3 } : { brows: "raised" as const, mouth: "o" as const, eyes: 1.2 };
  const you: Placed = { x: 560, y: 1010, scale: 1.3, facing: 1, pose: STAND };
  const far = [-40, 230, 880, 1250, 1900, 2250, 2600];
  return (
    <SetScene set={street} mood="day" frame={frame} cam={cam} options={{ crowd: false, red: false, auto: true }} cast={[]}
      actors={
        <>
          {far.map((x, i) => {
            const f: Placed = { x: x + ((t * 1.3 * (i % 2 ? 1 : -1)) % 200), y: 702 + (i % 2) * 9, scale: 0.66, facing: i % 2 ? 1 : -1, pose: walkPose(frame * 0.18 + i * 1.7) };
            return <Person key={i} f={f} who={{ head: PASTELS[i % PASTELS.length], mouth: "flat" }} frame={frame} id={`far${i}`} count={{ base: i === 4 ? 1 : 0, size: 26, dim: i !== 4 }} />;
          })}
          <Person f={pram} who={{ head: "#e6a0a0", coat: "#b58fc7", mouth: "smile" }} frame={frame} id="pram" count={{ base: 0, size: 26, dim: true }} />
          <g transform={`translate(${pram.x - 120} ${pram.y})`}>
            <path d="M0 -60 h70 q20 0 20 30 v10 h-90Z" fill="#7fa0c4" stroke={INK} strokeWidth={3} />
            <path d="M0 -60 q-10 -30 20 -36 l30 36Z" fill="#5a6488" stroke={INK} strokeWidth={3} />
            {[10, 75].map((w) => <circle key={w} cx={w} cy={-6} r={8} fill={INK} />)}
          </g>
          <Person f={jog} who={{ head: "#7fc29b", mouth: "open", look: { x: 1, y: 0 } }} frame={frame} id="jog" count={{ base: 1, size: 36 }} />
          <Person f={post} who={{ head: "#d9c26a", coat: "#c0392b", cap: "#2f3a55", mouth: "flat" }} frame={frame} id="post" count={{ base: 0, size: 40, dim: true }} />
          <rect x={post.x + 10} y={post.y - 200} width={60} height={70} rx={8} fill="#8a5c3b" stroke={INK} strokeWidth={4} />
          <Figure x={you.x} y={you.y} scale={you.scale} pose={you.pose} head={HERO.head} scarf={HERO.scarf} tuft time={frame} flow={0.3}
            look={{ x: 0.9, y: -0.2 }} {...youFace} />
          <Lanyard f={you} />
        </>
      } />
  );
};

// ---- the bus ----

const SEAT = 840;
/** Everyone on the bus: thirty-two 0s, six 1s, seated along the bench and standing, front (left) to back (right). */
const RIDERS = Array.from({ length: 39 }, (_, i) => {
  const seated = i < 22;
  const x = seated ? -560 + i * 140 : -490 + (i - 22) * 140;
  const ones = [3, 8, 14, 24, 29, 35];
  return { i, seated, x, value: ones.includes(i) ? 1 : 0, head: PASTELS[(i * 5) % PASTELS.length], coat: ["#5a6488", "#7a5a8c", "#6d7f8f", "#8a5c3b", "#3d5a6c"][i % 5] };
});
const BUS_MAN_X = 2700;

const BusInside: React.FC<{ frame: number; k: T; cam: Camera }> = ({ frame, k, cam }) => {
  // the street slides past; it slows to a stop at the red light as he puts his feet up
  const stop = k.busMan[0];
  const slow = linear(frame, stop, stop + 24);
  const d = frame < stop ? frame : stop + 24 * (slow - slow * slow / 2);
  const feet = ramp(frame, k.feet, k.feet + 12);
  const man: Placed = { x: BUS_MAN_X, y: SEAT + 2 * 56 * 1.1, scale: 1.1, facing: -1, pose: { ...SEATED, lean: -10 * feet, armF: [140, 40], armB: [10, 25], legF: [92, -92 + 92 * feet], legB: [88, -88 + 80 * feet] } };
  const mh = headWorld(man);
  return (
    <SetScene set={bus} mood="day" frame={d} cam={cam} options={{ speed: 7, hangers: 0 }} cast={[]}
      actors={
        <>
          {/* the red light through the back window, once the bus has stopped */}
          {frame >= stop && (
            <g>
              <clipPath id="zeros-win"><rect x={1660} y={300} width={580} height={280} rx={24} /></clipPath>
              <g clipPath="url(#zeros-win)">
                <rect x={2143} y={400} width={14} height={200} fill={INK} />
                <rect x={2119} y={320} width={62} height={150} rx={12} fill={INK} />
                <circle cx={2150} cy={356} r={20} fill={CRIMSON} />
                <circle cx={2150} cy={356} r={36 + Math.sin(frame * 0.5) * 5} fill={CRIMSON} opacity={0.3} />
              </g>
            </g>
          )}
          {RIDERS.filter((r) => r.seated).map((r) => (
            <Person key={r.i} f={{ x: r.x, y: SEAT + 2 * 56 * 1.05, scale: 1.05, facing: r.i % 3 ? -1 : 1, pose: SEATED }}
              who={{ head: r.head, coat: r.coat, mouth: "flat", look: { x: 0.6, y: 0.4 }, blink: (frame + r.i * 13) % 91 < 4 }}
              frame={frame} id={`rider${r.i}`} count={{ base: r.value, size: 26, dim: r.value === 0 }} />
          ))}
          {RIDERS.filter((r) => !r.seated).map((r) => (
            <Person key={r.i} f={{ x: r.x, y: 945, scale: 1.25, facing: r.i % 2 ? -1 : 1, pose: { ...STAND, armB: [-170, 10] } }}
              who={{ head: r.head, coat: r.coat, mouth: "flat", look: { x: 0.5, y: 0.2 } }} frame={frame} id={`rider${r.i}`} count={{ base: r.value, size: 32, dim: r.value === 0 }} />
          ))}
          <Figure x={man.x} y={man.y} scale={man.scale} facing={-1} pose={man.pose} head={BUS_MAN.head} coat={BUS_MAN.coat} time={frame}
            mouth={talk(frame, k.busMan[0], k.busMan[1], feet > 0 ? "smile" : "flat")} lids={0.3} look={{ x: 0.4, y: -0.2 }} held={<HandPhone />} />
          {/* headphones */}
          <path d={`M${mh.x - 50} ${mh.y} Q${mh.x} ${mh.y - 80} ${mh.x + 50} ${mh.y}`} fill="none" stroke={INK} strokeWidth={9} />
          {[-50, 50].map((dx) => <rect key={dx} x={mh.x + dx - 12} y={mh.y - 16} width={24} height={34} rx={8} fill="#d8344f" stroke={INK} strokeWidth={4} />)}
          <Counter x={mh.x} y={mh.y - mh.r - 40} base={9} ticks={[k.tick]} frame={frame} size={50} id="bus-man" />
          {/* you at the front, holding the pole */}
          <Figure x={-640} y={980} scale={1.2} pose={{ ...STAND, armF: [150, 10] }} head={HERO.head} scarf={HERO.scarf} tuft time={frame}
            brows="raised" mouth="flat" look={{ x: 1, y: 0 }} />
        </>
      } />
  );
};

function busCam(frame: number, k: T): Camera {
  return camAt(frame, [
    [k.bus, { x: -300, y: 560, zoom: 1.15 }], [k.heads, { x: 100, y: 560, zoom: 1.0 }], [k.phone, { x: 1900, y: 560, zoom: 1.0 }],
    [k.busMan[0], closeUp(BUS_MAN_X - 200, 620, 1.9)], [k.diary, closeUp(BUS_MAN_X - 260, 620, 1.75)],
    [k.survey, { x: 1100, y: 560, zoom: 0.72 }], [k.who, { x: 1150, y: 560, zoom: 0.7 }],
  ]);
}

// ---- the doors and the meeting room ----

const Doors: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const open = ramp(frame, k.doors, k.doors + 14);
  if (open >= 1) return null;
  const leaf = (side: -1 | 1) => (
    <div style={{ position: "absolute", top: 0, height: 1080, width: 960, left: side < 0 ? 0 : 960, background: "#c9b48e",
      transformOrigin: side < 0 ? "left center" : "right center", transform: `perspective(1800px) rotateY(${side * -80 * open}deg)`,
      border: "10px solid #23252b", boxSizing: "border-box" }}>
      <div style={{ position: "absolute", left: 120, right: 120, top: 120, height: 560, background: "#dfeef0", opacity: 0.7, border: "8px solid #8a7a5a" }} />
      <div style={{ position: "absolute", top: 600, [side < 0 ? "right" : "left"]: 60, width: 30, height: 160, borderRadius: 12, background: "#d9c26a", border: "5px solid #23252b" }} />
    </div>
  );
  return <AbsoluteFill style={{ background: open > 0 ? "transparent" : "#9a8a6a" }}>{leaf(-1)}{leaf(1)}</AbsoluteFill>;
};

const Meeting: React.FC<{ frame: number; k: T; cam: Camera }> = ({ frame, k, cam }) => {
  const S = meetingRoom.spots;
  const raise = ramp(frame, k.meeting, k.meeting + 14);
  const boss: Placed = { x: S.boss.x, y: S.boss.y, scale: S.boss.scale, facing: -1, pose: { ...BOSS_POSE, armF: [28 + 60 * raise, -128 + 60 * raise] } };
  const bh = headWorld(boss);
  const cy = bh.y - 137.5;
  return (
    <MeetingScene cam={cam} mood="lamp" frame={frame} options={{ blinds: 0, pool: 1 }}
      lights={[{ x: bh.x, y: cy, r: 200, color: GLOW, strength: 0.55, moods: ["lamp"] }]}
      actors={
        <>
          <Figure x={boss.x} y={boss.y} scale={boss.scale} facing={-1} pose={boss.pose} head={BOSS.head} coat={BOSS.coat} tie={BOSS.tie}
            mouth="smile" eyes={1.05} look={{ x: 1, y: 0.1 }} time={frame} blink={(frame + 3) % 89 < 4} />
          <Counter x={bh.x} y={cy} base={47} frame={frame} size={96} id="zeros-47" />
        </>
      } />
  );
};

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot);
  const part = current(frame, [[k.start, "street"], [k.bus, "bus"], [k.who, "doors"], [k.doors, "meeting"]] as [number, string][]);
  const streetCam = drift(camAt(frame, [[k.start, { x: 760, y: 680, zoom: 1.45 }], [k.full, { x: 900, y: 620, zoom: 1.2 }], [k.falls, { x: 960, y: 560, zoom: 1.0 }],
    [k.brows, { x: 700, y: 640, zoom: 1.5 }]]), frame, "zst", 2);
  const meetCam = drift(camAt(frame, [[k.doors, { x: 1250, y: 520, zoom: 2.0 }], [k.city, { x: 1300, y: 500, zoom: 2.3 }], [k.office, { x: 1340, y: 480, zoom: 2.5 }],
    [k.end, { x: 1300, y: 500, zoom: 2.2 }]]), frame, "zmt", 1.5);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {part === "street" && <Street frame={frame} k={k} cam={streetCam} />}
      {part === "bus" && <BusInside frame={frame} k={k} cam={drift(busCam(frame, k), frame, "zbus", 2)} />}
      {(part === "doors" || part === "meeting") && <Meeting frame={frame} k={k} cam={meetCam} />}
      {(part === "doors" || part === "meeting") && <Doors frame={frame} k={k} />}
      <Readout label="EVERYONE YOU CAN SEE" value={19} frame={frame} on={k.survey} off={k.who} />
      <Clicks at={[k.tick]} volume={0.5} />
      <Sequence from={k.doors} durationInFrames={30}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.35} /></Sequence>
      <Sequence from={k.bus} durationInFrames={60}><Audio src={staticFile("sfx/bus.wav")} volume={0.25} /></Sequence>
    </AbsoluteFill>
  );
};

export const zeros: Beat = { id: "Zeros", first: "You've heard it.", lead: 0.3, Component: Scene };
