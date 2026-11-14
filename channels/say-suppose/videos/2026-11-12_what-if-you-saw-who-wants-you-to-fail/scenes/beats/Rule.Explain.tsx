// The Rule, lines 7-8 (v4: "The rule, once. Say your good news out loud, to someone's face, and a card opens over their
// head. For sixty seconds, it shows how your news lands with them." / "Plus one hundred means pure joy for you. Minus
// one hundred means they want you to fail."). v4.1 held one paper scale for twelve seconds here; the outside review
// (2026-11-13) asked for acted shots. Now:
//
//   7  "The rule, once.": his card at -84 again, over his grin (the replay)
//      "Say your good news out loud, to someone's face": the platform that morning, the two of you; you hold the letter
//      out at her and say it ("I made it!")
//      "and a card opens over their head": closer on her; the card snaps open, the flaps run to +22
//      "For sixty seconds": the card close, a paper dial beside it starting to sweep
//      "it shows how your news lands with them": her, smiling at you under the card; the dial runs out and the card
//      folds shut with a click as the line ends
//   8  "Plus one hundred": the paper scale draws itself, the marker climbs to the teal +100
//      "means pure joy for you": her beaming face under the teal +22 (a joyful reading)
//      "Minus one hundred": the scale again, closer, the marker drops to the red -100
//      "means they want you to fail": his grin under the red -84
import { Audio, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS, type Expression } from "@whatif/kit/rig/expressions";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, PAPER, TEAL } from "@whatif/kit/theme";
import { FONT } from "@whatif/kit/fonts";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { Bubble, headAt, Letter, Meter, MeterSound, Sheet } from "../parts";
import { camAt, current, MINJUN, mix, linear, ramp } from "../shared";
import { ACADEMY, AcademyStreetBack } from "../sets/AcademyStreet";
import { CHEER, SixtyDial, SnapLines } from "./MadeTheCut.parts";
import { PLAT, PlatformStage } from "./Platform";

export interface ExplainTimes {
  replay: number; meter: number; say: number; open: number; sixty: number; lands: number; fold7: number;
  plus: number; joy: number; minus: number; enemy: number; why: number;
}

type Look = Partial<Expression>;

/** "The rule, once": the opening frame again, close on his card at -84 over his grin. */
const ReplayInsert: React.FC<{ frame: number; k: ExplainTimes }> = ({ frame, k }) => {
  const f = ACADEMY.thumb.friend;
  const h = headAt(f.x, f.y, f.scale, CHEER, -1);
  const card = { x: h.x, y: h.y - h.r * 2.05 };
  const cam = drift(camAt(frame, [[k.replay, insert(card.x - 20, card.y + 110, 1.7)], [k.say, insert(card.x - 20, card.y + 80, 1.95)]]), frame, "replay", 2);
  const actors = (
    <>
      <Figure x={f.x} y={f.y} scale={f.scale} facing={-1} pose={CHEER} head={MINJUN.head} coat={MINJUN.coat} {...EXPRESSIONS.happy}
        mouth="open" eyes={1.1} look={{ x: 0.9, y: 0.15 }} time={frame} />
      <Meter frame={frame} at={k.meter} x={h.x} headY={h.y} r={h.r} value={-84} until={k.say} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<AcademyStreetBack cam={cam} mood="night" frame={frame} view="thumb" />} actors={actors} />;
};

/** "...means they want you to fail": his grin under the red -84, closer than the replay, the card already still. */
const EnemyReading: React.FC<{ frame: number; k: ExplainTimes }> = ({ frame, k }) => {
  const f = ACADEMY.thumb.friend;
  const h = headAt(f.x, f.y, f.scale, CHEER, -1);
  const cam = drift(camAt(frame, [[k.enemy, closeUp(h.x - 70, h.y - 170, 1.3)], [k.why, closeUp(h.x - 70, h.y - 170, 1.42)]]), frame, "enemy", 2);
  const actors = (
    <>
      <Figure x={f.x} y={f.y} scale={f.scale} facing={-1} pose={CHEER} head={MINJUN.head} coat={MINJUN.coat} {...EXPRESSIONS.happy}
        mouth="open" eyes={1.1} look={{ x: 0.9, y: 0.15 }} time={frame} />
      <Meter frame={frame} at={k.enemy - 60} x={h.x} headY={h.y} r={h.r} value={-84} until={k.why + 60} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<AcademyStreetBack cam={cam} mood="night" frame={frame} view="thumb" />} actors={actors} />;
};

/** The platform that morning, for "to someone's face": you and her, the letter held out, her card. */
const PlatformRule: React.FC<{ frame: number; k: ExplainTimes }> = ({ frame, k }) => {
  const on = current(frame, [[k.say, "say"], [k.open, "open"], [k.sixty, "sixty"], [k.lands, "lands"], [k.joy, "joy"]]);
  const womanPose: Pose = { ...STAND, armF: [20, 30] };
  const wh = headAt(PLAT.woman.x, PLAT.woman.y, PLAT.woman.scale, womanPose, -1);
  const out = ramp(frame, k.say + 4, k.say + 14);
  const youPose: Pose = { ...STAND, armF: [mix(55, 92, out), mix(85, 10, out)], armB: [-7, 8] };
  const yh = headAt(PLAT.you.x, PLAT.you.y, PLAT.you.scale, youPose, 1);
  const talking = frame >= k.say + 10 && frame < k.say + 40 && Math.floor(frame / 5) % 2 === 0;
  const youFace: Look = on === "say"
    ? { brows: "raised", lids: 0, mouth: talking ? "open" : "smile", eyes: 1.15, look: { x: 0.9, y: 0 } }
    : { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.8, y: -0.7 } };
  const heard = ramp(frame, k.say + 20, k.say + 34);
  const womanFace: Look = on === "joy"
    ? { brows: "raised", lids: 0, mouth: "open", eyes: 1.15, look: { x: 0.7, y: -0.1 } } // beaming, not knowing
    : on === "lands" && frame > k.lands + 40
      ? { ...EXPRESSIONS.happy, lids: 0.3, look: { x: -0.6, y: 0.1 } } // she glances off down the track
      : { brows: heard > 0.5 ? "raised" : "none", lids: mix(0.3, 0.1, heard), mouth: heard > 0.5 ? "smile" : "flat", eyes: 1.05, look: { x: 0.9, y: 0.2 } };
  const ch = wh.r * 1.05 * 1.15; // the card's height (Meter scale 1.15)
  const cardMid = { x: wh.x, y: wh.y - wh.r - ch };
  const cardAt = on === "joy" ? k.joy - 60 : k.open;
  const until = on === "joy" ? k.minus + 30 : k.fold7;
  const card = <Meter frame={frame} at={cardAt} x={wh.x} headY={wh.y} r={wh.r} value={22} until={until} scale={1.15} />;
  const dialOn = on === "sixty" || on === "lands";
  const dial = dialOn
    ? <SixtyDial x={cardMid.x - ch * 1.25 - ch * 0.75} y={cardMid.y} r={ch * 0.45 * ramp(frame, k.sixty, k.sixty + 6)} p={linear(frame, k.sixty + 4, k.fold7)}
      opacity={1 - ramp(frame, k.fold7 + 6, k.fold7 + 14)} />
    : null;
  const cams: Record<typeof on, Camera> = {
    say: camAt(frame, [[k.say, { x: 1075, y: 650, zoom: 1.7 }], [k.open, { x: 1085, y: 640, zoom: 1.8 }]]),
    open: camAt(frame, [[k.open, closeUp(wh.x - 110, wh.y - 95, 2.0)], [k.sixty, closeUp(wh.x - 110, wh.y - 105, 2.15)]]),
    sixty: camAt(frame, [[k.sixty, insert(cardMid.x - 70, cardMid.y + 10, 3.1)], [k.lands, insert(cardMid.x - 70, cardMid.y + 10, 3.3)]]),
    lands: camAt(frame, [[k.lands, closeUp(wh.x - 50, wh.y - 85, 2.1)], [k.plus, closeUp(wh.x - 50, wh.y - 95, 2.25)]]),
    joy: camAt(frame, [[k.joy, closeUp(wh.x - 10, wh.y - 70, 2.7)], [k.minus, closeUp(wh.x - 10, wh.y - 75, 2.85)]]),
  };
  const cam = drift(cams[on], frame, "rule-platform", on === "sixty" ? 1.5 : 3);
  const extra = (
    <>
      {card}
      {dial}
      <SnapLines frame={frame} at={k.open} x={cardMid.x} y={cardMid.y} r={wh.r * 1.5} count={8} tilt={10} />
      <Bubble frame={frame} at={k.say + 10} until={k.open} x={yh.x - yh.r * 0.8} y={yh.y - yh.r * 1.1} text="I made it!" size={40} side="left" />
    </>
  );
  return (
    <PlatformStage frame={frame} cam={cam} mood="morning" you={{ pose: youPose, face: youFace, held: <Letter x={2} y={4} scale={0.42} tilt={-4} /> }}
      woman={{ x: PLAT.woman.x, pose: womanPose, face: womanFace }} card={extra} />
  );
};

/** Stamped flap tiles, the card's own lettering, centred at (x, y). */
const Stamp: React.FC<{ x: number; y: number; text: string; color: string; size: number }> = ({ x, y, text, color, size }) => (
  <g transform={`translate(${x} ${y})`}>
    {text.split("").map((ch, i, all) => {
      const cx = (i - (all.length - 1) / 2) * size * 0.62;
      return (
        <g key={i} transform={`translate(${cx} 0)`}>
          <rect x={-size * 0.28} y={-size * 0.42} width={size * 0.56} height={size * 0.84} rx={size * 0.08} fill={color} stroke={INK} strokeWidth={4} />
          <text x={0} y={size * 0.26} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size * 0.66} fill={PAPER}>{ch}</text>
        </g>
      );
    })}
  </g>
);

/** The paper scale, upright: teal above (+100), a grey zero, red below (-100). It draws itself fast on "Plus one
 *  hundred" and the marker climbs to the teal end; on "Minus one hundred" (a closer framing) it drops to the red end. */
const ScaleSheet: React.FC<{ frame: number; k: ExplainTimes; on: "plus" | "minus" }> = ({ frame, k, on }) => {
  const W = 760, H = 900, x = 250, y0 = 110, y1 = H - 110, mid = H / 2;
  const drawn = k.plus + 4, done = k.plus + 20;
  const toPlus = ramp(frame, k.plus + 20, k.plus + 38), toMinus = ramp(frame, k.minus + 2, k.minus + 24);
  const m = mid + (y0 - mid) * toPlus + (y1 - y0) * toMinus;
  const cam = drift(on === "plus"
    ? camAt(frame, [[k.plus, { x: 960, y: 540, zoom: 1.0 }], [k.joy, { x: 960, y: 500, zoom: 1.08 }]])
    : camAt(frame, [[k.minus, { x: 900, y: 640, zoom: 1.3 }], [k.enemy, { x: 900, y: 700, zoom: 1.42 }]]), frame, "scale", 2);
  const glowPlus = on === "plus" ? ramp(frame, k.plus + 34, k.plus + 42) : 0;
  const glowMinus = on === "minus" ? ramp(frame, k.minus + 20, k.minus + 28) : 0;
  const sheet = (
    <Sheet frame={frame} at={k.plus} x={960} y={540} w={W} h={H} tilt={-1.5}>
      <DrawLine d={`M${x} ${mid} V${y0}`} from={drawn} to={done} color={TEAL} width={40} />
      <DrawLine d={`M${x} ${mid} V${y1}`} from={drawn} to={done} color={CRIMSON} width={40} />
      {frame >= done && [-1, -0.5, 0, 0.5, 1].map((t) => <line key={t} x1={x - 70} y1={mid + t * (y1 - mid)} x2={x - 34} y2={mid + t * (y1 - mid)} stroke={INK} strokeWidth={6} />)}
      {glowPlus > 0 && <circle cx={x + 230} cy={y0} r={150} fill={TEAL} opacity={0.18 * glowPlus} />}
      {glowMinus > 0 && <circle cx={x + 230} cy={y1} r={150} fill={CRIMSON} opacity={0.18 * glowMinus} />}
      {frame >= done - 6 && <Stamp x={x + 230} y={y0} text="+100" color={TEAL} size={120} />}
      {frame >= done && <Stamp x={x + 160} y={mid} text="0" color="#9a9a94" size={120} />}
      {frame >= done + 4 && <Stamp x={x + 230} y={y1} text="-100" color={CRIMSON} size={120} />}
      {frame >= k.plus + 16 && <path d={`M${x - 32} ${m} l-44 -28 v56z`} fill={INK} />}
    </Sheet>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<rect x={-1400} y={-900} width={4800} height={2600} fill="#2a2d38" />} actors={sheet} />;
};

/** Lines 7-8, every shot up to "And it never tells you why." */
export const Explain: React.FC<{ frame: number; k: ExplainTimes }> = ({ frame, k }) => {
  const on = current(frame, [[k.replay, "replay"], [k.say, "platform"], [k.plus, "plus"], [k.joy, "joy"], [k.minus, "minus"], [k.enemy, "enemy"]]);
  if (on === "replay") return <ReplayInsert frame={frame} k={k} />;
  if (on === "platform" || on === "joy") return <PlatformRule frame={frame} k={k} />;
  if (on === "enemy") return <EnemyReading frame={frame} k={k} />;
  return <ScaleSheet frame={frame} k={k} on={on} />;
};

/** The sounds of the platform card in the rule: the snap and flaps, and the click as it folds shut. Outside <Stage>. */
export const ExplainSound: React.FC<{ k: ExplainTimes }> = ({ k }) => (
  <>
    <MeterSound at={k.open} soft volume={0.85} />
    <Sequence from={k.fold7} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} /></Sequence>
  </>
);
