// Beat "The Photo" (script.md ## The Photo; narration lines 55-61). The cost, and the scene the narrator lets play.
//
//   55   the hall from the back: folding chairs, the stage, the banner; the reverse: you in the second row, phone up;
//        your brother at the side of the stage in his gown and mortarboard; close on him: no teal light under it. He
//        starts across.
//   hold (3 s, performed) he takes the rolled paper; looks out for you; finds you, grins, points; you in the second
//        row, crying, phone up, point back with the phone hand.
//   56   that night: the band's split-flap in your hand flutters $90 -> $270; you lie down, the band goes on, the pale
//        second you sits up and types; coins.
//   57   morning, the kitchen: he is up, palm out before you're through the door. "What'd you get? Show me."
//   58   INSERT the band in your palm, $270; you, grinning; you hold the band out; he holds up his phone.
//   hold (4 s, performed) THE photo on his phone; your face, blank, the way you'd look at a stranger's; you tilt the
//        phone to the light.
//   59   close on him: "You cried. Remember?"
//   hold (3 s, performed) you don't; he waits; his face falls; he pockets the phone, turns to the counter and makes
//        the coffee with his back to you.
//   60   his back; close on you and the band ($270).
//   61   close on you; INSERT a paper street, window after window lighting teal, $270 and an arrow going down.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { HandPhone } from "@whatif/kit/sets/props";
import { closeUp, drift, ForegroundHead, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { INK } from "@whatif/kit/theme";
import { Band, ClinkSound, DeviceSound, headAt, landings, PayFlap } from "../parts";
import { BunkRoom, KEY_VIEW } from "../sets/BunkRoom";
import { GRAD, Scroll } from "../sets/GradHall";
import { BROTHER, camAt, current, HERO, lineEnd, mix, PASTELS, ramp, type Beat, type Shot } from "../shared";
import { aimArm, Draw, handOf, PaperInsert, Sfx, talk, type Body } from "./NightShift.Rig";
import { SIT_UP, SittingYou, youBody, type Face } from "./NightShift.Rooms";
import { DEBT } from "./V6.Kit";
import { GradBrother, HallAudience, HallStage, MorningKitchen, PalmBand, PhoneInsert, youInRow } from "./Photo.Parts";

type T = ReturnType<typeof times>;

function times(clips: Clip[], start: number, end: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const h1 = lineEnd(clips, 55) + 2; // performed: across the stage, the point
  const in1 = (p: number) => Math.round(h1 + (from(56) - h1) * p);
  const h2 = lineEnd(clips, 58) + 2; // performed: the photo
  const in2 = (p: number) => Math.round(h2 + (from(59) - h2) * p);
  const h3 = lineEnd(clips, 59) + 2; // performed: you don't; the coffee
  const in3 = (p: number) => Math.round(h3 + (from(60) - h3) * p);
  return {
    start, end,
    aud: at(55, 0.24), // "Folding chairs."
    med: at(55, 0.46), // "Your brother on the stage in a gown and his cap"
    walk: [at(55, 0.6), in1(0.14)] as const,
    broClose: at(55, 0.76), // "and no band under it today"
    h1, hand: in1(0.14), handOff: in1(0.22), search: in1(0.3), grin: in1(0.4), point: in1(0.45), youCry: in1(0.56), pointBack: in1(0.74),
    night: from(56) - 2, triple: at(56, 0.16), lie: at(56, 0.45), on: at(56, 0.55), coins: at(56, 0.68),
    kitchen: from(57) - 2, show: [from(57), lineEnd(clips, 57)] as const,
    palm: from(58) - 2, grinYou: at(58, 0.36), holdOut: at(58, 0.56), phoneUp: at(58, 0.78),
    h2, stranger: in2(0.36), tilt: in2(0.7),
    hope: from(59) - 2, cried: [from(59), lineEnd(clips, 59)] as const,
    h3, fall: in3(0.3), coffee: in3(0.55), pocket: in3(0.66), turn: in3(0.74),
    you60: at(60, 0.42),
    sheet61: at(61, 0.3), down: at(61, 0.78),
  };
}

type Name = "wideStage" | "aud" | "med" | "broClose" | "hand" | "search" | "youCry" | "night" | "lie" | "kitchen" | "palm"
  | "grinYou" | "holdOut" | "photo" | "stranger" | "tilt" | "hope" | "youBlank" | "broFall" | "coffee" | "you60" | "sheet61";

const shotAt = (f: number, k: T): Name => current<Name>(f, [[k.start, "wideStage"], [k.aud, "aud"], [k.med, "med"],
  [k.broClose, "broClose"], [k.hand, "hand"], [k.search, "search"], [k.youCry, "youCry"], [k.night, "night"], [k.lie, "lie"],
  [k.kitchen, "kitchen"], [k.palm, "palm"], [k.grinYou, "grinYou"], [k.holdOut, "holdOut"], [k.h2, "photo"],
  [k.stranger, "stranger"], [k.tilt, "tilt"], [k.hope, "hope"], [k.h3, "youBlank"], [k.fall, "broFall"], [k.coffee, "coffee"],
  [k.you60, "you60"], [k.sheet61, "sheet61"]]);

// ---------------------------------------------------------------- the hall

const SY = GRAD.stage.y;
const SS = GRAD.stageScale;
const PRINCIPAL = { x: 1400, head: PASTELS[6], coat: "#3d4a66" };

const HallBit: React.FC<{ frame: number; k: T; shot: Name }> = ({ frame, k, shot }) => {
  if (shot === "aud" || shot === "youCry") {
    const crying = shot === "youCry";
    const base: Pose = { ...STAND, armF: [78, 30], armB: [-8, 30], legB: [-4, 0], legF: [4, 0] };
    const head = youInRow(base);
    const back = crying && frame >= k.pointBack;
    // pointing back with the phone hand, held out and up, clear of the face
    const pose: Pose = back ? { ...base, armF: [118, 6] } : { ...base, armF: [78, 30] };
    const face: Face = crying
      ? { brows: "sad", lids: 0.25, mouth: back ? "open" : "wobble", eyes: 1.05, look: { x: 0.25, y: -0.35 } }
      : { brows: "raised", lids: 0, mouth: "smile", eyes: 1.1, look: { x: 0.2, y: -0.4 } };
    const cam: Camera = crying
      ? camAt(frame, [[k.youCry, closeUp(head.x + 20, head.y + 10, 2.6)], [k.night, closeUp(head.x + 20, head.y + 10, 2.85)]])
      : camAt(frame, [[k.aud, { x: 960, y: 640, zoom: 1.02 }], [k.med, { x: 960, y: 650, zoom: 1.12 }]]);
    return <HallAudience frame={frame} cam={drift(cam, frame, "photo-aud", 3)} pose={pose} face={face} tears={crying ? 1 : 0} phone />;
  }
  // stage view: your brother crossing, the principal with the rolled paper
  const walking = frame >= k.walk[0] && frame < k.walk[1];
  const bx = mix(GRAD.stage.from + 230, 1120, ramp(frame, k.walk[0], k.walk[1]));
  const turned = frame >= k.search;
  const facing: 1 | -1 = turned ? -1 : 1;
  let pose: Pose = walking ? walkPose((frame - k.walk[0]) / 5) : STAND;
  const b: Body = { x: bx, y: SY, scale: SS, facing, pose };
  const hasScroll = frame >= k.handOff;
  const pointing = frame >= k.point;
  if (pointing) pose = { ...STAND, armB: [118, 4], armF: [8, 20] };
  else if (frame >= k.hand && !turned) pose = { ...STAND, armF: aimArm(b, { x: 1250, y: SY - 150 }) };
  b.pose = pose;
  const sweep = Math.sin((frame - k.search) / 6) * 0.8;
  const face = turned
    ? frame >= k.grin
      ? { mouth: "open" as const, brows: "raised" as const, eyes: 1.15, look: { x: 0.8, y: 0.45 } }
      : { mouth: "flat" as const, brows: "flat" as const, look: { x: sweep, y: 0.4 } }
    : { mouth: "smile" as const, brows: "worry" as const, look: { x: 0.8, y: 0 } };
  const pBody: Body = { x: PRINCIPAL.x, y: SY, scale: SS, facing: -1, pose: STAND };
  const pArm = frame >= k.hand - 6 && frame < k.handOff + 8 ? aimArm(pBody, { x: 1250, y: SY - 150 }) : ([12, 20] as [number, number]);
  pBody.pose = { ...STAND, armF: pArm };
  const head = headAt(b.x, b.y, b.scale, pose, facing);
  const cam: Camera =
    shot === "wideStage" ? camAt(frame, [[k.start, { x: 960, y: 560, zoom: 1.0 }], [k.aud, { x: 940, y: 540, zoom: 1.07 }]])
      : shot === "med" ? camAt(frame, [[k.med, { x: 760, y: 470, zoom: 1.75 }], [k.broClose, { x: 820, y: 470, zoom: 1.85 }]])
        : shot === "broClose" ? closeUp(head.x + 20, head.y + 10, 3.4)
          : shot === "hand" ? camAt(frame, [[k.hand, { x: 1250, y: 470, zoom: 2.1 }], [k.search, { x: 1240, y: 470, zoom: 2.2 }]])
            : camAt(frame, [[k.search, closeUp(head.x - 30, head.y + 20, 3.3)], [k.youCry, closeUp(head.x - 40, head.y + 30, 3.0)]]);
  const handB = handOf(b, pose.armF);
  const handP = handOf(pBody, pArm);
  return (
    <HallStage frame={frame} cam={drift(cam, frame, "photo-stage", 2)} heads={shot === "wideStage"}
      actors={
        <g>
          <Figure x={PRINCIPAL.x} y={SY} scale={SS} facing={-1} pose={pBody.pose} head={PRINCIPAL.head} coat={PRINCIPAL.coat} tie="#c0392b"
            mouth="smile" look={{ x: 0.8, y: 0.1 }} blink={(frame + 11) % 97 < 4} />
          <GradBrother b={b} face={face} frame={frame} />
          {frame >= k.hand - 6 && (hasScroll
            ? !pointing && <Scroll x={handB.x} y={handB.y} scale={0.36} tilt={-20} />
            : <Scroll x={handP.x} y={handP.y} scale={0.36} tilt={10} />)}
          {pointing && <Scroll x={handOf(b, pose.armF).x} y={handOf(b, pose.armF).y + 8} scale={0.36} tilt={80} />}
        </g>
      } />
  );
};

// ---------------------------------------------------------------- the morning kitchen

const K_BRO = { x: 1150, scale: 1.15 };
const K_YOU = { x: 1430, scale: 1.15 };
const FLOOR = 960;

const KitchenBit: React.FC<{ frame: number; k: T; shot: Name }> = ({ frame, k, shot }) => {
  // you come in from the door at the right; he is up, palm out
  const yx = mix(1700, K_YOU.x, ramp(frame, k.kitchen, k.show[1]));
  const you: Body = { x: yx, y: FLOOR, scale: K_YOU.scale, facing: -1, pose: frame < k.show[1] ? walkPose((frame - k.kitchen) / 5) : STAND };
  const youHead = headAt(K_YOU.x, FLOOR, K_YOU.scale, STAND, -1);
  // his walk to the stove after the photo
  const away = ramp(frame, k.turn, k.turn + 40);
  const bx = mix(K_BRO.x, 780, away);
  const bro: Body = { x: bx, y: FLOOR, scale: K_BRO.scale, facing: frame >= k.turn ? -1 : 1, pose: STAND };
  const broHead = headAt(K_BRO.x, FLOOR, K_BRO.scale, STAND, 1);
  const between = { x: (K_BRO.x + K_YOU.x) / 2, y: FLOOR - 190 };

  // your arms: the band held out (back arm, you face left), or the phone at your face, tilted
  let youHeld: React.ReactNode;
  if (frame >= k.holdOut && frame < k.h2) {
    you.pose = { ...STAND, armB: aimArm(you, { x: between.x + 20, y: between.y }) };
  } else if (frame >= k.stranger && frame < k.hope) {
    you.pose = { ...STAND, armF: aimArm(you, { x: youHead.x - 70, y: youHead.y + 70 }) };
    youHeld = <g transform={`rotate(${frame >= k.tilt ? -14 * ramp(frame, k.tilt, k.tilt + 15) : 0})`}><HandPhone lit scale={1} /></g>;
  } else if (frame >= k.grinYou && frame < k.holdOut) {
    you.pose = { ...STAND, armF: [70, 70] };
  }
  // his arms: palm out; the phone up; the phone back and into his pocket; then the kettle
  let broHeld: React.ReactNode;
  if (frame < k.palm) bro.pose = { ...STAND, armF: [84, -6] };
  else if (frame >= k.phoneUp && frame < k.stranger) {
    bro.pose = { ...STAND, armF: aimArm(bro, { x: between.x + 10, y: between.y - 40 }) };
    broHeld = <HandPhone lit scale={1} />;
  } else if (frame >= k.coffee && frame < k.pocket) {
    bro.pose = { ...STAND, armF: [40, 50] };
    broHeld = <HandPhone lit={false} scale={1} />;
  } else if (frame >= k.turn) {
    const stir = away >= 1 ? Math.sin(frame / 5) * 8 : 0;
    bro.pose = away < 1 ? walkPose((frame - k.turn) / 5) : { ...STAND, lean: 6, armF: [70 + stir, 40], armB: [60, 50] };
  }
  const talking = talk(frame, k.show[0], k.show[1], "smile");
  const cried = talk(frame, k.cried[0], k.cried[1], "smile");
  const fallT = ramp(frame, k.fall + 6, k.coffee - 4);
  const broFace: Face =
    frame < k.palm ? { brows: "raised", mouth: talking, look: { x: 0.9, y: 0 } }
      : frame < k.phoneUp ? { brows: "flat", lids: 0.3, mouth: "flat", look: { x: 0.9, y: 0.4 } }
        : frame < k.hope ? { brows: "raised", mouth: "smile", look: { x: 0.9, y: 0.1 } }
          : frame < k.h3 ? { brows: "raised", lids: 0, mouth: cried, eyes: 1.1, look: { x: 0.9, y: 0 } }
            : frame < k.coffee ? { brows: fallT > 0.5 ? "sad" : "raised", lids: 0.4 * fallT, mouth: fallT > 0.3 ? "flat" : "smile", look: { x: 0.9, y: 0.25 * fallT } }
              : { brows: "sad", lids: 0.4, mouth: "flat", look: { x: 0.8, y: 0.3 } };
  const youFace: Face =
    frame < k.palm ? { brows: "none", lids: 0.3, mouth: "smile", look: { x: 0.9, y: 0 } }
      : frame < k.holdOut ? { brows: "raised", lids: 0, mouth: "smile", eyes: 1.1, look: { x: 0.9, y: 0.1 } }
        : frame < k.h2 ? { brows: "raised", lids: 0, mouth: "smile", look: { x: 0.9, y: 0.3 } }
          : frame < k.hope ? { brows: "none", lids: 0.15, mouth: "flat", eyes: 1, look: { x: 0.5, y: 0.6 } }
            : frame < k.coffee ? { brows: "flat", lids: 0.1, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0 } }
              : frame < k.you60 ? { brows: "sad", lids: 0.3, mouth: "flat", look: { x: 0.9, y: 0.2 } }
                : { brows: "sad", lids: 0.45, mouth: "flat", look: { x: 0.6, y: 0.7 } };
  if (frame >= k.you60) {
    you.pose = { ...STAND, armF: [55, 70] };
    // G3: the thumbnail's band, headband size, its one teal light glowing (it was drawn as a dark ring here: a wheel)
    youHeld = <Band x={4} y={-4} scale={0.85} lit tilt={-10} />;
  }
  // the head shakes once, just, as you don't remember
  if (shot === "youBlank") you.pose = { ...you.pose, tilt: Math.sin(((frame - k.h3) / 26) * Math.PI * 2) * 4 };

  const cam: Camera = (() => {
    switch (shot) {
      case "kitchen": return camAt(frame, [[k.kitchen, { x: 1280, y: 620, zoom: 1.45 }], [k.palm, { x: 1290, y: 610, zoom: 1.55 }]]);
      case "palm": return camAt(frame, [[k.palm, insert(1300, 610, 3.0)], [k.grinYou, insert(1300, 600, 3.3)]]);
      case "grinYou": return camAt(frame, [[k.grinYou, closeUp(youHead.x - 30, youHead.y, 2.6)], [k.holdOut, closeUp(youHead.x - 30, youHead.y, 2.8)]]);
      case "holdOut": return camAt(frame, [[k.holdOut, { x: 1290, y: 640, zoom: 1.7 }], [k.h2, { x: 1300, y: 630, zoom: 1.8 }]]);
      case "stranger": return camAt(frame, [[k.stranger, closeUp(youHead.x - 40, youHead.y + 20, 2.6)], [k.tilt, closeUp(youHead.x - 40, youHead.y + 20, 2.9)]]);
      case "hope": return camAt(frame, [[k.hope, closeUp(broHead.x + 30, broHead.y, 2.7)], [k.h3, closeUp(broHead.x + 30, broHead.y, 2.95)]]);
      case "youBlank": return camAt(frame, [[k.h3, closeUp(youHead.x - 30, youHead.y, 2.9)], [k.fall, closeUp(youHead.x - 30, youHead.y, 3.1)]]);
      case "broFall": return camAt(frame, [[k.fall, closeUp(broHead.x + 30, broHead.y, 3.0)], [k.coffee, closeUp(broHead.x + 30, broHead.y, 3.3)]]);
      case "coffee": return camAt(frame, [[k.coffee, { x: 1150, y: 620, zoom: 1.4 }], [k.you60, { x: 1100, y: 600, zoom: 1.25 }]]);
      default: return camAt(frame, [[k.you60, closeUp(youHead.x - 40, youHead.y + 40, 2.4)], [k.sheet61, closeUp(youHead.x - 40, youHead.y + 30, 2.8)]]);
    }
  })();
  const palm = shot === "palm";
  const handY = handOf(you, you.pose.armF);
  return (
    <>
      <MorningKitchen frame={frame} cam={drift(cam, frame, "photo-kitchen", 3)} debt={{ amount: DEBT.photo, was: DEBT.crumbs }}
        onTable={<g />}
        actors={
          palm ? (
            <g>
              <PalmBand x={1300} y={690} />
              {/* script v6: $270 is up on "Two hundred and seventy" and stays to the cut */}
              <PayFlap frame={frame} at={k.palm - 4} x={1300} y={520} value="$270" size={70} settle={4} />
            </g>
          ) : (
            <g>
              <Figure x={bro.x} y={bro.y} scale={bro.scale} facing={bro.facing} pose={bro.pose} head={BROTHER.head} coat={BROTHER.coat}
                cap={BROTHER.cap} {...broFace} blink={(frame + 31) % 97 < 4} held={broHeld} />
              <Figure x={you.x} y={you.y} scale={you.scale} facing={-1} pose={you.pose} {...HERO} {...youFace}
                blink={(frame + 3) % 97 < 4} held={youHeld} time={frame} />
              {frame >= k.holdOut && frame < k.h2 && (() => {
                const hb = handOf(you, you.pose.armB);
                return <Band x={hb.x} y={hb.y + 6} scale={0.9} lit />;
              })()}
              {frame >= k.you60 && <PayFlap frame={frame} at={k.you60 + 8} x={handY.x - 10} y={handY.y - 110} value="$270" size={46} />}
            </g>
          )
        } />
      {shot === "coffee" && frame < k.turn && <ForegroundHead x={1880} side="right" blur={18} />}
    </>
  );
};

// ---------------------------------------------------------------- the paper street (61)

const StreetSheet: React.FC<{ frame: number; at: number; down: number; end: number }> = ({ frame, at, down, end }) => {
  const n = 21;
  return (
    <g>
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <Draw d={`M${80 + r * 30} ${250 + r * 170} H${1160 - r * 30}`} t={ramp(frame, at + 4 + r * 4, at + 20 + r * 4)} w={4} />
          {Array.from({ length: 7 }, (_, c) => {
            const i = r * 7 + c;
            const lit = frame >= mix(at + 16, down - 6, (i * 7 % n) / n);
            const x = 130 + r * 30 + c * 140;
            const y = 140 + r * 170;
            return (
              <g key={c}>
                <rect x={x} y={y} width={96} height={96} rx={6} fill={lit ? "#1d2440" : "#efe1c6"} stroke={INK} strokeWidth={4} />
                {lit && <circle cx={x + 34} cy={y + 64} r={18} fill={PASTELS[i % 8]} />}
                {lit && <circle cx={x + 42} cy={y + 50} r={5} fill="#7ff0e6" />}
                {lit && <circle cx={x + 66} cy={y + 30} r={14} fill="#c9f3f6" opacity={0.8} />}
              </g>
            );
          })}
        </g>
      ))}
      <PayFlap frame={frame} at={at + 10} x={980} y={700} value="$270" size={70} />
      <Draw d="M1130 620 V760 M1094 720 L1130 764 L1166 720" t={ramp(frame, down, Math.min(end, down + 14))} w={14} color="#d8344f" />
    </g>
  );
};

// ---------------------------------------------------------------- the night (56)

const NightBit: React.FC<{ frame: number; k: T; shot: Name }> = ({ frame, k, shot }) => {
  if (shot === "night") {
    const b = youBody(SIT_UP);
    const hand = handOf(b, SIT_UP.armF);
    const view = camAt(frame, [[k.night, { x: hand.x + 40, y: hand.y - 120, zoom: 2.2 }], [k.lie, { x: hand.x + 40, y: hand.y - 120, zoom: 2.45 }]]);
    return (
      <BunkRoom frame={frame} mood="night" you="none" brother="asleep" jarFill={0.95} view={drift(view, frame, "photo-night", 3)}>
        <SittingYou frame={frame} face={{ brows: frame >= k.triple ? "raised" : "flat", lids: 0.1, mouth: frame >= k.triple + 6 ? "o" : "flat",
          eyes: frame >= k.triple ? 1.25 : 1, look: { x: 0.7, y: 0.4 } }} mark={0.2} />
        <PayFlap frame={frame} at={k.night + 4} until={k.triple} x={hand.x + 10} y={hand.y - 130} value="$90" size={64} />
        <PayFlap frame={frame} at={k.triple} x={hand.x + 10} y={hand.y - 130} value="$270" size={64} />
      </BunkRoom>
    );
  }
  const view = camAt(frame, [[k.lie, { x: 900, y: 560, zoom: 1.08 }], [k.kitchen, KEY_VIEW]]);
  return (
    <BunkRoom frame={frame} mood="night" you="band" brother="asleep" device={{ on: k.on }} coins={{ from: k.coins }}
      jarFill={0.95} view={drift(view, frame, "photo-lie", 3)} />
  );
};

const PhotoShot: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const shot = shotAt(frame, k);
  switch (shot) {
    case "wideStage": case "aud": case "med": case "broClose": case "hand": case "search": case "youCry":
      return <HallBit frame={frame} k={k} shot={shot} />;
    case "night": case "lie":
      return <NightBit frame={frame} k={k} shot={shot} />;
    case "photo":
      return <PhoneInsert frame={frame} hand={BROTHER.head} cam={drift(camAt(frame, [[k.h2, { x: 960, y: 560, zoom: 1.0 }], [k.stranger, { x: 940, y: 560, zoom: 1.12 }]]), frame, "photo-ph", 2)} />;
    case "tilt":
      return <PhoneInsert frame={frame} hand={HERO.head} tilt={-12 * ramp(frame, k.tilt, k.tilt + 20)} dim={0.18 * ramp(frame, k.tilt + 8, k.tilt + 22)}
        cam={camAt(frame, [[k.tilt, { x: 960, y: 560, zoom: 1.08 }], [k.hope, { x: 960, y: 560, zoom: 1.15 }]])} />;
    case "sheet61":
      return <PaperInsert frame={frame} at={k.sheet61} end={k.end} table="#6b4a33"><StreetSheet frame={frame} at={k.sheet61} down={k.down} end={k.end} /></PaperInsert>;
    default:
      return <KitchenBit frame={frame} k={k} shot={shot} />;
  }
};

const Photo: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = times(shot.clips, shot.from, shot.to);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <PhotoShot frame={shot.frame} k={k} />
      <DeviceSound at={k.on} frames={Math.max(0, k.kitchen - k.on - 8)} />
      <ClinkSound at={landings(k.coins, k.kitchen - 30)} volume={0.7} />
      <Sfx name="flip" at={[k.night + 4, k.triple, k.palm + 6]} volume={0.3} frames={20} />
      <Sfx name="paper" at={[k.sheet61]} volume={0.3} />
    </AbsoluteFill>
  );
};

export const photo: Beat = { id: "photo", firstLine: 55, Component: Photo };
