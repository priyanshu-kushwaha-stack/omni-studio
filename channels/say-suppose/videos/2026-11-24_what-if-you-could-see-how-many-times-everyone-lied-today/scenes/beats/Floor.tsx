// Beat "The Floor" (script.md ## [01:32] The Floor). Look C (owner, 2026-11-25): painted plates, our cast, close-ups.
//   - the meeting (plate `meeting-lamp`): the boss under the lamp at the head of the table, colleagues in the painted
//     chairs; over your shoulder he raises his mug, "Nobody's losing their desk."; click, 49; close on you, flat; you
//     clap once, late, mug in the other hand; the table claps under his 49;
//   - the blinds go up on the open-plan floor (plate `office-floor`): the stand-up by the whiteboard, close on each
//     speaker, click, click, click; you, flat; the printer drops a page and three heads turn; the readout 212;
//   - "villains": the boss in his glass office on the phone (plate `boss-office`), click, 50; back to the printer man;
//   - his desk: "Say it again?"; "Sent it Friday." click, 51; he winks; his screen: the proposal in Drafts; you wait,
//     arms folded, until he sends it himself; at lunch, you head out across the floor.
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, seatedY, STAND } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { BOSS, HERO, PASTELS, ramp, type Beat, type Shot } from "../shared";
import { Counter, Readout } from "../parts/Counter";
import { Clicks, handWorld, headWorld, HeroMug, Lanyard, Person, talk, type Placed } from "../parts/FrameKit";
import { BOSS_POSE } from "../sets/MeetingRoom";
import { PlateScene } from "../parts/Plate";
import { counterLight, Cut, FgShoulder, onHead, shotAt, type Shot as Cam } from "../parts/SayItAgain.LookC";
import { BossOffice, OfficeFloor, type FloorTimes } from "../parts/Floor.Office";

function times(shot: Shot): FloorTimes {
  const L = (p: string, s = 0) => shot.at(p, s);
  const E = (p: string) => shot.end(p);
  const nobody = [L("Boss: Nobody's losing"), E("Boss: Nobody's losing")] as const;
  const printerEnd = E("Printer man: Printer's broken");
  const sent = [L("Boss: Sent it Friday"), E("Boss: Sent it Friday")] as const;
  const page = printerEnd + 60;
  return {
    start: shot.from, nobody, tick49: nobody[1] + 6, coffee: L("Forty-nine before"), blinds: E("Forty-nine before"),
    woman: [L("Desk woman: Nearly done"), E("Desk woman: Nearly done")] as const,
    man: [L("Desk man: Sent it Friday"), E("Desk man: Sent it Friday")] as const,
    printer: [L("Printer man: Printer's broken"), printerEnd] as const,
    // the script's clicks (clickData.ts): 0.2, 0.65 and 1.1 s after the printer line
    ticks: [printerEnd + 6, printerEnd + 20, printerEnd + 33], page, turn: page + 8,
    floor: Math.min(printerEnd + 66, L("You expected villains") - 12),
    villains: L("You expected villains"), tick50: L("You expected villains", 0.3), printer2: L("You expected villains", 0.5),
    proposal: L("The proposal he"), askEnd: E("The proposal he"), sent, tick51: sent[1] + 6,
    drafts: L("Fifty-one."), fold: L("Fifty-one.", 0.45), send: L("Fifty-one.", 0.85),
    lunch: L("At lunch you find out"), end: shot.to,
  };
}

// ---- the meeting (meeting-lamp: the table's far edge at y 654, the lamp over x 975) ----

const TABLE_FAR = 656;
const BOSS_AT = { x: 975, y: 850, scale: 0.9 };
/** The painted chairs: seat top, x, scale, facing. */
const CHAIRS = [
  { x: 600, seat: 842, scale: 1.0, facing: 1 as const }, { x: 668, seat: 779, scale: 0.92, facing: 1 as const },
  { x: 720, seat: 742, scale: 0.85, facing: 1 as const }, { x: 1262, seat: 734, scale: 0.85, facing: -1 as const },
  { x: 1340, seat: 818, scale: 0.98, facing: -1 as const },
];
const MEET_COUNTS = [0, 1, 0, 1, 0];
const YOU_MEET: Placed = { x: 250, y: 1270, scale: 2.2, facing: 1, pose: STAND };

const Meeting: React.FC<{ frame: number; k: FloorTimes; cam: Camera; fg: boolean }> = ({ frame, k, cam, fg }) => {
  const lift = ramp(frame, k.nobody[0], k.nobody[0] + 12);
  const boss: Placed = { ...BOSS_AT, facing: -1, pose: { ...BOSS_POSE, armF: [28 + 110 * lift, -128 + 140 * lift] } };
  const bh = headWorld(boss);
  const clap = frame >= k.tick49 + 8 && frame < k.tick49 + 70;
  const nod = frame >= k.nobody[0] && frame < k.tick49 ? 1 : 0;
  const late = frame >= k.tick49 + 30 && frame < k.tick49 + 38;
  const you: Placed = { ...YOU_MEET, pose: { ...STAND, armF: [70, 70], armB: late ? [95, 30] : [-7, 8] } };
  const lights = [counterLight(bh, "lamp", 0.35 + 0.25 * ramp(frame, k.tick49, k.tick49 + 10))];
  return (
    <AbsoluteFill>
      <PlateScene plate="meeting-lamp" cam={cam} mood="lamp" rimFrom="right" lights={lights}
        actors={
          <>
            {CHAIRS.map((c, i) => {
              const f: Placed = { x: c.x, y: seatedY(c.seat, c.scale), scale: c.scale, facing: c.facing,
                pose: { ...SEATED, tilt: nod * 6 * Math.sin(frame * 0.25 + i), armF: clap ? [100 + 18 * Math.sin(frame * 0.9 + i), 60] : [25, 35], armB: clap ? [80, 70] : [10, 25] } };
              return (
                <Cut key={i} y={c.seat - 2} id={`meet-${i}`}>
                  <Person f={f} who={{ head: PASTELS[(i * 3) % 8], coat: "#3b3e47", mouth: clap ? "smile" : "flat", look: { x: 0.8, y: 0.1 }, blink: (frame + i * 23) % 89 < 4 }}
                    frame={frame} id={`meet${i}`} count={{ base: MEET_COUNTS[i], size: 30 * c.scale, dim: true }} />
                </Cut>
              );
            })}
            <Cut y={TABLE_FAR} id="meet-boss">
              <Figure x={boss.x} y={boss.y} scale={boss.scale} facing={-1} pose={boss.pose} head={BOSS.head} coat={BOSS.coat} tie={BOSS.tie}
                mouth={talk(frame, k.nobody[0], k.nobody[1], "smile")} eyes={1.05} look={{ x: 1, y: 0.1 }} time={frame} />
            </Cut>
            <HeroMug x={handWorld(boss).x} y={handWorld(boss).y} scale={boss.scale} tilt={6} steam={false} />
            <Counter x={bh.x} y={bh.y - bh.r - 34} base={48} ticks={[k.tick49]} frame={frame} size={34} id="floor-boss" />
            {!fg && (
              <g>
                <Figure x={you.x} y={you.y} scale={you.scale} pose={you.pose} head={HERO.head} scarf={HERO.scarf} tuft time={frame}
                  brows={frame >= k.tick49 ? "flat" : "none"} lids={0.3} mouth="flat" look={{ x: 0.9, y: -0.2 }} />
                <Lanyard f={you} />
                <HeroMug x={handWorld(you).x} y={handWorld(you).y} scale={you.scale} />
              </g>
            )}
          </>
        } />
      {fg && <FgShoulder x={300} head={HERO.head} scarf={HERO.scarf} tuft />}
    </AbsoluteFill>
  );
};

function meetShots(k: FloorTimes): Cam[] {
  const boss = headWorld({ ...BOSS_AT, facing: -1, pose: BOSS_POSE });
  const you = headWorld(YOU_MEET);
  return [
    { at: k.start, cam: { x: 960, y: 560, zoom: 1.08 }, to: { x: 960, y: 555, zoom: 1.14 }, name: "wide" },
    { at: k.nobody[0] + 22, cam: onHead(boss, 0.15, 160, 120), to: onHead(boss, 0.16, 160, 120), name: "ots" },
    { at: k.tick49 + 8, cam: onHead(you, 0.19, -170, 60), to: onHead(you, 0.2, -170, 60), name: "you" },
    { at: k.coffee, cam: { x: 1010, y: 610, zoom: 2.3 }, to: { x: 990, y: 600, zoom: 2.6 }, name: "table" },
  ];
}

/** The blinds rolling up over the floor (screen space). */
const Blinds: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const up = ramp(frame, at, at + 16);
  if (up >= 1 || frame < at) return null;
  return (
    <AbsoluteFill style={{ clipPath: `inset(0 0 ${up * 100}% 0)` }}>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(180deg, #161b27 0 26px, #0d1018 26px 40px)" }} />
    </AbsoluteFill>
  );
};

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot);
  const inMeeting = frame < k.blinds;
  const m = shotAt(frame, meetShots(k), k.blinds);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {inMeeting && <Meeting frame={frame} k={k} cam={drift(m.cam, frame, "fm", 2)} fg={m.name === "ots"} />}
      {!inMeeting && (frame < k.villains || (frame >= k.printer2 && frame < k.proposal) || frame >= k.lunch) && <OfficeFloor frame={frame} k={k} />}
      {!inMeeting && ((frame >= k.villains && frame < k.printer2) || (frame >= k.proposal && frame < k.lunch)) && <BossOffice frame={frame} k={k} />}
      <Blinds frame={frame} at={k.blinds} />
      <Readout label="EVERYONE YOU CAN SEE" value={212} frame={frame} on={k.floor} off={k.villains} />
      {/* the script's clickData has no click for 50: this one is the beat's own */}
      <Clicks at={[k.tick50]} volume={0.5} />
      <Sequence from={k.page - 8} durationInFrames={40}><Audio src={staticFile("sfx/typing.wav")} volume={0.25} /></Sequence>
    </AbsoluteFill>
  );
};

export const floor: Beat = { id: "Floor", first: "Boss: Nobody's losing", lead: 0.3, Component: Scene };
