// "The first jump", lines 27-31: Dev. The platform (sets/Metro.tsx, view "platform"): the train pulls in, Dev leans
// out of the open door, "Saved it. Hurry up.", you run. The car (view "car"): the window seat, one paper cup of chai
// passed between you; over his shoulder your phone with the message half typed; "Just send it, yaar."; you lock it; he
// shrugs, writes you the first line anyway, tears the page out and tucks it in your scarf.
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { runPose, STAND } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, ForegroundHead, insert } from "@whatif/kit/stage/shots";
import { INK, PAPER, TEAL } from "@whatif/kit/theme";
import { headAt, Headphones } from "../parts";
import { CHAIR_SIT, HandPhone, handAt, PhoneTop, seatedY } from "../parts2";
import { blinking, camAt, current, DEV, HERO, mix, ramp } from "../shared";
import { MetroBack, MetroFront, METRO_CAR, METRO_PLATFORM } from "../sets/Metro";
import { aimed, NotePage, talk, type T } from "./FirstJump.Times";

const S = 1.15;
const C = 1.1;

/** Dev: pale green head, headphones round his neck. */
const Dev: React.FC<{ b: { x: number; y: number; scale: number; facing: 1 | -1; pose: typeof STAND }; face: object; frame: number; held?: React.ReactNode }> = ({ b, face, frame, held }) => (
  <>
    <Figure x={b.x} y={b.y} scale={b.scale} facing={b.facing} pose={b.pose} head={DEV.head} coat={DEV.coat} {...face} blink={blinking(frame, 7)} time={frame} held={held} />
    <Headphones x={b.x} y={b.y} scale={b.scale} pose={b.pose} facing={b.facing} />
  </>
);

// ------------------------------------------------------------------------------------------------ the platform (27-28)

export const PlatformShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const c = k.clips;
  const shot = current(frame, [[k.platform, "wide"], [k.devClose, "dev"], [k.youClose, "you"], [k.saved, "saved"]]);
  const arrive = ramp(frame, k.platform, k.platform + 45);
  const doorOpen = ramp(frame, k.platform + 44, k.platform + 56);
  const train = mix(2600, 0, arrive);
  // Dev: leans out of the open door, one arm back inside on the seat he saved, the other waving you in.
  const out = ramp(frame, k.platform + 50, k.platform + 64);
  const wave = Math.sin(frame / 4) * 18;
  const d = METRO_PLATFORM.door;
  const dev = aimed(d.x, d.y, 1.0, -1, { ...STAND, lean: 16 * out },
    out > 0 ? { x: d.x - 120, y: d.y - 250 + (frame >= k.saved ? wave : 0) } : null, { x: d.x + 110, y: d.y - 120 });
  const devHead = headAt(dev.x, dev.y, 1.0, dev.pose, -1);
  const dFace = { brows: "raised" as const, lids: 0, mouth: talk(frame, c[28], "smile", "open", "smile"), eyes: 1.05, look: { x: 0.9, y: 0.15 } };
  // You: waiting on the platform, phone in hand; you see him and grin; on "Hurry up" you run for the door.
  const run = ramp(frame, k.run, k.car);
  const youX = mix(640, 1140, run);
  const you = { x: youX, y: METRO_PLATFORM.floor, scale: S, facing: 1 as const, pose: run > 0 && run < 1 ? runPose(frame * 0.45) : STAND };
  const youHead = headAt(you.x, you.y, S, you.pose);
  const yFace = shot === "wide" ? { ...EXPRESSIONS.neutral, look: { x: 0.9, y: 0.1 } }
    : { ...EXPRESSIONS.happy, brows: "raised" as const, look: { x: 0.95, y: -0.3 } };
  const actors = (
    <>
      {train === 0 && out > 0 && <Dev b={dev} face={dFace} frame={frame} />}
      <Figure {...HERO} {...you} {...yFace} blink={blinking(frame, 1)} time={frame} flow={run > 0 ? 0.6 : 0.1}
        held={run === 0 ? <HandPhone frame={frame} scale={S} lit={false} /> : undefined} />
    </>
  );
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.platform, { x: 960, y: 560, zoom: 1.0 }], [k.devClose, { x: 1000, y: 580, zoom: 1.12 }]]),
    dev: camAt(frame, [[k.devClose, closeUp(devHead.x - 40, devHead.y + 10, 2.5)], [k.youClose, closeUp(devHead.x - 40, devHead.y + 10, 2.75)]]),
    you: camAt(frame, [[k.youClose, closeUp(youHead.x + 80, youHead.y, 2.5)], [k.saved, closeUp(youHead.x + 80, youHead.y, 2.7)]]),
    saved: camAt(frame, [[k.saved, { x: 1000, y: 620, zoom: 1.3 }], [k.car, { x: 1080, y: 620, zoom: 1.35 }]]),
  };
  const cam = drift(cams[shot], frame, "platform", 3);
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<MetroBack cam={cam} view="platform" frame={frame} train={train} doorOpen={doorOpen} />} actors={actors} />;
};

// ------------------------------------------------------------------------------------------------ the car (29-31)

const YOU_X = 1500;
const DEV_X = 1290;
/** The paper cup of chai, centred; `tilt` tips it for a sip. */
const Cup: React.FC<{ x: number; y: number; tilt?: number; frame: number }> = ({ x, y, tilt = 0, frame }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
    {tilt === 0 && [0, 1].map((i) => {
      const p = ((frame / 40 + i / 2) % 1);
      return <circle key={i} cx={Math.sin(frame / 9 + i) * 4} cy={-30 - p * 50} r={6 + p * 8} fill={PAPER} opacity={0.6 * (1 - p)} />;
    })}
    <path d="M-15 -22 H15 L11 22 H-11Z" fill={PAPER} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    <rect x={-13} y={-6} width={26} height={9} fill={TEAL} />
  </g>
);

export const CarShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const c = k.clips;
  const shot = current(frame, [[k.car, "seat"], [k.ots, "ots"], [k.yaar, "yaar"], [k.lock, "help"], [k.note, "note"]]);
  if (shot === "ots") return <OverShoulder frame={frame} k={k} />;
  const seatY = seatedY(METRO_CAR.seat.y, C);
  const yHead0 = headAt(YOU_X, seatY, C, CHAIR_SIT, -1);
  const dHead0 = headAt(DEV_X, seatY, C, CHAIR_SIT, 1);
  // The cup: in Dev's hand, across to yours, a sip, back, his sip, then set down on the bench beside him.
  const mid = { x: (YOU_X + DEV_X) / 2, y: 800 };
  const yourMouth = { x: yHead0.x - 44, y: yHead0.y + 34 };
  const hisMouth = { x: dHead0.x + 44, y: dHead0.y + 34 };
  const cupKeys: [number, { x: number; y: number }][] = [
    [k.car, { x: DEV_X + 60, y: 800 }], [k.cup, { x: DEV_X + 60, y: 800 }], [k.cup + 8, mid], [k.cup + 16, yourMouth], [k.cup + 24, yourMouth],
    [k.cup + 30, mid], [k.cup + 36, hisMouth], [k.cup + 44, hisMouth], [k.cup + 50, { x: DEV_X + 50, y: 820 }],
  ];
  const cupAt = camAt(frame, cupKeys.map(([f, p]) => [f, { ...p, zoom: 1 }]));
  const yoursCup = frame >= k.cup + 8 && frame < k.cup + 30;
  const sipping = (frame >= k.cup + 16 && frame < k.cup + 24) || (frame >= k.cup + 36 && frame < k.cup + 44);
  const cupShown = frame < k.yaar;
  // Dev's hands: the cup; a nudge at your phone on "yaar"; a shrug; the notebook, the pen, the page, the tuck.
  const writing = frame >= k.write && frame < k.tear;
  const tucking = ramp(frame, k.tuck, k.tuck + 12);
  const book = { x: DEV_X + 70, y: 815 };
  const neck = { x: yHead0.x + 14, y: yHead0.y + 104 };
  const shrug = frame >= k.shrug && frame < k.write;
  const devFront = shot === "seat" ? (yoursCup ? null : cupAt)
    : shot === "yaar" ? { x: YOU_X - 90, y: 760 }
      : shrug ? { x: DEV_X + 80, y: 690 }
        : writing ? { x: book.x + 8 + Math.sin(frame / 2) * 8, y: book.y - 8 }
          : frame >= k.tear ? { x: mix(book.x + 20, neck.x - 20, tucking), y: mix(book.y - 30, neck.y, tucking) } : null;
  const devBack = shrug ? { x: DEV_X + 40, y: 700 } : frame >= k.write - 6 && frame < k.tuck ? book : null;
  const dev = aimed(DEV_X, seatY, C, 1, { ...CHAIR_SIT, lean: 22 * tucking * (1 - ramp(frame, k.tuck + 16, k.tuck + 24)), tilt: shrug ? 8 : 0 }, devFront, devBack);
  const dFace = shot === "seat" ? { ...EXPRESSIONS.happy, look: { x: 0.9, y: sipping && !yoursCup ? -0.2 : 0.1 } }
    : shot === "yaar" ? { brows: "raised" as const, lids: 0.15, mouth: talk(frame, c[30], "smirk", "open", "smirk"), eyes: 1, look: { x: 0.9, y: 0.1 } }
      : shrug ? { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1.05, look: { x: 0.9, y: 0 } }
        : writing ? { brows: "flat" as const, lids: 0.35, mouth: "smirk" as const, eyes: 1, look: { x: 0.6, y: 0.9 } }
          : { ...EXPRESSIONS.happy, look: { x: 0.9, y: 0.1 } };
  // You: the window seat; the cup to your lips; then the phone in your hand, the message half typed; you lock it and
  // look away out of the window; the page ends up in your scarf.
  const phoneOn = frame >= k.cup + 44;
  const locked = frame >= k.lock;
  const you = aimed(YOU_X, seatY, C, -1, CHAIR_SIT,
    yoursCup ? cupAt : phoneOn ? { x: YOU_X - 70, y: locked ? 830 : 760 } : null,
    { x: YOU_X - 30, y: 850 });
  const yFace = shot === "seat" ? { ...EXPRESSIONS.happy, lids: sipping && yoursCup ? 0.6 : 0, look: { x: 0.9, y: 0.1 } }
    : shot === "yaar" ? { ...EXPRESSIONS.worried, mouth: "flat" as const, look: { x: 0.5, y: 0.8 } }
      : shot === "note" ? { brows: "raised" as const, lids: 0.2, mouth: "smile" as const, eyes: 1, look: { x: 0.2, y: 0.95 } }
        : { brows: "flat" as const, lids: 0.3, mouth: "flat" as const, eyes: 1, look: { x: -0.8, y: -0.2 } };
  const page = frame >= k.tear ? (tucking < 1 ? { x: mix(book.x + 20, neck.x, tucking), y: mix(book.y - 30, neck.y, tucking), tilt: -10 } : { ...neck, tilt: 18 }) : null;
  const actors = (
    <>
      <Dev b={dev} face={dFace} frame={frame} />
      {frame >= k.write - 6 && frame < k.tuck + 14 && (
        <g transform={`translate(${handAt(dev, "back").x} ${handAt(dev, "back").y})`}>
          <rect x={-40} y={-10} width={80} height={56} rx={4} fill="#d8344f" stroke={INK} strokeWidth={3} />
          <rect x={-34} y={-14} width={70} height={52} rx={3} fill={PAPER} stroke={INK} strokeWidth={2} />
        </g>
      )}
      {writing && <line x1={handAt(dev).x} y1={handAt(dev).y} x2={handAt(dev).x + 6} y2={handAt(dev).y - 30} stroke={INK} strokeWidth={5} strokeLinecap="round" />}
      <Figure {...HERO} x={you.x} y={you.y} scale={C} facing={-1} pose={you.pose} {...yFace} blink={blinking(frame, 1)} time={frame}
        held={phoneOn && !yoursCup ? <HandPhone frame={frame} scale={C} lit={!locked} /> : undefined} />
      {page && <NotePage x={page.x} y={page.y} scale={C * 0.9} tilt={page.tilt} />}
      {cupShown && <Cup x={cupAt.x} y={cupAt.y} tilt={sipping ? (yoursCup ? 40 : -40) : 0} frame={frame} />}
      {!cupShown && <Cup x={DEV_X - 150} y={METRO_CAR.seat.y - 22} frame={frame} />}
    </>
  );
  const two = { x: (YOU_X + DEV_X) / 2, y: 700, zoom: 1.8 };
  const cams: Record<Exclude<typeof shot, "ots">, Camera> = {
    seat: camAt(frame, [[k.car, { ...two, zoom: 1.6 }], [k.cup, two], [k.ots, { ...two, zoom: 1.9 }]]),
    yaar: camAt(frame, [[k.yaar, { x: dHead0.x + 60, y: dHead0.y + 30, zoom: 2.4 }], [k.lock, { x: dHead0.x + 70, y: dHead0.y + 30, zoom: 2.55 }]]),
    help: camAt(frame, [[k.lock, { ...two, zoom: 1.75 }], [k.note, { ...two, x: two.x + 20, zoom: 1.95 }]]),
    note: camAt(frame, [[k.note, insert(neck.x, neck.y + 6, 3.6)], [k.office, insert(neck.x, neck.y + 6, 3.9)]]),
  };
  const cam = drift(cams[shot], frame, "car", shot === "note" ? 1.5 : 3);
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<MetroBack cam={cam} view="car" frame={frame} outside="day" speed={5} />}
      actors={actors} front={<MetroFront cam={cam} view="car" />} />
  );
};

/** Over Dev's shoulder: your phone in your lap, the message to the boss half typed, the cursor blinking. */
const OverShoulder: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.ots, { x: 980, y: 560, zoom: 1.0 }], [k.yaar, { x: 990, y: 560, zoom: 1.1 }]]), frame, "ots", 2);
  const back = (
    <g>
      <rect x={-1400} y={-1400} width={4800} height={4000} fill="#4f82a0" />
      <rect x={-1400} y={820} width={4800} height={900} fill="#3b3e47" />
      <path d="M400 1100 Q500 760 960 760 Q1420 760 1520 1100Z" fill={INK} />
      <path d="M1180 -200 Q1240 300 1220 700" fill="none" stroke={TEAL} strokeWidth={60} strokeLinecap="round" />
    </g>
  );
  return (
    <>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={back}
        actors={<PhoneTop x={980} y={560} scale={1.0} frame={frame} typed={0.5} seed={29} thumb={{ x: 0.7, y: 0.2 }} />} />
      <ForegroundHead x={250} side="left" blur={16} />
    </>
  );
};
