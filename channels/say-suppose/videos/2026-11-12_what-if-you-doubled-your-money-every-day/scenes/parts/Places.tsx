// The film's other places, from the set library (studio-whatif-edit: reuse a library set before drawing one): the
// tram (metroCoach), the street (party, the morning after, spending, envelopes), the bank lobby (bankAtm), the city
// with the wheat (citySkyline), your flat at night (bedroom). Figures on the sets' own spots; extras drawn on top.
import { SetScene } from "@whatif/kit/sets/SetScene";
import { bankAtm, bedroom, citySkyline, metroCoach, street } from "@whatif/kit/sets";
import { BOSS, FRIEND, HERO, PASTELS } from "@whatif/kit/sets/cast";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, STAND, walkPose } from "@whatif/kit/rig/pose";
import type { MoodName } from "@whatif/kit/stage/moods";
import { FONT } from "@whatif/kit/fonts";
import { CRIMSON, INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { LOTTE } from "./Bakery";
import { useTalk } from "./cast";
import { ease, mix, Phone, Push, ramp, type ShotTime } from "./util";

export const Tram: React.FC<{ t: ShotTime; mood: MoodName }> = ({ t, mood }) => (
  <Push t={t}>
    <SetScene set={metroCoach} mood={mood} frame={t.f} cam={metroCoach.cameras.windowSeat}
      options={{ speed: 8, ads: null }}
      cast={[{ spot: "window", who: { ...HERO, look: { x: -0.2, y: 0.6 } }, face: EXPRESSIONS.neutral }]} />
  </Push>
);

/** The long table down the middle of the street, lanterns over it, the whole street eating. */
const Table: React.FC<{ bare: boolean; f: number }> = ({ bare, f }) => (
  <g>
    <path d="M120 600 Q 960 700 1800 600" fill="none" stroke={INK} strokeWidth={4} />
    {Array.from({ length: 7 }, (_, i) => {
      const x = 260 + i * 230;
      const y = 600 + 50 * (1 - Math.pow((x - 960) / 840, 2));
      return <circle key={i} cx={x} cy={y + 22} r={20} fill={bare ? "#6a6458" : "#ffcf6a"} stroke={INK} strokeWidth={4} />;
    })}
    {!bare && Array.from({ length: 6 }, (_, i) => (
      <Figure key={i} x={420 + i * 230} y={1010} scale={0.95} pose={{ ...STAND, armF: [70 + Math.sin(f / 9 + i) * 10, 40], armB: [-20, 20] }}
        head={PASTELS[i % PASTELS.length]} coat="#5a5f6a" {...EXPRESSIONS.happy} time={f / 30 + i} />
    ))}
    <rect x={260} y={880} width={1500} height={36} rx={6} fill="#efe9dc" stroke={INK} strokeWidth={6} />
    {!bare && Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx={360 + i * 180} cy={870} rx={34} ry={18} fill="#d89a58" stroke={INK} strokeWidth={4} />)}
    {[300, 1720].map((x) => <rect key={x} x={x} y={916} width={14} height={120} fill={INK} />)}
  </g>
);

type Face = keyof typeof EXPRESSIONS;
const PARTY_CROP = { lotte: [1.7, 960, 720], jonas: [1.35, 1500, 760], you: [1.35, 400, 760] } as const;

/** The street. At the party Lotte stands behind the wall of cakes and Jonas comes down in pyjamas; `focus` crops in. */
export const Street: React.FC<{ t: ShotTime; mood: MoodName; mode: "party" | "after" | "spend" | "give"; focus?: keyof typeof PARTY_CROP | null;
  jonasFace?: Face; lotteFace?: Face; youFace?: Face }> = ({ t, mood, mode, focus = null, jonasFace = "shocked", lotteFace = "neutral", youFace }) => {
  const walk = mode === "spend" || mode === "give";
  const talk = useTalk();
  const x = walk ? mix(300, 1400, ease(t.p)) : 230;
  const you = (
    <Figure x={x} y={1010} scale={1.35} pose={walk ? walkPose(t.f / 8) : { ...STAND, armF: [60, 40], armB: [-20, 20] }}
      {...HERO} {...EXPRESSIONS[youFace ?? (mode === "after" ? "worried" : mode === "give" ? "determined" : "happy")]} time={t.f / 30}
      held={mode === "spend" ? <g>{[0, 1, 2].map((i) => <rect key={i} x={-14 + i * 10} y={-6} width={26} height={30} rx={3} fill={PASTELS[i]} stroke={INK} strokeWidth={2.5} />)}</g>
        : mode === "give" ? <rect x={-16} y={-14} width={32} height={20} rx={2} fill="#f4efe2" stroke={INK} strokeWidth={2.5} /> : undefined} />
  );
  const party = mode === "party";
  const crop = focus && party ? PARTY_CROP[focus] : null;
  return (
    <Push t={t} from={crop ? crop[0] : 1} to={crop ? crop[0] * 1.04 : 1.05} ox={crop ? crop[1] : 960} oy={crop ? crop[2] : 540}>
      <SetScene set={street} mood={mood} frame={t.f} cam={street.cameras.wide} options={{ auto: false, bus: mode === "spend" ? mix(2200, -900, t.p) : null, crowd: mode !== "party" && mode !== "after" }}
        cast={[]}
        actors={<>
          {/* v5: the sixty-two cakes and the brass band the dialogue talks about (the outside review). */}
          {party && Array.from({ length: 21 }, (_, i) => {
            const row = i < 6 ? 0 : i < 11 ? 1 : i < 15 ? 2 : i < 18 ? 3 : i < 20 ? 4 : 5;
            const start = [0, 6, 11, 15, 18, 20][row];
            const n = [6, 5, 4, 3, 2, 1][row];
            const cx = 960 + (i - start - (n - 1) / 2) * 74;
            const cy = 690 - row * 52;
            return (
              <g key={`k${i}`} transform={`translate(${cx} ${cy})`}>
                <rect x={-32} y={-26} width={64} height={40} rx={6} fill="#f2a7c3" stroke={INK} strokeWidth={3} />
                <rect x={-32} y={-26} width={64} height={10} rx={4} fill={PAPER} />
                <rect x={-2} y={-42} width={4} height={16} fill={PASTELS[i % PASTELS.length]} />
                <circle cx={0} cy={-46} r={4} fill={MUSTARD} />
              </g>
            );
          })}
          {party && [380, 1380].map((bx, i) => (
            <Figure key={`b${i}`} x={bx} y={1010} scale={1.05} facing={i ? -1 : 1} pose={{ ...STAND, armF: [70 + Math.sin(t.f / 5 + i) * 10, 60], armB: [-40, 60] }}
              head={PASTELS[i + 2]} coat="#a8343f" cap="#f2b632" {...EXPRESSIONS.happy} time={t.f / 30 + i}
              held={<g><circle cx={0} cy={-10} r={34} fill="none" stroke={MUSTARD} strokeWidth={9} /><circle cx={22} cy={-36} r={16} fill={MUSTARD} stroke={INK} strokeWidth={3} /></g>} />
          ))}
          {party && <Figure x={960} y={1060} scale={1.3} facing={-1} pose={{ ...STAND, armF: [40, 30], armB: [-12, 14] }} {...LOTTE}
            {...EXPRESSIONS[lotteFace]} {...talk("Lotte")} time={t.f / 30} look={{ x: 0.6, y: 0.1 }} />}
          {party && [0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={860 + i * 50} cy={850 - (i % 2) * 26} rx={30} ry={22} fill={PASTELS[i]} stroke={INK} strokeWidth={4} />)}
          {(mode === "party" || mode === "after") && <Table bare={mode === "after"} f={t.f} />}
          {party && <Figure x={1600} y={1010} scale={1.35} facing={-1} pose={{ ...STAND, armF: [30, 40], armB: [-12, 14] }} head={FRIEND.head} coat="#a8c4e0"
            {...EXPRESSIONS[jonasFace]} {...talk("Jonas")} time={t.f / 30 + 1} look={{ x: 0.7, y: 0.1 }} />}
          {you}
        </>} />
    </Push>
  );
};

/** The bank lobby: Herr Brandt behind one desk, you in front of it; by the door the stranger reads a paper. `page`: the
 *  stranger turns a page. `night`: after hours, Herr Brandt alone under one lamp tears the NOT A MISTAKE form in half. */
export const Bank: React.FC<{ t: ShotTime; page?: boolean; night?: boolean }> = ({ t, page, night }) => {
  const turn = page ? ramp(t.p, 0.35, 0.55) : 0;
  const talk = useTalk();
  const rip = night ? ease(ramp(t.p, 0.3, 0.6)) : 0;
  return (
    <Push t={t} from={night ? 2 : 1} to={night ? 2.1 : 1.05} ox={night ? 1400 : 960} oy={night ? 720 : 540}>
      <SetScene set={bankAtm} mood={night ? "night" : "day"} frame={t.f} cam={bankAtm.cameras.wide} options={{ queue: 0, screen: "menu", cash: 0 }}
        cast={[]}
        actors={
          <>
            <rect x={1180} y={780} width={420} height={40} rx={6} fill="#c9c6c0" stroke={INK} strokeWidth={6} />
            <rect x={1200} y={820} width={380} height={190} fill="#8a8f98" stroke={INK} strokeWidth={6} />
            {night && <circle cx={1500} cy={560} r={260} fill="#ffd8a0" opacity={0.18} />}
            <Figure x={1400} y={1010} scale={1.25} facing={-1} pose={{ ...STAND, armF: night ? [60, 50] : [90, 60], armB: night ? [-60, -50] : [-20, 20] }} {...BOSS}
              {...EXPRESSIONS[night ? "sad" : page ? "neutral" : "sceptical"]} {...talk("Herr Brandt")} time={t.f / 30} look={{ x: night ? 0 : -0.9, y: 0.2 }}
              held={night ? undefined : <rect x={-3} y={-24} width={6} height={28} rx={2} fill={INK} />} />
            {night && [-1, 1].map((side) => (
              <g key={side} transform={`translate(${1395 + side * (6 + rip * 150)} 770) rotate(${side * rip * 14})`}>
                <rect x={side < 0 ? -46 : 0} y={-60} width={46} height={120} fill={PAPER} stroke={INK} strokeWidth={3} />
                <rect x={side < 0 ? -36 : 6} y={-48} width={30} height={7} fill={INK} opacity={0.6} />
              </g>
            ))}
            {!night && (
              <>
                <Figure x={900} y={1010} scale={1.3} pose={{ ...STAND, armF: [20, 10], armB: [-12, 14] }} {...HERO}
                  {...EXPRESSIONS.neutral} time={t.f / 30 + 2} look={{ x: 0.9, y: 0.1 }} />
                <g>
                  <Figure x={250} y={1010} scale={1.2} pose={{ ...STAND, armF: [80, 80], armB: [-80, -80] }} head={CRIMSON} coat="#2a2a30" time={0} look={{ x: 0, y: 0 }} />
                  <g transform={`translate(270 790) scale(${mix(1, -1, turn)} 1)`}>
                    <rect x={-80} y={-70} width={160} height={150} fill="#e8e2cf" stroke={INK} strokeWidth={5} />
                    {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={-60} y1={-40 + i * 25} x2={60} y2={-40 + i * 25} stroke={INK} strokeWidth={3} opacity={0.5} />)}
                  </g>
                </g>
              </>
            )}
          </>
        } />
    </Push>
  );
};

/** Close on the bank's form: NOT A MISTAKE. `sign`: your signature writes itself along the line. `stamp`: the red stamp
 *  comes down, hard, then a hand slides the form away into a drawer. */
export const FormClose: React.FC<{ t: ShotTime; mode: "sign" | "stamp" }> = ({ t, mode }) => {
  const ink = mode === "sign" ? ease(ramp(t.p, 0.25, 0.8)) : 1;
  const hit = mode === "stamp" ? ramp(t.f, 4, 10) : 0;
  const away = mode === "stamp" ? ease(ramp(t.p, 0.7, 1)) : 0;
  const squash = hit > 0 && hit < 1 ? 1.25 - hit * 0.25 : 1;
  return (
    <Push t={t} from={1} to={1.04}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <rect width={1920} height={1080} fill="#6a6f78" />
        <rect x={0} y={0} width={1920} height={1080} fill="#8a8f98" opacity={0.5} />
        <g transform={`translate(${960 + away * 900} 560) rotate(-3)`}>
          <rect x={-470} y={-420} width={940} height={840} fill={PAPER} stroke={INK} strokeWidth={8} />
          <text x={0} y={-270} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={110} fill={INK}>NOT A MISTAKE</text>
          {[0, 1, 2, 3].map((i) => <rect key={i} x={-380} y={-170 + i * 50} width={i === 3 ? 420 : 760} height={14} rx={7} fill={INK} opacity={0.18} />)}
          <text x={-380} y={190} fontFamily={FONT} fontWeight={700} fontSize={40} fill={INK} opacity={0.7}>Signed:</text>
          <line x1={-220} y1={200} x2={330} y2={200} stroke={INK} strokeWidth={4} />
          <path d="M-200 180 C -170 120, -150 220, -120 170 S -60 120, -40 180 S 20 140, 40 175 S 110 130, 130 178 S 200 150, 300 168"
            fill="none" stroke="#1a3a8a" strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ink} />
          {hit > 0 && (
            <g transform={`translate(240 300) rotate(-14) scale(${squash})`} opacity={0.9}>
              <circle r={110} fill="none" stroke="#c4283c" strokeWidth={14} />
              <circle r={86} fill="none" stroke="#c4283c" strokeWidth={5} />
              <text y={-8} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#c4283c">SIGNED</text>
              <text y={36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill="#c4283c">DAY 24</text>
            </g>
          )}
        </g>
      </svg>
    </Push>
  );
};

/** Day fifty-five: the wheat rises over the city; only you, the stranger's crimson head at a far window and the coin on
 *  your phone keep their colour. */
export const Wheat: React.FC<{ t: ShotTime; level: [number, number] }> = ({ t, level }) => {
  const h = mix(level[0], level[1], ease(t.p));
  return (
    <Push t={t} from={1} to={1.06}>
      <SetScene set={citySkyline} mood="night" frame={t.f} cam={citySkyline.cameras.wide} options={{ birds: false, traffic: true, shoreLamps: true }}
        cast={[{ spot: "wall", who: { ...HERO, look: { x: 0.3, y: -0.4 } }, face: EXPRESSIONS.shocked }]}
        actors={
          <>
            <circle cx={1380} cy={420} r={10} fill={CRIMSON} stroke={INK} strokeWidth={2} />
            <path d={`M0 1080 L0 ${1080 - h} C 500 ${1080 - h * 1.15}, 1300 ${1080 - h * 0.9}, 1920 ${1080 - h * 1.1} L1920 1080Z`}
              fill="#e3b45c" stroke={INK} strokeWidth={6} opacity={0.97} />
            <circle cx={900} cy={760} r={14} fill={MUSTARD} stroke={INK} strokeWidth={3} />
          </>
        } />
    </Push>
  );
};

/** Your flat above the bakery at eleven at night: one lamp, the phone on the desk; Lotte's lamp shows through the floor. */
export const Flat: React.FC<{ t: ShotTime; face?: keyof typeof EXPRESSIONS; ear?: boolean }> = ({ t, face = "worried", ear }) => (
  <Push t={t}>
    <SetScene set={bedroom} mood="lamp" frame={t.f} cam={bedroom.cameras.desk} options={{ lamp: true, hour: 23, phoneLit: true }}
      cast={[{ spot: "desk", who: { ...HERO, look: { x: 0.8, y: 0.4 } }, face: EXPRESSIONS[face],
        pose: ear ? { ...SEATED, armF: [150, 140] } : undefined }]} />
  </Push>
);

/** Jonas and the stock pieces the counter shots use from here: the flour man and the two pensioners at the window. */
export const Passers: React.FC<{ t: ShotTime }> = ({ t }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    {[0, 1].map((i) => (
      <Figure key={i} x={mix(-100, 700, ramp(t.p, 0.3, 0.9)) - i * 120} y={1000} scale={1.1} pose={walkPose(t.f / 9 + i)}
        head={i ? "#c9c6c0" : "#e8c9a0"} coat="#6d7f8f" {...EXPRESSIONS.sad} time={t.f / 30} />
    ))}
  </svg>
);

export { FRIEND, LOTTE, PAPER };
