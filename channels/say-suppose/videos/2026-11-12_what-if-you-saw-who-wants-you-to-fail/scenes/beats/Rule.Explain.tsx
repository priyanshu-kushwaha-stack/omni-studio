// The Rule, lines 7-9 ("The rule, once. Say your good news out loud, to someone's face, and a card opens over their
// head. For sixty seconds, it shows how your news lands with them." / "Plus one hundred means pure joy for you. Minus
// one hundred means they want you to fail." / "And it never tells you why.").
//
// v7 (outside review of v6: no third replay of the opening hug, no Min-jun digits running under the rule, recalled
// moments framed so they do not read as a continuity jump, a faster scale, "never tells you why" shown with two
// contradictory Min-jun moments):
//
//   7  "The rule, once.": a neutral card, no number, snaps open over a plain paper head on dark paper
//      "Say your good news out loud ...": the platform that morning, INSIDE a cream paper panel (a memory): you hold the
//      letter out at her; her card snaps open (the run smeared, +22 crisp); "For sixty seconds": the card close, its
//      paper timer strip running down; "it shows how your news lands": her under it; it folds shut as the line ends
//   8  one scale sheet, acted: on "Plus one hundred" a teal card races up it to +100; "means pure joy for you" a grey
//      card clicks once at the zero; "Minus one hundred" a crimson card drops to -100; "they want you to fail" the push
//      onto that red card
//   9  "And it never tells you why.": two cream panels side by side, the same -84 over both: Min-jun's arm round you,
//      grinning; Min-jun hunched over his books, eyes narrowed, racing you. They fold shut into the store.
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS, type Expression } from "@whatif/kit/rig/expressions";
import { SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { CRIMSON, INK, PAPER, TEAL } from "@whatif/kit/theme";
import { FONT } from "@whatif/kit/fonts";
import { DrawLine } from "@whatif/kit/ui/DrawLine";
import { Bubble, headAt, Letter, Meter, MeterSound, Sheet } from "../parts";
import { camAt, current, HERO, MINJUN, mix, ramp } from "../shared";
import { CHEER, FlapFx, SnapLines, TimerStrip } from "./MadeTheCut.parts";
import { PLAT, PlatformStage } from "./Platform";

export interface ExplainTimes {
  replay: number; meter: number; say: number; open: number; sixty: number; lands: number; fold7: number;
  plus: number; joy: number; minus: number; enemy: number; why: number; wide: number;
}

type Look = Partial<Expression>;
const GROUND = <rect x={-1400} y={-900} width={4800} height={2600} fill="#2a2d38" />;

/** "The rule, once.": a neutral card, no number, over a plain paper head. */
const NeutralCard: React.FC<{ frame: number; k: ExplainTimes }> = ({ frame, k }) => {
  const h = headAt(960, 1000, 1.6, STAND, 1);
  const cam = drift(camAt(frame, [[k.replay, { x: 960, y: 520, zoom: 1.1 }], [k.say, { x: 960, y: 500, zoom: 1.2 }]]), frame, "neutral", 2);
  const actors = (
    <>
      <Sheet frame={frame} at={k.replay - 14} x={960} y={560} w={900} h={860} tilt={-1} />
      <Figure x={960} y={1000} scale={1.6} facing={1} pose={STAND} head="#d8d2c4" coat="#8a8478" look={{ x: 0, y: 0 }} eyes={0} mouth="none" time={0} />
      <Meter frame={frame} at={k.meter} x={h.x} headY={h.y} r={h.r} value={null} until={k.say + 30} scale={1.2} />
      <SnapLines frame={frame} at={k.meter} x={h.x} y={h.y - h.r * 2.3} r={h.r * 1.4} count={8} tilt={10} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={GROUND} actors={actors} />;
};

/** A recalled moment: the shot inside a cream paper panel, a little smaller than the frame and tilted. */
const Panel: React.FC<{ tilt?: number; scale?: number; children: React.ReactNode }> = ({ tilt = -1.2, scale = 0.84, children }) => (
  <AbsoluteFill style={{ background: "#2a2d38" }}>
    <AbsoluteFill style={{ transform: `scale(${scale}) rotate(${tilt}deg)`, boxShadow: `0 0 0 22px ${PAPER}, 18px 26px 0 22px rgba(0,0,0,0.35)`, overflow: "hidden" }}>
      {children}
    </AbsoluteFill>
  </AbsoluteFill>
);

/** The platform that morning, for "to someone's face": you and her, the letter held out, her card and its timer. */
const PlatformRule: React.FC<{ frame: number; k: ExplainTimes }> = ({ frame, k }) => {
  const on = current(frame, [[k.say, "say"], [k.open, "open"], [k.sixty, "sixty"], [k.lands, "lands"]]);
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
  const womanFace: Look = on === "lands" && frame > k.lands + 40
    ? { ...EXPRESSIONS.happy, lids: 0.3, look: { x: -0.6, y: 0.1 } } // she glances off down the track
    : { brows: heard > 0.5 ? "raised" : "none", lids: mix(0.3, 0.1, heard), mouth: heard > 0.5 ? "smile" : "flat", eyes: 1.05, look: { x: 0.9, y: 0.2 } };
  const ch = wh.r * 1.05 * 1.15; // the card's height (Meter scale 1.15)
  const cardMid = { x: wh.x, y: wh.y - wh.r - ch };
  const cams: Record<typeof on, Camera> = {
    say: camAt(frame, [[k.say, { x: 1075, y: 650, zoom: 1.7 }], [k.open, { x: 1085, y: 640, zoom: 1.8 }]]),
    open: camAt(frame, [[k.open, closeUp(wh.x - 110, wh.y - 95, 2.0)], [k.sixty, closeUp(wh.x - 110, wh.y - 105, 2.15)]]),
    sixty: camAt(frame, [[k.sixty, insert(cardMid.x, cardMid.y + 30, 3.0)], [k.lands, insert(cardMid.x, cardMid.y + 30, 3.2)]]),
    lands: camAt(frame, [[k.lands, closeUp(wh.x - 50, wh.y - 85, 2.1)], [k.plus, closeUp(wh.x - 50, wh.y - 95, 2.25)]]),
  };
  const cam = drift(cams[on], frame, "rule-platform", on === "sixty" ? 1.5 : 3);
  const extra = (
    <>
      <FlapFx id="rule-platform" frame={frame} from={k.open + 4} to={k.open + 22} x={cardMid.x} y={cardMid.y} r={wh.r * 1.2} rim={TEAL}>
        <Meter frame={frame} at={k.open} x={wh.x} headY={wh.y} r={wh.r} value={22} until={k.fold7} scale={1.15} />
      </FlapFx>
      <TimerStrip frame={frame} start={k.sixty} end={k.fold7} p0={0} x={wh.x} headY={wh.y} r={wh.r} scale={1.15} />
      <SnapLines frame={frame} at={k.open} x={cardMid.x} y={cardMid.y} r={wh.r * 1.5} count={8} tilt={10} />
      <Bubble frame={frame} at={k.say + 10} until={k.open} x={yh.x - yh.r * 0.8} y={yh.y - yh.r * 1.1} text="I made it!" size={40} side="left" />
    </>
  );
  return (
    <Panel>
      <PlatformStage frame={frame} cam={cam} mood="morning" you={{ pose: youPose, face: youFace, held: <Letter x={2} y={4} scale={0.42} tilt={-4} /> }}
        woman={{ x: PLAT.woman.x, pose: womanPose, face: womanFace }} card={extra} />
    </Panel>
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

/** Line 8: the paper scale, upright (teal above, a grey zero, red below), with three example cards acting on it: a teal
 *  one racing up to +100, a grey one clicking once at zero, a crimson one dropping to -100. */
const ScaleSheet: React.FC<{ frame: number; k: ExplainTimes }> = ({ frame, k }) => {
  const W = 760, H = 900, x = 230, y0 = 110, y1 = H - 110, mid = H / 2;
  const drawn = k.plus + 2, done = k.plus + 12;
  const cam = drift(camAt(frame, [[k.plus, { x: 960, y: 420, zoom: 1.25 }], [k.joy, { x: 960, y: 520, zoom: 1.3 }], [k.minus, { x: 960, y: 560, zoom: 1.3 }], [k.enemy, { x: 990, y: 760, zoom: 1.45 }], [k.why, { x: 1000, y: 800, zoom: 1.6 }]]), frame, "scale", 2);
  const r = 105; // the example cards' "head" radius: their size
  const cardX = x + 290;
  const rise = ramp(frame, k.plus + 8, k.plus + 26);
  const fall = ramp(frame, k.minus + 2, k.minus + 20);
  const card = (id: string, at: number, value: number, y: number, rim: string) => (
    <FlapFx id={`scale-${id}`} frame={frame} from={at + 4} to={at + 22} x={cardX} y={y} r={r} rim={rim}>
      <Meter frame={frame} at={at} x={cardX} headY={y + r + r * 1.05 * 1.5 - r * 0.5} r={r} value={value} tilt={-2} />
    </FlapFx>
  );
  const sheet = (
    <Sheet frame={frame} at={k.plus - 6} x={960} y={540} w={W} h={H} tilt={-1.5}>
      <DrawLine d={`M${x} ${mid} V${y0}`} from={drawn} to={done} color={TEAL} width={40} />
      <DrawLine d={`M${x} ${mid} V${y1}`} from={drawn} to={done} color={CRIMSON} width={40} />
      {frame >= done && [-1, -0.5, 0, 0.5, 1].map((t) => <line key={t} x1={x - 70} y1={mid + t * (y1 - mid)} x2={x - 34} y2={mid + t * (y1 - mid)} stroke={INK} strokeWidth={6} />)}
      {frame >= done && <Stamp x={x - 130} y={y0} text="+" color={TEAL} size={90} />}
      {frame >= done && <Stamp x={x - 130} y={y1} text="-" color={CRIMSON} size={90} />}
      {card("up", k.plus + 8, 100, mix(mid, y0 + 20, rise), TEAL)}
      {frame >= k.joy && frame < k.minus && card("zero", k.joy, 0, mid, "#9a9a94")}
      {frame >= k.minus && card("down", k.minus, -100, mix(mid, y1 - 20, fall), CRIMSON)}
    </Sheet>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={GROUND} actors={sheet} />;
};

/** Line 9: the same -84 over two Min-jun moments, side by side in cream panels: his arm round you, grinning; and him
 *  hunched over his books at night, eyes narrowed, racing you. The panels fold shut on the cut to the store. */
const NeverWhy: React.FC<{ frame: number; k: ExplainTimes }> = ({ frame, k }) => {
  const shut = ramp(frame, k.wide - 7, k.wide);
  const pop = (d: number) => ramp(frame, k.why + d, k.why + d + 8);
  const panel = (cx: number, d: number, children: React.ReactNode) => (
    <g transform={`translate(${cx} 540) scale(${pop(d)} ${pop(d) * (1 - shut)}) translate(${-cx} -540)`}>
      <rect x={cx - 430 + 12} y={150 + 16} width={860} height={780} rx={10} fill="#000" opacity={0.3} />
      <rect x={cx - 430} y={150} width={860} height={780} rx={10} fill={PAPER} stroke="#cdbfa6" strokeWidth={6} />
      <clipPath id={`why-${cx}`}><rect x={cx - 410} y={170} width={820} height={740} rx={6} /></clipPath>
      <g clipPath={`url(#why-${cx})`}>{children}</g>
    </g>
  );
  const S = 2.4;
  const hug: Pose = { ...CHEER, armF: [80, 30] };
  const mL = { x: 650, y: 560 - headAt(0, 0, S, hug, -1).y };
  const hL = headAt(mL.x, mL.y, S, hug, -1);
  const you = { x: 330, y: 610 - headAt(0, 0, S * 1.05, STAND, 1).y };
  const yH = headAt(you.x, you.y, S * 1.05, { ...STAND, tilt: 10, lean: 6 }, 1);
  const study: Pose = { ...SEATED, lean: 22, tilt: 14, armF: [80, 60], armB: [70, 70] };
  const mR = { x: 1480, y: 600 - headAt(0, 0, S, study, -1).y };
  const hR = headAt(mR.x, mR.y, S, study, -1);
  const desk = hR.y + hR.r * 2.4;
  const scribble = Math.sin(frame / 2) * 6;
  const left = (
    <>
      <rect x={130} y={170} width={860} height={760} fill="#1b1f3a" />
      <Figure x={you.x} y={you.y} scale={S * 1.05} facing={1} pose={{ ...STAND, tilt: 10, lean: 6 }} {...HERO} brows="raised" lids={0} mouth="o" eyes={1.15} look={{ x: 0.7, y: -0.7 }} time={frame} />
      <Figure x={mL.x} y={mL.y} scale={S} facing={-1} pose={hug} head={MINJUN.head} coat={MINJUN.coat} brows="raised" lids={0} mouth="open" eyes={1} blink time={frame} />
      <path d={`M${hL.x - hL.r * 0.3} ${hL.y + hL.r * 2.3} Q${hL.x - hL.r * 2.4} ${hL.y + hL.r * 1.1} ${yH.x + yH.r * 0.4} ${yH.y + yH.r * 1.7}`} fill="none" stroke={INK} strokeWidth={13 * S} strokeLinecap="round" />
      <Meter frame={frame} at={k.why - 200} x={hL.x} headY={hL.y} r={hL.r} value={-84} until={k.wide + 60} />
    </>
  );
  const right = (
    <>
      <rect x={990} y={170} width={860} height={760} fill="#232a3a" />
      <circle cx={1700} cy={300} r={120} fill="#ffd38a" opacity={0.25} />
      <Figure x={mR.x} y={mR.y} scale={S} facing={-1} pose={study} head={MINJUN.head} coat={MINJUN.coat} brows="angry" lids={0.45} mouth="flat" eyes={0.9} look={{ x: 0.6, y: 0.8 }} time={frame} />
      <rect x={1020} y={desk} width={560} height={40} fill="#8a5a3a" stroke={INK} strokeWidth={6} />
      <rect x={1100} y={desk - 60} width={210} height={60} fill={PAPER} stroke={INK} strokeWidth={5} transform={`rotate(-4 1205 ${desk - 30})`} />
      {[0, 1, 2].map((i) => <rect key={i} x={1400} y={desk - 34 - i * 34} width={150} height={32} fill={["#b0543d", "#3d6fb0", "#5a7a3d"][i]} stroke={INK} strokeWidth={4} />)}
      <line x1={1230 + scribble} y1={desk - 110} x2={1190 + scribble} y2={desk - 40} stroke="#e8c23a" strokeWidth={12} strokeLinecap="round" />
      <Meter frame={frame} at={k.why - 200} x={hR.x} headY={hR.y} r={hR.r} value={-84} until={k.wide + 60} />
    </>
  );
  const cam = drift(camAt(frame, [[k.why, { x: 960, y: 540, zoom: 0.98 }], [k.wide, { x: 960, y: 540, zoom: 1.04 }]]), frame, "why", 1.5);
  return <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={GROUND} actors={<>{panel(560, 0, left)}{panel(1420, 8, right)}</>} />;
};

/** Lines 7-9, every shot up to the store. */
export const Explain: React.FC<{ frame: number; k: ExplainTimes }> = ({ frame, k }) => {
  const on = current(frame, [[k.replay, "neutral"], [k.say, "platform"], [k.plus, "scale"], [k.why, "why"]]);
  if (on === "neutral") return <NeutralCard frame={frame} k={k} />;
  if (on === "platform") return <PlatformRule frame={frame} k={k} />;
  if (on === "scale") return <ScaleSheet frame={frame} k={k} />;
  return <NeverWhy frame={frame} k={k} />;
};

/** The sounds: the neutral card's snap, the platform card's snap, flaps and fold, the three scale cards, and the
 *  panels folding shut into the store. Outside <Stage>. */
export const ExplainSound: React.FC<{ k: ExplainTimes }> = ({ k }) => (
  <>
    <Sequence from={k.meter} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} volume={0.8} /></Sequence>
    <MeterSound at={k.open} soft volume={0.85} />
    <Sequence from={k.fold7} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} /></Sequence>
    <MeterSound at={k.plus + 8} soft volume={0.7} />
    <Sequence from={k.joy} durationInFrames={20}><Audio src={staticFile("sfx/snap-soft.wav")} volume={0.6} /></Sequence>
    <Sequence from={k.joy + 10} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} volume={0.8} /></Sequence>
    <MeterSound at={k.minus} soft volume={0.7} />
    <Sequence from={k.wide - 7} durationInFrames={20}><Audio src={staticFile("sfx/snap.wav")} volume={0.7} /></Sequence>
  </>
);
