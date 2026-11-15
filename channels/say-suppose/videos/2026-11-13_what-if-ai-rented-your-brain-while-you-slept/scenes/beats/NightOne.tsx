// Beat "Night One" (script.md v6 ## [00:21] Night One; v6 lines 4-12). Script v6 rebuilt it on v6's own clips (shot.v6,
// story.json numbering); line 3 (the premise, over the shut clinic door) is the end of The Chair.
//
//   4  "Twice in seven days, you sell your plasma... not enough for what your family owes." the kitchen at dawn: you drop
//      the three notes in the jar on the table; the fridge behind you, a yellow note on it, OWE $14,200; CLOSE on it for
//      "what your family owes".
//   5  "And your brother graduates in a month." the graduation flyer pinned beside it.
//   6  "That's the band." CLOSE the band in your hand by the bed, a thin dark strip, one small teal light; "A thin strip
//      across your forehead": you lay it on, your eyes close; "While you sleep, it lends your brain to an AI": the light
//      glows, the dotted thread rises out of the frame carrying light up; "and pays you by the hour": a coin drops back
//      down out of the dark into the jar. Clink.
//   7  "That pale figure up there?" THE KEY SHOT, the thumbnail's frame (KEY_VIEW): the pale second you at its floating
//      desk, coins arcing down into the jar; your brother on the top bunk watching. "That's your sleeping brain, at work."
//      a slow push toward the ghost.
//   hold (3 s, performed) a coin lands; your brother flinches, leans over the edge, looks straight at the ghost; the
//      ghost types on and doesn't look back; you smile in your sleep.
//   8  "You feel nothing." close on your smile; "But a night you sell..." pull back.
//   morning: your brother hangs down, shakes the jar over your face; 9 "What'd you get?" palm out; TAG $90; 10 "Scam."
//   11 "Ninety dollars... three problems with it." the flap and your face; the room; close on your grin.
//   12 "The third one, nobody on your street sees coming." back on the pillow, awake, the jar beside you.
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { STAND } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { ClinkSound, DeviceSound, landings, PayFlap } from "../parts";
import { camAt, current, HERO, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { BunkRoom, KEY_VIEW } from "../sets/BunkRoom";
import { aim, Body, handWorld, lineAt, Notes, talk, type Placed } from "./Chair.Rig";
import { KitchenTable, TABLE } from "./Crumbs.Kitchen";
import { BandOn, HangingBrother, TopBrother, YouOnPillow } from "./NightOne.Bunk";
import { DEBT, FRIDGE } from "./V6.Kit";

type T = ReturnType<typeof times>;

/** Every frame of the beat, from v6's clips (shot.v6). */
function times(clips: Clip[]) {
  const at = (i: number, p: number) => lineAt(clips, i, p);
  const from = (i: number) => clips[i].from;
  const key = from(7) - 4; // "That pale figure up there?": the key shot
  const on = key + 2;
  const coinsFrom = on + 26;
  const hold = lineEnd(clips, 7); // performed: the brother and the ghost
  const gap = from(8) - hold;
  const inHold = (p: number) => Math.round(hold + gap * p);
  const lands = landings(coinsFrom, lineEnd(clips, 8) - 26);
  const pay = at(6, 0.84); // "and pays you by the hour": the coin drops out of the dark
  return {
    kitchen: from(4),
    drops: [at(4, 0.12), at(4, 0.22), at(4, 0.32)] as const, // the three notes into the jar
    noteClose: at(4, 0.52), // "...not enough for what your family owes": OWE $14,200
    flyer: from(5) - 8, // "And your brother graduates in a month."
    bandClose: from(6) - 4, // "That's the band."
    lower: [at(6, 0.2), at(6, 0.36)] as const, // "A thin strip across your forehead": the band goes on, you settle back
    glow: at(6, 0.44), // "While you sleep": the light glows
    thread: [at(6, 0.5), at(6, 0.72)] as const, // "it lends your brain to an AI": the thread rises out of frame
    pay,
    payLands: pay + 22,
    key,
    on,
    coinsFrom,
    coinsTo: lineEnd(clips, 8) - 26,
    ghost: at(7, 0.45), // "That's your sleeping brain, at work": the push toward the ghost
    hold,
    flinch: lands.find((f) => f >= hold + 3) ?? hold + 6, // a coin lands; he flinches
    lean: inHold(0.32), // he leans over the edge, looks at the ghost
    ghostClose: inHold(0.6), // the ghost doesn't look back
    smile: inHold(0.8), // you smile in your sleep
    upThere: at(8, 0.26), // "But a night you sell is a night your own brain doesn't get."
    morning: lineEnd(clips, 8) - 2,
    wake: lineEnd(clips, 8) + 6,
    what: [from(9), lineEnd(clips, 9)] as const, // "What'd you get?"
    flap: lineEnd(clips, 9) - 3, // TAG $90
    scam: [from(10), lineEnd(clips, 10)] as const, // "Scam."
    l8: from(11),
    wide8: at(11, 0.33), // "lying down"
    grin: at(11, 0.53), // "the best wage of your life"
    problem: at(11, 0.8), // "three problems with it"
    asleep: from(12) - 2, // "The third one, nobody on your street sees coming."
    end: lineEnd(clips, 12) + 30,
    lands,
  };
}

/** Line 4-5: the kitchen at dawn. You drop the three notes in the jar; the fridge behind you, OWE $14,200 and the
 *  graduation flyer. */
const NightKitchen: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const jar = { x: 940, y: TABLE.top - 4 - 150 };
  const dropped = k.drops.filter((f) => frame >= f + 6).length;
  const reach = Math.max(...k.drops.map((f) => ramp(frame, f - 10, f) * (1 - ramp(frame, f + 4, f + 12))));
  const base: Placed = { x: 1100, y: TABLE.floor, scale: 1.15, facing: -1, pose: STAND };
  const armF = aim(base, { x: jar.x + 10, y: jar.y - 10 });
  const pose = { ...STAND, lean: 6 * reach, armF: [mix(30, armF[0], reach), mix(40, armF[1], reach)] as [number, number], armB: [24, 70] as [number, number] };
  const you: Placed = { ...base, pose };
  const hand = handWorld(you, "armF");
  const shot = current(frame, [[k.kitchen, "wide"], [k.noteClose, "note"], [k.flyer, "flyer"]] as [number, string][]);
  const N = FRIDGE.note;
  const F = FRIDGE.flyer;
  const cams = {
    wide: camAt(frame, [[k.kitchen, { x: 1240, y: 600, zoom: 1.7 }], [k.noteClose, { x: 1300, y: 560, zoom: 1.9 }]]),
    note: camAt(frame, [[k.noteClose, { x: N.x + 60, y: N.y + 30, zoom: 2.8 }], [k.flyer, { x: N.x + 60, y: N.y + 20, zoom: 3.1 }]]),
    flyer: camAt(frame, [[k.flyer, { x: F.x, y: F.y + 20, zoom: 3.2 }], [k.bandClose, { x: F.x + 10, y: F.y + 10, zoom: 3.5 }]]),
  };
  const cam = drift(cams[shot as keyof typeof cams], frame, "n1-kitchen", 3);
  return (
    <KitchenTable frame={frame} cam={cam} mood="morning" jar={0.12 + dropped * 0.03} brother={null} debt={{ amount: DEBT.start }}
      extra={(
        <g>
          <Body f={you} head={HERO.head} scarf={HERO.scarf} tuft time={frame} brows="flat" lids={0.3} mouth="flat" look={{ x: 0.6, y: 0.5 }} />
          {dropped < 3 && <Notes x={hand.x - 4} y={hand.y - 8} n={3 - dropped} scale={0.6} tilt={-20} />}
        </g>
      )} />
  );
};

/** The bunk room, from v6 line 6 to the end of line 12. */
const Bunk: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.bandClose, "band"], [k.glow, "glow"], [k.key, "key"], [k.ghost, "push"], [k.hold, "flinch"],
    [k.lean, "lean"], [k.ghostClose, "ghost"], [k.smile, "smile"], [k.upThere, "up"], [k.morning, "shake"], [k.what[0] - 2, "what"],
    [k.scam[0] - 2, "scam"], [k.l8, "flap"], [k.wide8, "wide"], [k.grin, "grin"], [k.asleep, "awake9"]] as [number, string][]);
  const v = (x: number, y: number, zoom: number) => ({ x, y, zoom });
  const views: Record<string, { x: number; y: number; zoom: number }> = {
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
    grin: camAt(frame, [[k.grin, v(520, 660, 2.35)], [k.problem, v(510, 665, 2.45)], [k.asleep, v(500, 670, 2.75)]]),
    awake9: camAt(frame, [[k.asleep, v(430, 660, 1.7)], [k.end, v(520, 600, 1.45)]]),
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

/** The picture alone (no sound) at a frame, from v6's clips. */
export const NightOnePicture: React.FC<{ frame: number; clips: Clip[] }> = ({ frame, clips }) => {
  const k = times(clips);
  return frame < k.bandClose ? <NightKitchen frame={frame} k={k} /> : <Bunk frame={frame} k={k} />;
};

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, v6 } = shot;
  const k = times(v6);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <NightOnePicture frame={frame} clips={v6} />
      {/* sound outside the Stage: the notes, the band through the night, the coins, the jar, the flap */}
      {k.drops.map((f) => <Sequence key={f} from={f + 4} durationInFrames={20}><Audio src={staticFile("sfx/paper.wav")} volume={0.3} /></Sequence>)}
      <DeviceSound at={k.on} frames={k.morning - k.on - 4} volume={0.85} />
      <ClinkSound at={[k.payLands]} volume={0.5} />
      <ClinkSound at={k.lands} volume={0.55} />
      <ClinkSound at={[k.morning + 2, k.morning + 6, k.morning + 11, k.morning + 15, k.morning + 19]} volume={0.45} />
      <Sequence from={k.flap} durationInFrames={20}><Audio src={staticFile("sfx/flip.wav")} volume={0.3} /></Sequence>
    </AbsoluteFill>
  );
};

export const nightOne: Beat = { id: "nightOne", firstLine: 2, Component: Scene };

