// It Was Yesterday's pod and inside year: you lying in pod one with the cable in and the calendar page folded in your
// fist; the hatch opening on the alarm; then the inside year in four cuts (blossom; the bakery; a friend's wedding, you
// raising a glass; snow to the knee); and that night, your hand on the cable again.
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, STAND, walkPose } from "@whatif/kit/rig/pose";
import { weddingHall } from "@whatif/kit/sets/WeddingHall";
import { LookContext } from "@whatif/kit/stage/Look";
import { drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { setLook } from "@whatif/kit/sets/common";
import { INK, PAPER } from "@whatif/kit/theme";
import { Cable, Counter } from "../parts";
import { podHallLights, PodHallBack, POD_ONE } from "../sets/PodHall";
import { TOWN_FLOOR, TownBack, townLights } from "../sets/InsideTown";
import { blinking, camAt, HERO, linear, mix, PASTELS, ramp } from "../shared";
import { aim, InSet, OwnSet, Person, type Body } from "./CityPlugsIn.Kit";

/** The folded calendar page in a fist. */
export const Page: React.FC = () => (
  <g transform="rotate(-12)">
    <rect x={-18} y={-14} width={36} height={28} fill={PAPER} stroke={INK} strokeWidth={3} />
    <rect x={-18} y={-14} width={36} height={8} fill="#d8344f" />
  </g>
);

/** Inside pod one, close (drawn here, so the night desk never crosses it): the capsule, its lamp strip, the counter on
 *  the frame above, the pillow at the right; you lying with the cable in and the page on your chest. `lids` 0 open to 1
 *  shut; `sit` 0 lying to 1 sat up; `door` 1 open to 0 shut over the opening. */
const PodInside: React.FC<{ frame: number; lids: number; sit: number; page: boolean; door: number }> = ({ frame, lids, sit, page, door }) => (
  <g>
    <rect x={-1400} y={-900} width={4800} height={2900} fill="#151a2a" />
    <rect x={300} y={250} width={1320} height={640} rx={90} fill="#262d45" stroke={INK} strokeWidth={14} />
    <rect x={350} y={300} width={1220} height={540} rx={70} fill="#0a0c16" />
    <rect x={420} y={326} width={300} height={34} rx={14} fill="#ffc46b" opacity={0.9} />
    <ellipse cx={1080} cy={770} rx={140} ry={36} fill="#cfd3e6" />
    <Counter frame={frame} x={960} y={190} tile={70} />
    <Figure x={830} y={730 + 112 * 1.5} scale={1.5} rotate={mix(90, 30, sit)} pose={{ ...STAND, armF: page ? [150, 70] : [30, 20] }} head={HERO.head} scarf={HERO.scarf} tuft
      time={frame} lids={lids} mouth="flat" brows={sit > 0 ? "raised" : "none"} eyes={sit > 0 ? 1.25 : 1} look={{ x: 0.2, y: -0.5 }} held={page ? <Page /> : undefined} />
    {sit < 0.5 && <Cable d="M1500 300 Q1480 600 1120 690" width={14} />}
    {door < 1 && (
      <g>
        <rect x={340} y={290} width={1240} height={560 * (1 - door)} rx={60} fill="#1d2338" stroke="#3a4363" strokeWidth={8} />
        {door < 0.4 && <circle cx={960} cy={570} r={90} fill="#ffc46b" stroke={INK} strokeWidth={10} />}
      </g>
    )}
  </g>
);

/** Pod one at night, close: you plugging in and shutting your eyes, or (`open` from) the hatch opening on the alarm and
 *  you sitting up. */
export const PodShot: React.FC<{ frame: number; start: number; shut: number; open?: number; end: number }> = ({ frame, start, shut, open, end }) => {
  const door = open === undefined ? 1 : ramp(frame, open, open + 10);
  const sit = open === undefined ? 0 : ramp(frame, open + 6, open + 18);
  const lids = open === undefined ? ramp(frame, shut, shut + 20) : frame < open ? 1 : 0;
  const cam: Camera = drift(camAt(frame, [[start, { x: 960, y: 560, zoom: 1.05 }], [end, { x: 1000, y: 600, zoom: 1.3 }]]), frame, "wy-pod", 3);
  return (
    <OwnSet mood="night" cam={cam} back={<PodInside frame={frame} lids={lids} sit={sit} page={open === undefined} door={door} />}
      glows={[{ x: 570, y: 340, r: 420, color: "#ffc46b", strength: 0.35 }]} />
  );
};

/** The town in a season, with you in it. */
const Season: React.FC<{ frame: number; cam: Camera; children: React.ReactNode; over?: React.ReactNode }> = ({ frame, cam, children, over }) => (
  <LookContext.Provider value={setLook(townLights(), "day", cam)}>
    <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<TownBack cam={cam} frame={frame} />} actors={<>{children}</>} front={over} />
  </LookContext.Provider>
);

/** Spring: a blossom tree, petals falling, you under it looking up. */
export const Blossom: React.FC<{ frame: number; start: number }> = ({ frame, start }) => {
  const cam = drift({ x: 980, y: mix(520, 600, linear(frame, start, start + 40)), zoom: 1.5 }, frame, "wy-bl", 3);
  const you: Body = { x: 1060, y: TOWN_FLOOR - 50, scale: 1.0, facing: -1, pose: { ...STAND, tilt: -14 } };
  return (
    <Season frame={frame} cam={cam}>
      <rect x={890} y={540} width={34} height={TOWN_FLOOR - 600} fill="#6a4630" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 22 }, (_, i) => (
        <circle key={i} cx={907 + Math.cos(i * 2.4) * (40 + (i % 5) * 26)} cy={470 + Math.sin(i * 2.4) * (30 + (i % 4) * 18)} r={46 - (i % 3) * 8}
          fill={["#f4c2d0", "#f7d6df", "#eaa8bd"][i % 3]} stroke={INK} strokeWidth={3} />
      ))}
      {Array.from({ length: 16 }, (_, i) => {
        const t = ((frame * (2 + (i % 3)) + i * 61) % 520);
        return <ellipse key={`p${i}`} cx={760 + ((i * 97) % 420) + Math.sin((frame + i * 20) / 10) * 20} cy={460 + t} rx={8} ry={5} fill="#f4c2d0" transform={`rotate(${frame * 4 + i * 30} ${760 + ((i * 97) % 420)} ${460 + t})`} />;
      })}
      <Person body={you} frame={frame} seed={2} who={{ ...HERO, mouth: "smile", lids: 0.1, look: { x: 0.3, y: -1 } }} />
    </Season>
  );
};

/** The bakery: a shop front with an awning and loaves in the window; you coming out with a loaf under your arm. */
export const Bakery: React.FC<{ frame: number; start: number }> = ({ frame, start }) => {
  const p = linear(frame, start, start + 60);
  const cam = drift({ x: 960, y: 600, zoom: 1.45 }, frame, "wy-bk", 3);
  const you: Body = { x: mix(900, 1200, p), y: TOWN_FLOOR - 50, scale: 1.0, facing: 1, pose: walkPose(frame * 0.3) };
  const loaf = <ellipse cx={0} cy={0} rx={40} ry={18} fill="#d99a5a" stroke={INK} strokeWidth={3} />;
  return (
    <Season frame={frame} cam={cam}>
      <rect x={600} y={380} width={720} height={TOWN_FLOOR - 60 - 380} fill="#e8d2b0" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${600 + i * 90} 380 h90 v60 q-45 30 -90 0Z`} fill={i % 2 ? PAPER : "#d8344f"} stroke={INK} strokeWidth={4} />)}
      <rect x={660} y={500} width={300} height={200} rx={8} fill="#ffe6b0" stroke={INK} strokeWidth={6} />
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <ellipse key={`${r}${c}`} cx={710 + c * 100} cy={560 + r * 50} rx={38} ry={16} fill="#d99a5a" stroke={INK} strokeWidth={3} />))}
      <rect x={1040} y={500} width={180} height={TOWN_FLOOR - 60 - 500} rx={8} fill="#7a4b3a" stroke={INK} strokeWidth={6} />
      <Person body={you} frame={frame} seed={3} who={{ ...HERO, mouth: "smile", look: { x: 1, y: 0 }, held: loaf }} />
    </Season>
  );
};

/** A friend's wedding: the library hall; the couple on the thrones; you in the guests, raising a glass. */
export const Wedding: React.FC<{ frame: number; start: number }> = ({ frame, start }) => {
  const cam = drift({ x: 1050, y: 640, zoom: 1.25 }, frame, "wy-wd", 3);
  const raise = ramp(frame, start + 6, start + 18);
  const you: Body = { x: 760, y: 990, scale: 1.2, facing: 1, pose: { ...STAND, armF: [mix(20, 150, raise), mix(20, 20, raise)] } };
  const glass = <path d="M-10 -26 L10 -26 L4 0 L-4 0Z M0 0 V16 M-8 16 H8" fill="#fff1c4" stroke={INK} strokeWidth={3} />;
  const s = weddingHall.spots;
  return (
    <InSet set={weddingHall} mood="lamp" frame={frame} cam={cam}>
      <Figure x={s.groom.x} y={s.groom.y} scale={s.groom.scale} facing={1} pose={SEATED} head={PASTELS[0]} coat="#f3e9d7" time={frame} mouth="smile" blink={blinking(frame, 1)} />
      <Figure x={s.bride.x} y={s.bride.y} scale={s.bride.scale} facing={-1} pose={SEATED} head={PASTELS[3]} coat="#d8344f" time={frame} mouth="smile" blink={blinking(frame, 2)} />
      <Person body={you} frame={frame} seed={4} who={{ ...HERO, mouth: "open", brows: "raised", lids: 0.1, look: { x: 1, y: -0.3 }, held: glass }} />
    </InSet>
  );
};

/** A hard winter: the street under snow to the knee, snow falling, you wading through it. */
export const Winter: React.FC<{ frame: number; start: number }> = ({ frame, start }) => {
  const p = linear(frame, start, start + 70);
  const cam = drift({ x: 960, y: 600, zoom: 1.3 }, frame, "wy-wn", 3);
  const you: Body = { x: mix(700, 1000, p), y: TOWN_FLOOR - 40, scale: 1.05, facing: 1, pose: { ...walkPose(frame * 0.2), lean: 16 } };
  const snow = (
    <g>
      <path d={`M-1400 ${TOWN_FLOOR - 110} Q600 ${TOWN_FLOOR - 140} 1200 ${TOWN_FLOOR - 110} T3400 ${TOWN_FLOOR - 110} V1800 H-1400Z`} fill="#f7f9fc" stroke="#cfd8e6" strokeWidth={6} />
      {Array.from({ length: 50 }, (_, i) => {
        const y = ((frame * (3 + (i % 3)) + i * 53) % 1100) - 50;
        return <circle key={i} cx={((i * 137) % 1900) + Math.sin((frame + i * 9) / 12) * 14} cy={y} r={4 + (i % 3) * 2} fill="#fff" opacity={0.9} />;
      })}
    </g>
  );
  return (
    <Season frame={frame} cam={cam} over={snow}>
      <Person body={you} frame={frame} seed={5} who={{ ...HERO, brows: "worry", lids: 0.3, mouth: "flat", flow: 0.8, look: { x: 1, y: 0.2 } }} />
    </Season>
  );
};

/** That night: you at pod one, your hand on the cable; the hatch; the counter flutters as you go in. */
export const BackIn: React.FC<{ frame: number; start: number; climb: number; end: number }> = ({ frame, start, climb, end }) => {
  const cable = { x: POD_ONE.x + 250, y: POD_ONE.y + 70 };
  const body: Body = { x: POD_ONE.x + 60, y: 960, scale: 1.1, facing: 1, pose: { ...STAND, lean: 6 } };
  body.pose = { ...body.pose, armF: aim(body, { x: cable.x - 6, y: cable.y + 30 }) };
  const inside = ramp(frame, climb, climb + 20);
  const cam: Camera = drift(camAt(frame, [[start, { x: cable.x - 30, y: cable.y + 30, zoom: 3.0 }], [climb, { x: cable.x - 60, y: cable.y + 40, zoom: 2.6 }],
    [climb + 1, { x: 640, y: 700, zoom: 1.6 }], [end, { x: 620, y: 690, zoom: 1.75 }]]), frame, "wy-in", 3);
  return (
    <LookContext.Provider value={setLook(podHallLights(), "night", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={<PodHallBack cam={cam} frame={frame} door={1 - ramp(frame, climb + 26, climb + 40)} counter={{ at: climb + 40 }} />}
        actors={
          <g opacity={1 - inside}>
            <Cable d={`M${cable.x + 40} ${cable.y - 80} Q${cable.x + 10} ${cable.y} ${cable.x - 10} ${cable.y + 60}`} width={12} />
            <Person body={body} frame={frame} seed={6} who={{ ...HERO, brows: "flat", lids: 0.35, mouth: "flat", look: { x: 1, y: 0 } }} />
          </g>
        } />
    </LookContext.Provider>
  );
};
