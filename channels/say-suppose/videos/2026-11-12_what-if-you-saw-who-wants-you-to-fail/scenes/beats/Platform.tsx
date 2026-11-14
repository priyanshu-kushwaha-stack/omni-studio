// Beat "The Platform" (script.md v3, ## [00:00] The Platform): the opening skit, before the narrator speaks. The kit
// metro platform at twenty to seven in the morning, a split-flap departure board overhead. Line 0 is the woman's own
// voice ("Well done, love."); the skit's two performed holds are the lead-in before it (clips[0].from frames) and the
// gap after it (lineEnd(clips, 0) to clips[1].from). Everything is timed as a share of those spans.
//
//   v7 (outside review of v6): the skit opens close on the board, 06:47 flipping to 06:48 on "this morning"; the
//   card's moving digits are smeared, only +22 lands crisp; the pointing and the pigeon play UNDER her line (she
//   starts it looking up, finds the pigeon, looks back at you and steps away on its last words), so the gap after it
//   is the train, the touch, the doors and you alone.
//
//   lead-in  the board flips to 06:48 and clicks; you under it with the envelope; you tear the seal, the sheet unfolds, you
//            read, your mouth opens, you read again; you look left, then right: one face, hers; you hold the letter out
//            at her: "I made it!"; a soft paper snap, a cream card unfolds over her head, the flaps flutter up out of
//            the red, through zero, into the teal and click still on +22 (an insert on the card); she never looks up;
//            your eyes do, and stay there
//   line 0   her, kindly, already half turned to the track: "Well done, love."
//   gap      you point straight up at the card; she follows your finger (insert: the station roof, a pigeon,
//            nothing); she looks at you and takes one step sideways; the train comes in behind her; insert: your
//            hand reaches up and touches the card, the flaps fold shut with a click; she boards, the doors close, the
//            train pulls out; you alone, the letter in one hand, the other still up; the board flutters once, clicks
//
// Exports `PlatformStage` for Made the Cut's first shot (your hand coming down on the empty platform).
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS, type Expression } from "@whatif/kit/rig/expressions";
import { lerpPose, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { metroPlatform } from "@whatif/kit/sets/MetroPlatform";
import { setLook } from "@whatif/kit/sets/common";
import { Backpack } from "@whatif/kit/sets/props";
import { FONT } from "@whatif/kit/fonts";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { Bubble, FLAP_FRAMES, headAt, Letter, Meter } from "../parts";
import { blinking, camAt, current, HERO, lineEnd, linear, mix, noise, ramp, type Beat, type Shot } from "../shared";
import { FlapFx, moodNow, SnapLines } from "./MadeTheCut.parts";

// ------------------------------------------------------------------------------------------------ the platform

const FLOOR = 960;
/** You, under the board; the woman at the yellow line, in front of where the train's door will stop. */
export const PLAT = {
  you: { x: 900, y: FLOOR, scale: 1.15 },
  woman: { x: 1255, y: 930, scale: 1.08 },
  /** Where she steps to, sideways along the platform. */
  aside: 1345,
  /** The train's door (kit metroPlatform DOOR) and its sill. */
  door: { x: 1250, y: 860 },
  /** The departure board hanging from the canopy: its centre and size. */
  board: { x: 900, y: 205, w: 560, h: 170 },
  /** A pigeon on the canopy's edge. */
  pigeon: { x: 1330, y: 92 },
};
export const WOMAN = { head: "#b4b4ae", coat: "#7a6a58" } as const;

/** A split-flap departure board: two rows of times (digits) and bars for where the trains go (no words). `flutter`
 *  0..1 sets the cells flipping (they settle as it falls back to 0). */
const DepartureBoard: React.FC<{ frame: number; flutter: number; flipAt?: number }> = ({ frame, flutter, flipAt }) => {
  const b = PLAT.board;
  // v7: the top row is the next train, 06:48, its last flap flipping over from 7 on "this morning" (`flipAt`)
  const last = flipAt === undefined || frame >= flipAt ? "8" : frame >= flipAt - 5 ? String(Math.floor(noise(frame) * 10)) : "7";
  const rows = [["0", "6", "4", last], ["0", "6", "5", "5"]];
  const cw = 46, ch = 60;
  return (
    <g transform={`translate(${b.x - b.w / 2} ${b.y - b.h / 2})`}>
      <line x1={b.w * 0.2} y1={-120} x2={b.w * 0.2} y2={0} stroke="#5c6470" strokeWidth={8} />
      <line x1={b.w * 0.8} y1={-120} x2={b.w * 0.8} y2={0} stroke="#5c6470" strokeWidth={8} />
      <rect x={0} y={0} width={b.w} height={b.h} rx={12} fill="#1b1d24" stroke={INK} strokeWidth={6} />
      {rows.map((digits, r) => (
        <g key={r} transform={`translate(18 ${18 + r * (ch + 14)})`}>
          {digits.map((d, i) => {
            const flipping = flutter > 0 && noise(i * 7 + r * 13 + Math.floor(frame / 2)) < flutter;
            const shown = flipping ? String(Math.floor(noise(i + r * 5 + frame) * 10)) : d;
            return (
              <g key={i} transform={`translate(${i * (cw + 6) + (i >= 2 ? 18 : 0)} 0)`}>
                <rect width={cw} height={ch} rx={5} fill="#2c2f3a" stroke="#000" strokeWidth={2} />
                <line x1={0} y1={ch / 2} x2={cw} y2={ch / 2} stroke="#000" strokeWidth={3} />
                <text x={cw / 2} y={ch * 0.74} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={ch * 0.7} fill="#f2e6c8">{shown}</text>
              </g>
            );
          })}
          <circle cx={2 * (cw + 6) + 6} cy={ch * 0.35} r={4} fill="#f2e6c8" />
          <circle cx={2 * (cw + 6) + 6} cy={ch * 0.65} r={4} fill="#f2e6c8" />
          {/* where the train goes: a row of flap cells showing bars, never words */}
          {Array.from({ length: 5 }, (_, i) => (
            <g key={i} transform={`translate(${250 + i * 56} 0)`}>
              <rect width={50} height={ch} rx={5} fill="#2c2f3a" stroke="#000" strokeWidth={2} />
              <rect x={8} y={ch / 2 - 7} width={flutter > 0 && noise(i + r * 3 + frame) < flutter ? 14 + noise(frame + i) * 20 : 34 - ((i + r) % 3) * 6} height={14} rx={7} fill="#f2e6c8" />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
};

/** A pigeon on the canopy edge, pecking. */
const Pigeon: React.FC<{ frame: number }> = ({ frame }) => {
  const p = PLAT.pigeon;
  const peck = Math.sin(frame / 5) > 0.6 ? 8 : 0;
  return (
    <g transform={`translate(${p.x} ${p.y})`}>
      <ellipse cx={0} cy={-26} rx={34} ry={22} fill="#9aa1ab" stroke={INK} strokeWidth={4} />
      <circle cx={26 + peck * 0.4} cy={-50 + peck} r={14} fill="#8a92a2" stroke={INK} strokeWidth={4} />
      <circle cx={30 + peck * 0.4} cy={-53 + peck} r={3} fill={INK} />
      <path d={`M${38 + peck * 0.4} ${-50 + peck} l10 3 l-10 3z`} fill="#e8c23a" />
      <path d="M-30 -20 l-22 6 l22 4z" fill="#6f7a82" />
      <line x1={-6} y1={-6} x2={-8} y2={4} stroke="#e6a0a0" strokeWidth={4} />
      <line x1={8} y1={-6} x2={8} y2={4} stroke="#e6a0a0" strokeWidth={4} />
    </g>
  );
};

/** The envelope with its teal seal, or torn open; for the front hand (Figure `held`). `strip` 0..1 flicks the torn
 *  seal strip up and away, spinning (v4.2: the tear reads at a glance). */
const Envelope: React.FC<{ torn: number; strip?: number }> = ({ torn, strip = 0 }) => (
  <g transform="rotate(-6) translate(-4 -30)">
    <rect x={-46} y={-30} width={92} height={60} rx={4} fill={PAPER} stroke={INK} strokeWidth={4} />
    <path d={`M-46 -30 L0 ${mix(4, -52, torn)} L46 -30`} fill={torn > 0.5 ? "#e8dcc4" : PAPER} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    {torn < 0.5 && <circle cx={0} cy={2} r={11} fill={TEAL} stroke={INK} strokeWidth={3} />}
    {strip > 0 && strip < 1 && (
      <g transform={`translate(${30 + strip * 70} ${-34 - strip * 90}) rotate(${strip * 260})`} opacity={1 - strip * strip}>
        <rect x={-26} y={-6} width={52} height={12} rx={3} fill={PAPER} stroke={INK} strokeWidth={3} />
        <circle cx={0} cy={0} r={8} fill={TEAL} stroke={INK} strokeWidth={2} />
      </g>
    )}
  </g>
);

/** The woman with her shopping bag. `fade` 1 to 0 as she steps into the train. */
const Woman: React.FC<{ frame: number; x: number; y: number; scale: number; pose: Pose; face: Partial<Expression>; fade?: number }> = ({ frame, x, y, scale, pose, face, fade = 1 }) => (
  <g opacity={fade}>
    <Figure x={x} y={y} scale={scale} facing={-1} pose={pose} head={WOMAN.head} coat={WOMAN.coat} {...face} blink={blinking(frame, 6)} time={frame}
      held={<g><path d="M-14 -4 q14 -26 28 0" fill="none" stroke={INK} strokeWidth={4} /><rect x={-22} y={-4} width={44} height={50} rx={6} fill="#e6a0a0" stroke={INK} strokeWidth={4} /></g>} />
  </g>
);

/** The platform with the board, the pigeon, the train, you and (if `woman`) her. Used by this beat and Made the Cut. */
export const PlatformStage: React.FC<{
  frame: number; cam: Camera; mood: MoodName; you: { pose: Pose; face: Partial<Expression>; held?: React.ReactNode; x?: number };
  woman?: { x: number; y?: number; pose: Pose; face: Partial<Expression>; fade?: number } | null; train?: number | null; doorOpen?: number;
  flutter?: number; flipAt?: number; card?: React.ReactNode; extra?: React.ReactNode;
}> = ({ frame, cam, mood, you, woman = null, train = null, doorOpen = 0, flutter = 0, flipAt, card, extra }) => {
  const options = { ...metroPlatform.defaults, train, doorOpen, crowd: false };
  const props = { cam, mood, frame, options };
  const yx = you.x ?? PLAT.you.x;
  const actors = (
    <>
      <DepartureBoard frame={frame} flutter={flutter} flipAt={flipAt} />
      <Pigeon frame={frame} />
      {woman && <Woman frame={frame} x={woman.x} y={woman.y ?? PLAT.woman.y} scale={PLAT.woman.scale} pose={woman.pose} face={woman.face} fade={woman.fade} />}
      <Backpack x={yx - 34} y={PLAT.you.y - 118} scale={0.9} color="#3d6fb0" />
      <Figure x={yx} y={PLAT.you.y} scale={PLAT.you.scale} facing={1} pose={you.pose} {...HERO} {...you.face} blink={blinking(frame, 0)} time={frame}
        flow={0.15} held={you.held} />
      {card}
      {extra}
    </>
  );
  return (
    <LookContext.Provider value={setLook(metroPlatform.lights(options), mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={metroPlatform.Back(props)} actors={actors} front={metroPlatform.Front?.(props)} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: Clip[], from: number, to: number) {
  // G2 round 18: the skit starts after the cold open (shot.from), not at frame 0.
  const lead = clips[0].from - from;
  const lp = (p: number) => from + Math.round(lead * p);
  const g0 = lineEnd(clips, 0), g1 = clips[1]?.from ?? to;
  const gp = (p: number) => Math.round(g0 + (g1 - g0) * p);
  const l0 = clips[0].from, lf = clips[0].frames;
  const ln = (p: number) => Math.round(l0 + lf * p);
  return {
    flip: from + 30, // the board's last flap flips 7 to 8 on "this morning"
    wide: lp(0.08), // the platform, morning, you under the board
    tear: lp(0.12), // you tear the seal
    read: lp(0.2), // the sheet unfolds; you read
    gasp: lp(0.27), // your mouth opens
    again: lp(0.32), // you read it again
    left: lp(0.39), // you look left ...
    right: lp(0.44), // ... and right: one face, hers
    show: lp(0.49), // you hold the letter out at her: "I made it!"
    snap: lp(0.55), // the card unfolds over her head
    cardCU: lp(0.58), // insert: the flaps run (smeared) up from red through zero, +22 lands crisp
    point: lp(0.8), // the two of you: your finger goes straight up at the card; she follows it
    line: l0, // her close, still looking up: "Oh, congratulations!"
    roof: ln(0.3), // insert: the station roof, a pigeon, nothing
    look: ln(0.52), // she looks back at you: "Your family must be so proud."
    step: ln(0.76), // ... and takes one step sideways on its last words; the train comes in behind her
    stopped: gp(0.12),
    touch: gp(0.06), // insert: your hand reaches up and touches the card
    fold: gp(0.16), // the flaps fold shut with a click
    board: gp(0.26), // the doors open; she boards
    shut: gp(0.48), // the doors close
    pull: gp(0.53), // the train pulls out
    alone: gp(0.6), // you alone, a hand still up
    flutter: gp(0.84), // the departure board flutters once, and clicks
    end: to,
  };
}

/** The card's digits: up out of the red, through zero, into the teal, still on +22 at `snap + 40`. The shared Meter runs
 *  its flaps from 0 to `value` over FLAP_FRAMES; passing value = wanted / progress makes it show `wanted` each frame. */
function cardValue(frame: number, snap: number) {
  const want = Math.round(interpolate(frame, [snap + 4, snap + 40], [-60, 22], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const t = interpolate(frame, [snap + 4, snap + 4 + FLAP_FRAMES], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return t > 0 ? want / t : want;
}

// ------------------------------------------------------------------------------------------------ the beat

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.from, shot.to);
  const mood = moodNow(shot);
  const on = current(frame, [
    [0, "board"], [k.wide, "wide"], [k.tear, "you"], [k.show, "show"], [k.cardCU, "card"], [k.point, "point"], [k.line, "her"],
    [k.roof, "roof"], [k.look, "back"], [k.step, "step"], [k.touch, "touch"], [k.board, "board2"], [k.alone, "alone"],
  ]);

  // the woman: at the yellow line, one step sideways on her last words, then into the train
  const stepX = mix(PLAT.woman.x, PLAT.aside, ramp(frame, k.step, k.step + 14));
  const boarding = linear(frame, k.board + 6, k.shut - 4);
  const wx = frame < k.board ? stepX : mix(PLAT.aside, PLAT.door.x, boarding);
  const wy = frame < k.board ? PLAT.woman.y : mix(PLAT.woman.y, PLAT.door.y + 40, boarding);
  const walking = (frame >= k.step && frame < k.step + 14) || (boarding > 0 && boarding < 1);
  const womanPose: Pose = walking ? walkPose(frame * 0.3) : { ...STAND, armF: [20, 30] };
  const talking = frame >= k.line && frame < lineEnd(clips, 0) && Math.floor((frame - k.line) / 6) % 2 === 1;
  const up = ramp(frame, k.point + 10, k.point + 22); // her eyes following your finger up
  const womanFace: Partial<Expression> =
    frame < k.show ? { ...EXPRESSIONS.neutral, lids: 0.3, look: { x: -0.2, y: 0.5 } }
    : frame < k.point + 10 ? { ...EXPRESSIONS.happy, lids: 0.2, look: { x: 0.9, y: 0.3 } }
    : frame < k.look ? { brows: "raised", lids: 0, mouth: talking ? "open" : "smile", eyes: 1.05, look: { x: mix(0.9, 0.35, up), y: mix(0.3, -0.95, up) } }
    : frame < k.step ? { brows: "flat", lids: 0.25, mouth: talking ? "open" : "smile", eyes: 1, look: { x: 0.9, y: 0.15 } }
    : { ...EXPRESSIONS.sceptical, lids: 0.35, mouth: talking ? "open" : "flat", look: { x: 0.9, y: 0.1 } };
  const fade = 1 - ramp(frame, k.shut - 10, k.shut - 2);
  const wh = headAt(wx, wy, PLAT.woman.scale, womanPose, -1);

  // the train: comes in behind her as she steps aside, stops, opens, closes, pulls out
  const train = frame < k.step ? null
    : frame < k.pull ? mix(2600, 0, interpolate(frame, [k.step, Math.max(k.step + 1, k.stopped)], [0, 1], { extrapolateRight: "clamp", easing: (t) => 1 - (1 - t) * (1 - t) }))
    : mix(0, -3400, Math.pow(linear(frame, k.pull, k.pull + 70), 2));
  const doorOpen = ramp(frame, k.board, k.board + 8) * (1 - ramp(frame, k.shut, k.shut + 8));

  // you: the envelope (held low, under your eyes), the letter, the look round, the letter held out, the finger up
  const held = frame < k.read ? <Envelope torn={ramp(frame, k.tear, k.tear + 10)} strip={linear(frame, k.tear + 4, k.tear + 20)} /> : <Letter x={2} y={4} scale={0.42} tilt={-4} />;
  const out = ramp(frame, k.show, k.show + 8);
  const pointUp = ramp(frame, k.point, k.point + 8);
  const youPose: Pose = lerpPose(lerpPose({ ...STAND, armF: [32, 78], armB: [30, 70] }, { ...STAND, armF: [92, 10], armB: [-7, 8] }, out),
    { ...STAND, armF: [60, 70], armB: [140, 20] }, pointUp);
  const reading = frame >= k.read && frame < k.left;
  const youFace: Partial<Expression> =
    frame < k.read ? { ...EXPRESSIONS.neutral, look: { x: 0.6, y: 0.7 } }
    : frame < k.gasp ? { brows: "flat", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 0.6, y: 0.8 } }
    : reading ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.25, look: { x: frame < k.again ? 0.6 : Math.sin(frame / 3) * 0.4 + 0.4, y: 0.8 } }
    : frame < k.right ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: -0.9, y: 0 } }
    : frame < k.show ? { brows: "raised", lids: 0, mouth: "open", eyes: 1.2, look: { x: 0.9, y: 0 } }
    : frame < k.snap + 6 ? { brows: "raised", lids: 0, mouth: "open", eyes: 1.15, look: { x: 0.9, y: 0.1 } }
    : frame < k.alone ? { brows: "raised", lids: 0, mouth: frame >= k.look && frame < k.touch ? "flat" : "o", eyes: 1.25, look: frame >= k.look && frame < k.step + 10 ? { x: 0.9, y: 0 } : { x: 0.8, y: -0.8 } }
    : { brows: "worry", lids: 0.1, mouth: "flat", eyes: 1.1, look: { x: 0.7, y: -0.8 } };
  const yh = headAt(PLAT.you.x, PLAT.you.y, PLAT.you.scale, youPose, 1);

  const cardMid = { x: wh.x, y: wh.y - wh.r - wh.r * 1.05 * 1.15 };
  const card = frame < k.board
    ? (
      <FlapFx id="platform" frame={frame} from={k.snap + 4} to={k.snap + 40} x={cardMid.x} y={cardMid.y} r={wh.r * 1.2} rim={TEAL}>
        <Meter frame={frame} at={k.snap} x={wh.x} headY={wh.y} r={wh.r} value={cardValue(frame, k.snap)} until={k.fold} scale={1.15} />
      </FlapFx>
    )
    : null;
  // the snap drawn: ink strokes flick out round the card as it opens (it opens in the two-shot, so it has to read there)
  const snapLines = <SnapLines frame={frame} at={k.snap} x={cardMid.x} y={cardMid.y} r={wh.r * 1.5} count={8} tilt={10} />;
  // "I made it!" on your far side, so it never sits over the card as it snaps open beside it (v4.1 overlapped at 0:05)
  const bubble = <Bubble frame={frame} at={k.show + 2} until={k.cardCU} x={yh.x - yh.r * 0.8} y={yh.y - yh.r * 1.1} text="I made it!" size={44} side="left" />;

  const cams: Record<typeof on, Camera> = {
    // v7: close on the board first, so the first frame reads as morning
    board: camAt(frame, [[shot.from, insert(PLAT.board.x, PLAT.board.y + 20, 2.7)], [k.wide, insert(PLAT.board.x, PLAT.board.y + 40, 2.55)]]),
    wide: camAt(frame, [[k.wide, { x: 1010, y: 505, zoom: 1.4 }], [k.tear, { x: 1010, y: 520, zoom: 1.48 }]]),
    you: camAt(frame, [[k.tear, closeUp(yh.x + 40, yh.y + 60, 2.2)], [k.left, closeUp(yh.x + 40, yh.y + 50, 2.4)], [k.show, closeUp(yh.x + 60, yh.y + 40, 2.2)]]),
    show: camAt(frame, [[k.show, { x: 1080, y: 620, zoom: 1.55 }], [k.cardCU, { x: 1090, y: 600, zoom: 1.6 }]]),
    card: camAt(frame, [[k.cardCU, insert(cardMid.x, cardMid.y + 40, 3.0)], [k.point, insert(cardMid.x, cardMid.y + 40, 3.3)]]),
    point: camAt(frame, [[k.point, { x: 1080, y: 560, zoom: 1.45 }], [k.line, { x: 1090, y: 550, zoom: 1.52 }]]),
    her: camAt(frame, [[k.line, closeUp(wh.x - 20, wh.y - 70, 2.3)], [k.roof, closeUp(wh.x - 20, wh.y - 75, 2.4)]]),
    roof: camAt(frame, [[k.roof, { x: PLAT.pigeon.x - 100, y: 110, zoom: 2.2 }], [k.look, { x: PLAT.pigeon.x - 40, y: 100, zoom: 2.3 }]]),
    back: camAt(frame, [[k.look, closeUp(wh.x - 60, wh.y - 40, 2.1)], [k.step, closeUp(wh.x - 70, wh.y - 40, 2.2)]]),
    step: camAt(frame, [[k.step, { x: 1100, y: 580, zoom: 1.35 }], [k.touch, { x: 1120, y: 580, zoom: 1.3 }]]),
    touch: camAt(frame, [[k.touch, insert(cardMid.x, cardMid.y + 60, 2.8)], [k.board, insert(cardMid.x, cardMid.y + 60, 3.0)]]),
    board2: camAt(frame, [[k.board, { x: 1080, y: 560, zoom: 1.15 }], [k.alone, { x: 1060, y: 560, zoom: 1.1 }]]),
    alone: camAt(frame, [[k.alone, { x: 960, y: 520, zoom: 1.3 }], [k.end, { x: 940, y: 480, zoom: 1.4 }]]),
  };
  const cam = drift(cams[on], frame, "platform", on === "card" || on === "touch" || on === "board" ? 1.5 : 3);

  // the insert of your hand reaching the card: an arm in from below
  const reach = ramp(frame, k.touch + 2, k.fold);
  const hand = on === "touch" ? (
    <g>
      <path d={`M${cardMid.x - 260} ${cardMid.y + 520} Q${cardMid.x - 120} ${cardMid.y + 260} ${mix(cardMid.x - 80, cardMid.x - 10, reach)} ${mix(cardMid.y + 220, cardMid.y + 40, reach)}`}
        fill="none" stroke="#3b3e47" strokeWidth={34} strokeLinecap="round" />
      <circle cx={mix(cardMid.x - 80, cardMid.x - 10, reach)} cy={mix(cardMid.y + 220, cardMid.y + 40, reach)} r={26} fill={MUSTARD} stroke={INK} strokeWidth={5} />
    </g>
  ) : null;

  const flutter = frame >= k.flutter ? 1 - ramp(frame, k.flutter, k.flutter + 14) : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <PlatformStage frame={frame} cam={cam} mood={mood} flutter={flutter} flipAt={k.flip} train={train} doorOpen={doorOpen}
        you={{ pose: youPose, face: youFace, held }}
        woman={fade > 0 ? { x: wx, y: wy, pose: womanPose, face: womanFace, fade } : null}
        card={<>{card}{snapLines}{bubble}</>} extra={hand} />
      {/* the board's one flap over on "this morning", and its flutter and click once at the end */}
      <Sequence from={k.flip - 6} durationInFrames={8}><Audio src={staticFile("sfx/flutter.wav")} volume={0.45} /></Sequence>
      <Sequence from={k.flip} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} volume={0.7} /></Sequence>
      <Sequence from={k.flutter} durationInFrames={16}><Audio src={staticFile("sfx/flutter.wav")} volume={0.5} /></Sequence>
      <Sequence from={k.flutter + 14} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} volume={0.6} /></Sequence>
      {/* the card: a soft paper snap, a long flutter up through the numbers, one hard click on +22; its click shut */}
      <Sequence from={k.snap} durationInFrames={20}><Audio src={staticFile("sfx/snap-soft.wav")} /></Sequence>
      <Sequence from={k.snap + 4} durationInFrames={20}><Audio src={staticFile("sfx/flutter.wav")} volume={0.75} /></Sequence>
      <Sequence from={k.snap + 22} durationInFrames={20}><Audio src={staticFile("sfx/flutter.wav")} volume={0.6} /></Sequence>
      <Sequence from={k.snap + 40} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} /></Sequence>
      <Sequence from={k.fold} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} /></Sequence>
    </AbsoluteFill>
  );
};

export const platform: Beat = { id: "Platform", firstLine: 0, Component: Scene };
