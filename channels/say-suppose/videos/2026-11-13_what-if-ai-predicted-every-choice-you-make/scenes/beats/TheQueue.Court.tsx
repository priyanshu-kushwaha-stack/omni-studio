// Helpers for "The Queue" (TheQueue.tsx), the morning at your stall (sets/FoodCourt, open): the television high in the
// corner of the court, the Newsreader on it over a shaky phone clip of your counter last night (two crimson cards), then
// over the city's board back at 99.5; the queue down the court, every person in it holding a key out across your
// counter, palm up, under HANDS OVER KEY 97%; your best friend with his arms folded ("That was ours."); the landlord's
// envelope ("Full rent."); and the coffee seller sliding the cup across anyway ("Full price. Same?").
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import { setLook } from "@whatif/kit/sets/common";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { RateBoard, Tag, TealLamp, type BoardKey, type TagKey } from "../device";
import { Apron, headAt, PaperCap } from "../kit";
import { blinking, COFFEE, FRIEND, HERO, LANDLORD, mix, noise, PASTELS, ramp } from "../shared";
import { COURT, CoffeeCounter, FoodCourtBack, foodCourtLights, StallCounter } from "../sets/FoodCourt";
import { BrassKey } from "./TheKey.Frame";
import { talking } from "./TheKey.Court";

/** The moments these shots need, in whole-film frames (TheQueue.tsx's times()). */
export interface QT {
  start: number; screen: number; l101end: number; l102: number; hold: number; flapNew: number; flapTick: number; slide: number; folded: number;
  l103: number; l103end: number; l104: number; ripple: number; tv2: number; l105: number; l105end: number; score: number;
  l106: number; open: number; l106end: number; l107: number; glance: number; l108: number; l108end: number;
}

const S = COURT.scale;
export const crimson = (from: number): TagKey[] => [{ at: from, text: "UNPREDICTABLE", pct: null, state: "crimson" }];
const SHIRTS = ["#3b4a6b", "#2a2d36", "#5f3d6b", "#2f5f63", "#6b5a33", "#7a3b46"];

// ------------------------------------------------------------------------------------------------ the television

/** Where the court's television hangs (world, at REF): high in the left corner, by the pillar. */
export const TV = { x: 230, y: 120, w: 420, h: 250 };

/** The Newsreader at her desk, full frame (screen pixels): a studio of dark blue, a crimson band with no lettering, and
 *  an inset over her shoulder: a shaky phone clip of your counter last night ("clip"), or the city's board ("board").
 *  She speaks while `speak` says so; on "ninety-nine" a flicker of relief (the laugh). */
export const NewsDesk: React.FC<{ frame: number; inset: "clip" | "board"; speaking: boolean; relief: boolean; score: BoardKey[]; from: number; role?: boolean }> = ({
  frame, inset, speaking, relief, score, from, role = false,
}) => {
  const shake = { x: (noise(frame * 0.7) - 0.5) * 16, y: (noise(frame * 0.9 + 40) - 0.5) * 12 };
  return (
    <g>
      <rect x={-200} y={-200} width={2320} height={1480} fill="#1d2550" />
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={i * 340 - 40} y={0} width={10} height={1080} fill="#26306a" />)}
      {/* the inset, upper right */}
      <g transform="translate(1080 150)">
        <rect x={-14} y={-14} width={728} height={438} rx={10} fill={INK} />
        <svg x={0} y={0} width={700} height={410} viewBox="0 0 700 410">
          {inset === "clip" ? (
            <g transform={`translate(${shake.x} ${shake.y}) rotate(${(noise(frame * 0.5 + 9) - 0.5) * 2} 350 205)`}>
              <rect x={-60} y={-60} width={820} height={530} fill="#10121b" />
              <path d="M200 -10 L330 70 L410 70 L560 470 L60 470Z" fill="#ffd98a" opacity={0.12} />
              <circle cx={370} cy={70} r={14} fill="#fff1c2" />
              <circle cx={210} cy={250} r={52} fill={MUSTARD} stroke={INK} strokeWidth={5} />
              <circle cx={500} cy={262} r={46} fill={FRIEND.head} stroke={INK} strokeWidth={5} />
              <rect x={-60} y={330} width={820} height={160} fill="#5a3b2a" stroke={INK} strokeWidth={5} />
              <rect x={300} y={286} width={110} height={44} rx={6} fill="#3a4150" stroke={INK} strokeWidth={4} />
              <Tag frame={frame} x={210} headY={250} r={52} scale={0.85} threadTop={-60} keys={crimson(from)} />
              <Tag frame={frame} x={500} headY={262} r={46} scale={0.9} threadTop={-60} keys={crimson(from)} />
            </g>
          ) : (
            <g>
              <rect x={0} y={0} width={700} height={410} fill="#14183a" />
              <RateBoard frame={frame} x={350} y={90} size={110} label="CITY SCORE" keys={score} />
            </g>
          )}
        </svg>
        {inset === "clip" && <circle cx={660} cy={36} r={12} fill={CRIMSON} opacity={Math.floor(frame / 15) % 2 ? 1 : 0.35} />}
      </g>
      {/* the Newsreader */}
      <Figure x={620} y={1240} scale={2.6} facing={1} pose={{ ...STAND, armF: [40, 50], armB: [30, 50] }} head={PASTELS[4]} coat="#2f3340" tie={CRIMSON}
        brows={relief ? "raised" : "flat"} lids={relief ? 0 : 0.15} mouth={speaking ? "open" : relief ? "smile" : "flat"} eyes={relief ? 1.15 : 1}
        look={{ x: 0.15, y: 0 }} blink={blinking(frame, 11)} time={frame} />
      {/* her role tag at her first close-up, a small stamped card off her face (owner, 2026-11-14) */}
      {role && (
        <g transform="translate(150 230) rotate(-4)">
          <line x1={110} y1={-300} x2={110} y2={0} stroke={PAPER} strokeWidth={3} opacity={0.7} />
          <rect x={0} y={0} width={300} height={66} rx={10} fill={PAPER} stroke={INK} strokeWidth={5} />
          <text x={150} y={45} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={INK} letterSpacing={2}>NEWSREADER</text>
        </g>
      )}
      <rect x={-200} y={820} width={2320} height={500} fill="#2b335f" stroke={INK} strokeWidth={8} />
      <rect x={-200} y={820} width={2320} height={26} fill="#3c4682" />
      <rect x={60} y={900} width={1300} height={92} fill={CRIMSON} />
      <rect x={100} y={930} width={520} height={30} rx={15} fill={PAPER} opacity={0.85} />
      <rect x={660} y={930} width={300} height={30} rx={15} fill={PAPER} opacity={0.5} />
    </g>
  );
};

/** The television's bezel over a full-frame NewsDesk (front slot, screen pixels at REF). */
export const Bezel: React.FC = () => <path d="M-400 -400 H2320 V1480 H-400Z M40 40 H1880 V1040 H40Z" fillRule="evenodd" fill="#14161f" />;

/** The television in the court's corner (world): a dark set on a bracket, the NewsDesk playing on it small. */
const CornerTv: React.FC<{ frame: number; desk: React.ReactNode }> = ({ desk }) => (
  <g>
    <line x1={TV.x + TV.w / 2} y1={-600} x2={TV.x + TV.w / 2} y2={TV.y} stroke="#14161f" strokeWidth={10} />
    <rect x={TV.x - 16} y={TV.y - 16} width={TV.w + 32} height={TV.h + 32} rx={14} fill="#14161f" stroke={INK} strokeWidth={6} />
    <svg x={TV.x} y={TV.y} width={TV.w} height={TV.h} viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">{desk}</svg>
  </g>
);

// ------------------------------------------------------------------------------------------------ the queue

/** The queue down the court in front of your counter, first in line nearest you; each one faces your counter. */
export const QUEUE = [1430, 1670, 1910, 2150, 2390, 2630, 2870];

/** One person in the queue: their arm out across your counter, palm up, a key on it; their card HANDS OVER KEY 97%. */
const InLine: React.FC<{ frame: number; x: number; i: number; keys: TagKey[]; grin?: boolean }> = ({ frame, x, i, keys, grin }) => {
  const y = COURT.customer.y + (i % 2) * 12;
  const out = i < 3;
  const pose: Pose = out ? { ...STAND, armF: [84, -12], lean: 6 } : { ...STAND, armF: [60, -20] };
  const h = headAt(x, y, S, pose, -1);
  return (
    <g>
      <Figure x={x} y={y} scale={S} facing={-1} pose={pose} head={PASTELS[(i * 3 + 1) % PASTELS.length]} coat={SHIRTS[i % SHIRTS.length]}
        brows={grin ? "raised" : "none"} mouth={grin ? "smile" : i % 3 === 1 ? "smirk" : "flat"} eyes={1.05} look={{ x: 1, y: 0.15 }} blink={blinking(frame, i + 13)}
        time={frame} held={<BrassKey x={0} y={-10} scale={0.36} rotate={-10} glint={0.2} />} />
      <Tag frame={frame} x={h.x} headY={h.y - (i % 2) * 110} r={h.r} scale={0.62} keys={keys} />
    </g>
  );
};

/** The first man's card: it flaps and ticks teal on the hold; everyone's ripples again by lunch. */
export const firstKeys = (k: QT): TagKey[] => [
  { at: k.start - 400, text: "HANDS OVER KEY", pct: 97, state: "tick" },
  { at: k.flapNew, text: "HANDS OVER KEY", pct: 97, state: "new" },
  { at: k.flapTick, text: "HANDS OVER KEY", pct: 97, state: "tick" },
];
export const rippleKeys = (k: QT, i: number): TagKey[] => [
  { at: k.start - 400, text: "HANDS OVER KEY", pct: 97, state: "tick" },
  { at: k.ripple + i * 6, text: "HANDS OVER KEY", pct: 97, state: "tick" },
];
/** The coffee board: 1.50 for the man who did what his card said; back to 3.00 for you. */
export const coffeeKeys = (k: QT): BoardKey[] => [
  { at: k.start - 400, value: "1.50" }, { at: k.flapTick + 4, value: "1.50" }, { at: k.l106, value: "3.00" },
];

/** Your face and your friend's at the stall this morning. */
const youBody = { x: COURT.you.x, y: COURT.floor, scale: S, facing: 1 as const, pose: STAND };

export const QueueShot: React.FC<{ frame: number; k: QT; cam: Camera; tv?: boolean }> = ({ frame, k, cam, tv = true }) => {
  const folded: Pose = { ...STAND, armF: [25, 115], armB: [20, 118] };
  const himPose: Pose = frame >= k.hold ? folded : { ...STAND, armF: [20, 20] };
  const slide = ramp(frame, k.slide, k.slide + 22);
  const cupX = mix(1600, 1450, slide);
  const fh = headAt(COURT.friend.x, COURT.floor, S, himPose, -1);
  const yh = headAt(COURT.you.x, COURT.floor, S, STAND, 1);
  const herPose: Pose = frame >= k.slide - 4 && frame < k.slide + 30 ? { ...STAND, armF: [mix(70, 82, slide), -10] } : STAND;
  const ch = headAt(COURT.coffee.seller.x, COURT.coffee.seller.y, S, herPose, -1);
  const desk = <NewsDesk frame={frame} inset="clip" speaking={talking(frame, k.start, k.l101end)} relief={false} score={[]} from={k.start - 400} />;
  const actors = (
    <>
      {tv && <CornerTv frame={frame} desk={desk} />}
      <TealLamp frame={frame} x={COURT.pillar.lamp.x} y={COURT.pillar.lamp.y + 200} size={30} />
      <Figure {...youBody} {...HERO} brows="raised" lids={0} mouth={frame >= k.flapTick ? "smirk" : "o"} eyes={1.1} look={{ x: 1, y: 0.15 }} time={frame} blink={blinking(frame, 1)} />
      <Apron b={youBody} />
      <Figure x={COURT.friend.x} y={COURT.floor} scale={S} facing={-1} pose={himPose} head={FRIEND.head} coat={FRIEND.coat}
        brows={frame >= k.hold ? "angry" : "raised"} lids={0.15} mouth={talking(frame, k.l103, k.l103end) ? "open" : "flat"} eyes={1} look={{ x: -1, y: 0.1 }}
        time={frame} blink={blinking(frame, 2)} />
      <Apron b={{ x: COURT.friend.x, y: COURT.floor, scale: S, facing: -1, pose: himPose }} />
      <Tag frame={frame} x={yh.x} headY={yh.y} r={yh.r} scale={0.55} keys={crimson(k.start - 400)} />
      <Tag frame={frame} x={fh.x} headY={fh.y} r={fh.r} scale={0.55} keys={crimson(k.start - 400)} />
      <Figure x={COURT.coffee.seller.x} y={COURT.coffee.seller.y} scale={S} facing={-1} pose={herPose} head={COFFEE.head} coat={COFFEE.coat}
        brows="flat" lids={0.3} mouth="flat" look={{ x: 1, y: 0.3 }} time={frame} blink={blinking(frame, 9)} />
      <PaperCap x={ch.x} y={ch.y} r={ch.r} color={COFFEE.cap} />
      <RateBoard frame={frame} x={COURT.priceBoard.x} y={COURT.priceBoard.y} size={56} keys={coffeeKeys(k)} />
      <CoffeeCounter />
      {frame >= k.slide && <path d={`M${cupX - 20} ${COURT.coffee.top} l4 -56 h32 l4 56z`} fill="#f3e9d7" stroke={INK} strokeWidth={4} />}
      <StallCounter />
      {QUEUE.map((x, i) => (
        <InLine key={x} frame={frame} x={x} i={i} keys={i === 0 ? firstKeys(k) : rippleKeys(k, i)} grin={i === 0 || frame >= k.ripple + i * 6} />
      )).reverse()}
    </>
  );
  return (
    <LookContext.Provider value={setLook(foodCourtLights, "morning", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<FoodCourtBack cam={cam} mood="morning" frame={frame} />} actors={actors} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ the landlord, the coffee

/** An envelope with the landlord's grey seal, in a hand (figure units). */
const Envelope: React.FC<{ open?: boolean }> = ({ open }) => (
  <g transform="rotate(-12) translate(-10 -30)">
    <rect x={-34} y={-22} width={68} height={44} rx={4} fill="#f3e9d7" stroke={INK} strokeWidth={4} />
    {open ? <path d="M-34 -22 L0 -44 L34 -22" fill="#e8dcc4" stroke={INK} strokeWidth={4} /> : <path d="M-34 -22 L0 2 L34 -22" fill="none" stroke={INK} strokeWidth={3} />}
    <circle cx={0} cy={6} r={8} fill={LANDLORD.head} />
  </g>
);

/** The stall: the landlord hands your best friend an envelope; he opens it under his crimson card and doesn't look up at
 *  it; the landlord looks up at it for him. */
export const RentShot: React.FC<{ frame: number; k: QT; cam: Camera }> = ({ frame, k, cam }) => {
  const handed = frame >= k.open;
  const fh = headAt(COURT.friend.x, COURT.floor, S, STAND, -1);
  const yh = headAt(COURT.you.x, COURT.floor, S, STAND, 1);
  const himPose: Pose = { ...STAND, armF: handed ? [55, 75] : [20, 20], armB: handed ? [40, 80] : [-7, 8] };
  const lPose: Pose = { ...STAND, armF: handed ? [20, 20] : [80, 10] };
  const actors = (
    <>
      <Figure {...youBody} {...HERO} brows="raised" lids={0.1} mouth="smile" look={{ x: 1, y: 0.2 }} time={frame} blink={blinking(frame, 1)} />
      <Apron b={youBody} />
      <Figure x={COURT.friend.x} y={COURT.floor} scale={S} facing={-1} pose={himPose} head={FRIEND.head} coat={FRIEND.coat} brows="flat" lids={0.2}
        mouth={frame >= k.l106end ? "smirk" : "flat"} look={{ x: 0.3, y: 0.9 }} time={frame} blink={blinking(frame, 2)} held={handed ? <Envelope open /> : undefined} />
      <Apron b={{ x: COURT.friend.x, y: COURT.floor, scale: S, facing: -1, pose: himPose }} />
      <Tag frame={frame} x={fh.x} headY={fh.y} r={fh.r} scale={0.6} keys={crimson(k.start - 400)} />
      <Tag frame={frame} x={yh.x} headY={yh.y} r={yh.r} scale={0.6} keys={crimson(k.start - 400)} />
      <StallCounter />
      <Figure x={COURT.customer.x} y={COURT.customer.y} scale={S} facing={-1} pose={lPose} head={LANDLORD.head} coat={LANDLORD.coat} tie={LANDLORD.tie}
        brows={frame >= k.l106 ? "raised" : "flat"} lids={0.2} mouth={talking(frame, k.l106, k.l106end) ? "open" : "flat"} eyes={frame >= k.l106 ? 1.1 : 1}
        look={frame >= k.l106 + 10 ? { x: 0.5, y: -0.9 } : { x: 1, y: 0.2 }} time={frame} blink={blinking(frame, 6)} held={handed ? undefined : <Envelope />} />
    </>
  );
  return (
    <LookContext.Provider value={setLook(foodCourtLights, "morning", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<FoodCourtBack cam={cam} mood="morning" frame={frame} />} actors={actors} />
    </LookContext.Provider>
  );
};

/** You at the coffee stall: her board on 3.00, your crimson card; she looks at it, then at you, and slides the cup
 *  across anyway (the scrape of the cup on steel). */
export const CupShot: React.FC<{ frame: number; k: QT; cam: Camera }> = ({ frame, k, cam }) => {
  const you = { x: 1290, y: COURT.customer.y };
  const yh = headAt(you.x, you.y, S, STAND, 1);
  const slide = ramp(frame, k.l108end - 4, k.l108end + 18);
  const herLook = frame < k.glance ? { x: 0.9, y: -0.6 } : { x: 1, y: 0.05 };
  const reach = frame >= k.l108end - 10 ? ramp(frame, k.l108end - 10, k.l108end) : 0;
  const herPose: Pose = { ...STAND, armF: [mix(30, 84, reach), mix(30, -10, reach)] };
  const ch = headAt(COURT.coffee.seller.x, COURT.coffee.seller.y, S, herPose, -1);
  const cup = { x: mix(1600, 1440, slide), y: COURT.coffee.top };
  const actors = (
    <>
      <Figure x={COURT.coffee.seller.x} y={COURT.coffee.seller.y} scale={S} facing={-1} pose={herPose} head={COFFEE.head} coat={COFFEE.coat}
        brows={frame < k.glance ? "flat" : "raised"} lids={frame < k.glance ? 0.35 : 0.1} mouth={talking(frame, k.l108, k.l108end) ? "open" : frame >= k.l108end ? "smirk" : "flat"}
        look={herLook} time={frame} blink={blinking(frame, 9)} />
      <PaperCap x={ch.x} y={ch.y} r={ch.r} color={COFFEE.cap} />
      <RateBoard frame={frame} x={COURT.priceBoard.x} y={COURT.priceBoard.y} size={56} keys={coffeeKeys(k)} />
      <CoffeeCounter />
      <path d={`M${cup.x - 26} ${cup.y} L${cup.x - 22} ${cup.y - 70} H${cup.x + 22} L${cup.x + 26} ${cup.y}Z`} fill="#f3e9d7" stroke={INK} strokeWidth={5} />
      <rect x={cup.x - 21} y={cup.y - 62} width={42} height={52} fill="#6b4a32" opacity={0.9} />
      <Figure x={you.x} y={you.y} scale={S} facing={1} pose={STAND} {...HERO} brows="raised" lids={0.1} mouth={frame >= k.l108end + 10 ? "smile" : "flat"}
        look={{ x: 1, y: 0.1 }} time={frame} blink={blinking(frame, 1)} />
      <Tag frame={frame} x={yh.x} headY={yh.y} r={yh.r} scale={0.6} keys={crimson(k.start - 400)} />
    </>
  );
  return (
    <LookContext.Provider value={setLook(foodCourtLights, "morning", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<FoodCourtBack cam={cam} mood="morning" frame={frame} />} actors={actors} />
    </LookContext.Provider>
  );
};
