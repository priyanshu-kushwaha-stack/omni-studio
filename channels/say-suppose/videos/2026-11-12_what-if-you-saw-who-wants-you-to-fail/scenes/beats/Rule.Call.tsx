// The Rule, lines 18-21 (v5): the call to your sister (v4 lines 17, 18/50, 19, shots kept), then the flagged limit.
//
//   18  insert: your phone calling one contact, a peach avatar; the warehouse wide, then waist up on her: the vest, the
//       phone at her ear, a forklift crossing behind; you, phone to ear: "You tell her."
//   19  her, laughing: "Say it again." (her own voice)
//   20  (round 17) "You do.": you, phone to ear; "You even switch on video": the phone close, the screen flips to her
//       face, grinning, the racking behind her (Rule.Video.tsx); "so you can see her grin": your grin back into the
//       phone in your hand; "And nothing opens over a screen.": her face on the phone again, the camera tilting up off
//       it into the empty air where a card would be
//   21  NEW, the flagged limit: "So. Only out loud. Only to a face you can see.": you walk to the glass door to leave,
//       and in the dark glass your reflection walks to meet you; "Remember that.": you stop, face to face with it;
//       "It's going to matter.": the camera pushes onto the face in the glass (the plant for the window at the end)
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { phone } from "@whatif/kit/sets/Phone";
import { setLook } from "@whatif/kit/sets/common";
import { LookContext } from "@whatif/kit/stage/Look";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { headAt, Ponytail, Vest } from "../parts";
import { blinking, camAt, current, HERO, JIYOON, linear, mix, ramp } from "../shared";
import { STORE, StoreBack, storeLook } from "../sets/Store";
import { aimArm, handAt, Shade } from "./MadeTheCut.parts";
import { DEPOT, DepotBack, depotLights } from "./Rule.Warehouse";
import { VideoPhoneShot } from "./Rule.Video";
import { earPhone, HALF, LETTER, Phone, S, StoreShot, type Look, type Mood } from "./Rule.Store";
import type { T } from "./Rule";

const PhoneInsert: React.FC<{ frame: number; k: T; mood: Mood }> = ({ frame, k, mood }) => {
  const cam = drift(camAt(frame, [[k.phone, { x: 1180, y: 520, zoom: 1.45 }], [k.her, { x: 1180, y: 540, zoom: 1.6 }]]), frame, "phone", 2);
  const press = ramp(frame, k.phone + 8, k.phone + 22);
  const options = { ...phone.defaults, mode: "call" as const, contact: JIYOON.head, thumb: mix(0.95, 0.74, press), behind: "desk" as const };
  const props = { cam, mood, frame, options };
  return (
    <LookContext.Provider value={storeLook(mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={<><StoreBack cam={cam} mood={mood} frame={frame} /><rect x={-1400} y={-900} width={4800} height={2600} fill="#0d0f18" opacity={0.45} /></>}
        actors={phone.Mid?.(props)} />
    </LookContext.Provider>
  );
};

/** Your sister at the warehouse, the phone to her ear (her back arm), the vest, the hair tied back. */
const DepotShot: React.FC<{ frame: number; k: T; cam: Camera; face: Look; mood: Mood }> = ({ frame, k, cam, face, mood }) => {
  const d = DEPOT.jiyoon;
  const e = earPhone({ x: d.x, y: d.y, scale: d.scale, facing: d.facing, pose: STAND });
  const pose = e.pose;
  // the forklift crosses behind her through the wide and the waist-up shot
  const lift = mix(0.08, 0.72, linear(frame, k.her, k.tell));
  const actors = (
    <>
      <Phone at={e.phone} scale={d.scale} facing={-1} />
      <Ponytail x={d.x} y={d.y} scale={d.scale} pose={pose} facing={-1} />
      <Figure x={d.x} y={d.y} scale={d.scale} facing={-1} pose={pose} head={JIYOON.head} coat={JIYOON.coat} {...face} blink={blinking(frame, 5)} time={frame} />
      <Vest x={d.x} y={d.y} scale={d.scale} pose={pose} facing={-1} />
    </>
  );
  return (
    <LookContext.Provider value={setLook(depotLights(), mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }} back={<DepotBack cam={cam} lift={lift} />} actors={actors} />
    </LookContext.Provider>
  );
};

/** Lines 18-21: the call, then the limit. */
export const CallShots: React.FC<{ frame: number; k: T; mood: Mood }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.phone, "phone"], [k.her, "her"], [k.herClose, "herClose"], [k.tell, "tell"], [k.again, "again"], [k.you, "grin"], [k.video, "video"], [k.grinBack, "grinBack"], [k.nothing, "nothing"], [k.limit, "limit"]]);
  if (on === "phone") return <PhoneInsert frame={frame} k={k} mood={mood} />;
  const jh = headAt(DEPOT.jiyoon.x, DEPOT.jiyoon.y, DEPOT.jiyoon.scale, STAND, -1);
  if (on === "video") {
    const cam = drift(camAt(frame, [[k.video, { x: 960, y: 580, zoom: 1.0 }], [k.grinBack, { x: 960, y: 520, zoom: 1.12 }]]), frame, "video", 2);
    return <VideoPhoneShot frame={frame} cam={cam} mood={mood} switchAt={k.video} />;
  }
  if (on === "nothing") return <SplitCheck frame={frame} k={k} mood={mood} />;
  if (on === "limit") return <LimitShot frame={frame} k={k} mood={mood} />;
  if (on === "her" || on === "herClose" || on === "again") {
    const cams: Record<"her" | "herClose" | "again", Camera> = {
      her: camAt(frame, [[k.her, { x: 1060, y: 640, zoom: 1.2 }], [k.herClose, { x: 1075, y: 640, zoom: 1.3 }]]),
      // waist up: her head high in frame, the vest's stripe and the phone readable, the aisle and the forklift behind
      herClose: camAt(frame, [[k.herClose, { x: jh.x - 70, y: jh.y + 120, zoom: 2.35 }], [k.tell, { x: jh.x - 60, y: jh.y + 110, zoom: 2.5 }]]),
      again: camAt(frame, [[k.again, closeUp(jh.x - 70, jh.y - 10, 2.9)], [k.you, closeUp(jh.x - 70, jh.y - 10, 3.05)]]),
    };
    const faces: Record<"her" | "herClose" | "again", Look> = {
      her: { brows: "raised", lids: 0.2, mouth: "smile", eyes: 1, look: { x: 0.4, y: 0.4 } },
      herClose: { brows: "raised", lids: 0.15, mouth: frame > k.herClose + 30 ? "open" : "smile", eyes: 1.1, look: { x: 0.6, y: 0.1 } },
      again: { brows: "raised", lids: 0.45, mouth: Math.floor((frame - k.again) / 6) % 3 === 2 ? "smile" : "open", eyes: 1.05, look: { x: 0.8, y: 0 } },
    };
    return <DepotShot frame={frame} k={k} cam={drift(cams[on], frame, "depot", 3)} face={faces[on]} mood={mood} />;
  }
  const you = headAt(STORE.door.x, STORE.floor, S, STAND, 1);
  const cams: Record<"tell" | "grin" | "grinBack", Camera> = {
    tell: camAt(frame, [[k.tell, closeUp(you.x + 40, you.y, 2.3)], [k.again, closeUp(you.x + 40, you.y, 2.4)]]),
    // your grin, waist up and wider, with him at the counter behind you chewing (the friend you just read)
    grin: camAt(frame, [[k.you, { x: 930, y: 700, zoom: 1.5 }], [k.video, { x: 920, y: 695, zoom: 1.55 }]]),
    // your grin back into the phone held out in front of you
    grinBack: camAt(frame, [[k.grinBack, closeUp(you.x + 70, you.y + 40, 2.5)], [k.nothing, closeUp(you.x + 70, you.y + 40, 2.7)]]),
  };
  const faces: Record<"tell" | "grin" | "grinBack", Look> = {
    tell: { brows: "raised", lids: 0, mouth: "open", eyes: 1.1, look: { x: 0.9, y: 0.1 } },
    grin: { brows: "raised", lids: 0.1, mouth: Math.floor((frame - k.you) / 7) % 3 === 0 ? "smile" : "open", eyes: 1.05, look: { x: 0.8, y: 0.2 } },
    grinBack: { brows: "raised", lids: Math.floor((frame - k.grinBack) / 8) % 3 === 1 ? 0.5 : 0.1, mouth: Math.floor((frame - k.grinBack) / 8) % 3 === 1 ? "open" : "smile", eyes: 1.05, look: { x: 0.7, y: 0.6 } },
  };
  return (
    <StoreShot frame={frame} cam={drift(cams[on], frame, "call", 3)} mood={mood} youX={STORE.door.x} youFace={faces[on]} youPhone={on === "grinBack" ? "hand" : "ear"} youHeld={LETTER}
      mjFace={{ brows: "none", lids: 0.4, mouth: on === "grin" && Math.floor(frame / 6) % 2 ? "flat" : "smile", eyes: 1, look: { x: 0.5, y: 0.3 } }} mjHeld={HALF} />
  );
};


/** "And nothing opens over a screen." (v7, outside review: a split screen): on the right her face fills your phone, the
 *  space over her head empty; on the left you lift the phone and look above it, turn it sideways, and peer behind it. */
const SplitCheck: React.FC<{ frame: number; k: T; mood: Mood }> = ({ frame, k, mood }) => {
  const span = k.limit - k.nothing;
  const b = (p: number) => k.nothing + Math.round(span * p);
  const lift = ramp(frame, b(0.04), b(0.16));
  const side = ramp(frame, b(0.42), b(0.52));
  const behind = ramp(frame, b(0.7), b(0.8));
  const X = STORE.door.x;
  const pose = { ...STAND, lean: -behind * 10, tilt: side * 12 - behind * 6, armB: [mix(30, 105, lift), mix(70, 40, lift)] as [number, number] };
  const body = { x: X, y: STORE.floor, scale: S, facing: 1 as const, pose };
  const hand = handAt(body, "back");
  const yh = headAt(X, STORE.floor, S, pose, 1);
  const face: Look = behind > 0.5 ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.15, look: { x: 0.2, y: -0.2 } }
    : side > 0.5 ? { brows: "worry", lids: 0, mouth: "flat", eyes: 1.1, look: { x: 0.6, y: -0.3 } }
    : lift > 0.5 ? { brows: "raised", lids: 0, mouth: "flat", eyes: 1.15, look: { x: 0.5, y: -0.95 } }
    : { brows: "raised", lids: 0.1, mouth: "smile", eyes: 1.05, look: { x: 0.6, y: -0.2 } };
  const z = 2.2;
  const leftCam = drift({ x: yh.x + 70 + 480 / z, y: yh.y + 90, zoom: z }, frame, "split-you", 2);
  const phone = (
    <g transform={`rotate(${side * 90 - behind * 30} ${hand.x} ${hand.y})`}><Phone at={hand} scale={S * 0.9} facing={1} /></g>
  );
  return (
    <>
      <div style={{ position: "absolute", inset: 0, clipPath: "inset(0 50% 0 0)" }}>
        <StoreShot frame={frame} cam={leftCam} mood={mood} youX={X} youFace={face} youPose={pose} youHeld={LETTER}
          mjFace={{ brows: "none", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 0.5, y: 0.3 } }} mjHeld={HALF} youExtra={phone} />
      </div>
      <div style={{ position: "absolute", inset: 0, clipPath: "inset(0 0 0 50%)" }}>
        <VideoPhoneShot frame={frame} cam={drift({ x: 480, y: 560, zoom: 1.0 }, frame, "split-phone", 1.5)} mood={mood} switchAt={k.video} emptyCard />
      </div>
      <div style={{ position: "absolute", left: 954, top: 0, width: 12, height: 1080, background: "#f2e6c8" }} />
    </>
  );
};

// ------------------------------------------------------------------------------------------------ the limit

/** The mirror line: the glass shop front ends at x 560; a reflection stands as far left of it as you stand right. */
const MIRROR = 545;
const GLASS_END = 556;

/** A face drawn by a finger in breath on the glass: a fog patch, then a circle, two eyes and a smile drawn in clear
 *  strokes as `draw` runs 0..1. World units, (x, y) its centre, r the drawn face's radius. */
const FogFace: React.FC<{ x: number; y: number; r: number; fog: number; draw: number }> = ({ x, y, r, fog, draw }) => {
  if (fog <= 0) return null;
  const ring = Math.PI * 2 * r;
  const seg = (from: number, to: number) => Math.max(0, Math.min(1, (draw - from) / (to - from)));
  return (
    <g>
      <ellipse cx={x} cy={y} rx={r * 1.7} ry={r * 1.5} fill="#e8eef2" opacity={0.32 * fog} />
      <g stroke="#0d0f18" strokeWidth={r * 0.13} strokeLinecap="round" fill="none" opacity={0.75}>
        <circle cx={x} cy={y} r={r} strokeDasharray={`${ring * seg(0, 0.55)} ${ring}`} transform={`rotate(-90 ${x} ${y})`} />
        {seg(0.55, 0.65) > 0 && <line x1={x - r * 0.35} y1={y - r * 0.25} x2={x - r * 0.35} y2={y - r * 0.25 + r * 0.2 * seg(0.55, 0.65)} />}
        {seg(0.65, 0.75) > 0 && <line x1={x + r * 0.35} y1={y - r * 0.25} x2={x + r * 0.35} y2={y - r * 0.25 + r * 0.2 * seg(0.65, 0.75)} />}
        {seg(0.75, 1) > 0 && <path d={`M${x - r * 0.45} ${y + r * 0.2} Q${x} ${y + r * 0.65} ${x + r * 0.45} ${y + r * 0.2}`} strokeDasharray={`${r * 1.4 * seg(0.75, 1)} ${r * 2}`} />}
      </g>
    </g>
  );
};

/** Line 21: you walk to the door; your reflection in the dark glass walks to meet you; face to face, you breathe on the
 *  glass and, on "Remember that", draw a face in the fog with your finger; the camera pushes onto the face in the
 *  glass beside it. No card opens: a reflection is the one face left untested (the plant for the window). */
const LimitShot: React.FC<{ frame: number; k: T; mood: Mood }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.limit, "walk"], [k.glass, "glass"], [k.draw, "draw"], [k.matter, "matter"]]);
  const walk = ramp(frame, k.limit, k.limit + 50);
  const youX = mix(900, 660, walk);
  const moving = walk > 0 && walk < 1;
  const base = moving ? walkPose((frame - k.limit) * 0.24) : STAND;
  const yh0 = headAt(youX, STORE.floor, S, STAND, -1);
  const fogAt = { x: MIRROR + 2, y: yh0.y + 40 };
  const reachUp = ramp(frame, k.draw - 6, k.draw + 6) * (1 - ramp(frame, k.matter + 10, k.matter + 22));
  const trace = { x: fogAt.x + 10 + Math.sin((frame - k.draw) / 4) * 18 * reachUp, y: fogAt.y + Math.cos((frame - k.draw) / 4) * 18 * reachUp };
  const pose = reachUp > 0
    ? { ...base, armF: lerpArm(base.armF, aimArm({ x: youX, y: STORE.floor, scale: S, facing: -1, pose: base }, trace), reachUp) }
    : base;
  const mirrorX = 2 * MIRROR - youX;
  const yh = headAt(youX, STORE.floor, S, STAND, -1);
  const rh = headAt(mirrorX, STORE.floor, S, STAND, 1);
  const mid = (yh.x + rh.x) / 2;
  const cams: Record<typeof on, Camera> = {
    walk: camAt(frame, [[k.limit, { x: 640, y: 700, zoom: 1.6 }], [k.glass, { x: 600, y: 690, zoom: 1.75 }]]),
    glass: camAt(frame, [[k.glass, closeUp(mid, yh.y + 10, 2.5)], [k.draw, closeUp(mid - 10, yh.y + 10, 2.6)]]),
    draw: camAt(frame, [[k.draw, closeUp(fogAt.x + 30, fogAt.y - 10, 3.0)], [k.matter, closeUp(fogAt.x + 20, fogAt.y - 20, 3.2)]]),
    matter: camAt(frame, [[k.matter, closeUp(mid - 20, yh.y + 10, 2.7)], [k.end, closeUp(rh.x + 30, rh.y + 15, 3.4)]]),
  };
  const cam = drift(cams[on], frame, "limit", 2);
  const settle = ramp(frame, k.glass, k.glass + 20);
  const breathing = frame >= k.glass + 12 && frame < k.glass + 26;
  const face: Look = on === "walk"
    ? { brows: "flat", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.6, y: 0.3 } }
    : { brows: settle > 0.5 ? "raised" : "flat", lids: mix(0.3, 0.05, settle), mouth: breathing ? "o" : "flat", eyes: 1.05, look: on === "draw" ? { x: 1, y: 0.25 } : { x: 1, y: 0 } };
  const fog = ramp(frame, k.glass + 14, k.glass + 26);
  const draw = linear(frame, k.draw + 2, k.matter - 4);
  // the reflection: you, mirrored, dim, only where there is glass
  const reflection = (
    <g>
      <defs>
        <clipPath id="limit-glass"><rect x={-1400} y={130} width={GLASS_END + 1400} height={810} /></clipPath>
      </defs>
      <g clipPath="url(#limit-glass)">
        <Shade id="limit-glass" x={rh.x} y={rh.y + 40} r={260} strength={0.55} />
        <g opacity={0.38}>
          <Figure x={mirrorX} y={STORE.floor} scale={S} facing={1} pose={pose} {...HERO} {...face} blink={blinking(frame, 0)} time={frame} held={LETTER} />
        </g>
        {/* a streak of sheen across the glass, over the reflection */}
        <path d={`M${rh.x - 160} ${rh.y + 260} l70 0 l120 -420 l-70 0Z`} fill="#fff" opacity={0.07} />
        <FogFace x={fogAt.x - 40} y={fogAt.y - 20} r={yh.r * 0.55} fog={fog} draw={draw} />
      </g>
    </g>
  );
  return (
    <StoreShot frame={frame} cam={cam} mood={mood} youX={youX} youFacing={-1} youPose={pose} youFace={face} youHeld={LETTER}
      mjFace={{ brows: "none", lids: 0.4, mouth: Math.floor(frame / 6) % 2 ? "flat" : "smile", eyes: 1, look: { x: 0.5, y: 0.3 } }} mjHeld={HALF}
      counterExtra={reflection} />
  );
};

const lerpArm = (a: [number, number], b: [number, number], t: number): [number, number] => [mix(a[0], b[0], t), mix(a[1], b[1], t)];
