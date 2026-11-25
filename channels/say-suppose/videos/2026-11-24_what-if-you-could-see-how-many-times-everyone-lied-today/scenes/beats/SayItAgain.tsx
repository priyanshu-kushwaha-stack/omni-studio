// Beat "Say It Again" (script.md ## [02:30]): lunch hour, two garages (one set, visited twice: mechanic one at 0,
// mechanic two at 4, click to 5 on "gearbox", your "Say it again?" and his silent fish mouth, you keep your money), the
// stairwell (the landlord 2 -> 3 on "Monday", the kid with chocolate to the ears 2 -> 3 on "Didn't eat it", his mum's
// look), and the restaurant at dusk (his taller profile photo on your phone; "Six one", 0 -> 1, he sits up; the next
// table's two clicks and the clink). Every motion hangs off the spoken lines (shot.at / shot.end).
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { reach, SEATED, seatedY, STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { INK, PAPER } from "@whatif/kit/theme";
import { Deep } from "@whatif/kit/sets/common";
import type { Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import { Body, Bubble, headOf, MoodStage, talk } from "../parts/SayItAgain.Kit";
import { DINER, GARAGE, GarageBack, RestaurantBack, RestaurantTables, STAIRS, StairwellBack } from "../sets/SayItAgain";
import { camAt, current, HERO, mix, ramp, type Beat, type Shot } from "../shared";

const MECH = { head: "#f0b48e", coat: "#3d6fb0" } as const;
const LANDLORD = { head: "#b8a48e", coat: "#6b4b3a" } as const;
const KID = { head: "#c9a0d6", cap: "#d8344f" } as const;
const MUM = { head: "#e6a0a0", coat: "#7fa0c4" } as const;
const DATE = { head: "#b9a6e0", coat: "#3d4a66" } as const;
const WOMAN = { head: "#e6c27a", coat: "#c96f2d" } as const;
const MAN = { head: "#7fc29b", coat: "#2f3242" } as const;

function cues(shot: Shot) {
  const { at, end } = shot;
  const gearE = end("Mechanic two:");
  const landlord = at("Landlord:");
  const hold = (p: number) => Math.round(gearE + (landlord - gearE) * p);
  const kidE = end("Kid:");
  const three = at("Three years old");
  const sixE = end("Date: Six one");
  const daters = at("In one study of online");
  const manE = end("Man diner:");
  const fine = at("Dinner's fine");
  return {
    lunch: at("Lunch."), brakes: at("Mechanic one:"), brakesE: end("Mechanic one:"), zero: at("Zero."),
    second: at("Second opinion"), gear: at("Mechanic two:"), gearE,
    click5: gearE + 8, tilt: hold(0.12), fish: hold(0.42), leave: hold(0.66), landlord,
    landlordE: end("Landlord:"), rent: at("You hold the rent"), kid: at("Kid:"), kidE,
    click3: kidE + 6, lick: kidE + 16, mumYou: kidE + 22, mumKid: kidE + 44, three,
    dusk: at("Dusk. A first date"), photo: at("Dusk. A first date", 0.42), chair: at("Dusk. A first date", 0.78),
    six: at("Date: Six one"), sixE, click1: sixE + 6, lookPhoto: sixE + 14, lookHim: sixE + 30, lookOne: sixE + 44, straight: sixE + 34,
    daters, inches: at("He's lying by two"), everybody: at("He's lying by two", 0.5),
    woman: at("Woman diner:"), womanE: end("Woman diner:"), man: at("Man diner:"), manE,
    clickW: manE + 6, clickM: manE + 16, clink: manE + 28, watch: manE + 40, fine,
  };
}
type K = ReturnType<typeof cues>;

// ------------------------------------------------------------------------------------------------ the garages

const Rag: React.FC = () => <rect x={-14} y={-10} width={30} height={22} rx={4} fill="#d8344f" stroke={INK} strokeWidth={3} />;
const Wallet: React.FC = () => <rect x={-16} y={-12} width={32} height={24} rx={4} fill="#6b4b3a" stroke={INK} strokeWidth={3} />;

const Garage: React.FC<{ frame: number; k: K; second: boolean }> = ({ frame, k, second }) => {
  const m = GARAGE.mech;
  const y = GARAGE.you;
  const startAt = second ? k.second : k.lunch - 8;
  // you walk in from the left; on the second visit you walk out again with your money
  const inT = ramp(frame, startAt, startAt + 50);
  const outT = second ? ramp(frame, k.leave, k.landlord) : 0;
  const walking = (frame >= startAt && frame < startAt + 50) || (second && frame >= k.leave && frame < k.landlord);
  const yx = second && frame >= k.leave ? mix(y.x, -260, outT) : mix(-200, y.x, inT);
  const wipe = Math.sin(frame / 5) * 14;
  const mechPose: Pose = { ...STAND, armF: [55 + wipe, 70], armB: [40 - wipe, 80] };
  const talking = second ? [k.gear, k.gearE] : [k.brakes, k.brakesE];
  // the fish: mouths "gearbox" with no sound
  const fish = second && frame >= k.fish && frame < k.leave + 20;
  const mechMouth = fish ? (Math.floor((frame - k.fish) / 7) % 2 ? "o" : "flat") : talk(frame, talking[0], talking[1], "smile");
  const tilt = second && frame >= k.tilt ? mix(0, -16, ramp(frame, k.tilt, k.tilt + 10)) : 0;
  const youPose: Pose = walking ? walkPose(frame / 4) : { ...STAND, tilt, armF: second && frame >= k.fish ? [40, 30] : [9, 10] };
  const looksUp = second && frame >= k.click5 && frame < k.leave;
  const count = second ? { base: 4, ticks: [k.click5] } : { base: 0 };
  const cam: Camera = second
    ? camAt(frame, [[k.second, { x: 1000, y: 560, zoom: 1.02 }], [k.gear, { x: 820, y: 600, zoom: 1.25 }],
      [k.click5, { x: 700, y: 560, zoom: 1.42 }], [k.fish - 4, { x: 700, y: 560, zoom: 1.42 }], [k.fish + 10, { x: 900, y: 560, zoom: 1.7 }],
      [k.leave, { x: 860, y: 560, zoom: 1.6 }], [k.leave + 24, { x: 760, y: 560, zoom: 1.08 }]])
    : camAt(frame, [[k.lunch - 8, { x: 1000, y: 540, zoom: 1.0 }], [k.brakes, { x: 760, y: 600, zoom: 1.3 }],
      [k.zero, { x: 900, y: 470, zoom: 1.85 }]]);
  return (
    <MoodStage mood="day" cam={drift(cam, frame, second ? "g2" : "g1", 5)}
      back={<GarageBack cam={cam} mood="day" frame={frame} second={second} />}
      actors={
        <>
          <Body x={m.x} y={m.y} scale={m.scale} facing={-1} pose={mechPose} head={MECH.head} coat={MECH.coat} frame={frame}
            id={second ? "mech2" : "mech1"} count={count} held={<Rag />} mouth={mechMouth} brows={fish ? "worry" : "none"}
            look={{ x: 0.9, y: 0.05 }} seed={2} />
          <Figure x={yx} y={y.y} scale={y.scale} facing={second && frame >= k.leave ? -1 : 1} pose={youPose} {...HERO} time={frame}
            mouth={second && frame >= k.fish ? "flat" : "none"} brows={looksUp ? "raised" : second && frame >= k.fish ? "flat" : "none"}
            lids={second && frame >= k.fish && frame < k.leave ? 0.4 : 0} look={looksUp ? { x: 0.7, y: -0.9 } : { x: 0.9, y: 0 }}
            held={second && frame >= k.fish ? <Wallet /> : undefined} />
          {second && (() => {
            const h = headOf(y.x, y.y, y.scale, youPose);
            return <Bubble frame={frame} at={k.tilt + 4} until={k.fish + 6} x={h.x + 40} y={h.y - h.r - 10} text="Say it again?" size={44} />;
          })()}
        </>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ the stairwell

const Envelope: React.FC = () => <rect x={-26} y={-16} width={52} height={34} rx={3} fill={PAPER} stroke={INK} strokeWidth={3} />;
const Keys: React.FC<{ frame: number }> = ({ frame }) => (
  <g transform={`rotate(${Math.sin(frame / 4) * 12})`}>
    <circle cx={0} cy={10} r={10} fill="none" stroke="#d9a63a" strokeWidth={4} />
    <rect x={-4} y={18} width={8} height={24} rx={3} fill="#d9a63a" />
  </g>
);
const ChocBar: React.FC = () => <rect x={-10} y={-24} width={20} height={36} rx={3} fill="#6b3f20" stroke={INK} strokeWidth={3} />;

const Stairwell: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  const S = STAIRS;
  const kidPose: Pose = frame >= k.lick && frame < k.three + 30
    ? { ...STAND, armF: reach(34, -22) }
    : { ...STAND, armF: [30, 40] };
  const kh = headOf(S.kid.x, S.kid.y, S.kid.scale, kidPose, 1);
  const mumLook = frame >= k.mumKid ? { x: 0.6, y: 0.7 } : frame >= k.mumYou ? { x: 1, y: -0.1 } : { x: 0.7, y: 0.5 };
  const holdRent = frame >= k.rent;
  const youPose: Pose = { ...STAND, armF: holdRent ? [70, 80] : [70, 30], tilt: -4 };
  const cam = camAt(frame, [
    [k.landlord - 6, { x: 1150, y: 560, zoom: 1.2 }], [k.landlordE, { x: 1150, y: 540, zoom: 1.26 }],
    [k.rent, { x: 860, y: 520, zoom: 1.2 }], [k.kid - 6, { x: 1250, y: 760, zoom: 1.75 }],
    [k.mumYou, { x: 1250, y: 760, zoom: 1.8 }], [k.three + 10, { x: 1000, y: 600, zoom: 1.12 }], [k.dusk, { x: 960, y: 560, zoom: 1.05 }],
  ]);
  return (
    <MoodStage mood="day" cam={drift(cam, frame, "stairs", 5)} back={<StairwellBack cam={cam} mood="day" frame={frame} />}
      actors={
        <>
          <Body {...S.landlord} facing={-1} pose={{ ...STAND, armF: [60, 40] }} head={LANDLORD.head} coat={LANDLORD.coat} frame={frame} id="landlord"
            count={{ base: 2, ticks: [k.landlordE] }} mouth={talk(frame, k.landlord, k.landlordE, "smirk")} look={{ x: 0.8, y: 0.6 }} held={<Keys frame={frame} />} seed={4} />
          <Body {...S.mum} facing={-1} head={MUM.head} coat={MUM.coat} frame={frame} id="mum" count={{ base: 1 }}
            look={mumLook} brows={frame >= k.mumKid ? "angry" : frame >= k.mumYou ? "raised" : "none"} mouth="flat" seed={6} />
          <Body {...S.kid} facing={1} pose={kidPose} head={KID.head} cap={KID.cap} frame={frame} id="kid" count={{ base: 2, ticks: [k.click3] }}
            mouth={talk(frame, k.kid, k.kidE, "smile")} look={{ x: -0.6, y: -0.6 }} held={frame < k.lick ? <ChocBar /> : undefined} seed={8} />
          {/* chocolate to the ears */}
          <ellipse cx={kh.x + 6 * S.kid.scale} cy={kh.y + 22 * S.kid.scale} rx={30 * S.kid.scale} ry={14 * S.kid.scale} fill="#6b3f20" opacity={0.85} />
          <circle cx={kh.x - 30 * S.kid.scale} cy={kh.y + 8 * S.kid.scale} r={7 * S.kid.scale} fill="#6b3f20" opacity={0.8} />
          <circle cx={kh.x + 36 * S.kid.scale} cy={kh.y + 10 * S.kid.scale} r={6 * S.kid.scale} fill="#6b3f20" opacity={0.8} />
          <Figure x={S.you.x} y={S.you.y} scale={S.you.scale} facing={1} pose={youPose} {...HERO} time={frame}
            look={frame < k.kid ? { x: 0.7, y: -0.8 } : { x: 0.9, y: 0.3 }} brows={holdRent ? "flat" : "none"} lids={holdRent ? 0.3 : 0}
            mouth="flat" held={<Envelope />} />
        </>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ the restaurant

const D = DINER;
const WineGlass: React.FC = () => (
  <g>
    <path d="M-14 -46 h28 q0 30 -14 36 q-14 -6 -14 -36Z" fill="#e9f3f4" opacity={0.85} stroke={INK} strokeWidth={3} />
    <path d="M-10 -34 h20 q-2 16 -10 20 q-8 -4 -10 -20Z" fill="#9b2335" />
    <line x1={0} y1={-10} x2={0} y2={12} stroke={INK} strokeWidth={3} />
  </g>
);

const Restaurant: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  const sit = (x: number, scale: number) => ({ x, y: seatedY(D.seatTop, scale), scale });
  const you = sit(D.you.x, D.you.scale);
  const date = sit(D.date.x, D.date.scale);
  const up = ramp(frame, k.straight, k.straight + 12);
  const datePose: Pose = { ...SEATED, drop: -10 * up, lean: -3 * up, armF: [60, 40] };
  const youLook = frame >= k.watch ? { x: 1, y: 0 }
    : frame >= k.lookOne && frame < k.daters ? { x: 0.8, y: -0.9 }
    : frame >= k.lookHim && frame < k.daters ? { x: 1, y: 0 }
    : frame >= k.lookPhoto && frame < k.daters ? { x: 0.6, y: 0.9 }
    : { x: 1, y: 0.1 };
  const w = sit(D.next.woman, D.next.scale);
  const m = sit(D.next.man, D.next.scale);
  const clink = ramp(frame, k.clink - 8, k.clink) * (1 - ramp(frame, k.clink + 14, k.clink + 26));
  const raise = (c: number): Pose => ({ ...SEATED, armF: [mix(110, 80, c), mix(40, 10, c)] });
  const watching = frame >= k.watch;
  const cam = camAt(frame, [
    [k.dusk - 4, { x: 960, y: 600, zoom: 1.3 }], [k.six - 8, { x: 1080, y: 600, zoom: 1.45 }],
    [k.sixE, { x: 1180, y: 580, zoom: 1.7 }], [k.daters, { x: 960, y: 600, zoom: 1.25 }],
    [k.inches - 4, { x: 1000, y: 600, zoom: 1.3 }], [k.everybody, { x: 1700, y: 600, zoom: 1.05 }],
    [k.woman - 4, { x: 2200, y: 610, zoom: 1.45 }], [k.manE, { x: 2200, y: 610, zoom: 1.5 }],
    [k.watch - 1, { x: 2200, y: 610, zoom: 1.5 }], [k.watch, { x: 1000, y: 600, zoom: 1.4 }], [k.fine + 60, { x: 960, y: 600, zoom: 1.28 }],
  ]);
  return (
    <MoodStage mood="dusk" cam={drift(cam, frame, "diner", 4)} back={<RestaurantBack cam={cam} mood="dusk" frame={frame} />}
      glows={[]}
      actors={
        <>
          <Body {...you} facing={1} pose={{ ...SEATED, armF: [70, 50] }} head={HERO.head} scarf={HERO.scarf} tuft frame={frame} id="you-diner"
            look={youLook} brows={frame >= k.lookOne && frame < k.daters ? "raised" : "none"} mouth={frame >= k.fine ? "smile" : "flat"} lids={watching ? 0.2 : 0} />
          <Body {...date} facing={-1} pose={datePose} head={DATE.head} coat={DATE.coat} frame={frame} id="date" count={{ base: 0, ticks: [k.click1] }}
            mouth={talk(frame, k.six, k.sixE, "smile")} look={watching ? { x: 1, y: 0.05 } : { x: 1, y: 0 }} brows={watching ? "flat" : "none"} seed={3} />
          <Body {...w} facing={1} pose={raise(clink)} head={WOMAN.head} coat={WOMAN.coat} frame={frame} id="woman" count={{ base: 0, ticks: [k.clickW] }}
            mouth={talk(frame, k.woman, k.womanE, "smile")} held={<WineGlass />} look={{ x: 1, y: 0 }} seed={5} />
          <Body {...m} facing={-1} pose={raise(clink)} head={MAN.head} coat={MAN.coat} frame={frame} id="man" count={{ base: 0, ticks: [k.clickM] }}
            mouth={talk(frame, k.man, k.manE, "smile")} held={<WineGlass />} look={{ x: 1, y: 0 }} seed={7} />
          <RestaurantTables frame={frame} nextGlasses={false} />
          {/* your phone face up on the table, his photo lit */}
          <g transform={`translate(${D.phone.x} ${D.phone.y})`}>
            <path d="M-40 0 L-30 -14 H40 L30 0Z" fill="#1b1d24" />
            <path d="M-34 -2 L-27 -12 H34 L27 -2Z" fill="#cfe9f4" />
          </g>
        </>
      } />
  );
};

/** INSERT: your phone on the tablecloth, his profile photo: a man a head taller than the one in the chair. */
const PhoneInsert: React.FC<{ frame: number; k: K }> = ({ frame, k }) => {
  const cam: Camera = { x: 960, y: 560, zoom: mix(1, 1.08, ramp(frame, k.photo, k.chair)) };
  return (
    <MoodStage mood="dusk" cam={cam}
      back={
        <Deep cam={cam} depth={0.9} flat>
          <rect x={-1400} y={-800} width={4800} height={2400} fill="#efe3c8" />
          {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-1400 + i * 160} y1={-800} x2={-1400 + i * 160} y2={1600} stroke="#e2d2b0" strokeWidth={8} />)}
          <circle cx={1500} cy={260} r={160} fill="#ffcf5a" opacity={0.25} />
        </Deep>
      }
      actors={
        <g transform="translate(960 560) rotate(-6)">
          <rect x={-200} y={-380} width={400} height={760} rx={48} fill="#1b1d24" stroke={INK} strokeWidth={6} />
          <rect x={-178} y={-340} width={356} height={680} rx={18} fill="#f5d7c4" />
          <clipPath id="say-photo"><rect x={-178} y={-340} width={356} height={600} rx={18} /></clipPath>
          <g clipPath="url(#say-photo)">
            <rect x={-178} y={-340} width={356} height={600} fill="#8fd0e4" />
            <rect x={-178} y={120} width={356} height={140} fill="#7fc29b" />
            <Figure x={0} y={240} scale={1.62} facing={1} pose={{ ...STAND, armF: [30, 60], tilt: 6 }} head={DATE.head} coat={DATE.coat}
              mouth="smile" look={{ x: 0, y: 0 }} brows="raised" />
          </g>
          <rect x={-150} y={278} width={180} height={18} rx={9} fill={INK} opacity={0.6} />
          <circle cx={130} cy={300} r={26} fill="#d8344f" />
          <path d="M118 300 l9 9 l14 -16" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
        </g>
      } />
  );
};

const Component: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = cues(shot);
  const f = shot.frame;
  const on = current(f, [
    [shot.from, "g1"], [k.second - 2, "g2"], [k.landlord - 6, "stairs"], [k.dusk - 4, "diner"], [k.photo, "photo"],
    [k.chair, "diner"], [k.inches, "photo"], [k.everybody, "diner"],
  ] as [number, "g1" | "g2" | "stairs" | "diner" | "photo"][]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {on === "g1" && <Garage frame={f} k={k} second={false} />}
      {on === "g2" && <Garage frame={f} k={k} second />}
      {on === "stairs" && <Stairwell frame={f} k={k} />}
      {on === "diner" && <Restaurant frame={f} k={k} />}
      {on === "photo" && <PhoneInsert frame={f} k={k} />}
    </AbsoluteFill>
  );
};

export const sayItAgain: Beat = { id: "SayItAgain", first: "Lunch. Your car's", lead: 0.3, Component };
