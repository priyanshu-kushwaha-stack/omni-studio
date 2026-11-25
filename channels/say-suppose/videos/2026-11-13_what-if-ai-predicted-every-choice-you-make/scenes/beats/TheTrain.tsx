// Beat "The Train" (script.md, ## [09:55] The Train; narration lines 100-109). Morning, a month on.
//
//   100   the stall (sets/FoodCourt, open): the landlord hands your best friend an envelope; he opens it under his
//         crimson UNPREDICTABLE card and doesn't look up at it
//   101   "Full rent." (the landlord's voice), close: the landlord looks up at the card
//   102   your card, crimson, UNPREDICTABLE; the coffee stall, her board on 3.00; she looks at your card, then at you
//   103   "Full price. Same?" (her voice): she pours anyway
//   104   the morning train (library metroCoach): two crimson cards in the middle of a bench of phones and teal cards;
//         the wide: the passengers either side shift down the bench without looking up; the fare board ticks down
//   +     the 6 s performed hold: his hand slides out, palm up, grin; you drop the key into it without looking (the
//         hands insert); his fingers close; he grins at the side of your face; you watch the city go past
//   105   "Trust me?" (his voice), the key in his fist
//   106   you, never looking up, the crimson card at the top of the frame
//   107   across the aisle, the kid with the cap, feet swinging, no phone, a BLANK card; he catches you looking; winks
//   108   your phone (library phone set): a video playing, another queued under it, your thumb over the screen
//   109   the thumb, the screen, the crimson card at the top; then the 4 s end card: like, subscribe and comment tags
//         in the left two-thirds, the right third quiet
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "../master";
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { HandPhone, metroCoach, phone } from "@whatif/kit/sets";
import { LookContext } from "@whatif/kit/stage/Look";
import { setLook } from "@whatif/kit/sets/common";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { BoardSounds, RateBoard, Tag, TagSounds, type BoardKey, type TagKey } from "../device";
import { Apron, headAt, lineAt } from "../kit";
import { blinking, camAt, COFFEE, current, FRIEND, HERO, KID, LANDLORD, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { COURT, CoffeeCounter, FoodCourtBack, foodCourtLights, StallCounter } from "../sets/FoodCourt";
import { BrassKey } from "./TheKey.Frame";
import { Hands } from "./TheKey.Hands";
import { BenchClose, EndTags, Passenger, PHONE_SIT, Queued, SEAT_S, SEAT_Y, Wink } from "./TheTrain.Parts";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  const hold = lineEnd(clips, 104);
  return {
    at,
    start: from(100), // "A month later.": the stall, the envelope
    open: from(100) + 14,
    landlord: from(101), // "Full rent."
    yourCard: from(102), // "Your tag, crimson for thirty days."
    coffee: at(102, 0.45),
    glance: at(102, 0.75), // she looks at your card, then at you
    pour: from(103), // "Full price. Same?"
    train: from(104), // "The train.": the two crimson cards in the middle
    coach: at(104, 0.32), // "Every head on its phone ..."
    shift: at(104, 0.72), // "People shift down the bench."
    hold, // the 6 s hold: his hand slides out, palm up
    drop: hold + 40, // the hands insert: you drop the key in without looking
    fall: hold + 50,
    close: hold + 64,
    grin: hold + 90, // he grins at the side of your face
    window: hold + 134, // you watch the city go past
    trust: from(105), // "Trust me?"
    never: from(106), // "You never look up."
    kid: from(107), // "Across the aisle, the kid with the cap."
    look: at(107, 0.4), // you glance across
    winkShot: at(107, 0.6),
    wink: at(107, 0.86), // "He winks."
    phoneWide: from(108), // "Your phone's in your hand."
    phone: at(108, 0.22),
    pick: at(108, 0.66), // "It's picking your next one now."
    thumb: at(108, 0.86), // "Watch your thumb."
    last: from(109), // "So, would you take the discount? ..."
    card: lineEnd(clips, 109), // the end card
    end: to,
  };
}

const crimson = (from: number): TagKey[] => [{ at: from, text: "UNPREDICTABLE", pct: null, state: "crimson" }];

// ------------------------------------------------------------------------------------------------ the stall and the coffee

const S = COURT.scale;

/** An envelope with the landlord's grey seal, in a hand (figure units). */
const Envelope: React.FC<{ open?: boolean }> = ({ open }) => (
  <g transform="rotate(-12) translate(-10 -30)">
    <rect x={-34} y={-22} width={68} height={44} rx={4} fill="#f3e9d7" stroke="#23252b" strokeWidth={4} />
    {open ? <path d="M-34 -22 L0 -44 L34 -22" fill="#e8dcc4" stroke="#23252b" strokeWidth={4} /> : <path d="M-34 -22 L0 2 L34 -22" fill="none" stroke="#23252b" strokeWidth={3} />}
    <circle cx={0} cy={6} r={8} fill={LANDLORD.head} />
  </g>
);

/** The stall, morning: your best friend behind the counter under his crimson card, you beside him, the landlord at the
 *  front with the envelope. */
const StallShot: React.FC<{ frame: number; k: T; cam: Camera; clips: Clip[] }> = ({ frame, k, cam, clips }) => {
  const handed = frame >= k.open;
  const fh = headAt(COURT.friend.x, COURT.floor, S, STAND, -1);
  const yh = headAt(COURT.you.x, COURT.floor, S, STAND, 1);
  const speaking = frame >= k.landlord && frame < lineEnd(clips, 101) && Math.floor((frame - k.landlord) / 5) % 2 === 0;
  const himPose: Pose = { ...STAND, armF: handed ? [55, 75] : [20, 20], armB: handed ? [40, 80] : [-7, 8] };
  const lPose: Pose = { ...STAND, armF: handed ? [20, 20] : [80, 10] };
  const actors = (
    <>
      <Figure x={COURT.you.x} y={COURT.floor} scale={S} facing={1} pose={STAND} {...HERO} brows="none" lids={0.2} mouth="smile" look={{ x: 1, y: 0.2 }} time={frame} blink={blinking(frame, 1)} />
      <Figure x={COURT.friend.x} y={COURT.floor} scale={S} facing={-1} pose={himPose} head={FRIEND.head} coat={FRIEND.coat} brows="flat" lids={0.3}
        mouth={frame >= k.landlord ? "smirk" : "flat"} look={{ x: 0.3, y: 0.9 }} time={frame} blink={blinking(frame, 2)} held={handed ? <Envelope open /> : undefined} />
      <Apron b={{ x: COURT.friend.x, y: COURT.floor, scale: S, facing: -1, pose: himPose }} />
      <Tag frame={frame} x={fh.x} headY={fh.y} r={fh.r} scale={0.6} keys={crimson(k.start - 400)} />
      <Tag frame={frame} x={yh.x} headY={yh.y} r={yh.r} scale={0.6} keys={crimson(k.start - 400)} />
      <StallCounter />
      <Figure x={COURT.customer.x} y={COURT.customer.y} scale={S} facing={-1} pose={lPose} head={LANDLORD.head} coat={LANDLORD.coat} tie={LANDLORD.tie}
        brows={frame >= k.landlord ? "raised" : "flat"} lids={0.2} mouth={speaking ? "open" : "flat"} eyes={frame >= k.landlord ? 1.1 : 1}
        look={frame >= k.landlord ? { x: 0.5, y: -0.9 } : { x: 1, y: 0.2 }} time={frame} blink={blinking(frame, 6)} held={handed ? undefined : <Envelope />} />
    </>
  );
  return (
    <LookContext.Provider value={setLook(foodCourtLights, "morning", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<FoodCourtBack cam={cam} mood="morning" frame={frame} />} actors={actors} />
    </LookContext.Provider>
  );
};

/** You at the coffee stall: her board on 3.00, your crimson card; she looks at it, then at you, and pours anyway. */
const CoffeeShot: React.FC<{ frame: number; k: T; cam: Camera; clips: Clip[] }> = ({ frame, k, cam, clips }) => {
  const you = { x: 1290, y: COURT.customer.y };
  const yh = headAt(you.x, you.y, S, STAND, 1);
  const pour = ramp(frame, k.pour + 6, k.pour + 22);
  const fill = ramp(frame, k.pour + 16, k.pour + 46);
  const speaking = frame >= k.pour && frame < lineEnd(clips, 103) && Math.floor((frame - k.pour) / 5) % 2 === 0;
  const herLook = frame < k.glance ? { x: 0.9, y: -0.6 } : { x: 1, y: 0.05 };
  const herPose: Pose = { ...STAND, armF: [mix(30, 95, pour), mix(30, -10, pour)] };
  const kettle = (
    <g transform={`rotate(${-pour * 35}) translate(-20 -20)`}>
      <rect x={-18} y={-30} width={46} height={60} rx={10} fill="#c0c4cc" stroke="#23252b" strokeWidth={4} />
      <path d="M28 -14 l22 -14" stroke="#23252b" strokeWidth={6} strokeLinecap="round" />
    </g>
  );
  const cup = { x: 1520, y: COURT.coffee.top };
  const actors = (
    <>
      <Figure x={COURT.coffee.seller.x} y={COURT.coffee.seller.y} scale={S} facing={-1} pose={herPose} head={COFFEE.head} coat={COFFEE.coat}
        brows={frame < k.glance ? "flat" : "raised"} lids={frame < k.glance ? 0.35 : 0.1} mouth={speaking ? "open" : frame > k.pour + 30 ? "smirk" : "flat"}
        look={herLook} time={frame} blink={blinking(frame, 9)} held={frame >= k.pour ? kettle : undefined} />
      <RateBoard frame={frame} x={COURT.priceBoard.x} y={COURT.priceBoard.y} size={56} keys={[{ at: k.start - 400, value: "3.00" }]} />
      <CoffeeCounter />
      <g>
        <path d={`M${cup.x - 26} ${cup.y} L${cup.x - 22} ${cup.y - 70} H${cup.x + 22} L${cup.x + 26} ${cup.y}Z`} fill="#f3e9d7" stroke="#23252b" strokeWidth={5} />
        <rect x={cup.x - 21} y={cup.y - 6 - 56 * fill} width={42} height={56 * fill} fill="#6b4a32" opacity={0.9} />
        {pour > 0.5 && fill < 1 && <line x1={cup.x + 4} y1={cup.y - 150} x2={cup.x + 2} y2={cup.y - 10} stroke="#6b4a32" strokeWidth={8} />}
      </g>
      <Figure x={you.x} y={you.y} scale={S} facing={1} pose={STAND} {...HERO} brows="none" lids={0.15} mouth={frame > k.pour + 30 ? "smile" : "flat"}
        look={{ x: 1, y: 0.1 }} time={frame} blink={blinking(frame, 1)} />
      <Tag frame={frame} x={yh.x} headY={yh.y} r={yh.r} scale={0.6} keys={crimson(k.start - 400)} />
    </>
  );
  return (
    <LookContext.Provider value={setLook(foodCourtLights, "morning", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<FoodCourtBack cam={cam} mood="morning" frame={frame} />} actors={actors} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ the train

/** Where everyone sits: you and him in the middle of the bench, phones either side. */
const YOU_X = 800;
const HIM_X = 965;
const PASSENGERS = [-280, -70, 140, 360, 580, 1185, 1405, 1625, 1845, 2065];

/** Every card ticks together; the fare board ticks down with them. */
const tickTimes = (k: T) => [k.train + 30, k.coach + 20, k.shift + 40, k.hold + 60, k.hold + 150];
const fareKeys = (k: T): BoardKey[] => [
  { at: k.start - 400, value: "1.70" }, ...tickTimes(k).map((at, i) => ({ at, value: ["1.60", "1.50", "1.40", "1.30", "1.20"][i] })),
];

/** How far each passenger has moved down the bench, away from the two crimson cards. */
const shifted = (x: number, frame: number, k: T) => {
  const t = ramp(frame, k.shift, k.shift + 26);
  const away = x < YOU_X ? -1 : 1;
  const near = Math.abs(x - (YOU_X + HIM_X) / 2) < 320 ? 80 : Math.abs(x - (YOU_X + HIM_X) / 2) < 560 ? 40 : 0;
  return x + away * near * t;
};

/** Your seated pose: facing away from him toward the window's light, the back hand out behind you for the key. */
function yourPose(frame: number, k: T): Pose {
  const give = ramp(frame, k.hold + 24, k.hold + 40) * (1 - ramp(frame, k.close + 8, k.close + 26));
  return { ...SEATED, armB: [mix(10, -55, give), mix(25, -30, give)] };
}
function hisPose(frame: number, k: T): Pose {
  const out = ramp(frame, k.hold + 2, k.hold + 22);
  return { ...SEATED, armF: [mix(25, 78, out), mix(35, -18, out)] };
}

const Coach: React.FC<{ frame: number; k: T; cam: Camera; clips: Clip[]; youLook?: { x: number; y: number }; youPhone?: boolean }> = ({
  frame, k, cam, clips, youLook = { x: 0.7, y: -0.25 }, youPhone = false,
}) => {
  const ticks = tickTimes(k);
  const yp = youPhone ? PHONE_SIT : yourPose(frame, k);
  const hp = hisPose(frame, k);
  const yh = headAt(YOU_X, SEAT_Y, SEAT_S, yp, -1);
  const hh = headAt(HIM_X, SEAT_Y, SEAT_S, hp, -1);
  const fist = frame >= k.close;
  const speaking = frame >= k.trust && frame < lineEnd(clips, 105) && Math.floor((frame - k.trust) / 5) % 2 === 0;
  const grinning = frame >= k.hold + 6;
  const actors = (
    <>
      {PASSENGERS.map((x, i) => (
        <Passenger key={x} frame={frame} x={shifted(x, frame, k)} i={i} facing={i % 2 ? 1 : -1} ticks={ticks} from={k.start - 400} />
      ))}
      <Figure x={YOU_X} y={SEAT_Y} scale={SEAT_S} facing={-1} pose={yp} {...HERO} brows="none" lids={0.15} mouth="smile" eyes={1}
        look={youLook} time={frame} blink={blinking(frame, 1)} held={youPhone ? <HandPhone lit scale={1.1} /> : undefined} />
      <Figure x={HIM_X} y={SEAT_Y} scale={SEAT_S} facing={-1} pose={hp} head={FRIEND.head} coat={FRIEND.coat} brows={grinning ? "raised" : "none"} lids={0.1}
        mouth={speaking ? "open" : grinning ? "smile" : "flat"} eyes={1.05} look={{ x: 0.9, y: -0.15 }} time={frame} blink={blinking(frame, 2)}
        held={fist ? <BrassKey x={0} y={-6} scale={0.22} rotate={30} glint={0} /> : undefined} />
      <Tag frame={frame} x={yh.x} headY={yh.y} r={yh.r} scale={0.75} threadTop={75} keys={crimson(k.start - 400)} />
      <Tag frame={frame} x={hh.x} headY={hh.y - 70} r={hh.r} scale={0.75} threadTop={75} keys={crimson(k.start - 400)} />
      <RateBoard frame={frame} x={1760} y={120} size={40} label="FARE" keys={fareKeys(k)} />
    </>
  );
  const props = { cam, mood: "morning" as const, frame, options: { ...metroCoach.defaults, speed: 7 } };
  return (
    <LookContext.Provider value={setLook(metroCoach.lights(props.options), "morning", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={metroCoach.Back(props)} actors={actors} front={metroCoach.Front?.(props)} />
    </LookContext.Provider>
  );
};

/** The hands insert on the train: you drop the key into his open palm without looking; his fingers close. */
const DropShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = drift(camAt(frame, [[k.drop, { x: 960, y: 560, zoom: 1.0 }], [k.grin, { x: 960, y: 580, zoom: 1.1 }]]), frame, "drop", 3);
  const fall = Math.pow(ramp(frame, k.fall, k.fall + 10), 2);
  const you = { x: 760, y: 470, curl: mix(0.4, 0, ramp(frame, k.fall - 6, k.fall + 2)), down: true };
  const him = { x: 1060, y: 760, curl: ramp(frame, k.close, k.close + 14) * 0.85 };
  const key = { x: mix(860, 990, fall), y: mix(520, 740, fall), rotate: mix(-30, 10, fall), scale: 1.4 };
  return (
    <LookContext.Provider value={setLook([], "morning", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<BenchClose frame={frame} />} actors={<Hands you={you} him={him} keyAt={key} himDrop={240} />} />
    </LookContext.Provider>
  );
};

/** Across the aisle: the kid with the cap, feet swinging, no phone, a blank card; he catches you looking, and winks. */
const KidShot: React.FC<{ frame: number; k: T; cam: Camera }> = ({ frame, k, cam }) => {
  const kx = 960;
  const swing = Math.sin(frame / 7) * 22;
  const pose: Pose = { ...SEATED, armF: [20, 30], legF: [92, -92 + swing], legB: [88, -88 - swing] };
  const caught = frame >= k.winkShot + 10;
  const look = caught ? { x: 0.2, y: 0.05 } : { x: 0.9, y: -0.3 };
  const kh = headAt(kx, SEAT_Y, SEAT_S, pose, -1);
  const winking = frame >= k.wink && frame < k.wink + 16;
  const ticks = tickTimes(k);
  const actors = (
    <>
      {[400, 620, 1300, 1520].map((x, i) => <Passenger key={x} frame={frame} x={x} i={i + 3} facing={i % 2 ? -1 : 1} ticks={ticks} from={k.start - 400} />)}
      <Figure x={kx} y={SEAT_Y} scale={SEAT_S} facing={-1} pose={pose} head={KID.head} coat={KID.coat} cap={KID.cap}
        brows={caught ? "raised" : "none"} mouth={caught ? "smirk" : "flat"} eyes={1.05} look={look} time={frame} blink={blinking(frame, 4) && !winking} />
      {winking && <Wink x={kx} y={SEAT_Y} scale={SEAT_S} facing={-1} pose={pose} head={KID.head} look={look} />}
      <Tag frame={frame} x={kh.x} headY={kh.y} r={kh.r} scale={0.75} threadTop={75} keys={[{ at: k.start - 400, text: "", pct: null, state: "blank" }]} />
    </>
  );
  const props = { cam, mood: "morning" as const, frame, options: { ...metroCoach.defaults, speed: 7 } };
  return (
    <LookContext.Provider value={setLook(metroCoach.lights(props.options), "morning", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={metroCoach.Back(props)} actors={actors} />
    </LookContext.Provider>
  );
};

/** Your phone close: the feed playing, the next one queued under it, your thumb over the screen, your crimson card at
 *  the top of the frame. */
const PhoneShot: React.FC<{ frame: number; k: T; cam: Camera }> = ({ frame, k, cam }) => {
  const hover = ramp(frame, k.phone, k.thumb + 30);
  const options = { ...phone.defaults, mode: "feed" as const, behind: "metro" as const, thumb: mix(0.72, 0.5, hover) };
  const props = { cam, mood: "morning" as const, frame, options };
  const actors = (
    <>
      {phone.Mid?.(props)}
      <Queued frame={frame} pick={k.pick} />
      <Tag frame={frame} x={1560} headY={450} r={60} scale={1.1} threadTop={-600} keys={crimson(k.start - 400)} />
    </>
  );
  return (
    <LookContext.Provider value={setLook(phone.lights(options), "morning", cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={phone.Back(props)} actors={actors} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ the beat

type ShotName = "stall" | "landlord" | "yourCard" | "coffee" | "pour" | "cards" | "coach" | "hand" | "drop" | "grin" | "window" | "trust" | "never"
  | "kid" | "look" | "wink" | "phoneWide" | "phone" | "last" | "card";

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const on = current<ShotName>(frame, [[0, "stall"], [k.landlord, "landlord"], [k.yourCard, "yourCard"], [k.coffee, "coffee"], [k.pour, "pour"],
    [k.train, "cards"], [k.coach, "coach"], [k.hold, "hand"], [k.drop, "drop"], [k.grin, "grin"], [k.window, "window"], [k.trust, "trust"],
    [k.never, "never"], [k.kid, "kid"], [k.look, "look"], [k.winkShot, "wink"], [k.phoneWide, "phoneWide"], [k.phone, "phone"], [k.last, "last"], [k.card, "card"]]);
  const lh = headAt(COURT.customer.x, COURT.customer.y, S, STAND, -1);
  const cyh = headAt(1290, COURT.customer.y, S, STAND, 1);
  const yh = headAt(YOU_X, SEAT_Y, SEAT_S, SEATED, -1);
  const hh = headAt(HIM_X, SEAT_Y, SEAT_S, SEATED, -1);
  const kh = headAt(960, SEAT_Y, SEAT_S, SEATED, -1);
  const cams: Record<ShotName, Camera> = {
    stall: camAt(frame, [[k.start, { x: 1120, y: 560, zoom: 1.45 }], [k.landlord, { x: 1130, y: 560, zoom: 1.55 }]]),
    landlord: camAt(frame, [[k.landlord, { x: lh.x - 60, y: lh.y - 80, zoom: 2.2 }], [k.yourCard, { x: lh.x - 60, y: lh.y - 80, zoom: 2.35 }]]),
    yourCard: camAt(frame, [[k.yourCard, insert(cyh.x, cyh.y - 150, 2.8)], [k.coffee, insert(cyh.x, cyh.y - 130, 2.5)]]),
    coffee: camAt(frame, [[k.coffee, { x: 1500, y: 560, zoom: 1.45 }], [k.pour, { x: 1505, y: 560, zoom: 1.55 }]]),
    pour: camAt(frame, [[k.pour, { x: 1500, y: 540, zoom: 1.7 }], [k.train, { x: 1510, y: 545, zoom: 1.8 }]]),
    cards: camAt(frame, [[k.train, { x: (YOU_X + HIM_X) / 2, y: 330, zoom: 2.4 }], [k.coach, { x: (YOU_X + HIM_X) / 2, y: 400, zoom: 2.0 }]]),
    coach: camAt(frame, [[k.coach, { x: 880, y: 560, zoom: 1.0 }], [k.hold, { x: 880, y: 580, zoom: 1.1 }]]),
    hand: camAt(frame, [[k.hold, { x: 880, y: 640, zoom: 2.3 }], [k.drop, { x: 880, y: 650, zoom: 2.45 }]]),
    drop: { x: 960, y: 540, zoom: 1 },
    grin: camAt(frame, [[k.grin, { x: 880, y: 560, zoom: 2.2 }], [k.window, { x: 880, y: 555, zoom: 2.4 }]]),
    window: camAt(frame, [[k.window, closeUp(yh.x - 120, yh.y - 60, 2.0)], [k.trust, closeUp(yh.x - 140, yh.y - 60, 2.15)]]),
    trust: camAt(frame, [[k.trust, closeUp(hh.x - 20, hh.y - 30, 2.7)], [k.never, closeUp(hh.x - 20, hh.y - 30, 2.85)]]),
    never: camAt(frame, [[k.never, closeUp(yh.x - 30, yh.y - 110, 2.3)], [k.kid, closeUp(yh.x - 30, yh.y - 120, 2.4)]]),
    kid: camAt(frame, [[k.kid, { x: 960, y: 640, zoom: 1.3 }], [k.look, { x: 960, y: 620, zoom: 1.42 }]]),
    look: camAt(frame, [[k.look, closeUp(yh.x, yh.y, 2.6)], [k.winkShot, closeUp(yh.x, yh.y, 2.75)]]),
    wink: camAt(frame, [[k.winkShot, closeUp(kh.x, kh.y - 60, 2.3)], [k.phoneWide, closeUp(kh.x, kh.y - 70, 2.6)]]),
    phoneWide: camAt(frame, [[k.phoneWide, { x: 860, y: 640, zoom: 2.0 }], [k.phone, { x: 850, y: 660, zoom: 2.2 }]]),
    phone: camAt(frame, [[k.phone, { x: 1180, y: 500, zoom: 1.25 }], [k.pick, { x: 1180, y: 560, zoom: 1.45 }], [k.thumb, { x: 1160, y: 700, zoom: 1.9 }], [k.last, { x: 1160, y: 710, zoom: 2.0 }]]),
    last: camAt(frame, [[k.last, { x: 1200, y: 640, zoom: 1.75 }], [k.at(109, 0.5), { x: 1260, y: 500, zoom: 1.35 }], [k.card, { x: 1260, y: 500, zoom: 1.3 }]]),
    card: camAt(frame, [[k.card, { x: 880, y: 600, zoom: 1.0 }], [k.end, { x: 880, y: 600, zoom: 1.05 }]]),
  };
  const cam = drift(cams[on], frame, `train-${on}`, 3);
  let picture: React.ReactNode;
  if (on === "stall" || on === "landlord") picture = <StallShot frame={frame} k={k} cam={cam} clips={clips} />;
  else if (on === "yourCard" || on === "coffee" || on === "pour") picture = <CoffeeShot frame={frame} k={k} cam={cam} clips={clips} />;
  else if (on === "drop") picture = <DropShot frame={frame} k={k} />;
  else if (on === "kid" || on === "wink") picture = <KidShot frame={frame} k={k} cam={cam} />;
  else if (on === "phone" || on === "last") picture = <PhoneShot frame={frame} k={k} cam={cam} />;
  else if (on === "card") {
    picture = (
      <AbsoluteFill>
        <Coach frame={frame} k={k} cam={cam} clips={clips} />
        <AbsoluteFill style={{ background: "rgba(8,10,20,0.55)" }} />
        <EndTags frame={frame} like={k.card + 6} subscribe={k.card + 18} comment={k.card + 30} />
      </AbsoluteFill>
    );
  } else {
    const youLook = on === "look" ? { x: -0.5, y: 0.1 } : { x: 0.7, y: -0.25 };
    picture = <Coach frame={frame} k={k} cam={cam} clips={clips} youLook={youLook} youPhone={on === "phoneWide"} />;
  }
  const tickKeys: TagKey[] = tickTimes(k).map((at) => ({ at, text: "LOOKS AT PHONE", pct: 99, state: "tick" }));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      <TagSounds keys={tickKeys.filter((t) => t.at >= k.train)} volume={0.5} />
      <BoardSounds keys={fareKeys(k).filter((b, i) => i === 0 || b.at >= k.train)} volume={0.4} />
      <Sequence from={k.fall + 10} durationInFrames={20}><Audio src={staticFile("sfx/coin.wav")} volume={0.45} /></Sequence>
      {[k.card + 6, k.card + 18, k.card + 30].map((at) => (
        <Sequence key={at} from={at} durationInFrames={24}><Audio src={staticFile("sfx/flap.wav")} volume={0.6} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};


export const theTrain: Beat = { id: "theTrain", firstLine: 100, Component: Scene };
