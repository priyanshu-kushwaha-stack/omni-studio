// Beat "Red" (script.md v2, ## [05:46] Red; narration lines 66-79; absorbs v1's "A Man in Trouble"). Mood lamp
// (closing), then morning, the platform at dusk, the court at dusk, and closing again.
//
//   66  the court half dark: you lock the box and take the key out (insert, the lock's click); next door the coffee
//       seller pulling her shutter down; "His hand comes out": the two of you
//   HOLD (4 s, performed): his hand slides in over the box, palm up, the grin already there
//   67  "Trust me?" (his own voice); his card drops and buzzes crimson: TAKES THE KEY 71%
//   HOLD (3 s, performed): he sees it, you see it; he snatches his hand back and holds the wrist; the coffee seller's
//       shutter stops halfway, she stares; insert: your fingers close round the key
//   68  "Machine's drunk." (his own voice): a beat of stillness, then deadpan, squinting up at the card like at a drunk,
//       a thumb at it; you snort in spite of yourself (the laugh)
//   69  insert: the key into your apron pocket; your face, not looking at him; his face, looking at your pocket
//   70  morning, the coffee chase in three quick cuts: he reaches, his card flaps REACHES 71%, she slides the cup away
//       along the steel; he reaches the other way, she slides it back; he fakes left and grabs right, she already
//       holds it over her head, eyes on his card: "Not with that tag." (her own voice)
//   71  "His rent doubles.": the landlord swaps the thin half-rent envelope in his hand for a fat full-rent one, silent;
//       HIS RATE 118 to 140; "And the whole platform...": the platform at dusk, the commuters sidestep his card all the
//       way onto the bench beside the pickpocket
//   72  "Plenty of room, everyone." (the pickpocket's own voice): delighted, patting the seat; him at the far end,
//       brows up, mouth open
//   73  close on his card, 71; him
//   74-79  Red.Trouble (the papers, the near tables, the climb 71/80/88, COUNTS BOX 97%, the iced coffee picked up),
//       Red.Crate (HOLD 4 s, performed, the one tender beat: the cup set down with a clack, you sit on the crate, your
//       card buzzes crimson, YOUR RATE 55 to 60; he looks at the cup, your card, you; 78 "That cost you." with a
//       crooked grin and the cup raised to your crimson card), and line 79's calendar, box, envelopes and tease
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND } from "@whatif/kit/rig/pose";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { Apron, headAt, lineAt, moodNow } from "../kit";
import { INK } from "@whatif/kit/theme";
import { BoardSounds, Tag, TagSounds, type BoardKey, type TagKey } from "../device";
import { blinking, camAt, current, FRIEND, LANDLORD, lineEnd, mix, ramp, type Beat, type Shot } from "../shared";
import { COURT, Key } from "../sets/FoodCourt";
import { PlatformShot, platHeads } from "./Red.Platform";
import { CRATE, crateHeads, CrateScene, IcedCoffee } from "./Red.Crate";
import { Papers, Rent, Trouble, type TroubleTimes } from "./Red.Trouble";
import { body, Envelope, friendBody, heads, PocketShot, reachPose, StallScene, tagShot, talk, youBody, type Actor } from "./SixtyPerCent.Parts";

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  const end = (i: number) => lineEnd(clips, i);
  const g2 = Math.max(60, from(68) - end(67));
  const chase0 = from(70) - 52; // the chase starts under the tail of line 69; the cup is over her head on line 70
  const gone = Math.max(from(70) + 40, at(71, 0.2));
  const boardCut = Math.max(gone + 30, at(71, 0.33));
  const hold = end(77), gap = Math.max(90, from(78) - end(77));
  const trouble: TroubleTimes = {
    rows: from(74), flags: at(74, 0.3), flagsDone: at(74, 0.85), crowd: from(75), bars: at(75, 0.55),
    thief: from(76), trouble: at(76, 0.3), turn: at(76, 0.58), away: at(76, 0.8),
    climb: from(77), n80: at(77, 0.47), n88: at(77, 0.56), tonight: at(77, 0.69), counts: at(77, 0.72), stop: at(77, 0.78),
    cup: at(77, 0.88), hold,
    calendar: from(79), box: at(79, 0.16), envelopes: at(79, 0.28), tease: at(79, 0.42), end: to,
  };
  return {
    open: from(66), // "Closing. The court half dark."
    lock: at(66, 0.3), // insert: you turn the key (the lock's click) and pull it out
    out: at(66, 0.62), // "His hand comes out."
    hold1: end(66), // HOLD: his hand slides in, palm up, the grin
    trust: from(67), // "Trust me?"
    trustEnd: end(67),
    tagNew: end(67) - 2, // the card drops
    crimson: end(67) + 10, // and buzzes crimson
    see: end(67) + Math.round(g2 * 0.28), // he sees it; you see it; his hand snaps back
    shutter: end(67) + Math.round(g2 * 0.56), // the coffee seller's shutter stops halfway (the clank)
    grip: end(67) + Math.round(g2 * 0.76), // insert: your fingers close round the key
    drunk: from(68), // "Machine's drunk."
    drunkEnd: end(68),
    snort: Math.max(at(68, 0.7), end(68) - 4), // you snort
    pocket: from(69), // "You've put that key in your pocket a thousand times."
    yours: at(69, 0.4), // "Tonight it's the first time ..."
    his: at(69, 0.6), // "... you've locked something away from him."
    coffee: chase0, // the chase: he reaches, REACHES 71%, the cup slides away
    back: chase0 + 26, // the other way; she slides it back
    overhead: from(70), // the fake; the cup over her head
    say: from(70), // "Not with that tag."
    sayEnd: end(70),
    landlord: gone, // "His rent doubles.": the envelope swap
    board: boardCut, // HIS RATE 140
    platform: Math.max(boardCut + 24, at(71, 0.42)), // "And the whole platform would rather sit next to the pickpocket."
    squeeze: at(71, 0.5),
    plenty: from(72), // "Plenty of room, everyone."
    plentyEnd: end(72),
    card: from(73), // "But the tag doesn't say thief. It says seventy-one."
    who: at(73, 0.58), // "And you're about to learn who gets a seventy-one."
    t: trouble,
    // The crate (HOLD 4 s, then line 78).
    hold,
    enter: hold,
    set: hold + Math.round(gap * 0.22), // the cup on the tray: clack
    sit: hold + Math.round(gap * 0.3),
    youCrimson: hold + Math.round(gap * 0.4), // your card buzzes crimson
    yourBoard: hold + Math.round(gap * 0.48), // YOUR RATE 55 to 60 (insert)
    lookCup: hold + Math.round(gap * 0.6),
    lookCard: hold + Math.round(gap * 0.73),
    lookYou: hold + Math.round(gap * 0.86),
    cost: from(78), // "That cost you."
    costEnd: end(78),
    toast: end(78) + 2, // the cup raised to your crimson card; your shrug
    rent: from(79),
    end: to,
  };
}

const hisKeys = (k: T): TagKey[] => [
  { at: k.tagNew, text: "TAKES THE KEY", pct: 71, state: "new" },
  { at: k.crimson, text: "TAKES THE KEY", pct: 71, state: "crimson" },
  { at: k.t.n80, text: "TAKES THE KEY", pct: 80, state: "crimson" },
  { at: k.t.n88, text: "TAKES THE KEY", pct: 88, state: "crimson" },
];
const yourKeys = (k: T): TagKey[] => [
  { at: k.t.counts, text: "COUNTS BOX", pct: 97, state: "new" },
  { at: k.youCrimson, text: "COUNTS BOX", pct: 97, state: "crimson" },
];
const hisRate = (k: T): BoardKey[] => [{ at: -1e4, value: "118" }, { at: k.board + 8, value: "140" }];
const yourRate = (k: T): BoardKey[] => [{ at: -1e4, value: "55" }, { at: k.yourBoard + 6, value: "60" }];

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
  const snorting = frame >= k.snort;
  let you: Actor;
  if (frame < k.lock + 40) {
    const b = youBody({ ...STAND, lean: 14 });
    you = { pose: reachPose(b, { x: keyAt.x - 22, y: keyAt.y - 6 }), face: { brows: "none", lids: 0.4, mouth: "flat", eyes: 1, look: { x: 0.8, y: 0.8 } } };
  } else if (on === "drunk" && snorting) {
    // The snort: the free hand to the mouth, the shoulders bouncing.
    const b = youBody({ ...STAND, lean: 6 + Math.abs(Math.sin((frame - k.snort) / 3)) * 5, tilt: 7, armF: [52, 92] });
    const h = heads({ pose: b.pose }).you;
    you = { pose: reachPose(b, undefined, { x: h.x + h.r * 0.5, y: h.y + h.r * 0.45 }), held: SMALL_KEY, face: { brows: "raised", lids: 0.75, mouth: "smile", eyes: 1, look: { x: 0.9, y: 0 } } };
  } else {
    const seen = frame >= k.see;
    you = {
      pose: { ...STAND, armF: [52, 92] }, held: SMALL_KEY,
      face: on === "yours" ? { brows: "flat", lids: 0.5, mouth: "flat", eyes: 1, look: { x: -0.6, y: 0.7 } }
        : on === "drunk" ? { brows: "raised", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0 } }
        : seen ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.9, y: -0.6 } }
        : frame >= k.trust ? { brows: "raised", lids: 0.25, mouth: "smile", eyes: 1, look: { x: 0.9, y: 0.1 } }
        : { brows: "none", lids: 0.2, mouth: "flat", eyes: 1, look: { x: 0.9, y: 0.2 } },
    };
  }
  // Him: the hand comes out over the box, palm up; snatched back to his chest, the other hand round the wrist; on
  // "Machine's drunk." the front hand comes off the wrist to thumb up at the card.
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
    if (on === "drunk") {
      // A beat of stillness, then the deadpan: thumb up at the card, a squint at it, then back to you.
      const speaking = frame >= k.drunk + 6;
      const thumb = { x: fh0.x + fh0.r * 2.1, y: fh0.y - fh0.r * 0.9 }; // out past the back of his head, never across the face
      friend = {
        pose: speaking ? reachPose(fb, thumb, { x: chest.x - 6, y: chest.y + 4 }) : reachPose(fb, chest, { x: chest.x - 6, y: chest.y + 4 }), tag,
        face: speaking
          ? { brows: "flat", lids: 0.55, mouth: talk(frame, k.drunk + 6, k.drunkEnd, "smirk", 6), eyes: 1, look: frame < k.snort ? { x: 0.2, y: -0.9 } : { x: 0.9, y: 0 } }
          : { brows: "raised", lids: 0, mouth: "flat", eyes: 1.2, look: { x: 0.2, y: -0.8 } },
      };
    } else {
      friend = {
        pose: reachPose(fb, chest, { x: chest.x - 6, y: chest.y + 4 }), tag,
        face: on === "his" ? { brows: "flat", lids: 0.35, mouth: "flat", eyes: 1, look: { x: 0.7, y: 0.9 } }
          : { brows: "raised", lids: 0, mouth: "o", eyes: 1.25, look: { x: 0.2, y: -0.8 } },
      };
    }
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
    drunk: camAt(frame, [[k.drunk, { x: 850, y: 440, zoom: 1.55 }], [k.pocket, { x: 860, y: 440, zoom: 1.62 }]]),
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

/** His card at the coffee stall (the chase): it flaps REACHES 71% on his first reach. */
const reachKeys = (k: T): TagKey[] => [
  { at: k.coffee - 400, text: "TAKES THE KEY", pct: 71, state: "crimson" },
  { at: k.coffee + 6, text: "REACHES", pct: 71, state: "crimson" },
];

/** A rent envelope: thin (half rent) or fat (full rent), the landlord's grey seal on both. */
const RentEnvelope: React.FC<{ fat?: boolean }> = ({ fat }) => (
  <g transform="translate(8 -4) rotate(-8)">
    {fat && <rect x={-17} y={-11} width={34} height={22} rx={2} fill="#d9cfb8" stroke={INK} strokeWidth={2} transform="translate(3 4)" />}
    {fat && <rect x={-17} y={-11} width={34} height={22} rx={2} fill="#e3d9c2" stroke={INK} strokeWidth={2} transform="translate(1.5 2)" />}
    <Envelope scale={0.5} tilt={0} />
  </g>
);

const Morning: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.coffee, "away"], [k.back, "back"], [k.overhead, "overhead"], [k.landlord, "landlord"], [k.board, "board"]]);
  const tag = hisKeys(k);
  if (on === "away" || on === "back" || on === "overhead") {
    // The chase. The cup on her counter slides away from his reaching hand (right), back (left), then over her head.
    const t0 = on === "away" ? k.coffee : on === "back" ? k.back : k.overhead;
    const slide = ramp(frame, t0 + 6, t0 + 14);
    const cupX = on === "away" ? mix(1540, 1760, slide) : on === "back" ? mix(1760, 1500, slide) : 1500;
    const sb = body(COURT.coffee.seller.x, STAND, -1);
    const sh = headAt(sb.x, sb.y, sb.scale, sb.pose, -1);
    const overhead = on === "overhead";
    const cupAt = overhead ? { x: sh.x + sh.r * 1.9, y: sh.y - sh.r * 1.4 } : { x: cupX + 10, y: COURT.coffee.top - 50 };
    const coffee: Actor = {
      pose: reachPose(sb, cupAt), held: overhead ? <IcedCoffee x={0} y={30} scale={0.5} /> : undefined,
      face: { brows: "flat", lids: 0.35, mouth: talk(frame, k.say + 2, k.sayEnd, "flat", 6), eyes: 1, look: { x: 0.5, y: -0.9 } },
    };
    // Him at the customers' side: reaching for the cup; the fake (left) then the grab (right) on the third cut.
    const fb = body(1300, STAND, 1, 1040);
    const reach = ramp(frame, t0, t0 + 8);
    const fake = overhead && frame < t0 + 10;
    const handTo = on === "away" ? { x: mix(1380, 1540, reach), y: COURT.coffee.top - 40 }
      : on === "back" ? { x: mix(1400, 1760, reach), y: COURT.coffee.top - 40 }
      : fake ? { x: 1380, y: COURT.coffee.top - 40 } : { x: mix(1380, 1520, ramp(frame, t0 + 10, t0 + 16)), y: COURT.coffee.top - 40 };
    const fpose = reachPose(fb, handTo);
    const fh = headAt(fb.x, fb.y, fb.scale, fpose, 1);
    const grabbed = overhead && frame >= t0 + 16;
    const front = (
      <g>
        {!overhead && <IcedCoffee x={cupX} y={COURT.coffee.top} />}
        <Figure x={fb.x} y={fb.y} scale={fb.scale} facing={1} pose={fpose} head={FRIEND.head} coat={FRIEND.coat}
          brows={grabbed ? "raised" : "flat"} lids={grabbed ? 0 : 0.4} mouth={grabbed ? "o" : "flat"} eyes={grabbed ? 1.2 : 1}
          look={grabbed ? { x: 0.6, y: -0.8 } : { x: 0.9, y: 0.4 }} blink={blinking(frame, 2)} time={frame} />
        <Apron b={fb} color="#4f3a2b" />
        <g opacity={0.8}><Tag frame={frame} x={fh.x} headY={fh.y} r={fh.r} keys={reachKeys(k)} /></g>
      </g>
    );
    const cams = {
      away: camAt(frame, [[k.coffee, { x: 1500, y: 450, zoom: 1.4 }], [k.back, { x: 1520, y: 450, zoom: 1.48 }]]),
      back: camAt(frame, [[k.back, { x: 1560, y: 470, zoom: 1.6 }], [k.overhead, { x: 1580, y: 470, zoom: 1.65 }]]),
      overhead: camAt(frame, [[k.overhead, { x: 1520, y: 430, zoom: 1.35 }], [k.landlord, { x: 1530, y: 420, zoom: 1.45 }]]),
    } as const;
    return <StallScene frame={frame} cam={drift(cams[on], frame, `chase-${on}`, 3)} mood={mood} backMood="morning" coffee={coffee} front={front} coffeeBoard={[{ at: 0, value: "1.50" }]} />;
  }
  if (on === "board") {
    const cam = camAt(frame, [[k.board, { x: COURT.pillar.board.x + 60, y: COURT.pillar.board.y + 30, zoom: 3.0 }], [k.platform, { x: COURT.pillar.board.x + 60, y: COURT.pillar.board.y + 30, zoom: 3.3 }]]);
    return <StallScene frame={frame} cam={drift(cam, frame, "board", 2)} mood={mood} backMood="morning" pillarBoard={{ label: "HIS RATE", keys: hisRate(k) }} friend={{ tag, tagFade: 1 }} />;
  }
  // The swap, under his nose by the pillar: the landlord plucks the thin envelope out of his hand and slaps a fat one in.
  const t = frame - k.landlord;
  const lb = body(1440, STAND, -1, 1040);
  const handAt0 = { x: 1250, y: 690 };
  const lpose = reachPose(lb, t < 24 ? { x: mix(1360, handAt0.x + 10, ramp(frame, k.landlord, k.landlord + 8)), y: 690 } : { x: 1340, y: 700 });
  const swapped = t >= 14;
  const fb = friendBody(STAND);
  const friend: Actor = {
    facing: 1, tag, tagFade: 1,
    pose: reachPose({ ...fb, facing: 1 }, handAt0),
    held: <RentEnvelope fat={swapped} />,
    face: swapped ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.2, look: { x: 0.6, y: 0.7 } } : { brows: "none", lids: 0.3, mouth: "flat", eyes: 1, look: { x: 0.6, y: 0.7 } },
  };
  const lh = headAt(lb.x, lb.y, lb.scale, lpose, -1);
  const front = (
    <Figure x={lb.x} y={lb.y} scale={lb.scale} facing={-1} pose={lpose} head={LANDLORD.head} coat={LANDLORD.coat} tie={LANDLORD.tie}
      brows="flat" lids={0.45} mouth="flat" eyes={1} look={{ x: -0.6, y: -0.3 }} blink={blinking(frame, 9)} time={frame}
      held={t < 8 ? <RentEnvelope fat /> : t < 24 ? <RentEnvelope /> : undefined} />
  );
  const cam = camAt(frame, [[k.landlord, { x: (lh.x + 1080) / 2, y: 540, zoom: 1.9 }], [k.board, { x: (lh.x + 1080) / 2 + 20, y: 530, zoom: 2.0 }]]);
  return <StallScene frame={frame} cam={drift(cam, frame, "landlord", 3)} mood={mood} backMood="morning" friend={friend} front={front} pillarBoard={{ label: "HIS RATE", keys: hisRate(k) }} />;
};

// ------------------------------------------------------------------------------------------------ the platform

const Platform: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const on = current(frame, [[k.platform, "wide"], [k.plenty, "plenty"], [k.plentyEnd, "him"], [k.card, "card"], [k.who, "who"]]);
  const ph = platHeads();
  const pickTag: TagKey[] = [{ at: k.platform - 200, text: "STANDS STILL", pct: 99, state: "tick" }];
  const cams: Record<typeof on, Camera> = {
    wide: camAt(frame, [[k.platform, { x: 1000, y: 600, zoom: 1.0 }], [k.plenty, { x: 1060, y: 600, zoom: 1.06 }]]),
    plenty: camAt(frame, [[k.plenty, { x: 1520, y: 660, zoom: 1.9 }], [k.plentyEnd, { x: 1500, y: 660, zoom: 2.0 }]]),
    him: camAt(frame, [[k.plentyEnd, { x: ph.friend.x + 60, y: ph.friend.y - 40, zoom: 2.3 }], [k.card, { x: ph.friend.x + 60, y: ph.friend.y - 40, zoom: 2.45 }]]),
    card: camAt(frame, [[k.card, tagShot(ph.friend, 3.0)], [k.who, tagShot(ph.friend, 3.2)]]),
    who: camAt(frame, [[k.who, { x: ph.friend.x + 300, y: 620, zoom: 1.6 }], [k.end, { x: ph.friend.x + 380, y: 620, zoom: 1.4 }]]),
  };
  // Comic dismay, never despair: brows up and mouth open at the packed bench; a flat squint on his own card.
  const dismay = frame >= k.squeeze + 40 && on !== "card";
  const pat = on === "plenty" ? 1 : 0;
  return (
    <PlatformShot frame={frame} cam={drift(cams[on], frame, `plat-${on}`, 3)} friendTag={hisKeys(k)} pickTag={pickTag} squeeze={k.squeeze} pat={pat}
      pickFace={{ brows: "raised", lids: 0.2, mouth: on === "plenty" ? talk(frame, k.plenty + 2, k.plentyEnd, "smile", 6) : frame >= k.squeeze + 30 ? "smile" : "flat", eyes: 1, look: { x: -0.4, y: 0 } }}
      friendFace={dismay ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.15, look: { x: 1, y: 0 } } : { brows: "flat", lids: 0.45, mouth: "flat", eyes: 1, look: on === "card" ? { x: 0.2, y: -0.9 } : { x: 0.9, y: 0 } }} />
  );
};

// ------------------------------------------------------------------------------------------------ the crate (the one tender beat)

const Crate: React.FC<{ frame: number; k: T; mood: ReturnType<typeof moodNow> }> = ({ frame, k, mood }) => {
  const on = current(frame, [[k.hold, "enter"], [k.yourBoard, "board"], [k.lookCup, "looks"], [k.cost, "cost"], [k.toast, "toast"]]);
  const ch = crateHeads();
  // Him: at the cup, at your card, at you; "That cost you." with a crooked grin; then the cup raised to your card.
  const look = frame < k.lookCup ? { x: 0.7, y: 0.5 } : frame < k.lookCard ? { x: 0.6, y: 0.9 } : frame < k.lookYou ? { x: 0.6, y: -0.9 } : { x: 1, y: 0 };
  const friendFace = on === "cost"
    ? { brows: "flat", lids: 0.4, mouth: talk(frame, k.cost + 2, k.costEnd, "smirk", 6), eyes: 1, look: { x: 1, y: 0 } } as const
    : on === "toast" ? { brows: "raised", lids: 0.3, mouth: "smile", eyes: 1, look: { x: 0.6, y: -0.8 } } as const
    : { brows: frame >= k.lookCard ? "raised" : "none", lids: 0.25, mouth: "flat", eyes: 1, look } as const;
  // You: a little proud of yourself; at the crimson buzz an eye up at your card, then a shrug and a grin at the toast.
  const youFace = on === "toast" ? { brows: "raised", lids: 0.4, mouth: "smile", eyes: 1, look: { x: 0.9, y: 0 } } as const
    : frame >= k.youCrimson && frame < k.youCrimson + 24 ? { brows: "raised", lids: 0, mouth: "flat", eyes: 1, look: { x: 0.1, y: -0.95 } } as const
    : { brows: "none", lids: 0.25, mouth: "smirk", eyes: 1, look: { x: 0.95, y: 0.1 } } as const;
  const toast = on === "toast" ? ramp(frame, k.toast, k.toast + 14) : 0;
  const cams: Record<typeof on, Camera> = {
    enter: camAt(frame, [[k.hold, { x: 900, y: 520, zoom: 1.05 }], [k.yourBoard, { x: 930, y: 520, zoom: 1.1 }]]),
    board: camAt(frame, [[k.yourBoard, { x: CRATE.board.x, y: CRATE.board.y + 50, zoom: 3.0 }], [k.lookCup, { x: CRATE.board.x, y: CRATE.board.y + 50, zoom: 3.2 }]]),
    looks: camAt(frame, [[k.lookCup, { x: 970, y: 520, zoom: 1.25 }], [k.cost, { x: 980, y: 515, zoom: 1.32 }]]),
    cost: camAt(frame, [[k.cost, { x: ch.friend.x - 60, y: ch.friend.y - 110, zoom: 1.9 }], [k.toast, { x: ch.friend.x - 60, y: ch.friend.y - 110, zoom: 2.0 }]]),
    toast: camAt(frame, [[k.toast, { x: (ch.you.x + ch.friend.x) / 2, y: 510, zoom: 1.3 }], [k.rent, { x: (ch.you.x + ch.friend.x) / 2, y: 505, zoom: 1.36 }]]),
  };
  return (
    <CrateScene frame={frame} cam={drift(cams[on], frame, `crate-${on}`, 2.5)} mood={mood} t={{ enter: k.enter, set: k.set, sit: k.sit }}
      youFace={youFace} friendFace={friendFace} toast={toast} hisTag={hisKeys(k)} yourTag={yourKeys(k)} yourRate={yourRate(k)} />
  );
};

// ------------------------------------------------------------------------------------------------ the beat

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const mood = moodNow(shot);
  const part = current(frame, [[0, "closing"], [k.coffee, "morning"], [k.platform, "platform"], [k.t.rows, "papers"], [k.t.thief, "trouble"],
    [k.hold, "crate"], [k.rent, "rent"]]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {part === "closing" && <Closing frame={frame} k={k} mood={mood} />}
      {part === "morning" && <Morning frame={frame} k={k} mood={mood} />}
      {part === "platform" && <Platform frame={frame} k={k} />}
      {part === "papers" && <Papers frame={frame} k={k.t} mood={mood} />}
      {part === "trouble" && <Trouble frame={frame} k={k.t} mood={mood} hisTag={hisKeys(k)} yourTag={yourKeys(k)} />}
      {part === "crate" && <Crate frame={frame} k={k} mood={mood} />}
      {part === "rent" && <Rent frame={frame} k={k.t} mood={mood} hisTag={hisKeys(k)} />}
      <TagSounds keys={hisKeys(k)} />
      <TagSounds keys={reachKeys(k).slice(1)} />
      <TagSounds keys={yourKeys(k)} />
      <BoardSounds keys={hisRate(k)} />
      <BoardSounds keys={yourRate(k)} />
      {/* the lock's click (tick.wav), the shutter's rattle and clank, the cup set on the tray */}
      <Sequence from={k.open} durationInFrames={40}><Audio src={staticFile("sfx/rattle.wav")} volume={0.5} /></Sequence>
      <Sequence from={k.shutter} durationInFrames={30}><Audio src={staticFile("sfx/clank.wav")} volume={0.6} /></Sequence>
      <Sequence from={k.set} durationInFrames={30}><Audio src={staticFile("sfx/clack.wav")} volume={0.7} /></Sequence>
      <Sequence from={k.lock + 14} durationInFrames={10}><Audio src={staticFile("sfx/tick.wav")} volume={0.6} /></Sequence>
      {/* your fingers closing round the key: its clink */}
      <Sequence from={k.grip + 14} durationInFrames={14}><Audio src={staticFile("sfx/coin.wav")} volume={0.3} /></Sequence>
      {/* the envelope swap's paper */}
      <Sequence from={k.landlord + 12} durationInFrames={20}><Audio src={staticFile("sfx/flap.wav")} volume={0.35} /></Sequence>
    </AbsoluteFill>
  );
};

export const red: Beat = { id: "red", firstLine: 66, Component: Scene };
