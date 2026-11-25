// The TenOutOfTen beat's party scenes in look C (plate `party-night`). The lost watch: a tearful guest holds up a bare
// wrist, you point at four people standing by the counters in turn, three shake their heads on zeros, the fourth shakes
// his and clicks, and holds a watch out of his coat pocket. The clip of your face on a phone held up against the
// blurred kitchen, a view count spinning under it, then the morning show calling. And the guest's phone rec frame.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { HERO, linear, mix, PASTELS, ramp } from "../shared";
import { PlateScene } from "./Plate";
import { Body, Chips, headOf } from "./SayItAgain.Kit";
import { counterLight, HeldPhone, onHead, scaleAt, shotAt, type Shot as Cam } from "./SayItAgain.LookC";
import type { TenCues } from "../beats/TenOutOfTen";

const H = 345;

/** The rec frame of the guest's phone over the picture (screen space). */
export const RecFrame: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <svg width={1920} height={1080}>
      {[[200, 180, 1, 1], [1720, 180, -1, 1], [200, 880, 1, -1], [1720, 880, -1, -1]].map(([x, y, sx, sy], i) => (
        <path key={i} d={`M${x} ${y + sy * 80} V${y} H${x + sx * 80}`} fill="none" stroke={PAPER} strokeWidth={8} />
      ))}
      <circle cx={1640} cy={240} r={16} fill={CRIMSON} opacity={Math.floor(frame / 12) % 2 ? 1 : 0.3} />
    </svg>
  </AbsoluteFill>
);

// ------------------------------------------------------------------------------------------------ the lost watch

const at = (x: number, y: number) => ({ x, y, scale: scaleAt(y, H) });
const TEARFUL = { ...at(300, 1090), head: "#e6c27a", coat: "#7fa0c4" };
const YOU = at(760, 1130);
const SUSPECTS = [
  { ...at(1300, 900), head: PASTELS[0], coat: "#3d5a6c" },
  { ...at(1500, 920), head: PASTELS[1], coat: "#5d6470" },
  { ...at(1700, 940), head: PASTELS[4], coat: "#2f3242" },
  { ...at(1900, 960), head: PASTELS[3], coat: "#4a5d3a" },
];

const Watch: React.FC = () => (
  <g>
    <rect x={-6} y={-26} width={12} height={52} rx={4} fill="#6b4b3a" />
    <circle r={16} fill="#d9a63a" stroke={INK} strokeWidth={3} />
    <circle r={10} fill={PAPER} />
    <path d="M0 0 V-7 M0 0 H5" stroke={INK} strokeWidth={2} />
  </g>
);

function watchShots(k: TenCues): Cam[] {
  const t = headOf(TEARFUL.x, TEARFUL.y, TEARFUL.scale);
  const s4 = headOf(SUSPECTS[3].x, SUSPECTS[3].y, SUSPECTS[3].scale, STAND, -1);
  const you = headOf(YOU.x, YOU.y, YOU.scale);
  return [
    { at: k.glow - 6, cam: { x: 960, y: 560, zoom: 1.02 }, to: { x: 980, y: 560, zoom: 1.08 } },
    { at: k.glow + 64, cam: onHead(t, 0.14, 170), to: onHead(t, 0.15, 170), name: "tearful" },
    { at: k.glowE, cam: { x: 1420, y: 450, zoom: 1.6 }, to: { x: 1720, y: 450, zoom: 1.65 }, name: "pan" },
    { at: k.tick4 - 8, cam: onHead(s4, 0.15, -60, 150), to: onHead(s4, 0.16, -60, 150), name: "s4" },
    { at: k.tick4 + 22, cam: onHead(you, 0.15, -170), to: onHead(you, 0.16, -170), name: "you" },
    { at: k.pocket - 6, cam: { x: 1640, y: 480, zoom: 1.45 }, to: { x: 1620, y: 480, zoom: 1.5 }, name: "pocket" },
  ];
}

export const LostWatch: React.FC<{ frame: number; k: TenCues }> = ({ frame, k }) => {
  const s = shotAt(frame, watchShots(k), k.clip);
  const turn = k.point.reduce((n, p) => (frame >= p ? n + 1 : n), 0) - 1;
  const youPose: Pose = turn >= 0 && frame < k.watch + 10 ? { ...STAND, armF: [96, -4] } : STAND;
  const handed = ramp(frame, k.hand, k.hand + 16);
  const s4 = SUSPECTS[3];
  return (
    <PlateScene plate="party-night" cam={drift(s.cam, frame, "watch", 3)} mood="night" rimFrom="right"
      lights={[counterLight(headOf(s4.x, s4.y, s4.scale, STAND, -1), "night", 0.3)]}
      actors={
        <>
          {SUSPECTS.map((p, i) => {
            const asked = frame >= k.point[i];
            const shake = asked && frame < k.point[i] + 18 ? Math.sin((frame - k.point[i]) / 2) * 10 : 0;
            const last = i === 3;
            const pocket = last && frame >= k.pocket;
            const pose: Pose = pocket
              ? { ...STAND, tilt: shake, armF: [mix(10, 75, ramp(frame, k.pocket, k.hand)), mix(10, 20, ramp(frame, k.pocket, k.hand))] }
              : { ...STAND, tilt: shake };
            return (
              <Body key={i} x={p.x} y={p.y} scale={p.scale} facing={-1} pose={pose} head={p.head} coat={p.coat} frame={frame} id={`sus${i}`}
                count={{ base: 0, ticks: last ? [k.tick4] : [] }} size={34 * p.scale} brows={last && asked ? "worry" : "none"}
                mouth={last && asked ? "wobble" : "flat"} look={{ x: 1, y: 0 }} seed={i + 11} held={pocket && handed < 1 ? <Watch /> : undefined} />
            );
          })}
          <Body {...TEARFUL} facing={1} pose={{ ...STAND, armF: frame < k.hand ? [115, 20] : [70, 40] }} frame={frame} id="tearful"
            count={{ base: 0 }} size={34 * TEARFUL.scale} brows={frame < k.hand ? "sad" : "raised"} mouth={frame < k.hand ? "wobble" : "smile"}
            lids={frame < k.hand ? 0.4 : 0} look={{ x: 1, y: 0 }} seed={3} held={frame >= k.hand + 16 ? <Watch /> : undefined} />
          {frame < k.hand && (() => {
            const h = headOf(TEARFUL.x, TEARFUL.y, TEARFUL.scale);
            const t = (frame % 30) / 30;
            return <circle cx={h.x + h.r * 0.4} cy={h.y + h.r * 0.15 + t * h.r * 0.6} r={h.r * 0.1} fill="#9fd0ff" opacity={1 - t} />;
          })()}
          {s.name !== "s4" && s.name !== "tearful" && (
            <Body x={YOU.x} y={YOU.y} scale={YOU.scale} pose={youPose} head={HERO.head} scarf={HERO.scarf} tuft frame={frame} id="you-watch"
              look={{ x: 1, y: 0 }} brows="flat" lids={0.3} mouth="flat" />
          )}
        </>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ the clip on your phone

const HOST_HEAD = "#f29bb8";

/** The feed: you at the table, the fold; a view count spinning under it. Phone screen units 336 x 560. */
const Feed: React.FC<{ frame: number; k: TenCues }> = ({ frame, k }) => {
  const views = Math.round(Math.pow(linear(frame, k.clip, k.calls), 2.2) * 4_812_000 + 1200 + (frame % 7) * 13);
  return (
    <g>
      <rect width={336} height={560} fill="#14151c" />
      <clipPath id="ten-feed"><rect y={50} width={336} height={400} /></clipPath>
      <g clipPath="url(#ten-feed)">
        <rect y={50} width={336} height={400} fill="#3a2f45" />
        <rect y={330} width={336} height={120} fill="#8a5c3b" />
        <Figure x={120} y={560} scale={1.3} facing={1} pose={{ ...STAND, armF: [100, 0] }} {...HERO} time={frame} lids={0.35} mouth="smirk" brows="flat" look={{ x: 1, y: 0 }} />
        <Chips x={270} y={340} n={12} color={MUSTARD} scale={0.8} />
      </g>
      <rect y={440} width={336 * ((frame % 240) / 240)} height={8} fill={CRIMSON} />
      <ellipse cx={34} cy={490} rx={16} ry={10} fill="none" stroke={PAPER} strokeWidth={4} />
      <circle cx={34} cy={490} r={4} fill={PAPER} />
      <text x={60} y={501} fontFamily={FONT} fontWeight={800} fontSize={30} fill={PAPER} style={{ fontVariantNumeric: "tabular-nums" }}>{views.toLocaleString("en-US")}</text>
    </g>
  );
};

/** An incoming call: the host's pink head, rings round it, answer and decline. */
const Call: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <rect width={336} height={560} fill="#2a2440" />
    {[0, 1, 2].map((i) => {
      const t = ((frame / 30 + i / 3) % 1);
      return <circle key={i} cx={168} cy={210} r={70 + t * 90} fill="none" stroke={HOST_HEAD} strokeWidth={4} opacity={1 - t} />;
    })}
    <circle cx={168} cy={210} r={70} fill={HOST_HEAD} stroke={INK} strokeWidth={4} />
    <circle cx={150} cy={202} r={7} fill={INK} /><circle cx={186} cy={202} r={7} fill={INK} />
    <path d="M150 232 Q168 248 186 232" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <circle cx={90} cy={470} r={34} fill={CRIMSON} /><circle cx={246} cy={470} r={34} fill="#3fbf7f" />
  </g>
);

export const Clip: React.FC<{ frame: number; k: TenCues }> = ({ frame, k }) => {
  const calling = frame >= k.calls;
  const buzz = calling && (frame - k.calls) % 24 < 8 ? Math.sin(frame * 2.4) * 6 : 0;
  const zoom = mix(1.0, 1.1, ramp(frame, k.clip, k.clipE));
  return (
    <PlateScene plate="party-night" cam={{ x: 960, y: 540, zoom }} mood="night" blur={24} rimFrom="right"
      actors={<HeldPhone x={960 + buzz} y={590} s={0.95} skin={HERO.head} id="ten-phone">{calling ? <Call frame={frame} /> : <Feed frame={frame} k={k} />}</HeldPhone>} />
  );
};
