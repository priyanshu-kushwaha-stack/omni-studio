// Act two: the carriage, grandfather, mother, money, the table, the belief breaks (script lines 31-63).
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { CRIMSON, INK } from "@whatif/kit/theme";
import { Bubble, Scene } from "./kit";
import { Card, Carriage, Coin, Diagram, Glass, GrandpaRoom, Home, Pan, Party, Saucer, Smash } from "./sets";
import { blinking, Boss, camAt, Cousin, Grandpa, linear, mix, Mom, Person, ramp, rippleAt, You, type S } from "./shared";

// ---------- you were never in now (lines 31-36) ----------

/** Lines 31-33: the carriage window as a mirror; your reflection and its ghost; your own hand. */
export const Reflection: React.FC<{ s: S }> = ({ s }) => {
  const hand = s.f > s.at(33) - 6;
  const cam = camAt(s.f, [[0, { x: 900, y: 600, zoom: 1.3 }], [s.at(33), { x: 900, y: 580, zoom: 1.6 }], [s.d, { x: 920, y: 560, zoom: 1.9 }]]);
  return (
    <Scene cam={cam} back={<Carriage cam={cam} tunnel={s.frame} />}
      actors={<>
        <g opacity={0.35}><You x={1180} y={940} scale={1.35} facing={-1} face="sceptical" pose={STAND} /></g>
        <You x={700} y={1000} scale={1.45} face="sceptical" look={hand ? { x: 0.5, y: -0.4 } : { x: 0.9, y: 0 }}
          pose={{ ...STAND, armF: hand ? [140, 40] : [10, 20] }} blink={blinking(s.frame)} />
      </>}
      ghost={<You x={1180} y={940} scale={1.35} facing={-1} face="neutral" look={{ x: -0.8, y: 0.6 }} pose={{ ...STAND, tilt: 10 }} />}
    />
  );
};

/** Lines 34-36: the flash-lag illusion draws itself on the window; then your hand, its ghost moving first. */
export const FlashLag: React.FC<{ s: S }> = ({ s }) => {
  const cam = { x: 960, y: 560, zoom: 1.2 };
  const dot = (s.f % 60) / 60;
  const flash = s.f % 60 > 26 && s.f % 60 < 32;
  const last = s.f > s.at(36);
  const wig = Math.sin(s.f * 0.15) * 20;
  return (
    <Scene cam={cam} back={<Carriage cam={cam} tunnel={s.frame} />}
      actors={<>
        {!last && (
          <Diagram x={560} y={300} w={800} h={340} p={linear(s.f, 0, 12)}>
            <line x1={60} y1={180} x2={740} y2={180} stroke="#c9b893" strokeWidth={4} />
            <circle cx={60 + dot * 680 + (dot > 0.45 ? 40 : 0) * 0} cy={180} r={22} fill={INK} />
            {flash && <rect x={60 + 0.48 * 680 - 12} y={110} width={24} height={50} fill={CRIMSON} />}
            <text x={400} y={290} textAnchor="middle" fontFamily="Rubik" fontWeight={800} fontSize={36} fill={INK}>THE DOT LOOKS AHEAD</text>
          </Diagram>
        )}
        {last && <You x={760} y={1000} scale={1.5} face="worried" look={{ x: 0.5, y: -0.5 }} pose={{ ...STAND, armF: [140 + wig * 0.2, 40] }} />}
      </>}
      ghost={last ? <You x={760} y={1000} scale={1.5} pose={{ ...STAND, armF: [140 + Math.sin((s.f + 20) * 0.15) * 4, 40] }} /> : undefined}
    />
  );
};

// ---------- grandfather (lines 37-42) ----------

const GX = 1250;
const pedal = (f: number) => ({ ...STAND, armF: [90 + Math.sin(f * 0.3) * 20, 40] as [number, number], armB: [60, 60] as [number, number] });
const KNEE = { ...STAND, tilt: -10, armF: [60, 20] as [number, number], armB: [-40, 30] as [number, number] };

/** Lines 37-42: Sunday, the story, the ghost grandfather a minute ahead; your too-exact laugh; the saucer. */
export const GrandpaStory: React.FC<{ s: S }> = ({ s }) => {
  const cam = camAt(s.f, [[0, { x: 960, y: 620, zoom: 1.05 }], [s.at(41), { x: 900, y: 640, zoom: 1.25 }], [s.at(42), { x: 760, y: 620, zoom: 1.5 }], [s.d, { x: 980, y: 660, zoom: 1.3 }]]);
  const punch = s.f > s.at(42) - 6 && s.f < s.end(42) + 10;
  const pause = s.f > s.end(42) + 10;
  const pour = linear(s.f, s.end(42) + 30, s.d - 10);
  return (
    <Scene cam={cam} back={<GrandpaRoom cam={cam} />}
      actors={<>
        <Cousin x={1650} y={960} scale={1.05} face="neutral" look={{ x: 0, y: 1 }} pose={{ ...STAND, armF: [60, 80] }} />
        <Grandpa x={GX} y={980} scale={1.35} facing={-1} face={pause ? "sceptical" : "happy"} mouth={punch ? "open" : "smile"}
          pose={pause ? { ...STAND, armF: [60 + pour * 30, 30] } : punch ? KNEE : pedal(s.frame)} blink={blinking(s.frame, 3)} />
        {pour > 0 && <Saucer x={mix(GX - 160, 900, pour)} y={900} />}
        <You x={640} y={1000} scale={1.4} face={punch ? "happy" : pause ? "worried" : "neutral"} mouth={punch ? "open" : undefined}
          look={{ x: 1, y: -0.1 }} pose={STAND} blink={blinking(s.frame)} />
      </>}
      ghost={s.f < s.at(42) ? <>
        <Grandpa x={GX} y={980} scale={1.35} facing={-1} face="happy" mouth="open" pose={KNEE} />
        <Cousin x={1650} y={960} scale={1.05} face="happy" mouth="open" pose={STAND} />
      </> : undefined}
      over={<Bubble x={1000} y={160} text="A borrowed bicycle..." p={linear(s.f, s.at(39), s.at(39) + 6) * (1 - linear(s.f, s.at(40), s.at(40) + 6))} tail="right" />}
    />
  );
};

// ---------- mother (lines 43-47) ----------

/** Lines 43-47: you answer before she asks; "You know me too well"; then the question you saw coming. */
export const MomKitchen: React.FC<{ s: S }> = ({ s }) => {
  const cam = camAt(s.f, [[0, { x: 760, y: 640, zoom: 1.2 }], [s.at(46), { x: 700, y: 620, zoom: 1.5 }], [s.d, { x: 640, y: 600, zoom: 1.8 }]]);
  const quiet = s.f > s.end(45);
  const laugh = s.f > s.at(45) && !quiet;
  return (
    <Scene cam={cam} back={<Home cam={cam} table={false} />}
      actors={<>
        <Mom x={300} y={980} scale={1.35} face={quiet ? "worried" : laugh ? "happy" : "neutral"} mouth={laugh ? "open" : undefined} look={{ x: 1, y: 0 }} pose={STAND} blink={blinking(s.frame, 2)} />
        <You x={1000} y={1000} scale={1.4} facing={-1} face={s.f > s.at(47) ? "sad" : "happy"} look={{ x: 1, y: 0 }} pose={STAND} blink={blinking(s.frame)} />
      </>}
      ghost={<Mom x={330} y={980} scale={1.35} face="worried" mouth="open" pose={{ ...STAND, armF: [70, 40] }} />}
      over={<>
        <Bubble x={1080} y={200} text="Yes. Yes. No." p={linear(s.f, s.at(44), s.at(44) + 6) * (1 - linear(s.f, s.at(45) - 6, s.at(45)))} tail="right" />
      </>}
    />
  );
};

// ---------- money (lines 48-56) ----------

/** Lines 50-52: the coin, ten in a row; your cousin pockets it. */
export const CoinToss: React.FC<{ s: S }> = ({ s }) => {
  const cam = { x: 960, y: 700, zoom: 1.3 };
  const flips = s.f < s.at(51);
  const y = flips ? 760 - Math.abs(Math.sin(s.f * 0.12)) * 260 : 900;
  return (
    <Scene cam={cam} back={<Home cam={cam} table={false} />}
      actors={<>
        <Cousin x={1200} y={990} scale={1.3} facing={-1} face={flips ? "neutral" : "sceptical"} pose={{ ...STAND, armF: flips ? [60, 60] : [10, 10] }} />
        {flips && <Coin x={1080} y={y} k={1.4} spin={s.f * 0.5} />}
        <You x={660} y={1000} scale={1.4} face="happy" look={{ x: 0.7, y: -0.5 }} pose={{ ...STAND, armF: flips && Math.floor(s.f / 20) % 2 ? [120, 0] : [20, 30] }} blink={blinking(s.frame)} />
      </>}
      ghost={flips ? <Coin x={1080} y={900} k={1.4} /> : undefined}
      over={<Bubble x={1050} y={220} text="Not playing with you." p={linear(s.f, s.at(51), s.at(51) + 6)} tail="right" />}
    />
  );
};

/** Lines 53-55: the Diwali card table; every hand face up in the ghost; you bet, they fold; dealt around. */
export const Cards: React.FC<{ s: S }> = ({ s }) => {
  const cam = camAt(s.f, [[0, { x: 960, y: 640, zoom: 1.05 }], [s.d, { x: 960, y: 660, zoom: 1.2 }]]);
  const fold = s.f > s.at(54) + 20;
  const stack = linear(s.f, s.at(54), s.d);
  const r = rippleAt(s.f, s.at(54) + 4, 16);
  const seats = [{ x: 560, i: 0 }, { x: 1360, i: 4 }];
  return (
    <Scene cam={cam} back={<Party cam={cam} frame={s.frame} />}
      actors={<>
        {seats.map((p, k) => <Person key={k} i={p.i} x={p.x} y={940} scale={1.2} facing={k ? -1 : 1} face={fold ? "sceptical" : "neutral"} pose={{ ...STAND, armF: fold ? [10, 10] : [60, 60] }} />)}
        <Boss x={1680} y={940} scale={1.2} facing={-1} face={s.f > s.at(55) ? "sceptical" : "happy"} pose={STAND} />
        <You x={960} y={1020} scale={1.35} face={s.f > s.at(55) ? "sad" : "happy"} pose={{ ...STAND, armF: [70, 40] }} blink={blinking(s.frame)} />
        {Array.from({ length: Math.floor(stack * 8) }, (_, i) => <ellipse key={i} cx={1060} cy={820 - i * 8} rx={26} ry={8} fill={CRIMSON} stroke={INK} strokeWidth={2} />)}
        {!fold && [700, 1220].map((x) => <Card key={x} x={x} y={800} />)}
      </>}
      ghost={<>{[[660, 0], [700, 8], [1180, -6], [1220, 4]].map(([x, rr], k) => <Card key={k} x={x} y={790} up r={rr} />)}</>}
      r={r}
    />
  );
};

/** Lines 56-57: the felt becomes a paper diagram; the wheel, the shoe and its wire. */
export const Roulette: React.FC<{ s: S }> = ({ s }) => {
  const cam = { x: 960, y: 540, zoom: 1 };
  const spin = s.f * 4;
  const tap = Math.floor(s.f / 10) % 2;
  return (
    <Scene cam={cam} back={<Party cam={cam} frame={s.frame} />}
      actors={<Diagram x={360} y={180} w={1200} h={700} p={linear(s.f, 0, 12)}>
        <g transform={`translate(380 330) rotate(${spin})`}>
          <circle r={200} fill="#2f6b4a" stroke={INK} strokeWidth={8} />
          {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M0 0 L${200 * Math.cos((i * Math.PI) / 8)} ${200 * Math.sin((i * Math.PI) / 8)}`} stroke={i % 2 ? CRIMSON : INK} strokeWidth={14} />)}
          <circle r={60} fill="#c9a06a" />
        </g>
        <g transform={`translate(860 ${520 - tap * 10})`}>
          <path d="M-90 0 Q-90 -60 -20 -70 L60 -70 Q100 -40 110 0Z" fill="#6a4630" stroke={INK} strokeWidth={5} />
          <rect x={-30} y={-110} width={70} height={46} rx={6} fill="#3a3f4c" />
        </g>
        <path d={`M880 410 Q760 300 ${600 + Math.sin(s.f * 0.2) * 10} 330`} stroke={MUST} strokeWidth={5} fill="none" strokeDasharray="12 8" />
        {s.f > s.at(57) && <text x={860} y={200} textAnchor="middle" fontFamily="Rubik" fontWeight={800} fontSize={64} fill={CRIMSON}>+20%</text>}
      </Diagram>}
    />
  );
};
const MUST = "#d99a1a";

/** Line 58: you alone at the card table with your chips; everyone at the snacks. */
export const AloneTable: React.FC<{ s: S }> = ({ s }) => {
  const cam = camAt(s.f, [[0, { x: 960, y: 660, zoom: 1.4 }], [s.d, { x: 960, y: 680, zoom: 1.6 }]]);
  return (
    <Scene cam={cam} back={<Party cam={cam} frame={s.frame} />}
      actors={<>
        {[1500, 1650, 1800].map((x, i) => <Person key={x} i={i + 2} x={x} y={910} scale={1} facing={-1} face="happy" pose={STAND} />)}
        <You x={960} y={1020} scale={1.35} face="sad" look={{ x: 0, y: 0.8 }} pose={{ ...STAND, armF: [50, 50] }} blink={blinking(s.frame)} />
        {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx={1060} cy={820 - i * 8} rx={26} ry={8} fill={CRIMSON} stroke={INK} strokeWidth={2} />)}
      </>}
    />
  );
};

// ---------- the table (lines 57-58 and the hold) ----------

/** Lines 48-49: Mom starts a sentence; you finish it; she stops, spoon in the air. */
export const Finishing: React.FC<{ s: S }> = ({ s }) => {
  const cam = { x: 800, y: 640, zoom: 1.3 };
  const stop = s.f > s.at(49);
  return (
    <Scene cam={cam} back={<Home cam={cam} />}
      actors={<>
        <Mom x={460} y={980} scale={1.35} face={stop ? "sceptical" : "happy"} mouth={stop ? "flat" : "open"} pose={{ ...STAND, armF: [110, 30] }} />
        <You x={1100} y={1000} scale={1.4} facing={-1} face="happy" mouth={Math.floor(s.f / 7) % 2 ? "open" : "flat"} pose={STAND} blink={blinking(s.frame)} />
      </>}
      ghost={<Mom x={460} y={980} scale={1.35} face="sceptical" pose={STAND} />}
    />
  );
};

/** The hold after line 49: the dinner table doubles. Every ghost a minute on; yours sits exactly where you sit. */
export const Doubling: React.FC<{ s: S }> = ({ s }) => {
  const cam = camAt(s.f, [[0, { x: 1300, y: 640, zoom: 1.05 }], [s.d, { x: 1230, y: 660, zoom: 1.45 }]]);
  const momGo = linear(s.f, 0, s.d);
  return (
    <Scene cam={cam} back={<Home cam={cam} />}
      actors={<>
        <Mom x={1000} y={980} scale={1.3} face="happy" mouth={Math.floor(s.f / 9) % 2 ? "open" : "smile"} pose={{ ...STAND, armF: [70, 70] }} blink={blinking(s.frame, 2)} />
        <Cousin x={1750} y={980} scale={1.2} facing={-1} face="neutral" pose={{ ...STAND, armF: [60, 80] }} />
        <You x={1350} y={1000} scale={1.3} face="neutral" look={{ x: 0, y: 0.4 }} pose={{ ...STAND, armF: [50, 60] }} blink={blinking(s.frame)} />
      </>}
      ghost={<>
        <Mom x={mix(1000, 300, momGo)} y={980} scale={1.3} facing={-1} face="neutral" pose={walkPose(s.f * 0.1)} held={<ellipse rx={40} ry={8} fill="#eef1f5" />} />
        <Cousin x={1750} y={980} scale={1.2} facing={-1} face="happy" pose={{ ...STAND, armF: [100, 60] }} />
        <You x={1350} y={1000} scale={1.3} face="neutral" pose={{ ...STAND, armF: [50, 60] }} />
      </>}
      ghostOpacity={0.48}
    />
  );
};

// ---------- the belief breaks (lines 59-63) ----------

/** Lines 59-61: the ghost shows the hot handle; you shout; she turns and knocks the pan; you catch it; silence. */
export const PanKnock: React.FC<{ s: S }> = ({ s }) => {
  const shout = s.at(60) - 20;
  const tip = linear(s.f, shout + 14, shout + 26);
  const cam = camAt(s.f, [[0, { x: 600, y: 640, zoom: 1.4 }], [shout, { x: 560, y: 640, zoom: 1.5 }], [s.at(61), { x: 640, y: 680, zoom: 1.2 }], [s.d, { x: 600, y: 700, zoom: 1.35 }]]);
  const after = s.f > s.at(61) - 10;
  return (
    <Scene cam={cam} back={<Home cam={cam} table={false} />}
      actors={<>
        <Pan x={210} y={690} tip={after ? 0 : tip} />
        {after && <Smash x={300} y={990} k={1.3} chai />}
        <Mom x={360} y={980} scale={1.35} facing={s.f > shout ? 1 : -1} face={after ? "sad" : s.f > shout ? "shocked" : "neutral"}
          pose={after ? { ...STAND, lean: 14, armF: [20, 20] } : { ...STAND, armF: [70, 30] }} />
        <You x={after ? 520 : mix(1000, 560, ramp(s.f, shout + 10, shout + 24))} y={1000} scale={1.4} facing={-1}
          face={after ? "sad" : s.f > shout ? "afraid" : "worried"} pose={after ? { ...STAND, armF: [60, 60] } : STAND} blink={blinking(s.frame)} />
      </>}
      ghost={s.f < shout ? <Mom x={360} y={980} scale={1.35} facing={-1} face="afraid" pose={{ ...STAND, armF: [150, 120] }} /> : undefined}
      r={rippleAt(s.f, shout, 16)}
      over={<Bubble x={820} y={200} text="MOM, THE HANDLE!" p={linear(s.f, shout, shout + 4) * (1 - linear(s.f, shout + 30, shout + 36))} tail="right" />}
    />
  );
};

/** Lines 62-63: the name for it; you shift your weight and the ghost ripples, again and again. */
export const Rumour: React.FC<{ s: S }> = ({ s }) => {
  const cam = camAt(s.f, [[0, { x: 760, y: 620, zoom: 1.6 }], [s.d, { x: 760, y: 600, zoom: 2 }]]);
  const sway = Math.sin(s.f * 0.08);
  const ripples = [10, 70, 130, 200, 260, 330].map((x) => x);
  return (
    <Scene cam={cam} back={<Home cam={cam} table={false} />}
      actors={<You x={760 + sway * 10} y={1010} scale={1.5} face="worried" look={{ x: 0.4, y: 0.2 }} pose={{ ...STAND, lean: sway * 4 }} blink={blinking(s.frame)} />}
      ghost={<You x={760 + Math.sin((s.f + 30) * 0.08) * 40} y={1010} scale={1.5} pose={{ ...STAND, lean: Math.sin((s.f + 30) * 0.08) * 10 }} />}
      r={rippleAt(s.f, ripples, 14)}
    />
  );
};

export { Glass };
