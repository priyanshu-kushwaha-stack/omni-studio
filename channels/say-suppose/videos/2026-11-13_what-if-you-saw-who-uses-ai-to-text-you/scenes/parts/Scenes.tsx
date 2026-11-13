// The AI-texts first cut's scenes, each one `> SCENE:` of script.md v1.1 drawn from a library set (kitchen, bus,
// office desk, bedroom, street, canteen, rooftop) or as a phone insert or a paper drawing. Screen pixels for overlays.
// First cut: every scene present and moving; the polish (hands, eyes, paths) comes at picture lock.
import { AbsoluteFill } from "remotion";
import { bedroom, bus, canteen, kitchen, officeDesk, rooftop, street } from "@whatif/kit/sets";
import type { MoodName } from "@whatif/kit/stage/moods";
import { STAND, SEATED } from "@whatif/kit/rig/pose";
import { FONT } from "@whatif/kit/fonts";
import { INK, PAPER } from "@whatif/kit/theme";
import { AUNT1, AUNT2, BEST, BOSS, COUSIN, COWORKER, KID, MAN, MOTHER, on, Place, STRANGER, YOU, type Face } from "./Places";
import { ChatPhone, Dot, ease, mix, Paper, ramp, type Msg, type ShotTime } from "./util";

const PINK = "#f9c6d3", MINT = "#c3ead7", PEACH = "#fbd8b8", LAV = "#dacbf0", GREY = "#b9c8dc", BLUE = "#bfe3f0";

/** The birthday column: four warm dotted wishes and your father's short bare one at the bottom. */
export const BIRTHDAY: Msg[] = [
  { from: PINK, lines: 4, dot: true }, { from: MINT, lines: 2, dot: true }, { from: PEACH, lines: 2, dot: true },
  { from: LAV, lines: 1, dot: true }, { from: GREY, text: "Hapy birthday kid" },
];

/** A phone insert: the set behind, dimmed and soft, and the phone large in the middle with its chat. */
export const Insert: React.FC<{
  t: ShotTime; mood: MoodName; msgs: Msg[]; dotsAt?: number; dotEvery?: number; contact?: string; place?: "kitchen" | "bus" | "office" | "bedroom" | "cafe" | "break";
  highlight?: number; dark?: boolean; x?: number;
}> = ({ t, mood, msgs, dotsAt = 6, dotEvery = 7, contact, place = "kitchen", highlight, dark, x = 960 }) => {
  const set = { kitchen, bus, office: officeDesk, bedroom, cafe: canteen, break: officeDesk }[place];
  return (
    <Place t={t} set={set as typeof kitchen} mood={mood} dim={0.62} push={[1.04, 1.08]}
      overlay={<ChatPhone f={t.f} msgs={msgs} x={x} y={560 + mix(14, -14, ease(t.p))} s={0.98} dotsAt={dotsAt} dotEvery={dotEvery}
        contact={contact} highlight={highlight} dark={dark} />} />
  );
};

/** The kitchen: you at the counter with your phone, your mother at the stove (or the sink, or beside you). */
export const Kitchen: React.FC<{ t: ShotTime; mood: MoodName; you?: Face; mother?: Face | null; cam?: "wide" | "stove" | "twoShot"; cake?: boolean }> = ({
  t, mood, you = "neutral", mother = "neutral", cam = "twoShot", cake,
}) => (
  <Place t={t} set={kitchen} mood={mood} cam={cam} options={{ stove: "kettle", steam: mood === "lamp" ? 0.3 : 0.6 }}
    cast={[
      ...(mother ? [on("cook", MOTHER, mother, cake ? { pose: { ...STAND, armF: [70, 20] } } : {})] : []),
      on("counter", YOU, you, { phone: true, pose: { ...STAND, armF: [40, 70] } }),
    ]}
    overlay={cake ? <SmallCake x={1060} y={760} /> : undefined} />
);

const SmallCake: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) scale(0.55)`}>
    <path d="M-130 -10 L-130 -120 Q0 -160 130 -120 L130 -10 Q0 24 -130 -10Z" fill="#f6c9d4" stroke={INK} strokeWidth={8} />
    <ellipse cx={0} cy={-120} rx={130} ry={34} fill="#fbe3ea" stroke={INK} strokeWidth={8} />
    <rect x={-8} y={-210} width={16} height={92} rx={5} fill="#1D9A8F" stroke={INK} strokeWidth={5} />
    <path d="M0 -236 Q-14 -256 0 -270 Q14 -256 0 -236Z" fill="#ffcf5a" stroke={INK} strokeWidth={4} />
  </g>
);

/** The bus: you at the window with your phone; a kid across the aisle (the night bus). */
export const Bus: React.FC<{ t: ShotTime; mood: MoodName; you?: Face; kid?: Face | null; cam?: "wide" | "seats" | "aisle" }> = ({
  t, mood, you = "neutral", kid = null, cam = "seats",
}) => (
  <Place t={t} set={bus} mood={mood} cam={cam} options={{ speed: 7, hangers: mood === "night" ? 0 : 2 }}
    cast={[
      on("window", YOU, you, { phone: true, pose: { ...SEATED, armF: [40, 70] } }),
      ...(kid ? [on("seatLeft", KID, kid, { phone: true })] : []),
    ]} />
);

/** Your two aunts, each in her own kitchen, side by side. */
export const Aunts: React.FC<{ t: ShotTime; one?: Face; two?: Face }> = ({ t, one = "happy", two = "happy" }) => (
  <AbsoluteFill style={{ display: "flex", flexDirection: "row" }}>
    {[{ who: AUNT1, face: one }, { who: AUNT2, face: two }].map(({ who, face }, i) => (
      <div key={i} style={{ position: "relative", width: 960, height: 1080, overflow: "hidden", borderRight: i === 0 ? `8px solid ${INK}` : undefined }}>
        <div style={{ position: "absolute", left: -480, top: 0, width: 1920, height: 1080 }}>
          <Place t={t} set={kitchen} mood="morning" cam={{ x: 600, y: 600, zoom: 1.7 }} options={{ stove: "kettle" }}
            cast={[on("cook", who, face, { phone: true, pose: { ...STAND, armF: [45, 75] } })]} />
        </div>
      </div>
    ))}
  </AbsoluteFill>
);

/** The office: you at your desk; your boss at his glass door. */
export const Office: React.FC<{ t: ShotTime; you?: Face; boss?: Face | null; cam?: "wide" | "desk" | "screen"; screen?: "mail" | "chart" | "off" }> = ({
  t, you = "neutral", boss = null, cam = "desk", screen = "mail",
}) => (
  <Place t={t} set={officeDesk} mood="day" cam={cam} options={{ screen, colleagues: true }}
    cast={[on("desk", YOU, you, { phone: true }), ...(boss ? [on("cabin", BOSS, boss)] : [])]} />
);

/** Your bedroom under one lamp: you at the desk with the phone. */
export const Bedroom: React.FC<{ t: ShotTime; you?: Face; cam?: "wide" | "bed" | "desk" }> = ({ t, you = "neutral", cam = "bed" }) => (
  <Place t={t} set={bedroom} mood="lamp" cam={cam} options={{ lamp: true, phoneLit: false, curtains: 1 }}
    cast={[on("bedEdge", YOU, you, { phone: true, pose: { ...SEATED, armF: [40, 70] } })]} />
);

/** The bus stop at dusk: you on the kerb with the phone. */
export const BusStop: React.FC<{ t: ShotTime; you?: Face }> = ({ t, you = "neutral" }) => (
  <Place t={t} set={street} mood="dusk" cam="pavement" options={{ bus: null, crowd: true, auto: false }}
    cast={[on("near", YOU, you, { phone: true, pose: { ...STAND, armF: [40, 70] } })]} />
);

/** The call centre's break room at two in the morning: your best friend asleep, the coworker in the doorway, you. */
export const BreakRoom: React.FC<{ t: ShotTime; you?: Face | null; friend?: "asleep" | Face; coworker?: Face | null; youSpot?: "behind" | "beside"; cam?: "wide" | "desk" }> = ({
  t, you = "neutral", friend = "asleep", coworker = "neutral", youSpot = "behind", cam = "desk",
}) => {
  const sleeping = friend === "asleep";
  return (
    <Place t={t} set={officeDesk} mood="lamp" cam={cam} options={{ screen: "off", colleagues: false, notes: 0 }}
      cast={[
        { ...on("desk", BEST, sleeping ? "neutral" : (friend as Face), { phone: true }), face: sleeping ? { brows: "none", lids: 1, mouth: "flat", eyes: 1 } : undefined,
          pose: sleeping ? { ...SEATED, tilt: 16, lean: 6, armF: [30, 60] } : undefined },
        ...(coworker ? [on("cabin", COWORKER, coworker)] : []),
        ...(you ? [on(youSpot, YOU, you)] : []),
      ]} />
  );
};

/** The corner cafe: you and your best friend at the table, the stranger behind a newspaper at the corner. */
export const Cafe: React.FC<{ t: ShotTime; you?: Face; friend?: Face; cam?: "wide" | "table"; arrive?: boolean }> = ({
  t, you = "neutral", friend = "neutral", cam = "table", arrive,
}) => (
  <Place t={t} set={canteen} mood="morning" cam={cam} options={{ tv: "off", food: false }}
    cast={[
      on("benchMid", BEST, friend),
      on("benchRight", STRANGER, "neutral", { who: { ...STRANGER } }),
      arrive ? on("standing", YOU, you) : on("benchLeft", YOU, you),
    ]}
    overlay={<CoffeeCups />} />
);

const CoffeeCups: React.FC = () => (
  <g>
    {[860, 1000].map((x) => (
      <g key={x} transform={`translate(${x} 700)`}>
        <path d="M-26 0 L-20 40 L20 40 L26 0Z" fill={PAPER} stroke={INK} strokeWidth={5} />
        <path d="M26 10 Q44 14 26 30" fill="none" stroke={INK} strokeWidth={5} />
      </g>
    ))}
  </g>
);

/** The man from the dating app at his desk, typing with his thumbs for the first time. */
export const Man: React.FC<{ t: ShotTime; face?: Face }> = ({ t, face = "worried" }) => (
  <Place t={t} set={officeDesk} mood="dusk" cam="desk" options={{ screen: "off", colleagues: false }}
    cast={[on("desk", MAN, face, { phone: true, pose: { ...SEATED, armF: [40, 80], armB: [30, 70] } })]} />
);

/** Your cousin waving from a window abroad (her video). */
export const Cousin: React.FC<{ t: ShotTime }> = ({ t }) => (
  <Place t={t} set={bedroom} mood="day" cam="desk" options={{ lamp: false, curtains: 0 }}
    cast={[on("standing", COUSIN, "happy", { pose: { ...STAND, armB: [-150, -30] } })]} />
);

/** The roof at night over a city of lit windows, each a chat; dotted ones carry a crimson point and go out at `out`. */
export const Roof: React.FC<{ t: ShotTime; out?: [number, number]; you?: Face; close?: boolean }> = ({ t, out, you = "neutral", close }) => {
  const k = out ? ramp(t.f, out[0], out[1]) : 0;
  return (
    <Place t={t} set={rooftop} mood="night" cam={close ? { x: 960, y: 420, zoom: 1.6 } : "sky"} options={{ lights: false, washing: false, kites: false }}
      cast={close ? [] : [on("parapet", YOU, you)]}
      overlay={<CityWindows k={k} f={t.f} />} push={close ? [1, 1.12] : [1, 1.04]} />
  );
};

/** A band of lit windows across the skyline; about four in five carry a dot and go dark, block by block, as k runs. */
const CityWindows: React.FC<{ k: number; f: number }> = ({ k, f }) => {
  const cells: React.ReactNode[] = [];
  let n = 0;
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 44; col++) {
      n++;
      const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
      const r = v - Math.floor(v);
      if (r < 0.35) continue;
      const x = 40 + col * 42 + (row % 2) * 12, y = 250 + row * 38;
      const dotted = r > 0.45;
      const block = Math.floor(col / 6) / 8;
      const gone = dotted ? ramp(k, block, block + 0.18) : 0;
      cells.push(
        <g key={n} opacity={1 - gone * 0.94}>
          <rect x={x} y={y} width={22} height={24} rx={3} fill={dotted ? "#ffd98a" : "#fff1c6"} opacity={0.85} />
          {dotted && gone < 0.5 && <circle cx={x + 11} cy={y + 12} r={5} fill="#D8344F" />}
          {!dotted && k > 0.9 && <rect x={x + 6} y={y + 6} width={10} height={14} rx={2} fill={INK} opacity={0.5 + 0.3 * Math.sin(f / 9 + n)} />}
        </g>,
      );
    }
  }
  return <g>{cells}</g>;
};

/** Your mother's shoebox: twenty-four years of cards laid down the table, each with three words in pen. */
export const Shoebox: React.FC<{ t: ShotTime; mother?: Face }> = ({ t, mother = "happy" }) => {
  const n = Math.floor(ramp(t.f, 4, Math.min(t.dur, 120)) * 9);
  return (
    <Place t={t} set={kitchen} mood="lamp" cam="twoShot" options={{ stove: "kettle", steam: 0 }}
      cast={[on("cook", MOTHER, mother, { pose: { ...STAND, armF: [70, 30] } }), on("counter", YOU, "neutral")]}
      overlay={
        <g>
          {Array.from({ length: n }, (_, i) => (
            <g key={i} transform={`translate(${320 + i * 150} ${880 + (i % 2) * 24}) rotate(${(i % 3) * 4 - 4})`}>
              <rect x={-60} y={-80} width={120} height={160} rx={6} fill={["#f2e2b8", "#e8d0d6", "#d6e6d2"][i % 3]} stroke={INK} strokeWidth={4} />
              <path d="M-40 -50 Q0 -70 40 -50 M-36 -34 Q0 -50 36 -34" stroke="#c9a23a" strokeWidth={5} fill="none" />
              <path d="M-34 44 q10 -10 20 0 t20 0 t20 0" stroke={INK} strokeWidth={4} fill="none" />
            </g>
          ))}
        </g>
      } />
  );
};

/** A paper drawing: the rule (send button, no hands, thumbs). */
export const RuleSheet: React.FC<{ t: ShotTime }> = ({ t }) => (
  <AbsoluteFill style={{ background: "#2a2730" }}>
    <svg width={1920} height={1080}>
      <Paper f={t.f}>
        {[
          { y: 140, label: "pressed send", hand: "press", dot: true },
          { y: 360, label: "no hand at all", hand: "none", dot: true },
          { y: 580, label: "typed every letter", hand: "type", dot: false },
        ].map((r, i) => (
          <g key={i} opacity={ramp(t.f, 14 + i * 40, 24 + i * 40)}>
            <rect x={110} y={r.y} width={520} height={120} rx={36} fill={[PINK, MINT, GREY][i]} stroke={INK} strokeWidth={6} />
            {[0, 1].map((k) => <rect key={k} x={140} y={r.y + 34 + k * 36} width={k ? 260 : 440} height={16} rx={8} fill={INK} opacity={0.4} />)}
            {r.dot && <Dot x={680} y={r.y + 92} r={22} f={t.f} at={30 + i * 40} />}
            <text x={780} y={r.y + 78} fontFamily={FONT} fontWeight={800} fontSize={54} fill={INK}>{r.label}</text>
          </g>
        ))}
      </Paper>
    </svg>
  </AbsoluteFill>
);

/** A paper map: one country, threads out to ships and cities on three continents. */
export const MapSheet: React.FC<{ t: ShotTime }> = ({ t }) => {
  const ends = [[260, 180], [1080, 140], [1180, 520], [180, 560], [700, 640], [1040, 330]];
  return (
    <AbsoluteFill style={{ background: "#2a2730" }}>
      <svg width={1920} height={1080}>
        <Paper f={t.f}>
          <path d="M640 300 l30 -40 l24 30 l-10 50 l30 40 l-20 60 l-40 -20 l-14 -50 l-30 -20z" fill="#e8b84a" stroke={INK} strokeWidth={6} />
          {ends.map(([x, y], i) => {
            const k = ease(ramp(t.f, 16 + i * 8, 46 + i * 8));
            return (
              <g key={i}>
                <path d={`M670 360 Q${(670 + x) / 2} ${Math.min(y, 360) - 120} ${mix(670, x, k)} ${mix(360, y, k)}`} fill="none" stroke="#D8344F" strokeWidth={5} strokeDasharray="14 10" />
                {k > 0.95 && <circle cx={x} cy={y} r={14} fill={["#a8c99a", "#9fd3e6", "#d6b8ec"][i % 3]} stroke={INK} strokeWidth={4} />}
              </g>
            );
          })}
        </Paper>
      </svg>
    </AbsoluteFill>
  );
};

/** A paper split: told AI wrote it, a frown; told nothing, a smile; the same message in between (c20). */
export const StudySheet: React.FC<{ t: ShotTime }> = ({ t }) => (
  <AbsoluteFill style={{ background: "#2a2730" }}>
    <svg width={1920} height={1080}>
      <Paper f={t.f}>
        <rect x={470} y={250} width={360} height={150} rx={40} fill={PINK} stroke={INK} strokeWidth={6} />
        {[0, 1, 2].map((k) => <rect key={k} x={500} y={280 + k * 34} width={k === 2 ? 180 : 300} height={14} rx={7} fill={INK} opacity={0.4} />)}
        {[{ x: 220, mouth: "M-40 40 Q0 10 40 40", label: "told: AI" }, { x: 1080, mouth: "M-40 20 Q0 54 40 20", label: "told nothing" }].map((s, i) => (
          <g key={i} transform={`translate(${s.x} 360)`} opacity={ramp(t.f, 18 + i * 30, 30 + i * 30)}>
            <circle r={110} fill={i ? "#9fd3e6" : "#f6c09a"} stroke={INK} strokeWidth={6} />
            <circle cx={-36} cy={-20} r={12} fill={INK} /><circle cx={36} cy={-20} r={12} fill={INK} />
            <path d={s.mouth} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
            <text x={0} y={190} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={48} fill={INK}>{s.label}</text>
          </g>
        ))}
      </Paper>
    </svg>
  </AbsoluteFill>
);

/** A paper ring of five heads around a clock: what limits a friendship is time (c19). */
export const ClockSheet: React.FC<{ t: ShotTime }> = ({ t }) => (
  <AbsoluteFill style={{ background: "#141826" }}>
    <svg width={1920} height={1080}>
      <Paper f={t.f} w={1000} h={760}>
        <g transform="translate(500 380)">
          <circle r={170} fill="#fff8e6" stroke={INK} strokeWidth={8} />
          <line x1={0} y1={0} x2={0} y2={-120} stroke={INK} strokeWidth={10} strokeLinecap="round" transform={`rotate(${t.f * 3})`} />
          <line x1={0} y1={0} x2={80} y2={0} stroke={INK} strokeWidth={12} strokeLinecap="round" transform={`rotate(${t.f * 0.25})`} />
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
            return <circle key={i} cx={Math.cos(a) * 280} cy={Math.sin(a) * 280} r={52} fill={[PINK, MINT, PEACH, LAV, "#F2B632"][i]} stroke={INK} strokeWidth={6}
              opacity={ramp(t.f, 10 + i * 8, 20 + i * 8)} />;
          })}
        </g>
      </Paper>
    </svg>
  </AbsoluteFill>
);

/** Two phones side by side on the cafe table: the midnight conversation, every line on both sides dotted. */
export const TwoPhones: React.FC<{ t: ShotTime; texts?: [string, string] }> = ({ t, texts }) => {
  const col = (mine: boolean): Msg[] => texts ? [{ from: mine ? BLUE : PINK, text: texts[mine ? 1 : 0], dot: false }] :
    Array.from({ length: 6 }, (_, i) => ({ from: i % 2 ? PINK : BLUE, lines: 1 + (i % 3), dot: true, mine: i % 2 === (mine ? 0 : 1) }));
  return (
    <Place t={t} set={canteen} mood="morning" dim={0.62} options={{ tv: "off" }}
      overlay={<>
        <ChatPhone f={t.f} msgs={col(false)} x={620} y={560} s={0.86} rot={-5} contact="#f4b8c8" dotsAt={8} dotEvery={5} />
        <ChatPhone f={t.f} msgs={col(true)} x={1300} y={560} s={0.86} rot={4} contact="#F2B632" dotsAt={11} dotEvery={5} />
      </>} />
  );
};

export { PINK, MINT, PEACH, LAV, GREY, BLUE };
