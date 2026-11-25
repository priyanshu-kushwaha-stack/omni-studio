// Beat "The Rule" (script.md ## [00:30] The Rule).
//   - the title card (ident C, brand/IdentC.tsx): the kitchen frame with the flatmate's 1 shrinks into a print under
//     the question, flips, and its back is the flat;
//   - the flat: beside your flatmate's 1 a paper diagram draws itself (a head, a counter, a clock); "clicks" ticks the
//     digit, "Resets" sweeps the clock hand and drops it to 0; page two: what counts (said, spoken) and what doesn't
//     (jokes, being wrong, typed, written);
//   - the hallway: three inserts of your mouth as you pass your flatmate, tags FINE, NEARLY THERE, LOVE IT;
//   - the mirror, the kettle (your nose enormous): nothing over your head; "in your eyes": a glint;
//   - the front door: your hand on the latch, the lanyard swinging, the door opens on the light.
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { evolvePath } from "@remotion/paths";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { INK, PAPER } from "@whatif/kit/theme";
import { C_FRAMES, Hi, IdentC } from "../../../../brand/IdentC";
import { camAt, current, findLine, GLOW, HERO, linear, makeShot, ramp, type Beat, type Shot } from "../shared";
import { Counter } from "../parts/Counter";
import { aim, Clicks, counterOver, FLATMATE, headWorld, Lanyard, PaperTag, popAt, type Placed } from "../parts/FrameKit";
import { KitchenScene, MATE_HEAD, type KitchenState } from "../parts/ClickKitchen";
import { HALL, HallScene, KettleScene, MirrorScene } from "../sets/RuleFlat";
import { ClickPicture } from "./Click";

function times(shot: Shot) {
  const open = shot.from + C_FRAMES;
  const L = (p: string, s = 0) => shot.at(p, s);
  return {
    ident: shot.from, open,
    over: Math.max(open + 4, L("Over every head")),
    clicks: L("It clicks the instant", 0.1), resets: L("It clicks the instant", 0.62),
    page2: L("Jokes don't count"), said: L("Jokes don't count", 0.02), joke: L("Jokes don't count", 0.1), wrong: L("Jokes don't count", 0.45),
    spoken: L("It counts what's spoken", 0.08), typed: L("It counts what's spoken", 0.36), written: L("It counts what's spoken", 0.58),
    remember: L("It counts what's spoken", 0.8),
    hall: L("You say three things"), fine: L("You say three things", 0.4), nearly: L("You say three things", 0.49), love: L("You say three things", 0.6),
    never: L("You say three things", 0.7),
    own: L("Your own? The mirror"), mirror: L("Your own? The mirror", 0.1), kettle: L("Your own? The mirror", 0.42),
    nose: L("Your own? The mirror", 0.8),
    eyes: L("It isn't on your head"), glint: L("It isn't on your head", 0.7),
    know: L("You don't need to see"), door: L("You step outside"), swing: L("You step outside", 0.45),
    end: shot.to,
  };
}
type T = ReturnType<typeof times>;

/** A closed circle as a path that draws from its left edge. */
const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;

const draw = (frame: number, from: number, to: number, d: string) => {
  const t = linear(frame, from, to);
  return t <= 0 ? null : evolvePath(t, d);
};

const Path: React.FC<{ frame: number; from: number; to: number; d: string; color?: string; width?: number; fill?: string }> = ({ frame, from, to, d, color = INK, width = 8, fill }) => {
  const e = draw(frame, from, to, d);
  if (!e) return null;
  return (
    <g>
      {fill && frame >= to && <path d={d} fill={fill} />}
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />
    </g>
  );
};

/** A tick or a cross, drawn on. */
const Mark: React.FC<{ frame: number; at: number; x: number; y: number; ok: boolean }> = ({ frame, at, x, y, ok }) =>
  ok ? <Path frame={frame} from={at + 4} to={at + 12} d={`M${x - 26} ${y} L${x - 6} ${y + 22} L${x + 30} ${y - 26}`} color="#1d9a8f" width={12} />
    : <g><Path frame={frame} from={at + 4} to={at + 9} d={`M${x - 24} ${y - 24} L${x + 24} ${y + 24}`} color="#d8344f" width={12} />
      <Path frame={frame} from={at + 8} to={at + 13} d={`M${x + 24} ${y - 24} L${x - 24} ${y + 24}`} color="#d8344f" width={12} /></g>;

/** The paper diagram, screen space, right of the flatmate. */
const Diagram: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const unfold = popAt(frame, k.over, 180);
  if (unfold <= 0 || frame >= k.hall) return null;
  const page2 = frame >= k.page2;
  const x0 = 920;
  const y0 = 135;
  const digit = frame >= k.resets + 14 ? 0 : frame >= k.clicks ? 1 : 0;
  const hand = 360 * ramp(frame, k.resets, k.resets + 14);
  const cell = (i: number) => ({ x: x0 + 140 + (i % 3) * 290, y: y0 + 190 + Math.floor(i / 3) * 290 });
  const items: [string, number, boolean][] = [["SAID", k.said, true], ["JOKES", k.joke, false], ["WRONG", k.wrong, false],
    ["SPOKEN", k.spoken, true], ["TYPED", k.typed, false], ["WRITTEN", k.written, false]];
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${x0 + 460} ${y0 + 330}) rotate(${-2 + (page2 ? 3 : 0)}) scale(${unfold} 1) translate(${-(x0 + 460)} ${-(y0 + 330)})`}>
        <rect x={x0 + 10} y={y0 + 14} width={860} height={650} rx={14} fill="#000" opacity={0.25} />
        <rect x={x0} y={y0} width={860} height={650} rx={14} fill={PAPER} stroke={INK} strokeWidth={6} />
        {!page2 && (
          <g>
            {/* a head */}
            <Path frame={frame} from={k.over + 6} to={k.over + 22} d={circle(x0 + 300, y0 + 430, 85)} width={9} />
            <Path frame={frame} from={k.over + 18} to={k.over + 30} d={`M${x0 + 190} ${y0 + 615} Q${x0 + 300} ${y0 + 525} ${x0 + 410} ${y0 + 615}`} width={9} />
            {/* a counter over it */}
            {frame >= k.over + 26 && (
              <g transform={`translate(${x0 + 300} ${y0 + 250})`} opacity={linear(frame, k.over + 26, k.over + 34)}>
                <rect x={-80} y={-64} width={160} height={128} rx={28} fill={INK} stroke={GLOW} strokeWidth={8} />
                <text x={0} y={36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={100} fill={PAPER}
                  transform={`scale(${frame >= k.clicks && frame < k.clicks + 8 ? 1.2 : 1})`}>{digit}</text>
                <path d="M-14 64 L0 88 L14 64Z" fill={INK} stroke={GLOW} strokeWidth={6} />
              </g>
            )}
            {/* a clock */}
            <Path frame={frame} from={k.over + 34} to={k.over + 50} d={circle(x0 + 690, y0 + 330, 120)} width={9} />
            {frame >= k.over + 50 && (
              <g>
                <line x1={x0 + 690} y1={y0 + 330} x2={x0 + 690} y2={y0 + 245} stroke={INK} strokeWidth={10} strokeLinecap="round" transform={`rotate(${hand} ${x0 + 690} ${y0 + 330})`} />
                <line x1={x0 + 690} y1={y0 + 330} x2={x0 + 740} y2={y0 + 330} stroke={INK} strokeWidth={10} strokeLinecap="round" transform={`rotate(${hand / 12} ${x0 + 690} ${y0 + 330})`} />
                <text x={x0 + 690} y={y0 + 520} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={INK}>MIDNIGHT</text>
              </g>
            )}
          </g>
        )}
        {page2 && items.map(([label, at, ok], i) => {
          const c = cell(i);
          if (frame < at) return null;
          const s = popAt(frame, at, 240);
          return (
            <g key={label} transform={`translate(${c.x} ${c.y}) scale(${s}) translate(${-c.x} ${-c.y})`}>
              <text x={c.x} y={c.y + 80} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={46} fill={INK}>{label}</text>
              <Icon i={i} x={c.x} y={c.y - 30} />
              <Mark frame={frame} at={at} x={c.x + 90} y={c.y - 70} ok={ok} />
              {label === "SPOKEN" && frame >= k.remember && (
                <ellipse cx={c.x} cy={c.y + 10} rx={130 * ramp(frame, k.remember, k.remember + 8)} ry={120 * ramp(frame, k.remember, k.remember + 8)} fill="none" stroke="#d8344f" strokeWidth={8} />
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

/** Small ink icons: a speech bubble, a laughing face, a question mark, a mouth, a keyboard, a pen on paper. */
const Icon: React.FC<{ i: number; x: number; y: number }> = ({ i, x, y }) => {
  const st = { fill: "none", stroke: INK, strokeWidth: 8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (i) {
    case 0: return <path d={`M${x - 70} ${y - 50} h140 a20 20 0 0 1 20 20 v60 a20 20 0 0 1 -20 20 h-90 l-30 30 v-30 h-20 a20 20 0 0 1 -20 -20 v-60 a20 20 0 0 1 20 -20Z`} {...st} />;
    case 1: return <g><circle cx={x} cy={y} r={60} {...st} /><path d={`M${x - 34} ${y + 10} Q${x} ${y + 60} ${x + 34} ${y + 10}Z`} fill={INK} /><path d={`M${x - 30} ${y - 22} q10 -12 20 0 M${x + 10} ${y - 22} q10 -12 20 0`} {...st} /></g>;
    case 2: return <path d={`M${x - 34} ${y - 30} q0 -40 36 -40 q36 0 36 36 q0 30 -36 40 v24 M${x + 2} ${y + 60} v4`} {...st} />;
    case 3: return <path d={`M${x - 70} ${y} Q${x} ${y - 50} ${x + 70} ${y} Q${x} ${y + 60} ${x - 70} ${y}Z M${x - 70} ${y} H${x + 70}`} {...st} />;
    case 4: return <g><rect x={x - 80} y={y - 40} width={160} height={90} rx={10} {...st} />{[0, 1, 2].map((r) => <path key={r} d={`M${x - 60} ${y - 18 + r * 26} h120`} {...st} strokeWidth={6} strokeDasharray="14 12" />)}</g>;
    default: return <g><rect x={x - 60} y={y - 60} width={110} height={130} rx={6} {...st} /><path d={`M${x - 40} ${y - 30} h70 M${x - 40} ${y} h60 M${x - 40} ${y + 30} h40 M${x + 80} ${y - 70} L${x + 20} ${y + 40}`} {...st} /></g>;
  }
}

/** The flat: the kitchen with your flatmate at the table, his 1, framed to leave room for the paper. */
function flatState(frame: number): KitchenState {
  return {
    mate: { brows: "none", lids: 0.25, mouth: Math.floor(frame / 7) % 2 ? "o" : "flat", look: { x: 0.8, y: 0.5 }, blink: (frame + 5) % 83 < 4 },
    spoon: Math.min(1, ((frame % 64) / 32)), count: { base: 1 }, you: { mouth: "flat" }, youHere: false,
  };
}
const FLAT_CAM: Camera = { x: MATE_HEAD.x + 360, y: MATE_HEAD.y + 20, zoom: 1.6 };

/** The hallway: you walk right toward the door, your flatmate comes the other way with his 1. */
function hallPeople(frame: number, k: T) {
  const walk = linear(frame, k.hall, k.own);
  const youX = 260 + walk * 640;
  const mateX = 1300 - linear(frame, k.hall, k.never) * 900;
  const you: Placed = { x: youX, y: HALL.floor, scale: 1.2, facing: 1, pose: frame < k.own ? walkPose(frame * 0.2) : STAND };
  const mate: Placed = { x: mateX, y: HALL.floor + 10, scale: 1.18, facing: -1, pose: walkPose(frame * 0.18 + 1) };
  return { you, mate };
}

const Hallway: React.FC<{ frame: number; k: T; cam: Camera; lookUp?: boolean }> = ({ frame, k, cam, lookUp }) => {
  const { you, mate } = hallPeople(frame, k);
  const insert = [k.fine, k.nearly, k.love].some((t) => frame >= t && frame < t + 14);
  const c = counterOver(mate, 40);
  return (
    <HallScene cam={cam} actors={
      <>
        <Figure x={mate.x} y={mate.y} scale={mate.scale} facing={-1} pose={mate.pose} head={FLATMATE.head} coat={FLATMATE.coat} time={frame}
          mouth="smile" look={{ x: 0.8, y: 0 }} />
        <Counter x={c.x} y={c.y} base={1} frame={frame} size={40} id="hall-mate" />
        <Figure x={you.x} y={you.y} scale={you.scale} pose={you.pose} head={HERO.head} scarf={HERO.scarf} tuft time={frame} flow={0.2}
          brows={lookUp ? "raised" : "none"} mouth={insert ? (frame % 10 < 5 ? "open" : "smile") : "smile"} look={lookUp ? { x: 0.1, y: -1 } : { x: 0.8, y: 0 }} />
        <Lanyard f={you} swing={Math.sin(frame * 0.3) * 0.6} />
      </>
    } />
  );
};

const FrontDoor: React.FC<{ frame: number; k: T; cam: Camera }> = ({ frame, k, cam }) => {
  const open = ramp(frame, k.swing, k.swing + 18);
  const walk = linear(frame, k.know, k.door);
  const base: Placed = { x: 900 + walk * 400, y: HALL.floor, scale: 1.2, facing: 1, pose: frame < k.door ? walkPose(frame * 0.2) : STAND };
  const latch = { x: HALL.latch.x + HALL.door.w * open, y: HALL.latch.y };
  const you: Placed = frame >= k.door ? { ...base, pose: { ...STAND, armF: aim(base, latch), lean: 4 } } : base;
  const swing = Math.sin(frame * 0.35) * Math.max(0.2, 1 - linear(frame, k.door, k.door + 60));
  return (
    <HallScene cam={cam} open={open} actors={
      <>
        <Figure x={you.x} y={you.y} scale={you.scale} pose={you.pose} head={HERO.head} scarf={HERO.scarf} tuft time={frame} flow={0.2}
          brows={open > 0 ? "raised" : "none"} mouth={open > 0 ? "o" : "smirk"} eyes={open > 0 ? 1.2 : 1} look={{ x: 0.9, y: -0.1 }} />
        <Lanyard f={you} swing={swing} />
      </>
    } />
  );
};

function hallCam(frame: number, k: T): Camera {
  const { you } = hallPeople(frame, k);
  const h = headWorld(you);
  const ins = [k.fine, k.nearly, k.love].find((t) => frame >= t && frame < t + 14);
  if (ins !== undefined) return { x: h.x + 260, y: h.y + 30, zoom: 3.2 };
  if (frame >= k.own) return camAt(frame, [[k.own, closeUp(h.x + 120, h.y - 60, 2.2)], [k.mirror, closeUp(h.x + 120, h.y - 80, 2.4)]]);
  return camAt(frame, [[k.hall, { x: 760, y: 600, zoom: 1.25 }], [k.own, { x: 960, y: 590, zoom: 1.35 }]]);
}

const Picture: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current(frame, [[k.ident, "flat"], [k.hall, "hall"], [k.mirror, "mirror"], [k.kettle, "kettle"],
    [k.eyes, "eyes"], [k.know, "know"], [k.door, "door"]] as [number, string][]);
  switch (shot) {
    case "flat": return <KitchenScene frame={frame} cam={drift(camAt(frame, [[k.open, FLAT_CAM], [k.hall, { ...FLAT_CAM, x: FLAT_CAM.x + 20, zoom: 1.68 }]]), frame, "flat", 2)} s={flatState(frame)} />;
    case "hall": return <Hallway frame={frame} k={k} cam={drift(hallCam(frame, k), frame, "hall", 2)} lookUp={frame >= k.own} />;
    case "mirror": return <MirrorScene frame={frame} look={{ x: 0.1, y: -1 }} cam={drift(camAt(frame, [[k.mirror, { x: 960, y: 480, zoom: 1.2 }], [k.kettle, { x: 960, y: 440, zoom: 1.35 }]]), frame, "m", 2)} />;
    case "kettle": return <KettleScene frame={frame} nose={1 + ramp(frame, k.nose, k.nose + 10) * 1.4} cam={drift(camAt(frame, [[k.kettle, { x: 960, y: 560, zoom: 1.0 }], [k.eyes, { x: 960, y: 600, zoom: 1.15 }]]), frame, "k", 2)} />;
    case "eyes": return <MirrorScene frame={frame} look={{ x: 0, y: 0 }} glint={ramp(frame, k.glint, k.glint + 8)} cam={camAt(frame, [[k.eyes, { x: 960, y: 560, zoom: 2.0 }], [k.know, { x: 960, y: 590, zoom: 2.6 }]])} />;
    case "know": return <FrontDoor frame={frame} k={k} cam={drift(camAt(frame, [[k.know, { x: 1000, y: 600, zoom: 1.3 }], [k.door, { x: 1200, y: 590, zoom: 1.45 }]]), frame, "kn", 2)} />;
    default: return <FrontDoor frame={frame} k={k} cam={drift(camAt(frame, [[k.door, { x: 1430, y: 600, zoom: 2.0 }], [k.swing, { x: 1450, y: 590, zoom: 2.2 }], [k.end, { x: 1560, y: 560, zoom: 2.5 }]]), frame, "door", 2)} />;
  }
};

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot);
  const first = findLine(shot.lines, "Leader: And I have never");
  const clickShot = makeShot(k.ident - 1, shot.clips, shot.lines, shot.clips[first].from - 36, shot.from, first);
  const tags: [string, number, number][] = [["FINE", k.fine, 170], ["NEARLY THERE", k.nearly, 300], ["LOVE IT", k.love, 430]];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Picture frame={frame} k={k} />
      <Diagram frame={frame} k={k} />
      {tags.map(([t, at, y], i) => <PaperTag key={t} frame={frame} at={at} until={k.own} text={t} x={1150 + (i % 2) * 40} y={y} size={64} tilt={i % 2 ? 3 : -3} />)}
      <Sequence from={k.ident} durationInFrames={C_FRAMES}>
        <IdentC
          front={<AbsoluteFill style={{ background: "#000" }}><ClickPicture frame={k.ident - 1} shot={clickShot} /></AbsoluteFill>}
          back={<AbsoluteFill style={{ background: "#000" }}><Picture frame={k.open} k={k} /></AbsoluteFill>}
          title={["What If You Saw", <>How Many Lies <Hi>Everyone Told?</Hi></>]}
        />
      </Sequence>
      <Clicks at={[k.clicks]} volume={0.45} />
      <Clicks at={[k.resets]} volume={0.35} file="sfx/tick.wav" />
      {[k.over, k.page2].map((f) => <Sequence key={f} from={f} durationInFrames={24}><Audio src={staticFile("sfx/paper.wav")} volume={0.35} /></Sequence>)}
      {[k.fine, k.nearly, k.love].map((f) => <Sequence key={f} from={f} durationInFrames={20}><Audio src={staticFile("sfx/stamp.wav")} volume={0.45} /></Sequence>)}
      <Sequence from={k.swing} durationInFrames={40}><Audio src={staticFile("sfx/knock.wav")} volume={0.3} /></Sequence>
    </AbsoluteFill>
  );
};

export const rule: Beat = { id: "Rule", first: "Over every head", lead: 4.2, Component: Scene };
