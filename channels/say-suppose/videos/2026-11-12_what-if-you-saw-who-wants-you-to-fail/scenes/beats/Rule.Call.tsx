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
import { Shade } from "./MadeTheCut.parts";
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
  if (on === "nothing") {
    // the phone, then the tilt up off it into the empty air over the screen, where a card would open
    const cam = drift(camAt(frame, [[k.nothing, { x: 960, y: 540, zoom: 1.08 }], [k.nothing + 20, { x: 960, y: 520, zoom: 1.1 }], [k.limit, { x: 960, y: -240, zoom: 1.15 }]]), frame, "video-air", 2);
    return <VideoPhoneShot frame={frame} cam={cam} mood={mood} switchAt={k.video} />;
  }
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


// ------------------------------------------------------------------------------------------------ the limit

/** The mirror line: the glass shop front ends at x 560; a reflection stands as far left of it as you stand right. */
const MIRROR = 545;
const GLASS_END = 556;

/** Line 21: you walk to the door; your reflection in the dark glass walks to meet you; you stop face to face; the
 *  camera pushes onto the face in the glass. No card opens: a reflection is the one face left untested. */
const LimitShot: React.FC<{ frame: number; k: T; mood: Mood }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.limit, "walk"], [k.glass, "glass"], [k.matter, "matter"]]);
  const walk = ramp(frame, k.limit, k.limit + 54);
  const youX = mix(900, 660, walk);
  const moving = walk > 0 && walk < 1;
  const pose = moving ? walkPose((frame - k.limit) * 0.24) : STAND;
  const mirrorX = 2 * MIRROR - youX;
  const yh = headAt(youX, STORE.floor, S, STAND, -1);
  const rh = headAt(mirrorX, STORE.floor, S, STAND, 1);
  const mid = (yh.x + rh.x) / 2;
  const cams: Record<typeof on, Camera> = {
    walk: camAt(frame, [[k.limit, { x: 640, y: 700, zoom: 1.6 }], [k.glass, { x: 600, y: 690, zoom: 1.75 }]]),
    glass: camAt(frame, [[k.glass, closeUp(mid, yh.y + 10, 2.5)], [k.matter, closeUp(mid - 10, yh.y + 10, 2.65)]]),
    matter: camAt(frame, [[k.matter, closeUp(mid - 20, yh.y + 10, 2.7)], [k.end, closeUp(rh.x + 10, rh.y + 5, 3.6)]]),
  };
  const cam = drift(cams[on], frame, "limit", 2);
  const settle = ramp(frame, k.glass, k.glass + 20);
  const face: Look = on === "walk"
    ? { brows: "flat", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.6, y: 0.3 } }
    : { brows: settle > 0.5 ? "raised" : "flat", lids: mix(0.3, 0.05, settle), mouth: "flat", eyes: 1.05, look: { x: 1, y: 0 } };
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
      </g>
    </g>
  );
  return (
    <StoreShot frame={frame} cam={cam} mood={mood} youX={youX} youFacing={-1} youPose={pose} youFace={face} youHeld={LETTER}
      mjFace={{ brows: "none", lids: 0.4, mouth: Math.floor(frame / 6) % 2 ? "flat" : "smile", eyes: 1, look: { x: 0.5, y: 0.3 } }} mjHeld={HALF}
      counterExtra={reflection} />
  );
};
