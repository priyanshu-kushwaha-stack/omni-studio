// Beat "One Mind" (script.md ## [09:55] One Mind; narration lines 78-85): the turn and the one wordless peak. Your
// room at night, the notebook pages spread on the bottom bunk, the two of you cross-legged either side of them.
//
//   78   the bunk, the pages, the two of you.
//   hold (8 s, performed: three moments) he hums his tune (the notes float up); you hum yours: the same notes; you
//        both stop and look at each other. He says the bridge word; you say it with him, the same beat (a little drawn
//        bridge rises between you). INSERT the face, drawn twice in two hands, his page held beside yours; close on him,
//        a long look.
//   79   he opens the laptop.
//   hold (3 s, performed) INSERT the screen: strangers' posts from a thousand towns, the same face a hundred ways,
//        phones humming the same tune; his hand stops on the keys; his face in the screen's light.
//   80   INSERT the leaflet remembered: one head, one band, one jar (BRAIN, BAND, JAR stamp in); the two of you lit.
//   81   the leaflet: heads all round the one, on threads; close on you both; the room, wide.
//   82   INSERT the globe at night, its windows lighting one by one; the 2020 home computers coming on and linking into
//        one; the globe again, the threads joining.
//   PEAK (9 s, wordless) the dark half lit like a single brain cell firing: the tree flashes, pulses run out along it
//        in one rhythm, the camera drifts in on one spark, and the spark is your window.
//   83   TOP-DOWN the pages slide together edge to edge; the crumbs join into one drawing: a machine.
//   84   the laptop: the strangers' posts slide together into the same machine; close on you.
//   85   the room, wide, pulling back.
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { moodLook } from "@whatif/kit/stage/moods";
import { LookContext } from "@whatif/kit/stage/Look";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { INK } from "@whatif/kit/theme";
import { DeviceSound, Sheet } from "../parts";
import { BunkRoom } from "../sets/BunkRoom";
import { GLOBE, GLOBE_HOME, GlobeScene, type GlobeState } from "../sets/Globe";
import { BROTHER, camAt, current, lineEnd, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { Brother, CROSS, headOf, StrangerFace, talk, Word, You, type Body, type Face } from "./Contract.Kit";
import { BedTop, ComputersSheet, HumNotes, LaptopScreen, LeafletOne, Machine, PagesTop, SideLaptop } from "./OneMind.Parts";
import { atV, isV5, V5 } from "./V5.Kit";

type T = ReturnType<typeof times>;

function times(clips: Clip[], start: number, end: number, v3: Clip[]) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const hold8 = lineEnd(clips, 78); // performed: the hum, the bridge word, the face drawn twice
  const in8 = (p: number) => Math.round(hold8 + (from(79) - hold8) * p);
  const holdL = lineEnd(clips, 79); // performed: the strangers' page; his hand stops on the keys
  const inL = (p: number) => Math.round(holdL + (from(80) - holdL) * p);
  const peak = lineEnd(clips, 82); // THE wordless peak, to clips[83].from
  // v5: the peak ends on "Brother: What'd we get?" (116), close on him over the pages, before they join (v1's 83)
  const v5 = isV5(v3);
  const weGet = v5 ? v3[V5.weGet].from - 4 : from(83) - 4;
  return {
    start, end,
    hisHum: [in8(0.03), in8(0.17)] as const, yourHum: [in8(0.18), in8(0.31)] as const, look: in8(0.31),
    word: in8(0.375), say: [in8(0.42), in8(0.56)] as const,
    faces: in8(0.625), slideBeside: [in8(0.66), in8(0.76)] as const, longLook: in8(0.85),
    laptop: from(79) - 3, open: [from(79), lineEnd(clips, 79) + 4] as const,
    screen: holdL, stop: inL(0.55), lit: inL(0.72),
    leaflet: from(80) - 3, stamps: [at(80, 0.06), at(80, 0.2), at(80, 0.34)] as [number, number, number], twoLit: at(80, 0.58),
    many: from(81) - 3, manyRun: [from(81), at(81, 0.35)] as const, closeBoth: at(81, 0.4), wide81: at(81, 0.68),
    // v5 split v1's 2020 line into three (113-115): the globe on the first, the computers coming on across it and the
    // next, linking on "Spare machines, linked into one"
    ...(v5 ? {
      globe: v3[V5.computers].from - 3, computers: atV(v3, V5.computers, 0.3),
      compOn: [atV(v3, V5.computers, 0.35), atV(v3, V5.computers + 1, 0.45)] as [number, number],
      compLink: [atV(v3, V5.computers + 1, 0.55), atV(v3, V5.computers + 2, 0.3)] as [number, number], globe2: atV(v3, V5.computers + 2, 0.4),
    } : {
      globe: from(82) - 3, computers: at(82, 0.28), compOn: [at(82, 0.3), at(82, 0.55)] as [number, number],
      compLink: [at(82, 0.6), at(82, 0.76)] as [number, number], globe2: at(82, 0.78),
    }),
    peak, peakEnd: v5 ? weGet : from(83), weGet, weGetLine: v5 ? [v3[V5.weGet].from, lineEnd(v3, V5.weGet)] as const : [weGet, weGet] as const,
    pages: from(83) - 3, join: [from(83), at(83, 0.42)] as const, machine: at(83, 0.36),
    screen84: from(84) - 3, slide84: [from(84), at(84, 0.55)] as const, you84: at(84, 0.62),
    wide85: from(85) - 3,
  };
}

// ------------------------------------------------------------------------------------------------ the bunk, side on

const S = 2.0;
const MATTRESS = 850;
const YOU_X = 690;
const HIM_X = 1440;
const LAPTOP = { x: 1150, y: MATTRESS - 2 };

/** The two of you on the bottom bunk at a frame, and your faces. */
function pair(frame: number, k: T) {
  const you: Body = { x: YOU_X, y: MATTRESS + 112 * S, scale: S, facing: 1, pose: { ...CROSS } };
  const him: Body = { x: HIM_X, y: MATTRESS + 112 * S, scale: S, facing: -1, pose: { ...CROSS } };
  const humHis = frame >= k.hisHum[0] && frame < k.hisHum[1];
  const humYours = frame >= k.yourHum[0] && frame < k.yourHum[1];
  const saying = frame >= k.say[0] && frame < k.say[1];
  const word = talk(frame, k.say[0], k.say[1], "flat");
  const atLaptop = frame >= k.laptop;
  // He reaches for the laptop and types; you lean in to see.
  if (atLaptop && frame < k.leaflet) him.pose = { ...CROSS, lean: 10, armF: [70, 20], armB: [60, 30] };
  if (frame >= k.twoLit) you.pose = { ...CROSS, lean: 12 };
  const youFace: Face = frame < k.hisHum[0]
    ? { brows: "none", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.7 } }
    : frame < k.yourHum[0]
      ? { brows: "raised", lids: 0, mouth: "flat", eyes: 1.1, look: { x: 1, y: -0.1 } }
      : frame < k.look
        ? { brows: "none", lids: 0.45, mouth: humYours ? "o" : "flat", eyes: 1, look: { x: 0.6, y: -0.3 } }
        : frame < k.word
          ? { brows: "raised", lids: 0, mouth: "flat", eyes: 1.25, look: { x: 1, y: 0 } }
          : frame < k.laptop
            ? { brows: "raised", lids: 0, mouth: saying ? word : "smile", eyes: 1.15, look: { x: 1, y: 0 } }
            : frame < k.twoLit
              ? { brows: "worry", lids: 0, mouth: "flat", eyes: 1.1, look: { x: 1, y: 0.3 } }
              : frame < k.closeBoth
                ? { brows: "worry", lids: 0.1, mouth: "o", eyes: 1.2, look: { x: 1, y: 0.2 } }
                : frame < k.wide81
                  ? { brows: "sad", lids: 0.25, mouth: "smile", eyes: 1, look: { x: 1, y: 0 } }
                  : { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.6, y: 0.5 } };
  const himFace: Face = frame < k.hisHum[0]
    ? { brows: "flat", lids: 0, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.7 } }
    : frame < k.yourHum[0]
      ? { brows: "none", lids: 0, mouth: humHis ? "o" : "flat", eyes: 1, look: { x: 0.4, y: -0.4 } }
      : frame < k.look
        ? { brows: "raised", lids: 0, mouth: "flat", eyes: 1.2, look: { x: 1, y: 0 } }
        : frame < k.word
          ? { brows: "raised", lids: 0, mouth: "flat", eyes: 1.25, look: { x: 1, y: 0 } }
          : frame < k.longLook
            ? { brows: "raised", lids: 0, mouth: saying ? word : "flat", eyes: 1.15, look: { x: 1, y: 0 } }
            : frame < k.laptop
              ? { brows: "worry", lids: 0, mouth: "flat", eyes: 1, look: { x: 0.7, y: 0.6 } }
              : frame < k.closeBoth
                ? { brows: "worry", lids: 0, mouth: frame >= k.stop ? "o" : "flat", eyes: 1.2, look: { x: 0.9, y: 0.5 } }
                : frame < k.wide81
                  ? { brows: "sad", lids: 0, mouth: "smile", eyes: 1, look: { x: 1, y: 0 } }
                  : { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.6, y: 0.5 } };
  if (frame >= k.weGet && frame < k.pages) {
    return { you, him, youFace: { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.7, y: 0.6 } } as Face,
      himFace: { brows: "raised", lids: 0, mouth: talk(frame, k.weGetLine[0], k.weGetLine[1], "smile"), eyes: 1.2, look: { x: 0.8, y: 0.7 } } as Face };
  }
  return { you, him, youFace, himFace };
}

/** The pages on the bunk, side on: thin cream sheets between you. */
const PagesSide: React.FC = () => (
  <g>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <rect key={i} x={830 + i * 56} y={MATTRESS - 8 - (i % 2) * 4} width={120} height={7} rx={2} fill="#f7f0e0" stroke={INK} strokeWidth={2}
        transform={`rotate(${(i % 3) - 1} ${870 + i * 56} ${MATTRESS})`} />
    ))}
  </g>
);

const Bunk: React.FC<{ frame: number; k: T; view: { x: number; y: number; zoom: number } }> = ({ frame, k, view }) => {
  const p = pair(frame, k);
  const open = ramp(frame, k.open[0], k.open[1]);
  const youHead = headOf(p.you), himHead = headOf(p.him);
  const bridge = ramp(frame, k.say[0], k.say[1]);
  return (
    <BunkRoom frame={frame} mood="night" view={view} you="none" jarFill={0.85}>
      <PagesSide />
      {frame >= k.laptop - 30 && <SideLaptop x={LAPTOP.x} y={LAPTOP.y} open={open} scale={1.2} facing={1} />}
      <You body={p.you} face={p.youFace} frame={frame} />
      <Brother body={p.him} face={p.himFace} frame={frame} />
      <defs>
        <radialGradient id="onemind-screen-glow">
          <stop offset="0" stopColor="#cfefff" stopOpacity={0.35} />
          <stop offset="1" stopColor="#cfefff" stopOpacity={0} />
        </radialGradient>
      </defs>
      {open > 0.3 && <circle cx={himHead.x - 40} cy={himHead.y + 60} r={300} fill="url(#onemind-screen-glow)" opacity={open} />}
      {open > 0.3 && frame >= k.twoLit && <circle cx={youHead.x + 120} cy={youHead.y + 60} r={280} fill="url(#onemind-screen-glow)" opacity={0.7} />}
      <HumNotes x={himHead.x - 50} y={himHead.y + 20} t={linear(frame, k.hisHum[0], k.hisHum[1] + 20)} dir={-1} color={BROTHER.cap} />
      <HumNotes x={youHead.x + 50} y={youHead.y + 20} t={linear(frame, k.yourHum[0], k.yourHum[1] + 20)} dir={1} color="#1d9a8f" />
      {bridge > 0 && frame < k.faces && (
        <g transform={`translate(${(youHead.x + himHead.x) / 2} ${mix(youHead.y + 40, youHead.y - 120, bridge)}) scale(${1.6 + bridge})`}
          opacity={Math.min(1, bridge * 3)}>
          <Word x={0} y={0} color="#f3e9d7" />
        </g>
      )}
    </BunkRoom>
  );
};

// ------------------------------------------------------------------------------------------------ inserts

/** The face, drawn twice in two hands: your page, and his held up beside it. */
const FacesInsert: React.FC<{ frame: number; k: T; cam: Camera }> = ({ frame, k, cam }) => {
  const slide = ramp(frame, k.slideBeside[0], k.slideBeside[1]);
  const actors = (
    <>
      <BedTop />
      <g transform="translate(700 560) rotate(-3)">
        <rect x={-252} y={-322} width={520} height={680} rx={8} fill="#000" opacity={0.25} />
        <rect x={-260} y={-340} width={520} height={680} rx={8} fill="#f7f0e0" stroke="#cdbfa6" strokeWidth={3} />
        <StrangerFace x={0} y={-20} s={3.2} color="#1f5c63" hand={1} />
        <circle cx={-200} cy={-280} r={20} fill="#f2b632" stroke={INK} strokeWidth={3} />
      </g>
      <g transform={`translate(${mix(1900, 1250, slide)} ${mix(620, 540, slide)}) rotate(${mix(12, 3, slide)})`}>
        <rect x={-252} y={-322} width={520} height={680} rx={8} fill="#000" opacity={0.25} />
        <rect x={-260} y={-340} width={520} height={680} rx={8} fill="#f7f0e0" stroke="#cdbfa6" strokeWidth={3} />
        <StrangerFace x={0} y={-20} s={3.2} color="#7a3b2e" hand={0} />
        <circle cx={-200} cy={-280} r={20} fill={BROTHER.head} stroke={INK} strokeWidth={3} />
        <circle cx={250} cy={300} r={46} fill={BROTHER.head} stroke={INK} strokeWidth={4} />
      </g>
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={null} actors={actors} />;
};

const ScreenInsert: React.FC<{ frame: number; k: T; cam: Camera; machine?: boolean }> = ({ frame, k, cam, machine }) => {
  const scroll = machine ? 360 : linear(frame, k.screen, k.stop) * 360;
  const m = machine ? ramp(frame, k.slide84[0], k.slide84[1]) : 0;
  const actors = <LaptopScreen frame={frame} scroll={scroll} machine={m} machineAt={k.slide84[0] + 10}
    hand={machine ? undefined : { x: 1300, stop: k.stop }} />;
  return <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={null} actors={actors} />;
};

/** Paper inserts on the blanket: the leaflet remembered, and the computers sheet. */
const PaperInsert: React.FC<{ frame: number; k: T; cam: Camera; what: "leaflet" | "computers" }> = ({ frame, k, cam, what }) => {
  const actors = (
    <>
      <BedTop />
      <Sheet frame={frame} at={what === "leaflet" ? k.leaflet : k.computers} x={960} y={540} w={1360} h={860} tilt={-2}>
        {what === "leaflet"
          ? <g transform="translate(40 20)"><LeafletOne frame={frame} stamps={k.stamps} many={ramp(frame, k.manyRun[0], k.manyRun[1])} /></g>
          : <g transform="translate(40 40)"><ComputersSheet frame={frame} on={k.compOn} link={k.compLink} /></g>}
      </Sheet>
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={null} actors={actors} />;
};

/** The pages on the bed, top down, joining into the machine. */
const MachineInsert: React.FC<{ frame: number; k: T; cam: Camera }> = ({ frame, k, cam }) => {
  const join = ramp(frame, k.join[0], k.join[1]);
  const actors = (
    <>
      <BedTop />
      <PagesTop x={960} y={600} join={join} shade={0.12 * ramp(frame, k.machine, k.machine + 40)} />
      <Machine x={960} y={620} s={0.95} at={k.machine} span={Math.round((k.screen84 - k.machine) * 0.75)} color="#1d3f86" width={9} />
    </>
  );
  return <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={null} actors={actors} />;
};

/** The globe's light: night, but the grade and rim kept low so the sparks stay warm and the threads teal. */
const GLOBE_LOOK = moodLook("night", { grade: { top: "#3a4488", bottom: "#1a1c40", opacity: 0.22 }, rim: undefined, vignette: 0.5 });

function globeState(frame: number, k: T): GlobeState {
  if (frame < k.peak) {
    return {
      lit: frame < k.globe2 ? 0.45 * linear(frame, k.globe, k.computers) : mix(0.45, 0.85, linear(frame, k.globe2, k.peak)),
      join: frame < k.globe2 ? 0 : 0.6 * linear(frame, k.globe2, k.peak),
      fire: frame >= k.globe2 ? { from: k.globe2 + 20, every: 40, speed: 8 } : undefined,
    };
  }
  const p = linear(frame, k.peak, k.peakEnd);
  const bump = (a: number, b: number) => (p > a && p < b ? Math.sin(((p - a) / (b - a)) * Math.PI) : 0);
  return {
    lit: mix(0.85, 1, linear(p, 0, 0.3)),
    join: mix(0.6, 1, linear(p, 0, 0.18)),
    fire: { from: k.peak, every: 36, speed: 9 },
    flash: Math.max(bump(0.1, 0.32), 0.6 * bump(0.55, 0.7)),
    home: ramp(p, 0.62, 0.95),
  };
}

const GlobeInsert: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const peakT = ramp(frame, k.peak, k.peakEnd + 6);
  const base: Camera = frame < k.globe2
    ? camAt(frame, [[k.globe, { x: GLOBE.x - 40, y: GLOBE.y, zoom: 1.12 }], [k.computers, { x: GLOBE.x, y: GLOBE.y, zoom: 1.0 }]])
    : frame < k.peak
      ? camAt(frame, [[k.globe2, { x: GLOBE.x + 30, y: GLOBE.y, zoom: 1.05 }], [k.peak, { x: GLOBE.x, y: GLOBE.y, zoom: 1.0 }]])
      : { x: mix(GLOBE.x, GLOBE_HOME.x, peakT), y: mix(GLOBE.y, GLOBE_HOME.y, peakT), zoom: mix(1.0, 3.8, peakT) };
  const cam = drift(base, frame, "globe", 4);
  return (
    <LookContext.Provider value={GLOBE_LOOK}>
      <GlobeScene cam={cam} frame={frame} state={globeState(frame, k)} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ the cut

type Name = "est" | "hum" | "humYou" | "look" | "word" | "faces" | "longLook" | "laptop" | "screen" | "lit" | "leaflet" | "twoLit" | "many"
  | "closeBoth" | "wide81" | "globe" | "computers" | "globe2" | "weGet" | "pages" | "screen84" | "you84" | "wide85";

const OneMindShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = current<Name>(frame, [[k.start, "est"], [k.hisHum[0] - 4, "hum"], [k.yourHum[0] - 2, "humYou"], [k.look, "look"], [k.word, "word"],
    [k.faces, "faces"], [k.longLook, "longLook"], [k.laptop, "laptop"], [k.screen, "screen"], [k.lit, "lit"], [k.leaflet, "leaflet"],
    [k.twoLit, "twoLit"], [k.many, "many"], [k.closeBoth, "closeBoth"], [k.wide81, "wide81"], [k.globe, "globe"], [k.computers, "computers"],
    [k.globe2, "globe2"], [k.weGet, "weGet"], [k.pages, "pages"], [k.screen84, "screen84"], [k.you84, "you84"], [k.wide85, "wide85"]]);
  if (shot === "globe" || shot === "globe2") return <GlobeInsert frame={frame} k={k} />;
  const top = (c: Camera) => drift(c, frame, "onemind-top", 3);
  if (shot === "faces") return <FacesInsert frame={frame} k={k} cam={top(camAt(frame, [[k.faces, { x: 960, y: 540, zoom: 1.02 }], [k.longLook, { x: 1000, y: 540, zoom: 1.12 }]]))} />;
  if (shot === "screen") return <ScreenInsert frame={frame} k={k} cam={top(camAt(frame, [[k.screen, { x: 960, y: 560, zoom: 1.0 }], [k.lit, { x: 1080, y: 640, zoom: 1.25 }]]))} />;
  if (shot === "screen84") return <ScreenInsert frame={frame} k={k} machine cam={top(camAt(frame, [[k.screen84, { x: 960, y: 540, zoom: 1.0 }], [k.you84, { x: 960, y: 560, zoom: 1.08 }]]))} />;
  if (shot === "leaflet" || shot === "many") return <PaperInsert frame={frame} k={k} what="leaflet" cam={top(camAt(frame, shot === "leaflet"
    ? [[k.leaflet, { x: 900, y: 560, zoom: 1.12 }], [k.twoLit, { x: 920, y: 540, zoom: 1.2 }]]
    : [[k.many, { x: 960, y: 540, zoom: 1.2 }], [k.closeBoth, { x: 960, y: 540, zoom: 1.0 }]]))} />;
  if (shot === "computers") return <PaperInsert frame={frame} k={k} what="computers" cam={top(camAt(frame, [[k.computers, { x: 900, y: 520, zoom: 1.15 }], [k.globe2, { x: 960, y: 540, zoom: 1.02 }]]))} />;
  if (shot === "pages") return <MachineInsert frame={frame} k={k} cam={top(camAt(frame, [[k.pages, { x: 960, y: 560, zoom: 0.92 }], [k.screen84, { x: 960, y: 600, zoom: 1.05 }]]))} />;
  const p = pair(frame, k);
  const yh = headOf(p.you), hh = headOf(p.him);
  const views: Record<string, { x: number; y: number; zoom: number }> = {
    est: camAt(frame, [[k.start, { x: 1000, y: 680, zoom: 1.05 }], [k.hisHum[0], { x: 1000, y: 640, zoom: 1.2 }]]),
    hum: camAt(frame, [[k.hisHum[0] - 4, { x: hh.x - 120, y: hh.y + 20, zoom: 2.2 }], [k.yourHum[0], { x: hh.x - 140, y: hh.y + 10, zoom: 2.35 }]]),
    humYou: camAt(frame, [[k.yourHum[0] - 2, { x: yh.x + 120, y: yh.y + 20, zoom: 2.2 }], [k.look, { x: yh.x + 140, y: yh.y + 10, zoom: 2.35 }]]),
    look: camAt(frame, [[k.look, { x: 1000, y: 580, zoom: 1.45 }], [k.word, { x: 1000, y: 575, zoom: 1.5 }]]),
    word: camAt(frame, [[k.word, { x: 1000, y: 520, zoom: 1.6 }], [k.faces, { x: 1000, y: 500, zoom: 1.7 }]]),
    longLook: camAt(frame, [[k.longLook, { x: hh.x - 60, y: hh.y + 20, zoom: 2.5 }], [k.laptop, { x: hh.x - 60, y: hh.y + 20, zoom: 2.75 }]]),
    laptop: camAt(frame, [[k.laptop, { x: 1260, y: 640, zoom: 1.7 }], [k.screen, { x: 1270, y: 640, zoom: 1.8 }]]),
    lit: camAt(frame, [[k.lit, { x: hh.x - 60, y: hh.y + 30, zoom: 2.6 }], [k.leaflet, { x: hh.x - 60, y: hh.y + 30, zoom: 2.8 }]]),
    twoLit: camAt(frame, [[k.twoLit, { x: 1010, y: 560, zoom: 1.5 }], [k.many, { x: 1010, y: 560, zoom: 1.62 }]]),
    closeBoth: camAt(frame, [[k.closeBoth, { x: 1000, y: 540, zoom: 1.75 }], [k.wide81, { x: 1000, y: 540, zoom: 1.9 }]]),
    wide81: camAt(frame, [[k.wide81, { x: 1000, y: 600, zoom: 1.4 }], [k.globe, { x: 960, y: 560, zoom: 1.0 }]]),
    weGet: camAt(frame, [[k.weGet, { x: hh.x - 120, y: hh.y + 60, zoom: 2.2 }], [Math.max(k.weGet + 1, k.pages), { x: hh.x - 130, y: hh.y + 60, zoom: 2.35 }]]),
    you84: camAt(frame, [[k.you84, { x: yh.x + 70, y: yh.y + 20, zoom: 2.4 }], [k.wide85, { x: yh.x + 70, y: yh.y + 20, zoom: 2.6 }]]),
    wide85: camAt(frame, [[k.wide85, { x: 1000, y: 600, zoom: 1.5 }], [k.end, { x: 960, y: 560, zoom: 0.92 }]]),
  };
  const v = drift({ x: views[shot].x, y: views[shot].y, zoom: views[shot].zoom }, frame, "onemind", 4);
  return <Bunk frame={frame} k={k} view={v} />;
};

/** Paper as the pages slide; very far away typing under the peak (the score is already down to its floor). */
const OneMindSound: React.FC<{ k: T }> = ({ k }) => (
  <>
    {[0, 8, 16, 26].map((d) => (
      <Sequence key={d} from={k.join[0] + d} durationInFrames={16}><Audio src={staticFile("sfx/paper.wav")} volume={0.4} /></Sequence>
    ))}
    <Sequence from={k.slideBeside[0]} durationInFrames={16}><Audio src={staticFile("sfx/paper.wav")} volume={0.45} /></Sequence>
    <DeviceSound at={k.peak} frames={k.peakEnd - k.peak} chime={false} volume={0.2} />
  </>
);

const OneMind: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = times(shot.clips, shot.from, shot.to, shot.v3);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <OneMindShot frame={shot.frame} k={k} />
      <OneMindSound k={k} />
    </AbsoluteFill>
  );
};

export const oneMind: Beat = { id: "oneMind", firstLine: 78, Component: OneMind };
