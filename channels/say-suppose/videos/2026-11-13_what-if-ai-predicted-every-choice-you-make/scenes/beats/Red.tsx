// Beat "Red" (script.md, ## [05:42] Red; narration lines 60-68). Mood lamp (closing), then morning, then the platform
// at dusk.
//
//   60  the court half dark: you lock the box and take the key out (insert); next door the coffee seller pulling her
//       shutter down; "His hand comes out": the two of you
//   HOLD (4 s, performed): his hand slides in over the box, palm up, the grin already there
//   61  "Trust me?" (his own voice); his card drops and buzzes crimson: TAKES THE KEY 71%
//   HOLD (4 s, performed): the crimson card; he sees it, you see it; he snatches his hand back and holds the wrist;
//       the coffee seller's shutter stops halfway, she stares; insert: your fingers close round the key
//   62  "Machine's drunk." (his own voice), a forced grin
//   63  he laughs; it stops halfway
//   64  insert: the key into your apron pocket; your face, not looking at him; his face, looking at your pocket
//   65  morning: the coffee stall, the iced coffee poured; she looks up at his pale crimson card and puts the cup back:
//       "Not with that tag." (her own voice)
//   66  the landlord at your stall hands him an envelope, not meeting his eyes: "Nothing personal." (his own voice);
//       the pillar's rate board flaps HIS RATE 70 to 140
//   67  the platform at dusk: him alone at one end under a pale crimson card; the pickpocket at the other, teal, a
//       bench full of people beside him
//   68  close on his card, 71; him
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND } from "@whatif/kit/rig/pose";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { INK } from "@whatif/kit/theme";
import { Apron, headAt, lineAt, moodNow } from "../kit";
import { BoardSounds, Tag, TagSounds, type BoardKey, type TagKey } from "../device";
import { blinking, camAt, current, FRIEND, LANDLORD, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { COURT, Key } from "../sets/FoodCourt";
import { PlatformShot, platHeads } from "./Red.Platform";
import { body, Envelope, friendBody, heads, PocketShot, reachPose, StallScene, tagShot, talk, youBody, type Actor } from "./SixtyPerCent.Parts";

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  const end = (i: number) => lineEnd(clips, i);
  const g2 = Math.max(60, from(62) - end(61));
  const boardCut = Math.max(at(66, 0.6), end(66) - 6);
  return {
    open: from(60), // "Closing. The court half dark."
    lock: at(60, 0.3), // insert: you turn the key and pull it out
    out: at(60, 0.62), // "His hand comes out."
    hold1: end(60), // HOLD: his hand slides in, palm up, the grin
    trust: from(61), // "Trust me?"
    trustEnd: end(61),
    tagNew: end(61) - 2, // the card drops
    crimson: end(61) + 10, // and buzzes crimson
    see: end(61) + Math.round(g2 * 0.28), // he sees it; you see it; his hand snaps back
    shutter: end(61) + Math.round(g2 * 0.56), // the coffee seller's shutter stops halfway
    grip: end(61) + Math.round(g2 * 0.76), // insert: your fingers close round the key
    drunk: from(62), // "Machine's drunk."
    drunkEnd: end(62),
    laughs: from(63), // "He laughs. It stops halfway."
    stops: at(63, 0.55),
    pocket: from(64), // "You've put that key in your pocket a thousand times."
    yours: at(64, 0.4), // "Tonight it's the first time ..."
    his: at(64, 0.7), // "... you've locked something away from him."
    coffee: from(65), // "Not with that tag."
    coffeeEnd: end(65),
    landlord: from(66), // "Nothing personal."
    landlordEnd: end(66),
    board: boardCut, // HIS RATE 140
    platform: Math.max(boardCut + 30, at(67, 0.16)), // "His rent doubles. His coffee's gone."
    pick: at(67, 0.5), // "He's the pickpocket now."
    alone: at(67, 0.78), // "To everyone but you."
    card: from(68), // "But the tag doesn't say thief. It says seventy-one."
    who: at(68, 0.58), // "And you're about to learn who gets a seventy-one."
    end: to,
  };
}

const hisKeys = (k: T): TagKey[] => [
  { at: k.tagNew, text: "TAKES THE KEY", pct: 71, state: "new" },
  { at: k.crimson, text: "TAKES THE KEY", pct: 71, state: "crimson" },
];

// ------------------------------------------------------------------------------------------------ closing

const SMALL_KEY = <Key x={10} y={-4} scale={0.24} rotate={-30} />;

const Closing: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.open, "wide"], [k.lock, "lock"], [k.out, "two"], [k.trust, "trust"], [k.crimson, "card"], [k.see, "snap"],
    [k.shutter, "seller"], [k.grip, "grip"], [k.drunk, "drunk"], [k.pocket, "pocket"], [k.yours, "yours"], [k.his, "his"]]);
  if (on === "grip") {
    const cam = camAt(frame, [[k.grip, { x: 960, y: 420, zoom: 1.05 }], [k.drunk, { x: 960, y: 420, zoom: 1.15 }]]);
    return <PocketShot mood={mood} cam={drift(cam, frame, "grip", 2)} inside={0} grip={ramp(frame, k.grip + 6, k.grip + 20)} glint={1} />;
  }
  if (on === "pocket") {
    const cam = camAt(frame, [[k.pocket, { x: 960, y: 520, zoom: 1.0 }], [k.yours, { x: 960, y: 560, zoom: 1.1 }]]);
    return <PocketShot mood={mood} cam={drift(cam, frame, "pocket", 2)} inside={ramp(frame, k.pocket + 8, k.pocket + 34)} grip={1} />;
  }
  const tag = frame >= k.tagNew ? hisKeys(k) : undefined;
  // The shutter next door: pulled down from the open, stopped halfway when he sees the card.
  const shutter = frame < k.shutter ? mix(0.05, 0.5, ramp(frame, k.open, k.shutter)) : 0.5;
  const stopped = frame >= k.shutter;
  const sellerB = body(1440, STAND, stopped ? -1 : 1, 1040);
  const bar = { x: 1540, y: 250 + (COURT.coffee.top - 250) * shutter - 6 };
  const coffee: Actor & { shutter: number; front: boolean } = {
    x: 1440, facing: stopped ? -1 : 1, front: true, shutter,
    pose: stopped ? reachPose(sellerB, undefined, bar) : reachPose(sellerB, bar),
    face: stopped ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.15, look: { x: 0.9, y: -0.3 } } : { brows: "none", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 0.3, y: -0.6 } },
  };
  // You: at the box, turning the key and pulling it out; then the key at your chest.
  const turned = ramp(frame, k.lock + 6, k.lock + 18);
  const pulled = ramp(frame, k.lock + 24, k.lock + 38);
  const keyAt = { x: 783 - pulled * 70, y: 727 - pulled * 30, rotate: -14 + turned * 90 };
  let you: Actor;
  if (frame < k.lock + 40) {
    const b = youBody({ ...STAND, lean: 14 });
    you = { pose: reachPose(b, { x: keyAt.x - 22, y: keyAt.y - 6 }), face: { brows: "none", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.8 } } };
  } else {
    const seen = frame >= k.see;
    you = {
      pose: { ...STAND, armF: [52, 92] }, held: SMALL_KEY,
      face: on === "yours" ? { brows: "worry", lids: 0.5, mouth: "flat", eyes: 1, look: { x: -0.6, y: 0.7 } }
        : on === "drunk" ? { brows: "worry", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0 } }
        : seen ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.9, y: -0.6 } }
        : frame >= k.trust ? { brows: "raised", lids: 0.25, mouth: "smile", eyes: 1, look: { x: 0.9, y: 0.1 } }
        : { brows: "none", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0.2 } },
    };
  }
  // Him: the hand comes out over the box, palm up; snatched back to his chest, the other hand round the wrist.
  const lean = frame < k.see ? mix(0, 16, ramp(frame, k.hold1, k.hold1 + 22)) : mix(16, -4, ramp(frame, k.see, k.see + 6));
  const fb = friendBody({ ...STAND, lean });
  const fh0 = heads(undefined, { pose: fb.pose }).friend;
  let friend: Actor;
  if (frame < k.hold1) {
    friend = { pose: { ...STAND, armF: [20, 30] }, face: { brows: "none", lids: 0.25, mouth: "smile", eyes: 1, look: { x: 0.7, y: 0.5 } } };
  } else if (frame < k.see) {
    const out = ramp(frame, k.hold1, k.hold1 + 22);
    const target = { x: mix(1020, 800, out), y: mix(760, 640, out) };
    friend = {
      pose: reachPose(fb, target), tag,
      face: frame >= k.crimson + 4 ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.1, look: { x: 0.1, y: -0.9 } }
        : { brows: "raised", lids: 0.3, mouth: talk(frame, k.trust, k.trustEnd, "smile", 6), eyes: 1, look: { x: 0.9, y: 0 } },
    };
  } else {
    const chest = { x: fh0.x + 20, y: fh0.y + fh0.r * 2.3 };
    const laughing = frame >= k.laughs && frame < k.stops;
    friend = {
      pose: reachPose(fb, chest, { x: chest.x - 6, y: chest.y + 4 }), tag,
      face: on === "his" ? { brows: "worry", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 0.7, y: 0.9 } }
        : on === "drunk" ? { brows: "worry", lids: 0.15, mouth: laughing ? (Math.floor(frame / 4) % 2 ? "open" : "smile") : frame >= k.stops ? "flat" : talk(frame, k.drunk, k.drunkEnd, "smile", 6), eyes: 1, look: { x: 0.9, y: 0 } }
        : { brows: "raised", lids: 0, mouth: "o", eyes: 1.25, look: { x: 0.2, y: -0.8 } },
    };
  }
  const h = heads(you, friend);
  const cams: Record<Exclude<typeof on, "grip" | "pocket">, Camera> = {
    wide: camAt(frame, [[k.open, { x: 1100, y: 520, zoom: 1.05 }], [k.lock, { x: 1060, y: 520, zoom: 1.12 }]]),
    lock: camAt(frame, [[k.lock, insert(790, 710, 3.2)], [k.out, insert(770, 700, 3.3)]]),
    two: camAt(frame, [[k.out, { x: 820, y: 500, zoom: 1.5 }], [k.trust, { x: 830, y: 500, zoom: 1.62 }]]),
    trust: camAt(frame, [[k.trust, { x: 860, y: 470, zoom: 1.7 }], [k.crimson, { x: 880, y: 450, zoom: 1.75 }]]),
    card: camAt(frame, [[k.crimson, tagShot(h.friend, 2.2)], [k.see, tagShot(h.friend, 2.4)]]),
    snap: camAt(frame, [[k.see, { x: 900, y: 430, zoom: 1.6 }], [k.shutter, { x: 910, y: 430, zoom: 1.65 }]]),
    seller: camAt(frame, [[k.shutter, { x: 1460, y: 480, zoom: 1.8 }], [k.grip, { x: 1450, y: 470, zoom: 1.9 }]]),
    drunk: camAt(frame, [[k.drunk, closeUp(h.friend.x - 30, h.friend.y - 60, 2.2)], [k.pocket, closeUp(h.friend.x - 30, h.friend.y - 60, 2.4)]]),
    yours: camAt(frame, [[k.yours, closeUp(h.you.x + 30, h.you.y, 2.6)], [k.his, closeUp(h.you.x + 30, h.you.y, 2.75)]]),
    his: camAt(frame, [[k.his, closeUp(h.friend.x - 30, h.friend.y, 2.6)], [k.coffee, closeUp(h.friend.x - 30, h.friend.y, 2.8)]]),
  };
  const cam = drift(cams[on], frame, `red-${on}`, 3);
  return (
    <StallScene frame={frame} cam={cam} mood={mood} backMood="lamp" diners={false} you={you} friend={friend} coffee={coffee}
      box={{ key: frame < k.lock + 40 ? keyAt : null }} coffeeBoard={[{ at: 0, value: "1.50" }]} />
  );
};

// ------------------------------------------------------------------------------------------------ morning

/** The iced coffee: a tall cup, the coffee dark under the ice. */
const IcedCoffee: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-26 0 L-32 -92 H32 L26 0Z" fill="#e9f2f2" stroke={INK} strokeWidth={4} opacity={0.95} />
    <path d="M-27 -10 L-31 -66 H31 L27 -10Z" fill="#6b4630" />
    <rect x={-14} y={-60} width={14} height={12} fill="#f4fbfb" opacity={0.8} />
    <rect x={4} y={-50} width={12} height={12} fill="#f4fbfb" opacity={0.8} />
    <line x1={10} y1={-92} x2={22} y2={-130} stroke={INK} strokeWidth={6} />
  </g>
);

const Morning: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.coffee, "coffee"], [k.landlord, "landlord"], [k.board, "board"]]);
  const tag = hisKeys(k);
  if (on === "coffee") {
    const back = ramp(frame, k.coffee + 16, k.coffee + 30);
    const cup = { x: mix(1500, 1680, back), y: COURT.coffee.top };
    const sb = body(COURT.coffee.seller.x, STAND, -1);
    const coffee: Actor = {
      pose: reachPose(sb, { x: cup.x + 10, y: cup.y - 50 }),
      face: frame < k.coffee + 8 ? { brows: "none", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0.6 } }
        : { brows: "flat", lids: 0.35, mouth: talk(frame, k.coffee + 2, k.coffeeEnd, "flat", 6), eyes: 1, look: frame < k.coffee + 20 ? { x: 0.4, y: -0.9 } : { x: 0.8, y: 0.1 } },
    };
    const fb = body(1300, { ...STAND, armF: [60, 40] }, 1, 1040);
    const fh = headAt(fb.x, fb.y, fb.scale, fb.pose, 1);
    const cam = camAt(frame, [[k.coffee, { x: 1500, y: 520, zoom: 1.45 }], [k.landlord, { x: 1520, y: 520, zoom: 1.55 }]]);
    const front = (
      <g>
        <IcedCoffee x={cup.x} y={cup.y} />
        <Figure x={fb.x} y={fb.y} scale={fb.scale} facing={1} pose={fb.pose} head={FRIEND.head} coat={FRIEND.coat}
          brows={back > 0.5 ? "worry" : "none"} lids={0.2} mouth={back > 0.5 ? "flat" : "smile"} eyes={1} look={back > 0.5 ? { x: 0.3, y: -0.8 } : { x: 0.9, y: 0.4 }} blink={blinking(frame, 2)} time={frame} />
        <Apron b={fb} color="#4f3a2b" />
        <g opacity={0.72}><TagAt frame={frame} h={fh} keys={tag} /></g>
      </g>
    );
    return <StallScene frame={frame} cam={drift(cam, frame, "coffee", 3)} mood={mood} backMood="morning" coffee={coffee} front={front} coffeeBoard={[{ at: 0, value: "1.50" }]} />;
  }
  if (on === "board") {
    const keys: BoardKey[] = [{ at: 0, value: "70" }, { at: k.board + 8, value: "140" }];
    const cam = camAt(frame, [[k.board, { x: COURT.pillar.board.x + 60, y: COURT.pillar.board.y + 30, zoom: 3.0 }], [k.platform, { x: COURT.pillar.board.x + 60, y: COURT.pillar.board.y + 30, zoom: 3.3 }]]);
    return <StallScene frame={frame} cam={drift(cam, frame, "board", 2)} mood={mood} backMood="morning" pillarBoard={{ label: "HIS RATE", keys }} friend={{ tag, tagFade: 1 }} />;
  }
  // The landlord hands him the envelope, eyes away.
  const give = ramp(frame, k.landlord, k.landlord + 18);
  const lb = body(1440, STAND, -1, 1040);
  const handOver = { x: mix(1360, 1250, give), y: 690 };
  const lpose = reachPose(lb, handOver);
  const taken = frame >= k.landlord + 24;
  const fb = friendBody(STAND);
  const friend: Actor = {
    facing: 1, tag, tagFade: 1,
    pose: taken ? { ...STAND, armF: [40, 60] } : reachPose({ ...fb, facing: 1 }, { x: handOver.x - 10, y: handOver.y + 6 }),
    held: taken ? <Envelope x={8} y={-4} scale={0.5} /> : undefined,
    face: { brows: "worry", lids: 0.3, mouth: "flat", eyes: 1, look: taken ? { x: 0.6, y: 0.8 } : { x: 0.9, y: -0.1 } },
  };
  const lh = headAt(lb.x, lb.y, lb.scale, lpose, -1);
  const front = (
    <g>
      <Figure x={lb.x} y={lb.y} scale={lb.scale} facing={-1} pose={lpose} head={LANDLORD.head} coat={LANDLORD.coat} tie={LANDLORD.tie}
        brows="flat" lids={0.45} mouth={talk(frame, k.landlord + 4, k.landlordEnd, "flat", 6)} eyes={1} look={{ x: -0.6, y: 0.6 }} blink={blinking(frame, 9)} time={frame}
        held={taken ? undefined : <Envelope x={8} y={-4} scale={0.5} />} />
    </g>
  );
  const cam = camAt(frame, [[k.landlord, { x: (lh.x + 1080) / 2, y: 520, zoom: 1.75 }], [k.board, { x: (lh.x + 1080) / 2 + 20, y: 510, zoom: 1.85 }]]);
  return <StallScene frame={frame} cam={drift(cam, frame, "landlord", 3)} mood={mood} backMood="morning" friend={friend} front={front} pillarBoard={{ label: "HIS RATE", keys: [{ at: 0, value: "70" }] }} />;
};

const TagAt: React.FC<{ frame: number; h: { x: number; y: number; r: number }; keys: TagKey[] }> = ({ frame, h, keys }) => (
  <Tag frame={frame} x={h.x} headY={h.y} r={h.r} keys={keys} />
);

// ------------------------------------------------------------------------------------------------ the platform

const Platform: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const on = current(frame, [[k.platform, "wide"], [k.pick, "pick"], [k.alone, "alone"], [k.card, "card"], [k.who, "who"]]);
  const ph = platHeads();
  const pickTag: TagKey[] = [{ at: k.platform - 200, text: "STANDS STILL", pct: 99, state: "tick" }];
  const cams: Record<typeof on, Camera> = {
    wide: camAt(frame, [[k.platform, { x: 900, y: 600, zoom: 1.02 }], [k.pick, { x: 940, y: 600, zoom: 1.08 }]]),
    pick: camAt(frame, [[k.pick, { x: 1530, y: 640, zoom: 2.0 }], [k.alone, { x: 1550, y: 640, zoom: 2.1 }]]),
    alone: camAt(frame, [[k.alone, { x: ph.friend.x + 60, y: ph.friend.y - 40, zoom: 2.3 }], [k.card, { x: ph.friend.x + 60, y: ph.friend.y - 40, zoom: 2.45 }]]),
    card: camAt(frame, [[k.card, tagShot(ph.friend, 3.0)], [k.who, tagShot(ph.friend, 3.2)]]),
    who: camAt(frame, [[k.who, { x: ph.friend.x + 300, y: 620, zoom: 1.6 }], [k.end, { x: ph.friend.x + 380, y: 620, zoom: 1.4 }]]),
  };
  const down = on === "alone" || on === "who";
  return (
    <PlatformShot frame={frame} cam={drift(cams[on], frame, `plat-${on}`, 3)} friendTag={hisKeys(k)} pickTag={pickTag} benchLook={on === "pick" ? 1 : 0}
      friendFace={down ? { brows: "sad", lids: 0.5, mouth: "flat", eyes: 1, look: { x: 0.4, y: 0.8 } } : { brows: "worry", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0 } }} />
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const mood = moodNow(shot);
  const part = current(frame, [[0, "closing"], [k.coffee, "morning"], [k.platform, "platform"]]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {part === "closing" && <Closing frame={frame} k={k} mood={mood} />}
      {part === "morning" && <Morning frame={frame} k={k} mood={mood} />}
      {part === "platform" && <Platform frame={frame} k={k} />}
      <TagSounds keys={hisKeys(k)} />
      <BoardSounds keys={[{ at: 0, value: "70" }, { at: k.board + 8, value: "140" }]} />
    </AbsoluteFill>
  );
};

export const red: Beat = { id: "red", firstLine: 60, Component: Scene };
