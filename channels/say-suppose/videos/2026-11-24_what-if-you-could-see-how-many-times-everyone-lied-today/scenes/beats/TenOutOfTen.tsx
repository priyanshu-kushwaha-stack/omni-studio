// Beat "Ten Out of Ten" (script.md ## [03:27]): Friday poker at a flat's kitchen table at night (bluffs click, the
// all-in clicks, you push your stack blind, he folds, the guest films), the lost watch (four heads, one click, a watch
// out of a coat pocket), the clip spinning on your phone and the morning show calling, then the studio by day: ten
// strangers, four clicks, the host's ten ticks against the floor team's five, "Ten out of ten", and the studio monitor
// (the leader and the challenger at a rally, then next week's promo). Heads on screens carry nothing: counters only
// show in the room.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, seatedY, STAND, type Pose } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { dining, phone, SetScene, tvStudio, type CastMember } from "@whatif/kit/sets";
import { Deep } from "@whatif/kit/sets/common";
import { Tag } from "@whatif/kit/ui/Tag";
import type { Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import { Counter } from "../parts/Counter";
import { Body, Chips, counterSpot, Handset, headOf, MoodStage, talk } from "../parts/SayItAgain.Kit";
import { camAt, current, HERO, linear, mix, PASTELS, ramp, type Beat, type Shot } from "../shared";

const GUEST = { head: "#9fc0e0", coat: "#c96f2d" } as const;
const TEARFUL = { head: "#e6c27a", coat: "#7fa0c4" } as const;
const HOST = { head: "#f29bb8", coat: "#6d4b8f" } as const;
const LEADER = { head: "#8a96a3", coat: "#2f3a55" } as const;
const CHALLENGER = { head: "#c87533", coat: "#3d5a6c" } as const;
const RIVAL = { head: "#9cb89a", coat: "#f4f4ef" } as const;

function cues(shot: Shot) {
  const { at, end } = shot;
  const poker = at("Friday. Poker night.");
  const allIn = at("Player: I've got a flush.");
  const allInE = end("Player: I've got a flush.");
  const quiet = at("Except the quiet one.");
  const aces = at("Quiet player: Pocket aces.");
  const acesE = end("Quiet player: Pocket aces.");
  const take = at("You take the table");
  const hold = (p: number) => Math.round(allInE + (quiet - allInE) * p);
  const aHold = (p: number) => Math.round(acesE + (take - acesE) * p);
  const glowE = end("A glow over a head");
  const watch = at("Someone's lost a watch");
  const wHold = (p: number) => Math.round(glowE + (watch - glowE) * p);
  const clipE = end("The clip's everywhere");
  const host = at("Host: Ten out of ten.");
  const sHold = (p: number) => Math.round(clipE + (host - clipE) * p);
  return {
    poker, bluffs: [0.42, 0.52, 0.62, 0.72, 0.82].map((p) => at("Friday. Poker night.", p)), allIn, allInE,
    clickAll: allInE + 4, push: [hold(0.12), hold(0.42)] as const, fold: hold(0.5), groan: hold(0.56), film: hold(0.66), take,
    quiet, aces, acesE, youFold: aHold(0.08), reveal: aHold(0.3), laugh: aHold(0.45), lose: [aHold(0.4), aHold(0.85)] as const,
    study: at("In one study of students"), police: at("Guest: Why not take"), policeE: end("Guest: Why not take"),
    glow: at("A glow over a head"), glowE, point: [0, 1, 2, 3].map((i) => wHold(0.04 + i * 0.22)), watch,
    pocket: at("Someone's lost a watch", 0.35), hand: at("Someone's lost a watch", 0.6),
    clip: at("The clip's everywhere"), calls: at("The clip's everywhere", 0.55), clipE,
    studio: clipE, sHold, host, hostE: end("Host: Ten out of ten."), untrained: at("Untrained, people"),
    leader: at("Leader: I have never"), leaderE: end("Leader: I have never"), nothing: at("Nothing over his head"),
    promo: at("Nothing over his head", 0.6), city: at("And tonight, the whole city"),
  };
}
type K = ReturnType<typeof cues>;

// ------------------------------------------------------------------------------------------------ poker night

const FAR = [
  { spot: "far1", x: 680, head: PASTELS[0], coat: "#3d5a6c", base: 2, facing: 1 as const },
  { spot: "far2", x: 860, head: PASTELS[1], coat: "#5d6470", base: 1, facing: -1 as const },
  { spot: "far3", x: 1040, head: PASTELS[2], coat: "#6b4b3a", base: 3, facing: 1 as const },
  { spot: "far4", x: 1220, head: PASTELS[4], coat: "#2f3242", base: 0, facing: -1 as const },
];
const SEAT_TOP = 850;
const TABLE_TOP = 790;
const PLAYER = { x: 1490, head: PASTELS[3], coat: "#4a5d3a", base: 2 };
const GUEST_AT = { x: 1730, y: 975, scale: 1.12 };

const Card: React.FC<{ x: number; y: number; rot?: number; face?: boolean }> = ({ x, y, rot = 0, face }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-14} y={-20} width={28} height={40} rx={4} fill={face ? PAPER : CRIMSON} stroke={INK} strokeWidth={3} />
    {face && <circle cx={0} cy={0} r={6} fill={CRIMSON} />}
  </g>
);

/** The rec frame of the guest's phone over the picture (screen space). */
const RecFrame: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <svg width={1920} height={1080}>
      {[[200, 180, 1, 1], [1720, 180, -1, 1], [200, 880, 1, -1], [1720, 880, -1, -1]].map(([x, y, sx, sy], i) => (
        <path key={i} d={`M${x} ${y + sy * 80} V${y} H${x + sx * 80}`} fill="none" stroke={PAPER} strokeWidth={8} />
      ))}
      <circle cx={1640} cy={240} r={16} fill={CRIMSON} opacity={Math.floor(frame / 12) % 2 ? 1 : 0.3} />
    </svg>
  </AbsoluteFill>
);

const Poker: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  const push = ramp(frame, k.push[0], k.push[1]);
  const folded = frame >= k.fold;
  const groan = frame >= k.groan && frame < k.quiet;
  const laugh = frame >= k.laugh && frame < k.take + 24;
  const aces = frame >= k.reveal;
  const youFolded = frame >= k.youFold && frame < k.take;
  const after = frame >= k.take;
  const cast: CastMember[] = FAR.map((p, i) => ({
    spot: p.spot, behind: true,
    who: { head: p.head, coat: p.coat, time: frame, blink: (frame + i * 31) % 97 < 4,
      mouth: i === 3 ? talk(frame, k.aces, k.acesE, aces ? "smirk" : "flat") : laugh ? "open" : groan ? "o" : after ? "frown" : i % 2 ? "smirk" : "flat",
      brows: laugh && i !== 3 ? "raised" : groan ? "raised" : after ? "angry" : "none",
      look: { x: 0.8, y: 0.15 } },
    pose: after ? { ...SEATED, armF: [20, 120], armB: [30, 110] } : { ...SEATED, armF: [60, 50] },
  }));
  const youX = 470;
  const youY = seatedY(SEAT_TOP + 10, 1.15);
  const youPose: Pose = { ...SEATED, armF: frame >= k.push[0] && frame < k.push[1] + 10 ? [mix(60, 92, push), mix(50, 10, push)] : [60, 50] };
  const pY = seatedY(SEAT_TOP + 10, 1.15);
  const filming = frame >= k.poker && frame < k.police;
  const cam = camAt(frame, [
    [k.poker - 9, { x: 1000, y: 600, zoom: 1.05 }], [k.allIn - 4, { x: 1250, y: 600, zoom: 1.45 }],
    [k.clickAll + 6, { x: 1250, y: 600, zoom: 1.5 }], [k.push[0], { x: 860, y: 640, zoom: 1.35 }],
    [k.film - 2, { x: 860, y: 640, zoom: 1.35 }], [k.film + 2, { x: 520, y: 640, zoom: 2.3 }], [k.quiet - 2, { x: 470, y: 640, zoom: 2.7 }],
    [k.quiet, { x: 1110, y: 620, zoom: 1.75 }], [k.acesE + 2, { x: 1110, y: 620, zoom: 1.8 }], [k.youFold, { x: 960, y: 640, zoom: 1.3 }],
    [k.take - 2, { x: 1000, y: 640, zoom: 1.35 }],
    [k.take, { x: 980, y: 620, zoom: 1.08 }], [k.study + 40, { x: 1060, y: 610, zoom: 1.2 }],
    [k.police - 2, { x: 1060, y: 610, zoom: 1.2 }], [k.police, { x: 1300, y: 600, zoom: 1.55 }],
    [k.glow, { x: 760, y: 620, zoom: 1.5 }],
  ]);
  // your stack slides to the middle; his cards fold in
  const stackX = after ? 620 : frame >= k.lose[0] ? mix(960, 1200, ramp(frame, k.lose[0], k.lose[1])) : mix(620, 960, push);
  const counters = FAR.map((p, i) => {
    const y = seatedY(SEAT_TOP, 1.05);
    const c = counterSpot(p.x, y, 1.05, SEATED, p.facing);
    return <Counter key={p.spot} x={c.x} y={c.y} base={p.base} ticks={i === 3 ? [] : [k.bluffs[i]]} frame={frame} size={58} id={`pk-${p.spot}`} />;
  });
  return (
    <>
      <SetScene set={dining} mood="night" frame={frame} cam={drift(cam, frame, "poker", 5)} options={{ food: 0, photo: false, fan: true }} cast={cast}
        actors={
          <>
            {counters}
            {/* the table's cards and chips */}
            {[700, 880, 1060, 1240].map((x, i) => <Card key={x} x={x + 20} y={TABLE_TOP - 22} rot={(i % 2 ? 8 : -6)} face={after} />)}
            {[650, 830, 1010, 1190].map((x, i) => <Chips key={x} x={x + 60} y={TABLE_TOP - 6} n={after ? 1 : 4 + (i % 3)} color={[TEAL, CRIMSON, MUSTARD][i % 3]} scale={0.8} />)}
            <Chips x={stackX} y={TABLE_TOP - 6} n={after ? 26 : 14} color={MUSTARD} scale={0.9} />
            {after && <Chips x={stackX + 46} y={TABLE_TOP - 6} n={20} color={TEAL} scale={0.9} />}
            {/* your cards, folded at once on "Pocket aces"; his two aces turned over */}
            <Card x={youFolded ? 880 : 600} y={TABLE_TOP - 22} rot={youFolded ? 70 : -8} />
            <Card x={youFolded ? 900 : 624} y={TABLE_TOP - 22} rot={youFolded ? 84 : 10} />
            {aces && frame < k.take && [1196, 1230].map((x, i) => (
              <g key={x} transform={`translate(${x} ${TABLE_TOP - 40}) rotate(${i ? 6 : -6})`}>
                <rect x={-20} y={-28} width={40} height={56} rx={5} fill={PAPER} stroke={INK} strokeWidth={3} />
                <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={CRIMSON}>A</text>
              </g>
            ))}
            <Card x={folded ? 1120 : 1400} y={TABLE_TOP - 22} rot={folded ? 80 : -10} />
            <Card x={folded ? 1140 : 1420} y={TABLE_TOP - 22} rot={folded ? 70 : 6} />
            <Body x={youX} y={youY} scale={1.15} facing={1} pose={youPose} head={HERO.head} scarf={HERO.scarf} tuft frame={frame} id="you-poker"
              look={frame >= k.glow ? { x: 1, y: -0.1 } : { x: 1, y: 0.1 }} mouth={after ? "smirk" : "flat"} lids={0.35}
              brows={frame >= k.glow ? "raised" : "flat"} />
            <Body x={PLAYER.x} y={pY} scale={1.15} facing={-1} pose={{ ...SEATED, armF: folded ? [40, 30] : [70, 40] }} head={PLAYER.head}
              coat={PLAYER.coat} frame={frame} id="player" count={{ base: PLAYER.base, ticks: [k.bluffs[4] - 6, k.clickAll] }}
              mouth={talk(frame, k.allIn, k.allInE, folded ? "frown" : "smirk")} brows={folded ? "sad" : "flat"} look={{ x: 1, y: 0 }} seed={5} />
            <Body {...GUEST_AT} facing={-1} pose={filming ? { ...STAND, armF: [118, 20] } : { ...STAND, armF: [40, 40] }} head={GUEST.head}
              coat={GUEST.coat} frame={frame} id="guest" count={{ base: 1 }} mouth={talk(frame, k.police, k.policeE, "smile")}
              look={{ x: 1, y: filming ? 0.05 : 0 }} held={<Handset scale={1.4} />} seed={9} />
          </>
        } />
      {frame >= k.film && frame < k.quiet && <RecFrame frame={frame} />}
    </>
  );
};

// ------------------------------------------------------------------------------------------------ the lost watch

const SUSPECTS = [
  { x: 980, head: PASTELS[0], coat: "#3d5a6c" },
  { x: 1190, head: PASTELS[1], coat: "#5d6470" },
  { x: 1400, head: PASTELS[4], coat: "#2f3242" },
  { x: 1610, head: PLAYER.head, coat: PLAYER.coat },
];

const Watch: React.FC = () => (
  <g>
    <rect x={-6} y={-26} width={12} height={52} rx={4} fill="#6b4b3a" />
    <circle r={16} fill="#d9a63a" stroke={INK} strokeWidth={3} />
    <circle r={10} fill={PAPER} />
    <path d="M0 0 V-7 M0 0 H5" stroke={INK} strokeWidth={2} />
  </g>
);

const LostWatch: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  const y = 985;
  const you = { x: 420, y, scale: 1.18 };
  const turn = k.point.reduce((n, p) => (frame >= p ? n + 1 : n), 0) - 1;
  const target = turn >= 0 ? SUSPECTS[turn] : null;
  const youPose: Pose = target && frame < k.watch + 10 ? { ...STAND, armF: [96, -4] } : { ...STAND };
  const handed = ramp(frame, k.hand, k.hand + 16);
  const cam = camAt(frame, [[k.glowE - 2, { x: 1000, y: 600, zoom: 1.05 }], [k.watch, { x: 1100, y: 600, zoom: 1.15 }],
    [k.pocket, { x: 1300, y: 640, zoom: 1.5 }]]);
  return (
    <SetScene set={dining} mood="night" frame={frame} cam={drift(cam, frame, "watch", 5)} options={{ food: 0, photo: false, fan: true }} cast={[]}
      actors={
        <>
          <Body x={you.x} y={you.y} scale={you.scale} pose={youPose} head={HERO.head} scarf={HERO.scarf} tuft frame={frame} id="you-watch"
            look={{ x: 1, y: 0 }} brows="flat" lids={0.3} mouth="flat" />
          <Body x={680} y={y} scale={1.1} facing={1} pose={{ ...STAND, armF: frame < k.hand ? [115, 20] : [70, 40] }} head={TEARFUL.head}
            coat={TEARFUL.coat} frame={frame} id="tearful" count={{ base: 0 }} brows={frame < k.hand ? "sad" : "raised"}
            mouth={frame < k.hand ? "wobble" : "smile"} lids={frame < k.hand ? 0.4 : 0} look={{ x: 1, y: 0 }} seed={3}
            held={frame >= k.hand + 16 ? <Watch /> : undefined} />
          {/* tears */}
          {frame < k.hand && (() => {
            const h = headOf(680, y, 1.1);
            const t = (frame % 30) / 30;
            return <circle cx={h.x + 18} cy={h.y + 6 + t * 30} r={6} fill="#9fd0ff" opacity={1 - t} />;
          })()}
          {SUSPECTS.map((s, i) => {
            const asked = frame >= k.point[i];
            const shake = asked && frame < k.point[i] + 18 ? Math.sin((frame - k.point[i]) / 2) * 10 : 0;
            const last = i === 3;
            const pocket = last && frame >= k.pocket;
            const pose: Pose = pocket
              ? { ...STAND, tilt: shake, armF: [mix(10, 75, ramp(frame, k.pocket, k.hand)), mix(10, 20, ramp(frame, k.pocket, k.hand))] }
              : { ...STAND, tilt: shake };
            return (
              <Body key={i} x={s.x} y={y} scale={1.0} facing={-1} pose={pose} head={s.head} coat={s.coat} frame={frame} id={`sus${i}`}
                count={{ base: 0, ticks: last ? [k.point[3] + 8] : [] }} brows={last && asked ? "worry" : "none"}
                mouth={last && asked ? "wobble" : "flat"} look={{ x: 1, y: 0 }} seed={i + 11}
                held={pocket && handed < 1 ? <Watch /> : undefined} />
            );
          })}
        </>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ the clip on your phone

/** The clip on the feed: you at the table, pointing, the fold; a view count spinning under it. Over the video area of the
 *  library phone (centre 1180, 560; video 1012..1348 x 300..720). No counters on a screen. */
const ClipOverlay: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  const views = Math.round(Math.pow(linear(frame, k.clip, k.calls), 2.2) * 4_812_000 + 1200 + (frame % 7) * 13);
  return (
    <g>
      <clipPath id="ten-clip"><rect x={1012} y={300} width={336} height={420} /></clipPath>
      <g clipPath="url(#ten-clip)">
        <rect x={1012} y={300} width={336} height={420} fill="#3a2f45" />
        <rect x={1012} y={600} width={336} height={120} fill="#8a5c3b" />
        <Figure x={1140} y={820} scale={1.25} facing={1} pose={{ ...STAND, armF: [100, 0] }} {...HERO} time={frame} lids={0.35} mouth="smirk" brows="flat"
          look={{ x: 1, y: 0 }} />
        <Chips x={1290} y={612} n={12} color={MUSTARD} scale={0.8} />
      </g>
      <rect x={1012} y={700} width={336 * ((frame % 240) / 240)} height={8} fill={CRIMSON} />
      <g transform="translate(1030 770)">
        <ellipse cx={14} cy={0} rx={16} ry={10} fill="none" stroke={PAPER} strokeWidth={4} />
        <circle cx={14} cy={0} r={4} fill={PAPER} />
        <text x={40} y={11} fontFamily={FONT} fontWeight={800} fontSize={32} fill={PAPER} style={{ fontVariantNumeric: "tabular-nums" }}>
          {views.toLocaleString("en-US")}
        </text>
      </g>
    </g>
  );
};

const Clip: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  const calling = frame >= k.calls;
  const cam = camAt(frame, [[k.clip - 2, { x: 1180, y: 520, zoom: 1.35 }], [k.calls, { x: 1180, y: 500, zoom: 1.5 }],
    [k.calls + 1, { x: 1100, y: 560, zoom: 1.15 }], [k.clipE, { x: 1150, y: 540, zoom: 1.25 }]]);
  return (
    <SetScene set={phone} mood="night" frame={frame} cam={cam}
      options={calling ? { mode: "call", contact: HOST.head, thumb: null, behind: "bedroom" } : { mode: "feed", thumb: 0.7, behind: "bedroom" }}
      cast={[{ spot: "face", who: { ...HERO, look: { x: 1, y: 0.2 }, time: frame }, face: { brows: calling ? "raised" : "flat", lids: calling ? 0 : 0.3, mouth: calling ? "o" : "flat", eyes: calling ? 1.2 : 1 }, behind: true }]}
      actors={!calling ? <ClipOverlay frame={frame} k={k} /> : undefined} />
  );
};

// ------------------------------------------------------------------------------------------------ the studio

const STR = Array.from({ length: 10 }, (_, i) => ({ x: 560 + i * 98, head: PASTELS[(i * 3 + 1) % PASTELS.length], coat: ["#3d5a6c", "#5d6470", "#6b4b3a", "#2f3242"][i % 4] }));
const LIARS = [1, 4, 6, 9];
const FLOOR_RIGHT = [true, false, true, false, false, true, true, false, false, true];
const STUDIO_FLOOR = 985;
const SCREEN = { left: 510, top: 130, w: 900, h: 400 };

/** What the big screen shows, drawn over the library screen: the scoreboard, the rally, or next week's promo. */
const Screen: React.FC<{ frame: number; k: K; mode: "board" | "rally" | "promo" }> = ({ frame, k, mode }) => {
  const { left, top, w, h } = SCREEN;
  const read = Array.from({ length: 10 }, (_, i) => k.sHold(0.06 + i * 0.088));
  const done = read.filter((t) => frame >= t + 10).length;
  return (
    <g>
      <rect x={left} y={top} width={w} height={h} fill="#1b2240" />
      {mode === "board" && (
        <g>
          {[0, 1].map((row) => (
            <g key={row}>
              <circle cx={left + 70} cy={top + 120 + row * 150} r={34} fill={row === 0 ? MUSTARD : "#9aa1ab"} />
              {row === 0 && <path d={`M${left + 52} ${top + 100} q18 -26 36 0`} fill={INK} />}
              {Array.from({ length: 10 }, (_, i) => {
                const shown = i < done;
                const ok = row === 0 ? true : FLOOR_RIGHT[i];
                return (
                  <g key={i} transform={`translate(${left + 150 + i * 62} ${top + 120 + row * 150})`}>
                    <rect x={-24} y={-30} width={48} height={60} rx={8} fill={shown ? (ok ? (row ? "#7fc29b" : MUSTARD) : "#3a4270") : "#262c52"} />
                    {shown && ok && <path d="M-12 0 l8 10 l16 -20" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />}
                    {shown && !ok && <path d="M-10 -10 l20 20 M10 -10 l-20 20" stroke={CRIMSON} strokeWidth={7} strokeLinecap="round" />}
                  </g>
                );
              })}
              <text x={left + w - 40} y={top + 140 + row * 150} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={64}
                fill={row === 0 ? MUSTARD : PAPER}>{row === 0 ? done : FLOOR_RIGHT.slice(0, done).filter(Boolean).length}</text>
            </g>
          ))}
        </g>
      )}
      {mode === "rally" && (
        <g>
          <clipPath id="ten-rally"><rect x={left} y={top} width={w} height={h} /></clipPath>
          <g clipPath="url(#ten-rally)">
            <rect x={left} y={top} width={w} height={h} fill="#ff9466" opacity={0.5} />
            <rect x={left} y={top + 280} width={w} height={120} fill="#5a4a6a" />
            {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={left + 30 + i * 58} cy={top + 360 + (i % 2) * 14} r={20} fill={PASTELS[i % 8]} opacity={0.8} />)}
            <Figure x={left + 360} y={top + 480} scale={0.95} facing={1} pose={{ ...STAND, armF: [40, 30], armB: [165, 5] }} head={LEADER.head} coat={LEADER.coat}
              mouth={talk(frame, k.leader, k.leaderE, "smile")} brows="none" look={{ x: 0.6, y: 0 }} time={frame} />
            <path d={`M${left + 346} ${top + 280} L${left + 378} ${top + 368}`} stroke={CRIMSON} strokeWidth={16} strokeLinecap="round" />
            <Figure x={left + 640} y={top + 480} scale={0.85} facing={-1} pose={STAND} head={CHALLENGER.head} coat={CHALLENGER.coat}
              mouth="flat" brows="flat" lids={0.3} look={{ x: 0.8, y: 0 }} time={frame} />
          </g>
        </g>
      )}
      {mode === "promo" && (
        <g>
          <clipPath id="ten-promo"><rect x={left} y={top} width={w} height={h} /></clipPath>
          <g clipPath="url(#ten-promo)">
            <rect x={left} y={top} width={w} height={h} fill="#22314a" />
            <circle cx={left + 300} cy={top + 200} r={220} fill="#ff7a3c" opacity={0.25} />
            <Figure x={left + 300} y={top + 560} scale={1.1} facing={1} pose={{ ...STAND, armF: [100, 60] }} head={RIVAL.head} coat={RIVAL.coat}
              mouth="smirk" brows="raised" look={{ x: 0.8, y: 0 }} time={frame} />
            {/* the thermal camera on his shoulder */}
            <g transform={`translate(${left + 380} ${top + 250})`}>
              <rect x={0} y={-34} width={120} height={68} rx={10} fill="#2a2d36" stroke={INK} strokeWidth={4} />
              <circle cx={130} cy={0} r={22} fill="#3b3e47" stroke={INK} strokeWidth={4} />
              <circle cx={130} cy={0} r={10} fill="#ff7a3c" />
            </g>
            {/* his screen: a face in heat colours */}
            <g transform={`translate(${left + 680} ${top + 190})`}>
              <rect x={-120} y={-110} width={240} height={220} rx={10} fill="#1a0f3a" />
              <circle r={80} fill="#ff4a2a" /><circle r={52} fill="#ffb12a" /><circle cx={0} cy={6} r={20} fill="#fff1a0" />
            </g>
          </g>
        </g>
      )}
      <rect x={left} y={top + h - 40} width={w} height={40} fill={CRIMSON} />
      <circle cx={left + w - 40} cy={top + 40} r={16} fill={CRIMSON} opacity={Math.floor(frame / 15) % 2 ? 1 : 0.35} />
    </g>
  );
};

const Studio: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  const read = Array.from({ length: 10 }, (_, i) => k.sHold(0.06 + i * 0.088));
  const turn = read.reduce((n, t) => (frame >= t ? n + 1 : n), 0) - 1;
  const mode = frame >= k.promo ? "promo" : frame >= k.leader - 4 ? "rally" : "board";
  const tvProps = { cam: { x: 960, y: 540, zoom: 1 }, mood: "day" as const, frame, options: { ...tvStudio.defaults, live: true } };
  const cam: Camera = camAt(frame, [
    [k.studio, { x: 960, y: 600, zoom: 1.0 }], [k.host - 20, { x: 1000, y: 580, zoom: 1.08 }],
    [k.host - 2, { x: 1000, y: 580, zoom: 1.08 }], [k.host, { x: 420, y: 640, zoom: 1.9 }],
    [k.untrained - 2, { x: 420, y: 640, zoom: 1.95 }], [k.untrained, { x: 960, y: 560, zoom: 1.02 }],
    [k.leader - 6, { x: 960, y: 520, zoom: 1.1 }], [k.leader + 8, { x: 960, y: 340, zoom: 1.85 }],
    [k.nothing, { x: 960, y: 350, zoom: 1.8 }], [k.nothing + 30, { x: 1100, y: 560, zoom: 1.15 }],
    [k.promo, { x: 960, y: 360, zoom: 1.7 }], [k.city + 40, { x: 960, y: 380, zoom: 1.55 }],
  ]);
  const tv = { ...tvProps, cam };
  const you = { x: 1640, y: STUDIO_FLOOR, scale: 1.15 };
  const tgt = turn >= 0 && frame < k.host ? STR[turn] : null;
  const yes = tgt ? !LIARS.includes(turn) : true;
  const youPose: Pose = tgt ? { ...STAND, armF: [yes ? 120 : 70, yes ? -10 : 20] } : { ...STAND, armF: frame >= k.nothing && frame < k.promo ? [150, 10] : [9, 10] };
  const earpiece = frame >= k.sHold(0.9) && frame < k.untrained + 20;
  const hostPose: Pose = { ...STAND, armF: [70, 70], armB: earpiece ? [150, 120] : [-7, 8] };
  const hh = headOf(330, STUDIO_FLOOR, 1.1, hostPose);
  return (
    <>
      <MoodStage mood="day" cam={drift(cam, frame, "studio", 4)}
        back={<>{tvStudio.Back(tv)}<Deep cam={cam} depth={0.9}><Screen frame={frame} k={k} mode={mode} /></Deep></>}
        actors={
          <>
            {STR.map((s, i) => {
              const reading = frame >= read[i] && frame < read[i] + 22;
              return (
                <Body key={i} x={s.x} y={STUDIO_FLOOR} scale={0.62} facing={i % 2 ? -1 : 1} pose={{ ...STAND, armF: reading ? [130, 10] : [60, 50] }}
                  head={s.head} coat={s.coat} frame={frame} id={`str${i}`} size={34}
                  count={{ base: 0, ticks: LIARS.includes(i) ? [read[i] + 8] : [] }}
                  mouth={reading ? (Math.floor(frame / 5) % 3 === 2 ? "flat" : "open") : "flat"} look={{ x: 0.5, y: 0 }} seed={i}
                  held={<rect x={-14} y={-20} width={28} height={36} rx={3} fill={PAPER} stroke={INK} strokeWidth={3} />} />
              );
            })}
            <Body x={330} y={STUDIO_FLOOR} scale={1.1} facing={1} pose={hostPose} head={HOST.head} coat={HOST.coat} frame={frame} id="host"
              count={{ base: 3 }} mouth={talk(frame, k.host, k.hostE, frame >= k.hostE ? "o" : "smile")}
              brows={earpiece ? "raised" : "none"} eyes={earpiece ? 1.2 : 1} look={{ x: 1, y: 0 }} seed={4}
              held={<g><rect x={-6} y={-30} width={12} height={40} rx={4} fill="#2a2d36" /><circle cx={0} cy={-34} r={11} fill="#5c6675" stroke={INK} strokeWidth={3} /></g>} />
            {/* her earpiece */}
            <path d={`M${hh.x - hh.r * 0.85} ${hh.y - 4} q-10 18 4 30`} fill="none" stroke="#2a2d36" strokeWidth={5} />
            <circle cx={hh.x - hh.r * 0.82} cy={hh.y - 4} r={7} fill="#2a2d36" />
            <Body {...you} facing={-1} pose={youPose} head={HERO.head} scarf={HERO.scarf} tuft frame={frame} id="you-studio"
              look={frame >= k.nothing && frame < k.promo ? { x: 0.3, y: -0.9 } : { x: 1, y: 0 }} brows="flat" lids={0.25} mouth="flat" />
          </>
        } />
      {mode === "promo" && <Tag at={k.promo + 4} text="NEXT WEEK: THE MAN WHO READS NOSES" x={330} y={140} size={50} tilt={-2} />}
    </>
  );
};

const Component: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = cues(shot);
  const f = shot.frame;
  const on = current(f, [[shot.from, "poker"], [k.glowE, "watch"], [k.clip - 2, "clip"], [k.studio, "studio"]] as [number, "poker" | "watch" | "clip" | "studio"][]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {on === "poker" && <Poker frame={f} k={k} />}
      {on === "watch" && <LostWatch frame={f} k={k} />}
      {on === "clip" && <Clip frame={f} k={k} />}
      {on === "studio" && <Studio frame={f} k={k} />}
    </AbsoluteFill>
  );
};

export const tenOutOfTen: Beat = { id: "TenOutOfTen", first: "Friday. Poker night.", lead: 0.3, Component };
