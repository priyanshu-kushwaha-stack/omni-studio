// Beat "The Lamp" (script.md v2, ## [00:00] The Lamp; narration lines 0-2). The opening frame already carries the rule:
// the thumbnail's counter in teal (you large at the left, your arm out level across the tin box, the brass key on your
// open palm; your best friend at the right, his palm up, grinning). Inside the first half second the city's teal lamp
// blinks with a tick and the two cards drop on their threads: POCKETS KEY 91% over you, HOLDS OUT HAND 96% over him.
//
//   lead-in   frame 1 the lamp blinks; frames 3 and 6 the cards drop, digits running; he reads yours, you read his;
//             his brows go up, yours go higher; he grins wider
//   0         "Trust me?" (his own voice)
//   hold A    you pull the key back and pocket it, slow, so he can watch it go; both cards tick teal; the wide: he
//             points up at your card, told-you face; behind, the worker taps the lamp twice and climbs down
//   hold B    the coffee stall: she slides an iced coffee across the steel without looking (the cup's scrape); his card
//             flaps PAYS 97%; he pays, still staring up; her board clatters 3.00 to 1.50; he looks at the board, at her
//   1         "Half?" (his own voice)
//   2         "Half." (the coffee seller's own voice), close on her
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import { closeUp, drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip as LineClip } from "@whatif/kit/timeline";
import { BoardSounds, LampSound, TagSounds, type BoardKey, type TagKey } from "../device";
import { aimArm, handAt, headAt, moodNow } from "../kit";
import { camAt, current, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { COURT, Key } from "../sets/FoodCourt";
import {
  CloseShot, Coin, CourtShot, firstTags, type CourtTags, friendBody, IcedCoffee, LADDER, Palm, pillarLamp, workerReach,
  youBody, type Face, type Mood,
} from "./TheLamp.Court";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: LineClip[], to: number) {
  const from = (i: number) => clips[i].from;
  const end = (i: number) => lineEnd(clips, i);
  const L = from(0);
  const e0 = end(0);
  const g = from(1) - e0; // the 5 s of holds: the key, then the coffee
  const at = (p: number) => e0 + Math.round(g * p);
  const coffee = at(0.45);
  return {
    lampOn: 1, // the city lamp blinks (a tick)
    youDrop: 3, // POCKETS KEY 91%
    himDrop: 6, // HOLDS OUT HAND 96%
    rest: 8, // every other card in the court (off screen here, seen in the wide)
    heReads: 16, // he reads yours
    youRead: Math.round(L * 0.3), // you read his
    hisBrows: Math.round(L * 0.45),
    yourBrows: Math.round(L * 0.62), // yours go higher
    grin: Math.max(20, L - 12), // he grins wider before he speaks
    trust: L, // "Trust me?"
    trustEnd: e0,
    pull: e0 + 3, // the key comes back off the palm, slow
    pocketed: at(0.24), // in the pocket
    tick: at(0.18), // both cards tick teal
    wide: at(0.25), // the wide: the point, the lamp taps, the ladder
    point: at(0.27),
    tap1: at(0.3),
    tap2: at(0.34),
    climb: at(0.37),
    coffee,
    slide: coffee + 2, // the cup scrapes across the steel
    pays: coffee + 8, // his card flaps PAYS 97%
    take: coffee + 16,
    payCoin: coffee + 24,
    paid: coffee + 32, // PAYS ticks teal
    board: coffee + 36, // 3.00 to 1.50
    lookBoard: coffee + 38,
    lookHer: from(1) - 8,
    half: from(1),
    her: from(2),
    halfEnd: end(2),
    end: to,
  };
}

// ------------------------------------------------------------------------------------------------ the tags

function tagKeys(k: T): CourtTags {
  const first = firstTags({ you: k.youDrop, friend: k.himDrop, tick: k.tick, rest: k.rest, wave: 1e7 });
  const friend: TagKey[] = [...first.friend, { at: k.pays, text: "PAYS", pct: 97, state: "new" }, { at: k.paid, text: "PAYS", pct: 97, state: "tick" }];
  return { ...first, friend };
}

const priceKeys = (k: T): BoardKey[] => [{ at: 0, value: "3.00" }, { at: k.board, value: "1.50" }];

// ------------------------------------------------------------------------------------------------ the counter close

const CLOSE: Camera = { x: 960, y: 540, zoom: 1 };
/** Your arm out level across the box, the forearm turned up: the thumbnail's offer (brand/thumbs/predict/data.ts). */
const OFFER: Pose = { ...STAND, lean: 6, tilt: 4, armF: [84, -6], armB: [-6, 14] };
const OFFER_HAND = handAt(youBody(OFFER), "front");
const POCKET = { x: 560, y: 1130 };
/** His palm, as far across the box as his arm goes. */
const HIS_PALM = { x: 1235, y: OFFER_HAND.y + 40 };

/** Lead-in, line 0 and the first of the hold: the cards drop over the key held out; "Trust me?"; the key goes home. */
const KeyClose: React.FC<{ frame: number; k: T; mood: Mood; tags: CourtTags }> = ({ frame, k, mood, tags }) => {
  const cam = drift(camAt(frame, [[0, CLOSE], [k.trust, { x: 960, y: 548, zoom: 1.04 }], [k.wide, { x: 930, y: 560, zoom: 1.1 }]]), frame, "key-close", 1.5);
  // your hand: out level until "Trust me?" ends, then back and down to your pocket, slow
  const back = ramp(frame, k.pull, k.pocketed);
  const hand = { x: mix(OFFER_HAND.x, POCKET.x, back), y: mix(OFFER_HAND.y, POCKET.y, back * back) };
  const youPose: Pose = back > 0 ? { ...OFFER, lean: mix(6, 2, back), tilt: mix(4, 8, back), armF: aimArm(youBody(OFFER), hand) } : OFFER;
  const yourBrows = ramp(frame, k.yourBrows, k.yourBrows + 6);
  const youFace: Face = frame >= k.pull
    ? { brows: "raised", lids: 0.15, mouth: "smirk", eyes: 1.05, look: { x: 1, y: 0.15 } }
    : frame >= k.youRead
      ? { brows: "raised", lids: 0, mouth: yourBrows > 0.5 ? "smirk" : "flat", eyes: 1 + 0.25 * yourBrows, look: { x: 1, y: -0.75 } }
      : { brows: "none", lids: 0.1, mouth: "smirk", eyes: 1, look: { x: 1, y: 0.15 } };
  // him: palm up under your hand; he follows the key all the way down with his eyes
  const palmDrop = ramp(frame, k.pocketed - 6, k.pocketed + 6);
  const fBase: Pose = { ...STAND, lean: 10, tilt: 6 };
  const fPose: Pose = { ...fBase, tilt: frame >= k.heReads && frame < k.trust ? -8 : frame >= k.pull ? 10 : 2,
    armF: aimArm(friendBody(fBase), { x: HIS_PALM.x, y: HIS_PALM.y + 90 * palmDrop }) };
  const hisBrows = ramp(frame, k.hisBrows, k.hisBrows + 6);
  const talking = frame >= k.trust && frame < k.trustEnd && Math.floor((frame - k.trust) / 5) % 2 === 0;
  const fFace: Face = frame >= k.pull
    ? { brows: "raised", lids: 0.05, mouth: "smile", eyes: 1.1, look: { x: 0.9, y: mix(0.2, 0.75, back) } }
    : frame >= k.trust
      ? { brows: "raised", lids: 0, mouth: talking ? "open" : "smile", eyes: 1.1, look: { x: 1, y: 0.05 } }
      : frame >= k.heReads
        ? { brows: hisBrows > 0.5 ? "raised" : "none", lids: 0, mouth: frame >= k.grin ? "smile" : "smirk", eyes: 1 + 0.15 * hisBrows, look: { x: 1, y: -0.8 } }
        : { brows: "none", lids: 0.05, mouth: "smile", eyes: 1, look: { x: 1, y: 0.1 } };
  // the key: large on your open palm (the thumbnail's), shrinking to a held size as it goes into your pocket
  const keyHand = handAt(youBody(youPose), "front");
  const inPocket = frame >= k.pocketed;
  const extra = !inPocket ? <Key x={keyHand.x + mix(20, 0, back)} y={keyHand.y - mix(30, 10, back)} scale={mix(1.35, 0.7, back)} rotate={mix(-14, 30, back)} glint={back < 0.5} /> : null;
  return (
    <CloseShot frame={frame} cam={cam} mood={mood} teal={k.lampOn}
      you={{ pose: youPose, face: youFace }}
      friend={{ pose: fPose, face: fFace, held: <Palm color="#f4b393" /> }}
      tags={{ you: tags.you!, friend: tags.friend! }} extra={extra} />
  );
};

// ------------------------------------------------------------------------------------------------ the wide: the point, the ladder

/** The rest of hold A: he points up at your card, told-you face; the worker taps the lamp twice and climbs down. */
const PointWide: React.FC<{ frame: number; k: T; mood: Mood; tags: CourtTags }> = ({ frame, k, mood, tags }) => {
  const cam = drift(camAt(frame, [[k.wide, { x: 900, y: 520, zoom: 1.08 }], [k.coffee, { x: 860, y: 520, zoom: 1.14 }]]), frame, "point-wide", 2);
  const lamp = pillarLamp(cam);
  const tapping = (frame >= k.tap1 && frame < k.tap1 + 4) || (frame >= k.tap2 && frame < k.tap2 + 4);
  const drop = ramp(frame, k.climb, k.coffee + 20);
  const hand = tapping ? { x: lamp.x + 6, y: lamp.y + 2 } : frame < k.climb ? { x: lamp.x + 34, y: lamp.y + 30 } : { x: LADDER.top.x + 60, y: lamp.y + 200 };
  const yh = headAt(COURT.you.x, COURT.floor, COURT.scale, STAND, 1);
  const point = ramp(frame, k.point, k.point + 8);
  const fB = { x: COURT.friend.x, y: COURT.floor, scale: COURT.scale, pose: STAND, facing: -1 as const };
  const pointAt = aimArm(fB, { x: yh.x + 60, y: yh.y - 260 });
  const fPose: Pose = { ...STAND, tilt: -6 * point, armF: [mix(9, pointAt[0], point), mix(10, pointAt[1], point)] };
  return (
    <CourtShot frame={frame} cam={cam} mood={mood} tags={tags} lampOn={k.lampOn} workerDrop={drop} pillarKeys={[{ at: 0, value: "100" }]}
      you={{ pose: { ...STAND, armF: [8, 20] }, face: { brows: "raised", lids: 0.1, mouth: "smile", eyes: 1, look: { x: 1, y: 0.05 } } }}
      friend={{ pose: fPose, face: { brows: "raised", lids: 0.25, mouth: "smirk", eyes: 1.05, look: { x: 1, y: -0.2 } } }}
      seller={{ face: { lids: 0.3, look: { x: 0.3, y: 0.7 } } }}
      worker={{ pose: { ...workerReach(hand), armB: [-30, 40] }, face: { brows: "flat", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 0.9, y: frame < k.climb ? -0.6 : 0.6 } } }} />
  );
};

// ------------------------------------------------------------------------------------------------ the coffee

const HIM_AT = 1345;

/** Hold B and lines 1-2: the iced coffee scrapes across the steel, PAYS 97%, the board halves, "Half?", "Half." */
const CoffeeShot: React.FC<{ frame: number; k: T; mood: Mood; tags: CourtTags }> = ({ frame, k, mood, tags }) => {
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
    <CourtShot frame={frame} cam={cam} mood={mood} tags={{ you: tags.you!, friend: tags.friend!, seller: tags.seller! }} priceKeys={priceKeys(k)} pillarKeys={[{ at: 0, value: "100" }]}
      you={{ pose: { ...STAND, armF: [8, 20] }, face: { brows: "raised", mouth: "smile", eyes: 1, look: { x: 1, y: 0 } } }}
      friend={{ x: HIM_AT, facing: 1, pose: { ...fB.pose, tilt: frame >= k.lookHer ? 2 : -12, armF: fFront, armB: fBack },
        face: { brows: frame >= k.lookHer ? "raised" : "flat", lids: 0, mouth: talking ? "o" : frame >= k.board + 4 ? "o" : "flat", eyes: frame >= k.lookBoard ? 1.2 : 1, look },
        held: taken ? <IcedCoffee x={6} y={-8} scale={1} /> : undefined }}
      seller={{ pose: { ...STAND, armF: pushing ? sellerArm : [10, 30] },
        face: frame >= k.lookHer ? { brows: "flat", lids: 0.45, mouth: sTalking ? "open" : "smirk", look: { x: 1, y: 0.1 } } : { brows: "none", lids: 0.35, look: { x: 0.2, y: 0.8 } } }}
      lampOn={k.lampOn}
      extra={<>
        {!taken && <IcedCoffee x={cup.x} y={cup.y} scale={2.2} />}
        {frame >= k.payCoin + 2 && <Coin x={1470} y={COURT.coffee.top - 4} r={10} edge={0.5} />}
      </>} />
  );
};

// ------------------------------------------------------------------------------------------------ the beat

/** The frame the iced coffee starts to scrape across the steel (for the sound, which has no file yet). */
export const lampCupScrape = (clips: LineClip[], to: number) => times(clips, to).slide;

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const mood = moodNow(shot);
  const tags = tagKeys(k);
  const on = current(frame, [[0, "close"], [k.wide, "wide"], [k.coffee, "coffee"]]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {on === "close" && <KeyClose frame={frame} k={k} mood={mood} tags={tags} />}
      {on === "wide" && <PointWide frame={frame} k={k} mood={mood} tags={tags} />}
      {on === "coffee" && <CoffeeShot frame={frame} k={k} mood={mood} tags={tags} />}
      <LampSound on={k.lampOn} />
      {/* the worker's two taps on the lamp */}
      {[k.tap1, k.tap2].map((f) => <Sequence key={f} from={f} durationInFrames={10}><Audio src={staticFile("sfx/tick.wav")} volume={0.35} /></Sequence>)}
      {Object.entries(tags).map(([who, keys]) => (
        <TagSounds key={who} keys={keys} volume={who === "you" || who === "friend" ? 0.9 : 0.2} />
      ))}
      <BoardSounds keys={priceKeys(k)} />
      <Sequence from={k.payCoin + 2} durationInFrames={20}><Audio src={staticFile("sfx/coin.wav")} volume={0.6} /></Sequence>
    </AbsoluteFill>
  );
};

export const theLamp: Beat = { id: "theLamp", firstLine: 0, Component: Scene };
