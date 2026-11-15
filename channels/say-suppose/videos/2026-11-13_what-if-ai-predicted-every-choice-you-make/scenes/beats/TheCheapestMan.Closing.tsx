// Boring Pays at your stall: "That's the champion?" (51), the napkin tie and its 5 s performed hold, "It knows the
// bit." and "That's what the discount costs." (56-58), and the lamppost outside, CITY SCORE 99.5 under the steady teal
// lamp (59).
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Sky, Skyline } from "@whatif/kit/sets/common";
import type { MoodName } from "@whatif/kit/stage/moods";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK } from "@whatif/kit/theme";
import { RateBoard, Tag, TealLamp } from "../device";
import { aimArm, Apron, headAt, type Body } from "../kit";
import { blinking, camAt, current, FRIEND, HERO, ramp } from "../shared";
import { Deep } from "../sets/common";
import { COURT, FoodCourtBack, foodCourtLights, StallCounter, StallLamp } from "../sets/FoodCourt";
import { glide, Shot, talk } from "./TheCityPlays.Parts";
import { boards, tags, type T } from "./TheCheapestMan.Times";

const NAPKIN = "#f3efe6";
const YOU_B: Body = { x: COURT.you.x, y: COURT.you.y, scale: COURT.scale, facing: 1, pose: STAND };

type Face = Partial<React.ComponentProps<typeof Figure>>;

/** The stall with the two of you behind the counter. */
const Stall: React.FC<{
  frame: number; cam: Camera; mood: MoodName; you: Pose; youFace: Face; fr: Body; frFace: Face; frTie?: string; frHeld?: React.ReactNode;
  card?: boolean; extra?: React.ReactNode; k: T;
}> = ({ frame, cam, mood, you, youFace, fr, frFace, frTie, frHeld, card, extra, k }) => {
  const fh = headAt(fr.x, fr.y, fr.scale, fr.pose, fr.facing);
  const actors = (
    <>
      <Figure {...YOU_B} pose={you} {...HERO} coat="#3b3e47" blink={blinking(frame, 0)} time={frame} {...youFace} />
      <Apron b={{ ...YOU_B, pose: you }} />
      <Figure {...fr} head={FRIEND.head} coat={FRIEND.coat} tie={frTie} blink={blinking(frame, 2)} time={frame} held={frHeld} {...frFace} />
      <Apron b={fr} />
      <StallCounter />
      {extra}
      {card && <Tag frame={frame} x={fh.x} headY={fh.y} r={fh.r} keys={tags(k).friend} />}
    </>
  );
  return (
    <Shot cam={cam} mood={mood} lights={foodCourtLights} back={<><FoodCourtBack cam={cam} mood={mood} frame={frame} /><StallLamp on={mood === "lamp" || mood === "dusk"} /></>} actors={actors} />
  );
};

/** Your hand over your mouth, laughing; the shoulders shaking. */
function laughing(frame: number): { pose: Pose; face: Face } {
  const yh = headAt(YOU_B.x, YOU_B.y, YOU_B.scale, STAND, 1);
  const shake = Math.round(Math.sin(frame / 2.2) * 3);
  const pose: Pose = { ...STAND, drop: shake, tilt: 6, armF: aimArm(YOU_B, { x: yh.x + yh.r * 0.55, y: yh.y + yh.r * 0.55 }) };
  return { pose, face: { brows: "raised", lids: 0.55, mouth: "smile", eyes: 1, look: { x: 0.9, y: 0.2 } } };
}

/** Line 51: your friend leaning over the counter, a hand shading his eyes toward the man with the same lunch; then
 *  round to you, "That's the champion?"; you snort into your hand. */
export const Champion: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const turned = frame >= k.champLine - 4;
  const fr0: Body = { x: COURT.friend.x, y: COURT.friend.y, scale: COURT.scale, facing: turned ? -1 : 1, pose: STAND };
  const fh = headAt(fr0.x, fr0.y, fr0.scale, STAND, fr0.facing);
  const pose: Pose = turned
    ? { ...STAND, lean: 4, armF: [100, 70], armB: [-20, 20] }
    : { ...STAND, lean: 14, armF: aimArm({ ...fr0, pose: { ...STAND, lean: 14 } }, { x: fh.x + 30, y: fh.y - fh.r * 0.6 }) };
  const fr: Body = { ...fr0, pose };
  const cam = drift(turned
    ? camAt(frame, [[k.champLine - 4, closeUp(fh.x - 120, fh.y + 20, 2.0)], [k.react, closeUp(fh.x - 140, fh.y + 20, 2.15)]])
    : camAt(frame, [[k.champ, { x: 900, y: 520, zoom: 1.55 }], [k.champLine - 4, { x: 920, y: 520, zoom: 1.65 }]]), frame, "champ", 2);
  const snort = frame >= k.react - 10;
  const l = laughing(frame);
  return (
    <Stall frame={frame} k={k} cam={cam} mood="day" fr={fr}
      frFace={turned ? { brows: "raised", lids: 0.2, mouth: talk(frame, k.champLine + 2, k.react - 6, "flat"), eyes: 1.1, look: { x: 0.9, y: 0 } }
        : { brows: "flat", lids: 0.45, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0.2 } }}
      you={snort ? l.pose : { ...STAND, armF: [40, 60] }} youFace={snort ? l.face : { brows: "none", lids: 0.1, mouth: "smirk", eyes: 1, look: { x: 0.9, y: 0 } }} />
  );
};

/** The landlord's walk: up and down behind the counter, chest out, hands behind the back. */
function strutX(frame: number, k: T) {
  const t = Math.min(frame, k.hold) - k.napkin;
  return { x: 1080 + Math.sin(t / 22) * 90, dir: (Math.cos(t / 22) >= 0 ? 1 : -1) as 1 | -1 };
}

/** Lines 56-58 and the hold: the napkin tie, the strut, you laughing; his mouth opens and the card flaps first; he
 *  stops, looks up, finishes the bit quieter, pulls the napkin off; "It knows the bit."; you crack up again. */
export const Napkin: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const laughAgain = k.knows + Math.round((k.costs - k.knows) * 0.55);
  const on = current(frame, [
    [k.napkin, "two"], [k.napkin + Math.round((k.hold - k.napkin) * 0.45), "you"], [k.hold - 6, "two2"], [k.mouth - 4, "him"],
    [k.bit - 12, "youTake"], [k.bit + 4, "two3"], [k.knows, "him2"], [laughAgain, "you2"], [k.costs, "card"],
  ]);
  const strutting = frame < k.hold;
  const s = strutX(frame, k);
  const fr: Body = {
    x: s.x, y: COURT.friend.y, scale: COURT.scale, facing: strutting ? s.dir : -1,
    pose: strutting ? { ...walkPose(frame * 0.22), lean: -8, drop: -3, armF: [-40, 40], armB: [-46, 40] }
      : frame >= k.pull && frame < k.pull + 14 ? { ...STAND, armF: [150, 30] }
      : frame >= k.bit && frame < k.pull ? { ...STAND, lean: -3, armF: [80 + Math.sin(frame / 5) * 6, 40] }
      : frame >= k.pull ? { ...STAND, armF: [60, 50] } : { ...STAND, lean: -8, drop: -3, armF: [-40, 40], armB: [-46, 40] },
  };
  const fh = headAt(fr.x, fr.y, fr.scale, fr.pose, fr.facing);
  const yh = headAt(YOU_B.x, YOU_B.y, YOU_B.scale, STAND, 1);
  const cams: Record<typeof on, Camera> = {
    two: camAt(frame, [[k.napkin, { x: 860, y: 520, zoom: 1.5 }], [k.napkin + 60, { x: 880, y: 520, zoom: 1.58 }]]),
    you: camAt(frame, [[k.napkin, closeUp(yh.x + 60, yh.y + 20, 2.3)], [k.hold, closeUp(yh.x + 60, yh.y + 20, 2.45)]]),
    two2: { x: 860, y: 500, zoom: 1.55 },
    him: camAt(frame, [[k.mouth - 4, closeUp(fh.x, fh.y - 90, 2.2)], [k.bit - 12, closeUp(fh.x, fh.y - 100, 2.4)]]),
    youTake: closeUp(yh.x + 60, yh.y - 20, 2.4),
    two3: camAt(frame, [[k.bit + 4, { x: 860, y: 500, zoom: 1.5 }], [k.knows, { x: 880, y: 500, zoom: 1.6 }]]),
    him2: camAt(frame, [[k.knows, closeUp(fh.x - 60, fh.y + 10, 2.2)], [laughAgain, closeUp(fh.x - 60, fh.y + 10, 2.35)]]),
    you2: camAt(frame, [[laughAgain, closeUp(yh.x + 60, yh.y + 20, 2.3)], [k.costs, closeUp(yh.x + 60, yh.y + 20, 2.4)]]),
    card: glide(frame, k.costs, k.score, closeUp(fh.x - 40, fh.y - 140, 2.3), closeUp(fh.x - 40, fh.y - 130, 2.75)),
  };
  const cam = drift(cams[on], frame, "napkin", 2.5);
  // his face, beat by beat: the strut's smug grin; the open mouth; the stop; the eyes up; the quiet bit; the deadpan
  let frFace: Face;
  if (strutting || frame < k.mouth) frFace = { brows: "flat", lids: 0.35, mouth: "smirk", eyes: 1, look: { x: 0.9, y: 0 } };
  else if (frame < k.up) frFace = { brows: frame >= k.stop ? "raised" : "flat", lids: 0, mouth: "open", eyes: frame >= k.stop ? 1.2 : 1, look: { x: 0.9, y: 0 } };
  else if (frame < k.bit) frFace = { brows: "raised", lids: 0, mouth: "open", eyes: 1.2, look: { x: -0.2, y: -0.95 } };
  else if (frame < k.pull) frFace = { brows: "flat", lids: 0.3, mouth: talk(frame, k.bit, k.pull, "o", 7), eyes: 1, look: { x: 0.9, y: 0.1 } };
  else if (frame < k.knows) frFace = { brows: "flat", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0.1 } };
  else if (frame < k.costs) frFace = { brows: "flat", lids: 0.4, mouth: talk(frame, k.knows + 2, laughAgain - 4, "flat"), eyes: 1, look: { x: 0.9, y: 0 } };
  else frFace = { brows: "raised", lids: 0.1, mouth: "smirk", eyes: 1, look: { x: -0.3, y: -0.9 } };
  // yours: laughing at the strut; the laugh cut off by the card (look at him, at the card, at him); a snort at the
  // quiet bit; cracking up at "It knows the bit."
  const l = laughing(frame);
  let you: Pose = { ...STAND, armF: [40, 60] };
  let youFace: Face;
  if (frame < k.card + 4 || (frame >= laughAgain && frame < k.costs)) { you = l.pose; youFace = l.face; }
  else if (frame < k.bit) {
    const t = frame - k.card;
    youFace = { brows: "raised", lids: 0, mouth: "o", eyes: 1.25, look: t < 20 ? { x: 0.9, y: 0 } : t < 40 ? { x: 0.7, y: -0.8 } : { x: 0.9, y: 0 } };
  } else if (frame < laughAgain) youFace = { brows: "raised", lids: 0.3, mouth: "smile", eyes: 1, look: { x: 0.9, y: 0 } };
  else youFace = { brows: "none", lids: 0.2, mouth: "smile", eyes: 1, look: { x: 0.9, y: -0.2 } };
  const napkinHeld = frame >= k.pull && frame < k.costs
    ? <path d="M-14 -20 L14 -20 L6 18 L-6 18Z" fill={NAPKIN} stroke={INK} strokeWidth={3} transform="rotate(20)" /> : undefined;
  const napkinDown = frame >= k.costs
    ? <path d={`M${fr.x - 40} ${COURT.counter.top - 4} l70 -6 l10 10 l-76 6z`} fill={NAPKIN} stroke={INK} strokeWidth={4} /> : null;
  return (
    <Stall frame={frame} k={k} cam={cam} mood="lamp" fr={fr} frFace={frFace} frTie={frame < k.pull ? NAPKIN : undefined} frHeld={napkinHeld}
      you={you} youFace={youFace} card={frame >= k.card} extra={napkinDown} />
  );
};

/** Line 59: the lamppost outside, CITY SCORE 99.4 to 99.5, the teal lamp steady over it; up to the lamp. */
export const CityScore: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const bd = boards(k);
  const cam = drift(frame < k.tilt
    ? camAt(frame, [[k.score, { x: 960, y: 600, zoom: 1.9 }], [k.tilt, { x: 960, y: 590, zoom: 2.0 }]])
    : glide(frame, k.tilt, k.end, { x: 960, y: 590, zoom: 2.0 }, { x: 990, y: 300, zoom: 2.1 }), frame, "score", 2);
  const back = (
    <g>
      <Deep cam={cam} depth={0.2} flat><Sky id="score" mood="lamp" x={-1400} y={-800} w={4800} h={1700} sunAt={{ x: 1500, y: 160 }} /></Deep>
      <Deep cam={cam} depth={0.4} flat><Skyline mood="night" from={-1400} to={3400} base={760} tall={420} seed={5} /></Deep>
      <Deep cam={cam} depth={0.75}>
        <rect x={-1400} y={640} width={4800} height={300} fill="#1b1e29" />
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i}>
            <rect x={-500 + i * 420} y={680} width={360} height={260} fill="#2b3142" stroke={INK} strokeWidth={5} />
            {Array.from({ length: 9 }, (_, r) => <line key={r} x1={-494 + i * 420} y1={700 + r * 26} x2={-146 + i * 420} y2={700 + r * 26} stroke="#3a4156" strokeWidth={5} />)}
          </g>
        ))}
        <rect x={-1400} y={940} width={4800} height={800} fill="#2a2d38" />
      </Deep>
    </g>
  );
  const actors = (
    <g>
      <rect x={946} y={140} width={28} height={1000} fill="#3b404e" stroke={INK} strokeWidth={5} />
      <path d="M960 180 Q1010 150 1040 190" fill="none" stroke="#3b404e" strokeWidth={14} />
      <TealLamp frame={frame} x={1040} y={222} size={30} />
      <RateBoard frame={frame} x={960} y={500} size={74} label="CITY SCORE" keys={bd.city} />
    </g>
  );
  return <Shot cam={cam} mood="lamp" lights={[{ x: 1040, y: 222, r: 260, color: "#7fe0d4", strength: 0.35, moods: ["lamp"] }]} back={back} actors={actors} />;
};
