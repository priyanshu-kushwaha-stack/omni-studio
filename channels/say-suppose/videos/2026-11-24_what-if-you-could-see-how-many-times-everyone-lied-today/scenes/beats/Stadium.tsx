// Beat "The Stadium" (script.md ## [03:48]), look C on the stadium-night plate: the picture only this premise can show.
// The wordless rise (its 5 s hold opens the beat: lead 6.6 s) is the film's one long wide: from close on you in your
// seat, the floodlights going off in your eyes, the camera pulls up and out until the whole painted bowl is below,
// sixty thousand dim counters over its seats like frost, the directors' box a bonfire of double digits, the readout
// climbing to 41,300. Then close: over your shoulder two rows down to the crimson stranger counting the box on their
// fingers, the space over their head behind a railing; close on their hand; close on you ("Can this spread?"); the row
// stands for a corner and the coat is gone. The long lens on the pitch: the striker goes down, his counter flares
// crimson and clicks; close on you. Back to the bowl for the big study (the box's fire, then the frost of white lies),
// close on you watching the box, and the row turning to look at you.
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, type Pose } from "@whatif/kit/rig/pose";
import { CRIMSON, INK } from "@whatif/kit/theme";
import { drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { Readout } from "../parts/Counter";
import { Body, counterSpot, Handset, headOf } from "../parts/SayItAgain.Kit";
import { counterLight, OverShoulder } from "../parts/Rival.Shots";
import { Fans, Neighbours, Railing, ROW, seatY, Stranger, STRANGER_X, strikerPose, STRIKER, YOU_X } from "../parts/Stadium.Shots";
import { BOX, StadiumScene } from "../sets/Stadium.Bowl";
import { camAt, current, GLOW, HERO, mix, PASTELS, ramp, type Beat, type Shot } from "../shared";

const MOOD = "night" as const;

function cues(shot: Shot) {
  const { at, end } = shot;
  const two = at("Two rows down.");
  const spreadE = end("Can this spread?");
  const striker = at("Striker: He got me!");
  return {
    start: shot.from, upFrom: shot.from + 12, cross: Math.round(mix(shot.from, two, 0.3)), upTo: two - 14, two,
    spread: at("Can this spread?"), spreadE, lean: spreadE + 4, stand: Math.round(mix(spreadE, striker, 0.35)),
    sit: Math.round(mix(spreadE, striker, 0.8)), striker, click: at("Click."),
    sixty: at("Sixty thousand people"), diary: at("Sixty thousand people", 0.42), prolific: at("Sixty thousand people", 0.6),
    white: at("Sixty thousand people", 0.72), frost: at("Sixty thousand people", 0.86), stop: at("You stop watching the pitch"),
    box: at("You stop watching the pitch", 0.5), problem: at("Problem one."), end: shot.to,
  };
}
type K = ReturnType<typeof cues>;
type View = "rise" | "ots" | "hand" | "you" | "lean" | "pitch" | "react" | "bowl" | "boxwatch" | "turned";

const viewAt = (f: number, k: K) => current<View>(f, [[k.start, "rise"], [k.two - 2, "ots"], [k.two + 70, "hand"], [k.spread, "you"],
  [k.lean, "lean"], [k.sit, "pitch"], [k.click + 12, "react"], [k.sixty + 40, "bowl"], [k.stop - 2, "boxwatch"], [k.problem - 2, "turned"]]);

/** Your head in your seat, for a pose. */
const youHead = (pose: Pose) => headOf(YOU_X, seatY(ROW.you), ROW.you.s, pose, 1);

function camera(v: View, f: number, k: K, head: { x: number; y: number; r: number }): Camera {
  const cu = (z: number, from: number, to: number, dx = 0): Camera =>
    camAt(f, [[from, { x: head.x + dx, y: head.y + 0.3 * head.r, zoom: z }], [to, { x: head.x + dx, y: head.y + 0.25 * head.r, zoom: z + 0.2 }]]);
  const sh = { x: STRANGER_X, y: seatY(ROW.stranger) - 190 };
  switch (v) {
    case "rise": return camAt(f, [[k.start, { x: head.x + 40, y: head.y + 40, zoom: 2.3 }], [k.cross, { x: head.x + 60, y: head.y - 20, zoom: 2.1 }],
      [k.upTo, { x: 960, y: 560, zoom: 0.86 }]]);
    case "ots": return camAt(f, [[k.two - 2, { x: sh.x - 40, y: sh.y - 135, zoom: 2.0 }], [k.two + 70, { x: sh.x - 30, y: sh.y - 140, zoom: 2.15 }]]);
    case "hand": return camAt(f, [[k.two + 70, { x: sh.x + 50, y: sh.y - 150, zoom: 2.6 }], [k.spread, { x: sh.x + 50, y: sh.y - 155, zoom: 2.8 }]]);
    case "you": return cu(2.8, k.spread, k.lean, 40);
    case "lean": return camAt(f, [[k.lean, { x: 1080, y: 870, zoom: 1.6 }], [k.sit, { x: 1100, y: 865, zoom: 1.65 }]]);
    case "pitch": return camAt(f, [[k.sit, { x: STRIKER.x + 60, y: 720, zoom: 3.0 }], [k.striker, { x: STRIKER.x + 40, y: 730, zoom: 3.2 }], [k.click, { x: STRIKER.x + 20, y: 720, zoom: 3.5 }]]);
    case "react": return cu(2.9, k.click + 12, k.sixty + 40, 30);
    case "bowl": return camAt(f, [[k.sixty + 40, { x: 960, y: 560, zoom: 0.88 }], [k.diary - 10, { x: 980, y: 560, zoom: 0.95 }],
      [k.prolific, { x: BOX.x - 120, y: BOX.y + 20, zoom: 2.3 }], [k.white + 10, { x: BOX.x - 160, y: BOX.y + 30, zoom: 2.1 }],
      [k.frost, { x: 330, y: 470, zoom: 1.8 }], [k.stop - 2, { x: 360, y: 470, zoom: 1.9 }]]);
    case "boxwatch": return cu(2.6, k.stop - 2, k.problem - 2, 60);
    default: return camAt(f, [[k.problem - 2, { x: head.x + 60, y: head.y + 90, zoom: 1.85 }], [k.end, { x: head.x + 50, y: head.y + 80, zoom: 2.0 }]]);
  }
}

function youLook(v: View, f: number, k: K) {
  const lean = ramp(f, k.lean, k.lean + 14);
  const gone = f >= k.stand + 10;
  const turn = ramp(f, k.box - 8, k.box + 10);
  const tturn = ramp(f, k.problem + 10, k.problem + 30);
  if (v === "rise") return { pose: SEATED, face: { look: { x: 0.6, y: -0.6 }, brows: "raised" as const, mouth: "o" as const, eyes: 1.15 } };
  if (v === "you" || v === "ots" || v === "hand") return { pose: SEATED, face: { look: { x: 1, y: -0.2 }, brows: "flat" as const, lids: 0.25, mouth: "flat" as const } };
  if (v === "lean") return { pose: { ...SEATED, lean: 8 * lean, tilt: -10 * lean, armF: [40 + 20 * lean, 30] as [number, number] },
    face: { look: gone ? { x: 0.9, y: 0.4 } : { x: 1, y: 0.35 }, brows: gone ? "raised" as const : "flat" as const, mouth: gone ? "o" as const : "flat" as const } };
  if (v === "boxwatch") return { pose: { ...SEATED, tilt: mix(8, -10, turn) },
    face: { look: { x: mix(0.3, 1, turn), y: mix(0.8, -0.6, turn) }, brows: turn > 0.5 ? "angry" as const : "flat" as const, lids: mix(0.3, 0.15, turn), mouth: "flat" as const } };
  if (v === "turned") return { pose: SEATED, face: { look: { x: mix(0.6, -0.4, tturn), y: 0 }, brows: tturn > 0.5 ? "worry" as const : "flat" as const, mouth: "flat" as const, lids: 0.1 } };
  return { pose: SEATED, face: { look: { x: 0.8, y: 0.5 }, brows: "raised" as const, mouth: "o" as const, eyes: 1.2 } };
}

const Pitch: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  const down = ramp(frame, k.striker - 10, k.striker + 4);
  const pose = strikerPose(down, frame);
  const c = counterSpot(STRIKER.x, STRIKER.y, STRIKER.s, pose, 1, 40);
  return (
    <g>
      <ellipse cx={STRIKER.x + 220} cy={STRIKER.y + 4} rx={13} ry={13} fill="#f3f3f3" stroke={INK} strokeWidth={3} />
      <Body x={STRIKER.x + 330} y={STRIKER.y + 10} scale={STRIKER.s} facing={-1} pose={{ ...SEATED, legB: [-5, -2], legF: [6, -3], armF: [100, 10], armB: [-80, 10] }}
        head={PASTELS[5]} coat="#f3e9d7" frame={frame} id="defender" count={{ base: 0 }} size={34} brows="worry" mouth="o" look={{ x: 0.8, y: 0.4 }} seed={4} />
      <Body x={STRIKER.x} y={STRIKER.y} scale={STRIKER.s} facing={1} pose={pose} head={PASTELS[3]} coat={CRIMSON} frame={frame} id="striker" size={40}
        count={{ base: 1, ticks: [k.click], glow: frame >= k.striker ? CRIMSON : GLOW }} mouth={frame >= k.striker ? "open" : "flat"}
        brows={frame >= k.striker ? "sad" : "angry"} look={{ x: 0.3, y: -0.6 }} seed={7} />
      {frame >= k.click && frame < k.click + 16 && (
        <circle cx={c.x} cy={c.y} r={40 + (frame - k.click) * 6} fill="none" stroke={CRIMSON} strokeWidth={6} opacity={1 - (frame - k.click) / 16} />
      )}
    </g>
  );
};

const Component: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = cues(shot);
  const f = shot.frame;
  const v = viewAt(f, k);
  const me = youLook(v, f, k);
  const head = youHead(me.pose);
  const cam = drift(camera(v, f, k, head), f, `stadium-${v}`, v === "bowl" || v === "rise" ? 3 : 5);
  const off = ramp(f, k.upFrom, k.cross + 30);
  const value = Math.round(mix(212, 41300, ramp(f, k.cross, k.upTo))) + (f >= k.click ? 1 : 0);
  const boxTicks = Array.from({ length: 24 }, (_, i) => k.diary + i * 11);
  const stand = ramp(f, k.stand, k.stand + 10) * (1 - ramp(f, k.sit, k.sit + 10));
  const tap = Math.floor((f - k.two) / 14);
  const boxGlow = v === "boxwatch" ? ramp(f, k.box - 8, k.box + 10) : 0;
  const lights = v === "pitch" && f >= k.striker
    ? [counterLight(STRIKER.x, STRIKER.y - 330, 260, 0.45, CRIMSON)]
    : [counterLight(head.x + 700, head.y - 500, 900, 0.4 * boxGlow, "#ff8a3a")];
  const people = v === "pitch" ? <Pitch frame={f} k={k} /> : (
    <>
      {(v === "ots" || v === "hand" || v === "lean") && f < k.stand + 10 && <Stranger frame={f} tap={tap} />}
      {(v === "ots" || v === "hand" || v === "lean") && <Railing />}
      {v === "lean" && <Fans frame={f} stand={stand} />}
      {v !== "ots" && v !== "hand" && <Neighbours frame={f} turn={v === "turned" ? ramp(f, k.problem + 10, k.problem + 30) : 0} phone={<Handset scale={1.6} />} />}
      {v !== "ots" && v !== "hand" && (
        <Figure x={YOU_X} y={seatY(ROW.you)} scale={ROW.you.s} facing={1} pose={me.pose} head={HERO.head} scarf={HERO.scarf} tuft time={f}
          blink={(f + 11) % 97 < 4} {...me.face} />
      )}
    </>
  );
  return (
    <StadiumScene cam={cam} mood={MOOD} frame={f} off={off} boxTicks={boxTicks} lights={lights} actors={people}
      over={
        <>
          {v === "ots" && <OverShoulder who={{ ...HERO, coat: "#3b4252" }} x={430} y={880} r={270} lit={0.4} />}
          <Readout label="EVERYONE YOU CAN SEE" value={value} frame={f} on={k.upFrom + 20} />
        </>
      } />
  );
};

export const stadium: Beat = { id: "Stadium", first: "Two rows down.", lead: 6.6, Component };
