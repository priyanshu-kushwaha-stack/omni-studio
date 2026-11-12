// The Cheapest Man at the stall: his phone lighting up and turned face down (48, the sister planted), the performed
// six-second TELLS JOKE 62% hold and the counting (49, 50), your hand on the lid, the key, your pocket (51), and the
// lamppost outside, CITY SCORE 99.5 under the steady teal lamp (52).
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { Sky, Skyline } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { RateBoard, Tag, TealLamp } from "../device";
import { aimArm, Apron, headAt, type Body } from "../kit";
import { blinking, camAt, current, FRIEND, HERO, mix, ramp } from "../shared";
import { Deep } from "../sets/common";
import { CashBox, COURT, FoodCourtBack, foodCourtLights, Key, StallCounter, StallLamp } from "../sets/FoodCourt";
import { Coin, glide, Shot } from "./TheCityPlays.Parts";
import { boards, tags, type T } from "./TheCheapestMan.Times";

/** His sister's colour on the phone's avatar (she is heard, never seen, until 6:55). */
export const SISTER = "#e6a0a0";

const YOU_B: Body = { x: COURT.you.x, y: COURT.you.y, scale: COURT.scale, facing: 1, pose: STAND };
const FR_B: Body = { x: COURT.friend.x, y: COURT.friend.y, scale: COURT.scale, facing: -1, pose: STAND };
const PHONE_AT = { x: 1000, y: COURT.counter.top };
const COINS = [880, 905, 930, 955, 980, 1005];

type Face = Partial<React.ComponentProps<typeof Figure>>;

/** The stall with the two of you behind the counter: your pose and face, his pose and face, the box, the phone. */
const Stall: React.FC<{
  frame: number; cam: Camera; mood: MoodName; you: Pose; youFace: Face; fr: Pose; frFace: Face; boxOpen: number; phone: "up" | "down" | null;
  coins?: boolean; keyNode?: React.ReactNode; youHeld?: React.ReactNode; card?: boolean; k: T;
}> = ({ frame, cam, mood, you, youFace, fr, frFace, boxOpen, phone, coins, keyNode, youHeld, card, k }) => {
  const fh = headAt(FR_B.x, FR_B.y, FR_B.scale, fr, -1);
  const ringing = phone === "up";
  const actors = (
    <>
      <Figure {...YOU_B} pose={you} {...HERO} coat="#3b3e47" blink={blinking(frame, 0)} time={frame} held={youHeld} {...youFace} />
      <Apron b={{ ...YOU_B, pose: you }} />
      <Figure {...FR_B} pose={fr} head={FRIEND.head} coat={FRIEND.coat} blink={blinking(frame, 2)} time={frame} {...frFace} />
      <Apron b={{ ...FR_B, pose: fr }} />
      {ringing && <ellipse cx={fh.x - 10} cy={fh.y + fh.r * 0.5} rx={fh.r} ry={fh.r * 0.55} fill="#d6eef7" opacity={0.2} />}
      <StallCounter box={false} />
      <CashBox x={COURT.box.x} y={COURT.counter.top} open={boxOpen} />
      {keyNode}
      {coins && COINS.map((x, i) => <Coin key={i} x={x} y={COURT.counter.top - 7} r={11} edge={0.45} />)}
      {phone && (
        <g transform={`translate(${PHONE_AT.x + (ringing ? Math.sin(frame * 2.1) * 2 : 0)} ${PHONE_AT.y})`}>
          {ringing && <ellipse cx={0} cy={-10} rx={60 + (frame % 20) * 2} ry={22} fill="#d6eef7" opacity={0.25 * (1 - (frame % 20) / 20)} />}
          <rect x={-40} y={-9} width={80} height={9} rx={3} fill="#1b1d24" />
          <rect x={-34} y={-11} width={68} height={3} rx={1.5} fill={ringing ? "#d6eef7" : "#1b1d24"} />
        </g>
      )}
      {card && <Tag frame={frame} x={fh.x} headY={fh.y} r={fh.r} keys={tags(k).friend} />}
    </>
  );
  return (
    <Shot cam={cam} mood={mood} lights={foodCourtLights} back={<><FoodCourtBack cam={cam} mood={mood} frame={frame} /><StallLamp /></>} actors={actors} />
  );
};

/** The counter from straight above: the phone face up, ringing, his sister's face on it; his hand turns it over. */
const PhoneTop: React.FC<{ frame: number; k: T; mood: MoodName }> = ({ frame, k, mood }) => {
  const flip = ramp(frame, k.flip + 6, k.flip + 18);
  const sx = Math.cos(flip * Math.PI);
  const ringing = flip < 0.5;
  const handIn = frame >= k.flip ? ramp(frame, k.flip - 4, k.flip + 6) * (1 - ramp(frame, k.flip + 24, k.flip + 36)) : 0;
  const cam = drift(frame < k.flip ? camAt(frame, [[k.phone, { x: 960, y: 540, zoom: 1.0 }], [k.look, { x: 960, y: 540, zoom: 1.08 }]]) : { x: 960, y: 540, zoom: 1.04 }, frame, "ptop", 2);
  const buzz = ringing ? Math.sin(frame * 2.3) * 4 : 0;
  const back = (
    <g>
      <rect x={-1400} y={-900} width={4800} height={2600} fill="#8a5d3c" />
      {Array.from({ length: 18 }, (_, i) => <path key={i} d={`M-400 ${-100 + i * 80} Q900 ${-60 + i * 80} 2400 ${-110 + i * 80}`} stroke="#6b452c" strokeWidth={6} fill="none" opacity={0.5} />)}
      <circle cx={420} cy={300} r={90} fill="#e8b84a" stroke={INK} strokeWidth={8} opacity={0.9} />
      <circle cx={360} cy={520} r={90} fill="#e8b84a" stroke={INK} strokeWidth={8} opacity={0.9} />
    </g>
  );
  const actors = (
    <g>
      <g transform={`translate(${960 + buzz} 540) rotate(-8) scale(${sx} 1)`}>
        <rect x={-170} y={-320} width={340} height={640} rx={44} fill="#1b1d24" stroke={INK} strokeWidth={8} />
        {sx > 0 ? (
          <g>
            <rect x={-146} y={-286} width={292} height={572} rx={24} fill="#2f3550" />
            {ringing && [0, 1, 2].map((i) => {
              const p = ((frame / 24) + i / 3) % 1;
              return <circle key={i} cx={0} cy={-80} r={90 + p * 110} fill="none" stroke="#d6eef7" strokeWidth={6} opacity={0.6 * (1 - p)} />;
            })}
            <circle cx={0} cy={-80} r={84} fill="#3a3550" />
            <circle cx={0} cy={-96} r={36} fill={SISTER} />
            <path d="M-52 -18 Q0 -64 52 -18Z" fill={PAPER} opacity={0.8} />
            <rect x={-90} y={40} width={180} height={18} rx={9} fill={PAPER} opacity={0.75} />
            <circle cx={-80} cy={200} r={40} fill="#d8344f" />
            <circle cx={80} cy={200} r={40} fill="#1d9a8f" />
          </g>
        ) : (
          <g>
            <rect x={-146} y={-286} width={292} height={572} rx={24} fill="#3a3e4a" />
            <circle cx={-90} cy={-230} r={26} fill="#1b1d24" stroke="#5a5f6e" strokeWidth={6} />
          </g>
        )}
      </g>
      {/* his hand, from the right: a peach palm and a dark sleeve */}
      {handIn > 0 && (
        <g transform={`translate(${mix(2300, 1110, handIn)} ${560}) rotate(-12)`}>
          <rect x={60} y={-70} width={1200} height={140} rx={60} fill="#3b3e47" stroke={INK} strokeWidth={8} />
          <ellipse cx={0} cy={0} rx={130} ry={96} fill={FRIEND.head} stroke={INK} strokeWidth={8} />
        </g>
      )}
    </g>
  );
  return <Shot cam={cam} mood={mood} lights={[]} back={back} actors={actors} />;
};

/** Line 48: his phone lights up, his face over it, the turn face down, you looking at the back of it, then at him. */
export const PhoneLights: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const on = current(frame, [[k.phone, "top"], [k.look, "him"], [k.flip, "top2"], [k.ask, "two"]]);
  if (on === "top" || on === "top2") return <PhoneTop frame={frame} k={k} mood="dusk" />;
  const fh = headAt(FR_B.x, FR_B.y, FR_B.scale, STAND, -1);
  const cam = drift(on === "him"
    ? camAt(frame, [[k.look, closeUp(fh.x - 60, fh.y + 40, 2.3)], [k.flip, closeUp(fh.x - 60, fh.y + 40, 2.45)]])
    : camAt(frame, [[k.ask, { x: 820, y: 560, zoom: 1.5 }], [k.hold, { x: 820, y: 560, zoom: 1.58 }]]), frame, "phone", 3);
  const wipe = on === "two" && frame >= k.ask + 20;
  const fr: Pose = wipe ? { ...STAND, armF: aimArm(FR_B, { x: 1040 + Math.sin((frame - k.ask) / 6) * 60, y: COURT.counter.top - 10 }) } : { ...STAND, armF: [40, 50] };
  const youLook = frame >= k.ask + 34 ? { x: 0.9, y: -0.1 } : { x: 0.7, y: 0.75 };
  return (
    <Stall frame={frame} k={k} cam={cam} mood="dusk" boxOpen={0} phone={on === "him" ? "up" : "down"}
      you={STAND} youFace={{ brows: frame >= k.ask + 34 ? "worry" : "flat", lids: 0.2, mouth: "flat", eyes: 1, look: youLook }}
      fr={fr} frFace={on === "him" ? { brows: "worry", lids: 0.1, mouth: "flat", eyes: 1, look: { x: 0.4, y: 0.9 } } : { brows: "flat", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 0.5, y: 0.85 } }} />
  );
};

/** The six-second hold, then lines 49 and 50: TELLS JOKE 62%, the open mouth, the eyes up, the grin that stays, the
 *  mouth shut, the counting with no sound; you looking at him; COUNTS COINS 97%. */
export const SixtyTwo: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const fh = headAt(FR_B.x, FR_B.y, FR_B.scale, STAND, -1);
  const yh = headAt(YOU_B.x, YOU_B.y, YOU_B.scale, STAND, 1);
  const on = current(frame, [[k.hold, "two"], [k.eyesUp - 4, "him"], [k.count - 6, "count"], [k.youLook, "you"], [k.counts - 8, "tick"], [k.reads, "wide"], [k.costs, "card"]]);
  const cams: Record<typeof on, Camera> = {
    two: camAt(frame, [[k.hold, { x: 880, y: 520, zoom: 1.55 }], [k.eyesUp - 4, { x: 900, y: 510, zoom: 1.66 }]]),
    him: camAt(frame, [[k.eyesUp - 4, closeUp(fh.x - 30, fh.y - 110, 2.35)], [k.count - 6, closeUp(fh.x - 30, fh.y - 110, 2.55)]]),
    count: camAt(frame, [[k.count - 6, { x: 1000, y: 640, zoom: 2.0 }], [k.youLook, { x: 990, y: 640, zoom: 2.1 }]]),
    you: camAt(frame, [[k.youLook, closeUp(yh.x + 40, yh.y, 2.6)], [k.counts - 8, closeUp(yh.x + 40, yh.y, 2.75)]]),
    tick: camAt(frame, [[k.counts - 8, closeUp(fh.x - 30, fh.y - 100, 2.3)], [k.reads, closeUp(fh.x - 30, fh.y - 100, 2.4)]]),
    wide: glide(frame, k.reads, k.costs, { x: 830, y: 540, zoom: 1.4 }, { x: 860, y: 560, zoom: 1.58 }),
    card: camAt(frame, [[k.costs, closeUp(fh.x - 20, fh.y - 120, 2.6)], [k.habit, closeUp(fh.x - 20, fh.y - 110, 2.9)]]),
  };
  const cam = drift(cams[on], frame, "sixty", 2.5);
  const breath = ramp(frame, k.hold, k.hold + 16);
  const counting = frame >= k.count;
  const coinX = COINS[Math.floor((frame - k.count) / 14) % COINS.length];
  const fr: Pose = counting
    ? { ...STAND, lean: 6, armF: aimArm(FR_B, { x: coinX, y: COURT.counter.top - 14 }) }
    : { ...STAND, lean: mix(4, -4, breath), drop: mix(2, -3, breath), armF: [30, 40] };
  // the face, beat by beat
  let frFace: Face;
  if (frame < k.mouth) frFace = { brows: "raised", lids: 0, mouth: "smile", eyes: 1.1, look: { x: 0.9, y: -0.1 } };
  else if (frame < k.eyesUp) frFace = { brows: "raised", lids: 0, mouth: "open", eyes: 1.15, look: { x: 0.9, y: -0.1 } };
  else if (frame < k.eyesDown) frFace = { brows: "raised", lids: 0, mouth: "open", eyes: 1.1, look: { x: -0.2, y: -0.95 } };
  else if (frame < k.shut) frFace = { brows: "flat", lids: 0.2, mouth: "smile", eyes: 1, look: { x: 0.5, y: 0.4 } };
  else if (frame < k.count) frFace = { brows: "sad", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 0.5, y: 0.8 } };
  else frFace = { brows: "sad", lids: 0.45, mouth: Math.floor((frame - k.count) / 7) % 2 ? "o" : "flat", eyes: 1, look: { x: 0.4, y: 0.9 } };
  const youFace: Face = frame >= k.youLook
    ? { brows: "worry", lids: 0.1, mouth: "flat", eyes: 1, look: { x: 0.95, y: -0.1 } }
    : { brows: "none", lids: 0.1, mouth: frame < k.shut ? "smile" : "flat", eyes: 1, look: { x: 0.9, y: -0.2 } };
  return (
    <Stall frame={frame} k={k} cam={cam} mood="lamp" boxOpen={1} phone="down" coins card
      you={{ ...STAND, armF: [40, 60] }} youFace={youFace} fr={fr} frFace={frFace} />
  );
};

/** Line 51: your hand on the lid, the key, your pocket. */
export const Habit: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const lid = 1 - ramp(frame, k.habit, k.habit + 10);
  const lock = { x: COURT.box.x, y: COURT.counter.top - 120 + 36 + 21 };
  const pocket = { x: YOU_B.x + 40, y: COURT.counter.top - 30 };
  const turn = ramp(frame, k.key, k.key + 8);
  const out = ramp(frame, k.key + 10, k.pocket);
  const keyAt = { x: mix(lock.x + 34, pocket.x, out), y: mix(lock.y, pocket.y, out) - Math.sin(out * Math.PI) * 60 };
  const target = frame < k.key - 4 ? { x: COURT.box.x - 20, y: COURT.counter.top - 120 } : frame < k.pocket + 6 ? keyAt : pocket;
  const you: Pose = { ...STAND, armF: aimArm(YOU_B, target) };
  const cam = drift(glide(frame, k.habit, k.score, insert(760, 700, 2.4), insert(660, 690, 2.6)), frame, "habit", 2);
  const keyNode = frame < k.pocket + 4 ? <Key x={keyAt.x} y={keyAt.y} scale={0.55} rotate={mix(-14, 76, turn) - out * 60} glint={out < 0.2} /> : null;
  return (
    <Stall frame={frame} k={k} cam={cam} mood="lamp" boxOpen={lid} phone="down" keyNode={keyNode}
      you={you} youFace={{ brows: "none", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.8 } }}
      fr={{ ...STAND, lean: 6, armF: [40, 50] }} frFace={{ brows: "sad", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 0.4, y: 0.9 } }} card />
  );
};

/** Line 52: the lamppost outside, CITY SCORE 99.4 to 99.5, the teal lamp steady over it; up to the lamp. */
export const CityScore: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const bd = boards(k);
  const cam = drift(frame < k.tilt
    ? camAt(frame, [[k.score, { x: 960, y: 600, zoom: 1.9 }], [k.tilt, { x: 960, y: 590, zoom: 2.0 }]])
    : glide(frame, k.tilt, k.end, { x: 960, y: 590, zoom: 2.0 }, { x: 990, y: 300, zoom: 2.1 }), frame, "score", 2);
  const back = (
    <g>
      <Deep cam={cam} depth={0.2} flat><Sky id="score" mood="lamp" x={-1400} y={-800} w={4800} h={1700} sunAt={{ x: 1500, y: 160 }} /></Deep>
      <Deep cam={cam} depth={0.4} flat><Skyline mood="night" from={-1400} to={3400} base={760} tall={420} seed={5} /></Deep>
      <Deep cam={cam} depth={0.75}>
        <rect x={-1400} y={640} width={4800} height={300} fill="#1b1e29" />
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i}>
            <rect x={-500 + i * 420} y={680} width={360} height={260} fill="#2b3142" stroke={INK} strokeWidth={5} />
            {Array.from({ length: 9 }, (_, r) => <line key={r} x1={-494 + i * 420} y1={700 + r * 26} x2={-146 + i * 420} y2={700 + r * 26} stroke="#3a4156" strokeWidth={5} />)}
          </g>
        ))}
        <rect x={-1400} y={940} width={4800} height={800} fill="#2a2d38" />
      </Deep>
    </g>
  );
  const actors = (
    <g>
      <rect x={946} y={140} width={28} height={1000} fill="#3b404e" stroke={INK} strokeWidth={5} />
      <path d="M960 180 Q1010 150 1040 190" fill="none" stroke="#3b404e" strokeWidth={14} />
      <TealLamp frame={frame} x={1040} y={222} size={30} />
      <RateBoard frame={frame} x={960} y={500} size={74} label="CITY SCORE" keys={bd.city} />
    </g>
  );
  return <Shot cam={cam} mood="lamp" lights={[{ x: 1040, y: 222, r: 260, color: "#7fe0d4", strength: 0.35, moods: ["lamp"] }]} back={back} actors={actors} />;
};
