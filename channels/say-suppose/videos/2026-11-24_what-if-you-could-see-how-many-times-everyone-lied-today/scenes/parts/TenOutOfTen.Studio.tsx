// The TenOutOfTen beat's morning show in look C (plate `tv-morning`: the big screen behind the empty desk, the couch at
// the left, bar stools at the right, eye line at world y 497). Ten strangers in a row with a card each, four click;
// you point true or false; the board on the big screen fills, the host's ten against her floor team's five; her hand to
// her earpiece, "Ten out of ten"; then the rally on the big screen (the leader, nothing over his head) and next week's
// promo. Heads on screens carry nothing: counters only show in the room.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { Tag } from "@whatif/kit/ui/Tag";
import { HERO, PASTELS } from "../shared";
import { PlateScene } from "./Plate";
import { Body, headOf, talk } from "./SayItAgain.Kit";
import { counterLight, FgShoulder, onHead, scaleAt, shotAt, type Shot as Cam } from "./SayItAgain.LookC";
import type { TenCues } from "../beats/TenOutOfTen";

const H = 497;
const HOST = { head: "#f29bb8", coat: "#6d4b8f" } as const;
const LEADER = { head: "#8a96a3", coat: "#2f3a55" } as const;
const CHALLENGER = { head: "#c87533", coat: "#3d5a6c" } as const;
const RIVAL = { head: "#9cb89a", coat: "#f4f4ef" } as const;

const ROW_Y = 860;
const ROW_S = scaleAt(ROW_Y, H);
const STR = Array.from({ length: 10 }, (_, i) => ({ x: 520 + i * 104, head: PASTELS[(i * 3 + 1) % PASTELS.length], coat: ["#3d5a6c", "#5d6470", "#6b4b3a", "#2f3242"][i % 4] }));
/** The four who lie read when the script's four clicks land (clickData.ts). */
const LIARS = [0, 2, 4, 6];
const FLOOR_RIGHT = [true, false, true, false, false, true, true, false, false, true];
const HOST_AT = { x: 210, y: 1040, scale: scaleAt(1040, H) };
const YOU_AT = { x: 1770, y: 1060, scale: scaleAt(1060, H) };
/** The board, the rally and the promo are drawn at 900 x 400 and fitted to the painted big screen (world 674..1252 x
 *  274..678). In a tight insert on it the row in front is out of shot. */
const SCREEN = { left: 510, top: 130, w: 900, h: 400 };
const FIT = "translate(678 292) scale(0.63) translate(-510 -130)";
const INSERTS = ["board", "rally", "promo"];

const reads = (k: TenCues) => Array.from({ length: 10 }, (_, i) => k.clipE - 4 + i * 14);

const Board: React.FC<{ frame: number; k: TenCues }> = ({ frame, k }) => {
  const { left, top, w } = SCREEN;
  const done = reads(k).filter((t) => frame >= t + 10).length;
  return (
    <g>
      {[0, 1].map((row) => (
        <g key={row}>
          <circle cx={left + 70} cy={top + 120 + row * 150} r={34} fill={row === 0 ? MUSTARD : "#9aa1ab"} />
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
          <text x={left + w - 30} y={top + 140 + row * 150} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={64}
            fill={row === 0 ? MUSTARD : PAPER}>{row === 0 ? done : FLOOR_RIGHT.slice(0, done).filter(Boolean).length}</text>
        </g>
      ))}
    </g>
  );
};

const Rally: React.FC<{ frame: number; k: TenCues }> = ({ frame, k }) => {
  const { left, top, w } = SCREEN;
  return (
    <g>
      <rect x={left} y={top} width={w} height={400} fill="#ff9466" opacity={0.5} />
      <rect x={left} y={top + 280} width={w} height={120} fill="#5a4a6a" />
      {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={left + 30 + i * 58} cy={top + 360 + (i % 2) * 14} r={20} fill={PASTELS[i % 8]} opacity={0.8} />)}
      <g transform={`translate(${left + 360} ${top + 212}) scale(1.7) translate(${-(left + 360)} ${-(top + 212)})`}>
      <Figure x={left + 360} y={top + 480} scale={0.95} facing={1} pose={{ ...STAND, armF: [40, 30], armB: [165, 5] }} head={LEADER.head} coat={LEADER.coat}
        mouth={talk(frame, k.leader, k.leaderE, "smile")} brows="none" look={{ x: 0.6, y: 0 }} time={frame} />
      <path d={`M${left + 346} ${top + 280} L${left + 378} ${top + 368}`} stroke={CRIMSON} strokeWidth={16} strokeLinecap="round" />
      </g>
      <g transform={`translate(${left + 660} ${top + 240}) scale(1.5) translate(${-(left + 660)} ${-(top + 240)})`}>
        <Figure x={left + 660} y={top + 480} scale={0.85} facing={-1} pose={STAND} head={CHALLENGER.head} coat={CHALLENGER.coat}
          mouth="flat" brows="flat" lids={0.3} look={{ x: 0.8, y: 0 }} time={frame} />
      </g>
    </g>
  );
};

const Promo: React.FC<{ frame: number }> = ({ frame }) => {
  const { left, top } = SCREEN;
  return (
    <g>
      <circle cx={left + 300} cy={top + 200} r={220} fill="#ff7a3c" opacity={0.25} />
      <Figure x={left + 300} y={top + 560} scale={1.1} facing={1} pose={{ ...STAND, armF: [100, 60] }} head={RIVAL.head} coat={RIVAL.coat}
        mouth="smirk" brows="raised" look={{ x: 0.8, y: 0 }} time={frame} />
      <g transform={`translate(${left + 380} ${top + 250})`}>
        <rect x={0} y={-34} width={120} height={68} rx={10} fill="#2a2d36" stroke={INK} strokeWidth={4} />
        <circle cx={130} cy={0} r={22} fill="#3b3e47" stroke={INK} strokeWidth={4} />
        <circle cx={130} cy={0} r={10} fill="#ff7a3c" />
      </g>
      <g transform={`translate(${left + 680} ${top + 190})`}>
        <rect x={-120} y={-110} width={240} height={220} rx={10} fill="#1a0f3a" />
        <circle r={80} fill="#ff4a2a" /><circle r={52} fill="#ffb12a" /><circle cx={0} cy={6} r={20} fill="#fff1a0" />
      </g>
    </g>
  );
};

/** What the big screen shows: the scoreboard, the rally, or next week's promo. */
const Screen: React.FC<{ frame: number; k: TenCues; mode: "board" | "rally" | "promo" }> = ({ frame, k, mode }) => {
  const { left, top, w, h } = SCREEN;
  return (
    <g transform={FIT}>
      <clipPath id="ten-screen"><rect x={left} y={top} width={w} height={h} rx={6} /></clipPath>
      <g clipPath="url(#ten-screen)">
        <rect x={left} y={top} width={w} height={h} fill={mode === "promo" ? "#22314a" : "#1b2240"} />
        {mode === "board" && <Board frame={frame} k={k} />}
        {mode === "rally" && <Rally frame={frame} k={k} />}
        {mode === "promo" && <Promo frame={frame} />}
        <rect x={left} y={top + h - 40} width={w} height={40} fill={CRIMSON} />
        <circle cx={left + w - 40} cy={top + 40} r={16} fill={CRIMSON} opacity={Math.floor(frame / 15) % 2 ? 1 : 0.35} />
      </g>
    </g>
  );
};

function studioShots(k: TenCues): Cam[] {
  const host = headOf(HOST_AT.x, HOST_AT.y, HOST_AT.scale);
  const you = headOf(YOU_AT.x, YOU_AT.y, YOU_AT.scale, STAND, -1);
  const scr = { x: 962, y: 418 };
  return [
    { at: k.clipE, cam: { x: 960, y: 560, zoom: 1.02 }, to: { x: 960, y: 560, zoom: 1.07 } },
    { at: k.clipE + 40, cam: { x: 880, y: 470, zoom: 1.9 }, to: { x: 1230, y: 470, zoom: 1.95 }, name: "row" },
    { at: k.clipE + 92, cam: onHead(you, 0.15, 170), to: onHead(you, 0.16, 170), name: "you" },
    { at: k.clipE + 120, cam: { ...scr, zoom: 3.0 }, to: { ...scr, zoom: 3.1 }, name: "board" },
    { at: k.host - 4, cam: onHead(host, 0.15, -170), to: onHead(host, 0.16, -170), name: "host" },
    { at: k.hostE + 4, cam: onHead(you, 0.15, 170), to: onHead(you, 0.17, 170), name: "you" },
    { at: k.untrained + 72, cam: { x: 760, y: 560, zoom: 1.35 }, to: { x: 820, y: 560, zoom: 1.42 }, name: "two" },
    { at: k.untrained + 140, cam: onHead(host, 0.13, -170), to: onHead(host, 0.14, -170), name: "ots" },
    { at: k.leader - 4, cam: { ...scr, zoom: 3.0 }, to: { ...scr, zoom: 3.15 }, name: "rally" },
    { at: k.nothing, cam: onHead(you, 0.15, 170, 120), to: onHead(you, 0.17, 170, 120), name: "you" },
    { at: k.promo, cam: { ...scr, zoom: 3.0 }, to: { ...scr, zoom: 3.1 }, name: "promo" },
  ];
}

export const Studio: React.FC<{ frame: number; k: TenCues }> = ({ frame, k }) => {
  const read = reads(k);
  const turn = read.reduce((n, t) => (frame >= t ? n + 1 : n), 0) - 1;
  const mode = frame >= k.promo ? "promo" : frame >= k.leader - 4 ? "rally" : "board";
  const s = shotAt(frame, studioShots(k), k.end);
  const tgt = turn >= 0 && frame < k.host;
  const yes = tgt && !LIARS.includes(turn);
  const youPose: Pose = tgt ? { ...STAND, armF: [yes ? 120 : 70, yes ? -10 : 20] } : { ...STAND, armF: frame >= k.nothing && frame < k.promo ? [95, 15] : [9, 10] };
  const earpiece = frame >= read[9] && frame < k.untrained + 20;
  const hostPose: Pose = { ...STAND, armF: [70, 70], armB: earpiece ? [150, 120] : [-7, 8] };
  const hh = headOf(HOST_AT.x, HOST_AT.y, HOST_AT.scale, hostPose);
  return (
    <AbsoluteFill>
      <PlateScene plate="tv-morning" cam={drift(s.cam, frame, "studio", 2)} mood="day" rimFrom="left" lights={[counterLight(hh, "day", 0.25)]}
        actors={
          <>
            <Screen frame={frame} k={k} mode={mode} />
            {!INSERTS.includes(s.name) && STR.map((p, i) => {
              const reading = frame >= read[i] && frame < read[i] + 14;
              return (
                <Body key={i} x={p.x} y={ROW_Y} scale={ROW_S} facing={i % 2 ? -1 : 1} pose={{ ...STAND, armF: reading ? [130, 10] : [60, 50] }}
                  head={p.head} coat={p.coat} frame={frame} id={`str${i}`} size={(LIARS.includes(i) ? 28 : 22) * ROW_S} seed={i}
                  count={{ base: 0, ticks: LIARS.includes(i) ? [k.liarTicks[LIARS.indexOf(i)]] : [] }}
                  mouth={reading ? (Math.floor(frame / 4) % 2 ? "flat" : "open") : "flat"} look={{ x: 0.5, y: 0 }}
                  held={<rect x={-14} y={-20} width={28} height={36} rx={3} fill={PAPER} stroke={INK} strokeWidth={3} />} />
              );
            })}
            {!INSERTS.includes(s.name) && <Body {...HOST_AT} facing={1} pose={hostPose} head={HOST.head} coat={HOST.coat} frame={frame} id="host" count={{ base: 3 }} size={34 * HOST_AT.scale}
              mouth={talk(frame, k.host, k.hostE, frame >= k.hostE ? "o" : "smile")} brows={earpiece ? "raised" : "none"} eyes={earpiece ? 1.2 : 1}
              look={{ x: 1, y: 0 }} seed={4}
              held={<g><rect x={-6} y={-30} width={12} height={40} rx={4} fill="#2a2d36" /><circle cx={0} cy={-34} r={11} fill="#5c6675" stroke={INK} strokeWidth={3} /></g>} />}
            <path d={`M${hh.x - hh.r * 0.85} ${hh.y - 4} q-10 18 4 30`} fill="none" stroke="#2a2d36" strokeWidth={5} />
            <circle cx={hh.x - hh.r * 0.82} cy={hh.y - 4} r={7} fill="#2a2d36" />
            {s.name !== "ots" && !INSERTS.includes(s.name) && (
              <Body {...YOU_AT} facing={-1} pose={youPose} head={HERO.head} scarf={HERO.scarf} tuft frame={frame} id="you-studio"
                look={frame >= k.nothing && frame < k.promo ? { x: 0.3, y: -0.9 } : { x: 1, y: 0 }} brows="flat" lids={0.25} mouth="flat" />
            )}
          </>
        } />
      {s.name === "ots" && <FgShoulder x={1660} head={HERO.head} scarf={HERO.scarf} tuft />}
      {mode === "promo" && <Tag at={k.promo + 4} text="NEXT WEEK: THE MAN WHO READS NOSES" x={980} y={130} size={36} tilt={-2} />}
    </AbsoluteFill>
  );
};
