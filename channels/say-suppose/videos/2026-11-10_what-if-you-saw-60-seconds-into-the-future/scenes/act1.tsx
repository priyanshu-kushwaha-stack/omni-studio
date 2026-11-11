// Act one: the click, the rule, the gap, the canteen, the boss, the platform (script lines 0-30).
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { CRIMSON, INK, MUSTARD } from "@whatif/kit/theme";
import { Bubble, Scene, Stamp } from "./kit";
import { Bus, Canteen, Dots, Glass, Laptop, Phone, Platform, Saucer, Smash, StreetNight, TV, Bedroom, Diagram } from "./sets";
import { blinking, camAt, linear, mix, noise, Person, ramp, rippleAt, Stranger, Vendor, You, type S } from "./shared";

const HOLD_GLASS: [number, number] = [30, 100];
const PHONE_UP: [number, number] = [50, 95];

// ---------- the click (lines 0-5) ----------

/** Lines 0-2: you at the stall, phone up, the glass on the counter; in the ghost the glass slides and falls. */
export const Click: React.FC<{ s: S }> = ({ s }) => {
  const fall = linear(s.f, s.at(2) - 6, s.at(2) + 8);
  const cam = camAt(s.f, [[0, { x: 1000, y: 640, zoom: 1.35 }], [s.d, { x: 1040, y: 660, zoom: 1.5 }]]);
  const flinch = ramp(s.f, s.at(2) + 4, s.at(2) + 12);
  const phoneUp = 1 - flinch;
  return (
    <Scene cam={cam} back={<StreetNight cam={cam} />}
      actors={<>
        <Glass x={1030} y={832} k={1.2} />
        <You x={760} y={1010} scale={1.5} face={flinch > 0.5 ? "shocked" : "neutral"} look={flinch > 0.5 ? { x: 0.6, y: 0.8 } : { x: 0.3, y: 0.2 }}
          pose={{ ...STAND, tilt: -6 * flinch, armF: phoneUp > 0.5 ? PHONE_UP : [20, 40], armB: [-8, 10] }} blink={blinking(s.frame)}
          held={phoneUp > 0.5 ? <Phone x={0} y={-20} k={0.55}><Dots frame={s.frame} /></Phone> : undefined} />
      </>}
      ghost={<>
        {fall < 1 ? <Glass x={1030 + fall * 60} y={832 + fall * fall * 170} k={1.2} tilt={fall * 80} /> : null}
        {fall >= 1 && <Smash x={1100} y={1000} k={1.3} />}
      </>}
      over={<>
        {s.f >= s.at(1) && s.f < s.at(2) && <PhoneInsert s={s} />}
      </>}
    />
  );
};

/** Line 1: the bus dot, the result page, her dots, cut one to a word. */
const PhoneInsert: React.FC<{ s: S }> = ({ s }) => {
  const span = s.at(2) - s.at(1);
  const which = Math.min(2, Math.floor(((s.f - s.at(1)) / span) * 3));
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
      <rect width={1920} height={1080} fill="#141826" />
      <g transform="translate(960 560) scale(5)">
        <Phone x={0} y={0}>
          {which === 0 && <><rect x={-24} y={-20} width={48} height={4} fill="#9aa3ad" /><circle cx={-20 + linear(s.f, s.at(1), s.at(1) + span / 3) * 30} cy={-18} r={4} fill={CRIMSON} /></>}
          {which === 1 && <text x={0} y={4} textAnchor="middle" fontFamily="Rubik" fontWeight={800} fontSize={11} fill={INK}>FRIDAY</text>}
          {which === 2 && <Dots frame={s.frame} />}
        </Phone>
      </g>
    </svg>
  );
};

/** Lines 3-5: close on the whole glass and your face (the thumbnail), then a slow push in. */
export const StillThere: React.FC<{ s: S }> = ({ s }) => {
  const cam = camAt(s.f, [[0, { x: 960, y: 640, zoom: 1.6 }], [s.at(4), { x: 900, y: 600, zoom: 1.8 }], [s.d, { x: 860, y: 580, zoom: 2.1 }]]);
  return (
    <Scene cam={cam} back={<StreetNight cam={cam} />}
      actors={<>
        <Glass x={1030} y={832} k={1.2} />
        <You x={760} y={1010} scale={1.5} face="shocked" eyes={1.3} look={s.f < s.at(4) ? { x: 0.7, y: 0.7 } : { x: 0.2, y: -0.1 }}
          pose={{ ...STAND, tilt: 4, armF: [40, 40], armB: [60, 96] }} blink={blinking(s.frame)} />
      </>}
      ghost={<Smash x={1100} y={1000} k={1.3} />}
      over={s.f > s.at(5) + 10 ? <Stamp x={150} y={90} text="WAIT, WHAT?" p={linear(s.f, s.at(5) + 10, s.at(5) + 20) * (1 - linear(s.f, s.d - 20, s.d - 5))} size={80} /> : null}
    />
  );
};

// ---------- the rule (lines 6-13) ----------

/** Line 9: wide street; the ghost bus pulls in across the road while the real one is two headlights far away. */
export const StreetWide: React.FC<{ s: S }> = ({ s }) => {
  const cam = camAt(s.f, [[0, { x: 600, y: 600, zoom: 0.8 }], [s.d, { x: 520, y: 600, zoom: 0.85 }]]);
  const ghostBus = mix(1600, -420, ramp(s.f, 0, s.d * 0.8));
  return (
    <Scene cam={cam} back={<StreetNight cam={cam} />}
      actors={<>
        <circle cx={2300} cy={740} r={10} fill="#fff1b8" /><circle cx={2340} cy={740} r={10} fill="#fff1b8" />
        <You x={760} y={1010} scale={1.5} face="shocked" look={{ x: -0.8, y: -0.2 }} pose={STAND} blink={blinking(s.frame)} />
        <g transform={`translate(${mix(1500, 600, linear(s.f, 20, s.d))} 0)`}><Dog f={s.frame} y={840} /></g>
      </>}
      ghost={<>
        <Bus x={ghostBus} y={760} k={0.9} />
        <g transform={`translate(${mix(1500, 600, linear(s.f, 0, s.d - 20))} 0)`}><Dog f={s.frame} y={840} /></g>
      </>}
    />
  );
};
const Dog: React.FC<{ f: number; y: number }> = ({ f, y }) => (
  <g transform={`translate(0 ${y})`}>
    <ellipse cx={0} cy={-30} rx={44} ry={20} fill="#c9a06a" /><circle cx={-44} cy={-46} r={16} fill="#c9a06a" />
    {[-26, -8, 14, 30].map((x, i) => <rect key={i} x={x} y={-14} width={7} height={18 + Math.sin(f * 0.5 + i) * 4} fill="#a07a50" />)}
  </g>
);

/** Line 10: the ghost chai-wallah pours an arc; a breath later the real one pours the same. */
export const Pour: React.FC<{ s: S }> = ({ s }) => {
  const cam = { x: 1300, y: 640, zoom: 1.5 };
  const pourAt = (f: number) => Math.sin(linear(f, 0, 50) * Math.PI);
  const arc = (p: number) => p > 0 ? <path d={`M1230 640 Q1300 ${600 - p * 40} 1370 ${780}`} stroke="#c9823f" strokeWidth={10} fill="none" opacity={p} /> : null;
  return (
    <Scene cam={cam} back={<StreetNight cam={cam} />}
      actors={<><Vendor x={1240} y={940} scale={1.3} facing={-1} pose={{ ...STAND, armF: [120, 30] }} />{arc(pourAt(s.f - 24))}<Glass x={1370} y={830} /></>}
      ghost={<>{arc(pourAt(s.f))}</>}
    />
  );
};

/** Line 11 (and again at line 12, settled): you step toward the road; the ghost ripples and redraws you on the kerb. */
export const Step: React.FC<{ s: S }> = ({ s }) => {
  const step = ramp(s.f, s.at(11) + 4, s.at(11) + 22);
  const cam = camAt(s.f, [[0, { x: 760, y: 660, zoom: 1.1 }], [s.d, { x: 700, y: 660, zoom: 1.2 }]]);
  const r = rippleAt(s.f, s.at(11) + 6, 16);
  return (
    <Scene cam={cam} back={<StreetNight cam={cam} />}
      actors={<You x={mix(760, 640, step)} y={1010} scale={1.5} face="sceptical" pose={step > 0 && step < 1 ? walkPose(step * 3) : STAND} blink={blinking(s.frame)} />}
      ghost={<You x={s.f < s.at(11) + 12 ? 760 : 520} y={s.f < s.at(11) + 12 ? 1250 : 1180} scale={1.5} pose={STAND} />}
      r={r}
    />
  );
};

/** Line 13 and the ident hold: you squeeze your eyes shut, open, rub; the ghost is still there. */
export const Rub: React.FC<{ s: S }> = ({ s }) => {
  const cam = { x: 760, y: 620, zoom: 2.2 };
  const shut = s.f < s.d * 0.35;
  return (
    <Scene cam={cam} back={<StreetNight cam={cam} />}
      actors={<You x={760} y={1010} scale={1.5} face={shut ? "sad" : "sceptical"} lids={shut ? 1 : 0} pose={{ ...STAND, armF: s.f > s.d * 0.5 ? [150, 20] : [20, 30] }} />}
      ghost={<Smash x={1040} y={1000} k={1.3} />}
      over={s.f > s.end(13) + 4 ? <Stamp x={560} y={430} text="SAY SUPPOSE" p={linear(s.f, s.end(13) + 4, s.end(13) + 14) * (1 - linear(s.f, s.d - 12, s.d))} size={110} tilt={-2} /> : null}
    />
  );
};

/** Lines 6-7: the gift, you grin at your own luck. */
export const Gift: React.FC<{ s: S }> = ({ s }) => {
  const cam = camAt(s.f, [[0, { x: 820, y: 640, zoom: 1.6 }], [s.d, { x: 800, y: 630, zoom: 1.75 }]]);
  return (
    <Scene cam={cam} back={<StreetNight cam={cam} />}
      actors={<You x={760} y={1010} scale={1.5} face="happy" pose={{ ...STAND, tilt: -4, armF: [70, 60], armB: [-70, -40] }} blink={blinking(s.frame)} />}
      ghost={<Glass x={1030} y={832} k={1.2} />}
    />
  );
};

/** Line 8: behind you a man laughs in the ghost, then for real; you're on your phone. */
export const Laugh: React.FC<{ s: S }> = ({ s }) => {
  const cam = { x: 1000, y: 640, zoom: 1.2 };
  const real = s.f > 40;
  return (
    <Scene cam={cam} back={<StreetNight cam={cam} />}
      actors={<>
        <Person i={3} x={1350} y={940} scale={1.2} facing={-1} face={real ? "happy" : "neutral"} mouth={real ? "open" : "flat"} pose={{ ...STAND, tilt: real ? -8 : 0 }} />
        <You x={760} y={1010} scale={1.5} face="neutral" look={{ x: 0.3, y: 0.6 }} pose={{ ...STAND, armF: PHONE_UP }} held={<Phone x={0} y={-20} k={0.55} />} />
      </>}
      ghost={<Person i={3} x={1350} y={940} scale={1.2} facing={-1} face="happy" mouth="open" pose={{ ...STAND, tilt: -8 }} />}
    />
  );
};

// ---------- the gap (lines 14-16) ----------

/** The hold before line 14: the ghost bus stops, nobody gets off, it goes; the real bus does the same. */
export const BusGap: React.FC<{ s: S }> = ({ s }) => {
  const cam = { x: 300, y: 620, zoom: 0.9 };
  const half = s.d / 2;
  const busX = (f: number) => f < 0 ? 1800 : f < 25 ? mix(1800, -300, ramp(f, 0, 25)) : f < half - 20 ? -300 : mix(-300, -1500, ramp(f, half - 20, half));
  return (
    <Scene cam={cam} back={<StreetNight cam={cam} />}
      actors={<><Bus x={busX(s.f - half)} y={760} k={0.9} doors={s.f > half + 30 && s.f < s.d - 25 ? 1 : 0} />
        <You x={760} y={1010} scale={1.5} face="sceptical" look={{ x: -0.9, y: -0.1 }} mouth={Math.floor(s.f / 8) % 2 ? "o" : "flat"} pose={STAND} /></>}
      ghost={<Bus x={busX(s.f)} y={760} k={0.9} doors={s.f > 30 && s.f < half - 25 ? 1 : 0} />}
    />
  );
};

/** Lines 14-16: the real glass goes; you catch it; the saucer goes instead; the vendor. */
export const Catch: React.FC<{ s: S }> = ({ s }) => {
  const grab = s.at(15) - 6;
  const caught = s.f >= grab;
  const sauce = linear(s.f, grab, grab + 12);
  const cam = camAt(s.f, [[0, { x: 980, y: 700, zoom: 1.6 }], [grab, { x: 980, y: 720, zoom: 1.6 }], [s.at(16), { x: 1150, y: 680, zoom: 1.3 }]]);
  const glassSlide = linear(s.f, 10, grab);
  const r = rippleAt(s.f, grab, 16);
  return (
    <Scene cam={cam} back={<StreetNight cam={cam} />}
      actors={<>
        {!caught && <Glass x={1030 + glassSlide * 40} y={832} k={1.2} tilt={glassSlide * 25} />}
        {sauce < 1 ? <Saucer x={980 - sauce * 40} y={828 + sauce * sauce * 170} k={1.2} /> : <Smash x={960} y={1000} k={0.9} chai={false} />}
        <Vendor x={1450} y={940} scale={1.3} facing={-1} face={s.f > s.at(16) ? "sceptical" : "neutral"} pose={{ ...STAND, armF: s.f > s.at(16) ? [90, 0] : [20, 20] }} />
        <You x={760} y={1010} scale={1.5} face={caught ? "shocked" : "worried"} pose={{ ...STAND, lean: caught ? 8 : 0, armF: caught ? HOLD_GLASS : [20, 40] }}
          held={caught ? <Glass x={0} y={0} k={0.8} /> : undefined} />
      </>}
      ghost={<>{s.f < grab ? <Glass x={1080} y={1000} k={1.2} tilt={80} /> : <Vendor x={1150} y={940} scale={1.3} facing={-1} pose={{ ...STAND, armF: [40, 20] }} face="sceptical" />}</>}
      r={r}
      over={<Bubble x={1150} y={180} text="Saucer is extra!" p={linear(s.f, s.at(16), s.at(16) + 6)} tail="right" />}
    />
  );
};

// ---------- the canteen (lines 17-24) ----------

const FRIENDS = [0, 1, 2, 4];
const friendX = (i: number) => 380 + i * 230;

/** Lines 17-20: the canteen TV and its ghost; you call the six; friends erupt, then watch you, then leave. */
export const CanteenSix: React.FC<{ s: S }> = ({ s }) => {
  const cam = camAt(s.f, [[0, { x: 960, y: 560, zoom: 1 }], [s.at(18), { x: 960, y: 520, zoom: 1.15 }], [s.d, { x: 860, y: 560, zoom: 1.05 }]]);
  const ballG = linear(s.f, s.at(18) - 10, s.at(18) + 14);
  const ballR = linear(s.f, s.at(18) + 30, s.at(18) + 54);
  const erupt = s.f > s.at(18) + 54 && s.f < s.at(20);
  const watching = s.f > s.at(19);
  const leaving = linear(s.f, s.at(20), s.d);
  return (
    <Scene cam={cam} back={<Canteen cam={cam} />}
      actors={<>
        <TV x={960} y={300} k={1} ball={Math.min(1, ballR * 1.5)} six={Math.max(0, ballR * 1.5 - 1) * 2} />
        {FRIENDS.map((c, i) => {
          const gone = leaving * 4 > 4 - i;
          return gone ? null : (
            <Person key={c} i={c} x={friendX(i)} y={970} scale={1.15} face={erupt ? "happy" : watching ? "sceptical" : "neutral"}
              mouth={erupt ? "open" : undefined} look={watching ? { x: 1, y: 0 } : { x: 0.3, y: -1 }}
              pose={{ ...STAND, armF: erupt ? [170, 10] : [20, 30], armB: erupt ? [-170, -10] : [-10, 10] }} blink={blinking(s.frame, i)} />
          );
        })}
        <You x={1420} y={990} scale={1.25} facing={-1} face={s.f > s.at(18) ? "sceptical" : "neutral"} look={{ x: 0.2, y: -0.8 }}
          pose={{ ...STAND, armF: s.f > s.at(18) - 14 && s.f < s.at(18) + 20 ? [150, 0] : [30, 100] }} held={<g transform="translate(0 -10)"><rect x={-9} y={-24} width={18} height={24} fill="#c9823f" /></g>} />
      </>}
      ghost={<TV x={960} y={300} k={1} ball={Math.min(1, ballG * 1.5)} six={Math.max(0, ballG * 1.5 - 1) * 2} />}
      ghostOpacity={0.3}
      over={<Bubble x={300} y={250} text="How did you know?" p={linear(s.f, s.at(19), s.at(19) + 6) * (1 - linear(s.f, s.end(19) + 30, s.end(19) + 36))} />}
    />
  );
};

/** Lines 21-22: the batter on the screen; a paper diagram, hand to bat, then an eye on the wrist. */
export const Pitch: React.FC<{ s: S }> = ({ s }) => {
  const cam = { x: 960, y: 300, zoom: 2.4 };
  const draw = linear(s.f, 10, 50);
  const eye = linear(s.f, s.at(22), s.at(22) + 12);
  return (
    <Scene cam={cam} back={<Canteen cam={cam} />}
      actors={<>
        <TV x={960} y={300} k={1} ball={(s.f % 30) / 30} />
        <g transform="translate(780 190)">
          <Diagram x={0} y={0} w={360} h={220} p={linear(s.f, 0, 10)}>
            <circle cx={40} cy={110} r={14} fill={INK} />
            <path d={`M54 110 L${54 + draw * 260} 110`} stroke={CRIMSON} strokeWidth={6} />
            <rect x={310} y={80} width={14} height={70} fill="#8a5d40" />
            <text x={180} y={190} textAnchor="middle" fontFamily="Rubik" fontWeight={800} fontSize={30} fill={INK} opacity={draw}>UNDER HALF A SECOND</text>
            {eye > 0 && <g opacity={eye}><ellipse cx={40} cy={64} rx={26} ry={14} fill="#fff" stroke={INK} strokeWidth={4} /><circle cx={40} cy={64} r={7} fill={INK} /></g>}
          </Diagram>
        </g>
      </>}
    />
  );
};

/** Lines 23-24: the bench, empty but for you; on the ghost TV a celebration nobody watches. */
export const Alone: React.FC<{ s: S }> = ({ s }) => {
  const cam = camAt(s.f, [[0, { x: 1100, y: 640, zoom: 1.3 }], [s.d, { x: 1150, y: 660, zoom: 1.45 }]]);
  return (
    <Scene cam={cam} back={<Canteen cam={cam} />}
      actors={<><TV x={960} y={300} /><You x={1420} y={990} scale={1.25} facing={-1} face="sad" look={{ x: 0.9, y: 0.3 }} pose={STAND} blink={blinking(s.frame)} /></>}
      ghost={<TV x={960} y={300} six={linear(s.f, 0, 30)} ball={1} />}
    />
  );
};

// ---------- the boss (lines 25-27) ----------

/** Lines 25-27: the boss's ghost message; you send the deck; the real dots; the ghost message grows. */
export const BossDots: React.FC<{ s: S }> = ({ s }) => {
  const cam = camAt(s.f, [[0, { x: 960, y: 600, zoom: 1.3 }], [s.at(27), { x: 960, y: 620, zoom: 1.5 }], [s.d, { x: 980, y: 640, zoom: 1.7 }]]);
  const sent = s.f > s.at(26) + 10;
  const realDots = s.f > s.at(27) - 20;
  const grow = linear(s.f, s.at(27) + 10, s.d);
  const r = rippleAt(s.f, s.at(27) - 10, 16);
  const rows = (n: number) => Array.from({ length: n }, (_, i) => <rect key={i} x={-120} y={-60 + i * 22} width={i % 2 ? 180 : 230} height={12} rx={6} fill="#9aa3ad" />);
  return (
    <Scene cam={cam} back={<Bedroom cam={cam} />}
      actors={<>
        <Laptop x={960} y={780} k={1}>
          {realDots && <Dots frame={s.frame} x={-90} y={40} k={1.5} />}
          {sent && <rect x={40} y={60} width={110} height={30} rx={10} fill="#7fc29b" />}
        </Laptop>
        <You x={600} y={1030} scale={1.3} face={grow > 0.3 ? "worried" : sent ? "happy" : "determined"} look={{ x: 1, y: 0.4 }}
          pose={{ ...STAND, lean: sent && !realDots ? -8 : 4, armF: sent ? [40, 60] : [80, 20] }} blink={blinking(s.frame)} />
      </>}
      ghost={<g transform="translate(960 660)">{rows(3 + Math.floor(grow * 6))}</g>}
      r={r}
      over={<Bubble x={1150} y={200} text="Great. Since you're free..." p={linear(s.f, s.at(27), s.at(27) + 6)} tail="right" />}
    />
  );
};

// ---------- the platform (lines 28-30) ----------

const CROWD = Array.from({ length: 14 }, (_, i) => ({ x: -500 + i * 230 + noise(i) * 60, i, facing: (i % 3 ? 1 : -1) as 1 | -1 }));
export const STRANGER_X = -380;

/** Line 28 and the hold before it: every person and their ghost one step ahead; the stranger, with no ghost. */
export const PlatformWide: React.FC<{ s: S }> = ({ s }) => {
  const cam = camAt(s.f, [[0, { x: 300, y: 620, zoom: 0.75 }], [s.d, { x: 900, y: 620, zoom: 0.78 }]]);
  return (
    <Scene cam={cam} back={<Platform cam={cam} />}
      actors={<>
        {CROWD.map((c) => <Person key={c.i} i={c.i} x={c.x} y={1060} scale={1} facing={c.facing} pose={STAND} blink={blinking(s.frame, c.i)} />)}
        <Stranger x={STRANGER_X} y={1060} scale={1.05} pose={STAND} look={{ x: 1, y: 0 }} />
        <You x={1500} y={1080} scale={1.1} face="sceptical" pose={STAND} blink={blinking(s.frame, 9)} />
      </>}
      ghost={<>
        {CROWD.map((c) => <Person key={c.i} i={c.i} x={c.x + c.facing * 70} y={1060} scale={1} facing={c.facing} pose={walkPose(c.i)} />)}
        <You x={1590} y={1080} scale={1.1} pose={walkPose(2)} />
      </>}
      ghostOpacity={0.35}
    />
  );
};

/** Lines 29-30: the real train; you walk to the seat the ghost showed; a man watches and gets there first. */
export const Seat: React.FC<{ s: S }> = ({ s }) => {
  const cam = { x: 1100, y: 640, zoom: 1.2 };
  const walk = ramp(s.f, 6, s.at(30));
  const cut = ramp(s.f, s.at(30), s.at(30) + 24);
  return (
    <Scene cam={cam} back={<Platform cam={cam} train={1} doors={1} />}
      actors={<>
        <Person i={5} x={mix(600, 1250, cut)} y={1080} scale={1.15} face="determined" pose={cut > 0 && cut < 1 ? walkPose(cut * 4) : STAND} />
        <You x={mix(800, 1180, walk)} y={1090} scale={1.2} face={cut > 0.6 ? "sad" : "happy"} pose={walk > 0 && walk < 1 ? walkPose(walk * 5) : STAND} blink={blinking(s.frame)} />
      </>}
      ghost={<rect x={1210} y={560} width={120} height={60} rx={8} fill={MUSTARD} />}
      r={rippleAt(s.f, s.at(30) + 20, 16)}
    />
  );
};
