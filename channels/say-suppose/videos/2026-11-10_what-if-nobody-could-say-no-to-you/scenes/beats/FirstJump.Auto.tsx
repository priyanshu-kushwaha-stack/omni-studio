// The auto at night of "The first jump" (lines 18-19), drawn here (a single-use set): an auto-rickshaw side on, stopped
// at the kerb, the meter glowing. The driver counts your change into your hand and folds his hands at you; insert on
// the meter; he bows again; the hold: you in the back seat look at your change, then at the back of his head.
// The script calls this shot night while its lines are lit morning, so it sets its own look (the night mood, plus a
// glow on the meter).
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook } from "@whatif/kit/stage/moods";
import { Stage, toScreen, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { FONT } from "@whatif/kit/fonts";
import { INK, PAPER } from "@whatif/kit/theme";
import { headAt } from "../parts";
import { CHAIR_SIT, handAt, seatedY, shoulderAt } from "../parts2";
import { blinking, camAt, current, HERO, mix, noise, ramp } from "../shared";
import { Deep } from "../sets/common";
import { aimed, Moustache, OnHead, talk, type T } from "./FirstJump.Times";

const S = 1.1;
const ROAD = 990;
const BENCH = 820;
const DRIVER_SEAT = 800;
const YOU_X = 860;
const DRIVER_X = 1135;
const DRIVER = { head: "#7fa0c4", coat: "#b8a46a" };
const METER = { x: 1305, y: 640 };
/** Your palm, held out for the change, and where the coins land on it. */
const PALM = { x: 968, y: 792 };

/** The night street: far blocks with lit windows, a lamp post, cars sliding past far back, the road. */
const NightStreet: React.FC<{ cam: Camera; frame: number }> = ({ cam, frame }) => (
  <>
    <Deep cam={cam} depth={0.3} flat>
      <rect x={-1400} y={-800} width={4800} height={1800} fill="#151a36" />
      <circle cx={420} cy={180} r={46} fill="#f3e9d7" opacity={0.9} />
      {Array.from({ length: 14 }, (_, i) => {
        const bx = -900 + i * 260, h = 220 + noise(i + 2) * 260;
        return (
          <g key={i}>
            <rect x={bx} y={760 - h} width={240} height={h + 200} fill="#232a52" />
            {Array.from({ length: 12 }, (_, w) => (
              <rect key={w} x={bx + 30 + (w % 3) * 66} y={760 - h + 30 + Math.floor(w / 3) * 56} width={34} height={26} rx={3}
                fill={noise(i * 17 + w) > 0.55 ? "#ffe9a8" : "#1a1f3d"} />
            ))}
          </g>
        );
      })}
    </Deep>
    <Deep cam={cam} depth={0.65} flat>
      <rect x={-1400} y={820} width={4800} height={60} fill="#3a3f55" />
      {Array.from({ length: 4 }, (_, i) => {
        const x = ((i * 900 - frame * 9) % 3600 + 3600) % 3600 - 900;
        return (
          <g key={i}>
            <rect x={x} y={760} width={220} height={70} rx={24} fill={["#d8344f", "#7fa0c4", "#e8c23a", "#f3e9d7"][i]} />
            <circle cx={x + 6} cy={800} r={12} fill="#fff6c8" />
            <circle cx={x + 50} cy={834} r={18} fill={INK} /><circle cx={x + 170} cy={834} r={18} fill={INK} />
          </g>
        );
      })}
    </Deep>
    <Deep cam={cam} depth={1}>
      <rect x={-1400} y={ROAD - 30} width={4800} height={700} fill="#2c2f3a" />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-1300 + i * 400} y={ROAD + 60} width={180} height={12} rx={6} fill={PAPER} opacity={0.6} />)}
      <rect x={1640} y={160} width={18} height={830} fill="#3b3e47" />
      <path d="M1649 170 Q1649 120 1580 120" fill="none" stroke="#3b3e47" strokeWidth={14} />
      <ellipse cx={1570} cy={134} rx={40} ry={14} fill="#ffe9a8" />
    </Deep>
  </>
);

/** The auto's body behind the people: the black canopy, the back panel, the bench, the driver's seat, the wheels. */
const AutoBody: React.FC = () => (
  <g>
    <path d="M700 870 L712 450 Q720 392 800 386 H1300 Q1360 388 1372 430 L1440 650" fill="#1d1f26" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M760 420 H1290 Q1330 424 1340 460 L1395 640 H760Z" fill="#6a7186" />
    <rect x={720} y={700} width={330} height={130} rx={18} fill="#2f8f5a" stroke={INK} strokeWidth={5} />
    <rect x={720} y={BENCH - 8} width={320} height={28} rx={10} fill="#5a3a2a" stroke={INK} strokeWidth={4} />
    <rect x={1080} y={DRIVER_SEAT - 8} width={130} height={26} rx={9} fill="#5a3a2a" stroke={INK} strokeWidth={4} />
    {[[860, 46], [1440, 40]].map(([x, r]) => (
      <g key={x}>
        <circle cx={x} cy={ROAD - r} r={r} fill={INK} />
        <circle cx={x} cy={ROAD - r} r={r * 0.45} fill="#9aa3ad" />
      </g>
    ))}
  </g>
);

/** In front of the people: the low yellow side, the front fairing with its headlamp, the windscreen, the handlebar,
 *  and the meter on its stalk with a split-flap fare (a counter). */
const AutoFront: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <path d="M700 860 H1210 L1250 800 H1400 Q1470 800 1480 860 L1484 930 Q1470 950 1400 950 H740 Q700 950 700 920Z" fill="#e8c23a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={700} y={880} width={784} height={16} fill="#2f8f5a" />
    <path d="M1372 430 L1440 650 L1470 820" fill="none" stroke="#c9ced6" strokeWidth={10} strokeLinecap="round" />
    <path d="M1360 440 L1424 640 H1400 L1350 470Z" fill="#bfe0ea" opacity={0.35} />
    <circle cx={1468} cy={820} r={18} fill="#fff6c8" stroke={INK} strokeWidth={4} />
    <path d="M1250 720 L1330 700" stroke={INK} strokeWidth={10} strokeLinecap="round" />
    <line x1={METER.x} y1={METER.y + 22} x2={METER.x + 10} y2={720} stroke={INK} strokeWidth={8} />
    <rect x={METER.x - 46} y={METER.y - 26} width={92} height={52} rx={8} fill="#2a2d36" stroke={INK} strokeWidth={5} />
    <rect x={METER.x - 38} y={METER.y - 18} width={76} height={30} rx={4} fill="#3a0d14" />
    <text x={METER.x} y={METER.y + 6} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill="#ff5a6e"
      opacity={0.85 + 0.15 * Math.sin(frame / 7)} letterSpacing={3}>084</text>
    <rect x={METER.x + 40} y={METER.y - 70} width={10} height={48} rx={4} fill="#d8344f" stroke={INK} strokeWidth={3} />
  </g>
);

/** A coin, centred. */
const Coin: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g><ellipse cx={x} cy={y} rx={11} ry={5} fill="#c9ced6" stroke={INK} strokeWidth={2.5} /><ellipse cx={x} cy={y - 1} rx={6} ry={2} fill="#e9eef3" /></g>
);

export const AutoShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const c = k.clips;
  const shot = current(frame, [[k.auto, "count"], [k.meter, "meter"], [k.bow, "bow"], [k.back, "you"]]);
  // Him: turned round on his seat, counting four coins into your palm; then hands folded and a bow, twice; then back
  // to the road for the hold.
  const driving = frame >= k.back + 6;
  const folded = (frame >= k.fold && frame < k.meter) || (frame >= k.bow && !driving);
  const counting = frame < k.fold;
  const bowFrom = frame >= k.bow ? k.bow : k.fold;
  const bow = folded ? Math.max(0, Math.sin(((frame - bowFrom) / 22) * Math.PI)) * 20 : 0;
  const drv0 = aimed(DRIVER_X, seatedY(DRIVER_SEAT, S), S, driving ? 1 : -1, { ...CHAIR_SIT, lean: driving ? 4 : 14 + bow }, null);
  const sh = shoulderAt(drv0);
  const chest = { x: sh.x - 52, y: sh.y + 30 };
  const drv = driving
    ? aimed(DRIVER_X, drv0.y, S, 1, { ...CHAIR_SIT, lean: 4 }, { x: 1290, y: 712 }, { x: 1280, y: 720 })
    : folded ? aimed(DRIVER_X, drv0.y, S, -1, drv0.pose, chest, { x: chest.x + 6, y: chest.y + 4 })
      : aimed(DRIVER_X, drv0.y, S, -1, drv0.pose, { x: PALM.x + 10, y: PALM.y - 44 }, null);
  const dHead = headAt(drv.x, drv.y, S, drv.pose, drv.facing);
  const dFace = driving
    ? { ...EXPRESSIONS.neutral, look: { x: 0.9, y: 0 } }
    : counting ? { brows: "flat" as const, lids: 0.3, mouth: "flat" as const, eyes: 1, look: { x: 0.9, y: 0.8 } }
      : { brows: "raised" as const, lids: 0.35, mouth: talk(frame, c[18], "smile", "open", "smile"), eyes: 1, look: { x: 0.9, y: 0.1 } };
  // The coins: four drop from his fingers into your palm, one by one.
  const drops = [4, 9, 14, 19].map((d) => k.auto + d);
  const coins = drops.map((at, i) => {
    if (frame < at) return null;
    const p = ramp(frame, at, at + 5);
    const top = { x: PALM.x + 4, y: PALM.y - 40 };
    return <Coin key={i} x={mix(top.x, PALM.x - 6 + i * 3, p)} y={mix(top.y, PALM.y - 8 - i * 4, p)} />;
  });
  // You: palm out for the change, then looking at it in your lap, then up at the back of his head.
  const you = aimed(YOU_X, seatedY(BENCH, S), S, 1, CHAIR_SIT, PALM, null);
  const youHead = headAt(you.x, you.y, S, you.pose);
  const yFace = ({
    count: { ...EXPRESSIONS.neutral, look: { x: 0.8, y: 0.7 } },
    meter: { ...EXPRESSIONS.neutral, look: { x: 0.8, y: 0.7 } },
    bow: { ...EXPRESSIONS.shocked, mouth: "flat" as const, eyes: 1.15, look: { x: 0.9, y: 0 } },
    you: frame < k.backLook ? { brows: "flat" as const, lids: 0.3, mouth: "flat" as const, eyes: 1, look: { x: 0.6, y: 0.85 } }
      : { brows: "worry" as const, lids: 0.15, mouth: "flat" as const, eyes: 1.05, look: { x: 0.95, y: -0.1 } },
  })[shot];
  const palmHand = handAt(you);
  const actors = (
    <>
      <AutoBody />
      <Figure {...HERO} x={you.x} y={you.y} scale={S} pose={you.pose} {...yFace} blink={blinking(frame, 1)} time={frame} />
      {coins}
      <Figure x={drv.x} y={drv.y} scale={S} facing={drv.facing} pose={drv.pose} head={DRIVER.head} coat={DRIVER.coat} {...dFace} blink={blinking(frame, 9)} time={frame} />
      <OnHead {...drv}><Moustache /></OnHead>
      <AutoFront frame={frame} />
      {/* your fingers curl over the coins once they are all in */}
      {frame >= drops[3] + 8 && <circle cx={palmHand.x + 4} cy={palmHand.y - 6} r={10} fill={HERO.head} stroke={INK} strokeWidth={2} />}
    </>
  );
  const cams: Record<typeof shot, Camera> = {
    count: camAt(frame, [[k.auto, { x: 1040, y: 690, zoom: 1.75 }], [k.fold, { x: 1050, y: 670, zoom: 1.6 }], [k.meter, { x: 1060, y: 660, zoom: 1.5 }]]),
    meter: camAt(frame, [[k.meter, insert(METER.x - 10, METER.y - 10, 4.2)], [k.bow, insert(METER.x - 10, METER.y - 10, 4.6)]]),
    bow: camAt(frame, [[k.bow, { x: 1080, y: 640, zoom: 1.35 }], [k.back, { x: 1070, y: 650, zoom: 1.45 }]]),
    you: camAt(frame, [[k.back, closeUp(youHead.x + 140, youHead.y + 10, 2.3)], [k.tue, closeUp(youHead.x + 150, youHead.y + 4, 2.55)]]),
  };
  const cam = drift(cams[shot], frame, "auto", shot === "meter" ? 1.5 : 3);
  const m = toScreen(cam, METER.x, METER.y);
  const look = moodLook("night", { glows: [{ x: m.x, y: m.y, r: 90 * cam.zoom, color: "#ff5a6e", strength: 0.45 }] });
  return (
    <LookContext.Provider value={look}>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<NightStreet cam={cam} frame={frame} />} actors={actors} />
    </LookContext.Provider>
  );
};

