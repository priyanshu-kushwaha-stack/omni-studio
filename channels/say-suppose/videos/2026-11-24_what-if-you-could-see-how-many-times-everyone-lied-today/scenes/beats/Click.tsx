// Beat "The Click" (script.md ## [00:08] The Click), look C: the painted kitchen at seven (plate kitchen-morning).
// THAT MORNING stamped on a short wide as the rewind lands; the leader on the radio; over your shoulder, your flatmate
// at the table says he did the dishes; click, close on him as a 1 blinks on; close on you; your look at the tower of
// dishes beside him; back to his 1; "What is it?"; close on you, bubble "Nothing."; he pats his hair, checks his
// spoon, shrugs; the narrator over close-ups; you look up over your own head: nothing. Ends on the kitchen frame with
// his 1 (the title card's front).
import { AbsoluteFill } from "remotion";
import { STAND } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import { toScreen, type Camera } from "@whatif/kit/stage/Stage";
import { camAt, current, linear, type Beat, type Shot } from "../shared";
import { Bubble, Clicks, PaperTag, talk } from "../parts/FrameKit";
import { aimAt, inPlate, NearYou } from "../parts/FrameLook";
import { Bowl, KitchenScene, KP, MATE_HEAD, MateAtTable, MateCount, mateLight, Radio, YOU_HEAD, YouStanding, type KitchenState } from "../parts/ClickKitchen";

function times(shot: Shot) {
  const leader = [shot.at("Leader: And I have never"), shot.end("Leader: And I have never")] as const;
  const morning = [shot.at("Flatmate: Morning"), shot.end("Flatmate: Morning")] as const;
  const click = morning[1] + 12;
  // the "What?" take runs long (the voice repeats it): the hold keys off its first word
  const what = [shot.at("Flatmate: What is"), Math.min(shot.end("Flatmate: What is"), shot.at("Flatmate: What is") + 30)] as const;
  const one = shot.at("That's one.");
  const tonight = shot.at("By tonight");
  const own = shot.at("But your own number");
  return { open: shot.from, leader, morning, click, react: click + 8, sink: click + 26, back: click + 50, what, nothing: what[1] + 3,
    pat: what[1] + 26, one, tonight, own, look: shot.at("But your own number", 0.12), frameEnd: shot.at("But your own number", 0.62), end: shot.to };
}
type T = ReturnType<typeof times>;

function state(frame: number, k: T): KitchenState {
  const eating = (frame - k.open) % 64;
  const stopEat = frame >= k.what[0] - 6 && frame < k.one;
  const spoon = stopEat ? 0 : Math.min(1, eating / 32);
  const chew = Math.floor(frame / 7) % 2 ? "o" : "flat";
  const mateTalk = talk(frame, k.morning[0], k.morning[1], talk(frame, k.what[0], k.what[1], chew));
  const pat = linear(frame, k.pat, k.pat + 8) * (1 - linear(frame, k.pat + 20, k.pat + 26));
  const check = linear(frame, k.pat + 26, k.pat + 32) * (1 - linear(frame, k.pat + 42, k.pat + 46));
  const shrug = linear(frame, k.pat + 46, k.pat + 52) * (1 - linear(frame, k.one + 10, k.one + 20));
  const mateLook = frame >= k.what[0] - 4 && frame < k.pat ? { x: 1, y: -0.1 } : pat > 0 ? { x: 0.3, y: -0.8 } : check > 0 ? { x: 1, y: 0 } : { x: 0.8, y: 0.5 };
  const youLook = frame >= k.sink && frame < k.back ? { x: 1, y: 0.25 } // to the dishes
    : frame >= k.look && frame < k.frameEnd ? { x: 0.1, y: -1 } : { x: 0.9, y: -0.1 };
  const youFace = frame < k.click ? { brows: "none" as const, lids: 0.3, mouth: "flat" as const }
    : frame < k.one ? { brows: "raised" as const, lids: 0, mouth: frame >= k.sink && frame < k.back ? "o" as const : "flat" as const, eyes: 1.15 }
      : frame >= k.tonight && frame < k.own ? { brows: "angry" as const, lids: 0.2, mouth: "smirk" as const }
        : { brows: frame >= k.look ? "worry" as const : "flat" as const, lids: 0.1, mouth: "flat" as const };
  return {
    mate: { brows: frame >= k.what[0] && frame < k.one ? "raised" : "none", lids: frame < k.morning[0] ? 0.4 : 0.15, mouth: mateTalk, look: mateLook,
      blink: (frame + 5) % 83 < 4 },
    spoon, pat, check, shrug,
    count: frame >= k.click ? { base: 1, on: k.click } : undefined,
    you: { ...youFace, look: youLook, blink: (frame + 31) % 97 < 4 },
    youPose: { ...STAND, armF: [40, 90], armB: frame >= k.look && frame < k.frameEnd ? [-150, 30] : [-7, 8] },
    radio: frame >= k.leader[0] - 4 && frame < k.leader[1] + 8 ? 1 : 0.25,
  };
}

type View = "open" | "mate0" | "over" | "mate" | "react" | "dishes" | "mate2" | "what" | "nothing" | "pat" | "one" | "you" | "up" | "frame";
const MR = 46 * KP.seat.scale;
const YR = 46 * KP.stand.scale;
const mateClose = (z: number, sx = 900, sy = 610) => aimAt(MATE_HEAD, { x: sx, y: sy }, z);
const youClose = (z: number, sx = 1060, sy = 600) => aimAt(YOU_HEAD, { x: sx, y: sy }, z);

function shots(k: T): [number, View][] {
  return [[k.open, "open"], [k.leader[0] + 20, "mate0"], [k.morning[0] - 4, "over"], [k.click - 4, "mate"], [k.react, "react"],
    [k.sink, "dishes"], [k.back, "mate2"], [k.what[0] - 2, "what"], [k.nothing, "nothing"], [k.pat, "pat"], [k.one, "one"],
    [k.tonight, "you"], [k.look - 6, "up"], [k.frameEnd, "frame"]];
}

/** The camera for a view, and the head radius it is on (for the depth of field). */
function cam(frame: number, k: T, view: View): { c: Camera; r: number } {
  const wide = { x: 960, y: 560, zoom: 1.05 };
  switch (view) {
    case "open": return { c: camAt(frame, [[k.open, wide], [k.leader[0] + 20, { ...wide, zoom: 1.12 }]]), r: 0 };
    case "mate0": return { c: camAt(frame, [[k.leader[0] + 20, aimAt(MATE_HEAD, { x: 760, y: 560 }, 1.5)], [k.morning[0], aimAt(MATE_HEAD, { x: 760, y: 560 }, 1.6)]]), r: MR };
    case "over": return { c: camAt(frame, [[k.morning[0] - 4, mateClose(1.8, 820)], [k.click - 4, mateClose(1.9, 820)]]), r: MR };
    case "mate": return { c: camAt(frame, [[k.click - 4, mateClose(2.1)], [k.react, mateClose(2.2)]]), r: MR };
    case "react": case "nothing": return { c: camAt(frame, [[view === "react" ? k.react : k.nothing, youClose(1.9)], [view === "react" ? k.sink : k.pat, youClose(2.0)]]), r: YR };
    case "dishes": return { c: camAt(frame, [[k.sink, { x: KP.dishes.x - 165, y: KP.dishes.y, zoom: 3.0 }], [k.back, { x: KP.dishes.x - 160, y: KP.dishes.y - 10, zoom: 3.1 }]]), r: 0 };
    case "mate2": case "what": return { c: camAt(frame, [[k.back, mateClose(2.2)], [k.nothing, mateClose(2.35)]]), r: MR };
    case "pat": return { c: camAt(frame, [[k.pat, aimAt(MATE_HEAD, { x: 900, y: 560 }, 1.6)], [k.one, aimAt(MATE_HEAD, { x: 900, y: 560 }, 1.7)]]), r: MR };
    case "one": return { c: camAt(frame, [[k.one, mateClose(2.3, 960, 640)], [k.tonight, mateClose(2.55, 960, 650)]]), r: MR };
    case "you": return { c: camAt(frame, [[k.tonight, youClose(2.0)], [k.look - 6, youClose(2.15)]]), r: YR };
    case "up": return { c: camAt(frame, [[k.look - 6, youClose(1.8, 1000, 700)], [k.frameEnd, youClose(1.95, 1000, 720)]]), r: YR };
    default: return { c: camAt(frame, [[k.frameEnd, { x: 980, y: 560, zoom: 1.08 }], [k.end, { x: 970, y: 555, zoom: 1.12 }]]), r: 0 };
  }
}

/** The kitchen at a frame (also the title card's front). */
export const ClickPicture: React.FC<{ frame: number; shot: Shot }> = ({ frame, shot }) => {
  const k = times(shot);
  const view = current<View>(frame, shots(k));
  const { c, r } = cam(frame, k, view);
  const s = state(frame, k);
  const cc = inPlate(drift(c, frame, "click", 2));
  return (
    <AbsoluteFill>
      <KitchenScene frame={frame} cam={cc} r={r} blur={view === "dishes" ? 1.5 : undefined} lights={s.count ? [mateLight()] : []}
        seated={<MateAtTable frame={frame} s={s} />}
        far={<Radio waves={s.radio ?? 0} frame={frame} />}
        onTable={<><Bowl />{s.count && <MateCount frame={frame} count={s.count} />}</>}
        standing={view === "over" ? undefined : <YouStanding frame={frame} s={s} />} />
      {view === "over" && <NearYou x={1720} y={720} r={250} side="right" />}
    </AbsoluteFill>
  );
};

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot);
  const view = current<View>(frame, shots(k));
  const { c } = cam(frame, k, view);
  const you = toScreen(c, YOU_HEAD.x - YR * 0.6, YOU_HEAD.y - YR);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ClickPicture frame={frame} shot={shot} />
      <PaperTag frame={frame} at={k.open + 2} until={k.leader[0] + 20} text="THAT MORNING" x={140} y={150} size={76} dark />
      <Bubble frame={frame} at={k.nothing} until={k.pat} x={you.x} y={you.y} text="Nothing." side="left" />
      <Clicks at={[k.click]} volume={0.5} />
    </AbsoluteFill>
  );
};

export const click: Beat = { id: "Click", first: "Leader: And I have never", lead: 1.2, Component: Scene };
