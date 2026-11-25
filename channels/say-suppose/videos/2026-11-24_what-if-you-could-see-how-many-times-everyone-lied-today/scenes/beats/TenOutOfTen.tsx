// Beat "Ten Out of Ten" (script.md ## [02:50]). Look C (owner, 2026-11-25): painted plates, our cast, close-ups.
// Friday poker at a flat's kitchen table at night (plate `party-night`: the round table under the lamp, the chairs and
// the chips on it painted): bluffs click on the far players, over your shoulder at "I've got a flush", click; close on
// you pushing your stack in blind; he folds; the guest's phone closes on your face; the quiet one's "Pocket aces", no
// click, you fold at once. Then the lost watch and the clip on your phone (parts/TenOutOfTen.Party.tsx), and the
// morning show (plate `tv-morning`, parts/TenOutOfTen.Studio.tsx).
import { AbsoluteFill } from "remotion";
import { SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER, TEAL } from "@whatif/kit/theme";
import { drift } from "@whatif/kit/stage/shots";
import { current, HERO, mix, PASTELS, ramp, type Beat, type Shot } from "../shared";
import { PlateScene } from "../parts/Plate";
import { Body, Chips, Handset, headOf, talk } from "../parts/SayItAgain.Kit";
import { counterLight, Cut, FgShoulder, onHead, seatByHead, shotAt, type Shot as Cam } from "../parts/SayItAgain.LookC";
import { Clip, LostWatch, RecFrame } from "../parts/TenOutOfTen.Party";
import { Studio } from "../parts/TenOutOfTen.Studio";

function cues(shot: Shot) {
  const { at, end } = shot;
  const allInE = end("Player: I've got a flush.");
  const quiet = at("Except the quiet one.");
  const acesE = end("Quiet player: Pocket aces.");
  const take = at("You take the table");
  const hold = (p: number) => Math.round(allInE + (quiet - allInE) * p);
  const aHold = (p: number) => Math.round(acesE + (take - acesE) * p);
  const glowE = end("A glow over a head");
  const clipE = end("The clip's everywhere");
  return {
    from: shot.from, end: shot.to, poker: at("Poker night."), bluffs: [0.34, 0.46, 0.58, 0.7, 0.82].map((p) => at("Poker night.", p)),
    allIn: at("Player: I've got a flush."), allInE,
    // the script's clicks (clickData.ts): 0.2 s after the flush; 2.07 s after "A glow over a head"; four in the studio
    clickAll: allInE + 6, push: [hold(0.12), hold(0.42)] as const, fold: hold(0.5), groan: hold(0.56), film: hold(0.66), take,
    quiet, aces: at("Quiet player: Pocket aces."), acesE, youFold: aHold(0.08), reveal: aHold(0.3), laugh: aHold(0.45),
    rake: at("You take the table", 0.6), police: at("Guest: Why not take"), policeE: end("Guest: Why not take"),
    glow: at("A glow over a head"), glowE, point: [4, 22, 40, 56].map((d) => glowE + d), tick4: glowE + 62, watch: at("Four questions. One click."),
    pocket: at("Four questions. One click.", 0.35), hand: at("Four questions. One click.", 0.6),
    clip: at("The clip's everywhere"), calls: at("The clip's everywhere", 0.55), clipE,
    liarTicks: [0.2, 1.07, 1.95, 2.83].map((s) => Math.round(clipE + s * 30)),
    host: at("Host: Ten out of ten."), hostE: end("Host: Ten out of ten."), untrained: at("Untrained, people"),
    leader: at("Leader: I have never"), leaderE: end("Leader: I have never"), nothing: at("Nothing over his head"),
    promo: at("Nothing over his head", 0.6), city: at("So tonight, you go"),
  };
}
export type TenCues = ReturnType<typeof cues>;

// ------------------------------------------------------------------------------------------------ poker night

/** The far players behind the table (head centres; the table's far edge at y 660 hides them below it). */
const FAR = [
  { x: 720, head: PASTELS[0], coat: "#3d5a6c", base: 2, facing: 1 as const },
  { x: 880, head: PASTELS[1], coat: "#5d6470", base: 1, facing: -1 as const },
  { x: 1040, head: PASTELS[2], coat: "#6b4b3a", base: 3, facing: 1 as const },
  { x: 1195, head: PASTELS[4], coat: "#2f3242", base: 0, facing: -1 as const },
];
const FAR_HEAD_Y = 525;
const FAR_S = 1.4;
const TABLE_FAR = 662;
const TABLE_TOP = 712;
const YOU_SEAT = { x: 500, seat: 826, scale: 1.9 };
const PLAYER = { x: 1395, seat: 832, scale: 1.8, head: PASTELS[3], coat: "#4a5d3a", base: 2 };
export const GUEST = { x: 1770, y: 1000, scale: 2.26, head: "#9fc0e0", coat: "#c96f2d" };

const Card: React.FC<{ x: number; y: number; rot?: number; face?: boolean; ace?: boolean }> = ({ x, y, rot = 0, face, ace }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-16} y={-23} width={32} height={46} rx={4} fill={face || ace ? PAPER : CRIMSON} stroke={INK} strokeWidth={3} />
    {ace && <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill={CRIMSON}>A</text>}
  </g>
);

const farHead = (i: number) => ({ x: FAR[i].x, y: FAR_HEAD_Y, r: 46 * FAR_S });
const youHead = () => headOf(YOU_SEAT.x, YOU_SEAT.seat + 112 * YOU_SEAT.scale, YOU_SEAT.scale, SEATED, 1);
const playerHead = () => headOf(PLAYER.x, PLAYER.seat + 112 * PLAYER.scale, PLAYER.scale, SEATED, -1);

function pokerShots(k: TenCues): Cam[] {
  const you = youHead();
  const pl = playerHead();
  const q = farHead(3);
  const gh = headOf(GUEST.x, GUEST.y, GUEST.scale, STAND, -1);
  return [
    { at: k.from, cam: { x: 960, y: 560, zoom: 1.02 }, to: { x: 960, y: 560, zoom: 1.08 } },
    { at: k.poker + 52, cam: { x: 900, y: 470, zoom: 1.85 }, to: { x: 940, y: 470, zoom: 1.95 }, name: "far" },
    { at: k.allIn - 4, cam: onHead(pl, 0.14, 130), to: onHead(pl, 0.15, 130), name: "ots" },
    { at: k.clickAll + 4, cam: onHead(you, 0.15, -170), to: onHead(you, 0.16, -170), name: "you" },
    { at: k.fold - 2, cam: onHead(pl, 0.12, 60), to: onHead(pl, 0.125, 60), name: "fold" },
    { at: k.film, cam: onHead(you, 0.17, -60), to: onHead(you, 0.21, -60), name: "film" },
    { at: k.quiet, cam: onHead(q, 0.15, 0, 140), to: onHead(q, 0.16, 0, 140), name: "quiet" },
    { at: k.aces - 4, cam: onHead(q, 0.17, -120, 120), to: onHead(q, 0.18, -120, 120), name: "aces" },
    { at: k.youFold, cam: onHead(you, 0.16, -150), to: onHead(you, 0.17, -150), name: "you" },
    { at: k.laugh, cam: { x: 1000, y: 560, zoom: 1.6 }, to: { x: 1000, y: 560, zoom: 1.66 }, name: "laugh" },
    { at: k.take, cam: { x: 960, y: 580, zoom: 1.15 }, to: { x: 960, y: 580, zoom: 1.22 }, name: "take" },
    { at: k.rake, cam: onHead(you, 0.15, -170), to: onHead(you, 0.165, -170), name: "you" },
    { at: k.police - 4, cam: onHead(gh, 0.16, -170), to: onHead(gh, 0.17, -170), name: "guest" },
  ];
}

/** The table's chips and cards. */
const TableProps: React.FC<{ frame: number; k: TenCues }> = ({ frame, k }) => {
  const push = ramp(frame, k.push[0], k.push[1]);
  const after = frame >= k.take;
  const folded = frame >= k.fold;
  const youFolded = frame >= k.youFold && frame < k.take;
  const stackX = after ? 640 : frame >= k.reveal ? mix(866, 1120, ramp(frame, k.reveal, k.laugh)) : mix(640, 866, push);
  return (
    <g>
      <Chips x={stackX} y={TABLE_TOP + 20} n={after ? 26 : 14} color={MUSTARD} scale={0.9} />
      {after && <Chips x={stackX + 46} y={TABLE_TOP + 20} n={20} color={TEAL} scale={0.9} />}
      <Card x={youFolded ? 840 : 700} y={TABLE_TOP} rot={youFolded ? 70 : -8} />
      <Card x={youFolded ? 862 : 726} y={TABLE_TOP} rot={youFolded ? 84 : 10} />
      {frame >= k.reveal && frame < k.take && <><Card x={1120} y={TABLE_TOP - 18} rot={-6} ace /><Card x={1152} y={TABLE_TOP - 18} rot={6} ace /></>}
      <Card x={folded ? 1000 : 1200} y={TABLE_TOP + 6} rot={folded ? 80 : -10} />
      <Card x={folded ? 1020 : 1224} y={TABLE_TOP + 6} rot={folded ? 70 : 6} />
    </g>
  );
};

const FarPlayers: React.FC<{ frame: number; k: TenCues }> = ({ frame, k }) => {
  const groan = frame >= k.groan && frame < k.quiet;
  const laugh = frame >= k.laugh && frame < k.take + 24;
  const after = frame >= k.take;
  return (
    <Cut y={TABLE_FAR} id="far">
      {FAR.map((p, i) => {
        const pose: Pose = after ? { ...SEATED, armF: [20, 120], armB: [30, 110] } : { ...SEATED, armF: [60, 50] };
        const at = seatByHead(p.x, FAR_HEAD_Y, FAR_S, pose, p.facing);
        const quiet = i === 3;
        return (
          <Body key={i} x={at.x} y={at.y} scale={FAR_S} facing={p.facing} pose={pose} head={p.head} coat={p.coat} frame={frame} id={`pk${i}`}
            count={{ base: p.base, ticks: quiet ? [] : [k.bluffs[i]] }} size={34 * FAR_S} seed={i * 3}
            mouth={quiet ? talk(frame, k.aces, k.acesE, frame >= k.reveal ? "smirk" : "flat") : laugh ? "open" : groan ? "o" : after ? "frown" : i % 2 ? "smirk" : "flat"}
            brows={laugh && !quiet ? "raised" : groan ? "raised" : after ? "angry" : "none"} look={{ x: 0.8, y: 0.15 }} />
        );
      })}
    </Cut>
  );
};

const Poker: React.FC<{ frame: number; k: TenCues }> = ({ frame, k }) => {
  const s = shotAt(frame, pokerShots(k), k.glow);
  const push = ramp(frame, k.push[0], k.push[1]);
  const folded = frame >= k.fold;
  const after = frame >= k.take;
  const pushing = frame >= k.push[0] && frame < k.push[1] + 10;
  const youPose: Pose = { ...SEATED, armF: pushing ? [mix(60, 92, push), mix(50, 10, push)] : [60, 50] };
  const filming = frame >= k.poker && frame < k.police;
  return (
    <AbsoluteFill>
      <PlateScene plate="party-night" cam={drift(s.cam, frame, "poker", 3)} mood="night" rimFrom="right"
        lights={[counterLight(playerHead(), "night", 0.3), counterLight(farHead(1), "night", 0.25)]}
        actors={
          <>
            <FarPlayers frame={frame} k={k} />
            <TableProps frame={frame} k={k} />
            <Cut y={PLAYER.seat - 2} id="player">
              <Body x={PLAYER.x} y={PLAYER.seat + 112 * PLAYER.scale} scale={PLAYER.scale} facing={-1} pose={{ ...SEATED, armF: folded ? [40, 30] : [70, 40] }}
                head={PLAYER.head} coat={PLAYER.coat} frame={frame} id="player" count={{ base: PLAYER.base, ticks: [k.bluffs[4] - 6, k.clickAll] }}
                size={34 * PLAYER.scale} mouth={talk(frame, k.allIn, k.allInE, folded ? "frown" : "smirk")} brows={folded ? "sad" : "flat"} look={{ x: 1, y: 0 }} seed={5} />
            </Cut>
            {s.name !== "ots" && (
              <Cut y={YOU_SEAT.seat - 2} id="you-poker">
                <Body x={YOU_SEAT.x} y={YOU_SEAT.seat + 112 * YOU_SEAT.scale} scale={YOU_SEAT.scale} facing={1} pose={youPose} head={HERO.head} scarf={HERO.scarf} tuft
                  frame={frame} id="you-poker" look={{ x: 1, y: 0.1 }} mouth={after ? "smirk" : "flat"} lids={0.35} brows="flat" />
              </Cut>
            )}
            <Body x={GUEST.x} y={GUEST.y} scale={GUEST.scale} facing={-1} pose={{ ...STAND, armF: filming ? [100, -10] : [40, 40] }}
              head={GUEST.head} coat={GUEST.coat} frame={frame} id="guest" count={{ base: 1 }} size={34 * GUEST.scale}
              mouth={talk(frame, k.police, k.policeE, "smile")} look={{ x: 1, y: 0.05 }} held={<Handset scale={1.4} />} seed={9} />
          </>
        } />
      {s.name === "ots" && <FgShoulder x={270} head={HERO.head} scarf={HERO.scarf} tuft />}
      {s.name === "film" && <RecFrame frame={frame} />}
    </AbsoluteFill>
  );
};

const Component: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = cues(shot);
  const f = shot.frame;
  const on = current(f, [[shot.from, "poker"], [k.glow - 6, "watch"], [k.clip - 2, "clip"], [k.clipE, "studio"]] as [number, "poker" | "watch" | "clip" | "studio"][]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {on === "poker" && <Poker frame={f} k={k} />}
      {on === "watch" && <LostWatch frame={f} k={k} />}
      {on === "clip" && <Clip frame={f} k={k} />}
      {on === "studio" && <Studio frame={f} k={k} />}
    </AbsoluteFill>
  );
};

export const tenOutOfTen: Beat = { id: "TenOutOfTen", first: "Poker night.", lead: 0.3, Component };
