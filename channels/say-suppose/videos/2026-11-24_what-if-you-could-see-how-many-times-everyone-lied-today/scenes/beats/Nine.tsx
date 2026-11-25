// Nine [09:04] (G2 first cut): the morning kitchen, the opening turned round: you at the table with your mug, your phone
// face down, not looking at anyone's head. Your phone, face up: the boss's "You OK?"; you type "Fine", hold over send,
// erase it letter by letter, type "Not really", send. Your flatmate in the doorway, dressing gown, spoon: "Morning. I did
// the dishes." Click, 1; behind him the sink, full; you laugh into your mug. He squints at the air over your head and
// tilts his head: "Nine?" The frame of 0:00 turned around: you large with the mug halfway to your mouth, eyes wide, the
// glow over YOU this time, a 9, and he is the one looking. Then the end card, the right third quiet.
import { AbsoluteFill } from "remotion";
import { SEATED, seatedY, STAND, type Pose } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import { toScreen } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { camAt, current, GLOW, HERO, mix, ramp, type Beat, type Shot } from "../shared";
import { Counter } from "../parts/Counter";
import { FLATMATE, headAt, MugProp, Person, Spoon, wordAt, type Face } from "../parts/RivalParts";
import { CHAIR, DOOR_X, K_FLOOR, KitchenShot, SINK, TABLE } from "../parts/NineKitchen";
import { EndCard, PhoneInsert } from "../parts/NineEnd";

const MOOD = "morning" as const;
const S = 1.1;

type View = "kitchen" | "phone" | "door" | "laugh" | "sink" | "laugh2" | "squint" | "nine" | "turned" | "end";

/** You at 0:00, turned around: the mug halfway to your mouth (the thumbnail's MUG pose). */
const MUG: Pose = { ...STAND, lean: 4, tilt: 4, armF: [40, 118], armB: [-10, 12] };

const NineBeat: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = shot.frame;
  const ME = shot.end("Morning. Interviews");
  const TL = shot.at("Typed lies");
  const TLE = shot.end("Typed lies");
  const FM = shot.at("Flatmate: Morning");
  const t1 = shot.end("Flatmate: Morning") + 8;
  const SF = shot.at("The sink is full");
  const quiet = wordAt(shot, "The sink is full", "You laugh");
  const SFE = shot.end("The sink is full");
  const NQ = shot.at("Flatmate: Nine?");
  const NQE = shot.end("Flatmate: Nine?");
  const SO = shot.at("So, would you want");
  const view = current<View>(f, [[shot.from, "kitchen"], [ME, "phone"], [TLE, "door"], [t1 + 24, "laugh"], [SF, "sink"], [quiet, "laugh2"],
    [SFE, "squint"], [NQ, "nine"], [NQE + 2, "turned"], [SO, "end"]]);

  if (view === "phone") return <PhoneInsert frame={f} from={ME} to={shot.at("Typed lies", 0.75)} />;
  if (view === "end") {
    return <EndCard frame={f} from={SO} comment={wordAt(shot, "So, would you want", "Tell us")} like={wordAt(shot, "So, would you want", "hit like")}
      subscribe={wordAt(shot, "So, would you want", "subscribe.")} />;
  }

  // you at the table: sips, then laughing into the mug; at the end, the mug stops halfway
  const sip = Math.max(0, Math.sin((f - shot.from) / 28));
  const laughing = f >= t1 + 10 && f < SFE + 10;
  const bob = laughing ? Math.abs(Math.sin(f / 3.5)) * 5 : 0;
  const youPose: Pose = { ...SEATED, lean: laughing ? 8 : 2, tilt: laughing ? 8 + bob : 0, drop: bob,
    armF: laughing ? [105, 75] : [mix(55, 100, sip * (f < ME ? 1 : 0)), mix(80, 80, sip)] };
  const youFace: Partial<Face> = laughing ? { brows: "raised", lids: 0.8, mouth: "smile", eyes: 1, look: { x: 0.5, y: 0.2 } }
    : f >= SFE ? { brows: "none", lids: 0.3, mouth: "smile", eyes: 1, look: { x: 0.6, y: 0.4 } }
      : { brows: "none", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 0.4, y: 0.5 } };
  const youY = seatedY(CHAIR.seat, S);

  // him: in the doorway with his spoon; the 1 clicks on; then the squint and the tilt
  const squint = ramp(f, SFE + 6, SFE + 40);
  const himPose: Pose = { ...STAND, tilt: mix(0, 16, ramp(f, SFE + 30, SFE + 70)), armF: [mix(70, 110, squint), mix(60, 30, squint)], armB: [10, 20] };
  const himTalks = (f >= FM && f < shot.end("Flatmate: Morning")) || (f >= NQ && f < NQE);
  const himFace: Partial<Face> = squint > 0.2 ? { brows: "flat", lids: 0.55, mouth: himTalks ? "o" : "flat", eyes: 1, look: { x: 1, y: -0.7 } }
    : { brows: "none", lids: 0.35, mouth: himTalks ? "open" : "smile", eyes: 1, look: { x: 1, y: 0.1 } };

  if (view === "turned") return <Turned shot={shot} from={NQE + 2} himPose={himPose} himFace={himFace} />;

  const cam = drift((() => {
    switch (view) {
      case "kitchen": return camAt(f, [[shot.from, { x: 640, y: 620, zoom: 1.4 }], [ME, { x: 560, y: 640, zoom: 1.65 }]]);
      case "door": return camAt(f, [[TLE, { x: 1250, y: 580, zoom: 1.25 }], [t1 + 24, { x: 1300, y: 590, zoom: 1.4 }]]);
      case "laugh": case "laugh2": return camAt(f, [[view === "laugh" ? t1 + 24 : quiet, { x: 420, y: 640, zoom: 1.9 }], [view === "laugh" ? SF : SFE, { x: 410, y: 640, zoom: 2.0 }]]);
      case "sink": return { x: SINK.x + 60, y: 640, zoom: 2.3 };
      case "squint": return camAt(f, [[SFE, { x: 1480, y: 600, zoom: 1.8 }], [NQ, { x: 1490, y: 590, zoom: 2.0 }]]);
      default: return camAt(f, [[NQ, { x: 1520, y: 580, zoom: 2.2 }], [NQE, { x: 1520, y: 580, zoom: 2.3 }]]);
    }
  })(), f, "nine", 3);

  const counterAt = toScreen(cam, DOOR_X, 520);
  return (
    <KitchenShot cam={cam} mood={MOOD} frame={f} plates={13}
      glows={[{ x: counterAt.x, y: counterAt.y, r: 200 * cam.zoom, color: GLOW, strength: f >= t1 ? 0.2 : 0 }]}
      seated={
        <Person id="nine-you" who={HERO} x={CHAIR.x} y={youY} scale={S} facing={1} pose={youPose} face={youFace} frame={f} seed={1} count={null}
          held={<MugProp tilt={laughing ? -50 : -10} steam={1} frame={f} />} />
      }
      onTable={
        <>
          <rect x={TABLE.x + 30} y={TABLE.top - 12} width={70} height={10} rx={3} fill="#1b1d24" />
          <rect x={TABLE.x - 120} y={TABLE.top - 10} width={110} height={8} rx={2} fill="#efe8d8" stroke={INK} strokeWidth={2} />
        </>
      }
      actors={
        f >= TLE ? (
          <Person id="nine-him" who={FLATMATE} x={DOOR_X} y={K_FLOOR} scale={S} facing={-1} pose={himPose} face={himFace} frame={f} seed={6}
            count={{ base: 0, ticks: [t1] }} held={<Spoon />} />
        ) : undefined
      } />
  );
};

/** The frame of 0:00 turned around: you large at the left, the mug halfway to your mouth, eyes wide, the glow over you
 *  this time, a 9; your flatmate where the boss stood, in the doorway, looking at your head. */
const Turned: React.FC<{ shot: Shot; from: number; himPose: Pose; himFace: Partial<Face> }> = ({ shot, from, himPose, himFace }) => {
  const f = shot.frame;
  const z = mix(1.15, 1.22, ramp(f, from, shot.to));
  const cam = drift({ x: 1100, y: 560, zoom: z }, f, "turned", 2);
  const youX = 1100 + (420 - 960) / z;
  const headY = 560 + (600 - 540) / z;
  const scale = 3.2;
  const youY = headY + 264 * scale;
  const head = headAt(youX, youY, scale, MUG, 1);
  const cy = head.y - head.r - 120;
  const glowAt = toScreen(cam, head.x, cy);
  const flash = ramp(f, from, from + 6);
  return (
    <AbsoluteFill>
      <KitchenShot cam={cam} mood={MOOD} frame={f} plates={13}
        glows={[{ x: glowAt.x, y: glowAt.y + 60, r: 520, color: GLOW, strength: 0.55 * flash }]}
        actors={
          <>
            <Person id="turned-him" who={FLATMATE} x={DOOR_X} y={K_FLOOR} scale={S} facing={-1} pose={himPose} face={himFace} frame={f} seed={6}
              count={{ base: 1 }} held={<Spoon />} />
            <defs>
              <radialGradient id="turned-glow" cx="0.5" cy="0.2" r="0.6">
                <stop offset="0" stopColor={GLOW} stopOpacity={0.6} />
                <stop offset="1" stopColor={GLOW} stopOpacity={0} />
              </radialGradient>
            </defs>
            <Person id="turned-you" who={HERO} x={youX} y={youY} scale={scale} facing={1} pose={MUG} frame={f} seed={1} count={null}
              face={{ brows: "raised", lids: 0, mouth: "o", eyes: 1.3, look: { x: 0.85, y: -0.35 } }} held={<MugProp tilt={-10} />} />
            <ellipse cx={head.x} cy={head.y - head.r * 0.3} rx={head.r * 1.6} ry={head.r * 1.9} fill="url(#turned-glow)" opacity={flash} style={{ mixBlendMode: "screen" }} />
            <Counter x={head.x} y={cy} base={9} frame={f} size={120} on={from} id="turned-9" />
          </>
        } />
    </AbsoluteFill>
  );
};

/** Nine: the phone, the dishes, "Nine?", the frame turned around, and the end card. */
export const nine: Beat = { id: "Nine", first: "Morning. Interviews", lead: 0.3, Component: NineBeat };
