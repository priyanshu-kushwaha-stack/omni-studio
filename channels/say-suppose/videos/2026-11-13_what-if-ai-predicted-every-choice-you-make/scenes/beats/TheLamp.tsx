// Beat "The Lamp" (script.md, ## [00:00] The Lamp; narration lines 0-3). The performed skit before the narrator, cause
// before effect: the counter at closing in the thumbnail's frame (you left, your best friend right, the tin box between),
// the coins, the key, his hand, "Trust me?", the pocketed key; behind you the city worker clips the teal lamp to the
// pillar, taps it twice, it blinks; THEN the tags drop over every head; the two of you read each other's; the half-price
// coffee next door.
//
//   lead-in   frame 0 is the thumbnail's counter (teal: no tags yet, the city lamp still in the worker's hand); the
//             first coin hits the tin at frame 8; four coins, the lid shuts; insert: the key turns in the lock; his
//             hand slides out palm up and he grins
//   0         "Trust me?" (his own voice); you grin and lift the key so he can watch it, then pocket it, slow
//   hold      the ladder: he shrugs, both hands up; the worker clips the lamp to the pillar, taps it twice, it blinks
//   1         "There we go." (the worker's own voice)
//   hold      the wide: a flap, then every card drops over every head in the court; the close (the thumbnail's frame,
//             teal): POCKETS KEY 91% over you, HOLDS OUT HAND 96% over him, both tick teal; you read each other's
//   hold      the coffee stall: she slides an iced coffee across without looking; his card flaps PAYS 97%; he pays
//             staring up; her board 3.00 to 1.50; he looks at the board, then at her
//   2         "Half?" (his own voice)
//   3         "Half." (the coffee seller's own voice), close on her
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip as LineClip } from "@whatif/kit/timeline";
import { BoardSounds, LampSound, TagSounds, TealLamp, type BoardKey, type TagKey } from "../device";
import { aimArm, headAt, moodNow } from "../kit";
import { camAt, current, lineEnd, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { COURT, Key } from "../sets/FoodCourt";
import {
  CL, Cloth, CloseShot, Coin, CourtShot, EXTRAS, firstTags, type CourtTags, friendBody, IcedCoffee, LOCK, Palm, pillarLamp, workerReach,
  youBody, type Face, type Mood,
} from "./TheLamp.Court";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: LineClip[], to: number) {
  const from = (i: number) => clips[i].from;
  const end = (i: number) => lineEnd(clips, i);
  const L = from(0);
  const u = (f: number) => Math.round((L * f) / 102); // authored for the 3.4 s lead-in
  const g = from(2) - end(1); // the 5 s hold: the tags, then the coffee
  const e1 = end(1);
  const coffee = e1 + Math.round(g * 0.6);
  return {
    releases: [3, 21, 39, 57].map(u), // coins leave your hand; each hits the tin 5 frames later (the first at frame 8)
    lid: u(64), // the lid comes down
    turn: u(74), // insert: the key turns in the lock
    keyOut: u(88), // the key comes out in your hand
    handIn: u(80), // his hand slides out, palm up
    grin: u(92),
    back: u(94), // back to the close from the insert
    trust: from(0), // "Trust me?"
    trustEnd: end(0),
    show: end(0), // you lift the key so he can see it
    pocket: end(0) + 10, // down it goes, slow
    ladder: end(0) + Math.round((from(1) - end(0)) * 0.35), // the ladder: the shrug and the lamp
    clip: end(0) + Math.round((from(1) - end(0)) * 0.45),
    tap1: end(0) + Math.round((from(1) - end(0)) * 0.6),
    tap2: end(0) + Math.round((from(1) - end(0)) * 0.72),
    lampOn: end(0) + Math.round((from(1) - end(0)) * 0.82),
    there: from(1), // "There we go."
    thereEnd: e1,
    wide: e1 + 2,
    drop: e1 + 8, // the first flap, over the worker; a hundred after it
    close: e1 + Math.round(g * 0.24), // the thumbnail's frame, teal
    tick: e1 + Math.round(g * 0.33),
    read: e1 + Math.round(g * 0.44),
    brows: e1 + Math.round(g * 0.5),
    coffee,
    slide: coffee + 2,
    take: coffee + 14,
    pays: coffee + 16,
    payCoin: coffee + 24,
    paid: coffee + 32,
    board: coffee + 36,
    lookBoard: coffee + 38,
    lookHer: from(2) - 8,
    half: from(2),
    her: from(3),
    halfEnd: end(3),
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ the tags

function tagKeys(k: T) {
  const first = firstTags(k.drop, k.tick);
  const friend: TagKey[] = [...first.friend, { at: k.pays, text: "PAYS", pct: 97, state: "new" }, { at: k.paid, text: "PAYS", pct: 97, state: "tick" }];
  const out: CourtTags = { ...first, friend };
  return out;
}

const priceKeys = (k: T): BoardKey[] => [{ at: 0, value: "3.00" }, { at: k.board, value: "1.50" }];

// ------------------------------------------------------------------------------------------------ the counter close

const CLOSE: Camera = { x: 960, y: 540, zoom: 1 };
const BOX_IN = { x: CL.box.x + 10, y: CL.top - 70 }; // where a coin drops into the open box
const TILL = { x: 700, y: 1030 }; // below the counter, out of sight

/** Your front hand's target at a frame of the lead-in: coins from the till to the box, the lid, the lock, the key up. */
function youHand(frame: number, k: T): { x: number; y: number } {
  if (frame >= k.pocket) return { x: mix(760, 560, ramp(frame, k.pocket, k.pocket + 26)), y: mix(780, 1120, ramp(frame, k.pocket, k.pocket + 26)) };
  if (frame >= k.keyOut) return { x: mix(LOCK.x - 70, 760, ramp(frame, k.keyOut, k.keyOut + 10)), y: mix(LOCK.y, 780, ramp(frame, k.keyOut, k.keyOut + 10)) };
  if (frame >= k.turn - 4) return { x: LOCK.x - 92, y: LOCK.y + 6 };
  if (frame >= k.lid) return { x: CL.box.x - 110, y: CL.top - CL.box.h - 10 + 30 * ramp(frame, k.lid, k.lid + 8) };
  const over = { x: BOX_IN.x - 10, y: BOX_IN.y - 70 };
  let r = k.releases[0];
  for (const x of k.releases) if (frame >= x) r = x;
  const t = frame - r;
  if (frame < k.releases[0] || t < 4 || r === k.releases[k.releases.length - 1]) return over;
  if (t < 10) return { x: mix(over.x, TILL.x, ramp(frame, r + 4, r + 10)), y: mix(over.y, TILL.y, ramp(frame, r + 4, r + 10)) };
  return { x: mix(TILL.x, over.x, ramp(frame, r + 10, r + 18)), y: mix(TILL.y, over.y, ramp(frame, r + 10, r + 18)) };
}

const KEY_HELD = <Key x={10} y={-4} scale={0.17} rotate={-24} glint />;
const COIN_HELD = <Coin x={4} y={-2} r={4.5} />;

/** The open-and-shut of the lid, the coins in flight and in the box. */
function boxState(frame: number, k: T) {
  const open = 1 - ramp(frame, k.lid + 1, k.lid + 8);
  const landed = k.releases.filter((r) => frame >= r + 5).length;
  const coins = k.releases.filter((r) => frame >= r && frame < r + 5).map((r) => ({ x: BOX_IN.x - 10, y: mix(BOX_IN.y - 60, BOX_IN.y, linear(frame, r, r + 5)) }));
  const key = frame >= k.turn - 4 && frame < k.keyOut ? linear(frame, k.turn, k.turn + 10) * 0.5 : null;
  return { open, landed, coins, key };
}

/** Lead-in and line 0: the coins, the lid, his hand, "Trust me?", the key up and into your pocket. */
const Counting: React.FC<{ frame: number; k: T; mood: Mood }> = ({ frame, k, mood }) => {
  const insertOn = frame >= k.turn - 2 && frame < k.back;
  const cam = insertOn
    ? drift(camAt(frame, [[k.turn - 2, insert(LOCK.x - 40, LOCK.y - 40, 2.6)], [k.back, insert(LOCK.x - 40, LOCK.y - 40, 2.75)]]), frame, "lock", 2)
    : drift(camAt(frame, [[0, CLOSE], [k.trust, { x: 960, y: 560, zoom: 1.05 }], [k.ladder, { x: 900, y: 560, zoom: 1.1 }]]), frame, "close-a", 2);
  const target = youHand(frame, k);
  const youPose: Pose = { ...STAND, lean: 6, tilt: frame >= k.grin ? 6 : 2, armF: aimArm(youBody(STAND), target) };
  const holdingCoin = frame < k.lid && k.releases.some((r) => frame >= r - 8 && frame < r);
  const youHeld = frame >= k.keyOut && frame < k.pocket + 22 ? KEY_HELD : holdingCoin || frame < k.releases[0] ? COIN_HELD : undefined;
  const youFace: Face = frame >= k.show
    ? { brows: "raised", lids: 0.15, mouth: "smirk", eyes: 1.05, look: { x: 1, y: 0.1 } }
    : frame >= k.grin ? { brows: "raised", lids: 0, mouth: "smile", eyes: 1, look: { x: 1, y: 0.15 } }
    : frame >= k.handIn + 4 ? { brows: "none", lids: 0.1, mouth: "flat", eyes: 1, look: { x: 1, y: 0.3 } }
    : { brows: "none", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.7 } };
  // him: wiping the counter, then the open hand slides out, palm up
  const out = ramp(frame, k.handIn, k.handIn + 14);
  const wipe = { x: 1290 + Math.sin(frame / 4) * 50, y: CL.top - 8 };
  const palm = { x: 1200, y: 865 };
  const fTarget = { x: mix(wipe.x, palm.x, out), y: mix(wipe.y, palm.y, out) };
  const fPose: Pose = { ...STAND, lean: 10, tilt: frame >= k.grin - 6 ? -6 : 8, armF: aimArm(friendBody({ ...STAND, lean: 10 }), fTarget) };
  const talking = frame >= k.trust && frame < k.trustEnd && Math.floor((frame - k.trust) / 5) % 2 === 0;
  const fFace: Face = frame >= k.show
    ? { brows: "raised", lids: 0.1, mouth: "smile", eyes: 1.05, look: { x: 0.9, y: 0.45 } }
    : frame >= k.grin - 6 ? { brows: "raised", lids: 0, mouth: talking ? "open" : "smile", eyes: 1.05, look: { x: 1, y: 0.1 } }
    : { brows: "none", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.5, y: 0.8 } };
  const b = boxState(frame, k);
  return (
    <CloseShot frame={frame} cam={cam} mood={mood}
      you={{ pose: youPose, face: youFace, held: youHeld }}
      friend={{ pose: fPose, face: fFace, held: out > 0.5 ? <Palm color="#f4b393" /> : <Cloth /> }}
      box={{ open: b.open, key: b.key, coinsIn: 4 + b.landed }} coins={b.coins} />
  );
};

// ------------------------------------------------------------------------------------------------ the ladder and the lamp

const SHRUG: Pose = { ...STAND, tilt: -8, armF: [40, 112], armB: [-40, -112] };
const LADDER_CAM_A: Camera = { x: 620, y: 470, zoom: 1.2 };
const LADDER_CAM_B: Camera = { x: 560, y: 430, zoom: 1.32 };

/** The hold after line 0 and line 1: the pocket finishes, he shrugs, the worker clips the lamp, taps it twice, it blinks;
 *  "There we go." */
const LadderShot: React.FC<{ frame: number; k: T; mood: Mood }> = ({ frame, k, mood }) => {
  const cam = drift(camAt(frame, [[k.ladder, LADDER_CAM_A], [k.thereEnd, LADDER_CAM_B]]), frame, "ladder", 2);
  const lamp = pillarLamp(cam);
  const tapping = (frame >= k.tap1 && frame < k.tap1 + 4) || (frame >= k.tap2 && frame < k.tap2 + 4);
  const clipped = frame >= k.clip;
  const near = { x: lamp.x + 34, y: lamp.y + 30 };
  const hand = !clipped ? { x: mix(lamp.x + 60, lamp.x + 4, ramp(frame, k.ladder, k.clip)), y: mix(lamp.y + 90, lamp.y + 4, ramp(frame, k.ladder, k.clip)) }
    : tapping ? { x: lamp.x + 6, y: lamp.y + 2 } : frame >= k.lampOn + 6 ? { x: lamp.x + 70, y: lamp.y + 130 } : near;
  const talking = frame >= k.there && frame < k.thereEnd && Math.floor((frame - k.there) / 5) % 2 === 0;
  const shrug = ramp(frame, k.ladder, k.ladder + 10) * (1 - ramp(frame, k.there + 6, k.there + 20));
  const fPose: Pose = { ...STAND, tilt: -8 * shrug, armF: [mix(9, SHRUG.armF[0], shrug), mix(10, SHRUG.armF[1], shrug)], armB: [mix(-7, SHRUG.armB[0], shrug), mix(8, SHRUG.armB[1], shrug)] };
  const lit = frame >= k.lampOn + 4;
  return (
    <CourtShot frame={frame} cam={cam} mood={mood}
      you={{ pose: { ...STAND, armF: [8, 20] }, face: lit ? { brows: "raised", mouth: "smile", eyes: 1, look: { x: -0.9, y: -0.5 } } : { brows: "none", mouth: "smirk", eyes: 1, look: { x: 1, y: 0.1 } } }}
      friend={{ pose: fPose, face: lit ? { brows: "raised", mouth: "flat", eyes: 1.1, look: { x: 0.9, y: -0.5 } } : { brows: "raised", mouth: "smile", eyes: 1, look: { x: 1, y: 0.1 } } }}
      seller={{ face: { lids: 0.3, look: { x: 0.3, y: 0.7 } } }}
      worker={{
        pose: { ...workerReach(hand), armB: [-30, 40] },
        face: { brows: lit ? "raised" : "flat", lids: lit ? 0 : 0.2, mouth: talking ? "open" : lit ? "smile" : "flat", eyes: 1, look: { x: 0.9, y: -0.6 } },
        held: !clipped ? <TealLamp frame={frame} x={0} y={-4} size={14} /> : undefined,
      }}
      lampHeld={!clipped} lampOn={k.lampOn} />
  );
};

// ------------------------------------------------------------------------------------------------ the tags drop

/** Each extra looks up as its card lands. */
const lookUps = (frame: number, tags: ReturnType<typeof tagKeys>) =>
  Object.fromEntries(EXTRAS.map((e) => [e.id, ramp(frame, tags[e.id]![0].at + 4, tags[e.id]![0].at + 14)]));

/** The wide: the first flap over the worker, then a hundred. */
const DropWide: React.FC<{ frame: number; k: T; mood: Mood; tags: ReturnType<typeof tagKeys> }> = ({ frame, k, mood, tags }) => {
  const cam = drift(camAt(frame, [[k.wide, { x: 960, y: 520, zoom: 1.0 }], [k.close, { x: 960, y: 500, zoom: 1.06 }]]), frame, "drop", 3);
  const upYou = ramp(frame, tags.you![0].at + 4, tags.you![0].at + 12);
  const upHim = ramp(frame, tags.friend![0].at + 4, tags.friend![0].at + 12);
  return (
    <CourtShot frame={frame} cam={cam} mood={mood} tags={tags} up={lookUps(frame, tags)} pillarKeys={[{ at: 0, value: "100" }]}
      you={{ pose: { ...STAND, tilt: -10 * upYou, armF: [8, 20] }, face: { brows: "raised", mouth: upYou > 0.5 ? "o" : "smile", eyes: 1.1, look: { x: 0.2, y: -1 * upYou } } }}
      friend={{ pose: { ...STAND, tilt: -10 * upHim }, face: { brows: "raised", mouth: upHim > 0.5 ? "o" : "smile", eyes: 1.1, look: { x: 0.2, y: -1 * upHim } } }}
      seller={{ face: { brows: "raised", lids: 0, look: { x: 0.1, y: -0.9 } } }}
      worker={{ pose: { ...workerReach({ x: 290, y: 470 }), armB: [-30, 40] }, face: { brows: "raised", mouth: "o", eyes: 1.2, look: { x: 0.2, y: -1 } } }}
      lampOn={k.lampOn} />
  );
};

/** The close again, teal: the thumbnail's frame with his tag over his head. You look up; the ticks; you read each other's. */
const ReadClose: React.FC<{ frame: number; k: T; mood: Mood; tags: ReturnType<typeof tagKeys> }> = ({ frame, k, mood, tags }) => {
  const cam = drift(camAt(frame, [[k.close, CLOSE], [k.coffee, { x: 960, y: 530, zoom: 1.04 }]]), frame, "close-b", 2);
  const reading = frame >= k.read;
  const brows = ramp(frame, k.brows, k.brows + 6);
  const youFace: Face = reading
    ? { brows: "raised", lids: 0, mouth: brows > 0.5 ? "o" : "flat", eyes: 1 + 0.15 * brows, look: { x: 1, y: -0.75 } }
    : { brows: "raised", lids: 0, mouth: "flat", eyes: 1.05, look: { x: 0.25, y: -1 } };
  const fFace: Face = reading
    ? { brows: "raised", lids: 0, mouth: brows > 0.5 ? "o" : "smile", eyes: 1 + 0.35 * brows, look: { x: 1, y: -0.8 } }
    : { brows: "raised", lids: 0, mouth: "smile", eyes: 1.1, look: { x: 0.2, y: -1 } };
  return (
    <CloseShot frame={frame} cam={cam} mood={mood} teal={k.lampOn}
      you={{ pose: { ...STAND, lean: 4, tilt: reading ? -4 : -12, armF: [6, 14] }, face: youFace }}
      friend={{ pose: { ...STAND, lean: 6, tilt: reading ? -10 - 6 * brows : -14 }, face: fFace }}
      tags={{ you: tags.you!, friend: tags.friend! }} />
  );
};

// ------------------------------------------------------------------------------------------------ the coffee

const HIM_AT = 1345;

/** The hold's last two seconds and lines 2-3: the iced coffee, PAYS 97%, the board halves, "Half?", "Half." */
const CoffeeShot: React.FC<{ frame: number; k: T; mood: Mood; tags: ReturnType<typeof tagKeys> }> = ({ frame, k, mood, tags }) => {
  const sellerHead = headAt(COURT.coffee.seller.x, COURT.floor, COURT.scale, STAND, -1);
  const cam = frame >= k.her
    ? drift(camAt(frame, [[k.her, closeUp(sellerHead.x - 60, sellerHead.y - 110, 1.85)], [k.end, closeUp(sellerHead.x - 60, sellerHead.y - 110, 1.95)]]), frame, "her", 2)
    : drift(camAt(frame, [[k.coffee, { x: 1440, y: 500, zoom: 1.55 }], [k.her, { x: 1450, y: 490, zoom: 1.68 }]]), frame, "coffee", 2.5);
  const cupX = mix(1600, 1440, ramp(frame, k.slide, k.slide + 12));
  const cup = { x: cupX, y: COURT.coffee.top - 26 };
  const taken = frame >= k.take;
  const reachCup = ramp(frame, k.slide + 6, k.take);
  const fB = { x: HIM_AT, y: COURT.floor, scale: COURT.scale, pose: { ...STAND, lean: 8 }, facing: 1 as const };
  const lifted = { x: 1450, y: 700 };
  const fFront = taken ? aimArm(fB, { x: mix(cup.x, lifted.x, ramp(frame, k.take, k.take + 8)), y: mix(cup.y, lifted.y, ramp(frame, k.take, k.take + 8)) })
    : aimArm(fB, { x: mix(1400, cup.x, reachCup), y: mix(820, cup.y, reachCup) });
  const pay = ramp(frame, k.payCoin - 6, k.payCoin) * (1 - ramp(frame, k.payCoin + 4, k.payCoin + 12));
  const fBack: [number, number] = pay > 0 ? aimArm(fB, { x: mix(1380, 1470, pay), y: mix(860, COURT.coffee.top - 10, pay) }) : [-7, 8];
  const talking = frame >= k.half && frame < k.her && Math.floor((frame - k.half) / 4) % 2 === 0;
  const sTalking = frame >= k.her && frame < k.halfEnd && Math.floor((frame - k.her) / 5) % 2 === 0;
  const look = frame >= k.lookHer ? { x: 1, y: 0.05 } : frame >= k.lookBoard ? { x: 1, y: -0.75 } : { x: 0.15, y: -1 };
  const sellerArm = aimArm({ x: COURT.coffee.seller.x, y: COURT.floor, scale: COURT.scale, pose: STAND, facing: -1 }, { x: cupX + 30, y: cup.y });
  const pushing = frame < k.take;
  return (
    <CourtShot frame={frame} cam={cam} mood={mood} tags={{ you: tags.you, friend: tags.friend, seller: tags.seller }} up={Object.fromEntries(EXTRAS.map((e) => [e.id, 1]))} priceKeys={priceKeys(k)} pillarKeys={[{ at: 0, value: "100" }]}
      you={{ pose: { ...STAND, armF: [8, 20] }, face: { brows: "raised", mouth: "smile", eyes: 1, look: { x: 1, y: 0 } } }}
      friend={{ x: HIM_AT, facing: 1, pose: { ...fB.pose, tilt: frame >= k.lookHer ? 2 : -12, armF: fFront, armB: fBack },
        face: { brows: frame >= k.lookHer ? "raised" : "flat", lids: 0, mouth: talking ? "o" : "flat", eyes: frame >= k.lookHer ? 1.15 : 1, look },
        held: taken ? <IcedCoffee x={6} y={-8} scale={1} /> : undefined }}
      seller={{ pose: { ...STAND, armF: pushing ? sellerArm : [10, 30] },
        face: frame >= k.lookHer ? { brows: "flat", lids: 0.45, mouth: sTalking ? "open" : "flat", look: { x: 1, y: 0.1 } } : { brows: "none", lids: 0.35, look: { x: 0.2, y: 0.8 } } }}
      lampOn={k.lampOn}
      extra={<>
        {!taken && <IcedCoffee x={cup.x} y={cup.y} scale={2.2} />}
        {frame >= k.payCoin + 2 && <Coin x={1470} y={COURT.coffee.top - 4} r={10} edge={0.5} />}
      </>} />
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const mood = moodNow(shot);
  const tags = tagKeys(k);
  const on = current(frame, [[0, "count"], [k.ladder, "ladder"], [k.wide, "wide"], [k.close, "close"], [k.coffee, "coffee"]]);
  const allKeys = Object.entries(tags);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {on === "count" && <Counting frame={frame} k={k} mood={mood} />}
      {on === "ladder" && <LadderShot frame={frame} k={k} mood={mood} />}
      {on === "wide" && <DropWide frame={frame} k={k} mood={mood} tags={tags} />}
      {on === "close" && <ReadClose frame={frame} k={k} mood={mood} tags={tags} />}
      {on === "coffee" && <CoffeeShot frame={frame} k={k} mood={mood} tags={tags} />}
      {/* the coins into the tin (the first inside half a second), the lid, the key in the lock */}
      {k.releases.map((r) => (
        <Sequence key={r} from={r + 5} durationInFrames={20}><Audio src={staticFile("sfx/coin.wav")} volume={0.9} /></Sequence>
      ))}
      <Sequence from={k.lid + 7} durationInFrames={10}><Audio src={staticFile("sfx/tick.wav")} volume={0.5} /></Sequence>
      <Sequence from={k.turn + 5} durationInFrames={10}><Audio src={staticFile("sfx/tick.wav")} volume={0.6} /></Sequence>
      <LampSound on={k.lampOn} />
      {allKeys.map(([who, keys]) => (
        <TagSounds key={who} keys={keys!} volume={who === "you" || who === "friend" || who === "worker" ? 0.9 : 0.3} />
      ))}
      <BoardSounds keys={priceKeys(k)} />
      <Sequence from={k.payCoin + 2} durationInFrames={20}><Audio src={staticFile("sfx/coin.wav")} volume={0.6} /></Sequence>
    </AbsoluteFill>
  );
};

export const theLamp: Beat = { id: "theLamp", firstLine: 0, Component: Scene };
