// The foundation check: one still per frame, each a panel of the shared pieces the section builders use (the diner in
// its moods and cameras, the paint shop, the robot, the key shot, the props, the cast). Render frames with
// `npx remotion still` (see foundation/sheet.sh) and tile them into renders/foundation/sheet.jpg. Not part of the film.
import { AbsoluteFill, Composition, useCurrentFrame } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import { reach, SEATED, STAND } from "@whatif/kit/rig/pose";
import { Finish } from "@whatif/kit/stage/Stage";
import { FPS, HEIGHT, INK, PAPER, WIDTH } from "@whatif/kit/theme";
import { BANKER, BOSS, CAST, MARCO, MARCO_COAT, MAYOR, PLUMBER, REPORTER, RIVAL, STRANGER, WAITRESS, worker, YOU } from "../parts/Cast";
import { KeyShot } from "../parts/KeyShot";
import { DinerShot, on, PaintShopShot, steelOn } from "../parts/Places";
import { AppPhone, Banknote, CashFan, Card, Cheque, Hammer, Mic, Napkin, Pie, Till, WallClock, Wrench } from "../parts/Props";
import { COOK_POSE, Robot, SERVE_POSE, SPRAY_POSE } from "../parts/Robot";
import { Dressed } from "../parts/Wear";
import type { ShotTime } from "../parts/util";

const T = (f: number, p = 0.5): ShotTime => ({ f, dur: 120, p });

const Label: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: 28, top: 24, padding: "6px 18px", background: PAPER, color: INK, borderRadius: 8,
    fontFamily: FONT, fontSize: 34, fontWeight: 800, opacity: 0.92 }}>{text}</div>
);

const Sheet: React.FC<{ bg?: string; children: React.ReactNode }> = ({ bg = "#e9dfc9", children }) => (
  <AbsoluteFill style={{ background: bg }}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">{children}</svg>
  </AbsoluteFill>
);

const workers = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, k) => on(`stool${from + k}`, worker(k), k % 3 ? "happy" : "neutral"));

const PANELS: { label: string; node: React.ReactNode }[] = [
  { label: "diner · night · wide · 4 cooks, pile", node: (
    <DinerShot t={T(40)} mood="night" robots={4} plates="pile" cast={[on("till", YOU, "shocked", { behind: true, look: { x: 0.9, y: -0.2 } })]} />
  ) },
  { label: "diner · morning · wide · cold grill", node: (
    <DinerShot t={T(10)} mood="morning" grill="cold" clock={11.83}
      cast={[on("till", YOU, "worried", { behind: true }), on("pass", WAITRESS, "sceptical", { behind: true, phone: true, pose: { ...STAND, armF: [60, 70] } })]} />
  ) },
  { label: "diner · day · lunch, whistle, crowd", node: (
    <DinerShot t={T(60)} mood="day" robots={1} plates="some" crowd={1} gate={1} options={{ whistle: 1, till: 1 }}
      cast={[on("till", YOU, "happy", { behind: true }), on("pass", WAITRESS, "happy", { behind: true, pose: SERVE_POSE }), ...workers(1, 3), on("stool4", BOSS, "shocked"), ...workers(5, 9)]} />
  ) },
  { label: "diner · lamp · one lamp, Marco outside", node: (
    <DinerShot t={T(30)} mood="lamp" robots={4} grill="cold" options={{ flip: false, outside: { who: MARCO_COAT, face: { brows: "sad", lids: 0.4, mouth: "flat", eyes: 1, look: { x: -0.6, y: 0.2 } } } }}
      cast={[on("till", YOU, "worried", { behind: true, look: { x: 0.2, y: 0.6 } })]} />
  ) },
  { label: "diner · dusk · counter cam", node: (
    <DinerShot t={T(30)} mood="dusk" cam="counter" plates="some" options={{ phone: true }}
      cast={[on("till", YOU, "sceptical", { behind: true }), on("stool1", BANKER, "neutral"), on("stool2", MAYOR, "happy")]} />
  ) },
  { label: "diner · day · grill cam", node: (
    <DinerShot t={T(30)} mood="day" cam="grill" robots={3} cast={[on("grill", MARCO, "shocked", { behind: true, pose: { ...STAND, armF: [100, 30] } })]} />
  ) },
  { label: "diner · day · stools cam · steel customer", node: (
    <DinerShot t={T(30)} mood="day" cam="stools" plates="some" robots={2}
      cast={[on("stool3", worker(2), "happy"), on("stool4", BOSS, "happy"), on("stool6", BANKER, "sceptical")]}
      steel={[steelOn("stool5", { cap: "#d8344f", held: "strangeCard", pose: { ...SEATED, armF: [70, 30] } })]} />
  ) },
  { label: "diner · morning · window cam · gate open", node: (
    <DinerShot t={T(80)} mood="morning" cam="window" crowd={1} gate={1} options={{ whistle: 1 }} />
  ) },
  { label: "diner · day · door cam · chime", node: (
    <DinerShot t={T(30)} mood="day" cam="door" options={{ door: 0.85, chime: 6 }} cast={[on("door", MARCO_COAT, "afraid")]} />
  ) },
  { label: "paint shop · day · human painters", node: (
    <PaintShopShot t={T(40)} mood="day" painters="human"
      cast={[on("walk1", BOSS, "happy", { behind: true, phone: true, pose: { ...STAND, armF: [60, 70] } }), on("walk2", YOU, "sceptical", { behind: true })]} />
  ) },
  { label: "paint shop · night · robots · line cam", node: (
    <PaintShopShot t={T(40)} mood="night" cam="line" painters="robot" cast={[on("floorRight", MARCO_COAT, "sad", { facing: -1 })]} />
  ) },
  { label: "robot: cook, waiter, painter, seated, cap", node: (
    <Sheet>
      <rect x={0} y={860} width={1920} height={220} fill="#cdbf9f" />
      <Robot x={230} y={900} scale={1.2} pose={COOK_POSE} held="spatula" toolAngle={-18} flip={0.45} role="COOK" />
      <Robot x={560} y={900} scale={1.2} pose={SERVE_POSE} held="pie" role="WAITER" facing={-1} />
      <Robot x={880} y={900} scale={1.2} pose={SPRAY_POSE} held="paintGun" spray={1} frame={20} />
      <rect x={1240} y={760} width={150} height={20} rx={8} fill="#1d9a8f" stroke={INK} strokeWidth={5} />
      <rect x={1308} y={780} width={14} height={120} fill="#9fb0bd" />
      <Robot x={1315} y={760 + 112 * 1.2} scale={1.2} pose={{ ...SEATED, armF: reach(70, -10) }} held="card" cap="#d8344f" facing={-1} />
      <Robot x={1700} y={900} scale={1.2} pose={{ ...STAND, armF: [150, 20], armB: [-150, -20] }} held={<Wrench s={0.6} />} />
    </Sheet>
  ) },
  { label: "key shot · frame 0 (= thumbnail)", node: <KeyShot t={T(0, 0)} /> },
  { label: "key shot · frame 30 (flipping, landing)", node: <KeyShot t={T(30, 0.3)} /> },
  { label: "key shot · second staging: sync, phone", node: <KeyShot t={T(20, 0.5)} sync cash={false} face="sad" pose={{ ...STAND, armF: [20, 30], armB: [-20, 20] }} phone extra={2} /> },
  { label: "props", node: (
    <Sheet>
      <Napkin x={300} y={300} s={0.95} text="...and he ate here" />
      <AppPhone x={760} y={540} s={0.85} mode="home" word="HIRE" ping={1} />
      <AppPhone x={1240} y={540} s={0.85} mode="app" job="COOK" value={0.3} readout="$90 A SHIFT" thumb />
      <g transform="translate(1660 300) scale(3)"><CashFan /></g>
      <Cheque x={1640} y={640} s={0.6} amount="$400" to="EVERYONE" />
      <Card x={1560} y={900} s={1} strange />
      <Card x={1780} y={900} s={1} />
      <g transform="translate(150 980)"><Hammer s={1.2} /></g>
      <g transform="translate(280 980)"><Wrench s={1.2} /></g>
      <g transform="translate(400 960)"><Mic s={2} rot={0} /></g>
      <Till x={300} y={760} s={1} ping={1} />
      <WallClock x={520} y={720} s={0.9} hours={11.83} />
      <Pie x={540} y={950} s={1.2} />
      <Banknote x={1320} y={1000} s={0.5} old amount="$5" />
    </Sheet>
  ) },
  { label: "napkins: writing, three lines, another hand", node: (
    <Sheet bg="#c9b994">
      <Napkin x={360} y={540} s={1.2} text="...and he ate here" write={0.8} pencil />
      <Napkin x={980} y={540} s={1.2} scribbles={2} text={["COOK $600", "MACHINE $90", "TAB $510"]} rot={3} seed={4} />
      <Napkin x={1580} y={540} s={1.2} text="CHEAP." ink="#7a2f3f" rot={-7} seed={7} strike={[0]} />
    </Sheet>
  ) },
  { label: "cast", node: (
    <Sheet bg="#efe4cc">
      <rect x={0} y={860} width={1920} height={220} fill="#d9cbb0" />
      {CAST.map((c, i) => (
        <g key={c.name}>
          <Dressed x={120 + i * 186} y={900} scale={1.3} facing={1} look={{ x: 0.5, y: 0 }} mouth="smile" time={10} {...c.who} />
          <text x={120 + i * 186} y={990} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill={INK}>{c.name}</text>
        </g>
      ))}
    </Sheet>
  ) },
];

export const FOUNDATION_PANELS = PANELS.length;

export const Foundation: React.FC = () => {
  const frame = useCurrentFrame();
  const p = PANELS[Math.min(frame, PANELS.length - 1)];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {p.node}
      <Finish />
      <Label text={`${frame} · ${p.label}`} />
    </AbsoluteFill>
  );
};

export const Root: React.FC = () => (
  <Composition id="Foundation" component={Foundation} durationInFrames={PANELS.length} fps={FPS} width={WIDTH} height={HEIGHT} />
);

// Used only to keep these imports exercised in the type-check (cast colours referenced by builders).
export const _CAST_CHECK = [RIVAL, PLUMBER, REPORTER, STRANGER, MARCO];
