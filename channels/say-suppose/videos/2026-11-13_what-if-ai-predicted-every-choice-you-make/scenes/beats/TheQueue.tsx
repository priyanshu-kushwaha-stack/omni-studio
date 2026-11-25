// Beat "The Queue" (script.md v2, ## [09:16] The Queue; narration lines 101-113). Morning, the next day.
//
//   101   "A blank forecast, filmed at a food court." (the Newsreader): the court's television in the corner over the
//         queue, then full frame: the Newsreader over a shaky phone clip of your counter last night, two crimson cards
//   102   "By breakfast, your one surprise is the city's newest half-price trick.": the queue down the court, every
//         person in it holding a key out across your counter, palm up
//   +     the 4 s hold: the first man holds his key out, grinning; his card flaps and ticks teal, HANDS OVER KEY 97%;
//         the coffee board clatters to 1.50 for him; she slides him a half-price coffee across the steel unasked; your
//         best friend watches the queue with his arms folded
//   103   "That was ours." (his voice, arms folded, mock outrage: the laugh)
//   104   "By lunch the city has a card for it...": the queue long, every card ticking in a ripple down it; then the
//         television: the Newsreader over the city's board
//   105   "Confidence is back to ninety-nine." (the Newsreader): CITY SCORE flaps up to 99.5, a flicker of relief
//   106   "Full rent." (the landlord): he hands your best friend the envelope; he opens it under his crimson card and
//         doesn't look up at it
//   107   your card, crimson, UNPREDICTABLE; the coffee stall, her board back on 3.00; she looks at your card, then you
//   108   "Full price. Same?" (her voice): she slides the cup across anyway
//   109   the train (TheTrain parts): two crimson cards in the middle of a bench of phones; the passengers either side
//         lean over to read them, their cards flap to NOSY 99%, and they snap back to their phones, caught; the fare
//         board ticks down for them
//   +     the 5 s hold: his hand slides out, palm up, grin; you drop the key in without looking (the clink); his
//         fingers close; he grins at the side of your face
//   110   "Trust me?" (his voice), the key in his fist
//   111   "You never look up.": you, the crimson card at the top of the frame
//   112   "And the city hasn't noticed yet.": across the aisle, the kid with the cap, feet swinging, no phone, a BLANK
//         card, teal lamps blinking past; he catches you looking, and winks
//   113   the close, over the last image: his blank card, the teal lamps, your crimson card at the top edge; then the 4 s
//         end card: like, subscribe and comment tags in the left two-thirds, the right third quiet
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "../master";
import { SEATED, STAND } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import { setLook } from "@whatif/kit/sets/common";
import { closeUp, drift, insert } from "@whatif/kit/stage/shots";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { BoardSounds, TagSounds, type BoardKey, type TagKey } from "../device";
import { headAt, lineAt } from "../kit";
import { camAt, current, lineEnd, type Beat, type Shot } from "../shared";
import { COURT } from "../sets/FoodCourt";
import { talking } from "./TheKey.Court";
import { Bezel, coffeeKeys, CupShot, firstKeys, NewsDesk, QueueShot, QUEUE, RentShot, rippleKeys, TV, type QT } from "./TheQueue.Court";
import { Coach, DropShot, fareKeys, HIM_X, KidShot, YOU_X, type TT } from "./TheQueue.Train";
import { EndTags, SEAT_S, SEAT_Y } from "./TheTrain.Parts";

// ------------------------------------------------------------------------------------------------ timing

type T = ReturnType<typeof times>;

function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  const end = (i: number) => lineEnd(clips, i);
  const hold = end(102);
  const span = Math.max(100, from(103) - hold);
  const H = (p: number) => hold + Math.round(span * p);
  const hold109 = end(109);
  // the kid plays from "You never look up." across "And the city hasn't noticed yet."; the last image is under the close
  const kid = Math.max(end(111), from(111) + 20);
  const last = Math.max(kid + 75, from(113));
  const winkShot = kid + Math.round((last - kid) * 0.45);
  return {
    at,
    start: from(101), // the Newsreader: the court's television over the queue
    screen: at(101, 0.3), // full frame: the Newsreader, the shaky phone clip
    l101end: end(101),
    l102: from(102), // "By breakfast ...": the queue holding out keys
    qhold: hold, // the 4 s hold: the first man
    flapNew: H(0.08),
    flapTick: H(0.3),
    slide: H(0.45), // she slides him a half-price coffee
    folded: H(0.68), // your best friend, arms folded
    l103: from(103), // "That was ours."
    l103end: end(103),
    l104: from(104), // "By lunch the city has a card for it."
    ripple: at(104, 0.15),
    tv2: at(104, 0.82), // the television: the city's board
    l105: from(105), // "Confidence is back to ninety-nine."
    l105end: end(105),
    score: at(105, 0.75), // "...ninety-nine": the board flaps up
    l106: from(106), // "Full rent."
    open: from(106) + 12,
    l106end: end(106),
    l107: from(107), // "Your tag, crimson for thirty days."
    coffee: at(107, 0.45),
    glance: at(107, 0.75), // she looks at your card, then at you
    l108: from(108), // "Full price. Same?"
    l108end: end(108),
    train: from(109), // "The train.": the two crimson cards
    coach: at(109, 0.28),
    lean: at(109, 0.45), // "...every head sneaking a look": they lean over
    nosy: at(109, 0.55), // their cards flap to NOSY 99%
    snap: Math.max(at(109, 0.55) + 30, hold109 - 4), // and they snap back to their phones, caught
    hold: hold109, // the 5 s hold: his hand slides out
    drop: hold109 + 36, // the hands insert
    fall: hold109 + 46,
    close: hold109 + 60, // his fingers close
    grin: hold109 + 92, // he grins at the side of your face
    trust: from(110), // "Trust me?"
    trustEnd: end(110),
    never: from(111), // "You never look up."
    kid, // across the aisle
    winkShot,
    wink: winkShot + 18,
    last, // the last image: his blank card, the teal lamps, your crimson card at the top
    last2: Math.round((last + end(113)) / 2), // closer on the blank card
    card: end(113), // the end card
    end: to,
  };
}

const qt = (k: T): QT => ({ start: k.start, screen: k.screen, l101end: k.l101end, l102: k.l102, hold: k.qhold, flapNew: k.flapNew, flapTick: k.flapTick,
  slide: k.slide, folded: k.folded, l103: k.l103, l103end: k.l103end, l104: k.l104, ripple: k.ripple, tv2: k.tv2, l105: k.l105, l105end: k.l105end,
  score: k.score, l106: k.l106, open: k.open, l106end: k.l106end, l107: k.l107, glance: k.glance, l108: k.l108, l108end: k.l108end });

const tt = (k: T): TT => ({ start: k.start, train: k.train, coach: k.coach, lean: k.lean, nosy: k.nosy, snap: k.snap, hold: k.hold, drop: k.drop, fall: k.fall,
  close: k.close, grin: k.grin, trust: k.trust, trustEnd: k.trustEnd, kid: k.kid, winkShot: k.winkShot, wink: k.wink, last: k.last });

/** The city's board on the Newsreader's screen: 99.4 since the key, back up to 99.5 on "ninety-nine". */
const scoreKeys = (k: T): BoardKey[] => [{ at: k.start - 400, value: "99.4" }, { at: k.score, value: "99.5" }];

// ------------------------------------------------------------------------------------------------ the television, full frame

const NewsShot: React.FC<{ frame: number; k: T; cam: Camera; inset: "clip" | "board" }> = ({ frame, k, cam, inset }) => {
  const speaking = inset === "clip" ? talking(frame, k.start, k.l101end) : talking(frame, k.l105, k.l105end);
  const relief = inset === "board" && frame >= k.score;
  return (
    <LookContext.Provider value={setLook([], "morning", cam, { dof: 0 })}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={<NewsDesk frame={frame} inset={inset} speaking={speaking} relief={relief} score={scoreKeys(k)} from={k.start - 400} role={inset === "clip"} />} actors={null} front={<Bezel />} />
    </LookContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------ the beat

type ShotName = "corner" | "screen" | "queue" | "first" | "slide" | "folded" | "ours" | "lunch" | "tv2" | "rent" | "landlord" | "yourCard" | "coffee"
  | "cup" | "cards" | "coach" | "nosy" | "hand" | "drop" | "grin" | "trust" | "never" | "kid" | "wink" | "last" | "last2" | "card";

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, clips } = shot;
  const k = times(clips, shot.to);
  const q = qt(k);
  const t = tt(k);
  const on = current<ShotName>(frame, [[0, "corner"], [k.screen, "screen"], [k.l102, "queue"], [k.qhold, "first"], [k.slide - 6, "slide"],
    [k.folded, "folded"], [k.l103, "ours"], [k.l104, "lunch"], [k.tv2, "tv2"], [k.l106, "rent"], [k.l106 + 30, "landlord"], [k.l107, "yourCard"],
    [k.coffee, "coffee"], [k.l108, "cup"], [k.train, "cards"], [k.coach, "coach"], [k.lean - 4, "nosy"], [k.hold, "hand"], [k.drop, "drop"],
    [k.grin, "grin"], [k.trust, "trust"], [k.never, "never"], [k.kid, "kid"], [k.winkShot, "wink"], [k.last, "last"], [k.last2, "last2"], [k.card, "card"]]);
  const S = COURT.scale;
  const fh = headAt(COURT.friend.x, COURT.floor, S, STAND, -1);
  const first = headAt(QUEUE[0], COURT.customer.y, S, STAND, -1);
  const lh = headAt(COURT.customer.x, COURT.customer.y, S, STAND, -1);
  const cyh = headAt(1290, COURT.customer.y, S, STAND, 1);
  const yh = headAt(YOU_X, SEAT_Y, SEAT_S, SEATED, -1);
  const hh = headAt(HIM_X, SEAT_Y, SEAT_S, SEATED, -1);
  const kh = headAt(960, SEAT_Y, SEAT_S, SEATED, -1);
  const cams: Record<ShotName, Camera> = {
    corner: camAt(frame, [[k.start, { x: 900, y: 470, zoom: 1.0 }], [k.screen, { x: TV.x + TV.w / 2, y: TV.y + TV.h / 2 + 40, zoom: 1.6 }]]),
    screen: camAt(frame, [[k.screen, { x: 960, y: 540, zoom: 1.0 }], [k.l102, { x: 1000, y: 520, zoom: 1.1 }]]),
    queue: camAt(frame, [[k.l102, { x: 1350, y: 560, zoom: 0.85 }], [k.qhold, { x: 1250, y: 560, zoom: 0.95 }]]),
    first: camAt(frame, [[k.qhold, { x: (first.x + COURT.you.x) / 2, y: 560, zoom: 1.45 }], [k.slide - 6, { x: (first.x + COURT.you.x) / 2 + 30, y: 555, zoom: 1.55 }]]),
    slide: camAt(frame, [[k.slide - 6, { x: 1450, y: 560, zoom: 1.5 }], [k.folded, { x: 1430, y: 560, zoom: 1.6 }]]),
    folded: camAt(frame, [[k.folded, { x: 900, y: 560, zoom: 1.2 }], [k.l103, { x: 920, y: 560, zoom: 1.28 }]]),
    ours: camAt(frame, [[k.l103, closeUp(fh.x - 20, fh.y + 20, 2.4)], [k.l104, closeUp(fh.x - 20, fh.y + 20, 2.6)]]),
    lunch: camAt(frame, [[k.l104, { x: 1500, y: 560, zoom: 0.8 }], [k.tv2, { x: 1700, y: 560, zoom: 0.9 }]]),
    tv2: camAt(frame, [[k.tv2, { x: 960, y: 540, zoom: 1.0 }], [k.l106, { x: 1350, y: 400, zoom: 1.25 }]]),
    rent: camAt(frame, [[k.l106, { x: 1120, y: 560, zoom: 1.45 }], [k.l106 + 30, { x: 1130, y: 560, zoom: 1.5 }]]),
    landlord: camAt(frame, [[k.l106 + 30, { x: lh.x - 60, y: lh.y - 60, zoom: 2.1 }], [k.l107, { x: lh.x - 60, y: lh.y - 60, zoom: 2.25 }]]),
    yourCard: camAt(frame, [[k.l107, insert(cyh.x, cyh.y - 150, 2.8)], [k.coffee, insert(cyh.x, cyh.y - 130, 2.5)]]),
    coffee: camAt(frame, [[k.coffee, { x: 1500, y: 560, zoom: 1.45 }], [k.l108, { x: 1505, y: 560, zoom: 1.55 }]]),
    cup: camAt(frame, [[k.l108, { x: 1480, y: 560, zoom: 1.7 }], [k.train, { x: 1470, y: 565, zoom: 1.8 }]]),
    cards: camAt(frame, [[k.train, { x: (YOU_X + HIM_X) / 2, y: 330, zoom: 2.4 }], [k.coach, { x: (YOU_X + HIM_X) / 2, y: 400, zoom: 2.0 }]]),
    coach: camAt(frame, [[k.coach, { x: 880, y: 560, zoom: 1.0 }], [k.lean - 4, { x: 880, y: 570, zoom: 1.05 }]]),
    nosy: camAt(frame, [[k.lean - 4, { x: 880, y: 470, zoom: 1.5 }], [k.hold, { x: 880, y: 480, zoom: 1.6 }]]),
    hand: camAt(frame, [[k.hold, { x: 880, y: 640, zoom: 2.3 }], [k.drop, { x: 880, y: 650, zoom: 2.45 }]]),
    drop: { x: 960, y: 540, zoom: 1 },
    grin: camAt(frame, [[k.grin, { x: 880, y: 560, zoom: 2.2 }], [k.trust, { x: 880, y: 555, zoom: 2.35 }]]),
    trust: camAt(frame, [[k.trust, closeUp(hh.x - 20, hh.y - 30, 2.7)], [k.never, closeUp(hh.x - 20, hh.y - 30, 2.85)]]),
    never: camAt(frame, [[k.never, closeUp(yh.x - 30, yh.y - 110, 2.3)], [k.kid, closeUp(yh.x - 30, yh.y - 120, 2.4)]]),
    kid: camAt(frame, [[k.kid, { x: 960, y: 600, zoom: 1.2 }], [k.winkShot, { x: 960, y: 590, zoom: 1.32 }]]),
    wink: camAt(frame, [[k.winkShot, closeUp(kh.x, kh.y - 60, 2.3)], [k.last, closeUp(kh.x, kh.y - 70, 2.5)]]),
    last: camAt(frame, [[k.last, { x: kh.x + 160, y: kh.y - 230, zoom: 1.5 }], [k.last2, { x: kh.x + 170, y: kh.y - 250, zoom: 1.62 }]]),
    last2: camAt(frame, [[k.last2, { x: kh.x + 120, y: kh.y - 290, zoom: 1.9 }], [k.card, { x: kh.x + 140, y: kh.y - 300, zoom: 2.0 }]]),
    card: camAt(frame, [[k.card, { x: kh.x + 140, y: kh.y - 300, zoom: 1.9 }], [k.end, { x: kh.x + 140, y: kh.y - 300, zoom: 1.95 }]]),
  };
  const cam = drift(cams[on], frame, `queue-${on}`, 3);
  let picture: React.ReactNode;
  if (on === "screen") picture = <NewsShot frame={frame} k={k} cam={cam} inset="clip" />;
  else if (on === "tv2") picture = <NewsShot frame={frame} k={k} cam={cam} inset="board" />;
  else if (on === "rent" || on === "landlord") picture = <RentShot frame={frame} k={q} cam={cam} />;
  else if (on === "yourCard" || on === "coffee" || on === "cup") picture = <CupShot frame={frame} k={q} cam={cam} />;
  else if (on === "drop") picture = <DropShot frame={frame} k={t} />;
  else if (on === "kid" || on === "wink" || on === "last" || on === "last2") picture = <KidShot frame={frame} k={t} cam={cam} last={on === "last" || on === "last2"} />;
  else if (on === "card") {
    picture = (
      <AbsoluteFill>
        <KidShot frame={frame} k={t} cam={cam} last />
        <AbsoluteFill style={{ background: "rgba(8,10,20,0.55)" }} />
        <EndTags frame={frame} like={k.card + 6} subscribe={k.card + 18} comment={k.card + 30} />
      </AbsoluteFill>
    );
  } else if (on === "cards" || on === "coach" || on === "nosy" || on === "hand" || on === "grin" || on === "trust" || on === "never") {
    picture = <Coach frame={frame} k={t} cam={cam} />;
  } else picture = <QueueShot frame={frame} k={q} cam={cam} tv={on === "corner" || on === "queue" || on === "lunch"} />;
  const firstSounds: TagKey[] = firstKeys(q).slice(1);
  const ripple: TagKey[] = QUEUE.slice(1, 6).map((_, i) => rippleKeys(q, i + 1)[1]);
  const nosySounds: TagKey[] = [{ at: k.nosy, text: "NOSY", pct: 99, state: "tick" }, { at: k.snap, text: "LOOKS AT PHONE", pct: 99, state: "tick" }];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      <TagSounds keys={firstSounds} volume={0.7} />
      <TagSounds keys={ripple} volume={0.35} />
      <BoardSounds keys={coffeeKeys(q).filter((b, i) => i === 0 || b.at >= k.start)} volume={0.5} />
      <BoardSounds keys={scoreKeys(k)} volume={0.6} />
      <TagSounds keys={nosySounds} volume={0.6} />
      <Sequence from={k.slide} durationInFrames={30}><Audio src={staticFile("sfx/scrape.wav")} volume={0.5} /></Sequence>
      <Sequence from={k.l108end - 4} durationInFrames={30}><Audio src={staticFile("sfx/scrape.wav")} volume={0.5} /></Sequence>
      <BoardSounds keys={fareKeys(t).filter((b, i) => i === 0 || b.at >= k.train)} volume={0.4} />
      {/* the key's small clink in his palm */}
      <Sequence from={k.fall + 10} durationInFrames={20}><Audio src={staticFile("sfx/coin.wav")} volume={0.45} /></Sequence>
      {[k.card + 6, k.card + 18, k.card + 30].map((at) => (
        <Sequence key={at} from={at} durationInFrames={24}><Audio src={staticFile("sfx/flap.wav")} volume={0.6} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const theQueue: Beat = { id: "theQueue", firstLine: 101, Component: Scene };

/** Sounds named in the script with no file in assets/sfx yet, at their moments (the coordinating session adds them). */
export const QUEUE_MISSING_SFX = (clips: Clip[], to: number) => {
  const k = times(clips, to);
  return { cupScrapeFirstMan: k.slide, cupScrapeYou: k.l108end - 4 };
};
