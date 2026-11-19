// The Weapon on your phone (outside review of v6, sheets 22-23: one large readable row, a REMOVED bin, padlocks, a
// counter in sync with the spoken numbers, the renamed contact large). A big phone in the middle of the frame, a red
// REMOVED bin at its left; everything drawn at screen scale (an insert at zoom 1), text inside the UI-safe area.
//   56  "out of the group chat": the chat's list, MIN-JUN -84% at the top; "Him first.": your thumb swipes his row into
//       the bin (1). "No past papers. No notes.": two folders, PAST PAPERS and NOTES, padlocks clap shut, ACCESS
//       REMOVED. "Week one, three red.": WEEK 1, two more rows fly in, the counter lands on 3 on "three". "Week two,
//       nine.": WEEK 2, six more, the counter lands on 9 on "nine".
//   57  "The group chat has a name for you now.": your contact, large: your face, WEATHERMAN typed out, a cloud.
//   73  (A Thousand Cards) "And your list was right.": the REMOVED list again; the calculator girl's row (-30) and the
//       boy's (-44) tick red.
import { interpolate, spring } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import type { MoodName } from "@whatif/kit/stage/moods";
import { drift, insert } from "@whatif/kit/stage/shots";
import { CRIMSON, INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { camAt, current, HERO, MINJUN, mix, noise, PASTELS, ramp } from "../shared";
import { FlatShot, HeadIcon, WoodTop } from "./WhosCrimson.Common";
import { Cloud } from "./FourSeats.Class";
import type { SeatsTimes } from "./FourSeats.Times";

const pop = (frame: number, at: number) => (frame < at ? 0 : spring({ frame: frame - at, fps: 30, config: { damping: 9, stiffness: 220, mass: 0.6 } }));
const SCREEN = { x: 760, y: 150, w: 520, h: 960 } as const;
const BIN = { x: 150, y: 470, w: 460, h: 400 } as const;
const BIN_MOUTH = { x: BIN.x + BIN.w / 2, y: BIN.y + 250 };

/** The removed, in order: your best friend, the boy you walked home with, the girl with your calculator, then six. */
export const REMOVED = [
  { head: MINJUN.head, value: -84, name: "MIN-JUN" },
  { head: "#8fa3b8", value: -44 },
  { head: "#c9a0d6", value: -30 },
  { head: PASTELS[0], value: -45 }, { head: PASTELS[3], value: -60 }, { head: PASTELS[5], value: -38 },
  { head: PASTELS[7], value: -25 }, { head: PASTELS[4], value: -50 }, { head: PASTELS[1], value: -72 },
] as const;

/** Two who never go red: they stay in the chat. */
const STAY = [{ head: PASTELS[6], value: undefined }, { head: PASTELS[2], value: undefined }] as const;

/** The phone: dark body, a light screen. Children are drawn in screen-relative coordinates (0, 0 = screen top left). */
const Phone: React.FC<{ children?: React.ReactNode; title?: string }> = ({ children, title }) => (
  <g>
    <rect x={SCREEN.x - 28} y={SCREEN.y - 70} width={SCREEN.w + 56} height={SCREEN.h + 200} rx={64} fill="#1f2128" stroke={INK} strokeWidth={6} />
    <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx={26} fill="#eef1f4" />
    <rect x={SCREEN.x + SCREEN.w / 2 - 50} y={SCREEN.y - 40} width={100} height={14} rx={7} fill="#3b3e47" />
    {title && (
      <g>
        <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={96} rx={26} fill="#d9dee6" />
        <text x={SCREEN.x + SCREEN.w / 2} y={SCREEN.y + 64} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill={INK}>{title}</text>
      </g>
    )}
    <g transform={`translate(${SCREEN.x} ${SCREEN.y})`}>{children}</g>
  </g>
);

/** One row of a list: avatar, a name (or an ink bar), and a red pill with the reading. Screen-relative. */
const Row: React.FC<{ head: string; name?: string; value?: number; y: number; pill?: number; seed: number }> = ({ head, name, value, y, pill = 1, seed }) => (
  <g transform={`translate(0 ${y})`}>
    <HeadIcon x={56} y={46} r={34} color={head} />
    {name
      ? <text x={108} y={64} fontFamily={FONT} fontWeight={800} fontSize={50} fill={INK}>{name}</text>
      : <rect x={108} y={36} width={130 + noise(seed + 4) * 80} height={20} rx={10} fill={INK} opacity={0.5} />}
    {value !== undefined && pill > 0 && (
      <g transform={`translate(${SCREEN.w - 84} 46) scale(${pill})`}>
        <rect x={-66} y={-28} width={132} height={56} rx={12} fill={CRIMSON} stroke={INK} strokeWidth={4} />
        <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill={PAPER}>{value}%</text>
      </g>
    )}
  </g>
);

/** The red bin at the phone's left: REMOVED, a WEEK label over it, and the count. */
const Bin: React.FC<{ frame: number; count: number; bumpAt: number; week?: string }> = ({ frame, count, bumpAt, week }) => {
  const bump = 1 + 0.18 * Math.max(0, 1 - (frame - bumpAt) / 8) * (frame >= bumpAt ? 1 : 0);
  return (
    <g>
      {week && <text x={BIN.x + BIN.w / 2} y={BIN.y - 40} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={84} fill={INK}>{week}</text>}
      <rect x={BIN.x + 10} y={BIN.y + 14} width={BIN.w} height={BIN.h} rx={30} fill="#000" opacity={0.25} />
      <rect x={BIN.x} y={BIN.y} width={BIN.w} height={BIN.h} rx={30} fill={CRIMSON} stroke={INK} strokeWidth={7} />
      <text x={BIN.x + BIN.w / 2} y={BIN.y + 82} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={66} fill={PAPER}>REMOVED</text>
      <g transform={`translate(${BIN.x + BIN.w / 2} ${BIN.y + 300}) scale(${bump})`}>
        <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={200} fill={PAPER} stroke={INK} strokeWidth={6} paintOrder="stroke">{count}</text>
      </g>
    </g>
  );
};

/** A row flying from its place in the list into the bin, from `at` (10 frames). Screen coordinates. */
function flight(frame: number, at: number, y: number) {
  const t = ramp(frame, at, at + 10);
  return { t, x: mix(SCREEN.x, BIN_MOUTH.x - 150, t), y: mix(SCREEN.y + y, BIN_MOUTH.y - 46, t), s: mix(1, 0.4, t), gone: t >= 1 };
}

/** The list with rows leaving for the bin at `outs[i]` (undefined: stays). Rows below close the gap. */
const List: React.FC<{ frame: number; outs: (number | undefined)[]; pills: number[] }> = ({ frame, outs, pills }) => {
  let shift = 0;
  const rows: React.ReactNode[] = [];
  [...REMOVED, ...STAY].forEach((m, i) => {
    const at = outs[i];
    const y = 116 + i * 80 - shift * 80;
    if (at !== undefined) shift += ramp(frame, at + 8, at + 16);
    const f = at === undefined ? null : flight(frame, at, y);
    if (f?.gone) return;
    const row = <Row head={m.head} name={"name" in m ? m.name : undefined} value={m.value} y={0} pill={pills[i] ?? 0} seed={i} />;
    rows.push(f && f.t > 0
      ? <g key={i} transform={`translate(${f.x} ${f.y}) scale(${f.s})`} opacity={1 - f.t * 0.3}>{row}</g>
      : <g key={i} transform={`translate(${SCREEN.x} ${SCREEN.y + y})`}>{row}</g>);
  });
  return <g>{rows}</g>;
};

/** A padlock that drops and snaps shut at `at`. */
const Padlock: React.FC<{ frame: number; at: number; x: number; y: number }> = ({ frame, at, x, y }) => {
  if (frame < at - 6) return null;
  const drop = ramp(frame, at - 6, at);
  const shut = ramp(frame, at, at + 5);
  return (
    <g transform={`translate(${x} ${mix(y - 160, y, drop)}) scale(1.35)`}>
      <path d={`M-34 0 V${-40 + 14 * shut} A34 34 0 0 1 34 ${-40 + 14 * shut} V${-14 * (1 - shut)}`} fill="none" stroke="#6f7a82" strokeWidth={16} transform={`translate(0 ${-18 * (1 - shut)})`} />
      <rect x={-56} y={-6} width={112} height={92} rx={14} fill={MUSTARD} stroke={INK} strokeWidth={6} />
      <circle cx={0} cy={34} r={11} fill={INK} />
    </g>
  );
};

const Folder: React.FC<{ y: number; label: string; locked: number; frame: number }> = ({ y, label, locked, frame }) => (
  <g transform={`translate(0 ${y})`}>
    <path d="M60 0 H180 L210 30 H460 V250 H60Z" fill="#d9b26a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={50} y={50} width={420} height={200} rx={10} fill="#e8c27a" stroke={INK} strokeWidth={6} />
    <text x={260} y={175} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={48} fill={INK}>{label}</text>
    <Padlock frame={frame} at={locked} x={410} y={200} />
  </g>
);

/** A thumb from the bottom right, its tip at (x, y). */
const Thumb: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M0 0 C-20 60 -60 160 -150 260 L-40 330 C10 230 40 90 30 10 Q16 -26 0 0Z" fill={MUSTARD} stroke={INK} strokeWidth={6} strokeLinejoin="round" transform="scale(1.3)" />
  </g>
);

type PhoneView = "chat" | "folder" | "weeks";

/** Line 56: the chat, the folders, the weeks (see the file's head). */
export const PhoneShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const view = current<PhoneView>(frame, [[0, "chat"], [k.folder, "folder"], [k.weekOne, "weeks"]]);
  const cam = drift(view === "folder"
    ? camAt(frame, [[k.folder, insert(1010, 600, 1.05)], [k.weekOne, insert(1010, 590, 1.12)]])
    : camAt(frame, [[k.chat, insert(860, 600, 0.98)], [k.himFirst, insert(800, 600, 1.0)], [k.notice, insert(780, 590, 1.04)]]), frame, "phone", 2);
  // week one: the boy and the girl, landing 3 on "three"; week two: six more, landing 9 on "nine"
  const wk1 = [k.three - 20, k.three - 10];
  const wk2 = Array.from({ length: 6 }, (_, i) => Math.round(mix(k.weekTwo + 2, k.nine - 10, i / 5)));
  const outs = view === "chat" ? [k.himFirst] : [k.chat, ...wk1, ...wk2];
  const pills = REMOVED.map((_, i) => (i < 3 ? 1 : Math.min(1, pop(frame, k.weekTwo - 4 + i * 2))));
  const lands = [k.himFirst + 10, ...wk1.map((a) => a + 10), ...wk2.map((a) => a + 10)];
  const count = view === "chat" ? (frame >= lands[0] ? 1 : 0) : 1 + lands.slice(1).filter((a) => frame >= a).length;
  const bumpAt = [...lands].reverse().find((a) => frame >= a) ?? 0;
  const swipe = ramp(frame, k.himFirst - 8, k.himFirst + 2);
  return (
    <FlatShot cam={cam} mood={mood} back={<WoodTop seed={5} />} actors={
      view === "folder" ? (
        <Phone title="SHARED">
          <Folder y={160} label="PAST PAPERS" locked={k.folder + 8} frame={frame} />
          <Folder y={580} label="NOTES" locked={k.notes} frame={frame} />
          {frame >= k.folder + 14 && (
            <g transform={`translate(${SCREEN.w / 2} 495) rotate(-10) scale(${mix(1.6, 1, Math.min(1, pop(frame, k.folder + 14)))})`}>
              <rect x={-240} y={-50} width={480} height={100} rx={12} fill={PAPER} stroke={CRIMSON} strokeWidth={10} />
              <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill={CRIMSON}>ACCESS REMOVED</text>
            </g>
          )}
        </Phone>
      ) : (
        <g>
          <Bin frame={frame} count={count} bumpAt={bumpAt} week={view === "weeks" ? (frame >= k.weekTwo ? "WEEK 2" : "WEEK 1") : undefined} />
          <Phone title="GROUP CHAT" />
          <List frame={frame} outs={outs} pills={pills} />
          {view === "chat" && frame < k.himFirst + 14 && <Thumb x={mix(SCREEN.x + 470, SCREEN.x + 120, swipe)} y={SCREEN.y + 160} />}
        </g>
      )
    } />
  );
};

/** Line 57: "The group chat has a name for you now.": your contact, large: your face, WEATHERMAN typed out, a cloud. */
export const NicknameShot: React.FC<{ frame: number; k: SeatsTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const word = "WEATHERMAN";
  const typed = Math.round(interpolate(frame, [k.nickname + 8, k.nickname + 26], [0, word.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const cam = drift(camAt(frame, [[k.nickname, insert(1020, 560, 1.0)], [k.tae, insert(1020, 520, 1.12)]]), frame, "nick", 2);
  const cx = SCREEN.w / 2;
  return (
    <FlatShot cam={cam} mood={mood} back={<WoodTop seed={7} />} actors={
      <Phone title="CONTACT">
        <HeadIcon x={cx} y={290} r={110} color={HERO.head} tuft mouth="flat" />
        {/* your old name, struck through, then the new one */}
        <rect x={cx - 150} y={452} width={300} height={26} rx={13} fill={INK} opacity={0.35} />
        <line x1={cx - 170} y1={465} x2={cx + 170} y2={465} stroke={CRIMSON} strokeWidth={10} opacity={typed > 0 ? 1 : 0} strokeLinecap="round" />
        <text x={cx} y={600} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={62} fill={INK}>{word.slice(0, typed)}</text>
        <Cloud frame={frame} at={k.nickname + 28} x={cx} y={760} scale={1.6} />
      </Phone>
    } />
  );
};

/** Line 73: "And your list was right.": the REMOVED list; the girl's row (-30) and the boy's (-44) tick red, one each. */
export const ListShot: React.FC<{ frame: number; from: number; tickA: number; tickB: number; to: number; mood: MoodName }> = ({ frame, from, tickA, tickB, to, mood }) => {
  const cam = drift(camAt(frame, [[from, insert(1020, 560, 1.0)], [to, insert(1020, 520, 1.1)]]), frame, "list", 2);
  const tick = (at: number, y: number) => frame >= at && (
    <path d={`M${SCREEN.w - 40} ${y + 40} l22 26 l44 -60`} fill="none" stroke={CRIMSON} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray={140} strokeDashoffset={140 * (1 - ramp(frame, at, at + 6))} transform={`translate(${SCREEN.x - 10} ${SCREEN.y})`} />
  );
  return (
    <FlatShot cam={cam} mood={mood} back={<WoodTop seed={5} />} actors={
      <g>
        <Phone title="REMOVED" />
        {REMOVED.map((m, i) => (
          <g key={i} transform={`translate(${SCREEN.x - 40} ${SCREEN.y + 120 + i * 92})`} opacity={i === 1 || i === 2 ? 1 : 0.45}>
            <Row head={m.head} name={"name" in m ? m.name : undefined} value={m.value} y={0} seed={i} />
          </g>
        ))}
        {tick(tickA, 120 + 2 * 92)}
        {tick(tickB, 120 + 92)}
      </g>
    } />
  );
};
