// Beat "The Click" (script.md ## [00:08] The Click). Seven o'clock in the kitchen (parts/ClickKitchen.tsx): THAT MORNING
// stamped as the rewind lands; the leader on the radio; your flatmate at the table says he did the dishes; click, a 1
// blinks on over him; you look at the tower of plates, back at the 1; "What?"; bubble "Nothing."; he pats his hair,
// checks his spoon, shrugs; the narrator; you look up over your own head: nothing. Ends on the kitchen frame with his 1
// (the title card's front).
import { AbsoluteFill } from "remotion";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { camAt, current, linear, type Beat, type Shot } from "../shared";
import { Bubble, Clicks, onScreen, PaperTag, talk } from "../parts/FrameKit";
import { K, KitchenScene, MATE_HEAD, YOU_HEAD, type KitchenState } from "../parts/ClickKitchen";
import { STAND } from "@whatif/kit/rig/pose";

function times(shot: Shot) {
  const leader = [shot.at("Leader: And I have never"), shot.end("Leader: And I have never")] as const;
  const morning = [shot.at("Flatmate: Morning"), shot.end("Flatmate: Morning")] as const;
  const click = morning[1] + 12;
  // the "What?" take runs long (the voice repeats it): the hold keys off its first word
  const what = [shot.at("Flatmate: What is"), Math.min(shot.end("Flatmate: What is"), shot.at("Flatmate: What is") + 30)] as const;
  const one = shot.at("That's one.");
  const tonight = shot.at("By tonight");
  const own = shot.at("But your own number");
  return { open: shot.from, leader, morning, click, sink: click + 20, back: click + 46, what, nothing: what[1] + 3, pat: what[1] + 26,
    one, tonight, own, look: shot.at("But your own number", 0.12), frameEnd: shot.at("But your own number", 0.62), end: shot.to };
}

function state(frame: number, k: ReturnType<typeof times>): KitchenState {
  const eating = (frame - k.open) % 64;
  const stopEat = frame >= k.what[0] - 6 && frame < k.one;
  const spoon = stopEat ? 0 : Math.min(1, eating / 32);
  const chew = Math.floor(frame / 7) % 2 ? "o" : "flat";
  const mateTalk = talk(frame, k.morning[0], k.morning[1], talk(frame, k.what[0], k.what[1], chew));
  const pat = linear(frame, k.pat, k.pat + 8) * (1 - linear(frame, k.pat + 20, k.pat + 26));
  const check = linear(frame, k.pat + 26, k.pat + 32) * (1 - linear(frame, k.pat + 42, k.pat + 46));
  const shrug = linear(frame, k.pat + 46, k.pat + 52) * (1 - linear(frame, k.one + 10, k.one + 20));
  const mateLook = frame >= k.what[0] - 4 && frame < k.pat ? { x: 1, y: -0.1 } : pat > 0 ? { x: 0.3, y: -0.8 } : check > 0 ? { x: 1, y: 0 } : { x: 0.8, y: 0.5 };
  const youLook = frame >= k.sink && frame < k.back ? { x: 1, y: 0.15 } // to the sink (you face left)
    : frame >= k.look && frame < k.frameEnd ? { x: 0.1, y: -1 } : { x: 0.9, y: -0.15 };
  const youFace = frame < k.click ? { brows: "none" as const, lids: 0.3, mouth: "flat" as const }
    : frame < k.one ? { brows: "raised" as const, lids: 0, mouth: frame >= k.sink && frame < k.back ? "o" as const : "flat" as const, eyes: 1.1 }
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

function cam(frame: number, k: ReturnType<typeof times>): Camera {
  const shot = current(frame, [[k.open, "open"], [k.morning[0] - 4, "two"], [k.click - 4, "mate"], [k.sink, "sink"], [k.back, "mate2"],
    [k.what[1], "two2"], [k.one, "one"], [k.tonight, "you"], [k.frameEnd, "frame"]] as [number, string][]);
  const c: Camera = (() => {
    switch (shot) {
      case "open": return camAt(frame, [[k.open, { x: 960, y: 560, zoom: 1.05 }], [k.morning[0], { x: 1040, y: 580, zoom: 1.18 }]]);
      case "two": return camAt(frame, [[k.morning[0], { x: 1000, y: 600, zoom: 1.2 }], [k.click, { x: 900, y: 600, zoom: 1.3 }]]);
      case "mate": return camAt(frame, [[k.click - 4, closeUp(MATE_HEAD.x + 120, MATE_HEAD.y - 40, 2.1)], [k.sink, closeUp(MATE_HEAD.x + 120, MATE_HEAD.y - 50, 2.25)]]);
      case "sink": return camAt(frame, [[k.sink, { x: K.sink.from + 110, y: 620, zoom: 2.3 }], [k.back, { x: K.sink.from + 110, y: 600, zoom: 2.5 }]]);
      case "mate2": return camAt(frame, [[k.back, closeUp(MATE_HEAD.x + 120, MATE_HEAD.y - 50, 2.25)], [k.what[1], closeUp(MATE_HEAD.x + 140, MATE_HEAD.y - 50, 2.35)]]);
      case "two2": return camAt(frame, [[k.what[1], { x: 1080, y: 600, zoom: 1.25 }], [k.one, { x: 1060, y: 590, zoom: 1.3 }]]);
      case "one": return camAt(frame, [[k.one, closeUp(MATE_HEAD.x + 60, MATE_HEAD.y - 70, 2.4)], [k.tonight, closeUp(MATE_HEAD.x + 60, MATE_HEAD.y - 80, 2.6)]]);
      case "you": return camAt(frame, [[k.tonight, closeUp(YOU_HEAD.x - 60, YOU_HEAD.y - 30, 2.2)], [k.frameEnd, closeUp(YOU_HEAD.x - 60, YOU_HEAD.y - 70, 2.5)]]);
      default: return camAt(frame, [[k.frameEnd, { x: 1000, y: 580, zoom: 1.12 }], [k.end, { x: 980, y: 575, zoom: 1.16 }]]);
    }
  })();
  return drift(c, frame, "click", 2);
}

/** The kitchen at a frame (also the title card's front). */
export const ClickPicture: React.FC<{ frame: number; shot: Shot }> = ({ frame, shot }) => {
  const k = times(shot);
  return <KitchenScene frame={frame} cam={cam(frame, k)} s={state(frame, k)} />;
};

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot);
  const c = cam(frame, k);
  const you = onScreen(c, { x: YOU_HEAD.x, y: YOU_HEAD.y - YOU_HEAD.r });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ClickPicture frame={frame} shot={shot} />
      <PaperTag frame={frame} at={k.open + 2} until={k.morning[0]} text="THAT MORNING" x={140} y={150} size={76} dark />
      <Bubble frame={frame} at={k.nothing} until={k.pat + 20} x={you.x - 30} y={you.y - 20} text="Nothing." side="left" />
      <Clicks at={[k.click]} volume={0.5} />
    </AbsoluteFill>
  );
};

export const click: Beat = { id: "Click", first: "Leader: And I have never", lead: 1.2, Component: Scene };
