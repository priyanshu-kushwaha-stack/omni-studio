// The Floor beat's day scenes in look C: the open-plan floor (plate `office-floor`: the whiteboard and the printer are
// painted at the left, desks in two rows down to the window, eye line at world y 430) and the boss's glass office
// (plate `boss-office`: his desk and monitor at the left, open floor to the right). The stand-up, the printer's page,
// the boss on the phone, his screen with the proposal in Drafts, and you crossing the floor at lunch.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import { FONT } from "@whatif/kit/fonts";
import { INK, PAPER } from "@whatif/kit/theme";
import { BOSS, HERO, linear, noise, PASTELS, ramp } from "../shared";
import { Counter } from "./Counter";
import { aim, Bubble, handWorld, headWorld, HeroMug, Lanyard, onScreen, Person, talk, type Placed } from "./FrameKit";
import { PlateScene } from "./Plate";
import { counterLight, Cut, FgShoulder, onHead, pw, scaleAt, shotAt, type Shot as Cam } from "./SayItAgain.LookC";

export interface FloorTimes {
  start: number; nobody: readonly [number, number]; tick49: number; coffee: number; blinds: number;
  woman: readonly [number, number]; man: readonly [number, number]; printer: readonly [number, number];
  ticks: number[]; page: number; turn: number; floor: number; villains: number; tick50: number; printer2: number;
  proposal: number; askEnd: number; sent: readonly [number, number]; tick51: number; drafts: number; fold: number; send: number;
  lunch: number; end: number;
}

const H = 430;
const at = (x: number, y: number, facing: 1 | -1): Placed => ({ x, y, scale: scaleAt(y, H), facing, pose: STAND });
const STANDUP = [
  { key: "printer", f: at(430, 960, 1), head: "#c9a0d6", coat: "#6d7f8f", base: 1 },
  { key: "woman", f: at(650, 990, 1), head: "#e6a0a0", coat: "#7a5a8c", base: 2 },
  { key: "man", f: at(870, 972, -1), head: "#9fc0e0", coat: "#3d5a6c", base: 2 },
];
const YOU_FLOOR = at(1170, 1010, -1);

/** Heads over the far monitors, each with a small dim counter: zeros and ones, a few threes. Plate pixels. */
const DESK_HEADS: [number, number][] = [[330, 404], [418, 398], [497, 396], [572, 394], [985, 396], [1048, 399], [1115, 403], [1190, 407], [1290, 412], [1380, 418]];

const DeskHeads: React.FC<{ frame: number; turned: boolean }> = ({ frame, turned }) => (
  <g>
    {DESK_HEADS.map(([u, v], i) => {
      const top = pw(u, v);
      const scale = scaleAt(top.y + 210, H) * 0.95;
      const f: Placed = { x: top.x, y: top.y + 236 * scale, scale, facing: u < 760 ? 1 : -1, pose: { ...STAND, tilt: turned ? -8 : 0 } };
      const n = noise(i * 7) < 0.15 ? 3 : noise(i * 3 + 1) < 0.35 ? 1 : 0;
      return (
        <Cut key={i} y={top.y + 4} id={`dh${i}`}>
          <Person f={f} who={{ head: PASTELS[i % 8], coat: "#3b3e47", look: turned ? { x: -1, y: 0.2 } : { x: 0.8, y: 0.2 }, blink: (frame + i * 13) % 97 < 4 }}
            frame={frame} id={`dh${i}`} count={{ base: n, size: 30 * scale, dim: n === 0 }} />
        </Cut>
      );
    })}
  </g>
);

/** A warm page sliding out of the painted printer's slot. */
const Page: React.FC<{ frame: number; page: number }> = ({ frame, page }) => {
  const out = ramp(frame, page, page + 20);
  const slot = pw(268, 612);
  return (
    <g>
      <circle cx={pw(298, 574).x} cy={pw(298, 574).y} r={6} fill={frame >= page - 8 ? "#3fbf7f" : "#57482a"} />
      {out > 0 && <rect x={slot.x} y={slot.y} width={92} height={10 + out * 46} rx={3} fill={PAPER} stroke={INK} strokeWidth={3} />}
    </g>
  );
};

function floorShots(k: FloorTimes): Cam[] {
  const h = (f: Placed) => headWorld(f);
  const [pm, wo, ma] = STANDUP.map((s) => s.f);
  return [
    { at: k.blinds, cam: { x: 960, y: 560, zoom: 1.0 }, to: { x: 930, y: 560, zoom: 1.06 } },
    { at: k.woman[0] + 14, cam: onHead(h(wo), 0.15, 170), to: onHead(h(wo), 0.16, 170), name: "woman" },
    { at: k.man[0] - 2, cam: onHead(h(ma), 0.15, -200), to: onHead(h(ma), 0.16, -200), name: "man" },
    { at: k.printer[0] - 6, cam: onHead(h(pm), 0.15, 160), to: onHead(h(pm), 0.16, 160), name: "printer" },
    { at: k.printer[1] + 2, cam: { x: 660, y: 540, zoom: 1.7 }, to: { x: 660, y: 545, zoom: 1.8 }, name: "three" },
    { at: k.ticks[2] + 6, cam: onHead(h(YOU_FLOOR), 0.18, -150), to: onHead(h(YOU_FLOOR), 0.19, -150), name: "you" },
    { at: k.page - 2, cam: { x: 470, y: 640, zoom: 1.45 }, to: { x: 520, y: 620, zoom: 1.35 }, name: "page" },
    { at: k.floor, cam: { x: 960, y: 560, zoom: 1.02 }, to: { x: 960, y: 560, zoom: 1.06 }, name: "wide" },
    { at: k.printer2, cam: onHead(h(pm), 0.13, 110), to: onHead(h(pm), 0.14, 110), name: "printer2" },
    { at: k.lunch, cam: { x: 1100, y: 600, zoom: 1.35 }, to: { x: 1300, y: 600, zoom: 1.45 }, name: "lunch" },
  ];
}

export const OfficeFloor: React.FC<{ frame: number; k: FloorTimes }> = ({ frame, k }) => {
  const s = shotAt(frame, floorShots(k), k.end);
  const cam = drift(s.cam, frame, "fo", 2);
  const turned = frame >= k.turn && frame < k.villains;
  const lines = [k.printer, k.woman, k.man];
  const lunch = frame >= k.lunch;
  const walk = linear(frame, k.lunch, k.end);
  const you: Placed = lunch ? { ...YOU_FLOOR, x: 1000 + 600 * walk, facing: 1, pose: walkPose(frame / 4) } : { ...YOU_FLOOR, pose: { ...STAND, armF: [40, 90] } };
  const tap = s.name === "printer2" ? Math.sin(frame / 3) * 10 : 0;
  return (
    <AbsoluteFill>
      <PlateScene plate="office-floor" cam={cam} mood="day" rimFrom="right"
        lights={STANDUP.map((p) => counterLight(headWorld(p.f), "day", 0.25))}
        actors={
          <>
            <DeskHeads frame={frame} turned={turned} />
            <Page frame={frame} page={k.page} />
            {!lunch && STANDUP.map((p, i) => {
              const [a, b] = lines[i];
              const pose = { ...STAND, armF: (frame >= a && frame < b ? [70, 50] : i === 0 && tap ? [80 + tap, 20] : [9, 10]) as [number, number] };
              const f: Placed = { ...p.f, facing: turned ? -1 : p.f.facing, pose };
              return <Person key={p.key} f={f} who={{ head: p.head, coat: p.coat, mouth: talk(frame, a, b, "flat"), look: turned ? { x: 1, y: 0.3 } : { x: 0.8, y: 0 } }}
                frame={frame} id={`su-${p.key}`} count={{ base: p.base, ticks: [k.ticks[i]], size: 34 * p.f.scale }} />;
            })}
            {s.name !== "man" && (
              <g>
                <Figure x={you.x} y={you.y} scale={you.scale} facing={you.facing} pose={you.pose} head={HERO.head} scarf={HERO.scarf} tuft time={frame}
                  lids={0.4} mouth="flat" look={turned ? { x: -1, y: 0.2 } : { x: 0.9, y: 0 }} brows={s.name === "you" ? "flat" : "none"} />
                <Lanyard f={you} />
                {!lunch && <HeroMug x={handWorld(you).x} y={handWorld(you).y} scale={you.scale} tilt={6} steam={false} />}
              </g>
            )}
          </>
        } />
      {s.name === "man" && <FgShoulder x={1660} head={HERO.head} scarf={HERO.scarf} tuft />}
    </AbsoluteFill>
  );
};

/** The boss's screen: his mail, the proposal in Drafts (or Sent). Drawn at (x, y) top-left, w x h. */
const BossScreen: React.FC<{ x: number; y: number; w: number; h: number; sent: boolean }> = ({ x, y, w, h, sent }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="#eef1f5" />
    <rect x={x} y={y} width={w * 0.3} height={h} fill="#dfe4ea" />
    {["INBOX", "DRAFTS", "SENT"].map((f, i) => {
      const on = (f === "DRAFTS" && !sent) || (f === "SENT" && sent);
      return (
        <g key={f}>
          {on && <rect x={x + 4} y={y + 14 + i * 34} width={w * 0.3 - 8} height={28} rx={6} fill="#f2b632" />}
          <text x={x + 10} y={y + 34 + i * 34} fontFamily={FONT} fontWeight={800} fontSize={16} fill={INK}>{f}</text>
        </g>
      );
    })}
    <rect x={x + w * 0.34} y={y + 16} width={w * 0.62} height={40} rx={6} fill={sent ? "#cfe9d8" : "#fff4cf"} stroke={INK} strokeWidth={3} />
    <text x={x + w * 0.38} y={y + 42} fontFamily={FONT} fontWeight={800} fontSize={18} fill={INK}>PROPOSAL</text>
    <rect x={x + w * 0.62} y={y + h - 46} width={w * 0.32} height={32} rx={8} fill={sent ? "#3fbf7f" : "#2a46b8"} />
    <text x={x + w * 0.78} y={y + h - 24} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={17} fill="#fff">{sent ? "SENT" : "SEND"}</text>
  </g>
);

const SCREEN = { x: 392, y: 410, w: 258, h: 174 };
const MOUSE = pw(600, 497);
const BOSS_DESK: Placed = { x: 860, y: 990, scale: 2.25, facing: -1, pose: STAND };
const YOU_DESK: Placed = { x: 1500, y: 1060, scale: 2.4, facing: -1, pose: STAND };

function officeShots(k: FloorTimes): Cam[] {
  const b = headWorld(BOSS_DESK);
  const y = headWorld(YOU_DESK);
  const scr = { x: SCREEN.x + SCREEN.w / 2, y: SCREEN.y + SCREEN.h / 2 };
  return [
    { at: k.villains, cam: onHead(b, 0.13, -60), to: onHead(b, 0.14, -60), name: "phone" },
    { at: k.proposal, cam: { x: 1060, y: 560, zoom: 1.12 }, to: { x: 1080, y: 560, zoom: 1.18 }, name: "two" },
    { at: k.proposal + 26, cam: onHead(b, 0.14, -150), to: onHead(b, 0.15, -150), name: "ots" },
    { at: k.askEnd, cam: onHead(y, 0.17, 120), to: onHead(y, 0.18, 120), name: "you" },
    { at: k.sent[0] + 4, cam: onHead(b, 0.15, -120), to: onHead(b, 0.16, -120), name: "boss" },
    { at: k.tick51 + 18, cam: onHead(y, 0.18, 150), to: onHead(y, 0.19, 150), name: "you2" },
    { at: k.drafts - 12, cam: { ...scr, zoom: 3.6 }, to: { ...scr, zoom: 3.8 }, name: "screen" },
    { at: k.drafts + 26, cam: { x: 1120, y: 560, zoom: 1.3 }, to: { x: 1120, y: 560, zoom: 1.4 }, name: "wait" },
    { at: k.send - 34, cam: onHead(b, 0.12, -260), to: onHead(b, 0.12, -280), name: "send" },
    { at: k.send + 6, cam: { ...scr, zoom: 3.6 }, to: { ...scr, zoom: 3.75 }, name: "screen2" },
  ];
}

export const BossOffice: React.FC<{ frame: number; k: FloorTimes }> = ({ frame, k }) => {
  const s = shotAt(frame, officeShots(k), k.lunch);
  const cam = drift(s.cam, frame, "fb", 2);
  const reach = linear(frame, k.send - 14, k.send - 2) * (1 - linear(frame, k.send + 16, k.send + 26));
  const phone = frame < k.proposal;
  const bossPose = phone ? { ...STAND, armB: [165, 150] as [number, number] }
    : reach > 0 ? { ...STAND, lean: 10 * reach, armF: aim(BOSS_DESK, MOUSE) } : STAND;
  const boss: Placed = { ...BOSS_DESK, pose: bossPose };
  const bh = headWorld(boss);
  const wink = frame >= k.tick51 + 10 && frame < k.tick51 + 34;
  const walkIn = ramp(frame, k.proposal, k.proposal + 24);
  const folded = frame >= k.fold;
  const you: Placed = { ...YOU_DESK, x: YOU_DESK.x + 260 * (1 - walkIn), pose: folded ? { ...STAND, armF: [70, 115], armB: [60, 120] } : { ...STAND, armF: [40, 90] } };
  const yh = headWorld(you);
  const look = frame >= k.tick51 + 18 && frame < k.send ? { x: 1, y: 0.35 } : { x: 0.9, y: -0.05 };
  const bubbleAt = onScreen(cam, { x: yh.x - yh.r * 0.6, y: yh.y - yh.r * 1.1 });
  return (
    <AbsoluteFill>
      <PlateScene plate="boss-office" cam={cam} mood="day" rimFrom="left" lights={[counterLight(bh, "day", 0.35)]}
        actors={
          <>
            <BossScreen {...SCREEN} sent={frame >= k.send} />
            {/* on the phone: the handset at his far ear, behind his head */}
            {phone && <rect x={bh.x + bh.r * 0.82} y={bh.y - bh.r * 0.35} width={bh.r * 0.42} height={bh.r * 0.95} rx={bh.r * 0.12} fill="#1b1d24"
              transform={`rotate(14 ${bh.x + bh.r * 0.75} ${bh.y})`} />}
            <Figure x={boss.x} y={boss.y} scale={boss.scale} facing={-1} pose={boss.pose} head={BOSS.head} coat={BOSS.coat} tie={BOSS.tie} time={frame}
              mouth={phone ? talk(frame, k.villains, k.tick50 + 20, "smile") : talk(frame, k.sent[0], k.sent[1], "smile")} lids={wink ? 0.85 : 0}
              look={{ x: phone ? -0.6 : 0.8, y: 0 }} />
            <Counter x={bh.x} y={bh.y - bh.r - 30 * boss.scale} base={49} ticks={[k.tick50, k.tick51]} frame={frame} size={34 * boss.scale} id="office-boss" />
            {!phone && s.name !== "ots" && s.name !== "boss" && (
              <g>
                <Figure x={you.x} y={you.y} scale={you.scale} facing={-1} pose={you.pose} head={HERO.head} scarf={HERO.scarf} tuft time={frame}
                  lids={0.45} mouth={frame >= k.send + 4 ? "smirk" : "flat"} look={look} brows={s.name === "you" ? "raised" : "flat"} />
                <Lanyard f={you} />
                {!folded && <HeroMug x={handWorld(you).x} y={handWorld(you).y} scale={you.scale} tilt={6} steam={false} />}
              </g>
            )}
          </>
        } />
      {s.name === "ots" && <FgShoulder x={1650} head={HERO.head} scarf={HERO.scarf} tuft />}
      <Bubble frame={frame} at={k.askEnd + 2} until={k.sent[0] + 4} x={bubbleAt.x} y={bubbleAt.y} text="Say it again?" side="left" />
    </AbsoluteFill>
  );
};
