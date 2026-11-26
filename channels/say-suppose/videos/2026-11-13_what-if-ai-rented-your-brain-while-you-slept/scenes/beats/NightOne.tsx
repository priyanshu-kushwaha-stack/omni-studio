// Beat "Night One" (script.md v3 ## [00:16] Night One; v3 lines 3-14). Times come from shot.v3 (v3 numbering): lines 4,
// 6, 7 and 9 are new in v3 and have no v1 number. Phrase shares (p) are from the takes' word timings.
//
//   (from The Chair)  CLOSE you take the band from his grey hand.
//   3  "Twice a week, you sell your plasma..." the door swings shut on his back, the clock on the wall; "the pale part of
//      your blood": INSERT the bridge walkway at dawn, you walking in the queue, counting the notes, the band in your
//      pocket; 4 "It's how your family keeps up with what it owes." the walk goes on.
//   5  "So what if a company could rent your brain while you slept?" the bunk room at night: you awake on the bottom
//      bunk, the band held up over your face, your brother asleep above.
//   6  "That's the band." CLOSE the band in your hand by the bed, a thin dark strip, one small teal light; "A thin strip
//      you wear across your forehead": you lay it across your forehead, your eyes close, you settle back.
//   7  "While you sleep, it lends your brain to a company." the light glows and a dotted thread rises out of the top of
//      the frame; "And it pays you, by the hour.": a coin drops back down out of the dark into the jar. Clink.
//   8  "Midnight. The band goes on. A chime." THE KEY SHOT: the G1 thumbnail's frame exactly (KEY_VIEW), the light
//      comes on, the thread, the pale second you at its floating desk, coins arcing into the jar; your brother on the top
//      bunk watching (the one addition).
//   9  "That pale figure up there?" a slow push toward the ghost, whole in frame; "That's your sleeping brain, at work
//      for the company."
//   hold (3 s, performed) a coin lands; your brother flinches, leans over the edge, looks straight at the ghost; the
//      ghost types on and doesn't look back; you smile in your sleep.
//   10 "You feel nothing." close on your smile; "But a night you sell is a night your own brain doesn't get." pull back.
//   morning: your brother hangs down, shakes the jar over your face; you wake; 11 "What'd you get?" palm out;
//      TAG $90 (the split-flap); 12 "Scam."
//   13 "Ninety dollars..." the flap and your face; the room; close on your grin; "that's the problem": it goes.
//   14 "Because you count every waking hour as money..." the clinic: the clock, your lips counting;
//      "And nobody's ever paid you for one asleep": back on the pillow, awake, the jar beside you.
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { SEATED, walkPose } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { ClinkSound, Coin, DeviceSound, landings, PayFlap, Band } from "../parts";
import { camAt, current, HERO, lineEnd, ramp, type Beat, type Shot } from "../shared";
import { BRIDGE, BridgeScene } from "../sets/Bridge";
import { BunkRoom, KEY_VIEW } from "../sets/BunkRoom";
import { ClinicArmrest, ClinicChair, ClinicScene, seatedInChair } from "../sets/Clinic";
import { Body, handWorld, lineAt, Notes, talk, type Placed } from "./Chair.Rig";
import { DoorShot, skitTimes, TakeInsert } from "./Chair.Skit";
import { ticks } from "./Chair";
import { BandHeldUp, BandOn, HangingBrother, TopBrother, YouOnPillow } from "./NightOne.Bunk";

type T = ReturnType<typeof times>;

function times(clips: Clip[]) {
  const at = (i: number, p: number) => lineAt(clips, i, p);
  const from = (i: number) => clips[i].from;
  const skit = skitTimes(clips);
  const on = at(8, 0.62); // "The band goes on" ... "A chime": the light, the chime
  const coinsFrom = on + 26;
  const hold = lineEnd(clips, 9); // performed: the brother and the ghost
  const gap = from(10) - hold;
  const inHold = (p: number) => Math.round(hold + gap * p);
  const lands = landings(coinsFrom, lineEnd(clips, 10) - 26);
  const lower = [at(6, 0.66), at(6, 0.95)] as const; // "across your forehead": the band goes on, you settle back
  const pay = at(7, 0.68); // "And it pays you": the coin leaves the top of the frame
  return {
    skit,
    bridge: skit.bridge,
    awake: from(5),
    bandClose: from(6) - 2, // "That's the band."
    lower,
    glow: from(7) - 2, // "While you sleep": the light glows
    thread: [at(7, 0.24), at(7, 0.52)] as const, // "it lends your brain to a company": the thread rises out of frame
    pay,
    payLands: pay + 22,
    key: from(8) - 2,
    on,
    coinsFrom,
    coinsTo: lineEnd(clips, 10) - 26,
    ghost: from(9) - 2, // "That pale figure up there?": the push toward the ghost
    hold,
    flinch: lands.find((f) => f >= hold + 3) ?? hold + 6, // a coin lands; he flinches
    lean: inHold(0.32), // he leans over the edge, looks at the ghost
    ghostClose: inHold(0.6), // the ghost doesn't look back
    smile: inHold(0.8), // you smile in your sleep
    upThere: at(10, 0.26), // "But a night you sell is a night your own brain doesn't get."
    morning: lineEnd(clips, 10) - 2,
    wake: lineEnd(clips, 10) + 6,
    what: [from(11), lineEnd(clips, 11)] as const, // "What'd you get?"
    flap: lineEnd(clips, 11) - 3, // TAG $90
    scam: [from(12), lineEnd(clips, 12)] as const, // "Scam."
    l8: from(13),
    wide8: at(13, 0.33), // "lying down"
    grin: at(13, 0.53), // "the best wage of your life"
    problem: at(13, 0.8), // "and that's the problem"
    clinic: from(14) - 2, // "Because you count every waking hour as money..."
    asleep: at(14, 0.65), // "And nobody's ever paid you for one asleep."
    end: from(15),
    lands,
  };
}

/** INSERT: the bridge walkway at dawn; you walk in the queue, counting the notes, the band poking out of your pocket. */
const BridgeInsert: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const x = 520 + (frame - k.bridge) * 1.6;
  const f: Placed = { x, y: BRIDGE.floor + 2, scale: 1.15, facing: 1, pose: { ...walkPose(frame * 0.16), armF: [60, 70], armB: [50, 80] } };
  const h = handWorld(f, "armF");
  const pocket = { x: x - 18, y: BRIDGE.floor - 120 };
  const cam: Camera = { x: x + 120, y: 700, zoom: 1.75 };
  return (
    <BridgeScene frame={frame} mood="morning" cam={cam} queue={7} skip={[3]} actors={(
      <>
        <Band x={pocket.x} y={pocket.y} scale={0.35} tilt={70} />
        <Body f={f} head={HERO.head} scarf={HERO.scarf} tuft time={frame} brows="flat" lids={0.2} look={{ x: 0.5, y: 0.6 }}
          mouth={Math.floor(frame / 7) % 2 ? "o" : "flat"} />
        <Notes x={h.x + 6} y={h.y - 10} n={3} scale={0.5} tilt={-20} />
      </>
    )} />
  );
};

/** The clinic again: the clock, your lips counting the seconds as money. */
const CountShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const f: Placed = { ...seatedInChair(SEATED), pose: { ...SEATED, armF: [30, 60], armB: [40, 50] } };
  const palm = handWorld(f, "armF");
  const cam = camAt(frame, [[k.clinic, { x: 860, y: 440, zoom: 1.5 }], [k.asleep, { x: 880, y: 450, zoom: 1.72 }]]);
  return (
    <ClinicScene frame={frame + 22} mood="morning" cam={drift(cam, frame, "count", 3)} door={0} actors={(
      <>
        <ClinicChair />
        <Body f={f} head={HERO.head} scarf={HERO.scarf} tuft time={frame} brows="flat" lids={0.25}
          mouth={Math.floor(frame / 7) % 2 ? "o" : "flat"} look={{ x: 0.8, y: -0.6 }} />
        <ClinicArmrest />
        <Coin x={palm.x - 4} y={palm.y - 14} r={17} tilt={-20} />
      </>
    )} />
  );
};

/** The bunk room, from v3 line 5 to the end of line 14 (the clinic flashback aside). */
const Bunk: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.awake, "awake"], [k.bandClose, "band"], [k.glow, "glow"], [k.key, "key"], [k.ghost, "push"], [k.hold, "flinch"],
    [k.lean, "lean"], [k.ghostClose, "ghost"], [k.smile, "smile"], [k.upThere, "up"], [k.morning, "shake"], [k.what[0] - 2, "what"],
    [k.scam[0] - 2, "scam"], [k.l8, "flap"], [k.wide8, "wide"], [k.grin, "grin"], [k.asleep, "awake9"]] as [number, string][]);
  const v = (x: number, y: number, zoom: number) => ({ x, y, zoom });
  const views: Record<string, { x: number; y: number; zoom: number }> = {
    // your face kept above the lower-left caption corner while the cards for lines 3 and 6 are up
    awake: camAt(frame, [[k.awake, v(800, 640, 1.15)], [k.bandClose, v(720, 690, 1.35)]]),
    band: camAt(frame, [[k.bandClose, v(650, 715, 1.9)], [k.lower[0], v(610, 745, 1.75)], [k.glow, v(600, 750, 1.72)]]),
    glow: camAt(frame, [[k.glow, v(430, 690, 1.25)], [k.key, v(420, 650, 1.18)]]),
    key: KEY_VIEW,
    // "That pale figure up there?": a slow push toward the ghost, whole in frame
    push: camAt(frame, [[k.ghost, KEY_VIEW], [k.hold, v(1040, 600, 1.38)]]),
    flinch: camAt(frame, [[k.hold, v(1280, 440, 1.6)], [k.lean, v(1290, 450, 1.7)]]),
    lean: camAt(frame, [[k.lean, v(1300, 500, 1.85)], [k.ghostClose, v(1290, 510, 1.95)]]),
    ghost: camAt(frame, [[k.ghostClose, v(1080, 560, 2.2)], [k.smile, v(1070, 560, 2.35)]]),
    smile: camAt(frame, [[k.smile, v(500, 640, 2.2)], [k.upThere, v(500, 630, 2.4)]]),
    up: camAt(frame, [[k.upThere, v(560, 620, 2.0)], [k.morning, v(860, 520, 1.3)]]),
    shake: camAt(frame, [[k.morning, v(560, 560, 1.45)], [k.what[0], v(580, 570, 1.55)]]),
    what: camAt(frame, [[k.what[0] - 2, v(700, 570, 1.75)], [k.scam[0], v(700, 570, 1.85)]]),
    scam: camAt(frame, [[k.scam[0] - 2, v(560, 560, 1.6)], [k.l8, v(550, 560, 1.68)]]),
    flap: camAt(frame, [[k.l8, v(470, 560, 1.75)], [k.wide8, v(460, 570, 1.9)]]),
    wide: camAt(frame, [[k.wide8, v(960, 540, 1.0)], [k.grin, v(900, 560, 1.06)]]),
    grin: camAt(frame, [[k.grin, v(520, 660, 2.35)], [k.problem, v(510, 665, 2.45)], [k.clinic, v(505, 668, 2.58)]]), // v7: gentler (was to 2.75)
    awake9: camAt(frame, [[k.asleep, v(400, 680, 1.85)], [k.end, v(410, 690, 2.0)]]),
  };
  const view = views[shot];
  const night = frame < k.morning;
  if (night) {
    const awake = frame < k.key;
    if (frame >= k.bandClose && awake) {
      // v3 lines 6-7: the band defined
      return (
        <BunkRoom frame={frame} mood="night" view={view} you="none" brother="asleep">
          <BandOn frame={frame} p={ramp(frame, k.lower[0], k.lower[1])} settle={ramp(frame, k.lower[1] - 4, k.lower[1] + 18)}
            glow={ramp(frame, k.glow, k.glow + 14)} thread={k.thread} pay={k.pay} fall={k.payLands - k.pay} />
        </BunkRoom>
      );
    }
    const flinched = frame >= k.flinch && frame < k.lean;
    const brotherFace = flinched
      ? { eyes: 1.35, brows: "raised" as const, mouth: "o" as const, look: { x: -0.3, y: 0.4 } }
      : frame >= k.lean && frame < k.smile ? { eyes: 1.2, brows: "worry" as const, mouth: "flat" as const, look: { x: -1, y: 0.15 } }
        : { eyes: 1.15, brows: "raised" as const, mouth: "flat" as const, look: { x: -0.8, y: 0.5 } };
    return (
      <BunkRoom frame={frame} mood="night" view={view} you={awake ? "noband" : "band"} youEyes={awake ? "open" : "shut"}
        device={awake ? undefined : { on: k.on }} coins={awake ? undefined : { from: k.coinsFrom, to: k.coinsTo }}
        brother={awake ? "asleep" : "none"}>
        {awake && <BandHeldUp lift={ramp(frame, k.awake, k.bandClose)} />}
        {!awake && <TopBrother x={1560} frame={frame} lean={ramp(frame, k.lean, k.lean + 10) * (1 - ramp(frame, k.smile, k.smile + 10))} face={brotherFace} />}
      </BunkRoom>
    );
  }
  // morning
  const woke = frame >= k.wake;
  const shake = frame < k.what[0] ? 1 : 0;
  const palm = ramp(frame, k.what[0] - 4, k.what[0] + 4) * (1 - ramp(frame, k.wide8, k.wide8 + 12));
  const gone = frame >= k.asleep;
  const bro = frame < k.scam[0]
    ? { brows: "raised" as const, lids: 0, mouth: talk(frame, k.what[0], k.what[1], "smile"), eyes: 1.1, look: { x: -0.6, y: -0.3 } }
    : { brows: "flat" as const, lids: 0.45, mouth: talk(frame, k.scam[0], k.scam[1], "flat"), eyes: 1, look: { x: -0.7, y: -0.2 } };
  const yourMouth = !woke ? "smile" : frame < k.problem ? "smile" : "flat";
  return (
    <BunkRoom frame={frame} mood="morning" view={view} you="none" jarFill={gone ? 0.42 : -1} brother="none">
      <YouOnPillow eyes={woke ? "open" : "shut"} mouth={frame >= k.what[0] && frame < k.wake + 20 ? "o" : yourMouth} band={!gone} />
      {!gone && <HangingBrother x={740} frame={frame} shake={shake} palm={palm} face={bro}
        jarAt={shake ? undefined : { x: 900, y: 520 }} />}
      <PayFlap frame={frame} at={k.flap} until={k.wide8} x={300} y={420} value="$90" />
    </BunkRoom>
  );
};

/** The picture alone (no sound) at a frame, from v3's clips (v3 numbering): The Rule's title card is made from its last
 *  frame. */
export const NightOnePicture: React.FC<{ frame: number; clips: Clip[] }> = ({ frame, clips }) => {
  const k = times(clips);
  const s = k.skit;
  const part = current(frame, [[0, "take"], [s.shut, "door"], [k.bridge, "bridge"], [k.awake - 2, "bunk"], [k.clinic, "count"],
    [k.asleep, "bunk"]] as [number, string][]);
  return (
    <>
      {part === "take" && <TakeInsert frame={frame} k={s} />}
      {part === "door" && <DoorShot frame={frame} k={s} />}
      {part === "bridge" && <BridgeInsert frame={frame} k={k} />}
      {part === "bunk" && <Bunk frame={frame} k={k} />}
      {part === "count" && <CountShot frame={frame} k={k} />}
    </>
  );
};

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, v3 } = shot;
  const k = times(v3);
  const s = k.skit;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <NightOnePicture frame={frame} clips={v3} />
      {/* sound outside the Stage: the door, the band through the night, the coins, the jar, the flap, the clock */}
      <Sequence from={s.doorClose[1] - 2} durationInFrames={20}><Audio src={staticFile("sfx/knock.wav")} volume={0.22} /></Sequence>
      <DeviceSound at={k.on} frames={k.morning - k.on - 4} volume={0.85} />
      <ClinkSound at={[k.payLands]} volume={0.5} />
      <ClinkSound at={k.lands} volume={0.55} />
      <ClinkSound at={[k.morning + 2, k.morning + 6, k.morning + 11, k.morning + 15, k.morning + 19]} volume={0.45} />
      <Sequence from={k.flap} durationInFrames={20}><Audio src={staticFile("sfx/flip.wav")} volume={0.13} />{/* G3: 7 dB down, it read as a pop */}</Sequence>
      {ticks(k.clinic, k.asleep).map((f) => (
        <Sequence key={f} from={f} durationInFrames={12}><Audio src={staticFile("sfx/tick.wav")} volume={0.22} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const nightOne: Beat = { id: "nightOne", firstLine: 2, Component: Scene };

