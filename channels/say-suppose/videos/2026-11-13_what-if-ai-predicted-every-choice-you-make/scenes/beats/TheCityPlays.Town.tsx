// The City Plays in town: the magician on the street (library set street, 40, 41), the penalty kick on the court's
// television (42), the bookie's betting-shop window clattering to ones (43), three strikers and a scoreboard of zeros
// (44), and the newsreader over a league table of nils (45).
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { street } from "@whatif/kit/sets/Street";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { RateBoard, Tag, type TagKey } from "../device";
import { headAt, type Body } from "../kit";
import { blinking, camAt, current, MAGICIAN, mix, PASTELS, ramp } from "../shared";
import { FoodCourtBack, foodCourtLights } from "../sets/FoodCourt";
import { News } from "./TheCityPlays.Bookie";
import { CardFan, glide, RoleTag, Shot, talk } from "./TheCityPlays.Parts";
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
    empty: glide(frame, k.noAct, k.tv, { x: 900, y: 640, zoom: 1.5 }, { x: 960, y: 610, zoom: 1.22 }),
  };
  const cam = drift(cams[on], frame, "mag", 3);
  const lower = ramp(frame, k.noAct + 6, k.noAct + 40);
  const pose: Pose = { ...STAND, armF: [mix(100, 18, lower), mix(26, 10, lower)], armB: [mix(70, -6, lower), mix(40, 8, lower)], lean: mix(0, -3, lower) };
  const lookingUp = frame >= k.magClose;
  const face = lookingUp
    ? { brows: lower > 0.3 ? ("flat" as const) : ("raised" as const), lids: mix(0, 0.35, lower), mouth: lower > 0.3 ? ("flat" as const) : ("o" as const), eyes: 1.1, look: lower > 0.6 ? { x: 0.9, y: 0 } : { x: 0.2, y: -0.95 } }
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
      <RoleTag frame={frame} at={k.magClose + 2} x={mh.x} y={mh.y} r={mh.r} text="MAGICIAN" side={-1} hold={Math.max(20, k.noAct - k.magClose)} />
    </>
  );
  const options = { ...street.defaults, auto: false };
  return <Shot cam={cam} mood="day" lights={street.lights(options)} back={street.Back({ cam, mood: "day", frame, options })} actors={actors} />;
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
  const on = current(frame, [[k.tv, "corner"], [k.screen, "screen"], [k.row, "row"], [k.zeros, "zeros"], [k.news, "news"]]);
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
  const cam = drift(on === "news" ? camAt(frame, [[k.news, { x: 960, y: 540, zoom: 1.0 }], [k.sixTen, { x: 900, y: 520, zoom: 1.12 }]]) : on === "screen" ? camAt(frame, [[k.screen, { x: 960, y: 560, zoom: 1.0 }], [k.row, { x: 960, y: 600, zoom: 1.12 }]]) : { x: 960, y: 540, zoom: 1 }, frame, "pitch", 2);
  let picture: React.ReactNode;
  if (on === "screen") picture = <Penalty frame={frame} dive={k.dive} kick={k.kick} keys={tg.striker} head={PASTELS[1]} />;
  else if (on === "row") {
    picture = (
      <g>
        <rect x={-200} y={-200} width={2320} height={1480} fill="#14161f" />
        {[0, 1, 2].map((i) => {
          const at = k.row + 6 + i * 9;
          const keys: TagKey[] = [{ at: at - 8, text: "KICKS LEFT", pct: 91, state: "new" }, { at: at + 8, text: "KICKS LEFT", pct: 91, state: "tick" }];
          return (
            <svg key={i} x={30 + i * 630} y={300} width={600} height={338} viewBox="0 0 1920 1080">
              <Penalty frame={frame} dive={at - 6} kick={at} keys={keys} head={PASTELS[(i * 3 + 2) % 8]} />
            </svg>
          );
        })}
      </g>
    );
  } else if (on === "zeros") {
    picture = (
      <g>
        <rect x={-200} y={-200} width={2320} height={1480} fill="#1b2240" />
        <RateBoard frame={frame} x={960} y={360} size={170} keys={bd.score} />
      </g>
    );
  } else picture = <News frame={frame} k={k} />;
  const bezel = (
    <path d="M-400 -400 H2320 V1480 H-400Z M40 40 H1880 V1040 H40Z" fillRule="evenodd" fill="#14161f" />
  );
  return <Shot cam={cam} mood="day" lights={[]} back={picture} actors={bezel} />;
};
