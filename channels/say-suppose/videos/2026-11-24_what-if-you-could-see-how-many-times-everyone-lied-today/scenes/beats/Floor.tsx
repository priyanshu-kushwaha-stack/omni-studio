// Beat "The Floor" (script.md ## [01:32] The Floor).
//   - the meeting (sets/MeetingRoom.tsx), the frame played on: fourteen heads round the table, nodding; the boss
//     raises his mug, "Nobody's losing their desk."; click, 49; the table brightens; everyone claps; you clap once, late;
//   - the blinds go up on the open-plan floor (library `office-desk`, day): rows of heads with their counters; the
//     stand-up at the whiteboard, you at the edge with your mug; "Nearly done." "Sent it Friday." "Printer's broken.";
//     click, click, click; the printer drops a warm page; three heads turn; the readout 212;
//   - "villains": the boss in his glass cabin on the phone, click, 50; "the printer's broken": the printer again;
//   - the boss's desk, the 50 over him: bubble "Say it again?"; "Sent it Friday." click, 51; he winks; his screen: the
//     proposal still in Drafts; you wait at his desk, arms folded, until he sends it himself; at lunch, your own desk.
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, STAND } from "@whatif/kit/rig/pose";
import { officeDesk } from "@whatif/kit/sets/OfficeDesk";
import { Deep, noise } from "@whatif/kit/sets/common";
import { SetScene } from "@whatif/kit/sets/SetScene";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { INK, PAPER } from "@whatif/kit/theme";
import { BOSS, camAt, current, GLOW, HERO, linear, PASTELS, ramp, type Beat, type Shot } from "../shared";
import { Counter, Readout } from "../parts/Counter";
import { aim, Bubble, Clicks, handWorld, headWorld, HeroMug, Lanyard, onScreen, Person, talk, type Placed } from "../parts/FrameKit";
import { BOSS_POSE, meetingRoom, MeetingScene, SEATS, Seated } from "../sets/MeetingRoom";

function times(shot: Shot) {
  const L = (p: string, s = 0) => shot.at(p, s);
  const E = (p: string) => shot.end(p);
  const nobody = [L("Boss: Nobody's losing"), E("Boss: Nobody's losing")] as const;
  const printerEnd = E("Printer man: Printer's broken");
  const sent = [L("Boss: Sent it Friday"), E("Boss: Sent it Friday")] as const;
  return {
    start: shot.from, nobody, tick49: nobody[1] + 10, coffee: L("Forty-nine before"), blinds: E("Forty-nine before"),
    woman: [L("Desk woman: Nearly done"), E("Desk woman: Nearly done")] as const,
    man: [L("Desk man: Sent it Friday"), E("Desk man: Sent it Friday")] as const,
    printer: [L("Printer man: Printer's broken"), printerEnd] as const,
    ticks: [printerEnd + 6, printerEnd + 18, printerEnd + 30], page: printerEnd + 36, turn: printerEnd + 58,
    floor: Math.min(printerEnd + 66, L("You expected villains") - 12),
    carrying: L("You expected villains"), tick50: L("You expected villains", 0.3), villains: L("You expected villains", 0.42), proposal: L("The proposal he"), askEnd: E("The proposal he"), sent, tick51: sent[1] + 10,
    drafts: L("Fifty-one."), fold: L("Fifty-one.", 0.45), send: L("Fifty-one.", 0.85),
    lunch: L("At lunch you find out"), end: shot.to,
  };
}
type T = ReturnType<typeof times>;

// ---- the meeting ----

const MEET_HEADS = ["#7fa0c4", "#b58fc7", "#7fc29b", "#e6a0a0", "#d9c26a", "#9fc0e0", "#c9a0d6", "#a8c97f", "#e0a070", "#9fd8a8"];
const MEET_COUNTS = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0];

const Meeting: React.FC<{ frame: number; k: T; cam: Camera }> = ({ frame, k, cam }) => {
  const S = meetingRoom.spots;
  const lift = ramp(frame, k.nobody[0], k.nobody[0] + 12);
  const boss: Placed = { x: S.boss.x, y: S.boss.y, scale: S.boss.scale, facing: -1, pose: { ...BOSS_POSE, armF: [28 + 110 * lift, -128 + 140 * lift] } };
  const bh = headWorld(boss);
  const mug = handWorld(boss);
  const clap = frame >= k.tick49 + 8 && frame < k.tick49 + 50 ? 1 : 0;
  const nod = frame >= k.nobody[0] && frame < k.tick49 ? 1 : 0;
  const bright = 1 + 0.35 * ramp(frame, k.tick49, k.tick49 + 10);
  const late = frame >= k.tick49 + 30 && frame < k.tick49 + 36;
  const you: Placed = { x: 450, y: 1010, scale: 1.3, facing: 1, pose: { ...STAND, armF: [70, 70], armB: late ? [85, 20] : [-7, 8] } };
  const yh = handWorld(you);
  return (
    <MeetingScene cam={cam} mood="lamp" frame={frame} options={{ blinds: 0, pool: bright }}
      lights={[{ x: bh.x, y: bh.y - 137.5, r: 200 * bright, color: GLOW, strength: 0.5 * bright, moods: ["lamp"] }]}
      behind={
        <>
          {[1640, 1730].map((x, i) => (
            <Person key={x} f={{ x, y: 700, scale: 0.95, facing: -1, pose: STAND }} who={{ head: ["#e8c9a0", "#8fb4d9"][i], coat: "#3b3e47", mouth: clap ? "smile" : "flat" }}
              frame={frame} id={`stand${i}`} count={{ base: i, size: 30, dim: i === 0 }} />
          ))}
          {SEATS.map((_, i) => <Seated key={i} i={i} head={MEET_HEADS[i]} frame={frame} nod={nod} clap={clap} />)}
        </>
      }
      actors={
        <>
          {SEATS.map((s, i) => {
            const f: Placed = { x: s.x, y: s.y, scale: s.scale, facing: s.facing, pose: SEATED };
            const h = headWorld(f);
            return <Counter key={i} x={h.x} y={h.y - h.r - 26} base={MEET_COUNTS[i]} frame={frame} size={30} id={`meet${i}`} />;
          })}
          <Figure x={boss.x} y={boss.y} scale={boss.scale} facing={-1} pose={boss.pose} head={BOSS.head} coat={BOSS.coat} tie={BOSS.tie}
            mouth={talk(frame, k.nobody[0], k.nobody[1], "smile")} eyes={1.05} look={{ x: 1, y: 0.1 }} time={frame} />
          <HeroMug x={mug.x} y={mug.y} scale={boss.scale} tilt={6} />
          <Counter x={bh.x} y={bh.y - 137.5} base={48} ticks={[k.tick49]} frame={frame} size={96} id="floor-boss" />
          <Figure x={you.x} y={you.y} scale={you.scale} pose={you.pose} head={HERO.head} scarf={HERO.scarf} tuft time={frame}
            brows={frame >= k.tick49 ? "flat" : "none"} lids={0.3} mouth="flat" look={{ x: 0.9, y: -0.2 }} />
          <Lanyard f={you} />
          <HeroMug x={yh.x} y={yh.y} scale={you.scale} />
        </>
      } />
  );
};

// ---- the open-plan floor ----

const CABIN = 1560;

/** Far rows of heads over the cubicles, each with its counter: zeros and ones, a few threes. */
const FarHeads: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    {[0, 1, 2].map((row) => Array.from({ length: 26 }, (_, i) => {
      const x = -1300 + i * 110 + row * 40;
      if (x > 860 && x < 1260) return null;
      if (x > CABIN - 40 && x < CABIN + 960) return null;
      const r = 12 + row * 3;
      const y = 470 + row * 34 + Math.sin(frame / 50 + i) * 2;
      const v = noise(i * 7 + row) < 0.08 ? 3 : noise(i * 3 + row * 11) < 0.3 ? 1 : 0;
      return (
        <g key={`${row}-${i}`}>
          <circle cx={x} cy={y} r={r} fill={PASTELS[(i + row) % PASTELS.length]} />
          <g opacity={v === 0 ? 0.6 : 1}><Counter x={x} y={y - r - 13 - row} base={v} frame={frame} size={14 + row * 2} id={`fh${row}-${i}`} /></g>
        </g>
      );
    }))}
  </g>
);

/** Counters over the set's own colleagues (its cubicle row at depth 0.72). */
const RowCounters: React.FC<{ frame: number; cam: Camera }> = ({ frame, cam }) => (
  <Deep cam={cam} depth={0.72} flat>
    {Array.from({ length: 10 }, (_, i) => {
      const x = -1100 + i * 440 + 200 + Math.sin(frame / 60 + i) * 4;
      if (noise(i + 3) <= 0.25 || x > CABIN - 60) return null;
      return <Counter key={i} x={x} y={566 - 34 - 24} base={i % 3 === 1 ? 1 : i === 5 ? 3 : 0} frame={frame} size={30} id={`row${i}`} />;
    })}
  </Deep>
);

const Whiteboard: React.FC = () => (
  <g>
    <rect x={90} y={640} width={10} height={320} fill="#5c6675" /><rect x={300} y={640} width={10} height={320} fill="#5c6675" />
    <rect x={50} y={380} width={300} height={270} rx={8} fill="#f7f7f2" stroke={INK} strokeWidth={6} />
    <path d="M80 430 h120 M80 470 h180 M80 510 h90 M210 520 l30 30 l50 -70" stroke="#1d9a8f" strokeWidth={8} strokeLinecap="round" fill="none" />
    <path d="M80 570 h150" stroke="#d8344f" strokeWidth={8} strokeLinecap="round" />
  </g>
);

const Printer: React.FC<{ frame: number; page: number }> = ({ frame, page }) => {
  const out = ramp(frame, page, page + 20);
  const hum = frame >= page - 8 && frame < page + 20 ? Math.sin(frame * 2) * 1.5 : 0;
  return (
    <g transform={`translate(${hum} 0)`}>
      <rect x={790} y={820} width={170} height={140} fill="#7a6a58" stroke={INK} strokeWidth={5} />
      <rect x={770} y={720} width={210} height={100} rx={10} fill="#d8d2c4" stroke={INK} strokeWidth={6} />
      <rect x={800} y={700} width={150} height={24} rx={4} fill="#b8b2a4" stroke={INK} strokeWidth={4} />
      <rect x={950} y={750} width={14} height={14} rx={7} fill={frame >= page - 8 ? "#3fbf7f" : "#57482a"} />
      {out > 0 && <rect x={800 - out * 70} y={790} width={120} height={14} fill={PAPER} stroke={INK} strokeWidth={3} transform={`rotate(${-6 * out} ${800} 797)`} />}
      {out > 0.6 && [0, 1].map((i) => <path key={i} d={`M${760 - out * 60 + i * 30} 770 q-6 -14 0 -26`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.6} />)}
    </g>
  );
};

const STANDUP = [
  { key: "woman", x: 400, head: "#e6a0a0", coat: "#7a5a8c", base: 2, facing: 1 as const },
  { key: "man", x: 560, head: "#9fc0e0", coat: "#3d5a6c", base: 2, facing: -1 as const },
  { key: "printer", x: 700, head: "#c9a0d6", coat: "#6d7f8f", base: 1, facing: -1 as const },
];

/** The boss's screen: his mail, the proposal in Drafts (or Sent). Drawn at (x, y) top-left, w x h. */
const BossScreen: React.FC<{ x: number; y: number; w: number; h: number; sent: boolean }> = ({ x, y, w, h, sent }) => (
  <g>
    <rect x={x - 8} y={y - 8} width={w + 16} height={h + 16} rx={10} fill="#2a2d36" stroke={INK} strokeWidth={5} />
    <rect x={x} y={y} width={w} height={h} fill="#eef1f5" />
    <rect x={x} y={y} width={w * 0.3} height={h} fill="#dfe4ea" />
    {["INBOX", "DRAFTS", "SENT"].map((f, i) => {
      const on = (f === "DRAFTS" && !sent) || (f === "SENT" && sent);
      return (
        <g key={f}>
          {on && <rect x={x + 4} y={y + 14 + i * 34} width={w * 0.3 - 8} height={28} rx={6} fill="#f2b632" />}
          <text x={x + 12} y={y + 35 + i * 34} fontFamily={FONT} fontWeight={800} fontSize={18} fill={INK}>{f}</text>
        </g>
      );
    })}
    <rect x={x + w * 0.34} y={y + 16} width={w * 0.62} height={44} rx={6} fill={sent ? "#cfe9d8" : "#fff4cf"} stroke={INK} strokeWidth={3} />
    <rect x={x + w * 0.36} y={y + 24} width={24} height={30} fill={PAPER} stroke={INK} strokeWidth={3} />
    <text x={x + w * 0.36 + 34} y={y + 46} fontFamily={FONT} fontWeight={800} fontSize={20} fill={INK}>PROPOSAL</text>
    <rect x={x + w * 0.62} y={y + h - 50} width={w * 0.32} height={36} rx={8} fill={sent ? "#3fbf7f" : "#2a46b8"} />
    <text x={x + w * 0.78} y={y + h - 25} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={20} fill="#fff">{sent ? "SENT" : "SEND"}</text>
  </g>
);

const Office: React.FC<{ frame: number; k: T; cam: Camera }> = ({ frame, k, cam }) => {
  const atDesk = frame >= k.lunch;
  const lines = [k.woman, k.man, k.printer];
  const turned = frame >= k.turn && frame < k.floor + 30;
  // the boss: in his cabin (on the phone), behind his desk, at the cabin door at lunch
  // he stays behind his desk, right of his screen, and in the end clicks send himself (you never touch his computer)
  const bossX = frame < k.proposal ? 1820 : frame < k.lunch ? 2200 : 1720;
  const base: Placed = { x: bossX, y: 940, scale: 1.1, facing: -1, pose: STAND };
  const reach = linear(frame, k.send - 14, k.send - 2) * (1 - linear(frame, k.send + 16, k.send + 26));
  const bossPose = frame >= k.lunch ? STAND
    : frame < k.proposal ? { ...STAND, armF: [150, 120] as [number, number] }
      : reach > 0 ? { ...STAND, lean: 8 * reach, armF: aim(base, { x: 2200 - (2200 - 2089) * reach, y: 600 + 78 * reach }) } : STAND;
  const boss: Placed = { ...base, pose: bossPose };
  const bh = headWorld(boss);
  const wink = frame >= k.tick51 + 10 && frame < k.tick51 + 34;
  // you: at the stand-up's edge, at the boss's desk, at his screen, at your own desk
  const youX = frame < k.proposal ? 1010 : frame < k.fold ? 1660 : frame < k.lunch ? 1660 + linear(frame, k.fold, k.fold + 24) * 80 : 780;
  const folded = frame >= k.fold && frame < k.lunch;
  const you: Placed = atDesk ? { x: 780, y: 850 + 2 * 56 * 1.1, scale: 1.1, facing: 1, pose: { ...SEATED, armF: [80, 40] } }
    : { x: youX, y: 960, scale: 1.15, facing: frame < k.proposal ? -1 : 1, pose: folded ? { ...STAND, armF: [70, 115], armB: [60, 120] } : { ...STAND, armF: [40, 90] } };
  const yh = handWorld(you);
  const youLook = frame >= k.tick51 + 20 && frame < k.drafts ? { x: 1, y: 0.4 } : frame < k.proposal ? { x: 0.9, y: 0 } : { x: 0.9, y: -0.1 };
  return (
    <SetScene set={officeDesk} mood="day" frame={frame} cam={cam} options={{ screen: "mail", colleagues: true, notes: 3 }} cast={[]}
      actors={
        <>
          <FarHeads frame={frame} />
          <RowCounters frame={frame} cam={cam} />
          <Whiteboard />
          <Printer frame={frame} page={k.page} />
          {/* the stand-up breaks up once you go to the boss's desk */}
          {frame < k.proposal && STANDUP.map((p, i) => {
            const [a, b] = lines[i];
            const f: Placed = { x: p.x, y: 965, scale: 1.12, facing: turned ? 1 : p.facing, pose: { ...STAND, armF: frame >= a && frame < b ? [70, 50] : [9, 10] } };
            return <Person key={p.key} f={f} who={{ head: p.head, coat: p.coat, mouth: talk(frame, a, b, "flat"), look: turned ? { x: 1, y: 0.3 } : { x: 0.8, y: 0 } }}
              frame={frame} id={`su-${p.key}`} count={{ base: p.base, ticks: [k.ticks[i]], size: 38 }} />;
          })}
          {/* the boss's monitor on his cabin desk */}
          <BossScreen x={1910} y={560} w={230} h={150} sent={frame >= k.send} />
          <Figure x={boss.x} y={boss.y} scale={boss.scale} facing={boss.facing} pose={boss.pose} head={BOSS.head} coat={BOSS.coat} tie={BOSS.tie} time={frame}
            mouth={talk(frame, k.sent[0], k.sent[1], "smile")} lids={wink ? 0.85 : 0}
            look={{ x: 0.8, y: 0 }} />
          <Counter x={bh.x} y={bh.y - bh.r - 44} base={49} ticks={[k.tick50, k.tick51]} frame={frame} size={54} id="office-boss" />
          <Figure x={you.x} y={you.y} scale={you.scale} facing={you.facing} pose={you.pose} head={HERO.head} scarf={HERO.scarf} tuft time={frame}
            lids={frame >= k.proposal && frame < k.lunch ? 0.45 : 0.15} mouth={frame >= k.send + 4 && frame < k.lunch ? "smirk" : "flat"}
            look={youLook} />
          <Lanyard f={you} />
          {!atDesk && !folded && <HeroMug x={yh.x} y={yh.y} scale={you.scale} tilt={6} steam={false} />}
        </>
      } />
  );
};

function officeCam(frame: number, k: T): Camera {
  const shot = current(frame, [[k.blinds, "wide"], [k.woman[0], "standup"], [k.printer[0], "printer"], [k.floor, "floor"], [k.carrying, "cabin"],
    [k.villains, "printer2"], [k.proposal, "desk"], [k.tick51 + 20, "screen"], [k.drafts, "desk2"], [k.send - 12, "screen2"], [k.lunch, "lunch"]] as [number, string][]);
  switch (shot) {
    case "wide": return camAt(frame, [[k.blinds, { x: 800, y: 560, zoom: 0.85 }], [k.woman[0], { x: 700, y: 580, zoom: 1.0 }]]);
    case "standup": return camAt(frame, [[k.woman[0], { x: 480, y: 640, zoom: 1.5 }], [k.man[0], { x: 600, y: 640, zoom: 1.6 }], [k.printer[0], { x: 640, y: 640, zoom: 1.6 }]]);
    case "printer": return camAt(frame, [[k.printer[0], { x: 720, y: 640, zoom: 1.7 }], [k.ticks[2], { x: 640, y: 640, zoom: 1.4 }], [k.floor, { x: 680, y: 650, zoom: 1.45 }]]);
    case "floor": return camAt(frame, [[k.floor, { x: 700, y: 600, zoom: 1.2 }], [k.carrying, { x: 900, y: 560, zoom: 0.82 }]]);
    case "cabin": return camAt(frame, [[k.carrying, closeUp(1820, 600, 1.9)], [k.villains, closeUp(1820, 610, 2.05)]]);
    case "printer2": return camAt(frame, [[k.villains, { x: 780, y: 680, zoom: 2.0 }], [k.proposal, { x: 800, y: 700, zoom: 2.2 }]]);
    case "desk": return camAt(frame, [[k.proposal, { x: 1840, y: 620, zoom: 1.5 }], [k.tick51, { x: 1880, y: 600, zoom: 1.7 }]]);
    case "screen": return camAt(frame, [[k.tick51 + 20, { x: 2075, y: 610, zoom: 3.5 }], [k.drafts, { x: 2075, y: 615, zoom: 3.7 }]]);
    case "desk2": return camAt(frame, [[k.drafts, { x: 1880, y: 610, zoom: 1.6 }], [k.send, { x: 1960, y: 610, zoom: 1.8 }]]);
    case "screen2": return camAt(frame, [[k.send - 12, { x: 2075, y: 610, zoom: 3.5 }], [k.lunch, { x: 2075, y: 615, zoom: 3.7 }]]);
    default: return camAt(frame, [[k.lunch, { x: 900, y: 600, zoom: 1.4 }], [k.end, { x: 860, y: 580, zoom: 1.6 }]]);
  }
}

/** The blinds rolling up over the floor (screen space). */
const Blinds: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const up = ramp(frame, at, at + 16);
  if (up >= 1 || frame < at) return null;
  return (
    <AbsoluteFill style={{ clipPath: `inset(0 0 ${up * 100}% 0)` }}>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(180deg, #161b27 0 26px, #0d1018 26px 40px)" }} />
    </AbsoluteFill>
  );
};

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot);
  const inMeeting = frame < k.blinds;
  const meetCam = drift(camAt(frame, [[k.start, { x: 960, y: 580, zoom: 1.4 }], [k.tick49, { x: 1000, y: 570, zoom: 1.45 }], [k.coffee, closeUp(1370, 560, 2.3)], [k.blinds, closeUp(1370, 545, 2.5)]]), frame, "fm", 2);
  const oc = drift(officeCam(frame, k), frame, "fo", 2);
  const you = onScreen(oc, { x: 1660, y: 960 - 300 * 1.15 });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {inMeeting ? <Meeting frame={frame} k={k} cam={meetCam} /> : <Office frame={frame} k={k} cam={oc} />}
      <Blinds frame={frame} at={k.blinds} />
      <Readout label="EVERYONE YOU CAN SEE" value={212} frame={frame} on={k.floor} off={k.proposal} />
      <Bubble frame={frame} at={k.askEnd + 2} until={k.sent[0] + 10} x={you.x + 20} y={you.y - 10} text="Say it again?" />
      <Clicks at={[k.tick49, ...k.ticks, k.tick50, k.tick51]} volume={0.5} />
      <Sequence from={k.page - 8} durationInFrames={40}><Audio src={staticFile("sfx/typing.wav")} volume={0.25} /></Sequence>
    </AbsoluteFill>
  );
};

export const floor: Beat = { id: "Floor", first: "Boss: Nobody's losing", lead: 0.3, Component: Scene };
