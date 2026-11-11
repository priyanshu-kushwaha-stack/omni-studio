// The metro platform: the opening (night, rain; the thumbnail's picture), the grate insert, the rule, and the last
// morning (the doors, the key, the chai stall's grate).
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { TEAL } from "@whatif/kit/theme";
import type { Beat, Shot } from "../shared";
import { Bubble, DistTag, Dots, Extra, GLOW, Grate, Rain, Sifter, You } from "../parts";
import { ease, local, push, Set, WIDE } from "./kit";

const GR = { x: 1100, y: 822, w: 430, h: 118 };
const HERO = { x: 470, y: 1062, s: 3.3 };
const PAT: Pose = { ...STAND, armF: [10, 100], armB: [-10, 100] };
const STEP: Pose = { ...walkPose(0.6), lean: 9, tilt: 12, armF: [62, 38], armB: [-34, 20] };
const CROUCH: Pose = { lean: 30, tilt: 18, armF: [80, 30], armB: [40, 60], legB: [70, -120], legF: [60, -110], drop: 70 };

/** The platform set: the tunnel wall, the track pit, the yellow edge, wet slabs, lamp reflections; `train` slides a
 *  carriage through the pit (0 gone, 1 in). `morning` is the day version. */
const PlatformBack: React.FC<{ f: number; train?: number; morning?: boolean; glow?: number }> = ({ f, train = 0, morning, glow = 0 }) => {
  const wall = morning ? "#c9c2b4" : "#121722";
  const floor = morning ? "#9a958c" : "#232a37";
  return (
    <g>
      <rect width={1920} height={1080} fill={wall} />
      {[0, 1, 2, 3, 4, 5].map((r) => <rect key={r} x={0} y={70 + r * 82} width={1920} height={5} fill={morning ? "#b8b0a2" : "#1b2130"} />)}
      <rect x={760} y={170} width={360} height={220} rx={8} fill={morning ? "#e7dfcf" : "#1d2536"} stroke={morning ? "#8a8274" : "#2a3348"} strokeWidth={10} />
      <rect x={0} y={520} width={1920} height={120} fill={morning ? "#4a4740" : "#090b11"} />
      <rect x={0} y={575} width={1920} height={6} fill="#3a4152" opacity={0.6} />
      {train > 0 && (
        <g transform={`translate(${(1 - train) * 2400 - 200} 0)`}>
          <rect x={-200} y={250} width={2400} height={360} rx={30} fill={morning ? "#d9d3c4" : "#2c3446"} stroke="#0d0f15" strokeWidth={10} />
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-120 + i * 260} y={300} width={180} height={150} rx={14} fill={morning ? "#f7efd9" : "#ffe7b0"} opacity={morning ? 1 : 0.55} />)}
        </g>
      )}
      <rect x={0} y={640} width={1920} height={440} fill={floor} />
      <rect x={0} y={640} width={1920} height={26} fill="#9a8030" />
      {[700, 770, 860, 975].map((y) => <rect key={y} x={0} y={y} width={1920} height={3} fill="#121620" opacity={0.6} />)}
      {Array.from({ length: 13 }, (_, i) => {
        const xTop = -240 + i * 200;
        return <line key={i} x1={xTop} y1={666} x2={960 + (xTop - 960) * 1.9} y2={1080} stroke="#121620" strokeWidth={3} opacity={0.6} />;
      })}
      {!morning && (
        <g opacity={0.3}>
          <rect x={300} y={680} width={60} height={300} fill="#ffe7b0" />
          <rect x={1470} y={680} width={60} height={300} fill="#ffe7b0" />
        </g>
      )}
      <Grate x={GR.x} y={GR.y} w={GR.w} h={GR.h} glow={glow} />
      {!morning && <Rain f={f} />}
    </g>
  );
};

const LINE = [{ x: HERO.x + 120, y: HERO.y - 8 }, { x: 860, y: 1070 }, { x: 1080, y: 900 }, { x: GR.x + GR.w * 0.45, y: GR.y + GR.h * 0.9 }];

/** 0. Three pats at the doors; the third finds nothing. */
const Pats: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const pat = Math.floor(f / 12);
  const pose: Pose = pat < 3 && f % 12 < 7 ? { ...PAT, armF: [12, 80] } : PAT;
  const stopped = f > 36;
  return (
    <Set cam={push(f, d, { x: 900, y: 560, zoom: 1.05 }, { x: 760, y: 520, zoom: 1.2 })}
      back={<PlatformBack f={f} train={1} />}
      actors={<You f={f} x={HERO.x} y={HERO.y} s={HERO.s} pose={pose} mouth={stopped ? "o" : "flat"} brows={stopped ? "raised" : "none"}
        eyes={stopped ? 1.25 : 1} look={{ x: 0.6, y: stopped ? 0.8 : 0.1 }} />} />
  );
};

/** 1. "Where did it go?" The line draws itself from your shoe into the grate; the 4.2 m tag; the train leaves. */
const LineAppears: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d, at } = local(shot);
  const draw = Math.max(8, at(2) - 4);
  return (
    <Set cam={push(f, d, { x: 960, y: 560, zoom: 1.02 }, WIDE)}
      back={<PlatformBack f={f} train={1 - ease(f, draw + 30, draw + 110)} glow={ease(f, draw + 20, draw + 50)} />}
      actors={
        <>
          <Dots frame={f} at={draw} dur={34} path={LINE} size={14} shrink={0.55} />
          <You f={f} x={HERO.x} y={HERO.y} s={HERO.s} pose={STEP} mouth="o" brows="raised" eyes={1.35} look={{ x: 0.95, y: 0.75 }} />
          <Bubble frame={f} at={2} until={draw + 10} x={HERO.x + 230} y={HERO.y - 820} text="Where did it go?" size={40} />
          <DistTag frame={f} at={draw + 30} x={1060} y={760} text="4.2 m" />
        </>
      } />
  );
};

/** 2. The insert: your fingers through the bars; the earbud, a coin, someone's ring in a puddle. */
const Insert: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const drip = (f % 50) / 50;
  const back = (
    <g>
      <rect width={1920} height={1080} fill="#2a3442" />
      <ellipse cx={960} cy={720} rx={760} ry={260} fill="#3f5a6a" />
      <ellipse cx={960} cy={720} rx={drip * 360} ry={drip * 110} fill="none" stroke="#bfe3ee" strokeWidth={5} opacity={1 - drip} />
      {/* the earbud, the coin, someone's ring */}
      <g transform="translate(720 720) scale(2)"><ellipse rx={38} ry={30} fill="#f4f4f0" stroke="#111" strokeWidth={5} /><rect x={10} y={-8} width={60} height={18} rx={9} fill="#f4f4f0" stroke="#111" strokeWidth={5} /></g>
      <g transform="translate(1010 760) scale(2)"><ellipse rx={34} ry={20} fill="#e0b532" stroke="#111" strokeWidth={4} /></g>
      <g transform="translate(1250 700) scale(2)"><ellipse rx={30} ry={14} fill="none" stroke="#f2d06a" strokeWidth={9} /><circle cy={-12} r={9} fill="#bfe9ff" /><circle cy={-12} r={22 * (0.5 + 0.5 * Math.sin(f / 5))} fill="#ffffff" opacity={0.25} /></g>
    </g>
  );
  const bars = (
    <g>
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={60 + i * 340} y={0} width={44} height={1080} fill="#0b0d12" opacity={0.92} />)}
      {/* your fingers through the bars */}
      {[0, 1, 2].map((i) => <rect key={i} x={830 + i * 72} y={-60 + ease(f, 0, 30) * 220 + i * 18} width={56} height={300} rx={28} fill="#f2b632" stroke="#111" strokeWidth={5} />)}
    </g>
  );
  return <Set cam={push(f, d, { x: 960, y: 600, zoom: 1.0 }, { x: 960, y: 640, zoom: 1.12 })} back={back} actors={<g />} front={bars} />;
};

/** 3. The rule: you stand with the earbud; the line has gone. You whisper for the ring you can see: nothing. */
const Rule: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d, at } = local(shot);
  const try2 = at(9) - 50;
  const held: React.ReactNode = <ellipse rx={10} ry={8} fill="#f4f4f0" stroke="#111" strokeWidth={3} />;
  return (
    <Set cam={push(f, d, { x: 720, y: 520, zoom: 1.35 }, { x: 860, y: 560, zoom: 1.1 })}
      back={<PlatformBack f={f} glow={0.4} />}
      actors={
        <>
          <Dots frame={f} at={-40} dur={1} path={LINE} size={14} fadeAt={0} />
          <You f={f} x={HERO.x} y={HERO.y} s={HERO.s} pose={{ ...STAND, armF: [70, 40], tilt: 10 }} held={held}
            mouth={f > try2 ? "flat" : "smile"} brows={f > try2 ? "flat" : "raised"} look={{ x: 0.8, y: 0.7 }} lids={f > try2 ? 0.3 : 0} />
          <Bubble frame={f} at={try2} until={try2 + 50} x={HERO.x + 240} y={HERO.y - 800} text="The ring?" size={40} />
        </>
      } />
  );
};

/** 42. The last morning: the doors open; you step off, hands in pockets, no pats. */
const Morning: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const x = 300 + ease(f, 10, d) * 260;
  return (
    <Set cam={push(f, d, { x: 900, y: 560, zoom: 1.05 }, { x: 960, y: 540, zoom: 1.0 })}
      back={<PlatformBack f={f} train={1} morning />}
      actors={
        <>
          {[0, 1, 2].map((i) => <Extra key={i} i={i + 2} f={f} x={1200 + i * 220} y={1040} s={2.2} pose={walkPose(f / 6 + i)} facing={-1} />)}
          <You f={f} x={x} y={1062} s={3.3} pose={{ ...walkPose(f / 7), armF: [8, 100], armB: [-8, 100] }} mouth="smile" look={{ x: 0.6, y: 0 }} />
        </>
      } />
  );
};

/** 43. The key slides off a seat; you nudge it back with your toe. No whisper. */
const Key: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const slide = ease(f, 6, 26);
  const nudge = ease(f, 40, 60);
  const kx = 1000 + slide * 160 - nudge * 220;
  const back = (
    <g>
      <rect width={1920} height={1080} fill="#d9d2c2" />
      <rect y={760} width={1920} height={320} fill="#8f8a80" />
      <rect x={700} y={520} width={900} height={110} rx={20} fill="#3f6b8a" />
      <rect x={720} y={630} width={860} height={40} fill="#2c4d66" />
    </g>
  );
  return (
    <Set cam={push(f, d, { x: 1000, y: 760, zoom: 1.6 }, { x: 960, y: 700, zoom: 1.4 })} back={back}
      actors={
        <>
          <Extra i={1} f={f} x={1240} y={1000} s={2.2} pose={{ ...STAND, legB: [90, -80], legF: [90, -80], drop: 40 }} facing={-1} />
          <g transform={`translate(${kx} ${980})`}>
            <circle r={18} fill="none" stroke="#c9a33a" strokeWidth={7} />
            <rect x={14} y={-5} width={46} height={10} fill="#c9a33a" />
          </g>
          <You f={f} x={620} y={1060} s={2.6} pose={{ ...STAND, legF: [40 * nudge + 6, -8], armF: [8, 100], armB: [-8, 100] }} mouth="smile" look={{ x: 0.8, y: 0.6 }} />
        </>
      } />
  );
};

/** 44. The chai stall in the early light; you step over the grate; an old man sifts it. The right third stays quiet. */
const ChaiGrate: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { f, d } = local(shot);
  const x = 260 + ease(f, 0, d * 0.8) * 760;
  const back = (
    <g>
      <rect width={1920} height={1080} fill="#f0d9b0" />
      <rect y={700} width={1920} height={380} fill="#b8a98e" />
      {/* the chai stall */}
      <rect x={60} y={360} width={420} height={340} fill="#8a5a3a" stroke="#3b2a1f" strokeWidth={8} />
      <rect x={40} y={320} width={460} height={60} fill="#d8344f" />
      <rect x={160} y={520} width={60} height={80} rx={10} fill="#c0c0c0" />
      <circle cx={190} cy={480} r={18 + 6 * Math.sin(f / 9)} fill="#ffffff" opacity={0.35} />
      <Grate x={700} y={860} w={300} h={80} />
    </g>
  );
  return (
    <Set cam={push(f, d, { x: 760, y: 600, zoom: 1.15 }, { x: 860, y: 560, zoom: 1.05 })} back={back}
      actors={
        <>
          <Sifter f={f} x={1060} y={950} s={1.6} facing={-1} swirl={f / 8} />
          <You f={f} x={x} y={1000} s={2.4} pose={walkPose(f / 7)} mouth="smile" look={{ x: 0.7, y: 0.3 }} />
        </>
      } />
  );
};

export const platformScenes: Beat[] = [
  { id: "pats", after: -1, Component: Pats },
  { id: "line", after: 1, Component: LineAppears },
  { id: "insert", after: 3, Component: Insert },
  { id: "rule", after: 5, Component: Rule },
];
export const endScenes: Beat[] = [
  { id: "morning", after: 67, atLine: 68, Component: Morning },
  { id: "key", after: 68, Component: Key },
  { id: "chai", after: 69, Component: ChaiGrate },
];

export const _unused = { TEAL, GLOW, CROUCH };
