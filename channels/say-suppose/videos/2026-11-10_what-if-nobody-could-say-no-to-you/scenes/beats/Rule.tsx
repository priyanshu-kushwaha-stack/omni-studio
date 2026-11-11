// Beat "The rule" (script.md, ## [00:35] The rule; narration lines 8-12). Same pattern as Change.tsx: `times()` from
// the clips, one component per shot, the beat picks by frame. The gate from The change, a moment later: the checker's
// YES tag still hangs over his cap (it does not switch off).
//
//   8     you stand still with the torn slip in your palm, the crowd flowing round you as a flat layer; close on your
//         face, brows up, then a slow frown.
//   9     over your shoulder: the checker, still smiling under his tag; the crowd streams; pull back, you alone in it.
//   10    insert: the phone in your other hand, the empty message box; close, your eyes lift to the people.
//   12    three commuters pass, you watch their mouths; far back, a bun and a shawl; close on you.
//   hold  your hand closes on the pieces (insert); the gate turns green and you walk through.
// The 3 s ident after the hold is not drawn here: the narration leaves no gap for it before line 12 (see the report).
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { EXPRESSIONS } from "@whatif/kit/rig/expressions";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { closeUp, drift, ForegroundHead, insert } from "@whatif/kit/stage/shots";
import type { Clip } from "@whatif/kit/timeline";
import { INK, MUSTARD } from "@whatif/kit/theme";
import { Bun, headAt, Shawl, YesTag } from "../parts";
import { aimArm, FineSlip, handAt, HandPhone, PhoneTop, Walkers, type Body } from "../parts2";
import { blinking, camAt, current, HERO, lineEnd, linear, mix, MOTHER, PASTELS, ramp, type Beat, type Shot } from "../shared";
import { Deep, REF } from "../sets/common";
import { MetroBack, MetroFront, METRO_GATE, Turnstile } from "../sets/Metro";
import { Checker, checkerTagAt, CX, FloorTop, FLOOR, HX, S } from "./Change.parts";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

/** Every frame the beat uses, from the narration clips (`at(i, p)`: p of the way through line i). */
function times(clips: Clip[], to: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  return {
    wide: from(8) - 6, // you stand still, the crowd flows round you
    face: at(8, 0.4), // close: brows up ...
    frown: from(9) + 10, // ... then the slow frown
    checker: at(9, 0.3), // "They say yes. Gladly.": past you, the checker under his tag
    stream: at(9, 0.58), // "And it won't switch off.": the crowd streams round you
    pull: at(9, 0.8), // "Every no in your life, gone.": pull back
    phone: from(10) - 4, // insert: the empty message box
    look: at(10, 0.6), // "You have to be looking at them."
    pass: from(12) - 4, // three commuters pass; you watch their mouths
    mother: at(12, 0.42), // far back, a bun and a shawl
    answer: at(12, 0.74), // close: "never know her real answer"
    close: lineEnd(clips, 12) + 4, // the hold: your hand closes on the pieces
    beep: lineEnd(clips, 12) + 34, // the gate turns green; you walk through
    end: to,
    tagAt: checkerTagAt(clips),
  };
}

// ------------------------------------------------------------------------------------------------ you at the gate

const PALM_OUT = { dx: 62, dy: -208 };

/** You, standing still where The change left you: the pieces in your front palm, the phone in your back hand. */
function heroAt(): { body: Body; head: ReturnType<typeof headAt> } {
  const body: Body = { x: HX, y: FLOOR, scale: S, facing: 1, pose: STAND };
  body.pose = { ...STAND, armF: aimArm(body, { x: HX + PALM_OUT.dx, y: FLOOR + PALM_OUT.dy * S }), armB: [10, 40] };
  return { body, head: headAt(body.x, body.y, S, body.pose) };
}

/** The gate scene with you, the checker (tag up) and the flowing crowd. `near` adds walkers between you and the
 *  camera; `mid` (on by default) the walkers just behind you, off for close-ups so no head crosses your face; `you` false leaves you out (an over-the-shoulder shot draws your head as the blurred foreground). */
const GateScene: React.FC<{
  frame: number; k: T; cam: Camera; face: object; near?: boolean; mid?: boolean; you?: boolean; extra?: React.ReactNode; far?: React.ReactNode;
}> = ({ frame, k, cam, face, near, mid = true, you = true, extra, far }) => {
  const { body } = heroAt();
  const back = handAt(body, "back");
  const ch = headAt(CX, FLOOR, S, STAND, -1);
  const actors = (
    <>
      {mid && <Walkers frame={frame} y={FLOOR - 40} scale={0.95} count={6} seed={11} speed={4} smile />}
      <Turnstile x={METRO_GATE.gate.x} y={FLOOR} scale={S} lamp="red" />
      <Checker x={CX} y={FLOOR} scale={S} facing={-1} pose={STAND} brows="raised" mouth="smile" eyes={1.05}
        look={{ x: 0.9, y: 0.1 }} blink={blinking(frame, 4)} time={frame} />
      <YesTag frame={frame} at={k.tagAt} x={ch.x} headY={ch.y - 10} r={ch.r} />
      {you && (
        <>
          <g transform={`translate(${back.x} ${back.y})`}><HandPhone frame={frame} scale={S} lit={false} /></g>
          <Figure {...HERO} {...body} {...face} time={frame} held={<FineSlip x={6} y={-8} scale={0.36} pieces={4} spread={10} />} />
        </>
      )}
      {extra}
      {near && <Walkers frame={frame} y={FLOOR + 90} scale={1.4} count={5} seed={3} speed={7} from={-900} span={3600} />}
    </>
  );
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<><MetroBack cam={cam} view="gate" frame={frame} crowd />{far}</>}
      actors={actors} front={<MetroFront cam={cam} view="gate" />} />
  );
};

// ------------------------------------------------------------------------------------------------ lines 8-9

const StillShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const { head } = heroAt();
  const shot = current(frame, [[k.wide, "wide"], [k.face, "face"], [k.checker, "checker"], [k.stream, "stream"], [k.pull, "pull"]]);
  const frown = ramp(frame, k.frown, k.frown + 40);
  const faces = {
    wide: { ...EXPRESSIONS.shocked, eyes: 1.1, mouth: "flat" as const, look: { x: 0.4, y: 0.7 } },
    face: frame < k.frown
      ? { ...EXPRESSIONS.shocked, mouth: "flat" as const, look: { x: 0.5, y: 0.6 } }
      : { brows: frown < 0.5 ? "flat" as const : "angry" as const, lids: mix(0, 0.35, frown), mouth: frown < 0.5 ? "flat" as const : "frown" as const, eyes: 1, look: { x: 0.6, y: mix(0.6, 0.2, frown) } },
    checker: EXPRESSIONS.sceptical,
    stream: { ...EXPRESSIONS.sceptical, look: { x: Math.sin((frame - k.stream) / 12), y: 0 } },
    pull: { ...EXPRESSIONS.sad, look: { x: 0.3, y: 0.5 } },
  };
  const cams: Record<typeof shot, Camera> = {
    wide: camAt(frame, [[k.wide, { x: 1020, y: 690, zoom: 1.3 }], [k.face, { x: 1000, y: 680, zoom: 1.4 }]]),
    face: camAt(frame, [[k.face, closeUp(head.x + 30, head.y, 2.5)], [k.checker, closeUp(head.x + 30, head.y, 2.95)]]),
    checker: camAt(frame, [[k.checker, { x: CX + 70, y: 640, zoom: 1.9 }], [k.stream, { x: CX + 60, y: 630, zoom: 2.05 }]]),
    stream: camAt(frame, [[k.stream, { x: HX + 60, y: 700, zoom: 1.75 }], [k.pull, { x: HX + 70, y: 700, zoom: 1.8 }]]),
    pull: camAt(frame, [[k.pull, { x: HX + 70, y: 700, zoom: 1.8 }], [k.phone, { x: 960, y: 610, zoom: 1.0 }]]),
  };
  const cam = drift(cams[shot], frame, "rule", 3);
  // On "They say yes. Gladly.", a commuter walks up to the gate and the checker waves him through with the smile.
  const passer = shot === "checker" ? (
    <Figure x={mix(CX - 340, CX + 520, linear(frame, k.checker, k.stream))} y={FLOOR + 10} scale={S} pose={walkPose(frame * 0.35)}
      head={PASTELS[5]} mouth="smile" look={{ x: 0.8, y: 0 }} time={frame} />
  ) : null;
  return (
    <>
      <GateScene frame={frame} k={k} cam={cam} face={faces[shot]} near={shot !== "face" && shot !== "checker"} mid={shot !== "face" && shot !== "checker"} you={shot !== "checker"}
        extra={passer} />
      {shot === "checker" && <ForegroundHead x={220} side="left" blur={16} />}
    </>
  );
};

// ------------------------------------------------------------------------------------------------ line 10

const PhoneShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const cam = camAt(frame, [[k.phone, { x: 960, y: 580, zoom: 1.25 }], [k.look, { x: 960, y: 600, zoom: 1.4 }]]);
  // The thumb comes up to the box halfway through, and stops.
  const thumbIn = ramp(frame, mix(k.phone, k.look, 0.45), mix(k.phone, k.look, 0.7));
  const thumb = thumbIn > 0 ? { x: 0.5, y: mix(1.3, 0.6, thumbIn) } : null;
  return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<FloorTop />} actors={<PhoneTop x={960} y={560} scale={1.1} frame={frame} thumb={thumb} />} />;
};

const LookShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const { head } = heroAt();
  const up = ramp(frame, k.look + 8, k.look + 24);
  const face = { ...EXPRESSIONS.worried, mouth: "flat" as const, brows: up > 0.5 ? "raised" as const : "worry" as const, eyes: mix(1, 1.15, up), look: { x: mix(0.3, 0.9, up), y: mix(0.95, -0.05, up) } };
  const cam = drift(camAt(frame, [[k.look, closeUp(head.x + 20, head.y, 2.6)], [k.pass, closeUp(head.x + 30, head.y, 2.8)]]), frame, "look", 3);
  return <GateScene frame={frame} k={k} cam={cam} face={face} mid={false} />;
};

// ------------------------------------------------------------------------------------------------ line 11

/** Where your mother walks far back (authored on the far crowd's layer, depth D): right to left behind the gates. */
const D = 0.75;
const momX = (frame: number, k: T) => mix(2050, 1450, linear(frame, k.mother - 30, k.answer + 30));
/** The camera that centres a point authored on a Deep layer of depth d (sets/common.tsx), at a zoom. */
const onLayer = (x: number, y: number, d: number, zoom: number): Camera => ({ x: (x - REF.x * (1 - d)) / d, y: (y - REF.y * (1 - d)) / d, zoom });

const FarMother: React.FC<{ frame: number; k: T; cam: Camera }> = ({ frame, k, cam }) => {
  const x = momX(frame, k);
  const pose = walkPose(frame * 0.18);
  const s = 0.55, y = 905;
  return (
    <Deep cam={cam} depth={D} flat>
      <Bun x={x} y={y} scale={s} pose={pose} facing={-1} />
      <Figure x={x} y={y} scale={s} facing={-1} pose={pose} head={MOTHER.head} coat={MOTHER.coat} look={{ x: 0.8, y: 0 }} mouth="flat" time={frame} />
      <Shawl x={x} y={y} scale={s} pose={pose} facing={-1} />
    </Deep>
  );
};

const PassShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const { head } = heroAt();
  const shot = current(frame, [[k.pass, "pass"], [k.mother, "mother"], [k.answer, "answer"]]);
  const momHead = { x: momX(frame, k), y: 905 - 264 * 0.55 };
  const cams: Record<typeof shot, Camera> = {
    pass: camAt(frame, [[k.pass, { x: HX + 90, y: 660, zoom: 1.85 }], [k.mother, { x: HX + 90, y: 655, zoom: 1.95 }]]),
    mother: onLayer(momHead.x, momHead.y + 30, D, mix(2.4, 2.9, linear(frame, k.mother, k.answer))),
    answer: camAt(frame, [[k.answer, closeUp(head.x + 30, head.y, 2.7)], [k.close, closeUp(head.x + 30, head.y + 4, 3.0)]]),
  };
  const cam = drift(cams[shot], frame, "pass", 3);
  // Three commuters cross between you and the camera, one after another; your eyes go to each one's mouth.
  const gap = (k.mother - k.pass) / 3;
  const commuters = [0, 1, 2].map((i) => {
    const p = linear(frame, k.pass + i * gap - 10, k.pass + i * gap + gap * 1.6);
    if (p <= 0 || p >= 1) return null;
    return (
      <Figure key={i} x={mix(HX + 620, HX - 520, p)} y={FLOOR + 70} scale={S * 1.1} facing={-1} pose={walkPose(frame * 0.33 + i)}
        head={PASTELS[(i * 2 + 3) % PASTELS.length]} mouth="smile" look={{ x: 0.9, y: 0 }} time={frame} />
    );
  });
  const watched = Math.min(2, Math.max(0, Math.floor((frame - k.pass) / gap)));
  const faces = {
    pass: { ...EXPRESSIONS.sceptical, look: { x: watched === 1 ? 0.2 : 0.9, y: 0.45 } },
    mother: EXPRESSIONS.worried,
    answer: { ...EXPRESSIONS.sad, look: { x: 0.9, y: 0.1 }, lids: 0.45 },
  };
  return (
    <>
      <GateScene frame={frame} k={k} cam={cam} face={faces[shot]} you={shot !== "mother"} mid={shot === "pass"} extra={shot === "pass" ? <>{commuters}</> : null}
        far={shot === "mother" ? <FarMother frame={frame} k={k} cam={cam} /> : null} />
      {shot === "mother" && <ForegroundHead x={180} side="left" blur={18} />}
    </>
  );
};

// ------------------------------------------------------------------------------------------------ the hold

/** Your hand, big, palm up with the four pieces; `close` 0..1 folds the fingers and the thumb over them (a finger's
 *  back shows, darker, once it has turned past flat). World units at (x, y). */
const Palm: React.FC<{ x: number; y: number; close: number }> = ({ x, y, close }) => {
  const fold = mix(1, -0.95, close);
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-80 -30 Q-86 50 -40 70 H50 Q86 50 80 -30 Z" fill={MUSTARD} stroke={INK} strokeWidth={5} />
      <rect x={-50} y={60} width={100} height={80} fill={MUSTARD} stroke={INK} strokeWidth={5} />
      <FineSlip x={0} y={8} scale={0.75} pieces={4} spread={mix(12, 2, close)} tilt={8} />
      {[-58, -20, 18, 56].map((fx, i) => (
        <g key={fx} transform={`translate(${fx} -28) scale(1 ${fold})`}>
          <rect x={-17} y={-(84 - Math.abs(i - 1.5) * 10)} width={34} height={86 - Math.abs(i - 1.5) * 10} rx={17}
            fill={fold < 0 ? "#d99a1f" : MUSTARD} stroke={INK} strokeWidth={5} />
          {fold < 0 && <line x1={-10} y1={-40} x2={10} y2={-40} stroke={INK} strokeWidth={4} strokeLinecap="round" />}
        </g>
      ))}
      <g transform={`rotate(${mix(-10, -75, close)} 74 30)`}>
        <rect x={64} y={-40} width={34} height={80} rx={17} fill={MUSTARD} stroke={INK} strokeWidth={5} />
      </g>
    </g>
  );
};

const HoldShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  if (frame < k.beep) {
    const cam = drift(camAt(frame, [[k.close, insert(960, 600, 1.0)], [k.beep, insert(960, 590, 1.12)]]), frame, "palm", 2);
    const actors = <Palm x={960} y={620} close={ramp(frame, k.close + 6, k.close + 22)} />;
    return <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<FloorTop />} actors={<g transform="translate(960 620) scale(2.6) translate(-960 -620)">{actors}</g>} />;
  }
  // The gate: the lamp goes green, the arm swings down, and you walk through past the checker, who keeps his smile.
  const green = frame >= k.beep + 6;
  const walkFrom = k.beep;
  const x = mix(METRO_GATE.gate.x - 150, METRO_GATE.gate.x + 230, linear(frame, walkFrom, k.end));
  const ch = headAt(CX, FLOOR, S, STAND, -1);
  const cam = drift(camAt(frame, [[k.beep, { x: 1330, y: 700, zoom: 1.4 }], [k.end, { x: 1400, y: 700, zoom: 1.45 }]]), frame, "beep", 2);
  const actors = (
    <>
      <Turnstile x={METRO_GATE.gate.x} y={FLOOR} scale={S} lamp={green ? "green" : "red"} open={ramp(frame, k.beep + 6, k.beep + 14)} />
      <Checker x={CX} y={FLOOR} scale={S} facing={-1} pose={STAND} brows="raised" mouth="smile" eyes={1.05} look={{ x: -0.6, y: 0.1 }} time={frame} />
      <YesTag frame={frame} at={k.tagAt} x={ch.x} headY={ch.y - 10} r={ch.r} />
      <Figure {...HERO} x={x} y={FLOOR} scale={S} pose={walkPose(frame * 0.3)} {...EXPRESSIONS.sad} look={{ x: 0.8, y: 0.5 }} time={frame} flow={0.2} />
    </>
  );
  return (
    <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={<MetroBack cam={cam} view="gate" frame={frame} crowd />}
      actors={actors} front={<MetroFront cam={cam} view="gate" />} />
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const Rule: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const scene = current(frame, [[0, "still"], [k.phone, "phone"], [k.look, "look"], [k.pass, "pass"], [k.close, "hold"]]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene === "still" && <StillShot frame={frame} k={k} />}
      {scene === "phone" && <PhoneShot frame={frame} k={k} />}
      {scene === "look" && <LookShot frame={frame} k={k} />}
      {scene === "pass" && <PassShot frame={frame} k={k} />}
      {scene === "hold" && <HoldShot frame={frame} k={k} />}
    </AbsoluteFill>
  );
};

export const rule: Beat = { id: "rule", firstLine: 8, Component: Rule };
