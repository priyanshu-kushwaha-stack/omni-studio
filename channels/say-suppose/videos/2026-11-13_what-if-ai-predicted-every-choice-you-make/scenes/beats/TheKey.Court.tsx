// Helpers for "The Key" (TheKey.tsx): the court reacting to the peak. The coffee seller's phone slipping out of her hand
// and clattering on her counter (the laugh, with the kid); the kid with the cap standing on his chair at the last lit
// table ("Do it again."); and the high wide of the court, two crimson cards under one lamp, every face turned toward
// them, every other card still teal, and on the pillar the city's board flapping down for the first time: 99.4.
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { HandPhone } from "@whatif/kit/sets/props";
import { LookContext } from "@whatif/kit/stage/Look";
import { setLook } from "@whatif/kit/sets/common";
import { drift } from "@whatif/kit/stage/shots";
import { Stage } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { RateBoard, Tag, TealLamp, type BoardKey, type TagKey } from "../device";
import { Apron, handAt, headAt, PaperCap, type Body } from "../kit";
import { blinking, camAt, COFFEE, FRIEND, HERO, KID, mix, PASTELS, ramp } from "../shared";
import { CashBox, COURT, FoodCourtBack, foodCourtLights, StallCounter, StallLamp } from "../sets/FoodCourt";
import { KeyBack } from "./TheKey.Frame";

/** The moments these shots need, in whole-film frames (TheKey.tsx's times()). */
export interface CourtTimes { start: number; peak: number; drop: number; kidUp: number; kid: number; kidEnd: number; wide: number;
  flapDown: number; end: number }

const teal = (from: number, text: string, pct: number): TagKey[] => [{ at: from, text, pct, state: "tick" }];
const CRIMSON_CARD = (from: number): TagKey[] => [{ at: from, text: "UNPREDICTABLE", pct: null, state: "crimson" }];

/** Speaking: the mouth opens and shuts while a line plays (no lip-sync). */
export const talking = (frame: number, from: number, until: number) => frame >= from && frame < until && Math.floor((frame - from) / 5) % 2 === 0;

// ------------------------------------------------------------------------------------------------ the phone

/** The coffee seller close at the edge of the dark court, phone up, filming; it slips, drops and clatters on her
 *  counter, bounces once and lies there lit; her hands stay up, empty, her mouth a round O. */
export const PhoneSlip: React.FC<{ frame: number; k: CourtTimes }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.drop - 20, { x: 1300, y: 640, zoom: 1.3 }], [k.drop + 40, { x: 1300, y: 690, zoom: 1.4 }]]), frame, "slip", 3);
  const s = 2.6;
  const b: Body = { x: 1300, y: 1500, scale: s, facing: -1, pose: { ...STAND, armF: [150, 30], armB: [140, 40] } };
  const gone = frame >= k.drop;
  const pose: Pose = gone ? { ...STAND, armF: [mix(150, 120, ramp(frame, k.drop, k.drop + 6)), 50], armB: [115, 55] } : b.pose;
  const h = headAt(b.x, b.y, s, pose, -1);
  const hand = handAt(b);
  const counterY = 1195;
  // the fall: gravity to the counter, one small bounce, then flat
  const t = frame - k.drop;
  const fallT = Math.min(1, Math.max(0, t / 11));
  const bounce = t > 11 && t < 19 ? Math.sin(((t - 11) / 8) * Math.PI) * 40 : 0;
  const py = mix(hand.y, counterY - 18, fallT * fallT) - bounce;
  const rot = mix(0, 92, Math.min(1, Math.max(0, t / 14)));
  const shake = t >= 11 && t < 17 ? Math.sin(t * 3) * 5 : 0;
  const actors = (
    <>
      <Figure x={b.x} y={b.y} scale={s} facing={-1} pose={pose} head={COFFEE.head} coat={COFFEE.coat} time={frame}
        brows={gone ? "raised" : "flat"} lids={gone ? 0 : 0.35} mouth={gone ? "o" : "flat"} eyes={gone ? 1.25 : 1}
        look={gone ? { x: 0.6, y: 0.7 } : { x: 1, y: 0.1 }} blink={blinking(frame, 9) && !gone} held={gone ? undefined : <g transform="scale(1.6)"><HandPhone lit /></g>} />
      <PaperCap x={h.x} y={h.y} r={h.r} color={COFFEE.cap} />
      <Tag frame={frame} x={h.x} headY={h.y} r={h.r} scale={0.6} keys={teal(k.start - 400, "LOOKS AT PHONE", 99)} />
      <g transform={`translate(${shake} 0)`}>
        <rect x={700} y={counterY} width={1400} height={400} fill="#2f5f63" stroke={INK} strokeWidth={8} />
        <rect x={680} y={counterY} width={1440} height={30} fill="#4a8a8a" stroke={INK} strokeWidth={6} />
      </g>
      {gone && <g transform={`translate(${hand.x - 20} ${py}) rotate(${rot}) scale(${1.6 * s})`}><HandPhone lit /></g>}
    </>
  );
  return (
    <LookContext.Provider value={setLook(foodCourtLights, "lamp", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<KeyBack cam={cam} frame={frame} peak={k.peak} drop={k.drop} kidUp={k.kidUp} />} actors={actors} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ the kid

/** The kid with the cap at the last lit table, standing on his chair, arms up: "Do it again." */
export const KidOnChair: React.FC<{ frame: number; k: CourtTimes }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.kid, { x: 980, y: 560, zoom: 1.55 }], [k.kidEnd, { x: 975, y: 545, zoom: 1.75 }]]), frame, "kid-chair", 3);
  const s = 2.0;
  const seat = 1000 - 120;
  const bob = Math.abs(Math.sin((frame - k.kid) / 5)) * 10 * (frame < k.kidEnd ? 1 : 0);
  const pose: Pose = { ...STAND, armF: [mix(150, 165, bob / 10), 12], armB: [mix(140, 160, bob / 10), 18] };
  const x = 960, y = seat - bob;
  const h = headAt(x, y, s, pose, 1);
  const actors = (
    <>
      {/* the last lit table: a bare bulb over it, a warm pool */}
      <line x1={1200} y1={-600} x2={1200} y2={150} stroke="#14161f" strokeWidth={6} />
      <circle cx={1200} cy={168} r={20} fill="#fff1c2" />
      <ellipse cx={1150} cy={1000} rx={520} ry={110} fill="#ffd98a" opacity={0.16} />
      <rect x={1080} y={760} width={360} height={20} fill="#6b6f7a" stroke={INK} strokeWidth={5} />
      <rect x={1252} y={780} width={16} height={230} fill="#4a4d5a" />
      <Figure x={x} y={y} scale={s} facing={1} pose={pose} head={KID.head} coat={KID.coat} cap={KID.cap} time={frame} brows="raised" lids={0}
        mouth={talking(frame, k.kid, k.kidEnd) ? "open" : "smile"} eyes={1.15} look={{ x: 1, y: 0.1 }} blink={blinking(frame, 7)} />
      <Tag frame={frame} x={h.x} headY={h.y} r={h.r} scale={0.6} keys={teal(k.start - 400, "STARES", 95)} />
      {/* his chair */}
      <rect x={x - 110} y={seat} width={220} height={22} rx={6} fill="#6b6f7a" stroke={INK} strokeWidth={5} />
      <rect x={x - 96} y={seat + 22} width={16} height={1000 - seat} fill="#4a4d5a" />
      <rect x={x + 80} y={seat + 22} width={16} height={1000 - seat} fill="#4a4d5a" />
    </>
  );
  return (
    <LookContext.Provider value={setLook([{ x: 1200, y: 200, r: 700, color: "#ffcf7a", strength: 0.5, moods: ["lamp"] }], "lamp", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<FoodCourtBack cam={cam} mood="lamp" frame={frame} diners={false} />} actors={actors} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ the wide

/** Faces in the dark court for the wide, each under a teal card (v2 TAG lines), every one turned toward the stall. */
const CROWD = [
  { x: -520, s: 1.5, text: "WIPES COUNTER", pct: 99 }, { x: -250, s: 1.6, text: "HUMS", pct: 99 }, { x: 20, s: 1.55, text: "STANDS STILL", pct: 99 },
  { x: 2050, s: 1.6, text: "LISTENS", pct: 99 }, { x: 2330, s: 1.5, text: "LOOKS AT PHONE", pct: 99 }, { x: 2600, s: 1.45, text: "STARES", pct: 95 },
];

/** The city's board on the pillar: 99.5 until it flaps down, for the first time, to 99.4. */
export const cityKeys = (k: CourtTimes): BoardKey[] => [{ at: k.start - 400, value: "99.5" }, { at: k.flapDown, value: "99.4" }];

export const CourtWide: React.FC<{ frame: number; k: CourtTimes }> = ({ frame, k }) => {
  const toBoard = ramp(frame, k.flapDown - 30, k.flapDown - 6);
  const cam = drift(camAt(frame, [[k.wide, { x: 980, y: 380, zoom: 0.6 }], [k.flapDown - 30, { x: 900, y: 450, zoom: 0.68 }],
    [k.flapDown - 6, { x: mix(900, 330, toBoard), y: 420, zoom: mix(0.68, 1.2, toBoard) }], [k.end, { x: 330, y: 430, zoom: 1.28 }]]), frame, "key-wide", 2);
  const S = COURT.scale;
  const you: Body = { x: COURT.you.x, y: COURT.floor, scale: S, facing: 1, pose: STAND };
  const him: Body = { x: COURT.friend.x, y: COURT.floor, scale: S, facing: -1, pose: STAND };
  const yh = headAt(you.x, you.y, S, STAND, 1);
  const hh = headAt(him.x, him.y, S, STAND, -1);
  const coffeeHead = headAt(COURT.coffee.seller.x, COURT.coffee.seller.y, S, STAND, -1);
  const kidX = 1250, kidY = COURT.floor + 40 - 110;
  const kh = headAt(kidX, kidY, 1.5, STAND, -1);
  const actors = (
    <>
      <StallLamp />
      <TealLamp frame={frame} x={COURT.pillar.lamp.x} y={COURT.pillar.lamp.y} size={34} />
      <RateBoard frame={frame} x={COURT.pillar.board.x} y={COURT.pillar.board.y} size={62} label="CITY SCORE" keys={cityKeys(k)} />
      <Figure {...you} {...HERO} brows="raised" lids={0} mouth="smile" look={{ x: 1, y: 0 }} time={frame} blink={blinking(frame, 1)} />
      <Figure {...him} head={FRIEND.head} coat={FRIEND.coat} brows="raised" lids={0} mouth="smile" look={{ x: 1, y: 0 }} time={frame} blink={blinking(frame, 2)} />
      <Apron b={him} />
      <StallCounter box={false} />
      <CashBox x={COURT.box.x - 90} y={COURT.counter.top} open={1} />
      <Figure x={COURT.coffee.seller.x} y={COURT.coffee.seller.y} scale={S} facing={-1} pose={{ ...STAND, armF: [120, 40], armB: [110, 50] }} head={COFFEE.head} coat={COFFEE.coat}
        brows="raised" mouth="o" eyes={1.15} look={{ x: 1, y: 0 }} time={frame} />
      <Tag frame={frame} x={coffeeHead.x} headY={coffeeHead.y} r={coffeeHead.r} scale={0.8} keys={teal(k.start - 400, "LOOKS AT PHONE", 99)} />
      {CROWD.map((c, i) => {
        const facing: 1 | -1 = c.x < 800 ? 1 : -1;
        const h = headAt(c.x, COURT.floor + 20, c.s, STAND, facing);
        return (
          <g key={i}>
            <Figure x={c.x} y={COURT.floor + 20} scale={c.s} facing={facing} pose={STAND} head={PASTELS[(i * 3) % PASTELS.length]} coat={i % 2 ? "#2a2d36" : "#3b4a6b"}
              brows="raised" mouth={i % 2 ? "o" : "flat"} eyes={1.15} look={{ x: 1, y: 0.1 }} time={frame} blink={blinking(frame, i + 4)} />
            <Tag frame={frame} x={h.x} headY={h.y} r={h.r} scale={0.9} keys={teal(k.start - 400, c.text, c.pct)} />
          </g>
        );
      })}
      {/* the kid, still up on his chair at the far table */}
      <rect x={kidX - 70} y={kidY} width={140} height={16} fill="#3a3e4c" stroke={INK} strokeWidth={4} />
      <Figure x={kidX} y={kidY} scale={1.5} facing={-1} pose={{ ...STAND, armF: [150, 10], armB: [140, 20] }} head={KID.head} coat={KID.coat} cap={KID.cap}
        brows="raised" mouth="smile" eyes={1.1} look={{ x: 1, y: 0.1 }} time={frame} blink={blinking(frame, 7)} />
      <Tag frame={frame} x={kh.x} headY={kh.y} r={kh.r} scale={0.9} keys={teal(k.start - 400, "STARES", 95)} />
      <Tag frame={frame} x={yh.x} headY={yh.y} r={yh.r} scale={0.85} keys={CRIMSON_CARD(k.start - 400)} />
      <Tag frame={frame} x={hh.x} headY={hh.y} r={hh.r} scale={0.85} keys={CRIMSON_CARD(k.start - 400)} />
    </>
  );
  return (
    <LookContext.Provider value={setLook(foodCourtLights, "lamp", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<FoodCourtBack cam={cam} mood="lamp" frame={frame} diners={false} />} actors={actors} />
    </LookContext.Provider>
  );
};
