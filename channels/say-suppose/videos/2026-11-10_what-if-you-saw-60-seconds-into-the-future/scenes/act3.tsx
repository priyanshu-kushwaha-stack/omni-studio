// Act three: the cost, the platform, the peak, the scale, the choice, the turn, back to you (script lines 64-90).
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { CRIMSON, INK, PAPER } from "@whatif/kit/theme";
import { Bubble, Scene, Stamp } from "./kit";
import { Bus, Carriage, Diagram, Dots, Glass, GrandpaRoom, Phone, Platform, Saucer, StreetNight } from "./sets";
import { blinking, camAt, Cousin, Grandpa, linear, mix, Mom, noise, Person, ramp, rippleAt, You, type S } from "./shared";

const KNEE = { ...STAND, tilt: -10, armF: [60, 20] as [number, number], armB: [-40, 30] as [number, number] };
const pedal = (f: number) => ({ ...STAND, armF: [90 + Math.sin(f * 0.3) * 20, 40] as [number, number], armB: [60, 60] as [number, number] });

// ---------- the cost (lines 64-68) ----------

/** Lines 64-67: a month on; you laugh one second early; he stops; "You've heard it." He does not finish. */
export const Early: React.FC<{ s: S }> = ({ s }) => {
  const early = s.at(65) + 10;
  const stopped = s.f > early + 8;
  const cam = camAt(s.f, [[0, { x: 960, y: 620, zoom: 1.05 }], [s.at(65), { x: 1000, y: 620, zoom: 1.2 }], [s.at(66), { x: 1150, y: 560, zoom: 1.9 }], [s.d, { x: 1120, y: 580, zoom: 1.6 }]]);
  return (
    <Scene cam={cam} back={<GrandpaRoom cam={cam} />}
      actors={<>
        <Cousin x={1650} y={960} scale={1.05} face="neutral" pose={STAND} />
        <Grandpa x={1250} y={980} scale={1.35} facing={-1} face={stopped ? "sad" : "happy"} mouth={stopped ? "flat" : "open"}
          pose={stopped ? (s.f > s.at(67) ? { ...STAND, lean: -8, armF: [120, 10] } : STAND) : pedal(s.frame)} blink={blinking(s.frame, 3)} />
        <You x={640} y={1000} scale={1.4} face={stopped ? "worried" : s.f > early ? "happy" : "neutral"} mouth={s.f > early && !stopped ? "open" : undefined} pose={STAND} blink={blinking(s.frame)} />
      </>}
      ghost={!stopped ? <Grandpa x={1250} y={980} scale={1.35} facing={-1} face="happy" mouth="open" pose={KNEE} /> : undefined}
      over={<Bubble x={1150} y={170} text="You've heard it." p={linear(s.f, s.at(66), s.at(66) + 5)} tail="right" />}
    />
  );
};

/** The hold after line 67 and line 68: from the kitchen doorway, he tells it to your cousin instead. */
export const Doorway: React.FC<{ s: S }> = ({ s }) => {
  const cam = camAt(s.f, [[0, { x: 1100, y: 640, zoom: 1 }], [s.d, { x: 1050, y: 640, zoom: 1.1 }]]);
  const laugh = Math.floor(s.f / 50) % 2 === 1;
  return (
    <Scene cam={cam} back={<GrandpaRoom cam={cam} />}
      actors={<>
        <rect x={180} y={180} width={60} height={820} fill="#8a6a48" />
        <Cousin x={1550} y={960} scale={1.1} facing={-1} face={laugh ? "happy" : "neutral"} mouth={laugh ? "open" : undefined} pose={STAND} />
        <Grandpa x={1220} y={980} scale={1.35} face="happy" mouth={laugh ? "open" : "smile"} pose={laugh ? KNEE : pedal(s.frame)} />
        <You x={360} y={1000} scale={1.4} face="sad" look={{ x: 1, y: 0 }} pose={STAND} blink={blinking(s.frame)} />
      </>}
      ghost={<You x={360} y={1000} scale={1.4} face="sad" pose={STAND} />}
    />
  );
};

// ---------- the platform (lines 69-74) ----------

const CROWD = Array.from({ length: 12 }, (_, i) => ({ x: 300 + i * 150 + noise(i) * 40, i }));

/** Lines 69-74: grandfather's first metro ride; you steer him by the ghost; every move redraws it worse. */
export const Steer: React.FC<{ s: S }> = ({ s }) => {
  const steer = s.at(71), left = s.at(72), call = s.at(73);
  const cam = camAt(s.f, [[0, { x: 960, y: 640, zoom: 1.05 }], [steer, { x: 1000, y: 660, zoom: 1.2 }], [s.at(74), { x: 1000, y: 640, zoom: 1.45 }], [s.d, { x: 1000, y: 620, zoom: 1.6 }]]);
  const stage = s.f < steer ? 0 : s.f < left ? 1 : s.f < call ? 2 : 3;
  // the ghost grandfather: where your last move sends him
  const ghostX = [900, 1180, 1320, 1250][stage];
  const ghostDown = stage >= 1 ? ramp(s.f - [0, steer, left, call][stage], 20, 50) : 0;
  const pull = [0, 20, -20, 0][stage];
  const surge = (k: number) => Math.sin(s.f * 0.1 + k) * 12 + (stage >= 1 ? 30 : 0);
  return (
    <Scene cam={cam} back={<Platform cam={cam} train={1} doors={1} />}
      actors={<>
        {CROWD.map((c) => <Person key={c.i} i={c.i} x={c.x + surge(c.i)} y={860 + (c.i % 2) * 20} scale={1.05} facing={c.i % 2 ? 1 : -1} face="neutral" pose={walkPose(s.f * 0.05 + c.i)} />)}
        <Grandpa x={900 + pull * 2} y={910} scale={1.2} face={stage ? "worried" : "happy"} mouth={stage ? undefined : "open"} look={{ x: -0.6, y: 0 }} pose={STAND} />
        <You x={760} y={930} scale={1.25} face={stage >= 2 ? "afraid" : "determined"} look={{ x: 1, y: 0.2 }}
          pose={{ ...STAND, armF: stage === 1 ? [110, 0] : stage === 2 ? [70, -40] : [90, 30] }} blink={blinking(s.frame)} />
      </>}
      ghost={<Grandpa x={ghostX} y={910 + ghostDown * 40} scale={1.2} face="afraid" rotate={ghostDown * 70} pose={STAND} />}
      r={rippleAt(s.f, [steer + 6, left + 6, call + 6], 16)}
      over={<Bubble x={980} y={180} text="So many people!" p={linear(s.f, s.at(70), s.at(70) + 5) * (1 - linear(s.f, steer - 6, steer))} tail="right" />}
    />
  );
};

/** The peak, 9 s wordless: you let go; he picks his own spot; the ghost redraws slower and slides into one picture. */
export const Peak: React.FC<{ s: S }> = ({ s }) => {
  const cam = camAt(s.f, [[0, { x: 1000, y: 620, zoom: 1.6 }], [s.d, { x: 960, y: 600, zoom: 1.25 }]]);
  const letGo = ramp(s.f, 10, 40);
  const settle = ramp(s.f, s.d * 0.45, s.d * 0.8);
  const ripples = [50, 100, 160].map((x) => x);
  const doorsClose = s.f > s.d * 0.82;
  return (
    <Scene cam={cam} back={<Platform cam={cam} train={doorsClose ? 1 - linear(s.f, s.d * 0.86, s.d) : 1} doors={doorsClose ? 0 : 1} />}
      actors={<>
        <Grandpa x={mix(980, 940, letGo)} y={910} scale={1.2} face="neutral" look={{ x: -1, y: 0 }} pose={{ ...STAND, armF: [70, 20] }} />
        <You x={760} y={930} scale={1.25} face="sad" lids={0.4} pose={{ ...STAND, armF: [mix(90, 10, letGo), mix(30, 10, letGo)] }} />
      </>}
      ghost={<Grandpa x={mix(1240, 940, settle)} y={910} scale={1.2} face="neutral" pose={STAND} />}
      ghostOpacity={0.45 * (1 - settle * 0.95)}
      r={rippleAt(s.f, ripples, 22)}
    />
  );
};

// ---------- the scale (lines 75-79) ----------

/** Lines 75-76: the train home brakes; a paper diagram of the quake sensor; his hand stays on your sleeve. */
export const Brake: React.FC<{ s: S }> = ({ s }) => {
  const sway = Math.sin(linear(s.f, 0, 24) * Math.PI) * 14;
  const cam = { x: 960 + sway * 2, y: 620, zoom: 1.15 };
  const quake = (x: number) => Math.sin(x * 0.4) * (x > 120 ? 40 : 6);
  return (
    <Scene cam={cam} back={<Carriage cam={cam} tunnel={s.f < 24 ? s.frame : 24} day />}
      actors={<>
        <Grandpa x={1150} y={980} scale={1.35} facing={-1} face="sceptical" pose={{ ...STAND, lean: sway, armF: [70, 30] }} />
        <You x={760} y={1000} scale={1.4} face="neutral" pose={{ ...STAND, lean: sway }} blink={blinking(s.frame)} />
        {s.f < s.at(76) && (
          <Diagram x={1120} y={140} w={560} h={300} p={linear(s.f, 20, 32)}>
            <path d={Array.from({ length: 80 }, (_, i) => `${i ? "L" : "M"}${30 + i * 6} ${120 + quake(i * 6 * Math.min(1, linear(s.f, 30, 70)))}`).join(" ")} stroke={INK} strokeWidth={4} fill="none" />
            <rect x={60} y={200} width={360} height={60} rx={20} fill="#e6e8ec" stroke={INK} strokeWidth={4} />
            <text x={430} y={244} fontFamily="Rubik" fontWeight={800} fontSize={40} fill={CRIMSON} opacity={linear(s.f, 70, 80)}>STOP</text>
          </Diagram>
        )}
      </>}
    />
  );
};

/** Lines 77-79: Lorenz's weather map swirls into a different storm; one minute is enough. */
export const Lorenz: React.FC<{ s: S }> = ({ s }) => {
  const cam = { x: 960, y: 600, zoom: 1.1 };
  const swirl = linear(s.f, 20, s.at(78));
  const map = s.f < s.at(79);
  return (
    <Scene cam={cam} back={<Carriage cam={cam} tunnel={s.frame * 0.3} day />}
      actors={<>
        <Grandpa x={1150} y={980} scale={1.35} facing={-1} face="neutral" pose={{ ...STAND, armF: [70, 30] }} blink={blinking(s.frame, 3)} />
        <You x={760} y={1000} scale={1.4} face="neutral" look={{ x: 0.4, y: -0.6 }} pose={STAND} blink={blinking(s.frame)} />
        {map && (
          <Diagram x={560} y={110} w={800} h={420} p={linear(s.f, 0, 10)}>
            <text x={400} y={70} textAnchor="middle" fontFamily="Rubik" fontWeight={800} fontSize={44} fill={INK}>0.506127 → 0.506</text>
            {[0, 1].map((k) => (
              <g key={k} transform={`translate(${220 + k * 360} 250) rotate(${k ? swirl * 300 : 0})`}>
                {[40, 80, 120].map((r) => <ellipse key={r} rx={r} ry={r * (k ? 1 - swirl * 0.5 : 0.7)} fill="none" stroke={k ? CRIMSON : "#3d6fb0"} strokeWidth={6} />)}
              </g>
            ))}
          </Diagram>
        )}
      </>}
    />
  );
};

// ---------- the choice and the turn (lines 80-86) ----------

/** Lines 80-81 and the hold: "Did I ever tell you..."; the ghost already at the wedding; you close your eyes. */
export const Choice: React.FC<{ s: S }> = ({ s }) => {
  const shut = s.f > s.end(81) - 4;
  const cam = camAt(s.f, [[0, { x: 1000, y: 620, zoom: 1.05 }], [s.at(81), { x: 760, y: 600, zoom: 1.6 }], [s.d, { x: 680, y: 560, zoom: 2.4 }]]);
  return (
    <Scene cam={cam} back={<GrandpaRoom cam={cam} />}
      actors={<>
        <Mom x={1600} y={960} scale={1.1} facing={-1} face="happy" pose={STAND} />
        <Cousin x={1800} y={960} scale={1.05} facing={-1} face="sad" lids={0.6} pose={STAND} />
        <Grandpa x={1250} y={980} scale={1.35} facing={-1} face="happy" mouth="open" pose={pedal(s.frame)} />
        <You x={640} y={1000} scale={1.4} face={shut ? "relieved" : "neutral"} lids={shut ? 1 : 0} pose={STAND} blink={!shut && blinking(s.frame)} />
      </>}
      ghost={<Grandpa x={1250} y={980} scale={1.35} facing={-1} face="happy" mouth="open" pose={KNEE} />}
      ghostOpacity={shut ? 0.25 : 0.42}
    />
  );
};

/** Lines 82-86: the punchline lands; you laugh late and loud; the dopamine diagram; the saucer slides across. */
export const Turn: React.FC<{ s: S }> = ({ s }) => {
  const open = s.f > s.end(83);
  const cam = camAt(s.f, [[0, { x: 900, y: 620, zoom: 1.2 }], [s.at(84), { x: 960, y: 620, zoom: 1.05 }], [s.at(85), { x: 900, y: 640, zoom: 1.35 }], [s.d, { x: 860, y: 620, zoom: 1.6 }]]);
  const laugh = s.f > s.at(83) - 6;
  const slide = linear(s.f, s.at(85) - 30, s.at(85));
  const bright = Math.abs(Math.sin(s.f * 0.15));
  return (
    <Scene cam={cam} back={<GrandpaRoom cam={cam} />}
      actors={<>
        <Cousin x={1650} y={960} scale={1.05} facing={-1} face={laugh ? "happy" : "neutral"} mouth={laugh ? "open" : undefined} pose={laugh ? KNEE : STAND} />
        <Grandpa x={1250} y={980} scale={1.35} facing={-1} face="happy" mouth="open" pose={laugh ? { ...STAND, armF: [100, 0] } : KNEE} />
        <Saucer x={mix(1080, 820, slide)} y={900} />
        <You x={640} y={1000} scale={1.4} face={laugh ? "happy" : "neutral"} mouth={laugh ? "open" : undefined} lids={open ? 0 : 1}
          pose={laugh ? { ...STAND, tilt: -10 } : STAND} blink={open && blinking(s.frame)} />
        {s.f > s.at(84) && s.f < s.at(85) && (
          <Diagram x={1180} y={130} w={600} h={300} p={linear(s.f, s.at(84), s.at(84) + 10)}>
            <circle cx={170} cy={150} r={40 + bright * 30} fill="#f2b632" opacity={0.5 + bright * 0.5} /><circle cx={170} cy={150} r={30} fill={CRIMSON} />
            <circle cx={430} cy={150} r={30} fill="#9aa3ad" />
            <text x={170} y={260} textAnchor="middle" fontFamily="Rubik" fontWeight={800} fontSize={30} fill={INK}>SURPRISE</text>
            <text x={430} y={260} textAnchor="middle" fontFamily="Rubik" fontWeight={800} fontSize={30} fill={INK}>SAW IT COMING</text>
          </Diagram>
        )}
      </>}
      over={<Bubble x={1050} y={160} text="The wrong bride's house!" p={linear(s.f, 0, 5) * (1 - linear(s.f, s.at(83), s.at(83) + 6))} tail="right" />}
    />
  );
};

// ---------- back to you (lines 87-90) and the end card ----------

/** Lines 87-90: Friday, the bus stop; phone in your pocket glowing; the ghost bus early; a glass in both hands. */
export const BusStop: React.FC<{ s: S }> = ({ s }) => {
  const cam = camAt(s.f, [[0, { x: 760, y: 640, zoom: 1.3 }], [s.at(89), { x: 700, y: 640, zoom: 1.1 }], [s.d, { x: 640, y: 620, zoom: 1.05 }]]);
  const glass = s.f > s.at(88) - 30;
  const ghostBus = mix(1800, -400, ramp(s.f, s.at(88) - 60, s.at(89)));
  const realBus = s.f > s.at(90) + 40;
  return (
    <Scene cam={cam} back={<StreetNight cam={cam} />}
      actors={<>
        {realBus && <><circle cx={2100} cy={740} r={12} fill="#fff1b8" /><circle cx={2150} cy={740} r={12} fill="#fff1b8" /></>}
        <You x={760} y={1010} scale={1.5} face="relieved" look={{ x: -1, y: 0 }} pose={{ ...STAND, armF: glass ? [40, 100] : [10, 20], armB: glass ? [40, 100] : [-8, 10] }}
          held={glass ? <Glass x={0} y={0} k={0.8} /> : undefined} blink={blinking(s.frame)} />
        <g opacity={0.6 + 0.4 * Math.sin(s.frame * 0.2)}>
          <circle cx={720} cy={1020} r={18} fill="#a6e6ff" opacity={0.5} />
        </g>
      </>}
      ghost={<Bus x={ghostBus} y={760} k={0.9} />}
      over={s.f < s.at(88) ? <svg width={1920} height={1080} style={{ position: "absolute" }}><g transform="translate(300 900)"><Phone x={0} y={0} k={0.9}><Dots frame={s.frame} /></Phone></g></svg> : null}
    />
  );
};

/** The end card: you small in the left two-thirds; the right third stays quiet for end screens. */
export const EndCard: React.FC<{ s: S }> = ({ s }) => {
  const cam = { x: 1600, y: 600, zoom: 0.9 };
  return (
    <Scene cam={cam} back={<StreetNight cam={cam} />}
      actors={<You x={1060} y={1010} scale={1.5} face="relieved" pose={{ ...STAND, armF: [40, 100], armB: [40, 100] }} held={<Glass x={0} y={0} k={0.8} />} blink={blinking(s.frame)} />}
      over={<>
        <Stamp x={120} y={110} text="LIKE" p={linear(s.f, 10, 20)} size={60} />
        <Stamp x={360} y={110} text="SUBSCRIBE" p={linear(s.f, 20, 30)} size={60} />
        <Stamp x={120} y={240} text="WHAT WOULD YOU NOT WANT TO SEE COMING?" p={linear(s.f, 34, 44)} size={38} tilt={-1} />
      </>}
    />
  );
};

export { Bus, PAPER, Person };
