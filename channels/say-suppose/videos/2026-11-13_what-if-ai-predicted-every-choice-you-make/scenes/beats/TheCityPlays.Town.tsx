// The City Plays in town: the magician on the street (library set street, 27-29), the couple on a date at a
// food-court table (30, 31), the penalty kick on the court's television (32), and the landlord's letter at your stall
// (38-40).
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { seatedY, SEATED, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { street } from "@whatif/kit/sets/Street";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { RateBoard, Tag, type TagKey } from "../device";
import { aimArm, Apron, headAt, type Body } from "../kit";
import { blinking, camAt, current, DATE_HER, DATE_HIM, FRIEND, HERO, LANDLORD, MAGICIAN, mix, PASTELS, ramp } from "../shared";
import { COURT, FoodCourtBack, foodCourtLights, StallCounter, StallLamp } from "../sets/FoodCourt";
import { CardFan, Envelope, glide, LitPhone, Shot, talk } from "./TheCityPlays.Parts";
import { boards, tags, type T } from "./TheCityPlays.Times";

// ------------------------------------------------------------------------------------------------ the magician

const MAG: Body = { x: 700, y: 1010, scale: 1.3, facing: 1, pose: STAND };
const CROWD = [980, 1110, 1240, 1370];

export const Magician: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const tg = tags(k);
  const on = current(frame, [[k.magician, "wide"], [k.magClose, "close"], [k.noAct, "empty"]]);
  const mh = headAt(MAG.x, MAG.y, MAG.scale, STAND, 1);
  const cams: Record<typeof on, Camera> = {
    wide: camAt(frame, [[k.magician, { x: 1010, y: 660, zoom: 1.3 }], [k.magClose, { x: 990, y: 650, zoom: 1.38 }]]),
    close: camAt(frame, [[k.magClose, closeUp(mh.x + 40, mh.y - 90, 2.2)], [k.noAct, closeUp(mh.x + 40, mh.y - 100, 2.35)]]),
    empty: glide(frame, k.noAct, k.date, { x: 900, y: 640, zoom: 1.5 }, { x: 960, y: 610, zoom: 1.22 }),
  };
  const cam = drift(cams[on], frame, "mag", 3);
  const lower = ramp(frame, k.noAct + 6, k.noAct + 40);
  const pose: Pose = { ...STAND, armF: [mix(100, 18, lower), mix(26, 10, lower)], armB: [mix(70, -6, lower), mix(40, 8, lower)], lean: mix(0, -3, lower) };
  const lookingUp = frame >= k.magClose;
  const face = lookingUp
    ? { brows: lower > 0.3 ? ("sad" as const) : ("raised" as const), lids: mix(0, 0.45, lower), mouth: lower > 0.3 ? ("frown" as const) : ("o" as const), eyes: 1.05, look: { x: 0.2, y: -0.95 } }
    : { brows: "raised" as const, lids: 0, mouth: talk(frame, k.pick, k.pick + 30, "smile"), eyes: 1.1, look: { x: 0.9, y: 0 } };
  const actors = (
    <>
      {CROWD.map((x0, i) => {
        const go = frame >= k.leave + i * 6;
        const x = go ? x0 + (frame - (k.leave + i * 6)) * 7 : x0;
        const reading = frame >= k.magician + 20 + i * 3;
        return <Figure key={i} x={x} y={1020} scale={1.2} facing={go ? 1 : -1} pose={go ? walkPose(frame * 0.3 + i) : STAND}
          head={PASTELS[(i * 2 + 1) % 8]} coat={["#2a2d36", "#3b4a6b", "#4a3b46", "#2f4a48"][i]} brows={reading ? "raised" : "none"} mouth="flat"
          look={go ? { x: 0.8, y: 0 } : reading ? { x: 0.7, y: -0.85 } : { x: 0.8, y: 0.1 }} blink={blinking(frame, i + 4)} time={frame} />;
      })}
      <Figure {...MAG} pose={pose} head={MAGICIAN.head} coat={MAGICIAN.coat} {...face} blink={blinking(frame, 7)} time={frame} held={<CardFan spread={1 - lower * 0.7} />} />
      <Tag frame={frame} x={mh.x} headY={mh.y} r={mh.r} keys={tg.magician} />
    </>
  );
  const options = { ...street.defaults, auto: false };
  return <Shot cam={cam} mood="day" lights={street.lights(options)} back={street.Back({ cam, mood: "day", frame, options })} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ the date

const SEAT = 900;
const DS = 1.9;
const HER: Body = { x: 770, y: seatedY(SEAT, DS), scale: DS, facing: 1, pose: SEATED };
const HIM: Body = { x: 1150, y: seatedY(SEAT, DS), scale: DS, facing: -1, pose: SEATED };

const Bowl: React.FC<{ x: number; frame: number; seed: number }> = ({ x, frame, seed }) => (
  <g>
    {[0, 1, 2].map((s) => {
      const p = (frame / 50 + s / 3 + seed * 0.21) % 1;
      return <circle key={s} cx={x + Math.sin(frame / 14 + s + seed) * 10} cy={800 - p * 120} r={10 + p * 20} fill="#fff" opacity={0.35 * (1 - p)} />;
    })}
    <path d={`M${x - 52} 814 Q${x} 870 ${x + 52} 814Z`} fill="#e8e4da" stroke={INK} strokeWidth={5} />
    <ellipse cx={x} cy={814} rx={52} ry={10} fill="#e0a23c" stroke={INK} strokeWidth={4} />
  </g>
);

export const DateTable: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const tg = tags(k);
  const bd = boards(k);
  const hh = headAt(HER.x, HER.y, DS, SEATED, 1);
  const bh = headAt(HIM.x, HIM.y, DS, SEATED, -1);
  const on = current(frame, [[k.date, "wide"], [k.herTag - 4, "her"], [k.hisTag - 4, "him"], [k.obey, "two"], [k.half, "food"], [k.heard, "heard"]]);
  const cams: Record<typeof on, Camera> = {
    wide: camAt(frame, [[k.date, { x: 960, y: 620, zoom: 1.28 }], [k.herTag, { x: 960, y: 620, zoom: 1.36 }]]),
    her: camAt(frame, [[k.herTag - 4, closeUp(hh.x + 40, hh.y - 90, 2.2)], [k.hisTag, closeUp(hh.x + 50, hh.y - 90, 2.3)]]),
    him: camAt(frame, [[k.hisTag - 4, closeUp(bh.x - 40, bh.y - 90, 2.2)], [k.obey, closeUp(bh.x - 50, bh.y - 90, 2.3)]]),
    two: camAt(frame, [[k.obey, { x: 960, y: 640, zoom: 1.5 }], [k.half, { x: 960, y: 660, zoom: 1.6 }]]),
    food: camAt(frame, [[k.half, insert(960, 770, 2.5)], [k.heard, insert(960, 770, 2.7)]]),
    heard: camAt(frame, [[k.heard, closeUp(hh.x + 30, hh.y - 40, 2.6)], [k.tv, closeUp(hh.x + 30, hh.y - 40, 2.75)]]),
  };
  const cam = drift(cams[on], frame, "date", 3);
  const phoneUp = ramp(frame, k.herPhone, k.herPhone + 10);
  const herPose: Pose = { ...SEATED, armF: [mix(30, 74, phoneUp), mix(40, 66, phoneUp)] };
  const herFace = { brows: "none" as const, lids: 0.4, mouth: talk(frame, k.heard + 2, k.heard + 26, "flat"), eyes: 1, look: phoneUp > 0.5 ? { x: 0.5, y: 0.85 } : { x: 0.6, y: 0.3 } };
  const joking = frame >= k.joke && frame < k.obey;
  const himFace = joking ? { brows: "raised" as const, lids: 0, mouth: talk(frame, k.joke, k.obey, "smile", 4), eyes: 1.1, look: { x: 0.9, y: 0.1 } }
    : { brows: "none" as const, lids: 0.35, mouth: "flat" as const, eyes: 1, look: { x: 0.4, y: 0.5 } };
  const himPose: Pose = { ...SEATED, armF: joking ? [96 + Math.sin(frame / 4) * 14, 40] : [40, 50] };
  const actors = (
    <>
      <Figure {...HER} pose={herPose} head={DATE_HER.head} coat={DATE_HER.coat} {...herFace} blink={blinking(frame, 2)} time={frame}
        held={phoneUp > 0.2 ? <LitPhone /> : undefined} />
      <Figure {...HIM} pose={himPose} head={DATE_HIM.head} coat={DATE_HIM.coat} {...himFace} blink={blinking(frame, 5)} time={frame} />
      {/* the table: its top, its skirt, the food between them, the two table boards */}
      <rect x={720} y={836} width={480} height={24} rx={6} fill="#8a8f9c" stroke={INK} strokeWidth={6} />
      <rect x={760} y={860} width={400} height={300} fill="#6b6f7a" stroke={INK} strokeWidth={6} />
      <Bowl x={905} frame={frame} seed={1} />
      <Bowl x={1015} frame={frame} seed={2} />
      <RateBoard frame={frame} x={790} y={782} size={28} keys={bd.herTable} />
      <RateBoard frame={frame} x={1130} y={782} size={28} keys={bd.hisTable} />
      <Tag frame={frame} x={hh.x} headY={hh.y} r={hh.r} keys={tg.her} />
      <Tag frame={frame} x={bh.x} headY={bh.y} r={bh.r} keys={tg.him} />
    </>
  );
  return <Shot cam={cam} mood="day" lights={foodCourtLights} back={<FoodCourtBack cam={cam} mood="day" frame={frame} />} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ the penalty kick

/** A player seen from behind (no face): a round head, a shirt, two legs. (x, y) is between the feet. */
const BackPlayer: React.FC<{ x: number; y: number; s: number; head: string; shirt: string; kick?: number }> = ({ x, y, s, head, shirt, kick = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <line x1={-14} y1={0} x2={-12} y2={-100} stroke={INK} strokeWidth={14} strokeLinecap="round" />
    <line x1={14 - kick * 30} y1={-kick * 40} x2={12} y2={-100} stroke={INK} strokeWidth={14} strokeLinecap="round" />
    <path d="M-34 -100 L34 -100 L28 -210 L-28 -210Z" fill={shirt} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <line x1={-30} y1={-200} x2={-44} y2={-120} stroke={shirt} strokeWidth={14} strokeLinecap="round" />
    <line x1={30} y1={-200} x2={44} y2={-120} stroke={shirt} strokeWidth={14} strokeLinecap="round" />
    <circle cx={0} cy={-252} r={44} fill={head} stroke={INK} strokeWidth={4} />
  </g>
);

/** One penalty, in REF units: the pitch, the goal, the keeper diving left before the kick, the striker from behind
 *  with his card, the ball into the keeper's hands. */
const Penalty: React.FC<{ frame: number; dive: number; kick: number; keys: TagKey[]; head: string }> = ({ frame, dive, kick, keys, head }) => {
  const d = ramp(frame, dive, dive + 10);
  const kk = ramp(frame, kick, kick + 6);
  const ball = ramp(frame, kick + 2, kick + 14);
  const kx = mix(960, 760, d), ky = mix(640, 600, d);
  const bx = mix(990, 790, ball), by = mix(960, 545, ball) - Math.sin(ball * Math.PI) * 60;
  const sh = { x: 960, y: 1020 - 252 * 1.25, r: 44 * 1.25 };
  return (
    <g>
      <rect x={-200} y={-200} width={2320} height={520} fill="#3d4a7a" />
      {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={(i * 47) % 1960} cy={120 + (i % 5) * 36} r={9} fill={PASTELS[i % 8]} opacity={0.7} />)}
      <rect x={-200} y={320} width={2320} height={1000} fill="#4c9a5a" />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-200 + i * 300} y={320} width={150} height={1000} fill="#000" opacity={0.06} />)}
      {/* the goal: net, posts, bar */}
      <rect x={640} y={330} width={640} height={310} fill="#fff" opacity={0.15} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={640 + i * 58} y1={330} x2={640 + i * 58} y2={640} stroke="#fff" strokeWidth={2} opacity={0.4} />)}
      <path d="M640 640 V330 H1280 V640" fill="none" stroke={PAPER} strokeWidth={16} />
      <line x1={500} y1={640} x2={1420} y2={640} stroke={PAPER} strokeWidth={6} opacity={0.7} />
      {/* the keeper, diving left before the ball is struck */}
      <g transform={`translate(${kx} ${ky}) rotate(${-78 * d} 0 -112)`}>
        <Figure x={0} y={0} scale={1.05} facing={-1} pose={{ ...STAND, armF: [mix(60, 170, d), 10], armB: [mix(-60, 160, d), 10], legF: [mix(20, 30, d), -5], legB: [-20, -5] }}
          head="#f2b632" coat="#d8344f" brows="raised" mouth="o" eyes={1.1} look={{ x: 0.8, y: -0.2 }} time={frame} />
      </g>
      <circle cx={bx} cy={by} r={20} fill={PAPER} stroke={INK} strokeWidth={5} />
      <BackPlayer x={960} y={1020} s={1.25} head={head} shirt="#1d4f9a" kick={kk} />
      <Tag frame={frame} x={sh.x} headY={sh.y} r={sh.r} keys={keys} scale={1.2} />
    </g>
  );
};

export const PenaltyTv: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const tg = tags(k);
  const bd = boards(k);
  const on = current(frame, [[k.tv, "corner"], [k.screen, "screen"], [k.row, "row"], [k.zeros, "zeros"]]);
  if (on === "corner") {
    // the television high in the corner of the court, the kick playing on it small
    const cam = drift(camAt(frame, [[k.tv, { x: 420, y: 470, zoom: 1.6 }], [k.screen, { x: 400, y: 430, zoom: 1.9 }]]), frame, "tv", 2);
    const actors = (
      <>
        <line x1={380} y1={-200} x2={380} y2={250} stroke="#14161f" strokeWidth={10} />
        <rect x={190} y={240} width={380} height={230} rx={14} fill="#14161f" stroke={INK} strokeWidth={6} />
        <svg x={206} y={256} width={348} height={198} viewBox="0 0 1920 1080">
          <Penalty frame={frame} dive={k.dive} kick={k.kick} keys={tg.striker} head={PASTELS[1]} />
        </svg>
      </>
    );
    return <Shot cam={cam} mood="day" lights={foodCourtLights} back={<FoodCourtBack cam={cam} mood="day" frame={frame} />} actors={actors} />;
  }
  const cam = drift(on === "screen" ? camAt(frame, [[k.screen, { x: 960, y: 560, zoom: 1.0 }], [k.row, { x: 960, y: 600, zoom: 1.12 }]]) : { x: 960, y: 540, zoom: 1 }, frame, "pitch", 2);
  let picture: React.ReactNode;
  if (on === "screen") picture = <Penalty frame={frame} dive={k.dive} kick={k.kick} keys={tg.striker} head={PASTELS[1]} />;
  else if (on === "row") {
    picture = (
      <g>
        <rect x={-200} y={-200} width={2320} height={1480} fill="#14161f" />
        {[0, 1, 2].map((i) => {
          const at = k.row + 6 + i * 9;
          const keys: TagKey[] = [{ at: at - 8, text: i === 1 ? "KICKS RIGHT" : "KICKS LEFT", pct: [93, 89, 95][i], state: "new" }, { at: at + 8, text: i === 1 ? "KICKS RIGHT" : "KICKS LEFT", pct: [93, 89, 95][i], state: "tick" }];
          return (
            <svg key={i} x={30 + i * 630} y={300} width={600} height={338} viewBox="0 0 1920 1080">
              <g transform={i === 1 ? "translate(1920 0) scale(-1 1)" : undefined}>
                <Penalty frame={frame} dive={at - 6} kick={at} keys={keys} head={PASTELS[(i * 3 + 2) % 8]} />
              </g>
            </svg>
          );
        })}
      </g>
    );
  } else {
    picture = (
      <g>
        <rect x={-200} y={-200} width={2320} height={1480} fill="#1b2240" />
        <RateBoard frame={frame} x={960} y={360} size={170} keys={bd.score} />
      </g>
    );
  }
  const bezel = (
    <path d="M-400 -400 H2320 V1480 H-400Z M40 40 H1880 V1040 H40Z" fillRule="evenodd" fill="#14161f" />
  );
  return <Shot cam={cam} mood="day" lights={[]} back={picture} actors={bezel} />;
};

// ------------------------------------------------------------------------------------------------ the landlord

export const Landlord: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const tg = tags(k);
  const push = frame >= k.handUp - 6;
  const cam = drift(push
    ? camAt(frame, [[k.handUp - 6, { x: 820, y: 540, zoom: 1.55 }], [k.t.train, { x: 800, y: 530, zoom: 1.68 }]])
    : camAt(frame, [[k.landlord, { x: 960, y: 560, zoom: 1.4 }], [k.handUp - 6, { x: 980, y: 560, zoom: 1.5 }]]), frame, "land", 3);
  const step = ramp(frame, k.handUp - 10, k.handUp + 4);
  const meet = { x: 760, y: 360 };
  const fr: Body = { x: mix(COURT.friend.x, 940, step), y: COURT.friend.y, scale: COURT.scale, facing: step > 0.5 ? -1 : 1, pose: STAND };
  const yu: Body = { x: COURT.you.x, y: COURT.you.y, scale: COURT.scale, facing: 1, pose: STAND };
  const up = ramp(frame, k.handUp, k.slap);
  const frPose: Pose = frame >= k.handUp ? { ...STAND, armB: [-7, 8], armF: up > 0 ? aimArm(fr, { x: mix(fr.x - 60, meet.x + 10, up), y: mix(380, meet.y, up) }) : [80, 40] }
    : frame >= k.take ? { ...STAND, armF: [70, 50] } : STAND;
  const yuPose: Pose = frame >= k.slap - 8 ? { ...STAND, armF: aimArm(yu, { x: mix(700, meet.x - 10, ramp(frame, k.slap - 8, k.slap)), y: meet.y }) } : { ...STAND, armF: [40, 60] };
  const lb: Body = { x: COURT.customer.x, y: COURT.customer.y, scale: COURT.scale, facing: -1, pose: frame < k.take ? { ...STAND, armF: [mix(30, 88, ramp(frame, k.landlord, k.landlord + 12)), 20] } : STAND };
  const torn = ramp(frame, k.tear, k.tear + 10);
  const fh = headAt(fr.x, fr.y, fr.scale, frPose, fr.facing);
  const slapped = frame >= k.slap;
  const actors = (
    <>
      <Figure {...yu} pose={yuPose} {...HERO} coat="#3b3e47" brows={slapped ? "raised" : "none"} lids={0} mouth={frame >= k.handUp ? "smile" : "flat"} eyes={1.05}
        look={frame >= k.hiCard ? { x: 0.7, y: -0.5 } : { x: 0.9, y: 0.1 }} blink={blinking(frame, 0)} time={frame} />
      <Apron b={{ ...yu, pose: yuPose }} />
      <Figure {...fr} pose={frPose} head={FRIEND.head} coat={FRIEND.coat}
        brows={frame >= k.handUp ? "raised" : "none"} lids={frame >= k.tear && frame < k.handUp ? 0.3 : 0}
        mouth={talk(frame, k.handUp + 6, k.handUp + 24, frame >= k.tear ? "smile" : "flat", 6)} eyes={1.1}
        look={frame >= k.tear && frame < k.handUp ? { x: 0.6, y: 0.6 } : { x: 0.9, y: 0 }} blink={blinking(frame, 2)} time={frame}
        held={frame >= k.take && frame < k.handUp ? <Envelope open={torn} /> : undefined} />
      <Apron b={{ ...fr, pose: frPose }} />
      {frame >= k.handUp && <g transform={`translate(${fr.x + 30} ${COURT.counter.top - 6}) rotate(-8)`}><Envelope open={1} /></g>}
      <StallCounter />
      {slapped && frame < k.slap + 8 && <circle cx={meet.x} cy={meet.y} r={30 + (frame - k.slap) * 6} fill="none" stroke={PAPER} strokeWidth={6} opacity={1 - (frame - k.slap) / 8} />}
      <Figure {...lb} head={LANDLORD.head} coat={LANDLORD.coat} tie={LANDLORD.tie} {...EXPRESSIONS.neutral} lids={0.4}
        mouth={talk(frame, k.keep, k.keep + 26, "flat")} look={{ x: 0.9, y: 0.2 }} blink={blinking(frame, 8)} time={frame}
        held={frame < k.take ? <Envelope /> : undefined} />
      <Tag frame={frame} x={fh.x} headY={fh.y} r={fh.r} keys={tg.friend} />
    </>
  );
  return (
    <Shot cam={cam} mood="day" lights={foodCourtLights}
      back={<><FoodCourtBack cam={cam} mood="day" frame={frame} /><StallLamp on={false} /></>} actors={actors} />
  );
};
